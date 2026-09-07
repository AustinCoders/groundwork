import type { NotesFile } from "./types";
import { reactSetupJsx } from "./react/react-setup-jsx";
import { reactComponents } from "./react/react-components";
import { reactProps } from "./react/react-props";
import { reactUsestate } from "./react/react-usestate";
import { reactEventsConditionals } from "./react/react-events-conditionals";
import { reactListsKeys } from "./react/react-lists-keys";
import { reactForms } from "./react/react-forms";
import { reactUseeffectBasics } from "./react/react-useeffect-basics";
import { reactLiftingStyling } from "./react/react-lifting-styling";
import { reactUseref } from "./react/react-useref";
import { reactContext } from "./react/react-context";
import { reactUsereducer } from "./react/react-usereducer";
import { reactCustomHooks } from "./react/react-custom-hooks";
import { reactEffectsDepth } from "./react/react-effects-depth";
import { reactRouter } from "./react/react-router";
import { reactStateArchitecture } from "./react/react-state-architecture";
import { reactMemoisation } from "./react/react-memoisation";
import { reactBoundariesPortals } from "./react/react-boundaries-portals";
import { reactDataFetching } from "./react/react-data-fetching";
import { reactFormsAtScale } from "./react/react-forms-at-scale";
import { reactStateLibraries } from "./react/react-state-libraries";
import { reactServerState } from "./react/react-server-state";
import { reactTesting } from "./react/react-testing";
import { reactTypescript } from "./react/react-typescript";
import { reactFiber } from "./react/react-fiber";
import { reactConcurrent } from "./react/react-concurrent";
import { reactSuspense } from "./react/react-suspense";
import { reactServerComponents } from "./react/react-server-components";
import { reactServerActions } from "./react/react-server-actions";
import { reactUseHook } from "./react/react-use-hook";
import { reactRenderingStrategies } from "./react/react-rendering-strategies";
import { reactEffectTiming } from "./react/react-effect-timing";
import { reactSyncExternalStore } from "./react/react-sync-external-store";
import { reactRefsDepth } from "./react/react-refs-depth";
import { reactAdvancedPatterns } from "./react/react-advanced-patterns";
import { reactPerformance } from "./react/react-performance";
import { reactAccessibility } from "./react/react-accessibility";
import { reactDesignSystems } from "./react/react-design-systems";
import { reactAdvancedTypescript } from "./react/react-advanced-typescript";
import { reactArchitectureScale } from "./react/react-architecture-scale";
import { reactCustomRenderers } from "./react/react-custom-renderers";

export const reactNotes: NotesFile = {
  meta: {
    title: "React — the whole map",
    subtitle: "41 sections across three levels, all written — JSX through custom renderers.",
    lead: "Pick a level and you'll get these sections in the order that makes sense — from what JSX compiles to, through why it re-rendered, to the reconciler underneath and the server boundary above it.",
    author: "Akshat",
    updated: "September 2026",
  },

  hero: { figure: "" },

  chapters: [
    reactSetupJsx,
    reactComponents,
    reactProps,
    reactUsestate,
    reactEventsConditionals,
    reactListsKeys,
    reactForms,
    reactUseeffectBasics,
    reactLiftingStyling,
    reactUseref,
    reactContext,
    reactUsereducer,
    reactCustomHooks,
    reactEffectsDepth,
    reactRouter,
    reactStateArchitecture,
    reactMemoisation,
    reactBoundariesPortals,
    reactDataFetching,
    reactFormsAtScale,
    reactStateLibraries,
    reactServerState,
    reactTesting,
    reactTypescript,
    reactFiber,
    reactConcurrent,
    reactSuspense,
    reactServerComponents,
    reactServerActions,
    reactUseHook,
    reactRenderingStrategies,
    reactEffectTiming,
    reactSyncExternalStore,
    reactRefsDepth,
    reactAdvancedPatterns,
    reactPerformance,
    reactAccessibility,
    reactDesignSystems,
    reactAdvancedTypescript,
    reactArchitectureScale,
    reactCustomRenderers,
  ],
};
