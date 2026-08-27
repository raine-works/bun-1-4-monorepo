import { Hono } from 'hono';
import { healthRouter } from '@/api/health';
import { infoRouter } from '@/api/info';
import { liveReloadRouter } from '@/api/live-reload';
import { itemsRouter } from '@/api/routers/items';
import { usersRouter } from '@/api/routers/users';
import type { ApiRouterContext, ServerVariables } from '@/types';

export type { ApiRouterContext };

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

/**
 * Dispatches incoming HTTP requests to corresponding API endpoint handlers for backwards compatibility.
 */
export async function handleApiRequest(req: Request, context: ApiRouterContext): Promise<Response | null> {
	const url = new URL(req.url);

	if (url.pathname === '/live-reload') {
		return await liveReloadRouter.fetch(req, {
			Variables: {
				liveReloadManager: context.liveReloadManager,
				isStandalone: context.isStandalone,
				enableLiveReload: context.enableLiveReload,
				distDir: '',
			},
		});
	}

	if (!url.pathname.startsWith('/api/')) {
		return null;
	}

	const subPath = url.pathname.slice(4);
	const subUrl = new URL(url.toString());
	subUrl.pathname = subPath || '/';
	const subReq = new Request(subUrl.toString(), req);

	return await apiRouter.fetch(subReq, {
		Variables: {
			liveReloadManager: context.liveReloadManager,
			isStandalone: context.isStandalone,
			enableLiveReload: context.enableLiveReload,
			distDir: '',
		},
	});
}
