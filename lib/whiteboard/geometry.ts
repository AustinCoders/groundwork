import {
  bounds,
  heads,
  polygonPoints,
  STICKY_FILL,
  textBox,
  type El,
  type Head,
  type Point,
} from "@/lib/whiteboard/model";

export { textBox };

export interface Part {
  tag: "path" | "rect" | "ellipse" | "polygon" | "image" | "text";
  attrs: Record<string, string | number>;
  lines?: string[];
}

export interface Palette {
  ink: string;
  paper: string;
}

export const CSS_PALETTE: Palette = { ink: "var(--wb-ink)", paper: "var(--wb-paper)" };

export function colour(value: string, palette: Palette): string {
  if (value === "ink") return palette.ink;
  if (value === "paper") return palette.paper;
  return value;
}

function dashArray(el: El): string | undefined {
  const w = el.style.width;
  if (el.style.dash === "dashed") return `${w * 4} ${w * 3}`;
  if (el.style.dash === "dotted") return `${w} ${w * 2.5}`;
  return undefined;
}

function smoothPath(points: Point[], ox: number, oy: number): string {
  if (!points.length) return "";
  const abs = points.map(([x, y]) => [x + ox, y + oy] as Point);
  if (abs.length === 1) return `M${abs[0][0]} ${abs[0][1]} l0.01 0`;
  if (abs.length === 2) return `M${abs[0][0]} ${abs[0][1]} L${abs[1][0]} ${abs[1][1]}`;
  let d = `M${abs[0][0]} ${abs[0][1]}`;
  for (let i = 1; i < abs.length - 1; i++) {
    const mx = (abs[i][0] + abs[i + 1][0]) / 2;
    const my = (abs[i][1] + abs[i + 1][1]) / 2;
    d += ` Q${abs[i][0]} ${abs[i][1]} ${mx} ${my}`;
  }
  const last = abs[abs.length - 1];
  return `${d} L${last[0]} ${last[1]}`;
}

export function wrapText(text: string, width: number, fontSize: number): string[] {
  const perLine = Math.max(4, Math.floor(width / (fontSize * 0.55)));
  const out: string[] = [];
  for (const para of text.split("\n")) {
    if (!width || para.length <= perLine) {
      out.push(para);
      continue;
    }
    let line = "";
    for (const word of para.split(" ")) {
      if ((line ? `${line} ${word}` : word).length > perLine && line) {
        out.push(line);
        line = word;
      } else line = line ? `${line} ${word}` : word;
    }
    out.push(line);
  }
  return out;
}

