import { isPlainObject } from "@/lib/storage";

export interface DailyPick {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  href: string;
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function dailyFor(day: string, pool: readonly DailyPick[]): DailyPick | null {
  if (pool.length === 0) return null;
  const sorted = [...pool].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return sorted[hash(`groundwork-daily:${day}`) % sorted.length];
}

export function dailyDone(pick: DailyPick | null, solvedOn: Record<string, string>, day: string): boolean {
  return Boolean(pick && solvedOn[pick.id] === day);
}

export const DAILY_KEY = "groundwork:daily-pick";

export interface SavedDaily extends DailyPick {
  day: string;
}

export function readSavedDaily(value: unknown, day: string): SavedDaily | null {
  if (!isPlainObject(value) || value.day !== day) return null;
  const pick = readPick(value);
  return pick ? { ...pick, day } : null;
}

export function readPick(value: unknown): DailyPick | null {
  if (!isPlainObject(value)) return null;
  const { id, title, level, href } = value;
  if (typeof id !== "string" || !/^[a-z0-9][a-z0-9-]{0,118}$/.test(id)) return null;
  if (typeof title !== "string" || !title.trim()) return null;
  if (level !== "beginner" && level !== "intermediate" && level !== "advanced") return null;
  if (typeof href !== "string" || href !== `/problems/${id}`) return null;
  return { id, title: title.trim().slice(0, 120), level, href };
}

export interface CardDaily {
  day: string;
  done: boolean;
}

export function readCardDaily(value: unknown, day: string): CardDaily | null {
  if (!isPlainObject(value) || value.day !== day) return null;
  return { day, done: value.done === true };
}
