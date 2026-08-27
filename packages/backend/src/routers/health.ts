import { isDbClosing } from '@app/data';
import { shutdownHandler } from '@backend/lib/shutdown';
import { Hono } from 'hono';

/**
 * Health response payload contract.
 */
export interface HealthResponse {
	status: 'healthy' | 'shutting_down';
	timestamp: string;
	uptime: number;
}

/**
 * Generates health response data payload.
 */
export function getHealthStatus(): HealthResponse {
	const isShuttingDown = shutdownHandler.isShuttingDown || isDbClosing();
	return {
		status: isShuttingDown ? 'shutting_down' : 'healthy',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	};
}

/**
 * Hono router handling `/api/health` GET requests.
 */
export const healthRouter = new Hono().get('/', (c) => {
	const health = getHealthStatus();
	const httpStatus = health.status === 'healthy' ? 200 : 503;
	return c.json(health, httpStatus);
});
