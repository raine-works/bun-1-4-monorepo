import type { Item, User } from '@app/data';
import type { LiveReloadManager } from '@/lib/live-reload';

export type {
	CreateItemInput,
	CreateUserInput,
	ItemFilter,
	UpdateItemInput,
	UpdateUserInput,
	UserFilter,
} from '@app/data';
export {
	createItemSchema,
	createUserSchema,
	itemFilterSchema,
	updateItemSchema,
	updateUserSchema,
	userFilterSchema,
} from '@app/data';
export type { Item, User };

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
 * Request-scoped variables attached to Hono Context throughout the HTTP pipeline.
 */
export interface ServerVariables {
	isStandalone: boolean;
	enableLiveReload: boolean;
	liveReloadManager: LiveReloadManager | null;
	distDir: string;
}

/**
 * System and runtime telemetry returned by the `/api/info` diagnostic endpoint.
 */
export interface ServerInfo {
	/** Package name (e.g., `@app/backend`). */
	name: string;
	/** Current Bun runtime version. */
	bunVersion: string;
	/** Operating system platform (e.g., `darwin`, `linux`). */
	platform: string;
	/** CPU architecture (e.g., `arm64`, `x64`). */
	arch: string;
	/** Server process uptime in seconds. */
	uptime: number;
	/** Whether the server is running as a compiled standalone binary executable. */
	isStandalone?: boolean;
	/** Number of embedded virtual assets in standalone binary mode. */
	embeddedAssetCount?: number;
	/** Memory usage statistics of the Bun process. */
	memoryUsage?: NodeJS.MemoryUsage;
	/** Whether the development live reload SSE service is currently active. */
	liveReload?: boolean;
	/** Database connection health status if configured. */
	databaseHealth?: {
		ok: boolean;
		latencyMs: number;
		database?: string;
	};
}

/**
 * Configuration options for creating a Bun HTTP server instance.
 */
export interface ServerOptions {
	/** Port number to bind to (defaults to 3000 or ephemeral port if 0). */
	port?: number;
	/**
	 * Explicit override to enable or disable live reload SSE stream.
	 * If omitted, defaults to enabled in development and disabled in production / test / standalone.
	 */
	liveReload?: boolean;
}
