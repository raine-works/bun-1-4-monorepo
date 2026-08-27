import { db } from '@app/data';
import { extractPathId, jsonError, jsonResponse, methodNotAllowed, notFound } from '@/lib/cors';
import type { Item } from '@/types';

/**
 * RESTful CRUD request handler for task items (`/api/items` and `/api/items/:id`).
 * Directly executes database queries against the PostgreSQL `@app/data` layer.
 *
 * Supported Endpoints:
 * - `GET /api/items`: List all items.
 * - `POST /api/items`: Create a new item (requires JSON `{ "title": "..." }`).
 * - `GET /api/items/:id`: Get item by ID.
 * - `PATCH /api/items/:id`: Update item title and/or completed status.
 * - `DELETE /api/items/:id`: Delete an item by ID.
 *
 * @param req - The incoming HTTP `Request`.
 * @returns An HTTP `Response` with JSON body and appropriate HTTP status code.
 */
export async function handleItems(req: Request): Promise<Response> {
	const url = new URL(req.url);

	try {
		// Collection endpoint: /api/items
		if (url.pathname === '/api/items') {
			if (req.method === 'GET') {
				const items = await db.items.list();
				return jsonResponse({ items });
			}

			if (req.method === 'POST') {
				const body = (await req.json()) as { title?: string };
				if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
					return jsonError('Title is required', 400);
				}

				const newItem = await db.items.create({
					title: body.title.trim(),
					completed: false,
				});
				return jsonResponse(newItem, { status: 201 });
			}
		}

		// Individual item endpoint: /api/items/:id
		const id = extractPathId(url.pathname, '/api/items');
		if (id) {
			if (req.method === 'GET') {
				const item = await db.items.findById(id);
				return item ? jsonResponse(item) : notFound('Item');
			}

			if (req.method === 'PATCH' || req.method === 'PUT') {
				const body = (await req.json()) as Partial<Item>;
				const updated = await db.items.update(id, {
					title: body.title,
					completed: body.completed,
				});
				return updated ? jsonResponse(updated) : notFound('Item');
			}

			if (req.method === 'DELETE') {
				const deleted = await db.items.delete(id);
				return deleted ? jsonResponse(deleted) : notFound('Item');
			}
		}

		return methodNotAllowed();
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Internal Server Error';
		return jsonError(message, 500);
	}
}
