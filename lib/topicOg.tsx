import { chapters, topic, topicExerciseCount } from "@/lib/content";
import { plural } from "@/lib/format";
import { ogCard } from "@/lib/og";

const CARD_MARK: Record<string, string> = {
  react: "R",
  git: "Git",
  interview: "IB",
  dsa: "DSA",
  architecture: "Arch",
};

const isLatin = (s: string) => /^[\x20-\x7e]+$/.test(s);

export function topicOgImage(topicId: string, headline: string) {
  const t = topic(topicId);
  if (!t) return ogCard({ mark: "?", kicker: "Groundwork", sub: "web dev", headline });

  const written = chapters(topicId).filter((c) => c.ready).length;
  const exercises = t.levels ? topicExerciseCount(t) : 0;

  const chips = [
    written ? plural(written, "chapter") : null,
    t.levels ? "beginner → advanced" : null,
    exercises ? plural(exercises, "exercise") : null,
  ].filter((c): c is string => Boolean(c));

  return ogCard({
    mark: CARD_MARK[t.id] || (isLatin(t.mark) ? t.mark : t.name.slice(0, 2)),
    kicker: t.name,
    sub: t.tagline.toLowerCase(),
    headline,
    chips,
    accent: t.accent,
  });
}

export function topicOgAlt(topicId: string, headline: string): string {
  const t = topic(topicId);
  return t ? `${t.name} — ${headline}` : headline;
}
