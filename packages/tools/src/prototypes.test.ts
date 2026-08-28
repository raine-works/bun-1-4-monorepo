import { describe, expect, it } from 'bun:test';
import '@tools/prototypes';
import type { Failure, Result, Success } from '@tools/prototypes';

describe('Array.prototype extensions', () => {
	describe('isEmpty', () => {
		it('should return true for empty arrays', () => {
			expect([].isEmpty()).toBe(true);
			const empty: number[] = [];
			expect(empty.isEmpty()).toBe(true);
		});

		it('should return false for arrays with elements', () => {
			expect([1].isEmpty()).toBe(false);
			expect([1, 2, 3].isEmpty()).toBe(false);
			expect([undefined].isEmpty()).toBe(false);
			expect([null].isEmpty()).toBe(false);
			expect([''].isEmpty()).toBe(false);
		});

		it('should support readonly arrays', () => {
			const readonlyEmpty: readonly number[] = [];
			expect(readonlyEmpty.isEmpty()).toBe(true);

			const readonlyWithItems: readonly string[] = ['a', 'b'];
			expect(readonlyWithItems.isEmpty()).toBe(false);
		});
	});

	describe('flush', () => {
		it('should empty array in place', () => {
			const items = [1, 2, 3];
			items.flush();
			expect(items.length).toBe(0);
			expect(items).toEqual([]);
			expect(items.isEmpty()).toBe(true);
		});

		it('should mutate all holders of the original array reference', () => {
			const original = [{ id: 1 }, { id: 2 }];
			const alias = original;

			original.flush();

			expect(alias.length).toBe(0);
			expect(alias).toEqual([]);
			expect(alias === original).toBe(true);
		});

		it('should safely handle already empty arrays', () => {
			const items: string[] = [];
			items.flush();
			expect(items.length).toBe(0);
		});
	});

	describe('unique', () => {
		it('should deduplicate primitive values', () => {
			expect([1, 2, 2, 3, 1, 4, 3].unique()).toEqual([1, 2, 3, 4]);
			expect(['a', 'b', 'a', 'c', 'b'].unique()).toEqual(['a', 'b', 'c']);
			expect([true, false, true, true, false].unique()).toEqual([true, false]);
			expect([null, undefined, null, undefined].unique()).toEqual([null, undefined]);
		});

		it('should deduplicate objects by deep structure regardless of key order', () => {
			const objA = { x: 1, y: 2 };
			const objB = { y: 2, x: 1 };
			const objC = { x: 1, y: 3 };

			const result = [objA, objB, objC].unique();
			expect(result.length).toBe(2);
			expect(result[0]).toBe(objA);
			expect(result[1]).toBe(objC);
		});

		it('should deduplicate nested arrays and objects', () => {
			const nested1 = { tags: ['admin', 'user'], profile: { age: 30 } };
			const nested2 = { profile: { age: 30 }, tags: ['admin', 'user'] };
			const nested3 = { tags: ['user'], profile: { age: 30 } };

			const result = [nested1, nested2, nested3].unique();
			expect(result.length).toBe(2);
			expect(result[0]).toBe(nested1);
			expect(result[1]).toBe(nested3);
		});

		it('should deduplicate Dates and RegExps', () => {
			const d1 = new Date('2026-01-01T00:00:00.000Z');
			const d2 = new Date('2026-01-01T00:00:00.000Z');
			const d3 = new Date('2026-02-01T00:00:00.000Z');

			const dates = [d1, d2, d3].unique();
			expect(dates.length).toBe(2);
			expect(dates[0]).toBe(d1);
			expect(dates[1]).toBe(d3);

			const r1 = /hello/gi;
			const r2 = /hello/gi;
			const r3 = /world/gi;

			const regexes = [r1, r2, r3].unique();
			expect(regexes.length).toBe(2);
			expect(regexes[0]).toBe(r1);
			expect(regexes[1]).toBe(r3);
		});

		it('should support custom selector function', () => {
			const users = [
				{ id: 1, name: 'Alice', role: 'admin' },
				{ id: 2, name: 'Bob', role: 'member' },
				{ id: 1, name: 'Alice (Duplicate)', role: 'guest' },
			];

			const uniqueById = users.unique((u) => u.id);
			expect(uniqueById.length).toBe(2);
			expect(uniqueById[0]?.id).toBe(1);
			expect(uniqueById[0]?.name).toBe('Alice');
			expect(uniqueById[1]?.id).toBe(2);
		});
	});
});

describe('Promise prototype extensions', () => {
	describe('Promise.prototype.tryCatch', () => {
		it('should wrap resolved promises in a Success Result', async () => {
			const promise = Promise.resolve({ userId: 'u_123', name: 'Alice' });
			const result = await promise.tryCatch();

			expect(result.error).toBeNull();
			expect(result.data).toEqual({ userId: 'u_123', name: 'Alice' });

			if (result.error === null) {
				const success: Success<{ userId: string; name: string }> = result;
				expect(success.data.name).toBe('Alice');
			}
		});

		it('should wrap rejected promises in a Failure Result without throwing', async () => {
			const customError = new Error('Network timeout');
			const promise = Promise.reject(customError);
			const result = await promise.tryCatch();

			expect(result.data).toBeNull();
			expect(result.error).toBe(customError);

			if (result.data === null) {
				const failure: Failure<Error> = result;
				expect(failure.error.message).toBe('Network timeout');
			}
		});

		it('should allow custom generic type arguments for Result', async () => {
			interface UserData {
				id: number;
				email: string;
			}
			class CustomApiError extends Error {
				code = 404;
			}

			const promise: Promise<UserData> = Promise.reject(new CustomApiError('Not found'));
			const result: Result<UserData, CustomApiError> = await promise.tryCatch<CustomApiError, UserData>();

			expect(result.data).toBeNull();
			expect(result.error).toBeInstanceOf(CustomApiError);
			if (result.error) {
				expect(result.error.code).toBe(404);
			}
		});
	});

	describe('Promise.tryCatch (static method)', () => {
		it('should wrap synchronous return values in a Success Result', async () => {
			const result = await Promise.tryCatch(() => 42);
			expect(result.error).toBeNull();
			expect(result.data).toBe(42);
		});

		it('should catch synchronous thrown errors and wrap in Failure Result', async () => {
			const result = await Promise.tryCatch(() => {
				throw new Error('Sync failure');
			});

			expect(result.data).toBeNull();
			expect(result.error).toBeInstanceOf(Error);
			expect((result.error as Error).message).toBe('Sync failure');
		});

		it('should resolve asynchronous promises into a Success Result', async () => {
			const result = await Promise.tryCatch(async () => {
				await new Promise((r) => setTimeout(r, 10));
				return 'async success';
			});

			expect(result.error).toBeNull();
			expect(result.data).toBe('async success');
		});

		it('should catch asynchronous promise rejections and wrap in Failure Result', async () => {
			const result = await Promise.tryCatch(async () => {
				await new Promise((r) => setTimeout(r, 10));
				throw new Error('Async failure');
			});

			expect(result.data).toBeNull();
			expect(result.error).toBeInstanceOf(Error);
			expect((result.error as Error).message).toBe('Async failure');
		});
	});
});
