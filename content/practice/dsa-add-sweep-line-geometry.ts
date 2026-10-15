import type { Exercise } from "../types";

export const dsaAddSweepLineGeometry: Exercise[] = [
  {
    "id": "ex-rank-transform-of-array",
    "chapter": "dsa-sweep-line-geometry",
    "level": "intermediate",
    "title": "Rank Transform of an Array",
    "brief": "<p>Given an array of integers <code>arr</code>, replace each element with its <b>rank</b>.</p><ul><li>The smallest distinct value has rank <code>1</code>, the next larger distinct value has rank <code>2</code>, and so on</li><li>Equal values get the same rank, and ranks have no gaps: <code>[40, 10, 40]</code> gives <code>[2, 1, 2]</code></li><li>The values can be negative and as large as <code>10<sup>9</sup></code>, so do not use a value as an array index</li><li>Return a new array and leave <code>arr</code> unchanged; an empty array gives <code>[]</code></li><li>Target: <b>O(n log n)</b> time</li></ul>",
    "starter": "function arrayRankTransform(arr) {\n  // TODO: sort the distinct values, then give each value its position\n}\n",
    "hints": [
      "Only the order of the values matters, not their size. Collect the distinct values and sort them.",
      "Sort with a comparator, <code>(a, b) => a - b</code>. The default sort compares text, so <code>[10, 9, 100]</code> would come out as 10, 100, 9.",
      "Build a Map from each distinct value to its index in the sorted list plus 1, then map the original array through it."
    ],
    "solution": "function arrayRankTransform(arr) {\n  const sorted = [...new Set(arr)].sort((a, b) => a - b);\n  const rank = new Map(sorted.map((value, i) => [value, i + 1]));\n  return arr.map((value) => rank.get(value));\n}\n",
    "tests": [
      {
        "name": "the basic example",
        "body": "assert.deepEqual(arrayRankTransform([40, 10, 20, 30]), [4, 1, 2, 3]);"
      },
      {
        "name": "equal values share a rank and there are no gaps",
        "body": "assert.deepEqual(arrayRankTransform([100, 100, 100]), [1, 1, 1]);\nassert.deepEqual(arrayRankTransform([40, 10, 40]), [2, 1, 2]);\nassert.deepEqual(arrayRankTransform([37, 12, 28, 9, 100, 56, 80, 5, 12]), [5, 3, 4, 2, 8, 6, 7, 1, 3]);"
      },
      {
        "name": "empty and single",
        "body": "assert.deepEqual(arrayRankTransform([]), []);\nassert.deepEqual(arrayRankTransform([7]), [1]);"
      },
      {
        "name": "negative values",
        "body": "assert.deepEqual(arrayRankTransform([-5, 3, -5, 0, -100]), [2, 4, 2, 3, 1]);"
      },
      {
        "name": "values compared as numbers, not as text",
        "body": "assert.deepEqual(arrayRankTransform([10, 9, 100, 1]), [3, 2, 4, 1]);"
      },
      {
        "name": "huge values",
        "body": "assert.deepEqual(arrayRankTransform([1000000000, 1, 999999999, -1000000000]), [4, 2, 3, 1]);"
      },
      {
        "name": "does not change the input",
        "body": "const input = [3, 1, 2, 1];\narrayRankTransform(input);\nassert.deepEqual(input, [3, 1, 2, 1]);"
      },
      {
        "name": "agrees with a brute force on random arrays",
        "body": "let seed = 11;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 200; round++) {\n  const n = rnd(12);\n  const arr = Array.from({ length: n }, () => rnd(15) - 7);\n  const expected = arr.map((v) => new Set(arr.filter((w) => w < v)).size + 1);\n  assert.deepEqual(arrayRankTransform(arr), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-full-bloom-flowers",
    "chapter": "dsa-sweep-line-geometry",
    "level": "intermediate",
    "title": "Number of Flowers in Full Bloom",
    "brief": "<p>Each flower blooms on the <b>closed</b> range <code>[start, end]</code>: it is in bloom at time <code>t</code> when <code>start &lt;= t &lt;= end</code>. Given <code>flowers</code> and an array <code>people</code> of arrival times, return an array with, for each person, how many flowers are in bloom when they arrive.</p><ul><li>The answer for each person goes at that person's original index</li><li>All arrival times are known up front, and they may repeat or be unsorted</li><li>A flower with <code>start === end</code> blooms for exactly one moment</li><li>Times can be as large as <code>10<sup>9</sup></code>; an empty <code>flowers</code> gives zeros, an empty <code>people</code> gives <code>[]</code></li><li>Target: <b>O((n + q) log n)</b>, not a scan of all flowers per person</li></ul>",
    "starter": "function fullBloomFlowers(flowers, people) {\n  // TODO: a flower is in bloom at t when it has started by t and has not ended before t\n}\n",
    "hints": [
      "Count the flowers that have started by time t, which is every flower with <code>start &lt;= t</code>. Then remove the ones that were already over.",
      "A flower with <code>end &lt; t</code> started by t as well, so it was counted and must be subtracted. The answer is (starts at most t) minus (ends below t).",
      "Sort the starts and the ends separately and answer each count with a binary search. The two searches differ: one counts values <code>&lt;= t</code>, the other values <code>&lt; t</code>."
    ],
    "solution": "function fullBloomFlowers(flowers, people) {\n  const starts = flowers.map(([start]) => start).sort((a, b) => a - b);\n  const ends = flowers.map(([, end]) => end).sort((a, b) => a - b);\n  const atMost = (sorted, t) => {\n    let lo = 0, hi = sorted.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (sorted[mid] <= t) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  };\n  const below = (sorted, t) => {\n    let lo = 0, hi = sorted.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (sorted[mid] < t) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  };\n  return people.map((t) => atMost(starts, t) - below(ends, t));\n}\n",
    "tests": [
      {
        "name": "the first example",
        "body": "assert.deepEqual(fullBloomFlowers([[1, 6], [3, 7], [9, 12], [4, 13]], [2, 3, 7, 11]), [1, 2, 2, 2]);"
      },
      {
        "name": "the second example, with unsorted arrivals",
        "body": "assert.deepEqual(fullBloomFlowers([[19, 37], [19, 38], [19, 35]], [6, 7, 21, 1, 13, 37, 5, 37, 46, 43]), [0, 0, 3, 0, 0, 2, 0, 2, 0, 0]);"
      },
      {
        "name": "both ends of the range count",
        "body": "assert.deepEqual(fullBloomFlowers([[2, 5]], [1, 2, 3, 5, 6]), [0, 1, 1, 1, 0]);"
      },
      {
        "name": "a flower that blooms for a single moment",
        "body": "assert.deepEqual(fullBloomFlowers([[5, 5], [5, 5]], [4, 5, 6]), [0, 2, 0]);"
      },
      {
        "name": "no flowers and no people",
        "body": "assert.deepEqual(fullBloomFlowers([], [1, 2]), [0, 0]);\nassert.deepEqual(fullBloomFlowers([[1, 2]], []), []);"
      },
      {
        "name": "huge times",
        "body": "assert.deepEqual(fullBloomFlowers([[1, 1000000000], [500000000, 1000000000]], [1, 500000000, 1000000000]), [1, 2, 2]);"
      },
      {
        "name": "does not change its inputs",
        "body": "const flowers = [[3, 4], [1, 9]];\nconst people = [5, 1];\nfullBloomFlowers(flowers, people);\nassert.deepEqual(flowers, [[3, 4], [1, 9]]);\nassert.deepEqual(people, [5, 1]);"
      },
      {
        "name": "agrees with a brute force on random inputs",
        "body": "let seed = 23;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 300; round++) {\n  const flowers = Array.from({ length: rnd(9) }, () => { const s = 1 + rnd(12); return [s, s + rnd(6)]; });\n  const people = Array.from({ length: rnd(9) }, () => rnd(22));\n  const expected = people.map((t) => flowers.filter(([s, e]) => s <= t && t <= e).length);\n  assert.deepEqual(fullBloomFlowers(flowers, people), expected);\n}"
      },
      {
        "name": "handles many flowers and people quickly",
        "body": "let seed = 5;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst flowers = Array.from({ length: 50000 }, () => { const s = rnd(1000000); return [s, s + rnd(1000)]; });\nconst people = Array.from({ length: 50000 }, () => rnd(1001000));\nconst got = fullBloomFlowers(flowers, people);\nassert.equal(got.length, 50000);\nfor (let k = 0; k < 20; k++) {\n  const t = people[k];\n  assert.equal(got[k], flowers.filter(([s, e]) => s <= t && t <= e).length);\n}"
      }
    ]
  },
  {
    "id": "ex-skyline-problem",
    "chapter": "dsa-sweep-line-geometry",
    "level": "advanced",
    "title": "The Skyline Problem",
    "brief": "<p>Each building is <code>[left, right, height]</code>: it stands on the ground from <code>left</code> up to, but not including, <code>right</code>. Return the outline of all the buildings as a list of <b>key points</b> <code>[x, height]</code> sorted by x.</p><ul><li>A key point is the left end of a flat stretch of the outline; the last key point has height <code>0</code></li><li>Two neighbouring stretches of the same height are one stretch: do not report a key point between them</li><li>Every building is wider than zero, and the input is not sorted</li><li>Coordinates can be as large as <code>2<sup>31</sup> - 1</code>, so the width of the range cannot be used as a cost</li><li>Do not change the input; no buildings gives <code>[]</code></li><li>Target: <b>O(n log n)</b></li></ul>",
    "starter": "function getSkyline(buildings) {\n  // TODO: sweep the sorted edge coordinates and keep the covering buildings in a heap\n}\n",
    "hints": [
      "The outline can only change at a left or right edge, so only those 2n coordinates need to be looked at. At each one you need the tallest building covering it.",
      "Keep the buildings that have started in a max-heap of [height, right]. Do not remove a building when it ends; discard entries from the top while <code>right &lt;= x</code>, because only the top is ever read.",
      "Push every building with <code>left &lt;= x</code>, pop the ended tops, read the height (0 for an empty heap), and add <code>[x, height]</code> only when it differs from the previous height."
    ],
    "solution": "class Heap {\n  constructor(before) {\n    this.before = before;\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  peek() {\n    return this.items[0];\n  }\n  push(value) {\n    const a = this.items;\n    a.push(value);\n    let i = a.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (!this.before(a[i], a[parent])) break;\n      [a[parent], a[i]] = [a[i], a[parent]];\n      i = parent;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const left = 2 * i + 1, right = left + 1;\n        let first = i;\n        if (left < a.length && this.before(a[left], a[first])) first = left;\n        if (right < a.length && this.before(a[right], a[first])) first = right;\n        if (first === i) break;\n        [a[first], a[i]] = [a[i], a[first]];\n        i = first;\n      }\n    }\n    return top;\n  }\n}\n\nfunction getSkyline(buildings) {\n  const xs = [...new Set(buildings.flatMap(([left, right]) => [left, right]))].sort((a, b) => a - b);\n  const byLeft = [...buildings].sort((a, b) => a[0] - b[0]);\n  const alive = new Heap((a, b) => a[0] > b[0]);\n  const skyline = [];\n  let next = 0, previous = 0;\n  for (const x of xs) {\n    while (next < byLeft.length && byLeft[next][0] <= x) {\n      const [, right, height] = byLeft[next++];\n      alive.push([height, right]);\n    }\n    while (alive.size > 0 && alive.peek()[1] <= x) alive.pop();\n    const height = alive.size > 0 ? alive.peek()[0] : 0;\n    if (height !== previous) {\n      skyline.push([x, height]);\n      previous = height;\n    }\n  }\n  return skyline;\n}\n",
    "tests": [
      {
        "name": "the classic example",
        "body": "assert.deepEqual(getSkyline([[2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]]), [[2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0]]);"
      },
      {
        "name": "touching buildings of the same height make one stretch",
        "body": "assert.deepEqual(getSkyline([[0, 2, 3], [2, 5, 3]]), [[0, 3], [5, 0]]);"
      },
      {
        "name": "touching buildings of different heights",
        "body": "assert.deepEqual(getSkyline([[1, 3, 2], [3, 5, 4]]), [[1, 2], [3, 4], [5, 0]]);"
      },
      {
        "name": "one building and no buildings",
        "body": "assert.deepEqual(getSkyline([[1, 5, 7]]), [[1, 7], [5, 0]]);\nassert.deepEqual(getSkyline([]), []);"
      },
      {
        "name": "buildings that share an edge, and a hidden one",
        "body": "assert.deepEqual(getSkyline([[0, 2, 3], [0, 2, 5]]), [[0, 5], [2, 0]]);\nassert.deepEqual(getSkyline([[0, 10, 8], [2, 4, 3]]), [[0, 8], [10, 0]]);\nassert.deepEqual(getSkyline([[1, 5, 4], [2, 4, 6], [3, 7, 3]]), [[1, 4], [2, 6], [4, 4], [5, 3], [7, 0]]);"
      },
      {
        "name": "a gap between buildings",
        "body": "assert.deepEqual(getSkyline([[1, 2, 1], [4, 5, 1]]), [[1, 1], [2, 0], [4, 1], [5, 0]]);"
      },
      {
        "name": "huge coordinates",
        "body": "assert.deepEqual(getSkyline([[0, 2147483647, 5], [1000000000, 2000000000, 9]]), [[0, 5], [1000000000, 9], [2000000000, 5], [2147483647, 0]]);"
      },
      {
        "name": "does not change the input",
        "body": "const input = [[5, 8, 2], [1, 6, 4]];\ngetSkyline(input);\nassert.deepEqual(input, [[5, 8, 2], [1, 6, 4]]);"
      },
      {
        "name": "agrees with a brute force on random buildings",
        "body": "let seed = 31;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfunction brute(bs) {\n  const out = [];\n  let prev = 0;\n  for (let x = 0; x <= 40; x++) {\n    let h = 0;\n    for (const [l, r, hh] of bs) if (l <= x && x < r) h = Math.max(h, hh);\n    if (h !== prev) { out.push([x, h]); prev = h; }\n  }\n  return out;\n}\nfor (let round = 0; round < 300; round++) {\n  const bs = Array.from({ length: rnd(9) }, () => { const l = rnd(16); return [l, l + 1 + rnd(10), 1 + rnd(9)]; });\n  assert.deepEqual(getSkyline(bs), brute(bs));\n}"
      },
      {
        "name": "handles twenty thousand buildings",
        "body": "let seed = 3;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst bs = Array.from({ length: 20000 }, () => { const l = rnd(1000000000); return [l, l + 1 + rnd(100000000), 1 + rnd(1000000)]; });\nconst sky = getSkyline(bs);\nassert.ok(sky.length > 0 && sky[sky.length - 1][1] === 0);\nfor (let i = 1; i < sky.length; i++) {\n  assert.ok(sky[i][0] > sky[i - 1][0]);\n  assert.ok(sky[i][1] !== sky[i - 1][1]);\n}"
      }
    ]
  },
  {
    "id": "ex-minimum-interval-queries",
    "chapter": "dsa-sweep-line-geometry",
    "level": "advanced",
    "title": "Minimum Interval to Include Each Query",
    "brief": "<p>You are given <code>intervals</code>, where <code>[left, right]</code> is a closed range of size <code>right - left + 1</code>, and an array <code>queries</code>. For each query <code>q</code>, return the <b>size of the smallest interval that contains <code>q</code></b> (<code>left &lt;= q &lt;= right</code>), or <code>-1</code> if no interval contains it.</p><ul><li>The answer for each query goes at that query's original index; queries may be unsorted or repeat</li><li>All queries are known up front</li><li>Do not change the inputs; no intervals gives <code>-1</code> for every query</li><li>Target: <b>O((n + q) log(n + q))</b>, not a scan of every interval per query</li></ul>",
    "starter": "function minInterval(intervals, queries) {\n  // TODO: process the queries in increasing order, but write each answer at its original index\n}\n",
    "hints": [
      "If you answer the queries in increasing order, an interval that has ended before the current query has also ended before every later one. That makes it safe to forget it for good.",
      "Sort the intervals by left end and the query indices by query value. For each query, push every interval with <code>left &lt;= q</code> into a min-heap ordered by size, storing its right end too.",
      "Pop the top while its right end is below q, since it can no longer contain this or any later query. If the heap is not empty, its top size is the answer; otherwise -1."
    ],
    "solution": "class Heap {\n  constructor(before) {\n    this.before = before;\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  peek() {\n    return this.items[0];\n  }\n  push(value) {\n    const a = this.items;\n    a.push(value);\n    let i = a.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (!this.before(a[i], a[parent])) break;\n      [a[parent], a[i]] = [a[i], a[parent]];\n      i = parent;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const left = 2 * i + 1, right = left + 1;\n        let first = i;\n        if (left < a.length && this.before(a[left], a[first])) first = left;\n        if (right < a.length && this.before(a[right], a[first])) first = right;\n        if (first === i) break;\n        [a[first], a[i]] = [a[i], a[first]];\n        i = first;\n      }\n    }\n    return top;\n  }\n}\n\nfunction minInterval(intervals, queries) {\n  const byLeft = [...intervals].sort((a, b) => a[0] - b[0]);\n  const order = queries.map((_, i) => i).sort((a, b) => queries[a] - queries[b]);\n  const open = new Heap((a, b) => a[0] < b[0]);\n  const answer = new Array(queries.length).fill(-1);\n  let next = 0;\n  for (const qi of order) {\n    const q = queries[qi];\n    while (next < byLeft.length && byLeft[next][0] <= q) {\n      const [left, right] = byLeft[next++];\n      open.push([right - left + 1, right]);\n    }\n    while (open.size > 0 && open.peek()[1] < q) open.pop();\n    if (open.size > 0) answer[qi] = open.peek()[0];\n  }\n  return answer;\n}\n",
    "tests": [
      {
        "name": "the first example",
        "body": "assert.deepEqual(minInterval([[1, 4], [2, 4], [3, 6], [4, 4]], [2, 3, 4, 5]), [3, 3, 1, 4]);"
      },
      {
        "name": "the second example, with an unsorted query list",
        "body": "assert.deepEqual(minInterval([[2, 3], [2, 5], [1, 8], [20, 25]], [2, 19, 5, 22]), [2, -1, 4, 6]);"
      },
      {
        "name": "both ends of an interval are included",
        "body": "assert.deepEqual(minInterval([[3, 7]], [2, 3, 7, 8]), [-1, 5, 5, -1]);"
      },
      {
        "name": "no intervals",
        "body": "assert.deepEqual(minInterval([], [1, 2, 3]), [-1, -1, -1]);\nassert.deepEqual(minInterval([[1, 2]], []), []);"
      },
      {
        "name": "repeated queries get repeated answers",
        "body": "assert.deepEqual(minInterval([[1, 10], [4, 5]], [5, 5, 9, 5]), [2, 2, 10, 2]);"
      },
      {
        "name": "answers go back to the original positions",
        "body": "assert.deepEqual(minInterval([[1, 2], [5, 9]], [9, 1, 5, 3]), [5, 2, 5, -1]);"
      },
      {
        "name": "does not change its inputs",
        "body": "const intervals = [[5, 9], [1, 2]];\nconst queries = [9, 1];\nminInterval(intervals, queries);\nassert.deepEqual(intervals, [[5, 9], [1, 2]]);\nassert.deepEqual(queries, [9, 1]);"
      },
      {
        "name": "agrees with a brute force on random inputs",
        "body": "let seed = 41;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 300; round++) {\n  const intervals = Array.from({ length: rnd(9) }, () => { const l = 1 + rnd(12); return [l, l + rnd(7)]; });\n  const queries = Array.from({ length: rnd(9) }, () => rnd(21));\n  const expected = queries.map((q) => {\n    let best = -1;\n    for (const [l, r] of intervals) if (l <= q && q <= r && (best === -1 || r - l + 1 < best)) best = r - l + 1;\n    return best;\n  });\n  assert.deepEqual(minInterval(intervals, queries), expected);\n}"
      },
      {
        "name": "handles fifty thousand intervals and queries",
        "body": "let seed = 9;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst intervals = Array.from({ length: 50000 }, () => { const l = 1 + rnd(1000000); return [l, l + rnd(5000)]; });\nconst queries = Array.from({ length: 50000 }, () => 1 + rnd(1005000));\nconst got = minInterval(intervals, queries);\nassert.equal(got.length, 50000);\nfor (let k = 0; k < 10; k++) {\n  const q = queries[k];\n  let best = -1;\n  for (const [l, r] of intervals) if (l <= q && q <= r && (best === -1 || r - l + 1 < best)) best = r - l + 1;\n  assert.equal(got[k], best);\n}"
      }
    ]
  },
  {
    "id": "ex-rectangle-union-area",
    "chapter": "dsa-sweep-line-geometry",
    "level": "advanced",
    "title": "Area of the Union of Rectangles",
    "brief": "<p>Each rectangle is <code>[x1, y1, x2, y2]</code>, with <code>(x1, y1)</code> the bottom-left corner and <code>(x2, y2)</code> the top-right corner. Return the total area covered by <b>at least one</b> rectangle, counting overlaps once, <b>modulo <code>1000000007</code></b>.</p><ul><li>Coordinates are integers from <code>0</code> to <code>10<sup>9</sup></code>, so the true area can reach <code>10<sup>18</sup></code>, past what a <code>Number</code> stores exactly</li><li>Rectangles can overlap, nest, touch or repeat; an empty list gives <code>0</code></li><li>Do not change the input</li><li>Target: <b>O(n log n)</b> with a sweep and a segment tree over the compressed y coordinates; an <b>O(n²)</b> slab-by-slab version is a fine first step</li></ul>",
    "starter": "function rectangleArea(rectangles) {\n  // TODO: sweep along x; between two x values the covered height is constant\n}\n",
    "hints": [
      "Between two consecutive distinct x coordinates the set of rectangles covering the slab does not change, so the slab contributes width times the covered height. The covered height is the length of the union of the y-ranges of those rectangles.",
      "A simple version: for each slab, take the rectangles that span it, sort their y-ranges (or sort all rectangles by bottom edge once), and merge them while keeping the highest point covered so far. That is O(n²).",
      "The area can pass 2<sup>53</sup>, so multiply and add in <code>BigInt</code> and take <code>% 1000000007n</code> at the end. For O(n log n), keep a segment tree over the y gaps with a cover count and a covered length per node, and add rectangles at x1 and remove them at x2."
    ],
    "solution": "function rectangleArea(rectangles) {\n  const ys = [...new Set(rectangles.flatMap(([, y1, , y2]) => [y1, y2]))].sort((a, b) => a - b);\n  const yIndex = new Map(ys.map((y, i) => [y, i]));\n  const segments = ys.length - 1;\n  if (segments < 1) return 0;\n  const cover = new Array(4 * segments).fill(0);\n  const length = new Array(4 * segments).fill(0);\n\n  function update(node, lo, hi, from, to, delta) {\n    if (to <= lo || hi <= from) return;\n    if (from <= lo && hi <= to) {\n      cover[node] += delta;\n    } else {\n      const mid = (lo + hi) >> 1;\n      update(2 * node, lo, mid, from, to, delta);\n      update(2 * node + 1, mid, hi, from, to, delta);\n    }\n    if (cover[node] > 0) length[node] = ys[hi] - ys[lo];\n    else if (hi - lo === 1) length[node] = 0;\n    else length[node] = length[2 * node] + length[2 * node + 1];\n  }\n\n  const events = [];\n  for (const [x1, y1, x2, y2] of rectangles) {\n    if (x1 === x2 || y1 === y2) continue;\n    events.push([x1, 1, yIndex.get(y1), yIndex.get(y2)]);\n    events.push([x2, -1, yIndex.get(y1), yIndex.get(y2)]);\n  }\n  events.sort((a, b) => a[0] - b[0]);\n  let total = 0n;\n  let previousX = events.length > 0 ? events[0][0] : 0;\n  for (const [x, delta, from, to] of events) {\n    total += BigInt(x - previousX) * BigInt(length[1]);\n    previousX = x;\n    update(1, 0, segments, from, to, delta);\n  }\n  return Number(total % 1000000007n);\n}\n",
    "tests": [
      {
        "name": "overlapping rectangles",
        "body": "assert.equal(rectangleArea([[0, 0, 2, 2], [1, 0, 2, 3], [1, 0, 3, 1]]), 6);"
      },
      {
        "name": "one huge square, taken modulo 1000000007",
        "body": "assert.equal(rectangleArea([[0, 0, 1000000000, 1000000000]]), 49);\nassert.equal(rectangleArea([[0, 0, 1000000000, 1000000000], [0, 0, 1000000000, 1000000000]]), 49);"
      },
      {
        "name": "no rectangles, and a single one",
        "body": "assert.equal(rectangleArea([]), 0);\nassert.equal(rectangleArea([[1, 1, 4, 3]]), 6);"
      },
      {
        "name": "rectangles that touch but do not overlap",
        "body": "assert.equal(rectangleArea([[0, 0, 1, 1], [1, 0, 2, 1], [0, 1, 2, 2]]), 4);"
      },
      {
        "name": "nested and identical rectangles count once",
        "body": "assert.equal(rectangleArea([[0, 0, 10, 10], [2, 2, 5, 5], [0, 0, 10, 10]]), 100);"
      },
      {
        "name": "a plus shape",
        "body": "assert.equal(rectangleArea([[0, 1, 3, 2], [1, 0, 2, 3]]), 5);"
      },
      {
        "name": "rectangles with no area add nothing",
        "body": "assert.equal(rectangleArea([[1, 1, 1, 5], [2, 3, 6, 3], [0, 0, 2, 2]]), 4);"
      },
      {
        "name": "does not change the input",
        "body": "const input = [[3, 3, 5, 5], [0, 0, 4, 4]];\nrectangleArea(input);\nassert.deepEqual(input, [[3, 3, 5, 5], [0, 0, 4, 4]]);"
      },
      {
        "name": "agrees with a cell count on random small rectangles",
        "body": "let seed = 51;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 300; round++) {\n  const rects = Array.from({ length: rnd(8) }, () => { const x = rnd(10), y = rnd(10); return [x, y, x + rnd(6), y + rnd(6)]; });\n  const cells = new Set();\n  for (const [x1, y1, x2, y2] of rects) for (let x = x1; x < x2; x++) for (let y = y1; y < y2; y++) cells.add(x + ',' + y);\n  assert.equal(rectangleArea(rects), cells.size);\n}"
      },
      {
        "name": "agrees with a slab-by-slab BigInt version on large coordinates",
        "body": "let seed = 61;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfunction slabs(rects) {\n  const xs = [...new Set(rects.flatMap(([a, , c]) => [a, c]))].sort((p, q) => p - q);\n  let total = 0n;\n  for (let i = 0; i + 1 < xs.length; i++) {\n    const spans = rects.filter(([a, , c]) => a <= xs[i] && xs[i + 1] <= c).map(([, b, , d]) => [b, d]).sort((p, q) => p[0] - q[0]);\n    let covered = 0, reach = -1;\n    for (const [lo, hi] of spans) {\n      if (hi <= reach) continue;\n      covered += hi - Math.max(lo, reach);\n      reach = hi;\n    }\n    total += BigInt(xs[i + 1] - xs[i]) * BigInt(covered);\n  }\n  return Number(total % 1000000007n);\n}\nfor (let round = 0; round < 60; round++) {\n  const rects = Array.from({ length: 1 + rnd(30) }, () => { const x = rnd(1000000000 - 10), y = rnd(1000000000 - 10); return [x, y, x + 1 + rnd(1000000000 - x - 1), y + 1 + rnd(1000000000 - y - 1)]; });\n  assert.equal(rectangleArea(rects), slabs(rects));\n}"
      }
    ]
  },
  {
    "id": "ex-segments-intersect",
    "chapter": "dsa-sweep-line-geometry",
    "level": "intermediate",
    "title": "Do Two Segments Intersect?",
    "brief": "<p>Each segment is given by two integer points <code>[x, y]</code>. Return <code>true</code> if the segment <code>ab</code> and the segment <code>cd</code> share <b>at least one point</b>.</p><ul><li>Touching counts: an endpoint lying on the other segment, or two segments meeting at an endpoint, both intersect</li><li>Collinear segments intersect when they overlap or touch, and do not when there is a gap between them</li><li>A segment may be a single point, when its two ends are equal</li><li>Coordinates are integers up to <code>10<sup>7</sup></code> in absolute value, so use integer arithmetic only</li><li>The answer must not depend on which segment is first or on the order of the endpoints</li></ul>",
    "starter": "function segmentsIntersect(a, b, c, d) {\n  // TODO: orientation of three points is the sign of a cross product\n}\n",
    "hints": [
      "The cross product of (b - a) and (c - a) is positive for a left turn, negative for a right turn and zero when the three points are collinear. Reduce it to -1, 0 or 1 with the sign.",
      "The segments cross properly when c and d are on different sides of line ab and a and b are on different sides of line cd. Compare the signs with !==; do not multiply two cross products.",
      "That test misses the collinear cases. Add four checks: when an orientation is 0 and that endpoint lies inside the other segment's bounding box (between its ends in x and in y), the segments touch."
    ],
    "solution": "function segmentsIntersect(a, b, c, d) {\n  const cross = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);\n  const side = (o, p, q) => {\n    const value = cross(o, p, q);\n    return value > 0 ? 1 : value < 0 ? -1 : 0;\n  };\n  const onSegment = (p, q, r) =>\n    cross(p, q, r) === 0 &&\n    Math.min(p[0], q[0]) <= r[0] && r[0] <= Math.max(p[0], q[0]) &&\n    Math.min(p[1], q[1]) <= r[1] && r[1] <= Math.max(p[1], q[1]);\n  const o1 = side(a, b, c), o2 = side(a, b, d);\n  const o3 = side(c, d, a), o4 = side(c, d, b);\n  if (o1 !== o2 && o3 !== o4) return true;\n  if (o1 === 0 && onSegment(a, b, c)) return true;\n  if (o2 === 0 && onSegment(a, b, d)) return true;\n  if (o3 === 0 && onSegment(c, d, a)) return true;\n  if (o4 === 0 && onSegment(c, d, b)) return true;\n  return false;\n}\n",
    "tests": [
      {
        "name": "two segments crossing like an X",
        "body": "assert.equal(segmentsIntersect([0, 0], [4, 4], [0, 4], [4, 0]), true);"
      },
      {
        "name": "a T: an endpoint in the middle of the other segment",
        "body": "assert.equal(segmentsIntersect([0, 0], [4, 0], [2, 0], [2, 3]), true);\nassert.equal(segmentsIntersect([2, 3], [2, 0], [4, 0], [0, 0]), true);"
      },
      {
        "name": "two segments sharing one endpoint",
        "body": "assert.equal(segmentsIntersect([0, 0], [2, 2], [2, 2], [4, 0]), true);"
      },
      {
        "name": "collinear segments that overlap or touch",
        "body": "assert.equal(segmentsIntersect([0, 0], [3, 3], [2, 2], [5, 5]), true);\nassert.equal(segmentsIntersect([0, 0], [2, 2], [2, 2], [4, 4]), true);\nassert.equal(segmentsIntersect([0, 0], [10, 0], [3, 0], [4, 0]), true);"
      },
      {
        "name": "collinear segments with a gap",
        "body": "assert.equal(segmentsIntersect([0, 0], [1, 1], [2, 2], [3, 3]), false);\nassert.equal(segmentsIntersect([0, 0], [0, 1], [0, 3], [0, 5]), false);"
      },
      {
        "name": "parallel segments",
        "body": "assert.equal(segmentsIntersect([0, 0], [4, 0], [0, 1], [4, 1]), false);"
      },
      {
        "name": "the lines cross but the segments do not",
        "body": "assert.equal(segmentsIntersect([0, 0], [4, 0], [5, -1], [5, 1]), false);\nassert.equal(segmentsIntersect([0, 0], [1, 1], [3, 0], [0, 3]), false);"
      },
      {
        "name": "a segment that is a single point",
        "body": "assert.equal(segmentsIntersect([2, 2], [2, 2], [0, 0], [4, 4]), true);\nassert.equal(segmentsIntersect([2, 3], [2, 3], [0, 0], [4, 4]), false);\nassert.equal(segmentsIntersect([1, 1], [1, 1], [1, 1], [1, 1]), true);\nassert.equal(segmentsIntersect([1, 1], [1, 1], [2, 2], [2, 2]), false);"
      },
      {
        "name": "large coordinates",
        "body": "assert.equal(segmentsIntersect([-10000000, -10000000], [10000000, 10000000], [-10000000, 10000000], [10000000, -10000000]), true);\nassert.equal(segmentsIntersect([-10000000, -10000000], [9999999, 10000000], [-10000000, 10000000], [-9999999, 10000000]), false);"
      },
      {
        "name": "agrees with an exact parametric check on random segments",
        "body": "let seed = 71;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfunction brute(a, b, c, d) {\n  const sub = (u, v) => [v[0] - u[0], v[1] - u[1]];\n  const cr = (u, v) => u[0] * v[1] - u[1] * v[0];\n  const onSeg = (p, u, v) => {\n    const uv = sub(u, v), up = sub(u, p);\n    if (uv[0] === 0 && uv[1] === 0) return up[0] === 0 && up[1] === 0;\n    if (cr(uv, up) !== 0) return false;\n    const dot = uv[0] * up[0] + uv[1] * up[1];\n    return dot >= 0 && dot <= uv[0] * uv[0] + uv[1] * uv[1];\n  };\n  const ab = sub(a, b), cd = sub(c, d);\n  if (ab[0] === 0 && ab[1] === 0) return onSeg(a, c, d);\n  if (cd[0] === 0 && cd[1] === 0) return onSeg(c, a, b);\n  const den = cr(ab, cd);\n  const ac = sub(a, c);\n  if (den === 0) {\n    if (cr(ab, ac) !== 0) return false;\n    const len = ab[0] * ab[0] + ab[1] * ab[1];\n    const tc = ab[0] * ac[0] + ab[1] * ac[1];\n    const ad = sub(a, d);\n    const td = ab[0] * ad[0] + ab[1] * ad[1];\n    return Math.max(Math.min(tc, td), 0) <= Math.min(Math.max(tc, td), len);\n  }\n  let tn = cr(ac, cd), un = cr(ac, ab), dn = den;\n  if (dn < 0) { tn = -tn; un = -un; dn = -dn; }\n  return tn >= 0 && tn <= dn && un >= 0 && un <= dn;\n}\nconst pt = () => [rnd(5), rnd(5)];\nfor (let round = 0; round < 3000; round++) {\n  const a = pt(), b = pt(), c = pt(), d = pt();\n  const expected = brute(a, b, c, d);\n  assert.equal(segmentsIntersect(a, b, c, d), expected);\n  assert.equal(segmentsIntersect(c, d, a, b), expected);\n  assert.equal(segmentsIntersect(b, a, d, c), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-polygon-doubled-area",
    "chapter": "dsa-sweep-line-geometry",
    "level": "intermediate",
    "title": "Polygon Area by the Shoelace Formula",
    "brief": "<p>Given the vertices of a simple polygon (its edges do not cross) as integer points <code>[x, y]</code>, listed in order around the boundary, return <b>twice its area</b> as an integer.</p><ul><li>The order may be clockwise or counter-clockwise, and it may start at any vertex; the answer is never negative</li><li>The polygon can be concave</li><li>Returning twice the area keeps every value an integer, so nothing needs rounding</li><li>Fewer than three vertices, or all vertices on one line, give <code>0</code></li><li>Coordinates are integers up to <code>10<sup>7</sup></code> in absolute value</li><li>Do not change the input</li></ul>",
    "starter": "function polygonDoubledArea(points) {\n  // TODO: add up the cross products of a fan of triangles\n}\n",
    "hints": [
      "The cross product of (b - o) and (c - o) is twice the signed area of the triangle o, b, c: positive for counter-clockwise, negative for clockwise.",
      "Cut the polygon into the fan (p0, p1, p2), (p0, p2, p3), and so on, and add the signed cross products. For a simple polygon the signed pieces add up to the polygon's signed area, even when it is concave.",
      "Take the absolute value of the sum at the end. A polygon with fewer than 3 points has no fan triangles, so the loop adds nothing and returns 0."
    ],
    "solution": "function polygonDoubledArea(points) {\n  let sum = 0;\n  for (let i = 1; i + 1 < points.length; i++) {\n    const o = points[0], a = points[i], b = points[i + 1];\n    sum += (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);\n  }\n  return Math.abs(sum);\n}\n",
    "tests": [
      {
        "name": "a rectangle",
        "body": "assert.equal(polygonDoubledArea([[0, 0], [4, 0], [4, 3], [0, 3]]), 24);"
      },
      {
        "name": "a triangle",
        "body": "assert.equal(polygonDoubledArea([[0, 0], [4, 0], [0, 3]]), 12);"
      },
      {
        "name": "clockwise and counter-clockwise give the same answer",
        "body": "assert.equal(polygonDoubledArea([[0, 0], [0, 3], [4, 3], [4, 0]]), 24);\nassert.equal(polygonDoubledArea([[4, 3], [0, 3], [0, 0], [4, 0]]), 24);"
      },
      {
        "name": "a concave polygon",
        "body": "assert.equal(polygonDoubledArea([[0, 0], [6, 0], [6, 6], [3, 2], [0, 6]]), 48);"
      },
      {
        "name": "fewer than three points, or collinear points",
        "body": "assert.equal(polygonDoubledArea([]), 0);\nassert.equal(polygonDoubledArea([[1, 1]]), 0);\nassert.equal(polygonDoubledArea([[0, 0], [5, 5]]), 0);\nassert.equal(polygonDoubledArea([[0, 0], [1, 1], [2, 2], [3, 3]]), 0);"
      },
      {
        "name": "an odd doubled area stays an integer",
        "body": "assert.equal(polygonDoubledArea([[0, 0], [1, 0], [0, 1]]), 1);\nassert.equal(polygonDoubledArea([[0, 0], [3, 1], [1, 2]]), 5);"
      },
      {
        "name": "far from the origin",
        "body": "assert.equal(polygonDoubledArea([[10000000, 10000000], [10000004, 10000000], [10000004, 10000003], [10000000, 10000003]]), 24);\nassert.equal(polygonDoubledArea([[-9000000, -9000000], [-8999996, -9000000], [-8999996, -8999997], [-9000000, -8999997]]), 24);"
      },
      {
        "name": "does not change the input",
        "body": "const input = [[0, 0], [4, 0], [4, 3]];\npolygonDoubledArea(input);\nassert.deepEqual(input, [[0, 0], [4, 0], [4, 3]]);"
      },
      {
        "name": "random lattice rectangles and triangles, in every rotation of the vertex list",
        "body": "let seed = 81;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 200; round++) {\n  const x = rnd(20) - 10, y = rnd(20) - 10, w = 1 + rnd(9), h = 1 + rnd(9);\n  const rect = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];\n  for (let shift = 0; shift < 4; shift++) {\n    assert.equal(polygonDoubledArea([...rect.slice(shift), ...rect.slice(0, shift)]), 2 * w * h);\n  }\n  const a = [rnd(15), rnd(15)], b = [rnd(15), rnd(15)], c = [rnd(15), rnd(15)];\n  const expected = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));\n  assert.equal(polygonDoubledArea([a, b, c]), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-point-in-polygon",
    "chapter": "dsa-sweep-line-geometry",
    "level": "advanced",
    "title": "Point in Polygon",
    "brief": "<p>Given a point <code>[x, y]</code> and a simple polygon (a list of integer vertices in order around the boundary, clockwise or counter-clockwise, possibly concave), return <code>\"inside\"</code>, <code>\"boundary\"</code> or <code>\"outside\"</code>.</p><ul><li><code>\"boundary\"</code> means the point lies on an edge, including at a vertex</li><li>A ray from the point passing exactly through a vertex, or along a horizontal edge, must still give the right answer</li><li>Coordinates are integers up to <code>10<sup>7</sup></code> in absolute value, so use integer arithmetic and no division</li><li>Do not change the input</li></ul>",
    "starter": "function pointInPolygon(point, polygon) {\n  // TODO: check the boundary first, then count crossings of a ray to the right\n}\n",
    "hints": [
      "First test every edge: a point is on the boundary when the cross product with the edge is 0 and the point lies between the edge's ends in x and in y.",
      "Shoot a ray to the right. The point is inside when it crosses an odd number of edges. Count an edge only when exactly one of its ends is strictly above the point's row, so a vertex on the row is never touched and a horizontal edge never counts.",
      "For a counted edge going up (b.y &gt; a.y), the crossing is to the right of the point when cross(a, b, p) &gt; 0; for an edge going down, when cross(a, b, p) &lt; 0. No division is needed."
    ],
    "solution": "function pointInPolygon(point, polygon) {\n  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);\n  let crossings = 0;\n  for (let i = 0; i < polygon.length; i++) {\n    const a = polygon[i], b = polygon[(i + 1) % polygon.length];\n    const side = cross(a, b, point);\n    if (\n      side === 0 &&\n      Math.min(a[0], b[0]) <= point[0] && point[0] <= Math.max(a[0], b[0]) &&\n      Math.min(a[1], b[1]) <= point[1] && point[1] <= Math.max(a[1], b[1])\n    ) {\n      return \"boundary\";\n    }\n    if ((a[1] > point[1]) !== (b[1] > point[1])) {\n      if (b[1] > a[1] ? side > 0 : side < 0) crossings++;\n    }\n  }\n  return crossings % 2 === 1 ? \"inside\" : \"outside\";\n}\n",
    "tests": [
      {
        "name": "inside and outside a square",
        "body": "const square = [[0, 0], [4, 0], [4, 4], [0, 4]];\nassert.equal(pointInPolygon([2, 2], square), 'inside');\nassert.equal(pointInPolygon([5, 2], square), 'outside');\nassert.equal(pointInPolygon([-1, -1], square), 'outside');"
      },
      {
        "name": "points on an edge or a vertex",
        "body": "const square = [[0, 0], [4, 0], [4, 4], [0, 4]];\nassert.equal(pointInPolygon([2, 0], square), 'boundary');\nassert.equal(pointInPolygon([4, 3], square), 'boundary');\nassert.equal(pointInPolygon([0, 0], square), 'boundary');\nassert.equal(pointInPolygon([4, 4], square), 'boundary');"
      },
      {
        "name": "a ray that goes through a vertex",
        "body": "const diamond = [[2, 0], [4, 2], [2, 4], [0, 2]];\nassert.equal(pointInPolygon([1, 2], diamond), 'inside');\nassert.equal(pointInPolygon([5, 2], diamond), 'outside');\nassert.equal(pointInPolygon([-1, 2], diamond), 'outside');\nassert.equal(pointInPolygon([4, 2], diamond), 'boundary');"
      },
      {
        "name": "a ray along the row of a vertex or a flat edge",
        "body": "const house = [[0, 0], [6, 0], [6, 4], [3, 6], [0, 4]];\nassert.equal(pointInPolygon([-2, 4], house), 'outside');\nassert.equal(pointInPolygon([1, 4], house), 'inside');\nassert.equal(pointInPolygon([7, 4], house), 'outside');\nassert.equal(pointInPolygon([3, 4], house), 'inside');\nconst flat = [[0, 0], [4, 0], [4, 4], [0, 4]];\nassert.equal(pointInPolygon([-2, 4], flat), 'outside');\nassert.equal(pointInPolygon([-2, 0], flat), 'outside');\nassert.equal(pointInPolygon([5, 4], flat), 'outside');"
      },
      {
        "name": "a concave polygon with a notch",
        "body": "const notch = [[0, 0], [6, 0], [6, 6], [3, 2], [0, 6]];\nassert.equal(pointInPolygon([3, 3], notch), 'outside');\nassert.equal(pointInPolygon([3, 1], notch), 'inside');\nassert.equal(pointInPolygon([3, 2], notch), 'boundary');\nassert.equal(pointInPolygon([1, 3], notch), 'inside');\nassert.equal(pointInPolygon([5, 3], notch), 'inside');\nassert.equal(pointInPolygon([1, 5], notch), 'outside');"
      },
      {
        "name": "the vertex order and direction do not matter",
        "body": "const a = [[0, 0], [5, 1], [4, 5], [1, 4]];\nconst b = [...a].reverse();\nconst c = [a[2], a[3], a[0], a[1]];\nfor (let x = -1; x <= 6; x++) {\n  for (let y = -1; y <= 6; y++) {\n    const expected = pointInPolygon([x, y], a);\n    assert.ok(['inside', 'boundary', 'outside'].includes(expected));\n    assert.equal(pointInPolygon([x, y], b), expected);\n    assert.equal(pointInPolygon([x, y], c), expected);\n  }\n}"
      },
      {
        "name": "large coordinates",
        "body": "const big = [[-10000000, -10000000], [10000000, -10000000], [10000000, 10000000], [-10000000, 10000000]];\nassert.equal(pointInPolygon([9999999, 9999999], big), 'inside');\nassert.equal(pointInPolygon([10000000, 0], big), 'boundary');"
      },
      {
        "name": "does not change the input",
        "body": "const polygon = [[0, 0], [4, 0], [4, 4]];\npointInPolygon([1, 1], polygon);\nassert.deepEqual(polygon, [[0, 0], [4, 0], [4, 4]]);"
      },
      {
        "name": "agrees with a winding-number check on random star-shaped polygons",
        "body": "let seed = 91;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst half = (v) => (v[1] > 0 || (v[1] === 0 && v[0] > 0) ? 0 : 1);\nconst crossOf = (u, v) => u[0] * v[1] - u[1] * v[0];\nfunction randomPolygon() {\n  for (;;) {\n    const c = [3 + rnd(5), 3 + rnd(5)];\n    const pts = [];\n    for (let i = 0; i < 3 + rnd(5); i++) {\n      const p = [rnd(11), rnd(11)];\n      if (p[0] !== c[0] || p[1] !== c[1]) pts.push(p);\n    }\n    if (pts.length < 3) continue;\n    const rel = (p) => [p[0] - c[0], p[1] - c[1]];\n    pts.sort((p, q) => half(rel(p)) - half(rel(q)) || -crossOf(rel(p), rel(q)));\n    let ok = true;\n    for (let i = 0; i < pts.length; i++) if (crossOf(rel(pts[i]), rel(pts[(i + 1) % pts.length])) <= 0) ok = false;\n    if (ok) return pts;\n  }\n}\nfunction winding(p, poly) {\n  let w = 0;\n  for (let i = 0; i < poly.length; i++) {\n    const a = poly[i], b = poly[(i + 1) % poly.length];\n    const side = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);\n    if (a[1] <= p[1]) { if (b[1] > p[1] && side > 0) w++; }\n    else if (b[1] <= p[1] && side < 0) w--;\n  }\n  return w;\n}\nfunction onBoundary(p, poly) {\n  for (let i = 0; i < poly.length; i++) {\n    const a = poly[i], b = poly[(i + 1) % poly.length];\n    const side = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);\n    if (side === 0 && Math.min(a[0], b[0]) <= p[0] && p[0] <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= p[1] && p[1] <= Math.max(a[1], b[1])) return true;\n  }\n  return false;\n}\nfor (let round = 0; round < 60; round++) {\n  const poly = randomPolygon();\n  for (let x = -1; x <= 11; x++) {\n    for (let y = -1; y <= 11; y++) {\n      const expected = onBoundary([x, y], poly) ? 'boundary' : winding([x, y], poly) !== 0 ? 'inside' : 'outside';\n      assert.equal(pointInPolygon([x, y], poly), expected);\n    }\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-rectangle-area-total",
    "chapter": "dsa-sweep-line-geometry",
    "level": "intermediate",
    "title": "Total Area of Two Rectangles",
    "brief": "<p>Each rectangle is <code>[x1, y1, x2, y2]</code>, with <code>(x1, y1)</code> the bottom-left corner and <code>(x2, y2)</code> the top-right corner, and <code>x1 &lt; x2</code>, <code>y1 &lt; y2</code>. Return the total area covered by the two rectangles, counting the part they share once.</p><ul><li>Rectangles that only touch along an edge or at a corner share no area</li><li>One rectangle may lie inside the other, or both may be identical</li><li>Coordinates are integers between <code>-10<sup>4</sup></code> and <code>10<sup>4</sup></code>, and may be negative</li><li>Do not change the input</li></ul>",
    "starter": "function totalArea(a, b) {\n  // TODO: area(a) + area(b) - overlap, where the overlap is clamped on each side\n}\n",
    "hints": [
      "The union area is the area of a plus the area of b minus the area they share. So the work is in finding the shared area.",
      "The shared region is a rectangle with width min(a.x2, b.x2) - max(a.x1, b.x1) and height min(a.y2, b.y2) - max(a.y1, b.y1).",
      "If the rectangles are apart, that width or height is negative. Clamp each of them at 0 separately, then multiply; clamping only the product lets two negative sides multiply into a positive number."
    ],
    "solution": "function totalArea(a, b) {\n  const area = (r) => (r[2] - r[0]) * (r[3] - r[1]);\n  const width = Math.min(a[2], b[2]) - Math.max(a[0], b[0]);\n  const height = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);\n  const shared = Math.max(0, width) * Math.max(0, height);\n  return area(a) + area(b) - shared;\n}\n",
    "tests": [
      {
        "name": "partly overlapping rectangles",
        "body": "assert.equal(totalArea([-3, 0, 3, 4], [0, -1, 9, 2]), 45);"
      },
      {
        "name": "identical rectangles",
        "body": "assert.equal(totalArea([-2, -2, 2, 2], [-2, -2, 2, 2]), 16);"
      },
      {
        "name": "one rectangle inside the other",
        "body": "assert.equal(totalArea([0, 0, 10, 10], [2, 3, 4, 5]), 100);\nassert.equal(totalArea([2, 3, 4, 5], [0, 0, 10, 10]), 100);"
      },
      {
        "name": "rectangles far apart, in both directions at once",
        "body": "assert.equal(totalArea([0, 0, 2, 2], [5, 5, 7, 8]), 10);\nassert.equal(totalArea([5, 5, 7, 8], [0, 0, 2, 2]), 10);"
      },
      {
        "name": "rectangles that only touch",
        "body": "assert.equal(totalArea([0, 0, 2, 2], [2, 0, 4, 2]), 8);\nassert.equal(totalArea([0, 0, 2, 2], [2, 2, 3, 3]), 5);"
      },
      {
        "name": "separated in x but overlapping in y",
        "body": "assert.equal(totalArea([0, 0, 2, 5], [3, 1, 6, 4]), 19);"
      },
      {
        "name": "large rectangles with negative coordinates",
        "body": "assert.equal(totalArea([-10000, -10000, 10000, 10000], [-10000, -10000, 10000, 10000]), 400000000);\nassert.equal(totalArea([-10000, -10000, 0, 0], [0, 0, 10000, 10000]), 200000000);"
      },
      {
        "name": "agrees with a cell count on random rectangles",
        "body": "let seed = 101;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst make = () => { const x = rnd(8) - 3, y = rnd(8) - 3; return [x, y, x + 1 + rnd(5), y + 1 + rnd(5)]; };\nfor (let round = 0; round < 500; round++) {\n  const a = make(), b = make();\n  const cells = new Set();\n  for (const [x1, y1, x2, y2] of [a, b]) for (let x = x1; x < x2; x++) for (let y = y1; y < y2; y++) cells.add(x + ',' + y);\n  assert.equal(totalArea(a, b), cells.size);\n}"
      }
    ]
  },
  {
    "id": "ex-perfect-rectangle",
    "chapter": "dsa-sweep-line-geometry",
    "level": "advanced",
    "title": "Perfect Rectangle",
    "brief": "<p>Given an array <code>rectangles</code>, where each is <code>[x1, y1, x2, y2]</code> with positive width and height, return <code>true</code> if together they cover <b>exactly</b> one larger rectangle: no gaps and no overlaps.</p><ul><li>An empty list returns <code>false</code>; a single rectangle returns <code>true</code></li><li>Rectangles that only touch along edges are fine; rectangles that share any area are an overlap</li><li>Coordinates are integers and can be negative</li><li>Target: <b>O(n)</b> time with a set; do not paint cells</li></ul>",
    "starter": "function isRectangleCover(rectangles) {\n  // TODO: two conditions: the areas add up to the bounding box, and the corners cancel\n}\n",
    "hints": [
      "Track the bounding box (smallest x1 and y1, largest x2 and y2) and the sum of the rectangle areas. In a perfect tiling the sum equals the bounding box's area.",
      "The area check alone is fooled when an overlap and a gap cancel out. Look at corners: in a perfect tiling every corner point is shared by an even number of tiles, except the four corners of the whole box.",
      "Toggle each rectangle's four corners in a Set (add if missing, remove if present). At the end the set must hold exactly the four bounding-box corners. Use string keys such as <code>x + ',' + y</code>."
    ],
    "solution": "function isRectangleCover(rectangles) {\n  let left = Infinity, bottom = Infinity, right = -Infinity, top = -Infinity, area = 0;\n  const corners = new Set();\n  const toggle = (x, y) => {\n    const key = x + ',' + y;\n    if (corners.has(key)) corners.delete(key);\n    else corners.add(key);\n  };\n  for (const [x1, y1, x2, y2] of rectangles) {\n    left = Math.min(left, x1);\n    bottom = Math.min(bottom, y1);\n    right = Math.max(right, x2);\n    top = Math.max(top, y2);\n    area += (x2 - x1) * (y2 - y1);\n    toggle(x1, y1);\n    toggle(x1, y2);\n    toggle(x2, y1);\n    toggle(x2, y2);\n  }\n  if (area !== (right - left) * (top - bottom)) return false;\n  return (\n    corners.size === 4 &&\n    corners.has(left + ',' + bottom) && corners.has(left + ',' + top) &&\n    corners.has(right + ',' + bottom) && corners.has(right + ',' + top)\n  );\n}\n",
    "tests": [
      {
        "name": "a perfect tiling of five rectangles",
        "body": "assert.equal(isRectangleCover([[1, 1, 3, 3], [3, 1, 4, 2], [3, 2, 4, 4], [1, 3, 2, 4], [2, 3, 3, 4]]), true);"
      },
      {
        "name": "a gap in the middle",
        "body": "assert.equal(isRectangleCover([[1, 1, 2, 3], [1, 3, 2, 4], [3, 1, 4, 2], [3, 2, 4, 4]]), false);"
      },
      {
        "name": "an overlap",
        "body": "assert.equal(isRectangleCover([[1, 1, 3, 3], [3, 1, 4, 2], [1, 3, 2, 4], [2, 2, 4, 4]]), false);"
      },
      {
        "name": "empty and single",
        "body": "assert.equal(isRectangleCover([]), false);\nassert.equal(isRectangleCover([[2, 3, 5, 9]]), true);"
      },
      {
        "name": "an overlap and a gap with the same total area",
        "body": "assert.equal(isRectangleCover([[0, 0, 1, 2], [0, 0, 2, 1]]), false);"
      },
      {
        "name": "copies of the same rectangle",
        "body": "assert.equal(isRectangleCover([[0, 0, 1, 1], [0, 0, 1, 1], [0, 0, 1, 1]]), false);\nassert.equal(isRectangleCover([[0, 0, 1, 1], [0, 0, 1, 1]]), false);"
      },
      {
        "name": "a 2 by 2 grid of squares, and a diagonal pair",
        "body": "assert.equal(isRectangleCover([[0, 0, 1, 1], [1, 0, 2, 1], [0, 1, 1, 2], [1, 1, 2, 2]]), true);\nassert.equal(isRectangleCover([[0, 0, 1, 1], [1, 1, 2, 2]]), false);"
      },
      {
        "name": "negative coordinates",
        "body": "assert.equal(isRectangleCover([[-3, -3, 0, 0], [0, -3, 3, 0], [-3, 0, 3, 3]]), true);\nassert.equal(isRectangleCover([[-3, -3, 0, 0], [0, -3, 3, 0], [-3, 1, 3, 3]]), false);"
      },
      {
        "name": "agrees with a cell-by-cell check on random tilings and broken tilings",
        "body": "let seed = 111;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfunction split(l, b, r, t, depth) {\n  if (depth === 0 || rnd(4) === 0 || (r - l < 2 && t - b < 2)) return [[l, b, r, t]];\n  if (r - l >= 2 && (t - b < 2 || rnd(2))) {\n    const m = l + 1 + rnd(r - l - 1);\n    return [...split(l, b, m, t, depth - 1), ...split(m, b, r, t, depth - 1)];\n  }\n  const m = b + 1 + rnd(t - b - 1);\n  return [...split(l, b, r, m, depth - 1), ...split(l, m, r, t, depth - 1)];\n}\nfunction cells(rects) {\n  if (rects.length === 0) return false;\n  let l = Infinity, b = Infinity, r = -Infinity, t = -Infinity;\n  for (const q of rects) { l = Math.min(l, q[0]); b = Math.min(b, q[1]); r = Math.max(r, q[2]); t = Math.max(t, q[3]); }\n  const count = new Map();\n  for (const [x1, y1, x2, y2] of rects) for (let x = x1; x < x2; x++) for (let y = y1; y < y2; y++) count.set(x + ',' + y, (count.get(x + ',' + y) || 0) + 1);\n  for (let x = l; x < r; x++) for (let y = b; y < t; y++) if (count.get(x + ',' + y) !== 1) return false;\n  return true;\n}\nfor (let round = 0; round < 400; round++) {\n  const rects = split(0, 0, 2 + rnd(7), 2 + rnd(7), 5);\n  const mode = rnd(6);\n  if (mode === 1 && rects.length > 1) rects.splice(rnd(rects.length), 1);\n  if (mode === 2) rects.push(rects[rnd(rects.length)]);\n  if (mode === 3) { const i = rnd(rects.length); const q = rects[i]; rects[i] = [q[0], q[1], q[2] + 1, q[3]]; }\n  if (mode === 4) { const i = rnd(rects.length); const q = rects[i]; if (q[2] - q[0] > 1) rects[i] = [q[0], q[1], q[2] - 1, q[3]]; }\n  if (mode === 5) { const i = rnd(rects.length); const q = rects[i]; rects[i] = [q[0] + 1, q[1], q[2] + 1, q[3]]; }\n  assert.equal(isRectangleCover(rects), cells(rects));\n}"
      }
    ]
  },
  {
    "id": "ex-max-points-on-a-line",
    "chapter": "dsa-sweep-line-geometry",
    "level": "advanced",
    "title": "Max Points on a Line",
    "brief": "<p>Given an array of integer points <code>[x, y]</code>, return the largest number of points that lie on one straight line.</p><ul><li>The same point may appear more than once, and each copy counts</li><li>Zero points give <code>0</code>, one gives <code>1</code>, two give <code>2</code>, and a list where every point is identical gives its length</li><li>Coordinates can be as large as <code>10<sup>8</sup></code> in absolute value; do not compare slopes as floating-point numbers</li><li>Vertical and horizontal lines are lines like any other</li><li>Do not change the input</li><li>Target: <b>O(n²)</b> lookups with a hash map</li></ul>",
    "starter": "function maxPoints(points) {\n  // TODO: fix an anchor point and count how many other points share each direction from it\n}\n",
    "hints": [
      "Fix one point as an anchor. Every other point gives a direction from the anchor, and the points on one line through the anchor are exactly the ones with the same direction.",
      "A floating-point slope <code>dy / dx</code> breaks for vertical lines and, for large values, can be equal for different slopes. Use the pair (dy, dx) divided by gcd(|dy|, |dx|) instead.",
      "Fix the sign so that opposite directions match: make dx positive, and when dx is 0 make dy positive. Count identical points separately and add them, and the anchor itself, to the best count."
    ],
    "solution": "function maxPoints(points) {\n  const n = points.length;\n  if (n <= 2) return n;\n  const gcd = (a, b) => {\n    a = Math.abs(a);\n    b = Math.abs(b);\n    while (b !== 0) [a, b] = [b, a % b];\n    return a;\n  };\n  let best = 1;\n  for (let i = 0; i < n; i++) {\n    const slopes = new Map();\n    let duplicates = 0, onBestLine = 0;\n    for (let j = i + 1; j < n; j++) {\n      let dx = points[j][0] - points[i][0];\n      let dy = points[j][1] - points[i][1];\n      if (dx === 0 && dy === 0) {\n        duplicates++;\n        continue;\n      }\n      const g = gcd(dx, dy);\n      dx /= g;\n      dy /= g;\n      if (dx < 0 || (dx === 0 && dy < 0)) {\n        dx = -dx;\n        dy = -dy;\n      }\n      const key = dy + '/' + dx;\n      const count = (slopes.get(key) ?? 0) + 1;\n      slopes.set(key, count);\n      onBestLine = Math.max(onBestLine, count);\n    }\n    best = Math.max(best, onBestLine + duplicates + 1);\n  }\n  return best;\n}\n",
    "tests": [
      {
        "name": "three points on a diagonal",
        "body": "assert.equal(maxPoints([[1, 1], [2, 2], [3, 3]]), 3);"
      },
      {
        "name": "six points, four of them on one line",
        "body": "assert.equal(maxPoints([[1, 1], [3, 2], [5, 3], [4, 1], [2, 3], [1, 4]]), 4);"
      },
      {
        "name": "zero, one and two points",
        "body": "assert.equal(maxPoints([]), 0);\nassert.equal(maxPoints([[3, 4]]), 1);\nassert.equal(maxPoints([[0, 0], [5, 7]]), 2);\nassert.equal(maxPoints([[0, 0], [0, 0]]), 2);"
      },
      {
        "name": "vertical and horizontal lines",
        "body": "assert.equal(maxPoints([[2, 0], [2, 5], [2, -3], [7, 1]]), 3);\nassert.equal(maxPoints([[0, 4], [9, 4], [-5, 4], [1, 1], [2, 2]]), 3);"
      },
      {
        "name": "repeated points count every copy",
        "body": "assert.equal(maxPoints([[1, 1], [1, 1], [1, 1]]), 3);\nassert.equal(maxPoints([[1, 1], [1, 1], [2, 3], [3, 5], [0, 0]]), 4);"
      },
      {
        "name": "opposite directions from the anchor are one line",
        "body": "assert.equal(maxPoints([[0, 0], [1, -1], [-1, 1]]), 3);\nassert.equal(maxPoints([[0, 0], [-2, -4], [1, 2], [3, 6]]), 4);"
      },
      {
        "name": "negative slopes and reduced fractions",
        "body": "assert.equal(maxPoints([[0, 0], [4, 5], [7, 8], [8, 9], [5, 6], [3, 4], [1, 1]]), 5);\nassert.equal(maxPoints([[0, 0], [2, 4], [-3, -6], [5, 11]]), 3);"
      },
      {
        "name": "slopes that are different but equal as floating-point numbers",
        "body": "assert.equal(maxPoints([[0, 0], [94911150, 94911151], [94911149, 94911150]]), 2);\nassert.equal(maxPoints([[0, 0], [-94911150, -94911151], [94911149, 94911150]]), 2);"
      },
      {
        "name": "does not change the input",
        "body": "const input = [[3, 3], [1, 1], [2, 2]];\nmaxPoints(input);\nassert.deepEqual(input, [[3, 3], [1, 1], [2, 2]]);"
      },
      {
        "name": "agrees with a triple-checking brute force on random points",
        "body": "let seed = 121;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfunction brute(pts) {\n  const n = pts.length;\n  if (n <= 2) return n;\n  const same = (p, q) => p[0] === q[0] && p[1] === q[1];\n  if (pts.every((p) => same(p, pts[0]))) return n;\n  let best = 1;\n  for (let i = 0; i < n; i++) {\n    for (let j = i + 1; j < n; j++) {\n      if (same(pts[i], pts[j])) continue;\n      let count = 0;\n      for (const p of pts) {\n        if ((pts[j][0] - pts[i][0]) * (p[1] - pts[i][1]) - (pts[j][1] - pts[i][1]) * (p[0] - pts[i][0]) === 0) count++;\n      }\n      best = Math.max(best, count);\n    }\n  }\n  return best;\n}\nfor (let round = 0; round < 500; round++) {\n  const pts = Array.from({ length: rnd(10) }, () => [rnd(5), rnd(5)]);\n  assert.equal(maxPoints(pts), brute(pts));\n}"
      }
    ]
  },
  {
    "id": "ex-valid-square",
    "chapter": "dsa-sweep-line-geometry",
    "level": "intermediate",
    "title": "Valid Square",
    "brief": "<p>Given four points <code>p1</code>, <code>p2</code>, <code>p3</code>, <code>p4</code>, each <code>[x, y]</code> with integer coordinates, in <b>any order</b>, return <code>true</code> if they are the corners of a square.</p><ul><li>A square has four equal sides of positive length and four right angles; it may be tilted</li><li>Four identical points are not a square</li><li>A rhombus that is not a square, and a rectangle that is not a square, return <code>false</code></li><li>Coordinates can be negative and as large as <code>10<sup>4</sup></code>; use integer arithmetic only, with no square roots</li></ul>",
    "starter": "function validSquare(p1, p2, p3, p4) {\n  // TODO: compare the six squared distances between the points\n}\n",
    "hints": [
      "A square has six pairwise distances: four equal sides and two equal diagonals. Compare squared distances so everything stays an integer.",
      "By Pythagoras the squared diagonal is exactly twice the squared side. So the six squared distances sorted must be: four equal numbers, then two equal numbers that are twice the first.",
      "Do not forget that the side must be positive, or four copies of one point pass every equality."
    ],
    "solution": "function validSquare(p1, p2, p3, p4) {\n  const points = [p1, p2, p3, p4];\n  const d = [];\n  for (let i = 0; i < 4; i++) {\n    for (let j = i + 1; j < 4; j++) {\n      d.push((points[i][0] - points[j][0]) ** 2 + (points[i][1] - points[j][1]) ** 2);\n    }\n  }\n  d.sort((a, b) => a - b);\n  return d[0] > 0 && d[0] === d[3] && d[4] === d[5] && d[4] === 2 * d[0];\n}\n",
    "tests": [
      {
        "name": "an axis-aligned square in any order",
        "body": "assert.equal(validSquare([0, 0], [1, 1], [1, 0], [0, 1]), true);\nassert.equal(validSquare([0, 0], [0, 1], [1, 1], [1, 0]), true);"
      },
      {
        "name": "a tilted square",
        "body": "assert.equal(validSquare([0, 0], [2, 1], [1, 3], [-1, 2]), true);\nassert.equal(validSquare([1, 0], [-1, 0], [0, 1], [0, -1]), true);"
      },
      {
        "name": "a rectangle that is not a square",
        "body": "assert.equal(validSquare([0, 0], [2, 0], [2, 1], [0, 1]), false);"
      },
      {
        "name": "a tilted diamond is a square, a rhombus with unequal diagonals is not",
        "body": "assert.equal(validSquare([0, 0], [1, 1], [2, 0], [1, -1]), true);\nassert.equal(validSquare([0, 0], [4, 3], [8, 0], [4, -3]), false);"
      },
      {
        "name": "a parallelogram and other irregular shapes",
        "body": "assert.equal(validSquare([0, 0], [2, 0], [3, 1], [1, 1]), false);\nassert.equal(validSquare([0, 0], [1, 1], [1, 0], [0, 12]), false);"
      },
      {
        "name": "repeated points",
        "body": "assert.equal(validSquare([0, 0], [0, 0], [0, 0], [0, 0]), false);\nassert.equal(validSquare([0, 0], [1, 0], [1, 1], [1, 1]), false);\nassert.equal(validSquare([0, 0], [0, 0], [1, 1], [1, 1]), false);"
      },
      {
        "name": "large and negative coordinates",
        "body": "assert.equal(validSquare([-10000, -10000], [10000, -10000], [10000, 10000], [-10000, 10000]), true);\nassert.equal(validSquare([0, 10000], [10000, 0], [0, -10000], [-10000, 0]), true);"
      },
      {
        "name": "agrees with a right-angle check over every ordering, on random points",
        "body": "let seed = 131;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfunction orderings(items) {\n  if (items.length <= 1) return [items];\n  const out = [];\n  items.forEach((item, i) => {\n    for (const rest of orderings([...items.slice(0, i), ...items.slice(i + 1)])) out.push([item, ...rest]);\n  });\n  return out;\n}\nfunction brute(ps) {\n  for (const q of orderings([0, 1, 2, 3])) {\n    const v = q.map((k, i) => [ps[q[(i + 1) % 4]][0] - ps[k][0], ps[q[(i + 1) % 4]][1] - ps[k][1]]);\n    const len = v.map((u) => u[0] * u[0] + u[1] * u[1]);\n    if (len[0] === 0 || len.some((l) => l !== len[0])) continue;\n    if (v.every((u, i) => u[0] * v[(i + 1) % 4][0] + u[1] * v[(i + 1) % 4][1] === 0)) return true;\n  }\n  return false;\n}\nconst pt = () => [rnd(4), rnd(4)];\nfor (let round = 0; round < 1500; round++) {\n  const ps = [pt(), pt(), pt(), pt()];\n  assert.equal(validSquare(...ps), brute(ps));\n}"
      }
    ]
  },
  {
    "id": "ex-erect-the-fence",
    "chapter": "dsa-sweep-line-geometry",
    "level": "advanced",
    "title": "Erect the Fence",
    "brief": "<p>Given an array <code>trees</code> of integer points <code>[x, y]</code>, return every tree that lies on the <b>boundary of the convex hull</b> of all the trees, including trees in the middle of a straight stretch of the boundary. The fence passes through these trees.</p><ul><li>Return the points in any order; each point appears once, even if the input repeats it</li><li>If all the trees are on one line, every tree is on the fence</li><li>One tree, or two trees, return those trees</li><li>Trees strictly inside the hull are not returned</li><li>Do not change the input</li><li>Target: <b>O(n log n)</b></li></ul>",
    "starter": "function outerTrees(trees) {\n  // TODO: sort the points, then build the lower and upper chains with cross products\n}\n",
    "hints": [
      "Sort the points by x, then by y, and remove repeated points. Build the lower chain left to right with a stack: for each new point p, pop the top while the last two stack points and p make a right turn.",
      "A right turn is a negative cross product of (b - a) and (p - a). Because points in the middle of a straight stretch must be kept, pop only on a strictly negative cross product, not on zero.",
      "Build the upper chain the same way over the reversed list, join the two chains, and remove repeated points: when all points are collinear, both chains hold all of them."
    ],
    "solution": "function outerTrees(trees) {\n  const sorted = [...trees].sort((a, b) => a[0] - b[0] || a[1] - b[1]);\n  const pts = sorted.filter((p, i) => i === 0 || p[0] !== sorted[i - 1][0] || p[1] !== sorted[i - 1][1]);\n  if (pts.length <= 2) return pts.map((p) => [p[0], p[1]]);\n  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);\n\n  function chain(list) {\n    const stack = [];\n    for (const p of list) {\n      while (stack.length >= 2 && cross(stack[stack.length - 2], stack[stack.length - 1], p) < 0) stack.pop();\n      stack.push(p);\n    }\n    return stack;\n  }\n\n  const lower = chain(pts);\n  const upper = chain([...pts].reverse());\n  const seen = new Set();\n  const fence = [];\n  for (const p of [...lower, ...upper]) {\n    const key = p[0] + ',' + p[1];\n    if (!seen.has(key)) {\n      seen.add(key);\n      fence.push([p[0], p[1]]);\n    }\n  }\n  return fence;\n}\n",
    "tests": [
      {
        "name": "the interior point is left out",
        "body": "const key = (p) => p[0] + ',' + p[1];\nconst got = outerTrees([[1, 1], [2, 2], [2, 0], [2, 4], [3, 3], [4, 2]]).map(key).sort();\nassert.deepEqual(got, ['1,1', '2,0', '2,4', '3,3', '4,2']);"
      },
      {
        "name": "all the trees on one line",
        "body": "const key = (p) => p[0] + ',' + p[1];\nassert.deepEqual(outerTrees([[1, 2], [2, 2], [4, 2]]).map(key).sort(), ['1,2', '2,2', '4,2']);\nassert.deepEqual(outerTrees([[0, 0], [3, 3], [1, 1], [2, 2]]).map(key).sort(), ['0,0', '1,1', '2,2', '3,3']);"
      },
      {
        "name": "one tree and two trees",
        "body": "assert.deepEqual(outerTrees([[5, 5]]), [[5, 5]]);\nassert.deepEqual(outerTrees([[5, 5], [1, 2]]).map((p) => p.join()).sort(), ['1,2', '5,5']);"
      },
      {
        "name": "trees in the middle of a straight stretch are kept",
        "body": "const key = (p) => p[0] + ',' + p[1];\nconst got = outerTrees([[0, 0], [1, 0], [2, 0], [2, 2], [0, 2], [1, 1]]).map(key).sort();\nassert.deepEqual(got, ['0,0', '0,2', '1,0', '2,0', '2,2']);"
      },
      {
        "name": "a square with trees along its sides and inside",
        "body": "const pts = [];\nfor (let x = 0; x <= 4; x++) for (let y = 0; y <= 4; y++) pts.push([x, y]);\nconst got = outerTrees(pts).map((p) => p.join());\nassert.equal(got.length, 16);\nassert.equal(new Set(got).size, 16);\nassert.ok(!got.includes('2,2'));\nassert.ok(got.includes('2,0') && got.includes('0,3') && got.includes('4,4'));"
      },
      {
        "name": "repeated trees are reported once",
        "body": "const got = outerTrees([[0, 0], [0, 0], [4, 0], [4, 0], [2, 3], [2, 1]]).map((p) => p.join()).sort();\nassert.deepEqual(got, ['0,0', '2,3', '4,0']);"
      },
      {
        "name": "does not change the input",
        "body": "const input = [[3, 1], [0, 0], [1, 2], [2, 0]];\nouterTrees(input);\nassert.deepEqual(input, [[3, 1], [0, 0], [1, 2], [2, 0]]);"
      },
      {
        "name": "agrees with a supporting-line check on random points",
        "body": "let seed = 141;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);\nfunction brute(pts) {\n  const uniq = [...new Map(pts.map((p) => [p.join(), p])).values()];\n  return uniq.filter((p) => {\n    if (uniq.length === 1) return true;\n    for (const q of uniq) {\n      if (q === p) continue;\n      let left = false, right = false;\n      for (const r of uniq) {\n        const c = cross(p, q, r);\n        if (c > 0) left = true;\n        if (c < 0) right = true;\n      }\n      if (!(left && right)) return true;\n    }\n    return false;\n  }).map((p) => p.join()).sort();\n}\nfor (let round = 0; round < 500; round++) {\n  const pts = Array.from({ length: 1 + rnd(12) }, () => [rnd(6), rnd(6)]);\n  assert.deepEqual(outerTrees(pts).map((p) => p.join()).sort(), brute(pts));\n}"
      },
      {
        "name": "handles several thousand points",
        "body": "let seed = 7;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst pts = Array.from({ length: 5000 }, () => [rnd(2000000) - 1000000, rnd(2000000) - 1000000]);\nconst key = (p) => p[0] + ',' + p[1];\nconst cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);\nconst sorted = [...new Map(pts.map((p) => [key(p), p])).values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]);\nconst half = (list) => {\n  const stack = [];\n  for (const p of list) {\n    while (stack.length >= 2 && cross(stack[stack.length - 2], stack[stack.length - 1], p) < 0) stack.pop();\n    stack.push(p);\n  }\n  return stack;\n};\nconst expected = new Set([...half(sorted), ...half([...sorted].reverse())].map(key));\nconst got = outerTrees(pts).map(key);\nassert.equal(new Set(got).size, got.length);\nassert.deepEqual([...got].sort(), [...expected].sort());"
      }
    ]
  },
  {
    "id": "ex-closest-pair-squared",
    "chapter": "dsa-sweep-line-geometry",
    "level": "advanced",
    "title": "Closest Pair of Points",
    "brief": "<p>Given an array of integer points <code>[x, y]</code>, return the <b>squared</b> distance between the two closest points, as an integer.</p><ul><li>Two points at the same position are at distance <code>0</code></li><li>Fewer than two points return <code>Infinity</code></li><li>Return the squared distance, <code>dx * dx + dy * dy</code>; no square root is needed and the answer stays exact</li><li>Coordinates are integers up to <code>10<sup>6</sup></code> in absolute value</li><li>Do not change the input</li><li>The all-pairs version is <b>O(n²)</b>; aim for sorting by x and stopping each scan early, or for the guaranteed <b>O(n log n)</b> sweep or divide and conquer</li></ul>",
    "starter": "function closestPairSquared(points) {\n  // TODO: compare the points in x order and stop looking once the x gap alone is too big\n}\n",
    "hints": [
      "Comparing all pairs works but costs O(n²). Sort the points by x first.",
      "For each point, look back at the earlier points. Their x differences only grow as you go further left, so once dx * dx is at least the best squared distance so far, no point further left can improve it, and you can stop that scan.",
      "Keep the best as a squared distance, and compute dx * dx + dy * dy for each candidate. Start the best at Infinity, so fewer than two points return Infinity."
    ],
    "solution": "function closestPairSquared(points) {\n  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);\n  let best = Infinity;\n  for (let i = 1; i < pts.length; i++) {\n    for (let j = i - 1; j >= 0; j--) {\n      const dx = pts[i][0] - pts[j][0];\n      if (dx * dx >= best) break;\n      const dy = pts[i][1] - pts[j][1];\n      best = Math.min(best, dx * dx + dy * dy);\n    }\n  }\n  return best;\n}\n",
    "tests": [
      {
        "name": "a simple example",
        "body": "assert.equal(closestPairSquared([[0, 0], [5, 5], [1, 1], [9, 0]]), 2);"
      },
      {
        "name": "fewer than two points",
        "body": "assert.equal(closestPairSquared([]), Infinity);\nassert.equal(closestPairSquared([[3, 4]]), Infinity);"
      },
      {
        "name": "two points",
        "body": "assert.equal(closestPairSquared([[0, 0], [3, 4]]), 25);"
      },
      {
        "name": "two points at the same position",
        "body": "assert.equal(closestPairSquared([[2, 2], [9, 9], [2, 2]]), 0);"
      },
      {
        "name": "the closest pair is not neighbours in x order",
        "body": "assert.equal(closestPairSquared([[0, 0], [1, 100], [2, -100], [3, 1]]), 10);"
      },
      {
        "name": "all points on one vertical line",
        "body": "assert.equal(closestPairSquared([[4, 0], [4, 10], [4, 3], [4, 20]]), 9);"
      },
      {
        "name": "large coordinates stay exact",
        "body": "assert.equal(closestPairSquared([[-1000000, -1000000], [1000000, 1000000], [999999, 1000000]]), 1);"
      },
      {
        "name": "does not change the input",
        "body": "const input = [[5, 5], [0, 0], [1, 2]];\nclosestPairSquared(input);\nassert.deepEqual(input, [[5, 5], [0, 0], [1, 2]]);"
      },
      {
        "name": "agrees with an all-pairs check on random points",
        "body": "let seed = 151;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 500; round++) {\n  const pts = Array.from({ length: rnd(14) }, () => [rnd(12), rnd(12)]);\n  let expected = Infinity;\n  for (let i = 0; i < pts.length; i++) {\n    for (let j = i + 1; j < pts.length; j++) {\n      expected = Math.min(expected, (pts[i][0] - pts[j][0]) ** 2 + (pts[i][1] - pts[j][1]) ** 2);\n    }\n  }\n  assert.equal(closestPairSquared(pts), expected);\n}"
      },
      {
        "name": "handles a few thousand points",
        "body": "let seed = 13;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst pts = Array.from({ length: 4000 }, () => [rnd(1000000) - 500000, rnd(1000000) - 500000]);\nconst got = closestPairSquared(pts);\nlet expected = Infinity;\nfor (let i = 0; i < pts.length; i++) {\n  for (let j = i + 1; j < pts.length; j++) {\n    const d = (pts[i][0] - pts[j][0]) ** 2 + (pts[i][1] - pts[j][1]) ** 2;\n    if (d < expected) expected = d;\n  }\n}\nassert.equal(got, expected);"
      }
    ]
  }
];
