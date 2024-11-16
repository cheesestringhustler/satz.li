-- Enable psql variable substitution
\set ON_ERROR_STOP on

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create user if doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = :'POSTGRES_USER') THEN
        EXECUTE format('CREATE USER %I WITH PASSWORD %L', 
            :'POSTGRES_USER', 
            :'POSTGRES_PASSWORD'
        );
    END IF;
END
$$;

-- Grant privileges
EXECUTE format('GRANT ALL PRIVILEGES ON DATABASE %I TO %I', 
    :'POSTGRES_DB', 
    :'POSTGRES_USER'
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO :"POSTGRES_USER";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO :"POSTGRES_USER";

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO :"POSTGRES_USER";

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON SEQUENCES TO :"POSTGRES_USER";

-- Create base tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
