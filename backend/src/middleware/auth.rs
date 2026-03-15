//! JWT authentication extractor for protected Axum handlers.
//!
//! Usage in a handler:
//! ```rust,ignore
//! async fn protected(user: AuthUser) -> impl IntoResponse {
//!     format!("Hello {}", user.address)
//! }
//! ```

use async_trait::async_trait;
use axum::{
    extract::FromRequestParts,
    http::{header::AUTHORIZATION, request::Parts},
};

use crate::{auth::service, error::AppError, AppState};

/// Authenticated user extracted from a valid `Authorization: Bearer <jwt>` header.
#[derive(Debug, Clone)]
pub struct AuthUser {
    /// Ethereum address (lowercase, 0x-prefixed) from JWT `sub` claim.
    pub address: String,
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
        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or_else(|| {
                AppError::Unauthorized(
                    "Authorization header must use Bearer scheme".to_string(),
                )
            })?;

        // Validate JWT
        let claims = service::validate_jwt(token, &state.config.jwt_secret)?;

        Ok(AuthUser {
            address: claims.sub,
        })
    }
}
