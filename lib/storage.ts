import { DEFAULT_EDGE_VOICE } from "@/lib/edge-voices";

export const KEYS = {
  theme: "jsnotes:theme",
  font: "jsnotes:font",
  level: "jsnotes:level",
  progress: "jsnotes:progress",
  code: "jsnotes:code:",
  narration: "jsnotes:narration",
} as const;

export const store = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
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

/**
 * A chapter's progress entry. `true` is the pre-spaced-repetition format
 * and is still read, so nobody loses ticks — it just carries no dates, and
 * such a chapter becomes due for review immediately.
 */
export interface ChapterMark {
  /** when it was last read or reviewed, ms since epoch */
  at: number;
  /** how many times it has come back around */
  reviews: number;
}

export interface ProgressData {
  chapters: Record<string, true | ChapterMark>;
  exercises: Record<string, true>;
}

function readProgress(): ProgressData {
  const saved = store.get<Partial<ProgressData> | null>(KEYS.progress, null);
  const data: ProgressData = {
    chapters: (saved && saved.chapters) || {},
    exercises: (saved && saved.exercises) || {},
  };
  return data;
}

/** Gaps between reviews. Past the last one a chapter is considered learned. */
const REVIEW_GAPS_DAYS = [3, 7, 21, 60, 180];
const DAY = 24 * 60 * 60 * 1000;

function markOf(v: true | ChapterMark): ChapterMark {
  // A legacy `true` has no date, so treat it as read long ago — it surfaces
  // for review on the next visit, which is the safe direction.
  return v === true ? { at: 0, reviews: 0 } : v;
}

/** ms timestamp when this chapter should next be reviewed, or null if learned. */
export function dueAt(v: true | ChapterMark): number | null {
  const m = markOf(v);
  if (m.reviews >= REVIEW_GAPS_DAYS.length) return null;
  return m.at + REVIEW_GAPS_DAYS[m.reviews] * DAY;
}

// Progress is read in several places at once (the sidebar meter, the path
// checklist, the reader's own toggle). They subscribe here so ticking a
// chapter anywhere updates all of them without a reload.
const progressListeners = new Set<() => void>();

function emitProgressChange(): void {
  progressListeners.forEach((fn) => fn());
}

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
    if (done) data.chapters[id] = { at: Date.now(), reviews: 0 };
    else delete data.chapters[id];
    store.set(KEYS.progress, data);
    emitProgressChange();
    return done;
  },

  /** Chapter ids whose next review has come round, oldest-due first. */
  dueForReview(ids: string[], now: number = Date.now()): string[] {
    const { chapters } = readProgress();
    return ids
      .filter((id) => chapters[id])
      .map((id) => ({ id, due: dueAt(chapters[id]) }))
      .filter((r): r is { id: string; due: number } => r.due !== null && r.due <= now)
      .sort((a, b) => a.due - b.due)
      .map((r) => r.id);
  },

  /** Records a successful review and pushes the chapter to the next gap. */
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
    if (solved) data.exercises[id] = true;
    else delete data.exercises[id];
    store.set(KEYS.progress, data);
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

export const code = {
  load(exerciseId: string): string | null {
    return store.get<string | null>(KEYS.code + exerciseId, null);
  },
  save(exerciseId: string, text: string): boolean {
    return store.set(KEYS.code + exerciseId, text);
  },
  clear(exerciseId: string): void {
    store.remove(KEYS.code + exerciseId);
  },
};

export function rememberLevel(level: string): void {
  store.set(KEYS.level, level);
}

export function lastLevel(): string | null {
  return store.get<string | null>(KEYS.level, null);
}

export type ThemeValue = "light" | "dark" | "kraft" | "blueprint" | "sepia" | "forest" | "rose" | "mono" | "lavender";
export type FontValue = "classic" | "marker" | "sketch" | "pen" | "chalk" | "script" | "bold";

export const THEME_ITEMS: { value: ThemeValue; label: string }[] = [
  { value: "light", label: "📄 Paper" },
  { value: "dark", label: "🌙 Night" },
  { value: "kraft", label: "📦 Kraft" },
  { value: "blueprint", label: "📐 Blueprint" },
  { value: "sepia", label: "📜 Sepia" },
  { value: "forest", label: "🌲 Forest" },
  { value: "rose", label: "🌹 Rose" },
  { value: "mono", label: "⬛ Mono" },
  { value: "lavender", label: "💜 Lavender" },
];

export const FONT_ITEMS: { value: FontValue; label: string }[] = [
  { value: "classic", label: "✎ Classic" },
  { value: "marker", label: "✎ Marker" },
  { value: "sketch", label: "✎ Sketch" },
  { value: "pen", label: "✎ Pen" },
  { value: "chalk", label: "✎ Chalk" },
  { value: "script", label: "✎ Script" },
  { value: "bold", label: "✎ Bold" },
];

export function savedTheme(): ThemeValue | null {
  return store.get<ThemeValue | null>(KEYS.theme, null);
}

export function setSavedTheme(theme: ThemeValue): void {
  store.set(KEYS.theme, theme);
}

export function savedFont(): FontValue | null {
  return store.get<FontValue | null>(KEYS.font, null);
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

export function savedNarration(): NarrationSettings {
  const saved = store.get<Partial<NarrationSettings> | null>(KEYS.narration, null);
  return {
    voice: typeof saved?.voice === "string" ? saved.voice : DEFAULT_NARRATION.voice,
    rate: typeof saved?.rate === "number" ? saved.rate : DEFAULT_NARRATION.rate,
    pitch: typeof saved?.pitch === "string" ? saved.pitch : DEFAULT_NARRATION.pitch,
  };
}

export function setSavedNarration(settings: NarrationSettings): void {
  store.set(KEYS.narration, settings);
}
