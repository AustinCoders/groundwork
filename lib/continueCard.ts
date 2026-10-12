import type { TopicNav } from "@/content/types";
import { isReadable } from "@/lib/topicCategories";
import { navHref, type GuideNav } from "@/lib/topicNav";
import { sinceLabel, type Resume } from "@/lib/resume";

export interface ContinueResume {
  kind: "resume";
  href: string;
  name: string;
  mark: string;
  accent: string;
  chapterLabel: string;
  title: string;
  index: number;
  total: number;
  since: string;
}

export interface ContinueStart {
  kind: "start";
  href: string;
  name: string;
  mark: string;
  accent: string;
  written: number;
}

export type ContinueCard = ContinueResume | ContinueStart | null;

function resumeCard(resume: Resume, topics: TopicNav[], guides: GuideNav[], now: number): ContinueResume | null {
  const guide = guides.find((g) => g.id === resume.topic);
  const topic = topics.find((t) => t.id === resume.topic);
  if (guide) {
    const knows = guide.groups.some((g) => g.chapters.some((c) => c.id === resume.chapter && c.href === resume.href));
    if (!knows) return null;
  } else if (!topic || !isReadable(topic)) {
    return null;
  }
  const source = guide ?? topic;
  if (!source) return null;
  return {
    kind: "resume",
    href: resume.href,
    name: resume.topicName,
    mark: source.mark,
    accent: source.accent,
    chapterLabel: resume.num,
    title: resume.title,
    index: resume.index,
    total: resume.total,
    since: sinceLabel(resume.at, now),
  };
}

export function startTopic(topics: TopicNav[]): TopicNav | null {
  return topics
    .filter(isReadable)
    .reduce<TopicNav | null>((best, t) => (!best || t.written > best.written ? t : best), null);
}

export function continueCard(
  resume: Resume | null,
  topics: TopicNav[],
  guides: GuideNav[],
  now: number = Date.now()
): ContinueCard {
  const back = resume ? resumeCard(resume, topics, guides, now) : null;
  if (back) return back;
  const start = startTopic(topics);
  if (!start) return null;
  return {
    kind: "start",
    href: navHref(start, null),
    name: start.name,
    mark: start.mark,
    accent: start.accent,
    written: start.written,
  };
}
