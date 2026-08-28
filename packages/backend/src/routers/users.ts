import { createUserSchema, db, updateUserSchema, userFilterSchema } from '@app/data';
import '@app/tools/prototypes';
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
			const query = c.req.valid('query');
			const role = query.role || undefined;
			const search = query.search || undefined;
			const { data: users, error } = await db.users.list({ role, search }).tryCatch();
			if (error) {
				const message = error instanceof Error ? error.message : 'Internal Server Error';
				return c.json({ error: message }, 500);
			}
			return c.json({ users }, 200);
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
			const body = c.req.valid('json');
			const { data: existing, error: findError } = await db.users.findByEmail(body.email).tryCatch();
			if (findError) {
				const message = findError instanceof Error ? findError.message : 'Internal Server Error';
				return c.json({ error: message }, 500);
			}
			if (existing) {
				return c.json({ error: 'User with this email already exists' }, 409);
			}

			const { data: newUser, error: createError } = await db.users
				.create({
					email: body.email,
					name: body.name,
					role: body.role ?? 'user',
					avatarUrl: body.avatarUrl ?? null,
					isActive: body.isActive ?? true,
					metadata: body.metadata ?? {},
				})
				.tryCatch();
			if (createError || !newUser) {
				const message = createError instanceof Error ? createError.message : 'Internal Server Error';
				return c.json({ error: message }, 500);
			}
			return c.json(newUser, 201);
		},
	)
	.get('/:id', async (c) => {
		const id = c.req.param('id');
		const { data: user, error } = await db.users.findById(id).tryCatch();
		if (error) {
			const message = error instanceof Error ? error.message : 'Internal Server Error';
			return c.json({ error: message }, 500);
		}
		if (!user) {
			return c.json({ error: 'User not found' }, 404);
		}
		return c.json(user, 200);
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
			const id = c.req.param('id');
			const body = c.req.valid('json');
			const { data: updated, error } = await db.users
				.update(id, {
					email: body.email,
					name: body.name,
					role: body.role,
					avatarUrl: body.avatarUrl,
					isActive: body.isActive,
					metadata: body.metadata,
				})
				.tryCatch();
			if (error) {
				const message = error instanceof Error ? error.message : 'Internal Server Error';
				return c.json({ error: message }, 500);
			}
			if (!updated) {
				return c.json({ error: 'User not found' }, 404);
			}
			return c.json(updated, 200);
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
			const id = c.req.param('id');
			const body = c.req.valid('json');
			const { data: updated, error } = await db.users
				.update(id, {
					email: body.email,
					name: body.name,
					role: body.role,
					avatarUrl: body.avatarUrl,
					isActive: body.isActive,
					metadata: body.metadata,
				})
				.tryCatch();
			if (error) {
				const message = error instanceof Error ? error.message : 'Internal Server Error';
				return c.json({ error: message }, 500);
			}
			if (!updated) {
				return c.json({ error: 'User not found' }, 404);
			}
			return c.json(updated, 200);
		},
	)
	.delete('/:id', async (c) => {
		const id = c.req.param('id');
		const { data: deleted, error } = await db.users.delete(id).tryCatch();
		if (error) {
			const message = error instanceof Error ? error.message : 'Internal Server Error';
			return c.json({ error: message }, 500);
		}
		if (!deleted) {
			return c.json({ error: 'User not found' }, 404);
		}
		return c.json(deleted, 200);
	});
