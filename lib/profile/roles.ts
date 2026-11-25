import type { BaseTracks, RoleId, RoleStep, RoleTrack } from "./roleTracks";

export const ROLE_TITLE: Record<RoleId, string> = {
  frontend: "Frontend developer",
  backend: "Backend developer",
  fullstack: "Full-stack developer",
  other: "Software developer",
};

export function trackFor(role: RoleId | null, tracks: BaseTracks): RoleTrack {
  if (role === "frontend" || role === "backend") return tracks[role];
  if (role !== "fullstack") return tracks.other;
  const seen = new Set<string>();
  const steps: RoleStep[] = [];
  for (const step of [...tracks.frontend.steps, ...tracks.backend.steps]) {
    const ids = step.ids.filter((id) => !seen.has(id));
    if (ids.length === 0) continue;
    ids.forEach((id) => seen.add(id));
    const keep = new Set(ids);
    steps.push({ ...step, ids, chapters: step.chapters.filter((c) => keep.has(c.id)) });
  }
  return { role: "fullstack", title: ROLE_TITLE.fullstack, steps };
}
