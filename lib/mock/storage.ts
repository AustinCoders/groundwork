import { store } from "@/lib/storage";
import { decideLoop, type LevelCall, type Verdict } from "@/lib/mock/scoring";
import { stageResults, type Session, type SessionMode } from "@/lib/mock/session";
import type { LoopConfig, StageId } from "@/lib/mock/types";

const KEY_CURRENT = "groundwork:mock:current";
const KEY_HISTORY = "groundwork:mock:history";
const KEY_RETRY = "groundwork:mock:retry";

const MAX_HISTORY = 50;
const MAX_RETRY = 60;
export const RETRY_BELOW = 0.6;
export const RETIRE_AT = 0.8;

export interface HistoryEntry {
  id: string;
  mode: SessionMode;
  config: LoopConfig;
  startedAt: number;
  finishedAt: number;
  stages: { stage: StageId; core: boolean; scores: number[] }[];
  verdict: Verdict;
  headline: string;
  level: LevelCall;
  score: number;
  questions: number;
  timedOut: number;
  skipped: number;
}

export interface RetryEntry {
  id: string;
  stage: StageId;
  title: string;
  score: number;
  at: number;
}

function plain(html: string, max = 140): string {
  const text = html
    .replace(/<\/(p|li|div|h\d)>/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;|&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function isSession(v: unknown): v is Session {
  const s = v as Session | null;
  return Boolean(s && s.version === 1 && Array.isArray(s.questions) && Array.isArray(s.plan) && s.config);
}

export interface MockSnapshot {
  current: Session | null;
  history: HistoryEntry[];
  retry: RetryEntry[];
}

const EMPTY: MockSnapshot = { current: null, history: [], retry: [] };
let snapshot: MockSnapshot | null = null;
const listeners = new Set<() => void>();

function changed(): void {
  snapshot = null;
  listeners.forEach((l) => l());
}

export function subscribeMock(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function mockSnapshot(): MockSnapshot {
  return (snapshot ||= { current: mockStore.current(), history: mockStore.history(), retry: mockStore.retry() });
}

export function serverMockSnapshot(): MockSnapshot {
  return EMPTY;
}

export const mockStore = {
  current(): Session | null {
    const s = store.get<unknown>(KEY_CURRENT, null);
    return isSession(s) && s.finishedAt === null ? s : null;
  },

  saveCurrent(s: Session): void {
    store.set(KEY_CURRENT, s);
  },

  clearCurrent(): void {
    store.remove(KEY_CURRENT);
    changed();
  },

  refresh(): void {
    changed();
  },

  history(): HistoryEntry[] {
    const list = store.get<unknown>(KEY_HISTORY, []);
    return Array.isArray(list) ? (list as HistoryEntry[]) : [];
  },

  retry(): RetryEntry[] {
    const list = store.get<unknown>(KEY_RETRY, []);
    return Array.isArray(list) ? (list as RetryEntry[]) : [];
  },

  removeRetry(ids: readonly string[]): void {
    const drop = new Set(ids);
    store.set(
      KEY_RETRY,
      mockStore.retry().filter((r) => !drop.has(r.id))
    );
    changed();
  },

  finish(s: Session, stageTitle: (s: StageId) => string): HistoryEntry {
    const results = stageResults(s);
    const decision = decideLoop(results, s.config, stageTitle);
    const entry: HistoryEntry = {
      id: s.id,
      mode: s.mode,
      config: s.config,
      startedAt: s.startedAt,
      finishedAt: s.finishedAt ?? Date.now(),
      stages: results.map((r) => ({ stage: r.stage, core: r.core, scores: r.scores })),
      verdict: decision.verdict,
      headline: decision.headline,
      level: decision.level,
      score: decision.score,
      questions: s.questions.length,
      timedOut: s.questions.filter((q) => q.timedOut).length,
      skipped: s.questions.filter((q) => q.skipped).length,
    };

    const history = mockStore.history().filter((h) => h.id !== s.id);
    history.push(entry);
    store.set(KEY_HISTORY, history.slice(-MAX_HISTORY));

    const retry = new Map(mockStore.retry().map((r) => [r.id, r]));
    for (const q of s.questions) {
      const score = q.score ?? 0;
      if (score >= RETIRE_AT) {
        retry.delete(q.item.id);
      } else if (score < RETRY_BELOW) {
        retry.set(q.item.id, {
          id: q.item.id,
          stage: q.stage,
          title: plain(q.item.kind === "talk" ? q.item.prompt : q.item.title),
          score,
          at: entry.finishedAt,
        });
      }
    }
    store.set(KEY_RETRY, [...retry.values()].sort((a, b) => b.at - a.at).slice(0, MAX_RETRY));

    mockStore.clearCurrent();
    return entry;
  },
};
