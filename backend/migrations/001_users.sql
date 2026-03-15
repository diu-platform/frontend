-- DIU OS Backend — Users table
-- Mirrors on-chain DIURegistry: one row per Ethereum address.
-- Source of truth for off-chain metadata and session management.

CREATE TABLE IF NOT EXISTS users (
    -- Ethereum address, lowercase, 0x-prefixed (42 chars)
    address         VARCHAR(42)  PRIMARY KEY,

    -- IPFS/Arweave metadata URI (mirrors registry.metadata_uri)
    metadata_uri    TEXT,

    -- ORCID identifier as entered by user (format validated on-chain)
    orcid_id        VARCHAR(19),

    -- Whether a backend admin has verified this researcher
    -- Mirrors on-chain registry.is_verified flag
    is_verified     BOOLEAN      NOT NULL DEFAULT FALSE,

    -- When this row was first created (UTC)
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- Last profile update (UTC)
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for ORCID lookups (orcid_verifier worker)
CREATE INDEX IF NOT EXISTS idx_users_orcid_id ON users (orcid_id)
    WHERE orcid_id IS NOT NULL;

-- Trigger: keep updated_at current
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
