import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type ConsoleMessage, type Locator, type Page } from "@playwright/test";
import { practice } from "../content/practice";
import { THEMES, themeColour } from "./themes";

const containing = (colour: string) => new RegExp(colour.replace(/[()]/g, "\\$&"));

const PAGES = [
  { path: "/", heading: /Walk into the interview ready/i },
  { path: "/notes", heading: /JavaScript/i },
  { path: "/notes/setup-mental-model", heading: /Setup/i },
  { path: "/react", heading: /React/i },
  { path: "/react/react-components", heading: /Components/i },
  { path: "/dsa", heading: /DSA/i },
  { path: "/dsa/dsa-hashing", heading: /Hashing/i },
  { path: "/system-design", heading: /System Design/i },
  { path: "/system-design/sysdes-caching-fundamentals", heading: /Caching/i },
  { path: "/interview", heading: /Every round of the loop/i },
  { path: "/interview/r1oa", heading: /online assessment/i },
  { path: "/level/js", heading: /JavaScript/i },
  { path: "/path/js/beginner", heading: /Beginner/i },
  { path: "/practice?id=free", heading: /Playground/i },
  { path: "/problems", heading: /problem/i },
  { path: "/problems/ex-accounts-merge", heading: /Accounts Merge/i },
  { path: "/review", heading: /look at again|still fresh|comes back here/i },
  { path: "/mock", heading: /mock interview/i },
  { path: "/progress", heading: /progress/i },
  { path: "/privacy", heading: /Privacy/ },
  { path: "/git", heading: /Git/i },
  { path: "/architecture", heading: /How this site is built/i },
  { path: "/architecture/arch-health", heading: /Current health/i },
];

const VERCEL_NOISE = /_vercel|vercel-scripts/i;

function collectProblems(page: Page): string[] {
  const problems: string[] = [];

  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (VERCEL_NOISE.test(text)) return;
    if (text.startsWith("Failed to load resource")) return;
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

async function expectOneSetOfDiagramDefs(page: Page) {
  for (const selector of ["filter#wob", "marker#arrow", "#arrow-green", "#arrow-red"]) {
    await expect(page.locator(selector), `${selector} on ${page.url()}`).toHaveCount(1);
  }
}

for (const { path, heading } of PAGES) {
  test(`${path} renders without console errors`, async ({ page }) => {
    const problems = collectProblems(page);

    const response = await page.goto(path, { waitUntil: "networkidle" });
    expect(response?.status(), `${path} did not return 200`).toBe(200);

    await expect(page.locator("#main h1, #main h2").first()).toContainText(heading);
    expect(problems, `${path} logged problems`).toEqual([]);
  });
}

test("an unknown chapter slug is a stored 404, not a rendered not-found page", async ({ page }) => {
  for (const path of ["/notes/nope", "/architecture/nope", "/react/nope"]) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} did not return 404`).toBe(404);
  }
});

test("an outline topic's /soon link redirects to its outline landing, and a written topic's still redirects onward", async ({
  page,
}) => {
  await page.goto("/soon?topic=typescript");
  await page.waitForURL(/\/typescript(\?|$)/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("TypeScript");
  await expect(page.getByText("Not written yet")).toBeVisible();
  await expect(page.getByRole("link", { name: /JavaScript is written/i })).toHaveAttribute("href", "/notes");
  await expect(page.getByRole("link", { name: /R3 · JavaScript & TS/i })).toHaveAttribute("href", "/interview/r3");

  await page.goto("/soon?topic=js");
  await page.waitForURL(/\/level\/js(\?|$)/);

  await page.goto("/soon?topic=graphql");
  await page.waitForURL(/\/graphql(\?|$)/);

  await page.goto("/soon");
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/soon?topic=nope");
  await expect(page).toHaveURL(/^[^?#]*\/(\?|$)/);
});

test("the skip link's #main hash stays on the page instead of forwarding to a missing chapter", async ({ page }) => {
  for (const path of ["/notes", "/git"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const skip = page.locator("a.skip-link");
    await expect(skip, path).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page, path).toHaveURL(new RegExp(`${path}#main$`));
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1 }), path).toBeVisible();
    expect(new URL(page.url()).pathname, path).toBe(path);
  }
});

test("the not-found page renders in the page frame with a labelled back pill and one main", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  const back = page.locator("header a.head-back");
  await expect(back).toBeVisible();
  await expect(back).toHaveAttribute("href", "/");
  await expect(page.locator("main#main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nothing written on this page");
});

test("an outline topic's old /level and /path links redirect to its outline landing", async ({ page }) => {
  await page.goto("/level/typescript");
  await page.waitForURL(/\/typescript(\?|$)/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("TypeScript");

  await page.goto("/path?topic=typescript&level=beginner");
  await page.waitForURL(/\/typescript(\?|$)/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("TypeScript");
});

test("the /path page renders only its own topic's steps at the chosen level", async ({ page }) => {
  await page.goto("/path/react/beginner");
  await expect(page.locator("#steps [data-step]")).toHaveCount(11);
  await expect(page.locator("#steps a[href^='/dsa/']")).toHaveCount(0);
});

test("the /path page's back pill falls back to the level picker", async ({ page }) => {
  await page.goto("/path/js/beginner");
  const back = page.locator("header a.head-back");
  await expect(back).toBeVisible();
  await expect(back).toHaveAttribute("title", "JavaScript");
  await expect(back).toHaveAttribute("href", "/level/js");
});

test("git and architecture pages render in the topic frame with a labelled back pill", async ({ context }) => {
  const cases = [
    { path: "/git", title: "Home", href: "/" },
    { path: "/git/merge", title: "Git", href: "/git" },
    { path: "/architecture", title: "Home", href: "/" },
    { path: "/architecture/arch-request-path", title: "How this is built", href: "/architecture" },
  ];
  for (const { path, title, href } of cases) {
    const page = await context.newPage();
    await page.goto(path);
    const back = page.locator("header a.head-back");
    await expect(back, path).toBeVisible();
    await expect(back, path).toHaveAttribute("title", title);
    await expect(back, path).toHaveAttribute("href", href);
    await expectOneSetOfDiagramDefs(page);
    await page.close();
  }
});

test("the git and architecture landings start, then continue after the saved progress, and stay inside 390px", async ({
  page,
}) => {
  const landings = [
    { path: "/git", key: "git-", first: "/git/", start: /^Start reading/ },
    { path: "/architecture", key: "", first: "/architecture/", start: /^Start reading/ },
  ];
  for (const { path, key, first, start } of landings) {
    await page.goto(path);
    await page.evaluate(() => localStorage.removeItem("jsnotes:progress"));
    await page.reload();
    const action = page.locator("header").getByRole("link", { name: start });
    await expect(action, path).toHaveAttribute("href", new RegExp(`^${first}`));
    const firstHref = (await action.getAttribute("href"))!;
    const firstId = key + firstHref.slice(first.length);
    await page.evaluate(
      (id) => localStorage.setItem("jsnotes:progress", JSON.stringify({ chapters: { [id]: { at: 1, reviews: 0 } } })),
      firstId
    );
    await page.reload();
    const next = page.locator("header").getByRole("link", { name: /^Continue reading/ });
    await expect(next, path).toBeVisible();
    await expect(next, path).not.toHaveAttribute("href", firstHref);
    await expect(page.locator("main").getByText(/\b1 (of \d+ read|read by you)/), path).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.evaluate(() => localStorage.removeItem("jsnotes:progress"));
  }
});

test("/path and /path?topic= redirect once the saved or default level is known", async ({ page }) => {
  await page.goto("/path");
  await page.waitForURL("**/path/js/beginner");

  await page.goto("/path?topic=js");
  await page.waitForURL("**/path/js/beginner");
});

test("marking a step read on /path updates the meter and the step's state", async ({ page }) => {
  await page.goto("/path/js/beginner");
  const meterLabel = page.locator("#path-meter-label");
  await expect(meterLabel).toHaveText("0 / 18 done");

  const toggle = page.locator('[data-step="setup-mental-model"] button');
  await toggle.click();

  await expect(meterLabel).toHaveText("1 / 18 done");
  await expect(page.locator('[data-step="setup-mental-model"]')).toHaveAttribute("data-done", "true");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
});

test("a chapter can be marked read and the count follows", async ({ page }) => {
  await page.goto("/notes");
  const tick = page.getByRole("button", { name: /^Mark .* read$/ }).first();
  await tick.click();
  await expect(page.getByText("1 / 41 read")).toBeVisible();
});

test("the cover's Start/Continue/Review action follows progress", async ({ page }) => {
  await page.goto("/notes");
  const cta = page.locator("header a.btn--primary");
  await expect(cta).toHaveText("Start →");
  await expect(cta).toHaveAttribute("href", "/notes/setup-mental-model");

  await page
    .getByRole("button", { name: /^Mark .* read$/ })
    .first()
    .click();
  await expect(cta).toHaveText("Continue →");
  await expect(cta).toHaveAttribute("href", "/notes/execution-context");

  const ids = await page
    .locator("a[href^='/notes/']")
    .evaluateAll((links) => [...new Set(links.map((l) => l.getAttribute("href")!.replace("/notes/", "")))]);
  await page.evaluate((chapterIds) => {
    const chapters: Record<string, true> = {};
    chapterIds.forEach((id) => {
      chapters[id] = true;
    });
    localStorage.setItem("jsnotes:progress", JSON.stringify({ chapters, exercises: {} }));
  }, ids);
  await page.reload();
  await expect(cta).toHaveText("Review →");
  await expect(cta).toHaveAttribute("href", "/review");
});

test("the Up next card's budget picker updates the reach text", async ({ page }) => {
  await page.goto("/notes");
  const budgetGroup = page.getByRole("group", { name: "Reading time budget" });
  await budgetGroup.getByRole("button", { name: "20m" }).click();
  await expect(budgetGroup.getByText(/→ \d+ chapters?, up to .+/)).toBeVisible();
});

test("the /notes cover renders in the topic frame", async ({ page }) => {
  await page.goto("/notes");
  const back = page.locator("header a.head-back");
  await expect(back).toBeVisible();
  await expect(back).toHaveAttribute("title", "Home");
  await expect(back).toHaveAttribute("href", "/");
  const title = page.locator("header").getByRole("link", { name: "JavaScript", exact: true });
  await expect(title).toHaveAttribute("href", "/notes");
  await expect(title).toHaveAttribute("aria-current", "page");
  await expect(title.locator("[aria-hidden=true]")).toHaveText("JS");
  await expectOneSetOfDiagramDefs(page);

  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const menu = page.getByRole("dialog", { name: /menu/ });
  const textSize = menu.getByRole("button", { name: /Text size/ });
  await textSize.click();
  await expect(textSize).toHaveAttribute("aria-expanded", "true");
  await menu.getByRole("button", { name: "Larger text" }).click();
  await expect(menu.locator("output")).toHaveText("110%");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue("--reader-zoom")))
    .toBe("1.1");
  await expect.poll(() => page.locator("#top").evaluate((el) => getComputedStyle(el).zoom)).toBe("1.1");
  await expect(menu.getByRole("button", { name: /Narrator/ })).toBeVisible();
  const print = menu.getByRole("button", { name: "Print or save as PDF" });
  await expect(print).toBeVisible();
  await page.evaluate(() => {
    window.print = () => document.documentElement.setAttribute("data-printed", "");
  });
  await print.click();
  await expect(page.locator("html")).toHaveAttribute("data-printed", "");
  await expect(menu).toHaveCount(0);

  await page.goto("/react");
  await expectOneSetOfDiagramDefs(page);

  await page.goto("/typescript");

  await page.goto("/notes#closures");
  await page.waitForURL("**/notes/closures");
});

