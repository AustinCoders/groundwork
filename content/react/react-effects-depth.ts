import type { Chapter } from "../types";

export const reactEffectsDepth: Chapter = {
  id: "react-effects-depth",
  num: "I5",
  title: "Effects in depth",
  short: "Effects in depth",
  levels: ["intermediate"],
  prerequisites: ["react-useeffect-basics", "react-useref", "react-custom-hooks"],
  practice: [
    "ex-react-effect-runner",
    "ex-comp-effect-loop",
    "ex-comp-stale-interval",
    "ex-comp-resubscribe-on-change",
  ],
  ready: true,
  subtitle: "Stale closures, the dependency array as a contract, and the effects that should not exist.",
  body: `<p>
  <a href="/react/react-useeffect-basics">useEffect basics</a> covered the mechanics: an effect runs after the commit, its
  cleanup runs before the next run and on unmount, and the dependency array decides when it re-runs. This chapter is about
  the bugs those mechanics produce in real code and about the larger skill of knowing when an effect is the wrong tool.
  It covers the stale closure and its four fixes, <code>useEffectEvent</code>, the dependency array as a contract,
  removing dependencies honestly, the effects that should not exist and what replaces each one, race conditions, Strict
  Mode, and what the React Compiler does and does not change. Every behaviour with a number attached was checked against
  React 19.3.
</p>

<h3>What an effect is for</h3>
<p>
  One sentence worth holding onto: <b>an effect synchronises a component with something outside React</b>. A timer, a
  socket, a browser API, a third-party widget, the document title. React renders; the outside world does not know about
  React; the effect is the bridge that keeps the two in agreement as props and state change, and tears the bridge down
  when the component leaves.
</p>
<p>
  Everything else people put in effects (computing values, reacting to clicks, telling a parent something changed,
  resetting state) is not synchronisation with an outside system, and each has a better home. Most of this chapter is a
  consequence of taking that sentence seriously.
</p>
<p>
  It also replaces the lifecycle model many people bring from class components, where code ran "on mount", "on update"
  and "on unmount". An effect does not have those phases. It has one job: given the current values, start
  synchronising, and return how to stop. React decides how often that happens. Thinking in lifecycles leads directly to
  the bugs below: "run once on mount" becomes an empty dependency array with stale values inside, and "run on update"
  becomes an effect that reacts to its own state changes. Thinking in synchronisation leads to the question that fixes
  them: which values must this connection follow?
</p>

<h3>The stale closure</h3>
<p>
  The most common effect bug, and once you see the mechanism you will spot it everywhere.
</p>
<pre><code>function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() =&gt; {
    const id = setInterval(() =&gt; {
      setCount(count + 1);
    }, 1000);
    return () =&gt; clearInterval(id);
  }, []);

  return &lt;p&gt;{count}&lt;/p&gt;;
}</code></pre>
<p>
  Each render is a separate call of <code>Counter</code>, with its own <code>count</code> constant. The effect ran after
  the first render, so the arrow function inside it closed over <em>that render's</em> <code>count</code>, which is
  zero. The empty array means the effect never runs again, so the interval never gets a function that sees a later
  value.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Time</th><th>Interval callback runs</th><th><code>count</code> it sees</th><th>Calls</th><th>Screen</th></tr></thead>
<tbody>
<tr><td>0 s</td><td>(first render, effect starts the interval)</td><td>&ndash;</td><td>&ndash;</td><td>0</td></tr>
<tr><td>1 s</td><td>yes</td><td>0</td><td><code>setCount(1)</code></td><td>1</td></tr>
<tr><td>2 s</td><td>yes</td><td>0</td><td><code>setCount(1)</code>, same value</td><td>1</td></tr>
<tr><td>3 s</td><td>yes</td><td>0</td><td><code>setCount(1)</code>, bailed out</td><td>1</td></tr>
</tbody>
</table></div>
<p>
  Checked: across four ticks the component rendered with 0, then 1, then once more with 1 before React bailed out of
  identical updates. The screen shows 1 forever. Nothing throws and nothing warns; the counter simply stops.
</p>
<figure>
  <svg viewBox="0 0 760 230" class="dg" role="img" aria-label="Three renders of Counter each have their own count: 0, 1 and 1. The effect ran only after render 0, so the interval callback is attached to render 0 and always reads count as 0.">
    <g class="rough">
      <rect class="boxg" x="20" y="30" width="200" height="60" rx="10" />
      <rect class="box" x="280" y="30" width="200" height="60" rx="10" />
      <rect class="box" x="540" y="30" width="200" height="60" rx="10" />
      <rect class="box" x="20" y="150" width="200" height="60" rx="10" />
      <path class="ln" d="M120 90 V144" marker-end="url(#arrow)" />
      <path class="ln" d="M220 180 H520 V96" marker-end="url(#arrow)" />
    </g>
    <text class="lbl" x="120" y="56" text-anchor="middle">render 0</text>
    <text class="sm" x="120" y="76" text-anchor="middle">count = 0, effect runs</text>
    <text class="lbl" x="380" y="56" text-anchor="middle">render 1</text>
    <text class="sm" x="380" y="76" text-anchor="middle">count = 1, effect skipped</text>
    <text class="lbl" x="640" y="56" text-anchor="middle">render 2</text>
    <text class="sm" x="640" y="76" text-anchor="middle">count = 1, effect skipped</text>
    <text class="lbl" x="120" y="176" text-anchor="middle">interval callback</text>
    <text class="sm" x="120" y="196" text-anchor="middle">always reads render 0</text>
    <text class="sm" x="380" y="172" text-anchor="middle">every tick: setCount(0 + 1)</text>
  </svg>
  <figcaption>
    A closure belongs to the render that created it. An effect that never re-runs keeps the first render's values.
  </figcaption>
</figure>

<h3>Four fixes, in order of preference</h3>
<pre><code><span class="c">// 1. don't read it at all: the updater gets the latest value</span>
setCount((c) =&gt; c + 1);

<span class="c">// 2. depend on it, and accept the interval restarting each change</span>
}, [count]);

<span class="c">// 3. useEffectEvent: read the latest values without depending on them</span>
const [step, setStep] = useState(1);
const onTick = useEffectEvent(() =&gt; setCount((c) =&gt; c + step));
useEffect(() =&gt; {
  const id = setInterval(() =&gt; onTick(), 1000);
  return () =&gt; clearInterval(id);
}, []);

<span class="c">// 4. the ref workaround, still common in existing code</span>
const latestStep = useRef(step);
useEffect(() =&gt; { latestStep.current = step; });
useEffect(() =&gt; {
  const id = setInterval(() =&gt; setCount((c) =&gt; c + latestStep.current), 1000);
  return () =&gt; clearInterval(id);
}, []);</code></pre>
<p>
  The updater is best when the only stale value is the state being updated: it removes the read entirely. Depending on
  the value is correct but restarts the timer on every change, which for a one-second interval means the tick drifts.
  <code>useEffectEvent</code> is the tool when the effect must read other values that change (here, <code>step</code>)
  but should not restart because of them. The ref pattern does the same job by hand; recognise it in existing code and
  prefer the hook in new code.
</p>

<h3>useEffectEvent, properly</h3>
<p>
  Stable since React 19.2. An Effect Event is a function that always sees the latest props and state when it is called,
  and that you do not list as a dependency. It separates the part of an effect that <em>synchronises</em> from the part
  that <em>reacts</em> when something happens.
</p>
<pre><code>function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() =&gt; {
    showToast("Connected to " + roomId, theme);
  });

  useEffect(() =&gt; {
    const connection = connect(roomId);
    connection.on("connected", () =&gt; onConnected());
    return () =&gt; connection.disconnect();
  }, [roomId]);
}</code></pre>
<p>
  Without it there are two wrong choices. Add <code>theme</code> to the dependencies and the chat reconnects whenever the
  user toggles dark mode. Leave it out and the toast uses the theme from whenever the room last changed. Checked with
  the render sequence room a (light), room a (dark), room b (dark): the log was <i>connect a, connected a theme=light,
  disconnect a, connect b, connected b theme=dark</i>. Changing only the theme did not reconnect, and the connection to
  room b used the current theme.
</p>
<div class="bx is-prim">
  <span class="ttl">The line it draws</span>
  <p>
    An effect's dependencies are the values it <b>synchronises with</b>. Values it merely <b>reads when something
    happens</b> are event logic that happens to run inside an effect. <code>useEffectEvent</code> makes that split
    explicit, which is why it is named after events and not after "latest ref".
  </p>
</div>
<p>
  Its constraints are strict and enforced. Call it only from inside effects (or from functions those effects call), in
  the same component. Calling it during render throws; checked, the error reads "A function wrapped in useEffectEvent
  can't be called during rendering." Do not pass it to child components or list it in a dependency array. And it is not
  a general escape from dependencies: if the whole effect body ends up inside an Effect Event, the effect synchronises
  with nothing and the logic belongs in an event handler.
</p>

<h3>The dependency array is a contract</h3>
<p>
  The array says: <em>this effect stays in sync with these values</em>. Every reactive value the effect reads (props,
  state, and anything computed from them during render) must be listed, and the lint rule checks exactly that. Removing a
  dependency to stop an effect re-running does not fix anything. It freezes the effect on an old value and turns a
  visible loop into a silent wrong answer, often one that only appears when a user does something in an unusual order.
</p>
<div class="bx is-prim">
  <span class="ttl">If satisfying the linter breaks the effect</span>
  <p>
    The effect is modelling the wrong thing. Something in it is not synchronisation: an event reaction, a derived value,
    or a one-off initialisation. Change the shape of the code so the dependency is not needed, rather than silencing the
    rule.
  </p>
</div>

<h3>Removing dependencies honestly</h3>
<p>
  Each of these removes a dependency by making it genuinely unnecessary.
</p>
<pre><code><span class="c">// an object dependency: depend on the field you use</span>
useEffect(() =&gt; { track(user.id); }, [user.id]);

<span class="c">// a function defined in the component: move it inside the effect</span>
useEffect(() =&gt; {
  function buildUrl() { return "/api/rooms/" + roomId; }
  const socket = open(buildUrl());
  return () =&gt; socket.close();
}, [roomId]);

<span class="c">// a function that uses no props or state: hoist it to module scope</span>
function formatTime(ms) { /* … */ }

<span class="c">// state read only to compute the next state: use the updater</span>
setMessages((list) =&gt; [...list, message]);

<span class="c">// a value read only when an event fires: an Effect Event</span>
const onMessage = useEffectEvent((m) =&gt; { if (!muted) play(); });</code></pre>
<p>
  An object or function created during render is a new value every render, so listing it makes the effect run after
  every render. Depending on <code>user.id</code> instead of <code>user</code> means the effect re-runs only when the id
  changes, which is usually what was meant. Moving a function into the effect removes it from the component's scope, so
  only the values it really reads remain as dependencies.
</p>

<h3>One effect per concern</h3>
<pre><code><span class="c">// ✗ two unrelated jobs share one dependency list</span>
useEffect(() =&gt; {
  document.title = title;
  const id = setInterval(poll, 5000);
  return () =&gt; clearInterval(id);
}, [title]);

<span class="c">// ✓ each effect has the dependencies it actually needs</span>
useEffect(() =&gt; { document.title = title; }, [title]);
useEffect(() =&gt; {
  const id = setInterval(poll, 5000);
  return () =&gt; clearInterval(id);
}, []);</code></pre>
<p>
  In the first version the polling restarts whenever the title changes, because both jobs share one list. Effects are
  cheap; split by what each one synchronises with. A good test is whether you could delete one job without touching the
  other's code. If you could, they belong in separate effects, and often in separate custom hooks.
</p>

<h3>The effects that should not exist</h3>
<div class="table-scroll"><table>
<thead><tr><th>You want to…</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Compute something from props or state</td><td>Nothing: calculate it during render</td></tr>
<tr><td>Cache an expensive calculation</td><td><code>useMemo</code></td></tr>
<tr><td>React to a click, submit or keypress</td><td>The event handler</td></tr>
<tr><td>Tell a parent that something changed</td><td>Call its callback in the same event handler</td></tr>
<tr><td>Reset all state when a prop changes</td><td>A <code>key</code> on the component</td></tr>
<tr><td>Adjust some state when a prop changes</td><td>Set it during render, guarded by a comparison</td></tr>
<tr><td>Subscribe to an external store</td><td><code>useSyncExternalStore</code></td></tr>
<tr><td>Fetch data</td><td>A data library or the framework's loader; an effect with cleanup if neither</td></tr>
<tr><td>Connect to a socket, timer or browser API</td><td><span class="chip tone-yes">an effect</span></td></tr>
<tr><td>Measure the DOM and adjust before paint</td><td><code>useLayoutEffect</code></td></tr>
</tbody>
</table></div>
<p>
  The pattern that matters most is the first row, because it costs more than it looks.
</p>
<pre><code><span class="c">// ✗ derived state in an effect</span>
function Name({ first, last }) {
  const [full, setFull] = useState("");
  useEffect(() =&gt; { setFull(first + " " + last); }, [first, last]);
  return &lt;p&gt;{full}&lt;/p&gt;;
}

<span class="c">// ✓ just compute it</span>
function Name({ first, last }) {
  const full = first + " " + last;
  return &lt;p&gt;{full}&lt;/p&gt;;
}</code></pre>
<p>
  Checked: the effect version rendered twice on mount and twice on every prop change. Worse, it committed the stale value
  first. Recording what reached the DOM across mount and one update gave <i>"", "A B", "A B", "A C"</i>: an empty name,
  then the right one, then the <em>old</em> name for a frame after the prop changed, then the right one. The computed
  version renders once with the right value every time.
</p>

<h4>Chains of effects</h4>
<pre><code>useEffect(() =&gt; { setA(start); }, [start]);
useEffect(() =&gt; { setB(a * 2); }, [a]);
useEffect(() =&gt; { setC(b + 1); }, [b]);</code></pre>
<p>
  Each effect reacts to the previous one's state. Checked: one change of <code>start</code> produced four renders before
  the value settled, each one committed. The whole chain is a calculation, <code>c = start * 2 + 1</code>, and belongs
  in render. Chains also appear in event-driven code ("when the form is submitted, set a flag; when the flag is set,
  post"). Put the whole sequence in the handler for the event that started it.
</p>

<h4>Event logic in an effect</h4>
<pre><code><span class="c">// ✗ fires whenever 'submitted' becomes true, including after a remount</span>
useEffect(() =&gt; {
  if (submitted) post("/api/order", order);
}, [submitted, order]);

<span class="c">// ✓ the click is the cause, so the click does the work</span>
function handleSubmit() {
  post("/api/order", order);
}</code></pre>
<p>
  Ask what caused the code to run. If the answer is "the user did something", it belongs in that event's handler. If it
  is "the component is on screen and these values are current", it is an effect. The effect version above can post twice
  in Strict Mode, after a remount, or when <code>order</code> changes after submission.
</p>

<h4>Notifying a parent</h4>
<p>
  <code>useEffect(() =&gt; onChange(value), [value])</code> runs one render late and makes the parent render a second
  time. Call <code>onChange(next)</code> in the same handler that calls <code>setValue(next)</code>; React batches both
  updates into one render. If the parent and child must always agree, the state probably belongs in the parent.
</p>

<h3>Worked example: untangling a component</h3>
<p>
  Real components rarely have one bad effect; they accumulate several. Here is a product filter as it often looks after a
  few months:
</p>
<pre><code>function ProductList({ products, category, onCountChange }) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(products);
  const [page, setPage] = useState(1);

  useEffect(() =&gt; {
    setVisible(products.filter((p) =&gt; p.category === category &amp;&amp; p.name.includes(query)));
  }, [products, category, query]);

  useEffect(() =&gt; { setPage(1); }, [category, query]);

  useEffect(() =&gt; { onCountChange(visible.length); }, [visible, onCountChange]);

  useEffect(() =&gt; {
    const id = setInterval(() =&gt; track("still-browsing", category), 30000);
    return () =&gt; clearInterval(id);
  }, [category]);
  <span class="c">// …</span>
}</code></pre>
<p>Go through the effects one at a time and ask what each synchronises with.</p>
<div class="table-scroll"><table>
<thead><tr><th>Effect</th><th>What it really is</th><th>Replacement</th></tr></thead>
<tbody>
<tr><td>Sets <code>visible</code></td><td>A value derived from props and state</td><td><code>const visible = products.filter(…)</code> during render, <code>useMemo</code> if measured to be slow</td></tr>
<tr><td>Resets <code>page</code></td><td>A reaction to the user changing the filter</td><td><code>setPage(1)</code> in the handlers that change <code>query</code>; a guarded update during render for <code>category</code>, which is a prop</td></tr>
<tr><td>Calls <code>onCountChange</code></td><td>Notifying the parent of derived data</td><td>Let the parent compute the count, or call it in the same handlers</td></tr>
<tr><td>Starts the interval</td><td>Synchronising with a timer</td><td>Keep it. Read <code>category</code> through an Effect Event if the timer should not restart when it changes</td></tr>
</tbody>
</table></div>
<p>
  After the refactor the component has one effect, one fewer piece of state, and no render where the list, the page and
  the parent's count disagree. Before, typing one character caused a cascade: a render with the new query and the old
  list, a render with the new list and the old page, and a parent render for the count. After, it is one render, correct
  the first time. The remaining effect is the only part of the original that actually talked to something outside React.
</p>
<p>
  This is the most useful habit the chapter can give you: for each effect, name the external system. If you cannot, the
  effect is probably one of the rows in the table above.
</p>

<h3>Reading the lint message</h3>
<p>
  The hooks lint rule's messages are more precise than they look. "React Hook useEffect has a missing dependency:
  'options'" means the effect reads a reactive value it does not list. "The 'options' object makes the dependencies of
  useEffect change on every render" means you listed it, and it is created during render. "React Hook useEffect has a
  complex expression in the dependency array" means you wrote something like <code>[user.settings[key]]</code>; pull it
  into a variable first. Each points to one of the honest fixes above. The rule never asks you to remove a dependency,
  and a suggestion to add a function usually means the function should move inside the effect.
</p>

<h3>Adjusting state during render</h3>
<p>
  The unusual row in the table. When one piece of state must change because a prop changed, an effect would render once
  with the wrong value first. React supports setting state during render instead, as long as it is guarded:
</p>
<pre><code>function List({ items }) {
  const [selection, setSelection] = useState(null);
  const [prevItems, setPrevItems] = useState(items);

  if (items !== prevItems) {
    setPrevItems(items);
    setSelection(null);
  }
  <span class="c">// …</span>
}</code></pre>
<p>
  React sees the update during render, throws away the output it was building, and calls the component again
  immediately, before anything reaches the screen. Checked: on a change of <code>items</code> the component rendered twice
  and committed once, already showing the cleared selection. The guard is essential; without it the component sets state
  on every render and React stops it with a too-many-renders error. Prefer a <code>key</code> when you want to reset
  <em>everything</em>; this pattern is for resetting one field while keeping the rest. Often it can be avoided entirely
  by storing the selected id and deriving the selected item during render.
</p>

<h3>Race conditions</h3>
<pre><code>useEffect(() =&gt; {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then((r) =&gt; r.json())
    .then(setData)
    .catch((err) =&gt; {
      if (err.name !== "AbortError") setError(err);
    });

  return () =&gt; controller.abort();
}, [url]);</code></pre>
<p>
  When <code>url</code> changes quickly, responses can arrive out of order and an older one can overwrite a newer one.
  The cleanup runs before the next effect, so aborting there guarantees only the latest request can set state. An
  <code>ignore</code> flag fixes the same bug; <code>AbortController</code> also stops the request on the network.
  Ignore the <code>AbortError</code> you caused, or the cancelled request will show an error. Data libraries do this, plus
  caching and deduplication, which is why the table recommends them.
</p>

<h3>Effects and Strict Mode</h3>
<p>
  In development, Strict Mode runs every effect's setup, then its cleanup, then its setup again when a component mounts.
  Checked: an effect with a cleanup logged <i>setup, cleanup, setup</i>. An effect without a correct cleanup shows it at
  once: two socket connections, two listeners, a doubled analytics event. The fix is always the cleanup, never a ref
  that skips the second run, because the same sequence happens in production when a user navigates away and back, or
  when React reuses a hidden subtree with <code>&lt;Activity&gt;</code>.
</p>
<p>
  Some effects are genuinely once per app load, such as initialising an analytics library. Those belong at module level,
  or behind a module-level flag, not in a component's effect pretending the component mounts once.
</p>

<h3>Timing: useEffect and useLayoutEffect</h3>
<p>
  <code>useEffect</code> runs after the browser has had a chance to paint, which keeps it off the critical path.
  <code>useLayoutEffect</code> runs after the DOM is updated but before paint, so it is the place to measure an element
  and adjust layout without a visible flicker, for a tooltip that must not overflow the window, say. It blocks paint, so
  use it only for that. <a href="/react/react-effect-timing">Effect timing</a> traces the exact order, including
  <code>useInsertionEffect</code> for CSS-in-JS libraries.
</p>

<h3>Effects and the React Compiler</h3>
<p>
  The compiler memoises values and components; it does not remove unnecessary effects or fix their dependencies. It does
  make one class of bug rarer: objects and functions created during render become stable when their inputs do not change,
  so effects that depended on them stop re-running for no reason. Do not rely on that to justify object dependencies in
  code that might run without the compiler. Its accompanying lint rules flag synchronous <code>setState</code> calls in an
  effect body, which is the derived-state pattern above, so the advice in this chapter and the tooling now agree.
</p>

<h3>A real effect, written properly</h3>
<p>
  For contrast, here is an effect that should exist, with every piece in its place:
</p>
<pre><code>function LivePrices({ symbol, currency, onAlert }) {
  const [price, setPrice] = useState(null);
  const handleAlert = useEffectEvent((p) =&gt; onAlert(symbol, p, currency));

  useEffect(() =&gt; {
    setPrice(null);
    const socket = new WebSocket("wss://prices.example.com/" + symbol);
    socket.onmessage = (event) =&gt; {
      const next = JSON.parse(event.data);
      setPrice(next.price);
      if (next.alert) handleAlert(next.price);
    };
    return () =&gt; socket.close();
  }, [symbol]);

  return &lt;p&gt;{price === null ? "Connecting…" : format(price, currency)}&lt;/p&gt;;
}</code></pre>
<div class="table-scroll"><table>
<thead><tr><th>What changes</th><th>Effect re-runs?</th><th>Why</th></tr></thead>
<tbody>
<tr><td><code>symbol</code></td><td>Yes: closes the old socket, opens a new one</td><td>The connection is to a symbol; it must follow it</td></tr>
<tr><td><code>currency</code></td><td>No</td><td>Formatting happens in render; the alert reads it through the Effect Event</td></tr>
<tr><td><code>onAlert</code> (a new arrow each parent render)</td><td>No</td><td>Read through the Effect Event, so callers need not memoise it</td></tr>
<tr><td>Component unmounts</td><td>Cleanup only</td><td>The socket closes; no messages arrive for a component that is gone</td></tr>
</tbody>
</table></div>
<p>
  The <code>setPrice(null)</code> at the start of the effect is a deliberate exception to the "no setState in effects"
  advice: it resets the display while a new external connection is being made, which is synchronisation with that
  connection, not a derived value. If the whole component should reset on a new symbol, a <code>key</code> on it from
  the parent does the same job more cleanly.
</p>

<h3>Pitfalls</h3>
<ul>
  <li><b>Reading state in an interval with an empty dependency array</b>: a stale closure.</li>
  <li><b>Deleting a dependency to stop a loop</b>: the effect silently uses old values.</li>
  <li><b>Objects and functions created in render as dependencies</b>: the effect runs after every render.</li>
  <li><b>Derived values in state, set by an effect</b>: extra renders and a frame of stale UI.</li>
  <li><b>Chains of effects</b> that each set state for the next.</li>
  <li><b>Event logic in effects</b> keyed on a flag: double posts and replays after remounts.</li>
  <li><b>Calling an Effect Event during render</b> or passing it to a child.</li>
  <li><b>Skipping the second Strict Mode run with a ref</b> instead of writing a cleanup.</li>
  <li><b>Unguarded state updates during render</b>: an infinite render loop.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>"The counter goes to 1 and stops": a stale closure in an interval.</li>
  <li>"It reconnects whenever the theme changes": a value read on an event is a dependency; use an Effect Event.</li>
  <li>"The UI flashes the old value after a prop change": derived state set in an effect.</li>
  <li>"The request is sent twice in development": an effect without cleanup, or event logic in an effect.</li>
  <li>"Old search results replace new ones": a fetch race; abort in the cleanup.</li>
  <li>An effect whose body is only <code>setX(…)</code> from props: delete it and compute during render.</li>
</ul>

<h3>Interview questions</h3>
<p><b>1. What is a stale closure in React, and how do you fix one?</b></p>
<p>
  Each render's functions capture that render's props and state. An effect that does not re-run keeps calling functions
  from an old render, so it reads old values. Fixes, in order: use the updater form so the value is not read, add the
  value to the dependencies, read it through <code>useEffectEvent</code>, or, in older code, through a ref updated after
  each render.
</p>
<p class="sub">
  <i>Follow-up: why not just add every value to the dependencies?</i> Usually that is right. It is wrong when the effect
  only reads a value when an event fires; then re-running the effect (reconnecting, restarting a timer) for that value is
  unwanted work. That is the case <code>useEffectEvent</code> exists for.
</p>
<p><b>2. What does <code>useEffectEvent</code> do, and what are its limits?</b></p>
<p>
  It wraps a function so that, when called from an effect, it sees the latest props and state, and it is not a
  dependency. It lets an effect synchronise with some values while merely reading others. It may only be called from
  effects in the same component, throws if called during render, and should not be passed to children.
</p>
<p><b>3. Give three things people put in effects that should not be there.</b></p>
<p>
  Derived values, which should be computed during render; reactions to user events, which belong in the handler; and
  resetting state when a prop changes, which is a <code>key</code> or a guarded update during render. Notifying a parent
  is a fourth. Each costs extra renders, and the derived-value one commits a stale frame.
</p>
<p class="sub">
  <i>Follow-up: what is legitimately an effect?</i> Synchronising with something outside React: subscriptions, timers,
  sockets, non-React widgets, the document title, and data fetching when no library or framework loader is available.
</p>
<p><b>4. Why does Strict Mode run effects twice, and how do you respond?</b></p>
<p>
  It simulates an unmount and remount to expose effects without proper cleanup, because the same sequence happens in
  production. The response is to write a cleanup that undoes the setup, not to block the second run.
</p>
<p><b>5. A component's list flashes the previous results for one frame after the filter changes. What would you look for?</b></p>
<p>
  State that is derived from props or other state and set in an effect. The commit with the new filter happens first,
  still holding the old list, and the effect's update arrives one render later. Compute the list during render and the
  flash disappears, along with the extra render.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "The linter wants <code>options</code> in the dependency array, but adding it makes the effect loop. Should you
    disable the rule?" No. The loop means <code>options</code> is a new object each render. Depend on its primitive
    fields, create it inside the effect, memoise it at the source, or read it through an Effect Event if it should not
    trigger a re-run. Disabling the rule hides a bug that comes back as stale data.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "An effect synchronises a component with something outside React, and its dependency array lists what it stays in
    sync with. Most effect bugs are stale closures or deleted dependencies. I fix stale reads with the updater, an honest
    dependency, or <code>useEffectEvent</code> for values read only when an event fires. And I check whether the effect
    should exist at all: derived values go in render, user reactions in handlers, resets in a key. The compiler does not
    change that; it memoises values but cannot tell me an effect is unnecessary."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Trace a stale interval tick by tick and say what the screen shows.</li>
    <li>Fix it four ways and say when each fix is the right one.</li>
    <li>Use <code>useEffectEvent</code> so a chat does not reconnect when the theme changes.</li>
    <li>Remove an object dependency, a function dependency and a state dependency honestly.</li>
    <li>Split an effect that does two unrelated jobs.</li>
    <li>Replace a derived-state effect and a chain of effects with render-time code, and count the renders saved.</li>
    <li>Move event logic out of an effect and into its handler.</li>
    <li>Reset one piece of state on a prop change without an effect.</li>
    <li>Abort an outdated fetch in the cleanup and ignore the resulting <code>AbortError</code>.</li>
    <li>For every effect in a component you own, name the external system it synchronises with.</li>
  </ul>
</div>`,
};
