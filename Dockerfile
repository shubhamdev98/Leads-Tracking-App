# Multi-stage Dockerfile for Lead Management Portal

# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache libstdc++

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled files and views/public
COPY --from=builder /app/dist ./dist
COPY src/views ./dist/views
COPY src/public ./dist/public

# Create data directory for SQLite volume
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/server.js"]
