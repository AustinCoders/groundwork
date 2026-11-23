import type { Extracted } from "./extract";
import { parseResume } from "./parse";
import { skillById } from "./skills";

export interface ResumePeek {
  pages: number;
  roles: number;
  projects: number;
  bullets: number;
  years: number | null;
  skills: string[];
}

export function peekResume(read: Extracted): ResumePeek {
  const parsed = parseResume({ lines: read.lines, pages: read.pages, wideGaps: read.wideGaps, links: read.links });
  return {
    pages: read.pages,
    roles: parsed.roles.length,
    projects: parsed.projects.length,
    bullets: parsed.bullets.length,
    years: parsed.months ? Math.round((parsed.months / 12) * 10) / 10 : null,
    skills: parsed.skills.map((id) => skillById(id)?.name ?? id),
  };
}
