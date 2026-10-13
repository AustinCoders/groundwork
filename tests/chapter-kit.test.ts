import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

const globals = read("app/globals.css");
const kitCss = read("components/chapter/chapterKit.module.css");
const proseStart = globals.indexOf("\n.prose {");
const proseEnd = globals.indexOf("\n.bx__cap {");
const prose = globals.slice(proseStart, proseEnd);

const TOKENS = [
  "--t-display",
  "--t-heading",
  "--t-control",
  "--t-title",
  "--t-body",
  "--t-meta",
  "--t-kicker",
  "--t-lead",
  "--t-prose",
  "--t-prose-h3",
  "--t-chapter",
];

const KIT_MONO_USERS = [
  ".learnKicker",
  ".hereTag",
  ".node",
  ".inlineToc summary",
  ".inlineToc a::before",
  ".crumbs span[aria-current]",
  ".position",
  ".navHint",
];

const PROSE_MONO_USERS = [
  ".prose pre::before",
  ".prose .try::after",
  ".prose .try .demo__term::before",
  ".prose :is(h2, h3:not(.subhead))::before",
  ".prose th",
  ".prose figcaption::before",
  ".prose .qa .q::before",
];

const CHAPTER_FILES = [
  "components/chapter/ChapterKit.tsx",
  "components/series/ChapterView.tsx",
  "components/topic/TopicReader.tsx",
  "components/topic/TopicOutlineChapter.tsx",
];

function sizesOf(css: string) {
  return [...css.matchAll(/^\s*font-size:\s*([^;]+);/gm)].map((match) => match[1].trim());
}

function monoUsers(css: string) {
  return [...css.matchAll(/([^{}]+)\{[^{}]*font-family:\s*var\(--font-mono\)/g)].map((match) => match[1].trim());
}

describe("the chapter prose and kit share the type scale", () => {
  it("defines the reading sizes once on :root", () => {
    expect(globals).toMatch(/--t-prose: clamp\(1rem, 0\.7rem \+ 0\.45vw, 1\.1875rem\);/);
    expect(globals).toMatch(/--t-prose-h3: clamp\(1\.5rem, 1rem \+ 1vw, 2\.375rem\);/);
    expect(globals).toMatch(/--t-chapter: clamp\(2\.5rem, 1rem \+ 3\.2vw, 4\.25rem\);/);
  });

  it("finds the prose layer", () => {
    expect(proseStart).toBeGreaterThan(0);
    expect(proseEnd).toBeGreaterThan(proseStart);
  });

  for (const [name, css, mono] of [
    ["the chapter kit", kitCss, KIT_MONO_USERS],
    ["the prose layer", prose, PROSE_MONO_USERS],
  ] as const) {
    describe(name, () => {
      it("does not define its own sizes", () => {
        expect(css).not.toMatch(/--t-[a-z0-9-]+:/);
      });

      it("sets every font size from a token or inherits it", () => {
        for (const size of sizesOf(css)) {
          const token = /^var\((--t-[a-z0-9-]+)\)$/.exec(size)?.[1];
          expect((token && TOKENS.includes(token)) || size === "inherit" || /^[\d.]+em$/.test(size), size).toBe(true);
        }
      });

      it("uses only the weights 400 and 700", () => {
        const weights = [...css.matchAll(/^\s*font-weight:\s*([^;]+);/gm)].map((match) => match[1].trim());
        for (const weight of weights) expect(["400", "700"], weight).toContain(weight);
      });

      it("keeps the mono face for kickers and numbers alone", () => {
        for (const user of monoUsers(css)) expect(mono, user).toContain(user);
      });
    });
  }

  it("keeps scroll reveals and part-transparent animation off the chapter pages", () => {
    for (const file of CHAPTER_FILES) expect(read(file), file).not.toContain("data-fx");
    expect(kitCss).not.toMatch(/animation|@keyframes/);
    expect(prose).not.toMatch(/animation|@keyframes/);
  });

  it("keeps the old chapter-only stylesheets gone", () => {
    const modules = readdirSync(join(process.cwd(), "components/series")).concat(
      readdirSync(join(process.cwd(), "components/reader"))
    );
    expect(modules).not.toContain("chapter.module.css");
    expect(modules).not.toContain("practiceStrip.module.css");
    for (const selector of [".qa {", ".bx {", ".chapter__head", ".practice-strip {", ".codeblock {"]) {
      expect(globals.split("\n").filter((line) => line === selector)).toEqual([]);
    }
  });
});
