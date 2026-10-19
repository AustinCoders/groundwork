# DSA content audit, October 2026

Scope: the 48 written DSA chapters in `content/dsa/`, their 673 coding exercises, and their 48 quiz pools, checked against
Sedgewick and Wayne's Algorithms (4th edition), CLRS, cp-algorithms.com and the NeetCode 150 list. This file records what the audit found. **Nothing was changed
in the chapters yet**: it is the findings and the fix plan.

## Verdict

DSA is the strongest topic on the site. Across more than 700 code blocks, every algorithm was run against a brute force
and was correct; every reference solution passes its own tests; every quiz key that was recomputed was right. What is wrong
is almost never the algorithm. It is the prose around it, a few claims about JavaScript engines, and exercise briefs that
promise more than their tests check.

Average scores before any fixes: accuracy 8.8, depth 8.2, currency 8.7, clarity 8.8 (each out of 10).
The audit found 22 false claims, bugs or contradictions (in 17 of the 48 chapters) and about 110 misleading or loose statements.
The lowest accuracy scores are the topological patterns chapter (7), the matrix chapter (7) and the chapters on trees,
graph traversal, grid BFS, math, MST, string algorithms, advanced DP and union-find (8 each).

The biggest weakness is not in the chapters at all. It is that many exercise briefs state a complexity target (for example
"O(log n)" or "do better than O(n²)") while the tests use inputs so small that a slow solution passes. The second is that
the course teaches or ignores the same JavaScript engine facts in different chapters and gives numbers that disagree.

## Method

1. **Mechanical pass.** All 673 exercises were executed in a sandbox: the reference solution against its tests, and the
   starter code against the same tests, with a per-test timeout. Link integrity between chapters and exercises was checked,
   and the NeetCode 150 titles were matched against exercise titles and chapter text.
2. **Eight independent reviewers**, each reading six chapters in full. They extracted every code block and ran it on Node 24.14.1,
   fuzzed algorithms against brute force (thousands to tens of thousands of random cases per function), reproduced the
   numbers the prose claims, recomputed the chapters' dry-run tables, read the quiz pools (all 48 pools were covered, most of
   them in full), sampled three or more exercises per chapter, checked JavaScript facts against MDN, the ECMAScript spec and V8
   sources, and compared coverage with the benchmarks.
3. The reviewers did not see each other's reports. Where several of them noticed the same thing, it is listed as systemic below.

## What the mechanical pass found

| Check                                                              | Result                                                                                                                                               |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reference solution passes all of its tests                         | 673 of 673                                                                                                                                           |
| Starter code fails at least one test (so the tests test something) | 673 of 673                                                                                                                                           |
| Fewest tests in an exercise                                        | 6                                                                                                                                                    |
| Exercises by label                                                 | 139 beginner, 364 intermediate, 170 advanced                                                                                                         |
| Slowest exercise (reference solution)                              | `ex-closest-subsequence-sum` 2.5 s, `ex-open-the-lock` 1.7 s, against a 5 s runner limit in `lib/runner.ts`                                          |
| Chapter practice lists naming an exercise that does not exist      | 0                                                                                                                                                    |
| Exercises that no chapter lists                                    | 3: `ex-numbers-at-most-n-given-digit-set`, `ex-widest-path-capacity`, `ex-alias-method`                                                              |
| Chapters that list another chapter's exercise                      | 114 listings, apparently intentional reuse                                                                                                           |
| NeetCode 150 problems with a matching exercise                     | 143 of 150 (Design Twitter is the news-feed exercise)                                                                                                |
| NeetCode 150 problems absent from the whole course                 | 6: Kth Largest Element in a Stream, Swim in Rising Water, Hand of Straights, Merge Triplets to Form Target Triplet, Multiply Strings, Detect Squares |

## Scorecard before the fixes

