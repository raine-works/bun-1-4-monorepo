import { describe, expect, it } from "bun:test";
import type { BunSql } from "@/client";
import type { Item, User } from "@/contracts";
import { createItemsQueries, createUsersQueries } from "@/queries";

describe("Type-safe SQL Queries", () => {
  it("should format user queries and parse response records", async () => {
    const mockUser: User = {
      id: "u-123",
      email: "jane@example.com",
      name: "Jane Doe",
      avatarUrl: "https://example.com/avatar.png",
      role: "admin",
      isActive: true,
      metadata: { theme: "dark" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let executedQuery = "";
    const mockSql = (async (strings: TemplateStringsArray, ..._values: unknown[]) => {
      executedQuery = strings.join("?");
      return [mockUser];
    }) as unknown as BunSql;

    const queries = createUsersQueries(mockSql);

    const user = await queries.findById("u-123");
    expect(user).not.toBeNull();
    expect(user?.email).toBe("jane@example.com");
    expect(executedQuery).toContain("FROM users");
    expect(executedQuery).toContain("WHERE id =");

    const created = await queries.create({
      email: "jane@example.com",
      name: "Jane Doe",
      role: "admin",
    });
    expect(created.name).toBe("Jane Doe");
    expect(executedQuery).toContain("INSERT INTO users");

    const updated = await queries.update("u-123", { name: "Jane Smith" });
    expect(updated).not.toBeNull();
    expect(executedQuery).toContain("UPDATE users");

    const deleted = await queries.delete("u-123");
    expect(deleted).not.toBeNull();
    expect(executedQuery).toContain("DELETE FROM users");
  });

  it("should format item queries and parse response records", async () => {
    const mockItem: Item = {
      id: "i-456",
      userId: "u-123",
      title: "Complete data layer",
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let executedQuery = "";
    const mockSql = (async (strings: TemplateStringsArray, ..._values: unknown[]) => {
      executedQuery = strings.join("?");
      return [mockItem];
    }) as unknown as BunSql;

    const queries = createItemsQueries(mockSql);

    const item = await queries.findById("i-456");
    expect(item).not.toBeNull();
    expect(item?.title).toBe("Complete data layer");
    expect(executedQuery).toContain("FROM items");

    const created = await queries.create({
      title: "Complete data layer",
      userId: "u-123",
    });
    expect(created.id).toBe("i-456");
    expect(executedQuery).toContain("INSERT INTO items");

    const toggled = await queries.toggle("i-456");
    expect(toggled).not.toBeNull();
    expect(executedQuery).toContain("completed = NOT completed");
  });
});
