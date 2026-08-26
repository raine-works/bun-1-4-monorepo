import { SQL } from "bun";
import { env } from "@/env";
import {
  createItemsQueries,
  createUsersQueries,
  type ItemsQueries,
  type UsersQueries,
} from "@/queries";

export type BunSql = InstanceType<typeof SQL>;

/**
 * Database connection options.
 */
export interface DatabaseOptions {
  /** PostgreSQL connection URL. Defaults to `env.DATABASE_URL`. */
  url?: string;
  /** Maximum pool connections. Defaults to `env.PGMAX_POOL` (10). */
  max?: number;
  /** Connection idle timeout in seconds. Defaults to 30. */
  idleTimeout?: number;
}

/** Alias for DatabaseOptions for backwards compatibility. */
export type DatabaseConfig = DatabaseOptions;

/**
 * Lightweight, type-safe database layer wrapping Bun's native SQL driver.
 */
export class Database {
  readonly sql: BunSql;
  readonly users: UsersQueries;
  readonly items: ItemsQueries;

  constructor(configOrUrlOrSql?: string | DatabaseOptions | BunSql) {
    if (
      configOrUrlOrSql &&
      typeof configOrUrlOrSql === "function" &&
      "unsafe" in configOrUrlOrSql
    ) {
      // Transaction or custom SQL instance passed
      this.sql = configOrUrlOrSql as BunSql;
    } else {
      const url =
        typeof configOrUrlOrSql === "string"
          ? configOrUrlOrSql
          : typeof configOrUrlOrSql === "object" &&
              configOrUrlOrSql !== null &&
              configOrUrlOrSql.url
            ? configOrUrlOrSql.url
            : env.DATABASE_URL;

      const max =
        typeof configOrUrlOrSql === "object" &&
        configOrUrlOrSql !== null &&
        configOrUrlOrSql.max !== undefined
          ? configOrUrlOrSql.max
          : env.PGMAX_POOL;

      const idleTimeout =
        typeof configOrUrlOrSql === "object" &&
        configOrUrlOrSql !== null &&
        configOrUrlOrSql.idleTimeout !== undefined
          ? configOrUrlOrSql.idleTimeout
          : 30;

      this.sql = new SQL(url, {
        max,
        idleTimeout,
      });
    }

    // Attach typed query operations
    this.users = createUsersQueries(this.sql);
    this.items = createItemsQueries(this.sql);
  }

  /**
   * Executes a database transaction.
   * Automatically commits on return, rolls back if an error is thrown.
   */
  async transaction<T>(callback: (tx: Database) => Promise<T>): Promise<T> {
    return await this.sql.begin(async (txSql: BunSql) => {
      const txDb = new Database(txSql);
      return await callback(txDb);
    });
  }

  /**
   * Health diagnostic check against PostgreSQL.
   */
  async healthCheck(): Promise<{
    ok: boolean;
    latencyMs: number;
    database?: string;
    version?: string;
    error?: string;
  }> {
    const start = performance.now();
    try {
      const result = (await this.sql`
        SELECT current_database(), version()
      `) as unknown as Array<{ current_database: string; version: string }>;
      const latencyMs = Math.round((performance.now() - start) * 100) / 100;
      const row = result[0];
      return {
        ok: true,
        latencyMs,
        database: row?.current_database,
        version: row?.version,
      };
    } catch (e: unknown) {
      const latencyMs = Math.round((performance.now() - start) * 100) / 100;
      const message = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        latencyMs,
        error: message || "Database connection failed",
      };
    }
  }

  /**
   * Simple connection ping check. Returns true if connection succeeds, false otherwise.
   */
  async ping(): Promise<boolean> {
    try {
      await this.sql`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Alias for ping() verifying whether the database is reachable and active.
   */
  async isAvailable(): Promise<boolean> {
    return this.ping();
  }

  /**
   * Closes all connections in the pool.
   */
  async close(): Promise<void> {
    if (this.sql && typeof this.sql.close === "function") {
      await this.sql.close();
    }
  }
}

let defaultDbInstance: Database | null = null;

/**
 * Creates a new Database instance.
 */
export function createDatabase(configOrUrl?: string | DatabaseOptions | BunSql): Database {
  return new Database(configOrUrl);
}

/**
 * Returns the default singleton Database instance.
 */
export function getDatabase(configOrUrl?: string | DatabaseOptions): Database {
  if (!defaultDbInstance) {
    defaultDbInstance = new Database(configOrUrl);
  }
  return defaultDbInstance;
}

/**
 * Default database singleton instance.
 */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const instance = getDatabase();
    const val = Reflect.get(instance, prop);
    return typeof val === "function" ? val.bind(instance) : val;
  },
});

/**
 * Reusable helper to check whether the database is reachable.
 */
export async function isDbAvailable(): Promise<boolean> {
  return await db.ping();
}