export function describe(el: El, palette: Palette): Part[] {
  const stroke = colour(el.style.stroke, palette);
  const fill = el.style.fill === "none" ? "none" : colour(el.style.fill, palette);
  const common: Record<string, string | number> = {
    stroke,
    "stroke-width": el.style.width,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };
  const dash = dashArray(el);
  if (dash) common["stroke-dasharray"] = dash;
  const b = bounds(el);
  const parts: Part[] = [];
  const onFill =
    el.style.fill !== "none" && el.style.fill !== "paper" && el.style.stroke === "ink" ? "#1e1e1e" : stroke;
  const label = (
    color: string,
    area: { x: number; y: number; w: number; h: number },
    anchor: "middle" | "start",
    wrap = anchor === "middle" ? area.w - 12 : 0
  ) => {
    if (!el.text) return;
    const lines = wrapText(el.text, wrap, el.style.fontSize);
    const lh = el.style.fontSize * 1.25;
    const top = anchor === "middle" ? area.y + area.h / 2 - (lines.length * lh) / 2 + lh * 0.8 : area.y + 4 + lh * 0.8;
    parts.push({
      tag: "text",
      attrs: {
        x: anchor === "middle" ? area.x + area.w / 2 : area.x + 4,
        y: top,
        fill: color,
        "font-size": el.style.fontSize,
        "text-anchor": anchor,
        "font-family": "var(--wb-font, 'Kalam', 'Comic Sans MS', cursive)",
      },
      lines,
    });
  };

  switch (el.kind) {
    case "rect":
      parts.push({ tag: "rect", attrs: { ...common, x: b.x, y: b.y, width: b.w, height: b.h, rx: 10, fill } });
      label(onFill, b, "middle");
      break;
    case "ellipse":
      parts.push({
        tag: "ellipse",
        attrs: { ...common, cx: b.x + b.w / 2, cy: b.y + b.h / 2, rx: b.w / 2, ry: b.h / 2, fill },
      });
      label(onFill, b, "middle");
      break;
    case "diamond":
    case "triangle":
    case "hexagon":
    case "star":
    case "parallelogram": {
      const pts = polygonPoints(el.kind, b)!;
      parts.push({ tag: "polygon", attrs: { ...common, points: pts.map((p) => p.join(",")).join(" "), fill } });
      label(onFill, el.kind === "triangle" ? { ...b, y: b.y + b.h * 0.25, h: b.h * 0.75 } : b, "middle");
      break;
    }
    case "cylinder": {
      const ry = Math.min(b.h / 4, Math.max(6, b.w * 0.12));
      const { x, y, w, h } = b;
      parts.push({
        tag: "path",
        attrs: {
          ...common,
          fill,
          d: `M${x} ${y + ry} A${w / 2} ${ry} 0 0 1 ${x + w} ${y + ry} V${y + h - ry} A${w / 2} ${ry} 0 0 1 ${x} ${y + h - ry} Z`,
        },
      });
      parts.push({
        tag: "path",
        attrs: { ...common, fill: "none", d: `M${x} ${y + ry} A${w / 2} ${ry} 0 0 0 ${x + w} ${y + ry}` },
      });
      label(onFill, { ...b, y: b.y + ry * 2, h: b.h - ry * 2 }, "middle");
      break;
    }
    case "cloud": {
      const { x, y, w, h } = b;
      const d =
        `M${x + w * 0.25} ${y + h * 0.85}` +
        ` C${x - w * 0.05} ${y + h * 0.85} ${x - w * 0.02} ${y + h * 0.42} ${x + w * 0.2} ${y + h * 0.42}` +
        ` C${x + w * 0.18} ${y + h * 0.1} ${x + w * 0.52} ${y + h * 0.02} ${x + w * 0.6} ${y + h * 0.24}` +
        ` C${x + w * 0.7} ${y + h * 0.08} ${x + w * 0.95} ${y + h * 0.18} ${x + w * 0.88} ${y + h * 0.45}` +
        ` C${x + w * 1.05} ${y + h * 0.5} ${x + w * 1.02} ${y + h * 0.88} ${x + w * 0.78} ${y + h * 0.85} Z`;
      parts.push({ tag: "path", attrs: { ...common, fill, d } });
      label(onFill, { ...b, y: b.y + b.h * 0.2, h: b.h * 0.7 }, "middle");
      break;
    }
    case "sticky": {
      const bg = el.style.fill === "none" ? STICKY_FILL : fill;
      parts.push({
        tag: "rect",
        attrs: {
          x: b.x,
          y: b.y,
          width: b.w,
          height: b.h,
          rx: 4,
          fill: bg,
          stroke: "rgba(0,0,0,0.18)",
          "stroke-width": 1,
        },
      });
      label("#1e1e1e", { ...b, y: b.y + 4 }, "start", b.w - 16);
      break;
    }
    case "text":
      label(stroke, b, "start");
      break;
    case "image":
      if (el.src)
        parts.push({
          tag: "image",
          attrs: { href: el.src, x: b.x, y: b.y, width: b.w, height: b.h, preserveAspectRatio: "none" },
        });
      break;
    case "pen":
      parts.push({ tag: "path", attrs: { ...common, d: smoothPath(el.points ?? [], el.x, el.y), fill: "none" } });
      break;
    case "line":
    case "arrow": {
      const pts = el.points ?? [];
      parts.push({ tag: "path", attrs: { ...common, d: smoothPath(pts, el.x, el.y), fill: "none" } });
      if (pts.length >= 2) {
        const h = heads(el);
        const head = { ...common };
        delete head["stroke-dasharray"];
        const n = pts.length;
        const tipEnd: Point = [el.x + pts[n - 1][0], el.y + pts[n - 1][1]];
        const fromEnd: Point = [el.x + pts[n - 2][0], el.y + pts[n - 2][1]];
        const tipStart: Point = [el.x + pts[0][0], el.y + pts[0][1]];
        const fromStart: Point = [el.x + pts[1][0], el.y + pts[1][1]];
        parts.push(...headParts(h.end, tipEnd, fromEnd, el.style.width, head, stroke));
        parts.push(...headParts(h.start, tipStart, fromStart, el.style.width, head, stroke));
      }
      break;
    }
  }
  if (el.style.opacity < 1) for (const p of parts) p.attrs.opacity = el.style.opacity;
  return parts;
}

function headParts(
  kind: Head,
  tip: Point,
  from: Point,
  width: number,
  common: Record<string, string | number>,
  stroke: string
): Part[] {
  if (kind === "none") return [];
  const angle = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
  const size = 10 + width * 2;
  const wing = (a: number, s = size): Point => [tip[0] - s * Math.cos(angle + a), tip[1] - s * Math.sin(angle + a)];
  if (kind === "dot") {
    const r = 3 + width;
    return [{ tag: "ellipse", attrs: { ...common, cx: tip[0], cy: tip[1], rx: r, ry: r, fill: stroke } }];
  }
  if (kind === "bar") {
    const [l, r] = [wing(Math.PI / 2, size / 1.6), wing(-Math.PI / 2, size / 1.6)];
    return [{ tag: "path", attrs: { ...common, d: `M${l[0]} ${l[1]} L${r[0]} ${r[1]}`, fill: "none" } }];
  }
  const [l, r] = [wing(0.45), wing(-0.45)];
  if (kind === "triangle")
    return [
      {
        tag: "polygon",
        attrs: { ...common, points: `${l[0]},${l[1]} ${tip[0]},${tip[1]} ${r[0]},${r[1]}`, fill: stroke },
      },
    ];
  return [
    { tag: "path", attrs: { ...common, d: `M${l[0]} ${l[1]} L${tip[0]} ${tip[1]} L${r[0]} ${r[1]}`, fill: "none" } },
  ];
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);
}

export function partToSvg(part: Part): string {
  const attrs = Object.entries(part.attrs)
    .map(([k, v]) => `${k}="${escapeXml(String(v).replace(/^var\(--[\w-]+,\s*(.*)\)$/, "$1"))}"`)
    .join(" ");
  if (part.tag === "text") {
    const lh = Number(part.attrs["font-size"]) * 1.25;
    const spans = (part.lines ?? [])
      .map((line, i) => `<tspan x="${part.attrs.x}" dy="${i ? lh : 0}">${escapeXml(line) || " "}</tspan>`)
      .join("");
    return `<text ${attrs}>${spans}</text>`;
  }
  return `<${part.tag} ${attrs}/>`;
}
