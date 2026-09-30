# DSA curriculum map

The target order, levels and prerequisites for the 42 chapters. It is the source for CAP-5 and CAP-6.

Evidence: `_bmad-output/planning-artifacts/dsa-analysis-2026-09-30/content.md` §2–§4 and §7.

## Rules

- **Stable ids.** Chapter ids never change; only `num`, `level` and order do. New chapters take the ids below.
- **Depth bar.** A chapter meets it when:
  - it is at least 1,200 words of prose;
  - it follows the arc: intuition → diagram → code → dry run → complexity → pitfalls → recognition → before you move on;
  - it has a why-it-works box and a common-mistakes box (CAP-7);
  - its code matches its player's code.
- **Exercise fit.** A chapter teaches every technique its linked exercises need. Each chapter has at least one exercise at its own level or lower.
- **Prerequisites.** Every chapter lists them by id. Placement credit and the plan honour them.
- **Reading time** counts prose only, with no `<script>` or `<pre>` tokens.

## Order

Status key:
- **keep:** existing chapter, reaches the depth bar where it falls short;
- **deepen:** below the bar, listed techniques added;
- **move:** changes level or position;
- **new:** to be written.

### Beginner (12)

| # | id | Title | Status | Work | Prerequisites |
|---|---|---|---|---|---|
| B1 | dsa-complexity-analysis | Complexity analysis | keep + fix | Fix O/Ω as bounds, not cases; add the constraint → complexity table from interview strategy | — |
| B2 | dsa-js-toolkit | The JavaScript toolkit for DSA | new | Map/Set/array costs, comparators, no built-in heap/deque/TreeMap, head-index queue, recursion depth, string building, typed arrays | B1 |
| B3 | dsa-arrays-strings | Arrays and strings | deepen | Cyclic sort / index as hash, Boyer-Moore voting | B1, B2 |
| B4 | dsa-prefix-sums | Prefix sums and difference arrays | new | Prefix array, range sum, prefix + hash map (subarray sum = k, negatives), difference arrays, 2D prefix | B3 |
| B5 | dsa-hashing | Hashing | deepen (550 words) | Composite keys in JS, longest consecutive sequence, bucket top-k, collisions | B3 |
| B6 | dsa-two-pointers | Two pointers | deepen (615) | Dutch national flag, next permutation | B3 |
| B7 | dsa-sliding-window | Sliding window | deepen (597) | Fixed vs variable windows, the shrink invariant | B5, B6 |
| B8 | dsa-binary-search | Binary search | deepen (553) | Lower/upper bound, the loop invariant, search on the answer; one midpoint formula across prose and player | B3 |
| B9 | dsa-basic-recursion | Recursion | move before sorting + deepen (634) | Fix the fib(4) diagram, the stack drawing, a real explicit-stack conversion; helper/accumulator; "trust the call"; fast power taught | B1 |
| B10 | dsa-sorting-algorithms | Sorting | move after recursion | Merge and quick sort now follow recursion | B9 |
| B11 | dsa-stacks-queues | Stacks and queues | keep | The head-index queue here is the one every BFS chapter uses | B2 |
| B12 | dsa-linked-lists | Linked lists | keep | — | B2 |

### Intermediate (19)

| # | id | Title | Status | Work | Prerequisites |
|---|---|---|---|---|---|
| I1 | dsa-trees | Trees and traversals | keep | Head-index queue for level order; define node shape before using it | B9, B11 |
| I2 | dsa-bst-operations | BST operations and ordered data | new | Insert, delete, successor, iterator, kth; JS has no TreeMap (sorted array + binary search, heaps) | I1, B8 |
| I3 | dsa-tree-problems | Tree problems | keep | Add beginner-level exercises | I1 |
| I4 | dsa-heaps-priority-queues | Heaps and priority queues | keep | — | I1 |
| I5 | dsa-graphs-representation-traversal | Graphs: representation and traversal | keep | Head-index queue in prose and player | B11, B9 |
| I6 | dsa-grid-bfs | BFS on grids and implicit graphs | new | Direction arrays, distance layers, multi-source, word-ladder state graphs | I5 |
| I7 | dsa-graph-problems | Graph problems | deepen (540) | Complexity statements, cycle detection over all components, head-index queue | I5, I6 |
| I8 | dsa-topological-patterns | Topological sort | move from advanced | Kahn and DFS order; keeps alien dictionary and longest path in a DAG | I7 |
| I9 | dsa-backtracking | Backtracking | deepen | Skipping duplicates (`i > start && a[i] === a[i-1]`) | B9 |
| I10 | dsa-dp-1d | DP in one dimension | deepen (917) | Fix the fib(5) colouring; name the two state styles; word break, decode ways, max product, LIS in n log n | B9, B8 |
| I11 | dsa-dp-2d | DP in two dimensions | keep | — | I10 |
| I12 | dsa-dp-state-machines | DP state machines and the knapsack family | new | Stock series, 0/1 vs unbounded vs bounded knapsack, subset sum, partition | I10 |
| I13 | dsa-greedy | Greedy | deepen | Exchange argument; jump game II, partition labels | B10 |
| I14 | dsa-intervals | Intervals | deepen (604) | Sweep line; meeting rooms with a heap | B10, I4 |
| I15 | dsa-bit-manipulation | Bit manipulation | deepen (631) | — | B1 |
| I16 | dsa-matrix-problems | Matrix problems | deepen (479) | In-place state encoding, staircase search, 2D prefix sums | B4 |
| I17 | dsa-tries | Tries | move from advanced | — | I1, B5 |
| I18 | dsa-monotonic-stack-queue | Monotonic stack and queue | move from advanced | — | B11, B7 |
| I19 | dsa-math | Math for interviews | new | gcd/lcm, mod 1e9+7, BigInt and safe integers, modular fast power (building on B9), sieve, nCr mod p, modular inverse | B9 |

