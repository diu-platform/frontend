//! Centralised error type for the backend.
//!
//! All handler errors convert to an HTTP response with a JSON body:
//! `{ "error": "<message>" }`.

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use chrono::{Duration, Utc};
use serde::Serialize;
use thiserror::Error;

/// Top-level application error.
#[derive(Error, Debug)]
pub enum AppError {
    #[error("{0}")]
    Unauthorized(String),

    #[error("{0}")]
    BadRequest(String),

    #[error("{0}")]
    #[allow(dead_code)]
    NotFound(String),

    #[error("{0}")]
    Internal(String),

    #[error("{0}")]
    ServiceUnavailable(String),

    #[error("{0}")]
    BadGateway(String),

    /// Daily chat limit exceeded. Carries the per-identity limit value.
    #[error("Лимит исчерпан")]
    RateLimit(u32),

    #[error("Database error")]
    Database(#[from] sqlx::Error),

    #[error("JWT error")]
    Jwt(#[from] jsonwebtoken::errors::Error),
}

#[derive(Serialize)]
struct ErrorBody {
    error: String,
}

/// Response body for 429 Too Many Requests.
#[derive(Serialize)]
struct RateLimitBody {
    error: String,
    limit: u32,
    /// UTC date when the counter resets (tomorrow, format: YYYY-MM-DD).
    reset: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        // RateLimit has a custom body shape — handle before the generic branch.
        if let AppError::RateLimit(limit) = self {
            let reset = (Utc::now() + Duration::days(1))
                .format("%Y-%m-%d")
                .to_string();
            return (
                StatusCode::TOO_MANY_REQUESTS,
                Json(RateLimitBody {
                    error: "Лимит исчерпан".to_string(),
                    limit,
                    reset,
                }),
            )
                .into_response();
        }

        let (status, message) = match &self {
            AppError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.clone()),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.clone()),
            AppError::ServiceUnavailable(msg) => (StatusCode::SERVICE_UNAVAILABLE, msg.clone()),
            AppError::BadGateway(msg) => (StatusCode::BAD_GATEWAY, msg.clone()),
            AppError::RateLimit(_) => unreachable!("handled above"),
            AppError::Database(e) => {
                tracing::error!("Database error: {e}");
                (StatusCode::INTERNAL_SERVER_ERROR, "Database error".to_string())
            }
            AppError::Jwt(e) => {
                tracing::warn!("JWT error: {e}");
                (StatusCode::UNAUTHORIZED, "Invalid or expired token".to_string())
            }
        };

        (status, Json(ErrorBody { error: message })).into_response()
    }
}
