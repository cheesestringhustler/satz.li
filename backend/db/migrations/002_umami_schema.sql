-- Create umami schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS umami;

-- Set default privileges
GRANT ALL PRIVILEGES ON SCHEMA umami TO CURRENT_USER;

-- Create umami tables in the umami schema
SET search_path TO umami;

-- Note: The actual umami tables will be created by the umami application itself
-- This migration just sets up the schema and permissions
