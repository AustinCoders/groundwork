import type { TopicCategoryId, TopicNav } from "@/content/types";

export const TOPIC_CATEGORIES: { id: TopicCategoryId; label: string }[] = [
  { id: "languages", label: "Languages" },
  { id: "web", label: "Web" },
  { id: "backend", label: "Backend and APIs" },
  { id: "data", label: "Data" },
  { id: "cs", label: "Computer science" },
  { id: "devops", label: "DevOps and cloud" },
  { id: "engineering", label: "Engineering practice" },
  { id: "ai", label: "AI" },
];

export interface CategoryGroup {
  id: TopicCategoryId;
  label: string;
  topics: TopicNav[];
}

export function isReadable(t: TopicNav): boolean {
  return t.status === "ready" && t.written > 0;
}

export function groupByCategory(topics: TopicNav[]): CategoryGroup[] {
  return TOPIC_CATEGORIES.map(({ id, label }) => {
    const members = topics.filter((t) => t.category === id);
    return { id, label, topics: [...members.filter(isReadable), ...members.filter((t) => !isReadable(t))] };
  }).filter((group) => group.topics.length > 0);
}
