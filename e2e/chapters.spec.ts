import { expect, test, type Page } from "@playwright/test";
import { GIT_CHAPTERS } from "../content/git-body";
import { chapters, notesHref } from "../lib/content";
import { topics } from "../lib/topics";

const WRITTEN_ROUTES = [
  ...topics()
    .filter((t) => t.id !== "interview")
    .flatMap((t) =>
      chapters(t.id)
        .filter((c) => c.ready)
        .map((c) => `${notesHref(t.id)}/${c.id}`)
    ),
  ...GIT_CHAPTERS.map((c) => `/git/${c.id}`),
];

const BATCH = 20;

const VERCEL_NOISE = /_vercel|vercel-scripts/i;

const SAMPLE = [
  "/notes/closures",
  "/notes/types-values",
  "/react/react-interview-bank",
  "/dsa/dsa-complexity-analysis",
  "/system-design/sysdes-walkthrough-simple",
  "/git/cheat",
  "/architecture/arch-build",
];

async function hydrated(page: Page) {
  await page.waitForFunction(() => {
    const body = document.querySelector(".prose");
    return Boolean(body && Object.keys(body).some((key) => key.startsWith("__react")));
  });
}

test.describe("every written chapter", () => {
  test("there are written chapters to crawl", () => {
    expect(WRITTEN_ROUTES.length).toBeGreaterThan(190);
  });

  for (let start = 0; start < WRITTEN_ROUTES.length; start += BATCH) {
    const routes = WRITTEN_ROUTES.slice(start, start + BATCH);
    test(`opens at 390 without overflow, clipped content, console errors or an empty body (${start + 1} to ${
      start + routes.length
    })`, async ({ page }) => {
      test.setTimeout(240_000);
      await page.setViewportSize({ width: 390, height: 844 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("console", (message) => {
        const text = message.text();
        if (message.type() === "error" && !text.startsWith("Failed to load resource") && !VERCEL_NOISE.test(text))
          errors.push(text);
      });
      page.on("response", (response) => {
        if (response.status() >= 400 && !response.url().includes("/_vercel/"))
          errors.push(`${response.status()} ${response.url()}`);
      });

      for (const route of routes) {
        errors.length = 0;
        await page.goto(route);
        await hydrated(page);
        const found = await page.evaluate(() => {
          const article = document.querySelector("article.chapter")!;
          const wide: string[] = [];
          const limit = window.innerWidth + 1;
          for (const el of article.querySelectorAll("*")) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.right <= limit) continue;
            let clipped = false;
            for (let up = el.parentElement; up && up !== article; up = up.parentElement) {
              if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(up).overflowX)) {
                clipped = true;
                break;
              }
            }
            if (!clipped) wide.push(`${el.tagName}.${String((el as HTMLElement).className).slice(0, 40)}`);
          }
          return {
            overflow: document.documentElement.scrollWidth - window.innerWidth,
            wide: wide.slice(0, 5),
            title: document.querySelector("h1")?.textContent?.trim().length ?? 0,
            words: (document.querySelector(".prose")?.textContent ?? "").trim().split(/\s+/).length,
            sections: document.querySelectorAll(".prose h3").length,
          };
        });
        expect(found.overflow, `${route}: page overflow`).toBeLessThanOrEqual(0);
        expect(found.wide, `${route}: content wider than the screen outside a scroll region`).toEqual([]);
        expect(found.title, `${route}: title`).toBeGreaterThan(0);
        expect(found.words, `${route}: body`).toBeGreaterThan(150);
        expect(found.sections, `${route}: sections`).toBeGreaterThan(0);
        expect(errors, `${route}: console errors`).toEqual([]);
      }
    });
  }
});

