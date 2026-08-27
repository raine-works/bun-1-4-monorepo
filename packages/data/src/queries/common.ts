/**
 * Parses and extracts a numeric count from SQL `COUNT(*)::text AS count` query rows.
 */
export function parseCount(rows: Array<{ count: string | number } | undefined>): number {
	return Number(rows[0]?.count ?? 0);
}
