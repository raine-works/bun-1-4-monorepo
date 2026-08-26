import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { createServer } from "./index";

describe("Backend Server & Micro-Frontend Host", () => {
  let server: ReturnType<typeof createServer>;
  let baseUrl: string;

  beforeAll(() => {
    // Port 0 picks a free ephemeral port for tests
    server = createServer(0);
    baseUrl = `http://localhost:${server.port}`;
  });

  afterAll(() => {
    server.stop();
  });

  it("should return healthy status on GET /api/health", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { status: string; uptime: number };
    expect(data.status).toBe("healthy");
    expect(typeof data.uptime).toBe("number");
  });

  it("should return runtime info on GET /api/info", async () => {
    const res = await fetch(`${baseUrl}/api/info`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { bunVersion: string; name: string };
    expect(data.name).toBe("@app/backend");
    expect(data.bunVersion).toBe(Bun.version);
  });

  it("should list items on GET /api/items", async () => {
    const res = await fetch(`${baseUrl}/api/items`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { items: Array<{ id: string; title: string }> };
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThan(0);
  });

  it("should create a new item on POST /api/items", async () => {
    const res = await fetch(`${baseUrl}/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Write tests with bun:test" }),
    });
    expect(res.status).toBe(201);
    const created = (await res.json()) as { id: string; title: string; completed: boolean };
    expect(created.title).toBe("Write tests with bun:test");
    expect(created.completed).toBe(false);
    expect(typeof created.id).toBe("string");
  });

  it("should serve frontend index.html on GET /", async () => {
    const res = await fetch(`${baseUrl}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('<div id="root"></div>');
  });

  it("should support SPA fallback on GET /any-client-route", async () => {
    const res = await fetch(`${baseUrl}/dashboard/settings`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("<!DOCTYPE html>");
  });

  it("should connect to live reload SSE stream when enabled", async () => {
    const liveServer = createServer({ port: 0, liveReload: true });
    const liveUrl = `http://localhost:${liveServer.port}`;

    try {
      const res = await fetch(`${liveUrl}/api/live-reload`);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/event-stream");

      const htmlRes = await fetch(`${liveUrl}/`);
      const html = await htmlRes.text();
      expect(html).toContain("/api/live-reload");
      expect(html).toContain("window.location.reload()");
    } finally {
      liveServer.stop();
    }
  });
});
