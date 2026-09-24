import type { Metadata } from "next";
import { ProgressView } from "@/app/progress/ProgressView";
import { pageMetadata } from "@/lib/metadata";

// Everything on this page comes out of your own browser, so for anyone arriving
// from a search result it is blank.
export const metadata: Metadata = pageMetadata({
  title: "Your progress",
  description: "Streaks, XP, badges, and a contribution calendar for everything you have read and solved.",
  path: "/progress",
  index: false,
});

export default function ProgressPage() {
  return <ProgressView />;
}
