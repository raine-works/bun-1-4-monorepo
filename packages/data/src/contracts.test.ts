import { describe, expect, it } from "bun:test";
import type { CreateItemInput, CreateUserInput, Item, User } from "@/contracts";

describe("Typed Data Contracts", () => {
  it("should validate User model contract fields", () => {
    const user: User = {
      id: "11111111-1111-1111-1111-111111111111",
      email: "user@domain.com",
      name: "Test User",
      avatarUrl: null,
      role: "user",
      isActive: true,
      metadata: { department: "Engineering" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(user.id).toBeDefined();
    expect(user.email).toBe("user@domain.com");
    expect(user.isActive).toBe(true);
  });

  it("should validate CreateUserInput contract", () => {
    const input: CreateUserInput = {
      email: "new@domain.com",
      name: "New User",
    };
    expect(input.email).toBe("new@domain.com");
    expect(input.name).toBe("New User");
  });

  it("should validate Item model contract fields", () => {
    const item: Item = {
      id: "22222222-2222-2222-2222-222222222222",
      userId: "11111111-1111-1111-1111-111111111111",
      title: "Write documentation",
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(item.id).toBeDefined();
    expect(item.userId).toBe("11111111-1111-1111-1111-111111111111");
    expect(item.completed).toBe(true);
  });

  it("should validate CreateItemInput contract", () => {
    const input: CreateItemInput = {
      title: "New Item",
      completed: false,
    };
    expect(input.title).toBe("New Item");
  });
});
