FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache python3 make g++ ffmpeg openssl

WORKDIR /app

# --- 1. Setup Evolution API ---
WORKDIR /app/evolution-api
COPY evolution-api/package*.json ./
COPY evolution-api/tsconfig.json ./
RUN npm ci

COPY evolution-api/src ./src
COPY evolution-api/prisma ./prisma
COPY evolution-api/runWithProvider.js ./
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

# --- 3. Setup Runner ---
WORKDIR /app
COPY start-all.sh ./
RUN chmod +x start-all.sh

# Expose the Railway Port (Railway sets $PORT, but we expose 3000 as default)
EXPOSE 3000

CMD ["./start-all.sh"]
