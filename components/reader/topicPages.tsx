import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReaderShell } from "@/components/reader/ReaderShell";
import { CoverSheet } from "@/components/reader/CoverSheet";
import { ChapterSheet } from "@/components/reader/ChapterSheet";
import { HashRedirect } from "@/components/reader/HashRedirect";
import { chapterMetas, chapters, notesData, notesHref } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { levelsNav, topic } from "@/lib/topics";
import { plural } from "@/lib/format";

export function TopicCoverPage({ topicId }: { topicId: string }) {
  const data = notesData(topicId);
  const basePath = notesHref(topicId);

  return (
    <ReaderShell
      topicId={topicId}
      levels={levelsNav(topicId)}
      chapters={chapterMetas(topicId)}
      basePath={basePath}
      activeId={null}
    >
      <HashRedirect basePath={basePath} />
      <CoverSheet data={data} basePath={basePath} topicId={topicId} />
    </ReaderShell>
  );
}

export function topicChapterParams(topicId: string) {
  return chapters(topicId).map((ch) => ({ chapter: ch.id }));
}

/** The cover of a topic: what it covers, how much of it exists, and whether a
 *  crawler should bother yet. */
export function topicCoverMetadata(topicId: string): Metadata {
  const t = topic(topicId);
  const data = notesData(topicId);
  const all = chapters(topicId);
  const written = all.filter((c) => c.ready).length;
  const name = t?.name || data.meta.title;

  const description = written
    ? `${data.meta.subtitle} ${plural(written, "chapter")} written, free to read.`
    : `${data.meta.subtitle} Still an outline — ${plural(all.length, "chapter")} planned.`;

  return pageMetadata({
    title: name,
    description: description.trim(),
    path: notesHref(topicId),
    // An outline is a syllabus and nothing else. It stays readable and linked;
    // it just stops competing in search with the topics that are written.
    index: written > 0,
  });
}

export function topicChapterMetadata(topicId: string, chapterId: string): Metadata {
  const list = chapters(topicId);
  const ch = list.find((c) => c.id === chapterId);
  if (!ch) return {};

  const t = topic(topicId);
  const data = notesData(topicId);
  const name = t?.name || data.meta.title;
  const description = ch.subtitle || `${ch.title} — part of ${data.meta.title}.`;

  return pageMetadata({
    title: `${ch.title} — ${name}`,
    description,
    path: `${notesHref(topicId)}/${ch.id}`,
    type: "article",
    // A chapter that is still a syllabus stub has a heading and a bullet list.
    // It is a real page for anyone following the map, and a thin one for a
    // crawler, so it stays linked and asks not to be indexed.
    index: ch.ready,
    authors: data.meta.author ? [data.meta.author] : undefined,
  });
}

export function TopicChapterPage({ topicId, chapterId }: { topicId: string; chapterId: string }) {
  const list = chapters(topicId);
  const index = list.findIndex((c) => c.id === chapterId);
  if (index === -1) notFound();

  const chapter = list[index];
  const prev = list[index - 1];
  const next = list[index + 1];
  const basePath = notesHref(topicId);

  return (
    <ReaderShell
      topicId={topicId}
      levels={levelsNav(topicId)}
      chapters={chapterMetas(topicId)}
      basePath={basePath}
      activeId={chapter.id}
    >
      <ChapterSheet
        chapter={chapter}
        topicId={topicId}
        basePath={basePath}
        prev={prev && { id: prev.id, short: prev.short }}
        next={next && { id: next.id, short: next.short }}
      />
    </ReaderShell>
  );
}
