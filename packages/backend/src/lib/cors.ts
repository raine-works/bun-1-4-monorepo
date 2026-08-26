/**
 * Standard CORS headers configured for open access across micro-frontends and APIs.
 */
export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Handles HTTP `OPTIONS` preflight requests by responding with status 204/200 and standard CORS headers.
 *
 * @returns A response containing empty body and permissive CORS headers.
 */
export function handleCorsPreflight(): Response {
  return new Response(null, { headers: CORS_HEADERS });
}

/**
 * Creates a standard JSON `Response` with serialized data and default CORS headers merged in.
 *
 * @param data - The JSON-serializable data payload.
 * @param init - Optional response initialization options (status, statusText, headers).
 * @returns A standard `Response` object with `application/json` content-type and CORS headers.
 */
export function jsonResponse(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: {
      ...CORS_HEADERS,
      ...(init?.headers || {}),
    },
  });
}

/**
 * Creates a JSON error response with a standardized `{ error: message }` payload.
 */
export function jsonError(message: string, status = 400): Response {
  return jsonResponse({ error: message }, { status });
}

/**
 * Creates a standard 404 Not Found response.
 */
export function notFound(resource = "Resource"): Response {
  return jsonResponse({ error: `${resource} not found` }, { status: 404 });
}

/**
 * Creates a standard 405 Method Not Allowed response.
 */
export function methodNotAllowed(): Response {
  return jsonResponse({ error: "Method not allowed" }, { status: 405 });
}

/**
 * Extracts a single resource ID from a URL pathname matching `${prefix}/:id`.
 */
export function extractPathId(pathname: string, prefix: string): string | null {
  const cleanPrefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  const escaped = cleanPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = pathname.match(new RegExp(`^${escaped}/([^/]+)$`));
  return match ? (match[1] ?? null) : null;
}