"False" means a false statement, a bug that returns a wrong answer on valid input, or an exercise brief that contradicts its tests.
"Misleading" means true as written but likely to leave a wrong picture, or a loose or unreproducible figure.

| #   | Chapter                               | Accuracy | Depth | Currency | Clarity | False | Misleading |
| --- | ------------------------------------- | -------- | ----- | -------- | ------- | ----- | ---------- |
| 1   | `dsa-complexity-analysis`             | 8        | 8     | 9        | 9       | 1     | 5          |
| 2   | `dsa-js-toolkit`                      | 8        | 9     | 7        | 9       | 1     | 4          |
| 3   | `dsa-arrays-strings`                  | 9        | 8     | 8        | 9       | 1     | 3          |
| 4   | `dsa-prefix-sums`                     | 10       | 9     | 9        | 9       | 0     | 3          |
| 5   | `dsa-hashing`                         | 9        | 7     | 8        | 9       | 0     | 3          |
| 6   | `dsa-two-pointers`                    | 9        | 9     | 9        | 8       | 0     | 3          |
| 7   | `dsa-sliding-window`                  | 9        | 8     | 8        | 9       | 0     | 5          |
| 8   | `dsa-binary-search`                   | 9        | 9     | 8        | 9       | 0     | 4          |
| 9   | `dsa-basic-recursion`                 | 9        | 8     | 8        | 9       | 1     | 3          |
| 10  | `dsa-sorting-algorithms`              | 8.5      | 9     | 7        | 9       | 1     | 5          |
| 11  | `dsa-stacks-queues`                   | 9.5      | 8     | 8        | 9       | 0     | 3          |
| 12  | `dsa-linked-lists`                    | 8.5      | 9     | 8        | 9       | 2     | 3          |
| 13  | `dsa-trees`                           | 8        | 8     | 9        | 9       | 1     | 3          |
| 14  | `dsa-bst-operations`                  | 9        | 9     | 9        | 9       | 0     | 2          |
| 15  | `dsa-tree-problems`                   | 8        | 9     | 9        | 9       | 1     | 4          |
| 16  | `dsa-heaps-priority-queues`           | 9        | 8     | 8        | 9       | 0     | 2          |
| 17  | `dsa-graphs-representation-traversal` | 8        | 7     | 9        | 9       | 1     | 2          |
| 18  | `dsa-grid-bfs`                        | 8        | 9     | 9        | 9       | 0     | 2          |
| 19  | `dsa-graph-problems`                  | 9        | 7     | 9        | 9       | 0     | 3          |
| 20  | `dsa-topological-patterns`            | 7        | 9     | 7        | 8       | 3     | 4          |
| 21  | `dsa-backtracking`                    | 10       | 8     | 9        | 9       | 1     | 0          |
| 22  | `dsa-dp-1d`                           | 9        | 8     | 8        | 9       | 0     | 3          |
| 23  | `dsa-dp-2d`                           | 10       | 9     | 9        | 9       | 0     | 0          |
| 24  | `dsa-dp-state-machines`               | 9        | 8     | 9        | 9       | 0     | 1          |
| 25  | `dsa-greedy`                          | 9        | 7     | 10       | 8       | 0     | 4          |
| 26  | `dsa-intervals`                       | 9        | 7     | 10       | 7       | 0     | 2          |
| 27  | `dsa-bit-manipulation`                | 9        | 8     | 9        | 9       | 0     | 5          |
| 28  | `dsa-matrix-problems`                 | 7        | 7     | 9        | 8       | 3     | 0          |
| 29  | `dsa-tries`                           | 9        | 8     | 9        | 8       | 0     | 4          |
| 30  | `dsa-monotonic-stack-queue`           | 10       | 9     | 10       | 8       | 0     | 3          |
| 31  | `dsa-math`                            | 8        | 8     | 9        | 9       | 0     | 2          |
| 32  | `dsa-design-simulation`               | 10       | 8     | 9        | 9       | 0     | 0          |
| 33  | `dsa-divide-conquer`                  | 9        | 9     | 9        | 9       | 0     | 0          |
| 34  | `dsa-randomization-sampling`          | 9        | 8     | 9        | 9       | 0     | 1          |
| 35  | `dsa-advanced-dp`                     | 8        | 9     | 9        | 9       | 1     | 1          |
| 36  | `dsa-union-find`                      | 8        | 9     | 9        | 9       | 1     | 1          |
| 37  | `dsa-minimum-spanning-tree`           | 8        | 8     | 9        | 9       | 1     | 1          |
| 38  | `dsa-string-algorithms`               | 8        | 8     | 8        | 9       | 1     | 4          |
| 39  | `dsa-advanced-graph-algorithms`       | 9        | 7     | 9        | 9       | 0     | 2          |
| 40  | `dsa-graph-structure`                 | 9        | 8     | 9        | 8       | 0     | 2          |
| 41  | `dsa-segment-fenwick-trees`           | 9        | 8     | 9        | 9       | 0     | 3          |
| 42  | `dsa-sparse-table`                    | 9        | 8     | 9        | 8       | 0     | 1          |
| 43  | `dsa-design-problems`                 | 9.5      | 8     | 9        | 9       | 0     | 1          |
| 44  | `dsa-advanced-backtracking`           | 9        | 9     | 9        | 9       | 0     | 2          |
| 45  | `dsa-games-probability-dp`            | 9.7      | 8.5   | 9        | 9       | 0     | 1          |
| 46  | `dsa-ordered-structures`              | 9.3      | 9     | 9        | 9       | 1     | 0          |
| 47  | `dsa-sweep-line-geometry`             | 9.8      | 8     | 9        | 9       | 0     | 1          |
| 48  | `dsa-interview-strategy`              | 9.3      | 7.5   | 9        | 9.5     | 0     | 3          |

