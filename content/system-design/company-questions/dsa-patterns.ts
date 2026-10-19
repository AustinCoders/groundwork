import type { PatternId } from "./dsa-types";

export const PATTERN_NAMES: Readonly<Record<PatternId, string>> = {
  window: "Sliding window",
  pointers: "Two pointers",
  hash: "Hashing",
  heap: "Heaps",
  graph: "Graphs and grids",
  dp: "Dynamic programming",
  search: "Binary search",
  stack: "Stacks",
  intervals: "Intervals",
  tree: "Trees",
  list: "Linked lists",
  design: "Design a structure",
  union: "Union-find",
  greedy: "Greedy",
  backtrack: "Backtracking",
  sort: "Sorting",
};
