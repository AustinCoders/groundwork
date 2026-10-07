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
    subtitle: "42 sections across three levels — beginner through advanced. 34 are written; the other 8 are outlined.",
    lead: "Pick a level and you'll get these sections in the order that makes sense, from the first pointer trick to segment trees and interview strategy.",
    author: "Akshat",
    updated: "August 2026",
  },

  hero: { figure: "" },

  chapters: [
    dsaComplexityAnalysis,
    {
      id: "dsa-js-toolkit",
      num: "B2",
      title: "The JavaScript toolkit for DSA",
      short: "JavaScript toolkit",
      levels: ["beginner"],
      prerequisites: ["dsa-complexity-analysis"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    dsaArraysStrings,
    {
      id: "dsa-prefix-sums",
      num: "B4",
      title: "Prefix sums and difference arrays",
      short: "Prefix sums",
      levels: ["beginner"],
      prerequisites: ["dsa-arrays-strings"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    dsaHashing,
    dsaTwoPointers,
    dsaSlidingWindow,
    dsaBinarySearch,
    dsaBasicRecursion,
    dsaSortingAlgorithms,
    dsaStacksQueues,
    dsaLinkedLists,
    dsaTrees,
    {
      id: "dsa-bst-operations",
      num: "I2",
      title: "BST operations and ordered data",
      short: "BST operations",
      levels: ["intermediate"],
      prerequisites: ["dsa-trees", "dsa-binary-search"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    dsaTreeProblems,
    dsaHeapsPriorityQueues,
    dsaGraphsRepresentationTraversal,
    {
      id: "dsa-grid-bfs",
      num: "I6",
      title: "BFS on grids and implicit graphs",
      short: "BFS on grids",
      levels: ["intermediate"],
      prerequisites: ["dsa-graphs-representation-traversal"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    dsaGraphProblems,
    dsaTopologicalPatterns,
    dsaBacktracking,
    dsaDp1d,
    dsaDp2d,
    {
      id: "dsa-dp-state-machines",
      num: "I12",
      title: "DP state machines and the knapsack family",
      short: "DP state machines",
      levels: ["intermediate"],
      prerequisites: ["dsa-dp-1d"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    dsaGreedy,
    dsaIntervals,
    dsaBitManipulation,
    dsaMatrixProblems,
    dsaTries,
    dsaMonotonicStackQueue,
    {
      id: "dsa-math",
      num: "I19",
      title: "Math for interviews",
      short: "Math for interviews",
      levels: ["intermediate"],
      prerequisites: ["dsa-basic-recursion"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    dsaAdvancedDp,
    dsaUnionFind,
    dsaAdvancedGraphAlgorithms,
    dsaMinimumSpanningTree,
    {
      id: "dsa-graph-structure",
      num: "A5",
      title: "Advanced graphs: SCC, bridges, Euler paths, LCA",
      short: "Advanced graphs",
      levels: ["advanced"],
      prerequisites: ["dsa-topological-patterns", "dsa-advanced-graph-algorithms"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    dsaSegmentFenwickTrees,
    {
      id: "dsa-sparse-table",
      num: "A7",
      title: "Sparse tables and range tricks",
      short: "Sparse tables",
      levels: ["advanced"],
      prerequisites: ["dsa-segment-fenwick-trees"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    dsaStringAlgorithms,
    dsaDesignProblems,
    dsaAdvancedBacktracking,
    dsaInterviewStrategy,
  ],
};
