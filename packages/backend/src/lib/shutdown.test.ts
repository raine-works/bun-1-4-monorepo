import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { closeDatabase, db, resetDatabase } from '@app/data';
import { createApp, createServer } from '@/index';
import { GracefulShutdownHandler, gracefulShutdown, setupGracefulShutdown, shutdownHandler } from '@/lib/shutdown';

describe('Graceful Shutdown Handler (@app/backend)', () => {
	beforeEach(() => {
		shutdownHandler.reset();
		resetDatabase();
	});

	afterEach(async () => {
		shutdownHandler.reset();
		try {
			await closeDatabase();
		} catch {
			// Ignore
		}
		resetDatabase();
	});

	it('should transition through shutdown states correctly', async () => {
		const handler = new GracefulShutdownHandler();
		expect(handler.state).toBe('idle');
		expect(handler.isShuttingDown).toBe(false);
		expect(handler.isShutDown).toBe(false);

		let beforeCalled = false;
		let afterCalled = false;

		await handler.shutdown({
			exitProcess: false,
			timeoutMs: 3000,
			onBeforeShutdown: () => {
				beforeCalled = true;
				expect(handler.isShuttingDown).toBe(true);
			},
			onAfterShutdown: () => {
				afterCalled = true;
				expect(handler.isShutDown).toBe(true);
			},
		});

		expect(beforeCalled).toBe(true);
		expect(afterCalled).toBe(true);
		expect(handler.state).toBe('shut_down');
		expect(handler.isShuttingDown).toBe(false);
		expect(handler.isShutDown).toBe(true);
	});

	it('should wait for active SQL transactions to finish before closing connections', async () => {
		let txCompleted = false;

		// Start a transaction simulating active database work
		const txPromise = db.transaction(async () => {
			await Bun.sleep(60);
			txCompleted = true;
			return 'tx_result';
		});

		await Bun.sleep(10);
		expect(db.activeTransactionCount).toBe(1);
		expect(txCompleted).toBe(false);

		// Initiate graceful shutdown
		await gracefulShutdown({
			timeoutMs: 3000,
			exitProcess: false,
		});

		expect(txCompleted).toBe(true);
		const result = await txPromise;
		expect(result).toBe('tx_result');
	});

	it('should gracefully drain in-flight HTTP requests on registered server', async () => {
		const server = Bun.serve({
			port: 0,
			async fetch(req) {
				const url = new URL(req.url);
				if (url.pathname === '/slow') {
					await Bun.sleep(80);
					return new Response('slow finished');
				}
				return new Response('ok');
			},
		});

		shutdownHandler.registerServer(server);

		const inFlightFetch = fetch(`http://localhost:${server.port}/slow`).then((r) => r.text());
		await Bun.sleep(15);

		// Trigger shutdown while HTTP request is in-flight
		await shutdownHandler.shutdown({
			timeoutMs: 3000,
			exitProcess: false,
		});

		const fetchResult = await inFlightFetch;
		expect(fetchResult).toBe('slow finished');
	});

	it('should be idempotent when called concurrently', async () => {
		let beforeCount = 0;
		let afterCount = 0;

		const opts = {
			exitProcess: false,
			timeoutMs: 3000,
			onBeforeShutdown: () => {
				beforeCount++;
			},
			onAfterShutdown: () => {
				afterCount++;
			},
		};

		// Call shutdown multiple times concurrently
		await Promise.all([shutdownHandler.shutdown(opts), shutdownHandler.shutdown(opts), shutdownHandler.shutdown(opts)]);

		expect(beforeCount).toBe(1);
		expect(afterCount).toBe(1);
		expect(shutdownHandler.isShutDown).toBe(true);
	});

	it('should support server.shutdown() method attached by createServer', async () => {
		const server = createServer({ port: 0, liveReload: false });
		const url = `http://localhost:${server.port}`;

		const res = await fetch(`${url}/api/health`);
		expect(res.status).toBe(200);

		// Execute graceful shutdown via server.shutdown()
		await server.shutdown({ timeoutMs: 3000, exitProcess: false });
		expect(shutdownHandler.isShutDown).toBe(true);
	});

	it('should register and clean up OS signal handlers', () => {
		const handler = new GracefulShutdownHandler();
		const cleanup = handler.setupSignalHandlers({ exitProcess: false });

		expect(typeof cleanup).toBe('function');
		cleanup();
	});

	it('should helper setupGracefulShutdown register signals and return cleanup', () => {
		const cleanup = setupGracefulShutdown({ exitProcess: false });
		expect(typeof cleanup).toBe('function');
		cleanup();
	});

	it('should handle timeout when in-flight transaction hangs', async () => {
		const handler = new GracefulShutdownHandler();

		// Start a transaction on default db that hangs longer than the shutdown timeout
		const hangingPromise = db.transaction(async () => {
			await Bun.sleep(300);
		});

		await Bun.sleep(10);

		// Shutdown with a very short timeout (40ms) should reject with timeout error
		expect(
			handler.shutdown({
				timeoutMs: 40,
				exitProcess: false,
			}),
		).rejects.toThrow();

		await hangingPromise;
		try {
			await closeDatabase();
		} catch {
			// Ignore
		}
	});

	it('should report 503 shutting_down from /api/health when shutdown is in progress', async () => {
		const { app: honoApp } = createApp({ port: 0, liveReload: false });

		// Check healthy initially
		const initialRes = await honoApp.request('/api/health');
		expect(initialRes.status).toBe(200);
		const initialData = (await initialRes.json()) as { status: string };
		expect(initialData.status).toBe('healthy');

		// Start a transaction to hold shutdown in 'shutting_down' state
		let releaseTx!: () => void;
		const txHold = new Promise<void>((resolve) => {
			releaseTx = resolve;
		});

		const txPromise = db.transaction(async () => {
			await txHold;
		});

		await Bun.sleep(10);

		// Trigger shutdown in background
		const shutdownPromise = shutdownHandler.shutdown({
			timeoutMs: 4000,
			exitProcess: false,
		});

		await Bun.sleep(20);
		expect(shutdownHandler.isShuttingDown).toBe(true);

		// Health endpoint should return 503 shutting_down
		const healthRes = await honoApp.request('/api/health');
		expect(healthRes.status).toBe(503);
		const healthData = (await healthRes.json()) as { status: string };
		expect(healthData.status).toBe('shutting_down');

		// Release transaction to complete shutdown
		releaseTx();
		await txPromise;
		await shutdownPromise;
	});
});
