"use client";

import Link from "next/link";
import { TiltCard } from "@/components/TiltCard";
import { navHref, topicOfDay } from "@/lib/topicNav";
import { escapeHtml } from "@/lib/format";
import { useLastLevel, useMounted } from "@/lib/hooks";
import type { TopicNav } from "@/content/types";

export function TopicOfDay({ topics }: { topics: TopicNav[] }) {
  const mounted = useMounted();
  const savedLevel = useLastLevel();
  const topic = topicOfDay(topics);

  if (!mounted || !topic) return null;

  const href = navHref(topic, savedLevel);

  return (
    <TiltCard className="topic-of-day">
      <Link href={href} className="topic-of-day__link" prefetch={false}>
        <span className="topic-of-day__kicker">✨ today&apos;s pick</span>
        <span className="topic-of-day__row">
          <span
            className="topic-of-day__mark"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: escapeHtml(topic.mark) }}
          />
          <span className="topic-of-day__name" dangerouslySetInnerHTML={{ __html: topic.name }} />
        </span>
      </Link>
    </TiltCard>
  );
}
