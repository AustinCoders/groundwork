import { unit } from "@/lib/math";
import { bendLeaf, pageFlip, PERSPECTIVE, STRIPS, type Bend, type Flip } from "@/lib/pageFlip";
import {
  buildLoop,
  buildTrail,
  drawProgress,
  loopProgress,
  stageRatio,
  trailPoint,
  walkerProgress,
  type Trail,
} from "@/lib/trail";
import {
  cardPose,
  edgeDraw,
  noteInk,
  notePose,
  reveal,
  scaleFor,
  starPose,
  stepWindow,
  stickerPose,
  wordReveal,
  type CardInput,
  type Pose,
  type Scale,
  type StepWindow,
} from "@/lib/pose";

export interface FxInput {
  enter: number;
  exit: number;
  p: number;
  u: number;
  t: number;
  pinned: boolean;
}

type Kind =
  | "card"
  | "sticker"
  | "spark"
  | "chip"
  | "note"
  | "copy"
  | "word"
  | "eyebrow"
  | "sub"
  | "part"
  | "reveal"
  | "light"
  | "bar"
  | "typing"
  | "fill"
  | "trail"
  | "walker"
  | "milestone"
  | "leaf"
  | "cast"
  | "stroke"
  | "star"
  | "edge";

interface Item {
  el: HTMLElement;
  kind: Kind;
  step: number;
  lead: boolean;
  tail: boolean;
  stage: HTMLElement | null;
  depth: number;
  speed: number;
  index: number;
  from: number;
  to: number;
  rate: number;
  lag: number;
  card: CardInput;
  written: string;
  arrows: SVGPathElement[];
  shades: HTMLElement[];
  strips: HTMLElement[];
  flat: HTMLElement | null;
  bend: Bend;
  trail: Trail | null;
  loop: boolean;
  aspect: number;
  at: number;
}

export interface Fx {
  items: Item[];
  input: FxInput | null;
}

const LOOP = buildLoop();
const parallax = new Map<HTMLElement, { x: number; y: number }>();
const owners = new Map<HTMLElement, Fx>();
const pose: Pose = { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };
const win: StepWindow = { ei: 1, eo: 0, lt: 1 };
const flip: Flip = { turned: 0, angle: 0, cast: 0, lift: 0, spine: 0, free: 0 };

const number = (el: HTMLElement, name: string, fallback = 0): number => {
  const raw = el.style.getPropertyValue(name);
  const value = raw === "" ? Number.NaN : Number(raw);
  return Number.isFinite(value) ? value : fallback;
};

function stageAspect(el: HTMLElement): number {
  const box = el.closest<HTMLElement>("[data-stage]")?.getBoundingClientRect();
  return box ? stageRatio(box.width, box.height) : 0;
}

function read(el: HTMLElement): Item | null {
  const kind = el.dataset.motion as Kind | undefined;
  if (!kind) return null;
  const holder = el.closest<HTMLElement>("[data-step]");
  const scene = el.closest<HTMLElement>("[data-scene-root]");
  return {
    el,
    kind,
    step: holder ? Number(holder.dataset.step) : -1,
    lead: holder?.hasAttribute("data-lead") ?? false,
    tail: holder?.hasAttribute("data-tail") ?? false,
    stage: el.closest<HTMLElement>("[data-stage]"),
    depth: number(el, "--depth"),
    speed: number(el, "--speed", 40),
    index: number(el, "--i"),
    from: Number(el.dataset.fxFrom) || 0,
    to: Number(el.dataset.fxTo) || 1,
    rate: Number(el.dataset.fxRate) || 6,
    lag: number(el, "--lag"),
    card: {
      fly: Number(el.dataset.fly) || 0,
      still: el.hasAttribute("data-still"),
      rot: number(el, "--rot"),
      depth: number(el, "--depth"),
      dir: number(el, "--dir", 1),
      outward: scene?.dataset.side === "left" ? -1 : 1,
    },
    written: "",
    arrows: kind === "note" ? Array.from(el.querySelectorAll<SVGPathElement>("svg path")) : [],
    shades: kind === "leaf" ? Array.from(el.querySelectorAll<HTMLElement>("[data-shade]")) : [],
    strips: kind === "leaf" ? Array.from(el.querySelectorAll<HTMLElement>("[data-strip]")) : [],
    flat: kind === "leaf" ? el.querySelector<HTMLElement>("[data-flat]") : null,
    bend: { angles: Array(STRIPS).fill(0), shade: Array(STRIPS).fill(0) },
    trail:
      el.dataset.fxShape === "loop" ? LOOP : kind === "walker" ? buildTrail(Number(el.dataset.fxCount) || 0) : null,
    loop: el.dataset.fxShape === "loop",
    aspect: kind === "walker" ? stageAspect(el) : 1,
    at: Number(el.dataset.fxAt) || 0,
  };
}

