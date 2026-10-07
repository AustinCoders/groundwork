import { describe, expect, it } from "vitest";
import { withHeadingIds } from "@/lib/headingToc";

describe("withHeadingIds", () => {
  it("gives each heading an id from its text", () => {
    const { html, toc } = withHeadingIds("<h3>The core idea</h3><p>x</p>");
    expect(html).toContain('<h3 id="the-core-idea">');
    expect(toc).toEqual([{ id: "the-core-idea", text: "The core idea" }]);
  });

  it("keeps ids unique by numbering repeats", () => {
    const { toc } = withHeadingIds("<h3>Setup</h3><h3>Setup</h3>");
    expect(toc.map((t) => t.id)).toEqual(["setup", "setup-2"]);
  });

  it("never hands out the ids the page already uses", () => {
    const { html, toc } = withHeadingIds("<h3>Chapters</h3><h3>Check</h3>");
    expect(toc.map((t) => t.id)).toEqual(["chapters-2", "check-2"]);
    expect(html).not.toContain('id="check"');
    expect(html).not.toContain('id="chapters"');
  });
});
