import type { Chapter } from "../types";

export const reactAnimation: Chapter = {
  id: "react-animation",
  num: "I17",
  title: "Animation and transitions",
  short: "Animation",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "CSS first, a library when you need interruption, and the one case React makes hard.",
  body: `<h3>The hard part is unmounting</h3>
<p>
  Mounting animation is easy: the element appears, CSS animates it in. Unmounting
  is the problem. React removes the node the moment the condition flips, so
  there is nothing left to animate out.
</p>
<pre><code>{open &amp;&amp; &lt;Panel /&gt;}   <span class="c">// close it and the node is gone this frame</span></code></pre>
<p>
  Every animation library you have heard of exists mostly to solve this one
  thing: keep the element mounted a bit longer than the state says, then remove
  it. Everything else &mdash; springs, gestures, layout &mdash; is on top.
</p>

<h3>Level 1: CSS, which covers most of it</h3>
<pre><code>&lt;div className={"panel " + (open ? "is-open" : "")}&gt;…&lt;/div&gt;</code></pre>
<pre><code>.panel { opacity: 0; transform: translateY(8px); transition: opacity .18s, transform .18s; }
.panel.is-open { opacity: 1; transform: none; }</code></pre>
<p>
  The element is always mounted; only a class changes. Both directions animate,
  it costs nothing, and it runs on the compositor. If the content must not be in
  the DOM when hidden, add <code>visibility: hidden</code> at the end of the
  transition &mdash; or reach for the next level.
</p>
<div class="bx is-prim">
  <span class="ttl">Animate only two properties</span>
  <p>
    <code>transform</code> and <code>opacity</code> are handled by the compositor
    &mdash; no layout, no paint, and they keep running even when the main thread
    is busy. Animating <code>width</code>, <code>top</code>, <code>height</code>
    or <code>margin</code> re-runs layout on every frame of every animation on the
    page. If you need a size change, animate <code>scale</code> and correct the
    contents, or use <code>grid-template-rows: 0fr → 1fr</code>, which modern
    browsers handle far better than <code>height</code>.
  </p>
</div>

<h3>Level 2: keep it mounted yourself</h3>
<pre><code>function useDelayedUnmount(open, ms = 200) {
  const [mounted, setMounted] = useState(open);

  useEffect(() =&gt; {
    if (open) { setMounted(true); return; }
    const t = setTimeout(() =&gt; setMounted(false), ms);
    return () =&gt; clearTimeout(t);
  }, [open, ms]);

  return mounted;
}

const mounted = useDelayedUnmount(open);
return mounted ? &lt;div className={"panel " + (open ? "is-open" : "")}&gt;…&lt;/div&gt; : null;</code></pre>
<p>
  Thirty lines less than a library and it is exactly enough for a modal, a
  dropdown or a toast. The timeout must match the CSS duration &mdash; a real
  coupling, and the reason people eventually move to level 3.
</p>
<p class="sub">
  You can drop the guesswork with <code>onTransitionEnd</code>, but it fires per
  property and does not fire at all if the element never got a chance to
  transition. The timeout is more robust than it looks.
</p>

<h3>Level 3: a library, when the state can change mid-flight</h3>
<p>
  The moment a user can close a panel while it is still opening, hand-rolled CSS
  starts fighting you: the class flips, the transition restarts from wherever it
  was, and reversals look wrong. That is what motion libraries buy you &mdash;
  <b>interruptible, velocity-preserving</b> animation.
</p>
<pre><code>import { AnimatePresence, motion } from "motion/react";

&lt;AnimatePresence&gt;
  {open &amp;&amp; (
    &lt;motion.div
      key="panel"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    /&gt;
  )}
&lt;/AnimatePresence&gt;</code></pre>
<p>
  <code>AnimatePresence</code> is the delayed unmount, done properly: it holds
  the child in the tree until <code>exit</code> finishes. The <code>key</code> is
  what tells it "this is a different thing" &mdash; get it wrong and you get a
  crossfade where you wanted a swap.
</p>

<h3>The layout animation trick worth knowing</h3>
<p>
  Moving an element between two positions is FLIP &mdash; <b>First, Last, Invert,
  Play</b>. Measure where it is, let it land in its new place, apply a transform
  that puts it visually back where it was, then animate that transform to zero.
  All of it in <code>transform</code>, so it stays on the compositor.
</p>
<pre><code>useLayoutEffect(() =&gt; {
  const next = el.getBoundingClientRect();
  const dx = prev.current.left - next.left;
  const dy = prev.current.top - next.top;
  if (dx || dy) {
    el.animate([{ transform: \`translate(\${dx}px, \${dy}px)\` }, { transform: "none" }], {
      duration: 200, easing: "ease-out",
    });
  }
  prev.current = next;
});</code></pre>
<p>
  <code>useLayoutEffect</code> is non-negotiable here &mdash; you must read the
  new box and apply the inverse before the browser paints, or the element flashes
  in its new spot first. Framer's <code>layout</code> prop is this, generalised.
</p>

<h3>View Transitions, and React's <code>&lt;ViewTransition&gt;</code></h3>
<p>
  The browser can snapshot the page before and after a DOM change and cross-fade
  between them &mdash; including elements that moved, by matching
  <code>view-transition-name</code>.
</p>
<pre><code>document.startViewTransition(() =&gt; { <span class="c">/* mutate the DOM */</span> });</code></pre>
<p>
  React's experimental <code>&lt;ViewTransition&gt;</code> wires this to updates
  marked with <code>startTransition</code>, so a route change animates without you
  measuring anything. It is behind the experimental channel &mdash; know it exists,
  do not put it in production code yet. In Next's App Router the same idea shows
  up as the view-transitions flag.
</p>

<h3>The accessibility line</h3>
<pre><code>@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}</code></pre>
<pre><code><span class="c">// and in JS, when a library needs telling</span>
const QUERY = "(prefers-reduced-motion: reduce)";

const reduced = useSyncExternalStore(
  (cb) =&gt; {
    const m = matchMedia(QUERY);
    m.addEventListener("change", cb);
    return () =&gt; m.removeEventListener("change", cb);
  },
  () =&gt; matchMedia(QUERY).matches,
  () =&gt; false,   <span class="c">// server: assume motion is fine, CSS corrects it</span>
);</code></pre>
<p>
  Reduce, do not remove. An instant state change with no motion at all can be more
  disorienting than a slow one; a fast opacity fade is the usual compromise.
</p>

<h3>Where it goes wrong</h3>
<div class="table-scroll"><table>
<thead><tr><th>Symptom</th><th>Cause</th></tr></thead>
<tbody>
<tr><td>Enter animation never plays</td><td>The element mounts already in its final state &mdash; there was no frame at the start value. Mount with the initial class, flip on the next frame.</td></tr>
<tr><td>Exit animation never plays</td><td>Nothing is holding the node in the tree.</td></tr>
<tr><td>Janky while a list renders</td><td>You animated a layout property, or the main thread is blocked. Check the Performance panel for purple layout bars.</td></tr>
<tr><td>Reversal jumps</td><td>CSS transitions restart from the current computed value but with the full duration. Springs handle this; transitions do not.</td></tr>
<tr><td>Animates on first paint after SSR</td><td>The server HTML has the final class already. Gate on a mounted flag.</td></tr>
<tr><td>Whole list re-animates on any change</td><td>Keys changed &mdash; usually an index key, or a new array identity feeding a keyed <code>AnimatePresence</code>.</td></tr>
</tbody>
</table></div>

<h3>Choosing</h3>
<div class="table-scroll"><table>
<thead><tr><th>Need</th><th>Reach for</th></tr></thead>
<tbody>
<tr><td>Hover, focus, a class flip</td><td>CSS transition. Always.</td></tr>
<tr><td>Modal or dropdown in and out</td><td>CSS + a delayed unmount hook</td></tr>
<tr><td>Interruptible, gesture-driven, springs</td><td>Motion (Framer), or the Web Animations API directly</td></tr>
<tr><td>Elements moving between layouts</td><td>FLIP, or <code>layout</code> props</td></tr>
<tr><td>Page or route transitions</td><td>View Transitions API</td></tr>
<tr><td>Timeline-heavy, scroll-driven storytelling</td><td>GSAP, or CSS scroll-driven animations</td></tr>
</tbody>
</table></div>

<div class="bx is-ref">
  <span class="ttl">Interview line</span>
  <p>
    "React does not animate &mdash; it mounts and unmounts. Enter is CSS; exit
    needs something to keep the node alive past the state change. I do that with a
    small delayed-unmount hook, and reach for a motion library only when the
    animation has to be interruptible."
  </p>
</div>`,
};
