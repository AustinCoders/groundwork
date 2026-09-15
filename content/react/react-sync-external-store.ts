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
<p class="sub">
  There is a fourth, quieter one in that snippet: it never listens for
  <code>offline</code>, so once online it stays online. Copying external state
  into React state means writing every transition by hand.
</p>

<h3>The hook</h3>
<pre><code>const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);</code></pre>
<div class="table-scroll"><table>
<thead><tr><th>Argument</th><th>Must</th></tr></thead>
<tbody>
<tr><td><code>subscribe(cb)</code></td><td>Register <code>cb</code>, return an unsubscribe. Must be stable, or React resubscribes every render.</td></tr>
<tr><td><code>getSnapshot()</code></td><td>Return the current value. Must return a <b>cached reference</b> if nothing changed.</td></tr>
<tr><td><code>getServerSnapshot()</code></td><td>The value during SSR <b>and during hydration</b>. Omit it and server rendering throws.</td></tr>
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
<p>
  Notice what the callback does: nothing but tell React "something may have
  changed". React then calls <code>getSnapshot</code> itself and compares. The
  event's payload is irrelevant, which is why one callback can serve two events.
</p>

<div class="bx is-prim">
  <span class="ttl">getSnapshot must be referentially stable</span>
  <pre><code>() =&gt; ({ width: window.innerWidth })         <span class="c">// ✗ new object every call → infinite loop</span>
() =&gt; window.innerWidth                      <span class="c">// ✓ a primitive</span></code></pre>
  <p>
    React calls <code>getSnapshot</code> during render and compares the result
    with the last one using <code>Object.is</code>. A fresh object every time
    means "changed" every time, which means render again &mdash; forever. React
    warns "The result of getSnapshot should be cached". Return primitives, or
    cache the object and only replace it when the underlying data actually
    changes.
  </p>
</div>

<h3>A subscription that depends on a prop</h3>
<pre><code>function useMediaQuery(query) {
  const subscribe = useCallback((cb) =&gt; {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", cb);
    return () =&gt; mql.removeEventListener("change", cb);
  }, [query]);

  return useSyncExternalStore(
    subscribe,
    () =&gt; window.matchMedia(query).matches,   <span class="c">// a boolean — stable by nature</span>
    () =&gt; false
  );
}

const isWide = useMediaQuery("(min-width: 768px)");</code></pre>
<p>
  When the subscription genuinely depends on an argument, it cannot live at
  module scope. <code>useCallback</code> keeps it the same function until the
  query changes, and then React resubscribes exactly once, which is what you
  want.
</p>

<h3>Writing the store yourself</h3>
<pre><code>function createStore(initial) {
  let state = initial;
  const listeners = new Set();

  return {
    getState: () =&gt; state,
    setState(update) {
      state = typeof update === "function" ? update(state) : update;   <span class="c">// replace, never mutate</span>
      listeners.forEach((l) =&gt; l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () =&gt; listeners.delete(listener);
    },
  };
}

const cart = createStore({ items: [] });

function useCart(selector) {
  return useSyncExternalStore(cart.subscribe, () =&gt; selector(cart.getState()));
}

const count = useCart((s) =&gt; s.items.length);   <span class="c">// ✓ a number</span></code></pre>
<p>
  Twenty lines, and it is the core of every store library. Two properties make
  it correct: <code>setState</code> replaces the state object rather than
  editing it, so an unchanged state really is the same reference; and the
  selector returns something stable. A selector like
  <code>(s) =&gt; s.items.filter(...)</code> builds a new array every call and
  loops, which is why libraries add a memoised selector layer on top.
</p>

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
  write &mdash; exactly the store module above. <code>getItem</code> returns a
  string, which compares by value, so this snapshot is stable; parse it with
  <code>JSON.parse</code> inside <code>getSnapshot</code> and it no longer is.
</p>

<h3>The URL is an external store with a gap</h3>
<pre><code>function subscribe(cb) {
  window.addEventListener("popstate", cb);       <span class="c">// back and forward buttons only</span>
  window.addEventListener("app:navigate", cb);   <span class="c">// our own pushes</span>
  return () =&gt; {
    window.removeEventListener("popstate", cb);
    window.removeEventListener("app:navigate", cb);
  };
}

export function navigate(to) {
  history.pushState(null, "", to);
  window.dispatchEvent(new Event("app:navigate"));   <span class="c">// pushState fires nothing</span>
}

const pathname = useSyncExternalStore(subscribe, () =&gt; location.pathname, () =&gt; "/");</code></pre>
<p>
  <code>popstate</code> fires for back and forward, but not when your own code
  calls <code>history.pushState</code>. A hook that only listens to
  <code>popstate</code> works in every manual test that uses the back button and
  goes stale the first time the app navigates itself. Every external source has
  a gap like this &mdash; the <code>storage</code> event skipping the writing
  tab is the same bug &mdash; and the fix is always to route your own writes
  through something that notifies. This is a small version of what a router
  does for you.
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

<h3>The costs you accept</h3>
<ul>
  <li>
    <b>Store updates are never transitions.</b> For a transition, React checks
    <code>getSnapshot</code> once more just before committing. If the store
    changed in the meantime, React throws the work away and renders again as a
    blocking update, so every component shows the same version.
  </li>
  <li>
    <b>Do not suspend on a store value.</b> Because a store change cannot be a
    transition, suspending on it replaces content already on screen with the
    nearest fallback.
  </li>
  <li>
    <b>Hydration uses the server snapshot.</b> The first client render must match
    the HTML, so it reads <code>getServerSnapshot</code>, then re-renders with
    the real value. A width or theme that differs on the client will visibly
    change after load; design the server value to be the common case.
  </li>
</ul>

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
    things that catch people are that <code>getSnapshot</code> must return a
    stable reference, <code>subscribe</code> must be stable, and the server
    snapshot is also what hydration renders."
  </p>
</div>`,
};
