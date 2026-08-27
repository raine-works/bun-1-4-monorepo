import { db } from '@app/data';
import { extractPathId, jsonError, jsonResponse, methodNotAllowed, notFound } from '@/lib/cors';
import type { User } from '@/types';

/**
 * RESTful CRUD request handler for users (`/api/users` and `/api/users/:id`).
 * Directly executes database queries against the PostgreSQL `@app/data` layer.
 *
 * Supported Endpoints:
 * - `GET /api/users`: List users (optional `?role=admin` or `?search=name`).
 * - `POST /api/users`: Create a new user (`{ "email": "...", "name": "..." }`).
 * - `GET /api/users/:id`: Get user by ID.
 * - `PATCH /api/users/:id`: Update user properties.
 * - `DELETE /api/users/:id`: Delete user by ID.
 *
 * @param req - The incoming HTTP `Request`.
 * @returns An HTTP `Response` with JSON body and appropriate HTTP status code.
 */
export async function handleUsers(req: Request): Promise<Response> {
	const url = new URL(req.url);

	try {
		// Collection endpoint: /api/users
		if (url.pathname === '/api/users') {
			if (req.method === 'GET') {
				const role = url.searchParams.get('role') || undefined;
				const search = url.searchParams.get('search') || undefined;
				const users = await db.users.list({ role, search });
				return jsonResponse({ users });
			}

			if (req.method === 'POST') {
				const body = (await req.json()) as {
					email?: string;
					name?: string;
					role?: string;
					avatarUrl?: string;
					metadata?: Record<string, unknown>;
				};

				if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
					return jsonError('Valid email is required', 400);
				}
				if (!body.name || typeof body.name !== 'string') {
					return jsonError('Name is required', 400);
				}

				const existing = await db.users.findByEmail(body.email);
				if (existing) {
					return jsonError('User with this email already exists', 409);
				}

				const newUser = await db.users.create({
					email: body.email,
					name: body.name,
					role: body.role ?? 'user',
					avatarUrl: body.avatarUrl ?? null,
					metadata: body.metadata ?? {},
				});
				return jsonResponse(newUser, { status: 201 });
			}
		}

		// Individual user endpoint: /api/users/:id
		const id = extractPathId(url.pathname, '/api/users');
		if (id) {
			if (req.method === 'GET') {
				const user = await db.users.findById(id);
				return user ? jsonResponse(user) : notFound('User');
			}

			if (req.method === 'PATCH' || req.method === 'PUT') {
				const body = (await req.json()) as Partial<User>;
				const updated = await db.users.update(id, {
					email: body.email,
					name: body.name,
					role: body.role,
					avatarUrl: body.avatarUrl,
					isActive: body.isActive,
					metadata: body.metadata,
				});
				return updated ? jsonResponse(updated) : notFound('User');
			}

			if (req.method === 'DELETE') {
				const deleted = await db.users.delete(id);
				return deleted ? jsonResponse(deleted) : notFound('User');
			}
		}

		return methodNotAllowed();
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Internal Server Error';
		return jsonError(message, 500);
	}
}
