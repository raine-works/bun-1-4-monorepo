# Bun 1.4 Full-Stack Monorepo

A high-performance, production-ready full-stack monorepo built with **Bun 1.4**, **Hono**, **React 19**, **TanStack Router**, **Tailwind CSS v4**, **Bun SQL**, and **Biome**. Compiles the backend HTTP server, REST & Hono RPC APIs, database layer, shared UI library, and multiple micro-frontends into a single, self-contained standalone executable binary with zero external runtime dependencies.

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
|  |  GET    /api/users                         |  |             - /tasks, /about, 404           |  |
|  |  POST   /api/users                         |  |  /store   -> Store MFE (@app/store)         |  |
|  |  GET    /api/users/:id                     |  |             - TanStack Router (/store)      |  |
|  |  PATCH  /api/users/:id                     |  |             - /store/cart, /deals, 404      |  |
|  |  DELETE /api/users/:id                     |  |  /docs    -> Docs MFE (@app/docs)           |  |
|  |  GET    /api/items                         |  |             - TanStack Router (/docs)       |  |
|  |  POST   /api/items                         |  |             - /docs/guides, /api, 404       |  |
|  |  GET    /api/items/:id                     |  |  /*       -> SPA Fallback to Shell          |  |
|  |  PATCH  /api/items/:id                     |  +---------------------------------------------+  |
|  |  DELETE /api/items/:id                     |                                                   |
|  |  GET    /api/live-reload (Dev SSE)         |  +---------------------------------------------+  |
|  |  OPTIONS /* (CORS Preflight)               |  |          PostgreSQL Data Layer              |  |
|  +--------------------------------------------+  |  -----------------------------------------  |  |
|                                                  |  @app/data (bun:sql + migrations + DTOs)   |  |
|  +--------------------------------------------+  +---------------------------------------------+  |
|  |           Shared Libraries                 |                                                   |
|  |  ----------------------------------------  |  +---------------------------------------------+  |
|  |  @app/ui    - Components, Layouts, Blocks  |  |          Standalone Executable Binary       |  |
|  |  @app/tools - Build, Prototypes, HTTP, Env |  |  bun build --compile --minify --asset=mfes  |  |
|  +--------------------------------------------+  +---------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

### Highlights & Key Features

- ⚡ **Bun 1.4 Native Tooling**: Fast package management with catalog dependencies, TypeScript execution, native bundling via `Bun.build`, and fast `bun:test` test runner.
- 🔥 **Hono HTTP Router & Typed Middleware**: Expressive, high-performance routing across backend and API endpoints powered by **Hono** and **@hono/zod-validator**.
- 🔗 **End-to-End Type-Safe Hono RPC Client**: Frontend micro-frontends consume backend APIs with full type safety, autocomplete, and zero code-generation using Hono RPC (`hc<AppType>`).
- 🗄️ **Lightweight Type-Safe Data Layer**: Native PostgreSQL database interactions powered by Bun's built-in `bun:sql` driver with zero heavy ORMs, strongly typed model contracts, transactions, active transaction tracking, and migration runner.
- ⚛️ **React 19 with Native React Compiler**: Automatic component and hook memoization enabled directly via `Bun.build({ reactCompiler: true })` without Babel or SWC plugins.
- 🚦 **TanStack Router in Every Micro-Frontend**: Type-safe client-side routing with nested layouts, deep linking, active link states, and scoped basepaths (`/`, `/store`, `/docs`).
- 🧩 **Multi-Micro-Frontend Architecture**: Host multiple independent SPAs (`hub`, `store`, `docs`) from a single origin with scoped static asset routing and SPA fallback support.
- 🎨 **Shared UI Design System (`@app/ui`)**: Shared React 19 primitives (`Badge`, `Button`, `Card`, `TelemetryBadge`), global blocks (`MfeHeader`, `MfeFooter`, `NotFoundView`, `GlobalMfeNav`), and layout containers (`MfeLayout`).
- 🛠️ **Shared Utilities & Prototypes (`@app/tools`)**: Reusable build runners, prototype extensions (`Array.isEmpty`, `Array.flush`, `Array.unique`, `Promise.tryCatch`), HTTP header helpers, and environment loaders.
- 📦 **Single Standalone Executable Binary**: All frontend assets are bundled and embedded into the compiled binary via Bun's virtual filesystem (`--asset=mfes`), producing a single portable executable with zero runtime dependencies.
- 🔄 **Resilient Live Reload (Dev Mode)**: Server-Sent Events (SSE) stream detects micro-frontend rebuilds with write-readiness polling, reconnection resilience, and asset error auto-recovery (cleanly disabled in production).
- 🎨 **Tailwind CSS v4**: Fast modern styling using `bun-plugin-tailwind` and `@import "tailwindcss"` with zero complex CSS toolchains.
- 🧹 **Biome Formatting & Linting**: Ultra-fast linting and code formatting configured monorepo-wide.
- 🐳 **Distroless Container Support**: Ultra-lightweight ~47MB container image using `gcr.io/distroless/cc-debian12`.
- 🛑 **Graceful Shutdown**: Traps OS signals (`SIGINT`, `SIGTERM`), halts incoming HTTP requests, drains in-flight requests, waits for active SQL transactions to finish, and flushes database connections.

---

## 📁 Monorepo Structure

```
bun-1-4-monorepo/
├── biome.json                     # Biome linting and formatting rules
├── bun.lock                       # Unified lockfile for monorepo workspace
├── bunfig.toml                    # Bun configuration and package catalog definitions
├── package.json                   # Root workspace manifest and orchestrator scripts
├── tsconfig.json                  # Monorepo root TypeScript configuration with global aliases
├── AGENTS.md                      # AI agent guidelines and import alias rules
├── GEMINI.md                      # Antigravity agent guidelines and import alias rules
├── docker/
│   └── compose.yaml               # Docker Compose configuration for local PostgreSQL
├── packages/
│   ├── backend/                   # Bun HTTP Server powered by Hono & Standalone Compiler
│   │   ├── .env.example           # Environment template for local dev (.env.local)
│   │   ├── Dockerfile             # Multi-stage distroless Docker configuration
│   │   ├── README.md              # Backend package architecture & guide
│   │   ├── package.json           # Backend package manifest (@app/backend)
│   │   ├── tsconfig.json          # Backend TypeScript configuration (@/* aliases)
│   │   ├── scripts/
│   │   │   └── build.ts           # Standalone binary compiler script (stages MFEs & compiles binary)
│   │   └── src/
│   │       ├── index.ts           # Hono root app, createApp(), createServer(), and default export
│   │       ├── index.test.ts      # Backend, MFE, and Hono RPC integration test suite
│   │       ├── rpc.ts            # Hono RPC client factory and typed singleton
│   │       ├── types.ts           # Data models, ServerVariables, and Zod DTO contracts
│   │       ├── routers/           # Modular Hono API sub-routers
│   │       │   ├── index.ts       # Unified apiRouter combining all sub-routes
│   │       │   ├── health.ts      # Health check endpoint (/api/health)
│   │       │   ├── info.ts        # Runtime telemetry endpoint (/api/info)
│   │       │   ├── items.ts       # CRUD task items router with zValidator (/api/items)
│   │       │   ├── live-reload.ts # Live reload SSE endpoint (/api/live-reload)
│   │       │   └── users.ts       # CRUD users router with zValidator (/api/users)
│   │       └── lib/               # Server utility libraries
│   │           ├── cors.ts        # Standard CORS headers configuration
│   │           ├── env.ts         # Zod-validated server environment schema
│   │           ├── env.test.ts    # Server environment schema unit tests
│   │           ├── live-reload.ts # LiveReloadManager & SSE broker
│   │           ├── mfe.ts         # MFE resolver and virtual asset server
│   │           ├── shutdown.ts    # GracefulShutdownHandler & connection draining
│   │           └── shutdown.test.ts # Graceful shutdown unit tests
│   │
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
│   │   └── src/
│   │       ├── index.ts           # Public exports (db, Database, Migrator, models, DTOs)
│   │       ├── client.ts          # Bun SQL Database client & transaction wrapper
│   │       ├── client.test.ts     # Database client unit tests
│   │       ├── env.ts             # Zod-validated database environment schema
│   │       ├── env.test.ts        # Database environment schema tests
│   │       ├── migrator.ts        # Migration engine
│   │       ├── migrator.test.ts   # Migration engine unit tests
│   │       ├── contracts/         # Strongly typed model & DTO contracts
│   │       │   ├── index.ts
│   │       │   ├── item.ts
│   │       │   └── user.ts
│   │       ├── contracts.test.ts  # Typed data contract tests
│   │       ├── queries.test.ts    # Type-safe SQL query tests
│   │       └── queries/           # Type-safe raw SQL query operations
│   │           ├── index.ts
│   │           ├── common.ts
│   │           ├── item.ts
│   │           └── user.ts
│   │
│   ├── hub/                       # Primary Hub Shell Micro-Frontend (Basepath: /)
│   │   ├── index.html             # Shell HTML entrypoint
│   │   ├── README.md              # Hub micro-frontend guide
│   │   ├── package.json           # Hub package manifest (@app/hub)
│   │   ├── tsconfig.json          # Hub TypeScript configuration (@/* aliases)
│   │   ├── scripts/
│   │   │   └── build.ts           # Hub bundler (Bun.build + React Compiler + Tailwind)
│   │   └── src/
│   │       ├── index.tsx          # Client DOM mount entrypoint
│   │       ├── App.tsx            # App root with TanStack RouterProvider
│   │       ├── App.test.tsx       # Hub route rendering tests
│   │       ├── router.tsx         # TanStack Router instance & route tree
│   │       ├── styles.css         # Tailwind CSS styling
│   │       ├── env.d.ts           # TypeScript environment declarations
│   │       └── routes/            # TanStack client routes
│   │           ├── __root.tsx     # Root layout with nav and telemetry badge
│   │           ├── index.tsx      # Dashboard page (/)
│   │           ├── tasks.tsx      # Task management page (/tasks)
│   │           ├── about.tsx      # Architecture & topology page (/about)
│   │           └── not-found.tsx  # Catch-all 404 page (/*)
│   │
│   ├── store/                     # Store Micro-Frontend (Basepath: /store)
│   │   ├── index.html             # Store HTML entrypoint
│   │   ├── README.md              # Store micro-frontend guide
│   │   ├── package.json           # Store package manifest (@app/store)
│   │   ├── tsconfig.json          # Store TypeScript configuration (@/* aliases)
│   │   ├── scripts/
│   │   │   └── build.ts           # Store bundler (publicPath: "/store/")
│   │   └── src/
│   │       ├── index.tsx          # Client DOM mount entrypoint
│   │       ├── App.tsx            # Store root with TanStack RouterProvider
│   │       ├── App.test.tsx       # Store route rendering tests
│   │       ├── router.tsx         # Scoped TanStack Router instance
│   │       ├── styles.css         # Tailwind CSS styling
│   │       ├── env.d.ts           # TypeScript environment declarations
│   │       └── routes/            # Store client routes
│   │           ├── __root.tsx     # Store layout with nav and badge
│   │           ├── index.tsx      # Catalog page (/store/)
│   │           ├── cart.tsx       # Cart & checkout page (/store/cart)
│   │           ├── deals.tsx      # Deals & coupons page (/store/deals)
│   │           └── not-found.tsx  # Scoped 404 page (/store/*)
│   │
│   ├── docs/                      # Docs Micro-Frontend (Basepath: /docs)
│   │   ├── index.html             # Docs HTML entrypoint
│   │   ├── README.md              # Docs micro-frontend guide
│   │   ├── package.json           # Docs package manifest (@app/docs)
│   │   ├── tsconfig.json          # Docs TypeScript configuration (@/* aliases)
│   │   ├── scripts/
│   │   │   └── build.ts           # Docs bundler (publicPath: "/docs/")
│   │   └── src/
│   │       ├── index.tsx          # Client DOM mount entrypoint
│   │       ├── App.tsx            # Docs root with TanStack RouterProvider
│   │       ├── App.test.tsx       # Docs route rendering tests
│   │       ├── router.tsx         # Scoped TanStack Router instance
│   │       ├── styles.css         # Tailwind CSS styling
│   │       ├── env.d.ts           # TypeScript environment declarations
│   │       ├── lib/
│   │       │   └── api.ts         # Backend API client integration
│   │       └── routes/            # Docs client routes
│   │           ├── __root.tsx     # Docs layout with nav and badge
│   │           ├── index.tsx      # Overview page (/docs/)
│   │           ├── guides.tsx     # Developer guides page (/docs/guides)
│   │           ├── api.tsx        # Interactive API reference page (/docs/api)
│   │           └── not-found.tsx  # Scoped 404 page (/docs/*)
│   │
│   ├── tools/                     # Central Shared Utilities & Build Tools
│   │   ├── README.md              # Tools package architecture & guide
│   │   ├── package.json           # Tools package manifest (@app/tools)
│   │   ├── tsconfig.json          # Tools TypeScript configuration (@/* & @tools aliases)
│   │   └── src/
│   │       ├── index.ts           # Public exports
│   │       ├── build.ts           # Frontend build runner (buildFrontend, runFrontendBuildCli)
│   │       ├── cli.ts             # ANSI colors & .bun-build cleaner
│   │       ├── env.ts             # Scoped env loader & Zod parser (loadEnvFiles, parseEnv)
│   │       ├── http.ts            # CORS headers, MIME types, asset headers & standalone check
│   │       ├── prototypes.ts      # Array & Promise prototype extensions (isEmpty, flush, unique, tryCatch)
│   │       ├── prototypes.test.ts # Prototype extensions unit tests
│   │       ├── sql.ts             # SQL count parser & migration file parser
│   │       └── tools.test.ts      # Tools package unit tests
│   │
│   └── ui/                        # Shared UI Components, Layouts & Hooks
│       ├── README.md              # UI package architecture & guide
│       ├── package.json           # UI package manifest (@app/ui)
│       ├── tsconfig.json          # UI TypeScript configuration (@/* & @ui aliases)
│       └── src/
│           ├── index.ts           # Public exports
│           ├── lib/
│           │   └── utils.ts       # cn (clsx + tailwind-merge)
│           ├── hooks/
│           │   ├── index.ts
│           │   └── use-mobile.ts  # Responsive breakpoint hook
│           ├── components/        # Reusable UI primitives
│           │   ├── index.ts
│           │   ├── badge.tsx      # Status badge with pulse variants
│           │   ├── button.tsx     # Variant-styled buttons
│           │   ├── card.tsx       # Card container family
│           │   └── telemetry-badge.tsx # MFE route telemetry badge
│           ├── blocks/            # Global composite blocks
│           │   ├── index.ts
│           │   ├── global-mfe-nav.tsx # Inter-MFE switcher
│           │   ├── mfe-header.tsx # Standardized MFE header
│           │   ├── mfe-footer.tsx # Standardized MFE footer
│           │   └── not-found-view.tsx # Diagnostic 404 view
│           ├── layouts/           # Structural layouts
│           │   ├── index.ts
│           │   └── mfe-layout.tsx # Standardized MFE page shell
│           └── ui.test.tsx        # UI components unit tests
```

---

## 📋 Prerequisites

- [Bun](https://bun.sh) `v1.4.0` or higher
- [Docker](https://www.docker.com/) & Docker Compose (optional, for local PostgreSQL database)

---

## 🚀 Quick Start

```bash
# 1. Install monorepo dependencies
bun install

# 2. Start local PostgreSQL database container (optional)
bun run dev:init

# 3. Run database migrations
bun run migrate

# 4. Start all packages in parallel watch mode (backend + micro-frontends + live reload)
bun run dev

# 5. Build all micro-frontends and compile the standalone executable binary
bun run build

# 6. Run the production standalone binary
bun start
```

---

## 📦 Packages & Micro-Frontend Matrix

| Package | Workspace | Mount Basepath | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| [`packages/backend`](./packages/backend) | `@app/backend` | `/api/*`, `/` | Backend & Host Server | Bun HTTP server, REST & Hono RPC router, micro-frontend host & binary compiler |
| [`packages/data`](./packages/data) | `@app/data` | N/A (Data Layer) | Database Layer | Type-safe PostgreSQL data layer powered by `bun:sql`, migrations, and contracts |
| [`packages/hub`](./packages/hub) | `@app/hub` | `/` | Micro-Frontend | Primary shell frontend SPA with system telemetry, live tasks CRUD, and architecture details |
| [`packages/store`](./packages/store) | `@app/store` | `/store` | Micro-Frontend | Independent Store micro-frontend SPA with catalog, shopping cart, and flash deals |
| [`packages/docs`](./packages/docs) | `@app/docs` | `/docs` | Micro-Frontend | Interactive Documentation micro-frontend SPA with architecture guides and live API runner |
| [`packages/tools`](./packages/tools) | `@app/tools` | N/A (Shared Library) | Core Utilities | Shared build runner, CLI tools, prototype helpers (`tryCatch`), HTTP utils, and SQL parsers |
| [`packages/ui`](./packages/ui) | `@app/ui` | N/A (Shared Library) | UI Design System | Reusable React 19 UI components, layouts, global blocks, and responsive hooks |

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

## 🔌 REST API Reference (Hono & Hono RPC)

All API routes return JSON payloads with standard CORS headers (`Access-Control-Allow-Origin: *`) and Zod-validated payloads:

| Method | Endpoint | Description | Request Body / Query | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, process uptime, and timestamp | None | `200 OK` / `503 Unavailable` (during shutdown) |
| `GET` | `/api/info` | Runtime metadata (Bun version, platform, arch, memory, standalone mode) | None | `200 OK` |
| `GET` | `/api/users` | List users with optional filtering | Query: `?role=...&search=...` | `200 OK` / `400 Bad Request` |
| `POST` | `/api/users` | Create a new user | `{ "email": string, "name": string, "role"?: string, "avatarUrl"?: string }` | `201 Created` / `400 Bad Request` / `409 Conflict` |
| `GET` | `/api/users/:id` | Get user by ID | None | `200 OK` / `404 Not Found` |
| `PATCH`, `PUT` | `/api/users/:id` | Update user fields | `{ "email"?: string, "name"?: string, "role"?: string, ... }` | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/api/users/:id` | Delete user by ID | None | `200 OK` / `404 Not Found` |
| `GET` | `/api/items` | List all task items | None | `200 OK` |
| `POST` | `/api/items` | Create a new task item | `{ "title": string, "completed"?: boolean, "userId"?: string }` | `201 Created` / `400 Bad Request` |
| `GET` | `/api/items/:id` | Get task item by ID | None | `200 OK` / `404 Not Found` |
| `PATCH`, `PUT` | `/api/items/:id` | Update task completion status or title | `{ "title"?: string, "completed"?: boolean, "userId"?: string }` | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/api/items/:id` | Delete a task item by ID | None | `200 OK` / `404 Not Found` |
| `GET` | `/api/live-reload` | Server-Sent Events stream for development live reload (disabled in production) | None | `200 OK` (SSE) |
| `OPTIONS` | `/*` | Global CORS preflight options handler | None | `204 No Content` |

---

## ⚙️ Environment Configuration

Environment variables are **scoped to each package** and validated with **Zod** at startup:

- **Local Development Setup**: Copy `.env.example` to `.env.local` inside each package:
  ```bash
  # Data package environment (.env.local)
  cp packages/data/.env.example packages/data/.env.local

  # Backend package environment (.env.local)
  cp packages/backend/.env.example packages/backend/.env.local
  ```
- **Validated Variables**:
  - `DATABASE_URL`: PostgreSQL connection string (e.g., `postgres://dev_user:dev_password@localhost:5432/dev_db`).
  - `PORT`: HTTP server port (defaults to `3000` in `@app/backend`).
  - `PGMAX_POOL`: Connection pool limit (defaults to `10` in `@app/data`).
  - `NODE_ENV`: `development` / `production` / `test` (defaults to `development`).

---

## 🛠️ Scripts Reference

| Command | Description |
| :--- | :--- |
| `bun run dev` | Start development servers and watchers across all packages in parallel |
| `bun run dev:init` | Start local PostgreSQL database container using Docker Compose (`docker/compose.yaml`) |
| `bun run build` | Build all micro-frontends and compile the backend standalone binary (`dist/server`) |
| `bun start` | Execute the compiled production standalone binary (`dist/server`) |
| `bun test` | Execute unit, SSR, and integration tests across all packages in parallel |
| `bun run typecheck` | Perform strict TypeScript type checking monorepo-wide (`tsc --noEmit`) |
| `bun run lint` | Check linting and code formatting rules using Biome |
| `bun run lint:fix` | Automatically fix lint and formatting issues with Biome |
| `bun run format` | Format all source files with Biome |
| `bun run migrate` | Apply all pending database migrations (`@app/data`) |
| `bun run migrate:status` | Display the status of database migrations |
| `bun run migrate:down` | Roll back the most recently applied migration |
| `bun run migrate:create` | Create a new SQL migration template file |
| `bun run docker:build` | Build the multi-stage distroless Docker container image |
| `bun run docker:run` | Run the containerized standalone server |

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
bun build --compile --minify --bytecode --define Bun.env.NODE_ENV='"production"' --asset=mfes --outfile=server ../src/index.ts
```
Bun's virtual filesystem embeds all assets into the binary, accessible at runtime via `Bun.embeddedFiles` and virtual paths (`/$bunfs/...`).

### 3. Type-Safe PostgreSQL Data Layer (`@app/data`)
Direct native PostgreSQL queries using Bun's built-in `SQL` driver (`import { SQL } from "bun"`):
```ts
import { db } from "@app/data";

// Type-safe queries with automatic parameterization
const users = await db.users.list({ role: "admin" });

// Transactions with automatic active transaction tracking
await db.transaction(async (tx) => {
  const user = await tx.users.create({ email: "user@example.com", name: "User" });
  await tx.items.create({ title: "First task", userId: user.id });
});
```

### 4. Shared UI Design System (`@app/ui`)
All micro-frontends share a unified UI component library, eliminating duplicate components and ensuring design consistency:
```tsx
import { Badge, Button, Card, CardHeader, CardTitle, MfeLayout, TelemetryBadge } from "@app/ui";

export function Dashboard() {
  return (
    <MfeLayout currentPath="/" activeMfe="hub">
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <Badge variant="sky">Active</Badge>
        </CardHeader>
      </Card>
    </MfeLayout>
  );
}
```

### 5. Resilient Development Live Reload (SSE)
In development mode (`bun run dev`), the Bun server watches for build updates across all packages and streams reload signals via Server-Sent Events (`/api/live-reload`).
- **Write-Readiness Polling**: Ensures newly generated JavaScript/CSS chunks and HTML files are completely flushed to disk before signaling the browser, preventing blank-screen race conditions.
- **Socket Teardown**: SSE connections are cleanly terminated on page navigation (`beforeunload`/`pagehide`) to avoid browser connection pool exhaustion.
- **Production Safety**: Live reload is automatically deactivated when `Bun.env.NODE_ENV === "production"` or running inside a standalone binary.

### 6. Testing with `bun:test` and TanStack Memory History
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
bun run docker:run
```

Access the application at `http://localhost:3000`.

