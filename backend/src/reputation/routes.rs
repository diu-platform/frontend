//! Reputation HTTP routes.
//!
//! Stub: GET /api/v1/reputation/:address
//! TODO B-2: replace with alloy provider reads from DIUReputation contract.

use axum::{extract::Path, routing::get, Json, Router};
use serde::Serialize;

use crate::AppState;

/// Build the reputation sub-router (`/api/v1/reputation` prefix applied in main.rs).
pub fn router() -> Router<AppState> {
    Router::new().route("/:address", get(get_reputation))
}

/// GET /api/v1/reputation/:address — on-chain reputation stub.
///
/// Returns zeroed data until B-2 wires up the alloy provider.
async fn get_reputation(Path(address): Path<String>) -> Json<UserReputation> {
    Json(UserReputation {
        address: address.to_lowercase(),
        xp: 0,
        level: 1,
        daily_streak: 0,
        // TODO B-2: query DIUReputation contract via alloy
    })
}

// ─── Types ───────────────────────────────────────────────────────────────────

#[derive(Serialize)]
pub struct UserReputation {
    /// Ethereum address (lowercase, 0x-prefixed).
    pub address: String,
    /// Total XP accumulated on-chain.
    pub xp: u64,
    /// Current level (1–5).
    pub level: u8,
    /// Consecutive days active.
    pub daily_streak: u32,
}
