import type { Chapter } from "../types";

export const reactEffectsDepth: Chapter = {
  id: "react-effects-depth",
  num: "I5",
  title: "Effects in depth",
  short: "Effects in depth",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Stale closures, the dependency array as a contract, and the effects that should not exist.",
  body: `<h3>The stale closure</h3>
<p>
  The single most common effect bug, and once you see the mechanism you can spot
  it anywhere.
</p>
<pre><code>useEffect(() =&gt; {
  const id = setInterval(() =&gt; {
    setCount(count + 1);        <span class="c">// count is frozen at 0, forever</span>
  }, 1000);
  return () =&gt; clearInterval(id);
}, []);                          <span class="c">// runs once — captures the first render</span></code></pre>
<p>
  The effect ran during the first render, so the arrow inside it closed over
  <em>that render's</em> <code>count</code> &mdash; zero. It never re-runs, so it
  never sees another one. The counter goes 0, 1, 1, 1, 1.
</p>
<p>Three fixes, in order of preference:</p>
<pre><code><span class="c">// 1. don't read it at all — the updater form gets the latest value</span>
setCount((c) =&gt; c + 1);

<span class="c">// 2. depend on it, and accept the interval restarting</span>
}, [count]);

<span class="c">// 3. a ref, when restarting is unacceptable</span>
const latest = useRef(count);
useEffect(() =&gt; { latest.current = count; });</code></pre>

<h3>The dependency array is a contract, not a lint rule</h3>
<p>
  It says: <em>this effect stays in sync with these values.</em> Removing a
  dependency to stop an effect re-running does not fix anything &mdash; it
  freezes the effect on an old value and turns a visible loop into a silent
  wrong answer.
</p>
<div class="bx is-prim">
  <span class="ttl">If satisfying the linter breaks the effect</span>
  <p>
    The effect is modelling the wrong thing. Something in it is not
    synchronisation &mdash; it is a reaction to an event, or a derived value, or
    an initialisation that should happen once elsewhere. Fix the shape rather
    than silencing the rule.
  </p>
</div>

<h3>Removing dependencies honestly</h3>
<pre><code><span class="c">// object dependency → depend on the field</span>
}, [user]);            &rarr;   }, [user.id]);

<span class="c">// function dependency → move it inside the effect</span>
useEffect(() =&gt; {
  function connect() { ... }        <span class="c">// now nothing external to depend on</span>
  connect();
}, [roomId]);

<span class="c">// or hoist it out of the component entirely</span>
function makeUrl(id) { ... }        <span class="c">// module scope: never changes</span></code></pre>
<p>
  Each of these removes a dependency by making it genuinely unnecessary, rather
  than by lying about it.
</p>

<h3>One effect per concern</h3>
<pre><code><span class="c">// ✗ two unrelated jobs, one dependency list</span>
useEffect(() =&gt; {
  document.title = title;
  const id = setInterval(poll, 5000);
  return () =&gt; clearInterval(id);
}, [title]);                        <span class="c">// the interval restarts when the title changes</span>

<span class="c">// ✓</span>
useEffect(() =&gt; { document.title = title; }, [title]);
useEffect(() =&gt; {
  const id = setInterval(poll, 5000);
  return () =&gt; clearInterval(id);
}, []);</code></pre>
<p>
  Effects are cheap. Splitting them is almost always right, because each one
  then has the dependency list it actually needs.
</p>

<h3>The taxonomy: what is really an effect</h3>
<div class="table-scroll"><table>
<thead><tr><th>You want to…</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Compute something from props or state</td><td>Nothing &mdash; calculate it during render</td></tr>
<tr><td>React to a click, submit or keypress</td><td>The event handler</td></tr>
<tr><td>Reset state when a prop changes</td><td>A <code>key</code> on the component</td></tr>
<tr><td>Adjust some state when a prop changes</td><td>Set it during render, guarded by a comparison</td></tr>
<tr><td>Cache an expensive calculation</td><td><code>useMemo</code></td></tr>
<tr><td>Subscribe to an external store</td><td><code>useSyncExternalStore</code></td></tr>
<tr><td>Fetch data</td><td>A data library, or the framework's loader</td></tr>
<tr><td>Connect to a socket, a timer, a browser API</td><td><span class="chip tone-yes">an effect</span></td></tr>
<tr><td>Measure the DOM and adjust before paint</td><td><code>useLayoutEffect</code></td></tr>
</tbody>
</table></div>
<p>
  Two rows on that list are effects. That ratio is roughly right for real
  codebases too.
</p>

<h3>Adjusting state during render</h3>
<p>
  The unusual one from that table. When some state must change because a prop
  changed, an effect renders once with the wrong value first. React supports
  setting state during render instead:
</p>
<pre><code>function List({ items }) {
  const [selection, setSelection] = useState(null);
  const [prevItems, setPrevItems] = useState(items);

  if (items !== prevItems) {          <span class="c">// during render, guarded</span>
    setPrevItems(items);
    setSelection(null);
  }
  ...
}</code></pre>
<p>
  React sees the state change before it commits, discards the in-progress output
  and re-runs the component immediately &mdash; nothing is painted with the stale
  value. The guard is essential; without it this is an infinite loop.
</p>
<p class="sub">
  Prefer a <code>key</code> when you want to reset <em>everything</em>. This is
  for resetting one field while keeping the rest.
</p>

<h3>Race conditions, properly</h3>
<pre><code>useEffect(() =&gt; {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then((r) =&gt; r.json())
    .then(setData)
    .catch((err) =&gt; {
      if (err.name !== "AbortError") setError(err);   <span class="c">// ignore our own cancel</span>
    });

  return () =&gt; controller.abort();
}, [url]);</code></pre>
<p>
  <code>AbortController</code> beats the <code>cancelled</code> flag because it
  also stops the request in flight, freeing the connection. Both fix the same
  bug: an older response arriving after a newer one and overwriting it.
</p>

<h3>Effects and Strict Mode</h3>
<p>
  In development React mounts, unmounts and remounts every component once. An
  effect that is not idempotent shows up immediately: two websocket connections,
  two subscriptions, a doubled analytics event. The fix is always the cleanup,
  and the same bug would appear in production the first time a user navigated
  away and back.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Most effect bugs are one of two things: a stale closure, because the effect
    captured a render it never re-ran for, or a dependency someone deleted to
    stop it looping. The array is a statement about what the effect stays in
    sync with — and the deeper skill is recognising that derived values, event
    reactions and prop-driven resets are not effects at all."
  </p>
</div>`,
};
