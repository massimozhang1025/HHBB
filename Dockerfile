# ═══════════════════════════════════════════════
# Stage 1: Build the frontend
# ═══════════════════════════════════════════════
FROM node:20-alpine AS frontend-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ═══════════════════════════════════════════════
# Stage 2: Production server
# ═══════════════════════════════════════════════
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -g 1001 -S hhbb && adduser -S hhbb -u 1001

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source
COPY server/ ./server/

# Copy built frontend into place
COPY --from=frontend-build /app/client/dist ./client/dist

# Set ownership
RUN chown -R hhbb:hhbb /app

USER hhbb

# Environment
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:10000/api/health || exit 1

CMD ["node", "server/src/app.js"]
