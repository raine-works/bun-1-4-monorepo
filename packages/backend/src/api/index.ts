import { handleCorsPreflight, jsonResponse } from "@/lib/cors";
import type { LiveReloadManager } from "@/lib/live-reload";
import { handleItems } from "@/api/api/items";
import { handleHealth } from "@/api/health";
import { handleInfo } from "@/api/info";
import { handleLiveReloadRoute } from "@/api/live-reload";

export interface ApiRouterContext {
  isStandalone: boolean;
  enableLiveReload: boolean;
  liveReloadManager: LiveReloadManager | null;
}

export async function handleApiRequest(
  req: Request,
  context: ApiRouterContext
): Promise<Response | null> {
  const url = new URL(req.url);

  // Handle CORS preflight for all API endpoints
  if (req.method === "OPTIONS") {
    return handleCorsPreflight();
  }

  // Handle live reload on /live-reload or /api/live-reload
  if (url.pathname === "/live-reload" || url.pathname === "/api/live-reload") {
    return handleLiveReloadRoute(req, context.liveReloadManager);
  }

  // Only handle /api/* endpoints
  if (!url.pathname.startsWith("/api/")) {
    return null;
  }

  if (url.pathname === "/api/health") {
    return handleHealth();
  }

  if (url.pathname === "/api/info") {
    return handleInfo({
      isStandalone: context.isStandalone,
      liveReload: context.enableLiveReload,
    });
  }

  if (url.pathname === "/api/items" || url.pathname.startsWith("/api/items/")) {
    return handleItems(req);
  }

  // Catch-all for undefined /api/* routes
  return jsonResponse({ error: "API route not found", path: url.pathname }, { status: 404 });
}
