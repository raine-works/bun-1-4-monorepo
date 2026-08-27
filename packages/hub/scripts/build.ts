import { join } from 'node:path';
import { runFrontendBuildCli } from '@app/tools/build';

/**
 * Hub Frontend Build Script
 * ----------------------------------------------------------------------------
 * Bundles the Hub application using `@app/tools/build` with:
 * - HTML entrypoint resolution (`index.html`)
 * - Tailwind CSS plugin (`bun-plugin-tailwind`)
 * - Native React 19 Compiler auto-memoization (`reactCompiler: true`)
 * - Watch mode (`--watch`) with fast sub-millisecond incremental rebuilding
 */

const packageDir = join(import.meta.dir, '..');

await runFrontendBuildCli({
	name: 'hub',
	packageDir,
	publicPath: '/',
});
