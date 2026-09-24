export const INTERVIEW_TOPIC_ID = "interview";
export const ARCHITECTURE_TOPIC_ID = "architecture";

export function onShelf(topicId: string): boolean {
  return topicId !== INTERVIEW_TOPIC_ID && topicId !== ARCHITECTURE_TOPIC_ID;
}
