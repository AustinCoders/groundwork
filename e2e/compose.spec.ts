import { expect, test, type Page } from "@playwright/test";
import { FONT_ITEMS, type FontValue, type ThemeValue } from "../lib/storage";
import { probeComposition } from "./composeProbe";
import { failToLoad } from "./failToLoad";
import { THEMES } from "./themes";

const PAGES = [
  "/progress",
  "/review",
  "/problems",
  "/mock",
  "/interview",
  "/interview/questions",
  "/architecture",
  "/level/js",
  "/path/js/beginner",
  "/dsa",
  "/go",
  "/git",
  "/privacy",
  "/no-such-page",
  "/notes/closures",
];

const DESKTOP = [
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
];

const TABLET = { width: 900, height: 1000 };

const PHONES = [
  { width: 390, height: 844 },
  { width: 320, height: 700 },
];

async function wear(page: Page, theme: ThemeValue, font: FontValue, busy: boolean) {
  await page.addInitScript(
    ([themeValue, fontValue, active]) => {
      localStorage.setItem("jsnotes:theme", JSON.stringify(themeValue));
      localStorage.setItem("jsnotes:font", JSON.stringify(fontValue));
      if (!active || sessionStorage.getItem("seeded")) return;
      sessionStorage.setItem("seeded", "1");
      const now = Date.now();
      const mark = (days: number, reviews: number) => ({ at: now - days * 86_400_000, reviews });
      const chapters = {
        closures: mark(5, 0),
        scope: mark(9, 1),
        "this-keyword": mark(3.2, 0),
        "setup-mental-model": mark(31, 2),
        "var-let-const": mark(1, 0),
      };
      const log: Record<string, number> = {};
      for (let ago = 0; ago < 4; ago++) {
        const date = new Date(now - ago * 86_400_000);
        const key = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
          .map((part) => String(part).padStart(2, "0"))
          .join("-");
        log[key] = 3;
      }
      localStorage.setItem("jsnotes:progress", JSON.stringify({ chapters, exercises: { "two-sum": true } }));
      localStorage.setItem("jsnotes:activity", JSON.stringify(log));
      localStorage.setItem("groundwork:interview:confidence", JSON.stringify({ "r3-1": "knew", "r3-2": "shaky" }));
    },
    [theme, font, busy] as const
  );
}

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    () => ![...document.querySelectorAll("[data-stage] *")].some((el) => getComputedStyle(el).visibility === "hidden")
  );
  await page.waitForTimeout(150);
}

async function composed(page: Page, path: string) {
  await page.goto(path);
  if (path.startsWith("/notes/") && page.viewportSize()!.width <= 640) return [];
  await expect(page.locator("[data-stage][data-layout]").first()).toBeVisible();
  await settle(page);
  return page.evaluate(probeComposition);
}

test("every hero stage is composed from slots, tilts, tape, stickers and attached notes at desktop sizes", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await wear(page, "dark", "classic", true);
  const problems: string[] = [];
  for (const size of DESKTOP) {
    await page.setViewportSize(size);
    for (const path of PAGES) {
      const found = await composed(page, path);
      problems.push(...found.map((line) => `${size.width}x${size.height} ${line}`));
    }
  }
  expect(problems).toEqual([]);
});

test("every hero stage keeps its rules in the light theme, on a tablet and on phones", async ({ page }) => {
  test.setTimeout(240_000);
  await wear(page, "light", "classic", true);
  const problems: string[] = [];
  for (const size of [TABLET, ...PHONES]) {
    await page.setViewportSize(size);
    for (const path of PAGES) {
      const found = await composed(page, path);
      problems.push(...found.map((line) => `${size.width}x${size.height} ${line}`));
    }
  }
  expect(problems).toEqual([]);
});

test("the stages hold their rules in all nine themes", async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const problems: string[] = [];
  for (const theme of THEMES) {
    await page.addInitScript((value) => localStorage.setItem("jsnotes:theme", JSON.stringify(value)), theme);
    for (const path of ["/progress", "/mock", "/architecture", "/level/js", "/git", "/no-such-page"]) {
      const found = await composed(page, path);
      problems.push(...found.map((line) => `${theme} ${line}`));
    }
  }
  expect(problems).toEqual([]);
});

test("the stages hold their rules in every font", async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const problems: string[] = [];
  for (const { value } of FONT_ITEMS) {
    await page.addInitScript((font) => localStorage.setItem("jsnotes:font", JSON.stringify(font)), value);
    for (const path of [
      "/progress",
      "/review",
      "/mock",
      "/architecture",
      "/level/js",
      "/path/js/beginner",
      "/git",
      "/no-such-page",
    ]) {
      const found = await composed(page, path);
      problems.push(...found.map((line) => `${value} ${line}`));
    }
  }
  expect(problems).toEqual([]);
});