## The false claims and bugs, in one place

| Chapter                               | What is wrong                                                                                                                                                                                                                                                                     | Evidence                                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `dsa-topological-patterns`            | The DFS section says a node lands after everything it depends on, so reversing helps; with the chapter's edge direction the post-order puts a node after its dependents (edge 0 to 1 gives [1, 0]). Also "the return order is exactly reverse post-order" (it is the post-order). | Run on the chapter's own edge convention                                                      |
| `dsa-topological-patterns`            | `longestPath` seeds distance 0 only at in-degree-0 nodes, so with negative weights it misses paths that start mid-graph: `longestPath(3, [[0,1,-5],[1,2,10]])` returns 5, the answer is 10                                                                                        | 203 of 3,000 random negative-weight DAGs disagree with brute force                            |
| `dsa-matrix-problems`                 | Recursive `numIslands` throws RangeError on an all-land grid of 95 by 95 or more; LeetCode allows 300 by 300. The exercise's largest test is 40 by 40.                                                                                                                            | Measured: passes at 90, fails at 95                                                           |
| `ex-game-of-life`                     | Hints 2 and 3 describe two incompatible encodings; following hint 2 then `value >> 1` keeps a dying cell alive                                                                                                                                                                    | Reference uses a third encoding                                                               |
| `ex-gas-station`                      | The brief says the answer is unique, but its own test has four valid starts and accepts only the smallest                                                                                                                                                                         | Test `[0,0,0,0]`                                                                              |
| `dsa-minimum-spanning-tree`           | `heaviestOnPath` starts at 0, so with negative weights `secondBestMSTWeight` can return a weight lighter than the MST (-9 against an MST of -8); a self-loop returns 6 instead of Infinity. The exercise reference has the same bug.                                              | Edges `[[0,1,-5],[1,2,-3],[0,2,-1]]`                                                          |
| `dsa-string-algorithms`               | Aho-Corasick walks words by code point but searches the text by code unit, and `suffixArray` mixes the two: `ahoCorasickSearch("a😀b", ["😀"])` returns `[]`, `suffixArray("a😀b")` returns `[0,2,3,1]` (correct `[0,3,1,2]`)                                                     | Run                                                                                           |
| `dsa-graphs-representation-traversal` | "Both are valid depth-first orders" for mark-on-push single-stack DFS against recursive DFS; true for the diamond example, false in general                                                                                                                                       | 226 of 20,000 random digraphs produce an order no DFS can; counterexample in the review notes |
| `dsa-trees`                           | Iterative post-order: "Right-Node-Left reversed is exactly Left-Right-Node"; the traversal that reverses to post-order is Node-Right-Left                                                                                                                                         | 3,000 random trees                                                                            |
| `dsa-tree-problems`                   | A sentence about a right-subtree node being smaller than a distant ancestor contradicts its own figure                                                                                                                                                                            | Figure                                                                                        |
| `dsa-union-find`                      | "α(n) ≤ 4 for any n you can store, n = 2^65536 still gives α = 5": α(2^65536) is 4 under CLRS's definition; 5 is the iterated logarithm                                                                                                                                           | CLRS definition, cp-algorithms                                                                |
| `dsa-advanced-dp`                     | `Int32Array(1 << n)` is "about 4 times smaller" than a JS array; it is 2 times (8 against 4 bytes), and cannot hold the Infinity sentinel the chapter uses                                                                                                                        | 2^23 entries: 64 MB against 32 MB                                                             |
| `dsa-linked-lists`                    | Floyd phase two: "a equals the remaining distance around the cycle", true only modulo the cycle length. Also a table row says insert and delete at a known node is O(1) for a singly linked list (delete needs the predecessor).                                                  | Simulation: tail 5, cycle 3 gives a = 5, remaining = 2                                        |
| `dsa-basic-recursion`                 | `powMod(5n, 0n, 1n)` returns 1n; the answer is 0n, and the chapter's own exercise requires 0n                                                                                                                                                                                     | Run                                                                                           |
| `dsa-sorting-algorithms`              | Cheat sheet gives counting sort space as O(k); the code allocates an O(n) output and CLRS gives Θ(n + k)                                                                                                                                                                          | CLRS 8.2                                                                                      |
| `dsa-complexity-analysis`             | "The expensive pushes (3 and 5) are exactly where Φ drops"; its own table shows push 3 flat                                                                                                                                                                                       | Chapter's dry run                                                                             |
| `dsa-js-toolkit`                      | "1,000,000 appends took 52 ms with `+=` and 14 ms with an array and join": not reproducible, `+=` is as fast or faster on Node 24                                                                                                                                                 | 4 runs, `+=` 8 to 28 ms, join 13 to 44 ms                                                     |
| `dsa-arrays-strings`                  | A code block ends with non-comment lines and does not parse if copied                                                                                                                                                                                                             | Parse                                                                                         |
| `dsa-ordered-structures`              | Dry-run row for `addNum 6` gives the wrong floor interval                                                                                                                                                                                                                         | Run the class                                                                                 |
| `ex-subsets-bitmask`                  | The brief says elements may be returned in any order; two tests require the original relative order                                                                                                                                                                               | Reversed-element solution fails both                                                          |