export function release(fx: Fx) {
  for (const item of fx.items) {
    if (!item.stage) continue;
    if (owners.get(item.stage) === fx) owners.delete(item.stage);
    parallax.delete(item.stage);
  }
}

export function collect(section: HTMLElement): Fx {
  const fx: Fx = { items: [], input: null };
  section.querySelectorAll<HTMLElement>("[data-motion]").forEach((el) => {
    const item = read(el);
    if (item) fx.items.push(item);
  });
  fx.items.forEach((item) => {
    if (item.stage) owners.set(item.stage, fx);
  });
  return fx;
}

function put(item: Item, key: string, apply: () => void) {
  if (key === item.written) return;
  item.written = key;
  apply();
}

function writePose(item: Item, rest: Pose, p: Pose) {
  const same =
    Math.abs(p.x) < 0.01 &&
    Math.abs(p.y) < 0.01 &&
    Math.abs(p.rotate - rest.rotate) < 0.01 &&
    Math.abs(p.scale - 1) < 0.0005 &&
    p.opacity > 0.9995;
  const key = same
    ? ""
    : `${p.x.toFixed(1)}|${p.y.toFixed(1)}|${p.rotate.toFixed(2)}|${p.scale.toFixed(3)}|${p.opacity.toFixed(3)}`;
  put(item, key, () => {
    const s = item.el.style;
    if (same) {
      s.translate = "";
      s.rotate = "";
      s.scale = "";
      s.opacity = "";
      return;
    }
    s.translate = `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`;
    if (item.kind === "card") s.rotate = `${p.rotate.toFixed(2)}deg`;
    s.scale = p.scale.toFixed(3);
    s.opacity = p.opacity.toFixed(3);
  });
}

function writeFade(item: Item, opacity: number, y: number, rotate: number, scale = 1) {
  const key = `${opacity.toFixed(3)}|${y.toFixed(1)}|${rotate.toFixed(2)}|${scale.toFixed(3)}`;
  put(item, key, () => {
    const s = item.el.style;
    s.opacity = opacity.toFixed(3);
    s.translate = `0px ${y.toFixed(1)}px`;
    s.rotate = rotate === 0 ? "" : `${rotate.toFixed(2)}deg`;
    s.scale = scale === 1 ? "" : scale.toFixed(3);
  });
}

const REST: Pose = { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };

