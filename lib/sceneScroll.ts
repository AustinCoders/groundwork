export const REST_BELOW = 0.25;
const ENTER_LAG = 1.5;

export interface SceneState {
  p: number;
  enter: number;
  exit: number;
}

function unit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function ease(t: number): number {
  return t * t * (3 - 2 * t);
}

export function readScene(out: SceneState, top: number, height: number, viewport: number, header: number): SceneState {
  const enterSpan = Math.max(1, viewport - header - REST_BELOW * viewport);
  const exitSpan = Math.max(1, viewport - header);
  const travelled = Math.min(header - top, viewport - top - height);
  out.p = unit((viewport - top) / Math.max(1, viewport + height));
  out.enter = ease(unit((viewport - top) / enterSpan)) ** ENTER_LAG;
  out.exit = ease(unit(travelled / exitSpan));
  return out;
}

export interface PinState {
  group: number;
  item: number;
  t: number;
  step: number;
}

interface PinRange {
  start: number;
  length: number;
}

export function pinStep(out: PinState, s: number, length: number, hold: number, groups: readonly number[]): PinState {
  const count = Math.max(1, groups.length);
  const along = Math.min(Math.max(Number.isFinite(s) ? s : 0, 0), Math.max(0, length));
  const groupLength = Math.max(1, length - hold) / count;
  const group = Math.min(count - 1, Math.floor(along / groupLength));
  const inGroup = unit((along - group * groupLength) / groupLength);
  const items = Math.max(1, groups[group] ?? 1);
  const item = Math.min(items - 1, Math.floor(inGroup * items));
  out.group = group;
  out.item = item;
  out.t = unit(inGroup * items - item);
  out.step = 0;
  for (let g = 0; g < group; g++) out.step += Math.max(1, groups[g] ?? 1);
  out.step += item;
  return out;
}

export function pinOffset(
  length: number,
  hold: number,
  groups: readonly number[],
  group: number,
  item: number,
  at: number
): number {
  const count = Math.max(1, groups.length);
  const groupLength = Math.max(1, length - hold) / count;
  const items = Math.max(1, groups[group] ?? 1);
  return group * groupLength + ((item + unit(at)) / items) * groupLength;
}

export function virtualScroll(scroll: number, pins: readonly PinRange[]): number {
  let used = 0;
  for (let i = 0; i < pins.length; i++) {
    const pin = pins[i];
    used += Math.min(Math.max(scroll - pin.start, 0), pin.length);
  }
  return scroll - used;
}
