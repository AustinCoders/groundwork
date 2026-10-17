export const VIEW_W = 1000;
export const VIEW_H = 800;
export const HUB = { x: 226, y: 400, r: 128 };
export const RING_R = 172;
export const CIRCLE_R = 64;
export const RX = 360;
export const RY = 316;
export const STAGE_ARC = 144;
export const DOT_ARC = 164;

export interface Point {
  x: number;
  y: number;
}

const radians = (degrees: number) => (degrees * Math.PI) / 180;

export function stageAngle(index: number, count: number): number {
  if (count <= 1) return 0;
  const reach = Math.sin(radians(STAGE_ARC / 2));
  const along = (2 * index) / (count - 1) - 1;
  return (Math.asin(along * reach) * 180) / Math.PI;
}

export function stageCenter(index: number, count: number): Point {
  const angle = radians(stageAngle(index, count));
  return { x: HUB.x + RX * Math.cos(angle), y: HUB.y + RY * Math.sin(angle) };
}

export function ringPoint(angle: number, radius = RING_R): Point {
  return { x: HUB.x + radius * Math.cos(radians(angle)), y: HUB.y + radius * Math.sin(radians(angle)) };
}

export function arcPath(from: number, to: number, radius = RING_R): string {
  const start = ringPoint(from, radius);
  const end = ringPoint(to, radius);
  return `M${start.x.toFixed(1)} ${start.y.toFixed(1)} A${radius} ${radius} 0 0 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

export function spokePath(angle: number, from = RING_R, to = RING_R + 22): string {
  const start = ringPoint(angle, from);
  const end = ringPoint(angle, to);
  return `M${start.x.toFixed(1)} ${start.y.toFixed(1)} L${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

export function dotAngles(groups: readonly number[]): number[][] {
  const total = groups.reduce((sum, size) => sum + size, 0);
  let seen = 0;
  return groups.map((size) =>
    Array.from({ length: size }, () => {
      const angle = -DOT_ARC / 2 + ((seen++ + 0.5) * DOT_ARC) / total;
      return angle;
    })
  );
}

export function middle(angles: readonly number[]): number {
  return angles.reduce((sum, angle) => sum + angle, 0) / angles.length;
}

export function connectorPath(from: Point, to: Point): string {
  const reach = Math.max(60, (to.x - from.x) / 2);
  return `M${from.x.toFixed(1)} ${from.y.toFixed(1)} C${(from.x + reach).toFixed(1)} ${from.y.toFixed(1)} ${(to.x - reach).toFixed(1)} ${to.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

export function circleEdge(index: number, count: number): Point {
  const centre = stageCenter(index, count);
  return { x: centre.x - CIRCLE_R - 6, y: centre.y };
}

export function percentX(x: number): number {
  return (x / VIEW_W) * 100;
}

export function percentY(y: number): number {
  return (y / VIEW_H) * 100;
}
