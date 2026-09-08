import type { Chapter } from "../types";

export const browserObservability: Chapter = {
  id: "browser-observability",
  num: "A10",
  title: "Browser observability",
  short: "Observability",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "The bug is on somebody else's device, on a network you cannot reproduce.",
  body: `<h3>Why local debugging runs out</h3>
<p>
  Your machine is fast, your connection is good, your cache is warm, and you
  have the exact state you just created. None of that is true for the person
  filing the bug &mdash; and most of the time nobody files one at all. They
  leave.
</p>
<p>
  Observability is the set of things you put in place so that a session you were
  not in can still tell you what happened.
</p>

<h3>Catching what escapes</h3>
<pre><code>window.addEventListener("error", (e) =&gt; {
  report({ message: e.message, stack: e.error?.stack, source: e.filename, line: e.lineno });
});

window.addEventListener("unhandledrejection", (e) =&gt; {
  report({ message: String(e.reason?.message ?? e.reason), stack: e.reason?.stack });
});</code></pre>
<p>
  Two listeners, and the second is the one people forget. A rejected promise with
  no <code>.catch</code> never touches <code>window.onerror</code>, so an entire
  class of async failure goes unrecorded until you add it.
</p>
<p class="sub">
  A third exists for resources: <code>window.addEventListener("error", fn, true)</code>
  with capture on fires for images and scripts that fail to load, which regular
  error handling misses entirely.
</p>

<h3>Source maps, and why the stack is unreadable without them</h3>
<pre><code>TypeError: e.b is not a function
    at t (main.9f2a1c.js:1:48213)</code></pre>
<p>
  That is what a minified stack tells you: nothing. A source map maps those
  positions back to your real files and line numbers.
</p>
<div class="bx is-prim">
  <span class="ttl">Generate them, upload them, do not serve them</span>
  <p>
    Build with source maps, upload them to your error tracker from CI, and then
    <b>do not deploy them to the browser</b>. Serving a source map publishes your
    original source, comments and all. Most bundlers have a "hidden" mode that
    emits the map without the <code>//# sourceMappingURL</code> comment, which is
    exactly this.
  </p>
</div>

<h3>Send context, not just the error</h3>
<pre><code>report({
  message, stack,
  release: __APP_VERSION__,     <span class="c">// which deploy</span>
  url: location.pathname,
  userAgent: navigator.userAgent,
  breadcrumbs: recentActions,   <span class="c">// the last ~20 things that happened</span>
});</code></pre>
<p>
  The single most useful field is the <b>release</b>. "This started at 14:20 on
  Tuesday, which is when 4.12 shipped" answers more bugs than any stack trace,
  because most production bugs are explained by the diff.
</p>
<p>
  Breadcrumbs &mdash; a rolling buffer of navigations, clicks, network calls and
  console messages &mdash; are the second. An error message tells you what broke;
  breadcrumbs tell you what the person was doing.
</p>

<h3>Rate-limit your own reporting</h3>
<pre><code>let sent = 0;
function report(payload) {
  if (sent++ &gt;= 5) return;                 <span class="c">// per session</span>
  fetch("/api/client-error", {
    method: "POST",
    body: JSON.stringify(payload),
    keepalive: true,                        <span class="c">// survives the page unloading</span>
  }).catch(() =&gt; {});
}</code></pre>
<p>
  A render loop that throws every frame will happily send ten thousand reports
  and take your logging endpoint down with it. Cap per session. And
  <code>keepalive</code> matters: without it, a report fired as the user
  navigates away is cancelled &mdash; which is exactly when errors happen.
</p>

<h3>Field data beats lab data</h3>
<div class="table-scroll"><table>
<thead><tr><th>Lab &mdash; Lighthouse, your machine</th><th>Field &mdash; real users</th></tr></thead>
<tbody>
<tr><td>One device, one network, cold cache</td><td>Every device, every network</td></tr>
<tr><td>Reproducible, good for before-and-after</td><td>Not reproducible, and true</td></tr>
</tbody>
</table></div>
<pre><code>import { onLCP, onINP, onCLS } from "web-vitals";

onINP((m) =&gt; send({ name: m.name, value: m.value, rating: m.rating, route }));</code></pre>
<div class="table-scroll"><table>
<thead><tr><th>Metric</th><th>Measures</th><th>Good</th></tr></thead>
<tbody>
<tr><td><b>LCP</b></td><td>When the main content appeared</td><td>&lt; 2.5s</td></tr>
<tr><td><b>INP</b></td><td>How long an interaction takes to show a result</td><td>&lt; 200ms</td></tr>
<tr><td><b>CLS</b></td><td>How much the layout jumped</td><td>&lt; 0.1</td></tr>
</tbody>
</table></div>
<p>
  Read the <b>75th percentile</b>, never the mean. An average hides the quarter
  of your users on a mid-range Android phone, and they are the ones leaving. A
  metric that is fine on average and terrible at p75 is the most common
  performance situation there is.
</p>

<h3>Finding what blocked the main thread</h3>
<pre><code>new PerformanceObserver((list) =&gt; {
  for (const entry of list.getEntries()) {
    if (entry.duration &gt; 50) send({ type: "long-task", duration: entry.duration });
  }
}).observe({ type: "longtask", buffered: true });</code></pre>
<p>
  Anything over 50ms on the main thread is a task the browser could not
  interrupt, which means input during it felt dead. Long tasks are what a bad
  INP is made of, and this is how you find them in the field rather than
  guessing on your laptop.
</p>

<h3>What to do before you debug</h3>
<ol>
  <li><b>When did it start?</b> Check the release timeline before opening any code.</li>
  <li><b>Who is affected?</b> One browser, one country, one device class narrows it enormously.</li>
  <li><b>Can you turn it off?</b> A feature flag or a rollback converts an incident into an investigation you can do calmly.</li>
  <li><b>Then</b> reproduce &mdash; with 4&times; CPU throttling and a slow network, not on your machine as it is.</li>
</ol>

<h3>The privacy part, which is not optional</h3>
<p>
  Error payloads pick up more than you intend: URLs with tokens in the query
  string, form values in breadcrumbs, email addresses in a stack's local
  variables. Session replay records the screen. Strip, mask and allow-list before
  sending, and know what your privacy policy actually promises &mdash; this is
  the one area where a debugging convenience can become a legal problem.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Two listeners &mdash; <code>error</code> and <code>unhandledrejection</code>,
    because a rejected promise never reaches the first &mdash; with source maps
    uploaded from CI but never served, and every report tagged with a release so
    'when did this start' is answerable. Then field vitals at p75 rather than lab
    numbers, because the mean hides the users who are actually suffering."
  </p>
</div>`,
};
