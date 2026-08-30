import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReaderShell } from "@/components/reader/ReaderShell";
import { CoverSheet } from "@/components/reader/CoverSheet";
import { ChapterSheet } from "@/components/reader/ChapterSheet";
import { HashRedirect } from "@/components/reader/HashRedirect";
import { chapterMetas, chapters, notesData, notesHref } from "@/lib/content";

/**
 * Every topic's two routes are identical apart from the topic id, so they
 * are built here once. Each app/<topic>/… file is a thin call into these.
 */

export function TopicCoverPage({ topicId }: { topicId: string }) {
  const data = notesData(topicId);
  const basePath = notesHref(topicId);

  return (
    <ReaderShell topicId={topicId} chapters={chapterMetas(topicId)} basePath={basePath} activeId={null}>
      {/* Old links were /topic#chapter-id; send them to the real route. */}
      <HashRedirect basePath={basePath} />
      <CoverSheet data={data} basePath={basePath} />
    </ReaderShell>
  );
}

export function topicChapterParams(topicId: string) {
  return chapters(topicId).map((ch) => ({ chapter: ch.id }));
}

export function topicChapterMetadata(topicId: string, chapterId: string): Metadata {
  const list = chapters(topicId);
  const ch = list.find((c) => c.id === chapterId);
  if (!ch) return {};

  const data = notesData(topicId);
  const description = ch.subtitle || `${ch.title} — part of ${data.meta.title}.`;

  return {
    title: `${ch.title} — ${data.meta.title}`,
    description,
    alternates: { canonical: `${notesHref(topicId)}/${ch.id}` },
    openGraph: {
      type: "article",
      title: `${ch.title} — ${data.meta.title}`,
      description,
      url: `${notesHref(topicId)}/${ch.id}`,
    },
  };
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
    <ReaderShell topicId={topicId} chapters={chapterMetas(topicId)} basePath={basePath} activeId={chapter.id}>
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
