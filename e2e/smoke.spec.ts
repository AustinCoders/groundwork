import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";
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
  await expect(page.getByRole("heading", { level: 1 })).not.toContainText("Understand JavaScript properly");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Walk into the interview ready.");
  await expect(page.getByRole("link", { name: /Start with JavaScript/ })).toHaveCount(0);
  await expect(page.locator(".brand__mark").first()).toHaveText("G");
  await expect(page.getByRole("link", { name: /Pick a topic/ }).first()).toHaveAttribute("href", "#shelf");
  await expect(
    page
      .locator("#shelf")
      .getByRole("link", { name: /JavaScript/ })
      .first()
  ).toBeVisible();
  for (const name of [/Read it. Run it/, /a path that starts there/i, /Pick a topic/, /Questions\./]) {
    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  const signUp = page.locator("#faq").getByRole("button", { name: "Do I need to sign up?" });
  await signUp.click();
  await expect(signUp).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#faq").getByRole("region", { name: "Do I need to sign up?" })).toContainText(
    "There is no account"
  );

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

  const prep = page.locator("#paths").getByRole("tab", { name: /Interview prep/ });
  await prep.click();
  await expect(prep).toHaveAttribute("aria-selected", "true");
  await page
    .locator("#paths")
    .getByRole("tabpanel")
    .getByRole("link", { name: /Machine coding/ })
    .click();
  await page.waitForURL("**/interview/r2");
  await page.goBack();
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("dialog", { name: /menu/ })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 375, height: 800 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("the home interview book opens at the first round, follows the stages and rounds, and links to the round", async ({
  page,
}) => {
  await page.goto("/");
  const book = page.locator("#loop");
  await expect(book.getByRole("heading", { level: 2, name: /From the first call to the offer/ })).toBeVisible();
  const page1 = book.getByRole("region", { name: "Screening call" });
  await expect(page1).toHaveAttribute("data-active", "true");
  await expect(page1).toContainText("Round 01");
  await expect(page1).toContainText("What they are really testing");
  await expect(page1).toContainText("The answer that loses the room");
  await expect(page1).toContainText("A question you will get");
  await expect(page1).toContainText("Tell me about yourself.");
  await expect(book.getByRole("button", { name: /Round 01/ })).toHaveAttribute("aria-current", "true");

  await book.getByRole("tab", { name: /^02 Technical/ }).click();
  const machine = book.getByRole("button", { name: /Machine coding/ });
  await expect(machine).toHaveAttribute("aria-current", "true");
  await expect(book.getByRole("button", { name: /Round 01/ })).toHaveCount(0);
  const machinePage = book.getByRole("region", { name: "Machine coding" });
  await expect(machinePage).toContainText("Round 05");
  await expect(machinePage).toContainText("Data modelling");

  const react = book.getByRole("button", { name: /React & Next\.js/ });
  await react.focus();
  await page.keyboard.press("Enter");
  await expect(react).toHaveAttribute("aria-current", "true");
  await expect(book.getByRole("region", { name: "React & Next.js" })).toContainText("Round 08");
  await expect(book.getByRole("status")).toContainText("Round 08, React & Next.js");

  await settleScroll(page);
  await book.getByRole("tab", { name: /^04 People and offer/ }).click();
  await expect(book.getByRole("button", { name: /Resume grilling/ })).toHaveAttribute("aria-current", "true");
  await settleScroll(page);
  const pin = await pinOf(page, "loop");
  const rowTitles = await book.locator("ol button [class*='rowName']").allTextContents();
  const followed: string[] = [];
  for (let i = 0; i < rowTitles.length; i++) {
    await scrollPin(page, "loop", 3 * pin.groupLength + ((i + 0.5) / rowTitles.length) * pin.groupLength);
    followed.push((await book.locator("ol button[aria-current='true'] [class*='rowName']").textContent()) ?? "");
  }
  expect(followed, "scrolling the pinned book walks the stage's rounds in order").toEqual(rowTitles);
  const title = followed[followed.length - 1].replace(/^Round \d+: /, "");
  await expect(book.getByRole("region", { name: title })).toHaveAttribute("data-active", "true");

  await book
    .getByRole("region", { name: title })
    .getByRole("link", { name: /Read this round/ })
    .click();
  await page.waitForURL(/\/interview\/r\d+/);
});

test("the home interview stage tabs list only the chosen stage's rounds and open on its first", async ({ page }) => {
  await page.goto("/");
  const book = page.locator("#loop");
  const stages = book.getByRole("tablist", { name: "Interview stages" });
  await expect(stages.getByRole("tab")).toHaveCount(4);
  const rows = book.getByRole("list").first().getByRole("button");
  const expected = [
    { stage: /^01 Screening/, rows: 4, first: "Screening call" },
    { stage: /^02 Technical/, rows: 6, first: "Machine coding" },
    { stage: /^03 Design and depth/, rows: 4, first: "Databases & Redis" },
    { stage: /^04 People and offer/, rows: 6, first: "Resume grilling" },
  ];
  for (const { stage, rows: count, first } of expected) {
    await stages.getByRole("tab", { name: stage }).click();
    await settleScroll(page);
    await expect(stages.getByRole("tab", { name: stage })).toHaveAttribute("aria-selected", "true");
    await expect(rows).toHaveCount(count);
    await expect(rows.first()).toContainText(first);
    await expect(rows.first()).toHaveAttribute("aria-current", "true");
    await expect(book.getByRole("region", { name: first })).toBeVisible();
  }
  await expect(book.getByRole("tabpanel").getByText("The offer", { exact: true })).toBeVisible();

  await stages.getByRole("tab", { name: /^01 Screening/ }).click();
  await settleScroll(page);
  await expect(book.getByRole("tabpanel").getByText("The offer", { exact: true })).toHaveCount(0);
  await stages.getByRole("tab", { name: /^01 Screening/ }).focus();
  await page.keyboard.press("ArrowDown");
  await settleScroll(page);
  await expect(stages.getByRole("tab", { name: /^02 Technical/ })).toHaveAttribute("aria-selected", "true");
  await expect(stages.getByRole("tab", { name: /^02 Technical/ })).toBeFocused();
  await expect(rows.first()).toContainText("Machine coding");
});

test("the home interview book is an open book: contents on the left, the round's page on the right, decoration hidden from assistive tech", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const book = page.locator("#loop");
  const region = book.getByRole("region", { name: "Screening call" });
  await region.scrollIntoViewIfNeeded();
  for (const text of [
    "A question you will get",
    "The answer that loses the room",
    "and the follow-up they push with",
    "What they are really testing",
  ])
    await expect(region).toContainText(text);
  await expect(region.getByRole("link", { name: /Read this round/ })).toBeVisible();
  await expect(region.getByRole("list", { name: "This round in numbers" }).getByRole("listitem")).toHaveCount(3);
  await expect(book.getByRole("heading", { level: 3, name: "Contents" })).toBeVisible();
  const decoration = await book.evaluate((el) =>
    [
      ...el.querySelectorAll(
        "[class*='stamp'], [class*='typing'], [class*='ribbon'], [class*='cover'], [class*='band'], [class*='spine'], [class*='stack'], [class*='contact']"
      ),
    ]
      .filter((node) => !node.matches("a, button"))
      .every((node) => node.closest("[aria-hidden='true']") !== null || node.getAttribute("aria-hidden") === "true")
  );
  expect(decoration, "stamp, typing dots, ribbon, cover and page edges are aria-hidden").toBe(true);
  const tabs = await book.getByRole("tab").evaluateAll((all) => all.map((tab) => tab.getBoundingClientRect().left));
  expect(
    Math.max(...tabs) - Math.min(...tabs),
    "the four stage tabs share one edge, the open one pulled out"
  ).toBeLessThan(20);
  const spread = await book.locator("[class*='spread']").first().boundingBox();
  const pageBox = await region.boundingBox();
  const contents = await book.getByRole("heading", { level: 3, name: "Contents" }).boundingBox();
  expect(contents!.x + contents!.width, "contents sit on the left page").toBeLessThan(spread!.x + spread!.width / 2);
  expect(pageBox!.x, "the round sits on the right page").toBeGreaterThan(spread!.x + spread!.width / 2 - 4);
  const row = book.getByRole("button", { name: /Round 01/ });
  await expect(row.locator("[class*='decides']")).toBeVisible();
  const slim = await book
    .locator("ol button:not([aria-current])")
    .first()
    .evaluate((el) => el.getBoundingClientRect().height);
  const open = await row.evaluate((el) => el.getBoundingClientRect().height);
  expect(open, "the active round shows what it decides, the others are slim rows").toBeGreaterThan(slim * 1.6);
  await book.getByRole("button", { name: /Online assessment/ }).click();
  await expect(book.getByRole("region", { name: "Online assessment" })).toHaveAttribute("data-active", "true");
});

