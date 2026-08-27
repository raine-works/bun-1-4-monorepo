import { createItemSchema, db, updateItemSchema } from '@app/data';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

/**
 * RESTful CRUD router for task items (`/api/items` and `/api/items/:id`).
 * Directly executes database queries against the PostgreSQL `@app/data` layer.
 *
 * Supported Endpoints:
 * - `GET /api/items`: List all items.
 * - `POST /api/items`: Create a new item (requires JSON `{ "title": "..." }`).
 * - `GET /api/items/:id`: Get item by ID.
 * - `PATCH /api/items/:id`: Update item title and/or completed status.
 * - `PUT /api/items/:id`: Update item title and/or completed status.
 * - `DELETE /api/items/:id`: Delete an item by ID.
 */
export const itemsRouter = new Hono()
	.get('/', async (c) => {
		try {
			const items = await db.items.list();
			return c.json({ items }, 200);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Internal Server Error';
			return c.json({ error: message }, 500);
		}
	})
	.post(
		'/',
		zValidator('json', createItemSchema, (result, c) => {
			if (!result.success) {
				const message = result.error.issues[0]?.message || 'Title is required';
				return c.json({ error: message }, 400);
			}
		}),
		async (c) => {
			try {
				const body = c.req.valid('json');
				const newItem = await db.items.create({
					title: body.title.trim(),
					completed: body.completed ?? false,
					userId: body.userId ?? null,
				});
				return c.json(newItem, 201);
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : 'Internal Server Error';
				return c.json({ error: message }, 500);
			}
		},
	)
	.get('/:id', async (c) => {
		try {
			const id = c.req.param('id');
			const item = await db.items.findById(id);
			if (!item) {
				return c.json({ error: 'Item not found' }, 404);
			}
			return c.json(item, 200);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Internal Server Error';
			return c.json({ error: message }, 500);
		}
	})
	.patch(
		'/:id',
		zValidator('json', updateItemSchema, (result, c) => {
			if (!result.success) {
				const message = result.error.issues[0]?.message || 'Invalid update payload';
				return c.json({ error: message }, 400);
			}
		}),
		async (c) => {
			try {
				const id = c.req.param('id');
				const body = c.req.valid('json');
				const updated = await db.items.update(id, {
					title: body.title,
					completed: body.completed,
					userId: body.userId,
				});
				if (!updated) {
					return c.json({ error: 'Item not found' }, 404);
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
		zValidator('json', updateItemSchema, (result, c) => {
			if (!result.success) {
				const message = result.error.issues[0]?.message || 'Invalid update payload';
				return c.json({ error: message }, 400);
			}
		}),
		async (c) => {
			try {
				const id = c.req.param('id');
				const body = c.req.valid('json');
				const updated = await db.items.update(id, {
					title: body.title,
					completed: body.completed,
					userId: body.userId,
				});
				if (!updated) {
					return c.json({ error: 'Item not found' }, 404);
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
			const deleted = await db.items.delete(id);
			if (!deleted) {
				return c.json({ error: 'Item not found' }, 404);
			}
			return c.json(deleted, 200);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Internal Server Error';
			return c.json({ error: message }, 500);
		}
	});
