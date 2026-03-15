//! SQLx PostgreSQL connection pool.

use sqlx::{postgres::PgPoolOptions, PgPool};

use crate::config::Config;

/// Create and validate a PostgreSQL connection pool.
///
/// Fails fast at startup if the database is unreachable.
pub async fn create_pool(config: &Config) -> Result<PgPool, sqlx::Error> {
    PgPoolOptions::new()
        .max_connections(10)
        .connect(&config.database_url)
        .await
}
