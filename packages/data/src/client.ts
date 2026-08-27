import { env } from '@app/data/env';
import { createItemsQueries, createUsersQueries, type ItemsQueries, type UsersQueries } from '@app/data/queries';
import { SQL } from 'bun';

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

/**
 * Lightweight, type-safe database layer wrapping Bun's native SQL driver.
 * Includes active transaction tracking, connection flushing, and graceful shutdown capabilities.
 */
export class Database {
	readonly sql: BunSql;
	readonly users: UsersQueries;
	readonly items: ItemsQueries;

	private readonly _root: Database;
	private readonly _activeTransactions: Set<Promise<unknown>>;
	private _isClosing: boolean;

	constructor(configOrUrlOrSql?: string | DatabaseOptions | BunSql, parent?: Database) {
		this._root = parent ? parent._root : this;
		this._activeTransactions = parent ? parent._activeTransactions : new Set<Promise<unknown>>();
		this._isClosing = false;

		if (configOrUrlOrSql && typeof configOrUrlOrSql === 'function' && 'unsafe' in configOrUrlOrSql) {
			// Transaction or custom SQL instance passed
			this.sql = configOrUrlOrSql as BunSql;
		} else {
			const url =
				typeof configOrUrlOrSql === 'string'
					? configOrUrlOrSql
					: typeof configOrUrlOrSql === 'object' && configOrUrlOrSql !== null && configOrUrlOrSql.url
						? configOrUrlOrSql.url
						: env.DATABASE_URL;

			const max =
				typeof configOrUrlOrSql === 'object' && configOrUrlOrSql !== null && configOrUrlOrSql.max !== undefined
					? configOrUrlOrSql.max
					: env.PGMAX_POOL;

			const idleTimeout =
				typeof configOrUrlOrSql === 'object' && configOrUrlOrSql !== null && configOrUrlOrSql.idleTimeout !== undefined
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
	 * Number of currently in-flight SQL transactions.
	 */
	get activeTransactionCount(): number {
		return this._root._activeTransactions.size;
	}

	/**
	 * Whether the database is currently closing or shutting down.
	 */
	get isClosing(): boolean {
		return this._root._isClosing;
	}

	/**
	 * Executes a database transaction.
	 * Automatically commits on return, rolls back if an error is thrown.
	 * Tracks active transaction lifecycle for graceful shutdown draining.
	 *
	 * @throws Error if the database is in the process of shutting down.
	 */
	async transaction<T>(callback: (tx: Database) => Promise<T>): Promise<T> {
		if (this._root._isClosing) {
			throw new Error('Database is shutting down: new transactions are not accepted');
		}

		let txResolve!: () => void;
		const txPromise = new Promise<void>((resolve) => {
			txResolve = resolve;
		});

		this._root._activeTransactions.add(txPromise);

		try {
			return await this.sql.begin(async (txSql: BunSql) => {
				const txDb = new Database(txSql, this._root);
				return await callback(txDb);
			});
		} finally {
			this._root._activeTransactions.delete(txPromise);
			txResolve();
		}
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
				error: message || 'Database connection failed',
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
	 * Waits for all in-flight SQL transactions to finish settling.
	 *
	 * @param timeoutMs - Maximum duration in ms to wait before timing out (default: 10,000ms).
	 */
	async waitForTransactions(timeoutMs = 10_000): Promise<void> {
		if (this._root !== this) {
			return await this._root.waitForTransactions(timeoutMs);
		}

		if (this._activeTransactions.size === 0) {
			return;
		}

		const allPending = Promise.allSettled(Array.from(this._activeTransactions));
		if (timeoutMs <= 0 || !Number.isFinite(timeoutMs)) {
			await allPending;
			return;
		}

		let timer: Timer | undefined;
		const timeoutPromise = new Promise<void>((_, reject) => {
			timer = setTimeout(() => {
				reject(
					new Error(
						`Timed out waiting for ${this._activeTransactions.size} active SQL transaction(s) to finish after ${timeoutMs}ms`,
					),
				);
			}, timeoutMs);
		});

		try {
			await Promise.race([allPending, timeoutPromise]);
		} finally {
			if (timer) {
				clearTimeout(timer);
			}
		}
	}

	/**
	 * Flushes any pending buffered SQL writes/connections.
	 */
	async flush(): Promise<void> {
		if (this.sql && typeof this.sql.flush === 'function') {
			const result: unknown = this.sql.flush();
			if (result && typeof result === 'object' && 'then' in result) {
				await (result as Promise<unknown>);
			}
		}
	}

	/**
	 * Flushes pending writes and closes all connections in the pool.
	 */
	async close(options?: { timeout?: number }): Promise<void> {
		this._root._isClosing = true;
		await this.flush();
		if (this.sql && typeof this.sql.close === 'function') {
			await this.sql.close(options);
		}
		if (defaultDbInstance === this || defaultDbInstance === this._root) {
			defaultDbInstance = null;
		}
	}

	/**
	 * Performs a complete graceful shutdown of the database client:
	 * 1. Marks the database as closing (rejecting any new incoming transactions).
	 * 2. Waits for all active in-flight transactions to complete (up to timeoutMs).
	 * 3. Flushes any pending SQL connections.
	 * 4. Closes the connection pool cleanly.
	 *
	 * @param options - Optional timeout configuration.
	 */
	async shutdown(options?: { timeoutMs?: number }): Promise<void> {
		this._root._isClosing = true;
		const timeoutMs = options?.timeoutMs ?? 10_000;

		await this.waitForTransactions(timeoutMs);

		await this.flush();

		if (this.sql && typeof this.sql.close === 'function') {
			const timeoutSeconds = Math.max(1, Math.ceil(timeoutMs / 1000));
			await this.sql.close({ timeout: timeoutSeconds });
		}

		if (defaultDbInstance === this || defaultDbInstance === this._root) {
			defaultDbInstance = null;
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
 * Resets the default singleton database instance.
 */
export function resetDatabase(): void {
	defaultDbInstance = null;
}

/**
 * Checks whether the default database is currently closing or shutting down.
 */
export function isDbClosing(): boolean {
	return defaultDbInstance?.isClosing ?? false;
}

/**
 * Returns the count of active in-flight transactions on the default database.
 */
export function getActiveDbTransactionsCount(): number {
	return defaultDbInstance?.activeTransactionCount ?? 0;
}

/**
 * Waits for all in-flight transactions on the default database to finish.
 */
export async function waitForDbTransactions(timeoutMs?: number): Promise<void> {
	if (defaultDbInstance) {
		await defaultDbInstance.waitForTransactions(timeoutMs);
	}
}

/**
 * Flushes all pending connections on the default database.
 */
export async function flushDatabase(): Promise<void> {
	if (defaultDbInstance) {
		await defaultDbInstance.flush();
	}
}

/**
 * Closes the default database connection pool.
 */
export async function closeDatabase(options?: { timeout?: number }): Promise<void> {
	if (defaultDbInstance) {
		const instance = defaultDbInstance;
		defaultDbInstance = null;
		await instance.close(options);
	}
}

/**
 * Gracefully shuts down the default database client by waiting for in-flight transactions,
 * flushing connections, and terminating the connection pool.
 */
export async function shutdownDatabase(options?: { timeoutMs?: number }): Promise<void> {
	if (defaultDbInstance) {
		const instance = defaultDbInstance;
		defaultDbInstance = null;
		await instance.shutdown(options);
	}
}

/**
 * Default database singleton instance.
 */
export const db: Database = new Proxy({} as Database, {
	get(_target, prop) {
		const instance = getDatabase();
		const val = Reflect.get(instance, prop);
		return typeof val === 'function' ? val.bind(instance) : val;
	},
});

/**
 * Reusable helper to check whether the database is reachable.
 */
export async function isDbAvailable(): Promise<boolean> {
	return await db.ping();
}
