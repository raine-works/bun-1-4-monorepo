import { createUserSchema, db, updateUserSchema, userFilterSchema } from '@app/data';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

/**
 * RESTful CRUD router for users (`/api/users` and `/api/users/:id`).
 * Directly executes database queries against the PostgreSQL `@app/data` layer.
 *
 * Supported Endpoints:
 * - `GET /api/users`: List users (optional `?role=admin` or `?search=name`).
 * - `POST /api/users`: Create a new user (`{ "email": "...", "name": "..." }`).
 * - `GET /api/users/:id`: Get user by ID.
 * - `PATCH /api/users/:id`: Update user properties.
 * - `PUT /api/users/:id`: Update user properties.
 * - `DELETE /api/users/:id`: Delete user by ID.
 */
export const usersRouter = new Hono()
	.get(
		'/',
		zValidator('query', userFilterSchema, (result, c) => {
			if (!result.success) {
				const message = result.error.issues[0]?.message || 'Invalid query parameters';
				return c.json({ error: message }, 400);
			}
		}),
		async (c) => {
			try {
				const query = c.req.valid('query');
				const role = query.role || undefined;
				const search = query.search || undefined;
				const users = await db.users.list({ role, search });
				return c.json({ users }, 200);
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Internal Server Error';
				return c.json({ error: message }, 500);
			}
		},
	)
	.post(
		'/',
		zValidator('json', createUserSchema, (result, c) => {
			if (!result.success) {
				const message = result.error.issues[0]?.message || 'Invalid user payload';
				return c.json({ error: message }, 400);
			}
		}),
		async (c) => {
			try {
				const body = c.req.valid('json');
				const existing = await db.users.findByEmail(body.email);
				if (existing) {
					return c.json({ error: 'User with this email already exists' }, 409);
				}

				const newUser = await db.users.create({
					email: body.email,
					name: body.name,
					role: body.role ?? 'user',
					avatarUrl: body.avatarUrl ?? null,
					isActive: body.isActive ?? true,
					metadata: body.metadata ?? {},
				});
				return c.json(newUser, 201);
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Internal Server Error';
				return c.json({ error: message }, 500);
			}
		},
	)
	.get('/:id', async (c) => {
		try {
			const id = c.req.param('id');
			const user = await db.users.findById(id);
			if (!user) {
				return c.json({ error: 'User not found' }, 404);
			}
			return c.json(user, 200);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Internal Server Error';
			return c.json({ error: message }, 500);
		}
	})
	.patch(
		'/:id',
		zValidator('json', updateUserSchema, (result, c) => {
			if (!result.success) {
				const message = result.error.issues[0]?.message || 'Invalid user update payload';
				return c.json({ error: message }, 400);
			}
		}),
		async (c) => {
			try {
				const id = c.req.param('id');
				const body = c.req.valid('json');
				const updated = await db.users.update(id, {
					email: body.email,
					name: body.name,
					role: body.role,
					avatarUrl: body.avatarUrl,
					isActive: body.isActive,
					metadata: body.metadata,
				});
				if (!updated) {
					return c.json({ error: 'User not found' }, 404);
				}
				return c.json(updated, 200);
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Internal Server Error';
				return c.json({ error: message }, 500);
			}
		},
	)
	.put(
		'/:id',
		zValidator('json', updateUserSchema, (result, c) => {
			if (!result.success) {
				const message = result.error.issues[0]?.message || 'Invalid user update payload';
				return c.json({ error: message }, 400);
			}
		}),
		async (c) => {
			try {
				const id = c.req.param('id');
				const body = c.req.valid('json');
				const updated = await db.users.update(id, {
					email: body.email,
					name: body.name,
					role: body.role,
					avatarUrl: body.avatarUrl,
					isActive: body.isActive,
					metadata: body.metadata,
				});
				if (!updated) {
					return c.json({ error: 'User not found' }, 404);
				}
				return c.json(updated, 200);
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Internal Server Error';
				return c.json({ error: message }, 500);
			}
		},
	)
	.delete('/:id', async (c) => {
		try {
			const id = c.req.param('id');
			const deleted = await db.users.delete(id);
			if (!deleted) {
				return c.json({ error: 'User not found' }, 404);
			}
			return c.json(deleted, 200);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Internal Server Error';
			return c.json({ error: message }, 500);
		}
	});

/**
 * Handles legacy direct requests for users.
 */
export async function handleUsers(req: Request): Promise<Response> {
	return await usersRouter.fetch(req);
}
