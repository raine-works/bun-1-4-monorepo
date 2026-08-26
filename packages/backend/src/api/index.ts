import { handleHealth } from "@/api/health";
import { handleInfo } from "@/api/info";
import { handleLiveReloadRoute } from "@/api/live-reload";
import { handleItems } from "@/api/routers/items";
import { handleUsers } from "@/api/routers/users";
import { handleCorsPreflight, jsonResponse } from "@/lib/cors";
import type { LiveReloadManager } from "@/lib/live-reload";

/**
 * Contextual configuration passed into the API router during HTTP request processing.
 */
export interface ApiRouterContext {
  /** Whether the server is running inside a compiled standalone binary. */
  isStandalone: boolean;
  /** Whether development live reload is enabled. */
  enableLiveReload: boolean;
  /** The active LiveReloadManager instance, or null if live reload is inactive. */
  liveReloadManager: LiveReloadManager | null;
}

/**
 * Dispatches incoming HTTP requests to corresponding API endpoint handlers or live reload routes.
 *
 * @param req - The incoming HTTP Request.
 * @param context - Configuration context including standalone mode and live reload manager.
 * @returns An HTTP Response if the route matches `/api/*`, `/live-reload`, or OPTIONS preflight; otherwise null.
 */
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

  if (url.pathname === "/api/users" || url.pathname.startsWith("/api/users/")) {
    return handleUsers(req);
  }

  if (url.pathname === "/api/items" || url.pathname.startsWith("/api/items/")) {
    return handleItems(req);
  }

  // Catch-all for undefined /api/* routes
  return jsonResponse({ error: "API route not found", path: url.pathname }, { status: 404 });
}
