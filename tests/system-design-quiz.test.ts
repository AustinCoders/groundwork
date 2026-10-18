import { readdirSync, readFileSync, statSync } from "node:fs";
import { posix, join } from "node:path";
import { describe, expect, it } from "vitest";
import type { CheckQuestion, DesignPool, DesignQuestion } from "@/content/quiz-types";
import { drawCheck } from "@/lib/checkDraw";
import { checkChapterIds, loadCheckQuestions } from "@/lib/checkPool";
import { chapters } from "@/lib/content";
import {
  answerBalanceProblems,
  DESIGN_POOL_SIZE,
  DESIGN_SKILLS,
  designPoolProblems,
  designSizeProblems,
  designVocabularyProblems,
} from "@/lib/designQuiz";
import { designPoolChapterIds, loadDesignPool } from "@/lib/designPool";
import { withHeadingIds } from "@/lib/headingToc";
import { duplicateIdProblems, type ChapterFacts } from "@/lib/quiz";
import { loadPool, poolChapterIds } from "@/lib/quizPool";

const QUIZ_DIR = join(process.cwd(), "content", "system-design", "quiz");
const WRITTEN = chapters("system-design").filter((chapter) => chapter.ready);
const REGISTERED = designPoolChapterIds();

const pools: Record<string, DesignPool | null> = {};
for (const id of REGISTERED) pools[id] = await loadDesignPool(id).catch(() => null);

const present = Object.entries(pools).flatMap(([id, pool]) => (pool ? [[id, pool] as const] : []));

function factsOf(chapterId: string): ChapterFacts | null {
  const found = chapters("system-design").find((chapter) => chapter.id === chapterId);
  if (!found) return null;
  return { id: found.id, levels: found.levels, sections: withHeadingIds(found.body).toc.map((item) => item.id) };
}

const copy = <T>(value: T): T => structuredClone(value);

function loose<T>(value: unknown): T {
  return value as T;
}

const sample = pools["sysdes-rate-limiting"]!;
const sampleFacts = factsOf("sysdes-rate-limiting")!;

