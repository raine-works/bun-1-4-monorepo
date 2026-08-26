import { existsSync, rmSync, watch } from "node:fs";
import { join } from "node:path";
import tailwind from "bun-plugin-tailwind";

const isWatch = process.argv.includes("--watch");
const outdir = "./dist";

async function build() {
  if (!isWatch && existsSync(outdir)) {
    rmSync(outdir, { recursive: true, force: true });
  }

  const buildResult = await Bun.build({
    entrypoints: ["index.html"],
    outdir,
    publicPath: "/",
    plugins: [tailwind],
    reactCompiler: true,
    minify: !isWatch,
    sourcemap: "linked",
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

console.log("⚡ Building hub with Bun.build, Tailwind CSS, and React Compiler...");
await build();

if (isWatch) {
  console.log("👀 Watching for changes in hub (src/ and index.html)...");
  const srcDir = join(import.meta.dir, "src");
  const indexHtml = join(import.meta.dir, "index.html");

  let rebuildTimer: ReturnType<typeof setTimeout> | null = null;
  const triggerRebuild = (file: string) => {
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(async () => {
      console.log(`🔄 File changed (${file}), rebuilding hub...`);
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
