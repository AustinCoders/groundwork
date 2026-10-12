import { expect, test, type Locator, type Page } from "@playwright/test";
import { FONT_ITEMS } from "../lib/storage";
import { probeComposition } from "./composeProbe";

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { tourAnimations: () => Animation[] }).tourAnimations = () =>
      document
        .getAnimations()
        .filter((a) => (a.effect as KeyframeEffect | null)?.target?.closest("[data-tour-dialog], [data-tour-prompt]"));
  });
});

const KEY = "groundwork:tour";
const STEPS = ["Topics and levels", "Chapters", "Practice", "Interview book and mock", "Review, progress and the Menu"];
const SEEN = JSON.stringify({ v: 1, seen: true, at: 1 });

const prompt = (page: Page) => page.getByRole("region", { name: "First visit tour" });
const dialog = (page: Page) => page.getByRole("dialog", { name: "Tour of Groundwork" });
const stored = (page: Page) => page.evaluate((key) => localStorage.getItem(key), KEY);
const menuPill = (page: Page) => page.locator("button[data-menu-button]").first();
const status = (page: Page) => dialog(page).getByRole("status");

async function afterTheDelay(page: Page) {
  await page.waitForTimeout(3400);
}

async function settled(page: Page) {
  await page.waitForFunction(() =>
    (window as unknown as { tourAnimations: () => Animation[] })
      .tourAnimations()
      .every((a) => a.playState !== "running")
  );
}

async function startFromPrompt(page: Page, path = "/") {
  await page.goto(path);
  await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Start the tour" }).click();
  await expect(dialog(page)).toBeVisible();
}

async function goToStep(page: Page, step: number) {
  for (let at = 0; at < step; at++) await page.keyboard.press("ArrowRight");
  await expect(status(page)).toHaveText(`Step ${step + 1} of 5: ${STEPS[step]}`);
}

async function inside(locator: Locator, page: Page) {
  const box = await locator.boundingBox();
  const size = page.viewportSize()!;
  expect(box, "the element has a box").not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-0.5);
  expect(box!.y).toBeGreaterThanOrEqual(-0.5);
  expect(box!.x + box!.width).toBeLessThanOrEqual(size.width + 0.5);
  expect(box!.y + box!.height).toBeLessThanOrEqual(size.height + 0.5);
}

