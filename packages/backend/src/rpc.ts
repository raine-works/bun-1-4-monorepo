import type { ApiRouter, AppType } from '@backend/index';
import { hc } from 'hono/client';

export type { ApiRouter, AppType };
export type ApiClient = ReturnType<typeof hc<AppType>>;

/**
 * Creates a type-safe Hono RPC API client configured with the given base URL.
 * Defaults to `window.location.origin` in browser environments or `http://localhost:3000` in server/test environments.
 *
 * @param baseUrl - Optional base URL for API requests.
 * @param options - Optional client configuration options.
 * @returns Fully typed Hono RPC client.
 */
export function createApiClient(baseUrl?: string, options?: Parameters<typeof hc>[1]): ApiClient {
	const url =
		baseUrl ||
		(typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:3000');
	return hc<AppType>(url, options);
}

/**
 * Default singleton type-safe Hono RPC API client instance.
 */
export const client: ApiClient = createApiClient();
