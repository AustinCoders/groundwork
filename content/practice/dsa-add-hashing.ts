import type { Exercise } from "../types";

export const dsaAddHashing: Exercise[] = [
{
  "id": "ex-contains-duplicate-ii",
  "chapter": "dsa-hashing",
  "level": "beginner",
  "title": "Contains Duplicate II",
  "brief": "<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return <code>true</code> if there are two <b>different</b> indexes <code>i</code> and <code>j</code> with <code>nums[i] === nums[j]</code> and <code>|i - j| &lt;= k</code>, otherwise <code>false</code>.</p><ul><li><code>[1, 2, 3, 1]</code> with <code>k = 3</code> is <code>true</code></li><li><code>[1, 2, 3, 1, 2, 3]</code> with <code>k = 2</code> is <code>false</code></li><li><code>k = 0</code> can never match, because the two indexes must differ</li><li>Target: O(n) time. Checking every pair is O(n²) and will be too slow for the large test</li></ul>",
  "starter": "function containsNearbyDuplicate(nums, k) {\n  // TODO: remember where each value was seen most recently\n}\n",
  "hints": [
    "For a given position, the only earlier copy that can help is the closest one: if the closest copy is too far away, every older copy is even farther.",
    "Keep a Map from value to the last index where it was seen. Compare i with that index before you overwrite it.",
    "Overwrite the stored index every time you see the value (not just the first time), so the Map always holds the nearest previous copy."
  ],
  "solution": "function containsNearbyDuplicate(nums, k) {\n  const lastIndex = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    if (lastIndex.has(nums[i]) && i - lastIndex.get(nums[i]) <= k) return true;\n    lastIndex.set(nums[i], i);\n  }\n  return false;\n}\n",
  "tests": [
    {
      "name": "a close pair",
      "body": "assert.equal(containsNearbyDuplicate([1, 2, 3, 1], 3), true);\nassert.equal(containsNearbyDuplicate([1, 0, 1, 1], 1), true);"
    },
    {
      "name": "pairs that are all too far apart",
      "body": "assert.equal(containsNearbyDuplicate([1, 2, 3, 1, 2, 3], 2), false);"
    },
    {
      "name": "k = 0 can never match",
      "body": "assert.equal(containsNearbyDuplicate([1, 1, 1], 0), false);"
    },
    {
      "name": "empty and single-element arrays",
      "body": "assert.equal(containsNearbyDuplicate([], 5), false);\nassert.equal(containsNearbyDuplicate([7], 5), false);"
    },
    {
      "name": "the nearest copy must be used, not the first",
      "body": "assert.equal(containsNearbyDuplicate([9, 4, 9, 9], 1), true);\nassert.equal(containsNearbyDuplicate([1, 2, 1, 3, 4, 1], 2), true);"
    },
    {
      "name": "a huge k allows any pair",
      "body": "assert.equal(containsNearbyDuplicate([5, 1, 2, 3, 4, 5], 1000000), true);\nassert.equal(containsNearbyDuplicate([1, 2, 3, 4, 5], 1000000), false);"
    },
    {
      "name": "agrees with the all-pairs brute force on random input",
      "body": "let seed = 4242;\nconst rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };\nconst brute = (a, k) => {\n  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] === a[j] && j - i <= k) return true;\n  return false;\n};\nfor (let t = 0; t < 500; t++) {\n  const a = Array.from({ length: rand(12) }, () => rand(6));\n  const k = rand(7);\n  assert.equal(containsNearbyDuplicate(a, k), brute(a, k), JSON.stringify([a, k]));\n}"
    },
    {
      "name": "a large input needs the linear solution",
      "body": "const n = 200000;\nconst a = Array.from({ length: n }, (_, i) => i);\nassert.equal(containsNearbyDuplicate(a, n), false);\na.push(0);\nassert.equal(containsNearbyDuplicate(a, n), true);\nassert.equal(containsNearbyDuplicate(a, n - 1), false);"
    }
  ]
},
{
  "id": "ex-four-sum-ii",
  "chapter": "dsa-hashing",
  "level": "intermediate",
  "title": "4Sum II",
  "brief": "<p>Given four integer arrays <code>a</code>, <code>b</code>, <code>c</code> and <code>d</code>, all of the same length <code>n</code>, return the number of tuples <code>(i, j, k, l)</code> such that <code>a[i] + b[j] + c[k] + d[l] === 0</code>.</p><ul><li><code>a = [1, 2]</code>, <code>b = [-2, -1]</code>, <code>c = [-1, 2]</code>, <code>d = [0, 2]</code> returns <code>2</code></li><li>Different index tuples count separately even when the values repeat</li><li>Four nested loops are O(n<sup>4</sup>); the tests use n = 400, so aim for O(n<sup>2</sup>)</li></ul>",
  "starter": "function fourSumCount(a, b, c, d) {\n  // TODO: split into two halves and meet in the middle with a Map\n}\n",
  "hints": [
    "Group the four arrays into two pairs. The tuple works exactly when (a[i] + b[j]) is the negative of (c[k] + d[l]).",
    "Store every a + b sum in a Map with how many times it occurs. That is n^2 entries at most.",
    "For every c + d sum, add the stored count of its negative. A missing key counts as 0."
  ],
  "solution": "function fourSumCount(a, b, c, d) {\n  const sums = new Map();\n  for (const x of a) {\n    for (const y of b) {\n      sums.set(x + y, (sums.get(x + y) || 0) + 1);\n    }\n  }\n  let count = 0;\n  for (const x of c) {\n    for (const y of d) {\n      count += sums.get(-(x + y)) || 0;\n    }\n  }\n  return count;\n}\n",
  "tests": [
    {
      "name": "the standard example",
      "body": "assert.equal(fourSumCount([1, 2], [-2, -1], [-1, 2], [0, 2]), 2);"
    },
    {
      "name": "all zeros",
      "body": "assert.equal(fourSumCount([0], [0], [0], [0]), 1);\nassert.equal(fourSumCount([0, 0], [0, 0], [0, 0], [0, 0]), 16);"
    },
    {
      "name": "empty arrays",
      "body": "assert.equal(fourSumCount([], [], [], []), 0);"
    },
    {
      "name": "no tuple sums to zero",
      "body": "assert.equal(fourSumCount([1], [1], [1], [1]), 0);"
    },
    {
      "name": "negative zero must still match zero",
      "body": "assert.equal(fourSumCount([1], [-1], [2], [-2]), 1);"
    },
    {
      "name": "repeated values count once per index tuple",
      "body": "assert.equal(fourSumCount([1, 1], [-1], [3], [-3, -3]), 4);"
    },
    {
      "name": "agrees with the four-loop brute force on random input",
      "body": "let seed = 4242;\nconst rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };\nfor (let t = 0; t < 300; t++) {\n  const n = rand(5);\n  const [a, b, c, d] = [0, 1, 2, 3].map(() => Array.from({ length: n }, () => rand(7) - 3));\n  let want = 0;\n  for (const w of a) for (const x of b) for (const y of c) for (const z of d) if (w + x + y + z === 0) want++;\n  assert.equal(fourSumCount(a, b, c, d), want, JSON.stringify([a, b, c, d]));\n}"
    },
    {
      "name": "n = 400 finishes quickly",
      "body": "const n = 400;\nconst make = (shift) => Array.from({ length: n }, (_, i) => ((i * 37 + shift) % 101) - 50);\nconst got = fourSumCount(make(1), make(2), make(3), make(4));\nassert.type(got, \"number\");\nassert.ok(got > 0);"
    }
  ]
},
{
  "id": "ex-group-shifted-strings",
  "chapter": "dsa-hashing",
  "level": "intermediate",
  "title": "Group Shifted Strings",
  "brief": "<p>A string can be <b>shifted</b> by replacing every letter with the next letter of the alphabet (with <code>z</code> wrapping to <code>a</code>). So <code>\"abc\"</code> shifts to <code>\"bcd\"</code>, and <code>\"az\"</code> shifts to <code>\"ba\"</code>. Two strings belong to the same group if one can be shifted into the other any number of times.</p><p>Write <code>groupShiftedStrings(strings)</code> that returns the groups as an array of arrays, in any order.</p><ul><li>All strings use lowercase letters only</li><li>Strings of different lengths are never in the same group</li><li>Single letters all belong together, because <code>\"a\"</code> shifts to <code>\"b\"</code> and so on</li><li>Build a canonical key for each string, then group by key</li></ul>",
  "starter": "function groupShiftedStrings(strings) {\n  // TODO: a key that is the same for every shift of a string\n}\n",
  "hints": [
    "Shifting every letter by the same amount keeps the gaps between neighbouring letters unchanged. Describe a string by those gaps instead of the letters.",
    "The gap from one letter to the next is (code(next) - code(prev) + 26) % 26. The + 26 and the modulo make 'az' and 'ba' agree.",
    "Join the gaps with a separator (such as a comma) to build the key, because gaps like 1, 11 and 11, 1 must not collapse into the same text. Group strings in a Map from key to array. Remember that one-letter strings have an empty key, and that is fine."
  ],
  "solution": "function groupShiftedStrings(strings) {\n  const groups = new Map();\n  for (const word of strings) {\n    const gaps = [];\n    for (let i = 1; i < word.length; i++) {\n      gaps.push((word.charCodeAt(i) - word.charCodeAt(i - 1) + 26) % 26);\n    }\n    const key = word.length + \":\" + gaps.join(\",\");\n    if (!groups.has(key)) groups.set(key, []);\n    groups.get(key).push(word);\n  }\n  return [...groups.values()];\n}\n",
  "tests": [
    {
      "name": "the standard example",
      "body": "const norm = (gs) => gs.map((g) => g.slice().sort().join(\"|\")).sort();\nconst got = groupShiftedStrings([\"abc\", \"bcd\", \"acef\", \"xyz\", \"az\", \"ba\", \"a\", \"z\"]);\nassert.deepEqual(norm(got), norm([[\"abc\", \"bcd\", \"xyz\"], [\"acef\"], [\"az\", \"ba\"], [\"a\", \"z\"]]));"
    },
    {
      "name": "empty input",
      "body": "assert.deepEqual(groupShiftedStrings([]), []);"
    },
    {
      "name": "wrap around the end of the alphabet",
      "body": "const got = groupShiftedStrings([\"yza\", \"abc\", \"zab\"]);\nassert.equal(got.length, 1);\nassert.equal(got[0].length, 3);"
    },
    {
      "name": "different lengths never group",
      "body": "const got = groupShiftedStrings([\"ab\", \"abc\", \"bc\"]);\nconst sizes = got.map((g) => g.length).sort();\nassert.deepEqual(sizes, [1, 2]);"
    },
    {
      "name": "single letters all share a group",
      "body": "const got = groupShiftedStrings([\"a\", \"b\", \"q\"]);\nassert.equal(got.length, 1);\nassert.equal(got[0].length, 3);"
    },
    {
      "name": "gaps that would collide without a separator stay apart",
      "body": "const got = groupShiftedStrings([\"abm\", \"alm\"]);\nconst sizes = got.map((g) => g.length).sort();\nassert.deepEqual(sizes, [1, 1]);"
    },
    {
      "name": "agrees with a normalise-the-first-letter brute force",
      "body": "let seed = 4242;\nconst rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };\nconst shiftToA = (w) => [...w].map((ch) => String.fromCharCode(97 + ((ch.charCodeAt(0) - w.charCodeAt(0) + 26) % 26))).join(\"\");\nfor (let t = 0; t < 200; t++) {\n  const strings = Array.from({ length: rand(10) }, () => Array.from({ length: rand(4) + 1 }, () => String.fromCharCode(97 + rand(4))).join(\"\"));\n  const want = new Map();\n  for (const s of strings) {\n    const k = shiftToA(s);\n    if (!want.has(k)) want.set(k, []);\n    want.get(k).push(s);\n  }\n  const norm = (gs) => gs.map((g) => g.slice().sort().join(\"|\")).sort();\n  assert.deepEqual(norm(groupShiftedStrings(strings)), norm([...want.values()]), JSON.stringify(strings));\n}"
    }
  ]
},
{
  "id": "ex-build-hashmap",
  "chapter": "dsa-hashing",
  "level": "intermediate",
  "title": "Build a Hash Map with Chaining",
  "brief": "<p>Implement a hash map for <b>string keys</b> without using <code>Map</code>, <code>Set</code> or object properties as the storage. Store entries in an array of buckets, where each bucket is an array of <code>[key, value]</code> pairs (chaining).</p><p>Write the class <code>ChainedMap</code> with:</p><ul><li><code>put(key, value)</code>: insert, or replace the value if the key exists</li><li><code>get(key)</code>: the value, or <code>undefined</code> if absent</li><li><code>has(key)</code>: whether the key is present, even when its stored value is <code>undefined</code></li><li><code>remove(key)</code>: delete the key, returning <code>true</code> if it was present and <code>false</code> otherwise</li><li><code>size</code>: the number of entries (a property, kept up to date)</li><li><code>capacity</code>: the number of buckets (a property). It starts at <b>8</b>. After an insertion that makes <code>size</code> greater than <code>0.75 * capacity</code>, double the capacity and re-insert every entry</li></ul><p>You choose the hash function. Make it spread keys out: a hash that sends everything to one bucket will make the large test time out.</p>",
  "starter": "class ChainedMap {\n  constructor() {\n    // TODO: capacity 8, size 0, and an array of empty buckets\n  }\n  put(key, value) {}\n  get(key) {}\n  has(key) {}\n  remove(key) {}\n}\n",
  "hints": [
    "A simple hash: start with h = 0 and, for each character, set h = (h * 31 + charCode) >>> 0. The >>> 0 keeps it a non-negative 32-bit integer. The bucket index is hash % capacity.",
    "put and get both walk one bucket: find the pair whose key matches. put replaces the value when it finds the key, and appends a new pair (and increases size) when it does not. has must not rely on the value being defined.",
    "When growing, create a new array of buckets with double the capacity, and re-insert every pair by recomputing its index with the NEW capacity. Copying the old buckets over unchanged would leave entries where lookups no longer look."
  ],
  "solution": "class ChainedMap {\n  constructor() {\n    this.capacity = 8;\n    this.size = 0;\n    this.buckets = Array.from({ length: this.capacity }, () => []);\n  }\n  indexFor(key, capacity) {\n    let h = 0;\n    for (let i = 0; i < key.length; i++) {\n      h = (h * 31 + key.charCodeAt(i)) >>> 0;\n    }\n    return h % capacity;\n  }\n  put(key, value) {\n    const bucket = this.buckets[this.indexFor(key, this.capacity)];\n    for (const entry of bucket) {\n      if (entry[0] === key) {\n        entry[1] = value;\n        return;\n      }\n    }\n    bucket.push([key, value]);\n    this.size++;\n    if (this.size > this.capacity * 0.75) this.grow();\n  }\n  get(key) {\n    const bucket = this.buckets[this.indexFor(key, this.capacity)];\n    for (const entry of bucket) {\n      if (entry[0] === key) return entry[1];\n    }\n    return undefined;\n  }\n  has(key) {\n    const bucket = this.buckets[this.indexFor(key, this.capacity)];\n    return bucket.some((entry) => entry[0] === key);\n  }\n  remove(key) {\n    const bucket = this.buckets[this.indexFor(key, this.capacity)];\n    for (let i = 0; i < bucket.length; i++) {\n      if (bucket[i][0] === key) {\n        bucket.splice(i, 1);\n        this.size--;\n        return true;\n      }\n    }\n    return false;\n  }\n  grow() {\n    const bigger = this.capacity * 2;\n    const next = Array.from({ length: bigger }, () => []);\n    for (const bucket of this.buckets) {\n      for (const entry of bucket) next[this.indexFor(entry[0], bigger)].push(entry);\n    }\n    this.buckets = next;\n    this.capacity = bigger;\n  }\n}\n",
  "tests": [
    {
      "name": "starts empty with capacity 8",
      "body": "const m = new ChainedMap();\nassert.equal(m.size, 0);\nassert.equal(m.capacity, 8);\nassert.equal(m.get(\"missing\"), undefined);\nassert.equal(m.has(\"missing\"), false);"
    },
    {
      "name": "put and get round trip",
      "body": "const m = new ChainedMap();\nm.put(\"cat\", 1);\nm.put(\"act\", 2);\nm.put(\"tac\", 3);\nassert.equal(m.get(\"cat\"), 1);\nassert.equal(m.get(\"act\"), 2);\nassert.equal(m.get(\"tac\"), 3);\nassert.equal(m.size, 3);"
    },
    {
      "name": "putting an existing key replaces the value and keeps the size",
      "body": "const m = new ChainedMap();\nm.put(\"a\", 1);\nm.put(\"a\", 2);\nassert.equal(m.get(\"a\"), 2);\nassert.equal(m.size, 1);"
    },
    {
      "name": "has is true even when the stored value is undefined",
      "body": "const m = new ChainedMap();\nm.put(\"k\", undefined);\nassert.equal(m.has(\"k\"), true);\nassert.equal(m.get(\"k\"), undefined);\nassert.equal(m.size, 1);"
    },
    {
      "name": "remove reports whether the key existed and updates the size",
      "body": "const m = new ChainedMap();\nm.put(\"x\", 1);\nm.put(\"y\", 2);\nassert.equal(m.remove(\"x\"), true);\nassert.equal(m.remove(\"x\"), false);\nassert.equal(m.has(\"x\"), false);\nassert.equal(m.get(\"y\"), 2);\nassert.equal(m.size, 1);"
    },
    {
      "name": "doubles the capacity when size exceeds 0.75 of it",
      "body": "const m = new ChainedMap();\nfor (let i = 1; i <= 6; i++) m.put(\"key\" + i, i);\nassert.equal(m.capacity, 8);\nm.put(\"key7\", 7);\nassert.equal(m.capacity, 16);\nfor (let i = 8; i <= 12; i++) m.put(\"key\" + i, i);\nassert.equal(m.capacity, 16);\nm.put(\"key13\", 13);\nassert.equal(m.capacity, 32);"
    },
    {
      "name": "every key is still found after several resizes",
      "body": "const m = new ChainedMap();\nfor (let i = 0; i < 500; i++) m.put(\"item-\" + i, i * 2);\nfor (let i = 0; i < 500; i++) assert.equal(m.get(\"item-\" + i), i * 2, \"lost item-\" + i);\nassert.equal(m.size, 500);"
    },
    {
      "name": "agrees with a built-in Map on random operations",
      "body": "let seed = 99;\nconst rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };\nconst mine = new ChainedMap();\nconst ref = new Map();\nfor (let step = 0; step < 4000; step++) {\n  const key = \"k\" + rand(150);\n  const op = rand(4);\n  if (op === 0) { const v = rand(1000); mine.put(key, v); ref.set(key, v); }\n  else if (op === 1) assert.equal(mine.remove(key), ref.delete(key));\n  else if (op === 2) assert.equal(mine.get(key), ref.get(key));\n  else assert.equal(mine.has(key), ref.has(key));\n  assert.equal(mine.size, ref.size);\n}"
    },
    {
      "name": "a decent hash keeps 50,000 inserts fast",
      "body": "const m = new ChainedMap();\nfor (let i = 0; i < 50000; i++) m.put(\"user\" + i, i);\nassert.equal(m.size, 50000);\nassert.equal(m.get(\"user49999\"), 49999);\nassert.ok(m.capacity >= 50000 / 0.75);"
    }
  ]
},
{
  "id": "ex-number-of-boomerangs",
  "chapter": "dsa-hashing",
  "level": "intermediate",
  "title": "Number of Boomerangs",
  "brief": "<p>A <b>boomerang</b> is an ordered triple of points <code>(i, j, k)</code> where the distance from <code>i</code> to <code>j</code> equals the distance from <code>i</code> to <code>k</code>, and <code>j</code> and <code>k</code> are different points. The order matters, so <code>(i, j, k)</code> and <code>(i, k, j)</code> count separately.</p><p>Given an array <code>points</code> of distinct <code>[x, y]</code> pairs, return the number of boomerangs.</p><ul><li><code>[[0,0],[1,0],[2,0]]</code> returns <code>2</code>: the middle point is the centre of <code>(1,0)</code>, <code>(0,0)</code>, <code>(2,0)</code> in either order</li><li>Use the <b>squared</b> distance as the key; it is an exact integer, unlike the square root</li><li>Target: O(n<sup>2</sup>) time. The tests use n = 800</li></ul>",
  "starter": "function numberOfBoomerangs(points) {\n  // TODO: for each centre point, count how many points sit at each distance\n}\n",
  "hints": [
    "Fix the point i as the centre. A boomerang needs two other points at the same distance from i.",
    "For one centre, build a Map from squared distance to how many points have it. Squared distance is dx * dx + dy * dy, which stays an exact integer.",
    "If c points share a distance from the centre, they form c * (c - 1) ordered pairs (j, k). Sum that over every distance and every centre."
  ],
  "solution": "function numberOfBoomerangs(points) {\n  let total = 0;\n  for (const [x1, y1] of points) {\n    const byDistance = new Map();\n    for (const [x2, y2] of points) {\n      const dx = x1 - x2;\n      const dy = y1 - y2;\n      const d = dx * dx + dy * dy;\n      if (d === 0) continue;\n      byDistance.set(d, (byDistance.get(d) || 0) + 1);\n    }\n    for (const c of byDistance.values()) total += c * (c - 1);\n  }\n  return total;\n}\n",
  "tests": [
    {
      "name": "three points on a line",
      "body": "assert.equal(numberOfBoomerangs([[0, 0], [1, 0], [2, 0]]), 2);"
    },
    {
      "name": "three points on a diagonal",
      "body": "assert.equal(numberOfBoomerangs([[1, 1], [2, 2], [3, 3]]), 2);"
    },
    {
      "name": "fewer than three points",
      "body": "assert.equal(numberOfBoomerangs([]), 0);\nassert.equal(numberOfBoomerangs([[1, 1]]), 0);\nassert.equal(numberOfBoomerangs([[1, 1], [2, 2]]), 0);"
    },
    {
      "name": "the corners of a unit square: two per centre, eight in all",
      "body": "assert.equal(numberOfBoomerangs([[0, 0], [0, 1], [1, 0], [1, 1]]), 8);"
    },
    {
      "name": "no two points share a distance from any centre",
      "body": "assert.equal(numberOfBoomerangs([[0, 0], [1, 0], [3, 0], [7, 0]]), 0);"
    },
    {
      "name": "negative coordinates",
      "body": "assert.equal(numberOfBoomerangs([[-1, 0], [0, 0], [1, 0]]), 2);"
    },
    {
      "name": "agrees with the O(n^3) brute force on random points",
      "body": "let seed = 4242;\nconst rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };\nfor (let t = 0; t < 120; t++) {\n  const seen = new Set();\n  const pts = [];\n  for (let i = 0; i < rand(9); i++) {\n    const p = [rand(5) - 2, rand(5) - 2];\n    const key = p.join(\",\");\n    if (!seen.has(key)) { seen.add(key); pts.push(p); }\n  }\n  let want = 0;\n  const dist = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;\n  for (let i = 0; i < pts.length; i++)\n    for (let j = 0; j < pts.length; j++)\n      for (let k = 0; k < pts.length; k++)\n        if (i !== j && i !== k && j !== k && dist(pts[i], pts[j]) === dist(pts[i], pts[k])) want++;\n  assert.equal(numberOfBoomerangs(pts), want, JSON.stringify(pts));\n}"
    },
    {
      "name": "800 points need the O(n^2) solution",
      "body": "const pts = [];\nfor (let i = 0; i < 800; i++) pts.push([i % 40, Math.floor(i / 40)]);\nconst got = numberOfBoomerangs(pts);\nassert.type(got, \"number\");\nassert.ok(got > 0);"
    }
  ]
}
];
