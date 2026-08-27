/**
 * Validated environment variables for @app/data.
 *
 * Scoped to packages/data. Loads `.env.local` and `.env` from the
 * package directory during local development, then parses `Bun.env`
 * through a Zod schema so the data layer fails fast with a clear,
 * human-readable error if any required database variable is missing
 * or malformed.
 *
 * Every module in the data package should import `env` from this
 * file instead of accessing `process.env` or `Bun.env` directly.
 *
 * @module env
 */

import { join } from 'node:path';
import { baseEnvSchema, loadEnvFiles, parseEnv } from '@app/tools/env';
import { z } from 'zod';

// Load package-scoped .env files for local development (highest priority first)
const packageDir = join(import.meta.dir, '..');
loadEnvFiles(packageDir);

export const envSchema = baseEnvSchema.extend({
	/**
	 * PostgreSQL connection string.
	 *
	 * Used by the Bun SQL Database client and migration runner.
	 */
	DATABASE_URL: z.url(),

	/**
	 * Maximum number of connections in the PostgreSQL connection pool.
	 * When omitted, defaults to 10.
	 */
	PGMAX_POOL: z.coerce.number().int().positive().default(10),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parsed and validated environment variables.
 *
 * If validation fails, Zod will throw a `ZodError` with details
 * about every missing or invalid variable — this surfaces during
 * startup before any database operations are accepted.
 */
export const env: Env = parseEnv(envSchema);
