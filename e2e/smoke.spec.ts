import { expect, test, type ConsoleMessage, type Locator, type Page } from "@playwright/test";

const PAGES = [
  { path: "/problems", heading: /problem/i },
  { path: "/interview", heading: /From the first call to the offer/i },
  { path: "/mock", heading: /mock interview/i },
  { path: "/review", heading: /due today|nothing to review/i },
  { path: "/progress", heading: /Level \d+/ },
  { path: "/privacy", heading: /Privacy/ },
  { path: "/architecture", heading: /How this site is built/i },
  { path: "/git", heading: /Git/i },
];

const VERCEL_NOISE = /_vercel|vercel-scripts/i;

function collectProblems(page: Page): string[] {
  const problems: string[] = [];

  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (VERCEL_NOISE.test(text) || text.startsWith("Failed to load resource")) return;
    problems.push(`console: ${text.slice(0, 200)}`);
  });

  page.on("pageerror", (err) => problems.push(`pageerror: ${err.message.slice(0, 200)}`));

  page.on("response", (res) => {
    if (res.status() < 400 || VERCEL_NOISE.test(res.url())) return;
    problems.push(`${res.status()}: ${res.url().slice(0, 120)}`);
  });

  page.on("requestfailed", (req) => {
    if (VERCEL_NOISE.test(req.url())) return;
    problems.push(`failed: ${req.url().slice(0, 120)}`);
  });

  return problems;
}

async function hydrated(target: Locator) {
  await expect.poll(() => target.evaluate((el) => Object.keys(el).some((key) => key.startsWith("__react")))).toBe(true);
}

async function sidewaysOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

async function trailProblems(page: Page, wide: boolean) {
  return page.evaluate((isWide) => {
    const problems: string[] = [];
    const stops = [...document.querySelectorAll<HTMLElement>("#steps > li[data-step]")];
    const legs = [...document.querySelectorAll<HTMLElement>("#steps > li[data-kind]")];
    const lead = document.querySelector("#path-note")!.getBoundingClientRect();
    const hit = (a: DOMRect, b: DOMRect) =>
      a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    const cards = stops.map((stop) => stop.querySelector(":scope > div")!.getBoundingClientRect());
    cards.forEach((card, i) => {
      if (hit(card, lead)) problems.push(`card ${i} covers the lead paragraph`);
      for (let k = i + 1; k < cards.length; k++) if (hit(card, cards[k])) problems.push(`card ${i} covers card ${k}`);
    });
    if (!isWide) return problems;
    stops.forEach((stop, i) => {
      const box = stop.getBoundingClientRect();
      const pole = stop.querySelector(":scope > span")!.getBoundingClientRect();
      const inside =
        pole.top >= box.top - 1 &&
        pole.bottom <= box.bottom + 1 &&
        pole.left >= box.left - 1 &&
        pole.right <= box.right + 1;
      if (!inside) problems.push(`flag pole ${i} leaves its stop`);
      const middle = (box.top + box.bottom) / 2;
      const leg = legs[i + 1]?.querySelector("svg")?.getBoundingClientRect();
      if (leg && Math.abs(leg.top - middle) > 2)
        problems.push(`trail after stop ${i} starts ${leg.top - middle}px off its pole`);
    });
    return problems;
  }, wide);
}

test("the home page loads with its heading and the Menu pill", async ({ page }) => {
  const problems = collectProblems(page);
  const response = await page.goto("/", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Walk into the interview ready/i);
  await expect(page.getByRole("button", { name: "Menu", exact: true })).toBeVisible();
  expect(problems).toEqual([]);
});

test("the Menu opens and Escape closes it", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const menuButton = page.getByRole("button", { name: "Menu", exact: true });
  await hydrated(menuButton);
  await menuButton.click();
  const menu = page.getByRole("dialog", { name: /menu/ });
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
});

test("a topic cover opens and its level picker link works", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto("/notes", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/JavaScript/i);
  const pick = page.getByRole("link", { name: "Pick your level" });
  await hydrated(pick);
  await pick.click();
  await expect(page).toHaveURL(/\/level\/js$/);
  await expect(page.getByRole("group", { name: "Pick your level" })).toBeVisible();
  expect(problems).toEqual([]);
});

test("a chapter opens with its title and rail, and does not scroll sideways at 390 wide", async ({ page }) => {
  const problems = collectProblems(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/notes/scope", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Scope");
  const rail = page.getByRole("navigation", { name: "Chapters" });
  await expect(rail.locator("a[aria-current=page]")).toContainText("Scope");

  await page.setViewportSize({ width: 390, height: 844 });
  await hydrated(page.locator(".prose[data-enhanced]"));
  await expect.poll(() => sidewaysOverflow(page)).toBeLessThanOrEqual(0);
  expect(problems).toEqual([]);
});

test("the path trail keeps every stop clear of the others with every exercise list open", async ({ page }) => {
  const problems = collectProblems(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/path/dsa/beginner", { waitUntil: "networkidle" });
  const steps = page.locator("#steps");
  await hydrated(steps.getByRole("button", { name: "Mark as read" }).first());
  const lists = steps.locator("details");
  await expect(steps.locator("details[open]")).toHaveCount(1);
  const total = await lists.count();
  expect(total).toBeGreaterThan(3);
  for (let i = 0; i < total; i++) {
    const list = lists.nth(i);
    if ((await list.getAttribute("open")) === null) await list.locator("summary").click();
  }
  await expect(steps.locator("details[open]")).toHaveCount(total);
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => trailProblems(page, true)).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => trailProblems(page, false)).toEqual([]);
  await expect.poll(() => sidewaysOverflow(page)).toBeLessThanOrEqual(0);
  expect(problems).toEqual([]);
});

test("the playground runs a JavaScript snippet and shows the output", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto("/practice?id=free", { waitUntil: "networkidle" });
  const editor = page.locator(".cm-content");
  await expect(editor).toBeVisible();
  const run = page.getByRole("button", { name: "Run the code" });
  await hydrated(run);
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("console.log(6 * 7);\n");
  await run.click();
  await expect(page.locator("#view-console .line")).toContainText("42");
  await expect(page.locator(".run-status")).toContainText("ran");
  expect(problems).toEqual([]);
});

test("an exercise page opens, runs its code and grades a submission", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto("/problems/ex-tdz-order", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/temporal dead zone/i);
  const editor = page.locator(".cm-content");
  await expect(editor).toContainText("function greetMember(name)");
  const run = page.getByRole("button", { name: "Run the code" });
  await hydrated(run);
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("console.log(1 + 1);\n");
  await run.click();
  await expect(page.locator("#view-console .line")).toContainText("2");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.locator("[data-verdict='fail']")).toBeVisible({ timeout: 30_000 });
  expect(problems).toEqual([]);
});

for (const { path, heading } of PAGES) {
  test(`${path} loads with its heading and no console error`, async ({ page }) => {
    const problems = collectProblems(page);
    const response = await page.goto(path, { waitUntil: "networkidle" });
    expect(response?.status(), `${path} did not return 200`).toBe(200);
    await expect(page.locator("#main h1, #main h2").first()).toContainText(heading);
    expect(problems, `${path} logged problems`).toEqual([]);
  });
}

test("an unknown URL returns a real 404", async ({ page }) => {
  for (const path of ["/no-such-page", "/notes/no-such-chapter"]) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} did not return 404`).toBe(404);
  }
});
