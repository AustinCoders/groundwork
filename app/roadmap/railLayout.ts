export const VIEW_W = 1000;
export const RADIUS = 90;
export const X_LEFT = 190;
export const X_RIGHT = 810;
export const START_X = 56;
export const TOP = 118;
export const BOTTOM = 120;
export const TRAIN_GAP = 150;
export const BADGE_R = 36;

export type Side = "left" | "right";

export function railHeight(count: number): number {
  return TOP + 2 * RADIUS * count + BOTTOM;
}

export function runY(run: number): number {
  return TOP + 2 * RADIUS * run;
}

export function sideOf(index: number): Side {
  return index % 2 === 0 ? "right" : "left";
}

export function apex(index: number): { x: number; y: number; side: Side } {
  const side = sideOf(index);
  return {
    x: side === "right" ? X_RIGHT + RADIUS : X_LEFT - RADIUS,
    y: TOP + RADIUS + 2 * RADIUS * index,
    side,
  };
}

export function endX(count: number): number {
  return count % 2 === 0 ? VIEW_W - 60 : 60;
}

export function trackPath(count: number): string {
  let d = `M${START_X} ${TOP}`;
  for (let run = 0; run < count; run++) {
    const x = run % 2 === 0 ? X_RIGHT : X_LEFT;
    const sweep = run % 2 === 0 ? 1 : 0;
    d += ` H${x} A${RADIUS} ${RADIUS} 0 0 ${sweep} ${x} ${runY(run + 1)}`;
  }
  return `${d} H${endX(count)}`;
}

function lengthTo(count: number, arcs: number): number {
  let x = START_X;
  let length = 0;
  for (let run = 0; run < arcs; run++) {
    const target = run % 2 === 0 ? X_RIGHT : X_LEFT;
    length += Math.abs(target - x) + Math.PI * RADIUS;
    x = target;
  }
  if (arcs === count) return length + Math.abs(endX(count) - x);
  const target = arcs % 2 === 0 ? X_RIGHT : X_LEFT;
  return length + Math.abs(target - x);
}

export function trackLength(count: number): number {
  return lengthTo(count, count);
}

export function arcStartLength(index: number): number {
  return lengthTo(Number.MAX_SAFE_INTEGER, index);
}

export function apexLength(index: number): number {
  return arcStartLength(index) + (Math.PI * RADIUS) / 2;
}

export function trainLength(index: number): number {
  return Math.max(0, arcStartLength(index) - TRAIN_GAP);
}

export function trainPoint(index: number): { x: number; y: number; heading: Side } {
  const side = sideOf(index);
  return {
    x: side === "right" ? X_RIGHT - TRAIN_GAP : X_LEFT + TRAIN_GAP,
    y: runY(index),
    heading: side,
  };
}

export function goalPoint(count: number): { x: number; y: number; heading: Side } {
  return { x: endX(count), y: runY(count), heading: count % 2 === 0 ? "right" : "left" };
}

export function percentX(x: number): number {
  return (x / VIEW_W) * 100;
}

export function percentY(y: number, count: number): number {
  return (y / railHeight(count)) * 100;
}
