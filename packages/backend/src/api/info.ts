import { Hono } from 'hono';
import { isStandaloneMode } from '@/lib/mfe';
import type { ServerInfo, ServerVariables } from '@/types';

/**
 * Options supplied to the `/api/info` route handler.
 */
export interface InfoRouteOptions {
	/** Whether the server is executing inside a standalone binary. */
	isStandalone?: boolean;
	/** Whether live reload is active. */
	liveReload?: boolean;
}

/**
 * Generates server runtime telemetry information.
 */
export function getServerInfo(options?: InfoRouteOptions): ServerInfo {
	const isStandalone = options?.isStandalone ?? isStandaloneMode();
	const liveReload = options?.liveReload ?? false;

	return {
		name: '@app/backend',
		bunVersion: Bun.version,
		platform: process.platform,
		arch: process.arch,
		uptime: process.uptime(),
		isStandalone,
		embeddedAssetCount: Bun.embeddedFiles?.length ?? 0,
		memoryUsage: process.memoryUsage(),
		liveReload,
	};
}

/**
 * Hono router handling `/api/info` GET requests.
 */
export const infoRouter = new Hono<{ Variables: ServerVariables }>().get('/', (c) => {
	const isStandalone = c.get('isStandalone') ?? isStandaloneMode();
	const liveReload = c.get('enableLiveReload') ?? false;
	return c.json(getServerInfo({ isStandalone, liveReload }), 200);
});

/**
 * Handles `/api/info` requests returning a standard Response.
 */
export function handleInfo(options: InfoRouteOptions): Response {
	return Response.json(getServerInfo(options));
}
