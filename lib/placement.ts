import type { Question } from "@/content/quiz-types";
import type { LevelId } from "@/content/types";
import { LOWER_BELOW, RAISE_AT } from "@/lib/adaptiveThresholds";
import { gradeAnswer, type Answer } from "@/lib/checkDraw";

export const NOT_SURE = "groundwork:not-sure";
export const MISS_STREAK = 3;
export const CREDIT_AT = 2;

export type StageId = "route" | "beginner-more" | "intermediate" | "advanced";

export const STAGES: Record<StageId, { level: LevelId; size: number }> = {
  route: { level: "beginner", size: 6 },
  "beginner-more": { level: "beginner", size: 4 },
  intermediate: { level: "intermediate", size: 6 },
  advanced: { level: "advanced", size: 6 },
};

export const STAGE_ORDER: StageId[] = ["route", "beginner-more", "intermediate", "advanced"];

export const MAX_QUESTIONS = STAGES.route.size + STAGES.intermediate.size + STAGES.advanced.size;

export interface PlacementChapter {
  id: string;
  level: LevelId;
  prerequisites: string[];
}

export interface PlacementContext {
  chapters: readonly PlacementChapter[];
  bank: readonly Question[];
}

export type PlacementInput = Answer | typeof NOT_SURE;

export interface PlacementAnswer {
  question: string;
  chapter: string;
  stage: StageId;
  correct: boolean;
}

export interface PlacementState {
  stage: StageId | null;
  level: LevelId;
  answers: PlacementAnswer[];
}

export interface StageScore {
  id: StageId;
  correct: number;
  asked: number;
}

export interface PlacementResult {
  level: LevelId;
  allotted: string[];
  testedOut: string[];
  reviseEarlier: string[];
  stages: StageScore[];
}

export interface StageOutcome {
  next: StageId | null;
  level: LevelId | null;
}

const LEVEL_RANK: Record<LevelId, number> = { beginner: 0, intermediate: 1, advanced: 2 };

export function levelRank(level: LevelId): number {
  return LEVEL_RANK[level];
}

export function outcomeAfter(stage: StageId, score: number): StageOutcome {
  const raised = score >= RAISE_AT;
  const lowered = score < LOWER_BELOW;
  switch (stage) {
    case "route":
      if (raised) return { next: "intermediate", level: null };
      return lowered ? { next: null, level: "beginner" } : { next: "beginner-more", level: null };
    case "beginner-more":
      return { next: null, level: "beginner" };
    case "intermediate":
      if (raised) return { next: "advanced", level: "intermediate" };
      return { next: null, level: lowered ? "beginner" : "intermediate" };
    case "advanced":
      return { next: null, level: raised ? "advanced" : "intermediate" };
  }
}

function placementQuestions(ctx: PlacementContext, level: LevelId): Question[] {
  const lists = ctx.chapters
    .filter((chapter) => chapter.level === level)
    .map((chapter) => ctx.bank.filter((question) => question.placement === true && question.chapter === chapter.id));
  const depth = Math.max(0, ...lists.map((list) => list.length));
  const ordered: Question[] = [];
  for (let round = 0; round < depth; round++) {
    for (const list of lists) {
      if (round < list.length) ordered.push(list[round]);
    }
  }
  return ordered;
}

function givenIn(state: PlacementState, stage: StageId): PlacementAnswer[] {
  return state.answers.filter((answer) => answer.stage === stage);
}

function missesInARow(answers: readonly PlacementAnswer[]): number {
  let streak = 0;
  for (let at = answers.length - 1; at >= 0 && !answers[at].correct; at--) streak++;
  return streak;
}

function nextQuestion(state: PlacementState, ctx: PlacementContext): Question | null {
  if (state.stage === null) return null;
  const asked = new Set(state.answers.map((answer) => answer.question));
  return placementQuestions(ctx, STAGES[state.stage].level).find((question) => !asked.has(question.id)) ?? null;
}

function stageIsOver(state: PlacementState, stage: StageId, ctx: PlacementContext): boolean {
  const given = givenIn(state, stage);
  if (given.length >= STAGES[stage].size) return true;
  if (missesInARow(given) >= MISS_STREAK) return true;
  return nextQuestion(state, ctx) === null;
}

function concludeStage(state: PlacementState, stage: StageId): PlacementState {
  const given = givenIn(state, stage);
  if (given.length === 0) return { ...state, stage: null };
  const score = given.filter((answer) => answer.correct).length / given.length;
  const outcome = outcomeAfter(stage, score);
  return { ...state, stage: outcome.next, level: outcome.level ?? state.level };
}

function settle(state: PlacementState, ctx: PlacementContext): PlacementState {
  let current = state;
  while (current.stage !== null && stageIsOver(current, current.stage, ctx)) {
    current = concludeStage(current, current.stage);
  }
  return current;
}

export function startPlacement(ctx: PlacementContext): PlacementState {
  return settle({ stage: "route", level: "beginner", answers: [] }, ctx);
}

export function currentQuestion(state: PlacementState, ctx: PlacementContext): Question | null {
  return nextQuestion(state, ctx);
}

export function answerQuestion(
  state: PlacementState,
  ctx: PlacementContext,
  answer: PlacementInput,
  questionId?: string
): PlacementState {
  const question = nextQuestion(state, ctx);
  if (question === null || state.stage === null) return state;
  if (questionId !== undefined && questionId !== question.id) return state;
  const correct = answer !== NOT_SURE && gradeAnswer(question, answer);
  const given: PlacementAnswer = { question: question.id, chapter: question.chapter, stage: state.stage, correct };
  return settle({ ...state, answers: [...state.answers, given] }, ctx);
}

export function placementDone(state: PlacementState): boolean {
  return state.stage === null;
}

function stageScores(state: PlacementState): StageScore[] {
  return STAGE_ORDER.flatMap((id) => {
    const given = givenIn(state, id);
    if (given.length === 0) return [];
    return [{ id, correct: given.filter((answer) => answer.correct).length, asked: given.length }];
  });
}

export function placementResult(state: PlacementState, ctx: PlacementContext): PlacementResult {
  const correctBy = new Map<string, number>();
  const missed = new Set<string>();
  for (const answer of state.answers) {
    if (answer.correct) correctBy.set(answer.chapter, (correctBy.get(answer.chapter) ?? 0) + 1);
    else missed.add(answer.chapter);
  }

  const testedOutIds = new Set(
    ctx.chapters
      .filter(
        (chapter) =>
          (correctBy.get(chapter.id) ?? 0) >= CREDIT_AT &&
          !chapter.prerequisites.some((prerequisite) => missed.has(prerequisite))
      )
      .map((chapter) => chapter.id)
  );

  const reached = levelRank(state.level);
  const allotted: string[] = [];
  const reviseEarlier: string[] = [];
  for (const chapter of ctx.chapters) {
    if (testedOutIds.has(chapter.id)) continue;
    const atOrAbove = levelRank(chapter.level) >= reached;
    if (atOrAbove || missed.has(chapter.id)) allotted.push(chapter.id);
    else reviseEarlier.push(chapter.id);
  }

  return {
    level: state.level,
    allotted,
    testedOut: ctx.chapters.filter((chapter) => testedOutIds.has(chapter.id)).map((chapter) => chapter.id),
    reviseEarlier,
    stages: stageScores(state),
  };
}
