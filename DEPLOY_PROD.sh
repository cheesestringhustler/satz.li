#!/bin/bash

# Load SERVER_IP from .env file
source .env

echo "Starting deployment process..."

echo "Building Docker image..."
docker build --platform linux/arm64 -t satz.li:latest .

echo "Saving and transferring Docker image to server..."
docker save satz.li:latest | gzip | ssh root@$SERVER_IP docker load

echo "Starting the application on the server..."
ssh root@$SERVER_IP docker compose up -d satz.li

echo "Deployment completed successfully!"