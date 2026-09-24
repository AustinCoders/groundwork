import type { Chapter } from "../types";

export const performance: Chapter = {
  id: "performance",
  num: "A6",
  title: "Performance",
  short: "Performance",
  levels: ["advanced"],
  practice: ["ex-bounded-cache", "ex-process-in-batches"],
  ready: true,
  subtitle: "Making a page feel fast is a different skill than making code run fast.",
  body: `<h3>The critical rendering path</h3>
<p>
  What actually has to happen before a browser can paint a single
  pixel: download the HTML, parse it into a <b>DOM</b>, download and
  parse CSS into a <b>CSSOM</b>, combine the two into a
  <b>render tree</b> (only the nodes that will actually be visible),
  compute every element's exact size and position
  (<b>layout</b>, also called <b>reflow</b>), then finally
  <b>paint</b> pixels for each one. A <code>&lt;script&gt;</code> with
  no <code>defer</code>/<code>async</code> blocks this whole pipeline
  at the HTML-parsing step — the exact mechanism behind
  <a href="/notes/setup-mental-model">the script-vs-module blocking
  behavior</a> from the very first chapter.
</p>
<table>
  <tr>
    <th></th>
    <th>Reflow (layout)</th>
    <th>Repaint</th>
  </tr>
  <tr><td>Triggered by</td><td>anything that changes size or position — width, font-size, adding/removing an element</td><td>anything that changes appearance only — color, background, visibility</td></tr>
  <tr><td>Cost</td><td>expensive — can cascade to the whole subtree, sometimes the whole page</td><td>cheaper — no geometry to recompute</td></tr>
  <tr><td>Cheapest of all</td><td colspan="2"><code>transform</code> and <code>opacity</code> — these two can often skip layout AND paint entirely, handled straight on the compositor thread</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Reading layout in a loop forces it early, repeatedly</span>
  <code>el.offsetHeight</code> (or <code>getBoundingClientRect()</code>)
  forces the browser to run layout <em>right now</em> if anything is
  pending, instead of waiting for its natural time. Alternating writes
  and reads of layout properties in a loop —
  <code>el.style.width = x; console.log(el.offsetHeight);</code>,
  repeated — forces a full synchronous reflow on <em>every
  iteration</em>. This pattern has an actual name: <b>layout
  thrashing</b>. The fix is always the same shape: batch every read
  first, then batch every write.
</div>

<h3>Not blocking the main thread</h3>
<p>
  <code>requestAnimationFrame(fn)</code> schedules <code>fn</code> to
  run right before the browser's next paint — the correct place for
  any animation logic, because it's synced to the actual screen
  refresh instead of guessing at a delay like
  <code>setTimeout</code> would.
  <code>requestIdleCallback(fn)</code> is the opposite priority: run
  <code>fn</code> only when the browser is otherwise idle, with time to
  spare before the next frame — for genuinely low-priority work
  (analytics batching, prefetching) that should never compete with
  anything the user is actually looking at.
</p>
<pre><code>function animate() {
  el.style.transform = "translateX(" + x + "px)";
  x += 2;
  if (x &lt; 300) requestAnimationFrame(animate);   <span class="c">// re-schedule for the NEXT frame</span>
}
requestAnimationFrame(animate);

requestIdleCallback(() =&gt; {
  sendAnalyticsBatch();   <span class="c">// only runs if the browser has spare time before the next frame</span>
});</code></pre>
<p class="sub">
  <a href="/notes/closures">Debounce and throttle</a> solve a
  different problem — how <em>often</em> a handler runs at all — and
  compose naturally with this: throttle a scroll handler down to a
  sane rate, then do the actual DOM write inside
  <code>requestAnimationFrame</code> so it lands at the right moment in
  the render pipeline.
</p>

<h3>Yielding on purpose: scheduler.yield and postTask</h3>
<pre><code>async function processLargeList(items) {
  for (const item of items) {
    doWork(item);
    if (needsToYield()) {
      await scheduler.yield();   <span class="c">// give the browser a turn, then resume right where you left off</span>
    }
  }
}

scheduler.postTask(() =&gt; renderChart(), { priority: "user-visible" });
scheduler.postTask(() =&gt; sendAnalytics(), { priority: "background" });</code></pre>
<p class="sub">
  <code>scheduler.yield()</code> is the modern replacement for the old
  <code>setTimeout(fn, 0)</code> trick people used to hand control back
  to the browser mid-loop — it returns a promise that resolves on the
  next turn, and unlike a plain <code>setTimeout</code>, the resumed
  work keeps its place in the priority queue rather than dropping to
  the back of it. <code>scheduler.postTask</code> is the explicit
  version of what <code>requestIdleCallback</code> only approximated: a
  real priority (<code>"user-blocking"</code>, <code>"user-visible"</code>,
  <code>"background"</code>) instead of just "whenever there's spare
  time," so a chart the user is looking at can jump ahead of an
  analytics call that can wait.
</p>

<h3>Long Animation Frames — what actually blocked the frame</h3>
<pre><code>new PerformanceObserver((list) =&gt; {
  for (const entry of list.getEntries()) {
    console.log(entry.duration, "ms frame, blocked by:", entry.scripts.map((s) =&gt; s.sourceURL));
  }
}).observe({ type: "long-animation-frame", buffered: true });</code></pre>
<p class="sub">
  A long task (below) only knows <em>that</em> the main thread was busy
  past 50ms. A Long Animation Frame (LoAF) entry knows <em>why</em>:
  which specific script, which function, and how much of the frame went
  to style/layout versus the script itself. It's the metric that
  finally answers "which of my 40 third-party scripts is actually
  causing the janky scroll," instead of a long-task list with no names
  attached.
</p>

<h3>The metrics that actually get measured</h3>
<table>
  <tr>
    <th>Metric</th>
    <th>Measures</th>
  </tr>
  <tr><td><b>LCP</b> — Largest Contentful Paint</td><td>how long until the biggest visible element (usually a hero image or heading) renders</td></tr>
  <tr><td><b>INP</b> — Interaction to Next Paint</td><td>how long the page takes to visibly respond to a click, tap, or keypress — replaced the older FID metric for exactly this reason: FID only measured the delay before a handler started running, INP measures the whole thing including how long the handler itself takes</td></tr>
  <tr><td><b>CLS</b> — Cumulative Layout Shift</td><td>how much visible content jumps around unexpectedly — an image with no reserved <code>width</code>/<code>height</code> popping in and shoving everything below it down is the classic cause</td></tr>
</table>
<p>
  A <b>long task</b> is any single chunk of main-thread JS running
  longer than 50ms without yielding — the main thread can't paint, or
  respond to input, until it's done, so a long task directly hurts
  both LCP and INP at once. Lighthouse is the tool that turns all of
  this into one number and a prioritized list of fixes; the metrics
  above are what it's actually measuring underneath that score.
</p>

<h3>Rendering less, later, or not yet</h3>
<pre><code><span class="c">// Virtual list — render only the ~20 rows actually visible, not all 50,000</span>
function mountVirtualList(viewport, items, rowHeight) {
  const spacer = document.createElement("div");
  spacer.style.height = items.length * rowHeight + "px";   <span class="c">// full scroll height, no rows yet</span>
  spacer.style.position = "relative";
  viewport.append(spacer);

  function render() {
    const start = Math.floor(viewport.scrollTop / rowHeight);
    const count = Math.ceil(viewport.clientHeight / rowHeight) + 1;
    spacer.replaceChildren(...items.slice(start, start + count).map((item, i) =&gt; {
      const row = document.createElement("div");
      row.textContent = item;
      row.style.cssText = "position:absolute;left:0;right:0;height:" + rowHeight + "px;top:" + (start + i) * rowHeight + "px";
      return row;
    }));
  }
  viewport.addEventListener("scroll", () =&gt; requestAnimationFrame(render));
  render();
}</code></pre>
<p>
  A virtual list keeps DOM node count roughly constant regardless of
  data size — 50,000 rows and 50 rows cost the same, because only
  what's actually in the viewport (plus a small buffer) is ever
  mounted. <code>loading="lazy"</code> on an <code>&lt;img&gt;</code>
  is the built-in, no-JS version of the same idea for images below the
  fold. <b>Prefetching</b> is the opposite bet — load something
  <em>before</em> it's needed, on a strong signal it's about to be
  (hovering a link, an <code>IntersectionObserver</code> from
  <a href="/notes/browser-apis-deep">Browser APIs, in depth</a> firing near
  the bottom of the page) — trading a little wasted bandwidth on guesses
  that don't pan out for a page that already has the next thing ready.
</p>

<h4>Dry run: what mountVirtualList actually renders at three scroll positions</h4>
<table>
  <tr><th>viewport.scrollTop</th><th>start = floor(scrollTop / rowHeight)</th><th>count = ceil(clientHeight / rowHeight) + 1</th><th>Rows actually mounted</th></tr>
  <tr><td>0</td><td>0</td><td>7</td><td>rows 0–6</td></tr>
  <tr><td>125</td><td>2</td><td>7</td><td>rows 2–8</td></tr>
  <tr><td>1000</td><td>20</td><td>7</td><td>rows 20–26</td></tr>
</table>
<p class="sub">
  rowHeight = 50px, clientHeight = 300px, 50,000 total items — and
  <code>count</code> never moves off 7 no matter where <code>scrollTop</code>
  lands or how many items exist in total. That's the entire performance
  win in one column: mounted DOM node count tracks the viewport size, not
  the size of the data.
</p>

<h3>Resource hints — telling the browser what's coming</h3>
<pre><code>&lt;link rel="preconnect" href="https://api.example.com"&gt;
&lt;link rel="preload" href="/fonts/main.woff2" as="font" crossorigin&gt;
&lt;img src="hero.jpg" fetchpriority="high"&gt;
&lt;img src="footer-logo.png" fetchpriority="low" loading="lazy"&gt;</code></pre>
<table>
  <tr><th>Hint</th><th>Tells the browser</th></tr>
  <tr><td><code>preconnect</code></td><td>open the connection (DNS, TCP, TLS) to this origin now, before anything actually needs it</td></tr>
  <tr><td><code>preload</code></td><td>fetch this exact resource now — it will be needed soon, don't wait to discover it</td></tr>
  <tr><td><code>fetchpriority</code></td><td>override the browser's own guess at how urgent this particular resource is</td></tr>
</table>
<p class="sub">
  <code>preload</code> is for something the browser wouldn't otherwise
  find early — a font referenced only inside CSS, or an image set by
  JavaScript rather than a plain <code>&lt;img&gt;</code> tag the parser
  can see immediately. <code>fetchpriority="high"</code> is the direct
  fix for the classic LCP problem: the actual hero image is often not
  the highest-priority request the browser guesses on its own, and
  telling it explicitly can shave real time off the largest paint.
</p>
<div class="warn">
  <span class="ttl">⚠ Preloading too much is its own performance bug</span>
  Every <code>preload</code> competes for the same limited bandwidth at
  the start of a page load. Preloading everything "just in case" can
  push back the request that actually mattered — reserve it for the one
  or two resources profiling has shown to be on the critical path, not
  as a default habit.
</div>

<h3>WebAssembly, and when it is worth it</h3>
<p>
  WebAssembly is a binary format that runs at near-native speed in the same
  sandbox as your JavaScript. It is not a faster JavaScript &mdash; it is a
  target for languages like Rust, C++ and Go, and it earns its place only for a
  specific shape of work.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Worth it</th><th>Not worth it</th></tr></thead>
<tbody>
<tr><td>Image, video and audio processing</td><td>DOM work &mdash; every call crosses back into JavaScript</td></tr>
<tr><td>Compression, encryption, hashing</td><td>Anything dominated by network time</td></tr>
<tr><td>Physics, simulation, 3D maths</td><td>Ordinary application logic</td></tr>
<tr><td>Porting a large existing C or Rust library</td><td>Code you would otherwise write once in JS</td></tr>
</tbody>
</table></div>

<h4>The boundary is the cost</h4>
<pre><code>const { instance } = await WebAssembly.instantiateStreaming(fetch("/hash.wasm"));

<span class="c">// ✗ crossing 100,000 times — the boundary dominates</span>
for (const n of numbers) total += instance.exports.add(n, 1);

<span class="c">// ✓ cross once, work in bulk inside linear memory</span>
const mem = new Float64Array(instance.exports.memory.buffer, ptr, numbers.length);
mem.set(numbers);
instance.exports.sumAll(ptr, numbers.length);</code></pre>
<p>
  Numbers pass across cheaply. <b>Anything else does not</b> &mdash; strings,
  arrays and objects have to be copied into the module's linear memory and back,
  and that copy is frequently more expensive than the computation you moved. The
  rule is to cross the boundary rarely and carry a lot each time.
</p>
<p class="sub">
  It also has no direct DOM access. A WASM module that needs to touch the page
  calls back into JavaScript to do it, which is another boundary crossing &mdash;
  which is why "rewrite the UI in Rust" does not make a page faster.
</p>

<h4>What it costs before it runs</h4>
<p>
  A module is a download, a compile and an instantiation.
  <code>instantiateStreaming</code> compiles while it downloads, which is the
  version to use. But a 2 MB module that saves 30ms of computation has lost
  before it started &mdash; measure the total, including fetch and compile, not
  just the function call.
</p>

<h3>Tree shaking and bundle size</h3>
<p>
  <a href="/notes/modules-tooling">Already covered</a>: tree shaking
  only works because ESM imports are static and analyzable — a
  bundler can see the entire dependency graph and delete anything
  provably unused. "Provably" is the load-bearing word: a module with
  <b>side effects</b> at its top level (code that runs just from being
  imported — registering something globally, patching a prototype)
  can't be safely deleted even if nothing imports a name from it,
  because deleting it would change behavior. <code>package.json</code>'s
  <code>"sideEffects": false</code> field is a library author's
  explicit promise that none of their files do this, which is what
  lets a bundler tree-shake it aggressively instead of playing it safe.
</p>
<p class="sub">
  A bundle analyzer (a treemap of what's actually inside the shipped
  JS, sized by byte) is how "why is this bundle 400kb" stops being a
  guess — it routinely surfaces one unexpectedly heavy dependency, or
  an entire library imported for one small utility function that could
  have been hand-written in ten lines instead.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Perceived speed comes from the critical rendering path and the main thread: ship less, defer what is not needed yet, break up long tasks so input stays responsive, and measure with field metrics such as LCP, INP and CLS instead of guessing."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain the difference between reflow and repaint, and why <code>transform</code>/<code>opacity</code> can skip both.</li>
    <li>Say what layout thrashing is and the batch-reads-then-writes fix for it.</li>
    <li>Explain why a virtual list's DOM node count doesn't grow with the data, using the <code>mountVirtualList</code> dry run.</li>
    <li>State what INP replaced FID for measuring, and why a long task hurts both LCP and INP at once.</li>
    <li>Explain why crossing the WebAssembly/JS boundary rarely matters more than the computation itself.</li>
  </ul>
</div>`,
};
