import type { Chapter } from "../types";

export const modernJs: Chapter = {
  id: "modern-js",
  num: "I11",
  title: "Modern JavaScript, ES2023 to ES2026",
  short: "Modern JS",
  levels: ["intermediate"],
  practice: ["ex-escape-regexp", "ex-promise-try"],
  ready: true,
  subtitle: "What the language gained in the last few years, and how to tell whether you can use it yet.",
  body: `<h3>Two questions for every new feature</h3>
<p>
  A feature has a <b>spec year</b> and a <b>support date</b>, and they are
  different things. ES2025 means the committee finalised it in 2025; whether your
  users' browsers run it is a separate question. So for any feature there are two
  checks: is it in the language, and is it <b>Baseline</b> &mdash; working in the
  current version of every major browser &mdash; for the audience you have?
  "Newly available" Baseline means it just crossed that line; "widely available"
  means it has held for about two and a half years.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Feature</th><th>What it gives you</th><th>Support, in short</th></tr></thead>
<tbody>
<tr><td><code>toSorted</code>, <code>toReversed</code>, <code>with</code></td><td>Array methods that return a copy</td><td>Widely available; <a href="/notes/objects-deep">covered earlier</a></td></tr>
<tr><td><code>Object.groupBy</code></td><td>Group items by a key</td><td>Widely available</td></tr>
<tr><td>Set methods (<code>union</code> and friends)</td><td>Set algebra</td><td>Available in current browsers and Node 22</td></tr>
<tr><td>Iterator helpers</td><td>Lazy <code>map</code>/<code>filter</code>/<code>take</code> on any iterator</td><td>Baseline 2025; Node 22</td></tr>
<tr><td><code>Promise.try</code></td><td>Start a promise chain from any function</td><td>Baseline 2025; Node 23 and later</td></tr>
<tr><td><code>RegExp.escape</code></td><td>Embed user text in a pattern</td><td>Current browsers; Node 24</td></tr>
<tr><td><code>Array.fromAsync</code></td><td>Collect an async iterable</td><td>Widely available</td></tr>
<tr><td>Import attributes</td><td><code>import data from "./x.json" with { type: "json" }</code></td><td>Baseline 2025</td></tr>
<tr><td><code>Float16Array</code></td><td>Half-precision numbers</td><td>Current browsers</td></tr>
<tr><td><code>Error.isError</code></td><td>Reliable error check across realms</td><td>Chrome and Firefox; check Safari</td></tr>
<tr><td><code>using</code> / <code>Symbol.dispose</code></td><td>Deterministic cleanup</td><td>Chromium and Node; not everywhere</td></tr>
<tr><td>Temporal</td><td>A correct date and time API</td><td>Chrome 144 and Firefox 139; Safari not in a stable release as of September 2026</td></tr>
</tbody>
</table></div>
<p class="sub">
  Treat this table as a starting point, not a source of truth: support changes
  every few weeks. The pages that stay current are MDN (each page ends with a
  compatibility table) and the Baseline badges on MDN and web.dev.
</p>

<h3>Iterator helpers: lazy chains without an array</h3>
<pre><code>function* naturals() { let n = 1; while (true) yield n++; }

naturals()
  .filter((n) =&gt; n % 2 === 0)
  .map((n) =&gt; n * n)
  .take(5)
  .toArray();                  <span class="c">// [4, 16, 36, 64, 100]</span></code></pre>
<p>
  The same chain on an array would build a full intermediate array at every step,
  and on an infinite source it would never finish. Iterator helpers
  (<code>map</code>, <code>filter</code>, <code>take</code>, <code>drop</code>,
  <code>flatMap</code>, <code>reduce</code>, <code>toArray</code>,
  <code>some</code>, <code>every</code>, <code>find</code>) pull one value at a
  time through the whole chain, and stop as soon as <code>take</code> is
  satisfied. They work on generators, <code>Map</code> and <code>Set</code>
  iterators, and anything wrapped with <code>Iterator.from</code>. The catch:
  an iterator is consumed once, so a helper chain cannot be replayed.
</p>

<h3>Promise.try: one rule for sync and async failures</h3>
<pre><code>function load(input) {
  return Promise.try(() =&gt; JSON.parse(input))   <span class="c">// a sync throw becomes a rejection</span>
    .then(save);
}

load("{ not json").catch(report);                <span class="c">// the error arrives here, not as a thrown exception</span></code></pre>
<p>
  A function that is sometimes synchronous and sometimes returns a promise is a
  trap: a caller who writes <code>.catch</code> is not protected from the sync
  throw. The older fixes each have a flaw.
  <code>Promise.resolve().then(fn)</code> catches the error but delays running
  <code>fn</code> to a later microtask; <code>new Promise((res) =&gt;
  res(fn()))</code> is correct but noisy. <code>Promise.try(fn, ...args)</code>
  runs <code>fn</code> <b>immediately and synchronously</b>, and turns whatever
  happens &mdash; a return value, a promise, a throw &mdash; into a promise.
</p>

<h3>RegExp.escape: user text inside a pattern</h3>
<pre><code>const term = "file (1).txt";
new RegExp(term).test("file 1.txt");                 <span class="c">// true — the "." and ( ) were treated as syntax</span>
new RegExp(RegExp.escape(term)).test("file 1.txt");  <span class="c">// false — matched literally</span></code></pre>
<p>
  Building a regular expression from a search box without escaping is both a bug
  (a stray <code>(</code> throws) and a security problem (a crafted pattern can
  backtrack catastrophically). Everyone used to paste the same
  <code>replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&amp;")</code> helper. The built-in
  version handles the edge cases that helper misses, including making the result
  safe to place next to other pattern text; note that it may write a leading
  letter or digit as a hex escape such as <code>\\x61</code>, which looks odd and
  matches the same thing. Regular expressions also gained inline modifiers, so
  <code>/^(?i:bearer) abc$/</code> is case-insensitive for just one group.
</p>

<h3>Error.isError, and why instanceof is not enough</h3>
<pre><code>const foreign = iframe.contentWindow.eval("new Error('x')");

foreign instanceof Error;      <span class="c">// false — it came from another realm's Error</span>
Error.isError(foreign);        <span class="c">// true</span></code></pre>
<p>
  Every iframe, worker and Node <code>vm</code> context has its own copy of
  <code>Error</code>, so <code>instanceof</code> fails for errors that crossed a
  boundary. <code>Error.isError</code> checks for the real internal error data,
  not the prototype chain, so it is true for genuine errors from any realm and
  false for a plain object that merely inherits from <code>Error.prototype</code>.
  It matters most in code that receives errors from elsewhere: a logging library,
  a test framework, a <code>postMessage</code> handler.
</p>

<h3>Set methods and a few smaller ones</h3>
<pre><code>const a = new Set([1, 2, 3]);
const b = new Set([3, 4]);

a.union(b);                <span class="c">// Set {1, 2, 3, 4}</span>
a.intersection(b);         <span class="c">// Set {3}</span>
a.difference(b);           <span class="c">// Set {1, 2}</span>
a.isSubsetOf(b);           <span class="c">// false</span>

await Array.fromAsync(asyncGenerator());       <span class="c">// an array of every yielded value, in order</span>
new Float16Array([1.337])[0];                  <span class="c">// 1.3369140625 — half precision</span></code></pre>
<p>
  Set methods replace a loop or a spread-and-filter, and they return new sets.
  <code>Array.fromAsync</code> awaits an async iterable one item at a time and
  gives you a normal array. <code>Float16Array</code> stores numbers in 16 bits,
  which is the point: graphics, GPU and machine-learning data where memory
  matters more than precision. Explicit resource management
  (<code>using handle = open()</code>, with <code>Symbol.dispose</code>) is
  covered with <a href="/notes/metaprogramming">metaprogramming</a>.
</p>

<h3>Temporal, the one that changes daily work</h3>
<pre><code>const today = Temporal.Now.plainDateISO();          <span class="c">// a date, no time, no zone</span>
today.add({ days: 30 });

const meeting = Temporal.ZonedDateTime.from("2026-03-07T09:00[America/New_York]");
meeting.add({ days: 1 }).toString();
<span class="c">// "2026-03-08T09:00:00-04:00[America/New_York]" — still 9:00 on the wall, offset changed</span></code></pre>
<p>
  <code>Date</code> mixes an instant, a local time and a formatting locale in one
  mutable object, which is where most date bugs come from. Temporal separates
  them: <code>PlainDate</code> for a calendar date, <code>Instant</code> for an
  exact moment, <code>ZonedDateTime</code> for a moment in a named time zone,
  <code>Duration</code> for an amount. Arithmetic respects daylight saving, and
  every object is immutable. Temporal reached the final stage of the standards
  process in March 2026, and Chrome and Firefox ship it; Safari had not shipped
  it in a stable release when this was written, so production code still uses the
  <code>@js-temporal/polyfill</code> package. The
  <a href="/notes/regex-dates-apis">dates section</a> shows why it exists.
</p>

<h3>Using new features without breaking old browsers</h3>
<pre><code>if (typeof Promise.try !== "function") {
  Promise.try = (fn, ...args) =&gt; new Promise((resolve) =&gt; resolve(fn(...args)));
}</code></pre>
<ul>
  <li><b>New syntax</b> (<code>using</code>, import attributes, regex modifiers) is a parse error in an engine that does not know it, so it needs a transpiler for older targets.</li>
  <li><b>New built-ins</b> (<code>Promise.try</code>, Set methods, iterator helpers) are just missing functions: feature-detect them, or load a polyfill such as core-js. Transpiling cannot add them.</li>
  <li><b>Decide by your data.</b> Set your build's browser targets from your own analytics rather than a guess, and let that decide which of the above needs help.</li>
  <li><b>Node counts too.</b> The same feature can be safe in the browser and missing in the Node version you deploy to; check both.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "A feature's spec year is not its support date, so I check MDN and Baseline for
    my actual audience, feature-detect or polyfill new built-ins such as
    <code>Promise.try</code> and iterator helpers, transpile new syntax such as
    <code>using</code>, and reach for Temporal instead of <code>Date</code> where
    time zones or daylight saving are involved."
  </p>
</div>`,
};
