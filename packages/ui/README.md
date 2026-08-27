# @app/ui

Central shared UI components, blocks, hooks, layout containers, and utility library for micro-frontends across the monorepo.

## Utilities & Hooks (`@app/ui/lib/utils`, `@app/ui/hooks`, `@app/ui`)

- **`cn(...inputs)`**: Tailwind-aware class merging combining `clsx` (conditional class joining) with `tailwind-merge` (deduplication of conflicting Tailwind utilities).
- **`useIsMobile()`**: Responsive breakpoint hook (`< 768px`) using event-driven `window.matchMedia` with SSR-safe hydration.

## Primitives & Components (`@app/ui/components`)

- **`Badge`**: Status badge indicator with optional pulsing dot and color variants (`sky`, `pink`, `emerald`, `amber`, `rose`, `slate`, `default`).
- **`Button`**: Accessible button with style variants (`primary`, `pink`, `emerald`, `secondary`, `danger`, `ghost`) and sizes (`sm`, `md`, `lg`).
- **`Card` family**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
- **`TelemetryBadge`**: Micro-frontend routing telemetry badge showing active scope and current SPA route.

## Global Blocks & Layouts (`@app/ui/blocks`, `@app/ui/layouts`)

- **`NotFoundView`**: Reusable 404 page with micro-frontend routing telemetry and recovery links.
- **`GlobalMfeNav`**: Global navigation switcher between micro-frontends (`Hub (/)`, `Store (/store)`, `Docs (/docs)`).
- **`MfeHeader`**: Standardized application header combining branding, telemetry, global switcher, and intra-MFE navigation.
- **`MfeFooter`**: Standardized application footer with basepath telemetry.
- **`MfeLayout`**: Responsive monorepo shell layout container.

## Usage

```tsx
import { cn, useIsMobile, Badge, Button, Card, CardHeader, CardTitle, NotFoundView, MfeLayout } from '@app/ui';
```
