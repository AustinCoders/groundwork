import type { Chapter } from "../types";

export const scopeFunctions: Chapter = {
  id: "scope-functions",
  num: "I1",
  title: "Scope & functions, properly",
  short: "Scope & functions, properly",
  levels: ["intermediate"],
  practice: ["ex-loop-fix", "ex-curry-multiply"],
  ready: true,
  subtitle: "Closures and this — the two ideas most interviews spend the most time on.",
  body: `<h3>The scope chain</h3>
<p>
  Every function remembers the scope it was <em>written</em> in, not the
  scope it's <em>called</em> from — that's what "lexical" means. Looking
  up a name walks outward through that chain, one level at a time,
  until it finds a match or runs out of scopes.
</p>

<div class="boxes">
  <div class="bx">
    <div class="bx__cap">global scope</div>
    <div class="bx__slot"><b>let city</b><span>"Pune"</span></div>
  </div>
  <div class="bx">
    <div class="bx__cap">outer() scope</div>
    <div class="bx__slot"><b>let name</b><span>"Ana"</span></div>
  </div>
  <div class="bx is-ref">
    <div class="bx__cap">inner() scope — looks up "city"</div>
    <div class="bx__slot"><b>let age</b><span>29</span></div>
    <div class="bx__arrow">not here → check outer() → not there either → check global → found "Pune"</div>
  </div>
</div>
<pre><code>let city = "Pune";
function outer() {
  let name = "Ana";
  function inner() {
    let age = 29;
    console.log(name, city);   <span class="c">// finds "name" one level out, "city" two levels out</span>
  }
  inner();
}</code></pre>
<p class="sub">
  The chain is built from where the function <em>sits in the source</em>
  — nesting on the page, not the order things get called in. A function
  called from somewhere far away still only ever sees its own
  lexical chain, never the caller's local variables.
</p>

<h3>Shadowing, briefly revisited</h3>
<p>
  A name declared in an inner scope hides — doesn't overwrite — the
  same name further out. Once you leave the inner scope, the outer
  binding is exactly as it was.
</p>
<div class="try">
  <pre><code>let x = "outer";
function show() {
  let x = "inner";
  console.log(x);
}
show();
console.log(x);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"inner"</code>, then <code>"outer"</code> — two completely
  separate bindings that happen to share a name. This is also why
  reusing a loop variable name inside nested loops is safe: each
  <code>let i</code> in its own block shadows the one outside it.
</p>

<h3>Closures, and what this chapter adds to them</h3>
<p>
  The scope chain above is the whole mechanism behind closures: a
  function keeps its outer reference, and if the function outlives the
  call, the environment on the other end of that reference cannot be
  collected. <a href="/notes/closures">The closures chapter</a> covers
  that properly — the live link rather than a snapshot, one closure per
  call, the five jobs they do, and the memory they hold on to.
</p>
<p>
  What is worth adding here, now that the scope chain is fresh: a
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
<h3>IIFE — the closure that runs itself</h3>
<pre><code>const counter = (function () {
  let count = 0;               <span class="c">// invisible outside this expression</span>
  return { inc: () =&gt; ++count };
})();</code></pre>
<p>
  Before ES modules existed, every script shared one global scope —
  wrapping code in an Immediately Invoked Function Expression was the
  only way to get a private scope of your own, with just the return
  value exposed. Modules made that automatic, so IIFEs are rare in new
  code — but the pattern (function scope as a privacy boundary) is
  exactly what closures 1 and 2 above are still doing today.
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
const doubleThenShowOldValueIncremented = compose(double, inc);   <span class="c">// double(inc(x))</span>
doubleThenShowOldValueIncremented(5);   <span class="c">// (5 + 1) * 2 = 12</span></code></pre>
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
