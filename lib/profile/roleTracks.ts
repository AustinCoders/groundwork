import { poolChapterIds } from "@/lib/quizPool";
import { roadmap } from "@/lib/roadmap";

export type RoleId = "frontend" | "backend" | "fullstack" | "other";

export interface RoleChapter {
  id: string;
  title: string;
  href: string;
  check: boolean;
}

export interface RoleStep {
  key: string;
  kind: "topic" | "round";
  title: string;
  mark: string;
  href: string;
  chapters: RoleChapter[];
  ids: string[];
}

export interface RoleTrack {
  role: RoleId;
  title: string;
  steps: RoleStep[];
}

const ROADMAPS: Record<RoleId, { title: string; maps: string[] }> = {
  frontend: { title: "Frontend developer", maps: ["frontend", "interview"] },
  backend: { title: "Backend developer", maps: ["backend", "interview"] },
  fullstack: { title: "Full-stack developer", maps: ["frontend", "backend", "interview"] },
  other: { title: "Software developer", maps: ["interview"] },
};

export const ROLE_IDS: readonly RoleId[] = ["frontend", "backend", "fullstack", "other"];

export function roleTrack(role: RoleId): RoleTrack {
  const checked = new Set(poolChapterIds());
  const seen = new Set<string>();
  const steps: RoleStep[] = [];
  for (const id of ROADMAPS[role].maps) {
    const map = roadmap(id);
    if (!map) continue;
    for (const stage of map.stages) {
      for (const step of stage.steps) {
        const ids = step.progressIds.filter((pid) => !seen.has(pid));
        if (ids.length === 0) continue;
        ids.forEach((pid) => seen.add(pid));
        const keep = new Set(ids);
        steps.push({
          key: `${id}:${step.key}`,
          kind: step.kind,
          title: step.title,
          mark: step.mark,
          href: step.href,
          chapters: step.chapters
            .filter((c) => keep.has(c.id))
            .map((c) => ({ id: c.id, title: c.title, href: c.href, check: checked.has(c.id) })),
          ids,
        });
      }
    }
  }
  return { role, title: ROADMAPS[role].title, steps };
}

export type BaseTracks = Record<"frontend" | "backend" | "other", RoleTrack>;

export function baseTracks(): BaseTracks {
  return { frontend: roleTrack("frontend"), backend: roleTrack("backend"), other: roleTrack("other") };
}
