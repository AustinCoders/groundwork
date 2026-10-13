export interface LostTopic {
  id: string;
  name: string;
  segment: string;
  home: string;
  guide: boolean;
}

const LEVEL_PREFIXES = ["level", "path"];

export function topicForPath(pathname: string, topics: readonly LostTopic[]): LostTopic | null {
  const parts = pathname.toLowerCase().split("/").filter(Boolean);
  if (parts.length === 0) return null;
  if (LEVEL_PREFIXES.includes(parts[0])) {
    const id = parts[1];
    return topics.find((topic) => topic.id === id) ?? null;
  }
  return topics.find((topic) => topic.segment === parts[0]) ?? null;
}

export function lostButtonLabel(topic: LostTopic): string {
  return topic.guide ? `Open the ${topic.name}` : `Open the ${topic.name} notes`;
}
