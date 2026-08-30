import type { Metadata } from "next";
import { ReviewView, type ReviewChapter } from "@/app/review/ReviewView";
import { chapterMetas, notesHref, topics } from "@/lib/content";

export const metadata: Metadata = {
  title: "Review — spaced repetition — notes",
  description: "Chapters you read a while ago, resurfaced before you forget them.",
};

export default function ReviewPage() {
  const chapters: ReviewChapter[] = topics()
    .filter((t) => t.levels)
    .flatMap((t) => {
      const base = notesHref(t.id);
      return chapterMetas(t.id)
        .filter((ch) => ch.ready)
        .map((ch) => ({
          id: ch.id,
          num: ch.num,
          short: ch.short,
          title: ch.title,
          subtitle: ch.subtitle,
          topicId: t.id,
          topicName: t.name,
          href: `${base}/${ch.id}`,
        }));
    });

  return <ReviewView chapters={chapters} />;
}
