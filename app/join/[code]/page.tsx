import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { pageMetadata } from "@/lib/metadata";
import { JoinInvite } from "./JoinInvite";

export const metadata: Metadata = pageMetadata({
  title: "You are invited to Groundwork",
  description: "A friend invited you to study together on Groundwork: free notes and practice for developers.",
  path: "/join",
  index: false,
});

type Params = { params: Promise<{ code: string }> };

export default async function JoinPage({ params }: Params) {
  const { code } = await params;
  return (
    <PageFrame title="Invite" mark="⚇" accent="blue" layout="reader" skipLabel="Skip to the invite">
      <JoinInvite code={code.toLowerCase().slice(0, 20)} />
    </PageFrame>
  );
}
