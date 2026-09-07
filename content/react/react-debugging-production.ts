import type { Chapter } from "../types";

export const reactDebuggingProduction: Chapter = {
  id: "react-debugging-production",
  num: "A19",
  title: "Debugging in production",
  short: "Production debugging",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "The bug is on someone else's device, on a network you cannot reproduce.",
  body: `<h3>Why local debugging stops working</h3>
<p>
  Your machine is fast, your connection is good, your cache is warm, and you
  have one tab open with the state you just created. None of that is true for
  the person filing the bug. The skill at this level is getting information back
  from a session you were not in.
</p>

<h3>Errors: make them arrive with context</h3>
<pre><code>&lt;ErrorBoundary
  onError={(error, info) =&gt; {
    reportError(error, {
      componentStack: info.componentStack,   <span class="c">// which component threw</span>
      route: location.pathname,
      release: __APP_VERSION__,              <span class="c">// which deploy</span>
      userId: session?.id,
    });
  }}
/&gt;</code></pre>
<p>
  A stack trace from a minified bundle is unreadable, so <b>upload source maps
  from CI</b> and never ship them to the browser. Without them you are reading
  <code>a.b is not a function</code> at line 1, column 48000.
</p>
<p class="sub">
  The <code>componentStack</code> is what makes a React error tractable &mdash;
  the JavaScript stack tells you which function threw, the component stack tells
  you where in the tree it was. React 19 also exposes
  <code>captureOwnerStack</code> in development for the component that created
  the element.
</p>

<h3>Group by release, not by message</h3>
<p>
  The single most useful thing an error tracker gives you is "this started at
  14:20 on Tuesday, which is when release 4.12 went out". Tag every report with
  a release identifier and a deploy timestamp. Most production bugs are
  answered by the diff, not by the stack.
</p>

<h3>Memory leaks</h3>
<p>
  React leaks look the same every time: something outlived the component that
  created it, and it closed over a large object.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Leak</th><th>Cause</th></tr></thead>
<tbody>
<tr><td>Listener on <code>window</code></td><td>Effect with no cleanup</td></tr>
<tr><td>Interval or timeout</td><td>Same</td></tr>
<tr><td>Subscription to a store or socket</td><td>Same</td></tr>
<tr><td>A cache that only grows</td><td>A module-level <code>Map</code> keyed by something unbounded</td></tr>
<tr><td>Detached DOM nodes</td><td>A ref to a node held after unmount</td></tr>
</tbody>
</table></div>
<p>
  Finding one: open the Memory panel, take a heap snapshot, navigate away and
  back five times, take another, and compare. If retained size climbs per
  navigation, sort by <b>detached</b> nodes and look at what is holding them.
  The retainer path names the closure, and the closure names the effect.
</p>
<p class="sub">
  Strict Mode's double mount is a leak detector: anything that leaks per mount
  leaks twice as fast in development, which is where you should be finding it.
</p>

<h3>Field data, not lab data</h3>
<div class="table-scroll"><table>
<thead><tr><th>Lab (Lighthouse, your machine)</th><th>Field (real users)</th></tr></thead>
<tbody>
<tr><td>One device, one network, cold cache</td><td>Every device, every network, mixed caches</td></tr>
<tr><td>Good for comparing before and after</td><td>Good for knowing what is actually happening</td></tr>
<tr><td>Reproducible</td><td>The truth</td></tr>
</tbody>
</table></div>
<pre><code>import { onLCP, onINP, onCLS } from "web-vitals";
onINP((metric) =&gt; send({ name: metric.name, value: metric.value, route, device }));</code></pre>
<p>
  Look at the <b>75th percentile</b>, not the mean. An average hides the quarter
  of users on a mid-range Android phone, and they are the ones abandoning. A
  metric that is fine on average and terrible at p75 is the most common
  performance situation there is.
</p>

<h3>Reproducing what you cannot see</h3>
<ul>
  <li><b>Throttle honestly.</b> 4× CPU slowdown and Fast 3G is closer to a real user than your laptop on wifi.</li>
  <li><b>Session replay</b> for interaction bugs &mdash; and treat it as sensitive data: mask inputs, and know what your privacy policy says.</li>
  <li><b>Breadcrumbs</b> beat replays for most bugs. The last twenty actions before the error usually contain the cause.</li>
  <li><b>Feature flags</b> so you can turn the suspect off without a deploy, which converts an incident into an investigation.</li>
</ul>

<h3>Hydration mismatches, which only happen in production</h3>
<pre><code>Warning: Text content did not match. Server: "12:04" Client: "12:05"</code></pre>
<p>
  Locally the server and client run on one machine, one clock, one locale, one
  timezone. In production they do not. Dates, relative times, locale formatting,
  random ids, and anything read from <code>localStorage</code> are the usual
  causes &mdash; and the symptom is a subtree silently re-rendering on the
  client, undoing the benefit of server rendering exactly where it happened.
</p>

<h3>The order to work in</h3>
<ol>
  <li><b>When did it start?</b> Check the release timeline before reading any code.</li>
  <li><b>Who is affected?</b> One browser, one country, one device class narrows it enormously.</li>
  <li><b>Can you turn it off?</b> Flag or roll back first, investigate second.</li>
  <li><b>Then</b> reproduce, with the throttling and the data that the reports point at.</li>
</ol>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Production debugging is about getting information back: source maps and
    component stacks so the error is readable, releases tagged so you can ask
    when it started, and field vitals at p75 rather than lab numbers. React's
    own recurring bug is the leak — something that outlived its component
    because an effect had no cleanup — and a heap snapshot before and after five
    navigations finds it."
  </p>
</div>`,
};
