# @app/hub

The primary shell and dashboard micro-frontend for the **Bun 1.4 Full-Stack Monorepo**, mounted at `/`.

---

## 🚀 Key Features

- **TanStack Router**: Type-safe client-side routing with root layout, navigation bar, active link indicators, and 404 catch-all handling.
- **Client Routes**:
  - `/`: System & runtime telemetry overview, React 19 native compiler memoization status, and state persistence demo.
  - `/tasks`: Live task management connected directly to the backend REST API (`/api/items`).
  - `/about`: Monorepo architecture and routing topology explanation.
  - `/*`: Custom 404 handler with routing telemetry and recovery links.
- **Inter-MFE Navigation**: Seamless cross-MFE switcher navigating to Store (`/store`) and Docs (`/docs`).
- **React 19 with Native React Compiler**: Zero-configuration auto-memoization enabled via `Bun.build({ reactCompiler: true })`.
- **Tailwind CSS v4**: Built-in modern styling with `@import "tailwindcss"`.
- **Test Isolation**: Router factory (`createAppRouter`) supports `createMemoryHistory()` for server-side testing with `bun:test` and `react-dom/server`.

---

## 📁 Directory Structure

```
packages/hub/
├── build.ts              # Bun.build bundler script with Tailwind CSS and React Compiler
├── index.html            # Application HTML shell entrypoint
├── package.json          # Package manifest and dependencies
├── tsconfig.json         # TypeScript configuration with @/* path aliases
├── src/
│   ├── index.tsx         # Client DOM entrypoint (createRoot)
│   ├── App.tsx           # Application root exporting App and createAppRouter
│   ├── App.test.tsx      # Route rendering and 404 tests with bun:test
│   ├── router.tsx        # TanStack Router instance and route tree definition
│   ├── styles.css        # Tailwind CSS entrypoint
│   ├── env.d.ts          # TypeScript environment declarations
│   └── routes/           # TanStack Router route definitions
│       ├── __root.tsx    # Root layout with header, navigation, and telemetry badge
│       ├── index.tsx     # Dashboard page (/)
│       ├── tasks.tsx     # Tasks manager page (/tasks)
│       ├── about.tsx     # Architecture page (/about)
│       └── not-found.tsx # Catch-all 404 page (/*)
```

---

## 🚦 Routing Architecture

### 1. Intra-MFE Navigation (Client-Side SPA)
Uses TanStack Router's `<Link>` component for zero-reload client-side routing between internal pages:
```tsx
import { Link } from "@tanstack/react-router";

<Link to="/tasks" activeProps={{ className: "font-bold text-sky-300" }}>
  Tasks
</Link>
```

### 2. Inter-MFE Navigation (Cross-Package)
Uses standard HTML `<a>` tags for navigating across separate micro-frontends:
```html
<a href="/store">Store (/store)</a>
<a href="/docs">Docs (/docs)</a>
```

### 3. Test Configuration with Memory History
The router initializes memory history when running under `bun:test` or server-side rendering:
```tsx
export function createAppRouter(initialPath = "/") {
  return createRouter({
    routeTree,
    defaultNotFoundComponent: NotFoundPage,
    history:
      typeof window === "undefined"
        ? createMemoryHistory({ initialEntries: [initialPath] })
        : undefined,
  });
}
```

---

## 🛠️ Scripts Reference

| Command | Description |
| :--- | :--- |
| `bun run build` | Bundles the Hub SPA into `dist/` with minification and sourcemaps |
| `bun run dev` | Starts watch mode, rebuilding incrementally on file changes |
| `bun test` | Runs component and routing tests using `bun:test` |
