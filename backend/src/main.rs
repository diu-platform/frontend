//! DIU OS Backend — production Axum server (B-1).

use axum::{routing::get, Json, Router};
use serde::Serialize;
use sqlx::PgPool;
use std::{
    collections::HashMap,
    net::SocketAddr,
    sync::{Arc, Mutex},
    time::Instant,
};
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod auth;
mod config;
mod db;
mod error;
mod mcp;
mod middleware;
mod models;
mod progress;
mod registry;
mod reputation;
mod routes;
mod services;
mod simulations;

/// In-memory nonce store: address → (nonce, issued_at).
///
/// Nonces expire after 5 minutes (checked on verify).
/// Single-server only — migrate to Redis/DB for multi-instance Phase 3.
pub type NonceStore = Arc<Mutex<HashMap<String, (String, Instant)>>>;

/// Shared application state injected into all Axum handlers.
#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Arc<config::Config>,
    pub nonces: NonceStore,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Tracing setup
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "physics_tutorial_api=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load env and config
    dotenvy::dotenv().ok();
    let config = Arc::new(config::Config::from_env()?);

    // Database pool
    let db = db::create_pool(&config).await?;
    tracing::info!("Database connected");

    let state = AppState {
        db: db.clone(),
        config: config.clone(),
        nonces: Arc::new(Mutex::new(HashMap::new())),
    };

    // Spawn ORCID verification worker (ADR D-030 / B-2).
    let verifier = registry::worker::OrcidVerifier::new(db, config.clone());
    tokio::spawn(verifier.run());
    tracing::info!("ORCID verifier worker spawned");

    let app = build_router(state, &config);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("DIU OS backend listening on {addr}");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to bind {addr}: {e}"))?;

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .map_err(|e| anyhow::anyhow!("Server error: {e}"))?;

    Ok(())
}

fn build_router(state: AppState, config: &config::Config) -> Router {
    let cors = build_cors(config);

    let app: Router<AppState> = Router::new()
        // Health check
        .route("/health", get(health_check))
        // Simulations (DDD: simulations context)
        .nest("/api/v1/simulations", simulations::routes::router())
        // Progress (DDD: progress context)
        .nest("/api/v1/progress", progress::routes::router())
        // Reputation (DDD: reputation context — stub, B-2 wires alloy)
        .nest("/api/v1/reputation", reputation::routes::router())
        // MCP Physics Server — JSON-RPC 2.0 (ADR D-020, D-023)
        .nest("/mcp", mcp::routes::router())
        // Quantum AI Tutor (calls Anthropic Claude via server-side key)
        .route("/api/chat", axum::routing::post(routes::ai::chat))
        // AI assistant (legacy, to be replaced by MCP in B-3)
        .route("/api/v1/ai/ask", axum::routing::post(routes::ai::ask_question))
        // Auth (SIWE + JWT)
        .nest("/auth", auth::routes::router())
        .layer(TraceLayer::new_for_http())
        .layer(cors);

    app.with_state(state)
}

fn build_cors(config: &config::Config) -> CorsLayer {
    use axum::http::{HeaderValue, Method};
    use tower_http::cors::AllowOrigin;

    let origins: Vec<HeaderValue> = config
        .cors_origins
        .iter()
        .filter_map(|o| HeaderValue::from_str(o).ok())
        .collect();

    CorsLayer::new()
        .allow_origin(AllowOrigin::list(origins))
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(tower_http::cors::Any)
}

async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        service: "physics-tutorial-api".to_string(),
    })
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
    service: String,
}
