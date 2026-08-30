import { chapterMetas, notesHref, topic as findTopic, topics } from "@/lib/content";

export const dynamic = "force-static";

/**
 * Lightweight index of every chapter on the site, used to surface matches
 * from topics you are not currently reading.
 *
 * Deliberately titles-and-subtitles only. The per-topic full-text indexes
 * are already 300-400 KB each; concatenating them would mean downloading
 * several megabytes to run one search, and it would grow with every chapter
 * written. So: full text for the topic you're in, titles everywhere else.
 */
export function GET() {
  const rows = topics()
    .filter((t) => t.levels)
    .flatMap((t) => {
      const base = notesHref(t.id);
      const topicName = findTopic(t.id)?.name ?? t.id;
      return chapterMetas(t.id)
        .filter((ch) => ch.ready)
        .map((ch) => ({
          id: ch.id,
          topicId: t.id,
          topicName,
          href: `${base}/${ch.id}`,
          num: ch.num,
          short: ch.short,
          text: `${ch.title} ${ch.short} ${ch.subtitle} ${topicName}`.toLowerCase(),
        }));
    });

  return Response.json(rows);
}
