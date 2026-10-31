FROM node:20-alpine
WORKDIR /app

# Copy production backend dependencies and compiled code
WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/node_modules ./node_modules
COPY backend/dist ./dist
RUN mkdir -p /app/backend/data

# Copy static frontend build for Express to serve
WORKDIR /app
COPY frontend/dist ./frontend/dist

WORKDIR /app/backend
ENV PORT=3000
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/backend/data/leads.db

EXPOSE 3000

CMD ["node", "dist/server.js"]