test("a written topic chapter has its own rail, contents and read marker, and the Chapters sheet works at 390", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/notes/setup-mental-model");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Setup/i);
  await expectOneSetOfDiagramDefs(page);
  const articleWidth = await page.locator("#setup-mental-model").evaluate((el) => el.getBoundingClientRect().width);
  expect(articleWidth).toBeLessThanOrEqual(760);
  const rail = page.getByRole("navigation", { name: "Chapters" });
  await expect(rail.locator("a[aria-current=page]")).toContainText("Setup");

  const firstPager = page.getByRole("navigation", { name: "Chapter navigation" });
  await expect(firstPager.getByRole("link", { name: /^Back to/ })).toHaveAttribute("href", "/notes");

  const contents = page.getByRole("complementary", { name: "On this page" });
  const firstSection = contents.getByRole("link").first();
  const target = (await firstSection.getAttribute("href"))!;
  await firstSection.click();
  await expect(page).toHaveURL(new RegExp(`${target}$`));

  await contents.getByRole("button", { name: /Mark as read/ }).click();
  await expect(rail.locator("a[aria-current=page]")).toContainText("✓");

  await page.getByRole("heading", { level: 1 }).click();
  await page.keyboard.press("/");
  await expect(page.locator("#search")).toBeFocused();
  await page.keyboard.press("Escape");

  await page.getByRole("heading", { level: 1 }).click();
  await page.keyboard.press("]");
  await page.waitForURL("**/notes/execution-context");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Execution/i);
  const pager = page.getByRole("navigation", { name: "Chapter navigation" });
  await expect(pager.getByRole("link", { name: /^Previous/ })).toHaveAttribute("href", "/notes/setup-mental-model");
  await page.getByRole("heading", { level: 1 }).click();
  await page.keyboard.press("[");
  await page.waitForURL("**/notes/setup-mental-model");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Setup/i);

  await page.getByRole("heading", { level: 1 }).click();
  await page.keyboard.press("n");
  await page.waitForURL("**/notes/execution-context");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Execution/i);
  await page.getByRole("heading", { level: 1 }).click();
  await page.keyboard.press("p");
  await page.waitForURL("**/notes/setup-mental-model");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Setup/i);

  await page.evaluate(() => window.scrollTo(0, 800));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.getByRole("heading", { level: 1 }).click();
  await page.keyboard.press("t");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const narrowArticleWidth = await page
    .locator("#setup-mental-model")
    .evaluate((el) => el.getBoundingClientRect().width);
  expect(narrowArticleWidth).toBeGreaterThanOrEqual(350);
  await page.getByRole("button", { name: "Chapters", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: "Chapters" });
  await expect(sheet).toBeVisible();
  await expect(sheet.locator("a[aria-current=page]")).toContainText("Setup");
});

test("a topic's last chapter shows the end-of-series pager fallback", async ({ page }) => {
  await page.goto("/notes/cheat");
  const pager = page.getByRole("navigation", { name: "Chapter navigation" });
  await expect(pager.getByRole("link", { name: /The end/ })).toHaveAttribute("href", "/notes");
});

test("an outline chapter shows its roadmap, a Meanwhile link, and prev/next scoped to its own topic", async ({
  page,
}) => {
  await page.goto("/typescript/ts-setup-compiler");
  await expect(page.locator("[data-scrollbar]")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Setup/i);
  await expect(page.getByText("Not written yet.")).toBeVisible();
  await expect(page.getByText(/ts-node and running TypeScript directly/)).toBeVisible();
  await expect(page.getByRole("link", { name: /JavaScript is written/i })).toHaveAttribute("href", "/notes");
  await expect(page.getByRole("link", { name: /R3 · JavaScript & TS/i })).toHaveAttribute("href", "/interview/r3");
  const pager = page.getByRole("navigation", { name: "Chapter navigation" });
  await expect(pager.getByRole("link", { name: /Back to/i })).toHaveAttribute("href", "/typescript");
  await expect(pager.getByRole("link", { name: /Next/i })).toHaveAttribute("href", "/typescript/ts-basic-types");
});

test("the DSA cover lists all 42 chapters and an outline chapter renders its outline page", async ({ page }) => {
  await page.goto("/dsa");
  const outlineIds = [
    "dsa-js-toolkit",
    "dsa-prefix-sums",
    "dsa-bst-operations",
    "dsa-grid-bfs",
    "dsa-dp-state-machines",
    "dsa-math",
    "dsa-graph-structure",
    "dsa-sparse-table",
  ];
  for (const id of outlineIds) {
    await expect(page.locator(`a[href="/dsa/${id}"]`).first(), id).toBeAttached();
  }
  const chapterLinkCount = await page
    .locator('a[href^="/dsa/dsa-"]')
    .evaluateAll((links) => new Set(links.map((a) => (a.getAttribute("href") ?? "").split(/[?#]/)[0])).size);
  expect(chapterLinkCount).toBe(42);

  const order = await page.locator('main a[href^="/dsa/dsa-"]').evaluateAll((links) => {
    const seen: string[] = [];
    for (const a of links) {
      const href = (a.getAttribute("href") ?? "").split(/[?#]/)[0];
      if (!seen.includes(href)) seen.push(href);
    }
    return seen;
  });
  expect(order.slice(0, 5)).toEqual([
    "/dsa/dsa-complexity-analysis",
    "/dsa/dsa-js-toolkit",
    "/dsa/dsa-arrays-strings",
    "/dsa/dsa-prefix-sums",
    "/dsa/dsa-hashing",
  ]);
  expect(order.indexOf("/dsa/dsa-basic-recursion")).toBeLessThan(order.indexOf("/dsa/dsa-sorting-algorithms"));
  for (const id of ["dsa-tries", "dsa-monotonic-stack-queue", "dsa-topological-patterns"]) {
    await expect(
      page.locator(`section[aria-labelledby="part-intermediate"] a[href="/dsa/${id}"]`).first(),
      `${id} under Intermediate`
    ).toBeAttached();
    await expect(
      page.locator(`section[aria-labelledby="part-advanced"] a[href="/dsa/${id}"]`),
      `${id} not under Advanced`
    ).toHaveCount(0);
  }

  await page.goto("/dsa/dsa-math");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Math for interviews/i);
  await expect(page.getByText("Not written yet.")).toBeVisible();
  await expect(page.getByText(/modular inverse/i).first()).toBeVisible();
});

test("in a quiz topic an unread chapter's tick links to its check and a read chapter keeps its toggle, while other topics keep their buttons", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dsa/dsa-binary-search");
  const stub = page.locator("#check");
  await expect(stub).toHaveCount(1);
  await expect(stub).toHaveAttribute("data-island", "check");
  await expect(stub).toHaveAttribute("tabindex", "-1");
  await expect(stub).toContainText("The chapter check is not built yet, so marking a chapter done is paused here");
  await expect(stub.locator("h1, h2, h3, h4, h5, h6, button, a, input")).toHaveCount(0);
  const endCard = page.getByRole("region", { name: "Finish" });
  const endTick = endCard.getByRole("link", { name: "Mark as read" });
  await expect(endTick).toHaveAttribute("href", "#check");
  await expect(endCard.getByRole("button")).toHaveCount(0);
  const contents = page.getByRole("complementary", { name: "On this page" });
  await expect(contents.getByRole("link", { name: "Mark as read" })).toHaveAttribute("href", "#check");
  await expect(contents.getByRole("button", { name: /Mark as read/ })).toHaveCount(0);
  const stubBottom = await stub.evaluate((el) => el.getBoundingClientRect().bottom);
  const endTop = await endCard.evaluate((el) => el.getBoundingClientRect().top);
  expect(stubBottom).toBeLessThanOrEqual(endTop);
  await endTick.click();
  await expect(page).toHaveURL(/\/dsa\/dsa-binary-search#check$/);
  await expect(endCard.getByText("Finished reading?")).toBeVisible();
  await expect(endCard.getByText(/^0 of \d+ chapters read/)).toBeVisible();

  await page.goto("/dsa");
  const startHref = (await page.locator("header a.btn--primary").getAttribute("href"))!;
  const firstId = startHref.replace("/dsa/", "");
  const coverTick = page.locator(`a[href="${startHref}#check"]`);
  await expect(coverTick).toHaveAttribute("aria-label", /^Mark .* read$/);
  await expect(page.getByRole("button", { name: /^Mark .* read$/ })).toHaveCount(0);
  const outlineIds = [
    "dsa-js-toolkit",
    "dsa-prefix-sums",
    "dsa-bst-operations",
    "dsa-grid-bfs",
    "dsa-dp-state-machines",
    "dsa-math",
    "dsa-graph-structure",
    "dsa-sparse-table",
  ];
  for (const id of outlineIds) {
    await expect(page.locator(`a[href="/dsa/${id}#check"]`), `${id} has no tick`).toHaveCount(0);
  }

  await page.goto("/path/dsa/beginner");
  const stepTick = page.locator(`[data-step="${firstId}"] a[href="${startHref}#check"]`);
  await expect(stepTick).toContainText("Mark as read");
  await expect(page.locator("#steps button")).toHaveCount(0);

  await page.evaluate(
    (id) => localStorage.setItem("jsnotes:progress", JSON.stringify({ chapters: { [id]: { at: 1, reviews: 0 } } })),
    firstId
  );
  await page.reload();
  const readStep = page.locator(`[data-step="${firstId}"]`);
  await expect(readStep).toHaveAttribute("data-done", "true");
  await expect(readStep.getByRole("button", { name: "Mark as unread", pressed: true })).toBeVisible();
  await expect(readStep.locator('a[href$="#check"]')).toHaveCount(0);
  await expect(page.locator('#steps a[href$="#check"]').first()).toBeVisible();
  await expect(page.locator("#start-btn")).not.toHaveAttribute("href", startHref);
  await expect(page.locator("#start-btn")).toContainText("Continue");

  await page.goto("/dsa");
  const next = page.locator("header a.btn--primary");
  await expect(next).toHaveText("Continue →");
  await expect(next).not.toHaveAttribute("href", startHref);
  await expect(next).not.toHaveAttribute("href", "/review");
  await expect(page.getByRole("button", { name: /^Mark .* unread$/, pressed: true })).toHaveCount(1);
  await expect(page.locator(`a[href="${startHref}#check"]`)).toHaveCount(0);
  await expect(page.locator('a[href$="#check"]').first()).toBeAttached();

  await page.goto(startHref);
  const readEnd = page.getByRole("region", { name: "Finish" });
  await expect(readEnd.getByRole("button", { name: "Mark as unread", pressed: true })).toBeVisible();
  await expect(readEnd.getByRole("link")).toHaveCount(0);
  const readContents = page.getByRole("complementary", { name: "On this page" });
  await expect(readContents.getByRole("button", { name: /Read/, pressed: true })).toBeVisible();
  await expect(readContents.locator('a[href="#check"]')).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Chapters" }).locator("a[aria-current=page]")).toContainText("✓");
  await readEnd.getByRole("button", { name: "Mark as unread" }).click();
  await expect(readEnd.getByRole("link", { name: "Mark as read" })).toHaveAttribute("href", "#check");
  await expect(readContents.getByRole("link", { name: "Mark as read" })).toHaveAttribute("href", "#check");

  for (const cover of ["/notes", "/react"]) {
    await page.goto(cover);
    await expect(page.locator('a[href$="#check"]'), cover).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Mark .* read$/ }).first(), cover).toBeVisible();
    const chapterHref = (await page.locator("header a.btn--primary").getAttribute("href"))!;
    await page.goto(chapterHref);
    await expect(page.locator("#check"), chapterHref).toHaveCount(0);
    await expect(page.locator('a[href$="#check"]'), chapterHref).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Finish" }).getByRole("button", { name: "Mark as read" }),
      chapterHref
    ).toBeVisible();
  }
});

test("the phone Chapters sheet shows a read DSA chapter's tick and none on the chapter being read", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dsa/dsa-binary-search");
  await page.evaluate(() =>
    localStorage.setItem(
      "jsnotes:progress",
      JSON.stringify({ chapters: { "dsa-complexity-analysis": { at: 1, reviews: 0 } } })
    )
  );
  await page.reload();
  await page.getByRole("button", { name: "Chapters", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: "Chapters" });
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('a[href="/dsa/dsa-complexity-analysis"]')).toContainText("✓");
  const current = sheet.locator("a[aria-current=page]");
  await expect(current).toHaveAttribute("href", "/dsa/dsa-binary-search");
  await expect(current).not.toContainText("✓");
});

test("print shows only the chapter head and body, hiding the rail, contents, pager and end card", async ({ page }) => {
  await page.goto("/notes/setup-mental-model");
  await page.emulateMedia({ media: "print" });

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#chapters")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Chapters" })).toBeHidden();
  await expect(page.getByRole("complementary", { name: "On this page" })).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Chapter navigation" })).toBeHidden();
  await expect(page.getByRole("region", { name: "Finish" })).toBeHidden();
});

