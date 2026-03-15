//! Registry service — ORCID API + on-chain verify_researcher.
//!
//! Two pure async functions used by the OrcidVerifier worker:
//! - `verify_orcid_via_api` — calls pub.orcid.org/v3.0 to confirm existence
//! - `call_verify_researcher` — calls DIURegistry.verifyResearcher() on-chain via alloy

use alloy::{
    network::EthereumWallet,
    primitives::Address,
    providers::ProviderBuilder,
    signers::local::PrivateKeySigner,
    sol,
};
use anyhow::Result;

// alloy bindings for DIURegistry.verifyResearcher()
sol! {
    #[sol(rpc)]
    interface IRegistry {
        function verifyResearcher(address researcher) external;
    }
}

/// Verify that an ORCID ID exists in the public ORCID registry.
///
/// - `Ok(true)`  — record found (HTTP 200)
/// - `Ok(false)` — record not found (HTTP 404) → permanent rejection
/// - `Err(_)`    — transient failure (rate-limit, network) → schedule retry
pub async fn verify_orcid_via_api(orcid_id: &str) -> Result<bool> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()?;

    let url = format!("https://pub.orcid.org/v3.0/{orcid_id}/record");

    let response = client
        .get(&url)
        .header("Accept", "application/json")
        .send()
        .await
        .map_err(|e| anyhow::anyhow!("ORCID API request failed: {e}"))?;

    match response.status().as_u16() {
        200 => Ok(true),
        404 => Ok(false),
        status => Err(anyhow::anyhow!(
            "ORCID API returned unexpected status {status} — will retry"
        )),
    }
}

/// Call `DIURegistry.verifyResearcher(address)` on-chain via alloy.
///
/// Uses the deployer private key to sign and broadcast the transaction.
/// The key is read from config and never logged.
pub async fn call_verify_researcher(
    researcher_address: &str,
    registry_address: &str,
    rpc_url: &str,
    private_key: &str,
) -> Result<()> {
    let signer: PrivateKeySigner = private_key
        .parse()
        .map_err(|_| anyhow::anyhow!("Invalid DEPLOYER_PRIVATE_KEY format"))?;

    let wallet = EthereumWallet::from(signer);

    let provider = ProviderBuilder::new()
        .with_recommended_fillers()
        .wallet(wallet)
        .on_http(
            rpc_url
                .parse()
                .map_err(|e| anyhow::anyhow!("Invalid RPC URL: {e}"))?,
        );

    let registry_addr: Address = registry_address
        .parse()
        .map_err(|e| anyhow::anyhow!("Invalid REGISTRY_CONTRACT_ADDRESS: {e}"))?;

    let researcher_addr: Address = researcher_address
        .parse()
        .map_err(|e| anyhow::anyhow!("Invalid researcher address '{researcher_address}': {e}"))?;

    let contract = IRegistry::new(registry_addr, provider);

    let pending = contract
        .verifyResearcher(researcher_addr)
        .send()
        .await
        .map_err(|e| anyhow::anyhow!("verifyResearcher send failed: {e}"))?;

    let tx_hash = pending
        .watch()
        .await
        .map_err(|e| anyhow::anyhow!("verifyResearcher watch failed: {e}"))?;

    tracing::info!(
        researcher = researcher_address,
        tx = %tx_hash,
        "verify_researcher confirmed on-chain"
    );

    Ok(())
}
