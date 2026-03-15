//! ORCID verification worker (ADR D-030).
//!
//! Polls `orcid_verification_queue` for pending jobs and drives them through:
//!   pending → pub.orcid.org/v3.0 → DIURegistry.verifyResearcher() → verified | rejected
//!
//! Exponential backoff: 1m → 5m → 15m → 1h → 4h (5 attempts max, then rejected).

use super::{
    models::OrcidVerificationJob,
    service::{call_verify_researcher, verify_orcid_via_api},
};
use crate::config::Config;
use chrono::{Duration, Utc};
use sqlx::PgPool;
use std::sync::Arc;
use uuid::Uuid;

/// Max verification attempts before a job is permanently rejected.
const MAX_RETRIES: i16 = 5;

/// Backoff delay (minutes) indexed by attempt number (0-based).
/// Attempt 1 → 1m, 2 → 5m, 3 → 15m, 4 → 1h, 5 → 4h.
const BACKOFF_MINUTES: [i64; 5] = [1, 5, 15, 60, 240];

/// Poll interval between worker sweeps.
const POLL_INTERVAL_SECS: u64 = 60;

/// ORCID verification background worker.
///
/// Spawned once in `main` via `tokio::spawn(OrcidVerifier::new(...).run())`.
pub struct OrcidVerifier {
    db: PgPool,
    config: Arc<Config>,
}

impl OrcidVerifier {
    /// Create a new verifier with shared DB pool and config.
    pub fn new(db: PgPool, config: Arc<Config>) -> Self {
        Self { db, config }
    }

    /// Run the worker loop indefinitely.
    ///
    /// Polls every 60 seconds; processes up to 10 pending jobs per sweep.
    pub async fn run(self) {
        tracing::info!("OrcidVerifier worker started");
        loop {
            match self.process_pending().await {
                Ok(0) => {}
                Ok(n) => tracing::info!("OrcidVerifier processed {n} job(s)"),
                Err(e) => tracing::error!("OrcidVerifier poll error: {e}"),
            }
            tokio::time::sleep(tokio::time::Duration::from_secs(POLL_INTERVAL_SECS)).await;
        }
    }

    /// Fetch and process all pending jobs that are ready for their next attempt.
    async fn process_pending(&self) -> anyhow::Result<usize> {
        let jobs = sqlx::query_as::<_, OrcidVerificationJob>(
            "SELECT id, address, orcid_id, status, attempts, next_retry_at,
                    created_at, updated_at, last_error
             FROM orcid_verification_queue
             WHERE status = 'pending'
               AND (next_retry_at IS NULL OR next_retry_at <= NOW())
             ORDER BY created_at ASC
             LIMIT 10",
        )
        .fetch_all(&self.db)
        .await?;

        let count = jobs.len();
        for job in jobs {
            self.process_job(job).await;
        }
        Ok(count)
    }

    /// Drive a single job through verification.
    async fn process_job(&self, job: OrcidVerificationJob) {
        tracing::debug!(
            job_id = %job.id,
            address = %job.address,
            orcid = %job.orcid_id,
            attempt = job.attempts + 1,
            "Processing ORCID verification job"
        );

        match verify_orcid_via_api(&job.orcid_id).await {
            Ok(true) => {
                // ORCID exists — call on-chain verify_researcher
                let result = call_verify_researcher(
                    &job.address,
                    &self.config.registry_contract_address,
                    &self.config.chain_rpc_url,
                    &self.config.deployer_private_key,
                )
                .await;

                match result {
                    Ok(()) => {
                        if let Err(e) = self.mark_verified(&job.id).await {
                            tracing::error!(job_id = %job.id, "Failed to mark verified in DB: {e}");
                        }
                    }
                    Err(e) => {
                        tracing::warn!(
                            job_id = %job.id,
                            address = %job.address,
                            "on-chain verifyResearcher failed: {e}"
                        );
                        self.record_failure(&job, &format!("on-chain call failed: {e}"))
                            .await;
                    }
                }
            }
            Ok(false) => {
                // ORCID not found — permanent rejection, no retry
                tracing::info!(
                    job_id = %job.id,
                    orcid = %job.orcid_id,
                    "ORCID not found in public registry — rejecting"
                );
                if let Err(e) = self
                    .mark_rejected(&job.id, "ORCID ID not found in public ORCID registry")
                    .await
                {
                    tracing::error!(job_id = %job.id, "Failed to mark rejected in DB: {e}");
                }
            }
            Err(e) => {
                // Transient API error — schedule retry with exponential backoff
                tracing::warn!(
                    job_id = %job.id,
                    "ORCID API transient error: {e}"
                );
                self.record_failure(&job, &e.to_string()).await;
            }
        }
    }

    async fn mark_verified(&self, id: &Uuid) -> anyhow::Result<()> {
        sqlx::query(
            "UPDATE orcid_verification_queue
             SET status = 'verified', updated_at = NOW()
             WHERE id = $1",
        )
        .bind(id)
        .execute(&self.db)
        .await?;
        Ok(())
    }

    async fn mark_rejected(&self, id: &Uuid, reason: &str) -> anyhow::Result<()> {
        sqlx::query(
            "UPDATE orcid_verification_queue
             SET status = 'rejected', last_error = $2, updated_at = NOW()
             WHERE id = $1",
        )
        .bind(id)
        .bind(reason)
        .execute(&self.db)
        .await?;
        Ok(())
    }

    /// Increment attempt counter; reject permanently if MAX_RETRIES reached,
    /// otherwise compute next_retry_at from the exponential backoff table.
    async fn record_failure(&self, job: &OrcidVerificationJob, error: &str) {
        let new_attempts = job.attempts + 1;

        if new_attempts >= MAX_RETRIES {
            tracing::warn!(
                job_id = %job.id,
                address = %job.address,
                "ORCID job reached max retries — permanently rejecting"
            );
            let _ = sqlx::query(
                "UPDATE orcid_verification_queue
                 SET status = 'rejected', attempts = $2, last_error = $3, updated_at = NOW()
                 WHERE id = $1",
            )
            .bind(job.id)
            .bind(new_attempts)
            .bind(format!("Max retries ({MAX_RETRIES}) exceeded. Last error: {error}"))
            .execute(&self.db)
            .await;
        } else {
            let backoff_idx = ((new_attempts as usize).saturating_sub(1))
                .min(BACKOFF_MINUTES.len() - 1);
            let next_retry = Utc::now() + Duration::minutes(BACKOFF_MINUTES[backoff_idx]);

            let _ = sqlx::query(
                "UPDATE orcid_verification_queue
                 SET attempts = $2, next_retry_at = $3, last_error = $4, updated_at = NOW()
                 WHERE id = $1",
            )
            .bind(job.id)
            .bind(new_attempts)
            .bind(next_retry)
            .bind(error)
            .execute(&self.db)
            .await;
        }
    }
}
