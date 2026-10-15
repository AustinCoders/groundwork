import type { Exercise } from "../types";

export const dsaAddDesignProblems: Exercise[] = [
  {
    "id": "ex-lfu-cache",
    "chapter": "dsa-design-problems",
    "level": "advanced",
    "title": "LFU Cache",
    "brief": "<p>Design a cache that evicts the <b>least frequently used</b> key when it is full, and the <b>least recently used</b> of those when several keys tie on frequency.</p><ul><li><code>new LFUCache(capacity)</code> - capacity can be <code>0</code>, in which case nothing is ever stored</li><li><code>get(key)</code> - the value, or <code>-1</code> if the key is absent. A hit counts as one use</li><li><code>put(key, value)</code> - insert or overwrite. Overwriting counts as one use too. Inserting a new key into a full cache first evicts one key; the new key starts with a use count of 1</li><li>Both operations must be <b>O(1)</b> on average: no scanning for the victim</li></ul>",
    "starter": "class LFUCache {\n  constructor(capacity) {\n    // TODO: remember the capacity and set up the storage\n  }\n\n  get(key) {\n    // TODO: the value (and count one use), or -1\n  }\n\n  put(key, value) {\n    // TODO: insert or overwrite, evicting the least frequently used key if needed\n  }\n}\n",
    "hints": [
      "You need three things in O(1): find a key, find the smallest use count, and find the oldest key among those with that count. A map from key to value and a map from key to count cover the first.",
      "Group keys by use count: a map from count to an insertion-ordered collection of keys (a JavaScript Set keeps insertion order). The oldest key with a given count is the first one in its Set.",
      "Keep one integer, minFreq. A hit moves a key from bucket f to f + 1, so minFreq only rises when that move empties the minimum bucket, and then it rises by exactly 1. A brand-new key always resets minFreq to 1."
    ],
    "solution": "class LFUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.values = new Map();\n    this.counts = new Map();\n    this.buckets = new Map();\n    this.minCount = 0;\n  }\n\n  touch(key) {\n    const count = this.counts.get(key);\n    const bucket = this.buckets.get(count);\n    bucket.delete(key);\n    if (bucket.size === 0) {\n      this.buckets.delete(count);\n      if (this.minCount === count) this.minCount++;\n    }\n    this.counts.set(key, count + 1);\n    if (!this.buckets.has(count + 1)) this.buckets.set(count + 1, new Set());\n    this.buckets.get(count + 1).add(key);\n  }\n\n  get(key) {\n    if (!this.values.has(key)) return -1;\n    this.touch(key);\n    return this.values.get(key);\n  }\n\n  put(key, value) {\n    if (this.capacity === 0) return;\n    if (this.values.has(key)) {\n      this.values.set(key, value);\n      this.touch(key);\n      return;\n    }\n    if (this.values.size === this.capacity) {\n      const bucket = this.buckets.get(this.minCount);\n      const victim = bucket.values().next().value;\n      bucket.delete(victim);\n      if (bucket.size === 0) this.buckets.delete(this.minCount);\n      this.values.delete(victim);\n      this.counts.delete(victim);\n    }\n    this.values.set(key, value);\n    this.counts.set(key, 1);\n    if (!this.buckets.has(1)) this.buckets.set(1, new Set());\n    this.buckets.get(1).add(key);\n    this.minCount = 1;\n  }\n}\n",
    "tests": [
      {
        "name": "the classic sequence",
        "body": "const c = new LFUCache(2);\nc.put(1, 1);\nc.put(2, 2);\nassert.equal(c.get(1), 1);\nc.put(3, 3);\nassert.equal(c.get(2), -1);\nassert.equal(c.get(3), 3);\nc.put(4, 4);\nassert.equal(c.get(1), -1);\nassert.equal(c.get(3), 3);\nassert.equal(c.get(4), 4);"
      },
      {
        "name": "a tie on frequency evicts the least recently used key",
        "body": "const c = new LFUCache(2);\nc.put('a', 1);\nc.put('b', 2);\nc.put('c', 3);\nassert.equal(c.get('a'), -1);\nassert.equal(c.get('b'), 2);\nassert.equal(c.get('c'), 3);"
      },
      {
        "name": "a frequently read key survives many insertions",
        "body": "const c = new LFUCache(2);\nc.put(1, 'one');\nc.get(1);\nc.get(1);\nfor (let k = 2; k < 20; k++) c.put(k, k);\nassert.equal(c.get(1), 'one');"
      },
      {
        "name": "overwriting counts as a use",
        "body": "const c = new LFUCache(2);\nc.put(1, 1);\nc.put(2, 2);\nc.put(1, 10);\nc.put(3, 3);\nassert.equal(c.get(2), -1);\nassert.equal(c.get(1), 10);\nassert.equal(c.get(3), 3);"
      },
      {
        "name": "overwriting a key in a full cache evicts nothing",
        "body": "const c = new LFUCache(2);\nc.put(1, 1);\nc.put(2, 2);\nc.put(2, 20);\nassert.equal(c.get(1), 1);\nassert.equal(c.get(2), 20);"
      },
      {
        "name": "capacity zero stores nothing",
        "body": "const c = new LFUCache(0);\nc.put(1, 1);\nassert.equal(c.get(1), -1);\nc.put(2, 2);\nassert.equal(c.get(2), -1);"
      },
      {
        "name": "capacity one keeps only the newest key",
        "body": "const c = new LFUCache(1);\nc.put(1, 1);\nassert.equal(c.get(1), 1);\nc.put(2, 2);\nassert.equal(c.get(1), -1);\nassert.equal(c.get(2), 2);"
      },
      {
        "name": "the new key starts at one use, below older keys",
        "body": "const c = new LFUCache(2);\nc.put(1, 1);\nc.get(1);\nc.put(2, 2);\nc.put(3, 3);\nassert.equal(c.get(2), -1);\nassert.equal(c.get(1), 1);\nassert.equal(c.get(3), 3);"
      },
      {
        "name": "agrees with a slow reference on 600 random operations",
        "body": "function seeded(seed) {\n  let s = seed >>> 0;\n  return () => {\n    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n    return s / 4294967296;\n  };\n}\nfor (let seed = 1; seed <= 6; seed++) {\n  const next = seeded(seed);\n  const cap = seed % 4;\n  const cache = new LFUCache(cap);\n  const model = new Map();\n  let tick = 0;\n  for (let op = 0; op < 100; op++) {\n    const key = 1 + Math.floor(next() * 6);\n    tick++;\n    if (next() < 0.5) {\n      const value = Math.floor(next() * 100);\n      cache.put(key, value);\n      if (cap === 0) continue;\n      if (model.has(key)) {\n        const e = model.get(key);\n        e.value = value;\n        e.count++;\n        e.at = tick;\n      } else {\n        if (model.size === cap) {\n          let victim = null;\n          for (const [k, e] of model) if (victim === null || e.count < model.get(victim).count || (e.count === model.get(victim).count && e.at < model.get(victim).at)) victim = k;\n          model.delete(victim);\n        }\n        model.set(key, { value, count: 1, at: tick });\n      }\n    } else {\n      let expected = -1;\n      if (model.has(key)) {\n        const e = model.get(key);\n        expected = e.value;\n        e.count++;\n        e.at = tick;\n      }\n      assert.equal(cache.get(key), expected, 'seed ' + seed + ' op ' + op);\n    }\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-all-o-one",
    "chapter": "dsa-design-problems",
    "level": "advanced",
    "title": "All O(1) Data Structure",
    "brief": "<p>Design a counter that can also report its most and least counted keys, with <b>every</b> operation in O(1).</p><ul><li><code>new AllOne()</code></li><li><code>inc(key)</code> - add 1 to the key's count, creating the key at 1 if it is new</li><li><code>dec(key)</code> - subtract 1 from the key's count; a count that reaches 0 removes the key. Decrementing a key that is not there does nothing</li><li><code>getMaxKey()</code> - any key with the largest count, or <code>''</code> when the structure is empty</li><li><code>getMinKey()</code> - any key with the smallest count, or <code>''</code> when empty</li></ul><p>When several keys tie, any one of them is acceptable.</p>",
    "starter": "class AllOne {\n  constructor() {\n    // TODO: set up the storage\n  }\n\n  inc(key) {\n    // TODO\n  }\n\n  dec(key) {\n    // TODO\n  }\n\n  getMaxKey() {\n    // TODO\n  }\n\n  getMinKey() {\n    // TODO\n  }\n}\n",
    "hints": [
      "A map from key to count gives inc and dec in O(1) but says nothing about the largest or smallest count. You need the counts themselves kept in sorted order.",
      "Keep one bucket per distinct count, each holding a Set of the keys with that count, and link the buckets into a doubly linked list sorted by count. The max is at one end and the min at the other.",
      "inc moves a key from its bucket to the next one only if that next bucket's count is exactly one higher, otherwise a new bucket is spliced in. Remove any bucket that becomes empty, and use sentinel nodes at both ends to avoid null checks."
    ],
    "solution": "class AllOne {\n  constructor() {\n    this.head = { count: 0, keys: new Set(), prev: null, next: null };\n    this.tail = { count: Infinity, keys: new Set(), prev: null, next: null };\n    this.head.next = this.tail;\n    this.tail.prev = this.head;\n    this.bucketOf = new Map();\n  }\n\n  insertAfter(node, count) {\n    const bucket = { count, keys: new Set(), prev: node, next: node.next };\n    node.next.prev = bucket;\n    node.next = bucket;\n    return bucket;\n  }\n\n  dropIfEmpty(bucket) {\n    if (bucket === this.head || bucket.keys.size > 0) return;\n    bucket.prev.next = bucket.next;\n    bucket.next.prev = bucket.prev;\n  }\n\n  inc(key) {\n    const from = this.bucketOf.get(key) || this.head;\n    const count = from.count + 1;\n    const to = from.next.count === count ? from.next : this.insertAfter(from, count);\n    to.keys.add(key);\n    this.bucketOf.set(key, to);\n    from.keys.delete(key);\n    this.dropIfEmpty(from);\n  }\n\n  dec(key) {\n    const from = this.bucketOf.get(key);\n    if (!from) return;\n    const count = from.count - 1;\n    if (count === 0) {\n      this.bucketOf.delete(key);\n    } else {\n      const to = from.prev.count === count ? from.prev : this.insertAfter(from.prev, count);\n      to.keys.add(key);\n      this.bucketOf.set(key, to);\n    }\n    from.keys.delete(key);\n    this.dropIfEmpty(from);\n  }\n\n  getMaxKey() {\n    return this.tail.prev === this.head ? '' : this.tail.prev.keys.values().next().value;\n  }\n\n  getMinKey() {\n    return this.head.next === this.tail ? '' : this.head.next.keys.values().next().value;\n  }\n}\n",
    "tests": [
      {
        "name": "an empty structure reports empty strings",
        "body": "const a = new AllOne();\nassert.equal(a.getMaxKey(), '');\nassert.equal(a.getMinKey(), '');"
      },
      {
        "name": "the classic sequence",
        "body": "const a = new AllOne();\na.inc('hello');\na.inc('hello');\nassert.equal(a.getMaxKey(), 'hello');\nassert.equal(a.getMinKey(), 'hello');\na.inc('leet');\nassert.equal(a.getMaxKey(), 'hello');\nassert.equal(a.getMinKey(), 'leet');"
      },
      {
        "name": "decrementing to zero removes the key",
        "body": "const a = new AllOne();\na.inc('x');\na.dec('x');\nassert.equal(a.getMaxKey(), '');\nassert.equal(a.getMinKey(), '');\na.inc('y');\nassert.equal(a.getMaxKey(), 'y');"
      },
      {
        "name": "decrementing a missing key does nothing",
        "body": "const a = new AllOne();\na.dec('ghost');\nassert.equal(a.getMaxKey(), '');\na.inc('k');\na.dec('ghost');\nassert.equal(a.getMinKey(), 'k');"
      },
      {
        "name": "the maximum moves when its owner is decremented below another key",
        "body": "const a = new AllOne();\nfor (let i = 0; i < 3; i++) a.inc('a');\nfor (let i = 0; i < 2; i++) a.inc('b');\nassert.equal(a.getMaxKey(), 'a');\na.dec('a');\na.dec('a');\nassert.equal(a.getMaxKey(), 'b');\nassert.equal(a.getMinKey(), 'a');"
      },
      {
        "name": "a tie returns one of the tied keys",
        "body": "const a = new AllOne();\na.inc('p');\na.inc('q');\nassert.ok(['p', 'q'].includes(a.getMaxKey()));\nassert.ok(['p', 'q'].includes(a.getMinKey()));\na.inc('p');\nassert.equal(a.getMaxKey(), 'p');\nassert.equal(a.getMinKey(), 'q');"
      },
      {
        "name": "a gap in counts is bridged correctly",
        "body": "const a = new AllOne();\nfor (let i = 0; i < 5; i++) a.inc('big');\na.inc('small');\nassert.equal(a.getMaxKey(), 'big');\nassert.equal(a.getMinKey(), 'small');\nfor (let i = 0; i < 4; i++) a.inc('small');\nassert.ok(['big', 'small'].includes(a.getMaxKey()));\na.dec('big');\nassert.equal(a.getMaxKey(), 'small');\nassert.equal(a.getMinKey(), 'big');"
      },
      {
        "name": "agrees with a plain counter on 800 random operations",
        "body": "function seeded(seed) {\n  let s = seed >>> 0;\n  return () => {\n    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n    return s / 4294967296;\n  };\n}\nfor (let seed = 1; seed <= 8; seed++) {\n  const next = seeded(seed);\n  const a = new AllOne();\n  const counts = new Map();\n  for (let op = 0; op < 100; op++) {\n    const key = 'abcde'[Math.floor(next() * 5)];\n    if (next() < 0.6) {\n      a.inc(key);\n      counts.set(key, (counts.get(key) || 0) + 1);\n    } else {\n      a.dec(key);\n      if (counts.has(key)) {\n        if (counts.get(key) === 1) counts.delete(key);\n        else counts.set(key, counts.get(key) - 1);\n      }\n    }\n    const values = [...counts.values()];\n    if (values.length === 0) {\n      assert.equal(a.getMaxKey(), '');\n      assert.equal(a.getMinKey(), '');\n    } else {\n      assert.equal(counts.get(a.getMaxKey()), Math.max(...values), 'max, seed ' + seed + ' op ' + op);\n      assert.equal(counts.get(a.getMinKey()), Math.min(...values), 'min, seed ' + seed + ' op ' + op);\n    }\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-randomized-collection",
    "chapter": "dsa-design-problems",
    "level": "advanced",
    "title": "Randomized Collection With Duplicates",
    "brief": "<p>Design a bag that allows duplicates and supports insert, remove-one-copy and 'give me a random member', all in <b>average O(1)</b>. A value present three times must be three times as likely to come back as a value present once.</p><ul><li><code>new RandomizedCollection(pick)</code> - <code>pick(n)</code> returns an index in <code>0..n-1</code>; when omitted, use a uniform random choice</li><li><code>insert(value)</code> - add one copy. Return <code>true</code> if the value was not in the collection before, otherwise <code>false</code></li><li><code>remove(value)</code> - remove <b>one</b> copy. Return <code>true</code> if there was a copy to remove, otherwise <code>false</code></li><li><code>getRandom()</code> - one stored copy, chosen with <code>pick</code></li></ul>",
    "starter": "class RandomizedCollection {\n  constructor(pick) {\n    // TODO: keep pick (default: uniform random) and set up storage\n  }\n\n  insert(value) {\n    // TODO\n  }\n\n  remove(value) {\n    // TODO\n  }\n\n  getRandom() {\n    // TODO\n  }\n}\n",
    "hints": [
      "Start from the no-duplicates version: a dense array of values plus a map from value to index. The new difficulty is that one value now sits at several indices.",
      "Map each value to a Set of all the indices where it appears in the array. To remove a copy, take any one index from that Set, and fill the hole with the array's last element, exactly as before.",
      "Moving the last element changes its index, so update the Set of that element's value: delete the old index (the array's last) and add the hole. Be careful when the last element is a copy of the value being removed: its Set is the same Set."
    ],
    "solution": "class RandomizedCollection {\n  constructor(pick) {\n    this.pick = pick || ((n) => Math.floor(Math.random() * n));\n    this.values = [];\n    this.slots = new Map();\n  }\n\n  insert(value) {\n    const isNew = !this.slots.has(value);\n    if (isNew) this.slots.set(value, new Set());\n    this.slots.get(value).add(this.values.length);\n    this.values.push(value);\n    return isNew;\n  }\n\n  remove(value) {\n    const mine = this.slots.get(value);\n    if (!mine) return false;\n    const hole = mine.values().next().value;\n    const lastIndex = this.values.length - 1;\n    const last = this.values[lastIndex];\n    mine.delete(hole);\n    if (hole !== lastIndex) {\n      this.values[hole] = last;\n      const theirs = this.slots.get(last);\n      theirs.delete(lastIndex);\n      theirs.add(hole);\n    }\n    this.values.pop();\n    if (mine.size === 0) this.slots.delete(value);\n    return true;\n  }\n\n  getRandom() {\n    return this.values[this.pick(this.values.length)];\n  }\n}\n",
    "tests": [
      {
        "name": "insert reports whether the value was new",
        "body": "const c = new RandomizedCollection((n) => 0);\nassert.equal(c.insert(1), true);\nassert.equal(c.insert(1), false);\nassert.equal(c.insert(2), true);"
      },
      {
        "name": "remove takes away one copy at a time",
        "body": "const c = new RandomizedCollection((n) => 0);\nc.insert(7);\nc.insert(7);\nassert.equal(c.remove(7), true);\nassert.equal(c.remove(7), true);\nassert.equal(c.remove(7), false);\nassert.equal(c.insert(7), true);"
      },
      {
        "name": "removing a missing value returns false",
        "body": "const c = new RandomizedCollection((n) => 0);\nassert.equal(c.remove(3), false);\nc.insert(4);\nassert.equal(c.remove(3), false);\nassert.equal(c.getRandom(), 4);"
      },
      {
        "name": "sweeping the picker over every index lists every copy",
        "body": "let index = 0;\nconst c = new RandomizedCollection(() => index);\nfor (const v of [1, 1, 2, 3, 3, 3]) c.insert(v);\nc.remove(3);\nc.remove(1);\nconst seen = [];\nfor (index = 0; index < 4; index++) seen.push(c.getRandom());\nassert.deepEqual(seen.sort((a, b) => a - b), [1, 2, 3, 3]);"
      },
      {
        "name": "removing the last-inserted copy of a duplicated value",
        "body": "const c = new RandomizedCollection((n) => n - 1);\nc.insert(5);\nc.insert(6);\nc.insert(5);\nassert.equal(c.remove(5), true);\nassert.equal(c.getRandom(), 6);\nassert.equal(c.remove(5), true);\nassert.equal(c.getRandom(), 6);\nassert.equal(c.remove(5), false);"
      },
      {
        "name": "a value that fills another value's hole keeps working",
        "body": "const c = new RandomizedCollection((n) => n - 1);\nc.insert(1);\nc.insert(2);\nc.insert(2);\nc.remove(1);\nassert.equal(c.getRandom(), 2);\nassert.equal(c.remove(2), true);\nassert.equal(c.remove(2), true);\nassert.equal(c.remove(2), false);"
      },
      {
        "name": "a repeated value is picked in proportion to its count",
        "body": "const c = new RandomizedCollection();\nc.insert(1);\nc.insert(1);\nc.insert(1);\nc.insert(2);\nlet ones = 0;\nfor (let i = 0; i < 4000; i++) if (c.getRandom() === 1) ones++;\nassert.ok(ones > 2700 && ones < 3300, String(ones));"
      },
      {
        "name": "agrees with a plain array on 600 random operations",
        "body": "function seeded(seed) {\n  let s = seed >>> 0;\n  return () => {\n    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n    return s / 4294967296;\n  };\n}\nfor (let seed = 1; seed <= 6; seed++) {\n  const next = seeded(seed);\n  let index = 0;\n  const c = new RandomizedCollection(() => index);\n  const bag = [];\n  for (let op = 0; op < 100; op++) {\n    const v = Math.floor(next() * 5);\n    if (next() < 0.55) {\n      assert.equal(c.insert(v), !bag.includes(v));\n      bag.push(v);\n    } else {\n      const at = bag.indexOf(v);\n      assert.equal(c.remove(v), at >= 0);\n      if (at >= 0) bag.splice(at, 1);\n    }\n    if (bag.length > 0) {\n      const seen = [];\n      for (index = 0; index < bag.length; index++) seen.push(c.getRandom());\n      assert.deepEqual(seen.sort((a, b) => a - b), [...bag].sort((a, b) => a - b), 'seed ' + seed + ' op ' + op);\n    }\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-hit-counter",
    "chapter": "dsa-design-problems",
    "level": "intermediate",
    "title": "Hit Counter",
    "brief": "<p>Count how many hits arrived in the last <code>windowSec</code> seconds.</p><ul><li><code>new HitCounter(windowSec)</code> - <code>windowSec</code> defaults to <code>300</code></li><li><code>hit(timestamp)</code> - record one hit at a time given in whole seconds. Timestamps never decrease between calls</li><li><code>getHits(timestamp)</code> - the number of hits at times <code>t</code> with <code>timestamp - windowSec &lt; t &lt;= timestamp</code></li><li>Memory must not grow with the total number of hits ever recorded: only with the window, or with the hits still inside it</li></ul>",
    "starter": "class HitCounter {\n  constructor(windowSec = 300) {\n    // TODO\n  }\n\n  hit(timestamp) {\n    // TODO\n  }\n\n  getHits(timestamp) {\n    // TODO\n  }\n}\n",
    "hints": [
      "The simplest correct version keeps every timestamp in an array and counts the ones inside the window. That is correct but its memory grows forever.",
      "Keep a ring of windowSec buckets: the slot for second t is t % windowSec, and each slot remembers which second it currently stands for, alongside a count.",
      "On hit, if the slot's stored second is not t, the slot is stale: overwrite it with count 1. On getHits, add up the counts of slots whose stored second is within the window and ignore the rest without clearing them."
    ],
    "solution": "class HitCounter {\n  constructor(windowSec = 300) {\n    this.size = windowSec;\n    this.stamps = new Array(windowSec).fill(-1);\n    this.counts = new Array(windowSec).fill(0);\n  }\n\n  hit(timestamp) {\n    const i = timestamp % this.size;\n    if (this.stamps[i] !== timestamp) {\n      this.stamps[i] = timestamp;\n      this.counts[i] = 1;\n    } else {\n      this.counts[i]++;\n    }\n  }\n\n  getHits(timestamp) {\n    let total = 0;\n    for (let i = 0; i < this.size; i++) {\n      if (timestamp - this.stamps[i] < this.size) total += this.counts[i];\n    }\n    return total;\n  }\n}\n",
    "tests": [
      {
        "name": "counts hits inside the window",
        "body": "const h = new HitCounter();\nh.hit(1);\nh.hit(2);\nh.hit(3);\nassert.equal(h.getHits(4), 3);"
      },
      {
        "name": "a hit exactly windowSec old has expired",
        "body": "const h = new HitCounter(300);\nh.hit(1);\nassert.equal(h.getHits(300), 1);\nassert.equal(h.getHits(301), 0);"
      },
      {
        "name": "several hits in the same second all count",
        "body": "const h = new HitCounter(10);\nh.hit(5);\nh.hit(5);\nh.hit(5);\nassert.equal(h.getHits(5), 3);\nassert.equal(h.getHits(14), 3);\nassert.equal(h.getHits(15), 0);"
      },
      {
        "name": "a reused slot forgets the older second",
        "body": "const h = new HitCounter(10);\nh.hit(3);\nh.hit(3);\nh.hit(13);\nassert.equal(h.getHits(13), 1);"
      },
      {
        "name": "a long quiet gap empties the counter",
        "body": "const h = new HitCounter(10);\nfor (let t = 0; t < 10; t++) h.hit(t);\nassert.equal(h.getHits(9), 10);\nassert.equal(h.getHits(1000), 0);"
      },
      {
        "name": "a small window slides one second at a time",
        "body": "const h = new HitCounter(3);\nh.hit(1);\nh.hit(2);\nh.hit(3);\nassert.equal(h.getHits(3), 3);\nassert.equal(h.getHits(4), 2);\nassert.equal(h.getHits(5), 1);\nassert.equal(h.getHits(6), 0);"
      },
      {
        "name": "memory stays bounded by the window",
        "body": "const h = new HitCounter(60);\nfor (let t = 0; t < 5000; t++) h.hit(t);\nassert.equal(h.getHits(4999), 60);\nconst cells = Object.values(h).reduce((sum, v) => sum + (Array.isArray(v) ? v.length : 0), 0);\nassert.ok(cells <= 200, String(cells));"
      },
      {
        "name": "agrees with a list of timestamps on 500 random operations",
        "body": "function seeded(seed) {\n  let s = seed >>> 0;\n  return () => {\n    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n    return s / 4294967296;\n  };\n}\nfor (let seed = 1; seed <= 5; seed++) {\n  const next = seeded(seed);\n  const h = new HitCounter(10);\n  const all = [];\n  let t = 1;\n  for (let op = 0; op < 100; op++) {\n    t += Math.floor(next() * 4);\n    if (next() < 0.6) {\n      h.hit(t);\n      all.push(t);\n    } else {\n      assert.equal(h.getHits(t), all.filter((x) => x > t - 10 && x <= t).length, 'seed ' + seed + ' op ' + op);\n    }\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-bounded-median",
    "chapter": "dsa-design-problems",
    "level": "intermediate",
    "title": "Median of Small Integers",
    "brief": "<p>A stream delivers whole numbers that are always between <code>0</code> and <code>100</code> inclusive. Support <code>addNum(x)</code> and <code>findMedian()</code>, and use the bound: no heaps, and <code>findMedian</code> must not depend on how many numbers have arrived.</p><ul><li><code>new BoundedMedian()</code></li><li><code>addNum(x)</code> - one number from <code>0..100</code></li><li><code>findMedian()</code> - the middle value of everything added so far; with an even count, the average of the two middle values. Return <code>undefined</code> before anything has been added</li></ul>",
    "starter": "class BoundedMedian {\n  constructor() {\n    // TODO\n  }\n\n  addNum(x) {\n    // TODO\n  }\n\n  findMedian() {\n    // TODO\n  }\n}\n",
    "hints": [
      "There are only 101 possible values, so remember how many times each one has appeared instead of remembering the numbers themselves.",
      "The median is the k-th smallest number for one or two ranks k. Walk the 101 counters from 0 upward, adding as you go, until the running total reaches k: the value you stopped on is the k-th smallest.",
      "With total numbers, the low middle has rank ceil(total / 2) and the high middle has rank floor(total / 2) + 1. For an odd total they are the same rank, so averaging them is harmless."
    ],
    "solution": "class BoundedMedian {\n  constructor() {\n    this.counts = new Array(101).fill(0);\n    this.total = 0;\n  }\n\n  addNum(x) {\n    this.counts[x]++;\n    this.total++;\n  }\n\n  kth(k) {\n    let seen = 0;\n    for (let v = 0; v <= 100; v++) {\n      seen += this.counts[v];\n      if (seen >= k) return v;\n    }\n  }\n\n  findMedian() {\n    if (this.total === 0) return undefined;\n    const low = Math.ceil(this.total / 2);\n    const high = Math.floor(this.total / 2) + 1;\n    return (this.kth(low) + this.kth(high)) / 2;\n  }\n}\n",
    "tests": [
      {
        "name": "nothing added yet",
        "body": "assert.equal(new BoundedMedian().findMedian(), undefined);"
      },
      {
        "name": "one number is its own median",
        "body": "const m = new BoundedMedian();\nm.addNum(42);\nassert.equal(m.findMedian(), 42);"
      },
      {
        "name": "an even count averages the two middle values",
        "body": "const m = new BoundedMedian();\nm.addNum(1);\nm.addNum(2);\nassert.equal(m.findMedian(), 1.5);\nm.addNum(3);\nassert.equal(m.findMedian(), 2);"
      },
      {
        "name": "the bounds 0 and 100 are valid",
        "body": "const m = new BoundedMedian();\nm.addNum(0);\nm.addNum(100);\nassert.equal(m.findMedian(), 50);\nm.addNum(100);\nassert.equal(m.findMedian(), 100);\nm.addNum(0);\nm.addNum(0);\nassert.equal(m.findMedian(), 0);"
      },
      {
        "name": "duplicates are counted, not collapsed",
        "body": "const m = new BoundedMedian();\nfor (const x of [7, 7, 7, 7, 90]) m.addNum(x);\nassert.equal(m.findMedian(), 7);"
      },
      {
        "name": "arrival order does not matter",
        "body": "const a = new BoundedMedian();\nconst b = new BoundedMedian();\nfor (const x of [9, 1, 5, 3, 7, 5]) a.addNum(x);\nfor (const x of [5, 7, 3, 5, 1, 9]) b.addNum(x);\nassert.equal(a.findMedian(), b.findMedian());\nassert.equal(a.findMedian(), 5);"
      },
      {
        "name": "does not store the stream",
        "body": "const m = new BoundedMedian();\nfor (let i = 0; i < 3000; i++) m.addNum(i % 101);\nconst cells = Object.values(m).reduce((sum, v) => sum + (Array.isArray(v) ? v.length : 0), 0);\nassert.ok(cells <= 400, String(cells));\nassert.equal(m.findMedian(), 49.5);"
      },
      {
        "name": "agrees with sorting on 400 random numbers",
        "body": "function seeded(seed) {\n  let s = seed >>> 0;\n  return () => {\n    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n    return s / 4294967296;\n  };\n}\nconst next = seeded(11);\nconst m = new BoundedMedian();\nconst all = [];\nfor (let i = 0; i < 400; i++) {\n  const x = Math.floor(next() * 101);\n  m.addNum(x);\n  all.push(x);\n  const s = [...all].sort((p, q) => p - q);\n  const n = s.length;\n  const expected = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;\n  assert.equal(m.findMedian(), expected, 'after ' + n);\n}"
      }
    ]
  },
  {
    "id": "ex-time-map-out-of-order",
    "chapter": "dsa-design-problems",
    "level": "advanced",
    "title": "Time Map With Out-of-Order Writes",
    "brief": "<p>A versioned key-value store where writes can arrive with <b>any</b> timestamp, not only increasing ones.</p><ul><li><code>new TimeMap()</code></li><li><code>set(key, value, timestamp)</code> - record the value for that key at that time. Writing the same key at the same timestamp again <b>replaces</b> the earlier value</li><li><code>get(key, timestamp)</code> - the value at the largest stored time <code>&lt;= timestamp</code>, or <code>''</code> if there is none</li><li><code>get</code> must run in O(log n) in the number of versions of that key</li></ul>",
    "starter": "class TimeMap {\n  constructor() {\n    // TODO\n  }\n\n  set(key, value, timestamp) {\n    // TODO\n  }\n\n  get(key, timestamp) {\n    // TODO\n  }\n}\n",
    "hints": [
      "Keep each key's versions in an array sorted by timestamp, and answer get with a binary search for the last version whose time is <= the query.",
      "Because writes can arrive late, set cannot just push. Binary search for the insertion point and splice the new version in there, so the array stays sorted.",
      "A write at an existing timestamp must overwrite, not insert a second entry: after finding the position, look at the entry just before it and compare its timestamp."
    ],
    "solution": "class TimeMap {\n  constructor() {\n    this.versions = new Map();\n  }\n\n  firstAfter(list, timestamp) {\n    let lo = 0;\n    let hi = list.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (list[mid][0] <= timestamp) lo = mid + 1;\n      else hi = mid;\n    }\n    return lo;\n  }\n\n  set(key, value, timestamp) {\n    if (!this.versions.has(key)) this.versions.set(key, []);\n    const list = this.versions.get(key);\n    const at = this.firstAfter(list, timestamp);\n    if (at > 0 && list[at - 1][0] === timestamp) list[at - 1][1] = value;\n    else list.splice(at, 0, [timestamp, value]);\n  }\n\n  get(key, timestamp) {\n    const list = this.versions.get(key);\n    if (!list) return '';\n    const at = this.firstAfter(list, timestamp);\n    return at === 0 ? '' : list[at - 1][1];\n  }\n}\n",
    "tests": [
      {
        "name": "in-order writes behave like an ordinary version store",
        "body": "const t = new TimeMap();\nt.set('k', 'a', 1);\nt.set('k', 'b', 4);\nassert.equal(t.get('k', 1), 'a');\nassert.equal(t.get('k', 3), 'a');\nassert.equal(t.get('k', 4), 'b');\nassert.equal(t.get('k', 99), 'b');"
      },
      {
        "name": "a late write slots into the right place",
        "body": "const t = new TimeMap();\nt.set('k', 'late', 10);\nt.set('k', 'early', 2);\nt.set('k', 'middle', 6);\nassert.equal(t.get('k', 1), '');\nassert.equal(t.get('k', 2), 'early');\nassert.equal(t.get('k', 5), 'early');\nassert.equal(t.get('k', 6), 'middle');\nassert.equal(t.get('k', 9), 'middle');\nassert.equal(t.get('k', 10), 'late');"
      },
      {
        "name": "the same timestamp replaces the earlier value",
        "body": "const t = new TimeMap();\nt.set('k', 'first', 5);\nt.set('k', 'second', 5);\nassert.equal(t.get('k', 5), 'second');\nassert.equal(t.get('k', 100), 'second');"
      },
      {
        "name": "replacing leaves the neighbours alone",
        "body": "const t = new TimeMap();\nt.set('k', 'a', 1);\nt.set('k', 'b', 5);\nt.set('k', 'c', 9);\nt.set('k', 'B', 5);\nassert.equal(t.get('k', 4), 'a');\nassert.equal(t.get('k', 5), 'B');\nassert.equal(t.get('k', 8), 'B');\nassert.equal(t.get('k', 9), 'c');"
      },
      {
        "name": "a missing key returns the empty string",
        "body": "const t = new TimeMap();\nassert.equal(t.get('nope', 5), '');\nt.set('a', 'x', 3);\nassert.equal(t.get('b', 5), '');"
      },
      {
        "name": "keys do not share versions",
        "body": "const t = new TimeMap();\nt.set('a', 'a-late', 9);\nt.set('b', 'b-early', 1);\nt.set('a', 'a-early', 2);\nassert.equal(t.get('a', 5), 'a-early');\nassert.equal(t.get('b', 5), 'b-early');\nassert.equal(t.get('b', 0), '');"
      },
      {
        "name": "timestamps of zero and negative numbers are legal",
        "body": "const t = new TimeMap();\nt.set('k', 'zero', 0);\nt.set('k', 'minus', -5);\nassert.equal(t.get('k', -6), '');\nassert.equal(t.get('k', -5), 'minus');\nassert.equal(t.get('k', 0), 'zero');"
      },
      {
        "name": "agrees with a list of every write on 900 random operations",
        "body": "function seeded(seed) {\n  let s = seed >>> 0;\n  return () => {\n    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n    return s / 4294967296;\n  };\n}\nfor (let seed = 1; seed <= 9; seed++) {\n  const next = seeded(seed);\n  const t = new TimeMap();\n  const writes = [];\n  for (let op = 0; op < 100; op++) {\n    const key = 'k' + Math.floor(next() * 3);\n    if (next() < 0.5) {\n      const ts = Math.floor(next() * 30);\n      const value = 'v' + op;\n      t.set(key, value, ts);\n      writes.push({ key, ts, value });\n    } else {\n      const ts = Math.floor(next() * 35);\n      let best = null;\n      for (const w of writes) if (w.key === key && w.ts <= ts && (best === null || w.ts >= best.ts)) best = w;\n      assert.equal(t.get(key, ts), best ? best.value : '', 'seed ' + seed + ' op ' + op);\n    }\n  }\n}"
      }
    ]
  }
];
