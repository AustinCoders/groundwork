import { describe, expect, it } from "vitest";
import { stageBank, stageHotFor } from "@/lib/mock/bank";
import { planLoop } from "@/lib/mock/loops";
import {
  buildSession,
  currentQuestion,
  reduce,
  scoreOf,
  stagePosition,
  stageResults,
  type Session,
} from "@/lib/mock/session";
import type { LoopConfig, MockItem, StageId } from "@/lib/mock/types";
import { debriefText, pacing } from "@/lib/mock/pacing";

const config: LoopConfig = { role: "fullstack", seniority: "mid", company: "product", intensity: "quick" };
const plan = planLoop(config, stageHotFor());
const banks = Object.fromEntries(plan.map((p) => [p.stage, stageBank(p.stage)])) as Record<StageId, MockItem[]>;

function start(seed = 1): Session {
  return buildSession({ id: "t", mode: "loop", config, plan, banks, seed, now: 1_000 });
}

function playThrough(s: Session, mark: 0 | 0.5 | 1): Session {
  let t = 2_000;
  let guard = 0;
  while (s.finishedAt === null && guard++ < 500) {
    const q = currentQuestion(s)!;
    if (s.step === "brief") s = reduce(s, { type: "enter", at: (t += 10) });
    else if (s.step === "answer" && q.item.kind === "coding") {
      s = reduce(s, { type: "coding", outcome: { passed: mark * 8, total: 8, hintsUsed: 0, sawSolution: false } });
      s = reduce(s, { type: "coding-submit", at: (t += 10), timedOut: false });
    } else if (s.step === "answer") s = reduce(s, { type: "answered", at: (t += 10), timedOut: false });
    else if (s.step === "followup") s = reduce(s, { type: "followup-answered" });
    else if (s.step === "review") {
      if (q.item.kind === "talk") {
        for (const c of ["testing", "substance", "trap", "followup", "delivery"] as const) {
          s = reduce(s, { type: "mark", criterion: c, mark });
        }
      }
      s = reduce(s, { type: "next", at: (t += 10) });
    }
  }
  return s;
}

