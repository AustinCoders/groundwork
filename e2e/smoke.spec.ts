import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";
import { practice } from "../content/practice";

const PAGES = [
  { path: "/", heading: /Everything I know/i },
  { path: "/notes", heading: /JavaScript/i },
  { path: "/notes/setup-mental-model", heading: /Setup/i },
  { path: "/interview", heading: /Interview/i },
  { path: "/interview/r1oa", heading: /online assessment/i },
  { path: "/level/js", heading: /JavaScript/i },
  { path: "/path?topic=js&level=beginner", heading: /Beginner/i },
  { path: "/practice?id=free", heading: /Playground/i },
  { path: "/problems", heading: /problem/i },
  { path: "/problems/ex-accounts-merge", heading: /Accounts Merge/i },
  { path: "/review", heading: /read again/i },
  { path: "/mock", heading: /mock interview/i },
  { path: "/progress", heading: /progress/i },
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

for (const { path, heading } of PAGES) {
  test(`${path} renders without console errors`, async ({ page }) => {
    const problems = collectProblems(page);

    const response = await page.goto(path, { waitUntil: "networkidle" });
    expect(response?.status(), `${path} did not return 200`).toBe(200);

    await expect(page.locator("#main h1, #main h2").first()).toContainText(heading);
    expect(problems, `${path} logged problems`).toEqual([]);
  });
}

test("a chapter can be marked read and the count follows", async ({ page }) => {
  await page.goto("/notes");
  const tick = page.locator(".station__tick").first();
  await tick.click();
  await expect(page.locator(".covermap__score-num")).toContainText("1");
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
  await page.locator("a.site-navlink", { hasText: "Playground" }).first().click();
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
  const rail = page.getByRole("navigation", { name: "Chapters" });
  await expect(rail.locator("a[aria-current=page]")).toContainText("The build");
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
