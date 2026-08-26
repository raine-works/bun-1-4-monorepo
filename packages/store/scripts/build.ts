import { existsSync, rmSync, watch } from "node:fs";
import { join } from "node:path";
import tailwind from "bun-plugin-tailwind";

/**
 * Store Micro-Frontend Build Script
 * ----------------------------------------------------------------------------
 * Bundles the Store MFE using `Bun.build` with:
 * - HTML entrypoint resolution (`index.html`)
 * - Public asset base path (`publicPath: "/store/"`)
 * - Tailwind CSS plugin (`bun-plugin-tailwind`)
 * - Native React 19 Compiler auto-memoization (`reactCompiler: true`)
 * - Watch mode (`--watch`) with fast sub-millisecond incremental rebuilding
 */

const packageDir = join(import.meta.dir, "..");
const isWatch = process.argv.includes("--watch");
const isProduction = process.env.NODE_ENV === "production" || !isWatch;
const outdir = join(packageDir, "dist");
const entrypoint = join(packageDir, "index.html");

/**
 * Executes a single build pass of the Store application bundle.
 */
async function build() {
  if (!isWatch && existsSync(outdir)) {
    rmSync(outdir, { recursive: true, force: true });
  }

  const buildResult = await Bun.build({
    entrypoints: [entrypoint],
    outdir,
    publicPath: "/store/",
    plugins: [tailwind],
    reactCompiler: true,
    target: "browser",
    minify: isProduction,
    define: {
      "process.env.NODE_ENV": JSON.stringify(isProduction ? "production" : "development"),
    },
    splitting: true,
    sourcemap: isWatch ? "linked" : "none",
  });

  if (!buildResult.success) {
    console.error("❌ Build failed:");
    for (const log of buildResult.logs) {
      console.error(log);
    }
    if (!isWatch) {
      process.exit(1);
    }
    return;
  }

  console.log(`✅ Build succeeded! Emitted ${buildResult.outputs.length} files to ${outdir}`);
  for (const output of buildResult.outputs) {
    console.log(`   - ${output.path} (${output.size} bytes)`);
  }
}

console.log("⚡ Building store with Bun.build, Tailwind CSS, and React Compiler...");
await build();

if (isWatch) {
  console.log("👀 Watching for changes in store (src/ and index.html)...");
  const srcDir = join(packageDir, "src");
  const indexHtml = join(packageDir, "index.html");

  let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
  const triggerRebuild = (file: string) => {
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(async () => {
      console.log(`🔄 File changed (${file}), rebuilding store...`);
      await build();
    }, 50);
  };

  const srcWatcher = watch(srcDir, { recursive: true }, (_, filename) => {
    if (filename) triggerRebuild(filename);
  });
  const indexWatcher = watch(indexHtml, () => {
    triggerRebuild("index.html");
  });

  const cleanup = () => {
    srcWatcher.close();
    indexWatcher.close();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}
