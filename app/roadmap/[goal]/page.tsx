import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoadmapView } from "@/app/roadmap/RoadmapView";
import { pageMetadata } from "@/lib/metadata";
import { roadmap, roadmapIds } from "@/lib/roadmap";

export const dynamicParams = false;

export function generateStaticParams() {
  return roadmapIds().map((goal) => ({ goal }));
}

export async function generateMetadata({ params }: { params: Promise<{ goal: string }> }): Promise<Metadata> {
  const { goal } = await params;
  const found = roadmap(goal);
  if (!found) return {};
  return pageMetadata({
    title: `${found.title} roadmap`,
    description: `${found.tagline}. ${found.totals.written} of ${found.totals.steps} steps have chapters you can read today.`,
    path: `/roadmap/${found.id}`,
  });
}

export default async function RoadmapPage({ params }: { params: Promise<{ goal: string }> }) {
  const { goal } = await params;
  const found = roadmap(goal);
  if (!found) notFound();
  return <RoadmapView roadmap={found} />;
}
