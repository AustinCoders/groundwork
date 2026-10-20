import { COMPANY_QUESTIONS } from "@/content/system-design/company-questions";
import { DIAGRAMS } from "@/content/system-design/company-questions/diagrams";
import { COMPANY_DSA } from "@/content/system-design/company-questions/dsa-index";
import { LLD_DIAGRAMS } from "@/content/system-design/company-questions/lld-diagrams";
import { COMPANY_LLD } from "@/content/system-design/company-questions/lld-index";
import { diagramsBoard } from "@/lib/whiteboard/diagramBoard";
import { traceBoard } from "@/lib/whiteboard/traceBoard";
import type { BoardSource, CompanyBoard } from "@/lib/whiteboard/walk";

export function companyBoard(source: BoardSource, id: string): CompanyBoard | null {
  if (source === "design") {
    const question = COMPANY_QUESTIONS.find((entry) => entry.id === id);
    return question && DIAGRAMS[id] ? diagramsBoard(question.title, DIAGRAMS[id]) : null;
  }
  if (source === "lld") {
    const question = COMPANY_LLD.find((entry) => entry.id === id);
    return question && LLD_DIAGRAMS[id] ? diagramsBoard(question.title, LLD_DIAGRAMS[id]) : null;
  }
  const question = COMPANY_DSA.find((entry) => entry.id === id);
  return question ? traceBoard(question) : null;
}

export function boardIds(source: BoardSource): string[] {
  const all = {
    design: COMPANY_QUESTIONS.map((entry) => entry.id),
    lld: COMPANY_LLD.map((entry) => entry.id),
    coding: COMPANY_DSA.map((entry) => entry.id),
  }[source];
  return all.filter((id) => companyBoard(source, id) !== null);
}

export function hasCompanyBoard(source: BoardSource, id: string): boolean {
  return companyBoard(source, id) !== null;
}
