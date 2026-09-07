import type { Chapter } from "../types";

export const typesValues: Chapter = {
  id: "types-values",
  num: "B2",
  title: "Types & values",
  short: "Types & values",
  levels: ["beginner"],
  practice: ["ex-typeof-guard", "ex-falsy-filter", "ex-copy-share"],
  ready: true,
  subtitle: "Eight types, one conversion table, and the equality check that never stops mattering.",
  body: `<h3>Seven primitives + object</h3>
<p>
  JavaScript has exactly eight types. Seven are <b>primitives</b>;
  everything else — arrays, functions, dates, regular expressions — is an
  <b>object</b>. Two things define a primitive: it's <b>immutable</b>, and
  it's <b>copied by value</b>.
</p>

<table>
  <tr>
    <th>Primitive</th>
    <th>Example</th>
    <th><code>typeof</code></th>
  </tr>
  <tr>
    <td>string</td>
    <td><code>"hi"</code></td>
    <td><code>"string"</code></td>
  </tr>
  <tr>
    <td>number</td>
    <td><code>42</code>, <code>3.14</code>, <code>NaN</code></td>
    <td><code>"number"</code></td>
  </tr>
  <tr>
    <td>bigint</td>
    <td><code>10n</code></td>
    <td><code>"bigint"</code></td>
  </tr>
  <tr>
    <td>boolean</td>
    <td><code>true</code>, <code>false</code></td>
    <td><code>"boolean"</code></td>
  </tr>
  <tr>
    <td>undefined</td>
    <td><code>undefined</code></td>
    <td><code>"undefined"</code></td>
  </tr>
  <tr>
    <td>null</td>
    <td><code>null</code></td>
    <td><code>"object"</code> — a bug, see below</td>
  </tr>
  <tr>
    <td>symbol</td>
    <td><code>Symbol("id")</code></td>
    <td><code>"symbol"</code></td>
  </tr>
  <tr>
    <td>— everything else —</td>
    <td>arrays, functions, dates, <code>{}</code>…</td>
    <td><code>"object"</code> or <code>"function"</code></td>
  </tr>
</table>

<div class="say">
  <span class="ttl">The one rule that explains most bugs →</span>
  a primitive is copied whole; an object is only ever handed around by
  reference. Two different variables can end up pointing at the
  <em>same</em> object.
</div>

<div class="demo">
  <div class="demo__bar">Copy by value vs copy by reference</div>
  <div class="demo__body">
    <div class="boxes">
      <div class="bx is-prim">
        <div class="bx__cap">Primitive — the value itself is copied</div>
        <div class="bx__slot"><b>let a</b><span id="tv-cv-a">10</span></div>
        <div class="bx__slot"><b>let b = a</b><span id="tv-cv-b">10</span></div>
        <div class="bx__arrow" id="tv-cv-msg">two independent boxes</div>
      </div>
      <div class="bx is-ref">
        <div class="bx__cap">Object — only the reference is copied</div>
        <div class="bx__slot"><b>let o1</b><span id="tv-cr-1">{ n: 10 }</span></div>
        <div class="bx__slot"><b>let o2 = o1</b><span id="tv-cr-2">{ n: 10 }</span></div>
        <div class="bx__arrow">both names point at the SAME object ↑</div>
      </div>
    </div>
    <div class="demo__ctl">
      <button class="btn" id="tv-cv-go" type="button">
        b = 20 &nbsp;/&nbsp; o2.n = 20
      </button>
      <button class="btn btn--ghost" id="tv-cv-reset" type="button">
        Reset
      </button>
    </div>
    <p class="demo__note">
      Change the copy and watch what happens to the original. This one
      difference explains most "why did my array change?" bugs — and
      it's exactly what the "Copy without sharing" exercise below is
      testing.
    </p>
  </div>
</div>

<div class="try">
  <pre><code>let s = "hello";
s[0] = "H";                     <span class="c">// silently ignored</span>
console.log(s);                 <span class="c">// still "hello"</span>
console.log(s.toUpperCase());   <span class="c">// "HELLO" — a NEW string</span>
console.log(s);                 <span class="c">// still "hello"</span>
s.custom = 1;                   <span class="c">// silently ignored too</span>
console.log(s.custom);          <span class="c">// undefined</span></code></pre>
</div>
<p class="sub">
  So why does <code>"abc".length</code> work at all, if strings can't hold
  properties? <b>Autoboxing</b> — the engine wraps the primitive in a
  throwaway <code>String</code> object, reads the property, then discards
  the wrapper. That's also why <code>s.custom = 1</code> above does
  nothing: you wrote to something that was already gone.
</p>

<h3>typeof — and its two lies</h3>
<p>
  <code>typeof</code> returns one of eight strings, and it's the one
  operator that can safely touch an undeclared name without throwing. It
  tells the truth about primitives — but two of its answers are traps.
</p>
<table>
  <tr>
    <th>Expression</th>
    <th>typeof</th>
    <th>Note</th>
  </tr>
  <tr>
    <td><code>typeof null</code></td>
    <td class="tone-bad">"object"</td>
    <td>
      a 1995 bug kept forever for compatibility — check
      <code>value === null</code> instead
    </td>
  </tr>
  <tr>
    <td><code>typeof []</code></td>
    <td class="tone-warn">"object"</td>
    <td>arrays are objects — use <code>Array.isArray(v)</code></td>
  </tr>
  <tr>
    <td><code>typeof function(){}</code></td>
    <td class="tone-yes">"function"</td>
    <td>the one honest special case — functions are still objects underneath</td>
  </tr>
  <tr>
    <td><code>typeof undeclaredName</code></td>
    <td class="tone-yes">"undefined"</td>
    <td>no <code>ReferenceError</code> — safe to use as a feature check</td>
  </tr>
</table>
<div class="try">
  <pre><code>console.log(typeof null);        <span class="c">// the trap</span>
console.log(typeof []);          <span class="c">// also a trap</span>
console.log(Array.isArray([]));  <span class="c">// the fix</span>
console.log(typeof (() => {}));
console.log(typeof Symbol("x"));
console.log(typeof 10n);</code></pre>
</div>

<h3>null vs undefined</h3>
<p>
  Both mean "no value" — the difference is <b>who wrote it</b>.
  <code>undefined</code> is absence by default, handed to you by
  JavaScript. <code>null</code> is absence on purpose, assigned by a
  developer.
</p>
<table>
  <tr>
    <th></th>
    <th>Default parameter fires?</th>
    <th>Survives <code>JSON.stringify</code>?</th>
  </tr>
  <tr>
    <th><code>undefined</code></th>
    <td class="tone-yes">yes</td>
    <td class="tone-bad">no — the key is dropped</td>
  </tr>
  <tr>
    <th><code>null</code></th>
    <td class="tone-bad">no — null is a real value, not "missing"</td>
    <td class="tone-yes">yes, kept</td>
  </tr>
</table>
<div class="try">
  <pre><code>function greet(name = "friend") { return "Hi " + name; }
console.log(greet(undefined));   <span class="c">// default fires</span>
console.log(greet(null));        <span class="c">// default does NOT fire</span>

const v1 = 0, v2 = null;
console.log(v1 ?? "fallback");   <span class="c">// 0 — a real value survives</span>
console.log(v1 || "fallback");   <span class="c">// "fallback" — || can't tell 0 from "missing"</span>
console.log(v2 ?? "fallback");   <span class="c">// "fallback"</span></code></pre>
</div>
<p class="sub">
  <code>||</code> falls back on <em>any</em> falsy value, so a real
  <code>0</code> or <code>""</code> gets silently replaced.
  <code>??</code> only falls back on <code>null</code> and
  <code>undefined</code> — reach for it whenever zero or empty string are
  legitimate answers.
</p>
<div class="sticky mint">
  <span class="ttl">The one accepted == exception</span>
  <code>x == null</code> is true for both <code>null</code> and
  <code>undefined</code>, and false for everything else — a deliberate,
  readable way to check "is this missing".
</div>

<h3>Numbers</h3>
<p>
  There is only <b>one</b> number type: a 64-bit IEEE 754 double. No int,
  no float distinction — <code>1</code> and <code>1.0</code> are the same
  value, which is also why floating point gets weird.
</p>
<div class="try">
  <pre><code>console.log(0.1 + 0.2);          <span class="c">// not 0.3</span>
console.log(0.1 + 0.2 === 0.3);  <span class="c">// false</span>
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON); <span class="c">// the real check</span></code></pre>
</div>
<p class="sub">
  Not a JavaScript bug — <code>0.1</code> has no exact binary form, the
  same way 1/3 has no exact decimal form. Identical result in Java, C and
  Python. Compare with a tolerance, and never store money in a float —
  keep integer cents.
</p>
<table>
  <tr>
    <th>Value</th>
    <th>How you get it</th>
    <th>How to detect it</th>
  </tr>
  <tr>
    <td><code>NaN</code></td>
    <td><code>0 / 0</code>, <code>Number("abc")</code></td>
    <td><code>Number.isNaN(v)</code> — never <code>===</code></td>
  </tr>
  <tr>
    <td><code>Infinity</code></td>
    <td><code>1 / 0</code></td>
    <td><code>Number.isFinite(v)</code></td>
  </tr>
  <tr>
    <td><code>-0</code></td>
    <td>literal <code>-0</code>, or <code>-1 * 0</code></td>
    <td><code>Object.is(v, -0)</code> — <code>-0 === 0</code> is true</td>
  </tr>
  <tr>
    <td>past <code>MAX_SAFE_INTEGER</code></td>
    <td>2<sup>53</sup> and beyond</td>
    <td>
      <code>Number.isSafeInteger(v)</code> — use <code>BigInt</code> for
      exact large integers
    </td>
  </tr>
</table>
<div class="try">
  <pre><code>console.log(isNaN("abc"));         <span class="c">// true — coerces first</span>
console.log(Number.isNaN("abc"));  <span class="c">// false — no coercion, the honest answer</span>
console.log(Number.isNaN(NaN));    <span class="c">// true</span></code></pre>
</div>
<p class="sub">
  The global <code>isNaN</code> coerces its argument before checking, so
  it really answers "would this become NaN" — almost never the question
  you meant. <code>Number.isNaN</code> does no coercion. Use it.
</p>

<h3>parseInt, parseFloat, toFixed</h3>
<p>
  Three different parsers, not synonyms. <code>Number()</code> is strict —
  the whole string or <code>NaN</code>. <code>parseInt</code> and
  <code>parseFloat</code> are lenient: they read a prefix and stop at the
  first character they don't understand.
</p>
<div class="try">
  <pre><code>console.log(Number("42px"));        <span class="c">// NaN — not the whole string</span>
console.log(parseInt("42px"));      <span class="c">// 42 — reads a prefix</span>
console.log(parseFloat("3.14em"));  <span class="c">// 3.14</span>
console.log(parseInt("0x1F"));      <span class="c">// 31 — reads hex on its own</span>
console.log(parseInt("08", 10));    <span class="c">// always pass the radix</span></code></pre>
</div>
<div class="warn">
  <span class="ttl">⚠ The map(parseInt) trap</span>
  <code>["1","2","3"].map(parseInt)</code> gives
  <code>[1, NaN, NaN]</code>. <code>map</code> calls its function with
  <code>(value, index, array)</code>, so <code>parseInt</code> receives
  the index as its <em>radix</em> — radix 1 is invalid, and radix 2 can't
  read "3". Use <code>.map(Number)</code> or
  <code>.map(s =&gt; parseInt(s, 10))</code> instead.
</div>
<div class="try">
  <pre><code>console.log((1.005).toFixed(2));    <span class="c">// "1.00" — not "1.01"</span>
console.log(typeof (1).toFixed(2)); <span class="c">// "string"</span></code></pre>
</div>
<p class="sub">
  <code>toFixed</code> returns a <b>string</b>, and it rounds the double
  that actually exists in memory — <code>1.005</code> is really
  <code>1.00499999…</code>, so it rounds down. For display use
  <code>Intl.NumberFormat</code>; for money, round integer cents yourself.
</p>

<h3>Strings</h3>
<p>
  Immutable, and stored as <b>UTF-16 code units</b> — which is where
  <code>.length</code> stops meaning "number of characters".
</p>
<div class="try">
  <pre><code>const name = "Ana", n = 3;
console.log(\`Hi \${name}, you have \${n} item\${n === 1 ? "" : "s"}\`);</code></pre>
</div>
<p class="sub">
  Any expression fits inside <code>\${…}</code> — ternaries, function
  calls, even math. Multiline needs no <code>\\n</code> — a real line
  break inside the backticks is enough.
</p>
<div class="try">
  <pre><code>const s = "café 👍";
console.log(s.length);        <span class="c">// 6 — code UNITS, not characters</span>
console.log([...s].length);   <span class="c">// 5 — code points</span></code></pre>
</div>
<p class="sub">
  The 👍 is a <b>surrogate pair</b> — one character stored as two code
  units. For plain ASCII this never shows up; the moment emoji or accented
  characters appear, <code>.length</code> quietly lies.
</p>
<table>
  <tr>
    <th></th>
    <th><code>slice(a, b)</code></th>
    <th><code>substring(a, b)</code></th>
  </tr>
  <tr>
    <th>negative index</th>
    <td class="tone-yes">counts from the end</td>
    <td class="tone-bad">clamped to 0</td>
  </tr>
  <tr>
    <th>start &gt; end</th>
    <td class="tone-yes">returns <code>""</code></td>
    <td class="tone-bad">silently swaps the two</td>
  </tr>
</table>
<p class="sub">
  Prefer <code>slice</code> — one consistent set of rules.
  <code>substr</code> is deprecated.
</p>
<div class="try">
  <pre><code>const s = "  Hello, World  ";
console.log(s.trim());
console.log(s.trim().toUpperCase());
console.log(s.includes("World"));
console.log(s.trim().split(", "));
console.log(s.trim().replaceAll("o", "0"));
console.log(s.slice(2, 7));</code></pre>
</div>
<p class="sub">
  Every one of these returns a <b>new</b> string. There is no in-place
  string operation in JavaScript.
</p>
<table>
  <tr>
    <th>Sequence</th>
    <th>Meaning</th>
  </tr>
  <tr>
    <td><code>\\n</code></td>
    <td>newline</td>
  </tr>
  <tr>
    <td><code>\\t</code></td>
    <td>tab</td>
  </tr>
  <tr>
    <td><code>\\\\</code></td>
    <td>one literal backslash</td>
  </tr>
  <tr>
    <td><code>\\"</code></td>
    <td>escaped quote — or just switch quote style</td>
  </tr>
  <tr>
    <td><code>\\u00e9</code></td>
    <td>→ é — 4 hex digits, one code unit</td>
  </tr>
</table>

<h3>Truthy / falsy — the eight</h3>
<p>
  The falsy list is short and <b>closed</b>. Memorise these eight —
  everything else in the language is truthy.
</p>
<div class="chipset">
  <span class="chip tone-bad">false</span>
  <span class="chip tone-bad">0</span>
  <span class="chip tone-bad">-0</span>
  <span class="chip tone-bad">0n</span>
  <span class="chip tone-bad">""</span>
  <span class="chip tone-bad">null</span>
  <span class="chip tone-bad">undefined</span>
  <span class="chip tone-bad">NaN</span>
</div>
<p class="sub">
  Those eight are falsy. Everything else — including these commonly
  mistaken ones — is truthy:
</p>
<div class="chipset">
  <span class="chip tone-yes">"0"</span>
  <span class="chip tone-yes">"false"</span>
  <span class="chip tone-yes">[]</span>
  <span class="chip tone-yes">{}</span>
  <span class="chip tone-yes">[0]</span>
  <span class="chip tone-yes">" "</span>
  <span class="chip tone-yes">-1</span>
  <span class="chip tone-yes">function(){}</span>
</div>
<div class="try">
  <pre><code>console.log(!![]);         <span class="c">// true — [] is not in the falsy list</span>
console.log([] == false);  <span class="c">// true — == turns BOTH sides into numbers: false→0, []→""→0</span>
console.log([] === false); <span class="c">// false — different types, no coercion</span></code></pre>
</div>
<p class="sub">
  Two unrelated mechanisms landing on opposite-looking answers for the
  same value. <code>if</code> consults the falsy list; <code>==</code>
  runs a coercion algorithm.
</p>

<h3>Explicit conversion</h3>
<p>
  Three functions, always called <b>without</b> <code>new</code>.
  Converting on purpose is how you stop the language converting behind
  your back.
</p>
<table>
  <tr>
    <th>value</th>
    <th><code>String(v)</code></th>
    <th><code>Number(v)</code></th>
    <th><code>Boolean(v)</code></th>
  </tr>
  <tr>
    <td><code>""</code></td>
    <td><code>""</code></td>
    <td class="tone-yes">0</td>
    <td class="tone-bad">false</td>
  </tr>
  <tr>
    <td><code>"12"</code></td>
    <td><code>"12"</code></td>
    <td class="tone-yes">12</td>
    <td class="tone-yes">true</td>
  </tr>
  <tr>
    <td><code>"12px"</code></td>
    <td><code>"12px"</code></td>
    <td class="tone-bad">NaN</td>
    <td class="tone-yes">true</td>
  </tr>
  <tr>
    <td><code>null</code></td>
    <td><code>"null"</code></td>
    <td class="tone-yes">0</td>
    <td class="tone-bad">false</td>
  </tr>
  <tr>
    <td><code>undefined</code></td>
    <td><code>"undefined"</code></td>
    <td class="tone-bad">NaN</td>
    <td class="tone-bad">false</td>
  </tr>
  <tr>
    <td><code>[]</code></td>
    <td><code>""</code></td>
    <td class="tone-yes">0</td>
    <td class="tone-yes">true</td>
  </tr>
  <tr>
    <td><code>[5]</code></td>
    <td><code>"5"</code></td>
    <td class="tone-yes">5</td>
    <td class="tone-yes">true</td>
  </tr>
  <tr>
    <td><code>[1, 2]</code></td>
    <td><code>"1,2"</code></td>
    <td class="tone-bad">NaN</td>
    <td class="tone-yes">true</td>
  </tr>
</table>
<p class="sub">
  Object-to-primitive conversion runs <code>Symbol.toPrimitive</code>,
  then <code>valueOf</code>, then <code>toString</code> — the entire
  explanation for why <code>[] + []</code> is <code>""</code> and
  <code>[] + {}</code> is <code>"[object Object]"</code>.
</p>
<div class="try">
  <pre><code>console.log(String(null), Number(null), Boolean(null));
console.log(+"3.14");   <span class="c">// Number("3.14")</span>
console.log(5 + "");    <span class="c">// String(5) — the lazy way</span>
console.log(!!"");      <span class="c">// Boolean("")</span>
console.log([] + []);
console.log([] + {});</code></pre>
</div>

<h3>== vs ===</h3>
<p>
  <code>===</code> is one rule: same type <em>and</em> same value.
  <code>==</code> is an algorithm — <code>null == undefined</code> is a
  special case, and a mismatched type on either side gets converted
  before comparing.
</p>
<table>
  <tr>
    <th></th>
    <th><code>NaN</code> vs <code>NaN</code></th>
    <th><code>0</code> vs <code>-0</code></th>
    <th>coerces types?</th>
  </tr>
  <tr>
    <th><code>==</code></th>
    <td class="tone-bad">false</td>
    <td class="tone-yes">true</td>
    <td class="tone-bad">yes</td>
  </tr>
  <tr>
    <th><code>===</code></th>
    <td class="tone-bad">false</td>
    <td class="tone-yes">true</td>
    <td class="tone-yes">no</td>
  </tr>
  <tr>
    <th><code>Object.is</code></th>
    <td class="tone-yes">true</td>
    <td class="tone-bad">false</td>
    <td class="tone-yes">no</td>
  </tr>
  <tr>
    <th>SameValueZero</th>
    <td class="tone-yes">true</td>
    <td class="tone-yes">true</td>
    <td class="tone-yes">no</td>
  </tr>
</table>
<p class="sub">
  SameValueZero is what <code>Array.prototype.includes</code>,
  <code>Map</code> keys and <code>Set</code> members actually use — which
  is why <code>[NaN].includes(NaN)</code> is <code>true</code> while
  <code>[NaN].indexOf(NaN)</code> is <code>-1</code>
  (<code>indexOf</code> uses <code>===</code>).
</p>
<div class="try">
  <pre><code>console.log(0 == "0", 0 == "", "0" == "");
console.log(false == "false");    <span class="c">// false — "false" isn't the number 0</span>
console.log(null == undefined);   <span class="c">// true — the one special case</span>
console.log(null === undefined);  <span class="c">// false — different types</span>
console.log([NaN].includes(NaN), [NaN].indexOf(NaN));</code></pre>
</div>
<div class="sticky mint">
  <span class="ttl">The rule</span> Always <code>===</code>. The one
  accepted exception is <code>x == null</code>, which tests
  null-or-undefined in a single check.
</div>

<script>
(function () {
  var a = document.getElementById("tv-cv-a");
  var b = document.getElementById("tv-cv-b");
  var o1 = document.getElementById("tv-cr-1");
  var o2 = document.getElementById("tv-cr-2");
  var msg = document.getElementById("tv-cv-msg");
  var goBtn = document.getElementById("tv-cv-go");
  var resetBtn = document.getElementById("tv-cv-reset");

  if (!a) return; // this chapter isn't the one currently mounted
  if (a.dataset.demoInit) return;
  a.dataset.demoInit = "1";

  function reset() {
    a.textContent = "10";
    b.textContent = "10";
    o1.textContent = "{ n: 10 }";
    o2.textContent = "{ n: 10 }";
    msg.textContent = "two independent boxes";
    a.style.color = b.style.color = o1.style.color = "";
  }

  goBtn.addEventListener("click", function () {
    b.textContent = "20";
    b.style.color = "var(--green)";
    a.style.color = "var(--green)";
    o2.textContent = "{ n: 20 }";
    o1.textContent = "{ n: 20 }";
    o1.style.color = "var(--red)";
    msg.textContent = "a is still 10 — untouched";
  });

  resetBtn.addEventListener("click", reset);
})();
</script>

<h3>See what the callback captured</h3>
<p>The same loop twice, one keyword apart. Watch how many bindings each version creates — that is the whole difference.</p>

<div class="demo">
  <div class="demo__bar">var vs let in a loop — what the callback actually captured</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="lc-code"></div>
        <div class="loop-bar"><i id="lc-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="lc-prev" type="button">← Back</button>
          <button class="btn" id="lc-next" type="button">Next step →</button>
          <button class="btn" id="lc-play" type="button">Play</button>
          <button class="btn btn--ghost" id="lc-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Bindings in scope</div>
          <div id="lc-p-scope"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Queued callbacks</div>
          <div id="lc-p-cbs"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="lc-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "lc";
  var CODE = ["for (var i = 0; i < 3; i++)","  setTimeout(() => console.log(i));","","for (let j = 0; j < 3; j++)","  setTimeout(() => console.log(j));"];
  var STEPS = [{"line":null,"panels":{"scope":[],"cbs":[]},"note":"Two loops, one keyword apart. This is the closure question that shows up in every junior-to-mid interview."},{"line":1,"panels":{"scope":["i (var) = 0"],"cbs":[]},"note":"\`var i\` creates ONE binding for the whole function — every iteration shares it."},{"line":2,"panels":{"scope":["i (var) = 0"],"cbs":["cb → reads i"]},"note":"Iteration 0 queues a callback. It captures the VARIABLE, not the value."},{"line":1,"panels":{"scope":["i (var) = 1"],"cbs":["cb → reads i"]},"note":"i becomes 1. The already-queued callback sees the change — same box."},{"line":2,"panels":{"scope":["i (var) = 1"],"cbs":["cb → reads i","cb → reads i"]},"note":"Iteration 1 queues another callback pointing at the same i."},{"line":1,"panels":{"scope":["i (var) = 2"],"cbs":["cb → reads i","cb → reads i"]},"note":"i becomes 2."},{"line":2,"panels":{"scope":["i (var) = 2"],"cbs":["cb → reads i","cb → reads i","cb → reads i"]},"note":"Third callback queued."},{"line":1,"panels":{"scope":["i (var) = 3"],"cbs":["cb → reads i","cb → reads i","cb → reads i"]},"note":"Loop ends when i reaches 3. i STAYS 3 — it outlives the loop."},{"line":null,"panels":{"scope":["i (var) = 3"],"cbs":[]},"note":"Timers fire. Each callback reads i now, and now i is 3."},{"line":null,"panels":{"scope":["i (var) = 3"],"cbs":[]},"note":"var prints 3, 3, 3."},{"line":4,"panels":{"scope":["j (let) = 0"],"cbs":[]},"note":"\`let j\` creates a FRESH binding per iteration — three separate boxes."},{"line":5,"panels":{"scope":["j₀ = 0"],"cbs":["cb → reads j₀"]},"note":"Iteration 0's callback captures its own j₀."},{"line":5,"panels":{"scope":["j₀ = 0","j₁ = 1"],"cbs":["cb → reads j₀","cb → reads j₁"]},"note":"Iteration 1 gets a brand-new j₁, copied from the previous value."},{"line":5,"panels":{"scope":["j₀ = 0","j₁ = 1","j₂ = 2"],"cbs":["cb → reads j₀","cb → reads j₁","cb → reads j₂"]},"note":"Three bindings, three callbacks, one each."},{"line":null,"panels":{"scope":["j₀ = 0","j₁ = 1","j₂ = 2"],"cbs":[]},"note":"let prints 0, 1, 2 — each callback still sees its own binding."}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
  var noteEl = document.getElementById(ID + "-note");
  var cellsEl = document.getElementById(ID + "-cells");
  var gridEl = document.getElementById(ID + "-grid");
  var nextBtn = document.getElementById(ID + "-next");
  var prevBtn = document.getElementById(ID + "-prev");
  var playBtn = document.getElementById(ID + "-play");
  var resetBtn = document.getElementById(ID + "-reset");
  var i = 0, timer = null;

  CODE.forEach(function (text, idx) {
    var row = document.createElement("div");
    row.dataset.n = String(idx + 1);
    row.textContent = text;
    codeEl.appendChild(row);
  });

  function fill(el, items) {
    if (!el) return;
    el.innerHTML = "";
    if (!items || !items.length) {
      var em = document.createElement("span");
      em.className = "demo__term dim";
      em.style.cssText = "display:inline-block;border:0;padding:0;margin:0;min-height:0";
      em.textContent = "empty";
      el.appendChild(em);
      return;
    }
    items.forEach(function (t) {
      var chip = document.createElement("span");
      chip.className = "loop-frame";
      chip.textContent = t;
      el.appendChild(chip);
    });
  }

  function render() {
    var s = STEPS[i];
    Array.prototype.forEach.call(codeEl.children, function (row) {
      row.classList.toggle("hot", Number(row.dataset.n) === s.line);
    });
    Object.keys(s.panels || {}).forEach(function (k) {
      fill(document.getElementById(ID + "-p-" + k), s.panels[k]);
    });
    if (cellsEl && s.cells) {
      cellsEl.innerHTML = "";
      s.cells.forEach(function (c) {
        var d0 = document.createElement("div");
        d0.className = "viz__cell" + (c.c ? " viz__cell--" + c.c : "");
        d0.appendChild(document.createTextNode(c.v));
        var lab = document.createElement("i");
        lab.textContent = c.p || "";
        d0.appendChild(lab);
        cellsEl.appendChild(d0);
      });
    }
    if (gridEl && s.grid) {
      gridEl.innerHTML = "";
      gridEl.style.gridTemplateColumns = "repeat(" + s.grid[0].length + ", minmax(36px, 1fr))";
      s.grid.forEach(function (row) {
        row.forEach(function (c) {
          var g = document.createElement("div");
          g.className = "viz__gcell" + (c.c ? " viz__gcell--" + c.c : "");
          g.textContent = c.v;
          gridEl.appendChild(g);
        });
      });
    }
    noteEl.textContent = s.note;
    barEl.style.width = (i / (STEPS.length - 1)) * 100 + "%";
    nextBtn.disabled = i === STEPS.length - 1;
    prevBtn.disabled = i === 0;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = "Play"; }
  nextBtn.addEventListener("click", function () { stop(); if (i < STEPS.length - 1) { i++; render(); } });
  prevBtn.addEventListener("click", function () { stop(); if (i > 0) { i--; render(); } });
  resetBtn.addEventListener("click", function () { stop(); i = 0; render(); });
  playBtn.addEventListener("click", function () {
    if (timer) { stop(); return; }
    if (i === STEPS.length - 1) { i = 0; render(); }
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      if (i >= STEPS.length - 1) { stop(); return; }
      i++; render();
    }, 1100);
  });
  render();
})();
</script>

<h3>See the lookup walk</h3>
<p>Watch the lookup walk. JavaScript does not copy methods onto objects; it walks a chain until it finds one, and stops at the first hit.</p>

<div class="demo">
  <div class="demo__bar">Prototype chain — how a method is actually found</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="pc-code"></div>
        <div class="loop-bar"><i id="pc-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="pc-prev" type="button">← Back</button>
          <button class="btn" id="pc-next" type="button">Next step →</button>
          <button class="btn" id="pc-play" type="button">Play</button>
          <button class="btn btn--ghost" id="pc-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Lookup walk</div>
          <div id="pc-p-chain"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">What each level owns</div>
          <div id="pc-p-props"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="pc-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "pc";
  var CODE = ["function Animal(name) { this.name = name; }","Animal.prototype.speak = function () {","  return this.name + \\" makes a sound\\";","};","function Dog(name, breed) { Animal.call(this, name); }","Dog.prototype = Object.create(Animal.prototype);","dog.speak();"];
  var STEPS = [{"line":null,"panels":{"chain":["dog"],"props":[]},"note":"d.speak() — JavaScript has to FIND speak before it can call it."},{"line":7,"panels":{"chain":["dog"],"props":["own: name, breed"]},"note":"Look on the object itself first. speak is not an own property."},{"line":7,"panels":{"chain":["dog","Dog.prototype"],"props":["own: name, breed","own: fetch"]},"note":"Follow [[Prototype]] to Dog.prototype. It has fetch, but still no speak."},{"line":7,"panels":{"chain":["dog","Dog.prototype","Animal.prototype"],"props":["own: name, breed","own: fetch","own: speak ✓"]},"note":"Next link: Animal.prototype. speak found — the search stops at the FIRST match."},{"line":7,"panels":{"chain":["dog"],"props":[]},"note":"It is called with \`this\` still bound to dog, which is why it can read this.name."},{"line":null,"panels":{"chain":["dog"],"props":["Object.prototype","null"]},"note":"Had it not been found, the walk would continue to Object.prototype, then null — and only then return undefined."},{"line":null,"panels":{"chain":[],"props":[]},"note":"Shadowing works the same way: define speak directly on dog and the walk stops at step one."}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
  var noteEl = document.getElementById(ID + "-note");
  var cellsEl = document.getElementById(ID + "-cells");
  var gridEl = document.getElementById(ID + "-grid");
  var nextBtn = document.getElementById(ID + "-next");
  var prevBtn = document.getElementById(ID + "-prev");
  var playBtn = document.getElementById(ID + "-play");
  var resetBtn = document.getElementById(ID + "-reset");
  var i = 0, timer = null;

  CODE.forEach(function (text, idx) {
    var row = document.createElement("div");
    row.dataset.n = String(idx + 1);
    row.textContent = text;
    codeEl.appendChild(row);
  });

  function fill(el, items) {
    if (!el) return;
    el.innerHTML = "";
    if (!items || !items.length) {
      var em = document.createElement("span");
      em.className = "demo__term dim";
      em.style.cssText = "display:inline-block;border:0;padding:0;margin:0;min-height:0";
      em.textContent = "empty";
      el.appendChild(em);
      return;
    }
    items.forEach(function (t) {
      var chip = document.createElement("span");
      chip.className = "loop-frame";
      chip.textContent = t;
      el.appendChild(chip);
    });
  }

  function render() {
    var s = STEPS[i];
    Array.prototype.forEach.call(codeEl.children, function (row) {
      row.classList.toggle("hot", Number(row.dataset.n) === s.line);
    });
    Object.keys(s.panels || {}).forEach(function (k) {
      fill(document.getElementById(ID + "-p-" + k), s.panels[k]);
    });
    if (cellsEl && s.cells) {
      cellsEl.innerHTML = "";
      s.cells.forEach(function (c) {
        var d0 = document.createElement("div");
        d0.className = "viz__cell" + (c.c ? " viz__cell--" + c.c : "");
        d0.appendChild(document.createTextNode(c.v));
        var lab = document.createElement("i");
        lab.textContent = c.p || "";
        d0.appendChild(lab);
        cellsEl.appendChild(d0);
      });
    }
    if (gridEl && s.grid) {
      gridEl.innerHTML = "";
      gridEl.style.gridTemplateColumns = "repeat(" + s.grid[0].length + ", minmax(36px, 1fr))";
      s.grid.forEach(function (row) {
        row.forEach(function (c) {
          var g = document.createElement("div");
          g.className = "viz__gcell" + (c.c ? " viz__gcell--" + c.c : "");
          g.textContent = c.v;
          gridEl.appendChild(g);
        });
      });
    }
    noteEl.textContent = s.note;
    barEl.style.width = (i / (STEPS.length - 1)) * 100 + "%";
    nextBtn.disabled = i === STEPS.length - 1;
    prevBtn.disabled = i === 0;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = "Play"; }
  nextBtn.addEventListener("click", function () { stop(); if (i < STEPS.length - 1) { i++; render(); } });
  prevBtn.addEventListener("click", function () { stop(); if (i > 0) { i--; render(); } });
  resetBtn.addEventListener("click", function () { stop(); i = 0; render(); });
  playBtn.addEventListener("click", function () {
    if (timer) { stop(); return; }
    if (i === STEPS.length - 1) { i = 0; render(); }
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      if (i >= STEPS.length - 1) { stop(); return; }
      i++; render();
    }, 1100);
  });
  render();
})();
</script>
`,
};
