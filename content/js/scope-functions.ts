import type { Chapter } from "../types";

export const scopeFunctions: Chapter = {
  id: "scope-functions",
  num: "I1",
  title: "Scope & functions, properly",
  short: "Scope & functions, properly",
  levels: ["intermediate"],
  practice: ["ex-loop-fix", "ex-curry-multiply"],
  ready: true,
  subtitle:
    "The corners of how a scope is built, new versus bind, and what you build once functions are values: currying, composition, recursion.",
  body: `<h3>Where this picks up</h3>
<p>
  <a href="/notes/scope">Scope</a> covered the lookup itself — every
  kind of scope, the chain walked outward, shadowing, and writes that
  find nothing. This chapter starts where those rules stop being enough
  on their own: the corners of how a scope gets built, then what you
  build once functions are ordinary values.
</p>

<h3>Where the creation phase gets strange</h3>
<p>
  <a href="/notes/execution-context">Execution context</a> gave the
  normal rules: what each declaration holds before its line runs. These
  are the cases those rules do not settle on their own — the ones that
  separate "I know hoisting" from "I know how a scope is built".
</p>

<h4>A function declaration inside a block</h4>
<p>
  <code>let</code> in a block is block-scoped. A
  <code>function</code> declaration in a block is, too — but only in
  strict mode. In old-style sloppy scripts, browsers kept a legacy
  behaviour the spec now writes down as a special case: the name is
  <em>also</em> declared on the enclosing function like a
  <code>var</code>, holding <code>undefined</code> until the block runs.
</p>
<pre><code><span class="c">// sloppy script</span>
f();                            <span class="c">// TypeError: f is not a function — f exists, holds undefined</span>
{ function f() { return "ok"; } }
f();                            <span class="c">// "ok" — running the block copied it out</span>

<span class="c">// strict mode, or any ES module</span>
{ function g() { return "ok"; } }
g();                            <span class="c">// ReferenceError — g never left its block</span></code></pre>
<p class="sub">
  Same source, two behaviours, depending on a mode flag you may not
  have set yourself (modules and class bodies are always strict). The
  practical rule: if a function has to be visible outside a block,
  declare it outside the block — or assign a function expression to a
  <code>let</code> that is.
</p>

<h4>Default parameters get their own scope</h4>
<p>
  <a href="/notes/functions-basics">Functions</a> showed the first rule:
  parameters are set up left to right, each in its TDZ until its turn,
  so <code>function f(a = b, b = 1)</code> throws a
  <code>ReferenceError</code> while <code>b = a + 1</code> works.
</p>
<p>
  Less well known: once any parameter has a default, the parameter list
  becomes a scope of its own, sitting <em>between</em> the outer scope
  and the body. A default cannot see <code>var</code>s declared in the
  body, even ones with the same name.
</p>
<div class="try">
  <pre><code>var y = "outer";
function g(read = () =&gt; y) {
  var y = "inner";
  return read();
}
console.log(g());   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"outer"</code>. The arrow was created in the parameter scope, so
  its chain goes parameters &rarr; outer, skipping the body entirely.
  The body's <code>var y</code> is a different binding that the arrow
  can never reach.
</p>

<h4>A named function expression's name is private</h4>
<pre><code>const factorial = function fact(n) {
  return n &lt;= 1 ? 1 : n * fact(n - 1);   <span class="c">// fact is visible in here</span>
};
factorial(5);    <span class="c">// 120</span>
typeof fact;     <span class="c">// "undefined" — and nowhere out here</span></code></pre>
<p class="sub">
  The engine puts <code>fact</code> in a tiny scope wrapped around the
  function alone. That makes it the safe way to recurse — it still works
  if someone reassigns <code>factorial</code> — and the name shows up in
  stack traces. The binding is read-only: <code>fact = 5</code> inside
  the function is silently ignored in sloppy mode and a
  <code>TypeError</code> in strict mode.
</p>

<h4>What the spec actually calls these boxes</h4>
<p>
  The beginner chapter drew one "variable environment" per context. The
  spec splits it in two, and the split explains everything above:
</p>
<ul>
  <li>
    <b>VariableEnvironment</b> — where <code>var</code>s and (sloppy)
    function declarations go. Set once when the function starts, never
    changes. That is why <code>var</code> ignores blocks.
  </li>
  <li>
    <b>LexicalEnvironment</b> — where <code>let</code>,
    <code>const</code> and <code>class</code> go. Every time execution
    enters a block, a new environment is created and becomes the current
    LexicalEnvironment, with the old one as its outer reference; leaving
    the block restores it. That is block scope, and it is also how each
    loop iteration gets its own <code>let i</code>.
  </li>
</ul>
<p>
  Each environment is an <b>environment record</b> plus that outer
  reference. The global one is a two-part record: an object part that
  <em>is</em> <code>window</code> (for <code>var</code> and function
  declarations) and a plain part beside it (for <code>let</code> and
  <code>const</code>). That one detail is why top-level
  <code>let</code> is not on <code>window</code>, yet two classic scripts
  declaring the same <code>let</code> still collide.
</p>

<h3>Closures, and what this chapter adds to them</h3>
<p>
  <a href="/notes/scope">The scope chain</a> is the whole mechanism behind closures: a
  function keeps its outer reference, and if the function outlives the
  call, the environment on the other end of that reference cannot be
  collected. <a href="/notes/closures">The closures chapter</a> covers
  that properly — the live link rather than a snapshot, one closure per
  call, the five jobs they do, and the memory they hold on to.
</p>
<p>
  What is worth adding here: a
  closure is not a different kind of scope. It is the <em>same</em>
  lookup you just read about, still working after the function that
  created it has returned. Shadowing behaves identically inside one, and
  a closure over a name that gets shadowed later still sees the binding
  that was in scope where it was written.
</p>
<h3>this, past the four rules</h3>
<p>
  <a href="/notes/this-keyword">The beginner chapter on this</a> has the
  four binding rules and the ways a method loses its object. What
  belongs here is the part that is really about scope: an arrow has no
  <code>this</code> of its own, so it resolves the name through the
  scope chain like any other variable — which is why an arrow written
  inside a method keeps that method's <code>this</code>, and an arrow
  written at the top level never can.
</p>
<p>
  And one experiment worth running, because it settles the ranking for
  good — <code>new</code> against a <code>this</code> that was already
  welded on by <code>bind</code>:
</p>
<div class="try">
  <pre><code>const F = function () { return this; };
const bound = F.bind({ tag: "bound" });
const created = new bound();          <span class="c">// new vs bind — who wins?</span>
console.log(created instanceof bound, created.tag);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>true undefined</code> — even a <code>this</code> locked in by
  <code>bind</code> gets overridden the moment the bound function is
  called with <code>new</code>. It still constructs a real,
  correctly-typed instance; the bound object is just discarded in favour
  of the newly created one. <b>new</b> beats <b>explicit</b> beats
  everything else, confirmed by experiment rather than by table.
</p>
<h3>Two properties every function carries</h3>
<p>
  Functions are objects, and two of their properties matter below:
  <code>length</code> is what <code>curry</code> reads to decide whether
  it has enough arguments yet.
</p>
<pre><code>function labeled(a, b = 1, ...rest) {}
labeled.length;   <span class="c">// 1 — counts params up to the FIRST one with a default or rest</span>
labeled.name;     <span class="c">// "labeled"</span>

const anon = () =&gt; {};
anon.name;        <span class="c">// "anon" — inferred from the variable it's assigned to</span></code></pre>

<h3>Higher-order functions: currying, partial application, composition</h3>
<p>
  A <b>higher-order function</b> just means: takes a function as an
  argument, returns one, or both.
  <code>map</code>/<code>filter</code>/<code>reduce</code> from
  earlier already qualify — this section is what you build with that
  idea once you're the one writing the higher-order function.
</p>
<div class="try">
  <pre><code><span class="c">// Currying — one arg at a time, until there are enough</span>
function curry(fn) {
  return function curried(...args) {
    if (args.length &gt;= fn.length) return fn.apply(this, args);
    return (...more) =&gt; curried.apply(this, args.concat(more));
  };
}
function volume(l, w, h) { return l * w * h; }
const curried = curry(volume);
console.log(curried(2)(3)(4));      <span class="c">// what happens?</span>
console.log(curried(2, 3)(4));      <span class="c">// what happens?</span>
console.log(curried(2, 3, 4));      <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  All three print <code>24</code> — currying doesn't change
  <em>what</em> gets computed, only how many calls it takes to supply
  the arguments. Each call checks whether it has enough arguments yet
  (<code>fn.length</code>, from just above); if not, it returns another
  function waiting for the rest.
</p>
<pre><code><span class="c">// Partial application — curry's simpler cousin: some args now, the rest later, ONE split</span>
function partial(fn, ...preset) {
  return (...rest) =&gt; fn(...preset, ...rest);
}
function greet(greeting, name) { return greeting + ", " + name + "!"; }
const hiTo = partial(greet, "Hi");
hiTo("Ana");   <span class="c">// "Hi, Ana!"</span></code></pre>
<pre><code><span class="c">// Composition — chain small functions into one, right to left</span>
function compose(...fns) {
  return (x) =&gt; fns.reduceRight((acc, fn) =&gt; fn(acc), x);
}
const double = (x) =&gt; x * 2;
const inc = (x) =&gt; x + 1;
const incThenDouble = compose(double, inc);   <span class="c">// double(inc(x))</span>
incThenDouble(5);   <span class="c">// (5 + 1) * 2 = 12</span></code></pre>
<p class="sub">
  <code>compose</code> reads right to left because that's the order a
  nested call <code>double(inc(x))</code> actually runs in — the
  rightmost function touches <code>x</code> first. Some libraries offer
  a <code>pipe</code> instead, which is the identical idea left to
  right — purely a readability choice, same
  <code>reduce</code>/<code>reduceRight</code> underneath.
</p>

<h3>Callbacks, as higher-order functions</h3>
<p>
  A callback is the same idea as everything above it in this chapter —
  a function treated as a value and handed to other code. The only
  difference is who calls it and when.
  <code>arr.map(fn)</code> calls yours immediately;
  <code>setTimeout(fn)</code> parks it.
</p>
<p>
  The historical shape — Node's error-first convention, the nested
  staircase it produced, and why <code>try/catch</code> could not reach
  inside it — is covered where it belongs, next to the promises that
  replaced it, in
  <a href="/notes/basic-async">Callbacks, then promises</a>. Worth
  knowing here: a promise does not remove the callback. It just gives
  you somewhere to hand it that can be chained and can fail in one
  place.
</p>
<h3>Recursion</h3>
<p>
  A function that calls itself, always working toward a
  <b>base case</b> — the condition that stops it. Skip the base case,
  or get the shrinking step wrong, and it never stops on its own.
</p>
<pre><code>function factorial(n) {
  if (n &lt;= 1) return 1;         <span class="c">// base case — where it stops</span>
  return n * factorial(n - 1);  <span class="c">// recursive step — smaller problem, same shape</span>
}
factorial(5);   <span class="c">// 120</span></code></pre>
<div class="try">
  <pre><code>function countDown(n) {
  if (n &lt;= 0) return "done";
  return countDown(n - 1);
}
try {
  console.log(countDown(100000));   <span class="c">// what happens?</span>
} catch (e) {
  console.log("threw:", e.constructor.name, "-", e.message);
}</code></pre>
</div>
<p class="sub">
  On most engines, a <code>RangeError: Maximum call stack size
  exceeded</code> — each pending call sits on the call stack waiting
  for the one below it to return, and the stack has a hard size limit.
  The spec technically allows <b>tail-call optimization</b> (reusing
  the current frame when the recursive call is the very last thing a
  function does), which would make this run in constant stack space —
  but outside Safari, no major engine actually implements it. In
  practice: deep, unbounded recursion is a real risk in JS, not just a
  theoretical one. A loop has no such ceiling.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Recursion needs a base
  case that's actually reachable and a step that provably shrinks
  toward it. If I'm not sure the depth is bounded, I either convert it
  to a loop or add an explicit depth guard — I don't rely on TCO,
  because V8 doesn't have it."
</div>`,
};
