import { existsSync, readdirSync, watch } from "node:fs";
import { join } from "node:path";
import { CORS_HEADERS } from "@/lib/cors";

/**
 * Injected client-side script that handles Server-Sent Events (SSE) live reload in development mode.
 * Features:
 * - Pre-flight verification before page reload to ensure assets are ready.
 * - Automatic reconnection on connection drop.
 * - Visibility change pausing/resuming.
 * - Auto-recovery if a dynamic stylesheet or script chunk encounters a network error.
 * - Clean connection teardown on page navigation to prevent HTTP/1 socket exhaustion.
 */
export const LIVE_RELOAD_SCRIPT = `
<!-- Live Reload Client (Development Only) -->
<script>
  (() => {
    if (window.__LIVE_RELOAD_ACTIVE__) return;
    window.__LIVE_RELOAD_ACTIVE__ = true;

    let es = null;
    let isUnloading = false;
    let isReloading = false;
    let reconnectTimeout = null;

    function cleanup() {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if (es) {
        es.onmessage = null;
        es.onerror = null;
        try {
          es.close();
        } catch {}
        es = null;
      }
    }

    function onUnload() {
      isUnloading = true;
      cleanup();
    }

    async function triggerSafeReload() {
      if (isReloading || isUnloading) return;
      isReloading = true;
      console.log('⚡ [live-reload] Change detected in micro-frontend, verifying server bundle readiness...');

      // Pre-flight check: poll current URL to ensure server has finished writing HTML and bundles
      let ready = false;
      for (let attempt = 0; attempt < 25; attempt++) {
        try {
          const res = await fetch(window.location.href, {
            headers: { 'Cache-Control': 'no-cache, no-store' },
            cache: 'no-store',
          });
          if (res.ok) {
            const text = await res.text();
            if (text.length > 50 && (text.includes('id="root"') || text.includes('</body>') || text.includes('<script'))) {
              ready = true;
              break;
            }
          }
        } catch {
          // Server might be restarting or compiling
        }
        await new Promise((r) => setTimeout(r, 80));
      }

      onUnload();
      window.location.reload();
    }

    function connect() {
      if (isUnloading) return;
      cleanup();

      try {
        es = new EventSource('/api/live-reload');
        es.onmessage = (event) => {
          if (event.data === 'reload') {
            triggerSafeReload();
          }
        };
        es.onerror = () => {
          cleanup();
          // Reconnect when connection drops (e.g. backend restarted or transient network hitch)
          if (!isUnloading && document.visibilityState === 'visible') {
            reconnectTimeout = setTimeout(connect, 1000);
          }
        };
      } catch {
        // Ignore initialization errors
      }
    }

    // Auto-recover if an asset (script/stylesheet) failed to load due to build write race condition
    window.addEventListener('error', (event) => {
      const target = event.target;
      if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        console.warn('⚡ [live-reload] Asset load error detected, recovering with safe reload in 300ms...');
        setTimeout(() => {
          if (!isUnloading) {
            triggerSafeReload();
          }
        }, 300);
      }
    }, true);

    // Cleanly close SSE on navigation/unload to prevent HTTP/1.1 socket exhaustion in browser
    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('pagehide', onUnload);

    // Pause SSE when tab/page is hidden, resume when visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !es && !isUnloading) {
        connect();
      } else if (document.visibilityState === 'hidden' && es) {
        cleanup();
      }
    });

    connect();
  })();
</script>
`;

/**
 * Injects the development live-reload client script into HTML content or file before the closing `</body>` tag.
 * Includes retry logic to handle active file writes from concurrent builds in watch mode.
 *
 * @param fileOrHtml - The `BunFile` handle or raw HTML string.
 * @returns An HTTP `Response` containing the modified HTML and no-cache headers.
 */
export async function injectLiveReload(fileOrHtml: Bun.BunFile | string): Promise<Response> {
  let html = "";
  if (typeof fileOrHtml === "string") {
    html = fileOrHtml;
  } else {
    // In dev mode, wait briefly if file is currently being written/flushed to disk
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        html = await fileOrHtml.text();
        if (
          html.length > 50 &&
          (html.includes("</body>") || html.includes("<html") || html.includes('id="root"'))
        ) {
          break;
        }
      } catch {}
      await Bun.sleep(25);
    }

    if (!html) {
      try {
        html = await fileOrHtml.text();
      } catch {
        html = "";
      }
    }
  }

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

/**
 * Serves a development static asset (JS, CSS, images) with cache-busting headers
 * and retry handling if the asset file is in the middle of being written to disk.
 *
 * @param file - The `BunFile` handle to stream to the client.
 * @returns An HTTP `Response` with no-cache headers.
 */