test("search finds chapter text, marks matches, and ignores demo scripts", async ({ page }) => {
  await page.goto("/notes/setup-mental-model");
  const search = page.locator("#search");

  await search.fill("microtask");
  await expect(page.locator("#search-count")).toContainText(/chapters? match/);
  await expect(page.locator("#nav-list .site-navlink__match").first()).toBeVisible();
  await expect(page.locator("#nav-list .site-navlink__hits")).toHaveCount(0);

  await search.fill("demoinit");
  await expect(page.getByText(/Nothing matches/)).toBeVisible();
});

test("old /level?topic= links still land", async ({ page }) => {
  await page.goto("/level?topic=system-design");
  await page.waitForURL("**/level/system-design");
  await expect(page.locator("h1")).toContainText(/System Design/i);
});

test("the saved level gets a 'Your level' mark on its own card, not the others", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("jsnotes:level", JSON.stringify("intermediate")));
  await page.goto("/level/js");

  const intermediate = page.locator("#level-grid a", { hasText: "Intermediate" });
  const beginner = page.locator("#level-grid a", { hasText: "Beginner" });
  const advanced = page.locator("#level-grid a", { hasText: "Advanced" });

  await expect(intermediate.getByText("Your level")).toBeVisible();
  await expect(beginner.getByText("Your level")).toHaveCount(0);
  await expect(advanced.getByText("Your level")).toHaveCount(0);
});

test("narration plays a chapter", async ({ page }) => {
  const audio = readFileSync(join(__dirname, "fixtures/tone.mp3"));
  const timings = readFileSync(join(__dirname, "fixtures/tone-timings.txt"), "utf8").trim();

  await page.route("**/api/tts*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    await route.fulfill({
      status: 200,
      contentType: "audio/mpeg",
      headers: { "X-Word-Timings": timings },
      body: audio,
    });
  });

  await page.goto("/notes/basic-async");
  await page.locator(".listenbtn").first().click();

  await expect(page.locator(".listenbtn").first()).toHaveText(/Pause/);
  await expect(page.locator(".is-narrating").first()).toBeVisible();
});

test("a mock interview round runs from the lobby to the debrief", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("jsnotes:theme", JSON.stringify("lavender")));
  await page.goto("/mock");

  await page.getByRole("tab", { name: "Single round" }).click();
  await page.getByRole("button", { name: /^Behavioural/ }).click();
  await page.getByRole("group", { name: "How many questions" }).getByRole("button", { name: /^3/ }).click();
  await page.getByRole("button", { name: "Start Behavioural" }).click();

  await page.getByRole("button", { name: "Walk in" }).click();
  for (let i = 1; i <= 3; i++) {
    await expect(page.getByText(`Behavioural · ${i} of 3`)).toBeVisible();
    await page.getByLabel(/Say it out loud/).fill("Situation, task, action, result.");
    await page.getByRole("button", { name: "I've answered" }).click();

    const push = page.getByRole("button", { name: "Answered — show me" });
    const rubric = page.getByText("Mark it honestly");
    await expect(push.or(rubric)).toBeVisible();
    if (await push.isVisible()) await push.click();

    await expect(rubric).toBeVisible();
    for (let k = 0; k < 5; k++) await page.keyboard.press("3");
    await page.getByRole("button", { name: "Next question" }).click();
  }

  await expect(page.getByText("Round debrief")).toBeVisible();
  await expect(page.getByRole("img", { name: "Verdict: Strong hire" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Verdict: Strong hire" })).toHaveCSS(
    "color",
    themeColour("lavender", "--success")
  );
  await expect(page.getByText("Every question")).toBeVisible();
});

test("the loop wizard walks the choices and follows them", async ({ page }) => {
  await page.goto("/mock");
  const card = (group: string, name: RegExp) => page.getByRole("group", { name: group }).getByRole("button", { name });
  const step = (name: RegExp) => page.getByRole("list", { name: "Steps" }).getByRole("button", { name });
  const map = page.getByRole("list", { name: "The loop, in order" });

  await expect(page.getByRole("heading", { name: "Whose loop?" })).toBeVisible();
  await expect(step(/^Role/)).toBeDisabled();
  await expect(step(/^Your loop/)).toBeDisabled();
  await expect(page.getByRole("button", { name: "Choose one to go on" })).toBeDisabled();
  await expect(page.getByRole("group", { name: "Loop style" }).locator("[aria-pressed=true]")).toHaveCount(0);
  await card("Loop style", /^Build my own/).click();
  await expect(step(/^Role/)).toBeEnabled();
  await expect(step(/^Experience/)).toBeDisabled();
  await expect(page.getByRole("heading", { name: "What's the role?" })).toBeVisible();
  await card("Role", /^Backend/).click();
  await card("Experience", /^10\+ years/).click();
  await card("Company", /^Product startup/).click();
  await card("Length", /^Standard/).click();

  await expect(page.getByRole("heading", { name: "Your loop" })).toBeVisible();
  await expect(map.getByText("Node & databases")).toBeVisible();
  await expect(map.getByText("System design")).toBeVisible();
  await expect(map.getByText("React & the frontend")).toHaveCount(0);

  await step(/^Role/).click();
  await card("Role", /^Frontend/).click();
  await expect(page.getByRole("heading", { name: "Your loop" })).toBeVisible();
  await step(/^Experience/).click();
  await card("Experience", /^2–3 years/).click();
  await expect(page.getByRole("heading", { name: "Your loop" })).toBeVisible();

  await expect(map.getByText("React & the frontend")).toBeVisible();
  await expect(map.getByText("System design")).toHaveCount(0);
  await expect(step(/^Role/)).toContainText("Frontend");
});

test("a company-style loop takes over the company and shapes the rounds", async ({ page }) => {
  await page.goto("/mock");
  const card = (group: string, name: RegExp) => page.getByRole("group", { name: group }).getByRole("button", { name });
  const steps = page.getByRole("list", { name: "Steps" });
  const map = page.getByRole("list", { name: "The loop, in order" });

  await card("Loop style", /^Amazon-style/).click();
  await expect(steps.getByRole("button", { name: /^Company/ })).toHaveCount(0);
  await card("Role", /^Frontend/).click();
  await card("Experience", /^5–7 years/).click();
  await card("Length", /^Standard/).click();

  await expect(page.getByRole("heading", { name: "Your loop" })).toBeVisible();
  await expect(steps.getByRole("button", { name: /^Style/ })).toContainText("Amazon-style");
  await expect(page.getByText(/Bar Raiser/).first()).toBeVisible();
  await expect(map.getByText("veto", { exact: true })).toBeVisible();

  await steps.getByRole("button", { name: /^Style/ }).click();
  await card("Loop style", /^Build my own/).click();
  await expect(page.getByRole("heading", { name: "What kind of company?" })).toBeVisible();
  await expect(steps.getByRole("button", { name: /^Your loop/ })).toBeDisabled();
  await card("Company", /^Product startup/).click();
  await expect(page.getByRole("heading", { name: "Your loop" })).toBeVisible();
  await expect(map.getByText("veto", { exact: true })).toHaveCount(0);
});

test("the step-through demos advance and finish", async ({ page }) => {
  const problems = collectProblems(page);

  await page.goto("/react/react-fiber");
  const next = page.locator("#fw-next");
  await next.scrollIntoViewIfNeeded();
  await next.click();
  await expect(page.locator("#fw-note")).toContainText("beginWork(App)");
  while (await next.isEnabled()) await next.click();
  await expect(page.locator("#fw-note")).toContainText("never visited in the commit");

  await page.goto("/react/react-memoisation");
  await page.locator("#rr-click").click();
  await expect(page.locator("#rr-note")).toContainText("Without memo");
  await page.locator("#rr-memo").check();
  await page.locator("#rr-click").click();
  await expect(page.locator("#rr-note")).toContainText("skips it");

  await page.goto("/react/react-effect-timing");
  await page.locator("#et-kind").selectOption("passive");
  while (await page.locator("#et-next").isEnabled()) await page.locator("#et-next").click();
  await expect(page.locator("#et-note")).toContainText("after paint");

  await page.goto("/dsa/dsa-graphs-representation-traversal");
  await page.locator("#gt-mode").selectOption("dfs");
  while (await page.locator("#gt-next").isEnabled()) await page.locator("#gt-next").click();
  await expect(page.locator("#gt-order .loop-frame")).toHaveCount(7);

  expect(problems).toEqual([]);
});

test("a component exercise renders a preview and runs its tests in the sandbox", async ({ page }) => {
  const problems = collectProblems(page);
  const exercise = practice.find((e) => e.id === "ex-comp-counter-step")!;

  await page.goto("/practice?id=" + exercise.id);
  await expect(page.locator(".preview-panel")).toBeVisible();
  await page.getByRole("button", { name: "Run the code" }).click();
  await expect(page.frameLocator("iframe.preview-frame").getByText("Count: 0")).toBeVisible();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.locator(".verdict--fail")).toBeVisible();

  await page.evaluate(
    ([key, code]) => localStorage.setItem(key, JSON.stringify(code)),
    ["jsnotes:code:" + exercise.id, exercise.solution]
  );
  await page.reload();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.locator(".verdict--pass")).toContainText(`All ${exercise.tests.length} tests pass`);

  expect(problems).toEqual([]);
});

test("the mock lobby hydrates cleanly with saved choices", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "groundwork:mock:config",
      JSON.stringify({ role: "frontend", seniority: "senior", company: "agency", intensity: "full" })
    );
    localStorage.setItem("jsnotes:theme", JSON.stringify("dark"));
  });
  const problems = collectProblems(page);

  await page.goto("/mock", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Whose loop?" })).toBeVisible();
  const steps = page.getByRole("list", { name: "Steps" });
  await expect(steps.getByRole("button", { name: /^Role/ })).toBeDisabled();
  await expect(steps.getByRole("button", { name: /^Your loop/ })).toBeDisabled();
  await page.getByRole("tab", { name: "Single round" }).click();
  await expect(
    page.getByRole("group", { name: "Experience" }).getByRole("button", { name: /^10\+ years/ })
  ).toHaveAttribute("aria-pressed", "true");
  expect(problems, "the lobby logged problems").toEqual([]);
});

test("switching language gives that language's starter and keeps each language's code", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto("/problems/ex-two-sum");
  const editor = page.locator(".cm-content");
  const pick = async (name: string) => {
    await page.getByRole("combobox", { name: "Language", exact: true }).click();
    await page.getByRole("option", { name, exact: true }).click();
  };

  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("// mine, in JavaScript\n");

  await pick("Java");
  await expect(editor).toContainText("public int[] twoSum(int[] nums, int target)");
  await page.getByRole("button", { name: "Run the code" }).click();
  await expect(page.getByText(/No Java compiler runs in a browser/)).toBeVisible();

  await pick("Python");
  await expect(editor).toContainText("def twoSum(nums: list[int], target: int) -> list[int]:");
  await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();

  await pick("JavaScript");
  await expect(editor).toContainText("// mine, in JavaScript");
  expect(problems).toEqual([]);
});

test("the playground runs examples to the end and switches language from its chips", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto("/practice?id=free");
  await expect(page.locator(".cm-content")).toBeVisible();

  await page.getByRole("combobox", { name: "Load an example" }).click();
  await page.getByRole("option", { name: "Event loop order" }).click();
  await page.getByRole("button", { name: "Run the code" }).click();
  const lines = page.locator("#view-console .line");
  await expect(lines).toHaveCount(6);
  await expect(lines.last()).toContainText("5 · timeout (macrotask)");
  await expect(page.locator(".run-status")).toContainText("✓ ran");

  await page.getByRole("group", { name: "Quick language" }).getByRole("button", { name: /SQL/ }).click();
  await expect(page.locator(".cm-content")).toContainText("CREATE TABLE users");
  expect(problems).toEqual([]);
});

