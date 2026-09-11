import type { Chapter } from "../types";

export const executionContext: Chapter = {
  id: "execution-context",
  num: "B2",
  title: "Execution context",
  short: "Execution context",
  levels: ["beginner"],
  practice: ["ex-hoist-snapshot", "ex-scope-lookup"],
  ready: true,
  subtitle: "What JavaScript does with your code before it runs a single line of it.",
  body: `<h3>Your code is read twice</h3>
<p>
  The sentence that unlocks most of JavaScript's "weird" behaviour is
  this: <b>JS does not start at line 1.</b> Before a single statement
  runs, it walks the whole scope once and builds memory for it. Only
  then does it go back to the top and start executing.
</p>
<p>Two phases, always in this order:</p>
<ul>
  <li>
    <b>Creation phase</b> — scan the code, find every declaration, put
    each name into memory, and give it a starting state. Nothing is
    running yet.
  </li>
  <li>
    <b>Execution phase</b> — now run the statements top to bottom.
    Assignments happen here, and only here.
  </li>
</ul>
<p>
  Every confusing beginner result — a variable that is
  <code>undefined</code> instead of erroring, a function you can call
  above where you wrote it, a <code>let</code> that throws on a line
  that looks harmless — is a fact about phase one.
</p>

<div class="demo">
  <div class="demo__bar">The two phases, one step at a time</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="ec-code"></div>
        <div class="loop-bar"><i id="ec-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="ec-prev" type="button">&larr; Back</button>
          <button class="btn" id="ec-next" type="button">Next step &rarr;</button>
          <button class="btn" id="ec-play" type="button">Play</button>
          <button class="btn btn--ghost" id="ec-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Phase</div>
          <div id="ec-p-phase"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Memory — this scope's names</div>
          <div id="ec-p-mem"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Console</div>
          <div id="ec-p-out"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="ec-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "ec";
  var CODE = [
    "var a = 1;",
    "let b = 2;",
    "function f() { return 3; }",
    "var g = function () { return 4; };",
    "console.log(a, b, f(), g());"
  ];
  var STEPS = [
    {"line":null,"panels":{"phase":["not started"],"mem":[],"out":[]},"note":"Five lines. JS will walk all five before running any of them."},
    {"line":null,"panels":{"phase":["CREATION"],"mem":[],"out":[]},"note":"Creation phase begins. No line is executing — JS is only collecting names."},
    {"line":1,"panels":{"phase":["CREATION"],"mem":["a = undefined"],"out":[]},"note":"Line 1 declares a with var. The name is created AND pre-filled with undefined. The = 1 part is ignored for now."},
    {"line":2,"panels":{"phase":["CREATION"],"mem":["a = undefined","b = <TDZ>"],"out":[]},"note":"Line 2 declares b with let. The name is created but deliberately left uninitialised — this gap is the Temporal Dead Zone."},
    {"line":3,"panels":{"phase":["CREATION"],"mem":["a = undefined","b = <TDZ>","f = fn(){...}"],"out":[]},"note":"A function DECLARATION is different: the whole function body is stored right now. That is why you can call f() above the line that defines it."},
    {"line":4,"panels":{"phase":["CREATION"],"mem":["a = undefined","b = <TDZ>","f = fn(){...}","g = undefined"],"out":[]},"note":"g is a function EXPRESSION assigned to a var. JS only sees var g — so g is undefined, not a function. Calling g() up here would be a TypeError."},
    {"line":null,"panels":{"phase":["CREATION done"],"mem":["a = undefined","b = <TDZ>","f = fn(){...}","g = undefined"],"out":[]},"note":"Memory is built. THIS is the state your code actually starts in — before line 1 has run."},
    {"line":null,"panels":{"phase":["EXECUTION"],"mem":["a = undefined","b = <TDZ>","f = fn(){...}","g = undefined"],"out":[]},"note":"Now back to the top, running statements in order."},
    {"line":1,"panels":{"phase":["EXECUTION"],"mem":["a = 1","b = <TDZ>","f = fn(){...}","g = undefined"],"out":[]},"note":"Line 1 runs the assignment. a stops being undefined."},
    {"line":2,"panels":{"phase":["EXECUTION"],"mem":["a = 1","b = 2","f = fn(){...}","g = undefined"],"out":[]},"note":"b is initialised. Its Temporal Dead Zone ends exactly here — not a line earlier."},
    {"line":3,"panels":{"phase":["EXECUTION"],"mem":["a = 1","b = 2","f = fn(){...}","g = undefined"],"out":[]},"note":"Nothing happens on line 3. The function was already stored during creation."},
    {"line":4,"panels":{"phase":["EXECUTION"],"mem":["a = 1","b = 2","f = fn(){...}","g = fn(){...}"],"out":[]},"note":"NOW g holds a function. One line later than most people assume."},
    {"line":5,"panels":{"phase":["EXECUTION"],"mem":["a = 1","b = 2","f = fn(){...}","g = fn(){...}"],"out":["1 2 3 4"]},"note":"Everything is in place, so the log works. Move any of these calls above their line and the creation-phase column tells you exactly what you would get."}
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
    }, 1200);
  });
  render();
})();
</script>

<h3>What a context actually holds</h3>
<p>
  The box JS builds to run a chunk of code in has a name: an
  <b>execution context</b>. You never touch one directly, but three
  things live inside it and all three are things you already argue with.
</p>

<figure>
  <svg
    viewBox="0 0 720 330"
    class="dg"
    role="img"
    aria-label="An execution context box containing three parts: a variable environment listing names, an outer reference arrow pointing to the parent context, and a this binding"
  >
    <g class="rough">
      <rect class="boxy" x="26" y="26" width="420" height="276" rx="10" />
      <rect class="box" x="50" y="78" width="370" height="96" rx="8" />
      <rect class="box" x="50" y="190" width="370" height="42" rx="8" />
      <rect class="box" x="50" y="246" width="370" height="42" rx="8" />
      <rect class="boxg" x="516" y="120" width="176" height="86" rx="10" />
    </g>
    <text class="lbl" x="44" y="58" style="font-size: 19px">EXECUTION CONTEXT</text>
    <text class="lbl" x="66" y="102">1 · Variable environment</text>
    <text class="sm" x="66" y="126">every name declared in this scope,</text>
    <text class="sm" x="66" y="146">and what it currently holds</text>
    <text class="sm" x="66" y="166">a = 1 · b = 2 · f = fn</text>
    <text class="lbl" x="66" y="216">2 · Outer reference &rarr; the scope chain</text>
    <text class="lbl" x="66" y="272">3 · this</text>
    <path class="ln" d="M424 210 L512 168" marker-end="url(#arrow)" />
    <text class="lbl" x="534" y="152">The context it was</text>
    <text class="lbl" x="534" y="174">WRITTEN inside</text>
    <text class="sm" x="534" y="196">(not the one that called it)</text>
    <text class="sm" x="26" y="322">One of these per program (global), plus a fresh one per function CALL.</text>
  </svg>
  <figcaption>
    A context is memory + a link to the memory around it + a this.
  </figcaption>
</figure>

<p>
  You meet two kinds immediately. The <b>global execution context</b> is
  created once when the file loads — that is the one the demo above was
  walking. A <b>function execution context</b> is created fresh on
  <em>every call</em>, not once per function. Call a function three
  times and you get three contexts, each with its own memory, created
  and destroyed independently.
</p>

<div class="say">
  <span class="ttl">Say it like this &rarr;</span> "A context is not the
  function. It is one <em>run</em> of the function."
</div>

<h3>Hoisting is not code moving upwards</h3>
<p>
  The usual explanation — "declarations get moved to the top of the
  file" — is a lie that happens to predict the right answer about half
  the time. Nothing moves. The creation phase simply got there first.
  The difference matters the moment <code>let</code> is involved,
  because the moving story predicts <code>undefined</code> and the real
  mechanism predicts a crash.
</p>
<p>Here is what the creation phase does, per kind of declaration:</p>

<table>
  <tr>
    <th>You wrote</th>
    <th>Name exists before the line runs?</th>
    <th>Holding what?</th>
    <th>Touching it early gives</th>
  </tr>
  <tr>
    <th><code>var x = 1</code></th>
    <td class="tone-yes">yes</td>
    <td><code>undefined</code></td>
    <td><code>undefined</code> — silent, no error</td>
  </tr>
  <tr>
    <th><code>let x = 1</code></th>
    <td class="tone-yes">yes</td>
    <td>nothing — uninitialised</td>
    <td class="tone-bad">ReferenceError</td>
  </tr>
  <tr>
    <th><code>const x = 1</code></th>
    <td class="tone-yes">yes</td>
    <td>nothing — uninitialised</td>
    <td class="tone-bad">ReferenceError</td>
  </tr>
  <tr>
    <th><code>function f() {}</code></th>
    <td class="tone-yes">yes</td>
    <td>the entire function</td>
    <td class="tone-yes">it just works</td>
  </tr>
  <tr>
    <th><code>var f = function () {}</code></th>
    <td class="tone-yes">yes</td>
    <td><code>undefined</code></td>
    <td class="tone-bad">TypeError: f is not a function</td>
  </tr>
  <tr>
    <th><code>class C {}</code></th>
    <td class="tone-yes">yes</td>
    <td>nothing — uninitialised</td>
    <td class="tone-bad">ReferenceError</td>
  </tr>
  <tr>
    <th><code>x = 1</code> (no keyword)</th>
    <td class="tone-no">no</td>
    <td>&mdash;</td>
    <td>creates a global at runtime, or throws in strict mode</td>
  </tr>
</table>

<p class="sub">
  Read the last two rows together and you have the single most common
  beginner bug in this area: <code>ReferenceError</code> means the name
  does not exist yet; <code>TypeError: not a function</code> means the
  name exists fine, it just happens to hold <code>undefined</code> right
  now. Two different errors, two different fixes.
</p>

<div class="try">
  <pre><code>f();                <span class="c">// works — declaration, stored during creation</span>
g();                <span class="c">// what error do you expect here?</span>

function f() { console.log("f ran"); }
var g = function () { console.log("g ran"); };</code></pre>
</div>
<p class="sub">
  Run it. <code>f()</code> is fine. <code>g()</code> throws
  <em>TypeError</em>, not ReferenceError — because <code>g</code> exists,
  holding <code>undefined</code>, and <code>undefined()</code> is not a
  callable thing.
</p>

<h3>The Temporal Dead Zone, precisely</h3>
<p>
  The TDZ is not "before the declaration line" in the file. It is the
  span between two moments: the name being <b>created</b> (when the
  scope is entered) and the name being <b>initialised</b> (when its
  declaration statement actually runs). Any read in between throws.
</p>
<pre><code>{
  <span class="c">// ---- b's TDZ starts here, at the { ----</span>
  console.log(a);   <span class="c">// undefined — var was pre-filled</span>
  console.log(b);   <span class="c">// ReferenceError: Cannot access 'b' before initialization</span>

  var a = 1;
  let b = 2;        <span class="c">// ---- b's TDZ ends on THIS line ----</span>

  console.log(b);   <span class="c">// 2 — perfectly fine from here on</span>
}</code></pre>

<div class="warn">
  <span class="ttl">&#9888; typeof does not save you</span>
  <code>typeof someNameThatWasNeverDeclared</code> is famously safe — it
  returns the string <code>"undefined"</code> instead of throwing. That
  exception does <b>not</b> apply inside a TDZ:
  <code>typeof b</code> before <code>let b</code> throws a real
  ReferenceError. A declared-but-uninitialised name is a stricter thing
  than a name that was never mentioned at all.
</div>

<p>
  It exists on purpose. Without it, <code>const</code> would be
  observable in an unassigned state, which makes "a const always has its
  value" untrue. And the error it produces points at the real mistake —
  using something before you set it up — instead of quietly handing you
  <code>undefined</code> and letting the damage surface four functions
  later.
</p>

<h3>var, let and const — the whole difference</h3>
<table>
  <tr>
    <th></th>
    <th>var</th>
    <th>let</th>
    <th>const</th>
  </tr>
  <tr>
    <th>Scoped to</th>
    <td>the whole function</td>
    <td>the nearest block</td>
    <td>the nearest block</td>
  </tr>
  <tr>
    <th>Early access</th>
    <td><code>undefined</code></td>
    <td class="tone-bad">ReferenceError (TDZ)</td>
    <td class="tone-bad">ReferenceError (TDZ)</td>
  </tr>
  <tr>
    <th>Reassign</th>
    <td class="tone-yes">yes</td>
    <td class="tone-yes">yes</td>
    <td class="tone-no">no</td>
  </tr>
  <tr>
    <th>Redeclare in the same scope</th>
    <td class="tone-warn">yes, silently</td>
    <td class="tone-no">SyntaxError</td>
    <td class="tone-no">SyntaxError</td>
  </tr>
  <tr>
    <th>Must be initialised</th>
    <td>no</td>
    <td>no</td>
    <td class="tone-yes">yes, on the spot</td>
  </tr>
  <tr>
    <th>Fresh binding per loop iteration</th>
    <td class="tone-no">no — one shared</td>
    <td class="tone-yes">yes</td>
    <td>n/a in a counting loop</td>
  </tr>
  <tr>
    <th>Becomes a <code>window</code> property</th>
    <td class="tone-warn">yes, at top level</td>
    <td>no</td>
    <td>no</td>
  </tr>
</table>

<h4>Block scope is the big one</h4>
<p>
  A block is any pair of braces — an <code>if</code>, a
  <code>for</code>, or a bare <code>{ }</code> you typed for no reason.
  <code>let</code> and <code>const</code> belong to that block.
  <code>var</code> does not see blocks at all; it climbs up to the
  nearest <em>function</em> and lives there.
</p>

<div class="try">
  <pre><code>function demo() {
  if (true) {
    var loose = "var";
    let tight = "let";
  }
  console.log(loose);   <span class="c">// ?</span>
  console.log(tight);   <span class="c">// ?</span>
}
demo();</code></pre>
</div>
<p class="sub">
  <code>loose</code> escapes the <code>if</code> and prints, because
  <code>var</code> was registered on the whole function during creation.
  <code>tight</code> was destroyed with its block, so the second line
  throws. This is why a stray <code>var</code> inside a long function
  can be assigned in one branch and read in another without anyone
  noticing.
</p>

<h4>The loop that catches everybody</h4>
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
  Before <code>let</code> existed this needed a wrapper function per
  iteration to manufacture a fresh scope by hand — the trick that made
  IIFEs famous, covered in
  <a href="/notes/scope-functions">Scope &amp; functions, properly</a>.
</p>

<h4>const locks the name, not the value</h4>
<p>
  <code>const</code> means "this name will never point at something
  else". It says nothing about whether the thing it points at can
  change. For a number or a string that distinction is invisible,
  because those values cannot be edited anyway. For objects and arrays
  it is the whole story.
</p>
<pre><code>const user = { name: "ana" };
user.name = "bob";      <span class="c">// fine — same object, different contents</span>
user = { name: "bob" }; <span class="c">// TypeError — that is a new object for the same name</span>

const list = [1, 2];
list.push(3);           <span class="c">// fine — [1, 2, 3]</span>
list = [];              <span class="c">// TypeError</span></code></pre>
<p class="sub">
  If you want the contents locked too, that is
  <code>Object.freeze(user)</code> — and it only goes one level deep.
</p>

<h4>Redeclaration, and the window question</h4>
<pre><code>var x = 1;
var x = 2;      <span class="c">// fine. no warning, no error, and now you have a bug to find</span>

let y = 1;
let y = 2;      <span class="c">// SyntaxError: Identifier 'y' has already been declared</span></code></pre>
<p>
  The <code>var</code> version is not a typo-catcher, and that is the
  point of the newer keywords: a name declared twice in one scope is
  almost always two people (or two afternoons) fighting over the same
  variable.
</p>
<p>
  The <code>window</code> difference bites in a different place. At the
  top level of a classic script, <code>var greeting = "hi"</code> also
  creates <code>window.greeting</code>. Two files both using
  <code>var config</code> silently overwrite each other through the
  global object. <code>let</code> and <code>const</code> stay out of
  <code>window</code> entirely, and modules do not share a top-level
  scope at all.
</p>

<div class="sticky mint">
  <span class="ttl">Rule</span> <code>const</code> until the code forces
  you to reassign, then <code>let</code>. <code>var</code> only when you
  are reading someone else's old file.
</div>

<h3>A fresh context per call</h3>
<p>
  Everything above described one scope. Call a function and the same
  two-phase process happens again, in a brand-new context, with its own
  memory:
</p>
<pre><code>function counter() {
  var n = 0;        <span class="c">// created fresh on every single call</span>
  n++;
  return n;
}
console.log(counter(), counter(), counter());  <span class="c">// 1 1 1 — not 1 2 3</span></code></pre>
<p>
  Three calls, three contexts, three separate <code>n</code> boxes, each
  born at the start of the call and thrown away at the end of it. The
  question of where these contexts are stacked — and what happens when
  one of them never finishes — is
  <a href="/notes/single-thread">the next chapter</a>.
</p>

<h3>Looking a name up: the scope chain</h3>
<p>
  When a line uses a name that is not in the current context's memory,
  JS follows the outer reference one level out and looks again, then
  again, until it either finds the name or runs out of scopes and throws
  <code>ReferenceError</code>. It never searches inwards, and it never
  searches sideways.
</p>
<pre><code>const level = "global";

function outer() {
  const tool = "hammer";

  function inner() {
    console.log(tool);   <span class="c">// not here -> found one level out</span>
    console.log(level);  <span class="c">// not here, not there -> found in global</span>
    console.log(nope);   <span class="c">// nowhere -> ReferenceError</span>
  }

  inner();
}
outer();</code></pre>
<p>
  The chain is built from <b>where the function was written</b>, not
  from who called it. That word is <em>lexical</em>, and it is the
  reason you can read a function's source and know what it can see
  without knowing anything about the call site. The full consequences —
  closures, and the five jobs they do — are in
  <a href="/notes/scope-functions">the intermediate scope chapter</a>.
</p>

<h3>The traps, collected</h3>
<ul>
  <li>
    <b>A <code>for</code> loop with <code>var</code> and any async work
    inside it</b> — timers, listeners, fetches. All the callbacks read
    the one shared box, long after the loop finished with it.
  </li>
  <li>
    <b><code>typeof</code> as a safety check on a <code>let</code></b> —
    it throws in the TDZ, so it is only safe for names that were never
    declared at all.
  </li>
  <li>
    <b>Calling a function expression above its line</b> —
    <code>TypeError: not a function</code>, because the name exists and
    holds <code>undefined</code>.
  </li>
  <li>
    <b>Assigning without a keyword</b> — <code>count = 0</code> in a
    non-strict script creates a global from anywhere in the codebase.
    Modules are strict by default, so it throws instead. Good.
  </li>
  <li>
    <b>Expecting <code>const</code> to freeze an object</b> — it locks
    the arrow, not the target.
  </li>
</ul>

<div class="say">
  <span class="ttl">Say it like this &rarr;</span> "JS builds memory for
  a scope before it runs it. <code>var</code> gets pre-filled with
  undefined, <code>let</code> and <code>const</code> get created but
  left empty until their line runs — and that empty gap is the TDZ."
</div>
`,
};
