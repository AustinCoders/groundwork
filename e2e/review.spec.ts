import { expect, test, type Page } from "@playwright/test";

const DAY = 86_400_000;

const SIZES = [
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2316, height: 1068 },
];

type Marks = Record<string, { at: number; reviews: number }>;

function dueMarks(): Marks {
  const now = Date.now();
  return {
    closures: { at: now - 5 * DAY, reviews: 0 },
    scope: { at: now - 9 * DAY, reviews: 1 },
    "basic-async": { at: now - 4 * DAY, reviews: 0 },
    "this-keyword": { at: now - 3.2 * DAY, reviews: 0 },
    "var-let-const": { at: now - DAY, reviews: 0 },
    "dom-events": { at: now - 2 * DAY, reviews: 1 },
    "modern-js": { at: now - 30 * DAY, reviews: 5 },
  };
}

function scheduledMarks(): Marks {
  const now = Date.now();
  return {
    "var-let-const": { at: now - DAY, reviews: 0 },
    "dom-events": { at: now - 2 * DAY, reviews: 1 },
  };
}

async function seed(page: Page, marks: Marks) {
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem("seeded")) {
      sessionStorage.setItem("seeded", "1");
      localStorage.setItem("jsnotes:progress", JSON.stringify({ chapters: value, exercises: {} }));
    }
  }, marks);
}

async function stageOverlaps(page: Page) {
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll("[data-stage] [data-card]")].map((el) => ({
      name: el.getAttribute("aria-label") ?? el.className,
      r: el.getBoundingClientRect(),
    }));
    const found: string[] = [];
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const a = cards[i].r;
        const b = cards[j].r;
        const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (w > 4 && h > 4) found.push(`${cards[i].name} / ${cards[j].name}`);
      }
    }
    return found;
  });
}

const STATES: [string, () => Marks][] = [
  ["nothing read", () => ({})],
  ["some due", dueMarks],
  ["nothing due", scheduledMarks],
];

for (const [name, marks] of STATES) {
  test(`the review hero is one balanced screen with ${name} and no stage card covers another`, async ({ page }) => {
    await seed(page, marks());
    for (const size of SIZES) {
      await page.setViewportSize(size);
      await page.goto("/review");
      await expect(page.locator("main [data-fx]")).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      const label = `${name} at ${size.width}x${size.height}`;
      const m = await page.evaluate(() => {
        const hero = document.querySelector("[data-scene-root]")!;
        const header = document.querySelector("header")!.getBoundingClientRect().bottom;
        const box = hero.getBoundingClientRect();
        let top = Infinity;
        let bottom = -Infinity;
        for (const el of hero.querySelectorAll("*")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0 || getComputedStyle(el).visibility === "hidden") continue;
          top = Math.min(top, r.top);
          bottom = Math.max(bottom, r.bottom);
        }
        return { above: top - header, below: box.bottom - bottom, heroBottom: box.bottom };
      });
      const need = Math.min(96, Math.max(48, 0.08 * size.height));
      expect(m.above, `${label}: gap under the header`).toBeGreaterThanOrEqual(need - 1);
      expect(Math.abs(m.above - m.below), `${label}: space above and below`).toBeLessThanOrEqual(
        0.25 * Math.max(m.above, m.below) + 2
      );
      expect(m.heroBottom, `${label}: hero height`).toBeGreaterThanOrEqual(Math.min(size.height, 960) - 2);
      expect(await stageOverlaps(page), label).toEqual([]);
    }
  });
}

test("the review page never shows the wrong state before hydration finishes", async ({ page }) => {
  await seed(page, dueMarks());
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { __seen: string[] }).__seen = seen;
    const tick = () => {
      const heading = document.querySelector("main h1");
      if (heading && getComputedStyle(heading).visibility !== "hidden" && !/due today/.test(heading.textContent ?? ""))
        seen.push(heading.textContent ?? "");
      for (const card of document.querySelectorAll("main [data-card]")) {
        if (getComputedStyle(card).visibility !== "hidden" && /How it starts/.test(card.textContent ?? ""))
          seen.push(card.textContent ?? "");
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto("/review");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("due today");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("due today");
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => (window as unknown as { __seen: string[] }).__seen)).toEqual([]);
});

