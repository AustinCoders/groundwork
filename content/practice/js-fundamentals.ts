import type { Exercise } from "../types";

export const jsFundamentals: Exercise[] = [
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
];
