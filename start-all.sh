#!/bin/bash

echo "Starting Evolution Lab - All Services"

# Start Evolution API in background
echo "Starting Evolution API on port 8080..."
cd evolution-api
npm run start:prod &
EVOLUTION_PID=$!
echo "Evolution API PID: $EVOLUTION_PID"

# Wait for Evolution API to initialize
sleep 5

# Start Flowcore AI
echo "Starting Flowcore AI on port 3000..."
cd ../flowcore-ai
npm start &
FLOWCORE_PID=$!
echo "Flowcore AI PID: $FLOWCORE_PID"

echo "All services started!"
echo "Evolution API: http://localhost:8080"
echo "Flowcore AI: http://localhost:3000"
echo "Manager UI: http://localhost:3000/manager"

# Keep script running and wait for both processes
wait $EVOLUTION_PID $FLOWCORE_PID
