import { existsSync, rmSync, watch } from "node:fs";
import { join } from "node:path";
import tailwind from "bun-plugin-tailwind";

/**
 * Docs Micro-Frontend Build Script
 * ----------------------------------------------------------------------------
 * Bundles the Docs MFE using `Bun.build` with:
 * - HTML entrypoint resolution (`index.html`)
 * - Public asset base path (`publicPath: "/docs/"`)
 * - Tailwind CSS plugin (`bun-plugin-tailwind`)
 * - Native React 19 Compiler auto-memoization (`reactCompiler: true`)
 * - Watch mode (`--watch`) with fast sub-millisecond incremental rebuilding
 */

const isWatch = process.argv.includes("--watch");
const isProduction = process.env.NODE_ENV === "production" || !isWatch;
const outdir = "./dist";

/**
 * Executes a single build pass of the Docs application bundle.
 */
async function build() {
  if (!isWatch && existsSync(outdir)) {
    rmSync(outdir, { recursive: true, force: true });
  }

  const buildResult = await Bun.build({
    entrypoints: ["index.html"],
    outdir,
    publicPath: "/docs/",
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

console.log("⚡ Building docs with Bun.build, Tailwind CSS, and React Compiler...");
await build();

if (isWatch) {
  console.log("👀 Watching for changes in docs (src/ and index.html)...");
  const srcDir = join(import.meta.dir, "src");
  const indexHtml = join(import.meta.dir, "index.html");

  let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
  const triggerRebuild = (file: string) => {
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(async () => {
      console.log(`🔄 File changed (${file}), rebuilding docs...`);
      await build();
    }, 50);
  };

  const srcWatcher = watch(srcDir, { recursive: true }, (_, filename) => {
    if (filename) triggerRebuild(filename);
  });
  const indexWatcher = watch(indexHtml, () => {
    triggerRebuild("index.html");
  });

  process.on("SIGINT", () => {
    srcWatcher.close();
    indexWatcher.close();
    process.exit(0);
  });
}
