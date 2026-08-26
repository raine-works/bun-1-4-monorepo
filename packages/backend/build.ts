import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

console.log("⚡ Compiling standalone binary executable with Bun 1.4...");

const repoRoot = join(import.meta.dir, "../..");
const backendDist = join(import.meta.dir, "dist");
const stagedMfesDir = join(backendDist, "mfes");
const outfile = join(backendDist, "server");

/**
 * Micro-frontend applications to embed into the standalone binary.
 * To add a new MFE, simply add an entry to this array:
 */
const microFrontends = [
  { name: "@app/hub", path: "packages/hub", route: "hub" },
  { name: "@app/store", path: "packages/store", route: "store" },
  { name: "@app/docs", path: "packages/docs", route: "docs" },
];

// Helper to clean up any temporary .bun-build artifacts left by Bun compiler
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
  const mfeDist = join(repoRoot, mfe.path, "dist");
  if (!existsSync(mfeDist)) {
    console.log(`🔨 Building ${mfe.name}...`);
    await Bun.$`bun run --filter ${mfe.name} build`.cwd(repoRoot);
  }

  const targetDir = join(stagedMfesDir, mfe.route);
  mkdirSync(targetDir, { recursive: true });
  cpSync(mfeDist, targetDir, { recursive: true });
  console.log(`📦 Staged ${mfe.name} -> dist/mfes/${mfe.route}`);
}

// Compile standalone binary (run within dist directory to contain compiler scratch files)
await Bun.$`bun build --compile --minify --bytecode --asset=mfes --outfile=server ../src/index.ts`.cwd(
  backendDist
);

// Clean up compiler scratch files immediately
cleanBunBuildArtifacts(backendDist);
cleanBunBuildArtifacts(import.meta.dir);
cleanBunBuildArtifacts(repoRoot);

console.log(`✅ Standalone binary executable successfully created: ${outfile}`);
