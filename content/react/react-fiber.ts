import type { Chapter } from "../types";

export const reactFiber: Chapter = {
  id: "react-fiber",
  num: "A1",
  title: "Reconciliation & Fiber",
  short: "Fiber",
  levels: ["advanced"],
  practice: [],
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
  hooks, the effect list, and pointers to its <code>child</code>,
  <code>sibling</code> and <code>return</code> (parent).
</p>
<pre><code>{ type: Button, stateNode, memoizedProps, memoizedState,
  child, sibling, return, flags, alternate }</code></pre>
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
