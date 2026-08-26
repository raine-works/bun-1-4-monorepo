import { existsSync } from "node:fs";
import { join } from "node:path";
import { env } from "@/lib/env";
import { injectLiveReload } from "@/lib/live-reload";

/**
 * Configuration options for serving micro-frontend assets and SPAs.
 */
export interface ServeMicroFrontendOptions {
  /** Absolute filesystem or virtual path to the primary frontend dist directory. */
  distDir: string;
  /** Whether development live reload script injection is enabled. */
  enableLiveReload?: boolean;
}

/**
 * Returns the MIME content type based on the file extension.
 *
 * @param filePath - Path or filename of the asset.
 * @returns Standard MIME content type with charset if applicable.
 */
export function getMimeType(filePath: string): string {
  const clean = filePath.split("?")[0].toLowerCase();
  if (clean.endsWith(".html")) return "text/html; charset=utf-8";
  if (clean.endsWith(".js") || clean.endsWith(".mjs")) return "text/javascript; charset=utf-8";
  if (clean.endsWith(".css")) return "text/css; charset=utf-8";
  if (clean.endsWith(".json")) return "application/json; charset=utf-8";
  if (clean.endsWith(".svg")) return "image/svg+xml";
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".ico")) return "image/x-icon";
  if (clean.endsWith(".woff2")) return "font/woff2";
  if (clean.endsWith(".woff")) return "font/woff";
  if (clean.endsWith(".map")) return "application/json";
  if (clean.endsWith(".txt")) return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

/**
 * Returns HTTP caching and security headers optimized for Lighthouse scores.
 * Hashed assets (chunk-*.js, chunk-*.css) receive immutable 1-year caching.
 * HTML documents receive max-age=0 must-revalidate for fresh updates.
 *
 * @param filePath - The path or filename of the asset.
 * @param isDev - Whether live reload development mode is active.
 * @returns Headers dictionary.
 */
