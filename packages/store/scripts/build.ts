import { join } from 'node:path';
import { runFrontendBuildCli } from '@app/tools/build';

/**
 * Store Micro-Frontend Build Script
 * ----------------------------------------------------------------------------
 * Bundles the Store MFE using `@app/tools/build` with:
 * - HTML entrypoint resolution (`index.html`)
 * - Public asset base path (`publicPath: "/store/"`)
 * - Tailwind CSS plugin (`bun-plugin-tailwind`)
 * - Native React 19 Compiler auto-memoization (`reactCompiler: true`)
 * - Watch mode (`--watch`) with fast sub-millisecond incremental rebuilding
 */

const packageDir = join(import.meta.dir, '..');

await runFrontendBuildCli({
	name: 'store',
	packageDir,
	publicPath: '/store/',
});
