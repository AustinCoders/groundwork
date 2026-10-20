import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { COMPANY_QUESTIONS } from "@/content/system-design/company-questions";
import { COMPANY_DSA } from "@/content/system-design/company-questions/dsa-index";
import { EXERCISE_OF } from "@/content/system-design/company-questions/dsa-exercises";
import { PROCESSES, REPORTED } from "@/content/system-design/company-questions/process";
import type { CompanyProcess, ReportedPrompt } from "@/content/system-design/company-questions/process-types";
import { ROUND_KINDS, type RoundType } from "@/content/system-design/company-questions/rounds";
import type { Company, CompanyQuestion } from "@/content/system-design/company-questions/types";
import type { DsaQuestion } from "@/content/system-design/company-questions/dsa-types";
import { COMPANY_LLD } from "@/content/system-design/company-questions/lld-index";
import type { LldQuestion } from "@/content/system-design/company-questions/lld-types";
import { bookRound } from "@/lib/interviewBook";

export interface CompanyView {
  company: Company;
  process: CompanyProcess | undefined;
  design: CompanyQuestion[];
  coding: DsaQuestion[];
  lld: LldQuestion[];
  reported: ReportedPrompt[];
}

export function companyViews(): CompanyView[] {
  return COMPANIES.map((company) => ({
    company,
    process: PROCESSES.find((entry) => entry.company === company.id),
    design: COMPANY_QUESTIONS.filter((question) => question.company === company.id),
    coding: COMPANY_DSA.filter((question) => question.company === company.id),
    lld: COMPANY_LLD.filter((question) => question.company === company.id),
    reported: REPORTED.filter((entry) => entry.company === company.id),
  })).filter((view) => view.process || view.design.length + view.coding.length + view.lld.length > 0);
}

export function companyView(id: string): CompanyView | undefined {
  return companyViews().find((view) => view.company.id === id);
}

export const exerciseOf = (questionId: string): string | undefined => EXERCISE_OF[questionId];

const plain = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export interface BookSample {
  roundId: string;
  roundTitle: string;
  id: string;
  text: string;
}

export function bookSamples(type: RoundType, limit: number): BookSample[] {
  const roundId = ROUND_KINDS[type].book[0];
  const round = roundId ? bookRound(roundId) : null;
  if (!round) return [];
  return round.questions
    .filter((question) => !question.bulk)
    .slice(0, limit)
    .map((question) => ({ roundId: round.id, roundTitle: round.navTitle, id: question.id, text: plain(question.q) }));
}

export function bookRoundTitle(id: string): string | null {
  return bookRound(id)?.navTitle ?? null;
}

export interface AskedAt {
  company: string;
  href: string;
  title: string;
}

export function askedAtFor(exerciseId: string): AskedAt[] {
  return COMPANY_DSA.filter((question) => EXERCISE_OF[question.id] === exerciseId).map((question) => ({
    company: COMPANIES.find((entry) => entry.id === question.company)?.name ?? question.company,
    href: `/company-questions/coding/${question.id}`,
    title: question.title,
  }));
}
