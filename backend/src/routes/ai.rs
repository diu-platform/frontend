use axum::{extract::{ConnectInfo, State}, http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;

use crate::{error::AppError, middleware::auth::OptionalAuthUser, AppState};

// ─── Daily chat limits ────────────────────────────────────────────────────────

/// Anonymous users (identified by IP): 5 requests per day.
const LIMIT_ANONYMOUS: u32 = 5;
/// SIWE (wallet) users: 10 requests per day.
const LIMIT_SIWE: u32 = 10;
/// ORCID users (researchers): 20 requests per day.
const LIMIT_ORCID: u32 = 20;

/// Handle AI questions about physics
pub async fn ask_question(
    Json(request): Json<AskQuestionRequest>,
) -> Result<Json<AskQuestionResponse>, StatusCode> {
    // For MVP: Return pre-defined answers for common questions
    // TODO: Integrate with OpenAI API or local LLM
    
    let answer = get_physics_answer(&request.question, &request.context);
    
    Ok(Json(AskQuestionResponse {
        answer,
        related_topics: get_related_topics(&request.question),
        suggested_experiments: get_suggested_experiments(&request.question),
    }))
}

fn get_physics_answer(question: &str, _context: &Option<String>) -> String {
    let q = question.to_lowercase();
    
    // Check for common physics questions
    if q.contains("interference") || q.contains("интерференц") {
        return r#"**Interference** occurs when two or more waves overlap, resulting in a new wave pattern.

In the double-slit experiment:
- When waves are in phase (crests align), they create **constructive interference** (bright bands)
- When waves are out of phase (crest meets trough), they create **destructive interference** (dark bands)

The spacing of the interference pattern depends on:
- Wavelength of light (λ)
- Distance between slits (d)
- Distance to the screen (L)

Try adjusting the wavelength slider to see how the pattern changes!"#.to_string();
    }
    
    if q.contains("wave") && q.contains("particle") || q.contains("duality") {
        return r#"**Wave-particle duality** is one of the most fundamental concepts in quantum mechanics.

It means that quantum objects (like electrons, photons) exhibit both wave-like and particle-like properties:

1. **As waves**: They can interfere, diffract, and create patterns
2. **As particles**: They hit detectors at specific points

The key insight: **observation matters**! When we try to determine which slit a particle passes through, the interference pattern disappears.

This is demonstrated beautifully in the double-slit experiment. Try turning on "Observer Mode" to see the difference!"#.to_string();
    }
    
    if q.contains("tunnel") || q.contains("barrier") {
        return r#"**Quantum tunneling** is a phenomenon where a particle can pass through a potential barrier even if its energy is less than the barrier height.

Classically, this is impossible - imagine a ball rolling toward a hill without enough energy to go over it.

In quantum mechanics, the particle's wave function extends beyond the barrier, giving a non-zero probability of finding the particle on the other side.

**Key factors affecting tunneling probability:**
- Barrier height (higher = less tunneling)
- Barrier width (wider = less tunneling)
- Particle mass (heavier = less tunneling)
- Particle energy (higher = more tunneling)

Try the Quantum Tunneling simulation to explore these relationships!"#.to_string();
    }
    
    if q.contains("orbital") || q.contains("electron") && q.contains("atom") {
        return r#"**Atomic orbitals** are regions of space where electrons are most likely to be found.

In the hydrogen atom:
- **s orbitals**: Spherical, can hold 2 electrons
- **p orbitals**: Dumbbell-shaped, can hold 6 electrons  
- **d orbitals**: More complex shapes, can hold 10 electrons

The shapes are determined by the wave function solutions to the Schrödinger equation.

Each orbital is characterized by quantum numbers:
- n (principal): energy level
- l (angular momentum): shape
- m (magnetic): orientation

Explore the Hydrogen Atom simulation to see these orbitals in 3D!"#.to_string();
    }
    
    // Default response
    format!(r#"That's a great question about physics! 

Based on your question: "{}"

I'd recommend exploring the relevant simulation to build intuition. You can:
1. Adjust parameters and observe changes
2. Read the theory section for mathematical details
3. Ask more specific questions about what you observe

What aspect would you like to explore further?"#, question)
}

fn get_related_topics(question: &str) -> Vec<String> {
    let q = question.to_lowercase();
    
    if q.contains("interference") || q.contains("slit") {
        vec![
            "Wave-particle duality".to_string(),
            "Quantum superposition".to_string(),
            "Wave function collapse".to_string(),
            "Heisenberg uncertainty principle".to_string(),
        ]
    } else if q.contains("tunnel") {
        vec![
            "Potential barriers".to_string(),
            "Schrödinger equation".to_string(),
            "Alpha decay".to_string(),
            "Scanning tunneling microscope".to_string(),
        ]
    } else if q.contains("orbital") || q.contains("atom") {
        vec![
            "Quantum numbers".to_string(),
            "Electron configuration".to_string(),
            "Spectral lines".to_string(),
            "Bohr model".to_string(),
        ]
    } else {
        vec![
            "Quantum mechanics basics".to_string(),
            "Wave function".to_string(),
            "Probability in quantum physics".to_string(),
        ]
    }
}

fn get_suggested_experiments(question: &str) -> Vec<SuggestedExperiment> {
    let q = question.to_lowercase();
    
    if q.contains("interference") || q.contains("slit") || q.contains("wave") {
        vec![
            SuggestedExperiment {
                simulation_id: "double-slit".to_string(),
                title: "Vary the wavelength".to_string(),
                description: "Change the wavelength from 400nm to 700nm and observe how the interference pattern spacing changes".to_string(),
            },
            SuggestedExperiment {
                simulation_id: "double-slit".to_string(),
                title: "Toggle observer mode".to_string(),
                description: "Turn observer mode on and off to see the dramatic difference between wave and particle behavior".to_string(),
            },
        ]
    } else {
        vec![]
    }
}

/// POST /api/chat — Quantum AI Tutor via Anthropic Claude API.
///
/// Daily rate limits enforced via `chat_usage` table:
/// - Anonymous (by IP):  5 requests/day
/// - SIWE (wallet):     10 requests/day
/// - ORCID (researcher): 20 requests/day
///
/// Returns a fallback message if ANTHROPIC_API_KEY is absent (local dev).
///
/// Note: ConnectInfo gives the direct TCP peer address. In production behind a
/// reverse proxy, configure the proxy to pass `X-Real-IP` and read it here (Phase 3).
pub async fn chat(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    OptionalAuthUser(opt_user): OptionalAuthUser,
    Json(req): Json<ChatRequest>,
) -> Result<Json<ChatResponse>, AppError> {
    // ── 1. Determine identifier and daily limit ───────────────────────────────
    let (identifier, limit): (String, u32) = match &opt_user {
        Some(user) if user.login_method == "orcid" => {
            let id = user.orcid_id.clone().unwrap_or_else(|| user.sub.clone());
            (id, LIMIT_ORCID)
        }
        Some(user) => {
            let addr_str = user.address.clone().unwrap_or_else(|| user.sub.clone());
            (addr_str, LIMIT_SIWE)
        }
        None => (addr.ip().to_string(), LIMIT_ANONYMOUS),
    };

    // ── 2. Check current usage ────────────────────────────────────────────────
    let row = sqlx::query!(
        "SELECT count FROM chat_usage WHERE identifier = $1 AND date = CURRENT_DATE",
        identifier
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| AppError::Internal(format!("Rate limit DB read failed: {e}")))?;

    let current = row.map(|r| r.count).unwrap_or(0);

    if current >= limit as i32 {
        return Err(AppError::RateLimit(limit));
    }

    // ── 3. Call Anthropic API ─────────────────────────────────────────────────
    let api_key = match &state.config.anthropic_api_key {
        Some(k) => k.clone(),
        None => {
            return Ok(Json(ChatResponse {
                reply: "AI-тьютор временно недоступен. Установи ANTHROPIC_API_KEY на сервере."
                    .to_string(),
            }));
        }
    };

    let experiment_context = match req.experiment.as_deref() {
        Some("doubleSlit") => " The user is currently watching the **Double-Slit experiment** simulation (wave/particle duality, interference pattern, detector toggle).",
        Some("tunneling")  => " The user is currently watching the **Quantum Tunneling** simulation (barrier height/width, transmission probability, WKB approximation).",
        Some("hydrogen")   => " The user is currently watching the **Hydrogen Atom** simulation (3D electron orbitals, quantum numbers n/l/m, probability clouds).",
        _ => "",
    };

    let sim_context_prefix = req
        .sim_context
        .as_deref()
        .map(|ctx| format!("[Current simulation: {ctx}]\n"))
        .unwrap_or_default();

    let system = format!(
        "{sim_context_prefix}{}{experiment_context}",
        state.config.quantum_system_prompt
    );

    let messages: Vec<serde_json::Value> = req
        .history
        .iter()
        .map(|m| serde_json::json!({ "role": m.role, "content": m.content }))
        .chain(std::iter::once(
            serde_json::json!({ "role": "user", "content": req.message }),
        ))
        .collect();

    let body = serde_json::json!({
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 512,
        "system": system,
        "messages": messages,
    });

    let client = reqwest::Client::new();
    let res = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", &api_key)
        .header("anthropic-version", "2023-06-01")
        .json(&body)
        .send()
        .await
        .map_err(|e| AppError::BadGateway(format!("Anthropic request failed: {e}")))?;

    if !res.status().is_success() {
        return Err(AppError::BadGateway("Anthropic API error".to_string()));
    }

    let data: serde_json::Value = res
        .json()
        .await
        .map_err(|e| AppError::BadGateway(format!("Invalid Anthropic response: {e}")))?;

    let reply = data["content"][0]["text"]
        .as_str()
        .unwrap_or("Нет ответа.")
        .to_string();

    // ── 4. Increment usage counter (only on success) ──────────────────────────
    sqlx::query!(
        r#"
        INSERT INTO chat_usage (identifier, date, count)
        VALUES ($1, CURRENT_DATE, 1)
        ON CONFLICT (identifier, date) DO UPDATE
            SET count = chat_usage.count + 1
        "#,
        identifier
    )
    .execute(&state.db)
    .await
    .map_err(|e| AppError::Internal(format!("Rate limit DB write failed: {e}")))?;

    Ok(Json(ChatResponse { reply }))
}

#[derive(Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Deserialize)]
pub struct ChatRequest {
    pub message: String,
    pub history: Vec<ChatMessage>,
    /// Currently active simulation: "doubleSlit" | "tunneling" | "hydrogen"
    pub experiment: Option<String>,
    /// Current simulation parameters as a human-readable string, e.g.
    /// "Experiment: double-slit. wavelength=550nm, slit_distance=0.3, ..."
    pub sim_context: Option<String>,
}

#[derive(Serialize)]
pub struct ChatResponse {
    pub reply: String,
}

#[derive(Deserialize)]
pub struct AskQuestionRequest {
    pub question: String,
    pub context: Option<String>,  // Current simulation, parameters, etc.
}

#[derive(Serialize)]
pub struct AskQuestionResponse {
    pub answer: String,
    pub related_topics: Vec<String>,
    pub suggested_experiments: Vec<SuggestedExperiment>,
}

#[derive(Serialize)]
pub struct SuggestedExperiment {
    pub simulation_id: String,
    pub title: String,
    pub description: String,
}
