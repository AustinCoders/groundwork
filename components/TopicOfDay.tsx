"use client";

import Link from "next/link";
import { TiltCard } from "@/components/TiltCard";
import { topicHref } from "@/lib/topics";
import { escapeHtml } from "@/lib/format";
import { useLastLevel, useMounted } from "@/lib/hooks";
import type { Topic } from "@/content/types";

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}

/** Same topic all day (day-of-year mod topic count), different tomorrow —
 * a nudge toward something other than whatever's already mid-read. Only
 * picks from topics with actual chapters, not just an outline. */
export function TopicOfDay({ topics }: { topics: Topic[] }) {
  const mounted = useMounted();
  const savedLevel = useLastLevel();

  // Date math is client-only (server/client timezones can disagree right
  // at a day boundary) — same guard ThemePicker/FontPicker use.
  if (!mounted || !topics.length) return null;

  const topic = topics[dayOfYear() % topics.length];
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
