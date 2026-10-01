const RELATED_TOPIC: Record<string, string> = {
  typescript: "js",
  nextjs: "react",
  node: "js",
  nestjs: "js",
};

export function relatedTopicId(topicId: string): string {
  const related = RELATED_TOPIC[topicId] ?? "js";
  return related === topicId ? "react" : related;
}
