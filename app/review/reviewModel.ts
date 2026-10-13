import { plural } from "@/lib/format";
import { dueAt, REVIEW_GAPS_DAYS, type ChapterMark } from "@/lib/storage";

export interface ReviewChapter {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  topicName: string;
  href: string;
}

export interface ReviewRow {
  ch: ReviewChapter;
  mark: ChapterMark;
  due: number | null;
}

export interface ReviewDay {
  start: number;
  rows: ReviewRow[];
}

const MAX_OVERDUE_DAYS = 365;

export const DAY = 24 * 60 * 60 * 1000;

export function markOf(v: true | ChapterMark): ChapterMark {
  return v === true ? { at: 0, reviews: 0 } : v;
}

export function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function thisMinute(): number {
  return Math.floor(Date.now() / 60000) * 60000;
}

export function daysBetween(from: number, to: number): number {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY);
}

export function gapLabel(days: number): string {
  if (days % 30 === 0) return plural(days / 30, "month");
  if (days % 7 === 0) return plural(days / 7, "week");
  return plural(days, "day");
}

export const GAP_LABELS = REVIEW_GAPS_DAYS.map(gapLabel);

export function shortGap(days: number): string {
  if (days % 30 === 0) return `${days / 30}mo`;
  if (days % 7 === 0) return `${days / 7}w`;
  return `${days}d`;
}

export const SHORT_GAPS = REVIEW_GAPS_DAYS.map(shortGap);

export function lateness(due: number, now: number): string {
  const days = daysBetween(due, now);
  if (days <= 0) return "due today";
  if (days > MAX_OVERDUE_DAYS) return "over a year overdue";
  return `${plural(days, "day")} overdue`;
}

export function whenLabel(due: number, now: number): string {
  const days = daysBetween(now, due);
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return new Date(due).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function dayHeading(start: number, now: number): string {
  const days = daysBetween(now, start);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return new Date(start).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
}

export function agoLabel(at: number, now: number): string {
  const days = daysBetween(at, now);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  if (days > 730) return "over two years ago";
  return `${Math.round(days / 30)} months ago`;
}

export function buildRows(
  chapters: ReviewChapter[],
  marks: Record<string, true | ChapterMark>,
  now: number
): { rows: ReviewRow[]; due: ReviewRow[]; upcoming: ReviewRow[]; kept: number; reviewed: ReviewRow[] } {
  const rows: ReviewRow[] = chapters
    .filter((ch) => marks[ch.id])
    .map((ch) => ({ ch, mark: markOf(marks[ch.id]), due: dueAt(marks[ch.id], now) }));
  return {
    rows,
    kept: rows.filter((r) => r.due === null).length,
    due: rows.filter((r) => r.due !== null && r.due <= now).sort((a, b) => a.due! - b.due!),
    upcoming: rows.filter((r) => r.due !== null && r.due > now).sort((a, b) => a.due! - b.due!),
    reviewed: rows.filter((r) => r.mark.reviews > 0).sort((a, b) => b.mark.at - a.mark.at),
  };
}

export function groupByDay(rows: ReviewRow[]): ReviewDay[] {
  const days: ReviewDay[] = [];
  for (const row of rows) {
    const start = startOfDay(row.due!);
    const last = days[days.length - 1];
    if (last && last.start === start) last.rows.push(row);
    else days.push({ start, rows: [row] });
  }
  return days;
}

export function forecast(dueCount: number, upcoming: ReviewRow[], now: number, span = 14) {
  const today = startOfDay(now);
  const days = Array.from({ length: span }, (_, k) => ({ t: today + k * DAY, n: 0 }));
  days[0].n = dueCount;
  for (const row of upcoming) {
    const k = daysBetween(today, row.due!);
    if (k >= 0 && k < span) days[k].n++;
  }
  return days;
}

export function minutesFor(count: number): number {
  return Math.max(2, count * 3);
}
