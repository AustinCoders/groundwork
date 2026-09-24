import { describe, expect, it } from "vitest";
import { formatClock } from "@/lib/mockSession";
import { shuffle } from "@/lib/mock/loops";
import { mockQuestions, parseBank } from "@/lib/mockQuestions";

describe("mock interview", () => {
  const all = mockQuestions();

  it("parses both banks, with every level present", () => {
    expect(all.filter((q) => q.source === "js").length).toBeGreaterThan(20);
    expect(all.filter((q) => q.source === "react").length).toBeGreaterThan(40);
    for (const level of ["fresher", "mid", "senior", "drill"]) {
      expect(
        all.some((q) => q.level === level),
        level
      ).toBe(true);
    }
    for (const q of all) {
      expect(q.questionHtml.length, q.id).toBeGreaterThan(5);
      expect(q.answerHtml.length, q.id).toBeGreaterThan(5);
    }
  });

  it("parses a small hand-written bank", () => {
    const html =
      '<h3>Intro</h3><p>x</p><h3>Fresher &mdash; 0 to 2</h3><div class="qa"><p class="q">Q1?</p><p>A1</p></div><div class="qa"><p class="q">Q2?</p><p>A2</p><pre>code</pre></div><h3>Senior</h3><div class="qa"><p class="q">Q3?</p><p>A3</p></div>';
    const out = parseBank(html, "js", "/x");
    expect(out.map((q) => [q.level, q.questionHtml])).toEqual([
      ["fresher", "Q1?"],
      ["fresher", "Q2?"],
      ["senior", "Q3?"],
    ]);
    expect(out[1].answerHtml).toContain("<pre>code</pre>");
  });

  it("shuffle keeps every item and does not change the input", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const out = shuffle(input, () => 0.3);
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("formats the clock", () => {
    expect(formatClock(125)).toBe("2:05");
    expect(formatClock(-3)).toBe("0:00");
  });
});
