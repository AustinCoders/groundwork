"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ElementView } from "./ElementView";
import { Icon } from "./icons";
import { StylePanel } from "./StylePanel";
import { BoardMenu } from "./BoardMenu";
import { PagePicker, PaperPattern, isPaper, paperVisible, type Paper } from "./Paper";
import { textBox } from "@/lib/whiteboard/geometry";
import {
  boardShareUrl,
  compressImage,
  downloadJson,
  downloadPng,
  downloadSvg,
  hasBoardShare,
  parseBoardJson,
  readBoardShare,
} from "@/lib/whiteboard/exporter";
import {
  bounds,
  commit,
  DEFAULT_STYLE,
  duplicate,
  elementAt,
  historyOf,
  inside,
  isLinear,
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
  simplify,
  snap,
  STICKY_FILL,
  undo,
  unionBounds,
  type Box,
  type El,
  type Handle,
  type History,
  type Point,
  type Style,
  type Tool,
} from "@/lib/whiteboard/model";
import {
  deleteBoard,
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
  | { kind: "create"; id: string; el: El; origin: Point; base: El[]; startBind: string | null }
  | { kind: "pen"; id: string; el: El; base: El[]; points: Point[] }
  | { kind: "marquee"; start: Point; additive: boolean; before: Set<string> }
  | { kind: "erase"; base: El[]; removed: Set<string> };

const GRID = 20;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const HANDLES: Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const TOOLS: { tool: Tool; label: string; key: string }[] = [
  { tool: "select", label: "Select", key: "V" },
  { tool: "hand", label: "Hand (pan)", key: "H" },
  { tool: "pen", label: "Pen", key: "P" },
  { tool: "line", label: "Line", key: "L" },
  { tool: "arrow", label: "Arrow", key: "A" },
  { tool: "rect", label: "Rectangle", key: "R" },
  { tool: "ellipse", label: "Ellipse", key: "O" },
  { tool: "diamond", label: "Diamond", key: "D" },
  { tool: "text", label: "Text", key: "T" },
  { tool: "sticky", label: "Sticky note", key: "N" },
  { tool: "eraser", label: "Eraser", key: "E" },
];

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

function editable(el: El): boolean {
  return (
    el.kind === "text" || el.kind === "sticky" || el.kind === "rect" || el.kind === "ellipse" || el.kind === "diamond"
  );
}

function typingInField(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  return Boolean(t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable));
}