test("under reduced motion the home interview book is a still spread: no page turn, strips or animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const book = page.locator("#loop");
  await expect(book).not.toHaveAttribute("data-pinned", "");
  await book.getByRole("button", { name: /Online assessment/ }).click();
  const region = book.getByRole("region", { name: "Online assessment" });
  await expect(region).toHaveAttribute("data-active", "true");
  const names = await region
    .locator("xpath=descendant-or-self::*")
    .evaluateAll((all) => all.map((node) => getComputedStyle(node).animationName));
  expect(new Set(names)).toEqual(new Set(["none"]));
  const typing = await region
    .locator("[class*='typing']")
    .evaluateAll((all) => all.map((n) => getComputedStyle(n).display));
  expect(new Set(typing)).toEqual(new Set(["none"]));
  expect(await book.locator("[data-strip]").count(), "no page strips are built").toBe(0);
  expect(await book.locator("[class*='slot']").count(), "only the current page is rendered").toBe(1);
});

test("every stage of the home interview book fits the view at 1280x720", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  const book = page.locator("#loop");
  for (const stage of [/^01 /, /^02 /, /^03 /, /^04 /]) {
    await book.getByRole("tab", { name: stage }).click();
    await settleScroll(page);
    const box = await page.evaluate(() => {
      const stageBox = document.querySelector("#loop [data-stage]")!.getBoundingClientRect();
      const tabs = [...document.querySelectorAll("#loop [role=tab]")].map((tab) => tab.getBoundingClientRect());
      return {
        top: stageBox.top,
        bottom: stageBox.bottom,
        view: innerHeight,
        tabsInside: tabs.every((t) => t.top >= 0 && t.bottom <= innerHeight && t.right <= innerWidth),
      };
    });
    expect(box.bottom, `${stage} book`).toBeLessThanOrEqual(box.view);
    expect(box.top, `${stage} book`).toBeGreaterThanOrEqual(0);
    expect(box.tabsInside, `${stage} tabs`).toBe(true);
  }
});

test("a home interview page never ends in the middle of a clause", async ({ page }) => {
  await page.goto("/");
  const selector = "#loop article[data-active] [class*='sample'], #loop article[data-active] [class*='penText']";
  const texts = await page.locator(selector).allTextContents();
  const stages = page.locator("#loop").getByRole("tablist", { name: "Interview stages" });
  for (const stage of [/^02 Technical/, /^03 Design and depth/, /^04 People and offer/]) {
    await stages.getByRole("tab", { name: stage }).click();
    await settleScroll(page);
    texts.push(...(await page.locator(selector).allTextContents()));
  }
  expect(texts.length).toBeGreaterThanOrEqual(8);
  for (const text of texts.filter((text) => text.length > 100)) expect(text.trim(), text).toMatch(/[.!?…"'”’)\]]$/);
});

test("the home interview book fits a phone as stacked pages with working tabs and rounds", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const book = page.locator("#loop");
  await book.getByRole("button", { name: /Round 01/ }).scrollIntoViewIfNeeded();
  const fits = () =>
    page.evaluate(() => {
      const inside = [
        ...document.querySelectorAll<HTMLElement>("#loop ol, #loop [role=region], #loop [role=tablist]"),
      ].every((el) => {
        const box = el.getBoundingClientRect();
        return box.left >= 0 && box.right <= innerWidth;
      });
      return inside && document.documentElement.scrollWidth <= innerWidth;
    });
  expect(await fits()).toBe(true);
  await book.getByRole("button", { name: /Online assessment/ }).click();
  await expect(book.getByRole("region", { name: "Online assessment" })).toBeVisible();
  await book.getByRole("tab", { name: /^03 Design and depth/ }).click();
  await expect(book.getByRole("button", { name: /Databases & Redis/ })).toHaveAttribute("aria-current", "true");
  await expect(book.getByRole("region", { name: "Databases & Redis" })).toBeVisible();
  expect(await fits()).toBe(true);
});

test("the how-it-works stepper switches steps by click and by keyboard and shows each demo", async ({ page }) => {
  await page.goto("/");
  const how = page.locator("#how");
  await expect(how.getByRole("heading", { level: 2, name: /Read it. Run it/ })).toBeVisible();
  const tabs = how.getByRole("tab");
  await expect(tabs).toHaveCount(4);
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await expect(how.getByRole("tabpanel")).toHaveCount(1);
  await expect(how.getByRole("tabpanel")).toContainText("Read a chapter that builds on the last one.");
  for (const copy of [
    "Read a chapter that builds on the last one.",
    "Prove it with real tests, right in the page.",
    "Then get asked the follow-up.",
    "And it comes back before you forget.",
  ]) {
    await expect(how.getByRole("heading", { level: 3, name: copy, includeHidden: true })).toHaveCount(1);
  }

  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(how.getByRole("tabpanel")).toContainText("Prove it with real tests");
  await expect(how.locator("[data-stage]")).toContainText("4 / 4 passed");

  await tabs.nth(1).focus();
  await page.keyboard.press("ArrowDown");
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(2)).toBeFocused();
  await expect(how.getByRole("tabpanel")).toContainText("Then get asked the follow-up.");
  await expect(how.locator("[data-stage]")).toContainText("Build me a debounce.");
  await page.keyboard.press("End");
  await expect(tabs.nth(3)).toHaveAttribute("aria-selected", "true");
  await expect(how.getByRole("tabpanel")).toContainText("And it comes back before you forget.");
  await expect(how.locator("[data-on]")).toHaveCount(4);
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowUp");
  await expect(tabs.nth(3)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await expect(how.getByRole("tabpanel")).toContainText("Read a chapter that builds on the last one.");
});

test("the how-it-works stepper advances on its own and stops for good once the reader chooses a step", async ({
  page,
}) => {
  await page.clock.install();
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto("/");
  const how = page.locator("#how");
  const tabs = how.getByRole("tab");
  await how.getByRole("tablist").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(how.locator("[class*='stepFill']")).toHaveCount(1);
  await page.clock.runFor(5600);
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.clock.runFor(5500);
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");

  await tabs.nth(0).click();
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await expect(how.locator("[class*='stepFill']")).toHaveCount(0);
  await page.mouse.move(2, 2);
  await page.clock.runFor(20000);
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
});

test("the how-it-works stepper waits while the reader hovers it and never moves under reduced motion", async ({
  page,
}) => {
  await page.clock.install();
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto("/");
  const how = page.locator("#how");
  const tabs = how.getByRole("tab");
  await how.getByRole("tablist").evaluate((el) => el.scrollIntoView({ block: "center" }));
  await expect(how.locator("[class*='stepFill']")).toHaveCount(1);
  await tabs.nth(3).hover();
  await expect(how.locator("[class*='stepFill']")).toHaveCount(0);
  await page.clock.runFor(20000);
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await page.mouse.move(2, 2);
  await page.clock.runFor(5600);
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(how.locator("[class*='stepFill']")).toHaveCount(0);
  await page.clock.runFor(30000);
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
});

test("on medium and large screens no home section after the hero is shorter than the view below the header", async ({
  page,
}) => {
  const sections = ["shelf", "practice", "how", "paths", "loop", "faq", "cta"];
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 820, height: 1100 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const header = await page
      .locator("header")
      .first()
      .evaluate((el) => el.getBoundingClientRect().height);
    for (const id of sections) {
      await expect
        .poll(() =>
          page.evaluate(
            ([target, offset]) => {
              const el = document.getElementById(target);
              if (!el) throw new Error(`no section ${target}`);
              window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - Number(offset));
              return Math.abs(el.getBoundingClientRect().top - Number(offset));
            },
            [id, header] as const
          )
        )
        .toBeLessThanOrEqual(1);
      const height = await page.evaluate(
        (target) => document.getElementById(target)!.getBoundingClientRect().height,
        id
      );
      expect(
        height,
        `#${id} at ${viewport.width}x${viewport.height} fills the view below the header`
      ).toBeGreaterThanOrEqual(viewport.height - header - 2);
    }
  }
});

test("at 1440x900 every home section's content fills its view without spilling into the next", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const header = await page
    .locator("header")
    .first()
    .evaluate((el) => el.getBoundingClientRect().height);
  await expect(page.locator("#how")).toHaveAttribute("data-pinned", "");
  for (const id of ["shelf", "practice", "how", "paths", "loop", "faq", "cta"]) {
    const room = await page.evaluate((target) => {
      const el = document.getElementById(target)!;
      const scene = el.querySelector("[data-scene-root]")!.getBoundingClientRect();
      const stage = el.querySelector("[data-pin-box]")!.getBoundingClientRect();
      return {
        content: scene.height,
        section: el.getBoundingClientRect().height,
        stage: stage.height,
        pinned: el.hasAttribute("data-pinned"),
      };
    }, id);
    expect(room.content, `#${id} has real content`).toBeGreaterThan((900 - header) * 0.7);
    if (room.pinned) {
      expect(room.section, `#${id} is a tall wrapper`).toBeGreaterThan(2 * (900 - header));
      expect(Math.abs(room.stage - (900 - header)), `#${id} pinned stage is exactly one view`).toBeLessThanOrEqual(1);
      expect(room.content, `#${id} content fits the pinned stage`).toBeLessThanOrEqual(room.stage);
    } else {
      expect(room.section, `#${id} is not stretched past its content`).toBeLessThanOrEqual(room.content + 170);
    }
  }
});

