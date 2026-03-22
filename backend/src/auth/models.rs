//! Auth domain models: SIWE challenge and JWT claims.

use serde::{Deserialize, Serialize};

// ─── JWT ─────────────────────────────────────────────────────────────────────

/// JWT payload stored in every authenticated session.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    /// User identifier: Ethereum address for SIWE, `orcid:<id>` for ORCID.
    pub sub: String,
    /// Issued-at timestamp (Unix seconds).
    pub iat: u64,
    /// Expiry timestamp (Unix seconds). Default TTL: 24 h.
    pub exp: u64,
    /// Authentication method: "siwe" | "orcid" | "email".
    pub login_method: String,
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

/// POST /auth/verify — response body (also used by ORCID callback).
#[derive(Debug, Serialize)]
pub struct VerifyResponse {
    /// Signed JWT. Pass as `Authorization: Bearer <token>` on subsequent requests.
    pub token: String,
    /// User identifier: Ethereum address (SIWE) or synthetic `orcid:<id>` (ORCID).
    pub address: String,
    /// Token expiry (Unix timestamp seconds).
    pub expires_at: u64,
    /// Authentication method used to issue this token.
    pub login_method: String,
}

/// GET /auth/me — response body.
#[derive(Debug, Serialize)]
pub struct MeResponse {
    /// Ethereum address — present when login_method is "siwe".
    pub address: Option<String>,
    /// ORCID iD — present when login_method is "orcid".
    pub orcid_id: Option<String>,
    /// Email — present when login_method is "email" (Phase 3).
    pub email: Option<String>,
    /// How this session was authenticated: "siwe" | "orcid" | "email".
    pub login_method: String,
}

/// POST /auth/email/request — response body (Phase 3 stub).
#[derive(Debug, Serialize)]
pub struct EmailRequestResponse {
    pub status: String,
}
