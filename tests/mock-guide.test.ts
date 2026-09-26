import { describe, expect, it } from "vitest";
import { chapterHref, chapterMetas, topics } from "@/lib/content";
import { INTERVIEW_ROUNDS_RAW } from "@/content/interview-data";
import { AS_ASKED, NOT_A_QUESTION, stageBank } from "@/lib/mock/bank";
import { COMPETENCY_PLAN, STAGE_GUIDE } from "@/lib/mock/guide";
import { STAGE_ORDER, STAGE_RULES } from "@/lib/mock/loops";
import { opener, personaFor } from "@/lib/mock/persona";

const pages = new Set(topics().flatMap((t) => chapterMetas(t.id).map((c) => chapterHref(t.id, c.id))));

describe("mock interview coaching", () => {
  it("coaches every round with a shape, three tips and where marks are lost", () => {
    for (const stage of STAGE_ORDER) {
      const g = STAGE_GUIDE[stage];
      expect(g.pitch.length, stage).toBeGreaterThan(20);
      expect(g.shape.length, stage).toBeGreaterThanOrEqual(3);
      expect(g.tips, stage).toHaveLength(3);
      expect(g.markedDown.length, stage).toBeGreaterThanOrEqual(2);
    }
  });

  it("points every next step at a page that exists", () => {
    const competencies = new Set(STAGE_ORDER.map((s) => STAGE_RULES[s].competency));
    for (const c of competencies) {
      const plan = COMPETENCY_PLAN[c];
      expect(plan.steps.length, c).toBeGreaterThanOrEqual(2);
      for (const step of plan.steps) expect(pages.has(step.href), `${c}: ${step.href}`).toBe(true);
    }
  });

  it("has every interviewer introduce themselves by name and role", () => {
    for (const stage of STAGE_ORDER) {
      const p = personaFor(stage, { role: "fullstack", seniority: "mid", company: "product", intensity: "quick" });
      const line = opener(p, stage, 3);
      expect(line).toContain(`I'm ${p.name}`);
      expect(line).not.toMatch(/ or /);
    }
  });
});

describe("the mock bank asks real questions", () => {
  it("only skips or rewrites entries that still exist in the book", () => {
    const ids = new Set(INTERVIEW_ROUNDS_RAW.flatMap((r) => r.qs.map((_, i) => `${r.id}-${i}`)));
    for (const id of [...NOT_A_QUESTION, ...Object.keys(AS_ASKED)]) expect(ids.has(id), id).toBe(true);
  });

  it("never asks a book heading as if it were a question", () => {
    for (const stage of STAGE_ORDER) {
      for (const item of stageBank(stage)) {
        if (item.kind !== "talk") continue;
        expect(NOT_A_QUESTION.has(item.id), item.id).toBe(false);
        if (AS_ASKED[item.id]) expect(item.prompt).toBe(AS_ASKED[item.id]);
      }
    }
  });
});
