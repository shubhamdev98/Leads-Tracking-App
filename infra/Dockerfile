FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --include=dev

COPY frontend/ ./
RUN npm run build

FROM nginx:alpine AS frontend-standalone
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --include=dev

COPY backend/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/backend/data/leads.db

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY --from=backend-builder /app/backend/dist ./dist
RUN mkdir -p /app/backend/data

WORKDIR /app
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend
EXPOSE 3000

CMD ["node", "dist/server.js"]
