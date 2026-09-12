# Multi-stage Dockerfile for MindCare
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy application sources
COPY . .

# Compile frontend and backend bundles into dist/
RUN npm run build

# Stage 2: Lightweight Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled bundles and static assets from builder
COPY --from=builder /app/dist ./dist

# Use non-root node user for security
USER node

EXPOSE 3000

# Container Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/api/health || exit 1

# Start the bundled MindCare server
CMD ["node", "dist/server.cjs"]
