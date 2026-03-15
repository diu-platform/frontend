//! MCP Physics Server routes — JSON-RPC 2.0 over HTTP (ADR D-020, D-023).
//!
//! Endpoint: `POST /mcp/v1/`
//! Protocol: JSON-RPC 2.0
//! Version: v1 (returned in all responses per ADR D-023)

use axum::{routing::post, Json, Router};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::AppState;

/// Build the MCP sub-router (`/mcp` prefix applied in main.rs).
pub fn router() -> Router<AppState> {
    Router::new().route("/v1/", post(handle_jsonrpc))
}

// ─── JSON-RPC 2.0 types ───────────────────────────────────────────────────────

#[derive(Deserialize)]
pub struct McpRequest {
    pub jsonrpc: String,
    pub method: String,
    #[serde(default)]
    pub params: Value,
    pub id: Value,
}

#[derive(Serialize)]
pub struct McpResponse {
    pub jsonrpc: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<McpError>,
    pub id: Value,
}

#[derive(Serialize)]
pub struct McpError {
    pub code: i32,
    pub message: String,
}

// ─── JSON-RPC error codes ─────────────────────────────────────────────────────

const PARSE_ERROR: i32 = -32700;
const METHOD_NOT_FOUND: i32 = -32601;
const INVALID_PARAMS: i32 = -32602;

// ─── Handler ─────────────────────────────────────────────────────────────────

/// Main JSON-RPC 2.0 dispatcher for MCP Physics Server.
async fn handle_jsonrpc(Json(req): Json<McpRequest>) -> Json<McpResponse> {
    if req.jsonrpc != "2.0" {
        return Json(error_response(
            req.id,
            PARSE_ERROR,
            "jsonrpc must be \"2.0\"",
        ));
    }

    let result = match req.method.as_str() {
        "tools/list" => Ok(tools_list()),
        "tools/call" => tools_call(req.params),
        _ => Err(McpError {
            code: METHOD_NOT_FOUND,
            message: format!("Method not found: {}", req.method),
        }),
    };

    Json(match result {
        Ok(value) => McpResponse {
            jsonrpc: "2.0",
            result: Some(value),
            error: None,
            id: req.id,
        },
        Err(err) => McpResponse {
            jsonrpc: "2.0",
            result: None,
            error: Some(err),
            id: req.id,
        },
    })
}

// ─── tools/list ──────────────────────────────────────────────────────────────

fn tools_list() -> Value {
    serde_json::json!({
        "version": "v1",
        "tools": [
            {
                "name": "simulate_quantum_tunneling",
                "description": "Simulate quantum tunneling through a potential barrier. Returns transmission probability computed via WKB approximation.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "barrier_height_ev": {
                            "type": "number",
                            "description": "Barrier height in electron-volts (eV). Range: 0.1–100.0"
                        },
                        "barrier_width_nm": {
                            "type": "number",
                            "description": "Barrier width in nanometers. Range: 0.01–10.0"
                        },
                        "particle_energy_ev": {
                            "type": "number",
                            "description": "Particle kinetic energy in eV. Must be < barrier_height_ev for quantum tunneling."
                        }
                    },
                    "required": ["barrier_height_ev", "barrier_width_nm", "particle_energy_ev"]
                }
            },
            {
                "name": "simulate_hydrogen",
                "description": "Compute hydrogen atom orbital parameters. Returns quantum numbers, energy level, and expected orbital radius.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "n": {
                            "type": "integer",
                            "description": "Principal quantum number. Range: 1–5"
                        },
                        "l": {
                            "type": "integer",
                            "description": "Azimuthal quantum number. Range: 0 to n-1"
                        },
                        "m": {
                            "type": "integer",
                            "description": "Magnetic quantum number. Range: -l to l"
                        }
                    },
                    "required": ["n", "l", "m"]
                }
            },
            {
                "name": "get_progress",
                "description": "Retrieve a user's simulation progress from the DIU OS platform.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "address": {
                            "type": "string",
                            "description": "Ethereum address (0x-prefixed, 42 chars)"
                        }
                    },
                    "required": ["address"]
                }
            }
        ]
    })
}

// ─── tools/call ──────────────────────────────────────────────────────────────

fn tools_call(params: Value) -> Result<Value, McpError> {
    let name = params
        .get("name")
        .and_then(|v| v.as_str())
        .ok_or_else(|| McpError {
            code: INVALID_PARAMS,
            message: "params.name is required".to_string(),
        })?;

    let args = params
        .get("arguments")
        .cloned()
        .unwrap_or(Value::Object(Default::default()));

    match name {
        "simulate_quantum_tunneling" => simulate_quantum_tunneling(args),
        "simulate_hydrogen" => simulate_hydrogen(args),
        "get_progress" => get_progress(args),
        _ => Err(McpError {
            code: METHOD_NOT_FOUND,
            message: format!("Unknown tool: {name}"),
        }),
    }
}

// ─── tool implementations ─────────────────────────────────────────────────────