describe("building a session", () => {
  it("asks every planned stage, in order, starting on a brief", () => {
    const s = start();
    expect(s.step).toBe("brief");
    expect(s.cursor).toBe(0);
    const stagesAsked = [...new Set(s.questions.map((q) => q.stage))];
    expect(stagesAsked).toEqual(s.plan.map((p) => p.stage));
  });

  it("never asks the same question twice", () => {
    const ids = start(42).questions.map((q) => q.item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("chooses a follow-up only for questions that have one", () => {
    for (const q of start(3).questions) {
      if (q.item.kind === "talk" && q.item.followUps.length) expect(q.item.followUps).toContain(q.followUp);
      else expect(q.followUp).toBeNull();
    }
  });

  it("builds a retry round from exactly the questions it is given", () => {
    const fixed = [stageBank("javascript")[0], stageBank("react")[0]];
    const s = buildSession({ id: "r", mode: "retry", config, plan, banks, seed: 1, now: 0, fixed });
    expect(s.questions.map((q) => q.item.id)).toEqual(fixed.map((i) => i.id));
    expect(s.plan.map((p) => p.stage)).toEqual(["javascript", "react"]);
  });
});

describe("walking through a question", () => {
  it("goes brief → answer → follow-up → review for a talk question with a follow-up", () => {
    const fixed = [stageBank("javascript").find((i) => i.kind === "talk" && i.followUps.length)!];
    let s = buildSession({ id: "f", mode: "drill", config, plan, banks, seed: 1, now: 0, fixed });
    expect(s.step).toBe("brief");
    s = reduce(s, { type: "enter", at: 10 });
    expect(s.step).toBe("answer");
    expect(s.questions[0].startedAt).toBe(10);
    s = reduce(s, { type: "notes", text: "event loop" });
    s = reduce(s, { type: "answered", at: 70, timedOut: false });
    expect(s.step).toBe("followup");
    s = reduce(s, { type: "followup-answered" });
    expect(s.step).toBe("review");
    expect(s.questions[0].notes).toBe("event loop");
    expect(s.questions[0].answeredAt).toBe(70);
  });

  it("ignores actions that do not belong to the current step", () => {
    let s = start();
    const before = s;
    s = reduce(s, { type: "mark", criterion: "substance", mark: 1 });
    s = reduce(s, { type: "next", at: 5 });
    s = reduce(s, { type: "skip", at: 5 });
    expect(s).toBe(before);
  });

  it("opens a new stage with its brief and continues a stage without one", () => {
    let s = start();
    s = reduce(s, { type: "enter", at: 1 });
    const firstStage = s.questions[0].stage;
    s = reduce(s, { type: "skip", at: 2 });
    const next = s.questions[s.cursor];
    expect(s.step).toBe(next.stage === firstStage ? "answer" : "brief");
  });

  it("records a skip as a zero", () => {
    let s = start();
    s = reduce(s, { type: "enter", at: 1 });
    s = reduce(s, { type: "skip", at: 2 });
    expect(s.questions[0]).toMatchObject({ skipped: true, score: 0 });
  });
});

describe("finishing", () => {
  it("scores a perfect loop at 1 in every stage", () => {
    const s = playThrough(start(), 1);
    expect(s.finishedAt).not.toBeNull();
    for (const r of stageResults(s)) {
      expect(r.scores.length, r.stage).toBeGreaterThan(0);
      for (const score of r.scores) expect(score, r.stage).toBe(1);
    }
  });

  it("scores an unmarked loop at 0", () => {
    const s = playThrough(start(), 0);
    for (const q of s.questions) expect(q.score).toBe(0);
  });

  it("scores a half-marked talk question at a half", () => {
    const s = playThrough(start(), 0.5);
    const talk = s.questions.find((q) => q.item.kind === "talk")!;
    expect(talk.score).toBeCloseTo(0.5);
    expect(scoreOf(talk)).toBeCloseTo(0.5);
  });

  it("reports where the cursor is inside its stage", () => {
    let s = start();
    s = reduce(s, { type: "enter", at: 1 });
    expect(stagePosition(s)).toMatchObject({ stageIndex: 0, inStage: 1 });
    expect(stagePosition(s).ofStage).toBe(s.plan[0].questions);
  });

  it("survives a round trip through JSON, which is how a refresh resumes it", () => {
    let s = start();
    s = reduce(s, { type: "enter", at: 1 });
    s = reduce(s, { type: "notes", text: "half an answer" });
    const revived = JSON.parse(JSON.stringify(s)) as Session;
    expect(revived).toEqual(s);
    expect(reduce(revived, { type: "notes", text: "more" }).questions[0].notes).toBe("more");
  });
});

describe("resuming", () => {
  it("restarts the current question's clock rather than marking it late", () => {
    let s = start();
    s = reduce(s, { type: "enter", at: 10 });
    s = reduce(s, { type: "resume", at: 99_999 });
    expect(s.questions[0].startedAt).toBe(99_999);
  });

  it("does nothing on a brief, where no clock is running", () => {
    const s = start();
    expect(reduce(s, { type: "resume", at: 5 })).toBe(s);
  });
});

describe("pacing and the text debrief", () => {
  function answeredIn(seconds: number): Session {
    const fixed = stageBank("behaviour").slice(0, 3);
    let s = buildSession({ id: "p", mode: "drill", config, plan, banks, seed: 1, now: 0, fixed });
    let t = 1_000;
    for (let i = 0; i < 3; i++) {
      if (s.step === "brief") s = reduce(s, { type: "enter", at: t });
      const opened = s.questions[s.cursor].startedAt ?? t;
      s = reduce(s, { type: "answered", at: opened + seconds * 1000, timedOut: false });
      if (s.step === "followup") s = reduce(s, { type: "followup-answered" });
      for (const c of ["testing", "substance", "trap", "followup", "delivery"] as const) {
        s = reduce(s, { type: "mark", criterion: c, mark: 0 });
      }
      t = opened + seconds * 1000 + 10;
      s = reduce(s, { type: "next", at: t });
    }
    return s;
  }

  it("flags answers that were too quick to be real", () => {
    const p = pacing(answeredIn(15));
    expect(p.timed).toBe(3);
    expect(p.medianSeconds).toBe(15);
    expect(p.rushed).toBe(3);
    expect(p.notes.join(" ")).toMatch(/under 45 seconds/);
  });

  it("leaves a paced answer alone", () => {
    const p = pacing(answeredIn(150));
    expect(p.rushed).toBe(0);
    expect(p.notes.join(" ")).not.toMatch(/under 45 seconds/);
  });

  it("writes a debrief that names the verdict, every round and what to work on", () => {
    const text = debriefText(answeredIn(90), (id) => id);
    expect(text).toMatch(/^Groundwork mock interview/);
    expect(text).toMatch(/Verdict: No hire/);
    expect(text).toMatch(/behaviour/);
    expect(text).toMatch(/Work on these/);
    expect(text).not.toMatch(/<[a-z]/);
  });
});
