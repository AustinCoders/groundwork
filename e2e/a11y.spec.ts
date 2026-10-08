import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { THEMES } from "./themes";
import type { ThemeValue } from "../lib/storage";

const WCAG_A_AND_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const WIDE = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };
const VIEWPORTS = [WIDE, PHONE];

type Viewport = (typeof VIEWPORTS)[number];
type Violation = Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"][number];
type Check = (stage: string) => Promise<void>;
type State = {
  name: string;
  path: string;
  viewports: Viewport[];
  seed?: () => void;
  visit: (page: Page, check: Check) => Promise<void>;
};

const PAGES = [
  "/",
  "/notes",
  "/notes/setup-mental-model",
  "/notes/basic-async",
  "/react",
  "/dsa",
  "/system-design",
  "/interview",
  "/interview/r1oa",
  "/interview/r7",
  "/interview/questions",
  "/level/js",
  "/path/js/beginner",
  "/path?topic=typescript&level=beginner",
  "/level/typescript",
  "/typescript/ts-setup-compiler",
  "/practice?id=free",
  "/problems",
  "/problems/ex-accounts-merge",
  "/review",
  "/mock",
  "/whiteboard",
  "/progress",
  "/privacy",
  "/python",
  "/git",
  "/git/merge",
  "/git/github",
  "/architecture",
  "/architecture/arch-request-path",
  "/no-such-page",
];

