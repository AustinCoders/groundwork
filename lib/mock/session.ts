import { pickItems, seededRandom, STAGE_RULES } from "@/lib/mock/loops";
import {
  codingScore,
  rubricFor,
  talkScore,
  type CodingOutcome,
  type CriterionId,
  type Mark,
  type StageResult,
} from "@/lib/mock/scoring";
import type { LoopConfig, MockItem, PlannedStage, StageId } from "@/lib/mock/types";
import { pickAlternates, shiftFor, type Alternates, type Shift } from "@/lib/mock/adaptive";
import type { Board } from "@/lib/mock/board";

export type SessionMode = "loop" | "drill" | "retry";

export type Step = "brief" | "answer" | "followup" | "review";

export interface SessionQuestion {
  item: MockItem;
  stage: StageId;
  followUp: string | null;
  notes: string;
  followUpNotes: string;
  startedAt: number | null;
  answeredAt: number | null;
  timedOut: boolean;
  marks: Partial<Record<CriterionId, Mark>>;
  coding: CodingOutcome | null;
  score: number | null;
  skipped: boolean;
  alternates?: Alternates;
  adapted?: Shift | null;
  board?: Board;
}

export interface Session {
  version: 1;
  id: string;
  mode: SessionMode;
  config: LoopConfig;
  plan: PlannedStage[];
  questions: SessionQuestion[];
  cursor: number;
  step: Step;
  startedAt: number;
  finishedAt: number | null;
}

export function newQuestion(item: MockItem, followUp: string | null): SessionQuestion {
  return {
    item,
    stage: item.stage,
    followUp,
    notes: "",
    followUpNotes: "",
    startedAt: null,
    answeredAt: null,
    timedOut: false,
    marks: {},
    coding: null,
    score: null,
    skipped: false,
  };
}

export function buildSession(opts: {
  id: string;
  mode: SessionMode;
  config: LoopConfig;
  plan: PlannedStage[];
  banks: Partial<Record<StageId, MockItem[]>>;
  seed: number;
  now: number;
  fixed?: MockItem[];
}): Session {
  const random = seededRandom(opts.seed);
  const asked = new Set<string>();
  const questions: SessionQuestion[] = [];
  const plan: PlannedStage[] = [];

  const withFollowUp = (item: MockItem) =>
    newQuestion(
      item,
      item.kind === "talk" && item.followUps.length
        ? item.followUps[Math.floor(random() * item.followUps.length)]
        : null
    );

  if (opts.fixed) {
    for (const item of opts.fixed) questions.push(withFollowUp(item));
    const stages: StageId[] = [];
    for (const q of questions) if (!stages.includes(q.stage)) stages.push(q.stage);
    for (const s of stages) {
      const n = questions.filter((q) => q.stage === s).length;
      const p = opts.plan.find((x) => x.stage === s);
      plan.push({
        stage: s,
        questions: n,
        minutes: p?.minutes ?? n * 4,
        core: p?.core ?? false,
        reason: p?.reason ?? "",
      });
    }
  } else {
    const reserved = new Set<string>();
    for (const p of opts.plan) {
      const pool = opts.banks[p.stage] || [];
      const picked = pickItems(pool, opts.config, p.questions, random, asked);
      if (!picked.length) continue;
      picked.forEach((item) => asked.add(item.id));
      plan.push({ ...p, questions: picked.length });
      picked.forEach((item, i) => {
        const q = withFollowUp(item);
        if (i > 0 && opts.mode !== "retry") {
          const taken = new Set([...asked, ...reserved]);
          q.alternates = pickAlternates(pool, item, opts.config, random, taken);
          for (const alt of [q.alternates.harder, q.alternates.easier]) if (alt) reserved.add(alt.id);
        }
        questions.push(q);
      });
    }
  }

  return {
    version: 1,
    id: opts.id,
    mode: opts.mode,
    config: opts.config,
    plan,
    questions,
    cursor: 0,
    step: "brief",
    startedAt: opts.now,
    finishedAt: questions.length ? null : opts.now,
  };
}

export type Action =
  | { type: "enter"; at: number }
  | { type: "resume"; at: number }
  | { type: "notes"; text: string }
  | { type: "board"; board: Board }
  | { type: "answered"; at: number; timedOut: boolean }
  | { type: "followup-notes"; text: string }
  | { type: "followup-answered" }
  | { type: "mark"; criterion: CriterionId; mark: Mark }
  | { type: "coding"; outcome: CodingOutcome }
  | { type: "coding-submit"; at: number; timedOut: boolean }
  | { type: "next"; at: number }
  | { type: "skip"; at: number };

export function currentQuestion(s: Session): SessionQuestion | null {
  return s.finishedAt === null ? (s.questions[s.cursor] ?? null) : null;
}

