import Link from "next/link";
import type { CSSProperties } from "react";
import { ROUND_KINDS } from "@/content/system-design/company-questions/rounds";
import { accentVar } from "@/lib/accent";
import { CardProgress } from "./DoneMark";
import { exerciseOf, type CompanyView } from "./data";
import { HUB_PATH } from "./shared";
import hub from "./hub.module.css";

const firstSentence = (text: string, cap: number) => {
  const first = text.match(/^[^.!?]+[.!?]/)?.[0] ?? text;
  return first.length > cap ? `${first.slice(0, cap - 1).trimEnd()}…` : first;
};

export function CompanyCard({ view }: { view: CompanyView }) {
  const { company, process, design, coding } = view;
  const rounds = process?.rounds ?? [];
  const tracked = [
    ...design.map((question) => ({ id: question.id })),
    ...coding.map((question) => ({ id: question.id, exercise: exerciseOf(question.id) })),
  ];
  return (
    <Link
      href={`${HUB_PATH}/${company.id}`}
      className={hub.company}
      style={{ "--accent": accentVar(company.accent) } as CSSProperties}
      prefetch={false}
    >
      <span className={hub.companyTop}>
        <span className={hub.companyMonogram} aria-hidden="true">
          {company.name.charAt(0)}
        </span>
        <span className={hub.companyName}>{company.name}</span>
        <span className={hub.companyGo} aria-hidden="true">
          →
        </span>
      </span>
      <span className={hub.companySummary}>
        {process ? firstSentence(process.summary, 118) : "Questions reported by candidates."}
      </span>
      {rounds.length > 0 && (
        <span className={hub.pipe} aria-label={`${rounds.length} rounds`}>
          {rounds.map((round, index) => (
            <i
              key={`${round.type}-${index}`}
              style={{ "--tone": accentVar(ROUND_KINDS[round.type].accent) } as CSSProperties}
              title={round.name}
            >
              {ROUND_KINDS[round.type].short}
            </i>
          ))}
        </span>
      )}
      <span className={hub.companyFoot}>
        <span>
          {rounds.length > 0 && `${rounds.length} rounds · `}
          {design.length} design · {coding.length} coding
        </span>
        <CardProgress items={tracked} />
      </span>
    </Link>
  );
}
