export interface Trail {
  path: string;
  title: string;
}

const HERE = "groundwork:nav:here";
const FROM = "groundwork:nav:from";

function read(key: string): Trail | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Trail) : null;
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
    const t = JSON.parse(raw) as Trail;
    return t.path && t.path !== currentPath ? t : null;
  } catch {
    return null;
  }
}

export function shortTitle(title: string): string {
  const first = title.split(/ [—·|] /)[0].trim();
  return first.length > 28 ? `${first.slice(0, 27)}…` : first || "the last page";
}
