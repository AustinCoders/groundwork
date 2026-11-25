import { FREEZE_EVERY_DAYS, MAX_FREEZES_BANKED } from "./planData";

const DAY_MS = 86_400_000;

function key(time: number): string {
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface FreezeState {
  earned: number;
  used: number;
  banked: number;
}

export function freezeState(log: Record<string, number>, used: readonly string[]): FreezeState {
  const active = Object.keys(log).filter((day) => (log[day] ?? 0) > 0).length;
  const earned = Math.floor(active / FREEZE_EVERY_DAYS);
  const banked = Math.max(0, Math.min(MAX_FREEZES_BANKED, earned - used.length));
  return { earned, used: used.length, banked };
}

export function freezesToApply(log: Record<string, number>, used: readonly string[], now: number): string[] {
  const frozen = new Set(used);
  const on = (day: string) => (log[day] ?? 0) > 0 || frozen.has(day);
  const { banked } = freezeState(log, used);
  if (banked === 0) return [];
  const missing: string[] = [];
  let cursor = now - DAY_MS;
  for (let step = 0; step <= MAX_FREEZES_BANKED; step++) {
    const day = key(cursor);
    if (on(day)) {
      return missing.length > 0 && missing.length <= banked ? missing.reverse() : [];
    }
    missing.push(day);
    cursor -= DAY_MS;
  }
  return [];
}

export function frozenDays(log: Record<string, number>, used: readonly string[], now: number): Set<string> {
  return new Set([...used, ...freezesToApply(log, used, now)]);
}
