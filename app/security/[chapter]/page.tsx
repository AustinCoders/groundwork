import type { Metadata } from "next";
import { TopicChapterPage, topicChapterMetadata, topicChapterParams } from "@/components/reader/topicPages";

const TOPIC = "security";

export function generateStaticParams() {
  return topicChapterParams(TOPIC);
}

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const { chapter } = await params;
  return topicChapterMetadata(TOPIC, chapter);
}

export default async function Page({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter } = await params;
  return <TopicChapterPage topicId={TOPIC} chapterId={chapter} />;
}
