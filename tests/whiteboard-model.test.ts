import { describe, expect, it } from "vitest";
import {
  bounds,
  commit,
  DEFAULT_STYLE,
  duplicate,
  elementAt,
  hitTest,
  historyOf,
  inside,
  moveEls,
  redo,
  removeEls,
  reorder,
  resizeBox,
  resizeEl,
  routeArrows,
  simplify,
  undo,
  type El,
} from "@/lib/whiteboard/model";

const box = (id: string, x: number, y: number, kind: El["kind"] = "rect"): El => ({
  id,
  kind,
  x,
  y,
  w: 100,
  h: 50,
  style: DEFAULT_STYLE,
});

const arrow = (id: string, start: string, end: string): El => ({
  id,
  kind: "arrow",
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  points: [
    [0, 0],
    [1, 1],
  ],
  style: DEFAULT_STYLE,
  start,
  end,
});

describe("finding what is under the pointer", () => {
  it("hits inside a box, near a line, and not outside an ellipse's curve", () => {
    expect(hitTest(box("a", 0, 0), [50, 25], 4)).toBe(true);
    expect(hitTest(box("e", 0, 0, "ellipse"), [2, 2], 0)).toBe(false);
    const line: El = {
      ...arrow("l", "", ""),
      kind: "line",
      start: null,
      end: null,
      points: [
        [0, 0],
        [100, 0],
      ],
    };
    expect(hitTest(line, [50, 3], 4)).toBe(true);
    expect(hitTest(line, [50, 20], 4)).toBe(false);
  });

  it("picks the topmost element", () => {
    expect(elementAt([box("under", 0, 0), box("over", 10, 10)], [20, 20], 2)?.id).toBe("over");
  });

  it("selects only what a marquee wholly contains", () => {
    expect(inside({ x: -10, y: -10, w: 200, h: 200 }, box("a", 0, 0))).toBe(true);
    expect(inside({ x: 10, y: 10, w: 200, h: 200 }, box("a", 0, 0))).toBe(false);
  });
});

describe("arrows bound to shapes", () => {
  it("run edge to edge and follow a shape that moves", () => {
    let els = routeArrows([box("a", 0, 0), box("b", 300, 0), arrow("x", "a", "b")]);
    const a = els[2];
    expect(a.x).toBeGreaterThan(100);
    expect(a.x + a.points![1][0]).toBeLessThan(300);
    els = moveEls(els, new Set(["b"]), 0, 200);
    const moved = els[2];
    expect(moved.y + moved.points![1][1]).toBeGreaterThan(150);
  });

  it("let go of a shape that is deleted", () => {
    const els = removeEls([box("a", 0, 0), box("b", 300, 0), arrow("x", "a", "b")], new Set(["a"]));
    expect(els.find((e) => e.id === "x")?.start).toBeNull();
  });
});

describe("resizing", () => {
  it("drags a corner, keeping the ratio when asked", () => {
    expect(resizeBox({ x: 0, y: 0, w: 100, h: 50 }, "se", [200, 60], false)).toEqual({ x: 0, y: 0, w: 200, h: 60 });
    expect(resizeBox({ x: 0, y: 0, w: 100, h: 50 }, "se", [200, 60], true)).toEqual({ x: 0, y: 0, w: 200, h: 100 });
  });

  it("scales a group's members with it", () => {
    const r = resizeEl(box("a", 50, 0), { x: 0, y: 0, w: 150, h: 50 }, { x: 0, y: 0, w: 300, h: 100 });
    expect(bounds(r)).toEqual({ x: 100, y: 0, w: 200, h: 100 });
  });
});

describe("editing", () => {
  it("smooths a freehand stroke to its corners", () => {
    const pts = Array.from({ length: 50 }, (_, i) => [i, i < 25 ? 0 : i - 25] as [number, number]);
    expect(simplify(pts, 0.5).length).toBeLessThanOrEqual(4);
  });

  it("duplicates with arrows reattached to the copies", () => {
    const { els, created } = duplicate(
      [box("a", 0, 0), box("b", 300, 0), arrow("x", "a", "b")],
      new Set(["a", "b", "x"])
    );
    const copy = els.find((e) => e.id === created[2])!;
    expect(created).toContain(copy.start);
    expect(created).toContain(copy.end);
  });

  it("changes stacking order", () => {
    const els = [box("a", 0, 0), box("b", 0, 0), box("c", 0, 0)];
    expect(reorder(els, new Set(["a"]), "front").map((e) => e.id)).toEqual(["b", "c", "a"]);
    expect(reorder(els, new Set(["c"]), "backward").map((e) => e.id)).toEqual(["a", "c", "b"]);
  });

  it("undoes and redoes", () => {
    let h = historyOf([]);
    h = commit(h, [box("a", 0, 0)]);
    h = commit(h, [box("a", 0, 0), box("b", 0, 0)]);
    h = undo(h);
    expect(h.present).toHaveLength(1);
    h = redo(h);
    expect(h.present).toHaveLength(2);
    h = undo(undo(undo(h)));
    expect(h.present).toHaveLength(0);
  });
});
