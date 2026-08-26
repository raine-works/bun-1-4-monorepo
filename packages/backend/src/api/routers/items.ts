import { jsonResponse } from "@/lib/cors";
import type { Item } from "@/types";

/**
 * In-memory task items data store for the sample REST API.
 */
export const items: Item[] = [
  {
    id: "1",
    title: "Explore Bun 1.4 features",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Build React app with native React Compiler",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Bundle full-stack into standalone binary executable",
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

/**
 * RESTful CRUD request handler for task items (`/api/items` and `/api/items/:id`).
 *
 * Supported Endpoints:
 * - `GET /api/items`: List all items.
 * - `POST /api/items`: Create a new item (requires JSON `{ "title": "..." }`).
 * - `PATCH /api/items/:id`: Update item title and/or completed status.
 * - `DELETE /api/items/:id`: Delete an item by ID.
 *
 * @param req - The incoming HTTP `Request`.
 * @returns An HTTP `Response` with JSON body and appropriate HTTP status code.
 */
export async function handleItems(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Collection endpoint: /api/items
  if (url.pathname === "/api/items") {
    if (req.method === "GET") {
      return jsonResponse({ items });
    }

    if (req.method === "POST") {
      try {
        const body = (await req.json()) as { title?: string };
        if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
          return jsonResponse({ error: "Title is required" }, { status: 400 });
        }

        const newItem: Item = {
          id: crypto.randomUUID(),
          title: body.title.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
        };

        items.push(newItem);
        return jsonResponse(newItem, { status: 201 });
      } catch {
        return jsonResponse({ error: "Invalid JSON body" }, { status: 400 });
      }
    }
  }

  // Individual item endpoint: /api/items/:id
  const itemMatch = url.pathname.match(/^\/api\/items\/([^/]+)$/);
  if (itemMatch) {
    const id = itemMatch[1];
    const index = items.findIndex((i) => i.id === id);

    if (index === -1) {
      return jsonResponse({ error: "Item not found" }, { status: 404 });
    }

    if (req.method === "PATCH" || req.method === "PUT") {
      const body = (await req.json()) as Partial<Item>;
      if (body.completed !== undefined) {
        items[index].completed = Boolean(body.completed);
      }
      if (body.title) {
        items[index].title = body.title.trim();
      }
      return jsonResponse(items[index]);
    }

    if (req.method === "DELETE") {
      const removed = items.splice(index, 1)[0];
      return jsonResponse(removed);
    }
  }

  return jsonResponse({ error: "Method not allowed" }, { status: 405 });
}
