import { describe, expect, it } from 'bun:test';
import { Database } from '@app/data/client';
import { env, envSchema } from '@app/data/env';

describe('Environment Variables & Zod Validation (@app/data)', () => {
	it('should validate and export current environment with DATABASE_URL', () => {
		expect(env.DATABASE_URL).toBeDefined();
		expect(typeof env.DATABASE_URL).toBe('string');
		expect(env.DATABASE_URL).toContain('postgres');
	});

	it('should parse valid PostgreSQL connection strings through envSchema', () => {
		const parsed = envSchema.parse({
			DATABASE_URL: 'postgres://test_user:test_pass@db.example.com:5432/my_db',
			NODE_ENV: 'production',
			PGMAX_POOL: '25',
		});

		expect(parsed.DATABASE_URL).toBe('postgres://test_user:test_pass@db.example.com:5432/my_db');
		expect(parsed.NODE_ENV).toBe('production');
		expect(parsed.PGMAX_POOL).toBe(25);
	});

	it('should accept postgresql:// protocol URLs', () => {
		const parsed = envSchema.parse({
			DATABASE_URL: 'postgresql://dev_user:dev_password@localhost:5432/dev_db',
		});

		expect(parsed.DATABASE_URL).toBe('postgresql://dev_user:dev_password@localhost:5432/dev_db');
		expect(parsed.NODE_ENV).toBe('development');
		expect(parsed.PGMAX_POOL).toBe(10);
	});

	it('should fail fast with ZodError when DATABASE_URL is missing', () => {
		const result = envSchema.safeParse({});
		expect(result.success).toBe(false);
		if (!result.success) {
			const issue = result.error.issues.find((i) => i.path.includes('DATABASE_URL'));
			expect(issue).toBeDefined();
		}
	});

	it('should fail fast with ZodError when DATABASE_URL is not a valid URL', () => {
		const result = envSchema.safeParse({
			DATABASE_URL: 'not-a-valid-database-url',
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const issue = result.error.issues.find((i) => i.path.includes('DATABASE_URL'));
			expect(issue).toBeDefined();
		}
	});

	it('should reject invalid NODE_ENV values', () => {
		const result = envSchema.safeParse({
			DATABASE_URL: 'postgres://localhost:5432/db',
			NODE_ENV: 'invalid_env',
		});
		expect(result.success).toBe(false);
	});

	it('should instantiate Database client using default env.DATABASE_URL', () => {
		const dbInstance = new Database();
		expect(dbInstance.sql).toBeDefined();
	});

	it('should allow explicit URL override in Database constructor', () => {
		const customUrl = 'postgres://custom:pass@customhost:5432/app';
		const dbInstance = new Database(customUrl);
		expect(dbInstance.sql).toBeDefined();
	});

	it('should allow DatabaseOptions object in Database constructor', () => {
		const dbInstance = new Database({
			url: 'postgres://custom:pass@customhost:5432/app',
			max: 5,
			idleTimeout: 15,
		});
		expect(dbInstance.sql).toBeDefined();
	});
});
