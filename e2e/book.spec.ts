import { expect, test, type Page } from "@playwright/test";
import { bookRounds, PARTS } from "../lib/interviewBook";
import { ARCH_PARTS } from "../lib/architectureParts";

const rounds = bookRounds();

const SIZES = [
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const PROGRESS = {
  chapters: { scout: { at: 1760000000000, reviews: 0 }, r1: { at: 1760000000000, reviews: 0 } },
  exercises: {},
};

async function noOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, `${label}: horizontal overflow`).toBeLessThanOrEqual(0);
}

async function stageOverlaps(page: Page) {
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll("[data-stage] [data-card]")].map((el) => {
      const r = el.getBoundingClientRect();
      return { name: el.getAttribute("aria-label") ?? el.className, r };
    });
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

test("the interview landing puts every round on one of the book's trails, with its numbers from the data", async ({
  page,
}) => {
  await page.goto("/interview");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("From the first call to the offer");
  let total = 0;
  for (const part of PARTS) {
    const count = rounds.filter((r) => r.part === part.id).length;
    total += count;
    await expect(page.getByRole("list", { name: `${part.title}: every round` }).getByRole("listitem")).toHaveCount(
      count
    );
  }
  expect(total).toBe(rounds.length);
  await expect(page.getByText(`${rounds.length} rounds`, { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /^Browse all \d+ questions/ })).toHaveAttribute(
    "href",
    "/interview/questions"
  );
  await expect(page.locator("main [data-fx]")).toHaveCount(0);
});

test("the question of the day reveals in place, and no stage card covers another at common sizes", async ({ page }) => {
  for (const size of SIZES) {
    await page.setViewportSize(size);
    await page.goto("/interview");
    const daily = page.getByRole("complementary", { name: "Question of the day" });
    await expect(daily).toBeVisible();
    const before = await daily.boundingBox();
    expect(await stageOverlaps(page), `${size.width}x${size.height} before`).toEqual([]);
    await page.getByRole("button", { name: /reveal what they test/ }).click();
    await expect(page.getByText("What they are really testing:")).toBeVisible();
    const after = await daily.boundingBox();
    expect(Math.abs((after?.height ?? 0) - (before?.height ?? 0)), `${size.width}x${size.height} height`).toBeLessThan(
      2
    );
    expect(await stageOverlaps(page), `${size.width}x${size.height} after`).toEqual([]);
  }
});

