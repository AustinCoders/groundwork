import type { Chapter } from "../types";

export const reactMemoisation: Chapter = {
  id: "react-memoisation",
  num: "I8",
  title: "Memoisation",
  short: "Memoisation",
  levels: ["intermediate"],
  practice: ["ex-react-shallow-equal", "ex-react-memoize", "ex-comp-memo-row", "ex-comp-memo-inline-object"],
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

<h3>Watch what re-renders</h3>
<div class="demo" id="rr">
  <div class="demo__bar">Which components run when App's state changes?</div>
  <div class="demo__body">
    <p>
      <label><input type="checkbox" id="rr-memo" /> wrap Panel in <code>memo</code></label><br />
      <label><input type="checkbox" id="rr-inline" /> pass Panel an inline object, <code>style={{ gap: 8 }}</code></label><br />
      <label><input type="checkbox" id="rr-children" /> pass Panel in as <code>children</code> from above</label>
    </p>
    <div class="viz-tree" id="rr-tree"></div>
    <div class="demo__ctl">
      <button class="btn btn--primary" id="rr-click" type="button">setCount(count + 1) in App</button>
      <button class="btn btn--ghost" id="rr-reset" type="button">Reset counts</button>
    </div>
    <p class="demo__note" id="rr-note" aria-live="polite"></p>
  </div>
</div>
<script>
(function () {
  var counts, flashed, count, note;
  var memo = document.getElementById("rr-memo");
  var inline = document.getElementById("rr-inline");
  var kids = document.getElementById("rr-children");
  var tree = document.getElementById("rr-tree");
  var noteEl = document.getElementById("rr-note");

  function fresh() {
    counts = { App: 1, Header: 1, Counter: 1, Panel: 1, Chart: 1 };
    flashed = {};
    count = 0;
    note = "Every component rendered once, on mount. Click to change App's state.";
  }
  function panelRuns() {
    if (kids.checked) return false;
    if (memo.checked) return inline.checked;
    return true;
  }
  function explain(runs) {
    if (kids.checked) return "Panel is an element created above App, so its identity did not change. React bails out and never calls Panel or Chart.";
    if (!memo.checked) return "Without memo, a parent render re-renders every child, needed or not.";
    if (inline.checked) return "Panel is memoised, but the inline object is a new reference every render, so the shallow prop comparison fails and memo does nothing.";
    return "Panel is memoised and every prop is the same reference, so React skips it and everything below it. (The React Compiler adds this automatically where it can.)";
  }
  function step() {
    var runs = { App: true, Header: true, Counter: true, Panel: panelRuns() };
    runs.Chart = runs.Panel;
    count++;
    flashed = {};
    Object.keys(runs).forEach(function (n) { if (runs[n]) { counts[n]++; flashed[n] = true; } });
    note = "count is now " + count + ". " + explain(runs);
  }
  function node(name, extra) {
    return '<span class="viz-node' + (flashed[name] ? " is-rendered" : "") + '">' + name + ' <span class="viz-badge">rendered ' + counts[name] + "x</span>" + (extra || "") + "</span>";
  }
  function render() {
    tree.innerHTML = "<ul><li>" + node("App") + "<ul><li>" + node("Header") + "</li><li>" + node("Counter") + "</li><li>" + node("Panel") + "<ul><li>" + node("Chart") + "</li></ul></li></ul></li></ul>";
    noteEl.textContent = note;
  }
  document.getElementById("rr-click").addEventListener("click", function () { step(); render(); });
  document.getElementById("rr-reset").addEventListener("click", function () { fresh(); render(); });
  [memo, inline, kids].forEach(function (c) { c.addEventListener("change", function () { fresh(); render(); }); });
  fresh();
  render();
})();
</script>

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
  React Compiler 1.0 shipped on 7 October 2025. It is a build-time plugin that
  reads your components and hooks, works out which values depend on which, and
  inserts the memoisation for you. Everything above still explains <em>why</em> a
  re-render happens; the compiler changes <em>who</em> writes the cache.
</p>
<pre><code>npm install --save-dev --save-exact babel-plugin-react-compiler@latest</code></pre>
<div class="table-scroll"><table>
<thead><tr><th>Where</th><th>Is it on?</th></tr></thead>
<tbody>
<tr><td>Expo SDK 54 and later</td><td>On by default in new apps</td></tr>
<tr><td><code>create-vite</code>, <code>create-next-app</code></td><td>Offered as a compiler-enabled template &mdash; you choose it</td></tr>
<tr><td>An existing app</td><td>Off until you add the plugin</td></tr>
<tr><td>React 17 or 18</td><td>Works, with <code>react-compiler-runtime</code> added as a dependency</td></tr>
</tbody>
</table></div>

<h4>What it does better than hand-written memo</h4>
<pre><code>function Row({ item, onSelect }) {
  if (!item.visible) return null;
  const label = formatLabel(item);          <span class="c">// the compiler can cache this</span>
  return &lt;li onClick={() =&gt; onSelect(item.id)}&gt;{label}&lt;/li&gt;;
}</code></pre>
<p>
  You cannot call <code>useMemo</code> after an early return &mdash; it would
  break the rules of hooks. The compiler is not a hook, so it can memoise
  <em>conditionally</em>, after the <code>return null</code>, and it caches the
  inline arrow too. That is the category of optimisation manual memoisation could
  never reach.
</p>

<h4>What to do with the useMemo you already wrote</h4>
<p>
  The React team's own guidance is to <b>leave existing memoisation in place</b>,
  or remove it only with testing, because deleting a <code>useMemo</code> can
  change what the compiler outputs. For new code, rely on the compiler and keep
  <code>useMemo</code>/<code>useCallback</code> as an escape hatch for the few
  places you need exact control &mdash; a value that must stay referentially
  stable for an effect dependency, for example.
</p>

<h4>Opting in and out, one function at a time</h4>
<pre><code>function LegacyChart() {
  "use no memo";                            <span class="c">// skip this one until it is fixed</span>
  ...
}

function Checkout() {
  "use memo";                               <span class="c">// compile this one in annotation mode</span>
  ...
}</code></pre>
<div class="table-scroll"><table>
<thead><tr><th><code>compilationMode</code></th><th>What gets compiled</th></tr></thead>
<tbody>
<tr><td><code>annotation</code></td><td>Only functions marked <code>"use memo"</code> &mdash; the safe way to start on a large app</td></tr>
<tr><td><code>infer</code></td><td>What the compiler decides looks like a component or hook; directives override it</td></tr>
<tr><td><code>all</code></td><td>Everything, except functions marked <code>"use no memo"</code></td></tr>
</tbody>
</table></div>
<p class="sub">
  Either directive can also sit at the top of a module to cover every function in
  the file. Treat <code>"use no memo"</code> as a temporary marker with a ticket
  behind it, not a permanent setting.
</p>

<h4>The compiler needs code that follows the rules</h4>
<p>
  It assumes components are pure and props and state are not mutated. Code that
  breaks those rules either gets skipped or behaves differently once cached. The
  recommended config of <code>eslint-plugin-react-hooks</code> now carries
  compiler-powered rules that catch exactly those patterns:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Rule</th><th>Catches</th></tr></thead>
<tbody>
<tr><td><code>set-state-in-render</code></td><td>A <code>setState</code> during render that loops</td></tr>
<tr><td><code>set-state-in-effect</code></td><td>State set synchronously inside an effect &mdash; usually a derived value that should be computed during render</td></tr>
<tr><td><code>refs</code></td><td>Reading or writing <code>ref.current</code> during render</td></tr>
</tbody>
</table></div>
<pre><code><span class="c">// eslint.config.js</span>
import reactHooks from "eslint-plugin-react-hooks";
export default [reactHooks.configs.flat.recommended];</code></pre>
<div class="bx is-prim">
  <span class="ttl">Adopting it on an existing app</span>
  <ol>
    <li>Turn on the lint rules first and fix what they report. That is most of the work, and it is worth doing even without the compiler.</li>
    <li>Add the plugin in <code>annotation</code> mode and mark a few stable, well-tested components with <code>"use memo"</code>.</li>
    <li>Profile before and after with the React DevTools Profiler &mdash; measure, the same way the rest of this chapter says to.</li>
    <li>Move to <code>infer</code>, and mark anything that misbehaves <code>"use no memo"</code> until it is fixed.</li>
  </ol>
</div>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Re-rendering is usually cheap, so memoisation is a targeted fix rather than
    a default. <code>memo</code> only helps if every prop is referentially
    stable, which is why an inline arrow silently defeats it — and moving state
    down or passing children solves the same problem without a cache to keep in
    sync. With the React Compiler enabled, it applies that memoisation
    automatically, so manual <code>memo</code> and <code>useMemo</code> are
    kept for the cases it cannot see."
  </p>
</div>`,
};
