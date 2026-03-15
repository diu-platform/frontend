//! Simulation HTTP routes.
//!
//! Moved from routes/simulations.rs — logic unchanged.

use axum::{
    extract::Path,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::AppState;

/// Build the simulations sub-router (`/api/v1/simulations` prefix applied in main.rs).
pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_simulations))
        .route("/:id", get(get_simulation))
        .route("/:id/run", post(run_simulation))
}

/// List all available simulations
async fn list_simulations() -> Json<Vec<SimulationInfo>> {
    Json(vec![
        SimulationInfo {
            id: "double-slit".to_string(),
            name: "Double-Slit Experiment".to_string(),
            description: "Explore wave-particle duality through the classic quantum experiment".to_string(),
            difficulty: "beginner".to_string(),
            estimated_time_minutes: 15,
            topics: vec!["wave-particle duality".to_string(), "interference".to_string(), "quantum measurement".to_string()],
        },
        SimulationInfo {
            id: "quantum-tunneling".to_string(),
            name: "Quantum Tunneling".to_string(),
            description: "Visualize how particles can pass through potential barriers".to_string(),
            difficulty: "intermediate".to_string(),
            estimated_time_minutes: 20,
            topics: vec!["tunneling".to_string(), "potential barriers".to_string(), "probability".to_string()],
        },
        SimulationInfo {
            id: "hydrogen-atom".to_string(),
            name: "Hydrogen Atom Orbitals".to_string(),
            description: "Interactive 3D visualization of electron orbitals".to_string(),
            difficulty: "intermediate".to_string(),
            estimated_time_minutes: 25,
            topics: vec!["orbitals".to_string(), "energy levels".to_string(), "spectral lines".to_string()],
        },
    ])
}

/// Get simulation details by ID
async fn get_simulation(Path(id): Path<String>) -> Result<Json<SimulationDetails>, StatusCode> {
    match id.as_str() {
        "double-slit" => Ok(Json(SimulationDetails {
            id: "double-slit".to_string(),
            name: "Double-Slit Experiment".to_string(),
            description: "The double-slit experiment demonstrates the fundamentally probabilistic nature of quantum mechanical phenomena.".to_string(),
            parameters: vec![
                SimulationParameter {
                    name: "wavelength".to_string(),
                    label: "Wavelength (nm)".to_string(),
                    param_type: "slider".to_string(),
                    min: Some(400.0),
                    max: Some(700.0),
                    default: 550.0,
                    step: Some(10.0),
                },
                SimulationParameter {
                    name: "slit_separation".to_string(),
                    label: "Slit Separation (mm)".to_string(),
                    param_type: "slider".to_string(),
                    min: Some(0.01),
                    max: Some(1.0),
                    default: 0.1,
                    step: Some(0.01),
                },
                SimulationParameter {
                    name: "observer_mode".to_string(),
                    label: "Observer Mode".to_string(),
                    param_type: "toggle".to_string(),
                    min: None,
                    max: None,
                    default: 0.0,
                    step: None,
                },
            ],
            theory: r#"
## Wave-Particle Duality

When particles like electrons or photons pass through two slits, they create an interference pattern on a detection screen - a behavior characteristic of waves.

However, when we try to observe which slit the particle passes through, the interference pattern disappears, and we see two bands - particle behavior.

### Key Concepts:
1. **Superposition**: The particle exists in a superposition of passing through both slits
2. **Wave function**: Describes the probability amplitude of the particle's position
3. **Measurement**: Observing the particle collapses the wave function

### Mathematical Description:
The intensity pattern is given by:
$$I(θ) = I_0 \cos^2\left(\frac{πd\sin(θ)}{λ}\right)$$

Where:
- $d$ is the slit separation
- $λ$ is the wavelength
- $θ$ is the angle from the center
"#.to_string(),
        })),
        _ => Err(StatusCode::NOT_FOUND),
    }
}

/// Run a simulation with given parameters
async fn run_simulation(
    Path(id): Path<String>,
    Json(params): Json<RunSimulationRequest>,
) -> Result<Json<SimulationResult>, StatusCode> {
    match id.as_str() {
        "double-slit" => {
            let wavelength = params.parameters.get("wavelength")
                .and_then(|v| v.as_f64())
                .unwrap_or(550.0);
            let slit_separation = params.parameters.get("slit_separation")
                .and_then(|v| v.as_f64())
                .unwrap_or(0.1);
            let observer_mode = params.parameters.get("observer_mode")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);

            let pattern = calculate_interference_pattern(wavelength, slit_separation, observer_mode);

            Ok(Json(SimulationResult {
                id: Uuid::new_v4().to_string(),
                simulation_id: id,
                data: serde_json::json!({
                    "pattern": pattern,
                    "wavelength": wavelength,
                    "slit_separation": slit_separation,
                    "observer_mode": observer_mode,
                }),
                computed_at: chrono::Utc::now().to_rfc3339(),
            }))
        }
        _ => Err(StatusCode::NOT_FOUND),
    }
}

/// Calculate interference pattern for double-slit experiment.
///
/// Physics: I(θ) = cos²(π·d·sin(θ)/λ)
fn calculate_interference_pattern(wavelength_nm: f64, slit_separation_mm: f64, observer_mode: bool) -> Vec<f64> {
    let num_points = 200;
    let wavelength_m = wavelength_nm * 1e-9;
    let slit_separation_m = slit_separation_mm * 1e-3;
    let screen_distance = 1.0; // 1 meter

    (0..num_points)
        .map(|i| {
            let x = (i as f64 - num_points as f64 / 2.0) * 0.001; // -10cm to +10cm
            let theta = (x / screen_distance).atan();

            if observer_mode {
                // Particle behavior: two distinct bands (Gaussian distributions)
                let band1 = (-((theta + 0.05_f64).powi(2)) / 0.001).exp();
                let band2 = (-((theta - 0.05_f64).powi(2)) / 0.001).exp();
                (band1 + band2) * 0.5
            } else {
                // Wave behavior: interference pattern
                let phase = std::f64::consts::PI * slit_separation_m * theta.sin() / wavelength_m;
                phase.cos().powi(2)
            }
        })
        .collect()
}

// ─── Types ───────────────────────────────────────────────────────────────────

#[derive(Serialize)]
pub struct SimulationInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub difficulty: String,
    pub estimated_time_minutes: u32,
    pub topics: Vec<String>,
}

#[derive(Serialize)]
pub struct SimulationDetails {
    pub id: String,
    pub name: String,
    pub description: String,
    pub parameters: Vec<SimulationParameter>,
    pub theory: String,
}

#[derive(Serialize)]
pub struct SimulationParameter {
    pub name: String,
    pub label: String,
    pub param_type: String,
    pub min: Option<f64>,
    pub max: Option<f64>,
    pub default: f64,
    pub step: Option<f64>,
}

#[derive(Deserialize)]
pub struct RunSimulationRequest {
    pub parameters: serde_json::Map<String, serde_json::Value>,
}

#[derive(Serialize)]
pub struct SimulationResult {
    pub id: String,
    pub simulation_id: String,
    pub data: serde_json::Value,
    pub computed_at: String,
}
