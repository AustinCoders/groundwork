"use client";

import Link from "next/link";
import { TiltCard } from "@/components/TiltCard";
import { topicHref, topicOfDay } from "@/lib/topics";
import { escapeHtml } from "@/lib/format";
import { useLastLevel, useMounted } from "@/lib/hooks";
import type { Topic } from "@/content/types";

/** A nudge toward something other than whatever's already mid-read. Only
 * picks from topics with actual chapters, not just an outline. */
export function TopicOfDay({ topics }: { topics: Topic[] }) {
  const mounted = useMounted();
  const savedLevel = useLastLevel();
  const topic = topicOfDay(topics);

  // Date math is client-only (server/client timezones can disagree right
  // at a day boundary) — same guard ThemePicker/FontPicker use.
  if (!mounted || !topic) return null;

  const href = topicHref(topic, savedLevel);

  return (
    <TiltCard className="topic-of-day">
      <Link href={href} className="topic-of-day__link">
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
