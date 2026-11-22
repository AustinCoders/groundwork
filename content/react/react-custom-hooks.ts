import type { Chapter } from "../types";

export const reactCustomHooks: Chapter = {
  id: "react-custom-hooks",
  num: "I4",
  title: "Custom hooks",
  short: "Custom hooks",
  levels: ["intermediate"],
  prerequisites: ["react-usestate", "react-useeffect-basics", "react-useref"],
  practice: [
    "ex-react-safe-parse",
    "ex-react-paginate",
    "ex-comp-use-debounce",
    "ex-comp-use-toggle",
    "ex-comp-use-click-outside",
    "ex-comp-persistent-state",
  ],
  ready: true,
  subtitle: "Sharing stateful logic between components, not sharing the state itself.",
  body: `<p>
  Components let you reuse a piece of UI. Custom hooks let you reuse a piece of <em>behaviour</em>: the state, effects and
  refs that implement "remember this in localStorage", "track the window width" or "close when the user clicks outside".
  There is no API to learn. A custom hook is an ordinary function whose name starts with <code>use</code> and which calls
  other hooks. This chapter explains what actually happens when two components call the same hook, how to extract one
  from a working component, what a hook should return, three hooks worth having in every codebase, and the line between a
  hook that clarifies code and one that hides it. It assumes <a href="/react/react-usestate">state</a>,
  <a href="/react/react-useeffect-basics">effects</a> and <a href="/react/react-useref">refs</a>. The behaviour described
  was checked against React 19.3.
</p>

<h3>A custom hook is just a function</h3>
<pre><code>import { useState } from "react";

function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = () =&gt; setOn((value) =&gt; !value);
  return [on, toggle];
}

function Menu() {
  const [open, toggleOpen] = useToggle();
  return (
    &lt;&gt;
      &lt;button onClick={toggleOpen}&gt;Menu&lt;/button&gt;
      {open &amp;&amp; &lt;nav&gt;…&lt;/nav&gt;}
    &lt;/&gt;
  );
}</code></pre>
<p>
  Nothing here is special to React except the <code>useState</code> call inside. <code>useToggle</code> runs as part of
  <code>Menu</code>'s render, as if its body had been pasted into <code>Menu</code>. The <code>useState</code> it calls
  creates a slot in <code>Menu</code>'s hook list, exactly as if <code>Menu</code> had called it directly. React has no
  idea a custom hook exists: it only sees the built-in hooks being called, in order, by the component that is rendering.
</p>
<p>
  The <code>use</code> prefix is a convention with teeth. The lint rules for hooks rely on it: they check that a function
  whose name starts with <code>use</code> is only called at the top level of a component or another hook, and that
  hooks are only called inside such functions. Name a hook <code>getToggle</code> and the linter can no longer protect
  you. Conversely, do not prefix a plain helper with <code>use</code> if it calls no hooks; the name promises rules the
  function does not need.
</p>

<h3>Two components, two copies of the state</h3>
<p>
  The most important fact about custom hooks, and the most common misunderstanding: <b>calling the same hook from two
  components gives each one its own state</b>. A hook shares logic, never data.
</p>
<pre><code>function Sidebar() {
  const [open, toggle] = useToggle();
  <span class="c">// …</span>
}

function Header() {
  const [open, toggle] = useToggle();
  <span class="c">// …</span>
}</code></pre>
<p>
  Toggling the sidebar does not open the header. Checked: two components each calling <code>useToggle</code>, with one
  toggled, rendered <i>true</i> and <i>false</i>. This follows from the previous section: each component's render calls
  <code>useState</code>, so each gets its own slot in its own hook list. If two components need the <em>same</em> value,
  a hook is the wrong tool; <a href="/react/react-lifting-styling">lift the state</a> to a common parent, put it in
  <a href="/react/react-context">context</a>, or keep it in an external store the hook subscribes to.
</p>

<figure>
  <svg viewBox="0 0 760 240" class="dg" role="img" aria-label="One useToggle function is called by Sidebar and by Header. Each call creates a separate state slot in that component's own record, so Sidebar holds true while Header holds false.">
    <g class="rough">
      <rect class="boxg" x="285" y="20" width="190" height="56" rx="10" />
      <rect class="box" x="40" y="150" width="260" height="66" rx="10" />
      <rect class="box" x="460" y="150" width="260" height="66" rx="10" />
      <path class="ln" d="M330 76 L190 144" marker-end="url(#arrow)" />
      <path class="ln" d="M430 76 L570 144" marker-end="url(#arrow)" />
    </g>
    <text class="lbl" x="380" y="45" text-anchor="middle">useToggle()</text>
    <text class="sm" x="380" y="64" text-anchor="middle">one function, shared code</text>
    <text class="lbl" x="170" y="176" text-anchor="middle">Sidebar's record</text>
    <text class="sm" x="170" y="198" text-anchor="middle">slot 0: true</text>
    <text class="lbl" x="590" y="176" text-anchor="middle">Header's record</text>
    <text class="sm" x="590" y="198" text-anchor="middle">slot 0: false</text>
    <text class="sm" x="235" y="112" text-anchor="middle">called in render</text>
    <text class="sm" x="525" y="112" text-anchor="middle">called in render</text>
  </svg>
  <figcaption>
    The code is shared; the state is not. Each component that calls the hook gets its own slot in its own record.
  </figcaption>
</figure>

<h3>Extracting a hook from a component</h3>
<p>
  Custom hooks are rarely designed up front. They are found, when the same few lines of state and effects show up in a
  second component, or when one component's body mixes three concerns and gets hard to read. Here is a component with an
  online-status concern tangled into it:
</p>
<pre><code>function SaveButton({ onSave }) {
  const [online, setOnline] = useState(() =&gt; navigator.onLine);

  useEffect(() =&gt; {
    const update = () =&gt; setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () =&gt; {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return &lt;button disabled={!online} onClick={onSave}&gt;{online ? "Save" : "Offline"}&lt;/button&gt;;
}</code></pre>
<p>
  The extraction is mechanical. Move the state and the effect into a function named after what it provides, return what
  the component reads, and call it:
</p>
<pre><code>function useOnlineStatus() {
  const [online, setOnline] = useState(() =&gt; navigator.onLine);
  useEffect(() =&gt; {
    const update = () =&gt; setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () =&gt; {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

function SaveButton({ onSave }) {
  const online = useOnlineStatus();
  return &lt;button disabled={!online} onClick={onSave}&gt;{online ? "Save" : "Offline"}&lt;/button&gt;;
}</code></pre>
<p>
  The component now reads as a statement of intent: "I need to know whether we are online." Everything about
  <em>how</em> is behind the name. The behaviour is identical, including under Strict Mode, because the same hooks are
  called in the same order; you moved code, you did not change what React sees. Any input the logic needs becomes a
  parameter, and anything the component reads becomes the return value.
</p>

<h3>Worked example: what React sees</h3>
<p>
  To make the "pasted in" model concrete, trace the hook slots of a component that uses two custom hooks, one of which
  uses another:
</p>
<pre><code>function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() =&gt; {
    const id = setTimeout(() =&gt; setDebounced(value), delay);
    return () =&gt; clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function useSearch(query) {
  const debounced = useDebounced(query, 300);
  const [results, setResults] = useState([]);
  useEffect(() =&gt; {
    let ignore = false;
    search(debounced).then((r) =&gt; { if (!ignore) setResults(r); });
    return () =&gt; { ignore = true; };
  }, [debounced]);
  return results;
}

function SearchPage() {
  const [query, setQuery] = useState("");
  const results = useSearch(query);
  <span class="c">// …</span>
}</code></pre>
<div class="table-scroll"><table>
<thead><tr><th>Slot in <code>SearchPage</code></th><th>Hook</th><th>Called by</th><th>Holds</th></tr></thead>
<tbody>
<tr><td>0</td><td><code>useState</code></td><td><code>SearchPage</code></td><td><code>query</code></td></tr>
<tr><td>1</td><td><code>useState</code></td><td><code>useDebounced</code> (inside <code>useSearch</code>)</td><td><code>debounced</code></td></tr>
<tr><td>2</td><td><code>useEffect</code></td><td><code>useDebounced</code></td><td>the timer</td></tr>
<tr><td>3</td><td><code>useState</code></td><td><code>useSearch</code></td><td><code>results</code></td></tr>
<tr><td>4</td><td><code>useEffect</code></td><td><code>useSearch</code></td><td>the request</td></tr>
</tbody>
</table></div>
<p>
  React sees five hook calls in a flat list. The nesting exists only in your source. That is why the rules of hooks apply
  inside custom hooks exactly as in components: a custom hook that calls a hook conditionally shifts every slot after it
  in every component that uses it. It also explains why hooks compose freely: <code>useSearch</code> neither knows nor
  cares that <code>useDebounced</code> uses state and an effect.
</p>
<p>
  Trace a user typing "react" quickly. Each keystroke updates slot 0 and re-renders. <code>useDebounced</code>'s effect
  re-runs for each new <code>query</code>, and its cleanup cancels the previous timer, so only the last keystroke's timer
  survives 300 ms. When it fires, slot 1 becomes "react", <code>useSearch</code>'s effect sees a new
  <code>debounced</code> and starts one request. Five keystrokes, one search.
</p>

<h3>What a hook should return</h3>
<p>
  The return value is the hook's API, and a few conventions keep it pleasant to use.
</p>
<ul>
  <li><b>A single value</b> when there is one thing to read: <code>useOnlineStatus()</code> returns a boolean, <code>useDebounced(v)</code> a value.</li>
  <li><b>A tuple</b> when it mirrors <code>useState</code>, a value and a way to change it, so callers can name both: <code>const [open, toggleOpen] = useToggle()</code>. Keep tuples to two, at most three, entries; beyond that nobody remembers the order.</li>
  <li><b>An object</b> when there are several named things, so callers take what they need: <code>const { data, error, isLoading } = useRequest(url)</code>.</li>
</ul>
<p>
  Return functions that are stable when callers are likely to pass them to memoised children or effect dependencies.
  <code>toggle</code> in the first example is a new function on every render; wrapping it in
  <code>useCallback(() =&gt; setOn((v) =&gt; !v), [])</code> makes it stable, and because it uses an updater it needs no
  dependencies. With the React Compiler enabled this happens automatically; without it, a hook in a shared library should
  do it by hand, since the hook cannot know how its callers will use the function.
</p>

<h3>What a hook should take</h3>
<p>
  Parameters deserve as much thought as the return value, because they decide when the hook's effects re-run. A few
  rules that hold up:
</p>
<ul>
  <li><b>Primitives over objects.</b> <code>useRequest(url, { method, accept })</code> invites callers to pass a fresh object; <code>useRequest(url, method)</code> cannot be misused that way. When options are many, destructure them at the top of the hook and use the individual fields as dependencies.</li>
  <li><b>Callbacks are events, not dependencies.</b> A function the hook calls "when something happens" (an <code>onChange</code>, an <code>onOutside</code>) should be read through <code>useEffectEvent</code>, so callers can pass inline arrows without causing the hook to subscribe again.</li>
  <li><b>Refs for DOM targets.</b> A hook that attaches listeners to an element takes a ref and reads <code>ref.current</code> inside its effect, which runs after the element exists. Passing the element itself during render would pass <code>null</code> on the first render.</li>
  <li><b>Sensible defaults.</b> <code>useDebounced(value, delay = 300)</code> covers the common case in one argument and still allows tuning.</li>
</ul>
<p>
  A useful test: write the call site first, the way you would like to read it in a component, then implement the hook to
  match. Hooks designed from the inside out tend to expose their implementation in their parameters.
</p>

<h3>Three hooks worth having</h3>

<h4>Persisting state in localStorage</h4>
<pre><code>function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() =&gt; {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() =&gt; {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}</code></pre>
<p>
  Both storage calls are guarded: <code>localStorage</code> can throw when storage is blocked, when the quota is full, or
  when the saved text is not valid JSON, and an unguarded read takes the component down. The lazy initialiser reads once;
  the effect writes after every change. Two limitations are worth knowing. Two components using the same key each have
  their own state and do not see each other's changes until a reload, because a hook shares logic, not data. And in a
  server-rendered app the initialiser would run on the server, where <code>localStorage</code> does not exist; that case,
  and cross-component sharing, is what <a href="/react/react-sync-external-store">useSyncExternalStore</a> solves.
</p>

<h4>Debouncing a value</h4>
<p>
  <code>useDebounced</code> from the worked example is the second. Notice the design choice: it debounces a
  <em>value</em>, not a function. The input stays fully responsive because it renders from <code>query</code>, and the
  expensive work keys off the debounced copy. Debouncing a callback instead is possible but harder to get right, because
  the debounced function has to see the latest props without being re-created on every render.
</p>

<h4>Closing on an outside click</h4>
<pre><code>function useClickOutside(ref, onOutside) {
  const handler = useEffectEvent(onOutside);

  useEffect(() =&gt; {
    function onPointerDown(event) {
      if (ref.current &amp;&amp; !ref.current.contains(event.target)) handler(event);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () =&gt; document.removeEventListener("pointerdown", onPointerDown);
  }, [ref]);
}

function Dropdown() {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  useClickOutside(boxRef, () =&gt; setOpen(false));
  return &lt;div ref={boxRef}&gt;…&lt;/div&gt;;
}</code></pre>
<p>
  The caller passes a new arrow function every render. If that function were an effect dependency, the listener would be
  removed and re-added on every render. <code>useEffectEvent</code>, stable since React 19.2, wraps it so the effect can
  call the latest version without depending on it; <a href="/react/react-effects-depth">effects in depth</a> explains it
  fully. Listening for <code>pointerdown</code> rather than <code>click</code> closes the dropdown before a click elsewhere
  starts something else, and covers touch and pen as well as mouse.
</p>

<h3>Worked example: the key that changes</h3>
<p>
  <code>useLocalStorage</code> as written has a bug that only shows when its <code>key</code> parameter changes while the
  component stays mounted. Picture a note editor that shows one note at a time:
</p>
<pre><code>function NoteEditor({ noteId }) {
  const [text, setText] = useLocalStorage("note:" + noteId, "");
  return &lt;textarea value={text} onChange={(e) =&gt; setText(e.target.value)} /&gt;;
}</code></pre>
<div class="table-scroll"><table>
<thead><tr><th>Step</th><th><code>key</code></th><th><code>text</code> state</th><th>What runs</th><th>Storage after</th></tr></thead>
<tbody>
<tr><td>Mount with note a</td><td>note:a</td><td>"alpha" (read by the initialiser)</td><td>effect writes note:a</td><td>a = alpha, b = beta</td></tr>
<tr><td>Switch to note b</td><td>note:b</td><td>"alpha" (initialiser does not run again)</td><td>effect sees a new key, writes the current text to it</td><td>a = alpha, <b>b = alpha</b></td></tr>
</tbody>
</table></div>
<p>
  Checked: after switching, the editor still showed "alpha" and note b in storage had been overwritten with "alpha". The
  lazy initialiser runs once per mounted component, not once per key, and the write effect then copies the stale value
  under the new key. The data loss is silent.
</p>
<p>
  The simplest fix belongs to the caller: <code>&lt;NoteEditor key={noteId} noteId={noteId} /&gt;</code> remounts the
  editor for each note, so the initialiser runs again. A hook that wants to be safe on its own can remember which key its
  state belongs to and reset during render when it changes:
</p>
<pre><code>const [state, setState] = useState(() =&gt; ({ key, value: read(key, initial) }));
if (state.key !== key) setState({ key, value: read(key, initial) });</code></pre>
<p>
  and write only when <code>state.key === key</code>. The general lesson applies to every hook that derives its initial
  state from a parameter: decide, and document, what happens when that parameter changes.
</p>

<h3>Hooks that take hooks' output</h3>
<p>
  Because hooks are functions, their outputs can feed each other, and that is where they shine:
</p>
<pre><code>function useProductSearch() {
  const [query, setQuery] = useLocalStorage("product-query", "");
  const debounced = useDebounced(query, 250);
  const results = useSearch(debounced);
  return { query, setQuery, results };
}</code></pre>
<p>
  Each line is a small, tested piece with a clear name. The component that calls <code>useProductSearch</code> gets a
  persisted, debounced search in one line. Composition is also the answer to "my hook needs an option for X": usually a
  second, smaller hook that the first one calls, rather than a flag.
</p>

<h3>When you do want shared state: a hook over a store</h3>
<p>
  A hook cannot hold shared state, but it is the natural interface to state held elsewhere. Put the data in a small
  module-level store and let the hook subscribe to it:
</p>
<pre><code>const listeners = new Set();
let cart = [];

const cartStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () =&gt; listeners.delete(listener);
  },
  getSnapshot: () =&gt; cart,
  add(item) {
    cart = [...cart, item];
    listeners.forEach((listener) =&gt; listener());
  },
};

function useCart() {
  const items = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot);
  return { items, add: cartStore.add };
}</code></pre>
<p>
  Now every component that calls <code>useCart</code> reads the same array and re-renders when it changes, because the
  data lives in the module and each component's hook only holds a subscription to it. The store replaces the array on
  every change rather than mutating it, so the snapshot's identity tells React whether anything changed. This is the
  pattern state libraries are built on; <a href="/react/react-sync-external-store">useSyncExternalStore</a> covers it in
  depth, including the server snapshot. For state owned by a subtree rather than the whole app,
  <a href="/react/react-context">context</a> with a hook in front of it (<code>useTheme()</code> reading
  <code>useContext(ThemeContext)</code> and throwing a clear error outside the provider) is the equivalent.
</p>

<h3>Custom hooks and the React Compiler</h3>
<p>
  The React Compiler memoises components and hooks automatically, so a hook that returns
  <code>{ items, add }</code> built fresh each render no longer forces callers to re-render memoised children. Two
  consequences for hook authors. Keep hooks pure in the way the compiler assumes: no reading refs during render, no
  mutating values the hook received, no side effects outside effects. And do not rely on the compiler in shared code
  that may run in apps without it; for a published hook, explicit <code>useCallback</code> and <code>useMemo</code> on
  returned values remain the safe choice.
</p>

<h3>Hooks in a real codebase</h3>
<p>
  A few habits keep a growing set of hooks manageable. Put a hook next to its only user until a second user appears,
  then move it to a shared <code>hooks</code> folder; premature sharing creates hooks shaped around one caller. Name
  hooks after what they provide (<code>useOnlineStatus</code>, <code>useCart</code>), not how they work
  (<code>useWindowEventListener</code> is fine as a building block, but the component should usually call the hook that
  describes the outcome). Before writing a data-fetching hook with caching, retries and deduplication, reach for a
  library such as TanStack Query or the framework's loader; a hand-rolled <code>useRequest</code> is a fine learning
  exercise and a poor production cache. And keep each hook small enough that its test fits on one screen.
</p>

<h3>When not to write a hook</h3>
<p>
  A custom hook is the right extraction when the code uses hooks. Several things that look like candidates are not.
</p>
<ul>
  <li><b>Logic with no hooks in it.</b> Formatting a date, validating an email, computing a cart total: these are plain functions. Calling them <code>useFormatDate</code> adds the hook rules for no reason and stops you calling them in loops, conditions and event handlers.</li>
  <li><b>Lifecycle wrappers.</b> <code>useMount(fn)</code> and <code>useUpdateEffect(fn)</code> rename <code>useEffect</code> with a lifecycle meaning. They hide the dependency array, so the linter cannot check it, and they encourage the "run on mount" thinking that leads to missing dependencies. Write the effect, with its dependencies, where it is used.</li>
  <li><b>Hooks that hide what they do.</b> <code>usePageSetup()</code> that fetches data, sets the document title, registers analytics and opens a socket is not an abstraction, it is a junk drawer. A good hook does one thing and its name says what.</li>
  <li><b>Hooks as global state.</b> If the point is "every component sees the same cart", a hook alone cannot provide it, as shown above. It can be the interface to context or a store, which is a fine design; it cannot be the storage.</li>
</ul>

<h3>Dependencies across the hook boundary</h3>
<p>
  A hook that runs an effect usually takes parameters that end up in that effect's dependency array, and its callers
  decide whether those parameters are stable. This is where most custom-hook bugs live.
</p>
<pre><code>function useRequest(url, options) {
  const [state, setState] = useState({ status: "loading" });
  useEffect(() =&gt; {
    const controller = new AbortController();
    fetch(url, { ...options, signal: controller.signal })
      .then((r) =&gt; r.json())
      .then((data) =&gt; setState({ status: "success", data }))
      .catch((error) =&gt; {
        if (error.name !== "AbortError") setState({ status: "error", error });
      });
    return () =&gt; controller.abort();
  }, [url, options]);
  return state;
}

useRequest("/api/items", { headers: { Accept: "application/json" } });   <span class="c">// ✗ refetches forever</span></code></pre>
<p>
  The caller passes a new <code>options</code> object every render, the effect sees a changed dependency, fetches, sets
  state, re-renders, and passes yet another new object. Three ways out, in order of preference. Take primitives instead of
  objects (<code>useRequest(url, { accept })</code> destructured to <code>accept</code> inside, with
  <code>accept</code> as the dependency). Document that the argument must be stable and let callers use
  <code>useMemo</code> or a module-level constant. Or read the latest value through <code>useEffectEvent</code> when it
  should not trigger a refetch at all. What you must not do is silently drop <code>options</code> from the array; the hook
  would then ignore later changes with no warning.
</p>

<h3>Testing a hook</h3>
<p>
  Hooks can only run inside a component, so tests render one. Testing Library's <code>renderHook</code> does it for you:
</p>
<pre><code>import { renderHook, act } from "@testing-library/react";

test("toggles", () =&gt; {
  const { result } = renderHook(() =&gt; useToggle());
  expect(result.current[0]).toBe(false);
  act(() =&gt; result.current[1]());
  expect(result.current[0]).toBe(true);
});</code></pre>
<p>
  <code>result.current</code> always holds the latest return value, and state updates go inside <code>act</code> so React
  processes them before the assertion. For hooks with effects and timers, combine with fake timers. Often the better test
  is of a small component that uses the hook the way real code does, asserting on what the user sees; test the hook alone
  when it is a shared building block with many callers.
</p>

<h3>Debugging: <code>useDebugValue</code></h3>
<pre><code>function useOnlineStatus() {
  <span class="c">// …</span>
  useDebugValue(online ? "Online" : "Offline");
  return online;
}</code></pre>
<p>
  React DevTools lists the hooks a component calls; <code>useDebugValue</code> adds a label next to a custom hook there.
  It is worth it for shared library hooks with non-obvious state and noise everywhere else. It has no effect on behaviour.
</p>

<h3>Cost</h3>
<p>
  A custom hook adds no runtime cost of its own: it is a function call, and the hooks inside cost what they would cost in
  the component. The real costs are the ones its callers cannot see: an effect that re-subscribes because a parameter is
  unstable, or state that causes renders the caller did not expect. A good hook makes those costs part of its documented
  contract, usually in its parameter names and one sentence of documentation.
</p>

<h3>Pitfalls</h3>
<ul>
  <li><b>Expecting two components to share a hook's state</b>: each call gets its own.</li>
  <li><b>Calling hooks conditionally inside a custom hook</b>: it breaks every component that uses it.</li>
  <li><b>The <code>use</code> prefix on a function with no hooks</b>, or no prefix on one with hooks.</li>
  <li><b>Object or function parameters in the hook's effect dependencies</b> without saying they must be stable.</li>
  <li><b>Dropping a dependency inside the hook</b> to stop a loop the caller caused.</li>
  <li><b>Unstable returned functions</b> from a shared hook, breaking callers' memoisation.</li>
  <li><b>Lifecycle wrappers</b> like <code>useMount</code> that hide dependency arrays from the linter.</li>
  <li><b>Initial state derived from a parameter</b> that is never re-read when the parameter changes.</li>
  <li><b>Unguarded browser APIs</b> (<code>localStorage</code>, <code>window</code>) that crash on the server or in locked-down browsers.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>The same <code>useState</code> + <code>useEffect</code> pair copied into a second component: extract a hook.</li>
  <li>A component body mixing data fetching, a subscription and UI state: one hook per concern.</li>
  <li>"Both components should update when either changes": not a hook alone; lift state, context, or a store.</li>
  <li>"It refetches in a loop when I pass options": unstable parameters across the hook boundary.</li>
  <li>A helper named <code>use…</code> that the linter complains about in a loop: it is a plain function, rename it.</li>
</ul>

<h3>Interview questions</h3>
<p><b>1. What is a custom hook?</b></p>
<p>
  A function whose name starts with <code>use</code> and which calls other hooks, used to reuse stateful logic between
  components. It runs as part of the calling component's render, so its hooks become slots in that component's hook
  list. The prefix lets the lint rules enforce the rules of hooks inside it.
</p>
<p class="sub">
  <i>Follow-up: do two components using the same hook share state?</i> No. Each component's render calls the hooks again
  and gets its own slots. To share state, lift it, put it in context, or subscribe to an external store from the hook.
</p>
<p><b>2. How would you decide whether to extract a hook?</b></p>
<p>
  When the code uses hooks and either appears in more than one component or is a distinct concern inside a busy component.
  If it uses no hooks, it is a plain function. I avoid lifecycle-style wrappers that hide dependency arrays.
</p>
<p><b>3. A hook takes an options object and refetches forever. Why, and what are the fixes?</b></p>
<p>
  The caller creates a new object each render, the hook's effect depends on it, the fetch sets state, the component
  re-renders and passes another new object. Fixes: take primitives and depend on them, require a stable argument and have
  callers memoise or hoist it, or read it through <code>useEffectEvent</code> if it should not trigger refetches. Never drop
  it from the dependencies.
</p>
<p class="sub">
  <i>Follow-up: how would you test the hook?</i> <code>renderHook</code> with a changing argument, asserting the request
  function is called once per real change, or a small component test asserting what the user sees.
</p>
<p><b>4. What should a custom hook return?</b></p>
<p>
  One value when there is one thing to read, a two-item tuple when it mirrors <code>useState</code> so callers can name
  both, and an object when there are several named things. Returned functions should be stable for shared hooks, via
  <code>useCallback</code> or the compiler.
</p>
<p><b>5. A <code>useLocalStorage(key)</code> hook overwrites one saved note with another when the user switches notes. What is happening?</b></p>
<p>
  The component stays mounted while <code>key</code> changes. <code>useState</code>'s initialiser only runs on mount, so
  the state still holds the old note's text, and the write effect, which depends on <code>key</code>, runs and saves that
  stale text under the new key. Either the caller remounts the component with <code>key={noteId}</code>, or the hook
  tracks which key its state belongs to and re-reads storage during render when the key changes.
</p>
<p class="sub">
  <i>Follow-up: why not re-read storage in an effect when the key changes?</i> The first render after the switch would
  show the wrong note, and the write effect would still run first with stale data. Adjusting state during render fixes
  the value before anything is committed.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "Can I call a custom hook inside an <code>if</code> if the hook itself is simple?" No. However simple, it calls hooks,
    and those calls become slots in the component's list. Calling it conditionally changes the slot order between renders.
    The rules apply to the custom hook call exactly as to the hooks inside it.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "A custom hook is a <code>use</code>-prefixed function that calls other hooks, so I can reuse stateful logic. It runs
    inside the caller's render, so each component gets its own state; hooks share logic, not data. I extract one when a
    hook-using concern repeats or clutters a component, keep it to one job, return a value, tuple or object depending on
    the shape, and make sure parameters that feed effects are primitives or documented as stable."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Extract a hook from a component that tracks online status, without changing behaviour.</li>
    <li>Explain why two components using <code>useToggle</code> do not share state, in terms of hook slots.</li>
    <li>Fill in the slot table for a component that uses nested custom hooks.</li>
    <li>Choose a return shape for three hooks and justify each.</li>
    <li>Write <code>useLocalStorage</code> with guarded storage access, name its two limitations, and fix its changing-key bug.</li>
    <li>Turn a hook into the interface for shared state with a module store and <code>useSyncExternalStore</code>.</li>
    <li>Fix a hook that refetches forever because of an object parameter, without dropping a dependency.</li>
    <li>Say when not to write a hook.</li>
  </ul>
</div>`,
};
