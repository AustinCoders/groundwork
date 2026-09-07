export const INTERVIEW_TOPIC_ID = "interview";
export const ARCHITECTURE_TOPIC_ID = "architecture";

// Both of these have their own link in the sidebar, and neither is a subject you
// work through the way the shelf implies — one is a loop to prepare for, the
// other is this site explaining itself. They are reachable, just not shelved.
export function onShelf(topicId: string): boolean {
  return topicId !== INTERVIEW_TOPIC_ID && topicId !== ARCHITECTURE_TOPIC_ID;
}
