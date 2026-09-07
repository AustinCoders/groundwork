import type { Chapter } from "../types";

export const scopeFunctions: Chapter = {
  id: "scope-functions",
  num: "I1",
  title: "Scope & functions, properly",
  short: "Scope & functions, properly",
  levels: ["intermediate"],
  practice: ["ex-loop-fix", "ex-closure-counter", "ex-once", "ex-curry-multiply"],
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

<h3>Closures</h3>
<p>
  A closure isn't a special syntax — it's just what already happens
  every time an inner function outlives the call that created it. The
  inner function keeps a live link to its outer variables, not a
  snapshot of their values at the time.
</p>
<div class="try">
  <pre><code>function makeCounter() {
  let count = 0;
  return {
    inc: () =&gt; ++count,
    get: () =&gt; count,
  };
}
const counter = makeCounter();
counter.inc();
counter.inc();
console.log(counter.get());   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>2</code>. <code>makeCounter</code> already returned — normally
  its local variables would be garbage collected the moment the
  function exits. But <code>inc</code> and <code>get</code> both still
  reference <code>count</code>, so the engine keeps that one variable
  alive for as long as something can still reach it. Call
  <code>makeCounter()</code> again and you get a brand new,
  <em>completely independent</em> <code>count</code> — the closure
  belongs to that specific call, not to the function definition.
</p>
<div class="warn">
  <span class="ttl">⚠ The classic loop-and-closure bug</span>
  <code>for (var i = 0; i &lt; 3; i++) setTimeout(() =&gt; console.log(i), 0);</code>
  logs <code>3, 3, 3</code> — every callback closes over the exact same
  <code>var i</code>, and by the time any of them run, the loop has
  already finished and <code>i</code> is <code>3</code>. Switch
  <code>var</code> to <code>let</code> and it logs <code>0, 1, 2</code>,
  because <code>let</code> creates a <b>fresh binding per iteration</b>
  — each callback closes over its own copy.
</div>

<h3>Five real jobs closures do</h3>
<p>
  This is the part interviews actually probe — not "what is a closure"
  but "build me one of these":
</p>

<pre><code><span class="c">// 1. Factories — a function that builds customized functions</span>
function multiplierOf(factor) {
  return (n) =&gt; n * factor;
}
const double = multiplierOf(2);
double(5);   <span class="c">// 10 — "factor" is remembered inside double, permanently</span></code></pre>

<pre><code><span class="c">// 2. Privacy — variables no outside code can ever touch directly</span>
function createAccount(startingBalance) {
  let balance = startingBalance;   <span class="c">// truly private — no "this.balance" to poke at</span>
  return {
    deposit: (n) =&gt; (balance += n),
    getBalance: () =&gt; balance,
  };
}</code></pre>

<div class="try">
  <pre><code><span class="c">// 3. Memoize — cache a function's results by its arguments</span>
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

let calls = 0;
const slowSquare = memoize((n) =&gt; { calls++; return n * n; });
slowSquare(5);
slowSquare(5);
slowSquare(5);
console.log("real calls:", calls);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>1</code> — the underlying function only ever runs once for a
  given set of arguments. <code>cache</code> is closed over by the
  returned function and nothing else, so every call checks the same
  Map without any outside code able to reach or corrupt it.
</p>

<div class="try">
  <pre><code><span class="c">// 4. Once — guarantee a function's real work happens a single time</span>
function once(fn) {
  let called = false, result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

let inits = 0;
const init = once(() =&gt; { inits++; return "ready"; });
console.log(init(), init(), init());
console.log("actual inits:", inits);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>ready ready ready</code>, then <code>1</code>. Every call after
  the first returns the <em>same cached result</em> without
  re-running <code>fn</code> — the standard shape behind "run this setup
  code exactly once, no matter how many times it's requested."
</p>

<pre><code><span class="c">// 5. Debounce &amp; throttle — closures managing a timer nobody outside can see</span>
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() =&gt; fn.apply(this, args), delay);
  };
}
function throttle(fn, interval) {
  let ready = true;
  return function (...args) {
    if (!ready) return;
    ready = false;
    fn.apply(this, args);
    setTimeout(() =&gt; { ready = true; }, interval);
  };
}</code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> <b>Debounce</b> waits for a pause and
  runs once at the end (a search box: wait until they stop typing).
  <b>Throttle</b> runs immediately, then enforces a cooldown (a scroll
  handler: fire at most once every N ms, the whole time they scroll).
</div>

<h3>this — five binding rules, ranked</h3>
<p>
  <code>this</code> isn't decided by where a function is written — it's
  decided <b>at call time</b>, by <em>how</em> the function is called.
  Four separate rules can set it, and they have a strict pecking order:
