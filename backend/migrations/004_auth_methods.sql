-- DIU OS Backend — Auth methods extension
--
-- Adds login_method and email columns to the users table.
-- Also widens address columns to accommodate non-Ethereum identifiers:
--   SIWE:  "0x..." (42 chars)
--   ORCID: "orcid:XXXX-XXXX-XXXX-XXXX" (25 chars)
-- VARCHAR(64) covers all current and planned auth methods.

-- Widen address to accept ORCID synthetic identifiers
ALTER TABLE users
    ALTER COLUMN address TYPE VARCHAR(64);

ALTER TABLE sessions
    ALTER COLUMN address TYPE VARCHAR(64);

-- Authentication method used to create this user row.
-- 'siwe'  — Sign-In with Ethereum (wallet)
-- 'orcid' — ORCID OAuth 2.0
-- 'email' — magic-link (Phase 3, not yet implemented)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS login_method VARCHAR(10) NOT NULL DEFAULT 'siwe';

-- Email address for magic-link auth (Phase 3).
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Unique index on email (sparse — only rows where email IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
    ON users (email)
    WHERE email IS NOT NULL;
