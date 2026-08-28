# @app/ui

Central shared UI components, design system primitives, layout containers, composite blocks, and hooks for micro-frontends across the **Bun 1.4 Full-Stack Monorepo**.

---

## 🚀 Key Responsibilities

- **Unified Design System**: Standardized styling across all micro-frontends (`@app/hub`, `@app/store`, `@app/docs`) using Tailwind CSS v4.
- **Component Primitives**: Accessible, customizable UI elements including `Badge`, `Button`, `Card`, and `TelemetryBadge`.
- **Composite Navigation & Layout Blocks**: Standardized layout shells (`MfeLayout`), application headers (`MfeHeader`), footers (`MfeFooter`), cross-MFE switchers (`GlobalMfeNav`), and catch-all 404 views (`NotFoundView`).
- **Responsive Hooks & Utilities**: Breakpoint detection (`useIsMobile`) and collision-free class merging (`cn`).

---

## 📁 Directory Structure

```
packages/ui/
├── README.md              # UI package architecture & guide
├── package.json           # Package manifest (@app/ui)
├── tsconfig.json          # TypeScript configuration (@/* & @ui aliases)
└── src/
    ├── index.ts           # Public package exports
    ├── ui.test.tsx        # UI components unit tests
    ├── lib/
    │   └── utils.ts       # cn class merging utility (clsx + tailwind-merge)
    ├── hooks/
    │   ├── index.ts
    │   └── use-mobile.ts  # Responsive breakpoint hook (< 768px)
    ├── components/        # Reusable UI primitives
    │   ├── index.ts
    │   ├── badge.tsx      # Status badge with pulsing dot and color variants
    │   ├── button.tsx     # Accessible button with style and size variants
    │   ├── card.tsx       # Card container family (Card, CardHeader, CardTitle, etc.)
    │   └── telemetry-badge.tsx # Micro-frontend route telemetry badge
    ├── blocks/            # Global composite blocks
    │   ├── index.ts
    │   ├── global-mfe-nav.tsx # Cross-MFE switcher (Hub, Store, Docs)
    │   ├── mfe-header.tsx # Standardized MFE header with telemetry & navigation
    │   ├── mfe-footer.tsx # Standardized MFE footer
    │   └── not-found-view.tsx # Diagnostic 404 catch-all view
    └── layouts/           # Structural layouts
        ├── index.ts
        └── mfe-layout.tsx # Standardized MFE shell layout container
```

---

## 🧩 Component & Block Catalog

### 1. UI Primitives (`@app/ui/components`)

- **`Badge`**: Status badge with color variants (`sky`, `pink`, `emerald`, `amber`, `rose`, `slate`, `default`) and optional pulsing dot indicator.
  ```tsx
  <Badge variant="emerald" pulse>Online</Badge>
  ```
- **`Button`**: Accessible button with styling variants (`primary`, `pink`, `emerald`, `secondary`, `danger`, `ghost`) and sizes (`sm`, `md`, `lg`).
  ```tsx
  <Button variant="primary" size="md" onClick={handleClick}>Action</Button>
  ```
- **`Card` Family**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
  ```tsx
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
      <CardDescription>Description</CardDescription>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>
  ```
- **`TelemetryBadge`**: Micro-frontend routing telemetry badge displaying the current MFE basepath and active client route.

### 2. Composite Blocks & Layouts (`@app/ui/blocks`, `@app/ui/layouts`)

- **`MfeLayout`**: Responsive shell wrapper combining `MfeHeader`, content container, and `MfeFooter`.
  ```tsx
  <MfeLayout currentPath="/store/cart" activeMfe="store">
    <Outlet />
  </MfeLayout>
  ```
- **`GlobalMfeNav`**: Global navigation switcher between micro-frontends (`Hub (/)`, `Store (/store)`, `Docs (/docs)`).
- **`NotFoundView`**: Rich 404 page rendering micro-frontend routing telemetry and recovery links.

### 3. Hooks & Utilities (`@app/ui/hooks`, `@app/ui/lib/utils`)

- **`cn(...inputs)`**: Tailwind-aware class merging combining `clsx` (conditional classes) with `tailwind-merge` (deduplication of conflicting utility classes).
- **`useIsMobile(breakpoint = 768)`**: Responsive breakpoint hook using event-driven `window.matchMedia` with SSR hydration safety.

---

## 🛠️ Scripts Reference

| Command | Description |
| :--- | :--- |
| `bun test` | Execute unit and SSR rendering tests using `bun:test` |
| `bun run typecheck` | Perform strict TypeScript type checking (`tsc --noEmit`) |

---

## 🔗 Import Aliases & Subpath Exports

```tsx
// Full package import
import { Badge, Button, Card, CardHeader, CardTitle, MfeLayout, NotFoundView, cn, useIsMobile } from "@app/ui";

// Subpath imports & aliases
import { Button, Badge } from "@app/ui/components";
import { MfeLayout } from "@app/ui/layouts";
import { NotFoundView } from "@app/ui/blocks";
import { useIsMobile } from "@app/ui/hooks";
import { cn } from "@app/ui/lib/utils";

// Shorthand aliases
import { Badge } from "@ui/components";
import { cn } from "@ui/lib/utils";
```