function plain(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function escaped(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mentions(text: string, expected: string): boolean {
  return new RegExp(`(?<![\\d.,])${escaped(expected)}(?!\\d|[.,]\\d)`).test(text);
}

type EstimateTable = Record<string, () => string>;

const ESTIMATE_DIR = join(process.cwd(), "tests", "design-estimates");
const estimates: EstimateTable = {};
for (const name of readdirSync(ESTIMATE_DIR)
  .filter((file) => file.endsWith(".ts"))
  .map((file) => file.slice(0, -3))) {
  const file = (await import(`./design-estimates/${name}.ts`)) as { estimates: EstimateTable };
  for (const [id, compute] of Object.entries(file.estimates)) {
    if (id in estimates) throw new Error(`${id}: two estimate tables claim this question (${name})`);
    estimates[id] = compute;
  }
}

const allQuestions: DesignQuestion[] = present.flatMap(([, pool]) => pool.questions);

describe("the design skill vocabulary", () => {
  it("has unique kebab-case ids with a label each", () => {
    const ids = DESIGN_SKILLS.map((skill) => skill.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const skill of DESIGN_SKILLS) {
      expect(skill.id).toMatch(/^[a-z]+$/);
      expect(skill.label.trim()).not.toBe("");
    }
  });
});

describe("every System Design chapter has a practice pool", () => {
  it("registers a pool for each written chapter and nothing else", () => {
    expect([...REGISTERED].sort()).toEqual(WRITTEN.map((chapter) => chapter.id).sort());
  });

  it("has a pool file for exactly the chapters the registry lists", () => {
    const files = readdirSync(QUIZ_DIR)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => name.slice(0, -3))
      .sort();
    expect(files).toEqual([...REGISTERED].sort());
  });

  it("leaves no chapter with both practice: [] and no pool", () => {
    const bare = WRITTEN.filter((chapter) => chapter.practice.length === 0 && !pools[chapter.id]);
    expect(bare.map((chapter) => chapter.id)).toEqual([]);
  });

  for (const chapter of WRITTEN) {
    it(`${chapter.id} reports no problem`, () => {
      const pool = pools[chapter.id];
      expect(pool, "the pool file does not load").toBeTruthy();
      expect(designPoolProblems(pool!, factsOf(chapter.id), chapter.id)).toEqual([]);
    });
  }

  it("keeps question ids unique across System Design and DSA", async () => {
    const dsa: Record<string, { questions: CheckQuestion[] }> = {};
    for (const id of poolChapterIds()) dsa[id] = (await loadPool(id))!;
    const design: Record<string, { questions: CheckQuestion[] }> = {};
    for (const [id, pool] of present) design[id] = pool;
    expect(duplicateIdProblems({ ...dsa, ...design })).toEqual([]);
  });

  it("does not favour one letter or the longest choice for the right answer", () => {
    expect(answerBalanceProblems(allQuestions)).toEqual([]);
  });

  it("mixes single, multi and order questions across the topic", () => {
    const kinds = new Set(allQuestions.map((question) => question.kind));
    expect([...kinds].sort()).toEqual(["multi", "order", "single"]);
    expect(allQuestions.filter((question) => question.skill === "estimate").length).toBeGreaterThanOrEqual(10);
    expect(allQuestions.filter((question) => question.skill === "sequence").length).toBeGreaterThanOrEqual(10);
  });
});

describe("the numeric questions are recomputed", () => {
  const estimateQuestions = allQuestions.filter((question) => question.skill === "estimate");

  it("has an estimate table for every estimate question and no stray entries", () => {
    expect(estimateQuestions.map((question) => question.id).sort()).toEqual(Object.keys(estimates).sort());
  });

  for (const question of estimateQuestions) {
    it(`${question.id} marks the recomputed answer and no other choice`, () => {
      const compute = estimates[question.id];
      expect(compute, "no estimate table entry").toBeTruthy();
      const expected = compute();
      expect(question.kind).not.toBe("order");
      if (question.kind === "order") return;
      const right = new Set(question.kind === "multi" ? question.answers : [question.answer]);
      for (const choice of question.choices) {
        const says = mentions(plain(choice.text), expected);
        expect(says, `${choice.id} ${right.has(choice.id) ? "should" : "should not"} say "${expected}"`).toBe(
          right.has(choice.id)
        );
      }
    });
  }
});

describe("the integrity helpers fail on a bad design pool", () => {
  it("accepts the real rate-limiting pool", () => {
    expect(designPoolProblems(sample, sampleFacts, "sysdes-rate-limiting")).toEqual([]);
  });

  it("fails when an answer is not a choice", () => {
    const pool = copy(sample);
    const single = pool.questions.find((question) => question.kind === "single")!;
    loose<{ answer: string }>(single).answer = "zz";
    expect(designPoolProblems(pool, sampleFacts, "sysdes-rate-limiting").join("\n")).toMatch(/not a choice/);
  });

  it("fails when a section is not a heading of the chapter", () => {
    const pool = copy(sample);
    pool.questions[0].section = "no-such-heading";
    expect(designPoolProblems(pool, sampleFacts, "sysdes-rate-limiting").join("\n")).toMatch(/not a heading/);
  });

  it("fails when an explanation is empty", () => {
    const pool = copy(sample);
    const single = pool.questions.find((question) => question.kind === "single")!;
    if (single.kind === "single") single.choices[0].why = " ";
    expect(designPoolProblems(pool, sampleFacts, "sysdes-rate-limiting").join("\n")).toMatch(/no explanation/);
  });

  it("fails when the chapter or level is wrong", () => {
    const pool = copy(sample);
    pool.questions[0].chapter = "sysdes-cdns";
    pool.questions[1].level = "beginner";
    const text = designPoolProblems(pool, sampleFacts, "sysdes-rate-limiting").join("\n");
    expect(text).toMatch(/chapter is "sysdes-cdns"/);
    expect(text).toMatch(/not one of the chapter's levels/);
  });

  it("fails on a DSA pattern, a placement flag or an unknown skill", () => {
    const question = copy(sample.questions[0]);
    loose<{ pattern: string }>(question).pattern = "binary-search";
    loose<{ placement: boolean }>(question).placement = true;
    loose<{ skill: string }>(question).skill = "trace";
    const text = designVocabularyProblems(question).join("\n");
    expect(text).toMatch(/no DSA pattern/);
    expect(text).toMatch(/not a placement question/);
    expect(text).toMatch(/not a design skill/);
  });

  it("fails on a predict question", () => {
    const question = copy(sample.questions[0]);
    loose<{ kind: string }>(question).kind = "predict";
    expect(designVocabularyProblems(question).join("\n")).toMatch(/single, multi or order/);
  });

  it("fails when the pool is thin, fat, or all one skill", () => {
    const { min, max } = DESIGN_POOL_SIZE;
    expect(designSizeProblems(sample.questions.slice(0, min - 1)).join("\n")).toMatch(/need/);
    const fat = Array.from({ length: max + 1 }, (_, at) => ({ ...copy(sample.questions[0]), id: `rl-${at}` }));
    expect(designSizeProblems(fat).join("\n")).toMatch(/at most/);
    expect(designSizeProblems(fat).join("\n")).toMatch(/kinds of skill/);
  });

  it("fails when ids repeat inside a pool", () => {
    const pool = copy(sample);
    pool.questions[1].id = pool.questions[0].id;
    expect(designPoolProblems(pool, sampleFacts, "sysdes-rate-limiting").join("\n")).toMatch(/repeats inside its pool/);
  });

  it("fails when the right answer is always the same letter or always the longest", () => {
    const rigged = Array.from({ length: 12 }, (_, at) => ({
      ...copy(sample.questions[0]),
      id: `rl-${at}`,
      answer: "a",
      choices: [
        { id: "a", text: "the longest choice by far", why: "x" },
        { id: "b", text: "short", why: "y" },
        { id: "c", text: "tiny", why: "z" },
      ],
    })) as DesignQuestion[];
    const text = answerBalanceProblems(rigged).join("\n");
    expect(text).toMatch(/answer "a" is right 12 times/);
    expect(text).toMatch(/the longest choice/);
  });

  it("fails an estimate answer that disagrees with the recomputed value", () => {
    expect(mentions("About 1,000", "1,000")).toBe(true);
    expect(mentions("About 11,000", "1,000")).toBe(false);
    expect(mentions("2", "2")).toBe(true);
    expect(mentions("12", "2")).toBe(false);
    expect(mentions("98.3", "98")).toBe(false);
  });
});

describe("drawing a practice set", () => {
  it("draws five distinct questions from a design pool of any allowed size", () => {
    for (const [, pool] of present) {
      const drawn = drawCheck(pool.questions, Math.random);
      expect(drawn.length).toBe(Math.min(5, pool.questions.length));
      expect(new Set(drawn.map((question) => question.id)).size).toBe(drawn.length);
    }
  });
});

describe("loading questions for the check island", () => {
  it("serves a System Design pool, a DSA pool, and nothing for an unknown id", async () => {
    expect((await loadCheckQuestions("sysdes-rate-limiting"))?.length).toBe(sample.questions.length);
    expect((await loadCheckQuestions("dsa-binary-search"))?.length).toBeGreaterThan(0);
    expect(await loadCheckQuestions("constructor")).toBeNull();
    expect(await loadCheckQuestions("not-a-chapter")).toBeNull();
  });

  it("lists every pool once, with the placement list still DSA only", () => {
    const ids = checkChapterIds();
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("sysdes-rate-limiting");
    expect(ids).toContain("dsa-binary-search");
    expect(poolChapterIds().some((id) => id.startsWith("sysdes-"))).toBe(false);
  });
});

describe("the import boundary", () => {
  const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g;

  function sourcesUnder(roots: string[]): Record<string, string> {
    const found: Record<string, string> = {};
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.tsx?$/.test(name)) found[path.split("\\").join("/")] = readFileSync(path, "utf8");
      }
    };
    for (const root of roots) walk(root);
    return found;
  }

  function resolved(specifier: string, file: string): string {
    if (specifier.startsWith("@/")) return specifier.slice(2);
    if (specifier.startsWith(".")) return posix.normalize(posix.join(posix.dirname(file), specifier));
    return specifier;
  }

  it("lets only the design registry reach content/system-design/quiz, and only dynamically", () => {
    const sources = sourcesUnder(["app", "components", "lib", "content", "tests"]);
    const importers = Object.entries(sources)
      .filter(([file]) => file !== "lib/designPool.ts" && !file.startsWith("content/system-design/quiz/"))
      .filter(([file]) => file !== "tests/system-design-quiz.test.ts")
      .filter(([file, text]) =>
        [...text.matchAll(SPECIFIER)].some((match) => resolved(match[1], file).startsWith("content/system-design/quiz"))
      )
      .map(([file]) => file);
    expect(importers).toEqual([]);
    const registry = sources["lib/designPool.ts"];
    expect(registry).not.toMatch(/^import\s+(?!type\b)[^;]*content\/system-design\/quiz/m);
    expect(registry.match(/=>\s*import\(/g)?.length).toBe(REGISTERED.length);
  });
});
