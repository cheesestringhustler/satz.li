#!/bin/bash

source .env.local

# Function to show usage
show_usage() {
    echo "Usage: ./RUN_DEV.sh"
    echo "This script runs the full development environment in Docker containers"
}

# Start Stripe webhook listener and wait for it to be ready
echo "Starting Stripe webhook listener..."
stripe listen --forward-to localhost:3000/api/webhook/stripe 2>&1 &
STRIPE_PID=$!
sleep 3

# Run everything in Docker
echo "Running development environment in Docker..."
docker compose -f compose.dev.yaml down && \
docker compose --env-file=.env.local -f compose.dev.yaml up --build

# Cleanup: Kill Stripe webhook listener when script exits
trap "kill \$STRIPE_PID 2>/dev/null || true" EXIT