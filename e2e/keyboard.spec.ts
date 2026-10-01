import { expect, test, type Locator, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

const holdsFocus = (region: Locator) => region.evaluate((el) => el.contains(document.activeElement));

const focusWithin = (region: Locator) =>
  region.evaluate((el) => ({
    inside: el.contains(document.activeElement),
    backAtStart: document.activeElement?.hasAttribute("data-first-stop") ?? false,
  }));

async function expectTabToLoopWithin(page: Page, region: Locator) {
  await expect.poll(() => holdsFocus(region)).toBe(true);
  await page.evaluate(() => document.activeElement?.setAttribute("data-first-stop", ""));

  await page.keyboard.press("Shift+Tab");
  expect(await focusWithin(region), "Shift+Tab from the first stop wraps to the last").toEqual({
    inside: true,
    backAtStart: false,
  });
  await page.keyboard.press("Tab");
  expect(await focusWithin(region), "Tab from the last stop wraps to the first").toEqual({
    inside: true,
    backAtStart: true,
  });

  for (let stop = 1; stop <= 150; stop++) {
    await page.keyboard.press("Tab");
    const at = await focusWithin(region);
    expect(at.inside, `Tab ${stop} left the dialog`).toBe(true);
    if (at.backAtStart) return;
  }
  throw new Error("Tab never came back round to the first stop");
}

async function expectScrollRegion(page: Page, name: string) {
  const region = page.getByRole("region", { name, exact: true });
  await expect(region).toHaveAttribute("tabindex", "0");
  expect(await region.evaluate((el) => el.scrollWidth > el.clientWidth), `${name} scrolls at 390`).toBe(true);
}

test("the closed Chapters sheet stays out of the tab order, and the rail's search is reachable above the breakpoint", async ({
  page,
}) => {
  await page.goto("/notes/setup-mental-model");
  await expect(page.getByRole("dialog", { name: "Chapters" })).toHaveCount(0);

  let reachedMain = false;
  for (let stop = 1; stop <= 30 && !reachedMain; stop++) {
    await page.keyboard.press("Tab");
    reachedMain = await holdsFocus(page.locator("#main"));
  }
  expect(reachedMain, "Tab reaches the page's content").toBe(true);

  await page.setViewportSize({ width: 1280, height: 844 });
  const search = page.getByRole("searchbox", { name: "Search the notes" });
  await search.focus();
  await expect(search).toBeFocused();
});

test("the open Chapters sheet holds focus, and Escape gives it back to the Chapters button", async ({ page }) => {
  await page.goto("/notes/setup-mental-model");
  const button = page.getByRole("button", { name: "Chapters", exact: true });

  await button.focus();
  await page.keyboard.press("Enter");
  const sheet = page.getByRole("dialog", { name: "Chapters" });
  await expect(sheet).toBeVisible();
  await expectTabToLoopWithin(page, sheet);

  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(button).toBeFocused();
});

test("the site menu holds focus, and Escape with an empty search gives it back to Menu", async ({ page }) => {
  await page.goto("/review", { waitUntil: "networkidle" });
  const menuButton = page.getByRole("button", { name: "Menu", exact: true });

  await menuButton.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("dialog", { name: /menu/ });
  await expect(menu).toBeVisible();
  await expectTabToLoopWithin(page, menu);

  const search = menu.getByRole("searchbox", { name: "Jump to a page or topic" });
  await search.fill("zz");
  await page.keyboard.press("Escape");
  await expect(search).toHaveValue("");
  await expect(menu).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(menuButton).toBeFocused();
});

test("the Chapters sheet holds focus and Escape gives it back, and wide tables and code take focus by name", async ({
  page,
}) => {
  await page.goto("/git/merge", { waitUntil: "networkidle" });
  await expectScrollRegion(page, "Table: Choosing how the result is recorded");
  await expectScrollRegion(page, "Code: Three-way merge and the merge base");
  const button = page.getByRole("button", { name: "Chapters", exact: true });
  await expect(button).toHaveAttribute("aria-controls", "chapters-sheet");

  await button.focus();
  await page.keyboard.press("Enter");
  const sheet = page.getByRole("dialog", { name: "Chapters" });
  await expect(sheet).toHaveAttribute("id", "chapters-sheet");
  await expectTabToLoopWithin(page, sheet);

  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(button).toBeFocused();

  await page.goto("/interview/r7", { waitUntil: "networkidle" });
  await expectScrollRegion(page, "Table: The eight patterns that cover most of what you will be asked");
  await expectScrollRegion(page, "Code: longest substring without repeating characters");
});

test("the Filters sheet holds focus, and Escape gives it back to the Filters button", async ({ page }) => {
  await page.goto("/problems", { waitUntil: "networkidle" });
  const button = page.getByRole("button", { name: "Filters", exact: true });
  await expect(button).toHaveAttribute("aria-controls", "problem-filters");

  await button.focus();
  await page.keyboard.press("Enter");
  const sheet = page.getByRole("dialog", { name: "Filters" });
  await expect(sheet).toBeVisible();
  await expectTabToLoopWithin(page, sheet);

  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(button).toBeFocused();
});

test("the drill leaves Enter to a focused button, and Enter and Space from the card still reveal it", async ({
  page,
}) => {
  await page.goto("/interview/questions", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Drill \d+ as flashcards/ }).click();
  const drill = page.getByRole("region", { name: "Flashcard drill" });
  const verdict = drill.getByRole("group", { name: "How did you do?" });
  await expect(drill.getByText("Card 1 of")).toBeVisible();

  await expect(verdict).toHaveCount(0);
  await page.keyboard.press("Enter");
  await expect(verdict).toBeVisible();
  await page.keyboard.press("1");
  await expect(drill.getByText("Card 2 of")).toBeVisible();

  await drill.locator("article h2").click();
  await expect(verdict).toHaveCount(0);
  await page.keyboard.press(" ");
  await expect(verdict).toBeVisible();
  await page.keyboard.press("2");
  await expect(drill.getByText("Card 3 of")).toBeVisible();

  const stop = drill.getByRole("button", { name: "Stop" });
  await stop.focus();
  await page.keyboard.press("Enter");
  await expect(drill).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Drill \d+ as flashcards/ })).toBeVisible();
});

