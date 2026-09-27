import type { Metadata } from "next";
import { ProgressView, type TopicTrack } from "@/app/progress/ProgressView";
import { GIT_CHAPTERS } from "@/content/git-body";
import { chapterMetas, topics } from "@/lib/content";
import { GIT_PROGRESS_PREFIX } from "@/lib/gitSeries";
import { bookRounds } from "@/lib/interviewBook";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Your progress",
  description: "Streaks, XP, badges, and a contribution calendar for everything you have read and solved.",
  path: "/progress",
  index: false,
});

export default function ProgressPage() {
  const tracks: TopicTrack[] = topics()
    .filter((t) => t.levels)
    .map((t) => ({
      id: t.id,
      name: t.name,
      mark: t.mark,
      accent: t.accent,
      href: `/level/${t.id}`,
      ids: chapterMetas(t.id)
        .filter((c) => c.ready)
        .map((c) => c.id),
    }))
    .filter((t) => t.ids.length > 0);
  tracks.push({
    id: "git",
    name: "Git",
    mark: "⑂",
    accent: "yellow",
    href: "/git",
    ids: GIT_CHAPTERS.map((s) => GIT_PROGRESS_PREFIX + s.id),
  });
  tracks.push({
    id: "interview",
    name: "Interview book",
    mark: "◎",
    accent: "red",
    href: "/interview",
    ids: bookRounds().map((r) => r.id),
  });
  return <ProgressView tracks={tracks} />;
}
