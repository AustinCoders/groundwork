import type { Chapter } from "../types";

export const reactMemoisation: Chapter = {
  id: "react-memoisation",
  num: "I8",
  title: "Memoisation",
  short: "Memoisation",
  levels: ["intermediate"],
  prerequisites: ["react-usestate", "react-props", "react-effects-depth"],
  practice: ["ex-react-shallow-equal", "ex-react-memoize", "ex-comp-memo-row", "ex-comp-memo-inline-object"],
  ready: true,
  subtitle: "memo, useMemo and useCallback are a cache, and a cache you did not measure is a cost.",
  body: `<p>
  Memoisation in React means remembering a result so it does not have to be produced again: a computed value, a
  function's identity, or a component's rendered output. It is one of the most over-applied tools in the library and one
  of the most misunderstood in interviews, partly because the cheap default (re-render everything) is rarely the
  problem people think it is, and partly because the React Compiler now writes most of this code for you. This chapter
  explains what a re-render costs, what each of the three tools caches and when the cache is skipped, why
  <code>memo</code> so often silently does nothing, the structural fixes that beat it, how to measure, and how the
  compiler changes the advice. The render counts quoted were checked against React 19.3.
</p>

<h3>What actually happens on a re-render</h3>
<p>
  When a component's state changes, React calls that component again and then, by default, calls every component it
  renders, all the way down, whether or not their props changed. Rendering is running functions and comparing the
  returned elements with the previous ones. The DOM is only touched where the output differs.
</p>
<p>
  Checked: a child with no props and no <code>memo</code> rendered again when its parent's state changed. That sounds
  wasteful and usually is not. A typical component renders in microseconds; a few hundred of them re-rendering after a
  click is still well under a frame. Memoisation exists for the cases where that assumption breaks: a calculation that
  is genuinely expensive, a large subtree re-rendering on every keystroke, or a value whose identity matters to an
  effect or another cache.
</p>
<p>
  There is one important exception to "every child re-renders", and it is the basis of the best optimisation in this
  chapter. If a component receives JSX as a prop (usually <code>children</code>) and its state changes, the elements it
  received were created by <em>its parent</em> during the parent's last render. They are the same objects as before, so
  React skips them. Checked: a wrapper with its own state, re-rendered by a click, did not re-render the child it was
  passed as <code>children</code>: zero renders.
</p>

<h3>The three tools</h3>
<div class="table-scroll"><table>
<thead><tr><th>Tool</th><th>Caches</th><th>Reused when</th><th>Skips</th></tr></thead>
<tbody>
<tr><td><code>useMemo(fn, deps)</code></td><td>A computed <b>value</b></td><td>Every dependency is <code>Object.is</code>-equal to last render's</td><td>Calling <code>fn</code></td></tr>
<tr><td><code>useCallback(fn, deps)</code></td><td>A <b>function</b> identity</td><td>Same rule</td><td>Handing out a new function</td></tr>
<tr><td><code>memo(Component)</code></td><td>A component's <b>render</b></td><td>Every prop is <code>Object.is</code>-equal (a shallow comparison)</td><td>Calling the component</td></tr>
</tbody>
</table></div>
<p class="sub">
  <code>useCallback(fn, deps)</code> is exactly <code>useMemo(() =&gt; fn, deps)</code>. It exists because the pattern is
  common enough to deserve a name. It does not stop the function being <em>created</em> each render; it stops a new one
  being <em>returned</em>.
</p>

<h3>Worked example: when memo skips and when it does not</h3>
<p>
  Take one memoised row and change how its parent passes props. The parent re-renders each time because of an unrelated
  state change.
</p>
<pre><code>const Row = memo(function Row({ label, onClick, style }) {
  return &lt;p style={style} onClick={onClick}&gt;{label}&lt;/p&gt;;
});</code></pre>
<div class="table-scroll"><table>
<thead><tr><th>Parent passes</th><th>Row renders?</th><th>Why</th></tr></thead>
<tbody>
<tr><td><code>label="x"</code></td><td>No (0)</td><td>A string is equal to itself</td></tr>
<tr><td><code>label="x" onClick={() =&gt; {}}</code></td><td>Yes (1)</td><td>A new arrow every render fails <code>Object.is</code></td></tr>
<tr><td>the same, with <code>useCallback</code> and a <code>useMemo</code> style</td><td>No (0)</td><td>Both references are stable</td></tr>
<tr><td><code>&lt;Box&gt;&lt;span&gt;hi&lt;/span&gt;&lt;/Box&gt;</code> to a memoised <code>Box</code></td><td>Yes (1)</td><td>JSX children are new element objects each render</td></tr>
<tr><td><code>user={{ id: 1, tick }}</code> with a comparator checking <code>id</code></td><td>No (0)</td><td>The custom comparison says "equal"</td></tr>
</tbody>
</table></div>
<p>
  The fourth row surprises most people. <code>&lt;span&gt;hi&lt;/span&gt;</code> written inside the parent's render
  creates a new element object every time, so a memoised component that takes <code>children</code> re-renders whenever
  its parent does. <code>memo</code> on layout wrappers that receive JSX is nearly always wasted.
</p>
<figure>
  <svg viewBox="0 0 760 220" class="dg" role="img" aria-label="When the parent re-renders, memo compares each new prop with the previous one using Object.is. If every prop matches, the previous render is reused. If any prop is a new object, function or element, the component renders again.">
    <g class="rough">
      <rect class="box" x="20" y="80" width="170" height="60" rx="10" />
      <rect class="boxg" x="270" y="80" width="200" height="60" rx="10" />
      <rect class="box" x="550" y="20" width="190" height="60" rx="10" />
      <rect class="box" x="550" y="140" width="190" height="60" rx="10" />
      <path class="ln" d="M190 110 H264" marker-end="url(#arrow)" />
      <path class="ln" d="M470 100 L544 56" marker-end="url(#arrow)" />
      <path class="ln" d="M470 120 L544 166" marker-end="url(#arrow)" />
    </g>
    <text class="lbl" x="105" y="106" text-anchor="middle">parent renders</text>
    <text class="sm" x="105" y="126" text-anchor="middle">new props object</text>
    <text class="lbl" x="370" y="106" text-anchor="middle">memo compares</text>
    <text class="sm" x="370" y="126" text-anchor="middle">Object.is, prop by prop</text>
    <text class="lbl" x="645" y="46" text-anchor="middle">all equal</text>
    <text class="sm" x="645" y="66" text-anchor="middle">reuse last render</text>
    <text class="lbl" x="645" y="166" text-anchor="middle">any differs</text>
    <text class="sm" x="645" y="186" text-anchor="middle">call the component</text>
  </svg>
  <figcaption>
    One new reference among the props is enough to send <code>memo</code> down the lower path, after paying for the
    comparison.
  </figcaption>
</figure>

<h3>memo, and why it so often does nothing</h3>
<pre><code>&lt;Row item={item} onSelect={() =&gt; select(item.id)} /&gt;   <span class="c">// ✗ memo defeated</span>

const handleSelect = useCallback((id) =&gt; select(id), [select]);
&lt;Row item={item} onSelect={handleSelect} /&gt;              <span class="c">// ✓ stable, if select is stable</span></code></pre>
<p>
  <code>memo</code> is not one decision but a contract with every call site. The component author wraps it; every parent
  that renders it must then pass stable values for every prop, including <code>style</code> objects, option arrays,
  callbacks and JSX. Miss one and the wrapper only adds the cost of a comparison. The contract also has holes that no
  prop discipline closes:
</p>
<ul>
  <li><b>Its own state.</b> A memoised component still re-renders when its own state changes. <code>memo</code> only guards the path from the parent.</li>
  <li><b>Context.</b> A memoised component that reads a context re-renders when that context's value changes. Checked: one render after the provider's value changed, despite <code>memo</code> and no props.</li>
  <li><b>Unstable upstream values.</b> <code>useCallback(fn, [select])</code> is only stable if <code>select</code> is. A callback prop the parent itself received inline makes the whole chain unstable.</li>
</ul>

<div class="bx is-prim">
  <span class="ttl">Composition beats memo</span>
  <pre><code><span class="c">// ✗ SlowTree re-renders on every keystroke</span>
function Page() {
  const [q, setQ] = useState("");
  return (&lt;&gt;&lt;input value={q} onChange={(e) =&gt; setQ(e.target.value)} /&gt;&lt;SlowTree /&gt;&lt;/&gt;);
}

<span class="c">// ✓ the state moved down; SlowTree is a sibling that never re-renders</span>
function Page() {
  return (&lt;&gt;&lt;SearchBox /&gt;&lt;SlowTree /&gt;&lt;/&gt;);
}

<span class="c">// ✓ or the stateful part wraps the slow part, passed in as children</span>
function Page() {
  return &lt;ScrollTracker&gt;&lt;SlowTree /&gt;&lt;/ScrollTracker&gt;;
}</code></pre>
  <p>
    Moving state down, or passing the expensive subtree in as <code>children</code>, solves the same problem with no
    cache to maintain and no call sites to keep in line. Try it first, every time.
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
<pre><code>const sorted = useMemo(() =&gt; [...rows].sort(compare), [rows]);   <span class="c">// ✓ 10,000 rows, sorted per keystroke otherwise</span>

const total = useMemo(() =&gt; a + b, [a, b]);                       <span class="c">// ✗ the bookkeeping costs more than the addition</span></code></pre>
<p>
  <code>useMemo</code> is not free. It stores the value and the dependency array, and compares the array on every render.
  For arithmetic, short strings and small arrays, recomputing is cheaper than the cache. A practical threshold: wrap a
  calculation in <code>console.time</code> and run it with realistic data on a throttled CPU. If it takes a millisecond
  or more and runs on frequent renders, memoising it is reasonable.
</p>
<p>
  The cache holds exactly one previous result and is keyed on references, not contents. Checked: rendering with the same
  <code>items</code> array twice computed once; passing a copy of the same items computed again. So
  <code>useMemo(() =&gt; sort(items), [items])</code> only helps if whoever owns <code>items</code> keeps the same array
  between renders. If the parent builds it with <code>filter</code> during its own render, the memo recomputes every
  time.
</p>
<p>
  The second legitimate use has nothing to do with speed: <b>referential stability</b>. If a value goes into an effect's
  dependency array, a memoised child's props, or a context provider, memoising it stops those consumers running every
  render.
</p>
<pre><code>const value = useMemo(() =&gt; ({ user, login }), [user, login]);
&lt;AuthContext value={value}&gt;      <span class="c">// ✓ otherwise every consumer re-renders on every provider render</span></code></pre>

<h3>useCallback in practice</h3>
<p>
  <code>useCallback</code> on its own speeds nothing up; creating a function is cheap. It matters only when something
  downstream compares the function's identity. There are three such places:
</p>
<ul>
  <li><b>A memoised child's prop.</b> Without a stable callback, <code>memo</code> on the child is inert.</li>
  <li><b>A dependency of an effect or another memo</b>, in this component or in a child or custom hook that receives it.</li>
  <li><b>A function returned from a shared custom hook</b>, because the hook cannot know how callers will use it.</li>
</ul>
<p>
  Everywhere else, a plain function is fine and easier to read. When you do use it, keep the dependency list short by
  reading state through the updater form: <code>useCallback(() =&gt; setCount((c) =&gt; c + 1), [])</code> never changes,
  whereas <code>useCallback(() =&gt; setCount(count + 1), [count])</code> changes on every click and stabilises nothing.
  The <code>dispatch</code> from <a href="/react/react-usereducer">useReducer</a> and the setter from
  <code>useState</code> are already stable and never need wrapping.
</p>

<h3>Rows in a long list</h3>
<p>
  The most common place memoisation pays off is a list where one item changes and the rest should not re-render. Two
  details decide whether it works.
</p>
<pre><code>const TodoRow = memo(function TodoRow({ todo, onToggle }) {
  return (
    &lt;li&gt;
      &lt;input type="checkbox" checked={todo.done} onChange={() =&gt; onToggle(todo.id)} /&gt;
      {todo.title}
    &lt;/li&gt;
  );
});

function TodoList({ todos, setTodos }) {
  const onToggle = useCallback(
    (id) =&gt; setTodos((list) =&gt; list.map((t) =&gt; (t.id === id ? { ...t, done: !t.done } : t))),
    [setTodos]
  );
  return todos.map((todo) =&gt; &lt;TodoRow key={todo.id} todo={todo} onToggle={onToggle} /&gt;);
}</code></pre>
<p>
  First, pass the row one shared, stable handler that takes an id, rather than a closure per row such as
  <code>onToggle={() =&gt; toggle(todo.id)}</code>, which would be new for every row on every render. Second, update
  immutably: toggling one todo creates a new object for that todo and keeps the same object for all the others, so every
  other row's <code>todo</code> prop is identical to last time and <code>memo</code> skips it. Checked: toggling one item in a list
  of 1,000 rendered exactly one row. Mutating the todo in place instead rendered zero rows, so the checkbox kept showing the old
  value, because its prop was the same object: immutability is what makes the comparison meaningful.
</p>

<h3>Memoising context values</h3>
<p>
  A provider whose <code>value</code> is an object literal re-renders every consumer whenever the provider's component
  renders, because the value is a new object each time, and <code>memo</code> on the consumers cannot stop context
  updates. Memoise the value on the fields it contains, as shown earlier. If some consumers only need the actions (which
  rarely change) and others need the data (which changes often), split it into two contexts so action-only consumers stop
  re-rendering when data changes. <a href="/react/react-context">Context</a> covers both patterns with traced render
  counts.
</p>

<h3>A cache, not a guarantee</h3>
<p>
  React treats <code>useMemo</code> as a performance hint. It is allowed to throw a cached value away and recompute it,
  and in development it deliberately calls your function more than you expect: checked, under Strict Mode the
  calculation ran twice on mount. Two rules follow. The function must be pure, with no side effects that would matter if
  it ran twice or not at all. And correctness must never depend on the cache: if a value must be created exactly once
  (a store, a connection, an expensive instance with identity), use a <code>useState</code> lazy initialiser or a ref,
  which React does keep for the component's lifetime.
</p>

<h3>Dependency arrays lie the same way here</h3>
<pre><code>const filtered = useMemo(
  () =&gt; rows.filter((r) =&gt; r.type === type),
  [rows]                          <span class="c">// ✗ type missing: stale until rows changes</span>
);</code></pre>
<p>
  A missing dependency in <code>useMemo</code> is arguably worse than in an effect, because it produces a wrong
  <em>value</em> that the component renders, and nothing warns at runtime. The same hooks lint rule checks
  <code>useMemo</code> and <code>useCallback</code> arrays; trust it here exactly as for effects.
</p>

<h3>The comparison is shallow, and you can override it</h3>
<pre><code>const Row = memo(Component, (prev, next) =&gt; prev.item.id === next.item.id);</code></pre>
<p>
  Returning <code>true</code> means "equal, skip the render", the opposite polarity from <code>shouldComponentUpdate</code>
  in class components, which catches people out. A comparator that ignores a prop is a promise that the prop never
  affects output; break it and the row shows stale data, which is the same bug as a missing dependency. Deep-equality
  comparators are worse: they can cost more than the render they skip. Custom comparators are rarely right; a stable
  prop usually is.
</p>

<h3>The rule that keeps this sane</h3>
<ol>
  <li><b>Measure first.</b> Open the React DevTools Profiler, enable "Record why each component rendered", reproduce the slow interaction, and look for the commit and component that take the time.</li>
  <li><b>Fix the structure.</b> Move state down, pass children, split the component, or virtualise a long list. This removes the problem rather than caching it.</li>
  <li><b>Then memoise</b>, at the specific place the profiler pointed at, and confirm with a second recording that it helped.</li>
</ol>
<p>
  Memoising everything as a habit makes the code harder to read, adds real overhead to every render, and hides the one
  place it was needed among fifty where it was not. The profiler's "why did this render" answer is also the fastest way
  to find which prop is defeating a <code>memo</code>: it names the props that changed.
</p>

<h3>Reading the Profiler</h3>
<p>
  The React DevTools Profiler records commits: each time React applied a set of changes to the DOM. Record while
  reproducing the slow interaction, then read three views.
</p>
<ul>
  <li><b>The commit bar chart</b> at the top shows each commit's duration. Tall bars are the commits to investigate; a burst of many small ones after one keystroke points to cascading updates, often effects setting state.</li>
  <li><b>The flame graph</b> for a selected commit shows every component that rendered, sized by time. Grey components did not render in that commit. A wide component whose children are narrow is slow in its own body, a candidate for <code>useMemo</code>; a wide subtree of many narrow components is slow because too much re-rendered, a candidate for moving state or <code>memo</code>.</li>
  <li><b>"Why did this render?"</b>, shown when you select a component with the recording option enabled, lists the cause: a parent render, a hook change, or the names of props that changed. For a defeated <code>memo</code>, this is the line that tells you which prop to stabilise.</li>
</ul>
<p>
  Profile a production build when timings matter. Development builds run extra checks, including Strict Mode's double
  rendering, and can be several times slower, which exaggerates every cost. Use the development profile to find
  <em>what</em> renders and the production profile to decide whether it is <em>worth</em> fixing. Chrome's Performance
  panel, with CPU throttling, shows the same work from the browser's side and catches cost outside React, such as layout
  thrashing or a slow third-party script, that no amount of memoisation will touch.
</p>

<h3>Worked example: a slow filter</h3>
<p>
  A page shows 5,000 products with a search box. Typing feels sluggish. The profiler shows each keystroke commits in about
  40 ms, almost all of it in <code>ProductGrid</code>, and "why did this render" says its parent re-rendered.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Step</th><th>Change</th><th>Effect</th></tr></thead>
<tbody>
<tr><td>1</td><td>Move <code>query</code> state into <code>SearchBox</code>; lift only the debounced value up</td><td>The grid no longer renders on every keystroke, only when the debounced query changes</td></tr>
<tr><td>2</td><td><code>useMemo</code> the filtered list on <code>[products, query]</code></td><td>Unrelated parent renders (a toast, a cart badge) no longer re-filter</td></tr>
<tr><td>3</td><td><code>memo(ProductCard)</code>, with a stable <code>onAdd</code> from <code>useCallback</code></td><td>Cards whose product did not change skip rendering when the list changes</td></tr>
<tr><td>4</td><td>Virtualise the grid</td><td>Only the visible cards render at all; the biggest single win for long lists</td></tr>
</tbody>
</table></div>
<p>
  Note the order. Step 1 is structural and needed no cache. Step 4 is often what was really needed. Steps 2 and 3 are
  memoisation, applied where the profiler pointed. Doing step 3 first, without stable callbacks, would have changed
  nothing measurable.
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

<h3>Pitfalls</h3>
<ul>
  <li><b>Inline objects, arrays, functions or JSX</b> passed to a <code>memo</code> component.</li>
  <li><b><code>memo</code> on components that are cheap</b> or that always receive new props.</li>
  <li><b>Missing dependencies</b> in <code>useMemo</code> and <code>useCallback</code>: stale values on screen.</li>
  <li><b>Side effects inside <code>useMemo</code></b>: it may run twice, or again after the cache is dropped.</li>
  <li><b>Relying on <code>useMemo</code> for identity</b> that must never change; use state or a ref.</li>
  <li><b>Custom comparators that ignore props</b> the output depends on, or deep-compare large objects.</li>
  <li><b>Expecting <code>memo</code> to stop context or own-state renders.</b></li>
  <li><b>Memoising before measuring</b>, and never re-measuring after.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>"I wrapped it in memo and it still re-renders": find the unstable prop, often an inline callback or JSX children.</li>
  <li>"Typing is slow on this page": state too high in the tree, a list that is not virtualised, or an expensive calculation per render.</li>
  <li>"Every consumer of this context re-renders": the provider's value is a new object each render.</li>
  <li>"The effect runs after every render": an object or function dependency that needs <code>useMemo</code>, <code>useCallback</code>, or to move inside the effect.</li>
  <li>"Should I memo everything?": no; measure, restructure, then memoise, or turn on the compiler.</li>
</ul>

<h3>Interview questions</h3>
<p><b>1. When does a React component re-render?</b></p>
<p>
  When its state changes, when its parent re-renders (unless it is memoised and its props are shallow-equal, or it was
  passed in as an element that did not change), and when a context it reads changes. Re-rendering is calling the
  function; the DOM is only updated where output differs.
</p>
<p><b>2. Explain <code>memo</code>, <code>useMemo</code> and <code>useCallback</code>.</b></p>
<p>
  <code>memo</code> skips a component's render when every prop is <code>Object.is</code>-equal to last time.
  <code>useMemo</code> caches a computed value until a dependency changes. <code>useCallback</code> caches a function's
  identity the same way; it is <code>useMemo</code> returning a function. All three trade memory and comparison work for
  skipped work.
</p>
<p class="sub">
  <i>Follow-up: why might <code>memo</code> do nothing?</i> An inline arrow, object or JSX prop is a new reference every
  render, so the comparison always fails. Context changes and the component's own state also re-render it.
</p>
<p><b>3. How would you speed up a slow list page?</b></p>
<p>
  Profile first to find the slow commits and why they render. Then fix structure: keep fast-changing state low in the
  tree, pass slow subtrees as children, virtualise long lists. Then memoise the expensive calculation and the row
  component with stable callbacks, and profile again to confirm.
</p>
<p><b>4. What does the React Compiler change?</b></p>
<p>
  It inserts memoisation automatically at build time, including in places hooks cannot reach, such as after an early
  return. It requires code that follows the rules of React, and its lint rules catch code that does not. Manual
  <code>useMemo</code> stays as an escape hatch for exact control, and existing memoisation is left in place unless tested.
</p>
<p><b>5. In a list of 1,000 memoised rows, toggling one item re-renders all of them. What do you check?</b></p>
<p>
  Whether each row gets a new callback per render (a closure per row or an unstable handler), and whether the update
  replaces every item object instead of only the changed one. Fix with one stable handler that takes an id and an
  immutable update that preserves unchanged items. Then the profiler should show one row rendering.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "Can you use <code>useMemo</code> to make sure an expensive object is only created once?" Not reliably. React treats
    it as a cache it may discard, and calls it twice in Strict Mode. For something that must exist exactly once per
    component, use a lazy <code>useState</code> initialiser or a ref; <code>useMemo</code> is for performance, not
    correctness.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "Re-rendering is usually cheap, so memoisation is a targeted fix, not a default. <code>memo</code> only helps if every
    prop is referentially stable, which is why an inline arrow or JSX children silently defeat it. I measure with the
    Profiler, fix structure first by moving state down or passing children, then memoise where it shows up. With the
    React Compiler on, it applies that memoisation automatically, and I keep manual <code>useMemo</code> for the few
    cases it cannot see."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Say which children re-render when a parent's state changes, and why children passed as props do not.</li>
    <li>Predict whether a memoised row renders for each of five ways of passing props.</li>
    <li>Fix a <code>memo</code> defeated by an inline callback without changing the child.</li>
    <li>Restructure a page so a slow subtree stops re-rendering, with no memoisation.</li>
    <li>Decide whether a calculation deserves <code>useMemo</code>, using a measurement on a throttled CPU with realistic data.</li>
    <li>Explain why <code>useMemo</code> is not a guarantee, and what to use when identity must be kept.</li>
    <li>Write a custom <code>memo</code> comparator and name the bug it can introduce.</li>
    <li>Make a memoised list re-render only the toggled row, and explain why mutating the item breaks it.</li>
    <li>Read a Profiler recording: find the slow commit, the wide component, and the prop that defeated <code>memo</code>.</li>
    <li>Describe what the React Compiler does and how to adopt it on an existing app.</li>
  </ul>
</div>`,
};
