//! Auth HTTP routes: POST /auth/challenge, POST /auth/verify.
//!
//! Rate limiting: 10 req/min per IP (tower_governor applied to this router).

use axum::{
    extract::State,
    routing::post,
    Json, Router,
};
use std::{
    sync::Arc,
    time::{Duration, Instant},
};
use tower_governor::{
    governor::GovernorConfigBuilder, GovernorLayer,
};

use crate::{
    auth::{
        models::{ChallengeRequest, ChallengeResponse, VerifyRequest, VerifyResponse},
        service,
    },
    error::AppError,
    AppState,
};

/// Build the auth sub-router (`/auth` prefix applied in main.rs).
pub fn router() -> Router<AppState> {
    // 10 requests per minute per IP, burst of 5
    let governor_conf = Arc::new(
        GovernorConfigBuilder::default()
            .per_second(6)   // 10 req/min ≈ 1 req/6 s
            .burst_size(5)
            .finish()
            .expect("valid governor config"),
    );

    Router::new()
        .route("/challenge", post(challenge))
        .route("/verify", post(verify))
        .layer(GovernorLayer {
            config: governor_conf,
        })
}

// ─── Handlers ────────────────────────────────────────────────────────────────

/// Generate a SIWE nonce for the given address.
///
/// The client uses this nonce to construct and sign a SIWE message, then
/// calls POST /auth/verify.
async fn challenge(
    State(state): State<AppState>,
    Json(req): Json<ChallengeRequest>,
) -> Result<Json<ChallengeResponse>, AppError> {
    let address = req.address.to_lowercase();

    if address.is_empty() {
        return Err(AppError::BadRequest("address is required".to_string()));
    }

    let nonce = service::generate_nonce();

    // Store nonce with expiry
    {
        let mut store = state
            .nonces
            .lock()
            .map_err(|_| AppError::Internal("nonce store lock poisoned".to_string()))?;

        // Clean up expired nonces on every write (simple O(n) sweep)
        let ttl = Duration::from_secs(service::NONCE_TTL_SECS);
        store.retain(|_, (_, issued_at)| issued_at.elapsed() < ttl);

        store.insert(address, (nonce.clone(), Instant::now()));
    }

    Ok(Json(ChallengeResponse { nonce }))
}

/// Verify a signed SIWE message and issue a JWT.
///
/// The client must have previously called /auth/challenge to obtain a nonce,
/// constructed the EIP-4361 message, signed it with their wallet, then submit
/// both the raw message text and the hex signature here.
async fn verify(
    State(state): State<AppState>,
    Json(req): Json<VerifyRequest>,
) -> Result<Json<VerifyResponse>, AppError> {
    if req.message.is_empty() {
        return Err(AppError::BadRequest("message is required".to_string()));
    }
    if req.signature.is_empty() {
        return Err(AppError::BadRequest("signature is required".to_string()));
    }

    // Verify SIWE signature → extract signer address
    let address = service::verify_siwe(&req.message, &req.signature).await?;

    // Check that the nonce was issued for this address and hasn't expired
    {
        let mut store = state
            .nonces
            .lock()
            .map_err(|_| AppError::Internal("nonce store lock poisoned".to_string()))?;

        let ttl = Duration::from_secs(service::NONCE_TTL_SECS);

        match store.get(&address) {
            None => {
                return Err(AppError::Unauthorized(
                    "No pending challenge for this address. Call /auth/challenge first.".to_string(),
                ))
            }
            Some((_, issued_at)) if issued_at.elapsed() >= ttl => {
                store.remove(&address);
                return Err(AppError::Unauthorized(
                    "Challenge nonce expired. Call /auth/challenge again.".to_string(),
                ));
            }
            _ => {
                // Valid — consume the nonce (one-time use)
                store.remove(&address);
            }
        }
    }

    // Issue JWT
    let (token, expires_at) = service::issue_jwt(&address, &state.config.jwt_secret)?;

    Ok(Json(VerifyResponse {
        token,
        address,
        expires_at,
    }))
}
