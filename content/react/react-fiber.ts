import type { Chapter } from "../types";

export const reactFiber: Chapter = {
  id: "react-fiber",
  num: "A1",
  title: "Reconciliation & Fiber",
  short: "Fiber",
  levels: ["advanced"],
  prerequisites: ["react-usestate", "react-lists-keys", "react-memoisation"],
  practice: ["ex-react-fiber-reconcile", "ex-react-would-bail-out"],
  ready: true,
  subtitle:
    "Render is a pure, interruptible calculation. Commit is a synchronous mutation. Everything follows from that split.",
  body: `<p>
  Most React questions at the advanced level reduce to one question: what does React do between a state update and the
  pixels changing? This chapter answers it from the inside. It covers the two phases of an update, what a fiber is and
  why the data structure made concurrent rendering possible, the two trees React keeps, the diffing rules that decide
  whether state survives, how React walks the tree and skips work, how commit finds what to change, and how all of it
  shows up in the Profiler. You do not need this to write components, but you need it to explain why they behave as they
  do, and interviewers at the senior level ask. The observable behaviour quoted (render order, effect order, which
  changes keep state) was checked against React 19.3; internal names such as <code>beginWork</code> are React's own and
  can change between versions.
</p>

<h3>The two phases</h3>
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

<figure>
  <svg viewBox="0 0 760 260" class="dg" role="img" aria-label="An App fiber points to its first child, Header, through child. Header points to its next sibling, Main, through sibling, and Main to Footer. Every child points back to App through return. Main points to its own child, List.">
    <g class="rough">
      <rect class="boxg" x="300" y="20" width="160" height="50" rx="10" />
      <rect class="box" x="40" y="130" width="160" height="50" rx="10" />
      <rect class="box" x="300" y="130" width="160" height="50" rx="10" />
      <rect class="box" x="560" y="130" width="160" height="50" rx="10" />
      <rect class="box" x="300" y="210" width="160" height="40" rx="10" />
      <path class="ln" d="M320 70 L150 126" marker-end="url(#arrow)" />
      <path class="ln" d="M200 155 H294" marker-end="url(#arrow)" />
      <path class="ln" d="M460 155 H554" marker-end="url(#arrow)" />
      <path class="ln" d="M380 180 V204" marker-end="url(#arrow)" />
      <path class="ln" d="M640 130 L450 74" marker-end="url(#arrow)" />
    </g>
    <text class="lbl" x="380" y="50" text-anchor="middle">App</text>
    <text class="lbl" x="120" y="160" text-anchor="middle">Header</text>
    <text class="lbl" x="380" y="160" text-anchor="middle">Main</text>
    <text class="lbl" x="640" y="160" text-anchor="middle">Footer</text>
    <text class="lbl" x="380" y="235" text-anchor="middle">List</text>
    <text class="sm" x="205" y="92" text-anchor="middle">child</text>
    <text class="sm" x="247" y="146" text-anchor="middle">sibling</text>
    <text class="sm" x="507" y="146" text-anchor="middle">sibling</text>
    <text class="sm" x="405" y="197" text-anchor="start">child</text>
    <text class="sm" x="575" y="95" text-anchor="middle">return</text>
  </svg>
  <figcaption>
    A parent points only to its first child; the rest are reached through <code>sibling</code>, and every fiber points
    back up through <code>return</code>. Any position in the walk can be resumed from one pointer.
  </figcaption>
</figure>

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

<h3>Worked example: which changes keep state</h3>
<p>
  The diffing rules are easiest to learn as predictions. In each case below a <code>Counter</code> was clicked to a
  non-zero value, then the parent re-rendered with the change shown. Checked against React 19.3:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Change</th><th>Counter after</th><th>Rule</th></tr></thead>
<tbody>
<tr><td><code>&lt;div&gt;&lt;Counter /&gt;&lt;/div&gt;</code> becomes <code>&lt;span&gt;&lt;Counter /&gt;&lt;/span&gt;</code></td><td>0, reset</td><td>A different type at a position replaces the whole subtree</td></tr>
<tr><td><code>a ? &lt;Counter /&gt; : &lt;Counter /&gt;</code> with <code>a</code> flipped</td><td>7, kept</td><td>Same type at the same position is the same component, whichever branch produced it</td></tr>
<tr><td>Same ternary, with <code>key="a"</code> and <code>key="b"</code></td><td>0, reset</td><td>A different key is a different identity</td></tr>
<tr><td><code>{show &amp;&amp; &lt;p /&gt;}&lt;Counter /&gt;</code> with <code>show</code> turned on</td><td>4, kept</td><td><code>false</code> still occupies the first slot, so Counter stays second</td></tr>
<tr><td>A component defined inside its parent's body, parent rendered three times</td><td>mounted 3 times</td><td>A new function each render is a new type</td></tr>
</tbody>
</table></div>
<p>
  The second row surprises people: two different JSX expressions, one component. React never sees your source, only the
  element tree each render returns, and at that position both branches return a <code>Counter</code>. If a form for
  "edit user A" and "edit user B" keeps A's typing when you switch, this is why; give it <code>key={userId}</code>. The
  fourth row is why conditional rendering with <code>&amp;&amp;</code> is safe: React keeps the hole. The last row is the
  most expensive bug in the table, because the inner component loses its state, its DOM and its effects on every parent
  render, and nothing warns.
</p>

<h3>Where hook state lives</h3>
<p>
  A function component has nowhere to keep state between calls, so its fiber keeps it. The fiber's
  <code>memoizedState</code> field points to the first hook, and each hook object points to the next: a linked list in
  call order. <code>useState</code> stores its current value and a queue of pending updates; <code>useRef</code> stores
  the ref object; <code>useMemo</code> stores the value and its dependencies; <code>useEffect</code> stores the effect,
  its dependencies and its cleanup.
</p>
<p>
  During render, React keeps a cursor into that list. The first hook call reads the first node, the second reads the
  second, and so on. Nothing identifies a hook except its position, which is the entire reason for the rules of hooks: a
  hook called conditionally shifts every later hook onto the wrong node, and React would hand your
  <code>useRef</code> the state of a <code>useState</code>. In development React records the hook types it saw on the
  previous render and warns when the order changes.
</p>
<p>
  The list lives on the current fiber and is copied to the work-in-progress fiber when a render starts. Updates are
  processed against the copy, so an abandoned render leaves the committed state untouched. This is also why a state
  setter does not change the variable you are holding: your function already read the value from the list for this
  render, and the update is a note in the queue for the next one. The <a href="/react/react-usestate">useState</a>
  chapter traces that queue in detail.
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
<pre><code>beginWork(fiber)      <span class="c">// going down: run the component, reconcile its children</span>
completeWork(fiber)   <span class="c">// coming back up: prepare the DOM node, bubble flags to the parent</span></code></pre>
<p>
  React descends through <code>child</code> pointers calling <code>beginWork</code>. When a fiber has no child, it calls
  <code>completeWork</code> on it and moves to its <code>sibling</code>, or climbs through <code>return</code> completing
  parents when there is no sibling. Depth-first, with an explicit pointer instead of the call stack, which is precisely
  what makes it pausable.
</p>
<p>
  Take the tree from the diagram: <code>App</code> containing <code>Header</code>, <code>Main</code> (which contains
  <code>List</code>) and <code>Footer</code>.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Step</th><th>Work</th><th>Next pointer followed</th></tr></thead>
<tbody>
<tr><td>1</td><td>begin App (App's function runs)</td><td>child → Header</td></tr>
<tr><td>2</td><td>begin Header</td><td>no child, so complete Header</td></tr>
<tr><td>3</td><td>complete Header</td><td>sibling → Main</td></tr>
<tr><td>4</td><td>begin Main</td><td>child → List</td></tr>
<tr><td>5</td><td>begin List, complete List</td><td>no sibling, return → Main</td></tr>
<tr><td>6</td><td>complete Main</td><td>sibling → Footer</td></tr>
<tr><td>7</td><td>begin Footer, complete Footer</td><td>no sibling, return → App</td></tr>
<tr><td>8</td><td>complete App</td><td>done: commit</td></tr>
</tbody>
</table></div>
<p>
  Two orders fall out of this, and both are observable. Components <em>render</em> in begin order: checked, the log read
  App, Header, Main, List, Footer, parents before children. Layout effects run in <em>completion</em> order: Header,
  List, Main, Footer, App, children before parents. That is why a parent's <code>useLayoutEffect</code> can measure
  children that have already been laid out, and why a child's effect cannot assume its parent's has run.
</p>
<p>
  Between units of work, in a concurrent render, React checks whether its time slice is used up. The scheduler's slice
  is about five milliseconds. When it runs out, React yields to the browser and schedules a continuation; the browser
  paints, handles input and runs its own tasks, and React picks up from the fiber it stopped at. An urgent update that
  arrived meanwhile can be processed first, and the interrupted work restarted. A synchronous render (an urgent update
  such as a click) does not yield; it runs the walk to completion.
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

<h3>One setState, end to end</h3>
<p>
  Putting the pieces together, here is what happens when a deeply nested <code>List</code> calls its state setter in a
  click handler, in a tree of a few hundred components.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Stage</th><th>What React does</th><th>Cost</th></tr></thead>
<tbody>
<tr><td>Schedule</td><td>Queues the update on List's hook, assigns it a lane (a click is a high-priority, synchronous lane), and marks List and every ancestor up to the root: "something below has work in this lane"</td><td>One walk up the <code>return</code> path</td></tr>
<tr><td>Render, top down</td><td>Starts at the root. At each fiber with no work of its own and unchanged props, it bails out; if the marks say work exists below, it clones the child fibers and keeps going down that path only</td><td>Proportional to the path to List, not the tree</td></tr>
<tr><td>Render List</td><td>Calls List with the new state and reconciles its returned children against the old ones</td><td>List and anything below it that is not skipped</td></tr>
<tr><td>Complete</td><td>Climbs back up, preparing DOM changes and bubbling flags</td><td>Same path</td></tr>
<tr><td>Commit</td><td>Follows subtree flags to the changed nodes, mutates the DOM, attaches refs, runs layout effects, swaps the tree pointer; schedules passive effects</td><td>Only the changed nodes</td></tr>
</tbody>
</table></div>
<p>
  The important line is the second. A state update low in the tree does not re-render the tree; it re-renders the
  component whose state changed and its descendants. Siblings of List, and the ancestors' own functions, are not called.
  When someone says "React re-renders everything", the accurate version is "React re-renders the subtree below the
  state change, unless something stops it". That is also why lifting state higher than necessary is the most common
  performance mistake: it moves the root of that subtree up.
</p>

<h3>Reconciling a list</h3>
<p>
  For a single child, the type and key comparison is all there is. For an array of children, React walks the old and new
  lists in step while keys match, which covers the common cases of appending and updating in place cheaply. At the first
  mismatch it puts the remaining old fibers in a map keyed by key (or by index when there are no keys), then looks each
  new element up in it. A match is reused, and may be marked for a move; anything left in the map afterwards is deleted.
  To decide what moved, React tracks the highest old index it has reused so far: an item whose old index is lower than
  that has moved and gets a placement flag, and the rest stay put. That is why moving the first item to the end moves
  one DOM node, but moving the last item to the front moves every other node, as traced in
  <a href="/react/react-lists-keys">lists and keys</a>.
</p>

<h3>Strict Mode and the render phase</h3>
<p>
  Because render may legitimately run more than once, React's development mode makes sure it does. Under Strict Mode it
  calls component functions, state initialisers, updater functions and <code>useMemo</code> calculations twice, and
  discards one result. A pure component cannot tell. A component that pushes to an outside array, increments a counter
  or starts a request during render shows the bug at once, as a doubled log or a doubled item. The second call does not
  happen in production; the reason for it does, because a concurrent render that is interrupted and restarted calls your
  component again with the same props. Strict Mode also mounts, unmounts and remounts each component once to exercise
  effect cleanups, which is the commit-side equivalent.
</p>

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

<h3>Pitfalls</h3>
<ul>
  <li><b>Side effects during render</b>: render can run twice, be abandoned, or be restarted.</li>
  <li><b>Defining components inside components</b>: a new type every render, so the subtree remounts.</li>
  <li><b>Changing a wrapper element's type</b> conditionally (<code>div</code> versus <code>section</code>) and losing state below it.</li>
  <li><b>Expecting two branches of a ternary to be different components</b>: same type at the same position keeps state; use a key.</li>
  <li><b>Reading refs during render</b>: they are attached in the commit's layout pass.</li>
  <li><b>Explaining React as "fast because of the virtual DOM"</b>: diffing is overhead; the win is the programming model and skipped work.</li>
  <li><b>Quoting the effect list</b> as how commit works today; React 18 replaced it with subtree flags.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>"The input loses focus on every keystroke": a component defined inside another, or a changing key.</li>
  <li>"Switching between two users keeps the old form values": same type at the same position; add a key.</li>
  <li>"My log runs twice in development": render purity under Strict Mode, not a bug in React.</li>
  <li>"Why do children's effects run before the parent's?": completion order of the walk.</li>
  <li>"Is React's diff O(n)?": yes, because of the type and key heuristics.</li>
</ul>

<h3>Interview questions</h3>
<p><b>1. What is Fiber and why did React introduce it?</b></p>
<p>
  Fiber is React's reconciler since version 16. Each component instance and host element is a fiber object linked by
  <code>child</code>, <code>sibling</code> and <code>return</code> pointers. The old reconciler recursed and could not
  stop part-way; walking a linked structure with an explicit pointer can pause, yield to the browser and resume, which
  is what time slicing, transitions, Suspense and streaming are built on.
</p>
<p class="sub">
  <i>Follow-up: what is the alternate?</i> Each fiber's counterpart in the other tree. React keeps the current tree and
  a work-in-progress tree, reuses fibers between them, and swaps the root pointer at commit, so an abandoned render
  never shows.
</p>
<p><b>2. Describe the render and commit phases.</b></p>
<p>
  Render calls components and computes what changed; it is pure, interruptible and may run more than once. Commit
  applies the changes in synchronous passes: before mutation, mutation (DOM updates), then layout (refs attached, layout
  effects). Passive effects from <code>useEffect</code> run after that, usually after paint.
</p>
<p><b>3. How does React diff in linear time?</b></p>
<p>
  Two heuristics: elements of different types produce different trees, so React replaces rather than compares them;
  and keys identify children across renders within a list. Without those, a general tree diff is cubic.
</p>
<p class="sub">
  <i>Follow-up: what goes wrong with index keys?</i> Insertions shift indices, so React matches the wrong old fiber to
  each new element, and state or DOM attributes stick to the wrong row.
</p>
<p><b>4. When does React skip rendering a component?</b></p>
<p>
  When the element is the same object as last time (children passed through), when a memoised component's props are
  shallow-equal, or when a state update produces the same value, in which case React may render once and then bail
  before committing. A bailout skips the whole subtree unless something below has pending work.
</p>
<p><b>5. In what order do components render and layout effects run for a nested tree?</b></p>
<p>
  Render is depth-first, parents before children, in begin order. Layout and passive effects run in completion order,
  children before parents, siblings left to right.
</p>
<p><b>6. A component deep in the tree calls <code>setState</code>. Which components render?</b></p>
<p>
  The component whose state changed and, by default, everything below it. React marks the path from that fiber to the
  root so the render can start at the top and bail out of every fiber with no work, descending only along the marked
  path. Siblings and ancestors are not called. Memoised descendants with equal props, and children passed in as
  elements, are skipped too.
</p>
<p class="sub">
  <i>Follow-up: so why does lifting state up hurt performance?</i> It moves the component that owns the state higher,
  and the subtree that re-renders on each change grows with it.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "If React can interrupt rendering, can it show a half-updated screen?" No. Only render is interruptible, and it
    builds a separate work-in-progress tree. The screen changes in commit, which is synchronous and applies the whole
    finished tree at once. An interrupted render is thrown away without ever being visible.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "Fiber replaced recursive reconciliation with a walk over linked fibers, so render became interruptible while
    commit stayed synchronous. That is why components must be pure and why concurrent features exist. React keeps a
    current and a work-in-progress tree and swaps them at commit. Diffing is linear because different types mean a new
    subtree and keys identify children. Commit finds work through bubbled subtree flags and runs in three passes, which
    is where refs and layout effects get their timing."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Fill in the render-versus-commit table from memory.</li>
    <li>Draw a fiber tree with child, sibling and return pointers.</li>
    <li>Trace begin and complete order for a five-node tree, and predict render and layout-effect order.</li>
    <li>Predict whether state survives for five kinds of change, and fix the ones that should not keep it.</li>
    <li>Explain double buffering and why an abandoned render is invisible.</li>
    <li>Name three ways React bails out of rendering.</li>
    <li>Explain where hook state lives on a fiber and why call order is all that identifies a hook.</li>
    <li>Say which components render after a <code>setState</code> deep in the tree, and why.</li>
    <li>Explain how commit finds work using subtree flags, and why the effect list is out of date.</li>
  </ul>
</div>`,
};
