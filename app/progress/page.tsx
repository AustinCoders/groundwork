import type { Metadata } from "next";
import { ProgressView } from "@/app/progress/ProgressView";

export const metadata: Metadata = {
  title: "Your progress — notes",
  description: "Streaks, XP, badges, and a contribution calendar for everything you've read and solved.",
};

export default function ProgressPage() {
  return <ProgressView />;
}