export function Board() {
  const [boards, setBoards] = useState<BoardMeta[]>(() => listBoards());
  const [boardId, setBoardId] = useState<string>(() => {
    const last = lastBoard();
    const known = listBoards();
    if (last && known.some((b) => b.id === last)) return last;
    if (known[0]) return known[0].id;
    const id = newId();
    saveBoard(id, [], "My first board");
    return id;
  });
  const [hist, setHist] = useState<History>(() => historyOf(loadBoard(boardId)));
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
  const [style, setStyle] = useState<Style>(DEFAULT_STYLE);
  const [cam, setCam] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const [prefs, setPrefs] = useState(loadPrefs);
  const grid = prefs.snap;
  const paper: Paper = isPaper(prefs.paper) ? prefs.paper : "dots";
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

  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const pending = useRef<{ x: number; y: number; shift: boolean } | null>(null);
  const frame = useRef(0);
  const pointers = useRef(new Map<number, Point>());
  const pinch = useRef<{ dist: number; mid: Point; cam: Camera } | null>(null);
  const clipboard = useRef<El[]>([]);
  const pastePending = useRef(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stateRef = useRef({ els, sel, cam, tool, style, hist, grid, editing });
  useEffect(() => {
    stateRef.current = { els, sel, cam, tool, style, hist, grid, editing };
  });

  const say = useCallback((text: string) => {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2600);
  }, []);

  const apply = useCallback((next: El[]) => setHist((h) => commit(h, next)), []);

  useEffect(() => {
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

  const openBoard = useCallback((id: string) => {
    setBoardId(id);
    setHist(historyOf(loadBoard(id)));
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

  const fitToContent = useCallback(() => {
    const b = unionBounds(stateRef.current.els);
    const r = svgRef.current?.getBoundingClientRect();
    if (!b || !r) return setCam({ x: 0, y: 0, zoom: 1 });
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(r.width / (b.w + 120), r.height / (b.h + 120), 2)));
    setCam({ zoom, x: r.width / zoom / 2 - (b.x + b.w / 2), y: r.height / zoom / 2 - (b.y + b.h / 2) });
  }, []);

  const selected = useMemo(() => els.filter((e) => sel.has(e.id)), [els, sel]);
  const selBox = useMemo(() => unionBounds(selected), [selected]);

  function tolerance() {
    return 6 / stateRef.current.cam.zoom;
  }

  function bindTarget(p: Point, exclude?: string | null): string | null {
    const hit = elementAt(
      stateRef.current.els.filter((e) => !isLinear(e) && e.id !== exclude),
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

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (stateRef.current.editing) return;
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
    const { tool: t, els: all, sel: current, grid: snapOn } = stateRef.current;
    const p = toWorld(e.clientX, e.clientY);
    const sp: Point = [snap(p[0], GRID, snapOn), snap(p[1], GRID, snapOn)];

    if (t === "hand" || spaceHeld || e.button === 1) {
      gesture.current = { kind: "pan", sx: e.clientX, sy: e.clientY, cam: stateRef.current.cam };
      return;
    }
    if (t === "select") {
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
        let ids = current;
        if (e.shiftKey) {
          ids = new Set(current);
          if (ids.has(hit.id)) ids.delete(hit.id);
          else ids.add(hit.id);
        } else if (!current.has(hit.id)) ids = new Set([hit.id]);
        setSel(ids);
        gesture.current = { kind: "move", start: p, base: all, ids: new Set(ids), moved: false };
      } else {
        gesture.current = {
          kind: "marquee",
          start: p,
          additive: e.shiftKey,
          before: e.shiftKey ? new Set(current) : new Set(),
        };
        if (!e.shiftKey) setSel(new Set());
      }
      return;
    }
    if (t === "eraser") {
      const hit = elementAt(all, p, tolerance());
      const removed = new Set(hit ? [hit.id] : []);
      gesture.current = { kind: "erase", base: all, removed };
      setLive(removeEls(all, removed));
      return;
    }
    if (t === "pen") {
      const el = place("pen", p, { points: [[0, 0]] });
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
      startEditing(el.id);
      return;
    }
    const kind = t === "rect" || t === "ellipse" || t === "diamond" ? t : t === "arrow" ? "arrow" : "line";
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
    const { grid: snapOn } = stateRef.current;
    if (g.kind === "pan") {
      const z = g.cam.zoom;
      setCam({ ...g.cam, x: g.cam.x + (x - g.sx) / z, y: g.cam.y + (y - g.sy) / z });
      return;
    }
    const p = toWorld(x, y);
    if (g.kind === "move") {
      let dx = p[0] - g.start[0];
      let dy = p[1] - g.start[1];
      if (snapOn) {
        const first = g.base.find((el) => g.ids.has(el.id));
        if (first) {
          const b = bounds(first);
          dx = snap(b.x + dx, GRID, true) - b.x;
          dy = snap(b.y + dy, GRID, true) - b.y;
        }
      }
      if (Math.abs(dx) + Math.abs(dy) > 0.5) g.moved = true;
      setLive(moveEls(g.base, g.ids, dx, dy));
      return;
    }
    if (g.kind === "resize") {
      const target = resizeBox(g.box, g.handle, [snap(p[0], GRID, snapOn), snap(p[1], GRID, snapOn)], shift);
      const next = g.base.map((el) => (g.ids.has(el.id) ? resizeEl(el, g.box, target) : el));
      setLive(routeArrows(next, g.ids));
      return;
    }
    if (g.kind === "marquee") {
      const box = { x: g.start[0], y: g.start[1], w: p[0] - g.start[0], h: p[1] - g.start[1] };
      setMarquee(normalize(box));
      const ids = new Set(g.before);
      for (const el of stateRef.current.els) if (inside(box, el)) ids.add(el.id);
      setSel(ids);
      return;
    }
    if (g.kind === "erase") {
      const hit = elementAt(
        g.base.filter((el) => !g.removed.has(el.id)),
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
      const sp: Point = [snap(p[0], GRID, snapOn), snap(p[1], GRID, snapOn)];
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
    gesture.current = null;
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      if (pending.current) step(pending.current.x, pending.current.y, pending.current.shift);
    }
    pending.current = null;
    const current = draftRef.current ?? stateRef.current.hist.present;
    setMarquee(null);
    if (!g || g.kind === "pan" || g.kind === "marquee") {
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
        const end = bindTarget(tip, g.startBind);
        next = routeArrows(
          next.map((e) => (e.id === el.id ? { ...e, end } : e)),
          new Set([el.id])
        );
      }
      setSel(new Set([el.id]));
      if (stateRef.current.tool !== "pen") setTool("select");
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
    const p = toWorld(e.clientX, e.clientY);
    const hit = elementAt(stateRef.current.els, p, tolerance());
    if (hit && editable(hit)) return startEditing(hit.id);
    if (!hit) {
      const el = place("text", p, { w: 40, h: stateRef.current.style.fontSize * 1.25 + 8, text: "" });
      apply([...stateRef.current.els, el]);
      startEditing(el.id);
    }
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
        const r = svgRef.current!.getBoundingClientRect();
        const c = stateRef.current.cam;
        const centre: Point = at ?? [r.width / 2 / c.zoom - c.x, r.height / 2 / c.zoom - c.y];
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
    [apply, say, setTool]
  );

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (typingInField(e as unknown as KeyboardEvent)) return;
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
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  function pasteEls(source: El[]) {
    if (!source.length) return;
    const all = stateRef.current.els;
    const ids = new Set(source.map((e) => e.id));
    const { els: withCopies, created } = duplicate(
      [...all, ...source.filter((s) => !all.some((a) => a.id === s.id))],
      ids,
      24
    );
    const cleaned = withCopies.filter((e) => !(ids.has(e.id) && !all.some((a) => a.id === e.id)));
    apply(routeArrows(cleaned, new Set(created)));
    setSel(new Set(created));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (typingInField(e) || stateRef.current.editing) return;
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
        const { els: next, created } = duplicate(all, current);
        apply(next);
        setSel(new Set(created));
        return;
      }
      if (mod && k === "c") {
        clipboard.current = all.filter((el) => current.has(el.id));
        if (clipboard.current.length)
          void navigator.clipboard
            ?.writeText(JSON.stringify({ type: "groundwork-board", version: 1, elements: clipboard.current }))
            .catch(() => {});
        return;
      }
      if (mod && k === "x") {
        clipboard.current = all.filter((el) => current.has(el.id));
        apply(removeEls(all, current));
        setSel(new Set());
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
        setCam({ x: 0, y: 0, zoom: 1 });
        return;
      }
      if (e.shiftKey && k === "1") {
        fitToContent();
        return;
      }
      if (mod) return;
      if ((e.key === "Delete" || e.key === "Backspace") && current.size) {
        e.preventDefault();
        apply(removeEls(all, current));
        setSel(new Set());
        return;
      }
      if (e.key === "Escape") {
        setSel(new Set());
        setTool("select");
        return;
      }
      if (e.key === "Enter" && current.size === 1) {
        const only = all.find((el) => current.has(el.id));
        if (only && editable(only)) {
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
        apply(moveEls(all, current, dx, dy));
        return;
      }
      if (e.key === "]" || e.key === "[") {
        apply(
          reorder(all, current, e.key === "]" ? (e.shiftKey ? "front" : "forward") : e.shiftKey ? "back" : "backward")
        );
        return;
      }
      if (k === "g") {
        updatePrefs({ snap: !stateRef.current.grid });
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
    const all = stateRef.current.els;
    const el = all.find((e) => e.id === id);
    if (!el) return;
    if (el.kind === "text" && !text.trim()) {
      apply(removeEls(all, new Set([id])));
      setSel(new Set());
      return;
    }
    const size = el.kind === "text" ? textBox(text, el.style.fontSize) : null;
    apply(all.map((e) => (e.id === id ? { ...e, text, ...(size ? { w: size.w, h: size.h } : {}) } : e)));
  }

  function setStyleFor(patch: Partial<Style>) {
    setStyle((s) => ({ ...s, ...patch }));
    if (sel.size) apply(restyle(hist.present, sel, patch));
  }

  const palette = useCallback(() => {
    const cs = getComputedStyle(wrapRef.current!);
    return {
      ink: cs.getPropertyValue("--wb-ink").trim() || "#1e1e1e",
      paper: cs.getPropertyValue("--wb-paper").trim() || "#ffffff",
    };
  }, []);

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
    saveBoard(id, parsed.els, parsed.name);
    setBoards(listBoards());
    openBoard(id);
  }

  const visible = {
    x: -cam.x,
    y: -cam.y,
    w: size.w / cam.zoom,
    h: size.h / cam.zoom,
  };
  const editingEl = editing ? els.find((e) => e.id === editing) : null;
  const handleSize = 9 / cam.zoom;
  const cursor =
    spaceHeld || tool === "hand" ? "grab" : tool === "select" ? "default" : tool === "eraser" ? "cell" : "crosshair";
  const current = boards.find((b) => b.id === boardId);

  return (
    <div className={styles.app} id="board">
      <div className={styles.top}>
        <BoardMenu
          boards={boards}
          current={current}
          onOpen={openBoard}
          onNew={() => {
            const id = newId();
            saveBoard(id, [], `Board ${boards.length + 1}`);
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
          onImport={importJson}
          onShare={share}
          onClear={() => {
            if (hist.present.length && window.confirm("Clear everything on this board? Undo brings it back.")) {
              apply([]);
              setSel(new Set());
            }
          }}
        />
        <div className={styles.tools} role="toolbar" aria-label="Drawing tools">
          {TOOLS.map((t) => (
            <button
              key={t.tool}
              type="button"
              className={styles.tool}
              aria-pressed={tool === t.tool}
              aria-label={`${t.label} (${t.key})`}
              title={`${t.label} — ${t.key}`}
              onClick={() => setTool(t.tool)}
            >
              <Icon name={t.tool} />
              <span className={styles.toolKey} aria-hidden="true">
                {t.key}
              </span>
            </button>
          ))}
          <label className={styles.tool} title="Insert an image" aria-label="Insert an image">
            <Icon name="image" />
            <input
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
        </div>
        <div className={styles.history}>
          <button
            type="button"
            className={styles.tool}
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
            className={styles.tool}
            aria-label="Redo"
            title="Redo — ⌘/Ctrl ⇧ Z"
            disabled={!hist.future.length}
            onClick={() => setHist(redo)}
          >
            <Icon name="redo" />
          </button>
        </div>
      </div>

      <div
        ref={wrapRef}
        className={styles.stage}
        data-grid={grid || undefined}
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
        >
          <defs>
            <PaperPattern id="wb-paper" paper={paper} zoom={cam.zoom} />
          </defs>
          <g transform={`scale(${cam.zoom}) translate(${cam.x} ${cam.y})`}>
            {paperVisible(paper, cam.zoom) && (
              <rect x={visible.x} y={visible.y} width={visible.w} height={visible.h} fill="url(#wb-paper)" />
            )}
            {els.map((el) => (
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
                  !gesture.current &&
                  HANDLES.map((h) => {
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
                  })}
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
          </g>
        </svg>

        {editingEl && (
          <TextEditor key={editingEl.id} el={editingEl} cam={cam} onDone={(text) => commitText(editingEl.id, text)} />
        )}

        {!els.length && !draft && (
          <div className={styles.empty} aria-hidden="true">
            <p>Pick a tool and draw — or double-click anywhere to write.</p>
            <p className={styles.emptyKeys}>
              <kbd>R</kbd> box · <kbd>A</kbd> arrow · <kbd>P</kbd> pen · <kbd>T</kbd> text · <kbd>Space</kbd> + drag to
              pan · paste an image
            </p>
          </div>
        )}

        <div className={styles.zoom}>
          <button type="button" aria-label="Zoom out" onClick={() => zoomAt(1 / 1.2)}>
            −
          </button>
          <button
            type="button"
            aria-label="Reset zoom"
            title="Reset zoom — ⌘/Ctrl 0"
            onClick={() => setCam((c) => ({ ...c, zoom: 1 }))}
          >
            {Math.round(cam.zoom * 100)}%
          </button>
          <button type="button" aria-label="Zoom in" onClick={() => zoomAt(1.2)}>
            +
          </button>
          <button type="button" aria-label="Fit everything" title="Fit everything — ⇧1" onClick={fitToContent}>
            ⤢
          </button>
          <PagePicker
            paper={paper}
            onPaper={(p) => updatePrefs({ paper: p })}
            snap={grid}
            onSnap={(v) => updatePrefs({ snap: v })}
          />
        </div>

        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}
      </div>

      {sel.size === 0 && !["select", "hand", "eraser"].includes(tool) && !styleOpen && (
        <button type="button" className={styles.styleChip} onClick={() => setStyleOpen(true)} aria-expanded={false}>
          <span
            className={styles.styleDot}
            style={{ background: style.stroke === "ink" ? "var(--wb-ink)" : style.stroke }}
          />
          Style
        </button>
      )}
      {(sel.size > 0 || (styleOpen && !["select", "hand", "eraser"].includes(tool))) && (
        <StylePanel
          onClose={sel.size ? () => setSel(new Set()) : () => setStyleOpen(false)}
          style={selected[0]?.style ?? style}
          kinds={selected.length ? selected.map((e) => e.kind) : [tool]}
          count={sel.size}
          onStyle={setStyleFor}
          onLayer={(to) => apply(reorder(hist.present, sel, to))}
          onDuplicate={() => {
            const { els: next, created } = duplicate(hist.present, sel);
            apply(next);
            setSel(new Set(created));
          }}
          onDelete={() => {
            apply(removeEls(hist.present, sel));
            setSel(new Set());
          }}
        />
      )}
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