function one(item: Item, input: FxInput, scale: Scale, rest: Pose) {
  const share = parallax.get(item.stage as HTMLElement);
  const px = share?.x ?? 0;
  const py = share?.y ?? 0;
  const scoped = input.pinned && item.step >= 0;
  if (scoped) stepWindow(win, input.u, item.step, item.lead, item.tail);
  const step = scoped ? win.ei : 1;
  const exit = scoped ? Math.max(win.eo, input.exit) : input.exit;
  const enter = input.enter;
  switch (item.kind) {
    case "card":
      rest.rotate = scale.tilt === 0 ? item.card.rot * 0.35 : item.card.rot;
      writePose(item, rest, cardPose(pose, item.card, scale, enter, exit, step, px, py));
      return;
    case "star":
      writePose(item, REST, starPose(pose, item.lag, scale, enter, exit));
      return;
    case "edge": {
      const draw = edgeDraw(enter, item.lag);
      put(item, draw.toFixed(3), () => {
        item.el.style.strokeDashoffset = draw >= 0.9995 ? "" : (1 - draw).toFixed(3);
      });
      return;
    }
    case "sticker":
    case "spark":
      writePose(item, REST, stickerPose(pose, item.depth, scale, enter, exit, step, px, py));
      return;
    case "chip":
      stickerPose(pose, item.depth, scale, enter, 0, step, px, py, (0.5 - input.p) * item.speed);
      pose.y = Math.round(pose.y);
      pose.x = Math.round(pose.x);
      writePose(item, REST, pose);
      return;
    case "note": {
      writePose(item, REST, notePose(pose, item.depth, scale, enter, exit, step, px, py));
      const ink = noteInk(enter, step);
      const dash = `${(160 * (1 - ink)).toFixed(1)}`;
      for (const path of item.arrows) path.style.strokeDashoffset = ink >= 0.9995 ? "" : dash;
      return;
    }
    case "copy": {
      const y = (1 - enter) * 24 - exit * 18;
      writeFade(item, 1, Math.abs(y) < 0.05 ? 0 : y, 0);
      return;
    }
    case "word": {
      const w = wordReveal(enter, item.index);
      const key = w.toFixed(3);
      put(item, w >= 0.9995 ? "" : key, () => {
        const s = item.el.style;
        if (w >= 0.9995) {
          s.opacity = "";
          s.translate = "";
          s.rotate = "";
          return;
        }
        s.opacity = (0.12 + w * 0.88).toFixed(3);
        s.translate = `0 ${((1 - w) * 0.6).toFixed(3)}em`;
        s.rotate = `${((1 - w) * 6).toFixed(2)}deg`;
      });
      return;
    }
    case "eyebrow": {
      const e = unit(enter * 2.6);
      put(item, e >= 0.9995 ? "" : e.toFixed(3), () => {
        item.el.style.opacity = e >= 0.9995 ? "" : e.toFixed(3);
        item.el.style.translate = e >= 0.9995 ? "" : `${((1 - e) * -40).toFixed(1)}px 0`;
      });
      return;
    }
    case "sub": {
      const k = unit(enter * 1.6 - 0.35);
      put(item, k >= 0.9995 ? "" : k.toFixed(3), () => {
        item.el.style.opacity = k >= 0.9995 ? "" : (0.15 + k * 0.85).toFixed(3);
      });
      return;
    }
    case "part": {
      if (!scoped) return;
      const opacity = win.ei * (1 - win.eo);
      const y = (1 - win.ei) * 30 - win.eo * 40;
      if (opacity >= 0.9995 && Math.abs(y) < 0.05) writeFade(item, 1, 0, 0);
      else writeFade(item, opacity, y, 0);
      return;
    }
    case "reveal": {
      if (!scoped) return;
      const k = reveal(win.lt, item.from, item.rate);
      writeFade(item, k, (1 - k) * 14, 0, 0.94 + k * 0.06);
      return;
    }
    case "light": {
      if (!scoped) return;
      const off = win.lt < item.from;
      put(item, off ? "off" : "on", () => {
        if (off) item.el.setAttribute("data-off", "");
        else item.el.removeAttribute("data-off");
      });
      return;
    }
    case "bar": {
      if (!scoped) return;
      const b = unit((win.lt - item.from) / (item.to - item.from));
      put(item, b.toFixed(3), () => {
        item.el.style.transform = `scaleX(${b.toFixed(3)})`;
      });
      return;
    }
    case "typing": {
      if (!scoped) return;
      const lt = win.lt;
      const o = unit(Math.min((lt - 0.3) * 24, (0.46 - lt) * 24));
      put(item, o.toFixed(3), () => {
        item.el.style.opacity = o.toFixed(3);
      });
      return;
    }
    case "fill": {
      if (!input.pinned) return;
      put(item, input.t.toFixed(3), () => {
        item.el.style.transform = `scaleX(${input.t.toFixed(3)})`;
      });
      return;
    }
    case "trail": {
      if (!scoped && !(item.loop && input.pinned)) return;
      const draw = item.loop ? loopProgress(input.u, LOOP.at) : drawProgress(unit(input.u - item.step));
      put(item, draw.toFixed(3), () => {
        item.el.style.strokeDashoffset = draw >= 0.9995 ? "" : String(1 - draw);
      });
      return;
    }
    case "walker": {
      if (!item.trail || !input.pinned || (!scoped && !item.loop)) return;
      const along = item.loop ? loopProgress(input.u, LOOP.at) : walkerProgress(unit(input.u - item.step));
      if (item.aspect === 0) return;
      const spot = trailPoint(item.trail, along, item.aspect);
      put(item, `${spot.x.toFixed(2)}|${spot.y.toFixed(2)}|${spot.angle.toFixed(1)}`, () => {
        item.el.style.left = `${spot.x.toFixed(2)}%`;
        item.el.style.top = `${spot.y.toFixed(2)}%`;
        item.el.style.rotate = `${spot.angle.toFixed(1)}deg`;
      });
      return;
    }
    case "milestone": {
      if (!input.pinned || (!scoped && !item.loop)) return;
      const along = item.loop ? loopProgress(input.u, LOOP.at) : walkerProgress(unit(input.u - item.step));
      const off = along < item.at - 0.004;
      put(item, off ? "off" : "on", () => {
        if (off) item.el.setAttribute("data-off", "");
        else item.el.removeAttribute("data-off");
      });
      return;
    }
    case "stroke": {
      if (!scoped) return;
      const k = reveal(win.lt, item.from, item.rate);
      put(item, k.toFixed(3), () => {
        item.el.style.strokeDashoffset = k >= 0.9995 ? "" : (1 - k).toFixed(3);
      });
      return;
    }
    case "leaf": {
      if (!scoped) return;
      pageFlip(flip, input.u, item.step, item.tail);
      const t = flip.turned;
      const count = item.strips.length;
      if (t > 0.0005 && t < 0.9995 && count > 0) {
        bendLeaf(item.bend, flip, count);
        put(item, `t|${t.toFixed(4)}`, () => {
          item.el.setAttribute("data-turn", "");
          for (let i = 0; i < count; i++)
            item.strips[i].style.transform =
              i === 0
                ? `perspective(${PERSPECTIVE}px) translateZ(${flip.lift.toFixed(1)}px) rotateY(${item.bend.angles[0].toFixed(2)}deg)`
                : `rotateY(${item.bend.angles[i].toFixed(2)}deg)`;
          for (let i = 0; i < item.shades.length; i++)
            item.shades[i].style.opacity = item.bend.shade[i >> 1].toFixed(3);
        });
        return;
      }
      put(item, `f|${flip.angle.toFixed(2)}`, () => {
        item.el.removeAttribute("data-turn");
        if (!item.flat) return;
        item.flat.style.transform =
          t <= 0.0005
            ? ""
            : t >= 0.9995
              ? "rotateY(-180deg)"
              : `perspective(${PERSPECTIVE}px) rotateY(${flip.angle.toFixed(2)}deg)`;
      });
      return;
    }
    case "cast": {
      if (!scoped) return;
      pageFlip(flip, input.u, item.step, item.tail);
      put(item, flip.cast.toFixed(3), () => {
        item.el.style.opacity = flip.cast.toFixed(3);
      });
      return;
    }
  }
}

