import type { Exercise } from "../types";

export const dsaAddOrderedStructures: Exercise[] = [
  {
    "id": "ex-ordered-multiset",
    "chapter": "dsa-ordered-structures",
    "level": "advanced",
    "title": "Ordered Multiset With Rank and Select",
    "brief": "<p>JavaScript has no <code>TreeSet</code>. Build an <code>OrderedMultiset</code> of numbers that keeps every copy of a value and answers ordered queries.</p><ul><li><code>add(x)</code> adds one copy of <code>x</code></li><li><code>remove(x)</code> removes <b>one</b> copy and returns <code>true</code>, or returns <code>false</code> if there is none</li><li><code>has(x)</code>, and <code>size</code> as a <b>getter</b></li><li><code>floor(x)</code>: the largest value <code>&lt;= x</code>; <code>lower(x)</code>: the largest value <code>&lt; x</code></li><li><code>ceiling(x)</code>: the smallest value <code>&gt;= x</code>; <code>higher(x)</code>: the smallest value <code>&gt; x</code></li><li>each of those four returns <code>undefined</code> when there is no such value</li><li><code>rank(x)</code>: how many stored values are smaller than <code>x</code> (it works whether or not <code>x</code> is stored)</li><li><code>countRange(lo, hi)</code>: how many stored values lie in <code>[lo, hi]</code>, both ends included</li><li><code>at(i)</code>: the i-th smallest value counting from 0, or <code>undefined</code> if <code>i</code> is out of range</li></ul><p>Aim for <b>O(log n)</b> per operation (a balanced tree, buckets, or a binary search over a sorted array if you accept an O(n) shift). A plain unbalanced search tree will fail the sorted-input test.</p>",
    "starter": "class OrderedMultiset {\n  constructor() {\n    // TODO\n  }\n\n  get size() {\n    // TODO\n  }\n\n  add(x) {\n    // TODO\n  }\n\n  remove(x) {\n    // TODO: remove one copy, return whether there was one\n  }\n\n  has(x) {\n    // TODO\n  }\n\n  floor(x) {\n    // TODO\n  }\n\n  lower(x) {\n    // TODO\n  }\n\n  ceiling(x) {\n    // TODO\n  }\n\n  higher(x) {\n    // TODO\n  }\n\n  rank(x) {\n    // TODO: how many values are smaller than x\n  }\n\n  countRange(lo, hi) {\n    // TODO\n  }\n\n  at(i) {\n    // TODO\n  }\n}\n",
    "hints": [
      "Four of the queries come from two counts. If countAtMost(x) is how many values are <= x and rank(x) is how many are < x, then floor(x) = at(countAtMost(x) - 1), higher(x) = at(countAtMost(x)), lower(x) = at(rank(x) - 1) and ceiling(x) = at(rank(x)). So you only need add, remove, the two counts and at.",
      "A sorted array does it with two binary searches (first index with value >= x, first index with value > x) and splice. If you want O(log n) updates, use a treap: every node has a random priority and a subtree size; split(t, x) cuts it into values < x and the rest, merge(a, b) joins two trees whose keys are ordered.",
      "In the treap, add(x) is split at x then merge(merge(left, node), right). remove(x) splits into (< x), (== x) and (> x), drops the root of the middle tree by merging its two children, and merges the three back. Recompute size after every change to a node's children, and rank/at become walks that use the left subtree's size."
    ],
    "solution": "function makeNode(key) {\n  return { key, priority: Math.random(), size: 1, left: null, right: null };\n}\n\nfunction sizeOf(node) {\n  return node === null ? 0 : node.size;\n}\n\nfunction refresh(node) {\n  node.size = 1 + sizeOf(node.left) + sizeOf(node.right);\n  return node;\n}\n\nfunction merge(a, b) {\n  if (a === null) return b;\n  if (b === null) return a;\n  if (a.priority > b.priority) {\n    a.right = merge(a.right, b);\n    return refresh(a);\n  }\n  b.left = merge(a, b.left);\n  return refresh(b);\n}\n\nfunction split(node, key, inclusive) {\n  if (node === null) return [null, null];\n  if (node.key < key || (inclusive && node.key === key)) {\n    const [middle, right] = split(node.right, key, inclusive);\n    node.right = middle;\n    return [refresh(node), right];\n  }\n  const [left, middle] = split(node.left, key, inclusive);\n  node.left = middle;\n  return [left, refresh(node)];\n}\n\nclass OrderedMultiset {\n  constructor() {\n    this.root = null;\n  }\n\n  get size() {\n    return sizeOf(this.root);\n  }\n\n  add(x) {\n    const [left, right] = split(this.root, x, false);\n    this.root = merge(merge(left, makeNode(x)), right);\n  }\n\n  remove(x) {\n    const [left, rest] = split(this.root, x, false);\n    const [equal, right] = split(rest, x, true);\n    const kept = equal === null ? null : merge(equal.left, equal.right);\n    this.root = merge(left, merge(kept, right));\n    return equal !== null;\n  }\n\n  countBefore(x, inclusive) {\n    let node = this.root;\n    let count = 0;\n    while (node !== null) {\n      if (node.key < x || (inclusive && node.key === x)) {\n        count += sizeOf(node.left) + 1;\n        node = node.right;\n      } else {\n        node = node.left;\n      }\n    }\n    return count;\n  }\n\n  has(x) {\n    return this.countBefore(x, true) > this.countBefore(x, false);\n  }\n\n  rank(x) {\n    return this.countBefore(x, false);\n  }\n\n  countRange(lo, hi) {\n    return Math.max(0, this.countBefore(hi, true) - this.countBefore(lo, false));\n  }\n\n  at(i) {\n    if (i < 0 || i >= this.size) return undefined;\n    let node = this.root;\n    while (true) {\n      const leftSize = sizeOf(node.left);\n      if (i < leftSize) {\n        node = node.left;\n      } else if (i === leftSize) {\n        return node.key;\n      } else {\n        i -= leftSize + 1;\n        node = node.right;\n      }\n    }\n  }\n\n  floor(x) {\n    return this.at(this.countBefore(x, true) - 1);\n  }\n\n  lower(x) {\n    return this.at(this.countBefore(x, false) - 1);\n  }\n\n  ceiling(x) {\n    return this.at(this.countBefore(x, false));\n  }\n\n  higher(x) {\n    return this.at(this.countBefore(x, true));\n  }\n}\n",
    "tests": [
      {
        "name": "answers the neighbour queries on a small set",
        "body": "const s = new OrderedMultiset();\n[5, 1, 9, 3].forEach((x) => s.add(x));\nassert.equal(s.size, 4);\nassert.equal(s.floor(4), 3);\nassert.equal(s.lower(5), 3);\nassert.equal(s.floor(5), 5);\nassert.equal(s.ceiling(4), 5);\nassert.equal(s.higher(5), 9);\nassert.equal(s.ceiling(5), 5);\nassert.equal(s.floor(0), undefined);\nassert.equal(s.lower(1), undefined);\nassert.equal(s.ceiling(10), undefined);\nassert.equal(s.higher(9), undefined);"
      },
      {
        "name": "rank counts the smaller values and at selects by position",
        "body": "const s = new OrderedMultiset();\n[40, 10, 30, 20, 50].forEach((x) => s.add(x));\nassert.equal(s.rank(30), 2);\nassert.equal(s.rank(35), 3);\nassert.equal(s.rank(5), 0);\nassert.equal(s.rank(99), 5);\nassert.deepEqual([0, 1, 2, 3, 4].map((i) => s.at(i)), [10, 20, 30, 40, 50]);\nassert.equal(s.at(5), undefined);\nassert.equal(s.at(-1), undefined);"
      },
      {
        "name": "keeps every copy of a duplicate and removes one at a time",
        "body": "const s = new OrderedMultiset();\n[7, 7, 7, 2].forEach((x) => s.add(x));\nassert.equal(s.size, 4);\nassert.equal(s.rank(7), 1);\nassert.equal(s.countRange(7, 7), 3);\nassert.equal(s.remove(7), true);\nassert.equal(s.countRange(7, 7), 2);\nassert.equal(s.remove(7), true);\nassert.equal(s.remove(7), true);\nassert.equal(s.has(7), false);\nassert.equal(s.remove(7), false);\nassert.equal(s.size, 1);\nassert.equal(s.at(0), 2);"
      },
      {
        "name": "countRange includes both ends and handles an empty range",
        "body": "const s = new OrderedMultiset();\n[1, 3, 3, 5, 8].forEach((x) => s.add(x));\nassert.equal(s.countRange(3, 5), 3);\nassert.equal(s.countRange(2, 4), 2);\nassert.equal(s.countRange(0, 100), 5);\nassert.equal(s.countRange(6, 7), 0);\nassert.equal(s.countRange(5, 3), 0);"
      },
      {
        "name": "an empty set returns undefined and zero",
        "body": "const s = new OrderedMultiset();\nassert.equal(s.size, 0);\nassert.equal(s.floor(1), undefined);\nassert.equal(s.ceiling(1), undefined);\nassert.equal(s.at(0), undefined);\nassert.equal(s.rank(1), 0);\nassert.equal(s.has(1), false);\nassert.equal(s.remove(1), false);"
      },
      {
        "name": "negative numbers and zero",
        "body": "const s = new OrderedMultiset();\n[0, -5, 3, -1].forEach((x) => s.add(x));\nassert.equal(s.floor(-2), -5);\nassert.equal(s.ceiling(-2), -1);\nassert.equal(s.lower(0), -1);\nassert.equal(s.higher(0), 3);\nassert.equal(s.at(0), -5);\nassert.equal(s.at(3), 3);"
      },
      {
        "name": "agrees with a sorted array on random operation sequences",
        "body": "let seed = 2024;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 60; round++) {\n  const s = new OrderedMultiset();\n  const ref = [];\n  for (let step = 0; step < 150; step++) {\n    const op = rnd(10);\n    const x = rnd(30) - 8;\n    if (op < 4) {\n      s.add(x);\n      ref.push(x);\n      ref.sort((a, b) => a - b);\n    } else if (op < 7) {\n      const i = ref.indexOf(x);\n      assert.equal(s.remove(x), i >= 0);\n      if (i >= 0) ref.splice(i, 1);\n    } else {\n      assert.equal(s.has(x), ref.includes(x));\n      assert.equal(s.floor(x), ref.filter((v) => v <= x).pop());\n      assert.equal(s.lower(x), ref.filter((v) => v < x).pop());\n      assert.equal(s.ceiling(x), ref.find((v) => v >= x));\n      assert.equal(s.higher(x), ref.find((v) => v > x));\n      assert.equal(s.rank(x), ref.filter((v) => v < x).length);\n      assert.equal(s.countRange(x, x + 5), ref.filter((v) => v >= x && v <= x + 5).length);\n      const i = rnd(ref.length + 2);\n      assert.equal(s.at(i), ref[i]);\n    }\n    assert.equal(s.size, ref.length);\n  }\n}"
      },
      {
        "name": "survives 50,000 values added in ascending order",
        "body": "const s = new OrderedMultiset();\nfor (let i = 0; i < 50000; i++) s.add(i);\nassert.equal(s.size, 50000);\nassert.equal(s.at(0), 0);\nassert.equal(s.at(49999), 49999);\nassert.equal(s.rank(25000), 25000);\nassert.equal(s.floor(30000.5), 30000);\nassert.equal(s.ceiling(30000.5), 30001);\nassert.equal(s.countRange(100, 199), 100);\nfor (let i = 0; i < 50000; i += 2) assert.equal(s.remove(i), true);\nassert.equal(s.size, 25000);\nassert.equal(s.at(0), 1);"
      }
    ]
  },
  {
    "id": "ex-fenwick-multiset",
    "chapter": "dsa-ordered-structures",
    "level": "advanced",
    "title": "Ordered Multiset Over Compressed Coordinates",
    "brief": "<p>All the values that will ever be added are known in advance. Build a <code>FenwickMultiset</code> that answers ordered queries in O(log m) by compressing the values and keeping counts in a Fenwick tree.</p><ul><li><code>new FenwickMultiset(universe)</code>: <code>universe</code> is an array of every value that may be added; it may be unsorted and contain duplicates</li><li><code>add(x)</code> adds one copy of <code>x</code>; if <code>x</code> is not in the universe, throw a <code>RangeError</code></li><li><code>remove(x)</code> removes one copy and returns <code>true</code>, or returns <code>false</code> if there is none (also when <code>x</code> is outside the universe)</li><li><code>size</code> is a <b>getter</b></li><li><code>rank(x)</code>: how many stored values are smaller than <code>x</code>; <code>countAtMost(x)</code>: how many are <code>&lt;= x</code>. Both accept any number, inside the universe or not</li><li><code>at(i)</code>: the i-th smallest value counting from 0, or <code>undefined</code> if out of range</li><li><code>floor(x)</code>, <code>lower(x)</code>, <code>ceiling(x)</code>, <code>higher(x)</code>: the usual neighbours, <code>undefined</code> if there is none</li></ul>",
    "starter": "class FenwickMultiset {\n  constructor(universe) {\n    // TODO: sort the distinct values, then build a Fenwick tree of counts over their positions\n  }\n\n  get size() {\n    // TODO\n  }\n\n  add(x) {\n    // TODO\n  }\n\n  remove(x) {\n    // TODO\n  }\n\n  rank(x) {\n    // TODO\n  }\n\n  countAtMost(x) {\n    // TODO\n  }\n\n  at(i) {\n    // TODO: Fenwick binary descent\n  }\n\n  floor(x) {\n    // TODO\n  }\n\n  lower(x) {\n    // TODO\n  }\n\n  ceiling(x) {\n    // TODO\n  }\n\n  higher(x) {\n    // TODO\n  }\n}\n",
    "hints": [
      "Sort the distinct values into an array. The position of a value in that array is its slot. add(x) puts +1 at the slot of x, remove(x) puts -1, and a prefix sum over slots counts the stored values up to a slot.",
      "rank(x) is the prefix sum over the slots before the first universe value that is >= x (a lower bound). countAtMost(x) uses the first universe value that is > x (an upper bound). Neither needs x to be stored.",
      "at(i) is the Fenwick binary descent: start at position 0 with remaining = i + 1, try jumps of the largest power of two down to 1, and take a jump when tree[position + step] < remaining (then subtract it). The answer is the universe value at index position. The four neighbour queries follow: floor = at(countAtMost(x) - 1), higher = at(countAtMost(x)), lower = at(rank(x) - 1), ceiling = at(rank(x))."
    ],
    "solution": "class FenwickMultiset {\n  constructor(universe) {\n    this.values = [...new Set(universe)].sort((a, b) => a - b);\n    this.m = this.values.length;\n    this.tree = new Int32Array(this.m + 1);\n    this.counts = new Int32Array(this.m);\n    this.count = 0;\n    this.top = this.m === 0 ? 0 : 1 << (31 - Math.clz32(this.m));\n  }\n\n  get size() {\n    return this.count;\n  }\n\n  lowerBound(x) {\n    let lo = 0;\n    let hi = this.m;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (this.values[mid] < x) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  }\n\n  upperBound(x) {\n    let lo = 0;\n    let hi = this.m;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (this.values[mid] <= x) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  }\n\n  bump(slot, by) {\n    this.counts[slot] += by;\n    this.count += by;\n    for (let i = slot + 1; i <= this.m; i += i & -i) this.tree[i] += by;\n  }\n\n  add(x) {\n    const slot = this.lowerBound(x);\n    if (this.values[slot] !== x) throw new RangeError(x + \" is not in the universe\");\n    this.bump(slot, 1);\n  }\n\n  remove(x) {\n    const slot = this.lowerBound(x);\n    if (this.values[slot] !== x || this.counts[slot] === 0) return false;\n    this.bump(slot, -1);\n    return true;\n  }\n\n  prefix(slots) {\n    let total = 0;\n    for (let i = slots; i > 0; i -= i & -i) total += this.tree[i];\n    return total;\n  }\n\n  rank(x) {\n    return this.prefix(this.lowerBound(x));\n  }\n\n  countAtMost(x) {\n    return this.prefix(this.upperBound(x));\n  }\n\n  at(index) {\n    if (index < 0 || index >= this.count) return undefined;\n    let position = 0;\n    let remaining = index + 1;\n    for (let step = this.top; step > 0; step >>= 1) {\n      const next = position + step;\n      if (next <= this.m && this.tree[next] < remaining) {\n        position = next;\n        remaining -= this.tree[next];\n      }\n    }\n    return this.values[position];\n  }\n\n  floor(x) {\n    return this.at(this.countAtMost(x) - 1);\n  }\n\n  lower(x) {\n    return this.at(this.rank(x) - 1);\n  }\n\n  ceiling(x) {\n    return this.at(this.rank(x));\n  }\n\n  higher(x) {\n    return this.at(this.countAtMost(x));\n  }\n}\n",
    "tests": [
      {
        "name": "answers rank, select and neighbours on a small multiset",
        "body": "const s = new FenwickMultiset([3, 5, 5, 8, 10, 12]);\n[5, 5, 12, 3, 8].forEach((x) => s.add(x));\nassert.equal(s.size, 5);\nassert.equal(s.rank(8), 3);\nassert.equal(s.countAtMost(5), 3);\nassert.deepEqual([0, 1, 2, 3, 4].map((i) => s.at(i)), [3, 5, 5, 8, 12]);\nassert.equal(s.floor(9), 8);\nassert.equal(s.ceiling(9), 12);\nassert.equal(s.lower(5), 3);\nassert.equal(s.higher(5), 8);"
      },
      {
        "name": "queries may use numbers outside the universe",
        "body": "const s = new FenwickMultiset([10, 20, 30]);\ns.add(10);\ns.add(30);\nassert.equal(s.rank(-100), 0);\nassert.equal(s.rank(1000), 2);\nassert.equal(s.floor(25), 10);\nassert.equal(s.ceiling(25), 30);\nassert.equal(s.floor(5), undefined);\nassert.equal(s.ceiling(31), undefined);\nassert.equal(s.countAtMost(20), 1);"
      },
      {
        "name": "add outside the universe throws a RangeError",
        "body": "const s = new FenwickMultiset([1, 2, 3]);\nassert.throws(() => s.add(4));\nassert.throws(() => s.add(1.5));\nassert.equal(s.size, 0);"
      },
      {
        "name": "remove takes one copy and reports whether it found one",
        "body": "const s = new FenwickMultiset([4, 4, 9]);\ns.add(4);\ns.add(4);\ns.add(9);\nassert.equal(s.remove(4), true);\nassert.equal(s.size, 2);\nassert.equal(s.remove(4), true);\nassert.equal(s.remove(4), false);\nassert.equal(s.remove(7), false);\nassert.equal(s.remove(9), true);\nassert.equal(s.size, 0);\nassert.equal(s.at(0), undefined);"
      },
      {
        "name": "an empty universe and an empty set",
        "body": "const a = new FenwickMultiset([]);\nassert.equal(a.size, 0);\nassert.equal(a.floor(1), undefined);\nassert.equal(a.rank(1), 0);\nassert.equal(a.at(0), undefined);\nconst b = new FenwickMultiset([2, 2, 2]);\nassert.equal(b.ceiling(0), undefined);\nb.add(2);\nassert.equal(b.ceiling(0), 2);"
      },
      {
        "name": "negative values and an unsorted universe",
        "body": "const s = new FenwickMultiset([5, -3, 0, -3, 7]);\n[7, -3, 0, -3].forEach((x) => s.add(x));\nassert.deepEqual([0, 1, 2, 3].map((i) => s.at(i)), [-3, -3, 0, 7]);\nassert.equal(s.lower(0), -3);\nassert.equal(s.higher(0), 7);\nassert.equal(s.rank(-3), 0);\nassert.equal(s.countAtMost(-3), 2);"
      },
      {
        "name": "agrees with a sorted array on random operation sequences",
        "body": "let seed = 77;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 50; round++) {\n  const universe = Array.from({ length: 1 + rnd(40) }, () => rnd(60) - 20);\n  const s = new FenwickMultiset(universe);\n  const ref = [];\n  for (let step = 0; step < 120; step++) {\n    const x = universe[rnd(universe.length)];\n    const q = rnd(80) - 30;\n    const op = rnd(3);\n    if (op === 0) {\n      s.add(x);\n      ref.push(x);\n      ref.sort((a, b) => a - b);\n    } else if (op === 1) {\n      const i = ref.indexOf(x);\n      assert.equal(s.remove(x), i >= 0);\n      if (i >= 0) ref.splice(i, 1);\n    } else {\n      assert.equal(s.floor(q), ref.filter((v) => v <= q).pop());\n      assert.equal(s.lower(q), ref.filter((v) => v < q).pop());\n      assert.equal(s.ceiling(q), ref.find((v) => v >= q));\n      assert.equal(s.higher(q), ref.find((v) => v > q));\n      assert.equal(s.rank(q), ref.filter((v) => v < q).length);\n      assert.equal(s.countAtMost(q), ref.filter((v) => v <= q).length);\n      const i = rnd(ref.length + 2);\n      assert.equal(s.at(i), ref[i]);\n    }\n    assert.equal(s.size, ref.length);\n  }\n}"
      },
      {
        "name": "stays fast with 200,000 values",
        "body": "let seed = 5;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst universe = Array.from({ length: 200000 }, () => rnd(1000000));\nconst s = new FenwickMultiset(universe);\nfor (const v of universe) s.add(v);\nassert.equal(s.size, 200000);\nconst sorted = universe.slice().sort((a, b) => a - b);\nfor (let q = 0; q < 200; q++) {\n  const i = rnd(200000);\n  assert.equal(s.at(i), sorted[i]);\n}\nassert.equal(s.rank(500000), sorted.filter((v) => v < 500000).length);"
      }
    ]
  },
  {
    "id": "ex-my-calendar-ii",
    "chapter": "dsa-ordered-structures",
    "level": "intermediate",
    "title": "My Calendar II",
    "brief": "<p>Build a <code>MyCalendarTwo</code> class. <code>book(start, end)</code> tries to add the half-open booking <code>[start, end)</code> and returns <code>true</code> if it succeeds. A booking is <b>refused</b> (return <code>false</code>, leave the calendar unchanged) when it would make some moment covered by <b>three</b> bookings. Two overlapping bookings are fine.</p><ul><li>Bookings are half-open: <code>[10, 20)</code> and <code>[20, 30)</code> do not overlap</li><li><code>start &lt; end</code> always</li><li>A refused booking must leave no trace: it must not count towards later checks</li></ul>",
    "starter": "class MyCalendarTwo {\n  constructor() {\n    // TODO\n  }\n\n  book(start, end) {\n    // TODO\n  }\n}\n",
    "hints": [
      "Two half-open ranges [a, b) and [start, end) overlap exactly when start < b and a < end. A triple booking needs a point inside three bookings at once.",
      "Keep two lists: every accepted booking, and the double-booked stretches (the overlap of every pair of accepted bookings). A new booking is refused if it overlaps any double-booked stretch.",
      "If it is accepted, add its overlap with each earlier booking to the double-booked list (the overlap of [a, b) and [start, end) is [max(a, start), min(b, end))) and then add the booking itself. Another way: keep a map from time to the change in the number of active bookings, add +1 at start and -1 at end, walk the times in order with a running total, and undo the change if the total ever reaches 3."
    ],
    "solution": "class MyCalendarTwo {\n  constructor() {\n    this.booked = [];\n    this.doubled = [];\n  }\n\n  book(start, end) {\n    for (const [a, b] of this.doubled) {\n      if (start < b && a < end) return false;\n    }\n    for (const [a, b] of this.booked) {\n      if (start < b && a < end) this.doubled.push([Math.max(a, start), Math.min(b, end)]);\n    }\n    this.booked.push([start, end]);\n    return true;\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const c = new MyCalendarTwo();\nassert.equal(c.book(10, 20), true);\nassert.equal(c.book(50, 60), true);\nassert.equal(c.book(10, 40), true);\nassert.equal(c.book(5, 15), false);\nassert.equal(c.book(5, 10), true);\nassert.equal(c.book(25, 55), true);"
      },
      {
        "name": "a double booking is allowed, a third is not",
        "body": "const c = new MyCalendarTwo();\nassert.equal(c.book(0, 10), true);\nassert.equal(c.book(0, 10), true);\nassert.equal(c.book(0, 10), false);\nassert.equal(c.book(5, 6), false);\nassert.equal(c.book(10, 20), true);"
      },
      {
        "name": "touching bookings do not overlap",
        "body": "const c = new MyCalendarTwo();\nassert.equal(c.book(10, 20), true);\nassert.equal(c.book(20, 30), true);\nassert.equal(c.book(10, 30), true);\nassert.equal(c.book(15, 25), false);\nassert.equal(c.book(30, 40), true);"
      },
      {
        "name": "a refused booking leaves no trace",
        "body": "const c = new MyCalendarTwo();\nassert.equal(c.book(10, 20), true);\nassert.equal(c.book(10, 20), true);\nassert.equal(c.book(0, 30), false);\nassert.equal(c.book(0, 10), true);\nassert.equal(c.book(20, 30), true);\nassert.equal(c.book(0, 10), true);\nassert.equal(c.book(20, 30), true);"
      },
      {
        "name": "a long booking crossing two separate double bookings",
        "body": "const c = new MyCalendarTwo();\nc.book(0, 5);\nc.book(0, 5);\nc.book(10, 15);\nc.book(10, 15);\nassert.equal(c.book(3, 12), false);\nassert.equal(c.book(5, 10), true);\nassert.equal(c.book(5, 10), true);"
      },
      {
        "name": "large coordinates",
        "body": "const c = new MyCalendarTwo();\nassert.equal(c.book(1000000000 - 5, 1000000000), true);\nassert.equal(c.book(1000000000 - 2, 1000000000), true);\nassert.equal(c.book(1000000000 - 1, 1000000000), false);\nassert.equal(c.book(0, 1), true);"
      },
      {
        "name": "agrees with a brute-force coverage count on random bookings",
        "body": "let seed = 31;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 80; round++) {\n  const c = new MyCalendarTwo();\n  const cover = new Array(70).fill(0);\n  for (let i = 0; i < 40; i++) {\n    const s = rnd(50);\n    const e = s + 1 + rnd(12);\n    let ok = true;\n    for (let t = s; t < e; t++) if (cover[t] + 1 >= 3) ok = false;\n    assert.equal(c.book(s, e), ok);\n    if (ok) for (let t = s; t < e; t++) cover[t]++;\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-data-stream-disjoint-intervals",
    "chapter": "dsa-ordered-structures",
    "level": "advanced",
    "title": "Data Stream as Disjoint Intervals",
    "brief": "<p>Numbers arrive one at a time. Build a <code>SummaryRanges</code> class.</p><ul><li><code>addNum(value)</code> adds an integer to the stream</li><li><code>getIntervals()</code> returns the numbers seen so far as a sorted array of disjoint closed intervals <code>[start, end]</code>, merging neighbours: after 1, 3, 7, 2, 6 it returns <code>[[1, 3], [6, 7]]</code></li><li>The same number may arrive more than once</li><li>Intervals that touch (<code>end + 1 === next start</code>) must be merged</li><li>Target: <b>O(log n)</b> per <code>addNum</code> using binary search or an ordered map keyed by start; <code>getIntervals</code> may cost O(k) for k intervals</li><li>The array you return must be safe to modify: it must not expose internal state</li></ul>",
    "starter": "class SummaryRanges {\n  constructor() {\n    // TODO\n  }\n\n  addNum(value) {\n    // TODO\n  }\n\n  getIntervals() {\n    // TODO\n  }\n}\n",
    "hints": [
      "Keep the intervals sorted by start and never touching. When a value arrives, only two intervals can matter: the last one that starts at or before the value, and the first one that starts after it.",
      "Three cases for the interval on the left: it already covers the value (do nothing), it ends exactly at value - 1 (it can be extended), or it does not reach. Likewise the interval on the right matters only if it starts exactly at value + 1.",
      "If both neighbours touch the value, merge the three into one: extend the left interval to the right one's end and delete the right one. If only one touches, extend it. If neither does, insert [value, value] at the right position (binary search for the position, then splice)."
    ],
    "solution": "class SummaryRanges {\n  constructor() {\n    this.ranges = [];\n  }\n\n  addNum(value) {\n    let lo = 0;\n    let hi = this.ranges.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (this.ranges[mid][0] <= value) lo = mid + 1;\n      else hi = mid;\n    }\n    const left = lo > 0 ? this.ranges[lo - 1] : null;\n    const right = lo < this.ranges.length ? this.ranges[lo] : null;\n    if (left !== null && left[1] >= value) return;\n    const joinLeft = left !== null && left[1] === value - 1;\n    const joinRight = right !== null && right[0] === value + 1;\n    if (joinLeft && joinRight) {\n      left[1] = right[1];\n      this.ranges.splice(lo, 1);\n    } else if (joinLeft) {\n      left[1] = value;\n    } else if (joinRight) {\n      right[0] = value;\n    } else {\n      this.ranges.splice(lo, 0, [value, value]);\n    }\n  }\n\n  getIntervals() {\n    return this.ranges.map(([start, end]) => [start, end]);\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const s = new SummaryRanges();\nconst seen = [];\nfor (const v of [1, 3, 7, 2, 6]) {\n  s.addNum(v);\n  seen.push(JSON.stringify(s.getIntervals()));\n}\nassert.deepEqual(seen, [\"[[1,1]]\", \"[[1,1],[3,3]]\", \"[[1,1],[3,3],[7,7]]\", \"[[1,3],[7,7]]\", \"[[1,3],[6,7]]\"]);"
      },
      {
        "name": "an empty stream has no intervals",
        "body": "const s = new SummaryRanges();\nassert.deepEqual(s.getIntervals(), []);"
      },
      {
        "name": "repeated numbers change nothing",
        "body": "const s = new SummaryRanges();\n[5, 5, 6, 6, 5].forEach((v) => s.addNum(v));\nassert.deepEqual(s.getIntervals(), [[5, 6]]);"
      },
      {
        "name": "a number that fills a gap of exactly one joins two intervals",
        "body": "const s = new SummaryRanges();\n[1, 2, 4, 5].forEach((v) => s.addNum(v));\nassert.deepEqual(s.getIntervals(), [[1, 2], [4, 5]]);\ns.addNum(3);\nassert.deepEqual(s.getIntervals(), [[1, 5]]);"
      },
      {
        "name": "numbers arriving in descending order extend to the left",
        "body": "const s = new SummaryRanges();\n[9, 8, 7, 3, 4].forEach((v) => s.addNum(v));\nassert.deepEqual(s.getIntervals(), [[3, 4], [7, 9]]);"
      },
      {
        "name": "negative numbers and zero",
        "body": "const s = new SummaryRanges();\n[-1, 1, 0, -5].forEach((v) => s.addNum(v));\nassert.deepEqual(s.getIntervals(), [[-5, -5], [-1, 1]]);"
      },
      {
        "name": "the returned array does not expose internal state",
        "body": "const s = new SummaryRanges();\ns.addNum(1);\ns.addNum(2);\nconst got = s.getIntervals();\ngot[0][1] = 99;\ngot.push([100, 100]);\nassert.deepEqual(s.getIntervals(), [[1, 2]]);"
      },
      {
        "name": "agrees with a brute force on random streams",
        "body": "let seed = 9;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 80; round++) {\n  const s = new SummaryRanges();\n  const seen = new Set();\n  for (let i = 0; i < 40; i++) {\n    const v = rnd(40);\n    s.addNum(v);\n    seen.add(v);\n    const want = [];\n    for (const x of [...seen].sort((a, b) => a - b)) {\n      if (want.length > 0 && want[want.length - 1][1] === x - 1) want[want.length - 1][1] = x;\n      else want.push([x, x]);\n    }\n    assert.deepEqual(s.getIntervals(), want);\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-range-module",
    "chapter": "dsa-ordered-structures",
    "level": "advanced",
    "title": "Range Module",
    "brief": "<p>Build a <code>RangeModule</code> that tracks a set of half-open ranges <code>[left, right)</code> of real numbers.</p><ul><li><code>addRange(left, right)</code> starts tracking every number in <code>[left, right)</code>, including numbers already tracked</li><li><code>removeRange(left, right)</code> stops tracking every number in <code>[left, right)</code></li><li><code>queryRange(left, right)</code> returns <code>true</code> only if <b>every</b> number in <code>[left, right)</code> is tracked</li><li>Ranges are half-open: after <code>addRange(10, 20)</code>, the number 20 is not tracked, and <code>queryRange(10, 20)</code> is <code>true</code></li><li>Coordinates may be as large as 10<sup>9</sup>, so you cannot use an array indexed by number</li><li><code>left &lt; right</code> always</li></ul>",
    "starter": "class RangeModule {\n  constructor() {\n    // TODO\n  }\n\n  addRange(left, right) {\n    // TODO\n  }\n\n  removeRange(left, right) {\n    // TODO\n  }\n\n  queryRange(left, right) {\n    // TODO\n  }\n}\n",
    "hints": [
      "Keep the tracked numbers as a sorted list of disjoint [start, end) intervals that never touch (two intervals that meet are one). Then queryRange needs only the one interval that starts at or before left: it must reach right.",
      "addRange: every stored interval that overlaps or touches [left, right) is merged with it into one interval (take the smallest start and the largest end), and the others stay as they are.",
      "removeRange: for every stored interval that overlaps [left, right), keep what is left of it: the part before left, and the part from right on. An interval that sticks out on both sides becomes two. Remember the tail on the right, which is the part people forget."
    ],
    "solution": "class RangeModule {\n  constructor() {\n    this.ranges = [];\n  }\n\n  addRange(left, right) {\n    const next = [];\n    let start = left;\n    let end = right;\n    let placed = false;\n    for (const [s, e] of this.ranges) {\n      if (e < start) {\n        next.push([s, e]);\n      } else if (s > end) {\n        if (!placed) {\n          next.push([start, end]);\n          placed = true;\n        }\n        next.push([s, e]);\n      } else {\n        start = Math.min(start, s);\n        end = Math.max(end, e);\n      }\n    }\n    if (!placed) next.push([start, end]);\n    this.ranges = next;\n  }\n\n  removeRange(left, right) {\n    const next = [];\n    for (const [s, e] of this.ranges) {\n      if (e <= left || s >= right) {\n        next.push([s, e]);\n        continue;\n      }\n      if (s < left) next.push([s, left]);\n      if (e > right) next.push([right, e]);\n    }\n    this.ranges = next;\n  }\n\n  queryRange(left, right) {\n    for (const [s, e] of this.ranges) {\n      if (s <= left && right <= e) return true;\n    }\n    return false;\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const r = new RangeModule();\nr.addRange(10, 20);\nr.removeRange(14, 16);\nassert.equal(r.queryRange(10, 14), true);\nassert.equal(r.queryRange(13, 15), false);\nassert.equal(r.queryRange(16, 17), true);"
      },
      {
        "name": "ranges are half-open",
        "body": "const r = new RangeModule();\nr.addRange(10, 20);\nassert.equal(r.queryRange(10, 20), true);\nassert.equal(r.queryRange(10, 21), false);\nassert.equal(r.queryRange(9, 20), false);\nassert.equal(r.queryRange(19, 20), true);\nassert.equal(r.queryRange(20, 21), false);"
      },
      {
        "name": "touching ranges merge so a query can span both",
        "body": "const r = new RangeModule();\nr.addRange(1, 5);\nr.addRange(5, 9);\nassert.equal(r.queryRange(1, 9), true);\nassert.equal(r.queryRange(3, 7), true);"
      },
      {
        "name": "a gap between two ranges makes a spanning query false",
        "body": "const r = new RangeModule();\nr.addRange(1, 5);\nr.addRange(6, 9);\nassert.equal(r.queryRange(1, 9), false);\nassert.equal(r.queryRange(1, 5), true);\nassert.equal(r.queryRange(6, 9), true);\nr.addRange(5, 6);\nassert.equal(r.queryRange(1, 9), true);"
      },
      {
        "name": "adding a range that swallows several others",
        "body": "const r = new RangeModule();\nr.addRange(2, 4);\nr.addRange(6, 8);\nr.addRange(10, 12);\nr.addRange(3, 11);\nassert.equal(r.queryRange(2, 12), true);\nassert.equal(r.queryRange(1, 12), false);"
      },
      {
        "name": "removing the middle keeps both tails, and removing everything empties it",
        "body": "const r = new RangeModule();\nr.addRange(0, 100);\nr.removeRange(40, 60);\nassert.equal(r.queryRange(0, 40), true);\nassert.equal(r.queryRange(60, 100), true);\nassert.equal(r.queryRange(39, 41), false);\nassert.equal(r.queryRange(59, 61), false);\nr.removeRange(0, 100);\nassert.equal(r.queryRange(0, 1), false);\nassert.equal(r.queryRange(99, 100), false);"
      },
      {
        "name": "removing a range that was never added changes nothing",
        "body": "const r = new RangeModule();\nr.addRange(5, 10);\nr.removeRange(20, 30);\nr.removeRange(0, 5);\nr.removeRange(10, 15);\nassert.equal(r.queryRange(5, 10), true);"
      },
      {
        "name": "agrees with a brute force on random operations",
        "body": "let seed = 123;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 80; round++) {\n  const r = new RangeModule();\n  const cells = new Array(40).fill(false);\n  for (let i = 0; i < 60; i++) {\n    const left = rnd(38);\n    const right = Math.min(40, left + 1 + rnd(12));\n    const op = rnd(3);\n    if (op === 0) {\n      r.addRange(left, right);\n      for (let t = left; t < right; t++) cells[t] = true;\n    } else if (op === 1) {\n      r.removeRange(left, right);\n      for (let t = left; t < right; t++) cells[t] = false;\n    } else {\n      let want = true;\n      for (let t = left; t < right; t++) if (!cells[t]) want = false;\n      assert.equal(r.queryRange(left, right), want);\n    }\n  }\n}"
      },
      {
        "name": "large coordinates",
        "body": "const r = new RangeModule();\nr.addRange(0, 1000000000);\nr.removeRange(500000000, 500000001);\nassert.equal(r.queryRange(0, 500000000), true);\nassert.equal(r.queryRange(500000000, 500000001), false);\nassert.equal(r.queryRange(500000001, 1000000000), true);"
      }
    ]
  },
  {
    "id": "ex-exam-room",
    "chapter": "dsa-ordered-structures",
    "level": "advanced",
    "title": "Exam Room",
    "brief": "<p>An exam room has <code>n</code> seats in a row, numbered 0 to n - 1. Build an <code>ExamRoom</code> class.</p><ul><li><code>new ExamRoom(n)</code></li><li><code>seat()</code> places a student in the seat that <b>maximises the distance to the closest other student</b>, and returns that seat number. If several seats tie, take the <b>lowest</b>. If the room is empty, the student sits in seat 0</li><li><code>leave(p)</code> removes the student from seat <code>p</code>; a student is always there</li><li>The ends count: a student in seat 0 or seat n - 1 has only one neighbour, so sitting at an end has distance equal to the whole gap to the nearest student</li><li><code>seat()</code> is never called when the room is full</li><li><code>n</code> can be 10<sup>9</sup> with up to 10<sup>4</sup> calls, so do not scan the row</li></ul>",
    "starter": "class ExamRoom {\n  constructor(n) {\n    // TODO\n  }\n\n  seat() {\n    // TODO\n  }\n\n  leave(p) {\n    // TODO\n  }\n}\n",
    "hints": [
      "Do not think about seats, think about the gaps between students. If the occupied seats are kept sorted, the best seat lies in one of three places: seat 0 (distance = the first student's seat), the middle of a gap between two students, or seat n - 1 (distance = n - 1 - last student's seat).",
      "For a gap between students at a and b the best seat is a + floor((b - a) / 2) and its distance is floor((b - a) / 2). Compare distances with a strict greater-than while scanning from the left, and ties go to the lower seat automatically. Check the left end first, the right end last.",
      "A scan over k students costs O(k) per call, which is fine for 10^4 calls. For O(log k), store the gaps themselves in an ordered set sorted by (distance descending, seat ascending): seat() takes the first gap and splits it into two, leave(p) finds the two gaps beside p, removes them and adds the merged gap."
    ],
    "solution": "class ExamRoom {\n  constructor(n) {\n    this.n = n;\n    this.seats = [];\n  }\n\n  seat() {\n    if (this.seats.length === 0) {\n      this.seats.push(0);\n      return 0;\n    }\n    let best = this.seats[0];\n    let bestSeat = 0;\n    for (let i = 1; i < this.seats.length; i++) {\n      const distance = (this.seats[i] - this.seats[i - 1]) >> 1;\n      if (distance > best) {\n        best = distance;\n        bestSeat = this.seats[i - 1] + distance;\n      }\n    }\n    const last = this.seats[this.seats.length - 1];\n    if (this.n - 1 - last > best) bestSeat = this.n - 1;\n    this.seats.push(bestSeat);\n    this.seats.sort((a, b) => a - b);\n    return bestSeat;\n  }\n\n  leave(p) {\n    this.seats.splice(this.seats.indexOf(p), 1);\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const room = new ExamRoom(10);\nassert.equal(room.seat(), 0);\nassert.equal(room.seat(), 9);\nassert.equal(room.seat(), 4);\nassert.equal(room.seat(), 2);\nroom.leave(4);\nassert.equal(room.seat(), 5);"
      },
      {
        "name": "a room of one seat",
        "body": "const room = new ExamRoom(1);\nassert.equal(room.seat(), 0);\nroom.leave(0);\nassert.equal(room.seat(), 0);"
      },
      {
        "name": "a room of two seats fills left to right",
        "body": "const room = new ExamRoom(2);\nassert.equal(room.seat(), 0);\nassert.equal(room.seat(), 1);"
      },
      {
        "name": "the first student sits at 0 even after everyone has left",
        "body": "const room = new ExamRoom(8);\nroom.seat();\nroom.seat();\nroom.seat();\nroom.leave(0);\nroom.leave(7);\nroom.leave(3);\nassert.equal(room.seat(), 0);"
      },
      {
        "name": "ties go to the lowest seat",
        "body": "const room = new ExamRoom(7);\nassert.equal(room.seat(), 0);\nassert.equal(room.seat(), 6);\nassert.equal(room.seat(), 3);\nassert.equal(room.seat(), 1);\nassert.equal(room.seat(), 2);\nassert.equal(room.seat(), 4);\nassert.equal(room.seat(), 5);"
      },
      {
        "name": "an end seat beats a middle seat when it is strictly farther",
        "body": "const room = new ExamRoom(10);\nroom.seat();\nroom.seat();\nroom.seat();\nroom.leave(9);\nassert.equal(room.seat(), 9);"
      },
      {
        "name": "does not scan the row for a huge room",
        "body": "const room = new ExamRoom(1000000000);\nassert.equal(room.seat(), 0);\nassert.equal(room.seat(), 999999999);\nassert.equal(room.seat(), 499999999);\nroom.leave(499999999);\nassert.equal(room.seat(), 499999999);"
      },
      {
        "name": "agrees with a brute force on random seat and leave sequences",
        "body": "let seed = 2025;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 100; round++) {\n  const n = 1 + rnd(25);\n  const room = new ExamRoom(n);\n  const taken = new Array(n).fill(false);\n  for (let step = 0; step < 80; step++) {\n    const count = taken.filter(Boolean).length;\n    if (count < n && (count === 0 || rnd(3) > 0)) {\n      let bestSeat = 0;\n      let bestDistance = -1;\n      if (count > 0) {\n        for (let p = 0; p < n; p++) {\n          if (taken[p]) continue;\n          let d = Infinity;\n          for (let q = 0; q < n; q++) if (taken[q]) d = Math.min(d, Math.abs(p - q));\n          if (d > bestDistance) {\n            bestDistance = d;\n            bestSeat = p;\n          }\n        }\n      }\n      assert.equal(room.seat(), bestSeat);\n      taken[bestSeat] = true;\n    } else if (count > 0) {\n      const occupied = [];\n      taken.forEach((t, p) => { if (t) occupied.push(p); });\n      const p = occupied[rnd(occupied.length)];\n      room.leave(p);\n      taken[p] = false;\n    }\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-contains-duplicate-iii",
    "chapter": "dsa-ordered-structures",
    "level": "intermediate",
    "title": "Contains Duplicate III",
    "brief": "<p>Write <code>containsNearbyAlmostDuplicate(nums, indexDiff, valueDiff)</code>. Return <code>true</code> if there are two <b>different</b> indices <code>i</code> and <code>j</code> with <code>|i - j| &lt;= indexDiff</code> and <code>|nums[i] - nums[j]| &lt;= valueDiff</code>, otherwise <code>false</code>.</p><ul><li><code>indexDiff &gt;= 1</code> and <code>valueDiff &gt;= 0</code></li><li>Numbers can be negative and as large as 2<sup>31</sup> in magnitude, so differences can exceed 32 bits</li><li>Target: <b>O(n log indexDiff)</b> with an ordered set of the last <code>indexDiff</code> numbers, or <b>O(n)</b> with buckets of width <code>valueDiff + 1</code></li><li>Do not change <code>nums</code></li></ul>",
    "starter": "function containsNearbyAlmostDuplicate(nums, indexDiff, valueDiff) {\n  // TODO\n}\n",
    "hints": [
      "For each number x you only need the previous indexDiff numbers. A partner exists exactly when one of them lies in [x - valueDiff, x + valueDiff]. If you could ask for the smallest earlier number that is >= x - valueDiff (a ceiling), you would just compare it with x + valueDiff.",
      "JavaScript has no ordered set, so use a sorted array of the window with a binary search and splice (fine for moderate windows), or avoid the ordering entirely with buckets.",
      "Buckets: let w = valueDiff + 1 and id = Math.floor(x / w). Two numbers in the same bucket are always close enough; numbers two buckets apart never are; numbers in adjacent buckets need a real subtraction. Keep one value per bucket in a Map, and delete the bucket of the number that leaves the window. Use Math.floor, not truncation, so negatives land in the right bucket."
    ],
    "solution": "function containsNearbyAlmostDuplicate(nums, indexDiff, valueDiff) {\n  const width = valueDiff + 1;\n  const bucketOf = (x) => Math.floor(x / width);\n  const buckets = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const x = nums[i];\n    const id = bucketOf(x);\n    if (buckets.has(id)) return true;\n    if (buckets.has(id - 1) && x - buckets.get(id - 1) <= valueDiff) return true;\n    if (buckets.has(id + 1) && buckets.get(id + 1) - x <= valueDiff) return true;\n    buckets.set(id, x);\n    if (i >= indexDiff) buckets.delete(bucketOf(nums[i - indexDiff]));\n  }\n  return false;\n}\n",
    "tests": [
      {
        "name": "close in both index and value",
        "body": "assert.equal(containsNearbyAlmostDuplicate([1, 2, 3, 1], 3, 0), true);\nassert.equal(containsNearbyAlmostDuplicate([1, 0, 1, 1], 1, 2), true);"
      },
      {
        "name": "never close enough in both",
        "body": "assert.equal(containsNearbyAlmostDuplicate([1, 5, 9, 1, 5, 9], 2, 3), false);\nassert.equal(containsNearbyAlmostDuplicate([1, 2, 3, 1], 1, 0), false);"
      },
      {
        "name": "an empty or single-element array has no pair",
        "body": "assert.equal(containsNearbyAlmostDuplicate([], 3, 3), false);\nassert.equal(containsNearbyAlmostDuplicate([7], 3, 3), false);"
      },
      {
        "name": "the match sits in an adjacent bucket, not the same one",
        "body": "assert.equal(containsNearbyAlmostDuplicate([2, 9, 5], 2, 3), true);\nassert.equal(containsNearbyAlmostDuplicate([2, 10, 6], 2, 3), false);"
      },
      {
        "name": "negative numbers: -1 and 1 differ by 2, not 0",
        "body": "assert.equal(containsNearbyAlmostDuplicate([-1, 1], 1, 1), false);\nassert.equal(containsNearbyAlmostDuplicate([-1, 1], 1, 2), true);\nassert.equal(containsNearbyAlmostDuplicate([-3, 3, -1], 2, 2), true);\nassert.equal(containsNearbyAlmostDuplicate([-3, 3], 1, 5), false);"
      },
      {
        "name": "values far apart in magnitude (differences beyond 32 bits)",
        "body": "assert.equal(containsNearbyAlmostDuplicate([-2147483648, 2147483647], 1, 2147483647), false);\nassert.equal(containsNearbyAlmostDuplicate([-2147483648, 2147483647], 1, 4294967295), true);\nassert.equal(containsNearbyAlmostDuplicate([2147483647, -2147483647], 1, 1), false);"
      },
      {
        "name": "the window must not be longer than indexDiff",
        "body": "assert.equal(containsNearbyAlmostDuplicate([4, 100, 200, 4], 2, 0), false);\nassert.equal(containsNearbyAlmostDuplicate([4, 100, 200, 4], 3, 0), true);"
      },
      {
        "name": "does not change the input",
        "body": "const nums = [8, 1, 6, 3];\nconst copy = nums.slice();\ncontainsNearbyAlmostDuplicate(nums, 2, 2);\nassert.deepEqual(nums, copy);"
      },
      {
        "name": "agrees with a brute force on random inputs",
        "body": "let seed = 404;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 400; round++) {\n  const n = 1 + rnd(25);\n  const nums = Array.from({ length: n }, () => rnd(41) - 20);\n  const indexDiff = 1 + rnd(n);\n  const valueDiff = rnd(8);\n  let want = false;\n  for (let i = 0; i < n; i++) {\n    for (let j = i + 1; j < n && j - i <= indexDiff; j++) {\n      if (Math.abs(nums[i] - nums[j]) <= valueDiff) want = true;\n    }\n  }\n  assert.equal(containsNearbyAlmostDuplicate(nums, indexDiff, valueDiff), want);\n}"
      },
      {
        "name": "stays fast on 100,000 numbers",
        "body": "let seed = 8;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst nums = Array.from({ length: 100000 }, (_, i) => i * 10 + rnd(3));\nassert.equal(containsNearbyAlmostDuplicate(nums, 50000, 3), false);\nnums.push(nums[99990] + 1);\nassert.equal(containsNearbyAlmostDuplicate(nums, 50000, 3), true);"
      }
    ]
  },
  {
    "id": "ex-max-sum-rectangle-no-larger-than-k",
    "chapter": "dsa-ordered-structures",
    "level": "advanced",
    "title": "Max Sum of Rectangle No Larger Than K",
    "brief": "<p>Write <code>maxSumSubmatrix(matrix, k)</code>. <code>matrix</code> is a non-empty <code>m x n</code> array of integers (possibly negative). Return the largest sum of any rectangular block of cells whose sum is <b>at most</b> <code>k</code>.</p><ul><li>A block is any set of cells from rows <code>r1..r2</code> and columns <code>c1..c2</code>, a single cell included</li><li>It is guaranteed that at least one block has sum <code>&lt;= k</code></li><li>Target: about <b>O(min(m, n)<sup>2</sup> * max(m, n) * log max(m, n))</b>, not O(m<sup>2</sup> n<sup>2</sup>)</li><li>Do not change <code>matrix</code></li></ul>",
    "starter": "function maxSumSubmatrix(matrix, k) {\n  // TODO\n}\n",
    "hints": [
      "Fix a top row and a bottom row. Adding up each column between them turns the block into a contiguous range of one 1-D array of column sums. So the problem becomes: the largest subarray sum that is at most k.",
      "Kadane's algorithm cannot enforce the cap. Use prefix sums instead: a subarray ending at j has sum P[j] - P[i]. To make it as large as possible without exceeding k, you want the smallest earlier prefix P[i] that is still >= P[j] - k.",
      "Keep the earlier prefixes (starting with 0) in a sorted array and binary search for the first one >= P[j] - k, then insert P[j]. Pair up rows if there are fewer rows than columns, otherwise transpose the roles, so the quadratic part runs over the shorter side."
    ],
    "solution": "function maxSumSubmatrix(matrix, k) {\n  const rows = matrix.length;\n  const cols = matrix[0].length;\n  const wide = cols >= rows;\n  const outer = wide ? rows : cols;\n  const inner = wide ? cols : rows;\n  const cell = (o, i) => (wide ? matrix[o][i] : matrix[i][o]);\n\n  function bestAtMost(strip) {\n    const seen = [0];\n    let prefix = 0;\n    let best = -Infinity;\n    for (const x of strip) {\n      prefix += x;\n      let lo = 0;\n      let hi = seen.length;\n      while (lo < hi) {\n        const mid = (lo + hi) >> 1;\n        if (seen[mid] < prefix - k) lo = mid + 1;\n        else hi = mid;\n      }\n      if (lo < seen.length) best = Math.max(best, prefix - seen[lo]);\n      let at = 0;\n      let to = seen.length;\n      while (at < to) {\n        const mid = (at + to) >> 1;\n        if (seen[mid] < prefix) at = mid + 1;\n        else to = mid;\n      }\n      seen.splice(at, 0, prefix);\n    }\n    return best;\n  }\n\n  let best = -Infinity;\n  for (let top = 0; top < outer; top++) {\n    const strip = new Array(inner).fill(0);\n    for (let bottom = top; bottom < outer; bottom++) {\n      for (let i = 0; i < inner; i++) strip[i] += cell(bottom, i);\n      best = Math.max(best, bestAtMost(strip));\n      if (best === k) return k;\n    }\n  }\n  return best;\n}\n",
    "tests": [
      {
        "name": "the two standard examples",
        "body": "assert.equal(maxSumSubmatrix([[1, 0, 1], [0, -2, 3]], 2), 2);\nassert.equal(maxSumSubmatrix([[2, 2, -1]], 3), 3);"
      },
      {
        "name": "a single cell",
        "body": "assert.equal(maxSumSubmatrix([[5]], 5), 5);\nassert.equal(maxSumSubmatrix([[5]], 10), 5);\nassert.equal(maxSumSubmatrix([[-7]], -3), -7);"
      },
      {
        "name": "the cap forces a smaller block than the largest",
        "body": "assert.equal(maxSumSubmatrix([[5, -4, -3, 4], [-3, -4, 4, 5], [5, 1, 5, -4]], 3), 2);\nassert.equal(maxSumSubmatrix([[5, -4, -3, 4], [-3, -4, 4, 5], [5, 1, 5, -4]], 8), 8);\nassert.equal(maxSumSubmatrix([[5, -4, -3, 4], [-3, -4, 4, 5], [5, 1, 5, -4]], 100), 11);"
      },
      {
        "name": "every cell is larger than k, so only negative blocks qualify",
        "body": "assert.equal(maxSumSubmatrix([[3, -5], [4, 6]], -2), -2);\nassert.equal(maxSumSubmatrix([[3, -5], [4, 6]], -5), -5);"
      },
      {
        "name": "tall and wide matrices give the same answer for the transpose",
        "body": "const wide = [[1, -2, 3, 4, -1], [0, 5, -3, 2, 2]];\nconst tall = wide[0].map((_, c) => wide.map((row) => row[c]));\nconst expected = { \"-1\": -1, \"0\": 0, \"1\": 1, \"3\": 3, \"6\": 6, \"9\": 9, \"20\": 11 };\nfor (const k of [-1, 0, 1, 3, 6, 9, 20]) {\n  assert.equal(maxSumSubmatrix(wide, k), expected[k]);\n  assert.equal(maxSumSubmatrix(tall, k), expected[k]);\n}"
      },
      {
        "name": "does not change the matrix",
        "body": "const m = [[1, 2], [3, -4]];\nconst copy = m.map((row) => row.slice());\nmaxSumSubmatrix(m, 2);\nassert.deepEqual(m, copy);"
      },
      {
        "name": "agrees with an all-rectangles brute force on random matrices",
        "body": "let seed = 606;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 300; round++) {\n  const rows = 1 + rnd(5);\n  const cols = 1 + rnd(5);\n  const m = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(21) - 10));\n  const k = rnd(30) - 5;\n  let want = -Infinity;\n  for (let r1 = 0; r1 < rows; r1++) {\n    for (let r2 = r1; r2 < rows; r2++) {\n      for (let c1 = 0; c1 < cols; c1++) {\n        for (let c2 = c1; c2 < cols; c2++) {\n          let s = 0;\n          for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) s += m[r][c];\n          if (s <= k && s > want) want = s;\n        }\n      }\n    }\n  }\n  if (want === -Infinity) continue;\n  assert.equal(maxSumSubmatrix(m, k), want);\n}"
      },
      {
        "name": "a 40 by 40 matrix finishes quickly",
        "body": "let seed = 11;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nconst m = Array.from({ length: 40 }, () => Array.from({ length: 40 }, () => rnd(2001) - 1000));\nconst answer = maxSumSubmatrix(m, 500);\nassert.ok(answer <= 500);\nassert.ok(answer >= -1000);"
      }
    ]
  },
  {
    "id": "ex-stock-price-fluctuation",
    "chapter": "dsa-ordered-structures",
    "level": "intermediate",
    "title": "Stock Price Fluctuation",
    "brief": "<p>A stream of price records arrives, possibly out of order and possibly <b>correcting</b> an earlier record. Build a <code>StockPrice</code> class.</p><ul><li><code>update(timestamp, price)</code> records the price at that timestamp. If a record for that timestamp already exists, the new price <b>replaces</b> it</li><li><code>current()</code> returns the price at the <b>latest timestamp</b> recorded so far</li><li><code>maximum()</code> and <code>minimum()</code> return the highest and lowest price among the <b>current</b> records (replaced prices no longer count)</li><li>The first call is always <code>update</code>, so the others are never called on an empty record</li><li>Prices and timestamps are positive integers; many timestamps can have equal prices</li></ul>",
    "starter": "class StockPrice {\n  constructor() {\n    // TODO\n  }\n\n  update(timestamp, price) {\n    // TODO\n  }\n\n  current() {\n    // TODO\n  }\n\n  maximum() {\n    // TODO\n  }\n\n  minimum() {\n    // TODO\n  }\n}\n",
    "hints": [
      "A Map from timestamp to price handles the corrections and the latest timestamp (keep the largest timestamp seen). The hard part is the maximum and minimum after a price has been replaced.",
      "You need an ordered multiset of the current prices: when a record is corrected, remove one copy of the old price and add one copy of the new one. Then the minimum is the first element and the maximum is the last. Equal prices are separate copies, so removing one must leave the other.",
      "With no TreeMap, keep the prices in a sorted array: binary search for the position, splice to insert or remove (O(n) shift, fine here). Another route is two heaps with lazy deletion: an entry is stale when the Map no longer holds that price for its timestamp."
    ],
    "solution": "class StockPrice {\n  constructor() {\n    this.byTime = new Map();\n    this.latest = 0;\n    this.prices = [];\n  }\n\n  lowerBound(x) {\n    let lo = 0;\n    let hi = this.prices.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (this.prices[mid] < x) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  }\n\n  update(timestamp, price) {\n    if (this.byTime.has(timestamp)) {\n      this.prices.splice(this.lowerBound(this.byTime.get(timestamp)), 1);\n    }\n    this.byTime.set(timestamp, price);\n    this.prices.splice(this.lowerBound(price), 0, price);\n    if (timestamp > this.latest) this.latest = timestamp;\n  }\n\n  current() {\n    return this.byTime.get(this.latest);\n  }\n\n  maximum() {\n    return this.prices[this.prices.length - 1];\n  }\n\n  minimum() {\n    return this.prices[0];\n  }\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "const s = new StockPrice();\ns.update(1, 10);\ns.update(2, 5);\nassert.equal(s.current(), 5);\nassert.equal(s.maximum(), 10);\ns.update(1, 3);\nassert.equal(s.maximum(), 5);\ns.update(4, 2);\nassert.equal(s.minimum(), 2);"
      },
      {
        "name": "a single record is the current, maximum and minimum",
        "body": "const s = new StockPrice();\ns.update(7, 42);\nassert.equal(s.current(), 42);\nassert.equal(s.maximum(), 42);\nassert.equal(s.minimum(), 42);"
      },
      {
        "name": "records arriving out of order: current follows the latest timestamp",
        "body": "const s = new StockPrice();\ns.update(10, 100);\ns.update(3, 7);\ns.update(8, 50);\nassert.equal(s.current(), 100);\nassert.equal(s.maximum(), 100);\nassert.equal(s.minimum(), 7);"
      },
      {
        "name": "correcting the latest record changes current",
        "body": "const s = new StockPrice();\ns.update(1, 5);\ns.update(2, 9);\nassert.equal(s.current(), 9);\ns.update(2, 1);\nassert.equal(s.current(), 1);\nassert.equal(s.minimum(), 1);\nassert.equal(s.maximum(), 5);"
      },
      {
        "name": "equal prices are separate copies",
        "body": "const s = new StockPrice();\ns.update(1, 8);\ns.update(2, 8);\ns.update(3, 8);\ns.update(1, 2);\nassert.equal(s.maximum(), 8);\ns.update(2, 2);\nassert.equal(s.maximum(), 8);\ns.update(3, 2);\nassert.equal(s.maximum(), 2);\nassert.equal(s.minimum(), 2);"
      },
      {
        "name": "replacing a price with the same price changes nothing",
        "body": "const s = new StockPrice();\ns.update(1, 4);\ns.update(2, 6);\ns.update(2, 6);\nassert.equal(s.maximum(), 6);\nassert.equal(s.minimum(), 4);\ns.update(2, 4);\nassert.equal(s.maximum(), 4);"
      },
      {
        "name": "agrees with a brute force on random updates",
        "body": "let seed = 700;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let round = 0; round < 80; round++) {\n  const s = new StockPrice();\n  const records = new Map();\n  for (let i = 0; i < 60; i++) {\n    const t = 1 + rnd(15);\n    const p = 1 + rnd(20);\n    s.update(t, p);\n    records.set(t, p);\n    const prices = [...records.values()];\n    assert.equal(s.maximum(), Math.max(...prices));\n    assert.equal(s.minimum(), Math.min(...prices));\n    assert.equal(s.current(), records.get(Math.max(...records.keys())));\n  }\n}"
      }
    ]
  }
];
