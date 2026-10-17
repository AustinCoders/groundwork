import { describe, expect, it } from "vitest";
import { describe as describeEl, CSS_PALETTE, partToSvg } from "@/lib/whiteboard/geometry";
import { sceneSvg } from "@/lib/whiteboard/exporter";
import { clearOf, partFromEls, PARTS } from "@/lib/whiteboard/library";
import {
  bounds,
  DEFAULT_STYLE,
  elbowPath,
  hitTest,
  labelPoint,
  holdsText,
  moveEls,
  pathMidpoint,
  routeArrows,
  sanitizeEls,
  setRoute,
  unionBounds,
  type Box,
  type El,
} from "@/lib/whiteboard/model";
import { TEMPLATES, placeTemplate } from "@/lib/whiteboard/templates";

const box = (id: string, x: number, y: number, w = 100, h = 50): El => ({
  id,
  kind: "rect",
  x,
  y,
  w,
  h,
  style: DEFAULT_STYLE,
});

const arrow = (id: string, start: string | null, end: string | null, style = {}, text?: string): El => ({
  id,
  kind: "arrow",
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  points: [
    [0, 0],
    [0, 0],
  ],
  start,
  end,
  style: { ...DEFAULT_STYLE, ...style },
  ...(text ? { text } : {}),
});

function orthogonal(el: El): boolean {
  const pts = el.points!;
  return pts.every((p, i) => i === 0 || p[0] === pts[i - 1][0] || p[1] === pts[i - 1][1]);
}

describe("elbow arrows", () => {
  it("leave a box sideways and bend in the gap between two boxes", () => {
    const path = elbowPath({ x: 0, y: 0, w: 100, h: 50 }, { x: 300, y: 200, w: 100, h: 50 });
    expect(path).toHaveLength(4);
    expect(path[0][0]).toBeGreaterThan(100);
    expect(path[3][0]).toBeLessThan(300);
    expect(path[1][0]).toBe(path[2][0]);
    expect(path[1][0]).toBeGreaterThan(100);
    expect(path[1][0]).toBeLessThan(300);
  });

  it("go straight when the boxes line up", () => {
    const path = elbowPath({ x: 0, y: 0, w: 100, h: 50 }, { x: 300, y: 0, w: 100, h: 50 });
    expect(path).toHaveLength(2);
    expect(path[0][1]).toBe(path[1][1]);
  });

  it("turn vertical when the boxes are stacked", () => {
    const path = elbowPath({ x: 0, y: 0, w: 100, h: 50 }, { x: 40, y: 300, w: 100, h: 50 });
    expect(path[0][1]).toBeGreaterThan(50);
    expect(path[path.length - 1][1]).toBeLessThan(300);
  });

  it("follow a bound shape that moves and stay square-cornered", () => {
    const style = { route: "elbow" as const };
    let els = routeArrows([box("a", 0, 0), box("b", 300, 120), arrow("x", "a", "b", style)]);
    expect(els[2].points!.length).toBeGreaterThan(2);
    expect(orthogonal(els[2])).toBe(true);
    els = moveEls(els, new Set(["b"]), 0, 300);
    const moved = els[2];
    const tip = moved.points![moved.points!.length - 1];
    expect(moved.y + tip[1]).toBeGreaterThan(400);
    expect(orthogonal(moved)).toBe(true);
  });

  it("route a free-standing arrow between its own two ends", () => {
    const free: El = {
      ...arrow("f", null, null, { route: "elbow" }),
      x: 10,
      y: 10,
      points: [
        [0, 0],
        [200, 90],
      ],
    };
    const [routed] = routeArrows([free]);
    expect(routed.points!.length).toBe(4);
    expect(routed.x).toBe(10);
    expect(routed.y).toBe(10);
    const tip = routed.points![3];
    expect([tip[0], tip[1]]).toEqual([200, 90]);
  });

  it("switch between straight and elbow without losing the ends", () => {
    const start = routeArrows([box("a", 0, 0), box("b", 300, 120), arrow("x", "a", "b")]);
    const elbow = setRoute(start, new Set(["x"]), "elbow");
    expect(elbow[2].style.route).toBe("elbow");
    expect(elbow[2].points!.length).toBeGreaterThan(2);
    const straight = setRoute(elbow, new Set(["x"]), "straight");
    expect(straight[2].points).toHaveLength(2);
    expect(straight[2].start).toBe("a");
    expect(straight[2].end).toBe("b");
  });

  it("leave boxes, locked arrows and other kinds alone", () => {
    const rect = box("a", 0, 0);
    const locked = { ...arrow("x", null, null), locked: true };
    expect(setRoute([rect, locked], new Set(["a", "x"]), "elbow")).toEqual([rect, locked]);
  });

  it("are hit-tested along every bend", () => {
    const [routed] = routeArrows([
      {
        ...arrow("f", null, null, { route: "elbow" }),
        points: [
          [0, 0],
          [200, 90],
        ],
      },
    ]);
    const mid = routed.points![1];
    expect(hitTest(routed, [mid[0], mid[1] + 45], 4)).toBe(true);
    expect(hitTest(routed, [mid[0] + 60, mid[1] + 45], 4)).toBe(false);
  });
});

