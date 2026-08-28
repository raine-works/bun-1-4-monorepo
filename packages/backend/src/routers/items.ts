import { createItemSchema, db, updateItemSchema } from '@app/data';
import '@app/tools/prototypes';
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
		const { data: items, error } = await db.items.list().tryCatch();
		if (error) {
			const message = error instanceof Error ? error.message : 'Internal Server Error';
			return c.json({ error: message }, 500);
		}
		return c.json({ items }, 200);
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
			const body = c.req.valid('json');
			const { data: newItem, error } = await db.items
				.create({
					title: body.title.trim(),
					completed: body.completed ?? false,
					userId: body.userId ?? null,
				})
				.tryCatch();
			if (error || !newItem) {
				const message = error instanceof Error ? error.message : 'Internal Server Error';
				return c.json({ error: message }, 500);
			}
			return c.json(newItem, 201);
		},
	)
	.get('/:id', async (c) => {
		const id = c.req.param('id');
		const { data: item, error } = await db.items.findById(id).tryCatch();
		if (error) {
			const message = error instanceof Error ? error.message : 'Internal Server Error';
			return c.json({ error: message }, 500);
		}
		if (!item) {
			return c.json({ error: 'Item not found' }, 404);
		}
		return c.json(item, 200);
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
			const id = c.req.param('id');
			const body = c.req.valid('json');
			const { data: updated, error } = await db.items
				.update(id, {
					title: body.title,
					completed: body.completed,
					userId: body.userId,
				})
				.tryCatch();
			if (error) {
				const message = error instanceof Error ? error.message : 'Internal Server Error';
				return c.json({ error: message }, 500);
			}
			if (!updated) {
				return c.json({ error: 'Item not found' }, 404);
			}
			return c.json(updated, 200);
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
			const id = c.req.param('id');
			const body = c.req.valid('json');
			const { data: updated, error } = await db.items
				.update(id, {
					title: body.title,
					completed: body.completed,
					userId: body.userId,
				})
				.tryCatch();
			if (error) {
				const message = error instanceof Error ? error.message : 'Internal Server Error';
				return c.json({ error: message }, 500);
			}
			if (!updated) {
				return c.json({ error: 'Item not found' }, 404);
			}
			return c.json(updated, 200);
		},
	)
	.delete('/:id', async (c) => {
		const id = c.req.param('id');
		const { data: deleted, error } = await db.items.delete(id).tryCatch();
		if (error) {
			const message = error instanceof Error ? error.message : 'Internal Server Error';
			return c.json({ error: message }, 500);
		}
		if (!deleted) {
			return c.json({ error: 'Item not found' }, 404);
		}
		return c.json(deleted, 200);
	});
