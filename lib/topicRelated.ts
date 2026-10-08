const RELATED_TOPIC: Record<string, string> = {
  typescript: "js",
  nextjs: "react",
  node: "js",
  nestjs: "js",
  python: "dsa",
  java: "dsa",
  cpp: "dsa",
  mongodb: "system-design",
  dbms: "system-design",
  networks: "system-design",
  os: "system-design",
};

export function relatedTopicId(topicId: string): string {
  const related = RELATED_TOPIC[topicId] ?? "js";
  return related === topicId ? "react" : related;
}

const NO_WRITTEN_NEIGHBOUR = new Set(["rust", "ruby", "go", "ai"]);

export function plannedRelatedTopicId(topicId: string): string | null {
  return NO_WRITTEN_NEIGHBOUR.has(topicId) ? null : relatedTopicId(topicId);
}