test("remembering a chapter takes it off the due list and the menu count follows", async ({ page }) => {
  await seed(page, dueMarks());
  await page.goto("/review");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("4 chapters are due today");
  const due = page.locator("#due");
  await expect(due.getByRole("listitem")).toHaveCount(4);

  const menuButton = page.getByRole("button", { name: "Menu", exact: true });
  await menuButton.click();
  const menu = page.getByRole("dialog", { name: /menu/ });
  await expect(menu.getByRole("link", { name: "Review, 4 due" })).toBeVisible();
  await page.keyboard.press("Escape");

  await due.getByRole("button", { name: /^I remember.*Closures/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("3 chapters are due today");
  await expect(due.getByRole("listitem")).toHaveCount(3);
  await expect(page.locator("#schedule").getByRole("link", { name: "Closures" })).toBeVisible();

  await menuButton.click();
  await expect(menu.getByRole("link", { name: "Review, 3 due" })).toBeVisible();
});

test("Again keeps a chapter due, moves it to the end and can be undone", async ({ page }) => {
  await seed(page, dueMarks());
  await page.goto("/review");
  const due = page.locator("#due");
  const rows = due.getByRole("listitem");
  const first = await rows.first().getByRole("link").first().innerText();
  await rows
    .first()
    .getByRole("button", { name: /^Again/ })
    .click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText("4 chapters are due today");
  await expect(rows.last()).toContainText(first);
  await expect(rows.last()).toContainText("still due, read it again");
  await expect(rows.last().getByRole("link", { name: /^Open it/ })).toBeVisible();

  await rows.last().getByRole("button", { name: /^Undo/ }).click();
  await expect(due.getByText("still due, read it again")).toHaveCount(0);
  await expect(rows.first()).toContainText(first);
});

test("clearing the due list shows the stamp and what comes next, and the review is saved", async ({ page }) => {
  const now = Date.now();
  await seed(page, { closures: { at: now - 5 * DAY, reviews: 0 }, "var-let-const": { at: now - DAY, reviews: 0 } });
  await page.goto("/review");
  await page
    .locator("#due")
    .getByRole("button", { name: /^I remember/ })
    .click();
  const done = page.locator("#due").getByRole("status");
  await expect(done).toContainText("You are caught up.");
  await expect(done).toContainText("1 review");
  await expect(done).toContainText("Next up is");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nothing is due today");

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nothing is due today");
  await expect(page.locator("#due")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Recently reviewed" })).toBeVisible();
});

test("a reader with nothing read gets an honest start and a way to the topics", async ({ page }) => {
  await page.goto("/review");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nothing to review yet");
  await expect(page.getByRole("heading", { name: "Reviews begin with a chapter you finish" })).toBeVisible();
  await expect(page.locator("#due, #schedule, #recent")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Browse the topics →" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("heading", { name: "Each review pushes it further out" })).toBeVisible();
});

test("the schedule groups chapters by day and long lists open on request", async ({ page }) => {
  const now = Date.now();
  const marks: Marks = {};
  const ids = [
    "setup-mental-model",
    "execution-context",
    "var-let-const",
    "scope",
    "single-thread",
    "types-values",
    "operators-flow",
    "functions-basics",
    "this-keyword",
    "dom-events",
    "basic-async",
    "closures",
    "objects-deep",
    "async-properly",
    "prototypes-oop",
  ];
  ids.forEach((id, k) => (marks[id] = { at: now - (k % 3) * DAY, reviews: 0 }));
  await seed(page, marks);
  await page.goto("/review");
  const schedule = page.locator("#schedule");
  await expect(schedule.getByRole("heading", { level: 3 }).first()).toBeVisible();
  const toggle = schedule.locator("button[aria-expanded]");
  await expect(toggle).toHaveText(/^Show all/);
  const before = await schedule.getByRole("listitem").count();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(await schedule.getByRole("listitem").count()).toBeGreaterThan(before);
  await expect(schedule.getByRole("button", { name: "Show fewer" })).toBeVisible();
});

test("the session walks the due chapters, Again leaves one due, and the page stays honest", async ({ page }) => {
  await seed(page, dueMarks());
  await page.goto("/review");
  await page.getByRole("button", { name: "Start reviewing" }).click();
  const session = page.getByRole("region", { name: "Review session" });
  await expect(session).toContainText("1 of 4");
  await session.getByRole("button", { name: "I remember" }).click();
  await expect(session).toContainText("2 of 4");
  await session.getByRole("button", { name: "Again" }).click();
  await session.getByRole("button", { name: "I remember" }).click();
  await session.getByRole("button", { name: "Again" }).click();
  await expect(page.getByText("Session done.")).toBeVisible();
  await expect(page.getByText("2 of 4 pushed to their next, longer gap.")).toBeVisible();
  await page.getByRole("button", { name: "Back to review" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("2 chapters are due today");
});

for (const [name, marks] of STATES) {
  test(`the review page with ${name} has no sideways scroll at 390 and 320 and its controls are tappable`, async ({
    page,
  }) => {
    await seed(page, marks());
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/review");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
        `${name} at ${width}`
      ).toBeLessThanOrEqual(0);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll("main button, main a")]
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(
            ({ el, r }) =>
              r.height > 0 && r.height < 44 && el.closest("[data-stage], p") === null && !el.matches("a[class*='chip']")
          )
          .map(({ el, r }) => `${el.textContent?.trim().slice(0, 30)} ${Math.round(r.height)}`)
      );
      expect(small, `${name} at ${width}: controls under 44px`).toEqual([]);
    }
  });
}
