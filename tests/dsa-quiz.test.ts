import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { posix } from "node:path";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { ChapterPool, PatternRecord, Question, SingleQuestion } from "@/content/quiz-types";
import { chapters } from "@/lib/content";
import { withHeadingIds } from "@/lib/headingToc";
import { tracer, type BinarySearchInput } from "@/lib/play/binarySearch";
import type { Frame } from "@/lib/play/types";
import {
  answerProblems,
  chapterProblems,
  companyProblems,
  duplicateIdProblems,
  htmlProblems,
  idProblems,
  patternAgreementProblems,
  patternRecordProblems,
  PATTERNS,
  placementProblems,
  poolProblems,
  poolSizeProblems,
  sectionProblems,
  shapeProblems,
  STYLES,
  vocabularyProblems,
  wordingProblems,
  type ChapterFacts,
} from "@/lib/quiz";
import { loadPool, poolChapterIds } from "@/lib/quizPool";

const QUIZ_DIR = join(process.cwd(), "content", "dsa", "quiz");
const REGISTERED = poolChapterIds();

const pools: Record<string, ChapterPool> = {};
for (const id of REGISTERED) pools[id] = (await loadPool(id))!;

function factsOf(chapterId: string): ChapterFacts | null {
  const found = chapters("dsa").find((chapter) => chapter.id === chapterId);
  if (!found) return null;
  return { id: found.id, levels: found.levels, sections: withHeadingIds(found.body).toc.map((item) => item.id) };
}

const binarySearch = pools["dsa-binary-search"];
const facts = factsOf("dsa-binary-search")!;

const copy = <T>(value: T): T => structuredClone(value);

function singleOf(pool: ChapterPool): SingleQuestion {
  return copy(pool.questions.find((question): question is SingleQuestion => question.kind === "single")!);
}

function loose<T>(value: unknown): T {
  return value as T;
}

type TraceCheck = { input: BinarySearchInput; expected: (frames: Frame[]) => string };

const TRACE_CHECKS: Record<string, TraceCheck> = {
  "bs-trace-the-mids": {
    input: { array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target: 38 },
    expected: (frames) =>
      frames
        .filter((frame) => frame.line === "mid")
        .map((frame) => frame.vars.find(([name]) => name === "mid")![1])
        .join(", "),
  },
};

function traceProblems(question: Question, check: TraceCheck): string[] {
  if (question.kind !== "single") return [`${question.id}: a checked trace question is a single choice`];
  const problems: string[] = [];
  const { array, target } = check.input;
  if (!question.prompt.includes(`[${array.join(", ")}]`)) problems.push(`${question.id}: prompt omits the array`);
  if (!question.prompt.includes(`<code>${target}</code>`)) problems.push(`${question.id}: prompt omits the target`);
  const expected = check.expected(tracer.run(check.input));
  const matching = question.choices.filter((choice) => choice.text === expected).map((choice) => choice.id);
  if (matching.join() !== question.answer) {
    problems.push(`${question.id}: the tracer records "${expected}", but the answer is "${question.answer}"`);
  }
  return problems;
}

const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g;

function resolvedSpecifier(specifier: string, file: string): string {
  if (specifier.startsWith("@/")) return specifier.slice(2);
  if (specifier.startsWith(".")) return posix.normalize(posix.join(posix.dirname(file), specifier));
  return specifier;
}

function quizImporters(sources: Record<string, string>): string[] {
  return Object.entries(sources)
    .filter(([file]) => file !== "lib/quizPool.ts" && !file.startsWith("content/dsa/quiz/"))
    .filter(([file, text]) =>
      [...text.matchAll(SPECIFIER)].some((match) => {
        const target = resolvedSpecifier(match[1], file);
        return target === "content/dsa/quiz" || target.startsWith("content/dsa/quiz/");
      })
    )
    .map(([file]) => file);
}

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

