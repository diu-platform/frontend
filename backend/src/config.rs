//! Application configuration loaded from environment variables.

use std::env;

/// Runtime configuration for the backend server.
///
/// Loaded from environment variables at startup. All required fields
/// (DATABASE_URL, JWT_SECRET) cause a startup failure if absent.
#[derive(Clone, Debug)]
pub struct Config {
    /// PostgreSQL connection URL.
    pub database_url: String,
    /// Secret key for signing JWTs (min 32 bytes recommended).
    pub jwt_secret: String,
    /// Comma-separated list of allowed CORS origins (e.g. "http://localhost:5173").
    pub cors_origins: Vec<String>,
    /// Port to listen on (default: 3001).
    pub port: u16,
    /// Arbitrum RPC endpoint for alloy/event listener.
    pub chain_rpc_url: String,
    /// DIURegistry contract address on Arbitrum Sepolia.
    pub registry_contract_address: String,
    /// Deployer private key for on-chain verify_researcher calls (never logged).
    pub deployer_private_key: String,
}

impl Config {
    /// Load configuration from environment variables.
    ///
    /// Returns an error if any required variable is missing or malformed.
    pub fn from_env() -> Result<Self, anyhow::Error> {
        let database_url = env::var("DATABASE_URL")
            .map_err(|_| anyhow::anyhow!("DATABASE_URL is required"))?;

        let jwt_secret = env::var("JWT_SECRET")
            .map_err(|_| anyhow::anyhow!("JWT_SECRET is required"))?;

        if jwt_secret.len() < 32 {
            return Err(anyhow::anyhow!("JWT_SECRET must be at least 32 characters"));
        }

        let cors_origins = env::var("CORS_ORIGINS")
            .unwrap_or_else(|_| "http://localhost:5173,http://localhost:3000".to_string())
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        let port = env::var("PORT")
            .unwrap_or_else(|_| "3001".to_string())
            .parse::<u16>()
            .map_err(|_| anyhow::anyhow!("PORT must be a valid port number"))?;

        let chain_rpc_url = env::var("CHAIN_RPC_URL")
            .unwrap_or_else(|_| "https://sepolia-rollup.arbitrum.io/rpc".to_string());

        let registry_contract_address = env::var("REGISTRY_CONTRACT_ADDRESS")
            .unwrap_or_else(|_| "0x49e1b11e1037e74113a7c0ccc41e3042d4691018".to_string());

        let deployer_private_key = env::var("DEPLOYER_PRIVATE_KEY")
            .map_err(|_| anyhow::anyhow!("DEPLOYER_PRIVATE_KEY is required"))?;

        Ok(Config {
            database_url,
            jwt_secret,
            cors_origins,
            port,
            chain_rpc_url,
            registry_contract_address,
            deployer_private_key,
        })
    }
}
