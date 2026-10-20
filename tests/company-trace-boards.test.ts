import { describe, expect, it } from "vitest";
import { COMPANY_DSA } from "@/content/system-design/company-questions/dsa-index";
import { meets } from "@/lib/whiteboard/build";
import { bounds, isLinear, sanitizeEls } from "@/lib/whiteboard/model";
import { traceBoard, traceShape } from "@/lib/whiteboard/traceBoard";
import { isWalk, visibleAt } from "@/lib/whiteboard/walk";

const EXPECTED_CELLS: Record<string, string> = {
  "amazon-trapping-rain-water": "3,1,0,2,0,5,1,4",
  "amazon-longest-palindromic-substring": "f,o,o,t,b,a,l,l",
  "microsoft-character-replacement": "A,A,B,A,B,B,A",
  "flipkart-longest-unique-substring": "a,b,c,a,b,c,b,b",
  "swiggy-three-sum": "-4,-1,-1,0,1,2",
  "razorpay-find-duplicate": "1,3,4,2,2",
  "phonepe-minimum-speed": "1,2,3,4,5,6,7",
  "zomato-min-size-subarray": "2,3,1,2,4,3",
  "paytm-closest-pair-sorted": "2,5,9,14,20",
  "zerodha-remove-nth-from-end": "dummy,1,2,3,4,5",
  "swiggy-min-days-bouquets": "1,2,3,4,5,6,7,8,9,10",
};

const EXPECTED_TREES: Record<string, number[]> = {
  "meta-vertical-order-traversal": [3, 9, 20, 15, 7],
  "meta-lowest-common-ancestor": [3, 5, 1, 6, 2, 0, 8, 7, 4],
  "microsoft-connect-level-nodes": [1, 2, 3, 4, 5, 6, 7],
  "zerodha-validate-bst": [10, 5, 15, 6, 20],
};

const supported = COMPANY_DSA.filter((question) => traceShape(question) !== null);

describe("whiteboard boards from the coding dry runs", () => {
  it("draws the array, range, list and tree traces and skips the rest", () => {
    expect(supported.map((question) => question.id).sort()).toEqual(
      [...Object.keys(EXPECTED_CELLS), ...Object.keys(EXPECTED_TREES)].sort()
    );
    expect(COMPANY_DSA.length - supported.length).toBeGreaterThan(40);
  });

  it("only offers shapes whose cells come from the test cases or the trace itself", () => {
    for (const question of supported) {
      const shaped = traceShape(question)!;
      if (shaped.strip) expect(shaped.strip.cells.join(","), question.id).toBe(EXPECTED_CELLS[question.id]);
      else
        expect(
          shaped.tree!.nodes.map((node) => node.value),
          question.id
        ).toEqual(EXPECTED_TREES[question.id]);
    }
  });

  describe.each(supported.map((question) => [question.id, question] as const))("%s", (_id, question) => {
    const board = traceBoard(question)!;
    const shapes = board.els.filter((el) => !isLinear(el));
    const byId = new Map(board.els.map((el) => [el.id, el]));

    it("has one step for each row of the dry run", () => {
      expect(board.walk && isWalk(board.walk)).toBe(true);
      expect(board.walk!.captions).toHaveLength(question.trace.rows.length);
      board.walk!.focus.forEach((ids, at) => {
        for (const id of ids) {
          expect(byId.has(id)).toBe(true);
          expect(visibleAt(board.walk!, at + 1, id)).toBe(true);
        }
      });
    });

    it("keeps shapes, labels and notes apart and survives loading", () => {
      for (let i = 0; i < shapes.length; i++)
        for (let j = i + 1; j < shapes.length; j++)
          expect(meets(bounds(shapes[i]), bounds(shapes[j]), 2), `${shapes[i].id} overlaps ${shapes[j].id}`).toBe(
            false
          );
      expect(sanitizeEls(JSON.parse(JSON.stringify(board.els)))).toEqual(board.els);
      expect(new Set(board.els.map((el) => el.id)).size).toBe(board.els.length);
    });

    it("joins list nodes with attached arrows only", () => {
      for (const arrow of board.els.filter((el) => el.kind === "arrow" && (el.start || el.end))) {
        expect(byId.has(arrow.start!)).toBe(true);
        expect(byId.has(arrow.end!)).toBe(true);
      }
    });
  });
});
