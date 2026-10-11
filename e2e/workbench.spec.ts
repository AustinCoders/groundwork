import { expect, test, type Page } from "@playwright/test";

const SIZES = [
  { width: 1001, height: 700 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
];

async function rooms(page: Page, selectors: { top: string; bottom: string; side: string }) {
  return page.evaluate(({ top, bottom, side }) => {
    const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    return {
      header: document.querySelector("header")!.getBoundingClientRect().bottom,
      top: rect(top).top,
      side: rect(side).left,
      bottom: innerHeight - rect(bottom).bottom,
      scrollY: document.documentElement.scrollHeight - innerHeight,
      overflowX: document.documentElement.scrollWidth - innerWidth,
    };
  }, selectors);
}

test("the playground fills the window with the same room on every side and no page scroll", async ({ page }) => {
  for (const size of SIZES) {
    await page.setViewportSize(size);
    await page.goto("/practice?id=free");
    await expect(page.locator(".cm-content")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const label = `${size.width}x${size.height}`;
    const m = await rooms(page, { top: ".ed", bottom: ".panel", side: ".ed" });
    expect(m.scrollY, `${label}: page scroll`).toBeLessThanOrEqual(0);
    expect(m.overflowX, `${label}: sideways scroll`).toBeLessThanOrEqual(0);
    const gapUnderHeader = m.top - m.header;
    expect(gapUnderHeader, `${label}: room under the header`).toBeGreaterThanOrEqual(12);
    expect(Math.abs(gapUnderHeader - m.side), `${label}: room under the header against the side`).toBeLessThanOrEqual(
      2
    );
    expect(Math.abs(m.bottom - m.side), `${label}: room at the bottom against the side`).toBeLessThanOrEqual(2);
  }
});

test("an exercise page is one full screen from 1001px up and stacks below it", async ({ page }) => {
  for (const size of SIZES) {
    await page.setViewportSize(size);
    await page.goto("/problems/ex-two-sum");
    await expect(page.locator(".cm-content")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const label = `${size.width}x${size.height}`;
    const m = await rooms(page, { top: "#brief", bottom: ".panel", side: "#brief" });
    expect(m.scrollY, `${label}: page scroll`).toBeLessThanOrEqual(0);
    expect(m.overflowX, `${label}: sideways scroll`).toBeLessThanOrEqual(0);
    expect(Math.abs(m.top - m.header - m.side), `${label}: room under the header against the side`).toBeLessThanOrEqual(
      2
    );
    expect(Math.abs(m.bottom - m.side), `${label}: room at the bottom against the side`).toBeLessThanOrEqual(2);
    const sides = await page.evaluate(() => ({
      brief: document.querySelector("#brief")!.getBoundingClientRect().right,
      editor: document.querySelector(".ed")!.getBoundingClientRect().left,
    }));
    expect(sides.brief, `${label}: the description sits left of the editor`).toBeLessThanOrEqual(sides.editor);
  }

  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto("/problems/ex-two-sum");
  await expect(page.locator(".cm-content")).toBeVisible();
  const stacked = await page.evaluate(() => ({
    brief: document.querySelector("#brief")!.getBoundingClientRect().bottom,
    editor: document.querySelector(".ed")!.getBoundingClientRect().top,
    scroll: document.documentElement.scrollHeight - innerHeight,
    overflowX: document.documentElement.scrollWidth - innerWidth,
  }));
  expect(stacked.brief, "the description comes first").toBeLessThanOrEqual(stacked.editor);
  expect(stacked.scroll, "the page scrolls when stacked").toBeGreaterThan(0);
  expect(stacked.overflowX).toBeLessThanOrEqual(0);
});

test("the workbench has no sideways scroll at 390 and 320 and its controls are tappable", async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    for (const path of ["/practice?id=free", "/problems/ex-two-sum", "/problems"]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, `${path} at ${width}`).toBeLessThanOrEqual(0);
    }
  }
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/problems/ex-two-sum");
  await expect(page.locator(".cm-content")).toBeVisible();
  for (const name of ["Run the code", "Submit", "Debug", "Menu"]) {
    const box = await page.getByRole("button", { name, exact: true }).first().boundingBox();
    expect(box!.height, `${name} is at least 44px tall`).toBeGreaterThanOrEqual(43.5);
  }
});

