import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { topicCoverMetadata } from "@/components/reader/topicPages";
import { CoverSheet } from "@/components/reader/CoverSheet";
import { HashRedirect } from "@/components/reader/HashRedirect";
import { TopicFrame } from "@/components/topic/TopicFrame";
import { notesData, notesHref } from "@/lib/content";
import { topic } from "@/lib/topics";

const TOPIC = "js";

export function generateMetadata(): Metadata {
  return topicCoverMetadata(TOPIC);
}

export default function Page() {
  const t = topic(TOPIC);
  if (!t) notFound();
  const basePath = notesHref(TOPIC);

  return (
    <TopicFrame
      topic={{ name: t.name, href: basePath, mark: t.mark, accent: t.accent }}
      reading
      skip={{ label: "Skip to the notes" }}
    >
      <HashRedirect basePath={basePath} />
      <div id="chapters">
        <CoverSheet data={notesData(TOPIC)} basePath={basePath} topicId={TOPIC} />
      </div>
    </TopicFrame>
  );
}
