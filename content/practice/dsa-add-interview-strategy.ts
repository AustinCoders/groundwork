import type { Exercise } from "../types";

export const dsaAddInterviewStrategy: Exercise[] = [
  {
    "id": "ex-largest-affordable-n",
    "chapter": "dsa-interview-strategy",
    "level": "intermediate",
    "title": "How Big Can n Be?",
    "brief": "<p>Reading a constraint backwards means knowing the largest <code>n</code> a complexity can afford. Write <code>largestAffordableN(complexity, budget)</code>: return the largest integer <code>n >= 1</code> whose cost is at most <code>budget</code> operations, or <code>0</code> if even <code>n = 1</code> costs more. <code>budget</code> defaults to <code>1e8</code>.</p><p>The cost functions, written the way you would count steps:</p><ul><li><code>'O(n)'</code>: <code>n</code></li><li><code>'O(n log n)'</code>: <code>n * Math.log2(n)</code></li><li><code>'O(n^2)'</code>: <code>n * n</code> and <code>'O(n^3)'</code>: <code>n * n * n</code></li><li><code>'O(2^n)'</code>: <code>2 ** n</code>, <code>'O(n*2^n)'</code>: <code>n * 2 ** n</code>, <code>'O(n^2*2^n)'</code>: <code>n * n * 2 ** n</code></li><li><code>'O(3^n)'</code>: <code>3 ** n</code> and <code>'O(n!)'</code>: <code>n!</code></li></ul><p>Every cost grows with n, and n can be as large as 100 million, so do not try every n one by one.</p>",
    "starter": "function largestAffordableN(complexity, budget = 1e8) {\n  // TODO\n}\n\nconsole.log(largestAffordableN('O(2^n)')); // 26\n",
    "hints": [
      "Write one function cost(n) per complexity string. Because every cost is increasing in n, the answer is the last n where cost(n) <= budget.",
      "Trying n = 1, 2, 3, ... works for the exponential ones but is far too slow for 'O(n)' with a budget of 1e8. Search instead: double an upper bound until the cost exceeds the budget, then binary search below it.",
      "For n!, compute the cost with a loop, and stop multiplying once the product passes the budget so a big n cannot run for long. Return 0 when cost(1) is already over the budget."
    ],
    "solution": "function largestAffordableN(complexity, budget = 1e8) {\n  const cost = {\n    'O(n)': (n) => n,\n    'O(n log n)': (n) => n * Math.log2(n),\n    'O(n^2)': (n) => n * n,\n    'O(n^3)': (n) => n * n * n,\n    'O(2^n)': (n) => 2 ** n,\n    'O(n*2^n)': (n) => n * 2 ** n,\n    'O(n^2*2^n)': (n) => n * n * 2 ** n,\n    'O(3^n)': (n) => 3 ** n,\n    'O(n!)': (n) => {\n      let f = 1;\n      for (let i = 2; i <= n; i++) {\n        f *= i;\n        if (f > budget) return f;\n      }\n      return f;\n    },\n  }[complexity];\n  if (cost(1) > budget) return 0;\n  let hi = 2;\n  while (cost(hi) <= budget) hi *= 2;\n  let lo = hi / 2;\n  while (hi - lo > 1) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (cost(mid) <= budget) lo = mid;\n    else hi = mid;\n  }\n  return lo;\n}\n",
    "tests": [
      {
        "name": "factorial and exponential limits at 1e8",
        "body": "assert.equal(largestAffordableN('O(n!)'), 11);\nassert.equal(largestAffordableN('O(2^n)'), 26);\nassert.equal(largestAffordableN('O(3^n)'), 16);"
      },
      {
        "name": "the bitmask-DP shapes",
        "body": "assert.equal(largestAffordableN('O(n*2^n)'), 22);\nassert.equal(largestAffordableN('O(n^2*2^n)'), 18);"
      },
      {
        "name": "polynomial limits",
        "body": "assert.equal(largestAffordableN('O(n^2)'), 10000);\nassert.equal(largestAffordableN('O(n^3)'), 464);"
      },
      {
        "name": "n log n and linear",
        "body": "assert.equal(largestAffordableN('O(n log n)'), 4523071);\nassert.equal(largestAffordableN('O(n)'), 100000000);"
      },
      {
        "name": "a different budget",
        "body": "assert.equal(largestAffordableN('O(2^n)', 1024), 10);\nassert.equal(largestAffordableN('O(n!)', 1e6), 9);\nassert.equal(largestAffordableN('O(n^2)', 99), 9);\nassert.equal(largestAffordableN('O(n^2)', 100), 10);"
      },
      {
        "name": "a budget too small for even n = 1",
        "body": "assert.equal(largestAffordableN('O(n)', 0), 0);\nassert.equal(largestAffordableN('O(n^2*2^n)', 1), 0);\nassert.equal(largestAffordableN('O(2^n)', 1), 0);"
      },
      {
        "name": "landing exactly on the budget counts",
        "body": "assert.equal(largestAffordableN('O(n!)', 120), 5);\nassert.equal(largestAffordableN('O(3^n)', 81), 4);\nassert.equal(largestAffordableN('O(n)', 1), 1);"
      },
      {
        "name": "a bigger budget never gives a smaller n",
        "body": "const kinds = ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n^3)', 'O(2^n)', 'O(n*2^n)', 'O(n^2*2^n)', 'O(3^n)', 'O(n!)'];\nfor (const k of kinds) {\n  let prev = 0;\n  for (const b of [10, 1e3, 1e5, 1e7, 1e8, 1e9]) {\n    const n = largestAffordableN(k, b);\n    assert.ok(n >= prev, k + ' at ' + b);\n    prev = n;\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-greedy-counterexample",
    "chapter": "dsa-interview-strategy",
    "level": "intermediate",
    "title": "Break the Greedy Idea",
    "brief": "<p>\"Take the largest coin that fits, repeatedly\" is correct for some coin systems and wrong for others. Write <code>firstGreedyFailure(coins, limit)</code>: return the <b>smallest</b> amount from <code>1</code> to <code>limit</code> for which largest-coin-first greedy does not use the fewest possible coins, or <code>-1</code> if there is no such amount.</p><ul><li>Greedy takes <code>Math.floor(amount / coin)</code> of each coin from largest to smallest. If it cannot reach the amount exactly, it has <b>failed</b>, and that counts as a failure when some combination does reach the amount</li><li>If <b>no</b> combination reaches an amount, greedy and the optimum agree (neither can do it), so it is not a failure</li><li>Coins are positive integers and need not include 1. Do not change <code>coins</code></li></ul>",
    "starter": "function firstGreedyFailure(coins, limit) {\n  // TODO\n}\n\nconsole.log(firstGreedyFailure([1, 3, 4], 20)); // 6\n",
    "hints": [
      "You need two answers per amount: what greedy gives, and what the true minimum is. Write them as separate small functions, each returning -1 when the amount cannot be made.",
      "The true minimum is a DP over amounts: best[0] = 0, and best[a] is the minimum of best[a - coin] + 1 over coins that fit.",
      "Compare the two for amount = 1, 2, ... up to limit and return the first amount where they differ. Sort a copy of the coins for greedy so the input is not changed."
    ],
    "solution": "function firstGreedyFailure(coins, limit) {\n  const descending = [...coins].sort((a, b) => b - a);\n  const greedy = (amount) => {\n    let count = 0;\n    for (const coin of descending) {\n      count += Math.floor(amount / coin);\n      amount %= coin;\n    }\n    return amount === 0 ? count : -1;\n  };\n  const best = new Array(limit + 1).fill(Infinity);\n  best[0] = 0;\n  for (let a = 1; a <= limit; a++) {\n    for (const coin of coins) {\n      if (coin <= a && best[a - coin] + 1 < best[a]) best[a] = best[a - coin] + 1;\n    }\n  }\n  for (let a = 1; a <= limit; a++) {\n    const optimum = best[a] === Infinity ? -1 : best[a];\n    if (greedy(a) !== optimum) return a;\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "coins 1, 3, 4 fail first at 6",
        "body": "assert.equal(firstGreedyFailure([1, 3, 4], 20), 6);"
      },
      {
        "name": "the usual currency never fails",
        "body": "assert.equal(firstGreedyFailure([1, 5, 10, 25], 300), -1);\nassert.equal(firstGreedyFailure([1, 2, 5, 10, 20, 50], 300), -1);"
      },
      {
        "name": "a larger coin set with one bad amount",
        "body": "assert.equal(firstGreedyFailure([1, 5, 10, 20, 25], 100), 40);\nassert.equal(firstGreedyFailure([1, 15, 25], 100), 30);\nassert.equal(firstGreedyFailure([1, 6, 10], 100), 12);"
      },
      {
        "name": "the limit cuts the search short",
        "body": "assert.equal(firstGreedyFailure([1, 3, 4], 5), -1);\nassert.equal(firstGreedyFailure([1, 3, 4], 6), 6);"
      },
      {
        "name": "without a 1-coin, greedy can fail to make an amount at all",
        "body": "assert.equal(firstGreedyFailure([3, 5], 20), 6);\nassert.equal(firstGreedyFailure([2, 5], 20), 6);"
      },
      {
        "name": "an amount nobody can make is not a failure",
        "body": "assert.equal(firstGreedyFailure([7], 100), -1);\nassert.equal(firstGreedyFailure([2], 9), -1);"
      },
      {
        "name": "the order of coins does not matter and the input is untouched",
        "body": "const coins = [4, 1, 3];\nassert.equal(firstGreedyFailure(coins, 20), 6);\nassert.deepEqual(coins, [4, 1, 3]);"
      },
      {
        "name": "agrees with a memoized recursion over every coin choice",
        "body": "function seeded(seed) {\n  let s = seed >>> 0;\n  return () => {\n    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n    return s / 4294967296;\n  };\n}\nconst next = seeded(17);\nfor (let t = 0; t < 120; t++) {\n  const set = new Set();\n  const size = 1 + Math.floor(next() * 4);\n  while (set.size < size) set.add(1 + Math.floor(next() * 12));\n  const coins = [...set];\n  const limit = 1 + Math.floor(next() * 40);\n  const seen = new Map();\n  const fewest = (amount) => {\n    if (amount === 0) return 0;\n    if (seen.has(amount)) return seen.get(amount);\n    let best = Infinity;\n    for (const c of coins) if (c <= amount) best = Math.min(best, fewest(amount - c) + 1);\n    seen.set(amount, best);\n    return best;\n  };\n  const greedy = (amount) => {\n    let count = 0;\n    for (const c of [...coins].sort((a, b) => b - a)) {\n      count += Math.floor(amount / c);\n      amount %= c;\n    }\n    return amount === 0 ? count : -1;\n  };\n  let expected = -1;\n  for (let a = 1; a <= limit && expected === -1; a++) {\n    const f = fewest(a);\n    if (greedy(a) !== (f === Infinity ? -1 : f)) expected = a;\n  }\n  assert.equal(firstGreedyFailure(coins, limit), expected, JSON.stringify(coins) + ' ' + limit);\n}"
      }
    ]
  },
  {
    "id": "ex-majority-element-stream",
    "chapter": "dsa-interview-strategy",
    "level": "advanced",
    "title": "Majority Element in a Stream",
    "brief": "<p>Values arrive one at a time and you may not store them. Write a class <code>MajorityStream</code> with <code>add(x)</code> and <code>majority()</code>.</p><ul><li><code>majority()</code> returns the value that has appeared <b>more than half</b> of the times so far, <b>provided one exists</b>. If no value has a strict majority, it may return anything</li><li>Before anything has been added, <code>majority()</code> returns <code>undefined</code></li><li>Use <b>O(1)</b> memory: no array, <code>Map</code> or <code>Set</code> of the values seen</li><li>Values are compared with <code>===</code></li></ul>",
    "starter": "class MajorityStream {\n  constructor() {\n    // TODO\n  }\n\n  add(x) {\n    // TODO\n  }\n\n  majority() {\n    // TODO\n  }\n}\n",
    "hints": [
      "You cannot count every distinct value, so keep just one candidate and one number: how many unmatched votes it has.",
      "Pair off different values: when x equals the candidate, add a vote; when it differs, remove a vote (they cancel); when the votes are zero, x becomes the candidate with one vote.",
      "A strict majority cannot be fully cancelled by pairing, because every cancellation removes one copy of it together with one copy of something else, and the others are fewer than half. So the candidate that survives is that value."
    ],
    "solution": "class MajorityStream {\n  constructor() {\n    this.candidate = undefined;\n    this.votes = 0;\n  }\n\n  add(x) {\n    if (this.votes === 0) {\n      this.candidate = x;\n      this.votes = 1;\n    } else if (x === this.candidate) {\n      this.votes++;\n    } else {\n      this.votes--;\n    }\n  }\n\n  majority() {\n    return this.candidate;\n  }\n}\n",
    "tests": [
      {
        "name": "nothing added yet",
        "body": "assert.equal(new MajorityStream().majority(), undefined);"
      },
      {
        "name": "one value",
        "body": "const m = new MajorityStream();\nm.add('a');\nassert.equal(m.majority(), 'a');"
      },
      {
        "name": "a clear majority",
        "body": "const m = new MajorityStream();\nfor (const x of [2, 2, 1, 1, 1, 2, 2]) m.add(x);\nassert.equal(m.majority(), 2);"
      },
      {
        "name": "the majority can arrive last",
        "body": "const m = new MajorityStream();\nfor (const x of [1, 2, 3, 4, 5, 5, 5, 5, 5]) m.add(x);\nassert.equal(m.majority(), 5);"
      },
      {
        "name": "the answer follows the stream as it grows",
        "body": "const m = new MajorityStream();\nm.add(1);\nm.add(1);\nassert.equal(m.majority(), 1);\nfor (let i = 0; i < 5; i++) m.add(2);\nassert.equal(m.majority(), 2);"
      },
      {
        "name": "values of different types are different values",
        "body": "const m = new MajorityStream();\nfor (const x of ['1', 1, '1', 1, '1']) m.add(x);\nassert.equal(m.majority(), '1');"
      },
      {
        "name": "it does not store the stream",
        "body": "const m = new MajorityStream();\nfor (let i = 0; i < 100000; i++) m.add(i % 3 === 0 ? 'x' : i);\nconst heavy = Object.values(m).filter((v) => Array.isArray(v) || v instanceof Map || v instanceof Set);\nassert.equal(heavy.length, 0);\nassert.ok(Object.keys(m).length <= 3);"
      },
      {
        "name": "finds the majority in 300 random streams",
        "body": "function seeded(seed) {\n  let s = seed >>> 0;\n  return () => {\n    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n    return s / 4294967296;\n  };\n}\nconst next = seeded(2);\nfor (let t = 0; t < 300; t++) {\n  const n = 1 + Math.floor(next() * 21);\n  const major = Math.floor(next() * 6);\n  const items = Array.from({ length: Math.floor(n / 2) + 1 }, () => major);\n  while (items.length < n) items.push(Math.floor(next() * 6));\n  for (let i = items.length - 1; i > 0; i--) {\n    const j = Math.floor(next() * (i + 1));\n    [items[i], items[j]] = [items[j], items[i]];\n  }\n  const m = new MajorityStream();\n  for (const x of items) m.add(x);\n  assert.equal(m.majority(), major, JSON.stringify(items));\n}"
      }
    ]
  },
  {
    "id": "ex-sliding-window-maximum-deque",
    "chapter": "dsa-interview-strategy",
    "level": "advanced",
    "title": "Sliding Window Maximum",
    "brief": "<p>Write <code>maxSlidingWindow(nums, k)</code>: for every window of <code>k</code> consecutive elements, from the left end to the right end, return the largest element in it. There are <code>nums.length - k + 1</code> windows.</p><ul><li><code>1 &lt;= k &lt;= nums.length</code>; values may be negative or repeated</li><li><code>nums.length</code> can reach <b>200,000</b> with <code>k</code> as large as 100,000, so an O(n * k) scan will not finish in time: the target is O(n)</li><li>Do not change <code>nums</code></li></ul>",
    "starter": "function maxSlidingWindow(nums, k) {\n  // TODO\n}\n\nconsole.log(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3)); // [3, 3, 5, 5, 6, 7]\n",
    "hints": [
      "Consecutive windows share k - 1 elements, so rescanning each one repeats work. You want the maximum of a window that loses an element on the left and gains one on the right.",
      "If an earlier element is not larger than a later one, it can never be a window maximum again: the later one is at least as big and stays in the window longer. Keep only indices whose values strictly decrease from front to back.",
      "Use a deque of indices. For each i: drop the front if it is no longer inside the window, pop from the back while nums[back] <= nums[i], push i, and once i >= k - 1 the front is the maximum. Avoid Array.shift() on a big array; move a head index instead."
    ],
    "solution": "function maxSlidingWindow(nums, k) {\n  const result = [];\n  const deque = [];\n  let head = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (head < deque.length && deque[head] <= i - k) head++;\n    while (deque.length > head && nums[deque[deque.length - 1]] <= nums[i]) deque.pop();\n    deque.push(i);\n    if (i >= k - 1) result.push(nums[deque[head]]);\n  }\n  return result;\n}\n",
    "tests": [
      {
        "name": "the classic example",
        "body": "assert.deepEqual(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3), [3, 3, 5, 5, 6, 7]);"
      },
      {
        "name": "a window of one is the array itself",
        "body": "assert.deepEqual(maxSlidingWindow([1, 0], 1), [1, 0]);\nassert.deepEqual(maxSlidingWindow([4, 2, 9], 1), [4, 2, 9]);"
      },
      {
        "name": "a window as long as the array",
        "body": "assert.deepEqual(maxSlidingWindow([1, 3, 2], 3), [3]);\nassert.deepEqual(maxSlidingWindow([7], 1), [7]);"
      },
      {
        "name": "decreasing and increasing input",
        "body": "assert.deepEqual(maxSlidingWindow([9, 8, 7, 6], 2), [9, 8, 7]);\nassert.deepEqual(maxSlidingWindow([1, 2, 3, 4], 2), [2, 3, 4]);"
      },
      {
        "name": "equal values",
        "body": "assert.deepEqual(maxSlidingWindow([5, 5, 5], 2), [5, 5]);\nassert.deepEqual(maxSlidingWindow([2, 2, 1, 2, 2], 3), [2, 2, 2]);"
      },
      {
        "name": "negative numbers",
        "body": "assert.deepEqual(maxSlidingWindow([-5, -3, -8, -1], 2), [-3, -3, -1]);"
      },
      {
        "name": "the input is not modified",
        "body": "const a = [4, 1, 5, 2];\nmaxSlidingWindow(a, 2);\nassert.deepEqual(a, [4, 1, 5, 2]);"
      },
      {
        "name": "agrees with a window scan on 400 random arrays",
        "body": "function seeded(seed) {\n  let s = seed >>> 0;\n  return () => {\n    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n    return s / 4294967296;\n  };\n}\nconst next = seeded(31);\nfor (let t = 0; t < 400; t++) {\n  const n = 1 + Math.floor(next() * 14);\n  const k = 1 + Math.floor(next() * n);\n  const nums = Array.from({ length: n }, () => Math.floor(next() * 13) - 6);\n  const expected = [];\n  for (let i = 0; i + k <= n; i++) expected.push(Math.max(...nums.slice(i, i + k)));\n  assert.deepEqual(maxSlidingWindow(nums, k), expected, JSON.stringify(nums) + ' ' + k);\n}"
      },
      {
        "name": "two hundred thousand numbers with a huge window",
        "body": "const n = 200000;\nconst nums = Array.from({ length: n }, (_, i) => (i * 7919) % 10007);\nconst out = maxSlidingWindow(nums, 100000);\nassert.equal(out.length, 100001);\nconst biggest = (items) => items.reduce((a, b) => Math.max(a, b));\nassert.equal(out[0], biggest(nums.slice(0, 100000)));\nassert.equal(out[100000], biggest(nums.slice(100000)));"
      }
    ]
  }
];
