import { jsonResponse } from "@/lib/cors";

/**
 * Handles `/api/health` requests, returning server status, timestamp, and process uptime.
 *
 * @returns An HTTP `Response` with JSON health payload and CORS headers.
 */
export function handleHealth(): Response {
  return jsonResponse({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
