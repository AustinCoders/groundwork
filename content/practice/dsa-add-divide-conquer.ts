import type { Exercise } from "../types";

export const dsaAddDivideConquer: Exercise[] = [
  {
    id: "ex-max-subarray-summary-merge",
    chapter: "dsa-divide-conquer",
    level: "intermediate",
    title: "Maximum Subarray: Merge Two Summaries",
    brief: "<p>A divide-and-conquer maximum-subarray solution lets every range report a <b>summary</b> of four numbers: <code>total</code> (the sum of the whole range), <code>prefix</code> (the best sum of a non-empty prefix), <code>suffix</code> (the best sum of a non-empty suffix) and <code>best</code> (the best sum of any non-empty subarray inside the range).</p><p>Write <code>mergeSummaries(left, right)</code> that takes the summaries of two <b>adjacent</b> ranges, <code>left</code> first, and returns the summary of the two ranges joined.</p><ul><li>A one-element range with value <code>v</code> has the summary <code>{ total: v, prefix: v, suffix: v, best: v }</code></li><li>Return a <b>new</b> object with exactly those four keys, and do not change the arguments</li><li>It must take O(1) time: no loops</li><li>Values may be negative, and every prefix, suffix and subarray must contain at least one element</li></ul>",
    starter: "function mergeSummaries(left, right) {\n  // TODO: combine two adjacent summaries into one\n}\n",
    hints: [
      "The total of the joined range is easy. For the other three, ask where the best thing can start and stop relative to the seam between the two ranges.",
      "A best prefix of the joined range either ends inside the left range (that is left.prefix), or covers all of the left range and continues into the right one. A best suffix is the mirror image.",
      "The best subarray is inside the left range, inside the right range, or crosses the seam; a crossing one is the best suffix of the left plus the best prefix of the right.",
    ],
    solution: "function mergeSummaries(left, right) {\n  return {\n    total: left.total + right.total,\n    prefix: Math.max(left.prefix, left.total + right.prefix),\n    suffix: Math.max(right.suffix, right.total + left.suffix),\n    best: Math.max(left.best, right.best, left.suffix + right.prefix),\n  };\n}\n",
    tests: [
      {
        name: "two single elements",
        body: "const one = (v) => ({ total: v, prefix: v, suffix: v, best: v });\nassert.deepEqual(mergeSummaries(one(3), one(-1)), { total: 2, prefix: 3, suffix: 2, best: 3 });\nassert.deepEqual(mergeSummaries(one(-2), one(-5)), { total: -7, prefix: -2, suffix: -5, best: -2 });",
      },
      {
        name: "the best subarray crosses the seam",
        body: "const left = { total: 1, prefix: 1, suffix: 4, best: 4 };\nconst right = { total: 6, prefix: 6, suffix: 6, best: 6 };\nconst joined = mergeSummaries(left, right);\nassert.equal(joined.best, 10);\nassert.equal(joined.total, 7);",
      },
      {
        name: "the prefix can stop inside the left range",
        body: "const left = { total: -3, prefix: 5, suffix: -1, best: 5 };\nconst right = { total: 2, prefix: 2, suffix: 2, best: 2 };\nassert.equal(mergeSummaries(left, right).prefix, 5);\nassert.equal(mergeSummaries({ total: 4, prefix: 4, suffix: 4, best: 4 }, { total: 1, prefix: 3, suffix: 1, best: 3 }).prefix, 7);",
      },
      {
        name: "the suffix can stop inside the right range",
        body: "const left = { total: 2, prefix: 2, suffix: 2, best: 2 };\nconst right = { total: -3, prefix: -1, suffix: 5, best: 5 };\nassert.equal(mergeSummaries(left, right).suffix, 5);\nassert.equal(mergeSummaries({ total: 4, prefix: 4, suffix: 3, best: 4 }, { total: 2, prefix: 2, suffix: 2, best: 2 }).suffix, 5);",
      },
      {
        name: "all-negative ranges keep a non-empty answer",
        body: "const a = { total: -4, prefix: -1, suffix: -3, best: -1 };\nconst b = { total: -6, prefix: -2, suffix: -4, best: -2 };\nconst joined = mergeSummaries(a, b);\nassert.equal(joined.best, -1);\nassert.equal(joined.prefix, -1);\nassert.equal(joined.suffix, -4);\nassert.equal(joined.total, -10);",
      },
      {
        name: "does not change its arguments and returns exactly four keys",
        body: "const left = { total: 1, prefix: 1, suffix: 4, best: 4 };\nconst right = { total: 6, prefix: 6, suffix: 6, best: 6 };\nconst leftCopy = { ...left };\nconst rightCopy = { ...right };\nconst joined = mergeSummaries(left, right);\nassert.deepEqual(left, leftCopy);\nassert.deepEqual(right, rightCopy);\nassert.deepEqual(Object.keys(joined).sort(), [\"best\", \"prefix\", \"suffix\", \"total\"]);\nassert.ok(joined !== left && joined !== right);",
      },
      {
        name: "joining summaries of random arrays matches the summary of the joined array",
        body: "let seed = 12345;\nconst rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 8);\nconst pick = (lo, hi) => lo + (rnd() % (hi - lo + 1));\nfunction summarize(arr) {\n  let total = 0;\n  let prefix = -Infinity;\n  let suffix = -Infinity;\n  let best = -Infinity;\n  for (let i = 0; i < arr.length; i++) {\n    total += arr[i];\n    prefix = Math.max(prefix, total);\n  }\n  let run = 0;\n  for (let i = arr.length - 1; i >= 0; i--) {\n    run += arr[i];\n    suffix = Math.max(suffix, run);\n  }\n  for (let i = 0; i < arr.length; i++) {\n    let s = 0;\n    for (let j = i; j < arr.length; j++) {\n      s += arr[j];\n      best = Math.max(best, s);\n    }\n  }\n  return { total, prefix, suffix, best };\n}\nfor (let t = 0; t < 300; t++) {\n  const a = Array.from({ length: pick(1, 8) }, () => pick(-9, 9));\n  const b = Array.from({ length: pick(1, 8) }, () => pick(-9, 9));\n  assert.deepEqual(mergeSummaries(summarize(a), summarize(b)), summarize(a.concat(b)));\n}",
      },
      {
        name: "folding a long array one element at a time gives the maximum subarray sum",
        body: "let seed = 12345;\nconst rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 8);\nconst pick = (lo, hi) => lo + (rnd() % (hi - lo + 1));\nconst nums = Array.from({ length: 500 }, () => pick(-20, 20));\nlet summary = null;\nfor (const v of nums) {\n  const one = { total: v, prefix: v, suffix: v, best: v };\n  summary = summary === null ? one : mergeSummaries(summary, one);\n}\nlet best = -Infinity;\nfor (let i = 0; i < nums.length; i++) {\n  let s = 0;\n  for (let j = i; j < nums.length; j++) {\n    s += nums[j];\n    best = Math.max(best, s);\n  }\n}\nassert.equal(summary.best, best);",
      },
    ],
  },
  {
    id: "ex-count-range-sum-merge-sort",
    chapter: "dsa-divide-conquer",
    level: "advanced",
    title: "Count of Range Sum, by Merge Sort",
    brief: "<p>Given an integer array <code>nums</code> and two integers <code>lower</code> and <code>upper</code>, return the number of <b>non-empty subarrays</b> whose sum lies in the closed range <code>[lower, upper]</code>.</p><ul><li>A subarray is a contiguous run <code>nums[i..j]</code> with <code>i &lt;= j</code>; two subarrays with the same sum but different positions count separately</li><li>Both bounds are inclusive</li><li>Target: O(n log n). Checking every subarray is O(n²) and will time out on the large test</li><li>Hint: with prefix sums <code>P</code> (and a leading 0), the sum of <code>nums[i..j]</code> is <code>P[j + 1] - P[i]</code></li></ul>",
    starter: "function countRangeSum(nums, lower, upper) {\n  // TODO: count prefix-sum pairs whose difference is in range, merge-sort style\n}\n",
    hints: [
      "Build the prefix sums with a leading 0 (n + 1 values). The question becomes: count index pairs i < j with lower <= P[j] - P[i] <= upper.",
      "Merge sort the prefix array. Before merging two sorted halves, count the cross pairs: for each left value, the right values that work form one contiguous run.",
      "As the left value grows, both ends of that run only move right, so two pointers that are set once per merge (not reset for each left value) find every run in linear time.",
    ],
    solution: "function countRangeSum(nums, lower, upper) {\n  const prefix = [0];\n  for (const x of nums) prefix.push(prefix[prefix.length - 1] + x);\n  const aux = new Array(prefix.length);\n\n  function sortCount(lo, hi) {\n    if (hi - lo <= 1) return 0;\n    const mid = lo + ((hi - lo) >> 1);\n    let count = sortCount(lo, mid) + sortCount(mid, hi);\n    let from = mid;\n    let to = mid;\n    for (let i = lo; i < mid; i++) {\n      while (from < hi && prefix[from] - prefix[i] < lower) from++;\n      while (to < hi && prefix[to] - prefix[i] <= upper) to++;\n      count += to - from;\n    }\n    let i = lo;\n    let j = mid;\n    for (let k = lo; k < hi; k++) {\n      aux[k] = j === hi || (i < mid && prefix[i] <= prefix[j]) ? prefix[i++] : prefix[j++];\n    }\n    for (let k = lo; k < hi; k++) prefix[k] = aux[k];\n    return count;\n  }\n\n  return sortCount(0, prefix.length);\n}\n",
    tests: [
      {
        name: "the worked example",
        body: "assert.equal(countRangeSum([-2, 5, -1], -2, 2), 3);",
      },
      {
        name: "a single element, in range and out of range",
        body: "assert.equal(countRangeSum([0], 0, 0), 1);\nassert.equal(countRangeSum([5], 0, 4), 0);\nassert.equal(countRangeSum([5], 5, 5), 1);",
      },
      {
        name: "an empty array has no subarrays",
        body: "assert.equal(countRangeSum([], 0, 10), 0);",
      },
      {
        name: "both bounds are inclusive",
        body: "assert.equal(countRangeSum([1, 2, 3], 3, 3), 2);\nassert.equal(countRangeSum([1, 2, 3], 6, 6), 1);\nassert.equal(countRangeSum([1, 2, 3], 1, 6), 6);",
      },
      {
        name: "negative values and negative bounds",
        body: "assert.equal(countRangeSum([-3, -2, -1], -4, -2), 3);\nassert.equal(countRangeSum([-1, -1, -1], -2, -2), 2);",
      },
      {
        name: "equal values at different positions count separately",
        body: "assert.equal(countRangeSum([0, 0, 0], 0, 0), 6);",
      },
      {
        name: "the input array is not changed",
        body: "const nums = [3, -1, 4, -1, 5];\nconst copy = nums.slice();\ncountRangeSum(nums, 2, 6);\nassert.deepEqual(nums, copy);",
      },
      {
        name: "random arrays agree with checking every subarray",
        body: "let seed = 12345;\nconst rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 8);\nconst pick = (lo, hi) => lo + (rnd() % (hi - lo + 1));\nfor (let t = 0; t < 300; t++) {\n  const n = pick(0, 25);\n  const nums = Array.from({ length: n }, () => pick(-8, 8));\n  const lower = pick(-12, 6);\n  const upper = lower + pick(0, 14);\n  let expected = 0;\n  for (let i = 0; i < n; i++) {\n    let s = 0;\n    for (let j = i; j < n; j++) {\n      s += nums[j];\n      if (s >= lower && s <= upper) expected++;\n    }\n  }\n  assert.equal(countRangeSum(nums, lower, upper), expected);\n}",
      },
      {
        name: "a large input finishes quickly, so a quadratic scan fails",
        body: "const n = 100000;\nconst zeros = new Array(n).fill(0);\nassert.equal(countRangeSum(zeros, 0, 0), (n * (n + 1)) / 2);",
      },
    ],
  },
  {
    id: "ex-the-skyline-problem",
    chapter: "dsa-divide-conquer",
    level: "advanced",
    title: "The Skyline Problem",
    brief: "<p>Each building is <code>[left, right, height]</code>: it occupies the x-range from <code>left</code> up to (not including) <code>right</code> at the given positive <code>height</code>. Return the <b>skyline</b> formed by all the buildings as a list of key points <code>[x, height]</code>, sorted by x.</p><ul><li>A key point is the left end of a horizontal segment: from x onwards the skyline has the given height, until the next key point</li><li>The last key point always has height 0 (where the rightmost building ends)</li><li>Never output two consecutive key points with the same height: merge them away</li><li>The buildings may be in any order, may overlap, and adjacent buildings may touch at an x</li><li>No buildings gives an empty skyline <code>[]</code></li><li>Target: O(n log n)</li></ul>",
    starter: "function getSkyline(buildings) {\n  // TODO: split the buildings, solve each half, and merge two skylines\n}\n",
    hints: [
      "A single building's skyline is [[left, height], [right, 0]]. Think about how to merge the skylines of two groups of buildings.",
      "Merge like two sorted lists, by x. Remember the current height of each skyline; at every x where either has a key point, update that one, and the combined height is the larger of the two.",
      "Emit [x, height] only when the combined height differs from the last height you emitted (use 0 before the first). Update both skylines when they have a key point at the same x.",
    ],
    solution: "function mergeSkylines(a, b) {\n  const out = [];\n  let i = 0;\n  let j = 0;\n  let heightA = 0;\n  let heightB = 0;\n  while (i < a.length || j < b.length) {\n    const x = Math.min(i < a.length ? a[i][0] : Infinity, j < b.length ? b[j][0] : Infinity);\n    if (i < a.length && a[i][0] === x) heightA = a[i++][1];\n    if (j < b.length && b[j][0] === x) heightB = b[j++][1];\n    const height = Math.max(heightA, heightB);\n    if (out.length === 0 ? height !== 0 : height !== out[out.length - 1][1]) out.push([x, height]);\n  }\n  return out;\n}\n\nfunction getSkyline(buildings) {\n  function build(lo, hi) {\n    if (hi - lo === 0) return [];\n    if (hi - lo === 1) {\n      const [left, right, height] = buildings[lo];\n      return [[left, height], [right, 0]];\n    }\n    const mid = lo + ((hi - lo) >> 1);\n    return mergeSkylines(build(lo, mid), build(mid, hi));\n  }\n  return build(0, buildings.length);\n}\n",
    tests: [
      {
        name: "the classic example",
        body: "assert.deepEqual(getSkyline([[2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]]), [[2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0]]);",
      },
      {
        name: "no buildings",
        body: "assert.deepEqual(getSkyline([]), []);",
      },
      {
        name: "one building",
        body: "assert.deepEqual(getSkyline([[1, 5, 3]]), [[1, 3], [5, 0]]);",
      },
      {
        name: "adjacent buildings of equal height leave no key point between them",
        body: "assert.deepEqual(getSkyline([[0, 2, 3], [2, 5, 3]]), [[0, 3], [5, 0]]);",
      },
      {
        name: "adjacent buildings of different heights",
        body: "assert.deepEqual(getSkyline([[0, 2, 3], [2, 5, 4]]), [[0, 3], [2, 4], [5, 0]]);",
      },
      {
        name: "a lower building inside a taller one is hidden",
        body: "assert.deepEqual(getSkyline([[1, 10, 8], [3, 6, 4]]), [[1, 8], [10, 0]]);",
      },
      {
        name: "two buildings that start at the same x",
        body: "assert.deepEqual(getSkyline([[0, 5, 3], [0, 3, 7]]), [[0, 7], [3, 3], [5, 0]]);",
      },
      {
        name: "two buildings that end at the same x",
        body: "assert.deepEqual(getSkyline([[0, 5, 3], [2, 5, 7]]), [[0, 3], [2, 7], [5, 0]]);",
      },
      {
        name: "a gap between buildings drops to zero",
        body: "assert.deepEqual(getSkyline([[0, 2, 4], [5, 8, 4]]), [[0, 4], [2, 0], [5, 4], [8, 0]]);",
      },
      {
        name: "the order of the buildings does not matter",
        body: "const b = [[2, 9, 10], [3, 7, 15], [5, 12, 12]];\nassert.deepEqual(getSkyline(b.slice().reverse()), getSkyline(b));\nassert.deepEqual(getSkyline(b), [[2, 10], [3, 15], [7, 12], [12, 0]]);",
      },
      {
        name: "random buildings agree with a height-at-every-x scan",
        body: "let seed = 12345;\nconst rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 8);\nconst pick = (lo, hi) => lo + (rnd() % (hi - lo + 1));\nfunction brute(buildings) {\n  const xs = [...new Set(buildings.flatMap(([l, r]) => [l, r]))].sort((p, q) => p - q);\n  const out = [];\n  let last = 0;\n  for (const x of xs) {\n    let h = 0;\n    for (const [l, r, height] of buildings) if (l <= x && x < r) h = Math.max(h, height);\n    if (h !== last) {\n      out.push([x, h]);\n      last = h;\n    }\n  }\n  return out;\n}\nfor (let t = 0; t < 200; t++) {\n  const n = pick(0, 9);\n  const buildings = Array.from({ length: n }, () => {\n    const l = pick(0, 14);\n    return [l, l + pick(1, 8), pick(1, 9)];\n  });\n  assert.deepEqual(getSkyline(buildings), brute(buildings));\n}",
      },
      {
        name: "many buildings finish quickly",
        body: "let seed = 12345;\nconst rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 8);\nconst pick = (lo, hi) => lo + (rnd() % (hi - lo + 1));\nconst buildings = Array.from({ length: 20000 }, () => {\n  const l = pick(0, 1000000);\n  return [l, l + pick(1, 5000), pick(1, 1000)];\n});\nconst sky = getSkyline(buildings);\nassert.ok(sky.length > 0);\nassert.deepEqual(sky[sky.length - 1][1], 0);\nfor (let i = 1; i < sky.length; i++) {\n  assert.ok(sky[i][0] > sky[i - 1][0], 'x values must increase');\n  assert.ok(sky[i][1] !== sky[i - 1][1], 'consecutive heights must differ');\n}",
      },
    ],
  },
  {
    id: "ex-closest-pair-of-points",
    chapter: "dsa-divide-conquer",
    level: "advanced",
    title: "Closest Pair of Points",
    brief: "<p>Given an array of points <code>[x, y]</code> with integer coordinates, return the <b>squared</b> Euclidean distance between the two closest points, <code>(x1 - x2)² + (y1 - y2)²</code>.</p><ul><li>Return the squared distance so that the answer is an exact integer</li><li>Two different array entries with the same coordinates are two points at distance 0</li><li>With fewer than two points, return <code>Infinity</code></li><li>Do not change the caller's array</li><li>Target: O(n log n). Checking every pair is O(n²) and will time out on the large test</li></ul>",
    starter: "function closestPairSquared(points) {\n  // TODO: sort by x, split, solve each half, then check the strip around the dividing line\n}\n",
    hints: [
      "Sort by x and split in the middle. The closest pair is in the left half, in the right half, or has one point on each side. Let d be the better of the first two.",
      "A crossing pair that beats d has both points within d of the dividing line: only the strip of such points matters. Compare squared distances so no square roots are needed.",
      "Walk the strip in y order, and compare each point only with earlier strip points whose y is less than d below it: at most a handful. To avoid re-sorting the strip at every level, have each recursive call return its points sorted by y by merging.",
    ],
    solution: "function closestPairSquared(points) {\n  const n = points.length;\n  if (n < 2) return Infinity;\n  const pts = points.slice().sort((p, q) => p[0] - q[0]);\n  const aux = new Array(n);\n  const strip = new Array(n);\n  const dist2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;\n\n  function solve(lo, hi) {\n    if (hi - lo <= 3) {\n      let best = Infinity;\n      for (let i = lo; i < hi; i++) for (let j = i + 1; j < hi; j++) best = Math.min(best, dist2(pts[i], pts[j]));\n      const part = pts.slice(lo, hi).sort((p, q) => p[1] - q[1]);\n      for (let k = 0; k < part.length; k++) pts[lo + k] = part[k];\n      return best;\n    }\n    const mid = lo + ((hi - lo) >> 1);\n    const midX = pts[mid][0];\n    let best = Math.min(solve(lo, mid), solve(mid, hi));\n    let i = lo;\n    let j = mid;\n    for (let k = lo; k < hi; k++) {\n      aux[k] = j === hi || (i < mid && pts[i][1] <= pts[j][1]) ? pts[i++] : pts[j++];\n    }\n    for (let k = lo; k < hi; k++) pts[k] = aux[k];\n    let size = 0;\n    for (let k = lo; k < hi; k++) {\n      const p = pts[k];\n      if ((p[0] - midX) ** 2 >= best) continue;\n      for (let t = size - 1; t >= 0 && (p[1] - strip[t][1]) ** 2 < best; t--) {\n        best = Math.min(best, dist2(p, strip[t]));\n      }\n      strip[size++] = p;\n    }\n    return best;\n  }\n\n  return solve(0, n);\n}\n",
    tests: [
      {
        name: "two points",
        body: "assert.equal(closestPairSquared([[0, 0], [3, 4]]), 25);",
      },
      {
        name: "fewer than two points",
        body: "assert.equal(closestPairSquared([]), Infinity);\nassert.equal(closestPairSquared([[1, 1]]), Infinity);",
      },
      {
        name: "the closest pair straddles the middle",
        body: "assert.equal(closestPairSquared([[0, 3], [1, 9], [4, 7], [6, 0], [7, 0], [8, 7], [9, 10], [10, 8]]), 1);",
      },
      {
        name: "duplicate points are at distance zero",
        body: "assert.equal(closestPairSquared([[2, 2], [9, 9], [2, 2], [5, 1]]), 0);",
      },
      {
        name: "points on one vertical line",
        body: "assert.equal(closestPairSquared([[4, 0], [4, 10], [4, 3], [4, 7], [4, 20]]), 9);",
      },
      {
        name: "points on one horizontal line",
        body: "assert.equal(closestPairSquared([[0, 5], [10, 5], [3, 5], [7, 5], [20, 5]]), 9);",
      },
      {
        name: "negative coordinates",
        body: "assert.equal(closestPairSquared([[-5, -5], [-4, -4], [10, 10], [-20, 7]]), 2);",
      },
      {
        name: "the input array and its points are not changed",
        body: "const pts = [[5, 5], [1, 1], [3, 3], [1, 2]];\nconst copy = JSON.stringify(pts);\nclosestPairSquared(pts);\nassert.equal(JSON.stringify(pts), copy);",
      },
      {
        name: "random points agree with checking every pair",
        body: "let seed = 12345;\nconst rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 8);\nconst pick = (lo, hi) => lo + (rnd() % (hi - lo + 1));\nfor (let t = 0; t < 200; t++) {\n  const n = pick(0, 40);\n  const range = pick(2, 50);\n  const pts = Array.from({ length: n }, () => [pick(-range, range), pick(-range, range)]);\n  let expected = Infinity;\n  for (let i = 0; i < n; i++) {\n    for (let j = i + 1; j < n; j++) {\n      expected = Math.min(expected, (pts[i][0] - pts[j][0]) ** 2 + (pts[i][1] - pts[j][1]) ** 2);\n    }\n  }\n  assert.equal(closestPairSquared(pts), expected);\n}",
      },
      {
        name: "a large input finishes quickly, so a quadratic scan fails",
        body: "let seed = 12345;\nconst rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 8);\nconst pick = (lo, hi) => lo + (rnd() % (hi - lo + 1));\nconst n = 100000;\nconst xs = Array.from({ length: n }, (_, i) => i * 10);\nfor (let i = n - 1; i > 0; i--) {\n  const j = rnd() % (i + 1);\n  [xs[i], xs[j]] = [xs[j], xs[i]];\n}\nconst pts = xs.map((x) => [x, 0]);\nassert.equal(closestPairSquared(pts), 100);",
      },
    ],
  },
  {
    id: "ex-different-ways-to-add-parentheses",
    chapter: "dsa-divide-conquer",
    level: "intermediate",
    title: "Different Ways to Add Parentheses",
    brief: "<p>Given a string <code>expression</code> made of non-negative integers and the operators <code>+</code>, <code>-</code> and <code>*</code> (no spaces, no parentheses), return the results of <b>every</b> way of fully parenthesizing it, in any order.</p><ul><li><code>\"2-1-1\"</code> can be <code>2-(1-1)</code> = 2 or <code>(2-1)-1</code> = 0, so the answer is <code>[0, 2]</code> in some order</li><li>Keep duplicates: two different parenthesizations with the same value both appear</li><li>Numbers can have several digits: <code>\"10+5\"</code> is 15</li><li>A string with no operator is just the number</li><li>The expression is short (at most about 25 characters), because the number of results grows like a Catalan number</li></ul>",
    starter: "function diffWaysToCompute(expression) {\n  // TODO: split at each operator, solve both sides, and combine every pair of results\n}\n",
    hints: [
      "Pick any operator to be the last one applied. It splits the expression into a left part and a right part, each of which has its own list of results.",
      "For each split, combine every result from the left list with every result from the right list using that operator. The answer is all of those, over every operator.",
      "The same sub-expression is asked for by several splits. Tokenize into numbers and operators first (a regular expression like /\\d+|[-+*]/g does it), then memoize on the pair of token indexes.",
    ],
    solution: "function diffWaysToCompute(expression) {\n  const tokens = expression.match(/\\d+|[-+*]/g);\n  const memo = new Map();\n\n  function apply(op, a, b) {\n    if (op === \"+\") return a + b;\n    if (op === \"-\") return a - b;\n    return a * b + 0;\n  }\n\n  function ways(lo, hi) {\n    if (lo === hi) return [Number(tokens[lo])];\n    const key = lo * tokens.length + hi;\n    if (memo.has(key)) return memo.get(key);\n    const results = [];\n    for (let op = lo + 1; op < hi; op += 2) {\n      const lefts = ways(lo, op - 1);\n      const rights = ways(op + 1, hi);\n      for (const a of lefts) for (const b of rights) results.push(apply(tokens[op], a, b));\n    }\n    memo.set(key, results);\n    return results;\n  }\n\n  return ways(0, tokens.length - 1);\n}\n",
    tests: [
      {
        name: "two ways for a subtraction chain",
        body: "const sorted = (a) => a.slice().sort((x, y) => x - y);\nassert.deepEqual(sorted(diffWaysToCompute('2-1-1')), [0, 2]);",
      },
      {
        name: "duplicates are kept",
        body: "const sorted = (a) => a.slice().sort((x, y) => x - y);\nassert.deepEqual(sorted(diffWaysToCompute('2*3-4*5')), [-34, -14, -10, -10, 10]);",
      },
      {
        name: "a single number",
        body: "assert.deepEqual(diffWaysToCompute('7'), [7]);\nassert.deepEqual(diffWaysToCompute('123'), [123]);",
      },
      {
        name: "multi-digit numbers are one token",
        body: "assert.deepEqual(diffWaysToCompute('10+5'), [15]);\nassert.deepEqual(diffWaysToCompute('11*11'), [121]);",
      },
      {
        name: "an operator that gives the same result however it is grouped",
        body: "const r = diffWaysToCompute('1+2+3');\nassert.equal(r.length, 2);\nassert.ok(r.every((v) => v === 6));",
      },
      {
        name: "zero and subtraction",
        body: "const sorted = (a) => a.slice().sort((x, y) => x - y);\nassert.deepEqual(sorted(diffWaysToCompute('0*2-3')), [-3, 0]);",
      },
      {
        name: "the number of results is a Catalan number",
        body: "const counts = [1, 1, 2, 5, 14, 42, 132, 429, 1430, 4862, 16796];\nfor (let ops = 0; ops <= 10; ops++) {\n  const expr = Array.from({ length: ops + 1 }, (_, i) => String(i + 1)).join('+');\n  assert.equal(diffWaysToCompute(expr).length, counts[ops], ops + ' operators');\n}",
      },
      {
        name: "random expressions agree with trying every order of the operators",
        body: "let seed = 12345;\nconst rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 8);\nconst pick = (lo, hi) => lo + (rnd() % (hi - lo + 1));\nfunction brute(expr) {\n  const tokens = expr.match(/\\d+|[-+*]/g).map((t, i) => (i % 2 === 0 ? Number(t) : t));\n  const found = new Set();\n  const apply = (op, a, b) => (op === '+' ? a + b : op === '-' ? a - b : a * b);\n  (function go(items) {\n    if (items.length === 1) {\n      found.add(items[0] + 0);\n      return;\n    }\n    for (let i = 1; i < items.length; i += 2) {\n      go(items.slice(0, i - 1).concat([apply(items[i], items[i - 1], items[i + 1])], items.slice(i + 2)));\n    }\n  })(tokens);\n  return [...found].sort((x, y) => x - y);\n}\nfor (let t = 0; t < 120; t++) {\n  const count = pick(1, 6);\n  let expr = String(pick(0, 12));\n  for (let i = 1; i < count; i++) expr += '+-*'[pick(0, 2)] + pick(0, 12);\n  const got = [...new Set(diffWaysToCompute(expr))].sort((x, y) => x - y);\n  assert.deepEqual(got, brute(expr), expr);\n}",
      },
    ],
  },
  {
    id: "ex-pow-x-n",
    chapter: "dsa-divide-conquer",
    level: "intermediate",
    title: "Pow(x, n)",
    brief: "<p>Implement <code>myPow(x, n)</code>, which returns <code>x</code> raised to the integer power <code>n</code>, without using <code>Math.pow</code> or <code>**</code>.</p><ul><li><code>n</code> is a 32-bit signed integer: it may be negative, zero or positive, down to <code>-2147483648</code></li><li><code>myPow(x, 0)</code> is <code>1</code> for every x, including 0</li><li><code>x</code> may be a fraction or negative</li><li>Target: O(log |n|) multiplications. A loop of |n| multiplications is too slow for the large exponents in the tests</li><li>Floating-point results are compared with a small relative tolerance</li></ul>",
    starter: "function myPow(x, n) {\n  // TODO: halve the exponent instead of counting it down\n}\n",
    hints: [
      "x^n is (x^(n/2)) squared, times one more x when n is odd. The exponent halves each time, so about log2(n) steps remain.",
      "Compute the half power once and store it. Writing the recursive call twice makes the recursion tree as big as the exponent.",
      "For a negative n, compute with 1/x and -n. Use Math.floor(n / 2) rather than a shift: the shift works on 32-bit integers.",
    ],
    solution: "function myPow(x, n) {\n  if (n < 0) return myPow(1 / x, -n);\n  if (n === 0) return 1;\n  const half = myPow(x, Math.floor(n / 2));\n  return n % 2 === 0 ? half * half : half * half * x;\n}\n",
    tests: [
      {
        name: "small positive powers",
        body: "assert.equal(myPow(2, 10), 1024);\nassert.equal(myPow(3, 3), 27);\nassert.equal(myPow(5, 1), 5);",
      },
      {
        name: "the exponent 0 gives 1 for every base",
        body: "assert.equal(myPow(7, 0), 1);\nassert.equal(myPow(0, 0), 1);\nassert.equal(myPow(-3.5, 0), 1);",
      },
      {
        name: "negative exponents",
        body: "assert.equal(myPow(2, -2), 0.25);\nassert.equal(myPow(2, -3), 0.125);\nassert.ok(Math.abs(myPow(10, -3) - 0.001) < 1e-15);",
      },
      {
        name: "negative bases alternate in sign",
        body: "assert.equal(myPow(-2, 3), -8);\nassert.equal(myPow(-2, 4), 16);\nassert.equal(myPow(-2, -3), -0.125);",
      },
      {
        name: "fractions",
        body: "assert.ok(Math.abs(myPow(2.1, 3) - 9.261) < 1e-9);\nassert.equal(myPow(0.5, 4), 0.0625);",
      },
      {
        name: "zero to a positive power is zero",
        body: "assert.equal(myPow(0, 5), 0);\nassert.equal(myPow(0, 1), 0);",
      },
      {
        name: "zero to a negative power is Infinity",
        body: "assert.equal(myPow(0, -1), Infinity);",
      },
      {
        name: "the largest exponents finish at once",
        body: "assert.equal(myPow(1, 2147483647), 1);\nassert.equal(myPow(1, -2147483648), 1);\nassert.equal(myPow(-1, 2147483647), -1);\nassert.equal(myPow(-1, -2147483648), 1);\nassert.equal(myPow(2, -2147483648), 0);\nassert.equal(myPow(2, 2147483647), Infinity);",
      },
      {
        name: "a base close to 1 with a large exponent matches Math.pow to a relative tolerance",
        body: "const got = myPow(1.0001, 10000);\nconst want = Math.pow(1.0001, 10000);\nassert.ok(Math.abs(got - want) <= 1e-9 * want, got + ' vs ' + want);\nconst g2 = myPow(1.0000001, 2147483647);\nconst w2 = Math.pow(1.0000001, 2147483647);\nassert.ok(Math.abs(g2 - w2) <= 1e-5 * w2 || (g2 === Infinity && w2 === Infinity), g2 + ' vs ' + w2);",
      },
      {
        name: "random bases and exponents agree with Math.pow",
        body: "let seed = 12345;\nconst rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 8);\nconst pick = (lo, hi) => lo + (rnd() % (hi - lo + 1));\nconst bases = [0.5, 1.5, -1.5, 2, -2, 3, 0.9, 1.1, -0.9, 7];\nfor (let t = 0; t < 300; t++) {\n  const x = bases[pick(0, bases.length - 1)];\n  const n = pick(-30, 30);\n  const got = myPow(x, n);\n  const want = Math.pow(x, n);\n  assert.ok(Math.abs(got - want) <= 1e-9 * Math.abs(want), x + '^' + n + ': ' + got + ' vs ' + want);\n}",
      },
    ],
  },
  {
    id: "ex-majority-element-or-none",
    chapter: "dsa-divide-conquer",
    level: "intermediate",
    title: "Majority Element, or None",
    brief: "<p>Write <code>majorityOrNull(nums)</code>. It returns the value that appears <b>strictly more than</b> <code>n / 2</code> times in <code>nums</code>, or <code>null</code> when no value does.</p><ul><li>A value that appears exactly <code>n / 2</code> times is <b>not</b> a majority, so <code>[1, 1, 2, 2]</code> has none</li><li>The values can be numbers, including negative numbers and 0, or strings (compare them with <code>===</code>), and an empty array has no majority</li><li>Do not change the array</li><li>Practice the divide-and-conquer way: if a value is a strict majority of a range, it is a strict majority of at least one of the two halves, so each half only needs to hand up one candidate, and the combine counts to confirm</li></ul>",
    starter: "function majorityOrNull(nums) {\n  // TODO: each half returns the one candidate that could be its majority; confirm by counting\n}\n",
    hints: [
      "Suppose a value v is a strict majority of the whole range. Could it have at most half of the left half and at most half of the right half? Then what would its total be?",
      "Let each recursive call return a candidate (or a marker for none). If both halves return the same candidate, it is a strict majority of both, and so of the whole range.",
      "If they differ, count each candidate over the whole range and keep one whose count exceeds floor(length / 2). Use a marker for none that no array value can equal.",
    ],
    solution: "const NONE = Symbol(\"no majority\");\n\nfunction majorityOrNull(nums) {\n  function count(value, lo, hi) {\n    let c = 0;\n    for (let i = lo; i < hi; i++) if (nums[i] === value) c++;\n    return c;\n  }\n\n  function candidate(lo, hi) {\n    if (hi - lo === 1) return nums[lo];\n    const mid = lo + ((hi - lo) >> 1);\n    const left = candidate(lo, mid);\n    const right = candidate(mid, hi);\n    if (left === right) return left;\n    const need = (hi - lo) >> 1;\n    if (left !== NONE && count(left, lo, hi) > need) return left;\n    if (right !== NONE && count(right, lo, hi) > need) return right;\n    return NONE;\n  }\n\n  if (nums.length === 0) return null;\n  const found = candidate(0, nums.length);\n  return found === NONE ? null : found;\n}\n",
    tests: [
      {
        name: "a clear majority",
        body: "assert.equal(majorityOrNull([2, 2, 1, 1, 1, 2, 2]), 2);\nassert.equal(majorityOrNull([3, 3, 4]), 3);",
      },
      {
        name: "no majority",
        body: "assert.equal(majorityOrNull([1, 2, 3]), null);\nassert.equal(majorityOrNull([1, 2, 1, 2, 3, 3]), null);",
      },
      {
        name: "exactly half is not a majority",
        body: "assert.equal(majorityOrNull([1, 1, 2, 2]), null);\nassert.equal(majorityOrNull([5, 6]), null);",
      },
      {
        name: "one element and an empty array",
        body: "assert.equal(majorityOrNull([9]), 9);\nassert.equal(majorityOrNull([]), null);",
      },
      {
        name: "a majority of zero or of a negative number",
        body: "assert.equal(majorityOrNull([0, 0, 1]), 0);\nassert.equal(majorityOrNull([-1, -1, 2, -1]), -1);\nassert.equal(majorityOrNull([-1, 2, 3]), null);",
      },
      {
        name: "the majority sits at one end",
        body: "assert.equal(majorityOrNull([1, 2, 2, 2, 2]), 2);\nassert.equal(majorityOrNull([7, 7, 7, 1, 2]), 7);\nassert.equal(majorityOrNull([4, 5, 4, 5, 4]), 4);",
      },
      {
        name: "strings work too",
        body: "assert.equal(majorityOrNull(['a', 'b', 'a']), 'a');\nassert.equal(majorityOrNull(['a', 'b']), null);",
      },
      {
        name: "the array is not changed",
        body: "const nums = [2, 1, 2, 3, 2];\nconst copy = nums.slice();\nmajorityOrNull(nums);\nassert.deepEqual(nums, copy);",
      },
      {
        name: "random arrays agree with counting every value",
        body: "let seed = 12345;\nconst rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 8);\nconst pick = (lo, hi) => lo + (rnd() % (hi - lo + 1));\nfor (let t = 0; t < 400; t++) {\n  const n = pick(0, 21);\n  const nums = Array.from({ length: n }, () => pick(-2, pick(-1, 2)));\n  const freq = new Map();\n  for (const x of nums) freq.set(x, (freq.get(x) || 0) + 1);\n  let expected = null;\n  for (const [value, c] of freq) if (c > n / 2) expected = value;\n  assert.equal(majorityOrNull(nums), expected, JSON.stringify(nums));\n}",
      },
      {
        name: "a large array with a planted majority",
        body: "const n = 200001;\nconst nums = Array.from({ length: n }, (_, i) => (i % 3 === 0 ? i : 7));\nconst got = majorityOrNull(nums);\nassert.equal(got, 7);\nconst none = Array.from({ length: n }, (_, i) => i % 4);\nassert.equal(majorityOrNull(none), null);",
      },
    ],
  },
  {
    id: "ex-kth-of-two-sorted-arrays",
    chapter: "dsa-divide-conquer",
    level: "intermediate",
    title: "K-th Smallest of Two Sorted Arrays",
    brief: "<p>Given two arrays <code>a</code> and <code>b</code>, each sorted in ascending order, and an integer <code>k</code> with <code>1 &lt;= k &lt;= a.length + b.length</code>, return the <code>k</code>-th smallest element of all the values together (counting from 1, duplicates counted).</p><ul><li>Either array may be empty, but not both</li><li>Do not merge the arrays and do not copy them: the target is O(log k) time and O(1) extra space</li><li>The tests look at how many elements your code reads from large arrays</li></ul>",
    starter: "function kthOfTwoSorted(a, b, k) {\n  // TODO: compare the k/2-th elements and discard a block that cannot hold the answer\n}\n",
    hints: [
      "Compare a[k/2 - 1] and b[k/2 - 1] (rounding k/2 down). Whichever is smaller has fewer than k elements before it in the union, so it and everything before it in its array cannot be the k-th.",
      "Discard that block, reduce k by the number of elements you discarded, and repeat. Track the discarded counts as two start offsets i and j instead of slicing.",
      "Handle the edges: if one array is used up, index straight into the other; if k is 1, return the smaller front element; if an array has fewer than k/2 elements left, compare its last element and discard all it has.",
    ],
    solution: "function kthOfTwoSorted(a, b, k) {\n  let i = 0;\n  let j = 0;\n  while (true) {\n    if (i === a.length) return b[j + k - 1];\n    if (j === b.length) return a[i + k - 1];\n    if (k === 1) return Math.min(a[i], b[j]);\n    const step = k >> 1;\n    const nextI = Math.min(i + step, a.length);\n    const nextJ = Math.min(j + step, b.length);\n    if (a[nextI - 1] <= b[nextJ - 1]) {\n      k -= nextI - i;\n      i = nextI;\n    } else {\n      k -= nextJ - j;\n      j = nextJ;\n    }\n  }\n}\n",
    tests: [
      {
        name: "the worked example",
        body: "const a = [1, 4, 7, 10, 13];\nconst b = [2, 3, 5, 6, 8, 9, 11, 12];\nassert.equal(kthOfTwoSorted(a, b, 7), 7);\nassert.equal(kthOfTwoSorted(a, b, 1), 1);\nassert.equal(kthOfTwoSorted(a, b, 13), 13);",
      },
      {
        name: "one array is empty",
        body: "assert.equal(kthOfTwoSorted([], [1, 2, 3], 2), 2);\nassert.equal(kthOfTwoSorted([4, 5], [], 1), 4);",
      },
      {
        name: "all of one array is smaller",
        body: "assert.equal(kthOfTwoSorted([1, 2, 3], [10, 20], 4), 10);\nassert.equal(kthOfTwoSorted([10, 20], [1, 2, 3], 3), 3);",
      },
      {
        name: "duplicates across the arrays",
        body: "assert.equal(kthOfTwoSorted([1, 2, 2], [2, 2, 3], 4), 2);\nassert.equal(kthOfTwoSorted([2, 2], [2, 2], 3), 2);",
      },
      {
        name: "negative numbers",
        body: "assert.equal(kthOfTwoSorted([-5, -1, 4], [-3, 0], 3), -1);",
      },
      {
        name: "single elements",
        body: "assert.equal(kthOfTwoSorted([5], [3], 1), 3);\nassert.equal(kthOfTwoSorted([5], [3], 2), 5);",
      },
      {
        name: "the arrays are not changed",
        body: "const a = [1, 3, 5];\nconst b = [2, 4];\nkthOfTwoSorted(a, b, 4);\nassert.deepEqual(a, [1, 3, 5]);\nassert.deepEqual(b, [2, 4]);",
      },
      {
        name: "random arrays agree with merging and indexing, for every k",
        body: "let seed = 12345;\nconst rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 8);\nconst pick = (lo, hi) => lo + (rnd() % (hi - lo + 1));\nfor (let t = 0; t < 300; t++) {\n  const a = Array.from({ length: pick(0, 12) }, () => pick(-10, 10)).sort((x, y) => x - y);\n  const b = Array.from({ length: pick(0, 12) }, () => pick(-10, 10)).sort((x, y) => x - y);\n  if (a.length + b.length === 0) continue;\n  const merged = a.concat(b).sort((x, y) => x - y);\n  for (let k = 1; k <= merged.length; k++) {\n    assert.equal(kthOfTwoSorted(a, b, k), merged[k - 1], JSON.stringify([a, b, k]));\n  }\n}",
      },
      {
        name: "looks at only a handful of elements, so a merge fails",
        body: "const size = 1000000;\nconst big1 = Array.from({ length: size }, (_, i) => 2 * i);\nconst big2 = Array.from({ length: size }, (_, i) => 2 * i + 1);\nlet reads = 0;\nconst watch = (arr) => new Proxy(arr, {\n  get(target, key) {\n    if (typeof key === 'string' && key !== 'length') reads++;\n    return target[key];\n  },\n});\nassert.equal(kthOfTwoSorted(watch(big1), watch(big2), size), size - 1);\nassert.equal(kthOfTwoSorted(watch(big1), watch(big2), 2 * size), 2 * size - 1);\nassert.ok(reads < 300, 'read ' + reads + ' elements; halving k each step needs about 4 per step, not one per element');",
      },
    ],
  },
  {
    id: "ex-longest-substring-at-least-k-repeats",
    chapter: "dsa-divide-conquer",
    level: "intermediate",
    title: "Longest Substring With At Least K Repeating Characters",
    brief: "<p>Given a string <code>s</code> and an integer <code>k</code>, return the length of the longest substring of <code>s</code> in which <b>every character appears at least <code>k</code> times</b>. Return 0 if there is none.</p><ul><li><code>longestSubstring(\"aaabb\", 3)</code> is 3 (<code>\"aaa\"</code>) and <code>longestSubstring(\"ababbc\", 2)</code> is 5 (<code>\"ababb\"</code>)</li><li>The string can hold any characters, not only lowercase letters</li><li><code>k</code> is at least 1</li><li>Target: much better than checking every substring (O(n²) or worse)</li></ul>",
    starter: "function longestSubstring(s, k) {\n  // TODO: a character that is rare in the whole string cannot be in any answer, so split there\n}\n",
    hints: [
      "Count every character in the string. If a character appears fewer than k times in total, no valid substring can contain it.",
      "Split the string at every occurrence of such a character and solve each piece on its own. If no character in a piece is rare, the whole piece is valid.",
      "Pass index ranges instead of slicing, and count only the characters inside the current range. Each level removes at least one distinct character from every piece, so the recursion is as deep as the alphabet, not the string.",
    ],
    solution: "function longestSubstring(s, k) {\n  function solve(lo, hi) {\n    if (hi - lo < k) return 0;\n    const count = new Map();\n    for (let i = lo; i < hi; i++) count.set(s[i], (count.get(s[i]) ?? 0) + 1);\n    let best = 0;\n    let start = lo;\n    let split = false;\n    for (let i = lo; i < hi; i++) {\n      if (count.get(s[i]) < k) {\n        split = true;\n        best = Math.max(best, solve(start, i));\n        start = i + 1;\n      }\n    }\n    if (!split) return hi - lo;\n    return Math.max(best, solve(start, hi));\n  }\n  return solve(0, s.length);\n}\n",
    tests: [
      {
        name: "the examples",
        body: "assert.equal(longestSubstring('aaabb', 3), 3);\nassert.equal(longestSubstring('ababbc', 2), 5);",
      },
      {
        name: "the whole string is valid",
        body: "assert.equal(longestSubstring('aabbcc', 2), 6);\nassert.equal(longestSubstring('abc', 1), 3);",
      },
      {
        name: "no valid substring",
        body: "assert.equal(longestSubstring('abcd', 2), 0);\nassert.equal(longestSubstring('', 1), 0);\nassert.equal(longestSubstring('aab', 3), 0);",
      },
      {
        name: "a rare character in the middle splits the string",
        body: "assert.equal(longestSubstring('aaabbcbbbb', 3), 4);\nassert.equal(longestSubstring('bbaaacbbb', 3), 3);",
      },
      {
        name: "several rare characters and a cascade",
        body: "assert.equal(longestSubstring('aaabbbxaabbbbyaaa', 3), 6);\nassert.equal(longestSubstring('aabcabb', 3), 0);",
      },
      {
        name: "a single repeated character",
        body: "assert.equal(longestSubstring('aaaa', 4), 4);\nassert.equal(longestSubstring('aaaa', 5), 0);",
      },
      {
        name: "characters other than lowercase letters",
        body: "assert.equal(longestSubstring('AAbbBBAA', 2), 8);\nassert.equal(longestSubstring('11 22 3', 2), 6);",
      },
      {
        name: "random strings agree with checking every substring",
        body: "let seed = 12345;\nconst rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 8);\nconst pick = (lo, hi) => lo + (rnd() % (hi - lo + 1));\nfor (let t = 0; t < 300; t++) {\n  const n = pick(0, 18);\n  const alphabet = 'abc'.slice(0, pick(1, 3));\n  const s = Array.from({ length: n }, () => alphabet[pick(0, alphabet.length - 1)]).join('');\n  const k = pick(1, 5);\n  let best = 0;\n  for (let i = 0; i < n; i++) {\n    const counts = new Map();\n    for (let j = i; j < n; j++) {\n      counts.set(s[j], (counts.get(s[j]) || 0) + 1);\n      if ([...counts.values()].every((v) => v >= k)) best = Math.max(best, j - i + 1);\n    }\n  }\n  assert.equal(longestSubstring(s, k), best, s + ' ' + k);\n}",
      },
      {
        name: "a long string finishes quickly, so checking every substring fails",
        body: "const s = 'ab'.repeat(50000) + 'c';\nassert.equal(longestSubstring(s, 3), 100000);\nconst t = 'a'.repeat(100000);\nassert.equal(longestSubstring(t, 100000), 100000);",
      },
    ],
  },
  {
    id: "ex-merge-k-sorted-arrays-halving",
    chapter: "dsa-divide-conquer",
    level: "intermediate",
    title: "Merge K Sorted Arrays by Halving",
    brief: "<p>Given <code>arrays</code>, a list of <code>k</code> arrays that are each sorted in ascending order, return one sorted array holding all their elements.</p><ul><li>Some arrays may be empty, and <code>arrays</code> itself may be empty (the result is <code>[]</code>)</li><li>Do not change the input arrays</li><li>Target: O(N log k) for N elements in total. Merging the arrays into one running result one after another is O(N · k), and the tests count comparisons to tell the difference</li><li>Divide and conquer fits: merge the first half of the list, merge the second half, then merge the two results</li></ul>",
    starter: "function mergeKSorted(arrays) {\n  // TODO: split the list of arrays in half, merge each half, then merge the two results\n}\n",
    hints: [
      "Write the easy part first: merge two sorted arrays into one with two indexes.",
      "Then merge k arrays by recursion on the list: if there is one array, return it (or a copy); otherwise merge the result of the first half with the result of the second half.",
      "Each element takes part in about log2(k) merges, one per level, which is where O(N log k) comes from. A running result that absorbs one array at a time re-copies the same elements again and again.",
    ],
    solution: "function mergeTwo(a, b) {\n  const out = [];\n  let i = 0;\n  let j = 0;\n  while (i < a.length && j < b.length) {\n    if (a[i] <= b[j]) out.push(a[i++]);\n    else out.push(b[j++]);\n  }\n  while (i < a.length) out.push(a[i++]);\n  while (j < b.length) out.push(b[j++]);\n  return out;\n}\n\nfunction mergeKSorted(arrays) {\n  function merge(lo, hi) {\n    if (hi - lo === 0) return [];\n    if (hi - lo === 1) return arrays[lo].slice();\n    const mid = lo + ((hi - lo) >> 1);\n    return mergeTwo(merge(lo, mid), merge(mid, hi));\n  }\n  return merge(0, arrays.length);\n}\n",
    tests: [
      {
        name: "three arrays",
        body: "assert.deepEqual(mergeKSorted([[1, 4, 7], [2, 5, 8], [3, 6, 9]]), [1, 2, 3, 4, 5, 6, 7, 8, 9]);",
      },
      {
        name: "no arrays",
        body: "assert.deepEqual(mergeKSorted([]), []);",
      },
      {
        name: "one array is returned as a copy",
        body: "const a = [1, 2, 3];\nconst out = mergeKSorted([a]);\nassert.deepEqual(out, [1, 2, 3]);\nassert.ok(out !== a);",
      },
      {
        name: "empty arrays among the others",
        body: "assert.deepEqual(mergeKSorted([[], [1, 3], [], [2], []]), [1, 2, 3]);\nassert.deepEqual(mergeKSorted([[], []]), []);",
      },
      {
        name: "duplicates and negative numbers",
        body: "assert.deepEqual(mergeKSorted([[-3, 0, 0], [-3, 2], [0, 0, 5]]), [-3, -3, 0, 0, 0, 0, 2, 5]);",
      },
      {
        name: "arrays of very different lengths",
        body: "assert.deepEqual(mergeKSorted([[5], [1, 2, 3, 4, 6, 7, 8], [0, 9]]), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);",
      },
      {
        name: "the input arrays are not changed",
        body: "const input = [[1, 3], [2, 4]];\nmergeKSorted(input);\nassert.deepEqual(input, [[1, 3], [2, 4]]);",
      },
      {
        name: "random lists agree with concatenating and sorting",
        body: "let seed = 12345;\nconst rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) >>> 8);\nconst pick = (lo, hi) => lo + (rnd() % (hi - lo + 1));\nfor (let t = 0; t < 200; t++) {\n  const k = pick(0, 12);\n  const arrays = Array.from({ length: k }, () => Array.from({ length: pick(0, 8) }, () => pick(-9, 9)).sort((x, y) => x - y));\n  const expected = [].concat(...arrays).sort((x, y) => x - y);\n  assert.deepEqual(mergeKSorted(arrays), expected);\n}",
      },
      {
        name: "counts comparisons, so merging one array at a time fails",
        body: "let calls = 0;\nconst make = (v) => ({ v, valueOf() { calls++; return v; } });\nconst k = 64;\nconst per = 100;\nconst arrays = Array.from({ length: k }, (_, a) => Array.from({ length: per }, (_, i) => make(i * k + a)));\nconst out = mergeKSorted(arrays);\nassert.equal(out.length, k * per);\nfor (let i = 1; i < out.length; i++) assert.ok(out[i - 1].v <= out[i].v, 'not sorted at ' + i);\nconst n = k * per;\nassert.ok(calls < 4 * n * (Math.log2(k) + 1), 'used ' + calls + ' comparisons-worth of reads; halving needs about 2 * N * log2(k)');",
      },
    ],
  },
];
