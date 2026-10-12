import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { chapters, exercises, topics } from "@/lib/content";
import { LANG_ORDER, LANGUAGES } from "@/lib/codeLanguages";
import { bankQuestions } from "@/lib/interviewBook";
import { INTERVIEW_TOTAL_QUESTIONS, INTERVIEW_TOTAL_ROUNDS } from "@/lib/interviewContent";
import { siteStats } from "@/lib/topicStats";
import { hasColourLiteral } from "./colour-literal";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

const stats = siteStats();
const all = topics();
const topicChapters = all.flatMap((t) => chapters(t.id));
const written = topicChapters.filter((c) => c.ready).length;
const outlines = topicChapters.length - written;
const exerciseCount = exercises().length;

const writtenIncludingGit = stats.writtenChapters;
const totalIncludingGit = topicChapters.length + (writtenIncludingGit - written);

const sitemapUrlCount = sitemap().length;
const jsChapters = chapters("js").length;
const topicsWithLevels = all.filter((t) => t.levels).length;
const writtenTopicsWithLevels = all.filter((t) => t.levels && chapters(t.id).some((c) => c.ready)).length;
const outlinedTopicsWithLevels = topicsWithLevels - writtenTopicsWithLevels;
const runnableLanguages = LANG_ORDER.filter((key) => LANGUAGES[key].runnable);
const runnableCount = runnableLanguages.length;
const namedRunnable = runnableLanguages.map((key) => LANGUAGES[key].label);
const namedRunnableAsProse = `${namedRunnable.slice(0, -1).join(", ")} and ${namedRunnable.at(-1)}`;

const cases: { file: string; claim: string; about: string }[] = [
  {
    file: "content/topics.ts",
    claim: `The whole map, ${jsChapters} sections deep`,
    about: "the JavaScript tagline",
  },
  {
    file: "content/architecture/arch-build.ts",
    claim: `lists ${sitemapUrlCount} URLs`,
    about: "the sitemap's URL count",
  },
  {
    file: "content/architecture/arch-routes.ts",
    claim: `${topicsWithLevels} pages, one per topic with levels. ${writtenTopicsWithLevels} render the three levels with chapter, minute and exercise counts; the other ${outlinedTopicsWithLevels}, which have nothing written, redirect to the topic's own cover instead`,
    about: "the /level/<topic> row's written vs outline split",
  },
  {
    file: "content/architecture/arch-routes.ts",
    claim: `Your progress through each level, for the ${writtenTopicsWithLevels} that render`,
    about: "the /level/<topic> row's browser column",
  },
  {
    file: "README.md",
    claim: `A CodeMirror editor running ${runnableCount} languages in the browser — ${namedRunnableAsProse} — with ${LANG_ORDER.length - runnableCount} more known for syntax highlighting`,
    about: "the Playground row's language count",
  },
  {
    file: "app/practice/page.tsx",
    claim: `${namedRunnable.slice(0, 4).join(", ")} and ${runnableCount - 4} more languages`,
    about: "the Playground page description's language count",
  },
  {
    file: "content/architecture/arch-overview.ts",
    claim: `<tr><td>Written chapters</td><td>${writtenIncludingGit}, plus ${outlines} outlines</td></tr>`,
    about: "written chapters and outlines",
  },
  {
    file: "content/architecture/arch-overview.ts",
    claim: `<tr><td>Exercises with tests</td><td>${exerciseCount}</td></tr>`,
    about: "exercise count",
  },
  {
    file: "content/architecture/arch-overview.ts",
    claim: `<tr><td>Interview questions</td><td>${INTERVIEW_TOTAL_QUESTIONS} across ${INTERVIEW_TOTAL_ROUNDS} rounds</td></tr>`,
    about: "interview questions and rounds",
  },
  {
    file: "content/architecture/arch-coming-soon.ts",
    claim: `${writtenIncludingGit} chapters written, ${outlines} outlined`,
    about: "the progress line",
  },
  {
    file: "content/architecture/arch-content-model.ts",
    claim: `>${writtenIncludingGit} written<`,
    about: "the chapter box in the diagram",
  },
  {
    file: "content/architecture/arch-content-model.ts",
    claim: `>${exerciseCount} with tests<`,
    about: "the exercise box in the diagram",
  },
  {
    file: "content/architecture/arch-content-model.ts",
    claim: `show ${totalIncludingGit} chapters while honestly claiming ${writtenIncludingGit}`,
    about: "what ready:false buys",
  },
  {
    file: "content/architecture/arch-scaling.ts",
    claim: `Writing the ${outlines} outlined chapters`,
    about: "the scaling table",
  },
  {
    file: "content/architecture/arch-build.ts",
    claim: `Writing the ${outlines} outlined`,
    about: "the build-time note",
  },
  {
    file: "README.md",
    claim: `| **Interview book** | ${INTERVIEW_TOTAL_ROUNDS} rounds`,
    about: "the interview book row",
  },
];

