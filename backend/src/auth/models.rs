//! Auth domain models: SIWE challenge and JWT claims.

use serde::{Deserialize, Serialize};

// ─── JWT ─────────────────────────────────────────────────────────────────────

/// JWT payload stored in every authenticated session.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    /// Ethereum address (lowercase, 0x-prefixed).
    pub sub: String,
    /// Issued-at timestamp (Unix seconds).
    pub iat: u64,
    /// Expiry timestamp (Unix seconds). Default TTL: 24 h.
    pub exp: u64,
}

// ─── HTTP request / response types ──────────────────────────────────────────

/// POST /auth/challenge — request body.
#[derive(Debug, Deserialize)]
pub struct ChallengeRequest {
    /// Ethereum address requesting a nonce (0x-prefixed, any case).
    pub address: String,
}

/// POST /auth/challenge — response body.
#[derive(Debug, Serialize)]
pub struct ChallengeResponse {
    /// Random nonce to embed in the SIWE message. Valid for 5 minutes.
    pub nonce: String,
}

/// POST /auth/verify — request body.
#[derive(Debug, Deserialize)]
pub struct VerifyRequest {
    /// Full SIWE message string (EIP-4361 format) as signed by the wallet.
    pub message: String,
    /// Wallet signature of the SIWE message (0x-prefixed hex, 65 bytes).
    pub signature: String,
}

/// POST /auth/verify — response body.
#[derive(Debug, Serialize)]
pub struct VerifyResponse {
    /// Signed JWT. Pass as `Authorization: Bearer <token>` on subsequent requests.
    pub token: String,
    /// Ethereum address extracted from the verified SIWE message.
    pub address: String,
    /// Token expiry (Unix timestamp seconds).
    pub expires_at: u64,
}