test("the editor lints as you type, formats on save and has a command palette", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto("/practice?id=free");
  const editor = page.locator(".cm-content");
  await expect(editor.locator(".tok-key").first()).toBeVisible();

  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("var total = 0\nif (total == '1') console.log(totl)\n");

  await expect(page.locator(".ed__problems")).toHaveText("✕ 1 ⚠ 2", { timeout: 15_000 });
  await page.locator(".ed__problems").click();
  await expect(page.locator("#view-problems")).toContainText("eslint(no-undef)");
  await expect(page.locator('.problem[data-severity="warning"] .problem__mark').first()).toHaveCSS(
    "color",
    themeColour("light", "--caution")
  );

  await editor.click();
  await page.keyboard.press("ControlOrMeta+s");
  await expect(editor).toContainText('if (total == "1") console.log(totl);', { timeout: 15_000 });

  await page.keyboard.press("ControlOrMeta+Shift+p");
  await page.getByRole("combobox", { name: "Command" }).fill("run on save");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Editor settings" }).click();
  await expect(page.getByRole("switch", { name: "Run the code" })).toBeChecked();

  await page
    .getByRole("group", { name: "Quick language" })
    .getByRole("button", { name: /TypeScript/ })
    .click();
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("const n: number = 'five';\n");
  await expect(page.locator(".ed__problems")).toHaveText("✕ 1 ⚠ 0", { timeout: 20_000 });
  expect(problems).toEqual([]);
});

test("the playground has no sidebar, a site menu, and goes back where you came from", async ({ page }) => {
  await page.goto("/notes/basic-async");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("dialog", { name: /menu/ })
    .getByRole("navigation", { name: "Site" })
    .getByRole("link", { name: "Playground" })
    .click();
  await page.waitForURL("**/practice?id=free");

  await page.getByRole("button", { name: "Menu" }).click();
  const drawer = page.getByRole("dialog", { name: /menu/ });
  await expect(
    drawer.getByRole("navigation", { name: "Site" }).getByRole("link", { name: "Whiteboard" })
  ).toBeVisible();
  await drawer.getByRole("button", { name: /Theme/ }).click();
  await drawer.getByRole("radio", { name: "Kraft" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "kraft");
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);

  const back = page.getByRole("link", { name: /Back to/ });
  await back.click();
  await page.waitForURL("**/notes/basic-async");
});

test("the playground shows each log's value beside its line, live as you type", async ({ page }) => {
  await page.goto("/practice?id=free");
  const editor = page.locator(".cm-content");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("for (let i = 1; i <= 3; i++) console.log(i * i);\nnull.x;\n");
  await page.getByRole("button", { name: "Run the code" }).click();
  await expect(page.locator(".cm-inline-result").first()).toHaveText("// 9  ×3");
  await expect(page.locator(".cm-inline-result--error")).toContainText("Cannot read properties of null");

  await page.getByRole("button", { name: /Live/ }).click();
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("console.log(6 * 7);\n");
  await expect(page.locator(".cm-inline-result")).toHaveText(["// 42"]);
});

