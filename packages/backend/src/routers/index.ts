import { Hono } from 'hono';
import { healthRouter } from '@/routers/health';
import { infoRouter } from '@/routers/info';
import { itemsRouter } from '@/routers/items';
import { liveReloadRouter } from '@/routers/live-reload';
import { usersRouter } from '@/routers/users';
import type { ServerVariables } from '@/types';

/**
 * Hono API router combining all REST endpoints and live reload routes.
 */
export const apiRouter = new Hono<{ Variables: ServerVariables }>()
	.route('/health', healthRouter)
	.route('/info', infoRouter)
	.route('/live-reload', liveReloadRouter)
	.route('/users', usersRouter)
	.route('/items', itemsRouter)
	.all('*', (c) => {
		return c.json({ error: 'API route not found', path: c.req.path }, 404);
	});

export type ApiRouter = typeof apiRouter;
