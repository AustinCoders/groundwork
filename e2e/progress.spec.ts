import { expect, test, type Page } from "@playwright/test";

const DAY = 86_400_000;

const SIZES = [
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2316, height: 1068 },
];

const CHAPTERS = [
  "setup-mental-model",
  "execution-context",
  "var-let-const",
  "scope",
  "single-thread",
  "in-the-browser",
  "types-values",
  "strings-numbers-math",
  "operators-flow",
  "functions-basics",
  "objects-arrays-basics",
  "this-keyword",
  "closures",
  "dom-events",
  "basic-async",
  "errors-tools",
  "scope-functions",
  "objects-deep",
  "prototypes-oop",
  "async-properly",
];

type Seed = Record<string, unknown>;

function dayKey(time: number): string {
  const date = new Date(time);
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((n) => String(n).padStart(2, "0")).join("-");
}

function someSeed(): Seed {
  const now = Date.now();
  const chapters: Record<string, { at: number; reviews: number }> = {};
  CHAPTERS.slice(0, 5).forEach((id, k) => (chapters[id] = { at: now - (k + 3) * DAY, reviews: k % 2 }));
  const log: Record<string, number> = {};
  [0, 1, 2, 3, 6, 9].forEach((ago, k) => (log[dayKey(now - ago * DAY)] = k + 1));
  return {
    "jsnotes:progress": { chapters, exercises: { a: true, b: true } },
    "jsnotes:activity": log,
    "groundwork:interview:confidence": { q1: "knew", q2: "shaky" },
  };
}

function lotsSeed(): Seed {
  const now = Date.now();
  const chapters: Record<string, { at: number; reviews: number }> = {};
  CHAPTERS.forEach((id, k) => (chapters[id] = { at: now - (k + 1) * DAY, reviews: k % 4 }));
  const exercises: Record<string, true> = {};
  for (let k = 0; k < 30; k++) exercises[`seed-${k}`] = true;
  const log: Record<string, number> = {};
  for (let ago = 0; ago < 300; ago += 2) log[dayKey(now - ago * DAY)] = (ago % 9) + 1;
  const marks = ["knew", "shaky", "blank", "knew"];
  const confidence: Record<string, string> = {};
  for (let k = 0; k < 24; k++) confidence[`q${k}`] = marks[k % 4];
  return {
    "jsnotes:progress": { chapters, exercises },
    "jsnotes:activity": log,
    "groundwork:interview:confidence": confidence,
    "groundwork:resume": {
      v: 1,
      topic: "js",
      topicName: "JavaScript",
      chapter: "closures",
      num: "B13",
      title: "Closures",
      href: "/notes/closures",
      index: 13,
      total: 41,
      at: now - DAY,
    },
  };
}

async function seed(page: Page, values: Seed) {
  await page.addInitScript((entries) => {
    if (!sessionStorage.getItem("seeded")) {
      sessionStorage.setItem("seeded", "1");
      for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, JSON.stringify(value));
    }
  }, values);
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

const STATES: [string, () => Seed][] = [
  ["nothing yet", () => ({})],
  ["some progress", someSeed],
  ["a lot of progress", lotsSeed],
];

