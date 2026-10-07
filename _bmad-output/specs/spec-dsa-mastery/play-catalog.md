# Play: the engine and one player per chapter

This is the source for CAP-3 and CAP-8 (puzzles). Code languages (CAP-11) are in `code-languages.md`. Evidence is in `_bmad-output/planning-artifacts/dsa-analysis-2026-09-30/code-and-ux.md` §3 and §8.4, and in `research.md` §3.

## Engine

- **Tracer.** One pure TypeScript function per algorithm takes an input and returns the whole run as a list of frames. The run is recorded once, so back and forward are instant, as in Python Tutor.
  - A frame holds:
    - the code line just run and the next one;
    - a narration sentence;
    - the variables;
    - the structure state: array, grid, graph, tree, forest, linked list, call stack, hash buckets or chips;
    - highlights.
  - Each tracer declares:
    - its code lines;
    - a default input;
    - presets;
    - a parser for edited input, which returns a message when the input is rejected;
    - an input size limit.
- **Registry.** Maps algorithm id → chapter → a lazy import. A chapter page loads only its own tracers.
- **Player.** One shared component with these controls:
  - Back, Next, Play/Pause, Reset;
  - speed;
  - a labelled scrubber reading "Step n of N";
  - preset and a visible "Try your own input" control, which parses the reader's input within the tracer's size limit and says why when it rejects it;
  - predict the next step: it asks before revealing, using the check's choice UI;
  - a table view listing every frame.
- **Views:** array cells, grid, graph (SVG), tree, forest, linked list, call stack, hash buckets, chips, variables and code. Code is an ordered list with the current line marked, not a `pre`. It shows in the reader's chosen language (see `code-languages.md`): the tracer's frames name stable line ids and each language maps them to its own lines.
- **Accessibility and motion:**
  - Keys work only when focus is inside the player: ←/→ step, Space plays and pauses, Home and End jump to either end.
  - A `role="status"` line gives one narration sentence per step.
  - Every cell carries a text label for its state.
  - The player never autoplays. It pauses on unmount and when the tab is hidden.
  - Under reduced motion, steps change instantly.
- **Page integration:**
  - A chapter's HTML holds a placeholder such as `<div data-play="binary-search" data-input='…'></div>`.
  - The server splits the body into HTML segments and player islands, and renders the first frame on the server.
  - The shared enhancers skip `[data-island]`.
  - Narration and smooth scrolling skip the player.
- **Tests (vitest, per tracer):**
  - the final frame equals the reference answer for every preset;
  - every frame has narration;
  - every `line` falls within the code;
  - the parser rejects input over the limit.
- **Replacing the old demos.** The eight old inline demos (B6 two pointers, B7 sliding window, B8 binary search, I4 heap, I5 BFS/DFS, I11 LCS, A2 union-find, I18 next greater element) are ported onto the player, and their inline scripts are removed.

## Players

At least one player per chapter. The first entry is the chapter's main player.

| Chapter | Player (what the reader watches) | Views |
|---|---|---|
| B1 complexity | Growth race: operation counts for O(1), O(log n), O(n), O(n log n) and O(n²) as n grows | bars, variables |
| B2 JS toolkit | `shift()` versus a head-index queue: elements moved per dequeue | array, variables |
| B3 arrays and strings | Kadane's running sum; Boyer-Moore voting | array, variables |
| B4 prefix sums | Build the prefix array, answer range sums, count subarrays summing to k with a hash map | array, buckets |
| B5 hashing | Insert and look up in a hash table with collisions | buckets |
| B6 two pointers | Pair sum on a sorted array (ported); Dutch national flag | array |
| B7 sliding window | Longest substring without repeats (ported) | array, chips |
| B8 binary search | Exact search (ported); lower bound | array, variables |
| B9 recursion | Call stack and recursion tree for factorial and fib, with a memo toggle | call stack, tree |
| B10 sorting | Insertion, merge (split and merge), quick sort partition | array, tree |
| B11 stacks and queues | Valid parentheses on a stack; a head-index queue | chips, array |
| B12 linked lists | Reversal with prev/curr/next; Floyd cycle detection | linked list |
| I1 trees | Pre-, in-, post- and level-order traversal | tree, chips |
| I2 BST operations | Insert, delete (three cases), successor | tree |
| I3 tree problems | Bottom-up return values: height and diameter | tree, call stack |
| I4 heaps | Sift up and sift down on a real tree beside the array (ported and upgraded) | tree, array |
| I5 graph traversal | BFS and DFS with queue/stack and visit order (ported) | graph, chips |
| I6 grid BFS | Distance layers on a grid, multi-source spreading | grid |
| I7 graph problems | Cycle detection by colouring; bipartite colouring | graph |
| I8 topological sort | Kahn's algorithm with in-degree counters | graph, chips |
| I9 backtracking | Decision tree for subsets and permutations, choose/undo | tree, chips |
| I10 DP 1D | Table fill for coin change and house robber | array, variables |
| I11 DP 2D | LCS table fill (ported) | grid |
| I12 DP state machines | 0/1 knapsack table; stock buy/sell state machine | grid, graph |
| I13 greedy | Interval scheduling by earliest end; jump game | array |
| I14 intervals | Merge intervals with a sweep | array |
| I15 bits | Bit rows for AND, OR, XOR, shifts and `x & (x-1)` | grid |
| I16 matrix | Spiral order; rotate 90° in place | grid |
| I17 tries | Insert and search words, prefix counts | tree |
| I18 monotonic stack | Next greater element (ported); sliding-window maximum with a deque | array, chips |
| I19 math | Euclid's gcd steps; sieve of Eratosthenes; fast power | grid, variables |
| A1 advanced DP | Bitmask DP over subsets; interval DP table | grid |
| A2 union-find | Union by rank and path compression on a real forest (ported and upgraded) | forest |
| A3 shortest paths | Dijkstra with the heap and distance table | graph, chips |
| A4 MST | Kruskal with union-find; Prim with a heap | graph, forest |
| A5 graph structure | Tarjan low-link for SCCs and bridges; binary lifting table for LCA | graph, grid |
| A6 segment and Fenwick trees | Segment tree query and update; Fenwick lowbit walk | tree, array |
| A7 sparse table | Build the table, answer a range-minimum query | grid |
| A8 string algorithms | KMP failure table and search | array |
| A9 design problems | LRU cache: hash map plus doubly linked list | buckets, linked list |
| A10 advanced backtracking | N-Queens with pruning | grid, tree |
| A11 interview strategy | From constraints to approach: a sample problem walked from the input size to a pattern and a complexity | chips, variables |

## Puzzles (CAP-8)

- Each chapter's registry entry declares at least one puzzle, built from that tracer's frames:
  - **Order the steps:** the reader puts a shuffled list of the algorithm's steps (narration sentences from the frames) in order.
  - **Pick the next step:** the reader sees a frame and chooses what happens next, from choices drawn from the next frames and common mistakes.
- Puzzles use the check's choice and order components. Feedback is instant, with an explanation. They are retryable without limit, give no score, and write no read mark, XP, activity or review entry; solved puzzles are remembered in `groundwork:quiz`.
- Each puzzle works by keyboard, is announced through a `role="status"` line, and states every item's state in text. Under reduced motion nothing animates.
- Puzzle data loads lazily with its tracer, so a chapter page receives only its own puzzles.
