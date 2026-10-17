import type { Roadmap, RoadmapChapter, RoadmapStep, RoadmapStepLevel } from "@/lib/roadmap";

export type StepStatus = "outline" | "todo" | "doing" | "done";

export interface StepProgress {
  done: number;
  total: number;
  status: StepStatus;
}

export interface RoadmapProgress {
  steps: Record<string, StepProgress>;
  stepsDone: number;
  stepsReadable: number;
  chaptersDone: number;
  chaptersTotal: number;
  next: RoadmapStep | null;
}

export const EMPTY_DONE: ReadonlySet<string> = new Set();

export function parseDone(key: string): ReadonlySet<string> {
  const ids = key.slice(2);
  return ids ? new Set(ids.split(",")) : EMPTY_DONE;
}

export function stepProgress(step: RoadmapStep, done: ReadonlySet<string>): StepProgress {
  const total = step.progressIds.length;
  const finished = step.progressIds.filter((id) => done.has(id)).length;
  if (step.written === 0) return { done: 0, total: 0, status: "outline" };
  if (total > 0 && finished === total) return { done: finished, total, status: "done" };
  return { done: finished, total, status: finished > 0 ? "doing" : "todo" };
}

export function roadmapProgress(roadmap: Roadmap, done: ReadonlySet<string>): RoadmapProgress {
  const ordered = roadmap.stages.flatMap((stage) => stage.steps);
  const steps = Object.fromEntries(ordered.map((step) => [step.key, stepProgress(step, done)]));
  const readable = ordered.filter((step) => steps[step.key].status !== "outline");
  return {
    steps,
    stepsDone: readable.filter((step) => steps[step.key].status === "done").length,
    stepsReadable: readable.length,
    chaptersDone: readable.reduce((sum, step) => sum + steps[step.key].done, 0),
    chaptersTotal: readable.reduce((sum, step) => sum + steps[step.key].total, 0),
    next: readable.find((step) => steps[step.key].status !== "done") ?? null,
  };
}

export function statusLabel(progress: StepProgress): string {
  if (progress.status === "outline") return "Not written yet";
  if (progress.status === "done") return "Done";
  if (progress.status === "doing") return `In progress, ${progress.done} of ${progress.total}`;
  return "Not started";
}

export interface Neighbours {
  before: RoadmapStep | null;
  after: RoadmapStep | null;
}

export function neighbours(roadmap: Roadmap, key: string): Neighbours {
  const stageAt = roadmap.stages.findIndex((stage) => stage.steps.some((step) => step.key === key));
  if (stageAt === -1) return { before: null, after: null };
  const stage = roadmap.stages[stageAt];
  const at = stage.steps.findIndex((step) => step.key === key);
  const previousStage = roadmap.stages[stageAt - 1];
  const nextStage = roadmap.stages[stageAt + 1];
  const inOrder = stage.order === "in-order";
  const before = inOrder && at > 0 ? stage.steps[at - 1] : (previousStage?.steps.at(-1) ?? null);
  const after = inOrder && at < stage.steps.length - 1 ? stage.steps[at + 1] : (nextStage?.steps[0] ?? null);
  return { before, after };
}

export function levelProgress(level: RoadmapStepLevel, done: ReadonlySet<string>): { done: number; total: number } {
  return { done: level.ids.filter((id) => done.has(id)).length, total: level.ids.length };
}

export function upNext(step: RoadmapStep, done: ReadonlySet<string>, limit: number): RoadmapChapter[] {
  return step.chapters.filter((chapter) => !done.has(chapter.id)).slice(0, limit);
}