test("the interview landing never shows the wrong label or question before hydration finishes", async ({ page }) => {
  await page.addInitScript((progress) => {
    localStorage.setItem("jsnotes:progress", JSON.stringify(progress));
    const seen = { start: [] as string[], questions: new Set<string>() };
    (window as unknown as { __seen: typeof seen }).__seen = seen;
    const tick = () => {
      for (const a of document.querySelectorAll("main a")) {
        if (/Start the book/.test(a.textContent ?? "") && getComputedStyle(a).visibility !== "hidden")
          seen.start.push(
            `${Math.round(performance.now())} js=${document.documentElement.hasAttribute("data-js")} ${a.closest("div")?.className}`
          );
      }
      const card = document.querySelector("[aria-label='Question of the day'] p:nth-of-type(2)");
      const wrap = card?.closest("[class*='dailyBody']");
      if (card && wrap && getComputedStyle(wrap).visibility !== "hidden") seen.questions.add(card.textContent ?? "");
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, PROGRESS);
  await page.goto("/interview");
  await expect(page.getByRole("link", { name: /^Continue: / })).toBeVisible();
  await page.waitForTimeout(600);
  const seen = await page.evaluate(() => {
    const s = (window as unknown as { __seen: { start: string[]; questions: Set<string> } }).__seen;
    return { start: s.start, questions: [...s.questions] };
  });
  expect(seen.start, "frames that showed the new-reader label").toEqual([]);
  expect(seen.questions.length, "different questions shown").toBeLessThanOrEqual(1);
});

test("the interview landing's trails mark what is read and where to pick up", async ({ page }) => {
  await page.addInitScript((progress) => localStorage.setItem("jsnotes:progress", JSON.stringify(progress)), PROGRESS);
  await page.goto("/interview");
  const part = page.getByRole("list", { name: `${PARTS[0].title}: every round` });
  await expect(part.locator("li[data-state='done']")).toHaveCount(2);
  await expect(part.locator("li[data-state='next']")).toHaveCount(1);
  await expect(page.getByText("2 / 5 read")).toBeVisible();
});

test("a round reads like a chapter: rounds rail, this-round aside, hero, glance and next stop", async ({ page }) => {
  await page.goto("/interview/r3");
  const rail = page.getByRole("navigation", { name: "Rounds" });
  await expect(rail.locator("a[aria-current=page]")).toContainText("JavaScript & TS");
  await expect(page.getByRole("complementary", { name: "In this round" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("JavaScript");
  await expect(page.getByRole("region", { name: "This round at a glance" })).toContainText("Decides");
  await expect(page.locator("section[id^='r3-']").first().getByRole("heading", { level: 2 })).toBeVisible();
  await expect(page.locator("main [data-fx]")).toHaveCount(0);

  const finish = page.getByRole("region", { name: "Finish" });
  await finish.getByRole("button", { name: "Mark as read" }).click();
  await expect(finish.getByText("Round read")).toBeVisible();
  await expect(rail.locator("a[aria-current=page]")).toContainText("✓");
  await page.reload();
  await expect(page.getByRole("region", { name: "Finish" }).getByText("Round read")).toBeVisible();

  const pager = page.getByRole("navigation", { name: "Rounds" }).last();
  await expect(pager.getByRole("link", { name: /^Next/ })).toHaveAttribute("href", "/interview/r3ts");
  await page.getByRole("heading", { level: 1 }).click();
  await page.keyboard.press("]");
  await page.waitForURL("**/interview/r3ts");
});

test("the first and the last round close the trail without a broken link", async ({ page }) => {
  await page.goto(`/interview/${rounds[0].id}`);
  await expect(page.getByRole("link", { name: /^Back to/ })).toHaveAttribute("href", "/interview");
  await page.goto(`/interview/${rounds[rounds.length - 1].id}`);
  await expect(page.getByRole("link", { name: /^The end/ })).toHaveAttribute("href", "/interview");
});

test("a round keeps its marks, shows them in the aside, and clears them", async ({ page }) => {
  await page.goto("/interview/r1");
  const first = page.locator("section[id^='r1-']").first();
  await first.getByRole("button", { name: "Knew it" }).click();
  await expect(first.getByRole("button", { name: "Knew it" })).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("complementary", { name: "In this round" }).getByRole("img", { name: "knew it" })
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Clear my marks" }).click();
  await expect(first.getByRole("button", { name: "Knew it" })).toHaveAttribute("aria-pressed", "false");
});

test("practice mode hides the answers on a round but keeps the follow-ups", async ({ page }) => {
  await page.goto("/interview/r3");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const first = page.locator("section[id^='r3-']").first();
  await expect(first.getByText("Say your answer out loud first")).toBeVisible();
  await expect(first.getByText("They will push with")).toBeVisible();
  await expect(first.getByText("The answer that loses the room")).toHaveCount(0);
  await first.getByRole("button", { name: "Show the answer" }).click();
  await expect(first.getByText("The answer that loses the room")).toBeVisible();
});

test("the question bank filters, shows an honest empty state and keeps its drill", async ({ page }) => {
  await page.goto("/interview/questions");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Every question");
  const search = page.getByRole("searchbox", { name: "Search questions" });
  await search.fill("xylophone");
  await expect(page.getByText("Nothing matches")).toBeVisible();
  await page.getByRole("button", { name: "Clear the filters" }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByText("Nothing matches")).toHaveCount(0);

  await page.getByRole("button", { name: "Has a trap" }).click();
  await expect(page.getByRole("button", { name: "Has a trap" })).toHaveAttribute("aria-pressed", "true");
  const items = page.locator("main ol li > button");
  const trapped = await items.count();
  expect(trapped).toBeGreaterThan(5);
  await items.first().click();
  await expect(items.first()).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("group", { name: "Mark this question" })).toBeVisible();
});

test("the question bank and the landing agree on the totals", async ({ page }) => {
  await page.goto("/interview");
  const label = await page.getByRole("link", { name: /^Browse all \d+ questions/ }).textContent();
  const total = Number(/(\d+)/.exec(label ?? "")?.[1]);
  await page.goto("/interview/questions");
  await expect(page.getByText(new RegExp(`${total} in all`)).first()).toBeVisible();
});

test("the interview and architecture pages stay inside the phone and keep 44px targets", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/interview", "/interview/questions", "/interview/r3", "/interview/r1", "/architecture"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noOverflow(page, path);
    const small = await page.evaluate(() => {
      const found: string[] = [];
      const targets = document.querySelectorAll(
        "main button, main a.btn, main [class*='__toggle'], main [class*='__primary'], main [class*='__confRow'] button"
      );
      for (const el of targets) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.height < 43.5) found.push(`${el.textContent?.trim().slice(0, 30)} ${Math.round(r.height)}`);
      }
      return found;
    });
    expect(small, `${path}: targets under 44px`).toEqual([]);
  }
});

