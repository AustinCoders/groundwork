import { isPlainObject } from "@/lib/storage";
import type { Extracted } from "./extract";
import { JD_LIMIT } from "./limits";

export const MAX_BODY_BYTES = 200_000;
export const MAX_LINES = 1500;
export const MAX_LINE = 600;
export const MAX_LINKS = 40;
export const MAX_LINK = 300;
export const MAX_JD = JD_LIMIT;

export interface AnalyzeRequest {
  read: Extracted;
  jd: string;
}

export type Checked = { ok: true; value: AnalyzeRequest } | { ok: false; error: string };

function textList(value: unknown, limit: number, size: number): string[] | null {
  if (!Array.isArray(value) || value.length > limit) return null;
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || item.length > size) return null;
    out.push(item);
  }
  return out;
}

function whole(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max ? value : null;
}

function cleanLinks(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((link): link is string => typeof link === "string" && link.length <= MAX_LINK && /^https?:\/\//i.test(link))
    .slice(0, MAX_LINKS);
}

export function trimRead(read: Extracted): Extracted {
  return {
    lines: read.lines.slice(0, MAX_LINES).map((line) => line.slice(0, MAX_LINE)),
    links: cleanLinks(read.links),
    pages: Math.max(1, Math.min(10, Math.round(read.pages) || 1)),
    wideGaps: Math.max(0, Math.min(100_000, Math.round(read.wideGaps) || 0)),
  };
}

export function checkAnalyzeRequest(value: unknown): Checked {
  if (!isPlainObject(value) || !isPlainObject(value.read))
    return { ok: false, error: "The request is not in the expected shape." };
  const lines = textList(value.read.lines, MAX_LINES, MAX_LINE);
  if (!lines || lines.every((line) => !line.trim())) return { ok: false, error: "No resume text was sent." };
  const links = cleanLinks(value.read.links);
  const pages = whole(value.read.pages, 1, 10);
  const wideGaps = whole(value.read.wideGaps ?? 0, 0, 100_000);
  if (pages === null || wideGaps === null) return { ok: false, error: "The page details are not valid." };
  const jd = value.jd ?? "";
  if (typeof jd !== "string" || jd.length > MAX_JD) return { ok: false, error: "The job description is too long." };
  return { ok: true, value: { read: { lines, links, pages, wideGaps }, jd } };
}

export type RunReason = "signed_out" | "second_step" | "unconfirmed" | "limit" | "busy";

export const RUN_MESSAGE: Record<RunReason, string> = {
  signed_out: "Sign in to see the result.",
  second_step: "Finish the second sign-in step first, then try again.",
  unconfirmed: "Confirm your email address first. The link is in your inbox.",
  limit: "You have used all 40 checks for today. Each one frees up 24 hours after it ran, so try again later.",
  busy: "That was a lot of checks in a minute. Wait a minute and try again.",
};

export function isRunReason(value: unknown): value is RunReason {
  return typeof value === "string" && value in RUN_MESSAGE;
}
