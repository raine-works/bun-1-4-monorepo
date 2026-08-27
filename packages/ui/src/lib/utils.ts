/**
 * Shared utility helpers for the UI component library.
 *
 * Provides the `cn` class-name merging function used by every shadcn-style
 * component to combine Tailwind classes without conflicts.
 *
 * @module lib/utils
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ---------------------------------------------------------------------------
// Class-name helper
// ---------------------------------------------------------------------------

/**
 * Merge class names with Tailwind-aware conflict resolution.
 *
 * Combines `clsx` (conditional class joining) with `tailwind-merge`
 * (deduplication of conflicting Tailwind utilities).
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
