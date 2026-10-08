export interface QuizRecord {
  attempts: number;
  best: number;
  lastAt: number | null;
  passedAt: number | null;
  markedAnyway: boolean;
  missed: string[];
}

export type CheckStatus = "passed" | "not-checked" | "read-before-checks" | "unread";

export const EMPTY_RECORD: QuizRecord = Object.freeze({
  attempts: 0,
  best: 0,
  lastAt: null,
  passedAt: null,
  markedAnyway: false,
  missed: [],
});

const count = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;

const instant = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;

export function sanitizeRecord(value: unknown): QuizRecord | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const loose = value as Record<string, unknown>;
  return {
    attempts: count(loose.attempts),
    best: count(loose.best),
    lastAt: instant(loose.lastAt),
    passedAt: instant(loose.passedAt),
    markedAnyway: loose.markedAnyway === true,
    missed: Array.isArray(loose.missed) ? loose.missed.filter((id): id is string => typeof id === "string") : [],
  };
}

export function applyAttempt(
  record: QuizRecord | undefined,
  result: { score: number; missed: string[]; at: number }
): QuizRecord {
  const before = record ?? EMPTY_RECORD;
  return {
    ...before,
    attempts: before.attempts + 1,
    best: Math.max(before.best, result.score),
    lastAt: result.at,
    missed: [...result.missed],
  };
}

export function applyPass(record: QuizRecord | undefined, at: number): QuizRecord {
  return { ...(record ?? EMPTY_RECORD), passedAt: at, markedAnyway: false };
}

export function applyMarkedAnyway(record: QuizRecord | undefined): QuizRecord {
  return { ...(record ?? EMPTY_RECORD), passedAt: null, markedAnyway: true };
}

export function applyUnmark(record: QuizRecord | undefined): QuizRecord | undefined {
  if (!record) return record;
  return { ...record, passedAt: null, markedAnyway: false };
}

export function checkStatus(done: boolean, record: QuizRecord | undefined): CheckStatus {
  if (!done) return "unread";
  if (record && record.passedAt !== null) return "passed";
  if (record && record.markedAnyway) return "not-checked";
  return "read-before-checks";
}
