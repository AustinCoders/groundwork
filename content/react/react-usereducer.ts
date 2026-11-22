import type { Chapter } from "../types";

export const reactUsereducer: Chapter = {
  id: "react-usereducer",
  num: "I3",
  title: "useReducer",
  short: "useReducer",
  levels: ["intermediate"],
  prerequisites: ["react-usestate", "react-context"],
  practice: ["ex-react-todos-reducer", "ex-react-counter-reducer", "ex-comp-cart-reducer", "ex-comp-undo-redo-reducer"],
  ready: true,
  subtitle: "When the next state depends on the current state and on which thing happened.",
  body: `<p>
  <code>useState</code> hands you a setter and leaves the logic in your event handlers. That is perfect for a toggle and
  painful for a form, a request with loading and error states, or a cart where the same change happens from five places.
  <code>useReducer</code> moves the logic into one pure function that receives the current state and a description of what
  happened, and returns the next state. This chapter builds it from <code>useState</code>, traces a sequence of actions by
  hand, shows the shapes of state that make bugs impossible, and ends with the reducer-plus-context pattern that serves
  many apps instead of a store library. It assumes <a href="/react/react-usestate">state</a> and
  <a href="/react/react-context">context</a>. The behaviour described was run against React 19.3.
</p>

<h3>The shape</h3>
<pre><code>import { useReducer } from "react";

function counterReducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "reset":
      return { count: 0 };
    default:
      throw new Error("Unknown action: " + action.type);
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });
  return (
    &lt;&gt;
      &lt;p&gt;{state.count}&lt;/p&gt;
      &lt;button onClick={() =&gt; dispatch({ type: "increment" })}&gt;+&lt;/button&gt;
      &lt;button onClick={() =&gt; dispatch({ type: "reset" })}&gt;Reset&lt;/button&gt;
    &lt;/&gt;
  );
}</code></pre>
<p>
  Three parts. The <b>reducer</b> is a plain function <code>(state, action) =&gt; nextState</code>, defined outside the
  component. The <b>action</b> is an object describing what happened; by convention it has a <code>type</code> string and
  whatever data the change needs. And <code>useReducer(reducer, initialState)</code> returns the current state and a
  <b>dispatch</b> function that sends an action to the reducer.
</p>
<p>
  The name comes from <code>Array.prototype.reduce</code>. Reducing an array of numbers folds them into one value, one at
  a time; a reducer folds a stream of actions into the current state, one at a time. If you replayed every action the
  user ever dispatched through the reducer, starting from the initial state, you would get the state on screen now.
</p>

<h3>It is <code>useState</code>, with the logic moved</h3>
<p>
  <code>useState</code> is in fact a reducer underneath. Its built-in reducer says "if the action is a function, call it
  with the old state; otherwise the action is the new state". That is exactly the value-or-updater rule from the
  <a href="/react/react-usestate">useState chapter</a>. With <code>useReducer</code> you write the reducer yourself, so
  the rules for <em>how</em> state changes live in one place and the event handlers only say <em>what</em> happened.
</p>
<p>
  Everything you learned about state carries over unchanged. <code>dispatch</code> does not change <code>state</code> in
  the render that is running: log <code>state</code> right after dispatching and you see the old value. Dispatching
  returns <code>undefined</code>, not the new state. Several dispatches in one event are queued and processed in one
  render, each action seeing the state the previous one produced. Checked: two <code>increment</code> dispatches in one
  handler produced one render and two reducer calls.
</p>

<h3>Worked example: folding actions by hand</h3>
<p>
  A small todo reducer, so you can trace a sequence of actions the way React processes them:
</p>
<pre><code>function todosReducer(todos, action) {
  switch (action.type) {
    case "added":
      return [...todos, { id: action.id, text: action.text, done: false }];
    case "toggled":
      return todos.map((t) =&gt; (t.id === action.id ? { ...t, done: !t.done } : t));
    case "deleted":
      return todos.filter((t) =&gt; t.id !== action.id);
    default:
      throw new Error("Unknown action: " + action.type);
  }
}</code></pre>
<p>
  Start from an empty list and dispatch four actions:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Action</th><th>State going in</th><th>Branch</th><th>State coming out</th></tr></thead>
<tbody>
<tr><td><code>{ type: "added", id: 1, text: "Milk" }</code></td><td><code>[]</code></td><td>added</td><td><code>[1 Milk ☐]</code></td></tr>
<tr><td><code>{ type: "added", id: 2, text: "Eggs" }</code></td><td><code>[1 Milk ☐]</code></td><td>added</td><td><code>[1 Milk ☐, 2 Eggs ☐]</code></td></tr>
<tr><td><code>{ type: "toggled", id: 1 }</code></td><td><code>[1 Milk ☐, 2 Eggs ☐]</code></td><td>toggled</td><td><code>[1 Milk ☑, 2 Eggs ☐]</code></td></tr>
<tr><td><code>{ type: "deleted", id: 2 }</code></td><td><code>[1 Milk ☑, 2 Eggs ☐]</code></td><td>deleted</td><td><code>[1 Milk ☑]</code></td></tr>
</tbody>
</table></div>
<p>
  Every row is a pure function call: the same state and action always give the same result. That is why you can trace a
  reducer on paper, test it without React, and replay a bug report's action log to reproduce it exactly. Note where the
  id comes from: the event handler generates it (<code>crypto.randomUUID()</code> or a counter) and puts it in the action,
  because generating it inside the reducer would make the reducer impure.
</p>

<h3>Why bother, when <code>useState</code> exists</h3>
<p>
  Reach for a reducer when one of these is true:
</p>
<ul>
  <li><b>Several fields change together.</b> Starting a request sets the status, clears the error and clears old data. Three setters that must never get out of step become one action.</li>
  <li><b>The same change happens from several places.</b> "Add to cart" from a product page, a quick-add button and a "buy again" list: one <code>added</code> case instead of three copies of the logic.</li>
  <li><b>The next state depends on the current one in non-trivial ways,</b> such as moving a step in a wizard only if the current step is valid.</li>
  <li><b>You want to unit test the logic.</b> A reducer is called with a state and an action and returns a value. No component, no rendering.</li>
</ul>
<div class="table-scroll"><table>
<thead><tr><th>Situation</th><th>Choose</th></tr></thead>
<tbody>
<tr><td>A toggle, an input's text, one counter</td><td><code>useState</code></td></tr>
<tr><td>Two or three independent values</td><td>Separate <code>useState</code> calls</td></tr>
<tr><td>A request's status, data and error</td><td><code>useReducer</code></td></tr>
<tr><td>A multi-step form, an editor, a cart</td><td><code>useReducer</code></td></tr>
<tr><td>Logic a teammate must be able to unit test</td><td><code>useReducer</code></td></tr>
</tbody>
</table></div>
<p>
  The cost is more code up front: a function, action types, a switch. For a single boolean that is ceremony. The
  benefit grows with the number of fields and the number of places that change them.
</p>

<h3>Shapes that make bugs impossible</h3>
<pre><code><span class="c">// with useState: every caller must remember all three</span>
setLoading(true);
setError(null);
setData(null);

<span class="c">// with a reducer: the transition is defined once</span>
function requestReducer(state, action) {
  switch (action.type) {
    case "started":
      return { status: "loading", data: null, error: null };
    case "succeeded":
      return { status: "success", data: action.data, error: null };
    case "failed":
      return { status: "error", data: null, error: action.error };
    default:
      throw new Error("Unknown action: " + action.type);
  }
}</code></pre>
<p>
  Look at what can no longer happen. With three separate pieces of state, a handler that forgets
  <code>setError(null)</code> leaves an old error on screen next to fresh data. With the reducer, every state the
  component can be in is one of three written-out objects, and no handler can produce a mixture. A single
  <code>status</code> field instead of several booleans is the same idea as in the useState chapter, enforced by
  construction.
</p>
<p>
  You can go further and refuse transitions that make no sense. A request that has already succeeded should ignore a late
  <code>failed</code> action from a cancelled attempt:
</p>
<pre><code>case "failed":
  if (state.status !== "loading") return state;   <span class="c">// ignore stale failures</span>
  return { status: "error", data: null, error: action.error };</code></pre>
<p>
  At that point the reducer is a small state machine: each case says which events are allowed in which states. The
  <a href="/react/react-state-machines">state machines chapter</a> takes the idea all the way.
</p>

<h3>Design the state before the reducer</h3>
<p>
  Most of the value of a reducer comes from the shape of the state it manages, so it is worth deciding that shape before
  writing a single case. Three questions help. What are the distinct situations the screen can be in? Write them down as
  a <code>status</code> or <code>step</code> field rather than a set of booleans. What data exists in each situation?
  Data that only exists in one situation, such as an error message, can be <code>null</code> elsewhere, or, in TypeScript,
  live only on that variant of a union. And what is derived? A count of completed todos, whether the form is valid, the
  total of a cart: compute them from the state while rendering instead of storing them, exactly as with
  <code>useState</code>, so no action can forget to update them.
</p>
<p>
  Then list the events, in the user's language: added, toggled, submitted, cancelled, retried. Each becomes an action, and
  for each you can ask which situations it is allowed in. A reducer written from that list is usually short, and its
  default case almost never fires.
</p>

<h3>Name actions after what happened</h3>
<pre><code>dispatch({ type: "setItems", items });    <span class="c">// ✗ a setter in disguise</span>
dispatch({ type: "itemAdded", item });    <span class="c">// ✓ an event; the reducer decides the consequence</span></code></pre>
<p>
  Actions named after events keep the logic in the reducer. <code>setItems</code> means the event handler computed the
  new list and the reducer just stores it, which is <code>useState</code> with extra steps. <code>itemAdded</code> says
  what the user did, and the reducer decides that adding also clears the "cart is empty" banner and resets the discount
  code. When a new rule arrives, it goes in one case instead of every handler. Past-tense names ("added", "toggled",
  "submitted") read well in an action log; some teams prefix by area, <code>"cart/itemAdded"</code>, which helps once
  several reducers share a log.
</p>
<p>
  Keep actions small and serialisable: plain objects with strings, numbers, arrays and objects. An action you can log and
  replay is an action you can debug.
</p>

<h3>The reducer must be pure</h3>
<p>
  A reducer takes state and an action and returns the next state. Nothing else: no fetching, no
  <code>localStorage</code>, no timers, no random ids, no logging that matters, and no mutating the state it was given.
  This is not a style preference; React relies on it in three ways.
</p>
<ul>
  <li>React calls the reducer while rendering, and a render can be interrupted and redone under concurrent features, so the reducer can run for an update that is later thrown away.</li>
  <li>In development under <code>&lt;StrictMode&gt;</code>, React calls the reducer twice for each action and keeps one result, to surface impurity. Checked: one dispatch, two reducer calls. A reducer that posts analytics will post twice in development.</li>
  <li>React decides whether to re-render by comparing the returned state with the previous one using <code>Object.is</code>. A reducer that mutates and returns the same object hides the change.</li>
</ul>
<p>
  The side effects go in the event handler, before or after dispatching:
</p>
<pre><code>async function handleSubmit(form) {
  dispatch({ type: "started" });
  try {
    const data = await save(form);
    dispatch({ type: "succeeded", data });
    toast("Saved");
  } catch (error) {
    dispatch({ type: "failed", error: String(error) });
  }
}</code></pre>
<p>
  The handler talks to the outside world and reports what happened; the reducer turns reports into state. Effects that
  must follow a state change regardless of cause, such as syncing to <code>localStorage</code>, go in a
  <code>useEffect</code> that watches the state.
</p>

<h3>Returning the same state</h3>
<p>
  If the reducer returns exactly the state it received, as in the default branch of some reducers or the "ignore stale
  failures" case, React can skip re-rendering the children. It may still call your component once before bailing out:
  in the check behind this chapter, a dispatch whose reducer returned the same object still caused one render of the
  component. Treat it as an optimisation, never as a guarantee, exactly as with
  <code>useState</code>.
</p>
<p>
  This is also the argument about the <code>default</code> case. Returning <code>state</code> for an unknown action is
  silent; a misspelled action type does nothing and you hunt for the bug. Throwing names the problem the moment it
  happens. In TypeScript, a discriminated union of actions makes the compiler reject unknown types, and the default can
  assert the case is unreachable.
</p>

<h3>Lazy initialisation</h3>
<pre><code>function init(savedId) {
  const saved = localStorage.getItem("draft:" + savedId);
  return saved ? JSON.parse(saved) : { title: "", body: "" };
}

const [draft, dispatch] = useReducer(draftReducer, savedId, init);</code></pre>
<p>
  The optional third argument is an initialiser: React calls <code>init(savedId)</code> once, on the first render, and
  uses the result as the initial state. Checked: <code>useReducer(reducer, 5, (x) =&gt; ({ n: x * 2 }))</code> started at
  10. It is the reducer equivalent of <code>useState(() =&gt; …)</code>, and the same reason applies: an expression passed
  as the second argument would be evaluated on every render. The initialiser is also handy for a <code>reset</code> action,
  which can call <code>init</code> again to return to the starting state.
</p>

<h3><code>dispatch</code> is stable, and that matters</h3>
<p>
  React returns the same <code>dispatch</code> function on every render. That has practical consequences: it is safe to
  leave out of effect dependency arrays (the lint rule knows this), safe to pass to memoised children without breaking
  their memoisation, and safe to put in a context that therefore never changes. Compare passing five callbacks,
  <code>onAdd</code>, <code>onToggle</code>, <code>onDelete</code> and so on, each of which needs
  <code>useCallback</code> to stay stable, with passing one <code>dispatch</code>.
</p>

<h3>Worked example: a checkout wizard</h3>
<p>
  A three-step checkout shows a reducer earning its keep: which step you are on, the data collected so far, and rules about
  which moves are allowed.
</p>
<pre><code>const initialCheckout = { step: "address", address: null, payment: null, error: null };

function checkoutReducer(state, action) {
  switch (action.type) {
    case "addressSubmitted":
      if (!action.address.postcode) return { ...state, error: "Enter a postcode" };
      return { ...state, address: action.address, step: "payment", error: null };
    case "paymentSubmitted":
      if (state.step !== "payment") return state;
      return { ...state, payment: action.payment, step: "review", error: null };
    case "backClicked":
      if (state.step === "payment") return { ...state, step: "address", error: null };
      if (state.step === "review") return { ...state, step: "payment", error: null };
      return state;
    case "restarted":
      return initialCheckout;
    default:
      throw new Error("Unknown action: " + action.type);
  }
}</code></pre>
<p>
  Trace a user who submits an address without a postcode, fixes it, pays, goes back once and pays again:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Action</th><th>Step before</th><th>Step after</th><th>What else changed</th></tr></thead>
<tbody>
<tr><td><code>addressSubmitted</code> (no postcode)</td><td>address</td><td>address</td><td><code>error</code> set</td></tr>
<tr><td><code>addressSubmitted</code> (with postcode)</td><td>address</td><td>payment</td><td>address saved, error cleared</td></tr>
<tr><td><code>paymentSubmitted</code></td><td>payment</td><td>review</td><td>payment saved</td></tr>
<tr><td><code>backClicked</code></td><td>review</td><td>payment</td><td>payment kept, so the form can be prefilled</td></tr>
<tr><td><code>paymentSubmitted</code></td><td>payment</td><td>review</td><td>payment replaced</td></tr>
</tbody>
</table></div>
<p>
  The component renders one form per step and dispatches what the user did. None of the step logic is in the JSX, so the
  rules ("you cannot submit payment from the address step", "going back keeps what you entered") are written once, read in
  one place and tested in a few lines. A double-click on "Pay" that dispatches <code>paymentSubmitted</code> twice is
  harmless: the second one arrives in the review step and returns the state unchanged.
</p>

<h3>Undo and redo</h3>
<p>
  Because a reducer turns actions into whole new states, keeping history is a wrapper around it rather than a rewrite. Store
  the past, the present and the future:
</p>
<pre><code>function withHistory(reducer) {
  return (history, action) =&gt; {
    const { past, present, future } = history;
    if (action.type === "undo") {
      if (past.length === 0) return history;
      return { past: past.slice(0, -1), present: past[past.length - 1], future: [present, ...future] };
    }
    if (action.type === "redo") {
      if (future.length === 0) return history;
      return { past: [...past, present], present: future[0], future: future.slice(1) };
    }
    const next = reducer(present, action);
    if (next === present) return history;
    return { past: [...past, present], present: next, future: [] };
  };
}

const [history, dispatch] = useReducer(withHistory(todosReducer), { past: [], present: [], future: [] });</code></pre>
<p>
  Undo moves the present onto the future and takes the last past state; redo does the reverse; any other action records
  the old present in the past and clears the future, which is how every editor behaves. This works only because states are
  never mutated: each entry in <code>past</code> is a snapshot that nothing will change later. Keep the history bounded,
  for example the last 100 states, if states are large. Define the wrapped reducer outside the component so it is the same
  function on every render.
</p>

<h3>Typing actions in TypeScript</h3>
<pre><code>type Todo = { id: string; text: string; done: boolean };
type Action =
  | { type: "added"; id: string; text: string }
  | { type: "toggled"; id: string }
  | { type: "deleted"; id: string };

function todosReducer(todos: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "added":
      return [...todos, { id: action.id, text: action.text, done: false }];
    case "toggled":
      return todos.map((t) =&gt; (t.id === action.id ? { ...t, done: !t.done } : t));
    case "deleted":
      return todos.filter((t) =&gt; t.id !== action.id);
    default: {
      const unreachable: never = action;
      throw new Error("Unknown action: " + JSON.stringify(unreachable));
    }
  }
}</code></pre>
<p>
  A discriminated union, a set of object types that share a literal <code>type</code> field, gives you three things.
  Inside each <code>case</code>, TypeScript narrows <code>action</code>, so <code>action.text</code> exists only in the
  <code>added</code> branch. <code>dispatch</code> rejects misspelled types and missing fields at compile time. And the
  <code>never</code> assignment in the default fails to compile if someone adds an action to the union and forgets its case.
</p>

<h3><code>useReducer</code> and Redux</h3>
<p>
  Redux popularised reducers in React, and the ideas transfer directly: actions describe events, reducers are pure, state
  is immutable. The differences are about scope. <code>useReducer</code> state belongs to one component and the subtree you
  share it with; a Redux store is a single object outside React that any component can subscribe to, with selectors so a
  component re-renders only when its slice changes, middleware for async flows, and devtools that record and replay every
  action. For one feature's state, <code>useReducer</code> is enough. For app-wide state that many components read in
  slices, the store's selectors are what you are paying for. Modern Redux, written with Redux Toolkit, generates the
  action types and uses Immer, so the reducers you learn here read almost the same there.
</p>

<h3>Testing a reducer</h3>
<pre><code>import { test } from "node:test";
import assert from "node:assert/strict";

test("toggling flips one todo and leaves the others", () =&gt; {
  const start = [
    { id: 1, text: "Milk", done: false },
    { id: 2, text: "Eggs", done: false },
  ];
  const next = todosReducer(start, { type: "toggled", id: 1 });
  assert.equal(next[0].done, true);
  assert.equal(next[1], start[1]);        <span class="c">// untouched items keep their identity</span>
  assert.equal(start[0].done, false);     <span class="c">// the input was not mutated</span>
});</code></pre>
<p>
  No rendering, no DOM, no mocks. Test the transitions, the impossible ones you guard against, and that the input is
  never mutated. Most of a component's behaviour lives in its reducer, so most of its tests can be this fast.
</p>

<h3>Keeping it immutable without the spread pyramid</h3>
<p>
  Reducers inherit the immutability rules of state. For nested data the spreads pile up:
</p>
<pre><code>case "addressChanged":
  return {
    ...state,
    customer: {
      ...state.customer,
      address: { ...state.customer.address, city: action.city },
    },
  };</code></pre>
<p>
  Two fixes. Flatten the state so it is not nested that deeply, usually the right answer. Or use Immer, whose
  <code>useImmerReducer</code> hands your reducer a draft you can mutate and turns the mutations into a new immutable
  object: <code>draft.customer.address.city = action.city</code>. Redux Toolkit uses Immer the same way. Both are
  reasonable; mixing the two styles in one codebase is not.
</p>

<h3>Reducers and effects together</h3>
<p>
  Some consequences of a state change are not state: saving a draft to <code>localStorage</code>, updating the document
  title, telling a chat server the user is typing. They do not belong in the reducer, and if they must happen whatever
  action caused the change, they do not belong in every handler either. An effect that depends on the relevant part of the
  reducer's state is the place: <code>useEffect(() =&gt; save(draft), [draft])</code> runs after any action that produced
  a new draft, and never for actions that returned the same one. Because the reducer only creates a new object when
  something changed, the dependency comparison does exactly what you want, which is one more payoff of returning the
  unchanged state when nothing happens.
</p>

<h3>Reducer plus context: a small store</h3>
<p>
  Put a reducer in a provider component, and share its state and dispatch through two contexts, and you have a store for
  a feature or a small app with no library:
</p>
<pre><code>const TodosContext = createContext(null);
const TodosDispatchContext = createContext(null);

export function TodosProvider({ children }) {
  const [todos, dispatch] = useReducer(todosReducer, []);
  return (
    &lt;TodosContext value={todos}&gt;
      &lt;TodosDispatchContext value={dispatch}&gt;{children}&lt;/TodosDispatchContext&gt;
    &lt;/TodosContext&gt;
  );
}

export function useTodos() {
  const todos = useContext(TodosContext);
  if (todos === null) throw new Error("useTodos must be used inside &lt;TodosProvider&gt;");
  return todos;
}

export function useTodosDispatch() {
  const dispatch = useContext(TodosDispatchContext);
  if (dispatch === null) throw new Error("useTodosDispatch must be used inside &lt;TodosProvider&gt;");
  return dispatch;
}</code></pre>
<p>
  Components that only send actions read the dispatch context, which never changes, so they never re-render because the
  list changed. Components that show the list read the state context. This is the
  <a href="/react/react-context">context chapter's</a> state-and-dispatch split, and it scales surprisingly far. Where it
  stops scaling is when many components each need a small slice of a large, fast-changing state: context has no
  selectors, so every reader of the state context re-renders on every change. That is the point to move to a store library.
</p>

<h3>Debugging: see every action</h3>
<pre><code>function withLogging(reducer) {
  return (state, action) =&gt; {
    const next = reducer(state, action);
    console.log(action.type, { action, state, next });
    return next;
  };
}

const [state, dispatch] = useReducer(withLogging(todosReducer), []);</code></pre>
<p>
  Because every change goes through one function, wrapping it gives you a full log of what happened and what it did,
  something scattered setters can never offer. Remember it will log twice per action under Strict Mode in development,
  for the reason above, and define the wrapped reducer outside the component so it is not recreated on every render.
</p>

<h3>What reviewers look for in a reducer</h3>
<p>
  When a reducer comes up in code review, a few checks catch most problems quickly. Every case returns a new object or
  the unchanged state, never a mutated one; a <code>push</code>, <code>splice</code>, <code>sort</code> or assignment to a
  field of <code>state</code> is a bug even if the screen happens to update. No case reads the clock, a random number,
  storage or the network. Action names describe events, and none of them is a thin setter for one field. Derived values
  are not stored. The default case throws or is unreachable by type. And the state shape makes impossible combinations
  unrepresentable rather than merely unlikely. A reducer that passes those checks rarely needs more than its unit tests.
</p>

<h3>Pitfalls</h3>
<ul>
  <li><b>Mutating state in the reducer</b> and returning it: React sees the same reference and may skip the render.</li>
  <li><b>Side effects in the reducer</b>: they run twice in development and can run for renders that are thrown away.</li>
  <li><b>Reading <code>state</code> right after <code>dispatch</code></b> and expecting the new value.</li>
  <li><b>Setter-style actions</b> (<code>setX</code>) that keep the logic in handlers.</li>
  <li><b>A silent <code>default</code></b> that swallows misspelled action types.</li>
  <li><b>Generating ids or timestamps inside the reducer</b>: put them in the action.</li>
  <li><b>An initial state computed by an expensive expression</b> instead of the third-argument initialiser.</li>
  <li><b>One giant reducer for the whole app in context</b>, read by hundreds of components that each need one field.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>Several <code>useState</code> calls that are always set together in the same handlers: one reducer.</li>
  <li>"The old error is still showing after a successful retry": state that should move as a unit is spread across setters.</li>
  <li>The same three-line update copied into several handlers: an action.</li>
  <li>A form, wizard, editor or cart with rules about which changes are allowed when: a reducer, perhaps a state machine.</li>
  <li>"Share this feature's state across many components without a library": reducer plus two contexts.</li>
</ul>

<h3>Interview questions</h3>
<p><b>1. When would you choose <code>useReducer</code> over <code>useState</code>?</b></p>
<p>
  When several pieces of state change together, when the same change happens from several places, when the next state
  depends on the current state in non-trivial ways, or when I want to unit test the transitions. For a single independent
  value, <code>useState</code> is simpler. <code>useState</code> is itself a reducer with a built-in "replace or apply
  updater" rule.
</p>
<p class="sub">
  <i>Follow-up: what does the reducer give you that handlers do not?</i> All transitions in one pure function, so states
  that must not mix cannot be produced, the logic is testable without rendering, and every change can be logged and
  replayed.
</p>
<p><b>2. Why must a reducer be pure?</b></p>
<p>
  React calls it during rendering, may call it for renders it discards, and in development calls it twice per action under
  Strict Mode. It also compares the returned state with <code>Object.is</code>, so mutation hides changes. Side effects
  belong in event handlers or effects.
</p>
<p class="sub">
  <i>Follow-up: where would you put an API call triggered by an action?</i> In the event handler that dispatches: dispatch
  "started", await the call, dispatch "succeeded" or "failed".
</p>
<p><b>3. What is special about <code>dispatch</code>?</b></p>
<p>
  Its identity is stable for the component's lifetime. So it can be omitted from effect dependencies, passed to memoised
  children without breaking memoisation, and placed in its own context that never changes, unlike handler callbacks that
  need <code>useCallback</code>.
</p>
<p><b>4. How would you share reducer state across a feature without a library?</b></p>
<p>
  A provider owning the <code>useReducer</code>, one context for the state and one for <code>dispatch</code>, and custom
  hooks that throw if used outside the provider. Dispatch-only components never re-render on state changes. When many
  components need slices of large, frequently changing state, I would move to a store with selectors.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "Does <code>dispatch</code> return the new state, so I can use it on the next line?" No. It returns
    <code>undefined</code>, and <code>state</code> in the running handler is still this render's snapshot. If the handler
    needs the next state, compute it by calling the reducer yourself, <code>const next = reducer(state, action)</code>,
    then dispatch the action; or move the follow-up into an effect that reacts to the state.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "A reducer is a pure function from the current state and an action to the next state. I use
    <code>useReducer</code> when state fields change together or the same transition happens in several places: handlers
    dispatch events named after what happened, the reducer decides the consequences, and side effects stay in the
    handlers. <code>dispatch</code> is stable, so it pairs well with context for a small, library-free store."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write a reducer, its actions and the <code>useReducer</code> call for a counter and for a todo list.</li>
    <li>Trace a sequence of four actions through a reducer on paper, as in the table above.</li>
    <li>Turn three <code>useState</code> calls for a request into one reducer with a <code>status</code> field, and guard against a late stale action.</li>
    <li>List what a reducer must not do and the three reasons React depends on it.</li>
    <li>Use the third-argument initialiser, and explain why <code>dispatch</code> can be left out of dependency arrays.</li>
    <li>Write a reducer test with <code>node:test</code> that also checks the input is not mutated.</li>
    <li>Build the reducer-plus-two-contexts pattern and say when it stops scaling.</li>
  </ul>
</div>`,
};
