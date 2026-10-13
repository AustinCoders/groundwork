import { describe, expect, it } from "vitest";
import { withHeadingIds } from "@/lib/headingToc";

describe("withHeadingIds", () => {
  it("gives each heading an id from its text", () => {
    const { html, toc } = withHeadingIds("<h3>The core idea</h3><p>x</p>");
    expect(html).toContain('<h2 id="the-core-idea">The core idea</h2>');
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

  it("makes sections h2 and their sub-sections h3 so no level is skipped", () => {
    const { html, toc } = withHeadingIds('<h3>Sorting</h3><h4>Dry run</h4><p>x</p><h4 class="x">Cost</h4>');
    expect(html).toBe(
      '<h2 id="sorting">Sorting</h2><h3 class="subhead">Dry run</h3><p>x</p><h3 class="subhead x">Cost</h3>'
    );
    expect(toc).toEqual([{ id: "sorting", text: "Sorting" }]);
    expect(html).not.toMatch(/<h[14]/);
  });
});
