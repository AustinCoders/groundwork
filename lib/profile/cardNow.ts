import type { TopicTrack } from "@/app/progress/progressModel";
import type { AccountUser, Profile } from "@/lib/account/session";
import { computeStats, earnedBadges } from "@/lib/gamification";
import { activity, dayKey, progress } from "@/lib/storage";
import { buildPublicCard, type PublicCard } from "./publicCard";

export function currentCard(user: AccountUser, profile: Profile | null, tracks: TopicTrack[]): PublicCard {
  const stats = computeStats();
  const done = progress.all().chapters;
  return buildPublicCard({
    name: profile?.displayName || user.name,
    headline: user.extras.headline,
    location: user.extras.location,
    github: user.extras.github,
    linkedin: user.extras.linkedin,
    website: user.extras.website,
    color: user.extras.avatarColor,
    art: user.extras.avatarArt,
    role: profile?.targetRole ?? null,
    stats,
    badges: earnedBadges(stats).map((b) => b.id),
    topics: tracks.map((t) => ({
      id: t.id,
      name: t.name,
      mark: t.mark,
      pct: Math.round((t.ids.filter((id) => id in done).length / t.ids.length) * 100),
    })),
    activity: activity.all(),
    today: dayKey(),
  });
}

export const REPUBLISH_AFTER_MS = 6 * 60 * 60 * 1000;

export function cardIsStale(publicAt: string | null, now: number): boolean {
  if (!publicAt) return true;
  const at = Date.parse(publicAt);
  return !Number.isFinite(at) || now - at > REPUBLISH_AFTER_MS;
}
