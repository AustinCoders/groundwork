import type { Metadata } from "next";
import SoonClient from "./SoonClient";
import { topic as findTopic } from "@/lib/content";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const topic = findTopic(params.topic || "");
  if (!topic || topic.status === "ready") return {};
  return { title: `${topic.name} — coming soon` };
}

export default function SoonPage() {
  return <SoonClient />;
}
