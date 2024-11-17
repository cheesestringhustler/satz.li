#!/bin/bash

# Function to show usage
show_usage() {
    echo "Usage: ./RUN_DEV.sh"
    echo "This script runs the full development environment in Docker containers"
}

# Start Stripe webhook listener in background
echo "Starting Stripe webhook listener..."
stripe listen --forward-to localhost:3000/api/webhook/stripe &
STRIPE_PID=$!

# Run everything in Docker
echo "Running development environment in Docker..."
docker compose -f compose.dev.yaml down && \
docker compose --env-file=.env.local -f compose.dev.yaml up --build

# Cleanup: Kill Stripe webhook listener when script exits
trap "kill \$STRIPE_PID 2>/dev/null || true" EXIT