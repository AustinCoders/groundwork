import { dueAt, type ChapterMark } from "@/lib/storage";

const DAY = 24 * 60 * 60 * 1000;

export function reviewNote(mark: true | ChapterMark | undefined, now: number): string | null {
  if (!mark) return null;
  const due = dueAt(mark);
  if (due === null) return null;
  if (due <= now) return "It is due for review now.";
  const days = Math.ceil((due - now) / DAY);
  return `It comes back for review in ${days} ${days === 1 ? "day" : "days"}.`;
}
