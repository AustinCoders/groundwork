import { GIT_CHAPTERS, GIT_PARTS } from "@/content/git-body";
import { htmlMinutes } from "@/lib/content";
import type { SeriesCard } from "@/components/series/ChapterView";

export const GIT_BASE = "/git";
export const GIT_PROGRESS_PREFIX = "git-";

export function gitCards(): SeriesCard[] {
  return GIT_CHAPTERS.map((s) => ({
    id: s.id,
    num: s.num,
    title: s.title,
    short: s.short,
    subtitle: s.subtitle,
    level: s.part,
    minutes: Math.max(1, htmlMinutes(s.body)),
  }));
}

export function gitFacts(): [string, string][] {
  const all = GIT_CHAPTERS.map((s) => s.body).join("\n");
  const diagrams = (all.match(/<svg[^>]*class="dg"/g) ?? []).length + 1;
  const examples = (all.match(/<pre/g) ?? []).length;
  const tables = (all.match(/<table/g) ?? []).length;
  return [
    [String(GIT_CHAPTERS.length), "chapters"],
    [String(GIT_PARTS.length), "parts, fresher to senior"],
    [String(diagrams), "diagrams"],
    [String(examples), "command examples"],
    [String(tables), "reference tables"],
  ];
}
