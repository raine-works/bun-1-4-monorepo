import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Standard ANSI escape codes for formatted CLI console output.
 */
export const colors = {
	reset: '\x1b[0m',
	bold: '\x1b[1m',
	dim: '\x1b[2m',
	italic: '\x1b[3m',
	underline: '\x1b[4m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	red: '\x1b[31m',
	white: '\x1b[37m',
	gray: '\x1b[90m',
} as const;

/**
 * Removes temporary `.bun-build` compilation artifacts from a target directory.
 *
 * @param dir - Directory path to inspect and clean.
 */
export function cleanBunBuildArtifacts(dir: string): void {
	if (!existsSync(dir)) return;
	try {
		for (const file of readdirSync(dir)) {
			if (file.includes('.bun-build')) {
				try {
					rmSync(join(dir, file), { force: true, recursive: true });
				} catch {
					// Ignore deletion errors
				}
			}
		}
	} catch {
		// Ignore directory read errors
	}
}
