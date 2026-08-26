import { jsonResponse } from "@/lib/cors";
import type { ServerInfo } from "@/types";

export interface InfoRouteOptions {
  isStandalone: boolean;
  liveReload: boolean;
}

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
