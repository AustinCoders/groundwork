import type { Chapter } from "../types";

export const cheat: Chapter = {
  id: "cheat",
  num: "★",
  title: "The cheat page",
  short: "Cheat page",
  levels: ["beginner", "intermediate", "advanced"],
  practice: [],
  ready: true,
  subtitle: "Not a 24th lesson — the night-before-the-interview skim of the other 23.",
  body: `<p>
  Nothing new gets taught here. Every row links back to the chapter
  that actually explains the <em>why</em> — this page exists purely so
  the <em>what</em> is skimmable in one pass, table after table,
  instead of re-reading three levels of chapters the night before
  something matters.
</p>

<h3>Coercion &amp; comparison, at a glance</h3>
<div class="chipset">
  <span class="chip tone-yes">null == undefined</span>
  <span class="chip tone-yes">0 == false</span>
  <span class="chip tone-yes">"0" == 0</span>
  <span class="chip tone-yes">[] == false</span>
  <span class="chip tone-bad">NaN == NaN</span>
  <span class="chip tone-bad">null == 0</span>
  <span class="chip tone-bad">"" == "0"</span>
</div>
<p class="sub">Full coercion table and the non-transitivity proof: <a href="/notes/operators-flow">Operators &amp; flow</a>.</p>
<div class="try">
  <pre><code>console.log(0.1 + 0.2);            <span class="c">// what happens?</span>
console.log(0.1 + 0.2 === 0.3);    <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>0.30000000000000004</code>, then <code>false</code>. Not a JS
  bug — IEEE 754 floats can't represent 0.1 or 0.2 exactly in binary,
  in any language that uses them. Never compare floats with
  <code>===</code>; compare
  <code>Math.abs(a - b) &lt; Number.EPSILON</code> instead, or work in
  integers (cents, not dollars) where exactness actually matters.
</p>
<table>
  <tr><th></th><th><code>===</code></th><th><code>Object.is()</code></th></tr>
  <tr><td><code>NaN</code> vs <code>NaN</code></td><td class="tone-bad">false</td><td class="tone-yes">true</td></tr>
  <tr><td><code>0</code> vs <code>-0</code></td><td class="tone-yes">true</td><td class="tone-bad">false</td></tr>
</table>

<h3>Type checks, at a glance</h3>
<table>
  <tr><th>Expression</th><th>Result</th></tr>
  <tr><td><code>typeof null</code></td><td><code>"object"</code> — a 25-year-old bug, permanent for compatibility</td></tr>
  <tr><td><code>typeof undefined</code></td><td><code>"undefined"</code></td></tr>
  <tr><td><code>typeof NaN</code></td><td><code>"number"</code> — NaN IS a number, just not a useful one</td></tr>
  <tr><td><code>typeof []</code></td><td><code>"object"</code> — use <code>Array.isArray()</code></td></tr>
  <tr><td><code>typeof function(){}</code>, <code>typeof class{}</code></td><td>both <code>"function"</code></td></tr>
  <tr><td><code>typeof Symbol()</code>, <code>typeof 10n</code></td><td><code>"symbol"</code>, <code>"bigint"</code></td></tr>
  <tr><td><code>[1,2] === [1,2]</code></td><td><code>false</code> — different references, same shape</td></tr>
</table>
<p class="sub">Full type system: <a href="/notes/types-values">Types &amp; values</a>. Reference vs primitive: same chapter.</p>

<h3>Scope, closures, this — the 30-second version</h3>
<table>
  <tr><th>Rank</th><th>Rule</th><th>Trigger</th></tr>
  <tr><td>1</td><td><b>new</b></td><td><code>new Fn()</code></td></tr>
  <tr><td>2</td><td><b>explicit</b></td><td><code>.call()</code> / <code>.apply()</code> / <code>.bind()</code></td></tr>
  <tr><td>3</td><td><b>implicit</b></td><td><code>obj.method()</code></td></tr>
  <tr><td>4</td><td><b>default</b></td><td>bare <code>fn()</code> → <code>undefined</code> in strict mode</td></tr>
</table>
<p class="sub">
  Arrows never bind their own <code>this</code> — they read it from
  where they're written. Full precedence proof (including
  <code>new</code> beating <code>bind</code>) and all five real
  closure uses: <a href="/notes/scope-functions">Scope &amp; functions, properly</a>.
</p>

<h3>Array &amp; object methods — mutates, or doesn't?</h3>
<table>
  <tr><th>Mutates the original</th><th>Returns a new one, leaves the original alone</th></tr>
  <tr><td><code>push</code>, <code>pop</code>, <code>shift</code>, <code>unshift</code></td><td><code>slice</code>, <code>concat</code>, <code>map</code>, <code>filter</code></td></tr>
  <tr><td><code>splice</code>, <code>sort</code>, <code>reverse</code></td><td><code>flat</code>, <code>flatMap</code>, spread <code>[...arr]</code></td></tr>
  <tr><td><code>Object.assign(target, …)</code></td><td><code>{ ...obj }</code>, <code>structuredClone(obj)</code></td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ .map() skips holes in a sparse array</span>
  <code>Array(3).map(x =&gt; 1)</code> is still
  <code>[ &lt;3 empty items&gt; ]</code>, not <code>[1, 1, 1]</code> —
  <code>Array(3)</code> creates empty slots, not <code>undefined</code>
  values, and <code>map</code>/<code>forEach</code>/<code>filter</code>
  all skip holes entirely. <code>Array.from({ length: 3 })</code> or
  <code>Array(3).fill()</code> first if you actually want real,
  mappable elements.
</div>
<p class="sub">Full method tables: <a href="/notes/objects-arrays-basics">Objects &amp; arrays (first half)</a> and <a href="/notes/objects-deep">Objects deeply</a>.</p>

<h3>Async ordering — the one rule</h3>
<p>
  Sync code runs first, always. Then the <b>whole</b> microtask queue
  drains (every <code>.then()</code>, every <code>await</code>
  continuation) — completely — before a single macrotask
  (<code>setTimeout</code>, a click) gets a turn.
</p>
<table>
  <tr><th>Combinator</th><th>Settles when</th></tr>
  <tr><td><code>Promise.all</code></td><td>all fulfill, or the first rejection</td></tr>
  <tr><td><code>Promise.allSettled</code></td><td>everything has settled — never rejects itself</td></tr>
  <tr><td><code>Promise.race</code></td><td>the first to settle, win or lose</td></tr>
  <tr><td><code>Promise.any</code></td><td>the first to <b>fulfill</b> — ignores earlier rejections</td></tr>
</table>
<p class="sub">Full step-through demos: <a href="/notes/setup-mental-model">Setup &amp; mental model</a>. Sequential-vs-parallel await, retries, AbortController: <a href="/notes/async-properly">Async, properly</a>.</p>

<h3>Classes &amp; prototypes — the 30-second version</h3>
<pre><code>obj.hasOwnProperty("x")     <span class="c">// true only for OWN properties, never inherited ones</span>
Object.getPrototypeOf(obj)  <span class="c">// the real link an instance follows</span>
Fn.prototype                <span class="c">// what becomes that link for every "new Fn()"</span>
class B extends A {
  constructor() { super(); }   <span class="c">// MUST run before "this" is usable</span>
}</code></pre>
<p class="sub">The 4 steps <code>new</code> actually performs, and <code>#private</code> being parser-enforced: <a href="/notes/prototypes-oop">Prototypes &amp; OOP</a>.</p>

<h3>"Implement X" — the classic from-scratch asks</h3>
<table>
  <tr><th>Ask</th><th>Taught in</th></tr>
  <tr><td>debounce / throttle</td><td><a href="/notes/scope-functions">Scope &amp; functions, properly</a></td></tr>
  <tr><td>curry / partial application / compose</td><td><a href="/notes/scope-functions">Scope &amp; functions, properly</a>, <a href="/notes/patterns-architecture">Patterns &amp; architecture</a></td></tr>
  <tr><td>memoize / once</td><td><a href="/notes/scope-functions">Scope &amp; functions, properly</a></td></tr>
  <tr><td>your own EventEmitter / pub-sub</td><td><a href="/notes/patterns-architecture">Patterns &amp; architecture</a></td></tr>
  <tr><td>deep clone</td><td><code>structuredClone()</code> — <a href="/notes/objects-deep">Objects deeply</a></td></tr>
  <tr><td>a concurrency-limited task queue</td><td><a href="/notes/advanced-async">Advanced async</a></td></tr>
  <tr><td>a custom iterable (<code>Symbol.iterator</code>)</td><td><a href="/notes/metaprogramming">Metaprogramming</a></td></tr>
  <tr><td><code>new</code> from scratch</td><td><a href="/notes/prototypes-oop">Prototypes &amp; OOP</a></td></tr>
</table>

<h3>The gotchas grid</h3>
<div class="chipset">
  <span class="chip tone-warn">{} + [] → 0 (statement position)</span>
  <span class="chip tone-warn">[] + {} → "[object Object]"</span>
  <span class="chip tone-warn">1 &lt; 2 &lt; 3 → true</span>
  <span class="chip tone-warn">3 &gt; 2 &gt; 1 → false</span>
  <span class="chip tone-warn">var in a loop + setTimeout → same value every time</span>
  <span class="chip tone-warn">forEach can't be broken out of</span>
  <span class="chip tone-warn">indexOf(NaN) is always -1</span>
  <span class="chip tone-warn">a bound "this" loses to new</span>
</div>
<p class="sub">Every one of these is explained, not just listed, in <a href="/notes/operators-flow">Operators &amp; flow</a>, <a href="/notes/scope-functions">Scope &amp; functions, properly</a>, and <a href="/notes/objects-arrays-basics">Objects &amp; arrays</a>.</p>

<h3>How to actually use this page</h3>
<ol>
  <li>Don't start here. Every row above assumes the chapter behind its link has already been read once — this page is recall, not first exposure.</li>
  <li>Cover the "Result" column with your hand and predict it before checking. Being surprised by a row you've "read" before is the actual signal it needs another real pass, not just a re-skim.</li>
  <li>For the gotchas grid specifically: cover the chip past the arrow and say the <em>reason</em> out loud, not just the result — "why" is what an interviewer is actually asking for.</li>
  <li>If a whole section reads unfamiliar rather than "oh right" — go read that chapter properly. This page is a mirror, not a shortcut past the mirror.</li>
</ol>`,
};
