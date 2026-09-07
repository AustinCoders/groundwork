import type { Exercise } from "../types";

export const dsa2: Exercise[] = [
{
    id: "ex-gas-station",
    chapter: "dsa-greedy",
    level: "advanced",
    title: "Gas Station",
    brief:
      "<p>There are <code>n</code> gas stations in a circle. Station <code>i</code> gives you <code>gas[i]</code> fuel, and driving from station <code>i</code> to the next one costs <code>cost[i]</code> fuel. You start with an empty tank.</p><ul><li>Return the index you must start from to complete the full loop</li><li>Return <code>-1</code> if no starting point works</li><li>When a solution exists it is unique. Aim for one pass</li></ul>",
    starter:
      "function canCompleteCircuit(gas, cost) {\n  // TODO: return the starting index that completes the loop, or -1\n}\n",
    hints: [
      "If the total gas is less than the total cost, no start can possibly work — check that first.",
      "If you run dry somewhere between start s and station i, then no station in s..i can be a valid start either.",
      "So carry a running tank; the moment it goes negative, reset it to 0 and set the candidate start to i + 1.",
    ],
    solution:
      "function canCompleteCircuit(gas, cost) {\n  let total = 0;\n  let tank = 0;\n  let start = 0;\n  for (let i = 0; i < gas.length; i++) {\n    const diff = gas[i] - cost[i];\n    total += diff;\n    tank += diff;\n    if (tank < 0) {\n      start = i + 1;\n      tank = 0;\n    }\n  }\n  return total < 0 ? -1 : start;\n}\n",
    tests: [
      {
        name: "finds the only viable start",
        body: "assert.equal(canCompleteCircuit([1,2,3,4,5], [3,4,5,1,2]), 3);",
      },
      {
        name: "returns -1 when the loop is impossible",
        body: "assert.equal(canCompleteCircuit([2,3,4], [3,4,3]), -1);",
      },
      {
        name: "single station with enough gas",
        body: "assert.equal(canCompleteCircuit([5], [4]), 0);",
      },
      {
        name: "single station without enough gas",
        body: "assert.equal(canCompleteCircuit([3], [4]), -1);",
      },
      {
        name: "start at index 0 when it already works",
        body: "assert.equal(canCompleteCircuit([4,1,1], [1,2,2]), 0);",
      },
    ],
  },
{
    id: "ex-jump-game",
    chapter: "dsa-greedy",
    level: "intermediate",
    title: "Jump Game",
    brief:
      "<p>You start at index 0 of <code>nums</code>. From index <code>i</code> you may jump forward any number of steps from <code>0</code> up to <code>nums[i]</code>. Return <code>true</code> if you can reach the last index.</p><ul><li>A value of <code>0</code> is a wall you cannot jump from</li><li>A single-element array is already at the end</li><li>Return an actual boolean</li></ul>",
    starter: "function canJump(nums) {\n  // TODO: return true if the last index is reachable from index 0\n}\n",
    hints: [
      "You do not need to know WHICH jumps you take — only how far you could possibly get.",
      "Sweep left to right tracking the furthest index reachable so far.",
      "If your current index ever exceeds that reach, you are stuck and the answer is false.",
    ],
    solution:
      "function canJump(nums) {\n  let reach = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (i > reach) return false;\n    reach = Math.max(reach, i + nums[i]);\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "reachable end",
        body: "assert.equal(canJump([2,3,1,1,4]), true);",
      },
      {
        name: "blocked by a zero",
        body: "assert.equal(canJump([3,2,1,0,4]), false);",
      },
      {
        name: "single element is trivially done",
        body: "assert.equal(canJump([0]), true);",
      },
      {
        name: "a zero on the final index is fine",
        body: "assert.equal(canJump([2,0,0]), true);",
      },
      {
        name: "first index is already a wall",
        body: "assert.equal(canJump([0,1,2]), false);",
      },
    ],
  },
{
    id: "ex-jump-game-ii",
    chapter: "dsa-greedy",
    level: "advanced",
    title: "Jump Game II",
    brief:
      "<p>Same rules as Jump Game — from index <code>i</code> you may jump up to <code>nums[i]</code> steps forward — but now the end is guaranteed reachable. Return the <b>minimum number of jumps</b> needed to get from index 0 to the last index.</p><ul><li>Zero jumps are needed if the array has one element</li><li>Target O(n) time — no BFS queue, no DP table needed</li><li>Think in terms of levels: everything reachable in exactly k jumps</li></ul>",
    starter: "function jump(nums) {\n  // TODO: return the fewest jumps needed to reach the last index\n}\n",
    hints: [
      "Treat it as a breadth-first walk: indices 0, then everything one jump away, then two jumps away.",
      "Track the end of the current level and the furthest index any element in this level can reach.",
      "When your scan reaches the end of the level, increment the jump count and extend the level to that furthest reach.",
    ],
    solution:
      "function jump(nums) {\n  let jumps = 0;\n  let currentEnd = 0;\n  let farthest = 0;\n  for (let i = 0; i < nums.length - 1; i++) {\n    farthest = Math.max(farthest, i + nums[i]);\n    if (i === currentEnd) {\n      jumps++;\n      currentEnd = farthest;\n    }\n  }\n  return jumps;\n}\n",
    tests: [
      {
        name: "two jumps suffice",
        body: "assert.equal(jump([2,3,1,1,4]), 2);",
      },
      {
        name: "another two jump case",
        body: "assert.equal(jump([2,3,0,1,4]), 2);",
      },
      {
        name: "already at the end",
        body: "assert.equal(jump([0]), 0);",
      },
      {
        name: "one big jump clears everything",
        body: "assert.equal(jump([5,1,1,1,1]), 1);",
      },
      {
        name: "step by step when every value is 1",
        body: "assert.equal(jump([1,1,1,1]), 3);",
      },
    ],
  },
{
    id: "ex-candy",
    chapter: "dsa-greedy",
    level: "advanced",
    title: "Candy",
    brief:
      "<p>Children stand in a line and <code>ratings[i]</code> is child <code>i</code>'s rating. Hand out candy so that:</p><ul><li>Every child gets at least one candy</li><li>A child rated higher than an immediate neighbour gets more candy than that neighbour</li><li>Equal ratings impose no constraint at all</li></ul><p>Return the minimum total number of candies required.</p>",
    starter:
      "function candy(ratings) {\n  // TODO: return the minimum total candies satisfying both neighbour rules\n}\n",
    hints: [
      "Each child has two independent constraints: one against the left neighbour, one against the right.",
      "Satisfy the left-neighbour rule with a forward pass, then the right-neighbour rule with a backward pass.",
      "On the backward pass do not overwrite — take the max of what you already assigned and what the right rule demands.",
    ],
    solution:
      "function candy(ratings) {\n  const n = ratings.length;\n  if (n === 0) return 0;\n  const give = new Array(n).fill(1);\n  for (let i = 1; i < n; i++) {\n    if (ratings[i] > ratings[i - 1]) give[i] = give[i - 1] + 1;\n  }\n  for (let i = n - 2; i >= 0; i--) {\n    if (ratings[i] > ratings[i + 1]) give[i] = Math.max(give[i], give[i + 1] + 1);\n  }\n  let total = 0;\n  for (const g of give) total += g;\n  return total;\n}\n",
    tests: [
      {
        name: "strictly increasing then a drop",
        body: "assert.equal(candy([1,0,2]), 5);",
      },
      {
        name: "equal ratings need no extra candy",
        body: "assert.equal(candy([1,2,2]), 4);",
      },
      {
        name: "single child",
        body: "assert.equal(candy([5]), 1);",
      },
      {
        name: "flat ratings give one each",
        body: "assert.equal(candy([3,3,3,3]), 4);",
      },
      {
        name: "long descending run needs the backward pass",
        body: "assert.equal(candy([1,3,4,5,2]), 11);",
      },
    ],
  },
{
    id: "ex-binary-search-classic",
    chapter: "dsa-binary-search",
    level: "beginner",
    title: "Binary Search",
    brief:
      "<p>You are given an array <code>nums</code> sorted in strictly increasing order and a value <code>target</code>. Return the index at which <code>target</code> sits, or <code>-1</code> if it is not in the array.</p><ul><li>The array may be empty</li><li>All values are distinct</li><li>Your solution must run in <code>O(log n)</code> time — a linear scan does not count</li></ul>",
    starter:
      "function binarySearch(nums, target) {\n  // TODO: keep shrinking a [lo, hi] window until the target is found\n}\n",
    hints: [
      "Track two pointers, lo and hi, that bound the part of the array still worth looking at.",
      "Compare nums[mid] with target: if it is too small, everything at mid and below is useless.",
      "Use `lo <= hi` with `hi = mid - 1` / `lo = mid + 1` so the window always shrinks and the loop terminates.",
    ],
    solution:
      "function binarySearch(nums, target) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = lo + ((hi - lo) >> 1);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}\n",
    tests: [
      {
        name: "finds a value in the middle",
        body: "assert.equal(binarySearch([-1, 0, 3, 5, 9, 12], 9), 4);",
      },
      {
        name: "returns -1 when absent",
        body: "assert.equal(binarySearch([-1, 0, 3, 5, 9, 12], 2), -1);",
      },
      {
        name: "handles the two ends",
        body: "assert.equal(binarySearch([1, 2, 3, 4, 5], 1), 0);\nassert.equal(binarySearch([1, 2, 3, 4, 5], 5), 4);",
      },
      {
        name: "handles single element and empty arrays",
        body: "assert.equal(binarySearch([7], 7), 0);\nassert.equal(binarySearch([7], 8), -1);\nassert.equal(binarySearch([], 1), -1);",
      },
      {
        name: "stays fast on a large array",
        body: "const big = [];\nfor (let i = 0; i < 200000; i++) big.push(i * 2);\nassert.equal(binarySearch(big, 399998), 199999);\nassert.equal(binarySearch(big, 399999), -1);",
      },
    ],
  },
{
    id: "ex-search-insert-position",
    chapter: "dsa-binary-search",
    level: "beginner",
    title: "Search Insert Position",
    brief:
      "<p>Given a sorted array of distinct integers <code>nums</code> and a value <code>target</code>, return the index of <code>target</code>. If it is not present, return the index where it would have to be inserted to keep the array sorted.</p><ul><li>A target smaller than everything belongs at index <code>0</code></li><li>A target larger than everything belongs at index <code>nums.length</code></li><li>Must run in <code>O(log n)</code></li></ul>",
    starter:
      "function searchInsert(nums, target) {\n  // TODO: binary search, but return where the search settles instead of -1\n}\n",
    hints: [
      "This is a plain binary search with a different fallback: what does `lo` point at once the loop ends?",
      "Think of it as 'the number of elements strictly less than target'.",
      "Run the loop with `lo <= hi`; when it exits, `lo` is exactly the insertion point.",
    ],
    solution:
      "function searchInsert(nums, target) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = lo + ((hi - lo) >> 1);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return lo;\n}\n",
    tests: [
      {
        name: "finds an existing value",
        body: "assert.equal(searchInsert([1, 3, 5, 6], 5), 2);",
      },
      {
        name: "inserts in the middle",
        body: "assert.equal(searchInsert([1, 3, 5, 6], 2), 1);",
      },
      {
        name: "inserts at both extremes",
        body: "assert.equal(searchInsert([1, 3, 5, 6], 0), 0);\nassert.equal(searchInsert([1, 3, 5, 6], 7), 4);",
      },
      {
        name: "handles empty and single-element arrays",
        body: "assert.equal(searchInsert([], 5), 0);\nassert.equal(searchInsert([1], 0), 0);\nassert.equal(searchInsert([1], 1), 0);\nassert.equal(searchInsert([1], 2), 1);",
      },
      {
        name: "works with negatives",
        body: "assert.equal(searchInsert([-9, -4, -1, 0], -5), 1);\nassert.equal(searchInsert([-9, -4, -1, 0], -10), 0);",
      },
    ],
  },
{
    id: "ex-search-2d-matrix",
    chapter: "dsa-binary-search",
    level: "intermediate",
    title: "Search a 2D Matrix",
    brief:
      "<p>You are given a matrix of integers with two guarantees: each row is sorted left to right, and the first value of every row is greater than the last value of the row above it. Return <code>true</code> if <code>target</code> appears in the matrix, otherwise <code>false</code>.</p><ul><li>Those two guarantees mean the matrix read row by row is one sorted list</li><li>Aim for <code>O(log(rows * cols))</code>, not one binary search per row</li><li>The matrix may be <code>[]</code> or contain an empty row</li></ul>",
    starter:
      "function searchMatrix(matrix, target) {\n  // TODO: treat the grid as a single sorted array of length rows * cols\n}\n",
    hints: [
      "If you flattened the matrix into one array, it would be sorted. Can you binary search it without building that array?",
      "Index i in the flattened view maps to row Math.floor(i / cols) and column i % cols.",
      "Search over 0 .. rows * cols - 1 and translate mid into a (row, col) pair on each step.",
    ],
    solution:
      "function searchMatrix(matrix, target) {\n  const rows = matrix.length;\n  if (rows === 0) return false;\n  const cols = matrix[0].length;\n  if (cols === 0) return false;\n  let lo = 0;\n  let hi = rows * cols - 1;\n  while (lo <= hi) {\n    const mid = lo + ((hi - lo) >> 1);\n    const value = matrix[Math.floor(mid / cols)][mid % cols];\n    if (value === target) return true;\n    if (value < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "finds a value that is present",
        body: "const m = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]];\nassert.equal(searchMatrix(m, 3), true);\nassert.equal(searchMatrix(m, 16), true);\nassert.equal(searchMatrix(m, 60), true);\nassert.equal(searchMatrix(m, 1), true);",
      },
      {
        name: "rejects a value that falls between rows",
        body: "const m = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]];\nassert.equal(searchMatrix(m, 13), false);\nassert.equal(searchMatrix(m, 0), false);\nassert.equal(searchMatrix(m, 61), false);",
      },
      {
        name: "handles single row and single column",
        body: "assert.equal(searchMatrix([[1, 2, 3]], 2), true);\nassert.equal(searchMatrix([[1, 2, 3]], 4), false);\nassert.equal(searchMatrix([[1], [4], [9]], 9), true);\nassert.equal(searchMatrix([[1], [4], [9]], 5), false);",
      },
      {
        name: "handles degenerate matrices",
        body: "assert.equal(searchMatrix([], 1), false);\nassert.equal(searchMatrix([[]], 1), false);\nassert.equal(searchMatrix([[5]], 5), true);",
      },
    ],
  },
{
    id: "ex-first-last-position",
    chapter: "dsa-binary-search",
    level: "intermediate",
    title: "First and Last Position of a Value",
    brief:
      "<p>Given a sorted array <code>nums</code> that may contain repeats, return a two-element array <code>[first, last]</code> holding the lowest and highest index where <code>target</code> occurs. Return <code>[-1, -1]</code> if it never occurs.</p><ul><li>Two binary searches — one biased left, one biased right — beat scanning outward from a hit</li><li>A block of equal values can span the whole array</li><li>Must run in <code>O(log n)</code>, so walking from a found index is not acceptable</li></ul>",
    starter:
      "function searchRange(nums, target) {\n  // TODO: find the leftmost and the rightmost occurrence separately\n}\n",
    hints: [
      "Finding any occurrence is easy; the hard part is not stopping there. Write a search that keeps going even after a match.",
      "For the left bound, when nums[mid] === target record mid and continue searching to the LEFT.",
      "Write one helper taking a flag (or two near-identical loops) instead of duplicating logic by hand.",
    ],
    solution:
      "function searchRange(nums, target) {\n  function bound(leftBiased) {\n    let lo = 0;\n    let hi = nums.length - 1;\n    let found = -1;\n    while (lo <= hi) {\n      const mid = lo + ((hi - lo) >> 1);\n      if (nums[mid] === target) {\n        found = mid;\n        if (leftBiased) hi = mid - 1;\n        else lo = mid + 1;\n      } else if (nums[mid] < target) {\n        lo = mid + 1;\n      } else {\n        hi = mid - 1;\n      }\n    }\n    return found;\n  }\n  const first = bound(true);\n  if (first === -1) return [-1, -1];\n  return [first, bound(false)];\n}\n",
    tests: [
      {
        name: "finds a repeated block",
        body: "assert.deepEqual(searchRange([5, 7, 7, 8, 8, 10], 8), [3, 4]);",
      },
      {
        name: "returns [-1,-1] when the target is missing",
        body: "assert.deepEqual(searchRange([5, 7, 7, 8, 8, 10], 6), [-1, -1]);\nassert.deepEqual(searchRange([], 0), [-1, -1]);",
      },
      {
        name: "handles a single occurrence",
        body: "assert.deepEqual(searchRange([5, 7, 7, 8, 8, 10], 5), [0, 0]);\nassert.deepEqual(searchRange([5, 7, 7, 8, 8, 10], 10), [5, 5]);\nassert.deepEqual(searchRange([1], 1), [0, 0]);",
      },
      {
        name: "handles an array that is entirely the target",
        body: "assert.deepEqual(searchRange([2, 2, 2, 2], 2), [0, 3]);\nassert.deepEqual(searchRange([2, 2, 2, 2], 3), [-1, -1]);",
      },
      {
        name: "stays logarithmic on a long run of duplicates",
        body: "const big = [];\nfor (let i = 0; i < 300000; i++) big.push(4);\nbig.push(9);\nassert.deepEqual(searchRange(big, 4), [0, 299999]);\nassert.deepEqual(searchRange(big, 9), [300000, 300000]);",
      },
    ],
  },
{
    id: "ex-search-rotated-sorted-array",
    chapter: "dsa-binary-search",
    level: "intermediate",
    title: "Search in Rotated Sorted Array",
    brief:
      "<p>An array of <b>distinct</b> integers was sorted ascending and then rotated left by some unknown amount, so <code>[0,1,2,4,5,6,7]</code> might arrive as <code>[4,5,6,7,0,1,2]</code>. Given the rotated array and a <code>target</code>, return its index, or <code>-1</code>.</p><ul><li>The rotation amount may be zero — the array can still be plain sorted</li><li>Must run in <code>O(log n)</code>; do not find the pivot by scanning</li></ul>",
    starter:
      "function search(nums, target) {\n  // TODO: at every step, one half of the window is still sorted — use it\n}\n",
    hints: [
      "Cut the window in half. At least one of the two halves is guaranteed to be a normally sorted range.",
      "Compare nums[lo] with nums[mid] to decide which half is the sorted one.",
      "If the target lies inside the sorted half's value range, search there; otherwise search the other half.",
    ],
    solution:
      "function search(nums, target) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = lo + ((hi - lo) >> 1);\n    if (nums[mid] === target) return mid;\n    if (nums[lo] <= nums[mid]) {\n      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;\n      else lo = mid + 1;\n    } else {\n      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;\n      else hi = mid - 1;\n    }\n  }\n  return -1;\n}\n",
    tests: [
      {
        name: "finds values on both sides of the pivot",
        body: "const nums = [4, 5, 6, 7, 0, 1, 2];\nassert.equal(search(nums, 0), 4);\nassert.equal(search(nums, 4), 0);\nassert.equal(search(nums, 7), 3);\nassert.equal(search(nums, 2), 6);",
      },
      {
        name: "returns -1 when absent",
        body: "assert.equal(search([4, 5, 6, 7, 0, 1, 2], 3), -1);\nassert.equal(search([], 5), -1);",
      },
      {
        name: "handles a zero rotation",
        body: "assert.equal(search([1, 2, 3, 4, 5], 5), 4);\nassert.equal(search([1, 2, 3, 4, 5], 1), 0);\nassert.equal(search([1, 2, 3, 4, 5], 6), -1);",
      },
      {
        name: "handles tiny arrays",
        body: "assert.equal(search([1], 0), -1);\nassert.equal(search([1], 1), 0);\nassert.equal(search([3, 1], 1), 1);\nassert.equal(search([5, 1, 3], 3), 2);",
      },
    ],
  },
{
    id: "ex-search-rotated-sorted-array-ii",
    chapter: "dsa-binary-search",
    level: "advanced",
    title: "Search in Rotated Sorted Array II",
    brief:
      "<p>Same setup as the rotated-array search, except values may now <b>repeat</b>. Given the rotated array and a <code>target</code>, return <code>true</code> if the target is present and <code>false</code> otherwise.</p><ul><li>Duplicates break the trick that told you which half was sorted: in <code>[1,1,1,1,1,2,1,1]</code> the left, middle and right values are all <code>1</code></li><li>When you cannot tell the halves apart, shrink the window by one and continue</li><li>Because of that, the worst case degrades to <code>O(n)</code> — that is expected, and understanding <em>why</em> is the point of this exercise</li></ul>",
    starter:
      "function searchDuplicates(nums, target) {\n  // TODO: rotated binary search, plus a plan for when nums[lo] === nums[mid] === nums[hi]\n}\n",
    hints: [
      "Start from the distinct-values solution: which comparison stops being informative once duplicates appear?",
      "If nums[lo] === nums[mid] && nums[mid] === nums[hi], neither half can be ruled out.",
      "In that ambiguous case just do lo++ and hi-- — you lose the log bound but stay correct.",
    ],
    solution:
      "function searchDuplicates(nums, target) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = lo + ((hi - lo) >> 1);\n    if (nums[mid] === target) return true;\n    if (nums[lo] === nums[mid] && nums[mid] === nums[hi]) {\n      lo++;\n      hi--;\n    } else if (nums[lo] <= nums[mid]) {\n      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;\n      else lo = mid + 1;\n    } else {\n      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;\n      else hi = mid - 1;\n    }\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "finds and rejects with mild duplicates",
        body: "assert.equal(searchDuplicates([2, 5, 6, 0, 0, 1, 2], 0), true);\nassert.equal(searchDuplicates([2, 5, 6, 0, 0, 1, 2], 3), false);",
      },
      {
        name: "survives heavy duplicates where the log bound degrades",
        body: "assert.equal(searchDuplicates([1, 1, 1, 1, 1, 2, 1, 1], 2), true);\nassert.equal(searchDuplicates([1, 1, 1, 1, 1, 2, 1, 1], 3), false);\nassert.equal(searchDuplicates([1, 0, 1, 1, 1], 0), true);\nassert.equal(searchDuplicates([1, 1, 1, 0, 1], 0), true);",
      },
      {
        name: "handles tiny and empty arrays",
        body: "assert.equal(searchDuplicates([], 1), false);\nassert.equal(searchDuplicates([1], 1), true);\nassert.equal(searchDuplicates([1], 2), false);\nassert.equal(searchDuplicates([1, 1], 2), false);",
      },
      {
        name: "handles a zero rotation and an all-equal array",
        body: "assert.equal(searchDuplicates([1, 2, 2, 3, 3, 3], 3), true);\nassert.equal(searchDuplicates([4, 4, 4, 4, 4], 4), true);\nassert.equal(searchDuplicates([4, 4, 4, 4, 4], 5), false);",
      },
    ],
  },
{
    id: "ex-find-min-rotated",
    chapter: "dsa-binary-search",
    level: "intermediate",
    title: "Find Minimum in Rotated Sorted Array",
    brief:
      "<p>An ascending array of <b>distinct</b> integers has been rotated left an unknown number of times. Return its smallest value.</p><ul><li>The array is never empty</li><li>Rotating by zero is allowed, so a plain sorted array is valid input</li><li>Must run in <code>O(log n)</code></li></ul>",
    starter: "function findMin(nums) {\n  // TODO: binary search for the point where the ascending run restarts\n}\n",
    hints: [
      "The minimum is the only element smaller than the one before it. Look for that break point.",
      "Compare nums[mid] against nums[hi], not nums[lo]: it tells you whether the break is to the right of mid.",
      "Use `while (lo < hi)` and never discard mid when it could still be the minimum — set `hi = mid`, not `hi = mid - 1`.",
    ],
    solution:
      "function findMin(nums) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo < hi) {\n    const mid = lo + ((hi - lo) >> 1);\n    if (nums[mid] > nums[hi]) lo = mid + 1;\n    else hi = mid;\n  }\n  return nums[lo];\n}\n",
    tests: [
      {
        name: "finds the minimum after a rotation",
        body: "assert.equal(findMin([3, 4, 5, 1, 2]), 1);\nassert.equal(findMin([4, 5, 6, 7, 0, 1, 2]), 0);",
      },
      {
        name: "handles a zero rotation",
        body: "assert.equal(findMin([11, 13, 15, 17]), 11);\nassert.equal(findMin([1, 2, 3, 4, 5, 6, 7]), 1);",
      },
      {
        name: "handles one and two element arrays",
        body: "assert.equal(findMin([1]), 1);\nassert.equal(findMin([2, 1]), 1);\nassert.equal(findMin([1, 2]), 1);",
      },
      {
        name: "handles negatives and a rotation by one",
        body: "assert.equal(findMin([-1, 0, 5, -8, -5, -3]), -8);\nassert.equal(findMin([5, 1, 2, 3, 4]), 1);\nassert.equal(findMin([2, 3, 4, 5, 1]), 1);",
      },
    ],
  },
{
    id: "ex-find-peak-element",
    chapter: "dsa-binary-search",
    level: "intermediate",
    title: "Find Peak Element",
    brief:
      "<p>A <em>peak</em> is an element strictly greater than both of its neighbours. Given an array <code>nums</code> in which no two adjacent values are equal, return the index of <b>any</b> peak.</p><ul><li>Treat the positions just outside the array as <code>-Infinity</code>, so the first and last elements only need to beat their single real neighbour</li><li>Several peaks may exist — returning any one of them is correct</li><li>Must run in <code>O(log n)</code>, so scanning for the maximum is not acceptable</li></ul>",
    starter:
      "function findPeakElement(nums) {\n  // TODO: use the slope at mid to decide which half must contain a peak\n}\n",
    hints: [
      "The array has no global order, but it does have local slope. What does nums[mid] < nums[mid + 1] tell you?",
      "If the array is rising at mid, some peak must exist to the right; if it is falling, one exists at mid or to the left.",
      "Loop with `while (lo < hi)` and move `lo = mid + 1` or `hi = mid`; when they meet, that index is a peak.",
    ],
    solution:
      "function findPeakElement(nums) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo < hi) {\n    const mid = lo + ((hi - lo) >> 1);\n    if (nums[mid] < nums[mid + 1]) lo = mid + 1;\n    else hi = mid;\n  }\n  return lo;\n}\n",
    tests: [
      {
        name: "returns an index that really is a peak",
        body: "const nums = [1, 2, 1, 3, 5, 6, 4];\nconst i = findPeakElement(nums);\nconst at = function (k) { return k >= 0 && k < nums.length ? nums[k] : -Infinity; };\nassert.ok(i >= 0 && i < nums.length, 'index out of range: ' + i);\nassert.ok(at(i) > at(i - 1) && at(i) > at(i + 1), 'index ' + i + ' is not a peak');",
      },
      {
        name: "handles a strictly increasing array (peak is the last index)",
        body: "const nums = [1, 2, 3, 4, 5];\nconst i = findPeakElement(nums);\nconst at = function (k) { return k >= 0 && k < nums.length ? nums[k] : -Infinity; };\nassert.ok(at(i) > at(i - 1) && at(i) > at(i + 1), 'index ' + i + ' is not a peak');\nassert.equal(i, 4);",
      },
      {
        name: "handles a strictly decreasing array (peak is index 0)",
        body: "const nums = [9, 7, 5, 3, 1];\nconst i = findPeakElement(nums);\nconst at = function (k) { return k >= 0 && k < nums.length ? nums[k] : -Infinity; };\nassert.ok(at(i) > at(i - 1) && at(i) > at(i + 1), 'index ' + i + ' is not a peak');\nassert.equal(i, 0);",
      },
      {
        name: "handles one and two element arrays",
        body: "assert.equal(findPeakElement([1]), 0);\nassert.equal(findPeakElement([1, 2]), 1);\nassert.equal(findPeakElement([2, 1]), 0);",
      },
      {
        name: "any of several peaks is accepted",
        body: "const nums = [1, 5, 1, 5, 1, 5, 1];\nconst at = function (k) { return k >= 0 && k < nums.length ? nums[k] : -Infinity; };\nconst i = findPeakElement(nums);\nassert.ok(at(i) > at(i - 1) && at(i) > at(i + 1), 'index ' + i + ' is not a peak');\nassert.ok(i === 1 || i === 3 || i === 5, 'unexpected index ' + i);",
      },
    ],
  },
{
    id: "ex-koko-eating-bananas",
    chapter: "dsa-binary-search",
    level: "advanced",
    title: "Koko Eating Bananas",
    brief:
      "<p>There are <code>piles.length</code> piles of bananas and a guard who will be away for <code>h</code> hours. Koko picks an eating speed <code>k</code> bananas per hour. Each hour she picks one pile and eats up to <code>k</code> from it; if the pile has fewer than <code>k</code> left she eats it and still spends the whole hour on it. Return the smallest integer <code>k</code> that lets her finish every pile within <code>h</code> hours.</p><ul><li>This is <b>binary search on the answer</b>: you are not searching the input array, you are searching the range of candidate speeds <code>1 .. max(piles)</code></li><li>The key property is monotonicity — if speed <code>k</code> works, every faster speed works too, so 'does k work?' splits the range into a false block then a true block</li><li>Hours needed at speed <code>k</code> is the sum of <code>ceil(pile / k)</code></li><li><code>h</code> is always at least <code>piles.length</code></li></ul>",
    starter:
      "function minEatingSpeed(piles, h) {\n  // TODO: binary search the candidate speeds, testing each with a feasibility check\n}\n",
    hints: [
      "Write `hoursNeeded(k)` first: it is a simple loop. Now, is it increasing or decreasing in k?",
      "Because feasibility is monotone, binary search the speed range 1 .. max(piles) instead of the array.",
      "When a speed is feasible, keep it as a candidate and try a slower one (hi = mid); otherwise lo = mid + 1.",
    ],
    solution:
      "function minEatingSpeed(piles, h) {\n  function hoursNeeded(k) {\n    let total = 0;\n    for (const pile of piles) total += Math.ceil(pile / k);\n    return total;\n  }\n  let lo = 1;\n  let hi = 1;\n  for (const pile of piles) if (pile > hi) hi = pile;\n  while (lo < hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (hoursNeeded(mid) <= h) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}\n",
    tests: [
      {
        name: "finds the minimum speed with slack hours",
        body: "assert.equal(minEatingSpeed([3, 6, 7, 11], 8), 4);",
      },
      {
        name: "boundary: h equals the pile count so the answer is the max pile",
        body: "assert.equal(minEatingSpeed([3, 6, 7, 11], 4), 11);\nassert.equal(minEatingSpeed([30, 11, 23, 4, 20], 5), 30);",
      },
      {
        name: "handles one extra hour of slack",
        body: "assert.equal(minEatingSpeed([30, 11, 23, 4, 20], 6), 23);",
      },
      {
        name: "handles a single pile and lots of time",
        body: "assert.equal(minEatingSpeed([1], 1), 1);\nassert.equal(minEatingSpeed([1000000000], 2), 500000000);\nassert.equal(minEatingSpeed([312884470], 968709470), 1);",
      },
      {
        name: "handles equal piles",
        body: "assert.equal(minEatingSpeed([5, 5, 5, 5], 4), 5);\nassert.equal(minEatingSpeed([5, 5, 5, 5], 8), 3);",
      },
    ],
  },
{
    id: "ex-ship-packages-in-days",
    chapter: "dsa-binary-search",
    level: "advanced",
    title: "Capacity to Ship Packages Within D Days",
    brief:
      "<p>Packages with the given <code>weights</code> must be loaded onto a boat <b>in the order listed</b>. Each day the boat carries a prefix of what is left, never exceeding its weight capacity. Return the smallest capacity that gets every package shipped within <code>days</code> days.</p><ul><li>This is <b>binary search on the answer</b>: the search space is the range of candidate capacities, not the input array</li><li>The low end is <code>max(weights)</code> — anything smaller can never carry that one package. The high end is <code>sum(weights)</code> — ship everything in one day</li><li>Feasibility is monotone: if a capacity works, every larger capacity works</li><li>Order is fixed; you may not reorder packages</li></ul>",
    starter:
      "function shipWithinDays(weights, days) {\n  // TODO: binary search the capacity range, greedily counting days for each candidate\n}\n",
    hints: [
      "Write `daysNeeded(capacity)` as a greedy pass: keep loading until the next package would overflow, then start a new day.",
      "The answer can never be below max(weights) nor above sum(weights) — that is your search range.",
      "Binary search that range; a feasible capacity becomes the new upper bound (hi = mid).",
    ],
    solution:
      "function shipWithinDays(weights, days) {\n  function daysNeeded(capacity) {\n    let used = 1;\n    let load = 0;\n    for (const w of weights) {\n      if (load + w > capacity) {\n        used++;\n        load = 0;\n      }\n      load += w;\n    }\n    return used;\n  }\n  let lo = 0;\n  let hi = 0;\n  for (const w of weights) {\n    if (w > lo) lo = w;\n    hi += w;\n  }\n  while (lo < hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (daysNeeded(mid) <= days) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}\n",
    tests: [
      {
        name: "splits ten packages over five days",
        body: "assert.equal(shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5), 15);",
      },
      {
        name: "boundary: one day per package means the answer is the heaviest package",
        body: "assert.equal(shipWithinDays([1, 2, 3, 4, 5], 5), 5);\nassert.equal(shipWithinDays([3, 2, 2, 4, 1, 4], 6), 4);",
      },
      {
        name: "boundary: a single day means the answer is the total weight",
        body: "assert.equal(shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1), 55);\nassert.equal(shipWithinDays([7], 1), 7);",
      },
      {
        name: "handles the mid-range cases",
        body: "assert.equal(shipWithinDays([3, 2, 2, 4, 1, 4], 3), 6);\nassert.equal(shipWithinDays([1, 2, 3, 1, 1], 4), 3);",
      },
      {
        name: "stays fast on a long list",
        body: "const w = [];\nfor (let i = 0; i < 50000; i++) w.push((i % 400) + 1);\nconst cap = shipWithinDays(w, 100);\nlet used = 1;\nlet load = 0;\nfor (const x of w) { if (load + x > cap) { used++; load = 0; } load += x; }\nassert.ok(used <= 100, 'capacity ' + cap + ' needs ' + used + ' days');\nlet used2 = 1;\nlet load2 = 0;\nfor (const x of w) { if (load2 + x > cap - 1) { used2++; load2 = 0; } load2 += x; }\nassert.ok(used2 > 100, 'capacity ' + cap + ' was not minimal');",
      },
    ],
  },
{
    id: "ex-split-array-largest-sum",
    chapter: "dsa-binary-search",
    level: "advanced",
    title: "Split Array Largest Sum",
    brief:
      "<p>Given an array of non-negative integers <code>nums</code> and an integer <code>k</code>, cut the array into exactly <code>k</code> non-empty <b>contiguous</b> pieces. Each piece has a sum; the cost of a split is the largest of those sums. Return the smallest cost achievable.</p><ul><li>This is <b>binary search on the answer</b>: search over candidate cost values, not over the array or over the possible cut positions</li><li>Candidate costs run from <code>max(nums)</code> to <code>sum(nums)</code>, and 'can I split within this cost?' is monotone in the cost</li><li>Given a cost limit, greedily extend each piece until adding the next value would exceed it, and count how many pieces that takes</li><li><code>k</code> is between 1 and <code>nums.length</code></li></ul>",
    starter:
      "function splitArray(nums, k) {\n  // TODO: binary search the candidate largest-sum values and test each greedily\n}\n",
    hints: [
      "Flip the question: instead of 'what is the best split?', ask 'can I split into at most k pieces if no piece may exceed X?'.",
      "That check is a single greedy pass, and its answer is monotone in X — false for small X, true from some point on.",
      "Binary search X over max(nums) .. sum(nums) and return the smallest X that passes.",
    ],
    solution:
      "function splitArray(nums, k) {\n  function piecesNeeded(limit) {\n    let pieces = 1;\n    let sum = 0;\n    for (const n of nums) {\n      if (sum + n > limit) {\n        pieces++;\n        sum = 0;\n      }\n      sum += n;\n    }\n    return pieces;\n  }\n  let lo = 0;\n  let hi = 0;\n  for (const n of nums) {\n    if (n > lo) lo = n;\n    hi += n;\n  }\n  while (lo < hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (piecesNeeded(mid) <= k) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}\n",
    tests: [
      {
        name: "splits into two pieces",
        body: "assert.equal(splitArray([7, 2, 5, 10, 8], 2), 18);\nassert.equal(splitArray([1, 2, 3, 4, 5], 2), 9);",
      },
      {
        name: "boundary: k equals the length so the answer is the max element",
        body: "assert.equal(splitArray([1, 2, 3, 4, 5], 5), 5);\nassert.equal(splitArray([1, 4, 4], 3), 4);\nassert.equal(splitArray([7, 2, 5, 10, 8], 5), 10);",
      },
      {
        name: "boundary: k of 1 is the whole sum",
        body: "assert.equal(splitArray([7, 2, 5, 10, 8], 1), 32);\nassert.equal(splitArray([9], 1), 9);",
      },
      {
        name: "handles zeros and repeated values",
        body: "assert.equal(splitArray([0, 0, 0, 0], 2), 0);\nassert.equal(splitArray([1, 4, 4], 2), 5);\nassert.equal(splitArray([2, 2, 2, 2, 2, 2], 3), 4);",
      },
      {
        name: "stays fast on a long array",
        body: "const nums = [];\nfor (let i = 0; i < 60000; i++) nums.push((i % 100) + 1);\nconst best = splitArray(nums, 50);\nconst count = function (limit) {\n  let pieces = 1;\n  let sum = 0;\n  for (const n of nums) { if (sum + n > limit) { pieces++; sum = 0; } sum += n; }\n  return pieces;\n};\nassert.ok(count(best) <= 50, 'answer ' + best + ' is not feasible');\nassert.ok(count(best - 1) > 50, 'answer ' + best + ' is not minimal');",
      },
    ],
  },
{
    id: "ex-median-two-sorted-arrays",
    chapter: "dsa-binary-search",
    level: "advanced",
    title: "Median of Two Sorted Arrays",
    brief:
      "<p>Given two arrays <code>a</code> and <code>b</code>, each already sorted ascending, return the median of all their values combined. With an odd total count the median is the middle value; with an even total count it is the average of the two middle values.</p><ul><li>Either array may be empty (but not both)</li><li>Merging is <code>O(m + n)</code>; the target here is <code>O(log(min(m, n)))</code></li><li>Binary search a <em>partition point</em> in the shorter array: cut both arrays so the left halves together hold exactly half the elements and every left value is at most every right value</li><li>Use <code>-Infinity</code> and <code>Infinity</code> for the missing neighbours when a cut lands at an array's edge</li></ul>",
    starter:
      "function findMedianSortedArrays(a, b) {\n  // TODO: binary search the cut position in the shorter array\n}\n",
    hints: [
      "The median only depends on where the combined sequence splits into a smaller half and a larger half — you never need the merged array.",
      "Pick i elements from a; then j is forced, because the two halves must total Math.floor((m + n + 1) / 2).",
      "The cut is correct when aLeft <= bRight and bLeft <= aRight; otherwise move i left or right and retry.",
    ],
    solution:
      "function findMedianSortedArrays(a, b) {\n  if (a.length > b.length) return findMedianSortedArrays(b, a);\n  const m = a.length;\n  const n = b.length;\n  let lo = 0;\n  let hi = m;\n  while (lo <= hi) {\n    const i = lo + Math.floor((hi - lo) / 2);\n    const j = Math.floor((m + n + 1) / 2) - i;\n    const aLeft = i > 0 ? a[i - 1] : -Infinity;\n    const aRight = i < m ? a[i] : Infinity;\n    const bLeft = j > 0 ? b[j - 1] : -Infinity;\n    const bRight = j < n ? b[j] : Infinity;\n    if (aLeft <= bRight && bLeft <= aRight) {\n      if ((m + n) % 2 === 1) return Math.max(aLeft, bLeft);\n      return (Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2;\n    }\n    if (aLeft > bRight) hi = i - 1;\n    else lo = i + 1;\n  }\n  return 0;\n}\n",
    tests: [
      {
        name: "odd total length, both arrays non-empty",
        body: "assert.equal(findMedianSortedArrays([1, 3], [2]), 2);\nassert.equal(findMedianSortedArrays([1, 2], [3, 4, 5]), 3);",
      },
      {
        name: "even total length, both arrays non-empty",
        body: "assert.equal(findMedianSortedArrays([1, 2], [3, 4]), 2.5);\nassert.equal(findMedianSortedArrays([1, 3], [2, 4]), 2.5);\nassert.equal(findMedianSortedArrays([0, 0], [0, 0]), 0);",
      },
      {
        name: "one array is empty",
        body: "assert.equal(findMedianSortedArrays([], [1]), 1);\nassert.equal(findMedianSortedArrays([2], []), 2);\nassert.equal(findMedianSortedArrays([], [2, 4]), 3);\nassert.equal(findMedianSortedArrays([1, 2, 3, 4], []), 2.5);",
      },
      {
        name: "arrays that do not overlap at all",
        body: "assert.equal(findMedianSortedArrays([1, 2, 3], [7, 8, 9]), 5);\nassert.equal(findMedianSortedArrays([7, 8, 9], [1, 2, 3]), 5);\nassert.equal(findMedianSortedArrays([-5, -4], [-3, -2]), -3.5);",
      },
      {
        name: "very lopsided sizes and duplicates",
        body: "const b = [];\nfor (let i = 1; i <= 100000; i++) b.push(i);\nassert.equal(findMedianSortedArrays([50000], b), 50000);\nassert.equal(findMedianSortedArrays([2, 2, 2], [2, 2, 2]), 2);",
      },
    ],
  },
{
    id: "ex-integer-sqrt",
    chapter: "dsa-binary-search",
    level: "beginner",
    title: "Integer Square Root",
    brief:
      "<p>Given a non-negative integer <code>x</code>, return its square root rounded <b>down</b> to an integer — that is, the largest integer <code>r</code> with <code>r * r &lt;= x</code>.</p><ul><li>Do not use <code>Math.sqrt</code>, <code>Math.pow</code> or <code>**</code></li><li><code>x</code> can be <code>0</code> or <code>1</code></li><li><code>x</code> can be as large as 2147483647, so pick your search bounds carefully</li></ul>",
    starter: "function mySqrt(x) {\n  // TODO: binary search the candidate roots between 0 and x\n}\n",
    hints: [
      "The predicate 'r * r <= x' is true for every r up to the answer and false after it — a perfect binary search target.",
      "Search r over 0 .. x (you can tighten the upper bound to about 46341 for 32-bit inputs).",
      "Whenever mid * mid <= x, remember mid as the best answer so far and keep searching higher.",
    ],
    solution:
      "function mySqrt(x) {\n  if (x < 2) return x;\n  let lo = 1;\n  let hi = Math.floor(x / 2) + 1;\n  let best = 1;\n  while (lo <= hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (mid * mid <= x) {\n      best = mid;\n      lo = mid + 1;\n    } else {\n      hi = mid - 1;\n    }\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "exact squares",
        body: "assert.equal(mySqrt(4), 2);\nassert.equal(mySqrt(9), 3);\nassert.equal(mySqrt(100), 10);",
      },
      {
        name: "rounds down for non-squares",
        body: "assert.equal(mySqrt(8), 2);\nassert.equal(mySqrt(15), 3);\nassert.equal(mySqrt(99), 9);",
      },
      {
        name: "handles 0, 1, 2 and 3",
        body: "assert.equal(mySqrt(0), 0);\nassert.equal(mySqrt(1), 1);\nassert.equal(mySqrt(2), 1);\nassert.equal(mySqrt(3), 1);",
      },
      {
        name: "handles large 32-bit inputs",
        body: "assert.equal(mySqrt(2147395599), 46339);\nassert.equal(mySqrt(2147395600), 46340);\nassert.equal(mySqrt(2147483647), 46340);",
      },
    ],
  },
{
    id: "ex-valid-perfect-square",
    chapter: "dsa-binary-search",
    level: "beginner",
    title: "Valid Perfect Square",
    brief:
      "<p>Given a positive integer <code>num</code>, return <code>true</code> if it is the square of some integer and <code>false</code> otherwise.</p><ul><li>Do not use <code>Math.sqrt</code>, <code>Math.pow</code> or <code>**</code></li><li>Return an actual boolean, not a number or a string</li><li><code>num</code> can be as large as 2147483647</li></ul>",
    starter: "function isPerfectSquare(num) {\n  // TODO: binary search for an integer r with r * r === num\n}\n",
    hints: [
      "Any root of num must lie between 1 and num, and squaring is increasing — so the range is searchable.",
      "Compare mid * mid against num and shrink the range as in a normal binary search.",
      "Return true only on an exact hit; if the loop finishes without one, the number is not a perfect square.",
    ],
    solution:
      "function isPerfectSquare(num) {\n  if (num < 1) return false;\n  let lo = 1;\n  let hi = Math.floor(num / 2) + 1;\n  while (lo <= hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    const square = mid * mid;\n    if (square === num) return true;\n    if (square < num) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "accepts perfect squares",
        body: "assert.equal(isPerfectSquare(16), true);\nassert.equal(isPerfectSquare(81), true);\nassert.equal(isPerfectSquare(808201), true);",
      },
      {
        name: "rejects non-squares",
        body: "assert.equal(isPerfectSquare(14), false);\nassert.equal(isPerfectSquare(2), false);\nassert.equal(isPerfectSquare(808200), false);",
      },
      {
        name: "handles the smallest inputs",
        body: "assert.equal(isPerfectSquare(1), true);\nassert.equal(isPerfectSquare(3), false);\nassert.equal(isPerfectSquare(4), true);",
      },
      {
        name: "returns a real boolean and handles large inputs",
        body: "assert.type(isPerfectSquare(25), 'boolean');\nassert.type(isPerfectSquare(26), 'boolean');\nassert.equal(isPerfectSquare(2147395600), true);\nassert.equal(isPerfectSquare(2147483647), false);",
      },
    ],
  },
{
    id: "ex-find-duplicate-number",
    chapter: "dsa-binary-search",
    level: "advanced",
    title: "Find the Duplicate Number",
    brief:
      "<p>An array <code>nums</code> holds <code>n + 1</code> integers, every one of them in the range <code>1 .. n</code>. By the pigeonhole principle at least one value repeats; you are told exactly one value is duplicated, though it may appear many times. Return that value.</p><ul><li>You must <b>not modify</b> the array — no sorting, no marking entries negative</li><li>You may use only <code>O(1)</code> extra space — no Set, no frequency array</li><li>Read <code>i -&gt; nums[i]</code> as a linked list: since every value is in <code>1 .. n</code>, no jump ever leaves the array, and the duplicate creates a cycle whose entrance is the answer</li><li>Floyd's tortoise-and-hare finds that entrance in <code>O(n)</code> time and <code>O(1)</code> space</li></ul>",
    starter:
      "function findDuplicate(nums) {\n  // TODO: treat index -> value as a linked list and find where its cycle starts\n}\n",
    hints: [
      "Because values are in 1..n and there are n+1 slots, starting at index 0 and repeatedly following nums[i] never escapes the array and must eventually repeat a position.",
      "Two pointers, one moving one step and one moving two, are guaranteed to meet somewhere inside the cycle.",
      "After they meet, reset one pointer to the start and advance both one step at a time — they meet again exactly at the cycle entrance, which is the duplicated value.",
    ],
    solution:
      "function findDuplicate(nums) {\n  let slow = nums[0];\n  let fast = nums[0];\n  do {\n    slow = nums[slow];\n    fast = nums[nums[fast]];\n  } while (slow !== fast);\n  slow = nums[0];\n  while (slow !== fast) {\n    slow = nums[slow];\n    fast = nums[fast];\n  }\n  return slow;\n}\n",
    tests: [
      {
        name: "finds a duplicate that appears twice",
        body: "assert.equal(findDuplicate([1, 3, 4, 2, 2]), 2);\nassert.equal(findDuplicate([3, 1, 3, 4, 2]), 3);",
      },
      {
        name: "handles the smallest case and a duplicate repeated many times",
        body: "assert.equal(findDuplicate([1, 1]), 1);\nassert.equal(findDuplicate([2, 2, 2, 2, 2]), 2);\nassert.equal(findDuplicate([1, 4, 6, 6, 6, 2, 3]), 6);",
      },
      {
        name: "leaves the input array untouched",
        body: "const nums = [3, 1, 3, 4, 2];\nconst before = nums.slice();\nassert.equal(findDuplicate(nums), 3);\nassert.deepEqual(nums, before, 'the input array must not be modified');\nassert.equal(nums.length, 5);",
      },
      {
        name: "handles the duplicate at the extremes of the range",
        body: "assert.equal(findDuplicate([1, 2, 3, 4, 5, 1]), 1);\nassert.equal(findDuplicate([5, 1, 2, 3, 4, 5]), 5);",
      },
      {
        name: "stays linear and allocation-free on a large array",
        body: "const nums = [];\nfor (let i = 1; i <= 200000; i++) nums.push(i);\nnums.push(137);\nconst before = nums.slice();\nassert.equal(findDuplicate(nums), 137);\nassert.deepEqual(nums, before, 'the input array must not be modified');",
      },
    ],
  },
{
    id: "ex-single-number",
    chapter: "dsa-bit-manipulation",
    level: "beginner",
    title: "Single Number",
    brief:
      "<p>Every value in <code>nums</code> shows up exactly twice except for one value, which shows up once. Return that lone value.</p><ul><li>Solve it in <b>O(n)</b> time using <b>O(1)</b> extra space — no Set, no Map</li><li>The array always contains at least one element</li><li>Values may be negative</li></ul>",
    starter: "function singleNumber(nums) {\n  // TODO: fold the array down to one value with a single operator\n}\n",
    hints: [
      "Which operator, applied to a value twice, cancels it back out to 0?",
      "XOR is commutative and associative, so the order of the array does not matter — every pair annihilates itself no matter where the partners sit.",
      "Start an accumulator at 0 and XOR every element into it. Whatever survives is the answer.",
    ],
    solution: "function singleNumber(nums) {\n  let acc = 0;\n  for (const n of nums) acc ^= n;\n  return acc;\n}\n",
    tests: [
      {
        name: "finds the lonely value",
        body: "assert.equal(singleNumber([4, 1, 2, 1, 2]), 4);",
      },
      {
        name: "single element array",
        body: "assert.equal(singleNumber([7]), 7);",
      },
      {
        name: "the pairs are not adjacent",
        body: "assert.equal(singleNumber([2, 3, 5, 3, 2]), 5);",
      },
      {
        name: "works with negatives and zero",
        body: "assert.equal(singleNumber([-3, 9, 9, -3, 0]), 0);\nassert.equal(singleNumber([-8, 6, 6]), -8);",
      },
    ],
  },
{
    id: "ex-single-number-three-times",
    chapter: "dsa-bit-manipulation",
    level: "advanced",
    title: "Single Number II",
    brief:
      "<p>Every value in <code>nums</code> appears exactly <b>three</b> times except for one value, which appears once. Return that value.</p><ul><li>Plain XOR no longer works — <code>x ^ x ^ x</code> is <code>x</code>, not 0</li><li>Aim for <b>O(n)</b> time and <b>O(1)</b> extra space</li><li>Values may be negative, so any solution must stay correct across all 32 bits including the sign bit</li></ul>",
    starter: "function singleNumber(nums) {\n  // TODO: track each bit's count modulo 3 without a counting table\n}\n",
    hints: [
      "Think about one bit column at a time: across the whole array that column's 1-count is a multiple of 3, plus 0 or 1 from the lonely value.",
      "You need a counter per bit that cycles 0 -> 1 -> 2 -> 0. Two accumulators, `ones` and `twos`, encode that state for all 32 columns at once.",
      "`ones = (ones ^ n) & ~twos` then `twos = (twos ^ n) & ~ones`. After the loop `ones` holds the bits seen exactly once — and because JS bitwise ops already work on signed 32-bit values, a negative answer comes out correctly with no extra fixup.",
    ],
    solution:
      "function singleNumber(nums) {\n  let ones = 0;\n  let twos = 0;\n  for (const n of nums) {\n    ones = (ones ^ n) & ~twos;\n    twos = (twos ^ n) & ~ones;\n  }\n  return ones;\n}\n",
    tests: [
      {
        name: "basic triple grouping",
        body: "assert.equal(singleNumber([2, 2, 3, 2]), 3);",
      },
      {
        name: "triples interleaved with the answer",
        body: "assert.equal(singleNumber([0, 1, 0, 1, 0, 1, 99]), 99);",
      },
      {
        name: "single element array",
        body: "assert.equal(singleNumber([30000]), 30000);",
      },
      {
        name: "negative triples",
        body: "assert.equal(singleNumber([-2, -2, 1, -2]), 1);",
      },
      {
        name: "the answer itself is negative",
        body: "assert.equal(singleNumber([5, 5, 5, -100]), -100);",
      },
    ],
  },
{
    id: "ex-missing-number-xor",
    chapter: "dsa-bit-manipulation",
    level: "beginner",
    title: "Missing Number",
    brief:
      "<p><code>nums</code> holds <code>n</code> distinct integers drawn from the range <code>0..n</code>. Exactly one number from that range is missing — return it.</p><ul><li>Solve it with <b>XOR</b>, not with a sum formula and not with a Set</li><li>The array is not sorted</li><li><code>nums</code> may be empty, in which case the missing number is 0</li></ul>",
    starter: "function missingNumber(nums) {\n  // TODO: XOR every index and every value together\n}\n",
    hints: [
      "If nothing were missing, the values would be exactly 0..n. What happens when you XOR two identical collections together?",
      "XOR the numbers 0..n into an accumulator, and XOR every element of the array into the same accumulator. Every present value cancels with its counterpart.",
      "You can do it in one loop: XOR in `i`, `nums[i]`, and finish by XOR-ing in `nums.length`.",
    ],
    solution:
      "function missingNumber(nums) {\n  let acc = nums.length;\n  for (let i = 0; i < nums.length; i++) {\n    acc ^= i ^ nums[i];\n  }\n  return acc;\n}\n",
    tests: [
      {
        name: "missing from the middle",
        body: "assert.equal(missingNumber([3, 0, 1]), 2);",
      },
      {
        name: "missing the top of the range",
        body: "assert.equal(missingNumber([0, 1]), 2);",
      },
      {
        name: "missing zero",
        body: "assert.equal(missingNumber([1]), 0);",
      },
      {
        name: "empty array",
        body: "assert.equal(missingNumber([]), 0);",
      },
      {
        name: "longer shuffled range",
        body: "assert.equal(missingNumber([9, 6, 4, 2, 3, 5, 7, 0, 1]), 8);",
      },
    ],
  },
{
    id: "ex-hamming-weight",
    chapter: "dsa-bit-manipulation",
    level: "beginner",
    title: "Number of 1 Bits",
    brief:
      "<p>Given an unsigned 32-bit integer <code>n</code>, return how many bits in its binary representation are set to 1 (its Hamming weight).</p><ul><li><code>n</code> may be as large as <code>4294967295</code>, so the top bit can be set</li><li><b>The JS trap:</b> every bitwise operator coerces its operands to a <em>signed</em> 32-bit integer. Once bit 31 is set, <code>n &gt;&gt; 1</code> keeps shifting a 1 in from the left and your loop never terminates.</li><li>The fix is the <b>unsigned</b> right shift: normalise with <code>n &gt;&gt;&gt; 0</code> and shift with <code>&gt;&gt;&gt;</code>, never <code>&gt;&gt;</code></li></ul>",
    starter: "function hammingWeight(n) {\n  // TODO: count the set bits without letting the sign bit trip you up\n}\n",
    hints: [
      "Write the obvious loop first, then ask what `n >> 1` does when n is 2147483648. The arithmetic shift preserves the sign bit, so the value never reaches 0.",
      "Use `>>>` instead. `n >>> 0` reinterprets the value as unsigned, and `n >>>= 1` always feeds a 0 in from the left, so the loop is guaranteed to end after at most 32 rounds.",
      "A neat alternative: `n &= n - 1` clears the lowest set bit each time, so the loop runs once per 1 bit — just keep the value unsigned with `>>> 0` between steps.",
    ],
    solution:
      "function hammingWeight(n) {\n  let x = n >>> 0;\n  let count = 0;\n  while (x !== 0) {\n    count += x & 1;\n    x >>>= 1;\n  }\n  return count;\n}\n",
    tests: [
      {
        name: "small value",
        body: "assert.equal(hammingWeight(11), 3);",
      },
      {
        name: "single high-ish bit",
        body: "assert.equal(hammingWeight(128), 1);",
      },
      {
        name: "zero has no set bits",
        body: "assert.equal(hammingWeight(0), 0);",
      },
      {
        name: "high bit set — the signed-32-bit trap",
        body: "assert.equal(hammingWeight(2147483648), 1);\nassert.equal(hammingWeight(4294967293), 31);",
      },
      {
        name: "all 32 bits set",
        body: "assert.equal(hammingWeight(4294967295), 32);",
      },
    ],
  },
{
    id: "ex-counting-bits",
    chapter: "dsa-bit-manipulation",
    level: "intermediate",
    title: "Counting Bits",
    brief:
      "<p>Given a non-negative integer <code>n</code>, return an array <code>ans</code> of length <code>n + 1</code> where <code>ans[i]</code> is the number of 1 bits in <code>i</code>.</p><ul><li>The whole array must be produced in <b>O(n)</b> total time</li><li>Calling a popcount routine per element is <code>O(n log n)</code> and does not count — each entry must be derived in <b>O(1)</b> from an entry you already computed</li><li><code>n = 0</code> is valid and yields <code>[0]</code></li></ul>",
    starter: "function countBits(n) {\n  // TODO: build the answer left to right, reusing earlier results\n}\n",
    hints: [
      "Write out the popcounts of 0..7 next to their binary forms and look for a smaller index whose answer is already in your array.",
      "Dropping the lowest bit of `i` gives `i >> 1`, which is always smaller than `i` — so its answer is already known.",
      "`ans[i] = ans[i >> 1] + (i & 1)`: the same bits shifted right, plus whichever bit fell off.",
    ],
    solution:
      "function countBits(n) {\n  const ans = new Array(n + 1).fill(0);\n  for (let i = 1; i <= n; i++) {\n    ans[i] = ans[i >> 1] + (i & 1);\n  }\n  return ans;\n}\n",
    tests: [
      {
        name: "counts up to 2",
        body: "assert.deepEqual(countBits(2), [0, 1, 1]);",
      },
      {
        name: "counts up to 5",
        body: "assert.deepEqual(countBits(5), [0, 1, 1, 2, 1, 2]);",
      },
      {
        name: "n is zero",
        body: "assert.deepEqual(countBits(0), [0]);",
      },
      {
        name: "powers of two have exactly one bit",
        body: "const ans = countBits(64);\nassert.equal(ans.length, 65);\nfor (const p of [1, 2, 4, 8, 16, 32, 64]) assert.equal(ans[p], 1);\nassert.equal(ans[63], 6);",
      },
      {
        name: "large n stays consistent with a reference count",
        body: "const ans = countBits(5000);\nassert.equal(ans.length, 5001);\nconst ref = (x) => { let c = 0; while (x) { c += x & 1; x >>>= 1; } return c; };\nfor (let i = 0; i <= 5000; i += 7) assert.equal(ans[i], ref(i));",
      },
    ],
  },
{
    id: "ex-reverse-bits",
    chapter: "dsa-bit-manipulation",
    level: "intermediate",
    title: "Reverse Bits",
    brief:
      "<p>Reverse the bits of an unsigned 32-bit integer <code>n</code> and return the resulting unsigned value. Bit 0 becomes bit 31, bit 1 becomes bit 30, and so on.</p><ul><li>Always treat the input as exactly <b>32 bits wide</b>, leading zeros included — <code>reverseBits(1)</code> is <code>2147483648</code>, not 1</li><li><b>The JS trap:</b> bitwise operators return a <em>signed</em> 32-bit result, so as soon as the reversal lands a 1 in bit 31 your accumulator goes negative. Finish with <code>result &gt;&gt;&gt; 0</code> to reinterpret it as unsigned.</li><li>Read individual bits with <code>&gt;&gt;&gt;</code>, never <code>&gt;&gt;</code></li></ul>",
    starter: "function reverseBits(n) {\n  // TODO: pull bits off one end and push them onto the other, 32 times\n}\n",
    hints: [
      "Loop exactly 32 times regardless of how big n is — the leading zeros are part of the answer.",
      "Each round: shift the accumulator left by one to make room, then OR in the next bit of n read with `(n >>> i) & 1`.",
      "Your accumulator will be a negative number the moment bit 31 gets set, because `<<` and `|` produce signed int32. Return `result >>> 0` — that single operator is what turns -1073741825 into 3221225471.",
    ],
    solution:
      "function reverseBits(n) {\n  let result = 0;\n  for (let i = 0; i < 32; i++) {\n    result = (result << 1) | ((n >>> i) & 1);\n  }\n  return result >>> 0;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.equal(reverseBits(43261596), 964176192);",
      },
      {
        name: "lowest bit becomes the highest",
        body: "assert.equal(reverseBits(1), 2147483648);",
      },
      {
        name: "highest bit becomes the lowest",
        body: "assert.equal(reverseBits(2147483648), 1);",
      },
      {
        name: "high-bit-set input must come back unsigned",
        body: "const out = reverseBits(4294967293);\nassert.equal(out, 3221225471);\nassert.ok(out > 0, 'result must be unsigned — did you forget >>> 0?');",
      },
      {
        name: "all zeros and all ones",
        body: "assert.equal(reverseBits(0), 0);\nassert.equal(reverseBits(4294967295), 4294967295);",
      },
    ],
  },
{
    id: "ex-power-of-two",
    chapter: "dsa-bit-manipulation",
    level: "beginner",
    title: "Power of Two",
    brief:
      "<p>Return <code>true</code> when the integer <code>n</code> is a power of two, i.e. <code>n === 2 ** k</code> for some integer <code>k &gt;= 0</code>.</p><ul><li>No loops, no division, no <code>Math.log</code> — a single bit trick decides it</li><li><code>n</code> fits in a signed 32-bit integer and may be zero or negative; both answer <code>false</code></li></ul>",
    starter: "function isPowerOfTwo(n) {\n  // TODO: a power of two has exactly one bit set\n}\n",
    hints: [
      "Write 8 and 7 in binary. Subtracting 1 from a power of two flips its single 1 to 0 and turns every bit below it into 1.",
      "So `n & (n - 1)` wipes out the lowest set bit. For a power of two that leaves 0.",
      "Guard the sign first: `n > 0 && (n & (n - 1)) === 0`. Without the guard, 0 and some negatives sneak through.",
    ],
    solution: "function isPowerOfTwo(n) {\n  return n > 0 && (n & (n - 1)) === 0;\n}\n",
    tests: [
      {
        name: "accepts powers of two",
        body: "assert.equal(isPowerOfTwo(1), true);\nassert.equal(isPowerOfTwo(16), true);\nassert.equal(isPowerOfTwo(1073741824), true);",
      },
      {
        name: "rejects non-powers",
        body: "assert.equal(isPowerOfTwo(3), false);\nassert.equal(isPowerOfTwo(6), false);\nassert.equal(isPowerOfTwo(1023), false);",
      },
      {
        name: "zero is not a power of two",
        body: "assert.equal(isPowerOfTwo(0), false);",
      },
      {
        name: "negatives are never powers of two",
        body: "assert.equal(isPowerOfTwo(-16), false);\nassert.equal(isPowerOfTwo(-1), false);",
      },
    ],
  },
{
    id: "ex-power-of-four",
    chapter: "dsa-bit-manipulation",
    level: "intermediate",
    title: "Power of Four",
    brief:
      "<p>Return <code>true</code> when the integer <code>n</code> is a power of four, i.e. <code>n === 4 ** k</code> for some integer <code>k &gt;= 0</code>.</p><ul><li>Solve it with bit operations only — no loops and no logarithms</li><li>Every power of four is a power of two, but not the other way round: 8 must answer <code>false</code></li><li><code>n</code> fits in a signed 32-bit integer and may be zero or negative</li></ul>",
    starter: "function isPowerOfFour(n) {\n  // TODO: one bit set, and it has to be in the right place\n}\n",
    hints: [
      "Start from the power-of-two test: exactly one bit set means `n > 0 && (n & (n - 1)) === 0`.",
      "Now list the powers of four in binary: 1, 100, 10000, 1000000. Their single bit always sits at an even index; powers of two that are not powers of four sit at an odd index.",
      "Mask against the constant with 1s at every even position, `0x55555555`, and require the result to be non-zero.",
    ],
    solution: "function isPowerOfFour(n) {\n  return n > 0 && (n & (n - 1)) === 0 && (n & 0x55555555) !== 0;\n}\n",
    tests: [
      {
        name: "accepts powers of four",
        body: "assert.equal(isPowerOfFour(1), true);\nassert.equal(isPowerOfFour(4), true);\nassert.equal(isPowerOfFour(16), true);\nassert.equal(isPowerOfFour(1073741824), true);",
      },
      {
        name: "rejects powers of two that are not powers of four",
        body: "assert.equal(isPowerOfFour(2), false);\nassert.equal(isPowerOfFour(8), false);\nassert.equal(isPowerOfFour(536870912), false);",
      },
      {
        name: "rejects ordinary numbers",
        body: "assert.equal(isPowerOfFour(5), false);\nassert.equal(isPowerOfFour(15), false);",
      },
      {
        name: "zero and negatives",
        body: "assert.equal(isPowerOfFour(0), false);\nassert.equal(isPowerOfFour(-4), false);",
      },
    ],
  },
{
    id: "ex-bitwise-and-of-range",
    chapter: "dsa-bit-manipulation",
    level: "advanced",
    title: "Bitwise AND of Numbers Range",
    brief:
      "<p>Given <code>left</code> and <code>right</code> with <code>0 &lt;= left &lt;= right &lt;= 2147483647</code>, return the bitwise AND of every integer in the inclusive range <code>[left, right]</code>.</p><ul><li>Looping over the range is far too slow — it can hold billions of values</li><li>The answer must come out in <b>O(number of bits)</b> time</li><li><code>left === right</code> is allowed and simply returns that value</li></ul>",
    starter:
      "function rangeBitwiseAnd(left, right) {\n  // TODO: no loop over the range — reason about which bits can survive\n}\n",
    hints: [
      "A bit survives the AND only if it is 1 in every single number of the range. Ask when a given bit is guaranteed never to flip between left and right.",
      "If left and right differ anywhere at or below some bit position, that bit must toggle to 0 somewhere inside the range — so the answer is exactly the common binary prefix of left and right, padded with zeros.",
      "Shift both values right until they are equal, counting the shifts, then shift the shared value back left by that count.",
    ],
    solution:
      "function rangeBitwiseAnd(left, right) {\n  let shift = 0;\n  while (left < right) {\n    left >>>= 1;\n    right >>>= 1;\n    shift++;\n  }\n  return left << shift;\n}\n",
    tests: [
      {
        name: "small range",
        body: "assert.equal(rangeBitwiseAnd(5, 7), 4);",
      },
      {
        name: "range that crosses a power of two",
        body: "assert.equal(rangeBitwiseAnd(26, 30), 24);",
      },
      {
        name: "single value range",
        body: "assert.equal(rangeBitwiseAnd(0, 0), 0);\nassert.equal(rangeBitwiseAnd(12, 12), 12);",
      },
      {
        name: "huge range collapses to zero without looping",
        body: "assert.equal(rangeBitwiseAnd(1, 2147483647), 0);",
      },
      {
        name: "adjacent values near the 32-bit ceiling",
        body: "assert.equal(rangeBitwiseAnd(2147483646, 2147483647), 2147483646);",
      },
    ],
  },
{
    id: "ex-sum-of-two-integers",
    chapter: "dsa-bit-manipulation",
    level: "advanced",
    title: "Sum of Two Integers",
    brief:
      "<p>Return <code>a + b</code> without using the <code>+</code> or <code>-</code> operators anywhere in your solution (that rules out <code>++</code>, <code>--</code>, <code>+=</code> and unary minus too).</p><ul><li>Both inputs fit in a signed 32-bit integer, and so does the result</li><li>Either input may be negative — negatives are stored in two's complement, and the same add-with-carry loop handles them with no special casing</li><li><b>Why it terminates:</b> JS bitwise operators wrap to 32 bits, so the carry keeps marching left and eventually falls off the top edge, reaching 0. Without that wrap a negative operand would loop forever.</li></ul>",
    starter: "function getSum(a, b) {\n  // TODO: add with XOR, carry with AND, repeat until there is no carry\n}\n",
    hints: [
      "Add two single bits by hand: 1 XOR 1 is 0 with a carry of 1. XOR is addition that forgets to carry; AND is exactly where the carries happen.",
      "So the sum-without-carry is `a ^ b` and the carry is `(a & b) << 1`. Feed those back in as the new a and b and repeat while b is non-zero.",
      "Because `&`, `^` and `<<` all truncate to 32 bits, a carry out of bit 31 is discarded — that is why the loop finishes even for something like getSum(-5, -7).",
    ],
    solution:
      "function getSum(a, b) {\n  while (b !== 0) {\n    const carry = (a & b) << 1;\n    a = a ^ b;\n    b = carry;\n  }\n  return a;\n}\n",
    tests: [
      {
        name: "two positives",
        body: "assert.equal(getSum(1, 2), 3);\nassert.equal(getSum(123, 456), 579);",
      },
      {
        name: "zero is the identity",
        body: "assert.equal(getSum(0, 0), 0);\nassert.equal(getSum(0, 42), 42);\nassert.equal(getSum(-42, 0), -42);",
      },
      {
        name: "negative plus positive — the carry loop must terminate",
        body: "assert.equal(getSum(-1, 1), 0);\nassert.equal(getSum(-2, 3), 1);\nassert.equal(getSum(7, -20), -13);",
      },
      {
        name: "two negatives",
        body: "assert.equal(getSum(-5, -7), -12);\nassert.equal(getSum(-1, -1), -2);",
      },
      {
        name: "at the edges of the 32-bit range",
        body: "assert.equal(getSum(2147483647, -1), 2147483646);\nassert.equal(getSum(-2147483648, 2147483647), -1);",
      },
    ],
  },
{
    id: "ex-divide-two-integers",
    chapter: "dsa-bit-manipulation",
    level: "advanced",
    title: "Divide Two Integers",
    brief:
      "<p>Divide <code>dividend</code> by <code>divisor</code> without using the <code>*</code>, <code>/</code> or <code>%</code> operators, and return the quotient.</p><ul><li>The quotient is <b>truncated toward zero</b>: <code>-7 / 2</code> is <code>-3</code>, not <code>-4</code></li><li>Both operands fit in the signed 32-bit range <code>[-2147483648, 2147483647]</code>, and the answer must be <b>clamped</b> to that range</li><li>Only one case can overflow: <code>divide(-2147483648, -1)</code> is mathematically 2147483648, so it must return <code>2147483647</code></li><li><code>divisor</code> is never 0</li></ul>",
    starter:
      "function divide(dividend, divisor) {\n  // TODO: repeated subtraction is too slow — subtract doubling chunks instead\n}\n",
    hints: [
      "Handle the sign once up front: work with the magnitudes and negate at the end if exactly one operand was negative. Deal with the -2147483648 / -1 overflow before anything else.",
      "Subtracting the divisor one at a time is O(quotient) and will time out. Instead, double the divisor (`chunk += chunk`) while it still fits in what remains, doubling a counter alongside it.",
      "Subtract the biggest such chunk, add its counter to the result, and repeat with the remainder. That is O(log n) rounds, and doubling with `+` keeps you clear of both `*` and 32-bit shift overflow.",
    ],
    solution:
      "function divide(dividend, divisor) {\n  if (dividend === -2147483648 && divisor === -1) return 2147483647;\n  const negative = dividend < 0 !== divisor < 0;\n  let remaining = Math.abs(dividend);\n  const d = Math.abs(divisor);\n  let result = 0;\n  while (remaining >= d) {\n    let chunk = d;\n    let count = 1;\n    while (remaining >= chunk + chunk) {\n      chunk += chunk;\n      count += count;\n    }\n    remaining -= chunk;\n    result += count;\n  }\n  if (negative) result = -result;\n  if (result > 2147483647) return 2147483647;\n  if (result < -2147483648) return -2147483648;\n  return result;\n}\n",
    tests: [
      {
        name: "exact and inexact positive division",
        body: "assert.equal(divide(10, 3), 3);\nassert.equal(divide(12, 4), 3);\nassert.equal(divide(1, 1), 1);",
      },
      {
        name: "truncates toward zero for negatives",
        body: "assert.equal(divide(7, -3), -2);\nassert.equal(divide(-7, 2), -3);\nassert.equal(divide(-10, -3), 3);",
      },
      {
        name: "zero dividend and divisor larger than dividend",
        body: "assert.equal(divide(0, 5), 0);\nassert.equal(divide(3, 7), 0);\nassert.equal(divide(-3, 7), 0);",
      },
      {
        name: "the overflow case must clamp",
        body: "assert.equal(divide(-2147483648, -1), 2147483647);\nassert.equal(divide(-2147483648, 1), -2147483648);",
      },
      {
        name: "large quotient must not be found by repeated subtraction",
        body: "assert.equal(divide(2147483647, 1), 2147483647);\nassert.equal(divide(-2147483648, 2), -1073741824);",
      },
    ],
  },
{
    id: "ex-subsets-bitmask",
    chapter: "dsa-backtracking",
    level: "intermediate",
    title: "Subsets",
    brief:
      "<p>Given an array <code>nums</code> of distinct integers, return every possible subset (the power set).</p><ul><li>Build the answer with a <b>bitmask</b>: count from 0 to <code>2**n - 1</code> and let bit <code>i</code> of the counter decide whether <code>nums[i]</code> is in that subset</li><li>The subsets, and the elements inside each subset, may be returned in <b>any order</b></li><li>The empty subset counts — <code>subsets([])</code> is <code>[[]]</code></li><li><code>nums.length</code> is at most 12</li></ul>",
    starter:
      "function subsets(nums) {\n  // TODO: one integer from 0 to 2**n - 1 per subset; its bits pick the members\n}\n",
    hints: [
      "There are exactly 2**n subsets, and exactly 2**n integers in [0, 2**n). Pair them up.",
      "`1 << n` gives you the loop bound. For each mask, walk i from 0 to n-1 and include nums[i] when `mask & (1 << i)` is non-zero.",
      "Mask 0 naturally produces the empty subset, so you get that case for free — no special handling needed.",
    ],
    solution:
      "function subsets(nums) {\n  const n = nums.length;\n  const out = [];\n  const total = 1 << n;\n  for (let mask = 0; mask < total; mask++) {\n    const subset = [];\n    for (let i = 0; i < n; i++) {\n      if (mask & (1 << i)) subset.push(nums[i]);\n    }\n    out.push(subset);\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "power set of three elements",
        body: "const norm = (r) => r.map((s) => JSON.stringify(s.slice().sort((a, b) => a - b))).sort();\nconst expected = [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]];\nassert.deepEqual(norm(subsets([1, 2, 3])), norm(expected));",
      },
      {
        name: "empty input yields the empty subset",
        body: "assert.deepEqual(subsets([]), [[]]);",
      },
      {
        name: "single element",
        body: "const norm = (r) => r.map((s) => JSON.stringify(s.slice().sort((a, b) => a - b))).sort();\nassert.deepEqual(norm(subsets([0])), norm([[], [0]]));",
      },
      {
        name: "handles negatives",
        body: "const norm = (r) => r.map((s) => JSON.stringify(s.slice().sort((a, b) => a - b))).sort();\nassert.deepEqual(norm(subsets([-1, 4])), norm([[], [-1], [4], [-1, 4]]));",
      },
      {
        name: "count and distinctness for a larger set",
        body: "const out = subsets([1, 2, 3, 4, 5]);\nassert.equal(out.length, 32);\nconst keys = new Set(out.map((s) => JSON.stringify(s.slice().sort((a, b) => a - b))));\nassert.equal(keys.size, 32);",
      },
    ],
  },
];
