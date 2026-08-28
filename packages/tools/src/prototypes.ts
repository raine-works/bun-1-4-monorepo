/**
 * Global Array and Promise prototype extensions for common convenience methods.
 *
 * Import this module once at the application entry point to make
 * these methods available globally:
 *
 * ```ts
 * import "@app/tools/prototypes";
 *
 * // Arrays
 * const items = [1, 2, 3];
 * items.isEmpty(); // false
 * items.flush();   // items is now []
 *
 * // Promises
 * const { data, error } = await fetchUser(id).tryCatch();
 * if (error) return handleError(error);
 * console.log(data.name);
 * ```
 *
 * @module prototypes
 */

/** A successful result containing `data` and a `null` error. */
export type Success<T> = { data: T; error: null };

/** A failed result containing a `null` data field and the caught `error`. */
export type Failure<E> = { data: null; error: E };

/** Discriminated union — either a {@link Success} or a {@link Failure}. */
export type Result<T, E> = Success<T> | Failure<E>;

declare global {
	interface Array<T> {
		/** Returns `true` when the array has no elements. */
		isEmpty(): boolean;

		/** Removes all elements from the array in place by setting `length` to 0. */
		flush(): void;

		/** Returns a new array with duplicate values removed. Supports JSON objects and primitives. */
		unique(by?: (item: T) => unknown): T[];
	}

	interface ReadonlyArray<T> {
		/** Returns `true` when the array has no elements. */
		isEmpty(): boolean;

		/** Returns a new array with duplicate values removed. Supports JSON objects and primitives. */
		unique(by?: (item: T) => unknown): T[];
	}

	interface Promise<T> {
		/**
		 * Wraps a `Promise` and returns a `Result` instead of throwing.
		 *
		 * @typeParam E - The error type (defaults to `Error`).
		 * @typeParam R - The return type (defaults to `T`).
		 *
		 * @example
		 * ```ts
		 * const { data, error } = await fetchUser(id).tryCatch();
		 *
		 * // With a custom error type and return type
		 * const { data, error } = await fetchUser(id).tryCatch<Error, GetDataResult>();
		 * ```
		 */
		tryCatch<E = Error, R = T>(): Promise<Result<R, E>>;
	}

	interface PromiseConstructor {
		/**
		 * Executes a function and wraps the result in a `Result`, catching both synchronous throws and promise rejections.
		 *
		 * @example
		 * ```ts
		 * const { data, error } = await Promise.tryCatch(() => doSomething());
		 * ```
		 */
		tryCatch<T, E = Error>(fn: () => T | PromiseLike<T>): Promise<Result<T, E>>;
	}
}

function defineArrayPrototypeMethod<TArgs extends unknown[], TReturn>(
	name: 'isEmpty' | 'flush' | 'unique',
	value: (this: unknown[], ...args: TArgs) => TReturn,
): void {
	const existing = Object.getOwnPropertyDescriptor(Array.prototype, name);
	if (existing?.value) return;

	Object.defineProperty(Array.prototype, name, {
		value,
		writable: true,
		configurable: true,
		enumerable: false,
	});
}

/** Returns `true` when the array has no elements. */
defineArrayPrototypeMethod('isEmpty', function <T>(this: T[]): boolean {
	return this.length === 0;
});

/**
 * Removes all elements from the array in place by setting its
 * `length` to 0. Unlike reassigning to `[]`, this mutates the
 * original reference so all holders of that reference see the change.
 */
defineArrayPrototypeMethod('flush', function <T>(this: T[]): void {
	this.length = 0;
});

function stableStringify(value: unknown): string {
	if (value === null) {
		return 'null';
	}
	if (value === undefined) {
		return 'undefined';
	}
	if (typeof value !== 'object') {
		return `${typeof value}:${String(value)}`;
	}
	if (Array.isArray(value)) {
		return `[${value.map(stableStringify).join(',')}]`;
	}
	if (value instanceof Date) {
		return `date:${value.getTime()}`;
	}
	if (value instanceof RegExp) {
		return `regexp:${value.toString()}`;
	}
	// Object
	const keys = Object.keys(value as object).sort();
	const parts = keys.map((key) => {
		const val = (value as Record<string, unknown>)[key];
		return `${key}:${stableStringify(val)}`;
	});
	return `{${parts.join(',')}}`;
}

/**
 * Returns a new array with duplicate values removed.
 * It compares JSON objects by their structure/properties (order-independent)
 * and primitives by their type and value.
 */
defineArrayPrototypeMethod('unique', function <T>(this: T[], by?: (item: T) => unknown): T[] {
	const seen = new Set<string>();
	const result: T[] = [];
	for (const item of this) {
		const keyVal = by ? by(item) : item;
		const key = stableStringify(keyVal);
		if (!seen.has(key)) {
			seen.add(key);
			result.push(item);
		}
	}
	return result;
});

// Promise prototype extensions
const existingPromiseTryCatch = Object.getOwnPropertyDescriptor(Promise.prototype, 'tryCatch');
if (!existingPromiseTryCatch?.value) {
	Object.defineProperty(Promise.prototype, 'tryCatch', {
		value: function <T, E = Error, R = T>(this: Promise<T>): Promise<Result<R, E>> {
			return this.then(
				(data) => ({ data, error: null }) as unknown as Success<R>,
				(error) => ({ data: null, error: error as E }) as Failure<E>,
			);
		},
		writable: true,
		configurable: true,
		enumerable: false,
	});
}

// Promise static extensions
const existingStaticPromiseTryCatch = Object.getOwnPropertyDescriptor(Promise, 'tryCatch');
if (!existingStaticPromiseTryCatch?.value) {
	Object.defineProperty(Promise, 'tryCatch', {
		value: <T, E = Error>(fn: () => T | PromiseLike<T>): Promise<Result<T, E>> =>
			Promise.resolve()
				.then(fn)
				.then(
					(data) => ({ data, error: null }) as Success<T>,
					(error) => ({ data: null, error: error as E }) as Failure<E>,
				),
		writable: true,
		configurable: true,
		enumerable: false,
	});
}
