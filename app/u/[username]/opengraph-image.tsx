import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { fetchPublicProfile } from "@/lib/profile/fetchPublic";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "A learning profile on Groundwork";
export const revalidate = 300;

export default async function OpengraphImage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const found = await fetchPublicProfile(username);
  if (!found) {
    return ogCard({
      mark: "G",
      kicker: "Groundwork",
      sub: "Learning profile",
      headline: "Learn web development, free",
    });
  }
  const { card } = found;
  const top = card.topics[0];
  return ogCard({
    mark: "G",
    kicker: card.name,
    sub: card.headline || "Learning on Groundwork",
    headline: top ? `${top.pct}% through ${top.name}` : `Level ${card.level} on Groundwork`,
    chips: [
      `Level ${card.level}`,
      `${card.streak}-day streak`,
      `${card.chapters} chapters`,
      `${card.exercises} exercises`,
    ],
    accent: "blue",
  });
}
