import { chapters, topic, topicExerciseCount } from "@/lib/content";
import { plural } from "@/lib/format";
import { ogCard } from "@/lib/og";

/**
 * A topic's share card, with the facts read out of the content rather than
 * typed in — so the chapter count on the card cannot drift from the one on the
 * page the card links to.
 */
/**
 * @vercel/og ships a Latin font and downloads one on demand for anything else.
 * A topic mark like the Git fork glyph is outside that set, and when the
 * download fails the badge renders as an empty box — which is exactly what
 * happens on a build machine with no network. These marks stand in on the card
 * only; the site's own pages keep the real glyph.
 */
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
