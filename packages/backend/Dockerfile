# Multi-stage Distroless Dockerfile for @app/backend
# ------------------------------------------------------------------------------
# Stage 1: Build standalone binary with embedded micro-frontends
# ------------------------------------------------------------------------------
FROM oven/bun:1.4 AS builder
WORKDIR /app

# Copy monorepo manifests and lockfile for workspace dependency resolution
COPY package.json bun.lock bunfig.toml ./
COPY packages/ ./packages/

# Install workspace dependencies
RUN bun install --frozen-lockfile

# Compile backend binary (automatically discovers, builds & embeds all micro-frontends)
RUN bun run --filter @app/backend build

# ------------------------------------------------------------------------------
# Stage 2: Distroless Minimal Runtime Image (~47MB)
# ------------------------------------------------------------------------------
FROM gcr.io/distroless/cc-debian12

# Copy only the compiled standalone binary from backend dist folder
COPY --from=builder /app/packages/backend/dist/server /server

ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["/server"]
