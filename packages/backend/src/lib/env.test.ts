import { describe, expect, it } from 'bun:test';
import { env, envSchema } from '@/lib/env';

describe('Environment Variables & Zod Validation (@app/backend)', () => {
	it('should validate and export current environment variables', () => {
		expect(env.DATABASE_URL).toBeDefined();
		expect(typeof env.DATABASE_URL).toBe('string');
		expect(typeof env.PORT).toBe('number');
		expect(['development', 'production', 'test']).toContain(env.NODE_ENV);
	});

	it('should parse valid backend environment variables', () => {
		const parsed = envSchema.parse({
			DATABASE_URL: 'postgres://app_user:secret@postgres.internal:5432/production_db',
			NODE_ENV: 'production',
			PORT: '8080',
			FRONTEND_DIST: '/var/www/dist',
		});

		expect(parsed.DATABASE_URL).toBe('postgres://app_user:secret@postgres.internal:5432/production_db');
		expect(parsed.NODE_ENV).toBe('production');
		expect(parsed.PORT).toBe(8080);
		expect(parsed.FRONTEND_DIST).toBe('/var/www/dist');
	});

	it('should fall back to default values for optional variables', () => {
		const parsed = envSchema.parse({
			DATABASE_URL: 'postgres://localhost:5432/test',
		});

		expect(parsed.NODE_ENV).toBe('development');
		expect(parsed.PORT).toBe(3000);
		expect(parsed.FRONTEND_DIST).toBeUndefined();
	});

	it('should fail fast with ZodError when DATABASE_URL is missing', () => {
		const result = envSchema.safeParse({
			PORT: 3000,
		});
		expect(result.success).toBe(false);
	});

	it('should fail fast with ZodError when DATABASE_URL is invalid', () => {
		const result = envSchema.safeParse({
			DATABASE_URL: 'invalid-url',
		});
		expect(result.success).toBe(false);
	});
});
