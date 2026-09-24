import type { Metadata } from "next";
import { ProgressView } from "@/app/progress/ProgressView";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Your progress",
  description: "Streaks, XP, badges, and a contribution calendar for everything you have read and solved.",
  path: "/progress",
  index: false,
});

export default function ProgressPage() {
  return <ProgressView />;
}