test.describe("the first visit", () => {
  test("shows the prompt only after the page has loaded, and shifts nothing", async ({ page }) => {
    const html = await (await page.request.get("/")).text();
    expect(html).not.toContain("First time here");
    expect(html).not.toContain("Take a 30-second tour");

    await page.addInitScript(() => {
      const target = window as unknown as { shiftsAfterPrompt: number };
      target.shiftsAfterPrompt = 0;
      let appeared = Number.POSITIVE_INFINITY;
      new MutationObserver(() => {
        if (document.querySelector("[data-tour-prompt]") && appeared === Number.POSITIVE_INFINITY)
          appeared = performance.now();
      }).observe(document, { childList: true, subtree: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as {
          value: number;
          startTime: number;
          hadRecentInput: boolean;
        }[])
          if (!entry.hadRecentInput && entry.startTime >= appeared) target.shiftsAfterPrompt += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/");
    await expect(prompt(page)).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
    await settled(page);
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => (window as unknown as { shiftsAfterPrompt: number }).shiftsAfterPrompt)).toBe(0);
    await expect(prompt(page)).toHaveCSS("position", "fixed");
    await expect(prompt(page)).toContainText("First time here?");
    await expect(prompt(page)).toContainText("30-second tour");
  });

  test("does not take focus from the page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).first().focus();
    await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
    await expect(menuPill(page)).toBeFocused();
    await expect(prompt(page)).not.toHaveAttribute("aria-modal", "true");
  });

  test("loads the tour code after the load event, not before", async ({ page }) => {
    const before: string[] = [];
    const after: string[] = [];
    let loaded = false;
    page.on("load", () => (loaded = true));
    page.on("request", (request) => {
      if (request.resourceType() !== "script" || !request.url().includes("/_next/static/")) return;
      (loaded ? after : before).push(request.url());
    });
    await page.goto("/");
    await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
    expect(after.filter((url) => !before.includes(url)).length).toBeGreaterThan(0);
  });

  test("the page works while the prompt is waiting", async ({ page }) => {
    await page.goto("/");
    await menuPill(page).click();
    await expect(page.getByRole("dialog", { name: /menu/i })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: /menu/i })).toHaveCount(0);
  });

  test("Skip closes it and remembers, so a reload shows nothing", async ({ page }) => {
    await page.goto("/");
    await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
    await prompt(page).getByRole("button", { name: "Skip the tour" }).click();
    await expect(prompt(page)).toHaveCount(0);
    const saved = JSON.parse((await stored(page))!);
    expect(saved).toMatchObject({ v: 1, seen: true });
    expect(typeof saved.at).toBe("number");
    await page.reload();
    await afterTheDelay(page);
    await expect(prompt(page)).toHaveCount(0);
  });

  test("Escape closes it and remembers", async ({ page }) => {
    await page.goto("/");
    await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
    await page.keyboard.press("Escape");
    await expect(prompt(page)).toHaveCount(0);
    expect(JSON.parse((await stored(page))!)).toMatchObject({ v: 1, seen: true });
    await page.reload();
    await afterTheDelay(page);
    await expect(prompt(page)).toHaveCount(0);
  });

  test("Escape in a text field leaves the prompt alone", async ({ page }) => {
    await page.goto("/");
    await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
    await page.locator("#try-code").focus();
    await page.keyboard.press("Escape");
    await expect(prompt(page)).toBeVisible();
    expect(await stored(page)).toBeNull();
  });

  test("a returning visitor sees nothing", async ({ page }) => {
    await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [KEY, SEEN]);
    await page.goto("/");
    await afterTheDelay(page);
    await expect(prompt(page)).toHaveCount(0);
  });

  for (const bad of ["garbage", '{"v":2,"seen":true,"at":1}', '{"v":1,"seen":false,"at":1}', "[]", "null"]) {
    test(`a saved value of ${bad} counts as not seen`, async ({ page }) => {
      await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [KEY, bad]);
      await page.goto("/");
      await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
    });
  }

  test("with storage blocked it shows at most once per page load", async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new Error("blocked");
      };
    });
    await page.goto("/");
    await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
    await prompt(page).getByRole("button", { name: "Skip the tour" }).click();
    await expect(prompt(page)).toHaveCount(0);
    await page.evaluate(() =>
      (window as unknown as { next: { router: { push: (to: string) => void } } }).next.router.push("/level/js")
    );
    await expect(page).toHaveURL(/\/level\/js$/);
    await afterTheDelay(page);
    await expect(prompt(page)).toHaveCount(0);
  });

  test("going to a chapter while the prompt waits takes it away", async ({ page }) => {
    await page.goto("/");
    await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
    await page.evaluate(() =>
      (window as unknown as { next: { router: { push: (to: string) => void } } }).next.router.push(
        "/notes/setup-mental-model"
      )
    );
    await expect(page).toHaveURL(/setup-mental-model$/);
    await expect(prompt(page)).toHaveCount(0);
    expect(await stored(page)).toBeNull();
  });

  test("without JavaScript the page is the same and nothing appears", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL: baseURL! });
    const page = await context.newPage();
    await page.goto("/");
    await afterTheDelay(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(prompt(page)).toHaveCount(0);
    await context.close();
  });
});

test.describe("where it shows", () => {
  for (const path of ["/", "/notes", "/react", "/dsa", "/git", "/level/js", "/level/react", "/path/js/beginner"]) {
    test(`${path} offers the tour to a first visit`, async ({ page }) => {
      await page.goto(path);
      await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
    });
  }

  for (const path of [
    "/notes/setup-mental-model",
    "/react/react-components",
    "/dsa/dsa-hashing",
    "/problems/ex-accounts-merge",
    "/problems",
    "/practice?id=free",
    "/mock",
    "/whiteboard",
    "/review",
    "/progress",
    "/interview",
    "/interview/r1oa",
    "/architecture",
    "/privacy",
  ]) {
    test(`${path} shows nothing to a first visit`, async ({ page }) => {
      await page.goto(path);
      await afterTheDelay(page);
      await expect(prompt(page)).toHaveCount(0);
      await expect(dialog(page)).toHaveCount(0);
      expect(await stored(page)).toBeNull();
    });
  }
});

