import type { Exercise } from "../types";

export const dsaAddArraysStrings: Exercise[] = [
{
  "id": "ex-first-missing-positive",
  "chapter": "dsa-arrays-strings",
  "level": "intermediate",
  "title": "First Missing Positive",
  "brief": "<p>Given an unsorted integer array <code>nums</code>, return the smallest <b>positive</b> integer that does not appear in it.</p><ul><li>The array can contain negatives, zeros, duplicates and huge values</li><li>For <code>[1, 2, 0]</code> the answer is <code>3</code>; for <code>[3, 4, -1, 1]</code> it is <code>2</code>; for <code>[7, 8, 9, 11, 12]</code> it is <code>1</code></li><li>An empty array has the answer <code>1</code></li><li>Target: O(n) time and O(1) extra space. You may rearrange or overwrite <code>nums</code></li></ul>",
  "starter": "function firstMissingPositive(nums) {\n  // TODO: put each value in range 1..n into its home slot, then scan\n}\n",
  "hints": [
    "With n numbers, the answer is always between 1 and n + 1. Anything below 1 or above n can be ignored.",
    "Value v belongs at index v - 1. Swap nums[i] into its home while it is in range and the home does not already hold that same value (the check that stops duplicates from looping forever).",
    "After the placement pass, the first index i with nums[i] !== i + 1 gives the answer i + 1. If every slot is correct, the answer is n + 1. Compute the home index before swapping: a destructuring swap that reads nums[nums[i] - 1] after assigning nums[i] loses a value."
  ],
  "solution": "function firstMissingPositive(nums) {\n  const n = nums.length;\n  for (let i = 0; i < n; i++) {\n    while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {\n      const home = nums[i] - 1;\n      [nums[i], nums[home]] = [nums[home], nums[i]];\n    }\n  }\n  for (let i = 0; i < n; i++) {\n    if (nums[i] !== i + 1) return i + 1;\n  }\n  return n + 1;\n}\n",
  "tests": [
    {
      "name": "the three standard examples",
      "body": "assert.equal(firstMissingPositive([1, 2, 0]), 3);\nassert.equal(firstMissingPositive([3, 4, -1, 1]), 2);\nassert.equal(firstMissingPositive([7, 8, 9, 11, 12]), 1);"
    },
    {
      "name": "empty and single-element arrays",
      "body": "assert.equal(firstMissingPositive([]), 1);\nassert.equal(firstMissingPositive([1]), 2);\nassert.equal(firstMissingPositive([2]), 1);\nassert.equal(firstMissingPositive([-5]), 1);"
    },
    {
      "name": "duplicates must not loop forever",
      "body": "assert.equal(firstMissingPositive([1, 1]), 2);\nassert.equal(firstMissingPositive([2, 2]), 1);\nassert.equal(firstMissingPositive([1, 2, 2, 1, 3]), 4);"
    },
    {
      "name": "a complete run 1..n gives n + 1, in any order",
      "body": "assert.equal(firstMissingPositive([4, 3, 2, 1]), 5);\nassert.equal(firstMissingPositive([2, 1]), 3);\nassert.equal(firstMissingPositive([3, 1, 2]), 4);"
    },
    {
      "name": "huge and negative values are ignored",
      "body": "assert.equal(firstMissingPositive([2147483647, 1]), 2);\nassert.equal(firstMissingPositive([-2147483648, 0, 1, 2]), 3);"
    },
    {
      "name": "agrees with a Set-based brute force on random arrays",
      "body": "let seed = 12345;\nconst rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };\nfor (let t = 0; t < 400; t++) {\n  const len = rand(10);\n  const a = Array.from({ length: len }, () => rand(14) - 3);\n  const set = new Set(a);\n  let want = 1;\n  while (set.has(want)) want++;\n  assert.equal(firstMissingPositive(a.slice()), want, JSON.stringify(a));\n}"
    },
    {
      "name": "a large shuffled run stays fast",
      "body": "const n = 200000;\nconst a = Array.from({ length: n }, (_, i) => i + 1);\nfor (let i = n - 1; i > 0; i--) {\n  const j = (i * 7919) % (i + 1);\n  [a[i], a[j]] = [a[j], a[i]];\n}\nassert.equal(firstMissingPositive(a.slice()), n + 1);\nconst removed = a[n >> 1];\na[n >> 1] = -1;\nassert.equal(firstMissingPositive(a.slice()), removed);"
    }
  ]
},
{
  "id": "ex-find-all-duplicates",
  "chapter": "dsa-arrays-strings",
  "level": "intermediate",
  "title": "Find All Duplicates in an Array",
  "brief": "<p>You are given an array <code>nums</code> of length <code>n</code> in which every value is between <code>1</code> and <code>n</code> inclusive, and every value appears <b>once or twice</b>. Return an array of all the values that appear twice, in any order.</p><ul><li>For <code>[4, 3, 2, 7, 8, 2, 3, 1]</code> return <code>[2, 3]</code> (any order)</li><li>Return <code>[]</code> when nothing repeats</li><li>Target: O(n) time and no extra array besides the answer; you may modify <code>nums</code> while you work</li></ul>",
  "starter": "function findDuplicates(nums) {\n  // TODO: use the array itself as the 'seen' table\n}\n",
  "hints": [
    "Because values are 1..n, the value v can be recorded at index v - 1. The array can play the role of a Set.",
    "Record 'seen' by making nums[v - 1] negative. When you arrive at a slot that is already negative, v has been seen before.",
    "Always read the value with Math.abs(), because an earlier visit may have turned that slot negative already."
  ],
  "solution": "function findDuplicates(nums) {\n  const dupes = [];\n  for (const x of nums) {\n    const idx = Math.abs(x) - 1;\n    if (nums[idx] < 0) dupes.push(Math.abs(x));\n    else nums[idx] = -nums[idx];\n  }\n  return dupes;\n}\n",
  "tests": [
    {
      "name": "the standard example",
      "body": "const sorted = (xs) => xs.slice().sort((p, q) => p - q);\nassert.deepEqual(sorted(findDuplicates([4, 3, 2, 7, 8, 2, 3, 1])), [2, 3]);"
    },
    {
      "name": "no duplicates",
      "body": "assert.deepEqual(findDuplicates([1, 2, 3, 4]), []);\nassert.deepEqual(findDuplicates([2, 1]), []);"
    },
    {
      "name": "single element",
      "body": "assert.deepEqual(findDuplicates([1]), []);"
    },
    {
      "name": "one duplicate pair",
      "body": "assert.deepEqual(findDuplicates([1, 1]), [1]);\nassert.deepEqual(findDuplicates([1, 1, 2]), [1]);"
    },
    {
      "name": "the same value can be the last one",
      "body": "const sorted = (xs) => xs.slice().sort((p, q) => p - q);\nassert.deepEqual(sorted(findDuplicates([2, 1, 2, 3, 1])), [1, 2]);"
    },
    {
      "name": "agrees with a counting brute force on random valid arrays",
      "body": "const sorted = (xs) => xs.slice().sort((p, q) => p - q);\nlet seed = 99;\nconst rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };\nfor (let t = 0; t < 400; t++) {\n  const n = 2 + rand(9);\n  const pool = [];\n  for (let v = 1; v <= n; v++) pool.push(v);\n  const a = pool.slice();\n  const extra = rand(n);\n  const doubled = new Set();\n  for (let k = 0; k < extra; k++) {\n    const v = 1 + rand(n);\n    if (!doubled.has(v)) { doubled.add(v); a.push(v); }\n  }\n  while (a.length > n) a.splice(rand(a.length), 1);\n  const counts = {};\n  a.forEach((x) => { counts[x] = (counts[x] || 0) + 1; });\n  if (Object.values(counts).some((c) => c > 2)) continue;\n  const want = Object.keys(counts).filter((k) => counts[k] === 2).map(Number);\n  assert.deepEqual(sorted(findDuplicates(a.slice())), sorted(want), JSON.stringify(a));\n}"
    },
    {
      "name": "a large array finishes quickly",
      "body": "const sorted = (xs) => xs.slice().sort((p, q) => p - q);\nconst n = 100000;\nconst a = Array.from({ length: n }, (_, i) => i + 1);\nfor (let i = 0; i < n; i += 2) a[i + 1] = a[i];\nconst want = [];\nfor (let i = 0; i < n; i += 2) want.push(a[i]);\nassert.deepEqual(sorted(findDuplicates(a.slice())), sorted(want));"
    }
  ]
},
{
  "id": "ex-majority-element-ii",
  "chapter": "dsa-arrays-strings",
  "level": "intermediate",
  "title": "Majority Element II",
  "brief": "<p>Given an integer array <code>nums</code>, return every value that appears <b>more than</b> <code>floor(n / 3)</code> times, in any order. (The array can have at most two such values.)</p><ul><li><code>[3, 2, 3]</code> returns <code>[3]</code></li><li><code>[1, 2]</code> returns <code>[1, 2]</code> because each appears once, which is more than floor(2 / 3) = 0</li><li><code>[1, 2, 3]</code> returns <code>[]</code>, because floor(3 / 3) = 1 and no value appears more than once</li><li>Return <code>[]</code> for an empty array</li><li>Target: O(n) time and O(1) extra space, so a counting Map is not the intended answer</li></ul>",
  "starter": "function majorityElementII(nums) {\n  // TODO: Boyer-Moore voting with two candidates, then verify both\n}\n",
  "hints": [
    "More than n/3 means at most two values can qualify. Keep two candidates and two counters.",
    "A value that matches a candidate bumps that counter. Otherwise, if a counter is 0, adopt the value there. If neither fits, decrement both counters (three distinct values cancel).",
    "The voting pass only proposes candidates. Run a second pass that counts each candidate exactly, and keep it only when its count is greater than floor(n / 3)."
  ],
  "solution": "function majorityElementII(nums) {\n  let a = null;\n  let b = null;\n  let countA = 0;\n  let countB = 0;\n  for (const x of nums) {\n    if (x === a) countA++;\n    else if (x === b) countB++;\n    else if (countA === 0) { a = x; countA = 1; }\n    else if (countB === 0) { b = x; countB = 1; }\n    else { countA--; countB--; }\n  }\n  countA = 0;\n  countB = 0;\n  for (const x of nums) {\n    if (x === a) countA++;\n    else if (x === b) countB++;\n  }\n  const limit = Math.floor(nums.length / 3);\n  const out = [];\n  if (countA > limit) out.push(a);\n  if (countB > limit) out.push(b);\n  return out;\n}\n",
  "tests": [
    {
      "name": "single clear winner",
      "body": "const sorted = (xs) => xs.slice().sort((p, q) => p - q);\nassert.deepEqual(sorted(majorityElementII([3, 2, 3])), [3]);"
    },
    {
      "name": "two winners",
      "body": "const sorted = (xs) => xs.slice().sort((p, q) => p - q);\nassert.deepEqual(sorted(majorityElementII([1, 1, 1, 3, 3, 2, 2, 2])), [1, 2]);"
    },
    {
      "name": "tiny arrays",
      "body": "const sorted = (xs) => xs.slice().sort((p, q) => p - q);\nassert.deepEqual(majorityElementII([]), []);\nassert.deepEqual(majorityElementII([5]), [5]);\nassert.deepEqual(sorted(majorityElementII([1, 2])), [1, 2]);"
    },
    {
      "name": "nobody qualifies",
      "body": "assert.deepEqual(majorityElementII([1, 2, 3]), []);\nassert.deepEqual(majorityElementII([1, 2, 3, 4, 5, 6]), []);"
    },
    {
      "name": "a candidate that is not real must be dropped",
      "body": "assert.deepEqual(majorityElementII([1, 2, 3, 4]), []);\nassert.deepEqual(majorityElementII([2, 1, 3, 4, 5, 6, 7]), []);"
    },
    {
      "name": "equal values everywhere",
      "body": "assert.deepEqual(majorityElementII([7, 7, 7, 7]), [7]);"
    },
    {
      "name": "agrees with a counting brute force on random arrays",
      "body": "const sorted = (xs) => xs.slice().sort((p, q) => p - q);\nlet seed = 7;\nconst rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };\nfor (let t = 0; t < 500; t++) {\n  const a = Array.from({ length: rand(14) }, () => rand(5) - 1);\n  const counts = new Map();\n  a.forEach((x) => counts.set(x, (counts.get(x) || 0) + 1));\n  const want = [...counts].filter(([, c]) => c > Math.floor(a.length / 3)).map(([k]) => k);\n  assert.deepEqual(sorted(majorityElementII(a)), sorted(want), JSON.stringify(a));\n}"
    },
    {
      "name": "a large array stays linear",
      "body": "const a = [];\nfor (let i = 0; i < 150000; i++) {\n  const r = i % 20;\n  a.push(r < 8 ? 1 : r < 15 ? 2 : 1000000 + i);\n}\nassert.deepEqual(majorityElementII(a).slice().sort((p, q) => p - q), [1, 2]);"
    }
  ]
},
{
  "id": "ex-max-subarray-circular",
  "chapter": "dsa-arrays-strings",
  "level": "intermediate",
  "title": "Maximum Sum Circular Subarray",
  "brief": "<p>The array <code>nums</code> is <b>circular</b>: after the last element comes the first. Return the largest sum of a non-empty subarray, where the subarray may wrap around the end (but may not use the same element twice).</p><ul><li><code>[1, -2, 3, -2]</code> returns <code>3</code></li><li><code>[5, -3, 5]</code> returns <code>10</code> (the last 5 followed by the first 5)</li><li><code>[-3, -2, -3]</code> returns <code>-2</code>: the subarray must be non-empty</li><li>Target: O(n) time, O(1) extra space</li></ul>",
  "starter": "function maxSubarraySumCircular(nums) {\n  // TODO: Kadane for the maximum, Kadane for the minimum, and the total\n}\n",
  "hints": [
    "A wrapping subarray is the whole array minus an ordinary subarray in the middle. To make the wrap big, remove the smallest ordinary subarray.",
    "Run Kadane twice in one pass: once tracking the largest run and once tracking the smallest run, and also keep the total sum.",
    "The answer is max(largest run, total - smallest run), except when every element is negative: then total - smallest run would be an empty subarray, so return the largest run on its own."
  ],
  "solution": "function maxSubarraySumCircular(nums) {\n  let total = 0;\n  let curMax = 0;\n  let bestMax = -Infinity;\n  let curMin = 0;\n  let bestMin = Infinity;\n  for (const x of nums) {\n    total += x;\n    curMax = Math.max(x, curMax + x);\n    bestMax = Math.max(bestMax, curMax);\n    curMin = Math.min(x, curMin + x);\n    bestMin = Math.min(bestMin, curMin);\n  }\n  return bestMax > 0 ? Math.max(bestMax, total - bestMin) : bestMax;\n}\n",
  "tests": [
    {
      "name": "the standard examples",
      "body": "assert.equal(maxSubarraySumCircular([1, -2, 3, -2]), 3);\nassert.equal(maxSubarraySumCircular([5, -3, 5]), 10);"
    },
    {
      "name": "all negative returns the largest single element",
      "body": "assert.equal(maxSubarraySumCircular([-3, -2, -3]), -2);\nassert.equal(maxSubarraySumCircular([-2]), -2);"
    },
    {
      "name": "the wrap wins by dropping a negative middle",
      "body": "assert.equal(maxSubarraySumCircular([3, -1, 2, -1]), 4);\nassert.equal(maxSubarraySumCircular([3, -2, 2, -3]), 3);"
    },
    {
      "name": "zeros and a whole-array answer",
      "body": "assert.equal(maxSubarraySumCircular([0, 0, 0]), 0);\nassert.equal(maxSubarraySumCircular([1, 2, 3]), 6);\nassert.equal(maxSubarraySumCircular([-1, 0]), 0);"
    },
    {
      "name": "the whole array is the minimum run, with a positive in it",
      "body": "assert.equal(maxSubarraySumCircular([-5, 3, -5]), 3);"
    },
    {
      "name": "agrees with an O(n^2) brute force on random arrays",
      "body": "let seed = 2024;\nconst rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };\nconst brute = (a) => {\n  const n = a.length;\n  let best = -Infinity;\n  for (let i = 0; i < n; i++) {\n    let s = 0;\n    for (let len = 1; len <= n; len++) {\n      s += a[(i + len - 1) % n];\n      if (s > best) best = s;\n    }\n  }\n  return best;\n};\nfor (let t = 0; t < 500; t++) {\n  const a = Array.from({ length: 1 + rand(9) }, () => rand(13) - 6);\n  assert.equal(maxSubarraySumCircular(a), brute(a), JSON.stringify(a));\n}"
    },
    {
      "name": "a large array is solved in linear time",
      "body": "const a = Array.from({ length: 300000 }, (_, i) => (i % 7 === 0 ? -9 : 4));\nconst got = maxSubarraySumCircular(a);\nassert.type(got, \"number\");\nassert.ok(got > 0);"
    }
  ]
},
{
  "id": "ex-max-subarray-with-range",
  "chapter": "dsa-arrays-strings",
  "level": "beginner",
  "title": "Maximum Subarray, With Its Position",
  "brief": "<p>Return the maximum subarray sum together with where the subarray is: <code>[sum, start, end]</code>, where <code>start</code> and <code>end</code> are inclusive indexes.</p><ul><li><code>[-2, 1, -3, 4, -1, 2, 1, -5, 4]</code> returns <code>[6, 3, 6]</code></li><li>If several subarrays share the maximum sum, return the one with the smallest <code>start</code>, and among those the smallest <code>end</code></li><li>The array is not empty. When all elements are negative, the answer is the single largest element and its index</li></ul>",
  "starter": "function maxSubarrayWithRange(nums) {\n  // TODO: Kadane, but remember where the current run started\n}\n",
  "hints": [
    "Plain Kadane keeps a running sum. Add a second variable for the index where the current run began.",
    "Restart the run (sum = nums[i], start = i) when the previous sum is negative; otherwise extend it.",
    "Copy start and end into the best answer only when the current sum is strictly greater than the best so far. The strict comparison keeps the earliest of equal answers."
  ],
  "solution": "function maxSubarrayWithRange(nums) {\n  let best = nums[0];\n  let bestStart = 0;\n  let bestEnd = 0;\n  let current = nums[0];\n  let start = 0;\n  for (let i = 1; i < nums.length; i++) {\n    if (current < 0) {\n      current = nums[i];\n      start = i;\n    } else {\n      current += nums[i];\n    }\n    if (current > best) {\n      best = current;\n      bestStart = start;\n      bestEnd = i;\n    }\n  }\n  return [best, bestStart, bestEnd];\n}\n",
  "tests": [
    {
      "name": "the standard example",
      "body": "assert.deepEqual(maxSubarrayWithRange([-2, 1, -3, 4, -1, 2, 1, -5, 4]), [6, 3, 6]);"
    },
    {
      "name": "single element",
      "body": "assert.deepEqual(maxSubarrayWithRange([5]), [5, 0, 0]);\nassert.deepEqual(maxSubarrayWithRange([-5]), [-5, 0, 0]);"
    },
    {
      "name": "all negative picks the largest element",
      "body": "assert.deepEqual(maxSubarrayWithRange([-3, -1, -2]), [-1, 1, 1]);"
    },
    {
      "name": "the whole array",
      "body": "assert.deepEqual(maxSubarrayWithRange([1, 2, 3]), [6, 0, 2]);"
    },
    {
      "name": "ties keep the earliest start and end",
      "body": "assert.deepEqual(maxSubarrayWithRange([2, -2, 2]), [2, 0, 0]);\nassert.deepEqual(maxSubarrayWithRange([0, 0]), [0, 0, 0]);\nassert.deepEqual(maxSubarrayWithRange([3, -3, 3]), [3, 0, 0]);"
    },
    {
      "name": "a run that starts after a bad prefix",
      "body": "assert.deepEqual(maxSubarrayWithRange([-4, -1, 5, 1]), [6, 2, 3]);"
    },
    {
      "name": "agrees with a brute force, including ties, on random arrays",
      "body": "let seed = 31;\nconst rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };\nconst brute = (a) => {\n  let best = [-Infinity, 0, 0];\n  for (let i = 0; i < a.length; i++) {\n    let s = 0;\n    for (let j = i; j < a.length; j++) {\n      s += a[j];\n      if (s > best[0]) best = [s, i, j];\n    }\n  }\n  return best;\n};\nfor (let t = 0; t < 500; t++) {\n  const a = Array.from({ length: 1 + rand(10) }, () => rand(11) - 5);\n  assert.deepEqual(maxSubarrayWithRange(a), brute(a), JSON.stringify(a));\n}"
    }
  ]
},
{
  "id": "ex-reverse-string-code-points",
  "chapter": "dsa-arrays-strings",
  "level": "beginner",
  "title": "Reverse Text Without Breaking Emoji",
  "brief": "<p>Write <code>reverseText(s)</code> that reverses a string by <b>code point</b>, so characters that take two UTF-16 code units (most emoji, some rare letters) stay intact.</p><ul><li><code>reverseText(\"abc\")</code> returns <code>\"cba\"</code></li><li><code>reverseText(\"ab😀\")</code> returns <code>\"😀ba\"</code>. Splitting by <code>\"\"</code> and reversing would tear the emoji in half</li><li>The empty string returns the empty string</li><li>Do not try to handle emoji sequences made of several code points (like a family emoji); each code point is its own unit here</li></ul>",
  "starter": "function reverseText(s) {\n  // TODO: reverse by code point, not by UTF-16 unit\n}\n",
  "hints": [
    "s.split(\"\") and s[i] both walk UTF-16 code units, which is the problem: an emoji is two of them.",
    "Spread syntax and for...of iterate by code point. Collect the code points into an array, reverse it, and join.",
    "If you prefer a manual loop: when s.codePointAt(i) is above 0xFFFF the character is two units wide, so advance i by 2 instead of 1."
  ],
  "solution": "function reverseText(s) {\n  return [...s].reverse().join(\"\");\n}\n",
  "tests": [
    {
      "name": "ordinary text",
      "body": "assert.equal(reverseText(\"abc\"), \"cba\");\nassert.equal(reverseText(\"hello world\"), \"dlrow olleh\");"
    },
    {
      "name": "empty and single character",
      "body": "assert.equal(reverseText(\"\"), \"\");\nassert.equal(reverseText(\"x\"), \"x\");"
    },
    {
      "name": "an emoji at the end moves to the front intact",
      "body": "assert.equal(reverseText(\"ab😀\"), \"😀ba\");"
    },
    {
      "name": "emoji in the middle",
      "body": "assert.equal(reverseText(\"a😀b\"), \"b😀a\");\nassert.equal(reverseText(\"a😀b🎉c\"), \"c🎉b😀a\");"
    },
    {
      "name": "the result is well formed: length is preserved",
      "body": "const s = \"x😀y😀z\";\nassert.equal(reverseText(s).length, s.length);\nassert.equal(reverseText(reverseText(s)), s);"
    },
    {
      "name": "a two-unit mathematical letter",
      "body": "assert.equal(reverseText(\"𝒳y\"), \"y𝒳\");"
    },
    {
      "name": "accented letters written as one code point",
      "body": "assert.equal(reverseText(\"café\"), \"éfac\");"
    }
  ]
},
{
  "id": "ex-find-the-difference",
  "chapter": "dsa-arrays-strings",
  "level": "beginner",
  "title": "Find the Difference",
  "brief": "<p>String <code>t</code> is made by shuffling the letters of string <code>s</code> and adding <b>one extra lowercase letter</b> at a random position. Return that extra letter.</p><ul><li><code>findTheDifference(\"abcd\", \"abcde\")</code> returns <code>\"e\"</code></li><li><code>findTheDifference(\"\", \"y\")</code> returns <code>\"y\"</code></li><li><code>findTheDifference(\"aab\", \"abaa\")</code> returns <code>\"a\"</code>: the extra letter can be one that <code>s</code> already has</li><li>Both strings use only lowercase English letters</li><li>Target: O(n) time and O(1) space, using a 26-slot table or the character codes</li></ul>",
  "starter": "function findTheDifference(s, t) {\n  // TODO: count letters of s, subtract letters of t\n}\n",
  "hints": [
    "Because only lowercase letters appear, a letter maps to an index with charCodeAt(i) - 97, and a 26-slot array can count them.",
    "Add one for every letter of t, subtract one for every letter of s. The slot that ends at 1 is the extra letter.",
    "A neat alternative with no table: add up the character codes of t and subtract the codes of s. What is left is the code of the extra letter."
  ],
  "solution": "function findTheDifference(s, t) {\n  const counts = new Array(26).fill(0);\n  for (let i = 0; i < t.length; i++) counts[t.charCodeAt(i) - 97]++;\n  for (let i = 0; i < s.length; i++) counts[s.charCodeAt(i) - 97]--;\n  const slot = counts.indexOf(1);\n  return String.fromCharCode(97 + slot);\n}\n",
  "tests": [
    {
      "name": "the extra letter is at the end",
      "body": "assert.equal(findTheDifference(\"abcd\", \"abcde\"), \"e\");"
    },
    {
      "name": "empty s",
      "body": "assert.equal(findTheDifference(\"\", \"y\"), \"y\");"
    },
    {
      "name": "the extra letter repeats one s already has",
      "body": "assert.equal(findTheDifference(\"aab\", \"abaa\"), \"a\");\nassert.equal(findTheDifference(\"a\", \"aa\"), \"a\");"
    },
    {
      "name": "the extra letter is at the front or the middle",
      "body": "assert.equal(findTheDifference(\"bcd\", \"zbcd\"), \"z\");\nassert.equal(findTheDifference(\"abcd\", \"abzcd\"), \"z\");"
    },
    {
      "name": "shuffled letters",
      "body": "assert.equal(findTheDifference(\"listen\", \"silentx\"), \"x\");\nassert.equal(findTheDifference(\"zzzy\", \"yzxzz\"), \"x\");"
    },
    {
      "name": "agrees with a sort-and-compare brute force on random input",
      "body": "let seed = 5;\nconst rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };\nconst letter = () => String.fromCharCode(97 + rand(4));\nfor (let k = 0; k < 300; k++) {\n  const s = Array.from({ length: rand(8) }, letter);\n  const extra = letter();\n  const t = s.slice();\n  t.splice(rand(t.length + 1), 0, extra);\n  for (let i = t.length - 1; i > 0; i--) {\n    const j = rand(i + 1);\n    [t[i], t[j]] = [t[j], t[i]];\n  }\n  assert.equal(findTheDifference(s.join(\"\"), t.join(\"\")), extra);\n}"
    },
    {
      "name": "a long pair of strings",
      "body": "const s = \"abcdefghij\".repeat(30000);\nconst t = s + \"q\";\nassert.equal(findTheDifference(s, t), \"q\");"
    }
  ]
}
];
