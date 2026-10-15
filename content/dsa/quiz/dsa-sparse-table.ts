import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "sp-static-range-min",
      chapter: "dsa-sparse-table",
      level: "advanced",
      skill: "recognise",
      pattern: "sparse-table",
      section: "where-the-earlier-tools-stop",
      placement: true,
      kind: "single",
      prompt:
        "<p>An array of 200,000 numbers is read once and never changes. Afterwards a million queries arrive, each asking for the smallest value in a range <code>[l, r]</code>. Which structure gives the cheapest query after the one-time build?</p>",
      choices: [
        {
          id: "a",
          text: "A prefix-sum array, answering with <code>P[r + 1] - P[l]</code>.",
          why: "That subtraction recovers a sum, because adding can be undone. A minimum cannot be undone: from the minimum of a long prefix and the minimum of a shorter one, the minimum of the part in between cannot be recovered.",
        },
        {
          id: "b",
          text: "A sparse table, queried from two overlapping blocks.",
          why: "Minimum is idempotent, so reading some elements twice does not change it. Two precomputed blocks of the same power-of-two length cover any range, so a query is two reads and one comparison, whatever the length of the range.",
        },
        {
          id: "c",
          text: "A Fenwick tree, answering with two prefix queries.",
          why: "A Fenwick tree turns a range into the difference of two prefixes, which needs an operation that can be undone, and a minimum cannot be. It would also cost O(log n) per query.",
        },
        {
          id: "d",
          text: "A prefix-minimum array, where entry i holds the minimum of everything up to i.",
          why: "The minimum of <code>a[0..r]</code> says nothing about <code>a[l..r]</code> when a smaller value sits before l. It can answer only ranges that start at index 0.",
        },
      ],
      answer: "b",
    },
    {
      id: "sp-updates-arrive",
      chapter: "dsa-sparse-table",
      level: "advanced",
      skill: "recognise",
      pattern: "sparse-table",
      section: "recognizing-it-in-an-unseen-problem",
      placement: true,
      kind: "single",
      prompt:
        "<p>The same range-minimum queries, but now a single element of the array may be replaced by a new value between queries. Which structure fits?</p>",
      choices: [
        {
          id: "a",
          text: "A sparse table, rebuilt after every replacement.",
          why: "It stays correct, but one rebuild costs O(n log n) and a single replacement can leave O(n) cells stale. With many replacements the rebuilds dominate the running time.",
        },
        {
          id: "b",
          text: "A prefix-sum array, patched at the changed index.",
          why: "Patching one entry is not enough, since every later prefix changes too. And a prefix-sum array cannot answer a minimum in any case.",
        },
        {
          id: "c",
          text: "A segment tree that merges with <code>Math.min</code>.",
          why: "A point update rewrites one path from a leaf to the root in O(log n), and a range minimum is assembled from O(log n) nodes. The merge only has to be associative, which minimum is.",
        },
        {
          id: "d",
          text: "A Fenwick tree that stores minimums.",
          why: "It cannot give the minimum of an arbitrary range, since there is no subtraction to cut a prefix down to <code>[l, r]</code>. Fenwick trees serve invertible operations such as sum and XOR.",
        },
      ],
      answer: "c",
    },
    {
      id: "sp-kth-ancestor-plan",
      chapter: "dsa-sparse-table",
      level: "advanced",
      skill: "recognise",
      pattern: "sparse-table",
      section: "binary-lifting-the-same-doubling-over-ancestors",
      placement: true,
      kind: "single",
      prompt:
        "<p>A rooted tree has 100,000 nodes and arrives as a <code>parent</code> array. Then 100,000 queries each ask for the node reached by going up <code>k</code> parents from a given node, with k up to 100,000. Which plan is fast enough?</p>",
      choices: [
        {
          id: "a",
          text: "Follow the parent pointer k times for every query.",
          why: "It is correct, but a query costs O(k). On a long chain that is close to n, so the queries together cost on the order of 10<sup>10</sup> reads.",
        },
        {
          id: "b",
          text: "Keep a full list of ancestors for every node and index into it.",
          why: "On a chain of n nodes the lists hold about n²/2 entries in total, around 5 × 10<sup>9</sup> at n = 100,000. That does not fit in memory.",
        },
        {
          id: "c",
          text: "Build a sparse table with <code>Math.min</code> over the parent array.",
          why: "The nth ancestor comes from following pointers, not from a minimum over a stretch of indices in the parent array, so such a table answers a different question.",
        },
        {
          id: "d",
          text: "Build <code>up[j][v]</code>, the 2<sup>j</sup>-th ancestor of v, and jump once for each set bit of k.",
          why: "Each row is built from the row before it by chaining two jumps, so the table costs O(n log n). A query then makes at most about log₂ n jumps.",
        },
      ],
      answer: "d",
    },
    {
      id: "sp-overlap-sum-trace",
      chapter: "dsa-sparse-table",
      level: "advanced",
      skill: "trace",
      pattern: "sparse-table",
      section: "why-it-works-only-for-idempotent-operations",
      kind: "single",
      prompt:
        "<p>A sparse table is built over <code>[5, 2, 4, 7, 1, 3, 6, 2]</code> with <code>(a, b) =&gt; a + b</code> as the combine step. The two-overlapping-block query for the sum of indices 1 to 6 reads <code>table[2][1]</code> and <code>table[2][3]</code> and adds them. What does it return?</p>",
      choices: [
        {
          id: "a",
          text: "31",
          why: "<code>table[2][1]</code> covers indices 1 to 4 and holds 14. <code>table[2][3]</code> covers indices 3 to 6 and holds 17. Indices 3 and 4, holding 7 and 1, lie in both blocks and are added twice, so the result is 8 too large.",
        },
        {
          id: "b",
          text: "23",
          why: "23 is the true sum of the range. The overlapping query cannot return it for sums, because it adds the overlap twice.",
        },
        {
          id: "c",
          text: "14",
          why: "14 is <code>table[2][1]</code> by itself. The query also adds the block that ends at index 6.",
        },
        {
          id: "d",
          text: "17",
          why: "17 is <code>table[2][3]</code> by itself. The query also adds the block that starts at index 1.",
        },
      ],
      answer: "a",
    },
    {
      id: "sp-idempotent-operations",
      chapter: "dsa-sparse-table",
      level: "advanced",
      skill: "recognise",
      pattern: "sparse-table",
      section: "why-it-works-only-for-idempotent-operations",
      kind: "multi",
      prompt:
        "<p>Select every operation for which the two-overlapping-block query returns the right answer for any range.</p>",
      choices: [
        {
          id: "a",
          text: "Minimum",
          why: "min(x, x) = x, so an element that sits in both blocks cannot change the result.",
        },
        {
          id: "b",
          text: "Sum",
          why: "x + x = 2x, so every element in the overlap is added twice and the total is too large.",
        },
        {
          id: "c",
          text: "Greatest common divisor",
          why: "gcd(x, x) = x, so reading a divisor twice changes nothing.",
        },
        {
          id: "d",
          text: "XOR",
          why: "x ^ x = 0, so the overlap cancels itself out and the answer leaves those elements out altogether.",
        },
        {
          id: "e",
          text: "Bitwise OR",
          why: "x | x = x, so repeating an element in the overlap is harmless.",
        },
      ],
      answers: ["a", "c", "e"],
    },
    {
      id: "sp-build-cost",
      chapter: "dsa-sparse-table",
      level: "advanced",
      skill: "complexity",
      pattern: "sparse-table",
      section: "cost-o-n-log-n-to-build-and-the-memory-bill",
      kind: "single",
      prompt:
        "<p>A sparse table for range minimum is built over n numbers. Which pair gives its build time and memory?</p>",
      choices: [
        {
          id: "a",
          text: "O(n) time and O(n) memory",
          why: "Row 0 alone holds n entries, but there are about log₂ n rows, and together they add up to about n log n entries, not n.",
        },
        {
          id: "b",
          text: "O(n²) time and O(n²) memory",
          why: "That is the cost of storing the answer for every pair (l, r), which is the plan the sparse table avoids by keeping only power-of-two lengths.",
        },
        {
          id: "c",
          text: "O(n log n) time and O(n log n) memory",
          why: "There are ⌊log₂ n⌋ + 1 rows, each holding at most n entries, and every entry costs one combine step. Every row is kept, because a later query may read any of them.",
        },
        {
          id: "d",
          text: "O(n log n) time and O(n) memory",
          why: "The time is right, but the memory is not. Each row is built from the row below, yet a query can read any row, so none of them can be thrown away.",
        },
      ],
      answer: "c",
    },
    {
      id: "sp-lifting-cost",
      chapter: "dsa-sparse-table",
      level: "advanced",
      skill: "complexity",
      pattern: "sparse-table",
      section: "binary-lifting-the-same-doubling-over-ancestors",
      kind: "single",
      prompt:
        "<p>A binary lifting table has been built for a tree of n nodes. What is the tightest worst-case cost of one <code>kthAncestor(node, k)</code> call, after the guard that returns -1 when k is at least n?</p>",
      choices: [
        {
          id: "a",
          text: "O(1)",
          why: "A single table read is O(1), but the jumps are chained: the loop makes one read for every set bit of k, which can be several.",
        },
        {
          id: "b",
          text: "O(log n)",
          why: "After the guard k is below n, so it has at most about log₂ n bits. Each set bit costs one table read.",
        },
        {
          id: "c",
          text: "O(k)",
          why: "That is the cost of walking up one parent at a time, which is the plan the table replaces. The loop runs over the bits of k, not over its value.",
        },
        {
          id: "d",
          text: "O(n)",
          why: "The table is built once, in O(n log n). A query does not scan the tree or the table; it reads one cell per set bit.",
        },
      ],
      answer: "b",
    },
    {
      id: "sp-sqrt-cost",
      chapter: "dsa-sparse-table",
      level: "advanced",
      skill: "complexity",
      pattern: "sparse-table",
      section: "choosing-the-block-size-and-the-code",
      kind: "single",
      prompt:
        "<p>A range-sum structure uses blocks of size B over n elements. In terms of B and n, which bound is right for one query?</p>",
      choices: [
        {
          id: "a",
          text: "O(B + n / B)",
          why: "A query reads up to about B - 1 loose cells on each side plus up to about n / B whole blocks. With B near √n both terms are O(√n), which is where the name comes from.",
        },
        {
          id: "b",
          text: "O(B)",
          why: "That counts only the loose cells at the two ends. It forgets the whole blocks in the middle, of which there can be n / B.",
        },
        {
          id: "c",
          text: "O(n / B)",
          why: "That counts only the whole blocks. The two partial blocks at the ends are read cell by cell, which can cost up to B each.",
        },
        {
          id: "d",
          text: "O(log n)",
          why: "That is the cost in a segment tree. Blocks have no tree over them, so the whole blocks in the middle are added one at a time.",
        },
      ],
      answer: "a",
    },
    {
      id: "sp-mo-order",
      chapter: "dsa-sparse-table",
      level: "advanced",
      skill: "trace",
      pattern: "sparse-table",
      section: "mo-s-algorithm-sorting-queries-so-a-window-barely-moves",
      kind: "order",
      prompt: "<p>Put the steps of Mo's algorithm in order, from the first thing done to the last.</p>",
      items: [
        { id: "sort", text: "Sort the query numbers by the block that holds <code>l</code>, then by <code>r</code>." },
        { id: "grow", text: "Move the window outward to cover the next query's range, adding elements." },
        { id: "shrink", text: "Move the window inward to exactly <code>[l, r]</code>, removing elements." },
        { id: "record", text: "Store the current answer at that query's original index." },
        { id: "next", text: "Go on to the next query in the sorted order." },
      ],
      why: "The order of the queries is only chosen once, before any window moves, so sorting is first. For each query the window grows before it shrinks: a window that shrinks first can briefly have a negative length and remove an element that was never added. The answer is read only when the window is exactly the query's range, and it goes to the original index, because the sorted order is not the order the caller asked in. Only then does the loop move to the next query.",
    },
    {
      id: "sp-offline-plan",
      chapter: "dsa-sparse-table",
      level: "advanced",
      skill: "recognise",
      pattern: "sparse-table",
      section: "offline-queries-sort-them-first",
      kind: "single",
      prompt:
        "<p>The array is fixed, every query <code>[l, r, x]</code> is known in advance, and each asks how many elements of <code>a[l..r]</code> are at most <code>x</code>. Which plan fits best?</p>",
      choices: [
        {
          id: "a",
          text: "Build a sparse table over the array and combine two blocks with <code>+</code>.",
          why: "Counts add, so the overlap would be counted twice. A table of range aggregates also has no way to take the value x into account.",
        },
        {
          id: "b",
          text: "Sort the array, then binary search for x and ignore l and r.",
          why: "Sorting throws the positions away, so the count inside a position range <code>[l, r]</code> cannot be recovered from the sorted array.",
        },
        {
          id: "c",
          text: "Take prefix sums of the array and subtract the two ends.",
          why: "Prefix sums give the sum of a range. They do not say how many of its elements are at most x.",
        },
        {
          id: "d",
          text: "Sort the queries by x, switch elements on in order of value, and count switched-on positions in <code>[l, r]</code> with a Fenwick tree.",
          why: "As x grows, each element is switched on exactly once, and a Fenwick tree over positions counts the switched-on ones in any range. This relies on knowing every query before answering any.",
        },
      ],
      answer: "d",
    },
    {
      id: "sp-same-block",
      chapter: "dsa-sparse-table",
      level: "advanced",
      skill: "edge-case",
      pattern: "sparse-table",
      section: "choosing-the-block-size-and-the-code",
      kind: "single",
      prompt:
        "<p>A block-sum structure uses block size 3, and its first block holds <code>[5, 2, 8]</code>. Its <code>query(l, r)</code> has only three parts: loop <code>i</code> from <code>l</code> to the end of the first block, add the whole blocks strictly between, then loop <code>i</code> from the start of the last block to <code>r</code>. There is no special case for both ends lying in one block. What does <code>query(0, 1)</code> return?</p>",
      choices: [
        {
          id: "a",
          text: "7",
          why: "5 + 2 is the right sum. The code returns it only when a separate branch handles the case of both ends in one block.",
        },
        {
          id: "b",
          text: "15",
          why: "15 is what the first loop adds alone: it runs to the end of the block at index 2, past r. The last loop then adds more on top.",
        },
        {
          id: "c",
          text: "22",
          why: "The first loop reads indices 0 to 2 and adds 15, running past r. The last loop reads indices 0 to 1 and adds 7 again. Some cells are counted twice and one lies outside the range.",
        },
        {
          id: "d",
          text: "A <code>TypeError</code>",
          why: "Every index read is inside the array, so nothing throws. The answer is simply wrong.",
        },
      ],
      answer: "c",
    },
    {
      id: "sp-lifting-guard",
      chapter: "dsa-sparse-table",
      level: "advanced",
      skill: "edge-case",
      pattern: "sparse-table",
      section: "binary-lifting-the-same-doubling-over-ancestors",
      kind: "single",
      prompt:
        "<p>A chain of 8 nodes has <code>parent[i] = i - 1</code> and <code>parent[0] = -1</code>. The lifting table has three rows, for jumps of 1, 2 and 4. The <code>k &gt;= n</code> guard is deleted from <code>kthAncestor</code>, whose loop runs over the rows and uses bit j of k for row j. What does <code>kthAncestor(7, 9)</code> return?</p>",
      choices: [
        {
          id: "a",
          text: "-1",
          why: "-1 is the correct answer, since node 7 has only seven ancestors. Without the guard the code does not reach it, because the loop never looks at bit 3.",
        },
        {
          id: "b",
          text: "6",
          why: "9 is 1001 in binary. Only bit 0 falls inside the three rows, so the code makes one jump, to the parent 6, and ignores bit 3 without any error.",
        },
        {
          id: "c",
          text: "0",
          why: "Reaching node 0 takes seven steps, which sets bits 0, 1 and 2. The number 9 sets bits 0 and 3, so the code does not make those jumps.",
        },
        {
          id: "d",
          text: "<code>undefined</code>",
          why: "The loop stops at the last row, so it never reads a row that does not exist and never indexes past the table.",
        },
      ],
      answer: "b",
    },
    {
      id: "sp-mo-cost",
      chapter: "dsa-sparse-table",
      level: "advanced",
      skill: "complexity",
      pattern: "sparse-table",
      section: "mo-s-algorithm-sorting-queries-so-a-window-barely-moves",
      kind: "single",
      prompt:
        "<p>Mo's algorithm runs over n elements and q queries, with blocks of size ⌊√n⌋ for the left end and O(1) work per added or removed element. How many pointer moves does it make in total?</p>",
      choices: [
        {
          id: "a",
          text: "O(n · q)",
          why: "That is the cost of rebuilding the window from scratch for every query. Sorting is what lets neighbouring queries share most of their window.",
        },
        {
          id: "b",
          text: "O((n + q) log n)",
          why: "That is the cost of the offline sweep with a Fenwick tree, which is a different method. A window moved one element at a time travels distances of order √n.",
        },
        {
          id: "c",
          text: "O(q log q)",
          why: "Sorting the queries costs this much, but the movement of the window is a separate and larger cost.",
        },
        {
          id: "d",
          text: "O((n + q)√n)",
          why: "The left pointer moves at most about √n per query, which is q√n. The right pointer moves at most n per block over about √n blocks, which is n√n.",
        },
      ],
      answer: "d",
    },
  ],
  pattern: {
    pattern: "sparse-table",
    chapter: "dsa-sparse-table",
    signals: [
      "The array never changes and the queries ask for the minimum, maximum or gcd of many ranges.",
      "A range minimum or maximum is asked inside a loop or a binary search, so a log factor would multiply.",
      "The task is to jump k steps up a tree or along next pointers, with k too large to walk.",
      "Every query is known in advance and may be answered in any order.",
    ],
    template:
      "<pre><code>table[j][i] = op(table[j - 1][i], table[j - 1][i + (1 &lt;&lt; (j - 1))]); answer = op(table[k][l], table[k][r - (1 &lt;&lt; k) + 1]) with k = 31 - Math.clz32(r - l + 1)</code></pre>",
    time: "O(n log n) build, O(1) per query",
    space: "O(n log n)",
    styles: ["online-assessment", "onsite"],
  },
};