test("the home nav anchors land each section's top under the header", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  const header = await page
    .locator("header")
    .first()
    .evaluate((el) => el.getBoundingClientRect().height);
  const nav = page.getByRole("navigation", { name: "Sections", exact: true });
  await expect(nav.getByRole("link")).toHaveText([
    "Topics",
    "Practice",
    "How it works",
    "Paths",
    "Interview book",
    "FAQ",
  ]);
  for (const [name, id] of [
    ["Topics", "shelf"],
    ["Practice", "practice"],
    ["How it works", "how"],
    ["Paths", "paths"],
    ["Interview book", "loop"],
    ["FAQ", "faq"],
  ]) {
    await nav.getByRole("link", { name }).click();
    await expect
      .poll(() => page.evaluate((target) => document.getElementById(target)?.getBoundingClientRect().top ?? -1, id), {
        timeout: 8000,
      })
      .toBeCloseTo(header, -1);
  }
});

test("the home page has the sections after the hero in order and none of the removed ones", async ({ page }) => {
  await page.goto("/");
  const ids = await page.evaluate(() => [...document.querySelectorAll("main > section")].map((el) => el.id));
  expect(ids.slice(1)).toEqual(["shelf", "practice", "how", "paths", "loop", "faq", "cta"]);
  for (const gone of ["features", "tools", "compare", "who"]) await expect(page.locator(`#${gone}`)).toHaveCount(0);
  await expect(page.getByText("What you already tried, and what is different here.")).toHaveCount(0);
  await expect(page.getByText("The usual way", { exact: true })).toHaveCount(0);
});

const SCENE_SECTIONS = ["shelf", "practice", "how", "paths", "loop", "faq", "cta"];

test("every home scene after the hero has layered cards, a sticker and a handwritten note, and hides its decoration", async ({
  page,
}) => {
  await page.goto("/");
  for (const id of SCENE_SECTIONS) {
    const section = page.locator(`#${id}`);
    const counts = await section.evaluate((el) => ({
      stages: el.querySelectorAll("[data-stage]").length,
      cards: el.querySelectorAll("[data-card]").length,
      stickers: el.querySelectorAll("[data-sticker]").length,
      notes: el.querySelectorAll("[data-note]").length,
      strokes: el.querySelectorAll("[data-note] svg path").length,
    }));
    expect(counts.stages, `#${id} has a stage`).toBeGreaterThan(0);
    expect(counts.cards, `#${id} cards`).toBeGreaterThanOrEqual(id === "loop" ? 1 : 3);
    expect(counts.stickers, `#${id} stickers`).toBeGreaterThanOrEqual(1);
    if (id !== "how" && id !== "loop") {
      expect(counts.notes, `#${id} notes`).toBeGreaterThanOrEqual(1);
      expect(counts.strokes, `#${id} curved strokes`).toBeGreaterThanOrEqual(2);
    }
  }
  const hidden = await page.evaluate(() => {
    const bad: string[] = [];
    for (const el of document.querySelectorAll("main [aria-hidden='true']")) {
      if (el.closest("[inert]")) continue;
      if (el.matches("a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])")) bad.push(el.tagName);
      if (
        el.querySelector(
          "a[href]:not([tabindex='-1']), button, input, select, textarea, [tabindex]:not([tabindex='-1'])"
        )
      )
        bad.push(`${el.tagName} contains a control`);
    }
    return bad;
  });
  expect(hidden, "no control lives inside an aria-hidden layer").toEqual([]);
  for (const id of ["practice", "faq", "cta"]) {
    await expect(page.locator(`#${id} [data-stage]`).first()).toHaveAttribute("aria-hidden", "true");
  }
  for (const id of ["shelf", "how", "paths", "loop"]) {
    const decor = await page
      .locator(`#${id}`)
      .evaluate((el) =>
        [...el.querySelectorAll("[data-sticker], [data-note], [data-tape], [data-spark]")].every(
          (node) => node.getAttribute("aria-hidden") === "true"
        )
      );
    expect(decor, `#${id} decoration is aria-hidden`).toBe(true);
  }
});

test("under reduced motion the home stage cards have no animation, no transition and no parallax", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (const id of SCENE_SECTIONS) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    const stage = page.locator(`#${id} [data-stage]`).first();
    const before = await stage.evaluate((el) =>
      [...el.querySelectorAll("[data-card], [data-sticker], [data-note], [data-spark]")].map((node) => {
        const style = getComputedStyle(node);
        return { animation: style.animationName, transition: style.transitionDuration, translate: style.translate };
      })
    );
    expect(before.length, `#${id} has stage pieces`).toBeGreaterThan(2);
    for (const piece of before) {
      expect(piece.animation, `#${id} animation`).toBe("none");
      expect(piece.transition, `#${id} transition`).toMatch(/^0s(, 0s)*$/);
      expect(piece.translate, `#${id} parallax`).toBe("none");
    }
    await expect(stage).not.toHaveAttribute("data-in", "");
    const box = await stage.boundingBox();
    await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height * 0.2);
    await page.mouse.move(box!.x + box!.width * 0.9, box!.y + box!.height * 0.9, { steps: 6 });
    const after = await stage.evaluate((el) =>
      [...el.querySelectorAll("[data-card]")].map((node) => getComputedStyle(node).translate)
    );
    expect(new Set(after), `#${id} still at rest after the pointer moves`).toEqual(new Set(["none"]));
  }
});

test("moving the pointer over a home stage shifts its cards by depth, and leaving puts them back", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const stage = page.locator("#practice [data-stage]").first();
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute("data-in", "");
  const translate = () =>
    stage.evaluate((el) => [...el.querySelectorAll("[data-card]")].map((node) => getComputedStyle(node).translate));
  await page.waitForTimeout(1500);
  const rest = await translate();
  const box = await stage.boundingBox();
  await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height * 0.5);
  await page.mouse.move(box!.x + box!.width * 0.95, box!.y + box!.height * 0.9, { steps: 8 });
  await expect.poll(async () => (await translate()).join("|")).not.toBe(rest.join("|"));
  const shift = async () => {
    const [a, b] = [rest, await translate()];
    return Math.max(
      ...a.map((value, k) => {
        const [x1 = 0, y1 = 0] = value.split(" ").map((n) => parseFloat(n) || 0);
        const [x2 = 0, y2 = 0] = b[k].split(" ").map((n) => parseFloat(n) || 0);
        return Math.hypot(x2 - x1, y2 - y1);
      })
    );
  };
  await expect.poll(shift).toBeGreaterThan(3);
  expect(await shift()).toBeLessThan(40);
  await page.mouse.move(2, 2);
  await expect.poll(async () => (await translate()).join("|"), { timeout: 4000 }).toBe(rest.join("|"));
});

test("the home page never scrolls sideways at 375px or 1024px, and phones get a compact stage", async ({ page }) => {
  for (const width of [375, 1024]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    for (const id of SCENE_SECTIONS) await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      `${width}px`
    ).toBeLessThanOrEqual(0);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const visibleCards = await page
    .locator("#practice [data-card]")
    .evaluateAll((cards) => cards.filter((card) => getComputedStyle(card).display !== "none").length);
  expect(visibleCards).toBe(2);
});

async function settleScroll(page: Page) {
  let last = -1;
  await expect
    .poll(async () => {
      const now = await page.evaluate(() => window.scrollY);
      const steady = now === last;
      last = now;
      return steady;
    })
    .toBe(true);
  await page.waitForTimeout(120);
}

async function scrollSectionTo(page: Page, id: string, progress: number) {
  await page.evaluate(
    ([target, p]) => {
      const el = document.getElementById(target as string)!;
      const box = el.getBoundingClientRect();
      const top = window.innerHeight - (p as number) * (window.innerHeight + box.height);
      window.scrollTo(0, box.top + window.scrollY - top);
    },
    [id, progress] as const
  );
  await settleScroll(page);
}

const sceneVars = (page: Page, id: string) =>
  page.locator(`#${id}`).evaluate((el) => ({
    enter: el.getAttribute("data-enter") ?? "",
    exit: el.getAttribute("data-exit") ?? "",
  }));

