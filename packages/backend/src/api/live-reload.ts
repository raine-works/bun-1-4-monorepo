import type { LiveReloadManager } from '@/lib/live-reload';

/**
 * Handles incoming SSE connection requests for live reload (`/api/live-reload` or `/live-reload`).
 * Returns 404 if live reload is disabled (e.g. in production mode or standalone binary mode).
 *
 * @param req - The incoming HTTP `Request`.
 * @param liveReloadManager - The active `LiveReloadManager` instance, or null if disabled.
 * @returns An SSE stream HTTP `Response` or 404 Not Found response.
 */
export function handleLiveReloadRoute(req: Request, liveReloadManager: LiveReloadManager | null): Response {
	if (!liveReloadManager) {
		return new Response('Live reload disabled in production', { status: 404 });
	}

	return liveReloadManager.handleSseRequest(req);
}
