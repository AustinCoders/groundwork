"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/topic/TopicKit";
import { useMounted } from "@/lib/hooks";
import { lostButtonLabel, topicForPath, type LostTopic } from "@/lib/lostTopic";

export function LostActions({ topics }: { topics: LostTopic[] }) {
  const pathname = usePathname();
  const mounted = useMounted();
  const topic = mounted ? topicForPath(pathname, topics) : null;

  if (!topic) {
    return (
      <Button href="/">
        Back to all topics <span aria-hidden="true">→</span>
      </Button>
    );
  }

  return (
    <>
      <Button href={topic.home}>
        {lostButtonLabel(topic)} <span aria-hidden="true">→</span>
      </Button>
      <Button ghost href="/">
        Back to all topics
      </Button>
    </>
  );
}
