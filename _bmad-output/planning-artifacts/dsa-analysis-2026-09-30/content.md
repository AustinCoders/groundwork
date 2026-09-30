# DSA section: content audit for the rebuild

Read-only audit of `/Users/akshat/Desktop/groundwork` on branch `feature/dsa-plan`, done on 30 Sep 2026. Paths are relative to the repo root unless they are absolute.

---

## 1. Summary

- **Shape.** 34 chapters: 10 beginner (B1–B10), 12 intermediate (I1–I12) and 12 advanced (A1–A12). They are defined in `content/topics.ts:2474-2714` and assembled in `content/dsa-notes.ts:48-83`. Every chapter has `ready: true`, so there are no outlines left. Each chapter belongs to exactly one level (`levels: [x]`). There is no prerequisite field in the `Chapter` type (`content/types.ts:61-71`). Order is simply the syllabus order, the same as `num`. Reading time is not stored anywhere; it is computed as words / 180 by `minutesFor` (`lib/content.ts:119-125`), and that count includes code, SVG text and inline `<script>` tokens.
- **Volume.** About 43,400 words of prose (excluding code and SVG), 175 `<pre>` code blocks, 66 SVG diagrams, 277 DSA exercises (2,264 tests, all `kind: function`, and every one has hints), and 170 "Before you move on" self-check bullets (5 per chapter).
- **Depth is inverted.** Advanced chapters average **~2,075 prose words**. Intermediate chapters average **~781**, and beginner **~914**, though B1 skews that figure; the median beginner chapter is ~750. The thinnest chapters are I12 Matrix (479), I5 Graph problems (540), B3 Hashing (550), B6 Binary search (553), B5 Sliding window (597) and I10 Intervals (604). A "deep from beginner" goal therefore needs most of its new writing in beginner and intermediate.
- **Interactivity.** There are only **8 step-through demos**, in B4, B5, B6, I3, I4, I8, A2 and A8. There is also 1 runnable `.try` block (B1). No chapter has a quiz. Seven of the demos are **byte-identical copy-pasted inline IIFEs** (md5 `6a0e05c9…`) that carry precomputed `STEPS` JSON. The reader cannot change the input, and the code-line highlight **never fires** because no DSA step sets `line`.
- **Correctness bugs found:** 1 real code bug (NUL separators in string algorithms), 3 diagram or explanation errors, 1 conceptual misconception (O vs Ω), 3 syllabus promises the chapters don't deliver, and 1 stale number ("245 exercises").
- **Quiz material.** Seed material for quizzes is plentiful: 170 self-check prompts, a "Recognizing it in an unseen problem" list in every chapter, dry-run tables, and 5 quiz-shaped coded exercises. The spaced-review page and the mock engine's adaptive-level logic are both reusable hosts.

---

## 2. Chapter table

Column key: **Words** = prose words, excluding `<pre>`, `<svg>` and `<script>`. **Min** = the reading time the site reports. **Code** = `<pre>` blocks. **SVG** = diagrams. **Tbl** = tables (dry runs and cheat sheets). **Warn/Say/Stk** = `.warn`, `.say` and `.sticky` callouts. **Self** = "Before you move on" bullets. **Ex (b/i/a)** = exercises whose `chapter` field is this chapter, split by exercise level. Every chapter's `practice[]` list matches its `chapter` field exactly, and no ids are missing.

