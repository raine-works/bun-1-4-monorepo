import { describe, expect, it } from "bun:test";
import { renderToString } from "react-dom/server";
import { App } from "@/App";

describe("Store App Component", () => {
  it("renders without crashing", () => {
    const html = renderToString(<App />);
    expect(html).toContain("Store");
    expect(html).toContain("Store MFE");
  });
});