describe("the pattern vocabulary", () => {
  it("has unique kebab-case ids with a label each", () => {
    const ids = PATTERNS.map((pattern) => pattern.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const pattern of PATTERNS) {
      expect(pattern.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(pattern.label.trim()).not.toBe("");
    }
  });

  it("labels the three interview styles", () => {
    expect(STYLES.map((style) => style.label)).toEqual(["Online assessment", "Phone screen", "Onsite round"]);
  });
});

describe("every question pool", () => {
  it("finds at least the binary-search pool", () => {
    expect(REGISTERED).toContain("dsa-binary-search");
  });

  for (const id of REGISTERED) {
    it(`${id} reports no problem`, () => {
      expect(poolProblems(pools[id], factsOf(id), id)).toEqual([]);
    });
  }

  it("keeps ids unique across every pool", () => {
    expect(duplicateIdProblems(pools)).toEqual([]);
  });

  it("has a pool file for exactly the chapters the registry lists", () => {
    const files = readdirSync(QUIZ_DIR)
      .filter((name) => !name.startsWith("."))
      .sort();
    expect(files).toEqual(REGISTERED.map((id) => `${id}.ts`).sort());
  });

  it("keeps the model file to types and the helper file free of content values", () => {
    const types = readFileSync(join(process.cwd(), "content", "quiz-types.ts"), "utf8");
    expect(types).not.toMatch(/\bexport\s+(?:const|let|var|function|class|enum)\b/);
    expect(types.match(/^import\s.*$/gm)!.every((line) => line.startsWith("import type"))).toBe(true);
    const helpers = readFileSync(join(process.cwd(), "lib", "quiz.ts"), "utf8");
    expect(helpers).not.toMatch(/["']use client["']/);
    const contentImports = helpers.match(/^import\s.*from\s+"@\/content\/.*$/gm) ?? [];
    expect(contentImports.every((line) => line.startsWith("import type"))).toBe(true);
  });
});

describe("the binary-search pool", () => {
  const { questions } = binarySearch;

  it("meets the counts a check and the placement rely on", () => {
    expect(questions.length).toBeGreaterThanOrEqual(10);
    expect(questions.filter((q) => q.placement).length).toBeGreaterThanOrEqual(2);
    expect(questions.filter((q) => q.skill === "complexity").length).toBeGreaterThanOrEqual(2);
    expect(questions.filter((q) => q.skill !== "complexity").length).toBeGreaterThanOrEqual(5);
    expect(questions.some((q) => q.kind === "multi")).toBe(true);
    expect(questions.some((q) => q.kind === "order")).toBe(true);
    expect(poolSizeProblems(questions)).toEqual([]);
  });

  it("is written for the beginner level and the binary-search pattern", () => {
    for (const question of questions) {
      expect(question.level).toBe("beginner");
      expect(question.pattern).toBe("binary-search");
    }
  });

  it("carries a pattern record that covers all three interview styles", () => {
    expect(binarySearch.pattern.styles).toEqual(["online-assessment", "phone-screen", "onsite"]);
  });

  it("keeps its two placement questions at the recognise skill", () => {
    const placed = questions.filter((question) => question.placement);
    expect(placed.length).toBe(2);
    expect(placed.every((question) => question.skill === "recognise")).toBe(true);
  });

  it("does not favour one letter or the longest choice for the right answer", () => {
    const singles = questions.filter((question): question is SingleQuestion => question.kind === "single");
    const perLetter = new Map<string, number>();
    let longest = 0;
    for (const question of singles) {
      perLetter.set(question.answer, (perLetter.get(question.answer) ?? 0) + 1);
      const right = question.choices.find((choice) => choice.id === question.answer)!;
      if (question.choices.every((choice) => choice.text.length <= right.text.length)) longest += 1;
    }
    expect(Math.max(...perLetter.values())).toBeLessThanOrEqual(3);
    expect(longest).toBeLessThan(singles.length / 2);
  });

  describe("the authored trace questions", () => {
    const traces = questions.filter((question) => question.id in TRACE_CHECKS);

    it("includes at least one", () => {
      expect(traces.length).toBeGreaterThanOrEqual(1);
      expect(questions.some((question) => question.skill === "trace")).toBe(true);
    });

    for (const question of traces) {
      it(`${question.id} answers what the tracer records`, () => {
        expect(traceProblems(question, TRACE_CHECKS[question.id])).toEqual([]);
      });
    }

    it("fails when the authored answer disagrees with the tracer", () => {
      const wrong = copy(traces[0]) as SingleQuestion;
      wrong.answer = wrong.choices.find((choice) => choice.id !== wrong.answer)!.id;
      expect(traceProblems(wrong, TRACE_CHECKS[wrong.id])).not.toEqual([]);
    });

    it("fails when the prompt states another target", () => {
      const moved = copy(traces[0]) as SingleQuestion;
      moved.prompt = moved.prompt.replace("<code>38</code>", "<code>39</code>");
      expect(traceProblems(moved, TRACE_CHECKS[moved.id])).not.toEqual([]);
    });
  });
});

describe("the integrity helpers fail on a bad pool", () => {
  it("accepts the real pool", () => {
    expect(poolProblems(binarySearch, facts, "dsa-binary-search")).toEqual([]);
  });

  it("fails when a single answer is not a choice", () => {
    const question = singleOf(binarySearch);
    question.answer = "z";
    expect(answerProblems(question)).not.toEqual([]);
  });

  it("fails when a multi answer is not a choice, is alone, or is every choice", () => {
    const multi = copy(binarySearch.questions.find((question) => question.kind === "multi")!);
    if (multi.kind !== "multi") throw new Error("expected a multi question");
    expect(answerProblems(multi)).toEqual([]);
    expect(answerProblems({ ...multi, answers: ["b", "z"] })).not.toEqual([]);
    expect(answerProblems({ ...multi, answers: ["b"] })).not.toEqual([]);
    expect(answerProblems({ ...multi, answers: multi.choices.map((choice) => choice.id) })).not.toEqual([]);
  });

  it("fails when an explanation is empty or the choices are the wrong number", () => {
    const silent = singleOf(binarySearch);
    silent.choices[0].why = "  ";
    expect(shapeProblems(silent)).not.toEqual([]);

    const short = singleOf(binarySearch);
    short.choices = short.choices.slice(0, 2);
    expect(shapeProblems(short)).not.toEqual([]);

    const repeated = singleOf(binarySearch);
    repeated.choices[1].id = repeated.choices[0].id;
    expect(shapeProblems(repeated)).not.toEqual([]);
  });

  it("fails when an order question has no explanation or too few items", () => {
    const order = copy(binarySearch.questions.find((question) => question.kind === "order")!);
    if (order.kind !== "order") throw new Error("expected an order question");
    expect(shapeProblems({ ...order, why: "" })).not.toEqual([]);
    expect(shapeProblems({ ...order, items: order.items.slice(0, 2) })).not.toEqual([]);
  });

  it("fails when two pools share a question id", () => {
    expect(duplicateIdProblems({ first: binarySearch, second: binarySearch })).not.toEqual([]);
  });

  it("fails when ids are not kebab-case or share no prefix", () => {
    const shouting = singleOf(binarySearch);
    shouting.id = "bs-Not_Kebab";
    expect(idProblems([shouting])).not.toEqual([]);

    const first = singleOf(binarySearch);
    const second = singleOf(binarySearch);
    second.id = "other-thing";
    expect(idProblems([first, second])).not.toEqual([]);
  });

  it("fails when the chapter is unknown or differs from the pool's", () => {
    expect(chapterProblems(binarySearch, null, "dsa-nope")).not.toEqual([]);
    const strayed = copy(binarySearch);
    strayed.questions[0].chapter = "dsa-two-pointers";
    expect(chapterProblems(strayed, facts, "dsa-binary-search")).not.toEqual([]);
    const advanced = copy(binarySearch);
    advanced.questions[0].level = "advanced";
    expect(chapterProblems(advanced, facts, "dsa-binary-search")).not.toEqual([]);
  });

  it("fails when the section is not a heading of the chapter", () => {
    const question = singleOf(binarySearch);
    expect(sectionProblems(question, facts.sections)).toEqual([]);
    question.section = "no-such-heading";
    expect(sectionProblems(question, facts.sections)).not.toEqual([]);
  });

  it("fails when the pattern or skill is outside the vocabulary", () => {
    const pattern = singleOf(binarySearch);
    pattern.pattern = loose("two-pointer-ish");
    expect(vocabularyProblems(pattern)).not.toEqual([]);
    const skill = singleOf(binarySearch);
    skill.skill = loose("guess");
    expect(vocabularyProblems(skill)).not.toEqual([]);
  });

  it("fails when the HTML is unbalanced", () => {
    const unclosed = singleOf(binarySearch);
    unclosed.prompt = "<p>Use <code>lo + hi</p>";
    expect(htmlProblems(unclosed)).not.toEqual([]);

    const stray = singleOf(binarySearch);
    stray.choices[0].why = "Only</code> this";
    expect(htmlProblems(stray)).not.toEqual([]);

    const raw = singleOf(binarySearch);
    raw.choices[1].text = "<code>lo <= hi</code>";
    expect(htmlProblems(raw)).not.toEqual([]);

    const unclosedPre = singleOf(binarySearch);
    unclosedPre.prompt = "<pre><code>x</code>";
    expect(htmlProblems(unclosedPre)).not.toEqual([]);
  });

  it("fails when the pool is thin", () => {
    const { questions } = binarySearch;
    expect(poolSizeProblems(questions.slice(0, 7))).not.toEqual([]);

    const noPlacement = copy(questions).map((question) => ({ ...question, placement: undefined }));
    expect(poolSizeProblems(noPlacement as Question[])).not.toEqual([]);

    const oneComplexity = copy(questions).map((question) =>
      question.skill === "complexity" && question.id !== "bs-million-comparisons"
        ? ({ ...question, skill: "recognise" } as Question)
        : question
    );
    expect(poolSizeProblems(oneComplexity)).not.toEqual([]);

    const allComplexity = copy(questions).map((question) => ({ ...question, skill: "complexity" }) as Question);
    expect(poolSizeProblems(allComplexity)).not.toEqual([]);

    const noTrace = copy(questions).map((question) =>
      question.skill === "trace" ? ({ ...question, skill: "recognise" } as Question) : question
    );
    expect(poolSizeProblems(noTrace)).not.toEqual([]);
  });

  it("fails when a question's pattern differs from the pool's record", () => {
    expect(patternAgreementProblems(binarySearch)).toEqual([]);
    const strayed = copy(binarySearch);
    strayed.questions[0].pattern = "two-pointers";
    expect(patternAgreementProblems(strayed)).not.toEqual([]);
    expect(poolProblems(strayed, facts, "dsa-binary-search")).not.toEqual([]);
  });

  it("fails when a placement question is not at the recognise skill", () => {
    const placed = singleOf(binarySearch);
    placed.placement = true;
    placed.skill = "recognise";
    expect(placementProblems(placed)).toEqual([]);
    placed.skill = "complexity";
    expect(placementProblems(placed)).not.toEqual([]);
    const pool = copy(binarySearch);
    pool.questions.find((question) => question.skill === "complexity")!.placement = true;
    expect(poolProblems(pool, facts, "dsa-binary-search")).not.toEqual([]);
  });

  it("fails when the copy says verified, in any case, anywhere in the pool", () => {
    expect(wordingProblems(binarySearch)).toEqual([]);
    expect(wordingProblems("Answers are checked")).toEqual([]);
    const prompt = copy(binarySearch);
    prompt.questions[0].prompt = "<p>Is it Verified?</p>";
    expect(poolProblems(prompt, facts, "dsa-binary-search")).not.toEqual([]);
    const why = copy(binarySearch);
    if (why.questions[0].kind !== "single") throw new Error("expected a single question");
    why.questions[0].choices[0].why = "It is verified by hand.";
    expect(wordingProblems(why)).not.toEqual([]);
    const template = copy(binarySearch);
    template.pattern.template = "<pre><code>verified</code></pre>";
    expect(poolProblems(template, facts, "dsa-binary-search")).not.toEqual([]);
  });

  it("reports an unknown kind or a missing list instead of throwing", () => {
    const unknown = loose<Question>({ ...singleOf(binarySearch), kind: "essay" });
    expect(shapeProblems(unknown)).not.toEqual([]);
    expect(() => [answerProblems(unknown), htmlProblems(unknown), vocabularyProblems(unknown)]).not.toThrow();

    const noChoices = singleOf(binarySearch);
    delete loose<Record<string, unknown>>(noChoices).choices;
    expect(shapeProblems(noChoices)).not.toEqual([]);
    expect(() => [answerProblems(noChoices), htmlProblems(noChoices)]).not.toThrow();

    const noItems = copy(binarySearch.questions.find((question) => question.kind === "order")!);
    delete loose<Record<string, unknown>>(noItems).items;
    expect(shapeProblems(noItems)).not.toEqual([]);
    expect(() => [answerProblems(noItems), htmlProblems(noItems)]).not.toThrow();

    const noAnswers = copy(binarySearch.questions.find((question) => question.kind === "multi")!);
    delete loose<Record<string, unknown>>(noAnswers).answers;
    expect(shapeProblems(noAnswers)).not.toEqual([]);

    const broken = copy(binarySearch);
    broken.questions.push(unknown, noChoices, noItems, noAnswers);
    expect(() => poolProblems(broken, facts, "dsa-binary-search")).not.toThrow();
    expect(poolProblems(broken, facts, "dsa-binary-search")).not.toEqual([]);
  });

  describe("on a predict question", () => {
    const predict = (change: Record<string, unknown>) =>
      loose<Question>({ ...singleOf(binarySearch), kind: "predict", tracer: "binary-search", step: 0, ...change });

    it("accepts a well-formed one", () => {
      expect(shapeProblems(predict({}))).toEqual([]);
      expect(answerProblems(predict({}))).toEqual([]);
    });

    it("fails with no tracer or a negative step", () => {
      expect(shapeProblems(predict({ tracer: "", step: -1 }))).not.toEqual([]);
      expect(shapeProblems(predict({ tracer: "" }))).not.toEqual([]);
      expect(shapeProblems(predict({ step: -1 }))).not.toEqual([]);
      expect(shapeProblems(predict({ step: 1.5 }))).not.toEqual([]);
    });
  });

  describe("on a pattern record", () => {
    const record = (change: Partial<PatternRecord>): PatternRecord => ({ ...copy(binarySearch.pattern), ...change });
    const check = (change: Partial<PatternRecord>) => patternRecordProblems(record(change), "dsa-binary-search");

    it("accepts the real one", () => {
      expect(check({})).toEqual([]);
    });

    it("fails with no style, an unknown style or a repeated one", () => {
      expect(check({ styles: [] })).not.toEqual([]);
      expect(check({ styles: loose(["take-home"]) })).not.toEqual([]);
      expect(check({ styles: ["onsite", "onsite"] })).not.toEqual([]);
    });

    it("fails with one signal, six signals or an empty one", () => {
      expect(check({ signals: ["only one"] })).not.toEqual([]);
      expect(check({ signals: ["a", "b", "c", "d", "e", "f"] })).not.toEqual([]);
      expect(check({ signals: ["fine", " "] })).not.toEqual([]);
    });

    it("fails with an unknown pattern, another chapter, or no template, time or space", () => {
      expect(check({ pattern: loose("magic") })).not.toEqual([]);
      expect(check({ chapter: "dsa-two-pointers" })).not.toEqual([]);
      expect(check({ template: "" })).not.toEqual([]);
      expect(check({ template: "<pre><code>x" })).not.toEqual([]);
      expect(check({ time: "" })).not.toEqual([]);
      expect(check({ space: "" })).not.toEqual([]);
    });

    it("fails when a company is named", () => {
      expect(check({ signals: ["Asked at Google", "Sorted input"] })).not.toEqual([]);
      expect(companyProblems("What Amazon asks")).not.toEqual([]);
      expect(companyProblems({ prompt: "line one\nGoogle asks" })).not.toEqual([]);
      expect(companyProblems([{ why: ["Uber"] }])).not.toEqual([]);
      expect(companyProblems(undefined)).toEqual([]);
      expect(companyProblems(null)).toEqual([]);
      expect(companyProblems("A metadata field")).toEqual([]);
    });
  });
});

describe("loadPool", () => {
  it("returns the binary-search pool and only its questions", async () => {
    const loaded = await loadPool("dsa-binary-search");
    expect(loaded).not.toBeNull();
    expect(loaded!.questions.length).toBeGreaterThanOrEqual(10);
    expect(loaded!.questions.every((question) => question.chapter === "dsa-binary-search")).toBe(true);
    expect(loaded!.pattern.chapter).toBe("dsa-binary-search");
  });

  it("gives null for an unknown id, including names every object has", async () => {
    for (const id of ["dsa-nope", "constructor", "__proto__", "toString", ""]) {
      expect(await loadPool(id)).toBeNull();
    }
  });
});

describe("the import boundary", () => {
  it("lets only the registry reach content/dsa/quiz, and only dynamically", () => {
    const sources = sourcesUnder(["app", "components", "lib", "content"]);
    expect(Object.keys(sources).length).toBeGreaterThan(100);
    expect(quizImporters(sources)).toEqual([]);

    const registry = readFileSync(join(process.cwd(), "lib", "quizPool.ts"), "utf8");
    const dynamic = registry.match(/import\(\s*"@\/content\/dsa\/quiz\/[a-z0-9-]+"\s*\)/g) ?? [];
    expect(dynamic.length).toBe(REGISTERED.length);
    expect(registry.match(/dsa\/quiz/g)?.length).toBe(REGISTERED.length);
    expect(registry).not.toMatch(/^import\s[^;]*dsa\/quiz/m);
    expect(existsSync(join(QUIZ_DIR, "dsa-binary-search.ts"))).toBe(true);
  });

  it("fails when a component, a lib file or a content file imports a pool", () => {
    const sources = {
      "lib/quizPool.ts": 'import("@/content/dsa/quiz/dsa-binary-search")',
      "components/check/CheckIsland.tsx": 'import { pool } from "@/content/dsa/quiz/dsa-binary-search";',
      "lib/other.ts": 'export { pool } from "../content/dsa/quiz/dsa-binary-search";',
      "content/dsa/dsa-trees.ts": 'const later = () => import(\n  "./quiz/dsa-binary-search"\n);',
      "content/dsa/quiz/dsa-binary-search.ts": 'import type { ChapterPool } from "../../quiz-types";',
      "content/architecture/arch-rendering.ts": "<p>Pools live in content/dsa/quiz and load with import().</p>",
      "lib/fine.ts": 'import { chapters } from "@/lib/content";',
    };
    expect(quizImporters(sources).sort()).toEqual([
      "components/check/CheckIsland.tsx",
      "content/dsa/dsa-trees.ts",
      "lib/other.ts",
    ]);
  });
});
