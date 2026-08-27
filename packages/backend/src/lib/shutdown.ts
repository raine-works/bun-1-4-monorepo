import { closeDatabase, flushDatabase, shutdownDatabase } from '@app/data';
import type { Server } from 'bun';
import { env } from '@/lib/env';
import type { LiveReloadManager } from '@/lib/live-reload';

export type BunServer = Server<unknown>;

export type ShutdownState = 'idle' | 'shutting_down' | 'shut_down';

/**
 * Options for configuring the graceful shutdown behavior.
 */
export interface ShutdownOptions {
	/**
	 * Maximum duration to wait in milliseconds for in-flight HTTP requests and SQL transactions
	 * before forcefully closing connections (default: 10,000ms).
	 */
	timeoutMs?: number;
	/**
	 * Signal or trigger name that initiated shutdown (e.g., 'SIGINT', 'SIGTERM', 'manual').
	 */
	signal?: string;
	/**
	 * Whether to call `process.exit()` after shutdown completes.
	 * Defaults to `false` in test mode (`NODE_ENV === 'test'`) and `true` otherwise.
	 */
	exitProcess?: boolean;
	/**
	 * Exit code passed to `process.exit()` on completion (default: 0 on success, 1 on failure/timeout).
	 */
	exitCode?: number;
	/**
	 * Lifecycle callback invoked before server and database draining starts.
	 */
	onBeforeShutdown?: (signal?: string) => void | Promise<void>;
	/**
	 * Lifecycle callback invoked after server and database connections are closed.
	 */
	onAfterShutdown?: (signal?: string) => void | Promise<void>;
	/**
	 * Optional custom logger for telemetry messages.
	 */
	logger?: {
		info?: (...args: unknown[]) => void;
		warn?: (...args: unknown[]) => void;
		error?: (...args: unknown[]) => void;
	};
}

/**
 * Manages graceful teardown of HTTP servers, live reload streams, and database connections.
 * Ensures in-flight SQL transactions complete, connections are flushed, and connection pools are closed.
 */
export class GracefulShutdownHandler {
	private _state: ShutdownState = 'idle';
	private _shutdownPromise: Promise<void> | null = null;
	private readonly _servers = new Map<BunServer, LiveReloadManager | null>();
	private readonly _signalHandlers = new Map<NodeJS.Signals, () => void>();

	/**
	 * Whether the graceful shutdown process is currently in progress.
	 */
	get isShuttingDown(): boolean {
		return this._state === 'shutting_down';
	}

	/**
	 * Whether the graceful shutdown process has completed.
	 */
	get isShutDown(): boolean {
		return this._state === 'shut_down';
	}

	/**
	 * Current state of the shutdown lifecycle.
	 */
	get state(): ShutdownState {
		return this._state;
	}

	/**
	 * Registers an active Bun server and optional live reload manager for graceful shutdown tracking.
	 */
	registerServer(server: BunServer, liveReloadManager?: LiveReloadManager | null): void {
		this._servers.set(server, liveReloadManager ?? null);
	}

	/**
	 * Unregisters a Bun server from shutdown management.
	 */
	unregisterServer(server: BunServer): void {
		this._servers.delete(server);
	}

	/**
	 * Clears registered servers and resets the shutdown state (primarily used in testing).
	 */
	reset(): void {
		this._state = 'idle';
		this._shutdownPromise = null;
		this._servers.clear();
		this.unregisterSignals();
	}

	/**
	 * Registers OS process signal handlers (SIGINT, SIGTERM, SIGQUIT, SIGHUP) to trigger graceful shutdown.
	 * Returns an unregister function to remove the listeners.
	 */
	setupSignalHandlers(options?: ShutdownOptions): () => void {
		const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP'];

		for (const sig of signals) {
			if (this._signalHandlers.has(sig)) continue;

			const handler = () => {
				const log = options?.logger ?? console;
				log.info?.(`\n📡 Received ${sig} signal. Initiating graceful shutdown...`);
				this.shutdown({
					signal: sig,
					...options,
				}).catch((err) => {
					log.error?.(`❌ Unhandled error during ${sig} graceful shutdown:`, err);
				});
			};

			this._signalHandlers.set(sig, handler);
			process.on(sig, handler);
		}

		return () => this.unregisterSignals();
	}

	/**
	 * Unregisters any active OS process signal listeners.
	 */
	unregisterSignals(): void {
		for (const [sig, handler] of this._signalHandlers.entries()) {
			process.off(sig, handler);
		}
		this._signalHandlers.clear();
	}