test("a chapter keeps balanced room under the header and a comfortable line length at every size", async ({ page }) => {
  const sizes = [
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 2560, height: 1440 },
    { width: 390, height: 844 },
  ];
  for (const size of sizes) {
    await page.setViewportSize(size);
    for (const path of ["/notes/closures", "/react/react-interview-bank"]) {
      await page.goto(path);
      await hydrated(page);
      await page.evaluate(() => document.fonts.ready);
      const label = `${path} at ${size.width}x${size.height}`;
      const m = await page.evaluate(() => {
        const header = document.querySelector("header")!.getBoundingClientRect().bottom;
        const hero = document.querySelector("article.chapter > header")!;
        let top = Infinity;
        for (const el of hero.querySelectorAll("*")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          top = Math.min(top, r.top);
        }
        const paragraph = document.querySelector(".prose > p")!;
        const style = getComputedStyle(paragraph);
        const sample = paragraph.textContent!.trim();
        const probe = document.createElement("span");
        probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:${style.font}`;
        probe.textContent = sample.slice(0, 120);
        document.body.appendChild(probe);
        const perChar = probe.getBoundingClientRect().width / Math.min(120, sample.length);
        probe.remove();
        return {
          gap: top - header,
          pWidth: paragraph.getBoundingClientRect().width,
          blockWidth: document.querySelector(".prose pre")!.getBoundingClientRect().width,
          width: paragraph.getBoundingClientRect().width,
          chars: paragraph.getBoundingClientRect().width / perChar,
          article: document.querySelector("article.chapter")!.getBoundingClientRect().width,
          font: parseFloat(style.fontSize),
        };
      });
      expect(m.gap, `${label}: gap under the header`).toBeGreaterThanOrEqual(size.width < 700 ? 24 : 40);
      expect(m.gap, `${label}: gap under the header`).toBeLessThanOrEqual(110);
      expect(m.chars, `${label}: characters per line`).toBeLessThanOrEqual(92);
      if (size.width >= 1280) expect(m.chars, `${label}: characters per line`).toBeGreaterThanOrEqual(60);
      expect(m.font, `${label}: body size`).toBeGreaterThanOrEqual(16);
      expect(m.article, `${label}: article width`).toBeLessThanOrEqual(945);
      expect(Math.abs(m.pWidth - m.article), `${label}: text and article share an edge`).toBeLessThanOrEqual(2);
      expect(Math.abs(m.blockWidth - m.article), `${label}: cards and article share an edge`).toBeLessThanOrEqual(2);
    }
  }
});

test("scrolling a long chapter with motion on never leaves text part-transparent", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const path of ["/notes/types-values", "/react/react-interview-bank"]) {
    await page.goto(path);
    await hydrated(page);
    await expect(page.locator("main [data-fx]"), path).toHaveCount(0);
    const faded = await page.evaluate(async () => {
      const found: string[] = [];
      const height = document.documentElement.scrollHeight;
      for (let y = 0; y < height; y += 700) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 40));
        for (const el of document.querySelectorAll("article.chapter, article.chapter *")) {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight || rect.width === 0) continue;
          let node: Element | null = el;
          while (node) {
            const style = getComputedStyle(node);
            if (
              Number(style.opacity) < 1 &&
              style.visibility !== "hidden" &&
              !node.matches(".off, .listenbtn:disabled")
            )
              found.push(`${el.tagName}.${String((el as HTMLElement).className).slice(0, 30)}@${y}`);
            node = node.parentElement;
          }
        }
      }
      return [...new Set(found)].slice(0, 8);
    });
    expect(faded, path).toEqual([]);
  }
});

test("the hero stage shows a read sticker once the chapter is read, and is gone on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/notes/closures");
  await hydrated(page);
  const stage = page.locator("article.chapter > header [class*='__heroStage']");
  await expect(stage).toBeVisible();
  await expect(stage).not.toContainText("read ✓");
  await page.getByRole("region", { name: "Finish" }).getByRole("button", { name: "Mark as read" }).click();
  await expect(stage).toContainText("read ✓");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(stage).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("the prose blocks of a heavy chapter stay inside their cards and keep working", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/notes/types-values");
  await hydrated(page);

  const sections = page.locator(".prose h3");
  expect(await sections.count()).toBeGreaterThan(8);
  await expect(sections.first()).toHaveCSS("counter-increment", "section 1");

  const code = page.locator(".prose pre").first();
  await expect(code.locator("xpath=..")).toHaveClass(/codeblock/);
  const pre = await code.evaluate((el) => {
    const cs = getComputedStyle(el, "::before");
    return { bar: cs.content, height: parseFloat(cs.height) };
  });
  expect(pre.height).toBeGreaterThan(30);

  const tryBlock = page.locator(".prose .try").first();
  await tryBlock.scrollIntoViewIfNeeded();
  const before = await tryBlock.boundingBox();
  await tryBlock.getByRole("button", { name: /Run this/ }).click();
  await expect(tryBlock.locator(".demo__term").first()).toBeVisible();
  const after = await tryBlock.boundingBox();
  expect(after!.height).toBeGreaterThan(before!.height);

  const copy = page.locator(".prose .codeblock__copy").first();
  await expect(copy).toBeVisible();

  for (const table of await page.locator(".prose .table-scroll").all()) {
    const fits = await table.evaluate((el) => el.getBoundingClientRect().right <= document.documentElement.clientWidth);
    expect(fits).toBe(true);
  }
});

test("a try-it block reserves room for its run button before the page hydrates", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/notes/closures", { waitUntil: "commit" });
  await page.waitForSelector(".prose .try");
  const boxes: number[] = [];
  const probe = async () => boxes.push((await page.locator(".prose .try").first().boundingBox())!.height);
  await probe();
  await hydrated(page);
  await page.locator(".prose .try__run").first().waitFor();
  await probe();
  expect(Math.abs(boxes[1] - boxes[0])).toBeLessThanOrEqual(1);
});

test("a wide diagram scrolls inside its card on a phone and the page does not", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of SAMPLE.slice(3, 4)) {
    await page.goto(path);
    await hydrated(page);
    const figure = page.locator(".prose figure").first();
    await figure.scrollIntoViewIfNeeded();
    await expect(figure).toHaveAttribute("role", "region");
    expect(await figure.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  }
});

test("an outline chapter uses the same page and says it is not written yet", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/typescript/ts-setup-compiler");
  await expect(
    page.locator("article.chapter > header [class*='__heroStage'] [data-card][data-tone='draft']")
  ).toBeVisible();
  await expect(page.getByText("Not written yet.")).toBeVisible();
  await expect(page.locator("article.chapter")).toBeVisible();
});
