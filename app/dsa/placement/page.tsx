import type { Metadata } from "next";
import { Suspense } from "react";
import { PlacementFlow } from "@/components/placement/PlacementFlow";
import { notesHref, topic as findTopic } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { placementData } from "@/lib/placementChapters";

const TOPIC = "dsa";

export const metadata: Metadata = pageMetadata({
  title: "Find my level — DSA",
  description: "A short placement for the DSA course: no timer, at most 18 questions, then a level and a plan.",
  path: "/dsa/placement",
  index: false,
});

export default function Page() {
  const topic = findTopic(TOPIC);
  if (!topic) return null;
  return (
    <Suspense fallback={null}>
      <PlacementFlow
        topic={{ name: topic.name, href: notesHref(TOPIC), mark: topic.mark, accent: topic.accent }}
        data={placementData(TOPIC)}
        basePath={notesHref(TOPIC)}
      />
    </Suspense>
  );
}
