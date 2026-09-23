import type { Chapter } from "../types";

export const reactEffectTiming: Chapter = {
  id: "react-effect-timing",
  num: "A8",
  title: "Effect timing",
  short: "Effect timing",
  levels: ["advanced"],
  practice: ["ex-react-effect-order", "ex-comp-verify-effect-order"],
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

<h3>See where your code lands</h3>
<div class="demo" id="et">
  <div class="demo__bar">One update, five phases</div>
  <div class="demo__body">
    <p>
      <label>Which hook are you using?
        <select id="et-kind">
          <option value="layout">useLayoutEffect</option>
          <option value="passive">useEffect</option>
        </select>
      </label>
    </p>
    <div class="viz-lane" id="et-lane"></div>
    <div class="demo__ctl">
      <button class="btn" id="et-next" type="button">Next phase →</button>
      <button class="btn btn--ghost" id="et-reset" type="button">Reset</button>
    </div>
    <p class="demo__note" id="et-note" aria-live="polite"></p>
  </div>
</div>
<script>
(function () {
  var PHASES = [
    { k: "render", label: "1. Render", text: "React calls your component. It is pure: nothing on screen has changed yet." },
    { k: "commit", label: "2. Commit", text: "React updates the DOM. The new markup exists, but the browser has not drawn it." },
    { k: "layout", label: "3. Layout effects", text: "useLayoutEffect runs now, synchronously, and the browser is blocked until it returns." },
    { k: "paint", label: "4. Paint", text: "The browser draws the frame. This is the first moment the user can see the new DOM." },
    { k: "passive", label: "5. Passive effects", text: "useEffect runs now, normally after paint, so it never delays the frame." }
  ];
  var at = 0;
  var kind = document.getElementById("et-kind");
  var lane = document.getElementById("et-lane");
  var note = document.getElementById("et-note");
  var next = document.getElementById("et-next");

  function outcome() {
    return kind.value === "layout"
      ? "Your effect ran before paint. If it measured the DOM and moved something, the user never saw the wrong position. The cost: the frame waited for you."
      : "Your effect ran after paint. The user may have seen one frame of the old layout before your change landed. That is fine for fetching, subscriptions and logging, and wrong for measure-and-reposition.";
  }
  function render() {
    lane.innerHTML = PHASES.map(function (p, idx) {
      var cls = "viz-phase";
      if (idx <= at) cls += " is-reached";
      if (idx === at) cls += " is-current";
      if (p.k === kind.value) cls += " is-yours";
      return '<div class="' + cls + '"><b>' + p.label + "</b></div>";
    }).join("");
    note.textContent = PHASES[at].text + (at === PHASES.length - 1 ? " " + outcome() : "");
    next.disabled = at === PHASES.length - 1;
  }
  next.addEventListener("click", function () { if (at < PHASES.length - 1) { at++; render(); } });
  document.getElementById("et-reset").addEventListener("click", function () { at = 0; render(); });
  kind.addEventListener("change", function () { at = 0; render(); });
  render();
})();
</script>

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
<p class="sub">
  Until React 19.3, a root that was <b>hydrated</b> from server HTML skipped this
  double run, while a client-rendered root did it &mdash; so an effect bug could
  hide in an SSR app and show in a client-only one. Since 19.3 Strict Mode double
  invokes effects during hydration too. An upgrade can therefore surface a doubled
  socket or analytics call that was always there.
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