test("the playground keeps several files in tabs, each in its own language", async ({ page }) => {
  await page.goto("/practice?id=free");
  const editor = page.locator(".cm-content");
  const files = page.getByRole("list", { name: "Files" });
  const file = (name: string) => files.getByRole("button", { name, exact: true });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("// kept in the js file\n");

  await page
    .getByRole("group", { name: "Quick language" })
    .getByRole("button", { name: /Python/ })
    .click();
  await expect(file("scratch.js")).toBeVisible();
  await expect(file("scratch.py")).toHaveAttribute("aria-current", "true");
  await expect(editor).toContainText("Pyodide");

  await file("scratch.js").click();
  await expect(editor).toContainText("// kept in the js file");

  await page.getByRole("button", { name: "New file" }).click();
  const create = page.getByRole("dialog", { name: "New file" });
  await create.getByRole("radio", { name: /JavaScript/ }).click();
  await create.getByRole("textbox", { name: "File name" }).fill("scratch");
  await expect(create).toContainText("There is already a file called scratch.js");
  await create.getByRole("textbox", { name: "File name" }).fill("helpers");
  await create.getByRole("button", { name: "Create file" }).click();
  await expect(file("helpers.js")).toHaveAttribute("aria-current", "true");

  await file("helpers.js").dblclick();
  const rename = page.getByRole("dialog", { name: /Rename helpers.js/ });
  await rename.getByRole("textbox", { name: "New name" }).fill("types.ts");
  await expect(rename).toContainText("Switches the file to TypeScript");
  await page.keyboard.press("Enter");
  await expect(page.locator(".ed__ready")).toHaveText("TypeScript");

  await page.getByRole("button", { name: "Close types.ts" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(file("types.ts")).toHaveCount(0);
  await page.getByRole("button", { name: /Reopen/ }).click();

  await page.reload();
  for (const name of ["scratch.js", "scratch.py", "types.ts"]) await expect(file(name)).toBeVisible();
});

test("the playground renders a web page from its html, css and js files", async ({ page }) => {
  await page.goto("/practice?id=free");
  await expect(page.locator(".cm-content")).toBeVisible();
  await page.getByRole("group", { name: "Quick language" }).getByRole("button", { name: /HTML/ }).click();
  const files = page.getByRole("list", { name: "Files" });
  for (const name of ["index.html", "style.css", "script.js"])
    await expect(files.getByRole("button", { name, exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Run the code" }).click();
  const frame = page.frameLocator("iframe.page-preview");
  await expect(frame.locator("h1")).toHaveText("Hello, page");
  await frame.getByRole("button", { name: "Click me" }).click();
  await expect(frame.locator("#count")).toHaveText("1");

  await page.getByRole("tab", { name: /Console/ }).click();
  await expect(page.locator("#view-console")).toContainText("clicked 1");
});

test("a share link opens the playground's files in another browser as new tabs", async ({ page, context, browser }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/practice?id=free");
  const editor = page.locator(".cm-content");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("console.log('from a friend')\n");
  await page.getByRole("button", { name: /Share/ }).click();
  await expect(page.getByRole("button", { name: /Link copied/ })).toBeVisible();
  const url = await page.evaluate(() => navigator.clipboard.readText());
  expect(url).toContain("#share=");

  const other = await browser.newContext();
  const friend = await other.newPage();
  await friend.goto(url);
  await expect(friend.locator(".cm-content")).toContainText("from a friend");
  await expect(friend.locator("#view-console")).toContainText("Opened 1 shared file");
  await other.close();
});

test("the playground keeps a history of runs and can reopen an earlier run's code", async ({ page }) => {
  await page.goto("/practice?id=free");
  const editor = page.locator(".cm-content");
  const run = page.getByRole("button", { name: "Run the code" });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("console.log('first version')\n");
  await run.click();
  await expect(page.locator(".run-status")).toContainText("✓ ran");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("throw new Error('second version')\n");
  await run.click();
  await expect(page.locator(".run-status")).toContainText("✕ error");

  await page.getByRole("tab", { name: /History/ }).click();
  const rows = page.locator(".run");
  await expect(rows).toHaveCount(2);
  await expect(rows.last()).toContainText("first version");
  await rows.last().getByRole("button", { name: "Open this code" }).click();
  await expect(editor).toContainText("console.log('first version')");
  await expect(
    page.getByRole("list", { name: "Files" }).getByRole("button", { name: "scratch-earlier.js", exact: true })
  ).toBeVisible();
});

test("the playground reads stdin and compares how fast two solutions run", async ({ page }) => {
  await page.goto("/practice?id=free");
  const editor = page.locator(".cm-content");
  await page.getByRole("tab", { name: /Input/ }).click();
  await page.locator(".stdin__box").fill("Ada\n3\n4\n");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText(
    "const name = prompt();\nconst a = Number(readline()), b = Number(readline());\nconsole.log(`${name}: ${a + b}`);\ncompare({ slow: () => [...Array(200).keys()].reduce((x, y) => x + y), fast: () => 1 }, { budgetMs: 50 });\n"
  );
  await page.getByRole("button", { name: "Run the code" }).click();
  await expect(page.locator("#view-console")).toContainText("Ada: 7");
  await expect(page.locator(".sql-result")).toContainText("🏆 fast");
});

test("the debugger steps through code and draws what it holds", async ({ page }) => {
  await page.goto("/practice?id=free");
  const editor = page.locator(".cm-content");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText(
    "const list = { val: 1, next: { val: 2, next: null } };\nconst nums = [3, 1];\nlet total = 0;\nfor (const n of nums) total += n;\nconsole.log(total);\n"
  );
  await page.getByRole("button", { name: /Debug/ }).click();
  await expect(page.locator(".debug__where")).toContainText("line 1");
  await page.getByRole("button", { name: "Last step" }).click();
  await expect(page.locator(".debug__where")).toContainText("line 5");
  await expect(page.locator(".debug__var", { hasText: "list" }).locator(".dv-list")).toContainText("1→2→null");
  await expect(page.locator(".debug__var", { hasText: "total" })).toContainText("4");
  await expect(page.locator(".cm-debug-line")).toContainText("console.log(total)");
});

test("debugging a problem runs the solution on its first test's input", async ({ page }) => {
  await page.goto("/problems/ex-two-sum");
  await expect(page.locator(".cm-content")).toBeVisible();
  await page.getByRole("tab", { name: /Hints/ }).click();
  await page.getByRole("button", { name: "Show the solution" }).click();
  await page.getByRole("dialog", { name: "Show the solution?" }).getByRole("button", { name: "Show solution" }).click();
  await page.getByRole("button", { name: /Debug/ }).click();
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.locator(".debug__where")).toContainText("in twoSum");
  await expect(page.locator(".debug__var", { hasText: "nums" })).toContainText("2");
});

test("lua runs in the browser and is graded against a problem's tests", async ({ page }) => {
  await page.goto("/problems/ex-two-sum");
  const editor = page.locator(".cm-content");
  await page.getByRole("combobox", { name: "Language", exact: true }).click();
  await page.getByRole("option", { name: "Lua", exact: true }).click();
  await expect(editor).toContainText("function twoSum(nums, target)");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText(
    "function twoSum(nums, target)\n  local seen = {}\n  for i, n in ipairs(nums) do\n    if seen[target - n] ~= nil then return {seen[target - n], i - 1} end\n    seen[n] = i - 1\n  end\n  return {}\nend\n"
  );
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.locator(".verdict")).toContainText("All 7 tests pass", { timeout: 60_000 });
});

test("python can be stepped through too", async ({ page }) => {
  await page.goto("/practice?id=free");
  await page
    .getByRole("group", { name: "Quick language" })
    .getByRole("button", { name: /Python/ })
    .click();
  const editor = page.locator(".cm-content");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("nums = [3, 1, 2]\ntotal = 0\nfor n in nums:\n    total += n\nprint(total)\n");
  await page.getByRole("button", { name: /Debug/ }).click();
  await expect(page.locator(".debug__where")).toContainText("line 1", { timeout: 90_000 });
  await page.getByRole("button", { name: "Last step" }).click();
  await expect(page.locator(".debug__var", { hasText: "total" })).toContainText("6");
  await expect(page.locator(".debug__out")).toContainText("6");
});

test("the design round has a whiteboard that stays with the answer", async ({ page }) => {
  await page.goto("/mock");
  await page.getByRole("tab", { name: "Single round" }).click();
  await page
    .getByRole("button", { name: /^System design/ })
    .first()
    .click();
  await page.getByRole("button", { name: /^Start/ }).click();
  await page.getByRole("button", { name: "Walk in" }).click();
  await expect(page.getByRole("log", { name: /Interview with/ })).toBeVisible();

  await page.getByRole("tab", { name: /Whiteboard/ }).click();
  await page.getByRole("button", { name: "+ Client" }).click();
  await page.getByRole("button", { name: "+ Service" }).click();
  await page.getByRole("button", { name: "Arrow", exact: true }).click();
  const shapes = page.locator("svg g[data-kind]");
  await shapes.nth(0).click();
  await shapes.nth(1).click();
  await expect(page.getByRole("img", { name: "Whiteboard with 2 shapes and 1 arrows" })).toBeVisible();

  await page.getByRole("button", { name: "I've answered" }).click();
  const push = page.getByRole("button", { name: "Answered — show me" });
  if (await push.isVisible()) await push.click();
  await expect(page.getByText("Your whiteboard")).toBeVisible();
});

test("the mock lobby shows how ready you are and what to practise next", async ({ page }) => {
  await page.addInitScript(() => {
    const now = Date.now();
    const mk = (d: number, js: number, de: number) => ({
      id: `h${d}`,
      mode: "loop",
      config: { role: "fullstack", seniority: "mid", company: "product", intensity: "quick" },
      startedAt: now - d * 86400000 - 3e6,
      finishedAt: now - d * 86400000,
      stages: [
        { stage: "javascript", core: false, scores: [js] },
        { stage: "design", core: false, scores: [de] },
      ],
      verdict: "lean-hire",
      headline: "",
      level: "at",
      score: 0.6,
      questions: 4,
      timedOut: 0,
      skipped: 0,
    });
    localStorage.setItem("groundwork:mock:history", JSON.stringify([mk(1, 0.6, 0.3), mk(0, 0.8, 0.4)]));
  });
  await page.goto("/mock");
  const board = page.locator("section[aria-labelledby=mock-readiness]");
  await expect(board.getByRole("img", { name: /Readiness \d+ out of 100/ })).toBeVisible();
  await expect(board.getByText("2 🔥")).toBeVisible();
  await expect(board.getByText("System design").first()).toBeVisible();
  await board.getByRole("button", { name: "Set up that round" }).click();
  await expect(page.getByRole("tab", { name: "Single round" })).toHaveAttribute("aria-selected", "true");
});

for (const [width, maxBar] of [
  [1024, 80],
  [768, 80],
  [390, 130],
] as const) {
  test(`the playground fits a ${width}px screen`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/practice?id=free");
    await expect(page.locator(".cm-content")).toBeVisible();
    const bar = await page.locator(".lc-topbar").boundingBox();
    expect(bar!.height).toBeLessThanOrEqual(maxBar);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await expect(page.getByRole("button", { name: "Run the code" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Debug" })).toBeVisible();
  });
}

test("the playground opens at the top and fits the screen on a laptop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/problems/ex-accounts-merge");
  await page.mouse.wheel(0, 800);
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("link", { name: "Playground", exact: true }).click();
  await page.waitForURL("**/practice?id=free");
  await expect(page.locator(".cm-content")).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(720);
});

test("the file menu opens next to the button that opened it", async ({ page }) => {
  await page.goto("/practice?id=free");
  await expect(page.locator(".cm-content")).toBeVisible();
  const button = page.getByRole("button", { name: "File actions" });
  const at = (await button.boundingBox())!;
  await button.click();
  const menu = (await page.getByRole("menu").boundingBox())!;
  expect(Math.abs(menu.x - at.x)).toBeLessThan(12);
  expect(Math.abs(menu.y - (at.y + at.height))).toBeLessThan(16);
});

test("the problems page filters by topic and difficulty and keeps them in the URL", async ({ page }) => {
  await page.goto("/problems");
  const status = page.getByRole("status").first();
  await expect(status).toHaveText(/All \d+ problems/);
  const filters = page.getByRole("complementary", { name: "Filters" });
  await filters.getByRole("button", { name: /DSA/ }).click();
  await filters.getByRole("button", { name: /advanced/i }).click();
  await expect(page).toHaveURL(/topic=dsa/);
  await expect(page).toHaveURL(/level=advanced/);
  await expect(status).toHaveText(/\d+ of \d+ problems/);

  await page.getByRole("button", { name: "One list" }).click();
  await page.getByRole("searchbox", { name: "Search problems" }).fill("zzzz-no-such-problem");
  await expect(page.getByText("No problems match")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(status).toHaveText(/All \d+ problems/);

  await page.reload();
  await expect(page).toHaveURL(/view=list/);
  await page.keyboard.press("/");
  await expect(page.getByRole("searchbox", { name: "Search problems" })).toBeFocused();
});

test("problem groups start with only the first open and collapse all together", async ({ page }) => {
  await page.goto("/problems");
  const toggles = page.locator("button[aria-controls^='gl-']");
  const open = page.locator("button[aria-expanded='true'][aria-controls^='gl-']");
  await expect(toggles.first()).toHaveAttribute("aria-expanded", "true");
  await expect(open).toHaveCount(1);
  await toggles.nth(3).click();
  await toggles.nth(6).click();
  await expect(open).toHaveCount(3);
  await page.getByRole("button", { name: "Collapse all" }).click();
  await expect(open).toHaveCount(0);
  await page.getByRole("button", { name: "Expand all" }).click();
  await expect(open).toHaveCount(await toggles.count());
});

test("the architecture map links every box to a written chapter", async ({ page }) => {
  await page.goto("/architecture");
  const nodes = page.locator("main a[href^='/architecture/arch-']");
  expect(await nodes.count()).toBeGreaterThanOrEqual(46);
  await expect(page.locator("main li > span[class*='__node']")).toHaveCount(0);
  await page.getByRole("link", { name: /Whiteboard An SVG board/ }).click();
  await page.waitForURL("**/architecture/arch-whiteboard");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("an architecture chapter has its own rail, contents and read marker", async ({ page }) => {
  await page.goto("/architecture/arch-build");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectOneSetOfDiagramDefs(page);
  const rail = page.getByRole("navigation", { name: "Chapters" });
  await expect(rail.locator("a[aria-current=page]")).toContainText("The build");
  await expect(rail.locator("button[aria-controls='rail-intermediate']")).toHaveAttribute("aria-expanded", "true");
  const beginnerHead = rail.locator("button[aria-controls='rail-beginner']");
  await expect(beginnerHead).toHaveAttribute("aria-expanded", "false");
  await beginnerHead.click();
  await expect(beginnerHead).toHaveAttribute("aria-expanded", "true");
  const contents = page.getByRole("complementary", { name: "On this page" });
  const firstSection = contents.getByRole("link").first();
  const target = (await firstSection.getAttribute("href"))!;
  await firstSection.click();
  await expect(page).toHaveURL(new RegExp(`${target}$`));

  await contents.getByRole("button", { name: /Mark as read/ }).click();
  await expect(rail.locator("a[aria-current=page]")).toContainText("✓");

  await page.getByRole("heading", { level: 1 }).click();
  await page.keyboard.press("]");
  await page.waitForURL("**/architecture/arch-rendering");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Server, client");
  const pager = page.getByRole("navigation", { name: "Chapter navigation" });
  await expect(pager.getByRole("link", { name: /^Previous/ })).toHaveAttribute("href", "/architecture/arch-build");
  await expect(pager.getByRole("link", { name: /^Next/ })).toHaveAttribute("href", "/architecture/arch-state");
  await page.keyboard.press("[");
  await page.waitForURL("**/architecture/arch-build");
});

test("the site menu folds its sections and changes the text size everywhere", async ({ page }) => {
  await page.goto("/architecture/arch-build");
  await page.getByRole("button", { name: "Menu" }).click();
  const menu = page.getByRole("dialog", { name: /menu/ });
  await expect(menu.getByRole("navigation", { name: "Site" }).getByRole("link", { name: "Whiteboard" })).toBeVisible();
  await expect(menu.getByRole("button", { name: /Theme/ })).toHaveAttribute("aria-expanded", "false");
  const built = menu.getByRole("button", { name: /How this is built/ });
  await expect(built).toContainText("I2");
  await built.click();
  await expect(
    menu.getByRole("navigation", { name: "How this is built" }).locator("a[aria-current=page]")
  ).toContainText("The build");
  await expect(menu.getByRole("button", { name: /Interview book/ })).toHaveAttribute("aria-expanded", "false");
  await expect(
    menu.getByRole("navigation", { name: "Topics" }).getByRole("link", { name: /Interview book/ })
  ).toHaveCount(0);
  const textSize = menu.getByRole("button", { name: /Text size/ });
  await textSize.click();
  await expect(textSize).toHaveAttribute("aria-expanded", "true");
  await menu.getByRole("button", { name: "Larger text" }).click();
  await expect(menu.locator("output")).toHaveText("110%");
  await page.keyboard.press("Escape");

  await page.goto("/problems");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue("--reader-zoom")))
    .toBe("1.1");
  await page.getByRole("button", { name: "Menu" }).click();
  const problemsMenu = page.getByRole("dialog", { name: /menu/ });
  await expect(problemsMenu.getByRole("button", { name: /Theme/ })).toHaveAttribute("aria-expanded", "false");
  await expect(problemsMenu.getByRole("button", { name: /Text size/ })).toHaveCount(0);
});

test("the git guide has a chapter per section and old anchors still land", async ({ page }) => {
  await page.goto("/git");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Git");
  await expectOneSetOfDiagramDefs(page);
  await page.getByRole("link", { name: /Setup and configuration/ }).click();
  await page.waitForURL("**/git/config");
  await expect(page.getByRole("navigation", { name: "Chapters" }).locator("a[aria-current=page]")).toContainText(
    "Setup"
  );
  await page.getByRole("button", { name: "Menu" }).click();
  const menu = page.getByRole("dialog", { name: /menu/ });
  await expect(menu.getByRole("navigation", { name: "Site" }).getByRole("link", { name: "Git" })).toHaveCount(0);
  const topicsFold = menu.getByRole("button", { name: /Topics/ });
  await expect(topicsFold).toHaveAttribute("aria-expanded", "false");
  await expect(topicsFold).toContainText("Git");
  await topicsFold.click();
  await expect(menu.getByRole("navigation", { name: "Topics" }).locator("a[aria-current=page]")).toContainText("Git");
  await menu.getByRole("searchbox").fill("white");
  await expect(menu.getByRole("link", { name: /Whiteboard/ })).toBeVisible();
  await expect(menu.getByRole("link", { name: /React/ })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(menu.getByRole("searchbox")).toHaveValue("");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);

  await page.goto("/git#undo");
  await page.waitForURL("**/git/undo");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Undoing");
});

test("the home page reads as a landing page and every path leads somewhere real", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("jsnotes:theme", JSON.stringify("lavender")));
  await page.goto("/");
  for (const name of [/Read it. Run it/, /a path that starts there/i, /Ready to read today/, /Before you start/]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  const faq = page.locator("details", { hasText: "Do I need to sign up?" });
  await faq.locator("summary").click();
  await expect(faq).toContainText("There is no account");

  await page.getByRole("button", { name: /Run tests/ }).click();
  await expect(page.getByText("3 / 3 passed", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Break it" }).click();
  await page.getByRole("button", { name: /Run tests/ }).click();
  await expect(page.getByText("1 / 3 passed", { exact: true })).toBeVisible();
  await expect(page.locator("[class*='__editor'][data-state='fail']")).toHaveCSS(
    "box-shadow",
    containing(themeColour("lavender", "--danger"))
  );
  await page.getByRole("button", { name: "Reset" }).click();

  await page.getByRole("tab", { name: /Mid/ }).click();
  await expect(page.getByRole("tab", { name: /Mid/ })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tabpanel").getByRole("link", { name: "The machine coding round" }).click();
  await page.waitForURL("**/interview/r2");
  await page.goBack();
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("dialog", { name: /menu/ })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 375, height: 800 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("the privacy page is indexed, framed, and linked from the menu, the home page, the FAQ and the footer", async ({
  page,
}) => {
  await page.goto("/privacy");
  await expect(page.locator("header a.head-back")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy");
  await expect(page).toHaveTitle(/^Privacy · /);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /what leaves it/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/privacy$/);
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(
    page.getByRole("dialog", { name: /menu/ }).getByRole("link", { name: "Privacy", exact: true })
  ).toHaveAttribute("href", "/privacy");
  await page.keyboard.press("Escape");

  await page.goto("/");
  await expect(
    page.locator("article", { hasText: "Nothing to sign up for" }).getByRole("link", { name: "The privacy page" })
  ).toHaveAttribute("href", "/privacy");
  const faq = page.locator("details", { hasText: "Do I need to sign up?" });
  await faq.locator("summary").click();
  await expect(faq).toContainText("anonymous page analytics");
  await expect(faq.getByRole("link", { name: /What leaves/ })).toHaveAttribute("href", "/privacy");
  const built = page.locator("details", { hasText: "How is the site itself built?" });
  await built.locator("summary").click();
  await expect(built.getByRole("link", { name: /Read how it is built/ })).toHaveAttribute("href", "/architecture");
  await expect(page.getByRole("navigation", { name: "You" }).getByRole("link", { name: "Privacy" })).toHaveAttribute(
    "href",
    "/privacy"
  );
});

test("the interview book hides answers in practice mode, remembers marks and drills them", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("jsnotes:theme", JSON.stringify("lavender")));
  await page.goto("/interview/r3");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("JavaScript");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  const first = page.locator("article").first();
  await expect(first.getByRole("button", { name: "Show the answer" })).toBeVisible();
  await first.getByRole("button", { name: "Show the answer" }).click();
  await expect(first.getByText("The answer that loses the room")).toBeVisible();
  await first.getByRole("button", { name: "Shaky" }).click();
  await expect(first.getByRole("button", { name: "Shaky" })).toHaveAttribute("aria-pressed", "true");
  await expect(first.getByRole("button", { name: "Shaky" })).toHaveCSS(
    "border-color",
    themeColour("lavender", "--caution")
  );
  await page.getByRole("button", { name: "Read", exact: true }).click();

  await page.goto("/interview/questions?filter=shaky");
  await expect(page.getByText("1 of")).toBeVisible();
  await page.getByRole("button", { name: /Drill 1 as flashcards/ }).click();
  await page.getByRole("button", { name: /Reveal/ }).click();
  await page.getByRole("button", { name: /Knew it/ }).click();
  await expect(page.getByText("1 card through.")).toBeVisible();

  await page.goto("/interview");
  await expect(page.getByRole("link", { name: /JavaScript & TS/ })).toBeVisible();
  await page.getByRole("button", { name: "Agency" }).click();
  await expect(page.getByRole("button", { name: "Agency" })).toHaveAttribute("aria-pressed", "true");
});

test("review brings a due chapter back, and every section header has a way back", async ({ page }) => {
  await page.goto("/review");
  await page.evaluate(() => {
    const day = 86400000;
    localStorage.setItem(
      "jsnotes:progress",
      JSON.stringify({ chapters: { closures: { at: Date.now() - 5 * day, reviews: 0 } }, exercises: {} })
    );
  });
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("1 chapter");
  await page.getByRole("button", { name: "Start the session →" }).click();
  await page.getByRole("button", { name: "✓ I still had it" }).click();
  await expect(page.getByText("Session done.")).toBeVisible();
  await page.getByRole("button", { name: "Back to review" }).click();
  await page
    .getByRole("button", { name: "✓ I still had it" })
    .waitFor({ state: "detached" })
    .catch(() => {});
  await expect(page.getByText("still fresh")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Coming back soon" })).toBeVisible();

  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "By topic" })).toBeVisible();

  for (const path of [
    "/review",
    "/progress",
    "/mock",
    "/interview",
    "/interview/r1",
    "/interview/questions",
    "/notes",
    "/notes/setup-mental-model",
    "/react",
    "/dsa",
    "/system-design",
    "/typescript",
    "/typescript/ts-setup-compiler",
    "/level/js",
  ]) {
    await page.goto(path);
    await expect(page.locator("header a.head-back")).toBeVisible();
  }
});

test("the home page's primary action takes each theme's accent", async ({ page }) => {
  const start = page.getByRole("link", { name: /Start with JavaScript/ }).first();
  await page.goto("/");
  await expect(start).toHaveCSS("background-color", themeColour("light", "--primary"));

  for (const theme of THEMES) {
    await page.evaluate((value) => localStorage.setItem("jsnotes:theme", JSON.stringify(value)), theme);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(start, theme).toHaveCSS("background-color", themeColour(theme, "--primary"));
    await expect(start, theme).toHaveCSS("color", themeColour(theme, "--on-primary"));
  }
});

test("the theme picker shows each theme's accent, and the current theme's accent on the selected card", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("jsnotes:theme", JSON.stringify("dark")));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: /menu/ });
  await drawer.getByRole("button", { name: /Theme/ }).click();
  const cards = drawer.getByRole("radiogroup", { name: "Theme" }).getByRole("radio");
  await expect(cards).toHaveCount(THEMES.length);

  for (const [i, theme] of THEMES.entries()) {
    const swatch = cards.nth(i).locator("[data-theme]");
    await expect(swatch).toHaveAttribute("data-theme", theme);
    await expect(swatch.locator(":scope > :first-child > :last-child"), theme).toHaveCSS(
      "background-color",
      themeColour(theme, "--primary")
    );
  }
  const night = drawer.getByRole("radio", { name: "Night" });
  await expect(night).toHaveAttribute("aria-checked", "true");
  await expect(night).toHaveCSS("border-color", themeColour("dark", "--primary"));
});

