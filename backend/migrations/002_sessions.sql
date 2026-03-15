-- DIU OS Backend — Sessions table
-- JWT sessions created after successful SIWE verification.

CREATE TABLE IF NOT EXISTS sessions (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Ethereum address of the authenticated user
    address         VARCHAR(42)  NOT NULL REFERENCES users(address) ON DELETE CASCADE,

    -- JWT token (stored for revocation support)
    token_hash      VARCHAR(64)  NOT NULL UNIQUE,

    -- Session metadata
    issued_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ  NOT NULL,
    revoked_at      TIMESTAMPTZ,

    -- Client info for audit
    user_agent      TEXT,
    ip_address      INET
);

-- Index for token lookups on every authenticated request
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions (token_hash);

-- Index for per-user session listing
CREATE INDEX IF NOT EXISTS idx_sessions_address ON sessions (address);

-- Auto-clean expired sessions (run via pg_cron or background job)
-- DELETE FROM sessions WHERE expires_at < NOW() OR revoked_at IS NOT NULL;
