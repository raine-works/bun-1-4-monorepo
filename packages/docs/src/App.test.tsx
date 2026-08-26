import { describe, expect, it } from "bun:test";
import { renderToString } from "react-dom/server";
import { App, createAppRouter } from "@/App";

describe("Docs App Component with TanStack Router", () => {
  it("renders docs overview route without crashing", async () => {
    const testRouter = createAppRouter("/docs/");
    await testRouter.load();
    const html = renderToString(<App router={testRouter} />);

    expect(html).toContain("Docs Micro-Frontend");
    expect(html).toContain("@app/docs");
    expect(html).toContain("Documentation Overview");
    expect(html).toContain("@app/backend");
  });

  it("renders developer guides route without crashing", async () => {
    const testRouter = createAppRouter("/docs/guides");
    await testRouter.load();
    const html = renderToString(<App router={testRouter} />);

    expect(html).toContain("Developer Guides");
    expect(html).toContain("Adding TanStack Router Routes");
  });

  it("renders API reference route without crashing", async () => {
    const testRouter = createAppRouter("/docs/api");
    await testRouter.load();
    const html = renderToString(<App router={testRouter} />);

    expect(html).toContain("API Reference");
    expect(html).toContain("/api/health");
  });

  it("renders docs 404 handler on unmatched route", async () => {
    const testRouter = createAppRouter("/docs/non-existent-guide");
    await testRouter.load();
    const html = renderToString(<App router={testRouter} />);

    expect(html).toContain("404: Page Not Found");
    expect(html).toContain("Docs MFE 404 Handler");
    expect(html).toContain("Return to Docs Overview");
  });
});
