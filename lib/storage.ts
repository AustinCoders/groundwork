import { DEFAULT_EDGE_VOICE } from "@/lib/edge-voices";

export const KEYS = {
  theme: "jsnotes:theme",
  font: "jsnotes:font",
  level: "jsnotes:level",
  progress: "jsnotes:progress",
  code: "jsnotes:code:",
  narration: "jsnotes:narration",
  activity: "jsnotes:activity",
  soundEnabled: "jsnotes:sound-enabled",
} as const;

export const MAX_STORED_CHARS = 4_000_000;

export const store = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw.length > MAX_STORED_CHARS) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown): boolean {
    if (typeof window === "undefined") return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

const SAVED_PREFIXES = ["jsnotes:", "groundwork:"];
const KEPT_PREFIXES = ["groundwork:board"];

export function isSavedDataKey(key: string): boolean {
  return SAVED_PREFIXES.some((p) => key.startsWith(p)) && !KEPT_PREFIXES.some((p) => key.startsWith(p));
}

export function clearSavedData(): number {
  if (typeof window === "undefined") return 0;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null && isSavedDataKey(key)) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
    return keys.length;
  } catch {
    return 0;
  }
}

export interface ChapterMark {
  at: number;
  reviews: number;
}

export interface ProgressData {
  chapters: Record<string, true | ChapterMark>;
  exercises: Record<string, true>;
}

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAY_COUNT = 100000;
const MAX_ENTRIES = 5000;
const MAX_ID_LENGTH = 200;
const MAX_REVIEWS = 1000;

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function entriesOf(value: unknown): [string, unknown][] {
  if (!isPlainObject(value)) return [];
  return Object.entries(value)
    .filter(([key]) => key !== "__proto__" && key.length > 0 && key.length <= MAX_ID_LENGTH)
    .slice(0, MAX_ENTRIES);
}

function sanitizeMark(value: unknown): true | ChapterMark | null {
  if (value === true) return true;
  if (!isPlainObject(value)) return null;
  const { at, reviews } = value;
  if (typeof at !== "number" || !Number.isFinite(at) || at < 0) return null;
  if (at === 0) return true;
  const count = typeof reviews === "number" && Number.isFinite(reviews) && reviews >= 0 ? Math.floor(reviews) : 0;
  return { at, reviews: Math.min(count, MAX_REVIEWS) };
}

export function sanitizeProgress(value: unknown): ProgressData {
  const data: ProgressData = { chapters: {}, exercises: {} };
  if (!isPlainObject(value)) return data;
  for (const [id, mark] of entriesOf(value.chapters)) {
    const clean = sanitizeMark(mark);
    if (clean !== null) data.chapters[id] = clean;
  }
  for (const [id, solved] of entriesOf(value.exercises)) {
    if (solved === true) data.exercises[id] = true;
  }
  return data;
}

export function sanitizeActivity(value: unknown): Record<string, number> {
  const log: Record<string, number> = {};
  for (const [day, count] of entriesOf(value)) {
    if (!DAY_KEY.test(day)) continue;
    if (typeof count !== "number" || !Number.isFinite(count) || count < 1) continue;
    log[day] = Math.min(Math.floor(count), MAX_DAY_COUNT);
  }
  return log;
}

function readProgress(): ProgressData {
  return sanitizeProgress(store.get<unknown>(KEYS.progress, null));
}

function readActivity(): Record<string, number> {
  return sanitizeActivity(store.get<unknown>(KEYS.activity, null));
}

export const REVIEW_GAPS_DAYS = [3, 7, 21, 60, 180];
const DAY = 24 * 60 * 60 * 1000;

function markOf(v: true | ChapterMark): ChapterMark {
  return v === true ? { at: 0, reviews: 0 } : v;
}

export function dueAt(v: true | ChapterMark, now: number = Date.now()): number | null {
  if (v === true) return now;
  const m = markOf(v);
  if (m.reviews >= REVIEW_GAPS_DAYS.length) return null;
  return m.at + REVIEW_GAPS_DAYS[m.reviews] * DAY;
}

const progressListeners = new Set<() => void>();

function emitProgressChange(): void {
  progressListeners.forEach((fn) => fn());
}

export function dayKey(date: number = Date.now()): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function recordActivity(): void {
  const data = readActivity();
  const key = dayKey();
  data[key] = (data[key] || 0) + 1;
  store.set(KEYS.activity, data);
  emitProgressChange();
}

export const activity = {
  all(): Record<string, number> {
    return readActivity();
  },
  subscribe(listener: () => void): () => void {
    progressListeners.add(listener);
    return () => progressListeners.delete(listener);
  },
};

