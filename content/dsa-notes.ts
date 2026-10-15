import type { NotesFile } from "./types";
import { dsaComplexityAnalysis } from "./dsa/dsa-complexity-analysis";
import { dsaArraysStrings } from "./dsa/dsa-arrays-strings";
import { dsaHashing } from "./dsa/dsa-hashing";
import { dsaTwoPointers } from "./dsa/dsa-two-pointers";
import { dsaSlidingWindow } from "./dsa/dsa-sliding-window";
import { dsaBinarySearch } from "./dsa/dsa-binary-search";
import { dsaSortingAlgorithms } from "./dsa/dsa-sorting-algorithms";
import { dsaStacksQueues } from "./dsa/dsa-stacks-queues";
import { dsaLinkedLists } from "./dsa/dsa-linked-lists";
import { dsaBasicRecursion } from "./dsa/dsa-basic-recursion";
import { dsaTrees } from "./dsa/dsa-trees";
import { dsaTreeProblems } from "./dsa/dsa-tree-problems";
import { dsaHeapsPriorityQueues } from "./dsa/dsa-heaps-priority-queues";
import { dsaGraphsRepresentationTraversal } from "./dsa/dsa-graphs-representation-traversal";
import { dsaGraphProblems } from "./dsa/dsa-graph-problems";
import { dsaBacktracking } from "./dsa/dsa-backtracking";
import { dsaDp1d } from "./dsa/dsa-dp-1d";
import { dsaDp2d } from "./dsa/dsa-dp-2d";
import { dsaGreedy } from "./dsa/dsa-greedy";
import { dsaIntervals } from "./dsa/dsa-intervals";
import { dsaBitManipulation } from "./dsa/dsa-bit-manipulation";
import { dsaMatrixProblems } from "./dsa/dsa-matrix-problems";
import { dsaAdvancedDp } from "./dsa/dsa-advanced-dp";
import { dsaUnionFind } from "./dsa/dsa-union-find";
import { dsaAdvancedGraphAlgorithms } from "./dsa/dsa-advanced-graph-algorithms";
import { dsaMinimumSpanningTree } from "./dsa/dsa-minimum-spanning-tree";
import { dsaTries } from "./dsa/dsa-tries";
import { dsaSegmentFenwickTrees } from "./dsa/dsa-segment-fenwick-trees";
import { dsaStringAlgorithms } from "./dsa/dsa-string-algorithms";
import { dsaMonotonicStackQueue } from "./dsa/dsa-monotonic-stack-queue";
import { dsaDesignProblems } from "./dsa/dsa-design-problems";
import { dsaAdvancedBacktracking } from "./dsa/dsa-advanced-backtracking";
import { dsaTopologicalPatterns } from "./dsa/dsa-topological-patterns";
import { dsaInterviewStrategy } from "./dsa/dsa-interview-strategy";
import { dsaJsToolkit } from "./dsa/dsa-js-toolkit";
import { dsaPrefixSums } from "./dsa/dsa-prefix-sums";
import { dsaBstOperations } from "./dsa/dsa-bst-operations";
import { dsaGridBfs } from "./dsa/dsa-grid-bfs";
import { dsaDpStateMachines } from "./dsa/dsa-dp-state-machines";
import { dsaMath } from "./dsa/dsa-math";
import { dsaGraphStructure } from "./dsa/dsa-graph-structure";
import { dsaSparseTable } from "./dsa/dsa-sparse-table";
import { dsaDesignSimulation } from "./dsa/dsa-design-simulation";
import { dsaDivideConquer } from "./dsa/dsa-divide-conquer";
import { dsaRandomizationSampling } from "./dsa/dsa-randomization-sampling";
import { dsaGamesProbabilityDp } from "./dsa/dsa-games-probability-dp";
import { dsaOrderedStructures } from "./dsa/dsa-ordered-structures";
import { dsaSweepLineGeometry } from "./dsa/dsa-sweep-line-geometry";

export const dsaNotes: NotesFile = {
  meta: {
    title: "DSA — the whole map",
    subtitle: "48 sections across three levels — beginner through advanced. All 48 are written.",
    lead: "Pick a level and you'll get these sections in the order that makes sense, from the first pointer trick to segment trees and interview strategy.",
    author: "Akshat",
    updated: "August 2026",
  },

  hero: { figure: "" },

  chapters: [
    dsaComplexityAnalysis,
    dsaJsToolkit,
    dsaArraysStrings,
    dsaPrefixSums,
    dsaHashing,
    dsaTwoPointers,
    dsaSlidingWindow,
    dsaBinarySearch,
    dsaBasicRecursion,
    dsaSortingAlgorithms,
    dsaStacksQueues,
    dsaLinkedLists,
    dsaTrees,
    dsaBstOperations,
    dsaTreeProblems,
    dsaHeapsPriorityQueues,
    dsaGraphsRepresentationTraversal,
    dsaGridBfs,
    dsaGraphProblems,
    dsaTopologicalPatterns,
    dsaBacktracking,
    dsaDp1d,
    dsaDp2d,
    dsaDpStateMachines,
    dsaGreedy,
    dsaIntervals,
    dsaBitManipulation,
    dsaMatrixProblems,
    dsaTries,
    dsaMonotonicStackQueue,
    dsaMath,
    dsaDesignSimulation,
    dsaDivideConquer,
    dsaRandomizationSampling,
    dsaAdvancedDp,
    dsaUnionFind,
    dsaAdvancedGraphAlgorithms,
    dsaMinimumSpanningTree,
    dsaGraphStructure,
    dsaSegmentFenwickTrees,
    dsaSparseTable,
    dsaStringAlgorithms,
    dsaDesignProblems,
    dsaAdvancedBacktracking,
    dsaGamesProbabilityDp,
    dsaOrderedStructures,
    dsaSweepLineGeometry,
    dsaInterviewStrategy,
  ],
};
