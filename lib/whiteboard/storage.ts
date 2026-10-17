import { newId, sanitizeEls, type El } from "@/lib/whiteboard/model";

export interface BoardMeta {
  id: string;
  name: string;
  updatedAt: number;
  count: number;
}

const INDEX = "groundwork:boards";
const LAST = "groundwork:boards:last";
const boardKey = (id: string) => `groundwork:board:${id}`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function listBoards(): BoardMeta[] {
  const list = read<BoardMeta[]>(INDEX, []);
  return Array.isArray(list) ? list.slice().sort((a, b) => b.updatedAt - a.updatedAt) : [];
}

export function loadBoard(id: string): El[] {
  return sanitizeEls(read<unknown>(boardKey(id), []), 50000);
}

export function lastBoard(): string | null {
  return read<string | null>(LAST, null);
}

export function rememberLast(id: string) {
  write(LAST, id);
}

export function hasBoard(id: string): boolean {
  return read<BoardMeta[]>(INDEX, []).some((b) => b.id === id);
}

export function saveBoard(id: string, els: El[], name?: string): boolean {
  const ok = write(boardKey(id), els);
  const list = read<BoardMeta[]>(INDEX, []);
  const existing = list.find((b) => b.id === id);
  if (!ok && existing) return false;
  const meta: BoardMeta = {
    id,
    name: name ?? existing?.name ?? "Untitled board",
    updatedAt: Date.now(),
    count: ok ? els.length : 0,
  };
  write(INDEX, [meta, ...list.filter((b) => b.id !== id)]);
  return ok;
}

export function renameBoard(id: string, name: string) {
  const list = read<BoardMeta[]>(INDEX, []);
  write(
    INDEX,
    list.map((b) => (b.id === id ? { ...b, name: name.trim().slice(0, 60) || b.name } : b))
  );
}

export function deleteBoard(id: string) {
  try {
    localStorage.removeItem(boardKey(id));
  } catch {}
  write(
    INDEX,
    read<BoardMeta[]>(INDEX, []).filter((b) => b.id !== id)
  );
}

const PREFS = "groundwork:boards:prefs";

export interface BoardPrefs {
  paper: string;
  tint: string;
  snap: boolean;
}

export function loadPrefs(): BoardPrefs {
  const p = read<Partial<BoardPrefs>>(PREFS, {});
  return {
    paper: typeof p.paper === "string" ? p.paper : "dots",
    tint: typeof p.tint === "string" ? p.tint : "auto",
    snap: p.snap !== false,
  };
}

export function savePrefs(prefs: BoardPrefs) {
  write(PREFS, prefs);
}

const PARTS = "groundwork:whiteboard:parts";
const MAX_PARTS = 40;

export interface SavedPart {
  id: string;
  name: string;
  els: El[];
}

export function listSavedParts(): SavedPart[] {
  const raw = read<unknown>(PARTS, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p): p is { id: string; name: string; els: unknown } => Boolean(p) && typeof p.id === "string")
    .map((p) => ({
      id: p.id,
      name: typeof p.name === "string" ? p.name.slice(0, 40) : "Saved part",
      els: sanitizeEls(p.els, 500),
    }))
    .filter((p) => p.els.length > 0);
}

export function addSavedPart(name: string, els: readonly El[]): boolean {
  const kept = els.filter((e) => e.kind !== "image");
  if (!kept.length) return false;
  const part: SavedPart = { id: newId(), name: name.trim().slice(0, 40) || "Saved part", els: kept };
  return write(PARTS, [part, ...listSavedParts()].slice(0, MAX_PARTS));
}

export function removeSavedPart(id: string) {
  write(
    PARTS,
    listSavedParts().filter((p) => p.id !== id)
  );
}
