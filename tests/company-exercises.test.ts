import assert from "node:assert";
import { describe, expect, it } from "vitest";
import { company } from "@/content/practice/company";
import { exercise, exercises } from "@/lib/content";
import { chapters } from "@/lib/content";

const chapterIds = new Set(chapters("dsa").map((chapter) => chapter.id));

const run = (code: string, body: string) => new Function("assert", `${code}\n${body}`)(assert);

describe("the exercises added for the company coding questions", () => {
  it("are registered with the rest of the problems", () => {
    for (const entry of company) expect(exercise(entry.id)?.title, entry.id).toBe(entry.title);
    expect(new Set(exercises().map((entry) => entry.id)).size).toBe(exercises().length);
  });

  describe.each(company.map((entry) => [entry.id, entry] as const))("%s", (_id, entry) => {
    it("lives in a real DSA chapter and has what a problem needs", () => {
      expect(chapterIds.has(entry.chapter)).toBe(true);
      expect(entry.tests.length).toBeGreaterThanOrEqual(6);
      expect(entry.hints).toHaveLength(3);
      for (const hint of entry.hints) expect(hint.length).toBeGreaterThan(40);
    });

    it("passes every test with its reference solution", () => {
      for (const test of entry.tests)
        expect(() => run(entry.solution, test.body), `${entry.id}: ${test.name}`).not.toThrow();
    });

    it("fails at least one test with the starter code", () => {
      const failures = entry.tests.filter((test) => {
        try {
          run(entry.starter, test.body);
          return false;
        } catch {
          return true;
        }
      });
      expect(failures.length).toBeGreaterThan(0);
    });
  });
});

describe("the link from each coding question to its problem", () => {
  it("points every question at a real exercise, and no two questions share one", async () => {
    const { EXERCISE_OF } = await import("@/content/system-design/company-questions/dsa-exercises");
    const { COMPANY_DSA } = await import("@/content/system-design/company-questions/dsa-index");
    const used = new Set<string>();
    for (const question of COMPANY_DSA) {
      const id = EXERCISE_OF[question.id];
      expect(id, `${question.id} has no exercise`).toBeTruthy();
      expect(exercise(id)?.id, `${question.id} -> ${id} is not a problem`).toBe(id);
      expect(used.has(id), `${id} is linked twice`).toBe(false);
      used.add(id);
    }
    expect(Object.keys(EXERCISE_OF).sort()).toEqual(COMPANY_DSA.map((question) => question.id).sort());
  });
});
