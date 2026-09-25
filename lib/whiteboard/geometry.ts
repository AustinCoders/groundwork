import { bounds, STICKY_FILL, type El, type Point } from "@/lib/whiteboard/model";

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

export function textBox(text: string, fontSize: number): { w: number; h: number } {
  const lines = text.split("\n");
  const longest = Math.max(1, ...lines.map((l) => l.length));
  return { w: Math.ceil(longest * fontSize * 0.58) + 8, h: Math.ceil(lines.length * fontSize * 1.25) + 8 };
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
  const label = (color: string, area: { x: number; y: number; w: number; h: number }, anchor: "middle" | "start") => {
    if (!el.text) return;
    const lines = wrapText(el.text, anchor === "middle" ? area.w - 12 : 0, el.style.fontSize);
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
      label(stroke, b, "middle");
      break;
    case "ellipse":
      parts.push({
        tag: "ellipse",
        attrs: { ...common, cx: b.x + b.w / 2, cy: b.y + b.h / 2, rx: b.w / 2, ry: b.h / 2, fill },
      });
      label(stroke, b, "middle");
      break;
    case "diamond": {
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      parts.push({
        tag: "polygon",
        attrs: { ...common, points: `${cx},${b.y} ${b.x + b.w},${cy} ${cx},${b.y + b.h} ${b.x},${cy}`, fill },
      });
      label(stroke, b, "middle");
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
      label("#1e1e1e", { ...b, y: b.y + 4 }, "start");
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
      if (el.kind === "arrow" && pts.length >= 2) {
        const [px, py] = pts[pts.length - 2];
        const [qx, qy] = pts[pts.length - 1];
        const angle = Math.atan2(qy - py, qx - px);
        const size = 10 + el.style.width * 2;
        const tip: Point = [el.x + qx, el.y + qy];
        const wing = (a: number): Point => [tip[0] - size * Math.cos(angle + a), tip[1] - size * Math.sin(angle + a)];
        const [l, r] = [wing(0.45), wing(-0.45)];
        const head = { ...common };
        delete head["stroke-dasharray"];
        parts.push({
          tag: "path",
          attrs: { ...head, d: `M${l[0]} ${l[1]} L${tip[0]} ${tip[1]} L${r[0]} ${r[1]}`, fill: "none" },
        });
      }
      break;
    }
  }
  if (el.style.opacity < 1) for (const p of parts) p.attrs.opacity = el.style.opacity;
  return parts;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);
}

export function partToSvg(part: Part): string {
  const attrs = Object.entries(part.attrs)
    .map(([k, v]) => `${k}="${escapeXml(String(v))}"`)
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
