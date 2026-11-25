import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { pageMetadata } from "@/lib/metadata";
import { topicTracks } from "@/lib/profile/topicTracks";
import { PeopleView } from "./PeopleView";

export const metadata: Metadata = pageMetadata({
  title: "People",
  description:
    "Connect with other developers on Groundwork, keep each other's streaks going and see who studied most this week.",
  path: "/people",
  index: false,
});

export default function PeoplePage() {
  return (
    <PageFrame
      title="People"
      mark="⚇"
      accent="blue"
      layout="reader"
      back={{ href: "/progress", label: "Progress" }}
      skipLabel="Skip to people"
    >
      <PeopleView tracks={topicTracks()} />
    </PageFrame>
  );
}
