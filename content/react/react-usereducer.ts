import type { Chapter } from "../types";

export const reactUsereducer: Chapter = {
  id: "react-usereducer",
  num: "I3",
  title: "useReducer",
  short: "useReducer",
  levels: ["intermediate"],
  practice: ["ex-react-todos-reducer", "ex-react-counter-reducer"],
  ready: true,
  subtitle: "When the next state depends on the current state and on which thing happened.",
  body: `<h3>The shape</h3>
<pre><code>function reducer(state, action) {
  switch (action.type) {
    case "increment": return { ...state, count: state.count + 1 };
    case "reset":     return { count: 0 };
    default:          throw new Error("Unknown action: " + action.type);
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });

dispatch({ type: "increment" });</code></pre>
<p>
  A reducer is a pure function: given the current state and a description of
  what happened, it returns the next state. It must not mutate its argument, and
  it must not fetch, log, or set timers &mdash; React may call it more than once
  for a single dispatch.
</p>

<h3>Why bother, when useState exists</h3>
<p>
  <code>useState</code> is a reducer underneath. Reach for the explicit one when
  one of these is true:
</p>
<ul>
  <li><b>Several fields move together.</b> Starting a request sets <code>loading</code>, clears <code>error</code> and clears <code>data</code> &mdash; three setters that must never be out of step.</li>
  <li><b>The next state depends on the current one</b> in more than a trivial way.</li>
  <li><b>The same transition happens from several places.</b> The logic lives in one function instead of being duplicated in four handlers.</li>
  <li><b>You want to test the logic.</b> A reducer is a plain function &mdash; call it with a state and an action and assert on the result. No component, no render.</li>
</ul>

<h3>The example that makes the case</h3>
<pre><code><span class="c">// with useState: four setters, and every caller must remember all of them</span>
setLoading(true); setError(null); setData(null);

<span class="c">// with a reducer: one dispatch, and the transition is defined once</span>
dispatch({ type: "fetch/start" });

function reducer(state, action) {
  switch (action.type) {
    case "fetch/start":   return { status: "loading", data: null, error: null };
    case "fetch/success": return { status: "ready", data: action.data, error: null };
    case "fetch/failure": return { status: "error", data: null, error: action.error };
    default: return state;
  }
}</code></pre>
<p>
  Notice what became impossible: there is no way to be
  <code>loading</code> and hold an <code>error</code> at the same time, because
  no transition produces that. With four independent booleans, every impossible
  combination is one forgotten setter away.
</p>

<div class="bx is-prim">
  <span class="ttl">Make impossible states impossible</span>
  <p>
    Four booleans give sixteen combinations, of which perhaps four are valid.
    One <code>status</code> field with four values gives exactly four. This is
    the strongest argument for reducers and it has nothing to do with
    performance &mdash; it is about the states your UI can never accidentally
    reach.
  </p>
</div>

<h3>Naming actions after events, not setters</h3>
<pre><code>dispatch({ type: "setCount", value: 5 });         <span class="c">// ✗ a setter in disguise</span>
dispatch({ type: "incremented" });                <span class="c">// ✓ what happened</span>
dispatch({ type: "quantityChanged", id, qty });   <span class="c">// ✓</span></code></pre>
<p>
  Actions describe events, not assignments. That way one action can drive
  several changes, and reading the list of action types tells you what the
  feature does &mdash; it becomes the documentation of the component's
  behaviour.
</p>

<h3>Lazy initialisation</h3>
<pre><code>function init(items) {
  return { items, selected: null, filter: "" };
}

const [state, dispatch] = useReducer(reducer, initialItems, init);</code></pre>
<p>
  The third argument runs once with the second as its input. Useful for
  expensive setup, and for reusing the same function to handle a
  <code>reset</code> action: <code>case "reset": return init(action.items);</code>
</p>

<h3>dispatch is stable, and that matters</h3>
<p>
  React guarantees the same <code>dispatch</code> function for the life of the
  component. So it never needs to be in a dependency array, it never breaks a
  <code>memo</code>, and it can go into context without a
  <code>useCallback</code> &mdash; which is why the state-and-dispatch context
  split in the <a href="/react/react-context">previous chapter</a> works so
  cleanly.
</p>

<h3>Reducer plus context: the poor man's store</h3>
<pre><code>function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  return (
    &lt;TasksContext value={tasks}&gt;
      &lt;TasksDispatchContext value={dispatch}&gt;{children}&lt;/TasksDispatchContext&gt;
    &lt;/TasksContext&gt;
  );
}</code></pre>
<p>
  This covers a surprising amount of ground before you need a real library:
  centralised logic, a stable dispatch, and components that only read what they
  need. What it does not give you is selectors &mdash; every consumer of
  <code>TasksContext</code> re-renders on every change &mdash; and that is the
  line where <a href="/react/react-state-libraries">a store</a> starts earning
  its dependency.
</p>

<h3>Keeping it immutable</h3>
<pre><code>case "toggle":
  return {
    ...state,
    items: state.items.map((i) =&gt;
      i.id === action.id ? { ...i, done: !i.done } : i
    ),
  };</code></pre>
<p>
  The same rules as <code>useState</code>: return a new object, spread at every
  level you change. If the nesting makes this painful, either flatten the state
  or use Immer's <code>produce</code>, which lets you write mutations and
  produces an immutable result.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "A reducer moves state transitions out of the handlers and into one pure
    function, so related fields always change together and impossible
    combinations stop being reachable. It is also testable without rendering,
    and <code>dispatch</code> is stable, which makes it ideal to put in context."
  </p>
</div>`,
};
