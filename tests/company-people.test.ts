import { describe, expect, it } from "vitest";
import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { PEOPLE } from "@/content/system-design/company-questions/people";
import { bookRound } from "@/lib/interviewBook";

const companyIds = new Set(COMPANIES.map((company) => company.id));

function deriveEvidence(kinds: string[]): "several" | "one" | "guide" {
  const reports = kinds.filter((kind) => kind === "candidate-report").length;
  if (reports >= 1 && kinds.length >= 2) return "several";
  return reports >= 1 ? "one" : "guide";
}

describe("the people rounds sections", () => {
  it("has at most one section per company, for known companies", () => {
    const ids = PEOPLE.map((entry) => entry.company);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(companyIds.has(id), id).toBe(true);
  });

  it("uses unique question ids across the whole file", () => {
    const ids = PEOPLE.flatMap((entry) => entry.questions.map((question) => question.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe.each(PEOPLE.map((entry) => [entry.company, entry] as const))("%s", (company, entry) => {
    it("lists values, themes, questions and offer notes", () => {
      expect(entry.values.length).toBeGreaterThanOrEqual(3);
      expect(entry.themes.length).toBeGreaterThanOrEqual(3);
      expect(entry.questions.length).toBeGreaterThanOrEqual(5);
      expect(entry.offer.length).toBeGreaterThanOrEqual(2);
      for (const value of entry.values) {
        expect(value.name.length).toBeGreaterThan(2);
        expect(value.line.length).toBeGreaterThan(20);
      }
      if (entry.valuesSource) {
        expect(entry.valuesSource.url.startsWith("https://")).toBe(true);
        expect(entry.valuesSource.kind).toBe("official");
      }
    });

    it("writes every question with a reason, a frame and honest sources", () => {
      for (const question of entry.questions) {
        expect(question.id.startsWith(`${company}-`), question.id).toBe(true);
        expect(question.q.length).toBeGreaterThan(20);
        expect(question.why.length).toBeGreaterThan(40);
        expect(question.frame.length).toBeGreaterThan(60);
        expect(question.sources.length).toBeGreaterThanOrEqual(1);
        for (const source of question.sources) expect(source.url.startsWith("https://")).toBe(true);
        expect(question.grade).toBe(deriveEvidence(question.sources.map((source) => source.kind)));
        if (question.book) {
          const round = bookRound(question.book.round);
          expect(round, question.book.round).toBeTruthy();
          expect(
            round!.questions.some((entry) => entry.id === question.book!.qid),
            question.book.qid
          ).toBe(true);
        }
      }
    });

    it("keeps to plain prose and never claims what the company asks", () => {
      const text = JSON.stringify(entry);
      expect(text).not.toMatch(/—|<[a-z]+>|\bTODO|\bTBD|lorem/i);
      const name = COMPANIES.find((item) => item.id === company)?.name ?? "";
      expect(text).not.toMatch(new RegExp(`\\b${name}\\s+(asked|asks|always asks|will ask)\\b`, "i"));
    });
  });
});