test("passing every test stamps the page, offers the next problem and nothing overlaps", async ({ page }) => {
  await page.goto("/problems/ex-two-sum");
  await expect(page.locator(".cm-content")).toContainText("function twoSum(nums, target)");
  await page.getByRole("button", { name: "Submit" }).click();
  const fail = page.locator("[data-verdict='fail']");
  await expect(fail).toContainText(/\d+ of 8 passing/, { timeout: 30_000 });

  await page.getByRole("tab", { name: /Hints/ }).click();
  await page.getByRole("button", { name: "Show the solution" }).click();
  await page.getByRole("dialog", { name: "Show the solution?" }).getByRole("button", { name: "Show solution" }).click();
  await page.getByRole("button", { name: "Submit" }).click();

  const pass = page.locator("[data-verdict='pass']");
  await expect(pass).toContainText("All 8 tests pass", { timeout: 30_000 });
  await expect(pass.getByRole("link", { name: /^Next: / })).toHaveAttribute("href", /^\/problems\//);
  await expect(page.locator("header").getByText("solved ✓")).toBeVisible();

  const parts = await pass.evaluate((el) => {
    const stamp = el.children[0] as HTMLElement;
    const text = el.children[1] as HTMLElement;
    const box = el.getBoundingClientRect();
    let opacity = 1;
    for (let node: Element | null = el; node; node = node.parentElement)
      opacity *= Number(getComputedStyle(node).opacity);
    return {
      stampEnd: stamp.offsetLeft + stamp.offsetWidth,
      textStart: text.offsetLeft,
      stampTop: stamp.offsetTop - (el as HTMLElement).offsetTop,
      stampBottom: stamp.offsetTop - (el as HTMLElement).offsetTop + stamp.offsetHeight,
      height: box.height,
      opacity,
    };
  });
  expect(parts.stampEnd, "the stamp stays clear of the words").toBeLessThanOrEqual(parts.textStart);
  expect(parts.opacity, "nothing is part transparent").toBe(1);
  expect(parts.stampBottom, "the stamp stays in its banner").toBeLessThanOrEqual(parts.height);
  expect(parts.stampTop).toBeGreaterThanOrEqual(0);
});

test("hints arrive one at a time as notes and the description keeps the hand-drawn title", async ({ page }) => {
  await page.goto("/problems/ex-two-sum");
  await expect(page.getByRole("heading", { level: 1, name: "Two Sum" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("DSA");
  await page.getByRole("tab", { name: /Hints/ }).click();
  const next = page.getByRole("button", { name: /Show a hint|Another hint/ });
  await next.click();
  await expect(page.locator("#hint-list > div")).toHaveCount(1);
  await page.getByRole("button", { name: /Another hint/ }).click();
  await expect(page.locator("#hint-list > div")).toHaveCount(2);
  await expect(page.locator("main [data-fx]")).toHaveCount(0);
});

test("the console speaks in the home voice before a run and after a clear", async ({ page }) => {
  await page.goto("/practice?id=free");
  const empty = page.locator("#view-console");
  await expect(empty).toContainText("Nothing yet.");
  await page.locator(".cm-content").click();
  await page.keyboard.press("ControlOrMeta+Enter");
  await expect(page.locator("#view-console .line").first()).toBeVisible();
  await page.locator("#clear-console").click();
  await expect(empty).toContainText("Cleared.");
});

test("the problems list opens with one balanced hero, then the sticky bar rides under the header", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/problems");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("tests pass");
  await expect(page.locator("main [data-fx]")).toHaveCount(0);
  await page.locator("#problem-list").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(300);
  const status = page.getByRole("status").first();
  const header = await page.evaluate(() => document.querySelector("header")!.getBoundingClientRect().bottom);
  const bar = await status.evaluate((el) => el.parentElement!.getBoundingClientRect().top);
  expect(Math.abs(bar - header), "the bar sits right under the header").toBeLessThanOrEqual(3);
  await expect(status).toHaveText(/All \d+ problems/);
});

test("no card of the problems hero covers another at common sizes", async ({ page }) => {
  for (const size of [...SIZES, { width: 800, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    await page.goto("/problems");
    await expect(page.getByRole("complementary", { name: "Up next" })).toBeVisible();
    const found = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("[data-stage] [data-card]")].map((el) => ({
        name: el.getAttribute("aria-label") ?? el.className,
        r: el.getBoundingClientRect(),
      }));
      const out: string[] = [];
      for (let i = 0; i < cards.length; i++)
        for (let j = i + 1; j < cards.length; j++) {
          const a = cards[i].r;
          const b = cards[j].r;
          const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (w > 4 && h > 4) out.push(`${cards[i].name} / ${cards[j].name}`);
        }
      return out;
    });
    expect(found, `${size.width}x${size.height}`).toEqual([]);
  }
});

test("a problem row shows its tick, level and test count, and a solved problem keeps its tick", async ({ page }) => {
  await page.goto("/problems");
  const first = page.locator("#problem-list ol li a").first();
  const href = (await first.getAttribute("href"))!;
  const id = href.split("/").pop()!;
  await expect(first).toContainText(/beginner|intermediate|advanced/);
  await expect(first).toContainText(/\d+ tests?/);
  await expect(first.locator("[class*='__tick']")).not.toHaveAttribute("data-done");

  await page.evaluate(
    (value) => localStorage.setItem("jsnotes:progress", JSON.stringify({ chapters: {}, exercises: { [value]: true } })),
    id
  );
  await page.reload();
  const ticked = page.locator(`#problem-list a[href='/problems/${id}']`);
  await expect(ticked.locator("[class*='__tick']")).toHaveAttribute("data-done", "true");
  await expect(ticked).toContainText("(solved)");
  await expect(page.getByRole("complementary", { name: "Up next" })).not.toContainText(await ticked.innerText());
});

test("the problems list shows no wrong state before hydration finishes", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("jsnotes:progress", JSON.stringify({ chapters: {}, exercises: { "ex-two-sum": true } }));
    const seen = { wrong: [] as string[] };
    (window as unknown as { __seen: typeof seen }).__seen = seen;
    const tick = () => {
      for (const card of document.querySelectorAll("[aria-label='Up next']")) {
        const body = card.querySelector("div");
        if (body && getComputedStyle(body).visibility !== "hidden" && /Start here/.test(body.textContent ?? ""))
          seen.wrong.push(`${Math.round(performance.now())}`);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto("/problems");
  await expect(page.getByRole("complementary", { name: "Up next" })).toContainText("Pick up where you left off");
  await page.waitForTimeout(500);
  const wrong = await page.evaluate(() => (window as unknown as { __seen: { wrong: string[] } }).__seen.wrong);
  expect(wrong, "frames that showed the first-visit label").toEqual([]);
});

test("the Filters sheet on a phone keeps the filters, the sort and the layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/problems");
  await expect(page.getByRole("complementary", { name: "Filters" })).toBeHidden();
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: "Filters" });
  await sheet.getByRole("button", { name: /DSA/ }).click();
  await sheet.getByRole("button", { name: /advanced/i }).click();
  await expect(sheet.getByRole("button", { name: /^Show \d+ problems$/ })).toBeVisible();
  await expect(sheet.getByLabel("Sort")).toBeVisible();
  await sheet.getByRole("button", { name: /^Show \d+ problems$/ }).click();
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Filters/ })).toBeFocused();
  await expect(page.getByRole("status").first()).toHaveText(/\d+ of \d+ problems/);
  await expect(page.getByRole("button", { name: /^Filters/ })).toContainText("2");
});

