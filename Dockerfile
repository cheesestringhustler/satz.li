# Use Node.js image for frontend build and Deno image for backend
FROM node:20-alpine AS frontend-builder

# Set the working directory for frontend
WORKDIR /app/frontend

# Copy frontend files and build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Use Deno image for backend and final image
FROM denoland/deno:2.0.2 AS backend-builder

# Set up the backend
WORKDIR /app/backend
COPY backend ./

# Cache the dependencies and compile the main app
RUN deno cache main.ts
RUN deno compile --allow-net --allow-read --allow-env --output main main.ts

# Start a new stage for the final image
FROM denoland/deno:2.0.2

WORKDIR /app

# Copy only the necessary artifacts from the builder stages
COPY --from=backend-builder /app/backend/main ./
COPY --from=backend-builder /app/backend/.env ./
COPY --from=frontend-builder /app/frontend/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Run the compiled app
CMD ["./main"]
