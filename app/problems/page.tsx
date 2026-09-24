import type { Metadata } from "next";
import { ProblemsView, type ProblemRow, type CategoryGroup } from "@/app/problems/ProblemsView";
import { chapterMetas, exercises, notesHref, topics } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "All problems",
    description: `${exercises().length} runnable interview problems, grouped by the pattern each one teaches. Write the solution in the browser and check it against real tests.`,
    path: "/problems",
  });
}

export default function ProblemsPage() {
  const all = exercises();

  const chapterInfo: Record<string, { num: string; title: string; topicId: string; topicName: string; href: string }> =
    {};
  topics()
    .filter((t) => t.levels)
    .forEach((t) => {
      const base = notesHref(t.id);
      chapterMetas(t.id).forEach((ch) => {
        chapterInfo[ch.id] = {
          num: ch.num,
          title: ch.title,
          topicId: t.id,
          topicName: t.name,
          href: `${base}/${ch.id}`,
        };
      });
    });

  const groups: CategoryGroup[] = [];
  const byChapter = new Map<string, ProblemRow[]>();
  for (const ex of all) {
    if (!byChapter.has(ex.chapter)) byChapter.set(ex.chapter, []);
    byChapter.get(ex.chapter)!.push({
      id: ex.id,
      title: ex.title,
      level: ex.level,
      tests: ex.tests.length,
      chapter: ex.chapter,
    });
  }

  topics()
    .filter((t) => t.levels)
    .forEach((t) => {
      chapterMetas(t.id).forEach((ch) => {
        const rows = byChapter.get(ch.id);
        if (!rows || !rows.length) return;
        const info = chapterInfo[ch.id];
        groups.push({
          chapter: ch.id,
          num: info.num,
          title: info.title,
          topicId: t.id,
          topicName: t.name,
          chapterHref: info.href,
          problems: rows,
        });
      });
    });

  return <ProblemsView groups={groups} total={all.length} />;
}