const cardOffsets = (page: Page, id: string) =>
  page.locator(`#${id} [data-stage]`).evaluateAll((stages) =>
    stages
      .filter((stage) => stage.getBoundingClientRect().width > 0)
      .flatMap((stage) => [...stage.querySelectorAll<HTMLElement>("[data-card]")])
      .filter((card) => !card.closest("[hidden], [inert]") && getComputedStyle(card).display !== "none")
      .map((card) => {
        const [x = 0, y = x] = getComputedStyle(card)
          .translate.split(" ")
          .map((value) => parseFloat(value) || 0);
        return Math.hypot(x, y);
      })
  );

async function pinOf(page: Page, id: string) {
  return page.evaluate((target) => {
    const el = document.getElementById(target)!;
    const header = document.querySelector("header")!.getBoundingClientRect().height;
    const box = el.getBoundingClientRect();
    const length = box.height - (innerHeight - header);
    const groups = (el.dataset.pinGroups ?? "1").split(",").map(Number);
    const hold = ((Number(el.dataset.pinHold) || 0) / 100) * innerHeight;
    return { top: box.top + scrollY, header, length, groups, hold, groupLength: (length - hold) / groups.length };
  }, id);
}

async function scrollPin(page: Page, id: string, along: number) {
  const pin = await pinOf(page, id);
  await page.evaluate((y) => window.scrollTo(0, y), pin.top - pin.header + along);
  await settleScroll(page);
  return pin;
}

const pinBoxTop = (page: Page, id: string) =>
  page.locator(`#${id} [data-pin-box]`).evaluate((el) => Math.round(el.getBoundingClientRect().top));

test("every home section is exactly at rest once a rail or nav link has landed on it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const header = await page
    .locator("header")
    .first()
    .evaluate((el) => el.getBoundingClientRect().height);
  await scrollSectionTo(page, "shelf", 0.4);
  const rail = page.getByRole("navigation", { name: "Page sections" });
  for (const [name, id] of [
    ["Practice", "practice"],
    ["How it works", "how"],
    ["Paths", "paths"],
    ["Interview book", "loop"],
    ["FAQ", "faq"],
    ["Start here", "cta"],
    ["Topics", "shelf"],
  ]) {
    await rail.getByRole("link", { name }).click();
    await expect
      .poll(() => page.evaluate((target) => document.getElementById(target)?.getBoundingClientRect().top ?? -1, id), {
        timeout: 8000,
      })
      .toBeCloseTo(header, -1);
    await settleScroll(page);
    const vars = await sceneVars(page, id);
    expect(Number(vars.enter), `#${id} enter`).toBe(1);
    expect(Number(vars.exit), `#${id} exit`).toBe(0);
    const offsets = await cardOffsets(page, id);
    expect(offsets.length, `#${id} has cards`).toBeGreaterThan(id === "loop" ? 0 : 2);
    for (const offset of offsets) expect(offset, `#${id} card offset at rest`).toBeLessThan(1);
  }
});

test("a home section scrolled a quarter into view has its cards displaced and its headline part revealed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (const id of ["practice", "how", "paths"]) {
    const nearBottom = await page.evaluate((target) => {
      const el = document.getElementById(target)!;
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - innerHeight * 0.55);
      return true;
    }, id);
    expect(nearBottom).toBe(true);
    await settleScroll(page);
    const vars = await sceneVars(page, id);
    expect(Number(vars.enter), `#${id} enter on the way in`).toBeLessThan(1);
    expect(Number(vars.enter), `#${id} enter on the way in`).toBeGreaterThan(0);
    const offsets = await cardOffsets(page, id);
    expect(Math.max(...offsets), `#${id} cards are displaced`).toBeGreaterThan(8);
    if (id !== "practice") {
      const words = await page
        .locator(`#${id} h2 > span, #${id} h2 span`)
        .evaluateAll((spans) => spans.map((span) => Number(getComputedStyle(span).opacity)).filter(Number.isFinite));
      expect(Math.min(...words), `#${id} headline words are still arriving`).toBeLessThan(1);
    }
    await page.evaluate((target) => {
      const el = document.getElementById(target)!;
      const box = el.getBoundingClientRect();
      window.scrollTo(0, box.bottom + window.scrollY - innerHeight * 0.45);
    }, id);
    await settleScroll(page);
    const leaving = await sceneVars(page, id);
    expect(Number(leaving.exit), `#${id} exit on the way out`).toBeGreaterThan(0);
    const drift = await cardOffsets(page, id);
    expect(Math.max(...drift), `#${id} cards drift apart on the way out`).toBeGreaterThan(20);
  }
});

test("a long jump over several home sections leaves each one at rest when it is reached", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const el = document.getElementById("how")!;
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 64);
  });
  await settleScroll(page);
  const vars = await sceneVars(page, "how");
  expect([Number(vars.enter), Number(vars.exit)]).toEqual([1, 0]);
});

test("under reduced motion no scene variable is ever written and the connectors are fully drawn and static", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (const id of SCENE_SECTIONS) {
    await scrollSectionTo(page, id, 0.3);
    expect(await sceneVars(page, id), `#${id}`).toEqual({ enter: "", exit: "" });
    await expect(page.locator(`#${id}`)).not.toHaveAttribute("data-live", "");
  }
  const connectors = page.locator("[data-connector]");
  await expect(connectors).toHaveCount(6);
  const still = await connectors.evaluateAll((all) =>
    all.map((el) => ({
      drawn: getComputedStyle(el.querySelector("path[class*='reveal']")!).strokeDashoffset,
      rider: getComputedStyle(el.querySelector("[data-rider]")!).opacity,
      label: getComputedStyle(el.querySelector("[class*='label']")!).opacity,
      set: el.style.getPropertyValue("--d"),
    }))
  );
  for (const link of still)
    expect({ ...link, drawn: parseFloat(link.drawn) }).toEqual({ drawn: 0, rider: "0", label: "1", set: "" });
  await expect(page.locator("[data-docked]")).toHaveCount(0);
  const chips = await page
    .locator("[data-chip]")
    .evaluateAll((all) => all.map((chip) => getComputedStyle(chip).translate));
  expect(new Set(chips)).toEqual(new Set(["none"]));
});

test("the home section rail lists the sections, follows the scroll, lands each one and stays out of the content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const rail = page.getByRole("navigation", { name: "Page sections" });
  await expect(rail).toBeHidden();
  await scrollSectionTo(page, "shelf", 0.5);
  await expect(rail).toBeVisible();
  await expect(rail.getByRole("link")).toHaveText([
    "01 Topics",
    "02 Practice",
    "03 How it works",
    "04 Paths",
    "05 Interview book",
    "06 FAQ",
    "07 Start here",
  ]);
  for (const [id, name] of [
    ["shelf", "Topics"],
    ["how", "How it works"],
    ["faq", "FAQ"],
  ]) {
    await page.evaluate((target) => {
      const el = document.getElementById(target)!;
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 64);
    }, id);
    await expect(rail.getByRole("link", { name: new RegExp(name) })).toHaveAttribute("aria-current", "location");
    await expect(rail.locator("[aria-current]")).toHaveCount(1);
  }
  await rail.getByRole("link", { name: /Paths/ }).click();
  await expect
    .poll(() => page.evaluate(() => document.getElementById("paths")!.getBoundingClientRect().top), { timeout: 8000 })
    .toBeCloseTo(64, -1);
  await rail.getByRole("link", { name: /Paths/ }).focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  const label = rail.getByRole("link", { name: /Paths/ }).locator("span").last();
  await expect(label).toHaveCSS("opacity", "1");
  await page.setViewportSize({ width: 1100, height: 800 });
  await expect(rail).toBeHidden();
  await page.setViewportSize({ width: 1280, height: 720 });
  await scrollSectionTo(page, "practice", 0.5);
  await expect(rail).toBeVisible();
  const boxes = await page.evaluate(() => {
    const railBox = document.querySelector("nav[aria-label='Page sections']")!.getBoundingClientRect();
    const scene = document.querySelector("#practice [data-scene-root]")!.getBoundingClientRect();
    const header = document.querySelector("header")!.getBoundingClientRect();
    return { railRight: railBox.right, sceneLeft: scene.left, railTop: railBox.top, headerBottom: header.bottom };
  });
  expect(boxes.railRight, "the rail's dots sit in the left gutter").toBeLessThanOrEqual(boxes.sceneLeft);
  expect(boxes.railTop, "the rail stays below the header").toBeGreaterThanOrEqual(boxes.headerBottom);
});

test("the home rail takes a keyboard focus ring and opens its label", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await scrollSectionTo(page, "practice", 0.5);
  const link = page.getByRole("navigation", { name: "Page sections" }).getByRole("link", { name: /Paths/ });
  await link.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  await expect(link.locator("span").last()).toHaveCSS("opacity", "1");
  expect(await link.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
});

