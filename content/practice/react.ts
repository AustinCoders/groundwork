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
];
