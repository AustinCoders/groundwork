import type { Chapter } from "../types";

export const reactPerformance: Chapter = {
  id: "react-performance",
  num: "A12",
  title: "Performance work",
  short: "Performance",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Measure, find the actual cost, fix the structure. Memoisation is the last step, not the first.",
  body: `<h3>Decide what is slow first</h3>
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

<h3>The bundle</h3>
<pre><code>npx vite-bundle-visualizer          <span class="c">// or @next/bundle-analyzer</span></code></pre>
<ul>
  <li><b>Split by route</b> first &mdash; the biggest win per minute of work.</li>
  <li><b>Find the one dependency</b> that is a third of the bundle. There usually is one: a date library, an icon set imported wholesale, a chart package.</li>
  <li><b>Lazy-load what most people never open</b> &mdash; an editor, a modal, an export dialog.</li>
  <li><b>Check for duplicates.</b> Two versions of the same package is common and invisible without the analyser.</li>
</ul>

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

<h3>Things that are not React's fault</h3>
<ul>
  <li><b>Layout thrashing.</b> Reading <code>offsetHeight</code> after a write forces a synchronous layout. In a loop, that is a freeze. Batch reads, then writes.</li>
  <li><b>Animating <code>left</code> and <code>top</code>.</b> Those trigger layout every frame. <code>transform</code> and <code>opacity</code> run on the compositor.</li>
  <li><b>Unoptimised images.</b> Frequently more bytes than the entire JavaScript bundle.</li>
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

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "I profile before changing anything, because 'slow' means five different
    things and they have five different fixes. Most React slowness is either a
    large tree re-rendering on every keystroke — fixed by moving state down
    rather than by memoising — or too many DOM nodes, which needs
    virtualisation. Memoisation is the last step and only where the profiler
    pointed."
  </p>
</div>`,
};
