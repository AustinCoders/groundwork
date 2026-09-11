import type { Chapter } from "../types";

export const scope: Chapter = {
  id: "scope",
  num: "B4",
  title: "Scope",
  short: "Scope",
  levels: ["beginner"],
  practice: ["ex-where-declared", "ex-assign-walk"],
  ready: true,
  subtitle:
    "Which names a line of code can see, why that is decided by where you wrote it, and how JavaScript finds a name — for reading and for writing.",
  body: `<h3>Scope is a question about names</h3>
<p>
  Every time a line of code uses a name — <code>total</code>,
  <code>user</code>, <code>render</code> — the engine has to answer one
  question: <b>which binding does this name mean, here?</b> The
  <b>scope</b> of a binding is the region of source code where that
  name reaches it. That is the whole definition, and it has one
  important word in it: <em>source code</em>. Scope is a property of
  the text you wrote, not of the program while it runs.
</p>
<p>
  Three words get mixed up constantly, and keeping them apart is half
  of understanding this chapter:
</p>
<table>
  <tr>
    <th>Word</th>
    <th>The question it answers</th>
    <th>Decided by</th>
  </tr>
  <tr>
    <th>Scope</th>
    <td>Where can this name be seen?</td>
    <td>where the code is written</td>
  </tr>
  <tr>
    <th>Lifetime</th>
    <td>How long does the box exist?</td>
    <td>whether anything can still reach it</td>
  </tr>
  <tr>
    <th><code>this</code></th>
    <td>Which object is this call about?</td>
    <td>how the function was called</td>
  </tr>
</table>
<p class="sub">
  Only the first row is this chapter. Lifetime comes back at the end,
  because it is where scope hands over to closures; <code>this</code>
  has <a href="/notes/this-keyword">a chapter of its own</a>, and it is
  the one thing on the list that is <em>not</em> decided by where you
  wrote it.
</p>

<h3>Every kind of scope JavaScript has</h3>
<p>
  Scopes nest inside each other like boxes. Here is every box the
  language can make, from the outside in:
</p>

<figure>
  <svg
    viewBox="0 0 720 360"
    class="dg"
    role="img"
    aria-label="Nested scopes drawn as boxes inside boxes: the global scope contains the script or module scope, which contains a function scope, which contains a block scope. Lookup arrows point outward only."
  >
    <g class="rough">
      <rect class="boxy" x="20" y="20" width="680" height="320" rx="12" />
      <rect class="box" x="50" y="70" width="620" height="250" rx="10" />
      <rect class="box" x="80" y="124" width="560" height="176" rx="10" />
      <rect class="boxg" x="110" y="180" width="500" height="100" rx="10" />
    </g>
    <text class="lbl" x="40" y="52">GLOBAL — var, function declarations (the window object)</text>
    <text class="lbl" x="70" y="102">SCRIPT (let / const, shared by classic scripts) or MODULE (one per file)</text>
    <text class="lbl" x="100" y="156">FUNCTION — parameters, var, everything declared in its body</text>
    <text class="lbl" x="130" y="212">BLOCK — let / const / class inside { }</text>
    <text class="sm" x="130" y="238">if, for, while, try, catch, a bare { }, one per switch</text>
    <text class="sm" x="130" y="262">code in here can see every box around it — never into a box inside it</text>
  </svg>
  <figcaption>
    Four sizes of box. Lookup only ever moves outward, through the walls,
    from the box the code is in.
  </figcaption>
</figure>

<table>
  <tr>
    <th>Scope</th>
    <th>Created when</th>
    <th>Holds</th>
  </tr>
  <tr>
    <th>Global</th>
    <td>once, when the page or process starts</td>
    <td>top-level <code>var</code> and function declarations, as properties of <code>window</code> / <code>globalThis</code></td>
  </tr>
  <tr>
    <th>Script</th>
    <td>with the global one, and shared by every classic <code>&lt;script&gt;</code></td>
    <td>top-level <code>let</code>, <code>const</code>, <code>class</code> — not on <code>window</code>, but still shared</td>
  </tr>
  <tr>
    <th>Module</th>
    <td>once per module file</td>
    <td>everything at the top of that file; only <code>export</code> lets anything out</td>
  </tr>
  <tr>
    <th>Function</th>
    <td>on <em>every call</em></td>
    <td>parameters, <code>arguments</code>, and every <code>var</code> in the body, however deep</td>
  </tr>
  <tr>
    <th>Block</th>
    <td>every time execution enters the braces</td>
    <td><code>let</code>, <code>const</code>, <code>class</code> — and in strict code, function declarations</td>
  </tr>
</table>
<p>
  And three small ones that are easy to miss, because nobody writes
  braces for them:
</p>
<ul>
  <li>
    <b>A <code>catch</code> parameter</b> is scoped to its catch block.
    After the <code>try</code>/<code>catch</code>, <code>err</code> does
    not exist.
  </li>
  <li>
    <b>A named function expression</b> — and a named class expression —
    gets a tiny scope holding just its own name, visible inside and
    nowhere else:
    <code>const C = class Named { ... }</code> can say
    <code>Named</code> in its methods; the outside world only has
    <code>C</code>.
  </li>
  <li>
    <b>Parameters with defaults</b> get a scope between the outer one
    and the body. It rarely matters, and when it does it is surprising —
    <a href="/notes/scope-functions">the intermediate chapter</a> has the
    example.
  </li>
</ul>

<h3>Lexical: decided by where you wrote it</h3>
<p>
  JavaScript's scope is <b>lexical</b> (also called <em>static</em>).
  Which scopes a function can see is fixed by where the function sits
  in the source — which braces it is inside — and nothing that happens
  at runtime changes it. Test that claim with the case where it matters
  most: a function called from somewhere that has a variable of the
  same name.
</p>
<div class="try">
  <pre><code>const who = "global";

function report() {
  return who;
}

function caller() {
  const who = "caller";
  return report();       <span class="c">// called from inside here...</span>
}

console.log(caller());   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"global"</code>. <code>report</code> was <em>written</em> at the
  top level, so its outer scope is the top level — full stop. It is
  called from inside <code>caller</code>, but calling a function does
  not lend it the caller's variables. The <code>who</code> inside
  <code>caller</code> is invisible to it.
</p>
<p>
  The alternative has a name: <b>dynamic scope</b>, where a function
  sees the variables of whoever called it. Bash works that way, and so
  did early Lisps. In a dynamically scoped language the answer above
  would be <code>"caller"</code> — and you could not know what
  <code>report</code> returns without knowing every place that might
  call it. Lexical scope is what lets you read a function on its own
  and know what each name means.
</p>
<div class="say">
  <span class="ttl">Say it like this &rarr;</span> "Scope is lexical: a
  function sees the variables around where it was <em>written</em>, not
  where it was <em>called</em>. The only thing in JavaScript that looks
  at the call is <code>this</code>."
</div>

<h4>Where the link actually lives</h4>
<p>
  "The function remembers where it was written" is not a figure of
  speech. When the engine creates a function object, it stores a hidden
  reference to the scope that was current at that moment — the spec
  calls the slot <code>[[Environment]]</code>. Every later call builds a
  fresh scope for the body, and sets that new scope's
  <b>outer reference</b> to the stored one. Not to the caller's scope:
  to the stored one.
</p>
<p>
  That single rule gives you everything else: lexical lookup, the reason
  <code>report</code> above cannot see <code>caller</code>'s
  <code>who</code>, and — once a function is returned and called
  somewhere far away — closures, which are nothing more than this link
  still working. Arrow functions go one step further and look up
  <code>this</code> through the same link, which is why they keep the
  <code>this</code> of the code around them.
</p>

<h3>The lookup, step by step</h3>
<p>
  When a line uses a name, the engine checks the innermost scope first.
  If the name is declared there, it stops. If not, it follows the outer
  reference one level out and checks again — and keeps going until it
  finds a declaration or runs out of scopes. Step through four lookups
  from one line:
</p>

<div class="demo">
  <div class="demo__bar">Four names, one line — walking the chain outward</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="sc-code"></div>
        <div class="loop-bar"><i id="sc-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="sc-prev" type="button">&larr; Back</button>
          <button class="btn" id="sc-next" type="button">Next step &rarr;</button>
          <button class="btn" id="sc-play" type="button">Play</button>
          <button class="btn btn--ghost" id="sc-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Looking for</div>
          <div id="sc-p-want"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">The chain, innermost first</div>
          <div id="sc-p-chain"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Result</div>
          <div id="sc-p-out"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="sc-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "sc";
  var CODE = [
    "const city = \\"Pune\\";",
    "function outer() {",
    "  const name = \\"Ana\\";",
    "  function inner() {",
    "    const age = 29;",
    "    console.log(age, name, city, zip);",
    "  }",
    "  inner();",
    "}",
    "outer();"
  ];
  var CHAIN = ["inner(): age", "outer(): name, inner", "top level: city, outer"];
  function chain(marks) {
    return CHAIN.map(function (c, k) { return (marks[k] || "  ") + " " + c; });
  }
  var STEPS = [
    {"line":null,"panels":{"want":[],"chain":chain([]),"out":[]},"note":"Three scopes, nested: the top level, outer(), and inner() inside it. The chain on the right is fixed by that nesting in the source — before any of it runs."},
    {"line":10,"panels":{"want":[],"chain":chain([]),"out":[]},"note":"outer() is called, and then inner(). Each call builds a fresh scope whose outer reference is where the function was written. The line we care about is line 6."},
    {"line":6,"panels":{"want":["age"],"chain":chain(["✓"]),"out":["age -> 29, from inner()"]},"note":"age: check inner() first. It is declared right there. Found on the first try — the search stops immediately."},
    {"line":6,"panels":{"want":["name"],"chain":chain(["✗","✓"]),"out":["age -> 29, from inner()","name -> \\"Ana\\", one level out"]},"note":"name: not declared in inner(). Follow the outer reference to outer() — declared there. One hop."},
    {"line":6,"panels":{"want":["city"],"chain":chain(["✗","✗","✓"]),"out":["age -> 29, from inner()","name -> \\"Ana\\", one level out","city -> \\"Pune\\", two levels out"]},"note":"city: not in inner(), not in outer(), found at the top level. Two hops. Every scope in between was checked, in order."},
    {"line":6,"panels":{"want":["zip"],"chain":chain(["✗","✗","✗"]),"out":["age -> 29, from inner()","name -> \\"Ana\\", one level out","city -> \\"Pune\\", two levels out","zip -> ReferenceError: zip is not defined"]},"note":"zip: not in any scope. The top level has no outer reference, so the search runs out — ReferenceError. Nothing was ever searched inward or sideways."}
  ];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
  var noteEl = document.getElementById(ID + "-note");
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
    }, 1500);
  });
  render();
})();
</script>

<p>Three rules fall out of that walk:</p>
<ul>
  <li>
    <b>Outward only.</b> An outer scope can never see into an inner
    one. A variable declared inside a function is invisible to the code
    that called it.
  </li>
  <li>
    <b>Never sideways.</b> Two functions written side by side cannot
    see each other's locals, even if one calls the other. Neither is
    <em>inside</em> the other.
  </li>
  <li>
    <b>The first match wins.</b> The search stops at the nearest
    declaration, which is the whole mechanism behind shadowing.
  </li>
</ul>
<pre><code>function a() { const onlyA = 1; b(); }
function b() { return typeof onlyA; }   <span class="c">// "undefined" — a's locals are not on b's chain</span></code></pre>

<h3>Shadowing</h3>
<p>
  Declare a name in an inner scope that already exists further out, and
  the inner one <b>shadows</b> the outer: from inside, the search stops
  at the inner declaration and never reaches the outer one. The outer
  binding is not changed, overwritten or touched — it is just
  unreachable by that name from in there.
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
  <code>"inner"</code>, then <code>"outer"</code> — two separate bindings
  that happen to share a name. This is also why nested loops can both
  use <code>let i</code>: each inner <code>i</code> shadows the outer one
  for the length of its block.
</p>

<h4>Once shadowed, the outer name is gone from that scope</h4>
<p>
  There is no syntax for "the <code>x</code> one level out". With one
  exception, and only for the global scope — and even that exception
  depends on the keyword:
</p>
<div class="try">
  <pre><code>var fromVar = "global var";
let fromLet = "global let";

function look() {
  const fromVar = "local";
  const fromLet = "local";
  console.log(globalThis.fromVar);   <span class="c">// what happens?</span>
  console.log(globalThis.fromLet);   <span class="c">// and here?</span>
}
look();</code></pre>
</div>
<p class="sub">
  <code>"global var"</code>, then <code>undefined</code>. A top-level
  <code>var</code> is a property of the global object, so you can still
  reach it as <code>globalThis.fromVar</code> (or
  <code>window.fromVar</code>). A top-level <code>let</code> lives in the
  script scope, which is not an object — once it is shadowed, it is
  truly out of reach. Run this as a module and both are
  <code>undefined</code>, because nothing in a module lands on the global
  object.
</p>

<h4>What you can shadow — more than you would guess</h4>
<pre><code>function odd() {
  let undefined = 5;     <span class="c">// legal. undefined is a global property, not a keyword</span>
  return undefined;      <span class="c">// 5</span>
}

function greet(name) {
  if (name) {
    let name = "inner";  <span class="c">// legal — a new block, so it shadows the parameter</span>
  }
}</code></pre>
<p class="sub">
  <code>undefined</code>, <code>NaN</code> and <code>Infinity</code> are
  ordinary names in the global scope, so any inner scope can shadow them.
  (Nobody does this on purpose; you will meet it in minified code and
  in trick questions.) What you cannot do is redeclare a parameter with
  <code>let</code> in the function's own top-level scope — that is a
  redeclaration, not shadowing, and it is a SyntaxError.
</p>
<p>
  Shadowing is legal and sometimes clean — a short-lived
  <code>i</code> in a nested loop. It is also a steady source of bugs:
  you meant the outer <code>user</code> and got the inner one, or you
  "updated" a variable that was a different variable all along. ESLint's
  <code>no-shadow</code> rule flags it, and many teams turn it on. The
  nastiest version, where the inner name is still in its TDZ, is in
  <a href="/notes/var-let-const">var, let and const</a>.
</p>

<h3>Writing walks the chain too</h3>
<p>
  Everything so far was about <em>reading</em> a name. Assignment uses
  exactly the same search: <code>count = 5</code> finds the nearest
  declared <code>count</code> and writes <em>there</em> — which may be
  several scopes out.
</p>
<pre><code>let count = 0;
function outer() {
  function inner() {
    count = 5;          <span class="c">// no declaration here or in outer — writes the top-level count</span>
  }
  inner();
}
outer();
console.log(count);     <span class="c">// 5</span></code></pre>
<p>
  That is how an inner function updates shared state, and it is also
  how one function quietly changes a variable another function was
  relying on. The difference between the two is whether you meant it.
</p>
<p>
  The interesting case is when the search <b>finds nothing</b>. Reading
  an undeclared name is always a <code>ReferenceError</code>. Writing to
  one depends on the mode:
</p>
<div class="try">
  <pre><code>function tally() {
  let total = 0;
  totl = 10;            <span class="c">// a typo — no declaration anywhere on the chain</span>
  return total;
}
tally();
console.log(typeof totl);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  In a sloppy script: <code>"number"</code>. The failed search reached
  the top and, instead of complaining, <b>created a brand-new global</b>
  called <code>totl</code>. The function returns <code>0</code>, the
  typo lives on as a global forever, and nothing tells you. In strict
  mode — which includes every ES module and every class body — the same
  line throws <code>ReferenceError: totl is not defined</code>, which is
  what you want. This one behaviour is most of the reason
  <code>"use strict"</code> exists.
</p>
<p>
  And when the search finds a <code>const</code>, the write reaches it
  and fails there: <code>TypeError: Assignment to constant
  variable</code>, even from three functions away.
</p>

<h3>The global scope, and why it is special</h3>
<p>
  Every chain ends at the same place, so everything you put there is
  visible to every piece of code on the page — yours, your libraries',
  your analytics script's, and every browser extension that injects
  into the page. That is the real argument against globals: not style,
  but that every global is a name any other code can read, overwrite or
  collide with.
</p>
<p>
  The top level of a classic script is split in two, and
  <a href="/notes/var-let-const">var, let and const</a> showed both
  halves in action:
</p>
<ul>
  <li>
    an <b>object half</b> — the global object itself, called
    <code>window</code> in browsers and <code>globalThis</code>
    everywhere — holding top-level <code>var</code>s, function
    declarations, and everything the browser defines;
  </li>
  <li>
    a <b>declarative half</b> beside it, holding top-level
    <code>let</code>, <code>const</code> and <code>class</code>. Not on
    <code>window</code>, but still one shared scope across every classic
    script on the page.
  </li>
</ul>
<p>
  Lookup checks the declarative half first, then the object half. That
  is why a top-level <code>let name</code> works, even though
  <code>window.name</code> already exists — your <code>let</code> is
  found first and hides it.
</p>

<h3>Scope as a wall: keeping names private</h3>
<p>
  Because nothing can see into a scope from outside, a scope is the
  simplest privacy tool JavaScript has. The history of how people used
  it is a tour of the language:
</p>
<pre><code><span class="c">// 1. Before 2015: a function scope, called immediately (an IIFE)</span>
var counter = (function () {
  var count = 0;                      <span class="c">// invisible outside this function</span>
  return { inc: function () { return ++count; } };
})();

<span class="c">// 2. With let and const: any block is enough for temporary names</span>
{
  const temp = expensiveSetup();
  window.app = build(temp);           <span class="c">// temp is gone after the brace</span>
}

<span class="c">// 3. Today: a module. The file IS the wall; export is the only door</span>
let count = 0;                        <span class="c">// private to this file</span>
export function inc() { return ++count; }</code></pre>
<p>
  The IIFE — Immediately Invoked Function Expression — was everywhere
  before modules because a function was the only thing that made a
  scope: wrap the whole file in one, return just what should be public,
  and nothing else leaked into the shared global scope. You will still
  meet it in older code, in bundler output, and in any snippet that has
  to paste safely into a page. For new code, modules do the same job
  with no ceremony.
</p>
<p>
  The same trick was the old fix for
  <a href="/notes/var-let-const">the <code>var</code> loop</a>: one IIFE
  per iteration, taking the current value as a parameter, so each
  callback got a scope — and a box — of its own.
</p>
<pre><code>for (var i = 0; i &lt; 3; i++) {
  (function (j) {                          <span class="c">// a new function scope per pass...</span>
    setTimeout(function () { console.log(j); }, 0);
  })(i);                                   <span class="c">// ...holding this pass's value</span>
}
<span class="c">// 0 1 2 — what let now does for you, by hand</span></code></pre>
<p class="sub">
  The IIFE in step 1 is also the first closure most people ever wrote:
  <code>inc</code> keeps using <code>count</code> after the function
  that declared it has returned. Why that works is
  <a href="/notes/closures">the closures chapter</a>.
</p>

<h3>Things that bend scope — and why not to use them</h3>
<p>
  Lexical scope's big promise is that you can work out every name from
  the source alone. Three features break that promise. They are worth
  recognising, mostly so you can explain why nobody uses them.
</p>
<pre><code>function f() {
  eval("var added = 1");    <span class="c">// direct eval, sloppy mode: adds a var to f's scope</span>
  return typeof added;      <span class="c">// "number" — a name that appears nowhere in f's source</span>
}

function g(settings) {
  with (settings) {         <span class="c">// puts an OBJECT on the scope chain</span>
    return size;            <span class="c">// settings.size? or an outer size? depends on the object</span>
  }
}

function h() {
  const secret = "local";
  return new Function("return secret")();   <span class="c">// ReferenceError, or a global secret</span>
}</code></pre>
<ul>
  <li>
    <b>Direct <code>eval</code></b> runs a string as code <em>in the
    current scope</em>: it can read your locals and, in sloppy mode,
    add new <code>var</code>s to them. In strict mode it gets a scope of
    its own, and an indirect call like <code>(0, eval)(code)</code> runs
    in the global scope instead.
  </li>
  <li>
    <b><code>with</code></b> adds an object's properties to the chain,
    so the same name means a property or a variable depending on what
    the object holds at runtime. It is a SyntaxError in strict mode.
  </li>
  <li>
    <b><code>new Function(...)</code></b> goes the other way: the
    function it builds is always scoped to the <em>global</em> scope,
    whatever scope you created it in. It cannot see your locals at all.
  </li>
</ul>
<p>
  This is also a performance story. Because scope is lexical, engines
  work out before running where almost every name lives, so a lookup is
  typically "slot 3 of the scope two levels up" rather than a search by
  name. <code>eval</code> and <code>with</code> make that impossible —
  any name might resolve anywhere — so engines fall back to slow, careful
  lookups for any function that contains them.
</p>

<h3>Scope is not lifetime</h3>
<p>
  Back to the table at the top. Scope is about the source; lifetime is
  about the running program. They usually line up, which is why people
  merge them — but all four combinations happen:
</p>
<table>
  <tr>
    <th></th>
    <th>The box exists</th>
    <th>The box does not exist (yet, or any more)</th>
  </tr>
  <tr>
    <th>In scope</th>
    <td>the normal case — a variable in use</td>
    <td>a <code>let</code> in its TDZ: visible to the lookup, not usable yet</td>
  </tr>
  <tr>
    <th>Out of scope</th>
    <td>a variable a closure still holds — no code outside can name it, but it is alive</td>
    <td>a block's variables after its closing brace, once nothing refers to them</td>
  </tr>
</table>
<p>
  The bottom-left cell is the interesting one, and it has a chapter of
  its own. Every function that is still reachable keeps its
  <code>[[Environment]]</code> link, and whatever that link points at
  cannot be thrown away:
</p>
<pre><code>function make() {
  const secret = "kept";      <span class="c">// out of scope for everyone outside make()</span>
  return () =&gt; secret;
}
const read = make();          <span class="c">// make() has returned...</span>
read();                       <span class="c">// "kept" — ...and secret is still alive</span></code></pre>
<p class="sub">
  <code>secret</code> is out of every scope except the arrow's, and
  alive for as long as <code>read</code> is. That is a closure, and
  <a href="/notes/closures">Closures</a> is the whole story.
</p>

<h3>The traps, collected</h3>
<ul>
  <li>
    <b>Expecting a function to see its caller's variables</b> — scope
    is lexical. It sees where it was written, never where it was called.
  </li>
  <li>
    <b>A typo in an assignment</b> — in sloppy code it creates a global
    silently. Use modules or <code>"use strict"</code> and it throws.
  </li>
  <li>
    <b>An inner function "updating" a variable</b> that turns out to be
    a shadowing inner one — or, the other way round, writing to an
    outer variable you meant to declare locally.
  </li>
  <li>
    <b>Reaching a shadowed global with <code>window.x</code></b> — works
    for a <code>var</code>, gives <code>undefined</code> for a
    <code>let</code> or <code>const</code>.
  </li>
  <li>
    <b>Treating the global scope as private to your script</b> — every
    script on the page, and every extension, shares it.
  </li>
  <li>
    <b><code>new Function</code> inside a function</b> — it cannot see
    your locals; it only ever sees the global scope.
  </li>
</ul>

<div class="say">
  <span class="ttl">Say it like this &rarr;</span> "Scope is lexical:
  every function stores the scope it was created in, and each call's
  scope points outward to it. A lookup walks that chain from the inside
  out and stops at the first declaration — that is shadowing. Writes
  walk the same chain, and if they find nothing, sloppy mode makes a
  global and strict mode throws."
</div>
`,
};
