export const PINNED_LEVEL_HOME_TOPIC_IDS = ["dsa"];

export function canonicalPath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "").toLowerCase();
  if (trimmed === "") return "/";
  const id = trimmed.slice(1);
  return PINNED_LEVEL_HOME_TOPIC_IDS.includes(id) ? `/level/${id}` : trimmed;
}
