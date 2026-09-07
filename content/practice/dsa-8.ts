import type { Exercise } from "../types";

export const dsa8: Exercise[] = [
{
    id: "ex-two-sum-sorted",
    chapter: "dsa-two-pointers",
    level: "beginner",
    title: "Two Sum II — Input Array Is Sorted",
    brief:
      "<p>You are given <code>numbers</code>, an array of integers sorted in <b>non-decreasing</b> order, and a <code>target</code>. Find the two numbers that add up to the target and return their positions as a two-element array.</p><ul><li>The returned positions are <b>1-indexed</b>: the first element is at position <code>1</code>, not <code>0</code></li><li>Return them in increasing order, so <code>[smaller, larger]</code></li><li>You may not use the same element twice</li><li>If no such pair exists, return an empty array</li><li>Aim for O(1) extra space — no hash map</li></ul>",
    starter:
      "function twoSumSorted(numbers, target) {\n  // TODO: walk one pointer in from each end of the sorted array\n}\n",
    hints: [
      "The array is sorted — that is the whole gift. What does the sum of the first and last element tell you?",
      "If the current sum is too small, the only way to grow it is to move the LEFT pointer right. If it is too big, move the RIGHT pointer left.",
      "Each step throws away exactly one candidate and never has to look at it again, so the loop is O(n) with two variables of state.",
    ],
    solution:
      "function twoSumSorted(numbers, target) {\n  let lo = 0;\n  let hi = numbers.length - 1;\n  while (lo < hi) {\n    const sum = numbers[lo] + numbers[hi];\n    if (sum === target) return [lo + 1, hi + 1];\n    if (sum < target) lo++;\n    else hi--;\n  }\n  return [];\n}\n",
    tests: [
      {
        name: "finds the pair and returns 1-indexed positions",
        body: "assert.deepEqual(twoSumSorted([2, 7, 11, 15], 9), [1, 2]);",
      },
      {
        name: "pair spans the whole array",
        body: "assert.deepEqual(twoSumSorted([2, 3, 4], 6), [1, 3]);",
      },
      {
        name: "handles duplicate values in the middle",
        body: "assert.deepEqual(twoSumSorted([1, 2, 3, 4, 4, 9, 56, 90], 8), [4, 5]);",
      },
      {
        name: "handles negatives",
        body: "assert.deepEqual(twoSumSorted([-5, -3, -1], -8), [1, 2]);\nassert.deepEqual(twoSumSorted([-1, 0], -1), [1, 2]);",
      },
      {
        name: "returns [] when there is no pair",
        body: "assert.deepEqual(twoSumSorted([1, 2, 3], 100), []);\nassert.deepEqual(twoSumSorted([], 0), []);\nassert.deepEqual(twoSumSorted([5], 5), []);",
      },
    ],
  },
{
    id: "ex-three-sum",
    chapter: "dsa-two-pointers",
    level: "intermediate",
    title: "3Sum",
    brief:
      "<p>Given an integer array <code>nums</code>, return every <b>unique</b> triplet <code>[a, b, c]</code> of elements that sums to zero.</p><ul><li>The three values must come from three <em>different</em> positions in the array</li><li>Two triplets are the same if they contain the same multiset of values, so <code>[-1, 0, 1]</code> and <code>[0, 1, -1]</code> count as one answer — report it once</li><li>The order of the triplets, and the order of values inside a triplet, does not matter</li><li>Return <code>[]</code> when there is no such triplet</li><li>Target complexity: O(n^2)</li></ul>",
    starter: "function threeSum(nums) {\n  // TODO: sort, then fix one number and two-pointer the rest\n}\n",
    hints: [
      "Sorting first costs O(n log n) but buys you two things: the two-pointer sweep from problem 1, and an easy way to spot duplicates (they sit next to each other).",
      "Fix nums[i], then you need two numbers summing to -nums[i] in the sorted suffix — that is exactly the sorted two-sum scan.",
      "Skip a value for i whenever nums[i] === nums[i - 1], and after recording a hit, advance both pointers past their duplicate runs.",
    ],
    solution:
      "function threeSum(nums) {\n  const a = nums.slice().sort((x, y) => x - y);\n  const out = [];\n  for (let i = 0; i < a.length - 2; i++) {\n    if (a[i] > 0) break;\n    if (i > 0 && a[i] === a[i - 1]) continue;\n    let lo = i + 1;\n    let hi = a.length - 1;\n    while (lo < hi) {\n      const sum = a[i] + a[lo] + a[hi];\n      if (sum < 0) lo++;\n      else if (sum > 0) hi--;\n      else {\n        out.push([a[i], a[lo], a[hi]]);\n        while (lo < hi && a[lo] === a[lo + 1]) lo++;\n        while (lo < hi && a[hi] === a[hi - 1]) hi--;\n        lo++;\n        hi--;\n      }\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "finds both triplets in the classic case",
        body: "const norm = (rows) => rows.map((t) => t.slice().sort((p, q) => p - q))\n  .sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]);\nassert.deepEqual(norm(threeSum([-1, 0, 1, 2, -1, -4])), norm([[-1, -1, 2], [-1, 0, 1]]));",
      },
      {
        name: "no triplet sums to zero",
        body: "assert.deepEqual(threeSum([1, 2, 3]), []);\nassert.deepEqual(threeSum([0, 1, 1]), []);",
      },
      {
        name: "all zeros yields exactly one triplet",
        body: "assert.deepEqual(threeSum([0, 0, 0]), [[0, 0, 0]]);\nassert.deepEqual(threeSum([0, 0, 0, 0]), [[0, 0, 0]]);",
      },
      {
        name: "tiny and empty inputs",
        body: "assert.deepEqual(threeSum([]), []);\nassert.deepEqual(threeSum([0]), []);\nassert.deepEqual(threeSum([-1, 1]), []);",
      },
      {
        name: "heavy duplicates do not produce repeats",
        body: "const norm = (rows) => rows.map((t) => t.slice().sort((p, q) => p - q))\n  .sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]);\nconst got = threeSum([-2, 0, 1, 1, 2, -2, 2, 0, -1]);\nassert.deepEqual(norm(got), norm([[-2, 0, 2], [-2, 1, 1], [-1, 0, 1]]));\nconst withZeros = threeSum([0, 0, 0, 1, -1, 0]);\nassert.deepEqual(norm(withZeros), norm([[-1, 0, 1], [0, 0, 0]]));",
      },
    ],
  },
{
    id: "ex-four-sum",
    chapter: "dsa-two-pointers",
    level: "advanced",
    title: "4Sum",
    brief:
      "<p>Given an integer array <code>nums</code> and an integer <code>target</code>, return every <b>unique</b> quadruplet <code>[a, b, c, d]</code> drawn from four distinct positions whose sum equals <code>target</code>.</p><ul><li>Two quadruplets are the same if they hold the same multiset of values — report each only once</li><li>The order of the quadruplets, and the order inside each one, does not matter</li><li>Return <code>[]</code> when none exist</li><li>Target complexity: O(n^3). Beware of the four-nested-loop trap</li></ul>",
    starter:
      "function fourSum(nums, target) {\n  // TODO: sort, fix two numbers, then two-pointer the remaining window\n}\n",
    hints: [
      "This is 3Sum with one more layer wrapped around it: sort, fix i, fix j, and two-pointer whatever is left.",
      "De-duplication happens at every level. Skip i when nums[i] === nums[i - 1], skip j when nums[j] === nums[j - 1] and j > i + 1, and skip duplicate lo/hi values after a hit.",
      "Sums can exceed 32-bit range in the original problem — in JS just make sure you compare the full sum, and you can prune early when the four smallest remaining values already overshoot the target.",
    ],
    solution:
      "function fourSum(nums, target) {\n  const a = nums.slice().sort((x, y) => x - y);\n  const n = a.length;\n  const out = [];\n  for (let i = 0; i < n - 3; i++) {\n    if (i > 0 && a[i] === a[i - 1]) continue;\n    if (a[i] + a[i + 1] + a[i + 2] + a[i + 3] > target) break;\n    if (a[i] + a[n - 3] + a[n - 2] + a[n - 1] < target) continue;\n    for (let j = i + 1; j < n - 2; j++) {\n      if (j > i + 1 && a[j] === a[j - 1]) continue;\n      let lo = j + 1;\n      let hi = n - 1;\n      while (lo < hi) {\n        const sum = a[i] + a[j] + a[lo] + a[hi];\n        if (sum < target) lo++;\n        else if (sum > target) hi--;\n        else {\n          out.push([a[i], a[j], a[lo], a[hi]]);\n          while (lo < hi && a[lo] === a[lo + 1]) lo++;\n          while (lo < hi && a[hi] === a[hi - 1]) hi--;\n          lo++;\n          hi--;\n        }\n      }\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "finds all three quadruplets",
        body: "const norm = (rows) => rows.map((t) => t.slice().sort((p, q) => p - q))\n  .sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2] || x[3] - y[3]);\nconst got = fourSum([1, 0, -1, 0, -2, 2], 0);\nassert.deepEqual(norm(got), norm([[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]));",
      },
      {
        name: "repeated values collapse to one quadruplet",
        body: "assert.deepEqual(fourSum([2, 2, 2, 2, 2], 8), [[2, 2, 2, 2]]);\nassert.deepEqual(fourSum([0, 0, 0, 0], 0), [[0, 0, 0, 0]]);",
      },
      {
        name: "non-zero target with negatives",
        body: "const norm = (rows) => rows.map((t) => t.slice().sort((p, q) => p - q))\n  .sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2] || x[3] - y[3]);\nassert.deepEqual(norm(fourSum([-3, -1, 0, 2, 4, 5], 2)), norm([[-3, -1, 2, 4]]));\nassert.deepEqual(norm(fourSum([-3, -1, 0, 2, 4, 5], 1)), norm([[-3, -1, 0, 5]]));\nconst many = fourSum([-3, -2, -1, 0, 0, 1, 2, 3], 0);\nassert.deepEqual(norm(many), norm([\n  [-3, -2, 2, 3], [-3, -1, 1, 3], [-3, 0, 0, 3], [-3, 0, 1, 2],\n  [-2, -1, 0, 3], [-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1],\n]));",
      },
      {
        name: "fewer than four elements, or no match",
        body: "assert.deepEqual(fourSum([], 0), []);\nassert.deepEqual(fourSum([1, 2, 3], 6), []);\nassert.deepEqual(fourSum([1, 2, 3, 4], 100), []);",
      },
      {
        name: "large-magnitude values still add up",
        body: "const norm = (rows) => rows.map((t) => t.slice().sort((p, q) => p - q))\n  .sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2] || x[3] - y[3]);\nconst got = fourSum([1000000000, 1000000000, 1000000000, 1000000000], 4000000000);\nassert.deepEqual(norm(got), norm([[1000000000, 1000000000, 1000000000, 1000000000]]));",
      },
    ],
  },
{
    id: "ex-longest-repeating-char-replacement",
    chapter: "dsa-sliding-window",
    level: "advanced",
    title: "Longest Repeating Character Replacement",
    brief:
      '<p>You are given a string <code>s</code> of uppercase letters and an integer <code>k</code>. You may pick at most <code>k</code> positions and change each to any letter you like. Return the length of the longest substring that can be made of a single repeated character afterwards.</p><ul><li>You do not have to use all <code>k</code> changes</li><li><code>s</code> may be empty, in which case the answer is <code>0</code></li><li>Aim for a single O(n) pass — no re-scanning the window</li></ul><p>Example: with <code>s = "AABABBA"</code> and <code>k = 1</code> the answer is <code>4</code> (change one character to turn <code>"ABBA"</code> into <code>"BBBB"</code>).</p>',
    starter:
      "function characterReplacement(s, k) {\n  // TODO: slide a window and track how many characters inside it are not the majority\n}\n",
    hints: [
      "A window is valid when (window length) - (count of the most frequent character in it) <= k, because everything else has to be rewritten.",
      "Keep a frequency map for the window. When the window becomes invalid, shrink from the left until it is valid again.",
      "You do not need an exact running maximum frequency — an over-estimate that never decreases still yields the correct final answer, because the window only ever grows past a record when a real record is beaten.",
    ],
    solution:
      "function characterReplacement(s, k) {\n  const count = new Map();\n  let left = 0;\n  let maxCount = 0;\n  let best = 0;\n  for (let right = 0; right < s.length; right++) {\n    const c = s[right];\n    count.set(c, (count.get(c) || 0) + 1);\n    if (count.get(c) > maxCount) maxCount = count.get(c);\n    while (right - left + 1 - maxCount > k) {\n      const gone = s[left];\n      count.set(gone, count.get(gone) - 1);\n      left++;\n    }\n    if (right - left + 1 > best) best = right - left + 1;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic examples",
        body: "assert.equal(characterReplacement('ABAB', 2), 4);\nassert.equal(characterReplacement('AABABBA', 1), 4);",
      },
      {
        name: "k = 0 means find the longest run as-is",
        body: "assert.equal(characterReplacement('AAAA', 0), 4);\nassert.equal(characterReplacement('ABAABBB', 0), 3);\nassert.equal(characterReplacement('ABCDE', 0), 1);",
      },
      {
        name: "k is bigger than the string",
        body: "assert.equal(characterReplacement('ABCDE', 10), 5);\nassert.equal(characterReplacement('AB', 2), 2);",
      },
      {
        name: "empty and single-character strings",
        body: "assert.equal(characterReplacement('', 3), 0);\nassert.equal(characterReplacement('A', 0), 1);\nassert.equal(characterReplacement('A', 5), 1);",
      },
      {
        name: "the best window is not at the start",
        body: "assert.equal(characterReplacement('ABCDEFFFFFG', 1), 6);\nassert.equal(characterReplacement('ABCDE', 1), 2);",
      },
    ],
  },
{
    id: "ex-permutation-in-string",
    chapter: "dsa-sliding-window",
    level: "intermediate",
    title: "Permutation in String",
    brief:
      "<p>Given two strings <code>s1</code> and <code>s2</code>, return <code>true</code> if <code>s2</code> contains some permutation of <code>s1</code> as a contiguous substring, and <code>false</code> otherwise.</p><ul><li>In other words: is there a window of <code>s2</code> with exactly the same letter counts as <code>s1</code>?</li><li>An empty <code>s1</code> is contained in anything, so return <code>true</code></li><li>If <code>s1</code> is longer than <code>s2</code> the answer is <code>false</code></li><li>Return an actual boolean, not a number</li></ul>",
    starter:
      "function checkInclusion(s1, s2) {\n  // TODO: slide a fixed-width window over s2 and compare letter counts\n}\n",
    hints: [
      "Every candidate window has exactly the same length as s1, so this is a fixed-size window — one character enters and one leaves on each step.",
      "Rebuilding and comparing the whole frequency map at every position is O(n * 26). Instead keep a running 'how many letters currently have the right count' counter and update it as characters enter and leave.",
      "When a count goes from matching to not-matching, decrement the matches counter; when it goes from not-matching to matching, increment it. The window is a hit when matches equals the number of distinct letters in s1.",
    ],
    solution:
      "function checkInclusion(s1, s2) {\n  const n = s1.length;\n  const m = s2.length;\n  if (n === 0) return true;\n  if (n > m) return false;\n  const need = new Map();\n  for (let i = 0; i < n; i++) need.set(s1[i], (need.get(s1[i]) || 0) + 1);\n  const distinct = need.size;\n  const win = new Map();\n  let matches = 0;\n  for (let i = 0; i < m; i++) {\n    const c = s2[i];\n    if (need.has(c)) {\n      const next = (win.get(c) || 0) + 1;\n      win.set(c, next);\n      if (next === need.get(c)) matches++;\n      else if (next === need.get(c) + 1) matches--;\n    }\n    if (i >= n) {\n      const gone = s2[i - n];\n      if (need.has(gone)) {\n        const cur = win.get(gone);\n        if (cur === need.get(gone)) matches--;\n        else if (cur === need.get(gone) + 1) matches++;\n        win.set(gone, cur - 1);\n      }\n    }\n    if (i >= n - 1 && matches === distinct) return true;\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "detects a permutation and rejects a scramble",
        body: "assert.equal(checkInclusion('ab', 'eidbaooo'), true);\nassert.equal(checkInclusion('ab', 'eidboaoo'), false);",
      },
      {
        name: "the window can start anywhere, including the very end",
        body: "assert.equal(checkInclusion('adc', 'dcda'), true);\nassert.equal(checkInclusion('abc', 'xxxcba'), true);\nassert.equal(checkInclusion('abc', 'cbaxxx'), true);",
      },
      {
        name: "counts must match exactly, not just the letter set",
        body: "assert.equal(checkInclusion('aab', 'abab'), true);\nassert.equal(checkInclusion('aab', 'abba'), false);\nassert.equal(checkInclusion('aa', 'aba'), false);",
      },
      {
        name: "degenerate sizes",
        body: "assert.equal(checkInclusion('abc', 'ab'), false);\nassert.equal(checkInclusion('', 'abc'), true);\nassert.equal(checkInclusion('a', ''), false);\nassert.equal(checkInclusion('a', 'a'), true);",
      },
      {
        name: "returns a boolean",
        body: "assert.type(checkInclusion('ab', 'eidbaooo'), 'boolean');\nassert.type(checkInclusion('zz', 'abc'), 'boolean');",
      },
    ],
  },
{
    id: "ex-min-size-subarray-sum",
    chapter: "dsa-sliding-window",
    level: "intermediate",
    title: "Minimum Size Subarray Sum",
    brief:
      "<p>Given an array <code>nums</code> of <b>positive</b> integers and a positive integer <code>target</code>, return the length of the shortest contiguous subarray whose sum is <code>&gt;= target</code>.</p><ul><li>If no such subarray exists, return <code>0</code></li><li>The subarray must be contiguous — you cannot cherry-pick elements</li><li>All values are positive, which is what makes a single sliding window work</li><li>Target complexity: O(n)</li></ul><p>Example: <code>target = 7</code>, <code>nums = [2,3,1,2,4,3]</code> gives <code>2</code>, from the subarray <code>[4,3]</code>.</p>",
    starter:
      "function minSubArrayLen(target, nums) {\n  // TODO: grow a window on the right, then shrink it from the left while it still qualifies\n}\n",
    hints: [
      "Because every value is positive, extending the window can only increase the sum and shrinking it can only decrease it — the sum is monotonic, so one pass suffices.",
      "Add nums[right] to a running sum. While that sum is >= target, record the window length and then remove nums[left] and advance left.",
      "Track the best length in a variable seeded with Infinity, and convert Infinity back to 0 at the end.",
    ],
    solution:
      "function minSubArrayLen(target, nums) {\n  let left = 0;\n  let sum = 0;\n  let best = Infinity;\n  for (let right = 0; right < nums.length; right++) {\n    sum += nums[right];\n    while (sum >= target) {\n      if (right - left + 1 < best) best = right - left + 1;\n      sum -= nums[left];\n      left++;\n    }\n  }\n  return best === Infinity ? 0 : best;\n}\n",
    tests: [
      {
        name: "shortest window in the middle of the array",
        body: "assert.equal(minSubArrayLen(7, [2, 3, 1, 2, 4, 3]), 2);\nassert.equal(minSubArrayLen(11, [1, 2, 3, 4, 5]), 3);",
      },
      {
        name: "a single element already reaches the target",
        body: "assert.equal(minSubArrayLen(4, [1, 4, 4]), 1);\nassert.equal(minSubArrayLen(5, [5]), 1);\nassert.equal(minSubArrayLen(3, [10, 1, 1]), 1);",
      },
      {
        name: "returns 0 when the target is unreachable",
        body: "assert.equal(minSubArrayLen(11, [1, 1, 1, 1, 1, 1, 1, 1]), 0);\nassert.equal(minSubArrayLen(1, []), 0);\nassert.equal(minSubArrayLen(100, [1, 2, 3]), 0);",
      },
      {
        name: "the whole array is the only answer",
        body: "assert.equal(minSubArrayLen(6, [1, 2, 3]), 3);\nassert.equal(minSubArrayLen(15, [1, 2, 3, 4, 5]), 5);",
      },
      {
        name: "sum must reach the target, equality counts",
        body: "assert.equal(minSubArrayLen(8, [2, 2, 2, 2]), 4);\nassert.equal(minSubArrayLen(9, [2, 2, 2, 2]), 0);",
      },
    ],
  },
{
    id: "ex-fruit-into-baskets",
    chapter: "dsa-sliding-window",
    level: "intermediate",
    title: "Fruit Into Baskets",
    brief:
      "<p>You walk along a row of trees given as <code>fruits</code>, where <code>fruits[i]</code> is the type of fruit on tree <code>i</code>. You carry two baskets and each basket can hold only one type of fruit (any amount of it). You pick exactly one fruit from every tree you pass, and you must stop when you reach a tree whose fruit fits in neither basket.</p><p>Return the maximum number of fruits you can collect — that is, the length of the longest contiguous subarray containing <b>at most 2 distinct</b> values.</p><ul><li>You may start at any tree</li><li>An empty row yields <code>0</code></li><li>Target complexity: O(n)</li></ul>",
    starter: "function totalFruit(fruits) {\n  // TODO: longest window that holds at most 2 distinct values\n}\n",
    hints: [
      "Forget the baskets — the question is literally 'longest subarray with at most two distinct values'.",
      "Keep a Map from value -> how many of it sit inside the current window. The number of distinct values is just the map's size.",
      "When the map grows to 3 keys, shrink from the left, decrementing counts and deleting a key the moment its count hits zero.",
    ],
    solution:
      "function totalFruit(fruits) {\n  const count = new Map();\n  let left = 0;\n  let best = 0;\n  for (let right = 0; right < fruits.length; right++) {\n    const f = fruits[right];\n    count.set(f, (count.get(f) || 0) + 1);\n    while (count.size > 2) {\n      const gone = fruits[left];\n      const next = count.get(gone) - 1;\n      if (next === 0) count.delete(gone);\n      else count.set(gone, next);\n      left++;\n    }\n    if (right - left + 1 > best) best = right - left + 1;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "picks the whole row when it has at most two types",
        body: "assert.equal(totalFruit([1, 2, 1]), 3);\nassert.equal(totalFruit([1, 1, 1, 1]), 4);",
      },
      {
        name: "stops at the third type",
        body: "assert.equal(totalFruit([0, 1, 2, 2]), 3);\nassert.equal(totalFruit([1, 2, 3, 2, 2]), 4);",
      },
      {
        name: "best window sits in the middle",
        body: "assert.equal(totalFruit([3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]), 5);\nassert.equal(totalFruit([0, 1, 6, 6, 4, 4, 6]), 5);",
      },
      {
        name: "empty and single-tree rows",
        body: "assert.equal(totalFruit([]), 0);\nassert.equal(totalFruit([7]), 1);\nassert.equal(totalFruit([7, 9]), 2);",
      },
      {
        name: "alternating types never break the window",
        body: "assert.equal(totalFruit([1, 2, 1, 2, 1, 2]), 6);\nassert.equal(totalFruit([1, 2, 3, 1, 2, 3]), 2);",
      },
    ],
  },
{
    id: "ex-subarray-product-less-than-k",
    chapter: "dsa-sliding-window",
    level: "advanced",
    title: "Subarray Product Less Than K",
    brief:
      "<p>Given an array <code>nums</code> of positive integers and an integer <code>k</code>, count how many contiguous subarrays have a product <b>strictly less than</b> <code>k</code>.</p><ul><li>Subarrays are counted by position, so <code>[1,1]</code> contributes three subarrays: <code>[1]</code>, <code>[1]</code>, and <code>[1,1]</code></li><li>Watch the edge case: when <code>k &lt;= 1</code> nothing qualifies, because every product of positive integers is at least <code>1</code>. The answer is <code>0</code></li><li>Target complexity: O(n)</li></ul><p>Example: <code>nums = [10,5,2,6]</code>, <code>k = 100</code> gives <code>8</code>.</p>",
    starter:
      "function numSubarrayProductLessThanK(nums, k) {\n  // TODO: slide a window, then count how many subarrays end at each right index\n}\n",
    hints: [
      "Handle k <= 1 up front and return 0 — otherwise the shrink loop will run off the end of the array trying to divide the product below an impossible bound.",
      "Maintain a window whose product is < k. Multiply in nums[right], then divide out nums[left] while the product is >= k.",
      "Once the window [left, right] is valid, every subarray ending at right and starting anywhere in that window is also valid — that is exactly right - left + 1 new subarrays.",
    ],
    solution:
      "function numSubarrayProductLessThanK(nums, k) {\n  if (k <= 1) return 0;\n  let prod = 1;\n  let left = 0;\n  let count = 0;\n  for (let right = 0; right < nums.length; right++) {\n    prod *= nums[right];\n    while (prod >= k) {\n      prod /= nums[left];\n      left++;\n    }\n    count += right - left + 1;\n  }\n  return count;\n}\n",
    tests: [
      {
        name: "counts the classic example",
        body: "assert.equal(numSubarrayProductLessThanK([10, 5, 2, 6], 100), 8);\nassert.equal(numSubarrayProductLessThanK([10, 9, 10, 4, 3, 8, 10], 19), 8);\nassert.equal(numSubarrayProductLessThanK([1, 2, 3, 4], 10), 7);\nassert.equal(numSubarrayProductLessThanK([2, 3, 4, 5, 6], 36), 10);",
      },
      {
        name: "k <= 1 always yields 0",
        body: "assert.equal(numSubarrayProductLessThanK([1, 2, 3], 0), 0);\nassert.equal(numSubarrayProductLessThanK([1, 1, 1], 1), 0);\nassert.equal(numSubarrayProductLessThanK([1, 2, 3], -5), 0);",
      },
      {
        name: "every subarray qualifies",
        body: "assert.equal(numSubarrayProductLessThanK([1, 1, 1], 2), 6);\nassert.equal(numSubarrayProductLessThanK([1, 2, 3], 1000), 6);",
      },
      {
        name: "empty array and single elements",
        body: "assert.equal(numSubarrayProductLessThanK([], 10), 0);\nassert.equal(numSubarrayProductLessThanK([5], 5), 0);\nassert.equal(numSubarrayProductLessThanK([5], 6), 1);",
      },
      {
        name: "a huge element resets the window",
        body: "assert.equal(numSubarrayProductLessThanK([1, 2, 100, 3], 50), 4);\nassert.equal(numSubarrayProductLessThanK([100, 100, 100], 10), 0);",
      },
    ],
  },
{
    id: "ex-max-consecutive-ones-iii",
    chapter: "dsa-sliding-window",
    level: "intermediate",
    title: "Max Consecutive Ones III",
    brief:
      "<p>Given a binary array <code>nums</code> (only <code>0</code>s and <code>1</code>s) and an integer <code>k</code>, return the length of the longest contiguous run of <code>1</code>s you can produce by flipping at most <code>k</code> zeros to ones.</p><ul><li>You do not have to use all <code>k</code> flips</li><li><code>k</code> may be <code>0</code>, in which case you are just finding the longest existing run of ones</li><li>An empty array yields <code>0</code></li><li>Target complexity: O(n) with O(1) extra space</li></ul>",
    starter: "function longestOnes(nums, k) {\n  // TODO: longest window containing at most k zeros\n}\n",
    hints: [
      "Restate it: what is the longest window that contains at most k zeros? The flips are a red herring once you see that.",
      "You do not need a frequency map — a single integer counting zeros inside the window is enough.",
      "When the zero count exceeds k, advance left, decrementing the counter each time you step over a zero. The answer is the largest window width you ever see.",
    ],
    solution:
      "function longestOnes(nums, k) {\n  let left = 0;\n  let zeros = 0;\n  let best = 0;\n  for (let right = 0; right < nums.length; right++) {\n    if (nums[right] === 0) zeros++;\n    while (zeros > k) {\n      if (nums[left] === 0) zeros--;\n      left++;\n    }\n    if (right - left + 1 > best) best = right - left + 1;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic examples",
        body: "assert.equal(longestOnes([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2), 6);\nassert.equal(longestOnes([0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3), 10);",
      },
      {
        name: "k = 0 finds the longest existing run",
        body: "assert.equal(longestOnes([1, 1, 1], 0), 3);\nassert.equal(longestOnes([1, 0, 1, 1, 0, 1], 0), 2);\nassert.equal(longestOnes([0, 0, 0], 0), 0);",
      },
      {
        name: "k covers every zero",
        body: "assert.equal(longestOnes([0, 0, 0], 3), 3);\nassert.equal(longestOnes([0, 0, 0], 10), 3);\nassert.equal(longestOnes([1, 0, 1, 0, 1], 2), 5);",
      },
      {
        name: "empty and single-element arrays",
        body: "assert.equal(longestOnes([], 2), 0);\nassert.equal(longestOnes([0], 0), 0);\nassert.equal(longestOnes([0], 1), 1);\nassert.equal(longestOnes([1], 0), 1);",
      },
      {
        name: "the best window ends at the last index",
        body: "assert.equal(longestOnes([0, 0, 1, 1, 1, 0, 1], 1), 5);\nassert.equal(longestOnes([1, 1, 0, 0, 1, 1, 1, 0, 1], 1), 5);",
      },
    ],
  },
{
    id: "ex-longest-subarray-abs-diff-limit",
    chapter: "dsa-sliding-window",
    level: "advanced",
    title: "Longest Continuous Subarray With Absolute Diff <= Limit",
    brief:
      "<p>Given an integer array <code>nums</code> and an integer <code>limit</code>, return the length of the longest contiguous subarray in which the absolute difference between <b>any two</b> elements is <code>&lt;= limit</code>.</p><ul><li>Checking every pair is unnecessary: the condition is equivalent to <code>max(window) - min(window) &lt;= limit</code></li><li>An empty array yields <code>0</code>; a single element always qualifies</li><li><b>Target complexity: O(n).</b> A sorted structure or repeated re-scanning of the window gives O(n log n) or O(n^2) — the intended answer keeps both the running max and the running min in amortised O(1) per step</li></ul>",
    starter:
      "function longestSubarray(nums, limit) {\n  // TODO: slide a window while keeping its max and min available in O(1)\n}\n",
    hints: [
      "The pairwise condition collapses: a window is valid exactly when max - min <= limit. So the real problem is maintaining the max and min of a sliding window.",
      "That needs TWO monotonic deques — one decreasing (its front is the window max) and one increasing (its front is the window min). Arrays of indices work fine.",
      "Before pushing index right, pop from the back of the max deque while its last value is <= nums[right], and from the back of the min deque while its last value is >= nums[right]. Then, while max - min > limit, advance left and drop any deque front whose index just fell out of the window.",
    ],
    solution:
      "function longestSubarray(nums, limit) {\n  const maxQ = [];\n  const minQ = [];\n  let left = 0;\n  let best = 0;\n  for (let right = 0; right < nums.length; right++) {\n    while (maxQ.length && nums[maxQ[maxQ.length - 1]] <= nums[right]) maxQ.pop();\n    maxQ.push(right);\n    while (minQ.length && nums[minQ[minQ.length - 1]] >= nums[right]) minQ.pop();\n    minQ.push(right);\n    while (nums[maxQ[0]] - nums[minQ[0]] > limit) {\n      if (maxQ[0] === left) maxQ.shift();\n      if (minQ[0] === left) minQ.shift();\n      left++;\n    }\n    if (right - left + 1 > best) best = right - left + 1;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic examples",
        body: "assert.equal(longestSubarray([8, 2, 4, 7], 4), 2);\nassert.equal(longestSubarray([10, 1, 2, 4, 7, 2], 5), 4);\nassert.equal(longestSubarray([4, 2, 2, 2, 4, 4, 2, 2], 0), 3);",
      },
      {
        name: "limit 0 means a run of identical values",
        body: "assert.equal(longestSubarray([1, 1, 1, 2, 2], 0), 3);\nassert.equal(longestSubarray([1, 2, 3], 0), 1);",
      },
      {
        name: "empty, single element, and a limit that covers everything",
        body: "assert.equal(longestSubarray([], 5), 0);\nassert.equal(longestSubarray([5], 0), 1);\nassert.equal(longestSubarray([1, 100, 3, 50], 1000), 4);",
      },
      {
        name: "negatives and a window that must shrink twice",
        body: "assert.equal(longestSubarray([-1, -3, -5, -2], 3), 3);\nassert.equal(longestSubarray([1, 5, 6, 7, 8, 10, 6, 5, 6], 4), 5);",
      },
      {
        name: "holds up on a 4000-element drifting series",
        body: "let x = 42;\nconst nums = [];\nlet v = 500;\nfor (let i = 0; i < 4000; i++) {\n  x = (x * 48271) % 2147483647;\n  v += (x % 7) - 3;\n  nums.push(v);\n}\nassert.equal(nums.length, 4000);\nassert.equal(longestSubarray(nums, 10), 73);\nassert.equal(longestSubarray(nums, 15), 170);\nassert.equal(longestSubarray(nums, 20), 219);",
      },
    ],
  },
{
    id: "ex-squares-of-sorted-array",
    chapter: "dsa-two-pointers",
    level: "beginner",
    title: "Squares of a Sorted Array",
    brief:
      "<p>Given an integer array <code>nums</code> sorted in non-decreasing order, return a <b>new</b> array containing the square of every number, also sorted in non-decreasing order.</p><ul><li>The input may contain negative numbers — that is the whole difficulty, since <code>(-4)^2</code> is larger than <code>3^2</code></li><li>Do not mutate the input array</li><li>Sorting the squares afterwards is O(n log n). Aim for <b>O(n)</b> using two pointers</li></ul><p>Example: <code>[-4,-1,0,3,10]</code> becomes <code>[0,1,9,16,100]</code>.</p>",
    starter:
      "function sortedSquares(nums) {\n  // TODO: two pointers at the ends, filling the result from the back\n}\n",
    hints: [
      "The largest square is always at one END of the array — either the most negative number or the most positive one. Never in the middle.",
      "So compare |nums[lo]| against |nums[hi]|, take the bigger square, and write it into the LAST unfilled slot of the output.",
      "Allocate the output up front with the same length and fill it right-to-left; that avoids reversing at the end.",
    ],
    solution:
      "function sortedSquares(nums) {\n  const n = nums.length;\n  const out = new Array(n);\n  let lo = 0;\n  let hi = n - 1;\n  for (let i = n - 1; i >= 0; i--) {\n    const a = nums[lo] * nums[lo];\n    const b = nums[hi] * nums[hi];\n    if (a > b) {\n      out[i] = a;\n      lo++;\n    } else {\n      out[i] = b;\n      hi--;\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "mixed negatives and positives",
        body: "assert.deepEqual(sortedSquares([-4, -1, 0, 3, 10]), [0, 1, 9, 16, 100]);\nassert.deepEqual(sortedSquares([-7, -3, 2, 3, 11]), [4, 9, 9, 49, 121]);",
      },
      {
        name: "all negative or all positive",
        body: "assert.deepEqual(sortedSquares([-3, -2, -1]), [1, 4, 9]);\nassert.deepEqual(sortedSquares([1, 2, 3]), [1, 4, 9]);",
      },
      {
        name: "empty and single element",
        body: "assert.deepEqual(sortedSquares([]), []);\nassert.deepEqual(sortedSquares([-5]), [25]);\nassert.deepEqual(sortedSquares([0]), [0]);",
      },
      {
        name: "duplicates and symmetric values",
        body: "assert.deepEqual(sortedSquares([-2, -2, 2, 2]), [4, 4, 4, 4]);\nassert.deepEqual(sortedSquares([-3, 0, 3]), [0, 9, 9]);",
      },
      {
        name: "does not mutate the input",
        body: "const input = [-4, -1, 0, 3, 10];\nconst out = sortedSquares(input);\nassert.deepEqual(input, [-4, -1, 0, 3, 10]);\nassert.notEqual(out, input);",
      },
    ],
  },
{
    id: "ex-backspace-string-compare",
    chapter: "dsa-two-pointers",
    level: "intermediate",
    title: "Backspace String Compare",
    brief:
      '<p>Two strings <code>s</code> and <code>t</code> are typed into an editor where <code>\'#\'</code> means backspace. Return <code>true</code> if they produce the same final text.</p><ul><li>A backspace on empty text does nothing — it does not error, and it does not carry over. For example <code>"a##c"</code> and <code>"#a#c"</code> both end up as <code>"c"</code></li><li>Two empty results are equal, so <code>"###"</code> and <code>""</code> match</li><li>Building both strings with a stack is O(n) time but O(n) space. Aim for <b>O(1) extra space</b> by walking both strings from the BACK</li><li>Return an actual boolean</li></ul>',
    starter:
      "function backspaceCompare(s, t) {\n  // TODO: walk both strings from the end, skipping deleted characters as you go\n}\n",
    hints: [
      "Read right-to-left: when you meet a '#', you know a character to its LEFT is doomed. Going forwards you cannot know that yet — that is why the direction matters.",
      "Keep a 'pending deletions' counter per string. On a '#', increment it; on a normal character, either consume a pending deletion or stop, because that character survives.",
      "Compare the two surviving characters, then step both pointers back. The strings differ if one runs out of surviving characters before the other.",
    ],
    solution:
      "function backspaceCompare(s, t) {\n  let i = s.length - 1;\n  let j = t.length - 1;\n  let skipS = 0;\n  let skipT = 0;\n  while (i >= 0 || j >= 0) {\n    while (i >= 0) {\n      if (s[i] === '#') { skipS++; i--; }\n      else if (skipS > 0) { skipS--; i--; }\n      else break;\n    }\n    while (j >= 0) {\n      if (t[j] === '#') { skipT++; j--; }\n      else if (skipT > 0) { skipT--; j--; }\n      else break;\n    }\n    if (i >= 0 && j >= 0) {\n      if (s[i] !== t[j]) return false;\n    } else if (i >= 0 || j >= 0) {\n      return false;\n    }\n    i--;\n    j--;\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "simple matches and mismatches",
        body: "assert.equal(backspaceCompare('ab#c', 'ad#c'), true);\nassert.equal(backspaceCompare('ab##', 'c#d#'), true);\nassert.equal(backspaceCompare('a#c', 'b'), false);",
      },
      {
        name: "backspaces run past the start of the string",
        body: "assert.equal(backspaceCompare('a##c', '#a#c'), true);\nassert.equal(backspaceCompare('####a', 'a'), true);\nassert.equal(backspaceCompare('#####', ''), true);",
      },
      {
        name: "empty results and empty inputs",
        body: "assert.equal(backspaceCompare('', ''), true);\nassert.equal(backspaceCompare('###', ''), true);\nassert.equal(backspaceCompare('a', ''), false);\nassert.equal(backspaceCompare('', 'a'), false);",
      },
      {
        name: "different lengths that reduce to the same text",
        body: "assert.equal(backspaceCompare('y#fo##f', 'y#f#o##f'), true);\nassert.equal(backspaceCompare('bxj##tw', 'bxo#j##tw'), true);\nassert.equal(backspaceCompare('bxj##tw', 'bxj###tw'), false);",
      },
      {
        name: "returns a boolean",
        body: "assert.type(backspaceCompare('ab#c', 'ad#c'), 'boolean');\nassert.type(backspaceCompare('x', 'y'), 'boolean');",
      },
    ],
  },
{
    id: "ex-merge-two-sorted-arrays",
    chapter: "dsa-two-pointers",
    level: "beginner",
    title: "Merge Two Sorted Arrays",
    brief:
      "<p>Given two arrays <code>a</code> and <code>b</code>, each already sorted in non-decreasing order, return a <b>new</b> array containing all their elements in non-decreasing order.</p><ul><li>Do not mutate <code>a</code> or <code>b</code></li><li>Duplicates are kept — if a value appears in both inputs it appears twice in the output</li><li>Either array may be empty</li><li>Concatenating and calling <code>.sort()</code> is O(n log n) and misses the point. Aim for O(n + m) with two pointers</li></ul>",
    starter: "function mergeSorted(a, b) {\n  // TODO: one pointer per array, always take the smaller head\n}\n",
    hints: [
      "The next smallest element overall is always at the front of one of the two arrays — you only ever have to compare two candidates.",
      "Advance the pointer you took from, and stop the main loop as soon as either array is exhausted.",
      "Then drain whatever is left of the other array; it is already sorted and every value is >= everything you have emitted.",
    ],
    solution:
      "function mergeSorted(a, b) {\n  const out = [];\n  let i = 0;\n  let j = 0;\n  while (i < a.length && j < b.length) {\n    if (a[i] <= b[j]) { out.push(a[i]); i++; }\n    else { out.push(b[j]); j++; }\n  }\n  while (i < a.length) { out.push(a[i]); i++; }\n  while (j < b.length) { out.push(b[j]); j++; }\n  return out;\n}\n",
    tests: [
      {
        name: "interleaves two arrays",
        body: "assert.deepEqual(mergeSorted([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]);\nassert.deepEqual(mergeSorted([1, 2, 3], [4, 5, 6]), [1, 2, 3, 4, 5, 6]);",
      },
      {
        name: "handles empty inputs",
        body: "assert.deepEqual(mergeSorted([], [1, 2]), [1, 2]);\nassert.deepEqual(mergeSorted([1, 2], []), [1, 2]);\nassert.deepEqual(mergeSorted([], []), []);",
      },
      {
        name: "keeps duplicates from both arrays",
        body: "assert.deepEqual(mergeSorted([1, 1, 2], [1, 3]), [1, 1, 1, 2, 3]);\nassert.deepEqual(mergeSorted([2, 2], [2, 2]), [2, 2, 2, 2]);",
      },
      {
        name: "negatives and very different lengths",
        body: "assert.deepEqual(mergeSorted([-5, -1], [-3, 0]), [-5, -3, -1, 0]);\nassert.deepEqual(mergeSorted([0], [-9, -4, -1, 7, 8]), [-9, -4, -1, 0, 7, 8]);",
      },
      {
        name: "does not mutate the inputs",
        body: "const a = [1, 3, 5];\nconst b = [2, 4];\nconst out = mergeSorted(a, b);\nassert.deepEqual(a, [1, 3, 5]);\nassert.deepEqual(b, [2, 4]);\nassert.equal(out.length, 5);\nassert.notEqual(out, a);\nassert.notEqual(out, b);",
      },
    ],
  },
{
    id: "ex-partition-labels",
    chapter: "dsa-greedy",
    level: "intermediate",
    title: "Partition Labels",
    brief:
      '<p>Given a string <code>s</code>, split it into as many contiguous parts as possible so that <b>each letter appears in at most one part</b>. Return an array of the part lengths, in order.</p><ul><li>Concatenating the parts back together must reproduce <code>s</code> exactly</li><li>Maximise the number of parts — the answer is unique</li><li>An empty string yields <code>[]</code></li><li>Target complexity: two passes, O(n)</li></ul><p>Example: <code>"ababcbacadefegdehijhklij"</code> gives <code>[9,7,8]</code>.</p>',
    starter:
      "function partitionLabels(s) {\n  // TODO: find where each letter last occurs, then sweep once and cut greedily\n}\n",
    hints: [
      "A part cannot end before the last occurrence of any letter it contains — otherwise that letter would show up in two parts.",
      "First pass: record the last index of every character. Second pass: keep a running 'furthest last-index seen so far' as you walk.",
      "The moment your current index equals that furthest index, nothing inside the current part appears later — cut there and start the next part.",
    ],
    solution:
      "function partitionLabels(s) {\n  const last = new Map();\n  for (let i = 0; i < s.length; i++) last.set(s[i], i);\n  const out = [];\n  let start = 0;\n  let end = 0;\n  for (let i = 0; i < s.length; i++) {\n    const e = last.get(s[i]);\n    if (e > end) end = e;\n    if (i === end) {\n      out.push(end - start + 1);\n      start = i + 1;\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.deepEqual(partitionLabels('ababcbacadefegdehijhklij'), [9, 7, 8]);",
      },
      {
        name: "one interlocked block cannot be split",
        body: "assert.deepEqual(partitionLabels('eccbbbbdec'), [10]);\nassert.deepEqual(partitionLabels('abab'), [4]);",
      },
      {
        name: "all distinct letters split completely",
        body: "assert.deepEqual(partitionLabels('abc'), [1, 1, 1]);\nassert.deepEqual(partitionLabels('a'), [1]);",
      },
      {
        name: "empty string",
        body: "assert.deepEqual(partitionLabels(''), []);",
      },
      {
        name: "parts sum back to the original length",
        body: "const inputs = ['ababcbacadefegdehijhklij', 'eccbbbbdec', 'qiejxqfnqceocmy', 'caedbdedda'];\nfor (const s of inputs) {\n  const parts = partitionLabels(s);\n  let total = 0;\n  for (const p of parts) total += p;\n  assert.equal(total, s.length, 'parts must cover ' + s);\n}\nassert.deepEqual(partitionLabels('qiejxqfnqceocmy'), [13, 1, 1]);\nassert.deepEqual(partitionLabels('caedbdedda'), [1, 9]);",
      },
    ],
  },
];
