import type { BunSql } from '@/client';
import type { CreateItemInput, Item, ItemFilter, UpdateItemInput } from '@/contracts/item';
import { parseCount } from '@/queries/common';

/**
 * Creates type-safe database query operations for the `items` table.
 * All queries are written in raw PostgreSQL with Bun SQL tagged templates.
 */
export function createItemsQueries(sql: BunSql) {
	return {
		/**
		 * Finds a single item by primary UUID.
		 */
		async findById(id: string): Promise<Item | null> {
			const rows = (await sql`
        SELECT
          id, user_id AS "userId", title, completed,
          created_at AS "createdAt", updated_at AS "updatedAt"
        FROM items
        WHERE id = ${id}
        LIMIT 1
      `) as unknown as Item[];
			return rows[0] ?? null;
		},

		/**
		 * Lists items matching optional filter criteria, ordered by creation date descending.
		 */
		async list(filter: ItemFilter = {}): Promise<Item[]> {
			const limit = filter.limit ?? 50;
			const offset = filter.offset ?? 0;
			const searchPattern = filter.search ? `%${filter.search.trim()}%` : null;

			const rows = (await sql`
        SELECT
          id, user_id AS "userId", title, completed,
          created_at AS "createdAt", updated_at AS "updatedAt"
        FROM items
        WHERE
          (${filter.userId ?? null}::uuid IS NULL OR user_id = ${filter.userId ?? null}::uuid)
          AND (${filter.completed ?? null}::boolean IS NULL OR completed = ${filter.completed ?? null})
          AND (${searchPattern}::text IS NULL OR title ILIKE ${searchPattern})
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `) as unknown as Item[];

			return rows;
		},

		/**
		 * Retrieves all items belonging to a specific user.
		 */
		async listByUserId(userId: string): Promise<Item[]> {
			const rows = (await sql`
        SELECT
          id, user_id AS "userId", title, completed,
          created_at AS "createdAt", updated_at AS "updatedAt"
        FROM items
        WHERE user_id = ${userId}::uuid
        ORDER BY created_at DESC
      `) as unknown as Item[];

			return rows;
		},

		/**
		 * Inserts a new item record and returns the created row.
		 */
		async create(input: CreateItemInput): Promise<Item> {
			const title = input.title.trim();
			const completed = input.completed ?? false;
			const userId = input.userId ?? null;

			const rows = (await sql`
        INSERT INTO items (
          title, user_id, completed
        ) VALUES (
          ${title},
          ${userId ? `${userId}` : null}::uuid,
          ${completed}
        )
        RETURNING
          id, user_id AS "userId", title, completed,
          created_at AS "createdAt", updated_at AS "updatedAt"
      `) as unknown as Item[];

			const item = rows[0];
			if (!item) {
				throw new Error('Failed to insert item');
			}
			return item;
		},

		/**
		 * Updates an existing item record and returns the updated row.
		 */
		async update(id: string, input: UpdateItemInput): Promise<Item | null> {
			const title = input.title ? input.title.trim() : null;
			const hasUserId = input.userId !== undefined;
			const userId = input.userId ?? null;
			const completed = input.completed ?? null;

			const rows = (await sql`
        UPDATE items
        SET
          title = COALESCE(${title}, title),
          user_id = CASE WHEN ${hasUserId} THEN ${userId}::uuid ELSE user_id END,
          completed = COALESCE(${completed}, completed),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING
          id, user_id AS "userId", title, completed,
          created_at AS "createdAt", updated_at AS "updatedAt"
      `) as unknown as Item[];

			return rows[0] ?? null;
		},

		/**
		 * Toggles an item's completed status.
		 */
		async toggle(id: string): Promise<Item | null> {
			const rows = (await sql`
        UPDATE items
        SET
          completed = NOT completed,
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING
          id, user_id AS "userId", title, completed,
          created_at AS "createdAt", updated_at AS "updatedAt"
      `) as unknown as Item[];

			return rows[0] ?? null;
		},

		/**
		 * Deletes an item by ID and returns the deleted row.
		 */
		async delete(id: string): Promise<Item | null> {
			const rows = (await sql`
        DELETE FROM items
        WHERE id = ${id}
        RETURNING
          id, user_id AS "userId", title, completed,
          created_at AS "createdAt", updated_at AS "updatedAt"
      `) as unknown as Item[];

			return rows[0] ?? null;
		},

		/**
		 * Counts items matching optional filter criteria.
		 */
		async count(filter: { userId?: string; completed?: boolean } = {}): Promise<number> {
			const rows = (await sql`
        SELECT COUNT(*)::text AS count
        FROM items
        WHERE
          (${filter.userId ?? null}::uuid IS NULL OR user_id = ${filter.userId ?? null}::uuid)
          AND (${filter.completed ?? null}::boolean IS NULL OR completed = ${filter.completed ?? null})
      `) as unknown as Array<{ count: string }>;

			return parseCount(rows);
		},
	};
}

export type ItemsQueries = ReturnType<typeof createItemsQueries>;
