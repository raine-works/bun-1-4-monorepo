import { Hono } from 'hono';

/**
 * Health response payload contract.
 */
export interface HealthResponse {
	status: 'healthy';
	timestamp: string;
	uptime: number;
}

/**
 * Generates health response data payload.
 */
export function getHealthStatus(): HealthResponse {
	return {
		status: 'healthy',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	};
}

/**
 * Hono router handling `/api/health` GET requests.
 */
export const healthRouter = new Hono().get('/', (c) => {
	return c.json(getHealthStatus(), 200);
});
