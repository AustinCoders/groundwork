import { describe, expect, it } from "vitest";
import { bankQuestions, bookRounds } from "@/lib/interviewBook";
import { SAMPLE_LIMIT, TESTS_LIMIT, WRONG_LIMIT, homeRounds, plainText, truncate } from "@/lib/homeRounds";

const round = (id: string, code: string, meta: [string, string][] = []) => ({
  id,
  code,
  navTitle: `Title ${id}`,
  meta,
});
const question = (roundId: string, fields: Partial<{ q: string; test: string | null; trap: string | null }> = {}) => ({
  roundId,
  q: "A question",
  test: null,
  trap: null,
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
    expect(empty).toMatchObject({ tests: "", wrong: "", sample: "" });
  });

  it("truncates each field to its limit", () => {
    const long = "word ".repeat(100);
    const [first] = homeRounds([round("r7", "R7")], [question("r7", { q: long, test: long, trap: long })]);
    expect(first.tests.length).toBeLessThanOrEqual(TESTS_LIMIT);
    expect(first.wrong.length).toBeLessThanOrEqual(WRONG_LIMIT);
    expect(first.sample.length).toBeLessThanOrEqual(SAMPLE_LIMIT);
  });
});

describe("the real interview book", () => {
  const rounds = homeRounds(bookRounds(), bankQuestions());

  it("lists the numbered rounds in book order with a sample for each", () => {
    expect(rounds.length).toBeGreaterThanOrEqual(10);
    expect(rounds.every((r) => r.code.startsWith("R"))).toBe(true);
    expect(rounds.every((r) => r.sample.length > 0 && r.href === `/interview/${r.id}`)).toBe(true);
  });

  it("carries no markup or entities", () => {
    for (const r of rounds) expect(`${r.tests}${r.wrong}${r.sample}`).not.toMatch(/<[a-z/]|&[a-z#0-9]+;/i);
  });

  it("stays under 12 KB as a prop", () => {
    expect(JSON.stringify(rounds).length).toBeLessThan(12 * 1024);
  });
});
