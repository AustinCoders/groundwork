import type { Chapter } from "../types";

export const reactPerformance: Chapter = {
  id: "react-performance",
  num: "A12",
  title: "Performance work",
  short: "Performance",
  levels: ["advanced"],
  prerequisites: ["react-memoisation", "react-concurrent", "react-suspense"],
  practice: ["ex-comp-state-down", "ex-comp-usememo-expensive-calc", "ex-comp-windowed-list"],
  ready: true,
  subtitle: "Measure, find the actual cost, fix the structure. Memoisation is the last step, not the first.",
  body: `<p>
  <a href="/react/react-memoisation">Memoisation</a> covered one tool. This chapter is about the whole job: given an
  app that someone says is slow, find out what "slow" means, measure it the way users experience it, find the single
  biggest cost, and fix it in the right order. Most of the time the answer is not in React's rendering at all, and when
  it is, the fix is usually structural. It covers diagnosing by symptom, the Profiler, structural fixes, long lists and
  virtualisation, long tasks and yielding, the bundle, data loading, the Core Web Vitals and what moves each one,
  problems that are not React's fault, and how to stop performance regressing once it is fixed.
</p>

<h3>Decide what is slow first</h3>
<div class="table-scroll"><table>
<thead><tr><th>Symptom</th><th>Usually</th><th>Look at</th></tr></thead>
<tbody>
<tr><td>Slow first load</td><td>Bundle size, or a blocking request</td><td>Network panel, bundle analyser</td></tr>
<tr><td>Typing lags</td><td>Re-rendering a large tree per keystroke</td><td>React Profiler</td></tr>
<tr><td>Scrolling stutters</td><td>Too many DOM nodes, or layout thrashing</td><td>Performance panel</td></tr>
<tr><td>Click feels dead</td><td>Long task blocking the main thread</td><td>Performance panel, INP</td></tr>
<tr><td>Layout jumps</td><td>Images without dimensions, late-loading fonts</td><td>CLS in Lighthouse</td></tr>
</tbody>
</table></div>
<p>
  These have almost nothing in common. "The app is slow" answered with
  <code>memo</code> is a guess; each row above has a different fix.
</p>
<p>
  Before measuring anything, make your machine resemble the user's. In Chrome's Performance panel, set CPU throttling
  to a 4x or 6x slowdown and the network to a fast or slow 4G profile; a developer laptop is often several times faster
  than the median phone. Use a production build, because development builds add checks and Strict Mode's double
  rendering. And reproduce the exact interaction the user described, with realistic data volumes: a list that is fast with
  20 test rows can be the whole problem with 2,000 real ones.
</p>

<h3>Reading the React Profiler</h3>
<p>
  Record an interaction, then read the flame chart: width is time in that
  component and its children, grey means it did not re-render. Turn on
  <b>"record why each component rendered"</b> in the settings &mdash; without it
  you are looking at symptoms.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Reason shown</th><th>Means</th></tr></thead>
<tbody>
<tr><td>Props changed</td><td>Correct behaviour &mdash; unless the prop is a new object with the same contents</td></tr>
<tr><td>Parent rendered</td><td>A missing <code>memo</code>, or state that should live lower</td></tr>
<tr><td>Context changed</td><td>An unmemoised provider value, or one context doing too much</td></tr>
<tr><td>Hooks changed</td><td>A hook returning a new reference every render</td></tr>
</tbody>
</table></div>

<h3>Fix the structure before adding a cache</h3>
<pre><code><span class="c">// ✗ every keystroke re-renders the expensive tree</span>
function Page() {
  const [q, setQ] = useState("");
  return &lt;&gt;&lt;input value={q} onChange={...} /&gt;&lt;Expensive /&gt;&lt;/&gt;;
}

<span class="c">// ✓ state moved down — Expensive is now a sibling that never re-renders</span>
function Page() {
  return &lt;&gt;&lt;SearchBox /&gt;&lt;Expensive /&gt;&lt;/&gt;;
}

<span class="c">// ✓ or pass it as children — the prop is the same element object each time</span>
function Page({ children }) {
  const [q, setQ] = useState("");
  return &lt;&gt;&lt;input value={q} onChange={...} /&gt;{children}&lt;/&gt;;
}</code></pre>
<p>
  Both remove the problem rather than caching around it, and neither adds a
  dependency array anybody has to maintain.
</p>
<p>
  The third structural move is splitting a component that does two jobs at different
  speeds. A dashboard card that shows a live clock and a large chart re-renders the
  chart every second; pulling the clock into its own component confines the per-second
  render to a few elements. Look for state that changes often next to markup that is
  expensive, and separate them.
</p>

<h3>Long lists: virtualise</h3>
<pre><code>const rows = useVirtualizer({ count: items.length, estimateSize: () =&gt; 48, ... });</code></pre>
<p>
  Five thousand rows means five thousand DOM nodes, and the browser &mdash; not
  React &mdash; is what struggles. Virtualisation renders the twenty that are
  visible. No amount of <code>memo</code> substitutes for it.
</p>
<p class="sub">
  It has real costs: Ctrl-F stops finding off-screen content, and it complicates
  variable heights and accessibility. Reach for it past a few hundred rows, not
  before.
</p>

<h3>Worked example: windowing a list by hand</h3>
<p>
  Libraries such as TanStack Virtual handle variable heights, horizontal lists and smooth scrolling, but the core idea
  fits in a few lines, and knowing it makes the library's options make sense.
</p>
<pre><code>function VirtualList({ items, rowHeight, height }) {
  const [scrollTop, setScrollTop] = useState(0);
  const start = Math.floor(scrollTop / rowHeight);
  const count = Math.ceil(height / rowHeight) + 1;
  const visible = items.slice(start, start + count);

  return (
    &lt;div style={{ height, overflowY: "auto" }} onScroll={(e) =&gt; setScrollTop(e.currentTarget.scrollTop)}&gt;
      &lt;div style={{ height: items.length * rowHeight, position: "relative" }}&gt;
        &lt;ul style={{ position: "absolute", top: start * rowHeight, left: 0, right: 0 }}&gt;
          {visible.map((item) =&gt; (
            &lt;li key={item.id} style={{ height: rowHeight }}&gt;{item.label}&lt;/li&gt;
          ))}
        &lt;/ul&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}</code></pre>
<div class="table-scroll"><table>
<thead><tr><th><code>scrollTop</code></th><th><code>start</code></th><th>Rows rendered</th><th>Offset</th></tr></thead>
<tbody>
<tr><td>0</td><td>0</td><td>0 to 6</td><td>0 px</td></tr>
<tr><td>95</td><td>3</td><td>3 to 9</td><td>90 px</td></tr>
<tr><td>3000</td><td>100</td><td>100 to 106</td><td>3000 px</td></tr>
<tr><td>29,820 (the maximum)</td><td>994</td><td>994 to 999 (slice stops at the end)</td><td>29,820 px</td></tr>
</tbody>
</table></div>
<p>
  The table assumes 1,000 items, 30 px rows and a 180 px viewport: <code>count</code> is 7, one more than fits, so a
  partly visible row at the bottom is never missing. The outer spacer is 30,000 px tall, which makes the largest
  possible <code>scrollTop</code> 30,000 minus the 180 px viewport, so the scrollbar behaves as if
  every row existed. However far the user scrolls, the DOM holds seven rows. Real implementations add an overscan of a
  few rows above and below, so fast scrolling does not show blank space before React renders, and key rows by item id,
  never by position in the slice.
</p>

<h3>Long tasks, and breaking them up</h3>
<p>
  The browser's main thread runs JavaScript, style, layout and paint in turn. Any task longer than 50 ms is a long task:
  while it runs, a click or key press waits. React's concurrent rendering already splits its own render work into slices
  for transitions, but three kinds of long task are outside its reach.
</p>
<ul>
  <li><b>One expensive component.</b> React yields between components, not inside one. A component that sorts 100,000 rows in its body is one unit of work. Memoise it so it runs only when its input changes, or move the calculation out of render.</li>
  <li><b>Work in event handlers.</b> Code in an <code>onClick</code> runs before React renders anything. Do the minimum there (set state), and let the expensive consequence render in a transition.</li>
  <li><b>Pure computation.</b> Parsing a large file, diffing two documents, filtering in a tight loop. Move it to a Web Worker, which runs on another thread and posts the result back, or break it into chunks that yield to the browser between them with <code>scheduler.yield()</code> where supported, or a <code>setTimeout(0)</code> fallback.</li>
</ul>
<p>
  The Performance panel shows long tasks with a red corner. Clicking one shows the call tree; if most of the time sits in
  one of your functions rather than in React's internals, it is one of the three cases above.
</p>

<h3>Context as a performance problem</h3>
<p>
  Context is the other common source of wide re-renders. Every component that reads a context re-renders when its value
  changes, and <code>memo</code> cannot stop that. Three patterns cause most of the trouble: a provider value built
  inline, so it changes on every render of the provider; one context holding both rarely and frequently changing data,
  so readers of the stable part re-render with the volatile part; and fast-changing state such as a cursor position or a
  form's every keystroke placed in context at all. The fixes are to memoise the value, split the context by how often its
  parts change, and move high-frequency state into a store whose hook lets each component select only its slice.
  <a href="/react/react-context">Context</a> traces these with render counts.
</p>

<h3>Per-render and per-row costs</h3>
<p>
  A component body runs on every render, and a row component runs once per row. Small costs there multiply. Common ones:
  creating an <code>Intl.NumberFormat</code> or <code>Intl.DateTimeFormat</code> per call (expensive to construct, cheap
  to reuse; create once at module scope per locale), compiling a regular expression from a string, parsing dates from
  strings in every row, sorting or grouping the full data set in a child that only shows part of it, and building large
  objects to pass as props. None of them shows up as "React is slow" in a flame chart; they show up as one of your own
  functions being wide. Hoisting them out of render is usually a one-line fix with a larger effect than any memo.
</p>

<h3>Rendering strategy sets the ceiling</h3>
<p>
  How a page is rendered decides the best timings it can ever reach, before any component-level work.
  A purely client-rendered page cannot paint meaningful content until its JavaScript has downloaded, parsed, run and
  fetched data, so LCP has a floor of several round trips. Server rendering sends HTML that paints at once, then pays for
  hydration, which shows up as input delay on early interactions. Static generation removes the server work for content
  that does not change per request. Streaming with Suspense sends the shell immediately and the slow parts as they
  resolve. Server Components send no JavaScript for components that do not need interactivity, which shrinks both the
  bundle and the hydration cost. Choosing among them is covered in
  <a href="/react/react-rendering-strategies">rendering strategies</a>; for performance work, the point is that a
  client-rendered page with a 2 MB bundle cannot be memoised into a good LCP.
</p>

<h3>The bundle</h3>
<pre><code>npx vite-bundle-visualizer          <span class="c">// or @next/bundle-analyzer</span></code></pre>
<ul>
  <li><b>Split by route</b> first &mdash; the biggest win per minute of work.</li>
  <li><b>Find the one dependency</b> that is a third of the bundle. There usually is one: a date library, an icon set imported wholesale, a chart package.</li>
  <li><b>Lazy-load what most people never open</b> &mdash; an editor, a modal, an export dialog.</li>
  <li><b>Check for duplicates.</b> Two versions of the same package is common and invisible without the analyser.</li>
</ul>

<h3>Data loading is usually the biggest cost</h3>
<p>
  For most pages the time a user waits is dominated by the network, not by JavaScript. Three patterns account for most
  of it.
</p>
<ul>
  <li><b>Waterfalls.</b> A component fetches, renders a child, and the child fetches. Each level adds a round trip. Start independent requests together, at the route or in a loader, and pass promises or data down, as described in <a href="/react/react-suspense">Suspense</a>.</li>
  <li><b>Fetching after render.</b> A client app that renders, runs an effect, then fetches has already spent the time to download and run the JavaScript before the request starts. Server rendering, server components or a route loader that starts the request with the navigation all move the start earlier.</li>
  <li><b>Fetching what you already had.</b> Without a cache, navigating back refetches everything. A query cache or framework cache returns the previous data instantly and refreshes in the background.</li>
</ul>
<p>
  The Network panel's waterfall view shows the first two at a glance: requests that start only when an earlier one ends,
  in a staircase. Prefetching on intent (hovering a link, focusing a search box) hides the remaining latency by starting
  work a few hundred milliseconds before the user commits.
</p>

<h3>Measuring in code with &lt;Profiler&gt;</h3>
<pre><code>&lt;Profiler id="orders-table" onRender={(id, phase, actualDuration, baseDuration) =&gt; {
  report({ id, phase, actualDuration, baseDuration });
}}&gt;
  &lt;OrdersTable /&gt;
&lt;/Profiler&gt;</code></pre>
<p>
  The <code>&lt;Profiler&gt;</code> component calls <code>onRender</code> after every commit of its subtree.
  <code>phase</code> says whether it was a mount or an update; <code>actualDuration</code> is the time spent rendering
  the subtree in that commit, which falls when memoisation works; <code>baseDuration</code> estimates the cost of
  rendering the whole subtree with no memoisation, the worst case. Comparing the two tells you how much skipping is
  saving. It is off in production builds unless you use React's profiling build, so it is a tool for tests and staging,
  and for the automated render-count checks described below.
</p>

<h3>What users actually measure</h3>
<div class="table-scroll"><table>
<thead><tr><th>Metric</th><th>Good</th><th>Usually caused by</th></tr></thead>
<tbody>
<tr><td><b>LCP</b> largest contentful paint</td><td>&lt; 2.5s</td><td>A slow server response, or a hero image that is not preloaded</td></tr>
<tr><td><b>INP</b> interaction to next paint</td><td>&lt; 200ms</td><td>Long tasks &mdash; usually a big re-render or an unyielding loop</td></tr>
<tr><td><b>CLS</b> cumulative layout shift</td><td>&lt; 0.1</td><td>Images without dimensions, fonts swapping, content injected above the fold</td></tr>
</tbody>
</table></div>
<p>
  INP is where React work shows up. A component that takes 300ms to re-render on
  click is a failing INP, and a
  <a href="/react/react-concurrent">transition</a> often fixes it without making
  anything faster &mdash; it just stops the urgent update queueing behind the
  slow one.
</p>

<h3>INP, taken apart</h3>
<p>
  Interaction to Next Paint measures, for the slowest interactions on a page, the time from the user's input to the next
  frame the browser paints. It has three parts, and each has a different cause.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Part</th><th>What it is</th><th>Usually caused by</th><th>Fix</th></tr></thead>
<tbody>
<tr><td>Input delay</td><td>Waiting for the main thread to be free</td><td>A long task already running: hydration, a timer, third-party script</td><td>Break up long tasks; defer third-party code</td></tr>
<tr><td>Processing time</td><td>Running event handlers and the render they trigger</td><td>A large synchronous re-render, heavy handler work</td><td>Move state down, transitions, memoise the hot path</td></tr>
<tr><td>Presentation delay</td><td>Style, layout and paint of the result</td><td>A huge DOM, layout thrashing, expensive CSS</td><td>Virtualise, batch reads and writes, simpler styles</td></tr>
</tbody>
</table></div>
<p>
  The Performance panel splits each interaction into these parts, and the web-vitals library reports them from real
  users through its attribution build. Knowing which part dominates tells you whether to look at React at all: a 400 ms
  INP that is mostly input delay during hydration is a loading problem, not a rendering one. Hydrating less, by keeping
  more of the page as server components or splitting hydration with Suspense boundaries, is the React-side lever there.
</p>

<h3>Things that are not React's fault</h3>
<ul>
  <li><b>Layout thrashing.</b> Reading <code>offsetHeight</code> after a write forces a synchronous layout. In a loop, that is a freeze. Batch reads, then writes.</li>
  <li><b>Animating <code>left</code> and <code>top</code>.</b> Those trigger layout every frame. <code>transform</code> and <code>opacity</code> run on the compositor.</li>
  <li><b>Unoptimised images.</b> Frequently more bytes than the entire JavaScript bundle. Serve modern formats at the displayed size, set <code>width</code> and <code>height</code> so space is reserved, lazy-load below the fold, and give the LCP image <code>fetchpriority="high"</code> instead of lazy-loading it.</li>
  <li><b>Web fonts.</b> A font that blocks text, or swaps in with different metrics, delays LCP and shifts layout. Preload the one or two fonts the first screen needs and use metric-compatible fallbacks.</li>
  <li><b>A blocking third-party script.</b> Check what is on the critical path before profiling your own code.</li>
</ul>

<h3>The order to work in</h3>
<ol>
  <li><b>Measure</b> on a throttled CPU and connection. Your machine is not the user's.</li>
  <li><b>Find the biggest single cost</b> &mdash; usually one component, one dependency, or one request.</li>
  <li><b>Fix the structure:</b> move state down, split the component, virtualise, code-split.</li>
  <li><b>Then memoise</b>, at the exact place the profiler pointed at.</li>
  <li><b>Measure again</b>, and delete the optimisation if it did not help.</li>
</ol>

<h3>Keeping it fast</h3>
<p>
  Performance fixed once regresses within months unless something checks it. Three layers, from cheapest to most
  realistic:
</p>
<ul>
  <li><b>Bundle budgets in CI.</b> Fail the build when the initial JavaScript for a route grows past a set size. It catches the accidental import of a whole library at the moment it happens, when the cause is one line in one pull request.</li>
  <li><b>Lab checks.</b> Lighthouse CI or a similar run on key pages in every pull request, with thresholds for LCP, CLS and total blocking time. Lab numbers are noisy, so compare against a baseline and allow a margin.</li>
  <li><b>Real-user monitoring.</b> Report Core Web Vitals from real sessions with the web-vitals library to your analytics, and watch the 75th percentile, which is what Google's assessment uses. Only field data shows slow devices, slow networks and the interactions people actually perform.</li>
</ul>
<p>
  The React-specific addition is a Profiler check on the interactions that matter: an automated test can wrap a screen in
  React's <code>&lt;Profiler&gt;</code> component, perform the interaction, and assert that the components expected to
  stay still did not render. It catches the inline prop that silently defeated a <code>memo</code>.
</p>

<h3>Worked example: an investigation, start to finish</h3>
<p>
  Support says the orders page "freezes" when filtering. Here is how the steps above play out.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Step</th><th>Finding</th><th>Decision</th></tr></thead>
<tbody>
<tr><td>Reproduce on a throttled CPU</td><td>Typing in the filter box drops characters; each key press takes a visible moment</td><td>A processing-time INP problem, not loading</td></tr>
<tr><td>Performance panel</td><td>One long task per key press, mostly inside React rendering</td><td>Look at what renders</td></tr>
<tr><td>React Profiler, "why did this render"</td><td>The whole page re-renders; the filter state lives in the page component; the table renders 2,000 rows</td><td>Two causes: state too high, list too long</td></tr>
<tr><td>Move the filter's text state into the filter box; pass a deferred value to the table</td><td>Typing is smooth; the table still takes long to update</td><td>Structural fix done; now the list</td></tr>
<tr><td>Virtualise the table</td><td>The table update is now short; DOM nodes drop from tens of thousands to a few hundred</td><td>Done for rendering</td></tr>
<tr><td>Profile again</td><td>A <code>formatCurrency</code> call creating an <code>Intl.NumberFormat</code> per cell shows up</td><td>Hoist the formatter to module scope</td></tr>
<tr><td>Add a Profiler test and a bundle budget</td><td>Regressions now fail CI</td><td>Close the ticket</td></tr>
</tbody>
</table></div>
<p>
  No <code>memo</code> was needed until the very end, and the biggest wins were moving state and virtualising. That
  order is typical: measure, fix structure, fix the one expensive call the profiler names, then guard it.
</p>

<h3>Pitfalls</h3>
<ul>
  <li><b>Optimising without measuring</b>, or measuring on a fast laptop with no throttling.</li>
  <li><b>Reaching for <code>memo</code> first</b> when state is too high or the list is too long.</li>
  <li><b>Profiling a development build</b> and treating its timings as real; use it to see what renders, not how long.</li>
  <li><b>Lazy-loading the LCP image</b> or hiding it behind client-side JavaScript.</li>
  <li><b>Virtualising short lists</b>, and losing find-in-page and simple accessibility for nothing.</li>
  <li><b>Expensive objects created per render or per row</b>, such as formatters and regular expressions.</li>
  <li><b>Request waterfalls</b> from components that fetch only after their parent has loaded.</li>
  <li><b>No regression checks</b>, so the fix quietly disappears.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>"The first load is slow": bundle size, server response, the LCP image; React rendering is rarely the cause.</li>
  <li>"Typing lags": a large tree re-rendering per key press; move state down or defer the expensive part.</li>
  <li>"Scrolling stutters": too many DOM nodes or layout thrashing; virtualise, batch layout reads.</li>
  <li>"Clicking does nothing for a moment right after load": input delay from hydration or third-party scripts.</li>
  <li>"The page jumps as it loads": images without dimensions, font swaps, injected banners.</li>
  <li>"It got slow after the last release": compare bundles and profiles against the previous build.</li>
</ul>

<h3>Interview questions</h3>
<p><b>1. A user says the app is slow. What do you do?</b></p>
<p>
  Ask what is slow: first load, typing, scrolling, a click, layout jumping. Each has a different cause and tool.
  Reproduce on a throttled device, measure with the Performance panel and the React Profiler, find the single biggest
  cost, fix the structure first, then add caching where the profiler points, and measure again.
</p>
<p><b>2. When would you virtualise a list, and what does it cost?</b></p>
<p>
  When there are hundreds to thousands of rows and the DOM size itself is the cost. It renders only visible rows inside a
  spacer the full height of the list. It costs find-in-page for off-screen rows, complicates variable heights and
  accessibility, and needs overscan and stable keys.
</p>
<p><b>3. What are the Core Web Vitals and what moves each one?</b></p>
<p>
  LCP, the largest content paint, under 2.5 s: server response, render-blocking resources and the hero image. INP, the
  delay to the next paint after an interaction, under 200 ms: long tasks and large re-renders. CLS, layout shift, under
  0.1: missing dimensions, fonts, injected content. They are assessed at the 75th percentile of real users.
</p>
<p class="sub">
  <i>Follow-up: which one does React work affect most?</i> INP, through processing time and hydration's input delay.
  Transitions, moving state down and hydrating less are the React-side levers.
</p>
<p><b>4. A single component takes 300 ms to render. Will <code>startTransition</code> fix it?</b></p>
<p>
  It keeps urgent updates from queuing behind it, so typing stays responsive, but the component itself is still 300 ms of
  uninterruptible work, because React yields only between components. Make it cheaper: memoise the expensive part, render
  less, or move the computation to a worker.
</p>
<p><b>5. How do you stop performance regressing?</b></p>
<p>
  Bundle budgets in CI, lab checks with thresholds on key pages, real-user Core Web Vitals monitoring at the 75th
  percentile, and Profiler-based tests asserting that components that should stay still do not render.
</p>
<p><b>6. Each row of a 500-row table formats a price and a date. The profiler shows the row component as the widest part. What would you check first?</b></p>
<p>
  What the row does per render: constructing <code>Intl</code> formatters, parsing date strings or compiling regular
  expressions are expensive to create and cheap to reuse. Hoist them to module scope. Then check whether all 500 rows
  need to render on each update, using stable props, <code>memo</code> on the row and immutable updates, and whether 500
  rows need to be in the DOM at all.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "Should we wrap every component in <code>memo</code> to be safe?" No. It adds a comparison to every render, does
    nothing whenever a prop is a new object, function or JSX, and hides where the real cost is. Measure, fix structure,
    and memoise where the profiler shows a cost, or enable the React Compiler and let it do this consistently.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "I profile before changing anything, because slow means five different things with five different fixes. For
    loading I look at the bundle, the server response and the LCP image; for interactions, at long tasks and what
    re-renders. Most React slowness is a large tree re-rendering per key press, fixed by moving state down or deferring
    the expensive part, or too many DOM nodes, fixed by virtualisation. Memoisation comes last, where the profiler
    points, and I add budgets and monitoring so the fix stays fixed."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Map five symptoms of slowness to their usual causes and the tool that shows each.</li>
    <li>Read a Profiler recording and name what the "why did this render" reasons imply.</li>
    <li>Move state down, or pass children, to stop a slow subtree re-rendering.</li>
    <li>Write a fixed-height windowed list and fill in its scroll table.</li>
    <li>Split a component that mixes a fast-changing value with expensive markup.</li>
    <li>Name three kinds of long task React cannot split, and the fix for each.</li>
    <li>Split INP into its three parts and say which React work affects.</li>
    <li>Find and remove a request waterfall, and prefetch the next step on intent.</li>
    <li>Hoist an expensive per-row object, such as a number formatter, out of render.</li>
    <li>Set up a bundle budget, a lab check and real-user monitoring.</li>
    <li>Use the <code>&lt;Profiler&gt;</code> component to compare actual and base render durations.</li>
  </ul>
</div>`,
};
