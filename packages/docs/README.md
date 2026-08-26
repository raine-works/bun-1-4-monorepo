# @app/docs

The interactive Documentation micro-frontend for the **Bun 1.4 Full-Stack Monorepo**, mounted at `/docs`.

---

## 🚀 Key Features

- **TanStack Router with Scoped Basepath (`/docs`)**:
  - `/docs/`: Monorepo architecture specification and package role mapping.
  - `/docs/guides`: Step-by-step developer guides covering TanStack Router, adding MFEs, routing boundaries, 404 resolution, React Compiler, binary bundling, live reload, and Docker.
  - `/docs/api`: Interactive REST API explorer with live connectivity test execution against backend endpoints (`/api/health`, `/api/info`, `/api/items`).
  - `/docs/*`: Scoped 404 handler with routing telemetry and return links.
- **Scoped Public Assets (`publicPath: "/docs/"`)**: Configured in `Bun.build` so bundled chunks and stylesheets resolve cleanly under `/docs/`.
- **Inter-MFE Navigation**: Cross-MFE switcher connecting back to Hub (`/`) and Store (`/store`).
- **React 19 Native Compiler**: Automatic memoization enabled via `Bun.build({ reactCompiler: true })`.
- **Tailwind CSS v4**: Modern documentation design system styling.
- **Test Isolation**: Router factory (`createAppRouter`) with memory history support for unit testing with `bun:test`.

---

## 📁 Directory Structure

```
packages/docs/
├── index.html            # Application HTML shell entrypoint
├── package.json          # Package manifest and dependencies
├── tsconfig.json         # TypeScript configuration with @/* path aliases
├── scripts/
│   └── build.ts          # Bun.build script with publicPath: "/docs/" and React Compiler
├── src/
│   ├── index.tsx         # Client DOM entrypoint (createRoot)
│   ├── App.tsx           # Application root exporting App and createAppRouter
│   ├── App.test.tsx      # Docs route rendering and 404 tests with bun:test
│   ├── router.tsx        # TanStack Router instance with basepath: "/docs"
│   ├── styles.css        # Tailwind CSS entrypoint
│   ├── env.d.ts          # TypeScript environment declarations
│   └── routes/           # TanStack Router route definitions
│       ├── __root.tsx    # Root layout with header, navigation, and telemetry badge
│       ├── index.tsx     # Overview page (/docs/)
│       ├── guides.tsx    # Developer guides page (/docs/guides)
│       ├── api.tsx       # Interactive API reference page (/docs/api)
│       └── not-found.tsx # Scoped 404 page (/docs/*)
```

---

## 🚦 Routing Architecture

### 1. Basepath Configuration
TanStack Router is scoped to the `/docs` prefix:
```tsx
export function createAppRouter(initialPath = "/docs/") {
  return createRouter({
    routeTree,
    basepath: "/docs",
    defaultNotFoundComponent: NotFoundPage,
    history:
      typeof window === "undefined"
        ? createMemoryHistory({ initialEntries: [initialPath] })
        : undefined,
  });
}
```

### 2. Client-Side Routing within Docs
Navigates between `/docs`, `/docs/guides`, and `/docs/api` without page reloads:
```tsx
import { Link } from "@tanstack/react-router";

<Link to="/api" activeProps={{ className: "text-sky-300 font-semibold" }}>
  API Reference
</Link>
```

---

## 🛠️ Scripts Reference

| Command | Description |
| :--- | :--- |
| `bun run build` | Bundles the Docs SPA into `dist/` with `publicPath: "/docs/"` |
| `bun run dev` | Starts watch mode, rebuilding incrementally on file changes |
| `bun test` | Runs component and routing tests using `bun:test` |
