import type { Chapter } from "../types";

export const reactMemoisation: Chapter = {
  id: "react-memoisation",
  num: "I8",
  title: "Memoisation",
  short: "Memoisation",
  levels: ["intermediate"],
  practice: ["ex-react-shallow-equal", "ex-react-memoize"],
  ready: true,
  subtitle: "memo, useMemo and useCallback are a cache — and a cache you did not measure is a cost.",
  body: `<h3>What actually happens on a re-render</h3>
<p>
  When a component re-renders, React re-renders <b>all of its children</b> by
  default, regardless of whether their props changed. That sounds alarming and
  usually is not: rendering is running a function and comparing objects, which
  is fast. The DOM is only touched where the output differs.
</p>
<p>
  Memoisation is for the cases where that assumption breaks &mdash; a genuinely
  expensive calculation, or a large subtree re-rendering on every keystroke.
</p>

<h3>The three tools</h3>
<div class="table-scroll"><table>
<thead><tr><th>Tool</th><th>Caches</th><th>Skips</th></tr></thead>
<tbody>
<tr><td><code>useMemo(fn, deps)</code></td><td>A computed <b>value</b></td><td>Recomputing it</td></tr>
<tr><td><code>useCallback(fn, deps)</code></td><td>A <b>function</b> identity</td><td>Recreating it</td></tr>
<tr><td><code>memo(Component)</code></td><td>A component's <b>output</b></td><td>Re-rendering it when props are shallow-equal</td></tr>
</tbody>
</table></div>
<p class="sub">
  <code>useCallback(fn, deps)</code> is exactly <code>useMemo(() =&gt; fn, deps)</code>.
  It exists because that pattern is common enough to deserve a name.
</p>

<h3>memo, and why it so often does nothing</h3>
<pre><code>const Row = memo(function Row({ item, onSelect }) { ... });

&lt;Row item={item} onSelect={() =&gt; select(item.id)} /&gt;   <span class="c">// ✗ memo defeated</span></code></pre>
<p>
  <code>memo</code> does a <b>shallow</b> comparison of props. The arrow is a new
  function on every render, so the comparison always fails and the component
  re-renders anyway &mdash; now with the added cost of the comparison. The same
  is true of <code>style={{ ... }}</code>, <code>options={[...]}</code>, and any
  object built inline.
</p>
<pre><code>const handleSelect = useCallback((id) =&gt; select(id), [select]);
&lt;Row item={item} onSelect={handleSelect} /&gt;              <span class="c">// ✓ stable</span></code></pre>
<p>
  Which is the real lesson: <code>memo</code> is not one decision, it is a
  contract with every call site. Miss one prop and the whole thing is inert.
</p>

<div class="bx is-prim">
  <span class="ttl">Composition beats memo</span>
  <pre><code><span class="c">// ✗ SlowTree re-renders on every keystroke</span>
function Page() {
  const [q, setQ] = useState("");
  return (&lt;&gt;&lt;input value={q} onChange={...} /&gt;&lt;SlowTree /&gt;&lt;/&gt;);
}

<span class="c">// ✓ the state moved down; SlowTree is now a sibling that never re-renders</span>
function Page() {
  return (&lt;&gt;&lt;SearchBox /&gt;&lt;SlowTree /&gt;&lt;/&gt;);
}</code></pre>
  <p>
    Moving state down, or passing the expensive subtree in as
    <code>children</code>, solves the same problem with no cache to maintain and
    no call sites to keep in line. Try this first, every time.
  </p>
</div>

<h3>useMemo: when it is worth it</h3>
<pre><code>const sorted = useMemo(
  () =&gt; [...rows].sort(compare),
  [rows]
);                                <span class="c">// ✓ 10,000 rows, sorted on every keystroke otherwise</span>

const total = useMemo(() =&gt; a + b, [a, b]);   <span class="c">// ✗ the memo costs more than the addition</span></code></pre>
<p>
  <code>useMemo</code> is not free: it stores the value, stores the dependency
  array, and compares it on every render. For arithmetic and short strings the
  bookkeeping is more expensive than recomputing.
</p>
<p>
  The second legitimate use has nothing to do with speed: <b>referential
  stability</b>. If a value goes into a dependency array or into a memoised
  child, memoising it stops that thing running every render.
</p>
<pre><code>const value = useMemo(() =&gt; ({ user, login }), [user, login]);
&lt;AuthContext value={value}&gt;      <span class="c">// ✓ or every consumer re-renders always</span></code></pre>

<h3>The rule that keeps this sane</h3>
<ol>
  <li><b>Measure first.</b> React DevTools Profiler, with "record why each component rendered" on. Find the component that is actually slow.</li>
  <li><b>Fix the structure.</b> Move state down, pass children, split the component. This removes the problem rather than caching it.</li>
  <li><b>Then memoise</b>, at the specific place the profiler pointed at.</li>
</ol>
<p>
  Memoising everything as a habit makes the code harder to read, adds real
  overhead, and hides the one place it was needed among fifty where it was not.
</p>

<h3>Dependency arrays lie the same way here</h3>
<pre><code>const filtered = useMemo(
  () =&gt; rows.filter((r) =&gt; r.type === type),
  [rows]                          <span class="c">// ✗ type missing — stale forever</span>
);</code></pre>
<p>
  A missing dependency in <code>useMemo</code> is worse than in an effect,
  because it produces a wrong <em>value</em> rather than a skipped side effect,
  and it is silent.
</p>

<h3>The comparison is shallow, and you can override it</h3>
<pre><code>const Row = memo(Component, (prev, next) =&gt; prev.item.id === next.item.id);</code></pre>
<p>
  Returning <code>true</code> means "equal, skip the render" &mdash; the opposite
  polarity from <code>Array.prototype.sort</code>'s comparator, which catches
  people out. Custom comparators are rarely the right answer; a stable prop
  usually is.
</p>

<h3>The React Compiler changes the advice</h3>
<p>
  The React Compiler memoises automatically at build time, by understanding what
  actually depends on what. Where it is enabled, hand-written
  <code>useMemo</code> and <code>useCallback</code> largely stop being necessary.
  It is opt-in today, so both worlds exist &mdash; but it is worth knowing that
  the long-term direction is fewer of these by hand, not more.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Re-rendering is usually cheap, so memoisation is a targeted fix rather than
    a default. <code>memo</code> only helps if every prop is referentially
    stable, which is why an inline arrow silently defeats it — and moving state
    down or passing children solves the same problem without a cache to keep in
    sync."
  </p>
</div>`,
};
