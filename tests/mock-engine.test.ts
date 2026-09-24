import { describe, expect, it } from "vitest";
import { mockCatalog, parseLadder, stageBank, stageHotFor } from "@/lib/mock/bank";
import { loopMinutes, pickItems, planLoop, seededRandom, STAGE_ORDER, STAGE_RULES } from "@/lib/mock/loops";
import {
  codingScore,
  competencyProfile,
  decideLoop,
  rubricFor,
  talkScore,
  verdictFor,
  type StageResult,
} from "@/lib/mock/scoring";
import type { CompanyType, Intensity, LoopConfig, Role, Seniority, StageId, TalkItem } from "@/lib/mock/types";

const hot = stageHotFor();
const ROLES: Role[] = ["frontend", "fullstack", "backend"];
const LEVELS: Seniority[] = ["junior", "mid", "senior"];
const COMPANIES: CompanyType[] = ["service", "product", "saas", "agency"];
const INTENSITIES: Intensity[] = ["quick", "standard", "full"];

function everyConfig(): LoopConfig[] {
  const out: LoopConfig[] = [];
  for (const role of ROLES)
    for (const seniority of LEVELS)
      for (const company of COMPANIES)
        for (const intensity of INTENSITIES) out.push({ role, seniority, company, intensity });
  return out;
}

