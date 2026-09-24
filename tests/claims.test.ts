import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chapters, exercises, topics } from "@/lib/content";
import { INTERVIEW_TOTAL_QUESTIONS, INTERVIEW_TOTAL_ROUNDS } from "@/lib/interviewContent";
import { siteStats } from "@/lib/topicStats";

/**
 * The "How this is built" chapters and the README describe this site, so every
 * figure in them is a claim that goes stale the moment the content moves. They
 * all had: 112 written chapters when there were 217, 299 exercises when there
 * were 538, 23 interview rounds when there were 27.
 *
 * Each case below rebuilds the sentence from the content and asserts the file
 * still says it, so the next figure that moves fails here with the string to
 * put in its place, rather than being read by someone months later.
 */
const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

const stats = siteStats();
const all = topics();
const topicChapters = all.flatMap((t) => chapters(t.id));
const written = topicChapters.filter((c) => c.ready).length;
const outlines = topicChapters.length - written;
const exerciseCount = exercises().length;

// Git has sections rather than chapters, so it counts as written without
// appearing in the chapter list above.
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

  it("counts the topics it lists", () => {
    const standalone = all.filter((t) => t.status === "ready" && !t.levels).length;
    const writtenTopics = all.filter((t) => t.levels && chapters(t.id).some((c) => c.ready)).length;
    const outlined = all.length - standalone - writtenTopics;
    expect(read("content/architecture/arch-overview.ts")).toContain(
      `<tr><td>Topics</td><td>${all.length} — ${writtenTopics} written, ${outlined} outlined, ${standalone} standalone</td></tr>`
    );
  });
});
