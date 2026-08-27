import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

/**
 * Loads package-scoped environment files (`.env.local`, `.env`) in priority order.
 *
 * @param packageDir - Absolute directory path of the package.
 * @param filenames - Optional list of environment filenames to load (defaults to `['.env.local', '.env']`).
 */
export function loadEnvFiles(packageDir: string, filenames: string[] = ['.env.local', '.env']): void {
	for (const filename of filenames) {
		const envPath = join(packageDir, filename);
		if (existsSync(envPath)) {
			process.loadEnvFile(envPath);
		}
	}
}

/**
 * Base Zod environment schema with standard `NODE_ENV` configuration.
 */
export const baseEnvSchema = z.object({
	/** Application runtime environment. Defaults to `"development"`. */
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

/**
 * Parses and validates environment variables against a given Zod schema.
 *
 * @param schema - The Zod schema to validate against.
 * @param rawEnv - Optional raw environment dictionary (defaults to `Bun.env`).
 * @returns Fully validated and typed environment object.
 */
export function parseEnv<T extends z.ZodTypeAny>(
	schema: T,
	rawEnv: Record<string, string | undefined> = Bun.env,
): z.infer<T> {
	return schema.parse(rawEnv);
}
