# Production Dockerfile for Autonomus Market Research Agent
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci

# Copy frontend source code and build
COPY frontend/ ./
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner
WORKDIR /app/frontend

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/frontend/package*.json ./
COPY --from=builder /app/frontend/dist ./dist
COPY --from=builder /app/frontend/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
