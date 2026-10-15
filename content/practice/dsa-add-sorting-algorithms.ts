import type { Exercise } from "../types";

export const dsaAddSortingAlgorithms: Exercise[] = [
  {
    "id": "ex-three-way-partition",
    "chapter": "dsa-sorting-algorithms",
    "level": "beginner",
    "title": "Three-Way Partition Around a Pivot",
    "brief": "<p>Write <code>partition3(nums, pivot)</code> that rearranges <code>nums</code> <b>in place</b> into three blocks and returns <code>[lt, gt]</code>.</p><ul><li><code>nums[0 .. lt - 1]</code> are all <b>less than</b> <code>pivot</code></li><li><code>nums[lt .. gt]</code> are all <b>equal to</b> <code>pivot</code></li><li><code>nums[gt + 1 ..]</code> are all <b>greater than</b> <code>pivot</code></li><li>If no element equals the pivot, return <code>gt = lt - 1</code> (an empty middle block)</li><li>Do it in one pass with O(1) extra space, and do not use <code>sort</code></li><li>The order inside each block does not matter</li></ul>",
    "starter": "function partition3(nums, pivot) {\n  // TODO: keep lt, i and gt pointers; look at nums[i] and move it into its block\n}\n",
    "hints": [
      "Keep four regions: smaller, equal, not yet looked at, greater. Three pointers lt, i and gt mark the boundaries.",
      "If nums[i] is smaller, swap it with nums[lt] and advance both lt and i. If it is greater, swap it with nums[gt] and move gt left. If it is equal, just advance i.",
      "After swapping with nums[gt], do NOT advance i: the element that arrived has not been examined yet."
    ],
    "solution": "function partition3(nums, pivot) {\n  let lt = 0;\n  let i = 0;\n  let gt = nums.length - 1;\n  while (i <= gt) {\n    if (nums[i] < pivot) {\n      [nums[lt], nums[i]] = [nums[i], nums[lt]];\n      lt++;\n      i++;\n    } else if (nums[i] > pivot) {\n      [nums[i], nums[gt]] = [nums[gt], nums[i]];\n      gt--;\n    } else {\n      i++;\n    }\n  }\n  return [lt, gt];\n}\n",
    "tests": [
      {
        "name": "a mixed array",
        "body": "const a = [4, 1, 3, 5, 3, 2, 3];\nconst [lt, gt] = partition3(a, 3);\nassert.equal(lt, 2);\nassert.equal(gt, 4);\nassert.deepEqual(a.slice(0, lt).sort((x, y) => x - y), [1, 2]);\nassert.deepEqual(a.slice(lt, gt + 1), [3, 3, 3]);\nassert.deepEqual(a.slice(gt + 1).sort((x, y) => x - y), [4, 5]);"
      },
      {
        "name": "every element equals the pivot",
        "body": "const a = [7, 7, 7, 7];\nassert.deepEqual(partition3(a, 7), [0, 3]);\nassert.deepEqual(a, [7, 7, 7, 7]);"
      },
      {
        "name": "no element equals the pivot",
        "body": "const a = [5, 1, 4, 2];\nconst [lt, gt] = partition3(a, 3);\nassert.equal(gt, lt - 1);\nassert.equal(lt, 2);\nassert.ok(a.slice(0, lt).every((x) => x < 3));\nassert.ok(a.slice(lt).every((x) => x > 3));"
      },
      {
        "name": "all smaller or all greater",
        "body": "const small = [1, 2, 0];\nassert.deepEqual(partition3(small, 9), [3, 2]);\nconst big = [8, 9, 10];\nassert.deepEqual(partition3(big, 1), [0, -1]);"
      },
      {
        "name": "empty and single-element arrays",
        "body": "assert.deepEqual(partition3([], 5), [0, -1]);\nconst one = [5];\nassert.deepEqual(partition3(one, 5), [0, 0]);\nassert.deepEqual(partition3([4], 5), [1, 0]);"
      },
      {
        "name": "an element swapped in from the end is still examined",
        "body": "const a = [4, 5, 1];\nconst [lt, gt] = partition3(a, 3);\nassert.equal(lt, 1);\nassert.equal(gt, 0);\nassert.equal(a[0], 1);"
      },
      {
        "name": "the array is changed in place and keeps the same elements",
        "body": "const a = [3, 1, 2, 3, 0, 5, 3];\nconst before = a.slice().sort((x, y) => x - y);\nconst result = partition3(a, 3);\nassert.equal(result.length, 2);\nassert.deepEqual(a.slice().sort((x, y) => x - y), before);"
      },
      {
        "name": "random arrays satisfy the three-block rule",
        "body": "let seed = 5;\nconst rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) >> 4);\nfor (let t = 0; t < 300; t++) {\n  const n = rnd() % 30;\n  const a = Array.from({ length: n }, () => (rnd() % 7) - 3);\n  const pivot = (rnd() % 7) - 3;\n  const total = a.slice().sort((x, y) => x - y);\n  const [lt, gt] = partition3(a, pivot);\n  a.forEach((v, i) => {\n    if (i < lt) assert.ok(v < pivot, 'left block');\n    else if (i <= gt) assert.equal(v, pivot);\n    else assert.ok(v > pivot, 'right block');\n  });\n  assert.deepEqual(a.slice().sort((x, y) => x - y), total);\n}"
      }
    ]
  },
  {
    "id": "ex-kth-smallest-many-duplicates",
    "chapter": "dsa-sorting-algorithms",
    "level": "intermediate",
    "title": "k-th Smallest With Many Duplicates",
    "brief": "<p>Return the <code>k</code>-th smallest value of <code>nums</code>, where <code>k</code> is <b>1-based</b> (<code>k = 1</code> is the minimum) and equal values count separately: in <code>[2, 2, 3]</code> the 2nd smallest is <code>2</code>.</p><ul><li>Do not modify <code>nums</code></li><li><code>1 &lt;= k &lt;= nums.length</code></li><li>Aim for O(n) on average with quickselect. Inputs can have 300,000 elements, including arrays where <b>every value is equal</b>, which makes a two-way (Lomuto) partition take quadratic time</li></ul>",
    "starter": "function kthSmallest(nums, k) {\n  // TODO: quickselect on a copy, with a three-way partition and a random pivot\n}\n",
    "hints": [
      "Copy the array, then repeat: pick a random pivot value in the current range [lo, hi] and partition it into less-than, equal and greater-than blocks.",
      "Let the target index be k - 1. If it is left of the equal block, continue in the left part; if right of it, continue in the right part; if inside the block, the answer is the pivot.",
      "The equal block is what rescues all-equal input: the target always lands inside it on the first round."
    ],
    "solution": "function kthSmallest(nums, k) {\n  const arr = nums.slice();\n  const target = k - 1;\n  let lo = 0;\n  let hi = arr.length - 1;\n  while (lo < hi) {\n    const pivot = arr[lo + Math.floor(Math.random() * (hi - lo + 1))];\n    let lt = lo;\n    let i = lo;\n    let gt = hi;\n    while (i <= gt) {\n      if (arr[i] < pivot) {\n        [arr[lt], arr[i]] = [arr[i], arr[lt]];\n        lt++;\n        i++;\n      } else if (arr[i] > pivot) {\n        [arr[i], arr[gt]] = [arr[gt], arr[i]];\n        gt--;\n      } else {\n        i++;\n      }\n    }\n    if (target < lt) hi = lt - 1;\n    else if (target > gt) lo = gt + 1;\n    else return pivot;\n  }\n  return arr[target];\n}\n",
    "tests": [
      {
        "name": "small examples",
        "body": "assert.equal(kthSmallest([3, 2, 1, 5, 6, 4], 2), 2);\nassert.equal(kthSmallest([7, 10, 4, 3, 20, 15], 3), 7);"
      },
      {
        "name": "the minimum and the maximum",
        "body": "const a = [9, 4, 7, 1, 8];\nassert.equal(kthSmallest(a, 1), 1);\nassert.equal(kthSmallest(a, 5), 9);"
      },
      {
        "name": "equal values count separately",
        "body": "assert.equal(kthSmallest([2, 2, 3], 2), 2);\nassert.equal(kthSmallest([2, 2, 3], 3), 3);\nassert.equal(kthSmallest([1, 1, 1, 1], 4), 1);"
      },
      {
        "name": "a single element",
        "body": "assert.equal(kthSmallest([42], 1), 42);"
      },
      {
        "name": "negative numbers",
        "body": "assert.equal(kthSmallest([-5, 3, -1, 0, -9], 2), -5);\nassert.equal(kthSmallest([-5, 3, -1, 0, -9], 5), 3);"
      },
      {
        "name": "the input is left unchanged",
        "body": "const a = [5, 3, 8, 1];\nassert.equal(kthSmallest(a, 2), 3);\nassert.deepEqual(a, [5, 3, 8, 1]);"
      },
      {
        "name": "random arrays with duplicates agree with sorting",
        "body": "let seed = 3;\nconst rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) >> 4);\nfor (let t = 0; t < 300; t++) {\n  const n = 1 + (rnd() % 40);\n  const a = Array.from({ length: n }, () => (rnd() % 6) - 2);\n  const sorted = a.slice().sort((x, y) => x - y);\n  const k = 1 + (rnd() % n);\n  assert.equal(kthSmallest(a, k), sorted[k - 1]);\n}"
      },
      {
        "name": "300,000 equal values finish quickly",
        "body": "const a = new Array(300000).fill(5);\nassert.equal(kthSmallest(a, 150000), 5);"
      },
      {
        "name": "300,000 values with only three distinct numbers",
        "body": "const a = Array.from({ length: 300000 }, (_, i) => i % 3);\nassert.equal(kthSmallest(a, 1), 0);\nassert.equal(kthSmallest(a, 150000), 1);\nassert.equal(kthSmallest(a, 300000), 2);"
      }
    ]
  },
  {
    "id": "ex-sort-by-multiple-keys",
    "chapter": "dsa-sorting-algorithms",
    "level": "beginner",
    "title": "Sort Employees by Several Keys",
    "brief": "<p>Each employee is an object <code>{ name, dept, salary }</code>. Return a <b>new</b> array sorted by:</p><ol><li><code>dept</code>, ascending</li><li>then <code>salary</code>, <b>descending</b></li><li>then <code>name</code>, ascending</li></ol><ul><li>Compare strings by plain character order (<code>&lt;</code> and <code>&gt;</code>), so <code>\"B\"</code> comes before <code>\"a\"</code>; do not use <code>localeCompare</code></li><li>Do not modify the input array</li><li>Write one comparator that chains the keys</li></ul>",
    "starter": "function sortEmployees(list) {\n  // TODO: copy the array, then sort with a comparator that falls through to the next key on a tie\n}\n",
    "hints": [
      "Array.prototype.sort sorts in place, so copy first with slice() or spread.",
      "A comparator returns negative, zero or positive. Compare the first key; if it ties (zero), compare the second, and so on.",
      "Descending order is the same comparison with the two arguments swapped. For strings, return -1, 1 or 0 explicitly since you cannot subtract them."
    ],
    "solution": "function sortEmployees(list) {\n  const text = (a, b) => (a < b ? -1 : a > b ? 1 : 0);\n  return list.slice().sort((a, b) => text(a.dept, b.dept) || b.salary - a.salary || text(a.name, b.name));\n}\n",
    "tests": [
      {
        "name": "sorts by department first",
        "body": "const out = sortEmployees([\n  { name: 'Zoe', dept: 'ops', salary: 50 },\n  { name: 'Al', dept: 'eng', salary: 10 },\n]);\nassert.deepEqual(out.map((e) => e.name), ['Al', 'Zoe']);"
      },
      {
        "name": "higher salary first within a department",
        "body": "const out = sortEmployees([\n  { name: 'Cy', dept: 'eng', salary: 70 },\n  { name: 'Al', dept: 'eng', salary: 90 },\n]);\nassert.deepEqual(out.map((e) => e.name), ['Al', 'Cy']);"
      },
      {
        "name": "name breaks the remaining ties",
        "body": "const out = sortEmployees([\n  { name: 'Bo', dept: 'eng', salary: 90 },\n  { name: 'Al', dept: 'eng', salary: 90 },\n]);\nassert.deepEqual(out.map((e) => e.name), ['Al', 'Bo']);"
      },
      {
        "name": "all three keys together",
        "body": "const out = sortEmployees([\n  { name: 'Zoe', dept: 'ops', salary: 50 },\n  { name: 'Al', dept: 'eng', salary: 90 },\n  { name: 'Bo', dept: 'eng', salary: 90 },\n  { name: 'Cy', dept: 'eng', salary: 70 },\n]);\nassert.deepEqual(out.map((e) => e.name), ['Al', 'Bo', 'Cy', 'Zoe']);"
      },
      {
        "name": "uppercase sorts before lowercase",
        "body": "const out = sortEmployees([\n  { name: 'a', dept: 'x', salary: 1 },\n  { name: 'B', dept: 'x', salary: 1 },\n]);\nassert.deepEqual(out.map((e) => e.name), ['B', 'a']);"
      },
      {
        "name": "the input array is not modified",
        "body": "const input = [\n  { name: 'Zoe', dept: 'ops', salary: 50 },\n  { name: 'Al', dept: 'eng', salary: 90 },\n];\nconst snapshot = input.map((e) => e.name);\nconst out = sortEmployees(input);\nassert.deepEqual(out.map((e) => e.name), ['Al', 'Zoe']);\nassert.deepEqual(input.map((e) => e.name), snapshot);"
      },
      {
        "name": "empty and single-element lists",
        "body": "assert.deepEqual(sortEmployees([]), []);\nconst one = { name: 'A', dept: 'd', salary: 1 };\nassert.deepEqual(sortEmployees([one]), [one]);"
      },
      {
        "name": "salaries are compared as numbers, not text",
        "body": "const out = sortEmployees([\n  { name: 'A', dept: 'd', salary: 9 },\n  { name: 'B', dept: 'd', salary: 100 },\n]);\nassert.deepEqual(out.map((e) => e.name), ['B', 'A']);"
      }
    ]
  },
  {
    "id": "ex-sort-version-numbers",
    "chapter": "dsa-sorting-algorithms",
    "level": "beginner",
    "title": "Sort Version Numbers",
    "brief": "<p>Write <code>sortVersions(versions)</code> that returns a <b>new</b> array of version strings in ascending order. A version is dot-separated non-negative integers such as <code>\"1.10.2\"</code>.</p><ul><li>Compare part by part as <b>numbers</b>: <code>\"1.10\"</code> is newer than <code>\"1.9\"</code></li><li>A missing part counts as <code>0</code>, so <code>\"1.2\"</code> and <code>\"1.2.0\"</code> are equal; equal versions must keep their original relative order</li><li>Versions can have different numbers of parts</li><li>Do not modify the input</li></ul>",
    "starter": "function sortVersions(versions) {\n  // TODO: copy, then sort with a comparator that walks the parts as numbers\n}\n",
    "hints": [
      "Split each version on '.' and convert the parts with Number. Comparing the strings directly would put '1.10' before '1.9'.",
      "Walk both part lists up to the longer length; treat a missing part as 0, and return the first non-zero difference.",
      "Return 0 when every part ties: the built-in sort is stable, so equal versions then keep their order."
    ],
    "solution": "function sortVersions(versions) {\n  const parts = (v) => v.split('.').map(Number);\n  return versions.slice().sort((a, b) => {\n    const x = parts(a);\n    const y = parts(b);\n    const length = Math.max(x.length, y.length);\n    for (let i = 0; i < length; i++) {\n      const diff = (x[i] ?? 0) - (y[i] ?? 0);\n      if (diff !== 0) return diff;\n    }\n    return 0;\n  });\n}\n",
    "tests": [
      {
        "name": "numeric, not alphabetical, order",
        "body": "assert.deepEqual(sortVersions(['1.10', '1.9', '1.2']), ['1.2', '1.9', '1.10']);"
      },
      {
        "name": "three-part versions",
        "body": "assert.deepEqual(sortVersions(['1.10.0', '1.2.0', '1.9.3']), ['1.2.0', '1.9.3', '1.10.0']);"
      },
      {
        "name": "a missing part counts as zero and ties keep their order",
        "body": "assert.deepEqual(sortVersions(['1.2.0', '1.2', '1.1']), ['1.1', '1.2.0', '1.2']);\nassert.deepEqual(sortVersions(['1.2', '1.2.0']), ['1.2', '1.2.0']);"
      },
      {
        "name": "different lengths",
        "body": "assert.deepEqual(sortVersions(['2', '1.5.5.5', '1.5', '1.5.0.1']), ['1.5', '1.5.0.1', '1.5.5.5', '2']);"
      },
      {
        "name": "large numbers in a part",
        "body": "assert.deepEqual(sortVersions(['0.100', '0.99', '0.1000']), ['0.99', '0.100', '0.1000']);"
      },
      {
        "name": "the input is not modified",
        "body": "const input = ['2.0', '1.0'];\nassert.deepEqual(sortVersions(input), ['1.0', '2.0']);\nassert.deepEqual(input, ['2.0', '1.0']);"
      },
      {
        "name": "empty and single-element lists",
        "body": "assert.deepEqual(sortVersions([]), []);\nassert.deepEqual(sortVersions(['3.1']), ['3.1']);"
      }
    ]
  },
  {
    "id": "ex-radix-sort",
    "chapter": "dsa-sorting-algorithms",
    "level": "intermediate",
    "title": "Radix Sort",
    "brief": "<p>Write <code>radixSort(nums)</code> that returns a new array of the non-negative integers in <code>nums</code> in ascending order, using <b>LSD radix sort</b>: one stable counting-sort pass per decimal digit, from the ones digit upward.</p><ul><li>Do not use <code>Array.prototype.sort</code> (a test makes it throw)</li><li>Each pass must be <b>stable</b>, otherwise earlier passes are undone</li><li>Integers can be as large as <code>2 ** 53 - 1</code>; an empty array and arrays of zeros must work</li><li>Do not modify the input</li></ul>",
    "starter": "function radixSort(nums) {\n  // TODO: for each digit place: count digits, turn counts into end positions, place items from the back\n}\n",
    "hints": [
      "Find the largest value; you need one pass for each of its decimal digits, so loop with place = 1, 10, 100, ... while max / place is at least 1.",
      "In each pass, count how many items have each digit 0 to 9, then turn the counts into running totals so counts[d] is where the digits-equal-to-d block ends.",
      "Walk the input from the LAST element to the first, placing each item at --counts[digit]. That backwards walk is what keeps the pass stable."
    ],
    "solution": "function radixSort(nums) {\n  let out = nums.slice();\n  const max = out.reduce((m, x) => Math.max(m, x), 0);\n  for (let place = 1; Math.floor(max / place) > 0; place *= 10) {\n    const counts = new Array(10).fill(0);\n    for (const x of out) counts[Math.floor(x / place) % 10]++;\n    for (let d = 1; d < 10; d++) counts[d] += counts[d - 1];\n    const next = new Array(out.length);\n    for (let i = out.length - 1; i >= 0; i--) {\n      const d = Math.floor(out[i] / place) % 10;\n      next[--counts[d]] = out[i];\n    }\n    out = next;\n  }\n  return out;\n}\n",
    "tests": [
      {
        "name": "the textbook example",
        "body": "assert.deepEqual(radixSort([170, 45, 75, 90, 802, 24, 2, 66]), [2, 24, 45, 66, 75, 90, 170, 802]);"
      },
      {
        "name": "empty and single-element arrays",
        "body": "assert.deepEqual(radixSort([]), []);\nassert.deepEqual(radixSort([7]), [7]);"
      },
      {
        "name": "zeros and duplicates",
        "body": "assert.deepEqual(radixSort([0, 0, 0]), [0, 0, 0]);\nassert.deepEqual(radixSort([5, 3, 5, 3, 0]), [0, 3, 3, 5, 5]);"
      },
      {
        "name": "numbers with different digit counts",
        "body": "assert.deepEqual(radixSort([1000, 1, 100, 10, 99999, 9]), [1, 9, 10, 100, 1000, 99999]);"
      },
      {
        "name": "the input array is not modified",
        "body": "const a = [3, 1, 2];\nassert.deepEqual(radixSort(a), [1, 2, 3]);\nassert.deepEqual(a, [3, 1, 2]);"
      },
      {
        "name": "very large integers",
        "body": "const big = Number.MAX_SAFE_INTEGER;\nassert.deepEqual(radixSort([big, 0, 2 ** 40, big - 1, 1]), [0, 1, 2 ** 40, big - 1, big]);"
      },
      {
        "name": "it does not use the built-in sort",
        "body": "const original = Array.prototype.sort;\nArray.prototype.sort = function () { throw new Error('Array.prototype.sort was called'); };\ntry {\n  assert.deepEqual(radixSort([3, 1, 2, 10, 0]), [0, 1, 2, 3, 10]);\n} finally {\n  Array.prototype.sort = original;\n}"
      },
      {
        "name": "random arrays agree with the built-in sort",
        "body": "let seed = 17;\nconst rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) >> 2);\nfor (let t = 0; t < 200; t++) {\n  const n = rnd() % 60;\n  const range = [10, 1000, 1000000, 2 ** 31][t % 4];\n  const a = Array.from({ length: n }, () => rnd() % range);\n  assert.deepEqual(radixSort(a), a.slice().sort((x, y) => x - y));\n}"
      },
      {
        "name": "a hundred thousand numbers",
        "body": "let seed = 1;\nconst a = Array.from({ length: 100000 }, () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) >> 2) % 1000000000);\nconst out = radixSort(a);\nassert.equal(out.length, 100000);\nfor (let i = 1; i < out.length; i++) assert.ok(out[i - 1] <= out[i]);"
      }
    ]
  },
  {
    "id": "ex-merge-sort-stable-records",
    "chapter": "dsa-sorting-algorithms",
    "level": "intermediate",
    "title": "Stable Merge Sort by a Numeric Key",
    "brief": "<p>Write <code>mergeSortBy(records, key)</code> that returns a <b>new</b> array of the objects in <code>records</code> sorted ascending by the numeric property named <code>key</code>.</p><ul><li>Implement a merge sort over <b>index ranges</b> with a single scratch buffer; do not slice the array on every call and do not use <code>Array.prototype.sort</code> (a test makes it throw)</li><li>The sort must be <b>stable</b>: records with equal keys keep their original relative order</li><li>The input array must not be modified</li><li>Up to 100,000 records</li></ul>",
    "starter": "function mergeSortBy(records, key) {\n  // TODO: copy the array, then sort the half-open range [0, n) recursively with one aux buffer\n}\n",
    "hints": [
      "Describe each subproblem by a half-open range [lo, hi): it is already sorted when hi - lo is at most 1, and mid splits it into [lo, mid) and [mid, hi).",
      "To merge, copy the range into aux, then fill arr[lo..hi) by repeatedly taking the smaller front element from the two halves of aux.",
      "Take from the right half only when its key is STRICTLY smaller. On a tie take the left one; that single choice makes the sort stable."
    ],
    "solution": "function mergeSortBy(records, key) {\n  const arr = records.slice();\n  const aux = new Array(arr.length);\n  function sortRange(lo, hi) {\n    if (hi - lo <= 1) return;\n    const mid = lo + ((hi - lo) >> 1);\n    sortRange(lo, mid);\n    sortRange(mid, hi);\n    for (let k = lo; k < hi; k++) aux[k] = arr[k];\n    let i = lo;\n    let j = mid;\n    for (let k = lo; k < hi; k++) {\n      if (i === mid) arr[k] = aux[j++];\n      else if (j === hi) arr[k] = aux[i++];\n      else if (aux[j][key] < aux[i][key]) arr[k] = aux[j++];\n      else arr[k] = aux[i++];\n    }\n  }\n  sortRange(0, arr.length);\n  return arr;\n}\n",
    "tests": [
      {
        "name": "sorts by the named key",
        "body": "const out = mergeSortBy([{ n: 'c', age: 30 }, { n: 'a', age: 10 }, { n: 'b', age: 20 }], 'age');\nassert.deepEqual(out.map((r) => r.n), ['a', 'b', 'c']);"
      },
      {
        "name": "equal keys keep their original order",
        "body": "const out = mergeSortBy([{ n: 'a', k: 2 }, { n: 'b', k: 1 }, { n: 'c', k: 2 }, { n: 'd', k: 1 }, { n: 'e', k: 2 }], 'k');\nassert.deepEqual(out.map((r) => r.n), ['b', 'd', 'a', 'c', 'e']);"
      },
      {
        "name": "empty and single-element arrays",
        "body": "assert.deepEqual(mergeSortBy([], 'k'), []);\nconst one = [{ k: 1 }];\nassert.deepEqual(mergeSortBy(one, 'k'), [{ k: 1 }]);"
      },
      {
        "name": "negative and decimal keys",
        "body": "const out = mergeSortBy([{ k: 0.5 }, { k: -3 }, { k: 2 }, { k: -0.25 }], 'k');\nassert.deepEqual(out.map((r) => r.k), [-3, -0.25, 0.5, 2]);"
      },
      {
        "name": "the input array is not modified",
        "body": "const input = [{ k: 3 }, { k: 1 }, { k: 2 }];\nconst out = mergeSortBy(input, 'k');\nassert.deepEqual(out.map((r) => r.k), [1, 2, 3]);\nassert.deepEqual(input.map((r) => r.k), [3, 1, 2]);\nassert.ok(out !== input);"
      },
      {
        "name": "it does not use the built-in sort",
        "body": "const original = Array.prototype.sort;\nArray.prototype.sort = function () { throw new Error('Array.prototype.sort was called'); };\ntry {\n  assert.deepEqual(mergeSortBy([{ k: 2 }, { k: 1 }], 'k').map((r) => r.k), [1, 2]);\n} finally {\n  Array.prototype.sort = original;\n}"
      },
      {
        "name": "random records are sorted and stable",
        "body": "let seed = 21;\nconst rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) >> 3);\nconst records = Array.from({ length: 2000 }, (_, id) => ({ id, k: rnd() % 12 }));\nconst out = mergeSortBy(records, 'k');\nassert.equal(out.length, 2000);\nfor (let i = 1; i < out.length; i++) {\n  const a = out[i - 1];\n  const b = out[i];\n  assert.ok(a.k < b.k || (a.k === b.k && a.id < b.id), 'out of order or unstable at ' + i);\n}"
      },
      {
        "name": "a hundred thousand records",
        "body": "const records = Array.from({ length: 100000 }, (_, id) => ({ id, k: (id * 7919) % 1000 }));\nconst out = mergeSortBy(records, 'k');\nfor (let i = 1; i < out.length; i++) assert.ok(out[i - 1].k <= out[i].k);"
      }
    ]
  },
];
