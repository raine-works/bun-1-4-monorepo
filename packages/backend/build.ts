import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

/**
 * Standalone Binary Compilation Script
 * ----------------------------------------------------------------------------
 * 1. Discovers and builds all configured micro-frontends (@app/hub, @app/store, @app/docs).
 * 2. Stages their build outputs under `packages/backend/dist/mfes/`.
 * 3. Compiles `packages/backend/src/index.ts` with `--compile --bytecode --minify --asset=mfes`
 *    into a single self-contained standalone executable binary (`packages/backend/dist/server`).
 */

console.log("⚡ Compiling standalone binary executable with Bun 1.4...");

const repoRoot = join(import.meta.dir, "../..");
const backendDist = join(import.meta.dir, "dist");
const stagedMfesDir = join(backendDist, "mfes");
const outfile = join(backendDist, "server");

/**
 * Micro-frontend applications to embed into the standalone binary.
 * To add a new MFE to the binary, register its package name, path, and mount route here.
 */
const microFrontends = [
  { name: "@app/hub", path: "packages/hub", route: "hub" },
  { name: "@app/store", path: "packages/store", route: "store" },
  { name: "@app/docs", path: "packages/docs", route: "docs" },
];

/**
 * Helper to clean up any temporary `.bun-build` artifacts emitted during compilation.
 *
 * @param dir - Directory path to inspect and clean.
 */
function cleanBunBuildArtifacts(dir: string) {
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir)) {
    if (file.includes(".bun-build")) {
      try {
        rmSync(join(dir, file), { force: true });
      } catch {
        // Ignore
      }
    }
  }
}

// Clean any leftover temp files before build
cleanBunBuildArtifacts(repoRoot);
cleanBunBuildArtifacts(import.meta.dir);
cleanBunBuildArtifacts(backendDist);

// Ensure clean dist and staging directories
mkdirSync(backendDist, { recursive: true });
if (existsSync(stagedMfesDir)) {
  rmSync(stagedMfesDir, { recursive: true, force: true });
}
mkdirSync(stagedMfesDir, { recursive: true });

// Build and stage each micro-frontend
for (const mfe of microFrontends) {
  console.log(`🔨 Building ${mfe.name}...`);
  await Bun.$`bun run --filter ${mfe.name} build`.cwd(repoRoot);

  const mfeDist = join(repoRoot, mfe.path, "dist");
  const targetDir = join(stagedMfesDir, mfe.route);
  mkdirSync(targetDir, { recursive: true });
  cpSync(mfeDist, targetDir, { recursive: true });
  console.log(`📦 Staged ${mfe.name} -> dist/mfes/${mfe.route}`);
}

// Compile standalone binary (run within dist directory to contain compiler scratch files)
await Bun.$`bun build --compile --minify --bytecode --define process.env.NODE_ENV='"production"' --asset=mfes --outfile=server ../src/index.ts`.cwd(
  backendDist
);

// Clean up compiler scratch files immediately
cleanBunBuildArtifacts(backendDist);
cleanBunBuildArtifacts(import.meta.dir);
cleanBunBuildArtifacts(repoRoot);

console.log(`✅ Standalone binary executable successfully created: ${outfile}`);
