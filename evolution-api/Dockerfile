FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies for building
RUN apk add --no-cache python3 make g++

# Files are relative to the 'evolution-api' folder now
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

COPY src ./src
COPY prisma ./prisma
COPY runWithProvider.js ./

# Generate Prisma Client
RUN npm run db:generate

# Build the application
RUN npm run build

# --- Production Image ---
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache ffmpeg openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/runWithProvider.js ./

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