## Systemic findings

1. **Complexity targets the tests do not enforce.** The most common weakness. A naive solution passes the tests for at least
   `ex-trapping-rain-water`, `ex-boats-to-save-people`, `ex-k-sum`, `ex-number-of-boomerangs`,
   `ex-longest-well-performing-interval`, `ex-submatrices-sum-target`, `ex-trailing-zeroes-factorial`, `ex-merge-k-sorted-lists`,
   `ex-maximum-gap`, `ex-kth-ancestor-queries`, `ex-sparse-table-range-min`, `ex-mo-powerful-array`, `ex-range-sum-query-mutable`,
   `ex-range-add-range-sum`, `ex-fruits-into-baskets`, `ex-fenwick-kth-smallest`, `ex-time-map-out-of-order`, `ex-all-o-one`,
   `ex-closest-pair-squared`, `ex-can-i-win` and `ex-word-search-ii`. A few exercises do enforce it with a large input
   (count-inversions, sliding-window-maximum, stock-span, distinct-substrings); that is the pattern to copy.
2. **`Array.prototype.shift()` as a queue.** Taught as quadratic in one chapter, used as the standard queue in four others
   (trees, BST, graphs, graph problems), and over-warned about in the grid BFS chapter. Measured on Node 24: fast up to about
   16,000 elements, then quadratic (100,000 takes 1.1 s, 400,000 takes 20 s). A perfect tree of 131,071 nodes takes 3.6 s to
   traverse with `shift()` and 2 ms with a head index. But a single-source BFS on a 1000 by 1000 grid is unaffected (90 ms against 76 ms),
   so the grid chapter's "can become quadratic" claim is overstated for that case.