test("review, the interview book, mock and progress take the theme's accent, not a fixed green or red", async ({
  page,
}) => {
  const main = page.locator("#main");
  const surfaces = [
    { path: "/review", action: () => main.getByRole("link", { name: "Find something to read →" }), onAccent: true },
    {
      path: "/interview",
      action: () => main.getByRole("link", { name: /Start with the scouting report/ }),
      onAccent: true,
    },
    { path: "/interview/questions", action: () => main.getByRole("button", { name: "Every part" }), onAccent: true },
    { path: "/mock", action: () => main.getByRole("button", { name: "Plan a full loop" }), onAccent: true },
    { path: "/progress", action: () => main.locator("[class*='__xpBar'] > span"), onAccent: false },
  ];

  for (const theme of THEMES) {
    await page.goto("/");
    await page.evaluate((value) => localStorage.setItem("jsnotes:theme", JSON.stringify(value)), theme);

    for (const { path, action, onAccent } of surfaces) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(action(), `${path} in ${theme}`).toHaveCSS("background-color", themeColour(theme, "--primary"));
      if (onAccent)
        await expect(action(), `${path} in ${theme}`).toHaveCSS("color", themeColour(theme, "--on-primary"));
      if (path === "/mock")
        await expect(page.locator("#plan").getByText("start here", { exact: true }), `${path} in ${theme}`).toHaveCSS(
          "color",
          themeColour(theme, "--ink-soft")
        );
    }
  }
});

test("problems, the whiteboard, git and architecture take the theme's accent, and a read chapter shows success", async ({
  page,
}) => {
  const surfaces = [
    { path: "/problems", action: () => page.getByRole("link", { name: "Solve it" }) },
    { path: "/git", action: () => page.getByRole("link", { name: /^(Start|Continue) reading/ }) },
    { path: "/architecture", action: () => page.getByRole("link", { name: /^(Start|Continue) reading/ }) },
    { path: "/whiteboard", action: () => page.getByRole("button", { name: "Select (V)" }) },
  ];
  const rail = page.getByRole("navigation", { name: "Chapters" });
  const currentChapter = rail.locator('a[aria-current="page"]');
  const finish = page.getByRole("region", { name: "Finish" });
  const markRead = finish.getByRole("button", { name: "Mark as read" });

  for (const theme of THEMES) {
    const accent = themeColour(theme, "--primary");
    await page.goto("/");
    await page.evaluate((value) => localStorage.setItem("jsnotes:theme", JSON.stringify(value)), theme);

    for (const { path, action } of surfaces) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(action(), `${path} in ${theme}`).toHaveCSS("background-color", accent);
      await expect(action(), `${path} in ${theme}`).toHaveCSS("color", themeColour(theme, "--on-primary"));
    }

    for (const path of ["/git/merge", "/architecture/arch-build"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(currentChapter, `${path} in ${theme}`).toHaveCSS("box-shadow", containing(accent));
      await expect(page.locator("[data-scrollbar]"), `${path} in ${theme}`).toHaveCSS("background-color", accent);
      await expect(
        page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link"),
        `${path} in ${theme}`
      ).toHaveCSS("color", accent);
      if (path === "/git/merge") await expect(markRead, `${path} in ${theme}`).toHaveCSS("background-color", accent);
    }
  }

  expect(themeColour("forest", "--success")).not.toBe(themeColour("forest", "--green"));
  await page.evaluate(() => localStorage.setItem("jsnotes:theme", JSON.stringify("forest")));
  await page.goto("/git/merge");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "forest");
  await markRead.click();
  await expect(finish.getByRole("button", { name: "Mark as unread" })).toBeVisible();
  await expect(finish.locator("[class*='__endMark']")).toHaveCSS(
    "background-color",
    themeColour("forest", "--success")
  );
  await expect(currentChapter.getByLabel("read", { exact: true })).toHaveCSS("color", themeColour("forest", "--ink"));
  await expect(finish).toContainText("1 of");

  await page.goto("/git");
  const together = page.getByRole("region", { name: "Working together" });
  await expect(together.locator("a[href='/git/merge']").getByLabel("read", { exact: true })).toBeVisible();
  await expect(together).toContainText(/\b1\/\d+ read/);
});

test("topic covers and chapters, level, path and the playground take the theme's accent", async ({ page }) => {
  const cover = page.locator("header a.btn--primary");
  const readingProgress = page.locator("[data-scrollbar]");
  const inBodyLink = page.locator("#closures").getByRole("link", { name: "the outer reference" });
  const currentChapter = page.getByRole("navigation", { name: "Chapters" }).locator('a[aria-current="page"]');
  const run = page.getByRole("button", { name: "Run the code" });
  const writtenRow = page.locator("[class*='__itemReady'] [class*='__itemCheck']").first();
  const levelCta = page.locator("[class*='__cardCta']").first();
  const levelListCode = page.locator("[class*='__cardList'] code").first();
  const pathMeter = page.locator("#path-meter-fill");
  const doneStepCheck = page.locator('[data-step="setup-mental-model"][data-done="true"] [data-role="check-mark"]');
  const meanwhileLink = page.getByRole("link", { name: /JavaScript is written/i });

  for (const theme of THEMES) {
    const accent = themeColour(theme, "--primary");
    const onAccent = themeColour(theme, "--on-primary");
    await page.goto("/");
    await page.evaluate((value) => localStorage.setItem("jsnotes:theme", JSON.stringify(value)), theme);

    await page.goto("/notes");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(cover, `/notes in ${theme}`).toHaveCSS("background-color", accent);
    await expect(cover, `/notes in ${theme}`).toHaveCSS("color", onAccent);

    await page.goto("/notes/closures");
    await expect(readingProgress, `/notes/closures in ${theme}`).toHaveCSS("background-color", accent);
    await expect(inBodyLink, `/notes/closures in ${theme}`).toHaveCSS("color", accent);
    await expect(currentChapter, `/notes/closures in ${theme}`).toHaveCSS("box-shadow", containing(accent));
    await page.keyboard.press("Tab");
    await inBodyLink.focus();
    await expect(inBodyLink, `/notes/closures in ${theme}`).toHaveCSS("outline-style", "solid");
    await expect(inBodyLink, `/notes/closures in ${theme}`).toHaveCSS("outline-color", accent);

    await page.goto("/practice");
    await expect(run, `/practice in ${theme}`).toHaveCSS("background-color", accent);
    await expect(run, `/practice in ${theme}`).toHaveCSS("color", onAccent);

    await page.goto("/level/js");
    await expect(writtenRow, `/level/js in ${theme}`).toHaveCSS("background-color", accent);
    await expect(levelCta, `/level/js in ${theme}`).toHaveCSS("color", accent);
    await expect(levelListCode, `/level/js in ${theme}`).toHaveCSS("color", themeColour(theme, "--ink-soft"));

    await page.evaluate(() =>
      localStorage.setItem(
        "jsnotes:progress",
        JSON.stringify({ chapters: { "setup-mental-model": true }, exercises: {} })
      )
    );
    await page.goto("/path/js/beginner");
    await expect(pathMeter, `/path in ${theme}`).toHaveCSS("background-color", accent);
    await expect(doneStepCheck, `/path in ${theme}`).toHaveCSS("background-color", accent);
    await page.evaluate(() => localStorage.removeItem("jsnotes:progress"));

    await page.goto("/typescript");
    await meanwhileLink.hover();
    await expect(meanwhileLink, `/typescript in ${theme}`).toHaveCSS("color", accent);
  }
});

function colourChannels(value: string): number[] {
  const srgb = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(value);
  if (srgb) return [...srgb.slice(1, 4).map((v) => Math.round(Number(v) * 255)), Number(srgb[4] ?? 1)];
  const rgb = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/.exec(value);
  return rgb ? [...rgb.slice(1, 4).map(Number), Number(rgb[4] ?? 1)] : [];
}

