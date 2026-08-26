import type { Item, User } from "@app/data";

export type { CreateItemInput, CreateUserInput, UpdateItemInput, UpdateUserInput } from "@app/data";
export type { Item, User };

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
