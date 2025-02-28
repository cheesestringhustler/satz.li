-- Set search path at the beginning
SET search_path TO app;

-- Enable UUID extension in public schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

------------------
-- Core Tables --
------------------

-- Users table - core user information
CREATE TABLE app.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    credits_balance INTEGER DEFAULT 100,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Authentication tables
CREATE TABLE app.jwt_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app.users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revocation_reason VARCHAR(255)
);

CREATE TABLE app.magic_link_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(500) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45)  -- IPv6 compatible
);

------------------
-- Usage Tables --
------------------

-- Track all API usage
CREATE TABLE app.usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app.users(id) ON DELETE SET NULL,
    request_type VARCHAR(50) NOT NULL, -- 'optimization', 'language_detection', etc.
    model_type VARCHAR(50) NOT NULL,   -- 'gpt-4', 'gpt-3.5-turbo', etc.
    input_tokens INTEGER NOT NULL,
    output_tokens INTEGER NOT NULL,
    credits_used INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'completed',
    error_message TEXT,
    request_ip VARCHAR(45),
    response_time INTEGER -- in milliseconds
);

-- Track credit changes
CREATE TABLE app.credits_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- positive for additions, negative for usage
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'usage', 'bonus', 'refund'
    reference_id VARCHAR(255), -- can reference usage_logs.id or an external payment ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

------------------
-- Indices --
------------------

-- Authentication indices
CREATE UNIQUE INDEX idx_unique_valid_token 
ON app.jwt_tokens (user_id, token) 
WHERE NOT revoked;

CREATE INDEX idx_jwt_tokens_user_id ON app.jwt_tokens(user_id);
CREATE INDEX idx_jwt_tokens_token ON app.jwt_tokens(token);
CREATE INDEX idx_magic_link_tokens_token ON app.magic_link_tokens(token);
CREATE INDEX idx_magic_link_tokens_email ON app.magic_link_tokens(email);

-- Usage indices
CREATE INDEX idx_usage_logs_user_id ON app.usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON app.usage_logs(created_at);
CREATE INDEX idx_usage_logs_request_type ON app.usage_logs(request_type);
CREATE INDEX idx_credits_transactions_user_id ON app.credits_transactions(user_id);
CREATE INDEX idx_credits_transactions_created_at ON app.credits_transactions(created_at);

------------------
-- Views --
------------------

CREATE VIEW app.active_tokens AS
SELECT * FROM app.jwt_tokens 
WHERE NOT revoked 
AND expires_at > CURRENT_TIMESTAMP;

CREATE VIEW app.user_usage_stats AS
SELECT 
    u.id as user_id,
    u.email,
    u.credits_balance,
    COUNT(l.id) as total_requests,
    SUM(l.input_tokens) as total_input_tokens,
    SUM(l.output_tokens) as total_output_tokens,
    SUM(l.credits_used) as total_credits_used,
    MAX(l.created_at) as last_request_at,
    COUNT(CASE WHEN l.created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 1 END) as requests_last_24h
FROM app.users u
LEFT JOIN app.usage_logs l ON u.id = l.user_id
GROUP BY u.id, u.email, u.credits_balance;

CREATE VIEW app.monthly_usage_stats AS
SELECT 
    DATE_TRUNC('month', l.created_at) as month,
    u.email,
    COUNT(l.id) as total_requests,
    SUM(l.input_tokens) as total_input_tokens,
    SUM(l.output_tokens) as total_output_tokens,
    SUM(l.credits_used) as total_credits_used,
    AVG(l.response_time) as avg_response_time
FROM app.users u
JOIN app.usage_logs l ON u.id = l.user_id
GROUP BY DATE_TRUNC('month', l.created_at), u.id, u.email
ORDER BY month DESC, total_credits_used DESC;

CREATE VIEW app.daily_usage_stats AS
SELECT 
    DATE_TRUNC('day', l.created_at) as day,
    COUNT(*) as total_requests,
    COUNT(DISTINCT l.user_id) as unique_users,
    SUM(l.credits_used) as total_credits_used,
    AVG(l.response_time) as avg_response_time,
    SUM(CASE WHEN l.status != 'completed' THEN 1 ELSE 0 END) as error_count
FROM app.usage_logs l
GROUP BY DATE_TRUNC('day', l.created_at)
ORDER BY day DESC;

------------------
-- Functions --
------------------

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION app.cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    -- Delete expired magic link tokens older than 24 hours
    DELETE FROM app.magic_link_tokens 
    WHERE (expires_at < CURRENT_TIMESTAMP AND created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours')
    OR (used = true AND created_at < CURRENT_TIMESTAMP - INTERVAL '7 days');

    -- Mark expired JWT tokens as revoked
    UPDATE app.jwt_tokens 
    SET revoked = true,
        revoked_at = CURRENT_TIMESTAMP,
        revocation_reason = 'expired'
    WHERE NOT revoked 
    AND expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to get user credits balance
CREATE OR REPLACE FUNCTION app.get_user_credits_balance(user_id_param INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT credits_balance FROM app.users WHERE id = user_id_param);
END;
$$ LANGUAGE plpgsql;

-- Set default privileges for the new schema
ALTER DEFAULT PRIVILEGES IN SCHEMA app
    GRANT ALL PRIVILEGES ON TABLES TO CURRENT_USER;

ALTER DEFAULT PRIVILEGES IN SCHEMA app
    GRANT ALL PRIVILEGES ON SEQUENCES TO CURRENT_USER;

ALTER DEFAULT PRIVILEGES IN SCHEMA app
    GRANT ALL PRIVILEGES ON FUNCTIONS TO CURRENT_USER;