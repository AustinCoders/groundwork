import type { Box, El } from "@/lib/whiteboard/model";

export interface Walk {
  captions: string[];
  spans: Record<string, [number, number]>;
  focus: string[][];
  views: Box[];
}

export interface CompanyBoard {
  title: string;
  els: El[];
  walk?: Walk;
}

export const BOARD_SOURCES = ["design", "lld", "coding"] as const;

export type BoardSource = (typeof BOARD_SOURCES)[number];

export function boardPath(source: BoardSource, id: string): string {
  return `/company-boards/${source}/${id}`;
}

export function whiteboardLink(source: BoardSource, id: string): string {
  return `/whiteboard?from=${source}/${id}`;
}

export function parseSource(value: string | null): { source: BoardSource; id: string } | null {
  const match = /^(design|lld|coding)\/([a-z0-9-]{1,80})$/.exec(value ?? "");
  return match ? { source: match[1] as BoardSource, id: match[2] } : null;
}

export function visibleAt(walk: Walk, step: number, id: string): boolean {
  const span = walk.spans[id];
  return !span || (step >= span[0] && step <= span[1]);
}

export function isWalk(value: unknown): value is Walk {
  if (!value || typeof value !== "object") return false;
  const walk = value as Walk;
  return (
    Array.isArray(walk.captions) &&
    walk.captions.length > 0 &&
    walk.captions.every((caption) => typeof caption === "string") &&
    Array.isArray(walk.focus) &&
    Array.isArray(walk.views) &&
    walk.focus.length === walk.captions.length &&
    walk.views.length === walk.captions.length &&
    !!walk.spans &&
    typeof walk.spans === "object"
  );
}
