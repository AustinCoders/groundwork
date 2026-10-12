import { expect, test, type ConsoleMessage, type Locator, type Page } from "@playwright/test";
import { pool } from "../content/dsa/quiz/dsa-binary-search";
import type { OrderQuestion, Question } from "../content/quiz-types";

const CHAPTER_ID = "dsa-binary-search";
const CHAPTER_PATH = `/dsa/${CHAPTER_ID}`;
const QUESTIONS = new Map<string, Question>(pool.questions.map((question) => [question.id, question]));

const PAGES = [
  { path: "/problems", heading: /problem/i },
  { path: "/interview", heading: /From the first call to the offer/i },
  { path: "/mock", heading: /mock interview/i },
  { path: "/review", heading: /due today|nothing to review/i },
  { path: "/progress", heading: /Level \d+/ },
  { path: "/privacy", heading: /Privacy/ },
  { path: "/architecture", heading: /How this site is built/i },
  { path: "/git", heading: /Git/i },
];

const VERCEL_NOISE = /_vercel|vercel-scripts/i;

function collectProblems(page: Page): string[] {
  const problems: string[] = [];

  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (VERCEL_NOISE.test(text) || text.startsWith("Failed to load resource")) return;
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

async function hydrated(target: Locator) {
  await expect.poll(() => target.evaluate((el) => Object.keys(el).some((key) => key.startsWith("__react")))).toBe(true);
}

async function sidewaysOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

async function press(page: Page, target: Locator, key = "Enter") {
  await hydrated(target);
  await target.focus();
  await page.keyboard.press(key);
}

async function arrange(page: Page, question: OrderQuestion) {
  const check = page.locator("#check");
  const ids = question.items.map((item) => item.id);
  const rows = check.locator("li[data-item]");
  for (let target = 0; target < ids.length; target++) {
    const order = await rows.evaluateAll((els) => els.map((row) => row.getAttribute("data-item")));
    for (let from = order.indexOf(ids[target]); from > target; from--) {
      await press(page, check.locator(`[data-item="${ids[target]}"]`).getByRole("button", { name: /^Move up/ }));
      await expect(rows.nth(from - 1)).toHaveAttribute("data-item", ids[target]);
    }
  }
}

async function answerRight(page: Page, question: Question) {
  const check = page.locator("#check");
  if (question.kind === "order") return arrange(page, question);
  const right = question.kind === "multi" ? question.answers : [question.answer];
  for (const id of right) {
    const choice = check.locator(`[data-choice="${id}"] input`);
    await press(page, choice, "Space");
    await expect(choice).toBeChecked();
  }
}

test("the home page loads with its heading and the Menu pill", async ({ page }) => {
  const problems = collectProblems(page);
  const response = await page.goto("/", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Walk into the interview ready/i);
  await expect(page.getByRole("button", { name: "Menu", exact: true })).toBeVisible();
  expect(problems).toEqual([]);
});

test("the Menu opens and Escape closes it", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const menuButton = page.getByRole("button", { name: "Menu", exact: true });
  await hydrated(menuButton);
  await menuButton.click();
  const menu = page.getByRole("dialog", { name: /menu/ });
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
});

test("a topic cover opens and its level picker link works", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto("/notes", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/JavaScript/i);
  const pick = page.getByRole("link", { name: "Pick your level" });
  await hydrated(pick);
  await pick.click();
  await expect(page).toHaveURL(/\/level\/js$/);
  await expect(page.getByRole("group", { name: "Pick your level" })).toBeVisible();
  expect(problems).toEqual([]);
});

test("a chapter opens with its title and rail, and does not scroll sideways at 390 wide", async ({ page }) => {
  const problems = collectProblems(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/notes/scope", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Scope");
  const rail = page.getByRole("navigation", { name: "Chapters" });
  await expect(rail.locator("a[aria-current=page]")).toContainText("Scope");

  await page.setViewportSize({ width: 390, height: 844 });
  await hydrated(page.locator(".prose[data-enhanced]"));
  await expect.poll(() => sidewaysOverflow(page)).toBeLessThanOrEqual(0);
  expect(problems).toEqual([]);
});

test("the playground runs a JavaScript snippet and shows the output", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto("/practice?id=free", { waitUntil: "networkidle" });
  const editor = page.locator(".cm-content");
  await expect(editor).toBeVisible();
  const run = page.getByRole("button", { name: "Run the code" });
  await hydrated(run);
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("console.log(6 * 7);\n");
  await run.click();
  await expect(page.locator("#view-console .line")).toContainText("42");
  await expect(page.locator(".run-status")).toContainText("ran");
  expect(problems).toEqual([]);
});

test("an exercise page opens, runs its code and grades a submission", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto("/problems/ex-tdz-order", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/temporal dead zone/i);
  const editor = page.locator(".cm-content");
  await expect(editor).toContainText("function greetMember(name)");
  const run = page.getByRole("button", { name: "Run the code" });
  await hydrated(run);
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("console.log(1 + 1);\n");
  await run.click();
  await expect(page.locator("#view-console .line")).toContainText("2");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.locator("[data-verdict='fail']")).toBeVisible({ timeout: 30_000 });
  expect(problems).toEqual([]);
});

