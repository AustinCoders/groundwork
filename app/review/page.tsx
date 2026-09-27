import type { Metadata } from "next";
import { ReviewView, type ReviewChapter } from "@/app/review/ReviewView";
import { GIT_CHAPTERS } from "@/content/git-body";
import { chapterMetas, notesHref, topics } from "@/lib/content";
import { GIT_PROGRESS_PREFIX } from "@/lib/gitSeries";
import { bookRounds } from "@/lib/interviewBook";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Review",
  description: "Chapters you read a while ago, resurfaced before you forget them.",
  path: "/review",
  index: false,
});

export default function ReviewPage() {
  const notes: ReviewChapter[] = topics()
    .filter((t) => t.levels)
    .flatMap((t) => {
      const base = notesHref(t.id);
      return chapterMetas(t.id)
        .filter((ch) => ch.ready)
        .map((ch) => ({
          id: ch.id,
          num: ch.num,
          title: ch.title,
          subtitle: ch.subtitle ?? "",
          topicName: t.name,
          href: `${base}/${ch.id}`,
        }));
    });
  const git: ReviewChapter[] = GIT_CHAPTERS.map((s) => ({
    id: GIT_PROGRESS_PREFIX + s.id,
    num: s.num,
    title: s.title,
    subtitle: s.subtitle ?? "",
    topicName: "Git",
    href: `/git/${s.id}`,
  }));
  const interview: ReviewChapter[] = bookRounds().map((r) => ({
    id: r.id,
    num: r.code,
    title: r.title,
    subtitle: r.meta.find(([k]) => k === "Decides")?.[1]?.replace(/<[^>]+>/g, "") ?? "",
    topicName: "Interview book",
    href: `/interview/${r.id}`,
  }));

  return <ReviewView chapters={[...notes, ...git, ...interview]} />;
}