function contrastRatio(a: number[], b: number[]): number {
  const luminance = (channels: number[]) => {
    const [red, green, blue] = channels.slice(0, 3).map((value) => {
      const share = value / 255;
      return share <= 0.03928 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

test("links inside a kept callout keep the callout's colour", async ({ page }) => {
  await page.goto("/notes/basic-async");
  const warn = page
    .locator(".warn")
    .filter({ has: page.locator("a") })
    .first();
  const callout = await warn.evaluate((box) => getComputedStyle(box).color);
  await expect(warn.locator("a").first()).toHaveCSS("color", callout);
});

test("the cover's primary action takes the theme's accent instead of a fixed red", async ({ page }) => {
  const cta = page.locator("header a.btn--primary");

  await page.goto("/notes");
  await expect(cta).toHaveCSS("background-color", themeColour("light", "--primary"));
  await expect(cta).not.toHaveCSS("background-color", themeColour("light", "--red"));

  await page.evaluate(() => localStorage.setItem("jsnotes:theme", JSON.stringify("lavender")));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "lavender");
  await expect(cta).toHaveCSS("background-color", themeColour("lavender", "--primary"));
});

test("a written chapter's end-card accent takes the theme's accent instead of a fixed red", async ({ page }) => {
  const markAsRead = page.getByRole("region", { name: "Finish" }).getByRole("button", { name: "Mark as read" });

  await page.goto("/notes/closures");
  await expect(markAsRead, "light").toHaveCSS("background-color", themeColour("light", "--primary"));
  await expect(markAsRead, "light").not.toHaveCSS("background-color", themeColour("light", "--red"));

  await page.evaluate(() => localStorage.setItem("jsnotes:theme", JSON.stringify("lavender")));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "lavender");
  await expect(markAsRead, "lavender").toHaveCSS("background-color", themeColour("lavender", "--primary"));
});

test("a passed and a failed test keep their state colours where success is not green and danger is not red", async ({
  page,
}) => {
  const editor = page.locator(".cm-content");
  const testsCount = page.locator("#tests-count");
  expect(themeColour("lavender", "--danger")).not.toBe(themeColour("lavender", "--red"));
  expect(themeColour("forest", "--success")).not.toBe(themeColour("forest", "--green"));

  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("jsnotes:theme", JSON.stringify("lavender")));
  await page.goto("/problems/ex-two-sum");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "lavender");
  await expect(editor).toContainText("function twoSum(nums, target)");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.locator(".verdict--fail")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator(".test--fail .test__mark").first()).toHaveCSS("color", themeColour("lavender", "--danger"));
  await expect(testsCount).toHaveCSS("color", themeColour("lavender", "--ink"));

  await page.evaluate(() => localStorage.setItem("jsnotes:theme", JSON.stringify("forest")));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "forest");
  await expect(editor).toContainText("function twoSum(nums, target)");
  await page.getByRole("tab", { name: /Hints/ }).click();
  await page.getByRole("button", { name: "Show the solution" }).click();
  await page.getByRole("dialog", { name: "Show the solution?" }).getByRole("button", { name: "Show solution" }).click();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.locator(".verdict--pass")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator(".test--pass .test__mark").first()).toHaveCSS("color", themeColour("forest", "--success"));
  await expect(testsCount).toHaveCSS("color", themeColour("forest", "--ink"));
});

test("the editor's selected search match takes the theme's accent", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("jsnotes:theme", JSON.stringify("lavender")));
  await page.goto("/problems/ex-two-sum");
  const editor = page.locator(".cm-content");
  await expect(editor).toContainText("function twoSum(nums, target)");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+f");
  await page.keyboard.type("target");
  await page.keyboard.press("Enter");
  await expect(page.locator(".cm-searchMatch-selected").first()).toHaveCSS(
    "outline-color",
    themeColour("lavender", "--primary")
  );
});

test("the editor bar's selected language keeps its check mark and focus ring visible", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("jsnotes:theme", JSON.stringify("lavender")));
  await page.goto("/practice?id=ex-two-sum");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "lavender");
  const bar = page.locator(".ed__bar");
  await bar.getByRole("combobox", { name: "Language", exact: true }).focus();
  await page.keyboard.press("Enter");
  const selected = bar.getByRole("option", { name: "JavaScript", exact: true });
  await expect(selected).toBeFocused();
  await expect(selected).toHaveAttribute("aria-selected", "true");

  const shown = await selected.evaluate((option) => {
    const own = getComputedStyle(option);
    const check = getComputedStyle(option.querySelector(".dd__opt-check")!);
    return {
      focusVisible: option.matches(":focus-visible"),
      text: own.color,
      checkDisplay: check.display,
      check: check.color,
      ringStyle: own.outlineStyle,
      ring: own.outlineColor,
      fill: own.backgroundColor,
      menu: getComputedStyle(option.closest(".dd__menu")!).backgroundColor,
    };
  });
  const behind = colourChannels(shown.fill)[3] === 0 ? shown.menu : shown.fill;
  expect(shown.focusVisible).toBe(true);
  expect(shown.checkDisplay).not.toBe("none");
  expect(shown.check).toBe(shown.text);
  expect(shown.ringStyle).toBe("solid");
  expect(shown.ring).toBe(shown.text);
  expect(contrastRatio(colourChannels(shown.check), colourChannels(behind))).toBeGreaterThanOrEqual(3);
});

const FRAMES = 18;

const bsPlayer = (page: Page) => page.getByRole("group", { name: "Binary search player" });
const bsButton = (player: Locator, name: string) => player.getByRole("button", { name, exact: true });
const bsStep = (n: number) => `Step ${n} of ${FRAMES}`;

const readPlayer = (player: Locator) =>
  player.evaluate((root) => ({
    step: root.querySelector("label")!.textContent,
    line: root.querySelector('li[aria-current="step"] code')!.textContent,
    next:
      [...root.querySelectorAll("ol li")]
        .find((li) => li.firstElementChild?.textContent?.includes("next"))
        ?.querySelector("code")?.textContent ?? null,
    narration: root.querySelector('[role="status"]')!.textContent,
    vars: Object.fromEntries(
      [...root.querySelectorAll("dl > div")].map((row) => [
        row.querySelector("dt")!.textContent,
        row.querySelector("dd")!.textContent,
      ])
    ),
    marks: [...root.querySelectorAll("ul li")].map((cell) => cell.lastElementChild!.textContent),
    states: [...root.querySelectorAll("ul li")].map((cell) => cell.children[2].textContent),
  }));

test("the binary search chapter renders its first frame on the server and enhances the rest as before", async ({
  page,
  request,
}) => {
  const html = await (await request.get("/dsa/dsa-binary-search")).text();
  expect(html).toContain('data-island="play"');
  expect(html).toContain('data-play="binary-search"');
  expect(html).toContain(bsStep(1));
  expect(html).toContain("Search for 31 in a sorted array of 10 numbers.");
  expect(html).toContain('aria-current="step"');
  expect(html).toContain("<dl");
  expect(html).not.toContain("player for this chapter is not built yet");
  expect(html).not.toContain('id="bs-code"');
  expect(html).toContain("not started");
  expect(html).toContain("not set yet");
  expect(html).toContain("function binarySearch(sorted, target) {");
  expect(html).toContain("let lo = 0, hi = sorted.length - 1;");

  const problems = collectProblems(page);
  await page.goto("/dsa/dsa-binary-search");
  const island = page.locator('[data-island="play"]');
  await expect(island).toBeVisible();
  await expect(island).toHaveAttribute("data-no-smooth", "");
  await expect(island).toHaveAttribute("data-speech-exclude", "");
  await expect(island.locator(".codeblock__copy, .table-scroll")).toHaveCount(0);
  await expect(page.locator("#chapters script")).toHaveCount(0);
  await expect(page.locator("#chapters .codeblock__copy").first()).toBeVisible();
  await expect(bsPlayer(page).getByRole("status")).toHaveText("Search for 31 in a sorted array of 10 numbers.");
  expect(problems).toEqual([]);
});

test("the binary search player steps by keyboard with the code, the marks and the narration in step", async ({
  page,
}) => {
  await page.goto("/dsa/dsa-binary-search");
  const player = bsPlayer(page);
  await player.scrollIntoViewIfNeeded();
  await bsButton(player, "Next").focus();
  const before = await page.evaluate(() => ({ y: window.scrollY, path: location.pathname }));

  await page.keyboard.press("ArrowRight");
  let at = await readPlayer(player);
  expect(at.step).toBe(bsStep(2));
  expect(at.line).toBe("  let lo = 0, hi = sorted.length - 1;");
  expect(at.vars).toMatchObject({ lo: "0", hi: "9", mid: "not set yet" });
  expect(at.marks[0]).toBe("lo");
  expect(at.marks[9]).toBe("hi");

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  at = await readPlayer(player);
  expect(at.step).toBe(bsStep(4));
  expect(at.line).toContain("const mid = lo + Math.floor");
  expect(at.next).toContain("if (sorted[mid] === target)");
  expect(at.vars).toMatchObject({ lo: "0", hi: "9", mid: "4", "sorted[mid]": "20", target: "31" });
  expect(at.marks[4]).toBe("mid");
  expect(at.states[4]).toBe("checking");
  expect(at.narration).toBe("mid is 4, the middle of the range, and sorted[4] is 20.");

  await page.keyboard.press("ArrowLeft");
  at = await readPlayer(player);
  expect(at.step).toBe(bsStep(3));
  expect(at.line).toContain("while (lo <= hi)");
  expect(at.vars.mid).toBe("not set yet");
  expect(at.marks[4]).toBe("");

  for (let press = 0; press < 3; press++) await page.keyboard.press("ArrowRight");
  at = await readPlayer(player);
  expect(at.step).toBe(bsStep(6));
  expect(at.line).toContain("if (sorted[mid] < target) lo = mid + 1;");
  expect(at.vars).toMatchObject({ lo: "5", hi: "9", mid: "4" });
  expect(at.narration).toBe("sorted[4] = 20 is smaller than 31, so the answer is to the right and lo becomes 5.");
  expect(at.states.slice(0, 5)).toEqual(Array(5).fill("ruled out"));

  await page.keyboard.press("End");
  at = await readPlayer(player);
  expect(at.step).toBe(bsStep(FRAMES));
  expect(at.narration).toBe("sorted[6] = 31 equals the target, so the search returns index 6 after 4 comparisons.");
  expect(at.states[6]).toBe("found");
  await expect(bsButton(player, "Next")).toBeDisabled();
  await page.keyboard.press("ArrowRight");
  expect((await readPlayer(player)).step).toBe(bsStep(FRAMES));

  await page.keyboard.press("Home");
  at = await readPlayer(player);
  expect(at.step).toBe(bsStep(1));
  await expect(bsButton(player, "Back")).toBeDisabled();
  await page.keyboard.press("ArrowLeft");
  expect((await readPlayer(player)).step).toBe(bsStep(1));

  const after = await page.evaluate(() => ({ y: window.scrollY, path: location.pathname }));
  expect(after).toEqual(before);
});

