import { handleCorsPreflight, jsonResponse } from "@/lib/cors";
import type { LiveReloadManager } from "@/lib/live-reload";
import { handleItems } from "@/routes/api/items";
import { handleHealth } from "@/routes/health";
import { handleInfo } from "@/routes/info";
import { handleLiveReloadRoute } from "@/routes/live-reload";

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

  if (url.pathname === "/api/live-reload") {
    return handleLiveReloadRoute(req, context.liveReloadManager);
  }

  if (url.pathname === "/api/items" || url.pathname.startsWith("/api/items/")) {
    return handleItems(req);
  }

  // Catch-all for undefined /api/* routes
  return jsonResponse({ error: "API route not found", path: url.pathname }, { status: 404 });
}
