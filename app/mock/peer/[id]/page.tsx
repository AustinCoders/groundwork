import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { pageMetadata } from "@/lib/metadata";
import { PeerRoom } from "../PeerRoom";

export const metadata: Metadata = pageMetadata({
  title: "Mock interview with a friend",
  description: "Your mock interview with a connection.",
  path: "/mock/peer",
  index: false,
});

type Params = { params: Promise<{ id: string }> };

export default async function PeerRoomPage({ params }: Params) {
  const { id } = await params;
  return (
    <PageFrame
      title="Mock with a friend"
      mark="⏱"
      accent="blue"
      layout="reader"
      back={{ href: "/mock/peer", label: "All mocks" }}
      skipLabel="Skip to the mock interview"
    >
      <PeerRoom id={id.toLowerCase().slice(0, 40)} />
    </PageFrame>
  );
}
