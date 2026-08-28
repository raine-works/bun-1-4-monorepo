import type { BunSql } from '@app/data/client';
import type { CreateUserInput, UpdateUserInput, User, UserFilter } from '@app/data/contracts/user';
import { parseCount } from '@app/data/queries/common';
import '@app/tools/prototypes';

/**
 * Creates type-safe database query operations for the `users` table.
 * All queries are written in raw PostgreSQL with Bun SQL tagged templates.
 */
export function createUsersQueries(sql: BunSql) {
	return {
		/**
		 * Finds a single user by primary UUID.
		 */
		async findById(id: string): Promise<User | null> {
			const rows = (await sql`
        SELECT
          id, email, name, avatar_url AS "avatarUrl", role,
          is_active AS "isActive", metadata,
          created_at AS "createdAt", updated_at AS "updatedAt"
        FROM users
        WHERE id = ${id}
        LIMIT 1
      `) as unknown as User[];
			return rows[0] ?? null;
		},

		/**
		 * Finds a single user by email address (case-insensitive).
		 */
		async findByEmail(email: string): Promise<User | null> {
			const normalizedEmail = email.toLowerCase().trim();
			const rows = (await sql`
        SELECT
          id, email, name, avatar_url AS "avatarUrl", role,
          is_active AS "isActive", metadata,
          created_at AS "createdAt", updated_at AS "updatedAt"
        FROM users
        WHERE LOWER(email) = ${normalizedEmail}
        LIMIT 1
      `) as unknown as User[];
			return rows[0] ?? null;
		},

		/**
		 * Lists users matching optional filter criteria, ordered by creation date descending.
		 */
		async list(filter: UserFilter = {}): Promise<User[]> {
			const limit = filter.limit ?? 50;
			const offset = filter.offset ?? 0;
			const searchPattern = filter.search ? `%${filter.search.trim()}%` : null;

			const rows = (await sql`
        SELECT
          id, email, name, avatar_url AS "avatarUrl", role,
          is_active AS "isActive", metadata,
          created_at AS "createdAt", updated_at AS "updatedAt"
        FROM users
        WHERE
          (${filter.role ?? null}::varchar IS NULL OR role = ${filter.role ?? null})
          AND (${filter.isActive ?? null}::boolean IS NULL OR is_active = ${filter.isActive ?? null})
          AND (
            ${searchPattern}::text IS NULL
            OR name ILIKE ${searchPattern}
            OR email ILIKE ${searchPattern}
          )
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `) as unknown as User[];

			return rows;
		},

		/**
		 * Inserts a new user record and returns the created row.
		 */
		async create(input: CreateUserInput): Promise<User> {
			const normalizedEmail = input.email.toLowerCase().trim();
			const name = input.name.trim();
			const role = input.role ?? 'user';
			const isActive = input.isActive ?? true;
			const metadata = JSON.stringify(input.metadata ?? {});

			const rows = (await sql`
        INSERT INTO users (
          email, name, avatar_url, role, is_active, metadata
        ) VALUES (
          ${normalizedEmail},
          ${name},
          ${input.avatarUrl ?? null},
          ${role},
          ${isActive},
          ${metadata}::jsonb
        )
        RETURNING
          id, email, name, avatar_url AS "avatarUrl", role,
          is_active AS "isActive", metadata,
          created_at AS "createdAt", updated_at AS "updatedAt"
      `) as unknown as User[];

			const user = rows[0];
			if (!user) {
				throw new Error('Failed to insert user');
			}
			return user;
		},

		/**
		 * Updates an existing user record and returns the updated row.
		 */
		async update(id: string, input: UpdateUserInput): Promise<User | null> {
			const email = input.email ? input.email.toLowerCase().trim() : null;
			const name = input.name ? input.name.trim() : null;
			const hasAvatar = input.avatarUrl !== undefined;
			const avatarUrl = input.avatarUrl ?? null;
			const role = input.role ?? null;
			const isActive = input.isActive ?? null;
			const hasMetadata = input.metadata !== undefined;
			const metadata = hasMetadata ? JSON.stringify(input.metadata ?? {}) : null;

			const rows = (await sql`
        UPDATE users
        SET
          email = COALESCE(${email}, email),
          name = COALESCE(${name}, name),
          avatar_url = CASE WHEN ${hasAvatar} THEN ${avatarUrl} ELSE avatar_url END,
          role = COALESCE(${role}, role),
          is_active = COALESCE(${isActive}, is_active),
          metadata = CASE WHEN ${hasMetadata} THEN ${metadata}::jsonb ELSE metadata END,
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING
          id, email, name, avatar_url AS "avatarUrl", role,
          is_active AS "isActive", metadata,
          created_at AS "createdAt", updated_at AS "updatedAt"
      `) as unknown as User[];

			return rows[0] ?? null;
		},

		/**
		 * Deletes a user by ID and returns the deleted row.
		 */
		async delete(id: string): Promise<User | null> {
			const rows = (await sql`
        DELETE FROM users
        WHERE id = ${id}
        RETURNING
          id, email, name, avatar_url AS "avatarUrl", role,
          is_active AS "isActive", metadata,
          created_at AS "createdAt", updated_at AS "updatedAt"
      `) as unknown as User[];

			return rows[0] ?? null;
		},

		/**
		 * Counts the total number of users matching optional criteria.
		 */
		async count(filter: { role?: string; isActive?: boolean } = {}): Promise<number> {
			const rows = (await sql`
        SELECT COUNT(*)::text AS count
        FROM users
        WHERE
          (${filter.role ?? null}::varchar IS NULL OR role = ${filter.role ?? null})
          AND (${filter.isActive ?? null}::boolean IS NULL OR is_active = ${filter.isActive ?? null})
      `) as unknown as Array<{ count: string }>;

			return parseCount(rows);
		},

		/**
		 * Checks whether a user exists with given email or ID.
		 */
		async exists(emailOrId: string): Promise<boolean> {
			const target = emailOrId.toLowerCase().trim();
			const rows = (await sql`
        SELECT 1 AS exists
        FROM users
        WHERE id::text = ${target} OR LOWER(email) = ${target}
        LIMIT 1
      `) as unknown as Array<{ exists: number }>;

			return !rows.isEmpty();
		},
	};
}

export type UsersQueries = ReturnType<typeof createUsersQueries>;
