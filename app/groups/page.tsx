import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { pageMetadata } from "@/lib/metadata";
import { topicTracks } from "@/lib/profile/topicTracks";
import { GroupsView } from "./GroupsView";

export const metadata: Metadata = pageMetadata({
  title: "Study groups",
  description: "Small study groups of up to 20 developers with their own weekly board.",
  path: "/groups",
  index: false,
});

export default function GroupsPage() {
  return (
    <PageFrame
      title="Study groups"
      mark="⁂"
      accent="blue"
      layout="reader"
      back={{ href: "/people", label: "People" }}
      skipLabel="Skip to study groups"
    >
      <GroupsView tracks={topicTracks()} />
    </PageFrame>
  );
}