test("an empty search says so in the home voice and offers to clear", async ({ page }) => {
  await page.goto("/problems");
  await page.getByRole("searchbox", { name: "Search problems" }).fill("zzzz-no-such-problem");
  await expect(page.getByText("No problems match")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("status").first()).toHaveText(/All \d+ problems/);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the problems list and a problem's description still read and link", async ({ page }) => {
    await page.goto("/problems");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("tests pass");
    await expect(page.getByRole("status").first()).toHaveText(/All \d+ problems/);
    await expect(page.locator("#problem-list a[href^='/problems/']").first()).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Up next" })).toContainText("Solve it");

    await page.goto("/problems/ex-two-sum");
    await expect(page.getByRole("heading", { level: 1, name: "Two Sum" })).toBeVisible();
    await expect(page.locator("#ex-body")).toContainText("indices");
    await expect(page.getByRole("link", { name: /Read B3 Hashing first/ })).toBeVisible();
  });
});

test("the editor in a mock coding round keeps its tool icons and an action strip above it", async ({ page }) => {
  await page.goto("/mock");
  await page.getByRole("tab", { name: "Single round" }).click();
  await page.getByRole("button", { name: /^Coding/ }).click();
  await page.getByRole("group", { name: "How many questions" }).getByRole("button", { name: /^3/ }).click();
  await page.getByRole("button", { name: /^Start Coding/ }).click();
  await page.getByRole("button", { name: "Walk in" }).click();
  await expect(page.locator(".cm-content")).toBeVisible();
  const icons = await page
    .locator(".ed__tools .btn--icon svg")
    .evaluateAll((svgs) => svgs.map((svg) => svg.getBoundingClientRect().width));
  expect(icons.length).toBeGreaterThanOrEqual(4);
  for (const width of icons) expect(width, "every tool icon has room").toBeGreaterThan(10);
  await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run the code" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Debug" })).toHaveCount(0);
});