export const progress = {
  all: readProgress,

  subscribe(listener: () => void): () => void {
    progressListeners.add(listener);
    return () => progressListeners.delete(listener);
  },

  isChapterDone(id: string): boolean {
    return Boolean(readProgress().chapters[id]);
  },

  setChapterDone(id: string, done: boolean): boolean {
    const data = readProgress();
    const wasDone = Boolean(data.chapters[id]);
    if (done) data.chapters[id] = { at: Date.now(), reviews: 0 };
    else delete data.chapters[id];
    store.set(KEYS.progress, data);
    if (done && !wasDone) recordActivity();
    emitProgressChange();
    return done;
  },

  dueForReview(ids: string[], now: number = Date.now()): string[] {
    const { chapters } = readProgress();
    return ids
      .filter((id) => chapters[id])
      .map((id) => ({ id, due: dueAt(chapters[id], now) }))
      .filter((r): r is { id: string; due: number } => r.due !== null && r.due <= now)
      .sort((a, b) => a.due - b.due)
      .map((r) => r.id);
  },

  markReviewed(id: string): void {
    const data = readProgress();
    const cur = data.chapters[id];
    if (!cur) return;
    const m = cur === true ? { at: 0, reviews: 0 } : cur;
    data.chapters[id] = { at: Date.now(), reviews: m.reviews + 1 };
    store.set(KEYS.progress, data);
    emitProgressChange();
  },

  isExerciseSolved(id: string): boolean {
    return readProgress().exercises[id] === true;
  },

  setExerciseSolved(id: string, solved: boolean): boolean {
    const data = readProgress();
    const wasSolved = data.exercises[id] === true;
    if (solved) data.exercises[id] = true;
    else delete data.exercises[id];
    store.set(KEYS.progress, data);
    if (solved && !wasSolved) recordActivity();
    emitProgressChange();
    return solved;
  },

  reset(): void {
    store.remove(KEYS.progress);
    emitProgressChange();
  },

  countDone(chapters: { id: string }[]): number {
    const data = readProgress();
    return chapters.filter((ch) => Boolean(data.chapters[ch.id])).length;
  },
};

function codeKey(exerciseId: string, language?: string): string {
  return KEYS.code + exerciseId + (!language || language === "javascript" ? "" : ":" + language);
}

export const code = {
  load(exerciseId: string, language?: string): string | null {
    const saved = store.get<unknown>(codeKey(exerciseId, language), null);
    return typeof saved === "string" ? saved : null;
  },
  save(exerciseId: string, text: string, language?: string): boolean {
    return store.set(codeKey(exerciseId, language), text);
  },
  clear(exerciseId: string, language?: string): void {
    store.remove(codeKey(exerciseId, language));
  },
};

export function rememberLevel(level: string): void {
  store.set(KEYS.level, level);
}

const LEVEL_IDS = ["beginner", "intermediate", "advanced"];

export function lastLevel(): string | null {
  const saved = store.get<unknown>(KEYS.level, null);
  return typeof saved === "string" && LEVEL_IDS.includes(saved) ? saved : null;
}

export const THEME_ITEMS = [
  { value: "light", label: "📄 Paper" },
  { value: "dark", label: "🌙 Night" },
  { value: "kraft", label: "📦 Kraft" },
  { value: "blueprint", label: "📐 Blueprint" },
  { value: "sepia", label: "📜 Sepia" },
  { value: "forest", label: "🌲 Forest" },
  { value: "rose", label: "🌹 Rose" },
  { value: "mono", label: "⬛ Mono" },
  { value: "lavender", label: "💜 Lavender" },
] as const satisfies readonly { value: string; label: string }[];

export type ThemeValue = (typeof THEME_ITEMS)[number]["value"];
export type FontValue = "classic" | "marker" | "sketch" | "pen" | "chalk" | "script" | "serif" | "roboto";

export const FONT_ITEMS: { value: FontValue; label: string }[] = [
  { value: "classic", label: "✎ Classic" },
  { value: "marker", label: "✎ Marker" },
  { value: "sketch", label: "✎ Sketch" },
  { value: "pen", label: "✎ Pen" },
  { value: "chalk", label: "✎ Chalk" },
  { value: "script", label: "✎ Script" },
  { value: "serif", label: "Aa Reading" },
  { value: "roboto", label: "Aa Roboto" },
];

export function savedTheme(): ThemeValue | null {
  const saved = store.get<unknown>(KEYS.theme, null);
  return THEME_ITEMS.some((item) => item.value === saved) ? (saved as ThemeValue) : null;
}

export function setSavedTheme(theme: ThemeValue): void {
  store.set(KEYS.theme, theme);
}

export function savedFont(): FontValue | null {
  const saved = store.get<unknown>(KEYS.font, null);
  return FONT_ITEMS.some((item) => item.value === saved) ? (saved as FontValue) : null;
}

export function setSavedFont(font: FontValue): void {
  store.set(KEYS.font, font);
}

export interface NarrationSettings {
  voice: string;
  rate: number;
  pitch: string;
}

const DEFAULT_NARRATION: NarrationSettings = { voice: DEFAULT_EDGE_VOICE, rate: 0.94, pitch: "0%" };

const PITCH = /^[+-]?\d{1,3}%$/;
const VOICE = /^[\w.-]{1,80}$/;

export function savedNarration(): NarrationSettings {
  const saved = store.get<unknown>(KEYS.narration, null);
  const loose = isPlainObject(saved) ? saved : {};
  const { voice, rate, pitch } = loose;
  return {
    voice: typeof voice === "string" && VOICE.test(voice) ? voice : DEFAULT_NARRATION.voice,
    rate: typeof rate === "number" && Number.isFinite(rate) && rate >= 0.5 && rate <= 2 ? rate : DEFAULT_NARRATION.rate,
    pitch: typeof pitch === "string" && PITCH.test(pitch) ? pitch : DEFAULT_NARRATION.pitch,
  };
}

export function setSavedNarration(settings: NarrationSettings): void {
  store.set(KEYS.narration, settings);
}
