import { jsonResponse } from "@/lib/cors";
import type { ServerInfo } from "@/types";

/**
 * Options supplied to the `/api/info` route handler.
 */
export interface InfoRouteOptions {
  /** Whether the server is executing inside a standalone binary. */
  isStandalone: boolean;
  /** Whether live reload is active. */
  liveReload: boolean;
}

/**
 * Handles `/api/info` requests, exposing runtime telemetry (Bun version, platform, memory, standalone mode).
 *
 * @param options - Info route configuration flags.
 * @returns An HTTP `Response` with JSON server telemetry and CORS headers.
 */
export function handleInfo(options: InfoRouteOptions): Response {
  const info: ServerInfo = {
    name: "@app/backend",
    bunVersion: Bun.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    isStandalone: options.isStandalone,
    embeddedAssetCount: Bun.embeddedFiles?.length ?? 0,
    memoryUsage: process.memoryUsage(),
    liveReload: options.liveReload,
  };

  return jsonResponse(info);
}