describe("labels on arrows", () => {
  it("find the middle of a bent path by length", () => {
    expect(
      pathMidpoint([
        [0, 0],
        [100, 0],
      ])
    ).toEqual([50, 0]);
    expect(
      pathMidpoint([
        [0, 0],
        [100, 0],
        [100, 100],
      ])
    ).toEqual([100, 0]);
    expect(
      pathMidpoint([
        [0, 0],
        [60, 0],
        [60, 100],
      ])
    ).toEqual([60, 20]);
    expect(pathMidpoint([])).toEqual([0, 0]);
  });

  it("sit on the last leg of an elbow so branches from one box do not share a label spot", () => {
    const [routed] = routeArrows([
      {
        ...arrow("f", null, null, { route: "elbow" }, "miss"),
        points: [
          [0, 0],
          [200, 90],
        ],
      },
    ]);
    const pts = routed.points!;
    const [lx, ly] = labelPoint(routed);
    expect(lx).toBeGreaterThan(pts[2][0]);
    expect(lx).toBeLessThan(pts[3][0] + 1);
    expect(ly).toBe(pts[3][1]);
    const straight: El = {
      ...arrow("s", null, null),
      points: [
        [0, 0],
        [100, 0],
      ],
    };
    expect(labelPoint(straight)).toEqual([50, 0]);
  });

  it("move to the middle leg of a tight elbow so the label never hides the arrowhead", () => {
    const [tight] = routeArrows([
      {
        ...arrow("t", null, null, { route: "elbow" }, "a long label"),
        points: [
          [0, 0],
          [120, 90],
        ],
      },
    ]);
    expect(labelPoint(tight)).toEqual([60, 45]);
    expect(labelPoint(tight, "")).toEqual([90, 90]);
  });

  it("can be edited like other text", () => {
    expect(holdsText(arrow("x", null, null))).toBe(true);
  });

  it("draw a backed label at the middle of the arrow", () => {
    const labelled: El = {
      ...arrow("x", null, null, {}, "HTTPS"),
      points: [
        [0, 0],
        [200, 0],
      ],
    };
    const parts = describeEl(labelled, CSS_PALETTE);
    const text = parts.find((p) => p.tag === "text")!;
    expect(text.lines).toEqual(["HTTPS"]);
    expect(Number(text.attrs.x)).toBe(100);
    const backing = parts.find((p) => p.tag === "rect")!;
    expect(Number(backing.attrs.x) + Number(backing.attrs.width) / 2).toBeCloseTo(100);
    expect(partToSvg(text)).toContain("HTTPS");
  });

  it("appear in exported SVG with the elbow path", () => {
    const placed = placeTemplate(
      PARTS.find((p) => p.id === "cache-aside")!,
      [0, 0]
    );
    const svg = sceneSvg(placed, { ink: "#111", paper: "#fff", token: () => "#888" }, "#fff");
    expect(svg).toContain("1 check");
    expect(svg).toContain("2 miss");
    expect(svg).toMatch(/ Q[\d. -]+ [\d. -]+ /);
  });

  it("draw nothing extra for an arrow without a label", () => {
    const plain: El = {
      ...arrow("x", null, null),
      points: [
        [0, 0],
        [200, 0],
      ],
    };
    expect(describeEl(plain, CSS_PALETTE).some((p) => p.tag === "text")).toBe(false);
  });

  it("survive a save and reload", () => {
    const saved = JSON.parse(
      JSON.stringify([
        {
          ...arrow("x", null, null, { route: "elbow" }, "miss"),
          points: [
            [0, 0],
            [9, 9],
          ],
        },
      ])
    );
    const [back] = sanitizeEls(saved);
    expect(back.text).toBe("miss");
    expect(back.style.route).toBe("elbow");
  });
});

