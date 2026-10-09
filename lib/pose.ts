import { PHONE_MAX, TABLET_MAX } from "@/lib/breakpoints";
import { smooth, unit } from "@/lib/math";

export interface Pose {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
}

interface Fly {
  x: number;
  y: number;
  r: number;
  d: number;
  o: number;
}

export interface Scale {
  move: number;
  drift: number;
  tilt: number;
  vw: number;
}

const FLY: readonly Fly[] = [
  { x: -2.4, y: 84, r: -5, d: 0, o: 0.6 },
  { x: 10.8, y: -40.8, r: 6, d: 0.1, o: 0.12 },
  { x: 15.6, y: 62.4, r: 7, d: 0.2, o: 0 },
  { x: 4.8, y: 110.4, r: -8, d: 0.3, o: 0 },
  { x: 13.2, y: -62.4, r: 5, d: 0.38, o: 0 },
  { x: 8.4, y: 76.8, r: -6, d: 0.44, o: 0 },
];

const STILL_FLOOR = 0.4;

export function scaleFor(width: number): Scale {
  if (width <= PHONE_MAX) return { move: 0.3, drift: 0.18, tilt: 0, vw: width };
  if (width <= TABLET_MAX) return { move: 0.6, drift: 0.6, tilt: 1, vw: width };
  return { move: 1, drift: 1, tilt: 1, vw: width };
}

export interface CardInput {
  fly: number;
  still: boolean;
  rot: number;
  depth: number;
  dir: number;
  outward: number;
}

export function cardPose(
  out: Pose,
  card: CardInput,
  scale: Scale,
  enter: number,
  exit: number,
  step: number,
  px: number,
  py: number
): Pose {
  const fly = FLY[card.fly % FLY.length];
  const floor = card.still ? STILL_FLOOR : fly.o;
  const progress = Math.min(enter, step);
  const done = unit((progress - fly.d) / (1 - fly.d));
  const left = 1 - done;
  const lift = 24 + (card.depth + 16) * 2.4;
  out.x =
    (left * fly.x * card.outward * scale.move * scale.vw) / 100 +
    (exit * card.outward * scale.drift * 1.2 * scale.vw) / 100 +
    px * card.depth;
  out.y = left * fly.y * scale.move - exit * lift * scale.drift + py * card.depth;
  out.rotate =
    (scale.tilt === 0 ? card.rot * 0.35 : card.rot) + left * fly.r * scale.tilt + exit * card.dir * scale.tilt * 1.6;
  out.scale = 1 - left * 0.1 - exit * 0.06;
  out.opacity = (floor + (1 - floor) * done) * (1 - exit * 0.45);
  return out;
}

export function stickerPose(
  out: Pose,
  depth: number,
  scale: Scale,
  enter: number,
  exit: number,
  step: number,
  px: number,
  py: number,
  lift = 0
): Pose {
  const grown = unit((Math.min(enter, step) - 0.4) / 0.45);
  out.x = px * depth;
  out.y = (1 - grown) * 16 * scale.move - exit * (40 + depth * 3) * scale.drift + py * depth + lift;
  out.rotate = 0;
  out.scale = 1 - (1 - grown) * 0.55 + Math.sin(grown * Math.PI) * 0.08;
  out.opacity = grown * (1 - exit * 0.5);
  return out;
}

export function noteInk(enter: number, step: number): number {
  return unit((Math.min(enter, step) - 0.55) / 0.4);
}

export function notePose(
  out: Pose,
  depth: number,
  scale: Scale,
  enter: number,
  exit: number,
  step: number,
  px: number,
  py: number
): Pose {
  const ink = noteInk(enter, step);
  out.x = px * depth;
  out.y = (1 - ink) * 10 * scale.move - exit * 50 * scale.drift + py * depth;
  out.rotate = 0;
  out.scale = 1;
  out.opacity = ink * (1 - exit * 0.5);
  return out;
}

const LAST_STAGGER = 11;

export function wordReveal(enter: number, index: number): number {
  return unit((enter - Math.min(index, LAST_STAGGER) * 0.045 - 0.05) * 2.2);
}

export interface StepWindow {
  ei: number;
  eo: number;
  lt: number;
}

export function stepWindow(out: StepWindow, u: number, index: number, lead: boolean, tail: boolean): StepWindow {
  const into = Math.max(unit((u - index + 0.12) / 0.24), lead ? 1 : 0);
  const away = Math.min(unit((u - index - 0.88) / 0.24), tail ? 0 : 1);
  out.ei = smooth(into);
  out.eo = smooth(away);
  out.lt = Math.max(unit(u - index), lead ? 1 : 0);
  return out;
}

export function reveal(lt: number, from: number, rate: number): number {
  return unit((lt - from) * rate);
}
