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
 * Input payload contract for creating a new User.
 */
export interface CreateUserInput {
	email: string;
	name: string;
	avatarUrl?: string | null;
	role?: UserRole;
	isActive?: boolean;
	metadata?: Record<string, unknown>;
}

/**
 * Input payload contract for updating an existing User.
 */
export interface UpdateUserInput {
	email?: string;
	name?: string;
	avatarUrl?: string | null;
	role?: UserRole;
	isActive?: boolean;
	metadata?: Record<string, unknown>;
}

/**
 * Filter options for querying users.
 */
export interface UserFilter {
	role?: string;
	isActive?: boolean;
	search?: string;
	limit?: number;
	offset?: number;
}
