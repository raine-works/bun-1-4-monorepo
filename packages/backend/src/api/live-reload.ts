import { Hono } from 'hono';
import type { LiveReloadManager } from '@/lib/live-reload';
import type { ServerVariables } from '@/types';

/**
 * Handles incoming SSE connection requests for live reload (`/api/live-reload` or `/live-reload`).
 * Returns 404 if live reload is disabled (e.g. in production mode or standalone binary mode).
 */
export function handleLiveReloadRoute(req: Request, liveReloadManager: LiveReloadManager | null): Response {
	if (!liveReloadManager) {
		return new Response('Live reload disabled in production', { status: 404 });
	}

	return liveReloadManager.handleSseRequest(req);
}

/**
 * Hono router handling live reload SSE streaming requests.
 */
export const liveReloadRouter = new Hono<{ Variables: ServerVariables }>().get('/', (c) => {
	const manager = c.get('liveReloadManager');
	if (!manager) {
		return c.text('Live reload disabled in production', 404);
	}
	return manager.handleSseRequest(c.req.raw);
});
