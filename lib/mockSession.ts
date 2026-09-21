import type { MockLevel, MockQuestion } from "@/lib/mockQuestions";

export type Rating = "nailed" | "partly" | "missed";

export interface MockFilters {
  sources: ("js" | "react")[];
  level: MockLevel | "any";
  count: number;
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickQuestions(
  all: readonly MockQuestion[],
  filters: MockFilters,
  random: () => number = Math.random
): MockQuestion[] {
  const pool = all.filter(
    (q) => filters.sources.includes(q.source) && (filters.level === "any" || q.level === filters.level)
  );
  return shuffle(pool, random).slice(0, Math.max(0, filters.count));
}

export interface MockSummary {
  total: number;
  nailed: number;
  partly: number;
  missed: number;
  percent: number;
}

export function summarise(ratings: readonly Rating[]): MockSummary {
  const nailed = ratings.filter((r) => r === "nailed").length;
  const partly = ratings.filter((r) => r === "partly").length;
  const missed = ratings.filter((r) => r === "missed").length;
  const total = ratings.length;
  const percent = total === 0 ? 0 : Math.round(((nailed + partly * 0.5) / total) * 100);
  return { total, nailed, partly, missed, percent };
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
