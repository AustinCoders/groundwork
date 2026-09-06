import { chapterMetas, notesHref, topic as findTopic, topics } from "@/lib/content";

export const dynamic = "force-static";

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
