# @app/backend

The core backend package for the **Bun 1.4 Full-Stack Monorepo**. It provides a high-performance HTTP server powered by **Hono** and `Bun.serve`, type-safe REST API routing with **@hono/zod-validator**, multi-micro-frontend hosting, end-to-end typed **Hono RPC Client** integration, development live-reload brokering, and standalone single executable binary compilation.

---

## 🚀 Key Responsibilities

- **High-Performance HTTP Server**: Powered by `Bun.serve` and `Hono` for lightning-fast request dispatching, middleware pipelines, and zero-overhead static asset streaming.
- **Type-Safe RESTful API Routing (Hono + Zod)**: Modular sub-routers (`/api/health`, `/api/info`, `/api/users`, `/api/items`, `/api/live-reload`) with compile-time type validation via `@hono/zod-validator`.
- **End-to-End Type-Safe Hono RPC Client**: Exports `type AppType = typeof app` and typed client factory (`createApiClient`, `client`) for full TypeScript autocompletion and type safety in frontend micro-frontends without code generation.
- **Multi-Micro-Frontend Host**: Scoped static file resolution and SPA fallback handling for `@app/hub`, `@app/store`, and `@app/docs`.
- **Standalone Binary Compilation**: Orchestrates building all micro-frontends and bundling the full-stack into a single binary executable (`dist/server`) with assets embedded in Bun's virtual filesystem (`--asset=mfes`).
- **Resilient Development Live Reload**: Server-Sent Events (SSE) stream (`/api/live-reload`) with bundle write-readiness polling, reconnection resilience, and asset error auto-recovery.
- **Distroless Container Support**: Ultra-lean ~47MB multi-stage Docker image built on `gcr.io/distroless/cc-debian12`.

---

## 📁 Directory Structure

```
packages/backend/
├── Dockerfile            # Multi-stage distroless Docker configuration
├── package.json          # Package manifest and workspace scripts
├── tsconfig.json         # TypeScript configuration with @/* path aliases
├── scripts/
│   └── build.ts          # Standalone binary compiler script (stages MFEs and runs bun build --compile)
├── src/
│   ├── index.ts          # Hono root app, createApp(), createServer(), and default export
│   ├── index.test.ts     # Integration test suite with bun:test and Hono RPC client
│   ├── rpc.ts            # Hono RPC client factory and singleton client instance
│   ├── types.ts          # TypeScript interfaces, ServerVariables, and Zod DTO contracts
│   ├── routers/          # Modular Hono API sub-routers
│   │   ├── index.ts      # Unified apiRouter combining all sub-routes
│   │   ├── health.ts     # GET /api/health Hono sub-router
│   │   ├── info.ts       # GET /api/info telemetry Hono sub-router
│   │   ├── items.ts      # CRUD Hono sub-router with zValidator for /api/items
│   │   ├── live-reload.ts# GET /api/live-reload SSE Hono sub-router
│   │   └── users.ts      # CRUD Hono sub-router with zValidator for /api/users
│   └── lib/              # Server utility libraries
│       ├── cors.ts       # Standard CORS headers configuration
│       ├── env.ts        # Zod-validated environment schema
│       ├── live-reload.ts# LiveReloadManager and safe script injector
│       └── mfe.ts        # Micro-frontend resolution & virtual asset resolver
```

---

## 🔌 API Endpoints (Powered by Hono)

| Method | Endpoint | Description | Request Validation | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, timestamp, and uptime | None | `200 OK` |
| `GET` | `/api/info` | Runtime metadata (Bun version, platform, arch, standalone mode, memory) | None | `200 OK` |
| `GET` | `/api/users` | List users with optional filtering | `userFilterSchema` (`?role=...&search=...`) | `200 OK` |
| `POST` | `/api/users` | Create a new user | `createUserSchema` (`{ email, name, role?, avatarUrl? }`) | `201 Created` / `409 Conflict` |
| `GET` | `/api/users/:id` | Get user by ID | None | `200 OK` / `404 Not Found` |
| `PATCH` | `/api/users/:id` | Update user fields | `updateUserSchema` | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/users/:id` | Delete user by ID | None | `200 OK` / `404 Not Found` |
| `GET` | `/api/items` | List all task items | `itemFilterSchema` | `200 OK` |
| `POST` | `/api/items` | Create new task item | `createItemSchema` (`{ title: string }`) | `201 Created` / `400 Bad Request` |
| `GET` | `/api/items/:id` | Get task item by ID | None | `200 OK` / `404 Not Found` |
| `PATCH` | `/api/items/:id` | Update task item | `updateItemSchema` (`{ title?, completed? }`) | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/items/:id` | Delete task item by ID | None | `200 OK` / `404 Not Found` |
| `GET` | `/api/live-reload` | Server-Sent Events stream for dev live reload (disabled in production) | None | `200 OK` (SSE) |
| `OPTIONS` | `/*` | Global CORS preflight handling via `hono/cors` | None | `204 No Content` |

---

## ⚡ Hono RPC Client Usage

Frontend micro-frontends (`@app/hub`, `@app/store`, `@app/docs`) interact with backend endpoints using the typed Hono RPC client:

```tsx
import { client } from '@/lib/api'; // or import { client } from '@app/backend/rpc';

// Type-safe GET request
const res = await client.api.items.$get();
const data = await res.json(); // Typed as { items: Item[] }

// Type-safe POST with JSON payload
const createRes = await client.api.items.$post({
  json: { title: 'Implement feature' },
});
const createdItem = await createRes.json();

// Type-safe parameterized route
const updateRes = await client.api.items[':id'].$patch({
  param: { id: 'task-123' },
  json: { completed: true },
});
```

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