for (const { path, heading } of PAGES) {
  test(`${path} loads with its heading and no console error`, async ({ page }) => {
    const problems = collectProblems(page);
    const response = await page.goto(path, { waitUntil: "networkidle" });
    expect(response?.status(), `${path} did not return 200`).toBe(200);
    await expect(page.locator("#main h1, #main h2").first()).toContainText(heading);
    expect(problems, `${path} logged problems`).toEqual([]);
  });
}

test("an unknown URL returns a real 404", async ({ page }) => {
  for (const path of ["/no-such-page", "/notes/no-such-chapter"]) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} did not return 404`).toBe(404);
  }
});

test("a DSA chapter switches its code to Python and back to JavaScript", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto(CHAPTER_PATH, { waitUntil: "networkidle" });
  const group = page.getByRole("group", { name: "Code language" });
  const python = group.getByRole("button", { name: "Python", exact: true });
  const javascript = group.getByRole("button", { name: "JavaScript", exact: true });
  const code = page.locator("#chapters [data-code]").first();
  await expect(code).toContainText("function binarySearch");
  await hydrated(python);
  await python.click();
  await expect(python).toHaveAttribute("aria-pressed", "true");
  await expect(code).toContainText("def binary_search");
  await expect(code).not.toContainText("function binarySearch");
  await javascript.click();
  await expect(javascript).toHaveAttribute("aria-pressed", "true");
  await expect(code).toContainText("function binarySearch");
  expect(problems).toEqual([]);
});

test("the binary search player steps forward and back", async ({ page }) => {
  await page.goto(CHAPTER_PATH, { waitUntil: "networkidle" });
  const player = page.getByRole("group", { name: "Binary search player" });
  const next = player.getByRole("button", { name: "Next", exact: true });
  const back = player.getByRole("button", { name: "Back", exact: true });
  const step = player.locator("label");
  const narration = player.getByRole("status");
  await expect(step).toHaveText(/^Step 1 of \d+$/);
  await expect(back).toBeDisabled();
  const first = await narration.textContent();
  await hydrated(next);
  await next.click();
  await expect(step).toHaveText(/^Step 2 of \d+$/);
  await expect(narration).not.toHaveText(first ?? "");
  await expect(player.locator("li[aria-current=step] code")).toContainText("let lo = 0, hi = sorted.length - 1;");
  await back.click();
  await expect(step).toHaveText(/^Step 1 of \d+$/);
});

test("marking a DSA chapter read opens its check, and a keyboard user answers it and finishes", async ({ page }) => {
  await page.goto(CHAPTER_PATH, { waitUntil: "networkidle" });
  const check = page.locator("#check");
  await expect(check.locator("fieldset")).toHaveCount(0);
  await page.getByRole("region", { name: "Finish" }).getByRole("link", { name: "Mark as read" }).click();
  await expect(check.getByRole("group", { name: "Question 1 of 5" })).toBeVisible();
  await expect(page).toHaveURL(/#check$/);

  const fieldset = check.locator("fieldset[data-question]");
  for (let at = 0; at < 5; at++) {
    const id = await fieldset.getAttribute("data-question");
    const question = QUESTIONS.get(id ?? "");
    if (!question) throw new Error(`the page asked "${id}", which is not in binary search's pool`);
    await answerRight(page, question);
    await press(page, check.getByRole("button", { name: "Check answer" }));
    await expect(check.locator("[data-verdict]")).toHaveText("Correct");
    const advance = check.getByRole("button", { name: /^(Next question|See result)$/ });
    const last = at === 4;
    await press(page, advance);
    if (!last) await expect(fieldset).not.toHaveAttribute("data-question", id ?? "");
  }

  await expect(check.getByRole("heading", { name: "Passed" })).toBeVisible();
  await expect(check.getByText("5 of 5", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Finish" }).getByRole("button", { name: "Mark as unread", pressed: true })
  ).toBeVisible();
});

test("the DSA cover tells a passed chapter's check state in words", async ({ page }) => {
  await page.addInitScript(
    ({ chapterId }) => {
      localStorage.setItem(
        "jsnotes:progress",
        JSON.stringify({ chapters: { [chapterId]: { at: Date.now(), reviews: 0 } }, exercises: {} })
      );
      localStorage.setItem(
        "groundwork:quiz",
        JSON.stringify({
          v: 1,
          chapters: {
            [chapterId]: { attempts: 1, best: 5, lastAt: 5, passedAt: 5, markedAnyway: false, missed: [] },
          },
        })
      );
    },
    { chapterId: CHAPTER_ID }
  );
  await page.goto("/dsa", { waitUntil: "networkidle" });
  const entry = page.locator("li", { has: page.locator(`a[href="${CHAPTER_PATH}"]`) }).first();
  await expect(entry.locator("[data-state]")).toHaveText("checked");
  await expect(page.locator("body")).toContainText(/(?<!\d)1 checked\b/);
});
