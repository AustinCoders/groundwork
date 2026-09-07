import type { NotesFile } from "./types";
import { setupMentalModel } from "./js/setup-mental-model";
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

export const jsNotes: NotesFile = {
  meta: {
    title: "JavaScript — the whole map",
    subtitle: "23 sections across three levels. The first two are written — the rest are still on the desk.",
    lead: "Pick a level and you'll get these sections in the order that makes sense. Each one opens here the moment it's written; until then it says so.",
    author: "Akshat",
    updated: "August 2026",
  },

  hero: {
    figure: "",
  },

  chapters: [
    setupMentalModel,
    typesValues,
    operatorsFlow,
    functionsBasics,
    objectsArraysBasics,
    domEvents,
    basicAsync,
    errorsTools,
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
    cheat,
  ],
};
