# @app/backend

The core backend package for the **Bun 1.4 Full-Stack Monorepo**. It serves as the HTTP server, REST API router, multi-micro-frontend host, development live-reload broker, and standalone single executable binary compiler.

---

## 🚀 Key Responsibilities

- **High-Performance HTTP Server**: Powered by `Bun.serve` for fast request processing and zero-overhead static asset streaming.
- **RESTful API Router**: Modular API handlers for health checks, runtime telemetry, and task item CRUD operations.
- **Multi-Micro-Frontend Host**: Scoped static file resolution and SPA fallback handling for `@app/hub`, `@app/store`, and `@app/docs`.
- **Standalone Binary Compilation**: Orchestrates building all micro-frontends and bundling the full-stack into a single binary executable (`dist/server`) with assets embedded in Bun's virtual filesystem (`--asset=mfes`).
- **Resilient Development Live Reload**: Server-Sent Events (SSE) stream (`/api/live-reload`) with bundle write-readiness polling, reconnection resilience, and asset error auto-recovery.
- **Distroless Container Support**: Ultra-lean ~47MB multi-stage Docker image built on `gcr.io/distroless/cc-debian12`.

---

## 📁 Directory Structure

```
packages/backend/
├── build.ts              # Standalone binary compiler script (stages MFEs and runs bun build --compile)
├── Dockerfile            # Multi-stage distroless Docker configuration
├── package.json          # Package manifest and workspace scripts
├── tsconfig.json         # TypeScript configuration with @/* path aliases
├── src/
│   ├── index.ts          # Server entrypoint and createServer() factory
│   ├── index.test.ts     # Integration tests with bun:test
│   ├── types.ts          # TypeScript interfaces (ServerInfo, Item, ServerOptions)
│   ├── api/              # Modular API route handlers
│   │   ├── index.ts      # API router dispatcher and CORS preflight handler
│   │   ├── health.ts     # GET /api/health handler
│   │   ├── info.ts       # GET /api/info telemetry handler
│   │   ├── live-reload.ts# GET /api/live-reload SSE handler
│   │   └── routers/
│   │       └── items.ts  # CRUD handlers for /api/items and /api/items/:id
│   └── lib/              # Server libraries & helpers
│       ├── cors.ts       # CORS headers and jsonResponse helper
│       ├── live-reload.ts# LiveReloadManager and safe script injector
│       └── mfe.ts        # Micro-frontend resolution & virtual asset resolver
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, timestamp, and process uptime | `200 OK` |
| `GET` | `/api/info` | Server runtime metadata (Bun version, platform, arch, standalone mode, memory) | `200 OK` |
| `GET` | `/api/items` | List all task items from in-memory store | `200 OK` |
| `POST` | `/api/items` | Create new task item (`{ "title": string }`) | `201 Created` |
| `PATCH` | `/api/items/:id` | Update task item completion or title | `200 OK` |
| `DELETE` | `/api/items/:id` | Delete a task item by ID | `200 OK` |
| `GET` | `/api/live-reload` | Server-Sent Events stream for development live reload (disabled in production) | `200 OK` (SSE) |
| `OPTIONS` | `/*` | CORS preflight handling for cross-origin API access | `200 OK` / `204 No Content` |

---

## 🛠️ Scripts Reference

| Command | Description |
| :--- | :--- |
| `bun run build` | Builds all micro-frontends into `dist/mfes/` and compiles the standalone binary `dist/server` |
| `bun run dev` | Runs the backend server in watch mode using `bun --watch src/index.ts` |
| `bun start` | Executes the compiled standalone binary (`dist/server`) |
| `bun test` | Runs the integration test suite using `bun:test` |
| `bun run docker:build` | Builds the multi-stage distroless Docker image (`app-backend`) |
| `bun run docker:run` | Runs the containerized application mapped to `localhost:3000` |

---

## 📦 Standalone Binary Compilation

When running `bun run build`, `build.ts` performs the following steps:
1. Builds all micro-frontends (`@app/hub`, `@app/store`, `@app/docs`) via `Bun.build`.
2. Stages each micro-frontend's `dist/` artifacts under `packages/backend/dist/mfes/<route>/`.
3. Invokes the Bun compiler:
   ```bash
   bun build --compile --minify --bytecode --define process.env.NODE_ENV='"production"' --asset=mfes --outfile=server ../src/index.ts
   ```
4. Produces a self-contained executable binary `packages/backend/dist/server` capable of running independently without Node.js, Bun, or external node_modules installed.
