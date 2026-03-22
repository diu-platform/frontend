//! JWT authentication extractor for protected Axum handlers.
//!
//! Usage in a handler:
//! ```rust,ignore
//! async fn protected(user: AuthUser) -> impl IntoResponse {
//!     format!("Hello {}", user.sub)
//! }
//! ```

use async_trait::async_trait;
use axum::{
    extract::FromRequestParts,
    http::{header::AUTHORIZATION, request::Parts},
};
use std::convert::Infallible;

use crate::{auth::service, error::AppError, AppState};

/// Authenticated user extracted from a valid `Authorization: Bearer <jwt>` header.
#[derive(Debug, Clone)]
pub struct AuthUser {
    /// Raw JWT `sub` claim.
    /// SIWE: Ethereum address (lowercase, 0x-prefixed).
    /// ORCID: synthetic identifier (`orcid:<orcid_id>`).
    #[allow(dead_code)]
    pub sub: String,
    /// Ethereum address — `Some` when `login_method == "siwe"`.
    pub address: Option<String>,
    /// ORCID iD — `Some` when `login_method == "orcid"`.
    pub orcid_id: Option<String>,
    /// Authentication method: "siwe" | "orcid" | "email".
    pub login_method: String,
}

#[async_trait]
impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        // Extract the Authorization header
        let auth_header = parts
            .headers
            .get(AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| AppError::Unauthorized("Missing Authorization header".to_string()))?;

        // Expect "Bearer <token>"
        let token = auth_header.strip_prefix("Bearer ").ok_or_else(|| {
            AppError::Unauthorized(
                "Authorization header must use Bearer scheme".to_string(),
            )
        })?;

        // Validate JWT
        let claims = service::validate_jwt(token, &state.config.jwt_secret)?;

        let (address, orcid_id) = match claims.login_method.as_str() {
            "siwe" => (Some(claims.sub.clone()), None),
            "orcid" => {
                let id = claims
                    .sub
                    .strip_prefix("orcid:")
                    .unwrap_or(&claims.sub)
                    .to_string();
                (None, Some(id))
            }
            _ => (None, None),
        };

        Ok(AuthUser {
            sub: claims.sub,
            address,
            orcid_id,
            login_method: claims.login_method,
        })
    }
}

// ─── OptionalAuthUser ─────────────────────────────────────────────────────────

/// Like `AuthUser` but never rejects — returns `None` when the request has no
/// JWT or the token is invalid/expired.  Used for endpoints that serve both
/// anonymous and authenticated users (e.g. POST /api/chat).
pub struct OptionalAuthUser(pub Option<AuthUser>);

#[async_trait]
impl FromRequestParts<AppState> for OptionalAuthUser {
    type Rejection = Infallible;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        Ok(OptionalAuthUser(
            AuthUser::from_request_parts(parts, state).await.ok(),
        ))
    }
}
