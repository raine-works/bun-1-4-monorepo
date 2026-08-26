# Bun 1.4 Full-Stack & Micro-Frontend Monorepo

A lightweight, high-performance monorepo built with **Bun 1.4** and **Biome**. 
The backend server and all micro-frontend applications (`hub`, `store`, `docs`) compile into a **single, self-contained standalone binary executable** with zero external runtime dependencies.

---

## 🏛️ Architecture Overview

```
                            ┌─────────────────────────────────────────┐
                            │    Standalone Executable Binary         │
                            │    (packages/backend/dist/server)       │
                            └────────────────────┬────────────────────┘
                                                 │
               ┌──────────────────────────────────┴──────────────────────────────────┐
               │                                                                     │
     ┌─────────▼───────────┐                                               ┌─────────▼───────────┐
     │   REST API Routes   │                                               │   Embedded Assets   │
     │   /api/*            │                                               │   dist/mfes/*       │
     │   (Health, Info,    │                                               │   (hub, store,      │
     │    Items CRUD)      │                                               │    docs)            │
     └─────────────────────┘                                               └─────────┬───────────┘
                                                                                     │
                                       ┌─────────────────────────────┬───────────────┴─────────────┐
                                       │                             │                             │
                             ┌─────────▼───────────┐       ┌─────────▼───────────┐       ┌─────────▼───────────┐
                             │  @app/hub (/)       │       │  @app/store (/store)│       │  @app/docs (/docs)  │
                             │  React 19 + Compiler│       │  React 19 + Compiler│       │  React 19 + Compiler│
                             └─────────────────────┘       └─────────────────────┘       └─────────────────────┘
```

---

## 📁 Repository Structure

```
├── biome.json                  # Biome linter, formatter & import organizer config
├── bunfig.toml                 # Bun configuration file
├── package.json                # Root package.json with workspaces, catalogs & scripts
├── tsconfig.json               # Shared base TypeScript configuration
├── packages/
│   ├── backend/                # Backend server & standalone binary builder
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile          # Distroless container build
│   │   ├── build.ts            # Compiles standalone executable with embedded MFEs
│   │   └── src/
│   │       ├── index.ts        # Bun.serve HTTP server with embedded asset resolution
│   │       └── index.test.ts   # Integration tests
│   ├── hub/                    # Primary Hub Micro-Frontend (served at /)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   ├── build.ts            # Bundler using Bun.build + React Compiler
│   │   └── src/
│   │       ├── index.tsx
│   │       ├── App.tsx
│   │       ├── App.test.tsx
│   │       └── styles.css
│   ├── store/                  # Store Micro-Frontend (served at /store)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   ├── build.ts
│   │   └── src/
│   │       ├── index.tsx
│   │       ├── App.tsx
│   │       ├── App.test.tsx
│   │       └── styles.css
│   └── docs/                   # Docs Micro-Frontend (served at /docs)
│       ├── package.json
│       ├── tsconfig.json
│       ├── index.html
│       ├── build.ts
│       └── src/
│           ├── index.tsx
│           ├── App.tsx
│           ├── App.test.tsx
│           └── styles.css
└── README.md
```

---

## ⚡ Standalone Binary Compilation

Instead of compiling to JavaScript files, running `bun run build` generates a **single native binary executable**:

```bash
bun run build
```

Under the hood:
1. Each micro-frontend (`@app/hub`, `@app/store`, `@app/docs`) builds with the **native React Compiler** (`--react-compiler`).
2. `@app/backend` compiles into a native standalone binary with `bun build --compile --minify --bytecode --asset=mfes --outfile=server`:
   - Packages the Bun runtime + backend code into a native binary.
   - Embeds all micro-frontend assets directly into the binary's virtual filesystem.
   - Uses bytecode caching for instant startup.

### Running the Standalone Executable
You can run the binary directly with no dependencies:
```bash
./packages/backend/dist/server
# or via bun script:
bun start
```

---

## 📦 Binary Artifacts & `dist/` Directories

All build artifacts and compiled standalone binary executables are isolated inside dedicated `dist/` directories:
- **`packages/hub/dist/`**: Compiled Hub application bundle.
- **`packages/store/dist/`**: Compiled Store application bundle.
- **`packages/docs/dist/`**: Compiled Docs application bundle.
- **`packages/backend/dist/server`**: The standalone executable binary with embedded assets and zero dependencies.

---

## 🐳 Package-Level Distroless Docker Architecture

Each backend server application package manages its own containerization via its dedicated package-level `Dockerfile` ([`packages/backend/Dockerfile`](file:///Users/rainepetersen/Projects/raineworks/bun-1-4-monorepo/packages/backend/Dockerfile)):

- **Self-Contained Package Builds**: Compiles standalone binary into `packages/backend/dist/server` with all embedded micro-frontends.
- **Distroless Runtime Image (`gcr.io/distroless/cc-debian12`)**: Copies *only* the single compiled binary into a minimal image (~47MB). Zero Node/Bun runtime binaries, zero source files, zero package managers, and zero shell.

```bash
bun run --filter @app/backend docker:build
bun run --filter @app/backend docker:run
```

---

## 🛠️ Development & Quality Commands

| Command | Action |
| :--- | :--- |
| `bun run dev` | Runs backend with hot reload and micro-frontend watcher with automatic browser live reload |
| `bun run build` | Compiles all micro-frontends and packages backend into `packages/backend/dist/server` |
| `bun test` | Runs all test suites across workspaces concurrently with `bun test --parallel` |
| `bun run typecheck` | Validates TypeScript types across the entire monorepo with `tsc --noEmit` |
| `bun run lint` | Lints, checks formatting, and verifies imports with **Biome** |
| `bun run lint:fix` | Automatically fixes lint, formatting, and import issues with **Biome** |
| `bun run format` | Formats all code files with **Biome** |
| `bun start` | Executes the compiled standalone binary (`./packages/backend/dist/server`) |
