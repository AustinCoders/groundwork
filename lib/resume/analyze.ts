import { buildFixes } from "./fixes";
import { parseResume } from "./parse";
import { buildQuestions } from "./questions";
import { JD_LIMIT } from "./limits";
import { skillById, skillsIn } from "./skills";
import type { Catalogue, ResumeAnalysis, SkillStudy, YearMonth } from "./types";

export { JD_LIMIT };
export { forStorage } from "./forStorage";

export interface AnalyzeInput {
  lines: string[];
  pages: number;
  wideGaps?: number;
  links?: string[];
  jd?: string;
  catalogue: Catalogue;
  now?: YearMonth;
}

export function analyzeResume(input: AnalyzeInput): ResumeAnalysis {
  const now = input.now ?? { y: new Date().getFullYear(), m: new Date().getMonth() + 1 };
  const parsed = parseResume({
    lines: input.lines,
    pages: input.pages,
    wideGaps: input.wideGaps,
    links: input.links,
    now,
  });
  const jd = (input.jd ?? "").slice(0, JD_LIMIT);
  const jdSkills = jd.trim() ? skillsIn(jd) : [];
  const missing = jdSkills.filter((id) => !parsed.skills.includes(id));
  const topics = new Map(input.catalogue.topics.map((t) => [t.id, t]));
  const study: SkillStudy[] = [];
  for (const id of [...new Set([...missing, ...parsed.skills])]) {
    const skill = skillById(id);
    if (!skill) continue;
    const topic = skill.topic ? topics.get(skill.topic) : undefined;
    const round = skill.rounds?.[0];
    if (topic?.written) {
      study.push({
        id,
        name: skill.name,
        href: topic.href,
        label: `${topic.name} chapters`,
        missing: missing.includes(id),
      });
    } else if (round) {
      study.push({
        id,
        name: skill.name,
        href: `/interview/${round}`,
        label: "Interview book round",
        missing: missing.includes(id),
      });
    }
  }
  return {
    version: 1,
    parsed,
    questions: buildQuestions(parsed, input.catalogue, missing, now),
    fixes: buildFixes(parsed, missing, now),
    study,
    jdSkills,
    missing,
  };
}
