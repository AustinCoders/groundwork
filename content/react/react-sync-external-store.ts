import type { Chapter } from "../types";

export const reactSyncExternalStore: Chapter = {
  id: "react-sync-external-store",
  num: "A9",
  title: "useSyncExternalStore",
  short: "External stores",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "The correct way to read state that lives outside React.",
  body: `<h3>The problem it exists for</h3>
<p>
  Plenty of state lives outside React: <code>localStorage</code>, the URL, a
  websocket, <code>window.matchMedia</code>, online status, a Redux store. The
  obvious approach is an effect that subscribes and copies the value into
  <code>useState</code>.
</p>
<pre><code>const [online, setOnline] = useState(navigator.onLine);
useEffect(() =&gt; {
  const on = () =&gt; setOnline(true);
  window.addEventListener("online", on);
  return () =&gt; window.removeEventListener("online", on);
}, []);</code></pre>
<p>Three problems with that, and the third only appears under concurrency.</p>
<ol>
  <li>Between render and the effect running, the value may already be wrong.</li>
  <li>On the server there is no <code>navigator</code>, so the initial read crashes or has to be guarded.</li>
  <li><b>Tearing:</b> during an interruptible render, the external value can change mid-render, so two components read different values and the screen shows an inconsistent mix.</li>
</ol>

<h3>The hook</h3>
<pre><code>const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);</code></pre>
<div class="table-scroll"><table>
<thead><tr><th>Argument</th><th>Must</th></tr></thead>
<tbody>
<tr><td><code>subscribe(cb)</code></td><td>Register <code>cb</code>, return an unsubscribe. Must be stable, or React resubscribes every render.</td></tr>
<tr><td><code>getSnapshot()</code></td><td>Return the current value. Must return a <b>cached reference</b> if nothing changed.</td></tr>
<tr><td><code>getServerSnapshot()</code></td><td>The value during SSR. Omit it and server rendering throws.</td></tr>
</tbody>
</table></div>

<h3>Online status, correctly</h3>
<pre><code>function subscribe(callback) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () =&gt; {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () =&gt; navigator.onLine,      <span class="c">// client</span>
    () =&gt; true                    <span class="c">// server: assume online</span>
  );
}</code></pre>
<p>
  <code>subscribe</code> is defined at module scope, so it is the same function
  on every render. Defining it inside the component would make React unsubscribe
  and resubscribe constantly.
</p>

<div class="bx is-prim">
  <span class="ttl">getSnapshot must be referentially stable</span>
  <pre><code>() =&gt; ({ width: window.innerWidth })         <span class="c">// ✗ new object every call → infinite loop</span>
() =&gt; window.innerWidth                      <span class="c">// ✓ a primitive</span></code></pre>
  <p>
    React calls <code>getSnapshot</code> during render and compares the result
    with the last one. A fresh object every time means "changed" every time,
    which means render again &mdash; forever. Return primitives, or cache the
    object and only replace it when the underlying data actually changes.
  </p>
</div>

<h3>localStorage across tabs</h3>
<pre><code>function subscribe(cb) {
  window.addEventListener("storage", cb);     <span class="c">// fires in *other* tabs</span>
  return () =&gt; window.removeEventListener("storage", cb);
}

function useStoredValue(key) {
  return useSyncExternalStore(
    subscribe,
    () =&gt; localStorage.getItem(key),
    () =&gt; null
  );
}</code></pre>
<p class="sub">
  The <code>storage</code> event does not fire in the tab that wrote the value,
  so a complete implementation keeps its own subscriber list and notifies it on
  write. That is exactly what a small store module looks like.
</p>

<h3>What tearing actually looks like</h3>
<p>
  React renders a list of prices at low priority. Halfway through, a websocket
  updates the store. With the effect-and-state approach, components rendered
  before the update show the old price and components after it show the new one
  &mdash; one screen, two versions of the truth. <code>useSyncExternalStore</code>
  detects the change and re-renders from a consistent snapshot.
</p>
<p>
  This is not theoretical: it is why every state library moved to this hook when
  React 18 shipped. Redux, Zustand and Jotai all use it internally &mdash; which
  is the main reason you rarely call it yourself.
</p>

<h3>When to reach for it</h3>
<ul>
  <li>Wrapping a browser API &mdash; media queries, online status, scroll position, <code>document.visibilityState</code>.</li>
  <li>Integrating a non-React store: a legacy event emitter, a third-party SDK.</li>
  <li>Writing a state library.</li>
</ul>
<p>
  Not for data you fetch &mdash; that is a
  <a href="/react/react-server-state">query cache</a> &mdash; and not for state
  React already owns.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "It is the supported way to subscribe to state outside React, and it exists
    because the effect-and-state pattern can tear under concurrent rendering —
    two components reading different values of the same store in one render. The
    two things that catch people are that <code>getSnapshot</code> must return a
    stable reference, and that omitting the server snapshot breaks SSR."
  </p>
</div>`,
};