for (const [name, values] of STATES) {
  test(`the progress hero is one balanced screen with ${name} and no stage card covers another`, async ({ page }) => {
    await seed(page, values());
    for (const size of SIZES) {
      await page.setViewportSize(size);
      await page.goto("/progress");
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

test("the progress page never shows the wrong level, count or label before hydration finishes", async ({ page }) => {
  await seed(page, lotsSeed());
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { __seen: string[] }).__seen = seen;
    const shown = (el: Element) => getComputedStyle(el).visibility !== "hidden";
    const tick = () => {
      const heading = document.querySelector("main h1");
      if (heading && shown(heading) && !/Level 5,/.test(heading.textContent ?? ""))
        seen.push(heading.textContent ?? "");
      for (const card of document.querySelectorAll("main [data-card]")) {
        if (shown(card) && /\b0 day streak|0 \/ 25 XP|to reach level 2/.test(card.textContent ?? ""))
          seen.push(card.textContent ?? "");
      }
      for (const scope of ["#next", "#topics", "#badges", "#interview"]) {
        const section = document.querySelector(scope);
        if (!section) continue;
        for (const el of section.querySelectorAll("li, a, p, b")) {
          if (
            shown(el) &&
            /Start a topic|Nothing marked yet|\b0 of 41 chapters|Not yet: First Steps/.test(el.textContent ?? "")
          )
            seen.push(el.textContent ?? "");
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto("/progress");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Level 5, 135 XP to go.");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Level 5, 135 XP to go.");
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => (window as unknown as { __seen: string[] }).__seen)).toEqual([]);
});

test("every number on the page comes from the saved data", async ({ page }) => {
  const values = lotsSeed();
  await seed(page, values);
  await page.goto("/progress");
  const log = values["jsnotes:activity"] as Record<string, number>;
  const now = Date.now();
  const lastSeven = Array.from({ length: 7 }, (_, k) => log[dayKey(now - k * DAY)] ?? 0).reduce((n, c) => n + c, 0);
  const year = Array.from({ length: 364 }, (_, k) => log[dayKey(now - k * DAY)] ?? 0);

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Level 5, 135 XP to go.");
  await expect(
    page.getByText("490 XP so far: 20 chapters read, 30 exercises solved and 30 reviews done.")
  ).toBeVisible();

  const numbers = page.getByLabel("Your numbers");
  await expect(numbers).toContainText(/chapters read\s*20/);
  await expect(numbers).toContainText(/exercises solved\s*30/);
  await expect(numbers).toContainText(/reviews done\s*30/);
  await expect(page.getByLabel("Your level")).toContainText("90 / 225 XP");

  await expect(page.locator("#activity")).toContainText(
    `${year.reduce((n, c) => n + c, 0)} things done on ${year.filter((c) => c > 0).length} days this year`
  );
  await expect(page.getByLabel("Things done in the last seven days")).toContainText(`${lastSeven} this week`);

  await expect(page.locator("#topics").getByRole("link", { name: /JavaScript/ })).toContainText("20 of 41 chapters");
  await expect(page.locator("#topics").getByRole("link", { name: /React/ })).toContainText("0 of");

  const interview = page.locator("#interview");
  await expect(interview).toContainText("12 knew it");
  await expect(interview).toContainText("6 shaky");
  await expect(interview).toContainText("6 blank");
  await expect(interview.getByRole("link", { name: "Drill the 12 weak ones →" })).toHaveAttribute(
    "href",
    "/interview/questions?filter=shaky"
  );

  const badges = page.locator("#badges");
  await expect(badges.locator("li[data-earned]")).toHaveCount(5);
  await expect(page.getByRole("heading", { name: "The badge wall" })).toBeVisible();
  await expect(badges).toContainText("5 of 12");
  await expect(badges.locator("li").filter({ hasText: "Not yet: Scholar" })).toContainText("20 of 50 chapters");
});

test("the links lead where the old page led", async ({ page }) => {
  await seed(page, lotsSeed());
  await page.goto("/progress");
  await expect(page.getByRole("link", { name: "Continue where you stopped" })).toHaveAttribute(
    "href",
    "/notes/closures"
  );
  await expect(page.locator("main").getByRole("link", { name: /to review$/ })).toHaveAttribute("href", "/review");
  const next = page.locator("#next");
  await expect(next.getByRole("link", { name: "Open review →" })).toHaveAttribute("href", "/review");
  await expect(next.getByRole("link", { name: "Continue →" })).toHaveAttribute("href", "/level/js");
  await expect(next.getByRole("link", { name: "Drill →" })).toHaveAttribute(
    "href",
    "/interview/questions?filter=shaky"
  );
  await expect(page.locator("#topics").getByRole("link", { name: /JavaScript/ })).toHaveAttribute("href", "/level/js");
  await expect(page.locator("#interview").getByRole("link", { name: "Open the book →" })).toHaveAttribute(
    "href",
    "/interview"
  );
});

test("a reader with nothing saved gets an honest start", async ({ page }) => {
  await page.goto("/progress");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Level 1, 25 XP to go.");
  await expect(page.getByRole("link", { name: /^Start / })).toBeVisible();
  await expect(page.getByLabel("Your level")).toContainText("0 / 25 XP");
  await expect(page.locator("#activity")).toContainText("0 things done on 0 days this year");
  await expect(page.locator("#activity")).toContainText("Nothing here yet.");
  await expect(page.locator("#interview")).toContainText("Nothing marked yet.");
  await expect(page.locator("#badges li[data-earned]")).toHaveCount(0);
  const first = page.locator("#badges li").filter({ hasText: "First Steps" });
  await expect(first).toContainText("0 of 1 exercise");
  await expect(first).toContainText("next up");
  await expect(page.locator("#next").getByRole("link", { name: "Pick one →" })).toHaveAttribute("href", "/");
  await expect(page.locator("#next").getByRole("link", { name: "Open review →" })).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("a level up is announced once, as a stamp on the level card", async ({ page }) => {
  await seed(page, lotsSeed());
  await page.goto("/progress");
  await expect(page.getByRole("status").filter({ hasText: "Level up. You are now level 5." })).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Level 5");
  await expect(page.getByRole("status").filter({ hasText: "Level up" })).toHaveCount(0);
});

test("the year of activity is a named scroll region with a tooltip on every day", async ({ page }) => {
  await seed(page, lotsSeed());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/progress");
  const region = page.getByRole("region", { name: "Activity over the last year" });
  await expect(region).toBeVisible();
  const sizes = await region.evaluate((el) => ({ inner: el.scrollWidth, outer: el.clientWidth }));
  expect(sizes.inner).toBeGreaterThan(sizes.outer);
  await expect(region.locator("[title$='done']")).toHaveCount(364);
  await expect(region.locator("[title$='1 thing done']").first()).toBeAttached();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

for (const [name, values] of STATES) {
  test(`the progress page with ${name} has no sideways scroll at 390 and 320 and its controls are tappable`, async ({
    page,
  }) => {
    await seed(page, values());
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/progress");
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

test("nothing on the progress page is part-transparent at any scroll position with motion on", async ({ page }) => {
  await seed(page, lotsSeed());
  await page.goto("/progress");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
    const faint = await page.evaluate(() =>
      [...document.querySelectorAll("main *")]
        .filter((el) => {
          const style = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return (
            style.visibility !== "hidden" &&
            r.width > 0 &&
            r.height > 0 &&
            r.bottom > 0 &&
            r.top < innerHeight &&
            Number(style.opacity) < 1 &&
            !el.closest("[aria-hidden='true']")
          );
        })
        .map((el) => `${el.tagName} ${String(el.className).slice(0, 40)}`)
    );
    expect(faint, `at scroll ${y}`).toEqual([]);
  }
});
