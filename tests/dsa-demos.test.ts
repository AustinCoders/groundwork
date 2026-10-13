import { describe, expect, it } from "vitest";
import { chapters } from "@/lib/content";

const DEMO_CHAPTERS = [
  "dsa-heaps-priority-queues",
  "dsa-dp-2d",
  "dsa-sliding-window",
  "dsa-two-pointers",
  "dsa-monotonic-stack-queue",
  "dsa-union-find",
];

interface Step {
  line?: number;
  note: string;
  cells?: { v: string }[];
  panels?: Record<string, string[]>;
}

function demoOf(chapterId: string): { code: string[]; steps: Step[]; body: string } {
  const body = chapters("dsa").find((chapter) => chapter.id === chapterId)!.body;
  const code = /var CODE = (\[[\s\S]*?\]);\n/.exec(body)![1];
  const steps = /var STEPS = (\[.*\]);\n/.exec(body)![1];
  return { code: JSON.parse(code), steps: JSON.parse(steps), body };
}

describe("the step-through demos", () => {
  for (const id of DEMO_CHAPTERS) {
    describe(id, () => {
      const { code, steps, body } = demoOf(id);

      it("points every step at a line of its code", () => {
        expect(steps.length).toBeGreaterThan(1);
        for (const [i, step] of steps.entries()) {
          expect(Number.isInteger(step.line), `step ${i} has a line`).toBe(true);
          expect(step.line!, `step ${i}`).toBeGreaterThanOrEqual(1);
          expect(step.line!, `step ${i}`).toBeLessThanOrEqual(code.length);
        }
      });

      it("shows a step counter and fits the column", () => {
        expect(body).toMatch(/class="loop-step" id="[a-z]+-step"/);
        expect(body).toContain('stepEl.textContent = "Step " + (i + 1) + " of " + STEPS.length');
      });
    });
  }

  it("never says a smaller number is bigger in the heap demo", () => {
    const { steps } = demoOf("dsa-heaps-priority-queues");
    const comparisons = steps.flatMap((step) => [...step.note.matchAll(/(\d+) > (\d+)/g)]);
    expect(comparisons.length).toBeGreaterThan(0);
    for (const [text, bigger, smaller] of comparisons) expect(Number(bigger), text).toBeGreaterThan(Number(smaller));
  });

  it("sinks 8 down the heap [8, 3, 6, 5, 9] to [3, 5, 6, 8, 9], one swap per note", () => {
    const { steps } = demoOf("dsa-heaps-priority-queues");
    const heap = [8, 3, 6, 5, 9];
    let at = 0;
    const swaps: string[] = [];
    for (;;) {
      const children = [2 * at + 1, 2 * at + 2].filter((child) => child < heap.length);
      if (children.length === 0) break;
      const smallest = children.reduce((best, child) => (heap[child] < heap[best] ? child : best));
      if (heap[smallest] >= heap[at]) break;
      swaps.push(`${heap[at]} > ${heap[smallest]}`);
      [heap[at], heap[smallest]] = [heap[smallest], heap[at]];
      at = smallest;
    }
    expect(heap).toEqual([3, 5, 6, 8, 9]);
    const noted = steps.flatMap((step) => [...step.note.matchAll(/\d+ > \d+/g)].map((match) => match[0]));
    expect(noted).toEqual(swaps);
  });
});