const rest: Pose = { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };

export function applyFx(fx: Fx, input: FxInput, width: number) {
  fx.input = input;
  const scale = scaleFor(width);
  for (let i = 0; i < fx.items.length; i++) {
    const item = fx.items[i];
    one(item, input, scale, rest);
  }
}

export function clearFx(fx: Fx) {
  fx.input = null;
  for (const item of fx.items) {
    const s = item.el.style;
    s.translate = "";
    s.rotate = "";
    s.scale = "";
    s.opacity = "";
    s.left = "";
    s.top = "";
    s.transform = "";
    item.el.removeAttribute("data-off");
    item.el.removeAttribute("data-turn");
    s.strokeDashoffset = "";
    for (const path of item.arrows) path.style.strokeDashoffset = "";
    for (const shade of item.shades) shade.style.opacity = "";
    for (const strip of item.strips) strip.style.transform = "";
    if (item.flat) item.flat.style.transform = "";
    item.written = "";
  }
}

export function setParallax(stage: HTMLElement, x: number, y: number) {
  if (x === 0 && y === 0) parallax.delete(stage);
  else parallax.set(stage, { x, y });
  const fx = owners.get(stage);
  if (!fx?.input) return;
  const scale = scaleFor(window.innerWidth);
  for (const item of fx.items)
    if (
      item.stage === stage &&
      (item.kind === "card" ||
        item.kind === "sticker" ||
        item.kind === "spark" ||
        item.kind === "note" ||
        item.kind === "chip")
    )
      one(item, fx.input, scale, rest);
}
