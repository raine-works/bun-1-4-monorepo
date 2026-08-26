import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { type BunSql, Database, db } from "./client";

/**
 * Migration status item.
 */
export interface MigrationStatus {
  name: string;
  status: "applied" | "pending";
  appliedAt?: Date | string;
}

/**
 * Result of migration operation.
 */
export interface MigrationResult {
  applied: string[];
  rolledBack: string[];
}

/**
 * Parses SQL file splitting into `-- up` and optional `-- down` sections.
 */
export function parseMigrationSql(content: string): {
  up: string;
  down: string;
} {
  const parts = content.split(/^[ \t]*--\s*(?:down|rollback)\b.*$/im);
  let up = parts[0] || "";
  let down = parts[1] || "";

  up = up.replace(/^[ \t]*--\s*up\b.*$/im, "").trim();
  down = down.trim();

  return { up, down };
}

/**
 * Simple, lightweight migration runner for PostgreSQL using Bun SQL.
 */
export class Migrator {
  private readonly database: Database;
  readonly migrationsDir: string;
  readonly tableName: string;

  constructor(
    databaseOrSql: Database | BunSql = db,
    options: { migrationsDir?: string; tableName?: string } = {}
  ) {
    this.database = databaseOrSql instanceof Database ? databaseOrSql : new Database(databaseOrSql);
    this.migrationsDir = resolve(options.migrationsDir ?? join(import.meta.dir, "../migrations"));
    this.tableName = options.tableName ?? "_migrations";
  }

  get sql(): BunSql {
    return this.database.sql;
  }

  /**
   * Ensures the migrations table exists.
   */
  async init(): Promise<void> {
    await this.sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
  }

  /**
   * Returns list of applied migration names from database.
   */
  async getApplied(): Promise<Array<{ name: string; applied_at: string }>> {
    await this.init();
    const rows = (await this.sql`
      SELECT name, applied_at
      FROM _migrations
      ORDER BY id ASC
    `) as unknown as Array<{ name: string; applied_at: string }>;
    return rows;
  }

  /**
   * Returns list of migration files on disk.
   */
  getAvailableFiles(): string[] {
    if (!existsSync(this.migrationsDir)) {
      return [];
    }
    return readdirSync(this.migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  /**
   * Returns status of all migration files.
   */
  async status(): Promise<MigrationStatus[]> {
    const applied = await this.getApplied();
    const appliedMap = new Map(applied.map((m) => [m.name, m.applied_at]));
    const files = this.getAvailableFiles();

    return files.map((file) => {
      const appliedAt = appliedMap.get(file);
      if (appliedAt) {
        return { name: file, status: "applied", appliedAt };
      }
      return { name: file, status: "pending" };
    });
  }

  /**
   * Runs all pending migrations in sequential order.
   */
  async up(): Promise<MigrationResult> {
    await this.init();
    const applied = await this.getApplied();
    const appliedSet = new Set(applied.map((m) => m.name));
    const files = this.getAvailableFiles();
    const pending = files.filter((f) => !appliedSet.has(f));

    const appliedNames: string[] = [];

    for (const fileName of pending) {
      const filePath = join(this.migrationsDir, fileName);
      const content = readFileSync(filePath, "utf8");
      const { up: upSql } = parseMigrationSql(content);

      if (upSql) {
        await this.sql.begin(async (tx: BunSql) => {
          await tx.unsafe(upSql);
          await tx`INSERT INTO _migrations (name) VALUES (${fileName})`;
        });
      } else {
        await this.sql`INSERT INTO _migrations (name) VALUES (${fileName})`;
      }

      appliedNames.push(fileName);
    }

    return {
      applied: appliedNames,
      rolledBack: [],
    };
  }

  /**
   * Rolls back the last applied migration.
   */
  async down(): Promise<MigrationResult> {
    await this.init();
    const applied = await this.getApplied();
    if (applied.length === 0) {
      return { applied: [], rolledBack: [] };
    }

    const lastMigration = applied[applied.length - 1];
    if (!lastMigration) {
      return { applied: [], rolledBack: [] };
    }

    const filePath = join(this.migrationsDir, lastMigration.name);

    if (!existsSync(filePath)) {
      throw new Error(`Migration file "${lastMigration.name}" not found on disk.`);
    }

    const content = readFileSync(filePath, "utf8");
    const { down: downSql } = parseMigrationSql(content);

    if (downSql) {
      await this.sql.begin(async (tx: BunSql) => {
        await tx.unsafe(downSql);
        await tx`DELETE FROM _migrations WHERE name = ${lastMigration.name}`;
      });
    } else {
      await this.sql`DELETE FROM _migrations WHERE name = ${lastMigration.name}`;
    }

    return {
      applied: [],
      rolledBack: [lastMigration.name],
    };
  }

  /**
   * Creates a new migration file with sequential prefix.
   */
  create(name: string): string {
    if (!existsSync(this.migrationsDir)) {
      mkdirSync(this.migrationsDir, { recursive: true });
    }

    const files = this.getAvailableFiles();
    const nextNum = String(files.length + 1).padStart(4, "0");
    const cleanName = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const fileName = `${nextNum}_${cleanName}.sql`;
    const filePath = join(this.migrationsDir, fileName);

    const template = `-- Migration: ${cleanName}
-- Created: ${new Date().toISOString()}

-- up


-- down

`;

    writeFileSync(filePath, template, "utf8");
    return filePath;
  }

  /**
   * Resets database by running down on all migrations and running up again.
   */
  async reset(): Promise<MigrationResult> {
    const applied = await this.getApplied();
    const rolledBack: string[] = [];

    for (let i = 0; i < applied.length; i++) {
      const res = await this.down();
      rolledBack.push(...res.rolledBack);
    }

    const upRes = await this.up();
    return {
      applied: upRes.applied,
      rolledBack,
    };
  }
}

/**
 * Singleton migrator instance.
 */
export const migrator = new Migrator();
