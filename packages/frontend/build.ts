import { existsSync, rmSync } from "node:fs";

console.log("⚡ Building frontend with Bun.build and React Compiler...");

const outdir = "./dist";
if (existsSync(outdir)) {
  rmSync(outdir, { recursive: true, force: true });
}

const buildResult = await Bun.build({
  entrypoints: ["index.html"],
  outdir,
  reactCompiler: true,
  minify: true,
  sourcemap: "linked",
});

if (!buildResult.success) {
  console.error("❌ Build failed:");
  for (const log of buildResult.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log(`✅ Build succeeded! Emitted ${buildResult.outputs.length} files to ${outdir}`);
for (const output of buildResult.outputs) {
  console.log(`   - ${output.path} (${output.size} bytes)`);
}
