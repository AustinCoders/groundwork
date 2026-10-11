import { expect, test, type Page } from "@playwright/test";

const SIZES = [
  { width: 1001, height: 700 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
];

async function openRound(page: Page, round: RegExp, count: RegExp) {
  await page.goto("/mock");
  await page.getByRole("tab", { name: "Single round" }).click();
  await page.getByRole("button", { name: round }).first().click();
  await page.getByRole("group", { name: "How many questions" }).getByRole("button", { name: count }).click();
  await page.getByRole("button", { name: /^Start / }).click();
  await page.getByRole("button", { name: "Walk in" }).waitFor();
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

async function fits(page: Page, label: string) {
  const m = await page.evaluate(() => ({
    scrollY: document.documentElement.scrollHeight - innerHeight,
    overflowX: document.documentElement.scrollWidth - innerWidth,
  }));
  expect(m.scrollY, `${label}: page scroll`).toBeLessThanOrEqual(0);
  expect(m.overflowX, `${label}: sideways scroll`).toBeLessThanOrEqual(0);
}

test("the mock lobby carries no scroll reveals and no stage card covers another at common sizes", async ({ page }) => {
  for (const size of SIZES.slice(1, 4)) {
    await page.setViewportSize(size);
    await page.goto("/mock");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("A mock interview that pushes back");
    await expect(page.locator("main [data-fx]")).toHaveCount(0);
    expect(await stageOverlaps(page), `${size.width}x${size.height}`).toEqual([]);
  }
});

test("the lobby never shows the wrong pick-up card before hydration finishes", async ({ page }) => {
  await page.addInitScript(() => {
    const seen = { first: [] as string[] };
    (window as unknown as { __seen: typeof seen }).__seen = seen;
    const tick = () => {
      for (const el of document.querySelectorAll("main aside[aria-label='Pick up']")) {
        const body = el.querySelector("div");
        if (body && getComputedStyle(body).visibility !== "hidden" && /First time here/.test(el.textContent ?? ""))
          seen.first.push(el.textContent ?? "");
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto("/mock");
  await page.getByRole("tab", { name: "Single round" }).click();
  await page.getByRole("button", { name: /^Behavioural/ }).click();
  await page.getByRole("button", { name: /^Start / }).click();
  await page.getByRole("button", { name: "Walk in" }).click();
  await page.getByLabel(/Say it out loud/).fill("Half-way through.");
  await page.waitForTimeout(600);

  await page.reload();
  const card = page.getByRole("complementary", { name: "Pick up" });
  await expect(card.getByRole("button", { name: "Walk back in" })).toBeVisible();
  await page.waitForTimeout(400);
  const seen = await page.evaluate(() => (window as unknown as { __seen: { first: string[] } }).__seen.first);
  expect(seen, "the first-time card was visible at some frame").toEqual([]);

  await card.getByRole("button", { name: "Walk back in" }).click();
  await expect(page.getByLabel(/Say it out loud/)).toHaveValue("Half-way through.");
});

test("the room fills the window with no page scroll on a desktop and stacks below 1001px", async ({ page }) => {
  for (const size of SIZES) {
    await page.setViewportSize(size);
    await openRound(page, /^Behavioural/, /^3/);
    const label = `${size.width}x${size.height}`;
    await page.evaluate(() => document.fonts.ready);
    await fits(page, `${label} brief`);
    await page.getByRole("button", { name: "Walk in" }).click();
    await expect(page.getByLabel(/Say it out loud/)).toBeVisible();
    await fits(page, `${label} answer`);
    const panes = await page.evaluate(() => {
      const left = document.querySelector("section[aria-labelledby=q-prompt]")!.getBoundingClientRect();
      const right = document.querySelector("section[aria-label='Your answer']")!.getBoundingClientRect();
      const header = document.querySelector("header")!.getBoundingClientRect().bottom;
      return {
        top: left.top - header,
        bottom: innerHeight - left.bottom,
        side: left.left,
        gap: right.left - left.right,
      };
    });
    expect(Math.abs(panes.top - panes.side), `${label}: room under the header against the side`).toBeLessThanOrEqual(2);
    expect(Math.abs(panes.bottom - panes.side), `${label}: room at the bottom against the side`).toBeLessThanOrEqual(2);
    await page.getByLabel(/Say it out loud/).fill("Situation, task, action, result.");
    await page.getByRole("button", { name: "I've answered" }).click();
    const push = page.getByRole("button", { name: "Answered — show me" });
    const rubric = page.getByRole("heading", { name: "Mark it honestly" });
    await expect(push.or(rubric)).toBeVisible();
    if (await push.isVisible()) {
      await fits(page, `${label} follow-up`);
      await push.click();
    }
    await expect(rubric).toBeVisible();
    await fits(page, `${label} review`);
  }

  await page.setViewportSize({ width: 1000, height: 800 });
  await openRound(page, /^Behavioural/, /^3/);
  await page.getByRole("button", { name: "Walk in" }).click();
  const stacked = await page.evaluate(() => ({
    question: document.querySelector("section[aria-labelledby=q-prompt]")!.getBoundingClientRect().bottom,
    answer: document.querySelector("section[aria-label='Your answer']")!.getBoundingClientRect().top,
    overflowX: document.documentElement.scrollWidth - innerWidth,
  }));
  expect(stacked.question, "the interviewer comes first").toBeLessThanOrEqual(stacked.answer + 1);
  expect(stacked.overflowX).toBeLessThanOrEqual(0);
});

test("the coding room fills the window and the editor keeps its room", async ({ page }) => {
  for (const size of SIZES.slice(1, 4)) {
    await page.setViewportSize(size);
    await openRound(page, /^Coding/, /^1/);
    await page.getByRole("button", { name: "Walk in" }).click();
    await expect(page.locator(".cm-content")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const label = `${size.width}x${size.height}`;
    await fits(page, label);
    const editor = await page.locator(".ed").boundingBox();
    expect(editor!.height, `${label}: editor height`).toBeGreaterThan(260);
    await expect(page.getByRole("button", { name: "Hand it in" })).toBeVisible();
  }
});

test("the lobby, the room and the debrief have no sideways scroll at 390 and 320 and their controls are tappable", async ({
  page,
}) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/mock");
    await page.evaluate(() => document.fonts.ready);
    const sideways = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(await sideways(), `${width}: lobby`).toBeLessThanOrEqual(0);

    await page.getByRole("tab", { name: "Single round" }).click();
    expect(await sideways(), `${width}: single round`).toBeLessThanOrEqual(0);
    await page.getByRole("button", { name: /^Behavioural/ }).click();
    await page.getByRole("group", { name: "How many questions" }).getByRole("button", { name: /^3/ }).click();
    await page.getByRole("button", { name: /^Start / }).click();
    await page.getByRole("button", { name: "Walk in" }).waitFor();
    expect(await sideways(), `${width}: brief`).toBeLessThanOrEqual(0);
    await page.getByRole("button", { name: "Walk in" }).click();
    expect(await sideways(), `${width}: question`).toBeLessThanOrEqual(0);

    const small = await page.evaluate(() =>
      [...document.querySelectorAll("main button, main a")]
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height > 0 && r.height < 40)
        .map(({ el }) => `${el.tagName.toLowerCase()} ${el.textContent?.trim().slice(0, 30)}`)
    );
    expect(small, `${width}: controls under 40px tall`).toEqual([]);

    for (let i = 0; i < 3; i++) {
      await page.getByLabel(/Say it out loud/).fill("Situation, task, action, result.");
      await page.getByRole("button", { name: "I've answered" }).click();
      const push = page.getByRole("button", { name: "Answered — show me" });
      const rubric = page.getByRole("heading", { name: "Mark it honestly" });
      await expect(push.or(rubric)).toBeVisible();
      if (await push.isVisible()) await push.click();
      await expect(rubric).toBeVisible();
      if (i === 0) expect(await sideways(), `${width}: review`).toBeLessThanOrEqual(0);
      for (let k = 0; k < 5; k++) await page.keyboard.press("3");
      await page.getByRole("button", { name: "Next question" }).click();
    }
    await expect(page.getByText("Round debrief")).toBeVisible();
    expect(await sideways(), `${width}: debrief`).toBeLessThanOrEqual(0);
  }
});

test("the debrief stamp and bars come from the marks, and every section has its place", async ({ page }) => {
  await openRound(page, /^Behavioural/, /^3/);
  await page.getByRole("button", { name: "Walk in" }).click();
  for (let i = 0; i < 3; i++) {
    await page.getByLabel(/Say it out loud/).fill("Situation, task, action, result.");
    await page.getByRole("button", { name: "I've answered" }).click();
    const push = page.getByRole("button", { name: "Answered — show me" });
    const rubric = page.getByRole("heading", { name: "Mark it honestly" });
    await expect(push.or(rubric)).toBeVisible();
    if (await push.isVisible()) await push.click();
    await expect(rubric).toBeVisible();
    for (let k = 0; k < 5; k++) await page.keyboard.press("1");
    await page.getByRole("button", { name: "Next question" }).click();
  }
  await expect(page.getByRole("img", { name: "Verdict: No hire" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Round by round" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What to work on next" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Every question" })).toBeVisible();
  await expect(page.locator("main [data-fx]")).toHaveCount(0);
  await page.getByRole("button", { name: "Plan something else" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("pushes back");
  await expect(page.getByRole("heading", { name: "How ready you are" })).toBeVisible();
});

test("the readiness board says so honestly before there is any history", async ({ page }) => {
  await page.goto("/mock");
  await expect(page.getByText("Nothing to measure yet.")).toBeVisible();
});
