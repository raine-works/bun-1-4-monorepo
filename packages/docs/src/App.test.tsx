import { describe, expect, it } from "bun:test";
import { renderToString } from "react-dom/server";
import { App } from "./App";

describe("Docs App Component", () => {
  it("renders without crashing", () => {
    const html = renderToString(<App />);
    expect(html).toContain("Documentation");
    expect(html).toContain("Docs MFE");
  });
});
