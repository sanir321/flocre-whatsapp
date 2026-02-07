#!/bin/sh

# 1. Start Evolution API (Background)
# Force port 8080 for internal API
export SERVER_PORT=8080
export SERVER_URL=http://localhost:8080
echo "Starting Evolution API on port 8080..."
cd /app/evolution-api
npm run start:prod > /app/evolution-api.log 2>&1 &

# 2. Wait for API to be ready (optional, but good practice)
# We just simply wait a few seconds or proceed.
sleep 10

# 3. Start Flowcore AI (Foreground)
# Railway will provide PORT (e.g. 80 or 3000 or random)
# Flowcore AI must listen on $PORT
echo "Starting Flowcore AI on port $PORT..."
cd /app/flowcore-ai
node dist/server.js