test("home chips are decoration: hidden from assistive tech, never focusable, and every chip fact is in real text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const report = await page.evaluate((ids) => {
    const problems: string[] = [];
    let chips = 0;
    for (const id of ids) {
      const section = document.getElementById(id)!;
      const clone = section.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("[data-chip]").forEach((node) => node.remove());
      const text = (clone.textContent ?? "").toLowerCase().replace(/\s+/g, " ");
      const found = section.querySelectorAll<HTMLElement>("[data-chip]");
      if (found.length < 2) problems.push(`#${id} has ${found.length} chips`);
      found.forEach((chip) => {
        chips++;
        if (chip.getAttribute("aria-hidden") !== "true") problems.push(`#${id} chip is not aria-hidden`);
        if (chip.matches("a, button, [tabindex]") || chip.querySelector("a, button, [tabindex]"))
          problems.push(`#${id} chip is focusable`);
        const fact = (chip.dataset.fact ?? "").toLowerCase();
        if (!fact || !text.includes(fact)) problems.push(`#${id} chip fact "${fact}" is not in the section text`);
      });
    }
    return { problems, chips };
  }, SCENE_SECTIONS);
  expect(report.problems).toEqual([]);
  expect(report.chips).toBeGreaterThanOrEqual(18);
});

test("the home page does not scroll sideways at 375, 1024, 1440 or 1920px all the way down, and logs no errors", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const problems = collectProblems(page);
  for (const width of [375, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: width < 800 ? 800 : 900 });
    await page.goto("/");
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 450) {
      await page.evaluate((to) => window.scrollTo(0, to), y);
      await page.waitForTimeout(60);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
        `${width}px at ${y}`
      ).toBeLessThanOrEqual(0);
    }
  }
  expect(problems).toEqual([]);
});

test("the home practice section links to its four tools and shows numbers that match the rest of the page", async ({
  page,
}) => {
  await page.goto("/");
  const practice = page.locator("#practice");
  for (const [name, href] of [
    [/Problems/, "/problems"],
    [/Playground/, "/practice?id=free"],
    [/Mock interviews/, "/mock"],
    [/Whiteboard/, "/whiteboard"],
  ] as const) {
    await expect(practice.getByRole("link", { name }).first()).toHaveAttribute("href", href);
  }
  await expect(practice.getByRole("link")).toHaveCount(4);

  const number = (scope: ReturnType<typeof page.locator>, label: RegExp) =>
    scope.locator("dl > div", { hasText: label }).locator("dd").innerText();
  const hero = page.locator("section").first();
  const exercises = await number(hero, /runnable exercises/);
  const questions = await number(hero, /interview questions/);
  expect(await number(practice, /exercises graded/)).toBe(exercises);
  expect(await number(practice, /interview questions answered/)).toBe(questions);
  const runnable = await number(practice, /languages the editor runs/);
  const rounds = await number(practice, /interview rounds/);
  await expect(practice.getByRole("link", { name: /Problems/ })).toContainText(`${exercises} exercises`);
  await expect(practice.getByRole("link", { name: /Playground/ })).toContainText(`${runnable} languages`);
  await expect(page.locator("#shelf").getByRole("link", { name: /^Interview book/ })).toContainText(`${rounds} rounds`);
  await expect(
    page.locator("#faq").getByRole("region", { name: "Which languages can I run?", includeHidden: true })
  ).toContainText(`${runnable} languages run inside your browser`);
});

test("each home path tab shows its journey, with unwritten topics as quiet chips and every link real", async ({
  page,
}) => {
  await page.goto("/");
  const paths = page.locator("#paths");
  const tabs = paths.getByRole("tab");
  await expect(tabs).toHaveCount(3);
  await expect(paths.getByRole("tabpanel")).toHaveCount(1);
  const soonByPath = [2, 0, 1];
  for (let i = 0; i < 3; i++) {
    await tabs.nth(i).click();
    await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
    const panel = paths.getByRole("tabpanel");
    await expect(panel).toHaveCount(1);
    const journey = panel.getByRole("list", { name: /the journey$/ });
    await expect(journey.getByRole("listitem")).toHaveCount(5);
    await expect(panel.getByText("After this path you can")).toBeVisible();
    await expect(panel.getByRole("listitem")).toHaveCount(5 + 3);
    await expect(journey.getByText("soon", { exact: true })).toHaveCount(soonByPath[i]);
    const links = await journey.getByRole("link").evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
    expect(links.length).toBe(5 - soonByPath[i]);
    for (const href of links) {
      expect(href, "a journey link points somewhere").toMatch(/^\//);
      expect((await page.request.get(href)).status(), href).toBe(200);
    }
    await expect(panel.getByRole("link", { name: /Start this path/ })).toHaveAttribute("href", links[0]);
  }
  await tabs.nth(0).click();
  const frontend = paths.getByRole("tabpanel");
  for (const soon of ["TypeScript", "Next.js"]) {
    await expect(frontend.getByRole("link", { name: new RegExp(soon) })).toHaveCount(0);
    await expect(frontend.getByText(soon, { exact: true })).toBeVisible();
  }
  await tabs.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
});

test("the home FAQ answers why not videos, problem sites, docs or blog posts, and has no comparison table", async ({
  page,
}) => {
  await page.goto("/");
  const faq = page.locator("#faq");
  await expect(faq.getByRole("heading", { level: 2, name: "Questions." })).toBeVisible();
  const question = "Why not just videos, problem sites, docs or blog posts?";
  const button = faq.getByRole("button", { name: question });
  await expect(button).toHaveCount(1);
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  const item = faq.getByRole("region", { name: question });
  await expect(item).toBeVisible();
  const contrasts = item.getByRole("listitem");
  await expect(contrasts).toHaveCount(4);
  for (const name of ["Video courses", "Grinding problem sites", "Official docs", "Interview blog posts"]) {
    await expect(item).toContainText(name);
  }
  const share = await item.evaluate((el) => el.getBoundingClientRect().height / window.innerHeight);
  expect(share, "the open comparison answer stays compact").toBeLessThan(0.45);
  await expect(page.locator("#compare")).toHaveCount(0);
  await expect(faq.getByRole("link", { name: /Pick a topic/ })).toHaveAttribute("href", "#shelf");
  await expect(faq.getByRole("link", { name: /Prepare for an interview/ })).toHaveAttribute("href", "/interview");
});

test("the home FAQ opens one answer at a time, as real buttons with state in text", async ({ page }) => {
  await page.goto("/");
  const faq = page.locator("#faq");
  const buttons = faq.getByRole("button", { expanded: true });
  await expect(buttons).toHaveCount(1);
  await expect(buttons.first()).toContainText("Is it really free?");
  const second = faq.getByRole("button", { name: "Do I need to sign up?" });
  const third = faq.getByRole("button", { name: "Which topics are written?" });
  await second.click();
  await expect(second).toHaveAttribute("aria-expanded", "true");
  await expect(faq.getByRole("button", { expanded: true })).toHaveCount(1);
  await third.click();
  await expect(third).toHaveAttribute("aria-expanded", "true");
  await expect(second).toHaveAttribute("aria-expanded", "false");
  await expect(faq.getByRole("button", { expanded: true })).toHaveCount(1);
  await expect(faq.getByRole("region", { name: "Which topics are written?" })).toBeVisible();
  await expect(faq.getByRole("region", { name: "Do I need to sign up?" })).toHaveCount(0);
  await third.click();
  await expect(faq.getByRole("button", { expanded: true })).toHaveCount(0);
  const html = await (await page.request.get("/")).text();
  expect(html, "every answer ships in the HTML").toContain("There is no account");
  const controlled = await faq
    .getByRole("button")
    .evaluateAll((els) =>
      els
        .filter((el) => el.hasAttribute("aria-controls"))
        .map((el) => !!document.getElementById(el.getAttribute("aria-controls")!))
    );
  expect(controlled.length).toBeGreaterThanOrEqual(8);
  expect(controlled.every(Boolean)).toBe(true);
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
  const faq = page.locator("#faq");
  await faq.getByRole("button", { name: "Do I need to sign up?" }).click();
  const signUp = faq.getByRole("region", { name: "Do I need to sign up?" });
  await expect(signUp).toContainText("anonymous page analytics");
  await expect(signUp.getByRole("link", { name: /What leaves/ })).toHaveAttribute("href", "/privacy");
  await faq.getByRole("button", { name: "How is the site itself built?" }).click();
  const built = faq.getByRole("region", { name: "How is the site itself built?" });
  await expect(built.getByRole("link", { name: /Read how it is built/ })).toHaveAttribute("href", "/architecture");
  await expect(page.getByRole("navigation", { name: "You" }).getByRole("link", { name: "Privacy" })).toHaveAttribute(
    "href",
    "/privacy"
  );
});

test("the sidebar groups topics into one-at-a-time category sections, with coming-soon topics after the ready ones", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const menu = page.getByRole("dialog", { name: /menu/ });
  await menu.getByRole("button", { name: /Topics/ }).click();
  const topics = menu.getByRole("navigation", { name: "Topics" });
  const heads = topics.getByRole("heading", { level: 3 }).getByRole("button");
  await expect(heads).toHaveCount(8);
  const labels = ["Languages", "Web", "Backend and APIs", "Data", "Computer science", "DevOps and cloud"];
  for (const label of [...labels, "Engineering practice", "AI"]) {
    await expect(topics.getByRole("button", { name: new RegExp(`^${label} · \\d+$`) })).toBeVisible();
  }

  const languagesHead = topics.getByRole("button", { name: /^Languages · \d+$/ });
  const webHead = topics.getByRole("button", { name: /^Web · \d+$/ });
  await expect(languagesHead).toHaveAttribute("aria-expanded", "true");
  await expect(heads.and(page.locator("[aria-expanded=true]"))).toHaveCount(1);
  await expect(webHead).toHaveAttribute("aria-expanded", "false");
  await expect(topics.getByRole("link", { name: /Python/ })).toContainText("Soon");

  const languages = topics.getByRole("region", { name: /^Languages/ });
  await expect(languages.getByRole("link", { name: /^JavaScript/ })).toContainText("chapters");
  const flat = (await languages.getByRole("link").allInnerTexts()).map((text) => text.replace(/\s+/g, " "));
  expect(flat.findIndex((text) => text.includes("JavaScript"))).toBeLessThan(
    flat.findIndex((text) => text.includes("Python"))
  );

  await webHead.focus();
  await page.keyboard.press("Enter");
  await expect(webHead).toHaveAttribute("aria-expanded", "true");
  await expect(languagesHead).toHaveAttribute("aria-expanded", "false");
  await expect(topics.getByRole("link", { name: /Python/ })).toHaveCount(0);
  await expect(topics.getByRole("link", { name: /^React/ })).toBeVisible();
  await expect(heads.and(page.locator("[aria-expanded=true]"))).toHaveCount(1);

  await webHead.click();
  await expect(webHead).toHaveAttribute("aria-expanded", "false");
  await expect(heads.and(page.locator("[aria-expanded=true]"))).toHaveCount(0);

  await topics.getByRole("button", { name: /^Computer science · \d+$/ }).click();
  await expect(topics.getByRole("link", { name: /^DSA/ })).toBeVisible();
  await expect(topics.getByText("DSA in JS")).toHaveCount(0);

  await menu.getByRole("searchbox").fill("rust");
  await expect(menu.getByRole("link", { name: /Rust/ })).toBeVisible();
  await expect(menu.getByRole("link", { name: /Rust/ })).toContainText("Soon");
});

