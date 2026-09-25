import { packJson, unpackJson } from "@/lib/compress";
import { describe, partToSvg, type Palette } from "@/lib/whiteboard/geometry";
import { sanitizeEls, unionBounds, type El } from "@/lib/whiteboard/model";

const PAD = 32;

export function sceneSvg(els: El[], palette: Palette, background: string | null): string {
  const b = unionBounds(els) ?? { x: 0, y: 0, w: 400, h: 300 };
  const x = b.x - PAD;
  const y = b.y - PAD;
  const w = Math.ceil(b.w + PAD * 2);
  const h = Math.ceil(b.h + PAD * 2);
  const body = els.flatMap((el) => describe(el, palette).map(partToSvg)).join("\n");
  const bg = background ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${background}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}" style="font-family: 'Kalam', 'Comic Sans MS', cursive">${bg}${body}</svg>`;
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function fileName(board: string, ext: string): string {
  const safe =
    board
      .replace(/[^\w\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "-") || "board";
  return `${safe}.${ext}`;
}

export function downloadSvg(els: El[], palette: Palette, background: string | null, board: string) {
  download(new Blob([sceneSvg(els, palette, background)], { type: "image/svg+xml" }), fileName(board, "svg"));
}

export async function pngBlob(els: El[], palette: Palette, background: string, scale = 2): Promise<Blob> {
  const svg = sceneSvg(els, palette, background);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export failed"))), "image/png")
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function downloadPng(els: El[], palette: Palette, background: string, board: string) {
  download(await pngBlob(els, palette, background), fileName(board, "png"));
}

export function downloadJson(els: El[], board: string) {
  const data = JSON.stringify({ type: "groundwork-board", version: 1, name: board, elements: els }, null, 2);
  download(new Blob([data], { type: "application/json" }), fileName(board, "json"));
}

export function parseBoardJson(text: string): { name: string; els: El[] } | null {
  try {
    const data = JSON.parse(text) as { name?: unknown; elements?: unknown };
    if (!Array.isArray(data.elements)) return null;
    const els = sanitizeEls(data.elements);
    return { name: typeof data.name === "string" ? data.name.slice(0, 60) || "Imported board" : "Imported board", els };
  } catch {
    return null;
  }
}

export async function compressImage(file: Blob, max = 1600): Promise<{ src: string; w: number; h: number }> {
  const bitmap = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * k));
  const h = Math.max(1, Math.round(bitmap.height * k));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const type = /^image\/(png|gif|webp|svg)/.test(file.type) ? "image/png" : "image/jpeg";
  return { src: canvas.toDataURL(type, 0.85), w, h };
}

const SHARE_PREFIX = "#board=";

export async function boardShareUrl(els: El[], name: string): Promise<{ url: string; droppedImages: number }> {
  const kept = els.filter((e) => e.kind !== "image");
  const packed = await packJson({ name, elements: kept });
  return { url: `${location.origin}/whiteboard${SHARE_PREFIX}${packed}`, droppedImages: els.length - kept.length };
}

export function hasBoardShare(hash: string): boolean {
  return hash.startsWith(SHARE_PREFIX);
}

export async function readBoardShare(hash: string): Promise<{ name: string; els: El[] } | null> {
  if (!hasBoardShare(hash)) return null;
  const data = await unpackJson<{ name?: unknown; elements?: unknown }>(hash.slice(SHARE_PREFIX.length));
  if (!data || !Array.isArray(data.elements)) return null;
  return {
    name: typeof data.name === "string" ? data.name.slice(0, 60) : "Shared board",
    els: sanitizeEls(data.elements, 2000),
  };
}