describe("older boards keep loading", () => {
  const legacy = [
    {
      id: "r",
      kind: "rect",
      x: 0,
      y: 0,
      w: 100,
      h: 60,
      text: "Box",
      style: { stroke: "ink", fill: "none", width: 2, dash: "solid", opacity: 1, fontSize: 20 },
    },
    {
      id: "t",
      kind: "text",
      x: 5,
      y: 5,
      w: 50,
      h: 30,
      text: "Hi",
      style: { stroke: "red", fill: "none", width: 2, dash: "solid", opacity: 1, fontSize: 20 },
    },
    {
      id: "a",
      kind: "arrow",
      x: 100,
      y: 30,
      w: 0,
      h: 0,
      points: [
        [0, 0],
        [80, 0],
      ],
      start: "r",
      end: null,
      style: { stroke: "ink", fill: "none", width: 2, dash: "dashed", opacity: 1, fontSize: 20, endHead: "triangle" },
    },
    {
      id: "l",
      kind: "line",
      x: 0,
      y: 100,
      w: 0,
      h: 0,
      points: [
        [0, 0],
        [50, 50],
      ],
      style: { stroke: "#e03131", fill: "none", width: 2, dash: "solid", opacity: 1, fontSize: 20 },
    },
    {
      id: "c",
      kind: "cylinder",
      x: 0,
      y: 200,
      w: 80,
      h: 100,
      style: { stroke: "ink", fill: "#b2f2bb", width: 2, dash: "solid", opacity: 1, fontSize: 20 },
    },
  ];

  it("accepts every element of a board saved before routes and labels existed", () => {
    const els = sanitizeEls(legacy);
    expect(els.map((e) => e.id)).toEqual(["r", "t", "a", "l", "c"]);
    expect(els.every((e) => e.style.route === undefined)).toBe(true);
    expect(els[2].text).toBeUndefined();
    expect(els[2].style.dash).toBe("dashed");
  });

  it("draws an old arrow exactly as before", () => {
    const [, , old] = sanitizeEls(legacy);
    const d = String(describeEl(old, CSS_PALETTE)[0].attrs.d);
    expect(d).toBe("M100 30 L180 30");
    expect(routeArrows([old])).toEqual([old]);
  });

  it("ignores a route on anything but an arrow, and any unknown route", () => {
    const els = sanitizeEls([
      { ...legacy[0], style: { ...legacy[0].style, route: "elbow" } },
      { ...legacy[2], id: "b", style: { ...legacy[2].style, route: "zigzag" } },
    ]);
    expect(els[0].style.route).toBeUndefined();
    expect(els[1].style.route).toBeUndefined();
  });
});

