import type { Chapter } from "../types";

export const reactSyncExternalStore: Chapter = {
  id: "react-sync-external-store",
  num: "A9",
  title: "useSyncExternalStore",
  short: "External stores",
  levels: ["advanced"],
  prerequisites: ["react-custom-hooks", "react-effects-depth", "react-concurrent"],
  practice: ["ex-comp-media-query-hook", "ex-comp-use-key-held"],
  ready: true,
  subtitle: "The correct way to read state that lives outside React.",
  body: `<p>
  React owns the state you create with <code>useState</code> and <code>useReducer</code>: it decides when updates apply
  and guarantees every component in a render sees the same values. Data that lives anywhere else (a browser API, a store
  module, a third-party SDK) has none of those guarantees. <code>useSyncExternalStore</code> is the bridge. This chapter
  explains the problems with the effect-and-state approach it replaces, the three functions it takes and the rules each
  must follow, worked examples for browser APIs and a store, selectors, the URL and <code>localStorage</code> gaps,
  tearing, server rendering and hydration, and the costs. Behaviour quoted was checked against React 19.3.
</p>

<h3>The problem it exists for</h3>
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
  and resubscribe on every render: checked, an inline <code>subscribe</code> was
  called three times over three renders. It stayed correct (one listener at the
  end), but each render paid for a teardown and a new subscription.
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
    means "changed" every time, which means render again &mdash; forever.
    Checked: React logged "The result of getSnapshot should be cached to avoid an
    infinite loop" and then threw "Maximum update depth exceeded". Return primitives, or
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

<h3>Worked example: one store update, step by step</h3>
<p>
  Two components read the same cart store from the "Writing the store yourself" section below: <code>Count</code>
  selects <code>items.length</code> and <code>Names</code> selects <code>items</code>.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Step</th><th>What happens</th><th>Count renders?</th></tr></thead>
<tbody>
<tr><td>Mount</td><td>Each component calls <code>getSnapshot</code> during render, React remembers the result, and after commit it calls <code>subscribe</code> with a listener</td><td>once</td></tr>
<tr><td>An unrelated field changes</td><td>The store replaces its state object and calls every listener. React calls each component's <code>getSnapshot</code> again: <code>items.length</code> is still 0, and <code>items</code> is the same array</td><td>no (checked: 0 renders)</td></tr>
<tr><td>An item is added</td><td>Listeners fire; <code>items.length</code> is now 1 and <code>items</code> is a new array, so both snapshots differ and React schedules a render of both</td><td>once (checked)</td></tr>
<tr><td>Render</td><td>Both components read the new snapshot in the same render; the screen shows "1" and "pen" together</td><td>&ndash;</td></tr>
<tr><td>Unmount</td><td>React calls the unsubscribe function <code>subscribe</code> returned</td><td>&ndash;</td></tr>
</tbody>
</table></div>
<p>
  The second row is the reason the snapshot rules exist. Because the store replaces state immutably and keeps unchanged
  parts by reference, the comparison React does is a cheap <code>Object.is</code>, and components that select a part
  that did not change do not render at all. This is how state libraries avoid re-rendering every subscriber on every
  update.
</p>
<figure>
  <svg viewBox="0 0 760 220" class="dg" role="img" aria-label="The store calls the listener React registered. React calls getSnapshot for each subscribed component and compares the result with the previous snapshot using Object.is. Components whose snapshot changed render; the others are skipped.">
    <g class="rough">
      <rect class="box" x="20" y="80" width="160" height="60" rx="10" />
      <rect class="box" x="240" y="80" width="170" height="60" rx="10" />
      <rect class="boxg" x="470" y="20" width="270" height="60" rx="10" />
      <rect class="box" x="470" y="140" width="270" height="60" rx="10" />
      <path class="ln" d="M180 110 H234" marker-end="url(#arrow)" />
      <path class="ln" d="M410 100 L464 56" marker-end="url(#arrow)" />
      <path class="ln" d="M410 120 L464 166" marker-end="url(#arrow)" />
    </g>
    <text class="lbl" x="100" y="106" text-anchor="middle">store.set(…)</text>
    <text class="sm" x="100" y="126" text-anchor="middle">calls listeners</text>
    <text class="lbl" x="325" y="106" text-anchor="middle">getSnapshot()</text>
    <text class="sm" x="325" y="126" text-anchor="middle">Object.is vs last</text>
    <text class="lbl" x="605" y="46" text-anchor="middle">changed: render</text>
    <text class="sm" x="605" y="66" text-anchor="middle">all readers in one render</text>
    <text class="lbl" x="605" y="166" text-anchor="middle">same: skip</text>
    <text class="sm" x="605" y="186" text-anchor="middle">no render at all</text>
  </svg>
  <figcaption>
    The listener carries no data. React asks for the snapshot itself and decides, per component, whether anything
    changed.
  </figcaption>
</figure>

<h3>What React does with the three functions</h3>
<p>
  Knowing when each function is called explains every rule above.
</p>
<ul>
  <li><b>During render</b>, React calls <code>getSnapshot</code> and uses its result as the value. In development it calls it a second time and compares the two; that comparison is where the "should be cached" warning comes from.</li>
  <li><b>After commit</b>, React calls <code>subscribe</code> with its own listener, then reads the snapshot once more. If the store changed between render and subscription, a moment no listener was watching, React re-renders straight away, so a change in that gap is never lost.</li>
  <li><b>When the listener fires</b>, React calls <code>getSnapshot</code> and compares with <code>Object.is</code>. Different means a render; the same means nothing happens.</li>
  <li><b>If <code>subscribe</code> is a different function</b> on a later render, React calls the old unsubscribe and subscribes again. That is the cost of an inline <code>subscribe</code>, and the mechanism a prop-dependent subscription relies on.</li>
  <li><b>On unmount</b>, React calls the unsubscribe function.</li>
</ul>
<p>
  The listener React passes you takes no arguments and expects none. Calling it too often is harmless, because the
  snapshot comparison filters out non-changes. Calling it too rarely is the real bug: a store that forgets to notify
  after some kind of write leaves its readers stale until something else causes a render.
</p>

<h3>Worked example: window size</h3>
<p>
  A <code>useWindowSize</code> hook that returns <code>{ width, height }</code> is a classic first attempt, and it loops:
</p>
<pre><code><span class="c">// ✗ a new object every call</span>
useSyncExternalStore(subscribe, () =&gt; ({ width: innerWidth, height: innerHeight }));</code></pre>
<p>
  The snapshot has to be a stable reference that only changes when the size does. Build it in the subscription, not in
  <code>getSnapshot</code>:
</p>
<pre><code>let size = { width: 1024, height: 768 };
const listeners = new Set();

function onResize() {
  if (size.width === innerWidth &amp;&amp; size.height === innerHeight) return;
  size = { width: innerWidth, height: innerHeight };
  listeners.forEach((l) =&gt; l());
}

function subscribe(listener) {
  if (listeners.size === 0) {
    size = { width: innerWidth, height: innerHeight };
    window.addEventListener("resize", onResize);
  }
  listeners.add(listener);
  return () =&gt; {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("resize", onResize);
  };
}

const serverSize = { width: 1024, height: 768 };

export function useWindowSize() {
  return useSyncExternalStore(subscribe, () =&gt; size, () =&gt; serverSize);
}</code></pre>
<p>
  Three details make it correct. The object is replaced only when a dimension actually changes, so
  <code>getSnapshot</code> returns the same reference between resizes. One window listener is shared by every component
  that uses the hook, added when the first subscribes and removed when the last leaves. And the server snapshot is a
  constant object, the same reference every call. Often the better design is to not return an object at all:
  <code>useWindowWidth()</code> returning a number needs none of this, and most components only care about one
  dimension, or really about a breakpoint, which <code>useMediaQuery</code> answers without re-rendering on every pixel.
</p>

<h3>High-frequency sources</h3>
<p>
  Scroll position, pointer position and resize fire many times per frame. Notifying React for each event is wasted work,
  because the browser will only paint once per frame. Throttle inside the store with
  <code>requestAnimationFrame</code>: on an event, schedule one frame callback if none is pending, and read the value and
  notify in that callback. Better still, snapshot the coarse thing the UI needs. A header that changes style after 80
  pixels of scroll needs a boolean <code>scrolledPastHeader</code>, which changes twice in a session, not a number that
  changes thousands of times.
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

<h3>Selectors that return objects</h3>
<p>
  The cart's selector worked because it returned a number. Sooner or later you need a selector that builds something:
  the items in a category, a total and a count together. Returning a new array or object from the selector loops, as
  the stable-snapshot rule predicts; checked, a selector using <code>filter</code> threw "Maximum update depth
  exceeded". There are three fixes.
</p>
<pre><code><span class="c">// 1. select the stable parts, derive in render</span>
const items = useCart((s) =&gt; s.items);
const books = useMemo(() =&gt; items.filter((i) =&gt; i.type === "book"), [items]);

<span class="c">// 2. call the hook twice, once per primitive</span>
const total = useCart((s) =&gt; s.total);
const count = useCart((s) =&gt; s.items.length);

<span class="c">// 3. memoise the selector on its input</span>
function memoSelector(select) {
  let lastInput, lastOutput;
  return (state) =&gt; {
    if (state.items !== lastInput) {
      lastInput = state.items;
      lastOutput = select(state.items);
    }
    return lastOutput;
  };
}
const selectBooks = memoSelector((items) =&gt; items.filter((i) =&gt; i.type === "book"));</code></pre>
<p>
  The first is usually the clearest: the store hands out a reference that only changes when items change, and the
  derived array is cached in the component. The third is what libraries automate, with
  <code>useSyncExternalStoreWithSelector</code> from the <code>use-sync-external-store</code> package adding an
  equality function on top, so a selector can return a new object that is compared by contents.
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

<h3>Wrapping a third-party SDK</h3>
<p>
  Many SDKs expose state through a callback API: an auth client with <code>onAuthChange(callback)</code> and
  <code>currentUser()</code>, a player with <code>on("timeupdate")</code>, a feature-flag client with
  <code>onChange</code>. They map onto the hook directly, with one thing to check: whether the SDK returns the same
  object when nothing changed.
</p>
<pre><code>let cachedUser = null;
let cachedKey = "";

function getUserSnapshot() {
  const user = auth.currentUser();
  const key = user ? user.id + ":" + user.updatedAt : "";
  if (key !== cachedKey) {
    cachedKey = key;
    cachedUser = user ? { id: user.id, name: user.name, email: user.email } : null;
  }
  return cachedUser;
}

function subscribeToAuth(listener) {
  return auth.onAuthChange(listener);
}

export function useCurrentUser() {
  return useSyncExternalStore(subscribeToAuth, getUserSnapshot, () =&gt; null);
}</code></pre>
<p>
  If <code>currentUser()</code> builds a fresh object each call, which many SDKs do, passing it straight through would
  loop. The adapter caches a plain copy keyed by something that changes when the user does, which also keeps the SDK's
  internal object, with its methods and mutable fields, out of your components. Check the SDK's unsubscribe convention:
  some return a function, some need <code>off(event, callback)</code>; <code>subscribe</code> must return a function
  either way.
</p>

<h3>This hook, context or React state?</h3>
<div class="table-scroll"><table>
<thead><tr><th>The data…</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Is created and changed only by React components</td><td><code>useState</code> or <code>useReducer</code>, lifted as needed</td></tr>
<tr><td>Belongs to a subtree and changes rarely (theme, current user, locale)</td><td>Context, often holding React state</td></tr>
<tr><td>Comes from the browser or an SDK and changes on its own</td><td><code>useSyncExternalStore</code></td></tr>
<tr><td>Is app-wide, changes often, and many components select small parts of it</td><td>A store library, which uses this hook internally</td></tr>
<tr><td>Is fetched from a server</td><td>A query cache or the framework's data layer</td></tr>
</tbody>
</table></div>
<p>
  The fourth row is where context struggles: every consumer re-renders whenever the context value changes, with no way
  to select a slice. A store with selectors re-renders only the components whose slice changed, which is the main reason
  to reach for one. If a context is updating many times a second and many components read it, moving that state into a
  store is often the fix.
</p>

<h3>Page visibility, and pausing work</h3>
<pre><code>function subscribeVisibility(listener) {
  document.addEventListener("visibilitychange", listener);
  return () =&gt; document.removeEventListener("visibilitychange", listener);
}

export function usePageVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () =&gt; document.visibilityState === "visible",
    () =&gt; true
  );
}

function LiveTicker() {
  const visible = usePageVisible();
  useEffect(() =&gt; {
    if (!visible) return;
    const id = setInterval(refresh, 5000);
    return () =&gt; clearInterval(id);
  }, [visible]);
  <span class="c">// …</span>
}</code></pre>
<p>
  This pairing shows the division of labour well. The external store hook reads a browser value correctly; the effect,
  which depends on that value, synchronises a timer with it. When the tab is hidden the effect's cleanup stops polling,
  and when it returns the effect starts again. Each hook does the one job it is designed for.
</p>

<h3>Migrating an effect-based hook</h3>
<p>
  Converting an existing <code>useState</code> plus <code>useEffect</code> subscription is mechanical, and a good
  exercise in reading what the old code really did.
</p>
<ol>
  <li>The event listeners added in the effect become the body of <code>subscribe</code>, which receives React's listener instead of calling <code>setState</code>.</li>
  <li>The expression used for the initial state and inside the handlers becomes <code>getSnapshot</code>. If the handlers computed something different from the initial read, that difference was a bug; pick one.</li>
  <li>Whatever the old code did to guard against the server (<code>typeof window</code> checks) becomes <code>getServerSnapshot</code>.</li>
  <li>Delete the state and the effect. Check that the snapshot is a primitive or a cached reference.</li>
</ol>
<p>
  Run the old and new versions side by side in a test that changes the source between render and subscription; the old
  one misses the change and the new one does not. If the codebase still supports React 17, the
  <code>use-sync-external-store/shim</code> package provides the same API there.
</p>

<h4>A complete version</h4>
<pre><code>const keyListeners = new Map();

function notify(key) {
  (keyListeners.get(key) ?? []).forEach((l) =&gt; l());
}

window.addEventListener("storage", (event) =&gt; {
  if (event.key) notify(event.key);
});

function subscribeKey(key, listener) {
  if (!keyListeners.has(key)) keyListeners.set(key, new Set());
  keyListeners.get(key).add(listener);
  return () =&gt; keyListeners.get(key).delete(listener);
}

export function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  notify(key);
}

export function useStored(key, fallback) {
  const subscribe = useCallback((l) =&gt; subscribeKey(key, l), [key]);
  const raw = useSyncExternalStore(subscribe, () =&gt; localStorage.getItem(key), () =&gt; null);
  return useMemo(() =&gt; {
    try {
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }, [raw, fallback]);
}</code></pre>
<p>
  The snapshot is the raw string, which is stable by value; parsing happens in render behind <code>useMemo</code>, so
  components get a stable object until the string changes. Writes in this tab notify through <code>notify</code>, writes
  in other tabs through the <code>storage</code> event, and listeners are kept per key, so a write to one key does not
  even ask components reading another key to compare. Unlike the <code>useLocalStorage</code> hook in
  <a href="/react/react-custom-hooks">custom hooks</a>, every component reading a key sees the same value. Pass a constant <code>fallback</code>, such as a module-level
  object; an inline one is a new dependency every render and defeats the memo.
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
    the real value. Checked with a width store whose server snapshot was 1024
    and client snapshot 1200: the server HTML said 1024, hydration rendered 1024
    and then 1200. A width or theme that differs on the client will visibly
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
  A useful test before writing one: does the value change on its own, without any
  React component asking it to? If yes, it is external, and this hook is the right
  tool. If it only changes because components call a setter, React state or a
  store library is simpler.
</p>
<p>
  Not for data you fetch &mdash; that is a
  <a href="/react/react-server-state">query cache</a> &mdash; and not for state
  React already owns.
</p>

<h3>Testing a store-backed hook</h3>
<p>
  Because the store is a plain module, tests can drive it directly: render a component that uses the hook, change the
  store inside <code>act</code>, and assert on the screen. Reset the store between tests, since module state survives
  from one test to the next, which is the usual cause of tests that pass alone and fail together. For browser APIs, stub
  the API (<code>window.matchMedia</code> returning an object whose <code>addEventListener</code> records the callback),
  then call the recorded callback inside <code>act</code> after changing what the stub returns.
</p>

<h3>Pitfalls</h3>
<ul>
  <li><b><code>getSnapshot</code> returning a new object or array</b>: an infinite render loop.</li>
  <li><b>An inline <code>subscribe</code></b>: a teardown and resubscription on every render.</li>
  <li><b>Mutating store state</b> instead of replacing it: the snapshot is the same reference and nothing re-renders.</li>
  <li><b>No server snapshot</b> in a server-rendered app: rendering throws on the server.</li>
  <li><b>A server snapshot that rarely matches the client</b>: a visible change after every hydration.</li>
  <li><b>Listening only for <code>popstate</code></b> or only for <code>storage</code>: your own writes are missed.</li>
  <li><b>Parsing JSON inside <code>getSnapshot</code></b>: a new object every call; cache by the raw string.</li>
  <li><b>Using it for fetched data</b> instead of a query cache, or for state React could own.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>"Two widgets show different values from the same store for a moment": tearing from effect-and-state copying.</li>
  <li>"Maximum update depth exceeded" from a store hook: an unstable snapshot or selector.</li>
  <li>"The layout jumps right after the page loads": the server snapshot differs from the client.</li>
  <li>"The hook updates on back and forward but not on our own links": <code>pushState</code> fires no event.</li>
  <li>"Every component re-renders on every store update": selectors returning new objects, or a store that mutates.</li>
</ul>

<h3>Interview questions</h3>
<p><b>1. What does <code>useSyncExternalStore</code> do, and why not use an effect?</b></p>
<p>
  It subscribes a component to a source outside React and reads a snapshot during render. An effect that copies the
  value into state renders once with a stale value, needs guarding on the server, and can tear under concurrent
  rendering, when components read different values of the same store in one render. The hook reads consistently and
  supplies a server snapshot.
</p>
<p class="sub">
  <i>Follow-up: what is tearing?</i> A visible inconsistency: during an interruptible render the store changes, so
  components rendered before and after the change show different versions in one committed screen.
</p>
<p><b>2. What are the rules for its three arguments?</b></p>
<p>
  <code>subscribe</code> registers a callback, returns an unsubscribe, and should be stable. <code>getSnapshot</code>
  returns the current value and must return the same reference when nothing changed. <code>getServerSnapshot</code>
  provides the value for server rendering and for hydration, so it must match what the server rendered.
</p>
<p><b>3. Write a minimal store usable with it.</b></p>
<p>
  A closure holding state, a set of listeners, <code>getState</code>, <code>subscribe</code> returning a remover, and
  <code>setState</code> that replaces the state and calls the listeners. Components call the hook with the store's
  <code>subscribe</code> and a selector over <code>getState()</code> that returns stable values.
</p>
<p><b>4. How do you select a derived array without an infinite loop?</b></p>
<p>
  Select the stable source array and derive with <code>useMemo</code> in the component, select primitives separately,
  or memoise the selector on its input. Libraries provide a selector variant with an equality function.
</p>
<p><b>5. What happens to a store update inside <code>startTransition</code>?</b></p>
<p>
  It is not treated as a transition. React re-checks the snapshot before committing a concurrent render, and if the
  store changed it renders again synchronously so every component sees one version. That is also why suspending on a
  store value replaces visible content with a fallback.
</p>
<p><b>6. Design a <code>useWindowSize</code> hook. What can go wrong?</b></p>
<p>
  Returning a new object from <code>getSnapshot</code> loops, so the object must be created in the resize handler and
  replaced only when a dimension changes. Share one window listener across all subscribers, provide a constant server
  snapshot, and throttle to animation frames. Then question the design: most callers need one number or a breakpoint,
  which are simpler and re-render far less.
</p>
<p><b>7. Two components use a <code>useLocalStorage</code> hook built on <code>useState</code> with the same key. One writes; the other does not update. Why, and what is the fix?</b></p>
<p>
  Each call has its own state, initialised from storage once, and nothing tells the second component about the write;
  the <code>storage</code> event only fires in other tabs. Make storage an external store: a per-key listener set that
  writes notify, plus the <code>storage</code> event for other tabs, read with <code>useSyncExternalStore</code> using
  the raw string as the snapshot. Then every reader of the key sees each write, in this tab and in others.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "Is <code>getSnapshot: () =&gt; JSON.parse(localStorage.getItem(key))</code> fine?" No. It returns a new object on
    every call, so React sees a change every time and loops. Read the raw string as the snapshot, which compares by
    value, and parse it in render with <code>useMemo</code>, or cache the parsed object keyed by the raw string.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "It is the supported way to read state that lives outside React. It exists because copying external values into
    state with an effect can tear under concurrent rendering and lags a render behind. React calls my
    <code>getSnapshot</code> during render and compares with <code>Object.is</code>, so it must return a stable
    reference; <code>subscribe</code> should be stable; and the server snapshot is what hydration renders first. State
    libraries are built on it, which is why I mostly use it to wrap browser APIs."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Replace an effect-and-state online-status hook with <code>useSyncExternalStore</code>, including the server snapshot.</li>
    <li>Explain the infinite loop from an unstable snapshot, and fix it three ways.</li>
    <li>Write a store and a selector hook, and trace which components render for an unrelated and a related update.</li>
    <li>Write <code>useMediaQuery</code> with a subscription that depends on its argument.</li>
    <li>Close the <code>pushState</code> and <code>storage</code> event gaps.</li>
    <li>Write a <code>localStorage</code> store that notifies readers in this tab and in other tabs, per key.</li>
    <li>Describe tearing and how the hook prevents it, and why React re-reads the snapshot after subscribing.</li>
    <li>Throttle a scroll-based store to animation frames and snapshot a boolean instead of a number.</li>
    <li>Predict what hydration renders when server and client snapshots differ.</li>
    <li>Wrap an SDK whose getter returns a new object each call, without looping.</li>
    <li>Migrate an effect-based subscription hook in four steps.</li>
  </ul>
</div>`,
};
