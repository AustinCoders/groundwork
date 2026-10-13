import type { LevelId } from "@/content/types";
import { plural } from "@/lib/format";
import { MAX_QUESTIONS, STAGES, levelRank, type PlacementContext } from "@/lib/placement";

const SECONDS_PER_QUESTION = 33;

export interface BankSummary {
  questions: number;
  chapters: number;
  start: number;
  capacity: number;
  minutes: number;
  reachable: LevelId;
  thin: boolean;
}

function perLevel(ctx: PlacementContext): Record<LevelId, number> {
  const levelOf = new Map(ctx.chapters.map((chapter) => [chapter.id, chapter.level]));
  const counts: Record<LevelId, number> = { beginner: 0, intermediate: 0, advanced: 0 };
  for (const question of ctx.bank) {
    const level = levelOf.get(question.chapter);
    if (question.placement === true && level) counts[level]++;
  }
  return counts;
}

export function summarizeBank(ctx: PlacementContext): BankSummary {
  const counts = perLevel(ctx);
  const covered = new Set(
    ctx.bank
      .filter((question) => question.placement === true)
      .map((question) => question.chapter)
      .filter((id) => ctx.chapters.some((chapter) => chapter.id === id))
  );
  const beginner = Math.min(STAGES.route.size, counts.beginner);
  let capacity = Math.min(STAGES.route.size + STAGES["beginner-more"].size, counts.beginner);
  let reachable: LevelId = "beginner";
  if (counts.beginner > 0 && counts.intermediate > 0) {
    reachable = "intermediate";
    let chain = beginner + Math.min(STAGES.intermediate.size, counts.intermediate);
    if (counts.advanced > 0) {
      reachable = "advanced";
      chain += Math.min(STAGES.advanced.size, counts.advanced);
    }
    capacity = Math.max(capacity, chain);
  }
  return {
    questions: counts.beginner + counts.intermediate + counts.advanced,
    chapters: covered.size,
    start: beginner,
    capacity,
    minutes: Math.max(1, Math.round((capacity * SECONDS_PER_QUESTION) / 60)),
    reachable,
    thin: levelRank(reachable) < levelRank("advanced") || capacity < MAX_QUESTIONS,
  };
}

export function questionCountText(summary: BankSummary): string {
  if (summary.capacity === 0) return "no questions yet";
  const noun = summary.capacity === 1 ? "question" : "questions";
  return summary.capacity > summary.start ? `up to ${summary.capacity} ${noun}` : `${summary.capacity} ${noun}`;
}

export function minutesText(summary: BankSummary): string {
  return `about ${summary.minutes} ${summary.minutes === 1 ? "minute" : "minutes"}`;
}

export function sizeLine(summary: BankSummary): string {
  const count = questionCountText(summary);
  const lead = `${count.charAt(0).toUpperCase()}${count.slice(1)}${summary.thin ? " today" : ""}`;
  return `${lead}, ${minutesText(summary)}${summary.thin ? "; more chapters add more." : "."}`;
}

export function thinNote(summary: BankSummary, written: number, names: Record<LevelId, string>): string | null {
  if (!summary.thin) return null;
  const above =
    summary.reachable === "advanced" ? "" : `, and none above ${names[summary.reachable] ?? summary.reachable}`;
  const verb = summary.chapters === 1 ? "has" : "have";
  return `Only ${plural(summary.chapters, "chapter")} of ${written} ${verb} placement questions so far${above}. Until more are written this is a first estimate, and choosing a level yourself gives a better start.`;
}