test("the sidebar opens the category of the topic you are reading", async ({ page }) => {
  await page.goto("/dsa");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const menu = page.getByRole("dialog", { name: /menu/ });
  await menu.getByRole("button", { name: /Topics/ }).click();
  const topics = menu.getByRole("navigation", { name: "Topics" });
  await expect(topics.getByRole("button", { name: /^Computer science · \d+$/ })).toHaveAttribute(
    "aria-expanded",
    "true"
  );
  await expect(topics.getByRole("button", { name: /^Languages · \d+$/ })).toHaveAttribute("aria-expanded", "false");
  await expect(topics.locator("a[aria-current=page]")).toContainText("DSA");
});

test("the sidebar fits a 390px screen with every category listed", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const menu = page.getByRole("dialog", { name: /menu/ });
  await menu.getByRole("button", { name: /Topics/ }).click();
  const topics = menu.getByRole("navigation", { name: "Topics" });
  await expect(topics.getByRole("link", { name: /Python/ })).toBeVisible();
  await topics.getByRole("button", { name: /^AI · \d+$/ }).click();
  await expect(topics.getByRole("link", { name: /Claude/ })).toBeVisible();
  const overflow = await menu.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test("the home topic section opens on Ready now and lists categories you can move through with the arrow keys", async ({
  page,
}) => {
  await page.goto("/");
  const shelf = page.locator("#shelf");
  const tabs = shelf.getByRole("tablist", { name: "Topics" });
  await expect(tabs.getByRole("tab")).toHaveCount(9);
  const ready = tabs.getByRole("tab", { name: /^Ready now/ });
  await expect(ready).toHaveAttribute("aria-selected", "true");
  await expect(ready).toHaveAttribute("tabindex", "0");
  await expect(tabs.getByRole("tab", { name: /^Languages/ })).toHaveAttribute("tabindex", "-1");
  await expect(tabs).toHaveAttribute("aria-orientation", "vertical");

  const panel = shelf.getByRole("tabpanel");
  for (const name of ["JavaScript", "React", "Git", "DSA", "System Design", "Interview book"]) {
    await expect(panel.getByRole("link", { name: new RegExp(`^${name}`) }), name).toBeVisible();
  }
  await expect(panel.getByRole("link", { name: /^JavaScript/ })).toContainText(/exercises/);
  await expect(panel.getByRole("link", { name: /Python/ })).toHaveCount(0);

  await tabs.getByRole("tab", { name: /^Languages/ }).click();
  await expect(tabs.getByRole("tab", { name: /^Languages/ })).toHaveAttribute("aria-selected", "true");
  const python = panel.getByRole("link", { name: /^Python/ });
  await expect(python).toContainText("Coming soon");
  await expect(panel.getByRole("link", { name: /^JavaScript/ })).toContainText(/\d+ chapters/);

  await page.keyboard.press("ArrowDown");
  await expect(tabs.getByRole("tab", { name: /^Web/ })).toBeFocused();
  await expect(tabs.getByRole("tab", { name: /^Web/ })).toHaveAttribute("aria-selected", "true");
  await expect(panel.getByRole("link", { name: /^React/ })).toBeVisible();
  await page.keyboard.press("End");
  await expect(tabs.getByRole("tab", { name: /^AI/ })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(ready).toBeFocused();
  await expect(ready).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowUp");
  await expect(tabs.getByRole("tab", { name: /^AI/ })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(ready).toBeFocused();
});

test("a coming-soon card on the home page links to its outline page", async ({ page }) => {
  await page.goto("/");
  await page
    .locator("#shelf")
    .getByRole("tab", { name: /^Languages/ })
    .click();
  const python = page
    .locator("#shelf")
    .getByRole("tabpanel")
    .getByRole("link", { name: /^Python/ });
  await expect(python).toHaveAttribute("href", "/python");
  await python.click();
  await page.waitForURL("**/python");
  await expect(page.getByRole("heading", { level: 2, name: "Being planned" })).toBeVisible();
});

test("the home category list scrolls inside its own row at 390px without scrolling the page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const list = page.locator("#shelf").getByRole("tablist", { name: "Topics" });
  await list.scrollIntoViewIfNeeded();
  expect(await list.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  await page.locator("#shelf").getByRole("tab", { name: /^AI/ }).click();
  await expect(
    page
      .locator("#shelf")
      .getByRole("tabpanel")
      .getByRole("link", { name: /Claude/ })
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  await page
    .locator("#shelf")
    .getByRole("tab", { name: /^Ready now/ })
    .click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test("a topic that is only being planned shows an outline with no syllabus, not a 404", async ({ page }) => {
  for (const [path, name] of [
    ["/python", "Python"],
    ["/networks", "Computer Networks"],
    ["/ai", "Claude & AI tools"],
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }), path).toHaveText(name);
    await expect(page.getByRole("heading", { level: 2, name: "Being planned" }), path).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Beginner$/ }), path).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /closures|event loop/i }), path).toHaveCount(0);
    await expect(page.getByText("Three honest notes"), path).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Switch topic" }), path).toHaveAttribute("href", "/");
    await expect(page.locator('meta[name="robots"][content*="noindex"]'), path).toHaveCount(1);
  }

  const sitemap = await page.request.get("/sitemap.xml");
  const xml = await sitemap.text();
  for (const id of ["python", "java", "cpp", "rust", "ruby", "go", "mongodb", "dbms", "networks", "os", "ai"]) {
    expect(xml, `${id} must stay out of the sitemap`).not.toMatch(new RegExp(`/${id}</loc>`));
  }
});

test("a planning cover points at a written neighbour, or says nothing", async ({ page }) => {
  for (const [path, label] of [
    ["/python", "DSA"],
    ["/java", "DSA"],
    ["/cpp", "DSA"],
    ["/mongodb", "System Design"],
    ["/networks", "System Design"],
  ]) {
    await page.goto(path);
    const meanwhile = page.getByRole("region", { name: "Meanwhile" });
    await expect(meanwhile.getByRole("link", { name: new RegExp(`^${label} is written`) }), path).toBeVisible();
    await expect(meanwhile.getByText(/JavaScript is written/), path).toHaveCount(0);
  }
  for (const path of ["/rust", "/ruby", "/go", "/ai"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 2, name: "Being planned" }), path).toBeVisible();
    await expect(page.getByRole("region", { name: "Meanwhile" }), path).toHaveCount(0);
  }
});

