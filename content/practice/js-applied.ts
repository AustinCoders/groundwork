import type { Exercise } from "../types";

export const jsApplied: Exercise[] = [
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
{
    id: "ex-backoff-delay",
    chapter: "realtime-connections",
    level: "intermediate",
    title: "Exponential backoff, capped",
    brief:
      "<p>Write <code>backoffDelay(attempt, base = 500, max = 30000)</code> — the delay before reconnect attempt number <code>attempt</code> (starting at 0), doubling each time and never exceeding <code>max</code>.</p>",
    starter:
      "function backoffDelay(attempt, base = 500, max = 30000) {\n  // TODO: base * 2^attempt, capped at max\n}\n",
    hints: ["Math.min(base * 2 ** attempt, max) is the whole function."],
    solution: "function backoffDelay(attempt, base = 500, max = 30000) {\n  return Math.min(base * 2 ** attempt, max);\n}\n",
    tests: [
      { name: "attempt 0 is the base delay", body: "assert.equal(backoffDelay(0), 500);" },
      { name: "doubles each attempt", body: "assert.equal(backoffDelay(1), 1000);\nassert.equal(backoffDelay(2), 2000);" },
      { name: "caps at max for a large attempt", body: "assert.equal(backoffDelay(10), 30000);" },
      { name: "respects a custom base", body: "assert.equal(backoffDelay(0, 1000), 1000);" },
      { name: "respects a custom max", body: "assert.equal(backoffDelay(3, 1000, 5000), 5000);" },
    ],
  },
{
    id: "ex-reconnect-tracker",
    chapter: "realtime-connections",
    level: "intermediate",
    title: "Track reconnect attempts, and know when to give up",
    brief:
      "<p>Write <code>createReconnectTracker(maxAttempts)</code> returning <code>{ shouldRetry, recordAttempt, recordSuccess, attemptCount }</code>.</p><ul><li><code>shouldRetry()</code> is <code>false</code> once <code>attemptCount()</code> reaches <code>maxAttempts</code></li><li><code>recordSuccess()</code> resets the count back to 0</li></ul>",
    starter:
      "function createReconnectTracker(maxAttempts) {\n  // TODO: track a count; shouldRetry compares it to maxAttempts\n}\n",
    hints: ["One closed-over counter variable, incremented by recordAttempt and reset by recordSuccess, is enough."],
    solution:
      "function createReconnectTracker(maxAttempts) {\n  let attempts = 0;\n  return {\n    shouldRetry() {\n      return attempts < maxAttempts;\n    },\n    recordAttempt() {\n      attempts++;\n    },\n    recordSuccess() {\n      attempts = 0;\n    },\n    attemptCount() {\n      return attempts;\n    },\n  };\n}\n",
    tests: [
      {
        name: "allows retrying up to the limit, then stops",
        body: "const t = createReconnectTracker(3);\nassert.equal(t.shouldRetry(), true);\nt.recordAttempt();\nt.recordAttempt();\nt.recordAttempt();\nassert.equal(t.shouldRetry(), false);\nassert.equal(t.attemptCount(), 3);",
      },
      {
        name: "a success resets the counter",
        body: "const t = createReconnectTracker(2);\nt.recordAttempt();\nt.recordAttempt();\nassert.equal(t.shouldRetry(), false);\nt.recordSuccess();\nassert.equal(t.attemptCount(), 0);\nassert.equal(t.shouldRetry(), true);",
      },
    ],
  },
{
    id: "ex-cache-first",
    chapter: "offline-storage",
    level: "intermediate",
    title: "A cache-first lookup, the shape a service worker uses",
    brief:
      "<p>Write <code>cacheFirst(cache, network, key)</code> — a <code>Map</code> stands in for the Cache API, and <code>network</code> is an async function standing in for a real fetch. Return the cached value if it exists; otherwise call <code>network(key)</code>, store the result in <code>cache</code>, and return it.</p>",
    starter:
      "async function cacheFirst(cache, network, key) {\n  // TODO: cache.has/get first, otherwise await network(key) and cache.set it\n}\n",
    hints: [
      "cache.has(key) ? cache.get(key) : ... — the whole cache-hit branch in one line.",
      "On a miss: await the network call, cache.set(key, value) before returning it, so the NEXT call for the same key hits the cache branch instead.",
    ],
    solution:
      "async function cacheFirst(cache, network, key) {\n  if (cache.has(key)) return cache.get(key);\n  const value = await network(key);\n  cache.set(key, value);\n  return value;\n}\n",
    tests: [
      {
        name: "a cache hit never calls network",
        body: 'const cache = new Map([["a", "cached-a"]]);\nlet calls = 0;\nconst network = async () => { calls++; return "x"; };\nassert.equal(await cacheFirst(cache, network, "a"), "cached-a");\nassert.equal(calls, 0);',
      },
      {
        name: "a miss calls network once and caches the result",
        body: 'const cache = new Map();\nlet calls = 0;\nconst network = async (key) => { calls++; return "fetched-" + key; };\nassert.equal(await cacheFirst(cache, network, "b"), "fetched-b");\nassert.equal(calls, 1);\nassert.equal(await cacheFirst(cache, network, "b"), "fetched-b");\nassert.equal(calls, 1);',
      },
    ],
  },
{
    id: "ex-storage-picker",
    chapter: "offline-storage",
    level: "intermediate",
    title: "Pick the right storage for the job",
    brief:
      '<p>Write <code>pickStorage({ sizeMB, structured, mustSurviveTabClose, sentToServer })</code> returning one of <code>"cookie"</code>, <code>"IndexedDB"</code>, <code>"sessionStorage"</code>, <code>"localStorage"</code> — in that priority order:</p><ul><li>Needs to ride along on server requests automatically → <code>"cookie"</code></li><li>Otherwise, big (&gt;5MB) or structured (not a plain string) → <code>"IndexedDB"</code></li><li>Otherwise, doesn\'t need to survive closing the tab → <code>"sessionStorage"</code></li><li>Otherwise → <code>"localStorage"</code></li></ul>',
    starter:
      "function pickStorage({ sizeMB, structured, mustSurviveTabClose, sentToServer }) {\n  // TODO: check the four conditions in priority order, return the matching string\n}\n",
    hints: ["Four early returns, checked in the exact priority order listed, covers every case."],
    solution:
      'function pickStorage({ sizeMB, structured, mustSurviveTabClose, sentToServer }) {\n  if (sentToServer) return "cookie";\n  if (sizeMB > 5 || structured) return "IndexedDB";\n  if (!mustSurviveTabClose) return "sessionStorage";\n  return "localStorage";\n}\n',
    tests: [
      {
        name: "small, simple, persistent data",
        body: 'assert.equal(pickStorage({ sizeMB: 0.01, structured: false, mustSurviveTabClose: true, sentToServer: false }), "localStorage");',
      },
      {
        name: "small, simple, tab-only data",
        body: 'assert.equal(pickStorage({ sizeMB: 0.01, structured: false, mustSurviveTabClose: false, sentToServer: false }), "sessionStorage");',
      },
      {
        name: "large structured data",
        body: 'assert.equal(pickStorage({ sizeMB: 50, structured: true, mustSurviveTabClose: true, sentToServer: false }), "IndexedDB");',
      },
      {
        name: "anything the server needs to see is a cookie",
        body: 'assert.equal(pickStorage({ sizeMB: 0.001, structured: false, mustSurviveTabClose: true, sentToServer: true }), "cookie");',
      },
    ],
  },
{
    id: "ex-decode-jwt-payload",
    chapter: "security",
    level: "advanced",
    title: "Decode a JWT payload — no secret required",
    brief:
      "<p>Write <code>decodeJwtPayload(token)</code> — given a <code>header.payload.signature</code> JWT string, return the decoded payload as a real object.</p>",
    starter:
      "function decodeJwtPayload(token) {\n  // TODO: split on \".\", the payload is segment 1 — atob + JSON.parse it\n}\n",
    hints: [
      'token.split(".") gives you [header, payload, signature] — index 1 is the one you want.',
      "atob(part) base64-decodes to a JSON string; JSON.parse the result.",
    ],
    solution: 'function decodeJwtPayload(token) {\n  const parts = token.split(".");\n  return JSON.parse(atob(parts[1]));\n}\n',
    tests: [
      {
        name: "decodes a real payload segment",
        body: 'const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkFuYSJ9.sig";\nassert.deepEqual(decodeJwtPayload(token), { sub: "user123", name: "Ana" });',
      },
    ],
  },
{
    id: "ex-is-token-expired",
    chapter: "security",
    level: "advanced",
    title: "Check token expiry with an injectable clock",
    brief:
      '<p>Write <code>isTokenExpired(payload, now)</code> — <code>payload.exp</code> is a Unix timestamp in seconds; <code>now</code> is a function (default: the real clock) returning the current time the same way. Return whether the token has expired.</p>',
    starter:
      "function isTokenExpired(payload, now = () => Date.now() / 1000) {\n  // TODO: call now() and compare to payload.exp\n}\n",
    hints: ["Same shape as the injectable-clock exercise from the testing chapter — call now(), don't compare against the function itself."],
    solution: "function isTokenExpired(payload, now = () => Date.now() / 1000) {\n  return now() > payload.exp;\n}\n",
    tests: [
      { name: "an expired token", body: "assert.equal(isTokenExpired({ exp: 1000 }, () => 2000), true);" },
      { name: "a still-valid token", body: "assert.equal(isTokenExpired({ exp: 2000 }, () => 1000), false);" },
    ],
  },
];
