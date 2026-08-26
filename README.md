# Bun 1.4 Full-Stack Monorepo

A high-performance full-stack monorepo built with **Bun 1.4**, **React 19**, **Tailwind CSS**, and **Biome**. Compiles the backend HTTP server, REST APIs, and multiple micro-frontends into a single, self-contained standalone executable binary with zero external runtime dependencies.

---

## 🏛️ Architecture Overview

```
+-------------------------------------------------------------------------+
|                    Bun HTTP Server (@app/backend)                      |
|                                                                         |
|  +--------------------------+  +-------------------------------------+  |
|  |       REST API           |  |      Micro-Frontend Router          |  |
|  |  ----------------------  |  |  ---------------------------------  |  |
|  |  /api/health             |  |  /        -> Hub SPA (@app/hub)     |  |
|  |  /api/info               |  |  /store   -> Store MFE (@app/store) |  |
|  |  /api/items              |  |  /docs    -> Docs MFE (@app/docs)   |  |
|  |  /api/live-reload (dev)  |  |  /*       -> SPA Fallbacks          |  |
|  +--------------------------+  +-------------------------------------+  |
+-------------------------------------------------------------------------+
```

### Highlights & Key Features

- ⚡ **Bun 1.4 Native Tooling**: Fast package management, TypeScript execution, native bundling via `Bun.build`, and `bun:test` test runner.
- ⚛️ **React 19 with Native React Compiler**: Automatic component and hook memoization enabled directly in `Bun.build({ reactCompiler: true })` without Babel or SWC plugins.
- 🧩 **Multi-Micro-Frontend Architecture**: Host multiple independent SPAs (`hub`, `store`, `docs`) from a single origin with scoped routing and fallback support.
- 📦 **Single Standalone Executable Binary**: All frontend assets are bundled and embedded into the compiled binary via Bun's virtual filesystem (`--asset=mfes`).
- 🔄 **Resilient Live Reload (Dev Mode)**: Server-Sent Events (SSE) stream detects micro-frontend rebuilds with write-readiness polling, reconnection resilience, and asset error auto-recovery.
- 🐳 **Distroless Container Support**: Ultra-lightweight ~47MB container image using `gcr.io/distroless/cc-debian12`.

---

## 📋 Prerequisites

- [Bun](https://bun.sh) `v1.4.0` or higher

---

## 🚀 Quick Start

```bash
# 1. Install workspace dependencies
bun install

# 2. Start all packages in parallel watch mode (backend + micro-frontends + live reload)
bun run dev

# 3. Build all micro-frontends and compile the standalone executable
bun run build

# 4. Run the production binary executable
bun start
```

---

## 📦 Packages

| Package | Mount Route | Description |
| :--- | :--- | :--- |
| [`packages/backend`](./packages/backend) | `/api/*`, `/` | Bun HTTP server, REST API router, micro-frontend host & asset bundler |
| [`packages/hub`](./packages/hub) | `/` | Primary hub frontend displaying system telemetry, task management, and navigation |
| [`packages/store`](./packages/store) | `/store` | Independent Store micro-frontend SPA module |
| [`packages/docs`](./packages/docs) | `/docs` | Documentation micro-frontend SPA module |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and process uptime |
| `GET` | `/api/info` | Runtime metadata (Bun version, platform, arch, memory, standalone mode) |
| `GET` | `/api/items` | List all tasks from in-memory store |
| `POST` | `/api/items` | Create a new task item (`{ "title": string }`) |
| `PATCH` | `/api/items/:id` | Update task item completion or title |
| `DELETE` | `/api/items/:id` | Delete a task item by ID |
| `GET` | `/api/live-reload` | Server-Sent Events stream for development live reload (disabled in production) |

---

## 🛠️ Scripts Reference

| Command | Description |
| :--- | :--- |
| `bun run dev` | Start development servers and watchers across all packages in parallel |
| `bun run build` | Build all micro-frontends and compile the backend standalone binary |
| `bun start` | Execute the compiled standalone binary (`dist/server`) |
| `bun test` | Execute unit and integration tests across all packages |
| `bun run typecheck` | Perform strict TypeScript type checking (`tsc --noEmit`) |
| `bun run lint` | Check formatting and lint rules using Biome |
| `bun run lint:fix` | Automatically fix lint and formatting issues with Biome |
| `bun run format` | Format all source files with Biome |
| `bun run docker:build` | Build Docker container images |

---

## 🐳 Docker Deployment

Build and run using the multi-stage distroless Docker image:

```bash
# Build the Docker image
bun run docker:build

# Run the containerized server
bun run --filter @app/backend docker:run
```

