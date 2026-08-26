# Bun 1.4 Full-Stack & Micro-Frontend Monorepo

A lightweight, high-performance monorepo built with **Bun 1.4** and **Biome**. 
The backend server and all frontend/micro-frontend assets compile into a **single, self-contained standalone binary executable** with zero external runtime dependencies.

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
    │   /api/*            │                                               │   /$bunfs/root/     │
    │   (Health, Info,    │                                               │   packages/frontend │
    │    Items CRUD)      │                                               └─────────┬───────────┘
    └─────────────────────┘                                                         │
                                                                  ┌─────────────────┴─────────────────┐
                                                                  │                                   │
                                                        ┌─────────▼───────────┐             ┌─────────▼───────────┐
                                                        │  @app/frontend      │             │  (Future MFE Apps)  │
                                                        │  React 19 + Compiler│             │  e.g. /dashboard/*  │
                                                        └─────────────────────┘             └─────────────────────┘
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
│   │   ├── build.ts            # Compiles standalone executable with embedded assets
│   │   └── src/
│   │       ├── index.ts        # Bun.serve HTTP server with embedded asset resolution
│   │       └── index.test.ts   # Integration tests
│   └── frontend/               # Frontend React 19 application
│       ├── package.json        # Minimal dependencies (react, react-dom)
│       ├── tsconfig.json
│       ├── index.html          # HTML entry point
│       ├── build.ts            # Bundler using Bun.build + React Compiler
│       └── src/
│           ├── index.tsx       # React DOM root entry
│           ├── App.tsx         # Interactive React app with auto-memoization
│           ├── App.test.tsx    # Component tests with bun:test
│           ├── styles.css      # Dark-theme CSS
│           └── env.d.ts        # CSS module types
└── README.md
```

---

## ⚡ Standalone Binary Compilation

Instead of compiling to JavaScript files, running `bun run build` generates a **single native binary executable**:

```bash
bun run build
```

Under the hood:
1. `@app/frontend` builds the React 19 application with the **native React Compiler** (`--react-compiler`).
2. `@app/backend` runs `bun build --compile --minify --bytecode --asset=packages/frontend/dist --outfile=packages/backend/dist/server`:
   - Packages the Bun runtime + backend code into a native binary.
   - Embeds the frontend React assets directly into the binary's virtual filesystem (`/$bunfs/root/packages/frontend/dist`).
   - Uses bytecode caching for instant startup.

### Running the Standalone Executable
You can run the binary directly with no dependencies:
```bash
./packages/backend/dist/server
# or via npm/bun script:
bun start
```

---

## 📦 Binary Artifacts & `dist/` Directories

All build artifacts and compiled standalone binary executables are isolated inside dedicated `dist/` directories:
- **`packages/frontend/dist/`**: Contains compiled HTML, bundled JS/CSS, and sourcemaps.
- **`packages/backend/dist/server`**: The standalone executable binary with embedded assets and zero dependencies.
- **`packages/<service>/dist/<binary>`**: Pattern for future backend server applications in the monorepo.

All `dist/` directories and binaries are ignored by [`.gitignore`](file:///Users/rainepetersen/Projects/raineworks/new-test/.gitignore) and [`.dockerignore`](file:///Users/rainepetersen/Projects/raineworks/new-test/.dockerignore) to keep the project clean.

---

## 🐳 Package-Level Distroless Docker Architecture

Each backend server application package manages its own containerization via its dedicated package-level `Dockerfile` (e.g. [`packages/backend/Dockerfile`](file:///Users/rainepetersen/Projects/raineworks/new-test/packages/backend/Dockerfile)):

- **Self-Contained Package Builds**: Compiles standalone binary into `packages/<service>/dist/server` with all required assets.
- **Distroless Runtime Image (`gcr.io/distroless/cc-debian12`)**: Copies *only* the single compiled binary into a minimal image (~47MB). Zero Node/Bun runtime binaries, zero source files, zero package managers, and zero shell.
- **Multi-Service Scaling**: New server packages can maintain their own `Dockerfile` with service-specific ports, dependencies, and environment variables.

### Building & Running Backend Docker Images

From the package directory or via workspace filters:
```bash
# Build the @app/backend distroless image
bun run docker:backend
# or from packages/backend directory:
# bun run docker:build

# Run the distroless container
bun run docker:run:backend
# or from packages/backend directory:
# bun run docker:run
```

---

## 🛠️ Development & Quality Commands

| Command | Action |
| :--- | :--- |
| `bun run dev` | Runs backend with hot reload and micro-frontend watcher with automatic browser live reload |
| `bun run build` | Compiles frontend and packages backend into `packages/backend/dist/server` |
| `bun test` | Runs all test suites across workspaces concurrently with `bun test --parallel` |
| `bun run typecheck` | Validates TypeScript types across the entire monorepo with `tsc --noEmit` |
| `bun run lint` | Lints, checks formatting, and verifies imports with **Biome** (~4ms) |
| `bun run lint:fix` | Automatically fixes lint, formatting, and import issues with **Biome** |
| `bun run format` | Formats all code files with **Biome** |
| `bun start` | Executes the compiled standalone binary (`./packages/backend/dist/server`) |
| `bun run docker:backend` | Builds minimal distroless Docker image for `@app/backend` |
| `bun run docker:run:backend` | Runs `@app/backend` distroless container on port 3000 |
