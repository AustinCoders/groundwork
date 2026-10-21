import type { LldQuestion } from "./lld-types";

export const questions: LldQuestion[] = [
  {
    id: "phonepe-multilevel-cache",
    company: "phonepe",
    title: "Multi-level cache with pluggable eviction",
    prompt:
      "Build a cache made of several levels, each with its own fixed capacity, holding string keys and values. A read searches from the top level downward and promotes a hit to the top. A write pushes whatever it evicts down to the next level, and a new level is created on demand up to a configured maximum. A delete removes the key from every level. The eviction rule must be pluggable, with least frequently used required.",
    level: "level not stated (2 to 5 years of experience)",
    round: "machine-coding",
    topic: "storage",
    patterns: ["Strategy", "Chain of responsibility", "Factory"],
    evidence: "one",
    sources: [
      {
        label: "PhonePe Interview Experience for SDE, 2-5 years (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/phonepe-interview-experience-for-sde-2-5-years-experienced/",
        kind: "candidate-report",
      },
    ],
    chapters: ["sysdes-caching-fundamentals"],
    answer: {
      ask: `<p>Questions to ask: is capacity counted in entries or bytes? Is the number of levels fixed, or do levels appear as needed, and what happens to an entry pushed out of the last level? Does a read that hits the top level need any promotion work? Can each level use a different eviction rule? What should a write to a key that already sits in a lower level do? Is the cache used from one thread or many?</p>
<p>Assumed scope: capacities are entry counts given as a list, the list length is the maximum number of levels, and a level is created only when something is first evicted from the one above it. An entry evicted from the last level is dropped and handed back to the caller. All levels use the same kind of policy but each has its own instance. A write replaces any existing copy, restarts its frequency at one and puts the single new copy at the top. Invalid capacities are rejected up front. Single threaded. Out of scope: expiry, byte sizing, persistence and hit statistics.</p>`,
      entities: `<ul>
<li><b>MultiLevelCache</b> is the facade. It owns the ordered list of levels, the list of capacities and a policy factory, and exposes <code>get</code>, <code>put</code> and <code>delete</code>.</li>
<li><b>CacheLevel</b> owns one map of entries, a fixed capacity and one policy instance. Its <code>put</code> returns the entry it had to evict, if any.</li>
<li><b>EvictionPolicy</b> is the interface a level talks to: <code>touch</code>, <code>remove</code> and <code>evict</code>. It sees keys only, never values.</li>
<li><b>LruPolicy</b> implements it with a Map whose insertion order is the recency order.</li>
<li><b>LfuPolicy</b> implements it with a doubly linked list of frequency buckets, each bucket holding a Set of keys.</li>
</ul>
<p>Relationships: the cache has many levels, each level has one policy created by the factory function the cache was given, so a level never names a concrete policy class.</p>`,
      design: `<p>The key separation is between where entries live and which entry leaves. <b>CacheLevel</b> holds the data and the capacity and asks its policy one question: which key goes. That is the Strategy pattern, and it earns its place because LRU and LFU differ only in the bookkeeping behind three methods: <code>touch(key)</code> on an insert or hit, <code>remove(key)</code> on a delete or promotion, and <code>evict()</code> to return and forget the victim. The cache receives a factory function, so every level gets its own policy instance and a new policy is one new class with no edits elsewhere.</p>
<p><b>LruPolicy</b> keeps keys in a Map. Touching a key deletes and re-inserts it, so the first key in iteration order is always the least recently used one, and every step is O(1) amortised. <b>LfuPolicy</b> keeps a doubly linked list of buckets ordered by frequency, each bucket holding a Set of keys with that count. A touch moves the key to the bucket for count plus one, creating it next to the old bucket if it does not exist, and unlinks a bucket that became empty. The head bucket always has the lowest frequency, so <code>evict</code> reads the first key of the head. A Set keeps insertion order, so ties go to the key that has sat at that frequency longest. Every operation is O(1) and none scans for the minimum, which a count map with a minimum pointer cannot promise once arbitrary keys can be deleted.</p>
<p>The levels form a simple chain: a read, or an entry that was pushed out, moves down until some level handles it.</p>
<ol>
<li><code>get</code> finds the first level that holds the key. A miss returns no value. A hit in the top level only touches the policy, so its frequency is kept.</li>
<li>A hit lower down removes the entry from that level, which frees one slot, then inserts it at the top.</li>
<li><code>insert</code> puts the entry into level 0. If that level is full its policy picks a victim, and the victim is inserted into level 1, and so on. Level k plus 1 is created only when something is first pushed out of level k. Past the last allowed level the entry is dropped and returned.</li>
<li><code>put</code> deletes the key everywhere first, so no stale copy remains lower down, then inserts at the top.</li>
<li><code>delete</code> removes the key from every level and reports whether it was found.</li>
</ol>
<p>Each operation touches at most L levels, so it costs O(L) with L a small constant. The trade-off is that frequency is kept per level and restarts at one after a promotion. That keeps levels independent but means a hot entry can fall behind newer ones right after it moves. For threads, one lock around the whole cache is the simple answer, because a promotion holds two levels at once. Per-level locks would need a fixed top to bottom order.</p>`,
      extend: [
        "How would you make the cache safe for many threads without one global lock, given that a promotion touches two levels at once?",
        "How would you add a time to live per entry, and where does the expiry check belong so that an expired entry is never promoted?",
        "Capacity is now measured in bytes and values differ in size: what changes in CacheLevel and in the policy interface when one insert may need to evict several entries?",
        "How would you let the levels use different policies, for example LRU on top and LFU below, and what does the factory become?",
        "Should a hit in a lower level move the entry straight to the top or only one level up, and how does that change which entries get pushed down?",
      ],
      slips: `<ul>
<li>Implementing LFU with a plain count map and scanning for the smallest count on each eviction. That is O(n) per eviction, and the question asks for constant time operations.</li>
<li>Forgetting the tie-break. When counts are equal the victim must still be deterministic, usually the entry that has waited longest at that count.</li>
<li>Promoting without removing the entry from the lower level, which leaves two copies, or forgetting that the demotion triggered by a promotion lands in the slot that was just freed.</li>
<li>Removing and re-inserting on a hit in the top level, which silently resets its frequency to one.</li>
<li>Letting CacheLevel know about LRU or LFU, so adding a policy means editing existing classes.</li>
<li>Stopping a delete at the first level that holds the key, or silently losing the entry that falls out of the last level.</li>
</ul>`,
    },
    code: `class LruPolicy {
  constructor() {
    this.order = new Map();
  }
  touch(key) {
    this.order.delete(key);
    this.order.set(key, true);
  }
  remove(key) {
    this.order.delete(key);
  }
  evict() {
    const key = this.order.keys().next().value;
    this.order.delete(key);
    return key;
  }
}

class LfuPolicy {
  constructor() {
    this.nodeOf = new Map();
    this.head = null;
  }
  link(count, after) {
    const node = { count, keys: new Set(), prev: after, next: after ? after.next : this.head };
    if (node.next) node.next.prev = node;
    if (after) after.next = node;
    else this.head = node;
    return node;
  }
  unlink(node) {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
  }
  touch(key) {
    const node = this.nodeOf.get(key) || null;
    const count = node ? node.count + 1 : 1;
    let target = node ? node.next : this.head;
    if (!target || target.count !== count) target = this.link(count, node);
    target.keys.add(key);
    this.nodeOf.set(key, target);
    if (node) {
      node.keys.delete(key);
      if (node.keys.size === 0) this.unlink(node);
    }
  }
  remove(key) {
    const node = this.nodeOf.get(key);
    if (!node) return;
    node.keys.delete(key);
    if (node.keys.size === 0) this.unlink(node);
    this.nodeOf.delete(key);
  }
  evict() {
    const key = this.head.keys.values().next().value;
    this.remove(key);
    return key;
  }
}

class CacheLevel {
  constructor(capacity, policy) {
    this.capacity = capacity;
    this.policy = policy;
    this.data = new Map();
  }
  put(key, value) {
    let evicted = null;
    if (!this.data.has(key) && this.data.size >= this.capacity) {
      const victim = this.policy.evict();
      evicted = { key: victim, value: this.data.get(victim) };
      this.data.delete(victim);
    }
    this.data.set(key, value);
    this.policy.touch(key);
    return evicted;
  }
  remove(key) {
    if (!this.data.delete(key)) return false;
    this.policy.remove(key);
    return true;
  }
}

class MultiLevelCache {
  constructor(capacities, policyFactory) {
    if (capacities.length === 0 || capacities.some((c) => !Number.isInteger(c) || c < 1)) {
      throw new RangeError("capacities must be positive integers");
    }
    this.capacities = capacities;
    this.policyFactory = policyFactory;
    this.levels = [];
  }
  levelAt(index) {
    while (this.levels.length <= index && this.levels.length < this.capacities.length) {
      const capacity = this.capacities[this.levels.length];
      this.levels.push(new CacheLevel(capacity, this.policyFactory()));
    }
    return this.levels[index];
  }
  insert(index, key, value) {
    let entry = { key, value };
    for (let i = index; entry; i++) {
      const level = this.levelAt(i);
      if (!level) return entry;
      entry = level.put(entry.key, entry.value);
    }
    return null;
  }
  levelOf(key) {
    return this.levels.findIndex((level) => level.data.has(key));
  }
  get(key) {
    const index = this.levelOf(key);
    if (index < 0) return undefined;
    const level = this.levels[index];
    const value = level.data.get(key);
    if (index === 0) {
      level.policy.touch(key);
      return value;
    }
    level.remove(key);
    this.insert(0, key, value);
    return value;
  }
  put(key, value) {
    this.delete(key);
    return this.insert(0, key, value);
  }
  delete(key) {
    let found = false;
    for (const level of this.levels) found = level.remove(key) || found;
    return found;
  }
  dump() {
    return this.levels.map((level) => [...level.data.keys()].sort());
  }
}
`,
    checks: [
      {
        name: "pushes an evicted entry down to the next level",
        expr: `(() => {
    const cache = new MultiLevelCache([2, 2], () => new LruPolicy());
    cache.put("a", 1);
    cache.put("b", 2);
    cache.put("c", 3);
    return cache.dump();
  })()`,
        expected: [["b", "c"], ["a"]],
      },
      {
        name: "promotes a hit from a lower level to the top",
        expr: `(() => {
    const cache = new MultiLevelCache([2, 2], () => new LruPolicy());
    cache.put("a", 1);
    cache.put("b", 2);
    cache.put("c", 3);
    const value = cache.get("a");
    return [value, cache.dump()];
  })()`,
        expected: [1, [["a", "c"], ["b"]]],
      },
      {
        name: "drops an entry once the last allowed level is full",
        expr: `(() => {
    const cache = new MultiLevelCache([1, 1], () => new LruPolicy());
    cache.put("a", 1);
    cache.put("b", 2);
    const dropped = cache.put("c", 3);
    return [dropped, cache.get("a") === undefined, cache.dump()];
  })()`,
        expected: [{ key: "a", value: 1 }, true, [["c"], ["b"]]],
      },
      {
        name: "delete clears the key from every level",
        expr: `(() => {
    const cache = new MultiLevelCache([1, 1, 1], () => new LruPolicy());
    cache.put("a", 1);
    cache.put("b", 2);
    cache.put("c", 3);
    return [cache.delete("a"), cache.delete("c"), cache.delete("zz"), cache.dump()];
  })()`,
        expected: [true, true, false, [[], ["b"], []]],
      },
      {
        name: "LRU evicts the entry that was read longest ago",
        expr: `(() => {
    const cache = new MultiLevelCache([2, 2], () => new LruPolicy());
    cache.put("a", 1);
    cache.get("a");
    cache.get("a");
    cache.put("b", 2);
    cache.put("c", 3);
    return cache.dump();
  })()`,
        expected: [["b", "c"], ["a"]],
      },
      {
        name: "LFU keeps the frequently read entry with the same operations",
        expr: `(() => {
    const cache = new MultiLevelCache([2, 2], () => new LfuPolicy());
    cache.put("a", 1);
    cache.get("a");
    cache.get("a");
    cache.put("b", 2);
    cache.put("c", 3);
    return cache.dump();
  })()`,
        expected: [["a", "c"], ["b"]],
      },
      {
        name: "LFU breaks a frequency tie by evicting the older arrival",
        expr: `(() => {
    const policy = new LfuPolicy();
    policy.touch("a");
    policy.touch("b");
    policy.touch("a");
    policy.touch("b");
    return policy.evict();
  })()`,
        expected: "a",
      },
      {
        name: "LFU stays consistent after removing the only key at the lowest frequency",
        expr: `(() => {
    const policy = new LfuPolicy();
    policy.touch("a");
    policy.touch("b");
    policy.touch("b");
    policy.remove("a");
    return [policy.evict(), policy.head];
  })()`,
        expected: ["b", null],
      },
      {
        name: "writing an existing key keeps a single copy with the new value",
        expr: `(() => {
    const cache = new MultiLevelCache([1, 2], () => new LruPolicy());
    cache.put("a", 1);
    cache.put("b", 2);
    cache.put("a", 10);
    return [cache.get("a"), cache.dump()];
  })()`,
        expected: [10, [["a"], ["b"]]],
      },
      {
        name: "a read of the deepest entry promotes it and loses nothing when every level is full",
        expr: `(() => {
    const cache = new MultiLevelCache([1, 1, 1], () => new LruPolicy());
    cache.put("a", 1);
    cache.put("b", 2);
    cache.put("c", 3);
    const before = cache.dump();
    cache.get("a");
    return [before, cache.dump()];
  })()`,
        expected: [
          [["c"], ["b"], ["a"]],
          [["a"], ["c"], ["b"]],
        ],
      },
      {
        name: "creates a level only when an entry is first pushed out of the one above",
        expr: `(() => {
    const cache = new MultiLevelCache([2, 2, 2], () => new LruPolicy());
    const sizes = [];
    for (const key of ["a", "b", "c", "d", "e"]) {
      cache.put(key, 1);
      sizes.push(cache.levels.length);
    }
    return sizes;
  })()`,
        expected: [1, 1, 2, 2, 3],
      },
      {
        name: "a delete frees its slot so the next write evicts nothing",
        expr: `(() => {
    const cache = new MultiLevelCache([2, 2], () => new LruPolicy());
    cache.put("a", 1);
    cache.put("b", 2);
    cache.delete("a");
    const spill = cache.put("c", 3);
    return [spill, cache.dump(), cache.get("a") ?? null];
  })()`,
        expected: [null, [["b", "c"]], null],
      },
      {
        name: "overwriting a key restarts its frequency under LFU",
        expr: `(() => {
    const cache = new MultiLevelCache([2, 2], () => new LfuPolicy());
    cache.put("a", 1);
    cache.get("a");
    cache.get("a");
    cache.put("a", 2);
    cache.put("b", 3);
    cache.get("b");
    cache.put("c", 4);
    return cache.dump();
  })()`,
        expected: [["b", "c"], ["a"]],
      },
      {
        name: "rejects a capacity list that is empty or holds a non positive number",
        expr: `(() => {
    const errors = [];
    for (const capacities of [[], [2, 0], [1.5]]) {
      try {
        new MultiLevelCache(capacities, () => new LruPolicy());
        errors.push("accepted");
      } catch (error) {
        errors.push(error.message);
      }
    }
    return errors;
  })()`,
        expected: Array(3).fill("capacities must be positive integers"),
      },
    ],
  },
  {
    id: "razorpay-in-memory-database",
    company: "razorpay",
    title: "In-memory database",
    prompt:
      "Build a small in-memory database as a machine-coding exercise. The reported brief gives no schema or query detail, so assume tables with typed columns, insert, select, update and delete with simple filters, and one index that speeds up equality lookups. Bad input should fail with a clear error and leave the stored data unchanged.",
    level: "level not stated (Software Engineer, Bengaluru)",
    round: "machine-coding",
    topic: "storage",
    patterns: ["Strategy", "Facade", "Specification"],
    evidence: "one",
    sources: [
      {
        label: "Razorpay Software Engineer, Bengaluru, Feb 2024 (Jointaro)",
        url: "https://www.jointaro.com/interviews/companies/razorpay/experiences/software-engineer-bengaluru-karnataka-february-1-2024-no-offer-positive-33f794a4/",
        kind: "candidate-report",
        year: 2024,
      },
    ],
    chapters: ["sysdes-storage-engines", "sysdes-databases-in-design"],
    answer: {
      ask: `<p>The source gives almost no detail, so the first job is to pin down scope out loud. Questions to ask: which column types are needed, and are nulls allowed? Is there a primary key or unique constraint? What does a filter look like: a list of comparisons that must all hold, or also OR and nesting? Are joins, ordering, limits or aggregates expected? How many indexes, what kind, and can one be created after data exists? Is a text query language needed, or is a method API fine? Do we need transactions, persistence or concurrent access?</p>
<p>Assumed scope: three column types (int, string, bool), every column required, no primary key. A filter is a list of conditions with a column, an operator and a value, all of which must hold. Operators are equality, inequality and the four orderings. One hash index per table, created at any time. A method API, no text parser. Out of scope: joins, ordering, transactions, persistence and threads.</p>`,
      entities: `<ul>
<li><b>Database</b> is the facade. It owns tables by name and exposes <code>createTable</code> and <code>table</code>.</li>
<li><b>Table</b> owns the schema, the rows (a Map from an internal row id to a row object), an optional index and the operations insert, select, update and delete. It also records the access path used by the last query in <code>lastPlan</code>.</li>
<li><b>HashIndex</b> maps one column's values to the set of row ids that hold that value. The table keeps it in step with every write.</li>
<li><b>TYPES</b> is a lookup of one validator function per column type.</li>
<li><b>OPERATORS</b> is a lookup of one comparison function per operator string.</li>
<li><b>Condition</b> is a plain object with a column, an operator and a value.</li>
</ul>
<p>Relationships: a database has many tables, a table has many rows and at most one index, and a table uses TYPES to validate values and OPERATORS to evaluate conditions.</p>`,
      design: `<p>The table is the only place where rows and the index live, and everything that can vary is a lookup table. Column types are entries in <code>TYPES</code> and operators are entries in <code>OPERATORS</code>. That is the Strategy pattern reduced to a map from name to function: adding a float type or a "like" operator is one entry and touches nothing else. A condition is a small object evaluated against a row, which is the Specification idea, and a filter is simply a list of them that must all hold. <b>Database</b> is a thin facade that hides how tables are stored.</p>
<p>Rows are stored in a Map keyed by an increasing internal id that is never reused, so the index can refer to a row without holding the row itself. The index is a <b>HashIndex</b>: value to Set of ids. Creating it walks the existing rows once.</p>
<ol>
<li><code>insert</code> validates the whole row first (unknown column, wrong type, missing column), then assigns the next id, stores a copy and adds the id to the index if there is one.</li>
<li><code>select</code>, <code>update</code> and <code>delete</code> all start from <code>matching(where)</code>. It first checks every column name, operator name and condition value type, so a typo or a string compared with an int fails loudly rather than matching nothing, and <code>select</code> checks the projected column names the same way. <code>update</code> and <code>delete</code> require the list of conditions, so leaving it out cannot wipe a table by accident. It then asks <code>candidates</code> for ids: if some condition is an equality on the indexed column it takes the index lookup, otherwise every row id. Finally it applies every condition to those candidates and sorts the ids, so the index is only a pre-filter and results are identical with or without it. <code>lastPlan</code> records which path ran so a demo can show the index being used.</li>
<li><code>select</code> returns copies, optionally projected to the requested columns, so callers cannot change stored rows behind the index.</li>
<li><code>update</code> validates the new values before touching any row, so a bad value changes nothing. It computes the matching ids before mutating, then for each row removes the old index entry, applies the change and adds the new entry. Computing the ids first also means a row whose changed column no longer matches the filter is not revisited.</li>
<li><code>delete</code> removes each matching row and its index entry and returns the count.</li>
</ol>
<p>A scan tests all n rows and an indexed equality lookup tests only the k rows in one bucket, and both then sort the matching ids. A hash index cannot serve a range filter, so those still scan; an ordered structure would be needed to change that. There is no atomicity across rows beyond validating up front. With threads the minimum is a read-write lock per table, and real databases use versioned rows.</p>`,
      extend: [
        "How would you support a range filter on the indexed column, and which structure replaces the hash map?",
        "How would you add a unique constraint or a primary key, and what must an update that changes the key check before it writes anything?",
        "How would you support several indexes and choose between them when a query has two indexed equality conditions?",
        "How would you add order by, limit and a count aggregate without changing how update and delete find their rows?",
        "How would you add transactions with rollback, and what would you record so that a failed update can be undone?",
      ],
      slips: `<ul>
<li>Validating while mutating, so a bad value half way through an update leaves some rows changed and others not.</li>
<li>Forgetting to maintain the index on update and delete, which gives stale hits or misses rows after a change.</li>
<li>Letting the index decide the result instead of only narrowing candidates, so a query with an indexed equality plus another condition ignores the second one.</li>
<li>Returning the stored row objects, which lets callers edit data without the index knowing.</li>
<li>Letting a typo in a column or operator name silently match nothing, and accepting the string "40" for an int column.</li>
<li>Looking up user supplied names with plain property access, so an operator or column called <code>constructor</code> slips through as valid. Check own properties only.</li>
<li>Writing a query parser first and running out of time before the tables, types and index work.</li>
</ul>`,
    },
    code: `const TYPES = {
  int: (value) => Number.isInteger(value),
  string: (value) => typeof value === "string",
  bool: (value) => typeof value === "boolean",
};

const OPERATORS = {
  "=": (a, b) => a === b,
  "!=": (a, b) => a !== b,
  "<": (a, b) => a < b,
  "<=": (a, b) => a <= b,
  ">": (a, b) => a > b,
  ">=": (a, b) => a >= b,
};

class HashIndex {
  constructor(column) {
    this.column = column;
    this.buckets = new Map();
  }
  add(id, row) {
    const value = row[this.column];
    if (!this.buckets.has(value)) this.buckets.set(value, new Set());
    this.buckets.get(value).add(id);
  }
  remove(id, row) {
    const ids = this.buckets.get(row[this.column]);
    ids.delete(id);
    if (ids.size === 0) this.buckets.delete(row[this.column]);
  }
  lookup(value) {
    return [...(this.buckets.get(value) || [])];
  }
}

class Table {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;
    this.rows = new Map();
    this.nextId = 1;
    this.index = null;
    this.lastPlan = "scan";
  }
  validate(values, partial) {
    for (const [column, value] of Object.entries(values)) {
      if (!Object.hasOwn(this.schema, column)) throw new Error("unknown column " + column);
      if (!TYPES[this.schema[column]](value)) throw new Error("column " + column + " expects " + this.schema[column]);
    }
    if (partial) return;
    for (const column of Object.keys(this.schema)) {
      if (!Object.hasOwn(values, column)) throw new Error("missing column " + column);
    }
  }
  createIndex(column) {
    if (!Object.hasOwn(this.schema, column)) throw new Error("unknown column " + column);
    this.index = new HashIndex(column);
    for (const [id, row] of this.rows) this.index.add(id, row);
  }
  insert(values) {
    this.validate(values, false);
    const id = this.nextId++;
    const row = { ...values };
    this.rows.set(id, row);
    if (this.index) this.index.add(id, row);
    return id;
  }
  candidates(where) {
    const probe = this.index && where.find((c) => c.column === this.index.column && c.op === "=");
    if (probe) {
      this.lastPlan = "index:" + probe.column;
      return this.index.lookup(probe.value);
    }
    this.lastPlan = "scan";
    return [...this.rows.keys()];
  }
  matching(where) {
    if (!Array.isArray(where)) throw new Error("where must be a list of conditions");
    for (const condition of where) {
      if (!Object.hasOwn(this.schema, condition.column)) throw new Error("unknown column " + condition.column);
      if (!Object.hasOwn(OPERATORS, condition.op)) throw new Error("unknown operator " + condition.op);
      if (!TYPES[this.schema[condition.column]](condition.value)) {
        throw new Error("column " + condition.column + " expects " + this.schema[condition.column]);
      }
    }
    return this.candidates(where)
      .filter((id) => where.every((c) => OPERATORS[c.op](this.rows.get(id)[c.column], c.value)))
      .sort((a, b) => a - b);
  }
  select(where = [], columns = null) {
    const ids = this.matching(where);
    for (const column of columns || []) {
      if (!Object.hasOwn(this.schema, column)) throw new Error("unknown column " + column);
    }
    return ids.map((id) => {
      const row = this.rows.get(id);
      if (!columns) return { ...row };
      return Object.fromEntries(columns.map((column) => [column, row[column]]));
    });
  }
  update(where, changes) {
    this.validate(changes, true);
    const ids = this.matching(where);
    for (const id of ids) {
      const row = this.rows.get(id);
      if (this.index) this.index.remove(id, row);
      Object.assign(row, changes);
      if (this.index) this.index.add(id, row);
    }
    return ids.length;
  }
  delete(where) {
    const ids = this.matching(where);
    for (const id of ids) {
      if (this.index) this.index.remove(id, this.rows.get(id));
      this.rows.delete(id);
    }
    return ids.length;
  }
}

class Database {
  constructor() {
    this.tables = new Map();
  }
  createTable(name, schema) {
    if (this.tables.has(name)) throw new Error("table exists " + name);
    for (const type of Object.values(schema)) {
      if (!Object.hasOwn(TYPES, type)) throw new Error("unknown type " + type);
    }
    const table = new Table(name, schema);
    this.tables.set(name, table);
    return table;
  }
  table(name) {
    if (!this.tables.has(name)) throw new Error("no table " + name);
    return this.tables.get(name);
  }
}
`,
    checks: [
      {
        name: "selects rows that satisfy a range filter",
        expr: `(() => {
    const db = new Database();
    const users = db.createTable("users", { name: "string", age: "int", active: "bool" });
    users.insert({ name: "alice", age: 30, active: true });
    users.insert({ name: "ben", age: 25, active: false });
    users.insert({ name: "chen", age: 30, active: false });
    return users.select([{ column: "age", op: ">=", value: 30 }], ["name"]);
  })()`,
        expected: [{ name: "alice" }, { name: "chen" }],
      },
      {
        name: "combines several conditions with AND",
        expr: `(() => {
    const db = new Database();
    const users = db.createTable("users", { name: "string", age: "int", active: "bool" });
    users.insert({ name: "alice", age: 30, active: true });
    users.insert({ name: "ben", age: 25, active: false });
    users.insert({ name: "chen", age: 30, active: false });
    return users.select([{ column: "age", op: "=", value: 30 }, { column: "active", op: "=", value: false }]);
  })()`,
        expected: [{ name: "chen", age: 30, active: false }],
      },
      {
        name: "answers an equality filter from the index once one exists",
        expr: `(() => {
    const db = new Database();
    const users = db.createTable("users", { name: "string", age: "int", active: "bool" });
    users.insert({ name: "alice", age: 30, active: true });
    users.insert({ name: "ben", age: 25, active: false });
    users.insert({ name: "chen", age: 30, active: false });
    users.createIndex("age");
    const rows = users.select([{ column: "age", op: "=", value: 30 }], ["name"]);
    return [rows, users.lastPlan];
  })()`,
        expected: [[{ name: "alice" }, { name: "chen" }], "index:age"],
      },
      {
        name: "scans when the filter column has no index",
        expr: `(() => {
    const db = new Database();
    const users = db.createTable("users", { name: "string", age: "int", active: "bool" });
    users.insert({ name: "alice", age: 30, active: true });
    users.insert({ name: "ben", age: 25, active: false });
    users.insert({ name: "chen", age: 30, active: false });
    users.createIndex("age");
    users.select([{ column: "name", op: "=", value: "ben" }]);
    return users.lastPlan;
  })()`,
        expected: "scan",
      },
      {
        name: "keeps the index in step with updates and deletes",
        expr: `(() => {
    const db = new Database();
    const users = db.createTable("users", { name: "string", age: "int", active: "bool" });
    users.insert({ name: "alice", age: 30, active: true });
    users.insert({ name: "ben", age: 25, active: false });
    users.insert({ name: "chen", age: 30, active: false });
    users.createIndex("age");
    const moved = users.update([{ column: "name", op: "=", value: "alice" }], { age: 31 });
    const at30 = users.select([{ column: "age", op: "=", value: 30 }], ["name"]);
    const at31 = users.select([{ column: "age", op: "=", value: 31 }], ["name"]);
    const removed = users.delete([{ column: "age", op: "=", value: 30 }]);
    return [moved, at30, at31, removed, users.select([], ["name"])];
  })()`,
        expected: [1, [{ name: "chen" }], [{ name: "alice" }], 1, [{ name: "alice" }, { name: "ben" }]],
      },
      {
        name: "rejects a value of the wrong type on insert",
        expr: `(() => {
    const db = new Database();
    const users = db.createTable("users", { name: "string", age: "int", active: "bool" });
    users.insert({ name: "alice", age: 30, active: true });
    users.insert({ name: "ben", age: 25, active: false });
    users.insert({ name: "chen", age: 30, active: false });
    try {
      users.insert({ name: "dee", age: "40", active: true });
      return "inserted";
    } catch (error) {
      return [error.message, users.select().length];
    }
  })()`,
        expected: ["column age expects int", 3],
      },
      {
        name: "rejects a filter on an unknown column",
        expr: `(() => {
    const db = new Database();
    const users = db.createTable("users", { name: "string", age: "int", active: "bool" });
    users.insert({ name: "alice", age: 30, active: true });
    users.insert({ name: "ben", age: 25, active: false });
    users.insert({ name: "chen", age: 30, active: false });
    try {
      users.select([{ column: "city", op: "=", value: "x" }]);
      return "ran";
    } catch (error) {
      return error.message;
    }
  })()`,
        expected: "unknown column city",
      },
      {
        name: "applies no change when an update has an invalid value",
        expr: `(() => {
    const db = new Database();
    const users = db.createTable("users", { name: "string", age: "int", active: "bool" });
    users.insert({ name: "alice", age: 30, active: true });
    users.insert({ name: "ben", age: 25, active: false });
    users.insert({ name: "chen", age: 30, active: false });
    try {
      users.update([], { age: 40, active: "yes" });
    } catch (error) {
      return [error.message, users.select([], ["age"])];
    }
  })()`,
        expected: ["column active expects bool", [{ age: 30 }, { age: 25 }, { age: 30 }]],
      },
      {
        name: "builds an index over rows that already exist",
        expr: `(() => {
    const db = new Database();
    const users = db.createTable("users", { name: "string", age: "int", active: "bool" });
    users.insert({ name: "alice", age: 30, active: true });
    users.insert({ name: "ben", age: 25, active: false });
    users.insert({ name: "chen", age: 30, active: false });
    users.createIndex("name");
    return [users.select([{ column: "name", op: "=", value: "ben" }], ["age"]), users.lastPlan];
  })()`,
        expected: [[{ age: 25 }], "index:name"],
      },
      {
        name: "rejects a bad operator, a mistyped filter value, a bad projection and a missing where list",
        expr: `(() => {
    const db = new Database();
    const users = db.createTable("users", { name: "string", age: "int" });
    users.insert({ name: "alice", age: 30 });
    const attempts = [
      () => users.select([{ column: "age", op: "constructor", value: 30 }]),
      () => users.select([{ column: "age", op: "=", value: "30" }]),
      () => users.select([], ["nme"]),
      () => users.delete(),
    ];
    const errors = attempts.map((attempt) => {
      try {
        attempt();
        return "ran";
      } catch (error) {
        return error.message;
      }
    });
    return [errors, users.select().length];
  })()`,
        expected: [
          [
            "unknown operator constructor",
            "column age expects int",
            "unknown column nme",
            "where must be a list of conditions",
          ],
          1,
        ],
      },
      {
        name: "rejects an insert with a missing or extra column and stores nothing",
        expr: `(() => {
    const db = new Database();
    const users = db.createTable("users", { name: "string", age: "int" });
    const errors = [{ name: "alice" }, { name: "bob", age: 1, city: "x" }, { name: "cy", age: 1.5 }].map((row) => {
      try {
        users.insert(row);
        return "inserted";
      } catch (error) {
        return error.message;
      }
    });
    return [errors, users.select().length, users.insert({ name: "dee", age: 2 })];
  })()`,
        expected: [["missing column age", "unknown column city", "column age expects int"], 0, 1],
      },
      {
        name: "keeps equality results identical with and without the index and removes emptied buckets",
        expr: `(() => {
    const build = (indexed) => {
      const db = new Database();
      const users = db.createTable("users", { name: "string", age: "int" });
      if (indexed) users.createIndex("age");
      for (const [name, age] of [["a", 1], ["b", 2], ["c", 1], ["d", 3]]) users.insert({ name, age });
      users.update([{ column: "name", op: "=", value: "c" }], { age: 3 });
      users.delete([{ column: "name", op: "=", value: "b" }]);
      return users;
    };
    const filter = [{ column: "age", op: "=", value: 3 }];
    const plain = build(false);
    const indexed = build(true);
    return [plain.select(filter), indexed.select(filter), indexed.index.buckets.has(2), [...indexed.index.buckets.keys()]];
  })()`,
        expected: [
          [
            { name: "c", age: 3 },
            { name: "d", age: 3 },
          ],
          [
            { name: "c", age: 3 },
            { name: "d", age: 3 },
          ],
          false,
          [1, 3],
        ],
      },
      {
        name: "refuses a second table with the same name",
        expr: `(() => {
    const db = new Database();
    db.createTable("t", { x: "int" });
    try {
      db.createTable("t", { x: "int" });
      return "created";
    } catch (error) {
      return error.message;
    }
  })()`,
        expected: "table exists t",
      },
    ],
  },
  {
    id: "razorpay-load-balancer",
    company: "razorpay",
    title: "Load balancer with round robin",
    prompt:
      "Build a load balancer that exposes HTTP endpoints, uses them to call an external service, and demonstrates round-robin distribution of the requests.",
    level: "Principal Software Engineer",
    round: "machine-coding",
    topic: "infra",
    patterns: ["Strategy", "Facade"],
    evidence: "one",
    sources: [
      {
        label: "Razorpay Principal Software Engineer, India (Jointaro)",
        url: "https://www.jointaro.com/interviews/companies/razorpay/experiences/principal-software-engineer-india-january-23-2025-no-offer-negative-428f435d/",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["sysdes-load-balancing-depth", "sysdes-fault-tolerance"],
    answer: {
      ask: `<p>Questions to ask: what do the endpoints do, register and remove backends, proxy a request, or both? Are the backends real HTTP services or simulated ones in the demo? Is round robin the only strategy, or must the strategy be replaceable? What counts as an unhealthy backend and how does one come back? Should a failed call be retried on another backend, and how many times? Are timeouts, sticky sessions or weights expected?</p>
<p>Assumed scope: three endpoints, one to add a backend, one to remove it and one to proxy a request. Strategies are round robin and least connections behind one interface, replaceable at runtime. A backend that fails several times in a row leaves the rotation and returns when a health probe passes. A failed call is retried on a different backend up to a limit. The HTTP call itself sits behind an injected function, and the balancing logic is kept apart from the HTTP layer so it can be run and checked without starting a server. The report names the endpoints, an external service and round robin; the strategies, health handling and retries are this answer's additions. Out of scope: weights, sticky sessions, TLS, rate limiting and running several balancer instances.</p>`,
      entities: `<ul>
<li><b>LoadBalancer</b> owns the backend list, the current strategy, the transport function, a failure threshold and an attempt limit. It exposes <code>add</code>, <code>remove</code>, <code>setStrategy</code>, <code>acquire</code>, <code>release</code>, <code>route</code> and <code>checkHealth</code>.</li>
<li><b>Backend</b> holds an id, an address, its registration sequence number, a count of open requests, a count of consecutive failures and a healthy flag.</li>
<li><b>Strategy</b> is the interface with one method, <code>pick(candidates)</code>. <b>RoundRobin</b> and <b>LeastConnections</b> implement it.</li>
<li><b>Transport</b> is an injected function that makes the real call and throws on failure. It is the external collaborator, and the only place a real HTTP client would appear.</li>
<li><b>Endpoints</b> is a thin router from method and path to balancer calls and status codes: 201, 204, 400, 404, 409, 200 and 503.</li>
</ul>
<p>Relationships: the balancer has many backends, uses one strategy and one transport, and the endpoints class uses the balancer.</p>`,
      design: `<p>The balancer depends on two abstractions and owns everything else. <b>Strategy</b> is where the pattern earns its place: round robin and least connections differ only in how they choose from a list of candidates, so the balancer can switch between them at runtime and a third one is a new class. The <b>Transport</b> function is the seam to the outside world. In production it would be an HTTP client call with a timeout. In the demo and in tests it is a fake that fails on demand, which keeps the whole program deterministic and runnable without a server. <b>Endpoints</b> is a facade that translates <code>POST /backends</code>, <code>DELETE /backends/id</code> and <code>POST /proxy</code> into balancer calls and maps problems to status codes: 400 for a missing field, 409 for a duplicate id, 404 for an unknown id and 503 when no backend can serve the request.</p>
<p><b>RoundRobin</b> remembers the registration sequence number of the last backend it picked, even if that call then failed, and picks the first candidate with a larger number, wrapping to the first one. Remembering a sequence number instead of an index keeps the rotation fair when a backend is removed or marked unhealthy, where a counter taken modulo the list length would skip or repeat backends. <b>LeastConnections</b> picks the candidate with the fewest open requests, and ties go to the earliest registered.</p>
<ol>
<li><code>acquire</code> builds the candidate list: backends that are healthy and not yet tried for this request.</li>
<li>The strategy picks one, its open request count goes up and the transport is called.</li>
<li>On success the failure count resets to zero and a lease holding the backend and the response is returned. The open count stays up until <code>release</code>, which models a response that is still streaming. Releasing the same lease twice is ignored, so the count cannot go negative. <code>route</code> is acquire followed by release for the ordinary case.</li>
<li>On failure the open count goes back down and the failure count goes up. At the threshold the backend is marked unhealthy. The loop then retries on a different backend until the attempt limit or until no candidates remain, and finally throws.</li>
<li><code>checkHealth</code> takes a probe function and returns recovered backends to the rotation. A real system would run it from a timer.</li>
</ol>
<p>This version is single threaded. A real one needs the round robin cursor and the open counters to be atomic, the backend list to be swapped as an immutable snapshot so a pick never sees a half-edited list, health probing on its own schedule, and retries only for idempotent requests. The trade-off is passive health detection from real traffic plus an explicit probe hook, instead of a full active health checker.</p>`,
      extend: [
        "How would you add weighted round robin so that a backend with weight 3 receives three requests for each one sent to a weight 1 backend, without sending them in a burst?",
        "How would you add sticky sessions so that requests with the same client id reach the same backend, and what happens to that mapping when the backend dies?",
        "How would you make the health check active, probing each backend on a timer, and how would you stop every probe firing at the same moment?",
        "How would you rate limit each client in front of the balancer without changing any strategy?",
        "What changes if the balancer itself runs as several instances behind one address, given that the round robin cursor and the open counts are now local to each instance?",
      ],
      slips: `<ul>
<li>Using a counter modulo the list length for round robin, which skips or repeats backends as soon as one is removed or marked down.</li>
<li>Building the HTTP server first and running out of time before the balancing logic works. Get the core running from code, then add the endpoints.</li>
<li>Calling an HTTP client directly inside the balancer, which makes it impossible to test failure paths.</li>
<li>Retrying the same failed backend, or retrying without a limit.</li>
<li>Not decrementing the open request count on the failure path, which makes least connections drift.</li>
<li>Letting the strategy pick from all backends instead of only the healthy untried ones, and not handling an empty pool.</li>
</ul>`,
    },
    code: `class Backend {
  constructor(id, address, seq) {
    this.id = id;
    this.address = address;
    this.seq = seq;
    this.active = 0;
    this.failures = 0;
    this.healthy = true;
  }
}

class RoundRobin {
  constructor() {
    this.last = -1;
  }
  pick(candidates) {
    const next = candidates.find((backend) => backend.seq > this.last) || candidates[0];
    this.last = next.seq;
    return next;
  }
}

class LeastConnections {
  pick(candidates) {
    return candidates.reduce((best, backend) => (backend.active < best.active ? backend : best));
  }
}

class LoadBalancer {
  constructor(strategy, transport, options = {}) {
    this.strategy = strategy;
    this.transport = transport;
    this.maxFailures = options.maxFailures || 2;
    this.maxAttempts = options.maxAttempts || 3;
    this.backends = [];
    this.seq = 0;
  }
  add(id, address) {
    if (this.backends.some((backend) => backend.id === id)) throw new Error("duplicate backend " + id);
    this.backends.push(new Backend(id, address, this.seq++));
  }
  remove(id) {
    const before = this.backends.length;
    this.backends = this.backends.filter((backend) => backend.id !== id);
    return this.backends.length < before;
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  acquire(request) {
    const tried = new Set();
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      const candidates = this.backends.filter((backend) => backend.healthy && !tried.has(backend.id));
      if (candidates.length === 0) break;
      const backend = this.strategy.pick(candidates);
      tried.add(backend.id);
      backend.active++;
      try {
        const response = this.transport(backend, request);
        backend.failures = 0;
        return { backend, response };
      } catch (error) {
        backend.active--;
        backend.failures++;
        if (backend.failures >= this.maxFailures) backend.healthy = false;
      }
    }
    throw new Error("no backend could serve the request");
  }
  release(lease) {
    if (lease.released) return;
    lease.released = true;
    lease.backend.active--;
  }
  route(request) {
    const lease = this.acquire(request);
    this.release(lease);
    return { backend: lease.backend.id, response: lease.response };
  }
  checkHealth(probe) {
    for (const backend of this.backends) {
      if (!backend.healthy && probe(backend)) {
        backend.healthy = true;
        backend.failures = 0;
      }
    }
  }
}

class Endpoints {
  constructor(balancer) {
    this.balancer = balancer;
  }
  handle(method, path, body) {
    if (method === "POST" && path === "/backends") {
      if (!body || !body.id || !body.address) return { status: 400, body: "id and address are required" };
      try {
        this.balancer.add(body.id, body.address);
      } catch (error) {
        return { status: 409, body: error.message };
      }
      return { status: 201 };
    }
    if (method === "DELETE" && path.startsWith("/backends/")) {
      return { status: this.balancer.remove(path.slice("/backends/".length)) ? 204 : 404 };
    }
    if (method === "POST" && path === "/proxy") {
      try {
        return { status: 200, body: this.balancer.route(body) };
      } catch (error) {
        return { status: 503, body: error.message };
      }
    }
    return { status: 404 };
  }
}
`,
    checks: [
      {
        name: "round robin cycles through the backends in order",
        expr: `(() => {
    const down = new Set();
    const transport = (backend, request) => {
      if (down.has(backend.id)) throw new Error("connection refused");
      return backend.id + " served " + request.path;
    };
    const make = (strategy, options) => {
      const lb = new LoadBalancer(strategy, transport, options);
      ["a", "b", "c"].forEach((id) => lb.add(id, id + ".internal:80"));
      return lb;
    };
    const ids = (lb, n) => Array.from({ length: n }, () => lb.route({ path: "/x" }).backend);
    return ids(make(new RoundRobin()), 4);
  })()`,
        expected: ["a", "b", "c", "a"],
      },
      {
        name: "round robin keeps its place when a backend is removed",
        expr: `(() => {
    const down = new Set();
    const transport = (backend, request) => {
      if (down.has(backend.id)) throw new Error("connection refused");
      return backend.id + " served " + request.path;
    };
    const make = (strategy, options) => {
      const lb = new LoadBalancer(strategy, transport, options);
      ["a", "b", "c"].forEach((id) => lb.add(id, id + ".internal:80"));
      return lb;
    };
    const ids = (lb, n) => Array.from({ length: n }, () => lb.route({ path: "/x" }).backend);
    const lb = make(new RoundRobin());
    const first = ids(lb, 1);
    lb.remove("b");
    return first.concat(ids(lb, 2));
  })()`,
        expected: ["a", "c", "a"],
      },
      {
        name: "retries on the next backend and marks a failing one unhealthy",
        expr: `(() => {
    const down = new Set();
    const transport = (backend, request) => {
      if (down.has(backend.id)) throw new Error("connection refused");
      return backend.id + " served " + request.path;
    };
    const make = (strategy, options) => {
      const lb = new LoadBalancer(strategy, transport, options);
      ["a", "b", "c"].forEach((id) => lb.add(id, id + ".internal:80"));
      return lb;
    };
    const ids = (lb, n) => Array.from({ length: n }, () => lb.route({ path: "/x" }).backend);
    const lb = make(new RoundRobin(), { maxFailures: 1 });
    down.add("a");
    const served = ids(lb, 3);
    return [served, lb.backends.map((backend) => backend.healthy)];
  })()`,
        expected: [
          ["b", "c", "b"],
          [false, true, true],
        ],
      },
      {
        name: "reports an error when every backend is down",
        expr: `(() => {
    const down = new Set();
    const transport = (backend, request) => {
      if (down.has(backend.id)) throw new Error("connection refused");
      return backend.id + " served " + request.path;
    };
    const make = (strategy, options) => {
      const lb = new LoadBalancer(strategy, transport, options);
      ["a", "b", "c"].forEach((id) => lb.add(id, id + ".internal:80"));
      return lb;
    };
    const ids = (lb, n) => Array.from({ length: n }, () => lb.route({ path: "/x" }).backend);
    const lb = make(new RoundRobin());
    down.add("a");
    down.add("b");
    down.add("c");
    try {
      lb.route({ path: "/x" });
      return "served";
    } catch (error) {
      return error.message;
    }
  })()`,
        expected: "no backend could serve the request",
      },
      {
        name: "stops after the maximum number of attempts",
        expr: `(() => {
    const down = new Set();
    const transport = (backend, request) => {
      if (down.has(backend.id)) throw new Error("connection refused");
      return backend.id + " served " + request.path;
    };
    const make = (strategy, options) => {
      const lb = new LoadBalancer(strategy, transport, options);
      ["a", "b", "c"].forEach((id) => lb.add(id, id + ".internal:80"));
      return lb;
    };
    const ids = (lb, n) => Array.from({ length: n }, () => lb.route({ path: "/x" }).backend);
    const lb = make(new RoundRobin(), { maxAttempts: 1 });
    down.add("a");
    try {
      lb.route({ path: "/x" });
      return "served";
    } catch (error) {
      return error.message;
    }
  })()`,
        expected: "no backend could serve the request",
      },
      {
        name: "least connections prefers the backend with fewer open requests",
        expr: `(() => {
    const down = new Set();
    const transport = (backend, request) => {
      if (down.has(backend.id)) throw new Error("connection refused");
      return backend.id + " served " + request.path;
    };
    const make = (strategy, options) => {
      const lb = new LoadBalancer(strategy, transport, options);
      ["a", "b", "c"].forEach((id) => lb.add(id, id + ".internal:80"));
      return lb;
    };
    const ids = (lb, n) => Array.from({ length: n }, () => lb.route({ path: "/x" }).backend);
    const lb = make(new LeastConnections());
    const one = lb.acquire({ path: "/1" });
    const two = lb.acquire({ path: "/2" });
    const three = lb.acquire({ path: "/3" });
    lb.release(two);
    const next = lb.acquire({ path: "/4" });
    return [one.backend.id, two.backend.id, three.backend.id, next.backend.id];
  })()`,
        expected: ["a", "b", "c", "b"],
      },
      {
        name: "swaps the strategy at runtime without touching the balancer",
        expr: `(() => {
    const down = new Set();
    const transport = (backend, request) => {
      if (down.has(backend.id)) throw new Error("connection refused");
      return backend.id + " served " + request.path;
    };
    const make = (strategy, options) => {
      const lb = new LoadBalancer(strategy, transport, options);
      ["a", "b", "c"].forEach((id) => lb.add(id, id + ".internal:80"));
      return lb;
    };
    const ids = (lb, n) => Array.from({ length: n }, () => lb.route({ path: "/x" }).backend);
    const lb = make(new RoundRobin());
    const before = ids(lb, 2);
    lb.acquire({ path: "/hold" });
    lb.setStrategy(new LeastConnections());
    return before.concat(ids(lb, 2));
  })()`,
        expected: ["a", "b", "a", "a"],
      },
      {
        name: "a recovered backend rejoins the rotation after a health check",
        expr: `(() => {
    const down = new Set();
    const transport = (backend, request) => {
      if (down.has(backend.id)) throw new Error("connection refused");
      return backend.id + " served " + request.path;
    };
    const make = (strategy, options) => {
      const lb = new LoadBalancer(strategy, transport, options);
      ["a", "b", "c"].forEach((id) => lb.add(id, id + ".internal:80"));
      return lb;
    };
    const ids = (lb, n) => Array.from({ length: n }, () => lb.route({ path: "/x" }).backend);
    const lb = make(new RoundRobin(), { maxFailures: 1 });
    down.add("a");
    ids(lb, 1);
    down.delete("a");
    lb.checkHealth((backend) => !down.has(backend.id));
    return ids(lb, 4);
  })()`,
        expected: ["c", "a", "b", "c"],
      },
      {
        name: "marks a backend unhealthy only after its second consecutive failure and leaks no open request",
        expr: `(() => {
    const down = new Set();
    const transport = (backend, request) => {
      if (down.has(backend.id)) throw new Error("connection refused");
      return backend.id + " served " + request.path;
    };
    const lb = new LoadBalancer(new RoundRobin(), transport);
    ["a", "b", "c"].forEach((id) => lb.add(id, id + ".internal:80"));
    down.add("a");
    const served = [];
    const health = [];
    for (let i = 0; i < 3; i++) {
      served.push(lb.route({ path: "/x" }).backend);
      health.push(lb.backends[0].healthy);
    }
    return [served, health, lb.backends.map((backend) => backend.active)];
  })()`,
        expected: [
          ["b", "c", "b"],
          [true, true, false],
          [0, 0, 0],
        ],
      },
      {
        name: "a success resets the failure count so one more failure does not remove the backend",
        expr: `(() => {
    const down = new Set();
    const transport = (backend, request) => {
      if (down.has(backend.id)) throw new Error("connection refused");
      return backend.id + " served " + request.path;
    };
    const lb = new LoadBalancer(new RoundRobin(), transport);
    ["a", "b"].forEach((id) => lb.add(id, id + ".internal:80"));
    down.add("a");
    lb.route({ path: "/x" });
    const afterFailure = lb.backends[0].failures;
    down.delete("a");
    lb.route({ path: "/x" });
    lb.route({ path: "/x" });
    const afterSuccess = lb.backends[0].failures;
    down.add("a");
    const served = lb.route({ path: "/x" }).backend;
    return [afterFailure, afterSuccess, lb.backends[0].healthy, served];
  })()`,
        expected: [1, 0, true, "b"],
      },
      {
        name: "ignores a second release of the same lease",
        expr: `(() => {
    const lb = new LoadBalancer(new LeastConnections(), (backend) => backend.id);
    lb.add("a", "a.internal:80");
    const first = lb.acquire({ path: "/x" });
    const second = lb.acquire({ path: "/y" });
    lb.release(first);
    lb.release(first);
    return [lb.backends[0].active, second.backend.id];
  })()`,
        expected: [1, "a"],
      },
      {
        name: "the endpoints answer 400, 409 and 404 for bad input and remove a backend",
        expr: `(() => {
    const api = new Endpoints(new LoadBalancer(new RoundRobin(), (backend) => backend.id));
    const body = { id: "a", address: "a.internal:80" };
    return [
      api.handle("POST", "/backends", {}).status,
      api.handle("POST", "/backends", body).status,
      api.handle("POST", "/backends", body).status,
      api.handle("DELETE", "/backends/zz").status,
      api.handle("DELETE", "/backends/a").status,
      api.handle("POST", "/proxy", { path: "/p" }).status,
    ];
  })()`,
        expected: [400, 201, 409, 404, 204, 503],
      },
      {
        name: "the endpoints register a backend and proxy a request",
        expr: `(() => {
    const down = new Set();
    const transport = (backend, request) => {
      if (down.has(backend.id)) throw new Error("connection refused");
      return backend.id + " served " + request.path;
    };
    const make = (strategy, options) => {
      const lb = new LoadBalancer(strategy, transport, options);
      ["a", "b", "c"].forEach((id) => lb.add(id, id + ".internal:80"));
      return lb;
    };
    const ids = (lb, n) => Array.from({ length: n }, () => lb.route({ path: "/x" }).backend);
    const api = new Endpoints(new LoadBalancer(new RoundRobin(), transport));
    const empty = api.handle("POST", "/proxy", { path: "/p" });
    const created = api.handle("POST", "/backends", { id: "a", address: "a.internal:80" });
    const proxied = api.handle("POST", "/proxy", { path: "/p" });
    return [empty.status, created.status, proxied, api.handle("GET", "/nope").status];
  })()`,
        expected: [503, 201, { status: 200, body: { backend: "a", response: "a served /p" } }, 404],
      },
    ],
  },
  {
    id: "flipkart-interviewer-allocation",
    company: "flipkart",
    title: "Interviewer allocation",
    prompt:
      "Interviewers and interviewees each register for one of two interview types and list the time slots they prefer, and the system pairs them by type and slot. The code should be object oriented, easy to extend with a new interview type or a new slot, ready to demonstrate, and clear about errors such as a slot outside the allowed range.",
    level: "SDE-2",
    round: "machine-coding",
    topic: "matching",
    patterns: ["Strategy", "Registry"],
    evidence: "one",
    sources: [
      {
        label: "Flipkart Interview Experience for SDE-2 (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-for-sde-2-3/",
        kind: "candidate-report",
      },
    ],
    chapters: [],
    answer: {
      ask: `<p>Questions to ask: how are the two interview types identified, and could there be more later? Are slots fixed-length, and drawn from a fixed list? Does each person give one slot or several in order of preference? Can one interviewer take several interviews in different slots? Should pairing happen as people register or in a batch run? What should happen to someone who cannot be matched? Does it matter which of several free interviewers is chosen?</p>
<p>The report names two interview types, preferred timings, assignment by type and timing, follow-ups about adding a type or a slot, and a run with an out-of-range slot. Everything else below is assumption. Assumed scope: types and slots are configured as data and can be added at runtime. A slot is an hour number from an allowed set. An interviewer offers a set of slots, an interviewee lists slots in preference order. An interviewer takes at most one interview per slot and an interviewee gets at most one interview. Allocation is a batch call that walks interviewees in registration order and leaves unmatched people waiting for the next call. Out of scope: time zones, durations longer than a slot, notifications and rescheduling.</p>`,
      entities: `<ul>
<li><b>Scheduler</b> is the service. It owns the set of interview types, the set of allowed slots, both registries and the chosen assignment strategy, and exposes <code>registerInterviewer</code>, <code>registerInterviewee</code>, <code>allocate</code>, <code>withdraw</code> and <code>unmatched</code>.</li>
<li><b>Interviewer</b> holds an id, a type, the set of slots offered and the set of slots already booked.</li>
<li><b>Interviewee</b> holds an id, a type, an ordered list of preferred slots and the interview they were given, if any.</li>
<li><b>Interview</b> is the plain result: interviewee, interviewer, type and slot.</li>
<li><b>Assignment strategy</b> is an interface with <code>pick(candidates)</code>, implemented by <b>FirstFree</b> and <b>LeastLoaded</b>. It chooses among interviewers who are equally valid.</li>
</ul>
<p>Relationships: the scheduler has many interviewers and many interviewees, uses one strategy, and creates an Interview each time it pairs two people.</p>`,
      design: `<p>The design goal is that adding a type or a slot never edits the matching code. The scheduler holds both as data: a Set of type names and a Set of allowed slots. <code>addType</code> and <code>addSlot</code> are single calls, and matching only ever compares a type value and a slot value for equality. If a new type later needs behaviour of its own, such as a different duration or a panel, the Set becomes a registry of type objects, but the matching loop stays the same.</p>
<p>Validation sits at the boundary in one <code>check</code> method. It rejects a duplicate id, an unknown type, an empty slot list and any slot that is not in the allowed set, each with a message that names the problem, and nothing is stored when it throws. That covers the out-of-range slot case directly.</p>
<p>Which interviewer gets a given interviewee is the only policy that varies, so it is isolated behind the assignment strategy. <b>FirstFree</b> takes the earliest registered. <b>LeastLoaded</b> takes the one with the fewest booked slots, which spreads the work. This is the Strategy pattern, and it matters because fairness among interviewers is the first thing an interviewer will ask you to change.</p>
<ol>
<li><code>allocate</code> walks interviewees in registration order and skips anyone who already has an interview, which makes the call repeatable.</li>
<li>For each preferred slot in order it asks <code>freeInterviewers(type, slot)</code>: interviewers of the same type who offer that slot and have not booked it.</li>
<li>If the list is empty it tries the next preferred slot. Otherwise the strategy picks one, the slot is added to that interviewer's booked set and an Interview is recorded on the interviewee.</li>
<li>Someone with no free option stays unmatched, and <code>unmatched</code> lists them.</li>
<li><code>withdraw</code> removes an interviewee and frees any slot they held, so the next <code>allocate</code> can offer it to someone waiting.</li>
</ol>
<p>Cost is about interviewees times slots each times interviewers; indexing interviewers by type and slot would make each lookup constant time. The trade-off is that first come first served is greedy, not a maximum matching. If one interviewer offers slots 10 and 11, a first person who lists 10 and 11 takes 10, and a second person who lists only 10 is left out although both could be seated. Fixing that needs augmenting paths and means moving someone who may already have been told their slot, so I kept the greedy rule and would name the limit out loud. For concurrent callers, wrap <code>allocate</code> in a lock or book with a conditional write on the interviewer and slot.</p>`,
      extend: [
        "How would you add an interview type that needs a panel of two interviewers, and where does that rule live so that the matching loop stays generic?",
        "How would you change allocation to maximise the number of pairs, and what do you do about people who were already told their slot?",
        "How would you move from hour numbers to real time ranges, so that a 90 minute interview blocks two neighbouring slots?",
        "How would you allocate as each person registers instead of in a batch, and what ordering guarantee do waiting people get?",
        "What should happen when an interviewer is removed after being booked, and who needs to be told?",
      ],
      slips: `<ul>
<li>Hard-coding the two types and the slot range as enums or if-else chains, so that the follow-up "add a new type" means editing the matching code.</li>
<li>Skipping validation, throwing a bare generic exception, or validating after the person has already been stored, so a rejected slot still leaves a half-registered person.</li>
<li>Matching on slot only and forgetting the type, or booking one interviewer twice in the same slot, or giving one interviewee two interviews.</li>
<li>Making <code>allocate</code> non-repeatable, so a second call duplicates interviews or loses the first ones.</li>
<li>Reaching for an optimal matching algorithm before the basic flow, the demo and the edge cases all work. The brief stresses a demo that runs and handles edge cases.</li>
</ul>`,
    },
    code: `class Interviewer {
  constructor(id, type, slots) {
    this.id = id;
    this.type = type;
    this.slots = new Set(slots);
    this.booked = new Set();
  }
}

class Interviewee {
  constructor(id, type, slots) {
    this.id = id;
    this.type = type;
    this.slots = slots;
    this.interview = null;
  }
}

class FirstFree {
  pick(candidates) {
    return candidates[0];
  }
}

class LeastLoaded {
  pick(candidates) {
    return candidates.reduce((best, one) => (one.booked.size < best.booked.size ? one : best));
  }
}

class Scheduler {
  constructor(types, slots, strategy) {
    this.types = new Set(types);
    this.allowedSlots = new Set(slots);
    this.strategy = strategy;
    this.interviewers = new Map();
    this.interviewees = new Map();
  }
  addType(name) {
    this.types.add(name);
  }
  addSlot(slot) {
    this.allowedSlots.add(slot);
  }
  check(registry, id, type, slots) {
    if (registry.has(id)) throw new Error("duplicate id " + id);
    if (!this.types.has(type)) throw new Error("unknown interview type " + type);
    if (slots.length === 0) throw new Error("at least one slot is required");
    for (const slot of slots) {
      if (!this.allowedSlots.has(slot)) throw new Error("slot " + slot + " is not offered");
    }
  }
  registerInterviewer(id, type, slots) {
    this.check(this.interviewers, id, type, slots);
    this.interviewers.set(id, new Interviewer(id, type, slots));
  }
  registerInterviewee(id, type, slots) {
    this.check(this.interviewees, id, type, slots);
    this.interviewees.set(id, new Interviewee(id, type, slots));
  }
  freeInterviewers(type, slot) {
    return [...this.interviewers.values()].filter(
      (one) => one.type === type && one.slots.has(slot) && !one.booked.has(slot)
    );
  }
  allocate() {
    const made = [];
    for (const person of this.interviewees.values()) {
      if (person.interview) continue;
      for (const slot of person.slots) {
        const free = this.freeInterviewers(person.type, slot);
        if (free.length === 0) continue;
        const interviewer = this.strategy.pick(free);
        interviewer.booked.add(slot);
        person.interview = { interviewee: person.id, interviewer: interviewer.id, type: person.type, slot };
        made.push(person.interview);
        break;
      }
    }
    return made;
  }
  withdraw(id) {
    const person = this.interviewees.get(id);
    if (!person) return false;
    if (person.interview) this.interviewers.get(person.interview.interviewer).booked.delete(person.interview.slot);
    this.interviewees.delete(id);
    return true;
  }
  unmatched() {
    return [...this.interviewees.values()].filter((person) => !person.interview).map((person) => person.id);
  }
}
`,
    checks: [
      {
        name: "pairs people who share an interview type and a slot",
        expr: `(() => {
    const make = (strategy) => new Scheduler(["DSA", "LLD"], [10, 11, 12], strategy || new FirstFree());
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const s = make();
    s.registerInterviewer("i1", "DSA", [10]);
    s.registerInterviewee("p1", "DSA", [10]);
    s.registerInterviewee("p2", "LLD", [10]);
    return [s.allocate(), s.unmatched()];
  })()`,
        expected: [[{ interviewee: "p1", interviewer: "i1", type: "DSA", slot: 10 }], ["p2"]],
      },
      {
        name: "falls back to the next preferred slot when the first is taken",
        expr: `(() => {
    const make = (strategy) => new Scheduler(["DSA", "LLD"], [10, 11, 12], strategy || new FirstFree());
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const s = make();
    s.registerInterviewer("i1", "DSA", [10, 11]);
    s.registerInterviewee("p1", "DSA", [10]);
    s.registerInterviewee("p2", "DSA", [10, 11]);
    return s.allocate().map((one) => one.interviewee + "@" + one.slot);
  })()`,
        expected: ["p1@10", "p2@11"],
      },
      {
        name: "never books one interviewer twice in the same slot",
        expr: `(() => {
    const make = (strategy) => new Scheduler(["DSA", "LLD"], [10, 11, 12], strategy || new FirstFree());
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const s = make();
    s.registerInterviewer("i1", "DSA", [10]);
    s.registerInterviewee("p1", "DSA", [10]);
    s.registerInterviewee("p2", "DSA", [10]);
    return [s.allocate().length, s.unmatched()];
  })()`,
        expected: [1, ["p2"]],
      },
      {
        name: "rejects a slot outside the offered range",
        expr: `(() => {
    const make = (strategy) => new Scheduler(["DSA", "LLD"], [10, 11, 12], strategy || new FirstFree());
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const s = make();
    return fail(() => s.registerInterviewee("p1", "DSA", [10, 18]));
  })()`,
        expected: "slot 18 is not offered",
      },
      {
        name: "accepts a new slot after it is added",
        expr: `(() => {
    const make = (strategy) => new Scheduler(["DSA", "LLD"], [10, 11, 12], strategy || new FirstFree());
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const s = make();
    s.addSlot(18);
    s.registerInterviewee("p1", "DSA", [18]);
    return s.interviewees.has("p1");
  })()`,
        expected: true,
      },
      {
        name: "accepts a new interview type after it is added",
        expr: `(() => {
    const make = (strategy) => new Scheduler(["DSA", "LLD"], [10, 11, 12], strategy || new FirstFree());
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const s = make();
    const before = fail(() => s.registerInterviewer("i1", "HR", [10]));
    s.addType("HR");
    s.registerInterviewer("i1", "HR", [10]);
    s.registerInterviewee("p1", "HR", [10]);
    return [before, s.allocate().length];
  })()`,
        expected: ["unknown interview type HR", 1],
      },
      {
        name: "least loaded spreads interviews while first free piles them on one person",
        expr: `(() => {
    const make = (strategy) => new Scheduler(["DSA", "LLD"], [10, 11, 12], strategy || new FirstFree());
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const run = (strategy) => {
      const s = make(strategy);
      s.registerInterviewer("i1", "DSA", [10, 11]);
      s.registerInterviewer("i2", "DSA", [10, 11]);
      s.registerInterviewee("p1", "DSA", [10]);
      s.registerInterviewee("p2", "DSA", [11]);
      return s.allocate().map((one) => one.interviewer);
    };
    return [run(new FirstFree()), run(new LeastLoaded())];
  })()`,
        expected: [
          ["i1", "i1"],
          ["i1", "i2"],
        ],
      },
      {
        name: "a withdrawn interviewee frees the slot for someone waiting",
        expr: `(() => {
    const make = (strategy) => new Scheduler(["DSA", "LLD"], [10, 11, 12], strategy || new FirstFree());
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const s = make();
    s.registerInterviewer("i1", "DSA", [10]);
    s.registerInterviewee("p1", "DSA", [10]);
    s.registerInterviewee("p2", "DSA", [10]);
    s.allocate();
    const withdrawn = s.withdraw("p1");
    return [withdrawn, s.allocate().map((one) => one.interviewee), s.withdraw("nobody")];
  })()`,
        expected: [true, ["p2"], false],
      },
      {
        name: "stores nothing for a rejected registration and lets the id be used again",
        expr: `(() => {
    const make = (strategy) => new Scheduler(["DSA", "LLD"], [10, 11, 12], strategy || new FirstFree());
    const s = make();
    const sizes = [];
    for (const attempt of [() => s.registerInterviewee("p1", "DSA", [10, 18]), () => s.registerInterviewer("i1", "OPS", [10])]) {
      try {
        attempt();
      } catch (error) {
        sizes.push(error.message);
      }
    }
    sizes.push(s.interviewees.size, s.interviewers.size);
    s.registerInterviewee("p1", "DSA", [10]);
    sizes.push(s.interviewees.size);
    return sizes;
  })()`,
        expected: ["slot 18 is not offered", "unknown interview type OPS", 0, 0, 1],
      },
      {
        name: "gives an interviewee the earliest preferred slot that is free",
        expr: `(() => {
    const make = (strategy) => new Scheduler(["DSA", "LLD"], [10, 11, 12], strategy || new FirstFree());
    const s = make();
    s.registerInterviewer("i1", "DSA", [10, 11, 12]);
    s.registerInterviewee("p1", "DSA", [12, 10, 11]);
    return s.allocate().map((one) => one.slot);
  })()`,
        expected: [12],
      },
      {
        name: "allocating again does not create duplicate interviews",
        expr: `(() => {
    const make = (strategy) => new Scheduler(["DSA", "LLD"], [10, 11, 12], strategy || new FirstFree());
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const s = make();
    s.registerInterviewer("i1", "DSA", [10]);
    s.registerInterviewee("p1", "DSA", [10]);
    return [s.allocate().length, s.allocate().length];
  })()`,
        expected: [1, 0],
      },
      {
        name: "rejects a duplicate id and an empty slot list",
        expr: `(() => {
    const make = (strategy) => new Scheduler(["DSA", "LLD"], [10, 11, 12], strategy || new FirstFree());
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const s = make();
    s.registerInterviewer("i1", "DSA", [10]);
    return [fail(() => s.registerInterviewer("i1", "DSA", [11])), fail(() => s.registerInterviewee("p1", "DSA", []))];
  })()`,
        expected: ["duplicate id i1", "at least one slot is required"],
      },
    ],
  },
  {
    id: "meesho-car-pooling",
    company: "meesho",
    title: "Car pooling system",
    prompt:
      "Design and build a working car pooling system within about an hour. The interviewer reportedly looked at the overall approach, the design of classes and modules, and whether the code was clean and executable.",
    level: "SDE-1 (open campus)",
    round: "machine-coding",
    topic: "matching",
    patterns: ["Strategy", "Facade"],
    evidence: "one",
    sources: [
      {
        label: "Meesho SDE-1 Open Campus Interview Experience (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/meesho-sde-1-open-campus-interview-experience-2025/",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["sysdes-transactions-isolation"],
    answer: {
      ask: `<p>The source lists no requirements, so state them. That drivers offer rides and riders search for and book seats is this answer's reading of the name. Questions to ask: is a ride a single hop from an origin to a destination, or does it have stops? Is the price per seat fixed by the driver? Can a rider book several seats at once? Who can cancel, and what happens to existing bookings? Does a rider search for an exact departure time or for anything after a time? How should results be ranked? Is everything in memory in one process?</p>
<p>Assumed scope: a ride is direct, with a named origin, a named destination, a departure time as a number of minutes, a seat count and a price per seat. A rider searches by exact origin and destination, the earliest acceptable departure and a number of seats. Booking is immediate with no driver approval. A rider can cancel a booking, and only the driver can cancel a ride. Results are ordered by a replaceable ranking rule. Out of scope: intermediate stops, map distances, payments and ratings.</p>`,
      entities: `<ul>
<li><b>CarPool</b> is the service. It owns the rides, a lookup from booking id to ride, the ranking strategy and an injected clock, and exposes <code>offer</code>, <code>search</code>, <code>book</code>, <code>match</code>, <code>cancelBooking(rider, bookingId)</code> and <code>cancelRide(driver, rideId)</code>.</li>
<li><b>Ride</b> holds the id, driver, origin, destination, departure, seat count, price, its bookings and a cancelled flag. Free seats are computed from the bookings.</li>
<li><b>Booking</b> is a plain record of an id, a rider and a number of seats, owned by its ride.</li>
<li><b>Ranking strategy</b> is an interface with <code>compare(a, b)</code>, implemented by <b>EarliestFirst</b> and <b>CheapestFirst</b>.</li>
<li><b>Clock</b> is a function passed to the service that returns the current time.</li>
</ul>
<p>Relationships: the service has many rides, a ride has many bookings, and the service uses one ranking strategy and one clock.</p>`,
      design: `<p>The shape is one service over two entities, kept honest by a few rules. A <b>Ride</b> owns its bookings, and free seats are always computed as seats minus the sum of booked seats instead of being kept in a counter. A counter can drift when a booking or a whole ride is cancelled, while a computed value cannot. Ranking is the Strategy pattern: <code>compare(a, b)</code> with the id as the last tie-breaker, so the order is always deterministic, and adding a rule is a new class. The clock is injected as a function so that rules about departed rides can be tested without real time.</p>
<ol>
<li><code>offer</code> validates a whole number of seats of at least one, a price that is not negative, different origin and destination, and a departure after the current time, then stores the ride under a sequential id.</li>
<li><code>search</code> keeps rides that are bookable for this rider (not cancelled, not departed, not driven by the rider, not already booked by the rider), on the requested route, departing no earlier than asked and with enough free seats. A search that leaves out the earliest time means "from now", and asking for fewer than one seat is an error. It sorts them with the ranking strategy and returns the ids.</li>
<li><code>book</code> checks the booking rules again at the moment of booking (not cancelled, not departed, not the driver, not already booked), because a search result can be stale, then checks the seat count is a whole number of at least one and that enough seats are free, writes the booking and records which ride holds it.</li>
<li><code>match</code> is search followed by booking the first result, or null when nothing fits. It is the automatic matching path.</li>
<li><code>cancelBooking</code> takes the rider and the booking id, finds the ride through the lookup, refuses a booking that belongs to someone else, and removes it, so its seats are free again by recalculation.</li>
<li><code>cancelRide</code> is allowed only for the ride's driver. It marks the ride cancelled, clears its bookings and returns the affected riders so a caller can notify them.</li>
</ol>
<p>Booking is a check-then-act on free seats. In this single threaded version that is atomic. With real concurrency it needs a lock per ride, not one global lock, or a conditional database update such as "set booked = booked + n where seats - booked >= n". Search may be stale, and booking is the one place that decides. Search scans every ride and sums its bookings, which is O(R) with a small factor for the bookings per ride, plus the sort of the results. Keeping a map from origin and destination to rides would cut that to the rides on the route. Treating a ride as direct keeps seat counting trivial. With stops, occupancy has to be tracked per segment.</p>`,
      extend: [
        "How would you support intermediate stops, so that a rider boards at the second stop and leaves at the fourth, and how do you check seat capacity along the way?",
        "How would you add a driver approval step, and which states does a booking go through?",
        "How would you match by distance from the rider's pickup point instead of exact place names, and what index would you use?",
        "How would you stop two riders from taking the last seat at the same moment when bookings arrive at several servers?",
        "How would you add a ranking rule that combines price and departure time, and would any class other than a new strategy change?",
      ],
      slips: `<ul>
<li>Accepting zero or negative seats, so a negative booking quietly adds seats to the ride.</li>
<li>Letting anyone cancel any booking because the id is the only thing checked.</li>
<li>Keeping a seats-left counter and forgetting to adjust it when a booking or a whole ride is cancelled.</li>
<li>Trusting a search result when booking, with no second check of seats, departure time and cancellation.</li>
<li>Letting a driver book their own ride, or letting a rider book the same ride twice and so count the seats twice.</li>
<li>Calling the real clock inside the class, which makes the rules about departed rides impossible to test.</li>
<li>Putting ranking as if-else inside search, or one class doing search, booking, pricing and cancellation. The reported feedback was about class and module design.</li>
<li>Cancelling a ride but leaving its bookings behind, or not telling the riders who lost their seats.</li>
</ul>`,
    },
    code: `class Ride {
  constructor(id, driver, from, to, departure, seats, price) {
    this.id = id;
    this.driver = driver;
    this.from = from;
    this.to = to;
    this.departure = departure;
    this.seats = seats;
    this.price = price;
    this.bookings = new Map();
    this.cancelled = false;
  }
  taken() {
    let total = 0;
    for (const booking of this.bookings.values()) total += booking.seats;
    return total;
  }
  free() {
    return this.seats - this.taken();
  }
}

class EarliestFirst {
  compare(a, b) {
    return a.departure - b.departure || a.id - b.id;
  }
}

class CheapestFirst {
  compare(a, b) {
    return a.price - b.price || a.departure - b.departure || a.id - b.id;
  }
}

class CarPool {
  constructor(clock, ranking) {
    this.clock = clock;
    this.ranking = ranking;
    this.rides = new Map();
    this.bookingRide = new Map();
    this.nextRide = 1;
    this.nextBooking = 1;
  }
  offer(driver, from, to, departure, seats, price) {
    if (!Number.isInteger(seats) || seats < 1) throw new Error("a ride needs at least one seat");
    if (!(price >= 0)) throw new Error("price must not be negative");
    if (from === to) throw new Error("origin and destination must differ");
    if (departure <= this.clock()) throw new Error("departure is in the past");
    const ride = new Ride(this.nextRide++, driver, from, to, departure, seats, price);
    this.rides.set(ride.id, ride);
    return ride.id;
  }
  bookable(ride, request) {
    const mine = [...ride.bookings.values()].some((booking) => booking.rider === request.rider);
    return !ride.cancelled && ride.driver !== request.rider && !mine && ride.departure > this.clock();
  }
  search(request) {
    if (!Number.isInteger(request.seats) || request.seats < 1) throw new Error("book at least one seat");
    const earliest = request.notBefore === undefined ? this.clock() : request.notBefore;
    return [...this.rides.values()]
      .filter((ride) => this.bookable(ride, request))
      .filter((ride) => ride.from === request.from && ride.to === request.to)
      .filter((ride) => ride.departure >= earliest && ride.free() >= request.seats)
      .sort((a, b) => this.ranking.compare(a, b))
      .map((ride) => ride.id);
  }
  book(rider, rideId, seats) {
    if (!Number.isInteger(seats) || seats < 1) throw new Error("book at least one seat");
    const ride = this.rides.get(rideId);
    if (!ride || ride.cancelled) throw new Error("no such ride");
    if (ride.driver === rider) throw new Error("a driver cannot book their own ride");
    if (ride.departure <= this.clock()) throw new Error("ride has departed");
    if (!this.bookable(ride, { rider })) throw new Error("rider already booked this ride");
    if (ride.free() < seats) throw new Error("not enough seats");
    const booking = { id: this.nextBooking++, rider, seats };
    ride.bookings.set(booking.id, booking);
    this.bookingRide.set(booking.id, ride);
    return booking.id;
  }
  match(request) {
    const found = this.search(request);
    return found.length > 0 ? this.book(request.rider, found[0], request.seats) : null;
  }
  cancelBooking(rider, bookingId) {
    const ride = this.bookingRide.get(bookingId);
    if (!ride) return false;
    if (ride.bookings.get(bookingId).rider !== rider) throw new Error("not your booking");
    ride.bookings.delete(bookingId);
    this.bookingRide.delete(bookingId);
    return true;
  }
  cancelRide(driver, rideId) {
    const ride = this.rides.get(rideId);
    if (!ride || ride.driver !== driver) throw new Error("only the driver can cancel a ride");
    ride.cancelled = true;
    const riders = [...ride.bookings.values()].map((booking) => booking.rider);
    for (const id of ride.bookings.keys()) this.bookingRide.delete(id);
    ride.bookings.clear();
    return riders;
  }
}
`,
    checks: [
      {
        name: "finds rides on the route with enough seats, earliest first",
        expr: `(() => {
    let now = 0;
    const pool = new CarPool(() => now, new EarliestFirst());
    const ask = (rider, seats) => ({ rider, from: "HSR", to: "Airport", notBefore: 0, seats: seats || 1 });
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const late = pool.offer("d1", "HSR", "Airport", 90, 3, 200);
    const early = pool.offer("d2", "HSR", "Airport", 60, 1, 250);
    pool.offer("d3", "HSR", "Mall", 50, 3, 100);
    return [pool.search(ask("r1", 1)), pool.search(ask("r1", 2)), late, early];
  })()`,
        expected: [[2, 1], [1], 1, 2],
      },
      {
        name: "ranking strategy can be swapped to cheapest first",
        expr: `(() => {
    let now = 0;
    const pool = new CarPool(() => now, new EarliestFirst());
    const ask = (rider, seats) => ({ rider, from: "HSR", to: "Airport", notBefore: 0, seats: seats || 1 });
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    pool.offer("d1", "HSR", "Airport", 90, 3, 200);
    pool.offer("d2", "HSR", "Airport", 60, 3, 250);
    const byTime = pool.search(ask("r1"));
    pool.ranking = new CheapestFirst();
    return [byTime, pool.search(ask("r1"))];
  })()`,
        expected: [
          [2, 1],
          [1, 2],
        ],
      },
      {
        name: "booking uses up seats and rejects a request beyond capacity",
        expr: `(() => {
    let now = 0;
    const pool = new CarPool(() => now, new EarliestFirst());
    const ask = (rider, seats) => ({ rider, from: "HSR", to: "Airport", notBefore: 0, seats: seats || 1 });
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const ride = pool.offer("d1", "HSR", "Airport", 60, 2, 200);
    pool.book("r1", ride, 1);
    return [pool.rides.get(ride).free(), fail(() => pool.book("r2", ride, 2)), pool.book("r2", ride, 1)];
  })()`,
        expected: [1, "not enough seats", 2],
      },
      {
        name: "cancelling a booking returns its seats",
        expr: `(() => {
    let now = 0;
    const pool = new CarPool(() => now, new EarliestFirst());
    const ask = (rider, seats) => ({ rider, from: "HSR", to: "Airport", notBefore: 0, seats: seats || 1 });
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const ride = pool.offer("d1", "HSR", "Airport", 60, 1, 200);
    const booking = pool.book("r1", ride, 1);
    const full = fail(() => pool.book("r2", ride, 1));
    const cancelled = pool.cancelBooking("r1", booking);
    return [full, cancelled, pool.cancelBooking("r1", booking), pool.book("r2", ride, 1)];
  })()`,
        expected: ["not enough seats", true, false, 2],
      },
      {
        name: "refuses a driver booking their own ride and a rider booking twice",
        expr: `(() => {
    let now = 0;
    const pool = new CarPool(() => now, new EarliestFirst());
    const ask = (rider, seats) => ({ rider, from: "HSR", to: "Airport", notBefore: 0, seats: seats || 1 });
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const ride = pool.offer("d1", "HSR", "Airport", 60, 3, 200);
    pool.book("r1", ride, 1);
    return [fail(() => pool.book("d1", ride, 1)), fail(() => pool.book("r1", ride, 1))];
  })()`,
        expected: ["a driver cannot book their own ride", "rider already booked this ride"],
      },
      {
        name: "ignores rides that have already departed",
        expr: `(() => {
    let now = 0;
    const pool = new CarPool(() => now, new EarliestFirst());
    const ask = (rider, seats) => ({ rider, from: "HSR", to: "Airport", notBefore: 0, seats: seats || 1 });
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const ride = pool.offer("d1", "HSR", "Airport", 60, 3, 200);
    now = 60;
    return [pool.search(ask("r1")), fail(() => pool.book("r1", ride, 1)), fail(() => pool.offer("d2", "HSR", "Airport", 60, 1, 1))];
  })()`,
        expected: [[], "ride has departed", "departure is in the past"],
      },
      {
        name: "match books the best candidate or returns null",
        expr: `(() => {
    let now = 0;
    const pool = new CarPool(() => now, new EarliestFirst());
    const ask = (rider, seats) => ({ rider, from: "HSR", to: "Airport", notBefore: 0, seats: seats || 1 });
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    pool.offer("d1", "HSR", "Airport", 90, 1, 200);
    pool.offer("d2", "HSR", "Airport", 60, 1, 250);
    const first = pool.match(ask("r1"));
    const second = pool.match(ask("r2"));
    return [first, pool.bookingRide.get(first).id, second, pool.bookingRide.get(second).id, pool.match(ask("r3"))];
  })()`,
        expected: [1, 2, 2, 1, null],
      },
      {
        name: "only the driver can cancel a ride and its riders are reported",
        expr: `(() => {
    let now = 0;
    const pool = new CarPool(() => now, new EarliestFirst());
    const ask = (rider, seats) => ({ rider, from: "HSR", to: "Airport", notBefore: 0, seats: seats || 1 });
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    const ride = pool.offer("d1", "HSR", "Airport", 60, 3, 200);
    pool.book("r1", ride, 1);
    pool.book("r2", ride, 1);
    const wrong = fail(() => pool.cancelRide("r1", ride));
    const riders = pool.cancelRide("d1", ride);
    return [wrong, riders, pool.search(ask("r3")), fail(() => pool.book("r3", ride, 1))];
  })()`,
        expected: ["only the driver can cancel a ride", ["r1", "r2"], [], "no such ride"],
      },
      {
        name: "rejects a booking or search for zero, negative or fractional seats without changing the ride",
        expr: `(() => {
    let now = 0;
    const pool = new CarPool(() => now, new EarliestFirst());
    const ride = pool.offer("d1", "HSR", "Airport", 60, 2, 200);
    const errors = [0, -1, 1.5].map((seats) => {
      try {
        pool.book("r1", ride, seats);
        return "booked";
      } catch (error) {
        return error.message;
      }
    });
    let searchError = "ran";
    try {
      pool.search({ rider: "r1", from: "HSR", to: "Airport", seats: 0 });
    } catch (error) {
      searchError = error.message;
    }
    return [errors, searchError, pool.rides.get(ride).free()];
  })()`,
        expected: [Array(3).fill("book at least one seat"), "book at least one seat", 2],
      },
      {
        name: "lets only the booking's own rider cancel it and treats a missing earliest time as now",
        expr: `(() => {
    let now = 10;
    const pool = new CarPool(() => now, new EarliestFirst());
    const ride = pool.offer("d1", "HSR", "Airport", 60, 2, 200);
    const early = pool.offer("d2", "HSR", "Airport", 20, 2, 200);
    now = 30;
    const booking = pool.book("r1", ride, 1);
    let message = "cancelled";
    try {
      pool.cancelBooking("r2", booking);
    } catch (error) {
      message = error.message;
    }
    return [message, pool.rides.get(ride).free(), pool.cancelBooking("r1", booking), pool.search({ rider: "r3", from: "HSR", to: "Airport", seats: 1 }), early];
  })()`,
        expected: ["not your booking", 1, true, [1], 2],
      },
      {
        name: "rejects a negative price and a fractional seat count on offer",
        expr: `(() => {
    const pool = new CarPool(() => 0, new EarliestFirst());
    const errors = [() => pool.offer("d1", "HSR", "Airport", 60, 1, -5), () => pool.offer("d1", "HSR", "Airport", 60, 1.5, 5)].map((attempt) => {
      try {
        attempt();
        return "offered";
      } catch (error) {
        return error.message;
      }
    });
    return [errors, pool.rides.size];
  })()`,
        expected: [["price must not be negative", "a ride needs at least one seat"], 0],
      },
      {
        name: "validates an offer",
        expr: `(() => {
    let now = 0;
    const pool = new CarPool(() => now, new EarliestFirst());
    const ask = (rider, seats) => ({ rider, from: "HSR", to: "Airport", notBefore: 0, seats: seats || 1 });
    const fail = (fn) => {
      try {
        fn();
        return "no error";
      } catch (error) {
        return error.message;
      }
    };
    return [fail(() => pool.offer("d1", "HSR", "Airport", 60, 0, 1)), fail(() => pool.offer("d1", "HSR", "HSR", 60, 1, 1))];
  })()`,
        expected: ["a ride needs at least one seat", "origin and destination must differ"],
      },
    ],
  },
];
