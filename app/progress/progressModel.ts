import { BADGES, type Badge, type Stats } from "@/lib/gamification";
import { plural } from "@/lib/format";

export interface TopicTrack {
  id: string;
  name: string;
  mark: string;
  accent: string;
  href: string;
  ids: string[];
}

export interface DayCount {
  day: string;
  count: number;
}

export interface TopicRow extends TopicTrack {
  n: number;
  pct: number;
}

export interface NextStep {
  key: "review" | "continue" | "interview";
  title: string;
  body: string;
  action: string;
  href: string;
}

export interface Confidence {
  knew: number;
  shaky: number;
  blank: number;
}

export type HeatCell = DayCount | null;

export const HEATMAP_DAYS = 364;

export const XP_PER = { chapter: 5, exercise: 10, review: 3 } as const;

export const DEFAULT_STATS: Stats = {
  exercisesSolved: 0,
  chaptersRead: 0,
  totalReviews: 0,
  streak: 0,
  bestStreak: 0,
  activeDays: 0,
  xp: 0,
  level: 1,
  xpIntoLevel: 0,
  xpForNextLevel: 25,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function dayDate(day: string): Date {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
}

export function xpToGo(stats: Stats): number {
  return Math.max(0, stats.xpForNextLevel - stats.xpIntoLevel);
}

export function xpPercent(stats: Stats): number {
  return stats.xpForNextLevel > 0 ? Math.min(100, (stats.xpIntoLevel / stats.xpForNextLevel) * 100) : 100;
}

export function heatLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export function weekTotal(days: DayCount[]): number {
  return days.slice(-7).reduce((sum, d) => sum + d.count, 0);
}

export function buildHeat(days: DayCount[]) {
  if (!days.length)
    return { weeks: [] as HeatCell[][], months: [] as { at: number; label: string }[], active: 0, total: 0 };
  const pad = dayDate(days[0].day).getDay();
  const cells: HeatCell[] = [...Array.from({ length: pad }, () => null), ...days];
  const weeks: HeatCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const all: { at: number; label: string }[] = [];
  let last = -1;
  weeks.forEach((week, i) => {
    const first = week.find(Boolean);
    if (!first) return;
    const month = dayDate(first.day).getMonth();
    if (month !== last) {
      all.push({ at: i, label: MONTHS[month] });
      last = month;
    }
  });
  return {
    weeks,
    months: all.filter((m, i) => !all[i + 1] || all[i + 1].at - m.at >= 3),
    active: days.filter((d) => d.count > 0).length,
    total: days.reduce((sum, d) => sum + d.count, 0),
  };
}

export function topicRows(tracks: TopicTrack[], done: ReadonlySet<string>): TopicRow[] {
  return tracks.map((track) => {
    const n = track.ids.filter((id) => done.has(id)).length;
    return { ...track, n, pct: Math.round((n / track.ids.length) * 100) };
  });
}

export function keepGoingWith(rows: TopicRow[]): TopicRow | undefined {
  return rows.filter((t) => t.n > 0 && t.n < t.ids.length).sort((a, b) => b.pct - a.pct)[0];
}

export function confidenceCounts(marks: Record<string, string>): Confidence {
  const values = Object.values(marks);
  return {
    knew: values.filter((c) => c === "knew").length,
    shaky: values.filter((c) => c === "shaky").length,
    blank: values.filter((c) => c === "blank").length,
  };
}

export function nextSteps(dueCount: number, keepGoing: TopicRow | undefined, counts: Confidence): NextStep[] {
  const weak = counts.shaky + counts.blank;
  const steps: NextStep[] = [];
  if (dueCount > 0) {
    steps.push({
      key: "review",
      title: `${plural(dueCount, "chapter")} due for review`,
      body: "A few minutes keeps the streak and the memory.",
      action: "Open review →",
      href: "/review",
    });
  }
  steps.push({
    key: "continue",
    title: keepGoing ? `Keep going with ${keepGoing.name}` : "Start a topic",
    body: keepGoing
      ? `${keepGoing.n} of ${keepGoing.ids.length} read so far.`
      : "JavaScript is the one everything else builds on.",
    action: keepGoing ? "Continue →" : "Pick one →",
    href: keepGoing?.href ?? "/",
  });
  steps.push({
    key: "interview",
    title: weak ? `${plural(weak, "weak interview answer")}` : "Drill interview questions",
    body: weak ? "Flashcards until they stick." : "Twenty flashcards, marked honestly.",
    action: "Drill →",
    href: weak ? "/interview/questions?filter=shaky" : "/interview/questions",
  });
  return steps;
}

type CountedStat = "exercisesSolved" | "chaptersRead" | "bestStreak" | "totalReviews" | "level";

interface BadgeGoal {
  stat: CountedStat;
  need: number;
  unit: string;
}

export const BADGE_GOALS: Record<string, BadgeGoal> = {
  "first-solve": { stat: "exercisesSolved", need: 1, unit: "exercise" },
  "solve-10": { stat: "exercisesSolved", need: 10, unit: "exercise" },
  "solve-50": { stat: "exercisesSolved", need: 50, unit: "exercise" },
  "solve-100": { stat: "exercisesSolved", need: 100, unit: "exercise" },
  "read-10": { stat: "chaptersRead", need: 10, unit: "chapter" },
  "read-50": { stat: "chaptersRead", need: 50, unit: "chapter" },
  "streak-3": { stat: "bestStreak", need: 3, unit: "day" },
  "streak-7": { stat: "bestStreak", need: 7, unit: "day" },
  "streak-30": { stat: "bestStreak", need: 30, unit: "day" },
  reviewer: { stat: "totalReviews", need: 10, unit: "review" },
  "level-5": { stat: "level", need: 5, unit: "level" },
  "level-10": { stat: "level", need: 10, unit: "level" },
};

export interface BadgeStanding {
  have: number;
  need: number;
  ratio: number;
  label: string;
}

export function badgeStanding(badge: Badge, stats: Stats): BadgeStanding {
  const goal = BADGE_GOALS[badge.id];
  if (!goal) return { have: 0, need: 1, ratio: 0, label: "" };
  const have = Math.min(stats[goal.stat], goal.need);
  const unit = goal.need === 1 ? goal.unit : `${goal.unit}s`;
  const label = goal.unit === "level" ? `level ${have} of ${goal.need}` : `${have} of ${goal.need} ${unit}`;
  const floor = goal.stat === "level" ? 1 : 0;
  return { have, need: goal.need, ratio: (have - floor) / (goal.need - floor), label };
}

export function nextBadge(stats: Stats, earned: ReadonlySet<string>): Badge | null {
  let best: Badge | null = null;
  let bestRatio = -1;
  for (const badge of BADGES) {
    if (earned.has(badge.id)) continue;
    const { ratio } = badgeStanding(badge, stats);
    if (ratio > bestRatio) {
      best = badge;
      bestRatio = ratio;
    }
  }
  return best;
}

export function badgeWall(earned: ReadonlySet<string>): Badge[] {
  return [...BADGES].sort((a, b) => Number(earned.has(b.id)) - Number(earned.has(a.id)));
}
