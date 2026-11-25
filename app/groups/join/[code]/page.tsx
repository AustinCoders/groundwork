import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { pageMetadata } from "@/lib/metadata";
import { JoinGroup } from "../../JoinGroup";

export const metadata: Metadata = pageMetadata({
  title: "Join a study group",
  description: "You were invited to a Groundwork study group.",
  path: "/groups",
  index: false,
});

type Params = { params: Promise<{ code: string }> };

export default async function JoinGroupPage({ params }: Params) {
  const { code } = await params;
  return (
    <PageFrame
      title="Study groups"
      mark="⁂"
      accent="blue"
      layout="reader"
      back={{ href: "/groups", label: "Groups" }}
      skipLabel="Skip to the invite"
    >
      <JoinGroup code={code.toLowerCase().slice(0, 20)} />
    </PageFrame>
  );
}