3. **Recursion depth numbers disagree** between chapters (10^4 to 10^5, "tens of thousands", 3,000 to 10,000). Measured on Node 24: about 5,000
   to 10,000 frames depending on the frame. Recursive examples (`numIslands`, flood fill, `sccTarjan`, `findBridges`,
   Aho-Corasick search) are shown before the warning, and some are reused by later code.
4. **Engine facts stated without naming the engine or version.** V8 grows arrays by 1.5 times plus 16, not "doubling" (three chapters),
   `String.prototype.includes` is not linear (a chapter bills a substring check as KMP), `indexOf` is a hybrid, tail calls exist in
   JavaScriptCore only, `toSorted`, `Object.groupBy` and the new Set methods are given without version numbers, `BigInt` does have an upper limit in V8.
5. **Unicode.** String code ignores surrogate pairs and mixes code points with code units in two places.
6. **`Math.max(...array)` throws above about 125,000 elements** in Node 24 and is used in many chapters without a note.
7. **Difficulty labels and chapter levels.** Several exercises are labelled below their LeetCode tier (digit-one and digit-set are Hard,
   labelled intermediate; submatrices-sum-target is Hard) or above it (news feed and redundant connection are Medium, labelled advanced).
   Every sampled chapter is tagged beginner yet ships advanced exercises.
8. **Hand-maintained and first-person numbers.** Dry-run tables are typed by hand and one is wrong. "I measured" and "we checked"
   passages are true when tried, but readers cannot rerun them and millisecond figures are machine-bound. Several seeded figures
   (the circle-sampling table, a quickselect constant, a chi-square statistic) do not reproduce with the stated seed, though the conclusions hold.
9. **Duplicated teaching with different code**: Floyd in two chapters, the knapsack family three times, merge-from-back, `removeElement` and
   `moveZeroes` twice; notation drifts ("·", "×", "*", "^").
10. **Exercise and chapter drift**: the heap's `size` getter against `size()`, null against delete pruning, a rule forbidding `*` that
    the chapter's own solution uses.

## Coverage against the benchmarks

NeetCode 150 is covered except the six problems above. Against Sedgewick, CLRS and cp-algorithms, whole areas are absent from the course
(a search of `content/dsa` finds no mention of Johnson, max-flow, bipartite matching, Dial or Yen):