test.describe("the tour", () => {
  test("opens from the prompt on slide 1 with focus on Next", async ({ page }) => {
    await startFromPrompt(page);
    await expect(prompt(page)).toHaveCount(0);
    await expect(dialog(page)).toHaveAttribute("aria-modal", "true");
    await expect(dialog(page).getByRole("heading", { level: 2 })).toHaveText(
      "Pick a topic, then say how much you know."
    );
    await expect(dialog(page).getByRole("button", { name: "Next" })).toBeFocused();
    await expect(dialog(page).getByRole("button", { name: "Skip tour" })).toBeVisible();
    await expect(dialog(page).getByRole("button", { name: "Back" })).toBeDisabled();
    await expect(status(page)).toHaveText("Step 1 of 5: Topics and levels");
  });

  test("shows one slide at a time, with real text on each", async ({ page }) => {
    await startFromPrompt(page);
    for (let step = 0; step < STEPS.length; step++) {
      if (step > 0) await page.keyboard.press("ArrowRight");
      await expect(status(page)).toHaveText(`Step ${step + 1} of 5: ${STEPS[step]}`);
      await expect(dialog(page).locator("[data-tour-stage]")).toHaveCount(1);
      await expect(dialog(page).locator("[data-stage]")).toHaveCount(1);
      await expect(dialog(page).getByRole("heading", { level: 2 })).toHaveCount(1);
      const copy = await dialog(page).locator("h2 + p").innerText();
      expect(copy.length).toBeGreaterThan(60);
    }
    await expect(dialog(page).getByRole("button", { name: "Done" })).toBeVisible();
    await expect(dialog(page).getByText("The Menu is always in the header")).toBeVisible();
    await expect(dialog(page).getByText("Ctrl or Cmd plus K")).toBeVisible();
  });

  test("arrow keys and the buttons move through the slides", async ({ page }) => {
    await startFromPrompt(page);
    await page.keyboard.press("ArrowRight");
    await expect(status(page)).toHaveText("Step 2 of 5: Chapters");
    await dialog(page).getByRole("button", { name: "Next" }).click();
    await expect(status(page)).toHaveText("Step 3 of 5: Practice");
    await dialog(page).getByRole("button", { name: "Back" }).click();
    await expect(status(page)).toHaveText("Step 2 of 5: Chapters");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(status(page)).toHaveText("Step 1 of 5: Topics and levels");
    for (let press = 0; press < 8; press++) await page.keyboard.press("ArrowRight");
    await expect(status(page)).toHaveText("Step 5 of 5: Review, progress and the Menu");
    await expect(dialog(page)).toBeVisible();
  });

  test("keeps focus inside the dialog, however far you Tab", async ({ page }) => {
    await startFromPrompt(page);
    for (let press = 0; press < 12; press++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest("[data-tour-dialog]"))).toBe(true);
    }
    for (let press = 0; press < 12; press++) {
      await page.keyboard.press("Shift+Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest("[data-tour-dialog]"))).toBe(true);
    }
  });

  test("Skip tour at any slide closes it, remembers it and returns focus to the Menu", async ({ page }) => {
    await startFromPrompt(page);
    await goToStep(page, 2);
    await dialog(page).getByRole("button", { name: "Skip tour" }).click();
    await expect(dialog(page)).toHaveCount(0);
    expect(JSON.parse((await stored(page))!)).toMatchObject({ v: 1, seen: true });
    await expect(menuPill(page)).toBeFocused();
    await page.reload();
    await afterTheDelay(page);
    await expect(prompt(page)).toHaveCount(0);
  });

  test("Escape closes it and clicking outside it closes it too", async ({ page }) => {
    await startFromPrompt(page);
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toHaveCount(0);
    await expect(menuPill(page)).toBeFocused();
    await page.evaluate((key) => localStorage.removeItem(key), KEY);
    await page.goto("/react");
    await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "Start the tour" }).click();
    await expect(dialog(page)).toBeVisible();
    await page.mouse.click(4, 4);
    await expect(dialog(page)).toHaveCount(0);
  });

  test("finishing stores the flag, closes and puts focus on the Menu", async ({ page }) => {
    await startFromPrompt(page);
    await goToStep(page, 4);
    await page.getByRole("button", { name: "Done" }).click();
    await expect(dialog(page)).toHaveCount(0);
    expect(JSON.parse((await stored(page))!)).toMatchObject({ v: 1, seen: true });
    await expect(menuPill(page)).toBeFocused();
  });

  test("a slide's action goes there and remembers the tour", async ({ page }) => {
    await startFromPrompt(page);
    await goToStep(page, 2);
    await dialog(page)
      .getByRole("link", { name: /Open the playground/ })
      .click();
    await expect(page).toHaveURL(/\/practice\?id=free/);
    await expect(dialog(page)).toHaveCount(0);
    expect(JSON.parse((await stored(page))!)).toMatchObject({ v: 1, seen: true });
  });

  test("works from the keyboard alone, start to finish", async ({ page }) => {
    await page.goto("/");
    await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "Start the tour" }).focus();
    await page.keyboard.press("Enter");
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page).getByRole("button", { name: "Next" })).toBeFocused();
    for (let step = 0; step < 4; step++) await page.keyboard.press("Enter");
    await expect(status(page)).toHaveText("Step 5 of 5: Review, progress and the Menu");
    await expect(dialog(page).getByRole("button", { name: "Done" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog(page)).toHaveCount(0);
    await expect(menuPill(page)).toBeFocused();
  });

  test("does not let the Menu shortcut open a second dialog", async ({ page }) => {
    await startFromPrompt(page);
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog", { name: /menu/i })).toHaveCount(0);
    await expect(dialog(page)).toBeVisible();
  });
});

