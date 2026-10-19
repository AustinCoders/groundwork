import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { PROCESSES } from "@/content/system-design/company-questions/process";
import { ROUND_KINDS, ROUND_ORDER } from "@/content/system-design/company-questions/rounds";
import { accentVar } from "@/lib/accent";
import { RoundExplorer, type ExplorerKind } from "./RoundExplorer";
import { bookRoundTitle } from "./data";

export function RoundGuide() {
  const kinds: ExplorerKind[] = ROUND_ORDER.map((type) => {
    const kind = ROUND_KINDS[type];
    const runners = PROCESSES.filter((entry) => entry.rounds.some((round) => round.type === type)).map((entry) => {
      const company = COMPANIES.find((candidate) => candidate.id === entry.company);
      return { id: entry.company, name: company?.name ?? entry.company, accent: accentVar(company?.accent ?? "grey") };
    });
    return {
      id: type,
      label: kind.label,
      what: kind.what,
      asked: kind.asked,
      icon: kind.icon,
      tone: accentVar(kind.accent),
      companies: runners,
      books: kind.book
        .map((id) => ({ id, title: bookRoundTitle(id) }))
        .filter((entry): entry is { id: string; title: string } => entry.title !== null),
      topics: kind.topics,
    };
  });
  return <RoundExplorer kinds={kinds} total={COMPANIES.length} />;
}
