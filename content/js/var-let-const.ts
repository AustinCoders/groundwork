import type { Chapter } from "../types";

export const varLetConst: Chapter = {
  id: "var-let-const",
  num: "B3",
  title: "var, let and const",
  short: "var, let & const",
  levels: ["beginner"],
  practice: ["ex-redeclare-check", "ex-deep-freeze"],
  ready: true,
  subtitle:
    "Three keywords, four questions they answer differently — where a name lives, when you can touch it, whether it can change, and whether you can declare it twice.",
  body: `<h3>A declaration makes a binding</h3>
<p>
  Every one of these three keywords does the same basic job: it creates
  a <b>binding</b> — a name, and a box the name points at. What differs
  is the rules around that box. And the rules only make sense once you
  see that a binding goes through three separate moments, which most
  explanations squash into one:
</p>
<ul>
  <li><b>Created</b> — the name exists in some scope.</li>
  <li><b>Initialised</b> — the box gets its first value, and the name becomes safe to read.</li>
  <li><b>Assigned</b> — the box gets a new value later on.</li>
</ul>

<table>
  <tr>
    <th></th>
    <th>Created</th>
    <th>Initialised</th>
    <th>Assigned again</th>
  </tr>
  <tr>
    <th><code>var</code></th>
    <td>when the function (or script) starts</td>
    <td>at the same moment, to <code>undefined</code></td>
    <td class="tone-yes">any time</td>
  </tr>
  <tr>
    <th><code>let</code></th>
    <td>when its block starts</td>
    <td>when its own line runs</td>
    <td class="tone-yes">any time</td>
  </tr>
  <tr>
    <th><code>const</code></th>
    <td>when its block starts</td>
    <td>when its own line runs — and it must have an <code>=</code></td>
    <td class="tone-no">never</td>
  </tr>
</table>

<p>
  Nearly everything else on this page falls out of that table. The gap
  between "created" and "initialised" is the Temporal Dead Zone, which
  <a href="/notes/execution-context">the execution context chapter</a>
  introduced. "When the function starts" versus "when its block starts"
  is the whole difference in scope. And the last column is all
  <code>const</code> actually promises.
</p>

<div class="say">
  <span class="ttl">Say it like this &rarr;</span> "All three create a
  binding. They differ in where the binding lives, when it becomes
  readable, and whether it can be pointed somewhere else."
</div>

<h3>Question 1 — where does the name live?</h3>
<p>
  <code>let</code> and <code>const</code> belong to the nearest pair of
  braces around them — the nearest <b>block</b>. <code>var</code> does
  not see blocks at all. It climbs up to the nearest <em>function</em>
  (or the whole script, at the top level) and is created there, however
  deep inside an <code>if</code> you wrote it.
</p>
<p>
  Step through one function and watch which box each name lands in —
  and which box disappears.
</p>

<div class="demo">
  <div class="demo__bar">Where each name lives — one function, two scopes</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="vs-code"></div>
        <div class="loop-bar"><i id="vs-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="vs-prev" type="button">&larr; Back</button>
          <button class="btn" id="vs-next" type="button">Next step &rarr;</button>
          <button class="btn" id="vs-play" type="button">Play</button>
          <button class="btn btn--ghost" id="vs-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Function scope — shop()</div>
          <div id="vs-p-fn"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Block scope — the if { }</div>
          <div id="vs-p-block"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Console</div>
          <div id="vs-p-out"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="vs-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "vs";
  var CODE = [
    "function shop() {",
    "  var total = 0;",
    "  if (true) {",
    "    var tax = 5;",
    "    let discount = 2;",
    "    const label = \\"sale\\";",
    "  }",
    "  console.log(tax, typeof discount);",
    "}"
  ];
  var STEPS = [
    {"line":null,"panels":{"fn":[],"block":[],"out":[]},"note":"One function, one if block inside it. Three keywords, and they will not all end up in the same place."},
    {"line":1,"panels":{"fn":["total = undefined","tax = undefined"],"block":[],"out":[]},"note":"shop() is called. Its creation phase finds BOTH vars — including tax, buried inside the if. var ignores the braces and registers on the function. discount and label are not here at all."},
    {"line":2,"panels":{"fn":["total = 0","tax = undefined"],"block":[],"out":[]},"note":"total is assigned. Nothing surprising yet."},
    {"line":3,"panels":{"fn":["total = 0","tax = undefined"],"block":["discount = <TDZ>","label = <TDZ>"],"out":[]},"note":"Execution enters the block. A brand-new scope is created for it, and only NOW do discount and label exist — in their TDZ, like any let or const at the start of its scope."},
    {"line":4,"panels":{"fn":["total = 0","tax = 5"],"block":["discount = <TDZ>","label = <TDZ>"],"out":[]},"note":"tax = 5 is written inside the braces, but the box it writes to is on the FUNCTION. The block has no tax of its own."},
    {"line":5,"panels":{"fn":["total = 0","tax = 5"],"block":["discount = 2","label = <TDZ>"],"out":[]},"note":"discount is initialised. Its TDZ ends on this line."},
    {"line":6,"panels":{"fn":["total = 0","tax = 5"],"block":["discount = 2","label = \\"sale\\""],"out":[]},"note":"label is initialised, and from here it can never point at anything else."},
    {"line":7,"panels":{"fn":["total = 0","tax = 5"],"block":[],"out":[]},"note":"The closing brace. The block's scope is gone, and discount and label with it. tax is untouched — it never lived in the block."},
    {"line":8,"panels":{"fn":["total = 0","tax = 5"],"block":[],"out":["5 \\"undefined\\""]},"note":"tax is found on the function: 5. discount is not in any scope any more, so typeof gives \\"undefined\\" — the safe answer for a name that does not exist. (Inside its TDZ, the same typeof would have thrown.)"}
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
    }, 1300);
  });
  render();
})();
</script>

<h4>Which braces count as a block</h4>
<p>
  The body of an <code>if</code> or <code>else</code>; a
  <code>for</code>, <code>while</code> or <code>do</code> loop;
  <code>try</code>, <code>catch</code> and <code>finally</code>; and a
  bare <code>{ }</code> you typed on purpose. A function body is a scope
  for all three keywords — <code>var</code> climbs <em>to</em> a
  function, never out of one:
</p>
<pre><code>function setup() {
  var inside = 1;
}
setup();
typeof inside;   <span class="c">// "undefined" — var escapes blocks, not functions</span></code></pre>
<p>
  Two sets of braces are not what they look like. The braces of an
  <b>object literal</b> are not a block — they hold properties, not
  declarations. And a <b><code>switch</code></b> body is <em>one</em>
  block, however many <code>case</code> labels it has, so every
  <code>let</code> in every case shares one scope:
</p>
<pre><code>switch (action) {
  case "add":
    let total = 1;       <span class="c">// declared in the switch's single block</span>
    break;
  case "reset":
    total = 0;           <span class="c">// ReferenceError when action is "reset" — its let line never ran</span>
    break;
}</code></pre>
<p class="sub">
  Add a third case with its own <code>let total = 2</code> and it gets
  worse: same block, same name twice, so it is a SyntaxError and the
  file does not run at all. The fix is to give each case its own braces:
  <code>case "add": { let total = 1; break; }</code>. Now every case is
  a real block with its own names.
</p>

<h4>Shadowing — and the TDZ trap hiding inside it</h4>
<p>
  Declaring a name in an inner block that already exists outside is
  allowed. The inner one <b>shadows</b> the outer: inside the block,
  the name means the inner binding; outside, the outer one is exactly as
  it was. Now predict this one — it is a favourite in interviews
  because almost everyone gets it wrong:
</p>
<div class="try">
  <pre><code>let level = "outer";
{
  console.log(level);   <span class="c">// what happens?</span>
  let level = "inner";
}</code></pre>
</div>
<p class="sub">
  <code>ReferenceError</code>, not <code>"outer"</code>. The inner
  <code>level</code> is created the moment the block starts, so it is
  already shadowing the outer one on the <code>console.log</code> line
  — it is just still in its TDZ. The lookup finds the inner name, stops
  there, and throws. It never falls through to the outer
  <code>"outer"</code>. With <code>var</code> in place of the inner
  <code>let</code> the rules change again, which is the next problem.
</p>

<h4>A var cannot hide inside a block</h4>
<p>
  Because <code>var</code> climbs to the function, a <code>var</code>
  in a block can collide with a <code>let</code> that sits outside it:
</p>
<pre><code>function f() {
  let x = 1;
  {
    var x = 2;   <span class="c">// SyntaxError: Identifier 'x' has already been declared</span>
  }
}</code></pre>
<p class="sub">
  It looks like shadowing. It is not — the <code>var x</code> is really
  declared on the function, right next to <code>let x</code>, and two
  declarations of one name in one scope is a redeclaration. The reverse
  is fine: a <code>let</code> inside a block really does live in the
  block, so it shadows an outer <code>var</code> without complaint.
</p>

<h3>Question 2 — when can you touch it?</h3>
<p>
  <code>var</code> is readable from the first line of its function, and
  holds <code>undefined</code> until assigned. <code>let</code>,
  <code>const</code> and <code>class</code> are unreadable until their
  own line runs. Reading, writing and even <code>typeof</code> all
  throw. That window is the TDZ, and
  <a href="/notes/execution-context">the execution context chapter</a>
  covers why it exists. Two consequences are worth taking further.
</p>

<h4>The TDZ is about time, not position</h4>
<p>
  The word in the name is <em>temporal</em>. What matters is whether
  the line has <em>run yet</em>, not whether the code that reads the
  name sits above or below it in the file. A function written above a
  <code>let</code> can read it perfectly well, as long as it is called
  after:
</p>
<div class="try">
  <pre><code>function read() { return value; }   <span class="c">// written ABOVE the let</span>

try { read(); } catch (e) { console.log("too early:", e.constructor.name); }

let value = 1;
console.log("after:", read());      <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>too early: ReferenceError</code>, then <code>after: 1</code>.
  The same function, the same line of source, two different results —
  decided purely by <em>when</em> it was called. This is why a callback
  can safely mention a <code>let</code> declared further down the file:
  by the time anything calls it, the line has run.
</p>

<h4>A name is in its TDZ during its own initialiser</h4>
<pre><code>let x = x + 1;     <span class="c">// ReferenceError — the right-hand x is the NEW x, still in its TDZ</span>

let count = 5;
{
  let count = count + 1;   <span class="c">// ReferenceError too — same reason, via shadowing</span>
}</code></pre>
<p class="sub">
  The second one catches people trying to "copy the outer value in".
  The inner <code>count</code> already exists when the right-hand side
  runs, so it shadows the outer one. Use a different name for the inner
  binding.
</p>

<h3>Question 3 — can it change?</h3>
<p>
  <code>const</code> makes one promise: <b>this name will always point
  at the same value</b>. That is a promise about the name. It says
  nothing about whether the value on the other end can be edited.
</p>
<pre><code>const user = { name: "ana" };
user.name = "bob";      <span class="c">// fine — same object, different contents</span>
user = { name: "bob" }; <span class="c">// TypeError — a different object for the same name</span>

const list = [1, 2];
list.push(3);           <span class="c">// fine — [1, 2, 3]</span>
list = [];              <span class="c">// TypeError: Assignment to constant variable.</span></code></pre>
<p>
  For numbers, strings and booleans the distinction is invisible,
  because primitives cannot be edited in place anyway —
  <code>const</code> on a primitive really is a fixed value. For objects
  and arrays, the thing that is fixed is the arrow, not the target.
</p>

<h4>Three errors, three moments</h4>
<table>
  <tr>
    <th>You wrote</th>
    <th>Error</th>
    <th>When it fires</th>
  </tr>
  <tr>
    <th><code>const a;</code></th>
    <td class="tone-bad">SyntaxError: Missing initializer</td>
    <td>before any line runs</td>
  </tr>
  <tr>
    <th><code>a = 2</code> on a <code>const</code></th>
    <td class="tone-bad">TypeError: Assignment to constant variable</td>
    <td>only when that line actually runs</td>
  </tr>
  <tr>
    <th>reading <code>a</code> above <code>const a = 1</code></th>
    <td class="tone-bad">ReferenceError (TDZ)</td>
    <td>only when that line actually runs</td>
  </tr>
</table>
<p class="sub">
  The middle row surprises people: reassigning a <code>const</code> is a
  <em>runtime</em> error. <code>if (false) { a = 2; }</code> never
  throws, because the line never runs. A linter will still flag it —
  the engine will not, until it happens.
</p>

<h4>Freezing the value too</h4>
<p>
  If you want the contents locked as well, that is
  <code>Object.freeze</code> — with two catches worth knowing.
</p>
<pre><code>const settings = Object.freeze({ theme: "dark", sizes: { base: 16 } });

settings.theme = "light";    <span class="c">// ignored — still "dark"</span>
settings.sizes.base = 20;    <span class="c">// works! freeze is one level deep</span></code></pre>
<ul>
  <li>
    <b>It is shallow.</b> Nested objects are still ordinary objects. To
    freeze all the way down you walk the object and freeze every level —
    that is the exercise at the end of this chapter.
  </li>
  <li>
    <b>It fails silently in sloppy mode.</b> The assignment above just
    does nothing. In strict mode — including every ES module — it throws
    <code>TypeError: Cannot assign to read only property</code>. Silent
    failure is the worse of the two.
  </li>
</ul>

<h3>Question 4 — can you declare it twice?</h3>
<pre><code>var x = 1;
var x = 2;      <span class="c">// fine. no warning, no error, and now you have a bug to find</span>

console.log("does this line run?");
let y = 1;
let y = 2;      <span class="c">// SyntaxError: Identifier 'y' has already been declared</span></code></pre>
<p>
  The <code>var</code> version is not a typo-catcher, and that is the
  point of the newer keywords: a name declared twice in one scope is
  almost always two people (or two afternoons) fighting over the same
  variable.
</p>
<p>
  Look at <em>when</em> the <code>let</code> version fails, though. The
  <code>console.log</code> above it never prints. This is not a runtime
  error on line 6 — the duplicate is found while names are being
  collected, before a single line runs, so the whole script is
  rejected. It is the cleanest proof there is that
  <a href="/notes/execution-context">your code is read twice</a>.
</p>
<table>
  <tr>
    <th>In one scope</th>
    <th>Result</th>
  </tr>
  <tr>
    <th><code>var a</code> + <code>var a</code></th>
    <td class="tone-warn">allowed, silently</td>
  </tr>
  <tr>
    <th><code>var a</code> + <code>function a() {}</code></th>
    <td class="tone-warn">allowed — the function wins the creation phase</td>
  </tr>
  <tr>
    <th><code>let</code> / <code>const</code> / <code>class a</code> + anything named <code>a</code></th>
    <td class="tone-no">SyntaxError, whichever comes first</td>
  </tr>
  <tr>
    <th>the same name in an <em>inner</em> block</th>
    <td class="tone-yes">allowed — that is shadowing, not redeclaring</td>
  </tr>
</table>

<h3>Loops — where the difference is loudest</h3>
<p>
  Same loop, one keyword changed, two completely different results.
  Step through it and watch the boxes, not the numbers — the answer is
  about how many bindings exist, not about timing.
</p>

<div class="demo">
  <div class="demo__bar">var vs let in a loop — the same code, two memories</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="vl-code"></div>
        <div class="loop-bar"><i id="vl-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="vl-prev" type="button">&larr; Back</button>
          <button class="btn" id="vl-next" type="button">Next step &rarr;</button>
          <button class="btn" id="vl-play" type="button">Play</button>
          <button class="btn btn--ghost" id="vl-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">With var — bindings that exist</div>
          <div id="vl-p-var"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">With let — bindings that exist</div>
          <div id="vl-p-let"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Calling all three at the end</div>
          <div id="vl-p-out"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="vl-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "vl";
  var CODE = [
    "const fns = [];",
    "for (var|let i = 0; i < 3; i++) {",
    "  fns.push(function () { return i; });",
    "}",
    "fns.map(function (f) { return f(); });"
  ];
  var STEPS = [
    {"line":null,"panels":{"var":[],"let":[],"out":[]},"note":"One loop, written twice — once with var, once with let. Watch how many boxes each version creates."},
    {"line":1,"panels":{"var":[],"let":[],"out":[]},"note":"An empty array to collect three functions in."},
    {"line":2,"panels":{"var":["i = 0  (function-scoped, ONE box)"],"let":["i = 0  (iteration 1's own box)"],"out":[]},"note":"Iteration 1. var makes a single box on the function. let makes a box that belongs to THIS pass of the loop body."},
    {"line":3,"panels":{"var":["i = 0  (function-scoped, ONE box)","fn#1 -> the one box"],"let":["i = 0  (iteration 1's own box)","fn#1 -> iteration 1's box"],"out":[]},"note":"The function is stored. It does not copy i — it remembers WHICH box to read later."},
    {"line":2,"panels":{"var":["i = 1  (same box, overwritten)","fn#1 -> the one box"],"let":["i = 0  (iteration 1's box, frozen in place)","fn#1 -> iteration 1's box","i = 1  (iteration 2's NEW box)"],"out":[]},"note":"i++ runs. var overwrites its single box. let copies the value into a brand-new box for iteration 2 and leaves the old one untouched."},
    {"line":3,"panels":{"var":["i = 1  (same box)","fn#1 -> the one box","fn#2 -> the one box"],"let":["i = 0  (iteration 1)","fn#1 -> iteration 1's box","i = 1  (iteration 2)","fn#2 -> iteration 2's box"],"out":[]},"note":"Second function stored. In the var column both functions now point at the same box."},
    {"line":2,"panels":{"var":["i = 2  (same box)","fn#1, fn#2 -> the one box"],"let":["i = 0 · i = 1 · i = 2  (three separate boxes)","fn#1 -> box 1","fn#2 -> box 2"],"out":[]},"note":"Third pass. Same story again."},
    {"line":3,"panels":{"var":["i = 2  (same box)","fn#1, fn#2, fn#3 -> the one box"],"let":["i = 0 · i = 1 · i = 2","fn#1 -> box 1","fn#2 -> box 2","fn#3 -> box 3"],"out":[]},"note":"Three functions stored in both versions."},
    {"line":2,"panels":{"var":["i = 3  <- the loop exits ON this value","fn#1, fn#2, fn#3 -> the one box"],"let":["i = 0 · i = 1 · i = 2","each fn -> its own box"],"out":[]},"note":"The condition fails at i = 3, so the loop stops. Note what the single var box is holding at that exact moment."},
    {"line":5,"panels":{"var":["one box, holding 3"],"let":["three boxes: 0, 1, 2"],"out":["var  ->  [3, 3, 3]","let  ->  [0, 1, 2]"]},"note":"Now the functions run. Each reads its box AS IT IS NOW. var has one box holding 3, so all three answer 3. let gave each iteration its own box, and those boxes never changed."}
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
    }, 1300);
  });
  render();
})();
</script>

<div class="try">
  <pre><code>const withVar = [];
for (var i = 0; i &lt; 3; i++) withVar.push(function () { return i; });

const withLet = [];
for (let j = 0; j &lt; 3; j++) withLet.push(function () { return j; });

console.log(withVar.map(function (f) { return f(); }));
console.log(withLet.map(function (f) { return f(); }));</code></pre>
</div>
<p class="sub">
  Run it to confirm: <code>[3, 3, 3]</code> then <code>[0, 1, 2]</code>.
  Swap the stored functions for <code>setTimeout</code> callbacks and it
  is the same bug in its most common form — every timer reads the one
  shared <code>var</code> box, long after the loop has finished with it.
  Before <code>let</code> existed the fix was a wrapper function per
  iteration, covered in
  <a href="/notes/scope-functions">Scope &amp; functions, properly</a>.
</p>

<h4>What "a fresh binding per iteration" means exactly</h4>
<p>
  It is not "each iteration gets the loop variable's value frozen".
  Each iteration gets its own <em>live</em> box, and at the end of the
  pass the current value is <b>copied into the next iteration's box
  before <code>i++</code> runs</b>. So a change made inside the body
  still counts — both for the closure and for the loop:
</p>
<div class="try">
  <pre><code>const seen = [];
for (let i = 0; i &lt; 6; i++) {
  seen.push(function () { return i; });
  i++;               <span class="c">// an extra step, inside the body</span>
}
console.log(seen.map(function (f) { return f(); }));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>[1, 3, 5]</code>. Iteration one's box starts at 0, the body
  bumps it to 1, and the closure — reading the live box — sees 1. That 1
  is copied into iteration two's box, and only then does the header's
  <code>i++</code> make it 2. Three passes, three boxes, each closure
  seeing its own box's final value.
</p>

<h4>const in a loop</h4>
<pre><code>for (const n of [1, 2, 3]) console.log(n * 2);   <span class="c">// fine — a fresh const every pass</span>
for (const k in { a: 1, b: 2 }) console.log(k);  <span class="c">// fine, for the same reason</span>

for (const i = 0; i &lt; 3; i++) console.log(i);   <span class="c">// prints 0, THEN TypeError on i++</span></code></pre>
<p class="sub">
  <code>for...of</code> and <code>for...in</code> make a new binding each
  pass and never reassign it, so <code>const</code> is the natural
  choice there. A counting loop has to reassign its counter — the body
  runs once, and the first <code>i++</code> throws. A <code>let</code>
  inside a <code>while</code> body is fresh on every pass too, simply
  because the body is a block that is entered again each time.
</p>

<h3>At the top of a file</h3>
<p>
  At the top level of a classic script, <code>var</code> and function
  declarations become properties of the global object —
  <code>window</code> in a browser. <code>let</code>, <code>const</code>
  and <code>class</code> do not.
</p>
<pre><code>var greeting = "hi";
let name = "ana";

window.greeting;          <span class="c">// "hi"</span>
window.name;              <span class="c">// "" — NOT "ana". let stayed off window; this is the tab's own name property</span>
delete window.greeting;   <span class="c">// false — a var-created global cannot be deleted</span>

count = 0;                <span class="c">// no keyword: a plain property, and delete window.count works</span></code></pre>
<p>
  That <code>window.name</code> line is a real trap, not a contrived
  one: <code>window</code> already has hundreds of properties
  (<code>name</code>, <code>status</code>, <code>top</code>,
  <code>length</code>...), and a top-level <code>var</code> with one of
  those names silently collides with the browser's own.
  <code>var name = 42; typeof name</code> gives <code>"string"</code>
  — you did not make a variable, you set the tab's name, and the tab's
  name only stores strings.
</p>
<p>
  Staying off <code>window</code> does not mean "private to this file",
  though. Every classic <code>&lt;script&gt;</code> on a page shares
  <em>one</em> top-level scope for <code>let</code> and
  <code>const</code> as well — it is just a scope that is not an object.
</p>
<pre><code><span class="c">&lt;!-- a.js --&gt;</span>  let config = { theme: "dark" };
<span class="c">&lt;!-- b.js --&gt;</span>  let config = { debug: true };
               <span class="c">// SyntaxError: Identifier 'config' has already been declared</span>
               <span class="c">// — and none of b.js runs, not even its first line</span></code></pre>
<p class="sub">
  <code>var config</code> in <code>b.js</code> collides the same way.
  The upgrade over two <code>var</code>s is real — a loud crash instead
  of a silent overwrite — but the collision is still there. Only
  modules (<code>&lt;script type="module"&gt;</code>, or any file with
  <code>import</code>/<code>export</code>) give each file a top-level
  scope of its own. Why the global scope is split into an object half
  and a non-object half is in
  <a href="/notes/scope-functions">Scope &amp; functions, properly</a>.
</p>

<h3>Which one to write</h3>
<div class="sticky mint">
  <span class="ttl">Rule</span> <code>const</code> until the code forces
  you to reassign, then <code>let</code>. <code>var</code> only when you
  are reading someone else's old file.
</div>
<p>
  <code>const</code> first is not about speed. It is a note to the next
  reader: this name means the same thing on every line below. When
  every binding that <em>can</em> be <code>const</code> is, the few
  <code>let</code>s left stand out as the values that actually move —
  which is exactly where bugs live. ESLint's <code>prefer-const</code>
  and <code>no-var</code> rules enforce all of this for you.
</p>
<p>
  <code>var</code> is worth reading fluently, because a lot of real code
  still uses it and every quirk on this page shows up in that code. It
  is not worth writing: there is nothing <code>var</code> does that
  <code>let</code> does not do more safely.
</p>

<h3>The traps, collected</h3>
<ul>
  <li>
    <b>Reading an outer name above an inner <code>let</code> of the same
    name</b> — ReferenceError, not the outer value. The inner one
    already shadows it from the top of the block.
  </li>
  <li>
    <b><code>let x = x + 1</code></b> — the right-hand <code>x</code> is
    the new one, still in its TDZ.
  </li>
  <li>
    <b>A <code>var</code> loop with callbacks inside</b> — one shared
    box, read after the loop finished with it.
  </li>
  <li>
    <b><code>let</code> in two <code>case</code>s of one
    <code>switch</code></b> — one block, so it is a redeclaration. Brace
    each case.
  </li>
  <li>
    <b>Expecting <code>const</code> to freeze an object</b> — it locks
    the arrow, not the target. And <code>Object.freeze</code> only goes
    one level down.
  </li>
  <li>
    <b><code>const</code> in a counting <code>for</code> loop</b> — runs
    once, then throws on <code>i++</code>.
  </li>
  <li>
    <b>Top-level <code>var</code> named like a <code>window</code>
    property</b> — <code>name</code>, <code>status</code>: you are
    writing to the browser's global, not your own.
  </li>
  <li>
    <b>Assuming <code>let</code> is private per file</b> — classic
    scripts share one top-level scope. Only modules separate them.
  </li>
</ul>

<div class="say">
  <span class="ttl">Say it like this &rarr;</span> "<code>var</code> is
  function-scoped and initialised to undefined straight away.
  <code>let</code> and <code>const</code> are block-scoped and stay in
  the TDZ until their line runs. <code>const</code> fixes the binding,
  not the value. And redeclaring a <code>let</code> is a parse-time
  error, so the whole script never starts."
</div>
`,
};
