-- Add request-related columns to users table
ALTER TABLE users
ADD COLUMN requests_balance INTEGER NOT NULL DEFAULT 10;

-- Create requests_transactions table
CREATE TABLE requests_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
