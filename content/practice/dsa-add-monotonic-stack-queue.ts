import type { Exercise } from "../types";

export const dsaAddMonotonicStackQueue: Exercise[] = [
  {
    "id": "ex-sliding-window-maximum",
    "chapter": "dsa-monotonic-stack-queue",
    "level": "intermediate",
    "title": "Sliding Window Maximum",
    "brief": "<p>Given an integer array <code>nums</code> and a window size <code>k</code>, the window slides from the left end of the array to the right end, one position at a time. Return the <b>maximum of every window</b>, in order.</p><ul><li><code>maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3)</code> is <code>[3, 3, 5, 5, 6, 7]</code></li><li>There are <code>nums.length - k + 1</code> windows; <code>1 &lt;= k &lt;= nums.length</code></li><li>Scanning each window costs O(n * k); the target is <b>O(n)</b> with a monotonic deque</li></ul>",
    "starter": "function maxSlidingWindow(nums, k) {\n  // TODO: keep a deque of indices whose values decrease from front to back\n}\n",
    "hints": [
      "If a new element is at least as large as an older one, the older one can never be a window maximum again: the new one is bigger and stays in the window longer.",
      "Keep a deque of indices with decreasing values. Pop from the back while the back value is <= the new value, then push the new index.",
      "The front is the current maximum. Before reading it, drop the front index if it has left the window (index <= i - k). Use a head pointer instead of shift() to keep each step O(1)."
    ],
    "solution": "function maxSlidingWindow(nums, k) {\n  const deque = [];\n  let head = 0;\n  const out = [];\n  for (let i = 0; i < nums.length; i++) {\n    if (head < deque.length && deque[head] <= i - k) head++;\n    while (deque.length > head && nums[deque[deque.length - 1]] <= nums[i]) deque.pop();\n    deque.push(i);\n    if (i >= k - 1) out.push(nums[deque[head]]);\n  }\n  return out;\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.deepEqual(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3), [3, 3, 5, 5, 6, 7]);"
      },
      {
        "name": "a window of one",
        "body": "assert.deepEqual(maxSlidingWindow([4, 2, 9], 1), [4, 2, 9]);"
      },
      {
        "name": "a window the size of the array",
        "body": "assert.deepEqual(maxSlidingWindow([2, 7, 1, 5], 4), [7]);"
      },
      {
        "name": "a single element",
        "body": "assert.deepEqual(maxSlidingWindow([8], 1), [8]);"
      },
      {
        "name": "a decreasing array",
        "body": "assert.deepEqual(maxSlidingWindow([9, 8, 7, 6, 5], 2), [9, 8, 7, 6]);"
      },
      {
        "name": "an increasing array",
        "body": "assert.deepEqual(maxSlidingWindow([1, 2, 3, 4, 5], 3), [3, 4, 5]);"
      },
      {
        "name": "equal values and negatives",
        "body": "assert.deepEqual(maxSlidingWindow([-7, -8, 7, 5, 7, 1, 6, 0], 4), [7, 7, 7, 7, 7]);\nassert.deepEqual(maxSlidingWindow([5, 5, 5, 5], 2), [5, 5, 5]);"
      },
      {
        "name": "matches the window-by-window maximum",
        "body": "let seed = 20260104;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nconst nums = Array.from({ length: 300 }, () => rand(41) - 20);\nfor (const k of [1, 2, 5, 17, 300]) {\n  const expected = [];\n  for (let i = 0; i + k <= nums.length; i++) expected.push(Math.max(...nums.slice(i, i + k)));\n  assert.deepEqual(maxSlidingWindow(nums, k), expected);\n}"
      },
      {
        "name": "a large input stays fast",
        "body": "const n = 100000;\nconst nums = Array.from({ length: n }, (_, i) => (i * 7919) % 10007);\nconst out = maxSlidingWindow(nums, 50000);\nassert.equal(out.length, n - 50000 + 1);\nassert.equal(out[0], Math.max(...nums.slice(0, 50000)));"
      }
    ]
  },
  {
    "id": "ex-online-stock-span",
    "chapter": "dsa-monotonic-stack-queue",
    "level": "intermediate",
    "title": "Online Stock Span",
    "brief": "<p>Implement a class <code>StockSpanner</code>. Each call <code>next(price)</code> receives the next day's price and returns that day's <b>span</b>: the number of consecutive days, going back from today and <b>including today</b>, on which the price was less than or equal to today's price.</p><ul><li>For the prices <code>100, 80, 60, 70, 60, 75, 85</code> the spans are <code>1, 1, 1, 2, 1, 4, 6</code></li><li>The prices arrive one at a time, so you cannot look at the whole array in advance</li><li>Each call should take O(1) amortised time</li></ul>",
    "starter": "class StockSpanner {\n  constructor() {\n    // TODO: a stack of (price, day) pairs\n  }\n\n  next(price) {\n    // TODO: pop every earlier price <= today's, then measure the distance to what is left\n  }\n}\n",
    "hints": [
      "The span ends at the previous day whose price is strictly greater than today's. You need the distance back to that day.",
      "Keep a stack of (price, day) pairs in strictly decreasing price order. Pop while the top price is <= today's price: those days are covered by today and never matter again.",
      "After popping, the span is day - topDay, or day + 1 if the stack is empty. Then push today's pair and advance the day counter."
    ],
    "solution": "class StockSpanner {\n  constructor() {\n    this.stack = [];\n    this.day = 0;\n  }\n\n  next(price) {\n    while (this.stack.length && this.stack[this.stack.length - 1].price <= price) this.stack.pop();\n    const span = this.stack.length ? this.day - this.stack[this.stack.length - 1].day : this.day + 1;\n    this.stack.push({ price, day: this.day });\n    this.day++;\n    return span;\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const s = new StockSpanner();\nconst out = [100, 80, 60, 70, 60, 75, 85].map((p) => s.next(p));\nassert.deepEqual(out, [1, 1, 1, 2, 1, 4, 6]);"
      },
      {
        "name": "equal prices extend the span",
        "body": "const s = new StockSpanner();\nassert.equal(s.next(5), 1);\nassert.equal(s.next(5), 2);\nassert.equal(s.next(5), 3);"
      },
      {
        "name": "a rising sequence",
        "body": "const s = new StockSpanner();\nconst out = [1, 2, 3, 4, 5].map((p) => s.next(p));\nassert.deepEqual(out, [1, 2, 3, 4, 5]);"
      },
      {
        "name": "a falling sequence",
        "body": "const s = new StockSpanner();\nconst out = [5, 4, 3, 2, 1].map((p) => s.next(p));\nassert.deepEqual(out, [1, 1, 1, 1, 1]);"
      },
      {
        "name": "a large price reaches back to the start",
        "body": "const s = new StockSpanner();\n[3, 1, 2, 1].forEach((p) => s.next(p));\nassert.equal(s.next(10), 5);"
      },
      {
        "name": "two instances do not share state",
        "body": "const a = new StockSpanner();\nconst b = new StockSpanner();\na.next(1);\na.next(2);\nassert.equal(b.next(2), 1);"
      },
      {
        "name": "matches a backward scan on pseudo-random prices",
        "body": "let seed = 20260104;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nconst s = new StockSpanner();\nconst prices = [];\nfor (let i = 0; i < 300; i++) {\n  const p = 1 + rand(30);\n  prices.push(p);\n  let span = 1;\n  while (i - span >= 0 && prices[i - span] <= p) span++;\n  assert.equal(s.next(p), span);\n}"
      },
      {
        "name": "many calls stay fast",
        "body": "const s = new StockSpanner();\nlet last = 0;\nfor (let i = 0; i < 100000; i++) last = s.next(i);\nassert.equal(last, 100000);"
      }
    ]
  },
  {
    "id": "ex-sum-of-subarray-minimums",
    "chapter": "dsa-monotonic-stack-queue",
    "level": "advanced",
    "title": "Sum of Subarray Minimums",
    "brief": "<p>Given an array of positive integers <code>arr</code>, return the sum of <code>min(subarray)</code> over <b>every contiguous subarray</b>, modulo <code>1000000007</code>.</p><ul><li><code>sumSubarrayMins([3, 1, 2, 4])</code> is <code>17</code>: the minimums of the ten subarrays are 3, 1, 1, 1, 1, 1, 2, 2, 2, 4</li><li><code>sumSubarrayMins([2, 2])</code> is <code>6</code>: equal values must not be counted twice, and not zero times</li><li>There are O(n²) subarrays; the target is <b>O(n)</b> using the contribution of each element</li></ul>",
    "starter": "function sumSubarrayMins(arr) {\n  // TODO: for each element count the subarrays it is the minimum of\n}\n",
    "hints": [
      "Instead of listing subarrays, ask for each element: in how many subarrays is this element the minimum? Its contribution is value * that count.",
      "Count = (number of possible starts) * (number of possible ends). Starts reach left until a smaller-or-equal element; ends reach right until a strictly smaller element.",
      "Make the left side stop at an equal value and the right side not, so each subarray is assigned to its leftmost minimum. A monotonic non-decreasing stack with a -Infinity sentinel gives both distances while popping."
    ],
    "solution": "function sumSubarrayMins(arr) {\n  const MOD = 1000000007;\n  const stack = [];\n  let total = 0;\n  for (let i = 0; i <= arr.length; i++) {\n    const current = i === arr.length ? -Infinity : arr[i];\n    while (stack.length && arr[stack[stack.length - 1]] > current) {\n      const mid = stack.pop();\n      const leftBound = stack.length ? stack[stack.length - 1] : -1;\n      total = (total + arr[mid] * (mid - leftBound) * (i - mid)) % MOD;\n    }\n    stack.push(i);\n  }\n  return total;\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.equal(sumSubarrayMins([3, 1, 2, 4]), 17);"
      },
      {
        "name": "equal values",
        "body": "assert.equal(sumSubarrayMins([2, 2]), 6);\nassert.equal(sumSubarrayMins([5, 5, 5]), 30);"
      },
      {
        "name": "one element",
        "body": "assert.equal(sumSubarrayMins([7]), 7);"
      },
      {
        "name": "an empty array",
        "body": "assert.equal(sumSubarrayMins([]), 0);"
      },
      {
        "name": "increasing",
        "body": "assert.equal(sumSubarrayMins([1, 2, 3]), 10);"
      },
      {
        "name": "decreasing",
        "body": "assert.equal(sumSubarrayMins([3, 2, 1]), 10);"
      },
      {
        "name": "a longer example",
        "body": "assert.equal(sumSubarrayMins([11, 81, 94, 43, 3]), 444);"
      },
      {
        "name": "matches the cubic definition on pseudo-random arrays",
        "body": "let seed = 20260104;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nfor (let t = 0; t < 40; t++) {\n  const arr = Array.from({ length: 1 + rand(12) }, () => 1 + rand(6));\n  let expected = 0;\n  for (let i = 0; i < arr.length; i++) {\n    let m = Infinity;\n    for (let j = i; j < arr.length; j++) {\n      m = Math.min(m, arr[j]);\n      expected += m;\n    }\n  }\n  assert.equal(sumSubarrayMins(arr), expected % 1000000007);\n}"
      },
      {
        "name": "the modulo is applied",
        "body": "const arr = Array.from({ length: 30000 }, () => 30000);\nconst n = 30000;\nconst expected = Number((BigInt(30000) * BigInt(n) * BigInt(n + 1) / 2n) % 1000000007n);\nassert.equal(sumSubarrayMins(arr), expected);"
      }
    ]
  },
  {
    "id": "ex-remove-duplicate-letters",
    "chapter": "dsa-monotonic-stack-queue",
    "level": "intermediate",
    "title": "Remove Duplicate Letters",
    "brief": "<p>Given a string <code>s</code> of lowercase letters, remove duplicate letters so that every letter that appears in <code>s</code> appears <b>exactly once</b>, and the result is the <b>smallest in lexicographic order</b> among all results that keep the original relative order of the letters.</p><ul><li><code>removeDuplicateLetters(\"cbacdcbc\")</code> is <code>\"acdb\"</code></li><li><code>removeDuplicateLetters(\"bcabc\")</code> is <code>\"abc\"</code></li><li>You may only remove letters, not reorder them</li></ul>",
    "starter": "function removeDuplicateLetters(s) {\n  // TODO: a stack, plus the last index of each letter\n}\n",
    "hints": [
      "Build the answer on a stack. A smaller new letter should replace a larger letter on top of the stack, if that larger letter can be placed again later.",
      "Precompute the last index of every letter. The top letter may be popped only if its last index is after the current position.",
      "Skip a letter that is already on the stack (use a Set); when you pop a letter, remove it from the Set so it can be placed again later."
    ],
    "solution": "function removeDuplicateLetters(s) {\n  const last = new Map();\n  for (let i = 0; i < s.length; i++) last.set(s[i], i);\n  const inStack = new Set();\n  const stack = [];\n  for (let i = 0; i < s.length; i++) {\n    const ch = s[i];\n    if (inStack.has(ch)) continue;\n    while (stack.length && stack[stack.length - 1] > ch && last.get(stack[stack.length - 1]) > i) {\n      inStack.delete(stack.pop());\n    }\n    stack.push(ch);\n    inStack.add(ch);\n  }\n  return stack.join(\"\");\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.equal(removeDuplicateLetters(\"cbacdcbc\"), \"acdb\");"
      },
      {
        "name": "a second example",
        "body": "assert.equal(removeDuplicateLetters(\"bcabc\"), \"abc\");"
      },
      {
        "name": "a single letter",
        "body": "assert.equal(removeDuplicateLetters(\"a\"), \"a\");\nassert.equal(removeDuplicateLetters(\"aaaa\"), \"a\");"
      },
      {
        "name": "already smallest",
        "body": "assert.equal(removeDuplicateLetters(\"abc\"), \"abc\");"
      },
      {
        "name": "a larger letter cannot be dropped if it never returns",
        "body": "assert.equal(removeDuplicateLetters(\"cba\"), \"cba\");"
      },
      {
        "name": "a letter that returns later can wait",
        "body": "assert.equal(removeDuplicateLetters(\"abacb\"), \"abc\");\nassert.equal(removeDuplicateLetters(\"ecbacba\"), \"eacb\");"
      },
      {
        "name": "the empty string",
        "body": "assert.equal(removeDuplicateLetters(\"\"), \"\");"
      },
      {
        "name": "matches the best of all subsequences on pseudo-random strings",
        "body": "let seed = 20260104;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nfor (let t = 0; t < 40; t++) {\n  const s = Array.from({ length: 1 + rand(9) }, () => 'abcd'[rand(4)]).join('');\n  const distinct = new Set(s).size;\n  let best = null;\n  const go = (i, cur) => {\n    if (i === s.length) {\n      if (cur.length === distinct && new Set(cur).size === distinct && (best === null || cur < best)) best = cur;\n      return;\n    }\n    go(i + 1, cur + s[i]);\n    go(i + 1, cur);\n  };\n  go(0, '');\n  assert.equal(removeDuplicateLetters(s), best);\n}"
      }
    ]
  },
  {
    "id": "ex-132-pattern",
    "chapter": "dsa-monotonic-stack-queue",
    "level": "advanced",
    "title": "132 Pattern",
    "brief": "<p>Given an integer array <code>nums</code>, decide whether it contains a <b>132 pattern</b>: three indices <code>i &lt; j &lt; k</code> with <code>nums[i] &lt; nums[k] &lt; nums[j]</code>. Return <code>true</code> if so.</p><ul><li><code>find132pattern([3, 1, 4, 2])</code> is <code>true</code> (the values 1, 4, 2)</li><li><code>find132pattern([1, 2, 3, 4])</code> is <code>false</code>, and so is <code>[1, 2, 2]</code>, because the comparisons are strict</li><li>Three nested loops are O(n³); the target is <b>O(n)</b></li></ul>",
    "starter": "function find132pattern(nums) {\n  // TODO: scan from the right with a decreasing stack and remember the best \"2\"\n}\n",
    "hints": [
      "Call the three values \"1\" (smallest, leftmost), \"3\" (largest, middle) and \"2\" (in between, rightmost). Fix the \"3\" and ask for the best \"2\" to its right.",
      "Scan from the right with a decreasing stack of candidates for \"3\". When the new element is bigger than the stack top, the popped value is smaller and to its right, so it is a valid \"2\" for this \"3\": keep the largest popped value in a variable.",
      "Before pushing, check whether the current element is smaller than that kept \"2\". If it is, it is a valid \"1\" and the answer is true."
    ],
    "solution": "function find132pattern(nums) {\n  let third = -Infinity;\n  const stack = [];\n  for (let i = nums.length - 1; i >= 0; i--) {\n    if (nums[i] < third) return true;\n    while (stack.length && stack[stack.length - 1] < nums[i]) third = stack.pop();\n    stack.push(nums[i]);\n  }\n  return false;\n}\n",
    "tests": [
      {
        "name": "a pattern exists",
        "body": "assert.equal(find132pattern([3, 1, 4, 2]), true);"
      },
      {
        "name": "strictly increasing has none",
        "body": "assert.equal(find132pattern([1, 2, 3, 4]), false);"
      },
      {
        "name": "strictly decreasing has none",
        "body": "assert.equal(find132pattern([4, 3, 2, 1]), false);"
      },
      {
        "name": "equal values are not enough",
        "body": "assert.equal(find132pattern([1, 2, 2]), false);\nassert.equal(find132pattern([3, 3, 3]), false);"
      },
      {
        "name": "too short",
        "body": "assert.equal(find132pattern([]), false);\nassert.equal(find132pattern([1, 2]), false);"
      },
      {
        "name": "a pattern with negatives",
        "body": "assert.equal(find132pattern([-1, 3, 2, 0]), true);"
      },
      {
        "name": "the 2 must be between the 1 and the 3",
        "body": "assert.equal(find132pattern([1, 0, 1, -4, -3]), false);"
      },
      {
        "name": "matches the triple loop on pseudo-random arrays",
        "body": "let seed = 20260104;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nfor (let t = 0; t < 300; t++) {\n  const nums = Array.from({ length: rand(10) }, () => rand(9) - 4);\n  let expected = false;\n  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) for (let k = j + 1; k < nums.length; k++) if (nums[i] < nums[k] && nums[k] < nums[j]) expected = true;\n  assert.equal(find132pattern(nums), expected);\n}"
      },
      {
        "name": "a large input stays fast",
        "body": "const nums = Array.from({ length: 100000 }, (_, i) => 100000 - i);\nassert.equal(find132pattern(nums), false);"
      }
    ]
  },
  {
    "id": "ex-car-fleet",
    "chapter": "dsa-monotonic-stack-queue",
    "level": "intermediate",
    "title": "Car Fleet",
    "brief": "<p>There are <code>n</code> cars on a one-lane road driving toward a <code>target</code> mile. <code>position[i]</code> is the starting mile and <code>speed[i]</code> the speed (miles per hour) of car <code>i</code>. A car can never pass another; if it catches up to a slower car ahead it slows to that car's speed and from then on they travel together as one <b>fleet</b>, and a car that catches up exactly at the target also joins that fleet.</p><p>Return the number of fleets that arrive at the target.</p><ul><li><code>carFleet(12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3])</code> is <code>3</code></li><li>All starting positions are distinct and below <code>target</code>; the input is not sorted</li></ul>",
    "starter": "function carFleet(target, position, speed) {\n  // TODO: sort by position, then compare arrival times\n}\n",
    "hints": [
      "Only arrival times matter. A car's own time to reach the target, ignoring everyone else, is (target - position) / speed.",
      "Sort the cars by position, closest to the target first. A car whose time is at most the time of the fleet in front will catch up to it and merge.",
      "Go through the cars in that order and keep the time of the last fleet; count a new fleet only when the car's time is strictly greater."
    ],
    "solution": "function carFleet(target, position, speed) {\n  const order = position.map((_, i) => i).sort((a, b) => position[b] - position[a]);\n  let fleets = 0;\n  let frontTime = 0;\n  for (const i of order) {\n    const time = (target - position[i]) / speed[i];\n    if (time > frontTime) {\n      fleets++;\n      frontTime = time;\n    }\n  }\n  return fleets;\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.equal(carFleet(12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3]), 3);"
      },
      {
        "name": "one car",
        "body": "assert.equal(carFleet(10, [3], [3]), 1);"
      },
      {
        "name": "no cars",
        "body": "assert.equal(carFleet(10, [], []), 0);"
      },
      {
        "name": "a fast car behind a slow one merges",
        "body": "assert.equal(carFleet(100, [0, 2, 4], [4, 2, 1]), 1);"
      },
      {
        "name": "cars that never meet stay separate",
        "body": "assert.equal(carFleet(100, [0, 50], [1, 1]), 2);\nassert.equal(carFleet(10, [6, 8], [3, 2]), 2);"
      },
      {
        "name": "arriving at the same moment counts as one fleet",
        "body": "assert.equal(carFleet(10, [0, 5], [2, 1]), 1);"
      },
      {
        "name": "the input order does not matter",
        "body": "assert.equal(carFleet(12, [0, 3, 5, 8, 10], [1, 3, 1, 4, 2]), 3);"
      },
      {
        "name": "matches the pairwise rule on pseudo-random cars",
        "body": "let seed = 20260104;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nfor (let t = 0; t < 100; t++) {\n  const target = 20 + rand(30);\n  const cars = new Set();\n  const n = rand(8);\n  while (cars.size < n) cars.add(rand(target));\n  const position = [...cars];\n  const speed = position.map(() => 1 + rand(6));\n  let expected = 0;\n  for (let i = 0; i < n; i++) {\n    let leader = true;\n    for (let j = 0; j < n; j++) {\n      if (position[j] > position[i] && (target - position[i]) * speed[j] <= (target - position[j]) * speed[i]) leader = false;\n    }\n    if (leader) expected++;\n  }\n  assert.equal(carFleet(target, position, speed), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-shortest-subarray-with-sum-at-least-k",
    "chapter": "dsa-monotonic-stack-queue",
    "level": "advanced",
    "title": "Shortest Subarray With Sum at Least K",
    "brief": "<p>Given an integer array <code>nums</code> that may contain <b>negative numbers</b> and an integer <code>k</code> (<code>k &gt;= 1</code>), return the length of the shortest non-empty contiguous subarray whose sum is at least <code>k</code>, or <code>-1</code> if there is none.</p><ul><li><code>shortestSubarray([2, -1, 2], 3)</code> is <code>3</code></li><li><code>shortestSubarray([1, 2], 4)</code> is <code>-1</code></li><li>A plain sliding window is wrong once negatives are allowed; the target is <b>O(n)</b> with prefix sums and a monotonic deque</li></ul>",
    "starter": "function shortestSubarray(nums, k) {\n  // TODO: prefix sums, and a deque of candidate start indices\n}\n",
    "hints": [
      "With prefix[i] the sum of the first i elements, a subarray (i, j] has sum prefix[j] - prefix[i]. You want the closest i < j with prefix[j] - prefix[i] >= k.",
      "Keep a deque of start indices whose prefix values are increasing. If prefix[j] - prefix[front] >= k, record j - front and pop the front: a later j would only make it longer.",
      "Before pushing j, pop from the back while prefix[back] >= prefix[j]: j is closer to any future end and has a smaller or equal prefix, so those starts can never win."
    ],
    "solution": "function shortestSubarray(nums, k) {\n  const n = nums.length;\n  const prefix = new Array(n + 1).fill(0);\n  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];\n  const deque = new Array(n + 1);\n  let head = 0;\n  let tail = 0;\n  let best = Infinity;\n  for (let j = 0; j <= n; j++) {\n    while (head < tail && prefix[j] - prefix[deque[head]] >= k) {\n      best = Math.min(best, j - deque[head]);\n      head++;\n    }\n    while (head < tail && prefix[deque[tail - 1]] >= prefix[j]) tail--;\n    deque[tail++] = j;\n  }\n  return best === Infinity ? -1 : best;\n}\n",
    "tests": [
      {
        "name": "negatives make the window longer",
        "body": "assert.equal(shortestSubarray([2, -1, 2], 3), 3);"
      },
      {
        "name": "no subarray is large enough",
        "body": "assert.equal(shortestSubarray([1, 2], 4), -1);\nassert.equal(shortestSubarray([], 1), -1);"
      },
      {
        "name": "one element is enough",
        "body": "assert.equal(shortestSubarray([1], 1), 1);\nassert.equal(shortestSubarray([5, 1, 9], 9), 1);"
      },
      {
        "name": "a plain sliding window would miss this",
        "body": "assert.equal(shortestSubarray([84, -37, 32, 40, 95], 167), 3);"
      },
      {
        "name": "a negative prefix before the answer",
        "body": "assert.equal(shortestSubarray([-28, 81, -20, 28, -29], 89), 3);"
      },
      {
        "name": "all negative",
        "body": "assert.equal(shortestSubarray([-1, -2, -3], 1), -1);"
      },
      {
        "name": "the whole array is needed",
        "body": "assert.equal(shortestSubarray([1, 1, 1, 1], 4), 4);"
      },
      {
        "name": "matches the quadratic scan on pseudo-random arrays",
        "body": "let seed = 20260104;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nfor (let t = 0; t < 300; t++) {\n  const nums = Array.from({ length: 1 + rand(12) }, () => rand(11) - 4);\n  const k = 1 + rand(14);\n  let expected = Infinity;\n  for (let i = 0; i < nums.length; i++) {\n    let sum = 0;\n    for (let j = i; j < nums.length; j++) {\n      sum += nums[j];\n      if (sum >= k) { expected = Math.min(expected, j - i + 1); break; }\n    }\n  }\n  assert.equal(shortestSubarray(nums, k), expected === Infinity ? -1 : expected);\n}"
      },
      {
        "name": "a large input stays fast",
        "body": "const nums = Array.from({ length: 100000 }, (_, i) => (i % 7) - 3);\nconst result = shortestSubarray(nums, 5);\nassert.ok(result >= 1);"
      }
    ]
  },
  {
    "id": "ex-jump-game-vi",
    "chapter": "dsa-monotonic-stack-queue",
    "level": "advanced",
    "title": "Jump Game VI",
    "brief": "<p>You start at index <code>0</code> of <code>nums</code> and want to reach the last index. From index <code>i</code> you may jump to any index from <code>i + 1</code> to <code>i + k</code> that is inside the array. Your <b>score</b> is the sum of <code>nums[j]</code> over every index <code>j</code> you stand on, including the first and the last. Return the maximum score.</p><ul><li><code>maxResult([1, -1, -2, 4, -7, 3], 2)</code> is <code>7</code> (path 1, -1, 4, 3)</li><li>Values can be negative; you cannot skip the last index</li><li>The DP <code>dp[i] = nums[i] + max(dp[i - k..i - 1])</code> is O(n * k); the target is <b>O(n)</b></li></ul>",
    "starter": "function maxResult(nums, k) {\n  // TODO: the DP, with the window maximum kept in a monotonic deque\n}\n",
    "hints": [
      "Let dp[i] be the best score of a path ending at i. Then dp[i] = nums[i] + max(dp[j]) over the previous k indices j.",
      "That is the maximum of a sliding window over dp. Keep a deque of indices whose dp values decrease from front to back.",
      "At step i, drop the front if its index is below i - k, compute dp[i] from the front, then pop back entries with dp <= dp[i] and push i. The answer is dp[n - 1]."
    ],
    "solution": "function maxResult(nums, k) {\n  const n = nums.length;\n  const dp = new Array(n);\n  dp[0] = nums[0];\n  const deque = [0];\n  let head = 0;\n  for (let i = 1; i < n; i++) {\n    if (deque[head] < i - k) head++;\n    dp[i] = nums[i] + dp[deque[head]];\n    while (deque.length > head && dp[deque[deque.length - 1]] <= dp[i]) deque.pop();\n    deque.push(i);\n  }\n  return dp[n - 1];\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.equal(maxResult([1, -1, -2, 4, -7, 3], 2), 7);"
      },
      {
        "name": "another example",
        "body": "assert.equal(maxResult([10, -5, -2, 4, 0, 3], 3), 17);"
      },
      {
        "name": "all negative with a long jump",
        "body": "assert.equal(maxResult([1, -5, -20, 4, -1, 3, -6, -3], 2), 0);"
      },
      {
        "name": "one element",
        "body": "assert.equal(maxResult([-4], 3), -4);"
      },
      {
        "name": "k is one, so every element is taken",
        "body": "assert.equal(maxResult([1, -2, 3, -4], 1), -2);"
      },
      {
        "name": "k covers the whole array",
        "body": "assert.equal(maxResult([5, -9, -9, 7], 10), 12);"
      },
      {
        "name": "two elements",
        "body": "assert.equal(maxResult([3, -8], 1), -5);"
      },
      {
        "name": "matches the quadratic DP on pseudo-random arrays",
        "body": "let seed = 20260104;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nfor (let t = 0; t < 200; t++) {\n  const nums = Array.from({ length: 1 + rand(14) }, () => rand(21) - 10);\n  const k = 1 + rand(6);\n  const dp = [nums[0]];\n  for (let i = 1; i < nums.length; i++) {\n    let best = -Infinity;\n    for (let j = Math.max(0, i - k); j < i; j++) best = Math.max(best, dp[j]);\n    dp.push(nums[i] + best);\n  }\n  assert.equal(maxResult(nums, k), dp[nums.length - 1]);\n}"
      },
      {
        "name": "a large input stays fast",
        "body": "const nums = Array.from({ length: 100000 }, (_, i) => (i % 5) - 2);\nconst result = maxResult(nums, 50000);\nassert.ok(Number.isInteger(result));"
      }
    ]
  }
];
