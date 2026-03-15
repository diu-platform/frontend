//! Registry bounded context — domain models.
//!
//! Reflects the `orcid_verification_queue` table (migration 003).
#![allow(dead_code)] // fields populated via sqlx FromRow; not all read in every code path yet

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// ORCID verification status, mirroring the `orcid_status` PostgreSQL enum.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "orcid_status", rename_all = "lowercase")]
pub enum VerificationStatus {
    Pending,
    Verified,
    Rejected,
    Failed,
}

/// One row in `orcid_verification_queue`.
///
/// Tracks a single ORCID verification attempt for a given Ethereum address.
#[derive(Debug, Clone, sqlx::FromRow)]
pub struct OrcidVerificationJob {
    pub id: Uuid,
    /// Ethereum address (checksummed) that called `link_orcid()`.
    pub address: String,
    /// ORCID identifier in `0000-0000-0000-0000` format.
    pub orcid_id: String,
    pub status: VerificationStatus,
    /// Number of verification attempts made so far.
    pub attempts: i16,
    /// When the worker should next attempt this job (NULL = process immediately).
    pub next_retry_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    /// Error detail from the last failed attempt (diagnostics only).
    pub last_error: Option<String>,
}
