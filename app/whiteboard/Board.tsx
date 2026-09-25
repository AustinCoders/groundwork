"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ElementView } from "./ElementView";
import { Icon, type IconName } from "./icons";
import { StylePanel } from "./StylePanel";
import { BoardMenu } from "./BoardMenu";
import { ContextMenu, type MenuItem } from "./ContextMenu";
import { Shortcuts } from "./Shortcuts";
import { TemplatesMenu } from "./TemplatesMenu";
import { PagePicker, PaperPattern, paperOf, paperVisible, tintOf, tintVars } from "./Paper";
import { textBox } from "@/lib/whiteboard/geometry";
import {
  boardShareUrl,
  compressImage,
  downloadJson,
  downloadPng,
  downloadSvg,
  hasBoardShare,
  parseBoardJson,
  pngBlob,
  readBoardShare,
} from "@/lib/whiteboard/exporter";
import {
  alignEls,
  bounds,
  commit,
  DEFAULT_STYLE,
  distributeEls,
  duplicate,
  elementAt,
  expandGroups,
  EXTRA_SHAPES,
  groupEls,
  hitTest,
  historyOf,
  holdsText,
  inside,
  isBoxKind,
  isLinear,
  movableIds,
  moveEls,
  newId,
  normalize,
  redo,
  removeEls,
  reorder,
  resizeBox,
  resizeEl,
  restyle,
  routeArrows,
  sameEls,
  setLocked,
  simplify,
  snap,
  STICKY_FILL,
  undo,
  ungroupEls,
  unionBounds,
  type Align,
  type Box,
  type El,
  type ExtraShape,
  type Handle,
  type History,
  type Point,
  type Style,
  type Tool,
} from "@/lib/whiteboard/model";
import { placeTemplate, TEMPLATES, type Template } from "@/lib/whiteboard/templates";
import {
  deleteBoard,
  hasBoard,
  lastBoard,
  listBoards,
  loadBoard,
  loadPrefs,
  rememberLast,
  renameBoard,
  saveBoard,
  savePrefs,
  type BoardMeta,
  type BoardPrefs,
} from "@/lib/whiteboard/storage";
import styles from "./whiteboard.module.css";

interface Camera {
  x: number;
  y: number;
  zoom: number;
}

type Gesture =
  | { kind: "pan"; sx: number; sy: number; cam: Camera }
  | { kind: "move"; start: Point; base: El[]; ids: Set<string>; moved: boolean }
  | { kind: "resize"; handle: Handle; box: Box; base: El[]; ids: Set<string> }
  | { kind: "endpoint"; id: string; which: "start" | "end"; base: El[]; el: El }
  | { kind: "create"; id: string; el: El; origin: Point; base: El[]; startBind: string | null }
  | { kind: "pen"; id: string; el: El; base: El[]; points: Point[] }
  | { kind: "laser" }
  | { kind: "marquee"; start: Point; additive: boolean; before: Set<string> }
  | { kind: "erase"; base: El[]; removed: Set<string> };

interface LaserPoint {
  x: number;
  y: number;
  t: number;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const LASER_MS = 700;
const HANDLES: Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

interface ToolDef {
  tool: Tool;
  label: string;
  key: string;
}

const TOOL_GROUPS: ToolDef[][] = [
  [
    { tool: "select", label: "Select", key: "V" },
    { tool: "hand", label: "Hand (pan)", key: "H" },
  ],
  [
    { tool: "pen", label: "Pen", key: "P" },
    { tool: "highlighter", label: "Highlighter", key: "M" },
    { tool: "laser", label: "Laser pointer", key: "K" },
  ],
  [
    { tool: "line", label: "Line", key: "L" },
    { tool: "arrow", label: "Arrow", key: "A" },
    { tool: "rect", label: "Rectangle", key: "R" },
    { tool: "ellipse", label: "Ellipse", key: "O" },
    { tool: "diamond", label: "Diamond", key: "D" },
  ],
  [
    { tool: "text", label: "Text", key: "T" },
    { tool: "sticky", label: "Sticky note", key: "N" },
    { tool: "eraser", label: "Eraser", key: "E" },
  ],
];

const TOOLS = TOOL_GROUPS.flat();

const SHAPE_NAMES: Record<ExtraShape, string> = {
  triangle: "Triangle",
  hexagon: "Hexagon",
  star: "Star",
  cylinder: "Cylinder (database)",
  parallelogram: "Parallelogram (input/output)",
  cloud: "Cloud",
};

const DRAWING: Tool[] = ["select", "hand", "eraser", "laser"];

function handlePoint(b: Box, h: Handle): Point {
  const x = h.includes("w") ? b.x : h.includes("e") ? b.x + b.w : b.x + b.w / 2;
  const y = h.includes("n") ? b.y : h.includes("s") ? b.y + b.h : b.y + b.h / 2;
  return [x, y];
}

function cursorFor(h: Handle): string {
  return h === "n" || h === "s"
    ? "ns-resize"
    : h === "e" || h === "w"
      ? "ew-resize"
      : h === "nw" || h === "se"
        ? "nwse-resize"
        : "nesw-resize";
}

const TEXT_INPUTS = new Set(["", "text", "search", "email", "url", "tel", "password", "number"]);

function typingInField(e: Event): boolean {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  if (t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable) return true;
  return t.tagName === "INPUT" && TEXT_INPUTS.has((t as HTMLInputElement).type);
}

function ownsKey(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  if (!t || t === document.body) return false;
  const control = t.closest("button, a, input, [role=menuitem], [role=tab]");
  if (!control) return false;
  if (e.key === " " || e.key === "Enter") return true;
  return t.tagName === "INPUT" && e.key.startsWith("Arrow");
}

function useSmallScreen(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(max-width: 720px)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(max-width: 720px)").matches,
    () => false
  );
}

function highlighterStyle(s: Style): Style {
  return {
    ...s,
    stroke: s.stroke === "ink" ? "#fab005" : s.stroke,
    width: Math.max(12, s.width * 5),
    opacity: 0.35,
    dash: "solid",
  };
}

function overlaps(a: Box, b: Box): boolean {
  return a.x <= b.x + b.w && b.x <= a.x + a.w && a.y <= b.y + b.h && b.y <= a.y + a.h;
}