export function getAssetHeaders(filePath: string, isDev = false): Record<string, string> {
  const mimeType = getMimeType(filePath);
  const isHtml = mimeType.startsWith("text/html");
  const isHashedChunk = /chunk-[a-zA-Z0-9_-]+\.(js|css)(\.map)?$/.test(filePath);

  let cacheControl: string;
  if (isHtml) {
    cacheControl = isDev
      ? "no-cache, no-store, must-revalidate"
      : "public, max-age=0, must-revalidate";
  } else if (isHashedChunk) {
    cacheControl = "public, max-age=31536000, immutable";
  } else if (/\.(woff2?|png|jpe?g|svg|webp|ico|txt)$/.test(filePath)) {
    cacheControl = "public, max-age=86400";
  } else {
    cacheControl = isDev ? "no-cache, must-revalidate" : "public, max-age=3600";
  }

  return {
    "Content-Type": mimeType,
    "Cache-Control": cacheControl,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

/**
 * Determines whether the current process is executing within a self-contained Bun standalone binary.
 * Standalone binaries embed assets in Bun's virtual filesystem (`/$bunfs` or `Bun.embeddedFiles`).
 *
 * @returns `true` if running as a compiled standalone executable, `false` otherwise.
 */
export function isStandaloneMode(): boolean {
  return Boolean(Bun.embeddedFiles?.length > 0 || import.meta.dir.startsWith("/$bunfs"));
}

/**
 * Resolves the primary frontend distribution directory based on the execution context:
 * - Environment override (`process.env.FRONTEND_DIST`) if set.
 * - Virtual embedded path inside compiled standalone binary (`/$bunfs/...`).
 * - Workspace package path in local development (`packages/hub/dist`).
 *
 * @returns The resolved path to the primary frontend's `dist` directory.
 */
export function resolveFrontendDist(): string {
  if (env.FRONTEND_DIST) {
    return env.FRONTEND_DIST;
  }

  // 1. Embedded path inside compiled standalone binary
  const embeddedPath = join(import.meta.dir, "packages/hub/dist");
  if (existsSync(embeddedPath)) {
    return embeddedPath;
  }

  // 2. Workspace path during standard development (from src/lib -> packages/hub/dist)
  const workspacePath = join(import.meta.dir, "../../../hub/dist");
  if (existsSync(workspacePath)) {
    return workspacePath;
  }

  // 3. Fallback relative to src/ (if executed directly from src)
  const srcWorkspacePath = join(import.meta.dir, "../../hub/dist");
  if (existsSync(srcWorkspacePath)) {
    return srcWorkspacePath;
  }

  // 4. Adjacent path
  const adjacentPath = join(import.meta.dir, "../hub/dist");
  if (existsSync(adjacentPath)) {
    return adjacentPath;
  }

  return workspacePath;
}

/**
 * Serves micro-frontend assets and handles SPA routing fallbacks across both standalone binary
 * (embedded virtual assets) and development/production (local filesystem) modes.
 *
 * Route Resolution Rules:
 * 1. Special assets (/robots.txt, /favicon.ico) are answered directly with caching headers.
 * 2. Scoped micro-frontends (e.g., `/store/*`, `/docs/*`):
 *    - Serves matching static files with immutable caching for hashed chunks.
 *    - Falls back to the scoped MFE's `index.html` for client-side navigation.
 * 3. Root frontend (`/` and unmatched client routes):
 *    - Serves hub static files or falls back to hub's `index.html`.
 * 4. In development mode with live reload active, injects the live-reload script into HTML files.
 *
 * @param req - The incoming HTTP `Request`.
 * @param options - Micro-frontend serving options.
 * @returns An HTTP `Response` streaming the requested asset or HTML SPA shell.
 */
export async function serveMicroFrontend(
  req: Request,
  options: ServeMicroFrontendOptions
): Promise<Response> {
  const url = new URL(req.url);
  const urlPath = url.pathname;

  // Handle standard SEO & browser default requests
  if (urlPath === "/robots.txt") {
    return new Response("User-agent: *\nAllow: /\n", {
      headers: getAssetHeaders("robots.txt", false),
    });
  }

  if (urlPath === "/favicon.ico") {
    const svgFavicon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>`;
    return new Response(svgFavicon, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  const pathSegments = urlPath.split("/").filter(Boolean);
  const firstSegment = pathSegments[0] || "";
  const enableLiveReload = Boolean(options.enableLiveReload);
  const distDir = options.distDir;

  // 1. Embedded assets resolution (when compiled to standalone binary)
  const embeddedFiles = (Bun.embeddedFiles ?? []) as Array<Blob & { name?: string }>;
  if (embeddedFiles.length > 0) {
    // Case A: Scoped sub-path MFE (e.g. /store/* -> mfes/store/*, /docs/* -> mfes/docs/*)
    if (firstSegment && embeddedFiles.some((f) => f.name?.startsWith(`mfes/${firstSegment}/`))) {
      const subPath = pathSegments.slice(1).join("/");
      if (subPath) {
        const mfeAsset = embeddedFiles.find(
          (f) =>
            f.name === `mfes/${firstSegment}/${subPath}` ||
            f.name?.endsWith(`/${firstSegment}/${subPath}`)
        );
        if (mfeAsset) {
          return new Response(mfeAsset, {
            headers: getAssetHeaders(subPath, false),
          });
        }
        if (/\.[a-zA-Z0-9]+$/.test(subPath)) {
          return new Response("Not Found", { status: 404 });
        }
      }

      // SPA fallback for scoped MFE
      const mfeIndex = embeddedFiles.find((f) => f.name === `mfes/${firstSegment}/index.html`);
      if (mfeIndex) {
        return new Response(mfeIndex, {
          headers: getAssetHeaders("index.html", false),
        });
      }
    }

    // Case B: Root / Primary MFE (mfes/hub/*, mfes/frontend/* or dist/*)
    const cleanPath = urlPath.startsWith("/") ? urlPath.slice(1) : urlPath;
    if (cleanPath !== "") {
      const rootAsset = embeddedFiles.find(
        (f) =>
          f.name === cleanPath ||
          f.name === `mfes/hub/${cleanPath}` ||
          f.name === `mfes/frontend/${cleanPath}` ||
          f.name === `dist/${cleanPath}` ||
          f.name?.endsWith(`/${cleanPath}`)
      );
      if (rootAsset) {
        return new Response(rootAsset, {
          headers: getAssetHeaders(cleanPath, false),
        });
      }
      if (/\.[a-zA-Z0-9]+$/.test(cleanPath)) {
        return new Response("Not Found", { status: 404 });
      }
    }

    // SPA fallback for root frontend (hub)
    const rootIndex =
      embeddedFiles.find((f) => f.name === "mfes/hub/index.html") ||
      embeddedFiles.find((f) => f.name === "mfes/frontend/index.html") ||
      embeddedFiles.find((f) => f.name?.endsWith("index.html"));
    if (rootIndex) {
      return new Response(rootIndex, {
        headers: getAssetHeaders("index.html", false),
      });
    }
  }

  // 2. Local filesystem resolution (development / production mode)
  // Case A: Scoped sub-path MFE in packages/<segment>/dist
  if (firstSegment) {
    const scopedMfeDir = join(import.meta.dir, `../../../${firstSegment}/dist`);
    if (existsSync(scopedMfeDir)) {
      const subPath = pathSegments.slice(1).join("/");
      if (subPath) {
        let scopedAsset = Bun.file(join(scopedMfeDir, subPath));
        let exists = await scopedAsset.exists();
        // In dev mode, wait briefly if the bundle is currently being written by bun build
        if (!exists && enableLiveReload && /\.[a-zA-Z0-9]+$/.test(subPath)) {
          for (let attempt = 0; attempt < 6; attempt++) {
            await Bun.sleep(25);
            scopedAsset = Bun.file(join(scopedMfeDir, subPath));
            if (await scopedAsset.exists()) {
              exists = true;
              break;
            }
          }
        }

        if (exists) {
          return scopedAsset.type === "text/html" && enableLiveReload
            ? injectLiveReload(scopedAsset)
            : new Response(scopedAsset, {
                headers: getAssetHeaders(subPath, enableLiveReload),
              });
        }
        if (/\.[a-zA-Z0-9]+$/.test(subPath)) {
          return new Response("Not Found", { status: 404 });
        }
      }

      let scopedIndex = Bun.file(join(scopedMfeDir, "index.html"));
      let indexExists = await scopedIndex.exists();
      if (!indexExists && enableLiveReload) {
        for (let attempt = 0; attempt < 6; attempt++) {
          await Bun.sleep(25);
          scopedIndex = Bun.file(join(scopedMfeDir, "index.html"));
          if (await scopedIndex.exists()) {
            indexExists = true;
            break;
          }
        }
      }

      if (indexExists) {
        return enableLiveReload
          ? injectLiveReload(scopedIndex)
          : new Response(scopedIndex, {
              headers: getAssetHeaders("index.html", false),
            });
      }
    }
  }

  // Case B: Root frontend resolution
  const assetPath = join(distDir, urlPath);
  let assetFile = Bun.file(assetPath);
  let rootAssetExists = await assetFile.exists();

  if (!rootAssetExists && enableLiveReload && /\.[a-zA-Z0-9]+$/.test(urlPath)) {
    for (let attempt = 0; attempt < 6; attempt++) {
      await Bun.sleep(25);
      assetFile = Bun.file(assetPath);
      if (await assetFile.exists()) {
        rootAssetExists = true;
        break;
      }
    }
  }

  if (rootAssetExists) {
    if (assetPath.endsWith(".html") && enableLiveReload) {
      return injectLiveReload(assetFile);
    }
    return new Response(assetFile, {
      headers: getAssetHeaders(urlPath, enableLiveReload),
    });
  }

  if (/\.[a-zA-Z0-9]+$/.test(urlPath)) {
    return new Response("Not Found", { status: 404 });
  }

  // SPA fallback to index.html on local filesystem
  let indexFile = Bun.file(join(distDir, "index.html"));
  let rootIndexExists = await indexFile.exists();
  if (!rootIndexExists && enableLiveReload) {
    for (let attempt = 0; attempt < 6; attempt++) {
      await Bun.sleep(25);
      indexFile = Bun.file(join(distDir, "index.html"));
      if (await indexFile.exists()) {
        rootIndexExists = true;
        break;
      }
    }
  }

  if (rootIndexExists) {
    return enableLiveReload
      ? injectLiveReload(indexFile)
      : new Response(indexFile, {
          headers: getAssetHeaders("index.html", false),
        });
  }

  if (enableLiveReload) {
    const loadingHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Bun 1.4 micro-frontend compilation loader" />
  <title>Building Frontend...</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0d1117; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #1e293b; padding: 2rem 2.5rem; border-radius: 12px; border: 1px solid #334155; text-align: center; max-width: 480px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
    .spinner { border: 3px solid #334155; border-top: 3px solid #38bdf8; border-radius: 50%; width: 36px; height: 36px; animation: spin 0.8s linear infinite; margin: 0 auto 1.25rem; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    h2 { margin: 0 0 0.5rem; font-size: 1.25rem; }
    p { margin: 0; color: #94a3b8; font-size: 0.875rem; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Compiling Micro-Frontends...</h2>
    <p>The Bun bundler is preparing your application. This page will automatically reload once ready.</p>
  </div>
</body>
</html>`;
    return injectLiveReload(loadingHtml);
  }

  return new Response("Frontend not built yet. Run 'bun run build' or start in dev mode.", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
