import { DEFAULT_STYLE, textBox, type Box, type El, type Kind, type Point, type Style } from "@/lib/whiteboard/model";

export function make(
  id: string,
  kind: Kind,
  x: number,
  y: number,
  w: number,
  h: number,
  text = "",
  style: Partial<Style> = {}
): El {
  return { id, kind, x, y, w, h, text, style: { ...DEFAULT_STYLE, ...style } };
}

export function textLine(id: string, x: number, y: number, text: string, style: Partial<Style> = {}): El {
  const fontSize = style.fontSize ?? DEFAULT_STYLE.fontSize;
  const size = textBox(text, fontSize);
  return make(id, "text", x, y, size.w, size.h, text, { ...style, fontSize });
}

export function path(id: string, kind: "arrow" | "line", from: Point, points: Point[], style: Partial<Style> = {}): El {
  const rel = points.map(([px, py]) => [px - from[0], py - from[1]] as Point);
  return {
    id,
    kind,
    x: from[0],
    y: from[1],
    w: 0,
    h: 0,
    points: rel,
    style: { ...DEFAULT_STYLE, ...style },
    ...(kind === "arrow" ? { start: null, end: null } : {}),
  };
}

export function wrapWords(text: string, limit: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && `${line} ${word}`.length > limit) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

export function pad(box: Box, by: number): Box {
  return { x: box.x - by, y: box.y - by, w: box.w + by * 2, h: box.h + by * 2 };
}

export function meets(a: Box, b: Box, margin = 0): boolean {
  return a.x < b.x + b.w + margin && b.x < a.x + a.w + margin && a.y < b.y + b.h + margin && b.y < a.y + a.h + margin;
}
