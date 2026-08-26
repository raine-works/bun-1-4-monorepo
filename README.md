# Bun 1.4 Full-Stack Monorepo

A high-performance full-stack monorepo built with **Bun 1.4**, **React 19**, **TanStack Router**, **Tailwind CSS v4**, and **Biome**. Compiles the backend HTTP server, REST APIs, and multiple micro-frontends into a single, self-contained standalone executable binary with zero external runtime dependencies.

---

## 🏛️ Architecture Overview

```
+---------------------------------------------------------------------------------------------------+
|                                  Bun HTTP Server (@app/backend)                                   |
|                                                                                                   |
|  +--------------------------------------------+  +---------------------------------------------+  |
|  |                 REST API                   |  |          Micro-Frontend Router (Host)       |  |
|  |  ----------------------------------------  |  |  -----------------------------------------  |  |
|  |  GET    /api/health                        |  |  /        -> Hub SPA (@app/hub)             |  |
|  |  GET    /api/info                          |  |             - TanStack Router (/)           |  |
|  |  GET    /api/items                         |  |             - /tasks, /about, 404           |  |
|  |  POST   /api/items                         |  |  /store   -> Store MFE (@app/store)         |  |
|  |  PATCH  /api/items/:id                     |  |             - TanStack Router (/store)      |  |
|  |  DELETE /api/items/:id                     |  |             - /store/cart, /deals, 404      |  |
|  |  GET    /api/live-reload (Dev SSE)         |  |  /docs    -> Docs MFE (@app/docs)           |  |
|  |  OPTIONS /* (CORS Preflight)               |  |             - TanStack Router (/docs)       |  |
|  |                                            |  |             - /docs/guides, /api, 404       |  |
|  |                                            |  |  /*       -> SPA Fallback to Shell          |  |
|  +--------------------------------------------+  +---------------------------------------------+  |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |               Single Standalone Executable Binary (Bun Virtual Filesystem)                  |  |
|  |               bun build --compile --minify --bytecode --asset=mfes                          |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

### Highlights & Key Features

- ⚡ **Bun 1.4 Native Tooling**: Fast package management with catalog dependencies, TypeScript execution, native bundling via `Bun.build`, and fast `bun:test` test runner.
- ⚛️ **React 19 with Native React Compiler**: Automatic component and hook memoization enabled directly via `Bun.build({ reactCompiler: true })` without Babel or SWC plugins.
- 🚦 **TanStack Router in Every Micro-Frontend**: Type-safe client-side routing with nested layouts, deep linking, active link states, and scoped basepaths (`/`, `/store`, `/docs`).
- 🧩 **Multi-Micro-Frontend Architecture**: Host multiple independent SPAs (`hub`, `store`, `docs`) from a single origin with scoped static asset routing and SPA fallback support.
- 📦 **Single Standalone Executable Binary**: All frontend assets are bundled and embedded into the compiled binary via Bun's virtual filesystem (`--asset=mfes`), producing a single portable executable with zero runtime dependencies.
- 🔄 **Resilient Live Reload (Dev Mode)**: Server-Sent Events (SSE) stream detects micro-frontend rebuilds with write-readiness polling, reconnection resilience, and asset error auto-recovery (cleanly disabled in production).
- 🎨 **Tailwind CSS v4**: Fast modern styling using `bun-plugin-tailwind` and `@import "tailwindcss"` with zero complex CSS toolchains.
- 🧹 **Biome Formatting & Linting**: Ultra-fast linting and code formatting configured monorepo-wide.
- 🐳 **Distroless Container Support**: Ultra-lightweight ~47MB container image using `gcr.io/distroless/cc-debian12`.

---

## 📁 Monorepo Structure

```
bun-1-4-monorepo/
├── biome.json                     # Biome linting and formatting rules
├── bun.lock                       # Unified lockfile for monorepo workspace
├── bunfig.toml                    # Bun configuration and package catalog definitions
├── package.json                   # Root workspace manifest and orchestrator scripts
├── tsconfig.json                  # Monorepo root TypeScript configuration
├── packages/
│   ├── backend/                   # Bun HTTP Server & Standalone Binary Compiler
│   │   ├── .env.example           # Environment template for local dev (.env.local)
│   │   ├── Dockerfile             # Multi-stage distroless Docker configuration
│   │   ├── package.json           # Backend package manifest
│   │   ├── tsconfig.json          # Backend TypeScript configuration (@/* aliases)
│   │   ├── scripts/
│   │   │   └── build.ts           # Standalone binary compiler script
│   │   └── src/
│   │       ├── index.ts           # Server entrypoint and createServer() factory
│   │       ├── index.test.ts      # Backend and MFE integration test suite
│   │       ├── types.ts           # Data models and server telemetry interfaces
│   │       ├── api/               # Modular API endpoint routers
│   │       │   ├── index.ts       # API dispatcher & CORS preflight handler
│   │       │   ├── health.ts      # Health check endpoint (/api/health)
│   │       │   ├── info.ts        # Runtime telemetry endpoint (/api/info)
│   │       │   ├── live-reload.ts # Live reload SSE endpoint (/api/live-reload)
│   │       │   └── routers/
│   │       │       └── items.ts   # CRUD task items router (/api/items)
│   │       └── lib/               # Server utility libraries
│   │           ├── cors.ts        # CORS headers and jsonResponse helper
│   │           ├── env.ts         # Zod-validated server environment schema
│   │           ├── live-reload.ts # LiveReloadManager & SSE broker
│   │           └── mfe.ts         # MFE resolver and virtual asset server
│   ├── data/                      # Lightweight Type-Safe Data Layer (Bun SQL)
│   │   ├── .env.example           # Environment template for local dev (.env.local)
│   │   ├── README.md              # Data layer architecture & guide
│   │   ├── package.json           # Data package manifest (@app/data)
│   │   ├── tsconfig.json          # Data TypeScript configuration (@/* & @data aliases)
│   │   ├── migrations/            # Handwritten SQL migration files
│   │   │   ├── 0001_create_users.sql
│   │   │   └── 0002_create_items.sql
│   │   ├── scripts/
│   │   │   └── migrate.ts         # CLI migration runner (up/down/status/create/reset)
│   │   ├── src/
│   │   │   ├── index.ts           # Public exports
│   │   │   ├── client.ts          # Bun SQL Database client & transaction wrapper
│   │   │   ├── env.ts             # Zod-validated database environment schema
│   │   │   ├── migrator.ts        # Migration engine
│   │   │   ├── contracts/         # Strongly typed model & DTO contracts
│   │   │   │   ├── index.ts
│   │   │   │   ├── item.ts
│   │   │   │   └── user.ts
│   │   │   └── queries/           # Type-safe raw SQL query operations
│   │   │       ├── index.ts
│   │   │       ├── common.ts
│   │   │       ├── item.ts
│   │   │       └── user.ts
│   │   └── tests/                 # Data layer unit test suite
│   │
│   ├── hub/                       # Primary Hub Shell Micro-Frontend (Basepath: /)
│   │   ├── index.html             # Shell HTML entrypoint
│   │   ├── package.json           # Hub package manifest
│   │   ├── scripts/
│   │   │   └── build.ts           # Hub bundler (Bun.build + React Compiler + Tailwind)
│   │   └── src/
│   │       ├── index.tsx          # Client DOM mount entrypoint
│   │       ├── App.tsx            # App root with TanStack RouterProvider
│   │       ├── App.test.tsx       # Hub route rendering tests
│   │       ├── router.tsx         # TanStack Router instance & route tree
│   │       ├── styles.css         # Tailwind CSS styling
│   │       └── routes/            # TanStack client routes
│   │           ├── __root.tsx     # Root layout with nav and telemetry badge
│   │           ├── index.tsx      # Dashboard page (/)
│   │           ├── tasks.tsx      # Task management page (/tasks)
│   │           ├── about.tsx      # Architecture & topology page (/about)
│   │           └── not-found.tsx  # Catch-all 404 page (/*)
│   │
│   ├── store/                     # Store Micro-Frontend (Basepath: /store)
│   │   ├── index.html             # Store HTML entrypoint
│   │   ├── package.json           # Store package manifest
│   │   ├── scripts/
│   │   │   └── build.ts           # Store bundler (publicPath: "/store/")
│   │   └── src/
│   │       ├── index.tsx          # Client DOM mount entrypoint
│   │       ├── App.tsx            # Store root with TanStack RouterProvider
│   │       ├── App.test.tsx       # Store route rendering tests
│   │       ├── router.tsx         # Scoped TanStack Router instance
│   │       ├── styles.css         # Tailwind CSS styling
│   │       └── routes/            # Store client routes
│   │           ├── __root.tsx     # Store layout with nav and badge
│   │           ├── index.tsx      # Catalog page (/store/)
│   │           ├── cart.tsx       # Cart & checkout page (/store/cart)
│   │           ├── deals.tsx      # Deals & coupons page (/store/deals)
│   │           └── not-found.tsx  # Scoped 404 page (/store/*)
│   │
│   └── docs/                      # Docs Micro-Frontend (Basepath: /docs)
│       ├── index.html             # Docs HTML entrypoint
│       ├── package.json           # Docs package manifest
│       ├── scripts/
│       │   └── build.ts           # Docs bundler (publicPath: "/docs/")
│       └── src/
│           ├── index.tsx          # Client DOM mount entrypoint
│           ├── App.tsx            # Docs root with TanStack RouterProvider
│           ├── App.test.tsx       # Docs route rendering tests
│           ├── router.tsx         # Scoped TanStack Router instance
│           ├── styles.css         # Tailwind CSS styling
│           └── routes/            # Docs client routes
│               ├── __root.tsx     # Docs layout with nav and badge
│               ├── index.tsx      # Overview page (/docs/)
│               ├── guides.tsx     # Developer guides page (/docs/guides)
│               ├── api.tsx        # Interactive API reference page (/docs/api)
│               └── not-found.tsx  # Scoped 404 page (/docs/*)
```

---

## 📋 Prerequisites

- [Bun](https://bun.sh) `v1.4.0` or higher

---

## 🚀 Quick Start

```bash
# 1. Install monorepo dependencies
bun install