describe("the question bank", () => {
  it("has questions for every stage", () => {
    for (const stage of STAGE_ORDER) {
      expect(stageBank(stage).length, `${stage} has nothing to ask`).toBeGreaterThan(0);
    }
  });

  it("gives every question a unique id within its stage", () => {
    for (const stage of STAGE_ORDER) {
      const ids = stageBank(stage).map((i) => i.id);
      expect(new Set(ids).size, `${stage} repeats an id`).toBe(ids.length);
    }
  });

  it("uses every exercise exactly once across the two coding stages", () => {
    const coding = [...stageBank("coding"), ...stageBank("machine")].map((i) => i.id);
    expect(new Set(coding).size).toBe(coding.length);
    expect(coding.length).toBeGreaterThan(500);
  });

  it("keeps reference lists out of the question pool", () => {
    for (const stage of STAGE_ORDER) {
      for (const item of stageBank(stage)) {
        if (item.kind !== "talk") continue;
        expect(item.prompt, `${item.id} is a bulk list, not a question`).not.toMatch(/rapid-fire|the rest of/i);
      }
    }
  });

  it("links every question back to where it is written up", () => {
    for (const stage of STAGE_ORDER) {
      for (const item of stageBank(stage)) expect(item.href, item.id).toMatch(/^\//);
    }
  });

  it("reads the header of each stage's round from the book", () => {
    for (const s of mockCatalog().stages) {
      expect(s.who, `${s.id} has no interviewer`).toBeTruthy();
      expect(s.decides, `${s.id} does not say what it decides`).toBeTruthy();
    }
  });
});

describe("ladders", () => {
  it("parses all three rungs and removes them from the answer", () => {
    const after = `<p>kept</p><div class="ladder"><span class="ttl">x</span>
<div class="rung"><span class="lv">2–3 years</span><p class="bar"><b>The bar:</b> one</p><p class="script">s1</p><p class="why"><b>Why it passes here:</b> w1</p></div>
<div class="rung"><span class="lv">5–7 years</span><p class="bar"><b>The bar:</b> two</p><p class="script">s2</p><p class="why"><b>Why it lands:</b> w2</p></div>
<div class="rung"><span class="lv">10+ years</span><p class="bar"><b>The bar:</b> three</p><p class="script">s3</p><p class="why"><b>Why:</b> w3</p></div></div>`;
    const { ladder, rest } = parseLadder(after);
    expect(rest).toBe("<p>kept</p>");
    expect(ladder?.map((r) => r.level)).toEqual(["junior", "mid", "senior"]);
    expect(ladder?.[1]).toMatchObject({ bar: "two", script: "s2", why: "w2" });
  });

  it("finds the book's ladders", () => {
    const withLadders = STAGE_ORDER.flatMap((s) => stageBank(s)).filter((i) => i.kind === "talk" && i.ladder);
    expect(withLadders.length).toBeGreaterThanOrEqual(8);
    for (const item of withLadders) {
      expect((item as TalkItem).ladder!.length, item.id).toBe(3);
    }
  });
});

describe("planning a loop", () => {
  it("plans a loop for every combination, and every one has coding in it", () => {
    for (const config of everyConfig()) {
      const plan = planLoop(config, hot);
      expect(plan.length, JSON.stringify(config)).toBeGreaterThan(0);
      expect(
        plan.some((p) => STAGE_RULES[p.stage].kind === "coding"),
        `${JSON.stringify(config)} has no coding stage`
      ).toBe(true);
    }
  });

  it("keeps the stages in the order a real loop runs them", () => {
    for (const config of everyConfig()) {
      const order = planLoop(config, hot).map((p) => STAGE_ORDER.indexOf(p.stage));
      expect(order, JSON.stringify(config)).toEqual([...order].sort((a, b) => a - b));
    }
  });

  it("always ends a standard loop with behaviour and the number", () => {
    const plan = planLoop({ role: "fullstack", seniority: "mid", company: "product", intensity: "standard" }, hot);
    expect(plan.map((p) => p.stage).slice(-2)).toEqual(["behaviour", "hr"]);
  });

  it("gives a frontend loop React and no backend round, and a backend loop the reverse", () => {
    const fe = planLoop({ role: "frontend", seniority: "mid", company: "product", intensity: "standard" }, hot).map(
      (p) => p.stage
    );
    const be = planLoop({ role: "backend", seniority: "mid", company: "product", intensity: "standard" }, hot).map(
      (p) => p.stage
    );
    expect(fe).toContain("react");
    expect(fe).not.toContain("backend");
    expect(be).toContain("backend");
    expect(be).not.toContain("react");
  });

  it("puts system design in every senior loop and no junior one", () => {
    for (const config of everyConfig()) {
      const stages = planLoop(config, hot).map((p) => p.stage);
      if (config.seniority === "senior") expect(stages, JSON.stringify(config)).toContain("design");
      if (config.seniority === "junior") expect(stages, JSON.stringify(config)).not.toContain("design");
    }
  });

  it("makes a quick loop shorter than a full one", () => {
    const base = { role: "fullstack" as const, seniority: "senior" as const, company: "saas" as const };
    const quick = loopMinutes(planLoop({ ...base, intensity: "quick" }, hot));
    const full = loopMinutes(planLoop({ ...base, intensity: "full" }, hot));
    expect(quick).toBeLessThan(full);
  });

  it("only plans stages the bank can fill", () => {
    for (const config of everyConfig()) {
      for (const p of planLoop(config, hot)) {
        const fits = pickItems(stageBank(p.stage), config, p.questions, seededRandom(7));
        expect(fits.length, `${p.stage} for ${JSON.stringify(config)}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("choosing questions", () => {
  const config: LoopConfig = { role: "frontend", seniority: "junior", company: "service", intensity: "standard" };

  it("is repeatable for the same seed and differs across seeds", () => {
    const pool = stageBank("javascript");
    const a = pickItems(pool, config, 5, seededRandom(1)).map((i) => i.id);
    const b = pickItems(pool, config, 5, seededRandom(1)).map((i) => i.id);
    const c = pickItems(pool, config, 5, seededRandom(99)).map((i) => i.id);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("never picks a question already asked", () => {
    const pool = stageBank("react");
    const first = pickItems(pool, config, 5, seededRandom(3));
    const second = pickItems(pool, config, 5, seededRandom(3), new Set(first.map((i) => i.id)));
    expect(second.some((i) => first.includes(i))).toBe(false);
  });

  it("skips senior-only rounds for a junior", () => {
    const picked = pickItems(stageBank("design"), { ...config, seniority: "junior" }, 50, seededRandom(5));
    expect(picked.some((i) => i.kind === "talk" && i.origin === "s2")).toBe(false);
  });

  it("gives a backend loop data-structure problems first", () => {
    const picked = pickItems(stageBank("coding"), { ...config, role: "backend", seniority: "mid" }, 3, seededRandom(2));
    for (const item of picked) expect(item.kind === "coding" && item.topic, item.id).toBe("dsa");
  });
});

describe("scoring", () => {
  const item = stageBank("javascript").find((i): i is TalkItem => i.kind === "talk" && Boolean(i.testing && i.trap))!;

  it("builds the rubric from what the book says the question is listening for", () => {
    const ids = rubricFor(item, true).map((c) => c.id);
    expect(ids).toEqual(["testing", "substance", "trap", "followup", "delivery"]);
    expect(rubricFor(item, false).map((c) => c.id)).not.toContain("followup");
  });

  it("scores a clean sweep at 1 and an unmarked rubric at 0", () => {
    const criteria = rubricFor(item, true);
    expect(talkScore(criteria, Object.fromEntries(criteria.map((c) => [c.id, 1])))).toBe(1);
    expect(talkScore(criteria, {})).toBe(0);
  });

  it("weights the substance of the answer above the delivery", () => {
    const criteria = rubricFor(item, false);
    expect(talkScore(criteria, { substance: 1 })).toBeGreaterThan(talkScore(criteria, { delivery: 1 }));
  });

  it("scores code by its tests, docks hints gently and caps a read solution", () => {
    expect(codingScore({ passed: 8, total: 8, hintsUsed: 0, sawSolution: false })).toBe(1);
    expect(codingScore({ passed: 4, total: 8, hintsUsed: 0, sawSolution: false })).toBe(0.5);
    expect(codingScore({ passed: 8, total: 8, hintsUsed: 1, sawSolution: false })).toBeCloseTo(0.95);
    expect(codingScore({ passed: 8, total: 8, hintsUsed: 9, sawSolution: false })).toBeCloseTo(0.85);
    expect(codingScore({ passed: 8, total: 8, hintsUsed: 0, sawSolution: true })).toBe(0.3);
    expect(codingScore({ passed: 0, total: 0, hintsUsed: 0, sawSolution: false })).toBe(0);
  });

  it("draws the verdict lines where a debrief would", () => {
    expect(verdictFor(0.9)).toBe("strong-hire");
    expect(verdictFor(0.7)).toBe("hire");
    expect(verdictFor(0.5)).toBe("lean-no");
    expect(verdictFor(0.2)).toBe("no-hire");
  });
});

describe("the hiring committee", () => {
  const cfg: LoopConfig = { role: "fullstack", seniority: "senior", company: "product", intensity: "standard" };
  const title = (s: StageId) => s;
  const r = (stage: StageId, score: number, core = false): StageResult => ({
    stage,
    competency: STAGE_RULES[stage].competency,
    core,
    scores: [score],
  });

  it("lets a no-hire in a core round sink an otherwise strong loop", () => {
    const d = decideLoop([r("coding", 0.2, true), r("javascript", 0.95), r("behaviour", 0.95, true)], cfg, title);
    expect(d.verdict).toBe("no-hire");
    expect(d.reasons.join(" ")).toMatch(/coding/);
  });

  it("reads two lean-nos as a no", () => {
    const d = decideLoop([r("coding", 0.9, true), r("javascript", 0.5), r("react", 0.5)], cfg, title);
    expect(d.verdict).toBe("lean-no");
  });

  it("offers a strong senior loop with a weak design round one level down", () => {
    const d = decideLoop(
      [r("coding", 0.9, true), r("javascript", 0.9), r("design", 0.55, true), r("behaviour", 0.9, true)],
      cfg,
      title
    );
    expect(["hire", "strong-hire"]).toContain(d.verdict);
    expect(d.level).toBe("below");
    expect(d.headline).toMatch(/mid-level/);
  });

  it("makes the case for a level up when every round is a strong hire", () => {
    const d = decideLoop([r("coding", 0.9, true), r("javascript", 0.9)], { ...cfg, seniority: "junior" }, title);
    expect(d.level).toBe("above");
  });

  it("builds a competency profile only from what was tested", () => {
    const profile = competencyProfile([r("coding", 1, true), r("javascript", 0.5)]);
    expect(profile).toEqual({ coding: 1, javascript: 0.5 });
    expect(profile.design).toBeUndefined();
  });
});
