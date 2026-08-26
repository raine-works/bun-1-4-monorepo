# Bun Monorepo

A lightweight full-stack monorepo built with **Bun**, **React 19**, and **Biome**. Compiles the backend and all micro-frontends into a single, self-contained standalone binary.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development (hot reload)
bun run dev

# Build standalone binary
bun run build

# Run production binary
bun start
```

## 📦 Packages

| Package | Description | Route |
| :--- | :--- | :--- |
| [`packages/backend`](./packages/backend) | Bun HTTP server & API | `/api/*` |
| [`packages/hub`](./packages/hub) | Main Hub frontend | `/` |
| [`packages/store`](./packages/store) | Store micro-frontend | `/store` |
| [`packages/docs`](./packages/docs) | Documentation micro-frontend | `/docs` |

## 🛠️ Scripts

| Command | Description |
| :--- | :--- |
| `bun run dev` | Start development servers with live reload |
| `bun run build` | Build micro-frontends and compile standalone binary |
| `bun start` | Run the compiled standalone binary |
| `bun test` | Run all tests concurrently |
| `bun run typecheck` | Typecheck TypeScript across all packages |
| `bun run lint` | Lint and check formatting with Biome |
| `bun run lint:fix` | Auto-fix lint and formatting issues |

## 🐳 Docker

```bash
# Build and run the minimal distroless container
bun run --filter @app/backend docker:build
bun run --filter @app/backend docker:run
```
