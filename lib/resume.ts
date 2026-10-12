import { store } from "@/lib/storage";

export const RESUME_KEY = "groundwork:resume";

export interface Resume {
  v: 1;
  topic: string;
  topicName: string;
  chapter: string;
  num: string;
  title: string;
  href: string;
  index: number;
  total: number;
  at: number;
}

const isText = (value: unknown): value is string => typeof value === "string" && value.length > 0;
const isCount = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value > 0;

export function parseResume(value: unknown): Resume | null {
  if (!value || typeof value !== "object") return null;
  const saved = value as Record<string, unknown>;
  if (saved.v !== 1) return null;
  const { topic, topicName, chapter, num, title, href, index, total, at } = saved;
  if (![topic, topicName, chapter, num, title, href].every(isText)) return null;
  if (!isCount(index) || !isCount(total) || index > total) return null;
  if (typeof at !== "number" || !Number.isFinite(at)) return null;
  if (!(href as string).startsWith("/") || (href as string).startsWith("//")) return null;
  return {
    v: 1,
    topic: topic as string,
    topicName: topicName as string,
    chapter: chapter as string,
    num: num as string,
    title: title as string,
    href: href as string,
    index,
    total,
    at,
  };
}

export function readResume(): Resume | null {
  return parseResume(store.get<unknown>(RESUME_KEY, null));
}

export function writeResume(visit: Omit<Resume, "v" | "at">, at: number = Date.now()): void {
  store.set(RESUME_KEY, { v: 1, ...visit, at });
}

const DAY = 24 * 60 * 60 * 1000;

export function sinceLabel(at: number, now: number = Date.now()): string {
  const days = Math.floor((now - at) / DAY);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}
