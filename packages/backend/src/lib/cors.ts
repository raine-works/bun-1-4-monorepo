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
