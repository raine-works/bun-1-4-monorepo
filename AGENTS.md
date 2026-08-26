# Project Guidelines & Rules

## Import Aliases Rule

- **Always use import aliases** rather than relative imports (`./` or `../`) anywhere in this codebase:
  - Within each package, use the `@/*` alias for internal file imports (e.g., `import { db } from "@/client"`, `import { NotFoundPage } from "@/routes/not-found"`).
  - For cross-package references, use the `@app/<package>` workspace alias (e.g., `import { db } from "@app/data"`, `import type { User } from "@app/data"`) or shorthand aliases (e.g., `@data`, `@backend`, `@docs`, `@hub`, `@store`).
  - Never use relative imports like `import ... from "./client"` or `import ... from "../contracts/user"` in source files, test files, or build scripts.
