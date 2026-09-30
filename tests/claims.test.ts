import { readFileSync } from "node:fs";
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
