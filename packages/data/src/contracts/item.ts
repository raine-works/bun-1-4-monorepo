import { z } from 'zod';

/**
 * Type-safe contract for an Item record in PostgreSQL.
 */
export interface Item {
	/** Unique UUID v4 identifier. */
	id: string;
	/** Optional foreign key to User owner. */
	userId: string | null;
	/** Item title / description. */
	title: string;
	/** Completion status. */
	completed: boolean;
	/** Timestamp when item was created. */
	createdAt: Date | string;
	/** Timestamp when item was last updated. */
	updatedAt: Date | string;
}

/**
 * Zod schema for validating item creation payloads.
 */
export const createItemSchema = z.object({
	title: z.string({ message: 'Title is required' }).trim().min(1, 'Title is required'),
	userId: z.string().uuid().nullable().optional(),
	completed: z.boolean().optional(),
});

/**
 * Input payload contract for creating a new Item.
 */
export type CreateItemInput = z.infer<typeof createItemSchema>;

/**
 * Zod schema for validating item update payloads.
 */
export const updateItemSchema = z.object({
	title: z.string().trim().min(1).optional(),
	userId: z.string().uuid().nullable().optional(),
	completed: z.boolean().optional(),
});

/**
 * Input payload contract for updating an existing Item.
 */
export type UpdateItemInput = z.infer<typeof updateItemSchema>;

/**
 * Zod schema for querying / filtering items.
 */
export const itemFilterSchema = z.object({
	userId: z.string().uuid().optional(),
	completed: z.boolean().optional(),
	search: z.string().optional(),
	limit: z.coerce.number().int().positive().optional(),
	offset: z.coerce.number().int().nonnegative().optional(),
});

/**
 * Filter options for querying items.
 */
export type ItemFilter = z.infer<typeof itemFilterSchema>;
