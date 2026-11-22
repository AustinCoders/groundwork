import type { YearMonth } from "./types";

export const METRIC =
  /(?:\bfrom\s+[$₹]?\d[\w.,]*(?:\s+(?:ms|seconds|sec|s|minutes|mins?|hours|hrs?|days|weeks|percent|%))?\s+to\s+[$₹]?\d[\w.,]*(?:\s+(?:ms|seconds|sec|s|minutes|mins?|hours|hrs?|days|weeks|percent|%))?|[$₹€£]\s?\d[\d,.]*\s?(?:k|m|mn|bn|cr|crore|lakhs?|l)?\b|\b\d[\d,.]*\s?(?:%|x\b|×|ms\b|s\b|sec\b|seconds\b|mins?\b|minutes\b|hrs?\b|hours\b|days\b|weeks\b|months\b|k\b|million\b|billion\b|lakhs?\b|crores?\b|cr\b|users\b|customers\b|requests\b|rps\b|qps\b|tb\b|gb\b|mb\b|people\b|developers\b|engineers\b|teams\b|services\b|pages\b|clients\b|businesses\b|merchants\b|orders\b|transactions\b))/i;

export const WEAK_OPENER =
  /^(?:was\s+)?(?:responsible\s+for|worked\s+on|working\s+on|helped(?:\s+in)?|assisted(?:\s+in|\s+with)?|involved\s+in|participated\s+in|duties\s+included|handled|tasked\s+with|part\s+of)\b/i;

export const OWNER_VERB =
  /^(?:led|built|designed|architected|migrated|implemented|created|developed|optimized|optimised|owned|launched|scaled|automated|rewrote|introduced|reduced|cut|improved|shipped|set\s+up|drove|delivered|refactored|integrated)\b/i;

export function metricIn(text: string): string | null {
  const match = text.match(METRIC);
  return match ? match[0].trim().replace(/[.,;:]+$/, "") : null;
}

export function hashId(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function clip(text: string, words: number): string {
  const parts = text.split(/\s+/);
  return parts.length <= words ? text : `${parts.slice(0, words).join(" ")}…`;
}

export function lowerFirst(text: string): string {
  return text && /^[A-Z][a-z]/.test(text) ? text[0].toLowerCase() + text.slice(1) : text;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthLabel(value: YearMonth): string {
  return value.m > 0 ? `${MONTH_NAMES[value.m - 1]} ${value.y}` : String(value.y);
}

const TITLE_WORD =
  /\b(?:engineer|developer|intern|lead|manager|architect|analyst|consultant|sde|programmer|designer|scientist|head|director|founder|associate|specialist|administrator|tester|qa)\b/i;

export function orgOf(heading: string): string {
  const parts = heading
    .replace(/\s*\((?:remote|hybrid|on-?site|contract|part[\s-]?time|full[\s-]?time|freelance)\)/gi, "")
    .split(/\s+(?:\||·|—|–|-|at|@)\s+|,\s+(?=[A-Z])/)
    .map((part) => part.trim())
    .filter(Boolean);
  const org = parts.find((part) => !TITLE_WORD.test(part) && part.split(/\s+/).length <= 6);
  return org ?? parts[0] ?? heading;
}

export function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
