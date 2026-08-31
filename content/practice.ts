import type { Exercise } from "./types";

export const practice: Exercise[] = [
  {
    id: "ex-typeof-guard",
    chapter: "types-values",
    level: "beginner",
    title: "Fix typeof's two lies",
    brief:
      '<p><code>typeof</code> reports <code>"object"</code> for both arrays and <code>null</code>. Write <code>kindOf(value)</code> that tells the truth:</p><ul><li>an array &rarr; <code>"array"</code></li><li><code>null</code> &rarr; <code>"null"</code></li><li>anything else &rarr; whatever <code>typeof</code> says</li></ul>',
    starter:
      'function kindOf(value) {\n  // TODO: handle arrays and null, then fall back to typeof\n}\n\nconsole.log(kindOf([1, 2, 3])); // "array"\nconsole.log(kindOf(null));      // "null"\nconsole.log(kindOf("hi"));      // "string"\n',
    hints: [
      "Array.isArray(value) is the only reliable array check.",
      "Test for null BEFORE you fall back to typeof — order matters here.",
    ],
    solution:
      'function kindOf(value) {\n  if (Array.isArray(value)) return "array";\n  if (value === null) return "null";\n  return typeof value;\n}\n',
    tests: [
      {
        name: 'arrays report "array"',
        body: 'assert.equal(kindOf([]), "array");\nassert.equal(kindOf([1, 2]), "array");',
      },
      {
        name: 'null reports "null"',
        body: 'assert.equal(kindOf(null), "null");',
      },
      {
        name: "primitives still use typeof",
        body: 'assert.equal(kindOf(42), "number");\nassert.equal(kindOf("a"), "string");\nassert.equal(kindOf(true), "boolean");\nassert.equal(kindOf(undefined), "undefined");',
      },
      {
        name: "functions and objects are unchanged",
        body: 'assert.equal(kindOf(function () {}), "function");\nassert.equal(kindOf({}), "object");',
      },
    ],
  },
  {
    id: "ex-falsy-filter",
    chapter: "types-values",
    level: "beginner",
    title: "Keep only the truthy values",
    brief:
      "<p>Write <code>keepTruthy(list)</code> which returns a <b>new</b> array containing only the truthy values.</p><p>The original array must not change — that is half the exercise.</p>",
    starter:
      'function keepTruthy(list) {\n  // TODO: return a new array with the falsy values removed\n}\n\nconst messy = [0, 1, "", null, "a", NaN, false, 2];\nconsole.log(keepTruthy(messy)); // [1, "a", 2]\nconsole.log(messy.length);      // still 8\n',
    hints: [
      "filter() already returns a new array — nothing needs to be mutated.",
      "A value is truthy when Boolean(value) is true, so the callback can be as short as (v) => v.",
    ],
    solution:
      "function keepTruthy(list) {\n  return list.filter(function (value) {\n    return Boolean(value);\n  });\n}\n",
    tests: [
      {
        name: "removes all eight falsy values",
        body: 'assert.deepEqual(keepTruthy([0, 1, "", null, "a", NaN, false, 2, undefined]), [1, "a", 2]);',
      },
      {
        name: "keeps [] and {} — they are truthy",
        body: "assert.equal(keepTruthy([[], {}, 0]).length, 2);",
      },
      {
        name: "does not touch the original",
        body: "const src = [0, 1, 2];\nkeepTruthy(src);\nassert.deepEqual(src, [0, 1, 2]);",
      },
      {
        name: "returns a different array",
        body: "const src = [1, 2];\nassert.notEqual(keepTruthy(src), src);",
      },
    ],
  },
  {
    id: "ex-copy-share",
    chapter: "types-values",
    level: "beginner",
    title: "Copy without sharing",
    brief:
      "<p><code>{ ...obj }</code> copies only the top level, so nested objects stay shared.</p><p>Write <code>copyProfile(profile)</code> that returns a copy where <b>nothing</b> is shared with the original — change the copy and the original must stay exactly as it was.</p>",
    starter:
      'const profile = {\n  name: "Akshat",\n  tags: ["js", "css"],\n  address: { city: "Indore" },\n};\n\nfunction copyProfile(input) {\n  // TODO: a copy that shares nothing with the original\n}\n\nconst copy = copyProfile(profile);\ncopy.address.city = "Pune";\nconsole.log(profile.address.city); // still "Indore"\n',
    hints: [
      "structuredClone(value) is the modern one-liner: deep, and it keeps Dates, Maps and Sets.",
      "The old hack JSON.parse(JSON.stringify(x)) also works here, but it silently destroys Dates, functions and undefined.",
    ],
    solution: "function copyProfile(input) {\n  return structuredClone(input);\n}\n",
    tests: [
      {
        name: "the copy has the same data",
        body: 'const src = { name: "A", tags: ["x"], address: { city: "Indore" } };\nassert.deepEqual(copyProfile(src), src);',
      },
      {
        name: "the top level is a new object",
        body: 'const src = { name: "A", address: { city: "Indore" } };\nassert.notEqual(copyProfile(src), src);',
      },
      {
        name: "nested objects are new too",
        body: 'const src = { address: { city: "Indore" } };\nassert.notEqual(copyProfile(src).address, src.address);',
      },
      {
        name: "changing the copy leaves the original alone",
        body: 'const src = { tags: ["js"], address: { city: "Indore" } };\nconst out = copyProfile(src);\nout.address.city = "Pune";\nout.tags.push("css");\nassert.equal(src.address.city, "Indore");\nassert.equal(src.tags.length, 1);',
      },
    ],
  },
  {
    id: "ex-defaults-nullish",
    chapter: "operators-flow",
    level: "beginner",
    title: "Defaults that respect 0",
    brief:
      '<p>Write <code>settingsFor(user)</code> that returns <code>{ theme, fontSize, city }</code>.</p><ul><li>defaults: <code>"paper"</code>, <code>16</code>, <code>"Unknown"</code></li><li>a <code>fontSize</code> of <code>0</code> is a real answer and must survive</li><li><code>settingsFor()</code> with no argument must not crash</li></ul>',
    starter:
      'function settingsFor(user) {\n  // TODO: use ?. and ?? — not ||\n}\n\nconsole.log(settingsFor({ fontSize: 0 }));                     // fontSize stays 0\nconsole.log(settingsFor({ address: { city: "Indore" } }));     // city: "Indore"\nconsole.log(settingsFor());                                    // all defaults\n',
    hints: [
      "|| falls back on every falsy value, including 0. ?? only falls back on null and undefined.",
      "user?.address?.city stops safely at the first null or undefined instead of throwing.",
    ],
    solution:
      'function settingsFor(user) {\n  return {\n    theme: user?.theme ?? "paper",\n    fontSize: user?.fontSize ?? 16,\n    city: user?.address?.city ?? "Unknown",\n  };\n}\n',
    tests: [
      {
        name: "fills in every default",
        body: 'assert.deepEqual(settingsFor({}), { theme: "paper", fontSize: 16, city: "Unknown" });',
      },
      {
        name: "keeps a fontSize of 0",
        body: "assert.equal(settingsFor({ fontSize: 0 }).fontSize, 0);",
      },
      {
        name: "keeps an empty-string theme",
        body: 'assert.equal(settingsFor({ theme: "" }).theme, "");',
      },
      {
        name: "reads the nested city",
        body: 'assert.equal(settingsFor({ address: { city: "Indore" } }).city, "Indore");',
      },
      {
        name: "survives no argument at all",
        body: 'assert.deepEqual(settingsFor(), { theme: "paper", fontSize: 16, city: "Unknown" });\nassert.equal(settingsFor(null).city, "Unknown");',
      },
    ],
  },
  {
    id: "ex-loop-fix",
    chapter: "scope-functions",
    level: "beginner",
    title: "3 3 3 → 0 1 2",
    brief:
      "<p>The loop below schedules three timers and they all print <b>3</b>, because <code>var</code> gives the whole loop one shared <code>i</code>.</p><p>Fix <code>scheduleLogs(push)</code> so the three calls record <b>0, 1, 2</b> instead.</p>",
    starter:
      "function scheduleLogs(push) {\n  for (var i = 0; i < 3; i++) {\n    setTimeout(function () {\n      push(i);\n    }, 10);\n  }\n}\n\nconst seen = [];\nscheduleLogs(function (n) { seen.push(n); });\nsetTimeout(function () { console.log(seen); }, 60); // want [0, 1, 2]\n",
    hints: [
      "let creates a fresh binding for every turn of the loop; var creates one for the whole function.",
      "If you must keep var, wrap the body in an IIFE that captures the current value as a parameter.",
    ],
    solution:
      "function scheduleLogs(push) {\n  for (let i = 0; i < 3; i++) {\n    setTimeout(function () {\n      push(i);\n    }, 10);\n  }\n}\n",
    tests: [
      {
        name: "records 0, 1, 2 — not 3, 3, 3",
        body: "const seen = [];\nscheduleLogs(function (n) { seen.push(n); });\nawait new Promise(function (r) { setTimeout(r, 80); });\nassert.deepEqual(seen, [0, 1, 2]);",
      },
      {
        name: "still schedules exactly three calls",
        body: "let calls = 0;\nscheduleLogs(function () { calls++; });\nawait new Promise(function (r) { setTimeout(r, 80); });\nassert.equal(calls, 3);",
      },
    ],
  },
  {
    id: "ex-closure-counter",
    chapter: "scope-functions",
    level: "beginner",
    title: "A counter nobody can cheat",
    brief:
      "<p>Write <code>makeCounter()</code> returning <code>{ inc, dec, get }</code>.</p><ul><li><code>inc()</code> and <code>dec()</code> move the count and return the new value</li><li><code>get()</code> reads it</li><li>the count itself must be <b>unreachable</b> from outside — no <code>counter.count</code></li><li>two counters must not share anything</li></ul>",
    starter:
      "function makeCounter() {\n  // TODO: keep the count in the closure, not on the object\n}\n\nconst c = makeCounter();\nc.inc();\nc.inc();\nconsole.log(c.get());   // 2\nconsole.log(c.count);   // undefined — it is private\n",
    hints: [
      "Declare `let count = 0` inside makeCounter and return an object of small functions that touch it.",
      "Because the returned functions were written inside makeCounter, they keep a live link to that variable after it returns.",
    ],
    solution:
      "function makeCounter() {\n  let count = 0;\n  return {\n    inc: function () { return ++count; },\n    dec: function () { return --count; },\n    get: function () { return count; },\n  };\n}\n",
    tests: [
      {
        name: "counts up and down",
        body: "const c = makeCounter();\nc.inc();\nc.inc();\nc.inc();\nc.dec();\nassert.equal(c.get(), 2);",
      },
      {
        name: "inc returns the new value",
        body: "const c = makeCounter();\nassert.equal(c.inc(), 1);\nassert.equal(c.inc(), 2);",
      },
      {
        name: "starts at 0",
        body: "assert.equal(makeCounter().get(), 0);",
      },
      {
        name: "the count is private",
        body: "const c = makeCounter();\nc.inc();\nassert.equal(c.count, undefined);",
      },
      {
        name: "two counters are independent",
        body: "const a = makeCounter();\nconst b = makeCounter();\na.inc();\na.inc();\nb.inc();\nassert.equal(a.get(), 2);\nassert.equal(b.get(), 1);",
      },
    ],
  },
  {
    id: "ex-once",
    chapter: "scope-functions",
    level: "intermediate",
    title: "once() — run it a single time",
    brief:
      "<p>Write <code>once(fn)</code> which returns a new function that calls <code>fn</code> <b>at most once</b>.</p><p>Every later call returns the first result without calling <code>fn</code> again. Arguments and <code>this</code>-free usage are enough here.</p>",
    starter:
      'function once(fn) {\n  // TODO: remember whether it has run, and what it returned\n}\n\nlet setups = 0;\nconst setup = once(function (name) {\n  setups++;\n  return "ready:" + name;\n});\n\nconsole.log(setup("app")); // "ready:app"\nconsole.log(setup("app")); // "ready:app" — cached\nconsole.log(setups);       // 1\n',
    hints: [
      "You need two variables in the closure: a `called` flag and the saved `result`.",
      "Do not test the saved result for undefined — a function that legitimately returns undefined would then run twice. Use the flag.",
    ],
    solution:
      "function once(fn) {\n  let called = false;\n  let result;\n  return function () {\n    if (!called) {\n      called = true;\n      result = fn.apply(null, arguments);\n    }\n    return result;\n  };\n}\n",
    tests: [
      {
        name: "calls the original exactly once",
        body: "let n = 0;\nconst f = once(function () { n++; });\nf();\nf();\nf();\nassert.equal(n, 1);",
      },
      {
        name: "passes the arguments through",
        body: "const f = once(function (a, b) { return a + b; });\nassert.equal(f(2, 3), 5);",
      },
      {
        name: "returns the first result forever",
        body: "let n = 0;\nconst f = once(function () { return ++n; });\nassert.equal(f(), 1);\nassert.equal(f(), 1);",
      },
      {
        name: "works when the function returns undefined",
        body: "let n = 0;\nconst f = once(function () { n++; });\nf();\nf();\nassert.equal(n, 1);",
      },
      {
        name: "each wrapper is independent",
        body: "let n = 0;\nconst make = function () { return once(function () { return ++n; }); };\nconst a = make();\nconst b = make();\nassert.equal(a(), 1);\nassert.equal(b(), 2);",
      },
    ],
  },
  {
    id: "ex-curry-multiply",
    chapter: "scope-functions",
    level: "intermediate",
    title: "A function that returns a function",
    brief:
      "<p>Write <code>multiplyBy(n)</code> which returns a <b>new function</b> that multiplies whatever it is given by <code>n</code>.</p><p>Then use it to build <code>double</code> and <code>triple</code>. Each returned function keeps its own <code>n</code> — that is the closure doing the work.</p>",
    starter:
      "function multiplyBy(n) {\n  // TODO: return a function\n}\n\nconst double = multiplyBy(2);\nconst triple = multiplyBy(3);\n\nconsole.log(double(5)); // 10\nconsole.log(triple(5)); // 15\nconsole.log([1, 2, 3].map(double)); // [2, 4, 6]\n",
    hints: [
      "The outer function's job is only to remember n. The inner one does the maths.",
      "As an arrow it is one line: const multiplyBy = (n) => (x) => x * n;",
    ],
    solution:
      "function multiplyBy(n) {\n  return function (x) {\n    return x * n;\n  };\n}\n\nconst double = multiplyBy(2);\nconst triple = multiplyBy(3);\n",
    tests: [
      {
        name: "multiplyBy returns a function",
        body: 'assert.type(multiplyBy(2), "function");',
      },
      {
        name: "the returned function multiplies",
        body: "assert.equal(multiplyBy(2)(5), 10);\nassert.equal(multiplyBy(3)(5), 15);\nassert.equal(multiplyBy(0)(5), 0);",
      },
      {
        name: "double and triple exist and work",
        body: "assert.equal(double(4), 8);\nassert.equal(triple(4), 12);",
      },
      {
        name: "each closure keeps its own n",
        body: "const x10 = multiplyBy(10);\nconst x100 = multiplyBy(100);\nassert.equal(x10(2), 20);\nassert.equal(x100(2), 200);",
      },
      {
        name: "it drops straight into map()",
        body: "assert.deepEqual([1, 2, 3].map(double), [2, 4, 6]);",
      },
    ],
  },
  {
    id: "ex-group-by",
    chapter: "objects-deep",
    level: "intermediate",
    title: "groupBy with reduce",
    brief:
      "<p>Write <code>groupBy(list, key)</code> which returns an object whose keys are the values of <code>key</code>, each holding an array of the matching items.</p><p>An empty list gives an empty object.</p>",
    starter:
      'const people = [\n  { name: "Aman", role: "dev" },\n  { name: "Riya", role: "design" },\n  { name: "Sam",  role: "dev" },\n];\n\nfunction groupBy(list, key) {\n  // TODO: reduce the list into { dev: [...], design: [...] }\n}\n\nconsole.log(groupBy(people, "role"));\n',
    hints: [
      "reduce needs a starting value — pass {} as the second argument.",
      "For each item: read the bucket name with item[key], create the array if it is missing, then push.",
    ],
    solution:
      "function groupBy(list, key) {\n  return list.reduce(function (out, item) {\n    const bucket = item[key];\n    if (!out[bucket]) out[bucket] = [];\n    out[bucket].push(item);\n    return out;\n  }, {});\n}\n",
    tests: [
      {
        name: "groups by the given key",
        body: 'const list = [{ r: "a", n: 1 }, { r: "b", n: 2 }, { r: "a", n: 3 }];\nconst out = groupBy(list, "r");\nassert.equal(out.a.length, 2);\nassert.equal(out.b.length, 1);',
      },
      {
        name: "keeps the whole item, not just the name",
        body: 'const out = groupBy([{ r: "a", n: 7 }], "r");\nassert.equal(out.a[0].n, 7);',
      },
      {
        name: "keeps the original order inside a group",
        body: 'const out = groupBy([{ r: "a", n: 1 }, { r: "a", n: 2 }], "r");\nassert.deepEqual(out.a.map(function (i) { return i.n; }), [1, 2]);',
      },
      {
        name: "an empty list gives an empty object",
        body: 'assert.deepEqual(groupBy([], "r"), {});',
      },
      {
        name: "works with any key",
        body: 'const out = groupBy([{ city: "Indore" }, { city: "Pune" }], "city");\nassert.equal(Object.keys(out).length, 2);',
      },
    ],
  },
  {
    id: "ex-no-mutation",
    chapter: "objects-deep",
    level: "intermediate",
    title: "sort() without wrecking the original",
    brief:
      "<p><code>sort()</code> changes the array in place <b>and</b> compares values as text, so <code>[10, 9, 100]</code> sorts to <code>[10, 100, 9]</code>.</p><p>Write <code>sortedByPrice(items)</code>: a <b>new</b> array, cheapest first, original untouched.</p>",
    starter:
      'const items = [\n  { name: "pen", price: 100 },\n  { name: "bag", price: 9 },\n  { name: "cup", price: 10 },\n];\n\nfunction sortedByPrice(list) {\n  // TODO: new array, numeric order, no mutation\n}\n\nconsole.log(sortedByPrice(items).map(function (i) { return i.price; })); // [9, 10, 100]\nconsole.log(items[0].name); // still "pen"\n',
    hints: [
      "Copy first: [...list] or list.slice() — then sorting the copy cannot touch the original.",
      "Always pass a comparator for numbers: (a, b) => a.price - b.price.",
    ],
    solution:
      "function sortedByPrice(list) {\n  return [...list].sort(function (a, b) {\n    return a.price - b.price;\n  });\n}\n",
    tests: [
      {
        name: "sorts numerically, not alphabetically",
        body: "const list = [{ price: 100 }, { price: 9 }, { price: 10 }];\nassert.deepEqual(sortedByPrice(list).map(function (i) { return i.price; }), [9, 10, 100]);",
      },
      {
        name: "leaves the original order alone",
        body: "const list = [{ price: 3 }, { price: 1 }, { price: 2 }];\nsortedByPrice(list);\nassert.deepEqual(list.map(function (i) { return i.price; }), [3, 1, 2]);",
      },
      {
        name: "returns a different array",
        body: "const list = [{ price: 1 }];\nassert.notEqual(sortedByPrice(list), list);",
      },
      {
        name: "handles an empty list",
        body: "assert.deepEqual(sortedByPrice([]), []);",
      },
    ],
  },
  {
    id: "ex-dedupe-map",
    chapter: "objects-deep",
    level: "intermediate",
    title: "Set to dedupe, Map to count",
    brief:
      "<p>Two small pieces:</p><ul><li><code>unique(list)</code> &rarr; an array with duplicates removed, order kept</li><li><code>wordCount(sentence)</code> &rarr; a <b>Map</b> of word &rarr; how many times it appears</li></ul><p>Words are separated by single spaces. Use a real <code>Map</code>, not a plain object.</p>",
    starter:
      'function unique(list) {\n  // TODO: one line with Set\n}\n\nfunction wordCount(sentence) {\n  // TODO: return a Map of word -> count\n}\n\nconsole.log(unique([1, 2, 2, 3, 1]));        // [1, 2, 3]\nconsole.log(wordCount("the cat the dog"));   // Map { "the" => 2, ... }\n',
    hints: [
      "A Set drops duplicates on its own; spread it back into an array: [...new Set(list)].",
      "map.get(word) is undefined the first time — (map.get(word) || 0) + 1 handles that.",
    ],
    solution:
      'function unique(list) {\n  return [...new Set(list)];\n}\n\nfunction wordCount(sentence) {\n  const counts = new Map();\n  sentence.split(" ").forEach(function (word) {\n    counts.set(word, (counts.get(word) || 0) + 1);\n  });\n  return counts;\n}\n',
    tests: [
      {
        name: "unique removes duplicates and keeps order",
        body: 'assert.deepEqual(unique([1, 2, 2, 3, 1]), [1, 2, 3]);\nassert.deepEqual(unique(["b", "a", "b"]), ["b", "a"]);',
      },
      {
        name: "unique returns a real array",
        body: "assert.ok(Array.isArray(unique([1, 1])));",
      },
      {
        name: "wordCount returns a Map",
        body: 'assert.ok(wordCount("a b") instanceof Map);',
      },
      {
        name: "wordCount counts repeats",
        body: 'const m = wordCount("the cat the dog the");\nassert.equal(m.get("the"), 3);\nassert.equal(m.get("cat"), 1);\nassert.equal(m.size, 3);',
      },
    ],
  },
  {
    id: "ex-class-extends",
    chapter: "prototypes-oop",
    level: "advanced",
    title: "extends, super, and the chain",
    brief:
      '<p>Build two classes:</p><ul><li><code>Animal</code> — takes a <code>name</code>, and <code>speak()</code> returns <code>"Rex makes a sound"</code></li><li><code>Dog extends Animal</code> — also takes a <code>breed</code>, and its <code>speak()</code> returns the parent\'s sentence plus <code>" — woof"</code></li></ul><p>Call <code>super()</code> before touching <code>this</code>, and reuse the parent method with <code>super.speak()</code> instead of retyping it.</p>',
    starter:
      'class Animal {\n  // TODO: constructor(name) and speak()\n}\n\nclass Dog /* TODO: extends */ {\n  // TODO: constructor(name, breed) and speak()\n}\n\nconst rex = new Dog("Rex", "lab");\nconsole.log(rex.speak());          // "Rex makes a sound — woof"\nconsole.log(rex instanceof Animal); // true\n',
    hints: [
      "In a subclass constructor, super(name) must run before any use of `this` — the object does not exist yet.",
      "super.speak() calls the parent version of the method you are currently overriding.",
    ],
    solution:
      'class Animal {\n  constructor(name) {\n    this.name = name;\n  }\n  speak() {\n    return this.name + " makes a sound";\n  }\n}\n\nclass Dog extends Animal {\n  constructor(name, breed) {\n    super(name);\n    this.breed = breed;\n  }\n  speak() {\n    return super.speak() + " — woof";\n  }\n}\n',
    tests: [
      {
        name: "Animal speaks",
        body: 'assert.equal(new Animal("Rex").speak(), "Rex makes a sound");',
      },
      {
        name: "Dog extends the sentence",
        body: 'assert.equal(new Dog("Rex", "lab").speak(), "Rex makes a sound — woof");',
      },
      {
        name: "the constructor stores both fields",
        body: 'const d = new Dog("Rex", "lab");\nassert.equal(d.name, "Rex");\nassert.equal(d.breed, "lab");',
      },
      {
        name: "the prototype chain is wired",
        body: 'const d = new Dog("Rex", "lab");\nassert.ok(d instanceof Dog);\nassert.ok(d instanceof Animal);\nassert.equal(Object.getPrototypeOf(Dog.prototype), Animal.prototype);',
      },
      {
        name: "speak lives on the prototype, not the instance",
        body: 'const d = new Dog("Rex", "lab");\nassert.ok(!Object.prototype.hasOwnProperty.call(d, "speak"));',
      },
    ],
  },
  {
    id: "ex-order-predict",
    chapter: "async-properly",
    level: "intermediate",
    title: "Sync, microtask, macrotask",
    brief:
      '<p>Write <code>scheduleAll(record)</code> so that <code>record</code> is called three times, in this exact order:</p><p><code>"sync"</code> &rarr; <code>"micro"</code> &rarr; <code>"macro"</code></p><p>The catch: you must schedule the macrotask <b>first</b> in your code, then the microtask, then the sync call — and let the event loop sort it out.</p>',
    starter:
      'function scheduleAll(record) {\n  // 1. a setTimeout(..., 0)      -> should land LAST\n  // 2. a resolved promise .then  -> should land SECOND\n  // 3. a plain call              -> should land FIRST\n}\n\nconst seen = [];\nscheduleAll(function (label) { seen.push(label); });\nsetTimeout(function () { console.log(seen); }, 50); // ["sync", "micro", "macro"]\n',
    hints: [
      "Synchronous code always finishes first — the queues are not even looked at until the stack is empty.",
      "Then every microtask (promise callback) drains, and only after that does one macrotask (timer) run.",
    ],
    solution:
      'function scheduleAll(record) {\n  setTimeout(function () {\n    record("macro");\n  }, 0);\n\n  Promise.resolve().then(function () {\n    record("micro");\n  });\n\n  record("sync");\n}\n',
    tests: [
      {
        name: "the order is sync, micro, macro",
        body: 'const seen = [];\nscheduleAll(function (l) { seen.push(l); });\nawait new Promise(function (r) { setTimeout(r, 60); });\nassert.deepEqual(seen, ["sync", "micro", "macro"]);',
      },
      {
        name: '"sync" really is synchronous',
        body: 'const seen = [];\nscheduleAll(function (l) { seen.push(l); });\nassert.deepEqual(seen, ["sync"]);',
      },
      {
        name: "the promise runs before the timer",
        body: 'const seen = [];\nscheduleAll(function (l) { seen.push(l); });\nawait Promise.resolve();\nassert.deepEqual(seen, ["sync", "micro"]);',
      },
    ],
  },
  {
    id: "ex-parallel-load",
    chapter: "async-properly",
    level: "advanced",
    title: "Three awaits in a row → one wait",
    brief:
      "<p>The three fetches below take about 120&nbsp;ms each. Awaited one after another that is ~360&nbsp;ms, even though none of them needs the others.</p><p>Write <code>loadAll()</code> so all three start together and the whole thing finishes in roughly one wait. It must resolve to <code>{ user, orders, stats }</code>.</p>",
    starter:
      'const wait = function (ms, value) {\n  return new Promise(function (r) { setTimeout(function () { r(value); }, ms); });\n};\n\nconst getUser   = function () { return wait(120, { name: "Akshat" }); };\nconst getOrders = function () { return wait(120, [1, 2, 3]); };\nconst getStats  = function () { return wait(120, { visits: 42 }); };\n\nasync function loadAll() {\n  // TODO: start all three, then wait once\n}\n\nconst started = Date.now();\nloadAll().then(function (out) {\n  console.log(out);\n  console.log("took", Date.now() - started, "ms");\n});\n',
    hints: [
      "await pauses until that one promise settles, so awaiting on three separate lines runs them one after another.",
      "Call all three first so they are already in flight, then hand the array to Promise.all and await that once.",
    ],
    solution:
      'const wait = function (ms, value) {\n  return new Promise(function (r) { setTimeout(function () { r(value); }, ms); });\n};\n\nconst getUser   = function () { return wait(120, { name: "Akshat" }); };\nconst getOrders = function () { return wait(120, [1, 2, 3]); };\nconst getStats  = function () { return wait(120, { visits: 42 }); };\n\nasync function loadAll() {\n  const [user, orders, stats] = await Promise.all([\n    getUser(),\n    getOrders(),\n    getStats(),\n  ]);\n  return { user, orders, stats };\n}\n',
    tests: [
      {
        name: "returns all three results",
        body: 'const out = await loadAll();\nassert.deepEqual(out.user, { name: "Akshat" });\nassert.deepEqual(out.orders, [1, 2, 3]);\nassert.deepEqual(out.stats, { visits: 42 });',
      },
      {
        name: "they run together, not in a queue",
        body: 'const started = Date.now();\nawait loadAll();\nconst took = Date.now() - started;\nassert.ok(took < 250, "took " + took + "ms — that looks sequential");',
      },
      {
        name: "loadAll returns a promise",
        body: 'const p = loadAll();\nassert.type(p.then, "function");\nawait p;',
      },
    ],
  },
  {
    id: "ex-retry",
    chapter: "async-properly",
    level: "advanced",
    title: "retry() a flaky promise",
    brief:
      "<p>Write <code>retry(task, times)</code>:</p><ul><li>call <code>task()</code>, and if the promise rejects, try again</li><li>at most <code>times</code> attempts in total</li><li>resolve with the first success</li><li>if every attempt fails, reject with the <b>last</b> error</li></ul>",
    starter:
      'async function retry(task, times) {\n  // TODO: loop, catch, remember the last error\n}\n\nlet attempt = 0;\nconst flaky = function () {\n  attempt++;\n  return attempt < 3\n    ? Promise.reject(new Error("boom " + attempt))\n    : Promise.resolve("ok on attempt " + attempt);\n};\n\nretry(flaky, 5).then(console.log); // "ok on attempt 3"\n',
    hints: [
      "A plain for loop with try/catch inside an async function reads far better than a recursive chain.",
      "Store the error in a variable each time you catch, and throw it after the loop ends.",
    ],
    solution:
      "async function retry(task, times) {\n  let lastError;\n  for (let i = 0; i < times; i++) {\n    try {\n      return await task();\n    } catch (err) {\n      lastError = err;\n    }\n  }\n  throw lastError;\n}\n",
    tests: [
      {
        name: "succeeds once the task stops failing",
        body: 'let n = 0;\nconst flaky = function () {\n  n++;\n  return n < 3 ? Promise.reject(new Error("boom")) : Promise.resolve("ok");\n};\nassert.equal(await retry(flaky, 5), "ok");\nassert.equal(n, 3);',
      },
      {
        name: "does not retry a task that works first time",
        body: "let n = 0;\nconst good = function () { n++; return Promise.resolve(1); };\nawait retry(good, 4);\nassert.equal(n, 1);",
      },
      {
        name: "gives up after `times` attempts",
        body: 'let n = 0;\nconst bad = function () { n++; return Promise.reject(new Error("always")); };\nlet caught = null;\ntry { await retry(bad, 3); } catch (err) { caught = err; }\nassert.ok(caught, "it should reject when every attempt fails");\nassert.equal(n, 3);',
      },
      {
        name: "rejects with the last error",
        body: 'let n = 0;\nconst bad = function () { n++; return Promise.reject(new Error("fail " + n)); };\nlet message = "";\ntry { await retry(bad, 2); } catch (err) { message = err.message; }\nassert.equal(message, "fail 2");',
      },
    ],
  },
  {
    id: "ex-weakmap-cache",
    chapter: "engine-memory",
    level: "advanced",
    title: "Attach data without leaking",
    brief:
      "<p>Write <code>makeMetaStore()</code> returning <code>{ set, get, has }</code> that attaches data to <b>objects</b>.</p><ul><li>two different objects never collide, even with identical contents</li><li>the store must not keep its keys alive — use a <code>WeakMap</code></li></ul><p>This is exactly how you tag DOM nodes without leaking them once they leave the page.</p>",
    starter:
      "function makeMetaStore() {\n  // TODO: a WeakMap in the closure, three small methods on top\n}\n\nconst meta = makeMetaStore();\nconst a = { id: 1 };\nconst b = { id: 1 };\n\nmeta.set(a, { clicks: 2 });\nconsole.log(meta.get(a)); // { clicks: 2 }\nconsole.log(meta.get(b)); // undefined — a different object\n",
    hints: [
      'A plain object turns every key into the string "[object Object]", so all objects would collide.',
      "WeakMap keys are held weakly: once nothing else points at the key object, the entry is collected on its own.",
    ],
    solution:
      "function makeMetaStore() {\n  const store = new WeakMap();\n  return {\n    set: function (obj, data) { store.set(obj, data); return obj; },\n    get: function (obj) { return store.get(obj); },\n    has: function (obj) { return store.has(obj); },\n  };\n}\n",
    tests: [
      {
        name: "stores and reads data per object",
        body: "const m = makeMetaStore();\nconst node = {};\nm.set(node, { clicks: 2 });\nassert.deepEqual(m.get(node), { clicks: 2 });",
      },
      {
        name: "identical-looking objects do not collide",
        body: 'const m = makeMetaStore();\nconst a = { id: 1 };\nconst b = { id: 1 };\nm.set(a, "A");\nassert.equal(m.get(a), "A");\nassert.equal(m.get(b), undefined);',
      },
      {
        name: "has() reports membership",
        body: "const m = makeMetaStore();\nconst a = {};\nassert.equal(m.has(a), false);\nm.set(a, 1);\nassert.equal(m.has(a), true);",
      },
      {
        name: "two stores are independent",
        body: 'const m1 = makeMetaStore();\nconst m2 = makeMetaStore();\nconst a = {};\nm1.set(a, "one");\nassert.equal(m2.get(a), undefined);',
      },
      {
        name: "it really is a WeakMap (objects only)",
        body: 'const m = makeMetaStore();\nlet threw = false;\ntry { m.set("a string", 1); } catch (e) { threw = true; }\nassert.ok(threw, "a WeakMap refuses primitive keys — a plain object would have accepted this");',
      },
    ],
  },
  {
    id: "ex-travelling-salesman-bitmask",
    chapter: "dsa-advanced-dp",
    level: "advanced",
    title: "Travelling Salesman (Bitmask DP)",
    brief:
      "<p>You are given an <code>n x n</code> matrix <code>cost</code> where <code>cost[i][j]</code> is the price of travelling from city <code>i</code> to city <code>j</code>. Starting at <b>city 0</b>, visit every other city exactly once and come back to city 0. Return the cheapest total price of such a tour.</p><ul><li>The tour always starts <b>and</b> ends at city <code>0</code></li><li><code>n</code> is at most 12, so an exponential-in-<code>n</code> answer is expected — but <code>n!</code> permutations is not</li><li><code>cost[i][i]</code> is <code>0</code> and the matrix need not be symmetric</li><li>A single city (<code>n === 1</code>) costs <code>0</code></li></ul>",
    starter: "function tsp(cost) {\n  // TODO: cheapest tour from city 0 through every city and back\n}\n",
    hints: [
      "Trying every ordering is n! work. But two different orderings that have visited the SAME set of cities and are standing on the SAME city are interchangeable from here on — only the set and the current city matter.",
      "So the state is (set of visited cities, city you are standing on). Encode the set as an n-bit integer: bit i is 1 when city i has been visited. That is 2^n * n states.",
      "Fill dp[mask][last] = cheapest way to have visited exactly that mask and be sitting on that last city. Seed dp[1][0] = 0, extend to every unvisited city, and at the end add cost[last][0] for each candidate last.",
    ],
    solution:
      "function tsp(cost) {\n  const n = cost.length;\n  if (n <= 1) return 0;\n  const full = 1 << n;\n  const dp = [];\n  for (let mask = 0; mask < full; mask++) dp.push(new Array(n).fill(Infinity));\n  dp[1][0] = 0;\n  for (let mask = 1; mask < full; mask++) {\n    if ((mask & 1) === 0) continue;\n    for (let last = 0; last < n; last++) {\n      if ((mask & (1 << last)) === 0) continue;\n      const here = dp[mask][last];\n      if (here === Infinity) continue;\n      for (let next = 0; next < n; next++) {\n        if (mask & (1 << next)) continue;\n        const nextMask = mask | (1 << next);\n        const candidate = here + cost[last][next];\n        if (candidate < dp[nextMask][next]) dp[nextMask][next] = candidate;\n      }\n    }\n  }\n  let best = Infinity;\n  for (let last = 1; last < n; last++) {\n    const total = dp[full - 1][last] + cost[last][0];\n    if (total < best) best = total;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic four-city tour",
        body: "const cost = [\n  [0, 10, 15, 20],\n  [10, 0, 35, 25],\n  [15, 35, 0, 30],\n  [20, 25, 30, 0],\n];\nassert.equal(tsp(cost), 80);",
      },
      {
        name: "a single city costs nothing",
        body: "assert.equal(tsp([[0]]), 0);",
      },
      {
        name: "two cities is just there and back",
        body: "assert.equal(tsp([[0, 7], [3, 0]]), 10);",
      },
      {
        name: "asymmetric costs matter",
        body: "const cost = [\n  [0, 1, 9],\n  [9, 0, 1],\n  [1, 9, 0],\n];\nassert.equal(tsp(cost), 3, 'the cheap direction is 0 -> 1 -> 2 -> 0');",
      },
      {
        name: "five cities",
        body: "const cost = [\n  [0, 2, 9, 10, 7],\n  [1, 0, 6, 4, 3],\n  [15, 7, 0, 8, 3],\n  [6, 3, 12, 0, 11],\n  [9, 5, 2, 8, 0],\n];\nassert.equal(tsp(cost), 21);",
      },
    ],
  },
  {
    id: "ex-partition-k-equal-sum-subsets",
    chapter: "dsa-advanced-dp",
    level: "advanced",
    title: "Partition to K Equal Sum Subsets",
    brief:
      "<p>Given an array of positive integers <code>nums</code> and an integer <code>k</code>, decide whether the array can be split into exactly <code>k</code> non-empty groups that all add up to the same total. Return <code>true</code> or <code>false</code>.</p><ul><li>Every element must land in exactly one group</li><li><code>nums.length</code> is at most 16, so a bitmask over the used elements is the intended shape</li><li>If the total is not divisible by <code>k</code> the answer is <code>false</code></li><li>If any single element is bigger than the per-group target the answer is <code>false</code></li></ul>",
    starter:
      "function canPartitionKSubsets(nums, k) {\n  // TODO: can the elements be split into k groups of equal sum?\n}\n",
    hints: [
      "First the cheap rejections: the total must divide evenly by k, and no element may exceed the target sum = total / k.",
      "Now fill the groups ONE AT A TIME rather than juggling k of them. Track only which elements are used, as a bitmask; the running partial sum of the group you are currently filling is (sum of used elements) mod target.",
      "So dp[mask] = 'this exact set of elements can be consumed as some whole groups plus one partial group'. Extend mask by an unused element only when the partial sum plus that element does not overshoot the target. The answer is dp[(1 << n) - 1].",
    ],
    solution:
      "function canPartitionKSubsets(nums, k) {\n  const n = nums.length;\n  if (k <= 0 || n < k) return false;\n  let total = 0;\n  for (let i = 0; i < n; i++) total += nums[i];\n  if (total % k !== 0) return false;\n  const target = total / k;\n  for (let i = 0; i < n; i++) if (nums[i] > target) return false;\n  if (target === 0) return true;\n  const items = nums.slice().sort((a, b) => b - a);\n  const full = 1 << n;\n  const reachable = new Array(full).fill(false);\n  const used = new Array(full).fill(0);\n  reachable[0] = true;\n  for (let mask = 0; mask < full; mask++) {\n    if (!reachable[mask]) continue;\n    const partial = used[mask] % target;\n    for (let i = 0; i < n; i++) {\n      if (mask & (1 << i)) continue;\n      if (partial + items[i] > target) continue;\n      const nextMask = mask | (1 << i);\n      if (!reachable[nextMask]) {\n        reachable[nextMask] = true;\n        used[nextMask] = used[mask] + items[i];\n      }\n    }\n  }\n  return reachable[full - 1];\n}\n",
    tests: [
      {
        name: "splits into four groups of five",
        body: "assert.equal(canPartitionKSubsets([4, 3, 2, 3, 5, 2, 1], 4), true);",
      },
      {
        name: "rejects when no split exists",
        body: "assert.equal(canPartitionKSubsets([1, 2, 3, 4], 3), false);",
      },
      {
        name: "rejects when one element is too big",
        body: "assert.equal(canPartitionKSubsets([2, 2, 2, 2, 3, 4, 5], 4), false);",
      },
      {
        name: "k of 1 is always the whole array",
        body: "assert.equal(canPartitionKSubsets([7], 1), true);\nassert.equal(canPartitionKSubsets([3, 9, 4], 1), true);",
      },
      {
        name: "needs the non-greedy pairing",
        body: "assert.equal(canPartitionKSubsets([10, 10, 10, 7, 7, 7, 7, 7, 7, 6, 6, 6], 3), true);\nassert.equal(canPartitionKSubsets([1, 1, 1, 1, 2, 2, 2, 2], 5), false);",
      },
    ],
  },
  {
    id: "ex-count-strictly-increasing-digits",
    chapter: "dsa-advanced-dp",
    level: "advanced",
    title: "Count Numbers With Strictly Increasing Digits",
    brief:
      "<p>Given a positive integer <code>N</code>, count how many integers in the range <code>[1, N]</code> have <b>strictly increasing</b> digits when written in base 10 — that is, every digit is larger than the digit before it.</p><ul><li><code>1</code>, <code>7</code>, <code>13</code> and <code>159</code> qualify</li><li><code>11</code>, <code>21</code> and <code>102</code> do not</li><li>Every one-digit number from 1 to 9 qualifies</li><li><code>N</code> can be as large as <code>10^9</code>, so counting one number at a time is out — walk the digits of <code>N</code> instead</li></ul>",
    starter:
      "function countStrictlyIncreasing(N) {\n  // TODO: how many integers in [1, N] have strictly increasing digits?\n}\n",
    hints: [
      "Build the answer digit by digit from the most significant end. At each position you only need three facts: the previous digit you placed, whether you are still hugging the prefix of N, and whether you have placed a non-zero digit yet.",
      "'Still hugging N' (call it tight) limits the current digit to at most N's digit at that position; once you go strictly below it, every later position is free to use 0..9.",
      "Leading zeros are not really digits — while nothing has started, choosing 0 keeps 'previous digit' at -1 and does not start the number. Memoise only the states where tight is false, since the tight states are a single path.",
    ],
    solution:
      "function countStrictlyIncreasing(N) {\n  if (N < 1) return 0;\n  const s = String(N);\n  const len = s.length;\n  const memo = new Map();\n  const go = (pos, prev, tight, started) => {\n    if (pos === len) return started ? 1 : 0;\n    const key = pos * 100 + (prev + 1) * 2 + (started ? 1 : 0);\n    if (!tight && memo.has(key)) return memo.get(key);\n    const limit = tight ? s.charCodeAt(pos) - 48 : 9;\n    let total = 0;\n    for (let d = 0; d <= limit; d++) {\n      const stillTight = tight && d === limit;\n      if (!started && d === 0) {\n        total += go(pos + 1, -1, stillTight, false);\n      } else if (d > prev) {\n        total += go(pos + 1, d, stillTight, true);\n      }\n    }\n    if (!tight) memo.set(key, total);\n    return total;\n  };\n  return go(0, -1, true, false);\n}\n",
    tests: [
      {
        name: "single digits all count",
        body: "assert.equal(countStrictlyIncreasing(1), 1);\nassert.equal(countStrictlyIncreasing(9), 9);\nassert.equal(countStrictlyIncreasing(10), 9, '10 has a decreasing step');",
      },
      {
        name: "two-digit range",
        body: "assert.equal(countStrictlyIncreasing(12), 10, 'the 9 singles plus 12');\nassert.equal(countStrictlyIncreasing(99), 45);\nassert.equal(countStrictlyIncreasing(100), 45);",
      },
      {
        name: "agrees with a brute force count up to 2000",
        body: "const naive = (limit) => {\n  let count = 0;\n  for (let v = 1; v <= limit; v++) {\n    const t = String(v);\n    let ok = true;\n    for (let i = 1; i < t.length; i++) if (t.charCodeAt(i) <= t.charCodeAt(i - 1)) ok = false;\n    if (ok) count++;\n  }\n  return count;\n};\nfor (const limit of [37, 123, 456, 789, 1000, 1357, 2000]) {\n  assert.equal(countStrictlyIncreasing(limit), naive(limit), 'mismatch at N = ' + limit);\n}",
      },
      {
        name: "handles a huge N instantly",
        body: "assert.equal(countStrictlyIncreasing(999999999), 511, 'every non-empty subset of 1..9');\nassert.equal(countStrictlyIncreasing(1000000000), 511);",
      },
    ],
  },
  {
    id: "ex-burst-balloons",
    chapter: "dsa-advanced-dp",
    level: "advanced",
    title: "Burst Balloons",
    brief:
      "<p>You are given <code>nums</code>, the numbers painted on a row of balloons. Bursting the balloon at index <code>i</code> earns you <code>left * nums[i] * right</code> coins, where <code>left</code> and <code>right</code> are the balloons immediately beside it <em>at that moment</em>. A missing neighbour (off the end of the row) counts as a balloon painted <code>1</code>. After a burst the row closes up. Return the most coins you can collect by bursting all of them.</p><ul><li>You choose the order freely</li><li>An empty row earns <code>0</code></li><li>Greedily bursting the cheapest (or the most expensive) balloon first is <b>not</b> optimal</li></ul>",
    starter: "function maxCoins(nums) {\n  // TODO: maximum coins from bursting every balloon\n}\n",
    hints: [
      "Thinking about which balloon to burst FIRST is a trap — it splits the row into two halves that are no longer independent, because the two halves become neighbours.",
      "Flip it around: ask which balloon in a range is burst LAST. When balloon k is last inside the open interval (left, right), its neighbours at that moment are exactly the boundaries left and right, and the two sides really are independent.",
      "Pad the array with a 1 at each end. Let dp[left][right] be the best you can do strictly between those two indices; then dp[left][right] = max over k of dp[left][k] + dp[k][right] + vals[left]*vals[k]*vals[right]. Fill by increasing gap.",
    ],
    solution:
      "function maxCoins(nums) {\n  const vals = [1];\n  for (let i = 0; i < nums.length; i++) vals.push(nums[i]);\n  vals.push(1);\n  const m = vals.length;\n  const dp = [];\n  for (let i = 0; i < m; i++) dp.push(new Array(m).fill(0));\n  for (let gap = 2; gap < m; gap++) {\n    for (let left = 0; left + gap < m; left++) {\n      const right = left + gap;\n      let best = 0;\n      for (let k = left + 1; k < right; k++) {\n        const coins = dp[left][k] + dp[k][right] + vals[left] * vals[k] * vals[right];\n        if (coins > best) best = coins;\n      }\n      dp[left][right] = best;\n    }\n  }\n  return dp[0][m - 1];\n}\n",
    tests: [
      {
        name: "the classic row",
        body: "assert.equal(maxCoins([3, 1, 5, 8]), 167);",
      },
      {
        name: "empty and single",
        body: "assert.equal(maxCoins([]), 0);\nassert.equal(maxCoins([5]), 5, 'both neighbours are the imaginary 1s');",
      },
      {
        name: "two balloons",
        body: "assert.equal(maxCoins([1, 5]), 10);",
      },
      {
        name: "beats the greedy order",
        body: "assert.equal(maxCoins([7, 9, 8, 0, 7, 1, 3, 5, 5, 2]), 1582);\nassert.equal(maxCoins([2, 4, 6]), 66);",
      },
      {
        name: "zeros in the row",
        body: "assert.equal(maxCoins([0, 0]), 0);\nassert.equal(maxCoins([3, 0, 4]), 16);",
      },
    ],
  },
  {
    id: "ex-minimum-cost-to-cut-a-stick",
    chapter: "dsa-advanced-dp",
    level: "advanced",
    title: "Minimum Cost to Cut a Stick",
    brief:
      "<p>A wooden stick of length <code>n</code> lies from position <code>0</code> to position <code>n</code>. You are given <code>cuts</code>, the positions you must cut at, in any order you like. Cutting a piece costs the <b>length of that piece</b>, and the cut splits it in two. Return the minimum total cost of performing all the cuts.</p><ul><li>You may perform the cuts in any order, and the order changes the cost</li><li><code>cuts</code> is not sorted</li><li>No cuts at all costs <code>0</code></li><li>Example: <code>n = 7</code> with <code>cuts = [1, 3, 4, 5]</code> costs <code>16</code></li></ul>",
    starter: "function minCost(n, cuts) {\n  // TODO: cheapest total cost to make every cut\n}\n",
    hints: [
      "Sort the cut positions and glue 0 to the front and n to the back. Every piece that ever exists is then the span between two of those points.",
      "For the span from point i to point j, the price of the FIRST cut you make inside it is fixed: it is the whole span, points[j] - points[i], no matter which cut you pick. What varies is what the two halves cost afterwards.",
      "So dp[i][j] = (points[j] - points[i]) + min over k strictly between i and j of dp[i][k] + dp[k][j], with dp[i][i+1] = 0. Fill by increasing j - i.",
    ],
    solution:
      "function minCost(n, cuts) {\n  const points = cuts.slice().sort((a, b) => a - b);\n  points.unshift(0);\n  points.push(n);\n  const m = points.length;\n  const dp = [];\n  for (let i = 0; i < m; i++) dp.push(new Array(m).fill(0));\n  for (let gap = 2; gap < m; gap++) {\n    for (let i = 0; i + gap < m; i++) {\n      const j = i + gap;\n      let best = Infinity;\n      for (let k = i + 1; k < j; k++) {\n        const inner = dp[i][k] + dp[k][j];\n        if (inner < best) best = inner;\n      }\n      dp[i][j] = best + points[j] - points[i];\n    }\n  }\n  return dp[0][m - 1];\n}\n",
    tests: [
      {
        name: "the worked example",
        body: "assert.equal(minCost(7, [1, 3, 4, 5]), 16);",
      },
      {
        name: "unsorted cuts",
        body: "assert.equal(minCost(9, [5, 6, 1, 4, 2]), 22);",
      },
      {
        name: "no cuts and one cut",
        body: "assert.equal(minCost(10, []), 0);\nassert.equal(minCost(10, [4]), 10, 'the single cut always costs the whole stick');",
      },
      {
        name: "order really matters",
        body: "assert.equal(minCost(20, [10]), 20);\nassert.equal(minCost(20, [5, 10, 15]), 40);\nassert.equal(minCost(30, [1, 2, 3, 28, 29]), 64);",
      },
    ],
  },
  {
    id: "ex-house-robber-iii",
    chapter: "dsa-advanced-dp",
    level: "advanced",
    title: "House Robber III",
    brief:
      "<p>The houses of a neighbourhood form a binary tree; <code>node.val</code> is the money in that house. The police are alerted if you rob <b>two houses that are directly linked</b> — that is, a node and one of its children. Return the most money you can take.</p><ul><li>A <code>TreeNode</code> class and a <code>buildTree(levelOrder)</code> helper are already provided — <code>buildTree</code> reads a level-order array where <code>null</code> marks a missing child</li><li>An empty tree yields <code>0</code></li><li>Robbing a grandchild is fine; only parent-child pairs are forbidden</li><li>All values are non-negative</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\n\nfunction buildTree(values) {\n  if (!values || values.length === 0 || values[0] === null) return null;\n  const root = new TreeNode(values[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length > 0 && i < values.length) {\n    const node = queue.shift();\n    if (i < values.length) {\n      const v = values[i++];\n      if (v !== null) { node.left = new TreeNode(v); queue.push(node.left); }\n    }\n    if (i < values.length) {\n      const v = values[i++];\n      if (v !== null) { node.right = new TreeNode(v); queue.push(node.right); }\n    }\n  }\n  return root;\n}\n\nfunction rob(root) {\n  // TODO: most money takeable without robbing a node and its child\n}\n",
    hints: [
      "A node cannot decide on its own: 'take me' is only worth it if the children were skipped. So one number per subtree is not enough information to pass upward.",
      "Return TWO numbers from each subtree — the best total when this node is robbed, and the best total when it is not.",
      "If the node is robbed you must add the children's 'not robbed' numbers. If it is not robbed each child is free to take whichever of its two numbers is larger. The answer at the root is the max of its pair.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\n\nfunction buildTree(values) {\n  if (!values || values.length === 0 || values[0] === null) return null;\n  const root = new TreeNode(values[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length > 0 && i < values.length) {\n    const node = queue.shift();\n    if (i < values.length) {\n      const v = values[i++];\n      if (v !== null) { node.left = new TreeNode(v); queue.push(node.left); }\n    }\n    if (i < values.length) {\n      const v = values[i++];\n      if (v !== null) { node.right = new TreeNode(v); queue.push(node.right); }\n    }\n  }\n  return root;\n}\n\nfunction rob(root) {\n  const go = (node) => {\n    if (node === null) return [0, 0];\n    const left = go(node.left);\n    const right = go(node.right);\n    const skip = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);\n    const take = node.val + left[0] + right[0];\n    return [skip, take];\n  };\n  const pair = go(root);\n  return Math.max(pair[0], pair[1]);\n}\n",
    tests: [
      {
        name: "skips the root to take both grandchildren",
        body: "assert.equal(rob(buildTree([3, 2, 3, null, 3, null, 1])), 7);",
      },
      {
        name: "takes the root and the grandchildren",
        body: "assert.equal(rob(buildTree([3, 4, 5, 1, 3, null, 1])), 9);",
      },
      {
        name: "empty tree and single node",
        body: "assert.equal(rob(null), 0);\nassert.equal(rob(buildTree([])), 0);\nassert.equal(rob(buildTree([7])), 7);",
      },
      {
        name: "a long left spine alternates",
        body: "const root = buildTree([4, 1, null, 2, null, null, null]);\nassert.equal(rob(root), 6, 'take the 4 and the 2');",
      },
      {
        name: "zeros do not confuse the choice",
        body: "assert.equal(rob(buildTree([0, 0, 0])), 0);\nassert.equal(rob(buildTree([2, 1, 3, null, 4])), 7);",
      },
    ],
  },
  {
    id: "ex-range-sum-query-mutable",
    chapter: "dsa-segment-fenwick-trees",
    level: "advanced",
    title: "Range Sum Query — Mutable",
    brief:
      "<p>Build a <code>NumArray</code> class over an integer array that supports point updates and range-sum queries.</p><ul><li><code>new NumArray(nums)</code> — takes a copy of the array</li><li><code>update(i, val)</code> — <b>replaces</b> the value at index <code>i</code> with <code>val</code> (it is not a delta)</li><li><code>sumRange(l, r)</code> — the sum of indices <code>l</code> through <code>r</code> <b>inclusive</b>, with <code>0 &lt;= l &lt;= r &lt; nums.length</code></li><li>Both <code>update</code> and <code>sumRange</code> must run in <b>O(log n)</b>. Re-summing the slice on every query, or rebuilding prefix sums on every update, is <em>not</em> acceptable — the tests interleave thousands of both</li><li>Values may be negative</li></ul>",
    starter:
      "class NumArray {\n  constructor(nums) {\n    // TODO: what structure gives you O(log n) updates AND O(log n) range sums?\n  }\n  update(i, val) {}\n  sumRange(l, r) {}\n}\n",
    hints: [
      "A plain prefix-sum array answers queries in O(1) but costs O(n) to repair after one write. A plain array is the mirror image: O(1) writes, O(n) queries. You want the middle ground where both are logarithmic.",
      "Store partial sums over BLOCKS that halve: a Fenwick (binary indexed) tree, or a segment tree where each node holds the sum of its half of the array.",
      "For a Fenwick tree, keep the original values too. update(i, val) then becomes 'add val - nums[i] at position i', and sumRange(l, r) is prefix(r) - prefix(l - 1). Remember prefix(-1) must be 0.",
    ],
    solution:
      "class NumArray {\n  constructor(nums) {\n    this.n = nums.length;\n    this.values = nums.slice();\n    this.tree = new Array(this.n + 1).fill(0);\n    for (let i = 0; i < this.n; i++) this._add(i, nums[i]);\n  }\n  _add(i, delta) {\n    for (let x = i + 1; x <= this.n; x += x & -x) this.tree[x] += delta;\n  }\n  _prefix(i) {\n    let sum = 0;\n    for (let x = i + 1; x > 0; x -= x & -x) sum += this.tree[x];\n    return sum;\n  }\n  update(i, val) {\n    const delta = val - this.values[i];\n    this.values[i] = val;\n    this._add(i, delta);\n  }\n  sumRange(l, r) {\n    return this._prefix(r) - this._prefix(l - 1);\n  }\n}\n",
    tests: [
      {
        name: "queries then an update",
        body: "const na = new NumArray([1, 3, 5]);\nassert.equal(na.sumRange(0, 2), 9);\nassert.equal(na.sumRange(1, 1), 3);\nna.update(1, 2);\nassert.equal(na.sumRange(0, 2), 8);\nassert.equal(na.sumRange(1, 2), 7);",
      },
      {
        name: "single element and negatives",
        body: "const one = new NumArray([-7]);\nassert.equal(one.sumRange(0, 0), -7);\none.update(0, 4);\nassert.equal(one.sumRange(0, 0), 4);\nconst mix = new NumArray([-2, 0, 3, -5]);\nassert.equal(mix.sumRange(0, 3), -4);\nmix.update(3, 5);\nassert.equal(mix.sumRange(2, 3), 8);",
      },
      {
        name: "updating the same index repeatedly is not cumulative",
        body: "const na = new NumArray([10, 20, 30]);\nna.update(0, 1);\nna.update(0, 2);\nna.update(0, 3);\nassert.equal(na.sumRange(0, 0), 3, 'update replaces, it does not add');\nassert.equal(na.sumRange(0, 2), 53);",
      },
      {
        name: "interleaved updates and queries match a brute-force mirror",
        body: "const n = 64;\nconst base = [];\nfor (let i = 0; i < n; i++) base.push(((i * 37) % 41) - 20);\nconst na = new NumArray(base);\nconst mirror = base.slice();\nlet seed = 12345;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let step = 0; step < 500; step++) {\n  if (step % 3 === 0) {\n    const i = rnd(n);\n    const v = rnd(200) - 100;\n    na.update(i, v);\n    mirror[i] = v;\n  } else {\n    let l = rnd(n);\n    let r = rnd(n);\n    if (l > r) { const t = l; l = r; r = t; }\n    let expected = 0;\n    for (let i = l; i <= r; i++) expected += mirror[i];\n    assert.equal(na.sumRange(l, r), expected, 'sumRange(' + l + ', ' + r + ') at step ' + step);\n  }\n}",
      },
      {
        name: "stays fast on a large array",
        body: "const n = 50000;\nconst base = new Array(n).fill(1);\nconst mirror = base.slice();\nconst na = new NumArray(base);\nlet total = n;\nlet seed = 99;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let step = 0; step < 20000; step++) {\n  const i = rnd(n);\n  const v = rnd(21) - 10;\n  total += v - mirror[i];\n  mirror[i] = v;\n  na.update(i, v);\n  assert.equal(na.sumRange(0, n - 1), total, 'full total at step ' + step);\n}\nlet expected = 0;\nfor (let i = 100; i <= 140; i++) expected += mirror[i];\nassert.equal(na.sumRange(100, 140), expected);",
      },
    ],
  },
  {
    id: "ex-fenwick-binary-indexed-tree",
    chapter: "dsa-segment-fenwick-trees",
    level: "advanced",
    title: "Implement a Fenwick (Binary Indexed) Tree",
    brief:
      "<p>Implement the data structure itself, from scratch. A <code>FenwickTree</code> holds <code>size</code> numbers, all <code>0</code> to begin with.</p><ul><li><code>new FenwickTree(size)</code> — <code>size</code> zeros</li><li><code>update(i, delta)</code> — <b>adds</b> <code>delta</code> to the value at the 0-based index <code>i</code> (this one is a delta, not a replacement)</li><li><code>prefixSum(i)</code> — the sum of indices <code>0</code> through <code>i</code> <b>inclusive</b>; <code>prefixSum(-1)</code> is <code>0</code></li><li>Both operations must be <b>O(log size)</b></li><li>Deltas may be negative</li></ul><p>The trick the structure is built on: index <code>x</code> of the internal array covers the <code>x &amp; -x</code> values ending at <code>x</code>, where <code>x &amp; -x</code> isolates the lowest set bit.</p>",
    starter:
      "class FenwickTree {\n  constructor(size) {\n    // TODO: an internal array; 1-based indexing makes the bit tricks work\n  }\n  update(i, delta) {}\n  prefixSum(i) {}\n}\n",
    hints: [
      "Work internally in 1-based positions: the learner's index i lives at internal position i + 1. Position 0 is left unused so that x & -x is never 0.",
      "To walk UP from a position to every node that covers it, repeatedly do x += x & -x while x <= size. To sum a prefix, walk DOWN with x -= x & -x while x > 0.",
      "That is the whole structure — two four-line loops. Make sure prefixSum(-1) turns into x = 0, whose loop body never runs, so it returns 0.",
    ],
    solution:
      "class FenwickTree {\n  constructor(size) {\n    this.size = size;\n    this.tree = new Array(size + 1).fill(0);\n  }\n  update(i, delta) {\n    for (let x = i + 1; x <= this.size; x += x & -x) this.tree[x] += delta;\n  }\n  prefixSum(i) {\n    let sum = 0;\n    for (let x = i + 1; x > 0; x -= x & -x) sum += this.tree[x];\n    return sum;\n  }\n}\n",
    tests: [
      {
        name: "starts empty and accumulates",
        body: "const ft = new FenwickTree(5);\nassert.equal(ft.prefixSum(4), 0);\nassert.equal(ft.prefixSum(-1), 0);\nft.update(0, 3);\nft.update(2, 7);\nassert.equal(ft.prefixSum(0), 3);\nassert.equal(ft.prefixSum(1), 3);\nassert.equal(ft.prefixSum(2), 10);\nassert.equal(ft.prefixSum(4), 10);",
      },
      {
        name: "update adds rather than replaces",
        body: "const ft = new FenwickTree(4);\nft.update(1, 5);\nft.update(1, 5);\nassert.equal(ft.prefixSum(1), 10);\nft.update(1, -4);\nassert.equal(ft.prefixSum(1), 6);\nassert.equal(ft.prefixSum(3), 6);",
      },
      {
        name: "range sums come from two prefixes",
        body: "const ft = new FenwickTree(8);\nfor (let i = 0; i < 8; i++) ft.update(i, i + 1);\nassert.equal(ft.prefixSum(7), 36);\nassert.equal(ft.prefixSum(3) - ft.prefixSum(0), 9, 'indices 1..3 hold 2 + 3 + 4');\nassert.equal(ft.prefixSum(7) - ft.prefixSum(3), 26);",
      },
      {
        name: "size 1 and non-power-of-two sizes",
        body: "const one = new FenwickTree(1);\none.update(0, 42);\nassert.equal(one.prefixSum(0), 42);\nconst odd = new FenwickTree(7);\nodd.update(6, 2);\nodd.update(5, 3);\nassert.equal(odd.prefixSum(4), 0);\nassert.equal(odd.prefixSum(5), 3);\nassert.equal(odd.prefixSum(6), 5);",
      },
      {
        name: "interleaved updates and prefixes match a brute-force mirror",
        body: "const n = 50;\nconst ft = new FenwickTree(n);\nconst mirror = new Array(n).fill(0);\nlet seed = 2024;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let step = 0; step < 400; step++) {\n  const i = rnd(n);\n  const delta = rnd(21) - 10;\n  ft.update(i, delta);\n  mirror[i] += delta;\n  const q = rnd(n);\n  let expected = 0;\n  for (let j = 0; j <= q; j++) expected += mirror[j];\n  assert.equal(ft.prefixSum(q), expected, 'prefixSum(' + q + ') at step ' + step);\n}",
      },
    ],
  },
  {
    id: "ex-range-minimum-query-segment-tree",
    chapter: "dsa-segment-fenwick-trees",
    level: "advanced",
    title: "Range Minimum Query (Segment Tree)",
    brief:
      "<p>Build a <code>SegmentTreeMin</code> class over an array of numbers.</p><ul><li><code>new SegmentTreeMin(nums)</code> — builds from a non-empty array</li><li><code>update(i, val)</code> — <b>replaces</b> the value at index <code>i</code></li><li><code>rangeMin(l, r)</code> — the smallest value in indices <code>l</code> to <code>r</code> <b>inclusive</b></li><li>Both operations must be <b>O(log n)</b></li><li>A Fenwick tree does not work here — minimum has no inverse, so you cannot subtract one prefix from another</li><li>Values may be negative; duplicates are fine</li></ul>",
    starter:
      "class SegmentTreeMin {\n  constructor(nums) {\n    // TODO: each node should own the minimum of one half of its parent's span\n  }\n  update(i, val) {}\n  rangeMin(l, r) {}\n}\n",
    hints: [
      "Store the tree in a flat array where node 1 owns the whole array, node 2k owns the left half of node k's span and node 2k + 1 the right half. An array of length 4 * n is always enough.",
      "A query on (l, r) at a node has three cases: the node's span is completely outside — return Infinity; completely inside — return the node's stored minimum; otherwise recurse into both children and take the smaller.",
      "An update walks down to the single leaf, writes the new value there, and then on the way back up resets each ancestor to Math.min of its two children.",
    ],
    solution:
      "class SegmentTreeMin {\n  constructor(nums) {\n    this.n = nums.length;\n    this.tree = new Array(4 * (this.n > 0 ? this.n : 1)).fill(Infinity);\n    if (this.n > 0) this._build(nums, 1, 0, this.n - 1);\n  }\n  _build(nums, node, lo, hi) {\n    if (lo === hi) { this.tree[node] = nums[lo]; return; }\n    const mid = (lo + hi) >> 1;\n    this._build(nums, node * 2, lo, mid);\n    this._build(nums, node * 2 + 1, mid + 1, hi);\n    this.tree[node] = Math.min(this.tree[node * 2], this.tree[node * 2 + 1]);\n  }\n  update(i, val) {\n    this._update(1, 0, this.n - 1, i, val);\n  }\n  _update(node, lo, hi, i, val) {\n    if (lo === hi) { this.tree[node] = val; return; }\n    const mid = (lo + hi) >> 1;\n    if (i <= mid) this._update(node * 2, lo, mid, i, val);\n    else this._update(node * 2 + 1, mid + 1, hi, i, val);\n    this.tree[node] = Math.min(this.tree[node * 2], this.tree[node * 2 + 1]);\n  }\n  rangeMin(l, r) {\n    if (this.n === 0 || l > r) return Infinity;\n    return this._query(1, 0, this.n - 1, l, r);\n  }\n  _query(node, lo, hi, l, r) {\n    if (r < lo || hi < l) return Infinity;\n    if (l <= lo && hi <= r) return this.tree[node];\n    const mid = (lo + hi) >> 1;\n    const left = this._query(node * 2, lo, mid, l, r);\n    const right = this._query(node * 2 + 1, mid + 1, hi, l, r);\n    return Math.min(left, right);\n  }\n}\n",
    tests: [
      {
        name: "queries the initial array",
        body: "const st = new SegmentTreeMin([5, 2, 9, 1, 7, 3]);\nassert.equal(st.rangeMin(0, 5), 1);\nassert.equal(st.rangeMin(0, 2), 2);\nassert.equal(st.rangeMin(4, 5), 3);\nassert.equal(st.rangeMin(2, 2), 9);",
      },
      {
        name: "an update can raise or lower the minimum",
        body: "const st = new SegmentTreeMin([5, 2, 9, 1, 7, 3]);\nst.update(3, 100);\nassert.equal(st.rangeMin(0, 5), 2, 'the old minimum is gone');\nst.update(5, -4);\nassert.equal(st.rangeMin(0, 5), -4);\nassert.equal(st.rangeMin(0, 4), 2);",
      },
      {
        name: "single element array",
        body: "const st = new SegmentTreeMin([8]);\nassert.equal(st.rangeMin(0, 0), 8);\nst.update(0, -1);\nassert.equal(st.rangeMin(0, 0), -1);",
      },
      {
        name: "duplicates survive one being replaced",
        body: "const st = new SegmentTreeMin([4, 1, 6, 1, 9]);\nassert.equal(st.rangeMin(0, 4), 1);\nst.update(1, 50);\nassert.equal(st.rangeMin(0, 4), 1, 'the other 1 is still there');\nst.update(3, 50);\nassert.equal(st.rangeMin(0, 4), 4);",
      },
      {
        name: "interleaved updates and queries match a brute-force mirror",
        body: "const n = 47;\nconst base = [];\nfor (let i = 0; i < n; i++) base.push(((i * 29) % 53) - 26);\nconst st = new SegmentTreeMin(base);\nconst mirror = base.slice();\nlet seed = 555;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let step = 0; step < 500; step++) {\n  if (step % 4 === 0) {\n    const i = rnd(n);\n    const v = rnd(120) - 60;\n    st.update(i, v);\n    mirror[i] = v;\n  }\n  let l = rnd(n);\n  let r = rnd(n);\n  if (l > r) { const t = l; l = r; r = t; }\n  let expected = Infinity;\n  for (let i = l; i <= r; i++) if (mirror[i] < expected) expected = mirror[i];\n  assert.equal(st.rangeMin(l, r), expected, 'rangeMin(' + l + ', ' + r + ') at step ' + step);\n}",
      },
    ],
  },
  {
    id: "ex-count-of-smaller-numbers-after-self",
    chapter: "dsa-segment-fenwick-trees",
    level: "advanced",
    title: "Count of Smaller Numbers After Self",
    brief:
      "<p>Given an integer array <code>nums</code>, return an array <code>counts</code> of the same length where <code>counts[i]</code> is how many numbers to the <b>right</b> of <code>nums[i]</code> are <b>strictly smaller</b> than it.</p><ul><li><code>[5, 2, 6, 1]</code> gives <code>[2, 1, 1, 0]</code></li><li>Equal values do not count — only strictly smaller ones</li><li>An empty array gives an empty array</li><li>Values can be negative and can repeat, so index them by <b>rank</b> (their position in the sorted set of distinct values) rather than by value</li><li>Aim for <code>O(n log n)</code>; the nested-loop count is the thing to beat</li></ul>",
    starter:
      "function countSmaller(nums) {\n  // TODO: for each index, how many strictly smaller values sit to its right?\n}\n",
    hints: [
      "Walk the array from RIGHT to LEFT. Then 'the numbers to my right' is exactly 'everything I have inserted so far', and the question becomes 'how many inserted values are smaller than this one?'.",
      "That question is a prefix count, which is what a Fenwick tree answers in O(log n) — as long as the values are small array indices. So first compress: sort the distinct values and map each value to its rank 0, 1, 2, ...",
      "For each element from the right: answer = prefixSum(rank - 1) (strictly smaller ranks only, which is why equal values are excluded), then add 1 at rank.",
    ],
    solution:
      "function countSmaller(nums) {\n  const n = nums.length;\n  const result = new Array(n).fill(0);\n  if (n === 0) return result;\n  const sorted = nums.slice().sort((a, b) => a - b);\n  const rank = new Map();\n  let next = 0;\n  for (let i = 0; i < n; i++) {\n    if (!rank.has(sorted[i])) { rank.set(sorted[i], next); next++; }\n  }\n  const size = next;\n  const tree = new Array(size + 1).fill(0);\n  const add = (i) => { for (let x = i + 1; x <= size; x += x & -x) tree[x] += 1; };\n  const prefix = (i) => {\n    let sum = 0;\n    for (let x = i + 1; x > 0; x -= x & -x) sum += tree[x];\n    return sum;\n  };\n  for (let i = n - 1; i >= 0; i--) {\n    const r = rank.get(nums[i]);\n    result[i] = prefix(r - 1);\n    add(r);\n  }\n  return result;\n}\n",
    tests: [
      {
        name: "the worked example",
        body: "assert.deepEqual(countSmaller([5, 2, 6, 1]), [2, 1, 1, 0]);",
      },
      {
        name: "empty, single, and all equal",
        body: "assert.deepEqual(countSmaller([]), []);\nassert.deepEqual(countSmaller([-1]), [0]);\nassert.deepEqual(countSmaller([-1, -1]), [0, 0], 'equal does not count as smaller');\nassert.deepEqual(countSmaller([7, 7, 7, 7]), [0, 0, 0, 0]);",
      },
      {
        name: "sorted ascending and descending",
        body: "assert.deepEqual(countSmaller([1, 2, 3, 4, 5]), [0, 0, 0, 0, 0]);\nassert.deepEqual(countSmaller([5, 4, 3, 2, 1]), [4, 3, 2, 1, 0]);",
      },
      {
        name: "negatives and duplicates together",
        body: "assert.deepEqual(countSmaller([-1, -2, 0, -2, 3]), [2, 0, 1, 0, 0]);\nassert.deepEqual(countSmaller([2, 0, 1]), [2, 0, 0]);",
      },
      {
        name: "matches a brute force on a larger array",
        body: "const n = 300;\nconst nums = [];\nfor (let i = 0; i < n; i++) nums.push(((i * 137) % 91) - 45);\nconst brute = [];\nfor (let i = 0; i < n; i++) {\n  let c = 0;\n  for (let j = i + 1; j < n; j++) if (nums[j] < nums[i]) c++;\n  brute.push(c);\n}\nassert.deepEqual(countSmaller(nums), brute);",
      },
    ],
  },
  {
    id: "ex-range-sum-query-2d-mutable",
    chapter: "dsa-segment-fenwick-trees",
    level: "advanced",
    title: "Range Sum Query 2D — Mutable",
    brief:
      "<p>Build a <code>NumMatrix</code> class over a rectangular grid of numbers that supports point updates and rectangle-sum queries.</p><ul><li><code>new NumMatrix(matrix)</code> — takes a copy of the grid</li><li><code>update(row, col, val)</code> — <b>replaces</b> that cell's value</li><li><code>sumRegion(row1, col1, row2, col2)</code> — the sum of the rectangle with those <b>inclusive</b> corners, where <code>row1 &lt;= row2</code> and <code>col1 &lt;= col2</code></li><li>Both operations should be <b>O(log rows * log cols)</b></li><li>Values may be negative</li></ul>",
    starter:
      "class NumMatrix {\n  constructor(matrix) {\n    // TODO: a Fenwick tree in each dimension\n  }\n  update(row, col, val) {}\n  sumRegion(row1, col1, row2, col2) {}\n}\n",
    hints: [
      "Start from the 1D Fenwick tree and nest it: the internal store is a (rows + 1) x (cols + 1) grid, and every operation runs the x += x & -x loop over rows with a second such loop over columns inside it.",
      "Define one private helper, prefix(row, col) = sum of the rectangle from (0, 0) to (row, col) inclusive, returning 0 when either coordinate is negative.",
      "Then inclusion-exclusion gives the answer: prefix(r2, c2) - prefix(r1 - 1, c2) - prefix(r2, c1 - 1) + prefix(r1 - 1, c1 - 1). Keep the raw values in a mirror grid so update can compute its delta.",
    ],
    solution:
      "class NumMatrix {\n  constructor(matrix) {\n    this.rows = matrix.length;\n    this.cols = this.rows > 0 ? matrix[0].length : 0;\n    this.values = [];\n    this.tree = [];\n    for (let i = 0; i <= this.rows; i++) this.tree.push(new Array(this.cols + 1).fill(0));\n    for (let i = 0; i < this.rows; i++) this.values.push(matrix[i].slice());\n    for (let i = 0; i < this.rows; i++) {\n      for (let j = 0; j < this.cols; j++) this._add(i, j, matrix[i][j]);\n    }\n  }\n  _add(row, col, delta) {\n    for (let x = row + 1; x <= this.rows; x += x & -x) {\n      for (let y = col + 1; y <= this.cols; y += y & -y) this.tree[x][y] += delta;\n    }\n  }\n  _prefix(row, col) {\n    let sum = 0;\n    for (let x = row + 1; x > 0; x -= x & -x) {\n      for (let y = col + 1; y > 0; y -= y & -y) sum += this.tree[x][y];\n    }\n    return sum;\n  }\n  update(row, col, val) {\n    const delta = val - this.values[row][col];\n    this.values[row][col] = val;\n    this._add(row, col, delta);\n  }\n  sumRegion(row1, col1, row2, col2) {\n    return this._prefix(row2, col2)\n      - this._prefix(row1 - 1, col2)\n      - this._prefix(row2, col1 - 1)\n      + this._prefix(row1 - 1, col1 - 1);\n  }\n}\n",
    tests: [
      {
        name: "rectangles before and after an update",
        body: "const nm = new NumMatrix([\n  [1, 2, 3],\n  [4, 5, 6],\n  [7, 8, 9],\n]);\nassert.equal(nm.sumRegion(0, 0, 2, 2), 45);\nassert.equal(nm.sumRegion(1, 1, 2, 2), 28);\nassert.equal(nm.sumRegion(0, 2, 0, 2), 3);\nnm.update(1, 1, 0);\nassert.equal(nm.sumRegion(0, 0, 2, 2), 40);\nassert.equal(nm.sumRegion(1, 1, 1, 1), 0);",
      },
      {
        name: "single cell matrix and negatives",
        body: "const one = new NumMatrix([[5]]);\nassert.equal(one.sumRegion(0, 0, 0, 0), 5);\none.update(0, 0, -3);\nassert.equal(one.sumRegion(0, 0, 0, 0), -3);\nconst neg = new NumMatrix([[-1, -2], [-3, -4]]);\nassert.equal(neg.sumRegion(0, 0, 1, 1), -10);\nassert.equal(neg.sumRegion(0, 1, 1, 1), -6);",
      },
      {
        name: "non-square grids and single rows or columns",
        body: "const nm = new NumMatrix([[1, 2, 3, 4], [5, 6, 7, 8]]);\nassert.equal(nm.sumRegion(0, 0, 0, 3), 10);\nassert.equal(nm.sumRegion(0, 2, 1, 2), 10);\nnm.update(0, 3, 40);\nassert.equal(nm.sumRegion(0, 0, 0, 3), 46);\nassert.equal(nm.sumRegion(0, 0, 1, 3), 72);",
      },
      {
        name: "updating replaces rather than accumulates",
        body: "const nm = new NumMatrix([[10, 10], [10, 10]]);\nnm.update(0, 0, 1);\nnm.update(0, 0, 2);\nnm.update(0, 0, 3);\nassert.equal(nm.sumRegion(0, 0, 0, 0), 3);\nassert.equal(nm.sumRegion(0, 0, 1, 1), 33);",
      },
      {
        name: "interleaved updates and queries match a brute-force mirror",
        body: "const rows = 12;\nconst cols = 9;\nconst grid = [];\nfor (let i = 0; i < rows; i++) {\n  const row = [];\n  for (let j = 0; j < cols; j++) row.push(((i * 7 + j * 13) % 31) - 15);\n  grid.push(row);\n}\nconst nm = new NumMatrix(grid);\nconst mirror = [];\nfor (let i = 0; i < rows; i++) mirror.push(grid[i].slice());\nlet seed = 31337;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let step = 0; step < 400; step++) {\n  if (step % 3 === 0) {\n    const r = rnd(rows);\n    const c = rnd(cols);\n    const v = rnd(100) - 50;\n    nm.update(r, c, v);\n    mirror[r][c] = v;\n  }\n  let r1 = rnd(rows);\n  let r2 = rnd(rows);\n  if (r1 > r2) { const t = r1; r1 = r2; r2 = t; }\n  let c1 = rnd(cols);\n  let c2 = rnd(cols);\n  if (c1 > c2) { const t = c1; c1 = c2; c2 = t; }\n  let expected = 0;\n  for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) expected += mirror[i][j];\n  assert.equal(nm.sumRegion(r1, c1, r2, c2), expected, 'step ' + step);\n}",
      },
    ],
  },
  {
    id: "ex-classify-growth-rate",
    chapter: "dsa-complexity-analysis",
    level: "beginner",
    title: "Classify a Function's Growth Rate",
    brief:
      '<p>Someone instrumented a function with an operation counter and handed you the numbers. Given <code>counts</code>, an array of <code>[n, operations]</code> samples, return the complexity class as a string.</p><ul><li>The answer is one of <code>"O(1)"</code>, <code>"O(log n)"</code>, <code>"O(n)"</code>, <code>"O(n log n)"</code>, <code>"O(n^2)"</code> — check them in <b>exactly that order</b></li><li>Their growth functions are <code>1</code>, <code>log2(n)</code>, <code>n</code>, <code>n * log2(n)</code>, <code>n * n</code></li><li>Scale a candidate <code>f</code> to the <b>first</b> sample: <code>c = counts[0][1] / f(counts[0][0])</code></li><li>The candidate <b>fits</b> when every sample <code>[n, ops]</code> satisfies <code>Math.abs(c * f(n) - ops) &lt;= 0.15 * ops</code> — a 15% tolerance, so that real measurements with a bit of noise still classify</li><li>Return the first candidate that fits; the data is always clean enough that one does</li><li><code>counts</code> has at least two samples and every <code>n</code> is at least 2</li></ul>',
    starter:
      "function classify(counts) {\n  // TODO: which growth curve, scaled to the first sample, tracks all the samples?\n}\n",
    hints: [
      "Do not try to reason about ratios between consecutive samples — just write down the five candidate curves as functions and test each one.",
      "For each candidate: work out the constant c that makes the curve pass exactly through the first sample, then check the remaining samples against that same c.",
      "The whole thing is a loop over five [name, fn] pairs with an inner loop over the samples and an early bail-out. Math.log2 gives you the base-2 logarithm.",
    ],
    solution:
      "function classify(counts) {\n  const candidates = [\n    ['O(1)', (n) => 1],\n    ['O(log n)', (n) => Math.log2(n)],\n    ['O(n)', (n) => n],\n    ['O(n log n)', (n) => n * Math.log2(n)],\n    ['O(n^2)', (n) => n * n],\n  ];\n  for (let c = 0; c < candidates.length; c++) {\n    const name = candidates[c][0];\n    const f = candidates[c][1];\n    const scale = counts[0][1] / f(counts[0][0]);\n    let fits = true;\n    for (let i = 0; i < counts.length; i++) {\n      const n = counts[i][0];\n      const ops = counts[i][1];\n      if (Math.abs(scale * f(n) - ops) > 0.15 * ops) { fits = false; break; }\n    }\n    if (fits) return name;\n  }\n  return 'O(n^2)';\n}\n",
    tests: [
      {
        name: "constant work",
        body: "assert.equal(classify([[10, 5], [100, 5], [1000, 5], [10000, 5]]), 'O(1)');\nassert.equal(classify([[8, 12], [64, 12]]), 'O(1)');",
      },
      {
        name: "logarithmic work",
        body: "assert.equal(classify([[16, 40], [256, 80], [4096, 120], [65536, 160]]), 'O(log n)');",
      },
      {
        name: "linear work, including slightly noisy samples",
        body: "assert.equal(classify([[100, 300], [200, 600], [400, 1200], [800, 2400]]), 'O(n)');\nassert.equal(classify([[100, 300], [200, 588], [400, 1230], [800, 2350]]), 'O(n)', 'noise inside 15% still classifies');",
      },
      {
        name: "linearithmic work",
        body: "assert.equal(classify([[64, 384], [256, 2048], [1024, 10240], [4096, 49152]]), 'O(n log n)');",
      },
      {
        name: "quadratic work",
        body: "assert.equal(classify([[10, 200], [20, 800], [40, 3200], [80, 12800]]), 'O(n^2)');\nassert.equal(classify([[100, 4950], [200, 19900], [400, 79800]]), 'O(n^2)', 'n(n-1)/2 is quadratic');",
      },
    ],
  },
  {
    id: "ex-rewrite-nested-loop-linear",
    chapter: "dsa-complexity-analysis",
    level: "beginner",
    title: "Rewrite a Nested Loop as a Linear Scan",
    brief:
      "<p>The starter contains a working <code>hasPairSum(nums, target)</code>: it returns <code>true</code> when two <b>different</b> positions in <code>nums</code> hold values adding up to <code>target</code>. It is correct and it is <code>O(n^2)</code>. Rewrite it so it runs in <code>O(n)</code>, keeping the exact same behaviour.</p><ul><li>The two values must come from two different indices, but they may be equal values — <code>[3, 3]</code> with target <code>6</code> is <code>true</code></li><li>A single element can never pair with itself: <code>[4]</code> with target <code>8</code> is <code>false</code></li><li>Negative numbers and zero are allowed</li><li>One test runs 150,000 elements with no answer present. The quadratic version needs billions of comparisons there and will not finish — the linear one takes milliseconds</li></ul>",
    starter:
      "function hasPairSum(nums, target) {\n  // TODO: this is the O(n^2) version — make it O(n) without changing what it returns\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) return true;\n    }\n  }\n  return false;\n}\n",
    hints: [
      "The inner loop is answering one question over and over: 'is the value target - nums[i] somewhere else in the array?' Any structure that answers membership in O(1) removes it.",
      "Pass over the array once with a Set. For each value, ask whether its complement has already been seen; if not, add the value and move on.",
      "Checking BEFORE inserting is what keeps a single element from pairing with itself, while still letting a real duplicate pair up — [3, 3] with target 6 must stay true.",
    ],
    solution:
      "function hasPairSum(nums, target) {\n  const seen = new Set();\n  for (let i = 0; i < nums.length; i++) {\n    if (seen.has(target - nums[i])) return true;\n    seen.add(nums[i]);\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "finds and rejects small cases",
        body: "assert.equal(hasPairSum([2, 7, 11, 15], 9), true);\nassert.equal(hasPairSum([2, 7, 11, 15], 3), false);\nassert.equal(hasPairSum([1, 2, 3, 4], 7), true);",
      },
      {
        name: "an element cannot pair with itself",
        body: "assert.equal(hasPairSum([4], 8), false);\nassert.equal(hasPairSum([], 0), false);\nassert.equal(hasPairSum([5, 1], 10), false);",
      },
      {
        name: "duplicate values do pair",
        body: "assert.equal(hasPairSum([3, 3], 6), true);\nassert.equal(hasPairSum([0, 0], 0), true);\nassert.equal(hasPairSum([1, 3, 5, 3], 6), true);",
      },
      {
        name: "negatives and zero",
        body: "assert.equal(hasPairSum([-3, 8, 4], 1), true);\nassert.equal(hasPairSum([-5, -2, -9], -7), true);\nassert.equal(hasPairSum([-1, -2, -3], 5), false);",
      },
      {
        name: "150,000 elements with no answer — quadratic will not finish",
        body: "const n = 150000;\nconst nums = [];\nfor (let i = 0; i < n; i++) nums.push(i * 2);\nassert.equal(hasPairSum(nums, 3), false, 'every value is even, so an odd target is impossible');\nassert.equal(hasPairSum(nums, 2 * n - 4), true, 'the last two values do add up');",
      },
    ],
  },
  {
    id: "ex-count-basic-operations",
    chapter: "dsa-complexity-analysis",
    level: "beginner",
    title: "Count the Comparisons Exactly",
    brief:
      "<p>Consider this shape, which shows up inside selection sort, bubble sort and every 'check all pairs' scan:</p><ul><li><code>for (let i = 0; i &lt; n; i++)</code></li><li><code>&nbsp;&nbsp;for (let j = i + 1; j &lt; n; j++)</code></li><li><code>&nbsp;&nbsp;&nbsp;&nbsp;// exactly one comparison happens here</code></li></ul><p>Write <code>countComparisons(n)</code> returning the <b>exact</b> number of comparisons performed — not a Big-O class, the precise count.</p><ul><li><code>n = 0</code> and <code>n = 1</code> both perform <code>0</code> comparisons</li><li>Return a plain number</li><li><code>n</code> can be in the hundreds of thousands, and the tests are strict about speed — so derive the closed form rather than actually running the two loops</li></ul>",
    starter: "function countComparisons(n) {\n  // TODO: the exact comparison count, in closed form\n}\n",
    hints: [
      "Count one outer iteration at a time. When i = 0 the inner loop runs n - 1 times, when i = 1 it runs n - 2 times, and so on down to 0 for the last i.",
      "So the total is (n - 1) + (n - 2) + ... + 1 + 0 — the sum of the first n - 1 whole numbers.",
      "That sum has a closed form: n * (n - 1) / 2. Multiplying before dividing keeps it an exact integer, and check that n = 0 does not slip through as a negative.",
    ],
    solution: "function countComparisons(n) {\n  if (n <= 1) return 0;\n  return (n * (n - 1)) / 2;\n}\n",
    tests: [
      {
        name: "small values, checked against the actual loops",
        body: "const brute = (n) => {\n  let c = 0;\n  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) c++;\n  return c;\n};\nfor (let n = 0; n <= 40; n++) {\n  assert.equal(countComparisons(n), brute(n), 'wrong at n = ' + n);\n}",
      },
      {
        name: "the degenerate sizes",
        body: "assert.equal(countComparisons(0), 0);\nassert.equal(countComparisons(1), 0);\nassert.equal(countComparisons(2), 1);\nassert.type(countComparisons(5), 'number');",
      },
      {
        name: "known landmarks",
        body: "assert.equal(countComparisons(10), 45);\nassert.equal(countComparisons(100), 4950);\nassert.equal(countComparisons(1000), 499500);",
      },
      {
        name: "huge n must be instant, so the loops cannot be run",
        body: "assert.equal(countComparisons(200000), 19999900000);\nassert.equal(countComparisons(1000000), 499999500000);",
      },
    ],
  },
  {
    id: "ex-pick-approach-from-constraint",
    chapter: "dsa-interview-strategy",
    level: "intermediate",
    title: "Read the Constraint, Pick the Complexity",
    brief:
      '<p>The single highest-leverage reflex in an interview: the stated bound on <code>n</code> already tells you which complexity the interviewer is fishing for. Roughly 10^8 basic operations fit in a second, so the input size pins down the shape of the answer before you have thought about the problem at all.</p><p>Write <code>pickApproach(n)</code> returning the intended complexity as a string:</p><ul><li><code>n &lt;= 20</code> — <code>"O(2^n) / bitmask"</code> (subsets are still affordable, so brute force over subsets is the point)</li><li><code>n &lt;= 300</code> — <code>"O(n^3)"</code> (think Floyd-Warshall or interval DP)</li><li><code>n &lt;= 5000</code> — <code>"O(n^2)"</code> (a two-dimensional DP table)</li><li><code>n &lt;= 1000000</code> — <code>"O(n log n)"</code> (sort, heap, or binary search on the answer)</li><li>anything larger — <code>"O(n)"</code> (one pass, maybe two pointers or a hash map)</li></ul><p>The bands are inclusive on their upper bound, so <code>n = 20</code> is the bitmask band and <code>n = 21</code> is the next one down.</p>',
    starter:
      "function pickApproach(n) {\n  // TODO: map the input size to the complexity the constraint is hinting at\n}\n",
    hints: [
      "This is a ladder of thresholds. Check them from the smallest bound upward and return on the first one that n fits inside.",
      "Watch the boundaries: each band is inclusive, so the comparison is n <= bound, not n < bound.",
      "Everything past the last bound falls through to the linear answer — no final comparison needed, just a return.",
    ],
    solution:
      "function pickApproach(n) {\n  if (n <= 20) return 'O(2^n) / bitmask';\n  if (n <= 300) return 'O(n^3)';\n  if (n <= 5000) return 'O(n^2)';\n  if (n <= 1000000) return 'O(n log n)';\n  return 'O(n)';\n}\n",
    tests: [
      {
        name: "tiny inputs mean exponential is fine",
        body: "assert.equal(pickApproach(1), 'O(2^n) / bitmask');\nassert.equal(pickApproach(12), 'O(2^n) / bitmask');\nassert.equal(pickApproach(20), 'O(2^n) / bitmask');",
      },
      {
        name: "the cubic and quadratic bands",
        body: "assert.equal(pickApproach(21), 'O(n^3)');\nassert.equal(pickApproach(300), 'O(n^3)');\nassert.equal(pickApproach(301), 'O(n^2)');\nassert.equal(pickApproach(5000), 'O(n^2)');",
      },
      {
        name: "sorting territory",
        body: "assert.equal(pickApproach(5001), 'O(n log n)');\nassert.equal(pickApproach(100000), 'O(n log n)');\nassert.equal(pickApproach(1000000), 'O(n log n)');",
      },
      {
        name: "beyond a million it has to be one pass",
        body: "assert.equal(pickApproach(1000001), 'O(n)');\nassert.equal(pickApproach(50000000), 'O(n)');\nassert.type(pickApproach(7), 'string');",
      },
    ],
  },
  {
    id: "ex-feasible-approaches-under-constraints",
    chapter: "dsa-interview-strategy",
    level: "intermediate",
    title: "Which Approaches Actually Fit?",
    brief:
      '<p>You are given <code>approaches</code>, an array of objects <code>{ name, timeComplexity, spaceComplexity }</code>, and a <code>constraint</code> object <code>{ n, memoryMB }</code>. Return the <code>name</code>s of the approaches that fit the budget, in their <b>original order</b>.</p><ul><li>A complexity string is one of <code>"O(1)"</code>, <code>"O(log n)"</code>, <code>"O(n)"</code>, <code>"O(n log n)"</code>, <code>"O(n^2)"</code>, <code>"O(n^3)"</code>, <code>"O(2^n)"</code>, <code>"O(n!)"</code></li><li>Turn it into a number by substituting <code>constraint.n</code>, with logarithms base 2 — so <code>"O(n log n)"</code> at <code>n = 1000</code> is <code>1000 * Math.log2(1000)</code></li><li><b>Time budget:</b> the machine does <code>1e8</code> basic operations per second and you have 1 second, so the approach fits on time when its value is <code>&lt;= 1e8</code></li><li><b>Memory budget:</b> each unit of space costs 8 bytes and 1 MB is <code>1e6</code> bytes, so the approach fits on memory when <code>units * 8 &lt;= constraint.memoryMB * 1e6</code></li><li>Both budgets must hold. Comparisons are <code>&lt;=</code>, so landing exactly on the budget counts as fitting</li><li><code>O(2^n)</code> and <code>O(n!)</code> overflow to enormous values for even modest <code>n</code> — that is fine, they simply do not fit</li><li>An empty <code>approaches</code> array returns an empty array</li></ul>',
    starter:
      "function feasibleApproaches(approaches, constraint) {\n  // TODO: keep the approaches whose time AND space both fit the budget\n}\n",
    hints: [
      "Write one helper that turns a complexity string plus a value of n into a number. A chain of string comparisons is perfectly fine here — there are only eight cases.",
      "Factorial is the only awkward one: build it with a loop and bail out to Infinity once the product gets absurd, so you never spin for a large n.",
      "Then it is a single filter: evaluate the time string against 1e8 and the space string times 8 against memoryMB * 1e6, and collect the names of the survivors in order.",
    ],
    solution:
      "function feasibleApproaches(approaches, constraint) {\n  const n = constraint.n;\n  const evaluate = (complexity) => {\n    if (complexity === 'O(1)') return 1;\n    if (complexity === 'O(log n)') return Math.log2(n);\n    if (complexity === 'O(n)') return n;\n    if (complexity === 'O(n log n)') return n * Math.log2(n);\n    if (complexity === 'O(n^2)') return n * n;\n    if (complexity === 'O(n^3)') return n * n * n;\n    if (complexity === 'O(2^n)') return Math.pow(2, n);\n    if (complexity === 'O(n!)') {\n      let product = 1;\n      for (let i = 2; i <= n; i++) {\n        product *= i;\n        if (product > 1e300) return Infinity;\n      }\n      return product;\n    }\n    return Infinity;\n  };\n  const opsBudget = 1e8;\n  const byteBudget = constraint.memoryMB * 1e6;\n  const fitting = [];\n  for (let i = 0; i < approaches.length; i++) {\n    const a = approaches[i];\n    const ops = evaluate(a.timeComplexity);\n    const bytes = evaluate(a.spaceComplexity) * 8;\n    if (ops <= opsBudget && bytes <= byteBudget) fitting.push(a.name);\n  }\n  return fitting;\n}\n",
    tests: [
      {
        name: "drops the approach that is too slow",
        body: "const approaches = [\n  { name: 'brute force', timeComplexity: 'O(n^2)', spaceComplexity: 'O(1)' },\n  { name: 'floyd warshall', timeComplexity: 'O(n^3)', spaceComplexity: 'O(n^2)' },\n  { name: 'sort then scan', timeComplexity: 'O(n log n)', spaceComplexity: 'O(n)' },\n];\nconst got = feasibleApproaches(approaches, { n: 1000, memoryMB: 16 });\nassert.deepEqual(got, ['brute force', 'sort then scan'], 'n^3 is 1e9 operations');",
      },
      {
        name: "memory can be the thing that rules an approach out",
        body: "const approaches = [\n  { name: 'table dp', timeComplexity: 'O(n^2)', spaceComplexity: 'O(n^2)' },\n  { name: 'rolling dp', timeComplexity: 'O(n^2)', spaceComplexity: 'O(n)' },\n];\nassert.deepEqual(feasibleApproaches(approaches, { n: 1000, memoryMB: 16 }), ['table dp', 'rolling dp'], '1e6 units is 8 MB');\nassert.deepEqual(feasibleApproaches(approaches, { n: 1000, memoryMB: 4 }), ['rolling dp'], '8 MB does not fit in 4 MB');",
      },
      {
        name: "exponential and factorial only survive a tiny n",
        body: "const approaches = [\n  { name: 'bitmask dp', timeComplexity: 'O(2^n)', spaceComplexity: 'O(2^n)' },\n  { name: 'permutations', timeComplexity: 'O(n!)', spaceComplexity: 'O(n)' },\n  { name: 'greedy', timeComplexity: 'O(n log n)', spaceComplexity: 'O(1)' },\n];\nassert.deepEqual(feasibleApproaches(approaches, { n: 10, memoryMB: 64 }), ['bitmask dp', 'permutations', 'greedy']);\nassert.deepEqual(feasibleApproaches(approaches, { n: 40, memoryMB: 64 }), ['greedy'], '2^40 and 40! are both hopeless');",
      },
      {
        name: "order is preserved and nothing may fit",
        body: "const approaches = [\n  { name: 'c', timeComplexity: 'O(n)', spaceComplexity: 'O(n)' },\n  { name: 'a', timeComplexity: 'O(1)', spaceComplexity: 'O(1)' },\n  { name: 'b', timeComplexity: 'O(log n)', spaceComplexity: 'O(1)' },\n];\nassert.deepEqual(feasibleApproaches(approaches, { n: 1000000, memoryMB: 64 }), ['c', 'a', 'b']);\nassert.deepEqual(feasibleApproaches([], { n: 100, memoryMB: 1 }), []);\nconst heavy = [{ name: 'quadratic', timeComplexity: 'O(n^2)', spaceComplexity: 'O(1)' }];\nassert.deepEqual(feasibleApproaches(heavy, { n: 100000, memoryMB: 64 }), [], '1e10 operations is far past the budget');",
      },
      {
        name: "landing exactly on a budget counts as fitting",
        body: "const approaches = [\n  { name: 'exact time', timeComplexity: 'O(n^2)', spaceComplexity: 'O(1)' },\n  { name: 'exact memory', timeComplexity: 'O(n)', spaceComplexity: 'O(n)' },\n];\nassert.deepEqual(feasibleApproaches(approaches, { n: 10000, memoryMB: 0.08 }), ['exact time', 'exact memory'], '1e8 ops and 80000 bytes are both exactly on budget');",
      },
    ],
  },
  {
    id: "ex-two-sum",
    chapter: "dsa-hashing",
    level: "beginner",
    title: "Two Sum",
    brief:
      "<p>You are given an array of integers <code>nums</code> and an integer <code>target</code>. Return the two <b>indices</b> whose values add up to <code>target</code>, as an array <code>[i, j]</code> with <code>i &lt; j</code>.</p><ul><li>Exactly one pair is guaranteed to work</li><li>You may not reuse the same index twice</li><li>Values may be negative, and may repeat</li></ul>",
    starter: "function twoSum(nums, target) {\n  // TODO: return the two indices whose values sum to target\n}\n",
    hints: [
      "The brute force is a nested loop, O(n^2). What would let you answer 'have I already seen target - x?' in constant time?",
      "Walk the array once. For each value, the number you need is target - value.",
      "Check the map for the complement BEFORE inserting the current value, so an element never pairs with itself.",
    ],
    solution:
      "function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n",
    tests: [
      {
        name: "finds the pair at the front",
        body: "assert.deepEqual(twoSum([2,7,11,15], 9), [0,1]);",
      },
      {
        name: "works mid-array",
        body: "assert.deepEqual(twoSum([3,2,4], 6), [1,2]);",
      },
      {
        name: "handles duplicate values",
        body: "assert.deepEqual(twoSum([3,3], 6), [0,1]);",
      },
      {
        name: "handles negatives and a zero target",
        body: "assert.deepEqual(twoSum([-4,1,4,9], 0), [0,2]);",
      },
      {
        name: "uses the far ends of a long array",
        body: "assert.deepEqual(twoSum([1,2,3,4,5,6,7,8], 15), [6,7]);",
      },
    ],
  },
  {
    id: "ex-best-time-to-buy-and-sell-stock",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Best Time to Buy and Sell Stock",
    brief:
      "<p><code>prices[i]</code> is the price of a stock on day <code>i</code>. You may buy on one day and sell on a <em>later</em> day, at most once. Return the largest profit you can make.</p><ul><li>If no transaction is profitable, return <code>0</code></li><li>You cannot sell before you buy</li><li>An empty array yields <code>0</code></li></ul>",
    starter: "function maxProfit(prices) {\n  // TODO: return the best profit from a single buy-then-sell\n}\n",
    hints: [
      "For any day you might sell on, the only thing that matters is the cheapest price seen before it.",
      "Sweep left to right carrying two running values: the minimum price so far, and the best profit so far.",
      "Update the answer with price - minSoFar, then update minSoFar.",
    ],
    solution:
      "function maxProfit(prices) {\n  let min = Infinity;\n  let best = 0;\n  for (const p of prices) {\n    if (p < min) min = p;\n    else if (p - min > best) best = p - min;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "buys the dip and sells the peak",
        body: "assert.equal(maxProfit([7,1,5,3,6,4]), 5);",
      },
      {
        name: "returns 0 when prices only fall",
        body: "assert.equal(maxProfit([7,6,4,3,1]), 0);",
      },
      {
        name: "handles a single day",
        body: "assert.equal(maxProfit([5]), 0);",
      },
      {
        name: "handles an empty array",
        body: "assert.equal(maxProfit([]), 0);",
      },
      {
        name: "finds the best profit late in the array",
        body: "assert.equal(maxProfit([3,2,6,5,0,3]), 4);",
      },
    ],
  },
  {
    id: "ex-maximum-subarray",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Maximum Subarray",
    brief:
      "<p>Given an integer array <code>nums</code>, find the contiguous subarray with the largest sum and return that sum.</p><ul><li>The subarray must contain at least one element</li><li>Values may be negative — an all-negative array still has an answer</li><li>Aim for a single pass in O(n) time and O(1) extra space</li></ul>",
    starter: "function maxSubArray(nums) {\n  // TODO: return the largest sum of any contiguous subarray\n}\n",
    hints: [
      "Ask a smaller question: what is the best subarray that ENDS at index i?",
      "A running sum that has gone negative can only hurt whatever comes next — at that point you are better off starting over.",
      "Keep cur = max(nums[i], cur + nums[i]) and track the maximum cur you have ever seen.",
    ],
    solution:
      "function maxSubArray(nums) {\n  let cur = nums[0];\n  let best = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    if (cur > best) best = cur;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic mixed array",
        body: "assert.equal(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]), 6);",
      },
      {
        name: "single element",
        body: "assert.equal(maxSubArray([1]), 1);",
      },
      {
        name: "all positive means the whole array",
        body: "assert.equal(maxSubArray([5,4,-1,7,8]), 23);",
      },
      {
        name: "all negative picks the least bad element",
        body: "assert.equal(maxSubArray([-4,-2,-7,-3]), -2);",
      },
      {
        name: "does not mistake a negative dip for a reset",
        body: "assert.equal(maxSubArray([8,-1,9]), 16);",
      },
    ],
  },
  {
    id: "ex-merge-sorted-array",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Merge Sorted Array In Place",
    brief:
      "<p><code>nums1</code> has <code>m</code> real values followed by <code>n</code> zeroes used as padding. <code>nums2</code> has <code>n</code> values. Both are sorted ascending. Merge <code>nums2</code> into <code>nums1</code> so that <code>nums1</code> ends up fully sorted.</p><ul><li>Mutate <code>nums1</code> directly — the return value is ignored</li><li>Use O(1) extra space; do not build a new array and copy it back</li><li>Either input may contribute zero elements</li></ul>",
    starter:
      "function merge(nums1, m, nums2, n) {\n  // TODO: merge nums2 into nums1 in place so nums1 ends up sorted\n}\n",
    hints: [
      "Writing from the front would overwrite values in nums1 you have not read yet.",
      "The tail of nums1 is free space. What if you filled it from the back, largest value first?",
      "Run three pointers: i at m-1, j at n-1, and a write pointer at m+n-1. Copy the larger of nums1[i] / nums2[j] and step back.",
    ],
    solution:
      "function merge(nums1, m, nums2, n) {\n  let i = m - 1;\n  let j = n - 1;\n  let w = m + n - 1;\n  while (j >= 0) {\n    if (i >= 0 && nums1[i] > nums2[j]) {\n      nums1[w] = nums1[i];\n      i--;\n    } else {\n      nums1[w] = nums2[j];\n      j--;\n    }\n    w--;\n  }\n  return nums1;\n}\n",
    tests: [
      {
        name: "mutates nums1 into the merged order",
        body: "const a = [1,2,3,0,0,0];\nmerge(a, 3, [2,5,6], 3);\nassert.deepEqual(a, [1,2,2,3,5,6]);",
      },
      {
        name: "handles an empty nums1 region",
        body: "const a = [0];\nmerge(a, 0, [7], 1);\nassert.deepEqual(a, [7]);",
      },
      {
        name: "handles an empty nums2",
        body: "const a = [4,9];\nmerge(a, 2, [], 0);\nassert.deepEqual(a, [4,9]);",
      },
      {
        name: "handles nums2 entirely smaller than nums1",
        body: "const a = [8,9,0,0,0];\nmerge(a, 2, [1,2,3], 3);\nassert.deepEqual(a, [1,2,3,8,9]);",
      },
      {
        name: "handles duplicates across both arrays",
        body: "const a = [2,2,0,0];\nmerge(a, 2, [2,2], 2);\nassert.deepEqual(a, [2,2,2,2]);",
      },
    ],
  },
  {
    id: "ex-remove-duplicates-from-sorted-array",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Remove Duplicates from Sorted Array",
    brief:
      "<p>Given a sorted array <code>nums</code>, remove the repeated values <b>in place</b> so each distinct value appears once. Return <code>k</code>, the number of distinct values.</p><ul><li>The first <code>k</code> slots of <code>nums</code> must hold the distinct values in order</li><li>Whatever sits beyond index <code>k - 1</code> does not matter</li><li>Do not allocate a second array</li></ul>",
    starter:
      "function removeDuplicates(nums) {\n  // TODO: compact the distinct values to the front and return how many there are\n}\n",
    hints: [
      "Because the array is sorted, every duplicate sits directly next to its twin.",
      "Use two indices: a slow write pointer and a fast read pointer that scans ahead.",
      "Only advance the write pointer when nums[read] differs from the last value you wrote.",
    ],
    solution:
      "function removeDuplicates(nums) {\n  if (nums.length === 0) return 0;\n  let k = 1;\n  for (let i = 1; i < nums.length; i++) {\n    if (nums[i] !== nums[k - 1]) {\n      nums[k] = nums[i];\n      k++;\n    }\n  }\n  return k;\n}\n",
    tests: [
      {
        name: "returns the count and compacts the array",
        body: "const a = [1,1,2];\nconst k = removeDuplicates(a);\nassert.equal(k, 2);\nassert.deepEqual(a.slice(0, k), [1,2]);",
      },
      {
        name: "handles long runs of duplicates",
        body: "const a = [0,0,1,1,1,2,2,3,3,4];\nconst k = removeDuplicates(a);\nassert.equal(k, 5);\nassert.deepEqual(a.slice(0, k), [0,1,2,3,4]);",
      },
      {
        name: "leaves an already distinct array alone",
        body: "const a = [1,2,3];\nconst k = removeDuplicates(a);\nassert.equal(k, 3);\nassert.deepEqual(a.slice(0, k), [1,2,3]);",
      },
      {
        name: "collapses an all-same array to one element",
        body: "const a = [5,5,5,5];\nconst k = removeDuplicates(a);\nassert.equal(k, 1);\nassert.deepEqual(a.slice(0, k), [5]);",
      },
      {
        name: "handles an empty array",
        body: "assert.equal(removeDuplicates([]), 0);",
      },
    ],
  },
  {
    id: "ex-rotate-array",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Rotate Array by K",
    brief:
      "<p>Rotate <code>nums</code> to the right by <code>k</code> steps, <b>in place</b>. Element at index <code>i</code> ends up at index <code>(i + k) % n</code>.</p><ul><li>Mutate the array itself; the return value is ignored</li><li><code>k</code> may be larger than the array length</li><li>Target O(1) extra space — a triple reversal does it</li></ul>",
    starter: "function rotate(nums, k) {\n  // TODO: rotate nums right by k steps, in place\n}\n",
    hints: [
      "First reduce k with k % nums.length — rotating by the full length changes nothing.",
      "Reversing the whole array puts the last k elements at the front, but each block is backwards.",
      "Reverse everything, then reverse the first k, then reverse the remaining n - k.",
    ],
    solution:
      "function rotate(nums, k) {\n  const n = nums.length;\n  if (n === 0) return nums;\n  k = ((k % n) + n) % n;\n  const reverse = (lo, hi) => {\n    while (lo < hi) {\n      const t = nums[lo];\n      nums[lo] = nums[hi];\n      nums[hi] = t;\n      lo++;\n      hi--;\n    }\n  };\n  reverse(0, n - 1);\n  reverse(0, k - 1);\n  reverse(k, n - 1);\n  return nums;\n}\n",
    tests: [
      {
        name: "rotates in place by 3",
        body: "const a = [1,2,3,4,5,6,7];\nrotate(a, 3);\nassert.deepEqual(a, [5,6,7,1,2,3,4]);",
      },
      {
        name: "handles k larger than the length",
        body: "const a = [1,2,3];\nrotate(a, 5);\nassert.deepEqual(a, [2,3,1]);",
      },
      {
        name: "k equal to the length leaves it unchanged",
        body: "const a = [-1,-100,3,99];\nrotate(a, 4);\nassert.deepEqual(a, [-1,-100,3,99]);",
      },
      {
        name: "rotating by 1 moves the tail to the front",
        body: "const a = [1,2];\nrotate(a, 1);\nassert.deepEqual(a, [2,1]);",
      },
      {
        name: "single element survives any k",
        body: "const a = [9];\nrotate(a, 7);\nassert.deepEqual(a, [9]);",
      },
    ],
  },
  {
    id: "ex-product-of-array-except-self",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Product of Array Except Self",
    brief:
      "<p>Given <code>nums</code>, return an array <code>out</code> where <code>out[i]</code> is the product of every element <em>except</em> <code>nums[i]</code>.</p><ul><li>You may not use division — zeroes in the input would break it</li><li>Run in O(n) time</li><li>Handle one zero, two zeroes, and negative values correctly</li></ul>",
    starter: "function productExceptSelf(nums) {\n  // TODO: build the products without dividing\n}\n",
    hints: [
      "The answer at index i is (product of everything to its left) times (product of everything to its right).",
      "One forward pass can fill out[i] with the running product of the prefix.",
      "Then walk backwards with a single running suffix product and multiply it into each slot.",
    ],
    solution:
      "function productExceptSelf(nums) {\n  const n = nums.length;\n  const out = new Array(n).fill(1);\n  let prefix = 1;\n  for (let i = 0; i < n; i++) {\n    out[i] = prefix;\n    prefix *= nums[i];\n  }\n  let suffix = 1;\n  for (let i = n - 1; i >= 0; i--) {\n    out[i] *= suffix;\n    suffix *= nums[i];\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "basic case",
        body: "assert.deepEqual(productExceptSelf([1,2,3,4]), [24,12,8,6]);",
      },
      {
        name: "handles a single zero",
        body: "assert.deepEqual(productExceptSelf([-1,1,0,-3,3]), [0,0,9,0,0]);",
      },
      {
        name: "two zeroes make every product zero",
        body: "assert.deepEqual(productExceptSelf([0,0,4]), [0,0,0]);",
      },
      {
        name: "handles negatives",
        body: "assert.deepEqual(productExceptSelf([-1,-2,-3]), [6,3,2]);",
      },
      {
        name: "handles a two element array",
        body: "assert.deepEqual(productExceptSelf([5,7]), [7,5]);",
      },
    ],
  },
  {
    id: "ex-majority-element",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Majority Element",
    brief:
      "<p>An array <code>nums</code> of length <code>n</code> contains one value that appears <b>more than</b> <code>n / 2</code> times. Return that value.</p><ul><li>The majority element always exists</li><li>A hash map works, but O(1) extra space is possible</li><li>Think about what happens if you cancel each majority vote against a different value</li></ul>",
    starter: "function majorityElement(nums) {\n  // TODO: return the value that appears more than n / 2 times\n}\n",
    hints: [
      "Pair up each occurrence of the majority value with a different value and discard both — something is always left over.",
      "Carry a candidate and a counter. When the counter hits zero, adopt the current value as the new candidate.",
      "Increment when the value matches the candidate, decrement otherwise. The final candidate is the answer.",
    ],
    solution:
      "function majorityElement(nums) {\n  let candidate = null;\n  let count = 0;\n  for (const x of nums) {\n    if (count === 0) candidate = x;\n    count += x === candidate ? 1 : -1;\n  }\n  return candidate;\n}\n",
    tests: [
      {
        name: "obvious majority",
        body: "assert.equal(majorityElement([3,2,3]), 3);",
      },
      {
        name: "majority is not the first element",
        body: "assert.equal(majorityElement([2,2,1,1,1,2,2]), 2);",
      },
      {
        name: "single element",
        body: "assert.equal(majorityElement([7]), 7);",
      },
      {
        name: "handles negative values",
        body: "assert.equal(majorityElement([-5,-5,4,-5,1]), -5);",
      },
      {
        name: "candidate gets reset mid-scan",
        body: "assert.equal(majorityElement([1,2,2,3,2,2,2]), 2);",
      },
    ],
  },
  {
    id: "ex-move-zeroes",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Move Zeroes",
    brief:
      "<p>Move every <code>0</code> in <code>nums</code> to the end of the array, <b>in place</b>, while keeping the relative order of the non-zero values.</p><ul><li>Mutate the array; the return value is ignored</li><li>Do not create a copy</li><li>An array of all zeroes, or no zeroes at all, must still come out right</li></ul>",
    starter: "function moveZeroes(nums) {\n  // TODO: push all zeroes to the end in place, preserving order\n}\n",
    hints: [
      "Think of it as compaction: first get every non-zero value packed at the front in order.",
      "A slow write pointer plus a fast read pointer does this in one pass.",
      "After the scan, fill everything from the write pointer to the end with zeroes — or swap as you go.",
    ],
    solution:
      "function moveZeroes(nums) {\n  let w = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] !== 0) {\n      const t = nums[w];\n      nums[w] = nums[i];\n      nums[i] = t;\n      w++;\n    }\n  }\n  return nums;\n}\n",
    tests: [
      {
        name: "mutates the array, zeroes at the end",
        body: "const a = [0,1,0,3,12];\nmoveZeroes(a);\nassert.deepEqual(a, [1,3,12,0,0]);",
      },
      {
        name: "single zero stays a single zero",
        body: "const a = [0];\nmoveZeroes(a);\nassert.deepEqual(a, [0]);",
      },
      {
        name: "array with no zeroes is untouched",
        body: "const a = [4,-2,9];\nmoveZeroes(a);\nassert.deepEqual(a, [4,-2,9]);",
      },
      {
        name: "leading zeroes all shift back",
        body: "const a = [0,0,5,6];\nmoveZeroes(a);\nassert.deepEqual(a, [5,6,0,0]);",
      },
      {
        name: "all zeroes",
        body: "const a = [0,0,0];\nmoveZeroes(a);\nassert.deepEqual(a, [0,0,0]);",
      },
    ],
  },
  {
    id: "ex-contains-duplicate",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Contains Duplicate",
    brief:
      "<p>Return <code>true</code> if any value appears at least twice in <code>nums</code>, and <code>false</code> if every element is distinct.</p><ul><li>Return an actual boolean, not a truthy value</li><li>An empty array has no duplicates</li><li>Aim for O(n) time</li></ul>",
    starter: "function containsDuplicate(nums) {\n  // TODO: return true if any value repeats\n}\n",
    hints: [
      "Sorting first makes duplicates adjacent, but that costs O(n log n).",
      "A Set remembers what you have already seen in O(1) per lookup.",
      "You can also just compare new Set(nums).size against nums.length.",
    ],
    solution:
      "function containsDuplicate(nums) {\n  const seen = new Set();\n  for (const x of nums) {\n    if (seen.has(x)) return true;\n    seen.add(x);\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "detects a repeat",
        body: "assert.equal(containsDuplicate([1,2,3,1]), true);",
      },
      {
        name: "all distinct",
        body: "assert.equal(containsDuplicate([1,2,3,4]), false);",
      },
      {
        name: "empty array",
        body: "assert.equal(containsDuplicate([]), false);",
      },
      {
        name: "single element",
        body: "assert.equal(containsDuplicate([9]), false);",
      },
      {
        name: "duplicate negatives far apart",
        body: "assert.equal(containsDuplicate([-3,5,7,8,-3]), true);",
      },
    ],
  },
  {
    id: "ex-missing-number",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Find the Missing Number",
    brief:
      "<p><code>nums</code> holds <code>n</code> distinct numbers taken from the range <code>0..n</code>. Exactly one number from that range is absent — return it.</p><ul><li>The array is not necessarily sorted</li><li>The missing value can be <code>0</code> or <code>n</code> itself</li><li>O(n) time and O(1) extra space is achievable</li></ul>",
    starter: "function missingNumber(nums) {\n  // TODO: return the one value from 0..n that is not present\n}\n",
    hints: [
      "You know exactly what the sum of 0..n should be: n * (n + 1) / 2.",
      "Subtract the actual sum of the array from that expected total.",
      "XOR works too: XOR every index 0..n together with every value — the pairs cancel out.",
    ],
    solution:
      "function missingNumber(nums) {\n  const n = nums.length;\n  let total = (n * (n + 1)) / 2;\n  for (const x of nums) total -= x;\n  return total;\n}\n",
    tests: [
      {
        name: "missing from the middle",
        body: "assert.equal(missingNumber([3,0,1]), 2);",
      },
      {
        name: "missing the largest value",
        body: "assert.equal(missingNumber([0,1,2]), 3);",
      },
      {
        name: "missing zero",
        body: "assert.equal(missingNumber([1,2,3]), 0);",
      },
      {
        name: "single element array",
        body: "assert.equal(missingNumber([0]), 1);",
      },
      {
        name: "unsorted longer array",
        body: "assert.equal(missingNumber([9,6,4,2,3,5,7,0,1]), 8);",
      },
    ],
  },
  {
    id: "ex-find-disappeared-numbers",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Find All Numbers Disappeared in an Array",
    brief:
      "<p><code>nums</code> has length <code>n</code> and every value lies in <code>1..n</code>, but some values repeat and others are missing. Return every value in <code>1..n</code> that does not appear, in ascending order.</p><ul><li>Return an empty array when nothing is missing</li><li>Duplicates in the input are expected</li><li>Bonus: solve it without a Set, using the array itself as the bookkeeping</li></ul>",
    starter:
      "function findDisappearedNumbers(nums) {\n  // TODO: return every value in 1..n that is absent from nums\n}\n",
    hints: [
      "Value v naturally belongs at index v - 1. That mapping is the whole trick.",
      "For each value, mark the slot it points at — negating nums[v - 1] is a marker you can undo.",
      "Any index that is still positive at the end was never pointed at, so index + 1 is missing.",
    ],
    solution:
      "function findDisappearedNumbers(nums) {\n  for (let i = 0; i < nums.length; i++) {\n    const idx = Math.abs(nums[i]) - 1;\n    if (nums[idx] > 0) nums[idx] = -nums[idx];\n  }\n  const out = [];\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] > 0) out.push(i + 1);\n    else nums[i] = -nums[i];\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "finds both missing values",
        body: "assert.deepEqual(findDisappearedNumbers([4,3,2,7,8,2,3,1]), [5,6]);",
      },
      {
        name: "small case",
        body: "assert.deepEqual(findDisappearedNumbers([1,1]), [2]);",
      },
      {
        name: "nothing missing",
        body: "assert.deepEqual(findDisappearedNumbers([1,2,3]), []);",
      },
      {
        name: "single element that is missing its partner",
        body: "assert.deepEqual(findDisappearedNumbers([2,2]), [1]);",
      },
      {
        name: "all the same value",
        body: "assert.deepEqual(findDisappearedNumbers([3,3,3]), [1,2]);",
      },
    ],
  },
  {
    id: "ex-sort-colors",
    chapter: "dsa-two-pointers",
    level: "intermediate",
    title: "Sort Colors",
    brief:
      "<p><code>nums</code> contains only the values <code>0</code>, <code>1</code> and <code>2</code>. Sort it <b>in place</b> so all the 0s come first, then the 1s, then the 2s.</p><ul><li>Mutate the array; the return value is ignored</li><li>Do it in a single pass with O(1) extra space</li><li>Counting each value and rewriting is two passes — aim better</li></ul>",
    starter: "function sortColors(nums) {\n  // TODO: sort the 0s, 1s and 2s in place in one pass\n}\n",
    hints: [
      "Maintain three regions: settled 0s at the front, settled 2s at the back, and unexplored space in between.",
      "Use pointers low, mid and high. mid is the element you are currently deciding about.",
      "Swapping a 2 into place brings back an unexamined value — so do NOT advance mid in that case.",
    ],
    solution:
      "function sortColors(nums) {\n  let low = 0;\n  let mid = 0;\n  let high = nums.length - 1;\n  const swap = (i, j) => {\n    const t = nums[i];\n    nums[i] = nums[j];\n    nums[j] = t;\n  };\n  while (mid <= high) {\n    if (nums[mid] === 0) {\n      swap(low, mid);\n      low++;\n      mid++;\n    } else if (nums[mid] === 2) {\n      swap(mid, high);\n      high--;\n    } else {\n      mid++;\n    }\n  }\n  return nums;\n}\n",
    tests: [
      {
        name: "mutates a mixed array into sorted order",
        body: "const a = [2,0,2,1,1,0];\nsortColors(a);\nassert.deepEqual(a, [0,0,1,1,2,2]);",
      },
      {
        name: "handles a reversed array",
        body: "const a = [2,1,0];\nsortColors(a);\nassert.deepEqual(a, [0,1,2]);",
      },
      {
        name: "already sorted stays sorted",
        body: "const a = [0,0,1,2,2];\nsortColors(a);\nassert.deepEqual(a, [0,0,1,2,2]);",
      },
      {
        name: "handles a missing colour",
        body: "const a = [2,0,0,2];\nsortColors(a);\nassert.deepEqual(a, [0,0,2,2]);",
      },
      {
        name: "single element",
        body: "const a = [1];\nsortColors(a);\nassert.deepEqual(a, [1]);",
      },
    ],
  },
  {
    id: "ex-next-permutation",
    chapter: "dsa-two-pointers",
    level: "advanced",
    title: "Next Permutation",
    brief:
      "<p>Rearrange <code>nums</code> <b>in place</b> into the next lexicographically larger permutation of the same values. If the array is already the largest possible arrangement, rearrange it into the smallest (fully ascending) one.</p><ul><li>Mutate the array; the return value is ignored</li><li>Use O(1) extra space — no generating all permutations</li><li>Duplicate values must be handled correctly</li></ul>",
    starter:
      "function nextPermutation(nums) {\n  // TODO: rearrange nums in place into the next larger permutation\n}\n",
    hints: [
      "Scan from the right: a suffix that is non-increasing is already at its maximum arrangement.",
      "Find the rightmost index i where nums[i] < nums[i + 1] — that is the only digit worth raising.",
      "Swap nums[i] with the smallest value to its right that still exceeds it, then reverse the suffix so it is as small as possible.",
    ],
    solution:
      "function nextPermutation(nums) {\n  const n = nums.length;\n  const swap = (i, j) => {\n    const t = nums[i];\n    nums[i] = nums[j];\n    nums[j] = t;\n  };\n  const reverse = (lo, hi) => {\n    while (lo < hi) swap(lo++, hi--);\n  };\n  let i = n - 2;\n  while (i >= 0 && nums[i] >= nums[i + 1]) i--;\n  if (i >= 0) {\n    let j = n - 1;\n    while (nums[j] <= nums[i]) j--;\n    swap(i, j);\n  }\n  reverse(i + 1, n - 1);\n  return nums;\n}\n",
    tests: [
      {
        name: "steps to the next permutation",
        body: "const a = [1,2,3];\nnextPermutation(a);\nassert.deepEqual(a, [1,3,2]);",
      },
      {
        name: "wraps the largest arrangement back to the smallest",
        body: "const a = [3,2,1];\nnextPermutation(a);\nassert.deepEqual(a, [1,2,3]);",
      },
      {
        name: "handles a duplicate pivot value",
        body: "const a = [1,1,5];\nnextPermutation(a);\nassert.deepEqual(a, [1,5,1]);",
      },
      {
        name: "reverses the suffix, not just swaps",
        body: "const a = [1,3,5,4,2];\nnextPermutation(a);\nassert.deepEqual(a, [1,4,2,3,5]);",
      },
      {
        name: "single element is unchanged",
        body: "const a = [7];\nnextPermutation(a);\nassert.deepEqual(a, [7]);",
      },
    ],
  },
  {
    id: "ex-trapping-rain-water",
    chapter: "dsa-two-pointers",
    level: "advanced",
    title: "Trapping Rain Water",
    brief:
      "<p><code>height[i]</code> is the height of a bar of width 1. After it rains, water settles in the dips between bars. Return the total units of water trapped.</p><ul><li>Water above bar <code>i</code> is <code>min(tallest to its left, tallest to its right) - height[i]</code></li><li>Never negative — a bar taller than both walls traps nothing</li><li>Two pointers get this in O(n) time and O(1) space</li></ul>",
    starter: "function trap(height) {\n  // TODO: return the total units of trapped water\n}\n",
    hints: [
      "Work out the water column above each bar independently, then add them up.",
      "Precomputing leftMax[] and rightMax[] arrays solves it in O(n) space — get that working first.",
      "To drop to O(1): walk two pointers inward, and always process the side whose running max is smaller — that side's total is already decided.",
    ],
    solution:
      "function trap(height) {\n  let lo = 0;\n  let hi = height.length - 1;\n  let leftMax = 0;\n  let rightMax = 0;\n  let total = 0;\n  while (lo < hi) {\n    if (height[lo] < height[hi]) {\n      leftMax = Math.max(leftMax, height[lo]);\n      total += leftMax - height[lo];\n      lo++;\n    } else {\n      rightMax = Math.max(rightMax, height[hi]);\n      total += rightMax - height[hi];\n      hi--;\n    }\n  }\n  return total;\n}\n",
    tests: [
      {
        name: "classic skyline",
        body: "assert.equal(trap([0,1,0,2,1,0,1,3,2,1,2,1]), 6);",
      },
      {
        name: "deep single basin",
        body: "assert.equal(trap([4,2,0,3,2,5]), 9);",
      },
      {
        name: "a monotonic slope traps nothing",
        body: "assert.equal(trap([1,2,3,4]), 0);",
      },
      {
        name: "too few bars to hold water",
        body: "assert.equal(trap([2,5]), 0);",
      },
      {
        name: "empty input",
        body: "assert.equal(trap([]), 0);",
      },
    ],
  },
  {
    id: "ex-container-with-most-water",
    chapter: "dsa-two-pointers",
    level: "intermediate",
    title: "Container With Most Water",
    brief:
      "<p><code>height[i]</code> is the height of a vertical line at position <code>i</code>. Pick two lines so that the container they form with the x-axis holds the most water, and return that area.</p><ul><li>Area is <code>(j - i) * min(height[i], height[j])</code></li><li>The container cannot be tilted</li><li>Beat the O(n^2) double loop</li></ul>",
    starter: "function maxArea(height) {\n  // TODO: return the largest area between any two lines\n}\n",
    hints: [
      "Start with the widest possible container: one pointer at each end.",
      "Moving either pointer inward always loses width, so the only way to win is to gain height.",
      "Move the pointer at the SHORTER line — keeping it can never produce a bigger area.",
    ],
    solution:
      "function maxArea(height) {\n  let lo = 0;\n  let hi = height.length - 1;\n  let best = 0;\n  while (lo < hi) {\n    const h = Math.min(height[lo], height[hi]);\n    const area = h * (hi - lo);\n    if (area > best) best = area;\n    if (height[lo] < height[hi]) lo++;\n    else hi--;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic case",
        body: "assert.equal(maxArea([1,8,6,2,5,4,8,3,7]), 49);",
      },
      {
        name: "two lines only",
        body: "assert.equal(maxArea([1,1]), 1);",
      },
      {
        name: "widest pair wins when heights are equal",
        body: "assert.equal(maxArea([4,4,4,4]), 12);",
      },
      {
        name: "tall lines at the extremes",
        body: "assert.equal(maxArea([9,1,1,1,9]), 36);",
      },
      {
        name: "a single line holds nothing",
        body: "assert.equal(maxArea([5]), 0);",
      },
    ],
  },
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
  {
    id: "ex-gray-code",
    chapter: "dsa-bit-manipulation",
    level: "intermediate",
    title: "Gray Code",
    brief:
      "<p>Given <code>n</code>, return an <em>n</em>-bit gray code sequence: an array of <code>2**n</code> integers where</p><ul><li>the first entry is <code>0</code></li><li>every value in <code>[0, 2**n)</code> appears exactly once</li><li>consecutive entries differ in exactly one bit, and so do the last and first entries (the sequence wraps around)</li></ul><p><b>Any</b> sequence meeting those rules is accepted — there is more than one valid answer. <code>n = 0</code> returns <code>[0]</code>.</p>",
    starter: "function grayCode(n) {\n  // TODO: produce 2**n values where neighbours differ by a single bit\n}\n",
    hints: [
      "Try building it up: given a valid sequence for n-1 bits, how can you extend it to n bits without breaking the one-bit rule at the seam?",
      "Mirror it. Take the previous list, then append it again in reverse with the new high bit set. Reflecting means the two halves meet at a pair that differs only in that new bit.",
      "There is also a one-liner: the i-th gray code is `i ^ (i >> 1)`. Loop i from 0 to 2**n - 1 and map each one.",
    ],
    solution:
      "function grayCode(n) {\n  const out = [];\n  const total = 1 << n;\n  for (let i = 0; i < total; i++) {\n    out.push(i ^ (i >> 1));\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "n = 0 is a single zero",
        body: "assert.deepEqual(grayCode(0), [0]);",
      },
      {
        name: "n = 1 covers both one-bit values",
        body: "const out = grayCode(1);\nassert.equal(out.length, 2);\nassert.equal(out[0], 0);\nassert.equal(out[1], 1);",
      },
      {
        name: "n = 3 has the right shape",
        body: "const out = grayCode(3);\nassert.equal(out.length, 8);\nassert.equal(out[0], 0);\nassert.equal(new Set(out).size, 8);\nfor (const v of out) assert.ok(v >= 0 && v < 8, 'values must stay inside [0, 2**n)');",
      },
      {
        name: "n = 4 — neighbours differ by exactly one bit, wrapping around",
        body: "const out = grayCode(4);\nassert.equal(out.length, 16);\nassert.equal(out[0], 0);\nassert.equal(new Set(out).size, 16);\nfor (let i = 0; i < out.length; i++) {\n  const d = out[i] ^ out[(i + 1) % out.length];\n  assert.ok(d !== 0 && (d & (d - 1)) === 0, 'entries ' + i + ' and ' + ((i + 1) % out.length) + ' must differ in exactly one bit');\n}",
      },
      {
        name: "n = 8 still satisfies every rule",
        body: "const out = grayCode(8);\nassert.equal(out.length, 256);\nassert.equal(out[0], 0);\nassert.equal(new Set(out).size, 256);\nfor (let i = 0; i < out.length; i++) {\n  const d = out[i] ^ out[(i + 1) % out.length];\n  assert.ok(d !== 0 && (d & (d - 1)) === 0, 'one-bit rule broken at index ' + i);\n}",
      },
    ],
  },
  {
    id: "ex-maximum-xor-of-two-numbers",
    chapter: "dsa-tries",
    level: "advanced",
    title: "Maximum XOR of Two Numbers in an Array",
    brief:
      "<p>Given an array <code>nums</code>, return the largest value of <code>nums[i] ^ nums[j]</code> over all pairs of indices (i and j may be equal).</p><ul><li>Every value satisfies <code>0 &lt;= nums[i] &lt; 2**31</code>, so results always stay non-negative</li><li>The array can hold hundreds of thousands of values, so the <code>O(n^2)</code> double loop is out — aim for <b>O(n · 31)</b></li><li>A one-element array answers 0, since XOR-ing a value with itself gives 0</li></ul>",
    starter: "function findMaximumXOR(nums) {\n  // TODO: decide the answer one bit at a time, highest bit first\n}\n",
    hints: [
      "Build the answer greedily from bit 30 downward: at each step ask 'can any pair produce a 1 here, on top of the bits I already locked in?'",
      "Keep a growing prefix mask. Put every `num & mask` into a Set, then for the candidate answer `c` check whether some prefix `p` has `c ^ p` also in the Set — that is exactly a pair whose XOR starts with `c`.",
      "The Set-of-prefixes trick is the flat version of a binary trie: inserting each number bit by bit and, for every number, walking the trie preferring the opposite bit at each level gives the same O(n · 31) result.",
    ],
    solution:
      "function findMaximumXOR(nums) {\n  let max = 0;\n  let mask = 0;\n  for (let bit = 30; bit >= 0; bit--) {\n    mask |= 1 << bit;\n    const prefixes = new Set();\n    for (const n of nums) prefixes.add(n & mask);\n    const candidate = max | (1 << bit);\n    for (const p of prefixes) {\n      if (prefixes.has(candidate ^ p)) {\n        max = candidate;\n        break;\n      }\n    }\n  }\n  return max;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.equal(findMaximumXOR([3, 10, 5, 25, 2, 8]), 28);",
      },
      {
        name: "single element",
        body: "assert.equal(findMaximumXOR([0]), 0);",
      },
      {
        name: "small three-element array",
        body: "assert.equal(findMaximumXOR([8, 10, 2]), 10);",
      },
      {
        name: "longer array with repeats",
        body: "assert.equal(findMaximumXOR([14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]), 127);",
      },
      {
        name: "large input must not use the O(n^2) loop",
        body: "const nums = [];\nfor (let i = 0; i < 60000; i++) nums.push((i * 2654435761) % 2147483647);\nnums.push(0);\nnums.push(2147483647);\nassert.equal(findMaximumXOR(nums), 2147483647);",
      },
    ],
  },
  {
    id: "ex-utf8-validation",
    chapter: "dsa-bit-manipulation",
    level: "advanced",
    title: "UTF-8 Validation",
    brief:
      "<p>Given an array <code>data</code> of integers where <b>only the lowest 8 bits of each entry are meaningful</b>, decide whether the bytes form a valid UTF-8 encoding.</p><p>A UTF-8 character is 1 to 4 bytes and its leading byte announces the length:</p><ul><li>1 byte: <code>0xxxxxxx</code></li><li>2 bytes: <code>110xxxxx</code></li><li>3 bytes: <code>1110xxxx</code></li><li>4 bytes: <code>11110xxx</code></li><li>every continuation byte must look like <code>10xxxxxx</code></li></ul><p>Any other leading pattern (such as <code>10xxxxxx</code> in leading position, or <code>111110xx</code>) is invalid, as is a character whose continuation bytes run off the end of the array. An empty array is valid.</p>",
    starter:
      "function validUtf8(data) {\n  // TODO: read a leading byte, then verify exactly that many continuation bytes\n}\n",
    hints: [
      "Mask each entry with `& 0xff` first — the problem says the upper bits are noise and must be ignored.",
      "Count how many 1s the byte starts with. `byte >> 7`, `byte >> 5`, `byte >> 4`, `byte >> 3` compared against 0, 0b110, 0b1110 and 0b11110 tell you the character length; anything else is invalid immediately.",
      "After a leading byte of length k, the next k-1 bytes must each satisfy `(b >> 6) === 0b10`. Bail out if the array ends early, and remember a length of 1 needs no continuations at all.",
    ],
    solution:
      "function validUtf8(data) {\n  let i = 0;\n  while (i < data.length) {\n    const byte = data[i] & 0xff;\n    let length;\n    if (byte >> 7 === 0) length = 1;\n    else if (byte >> 5 === 0b110) length = 2;\n    else if (byte >> 4 === 0b1110) length = 3;\n    else if (byte >> 3 === 0b11110) length = 4;\n    else return false;\n    if (i + length > data.length) return false;\n    for (let j = 1; j < length; j++) {\n      if ((data[i + j] & 0xff) >> 6 !== 0b10) return false;\n    }\n    i += length;\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "valid two-byte character",
        body: "assert.equal(validUtf8([197, 130, 1]), true);",
      },
      {
        name: "broken continuation byte",
        body: "assert.equal(validUtf8([235, 140, 4]), false);",
      },
      {
        name: "valid four-byte and three-byte characters",
        body: "assert.equal(validUtf8([240, 162, 138, 147]), true);\nassert.equal(validUtf8([228, 184, 173]), true);",
      },
      {
        name: "continuation byte in leading position, and illegal prefixes",
        body: "assert.equal(validUtf8([145]), false);\nassert.equal(validUtf8([255]), false);\nassert.equal(validUtf8([248, 130, 130, 130, 130]), false);",
      },
      {
        name: "empty array, plain ASCII, and truncated characters",
        body: "assert.equal(validUtf8([]), true);\nassert.equal(validUtf8([0, 65, 127]), true);\nassert.equal(validUtf8([237]), false);\nassert.equal(validUtf8([240, 162, 138]), false);",
      },
    ],
  },
  {
    id: "ex-count-triplets-equal-xor",
    chapter: "dsa-bit-manipulation",
    level: "advanced",
    title: "Count Triplets That Can Form Two Arrays of Equal XOR",
    brief:
      "<p>Given an array <code>arr</code>, count the triplets of indices <code>(i, j, k)</code> with <code>0 &lt;= i &lt; j &lt;= k &lt; arr.length</code> such that</p><ul><li><code>a</code> = XOR of <code>arr[i] .. arr[j - 1]</code></li><li><code>b</code> = XOR of <code>arr[j] .. arr[k]</code></li><li>and <code>a === b</code></li></ul><p>Return how many such triplets exist. The triple loop is <code>O(n^3)</code> — do better than that.</p>",
    starter:
      "function countTriplets(arr) {\n  // TODO: prefix XOR turns the condition into something j no longer appears in\n}\n",
    hints: [
      "Define `pre[t]` as the XOR of the first t elements. Then a = pre[j] ^ pre[i] and b = pre[k+1] ^ pre[j].",
      "Set a === b and simplify: the pre[j] terms cancel, leaving `pre[i] === pre[k+1]`. The condition does not mention j at all.",
      "So for every pair i < k with pre[i] === pre[k+1], every j in (i, k] works — that is `k - i` triplets. Sum that over all valid pairs.",
    ],
    solution:
      "function countTriplets(arr) {\n  const n = arr.length;\n  const pre = new Array(n + 1).fill(0);\n  for (let i = 0; i < n; i++) pre[i + 1] = pre[i] ^ arr[i];\n  let count = 0;\n  for (let i = 0; i < n; i++) {\n    for (let k = i + 1; k < n; k++) {\n      if (pre[i] === pre[k + 1]) count += k - i;\n    }\n  }\n  return count;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.equal(countTriplets([2, 3, 1, 6, 7]), 4);",
      },
      {
        name: "all equal values",
        body: "assert.equal(countTriplets([1, 1, 1, 1, 1]), 10);",
      },
      {
        name: "no triplet exists",
        body: "assert.equal(countTriplets([2, 3]), 0);\nassert.equal(countTriplets([5]), 0);\nassert.equal(countTriplets([]), 0);",
      },
      {
        name: "sparse matches",
        body: "assert.equal(countTriplets([1, 3, 5, 7, 9]), 3);",
      },
      {
        name: "longer mixed array",
        body: "assert.equal(countTriplets([7, 11, 12, 9, 5, 2, 7, 17, 22]), 8);",
      },
    ],
  },
  {
    id: "ex-min-flips-a-or-b-equals-c",
    chapter: "dsa-bit-manipulation",
    level: "intermediate",
    title: "Minimum Flips to Make a OR b Equal to c",
    brief:
      "<p>Given three non-negative integers <code>a</code>, <code>b</code> and <code>c</code>, return the minimum number of single-bit flips (in <code>a</code> and/or <code>b</code>) needed so that <code>(a | b) === c</code>.</p><ul><li>A flip changes one bit of <code>a</code> or one bit of <code>b</code> from 0 to 1 or from 1 to 0; <code>c</code> is never modified</li><li>All three fit in a signed 32-bit integer, so 32 bit positions are enough</li><li>If <code>(a | b)</code> already equals <code>c</code> the answer is 0</li></ul>",
    starter: "function minFlips(a, b, c) {\n  // TODO: each bit position is an independent little decision\n}\n",
    hints: [
      "Bit positions do not interact — walk all 32 of them and add up the cost of each one independently.",
      "When c's bit is 0, every 1 among a's and b's bits at that position must be cleared, so the cost is `aBit + bBit` (0, 1 or 2).",
      "When c's bit is 1, you need at least one 1 — the cost is 1 if both a and b are 0 there, otherwise 0.",
    ],
    solution:
      "function minFlips(a, b, c) {\n  let flips = 0;\n  for (let i = 0; i < 32; i++) {\n    const x = (a >>> i) & 1;\n    const y = (b >>> i) & 1;\n    const z = (c >>> i) & 1;\n    if (z === 0) flips += x + y;\n    else if (x === 0 && y === 0) flips += 1;\n  }\n  return flips;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.equal(minFlips(2, 6, 5), 3);",
      },
      {
        name: "one flip is enough",
        body: "assert.equal(minFlips(4, 2, 7), 1);",
      },
      {
        name: "already satisfied",
        body: "assert.equal(minFlips(1, 2, 3), 0);\nassert.equal(minFlips(0, 0, 0), 0);",
      },
      {
        name: "mixed clears and sets",
        body: "assert.equal(minFlips(8, 3, 5), 3);",
      },
      {
        name: "high bit positions still counted",
        body: "assert.equal(minFlips(1073741824, 0, 0), 1);\nassert.equal(minFlips(0, 0, 1073741824), 1);\nassert.equal(minFlips(1073741824, 1073741824, 0), 2);",
      },
    ],
  },
  {
    id: "ex-xor-sum-of-pairwise-and",
    chapter: "dsa-bit-manipulation",
    level: "advanced",
    title: "Find XOR Sum of All Pairs Bitwise AND",
    brief:
      "<p>Given two arrays <code>arr1</code> and <code>arr2</code> of non-negative integers, consider every pair <code>(i, j)</code> and the value <code>arr1[i] &amp; arr2[j]</code>. Return the XOR of all <code>arr1.length * arr2.length</code> of those values.</p><ul><li>Both arrays can hold up to 100000 values, so materialising every pair is far too slow — the answer must come out in <b>O(n + m)</b></li><li>Neither array is empty</li></ul>",
    starter: "function getXORSum(arr1, arr2) {\n  // TODO: do not build the pairs — find the algebraic shortcut\n}\n",
    hints: [
      "Expand a tiny case by hand, say arr1 = [x, y] and arr2 = [p, q], and write the XOR of all four ANDs out in full.",
      "AND distributes over XOR: `(x & p) ^ (x & q)` is `x & (p ^ q)`. Group the terms by the arr1 element.",
      "Applying that in both directions collapses everything to `(XOR of arr1) & (XOR of arr2)` — two independent linear passes.",
    ],
    solution:
      "function getXORSum(arr1, arr2) {\n  let x = 0;\n  let y = 0;\n  for (const v of arr1) x ^= v;\n  for (const v of arr2) y ^= v;\n  return x & y;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.equal(getXORSum([1, 2, 3], [6, 5]), 0);",
      },
      {
        name: "single element each",
        body: "assert.equal(getXORSum([12], [4]), 4);",
      },
      {
        name: "three by three",
        body: "assert.equal(getXORSum([2, 8, 4], [3, 7, 1]), 4);",
      },
      {
        name: "zeros wipe the result out",
        body: "assert.equal(getXORSum([0], [1, 2, 3]), 0);\nassert.equal(getXORSum([5, 5], [7]), 0);",
      },
      {
        name: "large inputs must not enumerate the pairs",
        body: "const a = [];\nconst b = [];\nfor (let i = 0; i < 100000; i++) a.push(i & 1023);\nfor (let i = 0; i < 100000; i++) b.push((i * 3) & 1023);\nlet x = 0;\nlet y = 0;\nfor (const v of a) x ^= v;\nfor (const v of b) y ^= v;\nassert.equal(getXORSum(a, b), x & y);",
      },
    ],
  },
  {
    id: "ex-decode-xored-array",
    chapter: "dsa-bit-manipulation",
    level: "beginner",
    title: "Decode XORed Array",
    brief:
      "<p>An array <code>arr</code> of <code>n</code> non-negative integers was encoded into an array <code>encoded</code> of length <code>n - 1</code>, where <code>encoded[i] === arr[i] ^ arr[i + 1]</code>. Given <code>encoded</code> and the first element <code>first</code>, rebuild and return <code>arr</code>.</p><ul><li>The answer is always unique</li><li><code>encoded</code> may be empty, in which case <code>arr</code> is just <code>[first]</code></li></ul>",
    starter: "function decode(encoded, first) {\n  // TODO: walk forward, recovering one element at a time\n}\n",
    hints: [
      "XOR is its own inverse: if `e === x ^ y` then `y === e ^ x`. That is the whole problem.",
      "You already know arr[0] — it is `first`. Use encoded[0] to get arr[1], then encoded[1] to get arr[2], and so on.",
      "Push `first` into the result, then for each `e` in encoded push `result[result.length - 1] ^ e`.",
    ],
    solution:
      "function decode(encoded, first) {\n  const arr = [first];\n  for (const e of encoded) {\n    arr.push(arr[arr.length - 1] ^ e);\n  }\n  return arr;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.deepEqual(decode([1, 2, 3], 1), [1, 0, 2, 1]);",
      },
      {
        name: "longer encoding",
        body: "assert.deepEqual(decode([6, 2, 7, 3], 4), [4, 2, 0, 7, 4]);",
      },
      {
        name: "empty encoding",
        body: "assert.deepEqual(decode([], 5), [5]);",
      },
      {
        name: "a zero in the encoding repeats the value",
        body: "assert.deepEqual(decode([0], 9), [9, 9]);",
      },
      {
        name: "round-trips against a freshly built encoding",
        body: "const original = [11, 4, 27, 3, 0, 64, 1000];\nconst encoded = [];\nfor (let i = 0; i + 1 < original.length; i++) encoded.push(original[i] ^ original[i + 1]);\nassert.deepEqual(decode(encoded, original[0]), original);",
      },
    ],
  },
  {
    id: "ex-xor-queries-of-a-subarray",
    chapter: "dsa-bit-manipulation",
    level: "intermediate",
    title: "XOR Queries of a Subarray",
    brief:
      "<p>Given an array <code>arr</code> and a list of <code>queries</code>, where each query is a pair <code>[left, right]</code>, return an array whose i-th entry is the XOR of <code>arr[left] ^ arr[left + 1] ^ ... ^ arr[right]</code> for that query.</p><ul><li>Both bounds are <b>inclusive</b>, and <code>left &lt;= right</code></li><li>There can be tens of thousands of queries, so re-scanning the range each time is too slow — answer each query in <b>O(1)</b> after linear preprocessing</li><li><code>queries</code> may be empty, in which case return an empty array</li></ul>",
    starter:
      "function xorQueries(arr, queries) {\n  // TODO: precompute something once so each query is a single operation\n}\n",
    hints: [
      "This is the prefix-sum idea with XOR in place of addition — and it works because XOR, like addition, is invertible.",
      "Build `pre` where `pre[t]` is the XOR of the first t elements: `pre[0] = 0` and `pre[t + 1] = pre[t] ^ arr[t]`.",
      "Then the XOR over [left, right] is `pre[right + 1] ^ pre[left]` — the shared front half cancels itself out.",
    ],
    solution:
      "function xorQueries(arr, queries) {\n  const pre = new Array(arr.length + 1).fill(0);\n  for (let i = 0; i < arr.length; i++) pre[i + 1] = pre[i] ^ arr[i];\n  return queries.map((q) => pre[q[1] + 1] ^ pre[q[0]]);\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.deepEqual(\n  xorQueries([1, 3, 4, 8], [[0, 1], [1, 2], [0, 3], [3, 3]]),\n  [2, 7, 14, 8]\n);",
      },
      {
        name: "second example",
        body: "assert.deepEqual(\n  xorQueries([4, 8, 2, 10], [[2, 3], [1, 3], [0, 0], [0, 3]]),\n  [8, 0, 4, 4]\n);",
      },
      {
        name: "single element array and empty query list",
        body: "assert.deepEqual(xorQueries([7], [[0, 0]]), [7]);\nassert.deepEqual(xorQueries([7], []), []);",
      },
      {
        name: "repeated and overlapping ranges",
        body: "assert.deepEqual(\n  xorQueries([5, 5, 5], [[0, 1], [0, 2], [1, 2], [2, 2]]),\n  [0, 5, 0, 5]\n);",
      },
      {
        name: "many queries against a linear reference",
        body: "const arr = [];\nfor (let i = 0; i < 2000; i++) arr.push((i * 37) & 1023);\nconst queries = [];\nfor (let i = 0; i < 500; i++) queries.push([i, 1999 - i]);\nconst out = xorQueries(arr, queries);\nassert.equal(out.length, 500);\nfor (let q = 0; q < queries.length; q++) {\n  let expect = 0;\n  for (let i = queries[q][0]; i <= queries[q][1]; i++) expect ^= arr[i];\n  assert.equal(out[q], expect);\n}",
      },
    ],
  },
  {
    id: "ex-number-of-islands",
    chapter: "dsa-graphs-representation-traversal",
    level: "beginner",
    title: "Number of Islands",
    brief:
      "<p>You are given a rectangular <code>grid</code> whose cells are the strings <code>'1'</code> (land) and <code>'0'</code> (water). An <b>island</b> is a group of land cells joined horizontally or vertically. Return how many islands the grid contains.</p><ul><li>Diagonal neighbours do <b>not</b> connect two cells</li><li>Everything outside the grid is water</li><li>An empty grid has <code>0</code> islands</li></ul>",
    starter: "function numIslands(grid) {\n  // TODO: count the groups of connected '1' cells\n}\n",
    hints: [
      "Scan every cell. The first time you step onto a piece of land you have not visited, you have found a brand new island — increment the counter once, right there.",
      "Then you must consume the WHOLE island before continuing, or you would count each of its cells as a separate island. A flood fill (DFS or BFS) from that cell does exactly that.",
      "The simplest way to remember what you have already consumed is to overwrite each visited land cell with '0' as you go, so it can never be picked up again.",
    ],
    solution:
      "function numIslands(grid) {\n  if (!grid || grid.length === 0) return 0;\n  const rows = grid.length;\n  const cols = grid[0].length;\n  const sink = (r, c) => {\n    if (r < 0 || c < 0 || r >= rows || c >= cols) return;\n    if (grid[r][c] !== '1') return;\n    grid[r][c] = '0';\n    sink(r + 1, c);\n    sink(r - 1, c);\n    sink(r, c + 1);\n    sink(r, c - 1);\n  };\n  let count = 0;\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === '1') {\n        count++;\n        sink(r, c);\n      }\n    }\n  }\n  return count;\n}\n",
    tests: [
      {
        name: "one big island",
        body: "const grid = [\n  ['1','1','1','1','0'],\n  ['1','1','0','1','0'],\n  ['1','1','0','0','0'],\n  ['0','0','0','0','0'],\n];\nassert.equal(numIslands(grid), 1);",
      },
      {
        name: "three separate islands",
        body: "const grid = [\n  ['1','1','0','0','0'],\n  ['1','1','0','0','0'],\n  ['0','0','1','0','0'],\n  ['0','0','0','1','1'],\n];\nassert.equal(numIslands(grid), 3);",
      },
      {
        name: "diagonals do not connect",
        body: "const grid = [['1','0'], ['0','1']];\nassert.equal(numIslands(grid), 2);",
      },
      {
        name: "all water",
        body: "const grid = [['0','0'], ['0','0']];\nassert.equal(numIslands(grid), 0);",
      },
      {
        name: "single land cell",
        body: "assert.equal(numIslands([['1']]), 1);",
      },
    ],
  },
  {
    id: "ex-max-area-of-island",
    chapter: "dsa-graphs-representation-traversal",
    level: "intermediate",
    title: "Max Area of Island",
    brief:
      "<p>Given a <code>grid</code> of <code>0</code>s (water) and <code>1</code>s (land), return the number of cells in the <b>largest</b> island.</p><ul><li>Cells connect horizontally and vertically only</li><li>The area of an island is its cell count</li><li>If there is no land at all, return <code>0</code></li></ul>",
    starter: "function maxAreaOfIsland(grid) {\n  // TODO: return the size of the largest connected group of 1s\n}\n",
    hints: [
      "This is island counting with one change: the flood fill has to report back how big the region it just consumed was.",
      "Make the recursive helper RETURN a number — 0 when it walks off the grid or onto water, otherwise 1 plus the sum of the four recursive calls.",
      "Mark cells as visited (set them to 0) BEFORE recursing, otherwise two neighbours will bounce back and forth into each other forever.",
    ],
    solution:
      "function maxAreaOfIsland(grid) {\n  if (!grid || grid.length === 0) return 0;\n  const rows = grid.length;\n  const cols = grid[0].length;\n  const area = (r, c) => {\n    if (r < 0 || c < 0 || r >= rows || c >= cols) return 0;\n    if (grid[r][c] !== 1) return 0;\n    grid[r][c] = 0;\n    return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1);\n  };\n  let best = 0;\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === 1) {\n        const a = area(r, c);\n        if (a > best) best = a;\n      }\n    }\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "picks the bigger of two islands",
        body: "const grid = [\n  [0,0,1,0],\n  [0,1,1,0],\n  [0,0,0,1],\n];\nassert.equal(maxAreaOfIsland(grid), 3);",
      },
      {
        name: "no land at all",
        body: "assert.equal(maxAreaOfIsland([[0,0],[0,0]]), 0);",
      },
      {
        name: "whole grid is one island",
        body: "assert.equal(maxAreaOfIsland([[1,1],[1,1]]), 4);",
      },
      {
        name: "diagonal cells are separate islands",
        body: "assert.equal(maxAreaOfIsland([[1,0],[0,1]]), 1);",
      },
      {
        name: "long snaking island",
        body: "const grid = [\n  [1,1,1,1],\n  [0,0,0,1],\n  [1,1,1,1],\n];\nassert.equal(maxAreaOfIsland(grid), 9);",
      },
    ],
  },
  {
    id: "ex-clone-graph",
    chapter: "dsa-graphs-representation-traversal",
    level: "intermediate",
    title: "Clone Graph",
    brief:
      "<p>Given a reference to one node of a connected, undirected graph, return a <b>deep copy</b> of the whole graph.</p><ul><li>A node is <code>new GNode(val, neighbors)</code> — <code>neighbors</code> defaults to an empty array</li><li>The copy must contain <b>entirely new</b> node objects — not one node may be shared with the original</li><li>The shape must match exactly: same values, same neighbour relationships</li><li><code>cloneGraph(null)</code> returns <code>null</code></li><li><code>GNode</code>, a builder <code>buildGraph</code>, a serialiser <code>serialize</code> and <code>collectNodes</code> are already written for you</li></ul>",
    starter:
      "class GNode {\n  constructor(val, neighbors) {\n    this.val = val === undefined ? 0 : val;\n    this.neighbors = neighbors === undefined ? [] : neighbors;\n  }\n}\n\n// buildGraph([[2,4],[1,3],[2,4],[1,3]]) -> node 1 of a 4-node graph\nfunction buildGraph(adj) {\n  if (adj.length === 0) return null;\n  const nodes = adj.map((_, i) => new GNode(i + 1));\n  for (let i = 0; i < adj.length; i++) {\n    nodes[i].neighbors = adj[i].map((v) => nodes[v - 1]);\n  }\n  return nodes[0];\n}\n\nfunction collectNodes(node) {\n  const out = [];\n  if (!node) return out;\n  const seen = new Set([node]);\n  const stack = [node];\n  while (stack.length > 0) {\n    const cur = stack.pop();\n    out.push(cur);\n    for (const nb of cur.neighbors) {\n      if (!seen.has(nb)) {\n        seen.add(nb);\n        stack.push(nb);\n      }\n    }\n  }\n  return out;\n}\n\n// serialize(node) -> the adjacency list it was built from\nfunction serialize(node) {\n  const nodes = collectNodes(node);\n  nodes.sort((a, b) => a.val - b.val);\n  return nodes.map((n) => n.neighbors.map((x) => x.val).sort((a, b) => a - b));\n}\n\nfunction cloneGraph(node) {\n  // TODO: return a deep copy that shares no node objects with the original\n}\n",
    hints: [
      "The graph has cycles, so a naive recursion will revisit nodes forever. You need to remember which originals you have already copied.",
      "Keep a Map whose KEY is the original node object and whose VALUE is its copy. Look in the map first thing on entry; if the node is already there, return the existing copy.",
      "Create the copy and put it in the map BEFORE you recurse into the neighbours — that is what makes a cycle terminate.",
    ],
    solution:
      "class GNode {\n  constructor(val, neighbors) {\n    this.val = val === undefined ? 0 : val;\n    this.neighbors = neighbors === undefined ? [] : neighbors;\n  }\n}\n\nfunction buildGraph(adj) {\n  if (adj.length === 0) return null;\n  const nodes = adj.map((_, i) => new GNode(i + 1));\n  for (let i = 0; i < adj.length; i++) {\n    nodes[i].neighbors = adj[i].map((v) => nodes[v - 1]);\n  }\n  return nodes[0];\n}\n\nfunction collectNodes(node) {\n  const out = [];\n  if (!node) return out;\n  const seen = new Set([node]);\n  const stack = [node];\n  while (stack.length > 0) {\n    const cur = stack.pop();\n    out.push(cur);\n    for (const nb of cur.neighbors) {\n      if (!seen.has(nb)) {\n        seen.add(nb);\n        stack.push(nb);\n      }\n    }\n  }\n  return out;\n}\n\nfunction serialize(node) {\n  const nodes = collectNodes(node);\n  nodes.sort((a, b) => a.val - b.val);\n  return nodes.map((n) => n.neighbors.map((x) => x.val).sort((a, b) => a - b));\n}\n\nfunction cloneGraph(node) {\n  if (!node) return null;\n  const made = new Map();\n  const copy = (original) => {\n    const found = made.get(original);\n    if (found) return found;\n    const fresh = new GNode(original.val);\n    made.set(original, fresh);\n    for (const nb of original.neighbors) fresh.neighbors.push(copy(nb));\n    return fresh;\n  };\n  return copy(node);\n}\n",
    tests: [
      {
        name: "the copy has the same shape",
        body: "const adj = [[2,4],[1,3],[2,4],[1,3]];\nconst copy = cloneGraph(buildGraph(adj));\nassert.deepEqual(serialize(copy), adj);",
      },
      {
        name: "the clone shares no node objects with the original",
        body: "const original = buildGraph([[2,4],[1,3],[2,4],[1,3]]);\nconst copy = cloneGraph(original);\nconst olds = collectNodes(original);\nconst news = collectNodes(copy);\nassert.equal(news.length, olds.length);\nassert.notEqual(copy, original);\nfor (const n of news) {\n  assert.ok(olds.indexOf(n) === -1, 'clone reused an original node object');\n}",
      },
      {
        name: "editing the copy does not touch the original",
        body: "const original = buildGraph([[2],[1]]);\nconst copy = cloneGraph(original);\ncopy.val = 99;\ncopy.neighbors[0].val = 98;\nassert.equal(original.val, 1);\nassert.equal(original.neighbors[0].val, 2);",
      },
      {
        name: "single node with no neighbours",
        body: "const copy = cloneGraph(buildGraph([[]]));\nassert.equal(copy.val, 1);\nassert.deepEqual(copy.neighbors, []);",
      },
      {
        name: "null graph",
        body: "assert.equal(cloneGraph(null), null);",
      },
    ],
  },
  {
    id: "ex-rotting-oranges",
    chapter: "dsa-graphs-representation-traversal",
    level: "intermediate",
    title: "Rotting Oranges",
    brief:
      "<p>Each cell of <code>grid</code> is <code>0</code> (empty), <code>1</code> (a fresh orange) or <code>2</code> (a rotten orange). Every minute, a rotten orange rots each fresh orange directly above, below, left or right of it.</p><p>Return the number of minutes until no fresh orange remains, or <code>-1</code> if some fresh orange can never rot.</p><ul><li>All rotten oranges spread <b>simultaneously</b>, so this is a multi-source breadth-first search — not one BFS per rotten cell</li><li>If there are no fresh oranges to begin with, the answer is <code>0</code></li></ul>",
    starter: "function orangesRotting(grid) {\n  // TODO: multi-source BFS from every rotten orange at once\n}\n",
    hints: [
      "Sweep the grid once first: push EVERY rotten cell into the queue as a starting point, and count how many fresh oranges exist.",
      "Process the queue one whole level at a time. Each level is one minute; oranges rotted during a level go into the next level, not the current one.",
      "Decrement the fresh counter as you rot each orange. At the end, a non-zero counter means something was unreachable, so return -1.",
    ],
    solution:
      "function orangesRotting(grid) {\n  const rows = grid.length;\n  const cols = rows > 0 ? grid[0].length : 0;\n  let fresh = 0;\n  let queue = [];\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === 1) fresh++;\n      else if (grid[r][c] === 2) queue.push([r, c]);\n    }\n  }\n  if (fresh === 0) return 0;\n  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\n  let minutes = 0;\n  while (queue.length > 0 && fresh > 0) {\n    const next = [];\n    for (const cell of queue) {\n      for (const d of dirs) {\n        const nr = cell[0] + d[0];\n        const nc = cell[1] + d[1];\n        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;\n        if (grid[nr][nc] !== 1) continue;\n        grid[nr][nc] = 2;\n        fresh--;\n        next.push([nr, nc]);\n      }\n    }\n    queue = next;\n    minutes++;\n  }\n  return fresh === 0 ? minutes : -1;\n}\n",
    tests: [
      {
        name: "spreads across the grid in four minutes",
        body: "const grid = [\n  [2,1,1],\n  [1,1,0],\n  [0,1,1],\n];\nassert.equal(orangesRotting(grid), 4);",
      },
      {
        name: "an unreachable orange means -1",
        body: "const grid = [\n  [2,1,1],\n  [0,1,1],\n  [1,0,1],\n];\nassert.equal(orangesRotting(grid), -1);",
      },
      {
        name: "no fresh oranges takes zero minutes",
        body: "assert.equal(orangesRotting([[0,2]]), 0);",
      },
      {
        name: "empty of oranges entirely",
        body: "assert.equal(orangesRotting([[0,0],[0,0]]), 0);",
      },
      {
        name: "two sources meet in the middle",
        body: "const grid = [[2,1,1,1,2]];\nassert.equal(orangesRotting(grid), 2);",
      },
    ],
  },
  {
    id: "ex-pacific-atlantic-water-flow",
    chapter: "dsa-graph-problems",
    level: "advanced",
    title: "Pacific Atlantic Water Flow",
    brief:
      "<p>A rectangular island is described by <code>heights</code>, a grid of cell elevations. The Pacific ocean touches the island's <b>top and left</b> edges; the Atlantic touches its <b>bottom and right</b> edges.</p><p>Rain falling on a cell can flow to a neighbour (up, down, left or right) whose height is <b>less than or equal</b> to the current cell's height. Return every coordinate <code>[row, col]</code> from which water can reach <em>both</em> oceans.</p><ul><li>Coordinates may be returned in <b>any order</b></li><li>An empty grid returns an empty array</li></ul>",
    starter: "function pacificAtlantic(heights) {\n  // TODO: return every [row, col] that drains to both oceans\n}\n",
    hints: [
      "Running a search from every cell to see where it drains is O((rows*cols)^2). Turn the question around: start at the oceans and walk UPHILL.",
      "Flood inland from the top and left borders to mark every cell the Pacific can reach; do the same from the bottom and right borders for the Atlantic. Uphill means you may step to a neighbour whose height is >= the current one.",
      "The answer is the intersection of the two visited grids — every cell marked in both.",
    ],
    solution:
      "function pacificAtlantic(heights) {\n  if (!heights || heights.length === 0 || heights[0].length === 0) return [];\n  const rows = heights.length;\n  const cols = heights[0].length;\n  const blank = () => {\n    const g = [];\n    for (let r = 0; r < rows; r++) g.push(new Array(cols).fill(false));\n    return g;\n  };\n  const pacific = blank();\n  const atlantic = blank();\n  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\n  const climb = (r, c, seen) => {\n    seen[r][c] = true;\n    for (const d of dirs) {\n      const nr = r + d[0];\n      const nc = c + d[1];\n      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;\n      if (seen[nr][nc]) continue;\n      if (heights[nr][nc] < heights[r][c]) continue;\n      climb(nr, nc, seen);\n    }\n  };\n  for (let r = 0; r < rows; r++) {\n    climb(r, 0, pacific);\n    climb(r, cols - 1, atlantic);\n  }\n  for (let c = 0; c < cols; c++) {\n    climb(0, c, pacific);\n    climb(rows - 1, c, atlantic);\n  }\n  const out = [];\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (pacific[r][c] && atlantic[r][c]) out.push([r, c]);\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "the classic five by five island",
        body: "const heights = [\n  [1,2,2,3,5],\n  [3,2,3,4,4],\n  [2,4,5,3,1],\n  [6,7,1,4,5],\n  [5,1,1,2,4],\n];\nconst out = pacificAtlantic(heights).slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);\nassert.deepEqual(out, [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]);",
      },
      {
        name: "a single cell touches both oceans",
        body: "assert.deepEqual(pacificAtlantic([[1]]), [[0,0]]);",
      },
      {
        name: "a flat plateau drains everywhere",
        body: "const out = pacificAtlantic([[2,2],[2,2]]).slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);\nassert.deepEqual(out, [[0,0],[0,1],[1,0],[1,1]]);",
      },
      {
        name: "a single row sits on both coasts",
        body: "const out = pacificAtlantic([[1,2,3]]).slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);\nassert.deepEqual(out, [[0,0],[0,1],[0,2]]);",
      },
      {
        name: "empty grid",
        body: "assert.deepEqual(pacificAtlantic([]), []);",
      },
    ],
  },
  {
    id: "ex-surrounded-regions",
    chapter: "dsa-graphs-representation-traversal",
    level: "intermediate",
    title: "Surrounded Regions",
    brief:
      "<p>Given a <code>board</code> of the strings <code>'X'</code> and <code>'O'</code>, capture every region of <code>'O'</code>s that is completely surrounded by <code>'X'</code>s by flipping those cells to <code>'X'</code>.</p><ul><li>A region of <code>'O'</code>s is <b>not</b> captured if any of its cells touches the border of the board</li><li>Modify <code>board</code> <b>in place</b> — the function's return value is ignored</li><li>Cells connect horizontally and vertically only</li></ul>",
    starter:
      "function solve(board) {\n  // TODO: flip every 'O' region that does not touch the border to 'X', in place\n}\n",
    hints: [
      "Deciding 'is this region surrounded?' from the inside is awkward. Flip the question: which regions are SAFE?",
      "A region is safe exactly when it is reachable from an 'O' sitting on the border. Flood fill inward from every border 'O' and mark those cells with a temporary character such as '#'.",
      "Then make one final pass over the board: every remaining 'O' was unreachable and becomes 'X', and every '#' goes back to 'O'.",
    ],
    solution:
      "function solve(board) {\n  if (!board || board.length === 0) return;\n  const rows = board.length;\n  const cols = board[0].length;\n  const mark = (r, c) => {\n    if (r < 0 || c < 0 || r >= rows || c >= cols) return;\n    if (board[r][c] !== 'O') return;\n    board[r][c] = '#';\n    mark(r + 1, c);\n    mark(r - 1, c);\n    mark(r, c + 1);\n    mark(r, c - 1);\n  };\n  for (let r = 0; r < rows; r++) {\n    mark(r, 0);\n    mark(r, cols - 1);\n  }\n  for (let c = 0; c < cols; c++) {\n    mark(0, c);\n    mark(rows - 1, c);\n  }\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (board[r][c] === 'O') board[r][c] = 'X';\n      else if (board[r][c] === '#') board[r][c] = 'O';\n    }\n  }\n}\n",
    tests: [
      {
        name: "captures the enclosed region in place",
        body: "const board = [\n  ['X','X','X','X'],\n  ['X','O','O','X'],\n  ['X','X','O','X'],\n  ['X','O','X','X'],\n];\nsolve(board);\nassert.deepEqual(board, [\n  ['X','X','X','X'],\n  ['X','X','X','X'],\n  ['X','X','X','X'],\n  ['X','O','X','X'],\n]);",
      },
      {
        name: "a region connected to the border survives",
        body: "const board = [\n  ['X','O','X'],\n  ['X','O','X'],\n  ['X','X','X'],\n];\nsolve(board);\nassert.deepEqual(board, [\n  ['X','O','X'],\n  ['X','O','X'],\n  ['X','X','X'],\n]);",
      },
      {
        name: "a lone border cell is never captured",
        body: "const board = [['O']];\nsolve(board);\nassert.deepEqual(board, [['O']]);",
      },
      {
        name: "everything already X is left alone",
        body: "const board = [['X','X'],['X','X']];\nsolve(board);\nassert.deepEqual(board, [['X','X'],['X','X']]);",
      },
      {
        name: "two regions, only one enclosed",
        body: "const board = [\n  ['X','X','X','X','X'],\n  ['X','O','X','O','X'],\n  ['X','X','X','O','O'],\n];\nsolve(board);\nassert.deepEqual(board, [\n  ['X','X','X','X','X'],\n  ['X','X','X','O','X'],\n  ['X','X','X','O','O'],\n]);",
      },
    ],
  },
  {
    id: "ex-word-ladder",
    chapter: "dsa-graph-problems",
    level: "advanced",
    title: "Word Ladder",
    brief:
      "<p>Given <code>beginWord</code>, <code>endWord</code> and a list of words <code>wordList</code>, return the number of words in the <b>shortest</b> transformation sequence from <code>beginWord</code> to <code>endWord</code>.</p><ul><li>Each step changes exactly <b>one letter</b></li><li>Every intermediate word — and <code>endWord</code> — must appear in <code>wordList</code></li><li><code>beginWord</code> does not need to be in the list</li><li>The count includes both ends: <code>hit -> hot -> dot -> dog -> cog</code> is <code>5</code></li><li>If no sequence exists, return <code>0</code>. All words have the same length and use lowercase letters</li></ul>",
    starter:
      "function ladderLength(beginWord, endWord, wordList) {\n  // TODO: length of the shortest one-letter-at-a-time chain, or 0\n}\n",
    hints: [
      "Every word is a node and two words are joined when they differ in one letter. 'Shortest chain' on an unweighted graph means breadth-first search, never depth-first.",
      "Do not compare every pair of words — that is O(n^2 * L). From a word, GENERATE its neighbours: for each position, try all 26 letters and keep the candidates that exist in a Set of the word list.",
      "Delete each word from the Set the moment you enqueue it. That is your visited marker and it stops the queue from exploding.",
    ],
    solution:
      "function ladderLength(beginWord, endWord, wordList) {\n  const words = new Set(wordList);\n  if (!words.has(endWord)) return 0;\n  const letters = 'abcdefghijklmnopqrstuvwxyz';\n  words.delete(beginWord);\n  let frontier = [beginWord];\n  let steps = 1;\n  while (frontier.length > 0) {\n    const next = [];\n    for (const word of frontier) {\n      if (word === endWord) return steps;\n      for (let i = 0; i < word.length; i++) {\n        for (const ch of letters) {\n          if (ch === word[i]) continue;\n          const candidate = word.slice(0, i) + ch + word.slice(i + 1);\n          if (words.has(candidate)) {\n            words.delete(candidate);\n            next.push(candidate);\n          }\n        }\n      }\n    }\n    frontier = next;\n    steps++;\n  }\n  return 0;\n}\n",
    tests: [
      {
        name: "hit to cog in five words",
        body: "assert.equal(\n  ladderLength('hit', 'cog', ['hot','dot','dog','lot','log','cog']),\n  5\n);",
      },
      {
        name: "end word missing from the list",
        body: "assert.equal(\n  ladderLength('hit', 'cog', ['hot','dot','dog','lot','log']),\n  0\n);",
      },
      {
        name: "no chain connects the two words",
        body: "assert.equal(ladderLength('hot', 'dog', ['hot','dog']), 0);",
      },
      {
        name: "single letter words, one hop",
        body: "assert.equal(ladderLength('a', 'c', ['a','b','c']), 2);",
      },
      {
        name: "takes the shorter of two routes",
        body: "assert.equal(\n  ladderLength('red', 'tax', ['ted','tex','red','tax','tad','den','rex','pee']),\n  4\n);",
      },
    ],
  },
  {
    id: "ex-course-schedule",
    chapter: "dsa-topological-patterns",
    level: "advanced",
    title: "Course Schedule",
    brief:
      "<p>There are <code>numCourses</code> courses labelled <code>0</code> to <code>numCourses - 1</code>. Each pair <code>[a, b]</code> in <code>prerequisites</code> means you must take course <code>b</code> before course <code>a</code>.</p><p>Return <code>true</code> if it is possible to finish every course.</p><ul><li>It is impossible exactly when the prerequisite graph contains a <b>cycle</b></li><li>A course may be its own prerequisite — <code>[0, 0]</code> is a cycle</li><li>An empty prerequisite list is always finishable</li></ul>",
    starter:
      "function canFinish(numCourses, prerequisites) {\n  // TODO: return true when the prerequisite graph has no cycle\n}\n",
    hints: [
      "Build an adjacency list first. For the pair [a, b], the natural edge is b -> a: 'finishing b unlocks a'.",
      "Kahn's algorithm: count each course's number of unmet prerequisites (its in-degree), queue everything at zero, and repeatedly remove a course and decrement its dependants.",
      "If the number of courses you managed to remove equals numCourses, there was no cycle. Anything left over is stuck in one.",
    ],
    solution:
      "function canFinish(numCourses, prerequisites) {\n  const next = [];\n  for (let i = 0; i < numCourses; i++) next.push([]);\n  const indegree = new Array(numCourses).fill(0);\n  for (const pair of prerequisites) {\n    next[pair[1]].push(pair[0]);\n    indegree[pair[0]]++;\n  }\n  const queue = [];\n  for (let i = 0; i < numCourses; i++) {\n    if (indegree[i] === 0) queue.push(i);\n  }\n  let done = 0;\n  let head = 0;\n  while (head < queue.length) {\n    const course = queue[head++];\n    done++;\n    for (const dependant of next[course]) {\n      indegree[dependant]--;\n      if (indegree[dependant] === 0) queue.push(dependant);\n    }\n  }\n  return done === numCourses;\n}\n",
    tests: [
      {
        name: "a simple chain is finishable",
        body: "assert.equal(canFinish(2, [[1,0]]), true);",
      },
      {
        name: "a two-course cycle is not",
        body: "assert.equal(canFinish(2, [[1,0],[0,1]]), false);",
      },
      {
        name: "no prerequisites at all",
        body: "assert.equal(canFinish(3, []), true);",
      },
      {
        name: "a course that requires itself",
        body: "assert.equal(canFinish(1, [[0,0]]), false);",
      },
      {
        name: "a diamond is fine, a longer cycle is not",
        body: "assert.equal(canFinish(4, [[1,0],[2,0],[3,1],[3,2]]), true);\nassert.equal(canFinish(4, [[1,0],[2,1],[0,2],[3,0]]), false);",
      },
    ],
  },
  {
    id: "ex-course-schedule-ii",
    chapter: "dsa-topological-patterns",
    level: "intermediate",
    title: "Course Schedule II",
    brief:
      "<p>There are <code>numCourses</code> courses labelled <code>0</code> to <code>numCourses - 1</code>. Each pair <code>[a, b]</code> in <code>prerequisites</code> means course <code>b</code> must be taken before course <code>a</code>.</p><p>Return any ordering of all the courses that respects every prerequisite. If no such ordering exists, return an empty array.</p><ul><li>There are usually <b>many</b> valid answers — any one of them is accepted</li><li>A valid answer lists every course exactly once</li><li>With no prerequisites, every ordering is valid</li></ul>",
    starter:
      "function findOrder(numCourses, prerequisites) {\n  // TODO: return any valid course order, or [] if the graph has a cycle\n}\n",
    hints: [
      "This is the same cycle check as Course Schedule, except you now record the courses in the order you take them off the queue.",
      "Build edges b -> a and an in-degree count per course. Seed a queue with every course whose in-degree is 0 — those have nothing blocking them.",
      "Pop a course, append it to the result, and decrement each dependant's in-degree, enqueueing any that reach 0. If the result is shorter than numCourses at the end, a cycle exists, so return [].",
    ],
    solution:
      "function findOrder(numCourses, prerequisites) {\n  const next = [];\n  for (let i = 0; i < numCourses; i++) next.push([]);\n  const indegree = new Array(numCourses).fill(0);\n  for (const pair of prerequisites) {\n    next[pair[1]].push(pair[0]);\n    indegree[pair[0]]++;\n  }\n  const order = [];\n  for (let i = 0; i < numCourses; i++) {\n    if (indegree[i] === 0) order.push(i);\n  }\n  let head = 0;\n  while (head < order.length) {\n    const course = order[head++];\n    for (const dependant of next[course]) {\n      indegree[dependant]--;\n      if (indegree[dependant] === 0) order.push(dependant);\n    }\n  }\n  return order.length === numCourses ? order : [];\n}\n",
    tests: [
      {
        name: "a diamond produces a valid order",
        body: "const prereqs = [[1,0],[2,0],[3,1],[3,2]];\nconst order = findOrder(4, prereqs);\nassert.equal(order.length, 4);\nassert.deepEqual(order.slice().sort((a, b) => a - b), [0,1,2,3]);\nconst at = new Map();\norder.forEach((c, i) => at.set(c, i));\nfor (const p of prereqs) {\n  assert.ok(at.get(p[1]) < at.get(p[0]), 'prerequisite must come first');\n}",
      },
      {
        name: "a straight chain is forced",
        body: "const prereqs = [[1,0],[2,1],[3,2]];\nconst order = findOrder(4, prereqs);\nassert.equal(order.length, 4);\nconst at = new Map();\norder.forEach((c, i) => at.set(c, i));\nfor (const p of prereqs) assert.ok(at.get(p[1]) < at.get(p[0]));",
      },
      {
        name: "no prerequisites still returns every course",
        body: "const order = findOrder(3, []);\nassert.deepEqual(order.slice().sort((a, b) => a - b), [0,1,2]);",
      },
      {
        name: "a cycle returns an empty array",
        body: "assert.deepEqual(findOrder(2, [[1,0],[0,1]]), []);",
      },
      {
        name: "one course, no prerequisites",
        body: "assert.deepEqual(findOrder(1, []), [0]);",
      },
    ],
  },
  {
    id: "ex-alien-dictionary",
    chapter: "dsa-topological-patterns",
    level: "advanced",
    title: "Alien Dictionary",
    brief:
      "<p>You are given <code>words</code>, a list of lowercase words sorted according to the rules of an unknown alphabet. Work out an ordering of the letters that is consistent with that sorting and return it as a string.</p><ul><li>The result must contain <b>every distinct letter</b> that appears in <code>words</code>, each exactly once</li><li>If several orderings are consistent, return <b>any</b> of them</li><li>If the input is impossible, return the empty string <code>''</code>. That covers a cycle in the deduced order, and also the invalid prefix case: <code>['abc', 'ab']</code> can never be sorted, because a prefix must come first</li><li>Letters inside a single word tell you nothing about their relative order</li></ul>",
    starter:
      "function alienOrder(words) {\n  // TODO: derive a letter order from the sorted words, or '' if impossible\n}\n",
    hints: [
      "Two adjacent words give you exactly ONE fact: at their first differing character position, the letter from the earlier word comes before the letter from the later word. Everything after that position is unconstrained.",
      "If one word is a prefix of the next, there is no differing position. That is fine when the shorter word comes first, and impossible when the longer word comes first — return '' immediately in that case.",
      "Now it is a topological sort over the letters. Register every letter first (even ones with no constraints), then Kahn's algorithm; if the output is shorter than the letter count, there was a cycle.",
    ],
    solution:
      "function alienOrder(words) {\n  const after = new Map();\n  const indegree = new Map();\n  for (const word of words) {\n    for (const ch of word) {\n      if (!after.has(ch)) {\n        after.set(ch, new Set());\n        indegree.set(ch, 0);\n      }\n    }\n  }\n  for (let i = 0; i + 1 < words.length; i++) {\n    const a = words[i];\n    const b = words[i + 1];\n    const limit = Math.min(a.length, b.length);\n    let j = 0;\n    while (j < limit && a[j] === b[j]) j++;\n    if (j === limit) {\n      if (a.length > b.length) return '';\n      continue;\n    }\n    if (!after.get(a[j]).has(b[j])) {\n      after.get(a[j]).add(b[j]);\n      indegree.set(b[j], indegree.get(b[j]) + 1);\n    }\n  }\n  const queue = [];\n  for (const entry of indegree) {\n    if (entry[1] === 0) queue.push(entry[0]);\n  }\n  let out = '';\n  let head = 0;\n  while (head < queue.length) {\n    const ch = queue[head++];\n    out += ch;\n    for (const nx of after.get(ch)) {\n      indegree.set(nx, indegree.get(nx) - 1);\n      if (indegree.get(nx) === 0) queue.push(nx);\n    }\n  }\n  return out.length === indegree.size ? out : '';\n}\n",
    tests: [
      {
        name: "derives a consistent order for the classic input",
        body: "const order = alienOrder(['wrt','wrf','er','ett','rftt']);\nassert.equal(order.length, 5);\nfor (const ch of 'wertf') assert.ok(order.indexOf(ch) !== -1, 'missing letter ' + ch);\nconst pairs = [['t','f'],['w','e'],['r','t'],['e','r']];\nfor (const p of pairs) {\n  assert.ok(order.indexOf(p[0]) < order.indexOf(p[1]), p[0] + ' must precede ' + p[1]);\n}",
      },
      {
        name: "two single letter words",
        body: "const order = alienOrder(['z','x']);\nassert.equal(order.length, 2);\nassert.ok(order.indexOf('z') < order.indexOf('x'));",
      },
      {
        name: "an invalid prefix is impossible",
        body: "assert.equal(alienOrder(['abc','ab']), '');",
      },
      {
        name: "a cycle is impossible",
        body: "assert.equal(alienOrder(['a','b','a']), '');",
      },
      {
        name: "a single word constrains nothing",
        body: "const order = alienOrder(['abc']);\nassert.equal(order.length, 3);\nfor (const ch of 'abc') assert.ok(order.indexOf(ch) !== -1);\nassert.equal(alienOrder(['z','z']), 'z');",
      },
    ],
  },
  {
    id: "ex-network-delay-time",
    chapter: "dsa-advanced-graph-algorithms",
    level: "advanced",
    title: "Network Delay Time",
    brief:
      "<p>A network has <code>n</code> nodes labelled <code>1</code> to <code>n</code>. Each entry <code>[u, v, w]</code> in <code>times</code> is a directed edge: a signal takes <code>w</code> time to travel from <code>u</code> to <code>v</code>.</p><p>A signal is sent from node <code>k</code>. Return the time it takes for <b>all</b> nodes to receive it, or <code>-1</code> if some node never does.</p><ul><li>Weights are positive, so this is Dijkstra's algorithm</li><li>The answer is the <b>largest</b> of the shortest distances</li><li>JavaScript has no built-in priority queue, so a compact <code>MinHeap</code> keyed on <code>item[0]</code> is <b>already written for you</b> in the starter — write the algorithm, not the plumbing</li></ul>",
    starter:
      "class MinHeap {\n  constructor() {\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  push(item) {\n    const a = this.items;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      const t = a[p]; a[p] = a[i]; a[i] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        const t = a[m]; a[m] = a[i]; a[i] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction networkDelayTime(times, n, k) {\n  // TODO: Dijkstra from k; return the largest shortest-distance, or -1\n}\n",
    hints: [
      "Build an adjacency list from times first: node -> array of [neighbour, weight]. Scanning the edge list inside the loop would throw away the whole point of the heap.",
      "Push [0, k] to start. Each pop gives the smallest tentative distance in the frontier; the first time you pop a node, that distance is final — record it and skip any later pop of the same node.",
      "At the end, if you settled fewer than n nodes something was unreachable, so return -1. Otherwise return the maximum settled distance.",
    ],
    solution:
      "class MinHeap {\n  constructor() {\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  push(item) {\n    const a = this.items;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      const t = a[p]; a[p] = a[i]; a[i] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        const t = a[m]; a[m] = a[i]; a[i] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction networkDelayTime(times, n, k) {\n  const adj = new Map();\n  for (let i = 1; i <= n; i++) adj.set(i, []);\n  for (const e of times) adj.get(e[0]).push([e[1], e[2]]);\n  const settled = new Map();\n  const heap = new MinHeap();\n  heap.push([0, k]);\n  while (heap.size > 0) {\n    const top = heap.pop();\n    const dist = top[0];\n    const node = top[1];\n    if (settled.has(node)) continue;\n    settled.set(node, dist);\n    for (const edge of adj.get(node)) {\n      if (!settled.has(edge[0])) heap.push([dist + edge[1], edge[0]]);\n    }\n  }\n  if (settled.size !== n) return -1;\n  let worst = 0;\n  for (const entry of settled) {\n    if (entry[1] > worst) worst = entry[1];\n  }\n  return worst;\n}\n",
    tests: [
      {
        name: "signal reaches every node",
        body: "assert.equal(networkDelayTime([[2,1,1],[2,3,1],[3,4,1]], 4, 2), 2);",
      },
      {
        name: "a cheaper two-hop route beats the direct edge",
        body: "assert.equal(networkDelayTime([[1,2,10],[1,3,1],[3,2,1]], 3, 1), 2);",
      },
      {
        name: "an unreachable node gives -1",
        body: "assert.equal(networkDelayTime([[1,2,1]], 2, 2), -1);",
      },
      {
        name: "a lone node needs no time",
        body: "assert.equal(networkDelayTime([], 1, 1), 0);",
      },
      {
        name: "single edge from the source",
        body: "assert.equal(networkDelayTime([[1,2,1]], 2, 1), 1);",
      },
    ],
  },
  {
    id: "ex-cheapest-flights-within-k-stops",
    chapter: "dsa-advanced-graph-algorithms",
    level: "advanced",
    title: "Cheapest Flights Within K Stops",
    brief:
      "<p>There are <code>n</code> cities labelled <code>0</code> to <code>n - 1</code> and a list of <code>flights</code>, each <code>[from, to, price]</code>. Return the cheapest price from <code>src</code> to <code>dst</code> using <b>at most <code>k</code> stops</b>, or <code>-1</code> if no such route exists.</p><ul><li>'At most <code>k</code> stops' means at most <code>k + 1</code> flights — the intermediate cities are the stops</li><li>Plain Dijkstra is <b>wrong</b> here: the cheapest way to reach a city may use too many flights, and a pricier route with fewer flights can still win</li><li><code>src === dst</code> costs <code>0</code></li><li>A compact <code>MinHeap</code> keyed on <code>item[0]</code> is <b>already written for you</b> in the starter — spend your effort on the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor() {\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  push(item) {\n    const a = this.items;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      const t = a[p]; a[p] = a[i]; a[i] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        const t = a[m]; a[m] = a[i]; a[i] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction findCheapestPrice(n, flights, src, dst, k) {\n  // TODO: cheapest src -> dst using at most k stops, or -1\n}\n",
    hints: [
      "The state you are searching is not just 'which city' — it is 'which city, reached with how many flights'. Carry both through the search.",
      "Push [cost, city, flightsTaken] onto the heap. Because the heap is ordered by cost, the first time you pop dst you have the cheapest legal route, so you can return immediately.",
      "To avoid revisiting pointlessly, remember the fewest flights you have ever used to reach each city and skip a state that arrives at a city both more expensively AND with no fewer flights. Also stop expanding once flightsTaken exceeds k.",
    ],
    solution:
      "class MinHeap {\n  constructor() {\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  push(item) {\n    const a = this.items;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      const t = a[p]; a[p] = a[i]; a[i] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        const t = a[m]; a[m] = a[i]; a[i] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction findCheapestPrice(n, flights, src, dst, k) {\n  const adj = [];\n  for (let i = 0; i < n; i++) adj.push([]);\n  for (const f of flights) adj[f[0]].push([f[1], f[2]]);\n  const fewest = new Array(n).fill(Infinity);\n  const heap = new MinHeap();\n  heap.push([0, src, 0]);\n  while (heap.size > 0) {\n    const top = heap.pop();\n    const cost = top[0];\n    const city = top[1];\n    const hops = top[2];\n    if (city === dst) return cost;\n    if (hops > k || hops >= fewest[city]) continue;\n    fewest[city] = hops;\n    for (const edge of adj[city]) {\n      heap.push([cost + edge[1], edge[0], hops + 1]);\n    }\n  }\n  return -1;\n}\n",
    tests: [
      {
        name: "one stop allowed",
        body: "const flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]];\nassert.equal(findCheapestPrice(4, flights, 0, 3, 1), 700);",
      },
      {
        name: "two stops unlock the cheaper route",
        body: "const flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]];\nassert.equal(findCheapestPrice(4, flights, 0, 3, 2), 400);",
      },
      {
        name: "zero stops forces the expensive direct flight",
        body: "const flights = [[0,1,100],[1,2,100],[0,2,500]];\nassert.equal(findCheapestPrice(3, flights, 0, 2, 0), 500);\nassert.equal(findCheapestPrice(3, flights, 0, 2, 1), 200);",
      },
      {
        name: "unreachable destination",
        body: "assert.equal(findCheapestPrice(2, [], 0, 1, 5), -1);",
      },
      {
        name: "source is the destination",
        body: "assert.equal(findCheapestPrice(3, [[0,1,50]], 2, 2, 0), 0);",
      },
    ],
  },
  {
    id: "ex-number-of-connected-components",
    chapter: "dsa-union-find",
    level: "intermediate",
    title: "Number of Connected Components in an Undirected Graph",
    brief:
      "<p>You are given <code>n</code> nodes labelled <code>0</code> to <code>n - 1</code> and a list of undirected <code>edges</code>, each <code>[a, b]</code>. Return the number of connected components.</p><ul><li>Solve it with <b>union-find</b> (disjoint set union)</li><li>A node with no edges is its own component</li><li>Duplicate edges are allowed and must not change the answer</li><li><code>n = 0</code> gives <code>0</code></li></ul>",
    starter: "function countComponents(n, edges) {\n  // TODO: union-find — start at n components and merge\n}\n",
    hints: [
      "Start with a parent array where every node is its own parent, and a counter set to n — each node begins as its own component.",
      "find(x) walks up the parent chain to the root. union(a, b) finds both roots; if they are already the same, the edge is redundant and the count does not change.",
      "Only when the two roots differ do you point one at the other and decrement the counter. Path compression (parent[x] = find(parent[x])) keeps find nearly constant time.",
    ],
    solution:
      "function countComponents(n, edges) {\n  const parent = [];\n  for (let i = 0; i < n; i++) parent.push(i);\n  const find = (x) => {\n    while (parent[x] !== x) {\n      parent[x] = parent[parent[x]];\n      x = parent[x];\n    }\n    return x;\n  };\n  let components = n;\n  for (const e of edges) {\n    const ra = find(e[0]);\n    const rb = find(e[1]);\n    if (ra !== rb) {\n      parent[ra] = rb;\n      components--;\n    }\n  }\n  return components;\n}\n",
    tests: [
      {
        name: "two components",
        body: "assert.equal(countComponents(5, [[0,1],[1,2],[3,4]]), 2);",
      },
      {
        name: "one long chain",
        body: "assert.equal(countComponents(5, [[0,1],[1,2],[2,3],[3,4]]), 1);",
      },
      {
        name: "no edges means every node is alone",
        body: "assert.equal(countComponents(4, []), 4);",
      },
      {
        name: "duplicate and reversed edges do not double count",
        body: "assert.equal(countComponents(3, [[0,1],[0,1],[1,0]]), 2);",
      },
      {
        name: "no nodes at all",
        body: "assert.equal(countComponents(0, []), 0);",
      },
    ],
  },
  {
    id: "ex-redundant-connection",
    chapter: "dsa-union-find",
    level: "advanced",
    title: "Redundant Connection",
    brief:
      "<p>You start with a tree over <code>n</code> nodes labelled <code>1</code> to <code>n</code> and one extra undirected edge is added, creating exactly one cycle. Given the list of <code>edges</code> in the order they were added, return the edge that can be removed so the result is a tree again.</p><ul><li>If several edges would work, return the one that appears <b>last</b> in the input</li><li>The returned value must be the edge array itself, e.g. <code>[2, 3]</code></li><li>Node labels are 1-based</li></ul>",
    starter:
      "function findRedundantConnection(edges) {\n  // TODO: union-find — the first edge whose two ends are already connected\n}\n",
    hints: [
      "Process the edges in the order given, maintaining a disjoint set. Every edge that joins two previously separate groups is a genuine tree edge.",
      "The moment an edge's two endpoints already share a root, that edge closes a cycle — and because you are scanning in order, it is the last such edge in the input. Return it immediately.",
      "Size the parent array as edges.length + 1 so the 1-based labels index it directly.",
    ],
    solution:
      "function findRedundantConnection(edges) {\n  const parent = [];\n  for (let i = 0; i <= edges.length; i++) parent.push(i);\n  const find = (x) => {\n    while (parent[x] !== x) {\n      parent[x] = parent[parent[x]];\n      x = parent[x];\n    }\n    return x;\n  };\n  for (const e of edges) {\n    const ra = find(e[0]);\n    const rb = find(e[1]);\n    if (ra === rb) return e;\n    parent[ra] = rb;\n  }\n  return [];\n}\n",
    tests: [
      {
        name: "the smallest triangle",
        body: "assert.deepEqual(findRedundantConnection([[1,2],[1,3],[2,3]]), [2,3]);",
      },
      {
        name: "cycle closed before the last edge",
        body: "assert.deepEqual(\n  findRedundantConnection([[1,2],[2,3],[3,4],[1,4],[1,5]]),\n  [1,4]\n);",
      },
      {
        name: "star with one extra rung",
        body: "assert.deepEqual(\n  findRedundantConnection([[1,2],[1,3],[1,4],[3,4],[1,5]]),\n  [3,4]\n);",
      },
      {
        name: "labels in either direction",
        body: "assert.deepEqual(findRedundantConnection([[2,1],[3,1],[4,2],[1,4]]), [1,4]);",
      },
      {
        name: "long chain closed at the very end",
        body: "assert.deepEqual(\n  findRedundantConnection([[1,2],[2,3],[3,4],[4,5],[5,6],[1,6]]),\n  [1,6]\n);",
      },
    ],
  },
  {
    id: "ex-min-cost-connect-all-points",
    chapter: "dsa-minimum-spanning-tree",
    level: "advanced",
    title: "Min Cost to Connect All Points",
    brief:
      "<p>Given <code>points</code>, an array of <code>[x, y]</code> coordinates on a plane, connect every point so that there is exactly one path between any two of them, at minimum total cost.</p><ul><li>The cost of a connection is the <b>Manhattan distance</b> <code>|x1 - x2| + |y1 - y2|</code></li><li>Return that minimum total cost — this is a <b>minimum spanning tree</b></li><li>Fewer than two points cost <code>0</code></li><li>A compact <code>MinHeap</code> keyed on <code>item[0]</code> is <b>already written for you</b> in the starter, so you can concentrate on the MST itself</li></ul>",
    starter:
      "class MinHeap {\n  constructor() {\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  push(item) {\n    const a = this.items;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      const t = a[p]; a[p] = a[i]; a[i] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        const t = a[m]; a[m] = a[i]; a[i] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction minCostConnectPoints(points) {\n  // TODO: total weight of the minimum spanning tree under Manhattan distance\n}\n",
    hints: [
      "Every pair of points is an edge, so the graph is complete. Prim's algorithm suits it: grow one tree, always adding the cheapest edge that reaches a point not yet in the tree.",
      "Start from point 0. Push [distance, index] for each of its neighbours, then repeatedly pop the cheapest entry, skip it if that point is already in the tree, otherwise add its distance to the total and push its own outgoing edges.",
      "Stop once the tree holds every point. Exactly n - 1 edges get accepted; the 'already in the tree' check is what prevents cycles.",
    ],
    solution:
      "class MinHeap {\n  constructor() {\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  push(item) {\n    const a = this.items;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      const t = a[p]; a[p] = a[i]; a[i] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        const t = a[m]; a[m] = a[i]; a[i] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction minCostConnectPoints(points) {\n  const n = points.length;\n  if (n < 2) return 0;\n  const gap = (i, j) =>\n    Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);\n  const inTree = new Array(n).fill(false);\n  const heap = new MinHeap();\n  heap.push([0, 0]);\n  let total = 0;\n  let joined = 0;\n  while (heap.size > 0 && joined < n) {\n    const top = heap.pop();\n    const cost = top[0];\n    const idx = top[1];\n    if (inTree[idx]) continue;\n    inTree[idx] = true;\n    joined++;\n    total += cost;\n    for (let j = 0; j < n; j++) {\n      if (!inTree[j]) heap.push([gap(idx, j), j]);\n    }\n  }\n  return total;\n}\n",
    tests: [
      {
        name: "five points",
        body: "assert.equal(\n  minCostConnectPoints([[0,0],[2,2],[3,10],[5,2],[7,0]]),\n  20\n);",
      },
      {
        name: "negative coordinates",
        body: "assert.equal(minCostConnectPoints([[3,12],[-2,5],[-4,1]]), 18);",
      },
      {
        name: "two points cost one edge",
        body: "assert.equal(minCostConnectPoints([[0,0],[1,1]]), 2);",
      },
      {
        name: "a single point costs nothing",
        body: "assert.equal(minCostConnectPoints([[4,7]]), 0);\nassert.equal(minCostConnectPoints([]), 0);",
      },
      {
        name: "a unit square needs three edges",
        body: "assert.equal(minCostConnectPoints([[0,0],[0,1],[1,0],[1,1]]), 3);",
      },
    ],
  },
  {
    id: "ex-climbing-stairs",
    chapter: "dsa-dp-1d",
    level: "beginner",
    title: "Climbing Stairs",
    brief:
      "<p>You are climbing a staircase of <code>n</code> steps. Each move you may climb either <code>1</code> or <code>2</code> steps. Return how many distinct ways there are to reach the top.</p><ul><li><code>n = 2</code> gives <code>2</code>: <code>1+1</code> or <code>2</code></li><li><code>n = 3</code> gives <code>3</code>: <code>1+1+1</code>, <code>1+2</code>, <code>2+1</code></li><li>Must run in linear time — plain recursion will time out for larger <code>n</code></li></ul>",
    starter:
      "function climbStairs(n) {\n  // TODO: how many distinct ways to reach step n taking 1 or 2 at a time\n}\n",
    hints: [
      "The last move onto step n came either from step n-1 or from step n-2. So ways(n) = ways(n-1) + ways(n-2).",
      "Recursing on that directly recomputes the same subproblems exponentially. Build the answers upward from the base cases instead.",
      "You only ever need the previous two totals, so two variables are enough — no array required.",
    ],
    solution:
      "function climbStairs(n) {\n  if (n <= 2) return n;\n  let twoBack = 1;\n  let oneBack = 2;\n  for (let step = 3; step <= n; step++) {\n    const current = oneBack + twoBack;\n    twoBack = oneBack;\n    oneBack = current;\n  }\n  return oneBack;\n}\n",
    tests: [
      {
        name: "two steps",
        body: "assert.equal(climbStairs(2), 2);",
      },
      {
        name: "three steps",
        body: "assert.equal(climbStairs(3), 3);",
      },
      {
        name: "one step",
        body: "assert.equal(climbStairs(1), 1);",
      },
      {
        name: "ten steps",
        body: "assert.equal(climbStairs(10), 89);",
      },
      {
        name: "large n stays fast",
        body: "assert.equal(climbStairs(45), 1836311903);",
      },
    ],
  },
  {
    id: "ex-house-robber",
    chapter: "dsa-dp-1d",
    level: "beginner",
    title: "House Robber",
    brief:
      "<p>Each house on a street holds <code>nums[i]</code> pounds. You cannot rob two <b>adjacent</b> houses on the same night. Return the largest amount you can take.</p><ul><li>All amounts are non-negative</li><li>An empty street yields <code>0</code></li><li>Greedily taking the biggest house is <em>not</em> correct: <code>[2,1,1,2]</code> gives <code>4</code></li></ul>",
    starter: "function rob(nums) {\n  // TODO: largest total with no two adjacent houses\n}\n",
    hints: [
      "At each house you face one binary choice: rob it (and give up the house right before it) or skip it (and keep the best total so far).",
      "So best(i) = max(best(i-1), best(i-2) + nums[i]). Sweep left to right applying that.",
      "Only the last two totals matter, so carry two running numbers instead of a whole array.",
    ],
    solution:
      "function rob(nums) {\n  let skip = 0;\n  let take = 0;\n  for (const value of nums) {\n    const next = Math.max(take, skip + value);\n    skip = take;\n    take = next;\n  }\n  return take;\n}\n",
    tests: [
      {
        name: "skip the middle house",
        body: "assert.equal(rob([1,2,3,1]), 4);",
      },
      {
        name: "take first, middle and last",
        body: "assert.equal(rob([2,7,9,3,1]), 12);",
      },
      {
        name: "empty street",
        body: "assert.equal(rob([]), 0);",
      },
      {
        name: "one house",
        body: "assert.equal(rob([5]), 5);",
      },
      {
        name: "the greedy pick is wrong here",
        body: "assert.equal(rob([2,1,1,2]), 4);\nassert.equal(rob([2,3,2]), 4);",
      },
    ],
  },
  {
    id: "ex-house-robber-ii",
    chapter: "dsa-dp-1d",
    level: "advanced",
    title: "House Robber II",
    brief:
      "<p>Same rules as House Robber, except the houses are arranged in a <b>circle</b>: the first and last house are neighbours, so you may not rob both. Return the largest amount you can take.</p><ul><li><code>[2,3,2]</code> gives <code>3</code> — you cannot take both 2s</li><li>A street of one house has no neighbour problem, so the answer is that house</li><li>An empty street yields <code>0</code></li></ul>",
    starter: "function rob(nums) {\n  // TODO: same as House Robber, but the first and last houses are adjacent\n}\n",
    hints: [
      "You cannot express 'circular' inside one linear sweep. Split on the single decision that causes the trouble: is the FIRST house robbed or not?",
      "If the first house is robbed, the last is off limits, so solve the linear problem on nums[0..n-2]. If it is not, solve it on nums[1..n-1]. The answer is the larger of the two.",
      "Write the plain linear robber as a helper over a slice, then call it twice. Handle n === 1 separately, because both slices would be empty.",
    ],
    solution:
      "function rob(nums) {\n  const line = (list) => {\n    let skip = 0;\n    let take = 0;\n    for (const value of list) {\n      const next = Math.max(take, skip + value);\n      skip = take;\n      take = next;\n    }\n    return take;\n  };\n  if (nums.length === 0) return 0;\n  if (nums.length === 1) return nums[0];\n  return Math.max(line(nums.slice(0, nums.length - 1)), line(nums.slice(1)));\n}\n",
    tests: [
      {
        name: "cannot rob both ends",
        body: "assert.equal(rob([2,3,2]), 3);",
      },
      {
        name: "the interior pair wins",
        body: "assert.equal(rob([1,2,3,1]), 4);",
      },
      {
        name: "three houses, take the biggest",
        body: "assert.equal(rob([1,2,3]), 3);",
      },
      {
        name: "one and two house streets",
        body: "assert.equal(rob([5]), 5);\nassert.equal(rob([1,2]), 2);\nassert.equal(rob([]), 0);",
      },
      {
        name: "longer circle",
        body: "assert.equal(rob([200,3,140,20,10]), 340);\nassert.equal(rob([2,7,9,3,1]), 11);",
      },
    ],
  },
  {
    id: "ex-coin-change",
    chapter: "dsa-dp-1d",
    level: "intermediate",
    title: "Coin Change",
    brief:
      "<p>Given an array of distinct <code>coins</code> and a target <code>amount</code>, return the <b>fewest</b> coins needed to make exactly that amount.</p><ul><li>You have an unlimited supply of every coin</li><li>If the amount cannot be made, return <code>-1</code></li><li><code>amount = 0</code> needs <code>0</code> coins</li><li>Taking the biggest coin first is <em>not</em> correct in general</li></ul>",
    starter:
      "function coinChange(coins, amount) {\n  // TODO: fewest coins summing to amount, or -1 if impossible\n}\n",
    hints: [
      "Define best[a] as the fewest coins that make a. Then best[a] is 1 + the smallest best[a - c] over every coin c that fits.",
      "Fill best from 0 upward so every value you need has already been computed. Seed best[0] = 0 and everything else with Infinity, meaning 'not reachable yet'.",
      "At the end, an entry still holding Infinity means the amount is unmakeable — that is your -1.",
    ],
    solution:
      "function coinChange(coins, amount) {\n  const best = new Array(amount + 1).fill(Infinity);\n  best[0] = 0;\n  for (let a = 1; a <= amount; a++) {\n    for (const coin of coins) {\n      if (coin <= a && best[a - coin] + 1 < best[a]) {\n        best[a] = best[a - coin] + 1;\n      }\n    }\n  }\n  return best[amount] === Infinity ? -1 : best[amount];\n}\n",
    tests: [
      {
        name: "eleven from 1, 2 and 5",
        body: "assert.equal(coinChange([1,2,5], 11), 3);",
      },
      {
        name: "impossible amount",
        body: "assert.equal(coinChange([2], 3), -1);",
      },
      {
        name: "zero needs no coins",
        body: "assert.equal(coinChange([1], 0), 0);\nassert.equal(coinChange([7,11], 0), 0);",
      },
      {
        name: "greedy would fail here",
        body: "assert.equal(coinChange([1,3,4], 6), 2);",
      },
      {
        name: "larger amount",
        body: "assert.equal(coinChange([186,419,83,408], 6249), 20);",
      },
    ],
  },
  {
    id: "ex-coin-change-ii",
    chapter: "dsa-dp-1d",
    level: "intermediate",
    title: "Coin Change II",
    brief:
      "<p>Given a target <code>amount</code> and an array of distinct <code>coins</code>, return the number of distinct <b>combinations</b> of coins that add up to the amount.</p><ul><li>You have an unlimited supply of every coin</li><li>Combinations, not permutations: <code>1 + 2</code> and <code>2 + 1</code> are the <b>same</b> answer</li><li>There is exactly <code>1</code> way to make <code>0</code> — take no coins</li><li>If the amount cannot be made, return <code>0</code></li></ul>",
    starter: "function change(amount, coins) {\n  // TODO: count the distinct coin combinations that make amount\n}\n",
    hints: [
      "Let ways[a] be the number of combinations that make a, starting with ways[0] = 1.",
      "The trap is double counting. Loop over the COINS on the outside and the amounts on the inside — that way each combination is only ever built in one fixed coin order.",
      "For a coin c, sweep a from c upward doing ways[a] += ways[a - c]. Swapping the two loops would count permutations instead.",
    ],
    solution:
      "function change(amount, coins) {\n  const ways = new Array(amount + 1).fill(0);\n  ways[0] = 1;\n  for (const coin of coins) {\n    for (let a = coin; a <= amount; a++) {\n      ways[a] += ways[a - coin];\n    }\n  }\n  return ways[amount];\n}\n",
    tests: [
      {
        name: "four ways to make five",
        body: "assert.equal(change(5, [1,2,5]), 4);",
      },
      {
        name: "order does not create new combinations",
        body: "assert.equal(change(4, [1,2,3]), 4);",
      },
      {
        name: "impossible amount",
        body: "assert.equal(change(3, [2]), 0);",
      },
      {
        name: "zero has exactly one combination",
        body: "assert.equal(change(0, [7]), 1);\nassert.equal(change(0, []), 1);",
      },
      {
        name: "one coin that fits exactly once",
        body: "assert.equal(change(10, [10]), 1);\nassert.equal(change(10, [1]), 1);",
      },
    ],
  },
  {
    id: "ex-longest-increasing-subsequence",
    chapter: "dsa-dp-1d",
    level: "intermediate",
    title: "Longest Increasing Subsequence",
    brief:
      "<p>Given an integer array <code>nums</code>, return the length of the longest <b>strictly increasing</b> subsequence.</p><ul><li>A subsequence keeps the original order but may skip any elements</li><li>Equal values do not count as increasing: <code>[7,7,7]</code> gives <code>1</code></li><li>An empty array gives <code>0</code></li><li>The classic table solution is O(n^2); the patience-sorting approach reaches O(n log n). Either passes here</li></ul>",
    starter: "function lengthOfLIS(nums) {\n  // TODO: length of the longest strictly increasing subsequence\n}\n",
    hints: [
      "The O(n^2) version: best[i] is the length of the longest increasing subsequence ENDING at i. For each i, look back at every j < i with nums[j] < nums[i].",
      "For O(n log n), keep an array tails where tails[k] is the smallest possible value that can end an increasing subsequence of length k+1. That array is always sorted.",
      "For each number, binary search tails for the first entry that is >= it and overwrite it; if there is none, append. The answer is the final length of tails — note that tails is not itself a valid subsequence, only its length matters.",
    ],
    solution:
      "function lengthOfLIS(nums) {\n  const tails = [];\n  for (const value of nums) {\n    let lo = 0;\n    let hi = tails.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (tails[mid] < value) lo = mid + 1;\n      else hi = mid;\n    }\n    if (lo === tails.length) tails.push(value);\n    else tails[lo] = value;\n  }\n  return tails.length;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.equal(lengthOfLIS([10,9,2,5,3,7,101,18]), 4);",
      },
      {
        name: "duplicates inside the run",
        body: "assert.equal(lengthOfLIS([0,1,0,3,2,3]), 4);",
      },
      {
        name: "all equal values",
        body: "assert.equal(lengthOfLIS([7,7,7,7]), 1);",
      },
      {
        name: "empty and single element",
        body: "assert.equal(lengthOfLIS([]), 0);\nassert.equal(lengthOfLIS([4]), 1);\nassert.equal(lengthOfLIS([5,4,3,2,1]), 1);",
      },
      {
        name: "one thousand values in descending blocks of five",
        body: "const nums = [];\nfor (let block = 0; block < 200; block++) {\n  for (let j = 4; j >= 0; j--) nums.push(block * 5 + j);\n}\nassert.equal(nums.length, 1000);\nassert.equal(lengthOfLIS(nums), 200);",
      },
    ],
  },
  {
    id: "ex-word-break",
    chapter: "dsa-dp-1d",
    level: "intermediate",
    title: "Word Break",
    brief:
      "<p>Given a string <code>s</code> and an array of words <code>wordDict</code>, return <code>true</code> if <code>s</code> can be split into a sequence of one or more dictionary words.</p><ul><li>A dictionary word may be reused any number of times</li><li>The whole string must be consumed, with no leftovers</li><li>An empty string is trivially breakable, so return <code>true</code></li><li>Plain backtracking is exponential on adversarial inputs — memoise or build a table</li></ul>",
    starter: "function wordBreak(s, wordDict) {\n  // TODO: can s be split entirely into dictionary words?\n}\n",
    hints: [
      "Let ok[i] mean 'the first i characters of s can be split'. ok[0] is true because the empty prefix is fine.",
      "ok[i] is true when there is some j < i where ok[j] is true AND the slice s.slice(j, i) is in the dictionary. Put the dictionary in a Set for O(1) lookups.",
      "Fill i from 1 to s.length and return ok[s.length]. Every prefix is computed once, which is what kills the exponential blow-up on inputs like 'aaaa...b'.",
    ],
    solution:
      "function wordBreak(s, wordDict) {\n  const words = new Set(wordDict);\n  const ok = new Array(s.length + 1).fill(false);\n  ok[0] = true;\n  for (let i = 1; i <= s.length; i++) {\n    for (let j = 0; j < i; j++) {\n      if (ok[j] && words.has(s.slice(j, i))) {\n        ok[i] = true;\n        break;\n      }\n    }\n  }\n  return ok[s.length];\n}\n",
    tests: [
      {
        name: "two words end to end",
        body: "assert.equal(wordBreak('leetcode', ['leet','code']), true);",
      },
      {
        name: "a word reused",
        body: "assert.equal(wordBreak('applepenapple', ['apple','pen']), true);",
      },
      {
        name: "leftover characters mean false",
        body: "assert.equal(wordBreak('catsandog', ['cats','dog','sand','and','cat']), false);",
      },
      {
        name: "empty string is breakable",
        body: "assert.equal(wordBreak('', ['a']), true);\nassert.equal(wordBreak('a', []), false);",
      },
      {
        name: "the adversarial all-a string stays fast",
        body: "let s = '';\nfor (let i = 0; i < 40; i++) s += 'a';\ns += 'b';\nassert.equal(wordBreak(s, ['a','aa','aaa','aaaa','aaaaa']), false);",
      },
    ],
  },
  {
    id: "ex-decode-ways",
    chapter: "dsa-dp-1d",
    level: "intermediate",
    title: "Decode Ways",
    brief:
      "<p>A message of letters was encoded by mapping <code>'A'</code> to <code>1</code> up to <code>'Z'</code> to <code>26</code> and concatenating the numbers. Given the digit string <code>s</code>, return how many ways it can be decoded back into letters.</p><ul><li><code>'12'</code> gives <code>2</code>: <code>AB</code> (1 2) or <code>L</code> (12)</li><li>A single digit only decodes if it is <code>1</code>–<code>9</code> — a lone <code>'0'</code> is invalid</li><li>A pair of digits only decodes if it reads <code>10</code>–<code>26</code>, so leading zeros like <code>'06'</code> are invalid</li><li>If the string cannot be decoded at all, return <code>0</code>. The empty string returns <code>0</code></li></ul>",
    starter: "function numDecodings(s) {\n  // TODO: how many ways can this digit string be decoded\n}\n",
    hints: [
      "Think of it as climbing stairs with two guards: from position i you may consume one digit or two, but only if the piece you consume is a legal code.",
      "Let ways[i] be the number of decodings of the first i characters, with ways[0] = 1. Add ways[i-1] when s[i-1] is not '0', and add ways[i-2] when the two-digit slice sits between 10 and 26.",
      "'0' is the whole difficulty. It contributes nothing on its own, so a '0' that is not preceded by a 1 or a 2 makes the entire answer 0.",
    ],
    solution:
      "function numDecodings(s) {\n  if (s.length === 0) return 0;\n  const ways = new Array(s.length + 1).fill(0);\n  ways[0] = 1;\n  for (let i = 1; i <= s.length; i++) {\n    if (s[i - 1] !== '0') ways[i] += ways[i - 1];\n    if (i >= 2) {\n      const pair = Number(s.slice(i - 2, i));\n      if (pair >= 10 && pair <= 26) ways[i] += ways[i - 2];\n    }\n  }\n  return ways[s.length];\n}\n",
    tests: [
      {
        name: "two readings of 12",
        body: "assert.equal(numDecodings('12'), 2);",
      },
      {
        name: "three readings of 226",
        body: "assert.equal(numDecodings('226'), 3);",
      },
      {
        name: "leading and lone zeros are invalid",
        body: "assert.equal(numDecodings('06'), 0);\nassert.equal(numDecodings('0'), 0);\nassert.equal(numDecodings('100'), 0);",
      },
      {
        name: "a zero forced into a pair",
        body: "assert.equal(numDecodings('10'), 1);\nassert.equal(numDecodings('2101'), 1);",
      },
      {
        name: "longer string and the empty string",
        body: "assert.equal(numDecodings('11106'), 2);\nassert.equal(numDecodings(''), 0);",
      },
    ],
  },
  {
    id: "ex-maximum-product-subarray",
    chapter: "dsa-dp-1d",
    level: "intermediate",
    title: "Maximum Product Subarray",
    brief:
      "<p>Given an integer array <code>nums</code>, return the largest product achievable by any <b>contiguous</b>, non-empty subarray.</p><ul><li>Negative numbers flip the sign, so today's worst product can become tomorrow's best</li><li>A zero resets any running product</li><li>A single element is a valid subarray, so an all-negative array still has an answer</li></ul>",
    starter: "function maxProduct(nums) {\n  // TODO: largest product of a contiguous non-empty subarray\n}\n",
    hints: [
      "Unlike maximum sum, tracking only the best running product fails: multiplying a large negative by another negative produces a large positive.",
      "So carry TWO running values as you sweep — the maximum product ending here and the minimum product ending here.",
      "At each element the three candidates are the element alone, element * previousMax, and element * previousMin. Take the max of those for the new max and the min for the new min, computing both from the OLD pair.",
    ],
    solution:
      "function maxProduct(nums) {\n  if (nums.length === 0) return 0;\n  let best = nums[0];\n  let curMax = nums[0];\n  let curMin = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    const value = nums[i];\n    const a = curMax * value;\n    const b = curMin * value;\n    curMax = Math.max(value, a, b);\n    curMin = Math.min(value, a, b);\n    if (curMax > best) best = curMax;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "positive run",
        body: "assert.equal(maxProduct([2,3,-2,4]), 6);",
      },
      {
        name: "a zero caps the answer",
        body: "assert.equal(maxProduct([-2,0,-1]), 0);",
      },
      {
        name: "two negatives make a positive",
        body: "assert.equal(maxProduct([-2,3,-4]), 24);\nassert.equal(maxProduct([2,-5,-2,-4,3]), 24);",
      },
      {
        name: "all negative, single element wins",
        body: "assert.equal(maxProduct([-2]), -2);\nassert.equal(maxProduct([-1,-2,-9,-6]), 108);",
      },
      {
        name: "leading zero",
        body: "assert.equal(maxProduct([0,2]), 2);\nassert.equal(maxProduct([-2,0]), 0);",
      },
    ],
  },
  {
    id: "ex-partition-equal-subset-sum",
    chapter: "dsa-dp-1d",
    level: "advanced",
    title: "Partition Equal Subset Sum",
    brief:
      "<p>Given an array <code>nums</code> of positive integers, return <code>true</code> if it can be split into two groups whose sums are equal.</p><ul><li>Every element must land in exactly one of the two groups</li><li>If the total is <b>odd</b> the answer is <code>false</code> immediately — no split can halve it</li><li>Otherwise the question reduces to: is there a subset summing to <code>total / 2</code>?</li></ul>",
    starter: "function canPartition(nums) {\n  // TODO: can nums be split into two groups of equal sum?\n}\n",
    hints: [
      "Check the total first. If it is odd, stop — no arrangement can work, and it costs one pass to find out.",
      "Otherwise this is a subset-sum decision problem with target = total / 2. Keep a boolean array reachable[0..target], with reachable[0] = true.",
      "For each number, update the array from target DOWN to that number: reachable[t] = reachable[t] || reachable[t - num]. Sweeping downward is what stops one number being used twice.",
    ],
    solution:
      "function canPartition(nums) {\n  let total = 0;\n  for (const n of nums) total += n;\n  if (total % 2 !== 0) return false;\n  const target = total / 2;\n  const reachable = new Array(target + 1).fill(false);\n  reachable[0] = true;\n  for (const n of nums) {\n    for (let t = target; t >= n; t--) {\n      if (reachable[t - n]) reachable[t] = true;\n    }\n  }\n  return reachable[target];\n}\n",
    tests: [
      {
        name: "splits into eleven and eleven",
        body: "assert.equal(canPartition([1,5,11,5]), true);",
      },
      {
        name: "an odd total is rejected outright",
        body: "assert.equal(canPartition([1,2,3,5]), false);\nassert.equal(canPartition([1]), false);",
      },
      {
        name: "even total but no valid subset",
        body: "assert.equal(canPartition([2,2,3,5]), false);",
      },
      {
        name: "trivial pair",
        body: "assert.equal(canPartition([1,1]), true);\nassert.equal(canPartition([1,2]), false);",
      },
      {
        name: "many equal values",
        body: "assert.equal(canPartition([100,100,100,100,100,100,100,100]), true);\nassert.equal(canPartition([3,3,3,4,5]), true);",
      },
    ],
  },
  {
    id: "ex-unique-paths",
    chapter: "dsa-dp-2d",
    level: "beginner",
    title: "Unique Paths",
    brief:
      "<p>A robot starts in the top-left cell of an <code>m x n</code> grid and wants to reach the bottom-right cell. It may only move <b>right</b> or <b>down</b>. Return how many distinct paths there are.</p><ul><li><code>uniquePaths(3, 7)</code> is <code>28</code></li><li>A single row or a single column has exactly <code>1</code> path</li><li><code>m</code> is the number of rows and <code>n</code> the number of columns</li></ul>",
    starter:
      "function uniquePaths(m, n) {\n  // TODO: count the right/down paths from the top-left to the bottom-right\n}\n",
    hints: [
      "You can only arrive at a cell from the cell above it or the cell to its left, so paths(r, c) = paths(r-1, c) + paths(r, c-1).",
      "The whole top row and the whole left column have exactly one path each — that is your base case, and it also handles a 1 x n grid for free.",
      "Fill a table row by row from the top-left. You can even collapse it to a single row of length n, adding the value on the left into each slot in place.",
    ],
    solution:
      "function uniquePaths(m, n) {\n  const row = new Array(n).fill(1);\n  for (let r = 1; r < m; r++) {\n    for (let c = 1; c < n; c++) {\n      row[c] = row[c] + row[c - 1];\n    }\n  }\n  return row[n - 1];\n}\n",
    tests: [
      {
        name: "three by seven",
        body: "assert.equal(uniquePaths(3, 7), 28);",
      },
      {
        name: "three by two",
        body: "assert.equal(uniquePaths(3, 2), 3);",
      },
      {
        name: "a single cell",
        body: "assert.equal(uniquePaths(1, 1), 1);",
      },
      {
        name: "a single row or column",
        body: "assert.equal(uniquePaths(1, 10), 1);\nassert.equal(uniquePaths(10, 1), 1);",
      },
      {
        name: "a square grid",
        body: "assert.equal(uniquePaths(10, 10), 48620);",
      },
    ],
  },
  {
    id: "ex-unique-paths-ii",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Unique Paths II",
    brief:
      "<p>Same right-and-down robot, but now the grid <code>obstacleGrid</code> marks blocked cells with <code>1</code> and free cells with <code>0</code>. Return the number of distinct paths from the top-left to the bottom-right.</p><ul><li>The robot may never enter a blocked cell</li><li>If the start or the finish is blocked, the answer is <code>0</code></li><li>An obstacle in the top row blocks everything to its right in that row, and likewise down the left column</li></ul>",
    starter:
      "function uniquePathsWithObstacles(obstacleGrid) {\n  // TODO: count right/down paths that avoid every cell marked 1\n}\n",
    hints: [
      "Same recurrence as Unique Paths — a cell's count is the sum of the counts above and to the left — with one extra rule.",
      "A blocked cell simply has a count of 0. Set it to 0 before the additions and the zero propagates on its own; you do not need special row or column logic.",
      "Seed the start cell with 1 (or 0 if it is blocked). Using a single rolling row works here too, as long as you zero out blocked positions as you pass them.",
    ],
    solution:
      "function uniquePathsWithObstacles(obstacleGrid) {\n  const rows = obstacleGrid.length;\n  if (rows === 0) return 0;\n  const cols = obstacleGrid[0].length;\n  if (cols === 0) return 0;\n  const row = new Array(cols).fill(0);\n  row[0] = obstacleGrid[0][0] === 1 ? 0 : 1;\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (obstacleGrid[r][c] === 1) {\n        row[c] = 0;\n      } else if (c > 0) {\n        row[c] = row[c] + row[c - 1];\n      }\n    }\n  }\n  return row[cols - 1];\n}\n",
    tests: [
      {
        name: "one obstacle in the middle",
        body: "const grid = [\n  [0,0,0],\n  [0,1,0],\n  [0,0,0],\n];\nassert.equal(uniquePathsWithObstacles(grid), 2);",
      },
      {
        name: "obstacle forces a single route",
        body: "assert.equal(uniquePathsWithObstacles([[0,1],[0,0]]), 1);",
      },
      {
        name: "blocked start or finish",
        body: "assert.equal(uniquePathsWithObstacles([[1]]), 0);\nassert.equal(uniquePathsWithObstacles([[0,0],[0,1]]), 0);",
      },
      {
        name: "a wall across the grid",
        body: "const grid = [\n  [0,0],\n  [1,1],\n  [0,0],\n];\nassert.equal(uniquePathsWithObstacles(grid), 0);",
      },
      {
        name: "no obstacles behaves like Unique Paths",
        body: "const grid = [\n  [0,0,0],\n  [0,0,0],\n  [0,0,0],\n];\nassert.equal(uniquePathsWithObstacles(grid), 6);\nassert.equal(uniquePathsWithObstacles([[0]]), 1);",
      },
    ],
  },
  {
    id: "ex-minimum-path-sum",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Minimum Path Sum",
    brief:
      "<p>Given a <code>grid</code> of non-negative numbers, find a path from the top-left to the bottom-right that minimises the sum of the numbers along it, and return that sum.</p><ul><li>You may only move <b>right</b> or <b>down</b></li><li>Both the start and the finish cells count towards the total</li><li>A greedy 'always step to the smaller neighbour' rule is <em>not</em> correct</li></ul>",
    starter: "function minPathSum(grid) {\n  // TODO: smallest sum along a right/down path to the bottom-right\n}\n",
    hints: [
      "The cheapest way to stand on a cell is its own value plus the cheaper of the two ways of arriving: from above or from the left.",
      "The top row and left column have only one way in, so each is just a running total — compute those first as base cases.",
      "Fill the rest row by row. You can overwrite the grid itself, or keep one rolling row of length cols.",
    ],
    solution:
      "function minPathSum(grid) {\n  const rows = grid.length;\n  const cols = grid[0].length;\n  const row = new Array(cols).fill(0);\n  row[0] = grid[0][0];\n  for (let c = 1; c < cols; c++) row[c] = row[c - 1] + grid[0][c];\n  for (let r = 1; r < rows; r++) {\n    row[0] = row[0] + grid[r][0];\n    for (let c = 1; c < cols; c++) {\n      row[c] = Math.min(row[c], row[c - 1]) + grid[r][c];\n    }\n  }\n  return row[cols - 1];\n}\n",
    tests: [
      {
        name: "the classic three by three",
        body: "const grid = [\n  [1,3,1],\n  [1,5,1],\n  [4,2,1],\n];\nassert.equal(minPathSum(grid), 7);",
      },
      {
        name: "two by three",
        body: "assert.equal(minPathSum([[1,2,3],[4,5,6]]), 12);",
      },
      {
        name: "a single cell",
        body: "assert.equal(minPathSum([[5]]), 5);",
      },
      {
        name: "single row and single column",
        body: "assert.equal(minPathSum([[1,2,3]]), 6);\nassert.equal(minPathSum([[1],[2],[3]]), 6);",
      },
      {
        name: "the greedy first step is the wrong one",
        body: "const grid = [\n  [1,2,100],\n  [1,100,100],\n  [1,1,1],\n];\nassert.equal(minPathSum(grid), 5);",
      },
    ],
  },
  {
    id: "ex-longest-common-subsequence",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Longest Common Subsequence",
    brief:
      "<p>Given two strings <code>a</code> and <code>b</code>, return the length of their longest common subsequence.</p><ul><li>A subsequence keeps the original order but may skip characters — <code>'ace'</code> is a subsequence of <code>'abcde'</code></li><li>It does <b>not</b> have to be contiguous, which is what separates this from longest common substring</li><li>If the two strings share nothing, return <code>0</code></li></ul>",
    starter:
      "function longestCommonSubsequence(a, b) {\n  // TODO: length of the longest subsequence common to both strings\n}\n",
    hints: [
      "Let table[i][j] be the answer for the first i characters of a and the first j characters of b. Any row or column of index 0 is 0, since an empty string shares nothing.",
      "When a[i-1] === b[j-1] those characters can be paired up: table[i][j] = table[i-1][j-1] + 1.",
      "When they differ you must drop one of them, so take max(table[i-1][j], table[i][j-1]). Fill the table left to right, top to bottom, and read the bottom-right corner.",
    ],
    solution:
      "function longestCommonSubsequence(a, b) {\n  const rows = a.length;\n  const cols = b.length;\n  let previous = new Array(cols + 1).fill(0);\n  for (let i = 1; i <= rows; i++) {\n    const current = new Array(cols + 1).fill(0);\n    for (let j = 1; j <= cols; j++) {\n      if (a[i - 1] === b[j - 1]) current[j] = previous[j - 1] + 1;\n      else current[j] = Math.max(previous[j], current[j - 1]);\n    }\n    previous = current;\n  }\n  return previous[cols];\n}\n",
    tests: [
      {
        name: "ace inside abcde",
        body: "assert.equal(longestCommonSubsequence('abcde', 'ace'), 3);",
      },
      {
        name: "identical strings",
        body: "assert.equal(longestCommonSubsequence('abc', 'abc'), 3);",
      },
      {
        name: "nothing in common",
        body: "assert.equal(longestCommonSubsequence('abc', 'def'), 0);",
      },
      {
        name: "empty strings",
        body: "assert.equal(longestCommonSubsequence('', 'abc'), 0);\nassert.equal(longestCommonSubsequence('abc', ''), 0);",
      },
      {
        name: "a single shared letter, far apart",
        body: "assert.equal(longestCommonSubsequence('bsbininm', 'jmjkbkjkv'), 1);\nassert.equal(longestCommonSubsequence('bl', 'yby'), 1);",
      },
    ],
  },
  {
    id: "ex-edit-distance",
    chapter: "dsa-dp-2d",
    level: "advanced",
    title: "Edit Distance",
    brief:
      "<p>Given two strings <code>word1</code> and <code>word2</code>, return the minimum number of operations needed to turn <code>word1</code> into <code>word2</code>.</p><ul><li>The allowed operations are <b>insert a character</b>, <b>delete a character</b> and <b>replace a character</b>, each costing 1</li><li>Turning <code>'horse'</code> into <code>'ros'</code> takes <code>3</code></li><li>If one string is empty the answer is the length of the other</li><li>Identical strings cost <code>0</code></li></ul>",
    starter:
      "function minDistance(word1, word2) {\n  // TODO: fewest insert/delete/replace operations to turn word1 into word2\n}\n",
    hints: [
      "Let table[i][j] be the distance between the first i characters of word1 and the first j of word2. The base cases are table[i][0] = i (delete everything) and table[0][j] = j (insert everything).",
      "If the current characters match, nothing needs doing: table[i][j] = table[i-1][j-1].",
      "If they differ, take 1 + the smallest of three neighbours — table[i-1][j-1] is a replace, table[i-1][j] is a delete, table[i][j-1] is an insert.",
    ],
    solution:
      "function minDistance(word1, word2) {\n  const rows = word1.length;\n  const cols = word2.length;\n  let previous = new Array(cols + 1).fill(0);\n  for (let j = 0; j <= cols; j++) previous[j] = j;\n  for (let i = 1; i <= rows; i++) {\n    const current = new Array(cols + 1).fill(0);\n    current[0] = i;\n    for (let j = 1; j <= cols; j++) {\n      if (word1[i - 1] === word2[j - 1]) {\n        current[j] = previous[j - 1];\n      } else {\n        current[j] = 1 + Math.min(previous[j - 1], previous[j], current[j - 1]);\n      }\n    }\n    previous = current;\n  }\n  return previous[cols];\n}\n",
    tests: [
      {
        name: "horse to ros",
        body: "assert.equal(minDistance('horse', 'ros'), 3);",
      },
      {
        name: "intention to execution",
        body: "assert.equal(minDistance('intention', 'execution'), 5);",
      },
      {
        name: "one side empty",
        body: "assert.equal(minDistance('', 'abc'), 3);\nassert.equal(minDistance('abc', ''), 3);\nassert.equal(minDistance('', ''), 0);",
      },
      {
        name: "identical strings cost nothing",
        body: "assert.equal(minDistance('same', 'same'), 0);",
      },
      {
        name: "pure insertions and a single replace",
        body: "assert.equal(minDistance('ab', 'abcd'), 2);\nassert.equal(minDistance('cat', 'cut'), 1);",
      },
    ],
  },
  {
    id: "ex-top-k-frequent",
    chapter: "dsa-hashing",
    level: "intermediate",
    title: "Top K Frequent Elements",
    brief:
      "<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k</code> most frequently occurring values.</p><ul><li>The answer may be returned in <b>any order</b></li><li><code>k</code> is always between 1 and the number of distinct values in <code>nums</code></li><li>The inputs guarantee the top <code>k</code> is unambiguous — there are no ties on the boundary</li></ul>",
    starter:
      "function topKFrequent(nums, k) {\n  // TODO: count how often each value appears, then take the k biggest counts\n}\n",
    hints: [
      "Two phases: first build a value -> count map in one pass, then pick winners from that map.",
      "Once you have the counts, you only care about the entries, not the original array. Turn the map into an array of [value, count] pairs.",
      "Sort those pairs by count descending and slice off the first k, mapping each pair back to its value.",
    ],
    solution:
      "function topKFrequent(nums, k) {\n  const counts = new Map();\n  for (const n of nums) counts.set(n, (counts.get(n) || 0) + 1);\n  return [...counts.entries()]\n    .sort((a, b) => b[1] - a[1])\n    .slice(0, k)\n    .map((pair) => pair[0]);\n}\n",
    tests: [
      {
        name: "picks the two most common",
        body: "const out = topKFrequent([1,1,1,2,2,3], 2).sort((a, b) => a - b);\nassert.deepEqual(out, [1, 2]);",
      },
      {
        name: "single element array",
        body: "assert.deepEqual(topKFrequent([1], 1), [1]);",
      },
      {
        name: "drops the least frequent value",
        body: "const out = topKFrequent([4,4,5,5,6], 2).sort((a, b) => a - b);\nassert.deepEqual(out, [4, 5]);",
      },
      {
        name: "k equals the number of distinct values",
        body: "const out = topKFrequent([1,2,3,4], 4).sort((a, b) => a - b);\nassert.deepEqual(out, [1, 2, 3, 4]);",
      },
      {
        name: "handles negative numbers",
        body: "const out = topKFrequent([-1,-1,-1,-2,-2,7], 2).sort((a, b) => a - b);\nassert.deepEqual(out, [-2, -1]);",
      },
    ],
  },
  {
    id: "ex-longest-consecutive-sequence",
    chapter: "dsa-hashing",
    level: "advanced",
    title: "Longest Consecutive Sequence",
    brief:
      "<p>Given an unsorted integer array <code>nums</code>, return the length of the longest run of consecutive integers you can form from its values. The values do not have to be adjacent in the array.</p><ul><li>Your algorithm must run in <b>O(n)</b> time — <em>sorting is not allowed</em></li><li>Duplicates count only once: <code>[1,2,2,3]</code> has a run of length 3</li><li>Negative numbers are allowed</li><li>An empty array returns <code>0</code></li></ul>",
    starter:
      "function longestConsecutive(nums) {\n  // TODO: find the longest run of consecutive values in O(n), without sorting\n}\n",
    hints: [
      "Put every value into a Set first. Membership tests are then O(1), which is what buys you the linear bound.",
      "Only start counting a run from a number that has no left neighbour — that is, a value x where x - 1 is not in the Set.",
      "Because every value is walked at most once as part of exactly one run, the total work stays O(n) even though there is a loop inside a loop.",
    ],
    solution:
      "function longestConsecutive(nums) {\n  const set = new Set(nums);\n  let best = 0;\n  for (const n of set) {\n    if (set.has(n - 1)) continue; // not the start of a run\n    let length = 1;\n    let current = n;\n    while (set.has(current + 1)) {\n      current++;\n      length++;\n    }\n    if (length > best) best = length;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "finds the scattered run",
        body: "assert.equal(longestConsecutive([100,4,200,1,3,2]), 4);",
      },
      {
        name: "empty array is zero",
        body: "assert.equal(longestConsecutive([]), 0);",
      },
      {
        name: "duplicates do not extend a run",
        body: "assert.equal(longestConsecutive([1,2,0,1]), 3);",
      },
      {
        name: "works with negative numbers",
        body: "assert.equal(longestConsecutive([-1,-2,-3,5,6]), 3);",
      },
      {
        name: "long interleaved run",
        body: "assert.equal(longestConsecutive([0,3,7,2,5,8,4,6,0,1]), 9);",
      },
    ],
  },
  {
    id: "ex-happy-number",
    chapter: "dsa-hashing",
    level: "beginner",
    title: "Happy Number",
    brief:
      "<p>A positive integer is <b>happy</b> if repeatedly replacing it with the sum of the squares of its digits eventually reaches <code>1</code>.</p><p>If the process never reaches <code>1</code> it loops forever in a cycle. Return <code>true</code> if <code>n</code> is happy, otherwise <code>false</code>.</p><ul><li><code>19</code> is happy: 1+81 = 82, 64+4 = 68, 36+64 = 100, 1+0+0 = 1</li><li><code>2</code> is not happy — it falls into a repeating cycle</li></ul>",
    starter:
      "function isHappy(n) {\n  // TODO: repeat the digit-square-sum step until you reach 1 or repeat yourself\n}\n",
    hints: [
      "Write the single step first: given a number, produce the sum of the squares of its digits (n % 10 gives the last digit, Math.floor(n / 10) drops it).",
      "The loop only ends two ways: you hit 1, or you see a number you have already seen. A Set of visited numbers detects the second case.",
    ],
    solution:
      "function isHappy(n) {\n  const step = (x) => {\n    let total = 0;\n    while (x > 0) {\n      const d = x % 10;\n      total += d * d;\n      x = Math.floor(x / 10);\n    }\n    return total;\n  };\n  const seen = new Set();\n  while (n !== 1 && !seen.has(n)) {\n    seen.add(n);\n    n = step(n);\n  }\n  return n === 1;\n}\n",
    tests: [
      {
        name: "19 is happy",
        body: "assert.equal(isHappy(19), true);",
      },
      {
        name: "2 is not happy",
        body: "assert.equal(isHappy(2), false);",
      },
      {
        name: "1 is trivially happy",
        body: "assert.equal(isHappy(1), true);",
      },
      {
        name: "7 is happy",
        body: "assert.equal(isHappy(7), true);",
      },
      {
        name: "116 is not happy",
        body: "assert.equal(isHappy(116), false);",
      },
    ],
  },
  {
    id: "ex-subarray-sum-equals-k",
    chapter: "dsa-arrays-strings",
    level: "advanced",
    title: "Subarray Sum Equals K",
    brief:
      "<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return the total number of <b>contiguous</b> subarrays whose elements sum to exactly <code>k</code>.</p><ul><li>Values may be negative, so you cannot use a sliding window</li><li>Different index ranges count separately even if they contain the same values</li><li>Target <b>O(n)</b> time using a running prefix sum and a hash map</li></ul>",
    starter:
      "function subarraySum(nums, k) {\n  // TODO: count contiguous subarrays summing to k in a single pass\n}\n",
    hints: [
      "The sum of nums[i..j] is prefix[j] - prefix[i-1]. So a subarray ending at j hits k exactly when some earlier prefix equals prefix[j] - k.",
      "Walk the array keeping a running sum and a Map from prefix-sum value -> how many times that prefix has occurred.",
      "Seed the map with { 0: 1 } so that a prefix which itself equals k is counted. Add the map's count for (running - k) to your answer BEFORE recording the current prefix.",
    ],
    solution:
      "function subarraySum(nums, k) {\n  const counts = new Map([[0, 1]]);\n  let running = 0;\n  let total = 0;\n  for (const n of nums) {\n    running += n;\n    total += counts.get(running - k) || 0;\n    counts.set(running, (counts.get(running) || 0) + 1);\n  }\n  return total;\n}\n",
    tests: [
      {
        name: "counts overlapping subarrays",
        body: "assert.equal(subarraySum([1,1,1], 2), 2);",
      },
      {
        name: "prefix that equals k counts",
        body: "assert.equal(subarraySum([1,2,3], 3), 2);",
      },
      {
        name: "handles negatives and a zero target",
        body: "assert.equal(subarraySum([1,-1,0], 0), 3);",
      },
      {
        name: "no subarray matches",
        body: "assert.equal(subarraySum([1,2,3], 7), 0);",
      },
      {
        name: "single element equal to k",
        body: "assert.equal(subarraySum([5], 5), 1);",
      },
    ],
  },
  {
    id: "ex-continuous-subarray-sum",
    chapter: "dsa-arrays-strings",
    level: "advanced",
    title: "Continuous Subarray Sum",
    brief:
      "<p>Given an array <code>nums</code> of non-negative integers and a positive integer <code>k</code>, return <code>true</code> if there is a contiguous subarray whose sum is a multiple of <code>k</code>.</p><ul><li>The subarray must have <b>length at least 2</b> — this is the whole trap</li><li><code>0</code> counts as a multiple of every <code>k</code>, so <code>[0,0]</code> with <code>k = 7</code> is <code>true</code></li><li>But <code>[1,0]</code> with <code>k = 2</code> is <code>false</code>: the only multiple of 2 in there is the single element <code>0</code>, and length 1 does not qualify</li><li>Target <b>O(n)</b> using prefix-sum remainders</li></ul>",
    starter:
      "function checkSubarraySum(nums, k) {\n  // TODO: is there a contiguous subarray of length >= 2 whose sum is a multiple of k?\n}\n",
    hints: [
      "sum(i..j) is a multiple of k exactly when prefix[j] and prefix[i-1] leave the SAME remainder when divided by k.",
      "So keep a Map from remainder -> the earliest index at which that remainder was seen, seeded with remainder 0 at index -1.",
      "When you meet a remainder you have seen before, only return true if the gap between the indices is at least 2 — and never overwrite a remainder's stored index, or you lose the earliest one.",
    ],
    solution:
      "function checkSubarraySum(nums, k) {\n  const firstIndex = new Map([[0, -1]]);\n  let running = 0;\n  for (let i = 0; i < nums.length; i++) {\n    running += nums[i];\n    const r = running % k;\n    if (firstIndex.has(r)) {\n      if (i - firstIndex.get(r) >= 2) return true;\n    } else {\n      firstIndex.set(r, i);\n    }\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "finds a multiple of k inside the array",
        body: "assert.equal(checkSubarraySum([23,2,4,6,7], 6), true);",
      },
      {
        name: "whole array sums to a multiple",
        body: "assert.equal(checkSubarraySum([23,2,6,4,7], 6), true);",
      },
      {
        name: "no qualifying subarray",
        body: "assert.equal(checkSubarraySum([23,2,6,4,7], 13), false);",
      },
      {
        name: "a lone zero does not count (length must be >= 2)",
        body: "assert.equal(checkSubarraySum([1,0], 2), false);",
      },
      {
        name: "two zeros do count",
        body: "assert.equal(checkSubarraySum([0,0], 7), true);\nassert.equal(checkSubarraySum([5,0,0], 3), true);",
      },
    ],
  },
  {
    id: "ex-max-size-subarray-sum-equals-k",
    chapter: "dsa-arrays-strings",
    level: "advanced",
    title: "Maximum Size Subarray Sum Equals K",
    brief:
      "<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return the length of the <b>longest</b> contiguous subarray that sums to exactly <code>k</code>.</p><ul><li>If no such subarray exists, return <code>0</code></li><li>Values may be negative and may be zero</li><li>Target <b>O(n)</b> time with a prefix sum and a hash map</li></ul>",
    starter:
      "function maxSubArrayLen(nums, k) {\n  // TODO: return the length of the longest contiguous subarray summing to k\n}\n",
    hints: [
      "A subarray ending at index j sums to k when some earlier prefix equals prefix[j] - k. Look that up in a Map instead of scanning backwards.",
      "You want the LONGEST subarray, so the map must store the FIRST index at which each prefix sum appeared — never overwrite an existing entry.",
      "Seed the map with prefix 0 at index -1 so a subarray starting at index 0 gets the right length: j - (-1) = j + 1.",
    ],
    solution:
      "function maxSubArrayLen(nums, k) {\n  const firstIndex = new Map([[0, -1]]);\n  let running = 0;\n  let best = 0;\n  for (let i = 0; i < nums.length; i++) {\n    running += nums[i];\n    if (firstIndex.has(running - k)) {\n      const length = i - firstIndex.get(running - k);\n      if (length > best) best = length;\n    }\n    if (!firstIndex.has(running)) firstIndex.set(running, i);\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "longest run starts at index 0",
        body: "assert.equal(maxSubArrayLen([1,-1,5,-2,3], 3), 4);",
      },
      {
        name: "longest run starts later",
        body: "assert.equal(maxSubArrayLen([-2,-1,2,1], 1), 2);",
      },
      {
        name: "no subarray sums to k",
        body: "assert.equal(maxSubArrayLen([1,2,3], 100), 0);",
      },
      {
        name: "zeros extend the answer",
        body: "assert.equal(maxSubArrayLen([0,0,0,4], 4), 4);",
      },
      {
        name: "empty array",
        body: "assert.equal(maxSubArrayLen([], 0), 0);",
      },
    ],
  },
  {
    id: "ex-contiguous-array",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Contiguous Array",
    brief:
      "<p>Given a binary array <code>nums</code> containing only <code>0</code> and <code>1</code>, return the length of the longest contiguous subarray that holds an <b>equal number</b> of zeros and ones.</p><ul><li>If no such subarray exists, return <code>0</code></li><li>The answer is always even</li><li>Target <b>O(n)</b> time</li></ul>",
    starter: "function findMaxLength(nums) {\n  // TODO: longest subarray with as many 0s as 1s\n}\n",
    hints: [
      "Counting two things is awkward. Re-map the problem: treat 0 as -1 and 1 as +1, and 'equal counts' becomes 'sums to zero'.",
      "Now it is the longest-subarray-summing-to-zero problem: keep a running total and a Map from total -> the first index where that total appeared.",
      "Seed the map with total 0 at index -1. When the running total repeats, the stretch between the two positions balances out.",
    ],
    solution:
      "function findMaxLength(nums) {\n  const firstIndex = new Map([[0, -1]]);\n  let running = 0;\n  let best = 0;\n  for (let i = 0; i < nums.length; i++) {\n    running += nums[i] === 1 ? 1 : -1;\n    if (firstIndex.has(running)) {\n      const length = i - firstIndex.get(running);\n      if (length > best) best = length;\n    } else {\n      firstIndex.set(running, i);\n    }\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "simple pair",
        body: "assert.equal(findMaxLength([0,1]), 2);",
      },
      {
        name: "ignores the trailing odd one out",
        body: "assert.equal(findMaxLength([0,1,0]), 2);",
      },
      {
        name: "longest balanced stretch spans most of the array",
        body: "assert.equal(findMaxLength([0,0,1,0,0,0,1,1]), 6);",
      },
      {
        name: "never balances",
        body: "assert.equal(findMaxLength([1,1,1]), 0);",
      },
      {
        name: "empty array",
        body: "assert.equal(findMaxLength([]), 0);",
      },
    ],
  },
  {
    id: "ex-find-pivot-index",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Find Pivot Index",
    brief:
      "<p>Given an integer array <code>nums</code>, return the leftmost <b>pivot index</b>: the index where the sum of all numbers strictly to its left equals the sum of all numbers strictly to its right.</p><ul><li>The element at the pivot itself belongs to neither side</li><li>The sum of an empty side is <code>0</code>, so index <code>0</code> is a valid answer</li><li>If there is no pivot index, return <code>-1</code></li></ul>",
    starter:
      "function pivotIndex(nums) {\n  // TODO: return the leftmost index where the left sum equals the right sum\n}\n",
    hints: [
      "Recomputing both sides at every index is O(n^2). Compute the total of the whole array once up front.",
      "Sweep left to right carrying the running left sum. The right sum at index i is then total - leftSum - nums[i], with no extra loop.",
    ],
    solution:
      "function pivotIndex(nums) {\n  let total = 0;\n  for (const n of nums) total += n;\n  let left = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (left === total - left - nums[i]) return i;\n    left += nums[i];\n  }\n  return -1;\n}\n",
    tests: [
      {
        name: "pivot in the middle",
        body: "assert.equal(pivotIndex([1,7,3,6,5,6]), 3);",
      },
      {
        name: "no pivot exists",
        body: "assert.equal(pivotIndex([1,2,3]), -1);",
      },
      {
        name: "pivot at index 0 with an empty left side",
        body: "assert.equal(pivotIndex([2,1,-1]), 0);",
      },
      {
        name: "single element is always a pivot",
        body: "assert.equal(pivotIndex([5]), 0);",
      },
      {
        name: "empty array has no pivot",
        body: "assert.equal(pivotIndex([]), -1);",
      },
    ],
  },
  {
    id: "ex-range-sum-query-immutable",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Range Sum Query — Immutable",
    brief:
      "<p>Build a class <code>NumArray</code> that answers repeated range-sum queries over a fixed array.</p><ul><li><code>new NumArray(nums)</code> — the constructor may do <b>O(n)</b> work</li><li><code>sumRange(i, j)</code> — returns the sum of <code>nums[i]</code> through <code>nums[j]</code> <b>inclusive</b>, and must run in <b>O(1)</b></li><li>The array never changes after construction, so all the work belongs in the constructor</li><li><code>sumRange(i, i)</code> returns a single element</li></ul>",
    starter:
      "class NumArray {\n  constructor(nums) {\n    // TODO: precompute whatever sumRange needs\n  }\n\n  sumRange(i, j) {\n    // TODO: answer in O(1)\n  }\n}\n",
    hints: [
      "Looping from i to j inside sumRange is O(n) per query. The constructor is allowed to be O(n) — spend the time there instead.",
      "Precompute prefix sums: prefix[t] = the sum of the first t elements. Then sum(i..j) = prefix[j + 1] - prefix[i].",
      "Making the prefix array length n + 1 with a leading 0 removes the special case for i === 0.",
    ],
    solution:
      "class NumArray {\n  constructor(nums) {\n    this.prefix = new Array(nums.length + 1).fill(0);\n    for (let t = 0; t < nums.length; t++) {\n      this.prefix[t + 1] = this.prefix[t] + nums[t];\n    }\n  }\n\n  sumRange(i, j) {\n    return this.prefix[j + 1] - this.prefix[i];\n  }\n}\n",
    tests: [
      {
        name: "sums an interior range",
        body: "const na = new NumArray([-2,0,3,-5,2,-1]);\nassert.equal(na.sumRange(0, 2), 1);\nassert.equal(na.sumRange(2, 5), -1);\nassert.equal(na.sumRange(0, 5), -3);",
      },
      {
        name: "single element range",
        body: "const na = new NumArray([1,2,3,4]);\nassert.equal(na.sumRange(2, 2), 3);\nassert.equal(na.sumRange(0, 0), 1);",
      },
      {
        name: "repeated queries stay consistent",
        body: "const na = new NumArray([5,5,5,5]);\nassert.equal(na.sumRange(1, 3), 15);\nassert.equal(na.sumRange(1, 3), 15);\nassert.equal(na.sumRange(0, 3), 20);",
      },
      {
        name: "whole array of one element",
        body: "const na = new NumArray([42]);\nassert.equal(na.sumRange(0, 0), 42);",
      },
      {
        name: "two instances do not share state",
        body: "const a = new NumArray([1,1,1]);\nconst b = new NumArray([10,10,10]);\nassert.equal(a.sumRange(0, 2), 3);\nassert.equal(b.sumRange(0, 2), 30);",
      },
    ],
  },
  {
    id: "ex-ransom-note",
    chapter: "dsa-hashing",
    level: "beginner",
    title: "Ransom Note",
    brief:
      "<p>Given two strings <code>note</code> and <code>magazine</code>, return <code>true</code> if <code>note</code> can be built using only letters cut out of <code>magazine</code>.</p><ul><li>Each character in <code>magazine</code> may be used <b>at most once</b></li><li>Both strings contain lowercase letters only</li><li>An empty note is always buildable</li></ul>",
    starter:
      "function canConstruct(note, magazine) {\n  // TODO: can note be spelled from magazine's letters, each used at most once?\n}\n",
    hints: [
      "This is a counting problem, not a searching problem. How many of each letter does the magazine supply, and how many does the note demand?",
      "Build a Map of letter -> count for the magazine, then walk the note decrementing. The moment a letter is missing or its count hits zero, the answer is false.",
    ],
    solution:
      "function canConstruct(note, magazine) {\n  const supply = new Map();\n  for (const ch of magazine) supply.set(ch, (supply.get(ch) || 0) + 1);\n  for (const ch of note) {\n    const left = supply.get(ch) || 0;\n    if (left === 0) return false;\n    supply.set(ch, left - 1);\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "missing letter",
        body: "assert.equal(canConstruct('a', 'b'), false);",
      },
      {
        name: "enough copies of a repeated letter",
        body: "assert.equal(canConstruct('aa', 'aab'), true);",
      },
      {
        name: "letters may not be reused",
        body: "assert.equal(canConstruct('aa', 'ab'), false);",
      },
      {
        name: "empty note is always buildable",
        body: "assert.equal(canConstruct('', 'abc'), true);",
      },
      {
        name: "empty magazine cannot build a note",
        body: "assert.equal(canConstruct('a', ''), false);",
      },
    ],
  },
  {
    id: "ex-intersection-of-two-arrays",
    chapter: "dsa-hashing",
    level: "beginner",
    title: "Intersection of Two Arrays",
    brief:
      "<p>Given two integer arrays <code>nums1</code> and <code>nums2</code>, return an array of the values that appear in <b>both</b>.</p><ul><li>Each value appears <b>at most once</b> in the result, however often it occurs in the inputs</li><li>The result may be returned in <b>any order</b></li><li>If there is no overlap, return an empty array</li></ul>",
    starter: "function intersection(nums1, nums2) {\n  // TODO: return the distinct values present in both arrays\n}\n",
    hints: [
      "Checking `nums2.includes(x)` inside a loop is O(n * m). What structure answers 'is this value present?' in O(1)?",
      "Put nums1 into a Set, then filter the distinct values of nums2 against it — a Set on the output side is what enforces 'at most once'.",
    ],
    solution:
      "function intersection(nums1, nums2) {\n  const first = new Set(nums1);\n  const out = new Set();\n  for (const n of nums2) {\n    if (first.has(n)) out.add(n);\n  }\n  return [...out];\n}\n",
    tests: [
      {
        name: "collapses duplicates to one value",
        body: "const out = intersection([1,2,2,1], [2,2]).sort((a, b) => a - b);\nassert.deepEqual(out, [2]);",
      },
      {
        name: "several shared values",
        body: "const out = intersection([4,9,5], [9,4,9,8,4]).sort((a, b) => a - b);\nassert.deepEqual(out, [4, 9]);",
      },
      {
        name: "no overlap",
        body: "assert.deepEqual(intersection([1,2], [3,4]), []);",
      },
      {
        name: "empty input",
        body: "assert.deepEqual(intersection([], [1,2,3]), []);",
      },
      {
        name: "handles negatives and zero",
        body: "const out = intersection([0,-1,-1,3], [-1,0,0]).sort((a, b) => a - b);\nassert.deepEqual(out, [-1, 0]);",
      },
    ],
  },
  {
    id: "ex-intersection-of-two-arrays-ii",
    chapter: "dsa-hashing",
    level: "intermediate",
    title: "Intersection of Two Arrays II",
    brief:
      "<p>Given two integer arrays <code>nums1</code> and <code>nums2</code>, return the values they share <b>including multiplicity</b>.</p><ul><li>A value must appear in the result as many times as it appears in <em>both</em> arrays — that is, the smaller of its two counts</li><li>So <code>[1,2,2,1]</code> and <code>[2,2]</code> give <code>[2,2]</code></li><li>The result may be returned in <b>any order</b></li></ul>",
    starter:
      "function intersect(nums1, nums2) {\n  // TODO: return shared values, each repeated min(count in nums1, count in nums2) times\n}\n",
    hints: [
      "A Set loses multiplicity. You need a Map from value -> remaining count.",
      "Count nums1 into a Map. Then walk nums2: if the map still has a positive count for that value, push it to the output and decrement.",
      "Decrementing is what caps the output at the smaller of the two counts — no min() call needed.",
    ],
    solution:
      "function intersect(nums1, nums2) {\n  const counts = new Map();\n  for (const n of nums1) counts.set(n, (counts.get(n) || 0) + 1);\n  const out = [];\n  for (const n of nums2) {\n    const left = counts.get(n) || 0;\n    if (left > 0) {\n      out.push(n);\n      counts.set(n, left - 1);\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "keeps both copies",
        body: "const out = intersect([1,2,2,1], [2,2]).sort((a, b) => a - b);\nassert.deepEqual(out, [2, 2]);",
      },
      {
        name: "multiplicity is capped by the smaller count",
        body: "const out = intersect([4,9,5,9], [9,4,9,8,4]).sort((a, b) => a - b);\nassert.deepEqual(out, [4, 9, 9]);",
      },
      {
        name: "one copy available, one copy returned",
        body: "const out = intersect([1], [1,1,1]).sort((a, b) => a - b);\nassert.deepEqual(out, [1]);",
      },
      {
        name: "no overlap",
        body: "assert.deepEqual(intersect([1,2], [3,4]), []);",
      },
      {
        name: "empty input",
        body: "assert.deepEqual(intersect([], [1,2,3]), []);",
      },
    ],
  },
  {
    id: "ex-first-unique-character",
    chapter: "dsa-hashing",
    level: "beginner",
    title: "First Unique Character in a String",
    brief:
      "<p>Given a string <code>s</code>, return the index of the first character that appears exactly once. If every character repeats, return <code>-1</code>.</p><ul><li><code>s</code> contains lowercase letters only</li><li><code>'leetcode'</code> gives <code>0</code>; <code>'loveleetcode'</code> gives <code>2</code></li><li>An empty string returns <code>-1</code></li></ul>",
    starter:
      "function firstUniqChar(s) {\n  // TODO: index of the first character that appears exactly once, or -1\n}\n",
    hints: [
      "You cannot know whether the first character is unique until you have seen the whole string. That points at two passes.",
      "Pass one builds a character -> count map. Pass two walks the string in order and returns the index of the first character whose count is 1.",
    ],
    solution:
      "function firstUniqChar(s) {\n  const counts = new Map();\n  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);\n  for (let i = 0; i < s.length; i++) {\n    if (counts.get(s[i]) === 1) return i;\n  }\n  return -1;\n}\n",
    tests: [
      {
        name: "first character is unique",
        body: "assert.equal(firstUniqChar('leetcode'), 0);",
      },
      {
        name: "unique character appears later",
        body: "assert.equal(firstUniqChar('loveleetcode'), 2);",
      },
      {
        name: "everything repeats",
        body: "assert.equal(firstUniqChar('aabb'), -1);",
      },
      {
        name: "empty string",
        body: "assert.equal(firstUniqChar(''), -1);",
      },
      {
        name: "only the last character is unique",
        body: "assert.equal(firstUniqChar('aabbc'), 4);",
      },
    ],
  },
  {
    id: "ex-word-frequency-top-k",
    chapter: "dsa-hashing",
    level: "intermediate",
    title: "Word Frequency Top-K",
    brief:
      "<p>Given a block of <code>text</code> and an integer <code>k</code>, return the <code>k</code> most frequent words, most frequent first.</p><ul><li>A <b>word</b> is a maximal run of letters. Everything else (spaces, punctuation, digits, newlines) is a separator</li><li>Comparison is case-insensitive, and words are returned <b>lowercased</b></li><li><b>Ordering:</b> higher frequency first; words with the same frequency are ordered <em>alphabetically</em></li><li>If the text has fewer than <code>k</code> distinct words, return all of them</li></ul>",
    starter:
      "function topKWords(text, k) {\n  // TODO: return the k most frequent words, ties broken alphabetically\n}\n",
    hints: [
      "Normalise before counting: lowercase the text, then split on any run of non-letter characters and drop the empty pieces.",
      "Count into a Map, then sort the [word, count] entries. The comparator needs two keys, not one.",
      "Compare counts descending first; when they are equal, fall through to comparing the words ascending. Then slice off the first k.",
    ],
    solution:
      "function topKWords(text, k) {\n  const words = text.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 0);\n  const counts = new Map();\n  for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);\n  return [...counts.entries()]\n    .sort((a, b) => {\n      if (b[1] !== a[1]) return b[1] - a[1];\n      return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;\n    })\n    .slice(0, k)\n    .map((pair) => pair[0]);\n}\n",
    tests: [
      {
        name: "orders by frequency",
        body: "assert.deepEqual(topKWords('the day is sunny the the the sunny is is', 3), ['the', 'is', 'sunny']);",
      },
      {
        name: "ties break alphabetically",
        body: "assert.deepEqual(topKWords('b a b a c', 3), ['a', 'b', 'c']);",
      },
      {
        name: "punctuation and case are ignored",
        body: "assert.deepEqual(topKWords('Cats, cats; DOGS! dogs? cats.', 2), ['cats', 'dogs']);",
      },
      {
        name: "k larger than the number of distinct words",
        body: "assert.deepEqual(topKWords('hello world hello', 10), ['hello', 'world']);",
      },
      {
        name: "empty text",
        body: "assert.deepEqual(topKWords('', 3), []);",
      },
    ],
  },
  {
    id: "ex-reverse-linked-list",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Reverse Linked List",
    brief:
      "<p>Given the <code>head</code> of a singly linked list, flip every <code>next</code> pointer so the list runs the other way, and return the new head.</p><ul><li>Reuse the existing nodes — do not allocate a second list</li><li>An empty list reverses to an empty list (<code>null</code>)</li><li>A node looks like <code>{ val, next }</code></li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction reverseList(head) {\n  // TODO: walk the list once, re-pointing each node at the one before it\n}\n",
    hints: [
      "You need three things in flight at a time: the node before, the node you are on, and the node after.",
      "Before you overwrite node.next, save it — otherwise you lose the rest of the list.",
      "Start prev at null. When the walk finishes, prev is sitting on the last node you visited, which is the new head.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction reverseList(head) {\n  let prev = null;\n  let cur = head;\n  while (cur) {\n    const next = cur.next;\n    cur.next = prev;\n    prev = cur;\n    cur = next;\n  }\n  return prev;\n}\n",
    tests: [
      {
        name: "reverses a five node list",
        body: "assert.deepEqual(toArray(reverseList(build([1,2,3,4,5]))), [5,4,3,2,1]);",
      },
      {
        name: "reverses a two node list",
        body: "assert.deepEqual(toArray(reverseList(build([1,2]))), [2,1]);",
      },
      {
        name: "single node is unchanged",
        body: "assert.deepEqual(toArray(reverseList(build([9]))), [9]);",
      },
      {
        name: "empty list returns null",
        body: "assert.equal(reverseList(null), null);",
      },
      {
        name: "reuses the original nodes",
        body: "const head = build([1,2,3]);\nconst tail = head.next.next;\nconst out = reverseList(head);\nassert.ok(out === tail, 'new head should be the original tail node');\nassert.equal(head.next, null);",
      },
    ],
  },
  {
    id: "ex-merge-two-sorted-lists",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Merge Two Sorted Lists",
    brief:
      "<p>You are handed the heads of two linked lists, each already sorted in non-decreasing order. Splice them into one sorted list and return its head.</p><ul><li>Build the answer by re-linking the existing nodes, not by copying values into an array</li><li>Either list may be empty</li><li>Equal values may appear in either order relative to each other</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction mergeTwoLists(a, b) {\n  // TODO: repeatedly take the smaller of the two front nodes\n}\n",
    hints: [
      "The smallest remaining value is always at the front of one list or the other — you never have to search.",
      "A throwaway 'dummy' node to hang the result off removes the special case of choosing the very first node.",
      "When one list runs out, the rest of the other is already sorted — attach it whole instead of looping.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction mergeTwoLists(a, b) {\n  const dummy = new ListNode(0);\n  let tail = dummy;\n  while (a && b) {\n    if (a.val <= b.val) {\n      tail.next = a;\n      a = a.next;\n    } else {\n      tail.next = b;\n      b = b.next;\n    }\n    tail = tail.next;\n  }\n  tail.next = a || b;\n  return dummy.next;\n}\n",
    tests: [
      {
        name: "interleaves two lists",
        body: "assert.deepEqual(toArray(mergeTwoLists(build([1,2,4]), build([1,3,4]))), [1,1,2,3,4,4]);",
      },
      {
        name: "one list is entirely smaller",
        body: "assert.deepEqual(toArray(mergeTwoLists(build([1,2,3]), build([7,8]))), [1,2,3,7,8]);",
      },
      {
        name: "handles an empty second list",
        body: "assert.deepEqual(toArray(mergeTwoLists(build([5]), null)), [5]);",
      },
      {
        name: "handles an empty first list",
        body: "assert.deepEqual(toArray(mergeTwoLists(null, build([0]))), [0]);",
      },
      {
        name: "both empty gives null",
        body: "assert.equal(mergeTwoLists(null, null), null);",
      },
    ],
  },
  {
    id: "ex-linked-list-has-cycle",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Linked List Cycle",
    brief:
      "<p>Return <code>true</code> if the linked list starting at <code>head</code> loops back on itself, and <code>false</code> if walking it eventually reaches <code>null</code>.</p><ul><li>A cycle exists when some node's <code>next</code> points at a node already visited</li><li>Do not modify the list</li><li>Aim for O(1) extra space — a plain <code>Set</code> of nodes works but costs O(n) memory</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction hasCycle(head) {\n  // TODO: decide whether walking forward ever revisits a node\n}\n",
    hints: [
      "If two walkers move at different speeds around a closed loop, what has to eventually happen to them?",
      "Advance one pointer by one node and another by two. On a finite straight list the fast one hits null.",
      "Check for the meeting after you move, and stop the moment fast or fast.next is null.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction hasCycle(head) {\n  let slow = head;\n  let fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "detects a loop back into the middle",
        body: "const head = build([3,2,0,-4]);\nconst second = head.next;\nhead.next.next.next.next = second;\nassert.equal(hasCycle(head), true);",
      },
      {
        name: "straight list has no cycle",
        body: "assert.equal(hasCycle(build([1,2,3,4,5])), false);",
      },
      {
        name: "single node pointing at itself",
        body: "const only = new ListNode(1);\nonly.next = only;\nassert.equal(hasCycle(only), true);",
      },
      {
        name: "single node with no cycle",
        body: "assert.equal(hasCycle(build([1])), false);",
      },
      {
        name: "empty list has no cycle",
        body: "assert.equal(hasCycle(null), false);",
      },
    ],
  },
  {
    id: "ex-linked-list-cycle-start",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Linked List Cycle II",
    brief:
      "<p>If the list contains a loop, return the <b>node where the loop begins</b> — the first node that gets visited twice. If there is no loop, return <code>null</code>.</p><ul><li>Return the node object itself, not its value or index</li><li>Do not modify the list</li><li>The intended solution uses O(1) extra space</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction detectCycle(head) {\n  // TODO: find the loop first, then work out where it starts\n}\n",
    hints: [
      "Start the same way as plain cycle detection: a slow and a fast pointer that meet somewhere inside the loop.",
      "The meeting point is not the loop entrance. Let the distance from head to the entrance be A and the distance from the entrance to the meeting point be B — the maths says the remaining loop distance back to the entrance is also A.",
      "So after they meet, reset one pointer to head and advance both one step at a time; they collide exactly at the entrance.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction detectCycle(head) {\n  let slow = head;\n  let fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) {\n      let walker = head;\n      while (walker !== slow) {\n        walker = walker.next;\n        slow = slow.next;\n      }\n      return walker;\n    }\n  }\n  return null;\n}\n",
    tests: [
      {
        name: "returns the entry node of the loop",
        body: "const head = build([3,2,0,-4]);\nconst entry = head.next;\nhead.next.next.next.next = entry;\nconst got = detectCycle(head);\nassert.equal(got.val, 2);\nassert.ok(got === entry, 'must return the very same node object');",
      },
      {
        name: "loop that starts at the head",
        body: "const head = build([1,2,3]);\nhead.next.next.next = head;\nconst got = detectCycle(head);\nassert.equal(got.val, 1);\nassert.ok(got === head);",
      },
      {
        name: "single self-referencing node",
        body: "const only = new ListNode(7);\nonly.next = only;\nconst got = detectCycle(only);\nassert.equal(got.val, 7);\nassert.ok(got === only);",
      },
      {
        name: "no cycle returns null",
        body: "assert.equal(detectCycle(build([1,2,3,4])), null);",
      },
      {
        name: "empty list returns null",
        body: "assert.equal(detectCycle(null), null);",
      },
    ],
  },
  {
    id: "ex-middle-of-linked-list",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Middle of the Linked List",
    brief:
      "<p>Return the middle node of a singly linked list.</p><ul><li>For an odd length list there is exactly one middle</li><li>For an even length list return the <b>second</b> of the two middles</li><li>Return the node, not its value — one pass, no counting pass first</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction middleNode(head) {\n  // TODO: reach the middle in a single traversal\n}\n",
    hints: [
      "If one pointer travels twice as fast as another, where is the slow one when the fast one falls off the end?",
      "Loop while fast and fast.next are both non-null; move slow one step and fast two.",
      "Starting both at head naturally lands you on the second middle for even lengths.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction middleNode(head) {\n  let slow = head;\n  let fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  return slow;\n}\n",
    tests: [
      {
        name: "odd length list",
        body: "assert.deepEqual(toArray(middleNode(build([1,2,3,4,5]))), [3,4,5]);",
      },
      {
        name: "even length takes the second middle",
        body: "assert.deepEqual(toArray(middleNode(build([1,2,3,4,5,6]))), [4,5,6]);",
      },
      {
        name: "two node list",
        body: "assert.equal(middleNode(build([1,2])).val, 2);",
      },
      {
        name: "single node is its own middle",
        body: "assert.equal(middleNode(build([42])).val, 42);",
      },
      {
        name: "returns a node from the original list",
        body: "const head = build([1,2,3]);\nassert.ok(middleNode(head) === head.next);",
      },
    ],
  },
  {
    id: "ex-remove-nth-from-end",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Remove Nth Node From End",
    brief:
      "<p>Remove the <code>n</code>th node counting from the <b>end</b> of the list and return the head of the result.</p><ul><li><code>n = 1</code> means the last node</li><li><code>n</code> is always valid: <code>1 &lt;= n &lt;= length</code></li><li>Removing the only node leaves an empty list — return <code>null</code></li><li>Try to do it in a single pass</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction removeNthFromEnd(head, n) {\n  // TODO: find the node just before the one to drop, then unlink it\n}\n",
    hints: [
      "Two pointers with a fixed gap of n between them: when the front one reaches the end, the back one is n from the end.",
      "You need the node BEFORE the victim in order to unlink it, so aim the trailing pointer one step short.",
      "A dummy node in front of head makes 'remove the first node' behave like every other case.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction removeNthFromEnd(head, n) {\n  const dummy = new ListNode(0, head);\n  let lead = dummy;\n  let trail = dummy;\n  for (let i = 0; i < n; i++) lead = lead.next;\n  while (lead.next) {\n    lead = lead.next;\n    trail = trail.next;\n  }\n  trail.next = trail.next.next;\n  return dummy.next;\n}\n",
    tests: [
      {
        name: "removes a node in the middle",
        body: "assert.deepEqual(toArray(removeNthFromEnd(build([1,2,3,4,5]), 2)), [1,2,3,5]);",
      },
      {
        name: "removes the last node",
        body: "assert.deepEqual(toArray(removeNthFromEnd(build([1,2,3]), 1)), [1,2]);",
      },
      {
        name: "removes the head when n equals the length",
        body: "assert.deepEqual(toArray(removeNthFromEnd(build([1,2,3]), 3)), [2,3]);",
      },
      {
        name: "removing the only node gives null",
        body: "assert.equal(removeNthFromEnd(build([1]), 1), null);",
      },
      {
        name: "two node list, drop the first",
        body: "assert.deepEqual(toArray(removeNthFromEnd(build([1,2]), 2)), [2]);",
      },
    ],
  },
  {
    id: "ex-palindrome-linked-list",
    chapter: "dsa-linked-lists",
    level: "advanced",
    title: "Palindrome Linked List",
    brief:
      "<p>Decide whether the values in a singly linked list read the same forwards and backwards. Return <code>true</code> or <code>false</code>.</p><ul><li>Use <b>O(1) extra space</b> — copying the values into an array is the answer we are not looking for</li><li>Runs in O(n) time</li><li>The empty list and any single node list are palindromes</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction isPalindrome(head) {\n  // TODO: compare the front half against the back half without extra storage\n}\n",
    hints: [
      "You cannot walk a singly linked list backwards — but you can make half of it point backwards.",
      "Find the middle with slow/fast, reverse the second half in place, then walk the two halves in step.",
      "Stop comparing when the reversed half runs out; that handles odd lengths, where the exact middle node is ignored.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction isPalindrome(head) {\n  if (!head || !head.next) return true;\n  let slow = head;\n  let fast = head;\n  while (fast.next && fast.next.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  let prev = null;\n  let cur = slow.next;\n  while (cur) {\n    const next = cur.next;\n    cur.next = prev;\n    prev = cur;\n    cur = next;\n  }\n  let front = head;\n  let back = prev;\n  let ok = true;\n  while (back) {\n    if (front.val !== back.val) {\n      ok = false;\n      break;\n    }\n    front = front.next;\n    back = back.next;\n  }\n  return ok;\n}\n",
    tests: [
      {
        name: "even length palindrome",
        body: "assert.equal(isPalindrome(build([1,2,2,1])), true);",
      },
      {
        name: "odd length palindrome",
        body: "assert.equal(isPalindrome(build([1,2,3,2,1])), true);",
      },
      {
        name: "not a palindrome",
        body: "assert.equal(isPalindrome(build([1,2])), false);",
      },
      {
        name: "long odd list that differs in the middle",
        body: "assert.equal(isPalindrome(build([1,2,3,4,1])), false);",
      },
      {
        name: "single node and empty list",
        body: "assert.equal(isPalindrome(build([7])), true);\nassert.equal(isPalindrome(null), true);",
      },
    ],
  },
  {
    id: "ex-intersection-of-two-lists",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Intersection of Two Linked Lists",
    brief:
      "<p>Two singly linked lists may merge and share a common tail. Return the first node they share, or <code>null</code> if they never meet.</p><ul><li>Sharing means the <b>same node object</b>, not merely equal values</li><li>The lists may have different lengths</li><li>Do not modify either list; aim for O(1) extra space</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\nfunction tailOf(head) {\n  let n = head;\n  while (n && n.next) n = n.next;\n  return n;\n}\n\nfunction getIntersectionNode(a, b) {\n  // TODO: line the two lists up so they reach the shared part together\n}\n",
    hints: [
      "The two lists have different lengths before the join, but identical lengths after it. Cancel out the difference.",
      "One way: measure both lengths, then advance the longer list's pointer by the difference before stepping in lockstep.",
      "Slicker: when a pointer falls off the end of its own list, restart it at the other list's head. Both then travel lenA + lenB and meet at the join (or at null together).",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\nfunction tailOf(head) {\n  let n = head;\n  while (n && n.next) n = n.next;\n  return n;\n}\n\nfunction getIntersectionNode(a, b) {\n  if (!a || !b) return null;\n  let p = a;\n  let q = b;\n  while (p !== q) {\n    p = p ? p.next : b;\n    q = q ? q.next : a;\n  }\n  return p;\n}\n",
    tests: [
      {
        name: "finds the shared node object",
        body: "const shared = build([8,4,5]);\nconst a = build([4,1]);\nconst b = build([5,6,1]);\ntailOf(a).next = shared;\ntailOf(b).next = shared;\nconst got = getIntersectionNode(a, b);\nassert.ok(got === shared, 'must return the shared node itself');\nassert.equal(got.val, 8);",
      },
      {
        name: "equal values but no shared nodes",
        body: "const a = build([1,2,3]);\nconst b = build([1,2,3]);\nassert.equal(getIntersectionNode(a, b), null);",
      },
      {
        name: "one list is entirely the shared tail",
        body: "const shared = build([9,10]);\nconst a = build([1,2,3]);\ntailOf(a).next = shared;\nconst got = getIntersectionNode(a, shared);\nassert.ok(got === shared);",
      },
      {
        name: "intersection at the very last node",
        body: "const shared = new ListNode(99);\nconst a = build([1,2,3,4]);\nconst b = build([7]);\ntailOf(a).next = shared;\ntailOf(b).next = shared;\nassert.ok(getIntersectionNode(a, b) === shared);",
      },
      {
        name: "an empty list never intersects",
        body: "assert.equal(getIntersectionNode(null, build([1,2])), null);",
      },
    ],
  },
  {
    id: "ex-add-two-numbers-linked-list",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Add Two Numbers",
    brief:
      "<p>Two non-negative integers are stored as linked lists with one digit per node, <b>least significant digit first</b>. Add them and return the sum in the same format.</p><ul><li>So <code>[2,4,3]</code> means 342 and <code>[5,6,4]</code> means 465; the sum 807 is <code>[7,0,8]</code></li><li>The lists may have different lengths</li><li>A final carry needs an extra node</li><li>Do not join the digits into a JavaScript number — assume the values overflow</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction addTwoNumbers(a, b) {\n  // TODO: add digit by digit, carrying as you go\n}\n",
    hints: [
      "Reverse order is a gift: the heads are the ones column, so you can add left to right exactly like on paper.",
      "Keep looping while either list has digits left OR the carry is still non-zero.",
      "Treat a missing digit as 0; the new digit is sum % 10 and the next carry is Math.floor(sum / 10).",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction addTwoNumbers(a, b) {\n  const dummy = new ListNode(0);\n  let tail = dummy;\n  let carry = 0;\n  while (a || b || carry) {\n    const sum = (a ? a.val : 0) + (b ? b.val : 0) + carry;\n    carry = Math.floor(sum / 10);\n    tail.next = new ListNode(sum % 10);\n    tail = tail.next;\n    if (a) a = a.next;\n    if (b) b = b.next;\n  }\n  return dummy.next;\n}\n",
    tests: [
      {
        name: "342 + 465 = 807",
        body: "assert.deepEqual(toArray(addTwoNumbers(build([2,4,3]), build([5,6,4]))), [7,0,8]);",
      },
      {
        name: "0 + 0 = 0",
        body: "assert.deepEqual(toArray(addTwoNumbers(build([0]), build([0]))), [0]);",
      },
      {
        name: "carry ripples all the way out",
        body: "assert.deepEqual(toArray(addTwoNumbers(build([9,9,9]), build([1]))), [0,0,0,1]);",
      },
      {
        name: "different lengths",
        body: "assert.deepEqual(toArray(addTwoNumbers(build([9,9,9,9]), build([9,9]))), [8,9,0,0,1]);",
      },
      {
        name: "single digits with no carry",
        body: "assert.deepEqual(toArray(addTwoNumbers(build([5]), build([4]))), [9]);",
      },
    ],
  },
  {
    id: "ex-merge-k-sorted-lists",
    chapter: "dsa-linked-lists",
    level: "advanced",
    title: "Merge K Sorted Lists",
    brief:
      "<p>You are given an array of linked list heads, each list sorted in non-decreasing order. Merge all of them into one sorted list and return its head.</p><ul><li>The array may be empty, and individual entries may be <code>null</code></li><li>Merging them one at a time into an accumulator is O(k*n) — pairing them up is O(n log k)</li><li>Return <code>null</code> when there is nothing to merge</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction mergeKLists(lists) {\n  // TODO: combine the lists so no element gets copied k times\n}\n",
    hints: [
      "Start from the two-list merge you already know — the whole problem is deciding which pairs to merge and in what order.",
      "Folding list 2 into list 1, then 3 into that, rescans the growing accumulator every time. Merge them in pairs instead, halving the count each round.",
      "Repeat: walk the array taking lists[i] and lists[i + 1], merge each pair into a new array, until only one list remains.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction mergeTwo(a, b) {\n  const dummy = new ListNode(0);\n  let tail = dummy;\n  while (a && b) {\n    if (a.val <= b.val) {\n      tail.next = a;\n      a = a.next;\n    } else {\n      tail.next = b;\n      b = b.next;\n    }\n    tail = tail.next;\n  }\n  tail.next = a || b;\n  return dummy.next;\n}\n\nfunction mergeKLists(lists) {\n  if (!lists || lists.length === 0) return null;\n  let round = lists.slice();\n  while (round.length > 1) {\n    const next = [];\n    for (let i = 0; i < round.length; i += 2) {\n      next.push(mergeTwo(round[i], i + 1 < round.length ? round[i + 1] : null));\n    }\n    round = next;\n  }\n  return round[0];\n}\n",
    tests: [
      {
        name: "merges three sorted lists",
        body: "const out = mergeKLists([build([1,4,5]), build([1,3,4]), build([2,6])]);\nassert.deepEqual(toArray(out), [1,1,2,3,4,4,5,6]);",
      },
      {
        name: "empty array of lists",
        body: "assert.equal(mergeKLists([]), null);",
      },
      {
        name: "array holding only null lists",
        body: "assert.equal(mergeKLists([null, null]), null);",
      },
      {
        name: "single list passes through",
        body: "assert.deepEqual(toArray(mergeKLists([build([2,7,9])])), [2,7,9]);",
      },
      {
        name: "odd count with gaps and negatives",
        body: "const out = mergeKLists([build([-5,0]), null, build([-9,-1,3]), build([]), build([7])]);\nassert.deepEqual(toArray(out), [-9,-5,-1,0,3,7]);",
      },
    ],
  },
  {
    id: "ex-copy-list-with-random-pointer",
    chapter: "dsa-linked-lists",
    level: "advanced",
    title: "Copy List with Random Pointer",
    brief:
      "<p>Every node here has a <code>next</code> pointer and an extra <code>random</code> pointer that may aim at any node in the list or at <code>null</code>. Produce a <b>deep copy</b>: a brand new set of nodes whose pointers mirror the original's shape.</p><ul><li>No node in the returned list may be a node from the input list</li><li>If the original's random points at the 3rd node, the copy's random must point at the copy's 3rd node</li><li><code>serialize(head)</code> is provided for the tests: it renders a list as pairs of <code>[val, randomIndex]</code></li></ul>",
    starter:
      "class Node {\n  constructor(val, next, random) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n    this.random = random === undefined ? null : random;\n  }\n}\nfunction build(pairs) {\n  const nodes = pairs.map((p) => new Node(p[0]));\n  for (let i = 0; i < nodes.length; i++) {\n    nodes[i].next = i + 1 < nodes.length ? nodes[i + 1] : null;\n    nodes[i].random = pairs[i][1] === null ? null : nodes[pairs[i][1]];\n  }\n  return nodes.length ? nodes[0] : null;\n}\nfunction serialize(head) {\n  const nodes = [];\n  for (let n = head; n; n = n.next) nodes.push(n);\n  const index = new Map();\n  for (let i = 0; i < nodes.length; i++) index.set(nodes[i], i);\n  return nodes.map((n) => [n.val, n.random ? index.get(n.random) : null]);\n}\n\nfunction copyRandomList(head) {\n  // TODO: clone every node, then wire up next and random on the clones\n}\n",
    hints: [
      "The trouble is that when you clone node i, the node its random points at may not exist yet.",
      "Two passes fix it: first create all the clones and remember the original -> clone correspondence, then make a second pass to set next and random using that mapping.",
      "A Map keyed by the original node objects is the simplest correspondence. (The O(1)-space trick is to weave each clone in right after its original, then unweave.)",
    ],
    solution:
      "class Node {\n  constructor(val, next, random) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n    this.random = random === undefined ? null : random;\n  }\n}\nfunction build(pairs) {\n  const nodes = pairs.map((p) => new Node(p[0]));\n  for (let i = 0; i < nodes.length; i++) {\n    nodes[i].next = i + 1 < nodes.length ? nodes[i + 1] : null;\n    nodes[i].random = pairs[i][1] === null ? null : nodes[pairs[i][1]];\n  }\n  return nodes.length ? nodes[0] : null;\n}\nfunction serialize(head) {\n  const nodes = [];\n  for (let n = head; n; n = n.next) nodes.push(n);\n  const index = new Map();\n  for (let i = 0; i < nodes.length; i++) index.set(nodes[i], i);\n  return nodes.map((n) => [n.val, n.random ? index.get(n.random) : null]);\n}\n\nfunction copyRandomList(head) {\n  if (!head) return null;\n  const clones = new Map();\n  for (let n = head; n; n = n.next) clones.set(n, new Node(n.val));\n  for (let n = head; n; n = n.next) {\n    const copy = clones.get(n);\n    copy.next = n.next ? clones.get(n.next) : null;\n    copy.random = n.random ? clones.get(n.random) : null;\n  }\n  return clones.get(head);\n}\n",
    tests: [
      {
        name: "copies values and random targets",
        body: "const head = build([[7,null],[13,0],[11,4],[10,2],[1,0]]);\nconst copy = copyRandomList(head);\nassert.deepEqual(serialize(copy), [[7,null],[13,0],[11,4],[10,2],[1,0]]);",
      },
      {
        name: "returns genuinely new nodes",
        body: "const head = build([[1,1],[2,1]]);\nconst copy = copyRandomList(head);\nconst originals = new Set();\nfor (let n = head; n; n = n.next) originals.add(n);\nlet reused = false;\nfor (let n = copy; n; n = n.next) if (originals.has(n)) reused = true;\nassert.ok(!reused, 'the copy must not reuse original nodes');\nassert.ok(copy.random === copy.next, 'random must point inside the copy');",
      },
      {
        name: "node whose random points at itself",
        body: "const head = build([[3,0]]);\nconst copy = copyRandomList(head);\nassert.deepEqual(serialize(copy), [[3,0]]);\nassert.ok(copy.random === copy);",
      },
      {
        name: "all randoms null",
        body: "const copy = copyRandomList(build([[1,null],[2,null],[3,null]]));\nassert.deepEqual(serialize(copy), [[1,null],[2,null],[3,null]]);",
      },
      {
        name: "empty list copies to null",
        body: "assert.equal(copyRandomList(null), null);",
      },
    ],
  },
  {
    id: "ex-reorder-list",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Reorder List",
    brief:
      "<p>Rearrange a list <code>n0 -> n1 -> ... -> nk</code> into <code>n0 -> nk -> n1 -> nk-1 -> ...</code>, alternating from the front and the back.</p><ul><li>Reorder the nodes <b>in place</b> — the function returns nothing</li><li>Only relink nodes; do not swap their <code>val</code> fields</li><li>Lists of length 0, 1 or 2 come out unchanged</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction reorderList(head) {\n  // TODO: rearrange the nodes in place, returning nothing\n}\n",
    hints: [
      "You need to consume the list from both ends at once, but a singly linked list only goes forwards.",
      "Three phases: split at the middle, reverse the second half, then zip the two halves together alternately.",
      "After splitting, cut the first half loose (set the middle node's next to null) or your zip will loop forever.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction reorderList(head) {\n  if (!head || !head.next) return;\n  let slow = head;\n  let fast = head;\n  while (fast.next && fast.next.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  let second = slow.next;\n  slow.next = null;\n  let prev = null;\n  while (second) {\n    const next = second.next;\n    second.next = prev;\n    prev = second;\n    second = next;\n  }\n  let front = head;\n  let back = prev;\n  while (back) {\n    const f = front.next;\n    const b = back.next;\n    front.next = back;\n    back.next = f;\n    front = f;\n    back = b;\n  }\n}\n",
    tests: [
      {
        name: "even length list",
        body: "const head = build([1,2,3,4]);\nreorderList(head);\nassert.deepEqual(toArray(head), [1,4,2,3]);",
      },
      {
        name: "odd length list",
        body: "const head = build([1,2,3,4,5]);\nreorderList(head);\nassert.deepEqual(toArray(head), [1,5,2,4,3]);",
      },
      {
        name: "two nodes stay put",
        body: "const head = build([1,2]);\nreorderList(head);\nassert.deepEqual(toArray(head), [1,2]);",
      },
      {
        name: "single node stays put",
        body: "const head = build([9]);\nreorderList(head);\nassert.deepEqual(toArray(head), [9]);",
      },
      {
        name: "six nodes and an empty list",
        body: "const head = build([1,2,3,4,5,6]);\nreorderList(head);\nassert.deepEqual(toArray(head), [1,6,2,5,3,4]);\nreorderList(null);",
      },
    ],
  },
  {
    id: "ex-swap-nodes-in-pairs",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Swap Nodes in Pairs",
    brief:
      "<p>Walk the list swapping every two adjacent nodes, and return the new head.</p><ul><li>Swap the <b>nodes</b> by relinking — do not just exchange <code>val</code> fields</li><li>If the list has an odd length the final node keeps its place</li><li>Lists of length 0 or 1 are returned unchanged</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction swapPairs(head) {\n  // TODO: relink each adjacent pair, keeping the chain intact\n}\n",
    hints: [
      "Three pointers matter for each swap: the node before the pair, and the two nodes in the pair.",
      "A dummy node before head gives you a 'node before the pair' even for the very first pair — and its next is the answer.",
      "After swapping, the previous pointer must move to the node that is now second in the pair, not the one you started with.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction swapPairs(head) {\n  const dummy = new ListNode(0, head);\n  let prev = dummy;\n  while (prev.next && prev.next.next) {\n    const first = prev.next;\n    const second = first.next;\n    first.next = second.next;\n    second.next = first;\n    prev.next = second;\n    prev = first;\n  }\n  return dummy.next;\n}\n",
    tests: [
      {
        name: "swaps two full pairs",
        body: "assert.deepEqual(toArray(swapPairs(build([1,2,3,4]))), [2,1,4,3]);",
      },
      {
        name: "odd length leaves the last node alone",
        body: "assert.deepEqual(toArray(swapPairs(build([1,2,3]))), [2,1,3]);",
      },
      {
        name: "single node is unchanged",
        body: "assert.deepEqual(toArray(swapPairs(build([1]))), [1]);",
      },
      {
        name: "empty list returns null",
        body: "assert.equal(swapPairs(null), null);",
      },
      {
        name: "moves nodes rather than values",
        body: "const head = build([1,2]);\nconst first = head;\nconst second = head.next;\nconst out = swapPairs(head);\nassert.ok(out === second, 'the second node should now be the head');\nassert.ok(out.next === first);",
      },
    ],
  },
  {
    id: "ex-reverse-nodes-in-k-group",
    chapter: "dsa-linked-lists",
    level: "advanced",
    title: "Reverse Nodes in k-Group",
    brief:
      "<p>Reverse the list in consecutive blocks of <code>k</code> nodes and return the new head.</p><ul><li>If fewer than <code>k</code> nodes remain at the end, leave that leftover chunk as it is</li><li>With <code>k = 1</code> nothing changes; with <code>k</code> equal to the length the whole list reverses</li><li>Relink nodes rather than rewriting values</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction reverseKGroup(head, k) {\n  // TODO: reverse each full block of k nodes, leaving a short tail alone\n}\n",
    hints: [
      "Before reversing a block, check that k nodes actually exist — otherwise you must not touch it.",
      "Walk k steps ahead first. If you hit null on the way, return the rest of the list untouched.",
      "Reverse exactly k nodes with the usual prev/cur loop, then reconnect: the block's original head becomes its tail and must point at whatever the next block returns.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction reverseKGroup(head, k) {\n  if (k <= 1 || !head) return head;\n  let probe = head;\n  for (let i = 0; i < k; i++) {\n    if (!probe) return head;\n    probe = probe.next;\n  }\n  let prev = null;\n  let cur = head;\n  for (let i = 0; i < k; i++) {\n    const next = cur.next;\n    cur.next = prev;\n    prev = cur;\n    cur = next;\n  }\n  head.next = reverseKGroup(cur, k);\n  return prev;\n}\n",
    tests: [
      {
        name: "k of 2 on an even length list",
        body: "assert.deepEqual(toArray(reverseKGroup(build([1,2,3,4]), 2)), [2,1,4,3]);",
      },
      {
        name: "leftover chunk stays in order",
        body: "assert.deepEqual(toArray(reverseKGroup(build([1,2,3,4,5]), 3)), [3,2,1,4,5]);",
      },
      {
        name: "k larger than the list leaves it alone",
        body: "assert.deepEqual(toArray(reverseKGroup(build([1,2,3]), 5)), [1,2,3]);",
      },
      {
        name: "k of 1 changes nothing",
        body: "assert.deepEqual(toArray(reverseKGroup(build([1,2,3]), 1)), [1,2,3]);",
      },
      {
        name: "empty list and exact multiple",
        body: "assert.equal(reverseKGroup(null, 3), null);\nassert.deepEqual(toArray(reverseKGroup(build([1,2,3,4,5,6]), 3)), [3,2,1,6,5,4]);",
      },
    ],
  },
  {
    id: "ex-rotate-list",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Rotate List",
    brief:
      "<p>Rotate a linked list to the right by <code>k</code> places and return the new head. Each rotation moves the last node to the front.</p><ul><li><code>k</code> can be far larger than the list length</li><li><code>k</code> is non-negative; <code>k = 0</code> changes nothing</li><li>Empty and single node lists come back unchanged</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction rotateRight(head, k) {\n  // TODO: rotating by the length is a no-op — use that\n}\n",
    hints: [
      "Rotating by the length brings you back to the start, so only k % length actually matters.",
      "You need the length anyway — measure it while walking to the tail.",
      "Close the list into a ring by pointing the tail at the head, step to the new tail, then break the ring there.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction rotateRight(head, k) {\n  if (!head || !head.next) return head;\n  let length = 1;\n  let tail = head;\n  while (tail.next) {\n    tail = tail.next;\n    length++;\n  }\n  const shift = k % length;\n  if (shift === 0) return head;\n  tail.next = head;\n  let newTail = head;\n  for (let i = 0; i < length - shift - 1; i++) newTail = newTail.next;\n  const newHead = newTail.next;\n  newTail.next = null;\n  return newHead;\n}\n",
    tests: [
      {
        name: "rotates by two",
        body: "assert.deepEqual(toArray(rotateRight(build([1,2,3,4,5]), 2)), [4,5,1,2,3]);",
      },
      {
        name: "k larger than the length wraps",
        body: "assert.deepEqual(toArray(rotateRight(build([0,1,2]), 4)), [2,0,1]);",
      },
      {
        name: "k equal to the length is a no-op",
        body: "assert.deepEqual(toArray(rotateRight(build([1,2,3]), 3)), [1,2,3]);",
      },
      {
        name: "k of zero is a no-op",
        body: "assert.deepEqual(toArray(rotateRight(build([1,2]), 0)), [1,2]);",
      },
      {
        name: "empty and single node lists",
        body: "assert.equal(rotateRight(null, 7), null);\nassert.deepEqual(toArray(rotateRight(build([9]), 5)), [9]);",
      },
    ],
  },
  {
    id: "ex-partition-list",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Partition List",
    brief:
      "<p>Given a list and a value <code>x</code>, rearrange it so that every node with a value less than <code>x</code> comes before every node with a value greater than or equal to <code>x</code>.</p><ul><li>The <b>relative order within each group must be preserved</b> — this is a stable partition</li><li>No node with value <code>x</code> itself is special; it belongs in the second group</li><li>Return the head of the rearranged list</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction partition(head, x) {\n  // TODO: separate the nodes into two chains, then join them\n}\n",
    hints: [
      "Swapping nodes around in place is painful. What if you took the list apart into two lists instead?",
      "Append each node to a 'less than x' chain or a 'at least x' chain as you walk, then link the first chain's tail to the second chain's head.",
      "Appending in the order you meet nodes keeps things stable automatically. Do not forget to terminate the second chain with null, or you will create a cycle.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction partition(head, x) {\n  const lessHead = new ListNode(0);\n  const restHead = new ListNode(0);\n  let less = lessHead;\n  let rest = restHead;\n  for (let n = head; n; n = n.next) {\n    if (n.val < x) {\n      less.next = n;\n      less = n;\n    } else {\n      rest.next = n;\n      rest = n;\n    }\n  }\n  rest.next = null;\n  less.next = restHead.next;\n  return lessHead.next;\n}\n",
    tests: [
      {
        name: "partitions and keeps order",
        body: "assert.deepEqual(toArray(partition(build([1,4,3,2,5,2]), 3)), [1,2,2,4,3,5]);",
      },
      {
        name: "every value is already below x",
        body: "assert.deepEqual(toArray(partition(build([1,2,3]), 10)), [1,2,3]);",
      },
      {
        name: "every value is at least x",
        body: "assert.deepEqual(toArray(partition(build([5,6,7]), 5)), [5,6,7]);",
      },
      {
        name: "negatives and a single node",
        body: "assert.deepEqual(toArray(partition(build([2,-1,0,-4]), 0)), [-1,-4,2,0]);\nassert.deepEqual(toArray(partition(build([1]), 2)), [1]);",
      },
      {
        name: "empty list returns null",
        body: "assert.equal(partition(null, 3), null);",
      },
    ],
  },
  {
    id: "ex-remove-duplicates-sorted-list",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Remove Duplicates from Sorted List",
    brief:
      "<p>The list is sorted in non-decreasing order. Delete the repeats so that every value appears exactly once, and return the head.</p><ul><li>Keep the first occurrence of each value</li><li>Because the list is sorted, duplicates are always adjacent</li><li>Modify the list in place — no new nodes</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction deleteDuplicates(head) {\n  // TODO: skip over any node whose value matches the one before it\n}\n",
    hints: [
      "Sorted means you only ever have to compare a node with its immediate neighbour.",
      "When cur.val === cur.next.val, unlink the neighbour by setting cur.next = cur.next.next — and do not advance yet.",
      "Only step forward when the two values differ, otherwise a run of three identical values loses one.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction deleteDuplicates(head) {\n  let cur = head;\n  while (cur && cur.next) {\n    if (cur.val === cur.next.val) cur.next = cur.next.next;\n    else cur = cur.next;\n  }\n  return head;\n}\n",
    tests: [
      {
        name: "collapses a simple duplicate",
        body: "assert.deepEqual(toArray(deleteDuplicates(build([1,1,2]))), [1,2]);",
      },
      {
        name: "handles runs longer than two",
        body: "assert.deepEqual(toArray(deleteDuplicates(build([1,1,1,2,3,3]))), [1,2,3]);",
      },
      {
        name: "already unique list is untouched",
        body: "assert.deepEqual(toArray(deleteDuplicates(build([1,2,3]))), [1,2,3]);",
      },
      {
        name: "every value identical",
        body: "assert.deepEqual(toArray(deleteDuplicates(build([4,4,4,4]))), [4]);",
      },
      {
        name: "single node and empty list",
        body: "assert.deepEqual(toArray(deleteDuplicates(build([7]))), [7]);\nassert.equal(deleteDuplicates(null), null);",
      },
    ],
  },
  {
    id: "ex-delete-node-in-linked-list",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Delete Node in a Linked List",
    brief:
      "<p>You are given <b>only the node to delete</b> — not the head of the list. Remove it so that walking the list from the original head no longer shows its value.</p><ul><li>The node is guaranteed not to be the last node in the list</li><li>All values in the list are distinct</li><li>Everything else must keep its order; the function returns nothing</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\nfunction nodeAt(head, i) {\n  let n = head;\n  while (i-- > 0 && n) n = n.next;\n  return n;\n}\n\nfunction deleteNode(node) {\n  // TODO: you cannot reach the previous node — work with what you have\n}\n",
    hints: [
      "Without the previous node you can never unlink this node object itself. So stop trying to.",
      "Nothing says the node object has to disappear — only that its value must vanish from the sequence.",
      "Copy the next node's value into this node, then unlink the next node instead.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\nfunction nodeAt(head, i) {\n  let n = head;\n  while (i-- > 0 && n) n = n.next;\n  return n;\n}\n\nfunction deleteNode(node) {\n  node.val = node.next.val;\n  node.next = node.next.next;\n}\n",
    tests: [
      {
        name: "removes a node from the middle",
        body: "const head = build([4,5,1,9]);\ndeleteNode(nodeAt(head, 1));\nassert.deepEqual(toArray(head), [4,1,9]);",
      },
      {
        name: "removes the second to last node",
        body: "const head = build([4,5,1,9]);\ndeleteNode(nodeAt(head, 2));\nassert.deepEqual(toArray(head), [4,5,9]);",
      },
      {
        name: "removes the head node",
        body: "const head = build([1,2,3]);\ndeleteNode(head);\nassert.deepEqual(toArray(head), [2,3]);",
      },
      {
        name: "two node list",
        body: "const head = build([7,8]);\ndeleteNode(head);\nassert.deepEqual(toArray(head), [8]);",
      },
      {
        name: "the list shortens by exactly one",
        body: "const head = build([10,20,30,40,50]);\ndeleteNode(nodeAt(head, 3));\nassert.deepEqual(toArray(head), [10,20,30,50]);",
      },
    ],
  },
  {
    id: "ex-sort-linked-list",
    chapter: "dsa-linked-lists",
    level: "advanced",
    title: "Sort List",
    brief:
      "<p>Sort a linked list into non-decreasing order and return the new head.</p><ul><li>Must run in <b>O(n log n)</b> time — merge sort is the natural fit for linked lists</li><li>Relink the existing nodes; do not dump the values into an array and sort that</li><li>Values may be negative and may repeat</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction sortList(head) {\n  // TODO: split, sort each half, merge\n}\n",
    hints: [
      "Quicksort needs random access; merge sort only needs sequential access, which is all a linked list offers.",
      "Split with slow/fast pointers, and remember to cut the first half loose by nulling the middle node's next.",
      "The base case is a list of length 0 or 1. Merging two sorted lists is the same routine as Merge Two Sorted Lists.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction mergeSorted(a, b) {\n  const dummy = new ListNode(0);\n  let tail = dummy;\n  while (a && b) {\n    if (a.val <= b.val) {\n      tail.next = a;\n      a = a.next;\n    } else {\n      tail.next = b;\n      b = b.next;\n    }\n    tail = tail.next;\n  }\n  tail.next = a || b;\n  return dummy.next;\n}\n\nfunction sortList(head) {\n  if (!head || !head.next) return head;\n  let slow = head;\n  let fast = head.next;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  const second = slow.next;\n  slow.next = null;\n  return mergeSorted(sortList(head), sortList(second));\n}\n",
    tests: [
      {
        name: "sorts an unordered list",
        body: "assert.deepEqual(toArray(sortList(build([4,2,1,3]))), [1,2,3,4]);",
      },
      {
        name: "handles negatives and duplicates",
        body: "assert.deepEqual(toArray(sortList(build([-1,5,3,4,0,-1]))), [-1,-1,0,3,4,5]);",
      },
      {
        name: "already sorted list stays sorted",
        body: "assert.deepEqual(toArray(sortList(build([1,2,3,4,5]))), [1,2,3,4,5]);",
      },
      {
        name: "single node and empty list",
        body: "assert.deepEqual(toArray(sortList(build([1]))), [1]);\nassert.equal(sortList(null), null);",
      },
      {
        name: "reversed list of a thousand values",
        body: "const values = [];\nfor (let i = 1000; i >= 1; i--) values.push(i);\nconst sorted = toArray(sortList(build(values)));\nassert.equal(sorted.length, 1000);\nassert.equal(sorted[0], 1);\nassert.equal(sorted[999], 1000);\nlet ordered = true;\nfor (let i = 1; i < sorted.length; i++) if (sorted[i - 1] > sorted[i]) ordered = false;\nassert.ok(ordered);",
      },
    ],
  },
  {
    id: "ex-flatten-multilevel-doubly-list",
    chapter: "dsa-linked-lists",
    level: "advanced",
    title: "Flatten a Multilevel Doubly Linked List",
    brief:
      "<p>Each node in this doubly linked list has <code>prev</code>, <code>next</code> and an optional <code>child</code> pointer to another doubly linked list, which may itself have children. Flatten everything into a single level, then return the head.</p><ul><li>A child list is spliced in immediately after its parent node and before whatever followed it</li><li>Afterwards every <code>child</code> must be <code>null</code> and every <code>prev</code> must point at the real predecessor</li><li><code>serialize(head)</code> is provided for the tests: per node it reports <code>[val, prevIsCorrect, childIsNull]</code></li></ul>",
    starter:
      "class Node {\n  constructor(val, prev, next, child) {\n    this.val = val === undefined ? 0 : val;\n    this.prev = prev === undefined ? null : prev;\n    this.next = next === undefined ? null : next;\n    this.child = child === undefined ? null : child;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  let prev = null;\n  for (const v of arr) {\n    const node = new Node(v);\n    node.prev = prev;\n    if (prev) prev.next = node;\n    else head = node;\n    prev = node;\n  }\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\nfunction nodeAt(head, i) {\n  let n = head;\n  while (i-- > 0 && n) n = n.next;\n  return n;\n}\nfunction serialize(head) {\n  const out = [];\n  let prev = null;\n  for (let n = head; n; n = n.next) {\n    out.push([n.val, n.prev === prev, n.child === null]);\n    prev = n;\n  }\n  return out;\n}\n\nfunction flatten(head) {\n  // TODO: splice each child list in after its parent, deepest first\n}\n",
    hints: [
      "Think of it as repeatedly inserting one list into another: when you meet a node with a child, the child list must sit between that node and its current next.",
      "Save the current next before you overwrite it, attach the child, walk to the child list's tail, then reattach the saved next there.",
      "Clear child to null after splicing, and fix both prev pointers you touched. Because you keep walking forward from the parent, nested children get handled automatically.",
    ],
    solution:
      "class Node {\n  constructor(val, prev, next, child) {\n    this.val = val === undefined ? 0 : val;\n    this.prev = prev === undefined ? null : prev;\n    this.next = next === undefined ? null : next;\n    this.child = child === undefined ? null : child;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  let prev = null;\n  for (const v of arr) {\n    const node = new Node(v);\n    node.prev = prev;\n    if (prev) prev.next = node;\n    else head = node;\n    prev = node;\n  }\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\nfunction nodeAt(head, i) {\n  let n = head;\n  while (i-- > 0 && n) n = n.next;\n  return n;\n}\nfunction serialize(head) {\n  const out = [];\n  let prev = null;\n  for (let n = head; n; n = n.next) {\n    out.push([n.val, n.prev === prev, n.child === null]);\n    prev = n;\n  }\n  return out;\n}\n\nfunction flatten(head) {\n  let cur = head;\n  while (cur) {\n    if (cur.child) {\n      const after = cur.next;\n      const childHead = cur.child;\n      cur.child = null;\n      cur.next = childHead;\n      childHead.prev = cur;\n      let tail = childHead;\n      while (tail.next) tail = tail.next;\n      tail.next = after;\n      if (after) after.prev = tail;\n    }\n    cur = cur.next;\n  }\n  return head;\n}\n",
    tests: [
      {
        name: "flattens two levels of nesting",
        body: "const head = build([1,2,3,4,5,6]);\nconst child1 = build([7,8,9,10]);\nconst child2 = build([11,12]);\nnodeAt(head, 2).child = child1;\nnodeAt(child1, 1).child = child2;\nassert.deepEqual(toArray(flatten(head)), [1,2,3,7,8,11,12,9,10,4,5,6]);",
      },
      {
        name: "repairs prev pointers and clears child",
        body: "const head = build([1,2,3]);\nnodeAt(head, 0).child = build([4,5]);\nconst flat = flatten(head);\nassert.deepEqual(serialize(flat), [\n  [1,true,true],[4,true,true],[5,true,true],[2,true,true],[3,true,true],\n]);",
      },
      {
        name: "child hanging off the last node",
        body: "const head = build([1,2]);\nnodeAt(head, 1).child = build([3,4]);\nconst flat = flatten(head);\nassert.deepEqual(toArray(flat), [1,2,3,4]);\nassert.equal(nodeAt(flat, 3).next, null);",
      },
      {
        name: "no children leaves the list alone",
        body: "const head = build([1,2,3]);\nassert.deepEqual(toArray(flatten(head)), [1,2,3]);",
      },
      {
        name: "single node with a child, and the empty list",
        body: "const head = build([1]);\nhead.child = build([2]);\nassert.deepEqual(toArray(flatten(head)), [1,2]);\nassert.equal(flatten(null), null);",
      },
    ],
  },
  {
    id: "ex-permutations",
    chapter: "dsa-backtracking",
    level: "beginner",
    title: "Permutations",
    brief:
      "<p>Given an array <code>nums</code> of <b>distinct</b> integers, return every possible ordering of those integers.</p><ul><li>An array of <code>n</code> distinct values has <code>n!</code> permutations</li><li>The permutations may be returned in <b>any order</b>, but each one must list all <code>n</code> values exactly once</li><li>An empty input has exactly one permutation: the empty arrangement, so return <code>[[]]</code></li></ul>",
    starter:
      "function permute(nums) {\n  // TODO: build every ordering of nums by choosing one unused value at a time\n}\n",
    hints: [
      "Think of it as filling n slots. At each slot you pick one value you have not used yet, recurse, then undo the pick before trying the next one.",
      "Track which indices are already taken with a boolean array (or a Set), and keep the arrangement you are building in a shared array.",
      "When the arrangement reaches the full length, push a COPY of it. Pushing the array itself means every answer points at the same array, which then gets emptied as you backtrack.",
    ],
    solution:
      "function permute(nums) {\n  const out = [];\n  const used = new Array(nums.length).fill(false);\n  const current = [];\n  const walk = () => {\n    if (current.length === nums.length) {\n      out.push(current.slice());\n      return;\n    }\n    for (let i = 0; i < nums.length; i++) {\n      if (used[i]) continue;\n      used[i] = true;\n      current.push(nums[i]);\n      walk();\n      current.pop();\n      used[i] = false;\n    }\n  };\n  walk();\n  return out;\n}\n",
    tests: [
      {
        name: "all six orderings of three values",
        body: "const norm = (rows) => rows.map((r) => r.join(',')).sort();\nassert.deepEqual(\n  norm(permute([1, 2, 3])),\n  norm([[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]])\n);",
      },
      {
        name: "two values give two orderings",
        body: "const norm = (rows) => rows.map((r) => r.join(',')).sort();\nassert.deepEqual(norm(permute([0, 1])), norm([[0,1],[1,0]]));",
      },
      {
        name: "single value",
        body: "assert.deepEqual(permute([7]), [[7]]);",
      },
      {
        name: "empty input has one (empty) permutation",
        body: "assert.deepEqual(permute([]), [[]]);",
      },
      {
        name: "four values give 24 distinct orderings",
        body: "const rows = permute([1, 2, 3, 4]);\nassert.equal(rows.length, 24);\nassert.equal(new Set(rows.map((r) => r.join(','))).size, 24);\nassert.ok(rows.every((r) => r.length === 4));",
      },
    ],
  },
  {
    id: "ex-combination-sum",
    chapter: "dsa-backtracking",
    level: "intermediate",
    title: "Combination Sum",
    brief:
      "<p>Given an array <code>candidates</code> of <b>distinct positive</b> integers and a positive integer <code>target</code>, return every combination of candidates that sums to <code>target</code>.</p><ul><li>The <b>same candidate may be reused</b> as many times as you like</li><li>Two combinations are the same if they use the same numbers the same number of times — order does not distinguish them, so return each multiset once</li><li>The combinations may be returned in <b>any order</b></li><li>If nothing sums to the target, return an empty array</li></ul>",
    starter:
      "function combinationSum(candidates, target) {\n  // TODO: every multiset of candidates (reuse allowed) that adds up to target\n}\n",
    hints: [
      "Recurse on the remaining amount: pick a candidate, subtract it, recurse. Remaining 0 is a hit, remaining below 0 is a dead end.",
      "To avoid reporting [2,3] and [3,2] as two answers, pass a start index and never look at candidates before it.",
      "Because reuse is allowed, the recursive call gets the SAME index i, not i + 1. That single character is the whole difference from the once-each variant.",
    ],
    solution:
      "function combinationSum(candidates, target) {\n  const out = [];\n  const current = [];\n  const walk = (start, remaining) => {\n    if (remaining === 0) {\n      out.push(current.slice());\n      return;\n    }\n    if (remaining < 0) return;\n    for (let i = start; i < candidates.length; i++) {\n      current.push(candidates[i]);\n      walk(i, remaining - candidates[i]);\n      current.pop();\n    }\n  };\n  walk(0, target);\n  return out;\n}\n",
    tests: [
      {
        name: "reuses a candidate",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(norm(combinationSum([2, 3, 6, 7], 7)), norm([[2,2,3],[7]]));",
      },
      {
        name: "several combinations of different lengths",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(\n  norm(combinationSum([2, 3, 5], 8)),\n  norm([[2,2,2,2],[2,3,3],[3,5]])\n);",
      },
      {
        name: "unsorted candidates still work",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(\n  norm(combinationSum([8, 7, 4, 3], 11)),\n  norm([[8,3],[7,4],[4,4,3]])\n);",
      },
      {
        name: "no combination reaches the target",
        body: "assert.deepEqual(combinationSum([2], 1), []);",
      },
      {
        name: "a single candidate used many times",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(norm(combinationSum([3], 9)), norm([[3,3,3]]));",
      },
    ],
  },
  {
    id: "ex-combination-sum-ii",
    chapter: "dsa-backtracking",
    level: "advanced",
    title: "Combination Sum II",
    brief:
      "<p>Given an array <code>candidates</code> of positive integers (which <b>may contain duplicates</b>) and a positive integer <code>target</code>, return every combination summing to <code>target</code>.</p><ul><li>Each <em>position</em> in <code>candidates</code> may be used <b>at most once</b></li><li>The returned list must not contain <b>duplicate combinations</b> — if the input has two <code>1</code>s, the combination <code>[1,7]</code> appears only once even though either <code>1</code> could have produced it</li><li>Combinations may be returned in any order</li></ul>",
    starter:
      "function combinationSum2(candidates, target) {\n  // TODO: each position used at most once, and no duplicate combinations in the output\n}\n",
    hints: [
      "Start from the reuse-allowed version and change the recursive call to i + 1 so each position is consumed once. That fixes reuse but not duplicate combinations.",
      "Sort the candidates first. Equal values are then adjacent, which is what lets you spot a repeat cheaply.",
      "Inside the loop, skip candidate i when i > start and candidates[i] === candidates[i - 1]: the first copy at this depth already explored every combination that copy could produce.",
    ],
    solution:
      "function combinationSum2(candidates, target) {\n  const sorted = candidates.slice().sort((a, b) => a - b);\n  const out = [];\n  const current = [];\n  const walk = (start, remaining) => {\n    if (remaining === 0) {\n      out.push(current.slice());\n      return;\n    }\n    for (let i = start; i < sorted.length; i++) {\n      if (i > start && sorted[i] === sorted[i - 1]) continue;\n      if (sorted[i] > remaining) break;\n      current.push(sorted[i]);\n      walk(i + 1, remaining - sorted[i]);\n      current.pop();\n    }\n  };\n  walk(0, target);\n  return out;\n}\n",
    tests: [
      {
        name: "duplicate inputs do not create duplicate combinations",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(\n  norm(combinationSum2([10, 1, 2, 7, 6, 1, 5], 8)),\n  norm([[1,1,6],[1,2,5],[1,7],[2,6]])\n);",
      },
      {
        name: "repeated value used more than once when copies exist",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(norm(combinationSum2([2, 5, 2, 1, 2], 5)), norm([[1,2,2],[5]]));",
      },
      {
        name: "both copies of a value are needed",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(norm(combinationSum2([1, 1], 2)), norm([[1,1]]));",
      },
      {
        name: "no combination reaches the target",
        body: "assert.deepEqual(combinationSum2([2, 2], 3), []);",
      },
      {
        name: "every value is too large",
        body: "assert.deepEqual(combinationSum2([5, 5, 5], 1), []);",
      },
    ],
  },
  {
    id: "ex-word-search",
    chapter: "dsa-backtracking",
    level: "advanced",
    title: "Word Search",
    brief:
      "<p>Given a grid <code>board</code> of single characters and a string <code>word</code>, return <code>true</code> if <code>word</code> can be spelled by walking through adjacent cells.</p><ul><li>Adjacent means <b>horizontally or vertically</b> neighbouring — no diagonals</li><li>The <b>same cell may not be used twice</b> in one path</li><li>The search may start at any cell</li><li>The board must be left <b>exactly as you found it</b> when the function returns</li></ul>",
    starter:
      "function exist(board, word) {\n  // TODO: can word be spelled along a path of adjacent, non-repeating cells?\n}\n",
    hints: [
      "Try starting a depth-first walk from every cell. From a cell that matches word[i], recurse into the four neighbours looking for word[i + 1].",
      "The 'no cell twice' rule needs a visited marker. The cheapest one is to overwrite the cell with a sentinel character before recursing.",
      "Whatever you overwrote must be restored immediately after the four recursive calls return — otherwise a failed path corrupts the board for every later start cell.",
    ],
    solution:
      "function exist(board, word) {\n  if (word.length === 0) return true;\n  const rows = board.length;\n  const cols = rows > 0 ? board[0].length : 0;\n  const walk = (r, c, i) => {\n    if (i === word.length) return true;\n    if (r < 0 || c < 0 || r >= rows || c >= cols) return false;\n    if (board[r][c] !== word[i]) return false;\n    const saved = board[r][c];\n    board[r][c] = '#';\n    const found =\n      walk(r + 1, c, i + 1) ||\n      walk(r - 1, c, i + 1) ||\n      walk(r, c + 1, i + 1) ||\n      walk(r, c - 1, i + 1);\n    board[r][c] = saved;\n    return found;\n  };\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (walk(r, c, 0)) return true;\n    }\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "word snakes through the grid",
        body: "const board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']];\nassert.equal(exist(board, 'ABCCED'), true);\nassert.equal(exist(board, 'SEE'), true);",
      },
      {
        name: "cannot reuse a cell",
        body: "const board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']];\nassert.equal(exist(board, 'ABCB'), false);",
      },
      {
        name: "single cell board",
        body: "assert.equal(exist([['A']], 'A'), true);\nassert.equal(exist([['A']], 'AA'), false);\nassert.equal(exist([['A']], 'B'), false);",
      },
      {
        name: "the board is restored after the search",
        body: "const board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']];\nexist(board, 'ABCESEEEFS');\nassert.deepEqual(board, [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']]);",
      },
      {
        name: "long winding path exists",
        body: "const board = [['A','B','C','E'],['S','F','E','S'],['A','D','E','E']];\nassert.equal(exist(board, 'ABCESEEEFS'), true);\nassert.equal(exist(board, 'ABCESEEEFSZ'), false);",
      },
    ],
  },
  {
    id: "ex-palindrome-partitioning",
    chapter: "dsa-backtracking",
    level: "intermediate",
    title: "Palindrome Partitioning",
    brief:
      "<p>Given a string <code>s</code>, return every way of cutting it into pieces such that <b>every piece is a palindrome</b>.</p><ul><li>The pieces of one partition must join back together to give <code>s</code>, in order — so the order <em>within</em> a partition matters</li><li>The partitions themselves may be returned in <b>any order</b></li><li>A single character is always a palindrome, so at least one partition always exists</li><li>The empty string has one partition: the empty list, so return <code>[[]]</code></li></ul>",
    starter:
      "function partition(s) {\n  // TODO: every way to cut s so that each piece reads the same forwards and backwards\n}\n",
    hints: [
      "Decide where the FIRST cut goes: try every prefix s[0..end]. If that prefix is a palindrome, recurse on the rest of the string.",
      "Carry a start index and a list of pieces chosen so far. When start reaches s.length you have a complete partition — push a copy.",
      "Write the palindrome check as a two-pointer test over an index range so you never build throwaway reversed strings.",
    ],
    solution:
      "function partition(s) {\n  const out = [];\n  const current = [];\n  const isPal = (lo, hi) => {\n    while (lo < hi) {\n      if (s[lo] !== s[hi]) return false;\n      lo++;\n      hi--;\n    }\n    return true;\n  };\n  const walk = (start) => {\n    if (start === s.length) {\n      out.push(current.slice());\n      return;\n    }\n    for (let end = start; end < s.length; end++) {\n      if (!isPal(start, end)) continue;\n      current.push(s.slice(start, end + 1));\n      walk(end + 1);\n      current.pop();\n    }\n  };\n  walk(0);\n  return out;\n}\n",
    tests: [
      {
        name: "two ways to cut aab",
        body: "const norm = (rows) => rows.map((r) => r.join('|')).sort();\nassert.deepEqual(norm(partition('aab')), norm([['a','a','b'],['aa','b']]));",
      },
      {
        name: "a whole-string palindrome is one of the answers",
        body: "const norm = (rows) => rows.map((r) => r.join('|')).sort();\nassert.deepEqual(norm(partition('aba')), norm([['a','b','a'],['aba']]));",
      },
      {
        name: "single character",
        body: "assert.deepEqual(partition('a'), [['a']]);",
      },
      {
        name: "empty string",
        body: "assert.deepEqual(partition(''), [[]]);",
      },
      {
        name: "no multi-character palindromes",
        body: "const norm = (rows) => rows.map((r) => r.join('|')).sort();\nassert.deepEqual(norm(partition('abc')), norm([['a','b','c']]));",
      },
    ],
  },
  {
    id: "ex-n-queens-count",
    chapter: "dsa-advanced-backtracking",
    level: "advanced",
    title: "N-Queens — Count the Solutions",
    brief:
      "<p>On an <code>n × n</code> chessboard, place <code>n</code> queens so that no two attack each other. Return <b>how many distinct arrangements</b> exist.</p><ul><li>Two queens attack each other if they share a <b>row</b>, a <b>column</b>, or a <b>diagonal</b></li><li>Reflections and rotations count as distinct arrangements</li><li><code>n = 4</code> has 2 solutions; <code>n = 2</code> and <code>n = 3</code> have none</li><li><code>n = 8</code> — the classic board — has 92, and must finish quickly, so prune as you go rather than generating all placements and filtering</li></ul>",
    starter:
      "function totalNQueens(n) {\n  // TODO: count the ways to place n non-attacking queens on an n x n board\n}\n",
    hints: [
      "Exactly one queen goes in each row, so recurse row by row and only choose a column. That kills the row constraint for free.",
      "Checking every placed queen at each step is slow. Keep three Sets: used columns, used '\\' diagonals, and used '/' diagonals.",
      "Every cell on the same '\\' diagonal has the same value of row - col, and every cell on the same '/' diagonal has the same row + col. Add all three markers before recursing, remove all three after.",
    ],
    solution:
      "function totalNQueens(n) {\n  const cols = new Set();\n  const down = new Set(); // row - col\n  const up = new Set(); // row + col\n  let count = 0;\n  const place = (row) => {\n    if (row === n) {\n      count++;\n      return;\n    }\n    for (let c = 0; c < n; c++) {\n      if (cols.has(c) || down.has(row - c) || up.has(row + c)) continue;\n      cols.add(c);\n      down.add(row - c);\n      up.add(row + c);\n      place(row + 1);\n      cols.delete(c);\n      down.delete(row - c);\n      up.delete(row + c);\n    }\n  };\n  place(0);\n  return count;\n}\n",
    tests: [
      {
        name: "a single queen on a 1x1 board",
        body: "assert.equal(totalNQueens(1), 1);",
      },
      {
        name: "2 and 3 are impossible",
        body: "assert.equal(totalNQueens(2), 0);\nassert.equal(totalNQueens(3), 0);",
      },
      {
        name: "the classic 4x4 answer",
        body: "assert.equal(totalNQueens(4), 2);",
      },
      {
        name: "6x6 has four arrangements",
        body: "assert.equal(totalNQueens(6), 4);",
      },
      {
        name: "the full chessboard has 92",
        body: "assert.equal(totalNQueens(8), 92);",
      },
    ],
  },
  {
    id: "ex-letter-combinations-phone",
    chapter: "dsa-backtracking",
    level: "intermediate",
    title: "Letter Combinations of a Phone Number",
    brief:
      "<p>Given a string of digits <code>2</code>–<code>9</code>, return every letter combination the number could spell on an old telephone keypad.</p><ul><li><code>2</code>=abc, <code>3</code>=def, <code>4</code>=ghi, <code>5</code>=jkl, <code>6</code>=mno, <code>7</code>=pqrs, <code>8</code>=tuv, <code>9</code>=wxyz</li><li>Every combination has exactly one letter per digit, in the digits' own order</li><li>The combinations may be returned in <b>any order</b></li><li>An empty input returns an empty array — <em>not</em> an array holding the empty string</li></ul>",
    starter:
      "function letterCombinations(digits) {\n  // TODO: every string formed by taking one letter from each digit's keypad group\n}\n",
    hints: [
      "Store the keypad as a plain object from digit character to its letters, so digits[i] indexes straight into it.",
      "Recurse on the digit position, carrying the string built so far. At position === digits.length you have a complete combination.",
      "Handle the empty input before you start — the recursion would otherwise report one answer, the empty string, which the spec forbids.",
    ],
    solution:
      "function letterCombinations(digits) {\n  if (digits.length === 0) return [];\n  const pad = {\n    '2': 'abc',\n    '3': 'def',\n    '4': 'ghi',\n    '5': 'jkl',\n    '6': 'mno',\n    '7': 'pqrs',\n    '8': 'tuv',\n    '9': 'wxyz',\n  };\n  const out = [];\n  const walk = (i, built) => {\n    if (i === digits.length) {\n      out.push(built);\n      return;\n    }\n    for (const ch of pad[digits[i]]) walk(i + 1, built + ch);\n  };\n  walk(0, '');\n  return out;\n}\n",
    tests: [
      {
        name: "two digits give nine combinations",
        body: "const out = letterCombinations('23').slice().sort();\nassert.deepEqual(out, ['ad','ae','af','bd','be','bf','cd','ce','cf']);",
      },
      {
        name: "empty input gives an empty array",
        body: "assert.deepEqual(letterCombinations(''), []);",
      },
      {
        name: "one digit gives its letters",
        body: "assert.deepEqual(letterCombinations('7').slice().sort(), ['p','q','r','s']);",
      },
      {
        name: "four-letter keys multiply out",
        body: "const out = letterCombinations('79');\nassert.equal(out.length, 16);\nassert.ok(out.indexOf('pw') !== -1);\nassert.ok(out.indexOf('sz') !== -1);\nassert.ok(out.every((s) => s.length === 2));",
      },
      {
        name: "three digits keep the digit order",
        body: "const out = letterCombinations('234');\nassert.equal(out.length, 27);\nassert.equal(new Set(out).size, 27);\nassert.ok(out.indexOf('adg') !== -1);\nassert.ok(out.indexOf('gda') === -1);",
      },
    ],
  },
  {
    id: "ex-merge-intervals",
    chapter: "dsa-intervals",
    level: "intermediate",
    title: "Merge Intervals",
    brief:
      "<p>Given an array of intervals where <code>intervals[i] = [start, end]</code>, merge every group that overlaps and return the resulting non-overlapping intervals.</p><ul><li>The input is <b>not sorted</b></li><li>Intervals that merely touch, such as <code>[1,4]</code> and <code>[4,5]</code>, count as overlapping and merge into <code>[1,5]</code></li><li>Return the merged intervals sorted by start</li><li>An empty input returns an empty array</li></ul>",
    starter: "function merge(intervals) {\n  // TODO: combine every overlapping group into a single interval\n}\n",
    hints: [
      "Comparing every pair is O(n^2). Sorting by start first means any interval can only ever overlap the one you most recently emitted.",
      "Sweep the sorted list keeping the last interval you pushed to the output. If the next start is <= that interval's end, they overlap.",
      "Merging means widening the end to the LARGER of the two ends — the next interval can be fully contained, in which case the end must not shrink.",
    ],
    solution:
      "function merge(intervals) {\n  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);\n  const out = [];\n  for (const span of sorted) {\n    const last = out[out.length - 1];\n    if (last && span[0] <= last[1]) {\n      if (span[1] > last[1]) last[1] = span[1];\n    } else {\n      out.push([span[0], span[1]]);\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "merges one overlapping pair",
        body: "assert.deepEqual(\n  merge([[1,3],[2,6],[8,10],[15,18]]),\n  [[1,6],[8,10],[15,18]]\n);",
      },
      {
        name: "touching intervals merge",
        body: "assert.deepEqual(merge([[1,4],[4,5]]), [[1,5]]);",
      },
      {
        name: "a fully contained interval does not shrink the end",
        body: "assert.deepEqual(merge([[1,4],[2,3]]), [[1,4]]);",
      },
      {
        name: "unsorted input is handled",
        body: "assert.deepEqual(merge([[5,6],[1,2],[3,4]]), [[1,2],[3,4],[5,6]]);",
      },
      {
        name: "empty input and a lone interval",
        body: "assert.deepEqual(merge([]), []);\nassert.deepEqual(merge([[7,7]]), [[7,7]]);",
      },
    ],
  },
  {
    id: "ex-insert-interval",
    chapter: "dsa-intervals",
    level: "intermediate",
    title: "Insert Interval",
    brief:
      "<p>Given a list of <b>non-overlapping</b> intervals already <b>sorted by start</b>, insert <code>newInterval</code> and return the list still sorted and still non-overlapping.</p><ul><li>Merge the new interval with any it overlaps or touches</li><li>The result must remain sorted by start</li><li>Inserting into an empty list yields a list holding just the new interval</li><li>Because the input is already sorted, this can be done in a <b>single O(n) pass</b> with no re-sorting</li></ul>",
    starter:
      "function insert(intervals, newInterval) {\n  // TODO: place newInterval into the sorted list, merging anything it touches\n}\n",
    hints: [
      "The list splits into three regions: intervals entirely before the new one, intervals that overlap it, and intervals entirely after it. Walk them in that order.",
      "An interval is entirely before when its end is strictly less than the new start — copy those straight through.",
      "While an interval's start is <= the running end, absorb it: pull the start down to the smaller start and push the end up to the larger end. Push the merged interval once, then copy the tail.",
    ],
    solution:
      "function insert(intervals, newInterval) {\n  const out = [];\n  let start = newInterval[0];\n  let end = newInterval[1];\n  let i = 0;\n  while (i < intervals.length && intervals[i][1] < start) {\n    out.push(intervals[i]);\n    i++;\n  }\n  while (i < intervals.length && intervals[i][0] <= end) {\n    start = Math.min(start, intervals[i][0]);\n    end = Math.max(end, intervals[i][1]);\n    i++;\n  }\n  out.push([start, end]);\n  while (i < intervals.length) {\n    out.push(intervals[i]);\n    i++;\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "merges with one neighbour",
        body: "assert.deepEqual(insert([[1,3],[6,9]], [2,5]), [[1,5],[6,9]]);",
      },
      {
        name: "swallows several intervals",
        body: "assert.deepEqual(\n  insert([[1,2],[3,5],[6,7],[8,10],[12,16]], [4,8]),\n  [[1,2],[3,10],[12,16]]\n);",
      },
      {
        name: "inserting into an empty list",
        body: "assert.deepEqual(insert([], [5,7]), [[5,7]]);",
      },
      {
        name: "fully contained interval changes nothing",
        body: "assert.deepEqual(insert([[1,5]], [2,3]), [[1,5]]);",
      },
      {
        name: "no overlap, before and after",
        body: "assert.deepEqual(insert([[3,5]], [6,8]), [[3,5],[6,8]]);\nassert.deepEqual(insert([[3,5]], [1,2]), [[1,2],[3,5]]);\nassert.deepEqual(insert([[3,5]], [5,8]), [[3,8]]);",
      },
    ],
  },
  {
    id: "ex-non-overlapping-intervals",
    chapter: "dsa-intervals",
    level: "intermediate",
    title: "Non-overlapping Intervals",
    brief:
      "<p>Given an array of intervals, return the <b>minimum number you must remove</b> so that the ones left over do not overlap.</p><ul><li>Intervals that only touch at an endpoint, such as <code>[1,2]</code> and <code>[2,3]</code>, do <b>not</b> overlap</li><li>The input is not sorted</li><li>An empty input needs no removals</li><li>Removing the fewest is the same as <em>keeping</em> the most — solve the easier one</li></ul>",
    starter:
      "function eraseOverlapIntervals(intervals) {\n  // TODO: fewest removals that leave a non-overlapping set\n}\n",
    hints: [
      "Flip the question: maximise how many intervals you keep, then the answer is total - kept.",
      "This is the classic activity-selection greedy. Sort by END, not by start — the interval that finishes earliest leaves the most room for everything after it.",
      "Sweep the end-sorted list, keeping a running 'last kept end'. Keep an interval when its start is >= that end, and update the end; otherwise skip it.",
    ],
    solution:
      "function eraseOverlapIntervals(intervals) {\n  if (intervals.length === 0) return 0;\n  const sorted = intervals.slice().sort((a, b) => a[1] - b[1]);\n  let kept = 1;\n  let end = sorted[0][1];\n  for (let i = 1; i < sorted.length; i++) {\n    if (sorted[i][0] >= end) {\n      kept++;\n      end = sorted[i][1];\n    }\n  }\n  return intervals.length - kept;\n}\n",
    tests: [
      {
        name: "one removal is enough",
        body: "assert.equal(eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]]), 1);",
      },
      {
        name: "identical intervals",
        body: "assert.equal(eraseOverlapIntervals([[1,2],[1,2],[1,2]]), 2);",
      },
      {
        name: "touching intervals need no removal",
        body: "assert.equal(eraseOverlapIntervals([[1,2],[2,3]]), 0);",
      },
      {
        name: "empty input and a single interval",
        body: "assert.equal(eraseOverlapIntervals([]), 0);\nassert.equal(eraseOverlapIntervals([[5,9]]), 0);",
      },
      {
        name: "a long interval must be dropped, not the short ones",
        body: "assert.equal(eraseOverlapIntervals([[1,100],[11,22],[1,11],[2,12]]), 2);",
      },
    ],
  },
  {
    id: "ex-meeting-rooms",
    chapter: "dsa-intervals",
    level: "beginner",
    title: "Meeting Rooms",
    brief:
      "<p>Given an array of meeting time intervals <code>[start, end]</code>, return <code>true</code> if one person could attend <b>all</b> of them.</p><ul><li>Two meetings clash if one starts <b>strictly before</b> the other ends</li><li>Back-to-back meetings such as <code>[1,5]</code> and <code>[5,9]</code> are fine</li><li>The input is not sorted</li><li>An empty schedule, or a schedule with one meeting, is always attendable</li></ul>",
    starter: "function canAttendMeetings(intervals) {\n  // TODO: true when no two meetings overlap\n}\n",
    hints: [
      "Comparing every pair works but is O(n^2). Sorting by start time means a clash can only ever be with the immediately previous meeting.",
      "After sorting, walk from index 1 and return false the moment a meeting starts strictly before the previous one ends. Note 'strictly' — equal values are back-to-back, not a clash.",
    ],
    solution:
      "function canAttendMeetings(intervals) {\n  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);\n  for (let i = 1; i < sorted.length; i++) {\n    if (sorted[i][0] < sorted[i - 1][1]) return false;\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "overlapping meetings",
        body: "assert.equal(canAttendMeetings([[0,30],[5,10],[15,20]]), false);",
      },
      {
        name: "unsorted but compatible",
        body: "assert.equal(canAttendMeetings([[7,10],[2,4]]), true);",
      },
      {
        name: "back-to-back is allowed",
        body: "assert.equal(canAttendMeetings([[1,5],[5,9]]), true);",
      },
      {
        name: "one minute of overlap is a clash",
        body: "assert.equal(canAttendMeetings([[1,5],[4,9]]), false);",
      },
      {
        name: "empty and single-meeting schedules",
        body: "assert.equal(canAttendMeetings([]), true);\nassert.equal(canAttendMeetings([[3,8]]), true);",
      },
    ],
  },
  {
    id: "ex-spiral-matrix",
    chapter: "dsa-matrix-problems",
    level: "beginner",
    title: "Spiral Matrix",
    brief:
      "<p>Given an <code>m × n</code> matrix, return all of its values in <b>spiral order</b>: left to right across the top, down the right side, right to left along the bottom, up the left side, then inwards and repeat.</p><ul><li>The matrix need not be square</li><li>A single row or a single column is a valid input</li><li>An empty matrix returns an empty array</li><li>Every value appears in the output exactly once</li></ul>",
    starter: "function spiralOrder(matrix) {\n  // TODO: read the matrix in spiral order into a flat array\n}\n",
    hints: [
      "Keep four boundaries — top, bottom, left, right — and peel one edge at a time, shrinking the matching boundary after each edge.",
      "Loop while top <= bottom AND left <= right, doing the four edges in order: top row, right column, bottom row, left column.",
      "The last two edges need a guard. After shrinking, a single leftover row would otherwise be read twice — check top <= bottom before the bottom row and left <= right before the left column.",
    ],
    solution:
      "function spiralOrder(matrix) {\n  const out = [];\n  if (matrix.length === 0 || matrix[0].length === 0) return out;\n  let top = 0;\n  let bottom = matrix.length - 1;\n  let left = 0;\n  let right = matrix[0].length - 1;\n  while (top <= bottom && left <= right) {\n    for (let c = left; c <= right; c++) out.push(matrix[top][c]);\n    top++;\n    for (let r = top; r <= bottom; r++) out.push(matrix[r][right]);\n    right--;\n    if (top <= bottom) {\n      for (let c = right; c >= left; c--) out.push(matrix[bottom][c]);\n      bottom--;\n    }\n    if (left <= right) {\n      for (let r = bottom; r >= top; r--) out.push(matrix[r][left]);\n      left++;\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "3x3 spiral",
        body: "assert.deepEqual(\n  spiralOrder([[1,2,3],[4,5,6],[7,8,9]]),\n  [1,2,3,6,9,8,7,4,5]\n);",
      },
      {
        name: "wider than tall",
        body: "assert.deepEqual(\n  spiralOrder([[1,2,3,4],[5,6,7,8],[9,10,11,12]]),\n  [1,2,3,4,8,12,11,10,9,5,6,7]\n);",
      },
      {
        name: "single row and single column",
        body: "assert.deepEqual(spiralOrder([[1,2,3]]), [1,2,3]);\nassert.deepEqual(spiralOrder([[1],[2],[3]]), [1,2,3]);",
      },
      {
        name: "empty matrix",
        body: "assert.deepEqual(spiralOrder([]), []);\nassert.deepEqual(spiralOrder([[]]), []);",
      },
      {
        name: "4x4 reaches the centre",
        body: "assert.deepEqual(\n  spiralOrder([[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]),\n  [1,2,3,4,8,12,16,15,14,13,9,5,6,7,11,10]\n);",
      },
    ],
  },
  {
    id: "ex-rotate-image",
    chapter: "dsa-matrix-problems",
    level: "intermediate",
    title: "Rotate Image",
    brief:
      "<p>Given an <code>n × n</code> matrix, rotate it 90° <b>clockwise</b>, <b>in place</b>.</p><ul><li>You must modify the matrix you were given — allocating a second matrix and returning it does not count</li><li>The return value is ignored; the caller reads the matrix it passed in</li><li>After the rotation, the first column read bottom-to-top becomes the first row</li><li>A 1×1 matrix is unchanged</li></ul>",
    starter: "function rotate(matrix) {\n  // TODO: rotate the matrix 90 degrees clockwise, modifying it in place\n}\n",
    hints: [
      "Rotating by 90° clockwise is two simpler in-place moves composed together. Try writing out a small example and looking for them.",
      "First transpose: swap matrix[r][c] with matrix[c][r]. Then reverse each row left-to-right. Together that is exactly a clockwise quarter turn.",
      "When transposing, only iterate over c > r. Looping over the whole square swaps every pair twice and leaves the matrix untouched.",
    ],
    solution:
      "function rotate(matrix) {\n  const n = matrix.length;\n  for (let r = 0; r < n; r++) {\n    for (let c = r + 1; c < n; c++) {\n      const tmp = matrix[r][c];\n      matrix[r][c] = matrix[c][r];\n      matrix[c][r] = tmp;\n    }\n  }\n  for (const row of matrix) {\n    let lo = 0;\n    let hi = n - 1;\n    while (lo < hi) {\n      const tmp = row[lo];\n      row[lo] = row[hi];\n      row[hi] = tmp;\n      lo++;\n      hi--;\n    }\n  }\n}\n",
    tests: [
      {
        name: "2x2 rotates in place",
        body: "const m = [[1,2],[3,4]];\nrotate(m);\nassert.deepEqual(m, [[3,1],[4,2]]);",
      },
      {
        name: "3x3 rotates in place",
        body: "const m = [[1,2,3],[4,5,6],[7,8,9]];\nrotate(m);\nassert.deepEqual(m, [[7,4,1],[8,5,2],[9,6,3]]);",
      },
      {
        name: "4x4 rotates in place",
        body: "const m = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]];\nrotate(m);\nassert.deepEqual(m, [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]);",
      },
      {
        name: "1x1 is unchanged",
        body: "const m = [[42]];\nrotate(m);\nassert.deepEqual(m, [[42]]);",
      },
      {
        name: "four rotations return to the original",
        body: "const m = [[1,2,3],[4,5,6],[7,8,9]];\nrotate(m);\nrotate(m);\nrotate(m);\nrotate(m);\nassert.deepEqual(m, [[1,2,3],[4,5,6],[7,8,9]]);",
      },
    ],
  },
  {
    id: "ex-set-matrix-zeroes",
    chapter: "dsa-matrix-problems",
    level: "advanced",
    title: "Set Matrix Zeroes",
    brief:
      "<p>Given an <code>m × n</code> matrix, if any cell holds <code>0</code>, set that cell's entire row and column to <code>0</code>. Do it <b>in place</b>.</p><ul><li>Only the zeros present in the <em>original</em> matrix trigger a wipe — zeros you write must not cascade</li><li>You must use <b>O(1)</b> extra space: no m×n copy, and no arrays of row/column flags</li><li>The trick is to store the flags inside the matrix itself</li><li>The return value is ignored; the caller reads the matrix it passed in</li></ul>",
    starter:
      "function setZeroes(matrix) {\n  // TODO: zero out the row and column of every original zero, using O(1) extra space\n}\n",
    hints: [
      "Zeroing as you scan is wrong: a written zero would then wipe its own row and column. You need to record which rows and columns to wipe, and only then wipe them.",
      "The O(1) trick is to use the first row and the first column as those flag arrays: a zero at [r][c] sets matrix[r][0] and matrix[0][c] to 0.",
      "The first row and column are also real data, so before overwriting them record in two booleans whether each of them originally contained a zero — and apply those two booleans LAST.",
    ],
    solution:
      "function setZeroes(matrix) {\n  const rows = matrix.length;\n  if (rows === 0) return;\n  const cols = matrix[0].length;\n  if (cols === 0) return;\n  let firstRowZero = false;\n  let firstColZero = false;\n  for (let c = 0; c < cols; c++) {\n    if (matrix[0][c] === 0) firstRowZero = true;\n  }\n  for (let r = 0; r < rows; r++) {\n    if (matrix[r][0] === 0) firstColZero = true;\n  }\n  for (let r = 1; r < rows; r++) {\n    for (let c = 1; c < cols; c++) {\n      if (matrix[r][c] === 0) {\n        matrix[r][0] = 0;\n        matrix[0][c] = 0;\n      }\n    }\n  }\n  for (let r = 1; r < rows; r++) {\n    for (let c = 1; c < cols; c++) {\n      if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0;\n    }\n  }\n  if (firstRowZero) {\n    for (let c = 0; c < cols; c++) matrix[0][c] = 0;\n  }\n  if (firstColZero) {\n    for (let r = 0; r < rows; r++) matrix[r][0] = 0;\n  }\n}\n",
    tests: [
      {
        name: "one interior zero wipes a cross",
        body: "const m = [[1,1,1],[1,0,1],[1,1,1]];\nsetZeroes(m);\nassert.deepEqual(m, [[1,0,1],[0,0,0],[1,0,1]]);",
      },
      {
        name: "zeros in the first row and first column",
        body: "const m = [[0,1,2,0],[3,4,5,2],[1,3,1,5]];\nsetZeroes(m);\nassert.deepEqual(m, [[0,0,0,0],[0,4,5,0],[0,3,1,0]]);",
      },
      {
        name: "written zeros do not cascade",
        body: "const m = [[1,0],[1,1]];\nsetZeroes(m);\nassert.deepEqual(m, [[0,0],[1,0]]);",
      },
      {
        name: "no zeros leaves the matrix alone",
        body: "const m = [[1,2],[3,4]];\nsetZeroes(m);\nassert.deepEqual(m, [[1,2],[3,4]]);",
      },
      {
        name: "single cell and a single row",
        body: "const a = [[0]];\nsetZeroes(a);\nassert.deepEqual(a, [[0]]);\nconst b = [[1,0,3]];\nsetZeroes(b);\nassert.deepEqual(b, [[0,0,0]]);",
      },
    ],
  },
  {
    id: "ex-search-2d-matrix-ii",
    chapter: "dsa-matrix-problems",
    level: "advanced",
    title: "Search a 2D Matrix II",
    brief:
      "<p>Search a value in an <code>m × n</code> matrix where <b>every row is sorted left to right</b> and <b>every column is sorted top to bottom</b>. Return <code>true</code> if <code>target</code> is present.</p><ul><li>The rows are <em>not</em> one long sorted sequence — a row can start lower than the previous row ended, so a plain binary search over the flattened matrix is wrong</li><li>Aim for <b>O(m + n)</b> time and O(1) space</li><li>An empty matrix returns <code>false</code></li></ul>",
    starter:
      "function searchMatrix(matrix, target) {\n  // TODO: exploit that rows AND columns are sorted; O(m + n), no full scan\n}\n",
    hints: [
      "Look for a starting cell where the two directions disagree — one makes values larger, the other makes them smaller. The middle is useless here; a corner is not.",
      "Start at the TOP-RIGHT cell. Everything to its left is smaller and everything below is larger, so one comparison eliminates a whole row or a whole column.",
      "If the cell is greater than the target move left, if it is smaller move down, and stop when you fall off the grid. The bottom-left corner works symmetrically.",
    ],
    solution:
      "function searchMatrix(matrix, target) {\n  if (matrix.length === 0 || matrix[0].length === 0) return false;\n  let r = 0;\n  let c = matrix[0].length - 1;\n  while (r < matrix.length && c >= 0) {\n    const value = matrix[r][c];\n    if (value === target) return true;\n    if (value > target) c--;\n    else r++;\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "finds a value in the middle",
        body: "const m = [\n  [1,4,7,11,15],\n  [2,5,8,12,19],\n  [3,6,9,16,22],\n  [10,13,14,17,24],\n  [18,21,23,26,30],\n];\nassert.equal(searchMatrix(m, 5), true);\nassert.equal(searchMatrix(m, 20), false);",
      },
      {
        name: "finds the corners",
        body: "const m = [\n  [1,4,7,11,15],\n  [2,5,8,12,19],\n  [3,6,9,16,22],\n  [10,13,14,17,24],\n  [18,21,23,26,30],\n];\nassert.equal(searchMatrix(m, 1), true);\nassert.equal(searchMatrix(m, 15), true);\nassert.equal(searchMatrix(m, 18), true);\nassert.equal(searchMatrix(m, 30), true);",
      },
      {
        name: "out of range targets",
        body: "const m = [[1,4],[2,5]];\nassert.equal(searchMatrix(m, 0), false);\nassert.equal(searchMatrix(m, 99), false);",
      },
      {
        name: "single row and single column",
        body: "assert.equal(searchMatrix([[1,3,5]], 3), true);\nassert.equal(searchMatrix([[1,3,5]], 4), false);\nassert.equal(searchMatrix([[1],[3],[5]], 5), true);\nassert.equal(searchMatrix([[1],[3],[5]], 2), false);",
      },
      {
        name: "empty matrix",
        body: "assert.equal(searchMatrix([], 1), false);\nassert.equal(searchMatrix([[]], 1), false);",
      },
    ],
  },
  {
    id: "ex-implement-trie",
    chapter: "dsa-tries",
    level: "intermediate",
    title: "Implement Trie (Prefix Tree)",
    brief:
      "<p>Implement a <b>trie</b>: a tree where each edge is a character, so words that share a prefix share a path.</p><ul><li><code>insert(word)</code> — add a word</li><li><code>search(word)</code> — <code>true</code> only if that exact word was inserted</li><li><code>startsWith(prefix)</code> — <code>true</code> if any inserted word begins with <code>prefix</code></li><li>Every operation must run in <b>O(length of the string)</b>, independent of how many words are stored — so no scanning a list of words</li><li>Words are lowercase letters. Inserting the same word twice is harmless</li></ul>",
    starter:
      "class Trie {\n  constructor() {\n    // TODO: create the empty root node\n  }\n\n  insert(word) {\n    // TODO: walk the characters, creating nodes as needed\n  }\n\n  search(word) {\n    // TODO: true only for a complete inserted word\n  }\n\n  startsWith(prefix) {\n    // TODO: true if any word starts with prefix\n  }\n}\n",
    hints: [
      "A node needs two things: a map from the next character to a child node, and a flag saying 'a word ends here'.",
      "search and startsWith share all their work — both walk the characters and bail out when a child is missing. Factor that walk into a helper that returns the node it landed on, or null.",
      "The only difference is the last step: startsWith is happy that the node exists, search additionally requires its end-of-word flag. Without that flag, inserting 'apple' would make 'app' look like a stored word.",
    ],
    solution:
      "class TrieNode {\n  constructor() {\n    this.children = new Map();\n    this.isWord = false;\n  }\n}\n\nclass Trie {\n  constructor() {\n    this.root = new TrieNode();\n  }\n\n  insert(word) {\n    let node = this.root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());\n      node = node.children.get(ch);\n    }\n    node.isWord = true;\n  }\n\n  nodeFor(prefix) {\n    let node = this.root;\n    for (const ch of prefix) {\n      if (!node.children.has(ch)) return null;\n      node = node.children.get(ch);\n    }\n    return node;\n  }\n\n  search(word) {\n    const node = this.nodeFor(word);\n    return node !== null && node.isWord;\n  }\n\n  startsWith(prefix) {\n    return this.nodeFor(prefix) !== null;\n  }\n}\n",
    tests: [
      {
        name: "insert then search and startsWith",
        body: "const t = new Trie();\nt.insert('apple');\nassert.equal(t.search('apple'), true);\nassert.equal(t.search('app'), false);\nassert.equal(t.startsWith('app'), true);\nt.insert('app');\nassert.equal(t.search('app'), true);",
      },
      {
        name: "unknown words and prefixes",
        body: "const t = new Trie();\nt.insert('banana');\nassert.equal(t.search('band'), false);\nassert.equal(t.startsWith('band'), false);\nassert.equal(t.startsWith('ban'), true);\nassert.equal(t.search('bananas'), false);",
      },
      {
        name: "shared prefixes stay independent",
        body: "const t = new Trie();\nt.insert('car');\nt.insert('card');\nt.insert('care');\nassert.equal(t.search('car'), true);\nassert.equal(t.search('card'), true);\nassert.equal(t.search('care'), true);\nassert.equal(t.search('ca'), false);\nassert.equal(t.startsWith('care'), true);",
      },
      {
        name: "empty trie and repeated inserts",
        body: "const t = new Trie();\nassert.equal(t.search('a'), false);\nassert.equal(t.startsWith('a'), false);\nt.insert('a');\nt.insert('a');\nassert.equal(t.search('a'), true);",
      },
      {
        name: "two tries do not share state",
        body: "const a = new Trie();\nconst b = new Trie();\na.insert('hello');\nassert.equal(a.search('hello'), true);\nassert.equal(b.search('hello'), false);\nassert.equal(b.startsWith('h'), false);",
      },
    ],
  },
  {
    id: "ex-add-and-search-words",
    chapter: "dsa-tries",
    level: "advanced",
    title: "Design Add and Search Words",
    brief:
      "<p>Design a dictionary that supports wildcard lookups.</p><ul><li><code>addWord(word)</code> — store a word of lowercase letters</li><li><code>search(word)</code> — <code>true</code> if any stored word matches. The query may contain <code>'.'</code>, which matches <b>any single letter</b></li><li>The match must cover the whole word: a query of length 3 only matches stored words of length 3</li><li>So after adding <code>'bad'</code>: <code>'.ad'</code> and <code>'b..'</code> match, <code>'b.'</code> does not</li><li>Do not scan every stored word on each query — build a trie</li></ul>",
    starter:
      "class WordDictionary {\n  constructor() {\n    // TODO: create the empty root node\n  }\n\n  addWord(word) {\n    // TODO: store the word\n  }\n\n  search(word) {\n    // TODO: match the word, where '.' matches any single letter\n  }\n}\n",
    hints: [
      "Store the words in an ordinary trie — addWord is unchanged from the plain version. All the difficulty is in search.",
      "Search becomes recursive: a helper takes (node, index). A normal letter has one child to follow, so the recursion stays a straight line.",
      "A '.' has no single child to follow, so try them all: recurse into every child and return true if any branch succeeds. When the index reaches the end, the answer is that node's end-of-word flag — not merely that you arrived.",
    ],
    solution:
      "class WordDictionary {\n  constructor() {\n    this.root = { children: new Map(), isWord: false };\n  }\n\n  addWord(word) {\n    let node = this.root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) {\n        node.children.set(ch, { children: new Map(), isWord: false });\n      }\n      node = node.children.get(ch);\n    }\n    node.isWord = true;\n  }\n\n  search(word) {\n    const walk = (node, i) => {\n      if (i === word.length) return node.isWord;\n      const ch = word[i];\n      if (ch === '.') {\n        for (const child of node.children.values()) {\n          if (walk(child, i + 1)) return true;\n        }\n        return false;\n      }\n      const next = node.children.get(ch);\n      return next === undefined ? false : walk(next, i + 1);\n    };\n    return walk(this.root, 0);\n  }\n}\n",
    tests: [
      {
        name: "the classic sequence",
        body: "const d = new WordDictionary();\nd.addWord('bad');\nd.addWord('dad');\nd.addWord('mad');\nassert.equal(d.search('pad'), false);\nassert.equal(d.search('bad'), true);\nassert.equal(d.search('.ad'), true);\nassert.equal(d.search('b..'), true);",
      },
      {
        name: "length must match exactly",
        body: "const d = new WordDictionary();\nd.addWord('bad');\nassert.equal(d.search('b.'), false);\nassert.equal(d.search('b...'), false);\nassert.equal(d.search('...'), true);",
      },
      {
        name: "a prefix of a stored word is not a match",
        body: "const d = new WordDictionary();\nd.addWord('apple');\nassert.equal(d.search('app'), false);\nassert.equal(d.search('appl.'), true);\nd.addWord('app');\nassert.equal(d.search('app'), true);",
      },
      {
        name: "all wildcards and an empty dictionary",
        body: "const empty = new WordDictionary();\nassert.equal(empty.search('a'), false);\nassert.equal(empty.search('.'), false);\nconst d = new WordDictionary();\nd.addWord('at');\nassert.equal(d.search('..'), true);\nassert.equal(d.search('.'), false);",
      },
      {
        name: "backtracks past a dead branch",
        body: "const d = new WordDictionary();\nd.addWord('at');\nd.addWord('and');\nd.addWord('an');\nd.addWord('add');\nassert.equal(d.search('a'), false);\nassert.equal(d.search('.at'), false);\nassert.equal(d.search('an.'), true);\nassert.equal(d.search('a.d.'), false);\nassert.equal(d.search('a.d'), true);\nassert.equal(d.search('.'), false);",
      },
    ],
  },
  {
    id: "ex-word-search-ii",
    chapter: "dsa-tries",
    level: "advanced",
    title: "Word Search II",
    brief:
      "<p>Given a character grid <code>board</code> and a list of <code>words</code>, return every word that can be spelled by walking through adjacent cells.</p><ul><li>Adjacent means horizontally or vertically neighbouring; a cell may not be reused within one word</li><li>Each found word appears in the result <b>once</b>, in any order</li><li>Running the single-word search once per word is far too slow — build a <b>trie</b> of the words and walk the board once, abandoning a path as soon as it leaves the trie</li><li>The board must be left exactly as you found it</li></ul>",
    starter:
      "function findWords(board, words) {\n  // TODO: build a trie of words, then walk the board once, pruning dead prefixes\n}\n",
    hints: [
      "Insert every word into a trie first. Now one depth-first walk of the board can hunt for all of them at once: the current trie node tells you which letters are still worth trying.",
      "Descend the board and the trie in lockstep. If the current cell's letter has no child in the trie node, that whole branch is dead — return immediately.",
      "Store the finished word on its terminal trie node. When you land on such a node, record the word and then CLEAR it, which both deduplicates the result and prunes the node. As always, restore the board cell after recursing.",
    ],
    solution:
      "function findWords(board, words) {\n  const root = {};\n  for (const w of words) {\n    let node = root;\n    for (const ch of w) {\n      if (!node[ch]) node[ch] = {};\n      node = node[ch];\n    }\n    node.word = w;\n  }\n  const rows = board.length;\n  const cols = rows > 0 ? board[0].length : 0;\n  const out = [];\n  const walk = (r, c, node) => {\n    if (r < 0 || c < 0 || r >= rows || c >= cols) return;\n    const ch = board[r][c];\n    const next = node[ch];\n    if (!next) return;\n    if (next.word) {\n      out.push(next.word);\n      next.word = null;\n    }\n    board[r][c] = '#';\n    walk(r + 1, c, next);\n    walk(r - 1, c, next);\n    walk(r, c + 1, next);\n    walk(r, c - 1, next);\n    board[r][c] = ch;\n  };\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) walk(r, c, root);\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "finds two of four words",
        body: "const board = [\n  ['o','a','a','n'],\n  ['e','t','a','e'],\n  ['i','h','k','r'],\n  ['i','f','l','v'],\n];\nconst out = findWords(board, ['oath','pea','eat','rain']).slice().sort();\nassert.deepEqual(out, ['eat', 'oath']);",
      },
      {
        name: "no word can be spelled",
        body: "assert.deepEqual(findWords([['a','b'],['c','d']], ['abcb']), []);\nassert.deepEqual(findWords([['a','a']], ['aaa']), []);",
      },
      {
        name: "each word is reported only once",
        body: "const out = findWords([['a','a']], ['a']);\nassert.deepEqual(out, ['a']);",
      },
      {
        name: "the board is restored",
        body: "const board = [['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']];\nfindWords(board, ['oath','eat','oat','hklv']);\nassert.deepEqual(board, [['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']]);",
      },
      {
        name: "overlapping words and empty inputs",
        body: "const board = [['a','b'],['c','d']];\nconst out = findWords(board, ['ab','abc','abcd','cd','ac','ba','x']).slice().sort();\nassert.deepEqual(out, ['ab', 'ac', 'ba', 'cd']);\nassert.deepEqual(findWords([['a']], []), []);",
      },
    ],
  },
  {
    id: "ex-lru-cache",
    chapter: "dsa-design-problems",
    level: "advanced",
    title: "LRU Cache",
    brief:
      "<p>Design a cache with a fixed <code>capacity</code> that evicts the <b>least recently used</b> entry when it overflows.</p><ul><li><code>new LRUCache(capacity)</code> — capacity is a positive integer</li><li><code>get(key)</code> — return the value, or <code>-1</code> if absent. A successful <code>get</code> counts as a <b>use</b> and makes that key the most recently used</li><li><code>put(key, value)</code> — insert or overwrite; this also counts as a use. If the cache is over capacity afterwards, evict the least recently used key</li><li>Both operations must be <b>O(1)</b>, so no scanning for the oldest entry</li></ul>",
    starter:
      "class LRUCache {\n  constructor(capacity) {\n    // TODO: remember the capacity and set up the storage\n  }\n\n  get(key) {\n    // TODO: return the value (and mark it as recently used), or -1\n  }\n\n  put(key, value) {\n    // TODO: insert or update, evicting the least recently used key if needed\n  }\n}\n",
    hints: [
      "You need two things at once: O(1) lookup by key, and an ordering by recency you can update in O(1). A plain object gives you the first but not the second.",
      "The textbook answer is a hash map of key -> node in a doubly linked list, where the list is kept in recency order. In JavaScript a Map already iterates in insertion order, which gives you the same thing far more cheaply.",
      "With a Map, 'touch this key' is delete followed by set — that moves it to the back. The least recently used key is then simply the first key the Map yields.",
    ],
    solution:
      "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.entries = new Map();\n  }\n\n  get(key) {\n    if (!this.entries.has(key)) return -1;\n    const value = this.entries.get(key);\n    this.entries.delete(key);\n    this.entries.set(key, value);\n    return value;\n  }\n\n  put(key, value) {\n    if (this.entries.has(key)) this.entries.delete(key);\n    this.entries.set(key, value);\n    if (this.entries.size > this.capacity) {\n      const oldest = this.entries.keys().next().value;\n      this.entries.delete(oldest);\n    }\n  }\n}\n",
    tests: [
      {
        name: "the classic sequence",
        body: "const c = new LRUCache(2);\nc.put(1, 1);\nc.put(2, 2);\nassert.equal(c.get(1), 1);\nc.put(3, 3);\nassert.equal(c.get(2), -1);\nc.put(4, 4);\nassert.equal(c.get(1), -1);\nassert.equal(c.get(3), 3);\nassert.equal(c.get(4), 4);",
      },
      {
        name: "reading an entry protects it from eviction",
        body: "const c = new LRUCache(2);\nc.put('a', 1);\nc.put('b', 2);\nassert.equal(c.get('a'), 1);\nc.put('c', 3);\nassert.equal(c.get('b'), -1);\nassert.equal(c.get('a'), 1);\nassert.equal(c.get('c'), 3);",
      },
      {
        name: "overwriting refreshes recency without growing the cache",
        body: "const c = new LRUCache(2);\nc.put(1, 1);\nc.put(2, 2);\nc.put(1, 10);\nc.put(3, 3);\nassert.equal(c.get(2), -1);\nassert.equal(c.get(1), 10);\nassert.equal(c.get(3), 3);",
      },
      {
        name: "capacity of one",
        body: "const c = new LRUCache(1);\nc.put(1, 1);\nassert.equal(c.get(1), 1);\nc.put(2, 2);\nassert.equal(c.get(1), -1);\nassert.equal(c.get(2), 2);",
      },
      {
        name: "misses do not disturb the ordering",
        body: "const c = new LRUCache(2);\nc.put(1, 1);\nc.put(2, 2);\nassert.equal(c.get(9), -1);\nc.put(3, 3);\nassert.equal(c.get(1), -1);\nassert.equal(c.get(2), 2);\nassert.equal(c.get(3), 3);",
      },
    ],
  },
  {
    id: "ex-design-hashmap",
    chapter: "dsa-design-problems",
    level: "advanced",
    title: "Design HashMap",
    brief:
      "<p>Build a hash map from scratch, <b>without</b> using the built-in <code>Map</code>, <code>Set</code>, or a plain object as the store.</p><ul><li><code>new MyHashMap(bucketCount)</code> — <code>bucketCount</code> is optional and defaults to <code>769</code></li><li><code>put(key, value)</code> — insert, or overwrite an existing key</li><li><code>get(key)</code> — the value, or <code>-1</code> if the key is absent</li><li><code>remove(key)</code> — delete the key if present; removing a missing key is a no-op</li><li>Keys are non-negative integers. Different keys <b>will</b> land in the same bucket, and your map must still keep them apart</li></ul>",
    starter:
      "class MyHashMap {\n  constructor(bucketCount) {\n    // TODO: create the array of buckets (default 769 of them)\n  }\n\n  put(key, value) {\n    // TODO: insert or overwrite\n  }\n\n  get(key) {\n    // TODO: the stored value, or -1\n  }\n\n  remove(key) {\n    // TODO: delete the key if it is there\n  }\n}\n",
    hints: [
      "Storage is an array of buckets. The hash turns a key into a bucket index — key % bucketCount is enough here.",
      "Two keys sharing a bucket is a collision, and it is normal. The standard fix is separate chaining: each bucket holds a list of [key, value] pairs.",
      "Every operation is 'find the bucket, then scan that small list for the key'. put overwrites the pair it finds and only pushes a new one if nothing matched; remove splices the pair out.",
    ],
    solution:
      "class MyHashMap {\n  constructor(bucketCount) {\n    this.bucketCount = bucketCount || 769;\n    this.buckets = [];\n    for (let i = 0; i < this.bucketCount; i++) this.buckets.push([]);\n  }\n\n  bucketFor(key) {\n    const i = ((key % this.bucketCount) + this.bucketCount) % this.bucketCount;\n    return this.buckets[i];\n  }\n\n  put(key, value) {\n    const bucket = this.bucketFor(key);\n    for (const pair of bucket) {\n      if (pair[0] === key) {\n        pair[1] = value;\n        return;\n      }\n    }\n    bucket.push([key, value]);\n  }\n\n  get(key) {\n    const bucket = this.bucketFor(key);\n    for (const pair of bucket) {\n      if (pair[0] === key) return pair[1];\n    }\n    return -1;\n  }\n\n  remove(key) {\n    const bucket = this.bucketFor(key);\n    for (let i = 0; i < bucket.length; i++) {\n      if (bucket[i][0] === key) {\n        bucket.splice(i, 1);\n        return;\n      }\n    }\n  }\n}\n",
    tests: [
      {
        name: "put, get and remove",
        body: "const m = new MyHashMap();\nm.put(1, 1);\nm.put(2, 2);\nassert.equal(m.get(1), 1);\nassert.equal(m.get(3), -1);\nm.put(2, 1);\nassert.equal(m.get(2), 1);\nm.remove(2);\nassert.equal(m.get(2), -1);",
      },
      {
        name: "colliding keys stay separate",
        body: "const m = new MyHashMap(4);\nm.put(1, 'a');\nm.put(5, 'b');\nm.put(9, 'c');\nassert.equal(m.get(1), 'a');\nassert.equal(m.get(5), 'b');\nassert.equal(m.get(9), 'c');\nm.remove(5);\nassert.equal(m.get(5), -1);\nassert.equal(m.get(1), 'a');\nassert.equal(m.get(9), 'c');",
      },
      {
        name: "overwriting does not duplicate a colliding key",
        body: "const m = new MyHashMap(4);\nm.put(2, 20);\nm.put(6, 60);\nm.put(2, 22);\nassert.equal(m.get(2), 22);\nassert.equal(m.get(6), 60);\nm.remove(2);\nassert.equal(m.get(2), -1);\nassert.equal(m.get(6), 60);",
      },
      {
        name: "removing a missing key is harmless, and zero is a valid key",
        body: "const m = new MyHashMap(4);\nm.remove(7);\nassert.equal(m.get(7), -1);\nm.put(0, 0);\nassert.equal(m.get(0), 0);\nm.remove(0);\nassert.equal(m.get(0), -1);",
      },
      {
        name: "holds many keys at once",
        body: "const m = new MyHashMap(8);\nfor (let k = 0; k < 200; k++) m.put(k, k * 3);\nfor (let k = 0; k < 200; k++) assert.equal(m.get(k), k * 3);\nfor (let k = 0; k < 200; k += 2) m.remove(k);\nassert.equal(m.get(50), -1);\nassert.equal(m.get(51), 153);",
      },
    ],
  },
  {
    id: "ex-time-based-key-value-store",
    chapter: "dsa-design-problems",
    level: "advanced",
    title: "Time Based Key-Value Store",
    brief:
      "<p>Design a store that keeps <b>every</b> version of a key's value and can be queried as of a point in time.</p><ul><li><code>set(key, value, timestamp)</code> — record a value for that key at that time. Timestamps are strictly increasing per key</li><li><code>get(key, timestamp)</code> — the value written at the <b>largest</b> stored time that is <code>&lt;= timestamp</code></li><li>If the key has no write at or before that time (or does not exist at all), return the empty string <code>''</code></li><li><code>get</code> must be <b>O(log n)</b> in the number of writes for that key — a backwards linear scan is not good enough</li></ul>",
    starter:
      "class TimeMap {\n  constructor() {\n    // TODO: set up the storage\n  }\n\n  set(key, value, timestamp) {\n    // TODO: append this version\n  }\n\n  get(key, timestamp) {\n    // TODO: the value at the largest stored time <= timestamp, else ''\n  }\n}\n",
    hints: [
      "Keep the versions of each key separate: a map from key to a list of that key's writes. Nothing about one key should be scanned when reading another.",
      "Because timestamps arrive in increasing order, each key's list is already sorted by time — so you can binary search it instead of scanning.",
      "This is a 'largest value <= target' search, not an exact-match search. When the midpoint's time is <= the query, remember its value as the best answer so far and keep searching to the RIGHT for something better.",
    ],
    solution:
      "class TimeMap {\n  constructor() {\n    this.store = new Map();\n  }\n\n  set(key, value, timestamp) {\n    if (!this.store.has(key)) this.store.set(key, []);\n    this.store.get(key).push([timestamp, value]);\n  }\n\n  get(key, timestamp) {\n    const versions = this.store.get(key);\n    if (!versions) return '';\n    let lo = 0;\n    let hi = versions.length - 1;\n    let best = '';\n    while (lo <= hi) {\n      const mid = lo + Math.floor((hi - lo) / 2);\n      if (versions[mid][0] <= timestamp) {\n        best = versions[mid][1];\n        lo = mid + 1;\n      } else {\n        hi = mid - 1;\n      }\n    }\n    return best;\n  }\n}\n",
    tests: [
      {
        name: "reads the value in force at that time",
        body: "const t = new TimeMap();\nt.set('foo', 'bar', 1);\nassert.equal(t.get('foo', 1), 'bar');\nassert.equal(t.get('foo', 3), 'bar');\nt.set('foo', 'bar2', 4);\nassert.equal(t.get('foo', 4), 'bar2');\nassert.equal(t.get('foo', 5), 'bar2');",
      },
      {
        name: "queries before the first write return the empty string",
        body: "const t = new TimeMap();\nt.set('a', 'one', 10);\nassert.equal(t.get('a', 9), '');\nassert.equal(t.get('a', 10), 'one');\nassert.equal(t.get('missing', 100), '');",
      },
      {
        name: "keys are independent",
        body: "const t = new TimeMap();\nt.set('a', 'a1', 1);\nt.set('b', 'b1', 2);\nt.set('a', 'a2', 3);\nassert.equal(t.get('a', 2), 'a1');\nassert.equal(t.get('b', 2), 'b1');\nassert.equal(t.get('b', 1), '');\nassert.equal(t.get('a', 99), 'a2');",
      },
      {
        name: "picks the right version among many",
        body: "const t = new TimeMap();\nt.set('k', 'v0', 0);\nt.set('k', 'v5', 5);\nt.set('k', 'v10', 10);\nt.set('k', 'v20', 20);\nassert.equal(t.get('k', 0), 'v0');\nassert.equal(t.get('k', 4), 'v0');\nassert.equal(t.get('k', 5), 'v5');\nassert.equal(t.get('k', 19), 'v10');\nassert.equal(t.get('k', 20), 'v20');\nassert.equal(t.get('k', 1000), 'v20');",
      },
      {
        name: "handles a long history",
        body: "const t = new TimeMap();\nfor (let i = 0; i < 2000; i++) t.set('k', 'v' + i, i * 2);\nassert.equal(t.get('k', 0), 'v0');\nassert.equal(t.get('k', 1), 'v0');\nassert.equal(t.get('k', 1999), 'v999');\nassert.equal(t.get('k', 3998), 'v1999');\nassert.equal(t.get('k', 999999), 'v1999');",
      },
    ],
  },
  {
    id: "ex-insert-delete-getrandom",
    chapter: "dsa-design-problems",
    level: "advanced",
    title: "Insert Delete GetRandom O(1)",
    brief:
      "<p>Design a set supporting insert, remove and 'give me a uniformly chosen member', all in <b>average O(1)</b>.</p><ul><li><code>insert(value)</code> — returns <code>true</code> if the value was not already there, otherwise <code>false</code> and nothing changes</li><li><code>remove(value)</code> — returns <code>true</code> if the value was there, otherwise <code>false</code></li><li><code>getRandom()</code> — returns one of the current members</li><li><b>Testability:</b> the constructor takes an optional <code>pick</code> function <code>(n) =&gt; index</code> that chooses an index in <code>0..n-1</code>. When it is omitted, default to a uniform random choice</li><li>You may not scan the collection in <code>remove</code> or <code>getRandom</code></li></ul>",
    starter:
      "class RandomizedSet {\n  constructor(pick) {\n    // TODO: keep the optional pick function (default: uniform random) and set up storage\n  }\n\n  insert(value) {\n    // TODO: true if newly added\n  }\n\n  remove(value) {\n    // TODO: true if it was present\n  }\n\n  getRandom() {\n    // TODO: a member chosen with this.pick\n  }\n}\n",
    hints: [
      "getRandom by index needs a dense array. Membership and removal in O(1) need a map. Keep both: an array of values, and a map from value to its index in that array.",
      "The hard part is remove: splicing out of the middle of the array is O(n) and shifts every later index. Instead, move the LAST value into the hole and then pop.",
      "When you move the last value, remember to update its index in the map — and be careful when the value being removed IS the last one, so you do not resurrect an entry you just deleted.",
    ],
    solution:
      "class RandomizedSet {\n  constructor(pick) {\n    this.pick = pick || ((n) => Math.floor(Math.random() * n));\n    this.values = [];\n    this.indexOf = new Map();\n  }\n\n  insert(value) {\n    if (this.indexOf.has(value)) return false;\n    this.indexOf.set(value, this.values.length);\n    this.values.push(value);\n    return true;\n  }\n\n  remove(value) {\n    if (!this.indexOf.has(value)) return false;\n    const hole = this.indexOf.get(value);\n    const last = this.values[this.values.length - 1];\n    this.values[hole] = last;\n    this.indexOf.set(last, hole);\n    this.values.pop();\n    this.indexOf.delete(value);\n    return true;\n  }\n\n  getRandom() {\n    return this.values[this.pick(this.values.length)];\n  }\n}\n",
    tests: [
      {
        name: "insert and remove report whether anything changed",
        body: "const s = new RandomizedSet((n) => 0);\nassert.equal(s.insert(1), true);\nassert.equal(s.insert(1), false);\nassert.equal(s.remove(2), false);\nassert.equal(s.insert(2), true);\nassert.equal(s.remove(1), true);\nassert.equal(s.remove(1), false);\nassert.equal(s.getRandom(), 2);",
      },
      {
        name: "the picker decides which member comes back",
        body: "const s = new RandomizedSet((n) => n - 1);\ns.insert('a');\ns.insert('b');\ns.insert('c');\nassert.equal(s.getRandom(), 'c');\nconst t = new RandomizedSet((n) => 0);\nt.insert('a');\nt.insert('b');\nassert.equal(t.getRandom(), 'a');",
      },
      {
        name: "removing from the middle keeps every other member reachable",
        body: "const s = new RandomizedSet((n) => 0);\nfor (const v of [10, 20, 30, 40, 50]) s.insert(v);\nassert.equal(s.remove(20), true);\nassert.equal(s.remove(40), true);\nconst seen = [];\nfor (let i = 0; i < 3; i++) {\n  const one = s.getRandom();\n  seen.push(one);\n  s.remove(one);\n}\nassert.deepEqual(seen.slice().sort((a, b) => a - b), [10, 30, 50]);",
      },
      {
        name: "removing the last-inserted value",
        body: "const s = new RandomizedSet((n) => 0);\ns.insert(1);\ns.insert(2);\nassert.equal(s.remove(2), true);\nassert.equal(s.remove(2), false);\nassert.equal(s.getRandom(), 1);\nassert.equal(s.insert(2), true);\nassert.equal(s.remove(1), true);\nassert.equal(s.getRandom(), 2);",
      },
      {
        name: "re-inserting after a removal works",
        body: "const s = new RandomizedSet((n) => n - 1);\ns.insert(1);\nassert.equal(s.remove(1), true);\nassert.equal(s.insert(1), true);\nassert.equal(s.getRandom(), 1);\ns.insert(7);\nassert.equal(s.getRandom(), 7);\nassert.equal(s.remove(7), true);\nassert.equal(s.getRandom(), 1);",
      },
    ],
  },
  {
    id: "ex-merge-sort",
    chapter: "dsa-sorting-algorithms",
    level: "intermediate",
    title: "Merge Sort",
    brief:
      "<p>Implement <b>merge sort</b>: return a new array holding <code>nums</code> in ascending order.</p><ul><li>You may <b>not</b> call <code>Array.prototype.sort</code> — the point is to write the algorithm</li><li>The input array must be left <b>unchanged</b>; return a new array</li><li>Duplicates, negatives, an empty array and a single element must all work</li><li>Merge sort is <b>O(n log n)</b> in every case: log n levels of splitting, and each level merges a total of n elements</li></ul>",
    starter:
      "function mergeSort(nums) {\n  // TODO: split in half, sort each half recursively, then merge the two sorted halves\n}\n",
    hints: [
      "Two pieces: the recursive split, and a merge step that takes two ALREADY sorted arrays and interleaves them into one. Write merge first — it is the part with the real logic.",
      "Merging walks two pointers, one per array, repeatedly taking the smaller front element. When one side runs out, append whatever is left of the other.",
      "The base case is a length of 0 or 1, which is already sorted. Return a copy there so the caller never gets a view onto the original array.",
    ],
    solution:
      "function mergeSort(nums) {\n  if (nums.length <= 1) return nums.slice();\n  const mid = Math.floor(nums.length / 2);\n  const left = mergeSort(nums.slice(0, mid));\n  const right = mergeSort(nums.slice(mid));\n  const out = [];\n  let i = 0;\n  let j = 0;\n  while (i < left.length && j < right.length) {\n    if (left[i] <= right[j]) {\n      out.push(left[i]);\n      i++;\n    } else {\n      out.push(right[j]);\n      j++;\n    }\n  }\n  while (i < left.length) {\n    out.push(left[i]);\n    i++;\n  }\n  while (j < right.length) {\n    out.push(right[j]);\n    j++;\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "sorts a jumbled array",
        body: "assert.deepEqual(mergeSort([5, 2, 3, 1]), [1, 2, 3, 5]);\nassert.deepEqual(mergeSort([5, 1, 1, 2, 0, 0]), [0, 0, 1, 1, 2, 5]);",
      },
      {
        name: "negatives and duplicates",
        body: "assert.deepEqual(mergeSort([-3, 7, -3, 0, 7]), [-3, -3, 0, 7, 7]);\nassert.deepEqual(mergeSort([2, 2, 2]), [2, 2, 2]);",
      },
      {
        name: "empty, single and already sorted",
        body: "assert.deepEqual(mergeSort([]), []);\nassert.deepEqual(mergeSort([9]), [9]);\nassert.deepEqual(mergeSort([1, 2, 3, 4]), [1, 2, 3, 4]);\nassert.deepEqual(mergeSort([4, 3, 2, 1]), [1, 2, 3, 4]);",
      },
      {
        name: "the input is not modified",
        body: "const input = [3, 1, 2];\nconst out = mergeSort(input);\nassert.deepEqual(input, [3, 1, 2]);\nassert.deepEqual(out, [1, 2, 3]);\nassert.notEqual(out, input);",
      },
      {
        name: "a large array, sorted and complete",
        body: "let seed = 7;\nconst next = () => {\n  seed = (seed * 48271) % 2147483647;\n  return seed % 1000;\n};\nconst input = [];\nfor (let i = 0; i < 600; i++) input.push(next() - 500);\nconst before = input.reduce((a, b) => a + b, 0);\nconst out = mergeSort(input);\nassert.equal(out.length, 600);\nassert.equal(out.reduce((a, b) => a + b, 0), before);\nfor (let i = 1; i < out.length; i++) assert.ok(out[i - 1] <= out[i]);",
      },
    ],
  },
  {
    id: "ex-quickselect-kth-largest",
    chapter: "dsa-sorting-algorithms",
    level: "advanced",
    title: "Kth Largest Element — Quickselect",
    brief:
      "<p>Return the <code>k</code>th <b>largest</b> element of <code>nums</code> — that is, the element that would sit at index <code>n - k</code> if the array were sorted ascending.</p><ul><li>This is the kth largest <em>value by position</em>, not the kth distinct value: in <code>[3,2,3,1,2,4,5,5,6]</code> the 4th largest is <code>4</code></li><li>Do <b>not</b> sort the whole array. Use <b>quickselect</b>: partition, then recurse into the one side that can contain the answer — average O(n)</li><li>Choose the pivot <b>deterministically</b> (median-of-three of the low, middle and high elements) so the result never depends on randomness</li><li>The input array must not be modified — partition a copy</li></ul>",
    starter:
      "function findKthLargest(nums, k) {\n  // TODO: quickselect on a copy; deterministic pivot, no full sort\n}\n",
    hints: [
      "Translate the question into an index first: the kth largest sits at index nums.length - k in ascending order. Now you are hunting for one index.",
      "Partition a copy around a pivot so that everything smaller ends up left of it. The pivot then lands at its FINAL sorted index — compare that index with your target.",
      "If the pivot landed left of the target, the answer is in the right part, so move the low bound past it; if it landed right, move the high bound. Unlike quicksort you only ever recurse into one side, which is what turns n log n into an average of n.",
    ],
    solution:
      "function findKthLargest(nums, k) {\n  const a = nums.slice();\n  const target = a.length - k;\n  const swap = (i, j) => {\n    const tmp = a[i];\n    a[i] = a[j];\n    a[j] = tmp;\n  };\n  let lo = 0;\n  let hi = a.length - 1;\n  while (lo < hi) {\n    // median-of-three: park the median of a[lo], a[mid], a[hi] at hi\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (a[mid] < a[lo]) swap(mid, lo);\n    if (a[hi] < a[lo]) swap(hi, lo);\n    if (a[hi] < a[mid]) swap(hi, mid);\n    swap(mid, hi);\n    const pivot = a[hi];\n    let store = lo;\n    for (let i = lo; i < hi; i++) {\n      if (a[i] < pivot) {\n        swap(i, store);\n        store++;\n      }\n    }\n    swap(store, hi);\n    if (store === target) return a[store];\n    if (store < target) lo = store + 1;\n    else hi = store - 1;\n  }\n  return a[lo];\n}\n",
    tests: [
      {
        name: "second largest",
        body: "assert.equal(findKthLargest([3, 2, 1, 5, 6, 4], 2), 5);",
      },
      {
        name: "duplicates count as separate positions",
        body: "assert.equal(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), 4);\nassert.equal(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 1), 6);\nassert.equal(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 2), 5);\nassert.equal(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 3), 5);",
      },
      {
        name: "single element, all equal, and negatives",
        body: "assert.equal(findKthLargest([1], 1), 1);\nassert.equal(findKthLargest([7, 7, 7], 2), 7);\nassert.equal(findKthLargest([-1, -5, -3], 1), -1);\nassert.equal(findKthLargest([-1, -5, -3], 3), -5);",
      },
      {
        name: "the input array is untouched",
        body: "const input = [3, 2, 1, 5, 6, 4];\nfindKthLargest(input, 3);\nassert.deepEqual(input, [3, 2, 1, 5, 6, 4]);",
      },
      {
        name: "agrees with sorting on a large array",
        body: "let seed = 11;\nconst next = () => {\n  seed = (seed * 48271) % 2147483647;\n  return seed % 5000;\n};\nconst input = [];\nfor (let i = 0; i < 1000; i++) input.push(next() - 2500);\nconst sorted = input.slice().sort((x, y) => x - y);\nfor (const k of [1, 2, 17, 500, 999, 1000]) {\n  assert.equal(findKthLargest(input, k), sorted[1000 - k], 'k = ' + k);\n}\nconst sortedInput = [];\nfor (let i = 0; i < 400; i++) sortedInput.push(i);\nassert.equal(findKthLargest(sortedInput, 1), 399);\nassert.equal(findKthLargest(sortedInput, 400), 0);",
      },
    ],
  },
  {
    id: "ex-sort-an-array",
    chapter: "dsa-sorting-algorithms",
    level: "intermediate",
    title: "Sort an Array",
    brief:
      "<p>Sort <code>nums</code> into ascending order and return it, using an algorithm that runs in <b>O(n log n)</b> time.</p><ul><li>You may <b>not</b> call <code>Array.prototype.sort</code></li><li>Quadratic algorithms — bubble, insertion, selection — are not acceptable; the tests use arrays large enough to notice</li><li>Heap sort is a good fit because it sorts <b>in place</b> with O(1) extra space; merge sort would also qualify</li><li>Duplicates, negatives, an empty array and a single element must all work</li></ul>",
    starter:
      "function sortArray(nums) {\n  // TODO: sort in O(n log n) without Array.prototype.sort, and return the array\n}\n",
    hints: [
      "Heap sort has two phases. First turn the array into a max-heap in place; then repeatedly swap the root (the maximum) to the end and shrink the heap by one.",
      "The workhorse is 'sift down': given a root index and the heap size, compare the node with its two children at 2i+1 and 2i+2, swap with the larger if it is bigger, and continue down from there.",
      "Build the heap by sifting down from index floor(n/2) - 1 back to 0 — those are the only nodes with children. Leaves are already valid heaps of one.",
    ],
    solution:
      "function sortArray(nums) {\n  const n = nums.length;\n  const swap = (i, j) => {\n    const tmp = nums[i];\n    nums[i] = nums[j];\n    nums[j] = tmp;\n  };\n  const siftDown = (root, size) => {\n    while (true) {\n      const left = 2 * root + 1;\n      const right = left + 1;\n      let largest = root;\n      if (left < size && nums[left] > nums[largest]) largest = left;\n      if (right < size && nums[right] > nums[largest]) largest = right;\n      if (largest === root) return;\n      swap(root, largest);\n      root = largest;\n    }\n  };\n  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);\n  for (let end = n - 1; end > 0; end--) {\n    swap(0, end);\n    siftDown(0, end);\n  }\n  return nums;\n}\n",
    tests: [
      {
        name: "sorts a jumbled array",
        body: "assert.deepEqual(sortArray([5, 2, 3, 1]), [1, 2, 3, 5]);\nassert.deepEqual(sortArray([5, 1, 1, 2, 0, 0]), [0, 0, 1, 1, 2, 5]);",
      },
      {
        name: "negatives and duplicates",
        body: "assert.deepEqual(sortArray([-4, 0, -4, 9, 9, -1]), [-4, -4, -1, 0, 9, 9]);\nassert.deepEqual(sortArray([3, 3, 3]), [3, 3, 3]);",
      },
      {
        name: "empty, single, sorted and reversed",
        body: "assert.deepEqual(sortArray([]), []);\nassert.deepEqual(sortArray([42]), [42]);\nassert.deepEqual(sortArray([1, 2, 3]), [1, 2, 3]);\nassert.deepEqual(sortArray([3, 2, 1]), [1, 2, 3]);",
      },
      {
        name: "a large array, sorted and complete",
        body: "let seed = 5;\nconst next = () => {\n  seed = (seed * 48271) % 2147483647;\n  return seed % 10000;\n};\nconst input = [];\nfor (let i = 0; i < 5000; i++) input.push(next() - 5000);\nconst before = input.reduce((a, b) => a + b, 0);\nconst out = sortArray(input);\nassert.equal(out.length, 5000);\nassert.equal(out.reduce((a, b) => a + b, 0), before);\nfor (let i = 1; i < out.length; i++) assert.ok(out[i - 1] <= out[i]);",
      },
      {
        name: "a big already-sorted array does not blow up",
        body: "const input = [];\nfor (let i = 0; i < 5000; i++) input.push(i);\nconst out = sortArray(input);\nassert.equal(out[0], 0);\nassert.equal(out[4999], 4999);\nfor (let i = 1; i < out.length; i++) assert.ok(out[i - 1] <= out[i]);",
      },
    ],
  },
  {
    id: "ex-largest-number",
    chapter: "dsa-sorting-algorithms",
    level: "intermediate",
    title: "Largest Number",
    brief:
      "<p>Given an array of non-negative integers, arrange them so that concatenating their decimal digits gives the <b>largest possible number</b>. Return it as a <b>string</b>.</p><ul><li><code>[10, 2]</code> gives <code>'210'</code>, because <code>210 &gt; 102</code></li><li>Sorting numerically or lexicographically both give the wrong answer — you need a custom comparator</li><li>The result can be far longer than a JavaScript number can hold, which is why it is a string</li><li><b>Edge case:</b> all zeros must return <code>'0'</code>, not <code>'000'</code></li><li>An empty array returns <code>''</code></li></ul>",
    starter:
      "function largestNumber(nums) {\n  // TODO: order the numbers so their concatenation is as large as possible\n}\n",
    hints: [
      "Work with the numbers as strings. Then ask: given two of them, a and b, which should come first?",
      "The answer is decided by the only thing that matters — compare the two concatenations a + b and b + a as strings, and put a first when a + b is the bigger one. That comparator is consistent, so sorting with it is safe.",
      "After joining, one case remains: if the largest value is 0 then every value is 0, and the join produces a string of zeros. Detect it by checking whether the first element of the sorted list is '0'.",
    ],
    solution:
      "function largestNumber(nums) {\n  const parts = nums.map((n) => String(n));\n  parts.sort((a, b) => {\n    const ab = a + b;\n    const ba = b + a;\n    if (ab === ba) return 0;\n    return ab > ba ? -1 : 1;\n  });\n  if (parts.length === 0) return '';\n  if (parts[0] === '0') return '0';\n  return parts.join('');\n}\n",
    tests: [
      {
        name: "the two-number case",
        body: "assert.equal(largestNumber([10, 2]), '210');",
      },
      {
        name: "the classic example",
        body: "assert.equal(largestNumber([3, 30, 34, 5, 9]), '9534330');",
      },
      {
        name: "all zeros collapse to a single zero",
        body: "assert.equal(largestNumber([0, 0]), '0');\nassert.equal(largestNumber([0, 0, 0, 0]), '0');\nassert.equal(largestNumber([0]), '0');",
      },
      {
        name: "prefixes need the concatenation comparison",
        body: "assert.equal(largestNumber([432, 43243]), '43243432');\nassert.equal(largestNumber([12, 121]), '12121');\nassert.equal(largestNumber([128, 12]), '12812');",
      },
      {
        name: "single value, a leading zero case, and an empty array",
        body: "assert.equal(largestNumber([1]), '1');\nassert.equal(largestNumber([10, 0]), '100');\nassert.equal(largestNumber([0, 1]), '10');\nassert.equal(largestNumber([]), '');",
      },
    ],
  },
  {
    id: "ex-fibonacci-memoised",
    chapter: "dsa-basic-recursion",
    level: "beginner",
    title: "Fibonacci with Memoisation",
    brief:
      "<p>Return the <code>n</code>th Fibonacci number, where <code>fib(0) = 0</code>, <code>fib(1) = 1</code> and every later value is the sum of the two before it.</p><ul><li>The naive recursion <code>fib(n-1) + fib(n-2)</code> is <b>O(2^n)</b>: each call spawns two more, so the call tree roughly doubles at every level and the same subproblems are recomputed over and over — <code>fib(40)</code> already takes billions of calls</li><li><b>Memoise</b> it: cache each result the first time you compute it. Every value is then computed once, making it <b>O(n)</b></li><li>The tests call <code>fib(78)</code>, which is unreachable without a cache</li><li>Answers stay exact integers up to <code>fib(78)</code></li></ul>",
    starter:
      "function fib(n) {\n  // TODO: recursive fibonacci, but cache each result so nothing is computed twice\n}\n",
    hints: [
      "Keep the recursive shape — the only change is a lookup table that the recursion consults before doing any work.",
      "Define an inner helper that closes over a Map (or plain object). Its first line checks the cache, and its last line writes the result into the cache before returning.",
      "Base cases first: n of 0 or 1 returns n. Everything else is helper(n - 1) + helper(n - 2), and thanks to the cache the second call is nearly free.",
    ],
    solution:
      "function fib(n) {\n  const memo = new Map();\n  const go = (k) => {\n    if (k < 2) return k;\n    if (memo.has(k)) return memo.get(k);\n    const value = go(k - 1) + go(k - 2);\n    memo.set(k, value);\n    return value;\n  };\n  return go(n);\n}\n",
    tests: [
      {
        name: "the base cases",
        body: "assert.equal(fib(0), 0);\nassert.equal(fib(1), 1);\nassert.equal(fib(2), 1);",
      },
      {
        name: "the start of the sequence",
        body: "const first = [];\nfor (let i = 0; i < 11; i++) first.push(fib(i));\nassert.deepEqual(first, [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55]);",
      },
      {
        name: "each term is the sum of the two before it",
        body: "for (let i = 2; i < 30; i++) {\n  assert.equal(fib(i), fib(i - 1) + fib(i - 2), 'at i = ' + i);\n}",
      },
      {
        name: "large n finishes instantly",
        body: "assert.equal(fib(50), 12586269025);\nassert.equal(fib(78), 8944394323791464);",
      },
      {
        name: "repeated calls stay correct",
        body: "assert.equal(fib(40), 102334155);\nassert.equal(fib(40), 102334155);\nassert.equal(fib(10), 55);\nassert.equal(fib(70), 190392490709135);",
      },
    ],
  },
  {
    id: "ex-fast-power",
    chapter: "dsa-basic-recursion",
    level: "intermediate",
    title: "Pow(x, n) — Fast Exponentiation",
    brief:
      "<p>Compute <code>x</code> raised to the power <code>n</code> without using <code>Math.pow</code> or the <code>**</code> operator.</p><ul><li><code>n</code> is an integer and <b>may be negative</b>: <code>x^-n</code> is <code>1 / x^n</code></li><li><code>n = 0</code> gives <code>1</code> for any <code>x</code></li><li>Multiplying <code>n</code> times is O(n) and far too slow for large exponents. Use <b>fast exponentiation</b>: squaring the base halves the exponent each step, giving <b>O(log n)</b></li><li>Watch the most negative 32-bit exponent, <code>-2147483648</code> — negating it must not break your loop</li></ul>",
    starter: "function myPow(x, n) {\n  // TODO: x^n in O(log n), handling negative n\n}\n",
    hints: [
      "Deal with the sign of n once, up front: for negative n compute the positive power and return its reciprocal. Everything after that assumes n >= 0.",
      "The identity that does the work: x^n is (x*x)^(n/2) when n is even, and x * (x*x)^((n-1)/2) when n is odd. Each step halves n.",
      "Iteratively: keep a running result and a running base. While the exponent is above 0, multiply the result by the base when the exponent is odd, then square the base and halve the exponent.",
    ],
    solution:
      "function myPow(x, n) {\n  if (n < 0) return 1 / myPow(x, -n);\n  let result = 1;\n  let base = x;\n  let e = n;\n  while (e > 0) {\n    if (e % 2 === 1) result *= base;\n    base *= base;\n    e = Math.floor(e / 2);\n  }\n  return result;\n}\n",
    tests: [
      {
        name: "whole-number powers",
        body: "assert.equal(myPow(2, 10), 1024);\nassert.equal(myPow(3, 5), 243);\nassert.equal(myPow(-2, 3), -8);\nassert.equal(myPow(-2, 4), 16);",
      },
      {
        name: "an exponent of zero",
        body: "assert.equal(myPow(5, 0), 1);\nassert.equal(myPow(0, 0), 1);\nassert.equal(myPow(-7.5, 0), 1);",
      },
      {
        name: "negative exponents",
        body: "assert.equal(myPow(2, -2), 0.25);\nassert.equal(myPow(2, -10), 1 / 1024);\nassert.equal(myPow(-2, -3), -0.125);",
      },
      {
        name: "fractional bases",
        body: "assert.ok(Math.abs(myPow(2.1, 3) - 9.261) < 1e-9);\nassert.ok(Math.abs(myPow(0.5, 4) - 0.0625) < 1e-12);\nassert.ok(Math.abs(myPow(1.0001, 10) - 1.0010004501200215) < 1e-9);",
      },
      {
        name: "huge exponents finish instantly",
        body: "assert.equal(myPow(1, 2147483647), 1);\nassert.equal(myPow(1, -2147483648), 1);\nassert.equal(myPow(-1, -2147483648), 1);\nassert.equal(myPow(2, -2147483648), 0);\nassert.equal(myPow(2, 30), 1073741824);",
      },
    ],
  },
  {
    id: "ex-generate-subsets",
    chapter: "dsa-basic-recursion",
    level: "beginner",
    title: "Generate All Subsets",
    brief:
      "<p>Given an array <code>nums</code> of <b>distinct</b> integers, return the power set: every possible subset.</p><ul><li><code>n</code> values produce <code>2^n</code> subsets, including the empty subset and the whole array</li><li>Subsets, and the values inside them, may be returned in <b>any order</b></li><li>Solve it <b>recursively</b> — bitmask tricks are not the exercise here</li><li><code>subsets([])</code> is <code>[[]]</code></li></ul>",
    starter: "function subsets(nums) {\n  // TODO: recursively build every subset\n}\n",
    hints: [
      "Every element faces exactly one binary decision: in or out. That decision is the recursion.",
      "Walk an index through the array. At each index, recurse once having skipped the value and once having included it, undoing the inclusion afterwards.",
      "When the index passes the last element, one complete decision has been made for every value — push a COPY of the accumulated subset, since the shared array keeps changing as you backtrack.",
    ],
    solution:
      "function subsets(nums) {\n  const out = [];\n  const current = [];\n  const walk = (i) => {\n    if (i === nums.length) {\n      out.push(current.slice());\n      return;\n    }\n    walk(i + 1);\n    current.push(nums[i]);\n    walk(i + 1);\n    current.pop();\n  };\n  walk(0);\n  return out;\n}\n",
    tests: [
      {
        name: "the eight subsets of three values",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(\n  norm(subsets([1, 2, 3])),\n  norm([[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]])\n);",
      },
      {
        name: "a single value",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(norm(subsets([0])), norm([[], [0]]));",
      },
      {
        name: "empty input has one subset",
        body: "assert.deepEqual(subsets([]), [[]]);",
      },
      {
        name: "negatives are fine",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(norm(subsets([-1, 5])), norm([[], [-1], [5], [-1, 5]]));",
      },
      {
        name: "2^n subsets, all distinct",
        body: "const rows = subsets([1, 2, 3, 4, 5]);\nassert.equal(rows.length, 32);\nconst keys = rows.map((r) => r.slice().sort((a, b) => a - b).join(','));\nassert.equal(new Set(keys).size, 32);\nassert.ok(keys.indexOf('') !== -1);\nassert.ok(keys.indexOf('1,2,3,4,5') !== -1);",
      },
    ],
  },
  {
    id: "ex-flatten-nested-array",
    chapter: "dsa-basic-recursion",
    level: "beginner",
    title: "Flatten a Deeply Nested Array",
    brief:
      "<p>Given an array whose elements may themselves be arrays, to <b>any depth</b>, return a flat array of all the non-array values in order.</p><ul><li>You may <b>not</b> use <code>Array.prototype.flat</code> or <code>flatMap</code> — write the recursion yourself</li><li>The depth is arbitrary and unknown in advance</li><li>Nested empty arrays contribute nothing: <code>[[], [[]]]</code> flattens to <code>[]</code></li><li>Values of any type are kept as-is, including <code>0</code>, <code>false</code> and <code>null</code> — only arrays are unwrapped</li></ul>",
    starter:
      "function flattenDeep(arr) {\n  // TODO: pull every non-array value out, at any depth, preserving order\n}\n",
    hints: [
      "Walk the elements one at a time and ask a single question about each: is it an array? Array.isArray answers it.",
      "If it is an array, recurse into it; if not, it is a leaf, so append it to the output. The recursion is what makes the depth irrelevant.",
      "Pass one shared output array down (or concatenate the recursive results). Be careful with falsy leaves — test for arrays explicitly rather than truthiness, or 0, false and null will vanish.",
    ],
    solution:
      "function flattenDeep(arr) {\n  const out = [];\n  const walk = (list) => {\n    for (const item of list) {\n      if (Array.isArray(item)) walk(item);\n      else out.push(item);\n    }\n  };\n  walk(arr);\n  return out;\n}\n",
    tests: [
      {
        name: "flattens a mixed nesting",
        body: "assert.deepEqual(flattenDeep([1, [2, [3, [4]], 5]]), [1, 2, 3, 4, 5]);\nassert.deepEqual(flattenDeep([[1, 2], [3, [4, [5, [6]]]]]), [1, 2, 3, 4, 5, 6]);",
      },
      {
        name: "already flat and empty inputs",
        body: "assert.deepEqual(flattenDeep([1, 2, 3]), [1, 2, 3]);\nassert.deepEqual(flattenDeep([]), []);\nassert.deepEqual(flattenDeep([[], [[]], [[[]]]]), []);",
      },
      {
        name: "falsy leaves survive",
        body: "assert.deepEqual(flattenDeep(['a', ['b', [0, false, null]]]), ['a', 'b', 0, false, null]);\nassert.deepEqual(flattenDeep([[0], [[false]]]), [0, false]);",
      },
      {
        name: "very deep nesting",
        body: "let nested = [500];\nfor (let i = 0; i < 400; i++) nested = [nested];\nassert.deepEqual(flattenDeep(nested), [500]);\nassert.deepEqual(flattenDeep([1, nested, 2]), [1, 500, 2]);",
      },
      {
        name: "order is preserved",
        body: "const out = flattenDeep([[1, [2]], 3, [[4, [5, 6]], 7], [[[8]]]]);\nassert.deepEqual(out, [1, 2, 3, 4, 5, 6, 7, 8]);",
      },
    ],
  },
  {
    id: "ex-min-stack",
    chapter: "dsa-stacks-queues",
    level: "beginner",
    title: "Min Stack",
    brief:
      "<p>Design a stack that supports the usual operations plus a <code>getMin()</code> that reports the smallest value currently on the stack — every operation must run in <b>O(1)</b>.</p><ul><li><code>push(val)</code> — put <code>val</code> on top</li><li><code>pop()</code> — remove the top value and return it</li><li><code>top()</code> — return the top value without removing it</li><li><code>getMin()</code> — return the smallest value on the stack</li><li>Scanning the whole stack inside <code>getMin</code> is <em>not</em> allowed</li><li>Duplicated minimums must keep working: after pushing 3 twice and popping once, the minimum is still 3</li></ul>",
    starter:
      "class MinStack {\n  constructor() {\n    // TODO: what do you need to remember alongside the values themselves?\n  }\n  push(val) {}\n  pop() {}\n  top() {}\n  getMin() {}\n}\n",
    hints: [
      "getMin has to be O(1), so the answer must already be sitting somewhere when you ask for it.",
      "Keep a second stack that runs in lockstep with the first: every push adds one entry to it, every pop removes one.",
      "The entry you push onto the helper stack is 'the minimum of everything up to and including this value' — that is Math.min(val, currentMin).",
    ],
    solution:
      "class MinStack {\n  constructor() {\n    this.values = [];\n    this.mins = [];\n  }\n  push(val) {\n    this.values.push(val);\n    const best = this.mins.length ? this.mins[this.mins.length - 1] : Infinity;\n    this.mins.push(val < best ? val : best);\n  }\n  pop() {\n    this.mins.pop();\n    return this.values.pop();\n  }\n  top() {\n    return this.values[this.values.length - 1];\n  }\n  getMin() {\n    return this.mins[this.mins.length - 1];\n  }\n}\n",
    tests: [
      {
        name: "tracks the minimum as values go on",
        body: "const s = new MinStack();\ns.push(5); assert.equal(s.getMin(), 5);\ns.push(3); assert.equal(s.getMin(), 3);\ns.push(7); assert.equal(s.getMin(), 3);\nassert.equal(s.top(), 7);",
      },
      {
        name: "minimum is restored after pops",
        body: "const s = new MinStack();\ns.push(5); s.push(3); s.push(7);\nassert.equal(s.pop(), 7);\nassert.equal(s.getMin(), 3);\nassert.equal(s.pop(), 3);\nassert.equal(s.getMin(), 5);",
      },
      {
        name: "duplicate minimums survive one pop",
        body: "const s = new MinStack();\ns.push(2); s.push(2); s.push(9);\ns.pop();\nassert.equal(s.getMin(), 2);\ns.pop();\nassert.equal(s.getMin(), 2, 'the second 2 is still on the stack');",
      },
      {
        name: "handles negatives and a single element",
        body: "const s = new MinStack();\ns.push(-1);\nassert.equal(s.getMin(), -1);\nassert.equal(s.top(), -1);\ns.push(-4); s.push(0);\nassert.equal(s.getMin(), -4);\ns.pop(); s.pop();\nassert.equal(s.getMin(), -1);",
      },
    ],
  },
  {
    id: "ex-queue-using-stacks",
    chapter: "dsa-stacks-queues",
    level: "beginner",
    title: "Implement Queue using Stacks",
    brief:
      "<p>Build a FIFO queue whose only storage is two stacks. A stack lets you push to the end, pop from the end, and read its length — nothing else.</p><ul><li><code>push(x)</code> — add <code>x</code> to the back of the queue</li><li><code>pop()</code> — remove and return the value at the front</li><li><code>peek()</code> — return the front value without removing it</li><li><code>empty()</code> — <code>true</code> when the queue holds nothing</li><li>Do <em>not</em> use <code>shift()</code>, <code>unshift()</code> or indexed reads into the middle of an array — only stack operations</li></ul>",
    starter:
      "class MyQueue {\n  constructor() {\n    // TODO: two stacks — one for arriving values, one for departing values\n  }\n  push(x) {}\n  pop() {}\n  peek() {}\n  empty() {}\n}\n",
    hints: [
      "Pouring one stack into another reverses it — that is the whole trick.",
      "Keep an 'in' stack that push() writes to and an 'out' stack that pop()/peek() read from.",
      "Only refill the 'out' stack when it is empty; refilling early would scramble the order.",
    ],
    solution:
      "class MyQueue {\n  constructor() {\n    this.inStack = [];\n    this.outStack = [];\n  }\n  transfer() {\n    if (this.outStack.length === 0) {\n      while (this.inStack.length) this.outStack.push(this.inStack.pop());\n    }\n  }\n  push(x) {\n    this.inStack.push(x);\n  }\n  pop() {\n    this.transfer();\n    return this.outStack.pop();\n  }\n  peek() {\n    this.transfer();\n    return this.outStack[this.outStack.length - 1];\n  }\n  empty() {\n    return this.inStack.length === 0 && this.outStack.length === 0;\n  }\n}\n",
    tests: [
      {
        name: "first in is first out",
        body: "const q = new MyQueue();\nq.push(1); q.push(2); q.push(3);\nassert.equal(q.pop(), 1);\nassert.equal(q.pop(), 2);\nassert.equal(q.pop(), 3);",
      },
      {
        name: "peek does not remove",
        body: "const q = new MyQueue();\nq.push(4); q.push(5);\nassert.equal(q.peek(), 4);\nassert.equal(q.peek(), 4);\nassert.equal(q.pop(), 4);\nassert.equal(q.peek(), 5);",
      },
      {
        name: "interleaved pushes and pops keep order",
        body: "const q = new MyQueue();\nq.push(1); q.push(2);\nassert.equal(q.pop(), 1);\nq.push(3); q.push(4);\nassert.equal(q.pop(), 2);\nassert.equal(q.pop(), 3);\nq.push(5);\nassert.equal(q.pop(), 4);\nassert.equal(q.pop(), 5);",
      },
      {
        name: "empty reports correctly",
        body: "const q = new MyQueue();\nassert.equal(q.empty(), true);\nq.push(9);\nassert.equal(q.empty(), false);\nq.pop();\nassert.equal(q.empty(), true);",
      },
    ],
  },
  {
    id: "ex-stack-using-queues",
    chapter: "dsa-stacks-queues",
    level: "beginner",
    title: "Implement Stack using Queues",
    brief:
      "<p>Build a LIFO stack whose only storage is queues. A queue lets you add to the back, remove from the front, and read its length — nothing else.</p><ul><li><code>push(x)</code> — put <code>x</code> on top of the stack</li><li><code>pop()</code> — remove and return the top value</li><li><code>top()</code> — return the top value without removing it</li><li><code>empty()</code> — <code>true</code> when the stack holds nothing</li><li>Do <em>not</em> reach into the middle or the end of the storage — only <code>push</code> (to the back) and <code>shift</code> (from the front)</li></ul>",
    starter:
      "class MyStack {\n  constructor() {\n    // TODO: a queue, plus a plan for making the newest value come out first\n  }\n  push(x) {}\n  pop() {}\n  top() {}\n  empty() {}\n}\n",
    hints: [
      "One of push or pop has to do extra work — the other can stay trivial. Pick which.",
      "If you rotate the queue right after adding a value, the newest value can end up at the FRONT.",
      "After pushing x onto a queue of size k, shift-and-re-push the other k values; now x is first, so pop is just a shift.",
    ],
    solution:
      "class MyStack {\n  constructor() {\n    this.q = [];\n  }\n  push(x) {\n    this.q.push(x);\n    for (let i = 0; i < this.q.length - 1; i++) this.q.push(this.q.shift());\n  }\n  pop() {\n    return this.q.shift();\n  }\n  top() {\n    return this.q[0];\n  }\n  empty() {\n    return this.q.length === 0;\n  }\n}\n",
    tests: [
      {
        name: "last in is first out",
        body: "const s = new MyStack();\ns.push(1); s.push(2); s.push(3);\nassert.equal(s.pop(), 3);\nassert.equal(s.pop(), 2);\nassert.equal(s.pop(), 1);",
      },
      {
        name: "top does not remove",
        body: "const s = new MyStack();\ns.push(7); s.push(8);\nassert.equal(s.top(), 8);\nassert.equal(s.top(), 8);\nassert.equal(s.pop(), 8);\nassert.equal(s.top(), 7);",
      },
      {
        name: "interleaved pushes and pops",
        body: "const s = new MyStack();\ns.push(1); s.push(2);\nassert.equal(s.pop(), 2);\ns.push(3);\nassert.equal(s.pop(), 3);\nassert.equal(s.pop(), 1);\nassert.equal(s.empty(), true);",
      },
      {
        name: "single element",
        body: "const s = new MyStack();\nassert.equal(s.empty(), true);\ns.push(42);\nassert.equal(s.top(), 42);\nassert.equal(s.empty(), false);\nassert.equal(s.pop(), 42);\nassert.equal(s.empty(), true);",
      },
    ],
  },
  {
    id: "ex-daily-temperatures",
    chapter: "dsa-monotonic-stack-queue",
    level: "intermediate",
    title: "Daily Temperatures",
    brief:
      "<p>Given an array <code>temperatures</code> where each entry is that day's temperature, return an array <code>answer</code> in which <code>answer[i]</code> is how many days you must wait after day <code>i</code> for a <b>strictly warmer</b> temperature.</p><ul><li>If no later day is warmer, put <code>0</code> there</li><li>Equal temperatures do not count as warmer</li><li>Aim for <b>O(n)</b> — the nested-loop version is O(n^2)</li></ul>",
    starter:
      "function dailyTemperatures(temperatures) {\n  // TODO: keep track of the days that are still waiting for a warmer day\n}\n",
    hints: [
      "While you walk left to right, some earlier days are still 'unresolved'. What order are their temperatures in?",
      "Hold their INDICES on a stack whose temperatures decrease from bottom to top.",
      "When today beats the temperature at the top index, pop it and record today's index minus that index — repeat until the top is warmer than today.",
    ],
    solution:
      "function dailyTemperatures(temperatures) {\n  const answer = new Array(temperatures.length).fill(0);\n  const stack = [];\n  for (let i = 0; i < temperatures.length; i++) {\n    while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {\n      const day = stack.pop();\n      answer[day] = i - day;\n    }\n    stack.push(i);\n  }\n  return answer;\n}\n",
    tests: [
      {
        name: "classic week of temperatures",
        body: "assert.deepEqual(dailyTemperatures([73,74,75,71,69,72,76,73]), [1,1,4,2,1,1,0,0]);",
      },
      {
        name: "strictly increasing",
        body: "assert.deepEqual(dailyTemperatures([30,40,50,60]), [1,1,1,0]);",
      },
      {
        name: "strictly decreasing — nobody ever warms up",
        body: "assert.deepEqual(dailyTemperatures([90,80,70]), [0,0,0]);",
      },
      {
        name: "equal temperatures do not count",
        body: "assert.deepEqual(dailyTemperatures([50,50,50]), [0,0,0]);",
      },
      {
        name: "single day",
        body: "assert.deepEqual(dailyTemperatures([42]), [0]);",
      },
    ],
  },
  {
    id: "ex-next-greater-element-i",
    chapter: "dsa-monotonic-stack-queue",
    level: "intermediate",
    title: "Next Greater Element I",
    brief:
      "<p><code>nums1</code> is a subset of <code>nums2</code>, and both contain distinct values. For each value in <code>nums1</code>, find it inside <code>nums2</code> and return the first value to its <b>right</b> in <code>nums2</code> that is greater than it.</p><ul><li>If there is no such value, use <code>-1</code></li><li>The result lines up positionally with <code>nums1</code></li><li>Aim for <b>O(n + m)</b> rather than searching <code>nums2</code> once per query</li></ul>",
    starter:
      "function nextGreaterElement(nums1, nums2) {\n  // TODO: precompute every answer for nums2 once, then look them up\n}\n",
    hints: [
      "Solve the harder question first: what is the next greater element for EVERY entry of nums2?",
      "Sweep nums2 once with a stack of values that are still waiting for something bigger.",
      "Store each resolved answer in a Map from value -> next greater, then map nums1 through it with a default of -1.",
    ],
    solution:
      "function nextGreaterElement(nums1, nums2) {\n  const nextGreater = new Map();\n  const stack = [];\n  for (const value of nums2) {\n    while (stack.length && stack[stack.length - 1] < value) {\n      nextGreater.set(stack.pop(), value);\n    }\n    stack.push(value);\n  }\n  return nums1.map((v) => (nextGreater.has(v) ? nextGreater.get(v) : -1));\n}\n",
    tests: [
      {
        name: "mixed hits and misses",
        body: "assert.deepEqual(nextGreaterElement([4,1,2], [1,3,4,2]), [-1,3,-1]);",
      },
      {
        name: "increasing nums2",
        body: "assert.deepEqual(nextGreaterElement([2,4], [1,2,3,4]), [3,-1]);",
      },
      {
        name: "decreasing nums2 has no answers",
        body: "assert.deepEqual(nextGreaterElement([9,7,5], [9,7,5,3]), [-1,-1,-1]);",
      },
      {
        name: "single query",
        body: "assert.deepEqual(nextGreaterElement([1], [1,5]), [5]);",
      },
      {
        name: "query order is preserved",
        body: "assert.deepEqual(nextGreaterElement([3,1,2], [1,2,3,10]), [10,2,3]);",
      },
    ],
  },
  {
    id: "ex-next-greater-element-circular",
    chapter: "dsa-monotonic-stack-queue",
    level: "advanced",
    title: "Next Greater Element II (Circular)",
    brief:
      "<p>Given a <b>circular</b> array <code>nums</code>, return an array where position <code>i</code> holds the next value greater than <code>nums[i]</code>, searching to the right and wrapping past the end back to the start.</p><ul><li>If no greater value exists anywhere in the circle, use <code>-1</code></li><li>Values may repeat; only <em>strictly</em> greater counts</li><li>Aim for <b>O(n)</b> time and O(n) extra space</li></ul>",
    starter: "function nextGreaterElements(nums) {\n  // TODO: a monotonic stack, but the array has no real 'end'\n}\n",
    hints: [
      "Wrapping is just 'walk the array twice' — index i maps to nums[i % n].",
      "Run the usual decreasing-stack sweep over 2n steps, but only PUSH indices during the first n steps.",
      "Anything still on the stack after the second pass genuinely has no greater element, so leave those as -1.",
    ],
    solution:
      "function nextGreaterElements(nums) {\n  const n = nums.length;\n  const answer = new Array(n).fill(-1);\n  const stack = [];\n  for (let i = 0; i < 2 * n; i++) {\n    const value = nums[i % n];\n    while (stack.length && nums[stack[stack.length - 1]] < value) {\n      answer[stack.pop()] = value;\n    }\n    if (i < n) stack.push(i);\n  }\n  return answer;\n}\n",
    tests: [
      {
        name: "wraps around the end",
        body: "assert.deepEqual(nextGreaterElements([1,2,1]), [2,-1,2]);",
      },
      {
        name: "the maximum has no answer",
        body: "assert.deepEqual(nextGreaterElements([1,2,3,4,3]), [2,3,4,-1,4]);",
      },
      {
        name: "decreasing array wraps to the front",
        body: "assert.deepEqual(nextGreaterElements([5,4,3,2,1]), [-1,5,5,5,5]);",
      },
      {
        name: "all equal — strictly greater never happens",
        body: "assert.deepEqual(nextGreaterElements([1,1,1]), [-1,-1,-1]);",
      },
      {
        name: "single element",
        body: "assert.deepEqual(nextGreaterElements([7]), [-1]);",
      },
    ],
  },
  {
    id: "ex-largest-rectangle-histogram",
    chapter: "dsa-monotonic-stack-queue",
    level: "advanced",
    title: "Largest Rectangle in Histogram",
    brief:
      "<p><code>heights</code> describes a histogram of bars, each exactly one unit wide. Return the area of the largest axis-aligned rectangle you can fit inside it.</p><ul><li>A rectangle of height <code>h</code> may span a run of consecutive bars as long as every bar in the run is at least <code>h</code> tall</li><li>An empty histogram has area <code>0</code></li><li>Aim for <b>O(n)</b>; the obvious 'expand from each bar' solution is O(n^2)</li></ul>",
    starter:
      "function largestRectangleArea(heights) {\n  // TODO: for each bar, how far left and right can it extend at its own height?\n}\n",
    hints: [
      "Every maximal rectangle is limited by its shortest bar. So ask, for each bar: how wide a run has this bar as its minimum?",
      "Keep a stack of indices with non-decreasing heights. A bar shorter than the top means the top's run has just ended.",
      "When you pop index j, its right edge is the current i and its left edge is one past the new stack top. Push a sentinel height of 0 after the last bar so everything drains.",
    ],
    solution:
      "function largestRectangleArea(heights) {\n  const stack = [];\n  let best = 0;\n  for (let i = 0; i <= heights.length; i++) {\n    const h = i === heights.length ? 0 : heights[i];\n    while (stack.length && heights[stack[stack.length - 1]] >= h) {\n      const height = heights[stack.pop()];\n      const left = stack.length ? stack[stack.length - 1] + 1 : 0;\n      best = Math.max(best, height * (i - left));\n    }\n    stack.push(i);\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic histogram",
        body: "assert.equal(largestRectangleArea([2,1,5,6,2,3]), 10);",
      },
      {
        name: "two bars",
        body: "assert.equal(largestRectangleArea([2,4]), 4);",
      },
      {
        name: "flat histogram spans everything",
        body: "assert.equal(largestRectangleArea([3,3,3,3]), 12);",
      },
      {
        name: "strictly decreasing",
        body: "assert.equal(largestRectangleArea([6,5,4,3,2,1]), 12);",
      },
      {
        name: "empty and single bar",
        body: "assert.equal(largestRectangleArea([]), 0);\nassert.equal(largestRectangleArea([5]), 5);\nassert.equal(largestRectangleArea([0]), 0);",
      },
    ],
  },
  {
    id: "ex-maximal-rectangle",
    chapter: "dsa-monotonic-stack-queue",
    level: "advanced",
    title: "Maximal Rectangle",
    brief:
      "<p>Given a 2-D <code>matrix</code> filled with the numbers <code>0</code> and <code>1</code>, return the area of the largest rectangle made entirely of <code>1</code>s.</p><ul><li>The rectangle must be axis-aligned and solid — no zeros inside it</li><li>An empty matrix, or one with no <code>1</code>s at all, gives <code>0</code></li><li>Aim for <b>O(rows * cols)</b></li></ul>",
    starter:
      "function maximalRectangle(matrix) {\n  // TODO: reduce each row to a problem you already know how to solve\n}\n",
    hints: [
      "Treat each row as the ground line of a histogram: for column c, the bar height is how many consecutive 1s sit directly above (and including) that cell.",
      "Rolling those heights forward costs O(cols) per row — a 1 adds one to the previous height, a 0 resets it to 0.",
      "Now run the largest-rectangle-in-a-histogram sweep on the heights after every row and keep the best area seen.",
    ],
    solution:
      "function maximalRectangle(matrix) {\n  if (!matrix || matrix.length === 0 || matrix[0].length === 0) return 0;\n  const cols = matrix[0].length;\n  const heights = new Array(cols).fill(0);\n  let best = 0;\n  for (const row of matrix) {\n    for (let c = 0; c < cols; c++) {\n      heights[c] = Number(row[c]) === 1 ? heights[c] + 1 : 0;\n    }\n    best = Math.max(best, histogramArea(heights));\n  }\n  return best;\n}\n\nfunction histogramArea(heights) {\n  const stack = [];\n  let best = 0;\n  for (let i = 0; i <= heights.length; i++) {\n    const h = i === heights.length ? 0 : heights[i];\n    while (stack.length && heights[stack[stack.length - 1]] >= h) {\n      const height = heights[stack.pop()];\n      const left = stack.length ? stack[stack.length - 1] + 1 : 0;\n      best = Math.max(best, height * (i - left));\n    }\n    stack.push(i);\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic 4x5 grid",
        body: "const m = [[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]];\nassert.equal(maximalRectangle(m), 6);",
      },
      {
        name: "solid block",
        body: "assert.equal(maximalRectangle([[1,1],[1,1]]), 4);",
      },
      {
        name: "tall thin column beats a wide short row",
        body: "const m = [[0,1,0],[0,1,0],[0,1,0],[1,1,1]];\nassert.equal(maximalRectangle(m), 4);",
      },
      {
        name: "single cells",
        body: "assert.equal(maximalRectangle([[0]]), 0);\nassert.equal(maximalRectangle([[1]]), 1);",
      },
      {
        name: "empty matrix",
        body: "assert.equal(maximalRectangle([]), 0);\nassert.equal(maximalRectangle([[0,0],[0,0]]), 0);",
      },
    ],
  },
  {
    id: "ex-asteroid-collision",
    chapter: "dsa-stacks-queues",
    level: "intermediate",
    title: "Asteroid Collision",
    brief:
      "<p>Each entry of <code>asteroids</code> is an asteroid: its magnitude is the size and its sign is the direction — positive moves right, negative moves left. They all move at the same speed. Return the state of the row once no more collisions can happen.</p><ul><li>Two asteroids collide only when a right-mover is immediately followed by a left-mover</li><li>The smaller one explodes; if they are the same size <b>both</b> explode</li><li>Asteroids moving the same way, or moving apart, never meet</li></ul>",
    starter:
      "function asteroidCollision(asteroids) {\n  // TODO: the survivors so far behave exactly like a stack\n}\n",
    hints: [
      "Push each asteroid onto a stack of survivors — but a NEGATIVE arrival may have to fight its way in first.",
      "A collision happens only when the incoming asteroid is negative and the stack top is positive; otherwise just push.",
      "Loop the fight: if the top is smaller, pop it and keep fighting; if equal, pop it and the newcomer also dies; if bigger, the newcomer dies.",
    ],
    solution:
      "function asteroidCollision(asteroids) {\n  const survivors = [];\n  for (const a of asteroids) {\n    let alive = true;\n    while (alive && a < 0 && survivors.length && survivors[survivors.length - 1] > 0) {\n      const top = survivors[survivors.length - 1];\n      if (top < -a) {\n        survivors.pop();\n        continue;\n      }\n      if (top === -a) survivors.pop();\n      alive = false;\n    }\n    if (alive) survivors.push(a);\n  }\n  return survivors;\n}\n",
    tests: [
      {
        name: "small left-mover is destroyed",
        body: "assert.deepEqual(asteroidCollision([5,10,-5]), [5,10]);",
      },
      {
        name: "equal sizes destroy each other",
        body: "assert.deepEqual(asteroidCollision([8,-8]), []);",
      },
      {
        name: "one big asteroid clears several",
        body: "assert.deepEqual(asteroidCollision([10,2,-5]), [10]);",
      },
      {
        name: "moving apart means no collisions",
        body: "assert.deepEqual(asteroidCollision([-2,-1,1,2]), [-2,-1,1,2]);",
      },
      {
        name: "a survivor keeps travelling left",
        body: "assert.deepEqual(asteroidCollision([1,-1,-2]), [-2]);\nassert.deepEqual(asteroidCollision([]), []);",
      },
    ],
  },
  {
    id: "ex-evaluate-rpn",
    chapter: "dsa-stacks-queues",
    level: "beginner",
    title: "Evaluate Reverse Polish Notation",
    brief:
      "<p>Evaluate an arithmetic expression given in reverse Polish (postfix) notation. <code>tokens</code> is an array of strings: either an integer, or one of <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>.</p><ul><li>An operator applies to the two values immediately before it, in order — so <code>['3','4','-']</code> is <code>3 - 4</code></li><li>Division is integer division that <b>truncates toward zero</b>: <code>7 / -3</code> is <code>-2</code></li><li>The expression is always valid and never divides by zero</li></ul>",
    starter:
      "function evalRPN(tokens) {\n  // TODO: numbers go somewhere to wait; an operator consumes the two most recent\n}\n",
    hints: [
      "Push every number onto a stack. When you meet an operator, pop two values.",
      "Order matters: the FIRST value you pop is the right-hand operand.",
      "Math.trunc gives you the toward-zero rounding that Math.floor does not for negatives.",
    ],
    solution:
      "function evalRPN(tokens) {\n  const stack = [];\n  for (const token of tokens) {\n    if (token === '+' || token === '-' || token === '*' || token === '/') {\n      const right = stack.pop();\n      const left = stack.pop();\n      let value;\n      if (token === '+') value = left + right;\n      else if (token === '-') value = left - right;\n      else if (token === '*') value = left * right;\n      else value = Math.trunc(left / right);\n      stack.push(value);\n    } else {\n      stack.push(Number(token));\n    }\n  }\n  return stack.pop();\n}\n",
    tests: [
      {
        name: "add then multiply",
        body: "assert.equal(evalRPN(['2','1','+','3','*']), 9);",
      },
      {
        name: "division truncates",
        body: "assert.equal(evalRPN(['4','13','5','/','+']), 6);",
      },
      {
        name: "operand order matters for minus",
        body: "assert.equal(evalRPN(['3','4','-']), -1);",
      },
      {
        name: "negative division truncates toward zero",
        body: "assert.equal(evalRPN(['7','-3','/']), -2);",
      },
      {
        name: "long nested expression and a lone number",
        body: "assert.equal(evalRPN(['10','6','9','3','+','-11','*','/','*','17','+','5','+']), 22);\nassert.equal(evalRPN(['42']), 42);",
      },
    ],
  },
  {
    id: "ex-basic-calculator",
    chapter: "dsa-stacks-queues",
    level: "advanced",
    title: "Basic Calculator",
    brief:
      "<p>Evaluate a string expression built from non-negative integers, <code>+</code>, <code>-</code>, matched parentheses and spaces. Return the integer result.</p><ul><li>There is no <code>*</code> or <code>/</code>, so the only precedence is parentheses</li><li>A leading <code>-</code>, including right after <code>(</code>, is a unary minus: <code>-(3+4)</code> is <code>-7</code></li><li>Spaces may appear anywhere and mean nothing</li><li>Do <em>not</em> use <code>eval</code> or <code>Function</code></li></ul>",
    starter:
      "function calculate(s) {\n  // TODO: one left-to-right pass; parentheses need you to remember where you were\n}\n",
    hints: [
      "With only + and -, a running total plus a current sign (+1 or -1) is enough — until you hit a parenthesis.",
      "On '(' push the running total and the pending sign, then start a fresh sub-total from zero with sign +1.",
      "On ')' finish the sub-total, then pop the sign and the outer total and combine: outer + sign * subTotal.",
    ],
    solution:
      "function calculate(s) {\n  const stack = [];\n  let result = 0;\n  let sign = 1;\n  let num = 0;\n  for (let i = 0; i < s.length; i++) {\n    const c = s[i];\n    if (c >= '0' && c <= '9') {\n      num = num * 10 + (c.charCodeAt(0) - 48);\n    } else if (c === '+') {\n      result += sign * num;\n      num = 0;\n      sign = 1;\n    } else if (c === '-') {\n      result += sign * num;\n      num = 0;\n      sign = -1;\n    } else if (c === '(') {\n      stack.push(result);\n      stack.push(sign);\n      result = 0;\n      sign = 1;\n    } else if (c === ')') {\n      result += sign * num;\n      num = 0;\n      const outerSign = stack.pop();\n      const outerResult = stack.pop();\n      result = outerResult + outerSign * result;\n      sign = 1;\n    }\n  }\n  return result + sign * num;\n}\n",
    tests: [
      {
        name: "nested parentheses",
        body: "assert.equal(calculate('(1+(4+5+2)-3)+(6+8)'), 23);",
      },
      {
        name: "spaces are ignored",
        body: "assert.equal(calculate('1 + 1'), 2);\nassert.equal(calculate(' 2-1 + 2 '), 3);",
      },
      {
        name: "subtracting a group flips its sign",
        body: "assert.equal(calculate('2-(5-6)'), 3);",
      },
      {
        name: "leading unary minus",
        body: "assert.equal(calculate('-(3+4)'), -7);\nassert.equal(calculate('-2+ 1'), -1);",
      },
      {
        name: "multi-digit numbers and deep nesting",
        body: "assert.equal(calculate('(100)'), 100);\nassert.equal(calculate('1-(2-(3-(4-5)))'), 3);",
      },
    ],
  },
  {
    id: "ex-basic-calculator-ii",
    chapter: "dsa-stacks-queues",
    level: "intermediate",
    title: "Basic Calculator II",
    brief:
      "<p>Evaluate a string expression built from non-negative integers, the operators <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>, and spaces. There are <b>no parentheses</b>.</p><ul><li><code>*</code> and <code>/</code> bind tighter than <code>+</code> and <code>-</code>, so <code>3+2*2</code> is <code>7</code></li><li>Division truncates toward zero: <code>3/2</code> is <code>1</code></li><li>Spaces may appear anywhere and mean nothing</li><li>Do <em>not</em> use <code>eval</code> or <code>Function</code></li></ul>",
    starter: "function calculate(s) {\n  // TODO: defer the low-precedence work; apply * and / the moment you can\n}\n",
    hints: [
      "Keep a stack of terms that only ever need to be ADDED at the end. Then the final answer is just their sum.",
      "Track the operator that came BEFORE the number you just finished reading, and act on it when the number ends.",
      "'+' pushes num, '-' pushes -num, '*' and '/' pop the last term and combine it with num right away.",
    ],
    solution:
      "function calculate(s) {\n  const terms = [];\n  let num = 0;\n  let op = '+';\n  for (let i = 0; i < s.length; i++) {\n    const c = s[i];\n    const isDigit = c >= '0' && c <= '9';\n    if (isDigit) num = num * 10 + (c.charCodeAt(0) - 48);\n    if ((!isDigit && c !== ' ') || i === s.length - 1) {\n      if (op === '+') terms.push(num);\n      else if (op === '-') terms.push(-num);\n      else if (op === '*') terms.push(terms.pop() * num);\n      else terms.push(Math.trunc(terms.pop() / num));\n      op = c;\n      num = 0;\n    }\n  }\n  return terms.reduce((a, b) => a + b, 0);\n}\n",
    tests: [
      {
        name: "multiplication binds tighter than addition",
        body: "assert.equal(calculate('3+2*2'), 7);",
      },
      {
        name: "division truncates and spaces are ignored",
        body: "assert.equal(calculate(' 3/2 '), 1);\nassert.equal(calculate(' 3+5 / 2 '), 5);",
      },
      {
        name: "subtraction then division",
        body: "assert.equal(calculate('14-3/2'), 13);",
      },
      {
        name: "chained same-precedence operators",
        body: "assert.equal(calculate('2*3*4'), 24);\nassert.equal(calculate('100/10/5'), 2);",
      },
      {
        name: "single number and a negative result",
        body: "assert.equal(calculate('42'), 42);\nassert.equal(calculate('1-2*3'), -5);",
      },
    ],
  },
  {
    id: "ex-kth-largest-element",
    chapter: "dsa-heaps-priority-queues",
    level: "intermediate",
    title: "Kth Largest Element in an Array",
    brief:
      "<p>Return the <code>k</code>-th largest value in <code>nums</code>. This is the k-th in <b>sorted order</b>, not the k-th distinct value — in <code>[3,2,3,1,2,4,5,5,6]</code> the 4th largest is <code>4</code>.</p><ul><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li><li>The heap route keeps the k best seen so far and runs in O(n log k)</li><li>Quickselect solves it in O(n) on average by partitioning around a pivot and recursing into one side only — either approach passes</li><li><code>1 &lt;= k &lt;= nums.length</code>, and duplicates are allowed</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction findKthLargest(nums, k) {\n  // TODO: keep only the k biggest values seen so far\n}\n",
    hints: [
      "You do not need the whole array sorted — you only need to know where the boundary between 'top k' and 'the rest' sits.",
      "Hold the k largest values in a MIN heap. Its root is the weakest of the k, so it is exactly the k-th largest.",
      "Push every value; whenever the heap grows past k, pop the root to evict the smallest survivor.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction findKthLargest(nums, k) {\n  const heap = new MinHeap();\n  for (const n of nums) {\n    heap.push(n);\n    if (heap.size() > k) heap.pop();\n  }\n  return heap.peek();\n}\n",
    tests: [
      {
        name: "second largest",
        body: "assert.equal(findKthLargest([3,2,1,5,6,4], 2), 5);",
      },
      {
        name: "duplicates count separately",
        body: "assert.equal(findKthLargest([3,2,3,1,2,4,5,5,6], 4), 4);",
      },
      {
        name: "k = 1 is the maximum, k = n is the minimum",
        body: "assert.equal(findKthLargest([7,10,4,3,20,15], 1), 20);\nassert.equal(findKthLargest([7,10,4,3,20,15], 6), 3);",
      },
      {
        name: "all values equal",
        body: "assert.equal(findKthLargest([2,2,2,2], 3), 2);",
      },
      {
        name: "negatives and a single element",
        body: "assert.equal(findKthLargest([-1,-5,-3], 2), -3);\nassert.equal(findKthLargest([1], 1), 1);",
      },
    ],
  },
  {
    id: "ex-median-from-data-stream",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Find Median from Data Stream",
    brief:
      "<p>Design <code>MedianFinder</code>, which accepts numbers one at a time and can report the median of everything seen so far at any moment.</p><ul><li><code>addNum(num)</code> — take the next value from the stream</li><li><code>findMedian()</code> — the middle value when the count is odd, or the average of the two middle values when it is even</li><li>Re-sorting on every query is too slow; aim for O(log n) per add and O(1) per query</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — pass a comparator such as <code>function (a, b) { return b - a; }</code> to get a max-heap</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nclass MedianFinder {\n  constructor() {\n    // TODO: split the stream into a low half and a high half\n  }\n  addNum(num) {}\n  findMedian() {}\n}\n",
    hints: [
      "The median only depends on the one or two values sitting at the boundary between the smaller half and the larger half.",
      "Keep a max-heap of the lower half and a min-heap of the upper half; both boundary values are then just two peeks.",
      "To add: push into the low heap, move its largest across to the high heap, then move back if the high heap became bigger. That keeps low.size() equal to high.size() or one more.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nclass MedianFinder {\n  constructor() {\n    this.low = new MinHeap(function (a, b) { return b - a; });\n    this.high = new MinHeap();\n  }\n  addNum(num) {\n    this.low.push(num);\n    this.high.push(this.low.pop());\n    if (this.high.size() > this.low.size()) this.low.push(this.high.pop());\n  }\n  findMedian() {\n    if (this.low.size() > this.high.size()) return this.low.peek();\n    return (this.low.peek() + this.high.peek()) / 2;\n  }\n}\n",
    tests: [
      {
        name: "interleaved adds and queries",
        body: "const m = new MedianFinder();\nm.addNum(1);\nassert.equal(m.findMedian(), 1);\nm.addNum(2);\nassert.equal(m.findMedian(), 1.5);\nm.addNum(3);\nassert.equal(m.findMedian(), 2);",
      },
      {
        name: "descending stream",
        body: "const m = new MedianFinder();\n[5,4,3,2,1].forEach((n) => m.addNum(n));\nassert.equal(m.findMedian(), 3);\nm.addNum(0);\nassert.equal(m.findMedian(), 2.5);",
      },
      {
        name: "duplicates and negatives",
        body: "const m = new MedianFinder();\n[-1,-2,-3,-4].forEach((n) => m.addNum(n));\nassert.equal(m.findMedian(), -2.5);\nm.addNum(-2);\nassert.equal(m.findMedian(), -2);",
      },
      {
        name: "unsorted arrival order",
        body: "const m = new MedianFinder();\n[6,10,2,6,5,0].forEach((n) => m.addNum(n));\nassert.equal(m.findMedian(), 5.5);\nm.addNum(100);\nassert.equal(m.findMedian(), 6);",
      },
      {
        name: "single value",
        body: "const m = new MedianFinder();\nm.addNum(42);\nassert.equal(m.findMedian(), 42);",
      },
    ],
  },
  {
    id: "ex-k-closest-points-origin",
    chapter: "dsa-heaps-priority-queues",
    level: "intermediate",
    title: "K Closest Points to Origin",
    brief:
      "<p>Given an array of <code>points</code> as <code>[x, y]</code> pairs, return the <code>k</code> points closest to the origin <code>[0, 0]</code>.</p><ul><li>Distance is the usual Euclidean distance — but you can compare <code>x*x + y*y</code> directly and skip the square root</li><li>The answer may be returned in <b>any order</b></li><li>The inputs have no ties on the boundary, so the answer set is unique</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction kClosest(points, k) {\n  // TODO: keep the k best candidates and evict the worst as you go\n}\n",
    hints: [
      "You never need the actual distance — squared distance orders the points identically and avoids Math.sqrt.",
      "Keep a heap capped at size k whose ROOT is the worst (farthest) of the survivors, so it is cheap to evict.",
      "Give MinHeap a comparator that puts the largest squared distance first, push every point, and pop whenever size exceeds k.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction kClosest(points, k) {\n  const dist = (p) => p[0] * p[0] + p[1] * p[1];\n  const heap = new MinHeap(function (a, b) { return dist(b) - dist(a); });\n  for (const p of points) {\n    heap.push(p);\n    if (heap.size() > k) heap.pop();\n  }\n  const out = [];\n  while (heap.size()) out.push(heap.pop());\n  return out;\n}\n",
    tests: [
      {
        name: "picks the single closest point",
        body: "const out = kClosest([[1,3],[-2,2]], 1);\nassert.deepEqual(out, [[-2,2]]);",
      },
      {
        name: "picks two out of three",
        body: "const out = kClosest([[3,3],[5,-1],[-2,4]], 2)\n  .sort((a, b) => a[0] - b[0]);\nassert.deepEqual(out, [[-2,4],[3,3]]);",
      },
      {
        name: "k equals every point",
        body: "const out = kClosest([[1,0],[0,2],[3,3]], 3)\n  .sort((a, b) => a[0] - b[0]);\nassert.deepEqual(out, [[0,2],[1,0],[3,3]]);",
      },
      {
        name: "the origin itself is closest",
        body: "const out = kClosest([[10,10],[0,0],[4,4]], 1);\nassert.deepEqual(out, [[0,0]]);",
      },
      {
        name: "negative coordinates are handled by squared distance",
        body: "const out = kClosest([[-1,-1],[8,-9],[-7,0]], 2)\n  .sort((a, b) => a[0] - b[0]);\nassert.deepEqual(out, [[-7,0],[-1,-1]]);",
      },
    ],
  },
  {
    id: "ex-last-stone-weight",
    chapter: "dsa-heaps-priority-queues",
    level: "beginner",
    title: "Last Stone Weight",
    brief:
      "<p>You have a pile of stones with the given weights. Repeatedly take the two heaviest stones and smash them together:</p><ul><li>If they weigh the same, both are destroyed</li><li>Otherwise the lighter one is destroyed and the heavier one is left with the difference in weight</li><li>Return the weight of the last remaining stone, or <code>0</code> if none remain</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction lastStoneWeight(stones) {\n  // TODO: simulate the smashing, always grabbing the two heaviest stones\n}\n",
    hints: [
      "Re-sorting after every smash works but is wasteful — you only ever need the two largest.",
      "Pass a comparator like function (a, b) { return b - a; } so MinHeap behaves as a MAX heap.",
      "Loop while size() > 1: pop twice, and if the two differ push their difference back.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction lastStoneWeight(stones) {\n  const heap = new MinHeap(function (a, b) { return b - a; });\n  for (const s of stones) heap.push(s);\n  while (heap.size() > 1) {\n    const first = heap.pop();\n    const second = heap.pop();\n    if (first !== second) heap.push(first - second);\n  }\n  return heap.size() ? heap.peek() : 0;\n}\n",
    tests: [
      {
        name: "classic pile",
        body: "assert.equal(lastStoneWeight([2,7,4,1,8,1]), 1);",
      },
      {
        name: "everything cancels out",
        body: "assert.equal(lastStoneWeight([3,3]), 0);\nassert.equal(lastStoneWeight([2,2,2,2]), 0);",
      },
      {
        name: "equal heavies cancel, lighter ones remain",
        body: "assert.equal(lastStoneWeight([10,4,2,10]), 2);",
      },
      {
        name: "single stone and empty pile",
        body: "assert.equal(lastStoneWeight([9]), 9);\nassert.equal(lastStoneWeight([]), 0);",
      },
      {
        name: "one giant stone survives",
        body: "assert.equal(lastStoneWeight([1,1,1,100]), 97);",
      },
    ],
  },
  {
    id: "ex-task-scheduler",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Task Scheduler",
    brief:
      "<p><code>tasks</code> lists CPU tasks by name; each takes exactly one time unit. Two runs of the <b>same</b> task must be separated by at least <code>n</code> time units, during which the CPU may run a different task or sit idle. Return the shortest total time needed to finish every task.</p><ul><li>Tasks may be run in any order</li><li>When there is enough variety the answer is simply <code>tasks.length</code> — no idling is ever required</li><li><code>n = 0</code> means no cooldown at all</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction leastInterval(tasks, n) {\n  // TODO: at every tick, run whichever available task has the most work left\n}\n",
    hints: [
      "The names do not matter — only how many times each name appears. Start by counting.",
      "Greedy rule: at each tick run the task with the largest remaining count that is not cooling down. A max-heap gives you that in O(log k).",
      "Park a task you just ran in a waiting list together with the time it becomes available again, and move it back into the heap when the clock reaches that time. Ticks where the heap is empty but the waiting list is not are idle ticks — count them too.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction leastInterval(tasks, n) {\n  const counts = new Map();\n  for (const t of tasks) counts.set(t, (counts.get(t) || 0) + 1);\n  const heap = new MinHeap(function (a, b) { return b - a; });\n  for (const c of counts.values()) heap.push(c);\n  const cooling = [];\n  let time = 0;\n  while (heap.size() || cooling.length) {\n    time++;\n    if (heap.size()) {\n      const remaining = heap.pop() - 1;\n      if (remaining > 0) cooling.push([time + n, remaining]);\n    }\n    if (cooling.length && cooling[0][0] === time) heap.push(cooling.shift()[1]);\n  }\n  return time;\n}\n",
    tests: [
      {
        name: "idling is required",
        body: "assert.equal(leastInterval(['A','A','A','B','B','B'], 2), 8);",
      },
      {
        name: "no cooldown means no idling",
        body: "assert.equal(leastInterval(['A','A','A','B','B','B'], 0), 6);",
      },
      {
        name: "enough variety — the answer is just the task count",
        body: "assert.equal(leastInterval(['A','B','C','D','E','A','B','C','D','E'], 4), 10);\nassert.equal(leastInterval(['A','B','C','D'], 2), 4);",
      },
      {
        name: "one dominant task with plenty of filler",
        body: "assert.equal(leastInterval(['A','A','A','A','A','A','B','C','D','E','F','G'], 2), 16);",
      },
      {
        name: "single task repeated, and an empty list",
        body: "assert.equal(leastInterval(['A','A','A'], 2), 7);\nassert.equal(leastInterval([], 3), 0);",
      },
    ],
  },
  {
    id: "ex-sort-characters-by-frequency",
    chapter: "dsa-heaps-priority-queues",
    level: "intermediate",
    title: "Sort Characters By Frequency",
    brief:
      "<p>Given a string <code>s</code>, rearrange its characters so that they are grouped by how often they occur, most frequent group first.</p><ul><li>All copies of a character must sit together in one contiguous run</li><li>Characters with the same frequency may appear in <b>any order</b> relative to each other</li><li>The result must contain exactly the same characters as the input</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction frequencySort(s) {\n  // TODO: count, then emit whole runs in descending frequency order\n}\n",
    hints: [
      "Two phases: build a character -> count map, then decide the order of the groups.",
      "Push [character, count] pairs into the heap with a comparator that compares the counts in descending order.",
      "Pop repeatedly and append character.repeat(count) — that keeps every run contiguous for free.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction frequencySort(s) {\n  const counts = new Map();\n  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);\n  const heap = new MinHeap(function (a, b) { return b[1] - a[1]; });\n  for (const entry of counts) heap.push(entry);\n  let out = '';\n  while (heap.size()) {\n    const pair = heap.pop();\n    out += pair[0].repeat(pair[1]);\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "the most common letter comes first",
        body: "function checkFreq(input, out) {\n  assert.type(out, 'string');\n  assert.equal(out.length, input.length, 'length must match');\n  const a = {}, b = {};\n  for (const ch of input) a[ch] = (a[ch] || 0) + 1;\n  for (const ch of out) b[ch] = (b[ch] || 0) + 1;\n  assert.deepEqual(b, a, 'must be a rearrangement of the input');\n  let prev = Infinity, i = 0;\n  const seen = new Set();\n  while (i < out.length) {\n    let j = i;\n    while (j < out.length && out[j] === out[i]) j++;\n    assert.ok(!seen.has(out[i]), 'each character must form one contiguous run');\n    seen.add(out[i]);\n    assert.ok(j - i <= prev, 'runs must be in non-increasing frequency order');\n    prev = j - i;\n    i = j;\n  }\n}\ncheckFreq('tree', frequencySort('tree'));\nassert.equal(frequencySort('tree')[0], 'e');",
      },
      {
        name: "ties may come out in any order",
        body: "const out = frequencySort('cccaaa');\nassert.equal(out.length, 6);\nassert.ok(out === 'cccaaa' || out === 'aaaccc');",
      },
      {
        name: "case is significant",
        body: "const out = frequencySort('Aabb');\nassert.equal(out.slice(0, 2), 'bb');\nassert.equal(out.length, 4);\nassert.ok(out.indexOf('A') >= 0 && out.indexOf('a') >= 0);",
      },
      {
        name: "single character and empty string",
        body: "assert.equal(frequencySort('z'), 'z');\nassert.equal(frequencySort(''), '');",
      },
      {
        name: "a clear frequency ordering",
        body: "assert.equal(frequencySort('aaabbc'), 'aaabbc');",
      },
    ],
  },
  {
    id: "ex-reorganize-string",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Reorganize String",
    brief:
      "<p>Rearrange the characters of <code>s</code> so that no two adjacent characters are the same, and return the result.</p><ul><li>If no such arrangement exists, return the empty string <code>''</code></li><li><b>Any</b> valid arrangement is accepted — the tests check the property, not one specific string</li><li>An arrangement is impossible exactly when some character occurs more than <code>ceil(s.length / 2)</code> times</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction reorganizeString(s) {\n  // TODO: place the character you have the most of, but never twice in a row\n}\n",
    hints: [
      "The character with the highest count is the bottleneck — check it against ceil(n / 2) first and bail out early.",
      "Greedily emit the most frequent REMAINING character each step, using a max-heap of [character, count].",
      "The one you just placed must not be eligible next, so hold it aside for exactly one round and only push it back after you have popped the next character.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction reorganizeString(s) {\n  const counts = new Map();\n  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);\n  const limit = Math.ceil(s.length / 2);\n  const heap = new MinHeap(function (a, b) { return b[1] - a[1]; });\n  for (const entry of counts) {\n    if (entry[1] > limit) return '';\n    heap.push([entry[0], entry[1]]);\n  }\n  let out = '';\n  let held = null;\n  while (heap.size()) {\n    const current = heap.pop();\n    out += current[0];\n    current[1] -= 1;\n    if (held && held[1] > 0) heap.push(held);\n    held = current;\n  }\n  return out.length === s.length ? out : '';\n}\n",
    tests: [
      {
        name: "a valid rearrangement exists",
        body: "function checkValid(input, out) {\n  assert.type(out, 'string');\n  assert.equal(out.length, input.length, 'length must match the input');\n  const a = {}, b = {};\n  for (const ch of input) a[ch] = (a[ch] || 0) + 1;\n  for (const ch of out) b[ch] = (b[ch] || 0) + 1;\n  assert.deepEqual(b, a, 'must use exactly the same characters');\n  for (let i = 1; i < out.length; i++) {\n    assert.notEqual(out[i], out[i - 1], 'adjacent characters must differ');\n  }\n}\ncheckValid('aab', reorganizeString('aab'));\ncheckValid('aaabbb', reorganizeString('aaabbb'));",
      },
      {
        name: "impossible inputs return the empty string",
        body: "assert.equal(reorganizeString('aaab'), '');\nassert.equal(reorganizeString('aaaaab'), '');",
      },
      {
        name: "the exact boundary case is still possible",
        body: "const out = reorganizeString('aaabc');\nassert.equal(out.length, 5);\nfor (let i = 1; i < out.length; i++) assert.notEqual(out[i], out[i - 1]);\nlet aCount = 0;\nfor (const ch of out) if (ch === 'a') aCount++;\nassert.equal(aCount, 3);",
      },
      {
        name: "many distinct characters",
        body: "const input = 'vvvlo';\nconst out = reorganizeString(input);\nassert.equal(out.length, 5);\nfor (let i = 1; i < out.length; i++) assert.notEqual(out[i], out[i - 1]);",
      },
      {
        name: "single character and empty string",
        body: "assert.equal(reorganizeString('a'), 'a');\nassert.equal(reorganizeString(''), '');",
      },
    ],
  },
  {
    id: "ex-meeting-rooms-ii",
    chapter: "dsa-intervals",
    level: "intermediate",
    title: "Meeting Rooms II",
    brief:
      "<p>Given <code>intervals</code>, an array of <code>[start, end]</code> meeting times, return the minimum number of rooms needed so that no two overlapping meetings share a room.</p><ul><li>A meeting that ends exactly when another begins can reuse the same room</li><li>The input is not sorted</li><li>An empty schedule needs <code>0</code> rooms</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction minMeetingRooms(intervals) {\n  // TODO: process meetings in start order and track when rooms free up\n}\n",
    hints: [
      "Sort by start time so you can walk the day forward in order.",
      "The only thing you need to know about the busy rooms is which one frees up SOONEST — that is a min-heap of end times.",
      "For each meeting: if the earliest end time is <= this start, reuse that room (pop it). Then push this meeting's end. The heap size at the end is the answer.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction minMeetingRooms(intervals) {\n  if (!intervals.length) return 0;\n  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);\n  const endTimes = new MinHeap();\n  for (const meeting of sorted) {\n    if (endTimes.size() && endTimes.peek() <= meeting[0]) endTimes.pop();\n    endTimes.push(meeting[1]);\n  }\n  return endTimes.size();\n}\n",
    tests: [
      {
        name: "one long meeting plus two short ones",
        body: "assert.equal(minMeetingRooms([[0,30],[5,10],[15,20]]), 2);",
      },
      {
        name: "no overlap at all",
        body: "assert.equal(minMeetingRooms([[7,10],[2,4]]), 1);\nassert.equal(minMeetingRooms([[1,2],[2,3],[3,4]]), 1);",
      },
      {
        name: "everything overlaps",
        body: "assert.equal(minMeetingRooms([[1,5],[2,6],[3,7],[4,8]]), 4);",
      },
      {
        name: "empty schedule and a single meeting",
        body: "assert.equal(minMeetingRooms([]), 0);\nassert.equal(minMeetingRooms([[9,17]]), 1);",
      },
      {
        name: "input is not sorted",
        body: "assert.equal(minMeetingRooms([[13,15],[1,13],[6,9]]), 2);",
      },
    ],
  },
  {
    id: "ex-smallest-range-k-lists",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Smallest Range Covering Elements from K Lists",
    brief:
      "<p>You are given <code>k</code> lists of integers, each already sorted in non-decreasing order. Find the smallest range <code>[start, end]</code> that contains at least one number from every list.</p><ul><li>Range <code>[a, b]</code> is smaller than <code>[c, d]</code> when <code>b - a &lt; d - c</code>; on a tie the one with the smaller <code>a</code> wins</li><li>Return the range as a two-element array</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n",
    hints: [
      "Hold one 'cursor' per list. The current candidate range always runs from the smallest cursor value to the largest.",
      "A min-heap of [value, listIndex, position] gives you the smallest cursor instantly; track the maximum separately as a plain variable.",
      "Only advancing the SMALLEST cursor can ever shrink the range. Stop the moment that list runs out — no further range can cover every list.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction smallestRange(nums) {\n  const heap = new MinHeap(function (a, b) { return a[0] - b[0]; });\n  let currentMax = -Infinity;\n  for (let i = 0; i < nums.length; i++) {\n    heap.push([nums[i][0], i, 0]);\n    currentMax = Math.max(currentMax, nums[i][0]);\n  }\n  let best = [heap.peek()[0], currentMax];\n  for (;;) {\n    const entry = heap.pop();\n    const value = entry[0];\n    const list = entry[1];\n    const pos = entry[2];\n    if (currentMax - value < best[1] - best[0]) best = [value, currentMax];\n    if (pos + 1 === nums[list].length) break;\n    const next = nums[list][pos + 1];\n    currentMax = Math.max(currentMax, next);\n    heap.push([next, list, pos + 1]);\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "three interleaved lists",
        body: "const lists = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]];\nassert.deepEqual(smallestRange(lists), [20,24]);",
      },
      {
        name: "the very first window is already optimal",
        body: "assert.deepEqual(smallestRange([[1,10],[2,20],[3,30]]), [1,3]);",
      },
      {
        name: "disjoint blocks",
        body: "assert.deepEqual(smallestRange([[1,2,3],[4,5,6],[7,8,9]]), [3,7]);",
      },
      {
        name: "every list holds the same single value",
        body: "assert.deepEqual(smallestRange([[5],[5]]), [5,5]);",
      },
      {
        name: "one list only",
        body: "assert.deepEqual(smallestRange([[7]]), [7,7]);\nassert.deepEqual(smallestRange([[10,20],[15],[12,25]]), [10,15]);",
      },
    ],
  },
  {
    id: "ex-k-pairs-smallest-sums",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Find K Pairs with Smallest Sums",
    brief:
      "<p>Given two integer arrays <code>nums1</code> and <code>nums2</code>, both sorted in non-decreasing order, and an integer <code>k</code>, return the <code>k</code> pairs <code>[u, v]</code> — one value from each array — with the smallest sums.</p><ul><li>If fewer than <code>k</code> pairs exist, return all of them</li><li>Building every pair is <code>O(n * m)</code> and far too slow for large inputs</li><li>Pairs with equal sums may appear in any order</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction kSmallestPairs(nums1, nums2, k) {\n  // TODO: expand pairs outward from the cheapest corner instead of building them all\n}\n",
    hints: [
      "Think of the pairs as a grid, rows indexed by nums1 and columns by nums2. Both arrays are sorted, so sums grow as you move right or down.",
      "Seed a min-heap with the first column only: (0,0), (1,0), (2,0)... at most k of them.",
      "Each time you pop (i, j), the only new candidate it unlocks is (i, j + 1) — push that and repeat until you have k pairs.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction kSmallestPairs(nums1, nums2, k) {\n  const result = [];\n  if (!nums1.length || !nums2.length || k <= 0) return result;\n  const sumOf = (e) => nums1[e[0]] + nums2[e[1]];\n  const heap = new MinHeap(function (a, b) { return sumOf(a) - sumOf(b); });\n  const seeds = Math.min(nums1.length, k);\n  for (let i = 0; i < seeds; i++) heap.push([i, 0]);\n  while (result.length < k && heap.size()) {\n    const entry = heap.pop();\n    result.push([nums1[entry[0]], nums2[entry[1]]]);\n    if (entry[1] + 1 < nums2.length) heap.push([entry[0], entry[1] + 1]);\n  }\n  return result;\n}\n",
    tests: [
      {
        name: "three cheapest pairs, all distinct sums",
        body: "const out = kSmallestPairs([1,7,11], [2,4,6], 3)\n  .sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));\nassert.deepEqual(out, [[1,2],[1,4],[1,6]]);",
      },
      {
        name: "ties are allowed but the sums are fixed",
        body: "const out = kSmallestPairs([1,1,2], [1,2,3], 2);\nassert.equal(out.length, 2);\nconst sums = out.map((p) => p[0] + p[1]).sort((a, b) => a - b);\nassert.deepEqual(sums, [2,2]);\nout.forEach((p) => assert.deepEqual(p, [1,1]));",
      },
      {
        name: "k larger than the number of pairs",
        body: "const out = kSmallestPairs([1,2], [3], 10)\n  .sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));\nassert.deepEqual(out, [[1,3],[2,3]]);",
      },
      {
        name: "empty input or k of zero",
        body: "assert.deepEqual(kSmallestPairs([], [1,2], 3), []);\nassert.deepEqual(kSmallestPairs([1,2], [], 3), []);\nassert.deepEqual(kSmallestPairs([1,2], [3,4], 0), []);",
      },
      {
        name: "negatives sort correctly",
        body: "const out = kSmallestPairs([-10,-4,0], [3,5,6], 2)\n  .sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));\nassert.deepEqual(out, [[-10,3],[-10,5]]);",
      },
    ],
  },
  {
    id: "ex-ipo-maximize-capital",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "IPO — Maximise Capital",
    brief:
      "<p>You may finish at most <code>k</code> projects before an IPO. Project <code>i</code> needs <code>capital[i]</code> up front and adds <code>profits[i]</code> to your money when it finishes. You start with <code>w</code> capital and can only work on one project at a time.</p><ul><li>Profit is added to your capital, so finishing a project may unlock more expensive ones</li><li>Each project can be done at most once</li><li>Return the maximum capital you can end up with</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction findMaximizedCapital(k, w, profits, capital) {\n  // TODO: at each step, take the best project you can currently afford\n}\n",
    hints: [
      "Because profits are non-negative, your capital never shrinks — so a project that becomes affordable stays affordable.",
      "Sort the projects by required capital and keep a pointer that moves forward as your capital grows.",
      "Move every newly affordable project's PROFIT into a max-heap, then take its root. Repeat k times, stopping early if the heap is empty.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction findMaximizedCapital(k, w, profits, capital) {\n  const order = profits.map((_, i) => i).sort((a, b) => capital[a] - capital[b]);\n  const affordable = new MinHeap(function (a, b) { return b - a; });\n  let next = 0;\n  let money = w;\n  for (let round = 0; round < k; round++) {\n    while (next < order.length && capital[order[next]] <= money) {\n      affordable.push(profits[order[next]]);\n      next++;\n    }\n    if (!affordable.size()) break;\n    money += affordable.pop();\n  }\n  return money;\n}\n",
    tests: [
      {
        name: "two projects unlock the third",
        body: "assert.equal(findMaximizedCapital(2, 0, [1,2,3], [0,1,1]), 4);",
      },
      {
        name: "doing all of them",
        body: "assert.equal(findMaximizedCapital(3, 0, [1,2,3], [0,1,2]), 6);",
      },
      {
        name: "nothing is affordable",
        body: "assert.equal(findMaximizedCapital(1, 0, [1,2,3], [1,1,2]), 0);\nassert.equal(findMaximizedCapital(5, 0, [10], [7]), 0);",
      },
      {
        name: "greedy must pick the biggest affordable profit",
        body: "assert.equal(findMaximizedCapital(1, 2, [1,2,3], [0,1,1]), 5);",
      },
      {
        name: "k of zero and an empty project list",
        body: "assert.equal(findMaximizedCapital(0, 5, [1,2], [0,0]), 5);\nassert.equal(findMaximizedCapital(3, 5, [], []), 5);",
      },
    ],
  },
  {
    id: "ex-maximum-performance-team",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Maximum Performance of a Team",
    brief:
      "<p>There are <code>n</code> engineers; engineer <code>i</code> has <code>speed[i]</code> and <code>efficiency[i]</code>. Pick <b>at most</b> <code>k</code> of them to maximise the team's performance, defined as the <em>sum of their speeds</em> multiplied by the <em>minimum efficiency</em> among the chosen engineers.</p><ul><li>You may pick fewer than <code>k</code> engineers if that is better</li><li>Return the maximum performance as a plain number — the test inputs are small enough that no modulo is needed</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction maxPerformance(n, speed, efficiency, k) {\n  // TODO: fix the minimum efficiency first, then maximise the speed sum\n}\n",
    hints: [
      "The formula has two moving parts. Pin one of them down: suppose engineer i is the LEAST efficient member of the team.",
      "Sort engineers by efficiency descending. When you reach engineer i, everyone already seen has efficiency at least as high, so any team drawn from them has minimum efficiency efficiency[i].",
      "Keep the k fastest of those in a min-heap of speeds with a running sum; evict the slowest when the heap exceeds k, and score sum * efficiency[i] at every step.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction maxPerformance(n, speed, efficiency, k) {\n  const order = efficiency.map((_, i) => i).sort((a, b) => efficiency[b] - efficiency[a]);\n  const speeds = new MinHeap();\n  let sum = 0;\n  let best = 0;\n  for (const i of order) {\n    speeds.push(speed[i]);\n    sum += speed[i];\n    if (speeds.size() > k) sum -= speeds.pop();\n    best = Math.max(best, sum * efficiency[i]);\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "team of at most two",
        body: "assert.equal(maxPerformance(6, [2,10,3,1,5,8], [5,4,3,9,7,2], 2), 60);",
      },
      {
        name: "team of at most three",
        body: "assert.equal(maxPerformance(6, [2,10,3,1,5,8], [5,4,3,9,7,2], 3), 68);",
      },
      {
        name: "k equal to n — everyone is allowed",
        body: "assert.equal(maxPerformance(6, [2,10,3,1,5,8], [5,4,3,9,7,2], 6), 72);\nassert.equal(maxPerformance(6, [2,10,3,1,5,8], [5,4,3,9,7,2], 4), 72);",
      },
      {
        name: "k of one picks the best single engineer",
        body: "assert.equal(maxPerformance(3, [2,8,2], [2,7,1], 1), 56);",
      },
      {
        name: "a single engineer, and fewer than k is sometimes better",
        body: "assert.equal(maxPerformance(1, [5], [4], 1), 20);\nassert.equal(maxPerformance(2, [10,1], [10,1], 2), 100);",
      },
    ],
  },
  {
    id: "ex-min-cost-connect-sticks",
    chapter: "dsa-heaps-priority-queues",
    level: "intermediate",
    title: "Minimum Cost to Connect Sticks",
    brief:
      "<p>You have sticks of the given lengths. Connecting two sticks of lengths <code>x</code> and <code>y</code> costs <code>x + y</code> and produces a single stick of length <code>x + y</code>. Return the minimum total cost of joining them all into one stick.</p><ul><li>You may connect the sticks in any order</li><li>Zero or one stick costs <code>0</code> — there is nothing to join</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction connectSticks(sticks) {\n  // TODO: which two sticks should you join first, and why?\n}\n",
    hints: [
      "A stick's length is paid again in every later join it takes part in — so short sticks should be combined early, while the total is still small.",
      "Greedily join the two SHORTEST remaining sticks, then drop the result back into the pool.",
      "Sorting once is not enough because each new stick has to slot back into the ordering — that is exactly what a min-heap gives you.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction connectSticks(sticks) {\n  const heap = new MinHeap();\n  for (const s of sticks) heap.push(s);\n  let cost = 0;\n  while (heap.size() > 1) {\n    const joined = heap.pop() + heap.pop();\n    cost += joined;\n    heap.push(joined);\n  }\n  return cost;\n}\n",
    tests: [
      {
        name: "three sticks",
        body: "assert.equal(connectSticks([2,4,3]), 14);",
      },
      {
        name: "four sticks — order matters",
        body: "assert.equal(connectSticks([1,8,3,5]), 30);",
      },
      {
        name: "nothing to join",
        body: "assert.equal(connectSticks([5]), 0);\nassert.equal(connectSticks([]), 0);",
      },
      {
        name: "two sticks cost their sum",
        body: "assert.equal(connectSticks([1,1]), 2);\nassert.equal(connectSticks([3,7]), 10);",
      },
      {
        name: "one long stick among short ones",
        body: "assert.equal(connectSticks([1,2,3,4,5]), 33);",
      },
    ],
  },
  {
    id: "ex-furthest-building-you-can-reach",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Furthest Building You Can Reach",
    brief:
      "<p>You walk along a row of buildings with the given <code>heights</code>, starting at index <code>0</code> and always moving to the next building. You carry <code>bricks</code> bricks and <code>ladders</code> ladders.</p><ul><li>Stepping down or onto an equal height is free</li><li>Stepping up by <code>d</code> costs either <code>d</code> bricks or one ladder</li><li>A ladder covers any height difference; bricks are consumed permanently</li><li>Return the index of the furthest building you can reach</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction furthestBuilding(heights, bricks, ladders) {\n  // TODO: ladders are worth the most on the biggest climbs — but you find those later\n}\n",
    hints: [
      "Only the upward jumps matter; flat and downhill steps are free and can be skipped entirely.",
      "Ladders should end up on the largest jumps overall, but you cannot know which those are until you have walked further — so commit tentatively and revise.",
      "Assume every climb uses a ladder and hold those climbs in a MIN heap. Once you hold more than `ladders` of them, the smallest one is demoted: pop it and pay for it with bricks. If bricks go negative, you are stuck at the previous building.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction furthestBuilding(heights, bricks, ladders) {\n  const climbs = new MinHeap();\n  let remaining = bricks;\n  for (let i = 0; i + 1 < heights.length; i++) {\n    const diff = heights[i + 1] - heights[i];\n    if (diff <= 0) continue;\n    climbs.push(diff);\n    if (climbs.size() > ladders) remaining -= climbs.pop();\n    if (remaining < 0) return i;\n  }\n  return heights.length - 1;\n}\n",
    tests: [
      {
        name: "the ladder must be saved for the biggest climb",
        body: "assert.equal(furthestBuilding([4,2,7,6,9,14,12], 5, 1), 4);",
      },
      {
        name: "two ladders reach further",
        body: "assert.equal(furthestBuilding([4,12,2,7,3,18,20,3,19], 10, 2), 7);",
      },
      {
        name: "bricks alone are enough",
        body: "assert.equal(furthestBuilding([14,3,19,3], 17, 0), 3);",
      },
      {
        name: "stuck immediately with no resources",
        body: "assert.equal(furthestBuilding([1,2,3], 0, 0), 0);\nassert.equal(furthestBuilding([1,5,1,2], 0, 1), 2);",
      },
      {
        name: "flat and downhill walks are always free",
        body: "assert.equal(furthestBuilding([1,1,1], 0, 0), 2);\nassert.equal(furthestBuilding([9,5,2], 0, 0), 2);\nassert.equal(furthestBuilding([7], 0, 0), 0);",
      },
    ],
  },
  {
    id: "ex-valid-anagram",
    chapter: "dsa-hashing",
    level: "beginner",
    title: "Valid Anagram",
    brief:
      "<p>Two words are anagrams when one is a rearrangement of the other: the same letters, each used the same number of times. Write <code>isAnagram(s, t)</code> which returns <code>true</code> when <code>t</code> is an anagram of <code>s</code>.</p><ul><li>Comparison is case-sensitive and every character counts, including repeats</li><li>Two empty strings are anagrams of each other</li><li>Strings of different lengths can never be anagrams</li></ul>",
    starter: "function isAnagram(s, t) {\n  // TODO: decide whether t uses exactly the same characters as s\n}\n",
    hints: [
      "Sorting both strings works and is easy to reason about, but it costs O(n log n). What cheaper summary of a string is identical for any two anagrams?",
      "A frequency table keyed by character is enough. Build it once for s.",
      "Walk t and decrement each count. If a count ever drops below zero — or a character is missing entirely — you can stop early.",
    ],
    solution:
      "function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const counts = new Map();\n  for (const c of s) counts.set(c, (counts.get(c) || 0) + 1);\n  for (const c of t) {\n    const n = counts.get(c);\n    if (!n) return false;\n    counts.set(c, n - 1);\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "recognises a genuine anagram",
        body: "assert.equal(isAnagram('anagram', 'nagaram'), true);",
      },
      {
        name: "rejects different letters",
        body: "assert.equal(isAnagram('rat', 'car'), false);",
      },
      {
        name: "rejects different lengths",
        body: "assert.equal(isAnagram('a', 'ab'), false);\nassert.equal(isAnagram('ab', 'a'), false);",
      },
      {
        name: "counts repeats, not just the letter set",
        body: "assert.equal(isAnagram('aacc', 'ccac'), false);\nassert.equal(isAnagram('aabb', 'bbaa'), true);",
      },
      {
        name: "two empty strings are anagrams",
        body: "assert.equal(isAnagram('', ''), true);",
      },
    ],
  },
  {
    id: "ex-valid-palindrome",
    chapter: "dsa-two-pointers",
    level: "beginner",
    title: "Valid Palindrome",
    brief:
      "<p>Write <code>isPalindrome(s)</code>. Ignore every character that is not a letter or a digit, treat upper and lower case as equal, and report whether what is left reads the same forwards and backwards.</p><ul><li>Punctuation and spaces are skipped entirely, not replaced</li><li>Digits do count as content</li><li>A string with no alphanumeric characters at all is a palindrome</li><li>Aim for O(1) extra space — do not build a cleaned copy of the string</li></ul>",
    starter: "function isPalindrome(s) {\n  // TODO: compare the string against itself from both ends\n}\n",
    hints: [
      "Two indices, one at each end, walking toward each other, is enough — no cleaned copy needed.",
      "Before comparing, advance each pointer past any character that is not a letter or digit.",
      "Guard the skip loops with the same 'left < right' condition so a string of pure punctuation cannot run a pointer off the end.",
    ],
    solution:
      "function isPalindrome(s) {\n  const isAlnum = (c) =>\n    (c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');\n  let i = 0;\n  let j = s.length - 1;\n  while (i < j) {\n    while (i < j && !isAlnum(s[i])) i++;\n    while (i < j && !isAlnum(s[j])) j--;\n    if (s[i].toLowerCase() !== s[j].toLowerCase()) return false;\n    i++;\n    j--;\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "ignores case and punctuation",
        body: "assert.equal(isPalindrome('A man, a plan, a canal: Panama'), true);",
      },
      {
        name: "rejects a non-palindrome",
        body: "assert.equal(isPalindrome('race a car'), false);\nassert.equal(isPalindrome('hello'), false);",
      },
      {
        name: "blank and punctuation-only strings are palindromes",
        body: "assert.equal(isPalindrome(''), true);\nassert.equal(isPalindrome(' '), true);\nassert.equal(isPalindrome('.,;!'), true);",
      },
      {
        name: "digits are part of the content",
        body: "assert.equal(isPalindrome('0P'), false);\nassert.equal(isPalindrome('1a2!2a1'), true);",
      },
      {
        name: "single character",
        body: "assert.equal(isPalindrome('z'), true);",
      },
    ],
  },
  {
    id: "ex-longest-common-prefix",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Longest Common Prefix",
    brief:
      "<p>Given an array of strings, return the longest string that every one of them starts with. Write <code>longestCommonPrefix(strs)</code>.</p><ul><li>If the strings share no starting characters, return the empty string</li><li>An empty array also yields the empty string</li><li>Any empty string in the array forces the answer to be empty</li></ul>",
    starter: "function longestCommonPrefix(strs) {\n  // TODO: return the prefix shared by every string in strs\n}\n",
    hints: [
      "The answer can never be longer than the shortest string in the array.",
      "Take the first string as a candidate prefix and shrink it against each remaining string.",
      "Alternatively compare column by column: check index 0 across all strings, then index 1, stopping at the first mismatch or the first string that has run out.",
    ],
    solution:
      "function longestCommonPrefix(strs) {\n  if (!strs || strs.length === 0) return '';\n  let prefix = strs[0];\n  for (let i = 1; i < strs.length; i++) {\n    let k = 0;\n    const s = strs[i];\n    while (k < prefix.length && k < s.length && prefix[k] === s[k]) k++;\n    prefix = prefix.slice(0, k);\n    if (prefix === '') return '';\n  }\n  return prefix;\n}\n",
    tests: [
      {
        name: "finds a shared prefix",
        body: "assert.equal(longestCommonPrefix(['flower', 'flow', 'flight']), 'fl');\nassert.equal(longestCommonPrefix(['interspecies', 'interstellar', 'interstate']), 'inters');",
      },
      {
        name: "returns empty when nothing is shared",
        body: "assert.equal(longestCommonPrefix(['dog', 'racecar', 'car']), '');",
      },
      {
        name: "handles an empty string in the array",
        body: "assert.equal(longestCommonPrefix(['', 'abc']), '');\nassert.equal(longestCommonPrefix(['abc', '']), '');",
      },
      {
        name: "single string is its own prefix",
        body: "assert.equal(longestCommonPrefix(['alone']), 'alone');",
      },
      {
        name: "empty array",
        body: "assert.equal(longestCommonPrefix([]), '');",
      },
    ],
  },
  {
    id: "ex-reverse-string-in-place",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Reverse String In Place",
    brief:
      "<p>You are handed an array of single-character strings. Write <code>reverseString(chars)</code> so that the array itself ends up reversed.</p><ul><li>Mutate the array you were given — do not build and return a new one</li><li>Use O(1) extra space; <code>slice</code>, <code>reverse</code> and friends defeat the point</li><li>The return value is not checked, but returning the same array is fine</li></ul>",
    starter: "function reverseString(chars) {\n  // TODO: reverse chars in place\n}\n",
    hints: [
      "Only half the array needs to move — each swap places two characters at once.",
      "Keep an index at the front and one at the back, swap what they point at, then step both inward until they meet.",
    ],
    solution:
      "function reverseString(chars) {\n  let i = 0;\n  let j = chars.length - 1;\n  while (i < j) {\n    const tmp = chars[i];\n    chars[i] = chars[j];\n    chars[j] = tmp;\n    i++;\n    j--;\n  }\n  return chars;\n}\n",
    tests: [
      {
        name: "mutates the caller's array",
        body: "const arr = ['h', 'e', 'l', 'l', 'o'];\nreverseString(arr);\nassert.deepEqual(arr, ['o', 'l', 'l', 'e', 'h'], 'the original array must be reversed in place');",
      },
      {
        name: "does not replace the array with a new one",
        body: "const arr = ['a', 'b', 'c'];\nconst out = reverseString(arr);\nassert.ok(out === undefined || out === arr, 'return the same array or nothing at all');\nassert.deepEqual(arr, ['c', 'b', 'a']);",
      },
      {
        name: "even length",
        body: "const arr = ['H', 'a', 'n', 'n', 'a', 'h'];\nreverseString(arr);\nassert.deepEqual(arr, ['h', 'a', 'n', 'n', 'a', 'H']);",
      },
      {
        name: "single element and empty array",
        body: "const one = ['x'];\nreverseString(one);\nassert.deepEqual(one, ['x']);\nconst none = [];\nreverseString(none);\nassert.deepEqual(none, []);",
      },
    ],
  },
  {
    id: "ex-reverse-words-in-string",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Reverse Words in a String",
    brief:
      "<p>Write <code>reverseWords(s)</code>. A word is any run of non-space characters. Return the words in the opposite order, joined by a single space.</p><ul><li>Leading and trailing spaces must not appear in the result</li><li>Runs of several spaces between words collapse to one</li><li>The letters inside each word keep their order — only the words move</li><li>A string of nothing but spaces returns the empty string</li></ul>",
    starter: "function reverseWords(s) {\n  // TODO: return the words of s in reverse order, single-spaced\n}\n",
    hints: [
      "Splitting on a single space leaves empty entries wherever two spaces sat next to each other.",
      "Filter those empties out after splitting — or scan the string yourself and collect each run of non-space characters.",
      "Once you have a clean array of words, reversing and joining with ' ' finishes the job.",
    ],
    solution:
      "function reverseWords(s) {\n  const words = [];\n  let i = 0;\n  while (i < s.length) {\n    while (i < s.length && s[i] === ' ') i++;\n    let start = i;\n    while (i < s.length && s[i] !== ' ') i++;\n    if (i > start) words.push(s.slice(start, i));\n  }\n  let out = '';\n  for (let k = words.length - 1; k >= 0; k--) {\n    out += words[k];\n    if (k > 0) out += ' ';\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "reverses simple word order",
        body: "assert.equal(reverseWords('the sky is blue'), 'blue is sky the');",
      },
      {
        name: "trims leading and trailing spaces",
        body: "assert.equal(reverseWords('  hello world  '), 'world hello');",
      },
      {
        name: "collapses repeated inner spaces",
        body: "assert.equal(reverseWords('a good   example'), 'example good a');",
      },
      {
        name: "single word and blank input",
        body: "assert.equal(reverseWords('solo'), 'solo');\nassert.equal(reverseWords('   '), '');\nassert.equal(reverseWords(''), '');",
      },
      {
        name: "letters inside words are untouched",
        body: "assert.equal(reverseWords('  abc  def '), 'def abc');",
      },
    ],
  },
  {
    id: "ex-implement-strstr",
    chapter: "dsa-string-algorithms",
    level: "intermediate",
    title: "Implement indexOf (strStr)",
    brief:
      "<p>Write <code>strStr(haystack, needle)</code> returning the index of the first occurrence of <code>needle</code> inside <code>haystack</code>, or <code>-1</code> when it does not occur.</p><ul><li>An empty <code>needle</code> matches at index <code>0</code></li><li>Matches may overlap earlier partial matches, so a failed comparison must not skip characters blindly</li><li>Do not call the built-in <code>indexOf</code>, <code>includes</code> or <code>search</code></li></ul>",
    starter:
      "function strStr(haystack, needle) {\n  // TODO: return the first index where needle starts inside haystack, else -1\n}\n",
    hints: [
      "The last position worth trying is haystack.length - needle.length; past that the needle cannot fit.",
      "For each start position, compare characters one by one and abandon the attempt on the first mismatch.",
      "Watch inputs like ('aaab', 'aab') — after a failed attempt you must resume from the next start index, not from where the mismatch happened.",
    ],
    solution:
      "function strStr(haystack, needle) {\n  const n = haystack.length;\n  const m = needle.length;\n  if (m === 0) return 0;\n  if (m > n) return -1;\n  for (let i = 0; i <= n - m; i++) {\n    let k = 0;\n    while (k < m && haystack[i + k] === needle[k]) k++;\n    if (k === m) return i;\n  }\n  return -1;\n}\n",
    tests: [
      {
        name: "finds the first occurrence",
        body: "assert.equal(strStr('sadbutsad', 'sad'), 0);\nassert.equal(strStr('mississippi', 'issip'), 4);",
      },
      {
        name: "returns -1 when absent",
        body: "assert.equal(strStr('leetcode', 'leeto'), -1);\nassert.equal(strStr('abc', 'abcd'), -1);",
      },
      {
        name: "empty needle matches at 0",
        body: "assert.equal(strStr('abc', ''), 0);\nassert.equal(strStr('', ''), 0);",
      },
      {
        name: "recovers from a partial match",
        body: "assert.equal(strStr('aaab', 'aab'), 1);\nassert.equal(strStr('ababab', 'abab'), 0);",
      },
      {
        name: "needle longer than haystack",
        body: "assert.equal(strStr('a', 'aa'), -1);",
      },
    ],
  },
  {
    id: "ex-longest-palindromic-substring",
    chapter: "dsa-two-pointers",
    level: "advanced",
    title: "Longest Palindromic Substring",
    brief:
      "<p>Write <code>longestPalindrome(s)</code> returning the longest contiguous slice of <code>s</code> that reads the same in both directions.</p><ul><li>If several slices tie for longest, returning any one of them is correct</li><li>Palindromes can have odd length (a centre character) or even length (a centre gap)</li><li>The empty string yields the empty string; a single character is its own answer</li><li>Checking every substring is O(n^3) — aim for O(n^2) time and O(1) space</li></ul>",
    starter: "function longestPalindrome(s) {\n  // TODO: return the longest palindromic substring of s\n}\n",
    hints: [
      "Every palindrome grows outward from a centre. How many centres does a string of length n have?",
      "There are 2n - 1 of them: n single characters and n - 1 gaps between neighbours. Expand from each while the characters on both sides still match.",
      "Keep only the best start index and length as you go, and slice once at the end — no need to store the candidate strings.",
    ],
    solution:
      "function longestPalindrome(s) {\n  if (s.length < 2) return s;\n  let bestStart = 0;\n  let bestLen = 1;\n  const expand = (lo, hi) => {\n    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) {\n      lo--;\n      hi++;\n    }\n    const len = hi - lo - 1;\n    if (len > bestLen) {\n      bestLen = len;\n      bestStart = lo + 1;\n    }\n  };\n  for (let i = 0; i < s.length; i++) {\n    expand(i, i);\n    expand(i, i + 1);\n  }\n  return s.slice(bestStart, bestStart + bestLen);\n}\n",
    tests: [
      {
        name: "odd-length palindrome, ties allowed",
        body: "const s = 'babad';\nconst r = longestPalindrome(s);\nassert.type(r, 'string');\nassert.equal(r.length, 3, 'the longest palindrome here has length 3');\nassert.ok(s.indexOf(r) !== -1, 'the answer must be a substring of the input');\nassert.equal(r, r.split('').reverse().join(''), 'the answer must be a palindrome');",
      },
      {
        name: "even-length palindrome",
        body: "const s = 'cbbd';\nconst r = longestPalindrome(s);\nassert.equal(r.length, 2);\nassert.ok(s.indexOf(r) !== -1);\nassert.equal(r, r.split('').reverse().join(''));",
      },
      {
        name: "whole string is a palindrome",
        body: "assert.equal(longestPalindrome('aaaa'), 'aaaa');\nconst r = longestPalindrome('forgeeksskeegfor');\nassert.equal(r.length, 10);\nassert.equal(r, r.split('').reverse().join(''));",
      },
      {
        name: "no repeats means any single character wins",
        body: "const s = 'abcde';\nconst r = longestPalindrome(s);\nassert.equal(r.length, 1);\nassert.ok(s.indexOf(r) !== -1);",
      },
      {
        name: "empty and single-character input",
        body: "assert.equal(longestPalindrome(''), '');\nassert.equal(longestPalindrome('q'), 'q');",
      },
    ],
  },
  {
    id: "ex-longest-substring-no-repeat",
    chapter: "dsa-sliding-window",
    level: "intermediate",
    title: "Longest Substring Without Repeating Characters",
    brief:
      "<p>Write <code>lengthOfLongestSubstring(s)</code> returning the length of the longest contiguous stretch of <code>s</code> in which no character appears twice.</p><ul><li>Return a number, not the substring itself</li><li>The empty string answers <code>0</code></li><li>Spaces, digits and symbols are ordinary characters here</li><li>One pass over the string is enough</li></ul>",
    starter:
      "function lengthOfLongestSubstring(s) {\n  // TODO: return the length of the longest duplicate-free window\n}\n",
    hints: [
      "Keep a window [left, right] that is always duplicate-free, and extend right one character at a time.",
      "When the new character is already inside the window, the left edge has to move past its previous position.",
      "Storing each character's most recent index in a Map lets you jump left straight there instead of shrinking one step at a time — but only move left forward, never backward.",
    ],
    solution:
      "function lengthOfLongestSubstring(s) {\n  const lastSeen = new Map();\n  let left = 0;\n  let best = 0;\n  for (let right = 0; right < s.length; right++) {\n    const c = s[right];\n    if (lastSeen.has(c) && lastSeen.get(c) >= left) {\n      left = lastSeen.get(c) + 1;\n    }\n    lastSeen.set(c, right);\n    const len = right - left + 1;\n    if (len > best) best = len;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "typical case",
        body: "assert.equal(lengthOfLongestSubstring('abcabcbb'), 3);",
      },
      {
        name: "all identical characters",
        body: "assert.equal(lengthOfLongestSubstring('bbbbb'), 1);",
      },
      {
        name: "the window must not be a subsequence",
        body: "assert.equal(lengthOfLongestSubstring('pwwkew'), 3);\nassert.equal(lengthOfLongestSubstring('dvdf'), 3);",
      },
      {
        name: "empty string and no repeats at all",
        body: "assert.equal(lengthOfLongestSubstring(''), 0);\nassert.equal(lengthOfLongestSubstring('abcdef'), 6);",
      },
      {
        name: "spaces and symbols count",
        body: "assert.equal(lengthOfLongestSubstring('a b!a b'), 4);",
      },
    ],
  },
  {
    id: "ex-group-anagrams",
    chapter: "dsa-hashing",
    level: "intermediate",
    title: "Group Anagrams",
    brief:
      "<p>Given an array of strings, bucket them so that every bucket holds words that are anagrams of one another. Write <code>groupAnagrams(strs)</code> returning an array of those buckets.</p><ul><li>The order of the buckets and the order inside each bucket do not matter</li><li>Every input string belongs to exactly one bucket, duplicates included</li><li>The empty string forms a bucket of its own</li><li>An empty input array yields an empty array</li></ul>",
    starter:
      "function groupAnagrams(strs) {\n  // TODO: return the strings grouped so each group holds mutual anagrams\n}\n",
    hints: [
      "Comparing every pair is O(n^2 * k). Instead, give each word a key that is identical for all its anagrams.",
      "Sorting a word's characters produces exactly such a key — 'eat', 'tea' and 'ate' all become 'aet'.",
      "Collect the words into a Map from key to array, then return the Map's values.",
    ],
    solution:
      "function groupAnagrams(strs) {\n  const groups = new Map();\n  for (const word of strs) {\n    const key = word.split('').sort().join('');\n    if (!groups.has(key)) groups.set(key, []);\n    groups.get(key).push(word);\n  }\n  const out = [];\n  for (const group of groups.values()) out.push(group);\n  return out;\n}\n",
    tests: [
      {
        name: "groups a mixed list",
        body: "const norm = (gs) =>\n  gs.map((g) => g.slice().sort()).sort((a, b) => (a.join(',') < b.join(',') ? -1 : 1));\nconst got = groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']);\nassert.deepEqual(norm(got), norm([['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]));",
      },
      {
        name: "single empty string",
        body: "const norm = (gs) =>\n  gs.map((g) => g.slice().sort()).sort((a, b) => (a.join(',') < b.join(',') ? -1 : 1));\nassert.deepEqual(norm(groupAnagrams([''])), norm([['']]));",
      },
      {
        name: "nothing groups together",
        body: "const norm = (gs) =>\n  gs.map((g) => g.slice().sort()).sort((a, b) => (a.join(',') < b.join(',') ? -1 : 1));\nconst got = groupAnagrams(['abc', 'de', 'f']);\nassert.equal(got.length, 3);\nassert.deepEqual(norm(got), norm([['abc'], ['de'], ['f']]));",
      },
      {
        name: "duplicates stay in the same bucket",
        body: "const norm = (gs) =>\n  gs.map((g) => g.slice().sort()).sort((a, b) => (a.join(',') < b.join(',') ? -1 : 1));\nconst got = groupAnagrams(['ab', 'ba', 'ab']);\nassert.equal(got.length, 1);\nassert.deepEqual(norm(got), norm([['ab', 'ab', 'ba']]));",
      },
      {
        name: "empty input",
        body: "assert.deepEqual(groupAnagrams([]), []);",
      },
    ],
  },
  {
    id: "ex-valid-parentheses",
    chapter: "dsa-stacks-queues",
    level: "beginner",
    title: "Valid Parentheses",
    brief:
      "<p>A string made only of <code>()</code>, <code>[]</code> and <code>{}</code> is balanced when every opening bracket is closed by the matching kind, in the right order. Write <code>isValid(s)</code>.</p><ul><li>Brackets may nest, e.g. <code>{[()]}</code> is balanced</li><li>They may not cross, e.g. <code>([)]</code> is not</li><li>A closing bracket with nothing open, or an opening bracket never closed, both fail</li><li>The empty string is balanced</li></ul>",
    starter: "function isValid(s) {\n  // TODO: report whether every bracket is closed by its own kind, in order\n}\n",
    hints: [
      "Counting brackets is not enough — '([)]' has the right counts and is still wrong.",
      "The most recently opened bracket is always the one that must close first. Which data structure has that property?",
      "Push openers onto a stack; on a closer, pop and check the pair. At the end the stack must be empty.",
    ],
    solution:
      "function isValid(s) {\n  const pairs = new Map([[')', '('], [']', '['], ['}', '{']]);\n  const stack = [];\n  for (const c of s) {\n    if (c === '(' || c === '[' || c === '{') {\n      stack.push(c);\n    } else if (pairs.has(c)) {\n      if (stack.pop() !== pairs.get(c)) return false;\n    }\n  }\n  return stack.length === 0;\n}\n",
    tests: [
      {
        name: "simple and nested balanced strings",
        body: "assert.equal(isValid('()'), true);\nassert.equal(isValid('()[]{}'), true);\nassert.equal(isValid('{[()]}'), true);",
      },
      {
        name: "mismatched kinds",
        body: "assert.equal(isValid('(]'), false);\nassert.equal(isValid('([)]'), false);",
      },
      {
        name: "unclosed opener",
        body: "assert.equal(isValid('('), false);\nassert.equal(isValid('([]'), false);",
      },
      {
        name: "closer with nothing open",
        body: "assert.equal(isValid(']'), false);\nassert.equal(isValid('(){}}{'), false);",
      },
      {
        name: "empty string is balanced",
        body: "assert.equal(isValid(''), true);",
      },
    ],
  },
  {
    id: "ex-string-to-integer-atoi",
    chapter: "dsa-arrays-strings",
    level: "advanced",
    title: "String to Integer (atoi)",
    brief:
      "<p>Write <code>myAtoi(s)</code>, a hand-rolled string-to-number conversion following these rules exactly, in order.</p><ul><li>Skip any leading spaces</li><li>Accept one optional <code>+</code> or <code>-</code></li><li>Read digits until a non-digit or the end of the string; stop there and ignore the rest</li><li>If no digits were read, the answer is <code>0</code></li><li>Clamp the result to the signed 32-bit range: below <code>-2147483648</code> becomes <code>-2147483648</code>, above <code>2147483647</code> becomes <code>2147483647</code></li><li>Do not use <code>parseInt</code>, <code>Number</code> or <code>+s</code></li></ul>",
    starter: "function myAtoi(s) {\n  // TODO: parse a leading signed integer out of s and clamp it to 32 bits\n}\n",
    hints: [
      "Work through the four phases in order with a single index: whitespace, sign, digits, stop.",
      "Only the space character is skipped, and only before the sign — ' -42' parses but '- 42' does not.",
      "Build the value as digits * 10 + digit, and clamp the moment it passes the boundary rather than after the whole loop.",
    ],
    solution:
      "function myAtoi(s) {\n  const MAX = 2147483647;\n  const MIN = -2147483648;\n  let i = 0;\n  while (i < s.length && s[i] === ' ') i++;\n  let sign = 1;\n  if (s[i] === '+' || s[i] === '-') {\n    if (s[i] === '-') sign = -1;\n    i++;\n  }\n  let value = 0;\n  while (i < s.length && s[i] >= '0' && s[i] <= '9') {\n    value = value * 10 + (s.charCodeAt(i) - 48);\n    if (sign === 1 && value > MAX) return MAX;\n    if (sign === -1 && -value < MIN) return MIN;\n    i++;\n  }\n  return sign * value;\n}\n",
    tests: [
      {
        name: "plain and signed numbers",
        body: "assert.equal(myAtoi('42'), 42);\nassert.equal(myAtoi('+1'), 1);\nassert.equal(myAtoi('   -042'), -42);",
      },
      {
        name: "stops at the first non-digit",
        body: "assert.equal(myAtoi('1337c0d3'), 1337);\nassert.equal(myAtoi('4193 with words'), 4193);\nassert.equal(myAtoi('0-1'), 0);",
      },
      {
        name: "no leading digits means zero",
        body: "assert.equal(myAtoi('words and 987'), 0);\nassert.equal(myAtoi(''), 0);\nassert.equal(myAtoi('   '), 0);\nassert.equal(myAtoi('-'), 0);\nassert.equal(myAtoi('- 42'), 0);\nassert.equal(myAtoi('+-12'), 0);",
      },
      {
        name: "clamps to the 32-bit range",
        body: "assert.equal(myAtoi('-91283472332'), -2147483648);\nassert.equal(myAtoi('91283472332'), 2147483647);\nassert.equal(myAtoi('2147483648'), 2147483647);\nassert.equal(myAtoi('-2147483649'), -2147483648);",
      },
      {
        name: "the boundaries themselves survive",
        body: "assert.equal(myAtoi('2147483647'), 2147483647);\nassert.equal(myAtoi('-2147483648'), -2147483648);",
      },
    ],
  },
  {
    id: "ex-integer-to-roman",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Integer to Roman",
    brief:
      "<p>Write <code>intToRoman(num)</code> converting a number from 1 to 3999 into its Roman numeral.</p><ul><li>The symbols are <code>I</code>=1, <code>V</code>=5, <code>X</code>=10, <code>L</code>=50, <code>C</code>=100, <code>D</code>=500, <code>M</code>=1000</li><li>Values are written largest first and added up</li><li>Six subtractive pairs replace four-in-a-row: <code>IV</code>=4, <code>IX</code>=9, <code>XL</code>=40, <code>XC</code>=90, <code>CD</code>=400, <code>CM</code>=900</li><li>So 1994 is <code>MCMXCIV</code>, not <code>MDCCCCLXXXXIIII</code></li></ul>",
    starter: "function intToRoman(num) {\n  // TODO: build the Roman numeral for num\n}\n",
    hints: [
      "Special-casing 4 and 9 at each digit position is fiddly. Can the subtractive pairs just be extra symbols in your table?",
      "List all thirteen values — 1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1 — in descending order with their symbols.",
      "Then it is a greedy loop: while num is at least the current value, append its symbol and subtract.",
    ],
    solution:
      "function intToRoman(num) {\n  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];\n  const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];\n  let out = '';\n  let n = num;\n  for (let i = 0; i < values.length; i++) {\n    while (n >= values[i]) {\n      out += symbols[i];\n      n -= values[i];\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "small numbers and repeats",
        body: "assert.equal(intToRoman(1), 'I');\nassert.equal(intToRoman(3), 'III');\nassert.equal(intToRoman(58), 'LVIII');",
      },
      {
        name: "subtractive pairs",
        body: "assert.equal(intToRoman(4), 'IV');\nassert.equal(intToRoman(9), 'IX');\nassert.equal(intToRoman(40), 'XL');\nassert.equal(intToRoman(90), 'XC');\nassert.equal(intToRoman(400), 'CD');\nassert.equal(intToRoman(900), 'CM');",
      },
      {
        name: "mixed value",
        body: "assert.equal(intToRoman(1994), 'MCMXCIV');\nassert.equal(intToRoman(3749), 'MMMDCCXLIX');",
      },
      {
        name: "upper bound",
        body: "assert.equal(intToRoman(3999), 'MMMCMXCIX');\nassert.equal(intToRoman(1000), 'M');",
      },
    ],
  },
  {
    id: "ex-roman-to-integer",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Roman to Integer",
    brief:
      "<p>Write <code>romanToInt(s)</code> converting a valid Roman numeral into a number.</p><ul><li>The symbols are <code>I</code>=1, <code>V</code>=5, <code>X</code>=10, <code>L</code>=50, <code>C</code>=100, <code>D</code>=500, <code>M</code>=1000</li><li>Symbols normally sit in descending order and are added together</li><li>When a smaller symbol sits directly before a larger one it is subtracted instead, so <code>IV</code> is 4 and <code>CM</code> is 900</li><li>You may assume the input is a well-formed numeral from 1 to 3999</li></ul>",
    starter: "function romanToInt(s) {\n  // TODO: total up the symbols in s\n}\n",
    hints: [
      "You do not need to detect the six subtractive pairs by name.",
      "Look at each symbol together with the one after it: if the next value is larger, this one is negative.",
      "Sum every symbol's value with that sign and the answer falls out in one pass.",
    ],
    solution:
      "function romanToInt(s) {\n  const value = new Map([\n    ['I', 1], ['V', 5], ['X', 10], ['L', 50],\n    ['C', 100], ['D', 500], ['M', 1000],\n  ]);\n  let total = 0;\n  for (let i = 0; i < s.length; i++) {\n    const here = value.get(s[i]);\n    const next = i + 1 < s.length ? value.get(s[i + 1]) : 0;\n    total += next > here ? -here : here;\n  }\n  return total;\n}\n",
    tests: [
      {
        name: "purely additive numerals",
        body: "assert.equal(romanToInt('III'), 3);\nassert.equal(romanToInt('LVIII'), 58);\nassert.equal(romanToInt('MMM'), 3000);",
      },
      {
        name: "subtractive pairs",
        body: "assert.equal(romanToInt('IV'), 4);\nassert.equal(romanToInt('IX'), 9);\nassert.equal(romanToInt('XL'), 40);\nassert.equal(romanToInt('CM'), 900);",
      },
      {
        name: "several subtractions in one numeral",
        body: "assert.equal(romanToInt('MCMXCIV'), 1994);\nassert.equal(romanToInt('MMMCMXCIX'), 3999);",
      },
      {
        name: "single symbol",
        body: "assert.equal(romanToInt('I'), 1);\nassert.equal(romanToInt('D'), 500);",
      },
    ],
  },
  {
    id: "ex-zigzag-conversion",
    chapter: "dsa-arrays-strings",
    level: "advanced",
    title: "Zigzag Conversion",
    brief:
      "<p>Imagine writing a string downward across <code>numRows</code> rows, and when you hit the bottom row, writing diagonally back up to the top, then down again — a zigzag. Write <code>convert(s, numRows)</code> returning the characters read off row by row, top row first.</p><ul><li>With <code>numRows = 3</code>, <code>PAYPALISHIRING</code> lays out as rows <code>PAHN</code>, <code>APLSIIG</code>, <code>YIR</code> and returns <code>PAHNAPLSIIGYIR</code></li><li>When <code>numRows</code> is 1 there is no zigzag, so the string comes back unchanged</li><li>The same holds when <code>numRows</code> is at least the length of the string</li></ul>",
    starter:
      "function convert(s, numRows) {\n  // TODO: return s read back row by row after laying it out in a zigzag\n}\n",
    hints: [
      "You never have to build a 2D grid — you only need to know which row each character lands on.",
      "Keep one string buffer per row, walk the input once, and append each character to the current row.",
      "The row index moves +1 until it reaches the last row, then -1 until it reaches row 0. Flipping the step at both ends is the whole trick — and numRows === 1 must be handled before that, or the step never flips.",
    ],
    solution:
      "function convert(s, numRows) {\n  if (numRows <= 1 || numRows >= s.length) return s;\n  const rows = [];\n  for (let r = 0; r < numRows; r++) rows.push('');\n  let row = 0;\n  let step = 1;\n  for (const c of s) {\n    rows[row] += c;\n    if (row === 0) step = 1;\n    else if (row === numRows - 1) step = -1;\n    row += step;\n  }\n  return rows.join('');\n}\n",
    tests: [
      {
        name: "three rows",
        body: "assert.equal(convert('PAYPALISHIRING', 3), 'PAHNAPLSIIGYIR');",
      },
      {
        name: "four rows",
        body: "assert.equal(convert('PAYPALISHIRING', 4), 'PINALSIGYAHRPI');",
      },
      {
        name: "one row is the identity",
        body: "assert.equal(convert('AB', 1), 'AB');\nassert.equal(convert('PAYPALISHIRING', 1), 'PAYPALISHIRING');",
      },
      {
        name: "more rows than characters",
        body: "assert.equal(convert('AB', 5), 'AB');\nassert.equal(convert('A', 2), 'A');",
      },
      {
        name: "two rows alternate",
        body: "assert.equal(convert('ABCDE', 2), 'ACEBD');\nassert.equal(convert('', 3), '');",
      },
    ],
  },
  {
    id: "ex-minimum-window-substring",
    chapter: "dsa-sliding-window",
    level: "advanced",
    title: "Minimum Window Substring",
    brief:
      "<p>Write <code>minWindow(s, t)</code> returning the shortest contiguous slice of <code>s</code> that contains every character of <code>t</code>, counting repeats.</p><ul><li>If <code>t</code> has two <code>a</code>s, the window must contain at least two <code>a</code>s</li><li>The characters may appear in any order, and extra characters in the window are fine</li><li>Return the empty string when no such window exists</li><li>The answer is unique in every case tested here</li></ul>",
    starter: "function minWindow(s, t) {\n  // TODO: return the shortest slice of s covering all of t\n}\n",
    hints: [
      "Grow a window to the right until it covers t, then shrink from the left as far as it still covers t. Record the best, then keep growing.",
      "Track counts per character, plus a single counter of how many distinct characters are still short of their required count — that turns 'does the window cover t?' into one comparison.",
      "Only adjust that counter when a character's count crosses its requirement exactly, otherwise repeats will throw it off.",
    ],
    solution:
      "function minWindow(s, t) {\n  if (t.length === 0 || s.length < t.length) return '';\n  const need = new Map();\n  for (const c of t) need.set(c, (need.get(c) || 0) + 1);\n  const have = new Map();\n  let missing = need.size;\n  let best = '';\n  let left = 0;\n  for (let right = 0; right < s.length; right++) {\n    const c = s[right];\n    if (need.has(c)) {\n      have.set(c, (have.get(c) || 0) + 1);\n      if (have.get(c) === need.get(c)) missing--;\n    }\n    while (missing === 0) {\n      if (best === '' || right - left + 1 < best.length) {\n        best = s.slice(left, right + 1);\n      }\n      const d = s[left];\n      if (need.has(d)) {\n        have.set(d, have.get(d) - 1);\n        if (have.get(d) < need.get(d)) missing++;\n      }\n      left++;\n    }\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic case",
        body: "assert.equal(minWindow('ADOBECODEBANC', 'ABC'), 'BANC');",
      },
      {
        name: "single character",
        body: "assert.equal(minWindow('a', 'a'), 'a');\nassert.equal(minWindow('ab', 'b'), 'b');",
      },
      {
        name: "repeats in t must be covered",
        body: "assert.equal(minWindow('a', 'aa'), '');\nassert.equal(minWindow('aa', 'aa'), 'aa');\nassert.equal(minWindow('bbaac', 'aab'), 'baa');",
      },
      {
        name: "no window exists",
        body: "assert.equal(minWindow('abc', 'd'), '');\nassert.equal(minWindow('', 'a'), '');",
      },
      {
        name: "shortest window wins, not the first one",
        body: "assert.equal(minWindow('acbbaca', 'aba'), 'baca');",
      },
    ],
  },
  {
    id: "ex-find-all-anagrams",
    chapter: "dsa-sliding-window",
    level: "intermediate",
    title: "Find All Anagrams in a String",
    brief:
      "<p>Write <code>findAnagrams(s, p)</code> returning, in ascending order, every start index in <code>s</code> where a substring of length <code>p.length</code> is an anagram of <code>p</code>.</p><ul><li>Matches may overlap</li><li>Return an empty array when there are none, or when <code>p</code> is longer than <code>s</code></li><li>Re-sorting every window is too slow — reuse the previous window's work</li></ul>",
    starter:
      "function findAnagrams(s, p) {\n  // TODO: return every start index of a window of s that is an anagram of p\n}\n",
    hints: [
      "A window is an anagram of p exactly when their character counts match, so track counts rather than the characters themselves.",
      "Slide a fixed-width window: add the character entering on the right, remove the one leaving on the left. That is O(1) per step.",
      "Comparing two whole count tables at every index is wasteful — keep a running 'how many characters are at the right count' tally and update it as counts change.",
    ],
    solution:
      "function findAnagrams(s, p) {\n  const out = [];\n  if (p.length === 0 || s.length < p.length) return out;\n  const need = new Map();\n  for (const c of p) need.set(c, (need.get(c) || 0) + 1);\n  const have = new Map();\n  let matched = 0;\n  const bump = (c, delta) => {\n    if (!need.has(c)) return;\n    const before = have.get(c) || 0;\n    const after = before + delta;\n    have.set(c, after);\n    if (before === need.get(c)) matched--;\n    if (after === need.get(c)) matched++;\n  };\n  for (let i = 0; i < s.length; i++) {\n    bump(s[i], 1);\n    if (i >= p.length) bump(s[i - p.length], -1);\n    if (i >= p.length - 1 && matched === need.size) out.push(i - p.length + 1);\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "finds separated matches",
        body: "assert.deepEqual(findAnagrams('cbaebabacd', 'abc'), [0, 6]);",
      },
      {
        name: "finds overlapping matches",
        body: "assert.deepEqual(findAnagrams('abab', 'ab'), [0, 1, 2]);",
      },
      {
        name: "no matches",
        body: "assert.deepEqual(findAnagrams('abcdef', 'gh'), []);\nassert.deepEqual(findAnagrams('aaaa', 'ab'), []);",
      },
      {
        name: "pattern longer than the string",
        body: "assert.deepEqual(findAnagrams('a', 'ab'), []);\nassert.deepEqual(findAnagrams('', 'a'), []);",
      },
      {
        name: "repeats inside the pattern",
        body: "assert.deepEqual(findAnagrams('baa', 'aab'), [0]);\nassert.deepEqual(findAnagrams('aaaa', 'aa'), [0, 1, 2]);",
      },
    ],
  },
  {
    id: "ex-isomorphic-strings",
    chapter: "dsa-hashing",
    level: "intermediate",
    title: "Isomorphic Strings",
    brief:
      "<p>Two strings are isomorphic when you can rename the characters of the first to get the second: each character always maps to the same character, and no two characters map to the same one. Write <code>isIsomorphic(s, t)</code>.</p><ul><li><code>egg</code> and <code>add</code> are isomorphic: e to a, g to d</li><li><code>foo</code> and <code>bar</code> are not: o would have to be both a and r</li><li><code>badc</code> and <code>baba</code> are not: two different letters would both map to a</li><li>Different lengths are never isomorphic; a character may map to itself</li></ul>",
    starter:
      "function isIsomorphic(s, t) {\n  // TODO: decide whether s can be renamed character-by-character into t\n}\n",
    hints: [
      "One map from s-character to t-character catches 'foo' vs 'bar' — but not 'badc' vs 'baba'.",
      "The mapping has to be one-to-one in both directions, so track the reverse as well.",
      "Walk both strings together; at each index, either both mappings are absent (record them) or both already agree.",
    ],
    solution:
      "function isIsomorphic(s, t) {\n  if (s.length !== t.length) return false;\n  const forward = new Map();\n  const backward = new Map();\n  for (let i = 0; i < s.length; i++) {\n    const a = s[i];\n    const b = t[i];\n    if (forward.has(a) && forward.get(a) !== b) return false;\n    if (backward.has(b) && backward.get(b) !== a) return false;\n    forward.set(a, b);\n    backward.set(b, a);\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "a consistent renaming",
        body: "assert.equal(isIsomorphic('egg', 'add'), true);\nassert.equal(isIsomorphic('paper', 'title'), true);",
      },
      {
        name: "one character would need two images",
        body: "assert.equal(isIsomorphic('foo', 'bar'), false);",
      },
      {
        name: "the mapping must be one-to-one",
        body: "assert.equal(isIsomorphic('badc', 'baba'), false);\nassert.equal(isIsomorphic('ab', 'aa'), false);",
      },
      {
        name: "identical strings and empty strings",
        body: "assert.equal(isIsomorphic('abc', 'abc'), true);\nassert.equal(isIsomorphic('', ''), true);",
      },
      {
        name: "different lengths",
        body: "assert.equal(isIsomorphic('ab', 'abc'), false);",
      },
    ],
  },
  {
    id: "ex-word-pattern",
    chapter: "dsa-hashing",
    level: "intermediate",
    title: "Word Pattern",
    brief:
      "<p>Given a pattern of single letters and a sentence of space-separated words, decide whether the sentence follows the pattern. Write <code>wordPattern(pattern, s)</code>.</p><ul><li>Each letter must stand for one word throughout, and each word for one letter</li><li><code>abba</code> with <code>dog cat cat dog</code> holds; with <code>dog cat cat fish</code> it does not</li><li><code>abba</code> with <code>dog dog dog dog</code> also fails — a and b cannot both mean dog</li><li>If the counts of letters and words differ, the answer is false</li></ul>",
    starter:
      "function wordPattern(pattern, s) {\n  // TODO: decide whether the words of s line up with the letters of pattern\n}\n",
    hints: [
      "Split the sentence into words first, and bail out immediately if there are not exactly as many words as letters.",
      "This is the same bijection check as isomorphic strings, only the right-hand side is words instead of characters.",
      "Keep both a letter-to-word map and a word-to-letter map, and require each pairing to agree with whatever is already recorded.",
    ],
    solution:
      "function wordPattern(pattern, s) {\n  const words = s.split(' ').filter((w) => w.length > 0);\n  if (words.length !== pattern.length) return false;\n  const toWord = new Map();\n  const toLetter = new Map();\n  for (let i = 0; i < pattern.length; i++) {\n    const letter = pattern[i];\n    const word = words[i];\n    if (toWord.has(letter) && toWord.get(letter) !== word) return false;\n    if (toLetter.has(word) && toLetter.get(word) !== letter) return false;\n    toWord.set(letter, word);\n    toLetter.set(word, letter);\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "the sentence follows the pattern",
        body: "assert.equal(wordPattern('abba', 'dog cat cat dog'), true);\nassert.equal(wordPattern('aaaa', 'dog dog dog dog'), true);",
      },
      {
        name: "a letter changes its word",
        body: "assert.equal(wordPattern('abba', 'dog cat cat fish'), false);",
      },
      {
        name: "two letters share one word",
        body: "assert.equal(wordPattern('abba', 'dog dog dog dog'), false);\nassert.equal(wordPattern('ab', 'dog dog'), false);",
      },
      {
        name: "counts must match",
        body: "assert.equal(wordPattern('aaa', 'dog cat cat dog'), false);\nassert.equal(wordPattern('abc', 'dog cat'), false);",
      },
      {
        name: "single letter, single word",
        body: "assert.equal(wordPattern('a', 'dog'), true);\nassert.equal(wordPattern('a', 'dog cat'), false);",
      },
    ],
  },
  {
    id: "ex-decode-string",
    chapter: "dsa-stacks-queues",
    level: "intermediate",
    title: "Decode String",
    brief:
      "<p>An encoded string uses the form <code>k[content]</code>, meaning the content repeats <code>k</code> times. Write <code>decodeString(s)</code> returning the expanded text.</p><ul><li><code>3[a]2[bc]</code> expands to <code>aaabcbc</code></li><li>Brackets nest, so <code>3[a2[c]]</code> expands to <code>accaccacc</code></li><li><code>k</code> may have more than one digit, and plain letters can appear outside brackets</li><li>The input is always well formed, and digits only ever appear as repeat counts</li></ul>",
    starter: "function decodeString(s) {\n  // TODO: expand every k[...] group, including nested ones\n}\n",
    hints: [
      "When you meet a '[' you have to put the text built so far aside and start a fresh one — and pick it back up at the matching ']'.",
      "Two stacks do it: one for the pending prefix strings, one for the pending repeat counts.",
      "On '[' push the current string and count and reset both; on ']' pop them and set current = poppedString + poppedCount copies of current. Remember multi-digit counts are read across several characters.",
    ],
    solution:
      "function decodeString(s) {\n  const strStack = [];\n  const numStack = [];\n  let current = '';\n  let count = 0;\n  for (const c of s) {\n    if (c >= '0' && c <= '9') {\n      count = count * 10 + (c.charCodeAt(0) - 48);\n    } else if (c === '[') {\n      strStack.push(current);\n      numStack.push(count);\n      current = '';\n      count = 0;\n    } else if (c === ']') {\n      const times = numStack.pop();\n      const prefix = strStack.pop();\n      let repeated = '';\n      for (let i = 0; i < times; i++) repeated += current;\n      current = prefix + repeated;\n    } else {\n      current += c;\n    }\n  }\n  return current;\n}\n",
    tests: [
      {
        name: "sequential groups",
        body: "assert.equal(decodeString('3[a]2[bc]'), 'aaabcbc');\nassert.equal(decodeString('2[abc]3[cd]ef'), 'abcabccdcdcdef');",
      },
      {
        name: "nested groups",
        body: "assert.equal(decodeString('3[a2[c]]'), 'accaccacc');\nassert.equal(decodeString('2[2[2[x]]]'), 'xxxxxxxx');",
      },
      {
        name: "multi-digit counts",
        body: "assert.equal(decodeString('10[a]'), 'aaaaaaaaaa');\nassert.equal(decodeString('12[ab]').length, 24);",
      },
      {
        name: "text outside brackets and a zero count",
        body: "assert.equal(decodeString('abc'), 'abc');\nassert.equal(decodeString(''), '');\nassert.equal(decodeString('x0[y]z'), 'xz');",
      },
      {
        name: "prefix before a nested group is preserved",
        body: "assert.equal(decodeString('2[ab3[c]d]'), 'abcccdabcccd');",
      },
    ],
  },
  {
    id: "ex-encode-decode-strings",
    chapter: "dsa-design-problems",
    level: "advanced",
    title: "Encode and Decode Strings",
    brief:
      "<p>Design a pair of functions that send a list of strings over a channel that can only carry one string. Write <code>encode(strs)</code> returning a single string, and <code>decode(str)</code> returning the original list, so that <code>decode(encode(list))</code> always equals <code>list</code>.</p><ul><li>The strings may contain any characters at all — digits, <code>#</code>, brackets, spaces</li><li>Empty strings are valid list members, and the empty list must round-trip too</li><li>Any single separator character can appear inside the data, so a plain join will not do</li><li>Prefix each string with its length and a delimiter: <code>5#hello</code></li></ul>",
    starter:
      "function encode(strs) {\n  // TODO: pack the list into one string\n}\n\nfunction decode(str) {\n  // TODO: unpack the string back into the original list\n}\n",
    hints: [
      "Joining on a delimiter fails as soon as the data contains that delimiter. Escaping works but is fiddly — is there a way to know a string's extent before reading it?",
      "Write each entry as its length, then a '#', then the raw characters. The '#' is only ever read at a known position, so a '#' inside the data is harmless.",
      "To decode, find the next '#' from the current index, parse the digits before it as a length, slice exactly that many characters, then continue after them.",
    ],
    solution:
      "function encode(strs) {\n  let out = '';\n  for (const s of strs) out += s.length + '#' + s;\n  return out;\n}\n\nfunction decode(str) {\n  const out = [];\n  let i = 0;\n  while (i < str.length) {\n    let hash = i;\n    while (str[hash] !== '#') hash++;\n    let len = 0;\n    for (let k = i; k < hash; k++) len = len * 10 + (str.charCodeAt(k) - 48);\n    out.push(str.slice(hash + 1, hash + 1 + len));\n    i = hash + 1 + len;\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "round-trips a plain list",
        body: "const list = ['hello', 'world', 'agent'];\nconst packed = encode(list);\nassert.type(packed, 'string');\nassert.deepEqual(decode(packed), list);",
      },
      {
        name: "round-trips data containing digits and hashes",
        body: "const list = ['12#34', '#', '###', '5#hello', '0#'];\nassert.deepEqual(decode(encode(list)), list);",
      },
      {
        name: "round-trips empty strings",
        body: "const list = ['', 'a', '', '', 'bc'];\nassert.deepEqual(decode(encode(list)), list);\nassert.deepEqual(decode(encode([''])), ['']);",
      },
      {
        name: "round-trips the empty list",
        body: "const packed = encode([]);\nassert.type(packed, 'string');\nassert.deepEqual(decode(packed), []);",
      },
      {
        name: "round-trips separators and whitespace",
        body: "const list = [' ', ',', 'a,b', 'x y z', '[]{}'];\nassert.deepEqual(decode(encode(list)), list);",
      },
    ],
  },
  {
    id: "ex-tree-max-depth",
    chapter: "dsa-trees",
    level: "beginner",
    title: "Maximum Depth of Binary Tree",
    brief:
      "<p>Given the <code>root</code> of a binary tree, return its depth: the number of nodes on the longest path from the root down to any leaf.</p><ul><li>An empty tree (<code>null</code> root) has depth <code>0</code></li><li>A tree with only a root has depth <code>1</code></li><li><code>build(arr)</code> turns a level-order array (with <code>null</code> for a missing child) into a tree</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction maxDepth(root) {\n  // TODO: return the number of nodes on the longest root-to-leaf path\n}\n",
    hints: [
      "The depth of a tree is defined in terms of the depth of its two subtrees. That is a recursive definition — write the recursive function.",
      "What is the depth of an empty tree? That is your base case, and it makes the leaf case fall out for free.",
      "A node contributes 1 plus whichever of its two subtrees is deeper.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction maxDepth(root) {\n  if (!root) return 0;\n  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}\n",
    tests: [
      {
        name: "depth of a small branching tree",
        body: "assert.equal(maxDepth(build([3,9,20,null,null,15,7])), 3);",
      },
      {
        name: "a single node has depth 1",
        body: "assert.equal(maxDepth(build([1])), 1);",
      },
      {
        name: "an empty tree has depth 0",
        body: "assert.equal(maxDepth(null), 0);",
      },
      {
        name: "left-skewed chain",
        body: "assert.equal(maxDepth(build([1,2,null,3,null,4])), 4);",
      },
      {
        name: "measures the deeper side",
        body: "assert.equal(maxDepth(build([1,null,2,null,3])), 3);",
      },
    ],
  },
  {
    id: "ex-tree-same-tree",
    chapter: "dsa-trees",
    level: "beginner",
    title: "Same Tree",
    brief:
      "<p>Given two binary tree roots <code>p</code> and <code>q</code>, decide whether they are identical: the same shape <em>and</em> the same value at every corresponding position.</p><ul><li>Two empty trees are identical</li><li>Same values in a different shape are <b>not</b> identical</li><li>Return a boolean</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isSameTree(p, q) {\n  // TODO: compare the two trees position by position\n}\n",
    hints: [
      "Two trees match when their roots match and, recursively, their left subtrees match and their right subtrees match.",
      "Handle the null cases first: both null, then exactly one null. Only after that is it safe to read .val.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isSameTree(p, q) {\n  if (!p && !q) return true;\n  if (!p || !q) return false;\n  if (p.val !== q.val) return false;\n  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);\n}\n",
    tests: [
      {
        name: "identical trees",
        body: "assert.equal(isSameTree(build([1,2,3]), build([1,2,3])), true);",
      },
      {
        name: "same values, different shape",
        body: "assert.equal(isSameTree(build([1,2]), build([1,null,2])), false);",
      },
      {
        name: "same shape, different values",
        body: "assert.equal(isSameTree(build([1,2,1]), build([1,1,2])), false);",
      },
      {
        name: "two empty trees match",
        body: "assert.equal(isSameTree(null, null), true);",
      },
      {
        name: "an empty tree never matches a node",
        body: "assert.equal(isSameTree(build([1]), null), false);",
      },
    ],
  },
  {
    id: "ex-tree-symmetric",
    chapter: "dsa-trees",
    level: "beginner",
    title: "Symmetric Tree",
    brief:
      "<p>Decide whether a binary tree is a mirror image of itself — that is, whether the left subtree is the reflection of the right subtree.</p><ul><li>An empty tree is symmetric</li><li>Mirroring means the left child of one side lines up with the <b>right</b> child of the other</li><li>Missing children have to line up too, not just values</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isSymmetric(root) {\n  // TODO: decide whether the two halves of the tree reflect each other\n}\n",
    hints: [
      "Comparing a tree with itself will not do it. You need a helper that compares two nodes as mirrors of one another.",
      "In that helper, pair a.left with b.right and a.right with b.left.",
      "The base cases are the same as an equality check: both null is fine, one null is not.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction mirrors(a, b) {\n  if (!a && !b) return true;\n  if (!a || !b) return false;\n  if (a.val !== b.val) return false;\n  return mirrors(a.left, b.right) && mirrors(a.right, b.left);\n}\n\nfunction isSymmetric(root) {\n  if (!root) return true;\n  return mirrors(root.left, root.right);\n}\n",
    tests: [
      {
        name: "a mirrored tree",
        body: "assert.equal(isSymmetric(build([1,2,2,3,4,4,3])), true);",
      },
      {
        name: "children on the same side are not a mirror",
        body: "assert.equal(isSymmetric(build([1,2,2,null,3,null,3])), false);",
      },
      {
        name: "gaps mirror correctly",
        body: "assert.equal(isSymmetric(build([1,2,2,null,3,3,null])), true);",
      },
      {
        name: "a deep value breaks the symmetry",
        body: "assert.equal(isSymmetric(build([1,2,2,3,4,4,5])), false);",
      },
      {
        name: "single node and empty tree",
        body: "assert.equal(isSymmetric(build([1])), true);\nassert.equal(isSymmetric(null), true);",
      },
    ],
  },
  {
    id: "ex-tree-invert",
    chapter: "dsa-trees",
    level: "beginner",
    title: "Invert Binary Tree",
    brief:
      "<p>Flip a binary tree horizontally: every node's left and right children swap places, all the way down. Return the root.</p><ul><li>Rearrange the <b>existing nodes</b> in place — the returned root must be the node you were given</li><li>An empty tree inverts to <code>null</code></li><li><code>toArray(root)</code> serialises a tree back to level-order form so you can eyeball the result</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction invertTree(root) {\n  // TODO: swap the two children of every node, top to bottom\n}\n",
    hints: [
      "Inverting a tree is: invert the left subtree, invert the right subtree, then swap them at this node.",
      "You cannot assign both children at once — stash one in a temporary before you overwrite it.",
      "Return the same root object you received; the caller relies on the tree being mutated in place.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction invertTree(root) {\n  if (!root) return null;\n  const left = invertTree(root.left);\n  root.left = invertTree(root.right);\n  root.right = left;\n  return root;\n}\n",
    tests: [
      {
        name: "inverts a full tree",
        body: "assert.deepEqual(toArray(invertTree(build([4,2,7,1,3,6,9]))), [4,7,2,9,6,3,1]);",
      },
      {
        name: "mutates the original nodes",
        body: "const root = build([2,1,3]);\nconst out = invertTree(root);\nassert.ok(out === root, 'should return the same root node');\nassert.deepEqual(toArray(root), [2,3,1]);",
      },
      {
        name: "a skewed tree flips sides",
        body: "assert.deepEqual(toArray(invertTree(build([1,2,null,3]))), [1,null,2,null,3]);",
      },
      {
        name: "a single node is unchanged",
        body: "assert.deepEqual(toArray(invertTree(build([1]))), [1]);",
      },
      {
        name: "an empty tree returns null",
        body: "assert.equal(invertTree(null), null);",
      },
    ],
  },
  {
    id: "ex-tree-level-order",
    chapter: "dsa-trees",
    level: "beginner",
    title: "Binary Tree Level Order Traversal",
    brief:
      "<p>Return the values of a binary tree grouped by depth: one inner array per level, each read left to right, starting at the root.</p><ul><li>For <code>[3,9,20,null,null,15,7]</code> the answer is <code>[[3],[9,20],[15,7]]</code></li><li>An empty tree gives <code>[]</code></li><li>Levels with missing children simply contain fewer values</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction levelOrder(root) {\n  // TODO: collect the node values one level at a time\n}\n",
    hints: [
      "A breadth-first walk visits nodes in exactly this order — the only extra work is knowing where one level stops.",
      "Instead of one long queue, keep an array holding the current level and build the next level from it.",
      "For each node on the current level, push its non-null children into the next level's array.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction levelOrder(root) {\n  const out = [];\n  if (!root) return out;\n  let level = [root];\n  while (level.length) {\n    const vals = [];\n    const next = [];\n    for (let i = 0; i < level.length; i++) {\n      const node = level[i];\n      vals.push(node.val);\n      if (node.left) next.push(node.left);\n      if (node.right) next.push(node.right);\n    }\n    out.push(vals);\n    level = next;\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "groups a small tree by level",
        body: "assert.deepEqual(levelOrder(build([3,9,20,null,null,15,7])), [[3],[9,20],[15,7]]);",
      },
      {
        name: "uneven levels",
        body: "assert.deepEqual(levelOrder(build([1,2,3,4,null,null,5])), [[1],[2,3],[4,5]]);",
      },
      {
        name: "a skewed tree gives one value per level",
        body: "assert.deepEqual(levelOrder(build([1,2,null,3])), [[1],[2],[3]]);",
      },
      {
        name: "a single node",
        body: "assert.deepEqual(levelOrder(build([1])), [[1]]);",
      },
      {
        name: "an empty tree gives no levels",
        body: "assert.deepEqual(levelOrder(null), []);",
      },
    ],
  },
  {
    id: "ex-tree-zigzag-level-order",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Binary Tree Zigzag Level Order Traversal",
    brief:
      "<p>Return the tree's values grouped by level, but alternate the reading direction: the root level runs left to right, the next runs right to left, and so on.</p><ul><li><code>[3,9,20,null,null,15,7]</code> becomes <code>[[3],[20,9],[15,7]]</code></li><li>An empty tree gives <code>[]</code></li><li>Only the output order alternates — the tree itself is untouched</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction zigzagLevelOrder(root) {\n  // TODO: collect each level, alternating the direction you emit it in\n}\n",
    hints: [
      "Start from an ordinary level-by-level traversal; the zigzag is only about how each finished level is written out.",
      "Keep a boolean that flips once per level, and reverse the collected values when it says right-to-left.",
      "Do not reverse the queue of children as well, or the following level comes out scrambled.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction zigzagLevelOrder(root) {\n  const out = [];\n  if (!root) return out;\n  let level = [root];\n  let leftToRight = true;\n  while (level.length) {\n    const vals = [];\n    const next = [];\n    for (let i = 0; i < level.length; i++) {\n      const node = level[i];\n      vals.push(node.val);\n      if (node.left) next.push(node.left);\n      if (node.right) next.push(node.right);\n    }\n    out.push(leftToRight ? vals : vals.reverse());\n    leftToRight = !leftToRight;\n    level = next;\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "alternates on a three level tree",
        body: "assert.deepEqual(zigzagLevelOrder(build([3,9,20,null,null,15,7])), [[3],[20,9],[15,7]]);",
      },
      {
        name: "four levels keep alternating",
        body: "assert.deepEqual(zigzagLevelOrder(build([1,2,3,4,5,6,7,8])), [[1],[3,2],[4,5,6,7],[8]]);",
      },
      {
        name: "a full three level tree",
        body: "assert.deepEqual(zigzagLevelOrder(build([1,2,3,4,5,6,7])), [[1],[3,2],[4,5,6,7]]);",
      },
      {
        name: "a single node",
        body: "assert.deepEqual(zigzagLevelOrder(build([1])), [[1]]);",
      },
      {
        name: "an empty tree",
        body: "assert.deepEqual(zigzagLevelOrder(null), []);",
      },
    ],
  },
  {
    id: "ex-tree-right-side-view",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Binary Tree Right Side View",
    brief:
      "<p>Imagine standing to the right of a binary tree and looking at it. Return the values you can see, ordered from the top down.</p><ul><li>You see exactly one node per level: the rightmost one</li><li>That node is not always a right child — a deep left branch can be visible</li><li>An empty tree gives <code>[]</code></li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction rightSideView(root) {\n  // TODO: return the rightmost value on each level, top to bottom\n}\n",
    hints: [
      "Do not follow right children all the way down — if the right side stops early, the deeper left nodes become visible.",
      "Walk the tree level by level and keep the last value of each level.",
      "A depth-first alternative works too: visit right before left and record the first node you meet at each new depth.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction rightSideView(root) {\n  const out = [];\n  if (!root) return out;\n  let level = [root];\n  while (level.length) {\n    const next = [];\n    for (let i = 0; i < level.length; i++) {\n      const node = level[i];\n      if (node.left) next.push(node.left);\n      if (node.right) next.push(node.right);\n    }\n    out.push(level[level.length - 1].val);\n    level = next;\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "sees the rightmost node of each level",
        body: "assert.deepEqual(rightSideView(build([1,2,3,null,5,null,4])), [1,3,4]);",
      },
      {
        name: "a deep left branch is visible",
        body: "assert.deepEqual(rightSideView(build([1,2,3,4])), [1,3,4]);",
      },
      {
        name: "a left-only chain is entirely visible",
        body: "assert.deepEqual(rightSideView(build([1,2,null,3])), [1,2,3]);",
      },
      {
        name: "a single node",
        body: "assert.deepEqual(rightSideView(build([1])), [1]);",
      },
      {
        name: "an empty tree",
        body: "assert.deepEqual(rightSideView(null), []);",
      },
    ],
  },
  {
    id: "ex-tree-diameter",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Diameter of Binary Tree",
    brief:
      "<p>Return the length of the longest path between any two nodes of a binary tree, measured in <b>edges</b>.</p><ul><li>The path does not have to pass through the root</li><li>A single node has diameter <code>0</code>; an empty tree also gives <code>0</code></li><li>Aim for a single traversal rather than recomputing depths for every node</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction diameterOfBinaryTree(root) {\n  // TODO: return the longest path between two nodes, counted in edges\n}\n",
    hints: [
      "Any path has a single highest node. For that node the path is (depth of left subtree) + (depth of right subtree) edges.",
      "So compute depths recursively, and while you are up there, record the best left + right sum you have seen.",
      "The function returns a depth to its caller but updates the running best as a side effect — two different quantities.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction diameterOfBinaryTree(root) {\n  let best = 0;\n  function depth(node) {\n    if (!node) return 0;\n    const l = depth(node.left);\n    const r = depth(node.right);\n    if (l + r > best) best = l + r;\n    return 1 + Math.max(l, r);\n  }\n  depth(root);\n  return best;\n}\n",
    tests: [
      {
        name: "path through the root",
        body: "assert.equal(diameterOfBinaryTree(build([1,2,3,4,5])), 3);",
      },
      {
        name: "longest path avoids the root",
        body: "const root = build([1,2,3,4,5,null,null,6,null,null,7,8,null,null,9]);\nassert.equal(diameterOfBinaryTree(root), 6);",
      },
      {
        name: "two nodes are one edge apart",
        body: "assert.equal(diameterOfBinaryTree(build([1,2])), 1);",
      },
      {
        name: "a single node has diameter 0",
        body: "assert.equal(diameterOfBinaryTree(build([1])), 0);",
      },
      {
        name: "an empty tree has diameter 0",
        body: "assert.equal(diameterOfBinaryTree(null), 0);",
      },
    ],
  },
  {
    id: "ex-tree-balanced",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Balanced Binary Tree",
    brief:
      "<p>A binary tree is height-balanced when, for <b>every</b> node, the depths of its two subtrees differ by at most one. Return whether the given tree qualifies.</p><ul><li>Checking only the root is not enough — the imbalance can sit deep inside</li><li>An empty tree and a single node are balanced</li><li>The naive version recomputes depths repeatedly; one traversal is enough</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isBalanced(root) {\n  // TODO: report whether every node's subtrees differ in depth by at most one\n}\n",
    hints: [
      "Computing the depth of a node already visits its whole subtree — so the balance check can ride along with it.",
      "Let the recursive helper return the depth normally, but a sentinel such as -1 the moment it discovers an imbalance.",
      "Once either side returns the sentinel, stop and propagate it upward instead of doing more work.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isBalanced(root) {\n  function check(node) {\n    if (!node) return 0;\n    const l = check(node.left);\n    if (l === -1) return -1;\n    const r = check(node.right);\n    if (r === -1) return -1;\n    if (Math.abs(l - r) > 1) return -1;\n    return 1 + Math.max(l, r);\n  }\n  return check(root) !== -1;\n}\n",
    tests: [
      {
        name: "a balanced tree",
        body: "assert.equal(isBalanced(build([3,9,20,null,null,15,7])), true);",
      },
      {
        name: "a lopsided subtree",
        body: "assert.equal(isBalanced(build([1,2,2,3,3,null,null,4,4])), false);",
      },
      {
        name: "root looks fine but a deeper node does not",
        body: "const root = build([1,2,3,4,null,6,7,8,null,12,null,null,null]);\nassert.equal(isBalanced(root), false, 'node 2 has subtree depths 2 and 0');",
      },
      {
        name: "a chain is unbalanced",
        body: "assert.equal(isBalanced(build([1,2,null,3])), false);",
      },
      {
        name: "single node and empty tree are balanced",
        body: "assert.equal(isBalanced(build([1])), true);\nassert.equal(isBalanced(null), true);",
      },
    ],
  },
  {
    id: "ex-tree-lowest-common-ancestor",
    chapter: "dsa-tree-problems",
    level: "advanced",
    title: "Lowest Common Ancestor of a Binary Tree",
    brief:
      "<p>Given the root of a binary tree and two nodes <code>p</code> and <code>q</code> from it, return their lowest common ancestor: the deepest node that has both of them somewhere below it.</p><ul><li>A node counts as an ancestor of itself, so the answer may be <code>p</code> or <code>q</code></li><li><code>p</code> and <code>q</code> are node objects, not values, and both are present in the tree</li><li>This is an ordinary binary tree — no ordering to exploit</li><li><code>find(root, val)</code> is provided so you can fetch a node by value</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction find(root, val) {\n  if (!root) return null;\n  if (root.val === val) return root;\n  return find(root.left, val) || find(root.right, val);\n}\n\nfunction lowestCommonAncestor(root, p, q) {\n  // TODO: return the deepest node that has both p and q below it\n}\n",
    hints: [
      "Ask each subtree a simpler question: 'do you contain p or q anywhere inside you?'",
      "If the left subtree reports a hit and the right subtree also reports a hit, the current node is the answer.",
      "If only one side reports a hit, pass that side's answer up unchanged. Hitting p or q itself is a hit — do not keep descending past it.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction find(root, val) {\n  if (!root) return null;\n  if (root.val === val) return root;\n  return find(root.left, val) || find(root.right, val);\n}\n\nfunction lowestCommonAncestor(root, p, q) {\n  if (!root || root === p || root === q) return root;\n  const left = lowestCommonAncestor(root.left, p, q);\n  const right = lowestCommonAncestor(root.right, p, q);\n  if (left && right) return root;\n  return left || right;\n}\n",
    tests: [
      {
        name: "ancestor on opposite sides of the root",
        body: "const root = build([3,5,1,6,2,0,8,null,null,7,4]);\nconst got = lowestCommonAncestor(root, find(root, 5), find(root, 1));\nassert.equal(got.val, 3);",
      },
      {
        name: "a node is its own ancestor",
        body: "const root = build([3,5,1,6,2,0,8,null,null,7,4]);\nconst got = lowestCommonAncestor(root, find(root, 5), find(root, 4));\nassert.equal(got.val, 5);",
      },
      {
        name: "two leaves deep in one subtree",
        body: "const root = build([3,5,1,6,2,0,8,null,null,7,4]);\nconst got = lowestCommonAncestor(root, find(root, 7), find(root, 4));\nassert.equal(got.val, 2);",
      },
      {
        name: "returns the actual node object",
        body: "const root = build([3,5,1,6,2,0,8,null,null,7,4]);\nconst five = find(root, 5);\nconst got = lowestCommonAncestor(root, find(root, 6), find(root, 4));\nassert.ok(got === five, 'must return the node itself, not a copy');",
      },
      {
        name: "a single node tree",
        body: "const root = build([1]);\nassert.equal(lowestCommonAncestor(root, root, root).val, 1);",
      },
    ],
  },
  {
    id: "ex-tree-validate-bst",
    chapter: "dsa-tree-problems",
    level: "advanced",
    title: "Validate Binary Search Tree",
    brief:
      "<p>Decide whether a binary tree is a valid binary search tree. In a valid BST, for every node, <em>every</em> value in its left subtree is strictly smaller than it and every value in its right subtree is strictly larger.</p><ul><li>The rule covers whole subtrees, not just the immediate children</li><li>Duplicate values make a tree invalid</li><li>An empty tree and a single node are valid</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isValidBST(root) {\n  // TODO: report whether the tree obeys the BST ordering everywhere\n}\n",
    hints: [
      "Comparing each node only with its own two children is not enough: a grandchild can break the ordering with respect to an ancestor.",
      "Carry a permitted range down the recursion. Going left tightens the upper bound to the current value; going right tightens the lower bound.",
      "An in-order traversal of a valid BST is strictly increasing — checking that also works.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isValidBST(root) {\n  function ok(node, low, high) {\n    if (!node) return true;\n    if (low !== null && node.val <= low) return false;\n    if (high !== null && node.val >= high) return false;\n    return ok(node.left, low, node.val) && ok(node.right, node.val, high);\n  }\n  return ok(root, null, null);\n}\n",
    tests: [
      {
        name: "accepts a valid BST",
        body: "assert.equal(isValidBST(build([2,1,3])), true);\nassert.equal(isValidBST(build([8,4,12,2,6,10,14])), true);",
      },
      {
        name: "rejects a left-subtree node bigger than the root",
        body: "const root = build([10,5,15,3,12]);\nassert.equal(isValidBST(root), false, '12 sits in the left subtree but exceeds the root');",
      },
      {
        name: "rejects a right-subtree node smaller than the root",
        body: "assert.equal(isValidBST(build([5,1,4,null,null,3,6])), false);",
      },
      {
        name: "duplicates are not allowed",
        body: "assert.equal(isValidBST(build([2,2,2])), false);",
      },
      {
        name: "single node and empty tree are valid",
        body: "assert.equal(isValidBST(build([1])), true);\nassert.equal(isValidBST(null), true);",
      },
    ],
  },
  {
    id: "ex-tree-kth-smallest-bst",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Kth Smallest Element in a BST",
    brief:
      "<p>Given the root of a binary search tree and a number <code>k</code>, return the <code>k</code>th smallest value in it (<code>k = 1</code> means the smallest).</p><ul><li><code>k</code> is always between 1 and the number of nodes</li><li>Do not collect and sort every value — the tree already knows the order</li><li>You can stop the moment you have counted <code>k</code> values</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction kthSmallest(root, k) {\n  // TODO: return the kth smallest value in the BST\n}\n",
    hints: [
      "Which traversal order visits a BST's values from smallest to largest?",
      "In-order traversal: left subtree, then the node, then the right subtree. Count the nodes as you emit them.",
      "An explicit stack lets you stop as soon as the counter reaches k, instead of walking the whole tree.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction kthSmallest(root, k) {\n  const stack = [];\n  let node = root;\n  let count = 0;\n  while (node || stack.length) {\n    while (node) {\n      stack.push(node);\n      node = node.left;\n    }\n    node = stack.pop();\n    count++;\n    if (count === k) return node.val;\n    node = node.right;\n  }\n  return -1;\n}\n",
    tests: [
      {
        name: "the smallest value",
        body: "assert.equal(kthSmallest(build([5,3,6,2,4,null,null,1]), 1), 1);",
      },
      {
        name: "a value in the middle",
        body: "assert.equal(kthSmallest(build([5,3,6,2,4,null,null,1]), 3), 3);",
      },
      {
        name: "the largest value",
        body: "assert.equal(kthSmallest(build([5,3,6,2,4,null,null,1]), 6), 6);",
      },
      {
        name: "smallest sits two levels down",
        body: "assert.equal(kthSmallest(build([3,1,4,null,2]), 2), 2);",
      },
      {
        name: "a single node",
        body: "assert.equal(kthSmallest(build([42]), 1), 42);",
      },
    ],
  },
  {
    id: "ex-tree-lca-bst",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Lowest Common Ancestor of a BST",
    brief:
      "<p>Same question as before, but now the tree is a <b>binary search tree</b>: return the lowest common ancestor of nodes <code>p</code> and <code>q</code>.</p><ul><li>Use the ordering — you should never have to search both subtrees</li><li>A node counts as an ancestor of itself</li><li>All values are distinct and both nodes are in the tree</li><li><code>find(root, val)</code> is provided so you can fetch a node by value</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction find(root, val) {\n  if (!root) return null;\n  if (root.val === val) return root;\n  return find(root.left, val) || find(root.right, val);\n}\n\nfunction lowestCommonAncestor(root, p, q) {\n  // TODO: use the BST ordering to walk straight to the split point\n}\n",
    hints: [
      "If both values are smaller than the current node, the answer cannot be here or to the right.",
      "The answer is the first node where p and q stop agreeing about which way to go — including the case where the node is p or q itself.",
      "That means a single loop from the root downwards, no recursion into two subtrees.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction find(root, val) {\n  if (!root) return null;\n  if (root.val === val) return root;\n  return find(root.left, val) || find(root.right, val);\n}\n\nfunction lowestCommonAncestor(root, p, q) {\n  let node = root;\n  while (node) {\n    if (p.val < node.val && q.val < node.val) node = node.left;\n    else if (p.val > node.val && q.val > node.val) node = node.right;\n    else return node;\n  }\n  return null;\n}\n",
    tests: [
      {
        name: "values on opposite sides split at the root",
        body: "const root = build([6,2,8,0,4,7,9,null,null,3,5]);\nassert.equal(lowestCommonAncestor(root, find(root, 2), find(root, 8)).val, 6);",
      },
      {
        name: "an ancestor of itself",
        body: "const root = build([6,2,8,0,4,7,9,null,null,3,5]);\nassert.equal(lowestCommonAncestor(root, find(root, 2), find(root, 4)).val, 2);",
      },
      {
        name: "deep inside the left subtree",
        body: "const root = build([6,2,8,0,4,7,9,null,null,3,5]);\nconst got = lowestCommonAncestor(root, find(root, 3), find(root, 5));\nassert.ok(got === find(root, 4), 'must return the node object');\nassert.equal(got.val, 4);",
      },
      {
        name: "both nodes in the right subtree",
        body: "const root = build([6,2,8,0,4,7,9,null,null,3,5]);\nassert.equal(lowestCommonAncestor(root, find(root, 7), find(root, 9)).val, 8);",
      },
      {
        name: "a single node tree",
        body: "const root = build([1]);\nassert.equal(lowestCommonAncestor(root, root, root).val, 1);",
      },
    ],
  },
  {
    id: "ex-tree-sorted-array-to-bst",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Convert Sorted Array to BST",
    brief:
      "<p>Given an array sorted in increasing order, build a <b>height-balanced</b> binary search tree from it and return the root.</p><ul><li>Height-balanced means every node's two subtrees differ in depth by at most one</li><li>Several shapes are acceptable; any balanced BST holding those values counts</li><li>An empty array produces <code>null</code></li><li><code>inorder(root)</code> and <code>isHeightBalanced(root)</code> are provided for checking your work</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction isHeightBalanced(root) {\n  function h(node) {\n    if (!node) return 0;\n    const l = h(node.left);\n    if (l < 0) return -1;\n    const r = h(node.right);\n    if (r < 0) return -1;\n    if (Math.abs(l - r) > 1) return -1;\n    return 1 + Math.max(l, r);\n  }\n  return h(root) >= 0;\n}\n\nfunction sortedArrayToBST(nums) {\n  // TODO: build a height-balanced BST from the sorted values\n}\n",
    hints: [
      "Which element of a sorted array belongs at the root if you want both sides to come out the same size?",
      "Take the middle element, then build the left subtree from the slice before it and the right subtree from the slice after it.",
      "Recurse on index ranges rather than slicing arrays, and stop when the range is empty.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction isHeightBalanced(root) {\n  function h(node) {\n    if (!node) return 0;\n    const l = h(node.left);\n    if (l < 0) return -1;\n    const r = h(node.right);\n    if (r < 0) return -1;\n    if (Math.abs(l - r) > 1) return -1;\n    return 1 + Math.max(l, r);\n  }\n  return h(root) >= 0;\n}\n\nfunction sortedArrayToBST(nums) {\n  function go(lo, hi) {\n    if (lo > hi) return null;\n    const mid = Math.floor((lo + hi) / 2);\n    const node = new TreeNode(nums[mid]);\n    node.left = go(lo, mid - 1);\n    node.right = go(mid + 1, hi);\n    return node;\n  }\n  return go(0, nums.length - 1);\n}\n",
    tests: [
      {
        name: "holds the values in order and stays balanced",
        body: "const nums = [-10,-3,0,5,9];\nconst root = sortedArrayToBST(nums);\nassert.deepEqual(inorder(root), nums);\nassert.ok(isHeightBalanced(root), 'the tree must be height-balanced');",
      },
      {
        name: "an even number of values",
        body: "const nums = [1,2,3,4,5,6];\nconst root = sortedArrayToBST(nums);\nassert.deepEqual(inorder(root), nums);\nassert.ok(isHeightBalanced(root));",
      },
      {
        name: "a longer array is not a chain",
        body: "const nums = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];\nconst root = sortedArrayToBST(nums);\nassert.deepEqual(inorder(root), nums);\nassert.ok(isHeightBalanced(root));",
      },
      {
        name: "a single value",
        body: "assert.deepEqual(toArray(sortedArrayToBST([7])), [7]);",
      },
      {
        name: "an empty array gives null",
        body: "assert.equal(sortedArrayToBST([]), null);",
      },
    ],
  },
  {
    id: "ex-tree-build-from-preorder-inorder",
    chapter: "dsa-tree-problems",
    level: "advanced",
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    brief:
      "<p>You are given the preorder traversal and the inorder traversal of the same binary tree, with all values distinct. Rebuild the tree and return its root.</p><ul><li>Preorder visits node, left, right; inorder visits left, node, right</li><li>Together the two orders pin down exactly one tree</li><li>Two empty arrays produce <code>null</code></li><li>Use <code>toArray(root)</code> to inspect what you built</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction buildTree(preorder, inorder) {\n  // TODO: rebuild the tree from the two traversals\n}\n",
    hints: [
      "The first value of the preorder array is always the root of the piece you are currently building.",
      "Locate that value in the inorder array: everything to its left is the left subtree, everything to its right is the right subtree.",
      "Scanning the inorder array each time is O(n^2); precompute a Map from value to index. Consume preorder with one shared cursor so the left subtree is built before the right.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction buildTree(preorder, inorder) {\n  const pos = new Map();\n  for (let i = 0; i < inorder.length; i++) pos.set(inorder[i], i);\n  let cursor = 0;\n  function go(lo, hi) {\n    if (lo > hi) return null;\n    const val = preorder[cursor++];\n    const node = new TreeNode(val);\n    const mid = pos.get(val);\n    node.left = go(lo, mid - 1);\n    node.right = go(mid + 1, hi);\n    return node;\n  }\n  return go(0, inorder.length - 1);\n}\n",
    tests: [
      {
        name: "rebuilds a branching tree",
        body: "assert.deepEqual(toArray(buildTree([3,9,20,15,7], [9,3,15,20,7])), [3,9,20,null,null,15,7]);",
      },
      {
        name: "a left-leaning chain",
        body: "assert.deepEqual(toArray(buildTree([1,2,3], [3,2,1])), [1,2,null,3]);",
      },
      {
        name: "a right-leaning chain",
        body: "assert.deepEqual(toArray(buildTree([1,2,3], [1,2,3])), [1,null,2,null,3]);",
      },
      {
        name: "a single node",
        body: "assert.deepEqual(toArray(buildTree([1], [1])), [1]);",
      },
      {
        name: "empty traversals give null",
        body: "assert.equal(buildTree([], []), null);",
      },
    ],
  },
  {
    id: "ex-tree-serialize-deserialize",
    chapter: "dsa-tree-problems",
    level: "advanced",
    title: "Serialize and Deserialize Binary Tree",
    brief:
      "<p>Write two functions: <code>serialize(root)</code> turns a binary tree into a string, and <code>deserialize(data)</code> turns that string back into an identical tree.</p><ul><li>Only the round trip matters — the exact format is yours to choose</li><li><code>serialize</code> must return a string; <code>deserialize</code> must return a tree of <code>TreeNode</code>s</li><li>An empty tree has to survive the trip too</li><li>Values may be negative, so a format that can tell <code>-3</code> from a missing child is required</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction serialize(root) {\n  // TODO: turn the tree into a string\n}\n\nfunction deserialize(data) {\n  // TODO: rebuild the tree that serialize() encoded\n}\n",
    hints: [
      "Shape is the hard part: values alone are ambiguous. Record the missing children explicitly with a placeholder token.",
      "A preorder walk that emits a marker for every null makes rebuilding trivial — one cursor over the tokens, consuming left then right.",
      "Join with a separator and split it back out; do not encode numbers in a way that loses the minus sign.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction serialize(root) {\n  const parts = [];\n  function walk(node) {\n    if (!node) {\n      parts.push('#');\n      return;\n    }\n    parts.push(String(node.val));\n    walk(node.left);\n    walk(node.right);\n  }\n  walk(root);\n  return parts.join(',');\n}\n\nfunction deserialize(data) {\n  const parts = data.split(',');\n  let cursor = 0;\n  function walk() {\n    const token = parts[cursor++];\n    if (token === '#') return null;\n    const node = new TreeNode(Number(token));\n    node.left = walk();\n    node.right = walk();\n    return node;\n  }\n  return walk();\n}\n",
    tests: [
      {
        name: "round trips a branching tree",
        body: "const arr = [1,2,3,null,null,4,5];\nassert.deepEqual(toArray(deserialize(serialize(build(arr)))), arr);",
      },
      {
        name: "round trips an empty tree",
        body: "assert.equal(deserialize(serialize(null)), null);\nassert.deepEqual(toArray(deserialize(serialize(null))), []);",
      },
      {
        name: "round trips a skewed tree",
        body: "const arr = [1,2,null,3,null,4];\nassert.deepEqual(toArray(deserialize(serialize(build(arr)))), arr);",
      },
      {
        name: "round trips negative values and a single node",
        body: "assert.deepEqual(toArray(deserialize(serialize(build([-1,-2,-3])))), [-1,-2,-3]);\nassert.deepEqual(toArray(deserialize(serialize(build([0])))), [0]);",
      },
      {
        name: "serialize produces a string",
        body: "assert.type(serialize(build([1,2,3])), 'string');",
      },
    ],
  },
  {
    id: "ex-tree-path-sum",
    chapter: "dsa-trees",
    level: "beginner",
    title: "Path Sum",
    brief:
      "<p>Given a binary tree and a number <code>targetSum</code>, return <code>true</code> if some root-to-leaf path has values adding up to exactly <code>targetSum</code>.</p><ul><li>A leaf is a node with no children — a path must reach one, it cannot stop halfway</li><li>An empty tree has no paths, so the answer is always <code>false</code></li><li>Values may be negative</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction hasPathSum(root, targetSum) {\n  // TODO: report whether some root-to-leaf path adds up to targetSum\n}\n",
    hints: [
      "Instead of accumulating a running total, subtract the current node's value and ask the children about the smaller target.",
      "The success test belongs at a leaf: no children left and the remaining target equals this node's value.",
      "Careful with the empty tree — returning true when the remaining target hits 0 at a null child is the classic bug.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction hasPathSum(root, targetSum) {\n  if (!root) return false;\n  if (!root.left && !root.right) return targetSum === root.val;\n  return (\n    hasPathSum(root.left, targetSum - root.val) ||\n    hasPathSum(root.right, targetSum - root.val)\n  );\n}\n",
    tests: [
      {
        name: "finds a matching path",
        body: "const root = build([5,4,8,11,null,13,4,7,2,null,null,null,1]);\nassert.equal(hasPathSum(root, 22), true);",
      },
      {
        name: "finds a shorter matching path",
        body: "const root = build([5,4,8,11,null,13,4,7,2,null,null,null,1]);\nassert.equal(hasPathSum(root, 26), true);",
      },
      {
        name: "a partial path does not count",
        body: "const root = build([5,4,8,11,null,13,4,7,2,null,null,null,1]);\nassert.equal(hasPathSum(root, 5), false, 'the root alone is not a root-to-leaf path');\nassert.equal(hasPathSum(build([1,2]), 1), false);",
      },
      {
        name: "a single node",
        body: "assert.equal(hasPathSum(build([7]), 7), true);\nassert.equal(hasPathSum(build([7]), 0), false);",
      },
      {
        name: "an empty tree has no path",
        body: "assert.equal(hasPathSum(null, 0), false);",
      },
    ],
  },
  {
    id: "ex-tree-path-sum-ii",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Path Sum II",
    brief:
      "<p>Return <b>every</b> root-to-leaf path whose values add up to <code>targetSum</code>, each path given as an array of values from the root downwards.</p><ul><li>Paths must start at the root and end at a leaf</li><li>Return <code>[]</code> when nothing matches, and for an empty tree</li><li>Report the paths in left-to-right depth-first order</li><li>Values may be negative</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction pathSum(root, targetSum) {\n  // TODO: collect every root-to-leaf path that adds up to targetSum\n}\n",
    hints: [
      "Carry a single array holding the values on the path you are currently exploring, and push the node's value on the way down.",
      "Pop that value again as the call returns — otherwise the path leaks into sibling branches.",
      "When you record a hit, store a copy of the path array; storing the array itself means later mutations rewrite your answer.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction pathSum(root, targetSum) {\n  const out = [];\n  const path = [];\n  function walk(node, remaining) {\n    if (!node) return;\n    path.push(node.val);\n    if (!node.left && !node.right && remaining === node.val) {\n      out.push(path.slice());\n    } else {\n      walk(node.left, remaining - node.val);\n      walk(node.right, remaining - node.val);\n    }\n    path.pop();\n  }\n  walk(root, targetSum);\n  return out;\n}\n",
    tests: [
      {
        name: "finds both matching paths",
        body: "const root = build([5,4,8,11,null,13,4,7,2,null,null,5,1]);\nassert.deepEqual(pathSum(root, 22), [[5,4,11,2],[5,8,4,5]]);",
      },
      {
        name: "no matching path",
        body: "const root = build([5,4,8,11,null,13,4,7,2,null,null,5,1]);\nassert.deepEqual(pathSum(root, 100), []);",
      },
      {
        name: "negative values",
        body: "assert.deepEqual(pathSum(build([-2,null,-3]), -5), [[-2,-3]]);",
      },
      {
        name: "a single node",
        body: "assert.deepEqual(pathSum(build([1]), 1), [[1]]);\nassert.deepEqual(pathSum(build([1]), 2), []);",
      },
      {
        name: "an empty tree",
        body: "assert.deepEqual(pathSum(null, 0), []);",
      },
    ],
  },
  {
    id: "ex-tree-max-path-sum",
    chapter: "dsa-tree-problems",
    level: "advanced",
    title: "Binary Tree Maximum Path Sum",
    brief:
      "<p>A path here is any sequence of connected nodes — each consecutive pair joined by an edge — visiting no node twice. It does not have to touch the root. Return the largest possible sum of the values along such a path.</p><ul><li>The tree has at least one node, and a single node is a valid path</li><li>Values may be negative, so the answer can be negative</li><li>A path bends at most once: it can come up one subtree and go down the other</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction maxPathSum(root) {\n  // TODO: return the largest sum along any path in the tree\n}\n",
    hints: [
      "Every path has a single topmost node. At that node the path may use both subtrees — but what it hands back to its own parent may use only one.",
      "So the recursive helper returns 'best sum of a downward path starting here', while a separate running maximum records node.val + left + right.",
      "A subtree that contributes a negative amount should simply be skipped: clamp each child's contribution at 0. Do not clamp the running maximum itself, or an all-negative tree gives the wrong answer.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction maxPathSum(root) {\n  let best = -Infinity;\n  function gain(node) {\n    if (!node) return 0;\n    const left = Math.max(gain(node.left), 0);\n    const right = Math.max(gain(node.right), 0);\n    if (node.val + left + right > best) best = node.val + left + right;\n    return node.val + Math.max(left, right);\n  }\n  gain(root);\n  return best;\n}\n",
    tests: [
      {
        name: "a small tree bends at the root",
        body: "assert.equal(maxPathSum(build([1,2,3])), 6);",
      },
      {
        name: "skips a negative root",
        body: "assert.equal(maxPathSum(build([-10,9,20,null,null,15,7])), 42);",
      },
      {
        name: "best path sits inside a subtree",
        body: "const root = build([10,2,10,20,1,null,-25,null,null,null,null,3,4]);\nassert.equal(maxPathSum(root), 42);",
      },
      {
        name: "an all-negative tree picks the least bad node",
        body: "assert.equal(maxPathSum(build([-2,-1,-3])), -1);",
      },
      {
        name: "a single negative node",
        body: "assert.equal(maxPathSum(build([-3])), -3);",
      },
    ],
  },
  {
    id: "ex-tree-next-right-pointers",
    chapter: "dsa-tree-problems",
    level: "advanced",
    title: "Populating Next Right Pointers in Each Node",
    brief:
      "<p>Every node in this <b>perfect</b> binary tree (all leaves at the same depth, every other node has two children) carries an extra <code>next</code> pointer, initially <code>null</code>. Set each <code>next</code> to the node immediately to its right on the same level, and return the root.</p><ul><li>The last node of every level keeps <code>next = null</code></li><li>Annotate the given tree in place and return the same root</li><li>The <code>next</code> pointers you have already set can be used to walk a level — that is how you avoid a queue</li><li><code>nextChain(node)</code> follows <code>next</code> from a node and collects the values</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n    this.next = null;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction nextChain(node) {\n  const out = [];\n  for (let n = node; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction connect(root) {\n  // TODO: link every node to its right-hand neighbour on the same level\n}\n",
    hints: [
      "A level-order traversal with a queue solves it, but the tree is perfect — there is a way to do it with no extra storage.",
      "Once a level is fully linked, you can walk that level using next, wiring up the level below as you go.",
      "From a node on the linked level: node.left.next is node.right, and node.right.next is node.next.left when node.next exists.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n    this.next = null;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction nextChain(node) {\n  const out = [];\n  for (let n = node; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction connect(root) {\n  let leftmost = root;\n  while (leftmost && leftmost.left) {\n    let node = leftmost;\n    while (node) {\n      node.left.next = node.right;\n      if (node.next) node.right.next = node.next.left;\n      node = node.next;\n    }\n    leftmost = leftmost.left;\n  }\n  return root;\n}\n",
    tests: [
      {
        name: "links every level of a perfect tree",
        body: "const root = connect(build([1,2,3,4,5,6,7]));\nassert.deepEqual(nextChain(root), [1]);\nassert.deepEqual(nextChain(root.left), [2,3]);\nassert.deepEqual(nextChain(root.left.left), [4,5,6,7]);",
      },
      {
        name: "links across different parents",
        body: "const root = connect(build([1,2,3,4,5,6,7]));\nassert.ok(root.left.right.next === root.right.left, '5 must point at 6');\nassert.equal(root.right.right.next, null, 'the last node of a level ends the chain');",
      },
      {
        name: "annotates the tree in place",
        body: "const root = build([1,2,3]);\nconst out = connect(root);\nassert.ok(out === root, 'should return the same root node');\nassert.ok(root.left.next === root.right);\nassert.equal(root.right.next, null);",
      },
      {
        name: "a single node",
        body: "const root = connect(build([1]));\nassert.deepEqual(nextChain(root), [1]);\nassert.equal(root.next, null);",
      },
      {
        name: "an empty tree returns null",
        body: "assert.equal(connect(null), null);",
      },
    ],
  },
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
  {
    id: "ex-tdz-order",
    chapter: "setup-mental-model",
    level: "beginner",
    title: "Fix the temporal dead zone bug",
    brief:
      "<p><code>greetMember(name)</code> should return a welcome-back message for a known member, or a generic greeting otherwise — but right now, calling it with a name throws instead of returning anything.</p><ul><li>The bug is a <b>Temporal Dead Zone</b> error: something is read before its own <code>let</code> line has run</li><li>Don't change what the function returns — only reorder what's already there</li></ul>",
    starter:
      'function greetMember(name) {\n  if (name) {\n    return greeting + ", " + name + "!";\n  }\n  let greeting = "Welcome back";\n  return "Welcome, guest!";\n}\n',
    hints: [
      "The error happens on the line that reads \"greeting\" — but the real fix is where the let is declared, not that line.",
      "let is hoisted to the top of its scope but stays uninitialized (the TDZ) until its own declaration line actually executes. Move the declaration so it runs before anything reads it.",
    ],
    solution:
      'function greetMember(name) {\n  let greeting = "Welcome back";\n  if (name) {\n    return greeting + ", " + name + "!";\n  }\n  return "Welcome, guest!";\n}\n',
    tests: [
      {
        name: "returns the member greeting when a name is given",
        body: 'assert.equal(greetMember("Ana"), "Welcome back, Ana!");',
      },
      {
        name: "returns the generic greeting for no name",
        body: 'assert.equal(greetMember(""), "Welcome, guest!");',
      },
      {
        name: "works for a different name too",
        body: 'assert.equal(greetMember("Ravi"), "Welcome back, Ravi!");',
      },
    ],
  },
  {
    id: "ex-return-newline",
    chapter: "functions-basics",
    level: "beginner",
    title: "Find the line break that ate the return value",
    brief:
      "<p><code>makeUser(name, age)</code> is supposed to return <code>[name, age]</code>, but every call currently returns <code>undefined</code>.</p><ul><li>This is Automatic Semicolon Insertion, not a typo — the value being returned is on the wrong side of an invisible semicolon</li><li>Fix it without changing what gets returned</li></ul>",
    starter: 'function makeUser(name, age) {\n  return\n  [name, age];\n}\n',
    hints: [
      "A line break immediately after \"return\" is dangerous — ASI can quietly insert a semicolon right there.",
      'Keep the value on the same line as "return", or wrap it in parentheses that open before the line break.',
    ],
    solution: 'function makeUser(name, age) {\n  return [name, age];\n}\n',
    tests: [
      {
        name: "returns a two-element array",
        body: 'assert.deepEqual(makeUser("Ana", 29), ["Ana", 29]);',
      },
      {
        name: "works for different inputs",
        body: 'assert.deepEqual(makeUser("Ravi", 40), ["Ravi", 40]);',
      },
      {
        name: "does not return undefined",
        body: 'assert.notEqual(makeUser("X", 1), undefined);',
      },
    ],
  },
  {
    id: "ex-rest-sum",
    chapter: "functions-basics",
    level: "beginner",
    title: "Sum any number of arguments",
    brief:
      "<p>Write <code>sum(...nums)</code> that adds up however many numbers it's called with — including zero of them.</p><ul><li>Use a rest parameter, not the old <code>arguments</code> object</li><li><code>sum()</code> with nothing at all returns <code>0</code></li></ul>",
    starter: "function sum(...nums) {\n  // TODO: add every argument together, starting from 0\n}\n",
    hints: [
      "Rest params collect every remaining argument into a real array — reduce is a natural fit.",
      "array.reduce((total, n) => total + n, 0) starts the total at 0, which also makes sum() with no arguments correct for free.",
    ],
    solution: "function sum(...nums) {\n  return nums.reduce((total, n) => total + n, 0);\n}\n",
    tests: [
      { name: "adds three numbers", body: "assert.equal(sum(1, 2, 3), 6);" },
      { name: "no arguments returns 0", body: "assert.equal(sum(), 0);" },
      { name: "a single argument", body: "assert.equal(sum(5), 5);" },
      { name: "five arguments", body: "assert.equal(sum(1, 2, 3, 4, 5), 15);" },
    ],
  },
  {
    id: "ex-array-methods-chain",
    chapter: "objects-arrays-basics",
    level: "beginner",
    title: "Total up a shopping cart",
    brief:
      "<p>Given an array of <code>{ price, qty }</code> items, write <code>cartTotal(items)</code> that returns the total cost — but skip any item with <code>qty</code> of <code>0</code> or less.</p><ul><li>Chain <code>.filter()</code> and <code>.reduce()</code> — don't write a manual <code>for</code> loop</li></ul>",
    starter:
      "function cartTotal(items) {\n  // TODO: filter out non-positive qty, then reduce to a total of price * qty\n}\n",
    hints: [
      "filter() first to drop the items that shouldn't count at all.",
      "Then reduce() the survivors: (total, item) => total + item.price * item.qty, starting from 0.",
    ],
    solution:
      "function cartTotal(items) {\n  return items\n    .filter((item) => item.qty > 0)\n    .reduce((total, item) => total + item.price * item.qty, 0);\n}\n",
    tests: [
      {
        name: "sums positive-quantity items only",
        body: "assert.equal(cartTotal([{ price: 10, qty: 2 }, { price: 5, qty: 0 }, { price: 3, qty: 3 }]), 29);",
      },
      { name: "empty cart is 0", body: "assert.equal(cartTotal([]), 0);" },
      { name: "a single item", body: "assert.equal(cartTotal([{ price: 100, qty: 1 }]), 100);" },
      {
        name: "a negative qty is also skipped",
        body: "assert.equal(cartTotal([{ price: 10, qty: -1 }, { price: 10, qty: 1 }]), 10);",
      },
    ],
  },
  {
    id: "ex-nested-destructure",
    chapter: "objects-arrays-basics",
    level: "beginner",
    title: "Format an address, safely",
    brief:
      "<p>Write <code>formatAddress(address)</code> that destructures <code>{ street, city, country }</code> and returns <code>\"street, city, country\"</code>.</p><ul><li><code>country</code> defaults to <code>\"India\"</code> when missing</li><li>If <code>address</code> itself is missing, or <code>street</code>/<code>city</code> is missing, return <code>\"Unknown address\"</code> instead — don't throw</li></ul>",
    starter:
      "function formatAddress(address) {\n  // TODO: destructure street/city/country (default \"India\") right in the parameter list\n  // return \"Unknown address\" if street or city is missing, or address itself is missing\n}\n",
    hints: [
      "A default for the whole parameter (= {}) stops destructuring a missing address from throwing at all.",
      'Destructure with { street, city, country = "India" } = {}, then check street && city before building the string.',
    ],
    solution:
      'function formatAddress({ street, city, country = "India" } = {}) {\n  if (!street || !city) return "Unknown address";\n  return street + ", " + city + ", " + country;\n}\n',
    tests: [
      {
        name: "defaults the country",
        body: 'assert.equal(formatAddress({ street: "MG Road", city: "Pune" }), "MG Road, Pune, India");',
      },
      {
        name: "uses a given country",
        body: 'assert.equal(formatAddress({ street: "5th Ave", city: "NYC", country: "USA" }), "5th Ave, NYC, USA");',
      },
      { name: "no address at all", body: 'assert.equal(formatAddress(), "Unknown address");' },
      { name: "missing street", body: 'assert.equal(formatAddress({ city: "Pune" }), "Unknown address");' },
    ],
  },
  {
    id: "ex-mini-emitter",
    chapter: "dom-events",
    level: "beginner",
    title: "Build a mini event emitter",
    brief:
      "<p>The DOM's <code>addEventListener</code> pattern, without a DOM: write <code>createEmitter()</code> returning <code>{ on, off, emit }</code>.</p><ul><li><code>on(event, fn)</code> registers a listener</li><li><code>off(event, fn)</code> removes that exact listener</li><li><code>emit(event, ...args)</code> calls every listener still registered for that event, in order, with those arguments</li><li>Emitting an event with no listeners must not throw</li></ul>",
    starter:
      "function createEmitter() {\n  // TODO: track listeners per event name, and implement on/off/emit\n}\n",
    hints: [
      "A Map from event name to an array of listener functions is enough to track everything.",
      "off() should filter the stored array down to functions that aren't the one being removed — same reference check as removeEventListener.",
    ],
    solution:
      "function createEmitter() {\n  const listeners = new Map();\n  return {\n    on(event, fn) {\n      if (!listeners.has(event)) listeners.set(event, []);\n      listeners.get(event).push(fn);\n    },\n    off(event, fn) {\n      const fns = listeners.get(event);\n      if (fns) listeners.set(event, fns.filter((f) => f !== fn));\n    },\n    emit(event, ...args) {\n      (listeners.get(event) || []).forEach((fn) => fn(...args));\n    },\n  };\n}\n",
    tests: [
      {
        name: "calls a registered listener with the emitted arguments",
        body: 'const e = createEmitter();\nconst calls = [];\ne.on("greet", (name) => calls.push(name));\ne.emit("greet", "Ana");\nassert.deepEqual(calls, ["Ana"]);',
      },
      {
        name: "off() stops that exact listener",
        body: 'const e = createEmitter();\nconst calls = [];\nconst handler = (x) => calls.push(x);\ne.on("t", handler);\ne.emit("t", 1);\ne.off("t", handler);\ne.emit("t", 2);\nassert.deepEqual(calls, [1]);',
      },
      {
        name: "emitting with no listeners does not throw",
        body: 'const e = createEmitter();\ne.emit("nothing", 1);\nassert.ok(true);',
      },
      {
        name: "two different listeners on the same event both fire",
        body: 'const e = createEmitter();\nconst calls = [];\ne.on("t", () => calls.push("a"));\ne.on("t", () => calls.push("b"));\ne.emit("t");\nassert.deepEqual(calls, ["a", "b"]);',
      },
    ],
  },
  {
    id: "ex-delayed-double",
    chapter: "basic-async",
    level: "beginner",
    title: "Wrap setTimeout in a promise",
    brief:
      "<p>Write <code>delayedDouble(n)</code> that returns a promise resolving to <code>n * 2</code>, after a short delay — using <code>setTimeout</code> underneath.</p><ul><li>No <code>fetch</code>, no external calls — just a timer</li></ul>",
    starter:
      "function delayedDouble(n) {\n  // TODO: return a new Promise that resolves with n * 2 after a setTimeout\n}\n",
    hints: [
      "new Promise((resolve) => { ... }) — call resolve(...) inside the setTimeout callback.",
      "The delay length barely matters for the test — even 10-20ms is enough to prove it's genuinely async.",
    ],
    solution:
      "function delayedDouble(n) {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve(n * 2), 20);\n  });\n}\n",
    tests: [
      { name: "doubles a positive number", body: "assert.equal(await delayedDouble(5), 10);" },
      { name: "doubles zero", body: "assert.equal(await delayedDouble(0), 0);" },
      { name: "doubles a negative number", body: "assert.equal(await delayedDouble(-3), -6);" },
    ],
  },
  {
    id: "ex-json-roundtrip",
    chapter: "basic-async",
    level: "beginner",
    title: "Clean an object for storage",
    brief:
      "<p>Write <code>cleanForStorage(obj)</code> that strips anything <code>JSON</code> can't represent — functions and <code>undefined</code> values — by round-tripping through <code>JSON.stringify</code>/<code>JSON.parse</code>.</p>",
    starter: "function cleanForStorage(obj) {\n  // TODO: one line, using JSON.stringify and JSON.parse together\n}\n",
    hints: [
      "JSON.parse(JSON.stringify(obj)) is the whole exercise — the interesting part is knowing WHY it cleans the object.",
    ],
    solution: "function cleanForStorage(obj) {\n  return JSON.parse(JSON.stringify(obj));\n}\n",
    tests: [
      {
        name: "drops undefined and function properties",
        body: 'assert.deepEqual(cleanForStorage({ a: 1, b: undefined, c: function () {} }), { a: 1 });',
      },
      {
        name: "undefined inside an array becomes null",
        body: "assert.deepEqual(cleanForStorage({ nested: { x: [1, 2, undefined] } }), { nested: { x: [1, 2, null] } });",
      },
      { name: "plain data survives unchanged", body: 'assert.deepEqual(cleanForStorage({ a: 1, b: "two" }), { a: 1, b: "two" });' },
    ],
  },
  {
    id: "ex-safe-parse",
    chapter: "errors-tools",
    level: "beginner",
    title: "Parse JSON without crashing",
    brief:
      "<p>Write <code>safeParseJSON(text, fallback)</code> that parses <code>text</code> as JSON and returns the result — or <code>fallback</code> if <code>text</code> isn't valid JSON, instead of letting the error escape.</p>",
    starter:
      "function safeParseJSON(text, fallback) {\n  // TODO: try/catch around JSON.parse, return fallback in the catch\n}\n",
    hints: ["try { return JSON.parse(text); } — and return fallback from the catch block."],
    solution:
      "function safeParseJSON(text, fallback) {\n  try {\n    return JSON.parse(text);\n  } catch {\n    return fallback;\n  }\n}\n",
    tests: [
      { name: "parses valid JSON", body: 'assert.deepEqual(safeParseJSON(\'{"a":1}\', null), { a: 1 });' },
      { name: "falls back on invalid JSON", body: 'assert.equal(safeParseJSON("not json", "fallback"), "fallback");' },
      { name: "falls back on empty string", body: 'assert.deepEqual(safeParseJSON("", []), []);' },
    ],
  },
  {
    id: "ex-custom-error",
    chapter: "errors-tools",
    level: "beginner",
    title: "Throw a real, typed error",
    brief:
      "<p>Write a <code>ValidationError</code> class extending <code>Error</code>, with a <code>field</code> property, and a function <code>validateAge(age)</code> that throws one when <code>age</code> isn't a non-negative number — otherwise returns <code>age</code> unchanged.</p><ul><li><code>new ValidationError(message, field)</code> — the thrown error's <code>field</code> should be <code>\"age\"</code></li></ul>",
    starter:
      'class ValidationError extends Error {\n  constructor(message, field) {\n    // TODO: call super(message), set this.name and this.field\n  }\n}\n\nfunction validateAge(age) {\n  // TODO: throw a ValidationError("age must be a non-negative number", "age") when invalid\n  return age;\n}\n',
    hints: [
      "super(message) has to run before this.field can be set — the same rule as any class extends.",
      'typeof age !== "number" || age < 0 covers both "not a number" and "negative".',
    ],
    solution:
      'class ValidationError extends Error {\n  constructor(message, field) {\n    super(message);\n    this.name = "ValidationError";\n    this.field = field;\n  }\n}\n\nfunction validateAge(age) {\n  if (typeof age !== "number" || age < 0) {\n    throw new ValidationError("age must be a non-negative number", "age");\n  }\n  return age;\n}\n',
    tests: [
      { name: "returns a valid age unchanged", body: "assert.equal(validateAge(25), 25);" },
      {
        name: "throws a ValidationError for a negative age",
        body: 'assert.throws(() => validateAge(-5));\ntry {\n  validateAge(-5);\n} catch (e) {\n  assert.ok(e instanceof ValidationError);\n  assert.ok(e instanceof Error);\n  assert.equal(e.field, "age");\n}',
      },
      {
        name: "throws for a non-number too",
        body: 'try {\n  validateAge("old");\n  assert.ok(false, "should have thrown");\n} catch (e) {\n  assert.ok(e instanceof ValidationError);\n}',
      },
    ],
  },
  {
    id: "ex-semver-satisfies",
    chapter: "modules-tooling",
    level: "intermediate",
    title: "Does this version satisfy a caret range?",
    brief:
      '<p>Write <code>satisfiesCaret(range, version)</code> — given a caret range like <code>"^1.2.0"</code> and a version like <code>"1.3.5"</code>, return whether the version is allowed under that range.</p><ul><li>Same major version, required</li><li>Minor/patch can be anything <b>equal to or greater than</b> the range\'s own minor/patch</li></ul>',
    starter:
      'function satisfiesCaret(range, version) {\n  // TODO: parse both into [major, minor, patch], compare per the ^ rules\n}\n',
    hints: [
      'range.replace("^", "").split(".").map(Number) turns "^1.2.0" into [1, 2, 0].',
      "Major must match exactly. If minor is higher, it's always fine. If minor is equal, patch must be >= the range's patch. If minor is lower, it fails.",
    ],
    solution:
      'function satisfiesCaret(range, version) {\n  const rv = range.replace("^", "").split(".").map(Number);\n  const v = version.split(".").map(Number);\n  if (rv[0] !== v[0]) return false;\n  if (v[1] > rv[1]) return true;\n  if (v[1] < rv[1]) return false;\n  return v[2] >= rv[2];\n}\n',
    tests: [
      { name: "the exact version satisfies", body: 'assert.equal(satisfiesCaret("^1.2.0", "1.2.0"), true);' },
      { name: "a higher minor satisfies", body: 'assert.equal(satisfiesCaret("^1.2.0", "1.3.5"), true);' },
      { name: "a lower minor does not", body: 'assert.equal(satisfiesCaret("^1.2.0", "1.1.9"), false);' },
      { name: "a different major does not", body: 'assert.equal(satisfiesCaret("^1.2.0", "2.0.0"), false);' },
      { name: "a lower patch on the same minor does not", body: 'assert.equal(satisfiesCaret("^1.2.5", "1.2.4"), false);' },
    ],
  },
  {
    id: "ex-pipe",
    chapter: "modules-tooling",
    level: "intermediate",
    title: "Build a left-to-right pipe",
    brief:
      "<p>Write <code>pipe(...fns)</code> that returns a function running every given function in order, left to right — the reverse reading direction from <code>compose</code>.</p><ul><li><code>pipe(f, g)(x)</code> means <code>g(f(x))</code>, not <code>f(g(x))</code></li></ul>",
    starter: "function pipe(...fns) {\n  // TODO: return a function that reduces x through every fn, left to right\n}\n",
    hints: ["fns.reduce((acc, fn) => fn(acc), x) — start the accumulator at x, apply each function in array order."],
    solution: "function pipe(...fns) {\n  return (x) => fns.reduce((acc, fn) => fn(acc), x);\n}\n",
    tests: [
      {
        name: "runs two functions left to right",
        body: "const double = (x) => x * 2;\nconst inc = (x) => x + 1;\nassert.equal(pipe(double, inc)(5), 11);",
      },
      {
        name: "runs three functions in order",
        body: "const double = (x) => x * 2;\nconst inc = (x) => x + 1;\nassert.equal(pipe(inc, double, inc)(1), 5);",
      },
      { name: "a single function just runs once", body: "assert.equal(pipe((x) => x + 10)(5), 15);" },
    ],
  },
  {
    id: "ex-extract-hashtags",
    chapter: "regex-dates-apis",
    level: "intermediate",
    title: "Pull every hashtag out of a post",
    brief:
      '<p>Write <code>extractHashtags(text)</code> returning an array of hashtag words (without the <code>#</code>) found in <code>text</code>, in order.</p><ul><li><code>"loving #javascript today"</code> → <code>["javascript"]</code></li></ul>',
    starter: "function extractHashtags(text) {\n  // TODO: matchAll with a /#(\\w+)/g pattern, pull group 1 out of each match\n}\n",
    hints: [
      "[...text.matchAll(/#(\\w+)/g)] gives you every match as an array — each match's index 1 is the captured group.",
      ".map(m => m[1]) turns the match objects into just the captured words.",
    ],
    solution: "function extractHashtags(text) {\n  return [...text.matchAll(/#(\\w+)/g)].map((m) => m[1]);\n}\n",
    tests: [
      {
        name: "extracts two hashtags",
        body: 'assert.deepEqual(extractHashtags("loving #javascript and #webdev today"), ["javascript", "webdev"]);',
      },
      { name: "no hashtags at all", body: 'assert.deepEqual(extractHashtags("no tags here"), []);' },
      { name: "hashtags with no space between them", body: 'assert.deepEqual(extractHashtags("#one#two #three"), ["one", "two", "three"]);' },
    ],
  },
  {
    id: "ex-query-param",
    chapter: "regex-dates-apis",
    level: "intermediate",
    title: "Read one query parameter from a URL",
    brief:
      "<p>Write <code>getQueryParam(url, key)</code> that returns the value of one query parameter, or <code>null</code> if it isn't present.</p><ul><li>Use the real <code>URL</code> API — no manual string splitting</li></ul>",
    starter: "function getQueryParam(url, key) {\n  // TODO: new URL(url).searchParams has exactly what you need\n}\n",
    hints: ["new URL(url).searchParams.get(key) does the whole thing in one line."],
    solution: "function getQueryParam(url, key) {\n  return new URL(url).searchParams.get(key);\n}\n",
    tests: [
      { name: "reads an existing param", body: 'assert.equal(getQueryParam("https://x.com/search?q=js&page=2", "q"), "js");' },
      { name: "reads a different existing param", body: 'assert.equal(getQueryParam("https://x.com/search?q=js&page=2", "page"), "2");' },
      { name: "missing param returns null", body: 'assert.equal(getQueryParam("https://x.com/search?q=js", "missing"), null);' },
    ],
  },
  {
    id: "ex-error-chain",
    chapter: "error-handling-debugging",
    level: "intermediate",
    title: "Chain a caught error into a new one",
    brief:
      '<p>Write <code>loadUserSafely(rawJson)</code> that parses <code>rawJson</code> and returns the result — but if parsing fails, throw a new <code>Error("failed to load user")</code> with the original error attached as its <code>cause</code>, instead of letting the original error escape as-is.</p>',
    starter:
      'function loadUserSafely(rawJson) {\n  // TODO: try JSON.parse; on failure, throw new Error("failed to load user", { cause: originalError })\n}\n',
    hints: [
      "The second argument to Error's constructor can be { cause: someError } — that's the whole feature.",
      "Catch the JSON.parse failure, then throw a NEW error referencing it as cause, rather than re-throwing the original.",
    ],
    solution:
      'function loadUserSafely(rawJson) {\n  try {\n    return JSON.parse(rawJson);\n  } catch (dbError) {\n    throw new Error("failed to load user", { cause: dbError });\n  }\n}\n',
    tests: [
      {
        name: "wraps a parse failure with the right message and cause",
        body: 'try {\n  loadUserSafely("not json");\n  assert.ok(false, "should have thrown");\n} catch (e) {\n  assert.equal(e.message, "failed to load user");\n  assert.ok(e.cause instanceof Error);\n}',
      },
      { name: "valid JSON parses through normally", body: 'assert.deepEqual(loadUserSafely(\'{"name":"Ana"}\'), { name: "Ana" });' },
    ],
  },
  {
    id: "ex-immutable-update",
    chapter: "error-handling-debugging",
    level: "intermediate",
    title: "Update state without mutating it",
    brief:
      "<p>Write <code>updateImmutable(state, changes)</code> that returns a <b>new</b> object combining <code>state</code> with <code>changes</code> — the original <code>state</code> object must be left completely untouched.</p>",
    starter: "function updateImmutable(state, changes) {\n  // TODO: return a new object, don't mutate state\n}\n",
    hints: ["{ ...state, ...changes } builds a new object where changes' keys win over state's."],
    solution: "function updateImmutable(state, changes) {\n  return { ...state, ...changes };\n}\n",
    tests: [
      {
        name: "returns a different reference",
        body: 'const s1 = { count: 0, name: "x" };\nconst s2 = updateImmutable(s1, { count: 1 });\nassert.notEqual(s1, s2);',
      },
      {
        name: "the original object is untouched",
        body: 'const s1 = { count: 0 };\nupdateImmutable(s1, { count: 5 });\nassert.equal(s1.count, 0);',
      },
      {
        name: "the new object has the merged values",
        body: 'const s2 = updateImmutable({ count: 0, name: "x" }, { count: 1 });\nassert.equal(s2.count, 1);\nassert.equal(s2.name, "x");',
      },
    ],
  },
  {
    id: "ex-take-n",
    chapter: "advanced-async",
    level: "advanced",
    title: "Take N values from any iterable",
    brief:
      "<p>Write <code>take(iterable, n)</code> that returns the first <code>n</code> values from <em>any</em> iterable — including an infinite generator — as a real array.</p><ul><li>Must work on a generator that never runs out on its own</li><li>Stops early if the iterable itself runs out before <code>n</code> values</li></ul>",
    starter:
      "function take(iterable, n) {\n  // TODO: manually call [Symbol.iterator]() and .next() up to n times, stopping on done\n}\n",
    hints: [
      "iterable[Symbol.iterator]() gets you the underlying iterator directly, same protocol from the metaprogramming chapter.",
      "Call .next() in a loop up to n times, but stop early if a result comes back with done: true.",
    ],
    solution:
      "function take(iterable, n) {\n  const result = [];\n  const iterator = iterable[Symbol.iterator]();\n  for (let i = 0; i < n; i++) {\n    const { value, done } = iterator.next();\n    if (done) break;\n    result.push(value);\n  }\n  return result;\n}\n",
    tests: [
      {
        name: "takes 5 from an infinite generator",
        body: "function* naturals() { let n = 1; while (true) yield n++; }\nassert.deepEqual(take(naturals(), 5), [1, 2, 3, 4, 5]);",
      },
      {
        name: "taking 0 gives an empty array",
        body: "function* naturals() { let n = 1; while (true) yield n++; }\nassert.deepEqual(take(naturals(), 0), []);",
      },
      { name: "works on a plain array too", body: "assert.deepEqual(take([10, 20, 30], 2), [10, 20]);" },
      { name: "stops early if the iterable is shorter than n", body: "assert.deepEqual(take([10, 20], 5), [10, 20]);" },
    ],
  },
  {
    id: "ex-concurrency-limit",
    chapter: "advanced-async",
    level: "advanced",
    title: "Cap how many tasks run at once",
    brief:
      "<p>Write <code>runWithLimit(tasks, limit)</code> — given an array of zero-argument async functions, run at most <code>limit</code> of them concurrently, and return their results in the <b>original order</b> once all are done.</p>",
    starter:
      "async function runWithLimit(tasks, limit) {\n  // TODO: a fixed pool of `limit` workers, each pulling the next unstarted task\n}\n",
    hints: [
      "One shared index counter, and `limit` worker functions all racing to grab the next index — Promise.all over the workers themselves.",
      "Store each result at results[current index] so the final order matches the input order regardless of finish order.",
    ],
    solution:
      "async function runWithLimit(tasks, limit) {\n  const results = [];\n  let index = 0;\n  async function worker() {\n    while (index < tasks.length) {\n      const current = index++;\n      results[current] = await tasks[current]();\n    }\n  }\n  await Promise.all(Array.from({ length: limit }, worker));\n  return results;\n}\n",
    tests: [
      {
        name: "results come back in original order",
        body: 'function wait(ms, v) { return new Promise((r) => setTimeout(() => r(v), ms)); }\nconst tasks = [1, 2, 3, 4].map((n) => () => wait(5, n * 10));\nconst results = await runWithLimit(tasks, 2);\nassert.deepEqual(results, [10, 20, 30, 40]);',
      },
      {
        name: "never runs more than the limit at once",
        body: 'function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }\nlet active = 0, maxActive = 0;\nconst tasks = [1, 2, 3, 4, 5, 6].map((n) => async () => {\n  active++;\n  maxActive = Math.max(maxActive, active);\n  await wait(15);\n  active--;\n  return n;\n});\nawait runWithLimit(tasks, 2);\nassert.ok(maxActive <= 2, "maxActive was " + maxActive);',
      },
    ],
  },
  {
    id: "ex-custom-iterable",
    chapter: "metaprogramming",
    level: "advanced",
    title: "A Fibonacci class you can spread",
    brief:
      "<p>Write a class <code>FibonacciUpTo</code> whose constructor takes a <code>max</code>, and implements <code>[Symbol.iterator]</code> so spreading an instance gives every Fibonacci number up to and including <code>max</code>.</p><ul><li><code>[...new FibonacciUpTo(10)]</code> → <code>[0, 1, 1, 2, 3, 5, 8]</code></li></ul>",
    starter:
      "class FibonacciUpTo {\n  constructor(max) {\n    this.max = max;\n  }\n  [Symbol.iterator]() {\n    // TODO: return an object with a next() that yields Fibonacci numbers up to this.max\n  }\n}\n",
    hints: [
      "next() needs its own state (the current pair of numbers) captured in variables local to the iterator object it returns — a closure, same as the Range example in this chapter.",
      "Stop by returning { value: undefined, done: true } once the next number would exceed max.",
    ],
    solution:
      "class FibonacciUpTo {\n  constructor(max) {\n    this.max = max;\n  }\n  [Symbol.iterator]() {\n    let [a, b] = [0, 1];\n    const max = this.max;\n    return {\n      next() {\n        if (a > max) return { value: undefined, done: true };\n        const value = a;\n        [a, b] = [b, a + b];\n        return { value, done: false };\n      },\n    };\n  }\n}\n",
    tests: [
      { name: "gives Fibonacci numbers up to 10", body: "assert.deepEqual([...new FibonacciUpTo(10)], [0, 1, 1, 2, 3, 5, 8]);" },
      { name: "max of 0 gives just [0]", body: "assert.deepEqual([...new FibonacciUpTo(0)], [0]);" },
      { name: "a negative max gives nothing", body: "assert.deepEqual([...new FibonacciUpTo(-1)], []);" },
    ],
  },
  {
    id: "ex-positive-only-proxy",
    chapter: "metaprogramming",
    level: "advanced",
    title: "An array that rejects non-positive numbers",
    brief:
      "<p>Write <code>createPositiveArray()</code> returning a <code>Proxy</code>-wrapped array where pushing anything that isn't a positive number throws a <code>TypeError</code> immediately.</p><ul><li>Valid pushes still behave like a normal array</li></ul>",
    starter:
      "function createPositiveArray() {\n  // TODO: wrap [] in a Proxy with a set trap that validates numeric-index writes\n}\n",
    hints: [
      "The set trap receives (target, prop, value) — prop is a string, even for numeric indices, so check it's not \"length\" before validating.",
      "Number.isNaN(Number(prop)) is a quick way to tell an index key from \"length\" or any other property name.",
    ],
    solution:
      'function createPositiveArray() {\n  return new Proxy([], {\n    set(arr, prop, value) {\n      if (prop !== "length" && !Number.isNaN(Number(prop))) {\n        if (typeof value !== "number" || value <= 0) {\n          throw new TypeError("only positive numbers allowed");\n        }\n      }\n      return Reflect.set(arr, prop, value);\n    },\n  });\n}\n',
    tests: [
      {
        name: "valid pushes work like a normal array",
        body: "const arr = createPositiveArray();\narr.push(5);\narr.push(10);\nassert.deepEqual([...arr], [5, 10]);",
      },
      { name: "pushing a negative number throws", body: "const arr = createPositiveArray();\nassert.throws(() => arr.push(-1), TypeError);" },
      { name: "pushing zero throws", body: "const arr = createPositiveArray();\nassert.throws(() => arr.push(0), TypeError);" },
    ],
  },
  {
    id: "ex-bigint-factorial",
    chapter: "types-data",
    level: "advanced",
    title: "A factorial that doesn't lose precision",
    brief:
      "<p>Write <code>bigFactorial(n)</code> returning <code>n!</code> as a <code>BigInt</code> — correct even well past the point where a regular <code>Number</code> factorial would start rounding.</p>",
    starter: "function bigFactorial(n) {\n  // TODO: multiply 1n through BigInt(n), entirely in BigInt\n}\n",
    hints: [
      "Start an accumulator at 1n, and loop a BigInt counter from 2n up to BigInt(n), multiplying as you go.",
      "Never mix a plain number into the multiplication — every operand needs to already be a BigInt.",
    ],
    solution:
      "function bigFactorial(n) {\n  let result = 1n;\n  for (let i = 2n; i <= BigInt(n); i++) result *= i;\n  return result;\n}\n",
    tests: [
      { name: "5! is 120", body: "assert.equal(bigFactorial(5), 120n);" },
      { name: "0! is 1", body: "assert.equal(bigFactorial(0), 1n);" },
      { name: "20! matches the known exact value", body: "assert.equal(bigFactorial(20), 2432902008176640000n);" },
      {
        name: "25! is exact, well past Number.MAX_SAFE_INTEGER",
        body: "assert.equal(bigFactorial(25), 15511210043330985984000000n);",
      },
    ],
  },
  {
    id: "ex-proper-length",
    chapter: "types-data",
    level: "advanced",
    title: "Count actual characters, not code units",
    brief:
      '<p>Write <code>properLength(str)</code> that returns the number of real characters (code points) in <code>str</code> — not <code>str.length</code>, which counts UTF-16 code units and gets emoji wrong.</p>',
    starter: "function properLength(str) {\n  // TODO: one line — iterate the string properly instead of reading .length\n}\n",
    hints: ["Spreading a string ([...str]) iterates by code point, correctly pairing up surrogate pairs into one character each."],
    solution: "function properLength(str) {\n  return [...str].length;\n}\n",
    tests: [
      { name: "plain ASCII text", body: 'assert.equal(properLength("hello"), 5);' },
      { name: "a single emoji is 1, not 2", body: 'assert.equal(properLength("\\ud83d\\ude00"), 1);' },
      { name: "mixed text and emoji", body: 'assert.equal(properLength("cafe" + String.fromCodePoint(128512)), 5);' },
      { name: "empty string", body: 'assert.equal(properLength(""), 0);' },
    ],
  },
  {
    id: "ex-order-state-machine",
    chapter: "patterns-architecture",
    level: "advanced",
    title: "An order that can't skip states",
    brief:
      '<p>Write <code>createOrderMachine()</code> returning <code>{ current, transition }</code> for an order that starts <code>"placed"</code>, and can only move: placed → shipped or cancelled; shipped → delivered. Any other transition should throw.</p>',
    starter:
      'function createOrderMachine() {\n  // TODO: a transitions table + current state, transition() validates against the table before changing state\n}\n',
    hints: [
      'A plain object works as the transitions table: { placed: ["shipped", "cancelled"], shipped: ["delivered"], delivered: [], cancelled: [] }.',
      "transition(next) should check transitions[state].includes(next) before actually changing state — throw if it's not allowed.",
    ],
    solution:
      'function createOrderMachine() {\n  const transitions = {\n    placed: ["shipped", "cancelled"],\n    shipped: ["delivered"],\n    delivered: [],\n    cancelled: [],\n  };\n  let state = "placed";\n  return {\n    current() {\n      return state;\n    },\n    transition(next) {\n      if (!transitions[state].includes(next)) {\n        throw new Error("cannot go from " + state + " to " + next);\n      }\n      state = next;\n      return state;\n    },\n  };\n}\n',
    tests: [
      {
        name: "walks the normal happy path",
        body: 'const order = createOrderMachine();\nassert.equal(order.current(), "placed");\norder.transition("shipped");\nassert.equal(order.current(), "shipped");\norder.transition("delivered");\nassert.equal(order.current(), "delivered");',
      },
      {
        name: "cancelling from placed works",
        body: 'const order = createOrderMachine();\norder.transition("cancelled");\nassert.equal(order.current(), "cancelled");',
      },
      {
        name: "an impossible transition throws",
        body: 'const order = createOrderMachine();\nassert.throws(() => order.transition("delivered"));',
      },
    ],
  },
  {
    id: "ex-compose-patterns",
    chapter: "patterns-architecture",
    level: "advanced",
    title: "Compose functions, right to left",
    brief:
      "<p>Write <code>compose(...fns)</code> — the mirror image of <code>pipe</code> from the modules chapter: <code>compose(f, g)(x)</code> means <code>f(g(x))</code>, running right to left.</p>",
    starter: "function compose(...fns) {\n  // TODO: reduceRight instead of reduce\n}\n",
    hints: ["fns.reduceRight((acc, fn) => fn(acc), x) — same shape as pipe, just reducing from the other end."],
    solution: "function compose(...fns) {\n  return (x) => fns.reduceRight((acc, fn) => fn(acc), x);\n}\n",
    tests: [
      {
        name: "applies the rightmost function first",
        body: "const sq = (x) => x * x;\nconst addOne = (x) => x + 1;\nassert.equal(compose(sq, addOne)(3), 16);",
      },
      {
        name: "order matters",
        body: "const sq = (x) => x * x;\nconst addOne = (x) => x + 1;\nassert.equal(compose(addOne, sq)(3), 10);",
      },
    ],
  },
  {
    id: "ex-bounded-cache",
    chapter: "performance",
    level: "advanced",
    title: "A cache that can't grow forever",
    brief:
      "<p>Write <code>createBoundedCache(maxSize)</code> returning <code>{ get, set, size }</code> — a cache that evicts its <b>oldest</b> entry once it's full, instead of growing without limit.</p>",
    starter:
      "function createBoundedCache(maxSize) {\n  // TODO: a Map, evicting the oldest key (Map keeps insertion order) once full\n}\n",
    hints: [
      "cache.keys().next().value gives you the oldest key in a Map, since Maps always iterate in insertion order.",
      "Only evict when you're about to add a genuinely NEW key at capacity — updating an existing key shouldn't evict anything.",
    ],
    solution:
      "function createBoundedCache(maxSize) {\n  const cache = new Map();\n  return {\n    get(key) {\n      return cache.get(key);\n    },\n    set(key, value) {\n      if (cache.size >= maxSize && !cache.has(key)) {\n        cache.delete(cache.keys().next().value);\n      }\n      cache.delete(key);\n      cache.set(key, value);\n    },\n    size() {\n      return cache.size;\n    },\n  };\n}\n",
    tests: [
      {
        name: "evicts the oldest entry once full",
        body: 'const cache = createBoundedCache(2);\ncache.set("a", 1);\ncache.set("b", 2);\ncache.set("c", 3);\nassert.equal(cache.size(), 2);\nassert.equal(cache.get("a"), undefined);\nassert.equal(cache.get("b"), 2);\nassert.equal(cache.get("c"), 3);',
      },
      {
        name: "stays within maxSize the whole time",
        body: 'const cache = createBoundedCache(2);\ncache.set("a", 1);\nassert.equal(cache.size(), 1);\ncache.set("b", 2);\nassert.equal(cache.size(), 2);',
      },
    ],
  },
  {
    id: "ex-process-in-batches",
    chapter: "performance",
    level: "advanced",
    title: "Process a big array in chunks",
    brief:
      "<p>Write <code>processInBatches(items, batchSize, fn)</code> that applies <code>fn</code> to every item, but processes them <code>batchSize</code> at a time, returning one flat array of all the results in original order.</p>",
    starter:
      "function processInBatches(items, batchSize, fn) {\n  // TODO: slice items into chunks of batchSize, map each chunk with fn, flatten the results\n}\n",
    hints: ["A for loop stepping by batchSize, slicing out each chunk, is enough — no need for anything async here."],
    solution:
      "function processInBatches(items, batchSize, fn) {\n  const results = [];\n  for (let i = 0; i < items.length; i += batchSize) {\n    const batch = items.slice(i, i + batchSize);\n    results.push(...batch.map(fn));\n  }\n  return results;\n}\n",
    tests: [
      { name: "processes everything in order", body: "assert.deepEqual(processInBatches([1, 2, 3, 4, 5], 2, (x) => x * 2), [2, 4, 6, 8, 10]);" },
      { name: "empty input gives empty output", body: "assert.deepEqual(processInBatches([], 3, (x) => x), []);" },
      { name: "a batch size bigger than the array", body: "assert.deepEqual(processInBatches([1], 5, (x) => x + 1), [2]);" },
    ],
  },
  {
    id: "ex-escape-html",
    chapter: "security",
    level: "advanced",
    title: "Escape text before it becomes HTML",
    brief:
      "<p>Write <code>escapeHtml(str)</code> that escapes the characters that matter for XSS — <code>&amp; &lt; &gt; \" '</code> — so the result is safe to insert as HTML text.</p>",
    starter: "function escapeHtml(str) {\n  // TODO: replace each dangerous character with its HTML entity, & first\n}\n",
    hints: [
      "Escape & FIRST, before any of the others — otherwise you'd double-escape the & that your own &lt; replacement just introduced.",
      "&amp; &lt; &gt; &quot; &#39; are the five entities you need, one .replace(/.../g, ...) per character.",
    ],
    solution:
      'function escapeHtml(str) {\n  return str\n    .replace(/&/g, "&amp;")\n    .replace(/</g, "&lt;")\n    .replace(/>/g, "&gt;")\n    .replace(/"/g, "&quot;")\n    .replace(/\'/g, "&#39;");\n}\n',
    tests: [
      {
        name: "escapes a script tag",
        body: 'assert.equal(escapeHtml("<script>alert(1)</script>"), "&lt;script&gt;alert(1)&lt;/script&gt;");',
      },
      { name: "escapes an ampersand", body: 'assert.equal(escapeHtml("Ana & Ravi"), "Ana &amp; Ravi");' },
      { name: "escapes quotes", body: 'assert.equal(escapeHtml(\'say "hi"\'), "say &quot;hi&quot;");' },
      { name: "plain text passes through unchanged", body: 'assert.equal(escapeHtml("plain text"), "plain text");' },
    ],
  },
  {
    id: "ex-safe-merge",
    chapter: "security",
    level: "advanced",
    title: "Fix the merge so it can't pollute Object.prototype",
    brief:
      '<p>The chapter showed how a naive recursive merge lets <code>"__proto__"</code> in the source object reach and pollute <code>Object.prototype</code> itself. Write <code>safeMerge(target, source)</code> that merges recursively like the original — but is immune to that attack.</p>',
    starter:
      'function safeMerge(target, source) {\n  for (const key in source) {\n    // TODO: skip "__proto__", "constructor", "prototype" — merge everything else recursively\n  }\n  return target;\n}\n',
    hints: [
      'A simple "continue" at the top of the loop for the three dangerous key names blocks the whole attack.',
      "Everything else should behave exactly like the vulnerable version: recurse into nested objects, assign primitives directly.",
    ],
    solution:
      'function safeMerge(target, source) {\n  for (const key in source) {\n    if (key === "__proto__" || key === "constructor" || key === "prototype") continue;\n    if (typeof source[key] === "object" && source[key] !== null) {\n      if (!target[key] || typeof target[key] !== "object") target[key] = {};\n      safeMerge(target[key], source[key]);\n    } else {\n      target[key] = source[key];\n    }\n  }\n  return target;\n}\n',
    tests: [
      {
        name: "a __proto__ payload does not pollute Object.prototype",
        body: 'const malicious = JSON.parse(\'{"__proto__": {"isAdmin": true}}\');\nsafeMerge({}, malicious);\nassert.equal(({}).isAdmin, undefined);',
      },
      {
        name: "normal nested merging still works",
        body: 'assert.deepEqual(safeMerge({}, { a: 1, b: { c: 2 } }), { a: 1, b: { c: 2 } });',
      },
    ],
  },
  {
    id: "ex-flat-polyfill",
    chapter: "ecosystem-professional",
    level: "advanced",
    title: "Write your own Array.prototype.flat",
    brief:
      "<p>Write <code>myFlat(arr, depth = 1)</code> reimplementing <code>Array.prototype.flat</code> from scratch — flattening nested arrays up to <code>depth</code> levels deep.</p>",
    starter: "function myFlat(arr, depth = 1) {\n  // TODO: recurse into array items while depth > 0, decrementing depth each level down\n}\n",
    hints: [
      "reduce works well here: for each item, if it's an array and depth > 0, spread its own myFlat(item, depth - 1) in; otherwise push it directly.",
      "depth of 0 should just return a shallow copy — no flattening at all.",
    ],
    solution:
      "function myFlat(arr, depth = 1) {\n  if (depth < 1) return arr.slice();\n  return arr.reduce((flat, item) => {\n    if (Array.isArray(item)) flat.push(...myFlat(item, depth - 1));\n    else flat.push(item);\n    return flat;\n  }, []);\n}\n",
    tests: [
      { name: "default depth of 1", body: "assert.deepEqual(myFlat([1, [2, [3, [4]]]]), [1, 2, [3, [4]]]);" },
      { name: "depth of 2", body: "assert.deepEqual(myFlat([1, [2, [3, [4]]]], 2), [1, 2, 3, [4]]);" },
      { name: "Infinity flattens everything", body: "assert.deepEqual(myFlat([1, [2, [3, [4]]]], Infinity), [1, 2, 3, 4]);" },
      { name: "an already-flat array is unchanged", body: "assert.deepEqual(myFlat([1, 2, 3]), [1, 2, 3]);" },
    ],
  },
  {
    id: "ex-ast-node-counter",
    chapter: "ecosystem-professional",
    level: "advanced",
    title: "Count nodes of one type in a tree",
    brief:
      '<p>Write <code>countNodesByType(node, type)</code> — given a tree of <code>{ type, children }</code> nodes (like the hand-built AST from this chapter), count how many nodes anywhere in the tree have that exact <code>type</code>.</p>',
    starter:
      "function countNodesByType(node, type, count = 0) {\n  // TODO: check this node's type, then recurse into every child, accumulating count\n}\n",
    hints: [
      "This is plain tree recursion: check the current node, then fold the count through every child in node.children.",
      "node.children might be undefined on a leaf — default it to an empty array before iterating.",
    ],
    solution:
      "function countNodesByType(node, type, count = 0) {\n  if (!node) return count;\n  if (node.type === type) count++;\n  for (const child of node.children || []) {\n    count = countNodesByType(child, type, count);\n  }\n  return count;\n}\n",
    tests: [
      {
        name: "counts matching nodes anywhere in the tree",
        body: 'const ast = {\n  type: "Program",\n  children: [\n    { type: "VariableDeclaration", children: [{ type: "Literal", children: [] }] },\n    { type: "FunctionDeclaration", children: [\n      { type: "VariableDeclaration", children: [] },\n      { type: "Literal", children: [] },\n    ] },\n  ],\n};\nassert.equal(countNodesByType(ast, "Literal"), 2);\nassert.equal(countNodesByType(ast, "VariableDeclaration"), 2);',
      },
      {
        name: "a type that never appears is 0",
        body: 'const ast = { type: "Program", children: [] };\nassert.equal(countNodesByType(ast, "Nonexistent"), 0);',
      },
    ],
  },
  {
    id: "ex-pure-refactor",
    chapter: "testing-in-js",
    level: "advanced",
    title: "Make it testable: extract the pure part",
    brief:
      "<p>Write <code>calculateTotal(price, taxRate)</code> — a pure function computing <code>price</code> plus tax, taking <b>both</b> values as parameters instead of reading a tax rate from anywhere external.</p><ul><li>No module-level variables, no reading from anything outside the function</li></ul>",
    starter: "function calculateTotal(price, taxRate) {\n  // TODO: return price plus tax, using only the two parameters\n}\n",
    hints: [
      "The whole exercise is the function signature itself — take taxRate as a real parameter instead of closing over an outside variable.",
      "price + price * taxRate is the calculation.",
    ],
    solution: "function calculateTotal(price, taxRate) {\n  return price + price * taxRate;\n}\n",
    tests: [
      { name: "18% tax on 100", body: "assert.equal(calculateTotal(100, 0.18), 118);" },
      { name: "zero price", body: "assert.equal(calculateTotal(0, 0.18), 0);" },
      { name: "zero tax rate", body: "assert.equal(calculateTotal(200, 0), 200);" },
      { name: "a different rate", body: "assert.equal(calculateTotal(50, 0.1), 55);" },
    ],
  },
  {
    id: "ex-injectable-clock",
    chapter: "testing-in-js",
    level: "advanced",
    title: "Inject the clock instead of calling Date.now directly",
    brief:
      "<p>Write <code>isExpired(expiresAt, now = Date.now)</code> — returns whether <code>expiresAt</code> (a timestamp) has already passed. <code>now</code> defaults to the real clock, but a caller (like a test) can pass a fake one.</p>",
    starter:
      "function isExpired(expiresAt, now = Date.now) {\n  // TODO: call now() (not Date.now() directly) and compare to expiresAt\n}\n",
    hints: [
      "now is a function — call it as now(), don't compare against the function itself.",
      "Expired means the current time is strictly after expiresAt.",
    ],
    solution: "function isExpired(expiresAt, now = Date.now) {\n  return now() > expiresAt;\n}\n",
    tests: [
      { name: "a fake clock past expiry", body: "assert.equal(isExpired(1000, () => 2000), true);" },
      { name: "a fake clock before expiry", body: "assert.equal(isExpired(2000, () => 1000), false);" },
      { name: "exactly at expiry is not yet expired", body: "assert.equal(isExpired(1000, () => 1000), false);" },
    ],
  },
];
