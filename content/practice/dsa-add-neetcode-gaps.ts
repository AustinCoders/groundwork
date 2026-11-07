import type { Exercise } from "../types";

export const dsaAddNeetcodeGaps: Exercise[] = [
  {
    "id": "ex-kth-largest-in-a-stream",
    "chapter": "dsa-heaps-priority-queues",
    "level": "intermediate",
    "title": "Kth Largest Element in a Stream",
    "brief": "<p>Numbers keep arriving one at a time, and after each arrival you must report the <b>kth largest</b> value seen so far. Duplicates count separately: in <code>[5, 5, 3]</code> the 2nd largest is <code>5</code>.</p><ul><li><code>new KthLargest(k, nums)</code>: <code>k</code> is at least 1, and <code>nums</code> holds the starting values (it may be empty or shorter than <code>k</code>). Do not change <code>nums</code></li><li><code>add(value)</code>: take the new value into account and return the kth largest of everything seen so far. It is only called when at least <code>k</code> values have been seen, counting this one</li><li>Target: <b>O(log k)</b> per <code>add</code>, <b>O(n log k)</b> to build from <code>n</code> starting values, and only <b>O(k)</b> memory, no matter how long the stream runs. The tests rule out re-sorting on every add, but they cannot measure memory or tell a heap from a sorted array of k values, so keeping to the target is up to you</li></ul><p><b>Example.</b> With <code>k = 3</code> and starting values <code>[4, 5, 8, 2]</code>: <code>add(3)</code> returns <code>4</code>, <code>add(5)</code> returns <code>5</code>, <code>add(10)</code> returns <code>5</code>, <code>add(9)</code> returns <code>8</code>, and <code>add(4)</code> returns <code>8</code>.</p><p><b>How it works.</b> Keep a min-heap that holds only the k largest values seen so far. Its root is the smallest of those k, which is exactly the kth largest overall. A new value smaller than the root cannot belong to the top k, so it is dropped; a larger one replaces the root and sinks into place. A value that was ever pushed out of the top k can never come back, because later values only push the threshold up, so the heap never needs the discarded values. Each add costs one sift of a heap of size k, which is O(log k), and the heap never holds more than k values.</p>",
    "starter": "class KthLargest {\n  constructor(k, nums) {\n    // TODO: remember k and feed the starting values in\n  }\n\n  add(value) {\n    // TODO: take the value into account and return the kth largest so far\n  }\n}\n",
    "hints": [
      "Sorting everything after each add costs O(n log n) per call, far too slow for a long stream. Ask which values can ever matter: only the k largest seen so far can be the answer now or later.",
      "Keep a min-heap of at most k values. Its smallest element is the kth largest. JavaScript has no heap built in, so write a small array-based one with sift up and sift down.",
      "When the heap has fewer than k values, push. Otherwise compare the new value with the root: if it is larger, overwrite the root and sift down; if not, ignore it. The answer is always the root."
    ],
    "solution": "class KthLargest {\n  constructor(k, nums) {\n    this.k = k;\n    this.heap = [];\n    for (const value of nums) this.offer(value);\n  }\n\n  offer(value) {\n    const heap = this.heap;\n    if (heap.length < this.k) {\n      heap.push(value);\n      this.siftUp(heap.length - 1);\n    } else if (value > heap[0]) {\n      heap[0] = value;\n      this.siftDown(0);\n    }\n  }\n\n  add(value) {\n    this.offer(value);\n    return this.heap[0];\n  }\n\n  siftUp(i) {\n    const heap = this.heap;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (heap[parent] <= heap[i]) break;\n      [heap[parent], heap[i]] = [heap[i], heap[parent]];\n      i = parent;\n    }\n  }\n\n  siftDown(i) {\n    const heap = this.heap;\n    const n = heap.length;\n    while (true) {\n      let smallest = i;\n      const left = 2 * i + 1;\n      const right = left + 1;\n      if (left < n && heap[left] < heap[smallest]) smallest = left;\n      if (right < n && heap[right] < heap[smallest]) smallest = right;\n      if (smallest === i) break;\n      [heap[smallest], heap[i]] = [heap[i], heap[smallest]];\n      i = smallest;\n    }\n  }\n}\n",
    "tests": [
      {
        "name": "the classic sequence",
        "body": "const s = new KthLargest(3, [4, 5, 8, 2]);\nassert.deepEqual([3, 5, 10, 9, 4].map((v) => s.add(v)), [4, 5, 5, 8, 8]);"
      },
      {
        "name": "k of one tracks the running maximum",
        "body": "const s = new KthLargest(1, []);\nassert.deepEqual([-3, -5, 0, -1, 7, 2].map((v) => s.add(v)), [-3, -3, 0, 0, 7, 7]);"
      },
      {
        "name": "fewer starting values than k",
        "body": "const s = new KthLargest(3, [5, 1]);\nassert.equal(s.add(2), 1);\nassert.equal(s.add(7), 2);\nassert.equal(s.add(1), 2);\nassert.equal(s.add(6), 5);"
      },
      {
        "name": "duplicates count separately",
        "body": "const first = new KthLargest(2, [5, 5, 3]);\nassert.equal(first.add(1), 5);\nassert.equal(first.add(5), 5);\nassert.equal(first.add(6), 5);\nconst s = new KthLargest(2, [5, 5, 5]);\nassert.equal(s.add(5), 5);\nassert.equal(s.add(6), 5);\nassert.equal(s.add(7), 6);"
      },
      {
        "name": "more starting values than k",
        "body": "const s = new KthLargest(2, [1, 9, 8, 3, 7]);\nassert.equal(s.add(0), 8);\nassert.equal(s.add(10), 9);"
      },
      {
        "name": "a value below the threshold changes nothing",
        "body": "const s = new KthLargest(2, [10, 20]);\nassert.equal(s.add(1), 10);\nassert.equal(s.add(-100), 10);\nassert.equal(s.add(15), 15);"
      },
      {
        "name": "negative and zero values",
        "body": "const s = new KthLargest(2, [0, -1]);\nassert.equal(s.add(-2), -1);\nassert.equal(s.add(0), 0);"
      },
      {
        "name": "the starting array is not changed",
        "body": "const nums = [9, 1, 8, 2, 7];\nconst s = new KthLargest(2, nums);\ns.add(10);\nassert.deepEqual(nums, [9, 1, 8, 2, 7]);"
      },
      {
        "name": "agrees with a sorted-array model on random streams",
        "body": "function seeded(seed) {\n  let a = seed >>> 0;\n  return () => {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfor (let seed = 1; seed <= 40; seed++) {\n  const next = seeded(seed);\n  const k = 1 + Math.floor(next() * 5);\n  const start = Array.from({ length: k - 1 + Math.floor(next() * 6) }, () => Math.floor(next() * 12) - 4);\n  const stream = new KthLargest(k, start);\n  const seen = start.slice();\n  for (let step = 0; step < 30; step++) {\n    const value = Math.floor(next() * 12) - 4;\n    seen.push(value);\n    const got = stream.add(value);\n    const expected = seen.slice().sort((a, b) => b - a)[k - 1];\n    assert.equal(got, expected, 'seed ' + seed + ' step ' + step);\n  }\n}"
      },
      {
        "name": "handles a long stream with a large k quickly",
        "body": "const n = 100000;\nconst k = 20000;\nlet state = 99991;\nconst rand = () => {\n  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;\n  return state;\n};\nconst seen = [];\nfor (let i = 0; i < n; i++) seen.push(rand() % 1000000);\nconst stream = new KthLargest(k, seen.slice());\nfor (let j = 1; j <= 100000; j++) {\n  const value = 400000 + (rand() % 1600000);\n  seen.push(value);\n  const got = stream.add(value);\n  if (j % 25000 === 0) assert.equal(got, seen.slice().sort((a, b) => b - a)[k - 1], 'after ' + j + ' adds');\n}"
      }
    ]
  },
  {
    "id": "ex-swim-in-rising-water",
    "chapter": "dsa-advanced-graph-algorithms",
    "level": "advanced",
    "title": "Swim in Rising Water",
    "brief": "<p>An <code>n x n</code> grid holds an elevation in every cell. Water rises over time: at time <code>t</code>, every cell with elevation at most <code>t</code> is flooded. You start in the top-left cell and want to reach the bottom-right cell. In zero time you can swim between two cells that share an edge, but only when <b>both</b> are flooded.</p><p>Return the earliest time <code>t</code> at which a route from the top-left to the bottom-right cell exists.</p><ul><li><code>n</code> is at least 1; elevations are non-negative integers and need not be distinct</li><li>The start and end cells must be flooded too, so the answer is never below either of them</li><li>Do not change the grid</li><li>Target: <b>O(n<sup>2</sup> log n)</b> time. A grid of 90,000 cells must finish well inside a second</li></ul><p><b>Example.</b> For <code>[[0, 2], [1, 3]]</code> the answer is <code>3</code>: the bottom-right cell itself has elevation 3, so nothing can happen before time 3. For <code>[[0, 8, 1], [7, 9, 2], [6, 5, 3]]</code> the answer is <code>7</code>: the left-then-bottom route passes through 0, 7, 6, 5, 3 and its highest cell is 7, while the top route must cross the 8.</p><p><b>How it works.</b> A route is usable at time t exactly when its highest cell is at most t, so the answer is the smallest possible highest cell over all routes. That is a shortest path problem where the cost of a route is the maximum of its cells instead of the sum. Dijkstra still works because extending a route can never lower its cost: always expand the cell with the smallest cost so far, and the first time the target is popped its cost is final. Each cell is pushed a bounded number of times and every push costs O(log n<sup>2</sup>), so the total is O(n<sup>2</sup> log n).</p>",
    "starter": "function swimInWater(grid) {\n  // TODO: find the route whose highest cell is as low as possible\n}\n",
    "hints": [
      "If the water has reached level t, you can only stand on cells of elevation at most t. So the answer is the smallest possible value of the highest cell along any route from corner to corner, start and end included.",
      "One approach: binary search on t and flood-fill from the start to see whether the end is reachable. Another: run Dijkstra where the cost of reaching a cell is the highest cell on the best route so far, and the cost of stepping to a neighbour is max(current cost, neighbour elevation).",
      "Use a min-heap keyed by that cost and a best array initialised to Infinity. Pop the cheapest cell, skip it if a better cost was already recorded, return its cost if it is the bottom-right cell, otherwise relax the four neighbours and push those whose cost improved."
    ],
    "solution": "function swimInWater(grid) {\n  const n = grid.length;\n  const best = new Array(n * n).fill(Infinity);\n  const heap = [];\n  const push = (time, cell) => {\n    heap.push([time, cell]);\n    let i = heap.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (heap[parent][0] <= heap[i][0]) break;\n      [heap[parent], heap[i]] = [heap[i], heap[parent]];\n      i = parent;\n    }\n  };\n  const pop = () => {\n    const top = heap[0];\n    const last = heap.pop();\n    if (heap.length > 0) {\n      heap[0] = last;\n      let i = 0;\n      while (true) {\n        let smallest = i;\n        const left = 2 * i + 1;\n        const right = left + 1;\n        if (left < heap.length && heap[left][0] < heap[smallest][0]) smallest = left;\n        if (right < heap.length && heap[right][0] < heap[smallest][0]) smallest = right;\n        if (smallest === i) break;\n        [heap[smallest], heap[i]] = [heap[i], heap[smallest]];\n        i = smallest;\n      }\n    }\n    return top;\n  };\n  best[0] = grid[0][0];\n  push(grid[0][0], 0);\n  const moves = [[1, 0], [-1, 0], [0, 1], [0, -1]];\n  while (heap.length > 0) {\n    const [time, cell] = pop();\n    if (time > best[cell]) continue;\n    if (cell === n * n - 1) return time;\n    const row = Math.floor(cell / n);\n    const col = cell % n;\n    for (const [dr, dc] of moves) {\n      const r = row + dr;\n      const c = col + dc;\n      if (r < 0 || c < 0 || r >= n || c >= n) continue;\n      const next = Math.max(time, grid[r][c]);\n      if (next < best[r * n + c]) {\n        best[r * n + c] = next;\n        push(next, r * n + c);\n      }\n    }\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "the end cell sets the floor",
        "body": "assert.equal(swimInWater([[0, 2], [1, 3]]), 3);"
      },
      {
        "name": "a five by five spiral",
        "body": "assert.equal(swimInWater([[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]), 16);"
      },
      {
        "name": "a single cell",
        "body": "assert.equal(swimInWater([[0]]), 0);\nassert.equal(swimInWater([[7]]), 7);"
      },
      {
        "name": "a high start cell raises the answer",
        "body": "assert.equal(swimInWater([[9, 0], [0, 0]]), 9);"
      },
      {
        "name": "a high end cell raises the answer",
        "body": "assert.equal(swimInWater([[0, 0], [0, 9]]), 9);"
      },
      {
        "name": "the cheaper of two routes wins",
        "body": "assert.equal(swimInWater([[0, 8, 1], [7, 9, 2], [6, 5, 3]]), 7);"
      },
      {
        "name": "chasing the lowest neighbour leads into a dead end",
        "body": "assert.equal(swimInWater([[0, 9, 9, 9], [1, 9, 1, 1], [2, 9, 1, 9], [3, 4, 5, 2]]), 5);"
      },
      {
        "name": "equal elevations everywhere",
        "body": "assert.equal(swimInWater([[4, 4, 4], [4, 4, 4], [4, 4, 4]]), 4);"
      },
      {
        "name": "the grid is not changed",
        "body": "const grid = [[0, 2], [1, 3]];\nswimInWater(grid);\nassert.deepEqual(grid, [[0, 2], [1, 3]]);"
      },
      {
        "name": "agrees with a flood fill at every time on small grids with repeated elevations",
        "body": "function seeded(seed) {\n  let a = seed >>> 0;\n  return () => {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction firstTime(grid) {\n  const n = grid.length;\n  for (let t = 0; ; t++) {\n    if (grid[0][0] > t) continue;\n    const seen = new Set(['0,0']);\n    const stack = [[0, 0]];\n    while (stack.length) {\n      const [r, c] = stack.pop();\n      if (r === n - 1 && c === n - 1) return t;\n      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {\n        const rr = r + dr;\n        const cc = c + dc;\n        if (rr < 0 || cc < 0 || rr >= n || cc >= n || seen.has(rr + ',' + cc) || grid[rr][cc] > t) continue;\n        seen.add(rr + ',' + cc);\n        stack.push([rr, cc]);\n      }\n    }\n  }\n}\nfor (let seed = 1; seed <= 300; seed++) {\n  const next = seeded(seed);\n  const n = 1 + Math.floor(next() * 6);\n  const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => Math.floor(next() * 7)));\n  const copy = grid.map((row) => row.slice());\n  assert.equal(swimInWater(grid), firstTime(copy), 'seed ' + seed + ' ' + JSON.stringify(copy));\n}"
      },
      {
        "name": "a large grid in row-major order",
        "body": "const n = 300;\nconst grid = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => r * n + c));\nassert.equal(swimInWater(grid), n * n - 1);"
      },
      {
        "name": "agrees with a binary search and flood fill on a large random grid",
        "body": "function seeded(seed) {\n  let a = seed >>> 0;\n  return () => {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction slow(grid) {\n  const n = grid.length;\n  const reachable = (t) => {\n    if (grid[0][0] > t) return false;\n    const seen = new Uint8Array(n * n);\n    const stack = [0];\n    seen[0] = 1;\n    while (stack.length) {\n      const cell = stack.pop();\n      if (cell === n * n - 1) return true;\n      const r = Math.floor(cell / n);\n      const c = cell % n;\n      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {\n        const rr = r + dr;\n        const cc = c + dc;\n        if (rr < 0 || cc < 0 || rr >= n || cc >= n || seen[rr * n + cc] || grid[rr][cc] > t) continue;\n        seen[rr * n + cc] = 1;\n        stack.push(rr * n + cc);\n      }\n    }\n    return false;\n  };\n  let lo = 0;\n  let hi = n * n;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (reachable(mid)) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}\nfor (const n of [2, 3, 5, 12, 40, 250]) {\n  const next = seeded(n);\n  const values = Array.from({ length: n * n }, (_, i) => i);\n  for (let i = values.length - 1; i > 0; i--) {\n    const j = Math.floor(next() * (i + 1));\n    [values[i], values[j]] = [values[j], values[i]];\n  }\n  const grid = Array.from({ length: n }, (_, r) => values.slice(r * n, r * n + n));\n  assert.equal(swimInWater(grid), slow(grid), 'n = ' + n);\n}"
      }
    ]
  },
  {
    "id": "ex-hand-of-straights",
    "chapter": "dsa-greedy",
    "level": "intermediate",
    "title": "Hand of Straights",
    "brief": "<p>You hold a pile of numbered cards. Decide whether the whole pile can be dealt into groups of exactly <code>groupSize</code> cards, where every group is made of <b>consecutive</b> values (for example <code>4, 5, 6</code>).</p><ul><li><code>cards</code> may contain repeated values and negative numbers, and may be empty (an empty pile can be dealt into zero groups, so the answer is <code>true</code>)</li><li><code>groupSize</code> is at least 1</li><li>Every card must be used exactly once</li><li>Do not change the input array</li><li>Target: <b>O(n log n)</b> time. A pile of hundreds of thousands of cards must finish well inside a second</li></ul><p><b>Example.</b> For cards <code>[1, 2, 3, 6, 2, 3, 4, 7, 8]</code> and <code>groupSize = 3</code> the answer is <code>true</code>: deal <code>1,2,3</code>, <code>2,3,4</code> and <code>6,7,8</code>. For <code>[1, 2, 3, 4, 5]</code> and <code>groupSize = 4</code> it is <code>false</code>, because five cards cannot fill groups of four.</p><p><b>How it works.</b> Look at the smallest remaining value. Nothing smaller exists to start a group before it, so it must be the first card of some group, and that group is forced to be that value and the next groupSize - 1 values. So count the cards, walk the distinct values in increasing order, and whenever a value still has c copies left, remove c copies of it and of each of the next groupSize - 1 values, failing if any is short. Each removal is forced, so a failure proves no deal exists. Sorting the distinct values costs O(n log n). Every value that starts groups removes at least groupSize cards while touching only groupSize counts, so all the removal work together is O(n).</p>",
    "starter": "function isNStraightHand(cards, groupSize) {\n  // TODO: count the cards, then repeatedly start a group at the smallest value left\n}\n",
    "hints": [
      "Think about the smallest card still in the pile. Could it ever be anything but the first card of its group? What does that tell you about the rest of that group?",
      "Count how many copies of each value you hold, and visit the distinct values in increasing order. If a value has c copies left, c groups must start there, so each of the next groupSize - 1 values needs at least c copies too.",
      "Subtract c from each of those counts and fail the moment one is short or missing. Check first that the pile size is a multiple of groupSize. Do not search the array for the next card with indexOf or splice; that is quadratic."
    ],
    "solution": "function isNStraightHand(cards, groupSize) {\n  if (cards.length % groupSize !== 0) return false;\n  const count = new Map();\n  for (const card of cards) count.set(card, (count.get(card) || 0) + 1);\n  const values = [...count.keys()].sort((a, b) => a - b);\n  for (const start of values) {\n    const need = count.get(start);\n    if (need === 0) continue;\n    for (let offset = 1; offset < groupSize; offset++) {\n      const have = count.get(start + offset) || 0;\n      if (have < need) return false;\n      count.set(start + offset, have - need);\n    }\n    count.set(start, 0);\n  }\n  return true;\n}\n",
    "tests": [
      {
        "name": "a hand that deals cleanly",
        "body": "assert.equal(isNStraightHand([1, 2, 3, 6, 2, 3, 4, 7, 8], 3), true);"
      },
      {
        "name": "a pile that does not divide into the group size",
        "body": "assert.equal(isNStraightHand([1, 2, 3, 4, 5], 4), false);"
      },
      {
        "name": "groups of one always work",
        "body": "assert.equal(isNStraightHand([5, 1, 9, 9, 2], 1), true);"
      },
      {
        "name": "an empty pile",
        "body": "assert.equal(isNStraightHand([], 3), true);"
      },
      {
        "name": "a gap in the values",
        "body": "assert.equal(isNStraightHand([1, 2, 4, 5], 2), true);\nassert.equal(isNStraightHand([1, 3], 2), false);\nassert.equal(isNStraightHand([1, 2, 4, 5, 6, 7], 3), false);"
      },
      {
        "name": "repeated values",
        "body": "assert.equal(isNStraightHand([1, 1, 2, 2, 3, 3], 3), true);\nassert.equal(isNStraightHand([1, 1, 2, 2, 3, 4], 3), false);"
      },
      {
        "name": "negative values",
        "body": "assert.equal(isNStraightHand([-2, -1, 0, 5, 6, 7], 3), true);\nassert.equal(isNStraightHand([-2, -1, 1, 5, 6, 7], 3), false);"
      },
      {
        "name": "the input is not changed",
        "body": "const cards = [3, 1, 2, 2, 3, 4];\nisNStraightHand(cards, 3);\nassert.deepEqual(cards, [3, 1, 2, 2, 3, 4]);"
      },
      {
        "name": "one group made of the whole pile",
        "body": "assert.equal(isNStraightHand([6, 4, 5, 7], 4), true);\nassert.equal(isNStraightHand([6, 4, 5, 8], 4), false);"
      },
      {
        "name": "agrees with an exhaustive search on random small hands",
        "body": "function seeded(seed) {\n  let a = seed >>> 0;\n  return () => {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction slow(cards, size) {\n  const memo = new Map();\n  const go = (counts) => {\n    const key = counts.join(',');\n    if (memo.has(key)) return memo.get(key);\n    let result = false;\n    if (counts.every((c) => c === 0)) result = true;\n    else {\n      for (let v = 0; v + size <= counts.length && !result; v++) {\n        let ok = true;\n        for (let i = 0; i < size; i++) if (counts[v + i] === 0) ok = false;\n        if (!ok) continue;\n        const copy = counts.slice();\n        for (let i = 0; i < size; i++) copy[v + i]--;\n        if (go(copy)) result = true;\n      }\n    }\n    memo.set(key, result);\n    return result;\n  };\n  const counts = new Array(8).fill(0);\n  for (const card of cards) counts[card]++;\n  return go(counts);\n}\nfor (let seed = 1; seed <= 300; seed++) {\n  const next = seeded(seed);\n  const size = 1 + Math.floor(next() * 4);\n  const groups = Math.floor(next() * 4);\n  const cards = [];\n  for (let i = 0; i < groups * size; i++) cards.push(Math.floor(next() * 8));\n  assert.equal(isNStraightHand(cards, size), slow(cards, size), 'seed ' + seed);\n}"
      },
      {
        "name": "a large hand that deals, and the same hand with one card changed",
        "body": "const size = 1000;\nconst cards = [];\nfor (let g = 0; g < 200; g++) {\n  const start = (g * 37) % 500;\n  for (let i = 0; i < size; i++) cards.push(start + i);\n}\nfor (let i = cards.length - 1; i > 0; i--) {\n  const j = (i * 7919 + 13) % (i + 1);\n  [cards[i], cards[j]] = [cards[j], cards[i]];\n}\nassert.equal(isNStraightHand(cards, size), true);\ncards[0] += 5000;\nassert.equal(isNStraightHand(cards, size), false);"
      },
      {
        "name": "a large hand with a huge number of copies of each value",
        "body": "const copies = 100000;\nconst cards = [];\nfor (let i = 0; i < copies; i++) cards.push(0, 1, 2);\nassert.equal(isNStraightHand(cards, 3), true);\ncards[cards.length - 1] = 4;\nassert.equal(isNStraightHand(cards, 3), false);"
      },
      {
        "name": "a large hand of pairs",
        "body": "const cards = [];\nfor (let i = 0; i < 100000; i++) cards.push(2 * i, 2 * i + 1);\nassert.equal(isNStraightHand(cards, 2), true);\ncards.push(1000000, 1000002);\nassert.equal(isNStraightHand(cards, 2), false);"
      }
    ]
  },
  {
    "id": "ex-merge-triplets-to-form-target",
    "chapter": "dsa-greedy",
    "level": "intermediate",
    "title": "Merge Triplets to Form Target Triplet",
    "brief": "<p>You are given a list of triplets <code>[a, b, c]</code> and a <code>target</code> triplet <code>[x, y, z]</code>. One operation picks two different triplets <code>i</code> and <code>j</code> and overwrites triplet <code>j</code> with the position-by-position maximum of the two: <code>[max(a<sub>i</sub>, a<sub>j</sub>), max(b<sub>i</sub>, b<sub>j</sub>), max(c<sub>i</sub>, c<sub>j</sub>)]</code>.</p><p>Return <code>true</code> if, after any number of operations (possibly none), the target appears as one of the triplets in the list.</p><ul><li>All values are integers; the list may hold a single triplet, and an empty list can never produce the target, so the answer is <code>false</code></li><li>Do not change the input</li><li>Target: <b>O(n)</b> time and O(1) extra space, one pass over the triplets</li></ul><p><b>Example.</b> For triplets <code>[[2, 5, 3], [1, 8, 4], [1, 7, 5]]</code> and target <code>[2, 7, 5]</code> the answer is <code>true</code>: the middle triplet has an 8 and is unusable, but merging the first and third gives <code>[2, 7, 5]</code>. For <code>[[3, 4, 5], [4, 5, 6]]</code> and target <code>[3, 2, 5]</code> it is <code>false</code>: the second triplet's 4 exceeds 3 and the first triplet's 4 exceeds 2, so neither may ever be merged in.</p><p><b>How it works.</b> A merge can only raise values, never lower them. So a triplet with any position above the target can never be part of a merge that ends at the target, and it can be ignored for good. Every remaining triplet is at or below the target in all three positions, so merging any set of them stays at or below the target and reaches the target position by position exactly when some remaining triplet matches the target there. Merge all the usable triplets into one and its maximum in each position is the largest value available there. So the answer is true when each of the three positions has a usable triplet matching the target. One pass with three flags, O(n) time.</p>",
    "starter": "function mergeTriplets(triplets, target) {\n  // TODO: ignore triplets that overshoot the target, then check each position can reach it\n}\n",
    "hints": [
      "A merge takes a maximum, so values only go up. What does that say about a triplet that already has some position larger than the target's value there?",
      "Throw away every triplet with any position above the target. Each triplet that is left can be merged with the others without ever overshooting.",
      "Among the usable triplets, the merge of all of them has, in each position, the largest value present. So you only need three flags: for each position, does some usable triplet equal the target there? Return true when all three flags are set."
    ],
    "solution": "function mergeTriplets(triplets, target) {\n  const reached = [false, false, false];\n  for (const triplet of triplets) {\n    if (triplet[0] > target[0] || triplet[1] > target[1] || triplet[2] > target[2]) continue;\n    for (let i = 0; i < 3; i++) {\n      if (triplet[i] === target[i]) reached[i] = true;\n    }\n  }\n  return reached[0] && reached[1] && reached[2];\n}\n",
    "tests": [
      {
        "name": "two triplets combine, one is unusable",
        "body": "assert.equal(mergeTriplets([[2, 5, 3], [1, 8, 4], [1, 7, 5]], [2, 7, 5]), true);"
      },
      {
        "name": "every triplet overshoots somewhere",
        "body": "assert.equal(mergeTriplets([[3, 4, 5], [4, 5, 6]], [3, 2, 5]), false);"
      },
      {
        "name": "three usable triplets combine",
        "body": "assert.equal(mergeTriplets([[2, 5, 3], [2, 3, 4], [1, 2, 5], [5, 2, 3]], [5, 5, 5]), true);"
      },
      {
        "name": "the target is already in the list",
        "body": "assert.equal(mergeTriplets([[9, 9, 9], [1, 2, 3]], [1, 2, 3]), true);"
      },
      {
        "name": "a single matching triplet",
        "body": "assert.equal(mergeTriplets([[4, 4, 4]], [4, 4, 4]), true);"
      },
      {
        "name": "a single triplet that is too small",
        "body": "assert.equal(mergeTriplets([[1, 2, 3]], [4, 2, 3]), false);"
      },
      {
        "name": "a single triplet that is too large",
        "body": "assert.equal(mergeTriplets([[5, 2, 3]], [4, 2, 3]), false);"
      },
      {
        "name": "one position can never be reached",
        "body": "assert.equal(mergeTriplets([[1, 1, 1], [1, 2, 1], [1, 1, 3]], [1, 3, 3]), false);"
      },
      {
        "name": "overshooting in any one position disqualifies a triplet",
        "body": "assert.equal(mergeTriplets([[3, 1, 1], [9, 3, 3]], [3, 3, 3]), false);\nassert.equal(mergeTriplets([[1, 3, 1], [3, 9, 3]], [3, 3, 3]), false);\nassert.equal(mergeTriplets([[1, 1, 3], [3, 3, 9]], [3, 3, 3]), false);\nassert.equal(mergeTriplets([[3, 9, 1], [1, 3, 9], [9, 1, 3]], [3, 3, 3]), false);"
      },
      {
        "name": "an empty list",
        "body": "assert.equal(mergeTriplets([], [1, 1, 1]), false);"
      },
      {
        "name": "the input is not changed",
        "body": "const triplets = [[2, 5, 3], [1, 7, 5]];\nmergeTriplets(triplets, [2, 7, 5]);\nassert.deepEqual(triplets, [[2, 5, 3], [1, 7, 5]]);"
      },
      {
        "name": "agrees with a search over every subset on random inputs",
        "body": "function seeded(seed) {\n  let a = seed >>> 0;\n  return () => {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction slow(triplets, target) {\n  const n = triplets.length;\n  for (let mask = 1; mask < 1 << n; mask++) {\n    const merged = [-Infinity, -Infinity, -Infinity];\n    for (let i = 0; i < n; i++) {\n      if (!(mask & (1 << i))) continue;\n      for (let p = 0; p < 3; p++) merged[p] = Math.max(merged[p], triplets[i][p]);\n    }\n    if (merged[0] === target[0] && merged[1] === target[1] && merged[2] === target[2]) return true;\n  }\n  return false;\n}\nfor (let seed = 1; seed <= 300; seed++) {\n  const next = seeded(seed);\n  const n = 1 + Math.floor(next() * 7);\n  const triplets = Array.from({ length: n }, () => [0, 0, 0].map(() => Math.floor(next() * 4)));\n  const target = [0, 0, 0].map(() => Math.floor(next() * 4));\n  assert.equal(mergeTriplets(triplets, target), slow(triplets, target), 'seed ' + seed);\n}"
      },
      {
        "name": "a long list of unusable triplets with the three needed ones at the end",
        "body": "const triplets = [];\nfor (let i = 0; i < 200000; i++) triplets.push([i % 7, (i % 11) + 100, i % 13]);\ntriplets.push([10, 1, 1], [1, 20, 1], [1, 1, 30]);\nassert.equal(mergeTriplets(triplets, [10, 20, 30]), true);\nassert.equal(mergeTriplets(triplets, [10, 20, 31]), false);"
      }
    ]
  },
  {
    "id": "ex-plus-one",
    "chapter": "dsa-arrays-strings",
    "level": "beginner",
    "title": "Plus One",
    "brief": "<p>A non-negative integer is stored as an array of its decimal digits, most significant digit first. Return the digits of that number plus one.</p><ul><li>The array is not empty and every entry is a single digit from <code>0</code> to <code>9</code></li><li>There are no leading zeros, except that the number zero is stored as <code>[0]</code></li><li>The number can have far more digits than a JavaScript <code>Number</code> holds exactly, so do <b>not</b> convert the array to a number and back. The tests catch <code>Number</code> and <code>parseInt</code> because they lose precision, but nothing can stop <code>BigInt</code>, so treat it as off limits too</li><li>Do not change the input array</li><li>Target: <b>O(n)</b> time for <code>n</code> digits</li></ul><p><b>Example.</b> <code>[1, 2, 3]</code> becomes <code>[1, 2, 4]</code>. <code>[1, 9, 9]</code> becomes <code>[2, 0, 0]</code> because the carry travels left through the nines. <code>[9, 9]</code> becomes <code>[1, 0, 0]</code>, one digit longer than the input.</p><p><b>How it works.</b> Adding one is the schoolbook carry done by hand. Start at the last digit: if it is below 9, add one and stop, because nothing else changes. If it is 9, it becomes 0 and the carry moves to the digit on its left. If the carry falls off the front, every digit was a 9, so the answer is a 1 followed by zeros, which is the old digits (now all zeros) with a 1 added at the front. Each digit is looked at at most once, so the walk is O(n) in the worst case and usually stops after one step, and copying the array keeps the total at O(n).</p>",
    "starter": "function plusOne(digits) {\n  // TODO: add one to the number the digits spell, carrying from the right\n  return digits;\n}\n",
    "hints": [
      "Do it the way you would on paper: add one to the last digit. Most of the time that is the whole job. Think about what happens when that digit is a 9.",
      "Walk from the last digit to the first. A digit below 9 gets incremented and you can return at once. A 9 becomes 0 and the carry moves one place left.",
      "If the loop finishes without returning, every digit was 9 and is now 0, so put a 1 in front. Work on a copy of the array so the caller's array stays as it was. Avoid Number or parseInt: a long digit array loses precision."
    ],
    "solution": "function plusOne(digits) {\n  const result = [...digits];\n  for (let i = result.length - 1; i >= 0; i--) {\n    if (result[i] < 9) {\n      result[i]++;\n      return result;\n    }\n    result[i] = 0;\n  }\n  result.unshift(1);\n  return result;\n}\n",
    "tests": [
      {
        "name": "a plain increment",
        "body": "assert.deepEqual(plusOne([1, 2, 3]), [1, 2, 4]);"
      },
      {
        "name": "another plain increment",
        "body": "assert.deepEqual(plusOne([4, 3, 2, 1]), [4, 3, 2, 2]);"
      },
      {
        "name": "a single nine grows by a digit",
        "body": "assert.deepEqual(plusOne([9]), [1, 0]);"
      },
      {
        "name": "every digit a nine",
        "body": "assert.deepEqual(plusOne([9, 9, 9]), [1, 0, 0, 0]);"
      },
      {
        "name": "zero",
        "body": "assert.deepEqual(plusOne([0]), [1]);"
      },
      {
        "name": "the carry stops partway",
        "body": "assert.deepEqual(plusOne([1, 9, 9]), [2, 0, 0]);\nassert.deepEqual(plusOne([8, 9]), [9, 0]);\nassert.deepEqual(plusOne([2, 9, 8, 9]), [2, 9, 9, 0]);"
      },
      {
        "name": "a trailing zero is just incremented",
        "body": "assert.deepEqual(plusOne([1, 0]), [1, 1]);\nassert.deepEqual(plusOne([5, 0, 0]), [5, 0, 1]);"
      },
      {
        "name": "a number past the exact range of Number",
        "body": "assert.deepEqual(plusOne([9, 0, 0, 7, 1, 9, 9, 2, 5, 4, 7, 4, 0, 9, 9, 2]), [9, 0, 0, 7, 1, 9, 9, 2, 5, 4, 7, 4, 0, 9, 9, 3]);\nassert.deepEqual(plusOne([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]), [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1]);\nassert.deepEqual(plusOne([9, 0, 0, 7, 1, 9, 9, 2, 5, 4, 7, 4, 0, 9, 9, 9]), [9, 0, 0, 7, 1, 9, 9, 2, 5, 4, 7, 4, 1, 0, 0, 0]);"
      },
      {
        "name": "the input is not changed",
        "body": "const digits = [1, 9, 9];\nplusOne(digits);\nassert.deepEqual(digits, [1, 9, 9]);\nconst nines = [9, 9];\nplusOne(nines);\nassert.deepEqual(nines, [9, 9]);"
      },
      {
        "name": "agrees with BigInt arithmetic on random numbers",
        "body": "function seeded(seed) {\n  let a = seed >>> 0;\n  return () => {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfor (let seed = 1; seed <= 300; seed++) {\n  const next = seeded(seed);\n  const length = 1 + Math.floor(next() * 25);\n  const digits = Array.from({ length }, () => (next() < 0.5 ? 9 : Math.floor(next() * 10)));\n  if (digits[0] === 0 && length > 1) digits[0] = 1;\n  const expected = (BigInt(digits.join('')) + 1n).toString().split('').map(Number);\n  assert.deepEqual(plusOne(digits), expected, 'seed ' + seed);\n}"
      },
      {
        "name": "a very long number of nines",
        "body": "const n = 200000;\nconst out = plusOne(new Array(n).fill(9));\nassert.equal(out.length, n + 1);\nassert.equal(out[0], 1);\nassert.equal(out.slice(1).every((d) => d === 0), true);\nconst almost = new Array(n).fill(9);\nalmost[0] = 4;\nconst out2 = plusOne(almost);\nassert.equal(out2.length, n);\nassert.equal(out2[0], 5);\nassert.equal(out2.slice(1).every((d) => d === 0), true);"
      }
    ]
  },
  {
    "id": "ex-multiply-strings",
    "chapter": "dsa-math",
    "level": "intermediate",
    "title": "Multiply Strings",
    "brief": "<p>Two non-negative integers arrive as decimal strings. Return their product as a decimal string, without converting either input to a number.</p><ul><li>Each string is non-empty, made of the digits <code>0</code> to <code>9</code>, and has no leading zeros except the number zero itself, written <code>'0'</code></li><li>The numbers can have thousands of digits, far past what a JavaScript <code>Number</code> holds exactly, so do not turn a whole input into a number. Read one digit at a time and do the arithmetic yourself. The tests catch <code>Number</code> and <code>parseInt</code> because they lose precision, and they switch <code>BigInt</code> off while your function runs</li><li>The result must have no leading zeros, and the product of anything with zero is <code>'0'</code>, not <code>'000'</code></li><li>Target: <b>O(m n)</b> time for strings of lengths <code>m</code> and <code>n</code>, and O(m + n) extra space</li></ul><p><b>Example.</b> <code>'123'</code> times <code>'456'</code> is <code>'56088'</code>. <code>'999'</code> times <code>'999'</code> is <code>'998001'</code>. Anything times <code>'0'</code> is <code>'0'</code>.</p><p><b>How it works.</b> This is long multiplication by hand. A product of an m-digit and an n-digit number has at most m + n digits. Digit i of the first number (counting from the left, zero based) times digit j of the second lands in output positions i + j and i + j + 1, with the lower position i + j + 1 holding the ones part and position i + j receiving the carry. So keep an array of m + n cells, add each digit product plus whatever is already in its low cell, split the sum into a digit and a carry, and let later steps absorb the carries. Finally skip the leading zeros. Every pair of digits is touched once, so the time is O(m n), and the array is the only extra storage.</p>",
    "starter": "function multiply(num1, num2) {\n  // TODO: multiply digit by digit into an array of num1.length + num2.length cells\n}\n",
    "hints": [
      "Do it the way you did in school: multiply each digit of one number by each digit of the other and add the results in the right columns. The product of an m-digit and an n-digit number has at most m + n digits, so an array of that size is enough.",
      "The digit at index i of num1 times the digit at index j of num2 contributes to cells i + j and i + j + 1 of the result array. Put the ones digit of the sum in cell i + j + 1 and add the tens digit (the carry) to cell i + j.",
      "Loop i and j from the right end so a carry is always added into a cell that is still going to be processed. Include what is already in the low cell in each sum. At the end skip leading zeros and join the cells into a string. Return '0' straight away if either input is '0'."
    ],
    "solution": "function multiply(num1, num2) {\n  if (num1 === '0' || num2 === '0') return '0';\n  const m = num1.length;\n  const n = num2.length;\n  const a = Array.from(num1, (ch) => ch.charCodeAt(0) - 48);\n  const b = Array.from(num2, (ch) => ch.charCodeAt(0) - 48);\n  const cells = new Array(m + n).fill(0);\n  for (let i = m - 1; i >= 0; i--) {\n    for (let j = n - 1; j >= 0; j--) {\n      const sum = a[i] * b[j] + cells[i + j + 1];\n      cells[i + j + 1] = sum % 10;\n      cells[i + j] += Math.floor(sum / 10);\n    }\n  }\n  let start = 0;\n  while (start < cells.length - 1 && cells[start] === 0) start++;\n  return cells.slice(start).join('');\n}\n",
    "tests": [
      {
        "name": "single digits",
        "body": "assert.equal(multiply('2', '3'), '6');\nassert.equal(multiply('9', '9'), '81');"
      },
      {
        "name": "a three digit example",
        "body": "assert.equal(multiply('123', '456'), '56088');"
      },
      {
        "name": "all nines",
        "body": "assert.equal(multiply('999', '999'), '998001');"
      },
      {
        "name": "multiplying by zero gives a single zero",
        "body": "assert.equal(multiply('0', '0'), '0');\nassert.equal(multiply('0', '98765'), '0');\nassert.equal(multiply('98765', '0'), '0');"
      },
      {
        "name": "multiplying by one",
        "body": "assert.equal(multiply('1', '4321'), '4321');\nassert.equal(multiply('4321', '1'), '4321');"
      },
      {
        "name": "numbers of different lengths",
        "body": "assert.equal(multiply('12', '123456789'), '1481481468');\nassert.equal(multiply('123456789', '12'), '1481481468');"
      },
      {
        "name": "powers of ten keep their zeros",
        "body": "assert.equal(multiply('1000', '100'), '100000');\nassert.equal(multiply('10', '10'), '100');"
      },
      {
        "name": "past the exact range of Number",
        "body": "assert.equal(multiply('9007199254740993', '9007199254740993'), '81129638414606699710187514626049');"
      },
      {
        "name": "works with BigInt switched off",
        "body": "const exact = BigInt;\nfunction product(x, y) {\n  globalThis.BigInt = function () {\n    throw new Error('BigInt is switched off in this exercise');\n  };\n  try {\n    return multiply(x, y);\n  } finally {\n    globalThis.BigInt = exact;\n  }\n}\nassert.equal(product('123', '456'), '56088');\nassert.equal(product('0', '77'), '0');\nassert.equal(product('99999999999999999999', '99999999999999999999'), '9999999999999999999800000000000000000001');"
      },
      {
        "name": "the product is shorter than m plus n digits",
        "body": "assert.equal(multiply('11', '11'), '121');\nassert.equal(multiply('25', '4'), '100');"
      },
      {
        "name": "agrees with BigInt on random numbers",
        "body": "const exact = BigInt;\nfunction product(x, y) {\n  globalThis.BigInt = function () {\n    throw new Error('BigInt is switched off in this exercise');\n  };\n  try {\n    return multiply(x, y);\n  } finally {\n    globalThis.BigInt = exact;\n  }\n}\nfunction seeded(seed) {\n  let a = seed >>> 0;\n  return () => {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction digits(next, length) {\n  let out = String(1 + Math.floor(next() * 9));\n  for (let i = 1; i < length; i++) out += next() < 0.3 ? '9' : String(Math.floor(next() * 10));\n  return out;\n}\nfor (let seed = 1; seed <= 300; seed++) {\n  const next = seeded(seed);\n  const x = digits(next, 1 + Math.floor(next() * 30));\n  const y = digits(next, 1 + Math.floor(next() * 30));\n  assert.equal(product(x, y), (exact(x) * exact(y)).toString(), x + ' * ' + y);\n}"
      },
      {
        "name": "two numbers of three thousand digits",
        "body": "const exact = BigInt;\nfunction product(x, y) {\n  globalThis.BigInt = function () {\n    throw new Error('BigInt is switched off in this exercise');\n  };\n  try {\n    return multiply(x, y);\n  } finally {\n    globalThis.BigInt = exact;\n  }\n}\nfunction seeded(seed) {\n  let a = seed >>> 0;\n  return () => {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst next = seeded(7);\nfunction long(length) {\n  let out = '9';\n  for (let i = 1; i < length; i++) out += String(Math.floor(next() * 10));\n  return out;\n}\nconst x = long(3000);\nconst y = long(3000);\nassert.equal(product(x, y), (exact(x) * exact(y)).toString());\nconst nines = '9'.repeat(3000);\nassert.equal(product(nines, nines), (exact(nines) * exact(nines)).toString());"
      }
    ]
  },
  {
    "id": "ex-detect-squares",
    "chapter": "dsa-design-problems",
    "level": "intermediate",
    "title": "Detect Squares",
    "brief": "<p>Design a structure that stores points on a plane and counts the squares a query point can complete.</p><ul><li><code>new DetectSquares()</code> starts empty</li><li><code>add(point)</code>: store the point <code>[x, y]</code>. The same point can be added many times, and every add is a separate stored copy</li><li><code>count(point)</code>: return the number of ways to choose <b>three stored points</b> that, together with the query point, are the four corners of an axis-aligned square with a positive side. Two ways are different when they use different stored copies. The query point itself does not need to be stored, and it is not changed or added</li><li>Coordinates are integers and may be negative</li><li>Target: <b>O(1)</b> for <code>add</code>, and <code>count</code> in time proportional to the number of distinct stored points that share the query's x coordinate, not to the total number stored</li></ul><p><b>Example.</b> Add <code>[3, 10]</code>, <code>[11, 2]</code> and <code>[3, 2]</code>. Then <code>count([11, 10])</code> is <code>1</code>: the square has corners <code>[11, 10]</code>, <code>[3, 10]</code>, <code>[3, 2]</code> and <code>[11, 2]</code>. <code>count([14, 8])</code> is <code>0</code>. Add <code>[11, 2]</code> a second time and <code>count([11, 10])</code> becomes <code>2</code>, one square for each copy.</p><p><b>How it works.</b> In an axis-aligned square the query corner shares its x with one neighbour and its y with another, and the fourth corner is diagonal. So pick the neighbour directly above or below the query, which fixes the side length d = |y difference|. The other two corners then sit at x + d or x - d, at the query's y and at the neighbour's y. Store the points as a map from x to a map from y to how many copies exist. For each distinct neighbour in the query's column, and for each of the two sides, multiply the three copy counts and add to the total, because the copies can be chosen independently. Adding is one map update. A count visits only the query's column, and every candidate needs two constant time lookups per side, one for each of the other two corners.</p>",
    "starter": "class DetectSquares {\n  constructor() {\n    // TODO: set up the storage\n  }\n\n  add(point) {\n    // TODO: store one more copy of the point\n  }\n\n  count(point) {\n    // TODO: count the squares the query point completes\n  }\n}\n",
    "hints": [
      "Scanning every stored point for each query is too slow when many points are stored. Use the structure of an axis-aligned square: from the query corner, one neighbour is straight above or below it. Once you pick that neighbour, how long is the side?",
      "Store counts by coordinate: a map from x to a map from y to the number of copies of that point. For the query [x, y] and a neighbour [x, y2] with side d = |y2 - y|, the remaining two corners are [x + d, y] and [x + d, y2], or the same with x - d.",
      "For each distinct y2 in the query's column other than y, and for each of the two sides, add the product of three copy counts: the neighbour, the point beside the query, and the diagonal point. Multiply, do not just count, because each copy can be chosen on its own. Skip y2 equal to y, which would give a side of zero."
    ],
    "solution": "class DetectSquares {\n  constructor() {\n    this.columns = new Map();\n  }\n\n  add(point) {\n    const [x, y] = point;\n    if (!this.columns.has(x)) this.columns.set(x, new Map());\n    const column = this.columns.get(x);\n    column.set(y, (column.get(y) || 0) + 1);\n  }\n\n  count(point) {\n    const [x, y] = point;\n    const column = this.columns.get(x);\n    if (!column) return 0;\n    let total = 0;\n    for (const [otherY, copies] of column) {\n      if (otherY === y) continue;\n      const side = Math.abs(otherY - y);\n      for (const sideX of [x + side, x - side]) {\n        const beside = this.columns.get(sideX);\n        if (!beside) continue;\n        total += copies * (beside.get(y) || 0) * (beside.get(otherY) || 0);\n      }\n    }\n    return total;\n  }\n}\n",
    "tests": [
      {
        "name": "the classic sequence",
        "body": "const d = new DetectSquares();\nd.add([3, 10]);\nd.add([11, 2]);\nd.add([3, 2]);\nassert.equal(d.count([11, 10]), 1);\nassert.equal(d.count([14, 8]), 0);\nd.add([11, 2]);\nassert.equal(d.count([11, 10]), 2);"
      },
      {
        "name": "an empty structure",
        "body": "const d = new DetectSquares();\nassert.equal(d.count([0, 0]), 0);"
      },
      {
        "name": "a square needs all three other corners",
        "body": "const d = new DetectSquares();\nd.add([0, 5]);\nd.add([5, 0]);\nassert.equal(d.count([5, 5]), 0);\nd.add([0, 0]);\nassert.equal(d.count([5, 5]), 1);"
      },
      {
        "name": "the square can lie on either side of the query",
        "body": "const d = new DetectSquares();\nd.add([0, 0]);\nd.add([0, 4]);\nd.add([4, 4]);\nd.add([-4, 0]);\nd.add([-4, 4]);\nassert.equal(d.count([4, 0]), 1);\nassert.equal(d.count([0, 0]), 1);"
      },
      {
        "name": "a rectangle that is not a square does not count",
        "body": "const d = new DetectSquares();\nd.add([0, 0]);\nd.add([0, 3]);\nd.add([5, 3]);\nassert.equal(d.count([5, 0]), 0);"
      },
      {
        "name": "a query on top of a stored point has no zero-size square",
        "body": "const d = new DetectSquares();\nd.add([1, 1]);\nd.add([1, 1]);\nd.add([1, 1]);\nassert.equal(d.count([1, 1]), 0);"
      },
      {
        "name": "copies multiply independently",
        "body": "const d = new DetectSquares();\nfor (let i = 0; i < 2; i++) d.add([0, 0]);\nfor (let i = 0; i < 3; i++) d.add([0, 2]);\nfor (let i = 0; i < 4; i++) d.add([2, 0]);\nassert.equal(d.count([2, 2]), 24);"
      },
      {
        "name": "two squares share the query corner",
        "body": "const d = new DetectSquares();\nd.add([0, 0]);\nd.add([0, 1]);\nd.add([1, 0]);\nd.add([0, 2]);\nd.add([2, 0]);\nd.add([2, 2]);\nassert.equal(d.count([1, 1]), 1);\nd.add([1, 1]);\nd.add([2, 1]);\nd.add([1, 2]);\nassert.equal(d.count([0, 0]), 2);"
      },
      {
        "name": "counting does not add the query point",
        "body": "const d = new DetectSquares();\nd.add([0, 0]);\nd.add([0, 2]);\nd.add([2, 0]);\nassert.equal(d.count([2, 2]), 1);\nassert.equal(d.count([2, 2]), 1);\nassert.equal(d.count([0, 0]), 0);"
      },
      {
        "name": "agrees with a brute force over every triple on random points",
        "body": "function seeded(seed) {\n  let a = seed >>> 0;\n  return () => {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction isSquare(p) {\n  const xs = [...new Set(p.map((q) => q[0]))].sort((a, b) => a - b);\n  const ys = [...new Set(p.map((q) => q[1]))].sort((a, b) => a - b);\n  if (xs.length !== 2 || ys.length !== 2 || xs[1] - xs[0] !== ys[1] - ys[0]) return false;\n  return new Set(p.map((q) => q[0] + ',' + q[1])).size === 4;\n}\nfor (let seed = 1; seed <= 60; seed++) {\n  const next = seeded(seed);\n  const d = new DetectSquares();\n  const stored = [];\n  for (let step = 0; step < 40; step++) {\n    const point = [Math.floor(next() * 5) - 1, Math.floor(next() * 5) - 1];\n    if (next() < 0.5 && stored.length < 18) {\n      d.add(point);\n      stored.push(point);\n    } else {\n      let expected = 0;\n      for (let i = 0; i < stored.length; i++)\n        for (let j = i + 1; j < stored.length; j++)\n          for (let k = j + 1; k < stored.length; k++)\n            if (isSquare([point, stored[i], stored[j], stored[k]])) expected++;\n      assert.equal(d.count(point), expected, 'seed ' + seed + ' step ' + step);\n    }\n  }\n}"
      },
      {
        "name": "a full lattice of 160000 points answers many queries quickly",
        "body": "const n = 400;\nconst d = new DetectSquares();\nfor (let x = 0; x < n; x++) for (let y = 0; y < n; y++) d.add([x, y]);\nfunction expected(px, py) {\n  const room = [n - 1 - px, px];\n  const roomY = [n - 1 - py, py];\n  let total = 0;\n  for (const a of room) for (const b of roomY) total += Math.min(a, b);\n  return total;\n}\nlet s = 12345;\nfor (let q = 0; q < 5000; q++) {\n  s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n  const px = s % n;\n  s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n  const py = s % n;\n  assert.equal(d.count([px, py]), expected(px, py));\n}"
      }
    ]
  }
];
