import { Suspense } from "react";
import { PathRedirect } from "../PathRedirect";
import { pathTargets } from "../pathTargets";
import { pathTopicIds } from "@/lib/topicIds";

export const dynamicParams = false;

export function generateStaticParams() {
  return pathTopicIds().map((topic) => ({ topic }));
}

export default async function TopicPathRedirectPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  return (
    <Suspense fallback={null}>
      <PathRedirect targets={pathTargets()} topic={topic} />
    </Suspense>
  );
}
