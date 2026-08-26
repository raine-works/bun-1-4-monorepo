import { jsonResponse } from "@/lib/cors";

export function handleHealth(): Response {
  return jsonResponse({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