test("nothing pokes past the right edge of a phone in any font", async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 390, height: 844 });
  const problems: string[] = [];
  for (const { value } of FONT_ITEMS) {
    await page.addInitScript((font) => localStorage.setItem("jsnotes:font", JSON.stringify(font)), value);
    for (const path of ["/notes", "/dsa", "/react", "/git", "/level/js", "/interview", "/architecture"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const poking = await page.evaluate(() => {
        const edge = innerWidth + 1;
        const scrolls = (el: Element) => {
          for (let up = el.parentElement; up; up = up.parentElement)
            if (/(auto|scroll)/.test(getComputedStyle(up).overflowX)) return true;
          return false;
        };
        return [...document.body.querySelectorAll("*")]
          .filter((el) => {
            const box = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return (
              box.width > 1 &&
              box.right > edge &&
              style.position !== "fixed" &&
              style.visibility !== "hidden" &&
              !el.closest("svg") &&
              !scrolls(el)
            );
          })
          .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}`)
          .slice(0, 4);
      });
      problems.push(...poking.map((line) => `${value} ${path} ${line}`));
    }
  }
  expect(problems).toEqual([]);
});

test("a highlight is an underline stroke that keeps the text readable in every theme", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const bad: string[] = [];
  for (const theme of THEMES) {
    await page.addInitScript((value) => localStorage.setItem("jsnotes:theme", JSON.stringify(value)), theme);
    await page.goto("/mock");
    await expect(page.locator("[data-stage]").first()).toBeVisible();
    const m = await page.evaluate(() => {
      const mark = document.querySelector<HTMLElement>("[data-stage] [class*='highlight']");
      if (!mark) return null;
      const style = getComputedStyle(mark);
      const channels = (value: string) => (value.match(/-?[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const scale = (value: string) => (value.startsWith("color(") ? 255 : 1);
      const image = style.backgroundImage.match(/(rgba?\([^)]*\)|color\([^)]*\))/)?.[0] ?? "";
      const [h] = style.backgroundSize.split(" ").slice(1).map(parseFloat);
      const sheet = getComputedStyle(mark.closest("[data-card]")!).backgroundColor;
      return {
        stroke: channels(image).map((n) => n * scale(image)),
        ink: channels(style.color).map((n) => n * scale(style.color)),
        sheet: channels(sheet).map((n) => n * scale(sheet)),
        height: h,
        fontSize: parseFloat(style.fontSize),
      };
    });
    if (!m) {
      bad.push(`${theme}: no highlight on the page`);
      continue;
    }
    const lum = ([r, g, b]: number[]) => {
      const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    };
    const ratio = (a: number[], b: number[]) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    if (ratio(m.ink, m.stroke) < 4.5)
      bad.push(`${theme}: text on the stroke is ${ratio(m.ink, m.stroke).toFixed(2)}:1`);
    if (!(m.height <= m.fontSize * 0.4)) bad.push(`${theme}: the highlight is a ${m.height}px band, not a stroke`);
  }
  expect(bad).toEqual([]);
});

test("tape is neutral in the dark themes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const theme of THEMES.filter((value) => ["dark", "blueprint", "rose"].includes(value))) {
    await page.addInitScript((value) => localStorage.setItem("jsnotes:theme", JSON.stringify(value)), theme);
    await page.goto("/progress");
    await expect(page.locator("[data-tape]").first()).toBeVisible();
    const colour = await page
      .locator("[data-tape]")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const [r, g, b] = (colour.match(/-?[\d.]+/g) ?? []).slice(0, 3).map(Number);
    expect((r + g) / 2 - b, `${theme} tape ${colour}`).toBeLessThan(30);
  }
});

test("the numbers cards are real tables on every page that has one", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await wear(page, "dark", "classic", true);
  for (const path of ["/progress", "/review", "/problems", "/interview", "/path/js/beginner", "/level/js", "/git"]) {
    await page.goto(path);
    await settle(page);
    const tables = await page.locator("[data-stage] [data-facts]").count();
    expect(tables, path).toBeGreaterThan(0);
    const found = await page.evaluate(probeComposition);
    expect(
      found.filter((line) => /figure/.test(line)),
      path
    ).toEqual([]);
  }
});

test("the hero stages draw no old absolute offsets", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of PAGES.filter((value) => value !== "/notes/closures")) {
    await page.goto(path);
    await expect(page.locator("[data-stage][data-layout]").first()).toBeVisible();
    const offsets = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("[data-stage][data-layout] > [data-card]")]
        .filter((el) => getComputedStyle(el).position === "absolute")
        .map((el) => el.className)
    );
    expect(offsets, path).toEqual([]);
  }
});

test("the error scene keeps the stage rules at desktop, tablet and phone sizes in Night and light", async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(180_000);
  const problems: string[] = [];
  for (const theme of ["dark", "light"] as const) {
    for (const size of [...DESKTOP, TABLET, ...PHONES]) {
      const context = await browser.newContext({ viewport: size, baseURL });
      const page = await context.newPage();
      await wear(page, theme, "classic", false);
      await failToLoad(page);
      await expect(page.locator("[data-stage][data-layout]").first()).toBeVisible();
      await settle(page);
      const found = await page.evaluate(probeComposition);
      problems.push(...found.map((line) => `${theme} ${size.width}x${size.height} ${line}`));
      await context.close();
    }
  }
  expect(problems).toEqual([]);
});
