import { describe, expect, it } from 'bun:test';
import {
	closeDatabase,
	Database,
	db,
	flushDatabase,
	getActiveDbTransactionsCount,
	isDbAvailable,
	isDbClosing,
	resetDatabase,
	shutdownDatabase,
	waitForDbTransactions,
} from '@app/data/client';
import { parseCount } from '@app/data/queries';

describe('Database Client & Query Helpers', () => {
	it('should verify isDbAvailable helper returns a boolean promise', async () => {
		const available = await isDbAvailable();
		expect(typeof available).toBe('boolean');
	});

	it('should verify Database.isAvailable() method returns a boolean promise', async () => {
		const database = new Database();
		const available = await database.isAvailable();
		expect(typeof available).toBe('boolean');
		await database.close();
	});

	it('should extract numeric count correctly via parseCount helper', () => {
		expect(parseCount([{ count: '42' }])).toBe(42);
		expect(parseCount([{ count: 100 }])).toBe(100);
		expect(parseCount([])).toBe(0);
		expect(parseCount([undefined])).toBe(0);
	});

	it('should track active transaction lifecycle during execution', async () => {
		const database = new Database();
		expect(database.activeTransactionCount).toBe(0);

		let activeInsideTx = -1;
		const txResult = await database.transaction(async (_tx) => {
			activeInsideTx = database.activeTransactionCount;
			return 'success';
		});

		expect(txResult).toBe('success');
		expect(activeInsideTx).toBe(1);
		expect(database.activeTransactionCount).toBe(0);

		await database.close();
	});

	it('should wait for in-flight transactions during waitForTransactions', async () => {
		const database = new Database();
		let txCompleted = false;

		const txPromise = database.transaction(async () => {
			await Bun.sleep(50);
			txCompleted = true;
			return 42;
		});

		expect(database.activeTransactionCount).toBe(1);
		expect(txCompleted).toBe(false);

		await database.waitForTransactions(5000);
		expect(txCompleted).toBe(true);

		const result = await txPromise;
		expect(result).toBe(42);
		expect(database.activeTransactionCount).toBe(0);

		await database.close();
	});

	it('should flush pending writes and close connection pool cleanly', async () => {
		const database = new Database();
		await database.flush();
		expect(database.isClosing).toBe(false);
		await database.close();
		expect(database.isClosing).toBe(true);
	});

	it('should perform full graceful shutdown waiting for active transactions and closing pool', async () => {
		const database = new Database();
		let txFinished = false;

		const txPromise = database.transaction(async () => {
			await Bun.sleep(40);
			txFinished = true;
			return 'done';
		});

		await Bun.sleep(10);
		expect(database.activeTransactionCount).toBe(1);

		await database.shutdown({ timeoutMs: 3000 });
		expect(txFinished).toBe(true);
		expect(database.isClosing).toBe(true);

		const res = await txPromise;
		expect(res).toBe('done');
	});

	it('should reject new transactions when database is closing or shut down', async () => {
		const database = new Database();
		await database.close();

		expect(database.isClosing).toBe(true);
		expect(
			database.transaction(async () => {
				return 'should fail';
			}),
		).rejects.toThrow('Database is shutting down');
	});

	it('should support singleton helpers: flushDatabase, waitForDbTransactions, shutdownDatabase, isDbClosing, closeDatabase', async () => {
		resetDatabase();
		expect(isDbClosing()).toBe(false);
		expect(getActiveDbTransactionsCount()).toBe(0);

		await db.ping();
		await flushDatabase();
		await waitForDbTransactions(1000);
		await closeDatabase();
		await shutdownDatabase({ timeoutMs: 1000 });
		expect(isDbClosing()).toBe(false); // resetDatabase set defaultDbInstance to null
		resetDatabase();
	});

	it('should handle timeout in waitForTransactions when a transaction hangs', async () => {
		const database = new Database();

		// Start a transaction that takes 200ms
		const hangingTx = database.transaction(async () => {
			await Bun.sleep(200);
		});

		// Waiting with 30ms timeout should throw timeout error
		expect(database.waitForTransactions(30)).rejects.toThrow('Timed out waiting');

		// Cleanup
		await hangingTx;
		await database.close();
	});
});
