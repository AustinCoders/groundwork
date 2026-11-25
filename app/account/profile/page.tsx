import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { pageMetadata } from "@/lib/metadata";
import { topicTracks } from "@/lib/profile/topicTracks";
import { ProfileEditor } from "./ProfileEditor";

export const metadata: Metadata = pageMetadata({
  title: "Edit your profile",
  description: "Your name, headline, links, avatar colour and learning goals on Groundwork.",
  path: "/account/profile",
  index: false,
});

export default function ProfilePage() {
  return (
    <PageFrame
      title="Profile"
      mark="✎"
      accent="blue"
      layout="reader"
      back={{ href: "/account", label: "Account" }}
      skipLabel="Skip to your profile"
    >
      <ProfileEditor tracks={topicTracks()} />
    </PageFrame>
  );
}
