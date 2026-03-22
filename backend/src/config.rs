//! Application configuration loaded from environment variables.

use std::env;

/// Default system prompt for the Quantum AI Tutor.
///
/// Used when `QUANTUM_SYSTEM_PROMPT` env var is not set.
const DEFAULT_QUANTUM_SYSTEM_PROMPT: &str = "\
You are Quantum — the AI tutor of DIU OS, a decentralized scientific education platform. \
Your role: explain quantum physics concepts clearly, connect theory to the interactive 3D simulations \
the user sees (double-slit experiment, quantum tunneling, hydrogen orbitals), and motivate exploration. \
Respond in the same language the user uses (Russian or English). \
Be concise (3-6 sentences max per reply), use analogies, never guess physical constants — \
say 'I\\'m not certain' instead. Do not hallucinate formulas.";

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
    /// Anthropic API key for the Quantum AI Tutor (POST /api/chat).
    ///
    /// Optional — server starts without it; AI responses degrade to a stub message.
    pub anthropic_api_key: Option<String>,
    /// System prompt for the Quantum AI Tutor.
    ///
    /// Loaded from `QUANTUM_SYSTEM_PROMPT` env var; falls back to `DEFAULT_QUANTUM_SYSTEM_PROMPT`.
    pub quantum_system_prompt: String,
    /// ORCID OAuth 2.0 client ID (optional — ORCID login disabled if absent).
    pub orcid_client_id: Option<String>,
    /// ORCID OAuth 2.0 client secret (optional — paired with client_id).
    pub orcid_client_secret: Option<String>,
    /// Redirect URI registered with ORCID (e.g. https://api.diu-os.org/auth/orcid/callback).
    pub orcid_redirect_uri: String,
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

        let anthropic_api_key = env::var("ANTHROPIC_API_KEY").ok();

        let quantum_system_prompt = env::var("QUANTUM_SYSTEM_PROMPT")
            .unwrap_or_else(|_| DEFAULT_QUANTUM_SYSTEM_PROMPT.to_string());

        let orcid_client_id = env::var("ORCID_CLIENT_ID").ok();
        let orcid_client_secret = env::var("ORCID_CLIENT_SECRET").ok();
        let orcid_redirect_uri = env::var("ORCID_REDIRECT_URI")
            .unwrap_or_else(|_| "http://localhost:3001/auth/orcid/callback".to_string());

        Ok(Config {
            database_url,
            jwt_secret,
            cors_origins,
            port,
            chain_rpc_url,
            registry_contract_address,
            deployer_private_key,
            anthropic_api_key,
            quantum_system_prompt,
            orcid_client_id,
            orcid_client_secret,
            orcid_redirect_uri,
        })
    }
}
