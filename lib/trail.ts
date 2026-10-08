interface TrailSpot {
  x: number;
  y: number;
}

export const TRAIL_START: TrailSpot = { x: 50, y: 5 };
export const TRAIL_FINISH: TrailSpot = { x: 66, y: 95 };
export const TRAIL_SPOTS: readonly TrailSpot[] = [
  { x: 34, y: 18 },
  { x: 66, y: 34 },
  { x: 34, y: 50 },
  { x: 66, y: 66 },
  { x: 34, y: 82 },
];

const SAMPLES = 32;

type Pair = [number, number];

export interface Trail {
  d: string;
  spots: TrailSpot[];
  at: number[];
  finishAt: number;
  length: number;
  cumulative: number[];
  curves: Pair[][];
}

function bezier(c: Pair[], t: number): Pair {
  const u = 1 - t;
  return [
    u * u * u * c[0][0] + 3 * u * u * t * c[1][0] + 3 * u * t * t * c[2][0] + t * t * t * c[3][0],
    u * u * u * c[0][1] + 3 * u * u * t * c[1][1] + 3 * u * t * t * c[2][1] + t * t * t * c[3][1],
  ];
}

function segmentLength(c: Pair[]): number {
  let length = 0;
  let last = c[0];
  for (let i = 1; i <= SAMPLES; i++) {
    const point = bezier(c, i / SAMPLES);
    length += Math.hypot(point[0] - last[0], point[1] - last[1]);
    last = point;
  }
  return length;
}

function assemble(curves: Pair[][], spots: TrailSpot[]): Trail {
  const lengths = curves.map(segmentLength);
  const length = lengths.reduce((a, b) => a + b, 0);
  const cumulative = [0];
  for (const l of lengths) cumulative.push(cumulative[cumulative.length - 1] + l / length);
  const d =
    `M${curves[0][0][0]} ${curves[0][0][1]} ` +
    curves.map((c) => `C${c[1][0]} ${c[1][1]} ${c[2][0]} ${c[2][1]} ${c[3][0]} ${c[3][1]}`).join(" ");
  return {
    d,
    spots,
    at: cumulative.slice(1, 1 + spots.length),
    finishAt: 1,
    length,
    cumulative,
    curves,
  };
}

export function buildTrail(count: number): Trail {
  const spots = TRAIL_SPOTS.slice(0, Math.max(0, Math.min(count, TRAIL_SPOTS.length)));
  const points = [TRAIL_START, ...spots, TRAIL_FINISH];
  const curves: Pair[][] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const h = (b.y - a.y) * 0.55;
    curves.push([
      [a.x, a.y],
      [a.x, a.y + h],
      [b.x, b.y - h],
      [b.x, b.y],
    ]);
  }
  return assemble(curves, spots);
}

export const LOOP_SPOTS: readonly TrailSpot[] = [
  { x: 9, y: 12 },
  { x: 91, y: 12 },
  { x: 91, y: 88 },
  { x: 9, y: 88 },
];

const LOOP_BOW = 9;
const LOOP_REACH = 0.3;

function split(c: Pair[]): [Pair[], Pair[]] {
  const mid = (p: Pair, q: Pair): Pair => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const ab = mid(c[0], c[1]);
  const bc = mid(c[1], c[2]);
  const cd = mid(c[2], c[3]);
  const abc = mid(ab, bc);
  const bcd = mid(bc, cd);
  const middle = mid(abc, bcd);
  return [
    [c[0], ab, abc, middle],
    [middle, bcd, cd, c[3]],
  ];
}

export function buildLoop(): Trail {
  const edges: Pair[][] = LOOP_SPOTS.map((a, i) => {
    const b = LOOP_SPOTS[(i + 1) % LOOP_SPOTS.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const nx = Math.sign(dy) * LOOP_BOW * 0.8;
    const ny = -Math.sign(dx) * LOOP_BOW;
    return [
      [a.x, a.y],
      [a.x + dx * LOOP_REACH + nx, a.y + dy * LOOP_REACH + ny],
      [b.x - dx * LOOP_REACH + nx, b.y - dy * LOOP_REACH + ny],
      [b.x, b.y],
    ];
  });
  const [before, after] = split(edges[edges.length - 1]);
  return assemble([after, ...edges.slice(0, -1), before], [...LOOP_SPOTS]);
}

const ARRIVE = 0.4;
const LEAVE = 0.72;
const LAST_LEAVE = 0.6;

function ease(t: number): number {
  return t * t * (3 - 2 * t);
}

export function loopProgress(u: number, at: readonly number[]): number {
  const count = at.length;
  const x = Math.min(count, Math.max(0, Number.isFinite(u) ? u : 0));
  let from = 0;
  let begin = 0;
  for (let k = 0; k < count; k++) {
    const arrive = k + ARRIVE;
    if (x < arrive) return from + (at[k] - from) * ease((x - begin) / (arrive - begin));
    from = at[k];
    const leave = k === count - 1 ? k + LAST_LEAVE : k + LEAVE;
    if (x < leave) return from;
    begin = leave;
  }
  return from + (1 - from) * ease((x - begin) / Math.max(1e-9, count - begin));
}

interface TrailStep {
  x: number;
  y: number;
  angle: number;
}

export function trailPoint(trail: Trail, fraction: number, aspect: number): TrailStep {
  const f = Math.min(1, Math.max(0, Number.isFinite(fraction) ? fraction : 0));
  let k = trail.curves.length - 1;
  for (let i = 0; i < trail.curves.length; i++) {
    if (f <= trail.cumulative[i + 1]) {
      k = i;
      break;
    }
  }
  const curve = trail.curves[k];
  const from = trail.cumulative[k];
  const span = Math.max(1e-9, trail.cumulative[k + 1] - from);
  const local = Math.min(1, Math.max(0, (f - from) / span));
  let seen = 0;
  let at: Pair = curve[0];
  let t = 0;
  const total = segmentLength(curve);
  const goal = local * total;
  let last = curve[0];
  for (let i = 1; i <= SAMPLES; i++) {
    const next = bezier(curve, i / SAMPLES);
    const step = Math.hypot(next[0] - last[0], next[1] - last[1]);
    if (seen + step >= goal) {
      const share = step === 0 ? 0 : (goal - seen) / step;
      t = (i - 1 + share) / SAMPLES;
      at = [last[0] + (next[0] - last[0]) * share, last[1] + (next[1] - last[1]) * share];
      break;
    }
    seen += step;
    last = next;
    t = i / SAMPLES;
    at = next;
  }
  const ahead = bezier(curve, Math.min(1, t + 0.01));
  const behind = bezier(curve, Math.max(0, t - 0.01));
  const dx = (ahead[0] - behind[0]) * 1;
  const dy = (ahead[1] - behind[1]) * aspect;
  return { x: at[0], y: at[1], angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}

export function walkerProgress(lt: number): number {
  return Math.min(1, Math.max(0, (lt - 0.1) / 0.6));
}

export function drawProgress(lt: number): number {
  return Math.min(1, Math.max(0, lt / 0.3));
}
