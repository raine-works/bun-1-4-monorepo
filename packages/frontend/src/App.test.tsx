import { describe, expect, it } from "bun:test";
import { renderToString } from "react-dom/server";
import { App } from "./App";

describe("Frontend App Component", () => {
  it("renders without crashing using React 19 server renderer", () => {
    const html = renderToString(<App />);
    expect(html).toContain("Bun v1.4 + React 19 Monorepo");
    expect(html).toContain("Minimal Full-Stack Workspace");
    expect(html).toContain("Built-in React Compiler");
  });
});
