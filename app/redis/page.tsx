import type { Metadata } from "next";
import { TopicCoverPage, topicCoverMetadata } from "@/components/reader/topicPages";

const TOPIC = "redis";

export function generateMetadata(): Metadata {
  return topicCoverMetadata(TOPIC);
}

export default function Page() {
  return <TopicCoverPage topicId={TOPIC} />;
}
