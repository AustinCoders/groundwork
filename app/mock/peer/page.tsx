import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { pageMetadata } from "@/lib/metadata";
import { PeerView } from "./PeerView";

export const metadata: Metadata = pageMetadata({
  title: "Mock interview with a friend",
  description: "Book a mock interview with a connection, take turns asking questions and give each other a scorecard.",
  path: "/mock/peer",
  index: false,
});

export default function PeerPage() {
  return (
    <PageFrame
      title="Mock with a friend"
      mark="⏱"
      accent="blue"
      layout="reader"
      back={{ href: "/people", label: "People" }}
      skipLabel="Skip to mock interviews"
    >
      <PeerView />
    </PageFrame>
  );
}