export async function serveDevAsset(file: Bun.BunFile): Promise<Response> {
  // If file was just created and size is 0 (write in progress), wait briefly
  if (file.size === 0) {
    for (let attempt = 0; attempt < 8; attempt++) {
      await Bun.sleep(25);
      if (file.size > 0) break;
    }
  }

  return new Response(file, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

/**
 * Manages Server-Sent Events (SSE) connections and filesystem watching for local development live reload.
 */
export class LiveReloadManager {
  private sseClients = new Set<ReadableStreamDefaultController>();
  private watcher: ReturnType<typeof watch> | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private packagesDir: string;

  constructor() {
    // Periodic SSE keep-alive comment to detect disconnected TCP sockets early and prevent stale connections
    this.heartbeatTimer = setInterval(() => {
      const ping = new TextEncoder().encode(": keepalive\n\n");
      for (const client of this.sseClients) {
        try {
          client.enqueue(ping);
        } catch {
          this.sseClients.delete(client);
        }
      }
    }, 15000);

    // Watch for build changes across all micro-frontends in development mode
    this.packagesDir = join(import.meta.dir, "../../..");
    if (existsSync(this.packagesDir)) {
      try {
        this.watcher = watch(this.packagesDir, { recursive: true }, (_eventType, filename) => {
          if (!filename) return;
          // Ignore node_modules, temp files, backend dist, hidden files
          if (
            filename.includes("node_modules") ||
            filename.startsWith("backend") ||
            filename.startsWith(".") ||
            filename.endsWith(".tmp") ||
            filename.endsWith(".bun-build")
          ) {
            return;
          }
          // Trigger when any micro-frontend dist/ artifact or source is updated
          if (filename.includes("dist") || filename.includes("src")) {
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
              this.verifyAndBroadcastReload();
            }, 150);
          }
        });
      } catch (err) {
        console.warn("⚠️ Could not start micro-frontend live-reload watcher:", err);
      }
    }
  }

  /**
   * Verifies that all dist bundles referenced in index.html files are fully written
   * before broadcasting reload to browsers, avoiding blank white pages.
   */
  private async verifyAndBroadcastReload(retries = 6): Promise<void> {
    const isReady = await this.areBundlesReady();
    if (!isReady && retries > 0) {
      this.debounceTimer = setTimeout(() => {
        this.verifyAndBroadcastReload(retries - 1);
      }, 50);
      return;
    }
    this.broadcastReload();
  }

  private async areBundlesReady(): Promise<boolean> {
    try {
      if (!existsSync(this.packagesDir)) return true;
      const entries = readdirSync(this.packagesDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name === "backend" || entry.name.startsWith(".")) {
          continue;
        }
        const distDir = join(this.packagesDir, entry.name, "dist");
        if (!existsSync(distDir)) continue;

        const indexHtmlPath = join(distDir, "index.html");
        const indexFile = Bun.file(indexHtmlPath);
        if (await indexFile.exists()) {
          if (indexFile.size < 50) return false;
          const html = await indexFile.text();
          if (
            !html.includes('id="root"') &&
            !html.includes("</body>") &&
            !html.includes("<script")
          ) {
            return false;
          }
          // Check that any referenced scripts in dist/ exist and are non-empty
          const scriptMatches = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]);
          for (const src of scriptMatches) {
            const filename = src.split("/").filter(Boolean).pop();
            if (filename) {
              const scriptFile = Bun.file(join(distDir, filename));
              if (!(await scriptFile.exists()) || scriptFile.size === 0) {
                return false;
              }
            }
          }
        }
      }
      return true;
    } catch {
      return true;
    }
  }

  /**
   * Broadcasts a `reload` message event to all active Server-Sent Event (SSE) browser clients.
   */
  broadcastReload(): void {
    const message = new TextEncoder().encode("data: reload\n\n");
    for (const client of this.sseClients) {
      try {
        client.enqueue(message);
      } catch {
        this.sseClients.delete(client);
      }
    }
  }

  /**
   * Handles an incoming HTTP request for the live reload SSE stream endpoint (`/api/live-reload`).
   *
   * @param req - The incoming HTTP `Request`.
   * @returns An HTTP `Response` configured with `text/event-stream` and CORS headers.
   */
  handleSseRequest(req: Request): Response {
    let controller: ReadableStreamDefaultController | null = null;
    const removeClient = () => {
      if (controller) {
        this.sseClients.delete(controller);
        try {
          controller.close();
        } catch {
          // Already closed
        }
        controller = null;
      }
    };

    const stream = new ReadableStream({
      start: (c) => {
        controller = c;
        this.sseClients.add(controller);
        try {
          controller.enqueue(new TextEncoder().encode("data: connected\n\n"));
        } catch {
          removeClient();
        }
      },
      cancel() {
        removeClient();
      },
    });

    // Immediately unregister client when HTTP connection is aborted by browser/client
    req.signal?.addEventListener("abort", () => {
      removeClient();
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        ...CORS_HEADERS,
      },
    });
  }

  /**
   * Closes all active SSE client connections, cancels file watchers, and clears heartbeat/debounce timers.
   */
  stop(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    for (const client of this.sseClients) {
      try {
        client.close();
      } catch {
        // Ignore
      }
    }
    this.sseClients.clear();
  }
}
