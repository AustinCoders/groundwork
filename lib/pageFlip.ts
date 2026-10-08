export const FLIP_FROM = 0.4;
export const STRIPS = 6;
export const PERSPECTIVE = 4800;
const LIFT = 8;
const SHADE = 0.3;
const CAST = 0.4;
const HALF_TURN = 180;
const LEAD = 1.6;
const CURL = 1.25;

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
}

function unit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

export function pageFlip(out: Flip, u: number, step: number, last: boolean): Flip {
  const turned = last ? 0 : smooth(unit((u - step - FLIP_FROM) / (1 - FLIP_FROM)));
  out.turned = turned;
  out.angle = -HALF_TURN * turned;
  out.cast = CAST * Math.sin(Math.PI * turned);
  out.lift = LIFT * Math.sin(Math.PI * turned);
  out.spine = -HALF_TURN * smooth(unit(turned * LEAD));
  out.free = -HALF_TURN * smooth(unit(turned * LEAD - (LEAD - 1)));
  return out;
}

export function bendLeaf(out: Bend, flip: Flip, count: number): Bend {
  let before = 0;
  for (let i = 0; i < count; i++) {
    const along = count > 1 ? i / (count - 1) : 0;
    const absolute = flip.spine + (flip.free - flip.spine) * along ** CURL;
    out.angles[i] = absolute - before;
    before = absolute;
    out.shade[i] = SHADE * Math.abs(Math.sin((absolute * Math.PI) / HALF_TURN)) ** 1.4;
  }
  return out;
}