| Area                                                                                                           | Where it appears in the benchmarks    | In the course                                 |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------- |
| Network flow and matching: Ford-Fulkerson, Edmonds-Karp, Dinic, min-cost flow, Kuhn, Hopcroft-Karp, Hungarian  | Sedgewick 6.4, CLRS 26, cp-algorithms | **Missing**                                   |
| Johnson's algorithm, bucket queues, k shortest paths, difference constraints                                   | CLRS 24 to 25                         | **Missing**                                   |
| Balanced search trees: 2-3, red-black, B-trees, splay                                                          | Sedgewick 3.3, 6.2, CLRS 13, 18       | Treap and bucket list only                    |
| String sorts, regular expressions, data compression                                                            | Sedgewick 5.1, 5.4, 5.5               | **Missing** (string search and tries covered) |
| NP-completeness, reductions, approximation                                                                     | CLRS 34 to 35, Sedgewick 6.5 to 6.6   | A table only                                  |
| Number theory beyond the basics: CRT, totient, Miller-Rabin, Pollard rho, segmented sieve, inclusion-exclusion | cp-algorithms Algebra                 | Named, not taught                             |
| FFT and NTT, linear algebra                                                                                    | CLRS 30, cp-algorithms                | **Missing**                                   |
| Suffix tree and automaton, palindromic tree, Lyndon                                                            | cp-algorithms String Processing       | Suffix array only                             |
| Heavy-light, centroid decomposition, 2-SAT, biconnected components                                             | cp-algorithms Graphs                  | Named, mostly not taught                      |
| Amortised analysis by accounting, comparison-sort lower bound, Master theorem, Akra-Bazzi                      | CLRS 3 to 4, 17; Sedgewick 1.4        | Partly                                        |
| Probabilistic structures: Bloom filter, HyperLogLog, count-min, MinHash                                        | CLRS, cp-algorithms                   | Named only                                    |
| Dancing links, Knuth and divide-and-conquer DP optimisation, Aliens trick, SOS DP, profile DP                  | cp-algorithms DP                      | Named only                                    |
| Computational geometry beyond hulls and sweeps: rotating calipers, half-plane intersection, Delaunay           | cp-algorithms Geometry                | **Missing**                                   |

Individual chapters also have short lists of problems and concepts they could add; they are in the per-group review notes
(see "Where the detail is").

## Fix plan, in the order worth doing

1. **Correct the false claims and bugs** in the table above (about 25 edits, mostly small). Put the broken examples
   (negative-weight longest path, second-best MST, non-BMP Aho-Corasick and suffix array, `powMod` modulus 1, `numIslands` recursion) into the
   exercise tests so they stay fixed.
2. **Make the exercise tests enforce the targets** the briefs state: add one large-input test to each exercise in the list above.
   This is the highest-value change; it turns "aim for O(n)" from advice into something the runner checks.
3. **Systemic edits**: one sentence in the JS toolkit chapter on engine versions, one consistent `shift()` paragraph with the measured V8
   threshold, one consistent recursion-depth number (about 5,000 to 10,000 frames), a note on `Math.max(...array)`, a surrogate-pair
   caveat in the string chapters, and corrected difficulty labels.
4. **A permanent mechanical test.** The exercise run in this audit (every reference solution passes, every starter fails, nothing slower
   than a limit) takes a few minutes, which is too slow for `npm run check`. It should live as a separate command, plus a cheap
   check that every exercise belongs to a chapter's practice list.
5. **Fill the coverage gaps**, as new chapters, in this order of interview and learning value: network flow and matching; shortest-path
   extras (Johnson, bucket queue) folded into the advanced graph chapter; balanced search trees; string sorting and compression; NP-completeness
   and reductions; number theory beyond the basics. The six missing NeetCode problems fit existing chapters.

## What this audit could not check

- Paid books were compared by table of contents and public material, not by text.
- Timing figures are for Node 24.14.1 on one laptop; other engines (SpiderMonkey, JavaScriptCore) were not measured.
- Only about one quarter of the exercises were read in full (three or more per chapter); the other three quarters were checked only
  mechanically.
- The reviewers covered quiz questions thoroughly in most chapters, but a few conceptual questions in the sliding-window pool were read, not executed.

## Where the detail is

The per-chapter findings (exact quotes, correct values and the evidence for each) were produced by the reviewers and are
kept with this session's notes; they can be turned into a checklist per chapter when the fixes start.
