import { describe, expect, it } from 'bun:test';
import {
	baseEnvSchema,
	CORS_HEADERS,
	cleanBunBuildArtifacts,
	colors,
	getAssetHeaders,
	getMimeType,
	isStandaloneMode,
	loadEnvFiles,
	parseCount,
	parseEnv,
	parseMigrationSql,
} from '@tools/index';

describe('@app/tools HTTP utilities', () => {
	it('should provide standard CORS headers', () => {
		expect(CORS_HEADERS['Access-Control-Allow-Origin']).toBe('*');
		expect(CORS_HEADERS['Access-Control-Allow-Methods']).toContain('GET');
		expect(CORS_HEADERS['Access-Control-Allow-Headers']).toContain('Content-Type');
	});

	it('should resolve standard MIME types for web assets', () => {
		expect(getMimeType('index.html')).toBe('text/html; charset=utf-8');
		expect(getMimeType('/assets/chunk-123.js')).toBe('text/javascript; charset=utf-8');
		expect(getMimeType('/assets/chunk-123.mjs')).toBe('text/javascript; charset=utf-8');
		expect(getMimeType('styles.css')).toBe('text/css; charset=utf-8');
		expect(getMimeType('data.json')).toBe('application/json; charset=utf-8');
		expect(getMimeType('icon.svg')).toBe('image/svg+xml');
		expect(getMimeType('image.png')).toBe('image/png');
		expect(getMimeType('photo.jpg')).toBe('image/jpeg');
		expect(getMimeType('banner.webp')).toBe('image/webp');
		expect(getMimeType('font.woff2')).toBe('font/woff2');
		expect(getMimeType('unknown.xyz')).toBe('application/octet-stream');
	});

	it('should generate appropriate caching headers for hashed vs html vs static assets', () => {
		const htmlHeaders = getAssetHeaders('index.html', false);
		expect(htmlHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
		expect(htmlHeaders['X-Content-Type-Options']).toBe('nosniff');

		const htmlDevHeaders = getAssetHeaders('index.html', true);
		expect(htmlDevHeaders['Cache-Control']).toBe('no-cache, no-store, must-revalidate');

		const chunkHeaders = getAssetHeaders('/dist/chunk-abc123_.js', false);
		expect(chunkHeaders['Cache-Control']).toBe('public, max-age=31536000, immutable');

		const imgHeaders = getAssetHeaders('logo.png', false);
		expect(imgHeaders['Cache-Control']).toBe('public, max-age=86400');
	});

	it('should detect standalone mode status as a boolean', () => {
		expect(typeof isStandaloneMode()).toBe('boolean');
	});
});

describe('@app/tools CLI utilities', () => {
	it('should export ANSI color escape sequences', () => {
		expect(colors.green).toBe('\x1b[32m');
		expect(colors.red).toBe('\x1b[31m');
		expect(colors.bold).toBe('\x1b[1m');
		expect(colors.reset).toBe('\x1b[0m');
	});

	it('should safely handle cleanBunBuildArtifacts on nonexistent directory', () => {
		expect(() => cleanBunBuildArtifacts('/tmp/nonexistent-tools-dir-test')).not.toThrow();
	});
});

describe('@app/tools Environment utilities', () => {
	it('should validate default NODE_ENV with baseEnvSchema', () => {
		const parsed = baseEnvSchema.parse({});
		expect(parsed.NODE_ENV).toBe('development');

		const prod = baseEnvSchema.parse({ NODE_ENV: 'production' });
		expect(prod.NODE_ENV).toBe('production');

		expect(() => baseEnvSchema.parse({ NODE_ENV: 'invalid' })).toThrow();
	});

	it('should parse environment through parseEnv helper', () => {
		const env = parseEnv(baseEnvSchema, { NODE_ENV: 'test' });
		expect(env.NODE_ENV).toBe('test');
	});

	it('should safely execute loadEnvFiles without error on nonexistent directories', () => {
		expect(() => loadEnvFiles('/tmp/nonexistent-env-path')).not.toThrow();
	});
});

describe('@app/tools SQL utilities', () => {
	it('should parse numeric count from rows', () => {
		expect(parseCount([{ count: '10' }])).toBe(10);
		expect(parseCount([{ count: 42 }])).toBe(42);
		expect(parseCount([])).toBe(0);
		expect(parseCount([undefined])).toBe(0);
	});

	it('should parse SQL migration files into up and down sections', () => {
		const sql = `
-- Migration: 0001_initial
-- up
CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT);

-- down
DROP TABLE users;
`;
		const result = parseMigrationSql(sql);
		expect(result.up).toContain('CREATE TABLE users');
		expect(result.down).toContain('DROP TABLE users');
	});

	it('should parse SQL without down section', () => {
		const sql = `
CREATE TABLE items (id SERIAL PRIMARY KEY);
`;
		const result = parseMigrationSql(sql);
		expect(result.up).toContain('CREATE TABLE items');
		expect(result.down).toBe('');
	});
});
