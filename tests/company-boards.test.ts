import { describe, expect, it } from "vitest";
import { COMPANY_QUESTIONS } from "@/content/system-design/company-questions";
import { DIAGRAMS } from "@/content/system-design/company-questions/diagrams";
import { LLD_DIAGRAMS } from "@/content/system-design/company-questions/lld-diagrams";
import { COMPANY_LLD } from "@/content/system-design/company-questions/lld-index";
import { diagramsBoard } from "@/lib/whiteboard/diagramBoard";
import { meets } from "@/lib/whiteboard/build";
import {
  bounds,
  isLinear,
  labelPoint,
  sanitizeEls,
  textBox,
  type Box,
  type El,
  type Point,
} from "@/lib/whiteboard/model";
import { isWalk, visibleAt, type CompanyBoard } from "@/lib/whiteboard/walk";

const cases: [string, "design" | "lld", string][] = [
  ...COMPANY_QUESTIONS.map((q) => [q.id, "design", q.title] as [string, "design" | "lld", string]),
  ...COMPANY_LLD.map((q) => [q.id, "lld", q.title] as [string, "design" | "lld", string]),
];

function boardOf(id: string, kind: "design" | "lld", title: string): CompanyBoard {
  const list = (kind === "design" ? DIAGRAMS : LLD_DIAGRAMS)[id];
  return diagramsBoard(title, list);
}

function labelBox(el: El): Box | null {
  if (!el.text) return null;
  if (el.kind === "arrow") {
    const [mx, my] = labelPoint(el);
    const size = textBox(el.text, el.style.fontSize);
    return { x: el.x + mx - size.w / 2, y: el.y + my - size.h / 2, w: size.w, h: size.h };
  }
  return null;
}

function segmentsOf(el: El): [Point, Point][] {
  const pts = (el.points ?? []).map(([px, py]) => [el.x + px, el.y + py] as Point);
  return pts.slice(0, -1).map((p, i) => [p, pts[i + 1]]);
}

function crosses(a: Point, b: Point, box: Box, margin: number): boolean {
  const x1 = Math.min(a[0], b[0]);
  const x2 = Math.max(a[0], b[0]);
  const y1 = Math.min(a[1], b[1]);
  const y2 = Math.max(a[1], b[1]);
  return x2 > box.x + margin && x1 < box.x + box.w - margin && y2 > box.y + margin && y1 < box.y + box.h - margin;
}

describe("whiteboard boards from the answer diagrams", () => {
  it("covers every design and low-level design answer", () => {
    expect(cases).toHaveLength(COMPANY_QUESTIONS.length + COMPANY_LLD.length);
    expect(cases.length).toBe(64);
  });

  describe.each(cases)("%s", (id, kind, title) => {
    const board = boardOf(id, kind, title);
    const shapes = board.els.filter((el) => !isLinear(el));
    const arrows = board.els.filter((el) => el.kind === "arrow");
    const byId = new Map(board.els.map((el) => [el.id, el]));

    it("has unique ids and survives loading", () => {
      expect(new Set(board.els.map((el) => el.id)).size).toBe(board.els.length);
      const loaded = sanitizeEls(JSON.parse(JSON.stringify(board.els)));
      expect(loaded).toEqual(board.els);
    });

    it("keeps shapes and text apart", () => {
      for (let i = 0; i < shapes.length; i++)
        for (let j = i + 1; j < shapes.length; j++)
          expect(meets(bounds(shapes[i]), bounds(shapes[j]), 4), `${shapes[i].id} overlaps ${shapes[j].id}`).toBe(
            false
          );
    });

    it("has no dangling arrows and no arrow through a shape it does not join", () => {
      for (const arrow of arrows) {
        if (arrow.start || arrow.end) {
          expect(byId.has(arrow.start!), `${arrow.id} start`).toBe(true);
          expect(byId.has(arrow.end!), `${arrow.id} end`).toBe(true);
        }
        for (const [a, b] of segmentsOf(arrow))
          for (const shape of shapes) {
            if (shape.id === arrow.start || shape.id === arrow.end) continue;
            if (shape.kind === "text") continue;
            expect(crosses(a, b, bounds(shape), 3), `${arrow.id} crosses ${shape.id}`).toBe(false);
          }
      }
    });

    it("keeps arrow labels off shapes and off each other", () => {
      const labels = arrows.map((arrow) => ({ arrow, box: labelBox(arrow) })).filter((entry) => entry.box);
      for (const entry of labels)
        for (const shape of shapes)
          expect(meets(entry.box!, bounds(shape), 1), `label of ${entry.arrow.id} covers ${shape.id}`).toBe(false);
      for (let i = 0; i < labels.length; i++)
        for (let j = i + 1; j < labels.length; j++)
          expect(
            meets(labels[i].box!, labels[j].box!, 0),
            `labels of ${labels[i].arrow.id} and ${labels[j].arrow.id} overlap`
          ).toBe(false);
    });

    it("walks through every numbered step", () => {
      const list = (kind === "design" ? DIAGRAMS : LLD_DIAGRAMS)[id];
      const expected = list.reduce(
        (sum, diagram) =>
          sum +
          (diagram.kind === "flow"
            ? Math.max(1, diagram.edges.filter((edge) => edge.step).length)
            : diagram.messages.length),
        0
      );
      const walk = board.walk;
      expect(walk && isWalk(walk)).toBe(true);
      expect(walk!.captions).toHaveLength(expected);
      walk!.captions.forEach((caption, at) => {
        expect(caption.length, `step ${at + 1} caption`).toBeGreaterThan(0);
        for (const focus of walk!.focus[at]) {
          expect(byId.has(focus)).toBe(true);
          expect(visibleAt(walk!, at + 1, focus), `${focus} visible at step ${at + 1}`).toBe(true);
        }
        expect(walk!.views[at].w).toBeGreaterThan(0);
      });
      for (const [elId, [from, to]] of Object.entries(walk!.spans)) {
        expect(byId.has(elId), elId).toBe(true);
        expect(from).toBeGreaterThanOrEqual(1);
        expect(to).toBe(expected);
        expect(from).toBeLessThanOrEqual(to);
      }
      for (const arrow of arrows) {
        if (!arrow.start) continue;
        const [from] = walk!.spans[arrow.id] ?? [1];
        for (const end of [arrow.start, arrow.end!]) {
          const [shownFrom] = walk!.spans[end] ?? [1];
          expect(shownFrom, `${arrow.id} appears before ${end}`).toBeLessThanOrEqual(from);
        }
      }
    });
  });
});
