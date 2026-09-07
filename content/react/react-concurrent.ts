import type { Chapter } from "../types";

export const reactConcurrent: Chapter = {
  id: "react-concurrent",
  num: "A2",
  title: "Concurrent features",
  short: "Concurrent",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Telling React which updates can wait — so the urgent one never queues behind them.",
  body: `<h3>The problem</h3>
<p>
  Type into a search box that filters ten thousand rows. Every keystroke sets
  two pieces of state: the input value, and the filtered list. React renders
  both together, the filtering takes 200ms, and the character you typed appears
  a fifth of a second later. The input feels broken.
</p>
<p>
  Nothing here is fixable by making the filter faster &mdash; the problem is that
  both updates were treated as equally urgent. Concurrent features let you say
  they are not.
</p>

<h3>startTransition</h3>
<pre><code>const [isPending, startTransition] = useTransition();

function handleChange(e) {
  setQuery(e.target.value);                    <span class="c">// urgent: show the character</span>
  startTransition(() =&gt; {
    setResults(filter(e.target.value));        <span class="c">// can wait, can be abandoned</span>
  });
}</code></pre>
<p>
  The input updates immediately. The list update runs at lower priority, and if
  another keystroke arrives mid-render React <b>throws that work away</b> and
  starts again with the newer value. You never render a list for a query the
  user has already moved past.
</p>
<p class="sub">
  <code>isPending</code> is true while the transition is in flight &mdash; use it
  to dim the stale results rather than to show a spinner. The old content
  staying visible is the point.
</p>

<h3>useTransition versus startTransition</h3>
<pre><code>const [isPending, startTransition] = useTransition();   <span class="c">// the hook</span>
import { startTransition } from "react";                 <span class="c">// the standalone</span></code></pre>
<div class="table-scroll"><table>
<thead><tr><th></th><th><code>useTransition</code></th><th><code>startTransition</code></th></tr></thead>
<tbody>
<tr><td>Gives you <code>isPending</code></td><td><span class="chip tone-yes">yes</span></td><td>no</td></tr>
<tr><td>Callable outside a component</td><td>no &mdash; it is a hook</td><td><span class="chip tone-yes">yes</span></td></tr>
<tr><td>Use it</td><td>when the UI shows pending state</td><td>in a store, a router, an event outside React</td></tr>
</tbody>
</table></div>
<pre><code>&lt;div style={{ opacity: isPending ? 0.6 : 1 }}&gt;
  &lt;Results items={results} /&gt;      <span class="c">// dim the stale list, do not blank it</span>
&lt;/div&gt;</code></pre>
<p>
  <code>isPending</code> is the reason to prefer the hook. Replacing the results
  with a spinner throws away content the user was reading; dimming it says
  "working" without taking anything away. That distinction is most of what makes
  a transition <em>feel</em> different from a loading state.
</p>
<p class="sub">
  Async work inside a transition keeps <code>isPending</code> true until the
  awaited work settles, so an action that saves and then updates state stays
  pending across the whole operation rather than flickering between the two.
</p>

<h3>useDeferredValue</h3>
<pre><code>const deferred = useDeferredValue(query);
const results = useMemo(() =&gt; filter(deferred), [deferred]);

&lt;input value={query} onChange={...} /&gt;      <span class="c">// always current</span>
&lt;Results items={results} /&gt;                 <span class="c">// lags behind, deliberately</span></code></pre>
<p>
  Same outcome from the other end. Instead of marking the update, you mark the
  <em>value</em>: React renders once with the old value at high priority, then
  again with the new one at low priority.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Use</th><th>When</th></tr></thead>
<tbody>
<tr><td><code>startTransition</code></td><td>You control the state update &mdash; you can wrap the setter</td></tr>
<tr><td><code>useDeferredValue</code></td><td>The value arrives as a prop, or the update is not yours to wrap</td></tr>
</tbody>
</table></div>

<div class="bx is-prim">
  <span class="ttl">Not a debounce</span>
  <p>
    A debounce waits a fixed time and hopes it is enough. A transition starts
    immediately and yields only when something more urgent appears &mdash; so on
    a fast machine the results are instant, and on a slow one the input still
    never stutters. It adapts; a 300ms timeout does not.
  </p>
</div>

<h3>&lt;Activity&gt;: keeping a subtree alive but hidden</h3>
<pre><code>&lt;Activity mode={tab === "chat" ? "visible" : "hidden"}&gt;
  &lt;ChatPanel /&gt;
&lt;/Activity&gt;</code></pre>
<p>
  Stable since React 19.2. A hidden Activity is not unmounted &mdash; its state,
  scroll position and DOM stay alive, its effects are torn down, and React
  renders it at the lowest priority in the background. Switching back is instant
  and nothing was lost.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Approach</th><th>State kept</th><th>Effects run</th><th>Cost</th></tr></thead>
<tbody>
<tr><td>Unmount it</td><td><span class="chip tone-bad">lost</span></td><td>no</td><td>rebuild on return</td></tr>
<tr><td><code>display: none</code></td><td>kept</td><td><span class="chip tone-bad">yes &mdash; still running</span></td><td>timers and subscriptions stay live</td></tr>
<tr><td><code>&lt;Activity mode="hidden"&gt;</code></td><td>kept</td><td>torn down</td><td>memory only</td></tr>
</tbody>
</table></div>
<p>
  The middle row is what most tab implementations do today, and it is why a
  hidden panel keeps polling. Activity is the first API that gives you "keep the
  state, stop the work" without writing it yourself &mdash; and it can pre-render
  a hidden route so the next navigation has nothing left to do.
</p>

<h3>Automatic batching</h3>
<pre><code>setA(1); setB(2);                            <span class="c">// one render, always</span>
setTimeout(() =&gt; { setA(1); setB(2); });     <span class="c">// one render since React 18</span>
fetch(url).then(() =&gt; { setA(1); setB(2); }); <span class="c">// one render since React 18</span></code></pre>
<p>
  Before 18, batching only happened inside React event handlers; updates in
  timeouts, promises and native handlers each rendered separately. Now
  everything batches. <code>flushSync</code> opts out for the rare case where you
  must read the DOM between two updates.
</p>

<h3>Transitions in routing</h3>
<pre><code>startTransition(() =&gt; navigate("/dashboard"));</code></pre>
<p>
  Wrapping a navigation keeps the current page interactive while the next one
  renders, rather than blanking to a spinner the moment the link is clicked.
  Modern routers do this for you; knowing why matters when you have to debug it.
</p>

<h3>The catch worth knowing</h3>
<p>
  A transition can be interrupted and restarted, so anything inside it may run
  more than once. That is fine for pure state updates and wrong for anything
  with a side effect &mdash; do not put a fetch or an analytics call inside
  <code>startTransition</code>.
</p>
<p>
  It also cannot help with a single synchronous block that is slow. Transitions
  let React yield <em>between</em> units of work; one component that spends
  300ms in a loop still blocks, because there is no yield point inside it. Fix
  that with memoisation, virtualisation, or a Web Worker.
</p>

<h3>Where this shows up without you asking</h3>
<ul>
  <li><b>Suspense</b> uses transitions to avoid replacing visible content with a fallback.</li>
  <li><b>Server Components</b> stream in at transition priority.</li>
  <li><b>Framework routers</b> wrap navigation in one already.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Concurrent features are a priority system: <code>startTransition</code> marks
    an update as interruptible so an urgent one — a keystroke — is never queued
    behind it, and React abandons in-progress low-priority work when newer input
    arrives. It is not a debounce, because it yields on demand rather than
    waiting a fixed time."
  </p>
</div>`,
};
