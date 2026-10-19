import { describe, expect, it } from "vitest";
import { chapters } from "@/lib/content";
import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { COMPANY_QUESTIONS } from "@/content/system-design/company-questions";
import type { CompanyQuestion } from "@/content/system-design/company-questions/types";

const chapterIds = new Set(chapters("system-design").map((chapter) => chapter.id));
const companyIds = new Set(COMPANIES.map((company) => company.id));
const ALLOWED_TAGS = new Set(["p", "ul", "ol", "li", "b", "em", "code"]);
const SECTIONS = ["ask", "numbers", "design", "tradeoffs", "slips"] as const;

const plain = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const wordCount = (html: string) => plain(html).split(" ").filter(Boolean).length;
const everything = (question: CompanyQuestion) =>
  [question.prompt, ...SECTIONS.map((key) => question.answer[key]), ...question.answer.followups].join(" ");

describe("the company questions page data", () => {
  it("holds thirty questions with unique ids", () => {
    expect(COMPANY_QUESTIONS).toHaveLength(30);
    const ids = COMPANY_QUESTIONS.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every listed company, global and India", () => {
    const used = new Set(COMPANY_QUESTIONS.map((question) => question.company));
    for (const company of COMPANIES) expect(used.has(company.id), `${company.name} has no question`).toBe(true);
    expect(COMPANIES.some((company) => company.group === "india")).toBe(true);
    expect(COMPANIES.some((company) => company.group === "global")).toBe(true);
  });

  describe.each(COMPANY_QUESTIONS.map((question) => [question.id, question] as const))("%s", (id, question) => {
    it("names a known company and starts its id with that company", () => {
      expect(companyIds.has(question.company)).toBe(true);
      expect(id.startsWith(`${question.company}-`)).toBe(true);
    });

    it("links to chapters that exist", () => {
      expect(question.chapters.length).toBeGreaterThanOrEqual(2);
      for (const chapter of question.chapters)
        expect(chapterIds.has(chapter), `${chapter} is not a chapter`).toBe(true);
      expect(new Set(question.chapters).size).toBe(question.chapters.length);
    });

    it("keeps the evidence label honest about its sources", () => {
      expect(question.sources.length).toBeGreaterThanOrEqual(1);
      const urls = question.sources.map((source) => source.url);
      expect(new Set(urls).size).toBe(urls.length);
      for (const source of question.sources) {
        expect(source.url.startsWith("https://"), `${source.url} is not https`).toBe(true);
        expect(source.label.length).toBeGreaterThan(8);
        if (source.year !== undefined) {
          expect(source.year).toBeGreaterThanOrEqual(2018);
          expect(source.year).toBeLessThanOrEqual(2026);
        }
      }
      const reports = question.sources.filter((source) => source.kind === "candidate-report");
      if (question.evidence === "guide")
        expect(reports, "a guide-only question cites a candidate report").toHaveLength(0);
      else expect(reports.length, "a reported question needs a candidate report").toBeGreaterThanOrEqual(1);
      if (question.evidence === "several") expect(question.sources.length).toBeGreaterThanOrEqual(2);
    });

    it("has a full answer in every section", () => {
      const { answer } = question;
      expect(question.prompt.length).toBeGreaterThan(60);
      expect(question.prompt).not.toMatch(/<[^>]+>/);
      expect(wordCount(answer.ask)).toBeGreaterThanOrEqual(60);
      expect(wordCount(answer.numbers)).toBeGreaterThanOrEqual(90);
      expect(wordCount(answer.design)).toBeGreaterThanOrEqual(250);
      expect(wordCount(answer.tradeoffs)).toBeGreaterThanOrEqual(120);
      expect(wordCount(answer.slips)).toBeGreaterThanOrEqual(80);
      expect(answer.followups.length).toBeGreaterThanOrEqual(4);
      expect(answer.followups.length).toBeLessThanOrEqual(5);
      for (const followUp of answer.followups) {
        expect(followUp).not.toMatch(/<[^>]+>/);
        expect(/[?.]$/.test(followUp.trim()), `follow-up should be a full sentence: ${followUp}`).toBe(true);
      }
    });

    it("uses only the markup the card renders and never links out of the answer", () => {
      for (const key of SECTIONS) {
        const html = question.answer[key];
        for (const [, closing, tag] of html.matchAll(/<(\/?)([a-z0-9]+)[^>]*>/gi)) {
          expect(ALLOWED_TAGS.has(tag.toLowerCase()), `<${closing}${tag}> in ${key}`).toBe(true);
        }
        expect(html).not.toMatch(/\bhref=|\bstyle=|\bon[a-z]+=/i);
        const opens = (html.match(/<(p|ul|ol|li|b|em|code)(\s|>)/g) ?? []).length;
        const closes = (html.match(/<\/(p|ul|ol|li|b|em|code)>/g) ?? []).length;
        expect(opens, `unbalanced tags in ${key}`).toBe(closes);
      }
    });

    it("does not claim what a company asked or how it builds anything", () => {
      const text = plain(everything(question));
      const name = COMPANIES.find((company) => company.id === question.company)?.name ?? "";
      expect(text).not.toMatch(new RegExp(`\\b${name}\\s+(asked|asks|uses|built|builds|runs|ran)\\b`, "i"));
      expect(text).not.toMatch(/\b(verbatim|real interview question|actual question)\b/i);
    });

    it("is written without leftover placeholders", () => {
      const text = everything(question);
      expect(text).not.toMatch(/\b(TODO|TBD|FIXME|lorem)\b|\.\.\.\.|undefined|\[object/i);
      expect(text).not.toContain("${");
    });
  });
});
