import { describe, expect, it } from "vitest";
import type { Question, SingleQuestion } from "@/content/quiz-types";
import type { LevelId } from "@/content/types";
import { MAX_QUESTIONS, answerQuestion, currentQuestion, startPlacement, type PlacementChapter } from "@/lib/placement";
import { minutesText, questionCountText, sizeLine, summarizeBank, thinNote } from "@/lib/placementBank";
import { DRAFT_KEY, draftFitsBank, sanitizeDraft } from "@/lib/placementDraft";

const CURRICULUM: PlacementChapter[] = [
  { id: "b1", level: "beginner", prerequisites: [] },
  { id: "b2", level: "beginner", prerequisites: [] },
  { id: "i1", level: "intermediate", prerequisites: [] },
  { id: "i2", level: "intermediate", prerequisites: [] },
  { id: "a1", level: "advanced", prerequisites: [] },
];

const NAMES: Record<LevelId, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

function question(chapter: string, level: LevelId, at: number, placement = true): SingleQuestion {
  return {
    id: `${chapter}-${at}`,
    chapter,
    level,
    skill: "recognise",
    pattern: "binary-search",
    section: "the-core-idea",
    ...(placement ? { placement: true as const } : {}),
    kind: "single",
    prompt: "<p>Pick one.</p>",
    choices: [
      { id: "a", text: "right", why: "It is right." },
      { id: "b", text: "wrong", why: "It is wrong." },
    ],
    answer: "a",
  };
}

function bank(counts: Record<string, number>): Question[] {
  return CURRICULUM.flatMap((chapter) =>
    Array.from({ length: counts[chapter.id] ?? 0 }, (_, at) => question(chapter.id, chapter.level, at + 1))
  );
}

describe("summarizeBank", () => {
  it("sizes a run from the questions that exist and says it is thin", () => {
    const summary = summarizeBank({ chapters: CURRICULUM, bank: bank({ b1: 2 }) });
    expect(summary).toMatchObject({
      questions: 2,
      chapters: 1,
      start: 2,
      capacity: 2,
      minutes: 1,
      reachable: "beginner",
    });
    expect(summary.thin).toBe(true);
    expect(questionCountText(summary)).toBe("2 questions");
    expect(minutesText(summary)).toBe("about 1 minute");
  });

  it("counts only placement-tagged questions of known chapters", () => {
    const loose = [...bank({ b1: 1 }), question("b2", "beginner", 9, false), question("ghost", "beginner", 1)];
    expect(summarizeBank({ chapters: CURRICULUM, bank: loose })).toMatchObject({ questions: 1, chapters: 1 });
  });

  it("reaches a higher level only when each level on the way has questions", () => {
    expect(summarizeBank({ chapters: CURRICULUM, bank: bank({ b1: 3, a1: 3 }) }).reachable).toBe("beginner");
    expect(summarizeBank({ chapters: CURRICULUM, bank: bank({ b1: 3, i1: 3 }) }).reachable).toBe("intermediate");
    expect(summarizeBank({ chapters: CURRICULUM, bank: bank({ b1: 3, i1: 3, a1: 3 }) }).reachable).toBe("advanced");
  });

  it("never promises more questions than a run can ask and stays within the engine's maximum", () => {
    const full = summarizeBank({ chapters: CURRICULUM, bank: bank({ b1: 6, b2: 6, i1: 6, i2: 6, a1: 6 }) });
    expect(full.capacity).toBe(MAX_QUESTIONS);
    expect(full.thin).toBe(false);
    expect(full.minutes).toBe(10);
    expect(questionCountText(full)).toBe("up to 18 questions");
  });

  it("matches how many questions the engine really asks when a reader answers everything right", () => {
    const questions = bank({ b1: 2, i1: 1 });
    const ctx = { chapters: CURRICULUM, bank: questions };
    let state = startPlacement(ctx);
    let asked = 0;
    for (let guard = 0; guard < 30 && currentQuestion(state, ctx); guard++) {
      state = answerQuestion(state, ctx, "a");
      asked++;
    }
    expect(asked).toBeLessThanOrEqual(summarizeBank(ctx).capacity);
  });

  it("names an empty bank honestly", () => {
    const summary = summarizeBank({ chapters: CURRICULUM, bank: [] });
    expect(summary.capacity).toBe(0);
    expect(questionCountText(summary)).toBe("no questions yet");
  });
});

describe("sizeLine", () => {
  it("states a thin run as today's size and says more chapters add more", () => {
    expect(sizeLine(summarizeBank({ chapters: CURRICULUM, bank: bank({ b1: 2 }) }))).toBe(
      "2 questions today, about 1 minute; more chapters add more."
    );
  });

  it("states a full run as a ceiling", () => {
    const full = summarizeBank({ chapters: CURRICULUM, bank: bank({ b1: 6, b2: 6, i1: 6, i2: 6, a1: 6 }) });
    expect(sizeLine(full)).toBe("Up to 18 questions, about 10 minutes.");
  });
});

describe("thinNote", () => {
  it("says only some chapters have questions and where the placement stops", () => {
    const note = thinNote(summarizeBank({ chapters: CURRICULUM, bank: bank({ b1: 2 }) }), 5, NAMES);
    expect(note).toContain("Only 1 chapter of 5 has placement questions");
    expect(note).toContain("none above Beginner");
    expect(note).toContain("first estimate");
  });

  it("is absent once the bank covers every level fully", () => {
    const full = summarizeBank({ chapters: CURRICULUM, bank: bank({ b1: 6, b2: 6, i1: 6, i2: 6, a1: 6 }) });
    expect(thinNote(full, 5, NAMES)).toBeNull();
  });
});

describe("placement draft", () => {
  const ctx = { chapters: CURRICULUM, bank: bank({ b1: 3 }) };
  const first = startPlacement(ctx);
  const second = answerQuestion(first, ctx, "a");
  const draft = { v: 1, startedAt: 5, state: second, history: [{ state: first, picked: ["a"] }] };

  it("is stored apart from the plan under its own key", () => {
    expect(DRAFT_KEY).toBe("groundwork:dsa:placement-draft");
  });

  it("survives a JSON round trip", () => {
    expect(sanitizeDraft(JSON.parse(JSON.stringify(draft)))).toEqual({
      startedAt: 5,
      state: second,
      history: [{ state: first, picked: ["a"] }],
    });
  });

  it("rejects a stale version, junk and half-written answers", () => {
    expect(sanitizeDraft({ ...draft, v: 2 })).toBeNull();
    expect(sanitizeDraft("junk")).toBeNull();
    expect(sanitizeDraft({ ...draft, startedAt: -1 })).toBeNull();
    expect(sanitizeDraft({ ...draft, state: { ...second, answers: [{ question: "x" }] } })).toBeNull();
    expect(sanitizeDraft({ ...draft, state: { ...second, level: "expert" } })).toBeNull();
  });

  it("only resumes against a bank that still has its questions and a question left to ask", () => {
    const good = sanitizeDraft(draft);
    expect(good && draftFitsBank(good, ctx)).toBe(true);
    expect(good && draftFitsBank(good, { chapters: CURRICULUM, bank: bank({ b2: 3 }) })).toBe(false);
    const done = sanitizeDraft({ ...draft, state: { stage: null, level: "beginner", answers: second.answers } });
    expect(done && draftFitsBank(done, ctx)).toBe(false);
  });
});
