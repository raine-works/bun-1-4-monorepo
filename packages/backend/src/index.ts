import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { env } from '@/lib/env';
import { LiveReloadManager } from '@/lib/live-reload';
import { isStandaloneMode, resolveFrontendDist, serveMicroFrontend } from '@/lib/mfe';
import {
	GracefulShutdownHandler,
	gracefulShutdown,
	type ShutdownOptions,
	type ShutdownState,
	setupGracefulShutdown,
	shutdownHandler,
} from '@/lib/shutdown';
import { apiRouter } from '@/routers';
import { type ApiClient, client, createApiClient } from '@/rpc';
import type {
	CreateItemInput,
	CreateUserInput,
	Item,
	ItemFilter,
	ServerInfo,
	ServerOptions,
	ServerVariables,
	UpdateItemInput,
	UpdateUserInput,
	User,
	UserFilter,
} from '@/types';

export type {
	ApiClient,
	CreateItemInput,
	CreateUserInput,
	Item,
	ItemFilter,
	ServerInfo,
	ServerOptions,
	ServerVariables,
	ShutdownOptions,
	ShutdownState,
	UpdateItemInput,
	UpdateUserInput,
	User,
	UserFilter,
};
export {
	client,
	createApiClient,
	GracefulShutdownHandler,
	gracefulShutdown,
	isStandaloneMode,
	resolveFrontendDist,
	setupGracefulShutdown,
	shutdownHandler,
};

/**
 * Root Hono application router defining all typed routes for Hono RPC.
 */
export const app = new Hono<{ Variables: ServerVariables }>()
	.use(
		'*',
		cors({
			origin: '*',
			allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
			allowHeaders: ['Content-Type', 'Authorization'],
		}),
	)
	.use('*', compress())
	.route('/api', apiRouter);

export type AppType = typeof app;

/**
 * Creates and configures the Hono application instance with all middleware,
 * API routes, live reload SSE streaming, and micro-frontend SPA fallbacks.
 *
 * @param optionsOrPort - Either a port number or a ServerOptions configuration object.
 * @returns Configured Hono app instance, liveReloadManager, and resolved port.
 */
export function createApp(optionsOrPort: number | ServerOptions = 3000) {
	const options: ServerOptions = typeof optionsOrPort === 'number' ? { port: optionsOrPort } : optionsOrPort;
	const port = options.port ?? env.PORT;
	const standalone = isStandaloneMode();
	const currentEnv = process.env.NODE_ENV ?? env.NODE_ENV;
	const isProduction = currentEnv === 'production' || standalone;
	const enableLiveReload = options.liveReload ?? (!isProduction && currentEnv !== 'test');

	const distDir = resolveFrontendDist();
	const liveReloadManager = enableLiveReload ? new LiveReloadManager() : null;

	const honoApp = new Hono<{ Variables: ServerVariables }>();

	// 1. Global CORS Middleware from hono/cors
	honoApp.use(
		'*',
		cors({
			origin: '*',
			allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
			allowHeaders: ['Content-Type', 'Authorization'],
		}),
	);

	// 2. Global HTTP Compression Middleware from hono/compress
	honoApp.use('*', compress());

	// 3. Global Error Handler
	honoApp.onError((err, c) => {
		const message = err instanceof Error ? err.message : 'Internal Server Error';
		return c.json({ error: message }, 500);
	});

	// 4. Inject Context Variables into Request
	honoApp.use('*', async (c, next) => {
		c.set('isStandalone', standalone);
		c.set('enableLiveReload', enableLiveReload);
		c.set('liveReloadManager', liveReloadManager);
		c.set('distDir', distDir);
		await next();
	});

	// 5. Mount API Sub-Router under /api
	honoApp.route('/api', apiRouter);

	// 6. Micro-Frontend & SPA resolution catch-all
	honoApp.all('*', async (c) => {
		const response = await serveMicroFrontend(c.req.raw, {
			distDir,
			enableLiveReload,
		});
		return response;
	});

	return { app: honoApp, liveReloadManager, port };
}

/**
 * Extended Bun.Server interface that includes programmatic graceful shutdown.
 */
export type BackendServer = ReturnType<typeof Bun.serve> & {
	shutdown: (opts?: ShutdownOptions) => Promise<void>;
};

/**
 * Creates and starts a Bun HTTP server instance powered by Hono with API routing,
 * micro-frontend hosting, SPA fallback resolution, and development live reload.
 *
 * @param optionsOrPort - Either a port number or a `ServerOptions` configuration object.
 * @returns An active `Bun.Server` instance extended with graceful shutdown capabilities.
 *
 * @example
 * ```ts
 * // Start default development server on port 3000
 * const server = createServer();
 *
 * // Gracefully shut down server, draining transactions and flushing connections
 * await server.shutdown();
 * ```
 */
export function createServer(optionsOrPort: number | ServerOptions = 3000): BackendServer {
	const options: ServerOptions = typeof optionsOrPort === 'number' ? { port: optionsOrPort } : optionsOrPort;
	const { app: honoApp, liveReloadManager, port } = createApp(options);

	const server = Bun.serve({
		hostname: '0.0.0.0',
		port,
		fetch: honoApp.fetch,
	});

	// Register with the global graceful shutdown handler
	shutdownHandler.registerServer(server, liveReloadManager);

	// Attach clean stop method
	const originalStop = server.stop.bind(server);
	server.stop = (closeActiveConnections?: boolean) => {
		liveReloadManager?.stop();
		shutdownHandler.unregisterServer(server);
		return originalStop(closeActiveConnections);
	};

	// Attach graceful shutdown method
	const extendedServer = server as BackendServer;
	extendedServer.shutdown = async (shutdownOpts?: ShutdownOptions) => {
		return await shutdownHandler.shutdown({
			timeoutMs: options.shutdownTimeoutMs,
			...shutdownOpts,
		});
	};

	// Auto-register signal handlers if requested / in non-test mode
	const autoSignals = options.autoRegisterSignals ?? (process.env.NODE_ENV !== 'test' && env.NODE_ENV !== 'test');
	if (autoSignals) {
		setupGracefulShutdown({ timeoutMs: options.shutdownTimeoutMs });
	}

	return extendedServer;
}

// Default export for Bun standalone binary and native HTTP server execution
const defaultApp = createApp(env.PORT);

// Auto-register signals in production / standalone / CLI mode if not in test
if (process.env.NODE_ENV !== 'test' && env.NODE_ENV !== 'test') {
	setupGracefulShutdown({
		timeoutMs: 10_000,
		exitProcess: true,
	});
}

export default {
	port: env.PORT,
	fetch: defaultApp.app.fetch,
};
