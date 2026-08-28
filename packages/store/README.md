# @app/store

The independent Store e-commerce micro-frontend for the **Bun 1.4 Full-Stack Monorepo**, mounted at `/store`.

---

## 🚀 Key Features

- **TanStack Router with Scoped Basepath (`/store`)**:
  - `/store/`: Product catalog with category items and cart count tracking.
  - `/store/cart`: Shopping cart summary with line items, tax computation, and checkout demonstration.
  - `/store/deals`: Flash deals and coupon discount codes (`BUN14FAST`, `REACT19MEMO`).
  - `/store/*`: Scoped 404 handler with routing telemetry and return links.
- **Scoped Public Assets (`publicPath: "/store/"`)**: Configured in `Bun.build` so bundled chunks and stylesheets resolve cleanly under `/store/`.
- **Inter-MFE Navigation**: Cross-MFE switcher connecting back to Hub (`/`) and Docs (`/docs`).
- **React 19 Native Compiler**: Automatic memoization enabled via `Bun.build({ reactCompiler: true })`.
- **Tailwind CSS v4**: Scoped modern design system styling.
- **Test Isolation**: Router factory (`createAppRouter`) with memory history support for unit testing with `bun:test`.

---

## 📁 Directory Structure

```
packages/store/
├── index.html            # Application HTML shell entrypoint
├── README.md             # Store micro-frontend guide
├── package.json          # Package manifest and dependencies
├── tsconfig.json         # TypeScript configuration with @/* path aliases
├── scripts/
│   └── build.ts          # Bun.build script with publicPath: "/store/" and React Compiler
├── src/
│   ├── index.tsx         # Client DOM entrypoint (createRoot)
│   ├── App.tsx           # Application root exporting App and createAppRouter
│   ├── App.test.tsx      # Store route rendering and 404 tests with bun:test
│   ├── router.tsx        # TanStack Router instance with basepath: "/store"
│   ├── styles.css        # Tailwind CSS entrypoint
│   ├── env.d.ts          # TypeScript environment declarations
│   └── routes/           # TanStack Router route definitions
│       ├── __root.tsx    # Root layout with header, navigation, and telemetry badge
│       ├── index.tsx     # Catalog page (/store/)
│       ├── cart.tsx      # Cart & checkout page (/store/cart)
│       ├── deals.tsx     # Flash deals & coupons page (/store/deals)
│       └── not-found.tsx # Scoped 404 page (/store/*)
```

---

## 🚦 Routing Architecture

### 1. Basepath Configuration
TanStack Router is scoped to the `/store` prefix:
```tsx
export function createAppRouter(initialPath = "/store/") {
  return createRouter({
    routeTree,
    basepath: "/store",
    defaultNotFoundComponent: NotFoundPage,
    history:
      typeof window === "undefined"
        ? createMemoryHistory({ initialEntries: [initialPath] })
        : undefined,
  });
}
```

### 2. Client-Side Routing within Store
Navigates between `/store`, `/store/cart`, and `/store/deals` without page reloads:
```tsx
import { Link } from "@tanstack/react-router";

<Link to="/cart" activeProps={{ className: "text-emerald-300 font-semibold" }}>
  Cart
</Link>
```

---

## 🛠️ Scripts Reference

| Command | Description |
| :--- | :--- |
| `bun run build` | Bundles the Store SPA into `dist/` with `publicPath: "/store/"` |
| `bun run dev` | Starts watch mode, rebuilding incrementally on file changes |
| `bun test` | Runs component and routing tests using `bun:test` |
