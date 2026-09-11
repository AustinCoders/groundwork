import type { Chapter } from "../types";

export const functionsBasics: Chapter = {
  id: "functions-basics",
  num: "B8",
  title: "Functions",
  short: "Functions",
  levels: ["beginner"],
  practice: ["ex-return-newline", "ex-rest-sum"],
  ready: true,
  subtitle: "A function is a value first, a block of code second.",
  body: `<h3>Three ways to write one</h3>
<p>
  Same function, three spellings — and the differences between them
  aren't cosmetic. They change <em>when</em> the function exists and
  <em>what</em> it's allowed to do.
</p>
<pre><code><span class="c">// 1. Declaration — a named statement</span>
function add(a, b) {
  return a + b;
}

<span class="c">// 2. Expression — a value, happens to be a function, assigned like any other</span>
const subtract = function (a, b) {
  return a - b;
};

<span class="c">// 3. Arrow — an expression too, but lighter and with no own "this"</span>
const multiply = (a, b) =&gt; a * b;</code></pre>

<table>
  <tr>
    <th></th>
    <th>Declaration</th>
    <th>Expression</th>
    <th>Arrow</th>
  </tr>
  <tr>
    <th>Hoisted, fully usable early?</th>
    <td class="tone-yes">yes</td>
    <td class="tone-bad">no</td>
    <td class="tone-bad">no</td>
  </tr>
  <tr>
    <th>Has its own <code>this</code></th>
    <td class="tone-yes">yes</td>
    <td class="tone-yes">yes</td>
    <td class="tone-bad">no — inherits it</td>
  </tr>
  <tr>
    <th>Has its own <code>arguments</code></th>
    <td class="tone-yes">yes</td>
    <td class="tone-yes">yes</td>
    <td class="tone-bad">no — inherits it</td>
  </tr>
  <tr>
    <th>Works as a constructor (<code>new</code>)</th>
    <td class="tone-yes">yes</td>
    <td class="tone-yes">yes</td>
    <td class="tone-bad">no</td>
  </tr>
</table>

<div class="try">
  <pre><code>console.log(declared());     <span class="c">// what happens?</span>
function declared() { return "I work before my own definition"; }

console.log(typeof viaVar);  <span class="c">// what happens?</span>
viaVar();
var viaVar = function () { return "x"; };</code></pre>
</div>
<p class="sub">
  <code>declared()</code> works — function <b>declarations</b> are
  hoisted completely: name and body, both ready before line 1 runs.
  <code>viaVar</code> is different: <code>var</code> hoists the
  <em>name</em> (pre-filled with <code>undefined</code>) but not the
  function it's later assigned. So <code>typeof viaVar</code> is
  <code>"undefined"</code>, and calling it throws
  <code>TypeError: viaVar is not a function</code> — you're calling
  <code>undefined()</code>. Swap <code>var</code> for <code>const</code>
  and it's worse: a <code>ReferenceError</code>, because the name sits
  in the Temporal Dead Zone until its line runs.
</p>

<div class="sticky mint">
  <span class="ttl">Rule</span> A function you need to call before its
  own line in the file must be a <code>function</code> declaration. An
  expression or arrow only exists from its own line onward — same as
  any other <code>const</code>.
</div>

<h3>Arrow functions — the concise cousin</h3>
<p>
  Arrows drop the <code>function</code> keyword and, with exactly one
  parameter, the parentheses too. A one-expression body skips
  <code>return</code> entirely — the expression's value <em>is</em> the
  return value.
</p>
<pre><code>const square = n =&gt; n * n;                  <span class="c">// implicit return</span>
const clamp = (n, lo, hi) =&gt; Math.min(Math.max(n, lo), hi);
const noisy = n =&gt; {                          <span class="c">// block body needs an explicit return</span>
  console.log("squaring", n);
  return n * n;
};</code></pre>
<div class="warn">
  <span class="ttl">⚠ Returning an object literal from a one-liner</span>
  <code>const make = () =&gt; { name: "a" };</code> does <b>not</b> return
  an object — the <code>{</code> is read as the start of a block body,
  and <code>name: "a"</code> is parsed as a label, not a key. Wrap it in
  parens: <code>() =&gt; ({ name: "a" })</code>.
</div>
<p>
  The bigger difference isn't syntax, it's <code>this</code> and
  <code>arguments</code>. An arrow doesn't create either — it reads
  through to whatever function it's <em>lexically</em> written inside:
</p>
<div class="try">
  <pre><code>function outer(a, b) {
  const arrow = (x, y, z) =&gt; arguments.length;
  return arrow(1, 2, 3);
}
console.log(outer(10, 20));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>2</code>, not <code>3</code>. The arrow's <code>arguments</code>
  isn't its own — it's <code>outer</code>'s, which was called with two
  values. The same logic governs <code>this</code> inside an arrow, and
  it's the whole reason arrows became the default choice for callbacks:
  no more <code>const self = this;</code> workaround. The full mechanics
  of <code>this</code> get their own chapter later — for now, remember
  arrows borrow it rather than own it.
</p>

<h3>Parameters, arguments, defaults</h3>
<p>
  A <b>parameter</b> is the name in the function's own definition. An
  <b>argument</b> is the actual value handed over at the call site.
  Extra arguments are silently dropped; missing ones become
  <code>undefined</code> — unless a default says otherwise.
</p>
<pre><code>function greet(name, greeting = "Hello") {
  return greeting + ", " + name + "!";
}
greet("Ana");              <span class="c">// "Hello, Ana!"</span>
greet("Ana", "Hi");        <span class="c">// "Hi, Ana!"</span>
greet("Ana", undefined);   <span class="c">// "Hello, Ana!" — undefined also triggers the default</span></code></pre>
<p>
  Defaults aren't static values baked in once — they're expressions,
  evaluated fresh on every call that needs them, and they can reference
  earlier parameters:
</p>
<div class="try">
  <pre><code>function withDefault(a, b = a + 1) {
  return b;
}
console.log(withDefault(5));       <span class="c">// what happens?</span>
console.log(withDefault(5, 100));  <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>6</code>, then <code>100</code> — the default only runs when the
  argument is missing (or explicitly <code>undefined</code>); supply
  anything else and the default expression never executes at all.
</p>
<div class="warn">
  <span class="ttl">⚠ Defaults can only look left</span>
  <code>a</code> can default from an earlier parameter, but not a
  <em>later</em> one — <code>function f(a = b, b = 1) {}</code> throws
  <code>ReferenceError: Cannot access 'b' before initialization</code>
  the moment <code>a</code>'s default needs to run, because <code>b</code>
  is still in its own Temporal Dead Zone at that point.
</div>

<h3>Rest parameters — the modern arguments</h3>
<p>
  <code>...args</code> in a parameter list collects every remaining
  argument into a <b>real array</b> — unlike the old
  <code>arguments</code> object, which looks array-ish but has no
  <code>map</code>/<code>filter</code>/<code>reduce</code> of its own.
  Arrows don't get <code>arguments</code> at all, so rest params are
  their only option for "however many args you send me."
</p>
<pre><code>function sum(...nums) {
  return nums.reduce((total, n) =&gt; total + n, 0);
}
sum(1, 2, 3, 4);   <span class="c">// 10</span>

function logAll(label, ...rest) {   <span class="c">// rest must be LAST</span>
  console.log(label, rest);
}</code></pre>

<h3>Return — and the newline that eats it</h3>
<p>
  No <code>return</code> statement, or a bare <code>return;</code>, both
  give back <code>undefined</code>. That's not the interesting part —
  this is:
</p>
<div class="try">
  <pre><code>function makeUser() {
  return
  { name: "Ana" };
}
console.log(makeUser());   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>undefined</code> — not the object. Automatic Semicolon
  Insertion sees a line break right after <code>return</code> and
  quietly inserts a semicolon there, turning it into
  <code>return;</code> followed by an unreachable, orphaned block. The
  object literal on the next line never has a chance to be returned.
</p>
<div class="sticky mint">
  <span class="ttl">Rule</span> Never put a line break between
  <code>return</code> and the value. If the value is long, wrap it in
  parens and break <em>inside</em> them:
  <code>return (<br />&nbsp;&nbsp;{ name: "Ana" }<br />);</code>
</div>

<h3>Scope basics</h3>
<p>
  Every function creates its own scope — variables declared inside are
  invisible outside. Nested functions can see everything in their
  parent's scope (that's a <b>closure</b>, coming properly in a later
  chapter); the reverse is never true.
</p>
<pre><code>function outer() {
  let secret = 42;
  function inner() {
    console.log(secret);   <span class="c">// fine — inner can see outer's variables</span>
  }
  inner();
}
console.log(typeof secret);   <span class="c">// "undefined" — outer can't be seen from here</span></code></pre>
<p>
  Inside a function, <code>let</code>/<code>const</code> are still
  block-scoped exactly like in <a href="/notes/operators-flow">the last
  chapter</a> — an <code>if</code> or a <code>for</code> loop makes its
  own little scope even inside a function body. <code>var</code>
  ignores those inner blocks completely and belongs to the whole
  function.
</p>

<h3>Hoisting, one level up</h3>
<p>
  The Temporal Dead Zone from
  <a href="/notes/execution-context">the execution context chapter</a>
  applies the same way inside a function body. <b>Parameters</b> add one
  rule on top: they are created when the call starts and initialised
  left to right, each one ready before the next default runs. That is
  why <code>b = a + 1</code> works and <code>a = b</code> throws, as shown
  above.
</p>
<pre><code>function rename(x) {
  let y = x;     <span class="c">// fine — a new name</span>
}

function clash(x) {
  let x = 1;     <span class="c">// SyntaxError: Identifier 'x' has already been declared</span>
}

function nested(x) {
  if (x) {
    let x = "inner";   <span class="c">// allowed — a new block, so this shadows the parameter</span>
  }
}</code></pre>
<p class="sub">
  A parameter and a <code>let</code>/<code>const</code> of the same name
  can't coexist in the function's top-level scope — JS won't let you
  silently replace an argument you probably still needed. Inside a
  nested block the new name is fine, and the parameter is visible again
  once the block ends.
</p>

<h3>What comes next</h3>
<p>
  This is the mechanical half: how to write one, what the parameters do, where
  the name lives. The half that interviews spend their time on comes next:
  <a href="/notes/this-keyword"><b>this</b></a> with its four binding rules and
  <code>call</code> / <code>apply</code> / <code>bind</code>, then
  <a href="/notes/closures"><b>closures</b></a>, and at the intermediate level
  currying, composition and recursion in
  <a href="/notes/scope-functions">Scope &amp; functions, properly</a>. Nothing
  here is superseded there; it is the same subject, one layer down.
</p>`,
};
