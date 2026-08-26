import { existsSync, watch } from "node:fs";
import { join } from "node:path";

export interface ServerInfo {
  name: string;
  bunVersion: string;
  platform: string;
  arch: string;
  uptime: number;
}

export interface Item {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface ServerOptions {
  port?: number;
  liveReload?: boolean;
}

// In-memory data store for backend API
const items: Item[] = [
  {
    id: "1",
    title: "Explore Bun 1.4 features",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Build React app with native React Compiler",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Bundle full-stack into standalone binary executable",
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function isStandaloneMode(): boolean {
  return Boolean(Bun.embeddedFiles?.length > 0 || import.meta.dir.startsWith("/$bunfs"));
}

/**
 * Resolves the frontend distribution directory:
 * - When running as a standalone compiled binary, assets are embedded at /$bunfs/root/packages/frontend/dist
 * - When running in development mode, resolves to ../../frontend/dist
 */
export function resolveFrontendDist(): string {
  if (process.env.FRONTEND_DIST) {
    return process.env.FRONTEND_DIST;
  }

  // 1. Embedded path inside compiled standalone binary
  const embeddedPath = join(import.meta.dir, "packages/frontend/dist");
  if (existsSync(embeddedPath)) {
    return embeddedPath;
  }

  // 2. Workspace path during standard development
  const workspacePath = join(import.meta.dir, "../../frontend/dist");
  if (existsSync(workspacePath)) {
    return workspacePath;
  }

  // 3. Adjacent path
  const adjacentPath = join(import.meta.dir, "../frontend/dist");
  if (existsSync(adjacentPath)) {
    return adjacentPath;
  }

  return workspacePath;
}

const LIVE_RELOAD_SCRIPT = `
<!-- Live Reload Client (Development Only) -->
<script>
  (() => {
    let es;
    function connect() {
      es = new EventSource('/api/live-reload');
      es.onmessage = (event) => {
        if (event.data === 'reload') {
          console.log('⚡ [live-reload] Change detected in micro-frontend, reloading...');
          window.location.reload();
        }
      };
      es.onerror = () => {
        es.close();
        setTimeout(connect, 1000);
      };
    }
    connect();
  })();
</script>
`;

async function injectLiveReload(file: Bun.BunFile): Promise<Response> {
  const html = await file.text();
  const modifiedHtml = html.includes("</body>")
    ? html.replace("</body>", `${LIVE_RELOAD_SCRIPT}\n</body>`)
    : `${html}\n${LIVE_RELOAD_SCRIPT}`;

  return new Response(modifiedHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

function serveDevAsset(file: Bun.BunFile): Response {
  return new Response(file, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

export function createServer(optionsOrPort: number | ServerOptions = 3000) {
  const options: ServerOptions =
    typeof optionsOrPort === "number" ? { port: optionsOrPort } : optionsOrPort;
  const port = options.port ?? 3000;
  const standalone = isStandaloneMode();
  const enableLiveReload = options.liveReload ?? (!standalone && process.env.NODE_ENV !== "test");

  const distDir = resolveFrontendDist();
  const sseClients = new Set<ReadableStreamDefaultController>();

  let watcher: ReturnType<typeof watch> | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Broadcast reload signal to all connected browser clients
  function broadcastReload() {
    const message = new TextEncoder().encode("data: reload\n\n");
    for (const client of sseClients) {
      try {
        client.enqueue(message);
      } catch {
        sseClients.delete(client);
      }
    }
  }

  // Watch for build changes across all micro-frontends in development mode
  if (enableLiveReload) {
    const packagesDir = join(import.meta.dir, "../..");
    if (existsSync(packagesDir)) {
      try {
        watcher = watch(packagesDir, { recursive: true }, (_eventType, filename) => {
          if (!filename) return;
          // Trigger when any micro-frontend dist/ artifact is updated (excluding backend's own dist)
          if (
            filename.includes("dist") &&
            !filename.startsWith("backend/dist") &&
            !filename.endsWith(".tmp")
          ) {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              broadcastReload();
            }, 75);
          }
        });
      } catch (err) {
        console.warn("⚠️ Could not start micro-frontend live-reload watcher:", err);
      }
    }
  }

  const server = Bun.serve({
    port,
    routes: {
      "/api/health": () => {
        return Response.json(
          {
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
          },
          { headers: CORS_HEADERS }
        );
      },
      "/api/info": () => {
        return Response.json(
          {
            name: "@app/backend",
            bunVersion: Bun.version,
            platform: process.platform,
            arch: process.arch,
            uptime: process.uptime(),
            isStandalone: standalone,
            embeddedAssetCount: Bun.embeddedFiles?.length ?? 0,
            memoryUsage: process.memoryUsage(),
            liveReload: enableLiveReload,
          },
          { headers: CORS_HEADERS }
        );
      },
      "/api/live-reload": () => {
        if (!enableLiveReload) {
          return new Response("Live reload disabled in production", { status: 404 });
        }

        let controller: ReadableStreamDefaultController;
        const stream = new ReadableStream({
          start(c) {
            controller = c;
            sseClients.add(controller);
            controller.enqueue(new TextEncoder().encode("data: connected\n\n"));
          },
          cancel() {
            if (controller) {
              sseClients.delete(controller);
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            ...CORS_HEADERS,
          },
        });
      },
    },
    async fetch(req) {
      const url = new URL(req.url);

      // Handle CORS preflight
      if (req.method === "OPTIONS") {
        return new Response(null, { headers: CORS_HEADERS });
      }

      // REST API: /api/items
      if (url.pathname === "/api/items") {
        if (req.method === "GET") {
          return Response.json({ items }, { headers: CORS_HEADERS });
        }

        if (req.method === "POST") {
          try {
            const body = (await req.json()) as { title?: string };
            if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
              return Response.json(
                { error: "Title is required" },
                { status: 400, headers: CORS_HEADERS }
              );
            }

            const newItem: Item = {
              id: crypto.randomUUID(),
              title: body.title.trim(),
              completed: false,
              createdAt: new Date().toISOString(),
            };

            items.push(newItem);
            return Response.json(newItem, { status: 201, headers: CORS_HEADERS });
          } catch {
            return Response.json(
              { error: "Invalid JSON body" },
              { status: 400, headers: CORS_HEADERS }
            );
          }
        }
      }

      // Item toggle / delete: /api/items/:id
      const itemMatch = url.pathname.match(/^\/api\/items\/([^/]+)$/);
      if (itemMatch) {
        const id = itemMatch[1];
        const index = items.findIndex((i) => i.id === id);

        if (index === -1) {
          return Response.json({ error: "Item not found" }, { status: 404, headers: CORS_HEADERS });
        }

        if (req.method === "PATCH" || req.method === "PUT") {
          const body = (await req.json()) as Partial<Item>;
          if (body.completed !== undefined) {
            items[index].completed = Boolean(body.completed);
          }
          if (body.title) {
            items[index].title = body.title.trim();
          }
          return Response.json(items[index], { headers: CORS_HEADERS });
        }

        if (req.method === "DELETE") {
          const removed = items.splice(index, 1)[0];
          return Response.json(removed, { headers: CORS_HEADERS });
        }
      }

      // Catch-all for undefined /api/* routes
      if (url.pathname.startsWith("/api/")) {
        return Response.json(
          { error: "API route not found", path: url.pathname },
          { status: 404, headers: CORS_HEADERS }
        );
      }

      // --- Micro-Frontend Serving Layer ---

      const urlPath = url.pathname;
      const pathSegments = urlPath.split("/").filter(Boolean);
      const firstSegment = pathSegments[0] || "";

      // 1. Embedded assets resolution (when compiled to standalone binary)
      const embeddedFiles = (Bun.embeddedFiles ?? []) as Array<Blob & { name?: string }>;
      if (embeddedFiles.length > 0) {
        // Case A: Scoped sub-path MFE (e.g. /dashboard/* -> mfes/dashboard/*)
        if (
          firstSegment &&
          embeddedFiles.some((f) => f.name?.startsWith(`mfes/${firstSegment}/`))
        ) {
          const subPath = pathSegments.slice(1).join("/");
          if (subPath) {
            const mfeAsset = embeddedFiles.find(
              (f) =>
                f.name === `mfes/${firstSegment}/${subPath}` ||
                f.name?.endsWith(`/${firstSegment}/${subPath}`)
            );
            if (mfeAsset) return new Response(mfeAsset);
          }

          // SPA fallback for scoped MFE
          const mfeIndex = embeddedFiles.find((f) => f.name === `mfes/${firstSegment}/index.html`);
          if (mfeIndex) {
            return new Response(mfeIndex, {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            });
          }
        }

        // Case B: Root / Primary MFE (mfes/frontend/* or dist/*)
        const cleanPath = urlPath.startsWith("/") ? urlPath.slice(1) : urlPath;
        if (cleanPath !== "") {
          const rootAsset = embeddedFiles.find(
            (f) =>
              f.name === cleanPath ||
              f.name === `mfes/frontend/${cleanPath}` ||
              f.name === `dist/${cleanPath}` ||
              f.name?.endsWith(`/${cleanPath}`)
          );
          if (rootAsset) return new Response(rootAsset);
        }

        // SPA fallback for root frontend
        const rootIndex =
          embeddedFiles.find((f) => f.name === "mfes/frontend/index.html") ||
          embeddedFiles.find((f) => f.name?.endsWith("index.html"));
        if (rootIndex) {
          return new Response(rootIndex, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
      }

      // 2. Local filesystem resolution (development mode)
      // Case A: Scoped sub-path MFE in packages/<segment>/dist
      if (firstSegment) {
        const scopedMfeDir = join(import.meta.dir, `../../${firstSegment}/dist`);
        if (existsSync(scopedMfeDir)) {
          const subPath = pathSegments.slice(1).join("/");
          if (subPath) {
            const scopedAsset = Bun.file(join(scopedMfeDir, subPath));
            if (await scopedAsset.exists()) {
              return scopedAsset.type === "text/html" && enableLiveReload
                ? injectLiveReload(scopedAsset)
                : serveDevAsset(scopedAsset);
            }
          }
          const scopedIndex = Bun.file(join(scopedMfeDir, "index.html"));
          if (await scopedIndex.exists()) {
            return enableLiveReload ? injectLiveReload(scopedIndex) : new Response(scopedIndex);
          }
        }
      }

      // Case B: Root frontend resolution
      const assetPath = join(distDir, urlPath);
      const assetFile = Bun.file(assetPath);
      if (await assetFile.exists()) {
        if (assetPath.endsWith(".html") && enableLiveReload) {
          return injectLiveReload(assetFile);
        }
        return serveDevAsset(assetFile);
      }

      // SPA fallback to index.html on local filesystem
      const indexFile = Bun.file(join(distDir, "index.html"));
      if (await indexFile.exists()) {
        return enableLiveReload ? injectLiveReload(indexFile) : new Response(indexFile);
      }

      return new Response("Frontend not built yet. Run 'bun run build' or start in dev mode.", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      });
    },
  });

  // Attach clean shutdown handler
  const originalStop = server.stop.bind(server);
  server.stop = (closeActiveConnections?: boolean) => {
    if (watcher) {
      watcher.close();
      watcher = null;
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    for (const client of sseClients) {
      try {
        client.close();
      } catch {
        // Ignore
      }
    }
    sseClients.clear();
    return originalStop(closeActiveConnections);
  };

  return server;
}

// Start server when executed directly
if (import.meta.main) {
  const port = Number(process.env.PORT || 3000);
  const server = createServer(port);
  const isStandalone = isStandaloneMode();
  console.log(`🚀 Server listening at http://localhost:${server.port}`);
  console.log(`   Mode: ${isStandalone ? "Standalone Binary (Embedded)" : "Local Development"}`);
}
