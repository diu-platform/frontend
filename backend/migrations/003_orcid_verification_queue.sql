-- DIU OS Backend — ORCID Verification Queue (ADR D-030 / D-031)
--
-- Flow: OrcidLinked event → INSERT pending row →
--       orcid_verifier worker polls → pub.orcid.org/v3.0 →
--       verify_researcher() on-chain call → status = verified|rejected

CREATE TYPE orcid_status AS ENUM ('pending', 'verified', 'rejected', 'failed');

CREATE TABLE IF NOT EXISTS orcid_verification_queue (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Ethereum address that called link_orcid()
    address         VARCHAR(42)     NOT NULL REFERENCES users(address) ON DELETE CASCADE,

    -- ORCID identifier to verify (format already validated on-chain)
    orcid_id        VARCHAR(19)     NOT NULL,

    -- Current verification status
    status          orcid_status    NOT NULL DEFAULT 'pending',

    -- Number of verification attempts made
    attempts        SMALLINT        NOT NULL DEFAULT 0,

    -- When the next attempt should be made (exponential backoff)
    -- NULL = retry immediately
    next_retry_at   TIMESTAMPTZ,

    -- Timestamps
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Error detail from last failed attempt (for debugging)
    last_error      TEXT,

    -- Unique: one pending/verified row per address
    CONSTRAINT uq_orcid_queue_address UNIQUE (address)
);

-- Index: worker polls for pending jobs ready to process
CREATE INDEX IF NOT EXISTS idx_orcid_queue_pending
    ON orcid_verification_queue (next_retry_at)
    WHERE status = 'pending';

-- Index: lookup by ORCID string (duplicate detection)
CREATE INDEX IF NOT EXISTS idx_orcid_queue_orcid_id
    ON orcid_verification_queue (orcid_id);

-- Trigger: keep updated_at current
CREATE TRIGGER orcid_queue_updated_at
    BEFORE UPDATE ON orcid_verification_queue
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