test("every round and both landings load at 390 and 320 with no overflow and no console error", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (text.startsWith("Failed to load resource") || /_vercel|vercel-scripts/i.test(text)) return;
    problems.push(text.slice(0, 200));
  });
  page.on("pageerror", (err) => problems.push(err.message));
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    for (const path of [
      "/interview",
      "/interview/questions",
      "/architecture",
      ...rounds.map((r) => `/interview/${r.id}`),
    ]) {
      await page.goto(path);
      await expect(page.locator("main h1")).toHaveCount(1);
      await noOverflow(page, `${path} at ${width}`);
    }
  }
  expect(problems).toEqual([]);
});

test("the architecture landing is a hero, the measured numbers, one page of boxes and three trails", async ({
  page,
}) => {
  await page.goto("/architecture");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("How this site is built");
  await expect(page.getByRole("region", { name: "Measured at build time" }).getByRole("term")).toHaveCount(8);
  await expect(page.locator("main [data-fx]")).toHaveCount(0);
  let chapters = 0;
  for (const part of ARCH_PARTS) {
    const list = page.getByRole("list", { name: `${part.title}: every chapter` });
    const count = await list.getByRole("listitem").count();
    expect(count, part.title).toBeGreaterThan(0);
    chapters += count;
  }
  await expect(page.getByText(`${chapters} chapters`, { exact: true }).first()).toBeVisible();
  expect(await stageOverlaps(page)).toEqual([]);
});

test("the architecture hero stage keeps its cards apart at common sizes", async ({ page }) => {
  for (const size of SIZES) {
    await page.setViewportSize(size);
    await page.goto("/architecture");
    await expect(page.locator("[data-stage]").first()).toBeVisible();
    expect(await stageOverlaps(page), `${size.width}x${size.height}`).toEqual([]);
  }
});

test("the interview and architecture pages never leave content part-transparent while scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const path of ["/interview", "/interview/questions", "/architecture", "/interview/r1"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }), path).toBeVisible();
    const faded = await page.evaluate(async () => {
      const found: string[] = [];
      const height = document.documentElement.scrollHeight;
      for (let y = 0; y < Math.min(height, 12000); y += 500) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 60));
        for (const el of document.querySelectorAll("main h2, main li, main p, main section")) {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
          if (Number(getComputedStyle(el).opacity) < 1) found.push(el.tagName + "@" + y);
        }
      }
      return found;
    });
    expect(faded, path).toEqual([]);
  }
});

test("a round's wide code scrolls inside its own region and keeps the page still", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/interview/r7");
  await noOverflow(page, "r7");
  await expect(page.getByRole("region", { name: /^Code: / }).first()).toBeAttached();
});
