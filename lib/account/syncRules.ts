import { isPlainObject } from "@/lib/storage";

export type MergeStrategy =
  | { kind: "latest" }
  | { kind: "progress" }
  | { kind: "activity" }
  | { kind: "quiz" }
  | { kind: "record" }
  | { kind: "list"; time: string | null; order: "asc" | "desc"; cap: number };

const LATEST: MergeStrategy = { kind: "latest" };

const EXACT: Record<string, MergeStrategy> = {
  "jsnotes:progress": { kind: "progress" },
  "jsnotes:activity": { kind: "activity" },
  "jsnotes:level": LATEST,
  "jsnotes:last-seen-level": LATEST,
  "jsnotes:editor-settings": LATEST,
  "jsnotes:reading-budget": LATEST,
  "groundwork:quiz": { kind: "quiz" },
  "groundwork:interview:confidence": { kind: "record" },
  "groundwork:interview:mode": LATEST,
  "groundwork:company-questions:practised": { kind: "record" },
  "groundwork:dsa:placement": LATEST,
  "groundwork:dsa:lang": LATEST,
  "groundwork:mock:config": LATEST,
  "groundwork:mock:history": { kind: "list", time: "finishedAt", order: "asc", cap: 50 },
  "groundwork:mock:retry": { kind: "list", time: "at", order: "desc", cap: 60 },
  "groundwork:boards": { kind: "list", time: "updatedAt", order: "desc", cap: 200 },
  "groundwork:boards:last": LATEST,
  "groundwork:boards:prefs": LATEST,
  "groundwork:whiteboard:parts": { kind: "list", time: null, order: "desc", cap: 40 },
  "groundwork:playground:project": LATEST,
  "groundwork:resume": LATEST,
};

const PREFIXES: [string, MergeStrategy][] = [
  ["jsnotes:code:", LATEST],
  ["groundwork:board:", LATEST],
];

export const SYNC_KEY_PATTERN = /^(jsnotes|groundwork):[A-Za-z0-9:_./-]{1,180}$/;

export const MAX_SYNCED_CHARS = 1_500_000;

export function syncStrategy(key: string): MergeStrategy | null {
  if (!SYNC_KEY_PATTERN.test(key)) return null;
  const exact = EXACT[key];
  if (exact) return exact;
  for (const [prefix, strategy] of PREFIXES) {
    if (key.startsWith(prefix) && key.length > prefix.length) return strategy;
  }
  return null;
}

export function isSyncedKey(key: string): boolean {
  return syncStrategy(key) !== null;
}

type Mark = true | { at: number; reviews: number };

function markTime(mark: Mark): number {
  return mark === true ? 0 : mark.at;
}

function markReviews(mark: Mark): number {
  return mark === true ? 0 : mark.reviews;
}

function isMark(value: unknown): value is Mark {
  if (value === true) return true;
  return (
    isPlainObject(value) &&
    typeof value.at === "number" &&
    Number.isFinite(value.at) &&
    typeof value.reviews === "number" &&
    Number.isFinite(value.reviews)
  );
}

function ownEntries(value: unknown): [string, unknown][] {
  if (!isPlainObject(value)) return [];
  return Object.entries(value).filter(([key]) => key !== "__proto__" && key !== "constructor" && key !== "prototype");
}

function mergeProgress(local: unknown, remote: unknown): unknown {
  const chapters: Record<string, Mark> = {};
  const exercises: Record<string, true> = {};
  for (const side of [local, remote]) {
    if (!isPlainObject(side)) continue;
    for (const [id, mark] of ownEntries(side.chapters)) {
      if (!isMark(mark)) continue;
      const have = chapters[id];
      if (
        have === undefined ||
        markTime(mark) > markTime(have) ||
        (markTime(mark) === markTime(have) && markReviews(mark) > markReviews(have))
      ) {
        chapters[id] = mark;
      }
    }
    for (const [id, solved] of ownEntries(side.exercises)) {
      if (solved === true) exercises[id] = true;
    }
  }
  return { chapters, exercises };
}

function mergeActivity(local: unknown, remote: unknown): unknown {
  const days: Record<string, number> = {};
  for (const side of [local, remote]) {
    for (const [day, count] of ownEntries(side)) {
      if (typeof count !== "number" || !Number.isFinite(count) || count < 1) continue;
      days[day] = Math.max(days[day] ?? 0, count);
    }
  }
  return days;
}

function mergeRecord(older: unknown, newer: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of ownEntries(older)) out[key] = value;
  for (const [key, value] of ownEntries(newer)) out[key] = value;
  return out;
}

function mergeQuiz(older: unknown, newer: unknown): unknown {
  if (!isPlainObject(older) || !isPlainObject(newer) || older.v !== newer.v) return newer;
  return { ...newer, chapters: mergeRecord(older.chapters, newer.chapters) };
}

function itemId(item: unknown): string | null {
  return isPlainObject(item) && typeof item.id === "string" && item.id.length > 0 ? item.id : null;
}

function itemTime(item: unknown, field: string | null): number {
  if (!field || !isPlainObject(item)) return 0;
  const value = item[field];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function mergeList(older: unknown, newer: unknown, strategy: Extract<MergeStrategy, { kind: "list" }>): unknown[] {
  const byId = new Map<string, unknown>();
  const sequence: string[] = [];
  const add = (item: unknown, preferIncoming: boolean) => {
    const id = itemId(item);
    if (id === null) return;
    const have = byId.get(id);
    if (have === undefined) {
      byId.set(id, item);
      sequence.push(id);
      return;
    }
    const incoming = itemTime(item, strategy.time);
    const current = itemTime(have, strategy.time);
    if (incoming > current || (incoming === current && preferIncoming)) byId.set(id, item);
  };
  if (Array.isArray(newer)) newer.forEach((item) => add(item, true));
  if (Array.isArray(older)) older.forEach((item) => add(item, false));
  let items = sequence.map((id) => byId.get(id));
  if (strategy.time) {
    const field = strategy.time;
    items = items.sort((a, b) =>
      strategy.order === "asc" ? itemTime(a, field) - itemTime(b, field) : itemTime(b, field) - itemTime(a, field)
    );
  }
  if (items.length <= strategy.cap) return items;
  return strategy.order === "asc" ? items.slice(-strategy.cap) : items.slice(0, strategy.cap);
}

export interface Side {
  value: unknown;
  at: number;
}

export function mergeValues(strategy: MergeStrategy, local: Side | null, remote: Side | null): unknown {
  if (!local) return remote ? remote.value : undefined;
  if (!remote) return local.value;
  const remoteIsNewer = remote.at > local.at;
  const newer = remoteIsNewer ? remote.value : local.value;
  const older = remoteIsNewer ? local.value : remote.value;
  switch (strategy.kind) {
    case "progress":
      return mergeProgress(local.value, remote.value);
    case "activity":
      return mergeActivity(local.value, remote.value);
    case "quiz":
      return mergeQuiz(older, newer);
    case "record":
      if (!isPlainObject(older) || !isPlainObject(newer)) return newer;
      return mergeRecord(older, newer);
    case "list":
      if (!Array.isArray(older) || !Array.isArray(newer)) return newer;
      return mergeList(older, newer, strategy);
    case "latest":
      return newer;
  }
}

export function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