### Advanced (11)

| # | id | Title | Status | Work | Prerequisites |
|---|---|---|---|---|---|
| A1 | dsa-advanced-dp | Advanced DP | keep + fix syllabus | State machines now live in I12; keep bitmask, tree, digit and interval DP | I11, I12 |
| A2 | dsa-union-find | Union-find | keep | — | I5 |
| A3 | dsa-advanced-graph-algorithms | Shortest paths | keep + fix syllabus | Syllabus drops topological sort (now I8) | I4, I6, I8 |
| A4 | dsa-minimum-spanning-tree | Minimum spanning trees | keep | — | A2, I4 |
| A5 | dsa-graph-structure | Advanced graphs: SCC, bridges, Euler paths, LCA | new | Tarjan/Kosaraju, bridges and articulation points, Euler path (reconstruct itinerary), LCA by binary lifting | I8, A3 |
| A6 | dsa-segment-fenwick-trees | Segment and Fenwick trees | keep | — | I1, B4 |
| A7 | dsa-sparse-table | Sparse tables and range tricks | new | RMQ, binary lifting reuse, sqrt decomposition | A6 |
| A8 | dsa-string-algorithms | String algorithms | keep + fix | Replace the NUL separators | B5, B4 |
| A9 | dsa-design-problems | Design problems | keep | — | B5, B12, I4 |
| A10 | dsa-advanced-backtracking | Advanced backtracking | keep | — | I9 |
| A11 | dsa-interview-strategy | Interview strategy | keep + fix syllabus | Deliver or drop the "mock technique, company rounds" syllabus line; point to the mock and the interview book | B1 |

## Errors to fix (CAP-5)

1. **NUL separators.** `dsa-string-algorithms.ts:330, 341, 457` use a literal NUL, which browsers drop, so `zSearch("abab","ab")` returns `[1]`. Use a visible separator and add a test that no content file holds U+0000.
2. **The code-line highlight never fires** in the 8 old demos. The new player replaces them.
3. **B9 recursion:**
   - The fib(4) diagram draws two fib(1) nodes against its caption.
   - The "explicit stack" section shows a plain loop.
   - The call stack is drawn upside down.
4. **I10 DP 1D:** the fib(5) repeat colouring is wrong.
5. **B1 complexity:** O and Ω are taught as worst and best case.
6. **Queue advice contradicts itself.** B11 warns against `shift()`, while I1, I5 and I7 use it and claim O(V+E).
7. **Syllabus lines the chapters don't keep:** A1 promises state machines, A3 promises topological sort, and A11 promises mock technique and company rounds.
8. **Stale count.** `interview-data.ts:2478, 4200` say 245 DSA exercises (there are 277). The number should be derived and asserted.
9. **Reading time** counts `<script>` and `<pre>` tokens.

## Exercises

- **Add at least one exercise at or below the chapter's level** to B7 (sliding window), I3 (tree problems), I5 (graph traversal), I7 (graph problems), I9 (backtracking), I11 (DP 2D) and I16 (matrix).
- **Link new chapters to exercises that already exist:**
  - B4: Subarray Sum Equals K, Continuous Subarray Sum, Max Size Subarray Sum Equals K, Contiguous Array.
  - I6: Word Ladder, Pacific Atlantic, Shortest Path in Binary Matrix.
  - I12: House Robber II, Partition Equal Subset Sum.
- Fast power is taught and practised in B9. I19 links back to it rather than taking the exercise.
- **New chapters** move the existing exercises that fit and get new exercises where none exist (user, 2026-09-30).
- **Moving an exercise between chapters** updates both `Chapter.practice` and `Exercise.chapter`.
