import { describe, expect, it } from "vitest";
import { COMPANY_QUESTIONS } from "@/content/system-design/company-questions";
import { DIAGRAMS } from "@/content/system-design/company-questions/diagrams";
import { diagramProblems } from "@/app/company-questions/diagramLayout";

describe("diagrams for the company system design answers", () => {
  it("covers every question and nothing else", () => {
    const ids = new Set(COMPANY_QUESTIONS.map((question) => question.id));
    expect(Object.keys(DIAGRAMS).filter((id) => !ids.has(id))).toEqual([]);
    for (const question of COMPANY_QUESTIONS) {
      expect(DIAGRAMS[question.id]?.length ?? 0, `${question.id} needs at least two diagrams`).toBeGreaterThanOrEqual(
        2
      );
      expect(DIAGRAMS[question.id].length).toBeLessThanOrEqual(3);
    }
  });

  it("opens every question with a flow diagram", () => {
    for (const question of COMPANY_QUESTIONS) expect(DIAGRAMS[question.id][0].kind, question.id).toBe("flow");
  });

  describe.each(Object.entries(DIAGRAMS))("%s", (id, list) => {
    it.each(list.map((diagram) => [diagram.title, diagram] as const))("%s is well formed", (_title, diagram) => {
      expect(diagramProblems(diagram), id).toEqual([]);
    });

    it("gives every diagram its own title", () => {
      const titles = list.map((diagram) => diagram.title);
      expect(new Set(titles).size).toBe(titles.length);
    });
  });

  it("keeps prose out of the picture: no em dashes, no company claims", () => {
    const text = JSON.stringify(DIAGRAMS);
    expect(text).not.toContain("—");
    expect(text).not.toMatch(
      /\b(Google|Amazon|Meta|Microsoft|Apple|Netflix|Uber|Flipkart|Swiggy|Razorpay|PhonePe|Atlassian) (uses|built|runs)\b/
    );
  });
});