const STATES: State[] = [
  {
    name: "the site menu open",
    path: "/review",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      await expect(page.getByRole("dialog", { name: /menu/ })).toBeVisible();
      await check("the site menu open");
    },
  },
  {
    name: "the Topics fold open with the Data category expanded",
    path: "/review",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      const menu = page.getByRole("dialog", { name: /menu/ });
      await menu.getByRole("button", { name: /Topics/ }).click();
      const data = menu.getByRole("button", { name: /^Data · \d+$/ });
      await data.click();
      await expect(data).toHaveAttribute("aria-expanded", "true");
      await expect(menu.getByRole("link", { name: /MongoDB/ })).toBeVisible();
      await check("the Topics fold open with the Data category expanded");
    },
  },
  {
    name: "the topic section on Languages",
    path: "/",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      const languages = page.locator("#shelf").getByRole("tab", { name: /^Languages/ });
      await languages.scrollIntoViewIfNeeded();
      await languages.click();
      await expect(languages).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#shelf").getByRole("link", { name: /^Python/ })).toBeVisible();
      await check("the topic section on Languages");
    },
  },
  {
    name: "the interview book on a later round",
    path: "/",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      const stage = page.locator("#loop").getByRole("tab", { name: /^02 Technical/ });
      await stage.scrollIntoViewIfNeeded();
      await stage.click();
      const row = page.locator("#loop").getByRole("button", { name: /React & Next\.js/ });
      await row.click();
      await expect(row).toHaveAttribute("aria-current", "true");
      await expect(page.locator("#loop").getByRole("region", { name: "React & Next.js" })).toBeVisible();
      await check("the interview book on a later round");
    },
  },
  {
    name: "the interview book with a round focused and its page showing",
    path: "/",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      const row = page.locator("#loop").getByRole("button", { name: /Online assessment/ });
      await row.scrollIntoViewIfNeeded();
      await row.click();
      await row.focus();
      await expect(row).toBeFocused();
      await expect(page.locator("#loop").getByRole("region", { name: "Online assessment" })).toBeVisible();
      await check("the interview book with a round focused and its page showing");
    },
  },
  {
    name: "the interview book on its last stage",
    path: "/",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      const stage = page.locator("#loop").getByRole("tab", { name: /^04 People and offer/ });
      await stage.scrollIntoViewIfNeeded();
      await stage.click();
      await expect(stage).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#loop").getByRole("tabpanel").getByText("The offer", { exact: true })).toBeVisible();
      await check("the interview book on its last stage");
    },
  },
  {
    name: "the practice section with a row focused",
    path: "/",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      const row = page.locator("#practice").getByRole("link", { name: /Playground/ });
      await row.scrollIntoViewIfNeeded();
      await row.focus();
      await expect(row).toBeFocused();
      await check("the practice section with a row focused");
    },
  },
  {
    name: "a path tab with soon topics",
    path: "/",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      const tab = page.locator("#paths").getByRole("tab", { name: /Senior and system design/ });
      await tab.scrollIntoViewIfNeeded();
      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#paths").getByRole("tabpanel").getByText("soon", { exact: true })).toBeVisible();
      await check("a path tab with soon topics");
    },
  },
  {
    name: "the FAQ with the comparison answer open",
    path: "/",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      const item = page.locator("#faq").getByRole("button", { name: /Why not just videos/ });
      await item.scrollIntoViewIfNeeded();
      await item.click();
      await expect(item).toHaveAttribute("aria-expanded", "true");
      await check("the FAQ with the comparison answer open");
    },
  },
  {
    name: "the section rail with a focused link and its label open",
    path: "/",
    viewports: [WIDE],
    visit: async (page, check) => {
      await page.locator("#practice").scrollIntoViewIfNeeded();
      const rail = page.getByRole("navigation", { name: "Page sections" });
      await expect(rail).toBeVisible();
      const link = rail.getByRole("link", { name: /How it works/ });
      await link.focus();
      await expect(link).toBeFocused();
      await expect(link.locator("span").last()).toHaveCSS("opacity", "1");
      await check("the section rail with a focused link and its label open");
    },
  },
  {
    name: "how it works pinned and scrolled to its last step",
    path: "/",
    viewports: [WIDE],
    visit: async (page, check) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.reload({ waitUntil: "networkidle" });
      const how = page.locator("#how");
      await expect(how).toHaveAttribute("data-pinned", "");
      await how.getByRole("tab", { name: /Keep/ }).click();
      await expect(how.getByRole("tab", { name: /Keep/ })).toHaveAttribute("aria-selected", "true");
      await page.waitForTimeout(2500);
      await page.addStyleTag({
        content: `*, *::before, *::after { transition: none !important; animation: none !important; }
          #practice [data-fx], #practice [data-fx] *, #paths [data-fx], #paths [data-fx] * { opacity: 1 !important; }`,
      });
      await check("how it works pinned and scrolled to its last step");
    },
  },
  {
    name: "the interview book pinned and scrolled to a later round",
    path: "/",
    viewports: [WIDE],
    visit: async (page, check) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.reload({ waitUntil: "networkidle" });
      const book = page.locator("#loop");
      await expect(book).toHaveAttribute("data-pinned", "");
      await book.getByRole("tab", { name: /^04 People and offer/ }).click();
      await expect(book.getByRole("tab", { name: /^04 People and offer/ })).toHaveAttribute("aria-selected", "true");
      await page.waitForTimeout(2800);
      await page.addStyleTag({
        content: `*, *::before, *::after { transition: none !important; animation: none !important; }
          #paths [data-fx], #paths [data-fx] *, #faq [data-fx], #faq [data-fx] * { opacity: 1 !important; }`,
      });
      await check("the interview book pinned and scrolled to a later round");
    },
  },
  {
    name: "how it works on step 3",
    path: "/",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      const step = page.locator("#how").getByRole("tab", { name: /Get asked/ });
      await step.scrollIntoViewIfNeeded();
      await step.click();
      await expect(step).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#how").getByRole("tabpanel")).toContainText("Then get asked the follow-up.");
      await check("how it works on step 3");
    },
  },
  {
    name: "how it works on step 4",
    path: "/",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      const step = page.locator("#how").getByRole("tab", { name: /Keep/ });
      await step.scrollIntoViewIfNeeded();
      await step.click();
      await expect(step).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#how").getByRole("tabpanel")).toContainText("And it comes back before you forget.");
      await check("how it works on step 4");
    },
  },
  {
    name: "the topic section on the AI category",
    path: "/",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      const category = page.locator("#shelf").getByRole("tab", { name: /^AI/ });
      await category.scrollIntoViewIfNeeded();
      await category.click();
      await expect(page.locator("#shelf").getByRole("link", { name: /^Claude/ })).toBeVisible();
      await check("the topic section on the AI category");
    },
  },
  {
    name: "the reading menu open",
    path: "/notes",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      const menu = page.getByRole("dialog", { name: /menu/ });
      await expect(menu).toBeVisible();
      for (const fold of [/Text size/, /Narrator/]) {
        const head = menu.getByRole("button", { name: fold });
        await head.click();
        await expect(head).toHaveAttribute("aria-expanded", "true");
      }
      await check("the reading menu open");
    },
  },
  {
    name: "the Up next card's budget picked",
    path: "/notes",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      await page.getByRole("button", { name: "20m" }).click();
      await check("the Up next card's budget picked");
    },
  },
  {
    name: "the Chapters sheet open",
    path: "/notes/setup-mental-model",
    viewports: [PHONE],
    visit: async (page, check) => {
      await page.getByRole("button", { name: "Chapters", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Chapters" })).toBeVisible();
      await check("the Chapters sheet open");
    },
  },
  {
    name: "the Chapters sheet open",
    path: "/git/merge",
    viewports: [PHONE],
    visit: async (page, check) => {
      await page.getByRole("button", { name: "Chapters", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Chapters" })).toBeVisible();
      await check("the Chapters sheet open");
    },
  },
  {
    name: "the Chapters sheet open",
    path: "/typescript/ts-setup-compiler",
    viewports: [PHONE],
    visit: async (page, check) => {
      await page.getByRole("button", { name: "Chapters", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Chapters" })).toBeVisible();
      await check("the Chapters sheet open");
    },
  },
  {
    name: "the Filters sheet open",
    path: "/problems",
    viewports: [PHONE],
    visit: async (page, check) => {
      await page.getByRole("button", { name: "Filters", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
      await check("the Filters sheet open");
    },
  },
  {
    name: "a chapter due",
    path: "/review",
    viewports: VIEWPORTS,
    seed: () => {
      const day = 86_400_000;
      localStorage.setItem(
        "jsnotes:progress",
        JSON.stringify({ chapters: { closures: { at: Date.now() - 5 * day, reviews: 0 } }, exercises: {} })
      );
    },
    visit: async (page, check) => {
      await expect(page.getByRole("heading", { level: 1 })).toContainText("1 chapter");
      await expect(page.getByRole("heading", { name: "Due now" })).toBeVisible();
      await check("a chapter due");
    },
  },
  {
    name: "a chapter marked read",
    path: "/path/js/beginner",
    viewports: VIEWPORTS,
    seed: () => {
      localStorage.setItem(
        "jsnotes:progress",
        JSON.stringify({ chapters: { "setup-mental-model": { at: Date.now(), reviews: 0 } }, exercises: {} })
      );
    },
    visit: async (page, check) => {
      await expect(page.getByRole("button", { name: "Mark as unread", pressed: true }).first()).toBeVisible();
      await check("a chapter marked read");
    },
  },
  {
    name: "a year of activity",
    path: "/progress",
    viewports: VIEWPORTS,
    seed: () => {
      const day = 86_400_000;
      const log: Record<string, number> = {};
      for (let ago = 0; ago < 300; ago += 3) {
        const date = new Date(Date.now() - ago * day);
        const key = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
          .map((part) => String(part).padStart(2, "0"))
          .join("-");
        log[key] = (ago % 5) * 2 + 1;
      }
      localStorage.setItem("jsnotes:activity", JSON.stringify(log));
      localStorage.setItem(
        "jsnotes:progress",
        JSON.stringify({ chapters: { closures: { at: Date.now() - 2 * day, reviews: 1 } }, exercises: {} })
      );
    },
    visit: async (page, check) => {
      await expect(page.getByRole("heading", { name: "The last year" })).toBeVisible();
      await expect(page.locator("[data-l='4']").first()).toBeAttached();
      await check("a year of activity");
    },
  },
  {
    name: "two saved mock sessions",
    path: "/mock",
    viewports: VIEWPORTS,
    seed: () => {
      const now = Date.now();
      const session = (daysAgo: number, javascript: number, design: number) => ({
        id: `h${daysAgo}`,
        mode: "loop",
        config: { role: "fullstack", seniority: "mid", company: "product", intensity: "quick" },
        startedAt: now - daysAgo * 86_400_000 - 3e6,
        finishedAt: now - daysAgo * 86_400_000,
        stages: [
          { stage: "javascript", core: false, scores: [javascript] },
          { stage: "design", core: false, scores: [design] },
        ],
        verdict: "lean-hire",
        headline: "",
        level: "at",
        score: 0.6,
        questions: 4,
        timedOut: 0,
        skipped: 0,
      });
      localStorage.setItem("groundwork:mock:history", JSON.stringify([session(1, 0.6, 0.3), session(0, 0.8, 0.4)]));
    },
    visit: async (page, check) => {
      await expect(page.getByRole("heading", { name: "Round by round, last 2 sessions" })).toBeVisible();
      await check("two saved mock sessions");
    },
  },
  {
    name: "a system design mock round",
    path: "/mock",
    viewports: VIEWPORTS,
    visit: async (page, check) => {
      await page.getByRole("tab", { name: "Single round" }).click();
      await page.getByRole("button", { name: /^System design/ }).click();
      await page.getByRole("group", { name: "How many questions" }).getByRole("button", { name: /^3/ }).click();
      await page.getByRole("button", { name: "Start System design" }).click();

      const walkIn = page.getByRole("button", { name: "Walk in" });
      await walkIn.waitFor();
      await check("the stage brief");
      await walkIn.click();

      for (let question = 0; question < 3; question++) {
        const answered = page.getByRole("button", { name: "I've answered" });
        await answered.waitFor();
        if (question === 0) await check("a question");
        await answered.click();
        const push = page.getByRole("button", { name: "Answered — show me" });
        const rubric = page.getByText("Mark it honestly");
        await expect(push.or(rubric)).toBeVisible();
        if (await push.isVisible()) {
          if (question === 0) await check("a follow-up");
          await push.click();
        }
        await expect(rubric).toBeVisible();
        if (question === 0) await check("the review and rubric");
        for (let line = 0; line < 5; line++) await page.keyboard.press(line % 2 ? "2" : "1");
        await page.getByRole("button", { name: "Next question" }).click();
      }

      await expect(page.getByText("Round debrief")).toBeVisible();
      await check("the debrief");
    },
  },
];

const viewportName = ({ width, height }: Viewport) => `${width}×${height}`;

function wearTheme(page: Page, theme: ThemeValue) {
  return page.evaluate((value) => {
    localStorage.setItem("jsnotes:theme", JSON.stringify(value));
    document.documentElement.setAttribute("data-theme", value);
  }, theme);
}

function describeViolation(where: string, violation: Violation): string {
  const nodes = violation.nodes.slice(0, 3).map((node) => {
    const detail = [...node.any, ...node.all, ...node.none].find((check) => check.message)?.message ?? "";
    return `      ${node.target.join(" ")} ${detail}\n        ${node.html.slice(0, 160)}`;
  });
  const more = violation.nodes.length > 3 ? [`      and ${violation.nodes.length - 3} more`] : [];
  return [`${where}: [${violation.impact}] ${violation.id}, ${violation.help}`, ...nodes, ...more].join("\n");
}

async function expectNoViolationsInAnyTheme(page: Page, where: string, viewport: Viewport) {
  const failures: string[] = [];
  for (const theme of THEMES) {
    await wearTheme(page, theme);
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_A_AND_AA).analyze();
    const place = `${where}, ${theme} theme, ${viewportName(viewport)}`;
    failures.push(...violations.map((violation) => describeViolation(place, violation)));
  }
  expect(failures, `${where} at ${viewportName(viewport)} has accessibility violations`).toEqual([]);
}

async function open(page: Page, path: string) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(path, { waitUntil: "networkidle" });
  await expect(page.locator("main").first()).toBeVisible();
}

for (const viewport of VIEWPORTS) {
  test.describe(`at ${viewportName(viewport)}`, () => {
    test.use({ viewport });
    test.describe.configure({ timeout: 180_000 });

    for (const path of PAGES) {
      test(`${path} has no accessibility violations in any theme`, async ({ page }) => {
        await open(page, path);
        await expectNoViolationsInAnyTheme(page, path, viewport);
      });
    }

    for (const state of STATES.filter(({ viewports }) => viewports.includes(viewport))) {
      test(`${state.path} with ${state.name} has no accessibility violations in any theme`, async ({ page }) => {
        if (state.seed) await page.addInitScript(state.seed);
        await open(page, state.path);
        await state.visit(page, (stage) => expectNoViolationsInAnyTheme(page, `${state.path}, ${stage}`, viewport));
      });
    }
  });
}