| # | id | Level | Ready | Words | Min | Code | SVG | Tbl | Interactive element | Warn/Say/Stk | Self | Ex (b/i/a) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| B1 | dsa-complexity-analysis | beg | ✓ | 1980 | 14 | 6 | 4 | 6 | 1 `.try` runnable snippet (l.510) | 3/1/2 | 5 | 3 (3/0/0) |
| B2 | dsa-arrays-strings | beg | ✓ | 1094 | 9 | 7 | 4 | 2 | none | 2/1/0 | 5 | 24 (13/11/0) |
| B3 | dsa-hashing | beg | ✓ | 550 | 4 | 3 | 1 | 2 | none | 1/1/0 | 5 | 13 (9/4/0) |
| B4 | dsa-two-pointers | beg | ✓ | 615 | 5 | 3 | 1 | 1 | Step demo: array cells + "sum" panel, 7 steps | 1/1/0 | 5 | 12 (5/6/1) |
| B5 | dsa-sliding-window | beg | ✓ | 597 | 8* | 3 | 1 | 1 | Step demo: string cells + window/best panels, 13 steps | 1/1/0 | 5 | 10 (**0**/9/1) |
| B6 | dsa-binary-search | beg | ✓ | 553 | 5 | 3 | 1 | 1 | Step demo: cells + live-range panel, 9 steps | 1/1/0 | 5 | 15 (4/9/2) |
| B7 | dsa-sorting-algorithms | beg | ✓ | 1211 | 9 | 8 | 4 | 3 | none | 1/1/1 | 5 | 7 (1/4/2) |
| B8 | dsa-stacks-queues | beg | ✓ | 885 | 8 | 7 | 2 | 3 | none | 1/1/0 | 5 | 9 (3/5/1) |
| B9 | dsa-linked-lists | beg | ✓ | 1021 | 9 | 9 | 2 | 3 | none | 1/1/0 | 5 | 20 (8/10/2) |
| B10 | dsa-basic-recursion | beg | ✓ | 634 | 5 | 5 | 2 | 1 | none | 1/1/0 | 5 | 4 (3/1/0) |
| I1 | dsa-trees | int | ✓ | 924 | 7 | 4 | 3 | 3 | none | 1/2/0 | 5 | 6 (5/1/0) |
| I2 | dsa-tree-problems | int | ✓ | 981 | 8 | 6 | 3 | 1 | none | 3/1/0 | 5 | 14 (0/12/2) |
| I3 | dsa-heaps-priority-queues | int | ✓ | 1020 | 10* | 4 | 2 | 1 | Step demo: heap array cells + "tree" drawn as text lines, 8 steps | 2/1/0 | 5 | 13 (1/8/4) |
| I4 | dsa-graphs-representation-traversal | int | ✓ | 656 | 9* | 3 | 4+1 | 3 | **Live** BFS/DFS on an SVG graph (`viz-vertex`/`viz-edge`), mode `<select>`, no Play | 1/1/0 | 5 | 5 (0/5/0) |
| I5 | dsa-graph-problems | int | ✓ | 540 | 5 | 3 | 2 | 1 | none | 1/1/0 | 5 | 5 (0/4/1) |
| I6 | dsa-backtracking | int | ✓ | 841 | 8 | 7 | 1 | 2 | none | 2/1/0 | 5 | 7 (0/7/0) |
| I7 | dsa-dp-1d | int | ✓ | 917 | 7 | 5 | 2 | 2 | none | 1/1/0 | 5 | 10 (1/9/0) |
| I8 | dsa-dp-2d | int | ✓ | 930 | 8 | 5 | 3 | 1 | Step demo: LCS grid (`viz__grid`), 31 steps | 2/1/0 | 5 | 10 (0/8/2) |
| I9 | dsa-greedy | int | ✓ | 848 | 6 | 3 | 1 | 2 | none | 1/1/0 | 5 | 5 (0/4/1) |
| I10 | dsa-intervals | int | ✓ | 604 | 5 | 3 | 1 | 1 | none | 1/1/0 | 5 | 5 (1/4/0) |
| I11 | dsa-bit-manipulation | int | ✓ | 631 | 5 | 4 | 2 | 2 | none | 1/1/0 | 5 | 18 (5/12/1) |
| I12 | dsa-matrix-problems | int | ✓ | 479 | 4 | 3 | 2 | 1 | none | 1/1/0 | 5 | 8 (0/8/0) |
| A1 | dsa-advanced-dp | adv | ✓ | 2139 | 19 | 7 | 2 | 3 | none | 5/2/1 | 5 | 6 (0/0/6) |
| A2 | dsa-union-find | adv | ✓ | 1699 | 16 | 8 | 1 | 2 | Step demo: parent-array cells + "connected sets" text, 7 steps | 3/1/0 | 5 | 5 (0/4/1) |
| A3 | dsa-advanced-graph-algorithms | adv | ✓ | 2047 | 18 | 8 | 1 | 2 | none | 5/2/1 | 5 | 5 (0/3/2) |
| A4 | dsa-minimum-spanning-tree | adv | ✓ | 1988 | 15 | 6 | 2 | 3 | none | 2/2/1 | 5 | 2 (0/1/1) |
| A5 | dsa-tries | adv | ✓ | 1723 | 14 | 6 | 1 | 2 | none | 2/1/1 | 5 | 4 (0/1/3) |
| A6 | dsa-segment-fenwick-trees | adv | ✓ | 1969 | 16 | 4 | 2 | 4 | none | 3/1/1 | 5 | 5 (0/0/5) |
| A7 | dsa-string-algorithms | adv | ✓ | 1752 | 16 | 6 | 2 | 3 | none | 3/2/1 | 5 | 5 (2/2/1) |
| A8 | dsa-monotonic-stack-queue | adv | ✓ | 1692 | 14 | 6 | 1 | 3 | Step demo: cells + stack/answers panels, 18 steps | 3/2/1 | 5 | 5 (1/1/3) |
| A9 | dsa-design-problems | adv | ✓ | 1985 | 16 | 7 | 1 | 3 | none | 3/2/1 | 5 | 5 (0/0/5) |
| A10 | dsa-advanced-backtracking | adv | ✓ | 2471 | 20 | 5 | 2 | 4 | none | 3/2/1 | 5 | 4 (0/1/3) |
| A11 | dsa-topological-patterns | adv | ✓ | 1980 | 17 | 5 | 2 | 3 | none | 3/1/1 | 5 | 6 (0/5/1) |
| A12 | dsa-interview-strategy | adv | ✓ | 3459 | 21 | **0** | 2 | 8 | none | 3/4/1 | 5 | 2 (0/2/0) |

