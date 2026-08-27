import { join } from 'node:path';
import { runFrontendBuildCli } from '@app/tools/build';

/**
 * Docs Micro-Frontend Build Script
 * ----------------------------------------------------------------------------
 * Bundles the Docs MFE using `@app/tools/build` with:
 * - HTML entrypoint resolution (`index.html`)
 * - Public asset base path (`publicPath: "/docs/"`)
 * - Tailwind CSS plugin (`bun-plugin-tailwind`)
 * - Native React 19 Compiler auto-memoization (`reactCompiler: true`)
 * - Watch mode (`--watch`) with fast sub-millisecond incremental rebuilding
 */

const packageDir = join(import.meta.dir, '..');

await runFrontendBuildCli({
	name: 'docs',
	packageDir,
	publicPath: '/docs/',
});
