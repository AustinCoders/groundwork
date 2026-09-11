import type { NotesFile } from "./types";
import { setupMentalModel } from "./js/setup-mental-model";
import { executionContext } from "./js/execution-context";
import { singleThread } from "./js/single-thread";
import { inTheBrowser } from "./js/in-the-browser";
import { typesValues } from "./js/types-values";
import { operatorsFlow } from "./js/operators-flow";
import { functionsBasics } from "./js/functions-basics";
import { objectsArraysBasics } from "./js/objects-arrays-basics";
import { domEvents } from "./js/dom-events";
import { basicAsync } from "./js/basic-async";
import { errorsTools } from "./js/errors-tools";
import { scopeFunctions } from "./js/scope-functions";
import { objectsDeep } from "./js/objects-deep";
import { prototypesOop } from "./js/prototypes-oop";
import { asyncProperly } from "./js/async-properly";
import { modulesTooling } from "./js/modules-tooling";
import { regexDatesApis } from "./js/regex-dates-apis";
import { errorHandlingDebugging } from "./js/error-handling-debugging";
import { realtimeConnections } from "./js/realtime-connections";
import { offlineStorage } from "./js/offline-storage";
import { engineMemory } from "./js/engine-memory";
import { advancedAsync } from "./js/advanced-async";
import { metaprogramming } from "./js/metaprogramming";
import { typesData } from "./js/types-data";
import { patternsArchitecture } from "./js/patterns-architecture";
import { performance } from "./js/performance";
import { security } from "./js/security";
import { ecosystemProfessional } from "./js/ecosystem-professional";
import { testingInJs } from "./js/testing-in-js";
import { cheat } from "./js/cheat";
import { browserObservability } from "./js/browser-observability";
import { interviewBank } from "./js/interview-bank";
import { guidedProjectTodo } from "./js/guided-project-todo";

export const jsNotes: NotesFile = {
  meta: {
    title: "JavaScript — the whole map",
    subtitle:
      "33 sections across three levels, all written — from how the engine runs your code to security and testing.",
    lead: "Pick a level and you'll get these sections in the order that makes sense — from what the engine does before line 1 runs, through the event loop, to testing and security.",
    author: "Akshat",
    updated: "September 2026",
  },

  hero: {
    figure: "",
  },

  chapters: [
    setupMentalModel,
    executionContext,
    singleThread,
    inTheBrowser,
    typesValues,
    operatorsFlow,
    functionsBasics,
    objectsArraysBasics,
    domEvents,
    basicAsync,
    errorsTools,
    guidedProjectTodo,
    scopeFunctions,
    objectsDeep,
    prototypesOop,
    asyncProperly,
    modulesTooling,
    regexDatesApis,
    errorHandlingDebugging,
    realtimeConnections,
    offlineStorage,
    engineMemory,
    advancedAsync,
    metaprogramming,
    typesData,
    patternsArchitecture,
    performance,
    security,
    ecosystemProfessional,
    testingInJs,
    browserObservability,
    interviewBank,
    cheat,
  ],
};
