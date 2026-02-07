#!/bin/sh

# 1. Start Evolution API (Background)
# Force port 8080 for internal API
export SERVER_PORT=8080
export SERVER_URL=http://localhost:8080
echo "Starting Evolution API on port 8080..."
cd /app/evolution-api
# Run with increased memory limit (scoped to this process only)
NODE_OPTIONS="--max-old-space-size=2048" npm run start:prod &

# 2. Start Flowcore AI (Foreground)
# Railway will provide PORT. Flowcore AI must listen on it.
echo "Starting Flowcore AI on port $PORT..."
cd /app/flowcore-ai
# Unset NODE_OPTIONS to avoid conflicts
unset NODE_OPTIONS
node dist/server.js
