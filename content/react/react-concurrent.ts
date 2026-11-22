import type { Chapter } from "../types";

export const reactConcurrent: Chapter = {
  id: "react-concurrent",
  num: "A2",
  title: "Concurrent features",
  short: "Concurrent",
  levels: ["advanced"],
  prerequisites: ["react-fiber", "react-memoisation", "react-effects-depth"],
  practice: ["ex-comp-transition-pending-search", "ex-comp-deferred-value-list"],
  ready: true,
  subtitle: "Telling React which updates can wait — so the urgent one never queues behind them.",
  body: `<p>
  Concurrent rendering is React's ability to prepare more than one version of the UI and to stop work part-way when
  something more urgent arrives. <a href="/react/react-fiber">Fiber</a> made it possible; the APIs in this chapter are
  how you use it. They do one thing: tell React which updates can wait. The chapter covers the problem they solve,
  <code>useTransition</code> and <code>startTransition</code>, async transitions, <code>useDeferredValue</code>,
  <code>&lt;Activity&gt;</code>, automatic batching, how interruption works in milliseconds and where it cannot help,
  and how to read it in DevTools. Render sequences quoted were checked against React 19.3.
</p>

<h3>The problem</h3>
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

<h3>Worked example: what renders, and in what order</h3>
<p>
  A transition is not a delay. It splits one update into two renders at different priorities. Checked with a tab
  switch wrapped in <code>startTransition</code> from <code>useTransition</code>:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Render</th><th>Priority</th><th><code>tab</code></th><th><code>isPending</code></th><th>Purpose</th></tr></thead>
<tbody>
<tr><td>1</td><td>urgent</td><td>"home" (old)</td><td>true</td><td>Show that something is happening, immediately</td></tr>
<tr><td>2</td><td>transition</td><td>"settings" (new)</td><td>false</td><td>The real update, interruptible</td></tr>
</tbody>
</table></div>
<p>
  The first render is cheap: same data, one flag flipped, so the button can show a pending style within a frame. The
  second is where the expensive work happens, and it is the one React can abandon. If the user clicks another tab while
  render 2 is in progress, React discards it and starts a transition render for the newer tab; the abandoned one never
  reaches the screen.
</p>
<p>
  Now the keystroke case from the problem statement, with a slow results list and a transition around the results
  update. Suppose rendering the list takes 200 ms and the user types "r", "e", "a" 80 ms apart.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Time</th><th>Event</th><th>Urgent render</th><th>Transition render</th></tr></thead>
<tbody>
<tr><td>0 ms</td><td>type "r"</td><td>input shows "r"</td><td>starts list for "r"</td></tr>
<tr><td>80 ms</td><td>type "e"</td><td>React yields at its next slice; input shows "re"</td><td>"r" abandoned; starts list for "re"</td></tr>
<tr><td>160 ms</td><td>type "a"</td><td>input shows "rea"</td><td>"re" abandoned; starts list for "rea"</td></tr>
<tr><td>360 ms</td><td>(idle)</td><td>&ndash;</td><td>list for "rea" commits</td></tr>
</tbody>
</table></div>
<p>
  Without the transition the same typing commits three full lists, one after another, and each keystroke waits up to
  200 ms for the previous list to finish: the last character appears around 600 ms. With it, every character appears
  within a time slice and only the final list is ever committed. The numbers are illustrative; the shape is what
  matters, and it depends on the list being many components that React can yield between.
</p>
<figure>
  <svg viewBox="0 0 760 200" class="dg" role="img" aria-label="Urgent updates such as typing run on their own lane and commit right away. Transition updates run on a lower lane in slices; when an urgent update arrives, the in-progress transition render is abandoned and restarted with the newer value.">
    <g class="rough">
      <rect class="box" x="20" y="30" width="140" height="44" rx="8" />
      <rect class="box" x="300" y="30" width="140" height="44" rx="8" />
      <rect class="box" x="580" y="30" width="140" height="44" rx="8" />
      <rect class="boxg" x="20" y="120" width="240" height="44" rx="8" />
      <rect class="boxg" x="300" y="120" width="420" height="44" rx="8" />
      <path class="ln" d="M260 142 H294" marker-end="url(#arrow)" />
      <path class="ln" d="M370 74 V114" marker-end="url(#arrow)" />
    </g>
    <text class="lbl" x="90" y="57" text-anchor="middle">type "r"</text>
    <text class="lbl" x="370" y="57" text-anchor="middle">type "e"</text>
    <text class="lbl" x="650" y="57" text-anchor="middle">commit list</text>
    <text class="sm" x="140" y="146" text-anchor="middle">list for "r" (abandoned)</text>
    <text class="sm" x="510" y="146" text-anchor="middle">list for "re", in slices, then commit</text>
    <text class="sm" x="380" y="100" text-anchor="start">interrupts</text>
  </svg>
  <figcaption>
    Urgent updates commit straight away. Transition work runs in slices underneath them and is thrown away when it is
    already out of date.
  </figcaption>
</figure>

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

<h3>Async transitions and Actions</h3>
<p>
  Since React 19, the function passed to <code>startTransition</code> can be async. React calls such a function an
  Action, and keeps <code>isPending</code> true until it settles.
</p>
<pre><code>function SaveButton({ draft }) {
  const [isPending, startTransition] = useTransition();
  return (
    &lt;button
      disabled={isPending}
      onClick={() =&gt;
        startTransition(async () =&gt; {
          const saved = await saveDraft(draft);
          startTransition(() =&gt; setStatus(saved.status));
        })
      }
    &gt;
      {isPending ? "Saving…" : "Save"}
    &lt;/button&gt;
  );
}</code></pre>
<p>
  Checked: after starting the action the component showed pending; when the awaited promise resolved, it rendered once
  more still pending, then with the new status and pending false. Note the inner <code>startTransition</code>. State
  updates that happen after an <code>await</code> are not automatically part of the transition, because JavaScript loses
  the async context React would need to know which transition they belong to. Wrap them again, as above, or they are
  treated as urgent updates. Forms that pass a function to <code>action</code> and the <code>useActionState</code> hook
  build on the same mechanism; <a href="/react/react-server-actions">Server Actions</a> covers them.
</p>

<h3>useDeferredValue</h3>
<pre><code>const deferred = useDeferredValue(query);
const results = useMemo(() =&gt; filter(deferred), [deferred]);

&lt;input value={query} onChange={...} /&gt;      <span class="c">// always current</span>
&lt;Results items={results} /&gt;                 <span class="c">// lags behind, deliberately</span></code></pre>
<p>
  Same outcome from the other end. Instead of marking the update, you mark the
  <em>value</em>: React renders once with the old value at high priority, then
  again with the new one at low priority. Checked: changing the query from "a" to
  "ab" rendered with <i>query ab, deferred a</i>, then <i>query ab, deferred ab</i>.
</p>
<p>
  The first of those renders is only cheap if the slow part sees an unchanged
  value. That is why the example memoises the filter on <code>deferred</code>, or
  wraps <code>Results</code> in <code>memo</code>: in the urgent render the
  deferred value is the same as before, so the expensive work is skipped. Without
  that, the urgent render does the slow work anyway and nothing is gained. Since
  React 19 it also takes an initial value, <code>useDeferredValue(value,
  initialValue)</code>; checked, the first render used the initial value and a
  second, background render used the real one, which is useful for showing a cheap
  placeholder on mount.
</p>
<p>
  Comparing <code>query !== deferred</code> tells you a background render is
  pending, the deferred equivalent of <code>isPending</code>: use it to dim the
  stale results.
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
  <p>
    A debounce still has a place when the cost is outside React, such as a network
    request per keystroke: a transition makes rendering cheap to abandon, but it
    cannot un-send a request. Debounce the request, and let the rendering of its
    results be a transition.
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

<h3>What "interruptible" means in milliseconds</h3>
<p>
  React works in slices of roughly five milliseconds, then checks whether it
  should yield. If the browser has input waiting, React stops, lets the browser
  handle it, and resumes afterwards &mdash; possibly discarding what it had if
  that input made the work irrelevant.
</p>
<p>
  Which sets the limit. React can only yield <b>between</b> units of work. One
  component that spends 300ms in a single synchronous loop offers no yield
  point, so a transition cannot help it. The fix there is to make the unit
  smaller: memoise the calculation, virtualise the list, or move the work to a
  Web Worker.
</p>

<h3>Reading it in DevTools</h3>
<p>
  React 19.2 adds custom tracks to the Chrome performance panel: a
  <b>Scheduler</b> track showing which priority React was working at, and a
  <b>Components</b> track showing render and effect phases per component.
</p>
<p>
  What to look for: a long unbroken block at high priority is work that should
  have been a transition; repeated identical renders in the Components track is
  something re-rendering that did not need to. Both are visible there and
  nowhere else.
</p>

<h3>Separate transitions stay separate, since React 19.3</h3>
<p>
  Until 19.3, React entangled concurrent transitions into a single render. Start a
  slow one &mdash; a filter over a large list &mdash; and then a quick one &mdash;
  switching a tab &mdash; and the tab switch could not commit until the filter was
  finished too.
</p>
<pre><code>startTransition(() =&gt; setFilter(q));        <span class="c">// slow: re-renders 10,000 rows</span>
startTransition(() =&gt; setTab("settings"));  <span class="c">// fast: no longer waits for the filter</span></code></pre>
<p>
  React 19.3 renders transitions independently, so a slow transition no longer
  holds up unrelated ones. Nothing in your code changes. What changes is the
  debugging: if you profiled an app on 19.2 and saw a quick update stuck behind a
  slow one, that was the entanglement, and upgrading is the fix.
</p>

<h3>Concurrency and outside data: tearing</h3>
<p>
  An interruptible render has a risk a synchronous one does not. If a component reads a value from outside React (a
  global store, a mutable object, <code>window.location</code>) and the render pauses half-way, the outside value can
  change before the rest of the tree reads it. Components rendered before the pause show the old value, components after
  show the new one, and the committed screen is inconsistent. This is called tearing.
</p>
<p>
  React's own state cannot tear, because updates are queued and applied to a whole render at once. External stores need
  <a href="/react/react-sync-external-store">useSyncExternalStore</a>, which reads a snapshot, detects that it changed
  during a concurrent render, and re-renders synchronously so every component sees the same value. That is why state
  libraries moved onto it when React 18 shipped, and why reading a mutable global directly during render is a bug in a
  concurrent app even if it appeared to work before.
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

<h3>What priority each update gets</h3>
<p>
  You only choose priority explicitly for transitions. Everything else gets a lane from where the update came from, and
  knowing the defaults explains a lot of behaviour.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Where <code>setState</code> was called</th><th>Lane, roughly</th><th>Rendered</th></tr></thead>
<tbody>
<tr><td>A discrete event handler: click, key press, input, submit</td><td>Synchronous</td><td>Before the browser handles the next event, without yielding</td></tr>
<tr><td>A continuous event: scroll, pointer move, drag</td><td>Continuous</td><td>Soon, batched across frames</td></tr>
<tr><td>Outside events: a timeout, a promise, a socket message</td><td>Default</td><td>In the next task, can be time-sliced</td></tr>
<tr><td>Inside <code>startTransition</code></td><td>Transition</td><td>In slices, interruptible by anything above</td></tr>
<tr><td>The second render of <code>useDeferredValue</code></td><td>Deferred</td><td>After urgent work</td></tr>
<tr><td>A hidden <code>&lt;Activity&gt;</code></td><td>Offscreen, the lowest</td><td>When nothing else is waiting</td></tr>
</tbody>
</table></div>
<p>
  The first row is why a controlled input never lags because of React's scheduling: its update is synchronous by
  definition. If an input does lag, something expensive is rendering in the same synchronous update, and moving that
  part to a transition or a deferred value is the fix. The third row is why data arriving over a socket does not block a
  keystroke typed at the same moment.
</p>

<h3>Transitions and Suspense</h3>
<p>
  Transitions change what Suspense does. When an urgent update causes a component to suspend, React shows the nearest
  fallback, replacing content that was on screen. When a transition causes it, React keeps the old content visible
  instead and waits for the data, with <code>isPending</code> true in the meantime. That is how a router can click to a
  page whose data is loading and keep the current page up, dimmed, rather than flashing a skeleton.
  <a href="/react/react-suspense">Suspense</a> traces both cases.
</p>

<h3>Where this shows up without you asking</h3>
<ul>
  <li><b>Suspense</b> uses transitions to avoid replacing visible content with a fallback.</li>
  <li><b>Server Components</b> stream in at transition priority.</li>
  <li><b>Framework routers</b> wrap navigation in one already.</li>
</ul>

<h3>Deciding what is urgent</h3>
<p>
  The API is simple; the judgement is in choosing what goes inside it. A rule that works: <b>an update is urgent if the
  user is directly manipulating the thing it changes</b>. Typing into an input, dragging a slider, toggling a checkbox,
  opening a menu: the user expects the control itself to respond within a frame, and any delay reads as broken. An update
  is a transition candidate if it changes a <em>consequence</em> of that manipulation: the results of a search, the
  chart a filter drives, the page a link leads to, the panel behind a tab.
</p>
<p>
  Two practical corollaries. A single interaction often produces both kinds, so split it: the slider's value is urgent,
  the expensive chart it drives is a transition. And navigation is almost always a transition, which is why routers wrap
  it for you: the user would rather keep looking at the current page for a moment than see it replaced by a spinner.
</p>

<h3>Worked example: one search page, three versions</h3>
<pre><code><span class="c">// A: everything urgent. Each keystroke waits for the list.</span>
function SearchA({ items }) {
  const [query, setQuery] = useState("");
  const results = filterItems(items, query);
  return (&lt;&gt;
    &lt;input value={query} onChange={(e) =&gt; setQuery(e.target.value)} /&gt;
    &lt;ResultList results={results} /&gt;
  &lt;/&gt;);
}

<span class="c">// B: the derived update is a transition, with pending feedback.</span>
function SearchB({ items }) {
  const [query, setQuery] = useState("");
  const [shownQuery, setShownQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const results = useMemo(() =&gt; filterItems(items, shownQuery), [items, shownQuery]);
  function onChange(e) {
    setQuery(e.target.value);
    startTransition(() =&gt; setShownQuery(e.target.value));
  }
  return (&lt;&gt;
    &lt;input value={query} onChange={onChange} /&gt;
    &lt;div style={{ opacity: isPending ? 0.6 : 1 }}&gt;&lt;ResultList results={results} /&gt;&lt;/div&gt;
  &lt;/&gt;);
}

<span class="c">// C: one piece of state, a deferred copy for the slow part.</span>
function SearchC({ items }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() =&gt; filterItems(items, deferredQuery), [items, deferredQuery]);
  const stale = query !== deferredQuery;
  return (&lt;&gt;
    &lt;input value={query} onChange={(e) =&gt; setQuery(e.target.value)} /&gt;
    &lt;div style={{ opacity: stale ? 0.6 : 1 }}&gt;&lt;ResultList results={results} /&gt;&lt;/div&gt;
  &lt;/&gt;);
}</code></pre>
<p>
  B and C behave the same for the user. C is usually the better code: one source of truth for the query, no second
  piece of state that could drift, and the urgency decision lives next to the slow part rather than in the handler. B is
  the right shape when the update is not a value you can defer, such as switching to a different data set or navigating.
  In both, the <code>useMemo</code> matters: it is what makes the urgent render cheap, because the slow filter sees an
  unchanged input during it. If <code>ResultList</code> itself is the expensive part, wrap it in <code>memo</code> for the
  same reason.
</p>

<h3>Testing concurrent code</h3>
<p>
  Tests run updates inside <code>act</code>, which flushes all pending work, transitions included, before it returns.
  So a test sees the final state and cannot observe interruption; that is a property of the scheduler, not something to
  assert on. What tests can and should check is the visible sequence: that the input shows the typed value at once, that
  a pending indicator appears while an async action is in flight (resolve the promise inside a second
  <code>act</code>), and that the final results are right. Interruption itself is verified in the browser, with the
  performance tracks described above and a throttled CPU.
</p>

<h3>View transitions build on this</h3>
<p>
  <code>&lt;ViewTransition&gt;</code>, stable since React 19.3, animates elements entering, leaving and moving using the
  browser's View Transition API. It only animates updates that happen inside a transition (or a Suspense reveal or
  deferred value), because those are the updates React renders off screen and can commit as one coordinated change. An
  urgent <code>setState</code> from a click commits immediately and is not animated. If an animation does not run, the
  first thing to check is whether the update was wrapped in <code>startTransition</code>. The
  <a href="/react/react-animation">animation chapter</a> covers it in use.
</p>

<h3>Pitfalls</h3>
<ul>
  <li><b>Wrapping the input's own state in a transition</b>: the controlled input then lags, which is the opposite of the goal.</li>
  <li><b>Side effects inside <code>startTransition</code></b>: the render may be restarted; the callback should only set state (or await, in an Action).</li>
  <li><b>State updates after <code>await</code> without another <code>startTransition</code></b>: they become urgent.</li>
  <li><b><code>useDeferredValue</code> without memoising the slow part</b>: the urgent render still does the expensive work.</li>
  <li><b>Expecting a transition to fix one slow component</b>: there is no yield point inside a single long function.</li>
  <li><b>Replacing content with a spinner during a transition</b> instead of dimming it with <code>isPending</code>.</li>
  <li><b>Using a debounce and a transition together by habit</b>: the transition already adapts to the device.</li>
  <li><b>Hiding tabs with <code>display: none</code></b> and leaving their effects running; <code>&lt;Activity&gt;</code> stops them.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>"Typing lags when the list is long": the list update should be a transition, or render from a deferred value.</li>
  <li>"The results flash a spinner on every keystroke": use <code>isPending</code> to keep and dim the old content.</li>
  <li>"The tab switch waits for a slow filter to finish" on 19.2: transition entanglement, fixed in 19.3.</li>
  <li>"My status update after saving is not part of the pending state": an update after <code>await</code> outside a transition.</li>
  <li>"The hidden panel keeps polling": <code>display: none</code> instead of <code>&lt;Activity&gt;</code>.</li>
  <li>"The view transition does not animate": the update was urgent, not inside a transition.</li>
</ul>

<h3>Interview questions</h3>
<p><b>1. What problem do transitions solve?</b></p>
<p>
  Urgent updates queuing behind expensive ones. Marking an update as a transition gives it a lower-priority lane, so
  React renders it in interruptible slices and lets urgent updates such as typing commit first. Work that is outdated
  before it finishes is discarded rather than committed.
</p>
<p class="sub">
  <i>Follow-up: how is that different from debouncing?</i> A debounce always waits a fixed time, even on a fast device,
  and still blocks if the work is slow when it runs. A transition starts at once and yields only when something more
  urgent is waiting.
</p>
<p><b>2. <code>useTransition</code> or <code>useDeferredValue</code>?</b></p>
<p>
  <code>useTransition</code> when you own the state update and can wrap the setter, and want <code>isPending</code>.
  <code>useDeferredValue</code> when you receive the value, for example as a prop, and want a lagging copy for the slow
  part of the tree. Both produce an urgent render and a deferred one.
</p>
<p><b>3. What does <code>isPending</code> look like across renders?</b></p>
<p>
  The urgent render has the old state and <code>isPending</code> true; the transition render has the new state and
  <code>isPending</code> false. For an async action it stays true until the action settles.
</p>
<p><b>4. When can a transition not help?</b></p>
<p>
  When the cost is one long synchronous block, such as a single component looping for 300 ms: React only yields between
  units of work. Make the unit smaller, memoise, virtualise or move the work to a Web Worker.
</p>
<p class="sub">
  <i>Follow-up: what is automatic batching?</i> Since React 18, all state updates in the same task are rendered
  together, including in timeouts and promises; <code>flushSync</code> forces an immediate render when you must read
  the DOM in between.
</p>
<p><b>5. What does <code>&lt;Activity&gt;</code> do that conditional rendering does not?</b></p>
<p>
  A hidden Activity keeps its state and DOM but tears down its effects and renders at the lowest priority, so switching
  back is instant without hidden work running. Unmounting loses state; <code>display: none</code> keeps effects running.
</p>
<p><b>6. A controlled input lags when a chart on the same page is large. Which part do you change?</b></p>
<p>
  Not the input. Its update comes from a discrete event and is already the highest priority; it lags because the chart
  renders in the same synchronous update. Make the chart read a deferred copy of the value, memoised so the urgent render
  skips it, or put the chart's state update in a transition. Then measure: if one chart component is a single long
  block, it also needs to be made cheaper.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "Should the text input's <code>setQuery</code> go inside <code>startTransition</code> too, so everything is
    non-blocking?" No. A controlled input must update urgently, or React may show an older value than the user typed and
    the cursor jumps. Keep the input's state urgent and put only the expensive derived update in the transition, or
    render the expensive part from <code>useDeferredValue(query)</code>.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "Concurrent features are a priority system. <code>startTransition</code> marks an update as interruptible, so urgent
    updates like keystrokes never queue behind it, and React drops in-progress work that newer input has made
    irrelevant. <code>useTransition</code> adds <code>isPending</code>, which I use to dim stale content rather than
    blank it, and <code>useDeferredValue</code> does the same from the value side. It is not a debounce, and it cannot
    split one slow function; that needs memoisation, virtualisation or a worker."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Trace the two renders of a transition and say what <code>isPending</code> is in each.</li>
    <li>Trace three fast keystrokes with and without a transition around a slow list.</li>
    <li>Choose between <code>useTransition</code> and <code>useDeferredValue</code> for three situations.</li>
    <li>Make <code>useDeferredValue</code> actually save work by memoising the slow part.</li>
    <li>Write an async action whose post-<code>await</code> update stays in the transition.</li>
    <li>Compare unmounting, <code>display: none</code> and <code>&lt;Activity&gt;</code> for a hidden tab.</li>
    <li>Explain why a transition cannot help one slow component, and what does.</li>
    <li>Explain tearing and why external stores need <code>useSyncExternalStore</code>.</li>
  </ul>
</div>`,
};
