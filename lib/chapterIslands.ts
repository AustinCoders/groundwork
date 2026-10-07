export type BodySegment = { kind: "html"; html: string } | { kind: "island"; id: string; input: string | null };

const PLACEHOLDER = /<div data-play="([a-z0-9-]+)"(?: data-input='([^']*)')?><\/div>/g;

export function splitIslands(html: string): BodySegment[] | null {
  const segments: BodySegment[] = [];
  let cursor = 0;
  for (const match of html.matchAll(PLACEHOLDER)) {
    if (match.index > cursor) segments.push({ kind: "html", html: html.slice(cursor, match.index) });
    segments.push({ kind: "island", id: match[1], input: match[2] ?? null });
    cursor = match.index + match[0].length;
  }
  if (segments.length === 0) return null;
  if (cursor < html.length) segments.push({ kind: "html", html: html.slice(cursor) });
  return segments;
}
