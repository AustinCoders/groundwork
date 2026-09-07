import type { Chapter } from "../types";

export const reactContext: Chapter = {
  id: "react-context",
  num: "I2",
  title: "Context API",
  short: "Context",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "A way to skip the middle layers — not a state manager, and not free.",
  body: `<h3>What it solves</h3>
<p>
  Some values are genuinely ambient: the theme, the signed-in user, the locale,
  a toast dispatcher. Threading them through six components that do not care is
  noise. Context lets a provider put a value into the tree and any descendant
  read it directly.
</p>
<pre><code>const ThemeContext = createContext("light");        <span class="c">// default if no provider</span>

function App() {
  const [theme, setTheme] = useState("light");
  return (
    &lt;ThemeContext value={theme}&gt;      <span class="c">// React 19: no .Provider needed</span>
      &lt;Page /&gt;
    &lt;/ThemeContext&gt;
  );
}

function DeepButton() {
  const theme = useContext(ThemeContext);           <span class="c">// no props threaded</span>
  return &lt;button className={theme}&gt;Save&lt;/button&gt;;
}</code></pre>
<p class="sub">
  Before React 19 the provider was <code>&lt;ThemeContext.Provider value={...}&gt;</code>.
  Both work in 19; the old form is what you will see in existing code.
</p>

<h3>The default is not a fallback</h3>
<p>
  <code>createContext(defaultValue)</code> is used only when a component reads
  the context with <b>no provider above it</b>. That is almost always a mistake
  rather than a feature, so make it loud:
</p>
<pre><code>const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside &lt;AuthProvider&gt;");
  return ctx;
}</code></pre>
<p>
  Exporting a hook rather than the context is worth doing anyway: it gives you
  one place to add the check, keeps the context object private, and means
  consumers never import <code>useContext</code> at all.
</p>

<h3>The performance trap</h3>
<div class="bx is-prim">
  <span class="ttl">Every consumer re-renders when the value changes</span>
  <p>
    Context does not do partial subscriptions. When the provider's
    <code>value</code> changes by <code>Object.is</code>, <b>every</b> component
    calling <code>useContext</code> for it re-renders &mdash; even if it only
    reads a field that did not change.
  </p>
</div>
<pre><code>&lt;AuthContext value={{ user, login, logout }}&gt;   <span class="c">// ✗ new object every render</span></code></pre>
<p>
  That object literal is a fresh reference on every render of the provider, so
  every consumer re-renders every time &mdash; including when the value is
  identical. Memoise it:
</p>
<pre><code>const value = useMemo(() =&gt; ({ user, login, logout }), [user, login, logout]);
&lt;AuthContext value={value}&gt;</code></pre>
<p>
  And keep <code>login</code>/<code>logout</code> stable too, with
  <code>useCallback</code> or by defining them outside &mdash; otherwise the memo
  is recomputed anyway.
</p>

<h3>Split by change frequency</h3>
<p>
  The most effective context optimisation is not memoisation, it is splitting.
  Values that change often and values that never change should not share a
  provider.
</p>
<pre><code>const StateContext = createContext(null);      <span class="c">// changes on every keystroke</span>
const DispatchContext = createContext(null);   <span class="c">// never changes</span>

&lt;StateContext value={state}&gt;
  &lt;DispatchContext value={dispatch}&gt;{children}&lt;/DispatchContext&gt;
&lt;/StateContext&gt;</code></pre>
<p>
  Now a component that only dispatches &mdash; a button, a form's submit &mdash;
  reads <code>DispatchContext</code> and never re-renders when the state moves.
  <code>dispatch</code> from <code>useReducer</code> is guaranteed stable, which
  makes this pairing particularly clean.
</p>

<h3>What context is not</h3>
<div class="table-scroll"><table>
<thead><tr><th>Belief</th><th>Reality</th></tr></thead>
<tbody>
<tr><td>"Context is a state manager"</td><td>It is a transport. It moves a value down the tree; you still need <code>useState</code> or <code>useReducer</code> to hold it.</td></tr>
<tr><td>"Context replaces Redux"</td><td>Only for values that rarely change. A real store gives selectors, middleware and devtools, and re-renders only what actually reads the changed slice.</td></tr>
<tr><td>"Context avoids prop drilling"</td><td>So does composition, with no re-render cost. Try passing the element as <code>children</code> first.</td></tr>
<tr><td>"One context for the app"</td><td>The fastest way to re-render everything on every change. Several small contexts beat one large one.</td></tr>
</tbody>
</table></div>

<h3>A provider that is worth writing</h3>
<pre><code>function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() =&gt; localStorage.getItem("theme") ?? "light");

  useEffect(() =&gt; {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = useMemo(
    () =&gt; ({ theme, toggle: () =&gt; setTheme((t) =&gt; (t === "light" ? "dark" : "light")) }),
    [theme]
  );

  return &lt;ThemeContext value={value}&gt;{children}&lt;/ThemeContext&gt;;
}</code></pre>
<p>
  The provider owns the state, the side effect and the API. Everything below
  gets <code>useTheme()</code> and knows nothing about storage or the DOM
  attribute &mdash; which is the point.
</p>

<h3>Nesting and overriding</h3>
<p>
  A consumer reads the <b>nearest</b> provider above it, so contexts can be
  overridden for a subtree. That is how a dark panel inside a light page works,
  and it is genuinely useful:
</p>
<pre><code>&lt;ThemeContext value="light"&gt;
  &lt;Page&gt;
    &lt;ThemeContext value="dark"&gt;
      &lt;Sidebar /&gt;      <span class="c">// reads "dark"</span>
    &lt;/ThemeContext&gt;
  &lt;/Page&gt;
&lt;/ThemeContext&gt;</code></pre>

<h3>When to use it</h3>
<ul>
  <li><b>Yes:</b> theme, locale, the current user, a design-system config, a dispatch function, anything read by many components and written rarely.</li>
  <li><b>No:</b> form values, a list being filtered, anything changing per keystroke &mdash; unless you have split the contexts carefully.</li>
  <li><b>Not yet:</b> a prop travelling two layers. That is not drilling, that is just props.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Context is a transport for values that many components need and few
    components change. Every consumer re-renders when the provider value changes
    by identity, so the object goes in a <code>useMemo</code> and contexts get
    split by how often they change — state in one, dispatch in another."
  </p>
</div>`,
};
