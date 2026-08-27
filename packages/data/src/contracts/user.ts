import { z } from 'zod';

/**
 * User account role.
 */
export type UserRole = 'admin' | 'user' | 'member' | string;

/**
 * Type-safe contract for a User record in PostgreSQL.
 */
export interface User {
	/** Unique UUID v4 identifier. */
	id: string;
	/** Primary unique email address. */
	email: string;
	/** Display name. */
	name: string;
	/** Optional profile avatar URL. */
	avatarUrl: string | null;
	/** Access role. */
	role: UserRole;
	/** Active status flag. */
	isActive: boolean;
	/** Flexible JSONB metadata store. */
	metadata: Record<string, unknown>;
	/** Timestamp when user was created. */
	createdAt: Date | string;
	/** Timestamp when user was last updated. */
	updatedAt: Date | string;
}

/**
 * Zod schema for validating user creation payloads.
 */
export const createUserSchema = z.object({
	email: z.string({ message: 'Valid email is required' }).email('Valid email is required'),
	name: z.string({ message: 'Name is required' }).trim().min(1, 'Name is required'),
	avatarUrl: z.string().nullable().optional(),
	role: z.string().optional(),
	isActive: z.boolean().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Input payload contract for creating a new User.
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Zod schema for validating user update payloads.
 */
export const updateUserSchema = z.object({
	email: z.string().email('Valid email is required').optional(),
	name: z.string().trim().min(1).optional(),
	avatarUrl: z.string().nullable().optional(),
	role: z.string().optional(),
	isActive: z.boolean().optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Input payload contract for updating an existing User.
 */
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * Zod schema for querying / filtering users.
 */
export const userFilterSchema = z.object({
	role: z.string().optional(),
	isActive: z.boolean().optional(),
	search: z.string().optional(),
	limit: z.coerce.number().int().positive().optional(),
	offset: z.coerce.number().int().nonnegative().optional(),
});

/**
 * Filter options for querying users.
 */
export type UserFilter = z.infer<typeof userFilterSchema>;