test("the home page ships every topic panel in its HTML, so coming-soon links exist without JavaScript", async ({
  page,
}) => {
  const html = await (await page.request.get("/")).text();
  for (const id of ["python", "rust", "networks", "ai"]) {
    expect(html, `/${id} is missing from the home HTML`).toContain(`href="/${id}"`);
  }
  await page.goto("/");
  const tabs = page.locator("#shelf").getByRole("tablist", { name: "Topics" });
  for (const tab of await tabs.getByRole("tab").all()) {
    const panelId = await tab.getAttribute("aria-controls");
    expect(await page.locator(`#${panelId}`).count()).toBe(1);
  }
  await expect(page.locator("#shelf").getByRole("tabpanel")).toHaveCount(1);
});

test("the DSA topic is called DSA on its cover", async ({ page }) => {
  await page.goto("/dsa");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("DSA");
  await expect(page.getByRole("heading", { level: 1 })).not.toContainText("in JS");
  await expect(page).toHaveTitle(/^DSA/);
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
  const start = page.getByRole("link", { name: /Pick a topic/ }).first();
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

test("pinned home sections stay on screen while their steps play in order, then release", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (const [id, steps] of [
    ["how", 4],
    ["paths", 3],
    ["loop", 4],
  ] as const) {
    await expect(page.locator(`#${id}`)).toHaveAttribute("data-pinned", "");
    const header = await page
      .locator("header")
      .first()
      .evaluate((el) => el.getBoundingClientRect().height);
    const pin = await pinOf(page, id);
    expect(pin.length, `#${id} adds scroll length`).toBeGreaterThan(900);
    const seen: number[] = [];
    for (const share of [0.02, 0.25, 0.5, 0.75, 0.97]) {
      await scrollPin(page, id, pin.length * share);
      expect(await pinBoxTop(page, id), `#${id} stays pinned at ${share}`).toBe(Math.round(header));
      const selected = await page
        .locator(`#${id} [role='tablist']`)
        .first()
        .getByRole("tab")
        .evaluateAll((tabs) => tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));
      seen.push(selected);
    }
    expect(seen[0], `#${id} starts on the first step`).toBe(0);
    expect(seen[seen.length - 1], `#${id} ends on the last step`).toBe(steps - 1);
    expect(
      [...seen].sort((a, b) => a - b),
      `#${id} steps in order`
    ).toEqual(seen);
    await scrollPin(page, id, pin.length + 400);
    expect(await pinBoxTop(page, id), `#${id} releases after the hold`).toBeLessThan(Math.round(header) - 100);
    await scrollPin(page, id, -300);
    expect(await pinBoxTop(page, id), `#${id} is not pinned before its start`).toBeGreaterThan(
      Math.round(header) + 100
    );
  }
});

test("choosing a pinned step scrolls to it and keeps the scroll position, the tab and the content in agreement", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const how = page.locator("#how");
  const tabs = how.getByRole("tablist", { name: "How it works" });
  await tabs.getByRole("tab", { name: /Get asked/ }).click();
  await settleScroll(page);
  await expect(tabs.getByRole("tab", { name: /Get asked/ })).toHaveAttribute("aria-selected", "true");
  const pin = await pinOf(page, "how");
  const along = await page.evaluate((top) => scrollY - top, pin.top - pin.header);
  expect(Math.floor(along / pin.groupLength), "the page sits inside the third step").toBe(2);
  await expect(how.getByRole("tabpanel", { name: /Get asked/ })).toBeVisible();
  await tabs.getByRole("tab", { name: /Get asked/ }).focus();
  await page.keyboard.press("ArrowDown");
  await settleScroll(page);
  await expect(tabs.getByRole("tab", { name: /Keep/ })).toHaveAttribute("aria-selected", "true");
  await expect(tabs.getByRole("tab", { name: /Keep/ })).toBeFocused();
  expect(await page.evaluate((top) => scrollY - top, pin.top - pin.header)).toBeGreaterThan(3 * pin.groupLength);
  await page.keyboard.press("Home");
  await settleScroll(page);
  await expect(tabs.getByRole("tab", { name: /Read/ })).toHaveAttribute("aria-selected", "true");
  expect(await page.evaluate((top) => scrollY - top, pin.top - pin.header)).toBeLessThan(pin.groupLength);
});

test("every step of a pinned home section stays in the page, hidden but present", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const counts = await page.evaluate(() => ({
    how: document.querySelectorAll("#how [role='tabpanel']").length,
    paths: document.querySelectorAll("#paths [role='tabpanel']").length,
    rounds: document.querySelectorAll("#loop [class*='rowBtn']").length,
    bodiesWithText: [...document.querySelectorAll("#how [role='tabpanel'], #paths [role='tabpanel']")].every(
      (panel) => (panel.textContent ?? "").trim().length > 20
    ),
  }));
  expect(counts).toMatchObject({ how: 4, paths: 3, bodiesWithText: true });
  expect(counts.rounds).toBeGreaterThanOrEqual(4);
  const hidden = await page.locator("#how [role='tabpanel'][hidden]").count();
  expect(hidden).toBe(3);
});

test("nothing pins at 1000px, on a phone or under reduced motion, and no section adds scroll length there", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1000, height: 800 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const id of ["how", "paths", "loop"]) {
      await expect(page.locator(`#${id}`), `#${id} at ${viewport.width}`).not.toHaveAttribute("data-pinned", "");
      const height = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().height);
      expect(height, `#${id} at ${viewport.width} keeps its natural length`).toBeLessThan(viewport.height * 2.6);
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (const id of ["how", "paths", "loop"]) {
    await expect(page.locator(`#${id}`)).not.toHaveAttribute("data-pinned", "");
    const height = await page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().height);
    expect(height, `#${id} under reduced motion keeps its natural length`).toBeLessThan(900 * 2);
  }
  await page.getByRole("tab", { name: /Run/ }).first().click();
  await expect(page.locator("#how").getByRole("tab", { name: /Run/ })).toHaveAttribute("aria-selected", "true");
});

test("the pinned interview book turns its page as a bending leaf, scrubbed by the scroll and reversible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("#loop")).toHaveAttribute("data-pinned", "");
  const itemLength = (await pinOf(page, "loop")).groupLength / 4;
  const leaf = () =>
    page.evaluate(() => {
      const turning = document.querySelector<HTMLElement>("#loop [data-turn]");
      const strips = [...document.querySelectorAll<HTMLElement>("#loop [data-strip]")];
      return {
        turning: turning !== null,
        strips: strips.length,
        first: strips[0]?.style.transform ?? "",
        last: strips[strips.length - 1]?.style.transform ?? "",
      };
    });
  await scrollPin(page, "loop", itemLength * 0.2);
  expect((await leaf()).turning, "resting on the page").toBe(false);
  await scrollPin(page, "loop", itemLength * 0.7);
  const mid = await leaf();
  expect(mid.turning, "mid-turn").toBe(true);
  expect(mid.strips).toBeGreaterThanOrEqual(6);
  expect(mid.first).toMatch(/^perspective\(\d+px\) translateZ\([\d.]+px\) rotateY\(-[\d.]+deg\)$/);
  expect(mid.last, "the free edge bends relative to the strip before it").toMatch(/^rotateY\(-?[\d.]+deg\)$/);
  await scrollPin(page, "loop", itemLength * 0.2);
  expect((await leaf()).turning, "turned back").toBe(false);
  await scrollPin(page, "loop", itemLength * 0.7);
  expect((await leaf()).first, "the same scroll position gives the same bend").toBe(mid.first);
  await scrollPin(page, "loop", itemLength * 1.1);
  await expect(page.locator("#loop").getByRole("region", { name: "Online assessment" })).toBeVisible();
});

