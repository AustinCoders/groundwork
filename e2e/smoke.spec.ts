import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";
import { practice } from "../content/practice";
import type { ThemeValue } from "../lib/storage";
import { THEMES, themeColour } from "./themes";

const containing = (colour: string) => new RegExp(colour.replace(/[()]/g, "\\$&"));

const PAGES = [
  { path: "/", heading: /Walk into the interview ready/i },
  { path: "/notes", heading: /JavaScript/i },
  { path: "/notes/setup-mental-model", heading: /Setup/i },
  { path: "/react/react-components", heading: /Components/i },
  { path: "/dsa/dsa-hashing", heading: /Hashing/i },
  { path: "/system-design/sysdes-caching-fundamentals", heading: /Caching/i },
  { path: "/interview", heading: /Every round of the loop/i },
  { path: "/interview/r1oa", heading: /online assessment/i },
  { path: "/level/js", heading: /JavaScript/i },
  { path: "/path?topic=js&level=beginner", heading: /Beginner/i },
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

test("an outline topic's /soon page renders its syllabus, and a written topic's still redirects", async ({ page }) => {
  await page.goto("/soon?topic=typescript");
  await expect(page).toHaveURL(/\/soon\?topic=typescript/);
  await expect(page.locator(".soon-stamp")).toBeVisible();
  await expect(page.getByText("Setup & the compiler")).toBeVisible();

  await page.goto("/soon?topic=js");
  await page.waitForURL("**/level/js");
});

test("the /path sidebar lists only its own topic's chapters, not every topic's", async ({ page }) => {
  await page.goto("/path?topic=typescript&level=beginner");
  await expect(page.locator(".site-sidenav__count")).toHaveText("29 chapters");
  await expect(page.locator("#nav-list a[href^='/react/']")).toHaveCount(0);
});

test("a chapter can be marked read and the count follows", async ({ page }) => {
  await page.goto("/notes");
  const tick = page.locator(".station__tick").first();
  await tick.click();
  await expect(page.locator(".covermap__score-num")).toContainText("1");
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
  await expect(page.locator("#site-sidenav")).toHaveCount(0);
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
  await expect.poll(() => page.locator("#chapters").evaluate((el) => getComputedStyle(el).zoom)).toBe("1.1");
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
  await expect(page.locator("#site-sidenav")).toHaveCount(1);
  await expectOneSetOfDiagramDefs(page);

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

test("an outline topic's chapter is untouched: the old Shell sidebar and the not-written-yet stamp", async ({
  page,
}) => {
  await page.goto("/typescript/ts-setup-compiler");
  await expect(page.locator("#site-sidenav")).toHaveCount(1);
  await expect(page.locator(".soon-stamp")).toContainText(/not written yet/i);
  await expect(page.getByText("This section will cover:")).toBeVisible();
  await expect(page.locator("[data-scrollbar]")).toHaveCount(0);
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

  await expect(page.locator(".site-sidenav")).toHaveCount(0);
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
      await expect(page.locator("[class$='__progress'] > div"), `${path} in ${theme}`).toHaveCSS(
        "background-color",
        accent
      );
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
  const cover = page.getByRole("link", { name: /^(Start here|Continue) — / });
  const readingProgress = page.locator("[data-scrollbar]");
  const inBodyLink = page.locator("#closures").getByRole("link", { name: "the outer reference" });
  const currentChapter = page.getByRole("navigation", { name: "Chapters" }).locator('a[aria-current="page"]');
  const run = page.getByRole("button", { name: "Run the code" });
  const writtenRow = page.locator(".syllabus-item.is-ready").first();
  const levelCrumb = page.locator("#crumbs a").first();
  const levelCta = page.locator(".level__cta").first();
  const levelListCode = page.locator(".level__list code").first();
  const pathMeter = page.locator("#meter-fill");
  const doneStepCheck = page.locator("#step-setup-mental-model.is-done .check");

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
    await expect(writtenRow, `/level/js in ${theme}`).toHaveCSS("border-left-color", accent);
    await expect(levelCrumb, `/level/js in ${theme}`).toHaveCSS("color", accent);
    await expect(levelCta, `/level/js in ${theme}`).toHaveCSS("color", accent);
    await expect(levelListCode, `/level/js in ${theme}`).toHaveCSS("color", themeColour(theme, "--ink-soft"));

    await page.evaluate(() =>
      localStorage.setItem(
        "jsnotes:progress",
        JSON.stringify({ chapters: { "setup-mental-model": true }, exercises: {} })
      )
    );
    await page.goto("/path?topic=js&level=beginner");
    await expect(pathMeter, `/path in ${theme}`).toHaveCSS("background-color", accent);
    await expect(doneStepCheck, `/path in ${theme}`).toHaveCSS("color", themeColour(theme, "--ink-soft"));
    await page.evaluate(() => localStorage.removeItem("jsnotes:progress"));
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

test("the cover's notebook margin line takes the theme's accent instead of a fixed red", async ({ page }) => {
  const marginLine = async () =>
    colourChannels(await page.locator("#top").evaluate((sheet) => getComputedStyle(sheet, "::before").backgroundColor));
  const lineIn = (theme: ThemeValue, token: string) => [...colourChannels(themeColour(theme, token)).slice(0, 3), 0.32];

  await page.goto("/notes");
  expect(await marginLine()).toEqual(lineIn("light", "--primary"));
  expect(await marginLine()).not.toEqual(lineIn("light", "--red"));

  await page.evaluate(() => localStorage.setItem("jsnotes:theme", JSON.stringify("lavender")));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "lavender");
  expect(await marginLine()).toEqual(lineIn("lavender", "--primary"));
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