\* The reported minutes are inflated by inline-script tokens: B5 carries 588 script "words", I4 539 and I3 459.

**Per-level totals**

| Level | Chapters | Prose words (avg) | Exercises | Exercise level mix b/i/a | Demos |
|---|---|---|---|---|---|
| Beginner | 10 | 9,140 (914) | 117 | 49 / **59** / 9 | 3 |
| Intermediate | 12 | 9,371 (781) | 106 | 13 / 82 / 11 | 3 |
| Advanced | 12 | 24,904 (2,075) | 54 | 3 / 20 / 31 | 2 |

The exercise difficulty does not follow the chapter level. Beginner chapters hold more intermediate exercises than beginner ones, and B5, I2, I4, I5, I6, I8 and I12 have **no beginner exercises at all**. That matters for a placement-driven flow, because a reader placed at beginner will mostly be handed intermediate problems.

**Classes the brief asked about.** `viz__cell`, `viz__gcell`, `viz-vertex`, `loop-code`, `loop-frame` and `demo__term` appear only inside the 8 demos. There are no `viz-node`, `c3d` or `tone-*` tables anywhere in DSA. `dg` diagrams appear 65 times, `.try` once, `.warn` 65 times, `.say` 43 times and `.sticky mint` 14 times.

---

## 3. Coverage gaps, by level

Covered well: complexity (including the master theorem and amortized analysis), arrays with prefix sums and Kadane, hashing basics, two pointers, sliding window, binary search (including search on the answer), sorting (including counting, bucket and quickselect), stacks and queues (min-stack, RPN, deque, ring buffer), linked lists (including Floyd phase 2), backtracking, 1D and 2D DP (knapsack, LCS, edit distance, palindrome DP), greedy, intervals, bits, bitmask/tree/digit/interval DP, union-find (including rollback), Dijkstra, Bellman-Ford, Floyd-Warshall, 0-1 BFS, multi-source BFS, MST, tries (including the XOR trie), segment trees with lazy propagation, Fenwick trees, KMP, Z, Rabin-Karp, Manacher, the monotonic stack and deque, LRU and LFU, the rate limiter, topological sort (Kahn and DFS), alien dictionary, and longest path in a DAG.

### Beginner: missing or thin
- **Prefix sum + hash map** ("count subarrays summing to k", which must handle negative numbers). Neither B2 nor B3 teaches it. Yet 4 B2 exercises need it (Subarray Sum Equals K, Continuous Subarray Sum, Max Size Subarray Sum Equals K, Contiguous Array), and the interview book's DSA round asks it (`content/interview-data.ts` R7).
- **Difference arrays** appear only in A6. **2D prefix sums** get one sentence (`dsa-arrays-strings.ts:248`).
- **In-place array tricks that exercises assume**: the Dutch national flag (Sort Colors), next permutation, cyclic sort / index-as-hash (Missing Number, Disappeared Numbers) and Boyer-Moore voting (Majority Element). All are exercises; none is taught.
- **Math basics**: gcd/lcm, modulo arithmetic and 1e9+7, BigInt and safe integers, fast exponentiation (the B10 exercise `ex-fast-power` is untaught), the sieve, and nCr. These appear only as table rows in A12.
- **Recursion**: helper/accumulator patterns, the explicit-stack conversion (promised but not shown, see §4), "trust the recursive call", and a way to *see* the call stack.
- **Hashing**: using composite keys in JS (`${r},${c}`; Map keys compare arrays by reference), the longest-consecutive-sequence set trick, and bucket-sort top-k. The last two are exercises only.
- **No "how to approach a problem" at beginner level.** Brute force first and the constraint → complexity table live in A12, even though the interview book says "start here" (`content/interview-data.ts:2480`).

