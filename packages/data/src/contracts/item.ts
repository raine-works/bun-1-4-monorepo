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
 * Input payload contract for creating a new Item.
 */
export interface CreateItemInput {
	title: string;
	userId?: string | null;
	completed?: boolean;
}

/**
 * Input payload contract for updating an existing Item.
 */
export interface UpdateItemInput {
	title?: string;
	userId?: string | null;
	completed?: boolean;
}

/**
 * Filter options for querying items.
 */
export interface ItemFilter {
	userId?: string;
	completed?: boolean;
	search?: string;
	limit?: number;
	offset?: number;
}