test.describe("the way back from the Menu", () => {
  for (const path of ["/", "/notes/setup-mental-model", "/problems", "/react"]) {
    test(`Take the tour opens it from ${path}, though it was seen`, async ({ page }) => {
      await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [KEY, SEEN]);
      await page.goto(path);
      await menuPill(page).click();
      const drawer = page.getByRole("dialog", { name: /menu/i });
      await drawer.getByRole("button", { name: "Take the tour" }).click();
      await expect(drawer).toHaveCount(0);
      await expect(dialog(page)).toBeVisible();
      await expect(status(page)).toHaveText("Step 1 of 5: Topics and levels");
      await page.keyboard.press("Escape");
      await expect(dialog(page)).toHaveCount(0);
      await expect(menuPill(page)).toBeFocused();
    });
  }
});

test.describe("motion", () => {
  test("every animation is finite, and the cards come to rest flat", async ({ page }) => {
    await startFromPrompt(page);
    for (let step = 0; step < STEPS.length; step++) {
      if (step > 0) await page.keyboard.press("ArrowRight");
      await expect(status(page)).toHaveText(`Step ${step + 1} of 5: ${STEPS[step]}`);
      await settled(page);
      const rest = await page.evaluate(() => {
        const tours = (window as unknown as { tourAnimations: () => Animation[] }).tourAnimations;
        return {
          running: tours().filter((a) => a.playState === "running").length,
          endless: tours().filter((a) => a.effect?.getComputedTiming().iterations === Infinity).length,
          cards: [...document.querySelectorAll<HTMLElement>("[data-tour-dialog] [data-card]")].map(
            (card) => getComputedStyle(card).transform
          ),
          flip: [...document.querySelectorAll<HTMLElement>("[data-tour-dialog] [class*='flip']")].map(
            (flip) => getComputedStyle(flip).transform
          ),
        };
      });
      expect(rest.running).toBe(0);
      expect(rest.endless).toBe(0);
      for (const transform of [...rest.cards, ...rest.flip]) expect(transform).toBe("none");
    }
  });

  test("text is fully opaque on every frame of every slide change", async ({ page }) => {
    await startFromPrompt(page);
    const frames: { at: number; faded: string[] }[] = [];
    for (let step = 0; step < STEPS.length; step++) {
      if (step > 0) await page.keyboard.press("ArrowRight");
      for (let frame = 0; frame < 14; frame++) {
        const faded = await page.evaluate(() => {
          const found: string[] = [];
          const walker = document.createTreeWalker(document.querySelector("[data-tour-dialog]")!, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (!node.textContent?.trim()) continue;
            for (let el = node.parentElement; el && !el.matches("body"); el = el.parentElement) {
              const opacity = Number(getComputedStyle(el).opacity);
              if (opacity < 1) {
                found.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)}=${opacity}`);
                break;
              }
            }
          }
          return found;
        });
        frames.push({ at: step * 100 + frame, faded });
        await page.waitForTimeout(110);
      }
    }
    expect(frames.filter((frame) => frame.faded.length > 0)).toEqual([]);
  });

  test("the slide that is leaving is gone before the next one is there", async ({ page }) => {
    await startFromPrompt(page);
    await settled(page);
    await page.keyboard.press("ArrowRight");
    const counts = await page.evaluate(
      () =>
        new Promise<number[]>((done) => {
          const seen: number[] = [];
          const sample = () => {
            seen.push(document.querySelectorAll("[data-tour-stage]").length);
            if (seen.length < 30) requestAnimationFrame(sample);
            else done(seen);
          };
          sample();
        })
    );
    expect(Math.max(...counts)).toBe(1);
    expect(Math.min(...counts)).toBe(1);
  });

  test("with reduced motion the same slides are static", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await startFromPrompt(page);
    for (let step = 0; step < STEPS.length; step++) {
      if (step > 0) await page.keyboard.press("ArrowRight");
      await expect(status(page)).toHaveText(`Step ${step + 1} of 5: ${STEPS[step]}`);
      expect(
        await page.evaluate(() => (window as unknown as { tourAnimations: () => Animation[] }).tourAnimations().length)
      ).toBe(0);
      expect(
        await page.evaluate(() => document.querySelectorAll("[data-tour-dialog] [data-card]").length)
      ).toBeGreaterThan(1);
      expect(await probeStage(page), `slide ${step + 1}`).toEqual([]);
    }
    const answer = dialog(page).getByText("Variables, not values.");
    await page.keyboard.press("ArrowLeft");
    await expect(answer).toBeVisible();
  });
});

async function probeStage(page: Page) {
  await settled(page);
  return page.evaluate(probeComposition);
}

test.describe("composition and fit", () => {
  const SIZES = [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 900, height: 1000 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ];

  for (const size of SIZES) {
    test(`every slide is composed and fits at ${size.width}x${size.height}`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await startFromPrompt(page);
      for (let step = 0; step < STEPS.length; step++) {
        if (step > 0) await page.keyboard.press("ArrowRight");
        await expect(status(page)).toHaveText(`Step ${step + 1} of 5: ${STEPS[step]}`);
        expect(await probeStage(page), `slide ${step + 1}`).toEqual([]);
        await inside(dialog(page), page);
        const fit = await page.evaluate(() => {
          const box = document.querySelector<HTMLElement>("[data-tour-dialog]")!;
          return {
            sideways: document.documentElement.scrollWidth - window.innerWidth,
            clipped: box.scrollWidth - box.clientWidth,
            body: [...box.children]
              .filter((child) => !child.classList.contains("visually-hidden"))
              .map((child) => (child as HTMLElement).scrollWidth - (child as HTMLElement).clientWidth),
          };
        });
        expect(fit.sideways).toBeLessThanOrEqual(0);
        expect(fit.clipped).toBeLessThanOrEqual(0);
        for (const overflow of fit.body) expect(overflow).toBeLessThanOrEqual(0);
        for (const name of ["Skip tour", step === 4 ? "Done" : "Next"]) {
          const box = await dialog(page).getByRole("button", { name }).boundingBox();
          expect(box!.height, `${name} is a 44px target`).toBeGreaterThanOrEqual(43.5);
          await inside(dialog(page).getByRole("button", { name }), page);
        }
        if (step > 0) {
          const back = await dialog(page).getByRole("button", { name: "Back" }).boundingBox();
          expect(back!.height).toBeGreaterThanOrEqual(43.5);
        }
      }
    });

    test(`the prompt fits and stays clear of the Menu at ${size.width}x${size.height}`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto("/");
      await expect(prompt(page)).toBeVisible({ timeout: 15_000 });
      await settled(page);
      await inside(prompt(page), page);
      const box = (await prompt(page).boundingBox())!;
      const pill = (await menuPill(page).boundingBox())!;
      const apart =
        box.x + box.width <= pill.x ||
        pill.x + pill.width <= box.x ||
        box.y + box.height <= pill.y ||
        pill.y + pill.height <= box.y;
      expect(apart).toBe(true);
      for (const name of ["Start the tour", "Skip the tour"]) {
        const target = await prompt(page).getByRole("button", { name }).boundingBox();
        expect(target!.height).toBeGreaterThanOrEqual(43.5);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(
        0
      );
    });
  }

  for (const { value } of FONT_ITEMS) {
    test(`nothing is clipped in the ${value} font`, async ({ page }) => {
      await page.addInitScript((font) => localStorage.setItem("jsnotes:font", JSON.stringify(font)), value);
      await page.emulateMedia({ reducedMotion: "reduce" });
      for (const size of [SIZES[0], SIZES[3]]) {
        await page.setViewportSize(size);
        await startFromPrompt(page);
        for (let step = 0; step < STEPS.length; step++) {
          if (step > 0) await page.keyboard.press("ArrowRight");
          await expect(status(page)).toHaveText(`Step ${step + 1} of 5: ${STEPS[step]}`);
          expect(await probeStage(page), `slide ${step + 1}`).toEqual([]);
          const clipped = await page.evaluate(() => {
            const box = document.querySelector<HTMLElement>("[data-tour-dialog]")!;
            const out: string[] = [];
            for (const el of box.querySelectorAll<HTMLElement>("h2, p, a, button, li, span")) {
              if (
                el.closest("[data-stage]") ||
                el.closest("[aria-hidden=true]") ||
                el.scrollWidth <= el.clientWidth + 1
              )
                continue;
              const overflow = getComputedStyle(el).overflowX;
              if (overflow === "visible" || overflow === "clip")
                out.push(`${el.tagName} ${el.textContent?.slice(0, 30)}`);
            }
            return out;
          });
          expect(clipped, `slide ${step + 1} in ${value}`).toEqual([]);
        }
        await page.keyboard.press("Escape");
        await page.evaluate((key) => localStorage.removeItem(key), KEY);
      }
    });
  }
});