### Intermediate: missing or thin
- **BST operations**: I1 has only `bstSearch`. Insert, delete, in-order successor, the BST iterator and validate-by-bounds are missing (validate is covered in I2). Nothing explains that JS has no TreeMap or ordered set; this gets only a passing mention in I10 and A12.
- **BFS shortest path on grids and implicit graphs**: direction arrays, distance layers and word-ladder style state graphs. The I5 exercises (Pacific Atlantic, Word Ladder, Shortest Path in Binary Matrix) need this, but it is only taught in A3 (multi-source).
- **Topological sort** should be intermediate, because Course Schedule is a standard medium. Today it is A11. I5 teaches directed cycle detection but not the ordering.
- **Tries** (A5) and **monotonic stack basics** (A8: Daily Temperatures and Next Greater Element are mediums) are placed too late.
- **DP**: there is no "state machine" or stock family (the syllabus promises it, see §4). Also missing are code for LIS in O(n log n) (described at `dsa-dp-1d.ts:192-198`, not written), subset sum / partition, word break, decode ways, maximum product subarray (exercises only), and any explicit teaching of the two state styles, "best over prefix i" versus "ending exactly at i".
- **Backtracking**: skipping duplicates (`i > start && a[i] === a[i-1]`) is never taught, although Combination Sum II needs it.
- **Greedy**: no exchange-argument proof. Jump Game II and Partition Labels exist only as exercises.
- **Matrix (I12, 479 words)**: in-place state encoding (Set Matrix Zeroes, Game of Life), staircase search in a sorted matrix, and 2D prefix sums. All are exercises, none is taught.

### Advanced: missing
- **Graphs**: strongly connected components (Tarjan/Kosaraju), bridges and articulation points (Critical Connections), Euler path (Reconstruct Itinerary), A*, bipartite matching and max flow (optional depth), and LCA via **binary lifting**.
- **Range structures**: the sparse table is mentioned in A6 but not taught. Sqrt decomposition / Mo's algorithm (optional).
- **DP**: state machines (promised, absent), rerooting DP, and DP optimisations (monotonic-queue DP; the convex hull trick is optional).
- **Math**: modular inverse, combinatorics mod p, matrix exponentiation (a table row in A12 only).
- **Strings**: suffix array and Aho-Corasick (the latter mentioned in A12 only).
- **Other**: meet-in-the-middle (mentioned), randomized algorithms and reservoir sampling (mentioned in A12), iterator-design problems.
- **A12** promises "mock interview technique, company-round expectations" (`content/topics.ts:2707-2708`). The word "mock" appears 0 times in the chapter.

### Out of order
1. **B7 Sorting comes before B10 Recursion**, but merge sort, quicksort and "Seeing the full recursion tree" all depend on recursion.
2. **A3's syllabus line says "Dijkstra, Bellman-Ford, topological sort"** (`topics.ts:2661`). Topo sort is actually in A11, eight chapters later, and A3's "Topological sort + relax" table row (`dsa-advanced-graph-algorithms.ts:423`) relies on it.
3. **Tries (A5)** and **monotonic stack (A8)** come later than typical interview difficulty would place them. **LRU (A9)** is usually an intermediate question, and B9 already mentions it.
4. **Interview strategy (A12)** is last, yet the interview book tells readers to start with it.
5. The queue teaching contradicts itself. B8 warns against `array.shift()` (`dsa-stacks-queues.ts:59-61`), but I1 (`dsa-trees.ts:192`), I4 (`dsa-graphs-representation-traversal.ts:171`, including the demo at :247) and I5 (`dsa-graph-problems.ts:159`) all use `queue.shift()` while stating O(V+E). The fix (a head index) only appears in A3, A9 and A11.

---

## 4. Quality findings