test("the binary search player plays, pauses, scrubs, resets and stops itself", async ({ page }) => {
  await page.clock.install();
  await page.goto("/dsa/dsa-binary-search");
  const player = bsPlayer(page);
  const play = bsButton(player, "Play");
  await expect(play).toHaveAttribute("aria-pressed", "false");
  await player.scrollIntoViewIfNeeded();

  await play.click();
  const pause = bsButton(player, "Pause");
  await expect(pause).toHaveAttribute("aria-pressed", "true");
  await page.clock.runFor(1100);
  expect((await readPlayer(player)).step).toBe(bsStep(2));
  await page.clock.runFor(2200);
  expect((await readPlayer(player)).step).toBe(bsStep(4));

  await pause.press("Space");
  await expect(bsButton(player, "Play")).toHaveAttribute("aria-pressed", "false");
  await page.clock.runFor(5000);
  expect((await readPlayer(player)).step).toBe(bsStep(4));

  await player.getByRole("status").click();
  const parked = await page.evaluate(() => ({ y: window.scrollY, path: location.pathname }));
  await page.keyboard.press("Space");
  await expect(bsButton(player, "Pause")).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Space");
  await expect(bsButton(player, "Play")).toHaveAttribute("aria-pressed", "false");
  expect(await page.evaluate(() => ({ y: window.scrollY, path: location.pathname }))).toEqual(parked);
  const repeated = await player.evaluate((root) => {
    const event = new KeyboardEvent("keydown", { key: " ", repeat: true, bubbles: true, cancelable: true });
    root.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(repeated).toBe(true);
  await expect(bsButton(player, "Play")).toHaveAttribute("aria-pressed", "false");

  await bsButton(player, "Fast").click();
  await expect(bsButton(player, "Fast")).toHaveAttribute("aria-pressed", "true");
  await bsButton(player, "Play").click();
  await page.clock.runFor(500);
  expect((await readPlayer(player)).step).toBe(bsStep(5));

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(bsButton(player, "Play")).toHaveAttribute("aria-pressed", "false");
  await page.clock.runFor(3000);
  expect((await readPlayer(player)).step).toBe(bsStep(5));
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
  });

  const range = player.getByRole("slider", { name: bsStep(5) });
  await expect(range).toHaveAttribute("aria-valuetext", bsStep(5));
  await range.focus();
  await page.keyboard.press("ArrowRight");
  await expect(player.getByRole("slider", { name: bsStep(6) })).toHaveAttribute("aria-valuetext", bsStep(6));
  await player.getByRole("slider").fill("10");
  expect((await readPlayer(player)).step).toBe(bsStep(10));
  await player.getByRole("slider").press("Home");
  expect((await readPlayer(player)).step).toBe(bsStep(1));
  await player.getByRole("slider").press("End");
  expect((await readPlayer(player)).step).toBe(bsStep(FRAMES));

  await bsButton(player, "Play").click();
  expect((await readPlayer(player)).step).toBe(bsStep(1));
  await expect(bsButton(player, "Pause")).toHaveAttribute("aria-pressed", "true");
  await page.clock.runFor(500 * (FRAMES + 2));
  expect((await readPlayer(player)).step).toBe(bsStep(FRAMES));
  await expect(bsButton(player, "Play")).toHaveAttribute("aria-pressed", "false");
  await expect(bsButton(player, "Next")).toBeDisabled();

  await bsButton(player, "Reset").click();
  expect((await readPlayer(player)).step).toBe(bsStep(1));
  await expect(bsButton(player, "Play")).toHaveAttribute("aria-pressed", "false");
});

test("the binary search player keeps its focus when a step button reaches an end", async ({ page }) => {
  await page.goto("/dsa/dsa-binary-search");
  const player = bsPlayer(page);
  await bsButton(player, "Next").focus();
  await page.keyboard.press("End");
  await expect(bsButton(player, "Next")).toBeDisabled();
  await expect(bsButton(player, "Play")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  expect((await readPlayer(player)).step).toBe(bsStep(FRAMES - 1));
});

test("the binary search player has no transition under reduced motion and still steps", async ({ page }) => {
  const transitions = (player: Locator) =>
    player.evaluate(
      (root) =>
        [root, ...root.querySelectorAll("*")].filter((el) => {
          const style = getComputedStyle(el);
          return (
            style.transitionDuration.split(",").some((time) => parseFloat(time) > 0) || style.animationName !== "none"
          );
        }).length
    );

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/dsa/dsa-binary-search");
  expect(await transitions(bsPlayer(page))).toBeGreaterThan(0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await transitions(bsPlayer(page))).toBe(0);
  await bsButton(bsPlayer(page), "Next").click();
  expect((await readPlayer(bsPlayer(page))).step).toBe(bsStep(2));
});

const CODE_TOKENS = {
  javascript: ["function binarySearch", "function minEatingSpeed", "function lowerBound"],
  python: ["def binary_search", "def min_eating_speed", "def lower_bound"],
  java: ["static int binarySearch", "static int minEatingSpeed", "static int lowerBound"],
  cpp: [
    "int binarySearch(const std::vector<int>&",
    "int minEatingSpeed(const std::vector<int>&",
    "int lowerBound(const std::vector<int>&",
  ],
} as const;

async function expectCodeIn(page: Page, language: keyof typeof CODE_TOKENS) {
  const blocks = page.locator("#chapters [data-code]");
  await expect(blocks).toHaveCount(3);
  for (const [index, token] of CODE_TOKENS[language].entries()) {
    await expect(blocks.nth(index)).toContainText(token);
    for (const other of Object.keys(CODE_TOKENS) as (keyof typeof CODE_TOKENS)[]) {
      if (other !== language) await expect(blocks.nth(index)).not.toContainText(CODE_TOKENS[other][index]);
    }
  }
}

const jsnotesKeys = (page: Page) =>
  page.evaluate(() =>
    Object.keys(localStorage)
      .filter((key) => key.startsWith("jsnotes:"))
      .sort()
      .map((key) => `${key}=${localStorage.getItem(key)}`)
  );

test("a first visit to a DSA chapter shows JavaScript and the server sends no other language", async ({
  page,
  request,
}) => {
  const html = await (await request.get("/dsa/dsa-binary-search")).text();
  expect(html).toContain("function binarySearch");
  expect(html).not.toContain("def binary_search");
  expect(html).not.toContain("static int binarySearch");
  expect(html).not.toContain("std::vector");

  const fetched: string[] = [];
  page.on("request", (req) => {
    if (/\/_next\/static\/chunks\/.*\.js/.test(req.url())) fetched.push(req.url());
  });
  await page.goto("/dsa/dsa-binary-search", { waitUntil: "networkidle" });

  const group = page.getByRole("group", { name: "Code language" });
  await expect(group).toContainText("Code: JavaScript");
  await expect(group.getByRole("button", { name: "JavaScript" })).toHaveAttribute("aria-pressed", "true");
  for (const name of ["Python", "Java", "C++"]) {
    await expect(group.getByRole("button", { name, exact: true })).toHaveAttribute("aria-pressed", "false");
  }
  await expectCodeIn(page, "javascript");

  const before = fetched.length;
  await expectCodeIn(page, "javascript");
  expect(fetched.length).toBe(before);
  await group.getByRole("button", { name: "Python" }).click();
  await expectCodeIn(page, "python");
  expect(fetched.length).toBe(before + 1);
  await group.getByRole("button", { name: "Java", exact: true }).click();
  await expectCodeIn(page, "java");
  expect(fetched.length).toBe(before + 2);
});

test("the language switch rewrites the chapter code, remembers its choice and touches no jsnotes key", async ({
  page,
}) => {
  const problems = collectProblems(page);
  await page.goto("/dsa/dsa-binary-search", { waitUntil: "networkidle" });
  const group = page.getByRole("group", { name: "Code language" });
  const status = page.getByRole("status").filter({ hasText: /^Code shown in/ });
  const keysBefore = await jsnotesKeys(page);
  const checkBefore = await page.locator("#chapters").evaluate((el) => el.querySelectorAll("[data-island]").length);

  const steps = [
    { name: "Python", language: "python", said: "Code shown in Python" },
    { name: "Java", language: "java", said: "Code shown in Java" },
    { name: "C++", language: "cpp", said: "Code shown in C++" },
    { name: "JavaScript", language: "javascript", said: "Code shown in JavaScript" },
  ] as const;
  for (const step of steps) {
    await group.getByRole("button", { name: step.name, exact: true }).click();
    await expectCodeIn(page, step.language);
    await expect(group.getByRole("button", { name: step.name, exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(group).toContainText(`Code: ${step.name}`);
    await expect(status).toHaveText(step.said);
  }
  expect(await page.locator("#chapters").evaluate((el) => el.querySelectorAll("[data-island]").length)).toBe(
    checkBefore
  );
  expect(await jsnotesKeys(page)).toEqual(keysBefore);

  await group.getByRole("button", { name: "Java", exact: true }).click();
  await expectCodeIn(page, "java");
  await page.reload({ waitUntil: "networkidle" });
  await expect(
    page.getByRole("group", { name: "Code language" }).getByRole("button", { name: "Java", exact: true })
  ).toHaveAttribute("aria-pressed", "true");
  await expectCodeIn(page, "java");

  await page.goto("/dsa/dsa-two-pointers", { waitUntil: "networkidle" });
  await expect(page.getByRole("group", { name: "Code language" })).toContainText("Code: Java");
  await expect(page.locator("#chapters [data-code]")).toHaveCount(1);
  await expect(page.locator("#chapters [data-code]")).toContainText("static int[] twoSumSorted");
  await page.getByRole("group", { name: "Code language" }).getByRole("button", { name: "C++" }).click();
  await expect(page.locator("#chapters [data-code]")).toContainText("std::vector<int> twoSumSorted");
  await page.getByRole("group", { name: "Code language" }).getByRole("button", { name: "Python" }).click();
  await expect(page.locator("#chapters [data-code]")).toContainText("def two_sum_sorted");

  expect(await page.evaluate(() => localStorage.getItem("groundwork:dsa:lang"))).toBe(
    JSON.stringify({ v: 1, language: "python" })
  );
  expect(problems).toEqual([]);
});

test("the language switch works by keyboard and a stale stored value falls back to JavaScript", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("groundwork:dsa:lang", JSON.stringify({ v: 1, language: "cobol" }))
  );
  await page.goto("/dsa/dsa-binary-search", { waitUntil: "networkidle" });
  const group = page.getByRole("group", { name: "Code language" });
  await expect(group.getByRole("button", { name: "JavaScript" })).toHaveAttribute("aria-pressed", "true");
  await expectCodeIn(page, "javascript");

  const python = group.getByRole("button", { name: "Python", exact: true });
  await group.getByRole("button", { name: "JavaScript" }).focus();
  await page.keyboard.press("Tab");
  await expect(python).toBeFocused();
  await page.keyboard.press("Enter");
  await expectCodeIn(page, "python");
  await expect(page.getByRole("status").filter({ hasText: /^Code shown in/ })).toHaveText("Code shown in Python");

  await page.keyboard.press("Tab");
  await expect(group.getByRole("button", { name: "Java", exact: true })).toBeFocused();
  await page.keyboard.press("Space");
  await expectCodeIn(page, "java");
  await expect(page.getByRole("status").filter({ hasText: /^Code shown in/ })).toHaveText("Code shown in Java");
});

test("a topic without marked code blocks shows no language switch and never reads its key", async ({ page }) => {
  await page.addInitScript(() => {
    const reads: string[] = [];
    (window as unknown as { __reads: string[] }).__reads = reads;
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key: string) {
      reads.push(key);
      return original.call(this, key);
    };
  });
  for (const path of ["/notes/closures", "/dsa/dsa-hashing"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(page.getByRole("group", { name: "Code language" })).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __reads: string[] }).__reads)).not.toContain(
      "groundwork:dsa:lang"
    );
    expect(await page.evaluate(() => localStorage.getItem("groundwork:dsa:lang"))).toBeNull();
  }
});

test("a slow language chunk that resolves after a newer choice does not overwrite it", async ({ page }) => {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  let delayed = 0;
  await page.route(/\/_next\/static\/chunks\/.*\.js/, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    if (body.includes("def binary_search")) {
      delayed++;
      await gate;
    }
    await route.fulfill({ response, body });
  });
  await page.goto("/dsa/dsa-binary-search", { waitUntil: "networkidle" });
  const group = page.getByRole("group", { name: "Code language" });
  await group.getByRole("button", { name: "Python" }).click();
  await expect.poll(() => delayed).toBe(1);
  await group.getByRole("button", { name: "JavaScript" }).click();
  release();
  await page.waitForTimeout(500);
  await expectCodeIn(page, "javascript");
  await expect(group.getByRole("button", { name: "JavaScript" })).toHaveAttribute("aria-pressed", "true");
  await expect(group.getByRole("button", { name: "Python" })).toHaveAttribute("aria-pressed", "false");
});

test("the copy button copies the code in the chosen language", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/dsa/dsa-binary-search", { waitUntil: "networkidle" });
  await page.getByRole("group", { name: "Code language" }).getByRole("button", { name: "Python" }).click();
  await expectCodeIn(page, "python");
  const block = page.locator("#chapters [data-code]").first();
  await block.hover();
  await block.locator(".codeblock__copy").click();
  await expect(block.locator(".codeblock__copy")).toHaveText(/copied/);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^def /);
});
