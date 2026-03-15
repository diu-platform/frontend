//! Auth business logic: nonce generation, SIWE verification, JWT issue/validate.

use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::{auth::models::Claims, error::AppError};

/// TTL for issued JWTs: 24 hours.
pub const JWT_TTL_SECS: u64 = 24 * 60 * 60;

/// TTL for SIWE nonces: 5 minutes.
pub const NONCE_TTL_SECS: u64 = 5 * 60;

// ─── Nonce ───────────────────────────────────────────────────────────────────

/// Generate a cryptographically random nonce (UUID v4 without dashes).
///
/// UUID v4 gives 122 bits of randomness — well above the EIP-4361 minimum
/// of 8 alphanumeric characters.
pub fn generate_nonce() -> String {
    uuid::Uuid::new_v4().to_string().replace('-', "")
}

// ─── SIWE verification ───────────────────────────────────────────────────────

/// Parse a SIWE message, verify the wallet signature, return the signer address.
///
/// `signature_hex`: hex-encoded 65-byte signature, with or without `0x` prefix.
pub async fn verify_siwe(
    message_str: &str,
    signature_hex: &str,
) -> Result<String, AppError> {
    // Parse EIP-4361 message
    let message: siwe::Message = message_str
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid SIWE message format".to_string()))?;

    // Decode hex signature → [u8; 65]
    let hex_str = signature_hex.strip_prefix("0x").unwrap_or(signature_hex);
    let sig_bytes =
        alloy_primitives::hex::decode(hex_str)
            .map_err(|_| AppError::BadRequest("Invalid signature encoding".to_string()))?;

    if sig_bytes.len() != 65 {
        return Err(AppError::BadRequest(
            "Signature must be 65 bytes (130 hex chars)".to_string(),
        ));
    }

    let mut sig = [0u8; 65];
    sig.copy_from_slice(&sig_bytes);

    // Verify — siwe 0.6: verify(&[u8], &VerificationOpts)
    message
        .verify(&sig, &siwe::VerificationOpts::default())
        .await
        .map_err(|e| AppError::Unauthorized(format!("SIWE verification failed: {e}")))?;

    // Extract signer address as 0x-prefixed lowercase hex
    let address = format!("0x{}", alloy_primitives::hex::encode(message.address));
    Ok(address)
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

/// Issue a signed JWT for the given Ethereum address.
pub fn issue_jwt(address: &str, secret: &str) -> Result<(String, u64), AppError> {
    let now = unix_now();
    let exp = now + JWT_TTL_SECS;

    let claims = Claims {
        sub: address.to_lowercase(),
        iat: now,
        exp,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )?;

    Ok((token, exp))
}

/// Validate a JWT and return its claims.
pub fn validate_jwt(token: &str, secret: &str) -> Result<Claims, AppError> {
    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )?;

    Ok(data.claims)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

fn unix_now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system clock before Unix epoch")
        .as_secs()
}
