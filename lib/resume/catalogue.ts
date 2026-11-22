import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { CS_SETS } from "@/content/system-design/company-questions/cs-index";
import { COMPANY_DSA } from "@/content/system-design/company-questions/dsa-index";
import { COMPANY_QUESTIONS } from "@/content/system-design/company-questions/index";
import { COMPANY_LLD } from "@/content/system-design/company-questions/lld-index";
import { bankQuestions } from "@/lib/interviewBook";
import { topicHome } from "@/lib/topics";
import { topicsNavWithStats } from "@/lib/topicStats";
import { SKILLS, skillsIn } from "./skills";
import { stripTags } from "./text";
import type { Catalogue, CatalogueQuestion } from "./types";

const ASKS =
  /\?$|^(?:write|build|implement|design|explain|walk|tell|describe|how|what|why|when|which|compare|draw|debug|find|model)\b/i;
const CS_TAG: Record<string, string> = { os: "os", dbms: "dbms", networks: "networks", sql: "sql", oop: "lld" };

function roundTags(roundId: string): string[] {
  return SKILLS.filter((s) => s.rounds?.includes(roundId)).map((s) => s.id);
}

function companyName(id: string): string {
  return COMPANIES.find((c) => c.id === id)?.name ?? id;
}

function clean(text: string): string {
  const plain = stripTags(text);
  return plain.length > 240 ? `${plain.slice(0, 237).trimEnd()}…` : plain;
}

export function buildCatalogue(): Catalogue {
  const questions: CatalogueQuestion[] = [];
  const add = (entry: CatalogueQuestion) => {
    const tags = [...new Set(entry.tags)];
    if (tags.length || entry.people) questions.push({ ...entry, tags });
  };

  for (const q of bankQuestions()) {
    if (q.roundId === "scout" || q.part === "offer") continue;
    const text = clean(q.q);
    if (!ASKS.test(text)) continue;
    if (/\b(?:these two|this code|this snippet|of this|this one)\b|\bthis\?$/i.test(text)) continue;
    const people = q.part === "people" || q.roundId === "r1" || q.roundId === "r10";
    add({
      q: text,
      href: `/interview/${q.roundId}#${q.id}`,
      source: `Interview book, ${q.roundCode} ${q.roundTitle}`,
      tags: people ? [] : [...roundTags(q.roundId), ...skillsIn(`${text} ${stripTags(q.test ?? "")}`)],
      people: people || undefined,
    });
  }
  for (const set of CS_SETS) {
    for (const q of set.questions) {
      add({
        q: clean(q.q),
        href: `/company-questions/cs/${set.id}#${q.id}`,
        source: `Company questions, ${set.title}`,
        tags: [CS_TAG[set.id] ?? set.id, ...skillsIn(q.q)],
      });
    }
  }
  for (const q of COMPANY_QUESTIONS) {
    add({
      q: clean(q.title),
      href: `/company-questions/design/${q.id}`,
      source: `${companyName(q.company)}, system design`,
      tags: ["system-design", ...skillsIn(`${q.title} ${q.prompt}`)],
    });
  }
  for (const q of COMPANY_LLD) {
    add({
      q: clean(q.title),
      href: `/company-questions/lld/${q.id}`,
      source: `${companyName(q.company)}, low-level design`,
      tags: ["lld"],
    });
  }
  for (const q of COMPANY_DSA) {
    add({
      q: clean(q.title),
      href: `/company-questions/coding/${q.id}`,
      source: `${companyName(q.company)}, coding round`,
      tags: ["dsa"],
    });
  }

  const topics = topicsNavWithStats()
    .filter((t) => SKILLS.some((s) => s.topic === t.id))
    .map((t) => ({ id: t.id, name: t.name, href: topicHome(t.id), written: t.written > 0 }));

  return { questions, topics };
}
