/**
 * Parses and extracts a numeric count from SQL `COUNT(*)::text AS count` query rows.
 *
 * @param rows - Query result row array.
 * @returns Parsed non-negative integer count.
 */
export function parseCount(rows: Array<{ count: string | number } | undefined>): number {
	return Number(rows[0]?.count ?? 0);
}

/**
 * Parses raw SQL migration content splitting into `-- up` and optional `-- down` sections.
 *
 * @param content - Raw SQL file contents.
 * @returns Object with parsed `up` and `down` query strings.
 */
export function parseMigrationSql(content: string): {
	up: string;
	down: string;
} {
	const parts = content.split(/^[ \t]*--\s*(?:down|rollback)\b.*$/im);
	let up = parts[0] || '';
	let down = parts[1] || '';

	up = up.replace(/^[ \t]*--\s*up\b.*$/im, '').trim();
	down = down.trim();

	return { up, down };
}
