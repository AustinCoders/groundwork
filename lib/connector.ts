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

interface ConnectorItem {
  el: HTMLElement;
  target: HTMLElement;
  startY: number;
  endY: number;
  d: number;
  docked: boolean;
}

export interface ConnectorLive {
  items: ConnectorItem[];
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

function unit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function connectorProgress(scroll: number, viewport: number, startY: number, endY: number): number {
  const span = Math.max(1, endY - startY + viewport * 0.45);
  return unit((scroll + viewport * 0.9 - startY) / span);
}