describe("what the site says about itself", () => {
  it("has something to check", () => {
    expect(cases.length).toBeGreaterThan(5);
    expect(writtenIncludingGit).toBeGreaterThan(0);
    expect(exerciseCount).toBeGreaterThan(0);
  });

  it.each(cases)("$file still tells the truth about $about", ({ file, claim }) => {
    expect(read(file), `expected to find: ${claim}`).toContain(claim);
  });

  it("keeps the question bank's drillable count smaller than the site's total question count", () => {
    const drillable = bankQuestions().length;
    expect(drillable).toBeGreaterThan(0);
    expect(drillable, "the bank now holds every question, leaving nothing to call rapid-fire").toBeLessThan(
      INTERVIEW_TOTAL_QUESTIONS
    );
    const source = read("app/interview/questions/QuestionBank.tsx");
    expect(source).toContain("questions.length} questions answered in depth, plus");
    expect(source).toContain("{totalQuestions - questions.length}");
    expect(read("app/interview/questions/page.tsx")).toContain("totalQuestions={INTERVIEW_TOTAL_QUESTIONS}");
  });

  it("counts the Paper theme's custom properties and colour tokens in the design-system chapter", () => {
    const paper = /:root,\s*\[data-theme="light"\]\s*\{([^}]*)\}/.exec(read("app/globals.css"))?.[1] ?? "";
    const values = [...paper.matchAll(/(?<![\w-])--[\w-]+\s*:\s*([^;]+);/g)].map((match) => match[1]);
    const colours = values.filter((value) => hasColourLiteral(value)).length;
    const chapter = read("content/architecture/arch-design-system.ts");
    expect(values.length).toBeGreaterThan(0);
    expect(chapter).toContain(`defines ${values.length} custom properties`);
    expect(chapter).toContain(`Its ${colours} colour tokens`);
    expect(chapter).toContain(`restates the ${colours} colour tokens`);
  });

  it("counts the topics it lists", () => {
    const standalone = all.filter((t) => t.status === "ready" && !t.levels).length;
    const writtenTopics = all.filter((t) => t.levels && chapters(t.id).some((c) => c.ready)).length;
    const outlined = all.length - standalone - writtenTopics;
    expect(read("content/architecture/arch-overview.ts")).toContain(
      `<tr><td>Topics</td><td>${all.length} — ${writtenTopics} written, ${outlined} outlined, ${standalone} standalone</td></tr>`
    );
  });
});

const lineCount = (text: string) => (text.match(/\n/g) ?? []).length;
const thousands = (count: number) => count.toLocaleString("en-US");
const toTheHundred = (count: number) => thousands(Math.round(count / 100) * 100);
const flattened = (text: string) => text.replace(/\s+/g, " ");

function filesUnder(dirs: string[]): string[] {
  return dirs.flatMap((dir) =>
    readdirSync(join(process.cwd(), dir), { recursive: true, encoding: "utf8" }).map((entry) => `${dir}/${entry}`)
  );
}

const cssModules = filesUnder(["app", "components"])
  .filter((file) => file.endsWith(".module.css"))
  .map((file) => ({ file, lines: lineCount(read(file)) }))
  .sort((a, b) => b.lines - a.lines);

const globalsAbout = toTheHundred(lineCount(read("app/globals.css")));

const sources = filesUnder(["app", "components", "lib"])
  .filter((file) => /\.tsx?$/.test(file))
  .map((file) => read(file));
