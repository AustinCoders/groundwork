import type { Chapter } from "../types";

export const operatorsFlow: Chapter = {
  id: "operators-flow",
  num: "B8",
  title: "Operators & flow",
  short: "Operators & flow",
  levels: ["beginner"],
  practice: ["ex-defaults-nullish"],
  ready: true,
  subtitle: "Every operator here has an interview question hiding behind it.",
  body: `<h3>Arithmetic — and the one that lies</h3>
<p>
  Six operators: <code>+ - * / % **</code>. Five of them only ever do
  math. <code>+</code> is the odd one out — if <em>either</em> side is a
  string, it stops adding and starts concatenating.
</p>

<table>
  <tr>
    <th>Expression</th>
    <th>Result</th>
    <th>Why</th>
  </tr>
  <tr>
    <td><code>5 - "2"</code></td>
    <td><code>3</code></td>
    <td><code>-</code> only means subtract — the string is coerced to a number</td>
  </tr>
  <tr>
    <td><code>5 + "2"</code></td>
    <td><code>"52"</code></td>
    <td><code>+</code> sees a string and switches to concatenation</td>
  </tr>
  <tr>
    <td><code>"5" + 2 + 1</code></td>
    <td><code>"521"</code></td>
    <td>left-to-right — once it's a string, it stays a string</td>
  </tr>
  <tr>
    <td><code>5 + 2 + "1"</code></td>
    <td><code>"71"</code></td>
    <td><code>5 + 2</code> runs first (both numbers), <em>then</em> it meets the string</td>
  </tr>
  <tr>
    <td><code>10 % 3</code></td>
    <td><code>1</code></td>
    <td>remainder, not "percent" — the sign follows the left operand</td>
  </tr>
  <tr>
    <td><code>2 ** 3 ** 2</code></td>
    <td><code>512</code></td>
    <td><code>**</code> is right-associative: <code>2 ** (3 ** 2)</code>, not <code>(2 ** 3) ** 2</code></td>
  </tr>
</table>

<div class="try">
  <pre><code>console.log([] + []);        <span class="c">// what happens?</span>
console.log([] + {});        <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  Every array/object first converts to a primitive before <code>+</code>
  ever runs. <code>[].toString()</code> is <code>""</code>, so
  <code>[] + []</code> is <code>"" + ""</code> → <code>""</code>.
  <code>{}.toString()</code> is <code>"[object Object]"</code>, so
  <code>[] + {}</code> → <code>"[object Object]"</code>.
</p>
<p>
  Swap the order — <code>{} + []</code> — and if that <code>{}</code>
  is the very first token of a <b>statement</b> rather than sitting
  inside an expression, the parser reads it as an empty
  <b>block</b>, not an object literal. What's left is a new statement,
  <code>+[]</code> — unary plus on an empty array — which is
  <code>0</code>. Wrap it in anything (<code>console.log(...)</code>,
  an assignment, parens) and <code>{}</code> is back in expression
  position, parsed as an object literal again, giving the same
  <code>"[object Object]"</code> as before:
</p>
<pre><code><span class="c">// {} is the first token of a statement here — parsed as a block</span>
{} + [];              <span class="c">// two statements: an empty block, then +[] (discarded)</span>

<span class="c">// {} is inside an expression here — parsed as an object literal</span>
console.log({} + []); <span class="c">// "[object Object]"</span></code></pre>
<p class="sub">
  This is exactly why <code>node -p "{} + []"</code> prints <code>0</code>
  — the REPL evaluates that line as a standalone statement, so
  <code>{}</code> lands in statement position. The moment it's an
  argument to something else, it can't be a statement anymore.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "<code>+</code> triggers
  <code>ToPrimitive</code> on both sides before it decides whether it's
  adding or concatenating. Every other arithmetic operator forces
  <code>ToNumber</code> and never looks back."
</div>

<h3>Unary, increment, typeof</h3>
<p>
  <code>-x</code> and <code>+x</code> coerce to a number without any other
  math — <code>+x</code> is a fast, common way to turn a string into a
  number. <code>++</code> and <code>--</code> exist in two flavors that
  differ only in <em>when</em> they hand back a value.
</p>
<pre><code>let x = 5;
console.log(x++);   <span class="c">// 5 — returns the OLD value, then increments</span>
console.log(x);     <span class="c">// 6</span>
console.log(++x);   <span class="c">// 7 — increments FIRST, then returns</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Avoid mixing them into an expression</span>
  <code>let y = x++ + ++x;</code> works, but nobody can read it at a
  glance — including you, in six months. Put the increment on its own
  line.
</div>

<h3>Assignment — plain and compound</h3>
<table>
  <tr>
    <th>Operator</th>
    <th>Means</th>
  </tr>
  <tr><td><code>x += y</code></td><td><code>x = x + y</code></td></tr>
  <tr><td><code>x -= y</code>, <code>*=</code>, <code>/=</code>, <code>%=</code>, <code>**=</code></td><td>same pattern for each</td></tr>
  <tr><td><code>x &amp;&amp;= y</code></td><td><code>if (x) x = y</code> — assign only when <code>x</code> is truthy</td></tr>
  <tr><td><code>x ||= y</code></td><td><code>if (!x) x = y</code> — assign only when <code>x</code> is falsy</td></tr>
  <tr><td><code>x ??= y</code></td><td><code>if (x == null) x = y</code> — assign only when <code>x</code> is <code>null</code>/<code>undefined</code></td></tr>
</table>
<p>
  The logical-assignment trio (ES2021) are the standard way to fill in a
  missing config value without an <code>if</code> block:
</p>
<pre><code>const config = {};
config.retries ??= 3;   <span class="c">// only sets it if it's null/undefined</span>
console.log(config.retries); <span class="c">// 3</span></code></pre>

<h3>Comparison — the interview's favorite trap</h3>
<p>
  <code>==</code> compares after converting both sides to a common type.
  <code>===</code> refuses to convert anything — different types is an
  automatic <code>false</code>. That's the whole rule; the coercion table
  is just that rule played out across every type pair.
</p>

<div class="chipset">
  <span class="chip tone-yes">null == undefined</span>
  <span class="chip tone-yes">0 == false</span>
  <span class="chip tone-yes">"" == false</span>
  <span class="chip tone-yes">"0" == 0</span>
  <span class="chip tone-yes">[] == false</span>
  <span class="chip tone-yes">[1] == 1</span>
</div>
<p class="sub">All <code>true</code> under <code>==</code> — every one of them <code>false</code> under <code>===</code>.</p>

<div class="chipset">
  <span class="chip tone-bad">NaN == NaN</span>
  <span class="chip tone-bad">null == 0</span>
  <span class="chip tone-bad">"" == "0"</span>
  <span class="chip tone-bad">"" == 0 == "0"</span>
</div>
<p class="sub">
  All <code>false</code> — even the last one, which looks like it should
  chain. <code>"" == 0</code> is <code>true</code>, and <code>0 == "0"</code>
  is <code>true</code>, but <code>==</code> isn't transitive, so
  <code>"" == "0"</code> is <code>false</code> on its own. That non-transitivity
  is the strongest argument against <code>==</code> that exists.
</p>

<div class="sticky mint">
  <span class="ttl">Rule</span> Use <code>===</code> and <code>!==</code>
  by default. The one accepted exception is <code>x == null</code>, which
  deliberately catches both <code>null</code> and <code>undefined</code>
  in one check.
</div>

<h3>Logical operators — short-circuit, not just booleans</h3>
<p>
  <code>&amp;&amp;</code> and <code>||</code> don't return
  <code>true</code>/<code>false</code> — they return
  <b>one of their actual operands</b>. <code>&amp;&amp;</code> returns the
  first falsy value it finds, or the last value if none are falsy.
  <code>||</code> returns the first truthy value, or the last value if
  none are truthy. Once the answer is decided, the other side is never
  even evaluated.
</p>
<pre><code>function log(x) { console.log("checked", x); return x; }

log(false) &amp;&amp; log("never runs");   <span class="c">// stops at the first falsy value</span>
log(true)  || log("never runs");   <span class="c">// stops at the first truthy value</span></code></pre>
<p>
  That short-circuit is what makes the classic default-value idiom work
  — and also what makes it dangerous:
</p>
<pre><code>function greet(name) {
  const who = name || "friend";   <span class="c">// falls back on ANY falsy name</span>
  return "Hi " + who;
}
greet("");   <span class="c">// "Hi friend" — is that what you wanted?</span></code></pre>

<h3>?? — the fix for || 's blind spot</h3>
<p>
  <code>??</code> only falls back on <code>null</code> or
  <code>undefined</code> — <code>0</code>, <code>""</code>, and
  <code>false</code> all survive it untouched. That's the entire reason
  it exists.
</p>
<table>
  <tr>
    <th>Value on the left</th>
    <th><code>value || "fallback"</code></th>
    <th><code>value ?? "fallback"</code></th>
  </tr>
  <tr><td><code>0</code></td><td class="tone-bad">"fallback"</td><td class="tone-yes">0</td></tr>
  <tr><td><code>""</code></td><td class="tone-bad">"fallback"</td><td class="tone-yes">""</td></tr>
  <tr><td><code>false</code></td><td class="tone-bad">"fallback"</td><td class="tone-yes">false</td></tr>
  <tr><td><code>null</code></td><td class="tone-yes">"fallback"</td><td class="tone-yes">"fallback"</td></tr>
  <tr><td><code>undefined</code></td><td class="tone-yes">"fallback"</td><td class="tone-yes">"fallback"</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ ?? can't mix with && or || directly</span>
  <code>a || b ?? c</code> is a <code>SyntaxError</code> — JS refuses to
  guess which one you meant to run first. Parenthesize:
  <code>(a || b) ?? c</code>.
</div>

<h3>?. — optional chaining</h3>
<p>
  Before <code>?.</code>, reaching into a maybe-missing property meant a
  wall of <code>&amp;&amp;</code> guards. Now the chain just stops — and
  returns <code>undefined</code> — the moment it hits
  <code>null</code>/<code>undefined</code>.
</p>
<pre><code>const user = { profile: null };

user.profile.bio;     <span class="c">// 💥 throws — profile is null</span>
user.profile?.bio;    <span class="c">// undefined — stops safely</span>
user.greet?.();       <span class="c">// calls greet() only if it exists</span>
user.tags?.[0];       <span class="c">// safe computed access too</span></code></pre>
<p class="sub">
  It short-circuits the <em>whole rest of the chain</em>, not just the
  next step: <code>a?.b.c.d</code> — if <code>a</code> is
  <code>null</code>, the entire expression is <code>undefined</code>;
  <code>.c.d</code> never even gets attempted.
</p>
<div class="warn">
  <span class="ttl">⚠ Not an assignment tool</span>
  <code>user.profile?.bio = "hi"</code> is a <code>SyntaxError</code> —
  <code>?.</code> can only be used to <em>read</em>, never as the target
  of an assignment.
</div>

<h3>The ternary</h3>
<pre><code>const label = age &gt;= 18 ? "adult" : "minor";</code></pre>
<p>
  A full <code>if/else</code> squeezed into one expression — which is
  exactly its advantage: it produces a <em>value</em>, so it can sit
  inside a <code>return</code>, a template, or a prop. Nesting one is
  fine; nesting two gets unreadable fast — reach for
  <code>if/else</code> once you're past one level.
</p>

<h3>if / else / switch</h3>
<p>
  <code>if</code> only cares about truthy vs falsy — the same rules from
  the last chapter apply here with no exceptions. <code>switch</code>
  compares with <code>===</code> (no coercion) and, unlike
  <code>if/else</code>, <b>falls through</b> to the next case unless you
  <code>break</code>.
</p>
<pre><code>function trafficAction(color) {
  switch (color) {
    case "red":
      return "stop";
    case "yellow":
    case "amber":         <span class="c">// two labels, one body — the fall-through you actually want</span>
      return "slow down";
    case "green":
      return "go";
    default:
      return "unknown";
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The classic switch bug</span>
  Forgetting <code>break</code> anywhere else and it silently keeps
  running into the next case's code — no error, just wrong behavior. If
  a case doesn't <code>return</code>, it needs an explicit
  <code>break</code>.
</div>

<h3>Loops</h3>
<table>
  <tr>
    <th>Loop</th>
    <th>When to use it</th>
  </tr>
  <tr><td><code>for (let i = 0; i &lt; n; i++)</code></td><td>you need the index, or a custom step</td></tr>
  <tr><td><code>while (cond)</code></td><td>you don't know the count in advance</td></tr>
  <tr><td><code>do { } while (cond)</code></td><td>the body must run at least once, condition checked after</td></tr>
  <tr><td><code>for (const x of iterable)</code></td><td>you just want the <b>values</b> — arrays, strings, Maps, Sets</td></tr>
  <tr><td><code>for (const k in obj)</code></td><td>you want an object's <b>enumerable keys</b> — plain objects only</td></tr>
</table>

<h3>for...of vs for...in — don't mix these up</h3>
<p>
  This pair gets confused constantly, and the confusion has a real cost:
  <code>for...in</code> on an array walks its <b>keys as strings</b>,
  includes any inherited enumerable properties, and makes no promise
  about numeric ordering. <code>for...of</code> walks
  <b>values</b>, in order, and works on anything iterable.
</p>
<pre><code>const arr = ["a", "b", "c"];

for (const v of arr) console.log(v);     <span class="c">// "a" "b" "c" — values, in order</span>
for (const k in arr)  console.log(k);    <span class="c">// "0" "1" "2" — STRING indices</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> <code>for...of</code> for arrays and
  anything iterable. <code>for...in</code> only for plain objects — and
  even there, <code>Object.keys/values/entries</code> is usually clearer.
</div>

<h3>break, continue, and labels</h3>
<pre><code>outer: for (let i = 0; i &lt; 3; i++) {
  for (let j = 0; j &lt; 3; j++) {
    if (j === 1) continue outer;   <span class="c">// skip to the NEXT i, not just this j</span>
    if (i === 2) break outer;      <span class="c">// exit BOTH loops</span>
    console.log(i, j);
  }
}</code></pre>
<p class="sub">
  Labels are rare in real code — one un-labeled <code>break</code> or
  <code>continue</code> only ever touches its nearest enclosing loop. But
  recognize the syntax; it shows up in coding-round trick questions more
  than it does in production code.
</p>

<h3>Precedence &amp; associativity, compressed</h3>
<table>
  <tr>
    <th>Highest → lowest</th>
    <th>Associativity</th>
  </tr>
  <tr><td><code>()</code> grouping, <code>.</code> <code>?.</code> <code>[]</code> member access</td><td>left → right</td></tr>
  <tr><td>unary: <code>! ~ + - ++ -- typeof</code></td><td>right → left</td></tr>
  <tr><td><code>**</code></td><td>right → left</td></tr>
  <tr><td><code>* / %</code></td><td>left → right</td></tr>
  <tr><td><code>+ -</code></td><td>left → right</td></tr>
  <tr><td><code>&lt; &lt;= &gt; &gt;=</code></td><td>left → right</td></tr>
  <tr><td><code>== != === !==</code></td><td>left → right</td></tr>
  <tr><td><code>&amp;&amp;</code></td><td>left → right</td></tr>
  <tr><td><code>||</code>, <code>??</code></td><td>left → right</td></tr>
  <tr><td><code>?:</code> ternary</td><td>right → left</td></tr>
  <tr><td><code>= += -= &amp;&amp;= ||= ??=</code> …</td><td>right → left</td></tr>
</table>
<div class="try">
  <pre><code>console.log(1 &lt; 2 &lt; 3);    <span class="c">// what happens?</span>
console.log(3 &gt; 2 &gt; 1);    <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  Both read left to right because <code>&lt;</code> and <code>&gt;</code>
  have no special chaining rule in JS — it's two separate comparisons.
  <code>1 &lt; 2 &lt; 3</code> is <code>(1 &lt; 2) &lt; 3</code> →
  <code>true &lt; 3</code> → <code>1 &lt; 3</code> → <code>true</code>.
  <code>3 &gt; 2 &gt; 1</code> is <code>(3 &gt; 2) &gt; 1</code> →
  <code>true &gt; 1</code> → <code>1 &gt; 1</code> →
  <code>false</code>. Same shape, opposite answer — that's the trap.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "Chained comparisons aren't
  a thing in JS — every relational and equality operator only ever sees
  two operands, and the result of one comparison becomes a boolean
  operand in the next."
</div>`,
};
