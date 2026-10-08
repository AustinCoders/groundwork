import { describe, expect, it } from "vitest";
import { bankQuestions, bookRounds } from "@/lib/interviewBook";
import {
  HOME_STAGES,
  FOLLOW_UP_LIMIT,
  SAMPLE_LIMIT,
  TESTS_LIMIT,
  WRONG_LIMIT,
  homeRounds,
  plainText,
  stageOf,
  truncate,
} from "@/lib/homeRounds";

const round = (id: string, code: string, meta: [string, string][] = []) => ({
  id,
  code,
  navTitle: `Title ${id}`,
  meta,
});
const question = (
  roundId: string,
  fields: Partial<{ q: string; test: string | null; trap: string | null; fu: string[] }> = {}
) => ({
  roundId,
  q: "A question",
  test: null,
  trap: null,
  fu: [] as string[],
  ...fields,
});

describe("plainText", () => {
  it("strips tags and collapses whitespace", () => {
    expect(plainText("<p>Use <code>let</code>\n  here</p>")).toBe("Use let here");
  });

  it("decodes named and numeric entities", () => {
    expect(plainText("a &amp; b &lt;c&gt; &quot;d&quot; &#39;e&#39; &#x2014; f&nbsp;g")).toBe(
      `a & b <c> "d" 'e' — f g`
    );
  });

  it("leaves unknown entities and handles empty input", () => {
    expect(plainText("&bogus;")).toBe("&bogus;");
    expect(plainText(null)).toBe("");
    expect(plainText(undefined)).toBe("");
  });
});

