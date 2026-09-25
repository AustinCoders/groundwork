import { pickItems } from "@/lib/mock/loops";
import type { LoopConfig, MockItem } from "@/lib/mock/types";

export const RAISE_AT = 0.8;
export const LOWER_BELOW = 0.45;

export type Shift = "harder" | "easier";

export interface Alternates {
  harder?: MockItem;
  easier?: MockItem;
}

export function rank(item: MockItem): number {
  if (item.kind === "coding") return item.level === "beginner" ? 0 : item.level === "intermediate" ? 1 : 2;
  return item.level === "junior" ? 0 : item.level === "senior" ? 2 : 1;
}

export function shiftFor(score: number | null): Shift | null {
  if (score === null) return null;
  if (score >= RAISE_AT) return "harder";
  if (score < LOWER_BELOW) return "easier";
  return null;
}

export function pickAlternates(
  pool: readonly MockItem[],
  item: MockItem,
  config: LoopConfig,
  random: () => number,
  taken: Set<string>
): Alternates {
  const level = rank(item);
  const from = (keep: (r: number) => boolean) =>
    pickItems(
      pool.filter((x) => keep(rank(x))),
      config,
      1,
      random,
      taken
    )[0];
  const harder = from((r) => r > level);
  if (harder) taken.add(harder.id);
  const easier = from((r) => r < level);
  if (easier) taken.add(easier.id);
  return { harder, easier };
}
