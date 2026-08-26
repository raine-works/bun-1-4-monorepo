import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { createServer } from "@/index";

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

  it("should serve hub index.html on GET /", async () => {
    const res = await fetch(`${baseUrl}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('<div id="root"></div>');
  });

  it("should serve store micro-frontend on GET /store and resolve its JS bundle", async () => {
    const res = await fetch(`${baseUrl}/store`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Store");

    // Extract script src and verify it resolves as javascript, not HTML fallback
    const scriptSrcMatch = html.match(/src="([^"]+\.js)"/);
    expect(scriptSrcMatch).not.toBeNull();
    if (scriptSrcMatch) {
      const scriptUrl = scriptSrcMatch[1].startsWith("/")
        ? `${baseUrl}${scriptSrcMatch[1]}`
        : `${baseUrl}/store/${scriptSrcMatch[1]}`;
      const scriptRes = await fetch(scriptUrl);
      expect(scriptRes.status).toBe(200);
      expect(scriptRes.headers.get("content-type")).toContain("javascript");
    }
  });

  it("should serve docs micro-frontend on GET /docs and resolve its JS bundle", async () => {
    const res = await fetch(`${baseUrl}/docs`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Docs");

    // Extract script src and verify it resolves as javascript, not HTML fallback
    const scriptSrcMatch = html.match(/src="([^"]+\.js)"/);
    expect(scriptSrcMatch).not.toBeNull();
    if (scriptSrcMatch) {
      const scriptUrl = scriptSrcMatch[1].startsWith("/")
        ? `${baseUrl}${scriptSrcMatch[1]}`
        : `${baseUrl}/docs/${scriptSrcMatch[1]}`;
      const scriptRes = await fetch(scriptUrl);
      expect(scriptRes.status).toBe(200);
      expect(scriptRes.headers.get("content-type")).toContain("javascript");
    }
  });

  it("should return 404 for missing static assets with file extensions", async () => {
    const res = await fetch(`${baseUrl}/nonexistent.js`);
    expect(res.status).toBe(404);

    const scopedRes = await fetch(`${baseUrl}/store/nonexistent.css`);
    expect(scopedRes.status).toBe(404);
  });

  it("should support SPA fallback on GET /any-client-route", async () => {
    const res = await fetch(`${baseUrl}/any-client-route`);
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

      const resDirect = await fetch(`${liveUrl}/live-reload`);
      expect(resDirect.status).toBe(200);
      expect(resDirect.headers.get("content-type")).toContain("text/event-stream");

      const htmlRes = await fetch(`${liveUrl}/`);
      const html = await htmlRes.text();
      expect(html).toContain("/api/live-reload");
      expect(html).toContain("window.location.reload()");
      expect(html).toContain("triggerSafeReload");
      expect(html).toContain("beforeunload");
      expect(html).toContain("pagehide");
    } finally {
      liveServer.stop();
    }
  });

  it("should cleanly handle rapid SSE client disconnects and rapid micro-frontend navigation without hanging", async () => {
    const liveServer = createServer({ port: 0, liveReload: true });
    const liveUrl = `http://localhost:${liveServer.port}`;

    try {
      // Simulate rapid navigation opening and aborting multiple SSE connections
      const abortControllers = Array.from({ length: 15 }, () => new AbortController());
      const ssePromises = abortControllers.map((ac) =>
        fetch(`${liveUrl}/api/live-reload`, { signal: ac.signal }).catch(() => {})
      );

      // Abort each connection rapidly to mimic fast page transitions
      await Bun.sleep(10);
      for (const ac of abortControllers) {
        ac.abort();
      }
      await Promise.all(ssePromises);

      // Rapidly fire multiple navigation requests across all micro-frontends
      const routes = ["/", "/store", "/docs", "/store", "/", "/docs", "/api/health"];
      const responses = await Promise.all(routes.map((route) => fetch(`${liveUrl}${route}`)));

      for (const res of responses) {
        expect(res.status).toBe(200);
      }
    } finally {
      liveServer.stop();
    }
  });

  it("should inject safe live reload script with asset failure recovery", async () => {
    const liveServer = createServer({ port: 0, liveReload: true });
    const liveUrl = `http://localhost:${liveServer.port}`;

    try {
      const res = await fetch(`${liveUrl}/`);
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain("triggerSafeReload");
      expect(html).toContain("Asset load error detected");
      expect(html).toContain("Cache-Control");
    } finally {
      liveServer.stop();
    }
  });

  it("should not inject live reload script or enable SSE route in production mode", async () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const prodServer = createServer({ port: 0 });
    const prodUrl = `http://localhost:${prodServer.port}`;

    try {
      // 1. Info endpoint reports liveReload: false
      const infoRes = await fetch(`${prodUrl}/api/info`);
      expect(infoRes.status).toBe(200);
      const info = (await infoRes.json()) as { liveReload: boolean };
      expect(info.liveReload).toBe(false);

      // 2. /api/live-reload and /live-reload return 404
      const sseRes = await fetch(`${prodUrl}/api/live-reload`);
      expect(sseRes.status).toBe(404);

      const sseDirectRes = await fetch(`${prodUrl}/live-reload`);
      expect(sseDirectRes.status).toBe(404);

      // 3. HTML responses do not contain live reload script or EventSource connection
      const routes = ["/", "/store", "/docs"];
      for (const route of routes) {
        const res = await fetch(`${prodUrl}${route}`);
        expect(res.status).toBe(200);
        const html = await res.text();
        expect(html).not.toContain("/api/live-reload");
        expect(html).not.toContain("window.__LIVE_RELOAD_ACTIVE__");
        expect(html).not.toContain("Live Reload Client");
      }
    } finally {
      prodServer.stop();
      process.env.NODE_ENV = origEnv;
    }
  });
});
