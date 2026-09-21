import type { Exercise } from "../types";

// React exercises stay inside the same sandbox as JavaScript's: a Web
// Worker with no DOM. So every one of these pulls the *logic* out of a
// component — a reducer, a selector, an immutable update, the rule a hook
// follows — and tests that in isolation, the way you'd unit-test it in a
// real codebase before ever mounting anything.
export const react: Exercise[] = [
  {
    id: "ex-react-classify-value",
    chapter: "react-thinking",
    level: "beginner",
    title: "Props, state, or derived?",
    brief:
      "<p>Write <code>classify(value)</code>, the three questions from <b>Thinking in React</b> turned into code. <code>value</code> looks like <code>{ fromParent, changesOverTime, computableFromOthers }</code>.</p><ul><li>computable from other state or props &rarr; <code>\"derived\"</code></li><li>otherwise, passed in from a parent &rarr; <code>\"props\"</code></li><li>otherwise, changes over time &rarr; <code>\"state\"</code></li><li>none of the above &rarr; <code>\"constant\"</code></li></ul><p>Check derivability first — a value can be both passed in <i>and</i> computable, and derived wins.</p>",
    starter:
      "function classify(value) {\n  // TODO: check computableFromOthers first, then fromParent, then changesOverTime\n}\n\nconsole.log(classify({ computableFromOthers: true }));                    // \"derived\"\nconsole.log(classify({ fromParent: true }));                              // \"props\"\nconsole.log(classify({ changesOverTime: true }));                         // \"state\"\nconsole.log(classify({}));                                                // \"constant\"\n",
    hints: [
      "Order matters: computableFromOthers beats fromParent beats changesOverTime.",
      "Four return paths, one per question, plus the fallback.",
    ],
    solution:
      'function classify(value) {\n  if (value.computableFromOthers) return "derived";\n  if (value.fromParent) return "props";\n  if (value.changesOverTime) return "state";\n  return "constant";\n}\n',
    tests: [
      {
        name: "derivable values are derived, even if also passed in",
        body: 'assert.equal(classify({ computableFromOthers: true, fromParent: true }), "derived");',
      },
      {
        name: "passed-in, non-derivable values are props",
        body: 'assert.equal(classify({ fromParent: true, changesOverTime: false }), "props");',
      },
      {
        name: "owned values that change are state",
        body: 'assert.equal(classify({ changesOverTime: true }), "state");',
      },
      {
        name: "none of the three is a constant",
        body: 'assert.equal(classify({}), "constant");',
      },
    ],
  },
  {
    id: "ex-react-visible-products",
    chapter: "react-thinking",
    level: "beginner",
    title: "Derive, don't store",
    brief:
      "<p>Write <code>visibleProducts(products, query, inStockOnly)</code> &mdash; the filtering step from <b>Thinking in React</b>, as a standalone function instead of a <code>useMemo</code>.</p><ul><li>keep products whose <code>name</code> includes <code>query</code>, case-insensitively</li><li>if <code>inStockOnly</code> is true, also drop anything with <code>stocked: false</code></li><li>an empty <code>query</code> matches everything</li></ul>",
    starter:
      'function visibleProducts(products, query, inStockOnly) {\n  // TODO: filter, don\'t mutate\n}\n\nconst catalog = [\n  { name: "Football", stocked: true },\n  { name: "Baseball", stocked: false },\n];\nconsole.log(visibleProducts(catalog, "ball", false).length); // 2\nconsole.log(visibleProducts(catalog, "ball", true).length);  // 1\n',
    hints: [
      "toLowerCase() both sides before calling includes().",
      "An empty string is a substring of everything, so the query check needs no special case for it.",
    ],
    solution:
      "function visibleProducts(products, query, inStockOnly) {\n  const q = query.toLowerCase();\n  return products.filter((p) => {\n    if (!p.name.toLowerCase().includes(q)) return false;\n    if (inStockOnly && !p.stocked) return false;\n    return true;\n  });\n}\n",
    tests: [
      {
        name: "matches the query case-insensitively",
        body: 'const list = [{ name: "Football", stocked: true }];\nassert.equal(visibleProducts(list, "FOOT", false).length, 1);',
      },
      {
        name: "an empty query keeps everything",
        body: 'const list = [{ name: "A", stocked: true }, { name: "B", stocked: false }];\nassert.equal(visibleProducts(list, "", false).length, 2);',
      },
      {
        name: "inStockOnly drops out-of-stock items",
        body: 'const list = [{ name: "A", stocked: true }, { name: "A", stocked: false }];\nassert.equal(visibleProducts(list, "a", true).length, 1);',
      },
      {
        name: "does not mutate the source array",
        body: 'const list = [{ name: "A", stocked: true }];\nvisibleProducts(list, "a", false);\nassert.equal(list.length, 1);',
      },
    ],
  },
  {
    id: "ex-react-updater-batch",
    chapter: "react-usestate",
    level: "beginner",
    title: "Apply a batch of updaters",
    brief:
      "<p>Write <code>applyUpdates(start, updaters)</code> that folds an array of updater functions over a starting value &mdash; the same shape as calling <code>setCount(c =&gt; c + 1)</code> three times in one event handler.</p>",
    starter:
      "function applyUpdates(start, updaters) {\n  // TODO: reduce updaters over start\n}\n\nconsole.log(applyUpdates(0, [(c) => c + 1, (c) => c + 1, (c) => c + 1])); // 3\n",
    hints: [
      "Array.prototype.reduce does exactly this: (acc, fn) => fn(acc).",
      "The starting value for reduce is start.",
    ],
    solution: "function applyUpdates(start, updaters) {\n  return updaters.reduce((value, fn) => fn(value), start);\n}\n",
    tests: [
      {
        name: "three increments land on 3, not 1",
        body: "assert.equal(applyUpdates(0, [(c) => c + 1, (c) => c + 1, (c) => c + 1]), 3);",
      },
      {
        name: "an empty list of updaters returns the start value unchanged",
        body: "assert.equal(applyUpdates(5, []), 5);",
      },
      {
        name: "updaters can depend on the running value, not just the original",
        body: "assert.equal(applyUpdates(1, [(c) => c * 2, (c) => c + 1]), 3);",
      },
    ],
  },
  {
    id: "ex-react-toggle-field",
    chapter: "react-usestate",
    level: "beginner",
    title: "Flip one field, immutably",
    brief:
      "<p>Write <code>toggleField(state, key)</code> that returns a <b>new</b> object with the boolean at <code>key</code> flipped. Every other field, and the original object, must be untouched.</p>",
    starter:
      'function toggleField(state, key) {\n  // TODO\n}\n\nconst s = { loggedIn: false, name: "A" };\nconsole.log(toggleField(s, "loggedIn")); // { loggedIn: true, name: "A" }\nconsole.log(s.loggedIn);                 // still false\n',
    hints: ["Spread the object, then override one key.", "!state[key] flips a boolean without an if statement."],
    solution: "function toggleField(state, key) {\n  return { ...state, [key]: !state[key] };\n}\n",
    tests: [
      { name: "flips the named field", body: 'assert.equal(toggleField({ open: false }, "open").open, true);' },
      {
        name: "leaves other fields alone",
        body: 'assert.equal(toggleField({ open: false, count: 4 }, "open").count, 4);',
      },
      {
        name: "does not mutate the original",
        body: 'const s = { open: false };\ntoggleField(s, "open");\nassert.equal(s.open, false);',
      },
    ],
  },
  {
    id: "ex-react-classnames",
    chapter: "react-events-conditionals",
    level: "beginner",
    title: "Build a className conditionally",
    brief:
      "<p>Write <code>classNames(...args)</code>. Each argument is either a string, a falsy value to skip, or an object whose truthy-valued keys should be included. Join the result with single spaces &mdash; the same job a library like <code>clsx</code> does.</p>",
    starter:
      'function classNames(...args) {\n  // TODO\n}\n\nconsole.log(classNames("btn", false, "is-open", { disabled: true, loud: false }));\n// "btn is-open disabled"\n',
    hints: [
      "typeof arg === \"object\" tells strings and plain objects apart (arrays aside).",
      "Object.keys(arg).filter((k) => arg[k]) gets the truthy keys of an object argument.",
    ],
    solution:
      'function classNames(...args) {\n  const out = [];\n  for (const arg of args) {\n    if (!arg) continue;\n    if (typeof arg === "string") { out.push(arg); continue; }\n    if (typeof arg === "object") {\n      for (const key of Object.keys(arg)) if (arg[key]) out.push(key);\n    }\n  }\n  return out.join(" ");\n}\n',
    tests: [
      { name: "skips falsy arguments", body: 'assert.equal(classNames("a", false, null, "b"), "a b");' },
      {
        name: "expands truthy keys of an object argument",
        body: 'assert.equal(classNames({ a: true, b: false, c: true }), "a c");',
      },
      {
        name: "mixes strings and objects in order",
        body: 'assert.equal(classNames("btn", { active: true }), "btn active");',
      },
      { name: "no arguments gives an empty string", body: 'assert.equal(classNames(), "");' },
    ],
  },
  {
    id: "ex-react-render-state",
    chapter: "react-events-conditionals",
    level: "beginner",
    title: "One name for the state you're in",
    brief:
      "<p>Write <code>renderState({ loading, error, items })</code> returning exactly one of <code>\"loading\"</code>, <code>\"error\"</code>, <code>\"empty\"</code>, <code>\"ready\"</code> &mdash; the early-return ladder a component's JSX would otherwise re-derive on every render.</p>",
    starter:
      'function renderState({ loading, error, items }) {\n  // TODO: loading beats error beats empty beats ready\n}\n\nconsole.log(renderState({ loading: true, items: [] }));  // "loading"\nconsole.log(renderState({ items: [] }));                  // "empty"\nconsole.log(renderState({ items: [1] }));                 // "ready"\n',
    hints: ["Check loading first, then error, then items.length === 0."],
    solution:
      'function renderState({ loading, error, items }) {\n  if (loading) return "loading";\n  if (error) return "error";\n  if (!items || items.length === 0) return "empty";\n  return "ready";\n}\n',
    tests: [
      { name: "loading wins even with an error present", body: 'assert.equal(renderState({ loading: true, error: "x", items: [] }), "loading");' },
      { name: "error beats an empty list", body: 'assert.equal(renderState({ error: "x", items: [] }), "error");' },
      { name: "no items is empty", body: 'assert.equal(renderState({ items: [] }), "empty");' },
      { name: "items present is ready", body: 'assert.equal(renderState({ items: [1, 2] }), "ready");' },
    ],
  },
  {
    id: "ex-react-duplicate-keys",
    chapter: "react-lists-keys",
    level: "beginner",
    title: "Find the keys that will collide",
    brief:
      "<p>Write <code>findDuplicateKeys(items)</code> returning the <code>id</code>s that appear more than once. React would silently reuse the DOM node for the second one &mdash; this is the check that catches it before it ships.</p>",
    starter:
      'function findDuplicateKeys(items) {\n  // TODO: return each duplicated id once, in first-seen order\n}\n\nconsole.log(findDuplicateKeys([{ id: "a" }, { id: "b" }, { id: "a" }])); // ["a"]\n',
    hints: ["A Map from id to count gets you there in one pass.", "Only push an id into the result the first time its count crosses 1."],
    solution:
      'function findDuplicateKeys(items) {\n  const seen = new Map();\n  const dupes = [];\n  for (const item of items) {\n    const count = (seen.get(item.id) || 0) + 1;\n    seen.set(item.id, count);\n    if (count === 2) dupes.push(item.id);\n  }\n  return dupes;\n}\n',
    tests: [
      { name: "finds one duplicate", body: 'assert.deepEqual(findDuplicateKeys([{ id: "a" }, { id: "b" }, { id: "a" }]), ["a"]);' },
      { name: "no duplicates gives an empty array", body: "assert.deepEqual(findDuplicateKeys([{ id: 1 }, { id: 2 }]), []);" },
      { name: "reports each id once even if it repeats three times", body: 'assert.deepEqual(findDuplicateKeys([{ id: "x" }, { id: "x" }, { id: "x" }]), ["x"]);' },
    ],
  },
  {
    id: "ex-react-reorder-list",
    chapter: "react-lists-keys",
    level: "beginner",
    title: "Move an item without mutating",
    brief:
      "<p>Write <code>reorder(list, fromIndex, toIndex)</code> that returns a <b>new</b> array with the item at <code>fromIndex</code> moved to <code>toIndex</code>. The original array must not change.</p>",
    starter:
      'function reorder(list, fromIndex, toIndex) {\n  // TODO\n}\n\nconsole.log(reorder(["a", "b", "c"], 0, 2)); // ["b", "c", "a"]\n',
    hints: [
      "Copy the array first, then splice the copy — splice mutates whatever it's called on.",
      "Removing the item first shifts every later index down by one, including toIndex if it was after fromIndex.",
    ],
    solution:
      "function reorder(list, fromIndex, toIndex) {\n  const copy = list.slice();\n  const [item] = copy.splice(fromIndex, 1);\n  copy.splice(toIndex, 0, item);\n  return copy;\n}\n",
    tests: [
      { name: "moves the first item to the end", body: 'assert.deepEqual(reorder(["a", "b", "c"], 0, 2), ["b", "c", "a"]);' },
      { name: "moves the last item to the front", body: 'assert.deepEqual(reorder(["a", "b", "c"], 2, 0), ["c", "a", "b"]);' },
      { name: "does not mutate the source array", body: 'const list = ["a", "b", "c"];\nreorder(list, 0, 2);\nassert.deepEqual(list, ["a", "b", "c"]);' },
    ],
  },
  {
    id: "ex-react-validate-form",
    chapter: "react-forms",
    level: "beginner",
    title: "Validate before you submit",
    brief:
      "<p>Write <code>validate(values)</code> for a <code>{ email, password }</code> form, returning an errors object with only the failing fields.</p><ul><li><code>email</code> must contain <code>\"@\"</code></li><li><code>password</code> must be at least 8 characters</li><li>a field with no problem should not appear in the result at all</li></ul>",
    starter:
      'function validate(values) {\n  // TODO: return only the fields that failed\n}\n\nconsole.log(validate({ email: "a", password: "short" }));\n// { email: "Enter a valid email", password: "At least 8 characters" }\nconsole.log(validate({ email: "a@b.com", password: "longenough" })); // {}\n',
    hints: ["Build the object with only the keys that fail, rather than building all keys and deleting."],
    solution:
      'function validate(values) {\n  const errors = {};\n  if (!values.email || !values.email.includes("@")) errors.email = "Enter a valid email";\n  if (!values.password || values.password.length < 8) errors.password = "At least 8 characters";\n  return errors;\n}\n',
    tests: [
      { name: "flags a bad email", body: 'assert.ok("email" in validate({ email: "a", password: "longenough" }));' },
      { name: "flags a short password", body: 'assert.ok("password" in validate({ email: "a@b.com", password: "abc" }));' },
      { name: "a valid form has no errors", body: 'assert.deepEqual(validate({ email: "a@b.com", password: "longenough" }), {});' },
      { name: "a missing field is still an error, not a crash", body: "assert.ok(\"email\" in validate({ password: \"longenough\" }));" },
    ],
  },
  {
    id: "ex-react-controlled-change",
    chapter: "react-forms",
    level: "beginner",
    title: "One field, one immutable update",
    brief:
      "<p>Write <code>handleChange(state, field, value)</code> &mdash; what a controlled input's <code>onChange</code> hands to <code>setState</code>. Return a new object; other fields must be unchanged.</p>",
    starter:
      'function handleChange(state, field, value) {\n  // TODO\n}\n\nconsole.log(handleChange({ name: "", email: "" }, "name", "Ada"));\n// { name: "Ada", email: "" }\n',
    hints: ["This is the same computed-key spread as toggleField, but with an explicit value instead of a flip."],
    solution: "function handleChange(state, field, value) {\n  return { ...state, [field]: value };\n}\n",
    tests: [
      { name: "sets the named field", body: 'assert.equal(handleChange({ name: "" }, "name", "Ada").name, "Ada");' },
      { name: "leaves other fields alone", body: 'assert.equal(handleChange({ name: "", email: "x" }, "name", "Ada").email, "x");' },
      { name: "does not mutate the source object", body: 'const s = { name: "" };\nhandleChange(s, "name", "Ada");\nassert.equal(s.name, "");' },
    ],
  },
  {
    id: "ex-react-deps-changed",
    chapter: "react-useeffect-basics",
    level: "beginner",
    title: "Did the dependency array change?",
    brief:
      "<p>Write <code>depsChanged(prevDeps, nextDeps)</code>, the comparison React runs before re-running an effect: <code>true</code> if any entry differs by <code>Object.is</code>, or if the arrays are different lengths (treat the first render, where <code>prevDeps</code> is <code>null</code>, as changed).</p>",
    starter:
      "function depsChanged(prevDeps, nextDeps) {\n  // TODO\n}\n\nconsole.log(depsChanged(null, [1]));       // true — first render\nconsole.log(depsChanged([1, \"a\"], [1, \"a\"])); // false\nconsole.log(depsChanged([1], [2]));        // true\n",
    hints: [
      "Object.is(NaN, NaN) is true, unlike ===  — use Object.is, the same comparison React uses.",
      "A null prevDeps means there was no previous render to compare against.",
    ],
    solution:
      "function depsChanged(prevDeps, nextDeps) {\n  if (prevDeps === null) return true;\n  if (prevDeps.length !== nextDeps.length) return true;\n  for (let i = 0; i < nextDeps.length; i++) {\n    if (!Object.is(prevDeps[i], nextDeps[i])) return true;\n  }\n  return false;\n}\n",
    tests: [
      { name: "first render always changed", body: "assert.equal(depsChanged(null, [1]), true);" },
      { name: "identical primitives means unchanged", body: 'assert.equal(depsChanged([1, "a"], [1, "a"]), false);' },
      { name: "a different value means changed", body: "assert.equal(depsChanged([1], [2]), true);" },
      { name: "NaN compares equal to itself, like React's real check", body: "assert.equal(depsChanged([NaN], [NaN]), false);" },
      { name: "a new object reference counts as changed even with the same shape", body: "assert.equal(depsChanged([{ a: 1 }], [{ a: 1 }]), true);" },
    ],
  },
  {
    id: "ex-react-which-deps-changed",
    chapter: "react-useeffect-basics",
    level: "beginner",
    title: "Which dependency changed?",
    brief:
      "<p>Write <code>changedIndexes(prevDeps, nextDeps)</code> returning the indexes that differ &mdash; the debugging step after <code>depsChanged</code> says yes and you need to know which one.</p>",
    starter:
      "function changedIndexes(prevDeps, nextDeps) {\n  // TODO\n}\n\nconsole.log(changedIndexes([1, 2, 3], [1, 5, 3])); // [1]\n",
    hints: ["Map each index to whether it changed, then filter for the ones that did."],
    solution:
      "function changedIndexes(prevDeps, nextDeps) {\n  const out = [];\n  for (let i = 0; i < nextDeps.length; i++) {\n    if (!Object.is(prevDeps[i], nextDeps[i])) out.push(i);\n  }\n  return out;\n}\n",
    tests: [
      { name: "finds the one index that changed", body: "assert.deepEqual(changedIndexes([1, 2, 3], [1, 5, 3]), [1]);" },
      { name: "no changes gives an empty array", body: 'assert.deepEqual(changedIndexes(["a"], ["a"]), []);' },
      { name: "reports every index that changed, not just the first", body: "assert.deepEqual(changedIndexes([1, 2], [9, 9]), [0, 1]);" },
    ],
  },
  {
    id: "ex-react-todos-reducer",
    chapter: "react-usereducer",
    level: "intermediate",
    title: "A todos reducer",
    brief:
      "<p>Write <code>todosReducer(state, action)</code> for a list of <code>{ id, text, done }</code>. Handle three action types:</p><ul><li><code>{ type: \"add\", id, text }</code> &mdash; append a new, undone todo</li><li><code>{ type: \"toggle\", id }</code> &mdash; flip <code>done</code> on the matching todo only</li><li><code>{ type: \"remove\", id }</code> &mdash; drop the matching todo</li></ul><p>An unknown <code>type</code> should return <code>state</code> unchanged, not throw.</p>",
    starter:
      'function todosReducer(state, action) {\n  switch (action.type) {\n    // TODO: add, toggle, remove\n    default:\n      return state;\n  }\n}\n\nlet s = [];\ns = todosReducer(s, { type: "add", id: 1, text: "Ship it" });\ns = todosReducer(s, { type: "toggle", id: 1 });\nconsole.log(s); // [{ id: 1, text: "Ship it", done: true }]\n',
    hints: [
      "add: state.concat([{ id, text, done: false }]).",
      "toggle: map over state, and only flip done on the item whose id matches.",
      "remove: filter out the matching id.",
    ],
    solution:
      'function todosReducer(state, action) {\n  switch (action.type) {\n    case "add":\n      return state.concat([{ id: action.id, text: action.text, done: false }]);\n    case "toggle":\n      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));\n    case "remove":\n      return state.filter((t) => t.id !== action.id);\n    default:\n      return state;\n  }\n}\n',
    tests: [
      {
        name: "add appends an undone todo",
        body: 'const s = todosReducer([], { type: "add", id: 1, text: "A" });\nassert.deepEqual(s, [{ id: 1, text: "A", done: false }]);',
      },
      {
        name: "toggle flips only the matching todo",
        body: 'const start = [{ id: 1, text: "A", done: false }, { id: 2, text: "B", done: false }];\nconst s = todosReducer(start, { type: "toggle", id: 1 });\nassert.equal(s[0].done, true);\nassert.equal(s[1].done, false);',
      },
      {
        name: "remove drops only the matching todo",
        body: 'const start = [{ id: 1, text: "A", done: false }, { id: 2, text: "B", done: false }];\nconst s = todosReducer(start, { type: "remove", id: 1 });\nassert.equal(s.length, 1);\nassert.equal(s[0].id, 2);',
      },
      {
        name: "an unknown action type is a no-op",
        body: 'const start = [{ id: 1, text: "A", done: false }];\nassert.equal(todosReducer(start, { type: "nope" }), start);',
      },
    ],
  },
  {
    id: "ex-react-counter-reducer",
    chapter: "react-usereducer",
    level: "intermediate",
    title: "A discriminated-union reducer",
    brief:
      "<p>Write <code>counterReducer(state, action)</code> where <code>state</code> is a number. Support <code>{ type: \"increment\" }</code>, <code>{ type: \"decrement\" }</code>, <code>{ type: \"reset\" }</code> (back to 0), and <code>{ type: \"set\", value }</code>.</p>",
    starter:
      'function counterReducer(state, action) {\n  // TODO\n}\n\nconsole.log(counterReducer(0, { type: "increment" })); // 1\nconsole.log(counterReducer(5, { type: "set", value: 10 })); // 10\n',
    hints: ["A switch on action.type, one case per type, is clearer here than nested ifs."],
    solution:
      'function counterReducer(state, action) {\n  switch (action.type) {\n    case "increment":\n      return state + 1;\n    case "decrement":\n      return state - 1;\n    case "reset":\n      return 0;\n    case "set":\n      return action.value;\n    default:\n      return state;\n  }\n}\n',
    tests: [
      { name: "increment adds one", body: 'assert.equal(counterReducer(0, { type: "increment" }), 1);' },
      { name: "decrement subtracts one", body: 'assert.equal(counterReducer(5, { type: "decrement" }), 4);' },
      { name: "reset goes to zero regardless of current value", body: 'assert.equal(counterReducer(99, { type: "reset" }), 0);' },
      { name: "set uses the action's value", body: 'assert.equal(counterReducer(5, { type: "set", value: 42 }), 42);' },
    ],
  },
  {
    id: "ex-react-safe-parse",
    chapter: "react-custom-hooks",
    level: "intermediate",
    title: "The read behind useLocalStorageState",
    brief:
      "<p>Write <code>safeParse(raw, fallback)</code>: parse <code>raw</code> as JSON and return it, or return <code>fallback</code> if <code>raw</code> is <code>null</code>, not valid JSON, or parses to something other than an object. Never throw.</p>",
    starter:
      'function safeParse(raw, fallback) {\n  // TODO\n}\n\nconsole.log(safeParse(\'{"a":1}\', {}));  // { a: 1 }\nconsole.log(safeParse("not json", {})); // {}\nconsole.log(safeParse(null, {}));       // {}\n',
    hints: [
      "Wrap JSON.parse in try/catch — it throws on malformed input.",
      "typeof parsed === \"object\" && parsed !== null catches the case where raw was valid JSON but not an object, like \"5\" or \"null\".",
    ],
    solution:
      'function safeParse(raw, fallback) {\n  if (raw === null || raw === undefined) return fallback;\n  try {\n    const parsed = JSON.parse(raw);\n    return typeof parsed === "object" && parsed !== null ? parsed : fallback;\n  } catch {\n    return fallback;\n  }\n}\n',
    tests: [
      { name: "parses valid JSON", body: 'assert.deepEqual(safeParse(\'{"a":1}\', {}), { a: 1 });' },
      { name: "falls back on malformed JSON", body: 'assert.deepEqual(safeParse("{not json", { a: 0 }), { a: 0 });' },
      { name: "falls back on null input", body: "assert.deepEqual(safeParse(null, { a: 0 }), { a: 0 });" },
      { name: "falls back when JSON parses to a non-object", body: 'assert.deepEqual(safeParse("5", { a: 0 }), { a: 0 });' },
    ],
  },
  {
    id: "ex-react-paginate",
    chapter: "react-custom-hooks",
    level: "intermediate",
    title: "The logic behind usePagination",
    brief:
      "<p>Write <code>paginate(items, page, pageSize)</code> returning <code>{ slice, pageCount }</code>. Pages are 1-indexed. A <code>page</code> past the end should return an empty <code>slice</code>, not throw.</p>",
    starter:
      "function paginate(items, page, pageSize) {\n  // TODO\n}\n\nconsole.log(paginate([1, 2, 3, 4, 5], 2, 2)); // { slice: [3, 4], pageCount: 3 }\n",
    hints: ["Math.ceil(items.length / pageSize) is the page count.", "The slice starts at (page - 1) * pageSize."],
    solution:
      "function paginate(items, page, pageSize) {\n  const start = (page - 1) * pageSize;\n  return {\n    slice: items.slice(start, start + pageSize),\n    pageCount: Math.ceil(items.length / pageSize),\n  };\n}\n",
    tests: [
      { name: "returns the correct slice for a middle page", body: "assert.deepEqual(paginate([1, 2, 3, 4, 5], 2, 2).slice, [3, 4]);" },
      { name: "computes the page count", body: "assert.equal(paginate([1, 2, 3, 4, 5], 1, 2).pageCount, 3);" },
      { name: "a page past the end is an empty slice, not an error", body: "assert.deepEqual(paginate([1, 2], 5, 2).slice, []);" },
    ],
  },
  {
    id: "ex-react-shallow-equal",
    chapter: "react-memoisation",
    level: "intermediate",
    title: "What React.memo checks",
    brief:
      "<p>Write <code>shallowEqual(a, b)</code>: <code>true</code> if <code>a</code> and <code>b</code> have the same keys and every value is <code>===</code>-equal (one level deep, no recursion) &mdash; the default comparison <code>React.memo</code> runs on props.</p>",
    starter:
      "function shallowEqual(a, b) {\n  // TODO\n}\n\nconsole.log(shallowEqual({ x: 1 }, { x: 1 }));            // true\nconsole.log(shallowEqual({ x: {} }, { x: {} }));          // false — different object references\n",
    hints: ["Compare key counts first as a cheap early exit.", "Object.is on each value catches NaN correctly, the way React's real check does."],
    solution:
      "function shallowEqual(a, b) {\n  const keysA = Object.keys(a);\n  const keysB = Object.keys(b);\n  if (keysA.length !== keysB.length) return false;\n  return keysA.every((key) => Object.is(a[key], b[key]));\n}\n",
    tests: [
      { name: "equal primitives at every key are equal", body: "assert.equal(shallowEqual({ x: 1, y: 2 }, { x: 1, y: 2 }), true);" },
      { name: "a different value makes it unequal", body: "assert.equal(shallowEqual({ x: 1 }, { x: 2 }), false);" },
      { name: "two different objects at the same key are unequal, even with identical contents", body: "assert.equal(shallowEqual({ x: {} }, { x: {} }), false);" },
      { name: "a missing key makes it unequal", body: "assert.equal(shallowEqual({ x: 1, y: 2 }, { x: 1 }), false);" },
    ],
  },
  {
    id: "ex-react-memoize",
    chapter: "react-memoisation",
    level: "intermediate",
    title: "A single-argument memoize",
    brief:
      "<p>Write <code>memoize(fn)</code> returning a wrapped function that caches by its single argument (via <code>JSON.stringify</code>) and only calls <code>fn</code> once per distinct argument.</p>",
    starter:
      "function memoize(fn) {\n  // TODO\n}\n\nlet calls = 0;\nconst double = memoize((n) => { calls++; return n * 2; });\ndouble(3); double(3); double(4);\nconsole.log(calls); // 2\n",
    hints: ["A Map keyed by JSON.stringify(arg) is enough for this exercise's inputs."],
    solution:
      "function memoize(fn) {\n  const cache = new Map();\n  return function (arg) {\n    const key = JSON.stringify(arg);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(arg);\n    cache.set(key, result);\n    return result;\n  };\n}\n",
    tests: [
      {
        name: "calls the underlying function only once per distinct argument",
        body: "let calls = 0;\nconst double = memoize((n) => { calls++; return n * 2; });\ndouble(3); double(3); double(4);\nassert.equal(calls, 2);",
      },
      {
        name: "still returns the correct value",
        body: "const double = memoize((n) => n * 2);\nassert.equal(double(5), 10);",
      },
    ],
  },
  {
    id: "ex-react-pick-fields",
    chapter: "react-context",
    level: "intermediate",
    title: "A selector for a context value",
    brief:
      "<p>Write <code>pickFields(obj, keys)</code> returning a new object with only the listed keys &mdash; the shape of a selector that reads one slice out of a large context value.</p>",
    starter:
      'function pickFields(obj, keys) {\n  // TODO\n}\n\nconsole.log(pickFields({ theme: "dark", user: {}, locale: "en" }, ["theme"]));\n// { theme: "dark" }\n',
    hints: ["Build the result with reduce, or a for...of over keys — either works."],
    solution: "function pickFields(obj, keys) {\n  const out = {};\n  for (const key of keys) out[key] = obj[key];\n  return out;\n}\n",
    tests: [
      { name: "keeps only the requested keys", body: 'assert.deepEqual(pickFields({ a: 1, b: 2, c: 3 }, ["a", "c"]), { a: 1, c: 3 });' },
      { name: "an empty key list gives an empty object", body: "assert.deepEqual(pickFields({ a: 1 }, []), {});" },
      { name: "does not mutate the source", body: 'const src = { a: 1, b: 2 };\npickFields(src, ["a"]);\nassert.deepEqual(src, { a: 1, b: 2 });' },
    ],
  },
  {
    id: "ex-react-relevant-change",
    chapter: "react-context",
    level: "intermediate",
    title: "Did the part this consumer reads change?",
    brief:
      "<p>Write <code>hasRelevantChange(prev, next, keys)</code>: <code>true</code> if any of the listed keys differ between <code>prev</code> and <code>next</code>. This is the reasoning behind splitting one big context into several &mdash; a consumer should only re-render for the keys it actually reads.</p>",
    starter:
      'function hasRelevantChange(prev, next, keys) {\n  // TODO\n}\n\nconsole.log(hasRelevantChange({ theme: "dark", user: "a" }, { theme: "dark", user: "b" }, ["theme"]));\n// false — user changed, but this consumer doesn\'t read it\n',
    hints: ["Object.is per key, same as shallowEqual, but only over the given key list rather than every key."],
    solution: "function hasRelevantChange(prev, next, keys) {\n  return keys.some((key) => !Object.is(prev[key], next[key]));\n}\n",
    tests: [
      {
        name: "ignores changes outside the given keys",
        body: 'assert.equal(hasRelevantChange({ theme: "dark", user: "a" }, { theme: "dark", user: "b" }, ["theme"]), false);',
      },
      {
        name: "detects a change inside the given keys",
        body: 'assert.equal(hasRelevantChange({ theme: "dark" }, { theme: "light" }, ["theme"]), true);',
      },
      {
        name: "true if any one of several keys changed",
        body: 'assert.equal(hasRelevantChange({ a: 1, b: 1 }, { a: 1, b: 2 }, ["a", "b"]), true);',
      },
    ],
  },
  {
    id: "ex-react-normalize",
    chapter: "react-state-architecture",
    level: "intermediate",
    title: "Flatten a list to byId",
    brief:
      "<p>Write <code>normalizeById(list)</code> returning <code>{ byId, allIds }</code>: <code>byId</code> maps each item's <code>id</code> to the item, <code>allIds</code> preserves the original order. This is the flat shape the guided project's task board uses instead of nesting.</p>",
    starter:
      'function normalizeById(list) {\n  // TODO\n}\n\nconsole.log(normalizeById([{ id: "a", n: 1 }, { id: "b", n: 2 }]));\n// { byId: { a: {...}, b: {...} }, allIds: ["a", "b"] }\n',
    hints: ["Build byId with a plain object and computed keys, and allIds with map."],
    solution:
      "function normalizeById(list) {\n  const byId = {};\n  for (const item of list) byId[item.id] = item;\n  return { byId, allIds: list.map((item) => item.id) };\n}\n",
    tests: [
      {
        name: "indexes every item by id",
        body: 'const { byId } = normalizeById([{ id: "a", n: 1 }, { id: "b", n: 2 }]);\nassert.equal(byId.a.n, 1);\nassert.equal(byId.b.n, 2);',
      },
      {
        name: "preserves the original order in allIds",
        body: 'const { allIds } = normalizeById([{ id: "b" }, { id: "a" }]);\nassert.deepEqual(allIds, ["b", "a"]);',
      },
    ],
  },
  {
    id: "ex-react-denormalize",
    chapter: "react-state-architecture",
    level: "intermediate",
    title: "Round-trip back to a list",
    brief:
      "<p>Write <code>denormalize(byId, allIds)</code>, the inverse of <code>normalizeById</code>: rebuild the ordered array of items.</p>",
    starter:
      'function denormalize(byId, allIds) {\n  // TODO\n}\n\nconsole.log(denormalize({ a: { id: "a" }, b: { id: "b" } }, ["b", "a"]));\n// [{ id: "b" }, { id: "a" }]\n',
    hints: ["allIds.map((id) => byId[id])."],
    solution: "function denormalize(byId, allIds) {\n  return allIds.map((id) => byId[id]);\n}\n",
    tests: [
      {
        name: "rebuilds the list in allIds order, not byId's own order",
        body: 'const byId = { a: { id: "a" }, b: { id: "b" } };\nassert.deepEqual(denormalize(byId, ["b", "a"]), [{ id: "b" }, { id: "a" }]);',
      },
      {
        name: "round-trips through normalizeById unchanged",
        body: 'const list = [{ id: "x", n: 1 }, { id: "y", n: 2 }];\nfunction normalizeById(l) { const byId = {}; for (const item of l) byId[item.id] = item; return { byId, allIds: l.map((i) => i.id) }; }\nconst { byId, allIds } = normalizeById(list);\nassert.deepEqual(denormalize(byId, allIds), list);',
      },
    ],
  },
  {
    id: "ex-react-move-task",
    chapter: "react-guided-project",
    level: "beginner",
    title: "Move a task — one field, one update",
    brief:
      "<p>Write <code>moveTask(tasks, id, column)</code> for the flat <code>{ id: { id, title, column } }</code> shape from the guided project. Return a new object where only the matching task's <code>column</code> changed.</p>",
    starter:
      'function moveTask(tasks, id, column) {\n  // TODO\n}\n\nconst t = { a1: { id: "a1", title: "Write", column: "todo" } };\nconsole.log(moveTask(t, "a1", "done").a1.column); // "done"\n',
    hints: ["{ ...tasks, [id]: { ...tasks[id], column } } — two spreads, one nested."],
    solution: "function moveTask(tasks, id, column) {\n  return { ...tasks, [id]: { ...tasks[id], column } };\n}\n",
    tests: [
      {
        name: "moves the matching task to the new column",
        body: 'const t = { a: { id: "a", column: "todo" } };\nassert.equal(moveTask(t, "a", "done").a.column, "done");',
      },
      {
        name: "leaves the task's other fields alone",
        body: 'const t = { a: { id: "a", title: "Write", column: "todo" } };\nassert.equal(moveTask(t, "a", "done").a.title, "Write");',
      },
      {
        name: "leaves other tasks untouched",
        body: 'const t = { a: { id: "a", column: "todo" }, b: { id: "b", column: "doing" } };\nassert.equal(moveTask(t, "a", "done").b.column, "doing");',
      },
      {
        name: "does not mutate the original object",
        body: 'const t = { a: { id: "a", column: "todo" } };\nmoveTask(t, "a", "done");\nassert.equal(t.a.column, "todo");',
      },
    ],
  },
  {
    id: "ex-react-remove-task",
    chapter: "react-guided-project",
    level: "beginner",
    title: "Delete by destructuring it out",
    brief:
      "<p>Write <code>removeTask(tasks, id)</code> returning a new object with the given key removed &mdash; using destructuring, not <code>delete</code>.</p>",
    starter:
      'function removeTask(tasks, id) {\n  // TODO\n}\n\nconst t = { a: { id: "a" }, b: { id: "b" } };\nconsole.log(removeTask(t, "a")); // { b: { id: "b" } }\n',
    hints: ['const { [id]: _gone, ...rest } = tasks; return rest;'],
    solution: "function removeTask(tasks, id) {\n  const { [id]: _gone, ...rest } = tasks;\n  return rest;\n}\n",
    tests: [
      { name: "removes the matching task", body: 'const t = { a: { id: "a" }, b: { id: "b" } };\nassert.equal("a" in removeTask(t, "a"), false);' },
      { name: "keeps every other task", body: 'const t = { a: { id: "a" }, b: { id: "b" } };\nassert.equal("b" in removeTask(t, "a"), true);' },
      { name: "does not mutate the original object", body: 'const t = { a: { id: "a" } };\nremoveTask(t, "a");\nassert.equal("a" in t, true);' },
      { name: "removing a missing id just returns an equivalent object", body: 'const t = { a: { id: "a" } };\nassert.deepEqual(removeTask(t, "z"), { a: { id: "a" } });' },
    ],
  },
  {
    id: "ex-react-read-search",
    chapter: "react-router",
    level: "intermediate",
    title: "Filters from the query string",
    brief:
      "<p>Write <code>readFilters(search)</code> for a query string like <code>\"?page=2&amp;sort=price&amp;tag=a&amp;tag=b\"</code>. Return <code>{ page, sort, tags }</code>: <code>page</code> is a whole number of at least 1, defaulting to 1 for anything else; <code>sort</code> is <code>\"price\"</code> or <code>\"newest\"</code>, defaulting to <code>\"newest\"</code>; <code>tags</code> is every <code>tag</code> value in order. A shared link can contain anything, so never throw.</p>",
    starter:
      'function readFilters(search) {\n  // TODO\n}\n\nconsole.log(readFilters("?page=2&sort=price&tag=a&tag=b"));\n// { page: 2, sort: "price", tags: ["a", "b"] }\nconsole.log(readFilters("?page=abc&sort=cheap"));\n// { page: 1, sort: "newest", tags: [] }\n',
    hints: [
      "new URLSearchParams(search) parses the string; get returns null for a missing key, getAll returns an array.",
      "Every value is a string. Number(value) then Number.isInteger and a >= 1 check rejects \"abc\", \"0\" and \"2.5\".",
      "Treat sort as an allow-list: only the exact string \"price\" is accepted.",
    ],
    solution:
      'function readFilters(search) {\n  const params = new URLSearchParams(search);\n  const n = Number(params.get("page"));\n  const page = Number.isInteger(n) && n >= 1 ? n : 1;\n  const sort = params.get("sort") === "price" ? "price" : "newest";\n  return { page, sort, tags: params.getAll("tag") };\n}\n',
    tests: [
      { name: "reads valid values", body: 'assert.deepEqual(readFilters("?page=3&sort=price"), { page: 3, sort: "price", tags: [] });' },
      { name: "defaults when the string is empty", body: 'assert.deepEqual(readFilters(""), { page: 1, sort: "newest", tags: [] });' },
      { name: "rejects a page that is not a positive whole number", body: 'assert.equal(readFilters("?page=abc").page, 1);\nassert.equal(readFilters("?page=0").page, 1);\nassert.equal(readFilters("?page=2.5").page, 1);' },
      { name: "rejects an unknown sort", body: 'assert.equal(readFilters("?sort=cheap").sort, "newest");' },
      { name: "collects repeated tags in order", body: 'assert.deepEqual(readFilters("?tag=b&tag=a").tags, ["b", "a"]);' },
    ],
  },
  {
    id: "ex-react-create-store",
    chapter: "react-state-libraries",
    level: "intermediate",
    title: "A store in twenty lines",
    brief:
      "<p>Write <code>createStore(initial)</code> returning <code>{ getState, setState, subscribe }</code>, the core every store library shares. <code>setState</code> takes an object to merge shallowly, or a function of the current state returning one. <code>subscribe(listener)</code> returns an unsubscribe function, and listeners receive the new state. If the update returns the current state object itself, change nothing and notify nobody.</p>",
    starter:
      'function createStore(initial) {\n  // TODO\n}\n\nconst store = createStore({ count: 0, user: null });\nstore.subscribe((s) => console.log("changed", s.count));\nstore.setState((s) => ({ count: s.count + 1 })); // changed 1\nconsole.log(store.getState()); // { count: 1, user: null }\n',
    hints: [
      "Keep the state in a variable inside the closure, and the listeners in a Set.",
      "Resolve the update first: typeof update === \"function\" ? update(state) : update.",
      "Compare with Object.is before merging. Merge into a new object, { ...state, ...next }, so the old state is never edited.",
    ],
    solution:
      'function createStore(initial) {\n  let state = initial;\n  const listeners = new Set();\n  return {\n    getState: () => state,\n    setState(update) {\n      const next = typeof update === "function" ? update(state) : update;\n      if (Object.is(next, state)) return;\n      state = { ...state, ...next };\n      listeners.forEach((listener) => listener(state));\n    },\n    subscribe(listener) {\n      listeners.add(listener);\n      return () => listeners.delete(listener);\n    },\n  };\n}\n',
    tests: [
      { name: "merges an object update", body: 'const s = createStore({ a: 1, b: 2 });\ns.setState({ b: 3 });\nassert.deepEqual(s.getState(), { a: 1, b: 3 });' },
      { name: "accepts an updater function", body: 'const s = createStore({ count: 1 });\ns.setState((st) => ({ count: st.count + 1 }));\nassert.equal(s.getState().count, 2);' },
      { name: "never edits the previous state object", body: 'const s = createStore({ count: 1 });\nconst before = s.getState();\ns.setState({ count: 2 });\nassert.equal(before.count, 1);\nassert.notEqual(s.getState(), before);' },
      { name: "notifies with the new state, and stops after unsubscribe", body: 'const s = createStore({ n: 0 });\nconst seen = [];\nconst off = s.subscribe((st) => seen.push(st.n));\ns.setState({ n: 1 });\noff();\ns.setState({ n: 2 });\nassert.deepEqual(seen, [1]);' },
      { name: "returning the same state notifies nobody", body: 'const s = createStore({ n: 0 });\nlet calls = 0;\ns.subscribe(() => calls++);\ns.setState((st) => st);\nassert.equal(calls, 0);' },
    ],
  },
  {
    id: "ex-react-describe-state",
    chapter: "react-typescript",
    level: "intermediate",
    title: "Handle every branch of a union",
    brief:
      "<p>Write <code>describeState(state)</code> for a request state shaped as a discriminated union: <code>{ status: \"idle\" }</code> gives <code>\"Not started\"</code>, <code>{ status: \"loading\" }</code> gives <code>\"Loading\"</code>, <code>{ status: \"error\", error }</code> gives <code>\"Failed: \"</code> plus the error's message, and <code>{ status: \"ready\", data }</code> gives the number of items followed by <code>\" items\"</code>. Any other status must throw an <code>Error</code> whose message includes it &mdash; the runtime half of an <code>assertNever</code> check.</p>",
    starter:
      'function describeState(state) {\n  // TODO\n}\n\nconsole.log(describeState({ status: "ready", data: [1, 2] })); // "2 items"\nconsole.log(describeState({ status: "error", error: new Error("timeout") })); // "Failed: timeout"\n',
    hints: [
      "Switch on state.status. Inside each case, read only the fields that branch has.",
      "The default case is where assertNever would go in TypeScript: throw new Error(\"Unhandled status: \" + state.status).",
    ],
    solution:
      'function describeState(state) {\n  switch (state.status) {\n    case "idle":\n      return "Not started";\n    case "loading":\n      return "Loading";\n    case "error":\n      return "Failed: " + state.error.message;\n    case "ready":\n      return state.data.length + " items";\n    default:\n      throw new Error("Unhandled status: " + state.status);\n  }\n}\n',
    tests: [
      { name: "idle and loading", body: 'assert.equal(describeState({ status: "idle" }), "Not started");\nassert.equal(describeState({ status: "loading" }), "Loading");' },
      { name: "error reads the message", body: 'assert.equal(describeState({ status: "error", error: new Error("boom") }), "Failed: boom");' },
      { name: "ready counts the data", body: 'assert.equal(describeState({ status: "ready", data: [] }), "0 items");\nassert.equal(describeState({ status: "ready", data: ["a", "b", "c"] }), "3 items");' },
      { name: "an unknown status throws and names it", body: 'assert.throws(() => describeState({ status: "stale" }), /stale/);' },
    ],
  },
  {
    id: "ex-react-previous-value",
    chapter: "react-useref",
    level: "intermediate",
    title: "The box behind usePrevious",
    brief:
      "<p>A ref is a box that survives renders without causing one. Write <code>createPreviousTracker()</code> returning a function <code>track(value)</code> that returns the value it was called with <b>last time</b> &mdash; <code>undefined</code> on the first call &mdash; and then remembers the new one. Each tracker keeps its own memory, the way each component instance gets its own ref.</p>",
    starter:
      "function createPreviousTracker() {\n  // TODO\n}\n\nconst track = createPreviousTracker();\nconsole.log(track(1)); // undefined\nconsole.log(track(2)); // 1\nconsole.log(track(5)); // 2\n",
    hints: [
      "Hold the last value in a variable inside createPreviousTracker; that variable is your ref.current.",
      "Read the old value into a local before overwriting it, then return the local.",
    ],
    solution:
      "function createPreviousTracker() {\n  let current;\n  return function track(value) {\n    const previous = current;\n    current = value;\n    return previous;\n  };\n}\n",
    tests: [
      { name: "the first call returns undefined", body: "const track = createPreviousTracker();\nassert.equal(track(\"a\"), undefined);" },
      { name: "each call returns the value before it", body: "const track = createPreviousTracker();\ntrack(1);\nassert.equal(track(2), 1);\nassert.equal(track(3), 2);" },
      { name: "the same value twice returns itself", body: "const track = createPreviousTracker();\ntrack(7);\nassert.equal(track(7), 7);" },
      { name: "two trackers do not share memory", body: "const a = createPreviousTracker();\nconst b = createPreviousTracker();\na(1);\nassert.equal(b(2), undefined);\nassert.equal(a(3), 1);" },
    ],
  },
  {
    id: "ex-react-hash-query-key",
    chapter: "react-server-state",
    level: "intermediate",
    title: "Hash a query key",
    brief:
      "<p>A query cache stores entries under a string made from the key array. Write <code>hashQueryKey(key)</code> so that keys differing only in the <b>order of object properties</b> hash the same, at any depth, while array order still matters. <code>[\"todos\", { status: \"done\", page: 1 }]</code> and <code>[\"todos\", { page: 1, status: \"done\" }]</code> must match.</p>",
    starter:
      'function hashQueryKey(key) {\n  // TODO\n}\n\nconsole.log(hashQueryKey(["todos", { status: "done", page: 1 }]) ===\n  hashQueryKey(["todos", { page: 1, status: "done" }])); // true\n',
    hints: [
      "JSON.stringify accepts a replacer function that is called for every value, nested ones included.",
      "When the value is a plain object (not null, not an array), return a copy built from Object.keys(value).sort().",
    ],
    solution:
      'function hashQueryKey(key) {\n  return JSON.stringify(key, (_, value) => {\n    if (value && typeof value === "object" && !Array.isArray(value)) {\n      const sorted = {};\n      for (const k of Object.keys(value).sort()) sorted[k] = value[k];\n      return sorted;\n    }\n    return value;\n  });\n}\n',
    tests: [
      { name: "property order does not matter", body: 'const h = hashQueryKey(["t", { b: 1, a: 2 }]);\nassert.equal(typeof h, "string");\nassert.equal(h, hashQueryKey(["t", { a: 2, b: 1 }]));' },
      { name: "nested property order does not matter", body: 'const h = hashQueryKey([{ f: { y: 1, x: 2 } }]);\nassert.equal(typeof h, "string");\nassert.equal(h, hashQueryKey([{ f: { x: 2, y: 1 } }]));' },
      { name: "array order still matters", body: 'assert.notEqual(hashQueryKey(["a", "b"]), hashQueryKey(["b", "a"]));' },
      { name: "different values hash differently", body: 'assert.notEqual(hashQueryKey(["t", { page: 1 }]), hashQueryKey(["t", { page: 2 }]));' },
      { name: "returns a string", body: 'assert.equal(typeof hashQueryKey(["todos"]), "string");' },
    ],
  },
  {
    id: "ex-react-request-guard",
    chapter: "react-data-fetching",
    level: "intermediate",
    title: "Ignore the response that lost the race",
    brief:
      "<p>Type \"re\", then \"react\": if the first request answers last, a naive fetch shows results for \"re\". Write <code>createRequestGuard()</code> returning <code>{ start, isLatest, cancel }</code>. <code>start()</code> returns an id for a new request; <code>isLatest(id)</code> is true only for the most recently started request; <code>cancel()</code> makes every id started so far stale, for cleanup on unmount.</p>",
    starter:
      "function createRequestGuard() {\n  // TODO\n}\n\nconst guard = createRequestGuard();\nconst first = guard.start();\nconst second = guard.start();\nconsole.log(guard.isLatest(first));  // false — ignore its response\nconsole.log(guard.isLatest(second)); // true\n",
    hints: [
      "A single counter is enough. start increments it and returns the new value.",
      "cancel can also just increment the counter: no id handed out so far will equal it.",
    ],
    solution:
      "function createRequestGuard() {\n  let latest = 0;\n  return {\n    start() {\n      latest += 1;\n      return latest;\n    },\n    isLatest(id) {\n      return id === latest;\n    },\n    cancel() {\n      latest += 1;\n    },\n  };\n}\n",
    tests: [
      { name: "a lone request is the latest", body: "const g = createRequestGuard();\nconst id = g.start();\nassert.equal(g.isLatest(id), true);" },
      { name: "an older request is not the latest", body: "const g = createRequestGuard();\nconst a = g.start();\nconst b = g.start();\nassert.equal(g.isLatest(a), false);\nassert.equal(g.isLatest(b), true);" },
      { name: "cancel makes every started request stale", body: "const g = createRequestGuard();\nconst a = g.start();\ng.cancel();\nassert.equal(g.isLatest(a), false);" },
      { name: "a request started after cancel is the latest again", body: "const g = createRequestGuard();\ng.start();\ng.cancel();\nconst c = g.start();\nassert.equal(g.isLatest(c), true);" },
      { name: "two guards are independent", body: "const g1 = createRequestGuard();\nconst g2 = createRequestGuard();\nconst a = g1.start();\ng2.start();\ng2.start();\nassert.equal(g1.isLatest(a), true);" },
    ],
  },
  {
    id: "ex-react-field-errors",
    chapter: "react-forms-at-scale",
    level: "intermediate",
    title: "Validation issues to field errors",
    brief:
      "<p>A schema validator returns a list of issues like <code>{ path: [\"address\", \"city\"], message: \"Required\" }</code>. Write <code>toFieldErrors(issues)</code> returning an object mapping each field to its <b>first</b> message. Join a nested path with dots (<code>\"address.city\"</code>), and put issues with an empty path under <code>\"_form\"</code>.</p>",
    starter:
      'function toFieldErrors(issues) {\n  // TODO\n}\n\nconsole.log(toFieldErrors([\n  { path: ["email"], message: "Invalid email" },\n  { path: ["email"], message: "Too long" },\n  { path: [], message: "Passwords do not match" },\n]));\n// { email: "Invalid email", _form: "Passwords do not match" }\n',
    hints: [
      "path.join(\".\") handles nested paths, and an empty join gives \"\" which you can swap for \"_form\".",
      "Only assign when the field has no message yet, so the first issue wins.",
      "Array indexes in a path are numbers; join turns them into strings for you.",
    ],
    solution:
      'function toFieldErrors(issues) {\n  const errors = {};\n  for (const issue of issues) {\n    const field = issue.path.join(".") || "_form";\n    if (!(field in errors)) errors[field] = issue.message;\n  }\n  return errors;\n}\n',
    tests: [
      { name: "maps a field to its message", body: 'assert.deepEqual(toFieldErrors([{ path: ["name"], message: "Required" }]), { name: "Required" });' },
      { name: "keeps the first message per field", body: 'const e = toFieldErrors([{ path: ["email"], message: "first" }, { path: ["email"], message: "second" }]);\nassert.equal(e.email, "first");' },
      { name: "joins nested paths, including array indexes", body: 'const e = toFieldErrors([{ path: ["items", 0, "qty"], message: "Too low" }]);\nassert.deepEqual(e, { "items.0.qty": "Too low" });' },
      { name: "an empty path is a form-level error", body: 'assert.deepEqual(toFieldErrors([{ path: [], message: "Mismatch" }]), { _form: "Mismatch" });' },
      { name: "no issues gives an empty object", body: "assert.deepEqual(toFieldErrors([]), {});" },
    ],
  },
  {
    id: "ex-react-token-expired",
    chapter: "react-auth",
    level: "intermediate",
    title: "Is the token about to expire?",
    brief:
      "<p>A JWT's <code>exp</code> claim is in <b>seconds</b> since the epoch; <code>Date.now()</code> is in milliseconds. Write <code>isTokenExpired(exp, nowMs, skewSeconds)</code> that returns true when the token is expired or will expire within <code>skewSeconds</code> (default 30), so the client refreshes before a request fails. A missing or non-numeric <code>exp</code> counts as expired.</p>",
    starter:
      "function isTokenExpired(exp, nowMs, skewSeconds = 30) {\n  // TODO\n}\n\nconst now = 1_700_000_000_000;\nconsole.log(isTokenExpired(1_700_000_100, now)); // false — 100s left\nconsole.log(isTokenExpired(1_700_000_010, now)); // true — inside the 30s skew\n",
    hints: [
      "Convert once: nowMs / 1000 is the current time in seconds.",
      "Expired means now >= exp - skewSeconds.",
      "typeof exp !== \"number\" or Number.isNaN(exp) should return true before any maths.",
    ],
    solution:
      'function isTokenExpired(exp, nowMs, skewSeconds = 30) {\n  if (typeof exp !== "number" || Number.isNaN(exp)) return true;\n  return nowMs / 1000 >= exp - skewSeconds;\n}\n',
    tests: [
      { name: "a token with plenty of time left is valid", body: "assert.equal(isTokenExpired(1000 + 3600, 1000 * 1000), false);" },
      { name: "a token past its exp is expired", body: "assert.equal(isTokenExpired(900, 1000 * 1000), true);" },
      { name: "a token inside the skew window counts as expired", body: "assert.equal(isTokenExpired(1010, 1000 * 1000), true);\nassert.equal(isTokenExpired(1010, 1000 * 1000, 5), false);" },
      { name: "compares seconds with milliseconds correctly", body: "assert.equal(isTokenExpired(1_700_000_100, 1_700_000_000_000), false);" },
      { name: "a missing exp is expired", body: "assert.equal(isTokenExpired(undefined, 0), true);\nassert.equal(isTokenExpired(\"soon\", 0), true);" },
    ],
  },
  {
    id: "ex-react-pick-plural",
    chapter: "react-i18n",
    level: "intermediate",
    title: "Choose the right plural form",
    brief: "<p>Write <code>pickPlural(count, forms, locale = \"en\")</code>. <code>forms</code> maps CLDR plural categories (<code>zero</code>, <code>one</code>, <code>two</code>, <code>few</code>, <code>many</code>, <code>other</code>) to strings. Return the form for <code>count</code> in that locale. If the locale needs a category the object does not supply, fall back to <code>other</code>. Do not hard-code English rules: Russian, for example, distinguishes 1 (one), 2 to 4 (few) and 5 or more (many).</p>",
    starter: "function pickPlural(count, forms, locale = \"en\") {\n  // TODO\n}\n\nconst files = { one: \"file\", other: \"files\" };\nconsole.log(pickPlural(1, files)); // \"file\"\nconsole.log(pickPlural(0, files)); // \"files\"\nconsole.log(pickPlural(2, { one: \"file\", few: \"few files\", many: \"many files\", other: \"files\" }, \"ru\")); // \"few files\"\n",
    hints: [
      "new Intl.PluralRules(locale).select(count) returns the category name for you.",
      "Look the category up in forms, and use ?? forms.other when it is missing.",
    ],
    solution: "function pickPlural(count, forms, locale = \"en\") {\n  const category = new Intl.PluralRules(locale).select(count);\n  return forms[category] ?? forms.other;\n}\n",
    tests: [
      { name: "English has one and other", body: "const f = { one: \"file\", other: \"files\" };\nassert.equal(pickPlural(1, f), \"file\");\nassert.equal(pickPlural(0, f), \"files\");\nassert.equal(pickPlural(2, f), \"files\");" },
      { name: "Russian has one, few and many", body: "const f = { one: \"one\", few: \"few\", many: \"many\", other: \"other\" };\nassert.equal(pickPlural(1, f, \"ru\"), \"one\");\nassert.equal(pickPlural(2, f, \"ru\"), \"few\");\nassert.equal(pickPlural(5, f, \"ru\"), \"many\");\nassert.equal(pickPlural(21, f, \"ru\"), \"one\");\nassert.equal(pickPlural(22, f, \"ru\"), \"few\");" },
      { name: "Arabic has zero and two", body: "const f = { zero: \"zero\", one: \"one\", two: \"two\", few: \"few\", many: \"many\", other: \"other\" };\nassert.equal(pickPlural(0, f, \"ar\"), \"zero\");\nassert.equal(pickPlural(2, f, \"ar\"), \"two\");" },
      { name: "a missing category falls back to other", body: "const f = { one: \"one\", other: \"other\" };\nassert.equal(pickPlural(3, f, \"ru\"), \"other\");" },
      { name: "fractions use the locale rules too", body: "const f = { one: \"one\", other: \"other\" };\nassert.equal(pickPlural(1.5, f), \"other\");" },
    ],
  },
  {
    id: "ex-react-validate-files",
    chapter: "react-file-uploads",
    level: "intermediate",
    title: "Validate a batch of files",
    brief: "<p>Write <code>validateFiles(files, { maxBytes, accept, maxCount })</code>. Each file is <code>{ name, size, type }</code>. <code>accept</code> is a list such as <code>[\"image/*\", \".pdf\", \"text/plain\"]</code>: a leading dot matches the file extension (case-insensitive), a trailing <code>/*</code> matches the type prefix, anything else must equal the type. An empty or missing list allows everything. Return <code>{ accepted, rejected }</code>, where <code>rejected</code> holds <code>{ name, reason }</code>. Check in this order and report the first failure: <code>\"wrong type\"</code>, <code>\"too large\"</code>, then <code>\"too many files\"</code>. Only accepted files count toward <code>maxCount</code>.</p>",
    starter: "function validateFiles(files, { maxBytes = Infinity, accept = [], maxCount = Infinity } = {}) {\n  // TODO\n}\n\nconsole.log(validateFiles(\n  [{ name: \"a.png\", size: 100, type: \"image/png\" }, { name: \"b.exe\", size: 100, type: \"\" }],\n  { accept: [\"image/*\"] }\n));\n// accepted: [a.png], rejected: [{ name: \"b.exe\", reason: \"wrong type\" }]\n",
    hints: [
      "Write a small matchesAccept(file, accept) helper first: three cases, dot, wildcard, exact.",
      "Lower-case the name and type before comparing.",
      "Push to accepted only after all three checks pass, so accepted.length is the running count for maxCount.",
    ],
    solution: "function matchesAccept(file, accept) {\n  if (!accept || accept.length === 0) return true;\n  const name = file.name.toLowerCase();\n  const type = (file.type || \"\").toLowerCase();\n  return accept.some((rule) => {\n    const r = rule.trim().toLowerCase();\n    if (r.startsWith(\".\")) return name.endsWith(r);\n    if (r.endsWith(\"/*\")) return type.startsWith(r.slice(0, -1));\n    return type === r;\n  });\n}\n\nfunction validateFiles(files, { maxBytes = Infinity, accept = [], maxCount = Infinity } = {}) {\n  const accepted = [];\n  const rejected = [];\n  for (const file of files) {\n    let reason = null;\n    if (!matchesAccept(file, accept)) reason = \"wrong type\";\n    else if (file.size > maxBytes) reason = \"too large\";\n    else if (accepted.length >= maxCount) reason = \"too many files\";\n    if (reason) rejected.push({ name: file.name, reason });\n    else accepted.push(file);\n  }\n  return { accepted, rejected };\n}\n",
    tests: [
      { name: "accepts everything when no rules are given", body: "const f = { name: \"a.bin\", size: 5, type: \"application/octet-stream\" };\nconst r = validateFiles([f]);\nassert.equal(r.accepted.length, 1);\nassert.equal(r.rejected.length, 0);" },
      { name: "a wildcard matches the type prefix", body: "const png = { name: \"a.png\", size: 1, type: \"image/png\" };\nconst txt = { name: \"a.txt\", size: 1, type: \"text/plain\" };\nconst r = validateFiles([png, txt], { accept: [\"image/*\"] });\nassert.deepEqual(r.accepted, [png]);\nassert.deepEqual(r.rejected, [{ name: \"a.txt\", reason: \"wrong type\" }]);" },
      { name: "an extension rule is case-insensitive", body: "const f = { name: \"REPORT.PDF\", size: 1, type: \"\" };\nassert.equal(validateFiles([f], { accept: [\".pdf\"] }).accepted.length, 1);" },
      { name: "an exact type must match exactly", body: "const f = { name: \"a.txt\", size: 1, type: \"text/html\" };\nassert.equal(validateFiles([f], { accept: [\"text/plain\"] }).rejected.length, 1);" },
      { name: "rejects files over the size limit", body: "const big = { name: \"big.png\", size: 1001, type: \"image/png\" };\nconst ok = { name: \"ok.png\", size: 1000, type: \"image/png\" };\nconst r = validateFiles([big, ok], { maxBytes: 1000 });\nassert.deepEqual(r.rejected, [{ name: \"big.png\", reason: \"too large\" }]);\nassert.deepEqual(r.accepted, [ok]);" },
      { name: "maxCount counts only accepted files", body: "const mk = (n, size) => ({ name: n, size, type: \"image/png\" });\nconst r = validateFiles([mk(\"a\", 9999), mk(\"b\", 1), mk(\"c\", 1), mk(\"d\", 1)], { maxBytes: 100, maxCount: 2 });\nassert.deepEqual(r.accepted.map((f) => f.name), [\"b\", \"c\"]);\nassert.deepEqual(r.rejected, [{ name: \"a\", reason: \"too large\" }, { name: \"d\", reason: \"too many files\" }]);" },
      { name: "the type check wins over size", body: "const f = { name: \"x.exe\", size: 9999, type: \"\" };\nconst r = validateFiles([f], { accept: [\"image/*\"], maxBytes: 10 });\nassert.equal(r.rejected[0].reason, \"wrong type\");" },
    ],
  },
  {
    id: "ex-react-parse-sse",
    chapter: "react-realtime",
    level: "intermediate",
    title: "Parse a Server-Sent Events chunk",
    brief: "<p>Write <code>parseSseChunk(text)</code> that turns the text of an <code>text/event-stream</code> response into events. Messages are separated by a blank line. Each line is <code>field: value</code> (drop a single space after the colon). <code>data</code> lines in one message are joined with <code>\"\\n\"</code>; <code>event</code> sets the name (default <code>\"message\"</code>); <code>id</code> sets the id (default <code>null</code>). Lines starting with <code>:</code> are comments, and other fields such as <code>retry</code> are ignored. A message with no <code>data</code> produces no event. Accept <code>\\r\\n</code> line endings.</p>",
    starter: "function parseSseChunk(text) {\n  // TODO\n}\n\nconsole.log(parseSseChunk('id: 7\\nevent: order\\ndata: {\"ok\":true}\\n\\ndata: hello\\n\\n'));\n// [{ event: \"order\", data: '{\"ok\":true}', id: \"7\" }, { event: \"message\", data: \"hello\", id: null }]\n",
    hints: [
      "Normalise first: text.replace(/\\r\\n?/g, \"\\n\"), then split on \\n\\n.",
      "For each line, find the first colon. The field is before it; the value is after it, minus one leading space.",
      "Collect data lines in an array and join at the end; only push an event if the array is not empty.",
    ],
    solution: "function parseSseChunk(text) {\n  const events = [];\n  for (const block of text.replace(/\\r\\n?/g, \"\\n\").split(/\\n\\n+/)) {\n    let event = \"message\";\n    let id = null;\n    const data = [];\n    for (const line of block.split(\"\\n\")) {\n      if (line === \"\" || line.startsWith(\":\")) continue;\n      const i = line.indexOf(\":\");\n      const field = i === -1 ? line : line.slice(0, i);\n      let value = i === -1 ? \"\" : line.slice(i + 1);\n      if (value.startsWith(\" \")) value = value.slice(1);\n      if (field === \"data\") data.push(value);\n      else if (field === \"event\") event = value;\n      else if (field === \"id\") id = value;\n    }\n    if (data.length > 0) events.push({ event, data: data.join(\"\\n\"), id });\n  }\n  return events;\n}\n",
    tests: [
      { name: "a plain message", body: "assert.deepEqual(parseSseChunk(\"data: hello\\n\\n\"), [{ event: \"message\", data: \"hello\", id: null }]);" },
      { name: "named events and ids", body: "const r = parseSseChunk(\"id: 7\\nevent: order\\ndata: {}\\n\\n\");\nassert.deepEqual(r, [{ event: \"order\", data: \"{}\", id: \"7\" }]);" },
      { name: "several messages in one chunk", body: "const r = parseSseChunk(\"data: a\\n\\ndata: b\\n\\n\");\nassert.deepEqual(r.map((e) => e.data), [\"a\", \"b\"]);" },
      { name: "multi-line data is joined with a newline", body: "const r = parseSseChunk(\"data: one\\ndata: two\\n\\n\");\nassert.equal(r[0].data, \"one\\ntwo\");" },
      { name: "comments and unknown fields are ignored", body: "const r = parseSseChunk(\": ping\\n\\nretry: 3000\\ndata: x\\n\\n\");\nassert.deepEqual(r, [{ event: \"message\", data: \"x\", id: null }]);" },
      { name: "only one leading space is dropped", body: "assert.equal(parseSseChunk(\"data:  padded\\n\\n\")[0].data, \" padded\");\nassert.equal(parseSseChunk(\"data:tight\\n\\n\")[0].data, \"tight\");" },
      { name: "CRLF line endings work", body: "const r = parseSseChunk(\"event: e\\r\\ndata: d\\r\\n\\r\\n\");\nassert.deepEqual(r, [{ event: \"e\", data: \"d\", id: null }]);" },
      { name: "a message with no data is skipped", body: "assert.deepEqual(parseSseChunk(\"event: ping\\n\\n\"), []);" },
    ],
  },
  {
    id: "ex-react-variants",
    chapter: "react-shadcn",
    level: "intermediate",
    title: "A tiny class-variance-authority",
    brief: "<p>shadcn/ui components pick class names with <code>cva</code>. Write <code>variantClasses(config, props)</code>. <code>config</code> is <code>{ base, variants, defaultVariants }</code>, where <code>variants</code> maps a prop name to <code>{ value: \"classes\" }</code>. Return the base classes followed by the class for each variant, in the order the variants appear in the config, joined by single spaces. A prop that is <code>undefined</code> or <code>null</code> uses its default; a value with no matching entry adds nothing.</p>",
    starter: "function variantClasses(config, props = {}) {\n  // TODO\n}\n\nconst button = {\n  base: \"btn\",\n  variants: { variant: { primary: \"bg-blue\", ghost: \"bg-none\" }, size: { sm: \"h-8\", lg: \"h-10\" } },\n  defaultVariants: { variant: \"primary\", size: \"sm\" },\n};\nconsole.log(variantClasses(button, { size: \"lg\" })); // \"btn bg-blue h-10\"\n",
    hints: [
      "Loop over Object.keys(config.variants), not over props: the config decides the order.",
      "props[name] ?? defaultVariants[name] handles both undefined and null.",
      "Filter out empty strings before joining so a missing base does not leave a leading space.",
    ],
    solution: "function variantClasses(config, props = {}) {\n  const { base = \"\", variants = {}, defaultVariants = {} } = config;\n  const classes = [base];\n  for (const name of Object.keys(variants)) {\n    const chosen = props[name] ?? defaultVariants[name];\n    if (chosen !== undefined && variants[name][chosen]) classes.push(variants[name][chosen]);\n  }\n  return classes.filter(Boolean).join(\" \");\n}\n",
    tests: [
      { name: "uses the defaults when no props are given", body: "const c = { base: \"btn\", variants: { size: { sm: \"h-8\", lg: \"h-10\" } }, defaultVariants: { size: \"sm\" } };\nassert.equal(variantClasses(c), \"btn h-8\");" },
      { name: "props override the defaults", body: "const c = { base: \"btn\", variants: { size: { sm: \"h-8\", lg: \"h-10\" } }, defaultVariants: { size: \"sm\" } };\nassert.equal(variantClasses(c, { size: \"lg\" }), \"btn h-10\");" },
      { name: "output follows config order, not prop order", body: "const c = { base: \"b\", variants: { a: { x: \"ax\" }, z: { y: \"zy\" } }, defaultVariants: {} };\nassert.equal(variantClasses(c, { z: \"y\", a: \"x\" }), \"b ax zy\");" },
      { name: "an unknown value adds nothing", body: "const c = { base: \"b\", variants: { size: { sm: \"h-8\" } }, defaultVariants: {} };\nassert.equal(variantClasses(c, { size: \"huge\" }), \"b\");" },
      { name: "null falls back to the default", body: "const c = { base: \"b\", variants: { size: { sm: \"h-8\" } }, defaultVariants: { size: \"sm\" } };\nassert.equal(variantClasses(c, { size: null }), \"b h-8\");" },
      { name: "no variants and no base", body: "assert.equal(variantClasses({ variants: { s: { a: \"x\" } }, defaultVariants: { s: \"a\" } }), \"x\");\nassert.equal(variantClasses({}), \"\");" },
    ],
  },
  {
    id: "ex-react-machine-transition",
    chapter: "react-state-machines",
    level: "advanced",
    title: "Run a state machine",
    brief: "<p>A machine is data: <code>{ states: { idle: { on: { FETCH: \"loading\" } }, ... } }</code>. A transition is either a target name or <code>{ target, guard }</code>, where <code>guard(context)</code> must return true for it to apply. Write <code>transition(config, state, event, context)</code>, which returns the next state name, or the <b>same</b> state when the event is not handled or its guard fails. Also write <code>availableEvents(config, state, context)</code>, which lists the events that would currently do something. Both throw <code>Error(\"Unknown state: \" + name)</code> for a state the config does not have.</p>",
    starter: "function transition(config, state, event, context) {\n  // TODO\n}\n\nfunction availableEvents(config, state, context) {\n  // TODO\n}\n\nconst fetchMachine = {\n  states: {\n    idle: { on: { FETCH: \"loading\" } },\n    loading: { on: { RESOLVE: \"success\", REJECT: \"error\" } },\n    success: {},\n    error: { on: { RETRY: { target: \"loading\", guard: (ctx) => ctx.attempts < 3 } } },\n  },\n};\nconsole.log(transition(fetchMachine, \"idle\", \"FETCH\")); // \"loading\"\nconsole.log(transition(fetchMachine, \"idle\", \"RESOLVE\")); // \"idle\": ignored\n",
    hints: [
      "Both functions need the same lookup, so write one helper that returns the target or null.",
      "A transition entry can be a string: normalise it with typeof t === \"string\" ? { target: t } : t.",
      "availableEvents is Object.keys(node.on ?? {}) filtered through the same helper.",
    ],
    solution: "function resolve(config, state, event, context) {\n  const node = config.states[state];\n  if (!node) throw new Error(\"Unknown state: \" + state);\n  const t = node.on?.[event];\n  if (t === undefined) return null;\n  const { target, guard } = typeof t === \"string\" ? { target: t } : t;\n  if (guard && !guard(context)) return null;\n  return target;\n}\n\nfunction transition(config, state, event, context) {\n  return resolve(config, state, event, context) ?? state;\n}\n\nfunction availableEvents(config, state, context) {\n  const node = config.states[state];\n  if (!node) throw new Error(\"Unknown state: \" + state);\n  return Object.keys(node.on ?? {}).filter((e) => resolve(config, state, e, context) !== null);\n}\n",
    tests: [
      { name: "follows a handled event", body: "const m = { states: { idle: { on: { GO: \"busy\" } }, busy: {} } };\nassert.equal(transition(m, \"idle\", \"GO\"), \"busy\");" },
      { name: "an unhandled event leaves the state alone", body: "const m = { states: { idle: { on: { GO: \"busy\" } }, busy: {} } };\nassert.equal(transition(m, \"busy\", \"GO\"), \"busy\");\nassert.equal(transition(m, \"idle\", \"NOPE\"), \"idle\");" },
      { name: "a passing guard allows the transition", body: "const m = { states: { a: { on: { GO: { target: \"b\", guard: (c) => c.ok } } }, b: {} } };\nassert.equal(transition(m, \"a\", \"GO\", { ok: true }), \"b\");" },
      { name: "a failing guard blocks it", body: "const m = { states: { a: { on: { GO: { target: \"b\", guard: (c) => c.ok } } }, b: {} } };\nassert.equal(transition(m, \"a\", \"GO\", { ok: false }), \"a\");" },
      { name: "availableEvents lists only what would work", body: "const m = { states: { a: { on: { X: \"b\", Y: { target: \"b\", guard: (c) => c.ok } } }, b: {} } };\nassert.deepEqual(availableEvents(m, \"a\", { ok: false }), [\"X\"]);\nassert.deepEqual(availableEvents(m, \"a\", { ok: true }), [\"X\", \"Y\"]);\nassert.deepEqual(availableEvents(m, \"b\", {}), []);" },
      { name: "an unknown state throws", body: "const m = { states: { a: {} } };\nassert.throws(() => transition(m, \"zzz\", \"GO\"), /Unknown state: zzz/);\nassert.throws(() => availableEvents(m, \"zzz\"), /Unknown state: zzz/);" },
    ],
  },
  {
    id: "ex-react-rollout-bucket",
    chapter: "react-feature-flags",
    level: "advanced",
    title: "A sticky percentage rollout",
    brief: "<p>Write <code>isInRollout(flagKey, userId, percent)</code>. It must be <b>deterministic</b> (the same user always gets the same answer for a flag), <b>monotonic</b> (anyone in at 20% is still in at 50%), and <b>independent per flag</b> (two flags do not pick the identical users). <code>0</code> means nobody, <code>100</code> means everybody, and 30% should land on roughly 30% of users. Hash the flag key and the user id together to a number from 0 to 99 and compare it with the percentage.</p>",
    starter: "function isInRollout(flagKey, userId, percent) {\n  // TODO\n}\n\nconsole.log(isInRollout(\"new-checkout\", \"user-1\", 50)); // true or false, but always the same\nconsole.log(isInRollout(\"new-checkout\", \"user-1\", 100)); // true\n",
    hints: [
      "Any string hash that spreads well works. FNV-1a: start h = 2166136261; for each char, h ^= code, then h = Math.imul(h, 16777619).",
      "(h >>> 0) % 100 gives a stable bucket from 0 to 99. In the rollout when bucket < percent.",
      "Hash flagKey + \":\" + userId so each flag draws a different slice of users.",
    ],
    solution: "function bucket(flagKey, userId) {\n  const text = flagKey + \":\" + userId;\n  let h = 2166136261;\n  for (let i = 0; i < text.length; i++) {\n    h ^= text.charCodeAt(i);\n    h = Math.imul(h, 16777619);\n  }\n  return (h >>> 0) % 100;\n}\n\nfunction isInRollout(flagKey, userId, percent) {\n  return bucket(flagKey, userId) < percent;\n}\n",
    tests: [
      { name: "the same user always gets the same answer", body: "const first = isInRollout(\"f\", \"user-7\", 50);\nassert.equal(typeof first, \"boolean\");\nfor (let i = 0; i < 20; i++) assert.equal(isInRollout(\"f\", \"user-7\", 50), first);" },
      { name: "0 percent is nobody and 100 percent is everybody", body: "for (let i = 0; i < 300; i++) {\n  assert.equal(isInRollout(\"f\", \"u\" + i, 0), false);\n  assert.equal(isInRollout(\"f\", \"u\" + i, 100), true);\n}" },
      { name: "raising the percentage only adds users", body: "let inAt20 = 0;\nfor (let i = 0; i < 500; i++) {\n  if (isInRollout(\"f\", \"u\" + i, 20)) { inAt20++; assert.equal(isInRollout(\"f\", \"u\" + i, 50), true); }\n}\nassert.ok(inAt20 > 0);" },
      { name: "30 percent lands on roughly 30 percent of users", body: "let on = 0;\nfor (let i = 0; i < 2000; i++) if (isInRollout(\"new-checkout\", \"user-\" + i, 30)) on++;\nassert.ok(on > 500 && on < 700, \"got \" + on + \" of 2000\");" },
      { name: "two flags do not pick the same users", body: "let differ = 0;\nfor (let i = 0; i < 200; i++) {\n  if (isInRollout(\"flag-a\", \"u\" + i, 50) !== isInRollout(\"flag-b\", \"u\" + i, 50)) differ++;\n}\nassert.ok(differ > 40, \"only \" + differ + \" differed\");" },
    ],
  },
  {
    id: "ex-react-presence-phase",
    chapter: "react-animation",
    level: "intermediate",
    title: "The phases of a delayed unmount",
    brief: "<p>Animating out needs the element mounted a little longer than the state says. Model it as phases: <code>hidden</code> (not in the DOM), <code>entering</code>, <code>shown</code>, <code>leaving</code>. Write <code>presenceReducer(phase, event)</code> for the events <code>open</code>, <code>close</code>, <code>entered</code> and <code>exited</code> (the last two are what <code>transitionend</code> reports). <code>open</code> works from <code>hidden</code> and <code>leaving</code> (interrupting a close). <code>close</code> works from <code>shown</code> and <code>entering</code>. <code>entered</code> only counts while <code>entering</code>, and <code>exited</code> only while <code>leaving</code>: a late event from an interrupted animation must be ignored. Everything else returns the same phase. Also write <code>isMounted(phase)</code>.</p>",
    starter: "function presenceReducer(phase, event) {\n  // TODO\n}\n\nfunction isMounted(phase) {\n  // TODO\n}\n\nlet p = \"hidden\";\np = presenceReducer(p, \"open\"); // \"entering\"\np = presenceReducer(p, \"entered\"); // \"shown\"\nconsole.log(p, isMounted(p));\n",
    hints: [
      "A switch on event, and inside each case check the current phase.",
      "isMounted is false only for hidden: the element must stay in the DOM while leaving.",
      "The stale-event rule is the point: reopening during leaving means an old exited event arrives while entering, and it must change nothing.",
    ],
    solution: "function presenceReducer(phase, event) {\n  switch (event) {\n    case \"open\":\n      return phase === \"hidden\" || phase === \"leaving\" ? \"entering\" : phase;\n    case \"close\":\n      return phase === \"shown\" || phase === \"entering\" ? \"leaving\" : phase;\n    case \"entered\":\n      return phase === \"entering\" ? \"shown\" : phase;\n    case \"exited\":\n      return phase === \"leaving\" ? \"hidden\" : phase;\n    default:\n      return phase;\n  }\n}\n\nfunction isMounted(phase) {\n  return phase !== \"hidden\";\n}\n",
    tests: [
      { name: "a full open and close cycle", body: "let p = \"hidden\";\np = presenceReducer(p, \"open\");\nassert.equal(p, \"entering\");\np = presenceReducer(p, \"entered\");\nassert.equal(p, \"shown\");\np = presenceReducer(p, \"close\");\nassert.equal(p, \"leaving\");\np = presenceReducer(p, \"exited\");\nassert.equal(p, \"hidden\");" },
      { name: "reopening while leaving starts entering again", body: "assert.equal(presenceReducer(\"leaving\", \"open\"), \"entering\");" },
      { name: "closing while still entering starts leaving", body: "assert.equal(presenceReducer(\"entering\", \"close\"), \"leaving\");" },
      { name: "a stale exited event during entering is ignored", body: "assert.equal(presenceReducer(\"entering\", \"exited\"), \"entering\");\nassert.equal(presenceReducer(\"shown\", \"exited\"), \"shown\");" },
      { name: "a stale entered event during leaving is ignored", body: "assert.equal(presenceReducer(\"leaving\", \"entered\"), \"leaving\");" },
      { name: "open and close are no-ops when already there", body: "assert.equal(presenceReducer(\"shown\", \"open\"), \"shown\");\nassert.equal(presenceReducer(\"hidden\", \"close\"), \"hidden\");" },
      { name: "the element stays mounted until it has left", body: "assert.equal(isMounted(\"hidden\"), false);\nassert.equal(isMounted(\"entering\"), true);\nassert.equal(isMounted(\"shown\"), true);\nassert.equal(isMounted(\"leaving\"), true);" },
    ],
  },
  {
    id: "ex-react-reset-keys-changed",
    chapter: "react-boundaries-portals",
    level: "intermediate",
    title: "When should an error boundary reset?",
    brief: "<p>A boundary showing its fallback should try again when the input that caused the failure changes, like <code>resetKeys</code> in <code>react-error-boundary</code>. Write <code>resetKeysChanged(prev, next)</code>: true if the arrays differ in length or any position holds a different value. Compare with <code>Object.is</code>, so <code>NaN</code> equals <code>NaN</code>, and objects are compared by reference. Either argument may be <code>undefined</code>, meaning no keys.</p>",
    starter: "function resetKeysChanged(prev = [], next = []) {\n  // TODO\n}\n\nconsole.log(resetKeysChanged([1, \"a\"], [1, \"a\"])); // false\nconsole.log(resetKeysChanged([1], [2])); // true\n",
    hints: [
      "Different lengths are a change straight away.",
      "prev.some((item, i) => !Object.is(item, next[i]))",
      "Default parameters already turn undefined into [].",
    ],
    solution: "function resetKeysChanged(prev = [], next = []) {\n  return prev.length !== next.length || prev.some((item, i) => !Object.is(item, next[i]));\n}\n",
    tests: [
      { name: "identical arrays have not changed", body: "assert.equal(resetKeysChanged([1, \"a\"], [1, \"a\"]), false);" },
      { name: "a different value is a change", body: "assert.equal(resetKeysChanged([1], [2]), true);" },
      { name: "a different length is a change", body: "assert.equal(resetKeysChanged([1], [1, 2]), true);\nassert.equal(resetKeysChanged([1, 2], [1]), true);" },
      { name: "missing arrays count as empty", body: "assert.equal(resetKeysChanged(), false);\nassert.equal(resetKeysChanged(undefined, []), false);\nassert.equal(resetKeysChanged(undefined, [1]), true);" },
      { name: "NaN equals NaN, and objects compare by reference", body: "assert.equal(resetKeysChanged([NaN], [NaN]), false);\nconst o = {};\nassert.equal(resetKeysChanged([o], [o]), false);\nassert.equal(resetKeysChanged([{}], [{}]), true);" },
    ],
  },
  {
    id: "ex-react-effect-runner",
    chapter: "react-effects-depth",
    level: "intermediate",
    title: "Model useEffect's contract",
    brief: "<p>Write <code>createEffectRunner()</code> returning <code>{ run(effect, deps), unmount() }</code>, where each <code>run</code> is one render. The effect runs on the first call, and afterwards only when <code>deps</code> changed (compare with <code>Object.is</code>). If <code>deps</code> is <code>undefined</code> it runs every time; an empty array runs only once. Before running the effect again, call the previous cleanup (the function the effect returned, if it returned one). <code>run</code> returns <code>true</code> when the effect ran. <code>unmount()</code> calls the last cleanup once.</p>",
    starter: "function createEffectRunner() {\n  // TODO\n}\n\n// Try it once it works:\n// const runner = createEffectRunner();\n// const effect = () => { console.log(\"subscribe\"); return () => console.log(\"unsubscribe\"); };\n// runner.run(effect, [1]);\n// runner.run(effect, [2]); // subscribe, unsubscribe, subscribe\n",
    hints: [
      "Keep deps, cleanup and a hasRun flag in the closure.",
      "changed = !hasRun || deps === undefined || next === undefined || lengths differ || some Object.is difference.",
      "Cleanup comes before the new effect. Clear it after unmount so a second unmount does nothing.",
    ],
    solution: "function createEffectRunner() {\n  let deps;\n  let cleanup;\n  let hasRun = false;\n\n  function changed(next) {\n    if (!hasRun || deps === undefined || next === undefined) return true;\n    return deps.length !== next.length || next.some((d, i) => !Object.is(d, deps[i]));\n  }\n\n  return {\n    run(effect, nextDeps) {\n      if (!changed(nextDeps)) return false;\n      if (typeof cleanup === \"function\") cleanup();\n      cleanup = effect();\n      deps = nextDeps;\n      hasRun = true;\n      return true;\n    },\n    unmount() {\n      if (typeof cleanup === \"function\") cleanup();\n      cleanup = undefined;\n    },\n  };\n}\n",
    tests: [
      { name: "runs on the first render", body: "const r = createEffectRunner();\nlet n = 0;\nassert.equal(r.run(() => { n++; }, [1]), true);\nassert.equal(n, 1);" },
      { name: "skips when the dependencies are equal", body: "const r = createEffectRunner();\nlet n = 0;\nr.run(() => { n++; }, [1, \"a\"]);\nassert.equal(r.run(() => { n++; }, [1, \"a\"]), false);\nassert.equal(n, 1);" },
      { name: "cleans up before running again", body: "const r = createEffectRunner();\nconst log = [];\nconst make = (v) => () => { log.push(\"run \" + v); return () => log.push(\"clean \" + v); };\nr.run(make(1), [1]);\nr.run(make(2), [2]);\nassert.deepEqual(log, [\"run 1\", \"clean 1\", \"run 2\"]);" },
      { name: "no dependency array runs every render", body: "const r = createEffectRunner();\nlet n = 0;\nr.run(() => { n++; });\nr.run(() => { n++; });\nassert.equal(n, 2);" },
      { name: "an empty array runs once", body: "const r = createEffectRunner();\nlet n = 0;\nr.run(() => { n++; }, []);\nr.run(() => { n++; }, []);\nassert.equal(n, 1);" },
      { name: "unmount runs the last cleanup exactly once", body: "const r = createEffectRunner();\nlet cleaned = 0;\nr.run(() => () => { cleaned++; }, []);\nr.unmount();\nr.unmount();\nassert.equal(cleaned, 1);" },
      { name: "an effect that returns nothing is fine", body: "const r = createEffectRunner();\nr.run(() => {}, [1]);\nr.run(() => {}, [2]);\nr.unmount();\nassert.ok(true);" },
    ],
  },
  {
    id: "ex-react-create-spy",
    chapter: "react-testing",
    level: "intermediate",
    title: "Build a test spy",
    brief: "<p>Write <code>createSpy(implementation)</code>, the core of <code>vi.fn()</code>. It returns a function that records every call and then runs the optional implementation, returning its result. It also carries: <code>calls</code> (an array of argument arrays), <code>callCount()</code>, <code>calledWith(...args)</code> (true if any call had exactly those arguments, compared with <code>JSON.stringify</code>), <code>mockReturnValue(value)</code> (from then on return <code>value</code> instead of running the implementation; returns the spy for chaining) and <code>reset()</code> (forget calls and the mocked return value, keeping the implementation).</p>",
    starter: "function createSpy(implementation) {\n  // TODO\n}\n\n// Try it once it works:\n// const onSave = createSpy();\n// onSave(\"draft\", 1);\n// console.log(onSave.callCount()); // 1\n// console.log(onSave.calledWith(\"draft\", 1)); // true\n",
    hints: [
      "Attach properties to the function object: spy.calls = calls, spy.callCount = () => calls.length.",
      "reset must empty the same calls array (calls.length = 0), so spy.calls stays valid.",
      "Use a flag for the mocked return so mockReturnValue(undefined) still counts.",
    ],
    solution: "function createSpy(implementation) {\n  const calls = [];\n  let mocked = false;\n  let mockedValue;\n\n  function spy(...args) {\n    calls.push(args);\n    if (mocked) return mockedValue;\n    return implementation ? implementation(...args) : undefined;\n  }\n\n  spy.calls = calls;\n  spy.callCount = () => calls.length;\n  spy.calledWith = (...args) => calls.some((c) => JSON.stringify(c) === JSON.stringify(args));\n  spy.mockReturnValue = (value) => {\n    mocked = true;\n    mockedValue = value;\n    return spy;\n  };\n  spy.reset = () => {\n    calls.length = 0;\n    mocked = false;\n    mockedValue = undefined;\n  };\n  return spy;\n}\n",
    tests: [
      { name: "records calls and their arguments", body: "const s = createSpy();\ns(\"a\", 1);\ns(\"b\");\nassert.equal(s.callCount(), 2);\nassert.deepEqual(s.calls, [[\"a\", 1], [\"b\"]]);" },
      { name: "runs the implementation and returns its result", body: "const s = createSpy((a, b) => a + b);\nassert.equal(s(2, 3), 5);\nassert.equal(s.callCount(), 1);" },
      { name: "calledWith checks the arguments", body: "const s = createSpy();\ns({ id: 1 }, \"x\");\nassert.equal(s.calledWith({ id: 1 }, \"x\"), true);\nassert.equal(s.calledWith({ id: 2 }, \"x\"), false);\nassert.equal(s.calledWith({ id: 1 }), false);" },
      { name: "mockReturnValue replaces the implementation and chains", body: "const s = createSpy(() => \"real\");\nassert.equal(s.mockReturnValue(\"fake\"), s);\nassert.equal(s(), \"fake\");" },
      { name: "mockReturnValue can return undefined on purpose", body: "const s = createSpy(() => \"real\").mockReturnValue(undefined);\nassert.equal(s(), undefined);" },
      { name: "reset clears calls and the mock but keeps the implementation", body: "const s = createSpy(() => \"real\").mockReturnValue(\"fake\");\ns();\ns.reset();\nassert.equal(s.callCount(), 0);\nassert.deepEqual(s.calls, []);\nassert.equal(s(), \"real\");" },
      { name: "a bare spy returns undefined", body: "assert.equal(createSpy()(1), undefined);" },
    ],
  },
  {
    id: "ex-react-classify-runs",
    chapter: "react-e2e",
    level: "intermediate",
    title: "Passed, flaky or failed?",
    brief: "<p>With retries enabled, one test can run several times. Write <code>classifyRuns(results)</code> where each result is <code>{ title, attempts }</code> and <code>attempts</code> lists statuses in order (<code>\"passed\"</code>, <code>\"failed\"</code>, <code>\"timedOut\"</code>, <code>\"skipped\"</code>). Return <code>{ passed, flaky, failed }</code>, each an array of titles in input order. <b>Passed</b>: the last attempt passed and none failed before it. <b>Flaky</b>: it failed or timed out at least once and the last attempt passed. <b>Failed</b>: the last attempt failed or timed out. A test whose attempts are all skipped, or empty, appears in none of them.</p>",
    starter: "function classifyRuns(results) {\n  // TODO\n}\n\nconsole.log(classifyRuns([\n  { title: \"login\", attempts: [\"passed\"] },\n  { title: \"checkout\", attempts: [\"failed\", \"passed\"] },\n  { title: \"search\", attempts: [\"failed\", \"failed\"] },\n]));\n// { passed: [\"login\"], flaky: [\"checkout\"], failed: [\"search\"] }\n",
    hints: [
      "Drop \"skipped\" attempts first. If nothing is left, skip the test.",
      "Look only at the last remaining attempt to decide between failure and success.",
      "If it passed, it is flaky when any earlier attempt was not \"passed\".",
    ],
    solution: "function classifyRuns(results) {\n  const out = { passed: [], flaky: [], failed: [] };\n  for (const { title, attempts } of results) {\n    const ran = attempts.filter((a) => a !== \"skipped\");\n    if (ran.length === 0) continue;\n    const last = ran[ran.length - 1];\n    if (last !== \"passed\") out.failed.push(title);\n    else if (ran.some((a) => a !== \"passed\")) out.flaky.push(title);\n    else out.passed.push(title);\n  }\n  return out;\n}\n",
    tests: [
      { name: "a clean pass", body: "assert.deepEqual(classifyRuns([{ title: \"a\", attempts: [\"passed\"] }]), { passed: [\"a\"], flaky: [], failed: [] });" },
      { name: "failing then passing is flaky", body: "assert.deepEqual(classifyRuns([{ title: \"a\", attempts: [\"failed\", \"passed\"] }]).flaky, [\"a\"]);" },
      { name: "a timeout followed by a pass is flaky too", body: "assert.deepEqual(classifyRuns([{ title: \"a\", attempts: [\"timedOut\", \"passed\"] }]).flaky, [\"a\"]);" },
      { name: "still failing on the last attempt is failed", body: "const r = classifyRuns([{ title: \"a\", attempts: [\"failed\", \"failed\"] }, { title: \"b\", attempts: [\"passed\", \"timedOut\"] }]);\nassert.deepEqual(r.failed, [\"a\", \"b\"]);" },
      { name: "skipped and empty runs appear nowhere", body: "const r = classifyRuns([{ title: \"a\", attempts: [\"skipped\"] }, { title: \"b\", attempts: [] }]);\nassert.deepEqual(r, { passed: [], flaky: [], failed: [] });" },
      { name: "input order is kept within each group", body: "const r = classifyRuns([{ title: \"z\", attempts: [\"passed\"] }, { title: \"y\", attempts: [\"failed\", \"passed\"] }, { title: \"x\", attempts: [\"passed\"] }, { title: \"w\", attempts: [\"failed\", \"passed\"] }]);\nassert.deepEqual(r.passed, [\"z\", \"x\"]);\nassert.deepEqual(r.flaky, [\"y\", \"w\"]);" },
    ],
  },
];
