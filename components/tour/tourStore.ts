export const TOUR_KEY = "groundwork:tour";

export interface TourState {
  v: 1;
  seen: true;
  at: number;
}

export function parseTour(value: unknown): TourState | null {
  if (!value || typeof value !== "object") return null;
  const saved = value as Record<string, unknown>;
  if (saved.v !== 1 || saved.seen !== true) return null;
  if (typeof saved.at !== "number" || !Number.isFinite(saved.at)) return null;
  return { v: 1, seen: true, at: saved.at };
}

export function readTour(): TourState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOUR_KEY);
    return raw === null ? null : parseTour(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function rememberTourSeen(at: number = Date.now()): void {
  if (readTour()) return;
  try {
    localStorage.setItem(TOUR_KEY, JSON.stringify({ v: 1, seen: true, at }));
  } catch {}
}
