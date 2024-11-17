#!/bin/bash

# Load SERVER_IP from .env file
source .env

echo "Starting deployment process..."

# Create necessary directories on the server
ssh -i $SSH_KEY_PATH -p $SSH_PORT root@$SERVER_IP "if [ ! -d $ROOT_PATH/letsencrypt ]; then mkdir -p $ROOT_PATH/letsencrypt; fi"

echo "Building Docker image..."
docker build --platform linux/arm64 -t satz.li:latest .

echo "Saving and transferring Docker image to server..."
docker save satz.li:latest | gzip | ssh -i $SSH_KEY_PATH -p $SSH_PORT root@$SERVER_IP docker load

echo "Transferring compose.yaml and .env to server..."
scp -i $SSH_KEY_PATH -P $SSH_PORT ./$COMPOSE_FILE ./$ENV_FILE root@$SERVER_IP:$ROOT_PATH/

echo "Starting the application on the server..."
ssh -i $SSH_KEY_PATH -p $SSH_PORT root@$SERVER_IP \
"docker compose -f $ROOT_PATH/$COMPOSE_FILE down && \
docker compose --env-file $ROOT_PATH/$ENV_FILE -f $ROOT_PATH/$COMPOSE_FILE up -d"

echo "Deployment completed successfully!"