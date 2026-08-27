#!/usr/bin/env bun
import { migrator } from '@/migrator';

// ANSI colors
const colors = {
	reset: '\x1b[0m',
	bold: '\x1b[1m',
	dim: '\x1b[2m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	red: '\x1b[31m',
};

async function main() {
	const args = process.argv.slice(2);
	const command = args[0] || 'up';

	try {
		switch (command) {
			case 'up': {
				console.log(`\n${colors.blue}${colors.bold}🚀 Running Migrations (UP)...${colors.reset}`);
				const result = await migrator.up();
				if (result.applied.length === 0) {
					console.log(`${colors.green}✓ Database is up to date. No pending migrations.${colors.reset}\n`);
				} else {
					console.log(`\n${colors.green}✓ Applied ${result.applied.length} migration(s):${colors.reset}`);
					for (const name of result.applied) {
						console.log(`  ${colors.green}➜${colors.reset} ${name}`);
					}
					console.log();
				}
				break;
			}

			case 'down': {
				console.log(`\n${colors.yellow}${colors.bold}⏪ Rolling Back Last Migration (DOWN)...${colors.reset}`);
				const result = await migrator.down();
				if (result.rolledBack.length === 0) {
					console.log(`${colors.yellow}✓ No migrations to roll back.${colors.reset}\n`);
				} else {
					console.log(`\n${colors.yellow}✓ Rolled back:${colors.reset} ${result.rolledBack.join(', ')}\n`);
				}
				break;
			}

			case 'status': {
				console.log(`\n${colors.blue}${colors.bold}📊 Migration Status:${colors.reset}\n`);
				const list = await migrator.status();
				if (list.length === 0) {
					console.log(`  ${colors.dim}No migration files found.${colors.reset}\n`);
					break;
				}

				console.log(`  ${colors.dim}${'STATUS'.padEnd(10)} ${'NAME'.padEnd(35)} APPLIED AT${colors.reset}`);
				console.log(`  ${colors.dim}${'-'.repeat(70)}${colors.reset}`);

				for (const item of list) {
					const statusBadge =
						item.status === 'applied'
							? `${colors.green}APPLIED${colors.reset}  `
							: `${colors.yellow}PENDING${colors.reset}  `;
					const appliedAt = item.appliedAt ? new Date(item.appliedAt).toISOString() : '-';
					console.log(`  ${statusBadge} ${item.name.padEnd(35)} ${appliedAt}`);
				}
				console.log();
				break;
			}

			case 'create': {
				const name = args[1];
				if (!name) {
					console.error(`\n${colors.red}Error: Migration name required.${colors.reset}`);
					console.error(`Usage: bun scripts/migrate.ts create <name>\n`);
					process.exit(1);
				}
				const file = migrator.create(name);
				console.log(`\n${colors.green}✓ Created migration file:${colors.reset} ${file}\n`);
				break;
			}

			case 'reset': {
				console.log(`\n${colors.magenta}${colors.bold}🔄 Resetting all database migrations...${colors.reset}`);
				const result = await migrator.reset();
				console.log(
					`\n${colors.green}✓ Database reset complete. Reapplied ${result.applied.length} migration(s).${colors.reset}\n`,
				);
				break;
			}

			default: {
				console.log(`\nUsage: bun scripts/migrate.ts [up|down|status|create <name>|reset]\n`);
				break;
			}
		}
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`\n${colors.red}${colors.bold}❌ Migration failed:${colors.reset} ${message}`);
		process.exit(1);
	} finally {
		await migrator.sql.close();
	}
}

if (import.meta.main) {
	await main();
}
