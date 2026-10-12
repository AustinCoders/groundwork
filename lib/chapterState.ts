import { checkStatus, type QuizRecord } from "@/lib/quizRecord";

export type ChapterState = "checked" | "not-checked" | "read-before-checks" | "tested-out";

export const STATE_ORDER: readonly ChapterState[] = ["checked", "not-checked", "read-before-checks", "tested-out"];

export const STATE_TEXT: Record<ChapterState, string> = {
  checked: "checked",
  "not-checked": "not checked",
  "read-before-checks": "read before checks",
  "tested-out": "tested out",
};

export type StateCounts = Record<ChapterState, number>;

export function chapterState(input: {
  done: boolean;
  hasCheck: boolean;
  record: QuizRecord | undefined;
  testedOut: boolean;
}): ChapterState | null {
  if (!input.done) return input.testedOut ? "tested-out" : null;
  if (!input.hasCheck) return null;
  const status = checkStatus(true, input.record);
  if (status === "passed") return "checked";
  if (status === "not-checked") return "not-checked";
  return "read-before-checks";
}

export function countStates(ids: readonly string[], states: ReadonlyMap<string, ChapterState>): StateCounts {
  const counts: StateCounts = { checked: 0, "not-checked": 0, "read-before-checks": 0, "tested-out": 0 };
  for (const id of ids) {
    const state = states.get(id);
    if (state) counts[state] += 1;
  }
  return counts;
}

export function summarizeStates(counts: StateCounts): string {
  return STATE_ORDER.filter((state) => counts[state] > 0)
    .map((state) => `${counts[state]} ${STATE_TEXT[state]}`)
    .join(" · ");
}

export function buildChapterStates(input: {
  chapterIds: readonly string[];
  checkChapterIds: readonly string[];
  done: ReadonlySet<string>;
  records: Readonly<Record<string, QuizRecord>>;
  testedOut: readonly string[];
}): Map<string, ChapterState> {
  const withCheck = new Set(input.checkChapterIds);
  const tested = new Set(input.testedOut);
  const states = new Map<string, ChapterState>();
  for (const id of input.chapterIds) {
    const state = chapterState({
      done: input.done.has(id),
      hasCheck: withCheck.has(id),
      record: input.records[id],
      testedOut: tested.has(id),
    });
    if (state) states.set(id, state);
  }
  return states;
}