describe("the system-design parts library", () => {
  it("offers parts in every group, each building a valid element list", () => {
    expect(new Set(PARTS.map((p) => p.group)).size).toBe(5);
    expect(new Set(PARTS.map((p) => p.id)).size).toBe(PARTS.length);
    for (const part of PARTS) {
      const els = part.build();
      expect(els.length, part.id).toBeGreaterThan(0);
      expect(sanitizeEls(els), part.id).toHaveLength(els.length);
    }
  });

  it("covers the parts an interview board needs", () => {
    const labels = PARTS.map((p) => p.label.toLowerCase()).join("|");
    for (const word of ["client", "load balancer", "cache", "queue", "database", "cdn", "worker"])
      expect(labels, word).toContain(word);
  });

  it("builds fresh ids every time so a part can be dropped twice", () => {
    const part = PARTS.find((p) => p.id === "cache-aside")!;
    const ids = [...part.build(), ...part.build()].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("wires patterns with arrows that point at shapes inside the pattern", () => {
    for (const part of PARTS.filter((p) => p.group === "Patterns")) {
      const els = part.build();
      const ids = new Set(els.map((e) => e.id));
      const arrows = els.filter((e) => e.kind === "arrow");
      expect(arrows.length, part.id).toBeGreaterThan(0);
      for (const a of arrows) {
        expect(ids.has(a.start!), part.id).toBe(true);
        expect(ids.has(a.end!), part.id).toBe(true);
      }
    }
  });

  it("places patterns with arrows running square and labelled", () => {
    const part = PARTS.find((p) => p.id === "cache-aside")!;
    const placed = placeTemplate(part, [500, 400]);
    const arrows = placed.filter((e) => e.kind === "arrow");
    expect(arrows.every(orthogonal)).toBe(true);
    expect(arrows.map((a) => a.text)).toEqual(["1 check", "2 miss"]);
    const b = bounds(placed[0]);
    expect(b.x).toBeLessThan(500);
  });

  it("slides a dropped part aside instead of stacking it exactly on top", () => {
    const part = PARTS.find((p) => p.id === "cache")!;
    const first = placeTemplate(part, [0, 0]);
    const second = clearOf(first, placeTemplate(part, [0, 0]));
    expect(second[0].x).toBeGreaterThan(first[0].x);
    expect(clearOf([], placeTemplate(part, [0, 0]))[0].x).toBe(first[0].x);
  });

  it("keeps a pattern clear of shapes that are already there", () => {
    const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    const lb = PARTS.find((p) => p.id === "load-balanced")!;
    const cacheAside = PARTS.find((p) => p.id === "cache-aside")!;
    const client = placeTemplate(
      PARTS.find((p) => p.id === "client")!,
      [0, 0]
    );
    const second = clearOf(client, placeTemplate(lb, [0, 0]));
    expect(overlaps(unionBounds(second)!, bounds(client[0]))).toBe(false);
    const third = clearOf([...client, ...second], placeTemplate(cacheAside, [0, 0]));
    expect(overlaps(unionBounds(third)!, unionBounds(second)!)).toBe(false);
    expect(overlaps(unionBounds(third)!, bounds(client[0]))).toBe(false);
  });

  it("gives up sliding on a crowded board rather than flying off", () => {
    const wall = Array.from({ length: 60 }, (_, i) =>
      box(`w${i}`, (i % 10) * 100 - 450, Math.floor(i / 10) * 60 - 200, 100, 60)
    );
    const placed = placeTemplate(
      PARTS.find((p) => p.id === "cache")!,
      [0, 0]
    );
    const out = clearOf(wall, placed);
    expect(Math.abs(out[0].x - placed[0].x)).toBeLessThan(1000);
  });

  it("copies a saved part with new ids and its arrows re-attached", () => {
    const saved = routeArrows([box("a", 0, 0), box("b", 300, 0), arrow("x", "a", "b")]);
    const copy = partFromEls(saved)();
    expect(copy).toHaveLength(3);
    expect(copy.map((e) => e.id)).not.toContain("a");
    const link = copy.find((e) => e.kind === "arrow")!;
    expect(copy.map((e) => e.id)).toContain(link.start);
    expect(copy.map((e) => e.id)).toContain(link.end);
  });

  it("uses labelled arrows in the built-in templates", () => {
    const flow = TEMPLATES.find((t) => t.id === "flowchart")!.build();
    expect(flow.filter((e) => e.kind === "arrow" && e.text).map((e) => e.text)).toEqual(["yes", "no"]);
    expect(flow.some((e) => e.kind === "text")).toBe(false);
  });
});
