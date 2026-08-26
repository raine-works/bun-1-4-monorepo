import type { LiveReloadManager } from "@/lib/live-reload";

export function handleLiveReloadRoute(
  req: Request,
  liveReloadManager: LiveReloadManager | null
): Response {
  if (!liveReloadManager) {
    return new Response("Live reload disabled in production", { status: 404 });
  }

  return liveReloadManager.handleSseRequest(req);
}
