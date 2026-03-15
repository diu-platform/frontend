//! Centralised error type for the backend.
//!
//! All handler errors convert to an HTTP response with a JSON body:
//! `{ "error": "<message>" }`.

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
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

    #[error("Database error")]
    Database(#[from] sqlx::Error),

    #[error("JWT error")]
    Jwt(#[from] jsonwebtoken::errors::Error),
}

#[derive(Serialize)]
struct ErrorBody {
    error: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.clone()),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg.clone()),
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
