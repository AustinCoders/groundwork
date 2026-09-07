import type { NotesFile } from "./types";
import { archOverview } from "./architecture/arch-overview";
import { archTechStack } from "./architecture/arch-tech-stack";
import { archRepoMap } from "./architecture/arch-repo-map";
import { archContentModel } from "./architecture/arch-content-model";
import { archComingSoon } from "./architecture/arch-coming-soon";
import { archRequestPath } from "./architecture/arch-request-path";
import { archBuild } from "./architecture/arch-build";
import { archRendering } from "./architecture/arch-rendering";
import { archState } from "./architecture/arch-state";
import { archPlayground } from "./architecture/arch-playground";
import { archApis } from "./architecture/arch-apis";
import { archSearch } from "./architecture/arch-search";
import { archPerformance } from "./architecture/arch-performance";
import { archSecurity } from "./architecture/arch-security";
import { archTesting } from "./architecture/arch-testing";
import { archHealth } from "./architecture/arch-health";
import { archScaling } from "./architecture/arch-scaling";
import { archRoadmap } from "./architecture/arch-roadmap";

export const architectureNotes: NotesFile = {
  meta: {
    title: "How this site is built",
    subtitle: "18 chapters on the architecture, the stack, and what would break first.",
    lead: "Every other topic here explains somebody else's system. This one explains its own — and every number in it was measured against the running site rather than estimated, including the unflattering ones.",
    author: "Akshat",
    updated: "September 2026",
  },

  hero: { figure: "" },

  chapters: [
    archOverview,
    archTechStack,
    archRepoMap,
    archContentModel,
    archComingSoon,
    archRequestPath,
    archBuild,
    archRendering,
    archState,
    archPlayground,
    archApis,
    archSearch,
    archPerformance,
    archSecurity,
    archTesting,
    archHealth,
    archScaling,
    archRoadmap,
  ],
};