const clientFiles = sources.filter((source) => /^\s*["']use client["']/.test(source)).length;

const smokeSpec = read("e2e/smoke.spec.ts");
const smokePages = [...(/const PAGES = \[([\s\S]*?)\];/.exec(smokeSpec)?.[1] ?? "").matchAll(/path:/g)].length;
const smokeFlows = (smokeSpec.match(/^test\(/gm) ?? []).length;
const smokeTests = smokePages + smokeFlows;

const specFiles = readdirSync(join(process.cwd(), "e2e"))
  .filter((file) => file.endsWith(".spec.ts"))
  .sort();

const flattenedCases: { file: string; claim: string; about: string }[] = [
  {
    file: "content/architecture/arch-design-system.ts",
    claim: `<code>globals.css</code> is about ${globalsAbout} lines`,
    about: "the length of globals.css",
  },
  {
    file: "content/architecture/arch-design-system.ts",
    claim: `one of ${cssModules.length} CSS modules`,
    about: "the number of CSS modules",
  },
  {
    file: "content/architecture/arch-design-system.ts",
    claim: `the largest being <code>${cssModules[0]?.file}</code> at about ${toTheHundred(cssModules[0]?.lines ?? 0)} lines`,
    about: "the largest CSS module",
  },
  {
    file: "content/architecture/arch-rendering.ts",
    claim: `<code>components/</code> and <code>lib/</code>, ${clientFiles} files carry the directive`,
    about: "the files marked use client",
  },
  {
    file: "content/architecture/arch-health.ts",
    claim: `<strong><code>app/globals.css</code>, about ${globalsAbout} lines</strong>`,
    about: "the length of globals.css",
  },
  {
    file: "content/architecture/arch-tech-stack.ts",
    claim: `<code>app/globals.css</code> at about ${globalsAbout} lines, plus ${cssModules.length} CSS modules`,
    about: "the CSS row",
  },
  {
    file: "content/architecture/arch-testing.ts",
    claim: `<tr><td><code>smoke.spec.ts</code></td><td>${smokeTests}</td><td>${smokePages} pages load with their heading and no console error; ${smokeFlows} flows`,
    about: "the smoke spec's tests, pages and flows",
  },
  {
    file: "content/architecture/arch-testing.ts",
    claim: `<h3>Browser tests: one smoke spec, ${smokeTests} tests</h3>`,
    about: "the browser test total",
  },
  {
    file: "content/architecture/arch-tech-stack.ts",
    claim: `${smokeTests} tests in one smoke spec against a production build`,
    about: "the Playwright row's test count",
  },
  {
    file: "content/architecture/arch-testing.ts",
    claim: `unit tests, ${smokeTests} browser tests`,
    about: "the browser total in the subtitle",
  },
  {
    file: "content/architecture/arch-health.ts",
    claim: `<tr><td>Playwright, one smoke spec</td><td><span class="chip tone-yes">${smokeTests} of ${smokeTests}</span></td></tr>`,
    about: "the Playwright row",
  },
];

const CHART =
  /<svg viewBox="0 0 (\d+) \d+"[^>]*aria-label="Bar chart of the largest files by line count[^"]*"[\s\S]*?<\/svg>/;

function lineCountChart() {
  const chapter = read("content/architecture/arch-health.ts");
  const svg = CHART.exec(chapter);
  const viewWidth = Number(svg?.[1] ?? 0);
  const body = svg?.[0] ?? "";
  const names = [...body.matchAll(/<text class="lbl" [^>]*>([^<]+)<\/text>/g)].map((match) => match[1]);
  const widths = [...body.matchAll(/<rect x="(\d+)" y="\d+" width="(\d+)"/g)].map((match) => ({
    x: Number(match[1]),
    width: Number(match[2]),
  }));
  const labels = [...body.matchAll(/<text class="sm" x="(\d+)" y="\d+">([\d,]+)<\/text>/g)].map((match) => ({
    x: Number(match[1]),
    lines: Number(match[2].replace(/,/g, "")),
  }));
  return { body, viewWidth, bars: names.map((name, i) => ({ name, ...widths[i], label: labels[i] })) };
}

describe("what the site says about its stylesheets and checks", () => {
  it("finds what it counts", () => {
    expect(cssModules.length).toBeGreaterThan(0);
    expect(clientFiles, "some files carry use client").toBeGreaterThan(0);
    expect(smokePages).toBeGreaterThan(0);
    expect(smokeFlows).toBeGreaterThan(0);
    expect(smokeSpec.match(/^ {2}test\(/gm) ?? [], "one test per PAGES entry").toHaveLength(1);
    expect(specFiles, "the only browser spec is the smoke spec").toEqual(["smoke.spec.ts"]);
  });

  it.each(flattenedCases)("$file still tells the truth about $about", ({ file, claim }) => {
    expect(flattened(read(file)), `expected to find: ${claim}`).toContain(flattened(claim));
  });

  it("charts each file within 5% of its line count today", () => {
    const { bars, body } = lineCountChart();
    const files = filesUnder(["app", "components", "lib", "content", "e2e", "tests", "scripts"]);
    expect(bars.length).toBeGreaterThan(1);
    for (const { name, label } of bars) {
      const matches = files.filter((file) => file === name || file.endsWith(`/${name}`));
      expect(matches, `the chart's ${name} names exactly one file`).toHaveLength(1);
      const today = lineCount(read(matches[0]));
      expect(
        Math.abs(label.lines - today) / today,
        `${name} is charted at ${label.lines}, and is ${today} lines`
      ).toBeLessThanOrEqual(0.05);
      expect(body, `the chart's description names ${name}`).toContain(`${name} ${thousands(label.lines)}`);
    }
  });

  it("draws every bar to one scale, set by the longest, with room for its label", () => {
    const { bars, viewWidth } = lineCountChart();
    const longest = bars.reduce((a, b) => (b.label.lines > a.label.lines ? b : a));
    const unitsPerLine = longest.width / longest.label.lines;
    for (const { name, width, label } of bars) {
      const drift = Math.abs(width - label.lines * unitsPerLine);
      expect(drift, `the ${name} bar is ${drift.toFixed(1)} units off scale`).toBeLessThanOrEqual(1);
    }
    expect(
      longest.x + longest.width + 120,
      "the longest bar and its label fit the chart with room to grow"
    ).toBeLessThanOrEqual(viewWidth);
  });
});