export function Board() {
  const [boardId, setBoardId] = useState<string>(() => {
    const last = lastBoard();
    const known = listBoards();
    if (last && known.some((b) => b.id === last)) return last;
    if (known[0]) return known[0].id;
    const id = newId();
    saveBoard(id, [], "My first board");
    return id;
  });
  const [boards, setBoards] = useState<BoardMeta[]>(() => listBoards());
  const [hist, setHist] = useState<History>(() => historyOf(loadBoard(boardId)));
  const [initial] = useState(() => hist.present);
  const [draft, setDraft] = useState<El[] | null>(null);
  const draftRef = useRef<El[] | null>(null);
  const setLive = useCallback((next: El[] | null) => {
    draftRef.current = next;
    setDraft(next);
  }, []);
  const els = draft ?? hist.present;
  const [sel, setSel] = useState<Set<string>>(() => new Set());
  const [tool, setToolState] = useState<Tool>("select");
  const setTool = useCallback((next: Tool) => {
    setToolState(next);
    if (next !== "select" && next !== "hand") setSel(new Set());
  }, []);
  const [extraShape, setExtraShape] = useState<ExtraShape>("triangle");
  const [shapesOpen, setShapesOpen] = useState(false);
  const [style, setStyle] = useState<Style>(DEFAULT_STYLE);
  const [cam, setCam] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const [prefs, setPrefs] = useState(loadPrefs);
  const grid = prefs.snap;
  const paper = paperOf(prefs.paper);
  const tint = tintOf(prefs.tint);
  const snapStep = paper.step;
  const updatePrefs = useCallback((patch: Partial<BoardPrefs>) => {
    setPrefs((p) => {
      const next = { ...p, ...patch };
      savePrefs(next);
      return next;
    });
  }, []);
  const [editing, setEditing] = useState<string | null>(null);
  const [marquee, setMarquee] = useState<Box | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [size, setSize] = useState({ w: 1000, h: 700 });
  const [styleOpen, setStyleOpen] = useState(false);
  const [laser, setLaser] = useState<LaserPoint[]>([]);
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const pending = useRef<{ x: number; y: number; shift: boolean } | null>(null);
  const frame = useRef(0);
  const pointers = useRef(new Map<number, Point>());
  const pinch = useRef<{ dist: number; mid: Point; cam: Camera } | null>(null);
  const clipboard = useRef<El[]>([]);
  const pasteCount = useRef(0);
  const pastePending = useRef(false);
  const laserRef = useRef<LaserPoint[]>([]);
  const laserFrame = useRef(0);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stateRef = useRef({ els, sel, cam, tool, style, hist, grid, editing, snapStep, extraShape });
  useEffect(() => {
    stateRef.current = { els, sel, cam, tool, style, hist, grid, editing, snapStep, extraShape };
  });

  const say = useCallback((text: string) => {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2600);
  }, []);

  const apply = useCallback(
    (next: El[]) => setHist((h) => (next === h.present || sameEls(next, h.present) ? h : commit(h, next))),
    []
  );
  const lastTouch = useRef<{ key: string; t: number } | null>(null);
  const applyCoalesced = useCallback((key: string, next: El[]) => {
    const now = Date.now();
    const prev = lastTouch.current;
    lastTouch.current = { key, t: now };
    if (prev && prev.key === key && now - prev.t < 900) setHist((h) => ({ ...h, present: next, future: [] }));
    else setHist((h) => commit(h, next));
  }, []);
  const replacePresent = useCallback((next: El[]) => setHist((h) => ({ ...h, present: next })), []);
  const dropLast = useCallback(
    () =>
      setHist((h) =>
        h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [] } : h
      ),
    []
  );
  const fresh = useRef<string | null>(null);
  const loaded = useRef<El[] | null>(initial);
  const small = useSmallScreen();

  useEffect(() => {
    if (loaded.current === hist.present) return;
    const t = setTimeout(() => {
      if (!saveBoard(boardId, hist.present))
        say("This browser is out of room — export the board or remove some images.");
      setBoards(listBoards());
    }, 400);
    return () => clearTimeout(t);
  }, [hist.present, boardId, say]);

  useEffect(() => rememberLast(boardId), [boardId]);

  useEffect(() => {
    const flush = () => saveBoard(boardId, stateRef.current.hist.present);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, [boardId]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!shapesOpen) return;
    function onDown(e: PointerEvent) {
      if (!shapesRef.current?.contains(e.target as Node)) setShapesOpen(false);
    }
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [shapesOpen]);

  useEffect(() => () => cancelAnimationFrame(laserFrame.current), []);

  const boardRef = useRef(boardId);
  useEffect(() => {
    boardRef.current = boardId;
  }, [boardId]);

  useEffect(() => {
    const release = () => setSpaceHeld(false);
    window.addEventListener("blur", release);
    return () => window.removeEventListener("blur", release);
  }, []);

  const openBoard = useCallback((id: string) => {
    const prev = boardRef.current;
    if (prev !== id && hasBoard(prev) && loaded.current !== stateRef.current.hist.present)
      saveBoard(prev, stateRef.current.hist.present);
    const els0 = loadBoard(id);
    loaded.current = els0;
    boardRef.current = id;
    setBoardId(id);
    setHist(historyOf(els0));
    setSel(new Set());
    setEditing(null);
    setCam({ x: 0, y: 0, zoom: 1 });
  }, []);

  useEffect(() => {
    async function fromLink() {
      if (!hasBoardShare(location.hash)) return;
      const shared = await readBoardShare(location.hash);
      history.replaceState(null, "", location.pathname + location.search);
      if (!shared) return say("That board link could not be read.");
      const id = newId();
      saveBoard(id, routeArrows(shared.els), `${shared.name} (shared)`);
      setBoards(listBoards());
      openBoard(id);
      say(`Opened “${shared.name}” as a new board — yours are untouched.`);
    }
    void fromLink();
  }, [openBoard, say]);

  const toWorld = useCallback((clientX: number, clientY: number): Point => {
    const r = svgRef.current!.getBoundingClientRect();
    const { cam: c } = stateRef.current;
    return [(clientX - r.left) / c.zoom - c.x, (clientY - r.top) / c.zoom - c.y];
  }, []);

  const viewCentre = useCallback((): Point => {
    const r = svgRef.current?.getBoundingClientRect();
    const c = stateRef.current.cam;
    return [(r?.width ?? 0) / 2 / c.zoom - c.x, (r?.height ?? 0) / 2 / c.zoom - c.y];
  }, []);

  const zoomAt = useCallback((factor: number, clientX?: number, clientY?: number) => {
    setCam((c) => {
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, c.zoom * factor));
      const r = svgRef.current?.getBoundingClientRect();
      const sx = clientX !== undefined && r ? clientX - r.left : (r?.width ?? 0) / 2;
      const sy = clientY !== undefined && r ? clientY - r.top : (r?.height ?? 0) / 2;
      const wx = sx / c.zoom - c.x;
      const wy = sy / c.zoom - c.y;
      return { zoom, x: sx / zoom - wx, y: sy / zoom - wy };
    });
  }, []);

  const fitTo = useCallback((b: Box | null) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!b || !r) return setCam({ x: 0, y: 0, zoom: 1 });
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(r.width / (b.w + 160), r.height / (b.h + 200), 2)));
    setCam({ zoom, x: r.width / zoom / 2 - (b.x + b.w / 2), y: r.height / zoom / 2 - (b.y + b.h / 2) });
  }, []);

  const fitToContent = useCallback(() => fitTo(unionBounds(stateRef.current.els)), [fitTo]);

  const selected = useMemo(() => els.filter((e) => sel.has(e.id)), [els, sel]);
  const selBox = useMemo(() => unionBounds(selected), [selected]);
  const anyLocked = selected.some((e) => e.locked);
  const single = selected.length === 1 ? selected[0] : null;
  const endpointEl =
    single && (single.kind === "line" || single.kind === "arrow") && single.points?.length === 2 && !single.locked
      ? single
      : null;

  function tolerance() {
    return 6 / stateRef.current.cam.zoom;
  }

  function snapPoint(p: Point): Point {
    const { grid: on, snapStep: s } = stateRef.current;
    return [snap(p[0], s, on), snap(p[1], s, on)];
  }

  function bindTarget(p: Point, exclude?: string | null, self?: string): string | null {
    const hit = elementAt(
      stateRef.current.els.filter((e) => !isLinear(e) && e.id !== exclude && e.id !== self),
      p,
      tolerance() * 2
    );
    return hit?.id ?? null;
  }

  function startEditing(id: string) {
    setTool("select");
    setSel(new Set([id]));
    setEditing(id);
  }

  function place(kind: El["kind"], p: Point, extra: Partial<El> = {}): El {
    const s = stateRef.current.style;
    return {
      id: newId(),
      kind,
      x: p[0],
      y: p[1],
      w: 0,
      h: 0,
      style: kind === "sticky" ? { ...s, fill: s.fill === "none" ? STICKY_FILL : s.fill, fontSize: 18 } : { ...s },
      ...extra,
    };
  }

  function pumpLaser() {
    if (laserFrame.current) return;
    const tick = () => {
      const now = performance.now();
      laserRef.current = laserRef.current.filter((p) => now - p.t < LASER_MS);
      setLaser(laserRef.current.slice());
      laserFrame.current = laserRef.current.length ? requestAnimationFrame(tick) : 0;
    };
    laserFrame.current = requestAnimationFrame(tick);
  }

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (stateRef.current.editing) return;
    if (e.button === 2) return;
    setCtx(null);
    svgRef.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = null;
      setLive(null);
      setMarquee(null);
      pinch.current = {
        dist: Math.hypot(a[0] - b[0], a[1] - b[1]),
        mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
        cam: stateRef.current.cam,
      };
      return;
    }
    const { tool: t, els: all, sel: current } = stateRef.current;
    const p = toWorld(e.clientX, e.clientY);
    const sp = snapPoint(p);

    if (t === "hand" || spaceHeld || e.button === 1) {
      gesture.current = { kind: "pan", sx: e.clientX, sy: e.clientY, cam: stateRef.current.cam };
      return;
    }
    if (t === "laser") {
      gesture.current = { kind: "laser" };
      laserRef.current.push({ x: p[0], y: p[1], t: performance.now() });
      pumpLaser();
      return;
    }
    if (t === "select") {
      const endEl = (e.target as Element).closest("[data-end]");
      if (endEl && endpointEl) {
        gesture.current = {
          kind: "endpoint",
          id: endpointEl.id,
          which: endEl.getAttribute("data-end") as "start" | "end",
          base: all,
          el: endpointEl,
        };
        return;
      }
      const handleEl = (e.target as Element).closest("[data-handle]");
      if (handleEl && selBox) {
        gesture.current = {
          kind: "resize",
          handle: handleEl.getAttribute("data-handle") as Handle,
          box: selBox,
          base: all,
          ids: new Set(current),
        };
        return;
      }
      const hit = elementAt(all, p, tolerance());
      if (hit) {
        const group = expandGroups(all, new Set([hit.id]));
        let ids = current;
        if (e.shiftKey) {
          ids = new Set(current);
          const has = ids.has(hit.id);
          for (const id of group) {
            if (has) ids.delete(id);
            else ids.add(id);
          }
        } else if (!current.has(hit.id)) ids = group;
        setSel(ids);
        gesture.current = { kind: "move", start: p, base: all, ids: movableIds(all, ids), moved: false };
      } else {
        gesture.current = {
          kind: "marquee",
          start: p,
          additive: e.shiftKey,
          before: e.shiftKey ? new Set(current) : new Set(),
        };
        if (!e.shiftKey) {
          setSel(new Set());
          setStyleOpen(false);
        }
      }
      return;
    }
    if (t === "eraser") {
      const hit = elementAt(
        all.filter((el) => !el.locked),
        p,
        tolerance()
      );
      const removed = new Set(hit ? [hit.id] : []);
      gesture.current = { kind: "erase", base: all, removed };
      setLive(removeEls(all, removed));
      return;
    }
    if (t === "pen" || t === "highlighter") {
      const el = place("pen", p, { points: [[0, 0]] });
      if (t === "highlighter") el.style = highlighterStyle(el.style);
      gesture.current = { kind: "pen", id: el.id, el, base: all, points: [[0, 0]] };
      setLive([...all, el]);
      return;
    }
    if (t === "text" || t === "sticky") {
      e.preventDefault();
      const el =
        t === "text"
          ? place("text", sp, { w: 40, h: stateRef.current.style.fontSize * 1.25 + 8, text: "" })
          : place("sticky", sp, { w: 200, h: 160, text: "" });
      apply([...all, el]);
      fresh.current = el.id;
      startEditing(el.id);
      return;
    }
    const kind = isBoxKind(t) ? t : t === "arrow" ? "arrow" : "line";
    const linear = kind === "line" || kind === "arrow";
    const startBind = kind === "arrow" ? bindTarget(p) : null;
    const el = place(
      kind,
      sp,
      linear
        ? {
            points: [
              [0, 0],
              [0, 0],
            ],
            start: startBind,
            end: null,
          }
        : {}
    );
    gesture.current = { kind: "create", id: el.id, el, origin: sp, base: all, startBind };
    setLive([...all, el]);
  }

  function step(x: number, y: number, shift: boolean) {
    const g = gesture.current;
    if (!g) return;
    const { grid: snapOn, snapStep: s } = stateRef.current;
    if (g.kind === "pan") {
      const z = g.cam.zoom;
      setCam({ ...g.cam, x: g.cam.x + (x - g.sx) / z, y: g.cam.y + (y - g.sy) / z });
      return;
    }
    const p = toWorld(x, y);
    if (g.kind === "laser") {
      laserRef.current.push({ x: p[0], y: p[1], t: performance.now() });
      pumpLaser();
      return;
    }
    if (g.kind === "move") {
      if (!g.ids.size) return;
      let dx = p[0] - g.start[0];
      let dy = p[1] - g.start[1];
      if (snapOn) {
        const first = g.base.find((el) => g.ids.has(el.id));
        if (first) {
          const b = bounds(first);
          dx = snap(b.x + dx, s, true) - b.x;
          dy = snap(b.y + dy, s, true) - b.y;
        }
      }
      if (Math.abs(dx) + Math.abs(dy) > 0.5) g.moved = true;
      setLive(moveEls(g.base, g.ids, dx, dy));
      return;
    }
    if (g.kind === "resize") {
      const target = resizeBox(g.box, g.handle, snapPoint(p), shift);
      const next = g.base.map((el) => (g.ids.has(el.id) ? resizeEl(el, g.box, target) : el));
      setLive(routeArrows(next, g.ids));
      return;
    }
    if (g.kind === "endpoint") {
      const el = g.el;
      const pts = el.points!;
      const absStart: Point = [el.x + pts[0][0], el.y + pts[0][1]];
      const absEnd: Point = [el.x + pts[1][0], el.y + pts[1][1]];
      const q = snapPoint(p);
      const a = g.which === "start" ? q : absStart;
      const b = g.which === "end" ? q : absEnd;
      const moved: El = {
        ...el,
        x: a[0],
        y: a[1],
        points: [
          [0, 0],
          [b[0] - a[0], b[1] - a[1]],
        ],
        ...(g.which === "start" ? { start: null } : { end: null }),
      };
      setLive(routeArrows(g.base.map((e) => (e.id === el.id ? moved : e))));
      return;
    }
    if (g.kind === "marquee") {
      const box = { x: g.start[0], y: g.start[1], w: p[0] - g.start[0], h: p[1] - g.start[1] };
      setMarquee(normalize(box));
      const ids = new Set(g.before);
      const all = stateRef.current.els;
      for (const el of all) if (inside(box, el)) ids.add(el.id);
      setSel(expandGroups(all, ids));
      return;
    }
    if (g.kind === "erase") {
      const hit = elementAt(
        g.base.filter((el) => !g.removed.has(el.id) && !el.locked),
        p,
        tolerance()
      );
      if (hit) {
        g.removed.add(hit.id);
        setLive(removeEls(g.base, g.removed));
      }
      return;
    }
    if (g.kind === "pen") {
      const el = g.el;
      const rel: Point = [p[0] - el.x, p[1] - el.y];
      const last = g.points[g.points.length - 1];
      if (Math.hypot(rel[0] - last[0], rel[1] - last[1]) < 1.5 / stateRef.current.cam.zoom) return;
      g.points.push(rel);
      setLive([...g.base, { ...el, points: g.points.slice() }]);
      return;
    }
    if (g.kind === "create") {
      const sp = snapPoint(p);
      let dx = sp[0] - g.origin[0];
      let dy = sp[1] - g.origin[1];
      const el = g.el;
      if (isLinear(el)) {
        if (shift) {
          const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
          const len = Math.hypot(dx, dy);
          dx = Math.cos(angle) * len;
          dy = Math.sin(angle) * len;
        }
        setLive([
          ...g.base,
          {
            ...el,
            points: [
              [0, 0],
              [dx, dy],
            ],
          },
        ]);
      } else {
        if (shift) {
          const side = Math.max(Math.abs(dx), Math.abs(dy));
          dx = Math.sign(dx || 1) * side;
          dy = Math.sign(dy || 1) * side;
        }
        setLive([...g.base, { ...el, w: dx, h: dy }]);
      }
    }
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, [e.clientX, e.clientY]);
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const mid: Point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const start = pinch.current;
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, (start.cam.zoom * dist) / Math.max(1, start.dist)));
      const r = svgRef.current!.getBoundingClientRect();
      const wx = (start.mid[0] - r.left) / start.cam.zoom - start.cam.x;
      const wy = (start.mid[1] - r.top) / start.cam.zoom - start.cam.y;
      setCam({ zoom, x: (mid[0] - r.left) / zoom - wx, y: (mid[1] - r.top) / zoom - wy });
      return;
    }
    if (!gesture.current) return;
    pending.current = { x: e.clientX, y: e.clientY, shift: e.shiftKey };
    if (!frame.current)
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const next = pending.current;
        if (next) step(next.x, next.y, next.shift);
      });
  }

  function finish() {
    const g = gesture.current;
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      if (pending.current) step(pending.current.x, pending.current.y, pending.current.shift);
    }
    gesture.current = null;
    pending.current = null;
    const current = draftRef.current ?? stateRef.current.hist.present;
    setMarquee(null);
    if (!g || g.kind === "pan" || g.kind === "marquee" || g.kind === "laser") {
      setLive(null);
      return;
    }
    if (g.kind === "move" && !g.moved) {
      setLive(null);
      return;
    }
    let next = current;
    if (g.kind === "pen") {
      next = current.map((el) =>
        el.id === g.id ? { ...el, points: simplify(el.points ?? [], 0.6 / stateRef.current.cam.zoom) } : el
      );
    }
    if (g.kind === "endpoint") {
      const made = current.find((e) => e.id === g.id);
      if (made && made.kind === "arrow" && made.points) {
        const pts = made.points;
        const at: Point = g.which === "start" ? [made.x, made.y] : [made.x + pts[1][0], made.y + pts[1][1]];
        const other = g.which === "start" ? made.end : made.start;
        const target = bindTarget(at, other, made.id);
        next = routeArrows(
          current.map((e) => (e.id === made.id ? { ...e, [g.which]: target } : e)),
          new Set([made.id])
        );
      }
    }
    if (g.kind === "create") {
      const el = current.find((e) => e.id === g.id);
      if (!el) {
        setLive(null);
        return;
      }
      const b = bounds(el);
      if (b.w < 3 && b.h < 3) {
        const d =
          el.kind === "arrow" || el.kind === "line"
            ? {
                points: [
                  [0, 0],
                  [120, 0],
                ] as Point[],
              }
            : { w: 120, h: 80 };
        next = current.map((e) => (e.id === el.id ? { ...e, ...d } : e));
      } else if (!isLinear(el)) {
        next = current.map((e) => (e.id === el.id ? { ...e, ...normalize({ x: e.x, y: e.y, w: e.w, h: e.h }) } : e));
      }
      if (el.kind === "arrow") {
        const made = next.find((e) => e.id === el.id)!;
        const pts = made.points!;
        const tip: Point = [made.x + pts[pts.length - 1][0], made.y + pts[pts.length - 1][1]];
        const startEl = g.startBind ? next.find((e) => e.id === g.startBind) : undefined;
        const tipInsideStart = Boolean(startEl && hitTest(startEl, tip, 0));
        const end = tipInsideStart ? null : bindTarget(tip, g.startBind, made.id);
        next = routeArrows(
          next.map((e) => (e.id === el.id ? { ...e, start: tipInsideStart ? null : e.start, end } : e)),
          new Set([el.id])
        );
      }
      setSel(new Set([el.id]));
      setTool("select");
    }
    setLive(null);
    apply(next);
  }

  function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
    pointers.current.delete(e.pointerId);
    if (pinch.current) {
      if (pointers.current.size < 2) pinch.current = null;
      return;
    }
    finish();
  }

  function onDoubleClick(e: React.MouseEvent<SVGSVGElement>) {
    const t = stateRef.current.tool;
    if (t !== "select" && t !== "hand") return;
    const p = toWorld(e.clientX, e.clientY);
    const hit = elementAt(stateRef.current.els, p, tolerance());
    if (hit) {
      if (holdsText(hit) && !hit.locked) startEditing(hit.id);
      return;
    }
    const el = place("text", p, { w: 40, h: stateRef.current.style.fontSize * 1.25 + 8, text: "" });
    apply([...stateRef.current.els, el]);
    fresh.current = el.id;
    startEditing(el.id);
  }

  function onContextMenu(e: React.MouseEvent<SVGSVGElement>) {
    e.preventDefault();
    if (gesture.current || stateRef.current.editing) return;
    const { els: all, sel: current } = stateRef.current;
    const hit = elementAt(all, toWorld(e.clientX, e.clientY), tolerance());
    if (hit && !current.has(hit.id)) setSel(expandGroups(all, new Set([hit.id])));
    if (!hit) setSel(new Set());
    const r = rootRef.current!.getBoundingClientRect();
    setCtx({ x: e.clientX - r.left, y: e.clientY - r.top });
  }

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
      else setCam((c) => ({ ...c, x: c.x - e.deltaX / c.zoom, y: c.y - e.deltaY / c.zoom }));
    }
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const addImage = useCallback(
    async (file: File, at?: Point) => {
      try {
        const { src, w, h } = await compressImage(file);
        const k = Math.min(1, 480 / Math.max(w, h));
        const centre = at ?? viewCentre();
        const el: El = {
          id: newId(),
          kind: "image",
          x: centre[0] - (w * k) / 2,
          y: centre[1] - (h * k) / 2,
          w: w * k,
          h: h * k,
          src,
          style: { ...DEFAULT_STYLE },
        };
        apply([...stateRef.current.els, el]);
        setSel(new Set([el.id]));
        setTool("select");
      } catch {
        say("That image could not be read.");
      }
    },
    [apply, say, setTool, viewCentre]
  );

  function pasteEls(source: El[]) {
    if (!source.length) return;
    const all = stateRef.current.els;
    const ids = new Set(source.map((e) => e.id));
    pasteCount.current += 1;
    const { els: withCopies, created } = duplicate(
      [...all, ...source.filter((s) => !all.some((a) => a.id === s.id))],
      ids,
      24 * pasteCount.current
    );
    const cleaned = withCopies.filter((e) => !(ids.has(e.id) && !all.some((a) => a.id === e.id)));
    apply(routeArrows(cleaned, new Set(created)));
    setSel(new Set(created));
  }

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (typingInField(e)) return;
      pastePending.current = false;
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
      if (file) {
        e.preventDefault();
        void addImage(file);
        return;
      }
      const text = e.clipboardData?.getData("text/plain");
      if (text?.includes('"groundwork-board"')) {
        const parsed = parseBoardJson(text);
        if (parsed) {
          e.preventDefault();
          pasteEls(parsed.els);
        }
      } else if (!text && clipboard.current.length) pasteEls(clipboard.current);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  const palette = useCallback(() => {
    const cs = getComputedStyle(wrapRef.current!);
    return {
      ink: cs.getPropertyValue("--wb-ink").trim() || "#1e1e1e",
      paper: cs.getPropertyValue("--wb-paper").trim() || "#ffffff",
    };
  }, []);

  function copySelection(cut: boolean) {
    const { sel: current, els: all } = stateRef.current;
    clipboard.current = all.filter((el) => current.has(el.id));
    pasteCount.current = 0;
    if (!clipboard.current.length) return;
    void navigator.clipboard
      ?.writeText(JSON.stringify({ type: "groundwork-board", version: 1, elements: clipboard.current }))
      .catch(() => {});
    if (cut) deleteSelection();
  }

  function duplicateSelection() {
    const { sel: current, els: all } = stateRef.current;
    if (!current.size) return;
    const { els: next, created } = duplicate(all, current);
    apply(next);
    setSel(new Set(created));
  }

  function deleteSelection() {
    const { sel: current, els: all } = stateRef.current;
    if (!current.size) return;
    const next = removeEls(all, current);
    if (next.length === all.length) return say("Locked items stay put — unlock them first.");
    apply(next);
    setSel(new Set([...current].filter((id) => next.some((e) => e.id === id))));
  }

  function groupSelection(on: boolean) {
    const { sel: current, els: all } = stateRef.current;
    if (on && current.size < 2) return;
    apply(on ? groupEls(all, current) : ungroupEls(all, current));
  }

  function toggleLock() {
    const { sel: current, els: all } = stateRef.current;
    if (!current.size) return;
    const lock = !all.filter((e) => current.has(e.id)).every((e) => e.locked);
    apply(setLocked(all, current, lock));
    say(lock ? "Locked — it can't be moved or deleted until you unlock it." : "Unlocked.");
  }

  async function copyPng() {
    const { sel: current, els: all } = stateRef.current;
    const target = current.size ? all.filter((e) => current.has(e.id)) : all;
    if (!target.length) return say("The board is empty — draw something first.");
    try {
      const p = palette();
      const blob = await pngBlob(target, p, p.paper);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      say(current.size ? "Selection copied as an image." : "Board copied as an image.");
    } catch {
      say("This browser would not copy the image — use Export → PNG instead.");
    }
  }

  function toggleFullscreen() {
    const root = rootRef.current;
    if (!root) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (root.requestFullscreen)
      void root.requestFullscreen().catch(() => say("Full screen is not available here."));
    else say("Full screen is not available here.");
  }

  function insertTemplate(t: Template) {
    const made = placeTemplate(t, viewCentre());
    apply([...stateRef.current.els, ...made]);
    setSel(new Set(made.map((e) => e.id)));
    setTool("select");
    const b = unionBounds(made);
    const r = svgRef.current?.getBoundingClientRect();
    const z = stateRef.current.cam.zoom;
    if (b && r && (b.w * z > r.width - 80 || b.h * z > r.height - 160)) fitTo(b);
  }

  function pickExtraShape(s: ExtraShape) {
    setExtraShape(s);
    setTool(s);
    setShapesOpen(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (typingInField(e) || ownsKey(e) || stateRef.current.editing) return;
      if ((e.target as HTMLElement | null)?.closest?.("dialog")) return;
      const mod = e.metaKey || e.ctrlKey;
      const { sel: current, els: all, hist: h } = stateRef.current;
      const k = e.key.toLowerCase();
      if (e.key === " " && !e.repeat) {
        setSpaceHeld(true);
        e.preventDefault();
        return;
      }
      if (mod && k === "z") {
        e.preventDefault();
        setSel(new Set());
        setHist(e.shiftKey ? redo(h) : undo(h));
        return;
      }
      if (mod && k === "y") {
        e.preventDefault();
        setHist(redo(h));
        return;
      }
      if (mod && k === "a") {
        e.preventDefault();
        setSel(new Set(all.map((el) => el.id)));
        return;
      }
      if (mod && k === "d") {
        e.preventDefault();
        duplicateSelection();
        return;
      }
      if (mod && e.shiftKey && k === "c") {
        e.preventDefault();
        void copyPng();
        return;
      }
      if (mod && k === "c") {
        copySelection(false);
        return;
      }
      if (mod && k === "x") {
        copySelection(true);
        return;
      }
      if (mod && k === "v" && clipboard.current.length) {
        pastePending.current = true;
        setTimeout(() => {
          if (!pastePending.current) return;
          pastePending.current = false;
          pasteEls(clipboard.current);
        }, 60);
        return;
      }
      if (mod && k === "g") {
        e.preventDefault();
        groupSelection(!e.shiftKey);
        return;
      }
      if (mod && e.shiftKey && k === "l") {
        e.preventDefault();
        toggleLock();
        return;
      }
      if (mod && (k === "=" || k === "+")) {
        e.preventDefault();
        zoomAt(1.2);
        return;
      }
      if (mod && k === "-") {
        e.preventDefault();
        zoomAt(1 / 1.2);
        return;
      }
      if (mod && k === "0") {
        e.preventDefault();
        zoomAt(1 / stateRef.current.cam.zoom);
        return;
      }
      if (mod || e.altKey) return;
      if (e.shiftKey && e.code === "Digit1") {
        fitToContent();
        return;
      }
      if (e.shiftKey && e.code === "Digit2") {
        fitTo(unionBounds(all.filter((el) => current.has(el.id))));
        return;
      }
      if (e.key === "?") {
        setHelpOpen(true);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && current.size) {
        e.preventDefault();
        deleteSelection();
        return;
      }
      if (e.key === "Escape") {
        setSel(new Set());
        setTool("select");
        setShapesOpen(false);
        return;
      }
      if (e.key === "Enter" && current.size === 1) {
        const only = all.find((el) => current.has(el.id));
        if (only && holdsText(only) && !only.locked) {
          e.preventDefault();
          startEditing(only.id);
        }
        return;
      }
      if (e.key.startsWith("Arrow") && current.size) {
        e.preventDefault();
        const d = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -d : e.key === "ArrowRight" ? d : 0;
        const dy = e.key === "ArrowUp" ? -d : e.key === "ArrowDown" ? d : 0;
        apply(moveEls(all, movableIds(all, current), dx, dy));
        return;
      }
      if (e.code === "BracketRight" || e.code === "BracketLeft") {
        apply(
          reorder(
            all,
            current,
            e.code === "BracketRight" ? (e.shiftKey ? "front" : "forward") : e.shiftKey ? "back" : "backward"
          )
        );
        return;
      }
      if (e.shiftKey) return;
      if (k === "g") {
        updatePrefs({ snap: !stateRef.current.grid });
        say(stateRef.current.grid ? "Snapping off." : "Snapping on.");
        return;
      }
      if (k === "f") {
        toggleFullscreen();
        return;
      }
      if (k === "i") {
        fileRef.current?.click();
        return;
      }
      if (k === "s") {
        setTool(stateRef.current.extraShape);
        return;
      }
      const match = TOOLS.find((t) => t.key.toLowerCase() === k);
      if (match) setTool(match.tool);
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === " ") setSpaceHeld(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  });

  function commitText(id: string, text: string) {
    setEditing(null);
    const isFresh = fresh.current === id;
    fresh.current = null;
    const all = stateRef.current.hist.present;
    const el = all.find((e) => e.id === id);
    if (!el) return;
    if (el.kind === "text" && !text.trim()) {
      if (isFresh) dropLast();
      else apply(removeEls(all, new Set([id])));
      setSel(new Set());
      return;
    }
    if ((el.text ?? "") === text) return;
    const size = el.kind === "text" ? textBox(text, el.style.fontSize) : null;
    const next = all.map((e) => (e.id === id ? { ...e, text, ...(size ? { w: size.w, h: size.h } : {}) } : e));
    if (isFresh) replacePresent(next);
    else apply(next);
  }

  function setStyleFor(patch: Partial<Style>) {
    setStyle((s) => ({ ...s, ...patch }));
    if (!sel.size) return;
    const next = restyle(hist.present, sel, patch);
    if (patch.opacity !== undefined) return applyCoalesced(`opacity:${[...sel].join()}`, next);
    apply(
      patch.fontSize
        ? next.map((e) =>
            sel.has(e.id) && e.kind === "text" && e.text ? { ...e, ...textBox(e.text, e.style.fontSize) } : e
          )
        : next
    );
  }

  async function exportAs(kind: "png" | "svg" | "json") {
    const all = hist.present;
    const target = sel.size ? all.filter((e) => sel.has(e.id)) : all;
    if (!target.length) return say("The board is empty — draw something first.");
    const name = boards.find((b) => b.id === boardId)?.name ?? "board";
    const p = palette();
    if (kind === "png") await downloadPng(target, p, p.paper, name);
    else if (kind === "svg") downloadSvg(target, p, p.paper, name);
    else downloadJson(all, name);
  }

  async function share() {
    const name = boards.find((b) => b.id === boardId)?.name ?? "Board";
    const { url, droppedImages } = await boardShareUrl(hist.present, name);
    if (url.length > 60_000) return say("This board is too big for a link — export it as JSON instead.");
    try {
      await navigator.clipboard.writeText(url);
      say(droppedImages ? `Link copied — images are left out of links (${droppedImages}).` : "Link copied.");
    } catch {
      say("Could not copy the link.");
    }
  }

  function importJson(text: string) {
    const parsed = parseBoardJson(text);
    if (!parsed) return say("That file is not a board.");
    const id = newId();
    saveBoard(id, routeArrows(parsed.els), parsed.name);
    setBoards(listBoards());
    openBoard(id);
  }

  const visible = { x: -cam.x, y: -cam.y, w: size.w / cam.zoom, h: size.h / cam.zoom };
  const pad = 200 / cam.zoom;
  const view = { x: visible.x - pad, y: visible.y - pad, w: visible.w + pad * 2, h: visible.h + pad * 2 };
  const shown =
    els.length > 150 ? els.filter((el) => sel.has(el.id) || el.id === editing || overlaps(view, bounds(el))) : els;
  const editingEl = editing ? els.find((e) => e.id === editing) : null;
  const handleSize = 9 / cam.zoom;
  const cursor =
    spaceHeld || tool === "hand"
      ? "grab"
      : tool === "select"
        ? "default"
        : tool === "eraser"
          ? "cell"
          : tool === "laser"
            ? "none"
            : "crosshair";
  const current = boards.find((b) => b.id === boardId);
  const showChip = !styleOpen && (sel.size === 0 ? !DRAWING.includes(tool) : small);
  const showPanel = styleOpen ? sel.size > 0 || !DRAWING.includes(tool) : sel.size > 0 && !small;
  const selectedGrouped = selected.some((e) => e.group);

  const ctxItems: (MenuItem | "sep")[] = sel.size
    ? [
        { label: "Cut", keys: "⌘X", run: () => copySelection(true) },
        { label: "Copy", keys: "⌘C", run: () => copySelection(false) },
        { label: "Paste", keys: "⌘V", disabled: !clipboard.current.length, run: () => pasteEls(clipboard.current) },
        { label: "Duplicate", keys: "⌘D", run: duplicateSelection },
        "sep",
        { label: "Bring to front", keys: "⇧]", run: () => apply(reorder(hist.present, sel, "front")) },
        { label: "Send to back", keys: "⇧[", run: () => apply(reorder(hist.present, sel, "back")) },
        "sep",
        ...(sel.size > 1 ? [{ label: "Group", keys: "⌘G", run: () => groupSelection(true) }] : []),
        ...(selectedGrouped ? [{ label: "Ungroup", keys: "⌘⇧G", run: () => groupSelection(false) }] : []),
        { label: anyLocked ? "Unlock" : "Lock", keys: "⌘⇧L", run: toggleLock },
        ...(single && holdsText(single) && !single.locked
          ? [{ label: "Edit text", keys: "Enter", run: () => startEditing(single.id) }]
          : []),
        { label: "Copy as PNG", keys: "⌘⇧C", run: () => void copyPng() },
        { label: "Zoom to selection", keys: "⇧2", run: () => fitTo(selBox) },
        "sep",
        { label: "Delete", keys: "Del", danger: true, run: deleteSelection },
      ]
    : [
        { label: "Paste", keys: "⌘V", disabled: !clipboard.current.length, run: () => pasteEls(clipboard.current) },
        { label: "Select all", keys: "⌘A", disabled: !els.length, run: () => setSel(new Set(els.map((e) => e.id))) },
        "sep",
        { label: "Zoom to fit", keys: "⇧1", run: fitToContent },
        { label: "Reset zoom", keys: "⌘0", run: () => zoomAt(1 / cam.zoom) },
        { label: grid ? "Turn snapping off" : "Turn snapping on", keys: "G", run: () => updatePrefs({ snap: !grid }) },
        { label: "Copy board as PNG", keys: "⌘⇧C", disabled: !els.length, run: () => void copyPng() },
        "sep",
        { label: "Keyboard shortcuts", keys: "?", run: () => setHelpOpen(true) },
      ];

  const toolButton = (t: ToolDef) => (
    <button
      key={t.tool}
      type="button"
      className={styles.tool}
      aria-pressed={tool === t.tool}
      aria-label={`${t.label} (${t.key})`}
      title={`${t.label} — ${t.key}`}
      onClick={() => setTool(t.tool)}
    >
      <Icon name={t.tool as IconName} />
      <span className={styles.toolKey} aria-hidden="true">
        {t.key}
      </span>
    </button>
  );

  const laserPath = laser.length ? laser.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ") : "";

  return (
    <div
      className={styles.app}
      id="board"
      ref={rootRef}
      style={tintVars(tint)}
      data-fullscreen={fullscreen || undefined}
      data-tint={tint.id}
    >
      <div
        ref={wrapRef}
        className={styles.stage}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = [...e.dataTransfer.files].find((x) => x.type.startsWith("image/"));
          if (f) void addImage(f, toWorld(e.clientX, e.clientY));
          else {
            const json = [...e.dataTransfer.files].find((x) => x.name.endsWith(".json"));
            if (json) void json.text().then(importJson);
          }
        }}
      >
        <svg
          ref={svgRef}
          className={styles.svg}
          style={{ cursor }}
          role="application"
          aria-label={`Whiteboard canvas with ${els.length} ${els.length === 1 ? "element" : "elements"}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={onDoubleClick}
          onContextMenu={onContextMenu}
        >
          <defs>
            <PaperPattern id="wb-paper" paper={paper} zoom={cam.zoom} />
          </defs>
          <g transform={`scale(${cam.zoom}) translate(${cam.x} ${cam.y})`}>
            {paperVisible(paper, cam.zoom) && (
              <rect x={visible.x} y={visible.y} width={visible.w} height={visible.h} fill="url(#wb-paper)" />
            )}
            {paper.margin !== undefined && (
              <path
                d={`M${paper.margin} ${visible.y}V${visible.y + visible.h}`}
                className={styles.paperMargin}
                strokeWidth={1.5 / cam.zoom}
              />
            )}
            {shown.map((el) => (
              <ElementView key={el.id} el={el} hidden={el.id === editing && el.kind === "text"} />
            ))}
            {selBox && !editing && (
              <g className={styles.selection}>
                <rect
                  x={selBox.x - 4 / cam.zoom}
                  y={selBox.y - 4 / cam.zoom}
                  width={selBox.w + 8 / cam.zoom}
                  height={selBox.h + 8 / cam.zoom}
                  strokeWidth={1.5 / cam.zoom}
                  strokeDasharray={`${4 / cam.zoom} ${3 / cam.zoom}`}
                />
                {tool === "select" &&
                  !draft &&
                  !anyLocked &&
                  (endpointEl
                    ? (["start", "end"] as const).map((which) => {
                        const pts = endpointEl.points!;
                        const [px, py] = which === "start" ? pts[0] : pts[1];
                        return (
                          <circle
                            key={which}
                            data-end={which}
                            cx={endpointEl.x + px}
                            cy={endpointEl.y + py}
                            r={handleSize * 0.65}
                            strokeWidth={1.5 / cam.zoom}
                            className={styles.handle}
                            style={{ cursor: "move" }}
                          />
                        );
                      })
                    : HANDLES.map((h) => {
                        const [hx, hy] = handlePoint(selBox, h);
                        return (
                          <rect
                            key={h}
                            data-handle={h}
                            x={hx - handleSize / 2}
                            y={hy - handleSize / 2}
                            width={handleSize}
                            height={handleSize}
                            rx={2 / cam.zoom}
                            strokeWidth={1.5 / cam.zoom}
                            className={styles.handle}
                            style={{ cursor: cursorFor(h) }}
                          />
                        );
                      }))}
                {anyLocked && (
                  <g
                    transform={`translate(${selBox.x + selBox.w + 6 / cam.zoom} ${selBox.y - 22 / cam.zoom}) scale(${0.8 / cam.zoom})`}
                    className={styles.lockBadge}
                  >
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 018 0v4" fill="none" />
                  </g>
                )}
              </g>
            )}
            {marquee && (
              <rect
                className={styles.marquee}
                x={marquee.x}
                y={marquee.y}
                width={marquee.w}
                height={marquee.h}
                strokeWidth={1 / cam.zoom}
              />
            )}
            {laserPath && (
              <>
                <path d={laserPath} className={styles.laserGlow} strokeWidth={10 / cam.zoom} />
                <path d={laserPath} className={styles.laser} strokeWidth={3 / cam.zoom} />
              </>
            )}
          </g>
        </svg>

        {editingEl && (
          <TextEditor key={editingEl.id} el={editingEl} cam={cam} onDone={(text) => commitText(editingEl.id, text)} />
        )}

        {!els.length && !draft && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Pick a tool and draw — or double-click anywhere to write.</p>
            <p className={styles.emptyKeys} aria-hidden="true">
              <kbd>R</kbd> box · <kbd>A</kbd> arrow · <kbd>P</kbd> pen · <kbd>T</kbd> text · <kbd>Space</kbd> + drag to
              pan · <kbd>?</kbd> all shortcuts
            </p>
            <div className={styles.emptyStart}>
              <span>Or start from</span>
              {TEMPLATES.slice(0, 4).map((t) => (
                <button key={t.id} type="button" onClick={() => insertTemplate(t)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={`${styles.island} ${styles.islandTL}`}>
        <BoardMenu
          boards={boards}
          current={current}
          onOpen={openBoard}
          onNew={() => {
            const id = newId();
            saveBoard(id, [], `Board ${listBoards().length + 1}`);
            setBoards(listBoards());
            openBoard(id);
          }}
          onRename={(name) => {
            renameBoard(boardId, name);
            setBoards(listBoards());
          }}
          onDelete={(id) => {
            deleteBoard(id);
            const rest = listBoards();
            if (id === boardId) {
              if (rest[0]) openBoard(rest[0].id);
              else {
                const fresh = newId();
                saveBoard(fresh, [], "My board");
                openBoard(fresh);
              }
            }
            setBoards(listBoards());
          }}
          onExport={exportAs}
          onCopyPng={() => void copyPng()}
          onImport={importJson}
          onShare={share}
          onClear={() => {
            if (hist.present.length && window.confirm("Clear everything on this board? Undo brings it back.")) {
              apply([]);
              setSel(new Set());
            }
          }}
        />
      </div>

      <div className={`${styles.island} ${styles.dock}`} role="toolbar" aria-label="Drawing tools">
        {TOOL_GROUPS.map((group, gi) => (
          <div key={gi} className={styles.toolGroup}>
            {group.map(toolButton)}
            {gi === 2 && (
              <div className={styles.popWrap} ref={shapesRef}>
                <button
                  type="button"
                  className={styles.tool}
                  aria-pressed={(EXTRA_SHAPES as Tool[]).includes(tool)}
                  aria-label={`More shapes: ${SHAPE_NAMES[extraShape]} (S)`}
                  aria-expanded={shapesOpen}
                  aria-haspopup="menu"
                  title="More shapes — S"
                  onClick={() => {
                    if (tool !== extraShape) setTool(extraShape);
                    setShapesOpen((v) => !v);
                  }}
                >
                  <Icon name={extraShape} />
                  <span className={styles.toolMore} aria-hidden="true" />
                  <span className={styles.toolKey} aria-hidden="true">
                    S
                  </span>
                </button>
                {shapesOpen && (
                  <div className={styles.shapesPop} role="menu" aria-label="More shapes">
                    {EXTRA_SHAPES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        role="menuitemradio"
                        aria-checked={tool === s}
                        className={styles.tool}
                        aria-label={SHAPE_NAMES[s]}
                        title={SHAPE_NAMES[s]}
                        onClick={() => pickExtraShape(s)}
                      >
                        <Icon name={s} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {gi === 3 && (
              <label className={styles.tool} title="Insert an image — I" aria-label="Insert an image (I)">
                <Icon name="image" />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="visually-hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void addImage(f);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
        ))}
      </div>

      <div className={`${styles.island} ${styles.islandTR}`}>
        <TemplatesMenu onPick={insertTemplate} />
        <button
          type="button"
          className={`${styles.islandBtn} ${styles.hideSmall}`}
          aria-label="Full screen (F)"
          aria-pressed={fullscreen}
          title="Full screen — F"
          onClick={toggleFullscreen}
        >
          <Icon name="fullscreen" />
        </button>
        <button
          type="button"
          className={`${styles.islandBtn} ${styles.hideSmall}`}
          aria-label="Keyboard shortcuts (?)"
          title="Keyboard shortcuts — ?"
          onClick={() => setHelpOpen(true)}
        >
          <Icon name="help" />
        </button>
        <button type="button" className={styles.shareBtn} onClick={() => void share()} title="Copy a share link">
          <Icon name="share" />
          <span>Share</span>
        </button>
      </div>

      <div className={`${styles.island} ${styles.islandBL}`}>
        <button
          type="button"
          className={styles.islandBtn}
          aria-label="Undo"
          title="Undo — ⌘/Ctrl Z"
          disabled={!hist.past.length}
          onClick={() => {
            setSel(new Set());
            setHist(undo);
          }}
        >
          <Icon name="undo" />
        </button>
        <button
          type="button"
          className={styles.islandBtn}
          aria-label="Redo"
          title="Redo — ⌘/Ctrl ⇧ Z"
          disabled={!hist.future.length}
          onClick={() => setHist(redo)}
        >
          <Icon name="redo" />
        </button>
        <span className={styles.islandSep} aria-hidden="true" />
        <button type="button" className={styles.islandBtn} aria-label="Zoom out" onClick={() => zoomAt(1 / 1.2)}>
          −
        </button>
        <button
          type="button"
          className={`${styles.islandBtn} ${styles.zoomPct}`}
          aria-label="Reset zoom"
          title="Reset zoom — ⌘/Ctrl 0"
          onClick={() => zoomAt(1 / cam.zoom)}
        >
          {Math.round(cam.zoom * 100)}%
        </button>
        <button type="button" className={styles.islandBtn} aria-label="Zoom in" onClick={() => zoomAt(1.2)}>
          +
        </button>
        <button
          type="button"
          className={styles.islandBtn}
          aria-label="Fit everything"
          title="Fit everything — ⇧1"
          onClick={fitToContent}
        >
          ⤢
        </button>
        <span className={styles.islandSep} aria-hidden="true" />
        <PagePicker
          paper={paper}
          tint={tint}
          onPaper={(id) => updatePrefs({ paper: id })}
          onTint={(id) => updatePrefs({ tint: id })}
          snap={grid}
          onSnap={(v) => updatePrefs({ snap: v })}
        />
      </div>

      {showChip && (
        <button type="button" className={styles.styleChip} onClick={() => setStyleOpen(true)} aria-expanded={false}>
          <span
            className={styles.styleDot}
            style={{ background: style.stroke === "ink" ? "var(--wb-ink)" : style.stroke }}
          />
          Style
        </button>
      )}
      {showPanel && (
        <StylePanel
          onClose={sel.size && !small ? () => setSel(new Set()) : () => setStyleOpen(false)}
          style={selected[0]?.style ?? style}
          kinds={selected.length ? selected.map((e) => e.kind) : [tool]}
          count={sel.size}
          locked={anyLocked}
          grouped={selectedGrouped}
          onStyle={setStyleFor}
          onLayer={(to) => apply(reorder(hist.present, sel, to))}
          onAlign={(how: Align) => apply(alignEls(hist.present, sel, how))}
          onDistribute={(axis) => apply(distributeEls(hist.present, sel, axis))}
          onGroup={groupSelection}
          onLock={toggleLock}
          onDuplicate={duplicateSelection}
          onDelete={deleteSelection}
        />
      )}

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      {ctx && <ContextMenu x={ctx.x} y={ctx.y} items={ctxItems} onClose={() => setCtx(null)} />}
      {helpOpen && <Shortcuts onClose={() => setHelpOpen(false)} />}
    </div>
  );
}

function TextEditor({ el, cam, onDone }: { el: El; cam: Camera; onDone: (text: string) => void }) {
  const [text, setText] = useState(el.text ?? "");
  const ref = useRef<HTMLTextAreaElement>(null);
  const b = bounds(el);
  const boxed = el.kind !== "text";
  const fit = el.kind === "text" ? textBox(text || " ", el.style.fontSize) : { w: b.w, h: b.h };
  const done = useRef(false);
  const finish = (value: string) => {
    if (done.current) return;
    done.current = true;
    onDone(value);
  };
  useEffect(() => {
    const node = ref.current;
    node?.focus();
    node?.select();
    const raf = requestAnimationFrame(() => {
      if (node && document.activeElement !== node) node.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <textarea
      ref={ref}
      className={styles.editor}
      data-boxed={boxed || undefined}
      aria-label="Text"
      value={text}
      spellCheck={false}
      style={{
        left: (b.x + cam.x) * cam.zoom,
        top: (b.y + cam.y) * cam.zoom,
        width: Math.max(60, fit.w + 24) * cam.zoom,
        height: Math.max(fit.h, el.style.fontSize * 1.6) * cam.zoom,
        fontSize: el.style.fontSize * cam.zoom,
        color: el.kind === "sticky" ? "#1e1e1e" : el.style.stroke === "ink" ? "var(--wb-ink)" : el.style.stroke,
        textAlign: boxed && el.kind !== "sticky" ? "center" : "left",
      }}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => finish(text)}
      onKeyDown={(e) => {
        if (e.key === "Escape" || ((e.metaKey || e.ctrlKey) && e.key === "Enter")) {
          e.preventDefault();
          finish(text);
        }
      }}
    />
  );
}
