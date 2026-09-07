import type { Chapter } from "../types";

export const reactEffectTiming: Chapter = {
  id: "react-effect-timing",
  num: "A8",
  title: "Effect timing",
  short: "Effect timing",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Four hooks that all run 'after render', at four different moments.",
  body: `<h3>The order, precisely</h3>
<ol>
  <li>React renders &mdash; your components run, producing the next tree.</li>
  <li><b>Commit:</b> the DOM is mutated. Refs are attached.</li>
  <li><b><code>useLayoutEffect</code></b> cleanups run, then its effects. Synchronously.</li>
  <li>React yields; the <b>browser paints</b>.</li>
  <li><b><code>useEffect</code></b> cleanups run, then its effects.</li>
</ol>
<p>
  Within each phase, <b>children run before parents</b> &mdash; a child's effect
  fires before its parent's, because a parent may depend on its children having
  set themselves up.
</p>

<div class="table-scroll"><table>
<thead><tr><th>Hook</th><th>Runs</th><th>Blocks paint</th><th>For</th></tr></thead>
<tbody>
<tr><td><code>useEffect</code></td><td>after paint</td><td>no</td><td>almost everything</td></tr>
<tr><td><code>useLayoutEffect</code></td><td>after DOM, before paint</td><td><span class="chip tone-bad">yes</span></td><td>measuring and adjusting</td></tr>
<tr><td><code>useInsertionEffect</code></td><td>before DOM mutations</td><td>yes</td><td>injecting styles &mdash; CSS-in-JS only</td></tr>
<tr><td>Ref callbacks</td><td>during commit</td><td>yes</td><td>reacting to a node existing</td></tr>
</tbody>
</table></div>

<h3>When useLayoutEffect is the right answer</h3>
<pre><code>useLayoutEffect(() =&gt; {
  const { height } = ref.current.getBoundingClientRect();
  setTooltipTop(anchorTop - height);       <span class="c">// before the user sees it</span>
}, [content]);</code></pre>
<p>
  With <code>useEffect</code>, the tooltip paints in the wrong place, then jumps.
  With <code>useLayoutEffect</code>, React blocks the paint, applies the
  correction, and the browser draws once &mdash; the intermediate state never
  reaches the screen.
</p>
<p>
  The rule: <b>if the user would see a flicker, it is a layout effect.</b>
  Measuring, scroll restoration, positioning a popover. Everything else &mdash;
  fetching, subscriptions, logging, timers &mdash; is a plain effect, because
  blocking paint for them is pure cost.
</p>

<div class="bx is-prim">
  <span class="ttl">It warns during server rendering</span>
  <p>
    <code>useLayoutEffect</code> cannot run on the server, so React warns when a
    component using it is server-rendered. Either the work belongs in
    <code>useEffect</code>, or the component should not render on the server.
    The common workaround &mdash; aliasing to <code>useEffect</code> on the
    server &mdash; hides the warning without fixing the flicker.
  </p>
</div>

<h3>Cleanup timing</h3>
<pre><code>useEffect(() =&gt; {
  connect(roomId);
  return () =&gt; disconnect(roomId);
}, [roomId]);</code></pre>
<p>
  Change <code>roomId</code> from A to B and the order is: <b>disconnect(A),
  then connect(B)</b>. The cleanup closes over the render that created it, so it
  disconnects the room it actually connected to &mdash; not the new one. That is
  why a cleanup reading current state rather than its own captured values is a
  bug.
</p>

<h3>Effects and refs</h3>
<pre><code>function Chart() {
  const ref = useRef(null);
  useEffect(() =&gt; {
    const chart = new ChartLib(ref.current);   <span class="c">// ✓ node exists by now</span>
    return () =&gt; chart.destroy();
  }, []);
  return &lt;div ref={ref} /&gt;;
}</code></pre>
<p>
  Refs are attached during commit, so any effect can rely on
  <code>ref.current</code>. During render it is <code>null</code>, which is why
  DOM work never belongs in the component body.
</p>

<h3>The order that surprises people</h3>
<pre><code>Parent renders
  Child renders
Child effect runs        <span class="c">// ← child first</span>
Parent effect runs</code></pre>
<p>
  A parent effect that measures a child can rely on the child having mounted and
  laid out. The reverse is not true: a child effect cannot assume its parent has
  finished setting up.
</p>

<h3>Strict Mode's double invocation</h3>
<p>
  In development React mounts, runs effects, runs cleanups, and runs the effects
  again. Anything that is not idempotent shows immediately &mdash; two socket
  connections, a doubled analytics event, two intervals. It is a detector, not a
  bug, and the same failure would appear in production the first time a user
  navigated away and back.
</p>

<h3>Escaping the timing entirely</h3>
<p>
  Effect-ordering questions are often a sign that the effect should not exist.
  Before reaching for <code>useLayoutEffect</code>, check whether the value can
  be derived during render, whether a <code>key</code> would reset the thing you
  are trying to synchronise, or whether CSS can do the positioning. The best fix
  for a timing problem is usually to remove the timing.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "<code>useLayoutEffect</code> runs after the DOM is updated but before paint,
    so it is for measuring and correcting layout where a plain effect would
    flicker; everything else belongs in <code>useEffect</code>, which runs after
    paint and does not block it. Within either phase children run before parents,
    and a cleanup sees the values of the render that created it."
  </p>
</div>`,
};