describe("truncate", () => {
  it("keeps short text as it is", () => {
    expect(truncate("short", 20)).toBe("short");
  });

  it("cuts at a word and ends with an ellipsis within the limit", () => {
    const out = truncate("one two three four five six seven eight nine ten", 24);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(24);
    expect(out).toBe("one two three four…");
  });

  it("cuts a long unbroken word at the limit", () => {
    const out = truncate("x".repeat(50), 10);
    expect(out).toBe(`${"x".repeat(9)}…`);
  });

  it("cuts at the last sentence end inside the limit, with no ellipsis", () => {
    const text = "They want the trade-off named. Then they push on scale and ask what breaks first under load.";
    const out = truncate(text, 60);
    expect(out).toBe("They want the trade-off named.");
  });

  it("keeps closing quotes and brackets with the sentence end", () => {
    const text = "Say “it depends” and stop (a big mistake.) Then keep talking until the clock runs out here.";
    expect(truncate(text, 60)).toBe("Say “it depends” and stop (a big mistake.)");
  });

  it("does not treat an abbreviation as a sentence end", () => {
    const text = "Name a structure, e.g. a heap, and explain why you picked it over the alternatives in play.";
    const out = truncate(text, 40);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/e\.g\.$/);
  });

  it("falls back to a word boundary and an ellipsis when the first sentence is tiny or missing", () => {
    const tiny = truncate("No. And then a very long clause keeps running on without any stop at all in sight", 40);
    expect(tiny.endsWith("…")).toBe(true);
    expect(tiny.length).toBeLessThanOrEqual(40);
    expect(tiny).not.toMatch(/\s…$/);
  });

  it("never ends mid-clause without punctuation or an ellipsis", () => {
    const text =
      "Explaining the closure without saying what it captures, how long it lives and who can reach it from outside";
    for (const limit of [30, 50, 70, 90]) {
      const out = truncate(text, limit);
      expect(out.length).toBeLessThanOrEqual(limit);
      expect(/[.!?…]["'”’)\]]*$/.test(out), out).toBe(true);
    }
  });
});

describe("stageOf", () => {
  it("puts each round code in one of the four stages by its round number", () => {
    expect(["R1", "R1·OA", "R1·TH", "R1·TP"].map(stageOf)).toEqual(Array(4).fill("screening"));
    expect(["R2", "R3", "R3·TS", "R4", "R4·FE", "R5"].map(stageOf)).toEqual(Array(6).fill("technical"));
    expect(["R6", "R7", "R8", "R9"].map(stageOf)).toEqual(Array(4).fill("design"));
    expect(["R10", "R11", "R11·LP", "R12", "R12·LV", "R13", "R14"].map(stageOf)).toEqual(Array(7).fill("people"));
  });

  it("falls back to the last stage for a code with no round number", () => {
    expect(stageOf("50L")).toBe("people");
  });

  it("names four stages in order", () => {
    expect(HOME_STAGES.map((stage) => stage.label)).toEqual([
      "Screening",
      "Technical",
      "Design and depth",
      "People and offer",
    ]);
  });
});

describe("homeRounds", () => {
  it("keeps only the rounds whose code starts with R", () => {
    const out = homeRounds(
      [round("scout", "00"), round("r1", "R1"), round("r1oa", "R1·OA"), round("s1", "50L"), round("plan", "✓")],
      []
    );
    expect(out.map((r) => r.id)).toEqual(["r1", "r1oa"]);
  });

  it("builds the interview link and the title", () => {
    const [first] = homeRounds([round("r2", "R2")], []);
    expect(first).toMatchObject({ id: "r2", code: "R2", title: "Title r2", href: "/interview/r2" });
  });

  it("uses the first question's test, trap and text as plain text", () => {
    const [first] = homeRounds(
      [round("r3", "R3")],
      [
        question("r3", {
          q: "Explain <code>this</code>",
          test: "Whether you know &amp; can say it",
          trap: "<p>Saying <b>it depends</b></p>",
        }),
        question("r3", { q: "Second", test: "Other", trap: "Other trap" }),
      ]
    );
    expect(first).toMatchObject({
      tests: "Whether you know & can say it",
      wrong: "Saying it depends",
      sample: "Explain this",
      followUp: "",
    });
  });

  it("falls back to the Fail mode meta, then to an empty string", () => {
    const [withMeta, without] = homeRounds(
      [round("r4", "R4", [["Fail mode", "Rambling"]]), round("r5", "R5")],
      [question("r4"), question("r5")]
    );
    expect(withMeta.wrong).toBe("Rambling");
    expect(without.wrong).toBe("");
    expect(without.tests).toBe("");
  });

  it("returns empty strings for a round with no questions", () => {
    const [empty] = homeRounds([round("r6", "R6")], []);
    expect(empty).toMatchObject({ tests: "", wrong: "", sample: "", followUp: "" });
  });

  it("uses the first follow-up of the first question as plain text", () => {
    const [first] = homeRounds(
      [round("r8", "R8")],
      [question("r8", { fu: ["What breaks <b>first</b> at ten times this traffic?", "Second one"] })]
    );
    expect(first.followUp).toBe("What breaks first at ten times this traffic?");
  });

  it("truncates each field to its limit", () => {
    const long = "word ".repeat(100);
    const [first] = homeRounds([round("r7", "R7")], [question("r7", { q: long, test: long, trap: long, fu: [long] })]);
    expect(first.tests.length).toBeLessThanOrEqual(TESTS_LIMIT);
    expect(first.wrong.length).toBeLessThanOrEqual(WRONG_LIMIT);
    expect(first.sample.length).toBeLessThanOrEqual(SAMPLE_LIMIT);
    expect(first.followUp.length).toBeLessThanOrEqual(FOLLOW_UP_LIMIT);
  });
});

describe("the real interview book", () => {
  const rounds = homeRounds(bookRounds(), bankQuestions());

  it("lists the numbered rounds in book order with a sample for each", () => {
    expect(rounds.length).toBeGreaterThanOrEqual(10);
    expect(rounds.every((r) => r.code.startsWith("R"))).toBe(true);
    expect(rounds.every((r) => r.sample.length > 0 && r.href === `/interview/${r.id}`)).toBe(true);
  });

  it("fills every stage, in book order, with consecutive rounds", () => {
    const order = HOME_STAGES.map((stage) => stage.id);
    const seen = rounds.map((r) => order.indexOf(r.stage));
    expect(seen.every((index) => index >= 0)).toBe(true);
    expect([...seen].sort((a, b) => a - b)).toEqual(seen);
    for (const stage of HOME_STAGES) expect(rounds.filter((r) => r.stage === stage.id).length).toBeGreaterThan(0);
  });

  it("never cuts a real question, test or trap mid-clause without an ellipsis", () => {
    for (const question of bankQuestions()) {
      for (const [text, limit] of [
        [plainText(question.test), TESTS_LIMIT],
        [plainText(question.trap), WRONG_LIMIT],
        [plainText(question.q), SAMPLE_LIMIT],
        [plainText(question.fu[0]), FOLLOW_UP_LIMIT],
      ] as const) {
        const out = truncate(text, limit);
        if (out !== text) expect(/[.!?…"'”’)\]]$/.test(out), `${question.roundId}: ${out}`).toBe(true);
        expect(out.length).toBeLessThanOrEqual(limit);
      }
    }
  });

  it("carries no markup or entities", () => {
    for (const r of rounds) expect(`${r.tests}${r.wrong}${r.sample}${r.followUp}`).not.toMatch(/<[a-z/]|&[a-z#0-9]+;/i);
  });

  it("gives most rounds a real follow-up to push with next", () => {
    expect(rounds.filter((r) => r.followUp.length > 0).length).toBeGreaterThanOrEqual(Math.floor(rounds.length * 0.8));
  });

  it("stays under 12 KB as a prop", () => {
    expect(JSON.stringify(rounds).length).toBeLessThan(12 * 1024);
  });
});
