import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chapters, exercises, topics } from "@/lib/content";
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

const cases: { file: string; claim: string; about: string }[] = [
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

const a11ySpec = read("e2e/a11y.spec.ts");
const a11yPages = [...(/const PAGES = \[([\s\S]*?)\];/.exec(a11ySpec)?.[1] ?? "").matchAll(/"\//g)].length;
const a11yTests =
  (a11ySpec.match(/^ {2}test\(/gm) ?? []).length * a11yPages + (a11ySpec.match(/^test\(/gm) ?? []).length;

const smokeSpec = read("e2e/smoke.spec.ts");
const smokePages = [...(/const PAGES = \[([\s\S]*?)\];/.exec(smokeSpec)?.[1] ?? "").matchAll(/path:/g)].length;
const smokeViewports = [
  ...(/for \(const \[width, maxBar\] of \[([\s\S]*?)\] as const\)/.exec(smokeSpec)?.[1] ?? "").matchAll(
    /\[\d+, \d+\]/g
  ),
].length;
const smokeFlows = (smokeSpec.match(/^test\(/gm) ?? []).length;
const smokeTests = smokePages + smokeViewports + smokeFlows;

const whiteboardSpec = read("e2e/whiteboard.spec.ts");
const whiteboardTests = (whiteboardSpec.match(/^ {0,2}test\(/gm) ?? []).length;

const browserTests = smokeTests + a11yTests + whiteboardTests;

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
    file: "content/architecture/arch-design-system.ts",
    claim: `runs axe through <code>@axe-core/playwright</code> against ${a11yPages} pages`,
    about: "the pages axe checks",
  },
  {
    file: "content/architecture/arch-testing.ts",
    claim: `<tr><td><code>a11y.spec.ts</code></td><td>${a11yTests}</td><td>axe with the WCAG 2.0 and 2.1 A and AA tags over ${a11yPages} pages`,
    about: "the accessibility spec's tests and pages",
  },
  {
    file: "content/architecture/arch-testing.ts",
    claim: `<tr><td><code>smoke.spec.ts</code></td><td>${smokeTests}</td><td>${smokePages} routes load with no console error and no failed request; the playground fits at 1024, 768 and 390 pixels wide; ${smokeFlows} flows`,
    about: "the smoke spec's tests, routes and flows",
  },
  {
    file: "content/architecture/arch-testing.ts",
    claim: `<h3>Browser tests: 3 specs, ${browserTests} tests</h3>`,
    about: "the three specs' total",
  },
  {
    file: "content/architecture/arch-testing.ts",
    claim: `unit tests, ${browserTests} browser tests`,
    about: "the browser total in the subtitle",
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
    expect(a11yPages).toBeGreaterThan(0);
    expect(a11yTests).toBeGreaterThan(a11yPages);
    expect(smokePages).toBeGreaterThan(0);
    expect(smokeViewports).toBeGreaterThan(0);
    expect(smokeSpec.match(/^ {2}test\(/gm) ?? [], "one test per PAGES entry and one per viewport").toHaveLength(2);
    expect(whiteboardTests).toBeGreaterThan(0);
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
