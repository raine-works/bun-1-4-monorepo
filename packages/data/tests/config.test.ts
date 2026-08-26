import { describe, expect, it } from "bun:test";
import { getDatabaseUrl } from "@/config";

describe("Database Config Resolution", () => {
  it("should return explicit url if provided as string", () => {
    const url = getDatabaseUrl("postgres://test_user:test_pass@db.example.com:5432/my_db");
    expect(url).toBe("postgres://test_user:test_pass@db.example.com:5432/my_db");
  });

  it("should return explicit url from config object", () => {
    const url = getDatabaseUrl({
      url: "postgres://custom:pass@customhost:5432/app",
    });
    expect(url).toBe("postgres://custom:pass@customhost:5432/app");
  });

  it("should build connection URL from discrete parameters", () => {
    const url = getDatabaseUrl({
      hostname: "127.0.0.1",
      port: 5433,
      database: "testdb",
      username: "user_a",
      password: "pass_a",
    });
    expect(url).toBe("postgres://user_a:pass_a@127.0.0.1:5433/testdb");
  });

  it("should fall back to defaults when no config is provided", () => {
    const url = getDatabaseUrl();
    expect(url).toContain("postgres://");
    expect(url).toContain(":5432/");
  });
});