/// Quantum tunneling via WKB approximation.
///
/// Physics: T ≈ exp(-2·κ·d), κ = √(2m(V₀−E)) / ħ
/// For an electron: 2m/ħ² = 26.246 eV⁻¹·nm⁻²
fn simulate_quantum_tunneling(args: Value) -> Result<Value, McpError> {
    let barrier_height = args
        .get("barrier_height_ev")
        .and_then(|v| v.as_f64())
        .ok_or_else(|| McpError {
            code: INVALID_PARAMS,
            message: "barrier_height_ev is required (number)".to_string(),
        })?;

    let barrier_width = args
        .get("barrier_width_nm")
        .and_then(|v| v.as_f64())
        .ok_or_else(|| McpError {
            code: INVALID_PARAMS,
            message: "barrier_width_nm is required (number)".to_string(),
        })?;

    let particle_energy = args
        .get("particle_energy_ev")
        .and_then(|v| v.as_f64())
        .ok_or_else(|| McpError {
            code: INVALID_PARAMS,
            message: "particle_energy_ev is required (number)".to_string(),
        })?;

    // WKB approximation: T ≈ exp(-2·κ·d)
    // κ = √(2·mₑ·(V₀−E)) / ħ; for electron: 2mₑ/ħ² = 26.246 eV⁻¹·nm⁻²
    const TWO_M_OVER_HBAR_SQ: f64 = 26.246;
    let delta_e = (barrier_height - particle_energy).max(0.0);
    let kappa = (TWO_M_OVER_HBAR_SQ * delta_e).sqrt();
    let transmission = (-2.0 * kappa * barrier_width).exp();
    let regime = if particle_energy >= barrier_height {
        "classical_over_barrier"
    } else {
        "quantum_tunneling"
    };

    Ok(serde_json::json!({
        "version": "v1",
        "tool": "simulate_quantum_tunneling",
        "result": {
            "transmission_probability": transmission,
            "barrier_height_ev": barrier_height,
            "barrier_width_nm": barrier_width,
            "particle_energy_ev": particle_energy,
            "kappa_per_nm": kappa,
            "regime": regime
        },
        "note": "WKB approximation. Full wave-packet simulation arriving in Phase 3."
    }))
}

/// Hydrogen atom orbital — quantum numbers, energy (Rydberg), expected radius.
///
/// Physics: Eₙ = −13.606 eV / n², ⟨r⟩ ≈ n²·a₀ (a₀ = 0.0529177 nm)
fn simulate_hydrogen(args: Value) -> Result<Value, McpError> {
    let n = args
        .get("n")
        .and_then(|v| v.as_u64())
        .ok_or_else(|| McpError {
            code: INVALID_PARAMS,
            message: "n is required (integer)".to_string(),
        })? as u32;

    let l = args
        .get("l")
        .and_then(|v| v.as_u64())
        .ok_or_else(|| McpError {
            code: INVALID_PARAMS,
            message: "l is required (integer)".to_string(),
        })? as u32;

    let m = args
        .get("m")
        .and_then(|v| v.as_i64())
        .ok_or_else(|| McpError {
            code: INVALID_PARAMS,
            message: "m is required (integer)".to_string(),
        })?;

    if n == 0 || n > 5 {
        return Err(McpError {
            code: INVALID_PARAMS,
            message: "n must be in range 1–5".to_string(),
        });
    }
    if l >= n {
        return Err(McpError {
            code: INVALID_PARAMS,
            message: format!("l ({l}) must be < n ({n})"),
        });
    }
    if m.unsigned_abs() > l as u64 {
        return Err(McpError {
            code: INVALID_PARAMS,
            message: format!("|m| ({}) must be ≤ l ({l})", m.abs()),
        });
    }

    // Rydberg formula: Eₙ = −13.606 eV / n²
    let energy_ev = -13.606 / (n * n) as f64;
    // Bohr radius a₀ = 0.0529177 nm; expected radius ≈ n²·a₀ for hydrogen
    const A0_NM: f64 = 0.0529177;
    let orbital_radius_nm = (n * n) as f64 * A0_NM;
    let spectroscopic = ["s", "p", "d", "f", "g"][l as usize];
    let state_label = format!("{n}{spectroscopic}");

    Ok(serde_json::json!({
        "version": "v1",
        "tool": "simulate_hydrogen",
        "result": {
            "n": n,
            "l": l,
            "m": m,
            "energy_ev": energy_ev,
            "orbital_radius_nm": orbital_radius_nm,
            "state_label": state_label
        },
        "note": "Full 3D probability density |Rnl·Ylm|² grid arriving in Phase 3."
    }))
}

/// User simulation progress — stub until DB integration (Phase 3).
fn get_progress(args: Value) -> Result<Value, McpError> {
    let address = args
        .get("address")
        .and_then(|v| v.as_str())
        .ok_or_else(|| McpError {
            code: INVALID_PARAMS,
            message: "address is required (string)".to_string(),
        })?;

    if !address.starts_with("0x") || address.len() != 42 {
        return Err(McpError {
            code: INVALID_PARAMS,
            message: "address must be 0x-prefixed Ethereum address (42 chars)".to_string(),
        });
    }

    Ok(serde_json::json!({
        "version": "v1",
        "tool": "get_progress",
        "result": {
            "address": address,
            "simulations_completed": 0,
            "xp_earned": 0,
            "achievements": []
        },
        "note": "DIUProgress on-chain read and DB integration arriving in Phase 3."
    }))
}

// ─── helpers ─────────────────────────────────────────────────────────────────

fn error_response(id: Value, code: i32, message: &str) -> McpResponse {
    McpResponse {
        jsonrpc: "2.0",
        result: None,
        error: Some(McpError {
            code,
            message: message.to_string(),
        }),
        id,
    }
}
