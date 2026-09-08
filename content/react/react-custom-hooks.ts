import type { Chapter } from "../types";

export const reactCustomHooks: Chapter = {
  id: "react-custom-hooks",
  num: "I4",
  title: "Custom hooks",
  short: "Custom hooks",
  levels: ["intermediate"],
  practice: ["ex-react-safe-parse", "ex-react-paginate"],
  ready: true,
  subtitle: "Sharing stateful logic between components — not sharing the state itself.",
  body: `<h3>A custom hook is just a function</h3>
<p>
  There is no API for this. A custom hook is a function whose name starts with
  <code>use</code> and which calls other hooks. That naming is not decoration:
  it is how the linter knows to apply the rules of hooks to it.
</p>
<pre><code>function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() =&gt; setOn((v) =&gt; !v), []);
  return [on, toggle];
}

const [isOpen, toggleOpen] = useToggle();</code></pre>

<div class="bx is-prim">
  <span class="ttl">Each call gets its own state</span>
  <p>
    Two components calling <code>useToggle()</code> do not share a value. A
    custom hook shares <b>logic</b>, never state &mdash; the hooks inside run
    against whichever component is calling. If you want shared state, that is
    <a href="/react/react-context">context</a> or a store.
  </p>
</div>

<h3>What to return</h3>
<pre><code>return [value, setValue];              <span class="c">// tuple — when the caller renames both</span>
return { data, error, isLoading };     <span class="c">// object — when there are several, or optional</span></code></pre>
<p>
  Tuples for two values that callers will rename, the way
  <code>useState</code> does. Objects once there are three or more, so the
  caller destructures only what it needs and adding a field later is not a
  breaking change.
</p>

<h3>Three that earn their keep</h3>

<h4>Reading and writing localStorage</h4>
<pre><code>function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() =&gt; {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;                    <span class="c">// private mode, quota, bad JSON</span>
    }
  });

  useEffect(() =&gt; {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}</code></pre>
<p class="sub">
  Both accesses are wrapped. <code>localStorage</code> throws in private
  browsing on some browsers, when the quota is full, and when a page has storage
  blocked &mdash; an unguarded read takes the whole component down.
</p>

<h4>A media query</h4>
<pre><code>function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =&gt; window.matchMedia(query).matches);

  useEffect(() =&gt; {
    const mql = window.matchMedia(query);
    const onChange = (e) =&gt; setMatches(e.matches);
    setMatches(mql.matches);                  <span class="c">// in case it changed before subscribing</span>
    mql.addEventListener("change", onChange);
    return () =&gt; mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}</code></pre>
<p class="sub">
  In a server-rendered app the lazy initialiser would crash &mdash; there is no
  <code>window</code>. That case is what
  <a href="/react/react-sync-external-store">useSyncExternalStore</a> exists
  for; it takes a separate server snapshot.
</p>

<h4>Debouncing a value</h4>
<pre><code>function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() =&gt; {
    const id = setTimeout(() =&gt; setDebounced(value), delay);
    return () =&gt; clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

const query = useDebounced(input);   <span class="c">// fetch on this, render on input</span></code></pre>

<h3>Extracting one from a component</h3>
<p>
  The signal is not length. It is <b>a group of hooks that always move
  together</b> and that another component would want whole.
</p>
<pre><code><span class="c">// before: this block appears in three components</span>
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
useEffect(() =&gt; { ... }, [userId]);

<span class="c">// after</span>
const { user, loading, error } = useUser(userId);</code></pre>
<p>
  The test for a good extraction: the component that uses it reads better, and
  the hook makes sense with a name that does not mention the component it came
  from. <code>useDashboardTopSection</code> is a function you moved; 
  <code>useUser</code> is an abstraction.
</p>

<h3>Composing hooks</h3>
<pre><code>function useSearch(endpoint) {
  const [input, setInput] = useState("");
  const query = useDebounced(input, 300);        <span class="c">// hooks calling hooks</span>
  const { data, loading } = useFetch(endpoint + "?q=" + query);
  return { input, setInput, results: data ?? [], loading };
}</code></pre>
<p>
  This is where custom hooks pay off. Each piece is testable and replaceable on
  its own, and the composition reads like a description of the feature.
</p>

<h3>useDebugValue</h3>
<pre><code>function useOnlineStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot);
  useDebugValue(isOnline ? "Online" : "Offline");   <span class="c">// label in DevTools</span>
  return isOnline;
}</code></pre>
<p>
  Purely a development affordance: React DevTools shows
  <code>OnlineStatus: "Online"</code> next to the hook instead of a bare
  <code>true</code>. It is stripped from production builds.
</p>
<p class="sub">
  Worth it for a hook used across a codebase or shipped in a library, where
  somebody debugging will meet it without having read it. Not worth it for a
  hook used in one component. If formatting the value is expensive, pass a
  function as the second argument &mdash; it only runs when DevTools is open.
</p>

<h3>Mistakes worth avoiding</h3>
<div class="table-scroll"><table>
<thead><tr><th>Mistake</th><th>Why it hurts</th></tr></thead>
<tbody>
<tr><td>Calling a hook conditionally inside your hook</td><td>Same rule, same corruption &mdash; call order must be stable</td></tr>
<tr><td>A hook that takes ten options and does five jobs</td><td>Nobody can use half of it. Split it.</td></tr>
<tr><td>Returning a new object without memoising</td><td>Callers putting it in a dependency array get an effect on every render</td></tr>
<tr><td>Naming it without <code>use</code></td><td>The lint rules stop applying, silently</td></tr>
<tr><td>Wrapping a single <code>useState</code></td><td><code>useName()</code> that returns <code>useState("")</code> adds a file and no meaning</td></tr>
</tbody>
</table></div>

<h3>The dependency question</h3>
<pre><code>function useFetch(url) {
  const [data, setData] = useState(null);
  useEffect(() =&gt; {
    let cancelled = false;
    fetch(url).then((r) =&gt; r.json()).then((d) =&gt; { if (!cancelled) setData(d); });
    return () =&gt; { cancelled = true; };
  }, [url]);                            <span class="c">// a string — safe to depend on</span>
  return data;
}</code></pre>
<p>
  Take primitives as arguments where you can. A hook whose parameter is an
  options object re-runs whenever the caller renders, because the caller almost
  certainly wrote the object inline &mdash; and now the fix lives in every call
  site instead of in the hook.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "A custom hook is a function starting with <code>use</code> that calls other
    hooks, and it shares logic rather than state — each caller gets its own.
    Extract one when a group of hooks always changes together and another
    component would want the whole group."
  </p>
</div>`,
};
