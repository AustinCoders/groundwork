import type { Metadata } from "next";
import { PlacementFlow } from "@/components/placement/PlacementFlow";
import { notesHref, topic as findTopic, topicHome } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { placementData } from "@/lib/placementChapters";

const TOPIC = "dsa";

export const metadata: Metadata = pageMetadata({
  title: "Find my level — DSA",
  description: "A short placement for the DSA course: no timer, a few questions, then a level and a plan.",
  path: "/dsa/placement",
  index: false,
});

export default function Page() {
  const topic = findTopic(TOPIC);
  if (!topic) return null;
  return (
    <PlacementFlow
      topic={{ name: topic.name, href: topicHome(TOPIC), mark: topic.mark, accent: topic.accent }}
      data={placementData(TOPIC)}
      basePath={notesHref(TOPIC)}
    />
  );
}
