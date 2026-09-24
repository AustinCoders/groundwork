import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/notes",
  "/notes/setup-mental-model",
  "/interview",
  "/interview/r1oa",
  "/interview/r7",
  "/level/js",
  "/path?topic=js&level=beginner",
  "/practice?id=free",
  "/problems",
  "/problems/ex-accounts-merge",
  "/review",
  "/mock",
  "/progress",
  "/git",
  "/architecture",
  "/architecture/arch-request-path",
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

// The mock interview's room and debrief only exist after you start a round, so
// they are walked to rather than visited.
test("the mock interview room and debrief have no accessibility violations", async ({ page }) => {
  const check = async (where: string) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .disableRules(["scrollable-region-focusable"])
      .analyze();
    const summary = results.violations.map(
      (v) => `[${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes[0]?.html.slice(0, 140)}`
    );
    expect(summary, `${where} has accessibility violations`).toEqual([]);
  };

  await page.goto("/mock", { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: "Single round" }).click();
  await page.getByRole("button", { name: /^System design/ }).click();
  await page.getByRole("button", { name: "3", exact: true }).click();
  await page.getByRole("button", { name: "Start System design" }).click();

  await page.getByRole("button", { name: "Walk in" }).waitFor();
  await check("the stage brief");
  await page.getByRole("button", { name: "Walk in" }).click();

  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "I've answered" }).waitFor();
    if (i === 0) await check("a question");
    await page.getByRole("button", { name: "I've answered" }).click();
    const push = page.getByRole("button", { name: "Answered — show me" });
    const rubric = page.getByText("Mark it honestly");
    await expect(push.or(rubric)).toBeVisible();
    if (await push.isVisible()) {
      if (i === 0) await check("a follow-up");
      await push.click();
    }
    await expect(rubric).toBeVisible();
    if (i === 0) await check("the review and rubric");
    for (let k = 0; k < 5; k++) await page.keyboard.press(k % 2 ? "2" : "1");
    await page.getByRole("button", { name: "Next question" }).click();
  }

  await expect(page.getByText("Round debrief")).toBeVisible();
  await check("the debrief");
});
