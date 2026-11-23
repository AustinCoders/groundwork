import { isPlainObject } from "@/lib/storage";
import type { Extracted } from "./extract";

const KEY = "gw:resume-pending";

export const PENDING_MINUTES = 30;

const MAX_LINES = 1500;
const MAX_LINE = 600;
const MAX_LINKS = 40;

export interface PendingResume {
  title: string;
  read: Extracted;
  at: number;
}

function strings(value: unknown, limit: number, size: number): string[] | null {
  if (!Array.isArray(value)) return null;
  return value
    .slice(0, limit)
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.slice(0, size));
}

export function savePending(title: string, read: Extracted): boolean {
  const record: PendingResume = {
    title: title.slice(0, 120),
    read: {
      lines: read.lines.slice(0, MAX_LINES).map((line) => line.slice(0, MAX_LINE)),
      links: read.links.slice(0, MAX_LINKS),
      pages: read.pages,
      wideGaps: read.wideGaps,
    },
    at: Date.now(),
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearPending(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    return;
  }
}

export function readPending(now = Date.now()): PendingResume | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    clearPending();
    return null;
  }
  if (!isPlainObject(value) || !isPlainObject(value.read) || typeof value.at !== "number") {
    clearPending();
    return null;
  }
  if (now - value.at > PENDING_MINUTES * 60_000 || value.at > now + 60_000) {
    clearPending();
    return null;
  }
  const lines = strings(value.read.lines, MAX_LINES, MAX_LINE);
  const links = strings(value.read.links, MAX_LINKS, MAX_LINE) ?? [];
  const pages = Number(value.read.pages);
  const wideGaps = Number(value.read.wideGaps);
  if (!lines || lines.length === 0) {
    clearPending();
    return null;
  }
  return {
    title: typeof value.title === "string" && value.title.trim() ? value.title.slice(0, 120) : "Resume",
    read: {
      lines,
      links,
      pages: Number.isFinite(pages) ? Math.max(1, Math.min(10, Math.round(pages))) : 1,
      wideGaps: Number.isFinite(wideGaps) ? Math.max(0, Math.round(wideGaps)) : 0,
    },
    at: value.at,
  };
}