# 2. Start all packages in parallel watch mode (backend + micro-frontends + live reload)
bun run dev

# 3. Build all micro-frontends and compile the standalone executable binary
bun run build

# 4. Run the production standalone binary
bun start
```

---

## 📦 Packages & Micro-Frontend Matrix

| Package | Mount Basepath | Client Routes | Description |
| :--- | :--- | :--- | :--- |
| [`packages/backend`](./packages/backend) | `/api/*`, `/` | REST Endpoints, SSE | Bun HTTP server, REST API router, micro-frontend host & binary compiler |
| [`packages/hub`](./packages/hub) | `/` | `/`, `/tasks`, `/about`, `/*` | Primary shell frontend SPA with system telemetry, live tasks CRUD, and architecture details |
| [`packages/store`](./packages/store) | `/store` | `/store/`, `/store/cart`, `/store/deals`, `/*` | Independent Store micro-frontend SPA with catalog, shopping cart, and flash deals |
| [`packages/docs`](./packages/docs) | `/docs` | `/docs/`, `/docs/guides`, `/docs/api`, `/*` | Interactive Documentation micro-frontend SPA with architecture guides and live API runner |

---

## 🚦 Micro-Frontend Navigation & Client Routes

### Routing Topology

1. **Inter-MFE Navigation (Cross-Package)**:
   - Micro-frontends are hosted under distinct paths (`/`, `/store`, `/docs`).
   - Switching between micro-frontends uses standard HTML `<a>` tags or full browser navigation so the browser requests the respective SPA shell from the Bun server.
2. **Intra-MFE Navigation (Client-Side SPA)**:
   - Inside each micro-frontend, TanStack Router manages all route transitions in-memory with zero page reloads via `<Link>`.
3. **Scoped Basepaths**:
   - `@app/store` is configured with `basepath: "/store"`.
   - `@app/docs` is configured with `basepath: "/docs"`.
   - `@app/hub` is configured with `basepath: "/"`.
4. **404 Catch-All & Fallback**:
   - Unmapped server requests fall back to the appropriate MFE `index.html`.
   - TanStack Router's `defaultNotFoundComponent` intercepts unmapped client paths and renders rich diagnostics with recovery links.

---

## 🔌 REST API Reference

All API routes return JSON payloads with standard CORS headers (`Access-Control-Allow-Origin: *`).

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and uptime | None | `200 OK` |
| `GET` | `/api/info` | Runtime metadata (Bun version, platform, memory, standalone mode) | None | `200 OK` |
| `GET` | `/api/items` | List all task items from the store | None | `200 OK` |
| `POST` | `/api/items` | Create a new task item | `{ "title": "string" }` | `201 Created` |
| `PATCH` | `/api/items/:id` | Update task completion status or title | `{ "completed"?: boolean, "title"?: string }` | `200 OK` |
| `DELETE` | `/api/items/:id` | Delete a task item by ID | None | `200 OK` |
| `GET` | `/api/live-reload` | Server-Sent Events stream for development live reload | None | `200 OK` (SSE) |
| `OPTIONS` | `/*` | CORS preflight options handler | None | `200 OK` / `204 No Content` |

---

## ⚙️ Environment Configuration

Environment variables are **scoped to each package** and validated with **Zod** at startup:

- **Local Development**: Copy `.env.example` to `.env.local` inside each package:
  ```bash
  # Data package environment (.env.local)
  cp packages/data/.env.example packages/data/.env.local

  # Backend package environment (.env.local)
  cp packages/backend/.env.example packages/backend/.env.local
  ```
- **Validated Variables**:
  - `DATABASE_URL`: PostgreSQL connection string (required by `@app/data` & `@app/backend`).
  - `PORT`: HTTP server port (defaults to `3000` in `@app/backend`).
  - `PGMAX_POOL`: Connection pool limit (defaults to `10` in `@app/data`).
  - `NODE_ENV`: `development` / `production` / `test` (defaults to `development`).

---

## 🛠️ Scripts Reference

| Command | Description |
| :--- | :--- |
| `bun run dev` | Start development servers and watchers across all packages in parallel |
| `bun run build` | Build all micro-frontends and compile the backend standalone binary (`dist/server`) |
| `bun start` | Execute the compiled standalone binary (`dist/server`) |
| `bun test` | Execute unit, SSR, and integration tests across all packages in parallel |
| `bun run typecheck` | Perform strict TypeScript type checking monorepo-wide (`tsc --noEmit`) |
| `bun run lint` | Check linting and code formatting rules using Biome |
| `bun run lint:fix` | Automatically fix lint and formatting issues with Biome |
| `bun run format` | Format all source files with Biome |
| `bun run docker:build` | Build the multi-stage distroless Docker container image |

---

## 🔬 Deep Dives

### 1. React 19 Native React Compiler
Bun 1.4 includes native support for the React Compiler without requiring Babel or SWC plugins. Each micro-frontend enables it directly in its build script:
```ts
const result = await Bun.build({
  entrypoints: ["index.html"],
  outdir: "./dist",
  reactCompiler: true, // Enables automatic memoization of components and hooks
  plugins: [tailwind],
  minify: !isWatch,
});
```

### 2. Standalone Binary Compilation (`--asset=mfes`)
The backend build script (`packages/backend/scripts/build.ts`) stages each micro-frontend's `dist` output into `packages/backend/dist/mfes/` and invokes:
```bash
bun build --compile --minify --bytecode --define process.env.NODE_ENV='"production"' --asset=mfes --outfile=server ../src/index.ts
```
Bun's virtual filesystem embeds all assets into the binary, accessible at runtime via `Bun.embeddedFiles` and virtual paths (`/$bunfs/...`).

### 3. Resilient Development Live Reload (SSE)
In development mode (`bun run dev`), the Bun server watches for build updates across all packages and streams reload signals via Server-Sent Events (`/api/live-reload`).
- **Write-Readiness Polling**: Ensures newly generated JavaScript/CSS chunks and HTML files are completely flushed to disk before signaling the browser, preventing blank-screen race conditions.
- **Socket Teardown**: SSE connections are cleanly terminated on page navigation (`beforeunload`/`pagehide`) to avoid browser connection pool exhaustion.
- **Production Safety**: Live reload is automatically deactivated when `process.env.NODE_ENV === "production"` or running inside a standalone binary.

### 4. Testing with `bun:test` and TanStack Memory History
Every micro-frontend includes tests using `bun:test` and React 19's `renderToString`. Routers use memory history for hermetic test execution without browser dependencies:
```tsx
import { describe, expect, it } from "bun:test";
import { renderToString } from "react-dom/server";
import { App, createAppRouter } from "@/App";

describe("Store App Component with TanStack Router", () => {
  it("renders catalog route", async () => {
    const testRouter = createAppRouter("/store/");
    await testRouter.load();
    const html = renderToString(<App router={testRouter} />);
    expect(html).toContain("Store Micro-Frontend");
  });
});
```

---

## 🐳 Docker Deployment

Build and run using the multi-stage distroless Docker image:

```bash
# Build the Docker image (~47MB)
bun run docker:build

# Run the containerized standalone server
bun run --filter @app/backend docker:run
```

Access the application at `http://localhost:3000`.
