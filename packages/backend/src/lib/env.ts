/**
 * Validated environment variables for @app/backend.
 *
 * Scoped to packages/backend. Loads `.env.local` and `.env` from the
 * package directory during local development, then parses `Bun.env`
 * through a Zod schema so the server fails fast with a clear,
 * human-readable error if any required variable is missing or malformed.
 *
 * Every module in the backend package should import `env` from this
 * file instead of accessing `process.env` or `Bun.env` directly.
 *
 * @module env
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

// Load package-scoped .env files for local development (highest priority first)
const packageDir = join(import.meta.dir, '../..');
const localEnvPath = join(packageDir, '.env.local');
const baseEnvPath = join(packageDir, '.env');

if (existsSync(localEnvPath)) {
	process.loadEnvFile(localEnvPath);
}
if (existsSync(baseEnvPath)) {
	process.loadEnvFile(baseEnvPath);
}

export const envSchema = z.object({
	/** Application environment. Defaults to `"development"`. */
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

	/**
	 * Port the HTTP server should bind to. Defaults to `3000`.
	 */
	PORT: z.coerce.number().int().positive().default(3000),

	/**
	 * PostgreSQL connection string.
	 *
	 * Used by the Bun SQL Database client and migration runner.
	 */
	DATABASE_URL: z.url(),

	/**
	 * Root directory containing the built frontend bundles.
	 * When omitted, resolves relative to the workspace packages.
	 */
	FRONTEND_DIST: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parsed and validated environment variables.
 *
 * If validation fails, Zod will throw a `ZodError` with details
 * about every missing or invalid variable — this surfaces during
 * server startup before any requests are accepted.
 */
export const env: Env = envSchema.parse(Bun.env);