</p>
<table>
  <tr>
    <th>Rank</th>
    <th>Rule</th>
    <th>Trigger</th>
    <th><code>this</code> becomes</th>
  </tr>
  <tr><td>1 (wins)</td><td><b>new</b> binding</td><td><code>new Fn()</code></td><td>the brand-new object being constructed</td></tr>
  <tr><td>2</td><td><b>Explicit</b> binding</td><td><code>fn.call(obj)</code>, <code>.apply(obj)</code>, <code>.bind(obj)</code></td><td>whatever object you handed it</td></tr>
  <tr><td>3</td><td><b>Implicit</b> binding</td><td><code>obj.method()</code></td><td>the object left of the dot</td></tr>
  <tr><td>4 (default)</td><td><b>Default</b> binding</td><td>a plain <code>fn()</code> call</td><td><code>undefined</code> in strict mode / modules (the global object in old-style sloppy scripts)</td></tr>
</table>
<p class="sub">
  Arrows are the exception that sits outside this whole table — they
  never bind their own <code>this</code> at all, so none of these four
  rules ever apply to one directly; they just read <code>this</code>
  from whichever scope they were written in, same as any other
  variable.
</p>

<div class="try">
  <pre><code>const obj = {
  name: "obj",
  whoAmI() { return this.name; },
};

console.log(obj.whoAmI());          <span class="c">// implicit — what happens?</span>

const detached = obj.whoAmI;
try {
  console.log(detached());          <span class="c">// default — what happens?</span>
} catch (e) {
  console.log("threw:", e.message);
}</code></pre>
</div>
<p class="sub">
  <code>"obj"</code>, then a <code>TypeError</code>. Assigning
  <code>obj.whoAmI</code> to <code>detached</code> copies the
  <em>function</em>, not the object it was attached to — called bare,
  as <code>detached()</code>, there's no object left of a dot, so
  default binding kicks in and <code>this</code> is <code>undefined</code>.
  <code>this.name</code> on <code>undefined</code> throws. This exact
  bug is why <code>onClick={someObj.method}</code>-style callbacks
  quietly lose their <code>this</code> unless bound first.
</p>

<h3>call, apply, bind</h3>
<table>
  <tr>
    <th></th>
    <th>Sets <code>this</code> to…</th>
    <th>Runs the function?</th>
    <th>Arguments</th>
  </tr>
  <tr><td><code>fn.call(obj, a, b)</code></td><td><code>obj</code></td><td>immediately</td><td>listed one by one</td></tr>
  <tr><td><code>fn.apply(obj, [a, b])</code></td><td><code>obj</code></td><td>immediately</td><td>as a single array</td></tr>
  <tr><td><code>fn.bind(obj, a)</code></td><td><code>obj</code>, permanently</td><td>never — returns a new function</td><td><code>a</code> is pre-filled; more can be added at the real call</td></tr>
</table>
<div class="try">
  <pre><code>function whoAmI() { return this === undefined ? "still stuck" : this.tag; }

const F = function () { return this; };
const bound = F.bind({ tag: "bound" });
const created = new bound();          <span class="c">// new vs bind — who wins?</span>
console.log(created instanceof bound, created.tag);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>true undefined</code> — even a <code>this</code> locked in by
  <code>bind</code> gets overridden the moment the bound function is
  called with <code>new</code>. It still constructs a real, correctly-typed
  instance; the bound object is just discarded in favor of the newly
  created one. That's the precedence table above, confirmed:
  <b>new</b> beats <b>explicit</b> beats everything else.
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

<h3>Callbacks and the hell they used to cause</h3>
<p>
  Before promises, "do this, then when it's done do that" meant passing
  a function to be called later. Node standardized the shape:
  <b>error-first</b> — the callback's first parameter is always either
  an error or <code>null</code>.
</p>
<pre><code>function readConfig(callback) {
  fs.readFile("config.json", (err, data) =&gt; {
    if (err) return callback(err);        <span class="c">// error path checked FIRST, always</span>
    callback(null, JSON.parse(data));
  });
}</code></pre>
<p>
  The trouble starts once one async step needs another, which needs
  another — each nested one level deeper, error handling repeated at
  every level:
</p>
<pre><code>getUser(id, (err, user) =&gt; {
  if (err) return handleError(err);
  getOrders(user.id, (err, orders) =&gt; {
    if (err) return handleError(err);
    getInvoice(orders[0].id, (err, invoice) =&gt; {
      if (err) return handleError(err);
      render(invoice);       <span class="c">// four levels deep and still growing sideways</span>
    });
  });
});</code></pre>
<p class="sub">
  That rightward staircase is "callback hell" — not a formal term, just
  what everyone called code that could only grow by indenting further.
  Promises (next chapter) fix the shape without changing the underlying
  idea: still "run this later," just chainable instead of nested.
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
