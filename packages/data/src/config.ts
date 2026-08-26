/**
 * Database connection configuration options.
 */
export interface DatabaseConfig {
  url?: string;
  hostname?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  max?: number;
  idleTimeout?: number;
  connectionTimeout?: number;
  tls?: boolean | Record<string, unknown>;
}

/**
 * Resolves connection options from environment variables or explicit config.
 */
export function getDatabaseUrl(config?: DatabaseConfig | string): string {
  if (typeof config === "string") {
    return config;
  }
  if (config?.url) {
    return config.url;
  }

  const envUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (envUrl) {
    return envUrl;
  }

  const host = config?.hostname || process.env.PGHOST || process.env.POSTGRES_HOST || "localhost";
  const port =
    config?.port || (process.env.PGPORT ? Number(process.env.PGPORT) : undefined) || 5432;
  const db = config?.database || process.env.PGDATABASE || process.env.POSTGRES_DB || "catacomb";
  const user =
    config?.username ||
    process.env.PGUSER ||
    process.env.POSTGRES_USER ||
    "development_catacomb_user";
  const pass =
    config?.password ||
    process.env.PGPASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    "development_catacomb_pass";

  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${db}`;
}
