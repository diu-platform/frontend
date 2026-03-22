-- DIU OS Backend — Chat usage rate limiting table
--
-- Tracks daily /api/chat requests per identifier.
-- identifier = IP address (anonymous) | address (SIWE) | orcid_id (ORCID)
--
-- Limits (enforced in application layer):
--   Anonymous  (IP)     : 5  requests / day
--   SIWE       (address): 10 requests / day
--   ORCID      (orcid)  : 20 requests / day

CREATE TABLE IF NOT EXISTS chat_usage (
    -- IP address or user identifier (max 128 chars covers IPv6 + orcid_id + address)
    identifier  VARCHAR(128) NOT NULL,

    -- UTC calendar date (one row per identifier per day)
    date        DATE         NOT NULL DEFAULT CURRENT_DATE,

    -- Number of successful /api/chat calls today
    count       INT          NOT NULL DEFAULT 0,

    PRIMARY KEY (identifier, date)
);

-- Index for cleanup of old rows (run periodically: DELETE WHERE date < NOW() - 7 days)
CREATE INDEX IF NOT EXISTS idx_chat_usage_date ON chat_usage (date);
