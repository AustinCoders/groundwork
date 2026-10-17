export const VIEW_W = 1000;
export const ROW_H = 190;
export const RADIUS = ROW_H / 2;
export const X_LEFT = 110;
export const X_RIGHT = 890;
export const LINE_Y = RADIUS;

export type Travel = "right" | "left";

export function travel(row: number): Travel {
  return row % 2 === 0 ? "right" : "left";
}

export function entryX(row: number): number {
  return travel(row) === "right" ? X_LEFT : X_RIGHT;
}

export function exitX(row: number): number {
  return travel(row) === "right" ? X_RIGHT : X_LEFT;
}

export function stationX(row: number, index: number, count: number): number {
  const share = (index + 1) / (count + 1);
  const along = X_LEFT + share * (X_RIGHT - X_LEFT);
  return travel(row) === "right" ? along : X_LEFT + X_RIGHT - along;
}

export function stationPercent(row: number, index: number, count: number): number {
  return (stationX(row, index, count) / VIEW_W) * 100;
}

export function linePath(row: number): string {
  return `M${entryX(row)} ${LINE_Y} H${exitX(row)}`;
}

export function incomingArc(row: number): string | null {
  if (row === 0) return null;
  const from = exitX(row - 1);
  const bulge = travel(row - 1) === "right" ? from + RADIUS : from - RADIUS;
  const sweep = travel(row - 1) === "right" ? 1 : 0;
  return `M${bulge} 0 A${RADIUS} ${RADIUS} 0 0 ${sweep} ${from} ${LINE_Y}`;
}

export function outgoingArc(row: number, rows: number): string | null {
  if (row === rows - 1) return null;
  const from = exitX(row);
  const bulge = travel(row) === "right" ? from + RADIUS : from - RADIUS;
  const sweep = travel(row) === "right" ? 1 : 0;
  return `M${from} ${LINE_Y} A${RADIUS} ${RADIUS} 0 0 ${sweep} ${bulge} ${ROW_H}`;
}
