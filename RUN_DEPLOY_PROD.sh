#!/bin/bash

# Load SERVER_IP from .env file
source .env

echo "Starting deployment process..."

# Create necessary directories on the server
ssh -i $SSH_KEY_PATH -p $SSH_PORT root@$SERVER_IP "if [ ! -d $ROOT_PATH/letsencrypt ]; then mkdir -p $ROOT_PATH/letsencrypt; fi"

echo "Building Docker image..."
if ! docker build --platform linux/arm64 -t satz.li:latest .; then
    echo "Docker build failed. Canceling deployment."
    exit 1
fi

echo "Saving and transferring Docker image to server..."
if ! docker save satz.li:latest | gzip | ssh -i $SSH_KEY_PATH -p $SSH_PORT root@$SERVER_IP docker load; then
    echo "Failed to transfer Docker image. Canceling deployment."
    exit 1
fi

echo "Transferring compose.yaml and .env to server..."
if ! scp -i $SSH_KEY_PATH -P $SSH_PORT ./$COMPOSE_FILE ./$ENV_FILE root@$SERVER_IP:$ROOT_PATH/; then
    echo "Failed to transfer configuration files. Canceling deployment."
    exit 1
fi

echo "Starting the application on the server..."
if ! ssh -i $SSH_KEY_PATH -p $SSH_PORT root@$SERVER_IP \
"docker compose -f $ROOT_PATH/$COMPOSE_FILE down && \
docker compose --env-file $ROOT_PATH/$ENV_FILE -f $ROOT_PATH/$COMPOSE_FILE up -d"; then
    echo "Failed to start application on server. Canceling deployment."
    exit 1
fi

echo "Deployment completed successfully!"