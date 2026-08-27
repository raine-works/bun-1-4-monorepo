/**
 * Dynamic HTTP Compression Middleware for Bun
 * ----------------------------------------------------------------------------
 * Inspects incoming request `Accept-Encoding` and compresses compressible
 * responses (HTML, JS, CSS, JSON, SVG, TXT) via `Bun.gzipSync` when gzip is supported.
 * Skips SSE streams, HEAD requests, small payloads (<128B), and already-compressed bodies.
 */

/**
 * Checks if a response can and should be compressed with gzip.
 *
 * @param req - Incoming HTTP request.
 * @param response - Outgoing HTTP response.
 * @returns A gzipped HTTP Response with `Content-Encoding: gzip` or the unmodified response.
 */
export async function applyCompression(req: Request, response: Response): Promise<Response> {
	const contentType = response.headers.get('content-type') || '';
	const contentEncoding = response.headers.get('content-encoding');

	// Skip SSE, HEAD requests, 204/304, or already compressed responses
	if (
		req.method === 'HEAD' ||
		response.status === 204 ||
		response.status === 304 ||
		contentEncoding ||
		contentType.includes('text/event-stream')
	) {
		return response;
	}

	// Only compress text-based and compressible MIME types
	const isCompressible =
		contentType.startsWith('text/') ||
		contentType.includes('javascript') ||
		contentType.includes('json') ||
		contentType.includes('svg+xml') ||
		contentType.includes('xml');

	if (!isCompressible) {
		return response;
	}

	const acceptEncoding = req.headers.get('accept-encoding') || '';
	if (!acceptEncoding.includes('gzip')) {
		return response;
	}

	try {
		const arrayBuffer = await response.arrayBuffer();
		// Do not compress tiny payloads (< 128 bytes)
		if (arrayBuffer.byteLength < 128) {
			return new Response(arrayBuffer, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			});
		}

		const compressed = Bun.gzipSync(Buffer.from(arrayBuffer));
		const headers = new Headers(response.headers);
		headers.set('Content-Encoding', 'gzip');
		headers.set('Vary', 'Accept-Encoding');
		headers.set('Content-Length', String(compressed.byteLength));

		return new Response(compressed, {
			status: response.status,
			statusText: response.statusText,
			headers,
		});
	} catch {
		return response;
	}
}
