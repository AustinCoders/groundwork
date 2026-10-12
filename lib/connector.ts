import { unit } from "@/lib/math";

interface ConnectorPoint {
  x: number;
  y: number;
}

interface ConnectorGeometry {
  from: ConnectorPoint;
  to: ConnectorPoint;
  gapTop: number;
  gapBottom: number;
}

export interface BuiltConnector {
  left: number;
  top: number;
  width: number;
  height: number;
  d: string;
  start: ConnectorPoint;
  end: ConnectorPoint;
  swing: ConnectorPoint;
}

export const DOCK_AT = 0.985;

interface ConnectorParts {
  reveal: SVGElement;
  label: HTMLElement;
  sparkle: SVGElement;
  fact: HTMLElement;
  rider: SVGElement;
}

interface ConnectorItem {
  el: HTMLElement;
  parts: ConnectorParts;
  target: HTMLElement;
  startY: number;
  endY: number;
  d: number;
  docked: boolean;
}

export interface ConnectorLive {
  items: ConnectorItem[];
}

export interface ConnectorLook {
  dash: number;
  label: number;
  sparkle: number;
  turn: number;
  along: number;
  fact: number;
  rider: number;
}

const PAD = 14;
const MAX_CORNER = 44;
const MIN_CORNER = 5;

export function buildConnector({ from, to, gapTop, gapBottom }: ConnectorGeometry): BuiltConnector {
  const left = Math.min(from.x, to.x) - PAD;
  const top = from.y;
  const width = Math.abs(to.x - from.x) + PAD * 2;
  const height = Math.max(1, to.y - from.y);
  const sx = from.x - left;
  const ex = to.x - left;
  const gap = Math.max(0, gapBottom - gapTop);
  const corner = Math.max(MIN_CORNER, Math.min(MAX_CORNER, gap / 2 - 4, height / 2 - 2));
  const centre = Math.min(
    Math.max((gapTop + gapBottom) / 2, gapTop + corner),
    Math.max(gapTop + corner, gapBottom - corner)
  );
  const mid = Math.min(Math.max(centre - top, corner), Math.max(corner, height - corner));
  const level = Math.abs(ex - sx) < 2;
  const d = level
    ? `M${sx} 0 L${ex} ${height}`
    : `M${sx} 0 L${sx} ${mid - corner} C${sx} ${mid} ${ex} ${mid} ${ex} ${mid + corner} L${ex} ${height}`;
  return {
    left,
    top,
    width,
    height,
    d,
    start: { x: sx, y: 0 },
    end: { x: ex, y: height },
    swing: { x: (sx + ex) / 2, y: mid },
  };
}

export function connectorProgress(scroll: number, viewport: number, startY: number, endY: number): number {
  const span = Math.max(1, endY - startY + viewport * 0.45);
  return unit((scroll + viewport * 0.9 - startY) / span);
}

export function connectorLook(out: ConnectorLook, d: number): ConnectorLook {
  const at = unit(d);
  out.dash = 1 - at;
  out.label = unit((at - 0.3) * 6);
  out.sparkle = unit(Math.sin(at * Math.PI) * 2.5);
  out.turn = at * 540;
  out.along = at * 100;
  out.fact = unit(Math.min((at - 0.06) * 30, (0.9 - at) * 30));
  out.rider = unit(Math.min(at * 40, (DOCK_AT - at) * 60));
  return out;
}
