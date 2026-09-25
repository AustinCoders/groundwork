import type { NotesFile } from "./types";
import { archOverview } from "./architecture/arch-overview";
import { archTechStack } from "./architecture/arch-tech-stack";
import { archRepoMap } from "./architecture/arch-repo-map";
import { archContentModel } from "./architecture/arch-content-model";
import { archComingSoon } from "./architecture/arch-coming-soon";
import { archRoutes } from "./architecture/arch-routes";
import { archRequestPath } from "./architecture/arch-request-path";
import { archBuild } from "./architecture/arch-build";
import { archRendering } from "./architecture/arch-rendering";
import { archState } from "./architecture/arch-state";
import { archPlayground } from "./architecture/arch-playground";
import { archRuntimes } from "./architecture/arch-runtimes";
import { archGrading } from "./architecture/arch-grading";
import { archDebugger } from "./architecture/arch-debugger";
import { archWhiteboard } from "./architecture/arch-whiteboard";
import { archMock } from "./architecture/arch-mock";
import { archApis } from "./architecture/arch-apis";
import { archSearch } from "./architecture/arch-search";
import { archDesignSystem } from "./architecture/arch-design-system";
import { archPerformance } from "./architecture/arch-performance";
import { archSecurity } from "./architecture/arch-security";
import { archTesting } from "./architecture/arch-testing";
import { archDelivery } from "./architecture/arch-delivery";
import { archHealth } from "./architecture/arch-health";
import { archScaling } from "./architecture/arch-scaling";
import { archRoadmap } from "./architecture/arch-roadmap";

export const architectureNotes: NotesFile = {
  meta: {
    title: "How this site is built",
    subtitle: "26 chapters on the architecture, the stack, every feature, and what would break first.",
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
    archRoutes,
    archRequestPath,
    archBuild,
    archRendering,
    archState,
    archPlayground,
    archRuntimes,
    archGrading,
    archDebugger,
    archWhiteboard,
    archMock,
    archApis,
    archSearch,
    archDesignSystem,
    archPerformance,
    archSecurity,
    archTesting,
    archDelivery,
    archHealth,
    archScaling,
    archRoadmap,
  ],
};
