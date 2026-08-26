import { handleApiRequest } from "@/api";
import { LiveReloadManager } from "@/lib/live-reload";
import { isStandaloneMode, resolveFrontendDist, serveMicroFrontend } from "@/lib/mfe";
import type { Item, ServerInfo, ServerOptions } from "@/types";

export type { Item, ServerInfo, ServerOptions };
export { isStandaloneMode, resolveFrontendDist };

/**
 * Creates and starts a Bun HTTP server instance configured with API routing,
 * micro-frontend hosting, SPA fallback resolution, and development live reload.
 *
 * @param optionsOrPort - Either a port number or a `ServerOptions` configuration object.
 * @returns An active `Bun.Server` instance with extended `stop()` method for graceful teardown.
 *
 * @example
 * ```ts
 * // Start default development server on port 3000
 * const server = createServer();
 *
 * // Start test server on ephemeral port with live reload disabled
 * const testServer = createServer({ port: 0, liveReload: false });
 * ```
 */
export function createServer(optionsOrPort: number | ServerOptions = 3000) {
  const options: ServerOptions =
    typeof optionsOrPort === "number" ? { port: optionsOrPort } : optionsOrPort;
  const port = options.port ?? 3000;
  const standalone = isStandaloneMode();
  const isProduction = process.env.NODE_ENV === "production" || standalone;
  const enableLiveReload = options.liveReload ?? (!isProduction && process.env.NODE_ENV !== "test");

  const distDir = resolveFrontendDist();
  const liveReloadManager = enableLiveReload ? new LiveReloadManager() : null;

  const server = Bun.serve({
    port,
    async fetch(req) {
      // 1. API route handling
      const apiResponse = await handleApiRequest(req, {
        isStandalone: standalone,
        enableLiveReload,
        liveReloadManager,
      });
      if (apiResponse) {
        return apiResponse;
      }

      // 2. Micro-Frontend resolution and serving
      return serveMicroFrontend(req, {
        distDir,
        enableLiveReload,
      });
    },
  });

  // Attach clean shutdown handler
  const originalStop = server.stop.bind(server);
  server.stop = (closeActiveConnections?: boolean) => {
    liveReloadManager?.stop();
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
