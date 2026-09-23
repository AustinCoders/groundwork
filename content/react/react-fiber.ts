import type { Chapter } from "../types";

export const reactFiber: Chapter = {
  id: "react-fiber",
  num: "A1",
  title: "Reconciliation & Fiber",
  short: "Fiber",
  levels: ["advanced"],
  practice: ["ex-react-fiber-reconcile"],
  ready: true,
  subtitle:
    "Render is a pure, interruptible calculation. Commit is a synchronous mutation. Everything follows from that split.",
  body: `<h3>The two phases</h3>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Render</th><th>Commit</th></tr></thead>
<tbody>
<tr><td>What happens</td><td>Your components run; React builds a tree of work</td><td>The DOM is mutated, refs attach, layout effects run</td></tr>
<tr><td>Interruptible</td><td><span class="chip tone-yes">yes</span></td><td><span class="chip tone-bad">no</span></td></tr>
<tr><td>Can run twice</td><td><span class="chip tone-yes">yes</span> &mdash; and does, in Strict Mode</td><td>never</td></tr>
<tr><td>Side effects allowed</td><td>none</td><td>this is where they belong</td></tr>
</tbody>
</table></div>
<p>
  This is why components must be pure. React may start rendering, throw the work
  away because something more urgent arrived, and start again from the top. A
  component that mutated something outside itself would have done it twice, or
  half.
</p>

<h3>What a fiber is</h3>
<p>
  A fiber is a plain object representing one unit of work &mdash; one component
  instance, one DOM element. It holds the type, the pending props, the state
  hooks, the flags describing work it needs, and pointers to its <code>child</code>,
  <code>sibling</code> and <code>return</code> (parent).
</p>
<pre><code>{ type: Button, stateNode, memoizedProps, memoizedState,
  child, sibling, return, flags, subtreeFlags, alternate }</code></pre>
<p>
  Those pointers are the important part. Before Fiber, React reconciled with
  recursion &mdash; and a recursive call stack cannot be paused. A linked list
  can: React keeps a pointer to the next fiber, so it can stop after any node,
  hand control back to the browser, and resume from that pointer later.
</p>

<div class="bx is-prim">
  <span class="ttl">The whole point of the rewrite</span>
  <p>
    Fiber turned rendering from a recursive function you cannot interrupt into a
    loop over a data structure you can. Everything React shipped afterwards
    &mdash; time slicing, transitions, Suspense, streaming &mdash; needed that
    one capability.
  </p>
</div>

<h3>Double buffering</h3>
<p>
  There are two trees. <code>current</code> is what is on screen;
  <code>workInProgress</code> is what is being built. Each fiber points at its
  counterpart through <code>alternate</code>, and React reuses those objects
  rather than allocating a new tree every render.
</p>
<p>
  When the render finishes, React swaps the pointer &mdash; the work-in-progress
  tree becomes current in one assignment. If the render is abandoned instead,
  the in-progress tree is simply discarded and the screen never showed a partial
  state. This is why an interrupted render is invisible rather than glitchy.
</p>

<h3>The diffing rules, exactly</h3>
<p>
  A true tree diff is O(n³). React gets to O(n) by making two assumptions that
  hold in practice:
</p>
<ol>
  <li><b>Different types produce different trees.</b> If the element type at a position changed, React does not try to match children &mdash; it unmounts the whole subtree and mounts a new one. State, refs and DOM nodes below are all discarded.</li>
  <li><b>Keys identify children across renders.</b> Within a list, a key tells React which new element corresponds to which old one, so it can move a node instead of rebuilding it.</li>
</ol>
<pre><code>&lt;div&gt;&lt;Counter /&gt;&lt;/div&gt;   →   &lt;span&gt;&lt;Counter /&gt;&lt;/span&gt;
<span class="c">// div became span → Counter unmounts and remounts, losing its state</span></code></pre>
<p>
  This is the mechanism behind the two bugs from the beginner tier: a component
  defined inside another component is a new function &mdash; a new type &mdash;
  every render, so rule one destroys it each time; and index keys make rule two
  match the wrong items.
</p>

<h3>Lanes: not everything is equally urgent</h3>
<p>
  Each update is tagged with a <b>lane</b>, a priority. A click is more urgent
  than a transition, which is more urgent than an offscreen prerender. React
  works through the highest-priority lane first, and can abandon lower-priority
  work when something urgent arrives.
</p>
<pre><code>setInput(value);                          <span class="c">// urgent — user is typing</span>
startTransition(() =&gt; setResults(list));  <span class="c">// can be interrupted</span></code></pre>
<p>
  <a href="/react/react-concurrent">Concurrent features</a> are the public API
  over this. Without lanes, every update is equally urgent, and one expensive
  re-render blocks the keystroke behind it.
</p>

<h3>Walking the tree, concretely</h3>
<pre><code>beginWork(fiber)      <span class="c">// going down: run the component, create child fibers</span>
completeWork(fiber)   <span class="c">// coming back up: finish the node, bubble its flags to the parent</span></code></pre>
<p>
  React descends through <code>child</code> pointers calling
  <code>beginWork</code>, and when a fiber has no child it calls
  <code>completeWork</code> and follows <code>sibling</code>, or
  <code>return</code> if there is no sibling. Depth-first, with an explicit
  pointer instead of the call stack &mdash; which is precisely what makes it
  pausable.
</p>
<p>
  Between units, React checks whether it has run out of its time slice. If it
  has, it yields to the browser and schedules a continuation. The browser gets
  to paint, handle input, and run its own work; React picks up from the fiber it
  stopped at.
</p>

<h3>Bailouts: how React skips work</h3>
<p>
  Not every fiber in the path gets re-rendered. React bails out when it can, and
  knowing the conditions explains most "why did this render" questions:
</p>
<ul>
  <li><b>Props are referentially equal and there is no pending state</b> &mdash; React reuses the existing fiber and does not call your component.</li>
  <li><b>The element object is identical</b> &mdash; passing <code>children</code> straight through means the same element, so the subtree is skipped even though the parent re-rendered. This is why the children pattern beats <code>memo</code>.</li>
  <li><b>State was set to the same value</b> &mdash; React may re-render once and then bail before touching the DOM.</li>
</ul>
<p>
  A bailout stops the walk at that node, so an entire subtree is skipped in one
  check. That is why re-rendering is usually cheap and why the fix for a slow
  tree is often structural rather than a cache.
</p>

<h3>Flags, and how commit finds the work</h3>
<p>
  During render React records what each fiber needs as <code>flags</code>
  &mdash; placement, update, ref, snapshot, has-layout-effect &mdash; and deletions
  are noted on the parent. As <code>completeWork</code> climbs back up, it
  <b>bubbles</b> those flags upward: each fiber's <code>subtreeFlags</code> is the
  combination of everything beneath it. So the root knows, without looking, whether
  any work exists anywhere in the tree, and each parent knows whether it is worth
  descending into a child.
</p>
<p>
  Commit then walks the finished tree in three passes &mdash; <b>before
  mutation</b> (snapshots), <b>mutation</b> (DOM changes, refs detached),
  <b>layout</b> (refs attached, <code>useLayoutEffect</code>) &mdash; and in each
  pass skips any subtree whose <code>subtreeFlags</code> show nothing to do. A
  change in one leaf costs a walk down one path, not a scan of every component.
</p>
<p class="sub">
  Older write-ups, and React 16 and 17, describe an <em>effect list</em>: a
  linked chain of only the fibers with effects, threaded together during render.
  React 18 replaced it with <code>flags</code> and <code>subtreeFlags</code>, so
  if you read "commit walks the effect list", you are reading about an
  implementation that no longer exists. The three passes and their guarantees are
  unchanged.
</p>
<p>
  That three-pass structure is why <a href="/react/react-effect-timing">effect
  timing</a> is what it is: refs are attached in the layout pass, which is why
  every effect can rely on <code>ref.current</code>, and why nothing can during
  render.
</p>

<h3>Watch it happen: render, then commit</h3>
<div class="demo" id="fw">
  <div class="demo__bar">Walking the fiber tree</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="viz-tree" id="fw-tree"></div>
        <div class="demo__ctl">
          <button class="btn" id="fw-prev" type="button">← Back</button>
          <button class="btn" id="fw-next" type="button">Next step →</button>
          <button class="btn btn--ghost" id="fw-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Work order so far</div>
          <div id="fw-log"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="fw-note" aria-live="polite"></p>
  </div>
</div>
<p class="sub">
  Only <code>ItemB</code> has changed. Step through: the render phase walks
  down and back up, bubbling that one flag toward the root; then commit walks
  the finished tree and skips every clean subtree.
</p>
<script>
(function () {
  var root = { id: "App", kids: [
    { id: "Header", kids: [] },
    { id: "Main", kids: [
      { id: "List", kids: [
        { id: "ItemA", kids: [] },
        { id: "ItemB", kids: [], work: "Update" }
      ] },
      { id: "Sidebar", kids: [] }
    ] },
    { id: "Footer", kids: [] }
  ] };
  function hasWork(n) { return !!n.work || n.kids.some(hasWork); }
  var steps = [];
  function walk(n) {
    steps.push({ t: "begin", n: n });
    n.kids.forEach(walk);
    steps.push({ t: "complete", n: n });
  }
  function commit(n) {
    if (!hasWork(n)) { steps.push({ t: "skip", n: n }); return; }
    steps.push({ t: n.work ? "apply" : "descend", n: n });
    n.kids.forEach(commit);
  }
  walk(root);
  commit(root);

  var i = 0;
  var tree = document.getElementById("fw-tree");
  var log = document.getElementById("fw-log");
  var note = document.getElementById("fw-note");
  var next = document.getElementById("fw-next");
  var prev = document.getElementById("fw-prev");

  function noteFor(s) {
    var id = s.n.id;
    if (s.t === "begin") return "beginWork(" + id + "): React runs the component and reconciles its children. Going down.";
    if (s.t === "complete") {
      if (s.n.kids.length === 0) return "completeWork(" + id + "): nothing below it. " + (s.n.work ? "It has a pending update, so it is flagged." : "No flags: nothing to do here.");
      return "completeWork(" + id + "): every child is finished. subtreeFlags now says " + (hasWork(s.n) ? "there is work somewhere beneath." : "the subtree is clean.");
    }
    if (s.t === "skip") return "Commit: " + id + " has no flags and a clean subtree, so the whole subtree is skipped without visiting it.";
    if (s.t === "descend") return "Commit: " + id + " has work somewhere beneath it, so commit descends.";
    return "Commit: " + id + " carries the Update flag. The DOM change is applied here.";
  }

  function render() {
    var began = {}, done = {}, decision = {}, current = i > 0 ? steps[i - 1] : null;
    for (var k = 0; k < i; k++) {
      var s = steps[k];
      if (s.t === "begin") began[s.n.id] = true;
      else if (s.t === "complete") done[s.n.id] = true;
      else decision[s.n.id] = s.t;
    }
    function draw(n) {
      var cls = "viz-node";
      if (current && current.n === n) cls += " is-current";
      if (done[n.id]) cls += " is-done";
      if (decision[n.id] === "skip") cls += " is-skip";
      var badges = "";
      if (began[n.id] && n.work) badges += ' <span class="viz-badge viz-badge--work">flag: ' + n.work + "</span>";
      if (done[n.id] && hasWork(n)) badges += ' <span class="viz-badge viz-badge--work">subtreeFlags</span>';
      if (decision[n.id]) badges += ' <span class="viz-badge">' + decision[n.id] + "</span>";
      var html = '<span class="' + cls + '">' + n.id + badges + "</span>";
      if (n.kids.length) html += "<ul>" + n.kids.map(function (c) { return "<li>" + draw(c) + "</li>"; }).join("") + "</ul>";
      return html;
    }
    tree.innerHTML = draw(root);
    var lines = [];
    for (var j = Math.max(0, i - 8); j < i; j++) {
      var st = steps[j];
      var label = st.t === "begin" ? "beginWork(" : st.t === "complete" ? "completeWork(" : "commit " + st.t + "(";
      lines.push('<span class="loop-frame loop-frame--stack">' + label + st.n.id + ")</span>");
    }
    log.innerHTML = lines.join("");
    note.textContent = i === 0
      ? "Press Next. The render phase walks down with beginWork and back up with completeWork; then commit walks the finished tree."
      : i === steps.length
        ? "Done. One changed leaf cost a walk down a single path: Header, ItemA, Sidebar and Footer were never visited in the commit."
        : noteFor(steps[i - 1]);
    prev.disabled = i === 0;
    next.disabled = i === steps.length;
  }
  next.addEventListener("click", function () { if (i < steps.length) { i++; render(); } });
  prev.addEventListener("click", function () { if (i > 0) { i--; render(); } });
  document.getElementById("fw-reset").addEventListener("click", function () { i = 0; render(); });
  render();
})();
</script>

<h3>Where the time actually goes</h3>
<p>
  A common misreading is that the virtual DOM is fast. It is not &mdash; it is
  <em>overhead</em> that buys a programming model. Direct DOM manipulation is
  faster than diffing; what React gives you is not having to write it.
</p>
<p>
  In a slow React app the cost is almost never the diff. It is your component
  functions running: an expensive calculation with no memo, a context provider
  high in the tree handing out a new object every render, a list rendering two
  thousand rows that should be virtualised. The Profiler tells you which.
</p>

<h3>Reading a Profiler flame chart</h3>
<ul>
  <li><b>Width</b> is time spent in that component and its children.</li>
  <li><b>Grey</b> means it did not re-render &mdash; memo or bailout worked.</li>
  <li>Turn on <b>"record why each component rendered"</b>. "Parent rendered" on a component whose props never change points at a missing <code>memo</code>; "context changed" points at an unmemoised provider value.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Fiber replaced recursive reconciliation with a linked-list walk, so render
    became interruptible while commit stayed synchronous — which is why
    components must be pure and why concurrent features are possible at all.
    Diffing is O(n) because of two assumptions: different types mean a new
    subtree, and keys identify children across renders."
  </p>
</div>`,
};