### Bugs and errors (fix before any rebuild)
1. **NUL bytes in the string-algorithms code.** `content/dsa/dsa-string-algorithms.ts:330`, `:341` and `:457` each contain a literal U+0000 as the separator (`pattern + "\0" + text`). HTML parsers drop U+0000 in body text, so readers see `pattern + "" + text`, and line 341 renders as `<code>""</code> is a safe default`. With the empty separator the chapter's own code is wrong. I checked this by running it: `zSearch("abab","ab")` returns `[1]` instead of `[0,2]`, and `shortestPalindrome("aa")` returns `"aaa"`. The byte also makes `file` and `grep` classify the file as binary. Replace it with `"#"` or a visible escaped `"\\u0000"`.
2. **The demo code panel never highlights.** In all 7 precomputed DSA demos, `render()` toggles `.hot` on `s.line`, for example `dsa-two-pointers.ts:226`. No DSA step defines `line` (0 matches), while the JS demos do (`content/js/basic-async.ts:242-244`). The result is that the "code" column is a static listing, and the link between code and state, which is the main teaching value, is missing.
3. **B10's fib(4) diagram** (`dsa-basic-recursion.ts:116-141`) says "fib(1) three times" but draws only two fib(1) nodes, because the left fib(2) is never expanded. **"Converting recursion to iteration"** (`:153-164`) promises "an explicit stack that mimics the call stack" and then shows a plain `for` loop with no stack. The call-stack drawing (`:45-61`) puts the oldest frame on top under the label "↑ builds up", which is upside down for a stack.
4. **I7's fib(5) diagram** (`dsa-dp-1d.ts:43-69`). The caption says "every red node is a repeat" and "fib(3) twice", but the repeated fib(3) (rect x=420, `:45`) is not red, while the *first* fib(2) computed in DFS order (`:50`/`:62`) is red.
5. **B1 conflates bounds with cases.** `dsa-complexity-analysis.ts:66-67` defines O as "at worst" and Ω as "at best". `:70-74` then argues that linear search is "not Θ(n)" because its best and worst cases differ. This is the classic misconception, and it contradicts the correct best/average/worst section at `:82`.
6. **Syllabus promises the chapters don't deliver.** A1 promises "State machines" (`topics.ts:2651`), but `dsa-advanced-dp.ts` has 0 hits for state machine, stock or cooldown. A3 promises topological sort (`topics.ts:2661`). A12 promises "Mock interview technique, company-round expectations" (`topics.ts:2708`).
7. **Stale count.** `content/interview-data.ts:2478` and `:4200` say "34 chapters and 245 exercises", but there are 277 (correctly stated in `content/architecture/arch-coming-soon.ts:25`).
8. **Reading time is inflated** by inline scripts and code (`lib/content.ts:119-125`). For example, B5 reports 8 minutes against about 3 minutes of prose.

### Spot-check: four chapters read in full
Checked against the arc intuition → diagram → code → complexity → pitfalls → practice.