	/**
	 * Executes the graceful shutdown sequence:
	 * 1. Stops accepting new HTTP requests and drains in-flight requests.
	 * 2. Stops live reload SSE streams.
	 * 3. Waits for active SQL transactions to finish.
	 * 4. Flushes database connections.
	 * 5. Closes the database connection pool.
	 * 6. Invokes lifecycle hooks.
	 *
	 * Idempotent: Subsequent concurrent calls join the existing shutdown promise.
	 */
	async shutdown(options?: ShutdownOptions): Promise<void> {
		if (this._shutdownPromise) {
			return this._shutdownPromise;
		}

		this._state = 'shutting_down';
		const log = options?.logger ?? console;
		const signal = options?.signal ?? 'manual';
		const timeoutMs = options?.timeoutMs ?? 10_000;
		const shouldExit = options?.exitProcess ?? (process.env.NODE_ENV !== 'test' && env.NODE_ENV !== 'test');
		const exitCode = options?.exitCode ?? 0;

		const executeShutdown = async () => {
			log.info?.(`⚡ Graceful shutdown initiated (${signal}). Drain timeout: ${timeoutMs}ms`);

			// 1. Invoke onBeforeShutdown hook
			if (options?.onBeforeShutdown) {
				try {
					await options.onBeforeShutdown(signal);
				} catch (err) {
					log.warn?.('⚠️ Warning in onBeforeShutdown hook:', err);
				}
			}

			// 2. Stop accepting new HTTP requests and drain in-flight requests
			for (const [server, liveReload] of this._servers.entries()) {
				try {
					liveReload?.stop();
					// server.stop(false) drains in-flight requests and stops listening
					await server.stop(false);
				} catch (err) {
					log.warn?.('⚠️ Warning while stopping HTTP server:', err);
				}
			}

			// 3. Wait for SQL transactions to finish, flush connections, and close database pool
			log.info?.('⏳ Waiting for active SQL transactions to complete and flushing connections...');
			try {
				await shutdownDatabase({ timeoutMs });
			} catch (err) {
				log.warn?.('⚠️ Warning during SQL database shutdown:', err);
				// Ensure connections are closed even on error
				try {
					await flushDatabase();
					await closeDatabase();
				} catch {
					// Ignore secondary close error
				}
				throw err;
			}

			this._state = 'shut_down';

			// 4. Invoke onAfterShutdown hook
			if (options?.onAfterShutdown) {
				try {
					await options.onAfterShutdown(signal);
				} catch (err) {
					log.warn?.('⚠️ Warning in onAfterShutdown hook:', err);
				}
			}

			this._servers.clear();
			log.info?.('✅ Graceful shutdown completed successfully.');

			if (shouldExit) {
				process.exit(exitCode);
			}
		};

		// Enforce overall timeout protection
		let timer: Timer | undefined;
		const timeoutPromise = new Promise<void>((_, reject) => {
			timer = setTimeout(() => {
				reject(new Error(`Graceful shutdown timed out after ${timeoutMs}ms`));
			}, timeoutMs);
		});

		this._shutdownPromise = Promise.race([executeShutdown(), timeoutPromise])
			.catch(async (err) => {
				log.error?.(`❌ ${err instanceof Error ? err.message : String(err)}. Forcefully terminating connections.`);

				// Force-close all servers
				for (const [server, liveReload] of this._servers.entries()) {
					try {
						liveReload?.stop();
						server.stop(true);
					} catch {
						// Ignore
					}
				}

				// Force close database
				try {
					await closeDatabase();
				} catch {
					// Ignore
				}

				this._state = 'shut_down';
				this._servers.clear();

				if (shouldExit) {
					process.exit(options?.exitCode ?? 1);
				}
				throw err;
			})
			.finally(() => {
				if (timer) {
					clearTimeout(timer);
				}
			});

		return this._shutdownPromise;
	}
}

/**
 * Singleton shutdown handler for the backend application.
 */
export const shutdownHandler = new GracefulShutdownHandler();

/**
 * Initiates graceful shutdown of the backend server and data layer.
 */
export async function gracefulShutdown(options?: ShutdownOptions): Promise<void> {
	return await shutdownHandler.shutdown(options);
}

/**
 * Sets up OS process signal handlers (SIGINT, SIGTERM, etc.) to trigger graceful shutdown.
 */
export function setupGracefulShutdown(
	serverOrOptions?: BunServer | ShutdownOptions,
	liveReloadManager?: LiveReloadManager | null,
	options?: ShutdownOptions,
): () => void {
	if (serverOrOptions && typeof (serverOrOptions as BunServer).stop === 'function') {
		shutdownHandler.registerServer(serverOrOptions as BunServer, liveReloadManager);
		return shutdownHandler.setupSignalHandlers(options);
	}

	const opts = (serverOrOptions as ShutdownOptions) ?? options;
	return shutdownHandler.setupSignalHandlers(opts);
}
