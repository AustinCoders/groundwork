import type { Metadata } from "next";
import { topicCoverMetadata } from "@/components/reader/topicPages";
import { HashRedirect } from "@/components/reader/HashRedirect";
import { chapterMetas, exercises, notesData, notesHref } from "@/lib/content";
import { frameTopic } from "@/lib/topics";
import { repoStats } from "@/lib/repoStats";
import { siteStats } from "@/lib/topicStats";
import { ArchitectureView, type ChapterCard } from "./ArchitectureView";

const TOPIC = "architecture";

export function generateMetadata(): Metadata {
  return topicCoverMetadata(TOPIC);
}

export default function Page() {
  const data = notesData(TOPIC);
  const basePath = notesHref(TOPIC);
  const cards: ChapterCard[] = chapterMetas(TOPIC)
    .filter((c) => c.ready)
    .map((c) => ({
      id: c.id,
      num: c.num,
      title: c.title,
      subtitle: c.subtitle ?? "",
      level: (c.levels?.[0] ?? "beginner") as ChapterCard["level"],
      minutes: c.readMinutes,
    }));
  return (
    <>
      <HashRedirect basePath={basePath} />
      <ArchitectureView
        topic={frameTopic(TOPIC, basePath)}
        title={data.meta.title}
        lead={data.meta.lead ?? data.meta.subtitle}
        basePath={basePath}
        chapters={cards}
        stats={repoStats()}
        written={siteStats().writtenChapters}
        exercises={exercises().length}
      />
    </>
  );
}