test("while the book turns a page its angle only ever moves one way with the scroll, frame by frame", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("#loop")).toHaveAttribute("data-pinned", "");
  await page.waitForTimeout(1500);
  const pin = await pinOf(page, "loop");
  await scrollPin(page, "loop", (pin.groupLength / 4) * 0.2);
  await page.evaluate(() => {
    const frames: { y: number; step: string; angle: number }[] = [];
    (window as unknown as { frames: typeof frames }).frames = frames;
    const read = () => {
      const strip = document.querySelector<HTMLElement>("#loop [data-strip]");
      const slot = strip?.closest<HTMLElement>("[data-step]");
      const angle = Number(/rotateY\((-?[\d.]+)deg\)/.exec(strip?.style.transform ?? "")?.[1]);
      if (slot && Number.isFinite(angle)) frames.push({ y: scrollY, step: slot.dataset.step ?? "", angle });
      requestAnimationFrame(read);
    };
    requestAnimationFrame(read);
  });
  await page.mouse.move(720, 450);
  for (let i = 0; i < 28; i++) {
    await page.mouse.wheel(0, 40);
    await page.waitForTimeout(32);
  }
  await page.waitForTimeout(600);
  const frames = await page.evaluate(
    () => (window as unknown as { frames: { y: number; step: string; angle: number }[] }).frames
  );
  expect(frames.length, "the turn was sampled").toBeGreaterThan(8);
  const byStep = new Map<string, typeof frames>();
  for (const frame of frames) byStep.set(frame.step, [...(byStep.get(frame.step) ?? []), frame]);
  for (const [step, list] of byStep)
    for (let k = 1; k < list.length; k++) {
      expect(list[k].angle, `step ${step} frame ${k}`).toBeLessThanOrEqual(list[k - 1].angle + 0.05);
      expect(Math.abs(list[k].angle - list[k - 1].angle), `step ${step} frame ${k} jump`).toBeLessThan(178);
    }
});

test("the pinned how-it-works loop lights each station as the walker arrives and brings it home again", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const how = page.locator("#how");
  await expect(how).toHaveAttribute("data-pinned", "");
  const unit = (await pinOf(page, "how")).groupLength;
  const state = () =>
    page.evaluate(() => ({
      lit: [...document.querySelectorAll("#how [data-corner]")].map((el) => !el.hasAttribute("data-off")),
      walker: (() => {
        const el = document.querySelector<HTMLElement>("#how [data-fx='walker']")!;
        return { left: parseFloat(el.style.left), top: parseFloat(el.style.top), rotate: el.style.rotate };
      })(),
    }));
  await scrollPin(page, "how", unit * 0.05);
  const start = await state();
  expect(start.lit, "nothing is lit before the walker arrives").toEqual([false, false, false, false]);
  await scrollPin(page, "how", unit * 0.5);
  expect((await state()).lit).toEqual([true, false, false, false]);
  await scrollPin(page, "how", unit * 2.5);
  const third = await state();
  expect(third.lit).toEqual([true, true, true, false]);
  expect(third.walker.left, "the walker is on the right of the loop").toBeGreaterThan(80);
  expect(third.walker.top, "and at the bottom of it").toBeGreaterThan(80);
  await scrollPin(page, "how", unit * 3.5);
  expect((await state()).lit).toEqual([true, true, true, true]);
  await scrollPin(page, "how", unit * 4);
  const home = await state();
  expect(Math.hypot(home.walker.left - start.walker.left, home.walker.top - start.walker.top)).toBeLessThan(6);
  expect(home.walker.rotate).toMatch(/deg$/);
  await scrollPin(page, "how", unit * 0.05);
  expect((await state()).lit, "scrolling back un-lights them").toEqual([false, false, false, false]);
  for (const station of ["Read", "Run", "Get asked", "Keep"])
    await expect(how.getByRole("tab", { name: new RegExp(station) })).toBeVisible();
});

test("the home connectors link each section to the next: aria-hidden, one per pair, attached to the next badge", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const connectors = page.locator("[data-connector]");
  await expect(connectors).toHaveCount(6);
  await expect(page.locator("[data-connector]").first().locator("xpath=..")).toHaveAttribute("aria-hidden", "true");
  const facts = await connectors.locator("[data-fact]").allTextContents();
  expect(facts).toHaveLength(6);
  expect(new Set(await connectors.evaluateAll((all) => all.map((el) => el.getAttribute("data-traveller")))).size).toBe(
    6
  );
  const report = await page.evaluate(() => {
    const out: string[] = [];
    const ids = ["practice", "how", "paths", "loop", "faq", "cta"];
    document.querySelectorAll<HTMLElement>("[data-connector]").forEach((el, i) => {
      const style = getComputedStyle(el.parentElement!);
      if (style.pointerEvents !== "none" || style.zIndex !== "-1")
        out.push(`connector ${i} layer is not behind and inert`);
      const path = el.querySelector<SVGPathElement>("path[class*='dash']")!;
      const svg = el.querySelector("svg")!.getBoundingClientRect();
      const end = path.getPointAtLength(path.getTotalLength());
      const badge = document.querySelector(`#${ids[i]} [data-waypoint]`)!.getBoundingClientRect();
      const dx = Math.abs(svg.left + end.x - (badge.left + badge.width / 2));
      const dy = Math.abs(svg.top + end.y - badge.top);
      if (dx > 3 || dy > 8) out.push(`connector ${i} ends ${dx.toFixed(0)},${dy.toFixed(0)} from the badge`);
      if (el.querySelector("a, button, [tabindex]")) out.push(`connector ${i} holds a control`);
    });
    return out;
  });
  expect(report).toEqual([]);
  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(connectors).toHaveCount(0);
});

test("a home connector is drawn by the scroll, its traveller docks in the next badge, and it lights it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const connector = page.locator("[data-connector]").nth(1);
  await expect(page.locator("[data-connector]")).toHaveCount(6);
  const geometry = await connector.evaluate((el) => {
    const box = el.getBoundingClientRect();
    return { top: box.top + scrollY, bottom: box.bottom + scrollY };
  });
  const progress = async () => Number(await connector.evaluate((el) => el.style.getPropertyValue("--d") || "NaN"));
  await page.evaluate((y) => window.scrollTo(0, y), geometry.top - 900);
  await settleScroll(page);
  expect(await progress()).toBeLessThan(0.1);
  await expect(page.locator("#how")).not.toHaveAttribute("data-docked", "");
  await page.evaluate(
    (g) => window.scrollTo(0, g.top - innerHeight * 0.9 + 0.5 * (g.bottom - g.top + innerHeight * 0.45)),
    geometry
  );
  await settleScroll(page);
  const mid = await progress();
  expect(mid).toBeGreaterThan(0.2);
  expect(mid).toBeLessThan(0.98);
  const riding = await connector.evaluate((el) => Number(getComputedStyle(el.querySelector("[data-rider]")!).opacity));
  expect(riding, "the traveller is out on the curve").toBeGreaterThan(0.5);
  await page.evaluate((y) => window.scrollTo(0, y), geometry.bottom - 900 * 0.4);
  await settleScroll(page);
  expect(await progress()).toBeGreaterThanOrEqual(0.985);
  await expect(page.locator("#how")).toHaveAttribute("data-docked", "");
  expect(await connector.evaluate((el) => Number(getComputedStyle(el.querySelector("[data-rider]")!).opacity))).toBe(0);
  const ripple = await page
    .locator("#how [class*='eyebrowNo']")
    .evaluate((el) => getComputedStyle(el, "::after").animationName);
  expect(ripple).not.toBe("none");
  await page.evaluate((y) => window.scrollTo(0, y), geometry.top - 900);
  await settleScroll(page);
  await expect(page.locator("#how")).not.toHaveAttribute("data-docked", "");
});

test("the home connectors never run through text", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-connector]")).toHaveCount(6);
  const hits = await page.evaluate(() => {
    const rects: { left: number; right: number; top: number; bottom: number; text: string }[] = [];
    const walker = document.createTreeWalker(document.querySelector("main")!, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim() || parent.closest("[hidden], [inert]")) continue;
      const style = getComputedStyle(parent);
      if (style.visibility === "hidden" || style.display === "none") continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const box of range.getClientRects())
        if (box.width > 1)
          rects.push({
            left: box.left,
            right: box.right,
            top: box.top + scrollY,
            bottom: box.bottom + scrollY,
            text: node.textContent.trim().slice(0, 24),
          });
    }
    const found: string[] = [];
    document.querySelectorAll("[data-connector]").forEach((el, i) => {
      const path = el.querySelector<SVGPathElement>("path[class*='dash']")!;
      const svg = el.querySelector("svg")!.getBoundingClientRect();
      const total = path.getTotalLength();
      for (let at = 0; at <= total; at += Math.max(1, total / 400)) {
        const point = path.getPointAtLength(at);
        const x = svg.left + point.x;
        const y = svg.top + scrollY + point.y;
        for (const box of rects)
          if (x > box.left - 3 && x < box.right + 3 && y > box.top - 3 && y < box.bottom + 3)
            found.push(`connector ${i} meets "${box.text}"`);
      }
    });
    return [...new Set(found)];
  });
  expect(hits).toEqual([]);
});

test("the page's own scrollbar is hidden and reserves no gutter", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const root = await page.evaluate(() => ({
    width: getComputedStyle(document.documentElement).scrollbarWidth,
    reserved: window.innerWidth - document.documentElement.clientWidth,
    scrolls: document.documentElement.scrollHeight > innerHeight,
  }));
  expect(root).toEqual({ width: "none", reserved: 0, scrolls: true });
});
