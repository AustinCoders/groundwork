import type { El } from "@/lib/whiteboard/model";

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
  const els = read<El[]>(boardKey(id), []);
  return Array.isArray(els) ? els : [];
}

export function lastBoard(): string | null {
  return read<string | null>(LAST, null);
}

export function rememberLast(id: string) {
  write(LAST, id);
}

export function saveBoard(id: string, els: El[], name?: string): boolean {
  const ok = write(boardKey(id), els);
  const list = read<BoardMeta[]>(INDEX, []);
  const existing = list.find((b) => b.id === id);
  const meta: BoardMeta = {
    id,
    name: name ?? existing?.name ?? "Untitled board",
    updatedAt: Date.now(),
    count: els.length,
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
  snap: boolean;
}

export function loadPrefs(): BoardPrefs {
  const p = read<Partial<BoardPrefs>>(PREFS, {});
  return { paper: typeof p.paper === "string" ? p.paper : "dots", snap: p.snap !== false };
}

export function savePrefs(prefs: BoardPrefs) {
  write(PREFS, prefs);
}
