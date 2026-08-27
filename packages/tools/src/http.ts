/**
 * Standard CORS headers configured for open access across micro-frontends and APIs.
 */
export const CORS_HEADERS: Record<string, string> = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Returns standard MIME content type based on the file extension.
 *
 * @param filePath - Path or filename of the asset.
 * @returns Standard MIME content type with charset if applicable.
 */
export function getMimeType(filePath: string): string {
	const clean = filePath.split('?')[0].toLowerCase();
	if (clean.endsWith('.html')) return 'text/html; charset=utf-8';
	if (clean.endsWith('.js') || clean.endsWith('.mjs')) return 'text/javascript; charset=utf-8';
	if (clean.endsWith('.css')) return 'text/css; charset=utf-8';
	if (clean.endsWith('.json')) return 'application/json; charset=utf-8';
	if (clean.endsWith('.svg')) return 'image/svg+xml';
	if (clean.endsWith('.png')) return 'image/png';
	if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
	if (clean.endsWith('.webp')) return 'image/webp';
	if (clean.endsWith('.ico')) return 'image/x-icon';
	if (clean.endsWith('.woff2')) return 'font/woff2';
	if (clean.endsWith('.woff')) return 'font/woff';
	if (clean.endsWith('.map')) return 'application/json';
	if (clean.endsWith('.txt')) return 'text/plain; charset=utf-8';
	return 'application/octet-stream';
}

/**
 * Returns HTTP caching and security headers optimized for Lighthouse scores.
 * Hashed assets (chunk-*.js, chunk-*.css) receive immutable 1-year caching.
 * HTML documents receive max-age=0 must-revalidate for fresh updates.
 *
 * @param filePath - The path or filename of the asset.
 * @param isDev - Whether live reload development mode is active.
 * @returns Headers dictionary.
 */
export function getAssetHeaders(filePath: string, isDev = false): Record<string, string> {
	const mimeType = getMimeType(filePath);
	const isHtml = mimeType.startsWith('text/html');
	const isHashedChunk = /chunk-[a-zA-Z0-9_-]+\.(js|css)(\.map)?$/.test(filePath);

	let cacheControl: string;
	if (isHtml) {
		cacheControl = isDev ? 'no-cache, no-store, must-revalidate' : 'public, max-age=0, must-revalidate';
	} else if (isHashedChunk) {
		cacheControl = 'public, max-age=31536000, immutable';
	} else if (/\.(woff2?|png|jpe?g|svg|webp|ico|txt)$/.test(filePath)) {
		cacheControl = 'public, max-age=86400';
	} else {
		cacheControl = isDev ? 'no-cache, must-revalidate' : 'public, max-age=3600';
	}

	return {
		'Content-Type': mimeType,
		'Cache-Control': cacheControl,
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'SAMEORIGIN',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
	};
}

/**
 * Determines whether the current process is executing within a self-contained Bun standalone binary.
 * Standalone binaries embed assets in Bun's virtual filesystem (`/$bunfs` or `Bun.embeddedFiles`).
 *
 * @returns `true` if running as a compiled standalone executable, `false` otherwise.
 */
export function isStandaloneMode(): boolean {
	return Boolean(Bun.embeddedFiles?.length > 0 || import.meta.dir.startsWith('/$bunfs'));
}
