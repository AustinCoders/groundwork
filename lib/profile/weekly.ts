import { isPlainObject } from "@/lib/storage";

export type ChallengeMetric = "chapters" | "exercises" | "days" | "total";

export interface Challenge {
  id: string;
  title: string;
  blurb: string;
  metric: ChallengeMetric;
  target: number;
}

export const CHALLENGES: readonly Challenge[] = [
  {
    id: "read-10",
    title: "Read 10 chapters",
    blurb: "Finish or review ten chapters this week.",
    metric: "chapters",
    target: 10,
  },
  {
    id: "days-5",
    title: "Show up 5 days",
    blurb: "Read or solve something on five different days.",
    metric: "days",
    target: 5,
  },
  {
    id: "solve-6",
    title: "Solve 6 problems",
    blurb: "Pass the tests on six problems this week.",
    metric: "exercises",
    target: 6,
  },
  {
    id: "total-20",
    title: "20 things done",
    blurb: "Any mix of chapters read and problems solved.",
    metric: "total",
    target: 20,
  },
  {
    id: "read-15",
    title: "Read 15 chapters",
    blurb: "A reading week: fifteen chapters finished or reviewed.",
    metric: "chapters",
    target: 15,
  },
  {
    id: "solve-10",
    title: "Solve 10 problems",
    blurb: "A practice week: ten problems passing their tests.",
    metric: "exercises",
    target: 10,
  },
];

const DAY = 86_400_000;

function utc(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function key(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function weekStart(day: string): string {
  const ms = utc(day);
  const weekday = (new Date(ms).getUTCDay() + 6) % 7;
  return key(ms - weekday * DAY);
}

export function weekDays(week: string): string[] {
  const start = utc(week);
  return Array.from({ length: 7 }, (_, i) => key(start + i * DAY));
}

export function weekEnds(week: string, today: string): number {
  return Math.max(0, Math.round((utc(week) + 7 * DAY - utc(today)) / DAY));
}

export function challengeFor(week: string): Challenge {
  const index = Math.floor(utc(week) / (7 * DAY));
  return CHALLENGES[((index % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length];
}

export interface WeekInput {
  activity: Record<string, number>;
  chapterTimes: number[];
  solvedOn: Record<string, string>;
}

export function challengeCount(challenge: Challenge, week: string, input: WeekInput): number {
  const days = new Set(weekDays(week));
  const start = utc(week);
  const end = start + 7 * DAY;
  if (challenge.metric === "days") return [...days].filter((d) => (input.activity[d] ?? 0) > 0).length;
  if (challenge.metric === "total") return [...days].reduce((sum, d) => sum + (input.activity[d] ?? 0), 0);
  if (challenge.metric === "exercises") return Object.values(input.solvedOn).filter((d) => days.has(d)).length;
  return input.chapterTimes.filter((at) => {
    const local = new Date(at);
    const day = Date.UTC(local.getFullYear(), local.getMonth(), local.getDate());
    return day >= start && day < end;
  }).length;
}

export interface ChallengeState {
  week: string;
  challenge: Challenge;
  count: number;
  done: boolean;
  daysLeft: number;
  wins?: number;
}

export function challengeState(today: string, input: WeekInput): ChallengeState {
  const week = weekStart(today);
  const challenge = challengeFor(week);
  const count = challengeCount(challenge, week, input);
  return { week, challenge, count, done: count >= challenge.target, daysLeft: weekEnds(week, today) };
}

export const CHALLENGES_KEY = "groundwork:challenges";

export function sanitizeWins(value: unknown): Record<string, string> {
  if (!isPlainObject(value)) return {};
  const out: Record<string, string> = {};
  for (const [week, id] of Object.entries(value).slice(-200)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(week) && typeof id === "string" && CHALLENGES.some((c) => c.id === id))
      out[week] = id;
  }
  return out;
}

export interface CardChallenge {
  week: string;
  id: string;
  count: number;
  target: number;
}

export function cardChallenge(state: ChallengeState): CardChallenge {
  return {
    week: state.week,
    id: state.challenge.id,
    count: Math.min(state.count, 999),
    target: state.challenge.target,
  };
}

export function readCardChallenge(value: unknown, week: string): CardChallenge | null {
  if (!isPlainObject(value) || value.week !== week) return null;
  const challenge = CHALLENGES.find((c) => c.id === value.id);
  if (!challenge || typeof value.count !== "number" || !Number.isFinite(value.count)) return null;
  return {
    week,
    id: challenge.id,
    count: Math.max(0, Math.min(999, Math.floor(value.count))),
    target: challenge.target,
  };
}
