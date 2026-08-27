# @app/tools

Central shared tools, build scripts, HTTP utilities, environment parsers, and SQL helpers for the monorepo.

## Modules

- **Build (`@app/tools/build`)**: Bundling and live-rebuilding micro-frontends with `Bun.build`, Tailwind CSS, and React 19 Compiler.
- **CLI (`@app/tools/cli`)**: ANSI terminal color palettes and `.bun-build` artifact cleaning.
- **Env (`@app/tools/env`)**: Scoped `.env` file loader and base Zod schemas.
- **HTTP (`@app/tools/http`)**: MIME type lookup, caching headers, CORS headers, and standalone runtime detection.
- **SQL (`@app/tools/sql`)**: Count extraction and SQL migration block parsing (`-- up`, `-- down`).

## Usage

```ts
// In build scripts:
import { runFrontendBuildCli } from '@app/tools/build';

// In server/data utilities:
import { CORS_HEADERS, getAssetHeaders } from '@app/tools/http';
import { loadEnvFiles, parseEnv } from '@app/tools/env';
import { parseCount } from '@app/tools/sql';
```
