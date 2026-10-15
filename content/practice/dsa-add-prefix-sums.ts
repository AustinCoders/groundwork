import type { Exercise } from "../types";

export const dsaAddPrefixSums: Exercise[] = [
  {
    id: "ex-batch-range-sums",
    chapter: "dsa-prefix-sums",
    level: "beginner",
    title: "Batch Range Sums",
    brief: "<p>Given an integer array <code>nums</code> and a list of <code>queries</code>, where each query is a pair <code>[left, right]</code>, return an array whose i-th entry is the sum of <code>nums[left] + ... + nums[right]</code> for that query.</p><ul><li>Both bounds are <b>inclusive</b> and <code>left &lt;= right</code></li><li>Values can be negative or zero</li><li>There may be many thousands of queries, so re-adding the range every time is too slow: answer each query in <b>O(1)</b> after one linear pass</li><li>If <code>queries</code> is empty, return an empty array</li></ul>",
    starter: "function rangeSums(nums, queries) {\n  // TODO: one pass to build running totals, then one subtraction per query\n}\n",
    hints: [
      "Looping from left to right inside each query costs O(n) per query. What could you store once so a query needs no loop?",
      "Let prefix[i] be the sum of the first i elements, with prefix[0] = 0. The sum of nums[left..right] is prefix[right + 1] - prefix[left].",
      "Make prefix one slot longer than nums. The leading 0 removes the special case for left === 0.",
    ],
    solution: "function rangeSums(nums, queries) {\n  const prefix = new Array(nums.length + 1).fill(0);\n  for (let i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];\n  return queries.map(([left, right]) => prefix[right + 1] - prefix[left]);\n}\n",
    tests: [
      {
        name: "sums interior ranges",
        body: "assert.deepEqual(rangeSums([2, -1, 3, 4, -2], [[1, 3], [0, 4], [2, 2]]), [6, 6, 3]);",
      },
      {
        name: "a range that starts at index 0",
        body: "assert.deepEqual(rangeSums([5, 1, 2], [[0, 0], [0, 2]]), [5, 8]);",
      },
      {
        name: "a range that ends at the last index",
        body: "assert.deepEqual(rangeSums([5, 1, 2], [[2, 2], [1, 2]]), [2, 3]);",
      },
      {
        name: "all negative values",
        body: "assert.deepEqual(rangeSums([-4, -3, -2, -1], [[0, 3], [1, 2]]), [-10, -5]);",
      },
      {
        name: "a single element array",
        body: "assert.deepEqual(rangeSums([42], [[0, 0], [0, 0]]), [42, 42]);",
      },
      {
        name: "no queries gives an empty answer",
        body: "assert.deepEqual(rangeSums([1, 2, 3], []), []);",
      },
      {
        name: "a range that cancels to zero",
        body: "assert.deepEqual(rangeSums([3, -3, 7, -7], [[0, 1], [2, 3], [0, 3]]), [0, 0, 0]);",
      },
      {
        name: "many queries on a long array",
        body: "const nums = Array.from({ length: 20000 }, (_, i) => i % 7 - 3);\nconst queries = Array.from({ length: 20000 }, (_, i) => [i % 5000, 5000 + (i % 15000)]);\nconst out = rangeSums(nums, queries);\nassert.equal(out.length, 20000);\nassert.equal(out[0], nums.slice(0, 5001).reduce((s, v) => s + v, 0));",
      },
    ],
  },
  {
    id: "ex-count-valid-splits",
    chapter: "dsa-prefix-sums",
    level: "beginner",
    title: "Count Valid Splits",
    brief: "<p>Given an integer array <code>nums</code> of length <code>n</code>, a <b>split at index i</b> (<code>0 &lt;= i &lt; n - 1</code>) cuts it into a left part <code>nums[0..i]</code> and a right part <code>nums[i + 1..n - 1]</code>. Both parts are non-empty.</p><p>Return how many splits have a left-part sum <b>greater than or equal to</b> the right-part sum.</p><ul><li>Values may be negative</li><li>An array with fewer than two elements has no split, so return <code>0</code></li><li>Aim for O(n) time and O(1) extra space</li></ul>",
    starter: "function validSplits(nums) {\n  // TODO: count the indices where the left sum >= the right sum\n}\n",
    hints: [
      "Computing both sums at every index costs O(n) per index. Notice that the right sum is just the total minus the left sum.",
      "Compute total once. Then walk i from 0 to n - 2 keeping a running left sum and test left >= total - left.",
      "The loop must stop at n - 2: a split at n - 1 would leave the right part empty.",
    ],
    solution: "function validSplits(nums) {\n  let total = 0;\n  for (const x of nums) total += x;\n  let left = 0;\n  let count = 0;\n  for (let i = 0; i < nums.length - 1; i++) {\n    left += nums[i];\n    if (left >= total - left) count++;\n  }\n  return count;\n}\n",
    tests: [
      {
        name: "counts the valid splits",
        body: "assert.equal(validSplits([10, 4, -8, 7]), 2);",
      },
      {
        name: "ties count as valid",
        body: "assert.equal(validSplits([3, 1, 2, 0]), 3);",
      },
      {
        name: "no valid split",
        body: "assert.equal(validSplits([-5, -1, -1]), 0);",
      },
      {
        name: "two elements",
        body: "assert.equal(validSplits([3, 3]), 1);\nassert.equal(validSplits([1, 3]), 0);",
      },
      {
        name: "a single element has no split",
        body: "assert.equal(validSplits([5]), 0);",
      },
      {
        name: "an empty array has no split",
        body: "assert.equal(validSplits([]), 0);",
      },
      {
        name: "every split is valid when the left part is large",
        body: "assert.equal(validSplits([9, 1, 1, 1, 1]), 4);",
      },
      {
        name: "zeros all tie",
        body: "assert.equal(validSplits([0, 0, 0, 0]), 3);",
      },
    ],
  },
  {
    id: "ex-apply-range-updates",
    chapter: "dsa-prefix-sums",
    level: "beginner",
    title: "Apply Range Updates",
    brief: "<p>Start with an array of <code>n</code> zeros. You are given a list of <code>updates</code>, each a triple <code>[left, right, delta]</code> meaning \"add <code>delta</code> to every element from index <code>left</code> to index <code>right</code>, inclusive\". Return the array after <b>all</b> updates have been applied.</p><ul><li><code>delta</code> may be negative</li><li>Updates can overlap</li><li>Looping over every range costs O(n) per update. Target <b>O(n + number of updates)</b> in total</li><li>An update may end at the last index, <code>n - 1</code>: make sure that does not read or write outside your array</li></ul>",
    starter: "function applyUpdates(n, updates) {\n  // TODO: record each update in O(1), then rebuild the array in one pass\n}\n",
    hints: [
      "Adding delta to a whole range is the same as changing the step between neighbours at just two places: where the range starts and where it ends.",
      "Keep a difference array of length n + 1: add delta at diff[left] and subtract it at diff[right + 1]. Then a running sum over diff gives each element.",
      "The extra slot at index n absorbs the subtraction when right is the last index, so no bounds check is needed.",
    ],
    solution: "function applyUpdates(n, updates) {\n  const diff = new Array(n + 1).fill(0);\n  for (const [left, right, delta] of updates) {\n    diff[left] += delta;\n    diff[right + 1] -= delta;\n  }\n  const result = new Array(n);\n  let running = 0;\n  for (let i = 0; i < n; i++) {\n    running += diff[i];\n    result[i] = running;\n  }\n  return result;\n}\n",
    tests: [
      {
        name: "overlapping updates",
        body: "assert.deepEqual(applyUpdates(5, [[1, 3, 2], [2, 4, 3], [0, 2, -1]]), [-1, 1, 4, 5, 3]);",
      },
      {
        name: "no updates leaves zeros",
        body: "assert.deepEqual(applyUpdates(3, []), [0, 0, 0]);",
      },
      {
        name: "one update on the whole array",
        body: "assert.deepEqual(applyUpdates(4, [[0, 3, 7]]), [7, 7, 7, 7]);",
      },
      {
        name: "an update that ends at the last index",
        body: "assert.deepEqual(applyUpdates(3, [[2, 2, 5], [1, 2, 1]]), [0, 1, 6]);",
      },
      {
        name: "an update of one element",
        body: "assert.deepEqual(applyUpdates(1, [[0, 0, -4]]), [-4]);",
      },
      {
        name: "updates that cancel out",
        body: "assert.deepEqual(applyUpdates(4, [[0, 2, 3], [0, 2, -3]]), [0, 0, 0, 0]);",
      },
      {
        name: "disjoint updates",
        body: "assert.deepEqual(applyUpdates(6, [[0, 1, 1], [4, 5, 2]]), [1, 1, 0, 0, 2, 2]);",
      },
      {
        name: "many updates on a long array",
        body: "const n = 100000;\nconst out = applyUpdates(n, Array.from({ length: n }, (_, i) => [i, n - 1, 1]));\nassert.equal(out[0], 1);\nassert.equal(out[n - 1], n);",
      },
    ],
  },
  {
    id: "ex-car-pooling",
    chapter: "dsa-prefix-sums",
    level: "intermediate",
    title: "Car Pooling",
    brief: "<p>A car drives in one direction along numbered stops and has <code>capacity</code> seats. Each trip is <code>[passengers, from, to]</code>: that many passengers get in at stop <code>from</code> and get out at stop <code>to</code>.</p><p>Return <code>true</code> if the car can carry every trip without ever holding more than <code>capacity</code> passengers.</p><ul><li>Passengers leaving at a stop get out <b>before</b> new passengers get in at the same stop, so trips <code>[2, 1, 5]</code> and <code>[3, 5, 7]</code> never overlap</li><li>Stops are integers from <code>0</code> up to <code>1000</code></li><li>Aim for O(trips + stops), not O(trips × stops)</li></ul>",
    starter: "function carPooling(trips, capacity) {\n  // TODO: track how the passenger count changes at each stop\n}\n",
    hints: [
      "The load only changes at stops. At a stop where a trip starts it rises by that trip's passengers, and where it ends it falls by the same amount.",
      "Build an array of changes per stop: change[from] += passengers and change[to] -= passengers. This is a difference array.",
      "Sweep the stops in order keeping a running load. If the load ever exceeds capacity return false. A trip that ends at stop s is already subtracted when you read stop s, which is exactly the rule.",
    ],
    solution: "function carPooling(trips, capacity) {\n  let lastStop = 0;\n  for (const trip of trips) lastStop = Math.max(lastStop, trip[2]);\n  const change = new Array(lastStop + 1).fill(0);\n  for (const [passengers, from, to] of trips) {\n    change[from] += passengers;\n    change[to] -= passengers;\n  }\n  let onBoard = 0;\n  for (const delta of change) {\n    onBoard += delta;\n    if (onBoard > capacity) return false;\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "too many passengers at once",
        body: "assert.equal(carPooling([[2, 1, 5], [3, 3, 7]], 4), false);",
      },
      {
        name: "fits exactly",
        body: "assert.equal(carPooling([[2, 1, 5], [3, 3, 7]], 5), true);",
      },
      {
        name: "drop off before pick up at the same stop",
        body: "assert.equal(carPooling([[2, 1, 5], [3, 5, 7]], 3), true);",
      },
      {
        name: "no trips always fits",
        body: "assert.equal(carPooling([], 1), true);",
      },
      {
        name: "one trip larger than the car",
        body: "assert.equal(carPooling([[5, 0, 3]], 4), false);",
      },
      {
        name: "nested trips add up",
        body: "assert.equal(carPooling([[1, 0, 10], [2, 2, 8], [3, 4, 6]], 6), true);\nassert.equal(carPooling([[1, 0, 10], [2, 2, 8], [3, 4, 6]], 5), false);",
      },
      {
        name: "trips at the far end of the road",
        body: "assert.equal(carPooling([[4, 997, 1000], [4, 998, 1000]], 8), true);\nassert.equal(carPooling([[4, 997, 1000], [4, 998, 1000]], 7), false);",
      },
      {
        name: "back to back trips reuse the seats",
        body: "assert.equal(carPooling([[3, 0, 2], [3, 2, 4], [3, 4, 6]], 3), true);",
      },
    ],
  },
  {
    id: "ex-subarray-sums-divisible-by-k",
    chapter: "dsa-prefix-sums",
    level: "intermediate",
    title: "Subarray Sums Divisible by K",
    brief: "<p>Given an integer array <code>nums</code> and a positive integer <code>k</code>, return the number of non-empty contiguous subarrays whose sum is divisible by <code>k</code>.</p><ul><li>Values may be negative, and a sum of <code>0</code> is divisible by every <code>k</code></li><li>Different index ranges count separately even when their values are equal</li><li>JavaScript's <code>%</code> returns a negative result for a negative left operand (<code>-7 % 5 === -2</code>): handle it</li><li>Target <b>O(n + k)</b> time</li></ul>",
    starter: "function subarraysDivByK(nums, k) {\n  // TODO: count pairs of prefix sums that leave the same remainder\n}\n",
    hints: [
      "A subarray sum is prefix[r + 1] - prefix[l]. It is divisible by k exactly when the two prefix sums leave the same remainder when divided by k.",
      "Keep a count of how many earlier prefixes had each remainder. Each new prefix adds that count to the answer, then joins the tally. Start the tally with remainder 0 seen once, for the empty prefix.",
      "Normalise the remainder with ((x % k) + k) % k so that -2 and 3 are recognised as the same class when k is 5.",
    ],
    solution: "function subarraysDivByK(nums, k) {\n  const seen = new Array(k).fill(0);\n  seen[0] = 1;\n  let remainder = 0;\n  let count = 0;\n  for (const x of nums) {\n    remainder = (((remainder + x) % k) + k) % k;\n    count += seen[remainder];\n    seen[remainder]++;\n  }\n  return count;\n}\n",
    tests: [
      {
        name: "mixed values with negatives",
        body: "assert.equal(subarraysDivByK([4, 5, 0, -2, -3, 1], 5), 7);",
      },
      {
        name: "a single element equal to k",
        body: "assert.equal(subarraysDivByK([5], 5), 1);",
      },
      {
        name: "a single element that does not divide",
        body: "assert.equal(subarraysDivByK([3], 5), 0);",
      },
      {
        name: "k of one makes every subarray count",
        body: "assert.equal(subarraysDivByK([1, 2, 3], 1), 6);",
      },
      {
        name: "all zeros",
        body: "assert.equal(subarraysDivByK([0, 0, 0], 4), 6);",
      },
      {
        name: "negative numbers only",
        body: "assert.equal(subarraysDivByK([-1, -2, -3], 3), 3);",
      },
      {
        name: "no subarray divides",
        body: "assert.equal(subarraysDivByK([1, 1, 1], 5), 0);",
      },
      {
        name: "an empty array has no subarray",
        body: "assert.equal(subarraysDivByK([], 3), 0);",
      },
    ],
  },
  {
    id: "ex-count-nice-subarrays",
    chapter: "dsa-prefix-sums",
    level: "intermediate",
    title: "Count Nice Subarrays",
    brief: "<p>Given an integer array <code>nums</code> and an integer <code>k</code>, a contiguous subarray is <b>nice</b> if it contains <b>exactly</b> <code>k</code> odd numbers. Return how many nice subarrays there are.</p><ul><li>Different index ranges count separately</li><li><code>k</code> may be <code>0</code>, which asks for subarrays with no odd number</li><li>Values may be negative; <code>-3</code> is odd, and <code>-3 % 2 === -1</code> in JavaScript, so <code>x % 2 === 1</code> is not a safe test</li><li>Target <b>O(n)</b> time</li></ul>",
    starter: "function numberOfSubarrays(nums, k) {\n  // TODO: turn each element into 1 (odd) or 0 (even), then count subarrays that sum to k\n}\n",
    hints: [
      "Replace every element by 1 if it is odd and 0 if it is even. The question becomes: how many subarrays of this 0/1 array sum to exactly k?",
      "That is Subarray Sum Equals K. Keep a running count of odd numbers and a Map from 'odds so far' to how many times it occurred, seeded with { 0: 1 }.",
      "For each element update the running count, add map.get(running - k) to the answer, and only then record the running count in the map.",
    ],
    solution: "function numberOfSubarrays(nums, k) {\n  const seen = new Map([[0, 1]]);\n  let odds = 0;\n  let count = 0;\n  for (const x of nums) {\n    if (x % 2 !== 0) odds++;\n    count += seen.get(odds - k) ?? 0;\n    seen.set(odds, (seen.get(odds) ?? 0) + 1);\n  }\n  return count;\n}\n",
    tests: [
      {
        name: "two subarrays with exactly three odds",
        body: "assert.equal(numberOfSubarrays([1, 1, 2, 1, 1], 3), 2);",
      },
      {
        name: "no odd numbers at all",
        body: "assert.equal(numberOfSubarrays([2, 4, 6], 1), 0);",
      },
      {
        name: "a longer mixed array",
        body: "assert.equal(numberOfSubarrays([2, 2, 2, 1, 2, 2, 1, 2, 2, 2], 2), 16);",
      },
      {
        name: "k of zero counts runs of evens",
        body: "assert.equal(numberOfSubarrays([2, 4, 1, 6], 0), 4);",
      },
      {
        name: "negative odd numbers are odd",
        body: "assert.equal(numberOfSubarrays([-3, 2, -5], 2), 1);",
      },
      {
        name: "a single odd number",
        body: "assert.equal(numberOfSubarrays([7], 1), 1);\nassert.equal(numberOfSubarrays([7], 2), 0);",
      },
      {
        name: "an empty array",
        body: "assert.equal(numberOfSubarrays([], 0), 0);",
      },
      {
        name: "all odd numbers",
        body: "assert.equal(numberOfSubarrays([1, 3, 5, 7], 2), 3);",
      },
    ],
  },
  {
    id: "ex-subarrays-with-xor-k",
    chapter: "dsa-prefix-sums",
    level: "intermediate",
    title: "Subarrays With XOR Equal to K",
    brief: "<p>Given an array <code>nums</code> of non-negative integers below <code>2^30</code> and an integer <code>k</code>, return the number of contiguous subarrays whose bitwise XOR equals <code>k</code>.</p><ul><li>Different index ranges count separately</li><li><code>k</code> may be <code>0</code></li><li>Target <b>O(n)</b> time using a running XOR and a hash map</li></ul>",
    starter: "function subarraysWithXor(nums, k) {\n  // TODO: XOR is its own inverse, so the prefix idea carries over from sums\n}\n",
    hints: [
      "If P[i] is the XOR of the first i elements, the XOR of nums[l..r] is P[r + 1] ^ P[l], because every element in the shared prefix cancels itself.",
      "P[r + 1] ^ P[l] === k exactly when P[l] === P[r + 1] ^ k. So for each new prefix, count the earlier prefixes equal to (prefix ^ k).",
      "Seed the Map with { 0: 1 } for the empty prefix, and add to the answer before recording the current prefix.",
    ],
    solution: "function subarraysWithXor(nums, k) {\n  const seen = new Map([[0, 1]]);\n  let prefix = 0;\n  let count = 0;\n  for (const x of nums) {\n    prefix ^= x;\n    count += seen.get(prefix ^ k) ?? 0;\n    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);\n  }\n  return count;\n}\n",
    tests: [
      {
        name: "mixed values",
        body: "assert.equal(subarraysWithXor([4, 2, 2, 6, 4], 6), 4);",
      },
      {
        name: "a classic small case",
        body: "assert.equal(subarraysWithXor([5, 6, 7, 8, 9], 5), 2);",
      },
      {
        name: "k of zero counts cancelling subarrays",
        body: "assert.equal(subarraysWithXor([3, 3, 3, 3], 0), 4);",
      },
      {
        name: "a single element equal to k",
        body: "assert.equal(subarraysWithXor([9], 9), 1);",
      },
      {
        name: "no subarray reaches k",
        body: "assert.equal(subarraysWithXor([1, 2, 4], 8), 0);",
      },
      {
        name: "an empty array",
        body: "assert.equal(subarraysWithXor([], 0), 0);",
      },
      {
        name: "zeros do not change the XOR",
        body: "assert.equal(subarraysWithXor([0, 5, 0], 5), 4);",
      },
      {
        name: "values near the top of the range",
        body: "assert.equal(subarraysWithXor([1073741823, 1073741823, 1], 1), 2);",
      },
    ],
  },
  {
    id: "ex-longest-well-performing-interval",
    chapter: "dsa-prefix-sums",
    level: "intermediate",
    title: "Longest Well-Performing Interval",
    brief: "<p><code>hours[i]</code> is the number of hours someone worked on day <code>i</code>. A day is <b>tiring</b> if they worked <b>strictly more than 8</b> hours. A contiguous interval of days is <b>well-performing</b> if it has <b>strictly more</b> tiring days than non-tiring days.</p><p>Return the length of the longest well-performing interval, or <code>0</code> if there is none.</p><ul><li>Score each day <code>+1</code> if tiring and <code>-1</code> otherwise, then look for the longest subarray with a <b>positive</b> sum</li><li>A positive sum is not an exact target, so the plain \"look up <code>prefix - k</code>\" lookup needs a small twist</li><li>Target <b>O(n)</b> time</li></ul>",
    starter: "function longestWPI(hours) {\n  // TODO: longest interval with more tiring days than non-tiring days\n}\n",
    hints: [
      "Map each day to +1 (hours > 8) or -1. You want the longest subarray whose sum is greater than 0, that is, at least 1.",
      "Track the prefix score. If the prefix after day i is positive, the whole prefix [0..i] qualifies. Otherwise you need an earlier prefix with a smaller value.",
      "The score changes by exactly 1 per day, so every value below the current one has already been seen before any lower value. Record the first index of each prefix value and look up exactly (score - 1).",
    ],
    solution: "function longestWPI(hours) {\n  const firstSeen = new Map();\n  let score = 0;\n  let best = 0;\n  for (let i = 0; i < hours.length; i++) {\n    score += hours[i] > 8 ? 1 : -1;\n    if (score > 0) {\n      best = i + 1;\n    } else {\n      if (!firstSeen.has(score)) firstSeen.set(score, i);\n      if (firstSeen.has(score - 1)) best = Math.max(best, i - firstSeen.get(score - 1));\n    }\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "the tiring days win by one",
        body: "assert.equal(longestWPI([9, 9, 6, 0, 6, 6, 9]), 3);",
      },
      {
        name: "no tiring day",
        body: "assert.equal(longestWPI([6, 6, 6]), 0);",
      },
      {
        name: "all days tiring",
        body: "assert.equal(longestWPI([9, 10, 12]), 3);",
      },
      {
        name: "exactly 8 hours is not tiring",
        body: "assert.equal(longestWPI([8, 8, 9]), 1);",
      },
      {
        name: "a tie is not well-performing",
        body: "assert.equal(longestWPI([9, 6]), 1);",
      },
      {
        name: "the best interval is in the middle",
        body: "assert.equal(longestWPI([6, 9, 9, 6, 9, 6, 6]), 5);",
      },
      {
        name: "an empty list",
        body: "assert.equal(longestWPI([]), 0);",
      },
      {
        name: "alternating days",
        body: "assert.equal(longestWPI([9, 6, 9, 6, 9]), 5);",
      },
    ],
  },
  {
    id: "ex-make-sum-divisible-by-p",
    chapter: "dsa-prefix-sums",
    level: "intermediate",
    title: "Make Sum Divisible by P",
    brief: "<p>Given an array of positive integers <code>nums</code> and a positive integer <code>p</code>, remove the <b>shortest</b> contiguous subarray (possibly empty) so that the sum of the remaining elements is divisible by <code>p</code>. You may <b>not</b> remove the whole array.</p><p>Return the length of that shortest subarray, or <code>-1</code> if it is impossible.</p><ul><li>If the total is already divisible by <code>p</code>, the answer is <code>0</code></li><li>Work with remainders only: the sums can be large</li><li>Target <b>O(n)</b> time</li></ul>",
    starter: "function minSubarray(nums, p) {\n  // TODO: find the shortest subarray whose sum has the same remainder as the total\n}\n",
    hints: [
      "Let need = total % p. If need is 0 the answer is 0. Otherwise you must remove a subarray whose sum leaves remainder need.",
      "A subarray ending at i with sum remainder need starts after an earlier prefix whose remainder is (prefix - need) mod p. Keep a Map from remainder to the LAST index where it occurred, since a later start means a shorter subarray.",
      "Seed the map with remainder 0 at index -1. If the best length equals nums.length you would remove everything, which is not allowed, so return -1.",
    ],
    solution: "function minSubarray(nums, p) {\n  let total = 0;\n  for (const x of nums) total += x;\n  const need = total % p;\n  if (need === 0) return 0;\n  const lastIndex = new Map([[0, -1]]);\n  let remainder = 0;\n  let best = nums.length;\n  for (let i = 0; i < nums.length; i++) {\n    remainder = (remainder + nums[i]) % p;\n    const wanted = (remainder - need + p) % p;\n    if (lastIndex.has(wanted)) best = Math.min(best, i - lastIndex.get(wanted));\n    lastIndex.set(remainder, i);\n  }\n  return best === nums.length ? -1 : best;\n}\n",
    tests: [
      {
        name: "remove one element",
        body: "assert.equal(minSubarray([3, 1, 4, 2], 6), 1);",
      },
      {
        name: "remove two elements",
        body: "assert.equal(minSubarray([6, 3, 5, 2], 9), 2);",
      },
      {
        name: "already divisible",
        body: "assert.equal(minSubarray([1, 2, 3], 3), 0);",
      },
      {
        name: "the only fix would remove everything",
        body: "assert.equal(minSubarray([1, 2, 3], 7), -1);",
      },
      {
        name: "a single element array",
        body: "assert.equal(minSubarray([5], 5), 0);\nassert.equal(minSubarray([5], 3), -1);",
      },
      {
        name: "p of one is always satisfied",
        body: "assert.equal(minSubarray([4, 4, 4], 1), 0);",
      },
      {
        name: "remove from the end",
        body: "assert.equal(minSubarray([2, 2, 2, 1], 3), 1);",
      },
      {
        name: "large values stay exact",
        body: "assert.equal(minSubarray([1000000000, 1000000000, 1000000000, 1000000000, 2], 7), 2);",
      },
    ],
  },
  {
    id: "ex-region-sums-2d",
    chapter: "dsa-prefix-sums",
    level: "intermediate",
    title: "Region Sums in a Grid",
    brief: "<p>Given a 2D <code>matrix</code> of integers and a list of <code>queries</code>, each <code>[row1, col1, row2, col2]</code>, return an array whose i-th entry is the sum of all cells in the rectangle with top-left corner <code>(row1, col1)</code> and bottom-right corner <code>(row2, col2)</code>, both corners <b>inclusive</b>.</p><ul><li>Values may be negative</li><li>The matrix may have a single row or a single column</li><li>An empty <code>queries</code> list returns an empty array</li><li>Build once in O(rows × cols) and answer each query in <b>O(1)</b></li></ul>",
    starter: "function regionSums(matrix, queries) {\n  // TODO: build a 2D prefix table once, then four lookups per query\n}\n",
    hints: [
      "Let P[r][c] be the sum of every cell above and to the left of (r, c), exclusive. Give P an extra leading row and column of zeros.",
      "Build it with inclusion-exclusion: P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c]. The overlap is counted twice by the two neighbours, so subtract it once.",
      "A query is P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]. Do not build the rows with new Array(n).fill(new Array(m).fill(0)): every row would be the same array.",
    ],
    solution: "function regionSums(matrix, queries) {\n  const rows = matrix.length;\n  const cols = rows === 0 ? 0 : matrix[0].length;\n  const prefix = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      prefix[r + 1][c + 1] = matrix[r][c] + prefix[r][c + 1] + prefix[r + 1][c] - prefix[r][c];\n    }\n  }\n  return queries.map(([r1, c1, r2, c2]) =>\n    prefix[r2 + 1][c2 + 1] - prefix[r1][c2 + 1] - prefix[r2 + 1][c1] + prefix[r1][c1]\n  );\n}\n",
    tests: [
      {
        name: "inner rectangles of a small grid",
        body: "assert.deepEqual(regionSums([[3, 0, 1], [5, 6, 3], [1, 2, 0]], [[1, 1, 2, 2], [0, 1, 1, 2]]), [11, 10]);",
      },
      {
        name: "the whole grid",
        body: "assert.deepEqual(regionSums([[3, 0, 1], [5, 6, 3], [1, 2, 0]], [[0, 0, 2, 2]]), [21]);",
      },
      {
        name: "a single cell",
        body: "assert.deepEqual(regionSums([[3, 0, 1], [5, 6, 3]], [[1, 1, 1, 1], [0, 0, 0, 0]]), [6, 3]);",
      },
      {
        name: "a single row",
        body: "assert.deepEqual(regionSums([[1, 2, 3, 4]], [[0, 1, 0, 3], [0, 0, 0, 0]]), [9, 1]);",
      },
      {
        name: "a single column",
        body: "assert.deepEqual(regionSums([[1], [2], [3]], [[0, 0, 2, 0], [1, 0, 2, 0]]), [6, 5]);",
      },
      {
        name: "negative values",
        body: "assert.deepEqual(regionSums([[-1, -2], [-3, 4]], [[0, 0, 1, 1], [0, 0, 0, 1]]), [-2, -3]);",
      },
      {
        name: "no queries",
        body: "assert.deepEqual(regionSums([[1, 2], [3, 4]], []), []);",
      },
      {
        name: "a large grid of ones",
        body: "const matrix = Array.from({ length: 150 }, () => new Array(150).fill(1));\nconst queries = Array.from({ length: 4000 }, (_, i) => [i % 50, i % 40, 100 + (i % 50), 100 + (i % 40)]);\nconst out = regionSums(matrix, queries);\nassert.equal(out.length, 4000);\nassert.equal(out.every((v) => v === 10201 || v === 101 * 101 + 0), true);",
      },
    ],
  },
  {
    id: "ex-matrix-block-sum",
    chapter: "dsa-prefix-sums",
    level: "intermediate",
    title: "Matrix Block Sum",
    brief: "<p>Given an <code>m x n</code> matrix <code>mat</code> and an integer <code>k</code>, return a matrix <code>answer</code> of the same size where <code>answer[i][j]</code> is the sum of every <code>mat[r][c]</code> with <code>i - k &lt;= r &lt;= i + k</code> and <code>j - k &lt;= c &lt;= j + k</code>, counting only cells that exist.</p><ul><li>Near an edge the block is cut off by the matrix, not wrapped around</li><li><code>k = 0</code> returns a copy of the matrix</li><li><code>k</code> may be larger than the matrix, in which case every answer is the total</li><li>Target <b>O(m × n)</b>, independent of <code>k</code></li></ul>",
    starter: "function matrixBlockSum(mat, k) {\n  // TODO: clamp each block to the matrix and read it from a 2D prefix table\n}\n",
    hints: [
      "Summing each block cell by cell costs O(k^2) per answer. A 2D prefix table gives any rectangle sum in O(1).",
      "Build P with an extra row and column of zeros, so P[r + 1][c + 1] holds the sum of the rectangle from (0, 0) to (r, c).",
      "For cell (i, j) clamp the corners: top = max(0, i - k), left = max(0, j - k), bottom = min(m - 1, i + k), right = min(n - 1, j + k). Then use the four-term rectangle formula.",
    ],
    solution: "function matrixBlockSum(mat, k) {\n  const rows = mat.length;\n  const cols = mat[0].length;\n  const prefix = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      prefix[r + 1][c + 1] = mat[r][c] + prefix[r][c + 1] + prefix[r + 1][c] - prefix[r][c];\n    }\n  }\n  return mat.map((row, i) =>\n    row.map((_, j) => {\n      const top = Math.max(0, i - k);\n      const left = Math.max(0, j - k);\n      const bottom = Math.min(rows - 1, i + k);\n      const right = Math.min(cols - 1, j + k);\n      return prefix[bottom + 1][right + 1] - prefix[top][right + 1] - prefix[bottom + 1][left] + prefix[top][left];\n    })\n  );\n}\n",
    tests: [
      {
        name: "a 3 by 3 grid with k of 1",
        body: "assert.deepEqual(matrixBlockSum([[1, 2, 3], [4, 5, 6], [7, 8, 9]], 1), [[12, 21, 16], [27, 45, 33], [24, 39, 28]]);",
      },
      {
        name: "k of 2 covers the whole 3 by 3 grid",
        body: "assert.deepEqual(matrixBlockSum([[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2), [[45, 45, 45], [45, 45, 45], [45, 45, 45]]);",
      },
      {
        name: "k of zero is a copy",
        body: "assert.deepEqual(matrixBlockSum([[1, 2], [3, 4]], 0), [[1, 2], [3, 4]]);",
      },
      {
        name: "a single cell",
        body: "assert.deepEqual(matrixBlockSum([[7]], 3), [[7]]);",
      },
      {
        name: "a single row",
        body: "assert.deepEqual(matrixBlockSum([[1, 2, 3, 4]], 1), [[3, 6, 9, 7]]);",
      },
      {
        name: "a single column",
        body: "assert.deepEqual(matrixBlockSum([[1], [2], [3]], 1), [[3], [6], [5]]);",
      },
      {
        name: "negative values",
        body: "assert.deepEqual(matrixBlockSum([[-1, 2], [3, -4]], 1), [[0, 0], [0, 0]]);",
      },
      {
        name: "a large k stays fast",
        body: "const mat = Array.from({ length: 200 }, () => new Array(200).fill(1));\nconst out = matrixBlockSum(mat, 1000000);\nassert.equal(out[0][0], 40000);\nassert.equal(out[199][199], 40000);",
      },
    ],
  },
  {
    id: "ex-submatrices-sum-target",
    chapter: "dsa-prefix-sums",
    level: "intermediate",
    title: "Number of Submatrices That Sum to Target",
    brief: "<p>Given a 2D <code>matrix</code> of integers and an integer <code>target</code>, return the number of non-empty rectangular submatrices whose cells sum to <code>target</code>.</p><ul><li>Two submatrices are different if any of their four corners differ</li><li>Values may be negative or zero</li><li>Checking every rectangle with a 2D prefix table is O((rows × cols)^2). Do better: <b>O(rows^2 × cols)</b></li></ul>",
    starter: "function numSubmatrixSumTarget(matrix, target) {\n  // TODO: fix a top and a bottom row, squash the columns, then count subarrays summing to target\n}\n",
    hints: [
      "Fix two rows, top and bottom. Every rectangle between those rows is a contiguous run of columns, and its sum is the sum of the column totals over that run.",
      "For a fixed pair of rows the column totals form a 1D array, and you want the number of subarrays that sum to target. That is Subarray Sum Equals K with a prefix sum and a Map.",
      "Loop top over all rows, then bottom from top downwards, adding row bottom into a running columnTotals array. Run the 1D count once per (top, bottom) pair.",
    ],
    solution: "function numSubmatrixSumTarget(matrix, target) {\n  const rows = matrix.length;\n  const cols = matrix[0].length;\n  let count = 0;\n  for (let top = 0; top < rows; top++) {\n    const columnTotals = new Array(cols).fill(0);\n    for (let bottom = top; bottom < rows; bottom++) {\n      for (let c = 0; c < cols; c++) columnTotals[c] += matrix[bottom][c];\n      const seen = new Map([[0, 1]]);\n      let prefix = 0;\n      for (const total of columnTotals) {\n        prefix += total;\n        count += seen.get(prefix - target) ?? 0;\n        seen.set(prefix, (seen.get(prefix) ?? 0) + 1);\n      }\n    }\n  }\n  return count;\n}\n",
    tests: [
      {
        name: "a grid with a zero cross",
        body: "assert.equal(numSubmatrixSumTarget([[0, 1, 0], [1, 1, 1], [0, 1, 0]], 0), 4);",
      },
      {
        name: "overlapping rectangles",
        body: "assert.equal(numSubmatrixSumTarget([[1, -1], [-1, 1]], 0), 5);",
      },
      {
        name: "a single cell that matches",
        body: "assert.equal(numSubmatrixSumTarget([[904]], 904), 1);",
      },
      {
        name: "a single cell that does not match",
        body: "assert.equal(numSubmatrixSumTarget([[3]], 4), 0);",
      },
      {
        name: "a single row behaves like the 1D problem",
        body: "assert.equal(numSubmatrixSumTarget([[1, 1, 1, 1]], 2), 3);",
      },
      {
        name: "a single column behaves like the 1D problem",
        body: "assert.equal(numSubmatrixSumTarget([[1], [1], [1], [1]], 2), 3);",
      },
      {
        name: "all zeros and target zero",
        body: "assert.equal(numSubmatrixSumTarget([[0, 0], [0, 0]], 0), 9);",
      },
      {
        name: "negative values and a negative target",
        body: "assert.equal(numSubmatrixSumTarget([[-1, -1], [-1, -1]], -2), 4);",
      },
    ],
  },
];
