FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache python3 make g++ ffmpeg openssl dos2unix

WORKDIR /app

# --- 1. Build Frontend (Evolution Manager) ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY evolution-api/evolution-manager-v2/package*.json ./
RUN npm ci
COPY evolution-api/evolution-manager-v2 .
# Increase memory for build if needed
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# --- 2. Setup Evolution API (Backend) ---
FROM node:20-alpine AS backend-builder
WORKDIR /app/evolution-api
COPY evolution-api/package*.json ./
COPY evolution-api/tsconfig.json ./
RUN npm ci

COPY evolution-api/src ./src
COPY evolution-api/prisma ./prisma
COPY evolution-api/runWithProvider.js ./
COPY evolution-api/tsup.config.ts ./
RUN npm run db:generate
RUN npm run build

# --- 2. Setup Flowcore AI ---
WORKDIR /app/flowcore-ai
COPY flowcore-ai/package*.json ./
COPY flowcore-ai/tsconfig.json ./
RUN npm ci

COPY flowcore-ai/src ./src
RUN npm install typescript -g
RUN tsc

# --- 4. Setup Runner ---
WORKDIR /app
COPY start-all.sh ./
RUN dos2unix start-all.sh
RUN chmod +x start-all.sh

# Copy Frontend Build to API
WORKDIR /app/evolution-api
# Create directory structure just in case
RUN mkdir -p manager/dist
COPY --from=frontend-builder /app/frontend/dist ./manager/dist

# Expose the Railway Port (Railway sets $PORT, but we expose 3000 as default)
EXPOSE 3000

CMD ["/app/start-all.sh"]
