import { describe, expect, it } from "vitest";
import { chapters } from "@/lib/content";
import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { COMPANY_DSA } from "@/content/system-design/company-questions/dsa-index";
import { PATTERN_NAMES } from "@/content/system-design/company-questions/dsa-patterns";
import { COMPANY_QUESTIONS } from "@/content/system-design/company-questions";

const chapterIds = new Set(chapters("dsa").map((chapter) => chapter.id));
const ALLOWED_TAGS = new Set(["p", "ul", "ol", "li", "b", "em", "code", "sup", "sub"]);
const SECTIONS = ["ask", "brute", "insight", "walkthrough", "edges", "slips"] as const;

const plain = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const words = (html: string) => plain(html).split(" ").filter(Boolean).length;

function deriveEvidence(kinds: string[]): "several" | "one" | "guide" {
  const reports = kinds.filter((kind) => kind === "candidate-report").length;
  if (reports >= 1 && kinds.length >= 2) return "several";
  return reports >= 1 ? "one" : "guide";
}

describe("the company coding questions", () => {
  it("has coding questions for the established companies and most startups", () => {
    expect(COMPANY_DSA).toHaveLength(52);
    const none = new Set(["cred", "zerodha"]);
    for (const company of COMPANIES) {
      const own = COMPANY_DSA.filter((question) => question.company === company.id).length;
      if (none.has(company.id)) expect(own, company.id).toBe(0);
      else expect(own, company.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("uses ids that cannot collide with the design questions", () => {
    const ids = [...COMPANY_DSA, ...COMPANY_QUESTIONS].map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe.each(COMPANY_DSA.map((question) => [question.id, question] as const))("%s", (id, question) => {
    it("starts its id with the company and uses a known pattern", () => {
      expect(id.startsWith(`${question.company}-`)).toBe(true);
      expect(PATTERN_NAMES[question.patternId]).toBeTruthy();
      expect(["Easy", "Medium", "Hard"]).toContain(question.difficulty);
    });

    it("links to DSA chapters that exist", () => {
      expect(question.chapters.length).toBeGreaterThanOrEqual(1);
      for (const chapter of question.chapters)
        expect(chapterIds.has(chapter), `${chapter} is not a DSA chapter`).toBe(true);
    });

    it("derives its evidence label from its sources", () => {
      const urls = question.sources.map((source) => source.url);
      expect(new Set(urls).size).toBe(urls.length);
      for (const source of question.sources) {
        expect(source.url.startsWith("https://")).toBe(true);
        if (source.year !== undefined) expect(source.year).toBeGreaterThanOrEqual(2018);
      }
      expect(question.evidence).toBe(deriveEvidence(question.sources.map((source) => source.kind)));
    });

    it("has a full written answer", () => {
      expect(question.prompt.length).toBeGreaterThan(80);
      expect(question.prompt).not.toMatch(/<[^>]+>/);
      expect(words(question.answer.ask)).toBeGreaterThanOrEqual(50);
      expect(words(question.answer.brute)).toBeGreaterThanOrEqual(55);
      expect(words(question.answer.insight)).toBeGreaterThanOrEqual(120);
      expect(words(question.answer.walkthrough)).toBeGreaterThanOrEqual(60);
      expect(words(question.answer.edges)).toBeGreaterThanOrEqual(60);
      expect(words(question.answer.slips)).toBeGreaterThanOrEqual(60);
      expect(question.answer.followups.length).toBeGreaterThanOrEqual(3);
      expect(question.answer.followups.length).toBeLessThanOrEqual(5);
      for (const key of SECTIONS) {
        const html = question.answer[key];
        for (const [, , tag] of html.matchAll(/<(\/?)([a-z0-9]+)[^>]*>/gi)) {
          expect(ALLOWED_TAGS.has(tag.toLowerCase()), `<${tag}> in ${key}`).toBe(true);
        }
        expect(html).not.toMatch(/\bhref=|\bstyle=|\bon[a-z]+=/i);
      }
    });

    it("has a dry-run table that fits the page", () => {
      const { head, rows } = question.trace;
      expect(head.length).toBeGreaterThanOrEqual(2);
      expect(head.length).toBeLessThanOrEqual(6);
      expect(rows.length).toBeGreaterThanOrEqual(3);
      expect(rows.length).toBeLessThanOrEqual(12);
      for (const row of rows) {
        expect(row).toHaveLength(head.length);
        for (const cell of row) expect(cell.length).toBeLessThanOrEqual(28);
      }
    });

    it("states its complexity", () => {
      for (const value of Object.values(question.complexity)) expect(value).toMatch(/O\(|Exponential|exponential/);
    });

    it("ships code with no comments that passes every one of its cases", () => {
      const { code, entry, cases } = question.solution;
      expect(code).not.toMatch(/\/\/|\/\*|console\./);
      expect(cases.length).toBeGreaterThanOrEqual(8);
      const run = new Function(`${code}\nreturn ${entry};`)() as (...args: unknown[]) => unknown;
      for (const testCase of cases) {
        const args = structuredClone(testCase.args);
        expect(run(...args), `${entry}(${JSON.stringify(testCase.args)})`).toEqual(testCase.expected);
      }
    });

    it("does not claim what a company asked", () => {
      const text = plain(
        [question.prompt, ...SECTIONS.map((key) => question.answer[key]), ...question.answer.followups].join(" ")
      );
      const name = COMPANIES.find((company) => company.id === question.company)?.name ?? "";
      expect(text).not.toMatch(new RegExp(`\\b${name}\\s+(asked|asks|uses|built|builds|runs|ran)\\b`, "i"));
    });
  });
});
