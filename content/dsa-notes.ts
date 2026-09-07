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

export const dsaNotes: NotesFile = {
  meta: {
    title: "DSA in JS — the whole map",
    subtitle: "34 sections across three levels — beginner through advanced, all written.",
    lead: "Pick a level and you'll get these sections in the order that makes sense, from the first pointer trick to segment trees and interview strategy.",
    author: "Akshat",
    updated: "August 2026",
  },

  hero: { figure: "" },

  chapters: [
    dsaComplexityAnalysis,
    dsaArraysStrings,
    dsaHashing,
    dsaTwoPointers,
    dsaSlidingWindow,
    dsaBinarySearch,
    dsaSortingAlgorithms,
    dsaStacksQueues,
    dsaLinkedLists,
    dsaBasicRecursion,
    dsaTrees,
    dsaTreeProblems,
    dsaHeapsPriorityQueues,
    dsaGraphsRepresentationTraversal,
    dsaGraphProblems,
    dsaBacktracking,
    dsaDp1d,
    dsaDp2d,
    dsaGreedy,
    dsaIntervals,
    dsaBitManipulation,
    dsaMatrixProblems,
    dsaAdvancedDp,
    dsaUnionFind,
    dsaAdvancedGraphAlgorithms,
    dsaMinimumSpanningTree,
    dsaTries,
    dsaSegmentFenwickTrees,
    dsaStringAlgorithms,
    dsaMonotonicStackQueue,
    dsaDesignProblems,
    dsaAdvancedBacktracking,
    dsaTopologicalPatterns,
    dsaInterviewStrategy,
  ],
};
