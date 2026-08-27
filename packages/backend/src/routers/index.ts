import { healthRouter } from '@backend/routers/health';
import { infoRouter } from '@backend/routers/info';
import { itemsRouter } from '@backend/routers/items';
import { liveReloadRouter } from '@backend/routers/live-reload';
import { usersRouter } from '@backend/routers/users';
import type { ServerVariables } from '@backend/types';
import { Hono } from 'hono';

/**
 * Hono API router combining all REST endpoints and live reload routes.
 */
export const apiRouter = new Hono<{ Variables: ServerVariables }>()
	.route('/health', healthRouter)
	.route('/info', infoRouter)
	.route('/live-reload', liveReloadRouter)
	.route('/users', usersRouter)
	.route('/items', itemsRouter);

apiRouter.notFound((c) => {
	return c.json({ error: 'API route not found', path: c.req.path }, 404);
});

export type ApiRouter = typeof apiRouter;
