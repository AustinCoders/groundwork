import type { Metadata } from "next";
import { RoadmapHub } from "@/app/roadmap/RoadmapHub";
import { pageMetadata } from "@/lib/metadata";
import { roadmaps } from "@/lib/roadmap";

export const metadata: Metadata = pageMetadata({
  title: "Roadmaps",
  description:
    "Four paths from where you are to the offer, built from the chapters and interview rounds that are actually written, with your progress marked on each.",
  path: "/roadmap",
});

export default function RoadmapsPage() {
  return <RoadmapHub roadmaps={roadmaps()} />;
}