test("the mock room leaves Enter to a menu link, and Enter on the page walks in and moves past a marked answer", async ({
  page,
}) => {
  await page.goto("/mock", { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: "Single round" }).click();
  await page.getByRole("button", { name: /^Behavioural/ }).click();
  await page.getByRole("group", { name: "How many questions" }).getByRole("button", { name: /^3/ }).click();
  await page.getByRole("button", { name: "Start Behavioural" }).click();
  const walkIn = page.getByRole("button", { name: "Walk in" });
  await expect(walkIn).toBeVisible();

  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const menu = page.getByRole("dialog", { name: /menu/ });
  const link = menu.getByRole("navigation", { name: "Site" }).getByRole("link", { name: "Mock interview" });
  await link.focus();
  await page.keyboard.press("Enter");

  await expect(menu).toHaveCount(0);
  await expect(walkIn).toBeVisible();
  const answered = page.getByRole("button", { name: "I've answered" });
  await expect(answered).toHaveCount(0);

  await page.locator("#stage-title").click();
  await page.keyboard.press("Enter");
  await expect(answered).toBeVisible();

  await page.getByLabel(/Say it out loud/).fill("Situation, task, action, result.");
  await answered.click();
  const push = page.getByRole("button", { name: "Answered — show me" });
  const rubric = page.getByRole("heading", { name: "Mark it honestly" });
  await expect(push.or(rubric)).toBeVisible();
  if (await push.isVisible()) await push.click();
  await expect(rubric).toBeVisible();
  const next = page.getByRole("button", { name: "Next question" });
  for (let line = 0; line < 10 && (await next.isDisabled()); line++) await page.keyboard.press("3");
  await expect(next).toBeEnabled();

  await rubric.click();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Behavioural · 2 of 3")).toBeVisible();
});

test("Skip to the editor puts focus in the editor, ready to type", async ({ page }) => {
  await page.goto("/practice?id=free");
  await expect(page.locator(".cm-content")).toBeVisible();

  await page.getByRole("link", { name: "Skip to the editor" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".cm-content")).toBeFocused();
});
