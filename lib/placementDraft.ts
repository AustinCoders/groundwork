import type { LevelId } from "@/content/types";
import {
  STAGE_ORDER,
  currentQuestion,
  type PlacementAnswer,
  type PlacementContext,
  type PlacementState,
  type StageId,
} from "@/lib/placement";
import { store } from "@/lib/storage";

export const DRAFT_KEY = "groundwork:dsa:placement-draft";
const VERSION = 1;
const LEVELS: LevelId[] = ["beginner", "intermediate", "advanced"];
const MAX_ANSWERS = 40;

export interface DraftStep {
  state: PlacementState;
  picked: string[];
}

export interface PlacementDraft {
  startedAt: number;
  state: PlacementState;
  history: DraftStep[];
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function answerOf(value: unknown): PlacementAnswer | null {
  if (!isObject(value)) return null;
  if (typeof value.question !== "string" || typeof value.chapter !== "string") return null;
  if (typeof value.correct !== "boolean" || !STAGE_ORDER.includes(value.stage as StageId)) return null;
  return { question: value.question, chapter: value.chapter, stage: value.stage as StageId, correct: value.correct };
}

function stateOf(value: unknown): PlacementState | null {
  if (!isObject(value) || !Array.isArray(value.answers) || value.answers.length > MAX_ANSWERS) return null;
  if (value.stage !== null && !STAGE_ORDER.includes(value.stage as StageId)) return null;
  if (!LEVELS.includes(value.level as LevelId)) return null;
  const answers = value.answers.map(answerOf);
  if (answers.some((answer) => answer === null)) return null;
  return {
    stage: value.stage as StageId | null,
    level: value.level as LevelId,
    answers: answers as PlacementAnswer[],
  };
}

function stepOf(value: unknown): DraftStep | null {
  if (!isObject(value)) return null;
  const state = stateOf(value.state);
  if (!state || !Array.isArray(value.picked) || !value.picked.every((id) => typeof id === "string")) return null;
  return { state, picked: value.picked as string[] };
}

export function sanitizeDraft(value: unknown): PlacementDraft | null {
  if (!isObject(value) || value.v !== VERSION) return null;
  const startedAt = value.startedAt;
  if (typeof startedAt !== "number" || !Number.isFinite(startedAt) || startedAt <= 0) return null;
  const state = stateOf(value.state);
  if (!state || !Array.isArray(value.history) || value.history.length > MAX_ANSWERS) return null;
  const history = value.history.map(stepOf);
  if (history.some((step) => step === null)) return null;
  return { startedAt, state, history: history as DraftStep[] };
}

export function draftFitsBank(draft: PlacementDraft, ctx: PlacementContext): boolean {
  const known = new Set(ctx.bank.map((question) => question.id));
  const stepStates = [...draft.history.map((step) => step.state), draft.state];
  if (!stepStates.every((state) => state.answers.every((answer) => known.has(answer.question)))) return false;
  return currentQuestion(draft.state, ctx) !== null;
}

export function readDraft(): PlacementDraft | null {
  return sanitizeDraft(store.get<unknown>(DRAFT_KEY, null));
}

export function writeDraft(draft: PlacementDraft): void {
  store.set(DRAFT_KEY, { v: VERSION, ...draft });
}

export function clearDraft(): void {
  store.remove(DRAFT_KEY);
}
