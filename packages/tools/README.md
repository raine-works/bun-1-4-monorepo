# @app/tools

Central shared tools, build runners, HTTP utilities, environment parsers, global prototype extensions, and SQL helpers for the **Bun 1.4 Full-Stack Monorepo**.

---

## 🚀 Key Modules & Capabilities

- **Build (`@app/tools/build`)**: Production bundling and incremental watch/rebuild runners using `Bun.build`, `bun-plugin-tailwind`, and native React 19 Compiler (`reactCompiler: true`).
- **Prototypes (`@app/tools/prototypes`)**: Safe global prototype extensions for Arrays (`isEmpty()`, `flush()`, `unique()`) and Promises (`tryCatch()`, `Promise.tryCatch()`) with strongly typed discriminated union `Result<T, E>`.
- **HTTP (`@app/tools/http`)**: Standard CORS headers, MIME content-type resolver, browser caching headers with immutable chunk rules, and standalone executable binary runtime detection (`isStandaloneMode`).
- **Env (`@app/tools/env`)**: Package-scoped `.env.local` / `.env` loader (`loadEnvFiles`) and Zod schema environment validator (`parseEnv`, `baseEnvSchema`).
- **SQL (`@app/tools/sql`)**: Count parser for PostgreSQL queries (`parseCount`) and handwritten SQL migration file block parser (`parseMigrationSql` for `-- up` / `-- down`).
- **CLI (`@app/tools/cli`)**: Terminal ANSI color palettes (`colors`) and `.bun-build` temporary compilation artifact cleaner.

---

## 📁 Directory Structure

```
packages/tools/
├── README.md              # Tools package architecture & guide
├── package.json           # Package manifest (@app/tools)
├── tsconfig.json          # TypeScript configuration (@/* & @tools aliases)
└── src/
    ├── index.ts           # Public package exports
    ├── build.ts           # Frontend build runner (buildFrontend, runFrontendBuildCli)
    ├── cli.ts             # ANSI terminal colors & .bun-build artifact cleaner
    ├── env.ts             # Scoped env loader & Zod schema parser
    ├── http.ts            # CORS headers, MIME lookup, caching headers & standalone mode detection
    ├── prototypes.ts      # Global Array & Promise prototype extensions and Result types
    ├── prototypes.test.ts # Prototype extensions unit tests
    ├── sql.ts             # SQL count & migration parsing utilities
    └── tools.test.ts      # Tools package integration & unit tests
```

---

## 📚 Module Reference & Usage

### 1. Build Utilities (`@app/tools/build`)

Used in each micro-frontend build script (`packages/{hub,store,docs}/scripts/build.ts`):

```ts
import { runFrontendBuildCli } from "@app/tools/build";
import { join } from "node:path";

await runFrontendBuildCli({
  name: "store",
  packageDir: join(import.meta.dir, ".."),
  publicPath: "/store/",
});
```

### 2. Global Prototype Extensions (`@app/tools/prototypes`)

Import once at application entry points or within libraries for zero-boilerplate array handling and Go-style error handling:

```ts
import "@app/tools/prototypes";

// Array extensions
const items = [1, 2, 2, 3];
items.isEmpty(); // false
items.unique();  // [1, 2, 3]
items.flush();   // Mutates array to []

// Promise tryCatch extension (returns discriminated union: { data, error })
const { data, error } = await db.users.findById("u-123").tryCatch();
if (error) {
  console.error("Failed to query user:", error);
  return;
}
console.log("User:", data.name);
```

### 3. HTTP & Caching Headers (`@app/tools/http`)

Used by the backend server for CORS handling, MIME negotiation, and static file caching:

```ts
import { CORS_HEADERS, getAssetHeaders, getMimeType, isStandaloneMode } from "@app/tools/http";

// Get MIME type
const mime = getMimeType("index.html"); // "text/html; charset=utf-8"

// Get optimized HTTP caching headers
const headers = getAssetHeaders("chunk-xyz.js", false);
// => Cache-Control: "public, max-age=31536000, immutable"

// Runtime environment detection
const isCompiledBinary = isStandaloneMode();
```

### 4. Scoped Environment Loader & Zod Validation (`@app/tools/env`)

```ts
import { baseEnvSchema, loadEnvFiles, parseEnv } from "@app/tools/env";
import { z } from "zod";

// Load .env.local and .env from package directory
loadEnvFiles(import.meta.dir);

// Validate with Zod
const schema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3000),
});

export const env = parseEnv(schema);
```

### 5. SQL Helpers (`@app/tools/sql`)

```ts
import { parseCount, parseMigrationSql } from "@app/tools/sql";

// Parse count from PostgreSQL COUNT(*) query
const rows = await sql`SELECT count(*)::text AS count FROM users`;
const totalUsers = parseCount(rows);

// Parse migration files
const { up, down } = parseMigrationSql(migrationContent);
```

---

## 🛠️ Scripts Reference

| Command | Description |
| :--- | :--- |
| `bun test` | Execute unit and prototype tests using `bun:test` |
| `bun run typecheck` | Perform strict TypeScript type checking (`tsc --noEmit`) |

---

## 🔗 Import Aliases & Subpath Exports

```ts
// Full package import
import { runFrontendBuildCli, loadEnvFiles, parseEnv, getMimeType, parseCount } from "@app/tools";

// Subpath imports & aliases
import { runFrontendBuildCli } from "@app/tools/build";
import { CORS_HEADERS, getAssetHeaders } from "@app/tools/http";
import "@app/tools/prototypes";
import { parseMigrationSql } from "@app/tools/sql";

// Shorthand aliases
import { colors } from "@tools/cli";
import { loadEnvFiles } from "@tools/env";
```

