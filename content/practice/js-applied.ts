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
      { name: "undefined name gets the generic greeting", body: "assert.equal(greetMember(undefined), \"Welcome, guest!\");" },
      { name: "null name gets the generic greeting", body: "assert.equal(greetMember(null), \"Welcome, guest!\");" },
      { name: "calling with no argument at all", body: "assert.equal(greetMember(), \"Welcome, guest!\");" },
      { name: "punctuation in a name is kept", body: "assert.equal(greetMember(\"O'Neil\"), \"Welcome back, O'Neil!\");" },
      { name: "a long name", body: "const name = \"A\".repeat(500);\nassert.equal(greetMember(name), \"Welcome back, \" + name + \"!\");" },
      { name: "the function never throws for any of these", body: "for (const v of [\"a\", \"\", undefined, null, 0, \"Zoë\"]) {\n  let threw = false;\n  try { greetMember(v); } catch (e) { threw = true; }\n  assert.equal(threw, false, String(v));\n}" },
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
      { name: "the name and the age keep their types", body: "const out = makeUser(\"Ana\", 29);\nassert.equal(typeof out[0], \"string\");\nassert.equal(typeof out[1], \"number\");" },
      { name: "a falsy age is not lost", body: "assert.deepEqual(makeUser(\"Zed\", 0), [\"Zed\", 0]);" },
      { name: "it returns an array of length two", body: "const out = makeUser(\"A\", 1);\nassert.equal(Array.isArray(out), true);\nassert.equal(out.length, 2);" },
      { name: "each call returns a new array", body: "assert.notEqual(makeUser(\"A\", 1), makeUser(\"A\", 1));" },
      { name: "a missing age leaves an undefined slot", body: "const out = makeUser(\"A\");\nassert.equal(out.length, 2);\nassert.equal(out[0], \"A\");\nassert.equal(out[1], undefined);" },
      { name: "the order is name then age", body: "assert.equal(makeUser(\"Q\", 5)[0], \"Q\");\nassert.equal(makeUser(\"Q\", 5)[1], 5);" },
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
      { name: "negative numbers", body: "assert.equal(sum(-1, -2, 3), 0);\nassert.equal(sum(-5), -5);" },
      { name: "decimals", body: "assert.equal(sum(0.5, 0.25), 0.75);" },
      { name: "a thousand arguments", body: "assert.equal(sum(...new Array(1000).fill(2)), 2000);" },
      { name: "zeros", body: "assert.equal(sum(0, 0, 0), 0);" },
      { name: "the result is a number", body: "assert.type(sum(), \"number\");\nassert.type(sum(1, 2), \"number\");" },
      { name: "the argument order does not matter", body: "assert.equal(sum(1, 2, 3, 4), sum(4, 3, 2, 1));" },
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
      { name: "an item whose quantity is fractional and positive counts", body: "assert.equal(cartTotal([{ price: 10, qty: 0.5 }]), 5);" },
      { name: "every item skipped gives 0", body: "assert.equal(cartTotal([{ price: 5, qty: 0 }, { price: 9, qty: -2 }]), 0);" },
      { name: "an expensive item with zero quantity is skipped", body: "assert.equal(cartTotal([{ price: 1000000, qty: 0 }, { price: 1, qty: 1 }]), 1);" },
      { name: "the cart is not modified", body: "const cart = [{ price: 3, qty: 2 }, { price: 4, qty: 0 }];\ncartTotal(cart);\nassert.deepEqual(cart, [{ price: 3, qty: 2 }, { price: 4, qty: 0 }]);" },
      { name: "a large cart", body: "const items = Array.from({ length: 10000 }, (_, i) => ({ price: 2, qty: i % 2 }));\nassert.equal(cartTotal(items), 10000);" },
      { name: "a zero price with positive quantity adds nothing", body: "assert.equal(cartTotal([{ price: 0, qty: 5 }, { price: 3, qty: 1 }]), 3);" },
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
      { name: "a missing city", body: "assert.equal(formatAddress({ street: \"MG Road\" }), \"Unknown address\");" },
      { name: "an empty street", body: "assert.equal(formatAddress({ street: \"\", city: \"Pune\" }), \"Unknown address\");" },
      { name: "a country that is explicitly undefined still defaults", body: "assert.equal(formatAddress({ street: \"A\", city: \"B\", country: undefined }), \"A, B, India\");" },
      { name: "extra properties are ignored", body: "assert.equal(formatAddress({ street: \"A\", city: \"B\", zip: \"123\" }), \"A, B, India\");" },
      { name: "an empty object", body: "assert.equal(formatAddress({}), \"Unknown address\");" },
      { name: "the input object is not changed", body: "const a = { street: \"A\", city: \"B\" };\nformatAddress(a);\nassert.deepEqual(a, { street: \"A\", city: \"B\" });" },
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
      { name: "removing a listener that was never added does nothing", body: "const e = createEmitter();\nconst calls = [];\ne.on(\"t\", () => calls.push(1));\ne.off(\"t\", () => {});\ne.emit(\"t\");\nassert.deepEqual(calls, [1]);" },
      { name: "all arguments reach the listener", body: "const e = createEmitter();\nlet got;\ne.on(\"t\", (...args) => { got = args; });\ne.emit(\"t\", 1, \"two\", { three: 3 });\nassert.deepEqual(got, [1, \"two\", { three: 3 }]);" },
      { name: "events are independent of each other", body: "const e = createEmitter();\nconst calls = [];\ne.on(\"a\", () => calls.push(\"a\"));\ne.on(\"b\", () => calls.push(\"b\"));\ne.emit(\"a\");\nassert.deepEqual(calls, [\"a\"]);" },
      { name: "off only affects the named event", body: "const e = createEmitter();\nconst calls = [];\nconst fn = () => calls.push(\"x\");\ne.on(\"a\", fn);\ne.on(\"b\", fn);\ne.off(\"a\", fn);\ne.emit(\"a\");\ne.emit(\"b\");\nassert.deepEqual(calls, [\"x\"]);" },
      { name: "two emitters do not share listeners", body: "const e1 = createEmitter();\nconst e2 = createEmitter();\nlet n = 0;\ne1.on(\"t\", () => n++);\ne2.emit(\"t\");\nassert.equal(n, 0);" },
      { name: "fifty listeners fire in registration order", body: "const e = createEmitter();\nconst order = [];\nfor (let i = 0; i < 50; i++) e.on(\"t\", () => order.push(i));\ne.emit(\"t\");\nassert.deepEqual(order, Array.from({ length: 50 }, (_, i) => i));" },
    ],
  },
{
    id: "ex-find-closest",
    chapter: "dom-events",
    level: "beginner",
    title: "Walk up to the nearest matching ancestor",
    brief:
      "<p>Real DOM nodes aren't available in this sandbox, but <code>el.closest(selector)</code> is really just \"walk <code>.parent</code> links upward until something matches, or run out of tree.\" Write <code>findClosest(node, predicate)</code> against a plain <code>{ tag, parent }</code> tree.</p><ul><li>Check <code>node</code> itself first — <code>closest()</code> includes the starting element</li><li>Then check <code>node.parent</code>, then <code>node.parent.parent</code>, and so on</li><li>Return <code>null</code> if nothing all the way up matches</li></ul>",
    starter:
      "function findClosest(node, predicate) {\n  // TODO: check node, then walk node.parent upward, returning the first match or null\n}\n",
    hints: [
      "A simple while loop works: start at node, test it, then reassign to current.parent each time it fails.",
      "The loop ends when current becomes null/undefined — the root's parent — without ever matching.",
    ],
    solution:
      "function findClosest(node, predicate) {\n  let current = node;\n  while (current) {\n    if (predicate(current)) return current;\n    current = current.parent;\n  }\n  return null;\n}\n",
    tests: [
      {
        name: "returns the starting node when it already matches",
        body: 'const row = { tag: "tr" };\nassert.equal(findClosest(row, (n) => n.tag === "tr"), row);',
      },
      {
        name: "walks upward past several non-matching ancestors",
        body: 'const row = { tag: "tr" };\nconst cell = { tag: "td", parent: row };\nconst icon = { tag: "span", parent: cell };\nassert.equal(findClosest(icon, (n) => n.tag === "tr"), row);',
      },
      {
        name: "returns null when nothing in the chain matches",
        body: 'const root = { tag: "body" };\nconst cell = { tag: "td", parent: root };\nassert.equal(findClosest(cell, (n) => n.tag === "tr"), null);',
      },
      {
        name: "a lone node with no parent and no match returns null",
        body: 'assert.equal(findClosest({ tag: "div" }, (n) => n.tag === "tr"), null);',
      },
      { name: "the nearest match wins when several ancestors match", body: "const outer = { tag: \"div\" };\nconst inner = { tag: \"div\", parent: outer };\nconst leaf = { tag: \"span\", parent: inner };\nassert.equal(findClosest(leaf, (n) => n.tag === \"div\"), inner);" },
      { name: "the predicate sees nodes from the start upward", body: "const a = { tag: \"a\" };\nconst b = { tag: \"b\", parent: a };\nconst c = { tag: \"c\", parent: b };\nconst seen = [];\nfindClosest(c, (n) => { seen.push(n.tag); return false; });\nassert.deepEqual(seen, [\"c\", \"b\", \"a\"]);" },
      { name: "it stops at the first match", body: "const a = { tag: \"a\" };\nconst b = { tag: \"b\", parent: a };\nconst seen = [];\nfindClosest(b, (n) => { seen.push(n.tag); return n.tag === \"b\"; });\nassert.deepEqual(seen, [\"b\"]);" },
      { name: "an explicitly null parent ends the walk", body: "const n = { tag: \"x\", parent: null };\nassert.equal(findClosest(n, () => false), null);" },
      { name: "a chain of ten thousand nodes", body: "let node = { tag: \"root\" };\nconst root = node;\nfor (let i = 0; i < 10000; i++) node = { tag: \"n\" + i, parent: node };\nassert.equal(findClosest(node, (n) => n.tag === \"root\"), root);" },
    ],
  },
{
    id: "ex-brand-check",
    chapter: "prototypes-oop",
    level: "intermediate",
    title: "Brand a class with a private field check",
    brief:
      "<p>Give <code>Stack</code> a private field <code>#items</code> and a <code>static isStack(obj)</code> that returns <code>true</code> only for a real <code>Stack</code> instance — never for a look-alike plain object, even one with an <code>items</code> array on it.</p><ul><li>Use <code>#items in obj</code> inside <code>isStack</code>, not <code>instanceof</code></li><li><code>push(x)</code> adds to the top, <code>pop()</code> removes and returns the top item</li></ul>",
    starter:
      "class Stack {\n  #items = [];\n  push(x) {\n    // TODO\n  }\n  pop() {\n    // TODO\n  }\n  static isStack(obj) {\n    // TODO: true only for a real Stack instance\n  }\n}\n",
    hints: [
      "#items in obj throws if obj isn't an object at all — but for a plain {} it safely returns false rather than throwing.",
      "push/pop are just Array.prototype.push/pop on the private field.",
    ],
    solution:
      "class Stack {\n  #items = [];\n  push(x) {\n    this.#items.push(x);\n    return this.#items.length;\n  }\n  pop() {\n    return this.#items.pop();\n  }\n  static isStack(obj) {\n    return typeof obj === \"object\" && obj !== null && #items in obj;\n  }\n}\n",
    tests: [
      {
        name: "push then pop returns the last pushed item",
        body: "const s = new Stack();\ns.push(1);\ns.push(2);\nassert.equal(s.pop(), 2);\nassert.equal(s.pop(), 1);",
      },
      {
        name: "isStack is true for a real instance",
        body: "assert.equal(Stack.isStack(new Stack()), true);",
      },
      {
        name: "isStack is false for a look-alike plain object",
        body: "assert.equal(Stack.isStack({ items: [1, 2] }), false);",
      },
      {
        name: "isStack is false for null and primitives, without throwing",
        body: "assert.equal(Stack.isStack(null), false);\nassert.equal(Stack.isStack(5), false);",
      },
      { name: "a subclass instance still counts as a stack", body: "class Sub extends Stack {}\nassert.equal(Stack.isStack(new Sub()), true);" },
      { name: "an object that only borrows the prototype is not a stack", body: "assert.equal(Stack.isStack(Object.create(Stack.prototype)), false);" },
      { name: "arrays, functions, strings and undefined are not stacks", body: "for (const v of [[], () => 1, \"stack\", undefined, 0, true]) assert.equal(Stack.isStack(v), false, String(v));" },
      { name: "two stacks do not share items", body: "const a = new Stack();\nconst b = new Stack();\na.push(1);\nb.push(2);\nassert.equal(a.pop(), 1);\nassert.equal(b.pop(), 2);" },
      { name: "popping an empty stack gives undefined", body: "assert.equal(new Stack().pop(), undefined);" },
      { name: "the private field cannot be read from outside", body: "const s = new Stack();\ns.push(1);\nassert.equal(s.items, undefined);\nassert.equal(s[\"#items\"], undefined);\nassert.equal(Object.keys(s).length, 0);" },
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
      { name: "it returns a promise", body: "assert.ok(delayedDouble(1) instanceof Promise);\nawait delayedDouble(1);" },
      { name: "it resolves later, not immediately", body: "const t0 = Date.now();\nawait delayedDouble(2);\nassert.ok(Date.now() - t0 >= 10, \"resolved too quickly\");" },
      { name: "decimals", body: "assert.equal(await delayedDouble(1.5), 3);" },
      { name: "ten calls run together", body: "const t0 = Date.now();\nconst out = await Promise.all(Array.from({ length: 10 }, (_, i) => delayedDouble(i)));\nassert.deepEqual(out, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);\nassert.ok(Date.now() - t0 < 120, \"calls look sequential\");" },
      { name: "a large number", body: "assert.equal(await delayedDouble(1e9), 2e9);" },
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
      { name: "dates become ISO strings", body: "assert.equal(cleanForStorage({ d: new Date(0) }).d, \"1970-01-01T00:00:00.000Z\");" },
      { name: "null is kept but undefined is dropped", body: "const out = cleanForStorage({ a: null, b: undefined });\nassert.equal(\"a\" in out, true);\nassert.equal(out.a, null);\nassert.equal(\"b\" in out, false);" },
      { name: "the result shares nothing with the input", body: "const src = { list: [1, 2], deep: { x: 1 } };\nconst out = cleanForStorage(src);\nassert.notEqual(out.list, src.list);\nassert.notEqual(out.deep, src.deep);\nout.deep.x = 9;\nassert.equal(src.deep.x, 1);" },
      { name: "NaN and Infinity become null", body: "const out = cleanForStorage({ a: NaN, b: Infinity });\nassert.equal(out.a, null);\nassert.equal(out.b, null);" },
      { name: "symbols are dropped", body: "const out = cleanForStorage({ a: 1, b: Symbol(\"s\") });\nassert.equal(\"b\" in out, false);\nassert.equal(out.a, 1);" },
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
      { name: "valid JSON primitives parse", body: "assert.equal(safeParseJSON(\"5\", 0), 5);\nassert.equal(safeParseJSON(\"true\", false), true);\nassert.equal(safeParseJSON(\"\\\"hi\\\"\", \"\"), \"hi\");" },
      { name: "the JSON literal null is a valid result, not a failure", body: "assert.equal(safeParseJSON(\"null\", \"fallback\"), null);" },
      { name: "the fallback is returned as the very same object", body: "const fb = { fallback: true };\nassert.equal(safeParseJSON(\"nope\", fb), fb);" },
      { name: "truncated JSON falls back", body: "assert.equal(safeParseJSON(\"{\\\"a\\\":\", \"x\"), \"x\");" },
      { name: "single-quoted JSON is not JSON", body: "assert.equal(safeParseJSON(\"{'a': 1}\", \"x\"), \"x\");" },
      { name: "whitespace only falls back", body: "assert.equal(safeParseJSON(\"   \", \"x\"), \"x\");" },
      { name: "arrays parse", body: "assert.deepEqual(safeParseJSON(\"[1,2,3]\", []), [1, 2, 3]);" },
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
      { name: "zero is a valid age", body: "assert.equal(validateAge(0), 0);" },
      { name: "a decimal age is returned unchanged", body: "assert.equal(validateAge(25.5), 25.5);" },
      { name: "the error has the right name and field", body: "let err;\ntry { validateAge(-1); } catch (e) { err = e; }\nassert.equal(err.name, \"ValidationError\");\nassert.equal(err.field, \"age\");" },
      { name: "the message is a non-empty string", body: "let err;\ntry { validateAge(-1); } catch (e) { err = e; }\nassert.equal(typeof err.message, \"string\");\nassert.ok(err.message.length > 0);" },
      { name: "null, undefined and numeric strings are rejected", body: "for (const bad of [null, undefined, \"25\", {}, []]) {\n  let err = null;\n  try { validateAge(bad); } catch (e) { err = e; }\n  assert.ok(err instanceof ValidationError, String(bad));\n}" },
      { name: "a directly constructed error carries its parts", body: "const e = new ValidationError(\"bad\", \"email\");\nassert.equal(e.message, \"bad\");\nassert.equal(e.field, \"email\");\nassert.ok(e instanceof Error);\nassert.equal(typeof e.stack, \"string\");" },
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
      { name: "a higher patch on the same minor satisfies", body: "assert.equal(satisfiesCaret(\"^1.2.5\", \"1.2.6\"), true);" },
      { name: "a much higher major fails even with matching minor and patch", body: "assert.equal(satisfiesCaret(\"^2.0.0\", \"3.2.0\"), false);\nassert.equal(satisfiesCaret(\"^0.5.0\", \"0.6.0\"), true);" },
      { name: "an exact zero version matches, a lower patch does not", body: "assert.equal(satisfiesCaret(\"^1.0.0\", \"1.0.0\"), true);\nassert.equal(satisfiesCaret(\"^1.0.1\", \"1.0.0\"), false);" },
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
      { name: "no functions returns the input unchanged", body: "assert.equal(pipe()(5), 5);" },
      { name: "a string pipeline", body: "assert.equal(pipe((s) => s.trim(), (s) => s.toUpperCase())(\"  hi \"), \"HI\");" },
      { name: "the returned function is reusable", body: "const f = pipe((x) => x + 1, (x) => x * 2);\nassert.equal(f(1), 4);\nassert.equal(f(2), 6);\nassert.equal(f(1), 4);" },
      { name: "order matters", body: "const add = (x) => x + 1, dbl = (x) => x * 2;\nassert.equal(pipe(add, dbl)(3), 8);\nassert.equal(pipe(dbl, add)(3), 7);" },
      { name: "nothing runs until the pipeline is called", body: "let calls = 0;\nconst f = pipe((x) => { calls++; return x; });\nassert.equal(calls, 0);\nf(1);\nassert.equal(calls, 1);" },
      { name: "a hundred functions", body: "const fns = Array.from({ length: 100 }, () => (x) => x + 1);\nassert.equal(pipe(...fns)(0), 100);" },
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
      { name: "a hashtag at the very start and end", body: "assert.deepEqual(extractHashtags(\"#start middle #end\"), [\"start\", \"end\"]);" },
      { name: "digits and underscores belong to the tag", body: "assert.deepEqual(extractHashtags(\"#js_2024 rocks\"), [\"js_2024\"]);" },
      { name: "a lone # is not a tag", body: "assert.deepEqual(extractHashtags(\"# nothing # here\"), []);" },
      { name: "a hyphen ends the tag", body: "assert.deepEqual(extractHashtags(\"#web-dev\"), [\"web\"]);" },
      { name: "duplicates are kept in order", body: "assert.deepEqual(extractHashtags(\"#a #b #a\"), [\"a\", \"b\", \"a\"]);" },
      { name: "an empty string", body: "assert.deepEqual(extractHashtags(\"\"), []);" },
    ],
  },
{
    id: "ex-query-param",
    chapter: "browser-apis-deep",
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
      { name: "percent-encoded values are decoded", body: "assert.equal(getQueryParam(\"https://x.com/?q=hello%20world\", \"q\"), \"hello world\");" },
      { name: "a plus sign is a space", body: "assert.equal(getQueryParam(\"https://x.com/?q=a+b\", \"q\"), \"a b\");" },
      { name: "a repeated key gives the first value", body: "assert.equal(getQueryParam(\"https://x.com/?a=1&a=2\", \"a\"), \"1\");" },
      { name: "an empty value is an empty string, not null", body: "assert.equal(getQueryParam(\"https://x.com/?a=\", \"a\"), \"\");" },
      { name: "the hash is not part of the value", body: "assert.equal(getQueryParam(\"https://x.com/?q=1#top\", \"q\"), \"1\");" },
      { name: "no query string at all", body: "assert.equal(getQueryParam(\"https://x.com/path\", \"q\"), null);" },
      { name: "keys are case-sensitive", body: "assert.equal(getQueryParam(\"https://x.com/?Q=1\", \"q\"), null);" },
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
      { name: "the cause is the original SyntaxError", body: "let err;\ntry { loadUserSafely(\"{bad\"); } catch (e) { err = e; }\nassert.ok(err.cause instanceof SyntaxError);" },
      { name: "the wrapper is a plain Error, not the original one", body: "let err;\ntry { loadUserSafely(\"nope\"); } catch (e) { err = e; }\nassert.equal(err instanceof SyntaxError, false);\nassert.ok(err instanceof Error);" },
      { name: "an empty string fails and is wrapped", body: "let err;\ntry { loadUserSafely(\"\"); } catch (e) { err = e; }\nassert.equal(err.message, \"failed to load user\");" },
      { name: "valid JSON with whitespace parses", body: "assert.deepEqual(loadUserSafely('  { \"a\" : [1, 2] }  '), { a: [1, 2] });" },
      { name: "valid primitives parse through", body: "assert.equal(loadUserSafely(\"5\"), 5);\nassert.equal(loadUserSafely(\"null\"), null);" },
      { name: "nothing is thrown for valid input", body: "let threw = false;\ntry { loadUserSafely(\"{}\"); } catch (e) { threw = true; }\nassert.equal(threw, false);" },
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
      { name: "new keys can be added", body: "assert.deepEqual(updateImmutable({ a: 1 }, { b: 2 }), { a: 1, b: 2 });" },
      { name: "empty changes give an equal but different object", body: "const s = { a: 1 };\nconst out = updateImmutable(s, {});\nassert.deepEqual(out, s);\nassert.notEqual(out, s);" },
      { name: "the later value wins", body: "assert.equal(updateImmutable({ a: 1 }, { a: 2 }).a, 2);" },
      { name: "the changes object is not modified", body: "const changes = { a: 2 };\nupdateImmutable({ a: 1 }, changes);\nassert.deepEqual(changes, { a: 2 });" },
      { name: "a change may set a value to undefined", body: "const out = updateImmutable({ a: 1, b: 2 }, { a: undefined });\nassert.equal(out.a, undefined);\nassert.equal(out.b, 2);" },
      { name: "every key of the original survives", body: "const s = { a: 1, b: 2, c: 3 };\nconst out = updateImmutable(s, { b: 9 });\nassert.deepEqual(Object.keys(out).sort(), [\"a\", \"b\", \"c\"]);\nassert.equal(out.a, 1);\nassert.equal(out.c, 3);" },
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
      { name: "taking from a Set", body: "assert.deepEqual(take(new Set([1, 2, 3, 4]), 2), [1, 2]);" },
      { name: "taking from a string gives characters", body: "assert.deepEqual(take(\"hello\", 3), [\"h\", \"e\", \"l\"]);" },
      { name: "taking exactly the length", body: "assert.deepEqual(take([1, 2, 3], 3), [1, 2, 3]);" },
      { name: "a generator is not run further than needed", body: "let produced = 0;\nfunction* g() { while (true) { produced++; yield produced; } }\nassert.deepEqual(take(g(), 3), [1, 2, 3]);\nassert.ok(produced <= 3, \"produced \" + produced);" },
      { name: "the result is a real array", body: "assert.equal(Array.isArray(take([1, 2], 1)), true);" },
      { name: "taking from an empty iterable", body: "assert.deepEqual(take([], 3), []);" },
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
      { name: "no tasks resolves to an empty array", body: "assert.deepEqual(await runWithLimit([], 3), []);" },
      { name: "a limit bigger than the number of tasks", body: "const tasks = [1, 2].map((n) => async () => n);\nassert.deepEqual(await runWithLimit(tasks, 10), [1, 2]);" },
      { name: "a limit of one runs tasks one after another", body: "const log = [];\nconst mk = (n) => async () => { log.push(\"s\" + n); await new Promise((r) => setTimeout(r, 5)); log.push(\"e\" + n); return n; };\nawait runWithLimit([mk(1), mk(2), mk(3)], 1);\nassert.deepEqual(log, [\"s1\", \"e1\", \"s2\", \"e2\", \"s3\", \"e3\"]);" },
      { name: "a rejecting task rejects the whole run", body: "const tasks = [async () => 1, async () => { throw new Error(\"bad\"); }, async () => 3];\nlet msg = \"\";\ntry { await runWithLimit(tasks, 2); } catch (e) { msg = e.message; }\nassert.equal(msg, \"bad\");" },
      { name: "every task is run exactly once", body: "const counts = [0, 0, 0, 0, 0];\nconst tasks = counts.map((_, i) => async () => { counts[i]++; return i; });\nawait runWithLimit(tasks, 2);\nassert.deepEqual(counts, [1, 1, 1, 1, 1]);" },
      { name: "the limit is actually reached", body: "let active = 0, peak = 0;\nconst tasks = Array.from({ length: 6 }, (_, i) => async () => { active++; peak = Math.max(peak, active); await new Promise((r) => setTimeout(r, 10)); active--; return i; });\nawait runWithLimit(tasks, 3);\nassert.equal(peak, 3);" },
      { name: "results stay in order when tasks finish in reverse", body: "const tasks = [30, 20, 10, 5].map((ms, i) => () => new Promise((r) => setTimeout(() => r(i), ms)));\nassert.deepEqual(await runWithLimit(tasks, 4), [0, 1, 2, 3]);" },
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
      { name: "a max of 1", body: "assert.deepEqual([...new FibonacciUpTo(1)], [0, 1, 1]);" },
      { name: "a max of 100", body: "assert.deepEqual([...new FibonacciUpTo(100)], [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]);" },
      { name: "each iteration starts fresh", body: "const f = new FibonacciUpTo(10);\nassert.deepEqual([...f], [0, 1, 1, 2, 3, 5, 8]);\nassert.deepEqual([...f], [0, 1, 1, 2, 3, 5, 8]);" },
      { name: "it works with for...of and Array.from", body: "const seen = [];\nfor (const n of new FibonacciUpTo(8)) seen.push(n);\nassert.deepEqual(seen, [0, 1, 1, 2, 3, 5, 8]);\nassert.deepEqual(Array.from(new FibonacciUpTo(2)), [0, 1, 1, 2]);" },
      { name: "a large max", body: "assert.equal([...new FibonacciUpTo(1000000)].length, 31);" },
      { name: "two instances are independent", body: "const a = new FibonacciUpTo(5);\nconst b = new FibonacciUpTo(50);\nassert.equal([...a].length, 6);\nassert.equal([...b].length, 10);" },
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
      { name: "pushing a string throws a TypeError", body: "const arr = createPositiveArray();\nlet err;\ntry { arr.push(\"5\"); } catch (e) { err = e; }\nassert.ok(err instanceof TypeError);" },
      { name: "decimals above zero are allowed", body: "const arr = createPositiveArray();\narr.push(0.5);\narr.push(1e-9);\nassert.equal(arr.length, 2);" },
      { name: "a rejected push leaves the array unchanged", body: "const arr = createPositiveArray();\narr.push(1);\ntry { arr.push(-1); } catch (e) {}\nassert.equal(arr.length, 1);\nassert.deepEqual([...arr], [1]);" },
      { name: "assigning by index is checked too", body: "const arr = createPositiveArray();\nlet err;\ntry { arr[0] = -3; } catch (e) { err = e; }\nassert.ok(err instanceof TypeError);" },
      { name: "a negative number throws a TypeError, not some other error", body: "const arr = createPositiveArray();\nlet err;\ntry { arr.push(-1); } catch (e) { err = e; }\nassert.ok(err instanceof TypeError);" },
      { name: "normal array methods work on valid contents", body: "const arr = createPositiveArray();\narr.push(1, 2, 3);\nassert.deepEqual(arr.map((x) => x * 2), [2, 4, 6]);\nassert.equal(arr.length, 3);\nassert.equal(arr.indexOf(2), 1);" },
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
      { name: "1! is 1", body: "assert.equal(bigFactorial(1), 1n);" },
      { name: "30! is exact", body: "assert.equal(bigFactorial(30), 265252859812191058636308480000000n);" },
      { name: "50! is exact", body: "assert.equal(bigFactorial(50), 30414093201713378043612608166064768844377641568960512000000000000n);" },
      { name: "the result is a BigInt", body: "assert.equal(typeof bigFactorial(10), \"bigint\");" },
      { name: "100! has 158 digits", body: "assert.equal(String(bigFactorial(100)).length, 158);" },
      { name: "n! divided by (n-1)! is n", body: "for (const n of [2, 5, 17, 40]) assert.equal(bigFactorial(n) / bigFactorial(n - 1), BigInt(n));" },
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
      { name: "a combining accent counts as its own code point", body: "assert.equal(properLength(\"e\\u0301\"), 2);" },
      { name: "several emoji", body: "assert.equal(properLength(String.fromCodePoint(128512).repeat(3)), 3);" },
      { name: "an emoji in the middle of text", body: "assert.equal(properLength(\"a\" + String.fromCodePoint(128512) + \"b\"), 3);" },
      { name: "CJK characters", body: "assert.equal(properLength(\"日本語\"), 3);" },
      { name: "a thousand emoji", body: "assert.equal(properLength(String.fromCodePoint(128512).repeat(1000)), 1000);" },
      { name: "it differs from .length for astral characters", body: "const s = String.fromCodePoint(128512);\nassert.equal(s.length, 2);\nassert.equal(properLength(s), 1);" },
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
      { name: "cancelled is a dead end", body: "const o = createOrderMachine();\no.transition(\"cancelled\");\nfor (const next of [\"placed\", \"shipped\", \"delivered\", \"cancelled\"]) assert.throws(() => o.transition(next));" },
      { name: "delivered is a dead end", body: "const o = createOrderMachine();\no.transition(\"shipped\");\no.transition(\"delivered\");\nfor (const next of [\"placed\", \"shipped\", \"delivered\", \"cancelled\"]) assert.throws(() => o.transition(next));" },
      { name: "you cannot go backwards", body: "const o = createOrderMachine();\no.transition(\"shipped\");\nassert.throws(() => o.transition(\"placed\"));" },
      { name: "a shipped order cannot be cancelled", body: "const o = createOrderMachine();\no.transition(\"shipped\");\nassert.throws(() => o.transition(\"cancelled\"));" },
      { name: "a failed transition leaves the state unchanged", body: "const o = createOrderMachine();\ntry { o.transition(\"delivered\"); } catch (e) {}\nassert.equal(o.current(), \"placed\");" },
      { name: "two machines are independent", body: "const a = createOrderMachine();\nconst b = createOrderMachine();\na.transition(\"shipped\");\nassert.equal(a.current(), \"shipped\");\nassert.equal(b.current(), \"placed\");" },
      { name: "transition returns the new state", body: "const o = createOrderMachine();\nassert.equal(o.transition(\"shipped\"), \"shipped\");" },
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
      { name: "a single function", body: "assert.equal(compose((x) => x + 1)(1), 2);" },
      { name: "no functions returns the input", body: "assert.equal(compose()(7), 7);" },
      { name: "a string pipeline, right to left", body: "const trim = (s) => s.trim();\nconst up = (s) => s.toUpperCase();\nassert.equal(compose(trim, up)(\"  hi \"), \"HI\");\nassert.equal(compose(up, trim)(\"  hi \"), \"HI\");" },
      { name: "three functions in order", body: "const a = (x) => x + \"a\", b = (x) => x + \"b\", c = (x) => x + \"c\";\nassert.equal(compose(a, b, c)(\"\"), \"cba\");" },
      { name: "the composed function can be reused", body: "const f = compose((x) => x * 2, (x) => x + 1);\nassert.equal(f(1), 4);\nassert.equal(f(2), 6);" },
      { name: "nothing runs until the composed function is called", body: "let calls = 0;\nconst f = compose(() => { calls++; return 1; });\nassert.equal(calls, 0);\nf();\nassert.equal(calls, 1);" },
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
      { name: "setting an existing key does not evict anything", body: "const c = createBoundedCache(2);\nc.set(\"a\", 1); c.set(\"b\", 2);\nc.set(\"a\", 9);\nassert.equal(c.size(), 2);\nassert.equal(c.get(\"b\"), 2);\nassert.equal(c.get(\"a\"), 9);" },
      { name: "a missing key is undefined", body: "const c = createBoundedCache(2);\nassert.equal(c.get(\"nope\"), undefined);" },
      { name: "the size never exceeds the maximum over 1,000 inserts", body: "const c = createBoundedCache(10);\nfor (let i = 0; i < 1000; i++) { c.set(\"k\" + i, i); assert.ok(c.size() <= 10); }\nassert.equal(c.size(), 10);" },
      { name: "the oldest entries go first", body: "const c = createBoundedCache(3);\nfor (const k of [\"a\", \"b\", \"c\", \"d\"]) c.set(k, k);\nassert.equal(c.get(\"a\"), undefined);\nassert.equal(c.get(\"b\"), \"b\");\nassert.equal(c.get(\"d\"), \"d\");" },
      { name: "a cache of size one keeps only the latest", body: "const c = createBoundedCache(1);\nc.set(\"a\", 1); c.set(\"b\", 2);\nassert.equal(c.size(), 1);\nassert.equal(c.get(\"a\"), undefined);\nassert.equal(c.get(\"b\"), 2);" },
      { name: "falsy values are stored like any other", body: "const c = createBoundedCache(3);\nc.set(\"z\", 0);\nc.set(\"e\", \"\");\nassert.equal(c.get(\"z\"), 0);\nassert.equal(c.get(\"e\"), \"\");\nassert.equal(c.size(), 2);" },
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
      { name: "a batch size of one", body: "assert.deepEqual(processInBatches([1, 2, 3], 1, (x) => x + 1), [2, 3, 4]);" },
      { name: "an exact multiple of the batch size", body: "assert.deepEqual(processInBatches([1, 2, 3, 4], 2, (x) => x * 10), [10, 20, 30, 40]);" },
      { name: "a smaller last batch", body: "assert.deepEqual(processInBatches([1, 2, 3, 4, 5, 6, 7], 3, (x) => -x), [-1, -2, -3, -4, -5, -6, -7]);" },
      { name: "fn is called once per item, in order", body: "const seen = [];\nprocessInBatches([5, 6, 7, 8], 3, (x) => { seen.push(x); return x; });\nassert.deepEqual(seen, [5, 6, 7, 8]);" },
      { name: "the input array is not changed", body: "const src = [1, 2, 3];\nprocessInBatches(src, 2, (x) => x * 2);\nassert.deepEqual(src, [1, 2, 3]);" },
      { name: "a hundred thousand items", body: "const items = Array.from({ length: 100000 }, (_, i) => i);\nconst out = processInBatches(items, 1000, (x) => x + 1);\nassert.equal(out.length, 100000);\nassert.equal(out[99999], 100000);" },
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
      { name: "single quotes", body: "assert.equal(escapeHtml(\"it's\"), \"it&#39;s\");" },
      { name: "an already escaped ampersand is escaped again", body: "assert.equal(escapeHtml(\"&amp;\"), \"&amp;amp;\");" },
      { name: "all five characters at once", body: "assert.equal(escapeHtml(\"<a href=\\\"x\\\" title='y'>&</a>\"), \"&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;\");" },
      { name: "the empty string", body: "assert.equal(escapeHtml(\"\"), \"\");" },
      { name: "an attribute breakout attempt is neutralised", body: "assert.equal(escapeHtml(\"\\\" onmouseover=\\\"alert(1)\"), \"&quot; onmouseover=&quot;alert(1)\");" },
      { name: "non-ASCII text is left alone", body: "assert.equal(escapeHtml(\"café 日本語 😀\"), \"café 日本語 😀\");" },
      { name: "the result never contains an angle bracket or a raw quote", body: "const nasty = \"<>\\\"'&<script>\\\"'\";\nconst out = escapeHtml(nasty);\nassert.ok(!/[<>\"']/.test(out));" },
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
      { name: "a constructor.prototype payload does not pollute either", body: "const malicious = JSON.parse('{\"constructor\": {\"prototype\": {\"polluted\": true}}}');\nsafeMerge({}, malicious);\nassert.equal(({}).polluted, undefined);" },
      { name: "a deeper __proto__ payload is blocked too", body: "const malicious = JSON.parse('{\"a\": {\"__proto__\": {\"deep\": true}}}');\nsafeMerge({}, malicious);\nassert.equal(({}).deep, undefined);" },
      { name: "nested objects merge into existing ones", body: "assert.deepEqual(safeMerge({ a: { x: 1 } }, { a: { y: 2 } }), { a: { x: 1, y: 2 } });" },
      { name: "the source object is not modified", body: "const src = { a: { b: 1 } };\nsafeMerge({}, src);\nassert.deepEqual(src, { a: { b: 1 } });" },
      { name: "the target is returned", body: "const t = { a: 1 };\nassert.equal(safeMerge(t, { b: 2 }), t);" },
      { name: "primitives overwrite objects and vice versa", body: "assert.deepEqual(safeMerge({ a: { x: 1 } }, { a: 5 }), { a: 5 });\nassert.deepEqual(safeMerge({ a: 5 }, { a: { x: 1 } }), { a: { x: 1 } });" },
      { name: "Object.prototype stays clean after several attacks", body: "for (const p of ['{\"__proto__\":{\"p1\":1}}', '{\"constructor\":{\"prototype\":{\"p2\":2}}}']) safeMerge({}, JSON.parse(p));\nassert.equal(Object.keys(Object.prototype).length, 0);" },
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
      { name: "depth 0 returns a shallow copy", body: "const src = [1, [2]];\nconst out = myFlat(src, 0);\nassert.deepEqual(out, [1, [2]]);\nassert.notEqual(out, src);" },
      { name: "empty arrays inside disappear", body: "assert.deepEqual(myFlat([1, [], [2, []]], Infinity), [1, 2]);" },
      { name: "the input is not modified", body: "const src = [1, [2, [3]]];\nmyFlat(src, Infinity);\nassert.deepEqual(src, [1, [2, [3]]]);" },
      { name: "objects and strings are not flattened", body: "assert.deepEqual(myFlat([{ a: 1 }, [\"ab\", [{ b: 2 }]]], Infinity), [{ a: 1 }, \"ab\", { b: 2 }]);" },
      { name: "a thousand levels deep", body: "let nested = [1];\nfor (let i = 0; i < 1000; i++) nested = [nested];\nassert.deepEqual(myFlat(nested, Infinity), [1]);" },
      { name: "it matches the built-in on assorted inputs", body: "const cases = [[[], 1], [[1, [2, [3, [4]]]], 3], [[[[1]]], 1], [[1, 2, [3]], 5]];\nfor (const [arr, d] of cases) assert.deepEqual(myFlat(arr, d), arr.flat(d));" },
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
      { name: "the root counts when it matches", body: "assert.equal(countNodesByType({ type: \"A\", children: [{ type: \"A\", children: [] }] }, \"A\"), 2);" },
      { name: "type names are case-sensitive", body: "assert.equal(countNodesByType({ type: \"Literal\", children: [] }, \"literal\"), 0);" },
      { name: "nodes without a children property are fine", body: "assert.equal(countNodesByType({ type: \"P\", children: [{ type: \"L\" }, { type: \"L\" }] }, \"L\"), 2);" },
      { name: "a null root counts nothing", body: "assert.equal(countNodesByType(null, \"A\"), 0);" },
      { name: "a chain of three thousand nodes", body: "let node = { type: \"leaf\", children: [] };\nfor (let i = 0; i < 3000; i++) node = { type: i % 2 ? \"x\" : \"y\", children: [node] };\nassert.equal(countNodesByType(node, \"x\") + countNodesByType(node, \"y\") + countNodesByType(node, \"leaf\"), 3001);" },
      { name: "a very wide tree", body: "const kids = Array.from({ length: 10000 }, (_, i) => ({ type: i % 5 === 0 ? \"hit\" : \"miss\", children: [] }));\nassert.equal(countNodesByType({ type: \"root\", children: kids }, \"hit\"), 2000);" },
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
      { name: "a rate of 50 percent", body: "assert.equal(calculateTotal(10, 0.5), 15);" },
      { name: "a rate of 100 percent doubles the price", body: "assert.equal(calculateTotal(4, 1), 8);" },
      { name: "a negative price is a refund with tax", body: "assert.equal(calculateTotal(-100, 0.2), -120);" },
      { name: "the same inputs always give the same output", body: "const a = calculateTotal(1000, 0.25);\nfor (let i = 0; i < 10; i++) assert.equal(calculateTotal(1000, 0.25), a);\nassert.equal(a, 1250);" },
      { name: "different rates in a row do not affect each other", body: "assert.equal(calculateTotal(100, 0), 100);\nassert.equal(calculateTotal(100, 1), 200);\nassert.equal(calculateTotal(100, 0), 100);" },
      { name: "it needs both arguments: the tax rate is not remembered", body: "const withRate = calculateTotal(100, 0.5);\nconst other = calculateTotal(100, 0.25);\nassert.notEqual(withRate, other);" },
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
      { name: "the real clock: a timestamp long in the past is expired", body: "assert.equal(isExpired(0), true);" },
      { name: "the real clock: a timestamp far in the future is not", body: "assert.equal(isExpired(Date.now() + 1e9), false);" },
      { name: "the clock is called exactly once", body: "let calls = 0;\nisExpired(10, () => { calls++; return 5; });\nassert.equal(calls, 1);" },
      { name: "fractional milliseconds compare exactly", body: "assert.equal(isExpired(1000.5, () => 1000.6), true);\nassert.equal(isExpired(1000.5, () => 1000.4), false);" },
      { name: "negative timestamps", body: "assert.equal(isExpired(-5, () => 0), true);\nassert.equal(isExpired(5, () => -5), false);" },
      { name: "the answer is a real boolean", body: "assert.type(isExpired(1, () => 2), \"boolean\");\nassert.type(isExpired(2, () => 1), \"boolean\");" },
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
      { name: "doubling continues correctly before the cap", body: "assert.equal(backoffDelay(5), 16000);" },
      { name: "the first attempt that would exceed max gets capped", body: "assert.equal(backoffDelay(6), 30000);" },
      { name: "custom base and max together", body: "assert.equal(backoffDelay(2, 100, 300), 300);\nassert.equal(backoffDelay(1, 100, 1000), 200);" },
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
      { name: "it starts at zero and allows a retry", body: "const t = createReconnectTracker(3);\nassert.equal(t.attemptCount(), 0);\nassert.equal(t.shouldRetry(), true);" },
      { name: "a limit of zero never retries", body: "assert.equal(createReconnectTracker(0).shouldRetry(), false);" },
      { name: "attempts past the limit keep counting", body: "const t = createReconnectTracker(2);\nfor (let i = 0; i < 4; i++) t.recordAttempt();\nassert.equal(t.attemptCount(), 4);\nassert.equal(t.shouldRetry(), false);" },
      { name: "after a success all attempts are available again", body: "const t = createReconnectTracker(2);\nt.recordAttempt(); t.recordAttempt();\nt.recordSuccess();\nt.recordAttempt();\nassert.equal(t.shouldRetry(), true);\nt.recordAttempt();\nassert.equal(t.shouldRetry(), false);" },
      { name: "two trackers are independent", body: "const a = createReconnectTracker(1);\nconst b = createReconnectTracker(1);\na.recordAttempt();\nassert.equal(a.shouldRetry(), false);\nassert.equal(b.shouldRetry(), true);" },
      { name: "shouldRetry does not change the count", body: "const t = createReconnectTracker(3);\nt.shouldRetry(); t.shouldRetry();\nassert.equal(t.attemptCount(), 0);" },
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
      { name: "a cached falsy value is still a hit", body: "const cache = new Map([[\"zero\", 0], [\"empty\", \"\"]]);\nlet calls = 0;\nconst network = async () => { calls++; return \"net\"; };\nassert.equal(await cacheFirst(cache, network, \"zero\"), 0);\nassert.equal(await cacheFirst(cache, network, \"empty\"), \"\");\nassert.equal(calls, 0);" },
      { name: "a network failure propagates and nothing is cached", body: "const cache = new Map();\nlet msg = \"\";\ntry { await cacheFirst(cache, async () => { throw new Error(\"offline\"); }, \"k\"); } catch (e) { msg = e.message; }\nassert.equal(msg, \"offline\");\nassert.equal(cache.has(\"k\"), false);" },
      { name: "different keys are fetched separately", body: "const cache = new Map();\nconst asked = [];\nconst network = async (k) => { asked.push(k); return k + \"!\"; };\nawait cacheFirst(cache, network, \"a\");\nawait cacheFirst(cache, network, \"b\");\nassert.deepEqual(asked, [\"a\", \"b\"]);" },
      { name: "the fetched value is stored under the key", body: "const cache = new Map();\nawait cacheFirst(cache, async () => \"value\", \"k\");\nassert.equal(cache.get(\"k\"), \"value\");" },
      { name: "the network is called with the key", body: "let got;\nawait cacheFirst(new Map(), async (k) => { got = k; return 1; }, \"the-key\");\nassert.equal(got, \"the-key\");" },
      { name: "it returns a promise", body: "assert.ok(cacheFirst(new Map([[\"a\", 1]]), async () => 2, \"a\") instanceof Promise);" },
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
      { name: "a cookie wins over everything else", body: "assert.equal(pickStorage({ sizeMB: 100, structured: true, mustSurviveTabClose: false, sentToServer: true }), \"cookie\");" },
      { name: "exactly five megabytes is not big", body: "assert.equal(pickStorage({ sizeMB: 5, structured: false, mustSurviveTabClose: true, sentToServer: false }), \"localStorage\");" },
      { name: "small but structured data goes to IndexedDB", body: "assert.equal(pickStorage({ sizeMB: 0.01, structured: true, mustSurviveTabClose: true, sentToServer: false }), \"IndexedDB\");" },
      { name: "big data goes to IndexedDB even if it only needs the tab", body: "assert.equal(pickStorage({ sizeMB: 6, structured: false, mustSurviveTabClose: false, sentToServer: false }), \"IndexedDB\");" },
      { name: "just over the size limit", body: "assert.equal(pickStorage({ sizeMB: 5.01, structured: false, mustSurviveTabClose: true, sentToServer: false }), \"IndexedDB\");" },
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
      "function decodeJwtPayload(token) {\n  // TODO: split on \".\", take segment 1, turn base64url into base64, then atob + JSON.parse it\n}\n",
    hints: [
      'token.split(".") gives you [header, payload, signature] — index 1 is the one you want.',
      "JWTs use base64url: swap - for + and _ for / first, or tokens containing those characters make atob throw.",
      "atob(part) base64-decodes to a JSON string; JSON.parse the result.",
    ],
    solution: 'function decodeJwtPayload(token) {\n  const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");\n  return JSON.parse(atob(payload));\n}\n',
    tests: [
      {
        name: "decodes a real payload segment",
        body: 'const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkFuYSJ9.sig";\nassert.deepEqual(decodeJwtPayload(token), { sub: "user123", name: "Ana" });',
      },
      {
        name: "handles base64url characters and missing padding",
        body: 'const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMTIzIiwibm90ZSI6IkFuYT8-In0.sig";\nassert.deepEqual(decodeJwtPayload(token), { sub: "user123", note: "Ana?>" });',
      },
      { name: "numbers, booleans and nesting survive", body: "const b64 = (o) => btoa(JSON.stringify(o)).replace(/\\+/g, \"-\").replace(/\\//g, \"_\").replace(/=+$/, \"\");\nconst payload = { n: 1, ok: true, nested: { list: [1, 2] } };\nassert.deepEqual(decodeJwtPayload(\"h.\" + b64(payload) + \".s\"), payload);" },
      { name: "a payload whose base64 contains plus and slash", body: "const b64 = (o) => btoa(JSON.stringify(o)).replace(/\\+/g, \"-\").replace(/\\//g, \"_\").replace(/=+$/, \"\");\nconst payload = { x: \"~~~???>>>\" };\nconst seg = b64(payload);\nassert.ok(/[-_]/.test(seg) || true);\nassert.deepEqual(decodeJwtPayload(\"h.\" + seg + \".s\"), payload);" },
      { name: "every padding length works", body: "const b64 = (o) => btoa(JSON.stringify(o)).replace(/\\+/g, \"-\").replace(/\\//g, \"_\").replace(/=+$/, \"\");\nfor (const v of [\"a\", \"ab\", \"abc\", \"abcd\", \"abcde\"]) {\n  const p = { v };\n  assert.deepEqual(decodeJwtPayload(\"h.\" + b64(p) + \".s\"), p, v);\n}" },
      { name: "the header and signature are ignored", body: "const b64 = (o) => btoa(JSON.stringify(o)).replace(/\\+/g, \"-\").replace(/\\//g, \"_\").replace(/=+$/, \"\");\nassert.deepEqual(decodeJwtPayload(\"garbage.\" + b64({ a: 1 }) + \".alsogarbage\"), { a: 1 });" },
      { name: "many random ASCII payloads round trip", body: "const b64 = (o) => btoa(JSON.stringify(o)).replace(/\\+/g, \"-\").replace(/\\//g, \"_\").replace(/=+$/, \"\");\nlet x = 3;\nfor (let i = 0; i < 100; i++) {\n  let s = \"\";\n  for (let k = 0; k < 1 + (i % 17); k++) { x = (x * 1103515245 + 12345) & 0x7fffffff; s += String.fromCharCode(32 + (x % 95)); }\n  const p = { s, i };\n  assert.deepEqual(decodeJwtPayload(\"h.\" + b64(p) + \".s\"), p);\n}" },
      { name: "negative numbers and floats survive", body: "const b64 = (o) => btoa(JSON.stringify(o)).replace(/\\+/g, \"-\").replace(/\\//g, \"_\").replace(/=+$/, \"\");\nconst payload = { temp: -12.5, count: -1 };\nassert.deepEqual(decodeJwtPayload(\"h.\" + b64(payload) + \".s\"), payload);" },
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
      { name: "exactly at expiry is not yet expired", body: "assert.equal(isTokenExpired({ exp: 1000 }, () => 1000), false);" },
      { name: "the real clock: a token that expired long ago", body: "assert.equal(isTokenExpired({ exp: 1 }), true);" },
      { name: "the real clock is in seconds: an hour from now is valid", body: "assert.equal(isTokenExpired({ exp: Date.now() / 1000 + 3600 }), false);" },
      { name: "a millisecond timestamp mistaken for seconds is far in the future", body: "assert.equal(isTokenExpired({ exp: Date.now() }), false);" },
      { name: "the clock is called exactly once", body: "let calls = 0;\nisTokenExpired({ exp: 10 }, () => { calls++; return 5; });\nassert.equal(calls, 1);" },
      { name: "fractional seconds", body: "assert.equal(isTokenExpired({ exp: 100.5 }, () => 100.6), true);\nassert.equal(isTokenExpired({ exp: 100.5 }, () => 100.4), false);" },
    ],
  },
  {
    id: "ex-todo-toggle",
    chapter: "guided-project-todo",
    level: "beginner",
    title: "Tick a to-do off, without mutating",
    brief:
      '<p>The to-do app keeps one rule: the array is the truth, and the DOM is a picture of it. Every update therefore returns a <b>new</b> array instead of editing the old one — that is what lets you re-render from state and compare before/after.</p><p>Write <code>toggleTodo(todos, id)</code> that returns a new array where the matching to-do has its <code>done</code> flipped.</p><ul><li>the original array and its objects must be left untouched</li><li>to-dos that did not change should be the <em>same object</em> in the new array</li><li>an id that matches nothing just returns an equivalent list</li></ul>',
    starter:
      'function toggleTodo(todos, id) {\n  // TODO: map, and replace only the one that matches\n}\n\nconst todos = [{ id: 1, text: "ship it", done: false }];\nconsole.log(toggleTodo(todos, 1)); // [{ id: 1, text: "ship it", done: true }]\nconsole.log(todos[0].done);        // still false\n',
    hints: [
      "map gives you a new array for free — the question is only what you return for each item.",
      "For the matching one, build a fresh object with spread: { ...todo, done: !todo.done }.",
      "For every other one, return the item itself. Do not copy it — reusing the reference is the point.",
    ],
    solution:
      "function toggleTodo(todos, id) {\n  return todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));\n}\n",
    tests: [
      {
        name: "flips the matching to-do",
        body: 'const next = toggleTodo([{ id: 1, text: "a", done: false }], 1);\nassert.equal(next[0].done, true);',
      },
      {
        name: "flips a done one back to not done",
        body: 'assert.equal(toggleTodo([{ id: 7, text: "a", done: true }], 7)[0].done, false);',
      },
      {
        name: "leaves the original array and object alone",
        body: 'const todos = [{ id: 1, text: "a", done: false }];\nconst next = toggleTodo(todos, 1);\nassert.equal(todos[0].done, false, "the original object was mutated");\nassert.ok(next !== todos, "you returned the same array — re-rendering will not notice a change");',
      },
      {
        name: "untouched to-dos keep their identity",
        body: 'const todos = [{ id: 1, text: "a", done: false }, { id: 2, text: "b", done: false }];\nconst next = toggleTodo(todos, 1);\nassert.ok(next[1] === todos[1], "unchanged items should be reused, not copied");',
      },
      {
        name: "an unknown id changes nothing",
        body: 'const todos = [{ id: 1, text: "a", done: false }];\nassert.deepEqual(toggleTodo(todos, 99), todos);',
      },
      { name: "toggling twice restores the original done value on a new object", body: "const todos = [{ id: 1, text: \"a\", done: false }];\nconst once = toggleTodo(todos, 1);\nconst twice = toggleTodo(once, 1);\nassert.equal(twice[0].done, false);\nassert.ok(twice[0] !== todos[0]);" },
      { name: "extra fields on a to-do are preserved", body: "const todos = [{ id: 1, text: \"a\", done: false, priority: \"high\" }];\nconst next = toggleTodo(todos, 1);\nassert.equal(next[0].priority, \"high\");\nassert.equal(next[0].text, \"a\");" },
      { name: "toggles the right item among several, keeping order", body: "const todos = [{ id: 1, done: false }, { id: 2, done: false }, { id: 3, done: false }];\nconst next = toggleTodo(todos, 2);\nassert.deepEqual(next.map((t) => t.done), [false, true, false]);\nassert.equal(next.length, 3);" },
    ],
  },
  {
    id: "ex-todo-filter",
    chapter: "guided-project-todo",
    level: "beginner",
    title: "The filter bar and the items-left count",
    brief:
      '<p>The other half of the to-do app is derived state: what to show, and how many are left. Neither is stored — both are computed from the one array every time it renders.</p><p>Write <code>summarise(todos, filter)</code> returning <code>{ visible, remaining }</code>:</p><ul><li><code>visible</code> — the to-dos to render: everything for <code>"all"</code>, the unfinished ones for <code>"active"</code>, the finished ones for <code>"completed"</code></li><li><code>remaining</code> — how many are not done, <b>regardless of the filter</b>. "2 items left" does not change just because you are looking at the Completed tab.</li></ul>',
    starter:
      'function summarise(todos, filter) {\n  // TODO: one filtered list to show, one count that ignores the filter\n}\n\nconst todos = [{ id: 1, done: false }, { id: 2, done: true }];\nconsole.log(summarise(todos, "completed")); // { visible: [{ id: 2, done: true }], remaining: 1 }\n',
    hints: [
      "Two separate filters. The one for remaining never looks at the filter argument.",
      'For "all", the predicate is just true.',
      "remaining is a count, not a list — .filter(...).length gets you there.",
    ],
    solution:
      'function summarise(todos, filter) {\n  const visible = todos.filter((todo) => {\n    if (filter === "active") return !todo.done;\n    if (filter === "completed") return todo.done;\n    return true;\n  });\n  const remaining = todos.filter((todo) => !todo.done).length;\n  return { visible, remaining };\n}\n',
    tests: [
      {
        name: '"all" shows everything',
        body: 'const todos = [{ id: 1, done: false }, { id: 2, done: true }];\nassert.deepEqual(summarise(todos, "all").visible, todos);',
      },
      {
        name: '"active" hides the finished ones',
        body: 'assert.deepEqual(summarise([{ id: 1, done: false }, { id: 2, done: true }], "active").visible, [{ id: 1, done: false }]);',
      },
      {
        name: '"completed" shows only the finished ones',
        body: 'assert.deepEqual(summarise([{ id: 1, done: false }, { id: 2, done: true }], "completed").visible, [{ id: 2, done: true }]);',
      },
      {
        name: "remaining ignores the filter completely",
        body: 'const todos = [{ id: 1, done: false }, { id: 2, done: false }, { id: 3, done: true }];\nassert.equal(summarise(todos, "completed").remaining, 2);\nassert.equal(summarise(todos, "active").remaining, 2);\nassert.equal(summarise(todos, "all").remaining, 2);',
      },
      {
        name: "an empty list is an empty list",
        body: 'assert.deepEqual(summarise([], "all"), { visible: [], remaining: 0 });',
      },
      { name: "everything is done: active is empty and remaining is zero", body: "const todos = [{ id: 1, done: true }, { id: 2, done: true }];\nassert.deepEqual(summarise(todos, \"active\").visible, []);\nassert.equal(summarise(todos, \"active\").remaining, 0);" },
      { name: "nothing is done: completed is empty but remaining counts them all", body: "const todos = [{ id: 1, done: false }, { id: 2, done: false }];\nassert.deepEqual(summarise(todos, \"completed\").visible, []);\nassert.equal(summarise(todos, \"completed\").remaining, 2);" },
      { name: "an unrecognised filter behaves like all", body: "const todos = [{ id: 1, done: false }, { id: 2, done: true }];\nassert.deepEqual(summarise(todos, \"bogus\").visible, todos);" },
    ],
  },
  {
    id: "ex-promise-chain",
    chapter: "basic-async",
    level: "beginner",
    title: "Run promises one after another",
    brief:
      '<p><code>Promise.all</code> starts everything at once. Sometimes you need the opposite: each step must finish before the next one begins — a queue of uploads, or steps that hit a rate-limited API.</p><p>Write <code>sequence(tasks)</code>, where <code>tasks</code> is an array of functions that each return a promise. Run them <b>one at a time, in order</b>, and resolve with an array of their results in the same order.</p><ul><li>a task must not start until the one before it has finished</li><li>if any task rejects, the whole thing rejects</li></ul>',
    starter:
      'function sequence(tasks) {\n  // TODO: await each task in turn, collecting results\n}\n\nconst wait = (ms, v) => () => new Promise((r) => setTimeout(() => r(v), ms));\nsequence([wait(20, "a"), wait(10, "b")]).then((out) => console.log(out)); // ["a", "b"]\n',
    hints: [
      "An async function plus a for...of loop is the shortest honest version — push each awaited result onto an array.",
      "Remember the tasks are functions, not promises. Call task() to start it, and not before you want it to start.",
      "A rejection inside an async function already propagates on its own — you do not need to catch and re-throw.",
    ],
    solution:
      "async function sequence(tasks) {\n  const results = [];\n  for (const task of tasks) {\n    results.push(await task());\n  }\n  return results;\n}\n",
    tests: [
      {
        name: "results come back in order",
        body: 'const wait = (ms, v) => () => new Promise((r) => setTimeout(() => r(v), ms));\nassert.deepEqual(await sequence([wait(20, "a"), wait(1, "b"), wait(1, "c")]), ["a", "b", "c"]);',
      },
      {
        name: "an empty list resolves to an empty array",
        body: "assert.deepEqual(await sequence([]), []);",
      },
      {
        name: "each task finishes before the next one starts",
        body: 'const log = [];\nconst task = (name) => () =>\n  new Promise((r) => {\n    log.push("start " + name);\n    setTimeout(() => { log.push("end " + name); r(name); }, 10);\n  });\nawait sequence([task("a"), task("b")]);\nassert.deepEqual(log, ["start a", "end a", "start b", "end b"], "they overlapped — that is Promise.all behaviour, not sequential");',
      },
      {
        name: "a rejecting task rejects the whole run",
        body: 'const ok = () => Promise.resolve(1);\nconst bad = () => Promise.reject(new Error("nope"));\nlet threw = false;\ntry {\n  await sequence([ok, bad, ok]);\n} catch (e) {\n  threw = e.message === "nope";\n}\nassert.ok(threw, "the rejection should have come out of sequence()");',
      },
      {
        name: "it returns a promise rather than an array",
        body: 'const out = sequence([() => Promise.resolve(1)]);\nassert.type(out.then, "function", "sequence must return a promise");\nassert.deepEqual(await out, [1]);',
      },
      { name: "a single task resolves to a one-element array", body: "assert.deepEqual(await sequence([() => Promise.resolve(42)]), [42]);" },
      { name: "an early rejection stops any later task from starting", body: "let secondStarted = false;\nconst bad = () => Promise.reject(new Error(\"fail first\"));\nconst later = () => { secondStarted = true; return Promise.resolve(\"x\"); };\nlet threw = false;\ntry {\n  await sequence([bad, later]);\n} catch (e) {\n  threw = true;\n}\nassert.ok(threw);\nassert.equal(secondStarted, false, \"a later task ran after an earlier one rejected\");" },
      { name: "synchronously-resolving tasks still run strictly in order", body: "const order = [];\nconst make = (n) => () => { order.push(n); return Promise.resolve(n); };\nconst out = await sequence([make(1), make(2), make(3)]);\nassert.deepEqual(order, [1, 2, 3]);\nassert.deepEqual(out, [1, 2, 3]);" },
    ],
  },
{
    id: "ex-debounce-fn",
    chapter: "build-it-yourself",
    level: "advanced",
    title: "Write debounce from scratch",
    brief:
      "<p>Write <code>debounce(fn, wait)</code> returning a new function that only actually calls <code>fn</code> once calls stop arriving for <code>wait</code> ms — and every new call resets that wait.</p><ul><li>Calling the debounced function several times quickly should only run <code>fn</code> once, with the <b>last</b> call's arguments</li><li>Preserve <code>this</code> and pass every argument through</li></ul>",
    starter: "function debounce(fn, wait) {\n  // TODO\n}\n",
    hints: [
      "clearTimeout the previous timer on every call, before scheduling a new one.",
      "fn.apply(this, args) inside the returned function keeps both this and the arguments intact.",
    ],
    solution:
      "function debounce(fn, wait) {\n  let timer;\n  return function (...args) {\n    clearTimeout(timer);\n    const context = this;\n    timer = setTimeout(() => fn.apply(context, args), wait);\n  };\n}\n",
    tests: [
      {
        name: "only the last call in a burst actually runs",
        body: 'const calls = [];\nconst debounced = debounce((x) => calls.push(x), 20);\ndebounced(1);\ndebounced(2);\ndebounced(3);\nawait new Promise((r) => setTimeout(r, 60));\nassert.deepEqual(calls, [3]);',
      },
      {
        name: "runs again after the wait period fully passes",
        body: 'const calls = [];\nconst debounced = debounce((x) => calls.push(x), 15);\ndebounced("a");\nawait new Promise((r) => setTimeout(r, 45));\ndebounced("b");\nawait new Promise((r) => setTimeout(r, 45));\nassert.deepEqual(calls, ["a", "b"]);',
      },
      {
        name: "preserves this",
        body: 'const obj = { value: 42, calls: [] };\nobj.record = debounce(function () { this.calls.push(this.value); }, 10);\nobj.record();\nawait new Promise((r) => setTimeout(r, 30));\nassert.deepEqual(obj.calls, [42]);',
      },
      { name: "nothing runs synchronously", body: "const calls = [];\nconst d = debounce((x) => calls.push(x), 20);\nd(1);\nassert.equal(calls.length, 0);\nawait new Promise((r) => setTimeout(r, 50));" },
      { name: "every call restarts the wait", body: "const calls = [];\nconst d = debounce((x) => calls.push(x), 40);\nd(1);\nawait new Promise((r) => setTimeout(r, 25));\nd(2);\nawait new Promise((r) => setTimeout(r, 25));\nd(3);\nawait new Promise((r) => setTimeout(r, 25));\nassert.equal(calls.length, 0, \"ran before the calls stopped\");\nawait new Promise((r) => setTimeout(r, 60));\nassert.deepEqual(calls, [3]);" },
      { name: "all arguments are passed through", body: "let got;\nconst d = debounce((...args) => { got = args; }, 10);\nd(1, \"two\", { three: 3 });\nawait new Promise((r) => setTimeout(r, 40));\nassert.deepEqual(got, [1, \"two\", { three: 3 }]);" },
      { name: "two debounced functions do not share a timer", body: "const calls = [];\nconst a = debounce(() => calls.push(\"a\"), 15);\nconst b = debounce(() => calls.push(\"b\"), 15);\na(); b();\nawait new Promise((r) => setTimeout(r, 50));\nassert.deepEqual([...calls].sort(), [\"a\", \"b\"]);" },
      { name: "a debounced function that is never called never runs fn", body: "let n = 0;\ndebounce(() => n++, 10);\nawait new Promise((r) => setTimeout(r, 30));\nassert.equal(n, 0);" },
      { name: "a burst of one hundred calls runs fn once", body: "let n = 0;\nconst d = debounce(() => n++, 20);\nfor (let i = 0; i < 100; i++) d(i);\nawait new Promise((r) => setTimeout(r, 60));\nassert.equal(n, 1);" },
    ],
  },
{
    id: "ex-build-lru-cache",
    chapter: "build-it-yourself",
    level: "advanced",
    title: "Build an LRU cache",
    brief:
      "<p>Implement <code>LRUCache</code> with a fixed <code>capacity</code>:</p><ul><li><code>get(key)</code> returns the stored value, or <code>undefined</code>, and marks the key as most recently used</li><li><code>put(key, value)</code> stores it, marking it most recently used; if this pushes the cache over capacity, evict the <b>least</b> recently used key</li></ul>",
    starter:
      "class LRUCache {\n  constructor(capacity) {\n    // TODO\n  }\n  get(key) {\n    // TODO\n  }\n  put(key, value) {\n    // TODO\n  }\n}\n",
    hints: [
      "A Map remembers insertion order — delete then re-set a key to move it to the 'most recent' end.",
      "map.keys().next().value is the map's current oldest key — the one to evict at capacity.",
    ],
    solution:
      "class LRUCache {\n  #capacity;\n  #map = new Map();\n  constructor(capacity) {\n    this.#capacity = capacity;\n  }\n  get(key) {\n    if (!this.#map.has(key)) return undefined;\n    const value = this.#map.get(key);\n    this.#map.delete(key);\n    this.#map.set(key, value);\n    return value;\n  }\n  put(key, value) {\n    this.#map.delete(key);\n    this.#map.set(key, value);\n    if (this.#map.size > this.#capacity) {\n      this.#map.delete(this.#map.keys().next().value);\n    }\n  }\n}\n",
    tests: [
      {
        name: "returns undefined for a missing key",
        body: 'const c = new LRUCache(2);\nassert.equal(c.get("x"), undefined);',
      },
      {
        name: "stores and retrieves values",
        body: 'const c = new LRUCache(2);\nc.put("a", 1);\nassert.equal(c.get("a"), 1);',
      },
      {
        name: "evicts the least recently used key once over capacity",
        body: 'const c = new LRUCache(2);\nc.put("a", 1);\nc.put("b", 2);\nc.put("c", 3);\nassert.equal(c.get("a"), undefined);\nassert.equal(c.get("b"), 2);\nassert.equal(c.get("c"), 3);',
      },
      {
        name: "a get() refreshes recency, saving a key from eviction",
        body: 'const c = new LRUCache(2);\nc.put("a", 1);\nc.put("b", 2);\nc.get("a");\nc.put("c", 3);\nassert.equal(c.get("b"), undefined);\nassert.equal(c.get("a"), 1);\nassert.equal(c.get("c"), 3);',
      },
      { name: "a capacity of one keeps only the newest key", body: "const c = new LRUCache(1);\nc.put(\"a\", 1); c.put(\"b\", 2);\nassert.equal(c.get(\"a\"), undefined);\nassert.equal(c.get(\"b\"), 2);" },
      { name: "putting an existing key updates it and refreshes it", body: "const c = new LRUCache(2);\nc.put(\"a\", 1); c.put(\"b\", 2);\nc.put(\"a\", 9);\nc.put(\"c\", 3);\nassert.equal(c.get(\"b\"), undefined);\nassert.equal(c.get(\"a\"), 9);\nassert.equal(c.get(\"c\"), 3);" },
      { name: "a miss does not disturb the order", body: "const c = new LRUCache(2);\nc.put(\"a\", 1); c.put(\"b\", 2);\nc.get(\"zzz\");\nc.put(\"c\", 3);\nassert.equal(c.get(\"a\"), undefined);\nassert.equal(c.get(\"b\"), 2);" },
      { name: "falsy values are cached like any other", body: "const c = new LRUCache(2);\nc.put(\"z\", 0); c.put(\"e\", \"\");\nassert.equal(c.get(\"z\"), 0);\nassert.equal(c.get(\"e\"), \"\");" },
      { name: "random operations agree with a simple model", body: "const cap = 5;\nconst c = new LRUCache(cap);\nlet model = [];\nlet x = 17;\nfor (let i = 0; i < 2000; i++) {\n  x = (x * 1103515245 + 12345) & 0x7fffffff;\n  const key = \"k\" + (x % 9);\n  if (x % 2 === 0) {\n    c.put(key, i);\n    model = model.filter((e) => e[0] !== key);\n    model.push([key, i]);\n    if (model.length > cap) model.shift();\n  } else {\n    const idx = model.findIndex((e) => e[0] === key);\n    const expected = idx === -1 ? undefined : model[idx][1];\n    assert.equal(c.get(key), expected, \"op \" + i);\n    if (idx !== -1) { const e = model.splice(idx, 1)[0]; model.push(e); }\n  }\n}" },
      { name: "a hundred thousand puts stay fast and bounded", body: "const c = new LRUCache(1000);\nfor (let i = 0; i < 100000; i++) c.put(i, i);\nassert.equal(c.get(99999), 99999);\nassert.equal(c.get(99000), 99000);\nassert.equal(c.get(98999), undefined);" },
    ],
  },
{
    id: "ex-cleanup-registry",
    chapter: "engine-memory",
    level: "advanced",
    title: "Build a cleanup registry",
    brief:
      "<p>Write <code>createCleanupRegistry()</code> returning <code>{ register, disposeAll }</code>.</p><ul><li><code>register(fn)</code> adds a cleanup function to the list</li><li><code>disposeAll()</code> calls every registered function exactly once, then clears the list</li><li>Calling <code>disposeAll()</code> again (nothing newly registered) calls nothing — this is exactly the shape a component's unmount/cleanup step needs, so a leftover timer or listener is never released twice</li></ul>",
    starter:
      "function createCleanupRegistry() {\n  // TODO: track registered functions, and let disposeAll run + clear them\n}\n",
    hints: [
      "Swap the array for a new empty one BEFORE calling anything in it — that's what makes a second disposeAll() a no-op even if a cleanup function itself tries to register something new.",
      "forEach over the captured old array, not the (now empty) live one.",
    ],
    solution:
      "function createCleanupRegistry() {\n  let fns = [];\n  return {\n    register(fn) {\n      fns.push(fn);\n    },\n    disposeAll() {\n      const toRun = fns;\n      fns = [];\n      toRun.forEach((fn) => fn());\n    },\n  };\n}\n",
    tests: [
      {
        name: "disposeAll calls every registered function once",
        body: 'const r = createCleanupRegistry();\nconst calls = [];\nr.register(() => calls.push("a"));\nr.register(() => calls.push("b"));\nr.disposeAll();\nassert.deepEqual(calls, ["a", "b"]);',
      },
      {
        name: "a second disposeAll with nothing new registered calls nothing",
        body: 'const r = createCleanupRegistry();\nlet count = 0;\nr.register(() => count++);\nr.disposeAll();\nr.disposeAll();\nassert.equal(count, 1);',
      },
      {
        name: "registering after disposeAll works for a fresh round",
        body: 'const r = createCleanupRegistry();\nconst calls = [];\nr.register(() => calls.push("first"));\nr.disposeAll();\nr.register(() => calls.push("second"));\nr.disposeAll();\nassert.deepEqual(calls, ["first", "second"]);',
      },
      { name: "disposing an empty registry is harmless", body: "const r = createCleanupRegistry();\nlet threw = false;\ntry { r.disposeAll(); } catch (e) { threw = true; }\nassert.equal(threw, false);" },
      { name: "cleanups run in registration order", body: "const r = createCleanupRegistry();\nconst order = [];\nfor (let i = 0; i < 5; i++) r.register(() => order.push(i));\nr.disposeAll();\nassert.deepEqual(order, [0, 1, 2, 3, 4]);" },
      { name: "a thousand cleanups each run exactly once", body: "const r = createCleanupRegistry();\nconst counts = new Array(1000).fill(0);\ncounts.forEach((_, i) => r.register(() => counts[i]++));\nr.disposeAll();\nr.disposeAll();\nassert.ok(counts.every((c) => c === 1));" },
      { name: "two registries are independent", body: "const a = createCleanupRegistry();\nconst b = createCleanupRegistry();\nlet n = 0;\na.register(() => n++);\nb.disposeAll();\nassert.equal(n, 0);\na.disposeAll();\nassert.equal(n, 1);" },
      { name: "cleanups are called without arguments", body: "const r = createCleanupRegistry();\nlet argc = -1;\nr.register(function () { argc = arguments.length; });\nr.disposeAll();\nassert.equal(argc, 0);" },
    ],
  },
{
    id: "ex-rate-limited-reporter",
    chapter: "browser-observability",
    level: "advanced",
    title: "A rate-limited error reporter",
    brief:
      "<p>Write <code>createReporter(maxPerWindow)</code> returning <code>{ report, resetWindow, sent }</code>.</p><ul><li><code>report(message)</code> records the message and returns <code>true</code> &mdash; up to <code>maxPerWindow</code> times</li><li>Once the limit is hit, further calls return <code>false</code> and record nothing, until <code>resetWindow()</code> runs</li><li><code>sent</code> is the full list recorded so far, across every window</li></ul>",
    starter:
      "function createReporter(maxPerWindow) {\n  // TODO\n}\n",
    hints: [
      "A counter that only resets inside resetWindow() is enough — no real timers needed for this exercise.",
      "sent should keep growing across resets; only the per-window counter goes back to zero.",
    ],
    solution:
      "function createReporter(maxPerWindow) {\n  let count = 0;\n  const sent = [];\n  return {\n    report(message) {\n      if (count >= maxPerWindow) return false;\n      count++;\n      sent.push(message);\n      return true;\n    },\n    resetWindow() {\n      count = 0;\n    },\n    sent,\n  };\n}\n",
    tests: [
      {
        name: "allows up to the limit, then blocks",
        body: 'const r = createReporter(2);\nassert.equal(r.report("a"), true);\nassert.equal(r.report("b"), true);\nassert.equal(r.report("c"), false);\nassert.deepEqual(r.sent, ["a", "b"]);',
      },
      {
        name: "resetWindow allows reporting again",
        body: 'const r = createReporter(1);\nr.report("a");\nassert.equal(r.report("b"), false);\nr.resetWindow();\nassert.equal(r.report("b"), true);',
      },
      {
        name: "sent accumulates across windows",
        body: 'const r = createReporter(1);\nr.report("a");\nr.resetWindow();\nr.report("b");\nassert.deepEqual(r.sent, ["a", "b"]);',
      },
      { name: "a limit of zero blocks everything", body: "const r = createReporter(0);\nassert.equal(r.report(\"a\"), false);\nassert.deepEqual(r.sent, []);" },
      { name: "resetting with nothing sent is harmless", body: "const r = createReporter(2);\nr.resetWindow();\nassert.equal(r.report(\"a\"), true);\nassert.deepEqual(r.sent, [\"a\"]);" },
      { name: "a blocked message is never recorded, even after the reset", body: "const r = createReporter(1);\nr.report(\"a\");\nr.report(\"blocked\");\nr.resetWindow();\nr.report(\"c\");\nassert.deepEqual(r.sent, [\"a\", \"c\"]);" },
      { name: "a thousand allowed then blocked", body: "const r = createReporter(1000);\nfor (let i = 0; i < 1000; i++) assert.equal(r.report(\"m\" + i), true);\nassert.equal(r.report(\"extra\"), false);\nassert.equal(r.sent.length, 1000);" },
      { name: "two reporters do not share windows", body: "const a = createReporter(1);\nconst b = createReporter(1);\na.report(\"x\");\nassert.equal(a.report(\"y\"), false);\nassert.equal(b.report(\"y\"), true);" },
      { name: "the window can be reset many times", body: "const r = createReporter(2);\nfor (let round = 0; round < 50; round++) {\n  assert.equal(r.report(\"a\" + round), true);\n  assert.equal(r.report(\"b\" + round), true);\n  assert.equal(r.report(\"c\" + round), false);\n  r.resetWindow();\n}\nassert.equal(r.sent.length, 100);" },
    ],
  },
{
    id: "ex-mask-card-number",
    chapter: "regex-dates-apis",
    level: "intermediate",
    title: "Mask a card number down to the last 4 digits",
    brief:
      "<p>Write <code>maskCardNumber(digits)</code> that replaces every digit <b>except the last 4</b> with <code>\"*\"</code>. The input is always a plain string of digits, no spaces.</p><ul><li><code>maskCardNumber(\"4111111111111234\")</code> &rarr; <code>\"************1234\"</code></li><li>Use a lookahead &mdash; don't count characters by hand</li></ul>",
    starter: "function maskCardNumber(digits) {\n  // TODO: replace with a regex using a lookahead\n}\n",
    hints: [
      '/\\d(?=\\d{4})/g matches a digit only when at least 4 more digits follow it — exactly the ones that should become "*".',
      "The lookahead itself never gets consumed, so it correctly re-checks overlapping positions as the match moves along.",
    ],
    solution: 'function maskCardNumber(digits) {\n  return digits.replace(/\\d(?=\\d{4})/g, "*");\n}\n',
    tests: [
      { name: "masks all but the last 4 digits", body: 'assert.equal(maskCardNumber("4111111111111234"), "************1234");' },
      { name: "4 or fewer digits are left untouched", body: 'assert.equal(maskCardNumber("1234"), "1234");' },
      { name: "exactly one digit needs masking", body: 'assert.equal(maskCardNumber("12345"), "*2345");' },
      { name: "a 12-digit number", body: 'assert.equal(maskCardNumber("123456789012"), "********9012");' },
      { name: "a sixteen digit number in a different shape", body: "assert.equal(maskCardNumber(\"5500005555555559\"), \"************5559\");" },
      { name: "a nineteen digit number", body: "assert.equal(maskCardNumber(\"6011000990139424123\"), \"***************4123\");" },
      { name: "fewer than four digits", body: "assert.equal(maskCardNumber(\"12\"), \"12\");\nassert.equal(maskCardNumber(\"999\"), \"999\");" },
      { name: "the empty string", body: "assert.equal(maskCardNumber(\"\"), \"\");" },
      { name: "the length never changes and the last four survive", body: "for (let n = 1; n <= 30; n++) {\n  const digits = \"1234567890123456789012345678901234567890\".slice(0, n);\n  const out = maskCardNumber(digits);\n  assert.equal(out.length, n);\n  assert.equal(out.slice(-4), digits.slice(-4));\n  assert.ok(/^\\**\\d*$/.test(out));\n}" },
    ],
  },
{
    id: "ex-build-query-string",
    chapter: "browser-apis-deep",
    level: "intermediate",
    title: "Build a query string from an object",
    brief:
      '<p>Write <code>buildQueryString(params)</code> returning a <code>"?"</code>-prefixed query string built from a plain object.</p><ul><li><code>buildQueryString({ q: "js", page: 2 })</code> &rarr; <code>"?q=js&amp;page=2"</code></li><li>Skip any key whose value is <code>undefined</code> or <code>null</code></li><li>An empty result (no usable keys) returns <code>""</code>, not just <code>"?"</code></li></ul>',
    starter: "function buildQueryString(params) {\n  // TODO: use URLSearchParams\n}\n",
    hints: [
      "new URLSearchParams() starts empty — .set(key, value) adds one pair, and .toString() gives the encoded string with no leading '?'.",
      'Object.entries(params) lets you loop key/value pairs together and skip the null/undefined ones before calling .set.',
    ],
    solution:
      'function buildQueryString(params) {\n  const usp = new URLSearchParams();\n  for (const [key, value] of Object.entries(params)) {\n    if (value === undefined || value === null) continue;\n    usp.set(key, value);\n  }\n  const str = usp.toString();\n  return str ? "?" + str : "";\n}\n',
    tests: [
      { name: "builds a simple query string", body: 'assert.equal(buildQueryString({ q: "js", page: 2 }), "?q=js&page=2");' },
      {
        name: "skips undefined and null values",
        body: 'assert.equal(buildQueryString({ q: "js", tag: undefined, sort: null }), "?q=js");',
      },
      { name: "an empty object returns an empty string", body: 'assert.equal(buildQueryString({}), "");' },
      { name: "keeps a falsy-but-present value like 0", body: 'assert.equal(buildQueryString({ page: 0 }), "?page=0");' },
      { name: "values are percent-encoded", body: "assert.equal(buildQueryString({ q: \"a b&c\" }), \"?q=a+b%26c\");" },
      { name: "an empty string value is kept", body: "assert.equal(buildQueryString({ q: \"\" }), \"?q=\");" },
      { name: "false is kept", body: "assert.equal(buildQueryString({ flag: false }), \"?flag=false\");" },
      { name: "keys keep the object order", body: "assert.equal(buildQueryString({ b: 1, a: 2 }), \"?b=1&a=2\");" },
      { name: "keys are encoded too", body: "assert.equal(buildQueryString({ \"a b\": 1 }), \"?a+b=1\");" },
      { name: "when every value is skipped the result is empty", body: "assert.equal(buildQueryString({ a: undefined, b: null }), \"\");" },
      { name: "decimals and negative numbers", body: "assert.equal(buildQueryString({ x: 1.5, y: -2 }), \"?x=1.5&y=-2\");" },
    ],
  },
  {
    id: "ex-deep-clone",
    chapter: "build-it-yourself",
    level: "advanced",
    title: "A deep clone that survives cycles",
    brief: "<p>Write <code>deepClone(value)</code>. Primitives, <code>null</code> and functions are returned as they are. Arrays and plain objects are copied recursively, and class instances keep their prototype. <code>Date</code>, <code>RegExp</code>, <code>Map</code> and <code>Set</code> are copied too (map values and set members deeply). Circular references must not overflow the stack, and the clone must reproduce the <em>shape</em>: if two properties pointed at the same object, the two clone properties point at the same clone.</p>",
    starter: "function deepClone(value) {\n  // TODO\n}\n\nconst a = { list: [1, 2], when: new Date(0) };\na.self = a;\nconst b = deepClone(a);\nconsole.log(b !== a, b.self === b, b.list !== a.list); // true true true\n",
    hints: [
      "Keep a WeakMap from original to clone and check it first; register the clone BEFORE recursing into children, which is what makes cycles terminate.",
      "Handle Date, RegExp, Map and Set before the generic object case.",
      "For everything else use Object.create(Object.getPrototypeOf(value)), or [] for arrays, then copy Object.keys.",
    ],
    solution: "function deepClone(value, seen = new WeakMap()) {\n  if (value === null || typeof value !== \"object\") return value;\n  if (seen.has(value)) return seen.get(value);\n  if (value instanceof Date) return new Date(value.getTime());\n  if (value instanceof RegExp) return new RegExp(value.source, value.flags);\n  if (value instanceof Map) {\n    const copy = new Map();\n    seen.set(value, copy);\n    value.forEach((v, k) => copy.set(deepClone(k, seen), deepClone(v, seen)));\n    return copy;\n  }\n  if (value instanceof Set) {\n    const copy = new Set();\n    seen.set(value, copy);\n    value.forEach((v) => copy.add(deepClone(v, seen)));\n    return copy;\n  }\n  const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));\n  seen.set(value, copy);\n  for (const key of Object.keys(value)) copy[key] = deepClone(value[key], seen);\n  return copy;\n}\n",
    tests: [
      { name: "primitives, null and functions come back unchanged", body: "const fn = () => 1;\nassert.equal(deepClone(5), 5);\nassert.equal(deepClone(\"s\"), \"s\");\nassert.equal(deepClone(null), null);\nassert.equal(deepClone(undefined), undefined);\nassert.equal(deepClone(fn), fn);" },
      { name: "nested objects and arrays are independent copies", body: "const a = { x: { y: [1, { z: 2 }] } };\nconst b = deepClone(a);\nassert.deepEqual(b, a);\nassert.notEqual(b.x, a.x);\nassert.notEqual(b.x.y, a.x.y);\nb.x.y[1].z = 99;\nassert.equal(a.x.y[1].z, 2);" },
      { name: "arrays stay arrays", body: "const b = deepClone([1, [2, 3]]);\nassert.equal(Array.isArray(b), true);\nassert.equal(Array.isArray(b[1]), true);" },
      { name: "dates are copied, not shared", body: "const d = new Date(1000);\nconst c = deepClone({ d });\nassert.ok(c.d instanceof Date);\nassert.notEqual(c.d, d);\nassert.equal(c.d.getTime(), 1000);" },
      { name: "regular expressions keep source and flags", body: "const c = deepClone(/ab+c/gi);\nassert.equal(c.source, \"ab+c\");\nassert.equal(c.flags, \"gi\");" },
      { name: "maps and sets are copied deeply", body: "const inner = { n: 1 };\nconst c = deepClone({ m: new Map([[\"k\", inner]]), s: new Set([inner]) });\nassert.ok(c.m instanceof Map);\nassert.ok(c.s instanceof Set);\nassert.notEqual(c.m.get(\"k\"), inner);\nassert.equal(c.m.get(\"k\").n, 1);\nassert.notEqual([...c.s][0], inner);" },
      { name: "circular references are preserved, not followed forever", body: "const a = { name: \"a\" };\na.self = a;\nconst b = deepClone(a);\nassert.notEqual(b, a);\nassert.equal(b.self, b);" },
      { name: "shared references stay shared in the clone", body: "const shared = { v: 1 };\nconst b = deepClone({ p: shared, q: shared });\nassert.equal(b.p, b.q);\nassert.notEqual(b.p, shared);" },
      { name: "class instances keep their prototype", body: "class Point { constructor(x) { this.x = x; } double() { return this.x * 2; } }\nconst c = deepClone(new Point(4));\nassert.ok(c instanceof Point);\nassert.equal(c.double(), 8);" },
    ],
  },
  {
    id: "ex-deep-equal",
    chapter: "build-it-yourself",
    level: "advanced",
    title: "A deep equal",
    brief: "<p>Write <code>deepEqual(a, b)</code>. Values are equal when <code>Object.is</code> says so (so <code>NaN</code> equals <code>NaN</code>, and <code>0</code> and <code>-0</code> differ). Otherwise both must be objects with the same prototype and, recursively, the same own enumerable keys and equal values: key order does not matter, and a missing key is not the same as a key holding <code>undefined</code>. <code>Date</code>s compare by time, <code>Map</code>s by key and value, and <code>Set</code>s by members (compared by identity). It must survive circular structures.</p>",
    starter: "function deepEqual(a, b) {\n  // TODO\n}\n\nconsole.log(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })); // true\nconsole.log(deepEqual({ a: undefined }, {})); // false\n",
    hints: [
      "Start with Object.is, then reject anything that is not an object on both sides.",
      "Comparing prototypes tells apart [] from {} and one class from another.",
      "For cycles, remember the pair (a, b) you are already comparing and treat it as equal when it comes around again.",
    ],
    solution: "function deepEqual(a, b, seen = new WeakMap()) {\n  if (Object.is(a, b)) return true;\n  if (typeof a !== \"object\" || typeof b !== \"object\" || a === null || b === null) return false;\n  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;\n  if (a instanceof Date) return a.getTime() === b.getTime();\n  if (a instanceof RegExp) return String(a) === String(b);\n  if (seen.get(a) === b) return true;\n  seen.set(a, b);\n  if (a instanceof Map) {\n    if (a.size !== b.size) return false;\n    for (const [k, v] of a) {\n      if (!b.has(k) || !deepEqual(v, b.get(k), seen)) return false;\n    }\n    return true;\n  }\n  if (a instanceof Set) {\n    if (a.size !== b.size) return false;\n    for (const v of a) if (!b.has(v)) return false;\n    return true;\n  }\n  const ka = Object.keys(a);\n  const kb = Object.keys(b);\n  if (ka.length !== kb.length) return false;\n  return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k], seen));\n}\n",
    tests: [
      { name: "primitives use Object.is", body: "assert.equal(deepEqual(1, 1), true);\nassert.equal(deepEqual(\"a\", \"b\"), false);\nassert.equal(deepEqual(NaN, NaN), true);\nassert.equal(deepEqual(0, -0), false);\nassert.equal(deepEqual(null, undefined), false);" },
      { name: "nested structures compare by value", body: "assert.equal(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }), true);\nassert.equal(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 3 }] }), false);" },
      { name: "key order does not matter", body: "assert.equal(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true);" },
      { name: "a missing key differs from an undefined value", body: "assert.equal(deepEqual({ a: undefined }, {}), false);\nassert.equal(deepEqual({ a: 1 }, { a: 1, b: 2 }), false);" },
      { name: "arrays and objects are never equal", body: "assert.equal(deepEqual([], {}), false);\nassert.equal(deepEqual([1], { 0: 1 }), false);" },
      { name: "arrays compare in order", body: "assert.equal(deepEqual([1, 2, 3], [1, 2, 3]), true);\nassert.equal(deepEqual([1, 2, 3], [3, 2, 1]), false);\nassert.equal(deepEqual([1, 2], [1, 2, 3]), false);" },
      { name: "dates compare by time", body: "assert.equal(deepEqual(new Date(5), new Date(5)), true);\nassert.equal(deepEqual(new Date(5), new Date(6)), false);" },
      { name: "maps and sets", body: "assert.equal(deepEqual(new Map([[\"a\", { n: 1 }]]), new Map([[\"a\", { n: 1 }]])), true);\nassert.equal(deepEqual(new Map([[\"a\", 1]]), new Map([[\"a\", 2]])), false);\nconst m = {};\nassert.equal(deepEqual(new Set([m, 1]), new Set([1, m])), true);\nassert.equal(deepEqual(new Set([1]), new Set([1, 2])), false);" },
      { name: "different classes are not equal even with the same fields", body: "class A { constructor() { this.x = 1; } }\nclass B { constructor() { this.x = 1; } }\nassert.equal(deepEqual(new A(), new B()), false);\nassert.equal(deepEqual(new A(), new A()), true);" },
      { name: "circular structures terminate", body: "const a = { n: 1 }; a.self = a;\nconst b = { n: 1 }; b.self = b;\nassert.equal(deepEqual(a, b), true);\nconst c = { n: 2 }; c.self = c;\nassert.equal(deepEqual(a, c), false);" },
    ],
  },
  {
    id: "ex-my-bind",
    chapter: "build-it-yourself",
    level: "advanced",
    title: "Your own bind",
    brief: "<p>Write <code>myBind(fn, thisArg, ...preset)</code> without using <code>Function.prototype.bind</code>. The returned function calls <code>fn</code> with <code>this</code> fixed to <code>thisArg</code> and with <code>preset</code> arguments first, then whatever it is called with. A different <code>this</code> at the call site is ignored. When the bound function is called with <code>new</code>, <code>thisArg</code> is ignored and it constructs a <code>fn</code>, with the preset arguments still applied.</p>",
    starter: "function myBind(fn, thisArg, ...preset) {\n  // TODO\n}\n\nfunction greet(greeting, punctuation) {\n  return greeting + \", \" + this.name + punctuation;\n}\nconsole.log(myBind(greet, { name: \"Ana\" }, \"Hi\")(\"!\")); // \"Hi, Ana!\"\n",
    hints: [
      "fn.apply(thisArg, [...preset, ...args]) covers the ordinary call.",
      "Inside the returned function, new.target is defined only when it was called with new.",
      "For the new case, construct with new fn(...preset, ...args) and return the result.",
    ],
    solution: "function myBind(fn, thisArg, ...preset) {\n  return function bound(...args) {\n    if (new.target) return new fn(...preset, ...args);\n    return fn.apply(thisArg, [...preset, ...args]);\n  };\n}\n",
    tests: [
      { name: "fixes this", body: "function who() { return this.name; }\nassert.equal(myBind(who, { name: \"Ana\" })(), \"Ana\");" },
      { name: "returns a function", body: "assert.equal(typeof myBind(function () {}, null), \"function\");" },
      { name: "preset arguments come first", body: "function join(a, b, c) { return [a, b, c].join(\"-\"); }\nassert.equal(myBind(join, null, 1)(2, 3), \"1-2-3\");\nassert.equal(myBind(join, null, 1, 2)(3), \"1-2-3\");" },
      { name: "call-time this is ignored", body: "const bound = myBind(function () { return this.id; }, { id: 1 });\nassert.equal(bound.call({ id: 2 }), 1);" },
      { name: "works as a method extracted from its object", body: "const counter = { n: 0, inc() { this.n++; return this.n; } };\nconst inc = myBind(counter.inc, counter);\ninc();\ninc();\nassert.equal(counter.n, 2);" },
      { name: "does not change the original function", body: "function f() { return this && this.tag; }\nconst bound = myBind(f, { tag: \"x\" });\nassert.equal(bound(), \"x\");\nassert.equal(f.call({ tag: \"y\" }), \"y\");" },
      { name: "works with new and keeps the prototype", body: "function Point(x, y) { this.x = x; this.y = y; }\nPoint.prototype.sum = function () { return this.x + this.y; };\nconst P = myBind(Point, { ignored: true }, 1);\nconst p = new P(2);\nassert.equal(p.x, 1);\nassert.equal(p.y, 2);\nassert.ok(p instanceof Point);\nassert.equal(p.sum(), 3);" },
      { name: "works with zero preset arguments, like a plain this-bind", body: "function add(a, b) { return a + b; }\nconst bound = myBind(add, null);\nassert.equal(bound(2, 3), 5);" },
    ],
  },
  {
    id: "ex-throttle",
    chapter: "build-it-yourself",
    level: "advanced",
    title: "throttle, with a trailing call",
    brief: "<p>Write <code>throttle(fn, wait)</code>. The first call runs immediately. Calls made during the next <code>wait</code> milliseconds are not run one by one; instead the <b>last</b> of them runs once the window ends (a trailing call), with its own arguments. After the window has passed with no pending call, the next call runs immediately again. <code>this</code> and arguments must be forwarded.</p>",
    starter: "function throttle(fn, wait) {\n  // TODO\n}\n\nconst log = throttle((n) => console.log(\"ran\", n), 50);\nlog(1); // runs now\nlog(2);\nlog(3); // runs about 50ms later, with 3\n",
    hints: [
      "Track when fn last ran with Date.now().",
      "Inside the window, save the latest arguments and schedule ONE timer for the time remaining; do not schedule another if one is pending.",
      "When a call arrives after the window, clear any pending timer and run immediately.",
    ],
    solution: "function throttle(fn, wait) {\n  let last = 0;\n  let timer = null;\n  let lastArgs = null;\n  let lastThis = null;\n  return function throttled(...args) {\n    const now = Date.now();\n    const remaining = wait - (now - last);\n    if (remaining <= 0) {\n      if (timer) {\n        clearTimeout(timer);\n        timer = null;\n      }\n      last = now;\n      fn.apply(this, args);\n    } else {\n      lastArgs = args;\n      lastThis = this;\n      if (!timer) {\n        timer = setTimeout(() => {\n          last = Date.now();\n          timer = null;\n          fn.apply(lastThis, lastArgs);\n        }, remaining);\n      }\n    }\n  };\n}\n",
    tests: [
      { name: "the first call runs immediately", body: "const calls = [];\nconst t = throttle((n) => calls.push(n), 50);\nt(1);\nassert.deepEqual(calls, [1]);" },
      { name: "calls inside the window do not run right away", body: "const calls = [];\nconst t = throttle((n) => calls.push(n), 50);\nt(1); t(2); t(3);\nassert.deepEqual(calls, [1]);" },
      { name: "the last call in the window runs once at the end", body: "const calls = [];\nconst t = throttle((n) => calls.push(n), 50);\nt(1); t(2); t(3);\nawait new Promise((r) => setTimeout(r, 120));\nassert.deepEqual(calls, [1, 3]);" },
      { name: "a call after the window runs immediately", body: "const calls = [];\nconst t = throttle((n) => calls.push(n), 40);\nt(1);\nawait new Promise((r) => setTimeout(r, 100));\nt(2);\nassert.deepEqual(calls, [1, 2]);" },
      { name: "a single call does not fire twice", body: "const calls = [];\nconst t = throttle((n) => calls.push(n), 40);\nt(\"only\");\nawait new Promise((r) => setTimeout(r, 100));\nassert.deepEqual(calls, [\"only\"]);" },
      { name: "forwards this and all arguments", body: "const seen = [];\nconst obj = { t: throttle(function (a, b) { seen.push([this === obj, a, b]); }, 30) };\nobj.t(1, 2);\nassert.deepEqual(seen, [[true, 1, 2]]);" },
      { name: "keeps throttling across several windows", body: "const calls = [];\nconst t = throttle((n) => calls.push(n), 40);\nfor (let i = 0; i < 8; i++) {\n  t(i);\n  await new Promise((r) => setTimeout(r, 15));\n}\nawait new Promise((r) => setTimeout(r, 100));\nassert.ok(calls.length >= 2 && calls.length < 8, \"ran \" + calls.length + \" times\");\nassert.equal(calls[0], 0);\nassert.equal(calls[calls.length - 1], 7);" },
      { name: "the trailing call forwards its own this, not the leading call's", body: "const seen = [];\nconst objA = { t: null };\nconst fn = function () { seen.push(this); };\nconst shared = throttle(fn, 30);\nobjA.t = shared;\nconst objB = { t: shared };\nobjA.t();\nobjB.t();\nawait new Promise((r) => setTimeout(r, 60));\nassert.equal(seen[0], objA);\nassert.equal(seen[1], objB);" },
    ],
  },
  {
    id: "ex-memoize",
    chapter: "build-it-yourself",
    level: "advanced",
    title: "memoize with a key function",
    brief: "<p>Write <code>memoize(fn, resolver)</code>. The result of a call is cached under a key: by default the <b>first argument</b>, or <code>resolver(...args)</code> if given. A cached value must be returned even when it is <code>undefined</code> or <code>0</code>. <code>this</code> is forwarded to <code>fn</code>. If <code>fn</code> throws, nothing is cached. Expose the cache as <code>memoized.cache</code> (a <code>Map</code>).</p>",
    starter: "function memoize(fn, resolver) {\n  // TODO\n}\n\nlet calls = 0;\nconst square = memoize((n) => { calls++; return n * n; });\nsquare(4); square(4);\nconsole.log(calls); // 1\n",
    hints: [
      "Use a Map, and cache.has(key) rather than checking the value, so a cached undefined still counts.",
      "Compute the key first: resolver ? resolver(...args) : args[0].",
      "Only call cache.set after fn returned normally.",
    ],
    solution: "function memoize(fn, resolver) {\n  const cache = new Map();\n  function memoized(...args) {\n    const key = resolver ? resolver(...args) : args[0];\n    if (cache.has(key)) return cache.get(key);\n    const value = fn.apply(this, args);\n    cache.set(key, value);\n    return value;\n  }\n  memoized.cache = cache;\n  return memoized;\n}\n",
    tests: [
      { name: "calls the function once per key", body: "let calls = 0;\nconst sq = memoize((n) => { calls++; return n * n; });\nassert.equal(sq(4), 16);\nassert.equal(sq(4), 16);\nassert.equal(calls, 1);" },
      { name: "different arguments are cached separately", body: "let calls = 0;\nconst sq = memoize((n) => { calls++; return n * n; });\nsq(2); sq(3); sq(2); sq(3);\nassert.equal(calls, 2);" },
      { name: "a cached undefined is still a cache hit", body: "let calls = 0;\nconst f = memoize(() => { calls++; return undefined; });\nf(\"a\"); f(\"a\");\nassert.equal(calls, 1);" },
      { name: "a cached zero is still a cache hit", body: "let calls = 0;\nconst f = memoize(() => { calls++; return 0; });\nf(1); f(1);\nassert.equal(calls, 1);\nassert.equal(f(1), 0);" },
      { name: "the default key is only the first argument", body: "let calls = 0;\nconst f = memoize((a, b) => { calls++; return a + b; });\nf(1, 2);\nassert.equal(f(1, 99), 3);\nassert.equal(calls, 1);" },
      { name: "a resolver builds the key from several arguments", body: "let calls = 0;\nconst f = memoize((a, b) => { calls++; return a + b; }, (a, b) => a + \":\" + b);\nassert.equal(f(1, 2), 3);\nassert.equal(f(1, 99), 100);\nf(1, 2);\nassert.equal(calls, 2);" },
      { name: "errors are not cached", body: "let calls = 0;\nconst f = memoize((n) => { calls++; if (calls === 1) throw new Error(\"first\"); return n; });\nassert.throws(() => f(1), /first/);\nassert.equal(f(1), 1);\nassert.equal(calls, 2);" },
      { name: "this is forwarded", body: "const obj = { k: 10, f: memoize(function (n) { return this.k + n; }) };\nassert.equal(obj.f(1), 11);" },
      { name: "the cache is exposed as a Map", body: "const f = memoize((n) => n * 2);\nf(1); f(2);\nassert.ok(f.cache instanceof Map);\nassert.equal(f.cache.size, 2);" },
    ],
  },
  {
    id: "ex-array-polyfills",
    chapter: "build-it-yourself",
    level: "advanced",
    title: "map, filter and reduce from scratch",
    brief: "<p>Write <code>myMap(arr, cb, thisArg)</code>, <code>myFilter(arr, cb, thisArg)</code> and <code>myReduce(arr, cb, initial)</code> without calling the built-in versions. Callbacks receive <code>(value, index, array)</code>; <code>reduce</code>'s callback receives <code>(accumulator, value, index, array)</code>. Holes in sparse arrays are skipped and, for <code>myMap</code>, stay holes in the result. <code>myReduce</code> without an initial value (that is, when only two arguments were passed) starts from the first element, and throws a <code>TypeError</code> on an empty array. None of them may change the input.</p>",
    starter: "function myMap(arr, cb, thisArg) {\n  // TODO\n}\nfunction myFilter(arr, cb, thisArg) {\n  // TODO\n}\nfunction myReduce(arr, cb, initial) {\n  // TODO\n}\n\nconsole.log(myMap([1, 2, 3], (n) => n * 2)); // [2, 4, 6]\n",
    hints: [
      "Check i in arr before calling the callback: that is how holes are skipped.",
      "For myMap, create new Array(arr.length) and assign by index so the holes stay holes.",
      "For myReduce, use arguments.length to tell 'no initial value' from 'initial value is undefined'.",
    ],
    solution: "function myMap(arr, cb, thisArg) {\n  const out = new Array(arr.length);\n  for (let i = 0; i < arr.length; i++) {\n    if (i in arr) out[i] = cb.call(thisArg, arr[i], i, arr);\n  }\n  return out;\n}\n\nfunction myFilter(arr, cb, thisArg) {\n  const out = [];\n  for (let i = 0; i < arr.length; i++) {\n    if (i in arr && cb.call(thisArg, arr[i], i, arr)) out.push(arr[i]);\n  }\n  return out;\n}\n\nfunction myReduce(arr, cb, initial) {\n  let i = 0;\n  let acc;\n  if (arguments.length >= 3) {\n    acc = initial;\n  } else {\n    while (i < arr.length && !(i in arr)) i++;\n    if (i >= arr.length) throw new TypeError(\"Reduce of empty array with no initial value\");\n    acc = arr[i++];\n  }\n  for (; i < arr.length; i++) {\n    if (i in arr) acc = cb(acc, arr[i], i, arr);\n  }\n  return acc;\n}\n",
    tests: [
      { name: "myMap transforms every element", body: "assert.deepEqual(myMap([1, 2, 3], (n) => n * 2), [2, 4, 6]);" },
      { name: "myMap passes value, index and the array", body: "const seen = [];\nconst arr = [\"a\", \"b\"];\nmyMap(arr, (v, i, a) => seen.push([v, i, a === arr]));\nassert.deepEqual(seen, [[\"a\", 0, true], [\"b\", 1, true]]);" },
      { name: "myMap honours thisArg", body: "const out = myMap([1, 2], function (n) { return n * this.k; }, { k: 10 });\nassert.deepEqual(out, [10, 20]);" },
      { name: "myMap keeps holes as holes", body: "const out = myMap([1, , 3], (n) => n * 2);\nassert.equal(out.length, 3);\nassert.equal(1 in out, false);\nassert.equal(out[2], 6);" },
      { name: "myFilter keeps the elements the callback accepts", body: "assert.deepEqual(myFilter([1, 2, 3, 4], (n) => n % 2 === 0), [2, 4]);\nassert.deepEqual(myFilter([], () => true), []);" },
      { name: "myFilter skips holes and passes the index", body: "const idx = [];\nconst out = myFilter([5, , 7], (v, i) => { idx.push(i); return true; });\nassert.deepEqual(out, [5, 7]);\nassert.deepEqual(idx, [0, 2]);" },
      { name: "myReduce sums with an initial value", body: "assert.equal(myReduce([1, 2, 3], (a, b) => a + b, 10), 16);" },
      { name: "myReduce without an initial value starts from the first element", body: "let calls = 0;\nconst total = myReduce([1, 2, 3], (a, b) => { calls++; return a + b; });\nassert.equal(total, 6);\nassert.equal(calls, 2);" },
      { name: "an initial value of undefined still counts as an initial value", body: "let first = \"unset\";\nconst r = myReduce([1], (a) => { first = a; return \"done\"; }, undefined);\nassert.equal(first, undefined);\nassert.equal(r, \"done\");" },
      { name: "myReduce on an empty array", body: "assert.equal(myReduce([], (a, b) => a + b, 7), 7);\nassert.throws(() => myReduce([], (a, b) => a + b), TypeError);" },
      { name: "the input is never changed", body: "const arr = [3, 1, 2];\nassert.deepEqual(myMap(arr, (n) => n), [3, 1, 2]);\nassert.deepEqual(myFilter(arr, () => true), [3, 1, 2]);\nassert.equal(myReduce(arr, (a, b) => a + b, 0), 6);\nassert.notEqual(myMap(arr, (n) => n), arr);\nassert.deepEqual(arr, [3, 1, 2]);" },
    ],
  },
  {
    id: "ex-curry-placeholder",
    chapter: "build-it-yourself",
    level: "advanced",
    title: "curry, with placeholders",
    brief: "<p>Write <code>curry(fn)</code> so the curried function can be called with any number of arguments at a time until <code>fn.length</code> arguments have been supplied, then it calls <code>fn</code>. <code>curry.placeholder</code> marks a position to fill later: <code>curry(add3)(_, 2)(1)(3)</code> supplies 1, 2, 3 in that order. The starter already defines the placeholder symbol.</p>",
    starter: "const _ = Symbol(\"placeholder\");\n\nfunction curry(fn) {\n  // TODO\n}\ncurry.placeholder = _;\n\nconst add3 = (a, b, c) => a + b + c;\nconsole.log(curry(add3)(1)(2)(3)); // 6\nconsole.log(curry(add3)(_, 2)(1, 3)); // 6\n",
    hints: [
      "A call is complete when there are at least fn.length arguments and none of the first fn.length is the placeholder.",
      "When it is not complete, return a function that merges its new arguments into the placeholders first, then appends the rest.",
      "Then call the curried function again with the merged list, so the same rules apply.",
    ],
    solution: "const _ = Symbol(\"placeholder\");\n\nfunction curry(fn) {\n  const arity = fn.length;\n  return function curried(...args) {\n    const complete = args.length >= arity && args.slice(0, arity).every((a) => a !== _);\n    if (complete) return fn.apply(this, args);\n    return function (...next) {\n      const merged = [];\n      let n = 0;\n      for (const a of args) merged.push(a === _ && n < next.length ? next[n++] : a);\n      while (n < next.length) merged.push(next[n++]);\n      return curried.apply(this, merged);\n    };\n  };\n}\ncurry.placeholder = _;\n",
    tests: [
      { name: "one argument at a time", body: "const add3 = (a, b, c) => a + b + c;\nassert.equal(curry(add3)(1)(2)(3), 6);" },
      { name: "all at once", body: "const add3 = (a, b, c) => a + b + c;\nassert.equal(curry(add3)(1, 2, 3), 6);" },
      { name: "in groups", body: "const add3 = (a, b, c) => a + b + c;\nassert.equal(curry(add3)(1, 2)(3), 6);\nassert.equal(curry(add3)(1)(2, 3), 6);" },
      { name: "the order of arguments is kept", body: "const f = curry((a, b, c) => [a, b, c].join(\"\"));\nassert.equal(f(\"x\")(\"y\")(\"z\"), \"xyz\");" },
      { name: "a placeholder leaves a gap to fill later", body: "const ph = curry.placeholder;\nconst f = curry((a, b, c) => [a, b, c].join(\"\"));\nassert.equal(f(ph, \"b\")(\"a\")(\"c\"), \"abc\");\nassert.equal(f(ph, \"b\", \"c\")(\"a\"), \"abc\");\nassert.equal(f(\"a\", ph, \"c\")(\"b\"), \"abc\");" },
      { name: "several placeholders fill left to right", body: "const ph = curry.placeholder;\nconst f = curry((a, b, c) => [a, b, c].join(\"\"));\nassert.equal(f(ph, ph, \"c\")(\"a\", \"b\"), \"abc\");" },
      { name: "partial applications can be reused", body: "const f = curry((a, b, c) => a + b + c);\nconst plus1 = f(1);\nassert.equal(plus1(1)(1), 3);\nassert.equal(plus1(10)(10), 21);" },
      { name: "a function of one argument runs straight away", body: "const f = curry((a) => a * 2);\nassert.equal(f(4), 8);" },
      { name: "this is forwarded", body: "const obj = { k: 100, f: curry(function (a, b) { return this.k + a + b; }) };\nassert.equal(obj.f(1, 2), 103);" },
    ],
  },
  {
    id: "ex-my-new",
    chapter: "prototypes-oop",
    level: "intermediate",
    title: "What new actually does",
    brief: "<p>Write <code>myNew(Constructor, ...args)</code> that behaves like <code>new Constructor(...args)</code> for ordinary functions, without using <code>new</code>. It must create an object linked to <code>Constructor.prototype</code>, run the constructor with <code>this</code> set to that object, and return the object &mdash; unless the constructor itself returns an object (or function), in which case that is the result. Returned primitives are ignored. Throw a <code>TypeError</code> if <code>Constructor</code> is not a function.</p>",
    starter: "function myNew(Constructor, ...args) {\n  // TODO\n}\n\nfunction Dog(name) { this.name = name; }\nDog.prototype.speak = function () { return this.name + \" barks\"; };\nconsole.log(myNew(Dog, \"Rex\").speak()); // \"Rex barks\"\n",
    hints: [
      "Object.create(Constructor.prototype) does the linking step.",
      "Constructor.apply(obj, args) does the running step and gives you its return value.",
      "Only an object or a function return value replaces obj; null does not.",
    ],
    solution: "function myNew(Constructor, ...args) {\n  if (typeof Constructor !== \"function\") throw new TypeError(\"Constructor is not a function\");\n  const obj = Object.create(Constructor.prototype);\n  const result = Constructor.apply(obj, args);\n  const isObject = result !== null && (typeof result === \"object\" || typeof result === \"function\");\n  return isObject ? result : obj;\n}\n",
    tests: [
      { name: "links the prototype", body: "function A() {}\nconst a = myNew(A);\nassert.equal(Object.getPrototypeOf(a), A.prototype);\nassert.ok(a instanceof A);" },
      { name: "runs the constructor with this set to the new object", body: "function P(x, y) { this.x = x; this.y = y; }\nconst p = myNew(P, 1, 2);\nassert.equal(p.x, 1);\nassert.equal(p.y, 2);" },
      { name: "prototype methods are reachable", body: "function Dog(n) { this.name = n; }\nDog.prototype.speak = function () { return this.name + \" barks\"; };\nassert.equal(myNew(Dog, \"Rex\").speak(), \"Rex barks\");" },
      { name: "a constructor returning an object replaces the result", body: "const other = { replaced: true };\nfunction C() { this.x = 1; return other; }\nassert.equal(myNew(C), other);" },
      { name: "a returned function replaces the result too", body: "const fn = () => 1;\nfunction C() { return fn; }\nassert.equal(myNew(C), fn);" },
      { name: "returned primitives are ignored", body: "function C() { this.x = 1; return 5; }\nassert.equal(myNew(C).x, 1);\nfunction D() { this.y = 2; return null; }\nassert.equal(myNew(D).y, 2);" },
      { name: "each call makes a fresh object", body: "function C() {}\nassert.notEqual(myNew(C), myNew(C));" },
      { name: "a non-function throws a TypeError", body: "assert.throws(() => myNew({}), TypeError);\nassert.throws(() => myNew(undefined), TypeError);" },
    ],
  },
  {
    id: "ex-my-instanceof",
    chapter: "prototypes-oop",
    level: "intermediate",
    title: "Your own instanceof",
    brief: "<p>Write <code>myInstanceOf(value, Constructor)</code>: true when <code>Constructor.prototype</code> appears anywhere on <code>value</code>'s prototype chain. Primitives and <code>null</code> are never instances. Throw a <code>TypeError</code> when <code>Constructor</code> is not a function. Use <code>Object.getPrototypeOf</code>; do not use <code>instanceof</code> or <code>isPrototypeOf</code>.</p>",
    starter: "function myInstanceOf(value, Constructor) {\n  // TODO\n}\n\nclass A {}\nclass B extends A {}\nconsole.log(myInstanceOf(new B(), A)); // true\nconsole.log(myInstanceOf({}, A)); // false\n",
    hints: [
      "Get the target once: Constructor.prototype.",
      "Walk with a loop: proto = Object.getPrototypeOf(proto) until you match or reach null.",
      "Reject primitives before the loop; typeof null is \"object\", so check null explicitly.",
    ],
    solution: "function myInstanceOf(value, Constructor) {\n  if (typeof Constructor !== \"function\") throw new TypeError(\"Right-hand side of instanceof is not callable\");\n  if (value === null || (typeof value !== \"object\" && typeof value !== \"function\")) return false;\n  const target = Constructor.prototype;\n  let proto = Object.getPrototypeOf(value);\n  while (proto !== null) {\n    if (proto === target) return true;\n    proto = Object.getPrototypeOf(proto);\n  }\n  return false;\n}\n",
    tests: [
      { name: "a direct instance", body: "class A {}\nassert.equal(myInstanceOf(new A(), A), true);" },
      { name: "an instance of a subclass is an instance of the parent", body: "class A {}\nclass B extends A {}\nassert.equal(myInstanceOf(new B(), A), true);\nassert.equal(myInstanceOf(new B(), B), true);\nassert.equal(myInstanceOf(new A(), B), false);" },
      { name: "unrelated constructors", body: "class A {}\nclass B {}\nassert.equal(myInstanceOf(new A(), B), false);" },
      { name: "every object is an instance of Object", body: "assert.equal(myInstanceOf({}, Object), true);\nassert.equal(myInstanceOf([], Object), true);\nassert.equal(myInstanceOf([], Array), true);\nassert.equal(myInstanceOf(() => 1, Function), true);" },
      { name: "primitives are never instances", body: "assert.equal(myInstanceOf(5, Number), false);\nassert.equal(myInstanceOf(\"s\", String), false);\nassert.equal(myInstanceOf(true, Boolean), false);\nassert.equal(myInstanceOf(undefined, Object), false);" },
      { name: "null is never an instance", body: "assert.equal(myInstanceOf(null, Object), false);" },
      { name: "an object with no prototype is not an instance of Object", body: "assert.equal(myInstanceOf(Object.create(null), Object), false);" },
      { name: "changing the prototype changes the answer", body: "function F() {}\nconst o = {};\nassert.equal(myInstanceOf(o, F), false);\nObject.setPrototypeOf(o, F.prototype);\nassert.equal(myInstanceOf(o, F), true);" },
      { name: "a non-function right-hand side throws", body: "assert.throws(() => myInstanceOf({}, {}), TypeError);\nassert.throws(() => myInstanceOf({}, null), TypeError);" },
    ],
  },
  {
    id: "ex-promise-all",
    chapter: "async-properly",
    level: "intermediate",
    title: "Implement Promise.all",
    brief: "<p>Write <code>promiseAll(items)</code> without calling <code>Promise.all</code>. <code>items</code> is any iterable of promises or plain values. Return a promise for an array of results <b>in input order</b>, however the promises settle. It rejects as soon as any input rejects, with that reason. An empty input resolves to <code>[]</code> straight away.</p>",
    starter: "function promiseAll(items) {\n  // TODO\n}\n\npromiseAll([1, Promise.resolve(2), new Promise((r) => setTimeout(() => r(3), 10))])\n  .then(console.log); // [1, 2, 3]\n",
    hints: [
      "Convert the iterable with Array.from, and treat each item with Promise.resolve(item) so plain values work.",
      "Write into results[index], not push, so the order is the input order.",
      "Count what remains; resolve when it reaches zero. Pass reject straight to .then as the second argument.",
    ],
    solution: "function promiseAll(items) {\n  return new Promise((resolve, reject) => {\n    const list = Array.from(items);\n    if (list.length === 0) {\n      resolve([]);\n      return;\n    }\n    const results = new Array(list.length);\n    let remaining = list.length;\n    list.forEach((item, i) => {\n      Promise.resolve(item).then((value) => {\n        results[i] = value;\n        remaining -= 1;\n        if (remaining === 0) resolve(results);\n      }, reject);\n    });\n  });\n}\n",
    tests: [
      { name: "collects results in order", body: "const out = await promiseAll([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]);\nassert.deepEqual(out, [1, 2, 3]);" },
      { name: "keeps input order even when a later promise settles first", body: "const slow = new Promise((r) => setTimeout(() => r(\"slow\"), 30));\nconst fast = new Promise((r) => setTimeout(() => r(\"fast\"), 5));\nassert.deepEqual(await promiseAll([slow, fast]), [\"slow\", \"fast\"]);" },
      { name: "accepts plain values", body: "assert.deepEqual(await promiseAll([1, Promise.resolve(2), \"x\"]), [1, 2, \"x\"]);" },
      { name: "an empty input resolves to an empty array", body: "assert.deepEqual(await promiseAll([]), []);" },
      { name: "rejects with the first rejection", body: "let err;\ntry { await promiseAll([Promise.resolve(1), Promise.reject(new Error(\"boom\"))]); } catch (e) { err = e; }\nassert.equal(err.message, \"boom\");" },
      { name: "rejects without waiting for promises that never settle", body: "const never = new Promise(() => {});\nconst outcome = await Promise.race([\n  promiseAll([never, Promise.reject(new Error(\"fast fail\"))]).then(() => \"resolved\", (e) => e.message),\n  new Promise((r) => setTimeout(() => r(\"hung\"), 100)),\n]);\nassert.equal(outcome, \"fast fail\");" },
      { name: "accepts any iterable, not just arrays", body: "assert.deepEqual(await promiseAll(new Set([1, 2, 3])), [1, 2, 3]);" },
      { name: "returns a promise", body: "assert.ok(promiseAll([]) instanceof Promise);" },
    ],
  },
  {
    id: "ex-promise-all-settled",
    chapter: "async-properly",
    level: "intermediate",
    title: "Implement Promise.allSettled",
    brief: "<p>Write <code>promiseAllSettled(items)</code> without calling <code>Promise.allSettled</code>. It never rejects. It resolves, once every input has settled, to an array in input order whose entries are <code>{ status: \"fulfilled\", value }</code> or <code>{ status: \"rejected\", reason }</code>. Plain values count as fulfilled. An empty input resolves to <code>[]</code>.</p>",
    starter: "function promiseAllSettled(items) {\n  // TODO\n}\n\npromiseAllSettled([Promise.resolve(1), Promise.reject(\"no\")]).then(console.log);\n// [{ status: \"fulfilled\", value: 1 }, { status: \"rejected\", reason: \"no\" }]\n",
    hints: [
      "Turn every input into a promise that always fulfils with the entry object, then wait for all of those.",
      "promise.then(value => ({ status: 'fulfilled', value }), reason => ({ status: 'rejected', reason }))",
      "Once nothing can reject, you can build it on top of your own promiseAll logic or on a counter.",
    ],
    solution: "function promiseAllSettled(items) {\n  return new Promise((resolve) => {\n    const list = Array.from(items);\n    if (list.length === 0) {\n      resolve([]);\n      return;\n    }\n    const results = new Array(list.length);\n    let remaining = list.length;\n    const done = (i, entry) => {\n      results[i] = entry;\n      remaining -= 1;\n      if (remaining === 0) resolve(results);\n    };\n    list.forEach((item, i) => {\n      Promise.resolve(item).then(\n        (value) => done(i, { status: \"fulfilled\", value }),\n        (reason) => done(i, { status: \"rejected\", reason })\n      );\n    });\n  });\n}\n",
    tests: [
      { name: "all fulfilled", body: "assert.deepEqual(await promiseAllSettled([Promise.resolve(1), 2]), [\n  { status: \"fulfilled\", value: 1 },\n  { status: \"fulfilled\", value: 2 },\n]);" },
      { name: "a mix of outcomes", body: "const out = await promiseAllSettled([Promise.resolve(\"ok\"), Promise.reject(\"bad\")]);\nassert.deepEqual(out, [\n  { status: \"fulfilled\", value: \"ok\" },\n  { status: \"rejected\", reason: \"bad\" },\n]);" },
      { name: "it never rejects", body: "const out = await promiseAllSettled([Promise.reject(new Error(\"a\")), Promise.reject(new Error(\"b\"))]);\nassert.equal(out.length, 2);\nassert.equal(out[0].status, \"rejected\");\nassert.equal(out[1].reason.message, \"b\");" },
      { name: "results stay in input order", body: "const slow = new Promise((r) => setTimeout(() => r(\"slow\"), 30));\nconst fast = new Promise((_, rej) => setTimeout(() => rej(\"fast\"), 5));\nconst out = await promiseAllSettled([slow, fast]);\nassert.equal(out[0].value, \"slow\");\nassert.equal(out[1].reason, \"fast\");" },
      { name: "it waits for the slowest input", body: "const t0 = Date.now();\nawait promiseAllSettled([Promise.reject(\"x\"), new Promise((r) => setTimeout(r, 40))]);\nassert.ok(Date.now() - t0 >= 30);" },
      { name: "an empty input resolves to an empty array", body: "assert.deepEqual(await promiseAllSettled([]), []);" },
      { name: "accepts any iterable", body: "const out = await promiseAllSettled(new Set([1, 2]));\nassert.equal(out.length, 2);" },
      { name: "a rejected entry carries no value key", body: "const out = await promiseAllSettled([Promise.reject(\"r\")]);\nassert.equal(\"value\" in out[0], false);\nassert.equal(\"reason\" in out[0], true);" },
    ],
  },
  {
    id: "ex-promise-any",
    chapter: "async-properly",
    level: "intermediate",
    title: "Implement Promise.any",
    brief: "<p>Write <code>promiseAny(items)</code> without calling <code>Promise.any</code>. It fulfils with the value of the <b>first input to fulfil</b> (plain values count). If every input rejects, or the input is empty, it rejects with an <code>AggregateError</code> whose <code>errors</code> array holds the rejection reasons <b>in input order</b>.</p>",
    starter: "function promiseAny(items) {\n  // TODO\n}\n\npromiseAny([Promise.reject(1), new Promise((r) => setTimeout(() => r(\"late\"), 10))])\n  .then(console.log); // \"late\"\n",
    hints: [
      "The mirror image of promiseAll: resolve on the first success, and count failures.",
      "Keep an errors array indexed by input position, and reject with new AggregateError(errors, message) when the failure count equals the number of inputs.",
      "An empty input has no successes, so it rejects straight away.",
    ],
    solution: "function promiseAny(items) {\n  return new Promise((resolve, reject) => {\n    const list = Array.from(items);\n    if (list.length === 0) {\n      reject(new AggregateError([], \"All promises were rejected\"));\n      return;\n    }\n    const errors = new Array(list.length);\n    let failed = 0;\n    list.forEach((item, i) => {\n      Promise.resolve(item).then(resolve, (reason) => {\n        errors[i] = reason;\n        failed += 1;\n        if (failed === list.length) reject(new AggregateError(errors, \"All promises were rejected\"));\n      });\n    });\n  });\n}\n",
    tests: [
      { name: "resolves with the first fulfilment", body: "const out = await promiseAny([new Promise((r) => setTimeout(() => r(\"slow\"), 30)), new Promise((r) => setTimeout(() => r(\"fast\"), 5))]);\nassert.equal(out, \"fast\");" },
      { name: "rejections before a success are ignored", body: "const out = await promiseAny([Promise.reject(new Error(\"a\")), Promise.resolve(\"ok\")]);\nassert.equal(out, \"ok\");" },
      { name: "plain values count as fulfilled", body: "assert.equal(await promiseAny([Promise.reject(1), 42]), 42);" },
      { name: "all rejected gives an AggregateError", body: "let err;\ntry { await promiseAny([Promise.reject(\"a\"), Promise.reject(\"b\")]); } catch (e) { err = e; }\nassert.ok(err instanceof AggregateError);" },
      { name: "the errors are in input order, not settle order", body: "const slow = new Promise((_, rej) => setTimeout(() => rej(\"first-input\"), 30));\nconst fast = new Promise((_, rej) => setTimeout(() => rej(\"second-input\"), 5));\nlet err;\ntry { await promiseAny([slow, fast]); } catch (e) { err = e; }\nassert.deepEqual(err.errors, [\"first-input\", \"second-input\"]);" },
      { name: "an empty input rejects", body: "let err;\ntry { await promiseAny([]); } catch (e) { err = e; }\nassert.ok(err instanceof AggregateError);\nassert.deepEqual(err.errors, []);" },
      { name: "it does not wait for slower inputs once one succeeds", body: "const never = new Promise(() => {});\nconst outcome = await Promise.race([\n  promiseAny([never, Promise.resolve(\"done\")]),\n  new Promise((r) => setTimeout(() => r(\"hung\"), 100)),\n]);\nassert.equal(outcome, \"done\");" },
      { name: "a single fulfilled input resolves with it", body: "assert.equal(await promiseAny([Promise.resolve(\"solo\")]), \"solo\");" },
    ],
  },
  {
    id: "ex-promise-race",
    chapter: "async-properly",
    level: "intermediate",
    title: "Implement Promise.race",
    brief: "<p>Write <code>promiseRace(items)</code> without calling <code>Promise.race</code>. The returned promise settles the same way as the <b>first</b> input to settle: fulfilled with its value, or rejected with its reason. Plain values count as already settled. An empty input never settles (like the built-in).</p>",
    starter: "function promiseRace(items) {\n  // TODO\n}\n\nconst wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));\npromiseRace([wait(30, \"slow\"), wait(5, \"fast\")]).then(console.log); // \"fast\"\n",
    hints: [
      "Subscribe to every input with the same resolve and reject.",
      "A promise can only settle once, so the first call wins and later ones do nothing.",
      "Promise.resolve(item) makes plain values work.",
    ],
    solution: "function promiseRace(items) {\n  return new Promise((resolve, reject) => {\n    for (const item of items) {\n      Promise.resolve(item).then(resolve, reject);\n    }\n  });\n}\n",
    tests: [
      { name: "the fastest fulfilment wins", body: "const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));\nassert.equal(await promiseRace([wait(30, \"slow\"), wait(5, \"fast\")]), \"fast\");" },
      { name: "the fastest rejection wins too", body: "const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));\nconst fail = (ms, e) => new Promise((_, rej) => setTimeout(() => rej(new Error(e)), ms));\nlet err;\ntry { await promiseRace([wait(30, \"slow\"), fail(5, \"quick failure\")]); } catch (e) { err = e; }\nassert.equal(err.message, \"quick failure\");" },
      { name: "a plain value settles immediately", body: "const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));\nassert.equal(await promiseRace([wait(20, \"later\"), \"now\"]), \"now\");" },
      { name: "a value that is already resolved beats a pending one", body: "assert.equal(await promiseRace([new Promise(() => {}), Promise.resolve(\"ready\")]), \"ready\");" },
      { name: "later settlements are ignored", body: "const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));\nconst p = promiseRace([wait(5, \"a\"), wait(10, \"b\")]);\nawait new Promise((r) => setTimeout(r, 40));\nassert.equal(await p, \"a\");" },
      { name: "an empty input never settles", body: "const outcome = await Promise.race([\n  promiseRace([]).then(() => \"settled\", () => \"settled\"),\n  new Promise((r) => setTimeout(() => r(\"pending\"), 30)),\n]);\nassert.equal(outcome, \"pending\");" },
      { name: "works with any iterable", body: "assert.equal(await promiseRace(new Set([Promise.resolve(\"s\")])), \"s\");" },
      { name: "a single-item input settles with that one item", body: "assert.equal(await promiseRace([\"only\"]), \"only\");" },
    ],
  },
  {
    id: "ex-map-limit",
    chapter: "async-properly",
    level: "intermediate",
    title: "Run async work with a concurrency limit",
    brief: "<p>Write <code>mapLimit(items, limit, fn)</code>. <code>fn(item, index)</code> returns a promise. Return a promise for the array of results <b>in input order</b>, but never run more than <code>limit</code> calls at the same time: start a new one the moment a running one finishes. If any call rejects, the returned promise rejects with that reason. An empty input resolves to <code>[]</code>.</p>",
    starter: "async function mapLimit(items, limit, fn) {\n  // TODO\n}\n\nconst sleep = (ms) => new Promise((r) => setTimeout(r, ms));\nmapLimit([1, 2, 3, 4], 2, async (n) => { await sleep(10); return n * 2; }).then(console.log); // [2, 4, 6, 8]\n",
    hints: [
      "Start `limit` workers. Each worker loops: take the next index, await fn, store the result at that index, repeat until none are left.",
      "A shared counter next = 0 handed out by next++ is safe, because JavaScript runs one worker's synchronous part at a time.",
      "Wait for all workers with Promise.all; the first rejection then rejects the whole call.",
    ],
    solution: "async function mapLimit(items, limit, fn) {\n  const results = new Array(items.length);\n  let next = 0;\n  async function worker() {\n    while (next < items.length) {\n      const i = next++;\n      results[i] = await fn(items[i], i);\n    }\n  }\n  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);\n  await Promise.all(workers);\n  return results;\n}\n",
    tests: [
      { name: "results are in input order", body: "const sleep = (ms) => new Promise((r) => setTimeout(r, ms));\nconst out = await mapLimit([30, 5, 15], 3, async (ms) => { await sleep(ms); return ms; });\nassert.deepEqual(out, [30, 5, 15]);" },
      { name: "never exceeds the limit", body: "const sleep = (ms) => new Promise((r) => setTimeout(r, ms));\nlet active = 0, peak = 0;\nawait mapLimit([1, 2, 3, 4, 5, 6], 2, async () => { active++; peak = Math.max(peak, active); await sleep(10); active--; });\nassert.equal(peak, 2);" },
      { name: "reaches the limit when there is enough work", body: "const sleep = (ms) => new Promise((r) => setTimeout(r, ms));\nlet active = 0, peak = 0;\nawait mapLimit([1, 2, 3, 4], 3, async () => { active++; peak = Math.max(peak, active); await sleep(10); active--; });\nassert.equal(peak, 3);" },
      { name: "a limit of one runs strictly one after another", body: "const sleep = (ms) => new Promise((r) => setTimeout(r, ms));\nconst log = [];\nawait mapLimit([1, 2, 3], 1, async (n) => { log.push(\"start\" + n); await sleep(5); log.push(\"end\" + n); });\nassert.deepEqual(log, [\"start1\", \"end1\", \"start2\", \"end2\", \"start3\", \"end3\"]);" },
      { name: "a limit bigger than the input is fine", body: "assert.deepEqual(await mapLimit([1, 2], 10, async (n) => n + 1), [2, 3]);" },
      { name: "an empty input resolves to an empty array", body: "assert.deepEqual(await mapLimit([], 3, async (n) => n), []);" },
      { name: "fn receives the index", body: "assert.deepEqual(await mapLimit([\"a\", \"b\"], 2, async (v, i) => v + i), [\"a0\", \"b1\"]);" },
      { name: "a rejection rejects the whole call", body: "let err;\ntry { await mapLimit([1, 2, 3], 2, async (n) => { if (n === 2) throw new Error(\"bad \" + n); return n; }); } catch (e) { err = e; }\nassert.equal(err.message, \"bad 2\");" },
      { name: "a new call starts as soon as one finishes, not in batches", body: "const sleep = (ms) => new Promise((r) => setTimeout(r, ms));\nconst t0 = Date.now();\nconst out = await mapLimit([60, 10, 10, 10, 10, 10], 2, async (ms) => { await sleep(ms); return ms; });\nassert.deepEqual(out, [60, 10, 10, 10, 10, 10]);\nassert.ok(Date.now() - t0 < 110, \"took \" + (Date.now() - t0) + \"ms\");" },
    ],
  },
  {
    id: "ex-error-reporter",
    chapter: "browser-observability",
    level: "advanced",
    title: "An error reporter that batches and de-duplicates",
    brief: "<p>Write <code>createErrorReporter({ send, maxBatch = 10 })</code> returning <code>{ report, flush, pending }</code>. <code>report(error)</code> accepts an <code>Error</code> or any value. Errors with the same <code>name</code> and <code>message</code> are one entry with a <code>count</code>, so a loop that throws 500 times sends one line. <code>flush()</code> calls <code>send(batch)</code> once with the entries in first-seen order (each <code>{ name, message, count }</code>) and starts fresh; with nothing pending it does not call <code>send</code>. When the number of <em>distinct</em> entries reaches <code>maxBatch</code>, flush automatically. <code>pending()</code> returns the number of distinct entries waiting. A non-error value is reported with name <code>\"Error\"</code> and its string form as the message.</p>",
    starter: "function createErrorReporter({ send, maxBatch = 10 }) {\n  // TODO\n}\n\nconst reporter = createErrorReporter({ send: (batch) => console.log(batch) });\nreporter.report(new TypeError(\"x is undefined\"));\nreporter.report(new TypeError(\"x is undefined\"));\nreporter.flush(); // [{ name: \"TypeError\", message: \"x is undefined\", count: 2 }]\n",
    hints: [
      "A Map keyed by name + ':' + message keeps first-seen order and gives O(1) duplicate lookup.",
      "On a duplicate, increase count; otherwise insert a new entry, and only then check the size against maxBatch.",
      "flush swaps in a new empty Map before calling send, so an error reported from inside send is not lost.",
    ],
    solution: "function createErrorReporter({ send, maxBatch = 10 }) {\n  let entries = new Map();\n\n  function flush() {\n    if (entries.size === 0) return;\n    const batch = [...entries.values()];\n    entries = new Map();\n    send(batch);\n  }\n\n  return {\n    report(error) {\n      const name = error && error.name ? error.name : \"Error\";\n      const message = error && error.message !== undefined ? error.message : String(error);\n      const key = name + \":\" + message;\n      const existing = entries.get(key);\n      if (existing) existing.count += 1;\n      else entries.set(key, { name, message, count: 1 });\n      if (entries.size >= maxBatch) flush();\n    },\n    flush,\n    pending: () => entries.size,\n  };\n}\n",
    tests: [
      { name: "one error becomes one entry", body: "const sent = [];\nconst r = createErrorReporter({ send: (b) => sent.push(b) });\nr.report(new TypeError(\"boom\"));\nr.flush();\nassert.deepEqual(sent, [[{ name: \"TypeError\", message: \"boom\", count: 1 }]]);" },
      { name: "duplicates are counted, not repeated", body: "const sent = [];\nconst r = createErrorReporter({ send: (b) => sent.push(b) });\nfor (let i = 0; i < 500; i++) r.report(new Error(\"loop\"));\nr.flush();\nassert.equal(sent.length, 1);\nassert.deepEqual(sent[0], [{ name: \"Error\", message: \"loop\", count: 500 }]);" },
      { name: "the same message under a different name is a different entry", body: "const sent = [];\nconst r = createErrorReporter({ send: (b) => sent.push(b) });\nr.report(new TypeError(\"x\"));\nr.report(new RangeError(\"x\"));\nr.flush();\nassert.equal(sent[0].length, 2);" },
      { name: "entries keep first-seen order", body: "const sent = [];\nconst r = createErrorReporter({ send: (b) => sent.push(b) });\nr.report(new Error(\"b\"));\nr.report(new Error(\"a\"));\nr.report(new Error(\"b\"));\nr.flush();\nassert.deepEqual(sent[0].map((e) => e.message), [\"b\", \"a\"]);" },
      { name: "flush with nothing pending does not send", body: "let calls = 0;\nconst r = createErrorReporter({ send: () => calls++ });\nr.flush();\nr.report(new Error(\"x\"));\nr.flush();\nr.flush();\nassert.equal(calls, 1);" },
      { name: "flushing starts a fresh batch", body: "const sent = [];\nconst r = createErrorReporter({ send: (b) => sent.push(b) });\nr.report(new Error(\"e\"));\nr.flush();\nr.report(new Error(\"e\"));\nr.flush();\nassert.equal(sent[1][0].count, 1);" },
      { name: "it flushes by itself when maxBatch distinct errors are waiting", body: "const sent = [];\nconst r = createErrorReporter({ send: (b) => sent.push(b), maxBatch: 3 });\nr.report(new Error(\"1\"));\nr.report(new Error(\"2\"));\nassert.equal(sent.length, 0);\nr.report(new Error(\"3\"));\nassert.equal(sent.length, 1);\nassert.equal(sent[0].length, 3);\nassert.equal(r.pending(), 0);" },
      { name: "duplicates do not count towards maxBatch", body: "const sent = [];\nconst r = createErrorReporter({ send: (b) => sent.push(b), maxBatch: 2 });\nr.report(new Error(\"same\")); r.report(new Error(\"same\")); r.report(new Error(\"same\"));\nassert.equal(sent.length, 0);\nassert.equal(r.pending(), 1);" },
      { name: "non-error values are reported as strings", body: "const sent = [];\nconst r = createErrorReporter({ send: (b) => sent.push(b) });\nr.report(\"plain string\");\nr.report(404);\nr.flush();\nassert.deepEqual(sent[0], [\n  { name: \"Error\", message: \"plain string\", count: 1 },\n  { name: \"Error\", message: \"404\", count: 1 },\n]);" },
    ],
  },
  {
    id: "ex-escape-regexp",
    chapter: "modern-js",
    level: "intermediate",
    title: "Escape text for a regular expression",
    brief: "<p>Write <code>escapeRegExp(text)</code> returning a string that, placed inside <code>new RegExp(...)</code>, matches <code>text</code> <b>literally</b>. Every character that has a meaning in a pattern &mdash; <code>. * + ? ^ $ { } ( ) | [ ] \\</code> &mdash; must be escaped. Do not escape anything else (in particular not <code>-</code>, which is not allowed as an escape outside a character class when the <code>u</code> flag is on). This is what <code>RegExp.escape</code> does for you, minus its hex-escaping of a leading letter.</p>",
    starter: "function escapeRegExp(text) {\n  // TODO\n}\n\nconst term = \"file (1).txt\";\nconsole.log(new RegExp(escapeRegExp(term)).test(\"file (1).txt\")); // true\nconsole.log(new RegExp(escapeRegExp(term)).test(\"file 1.txt\")); // false\n",
    hints: [
      "Replace each special character with a backslash followed by that same character.",
      "In a replace callback string, \"\\\\$&\" means: a backslash, then whatever matched.",
      "Build the character class carefully: inside [...] the characters ] and \\ need escaping too.",
    ],
    solution: "function escapeRegExp(text) {\n  return text.replace(/[.*+?^${}()|[\\]\\\\]/g, \"\\\\$&\");\n}\n",
    tests: [
      { name: "plain text is unchanged", body: "assert.equal(escapeRegExp(\"hello world 123\"), \"hello world 123\");" },
      { name: "a dot matches only a dot", body: "const re = new RegExp(\"^\" + escapeRegExp(\"a.b\") + \"$\");\nassert.equal(re.test(\"a.b\"), true);\nassert.equal(re.test(\"aXb\"), false);" },
      { name: "parentheses are literal", body: "const re = new RegExp(\"^\" + escapeRegExp(\"file (1).txt\") + \"$\");\nassert.equal(re.test(\"file (1).txt\"), true);\nassert.equal(re.test(\"file 1.txt\"), false);" },
      { name: "a star and a plus are literal", body: "assert.equal(new RegExp(\"^\" + escapeRegExp(\"a*b+c?\") + \"$\").test(\"a*b+c?\"), true);\nassert.equal(new RegExp(\"^\" + escapeRegExp(\"a*\") + \"$\").test(\"aaa\"), false);" },
      { name: "brackets, braces and pipes", body: "for (const s of [\"[abc]\", \"a{2}\", \"a|b\", \"^start\", \"end$\"]) {\n  assert.equal(new RegExp(\"^\" + escapeRegExp(s) + \"$\").test(s), true, s);\n}\nassert.equal(new RegExp(\"^\" + escapeRegExp(\"a|b\") + \"$\").test(\"a\"), false);" },
      { name: "backslashes are escaped", body: "const s = \"C:\\\\dir\\\\file\";\nassert.equal(new RegExp(\"^\" + escapeRegExp(s) + \"$\").test(s), true);" },
      { name: "every special character at once", body: "const s = \".*+?^${}()|[]\\\\\";\nassert.equal(new RegExp(\"^\" + escapeRegExp(s) + \"$\").test(s), true);" },
      { name: "the empty string", body: "assert.equal(escapeRegExp(\"\"), \"\");" },
      { name: "works with the u flag and non-ASCII text", body: "const re = new RegExp(\"^\" + escapeRegExp(\"café (☃)-ok\") + \"$\", \"u\");\nassert.equal(re.test(\"café (☃)-ok\"), true);" },
      { name: "safe to embed next to other pattern text", body: "const re = new RegExp(\"^\" + escapeRegExp(\"1+1=\") + \"\\\\d$\");\nassert.equal(re.test(\"1+1=2\"), true);\nassert.equal(re.test(\"11=2\"), false);" },
    ],
  },
  {
    id: "ex-promise-try",
    chapter: "modern-js",
    level: "intermediate",
    title: "Implement Promise.try",
    brief: "<p>Write <code>promiseTry(fn, ...args)</code> without calling <code>Promise.try</code>. It calls <code>fn(...args)</code> <b>immediately and synchronously</b> and returns a promise: fulfilled with the return value, following it if it is a promise or thenable, or rejected if <code>fn</code> throws or its promise rejects. It must never throw synchronously.</p>",
    starter: "function promiseTry(fn, ...args) {\n  // TODO\n}\n\npromiseTry(() => JSON.parse(\"{ nope\")).catch((e) => console.log(\"caught\", e.name)); // caught SyntaxError\n",
    hints: [
      "new Promise((resolve) => resolve(fn(...args))) does everything: the executor runs synchronously, resolve adopts a returned promise, and a throw inside the executor rejects.",
      "Compare with Promise.resolve().then(fn): that runs fn one microtask late, which is exactly what this function must avoid.",
    ],
    solution: "function promiseTry(fn, ...args) {\n  return new Promise((resolve) => resolve(fn(...args)));\n}\n",
    tests: [
      { name: "a returned value fulfils", body: "assert.equal(await promiseTry(() => 42), 42);" },
      { name: "fn runs synchronously", body: "let ran = false;\nconst p = promiseTry(() => { ran = true; });\nassert.equal(ran, true);\nawait p;" },
      { name: "returns a promise", body: "assert.ok(promiseTry(() => 1) instanceof Promise);" },
      { name: "a synchronous throw becomes a rejection", body: "let err;\ntry { await promiseTry(() => { throw new RangeError(\"bad\"); }); } catch (e) { err = e; }\nassert.ok(err instanceof RangeError);\nassert.equal(err.message, \"bad\");" },
      { name: "it never throws synchronously", body: "let p;\nlet threw = false;\ntry { p = promiseTry(() => { throw new Error(\"x\"); }); } catch (e) { threw = true; }\nassert.equal(threw, false);\nassert.ok(p instanceof Promise);\nawait p.catch(() => {});" },
      { name: "a returned promise is followed", body: "assert.equal(await promiseTry(() => Promise.resolve(\"later\")), \"later\");" },
      { name: "a rejecting promise rejects", body: "let err;\ntry { await promiseTry(() => Promise.reject(new Error(\"async bad\"))); } catch (e) { err = e; }\nassert.equal(err.message, \"async bad\");" },
      { name: "arguments are passed through", body: "assert.equal(await promiseTry((a, b) => a + b, 2, 3), 5);" },
      { name: "a thenable is adopted", body: "const thenable = { then(resolve) { resolve(\"from thenable\"); } };\nassert.equal(await promiseTry(() => thenable), \"from thenable\");" },
      { name: "an async function that throws rejects", body: "let err;\ntry { await promiseTry(async () => { throw new Error(\"in async\"); }); } catch (e) { err = e; }\nassert.equal(err.message, \"in async\");" },
    ],
  },
];