**B10 Basic recursion (beginner, 634 words).**
- Has: intuition (base plus recursive case, `:12-19`), a factorial dry-run table (`:24-34`), a call-stack SVG, a stack-overflow `.warn` (`:64-72`), array and tree recursion code, and the O(2ⁿ) fib tree.
- Missing: a complexity method for recursion ("calls × work per call" is left to B1's recurrences), practice for the fast-power exercise that the chapter lists, and any interactive element.
- Where a true beginner gets stuck:
  - `treeHeight(node)` (`:86-92`) uses `node.left` before any node shape has been introduced.
  - The two diagram errors above.
  - The chapter promises a stack-based conversion and then shows a loop.
- Verdict: clear prose, but too short for the most important beginner concept. A step-through call-stack visualiser would pay off most here.

**I7 DP 1D (intermediate, 917 words).**
- Has the full arc: the fib tree, memo and tabulation code, a complexity comparison table (`:140-146`), the four-question recipe (`:148-154`), House Robber, LIS in O(n²), Coin Change with a dry-run table (`:223-233`) and a greedy counterexample (`:240-247`).
- Stuck points:
  - House Robber's variables `prevSkip`/`prevTake` (`:163`) actually hold dp[i-2] and dp[i-1], not skip and take states.
  - The chapter moves between "best over prefix" (`:172`, `:257`) and "ending at i" (LIS, `:179`) state definitions without naming the switch.
  - Self-check item `:278` asks about 0/1 versus unbounded DP, which is not taught until I8.
  - 5 of the 10 exercises (Word Break, Decode Ways, Max Product Subarray, Partition Equal Subset Sum, House Robber II) have no prose support.
- There is no DP-table visualiser here, although I8 has one.

**I5 Graph problems (intermediate, 540 words).**
- Three clean sections: components with an SVG and code (`:18-66`), cycle detection with the undirected/directed distinction, a strong `.warn` (`:69-77`) and a dry-run table (`:116-122`), and bipartite checking with BFS colouring (`:132-171`).
- Missing: complexity statements, which never appear in this chapter, grid BFS code, and shortest-path BFS.
- Practice mismatch: only Is Bipartite matches the prose. Word Ladder, Pacific Atlantic and Shortest Path in Binary Matrix need techniques that are not taught.
- `hasCycleUndirected` (`:79-89`) is not wrapped in a loop over components, unlike the directed version.
- `queue.shift()` at `:159` contradicts B8's warning.
- Verdict: correct but thin, and the gap between chapter and exercises is where learners stall.

**A3 Advanced graph algorithms (advanced, 2,047 words).**
- The model chapter. It moves from the "why BFS breaks" intuition with a diagram (`:18-54`) to a hand-written MinHeap (`:64-99`), a "don't fake a PQ" pitfall (`:100-108`), Dijkstra with lazy deletion and a dry-run table (`:141-149`), a stale-entry `.warn`, path reconstruction, and the k-stops Bellman-Ford snapshot trap (`:217-226`). It then covers Bellman-Ford with negative cycles, Floyd-Warshall with the "k first" warning (`:303-311`), 0-1 BFS with a two-stack deque, multi-source BFS, a decision table (`:416-424`), a `.sticky` one-liner, recognition cues and pitfalls (`:449`).
- Gaps: no visualiser (Dijkstra is the best candidate site-wide), the syllabus mismatch on topo sort, and no SCC, bridges, A* or LCA.
- Verdict: this is the template the beginner and intermediate chapters should be raised to.

**Pattern across all 34 chapters.** Every chapter ends with "Recognizing it…" and a 5-item "Before you move on" box. Most include a `.say` interview line and a `.warn`. Beginner and intermediate chapters usually skip an explicit complexity section, and most (26 of 34) have no interactive element.

---

## 5. Existing quiz-like assets

| Asset | Where | Reuse for |
|---|---|---|
| 170 self-check prompts, 5 per chapter, in `.bx.is-ref` ("Before you move on"), phrased as "Explain… / Trace… / Write… / Recognize…" | end of every `content/dsa/*.ts`, e.g. `dsa-two-pointers.ts:278-287` | Direct seed for chapter quizzes; the "Trace" and "Recognize" items convert to MCQ or predict-the-output questions |
| "Recognizing it in an unseen problem" cue lists | every chapter, e.g. `dsa-advanced-graph-algorithms.ts:441-450` | "Which pattern?" items for the placement quiz |
| Dry-run tables (~60) | most chapters | "Fill the next row" / "what is `lo` after step 3" items |
| `.say` model answers (43) | most chapters | Answer explanations |
| Quiz-shaped coded exercises: `ex-classify-growth-rate`, `ex-rewrite-nested-loop-linear`, `ex-count-basic-operations` (B1); `ex-pick-approach-from-constraint`, `ex-feasible-approaches-under-constraints` (A12) | `content/practice/dsa-1.ts:460-660` | Complexity placement items |
| Interview book DSA round R7: ~10 questions (complexity, subarray-sum-k, lower-bound binary search, islands and recursion depth, LRU, sliding window) | `content/interview-data.ts:2470-2763` | Placement seeds; the ladder answers give level signals |
| Spaced review: self-rated "I still had it", gaps of 3/7/21/60/180 days, **no questions** | `app/review/ReviewView.tsx:108-131`, `lib/storage.ts:62-72` | The obvious place to re-ask chapter quiz items |
| Interview confidence (knew / shaky / blank) | `lib/interviewConfidence.ts` | Pattern for per-item self-rating storage |
| JS/React question banks (152 `.qa` items), parsed from HTML by level | `lib/mockQuestions.ts:28-51` | Pattern for authoring a quiz bank inside chapter HTML; no DSA bank exists |
| Mock adaptive levelling (`RAISE_AT 0.8`, `LOWER_BELOW 0.45`, rank beginner/intermediate/advanced) | `lib/mock/adaptive.ts:4-24` | Placement scoring thresholds |
| Level self-select ("step 1 of 2… Be honest") | `app/level/LevelView.tsx:52-85` | The page a placement quiz replaces |
| "mark as read" checkbox | `components/reader/ChapterDone.tsx` | Where the quiz gate goes |
| `rememberLevel` stores a single **global** key `jsnotes:level` | `lib/storage.ts:6,192-197` | Must become per-topic before placement can set a DSA level |
| Tests: practice wiring and ready/body integrity | `tests/content.test.ts:31-90` | Extend for quiz banks (each ready chapter has N valid questions) |

---

## 6. Existing visualiser engine

**How a chapter declares a demo.** Everything is inline in the chapter's `body` template string:

1. The markup is a `<div class="demo">` containing `demo__bar`, `loop-grid`, `loop-code#{ID}-code`, `loop-bar`, the controls `#{ID}-prev/next/play/reset`, and `loop-box` panels `#{ID}-p-{name}`. It also has either `.viz__cells#{ID}-cells` or `.viz__grid#{ID}-grid`, plus `p.demo__note#{ID}-note`.
2. It is followed by a `<script>` IIFE with `var ID`, `var CODE = [lines]` and `var STEPS = [...]`. A step has the shape `{cells:[{v,c,p}], grid:[[{v,c}]], panels:{name:[str]}, note, line?}`. Cell classes are `viz__cell--{lo,hi,mid,hot,in,out,done}`, and `p` is the label shown under the cell (for example "lo"). Grid classes are `viz__gcell--{head,hot,dep,done}`.
3. Scripts run through `activateScripts()` (`components/reader/enhancements.ts:76-85`), which is called from `components/reader/ReaderShell.tsx:166` and `components/series/ChapterView.tsx:124` whenever the chapter changes. A `dataset.demoInit` guard prevents rebinding.
4. CSS lives in `app/globals.css`: `.demo` at 3135-3200, `.loop-*` at 3310-3396, `.viz__*` at 8028-8139, `.viz-edge`/`.viz-vertex` at 9005-9030, and `.viz-tree`/`.viz-node` at 8838-8900 (the last are used only by React chapters). All are theme tokens.

**Which algorithms have one:**
- two-pointer pair sum (B4)
- longest substring without repeats (B5)
- binary search (B6)
- heap sift-down (I3)
- BFS/DFS (I4)
- LCS table (I8)
- union-find with path compression (A2)
- next greater element (A8)

**Two engine styles:**
- **Precomputed (7 demos).** An identical copy of the JS-chapter event-loop engine, extended with cells and grid. The STEPS were generated offline; there is no generator in `scripts/`. Readers cannot change the input, trees are drawn as text lines (I3), and forests as set strings (A2).
- **Live (I4 only).** `dsa-graphs-representation-traversal.ts:234-300` computes the steps from real `bfs()`/`dfs()` functions over a fixed graph and renders an SVG. It has a mode `<select>` but no Play button, no `demoInit` guard and no code panel.

**Weaknesses:**
- The engine is copy-pasted per chapter and lives in untyped, untested strings.
- The code-line highlight is dead in every DSA demo.
- Only the graph demo has `aria-live`.
- The Play timer is not cleared when the reader navigates away.
- There are no renderers for trees, stack frames, pointers, linked lists or weighted graphs.
- The step data can drift from the prose code; B6's demo uses `Math.floor((lo+hi)/2)` while the prose teaches `lo + ((hi-lo)>>1)`.

**Reusability for a "play" feature.** The visual vocabulary and CSS carry over directly, but the code needs rebuilding. A good route is a hydrator like `enhanceTryBlocks`: the chapter HTML declares a placeholder such as `<div class="play" data-algo="binary-search" data-input="[1,4,9,13]" data-target="13"></div>`, and a typed TS registry maps each algorithm id to a generator that yields frames `{line, cells|grid|graph|tree|frames, panels, note}`. One shared React player then renders the frames and lets the reader edit the input. After that, migrate the 8 existing demos onto it, following the live-computation model of I4.

---

## 7. Recommended content backlog (ranked)

### P0: correctness and consistency (small, do first)
1. Fix the NUL separators in `dsa-string-algorithms.ts:330, 341, 457`.
2. Add `line` to every DSA demo step, or fold this into the engine migration.
3. Fix the B10 fib(4) diagram and the recursion-to-iteration example; fix the I7 fib(5) colouring; fix the B1 O/Ω misconception.
4. Make queues consistent: use a head-index queue in I1, I4 (prose and demo) and I5, or add a one-line note that points back to B8.
5. Either write the promised sections (A1 state machines, A12 mock/company rounds) or reword the syllabus. Move "topological sort" out of A3's syllabus.
6. Update "245 exercises" (`interview-data.ts:2478, 4200`). Exclude `<script>` and `<pre>` from `minutesFor`.

### P1: new chapters (fill the beginner-to-advanced gaps)
| Rank | Proposed chapter | Level | Why |
|---|---|---|---|
| 1 | Prefix sums, prefix+hash map, difference arrays, 2D prefix | Beginner | 4 existing exercises and the interview book depend on it; currently untaught |
| 2 | BFS on grids and implicit graphs (distance layers, direction arrays, word ladder, multi-source) | Intermediate | The most common medium graph shape; I5's exercises need it |
| 3 | BST operations and ordered data in JS (insert, delete, successor, iterator, kth; no TreeMap: sorted array + binary search, heaps, or a hand-rolled structure) | Intermediate | I1 only has search |
| 4 | DP state machines and the knapsack family (stock series, 0/1 vs unbounded vs bounded, subset sum, LIS in n log n) | Intermediate→Advanced | Promised in the syllabus; ties exercises to prose |
| 5 | Math for interviews (gcd/lcm, mod 1e9+7, BigInt and safe integers, fast power, sieve, nCr mod p, modular inverse) | Beginner→Intermediate | Fast power is an exercise; mentioned only in A12 |
| 6 | Advanced graphs II: SCC, bridges and articulation points, Euler path, LCA via binary lifting | Advanced | The largest advanced hole |
| 7 | Sparse table and range tricks (RMQ, binary lifting reuse, sqrt decomposition) | Advanced | Mentioned in A6 but not taught |
| 8 | JS toolkit for DSA (Map/Set costs, comparator, no heap/deque/TreeMap, recursion depth, typed arrays, string building) | Beginner | Consolidates JS pitfalls now scattered across B2, B3, B8 and A3 |
| 9 (optional) | Flows and matching; suffix array and Aho-Corasick; meet-in-the-middle; randomized algorithms | Advanced | For "deep advanced" completeness |

### P2: deepen and reorder existing chapters
- Raise the thin chapters to about 1,200–1,500 words with the full arc (intuition → diagram → code → dry run → complexity → pitfalls → recognition), in this order: **I12 Matrix, I5 Graph problems, B3 Hashing, B6 Binary search, B5 Sliding window, I10 Intervals, B4 Two pointers, I11 Bits, B10 Recursion**.
- Teach the techniques the exercises already assume:
  - Dutch flag and next permutation in B4
  - cyclic sort and Boyer-Moore in B2
  - longest consecutive sequence and bucket top-k in B3
  - duplicate-skipping in I6
  - Jump Game II and Partition Labels in I9
  - Set Matrix Zeroes, Game of Life and staircase search in I12
  - Word Break, Decode Ways and Max Product in I7
- Reorder:
  - B10 Recursion before B7 Sorting.
  - Move topological sort basics to intermediate, after I5.
  - Move tries and monotonic stack basics to intermediate.
  - Surface A12's constraint → complexity table in B1.
- Add beginner exercises to B5, I2, I4, I5, I6 and I12 so that a placed beginner isn't mostly handed mediums.

### P3: "play" visualisers worth adding (after the engine is generalised)
1. **Sorting**: bubble, insertion, selection, merge and quick with partition (B7). The classic, and the best fit for beginners.
2. **Recursion call stack and recursion tree** with a memo toggle (B10, I7). The biggest beginner stumbling block, and it would replace the two broken diagrams.
3. **Linked-list reversal (prev/curr/next) and Floyd cycle** (B9).
4. **Tree traversals and BST insert/search** (I1). Needs a real tree renderer.
5. **Dijkstra**: heap, dist table and weighted graph (A3), reusing I4's SVG renderer.
6. **Backtracking decision tree**: subsets, permutations and an N-Queens board (I6, A10).
7. **1D DP table fill**: coin change and house robber (I7), reusing the grid renderer.
8. **Kahn's topological sort** with in-degree counters (A11).
9. **KMP failure-table build** (A7).
10. **Segment tree query/update and Fenwick lowbit walk** (A6).
11. **Trie insert/search** (A5).
12. Upgrade the existing **heap** (to a real tree) and **union-find** (to a real forest). Also consider hash buckets (B3) and Kruskal/Prim (A4).

### P4: quiz content to author
- **Chapter quizzes.** 5–8 items per chapter (about 200–270 total), drawn from the self-check bullets, recognition cues and dry-run tables. Questions should be auto-gradable (MCQ, predict the output or the next dry-run row, pick the complexity) rather than "explain" prompts.
- **Placement bank.** About 18–24 items: roughly 6 per level, tagged by chapter. Scoring can reuse `lib/mock/adaptive.ts`'s 0.8 / 0.45 thresholds to set the level, and each wrong answer marks its chapter "to read".
- **Storage.** Store quiz results per chapter next to the existing chapter marks, and let `/review` re-ask 2–3 items instead of relying on self-rating.
