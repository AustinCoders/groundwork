import type { Chapter } from "../types";

export const stringsNumbersMath: Chapter = {
  id: "strings-numbers-math",
  num: "B8",
  title: "Strings, numbers & Math",
  short: "Strings & Math",
  levels: ["beginner"],
  practice: ["ex-pad-time", "ex-random-int", "ex-format-price"],
  ready: true,
  subtitle: "The everyday toolbox every other chapter quietly assumes you already have.",
  body: `<h3>String methods beyond the basics</h3>
<p>
  <a href="/notes/types-values">The types chapter</a> already covered
  <code>slice</code>, <code>trim</code>, <code>includes</code> and
  <code>split</code>. These come up just as often and didn't fit there.
</p>
<pre><code>"Hello World".startsWith("Hello");     <span class="c">// true</span>
"Hello World".endsWith("World");       <span class="c">// true</span>
"Hello World".startsWith("World", 6);  <span class="c">// true — search starts at index 6, not the very start</span>

"7".padStart(3, "0");                  <span class="c">// "007" — pad on the LEFT to a minimum length</span>
"7".padEnd(3, ".");                    <span class="c">// "7.." — pad on the RIGHT</span>

"ha".repeat(3);                         <span class="c">// "hahaha"</span></code></pre>
<p class="sub">
  <code>padStart</code> is the standard fix for "always show two
  digits" — <code>String(minutes).padStart(2, "0")</code> turns
  <code>5</code> into <code>"05"</code> — without hand-rolling an
  <code>if (x &lt; 10)</code> check.
</p>

<h3>Comparing text properly</h3>
<div class="try">
  <pre><code>console.log(["résumé", "resume", "zebra"].sort());
console.log(["résumé", "resume", "zebra"].sort((a, b) =&gt; a.localeCompare(b)));</code></pre>
</div>
<p class="sub">
  A plain <code>.sort()</code> with no comparator compares strings by
  raw UTF-16 code unit — accented characters and non-Latin scripts
  routinely land in the wrong place. <code>localeCompare</code> sorts
  the way a human reading that language actually expects, and takes an
  optional locale and options argument
  (<code>a.localeCompare(b, "en", { sensitivity: "base" })</code>) for
  case-insensitive, accent-insensitive comparison in one call instead
  of lowercasing both sides by hand.
</p>

<h3>Math — the methods that actually get used</h3>
<table>
  <tr><th>Call</th><th>Does</th></tr>
  <tr><td><code>Math.round(x)</code></td><td>nearest integer — <code>.5</code> rounds up</td></tr>
  <tr><td><code>Math.floor(x)</code></td><td>rounds down, always — toward negative infinity</td></tr>
  <tr><td><code>Math.ceil(x)</code></td><td>rounds up, always</td></tr>
  <tr><td><code>Math.trunc(x)</code></td><td>drops the decimal part — rounds toward zero</td></tr>
  <tr><td><code>Math.abs(x)</code></td><td>absolute value</td></tr>
  <tr><td><code>Math.min(...)</code> / <code>Math.max(...)</code></td><td>smallest/largest of the arguments — not an array; spread one in</td></tr>
  <tr><td><code>Math.random()</code></td><td>a float, from <code>0</code> up to (never including) <code>1</code></td></tr>
</table>
<div class="try">
  <pre><code>console.log(Math.floor(-4.5));
console.log(Math.trunc(-4.5));</code></pre>
</div>
<p class="sub">
  <code>-5</code>, then <code>-4</code> — the difference only shows up
  on negative numbers. <code>floor</code> always moves toward negative
  infinity; <code>trunc</code> always moves toward zero. Reaching for
  the wrong one is a real, if rare, off-by-one source once negative
  values are involved.
</p>

<h3>A random integer in a range</h3>
<pre><code>function randomInt(min, max) {                 <span class="c">// inclusive of both min and max</span>
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
randomInt(1, 6);   <span class="c">// a dice roll — 1 through 6, inclusive</span></code></pre>
<p class="sub">
  <code>Math.random()</code> alone gives a float between 0 and just
  under 1 — never useful on its own. Multiplying by the size of the
  range and flooring turns that float into one of exactly
  <code>max - min + 1</code> whole numbers; the final <code>+ min</code>
  shifts the whole range to start at the right place instead of at 0.
  This exact formula is worth memorizing — it gets asked for cold often
  enough that deriving it live, under pressure, is its own small trap.
</p>

<h3>Formatting numbers for display</h3>
<pre><code>(1234.5).toFixed(2);                 <span class="c">// "1234.50" — a STRING, fixed decimal places, no thousands separator</span>
(1234.5).toLocaleString("en-IN");    <span class="c">// "1,234.5" — locale-correct digit grouping</span>
(1234.5).toLocaleString("en-IN", { style: "currency", currency: "INR" });
<span class="c">// "₹1,234.50"</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ toFixed rounds, and always returns a string</span>
  <code>(1.005).toFixed(2)</code> is <code>"1.00"</code>, not
  <code>"1.01"</code> — the same floating-point imprecision from
  <a href="/notes/types-values">the types chapter</a> means
  <code>1.005</code> isn't quite exactly representable to begin with.
  And the return value is always a string —
  <code>(5).toFixed(2) + 1</code> is <code>"5.001"</code>,
  concatenation, not addition, unless it's converted back with
  <code>Number(...)</code> first.
</div>
<p class="sub">
  <code>toFixed</code> and <code>toLocaleString</code> solve different
  problems: <code>toFixed</code> guarantees an exact number of decimal
  places with no locale awareness at all; <code>toLocaleString</code>
  formats for a specific reader's language and region (digit grouping,
  currency symbol placement) but won't force a fixed decimal count
  unless told to. For money specifically,
  <code>Intl.NumberFormat</code> (covered in
  <a href="/notes/regex-dates-apis">Regex &amp; dates</a>) is the same
  formatting engine <code>toLocaleString</code> calls internally —
  worth reaching for directly when formatting many values with the
  same options at once.
</p>`,
};
