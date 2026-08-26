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
}

/**
 * Data model for a task item in the in-memory store.
 */
export interface Item {
  /** Unique UUID v4 identifier. */
  id: string;
  /** Task description / title. */
  title: string;
  /** Completion status of the task. */
  completed: boolean;
  /** ISO-8601 formatted creation timestamp. */
  createdAt: string;
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
