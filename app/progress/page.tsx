import type { Metadata } from "next";
import { ProgressView } from "@/app/progress/ProgressView";
import { pageMetadata } from "@/lib/metadata";
import { baseTracks } from "@/lib/profile/roleTracks";
import { skillInfo } from "@/lib/profile/skillInfo";
import { topicTracks } from "@/lib/profile/topicTracks";

export const metadata: Metadata = pageMetadata({
  title: "Your progress",
  description: "Streaks, XP, badges, and a contribution calendar for everything you have read and solved.",
  path: "/progress",
  index: false,
});

export default function ProgressPage() {
  return <ProgressView tracks={topicTracks()} roles={baseTracks()} skills={skillInfo()} />;
}
