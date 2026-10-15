import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "seg-set-and-sum",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "recognise",
      pattern: "segment-tree",
      section: "where-the-prefix-sum-array-falls-over",
      placement: true,
      kind: "single",
      prompt:
        "<p>An array holds 100,000 numbers. You then receive 100,000 operations in a row, each one either <em>set position i to a new value</em> or <em>report the sum of positions l to r</em>. Which approach fits best?</p>",
      choices: [
        {
          id: "a",
          text: "Keep a prefix-sum array and rebuild it after every set, answering each sum with one subtraction.",
          why: "Each query is then one subtraction, but each set costs O(n) to rebuild. With 100,000 operations that is up to about 10<sup>10</sup> steps.",
        },
        {
          id: "b",
          text: "Loop from l to r for every sum query and change the array in place for every set.",
          why: "A set is cheap here, but a query can walk the whole array, O(n), so the mixed workload can again reach about 10<sup>10</sup> steps.",
        },
        {
          id: "c",
          text: "Keep the numbers in a Fenwick tree or a segment tree, so a set and a range sum each cost O(log n).",
          why: "Both structures store O(n) partial sums such that any range is built from O(log n) of them and one element lies in only O(log n) of them. That is about 17 steps per operation, under two million in total.",
        },
        {
          id: "d",
          text: "Sort the array once so that ranges can be found with binary search on the sorted values.",
          why: "A sum over positions l to r is not a contiguous block of the sorted array, and a set can break the order again. Sorting throws away the positions that the queries are about.",
        },
      ],
      answer: "c",
    },
    {
      id: "seg-range-minimum",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "recognise",
      pattern: "segment-tree",
      section: "range-min-max-gcd-only-the-merge-changes",
      placement: true,
      kind: "single",
      prompt:
        "<p>An array of 100,000 numbers receives 100,000 operations, each either <em>set position i to a new value</em> or <em>report the smallest value among positions l to r</em>. Which structure answers each operation in O(log n)?</p>",
      choices: [
        {
          id: "a",
          text: "A Fenwick tree that answers a query as <code>prefix(r)</code> minus <code>prefix(l - 1)</code>, with min in place of +.",
          why: "A Fenwick range query needs an operation you can undo. You cannot recover the minimum of positions l to r from the minimums of 0 to r and 0 to l − 1, so subtracting two prefix minimums answers nothing.",
        },
        {
          id: "b",
          text: "A sparse table that is rebuilt whenever a value is set.",
          why: "A sparse table answers range minimum in O(1), but building it costs O(n log n), so one set followed by a rebuild is far above O(log n). It suits arrays that never change.",
        },
        {
          id: "c",
          text: "A prefix-sum array, reading the minimum from the differences.",
          why: "Sums and differences of prefixes tell you totals, not which value is smallest. A set also costs O(n) on a prefix-sum array.",
        },
        {
          id: "d",
          text: "A segment tree whose node for each range stores the minimum of that range.",
          why: "The tree works with any associative merge, and min is one. A query combines O(log n) fully covered nodes and a set re-merges the O(log n) ancestors of one leaf.",
        },
      ],
      answer: "d",
    },
    {
      id: "seg-static-array",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "recognise",
      pattern: "segment-tree",
      section: "which-one-to-reach-for",
      kind: "single",
      prompt:
        "<p>An array of 100,000 numbers is given once and never changes. You must answer 200,000 queries, each asking for the sum of positions l to r. Which is the best fit?</p>",
      choices: [
        {
          id: "a",
          text: "Loop from l to r for every query, because it is the simplest code to write.",
          why: "Each query can walk the whole array, so 200,000 queries can cost about 2 × 10<sup>10</sup> steps. The structure that avoids this is cheap to build.",
        },
        {
          id: "b",
          text: "A prefix-sum array, built in O(n), which answers each query with one subtraction.",
          why: "Nothing is ever updated, so there is nothing a tree could buy. <code>prefix[r + 1] - prefix[l]</code> answers every query in O(1), and it is the smallest and fastest choice.",
        },
        {
          id: "c",
          text: "A segment tree, because it handles any range query and also supports updates.",
          why: "It would give correct sums, but each query costs O(log n) and the tree needs about 4n cells and more code. Its updates are never used here.",
        },
        {
          id: "d",
          text: "A Fenwick tree built with one update per element, then queried for each range.",
          why: "It would also give correct sums, with O(log n) per query. With no updates, the prefix-sum array does the same job with O(1) queries.",
        },
      ],
      answer: "b",
    },
    {
      id: "seg-count-smaller",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "recognise",
      pattern: "segment-tree",
      section: "count-of-smaller-numbers-after-self-the-classic-bit-problem",
      kind: "single",
      prompt:
        "<p>For each element of an array of 100,000 integers, each between 1 and 10<sup>9</sup>, you need the number of elements to its right that are strictly smaller. Which approach is both correct and fast enough?</p>",
      choices: [
        {
          id: "a",
          text: "Replace the values by ranks, sweep from right to left, ask a Fenwick tree how many lower ranks were seen, then mark the current rank as seen.",
          why: "Sweeping right to left means everything already seen lies to the right. A prefix query over the lower ranks counts the strictly smaller ones, and compressing the values keeps the tree small. Each element costs O(log n), so the total is O(n log n).",
        },
        {
          id: "b",
          text: "Two nested loops that compare every element with all the elements to its right and count the smaller ones.",
          why: "This is correct but takes about n²/2 comparisons, around 5 × 10<sup>9</sup> for 100,000 elements, which is too slow for most time limits.",
        },
        {
          id: "c",
          text: "A Fenwick tree indexed directly by value, with 10<sup>9</sup> + 1 cells, counting the smaller values seen so far.",
          why: "The idea is right, but a billion cells is far more memory than the problem needs, because at most 100,000 distinct values appear. Coordinate compression to ranks removes the problem.",
        },
        {
          id: "d",
          text: "Sweep from right to left with a <code>Map</code> that counts each value seen so far, and read the count of smaller values from it.",
          why: "A <code>Map</code> tells you how often one given value was seen, not how many seen values are smaller. Adding up all the smaller keys means looking at up to n of them for every element.",
        },
      ],
      answer: "a",
    },
    {
      id: "seg-fenwick-total",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "complexity",
      pattern: "segment-tree",
      section: "where-the-prefix-sum-array-falls-over",
      kind: "single",
      prompt:
        "<p>A Fenwick tree for n numbers is built by calling <code>update(i, nums[i])</code> once for each element. Then q operations follow, each a point update or a prefix sum. What is the tightest bound on the total worst-case time?</p>",
      choices: [
        {
          id: "a",
          text: "O(n · q)",
          why: "That is the cost of the plain array or of the prefix-sum array on a mixed workload, where each operation can touch all n elements. The Fenwick loops touch only about log n cells.",
        },
        {
          id: "b",
          text: "O((n + q) log n)",
          why: "Each of the n build updates and each of the q operations runs one loop that moves by the lowest set bit, which takes at most about log₂ n steps. That gives n + q operations of O(log n) each.",
        },
        {
          id: "c",
          text: "O(n + q)",
          why: "That would need constant time per operation. Each loop can take up to about log₂ n steps, so a log factor stays.",
        },
        {
          id: "d",
          text: "O(q log n)",
          why: "That leaves out the build. Building with n separate updates is n operations of up to log n steps each, so it adds a term n log n.",
        },
      ],
      answer: "b",
    },
    {
      id: "seg-range-add-cost",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "complexity",
      pattern: "segment-tree",
      section: "lazy-propagation-range-updates-without-touching-every-leaf",
      kind: "single",
      prompt:
        "<p>A segment tree over n elements must handle q operations, each adding a value to every element of one range [l, r], where a range can have up to n elements. A teammate implements every operation as one O(log n) point update for each element in the range. What is the tightest bound on the total worst-case time?</p>",
      choices: [
        {
          id: "a",
          text: "O(q log n)",
          why: "That is what lazy propagation reaches, where a whole range is handled by recording a pending add on O(log n) nodes. Point-by-point updates touch each element in the range separately.",
        },
        {
          id: "b",
          text: "O(q · n)",
          why: "That counts the elements touched but forgets that each point update also walks up about log n ancestors to re-merge them.",
        },
        {
          id: "c",
          text: "O(n log n)",
          why: "That is the cost of one pass over the whole array. There are q operations, and each can cover up to n elements.",
        },
        {
          id: "d",
          text: "O(q · n log n)",
          why: "Each operation can cover about n elements, and each element costs one point update of O(log n). Over q operations the total is up to about q · n log n, far more than a plain loop over the array would take.",
        },
      ],
      answer: "d",
    },
    {
      id: "seg-trace-fenwick-cells",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "trace",
      pattern: "segment-tree",
      section: "fenwick-tree-the-same-job-in-a-quarter-of-the-code",
      kind: "single",
      prompt:
        "<p>Using the chapter's <code>Fenwick</code> class, <code>f = new Fenwick(8)</code> is followed by <code>f.update(0, 5)</code>, <code>f.update(2, 3)</code>, <code>f.update(5, 4)</code> and <code>f.update(1, 2)</code>, in that order. What do the cells t[1] to t[8], that is <code>f.t.slice(1)</code>, hold?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[5, 2, 3, 0, 0, 4, 0, 0]</code>",
          why: "These are the values at positions 0 to 7 of the original array, not the Fenwick cells. Each update adds its delta to several cells, not just to the one at its own position.",
        },
        {
          id: "b",
          text: "<code>[5, 7, 10, 10, 10, 14, 14, 14]</code>",
          why: "These are the prefix sums of the array. A Fenwick cell holds the sum of only the block of positions ending at its own index, whose length is the lowest set bit of the index.",
        },
        {
          id: "c",
          text: "<code>[5, 7, 3, 10, 0, 4, 0, 14]</code>",
          why: "update(0, 5) adds to t[1], t[2], t[4] and t[8]. update(2, 3) adds to t[3], t[4] and t[8]. update(5, 4) adds to t[6] and t[8]. update(1, 2) adds to t[2], t[4] and t[8]. That leaves t[4] = 5 + 3 + 2 = 10 and t[8] = 14.",
        },
        {
          id: "d",
          text: "<code>[5, 7, 3, 8, 0, 4, 0, 14]</code>",
          why: "This has t[4] = 8, the value after the first two updates only. update(1, 2) walks 2, 4, 8 and adds 2 to t[4] as well, so t[4] ends at 10.",
        },
      ],
      answer: "c",
    },
    {
      id: "seg-order-lazy-add",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "trace",
      pattern: "segment-tree",
      section: "lazy-propagation-range-updates-without-touching-every-leaf",
      kind: "order",
      prompt:
        "<p>In <code>LazySumTree</code>, <code>rangeAdd</code> is called on a node whose range overlaps the update range only partly. Put what that call does in order. Start with settling the node's pending add, and end with recomputing the node's sum.</p><pre><code>rangeAdd(l, r, add, node = 1, lo = 0, hi = this.n - 1) {\n  this._push(node, lo, hi);\n  if (r &lt; lo || hi &lt; l) return;\n  if (l &lt;= lo &amp;&amp; hi &lt;= r) { this.lazy[node] += add; this._push(node, lo, hi); return; }\n  const mid = (lo + hi) &gt;&gt; 1;\n  this.rangeAdd(l, r, add, 2 * node, lo, mid);\n  this.rangeAdd(l, r, add, 2 * node + 1, mid + 1, hi);\n  this.t[node] = this.t[2 * node] + this.t[2 * node + 1];\n}</code></pre>",
      items: [
        { id: "push", text: "Settle the node's pending add with <code>_push</code>." },
        {
          id: "tests",
          text: "Check the no-overlap and total-coverage exits, and find that neither applies.",
        },
        { id: "mid", text: "Compute <code>mid</code> and split the range in two." },
        { id: "recurse", text: "Call <code>rangeAdd</code> on both halves." },
        { id: "merge", text: "Set <code>t[node]</code> to the sum of its two children." },
      ],
      why: "The push comes first, so that nothing is read or split before the node's debt is settled. The two exits are tested before anything is split, because they stop the recursion. The split comes before the calls on the halves, and the sum is recomputed last, since it needs both children to be up to date.",
    },
    {
      id: "seg-set-is-not-add",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "edge-case",
      pattern: "segment-tree",
      section: "fenwick-tree-the-same-job-in-a-quarter-of-the-code",
      kind: "single",
      prompt:
        "<p>A Fenwick tree <code>bit</code> mirrors an array <code>nums</code> that is kept next to it. Both are 0-indexed, and <code>update(i, delta)</code> adds <code>delta</code> at position <code>i</code>. Right now <code>nums[3]</code> is 7, and it must become 2. Which call keeps the tree correct, followed by <code>nums[3] = 2</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>bit.update(3, -5)</code>",
          why: "The tree adds, it does not assign. Changing 7 to 2 is a change of 2 − 7 = −5, so that is the delta to pass. This is why the raw array has to be kept.",
        },
        {
          id: "b",
          text: "<code>bit.update(3, 2)</code>",
          why: "This adds 2 to the 7 that is already counted, so the tree would hold 9 at position 3 instead of 2.",
        },
        {
          id: "c",
          text: "<code>bit.update(3, 5)</code>",
          why: "The size of the change is right, but the sign is wrong. It would raise the value at position 3 from 7 to 12.",
        },
        {
          id: "d",
          text: "<code>bit.update(2, -5)</code>",
          why: "The delta is right but the position is wrong. Position 2 would lose 5 and position 3 would still count 7.",
        },
      ],
      answer: "a",
    },
    {
      id: "seg-identity-values",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "edge-case",
      pattern: "segment-tree",
      section: "range-min-max-gcd-only-the-merge-changes",
      kind: "multi",
      prompt:
        "<p>A segment tree query returns an identity value for a node whose range lies completely outside the query, so that merging it with another answer changes nothing. Select every operation paired with a correct identity.</p>",
      choices: [
        {
          id: "a",
          text: "Range sum, with identity 0.",
          why: "Adding 0 to any sum leaves it unchanged, so a node outside the query contributes nothing.",
        },
        {
          id: "b",
          text: "Range minimum, with identity 0.",
          why: "With 0 as the identity, a query over all-positive numbers can return 0, because an outside node's 0 wins every <code>Math.min</code> it is merged into. The identity for min is <code>Infinity</code>.",
        },
        {
          id: "c",
          text: "Range maximum, with identity 0.",
          why: "If every number in the query range is negative, an outside node's 0 wins every <code>Math.max</code> it is merged into, and the query can return 0. The identity for max is <code>-Infinity</code>.",
        },
        {
          id: "d",
          text: "Range product, with identity 1.",
          why: "Multiplying by 1 leaves any product unchanged. Using 0 here would turn every result into 0.",
        },
        {
          id: "e",
          text: "Range greatest common divisor, with identity 0.",
          why: "The gcd of 0 and any non-negative number x is x, so merging with 0 changes nothing.",
        },
      ],
      answers: ["a", "d", "e"],
    },
    {
      id: "seg-zero-indexed-loop",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "edge-case",
      pattern: "segment-tree",
      section: "fenwick-tree-the-same-job-in-a-quarter-of-the-code",
      kind: "single",
      prompt:
        "<p>A teammate forgets the shift to 1-indexing, so the loop in <code>update</code> starts at <code>i</code> instead of <code>i + 1</code>.</p><pre><code>update(i, delta) {\n  for (let k = i; k &lt;= this.n; k += k &amp; -k) this.t[k] += delta;\n}</code></pre><p>What happens on <code>update(0, 5)</code>?</p>",
      choices: [
        {
          id: "a",
          text: "It adds 5 to <code>t[0]</code> and returns.",
          why: "The loop does not return after one step. The condition <code>k &lt;= this.n</code> is still true after the first pass, so it goes on.",
        },
        {
          id: "b",
          text: "It never finishes.",
          why: "With <code>k = 0</code>, the value <code>k &amp; -k</code> is 0, so <code>k += k &amp; -k</code> leaves <code>k</code> at 0 and the condition stays true. The loop adds 5 to <code>t[0]</code> again and again without end, which is why the tree needs 1-indexing.",
        },
        {
          id: "c",
          text: "It throws a <code>RangeError</code>, because index 0 is out of bounds.",
          why: "Index 0 is a valid index of the array, so nothing throws. The array has a cell at 0 that the tree never uses on purpose.",
        },
        {
          id: "d",
          text: "It adds 5 to every cell from <code>t[1]</code> to <code>t[n]</code>.",
          why: "The loop never leaves index 0, so it never reaches <code>t[1]</code> or any later cell.",
        },
      ],
      answer: "b",
    },
    {
      id: "seg-trace-struct-merge",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "trace",
      pattern: "segment-tree",
      section: "struct-nodes-when-a-node-stores-more-than-one-number",
      kind: "single",
      prompt:
        "<p>The chapter's <code>MaxSubarrayTree</code> builds a tree over <code>[2, -1, 3, -2, 5]</code>. The root merges the left half <code>[2, -1, 3]</code>, whose node is <code>{ sum: 4, prefix: 4, suffix: 4, best: 4 }</code>, with the right half <code>[-2, 5]</code>, whose node is <code>{ sum: 3, prefix: 3, suffix: 5, best: 5 }</code>. What is the root node, as <code>(sum, prefix, suffix, best)</code>?</p>",
      choices: [
        {
          id: "a",
          text: "(7, 4, 5, 5)",
          why: "These are the fields that would result if the runs could not cross the middle: prefix and suffix are taken from one side, and best is the larger of the two bests. The merge also considers the left suffix glued to the right prefix, and the left total glued to the right prefix.",
        },
        {
          id: "b",
          text: "(7, 7, 7, 7)",
          why: "The prefix is max(4, 4 + 3) = 7, the suffix is max(5, 3 + 4) = 7, and the best is max(4, 5, 4 + 3) = 7. All four fields are 7 because the whole array, 2 − 1 + 3 − 2 + 5 = 7, is the best run and also a prefix and a suffix.",
        },
        {
          id: "c",
          text: "(7, 7, 7, 5)",
          why: "The prefix and suffix are right, but best must also consider the run that crosses the middle: the left suffix 4 plus the right prefix 3 gives 7, which beats 5.",
        },
        {
          id: "d",
          text: "(7, 4, 7, 7)",
          why: "The suffix and the best are right, but the prefix is also extended across the middle: all of the left half (4) plus the right prefix (3) gives 7, which beats the left prefix of 4.",
        },
      ],
      answer: "b",
    },
    {
      id: "seg-trace-bottom-up",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "trace",
      pattern: "segment-tree",
      section: "the-iterative-bottom-up-segment-tree",
      kind: "single",
      prompt:
        "<p>The chapter's <code>BottomUpTree</code> is built over <code>[3, 1, 4, 1, 5, 9, 2, 6]</code> with sum and identity 0. What does <code>query(1, 7)</code> return? Remember that the range is half-open.</p>",
      choices: [
        {
          id: "a",
          text: "28",
          why: "28 is the sum of indices 1 to 7 inclusive, which is what a closed range would give. The second argument is one past the last index, so index 7 is not included.",
        },
        {
          id: "b",
          text: "21",
          why: "21 is the sum of indices 2 to 6, which leaves out the first element of the range. The left end is included, so index 1 counts.",
        },
        {
          id: "c",
          text: "25",
          why: "25 is the sum of indices 0 to 6. The range starts at 1, so the first element, 3, is not part of it.",
        },
        {
          id: "d",
          text: "22",
          why: "The range covers indices 1 to 6: 1 + 4 + 1 + 5 + 9 + 2 = 22. The loop takes the leaf at index 1, then the pair of 4 and 1, then the pair of 5 and 9, then the leaf at index 6, using four reads.",
        },
      ],
      answer: "d",
    },
    {
      id: "seg-bottom-up-space",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "complexity",
      pattern: "segment-tree",
      section: "the-iterative-bottom-up-segment-tree",
      kind: "single",
      prompt:
        "<p>The recursive <code>SegmentTree</code> in the chapter allocates 4n cells. How many cells does the iterative <code>BottomUpTree</code> allocate for n elements, and what does a query cost?</p>",
      choices: [
        {
          id: "a",
          text: "2n cells, and a query costs O(log n).",
          why: "The n leaves sit at indices n to 2n − 1 and the n − 1 merged nodes at indices 1 to n − 1. A query takes at most two nodes per level for about log n levels.",
        },
        {
          id: "b",
          text: "n cells, and a query costs O(log n).",
          why: "The leaves alone take n cells, and the merged nodes need their own cells. The tree has n − 1 more nodes, so the array has about 2n entries.",
        },
        {
          id: "c",
          text: "2n cells, and a query costs O(n).",
          why: "The size is right, but a query does not scan the range. Each level contributes at most two nodes, and the number of levels is about log n.",
        },
        {
          id: "d",
          text: "n log n cells, and a query costs O(1).",
          why: "A tree whose cells stored every level of every range could answer faster, but this one stores each element once and each merged node once, which is linear space and a logarithmic query.",
        },
      ],
      answer: "a",
    },
    {
      id: "seg-descent-cost",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "complexity",
      pattern: "segment-tree",
      section: "descending-the-tree-the-leftmost-index-at-or-above-a-thresho",
      kind: "single",
      prompt:
        "<p>The chapter's <code>MaxTree.firstAtLeast(x, from)</code> returns the smallest index at or after <code>from</code> whose value is at least <code>x</code>. What is the tightest bound on its worst-case time for n elements?</p>",
      choices: [
        {
          id: "a",
          text: "O(n), because a stretch of the array can fail the test.",
          why: "A node whose maximum is below x is rejected in O(1) without looking inside it, so a long stretch of failing elements is never walked element by element.",
        },
        {
          id: "b",
          text: "O(log n)",
          why: "Only one node per level can straddle <code>from</code>. Any node entirely to the right of it is rejected in O(1) by its maximum, or it contains an answer and is followed down a single path. The total is about two paths of length log n.",
        },
        {
          id: "c",
          text: "O(log² n), one log for the descent and one for the position check.",
          why: "There is no second logarithm here. The check on each node is a comparison with a stored number, and the descent never restarts from the root.",
        },
        {
          id: "d",
          text: "O(√n), because it may have to look in several blocks.",
          why: "That bound belongs to a decomposition into blocks of size √n. A segment tree has log n levels, and the search visits a constant number of nodes at each.",
        },
      ],
      answer: "b",
    },
    {
      id: "seg-fenwick-descent-total",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "edge-case",
      pattern: "segment-tree",
      section: "fenwick-binary-descent-the-k-th-element-in-o-log-n",
      kind: "single",
      prompt:
        "<p>The chapter's <code>lowerBound(f, target)</code> runs on <code>Fenwick.from([1, 0, 2, 0, 1])</code>, whose counts add up to 4. What does <code>lowerBound(f, 6)</code> return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>-1</code>",
          why: "The function has no branch that returns <code>-1</code>. It only moves <code>pos</code> forward, so the result is never negative.",
        },
        {
          id: "b",
          text: "<code>4</code>, the last index.",
          why: "Index 4 holds a count of 1 and brings the running total to 4, which is still below 6. The loop keeps jumping past it, so it does not stop there.",
        },
        {
          id: "c",
          text: "<code>5</code>, which is <code>f.n</code>.",
          why: "Every block is still too small, so the descent jumps as far as it can: over the first four positions (sum 3) and then over the fifth (sum 1). It ends at 5, one past the last index, which is how the code says that fewer than 6 items exist.",
        },
        {
          id: "d",
          text: "<code>6</code>, the target itself.",
          why: "The result is a position in the array, never the target. The loop only adds powers of two that stay within <code>f.n</code>, so it cannot return a number larger than 5 here.",
        },
      ],
      answer: "c",
    },
    {
      id: "seg-two-fenwick-arrays",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "recognise",
      pattern: "segment-tree",
      section: "range-add-and-range-sum-with-two-fenwick-trees",
      kind: "single",
      prompt:
        "<p>A range add and range sum structure is built from two Fenwick trees. Let <code>d[j] = a[j] - a[j-1]</code> be the difference array. Which two sequences do the trees store prefix sums of?</p>",
      choices: [
        {
          id: "a",
          text: "<code>a[j]</code> and <code>j · a[j]</code>",
          why: "A range add changes many elements of <code>a</code>, so it would need many point updates. The difference array is what turns a range add into two point updates.",
        },
        {
          id: "b",
          text: "<code>d[j]</code> and <code>d[j] · d[j]</code>",
          why: "Squares of differences do not appear in the prefix sum of a. The sum of a up to i counts each <code>d[j]</code> exactly i − j + 1 times, which involves j, not the square.",
        },
        {
          id: "c",
          text: "<code>d[j]</code> and <code>j · d[j]</code>",
          why: "The prefix sum of a up to i equals (i + 1) · (sum of d up to i) minus (sum of j · d[j] up to i), so one tree holds d and the other holds j times d.",
        },
        {
          id: "d",
          text: "<code>d[j]</code> and the prefix sums of <code>d</code>",
          why: "The prefix sums of d are just the elements of a, and a Fenwick tree already produces prefix sums of whatever it stores. A second tree of those adds nothing the first does not give.",
        },
      ],
      answer: "c",
    },
    {
      id: "seg-sum-insert-first",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "edge-case",
      pattern: "segment-tree",
      section: "offline-sort-plus-fenwick-reverse-pairs-and-range-sum-counts",
      kind: "single",
      prompt:
        "<p>In the chapter's <code>countRangeSum</code>, the line that inserts <code>p</code> into the Fenwick tree is moved to the top of the loop, before the two window counts. What does <code>countRangeSum([-2, 5, -1], -2, 2)</code> return now? It returns 3 with the line in place.</p>",
      choices: [
        {
          id: "a",
          text: "3, because the window never contains the value that was just inserted.",
          why: "The window for p is [p − upper, p − lower] = [p − 2, p + 2], and p itself is always inside it when 0 lies between lower and upper. The value that was just inserted is counted.",
        },
        {
          id: "b",
          text: "4",
          why: "That would mean a single extra count. Every one of the four prefix values pairs with itself, so four extra counts are added, not one.",
        },
        {
          id: "c",
          text: "7",
          why: "Each of the four prefix values P[0..3] is now in its own window, because the difference P[j] − P[j] = 0 lies in [−2, 2]. That adds four to the correct 3.",
        },
        {
          id: "d",
          text: "0",
          why: "Counts only go up when more values are inserted before they are queried, so moving the insertion earlier cannot lower the total below the correct one.",
        },
      ],
      answer: "c",
    },
    {
      id: "seg-calendar-tag-lost",
      chapter: "dsa-segment-fenwick-trees",
      level: "advanced",
      skill: "edge-case",
      pattern: "segment-tree",
      section: "my-calendar-iii-a-dynamic-tree-and-tags-that-never-move",
      kind: "single",
      prompt:
        "<p>In <code>MyCalendarThree._add</code>, the line <code>node.max = node.add + Math.max(node.left.max, node.right.max)</code> is changed to leave out <code>node.add +</code>. The calls <code>book(0, 1000000000)</code> and then <code>book(5, 6)</code> are made. What does the second call return?</p>",
      choices: [
        {
          id: "a",
          text: "2, as before the change.",
          why: "Before the change, the node that holds the first booking's tag adds it back when the second booking forces a recomputation, which gives 2. With the tag left out, the recomputation forgets it.",
        },
        {
          id: "b",
          text: "1, because the first booking's tag is dropped when the root recomputes its maximum.",
          why: "The first booking is stored as a tag on the root's left child, which it covers completely (the root itself reaches one past the booking's last time). The second booking only partly covers that child, which then recomputes its maximum from its children alone. Only the one new booking is left, so it returns 1 instead of 2.",
        },
        {
          id: "c",
          text: "0, because the new nodes start empty.",
          why: "The second booking adds one to the leaf-level nodes it covers, so some node's maximum is at least 1. The result cannot be 0.",
        },
        {
          id: "d",
          text: "It throws, because a node has no <code>add</code> field to read.",
          why: "Nothing is read that was not written. The node still has its <code>add</code> field, which is updated when a booking fully covers it, so no error occurs: the mistake is silent.",
        },
      ],
      answer: "b",
    },
  ],
  pattern: {
    pattern: "segment-tree",
    chapter: "dsa-segment-fenwick-trees",
    signals: [
      "Queries and updates are interleaved over the same array.",
      "The prompt asks for a range minimum, maximum or gcd while single values change.",
      "The prompt asks to add a value to every element of a range and then query ranges.",
      "n and q are both around 10^5, so O(n · q) is too slow.",
      "The prompt asks how many earlier or later elements are smaller, or to count inversions.",
    ],
    template:
      "<pre><code>t[node] = merge(t[2 * node], t[2 * node + 1]);\nquery(l, r, node, lo, hi):\n  no overlap     -&gt; return the identity\n  total overlap  -&gt; return t[node]\n  partial        -&gt; merge(query(left half), query(right half))</code></pre>",
    time: "O(log n) per query or update, O(n) to build",
    space: "O(n)",
    styles: ["online-assessment", "onsite"],
  },
};
