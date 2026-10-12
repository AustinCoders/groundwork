import { smooth, unit } from "@/lib/math";

export const FLIP_FROM = 0.4;
export const STRIPS = 6;
export const PERSPECTIVE = 9000;
const LIFT = 4;
const SHADE = 0.3;
const CAST = 0.4;
const HALF_TURN = 180;
const LEAD = 1.3;
const LEGIBLE = 0.8;
const FADE = 0.45;
const MAX_VEIL = 0.2;

export interface Flip {
  turned: number;
  angle: number;
  cast: number;
  lift: number;
  spine: number;
  free: number;
}

export interface Bend {
  angles: number[];
  shade: number[];
  veil: number[];
}

export function pageFlip(out: Flip, u: number, step: number, last: boolean): Flip {
  const turned = last ? 0 : smooth(unit((u - step - FLIP_FROM) / (1 - FLIP_FROM)));
  out.turned = turned;
  out.angle = -HALF_TURN * turned;
  out.cast = CAST * Math.sin(Math.PI * turned);
  out.lift = LIFT * Math.sin(Math.PI * turned);
  out.free = -HALF_TURN * smooth(unit(turned * LEAD));
  out.spine = -HALF_TURN * smooth(unit(turned * LEAD - (LEAD - 1)));
  return out;
}

export function bendLeaf(out: Bend, flip: Flip, count: number): Bend {
  let before = 0;
  for (let i = 0; i < count; i++) {
    const along = count > 1 ? i / (count - 1) : 0;
    const absolute = flip.spine + (flip.free - flip.spine) * along;
    out.angles[i] = absolute - before;
    before = absolute;
    out.shade[i] = SHADE * Math.abs(Math.sin((absolute * Math.PI) / HALF_TURN)) ** 1.4;
    out.veil[i] = MAX_VEIL * smooth(unit((LEGIBLE - Math.abs(Math.cos((absolute * Math.PI) / HALF_TURN))) / FADE));
  }
  return out;
}
