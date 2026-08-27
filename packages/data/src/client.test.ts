import { describe, expect, it } from 'bun:test';
import { Database, isDbAvailable } from '@/client';
import { parseCount } from '@/queries';

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
});
