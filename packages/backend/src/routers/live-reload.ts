import type { ServerVariables } from '@app/backend/types';
import { Hono } from 'hono';

/**
 * Hono router handling live reload SSE streaming requests (`/api/live-reload`).
 * Returns 404 if live reload is disabled (e.g. in production mode or standalone binary mode).
 */
export const liveReloadRouter = new Hono<{ Variables: ServerVariables }>().get('/', (c) => {
	const manager = c.get('liveReloadManager');
	if (!manager) {
		return c.text('Live reload disabled in production', 404);
	}
	return manager.handleSseRequest(c.req.raw);
});
