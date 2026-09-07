import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/notes",
  "/notes/setup-mental-model",
  "/interview",
  "/interview/r1oa",
  "/level/js",
  "/path?topic=js&level=beginner",
  "/practice?id=free",
  "/problems",
  "/review",
  "/progress",
  "/git",
];

for (const path of PAGES) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // CodeMirror's scroller carries tabindex="-1" while the contenteditable
      // inside it takes focus and scrolls with the arrow keys, so the region is
      // reachable; axe cannot see that and flags the pattern generically.
      .disableRules(["scrollable-region-focusable"])
      .analyze();

    const summary = results.violations.map(
      (v) => `[${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes[0]?.html.slice(0, 140)}`
    );
    expect(summary, `${path} has accessibility violations`).toEqual([]);
  });
}
