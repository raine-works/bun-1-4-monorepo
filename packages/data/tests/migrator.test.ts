import { describe, expect, it } from "bun:test";
import { Migrator, parseMigrationSql } from "@/migrator";

describe("Migration Engine", () => {
  it("should correctly parse -- up and -- down blocks from SQL migration text", () => {
    const rawSql = `
      -- up
      CREATE TABLE users (id UUID PRIMARY KEY, name TEXT);
      CREATE INDEX idx_users_name ON users(name);

      -- down
      DROP INDEX idx_users_name;
      DROP TABLE users;
    `;

    const { up, down } = parseMigrationSql(rawSql);
    expect(up).toContain("CREATE TABLE users");
    expect(up).toContain("CREATE INDEX idx_users_name");
    expect(up).not.toContain("DROP TABLE");

    expect(down).toContain("DROP INDEX idx_users_name");
    expect(down).toContain("DROP TABLE users");
    expect(down).not.toContain("CREATE TABLE");
  });

  it("should handle SQL without -- down as full up script", () => {
    const rawSql = `CREATE TABLE items (id UUID PRIMARY KEY);`;
    const { up, down } = parseMigrationSql(rawSql);
    expect(up).toBe("CREATE TABLE items (id UUID PRIMARY KEY);");
    expect(down).toBe("");
  });

  it("should list available migration files sorted sequentially", () => {
    const migrator = new Migrator();
    const files = migrator.getAvailableFiles();
    expect(files.length).toBeGreaterThanOrEqual(2);
    expect(files[0]).toBe("0001_create_users.sql");
    expect(files[1]).toBe("0002_create_items.sql");
  });
});
