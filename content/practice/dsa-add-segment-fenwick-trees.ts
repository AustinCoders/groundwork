import type { Exercise } from "../types";

export const dsaAddSegmentFenwickTrees: Exercise[] = [
  {
    "id": "ex-fenwick-kth-smallest",
    "chapter": "dsa-segment-fenwick-trees",
    "level": "advanced",
    "title": "K-th Smallest in a Changing Multiset",
    "brief": "<p>You maintain a multiset of integers, each between <code>1</code> and <code>maxValue</code>. Write <code>kthSmallest(maxValue, ops)</code>, where each operation is one of:</p><ul><li><code>[\"add\", x]</code>: insert one copy of <code>x</code></li><li><code>[\"remove\", x]</code>: remove one copy of <code>x</code>; does nothing if <code>x</code> is not present</li><li><code>[\"kth\", k]</code>: report the <code>k</code>-th smallest element (<code>k = 1</code> is the smallest, equal values count separately), or <code>-1</code> if the multiset has fewer than <code>k</code> elements</li></ul><p>Return the answers to the <code>\"kth\"</code> operations, in order. Aim for O(log maxValue) per operation: sorting after every change is too slow.</p>",
    "starter": "function kthSmallest(maxValue, ops) {\n  // TODO: a Fenwick tree of counts, and a walk down it for the k-th\n}\n",
    "hints": [
      "Keep one count per value. 'The k-th smallest' is then the smallest value whose prefix count reaches k.",
      "A Fenwick tree over the counts gives prefix counts in O(log n), but a binary search over them costs O(log^2 n). You can do the search inside the tree: try jumps of the largest power of two first, then smaller ones.",
      "Start with pos = 0 and remaining = k. For step = highest power of two down to 1: if pos + step is within range and tree[pos + step] < remaining, move pos forward by step and subtract that cell from remaining. The answer is pos + 1. Track the total size so a k that is too large returns -1, and keep a plain count array so removing an absent value does nothing."
    ],
    "solution": "function kthSmallest(maxValue, ops) {\n  const n = maxValue;\n  const tree = new Array(n + 1).fill(0);\n  const count = new Array(n + 1).fill(0);\n  let size = 0;\n  let top = 1;\n  while (top * 2 <= n) top *= 2;\n  const update = (i, delta) => {\n    for (let k = i; k <= n; k += k & -k) tree[k] += delta;\n  };\n  const out = [];\n  for (const [op, x] of ops) {\n    if (op === \"add\") {\n      update(x, 1);\n      count[x]++;\n      size++;\n    } else if (op === \"remove\") {\n      if (count[x] > 0) {\n        update(x, -1);\n        count[x]--;\n        size--;\n      }\n    } else {\n      if (x > size || x < 1) {\n        out.push(-1);\n        continue;\n      }\n      let pos = 0;\n      let remaining = x;\n      for (let step = top; step > 0; step >>= 1) {\n        if (pos + step <= n && tree[pos + step] < remaining) {\n          pos += step;\n          remaining -= tree[pos];\n        }\n      }\n      out.push(pos + 1);\n    }\n  }\n  return out;\n}\n",
    "tests": [
      {
        "name": "the worked example",
        "body": "assert.deepEqual(kthSmallest(8, [[\"add\", 1], [\"add\", 3], [\"add\", 3], [\"add\", 5], [\"add\", 8], [\"add\", 8], [\"add\", 8], [\"kth\", 4], [\"kth\", 1], [\"kth\", 7]]), [5, 1, 8]);"
      },
      {
        "name": "equal values count separately",
        "body": "assert.deepEqual(kthSmallest(5, [[\"add\", 2], [\"add\", 2], [\"add\", 2], [\"kth\", 1], [\"kth\", 2], [\"kth\", 3]]), [2, 2, 2]);"
      },
      {
        "name": "k larger than the size gives -1",
        "body": "assert.deepEqual(kthSmallest(5, [[\"kth\", 1], [\"add\", 4], [\"kth\", 1], [\"kth\", 2]]), [-1, 4, -1]);"
      },
      {
        "name": "removals change the answer",
        "body": "assert.deepEqual(kthSmallest(10, [[\"add\", 3], [\"add\", 7], [\"add\", 9], [\"kth\", 2], [\"remove\", 7], [\"kth\", 2], [\"remove\", 3], [\"kth\", 1]]), [7, 9, 9]);"
      },
      {
        "name": "removing a missing value is a no-op",
        "body": "assert.deepEqual(kthSmallest(5, [[\"remove\", 2], [\"add\", 2], [\"remove\", 3], [\"kth\", 1], [\"remove\", 2], [\"remove\", 2], [\"kth\", 1]]), [2, -1]);"
      },
      {
        "name": "the range is a single value",
        "body": "assert.deepEqual(kthSmallest(1, [[\"add\", 1], [\"add\", 1], [\"kth\", 2], [\"kth\", 3]]), [1, -1]);"
      },
      {
        "name": "a maxValue that is not a power of two",
        "body": "assert.deepEqual(kthSmallest(13, [[\"add\", 13], [\"add\", 12], [\"add\", 1], [\"kth\", 3], [\"kth\", 2], [\"kth\", 1]]), [13, 12, 1]);"
      },
      {
        "name": "agrees with sorting after every change on random operations",
        "body": "let seed = 11;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nconst maxValue = 37;\nconst ops = [];\nconst model = [];\nconst expected = [];\nfor (let step = 0; step < 600; step++) {\n  const roll = rnd();\n  if (roll < 0.45) {\n    const x = ri(1, maxValue);\n    ops.push([\"add\", x]);\n    model.push(x);\n  } else if (roll < 0.7) {\n    const x = ri(1, maxValue);\n    ops.push([\"remove\", x]);\n    const at = model.indexOf(x);\n    if (at !== -1) model.splice(at, 1);\n  } else {\n    const k = ri(1, model.length + 2);\n    ops.push([\"kth\", k]);\n    const sorted = model.slice().sort((a, b) => a - b);\n    expected.push(k <= sorted.length ? sorted[k - 1] : -1);\n  }\n}\nassert.deepEqual(kthSmallest(maxValue, ops), expected);"
      }
    ]
  },
  {
    "id": "ex-range-add-range-sum",
    "chapter": "dsa-segment-fenwick-trees",
    "level": "advanced",
    "title": "Range Add, Range Sum",
    "brief": "<p>An array of <code>n</code> zeros receives two kinds of operations:</p><ul><li><code>[\"add\", l, r, x]</code>: add <code>x</code> to every element from index <code>l</code> to <code>r</code>, both included</li><li><code>[\"sum\", l, r]</code>: report the sum of the elements from <code>l</code> to <code>r</code>, both included</li></ul><p>Write <code>rangeAddRangeSum(n, ops)</code> returning the answers to the <code>\"sum\"</code> operations, in order. Each operation should take O(log n). Hint for the structure: differences make range updates into two point updates.</p>",
    "starter": "function rangeAddRangeSum(n, ops) {\n  // TODO\n}\n",
    "hints": [
      "Let d[j] = a[j] - a[j-1]. An 'add x on [l, r]' changes only d[l] (by +x) and d[r + 1] (by -x). The element a[k] is the sum of d[0..k].",
      "Add up the elements a[0..i] and count how often each d[j] appears: it is in a[k] for every k from j to i, so i - j + 1 times. The prefix sum is (i + 1) * sum(d[0..i]) - sum(j * d[j] for j in 0..i).",
      "Keep two Fenwick trees: one over d[j], one over j * d[j]. A range add is two point updates in each. A prefix sum is (i + 1) * first.prefix(i) - second.prefix(i); a range sum is the difference of two prefix sums (the prefix before index 0 is 0)."
    ],
    "solution": "function rangeAddRangeSum(n, ops) {\n  const first = new Array(n + 2).fill(0);\n  const second = new Array(n + 2).fill(0);\n  const add = (tree, index, delta) => {\n    for (let k = index + 1; k <= n; k += k & -k) tree[k] += delta;\n  };\n  const prefix = (tree, index) => {\n    let total = 0;\n    for (let k = index + 1; k > 0; k -= k & -k) total += tree[k];\n    return total;\n  };\n  const addAt = (j, x) => {\n    add(first, j, x);\n    add(second, j, x * j);\n  };\n  const prefixSum = (i) => (i < 0 ? 0 : (i + 1) * prefix(first, i) - prefix(second, i));\n  const out = [];\n  for (const op of ops) {\n    if (op[0] === \"add\") {\n      const [, l, r, x] = op;\n      addAt(l, x);\n      if (r + 1 < n) addAt(r + 1, -x);\n    } else {\n      const [, l, r] = op;\n      out.push(prefixSum(r) - prefixSum(l - 1));\n    }\n  }\n  return out;\n}\n",
    "tests": [
      {
        "name": "the worked example",
        "body": "assert.deepEqual(rangeAddRangeSum(5, [[\"add\", 1, 3, 5], [\"sum\", 0, 2], [\"sum\", 0, 4], [\"sum\", 3, 4]]), [10, 15, 5]);"
      },
      {
        "name": "starts as all zeros",
        "body": "assert.deepEqual(rangeAddRangeSum(4, [[\"sum\", 0, 3], [\"sum\", 2, 2]]), [0, 0]);"
      },
      {
        "name": "overlapping adds stack up",
        "body": "assert.deepEqual(rangeAddRangeSum(5, [[\"add\", 0, 2, 1], [\"add\", 1, 4, 2], [\"sum\", 0, 4], [\"sum\", 1, 2], [\"sum\", 4, 4]]), [11, 6, 2]);"
      },
      {
        "name": "an add that reaches the last index",
        "body": "assert.deepEqual(rangeAddRangeSum(3, [[\"add\", 1, 2, 4], [\"sum\", 0, 2], [\"sum\", 2, 2]]), [8, 4]);"
      },
      {
        "name": "negative adds",
        "body": "assert.deepEqual(rangeAddRangeSum(4, [[\"add\", 0, 3, 5], [\"add\", 1, 2, -7], [\"sum\", 0, 3], [\"sum\", 1, 1]]), [6, -2]);"
      },
      {
        "name": "a single element array",
        "body": "assert.deepEqual(rangeAddRangeSum(1, [[\"add\", 0, 0, 9], [\"add\", 0, 0, 1], [\"sum\", 0, 0]]), [10]);"
      },
      {
        "name": "a large array stays fast",
        "body": "const n = 100000;\nconst ops = [];\nfor (let i = 0; i < 50000; i++) ops.push([\"add\", i, n - 1 - i, 1]);\nops.push([\"sum\", 0, n - 1]);\nlet expected = 0;\nfor (let i = 0; i < 50000; i++) expected += n - 2 * i;\nassert.deepEqual(rangeAddRangeSum(n, ops), [expected]);"
      },
      {
        "name": "agrees with a plain array on random operations",
        "body": "let seed = 11;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nconst n = 23;\nconst plain = new Array(n).fill(0);\nconst ops = [];\nconst expected = [];\nfor (let step = 0; step < 500; step++) {\n  const l = ri(0, n - 1);\n  const r = ri(l, n - 1);\n  if (rnd() < 0.5) {\n    const x = ri(-9, 9);\n    ops.push([\"add\", l, r, x]);\n    for (let i = l; i <= r; i++) plain[i] += x;\n  } else {\n    ops.push([\"sum\", l, r]);\n    let s = 0;\n    for (let i = l; i <= r; i++) s += plain[i];\n    expected.push(s);\n  }\n}\nassert.deepEqual(rangeAddRangeSum(n, ops), expected);"
      }
    ]
  },
  {
    "id": "ex-maximum-subarray-with-updates",
    "chapter": "dsa-segment-fenwick-trees",
    "level": "advanced",
    "title": "Maximum Subarray With Updates",
    "brief": "<p>Given an array <code>nums</code>, process these operations in order:</p><ul><li><code>[\"set\", i, v]</code>: set <code>nums[i] = v</code></li><li><code>[\"best\", l, r]</code>: report the largest sum of a <b>non-empty</b> contiguous subarray lying entirely inside <code>nums[l..r]</code> (both ends included)</li></ul><p>Write <code>maxSubarrayQueries(nums, ops)</code> returning the answers to the <code>\"best\"</code> operations. A single-pass Kadane scan per query is O(n) each; aim for O(log n) per operation. Do not change the array you are given.</p>",
    "starter": "function maxSubarrayQueries(nums, ops) {\n  // TODO\n}\n",
    "hints": [
      "Kadane's scan keeps a running state while walking left to right. A segment tree needs the same information per range, so two halves can be combined without re-reading either.",
      "Store four numbers per node: the total sum, the best run starting at the left end (prefix), the best run ending at the right end (suffix), and the best run anywhere. The best run of a merged range is the best of the left's best, the right's best, and the left's suffix plus the right's prefix.",
      "The merge is not symmetric: the left child must come first. A range query that overlaps nothing returns null, and you merge the left and right results only when both exist. Copy the input array before you build the tree."
    ],
    "solution": "function maxSubarrayQueries(nums, ops) {\n  const n = nums.length;\n  const values = nums.slice();\n  const tree = new Array(4 * n);\n  const leaf = (v) => ({ sum: v, prefix: v, suffix: v, best: v });\n  const merge = (a, b) => ({\n    sum: a.sum + b.sum,\n    prefix: Math.max(a.prefix, a.sum + b.prefix),\n    suffix: Math.max(b.suffix, b.sum + a.suffix),\n    best: Math.max(a.best, b.best, a.suffix + b.prefix),\n  });\n  const build = (node, lo, hi) => {\n    if (lo === hi) {\n      tree[node] = leaf(values[lo]);\n      return;\n    }\n    const mid = (lo + hi) >> 1;\n    build(2 * node, lo, mid);\n    build(2 * node + 1, mid + 1, hi);\n    tree[node] = merge(tree[2 * node], tree[2 * node + 1]);\n  };\n  const update = (node, lo, hi, i, v) => {\n    if (lo === hi) {\n      tree[node] = leaf(v);\n      return;\n    }\n    const mid = (lo + hi) >> 1;\n    if (i <= mid) update(2 * node, lo, mid, i, v);\n    else update(2 * node + 1, mid + 1, hi, i, v);\n    tree[node] = merge(tree[2 * node], tree[2 * node + 1]);\n  };\n  const query = (node, lo, hi, l, r) => {\n    if (r < lo || hi < l) return null;\n    if (l <= lo && hi <= r) return tree[node];\n    const mid = (lo + hi) >> 1;\n    const left = query(2 * node, lo, mid, l, r);\n    const right = query(2 * node + 1, mid + 1, hi, l, r);\n    if (left === null) return right;\n    if (right === null) return left;\n    return merge(left, right);\n  };\n  if (n > 0) build(1, 0, n - 1);\n  const out = [];\n  for (const op of ops) {\n    if (op[0] === \"set\") update(1, 0, n - 1, op[1], op[2]);\n    else out.push(query(1, 0, n - 1, op[1], op[2]).best);\n  }\n  return out;\n}\n",
    "tests": [
      {
        "name": "the whole array",
        "body": "assert.deepEqual(maxSubarrayQueries([1, -3, 4, 2], [[\"best\", 0, 3]]), [6]);"
      },
      {
        "name": "an update changes the answer",
        "body": "assert.deepEqual(maxSubarrayQueries([1, -3, 4, 2], [[\"best\", 0, 3], [\"set\", 1, 5], [\"best\", 0, 3]]), [6, 12]);"
      },
      {
        "name": "all negative: the best run is a single element",
        "body": "assert.deepEqual(maxSubarrayQueries([-5, -2, -9], [[\"best\", 0, 2], [\"best\", 0, 0], [\"best\", 2, 2]]), [-2, -5, -9]);"
      },
      {
        "name": "a query on a sub-range ignores the rest",
        "body": "assert.deepEqual(maxSubarrayQueries([10, -1, -1, 3, -20, 4], [[\"best\", 1, 3], [\"best\", 4, 5], [\"best\", 0, 5]]), [3, 4, 11]);"
      },
      {
        "name": "a run that crosses the middle of a node",
        "body": "assert.deepEqual(maxSubarrayQueries([-9, 2, 3, 4, -9, 1, 1, 1], [[\"best\", 0, 7], [\"best\", 2, 6]]), [9, 7]);"
      },
      {
        "name": "a single element array",
        "body": "assert.deepEqual(maxSubarrayQueries([7], [[\"best\", 0, 0], [\"set\", 0, -3], [\"best\", 0, 0]]), [7, -3]);"
      },
      {
        "name": "does not change the input array",
        "body": "const nums = [1, 2, 3];\nmaxSubarrayQueries(nums, [[\"set\", 0, 100], [\"best\", 0, 2]]);\nassert.deepEqual(nums, [1, 2, 3]);"
      },
      {
        "name": "agrees with Kadane's scan on random operations",
        "body": "let seed = 11;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nconst n = 17;\nconst plain = Array.from({ length: n }, () => ri(-8, 8));\nconst start = plain.slice();\nconst ops = [];\nconst expected = [];\nfor (let step = 0; step < 400; step++) {\n  if (rnd() < 0.4) {\n    const i = ri(0, n - 1);\n    const v = ri(-8, 8);\n    ops.push([\"set\", i, v]);\n    plain[i] = v;\n  } else {\n    const l = ri(0, n - 1);\n    const r = ri(l, n - 1);\n    ops.push([\"best\", l, r]);\n    let best = -Infinity;\n    let run = 0;\n    for (let i = l; i <= r; i++) {\n      run = Math.max(plain[i], run + plain[i]);\n      best = Math.max(best, run);\n    }\n    expected.push(best);\n  }\n}\nassert.deepEqual(maxSubarrayQueries(start, ops), expected);"
      }
    ]
  },
  {
    "id": "ex-reverse-pairs",
    "chapter": "dsa-segment-fenwick-trees",
    "level": "advanced",
    "title": "Reverse Pairs",
    "brief": "<p>Given an integer array <code>nums</code>, count the <b>reverse pairs</b>: pairs of indices <code>i &lt; j</code> with <code>nums[i] &gt; 2 * nums[j]</code>. Write <code>reversePairs(nums)</code>.</p><ul><li>Values may be negative or zero, and may repeat</li><li>An empty array has no pairs</li><li>Brute force is O(n^2); target O(n log n)</li></ul>",
    "starter": "function reversePairs(nums) {\n  // TODO\n}\n",
    "hints": [
      "Sweep j from left to right. For each j you want the number of earlier elements that are larger than 2 * nums[j]. That is a counting question over values, which a Fenwick tree answers.",
      "Compress the values: sort the distinct ones and give each a rank. Keep a Fenwick tree of how many earlier elements have each rank. The number of earlier elements that are at most 2 * nums[j] comes from one prefix query, after finding how many distinct values are at most 2 * nums[j] with a binary search.",
      "The answer for j is (number of elements inserted so far) minus (number of inserted elements at most 2 * nums[j]). Insert nums[j] after counting. Merge sort with a counting step across the halves is another O(n log n) solution."
    ],
    "solution": "function reversePairs(nums) {\n  const sorted = [...new Set(nums)].sort((a, b) => a - b);\n  const m = sorted.length;\n  const tree = new Array(m + 1).fill(0);\n  const insert = (rank) => {\n    for (let k = rank + 1; k <= m; k += k & -k) tree[k]++;\n  };\n  const upTo = (rank) => {\n    let total = 0;\n    for (let k = rank + 1; k > 0; k -= k & -k) total += tree[k];\n    return total;\n  };\n  const countAtMost = (x) => {\n    let lo = 0;\n    let hi = m;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (sorted[mid] <= x) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  };\n  const rankOf = (x) => {\n    let lo = 0;\n    let hi = m;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (sorted[mid] < x) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  };\n  let pairs = 0;\n  for (let j = 0; j < nums.length; j++) {\n    const limit = countAtMost(2 * nums[j]);\n    const notBigger = limit > 0 ? upTo(limit - 1) : 0;\n    pairs += j - notBigger;\n    insert(rankOf(nums[j]));\n  }\n  return pairs;\n}\n",
    "tests": [
      {
        "name": "the first example",
        "body": "assert.equal(reversePairs([1, 3, 2, 3, 1]), 2);"
      },
      {
        "name": "the second example",
        "body": "assert.equal(reversePairs([2, 4, 3, 5, 1]), 3);"
      },
      {
        "name": "empty and single",
        "body": "assert.equal(reversePairs([]), 0);\nassert.equal(reversePairs([5]), 0);"
      },
      {
        "name": "strictly twice is not enough",
        "body": "assert.equal(reversePairs([4, 2]), 0);\nassert.equal(reversePairs([5, 2]), 1);"
      },
      {
        "name": "negative values",
        "body": "assert.equal(reversePairs([-5, -5]), 1);\nassert.equal(reversePairs([-4, -2]), 0);\nassert.equal(reversePairs([-3, -2]), 1);\nassert.equal(reversePairs([0, 0, 0]), 0);"
      },
      {
        "name": "a descending array: only values more than twice as big pair up",
        "body": "assert.equal(reversePairs([8, 4, 2, 1]), 3);"
      },
      {
        "name": "large values do not break the doubling",
        "body": "const big = 1000000000;\nassert.equal(reversePairs([big, -big, big, 1]), 3);"
      },
      {
        "name": "agrees with brute force on random arrays",
        "body": "let seed = 11;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nfor (let round = 0; round < 300; round++) {\n  const n = ri(0, 14);\n  const nums = Array.from({ length: n }, () => ri(-9, 9));\n  let expected = 0;\n  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (nums[i] > 2 * nums[j]) expected++;\n  assert.equal(reversePairs(nums), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-count-of-range-sum",
    "chapter": "dsa-segment-fenwick-trees",
    "level": "advanced",
    "title": "Count of Range Sum",
    "brief": "<p>Given an integer array <code>nums</code> and two integers <code>lower</code> and <code>upper</code> (<code>lower &lt;= upper</code>), count the contiguous, non-empty subarrays whose sum is between <code>lower</code> and <code>upper</code>, both included. Write <code>countRangeSum(nums, lower, upper)</code>.</p><ul><li>Two subarrays with different start or end positions count separately</li><li>Values may be negative, so a sliding window does not work</li><li>Target O(n log n)</li></ul>",
    "starter": "function countRangeSum(nums, lower, upper) {\n  // TODO\n}\n",
    "hints": [
      "Use prefix sums P with P[0] = 0. The sum of the subarray after index i up to index j is P[j] - P[i]. So for each j you need the earlier prefix values P[i] in the window [P[j] - upper, P[j] - lower].",
      "That is a range-count query over the values already seen, so sweep j from left to right, keep a Fenwick tree indexed by the rank of each prefix value, and count the window as a difference of two prefix counts.",
      "Compress the distinct prefix values first. Use 'how many values are below x' for the lower edge and 'how many values are at most x' for the upper edge. Insert P[j] after counting, so the subarray is never empty and never pairs with itself."
    ],
    "solution": "function countRangeSum(nums, lower, upper) {\n  const prefix = [0];\n  for (const x of nums) prefix.push(prefix[prefix.length - 1] + x);\n  const sorted = [...new Set(prefix)].sort((a, b) => a - b);\n  const m = sorted.length;\n  const tree = new Array(m + 1).fill(0);\n  const insert = (rank) => {\n    for (let k = rank + 1; k <= m; k += k & -k) tree[k]++;\n  };\n  const upTo = (rank) => {\n    let total = 0;\n    for (let k = rank + 1; k > 0; k -= k & -k) total += tree[k];\n    return total;\n  };\n  const countLess = (x) => {\n    let lo = 0;\n    let hi = m;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (sorted[mid] < x) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  };\n  const countAtMost = (x) => {\n    let lo = 0;\n    let hi = m;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (sorted[mid] <= x) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  };\n  let total = 0;\n  for (const p of prefix) {\n    const from = countLess(p - upper);\n    const to = countAtMost(p - lower);\n    total += (to > 0 ? upTo(to - 1) : 0) - (from > 0 ? upTo(from - 1) : 0);\n    insert(countLess(p));\n  }\n  return total;\n}\n",
    "tests": [
      {
        "name": "the first example",
        "body": "assert.equal(countRangeSum([-2, 5, -1], -2, 2), 3);"
      },
      {
        "name": "a single zero",
        "body": "assert.equal(countRangeSum([0], 0, 0), 1);"
      },
      {
        "name": "empty array has no subarray",
        "body": "assert.equal(countRangeSum([], 0, 0), 0);"
      },
      {
        "name": "both bounds are included",
        "body": "assert.equal(countRangeSum([3, 3], 3, 3), 2);\nassert.equal(countRangeSum([3, 3], 6, 6), 1);\nassert.equal(countRangeSum([3, 3], 4, 5), 0);"
      },
      {
        "name": "negative values",
        "body": "assert.equal(countRangeSum([-1, -1, -1], -2, -1), 5);"
      },
      {
        "name": "a wide window counts every subarray",
        "body": "assert.equal(countRangeSum([1, 2, 3, 4], -100, 100), 10);"
      },
      {
        "name": "large sums do not overflow the compression",
        "body": "const big = 2000000000;\nassert.equal(countRangeSum([big, big, -big], big, big), 3);"
      },
      {
        "name": "agrees with brute force on random arrays",
        "body": "let seed = 11;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nfor (let round = 0; round < 300; round++) {\n  const n = ri(0, 12);\n  const nums = Array.from({ length: n }, () => ri(-8, 8));\n  const lower = ri(-8, 4);\n  const upper = lower + ri(0, 9);\n  let expected = 0;\n  for (let i = 0; i < n; i++) {\n    let sum = 0;\n    for (let j = i; j < n; j++) {\n      sum += nums[j];\n      if (sum >= lower && sum <= upper) expected++;\n    }\n  }\n  assert.equal(countRangeSum(nums, lower, upper), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-my-calendar-iii",
    "chapter": "dsa-segment-fenwick-trees",
    "level": "advanced",
    "title": "My Calendar III",
    "brief": "<p>Implement a class <code>MyCalendarThree</code>. Its method <code>book(startTime, endTime)</code> adds the booking <code>[startTime, endTime)</code> (the start is included and the end is not) and returns the largest number of bookings that overlap at any single moment so far, counting every booking made until now.</p><ul><li>Times are integers from <code>0</code> up to <code>1000000000</code>, so you cannot allocate an array over time</li><li>Bookings arrive one at a time; you do not know the future ones</li><li><code>[10, 20)</code> and <code>[20, 30)</code> do not overlap</li></ul>",
    "starter": "class MyCalendarThree {\n  constructor() {\n    // TODO\n  }\n\n  book(startTime, endTime) {\n    // TODO\n  }\n}\n",
    "hints": [
      "You need range add and a global maximum. A segment tree can do both, but the coordinate range is huge, so create nodes only when an update walks into them.",
      "Each node stores max (the largest overlap anywhere in its range, counting the tags on and below it) and add (the number of bookings that covered this whole node). A booking that fully covers a node does max++ and add++, then stops.",
      "After recursing into both children, set node.max = node.add + Math.max(left.max, right.max). Nothing is ever pushed down. The answer is the root's max. Use the closed range [start, end - 1] inside the tree."
    ],
    "solution": "class MyCalendarThree {\n  constructor() {\n    this.root = { max: 0, add: 0, left: null, right: null };\n  }\n\n  book(startTime, endTime) {\n    this.addRange(this.root, 0, 1000000000, startTime, endTime - 1);\n    return this.root.max;\n  }\n\n  addRange(node, lo, hi, l, r) {\n    if (r < lo || hi < l) return;\n    if (l <= lo && hi <= r) {\n      node.max++;\n      node.add++;\n      return;\n    }\n    const mid = Math.floor((lo + hi) / 2);\n    if (node.left === null) node.left = { max: 0, add: 0, left: null, right: null };\n    if (node.right === null) node.right = { max: 0, add: 0, left: null, right: null };\n    this.addRange(node.left, lo, mid, l, r);\n    this.addRange(node.right, mid + 1, hi, l, r);\n    node.max = node.add + Math.max(node.left.max, node.right.max);\n  }\n}\n",
    "tests": [
      {
        "name": "the first example",
        "body": "const cal = new MyCalendarThree();\nassert.deepEqual([[10, 20], [50, 60], [10, 40], [5, 15], [5, 10], [25, 55]].map(([s, e]) => cal.book(s, e)), [1, 1, 2, 3, 3, 3]);"
      },
      {
        "name": "back-to-back bookings do not overlap",
        "body": "const cal = new MyCalendarThree();\nassert.equal(cal.book(10, 20), 1);\nassert.equal(cal.book(20, 30), 1);\nassert.equal(cal.book(0, 10), 1);"
      },
      {
        "name": "identical bookings stack up",
        "body": "const cal = new MyCalendarThree();\nassert.equal(cal.book(3, 9), 1);\nassert.equal(cal.book(3, 9), 2);\nassert.equal(cal.book(3, 9), 3);"
      },
      {
        "name": "a booking of length one",
        "body": "const cal = new MyCalendarThree();\nassert.equal(cal.book(7, 8), 1);\nassert.equal(cal.book(7, 8), 2);\nassert.equal(cal.book(6, 8), 3);\nassert.equal(cal.book(8, 9), 3);"
      },
      {
        "name": "the answer never decreases",
        "body": "const cal = new MyCalendarThree();\ncal.book(0, 100);\ncal.book(0, 100);\nassert.equal(cal.book(500, 600), 2);"
      },
      {
        "name": "huge coordinates",
        "body": "const cal = new MyCalendarThree();\nassert.equal(cal.book(0, 1000000000), 1);\nassert.equal(cal.book(999999999, 1000000000), 2);\nassert.equal(cal.book(0, 1), 2);"
      },
      {
        "name": "two calendars are independent",
        "body": "const a = new MyCalendarThree();\nconst b = new MyCalendarThree();\na.book(1, 5);\na.book(1, 5);\nassert.equal(b.book(1, 5), 1);"
      },
      {
        "name": "agrees with counting overlaps directly on random bookings",
        "body": "let seed = 11;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nconst cal = new MyCalendarThree();\nconst booked = [];\nfor (let step = 0; step < 150; step++) {\n  const start = ri(0, 40);\n  const end = start + ri(1, 15);\n  booked.push([start, end]);\n  let best = 0;\n  for (let t = 0; t < 60; t++) best = Math.max(best, booked.filter(([s, e]) => s <= t && t < e).length);\n  assert.equal(cal.book(start, end), best);\n}"
      }
    ]
  },
  {
    "id": "ex-fruits-into-baskets",
    "chapter": "dsa-segment-fenwick-trees",
    "level": "advanced",
    "title": "Fruits Into Baskets",
    "brief": "<p>You have <code>fruits[i]</code>, the quantity of each fruit type in order, and <code>baskets[j]</code>, the capacity of each basket from left to right. Place the fruits one at a time in the given order. Each fruit goes in the <b>leftmost basket that is still empty</b> and whose capacity is at least the fruit's quantity. Each basket holds at most one fruit type. A fruit with no suitable basket stays unplaced.</p><p>Write <code>numOfUnplacedFruits(fruits, baskets)</code> returning how many fruit types stay unplaced. A scan for each fruit is O(n) and gives O(n^2) overall; aim for O(n log n).</p>",
    "starter": "function numOfUnplacedFruits(fruits, baskets) {\n  // TODO\n}\n",
    "hints": [
      "For each fruit you need the leftmost position whose capacity is at least a given amount, and then that position must stop being available.",
      "Build a segment tree where every node stores the maximum capacity in its range. If the root's maximum is below the fruit's quantity, the fruit is unplaced. Otherwise descend: go to the left child if its maximum is enough, else to the right child.",
      "After placing a fruit, set that basket's capacity to -1 (or 0 when every quantity is positive) with a point update, so the basket is never chosen again. Count the fruits for which the descent fails."
    ],
    "solution": "function numOfUnplacedFruits(fruits, baskets) {\n  const n = baskets.length;\n  if (n === 0) return fruits.length;\n  const tree = new Array(4 * n).fill(-1);\n  const build = (node, lo, hi) => {\n    if (lo === hi) {\n      tree[node] = baskets[lo];\n      return;\n    }\n    const mid = (lo + hi) >> 1;\n    build(2 * node, lo, mid);\n    build(2 * node + 1, mid + 1, hi);\n    tree[node] = Math.max(tree[2 * node], tree[2 * node + 1]);\n  };\n  build(1, 0, n - 1);\n  let unplaced = 0;\n  for (const amount of fruits) {\n    if (tree[1] < amount) {\n      unplaced++;\n      continue;\n    }\n    let node = 1;\n    let lo = 0;\n    let hi = n - 1;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (tree[2 * node] >= amount) {\n        node = 2 * node;\n        hi = mid;\n      } else {\n        node = 2 * node + 1;\n        lo = mid + 1;\n      }\n    }\n    tree[node] = -1;\n    while (node > 1) {\n      node >>= 1;\n      tree[node] = Math.max(tree[2 * node], tree[2 * node + 1]);\n    }\n  }\n  return unplaced;\n}\n",
    "tests": [
      {
        "name": "the first example",
        "body": "assert.equal(numOfUnplacedFruits([4, 2, 5], [3, 5, 4]), 1);"
      },
      {
        "name": "the second example",
        "body": "assert.equal(numOfUnplacedFruits([3, 6, 1], [6, 4, 7]), 0);"
      },
      {
        "name": "every basket is too small",
        "body": "assert.equal(numOfUnplacedFruits([9, 9], [1, 2, 3]), 2);"
      },
      {
        "name": "a basket is used only once",
        "body": "assert.equal(numOfUnplacedFruits([5, 5, 5], [10, 10]), 1);"
      },
      {
        "name": "the leftmost fitting basket is chosen, not the tightest",
        "body": "assert.equal(numOfUnplacedFruits([2, 9], [8, 9]), 0);\nassert.equal(numOfUnplacedFruits([2, 9, 9], [8, 9]), 1);"
      },
      {
        "name": "no baskets, and no fruit",
        "body": "assert.equal(numOfUnplacedFruits([1, 2], []), 2);\nassert.equal(numOfUnplacedFruits([], [1, 2]), 0);"
      },
      {
        "name": "a quantity equal to the capacity fits",
        "body": "assert.equal(numOfUnplacedFruits([7], [7]), 0);"
      },
      {
        "name": "agrees with a leftmost-fit scan on random inputs",
        "body": "let seed = 11;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nfor (let round = 0; round < 300; round++) {\n  const fruits = Array.from({ length: ri(0, 12) }, () => ri(1, 9));\n  const baskets = Array.from({ length: ri(0, 12) }, () => ri(1, 9));\n  const free = baskets.slice();\n  let expected = 0;\n  for (const amount of fruits) {\n    const at = free.findIndex((capacity) => capacity >= amount);\n    if (at === -1) expected++;\n    else free[at] = -1;\n  }\n  assert.equal(numOfUnplacedFruits(fruits, baskets), expected);\n}"
      }
    ]
  }
];
