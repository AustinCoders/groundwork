export const TOUR_OPEN_EVENT = "groundwork:tour-open";
export const TOUR_PROMPT_DELAY_MS = 1600;

interface CoverSource {
  id: string;
  notes: string | null;
}

function coverPath(topic: CoverSource): string {
  return `/${(topic.notes || topic.id).replace(/\.html$/, "")}`;
}

export function coverPaths(topics: readonly CoverSource[], guideIds: readonly string[]): string[] {
  return topics.filter((topic) => !guideIds.includes(topic.id)).map(coverPath);
}

export function isTourPage(pathname: string, covers: readonly string[]): boolean {
  if (pathname === "/") return true;
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "level") return parts.length === 2;
  if (parts[0] === "path") return parts.length === 3;
  return parts.length === 1 && covers.includes(`/${parts[0]}`);
}

export function shouldOfferTour({
  pathname,
  covers,
  seen,
  shownThisLoad,
}: {
  pathname: string;
  covers: readonly string[];
  seen: boolean;
  shownThisLoad: boolean;
}): boolean {
  return !seen && !shownThisLoad && isTourPage(pathname, covers);
}
