import { topicStats } from "@/lib/topicStats";

const DSA_TOPIC = "dsa";
const COUNT_TOKEN = /\{\{(dsa\.chapters|dsa\.exercises)\}\}/g;

let counts: Record<string, string> | null = null;

function dsaCounts(): Record<string, string> {
  if (!counts) {
    const stat = topicStats()[DSA_TOPIC];
    counts = { "dsa.chapters": String(stat.written), "dsa.exercises": String(stat.exercises) };
  }
  return counts;
}

export function fillCounts<T>(value: T): T {
  if (typeof value === "string") {
    const filled = value.replace(COUNT_TOKEN, (_token, key: string) => dsaCounts()[key]);
    return filled as T;
  }
  if (Array.isArray(value)) return value.map(fillCounts) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, fillCounts(inner)])) as T;
  }
  return value;
}