export function scoreOf(q: SessionQuestion): number {
  if (q.skipped) return 0;
  if (q.item.kind === "coding") return q.coding ? codingScore(q.coding) : 0;
  return talkScore(rubricFor(q.item, Boolean(q.followUp)), q.marks);
}

function patch(s: Session, change: Partial<SessionQuestion>): Session {
  const questions = s.questions.slice();
  questions[s.cursor] = { ...questions[s.cursor], ...change };
  return { ...s, questions };
}

function adapt(s: Session, nextIndex: number): SessionQuestion {
  const upcoming = s.questions[nextIndex];
  const shift = shiftFor(s.questions[s.cursor].score);
  const alt = shift ? upcoming.alternates?.[shift] : undefined;
  const used = new Set(s.questions.map((q) => q.item.id));
  if (!shift || !alt || used.has(alt.id)) return upcoming;
  const followUp =
    alt.kind === "talk" && alt.followUps.length
      ? alt.followUps[(s.startedAt + nextIndex) % alt.followUps.length]
      : null;
  return { ...newQuestion(alt, followUp), alternates: upcoming.alternates, adapted: shift };
}

function advance(s: Session, at: number): Session {
  const nextIndex = s.cursor + 1;
  if (nextIndex >= s.questions.length) return { ...s, finishedAt: at };
  const newStage = s.questions[nextIndex].stage !== s.questions[s.cursor].stage;
  const questions = s.questions.slice();
  if (!newStage) questions[nextIndex] = { ...adapt(s, nextIndex), startedAt: at };
  return { ...s, questions, cursor: nextIndex, step: newStage ? "brief" : "answer" };
}

export function reduce(s: Session, a: Action): Session {
  const q = currentQuestion(s);
  if (!q) return s;

  switch (a.type) {
    case "enter":
      if (s.step !== "brief") return s;
      return { ...patch(s, { startedAt: a.at }), step: "answer" };

    case "resume":
      return s.step === "answer" || s.step === "followup" ? patch(s, { startedAt: a.at }) : s;

    case "notes":
      return s.step === "answer" ? patch(s, { notes: a.text }) : s;

    case "board":
      return s.step === "answer" || s.step === "followup" ? patch(s, { board: a.board }) : s;

    case "answered": {
      if (s.step !== "answer" || q.item.kind !== "talk") return s;
      const answered = patch(s, { answeredAt: a.at, timedOut: a.timedOut });
      return { ...answered, step: q.followUp ? "followup" : "review" };
    }

    case "followup-notes":
      return s.step === "followup" ? patch(s, { followUpNotes: a.text }) : s;

    case "followup-answered":
      return s.step === "followup" ? { ...s, step: "review" } : s;

    case "mark":
      if (s.step !== "review" || q.item.kind !== "talk") return s;
      return patch(s, { marks: { ...q.marks, [a.criterion]: a.mark } });

    case "coding":
      if (q.item.kind !== "coding" || (s.step !== "answer" && s.step !== "review")) return s;
      return patch(s, { coding: a.outcome });

    case "coding-submit":
      if (q.item.kind !== "coding" || s.step !== "answer") return s;
      return { ...patch(s, { answeredAt: a.at, timedOut: a.timedOut }), step: "review" };

    case "next": {
      if (s.step !== "review") return s;
      const scored = patch(s, { score: scoreOf(q) });
      return advance(scored, a.at);
    }

    case "skip": {
      if (s.step === "brief") return s;
      const skipped = patch(s, { skipped: true, score: 0, answeredAt: q.answeredAt ?? a.at });
      return advance(skipped, a.at);
    }
  }
}

export function stageResults(s: Session): StageResult[] {
  return s.plan.map((p) => ({
    stage: p.stage,
    competency: STAGE_RULES[p.stage].competency,
    core: p.core,
    scores: s.questions.filter((q) => q.stage === p.stage && q.score !== null).map((q) => q.score as number),
  }));
}

export function stagePosition(s: Session): { stageIndex: number; inStage: number; ofStage: number } {
  const q = s.questions[Math.min(s.cursor, s.questions.length - 1)];
  const stageIndex = Math.max(
    0,
    s.plan.findIndex((p) => p.stage === q?.stage)
  );
  const inThisStage = s.questions.map((x, i) => ({ x, i })).filter(({ x }) => x.stage === q?.stage);
  return {
    stageIndex,
    inStage: inThisStage.findIndex(({ i }) => i === s.cursor) + 1,
    ofStage: inThisStage.length,
  };
}

export function elapsedSeconds(s: Session, now: number): number {
  return Math.max(0, Math.round(((s.finishedAt ?? now) - s.startedAt) / 1000));
}
