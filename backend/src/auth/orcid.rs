//! ORCID OAuth 2.0 handlers.
//!
//! Flow:
//!   1. GET /auth/orcid            → redirect to orcid.org/oauth/authorize
//!   2. ORCID redirects back to    GET /auth/orcid/callback?code=…
//!   3. Exchange code for token    POST orcid.org/oauth/token
//!   4. Extract ORCID iD, upsert user in DB, issue JWT
//!
//! Requires ORCID_CLIENT_ID + ORCID_CLIENT_SECRET in environment.
//! Register a client at https://info.orcid.org/register-a-client

use axum::{
    extract::{Query, State},
    response::Redirect,
    Json,
};
use serde::Deserialize;

use crate::{
    auth::{
        models::{MeResponse, VerifyResponse},
        service,
    },
    error::AppError,
    AppState,
};

// ─── GET /auth/orcid ─────────────────────────────────────────────────────────

/// Redirect the browser to the ORCID authorisation page.
///
/// Returns 503 if ORCID OAuth is not configured (ORCID_CLIENT_ID absent).
pub async fn orcid_login(State(state): State<AppState>) -> Result<Redirect, AppError> {
    let client_id = state
        .config
        .orcid_client_id
        .as_deref()
        .ok_or_else(|| AppError::ServiceUnavailable("ORCID OAuth not configured on this server (ORCID_CLIENT_ID missing)".to_string()))?;

    let redirect_uri = &state.config.orcid_redirect_uri;

    // scope=%2Fauthenticate is the minimal ORCID scope (read iD only)
    // TODO Phase 3: add CSRF state parameter and validate on callback
    let url = format!(
        "https://orcid.org/oauth/authorize?response_type=code&client_id={}&redirect_uri={}&scope=%2Fauthenticate",
        client_id, redirect_uri
    );

    Ok(Redirect::temporary(&url))
}

// ─── GET /auth/orcid/callback ─────────────────────────────────────────────────

/// Query parameters sent by ORCID after the user authorises.
#[derive(Deserialize)]
pub struct OrcidCallbackParams {
    /// One-time authorisation code from ORCID.
    pub code: String,
}

/// Subset of ORCID token endpoint response we care about.
#[derive(Deserialize)]
struct OrcidTokenResponse {
    /// Authenticated ORCID iD (e.g. "0000-0002-1825-0097").
    orcid: String,
}

/// Exchange the ORCID authorisation code for a JWT session.
///
/// 1. POST to orcid.org/oauth/token with the code.
/// 2. Extract the ORCID iD from the response.
/// 3. Upsert the user in the `users` table (synthetic address = `orcid:<id>`).
/// 4. Issue a JWT with login_method = "orcid".
pub async fn orcid_callback(
    State(state): State<AppState>,
    Query(params): Query<OrcidCallbackParams>,
) -> Result<Json<VerifyResponse>, AppError> {
    let client_id = state
        .config
        .orcid_client_id
        .as_deref()
        .ok_or_else(|| AppError::ServiceUnavailable("ORCID OAuth not configured on this server".to_string()))?;

    let client_secret = state
        .config
        .orcid_client_secret
        .as_deref()
        .ok_or_else(|| AppError::ServiceUnavailable("ORCID OAuth not configured on this server".to_string()))?;

    let redirect_uri = &state.config.orcid_redirect_uri;

    // Exchange code → ORCID iD
    let http = reqwest::Client::new();
    let token_res: OrcidTokenResponse = http
        .post("https://orcid.org/oauth/token")
        .header("Accept", "application/json")
        .form(&[
            ("grant_type", "authorization_code"),
            ("client_id", client_id),
            ("client_secret", client_secret),
            ("redirect_uri", redirect_uri.as_str()),
            ("code", params.code.as_str()),
        ])
        .send()
        .await
        .map_err(|e| AppError::BadGateway(format!("ORCID token exchange request failed: {e}")))?
        .json()
        .await
        .map_err(|e| AppError::BadGateway(format!("Invalid ORCID token response: {e}")))?;

    let orcid_id = token_res.orcid;

    // Synthetic address for ORCID-only users (no wallet required).
    // Format: `orcid:XXXX-XXXX-XXXX-XXXX` (25 chars, fits in users.address VARCHAR(42)).
    // Phase 3: account linking will merge this row with a SIWE address row.
    let synthetic_address = format!("orcid:{orcid_id}");

    // Upsert: create user on first ORCID login, update login_method on subsequent logins.
    sqlx::query!(
        r#"
        INSERT INTO users (address, orcid_id, login_method)
        VALUES ($1, $2, 'orcid')
        ON CONFLICT (address) DO UPDATE
            SET orcid_id     = EXCLUDED.orcid_id,
                login_method = EXCLUDED.login_method
        "#,
        synthetic_address,
        orcid_id,
    )
    .execute(&state.db)
    .await
    .map_err(|e| AppError::Internal(format!("DB upsert failed: {e}")))?;

    let (token, expires_at) =
        service::issue_jwt(&synthetic_address, &state.config.jwt_secret, "orcid")?;

    Ok(Json(VerifyResponse {
        token,
        address: synthetic_address,
        expires_at,
        login_method: "orcid".to_string(),
    }))
}

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

/// Return the currently authenticated user's identity from JWT claims.
///
/// Does not query the database — reads directly from the validated JWT.
pub async fn me(
    State(_state): State<AppState>,
    user: crate::middleware::auth::AuthUser,
) -> Json<MeResponse> {
    Json(MeResponse {
        address: user.address,
        orcid_id: user.orcid_id,
        email: None, // Phase 3
        login_method: user.login_method,
    })
}
