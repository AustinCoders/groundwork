import type { Exercise } from "../types";

export const dsaAddSparseTable: Exercise[] = [
  {
    id: "ex-sparse-table-range-min",
    chapter: "dsa-sparse-table",
    level: "intermediate",
    title: "Range Minimum Query (Sparse Table)",
    brief: "<p>Build a <code>SparseTableMin</code> class over a fixed array of numbers.</p><ul><li><code>new SparseTableMin(nums)</code> — builds from a non-empty array in <b>O(n log n)</b></li><li><code>query(l, r)</code> — the smallest value in indices <code>l</code> to <code>r</code> <b>inclusive</b>, in <b>O(1)</b></li><li>The array never changes after construction, so there is no <code>update</code></li><li>Every query has <code>0 &lt;= l &lt;= r &lt; n</code></li><li>Values may be negative; duplicates are fine</li><li>Do not change the array that was passed in</li></ul>",
    starter: "class SparseTableMin {\n  constructor(nums) {\n    // TODO: level j should hold the minimum of every block of length 2^j\n  }\n  query(l, r) {\n    // TODO: cover [l, r] with two blocks of the same power-of-two length\n  }\n}\n",
    hints: [
      "Keep a list of rows. Row 0 is the array itself. Row j at position i holds the minimum of nums[i .. i + 2^j - 1], which is the smaller of row j - 1 at i and row j - 1 at i + 2^(j - 1).",
      "For a query of length len, let k be the largest integer with 2^k <= len. One block of length 2^k starts at l, and another ends exactly at r. Together they cover [l, r], and they may overlap.",
      "The overlap does not matter for a minimum, because taking the minimum of a value twice changes nothing. Get k as 31 - Math.clz32(len) and return Math.min(row[k][l], row[k][r - 2^k + 1])."
    ],
    solution: "class SparseTableMin {\n  constructor(nums) {\n    this.rows = [nums.slice()];\n    for (let j = 1; (1 << j) <= nums.length; j++) {\n      const prev = this.rows[j - 1];\n      const half = 1 << (j - 1);\n      const row = new Array(nums.length - (1 << j) + 1);\n      for (let i = 0; i < row.length; i++) row[i] = Math.min(prev[i], prev[i + half]);\n      this.rows.push(row);\n    }\n  }\n  query(l, r) {\n    const k = 31 - Math.clz32(r - l + 1);\n    return Math.min(this.rows[k][l], this.rows[k][r - (1 << k) + 1]);\n  }\n}\n",
    tests: [
      {
        name: "answers queries on a small array",
        body: "const st = new SparseTableMin([5, 2, 4, 7, 1, 3, 6, 2]);\nassert.equal(st.query(0, 7), 1);\nassert.equal(st.query(1, 6), 1);\nassert.equal(st.query(0, 2), 2);\nassert.equal(st.query(5, 7), 2);\nassert.equal(st.query(2, 3), 4);"
      },
      {
        name: "a single-element query returns that element",
        body: "const st = new SparseTableMin([9, -4, 7]);\nassert.equal(st.query(0, 0), 9);\nassert.equal(st.query(1, 1), -4);\nassert.equal(st.query(2, 2), 7);"
      },
      {
        name: "one-element array",
        body: "const st = new SparseTableMin([42]);\nassert.equal(st.query(0, 0), 42);"
      },
      {
        name: "negative values and duplicates",
        body: "const st = new SparseTableMin([-3, -3, 0, -8, -8, 5]);\nassert.equal(st.query(0, 2), -3);\nassert.equal(st.query(2, 5), -8);\nassert.equal(st.query(4, 5), -8);\nassert.equal(st.query(0, 5), -8);"
      },
      {
        name: "lengths that are not powers of two use overlapping blocks",
        body: "const nums = [8, 6, 7, 5, 3, 0, 9, 1, 2, 4, 6];\nconst st = new SparseTableMin(nums);\nfor (let l = 0; l < nums.length; l++) {\n  for (let r = l; r < nums.length; r++) {\n    assert.equal(st.query(l, r), Math.min(...nums.slice(l, r + 1)), 'range ' + l + '..' + r);\n  }\n}"
      },
      {
        name: "does not change the input array",
        body: "const nums = [4, 1, 3, 2];\nconst copy = nums.slice();\nconst st = new SparseTableMin(nums);\nst.query(0, 3);\nassert.deepEqual(nums, copy);"
      },
      {
        name: "agrees with a brute force on random arrays and queries",
        body: "let seed = 2024;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 40; round++) {\n  const n = 1 + rnd(60);\n  const nums = Array.from({ length: n }, () => rnd(200) - 100);\n  const st = new SparseTableMin(nums);\n  for (let q = 0; q < 80; q++) {\n    let l = rnd(n);\n    let r = rnd(n);\n    if (l > r) [l, r] = [r, l];\n    assert.equal(st.query(l, r), Math.min(...nums.slice(l, r + 1)));\n  }\n}"
      },
      {
        name: "stays correct on a large array",
        body: "let seed = 77;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst n = 20000;\nconst nums = Array.from({ length: n }, () => rnd(1000000));\nconst st = new SparseTableMin(nums);\nfor (let q = 0; q < 300; q++) {\n  let l = rnd(n);\n  let r = rnd(n);\n  if (l > r) [l, r] = [r, l];\n  let low = Infinity;\n  for (let i = l; i <= r; i++) if (nums[i] < low) low = nums[i];\n  assert.equal(st.query(l, r), low);\n}"
      }
    ]
  },
  {
    id: "ex-range-gcd-queries",
    chapter: "dsa-sparse-table",
    level: "advanced",
    title: "Range GCD Queries",
    brief: "<p>Given an array <code>nums</code> of non-negative integers and a list <code>queries</code> of <code>[l, r]</code> pairs, return an array with the greatest common divisor of <code>nums[l..r]</code> (inclusive) for every query, in the order the queries were given.</p><ul><li><code>gcd(0, x)</code> is <code>x</code>, and the gcd of a range of only zeros is <code>0</code></li><li>The array does not change between queries</li><li>Every query has <code>0 &lt;= l &lt;= r &lt; n</code>; an empty query list gives <code>[]</code></li><li>Target: <b>O(n log n)</b> build plus a near-constant number of gcd calls per query, not a loop over the range</li></ul>",
    starter: "function rangeGcd(nums, queries) {\n  // TODO: gcd(x, x) = x, so two overlapping power-of-two blocks give the right answer\n}\n",
    hints: [
      "gcd is associative, and gcd(x, x) = x, so the same overlap trick that works for a minimum also works for gcd. A sparse table with gcd as the combine step answers each query from two blocks.",
      "Write gcd with a loop: while b is not 0, replace (a, b) with (b, a % b). Because gcd(0, x) = x, this also handles zeros with no special case.",
      "Build rows exactly like a range-minimum sparse table, only with gcd(prev[i], prev[i + half]). For a query take k = 31 - Math.clz32(r - l + 1) and return gcd(row[k][l], row[k][r - 2^k + 1])."
    ],
    solution: "function rangeGcd(nums, queries) {\n  const gcd = (a, b) => {\n    while (b !== 0) [a, b] = [b, a % b];\n    return a;\n  };\n  const rows = [nums.slice()];\n  for (let j = 1; (1 << j) <= nums.length; j++) {\n    const prev = rows[j - 1];\n    const half = 1 << (j - 1);\n    const row = new Array(nums.length - (1 << j) + 1);\n    for (let i = 0; i < row.length; i++) row[i] = gcd(prev[i], prev[i + half]);\n    rows.push(row);\n  }\n  return queries.map(([l, r]) => {\n    const k = 31 - Math.clz32(r - l + 1);\n    return gcd(rows[k][l], rows[k][r - (1 << k) + 1]);\n  });\n}\n",
    tests: [
      {
        name: "the worked example",
        body: "assert.deepEqual(rangeGcd([12, 18, 24, 9, 6], [[0, 2], [0, 4], [3, 4], [1, 3]]), [6, 3, 3, 3]);"
      },
      {
        name: "single-element ranges return the element",
        body: "assert.deepEqual(rangeGcd([7, 0, 15], [[0, 0], [1, 1], [2, 2]]), [7, 0, 15]);"
      },
      {
        name: "zeros do not break the gcd",
        body: "assert.deepEqual(rangeGcd([0, 0, 0], [[0, 2]]), [0]);\nassert.deepEqual(rangeGcd([0, 8, 0, 12], [[0, 3], [0, 2], [2, 2]]), [4, 8, 0]);"
      },
      {
        name: "coprime neighbours give 1",
        body: "assert.deepEqual(rangeGcd([8, 15, 4, 9], [[0, 1], [1, 2], [2, 3], [0, 3]]), [1, 1, 1, 1]);"
      },
      {
        name: "empty query list and one-element array",
        body: "assert.deepEqual(rangeGcd([5, 10], []), []);\nassert.deepEqual(rangeGcd([30], [[0, 0]]), [30]);"
      },
      {
        name: "large values stay exact",
        body: "assert.deepEqual(rangeGcd([1000000000, 999999999, 500000000, 250000000], [[0, 0], [0, 1], [2, 3], [0, 3]]), [1000000000, 1, 250000000, 1]);"
      },
      {
        name: "answers are returned in the order of the queries",
        body: "const out = rangeGcd([6, 10, 15, 4], [[2, 3], [0, 1], [0, 3], [1, 2]]);\nassert.deepEqual(out, [1, 2, 1, 5]);"
      },
      {
        name: "agrees with a brute force on random arrays",
        body: "const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));\nlet seed = 31;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 30; round++) {\n  const n = 1 + rnd(50);\n  const nums = Array.from({ length: n }, () => (rnd(4) === 0 ? 0 : 1 + rnd(120)));\n  const queries = [];\n  for (let q = 0; q < 60; q++) {\n    let l = rnd(n);\n    let r = rnd(n);\n    if (l > r) [l, r] = [r, l];\n    queries.push([l, r]);\n  }\n  const expected = queries.map(([l, r]) => nums.slice(l, r + 1).reduce(gcd, 0));\n  assert.deepEqual(rangeGcd(nums, queries), expected);\n}"
      }
    ]
  },
  {
    id: "ex-range-min-index-leftmost",
    chapter: "dsa-sparse-table",
    level: "advanced",
    title: "Range Minimum Index (Leftmost)",
    brief: "<p>Given an array <code>nums</code> and a list <code>queries</code> of <code>[l, r]</code> pairs, return for every query the <b>index</b> of the smallest value in <code>nums[l..r]</code> (inclusive). When the smallest value appears more than once, return the <b>leftmost</b> index.</p><ul><li>The array does not change between queries</li><li>Every query has <code>0 &lt;= l &lt;= r &lt; n</code></li><li>Answers come back in the order the queries were given</li><li>Target: <b>O(n log n)</b> build and <b>O(1)</b> per query; store indices in the table, not values</li></ul>",
    starter: "function rangeMinIndex(nums, queries) {\n  // TODO: build a sparse table whose cells hold indices, not values\n}\n",
    hints: [
      "Row 0 holds the indices 0, 1, 2, ... A cell in a higher row is whichever of two indices points at the smaller value. Compare nums[a] and nums[b], never a and b themselves.",
      "To make ties go to the leftmost index, keep the left candidate unless the right one is strictly smaller: pick = nums[b] < nums[a] ? b : a.",
      "The query is the same as for a plain minimum: take k = 31 - Math.clz32(r - l + 1) and combine the cells at l and at r - 2^k + 1 with the same pick function. The two blocks may overlap and the answer is still the leftmost minimum."
    ],
    solution: "function rangeMinIndex(nums, queries) {\n  const pick = (a, b) => (nums[b] < nums[a] ? b : a);\n  const rows = [nums.map((_, i) => i)];\n  for (let j = 1; (1 << j) <= nums.length; j++) {\n    const prev = rows[j - 1];\n    const half = 1 << (j - 1);\n    const row = new Array(nums.length - (1 << j) + 1);\n    for (let i = 0; i < row.length; i++) row[i] = pick(prev[i], prev[i + half]);\n    rows.push(row);\n  }\n  return queries.map(([l, r]) => {\n    const k = 31 - Math.clz32(r - l + 1);\n    return pick(rows[k][l], rows[k][r - (1 << k) + 1]);\n  });\n}\n",
    tests: [
      {
        name: "returns indices, not values",
        body: "assert.deepEqual(rangeMinIndex([5, 2, 4, 7, 1, 3, 6, 2], [[0, 7], [0, 3], [5, 7], [2, 3]]), [4, 1, 7, 2]);"
      },
      {
        name: "ties go to the leftmost index",
        body: "assert.deepEqual(rangeMinIndex([3, 1, 1, 1, 3], [[0, 4], [2, 4], [2, 3], [3, 3]]), [1, 2, 2, 3]);\nassert.deepEqual(rangeMinIndex([4, 4, 4, 4], [[0, 3], [1, 3], [2, 2]]), [0, 1, 2]);"
      },
      {
        name: "a tie that sits inside the overlap of the two blocks",
        body: "assert.deepEqual(rangeMinIndex([9, 9, 2, 2, 9, 9, 9], [[0, 5], [1, 4], [2, 6]]), [2, 2, 2]);"
      },
      {
        name: "single-element array and single-element ranges",
        body: "assert.deepEqual(rangeMinIndex([7], [[0, 0]]), [0]);\nassert.deepEqual(rangeMinIndex([5, 2, 8], [[0, 0], [1, 1], [2, 2]]), [0, 1, 2]);"
      },
      {
        name: "negative values and an empty query list",
        body: "assert.deepEqual(rangeMinIndex([-1, -5, 0, -5, -2], [[0, 4], [2, 4]]), [1, 3]);\nassert.deepEqual(rangeMinIndex([1, 2], []), []);"
      },
      {
        name: "does not change the input",
        body: "const nums = [4, 1, 3, 1];\nconst queries = [[0, 3]];\nrangeMinIndex(nums, queries);\nassert.deepEqual(nums, [4, 1, 3, 1]);\nassert.deepEqual(queries, [[0, 3]]);"
      },
      {
        name: "agrees with a brute force on random arrays with many ties",
        body: "let seed = 8;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 40; round++) {\n  const n = 1 + rnd(50);\n  const nums = Array.from({ length: n }, () => rnd(6));\n  const queries = [];\n  for (let q = 0; q < 60; q++) {\n    let l = rnd(n);\n    let r = rnd(n);\n    if (l > r) [l, r] = [r, l];\n    queries.push([l, r]);\n  }\n  const expected = queries.map(([l, r]) => {\n    let best = l;\n    for (let i = l + 1; i <= r; i++) if (nums[i] < nums[best]) best = i;\n    return best;\n  });\n  assert.deepEqual(rangeMinIndex(nums, queries), expected);\n}"
      }
    ]
  },
  {
    id: "ex-first-index-below-threshold",
    chapter: "dsa-sparse-table",
    level: "advanced",
    title: "First Index Below a Threshold",
    brief: "<p>Given an array <code>nums</code> and a list <code>queries</code> of <code>[from, x]</code> pairs, return for every query the smallest index <code>i &gt;= from</code> with <code>nums[i] &lt; x</code>, or <code>-1</code> when there is none.</p><ul><li>The array does not change between queries</li><li><code>0 &lt;= from &lt; n</code>; <code>x</code> can be any integer, including one smaller than every element</li><li>Answers come back in the order the queries were given</li><li>Target: <b>O(n log n)</b> build and <b>O(log n)</b> per query, not a scan from <code>from</code></li></ul>",
    starter: "function firstBelow(nums, queries) {\n  // TODO: build a table of block minimums, then skip whole blocks whose minimum is >= x\n}\n",
    hints: [
      "A block whose minimum is at least x contains no index you want, so you can skip all of it. Build the same table as for range minimum: row j at i is the minimum of nums[i .. i + 2^j - 1].",
      "Start at pos = from and try the block sizes from the largest down to 1. If the block of size 2^j starting at pos fits inside the array and its minimum is >= x, move pos forward by 2^j.",
      "When all sizes have been tried, pos is the first index whose value is below x, or it has reached n. Return pos if pos < n, otherwise -1. Each size is tried once, so the query is O(log n)."
    ],
    solution: "function firstBelow(nums, queries) {\n  const n = nums.length;\n  const rows = [nums.slice()];\n  for (let j = 1; (1 << j) <= n; j++) {\n    const prev = rows[j - 1];\n    const half = 1 << (j - 1);\n    const row = new Array(n - (1 << j) + 1);\n    for (let i = 0; i < row.length; i++) row[i] = Math.min(prev[i], prev[i + half]);\n    rows.push(row);\n  }\n  return queries.map(([from, x]) => {\n    let pos = from;\n    for (let j = rows.length - 1; j >= 0; j--) {\n      if (pos + (1 << j) <= n && rows[j][pos] >= x) pos += 1 << j;\n    }\n    return pos < n ? pos : -1;\n  });\n}\n",
    tests: [
      {
        name: "finds the first smaller element from a start index",
        body: "assert.deepEqual(firstBelow([5, 2, 4, 7, 1, 3, 6, 2], [[0, 3], [2, 2], [3, 3], [5, 3], [0, 2]]), [1, 4, 4, 7, 4]);"
      },
      {
        name: "returns -1 when nothing qualifies",
        body: "assert.deepEqual(firstBelow([5, 6, 7], [[0, 5], [1, 1], [2, -10]]), [-1, -1, -1]);"
      },
      {
        name: "the start index itself can be the answer",
        body: "assert.deepEqual(firstBelow([9, 1, 9, 1], [[1, 2], [3, 2], [0, 10]]), [1, 3, 0]);"
      },
      {
        name: "strict comparison: an element equal to x does not count",
        body: "assert.deepEqual(firstBelow([4, 4, 3, 4], [[0, 4], [0, 3], [0, 5]]), [2, -1, 0]);"
      },
      {
        name: "one-element array",
        body: "assert.deepEqual(firstBelow([3], [[0, 4], [0, 3], [0, 0]]), [0, -1, -1]);"
      },
      {
        name: "the answer is the last index",
        body: "const nums = new Array(37).fill(10);\nnums[36] = 1;\nassert.deepEqual(firstBelow(nums, [[0, 5], [30, 5], [36, 5], [0, 1]]), [36, 36, 36, -1]);"
      },
      {
        name: "agrees with a brute force on random arrays",
        body: "let seed = 19;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 40; round++) {\n  const n = 1 + rnd(70);\n  const nums = Array.from({ length: n }, () => rnd(30));\n  const queries = [];\n  for (let q = 0; q < 60; q++) queries.push([rnd(n), rnd(34) - 2]);\n  const expected = queries.map(([from, x]) => {\n    for (let i = from; i < n; i++) if (nums[i] < x) return i;\n    return -1;\n  });\n  assert.deepEqual(firstBelow(nums, queries), expected);\n}"
      }
    ]
  },
  {
    id: "ex-kth-ancestor-of-tree-node",
    chapter: "dsa-sparse-table",
    level: "advanced",
    title: "Kth Ancestor of a Tree Node",
    brief: "<p>A tree has <code>n</code> nodes labelled <code>0..n-1</code>, rooted at <code>0</code>. You are given <code>parent</code>, where <code>parent[i]</code> is the parent of node <code>i</code> and <code>parent[0] === -1</code>. Build a <code>TreeAncestor</code> class.</p><ul><li><code>new TreeAncestor(n, parent)</code></li><li><code>getKthAncestor(node, k)</code> — the node reached by going up <code>k</code> parents from <code>node</code>, or <code>-1</code> if there are fewer than <code>k</code> ancestors</li><li><code>k = 0</code> returns <code>node</code> itself</li><li>The tree can be a long chain, so walking up one parent at a time is too slow: target <b>O(n log n)</b> build and <b>O(log n)</b> per query</li></ul>",
    starter: "class TreeAncestor {\n  constructor(n, parent) {\n    // TODO: up[j][v] = the 2^j-th ancestor of v\n  }\n  getKthAncestor(node, k) {\n    // TODO: jump once for every set bit of k\n  }\n}\n",
    hints: [
      "Let up[0] be the parent array. The 2^j-th ancestor of v is the 2^(j-1)-th ancestor of the 2^(j-1)-th ancestor of v, so up[j][v] = up[j-1][ up[j-1][v] ], unless that first jump already fell off the tree (-1).",
      "Write k in binary. Going up k steps is the same as going up 2^j steps for every bit j that is set in k, in any order. So for each set bit, replace node with up[j][node], and stop as soon as node becomes -1.",
      "You need about log2(n) rows, because no node has more than n - 1 ancestors. If k is at least n the answer is -1 straight away, which also keeps k within the bits you have rows for."
    ],
    solution: "class TreeAncestor {\n  constructor(n, parent) {\n    this.n = n;\n    let levels = 1;\n    while ((1 << levels) < n) levels++;\n    this.up = [parent.slice()];\n    for (let j = 1; j < levels; j++) {\n      const prev = this.up[j - 1];\n      const row = new Array(n);\n      for (let v = 0; v < n; v++) row[v] = prev[v] === -1 ? -1 : prev[prev[v]];\n      this.up.push(row);\n    }\n  }\n  getKthAncestor(node, k) {\n    if (k >= this.n) return -1;\n    for (let j = 0; j < this.up.length && node !== -1; j++) {\n      if ((k >> j) & 1) node = this.up[j][node];\n    }\n    return node;\n  }\n}\n",
    tests: [
      {
        name: "the worked example",
        body: "const t = new TreeAncestor(7, [-1, 0, 0, 1, 1, 2, 2]);\nassert.equal(t.getKthAncestor(3, 1), 1);\nassert.equal(t.getKthAncestor(5, 2), 0);\nassert.equal(t.getKthAncestor(6, 3), -1);"
      },
      {
        name: "k = 0 returns the node itself",
        body: "const t = new TreeAncestor(4, [-1, 0, 1, 2]);\nassert.equal(t.getKthAncestor(3, 0), 3);\nassert.equal(t.getKthAncestor(0, 0), 0);"
      },
      {
        name: "the root has no ancestors",
        body: "const t = new TreeAncestor(3, [-1, 0, 0]);\nassert.equal(t.getKthAncestor(0, 1), -1);\nassert.equal(t.getKthAncestor(0, 5), -1);"
      },
      {
        name: "a single-node tree",
        body: "const t = new TreeAncestor(1, [-1]);\nassert.equal(t.getKthAncestor(0, 0), 0);\nassert.equal(t.getKthAncestor(0, 1), -1);"
      },
      {
        name: "going exactly to the root and one step past it",
        body: "const t = new TreeAncestor(5, [-1, 0, 1, 2, 3]);\nassert.equal(t.getKthAncestor(4, 4), 0);\nassert.equal(t.getKthAncestor(4, 5), -1);\nassert.equal(t.getKthAncestor(2, 3), -1);"
      },
      {
        name: "a very large k is not an error",
        body: "const t = new TreeAncestor(4, [-1, 0, 0, 1]);\nassert.equal(t.getKthAncestor(3, 1000000000), -1);\nassert.equal(t.getKthAncestor(3, 2000000000), -1);"
      },
      {
        name: "agrees with walking up one parent at a time",
        body: "let seed = 5;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 30; round++) {\n  const n = 1 + rnd(60);\n  const parent = [-1];\n  for (let v = 1; v < n; v++) parent.push(rnd(v));\n  const t = new TreeAncestor(n, parent);\n  for (let q = 0; q < 80; q++) {\n    const node = rnd(n);\n    const k = rnd(n + 3);\n    let cur = node;\n    for (let i = 0; i < k && cur !== -1; i++) cur = parent[cur];\n    assert.equal(t.getKthAncestor(node, k), cur);\n  }\n}"
      },
      {
        name: "a long chain answers many queries",
        body: "let seed = 6;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst n = 30000;\nconst parent = [-1];\nfor (let v = 1; v < n; v++) parent.push(v - 1);\nconst t = new TreeAncestor(n, parent);\nfor (let q = 0; q < 20000; q++) {\n  const node = rnd(n);\n  const k = rnd(n + 10);\n  assert.equal(t.getKthAncestor(node, k), node - k >= 0 ? node - k : -1);\n}"
      }
    ]
  },
  {
    id: "ex-kth-step-functional-graph",
    chapter: "dsa-sparse-table",
    level: "advanced",
    title: "Where Are You After K Steps?",
    brief: "<p>There are <code>n</code> stations labelled <code>0..n-1</code>. From station <code>i</code> a train always goes to station <code>next[i]</code> (which may be <code>i</code> itself, and the stations may form cycles). Return the station you are at after taking exactly <code>k</code> steps starting from <code>start</code>.</p><ul><li><code>k = 0</code> returns <code>start</code></li><li><code>k</code> can be as large as <code>10^12</code>, so simulating the steps one by one will never finish</li><li><code>next</code> has exactly one entry for every station, so there is no dead end</li><li>Target: about <b>O(n log k)</b> time</li></ul>",
    starter: "function kthStep(next, start, k) {\n  // TODO: precompute where 1, 2, 4, 8, ... steps lead, then use the bits of k\n}\n",
    hints: [
      "Let jump[v] be the station after 2^j steps from v. Then the table for 2^(j+1) steps is jump[jump[v]] for every v: two jumps of 2^j make one jump of 2^(j+1).",
      "Write k in binary. For every bit j that is set, move from the current station through the 2^j table. The order of the bits does not matter, because all of them move you forward along the same path.",
      "You only need as many tables as k has bits, and you can keep a single table that you square after each bit, so memory stays O(n). Use Math.floor(k / 2 ** j) % 2 to read bit j, since k can exceed 32 bits and the bit operators would cut it off."
    ],
    solution: "function kthStep(next, start, k) {\n  let jump = next.slice();\n  let node = start;\n  let rest = k;\n  while (rest > 0) {\n    if (rest % 2 === 1) node = jump[node];\n    rest = Math.floor(rest / 2);\n    if (rest > 0) jump = jump.map((v) => jump[v]);\n  }\n  return node;\n}\n",
    tests: [
      {
        name: "small examples by hand",
        body: "const next = [1, 2, 0, 3];\nassert.equal(kthStep(next, 0, 1), 1);\nassert.equal(kthStep(next, 0, 2), 2);\nassert.equal(kthStep(next, 0, 3), 0);\nassert.equal(kthStep(next, 3, 5), 3);"
      },
      {
        name: "k = 0 stays put",
        body: "assert.equal(kthStep([2, 0, 1], 1, 0), 1);"
      },
      {
        name: "a self-loop never moves",
        body: "assert.equal(kthStep([0, 0], 0, 999999999999), 0);\nassert.equal(kthStep([1, 1], 1, 123456789), 1);"
      },
      {
        name: "a cycle with a huge k",
        body: "const next = [1, 2, 3, 4, 0];\nassert.equal(kthStep(next, 0, 1000000000000), 0);\nassert.equal(kthStep(next, 2, 1000000000001), 3);\nassert.equal(kthStep(next, 4, 1000000000003), 2);"
      },
      {
        name: "a tail that leads into a cycle",
        body: "const next = [1, 2, 3, 4, 2];\nassert.equal(kthStep(next, 0, 2), 2);\nassert.equal(kthStep(next, 0, 3), 3);\nassert.equal(kthStep(next, 0, 1000000000000), 4);"
      },
      {
        name: "does not change the input",
        body: "const next = [1, 2, 0];\nkthStep(next, 0, 77);\nassert.deepEqual(next, [1, 2, 0]);"
      },
      {
        name: "agrees with simulating the steps for moderate k",
        body: "let seed = 14;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 40; round++) {\n  const n = 1 + rnd(30);\n  const next = Array.from({ length: n }, () => rnd(n));\n  for (let q = 0; q < 40; q++) {\n    const start = rnd(n);\n    const k = rnd(500);\n    let cur = start;\n    for (let i = 0; i < k; i++) cur = next[cur];\n    assert.equal(kthStep(next, start, k), cur);\n  }\n}"
      },
      {
        name: "agrees with a cycle formula for k beyond 32 bits",
        body: "const n = 1000;\nconst next = Array.from({ length: n }, (_, i) => (i + 1) % n);\nfor (const k of [4294967296, 4294967297, 99999999999, 1000000000000]) {\n  assert.equal(kthStep(next, 7, k), (7 + (k % n)) % n);\n}"
      }
    ]
  },
  {
    id: "ex-sqrt-decomposition-range-sum",
    chapter: "dsa-sparse-table",
    level: "intermediate",
    title: "Range Sum With Updates (Square-Root Blocks)",
    brief: "<p>Build a <code>BlockSum</code> class that splits the array into blocks of about <code>sqrt(n)</code> elements.</p><ul><li><code>new BlockSum(nums)</code> — builds from a non-empty array in <b>O(n)</b></li><li><code>update(i, value)</code> — <b>replaces</b> <code>nums[i]</code> with <code>value</code>, in <b>O(1)</b></li><li><code>query(l, r)</code> — the sum of <code>nums[l..r]</code> inclusive, in <b>O(sqrt(n))</b></li><li>The last block may be shorter than the others, and a query may sit inside a single block</li><li>Do not change the array that was passed in</li></ul>",
    starter: "class BlockSum {\n  constructor(nums) {\n    // TODO: pick a block size near sqrt(n) and store one sum per block\n  }\n  update(i, value) {}\n  query(l, r) {}\n}\n",
    hints: [
      "Keep your own copy of the array, a block size B = max(1, floor(sqrt(n))), and an array blocks where blocks[b] is the sum of the elements with index in [b * B, b * B + B - 1]. There are ceil(n / B) blocks.",
      "To update, add (value - old) to the block that owns index i, then store the new value. Nothing else changes, so it is O(1).",
      "A query adds up three parts: single elements from l to the end of its block, whole blocks in between, and single elements from the start of r's block to r. When l and r are in the same block, just loop over the elements l to r and stop."
    ],
    solution: "class BlockSum {\n  constructor(nums) {\n    this.a = nums.slice();\n    this.size = Math.max(1, Math.floor(Math.sqrt(nums.length)));\n    this.blocks = new Array(Math.ceil(nums.length / this.size)).fill(0);\n    for (let i = 0; i < nums.length; i++) this.blocks[Math.floor(i / this.size)] += nums[i];\n  }\n  update(i, value) {\n    this.blocks[Math.floor(i / this.size)] += value - this.a[i];\n    this.a[i] = value;\n  }\n  query(l, r) {\n    const first = Math.floor(l / this.size);\n    const last = Math.floor(r / this.size);\n    let sum = 0;\n    if (first === last) {\n      for (let i = l; i <= r; i++) sum += this.a[i];\n      return sum;\n    }\n    for (let i = l; i < (first + 1) * this.size; i++) sum += this.a[i];\n    for (let b = first + 1; b < last; b++) sum += this.blocks[b];\n    for (let i = last * this.size; i <= r; i++) sum += this.a[i];\n    return sum;\n  }\n}\n",
    tests: [
      {
        name: "queries before any update",
        body: "const bs = new BlockSum([5, 2, 8, 1, 9, 3, 7, 4, 6, 10]);\nassert.equal(bs.query(0, 9), 55);\nassert.equal(bs.query(2, 7), 32);\nassert.equal(bs.query(3, 5), 13);\nassert.equal(bs.query(1, 2), 10);"
      },
      {
        name: "an update changes later queries",
        body: "const bs = new BlockSum([5, 2, 8, 1, 9, 3, 7, 4, 6, 10]);\nbs.update(4, 0);\nassert.equal(bs.query(2, 7), 23);\nassert.equal(bs.query(0, 9), 46);\nassert.equal(bs.query(4, 4), 0);"
      },
      {
        name: "one-element array",
        body: "const bs = new BlockSum([7]);\nassert.equal(bs.query(0, 0), 7);\nbs.update(0, -2);\nassert.equal(bs.query(0, 0), -2);"
      },
      {
        name: "a query inside one block and a query that touches the short last block",
        body: "const bs = new BlockSum([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);\nassert.equal(bs.query(0, 1), 2);\nassert.equal(bs.query(8, 10), 3);\nassert.equal(bs.query(10, 10), 1);\nassert.equal(bs.query(0, 10), 11);"
      },
      {
        name: "setting a value equal to the old one changes nothing",
        body: "const bs = new BlockSum([3, 4, 5, 6]);\nbs.update(2, 5);\nassert.equal(bs.query(0, 3), 18);\nbs.update(2, 9);\nbs.update(2, 5);\nassert.equal(bs.query(0, 3), 18);"
      },
      {
        name: "does not change the input array",
        body: "const nums = [1, 2, 3, 4];\nconst bs = new BlockSum(nums);\nbs.update(0, 100);\nassert.deepEqual(nums, [1, 2, 3, 4]);"
      },
      {
        name: "matches a brute-force mirror under random updates and queries",
        body: "let seed = 99;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 30; round++) {\n  const n = 1 + rnd(70);\n  const mirror = Array.from({ length: n }, () => rnd(100) - 30);\n  const bs = new BlockSum(mirror);\n  for (let step = 0; step < 100; step++) {\n    if (rnd(3) === 0) {\n      const i = rnd(n);\n      const v = rnd(100) - 30;\n      mirror[i] = v;\n      bs.update(i, v);\n    }\n    let l = rnd(n);\n    let r = rnd(n);\n    if (l > r) [l, r] = [r, l];\n    let sum = 0;\n    for (let i = l; i <= r; i++) sum += mirror[i];\n    assert.equal(bs.query(l, r), sum);\n  }\n}"
      }
    ]
  },
  {
    id: "ex-sqrt-range-add-range-sum",
    chapter: "dsa-sparse-table",
    level: "advanced",
    title: "Range Add and Range Sum (Lazy Blocks)",
    brief: "<p>Build a <code>BlockRangeAdd</code> class that supports adding a value to a whole range and summing a range, using blocks of about <code>sqrt(n)</code> elements.</p><ul><li><code>new BlockRangeAdd(nums)</code> — builds from a non-empty array</li><li><code>rangeAdd(l, r, delta)</code> — adds <code>delta</code> to every element in <code>l..r</code> inclusive, in <b>O(sqrt(n))</b></li><li><code>rangeSum(l, r)</code> — the sum of the elements in <code>l..r</code> inclusive, in <b>O(sqrt(n))</b></li><li>A block that is fully covered by an update must not be touched element by element</li><li>The last block may be shorter than the others; <code>delta</code> may be negative</li></ul>",
    starter: "class BlockRangeAdd {\n  constructor(nums) {\n    // TODO: per block, keep its current sum and a pending add for every element in it\n  }\n  rangeAdd(l, r, delta) {}\n  rangeSum(l, r) {}\n}\n",
    hints: [
      "For every block keep blockSum[b], the real sum of the block including pending adds, and lazy[b], a value that every element of the block is still owed but that is not yet written into the array.",
      "rangeAdd: for the partial blocks at either end, add delta to the individual elements and to blockSum. For every block fully inside the range, add delta to lazy[b] and add delta * (the block's length) to blockSum[b]. The last block may be shorter, so compute its length instead of assuming the block size.",
      "rangeSum: whole blocks contribute blockSum[b]. A partial block contributes a[i] + lazy[b] for each element i it contains in the range, because the pending add has not been written into a[i]."
    ],
    solution: "class BlockRangeAdd {\n  constructor(nums) {\n    this.n = nums.length;\n    this.a = nums.slice();\n    this.size = Math.max(1, Math.floor(Math.sqrt(this.n)));\n    const count = Math.ceil(this.n / this.size);\n    this.blockSum = new Array(count).fill(0);\n    this.lazy = new Array(count).fill(0);\n    for (let i = 0; i < this.n; i++) this.blockSum[Math.floor(i / this.size)] += nums[i];\n  }\n  length(b) {\n    return Math.min(this.size, this.n - b * this.size);\n  }\n  rangeAdd(l, r, delta) {\n    const first = Math.floor(l / this.size);\n    const last = Math.floor(r / this.size);\n    if (first === last) {\n      for (let i = l; i <= r; i++) {\n        this.a[i] += delta;\n        this.blockSum[first] += delta;\n      }\n      return;\n    }\n    for (let i = l; i < (first + 1) * this.size; i++) {\n      this.a[i] += delta;\n      this.blockSum[first] += delta;\n    }\n    for (let b = first + 1; b < last; b++) {\n      this.lazy[b] += delta;\n      this.blockSum[b] += delta * this.length(b);\n    }\n    for (let i = last * this.size; i <= r; i++) {\n      this.a[i] += delta;\n      this.blockSum[last] += delta;\n    }\n  }\n  rangeSum(l, r) {\n    const first = Math.floor(l / this.size);\n    const last = Math.floor(r / this.size);\n    let sum = 0;\n    if (first === last) {\n      for (let i = l; i <= r; i++) sum += this.a[i] + this.lazy[first];\n      return sum;\n    }\n    for (let i = l; i < (first + 1) * this.size; i++) sum += this.a[i] + this.lazy[first];\n    for (let b = first + 1; b < last; b++) sum += this.blockSum[b];\n    for (let i = last * this.size; i <= r; i++) sum += this.a[i] + this.lazy[last];\n    return sum;\n  }\n}\n",
    tests: [
      {
        name: "sums before any add",
        body: "const t = new BlockRangeAdd([1, 2, 3, 4, 5, 6, 7, 8, 9]);\nassert.equal(t.rangeSum(0, 8), 45);\nassert.equal(t.rangeSum(2, 5), 18);"
      },
      {
        name: "a range add over several whole blocks",
        body: "const t = new BlockRangeAdd([1, 2, 3, 4, 5, 6, 7, 8, 9]);\nt.rangeAdd(0, 8, 10);\nassert.equal(t.rangeSum(0, 8), 135);\nassert.equal(t.rangeSum(4, 4), 15);\nassert.equal(t.rangeSum(3, 6), 4 + 5 + 6 + 7 + 40);"
      },
      {
        name: "an add inside one block",
        body: "const t = new BlockRangeAdd([1, 2, 3, 4, 5, 6, 7, 8, 9]);\nt.rangeAdd(3, 4, 5);\nassert.equal(t.rangeSum(0, 8), 55);\nassert.equal(t.rangeSum(3, 3), 9);\nassert.equal(t.rangeSum(5, 8), 30);"
      },
      {
        name: "a negative delta",
        body: "const t = new BlockRangeAdd([10, 10, 10, 10, 10, 10]);\nt.rangeAdd(1, 4, -3);\nassert.equal(t.rangeSum(0, 5), 48);\nassert.equal(t.rangeSum(2, 3), 14);"
      },
      {
        name: "the short last block gets the right multiplier",
        body: "const t = new BlockRangeAdd([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);\nt.rangeAdd(0, 10, 1);\nassert.equal(t.rangeSum(0, 10), 11);\nassert.equal(t.rangeSum(9, 10), 2);\nt.rangeAdd(2, 10, 2);\nassert.equal(t.rangeSum(0, 10), 11 + 18);"
      },
      {
        name: "one-element array",
        body: "const t = new BlockRangeAdd([4]);\nt.rangeAdd(0, 0, 3);\nassert.equal(t.rangeSum(0, 0), 7);"
      },
      {
        name: "overlapping adds accumulate",
        body: "const t = new BlockRangeAdd([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);\nt.rangeAdd(0, 9, 1);\nt.rangeAdd(2, 7, 1);\nt.rangeAdd(4, 5, 1);\nassert.equal(t.rangeSum(0, 9), 10 + 6 + 2);\nassert.equal(t.rangeSum(4, 5), 6);"
      },
      {
        name: "matches a brute-force mirror under random adds and sums",
        body: "let seed = 123;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 30; round++) {\n  const n = 1 + rnd(70);\n  const mirror = Array.from({ length: n }, () => rnd(50) - 20);\n  const t = new BlockRangeAdd(mirror);\n  for (let step = 0; step < 100; step++) {\n    let l = rnd(n);\n    let r = rnd(n);\n    if (l > r) [l, r] = [r, l];\n    if (rnd(2) === 0) {\n      const d = rnd(21) - 10;\n      for (let i = l; i <= r; i++) mirror[i] += d;\n      t.rangeAdd(l, r, d);\n    } else {\n      let sum = 0;\n      for (let i = l; i <= r; i++) sum += mirror[i];\n      assert.equal(t.rangeSum(l, r), sum);\n    }\n  }\n}"
      }
    ]
  },
  {
    id: "ex-offline-count-in-value-range",
    chapter: "dsa-sparse-table",
    level: "advanced",
    title: "Count Values in a Range (Offline)",
    brief: "<p>Given an array <code>nums</code> and a list of queries <code>[l, r, lo, hi]</code>, return for every query how many elements of <code>nums[l..r]</code> (inclusive) have a value between <code>lo</code> and <code>hi</code> inclusive. Answers come back in the order the queries were given.</p><ul><li>The array never changes and all queries are known in advance, so you may reorder them</li><li>Values and bounds can be negative; <code>lo &gt; hi</code> is possible and counts nothing</li><li>Do not change the input arrays</li><li>Target: about <b>O((n + q) log n)</b> after sorting, not <b>O(n)</b> per query</li></ul>",
    starter: "function countInValueRange(nums, queries) {\n  // TODO: sort positions by value and queries by bound, then sweep with a Fenwick tree over positions\n}\n",
    hints: [
      "The count of values in [lo, hi] is the count of values <= hi minus the count of values <= lo - 1. So answer a simpler question: how many elements of nums[l..r] are <= x?",
      "Sort the positions of the array by value, and sort the simple questions by x. Sweep x upwards, and each time a position's value becomes <= x, switch that position on in a Fenwick tree over positions. The count for [l, r] is the number of switched-on positions in it.",
      "Sort an array of question numbers (not the questions themselves) so each answer can go back to its original slot. Each query becomes two questions: one with x = hi that adds, one with x = lo - 1 that subtracts. Skip both when lo > hi."
    ],
    solution: "function countInValueRange(nums, queries) {\n  const n = nums.length;\n  const byValue = nums.map((_, i) => i).sort((a, b) => nums[a] - nums[b]);\n  const asks = [];\n  queries.forEach(([l, r, lo, hi], q) => {\n    if (lo > hi) return;\n    asks.push({ q, l, r, x: hi, sign: 1 });\n    asks.push({ q, l, r, x: lo - 1, sign: -1 });\n  });\n  asks.sort((a, b) => a.x - b.x);\n  const tree = new Array(n + 1).fill(0);\n  const activate = (i) => {\n    for (let k = i + 1; k <= n; k += k & -k) tree[k]++;\n  };\n  const before = (i) => {\n    let sum = 0;\n    for (let k = i; k > 0; k -= k & -k) sum += tree[k];\n    return sum;\n  };\n  const answer = new Array(queries.length).fill(0);\n  let next = 0;\n  for (const ask of asks) {\n    while (next < n && nums[byValue[next]] <= ask.x) activate(byValue[next++]);\n    answer[ask.q] += ask.sign * (before(ask.r + 1) - before(ask.l));\n  }\n  return answer;\n}\n",
    tests: [
      {
        name: "the worked example",
        body: "assert.deepEqual(countInValueRange([4, 1, 3, 1, 5, 2], [[1, 4, 2, 3], [0, 5, 1, 1], [2, 3, 4, 9], [0, 2, 1, 4]]), [1, 2, 0, 3]);"
      },
      {
        name: "answers come back in query order, not sorted order",
        body: "assert.deepEqual(countInValueRange([5, 6, 7, 8], [[0, 3, 7, 8], [0, 3, 5, 5], [1, 2, 6, 7]]), [2, 1, 2]);"
      },
      {
        name: "an empty value range counts nothing",
        body: "assert.deepEqual(countInValueRange([1, 2, 3], [[0, 2, 3, 1], [0, 2, 2, 2]]), [0, 1]);"
      },
      {
        name: "negative values and bounds",
        body: "assert.deepEqual(countInValueRange([-5, -1, 0, -1, 4], [[0, 4, -1, -1], [0, 4, -10, 0], [1, 3, -2, 1]]), [2, 4, 3]);"
      },
      {
        name: "duplicates are all counted",
        body: "assert.deepEqual(countInValueRange([7, 7, 7, 7], [[0, 3, 7, 7], [1, 2, 7, 7], [0, 3, 8, 9]]), [4, 2, 0]);"
      },
      {
        name: "no queries and one-element array",
        body: "assert.deepEqual(countInValueRange([1, 2], []), []);\nassert.deepEqual(countInValueRange([9], [[0, 0, 9, 9], [0, 0, 10, 20]]), [1, 0]);"
      },
      {
        name: "does not change the inputs",
        body: "const nums = [3, 1, 2];\nconst queries = [[0, 2, 1, 2], [1, 2, 3, 3]];\ncountInValueRange(nums, queries);\nassert.deepEqual(nums, [3, 1, 2]);\nassert.deepEqual(queries, [[0, 2, 1, 2], [1, 2, 3, 3]]);"
      },
      {
        name: "agrees with a brute force on random inputs",
        body: "let seed = 55;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 40; round++) {\n  const n = 1 + rnd(50);\n  const nums = Array.from({ length: n }, () => rnd(15) - 5);\n  const queries = [];\n  for (let q = 0; q < 50; q++) {\n    let l = rnd(n);\n    let r = rnd(n);\n    if (l > r) [l, r] = [r, l];\n    queries.push([l, r, rnd(18) - 7, rnd(18) - 7]);\n  }\n  const expected = queries.map(([l, r, lo, hi]) => nums.slice(l, r + 1).filter((v) => v >= lo && v <= hi).length);\n  assert.deepEqual(countInValueRange(nums, queries), expected);\n}"
      }
    ]
  },
  {
    id: "ex-mo-powerful-array",
    chapter: "dsa-sparse-table",
    level: "advanced",
    title: "Powerful Array (Mo's Algorithm)",
    brief: "<p>For a subarray, define its <b>power</b> as the sum over every distinct value <code>v</code> in it of <code>cnt(v) * cnt(v) * v</code>, where <code>cnt(v)</code> is how many times <code>v</code> appears in that subarray. For example, <code>[1, 2, 1]</code> has power <code>2*2*1 + 1*1*2 = 6</code>.</p><p>Given an array <code>nums</code> of positive integers and a list <code>queries</code> of <code>[l, r]</code> pairs (inclusive), return the power of <code>nums[l..r]</code> for every query, in the order the queries were given.</p><ul><li>The array never changes and all queries are known in advance</li><li>Moving the window by one element changes the power by a simple formula; Mo's algorithm sorts the queries so that the window moves little in total</li><li>Target: about <b>O((n + q) sqrt(n))</b> element moves</li></ul>",
    starter: "function powerfulArray(nums, queries) {\n  // TODO: sort query numbers by (block of l, r), keep a count per value and a running power\n}\n",
    hints: [
      "Keep count[v] for the current window and a running total. Adding one copy of v when count[v] is c changes the total by (c + 1)^2 * v - c^2 * v = (2c + 1) * v. Removing one copy when count is c changes it by -(2c - 1) * v.",
      "Sort an array of query numbers: first by floor(l / B) with B = max(1, floor(sqrt(n))), then by r (ascending). Move a window [curL, curR], starting empty as curL = 0, curR = -1, to each query in that order, and store each answer at the query's original index.",
      "Move the pointers in the order: grow left, grow right, shrink left, shrink right. Growing first guarantees the window never has a negative length, so you never remove an element that was not added."
    ],
    solution: "function powerfulArray(nums, queries) {\n  const block = Math.max(1, Math.floor(Math.sqrt(nums.length)));\n  const order = queries.map((_, q) => q).sort((a, b) => {\n    const blockA = Math.floor(queries[a][0] / block);\n    const blockB = Math.floor(queries[b][0] / block);\n    return blockA !== blockB ? blockA - blockB : queries[a][1] - queries[b][1];\n  });\n  const count = new Map();\n  let power = 0;\n  const add = (i) => {\n    const c = count.get(nums[i]) ?? 0;\n    power += (2 * c + 1) * nums[i];\n    count.set(nums[i], c + 1);\n  };\n  const remove = (i) => {\n    const c = count.get(nums[i]);\n    power -= (2 * c - 1) * nums[i];\n    count.set(nums[i], c - 1);\n  };\n  let curL = 0;\n  let curR = -1;\n  const answer = new Array(queries.length);\n  for (const q of order) {\n    const [l, r] = queries[q];\n    while (curL > l) add(--curL);\n    while (curR < r) add(++curR);\n    while (curL < l) remove(curL++);\n    while (curR > r) remove(curR--);\n    answer[q] = power;\n  }\n  return answer;\n}\n",
    tests: [
      {
        name: "the worked example from the statement",
        body: "assert.deepEqual(powerfulArray([1, 2, 1], [[0, 2], [0, 0], [1, 1], [0, 1]]), [6, 1, 2, 3]);"
      },
      {
        name: "every element equal",
        body: "assert.deepEqual(powerfulArray([3, 3, 3, 3], [[0, 3], [1, 2], [2, 2]]), [48, 12, 3]);"
      },
      {
        name: "all distinct values give the plain sum",
        body: "assert.deepEqual(powerfulArray([4, 9, 2, 7, 5], [[0, 4], [1, 3], [2, 2]]), [27, 18, 2]);"
      },
      {
        name: "answers come back in query order",
        body: "assert.deepEqual(powerfulArray([2, 2, 5, 2, 5, 5], [[4, 5], [0, 5], [0, 1], [2, 4]]), [20, 63, 8, 22]);"
      },
      {
        name: "one-element array and a repeated query",
        body: "assert.deepEqual(powerfulArray([6], [[0, 0], [0, 0]]), [6, 6]);"
      },
      {
        name: "no queries",
        body: "assert.deepEqual(powerfulArray([1, 2, 3], []), []);"
      },
      {
        name: "does not change the inputs",
        body: "const nums = [1, 2, 1, 3];\nconst queries = [[2, 3], [0, 3]];\npowerfulArray(nums, queries);\nassert.deepEqual(nums, [1, 2, 1, 3]);\nassert.deepEqual(queries, [[2, 3], [0, 3]]);"
      },
      {
        name: "agrees with a brute force on random inputs",
        body: "let seed = 2;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 40; round++) {\n  const n = 1 + rnd(60);\n  const nums = Array.from({ length: n }, () => 1 + rnd(6));\n  const queries = [];\n  for (let q = 0; q < 60; q++) {\n    let l = rnd(n);\n    let r = rnd(n);\n    if (l > r) [l, r] = [r, l];\n    queries.push([l, r]);\n  }\n  const expected = queries.map(([l, r]) => {\n    const c = new Map();\n    for (let i = l; i <= r; i++) c.set(nums[i], (c.get(nums[i]) ?? 0) + 1);\n    let total = 0;\n    for (const [v, k] of c) total += k * k * v;\n    return total;\n  });\n  assert.deepEqual(powerfulArray(nums, queries), expected);\n}"
      },
      {
        name: "many queries on a larger array",
        body: "let seed = 3;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst n = 3000;\nconst nums = Array.from({ length: n }, () => 1 + rnd(40));\nconst queries = [];\nfor (let q = 0; q < 3000; q++) {\n  let l = rnd(n);\n  let r = rnd(n);\n  if (l > r) [l, r] = [r, l];\n  queries.push([l, r]);\n}\nconst got = powerfulArray(nums, queries);\nfor (let q = 0; q < 40; q++) {\n  const [l, r] = queries[q * 70];\n  const c = new Map();\n  for (let i = l; i <= r; i++) c.set(nums[i], (c.get(nums[i]) ?? 0) + 1);\n  let total = 0;\n  for (const [v, k] of c) total += k * k * v;\n  assert.equal(got[q * 70], total);\n}"
      }
    ]
  }
];
