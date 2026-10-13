export interface Trail {
  path: string;
  title: string;
}

const HERE = "groundwork:nav:here";
const FROM = "groundwork:nav:from";

function asTrail(value: unknown): Trail | null {
  if (value === null || typeof value !== "object") return null;
  const { path, title } = value as Record<string, unknown>;
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) return null;
  return { path, title: typeof title === "string" ? title : "" };
}

function read(key: string): Trail | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? asTrail(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function write(key: string, trail: Trail) {
  try {
    sessionStorage.setItem(key, JSON.stringify(trail));
  } catch {}
}

export function recordVisit(path: string) {
  const here = read(HERE);
  if (here && here.path !== path) write(FROM, here);
  if (!here || here.path !== path) write(HERE, { path, title: document.title });
}

export function refreshTitle(path: string) {
  const here = read(HERE);
  if (here && here.path === path) write(HERE, { path, title: document.title });
}

export function cameFromRaw(): string {
  try {
    return sessionStorage.getItem(FROM) ?? "";
  } catch {
    return "";
  }
}

export function parseTrail(raw: string, currentPath: string): Trail | null {
  if (!raw) return null;
  try {
    const t = asTrail(JSON.parse(raw));
    return t && t.path !== currentPath ? t : null;
  } catch {
    return null;
  }
}

export function shortTitle(title: string): string {
  const first = title.split(/ [—·|] /)[0].trim();
  return first.length > 28 ? `${first.slice(0, 27)}…` : first || "the last page";
}
