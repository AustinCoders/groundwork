import type { Chapter } from "../types";

export const setupMentalModel: Chapter = {
  id: "setup-mental-model",
  num: "B1",
  title: "Setup & mental model",
  short: "Setup & mental model",
  levels: ["beginner"],
  practice: ["ex-tdz-order"],
  ready: true,
  subtitle: "The layer everybody skips — and it shows in interviews.",
  body: `<h3>Two boxes, not one</h3>
<p>
  Beginners think "JavaScript" is one thing. It's two things stacked, and
  almost every "weird JS behaviour" question traces back to which box
  actually did the work.
</p>

<figure>
  <svg
    viewBox="0 0 720 320"
    class="dg"
    role="img"
    aria-label="A big box labelled runtime containing a smaller box labelled engine"
  >
    <g class="rough">
      <rect class="boxy" x="30" y="30" width="660" height="260" rx="10" />
      <rect class="box" x="230" y="105" width="270" height="130" rx="8" />
    </g>
    <text class="lbl" x="48" y="58" style="font-size: 19px">
      THE RUNTIME (Chrome / Node)
    </text>
    <text class="lbl" x="252" y="132" style="font-size: 19px">
      THE ENGINE (V8)
    </text>
    <text class="sm" x="252" y="158">variables · functions · objects</text>
    <text class="sm" x="252" y="178">the call stack</text>
    <text class="sm" x="252" y="198">promises · garbage collector</text>
    <text class="sm" x="252" y="218">it can add 2 + 2. that's it.</text>

    <text class="sm rd" x="48" y="92">setTimeout</text>
    <text class="sm rd" x="48" y="118">fetch</text>
    <text class="sm rd" x="48" y="144">document / the DOM</text>
    <text class="sm rd" x="48" y="170">localStorage</text>
    <text class="sm rd" x="48" y="196">console.log</text>
    <text class="sm rd" x="48" y="222">the event loop</text>
    <text class="sm rd" x="540" y="118">fs (Node)</text>
    <text class="sm rd" x="540" y="144">process</text>
    <text class="sm rd" x="540" y="170">timers</text>
    <text class="sm" x="30" y="312">
      Everything in red is NOT part of the language. The browser (or Node)
      hands it to you.
    </text>
  </svg>
  <figcaption>
    Engine = the cook. Runtime = the whole restaurant (doors, waiters, clock).
  </figcaption>
</figure>

<div class="say">
  <span class="ttl">Say it like this →</span> "V8 has no idea what a timer
  is. The browser does. The engine runs the language, the runtime provides
  the world around it."
</div>

<h3>The 5 words that describe JS</h3>
<ul>
  <li>
    <b>Single-threaded</b> — one worker. It can only do one thing at a time.
    A slow loop freezes your whole page.
  </li>
  <li>
    <b>Synchronous by default</b> — line 1, then line 2, then line 3.
    Waiting doesn't happen unless you hand work to the runtime.
  </li>
  <li>
    <b>Dynamically typed</b> — a variable is a box, not a shape. Any value
    can go in it, and what's in it can change.
  </li>
  <li>
    <b>Weakly typed</b> — if types don't match, JS <em>converts</em>
    instead of complaining. <code>"5" * 2 → 10</code>.
  </li>
  <li>
    <b>Interpreted + JIT compiled</b> — it starts running instantly, then
    quietly re-compiles the parts you run a lot into fast machine code.
  </li>
</ul>
<p class="sub">
  "Dynamic" and "weak" are often confused, but they're separate questions.
  Dynamic asks <em>when</em> a type is checked — JS decides at runtime, not
  ahead of time. Weak asks <em>what happens on a mismatch</em> — JS converts
  instead of refusing. Python is dynamic but strongly typed:
  <code>1 + "1"</code> is an error there. JS does both at once, which is why
  it gets blamed for more than its share.
</p>

<h3>Watch the single thread work</h3>
<p>
  This is the whole model in one demo: one call stack, a queue for
  promises, and a separate queue for everything the runtime hands back
  (timers, clicks, I/O). Step through it — the code on the left is really
  the code running underneath the panel on the right.
</p>

<div class="demo">
  <div class="demo__bar">Event loop, one step at a time</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="sm-code"></div>
        <div class="loop-bar"><i id="sm-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="sm-prev" type="button">← Back</button>
          <button class="btn" id="sm-next" type="button">Next step →</button>
          <button class="btn" id="sm-play" type="button">Play</button>
          <button class="btn btn--ghost" id="sm-reset" type="button">
            Reset
          </button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Call stack</div>
          <div id="sm-stack"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Microtask queue — promises</div>
          <div id="sm-micro"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Macrotask queue — timers</div>
          <div id="sm-macro"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Console</div>
          <div id="sm-out"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="sm-note"></p>
  </div>
</div>
<p>
  The punchline: <code>C</code> prints before <code>B</code>, even though
  the timer's delay was <code>0</code>ms. The microtask queue always drains
  <em>completely</em> before the event loop looks at a single macrotask.
  That's not a quirk of timers — it's the ordering rule every Promise,
  every <code>async/await</code>, and every render sits on top of.
</p>

<h3>Where your code actually runs</h3>
<p>Three places you'll type JavaScript, and they behave differently.</p>
<ul>
  <li>
    <b>The console</b> — a REPL. It prints the result of every expression,
    which is why a stray <code>undefined</code> shows up after
    <code>console.log(...)</code> — that's <code>log</code>'s own return
    value being echoed, not a bug.
  </li>
  <li>
    <b>A <code>&lt;script&gt;</code> tag</b> — by default, HTML parsing
    <em>stops</em> while the script downloads and runs. That's why a plain
    <code>&lt;script&gt;</code> sitting in <code>&lt;head&gt;</code> delays
    everything below it from painting.
  </li>
  <li>
    <b>Node</b> — <code>node app.js</code> runs a file; bare
    <code>node</code> opens a REPL. This is where JS gets a filesystem, a
    process, and no DOM at all.
  </li>
</ul>
<div class="warn">
  <span class="ttl">⚠ file:// is not a server</span>
  Double-clicking <code>index.html</code> works fine — until you add
  <code>type="module"</code>, at which point every import silently fails.
  Modules need a real origin. Run one locally:
  <code>npx serve</code> or a "Live Server" extension.
</div>

<h3>var / let / const</h3>
<table>
  <tr>
    <th></th>
    <th>var 💀</th>
    <th>let</th>
    <th>const ⭐</th>
  </tr>
  <tr>
    <th>Lives inside</th>
    <td>the whole function</td>
    <td>the nearest { }</td>
    <td>the nearest { }</td>
  </tr>
  <tr>
    <th>Use before declaring</th>
    <td><code>undefined</code></td>
    <td>💥 error</td>
    <td>💥 error</td>
  </tr>
  <tr>
    <th>Reassign</th>
    <td>yes</td>
    <td>yes</td>
    <td>no</td>
  </tr>
</table>
<p>
  Those two rows are both consequences of one thing: before running a
  line, JS scans the scope and registers every name in it.
  <code>var</code> names get created <em>and</em> pre-filled with
  <code>undefined</code>; <code>let</code> and <code>const</code> names
  get created but left empty, and touching one early throws. The scan is
  called <b>hoisting</b>, and that empty gap has a dramatic name — the
  <b>Temporal Dead Zone</b>.
</p>

<div class="try">
  <pre><code>console.log(a);  <span class="c">// what happens?</span>
console.log(b);  <span class="c">// what happens?</span>
var a = 1;
let b = 2;</code></pre>
</div>
<p class="sub">
  Run it above — the first line quietly prints <code>undefined</code>
  because <code>var</code> was pre-filled. The second line never gets the
  chance: <code>b</code> is still in the Temporal Dead Zone, so the whole
  script throws a real <code>ReferenceError</code> right there.
</p>
<p>
  That is the whole of it you need today.
  <a href="/notes/execution-context">The next chapter</a> is this
  subject and nothing else — the two phases behind the scan, what the
  TDZ actually spans, block scope, why a <code>var</code> loop and a
  <code>let</code> loop print different numbers, and why
  <code>const</code> does not freeze an object.
</p>

<h3>Naming &amp; comments</h3>
<p>
  Identifiers may contain letters, digits, <code>$</code> and
  <code>_</code>. They can't start with a digit and can't be a reserved
  word. They're case-sensitive — <code>Name</code> and <code>name</code>
  are two different variables.
</p>
<pre><code>const userName = "ana";        <span class="c">// camelCase — variables, functions</span>
class UserAccount {}           <span class="c">// PascalCase — classes, constructors</span>
const MAX_RETRIES = 3;         <span class="c">// UPPER_SNAKE — true fixed constants</span>
const _internal = {};          <span class="c">// leading _ — "private" by convention only</span>
class A { #secret = 1; }       <span class="c">// # — actually private (ES2022)</span></code></pre>
<p>
  Name for intent, not type. Booleans read as questions
  (<code>isActive</code>, <code>hasPermission</code>), functions start with
  a verb (<code>getUserById</code>, <code>handleSubmit</code>).
</p>
<pre><code><span class="c">// single line</span>

<span class="c">/* multi
   line — these do NOT nest */</span>

<span class="c">/**
 * JSDoc — tooling reads this for autocomplete and type hints.
 * @param {string} name
 */</span>
function greet(name) { return "Hi " + name; }</code></pre>
<p class="sub">
  Write comments that explain <em>why</em>, not <em>what</em> — the code
  already says what.
</p>

<h3>'use strict'</h3>
<p>
  Added in ES5 to fix old design mistakes without breaking the existing
  web. It doesn't add powers — it <b>removes the silence</b>. Mistakes
  that used to fail quietly now throw a real error.
</p>

<div class="try">
  <pre><code>'use strict';
x = 5;   <span class="c">// no var, no let — what happens?</span></code></pre>
</div>
<p class="sub">
  Run it — strict mode refuses to guess and throws
  <code>ReferenceError: x is not defined</code>. Delete the first line
  (or run it in a plain script) and the exact same assignment succeeds
  silently, quietly creating a global variable named <code>x</code>. That
  silent global is the bug strict mode exists to kill.
</p>
<p>
  You rarely type <code>'use strict'</code> yourself anymore, because
  <b>modules and classes are strict automatically</b>.
</p>

<h3>Script vs module</h3>
<p>
  A genuine fork in how a file is parsed and run, decided before a single
  line executes.
</p>
<pre><code>&lt;script src="a.js"&gt;&lt;/script&gt;                 <span class="c">// classic script</span>
&lt;script type="module" src="a.js"&gt;&lt;/script&gt;   <span class="c">// ES module</span></code></pre>

<table>
  <tr>
    <th></th>
    <th>Classic script</th>
    <th>ES module</th>
  </tr>
  <tr>
    <th>Strict mode</th>
    <td>opt-in</td>
    <td>always on</td>
  </tr>
  <tr>
    <th>Top-level scope</th>
    <td>the global object</td>
    <td>module-local</td>
  </tr>
  <tr>
    <th>Top-level <code>this</code></th>
    <td><code>window</code></td>
    <td><code>undefined</code></td>
  </tr>
  <tr>
    <th><code>import</code> / <code>export</code></th>
    <td>not allowed</td>
    <td>the whole point</td>
  </tr>
  <tr>
    <th>Loading</th>
    <td>blocking, unless <code>defer</code></td>
    <td>deferred by default</td>
  </tr>
  <tr>
    <th>Evaluated</th>
    <td>once per tag</td>
    <td>once per URL, then cached and shared</td>
  </tr>
</table>

<div class="sticky mint">
  <span class="ttl">Script vs Module</span> A plain
  <code>&lt;script&gt;</code> is loose, blocks the page, and dumps its
  variables on <code>window</code>.<br />
  <code>&lt;script type="module"&gt;</code> is strict, waits for the page,
  keeps its variables to itself, and can <code>import</code>. Use modules.
</div>

<p class="sub">
  One more thing worth knowing: an imported name is a
  <b>live view</b> into the module that exported it, not a copy taken once.
  If that module later changes the value, every importer sees the new one.
  That, plus imports being static and resolved before any code runs, is
  exactly what lets a bundler tree-shake unused exports away.
</p>

<script>
(function () {
  var CODE = [
    'console.log("A");',
    'setTimeout(() => log("B"), 0);',
    'Promise.resolve().then(() => log("C"));',
    'console.log("D");'
  ];
  function step(line, stack, micro, macro, out, note) {
    return { line: line, stack: stack, micro: micro, macro: macro, out: out, note: note };
  }
  var STEPS = [
    step(null, [], [], [], [], "Nothing has run yet. Press Next to execute one step at a time."),
    step(1, ["main()"], [], [], [], "The script starts. One frame on the stack — this is the single thread."),
    step(1, ["main()", 'log("A")'], [], [], [], "console.log is called and pushed on top of main."),
    step(1, ["main()"], [], [], ["A"], "It prints and pops off. The stack is back to just main."),
    step(2, ["main()", "setTimeout(…)"], [], [], ["A"], "setTimeout is a HOST API, not JavaScript. The runtime starts a timer off the main thread."),
    step(2, ["main()"], [], ['() => log("B")'], ["A"], "setTimeout returns immediately. The timer already expired, so its callback is parked as a macrotask — it does NOT run yet."),
    step(3, ["main()", ".then(…)"], [], ['() => log("B")'], ["A"], "The promise is already resolved, so its reaction is scheduled right away."),
    step(3, ["main()"], ['() => log("C")'], ['() => log("B")'], ["A"], "The promise callback goes to the microtask queue — a separate, higher-priority queue."),
    step(4, ["main()", 'log("D")'], ['() => log("C")'], ['() => log("B")'], ["A"], "Back to synchronous code, which always finishes first."),
    step(4, ["main()"], ['() => log("C")'], ['() => log("B")'], ["A", "D"], "D prints. Both queued callbacks are still waiting."),
    step(null, [], ['() => log("C")'], ['() => log("B")'], ["A", "D"], "The script has finished and the stack is EMPTY. Only now can the event loop act."),
    step(null, ['() => log("C")'], [], ['() => log("B")'], ["A", "D"], "The event loop drains the microtask queue FIRST, completely, before touching anything else."),
    step(null, [], [], ['() => log("B")'], ["A", "D", "C"], "C prints. Microtasks are exhausted — now, finally, a macrotask can run."),
    step(null, ['() => log("B")'], [], [], ["A", "D", "C"], "The timer's callback is pushed onto the stack."),
    step(null, [], [], [], ["A", "D", "C", "B"], "Final order: A, D, C, B. The 0ms timer lost to the promise — that's the whole rule in one demo.")
  ];

  var i = 0;
  var timer = null;

  var codeEl = document.getElementById("sm-code");
  var barEl = document.getElementById("sm-bar");
  var noteEl = document.getElementById("sm-note");
  var stackEl = document.getElementById("sm-stack");
  var microEl = document.getElementById("sm-micro");
  var macroEl = document.getElementById("sm-macro");
  var outEl = document.getElementById("sm-out");
  var nextBtn = document.getElementById("sm-next");
  var prevBtn = document.getElementById("sm-prev");
  var playBtn = document.getElementById("sm-play");
  var resetBtn = document.getElementById("sm-reset");

  if (!codeEl) return; // this chapter isn't the one currently mounted
  // A direct page load runs this script twice — once when the browser
  // parses the server HTML, once when the reader re-activates it after
  // hydration. Without this guard the code listing renders twice and
  // every button ends up with two click handlers.
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  CODE.forEach(function (text, idx) {
    var row = document.createElement("div");
    row.dataset.n = String(idx + 1);
    row.textContent = text;
    codeEl.appendChild(row);
  });

  function fill(el, items, cls) {
    el.innerHTML = "";
    if (!items.length) {
      var empty = document.createElement("span");
      empty.className = "demo__term dim";
      empty.style.cssText = "display:inline-block;border:0;padding:0;margin:0;min-height:0";
      empty.textContent = "empty";
      el.appendChild(empty);
      return;
    }
    items.forEach(function (text) {
      var chip = document.createElement("span");
      chip.className = "loop-frame " + cls;
      chip.textContent = text;
      el.appendChild(chip);
    });
  }

  function render() {
    var s = STEPS[i];
    Array.prototype.forEach.call(codeEl.children, function (row) {
      row.classList.toggle("hot", Number(row.dataset.n) === s.line);
    });
    fill(stackEl, s.stack, "loop-frame--stack");
    fill(microEl, s.micro, "loop-frame--micro");
    fill(macroEl, s.macro, "loop-frame--macro");
    fill(outEl, s.out, "loop-frame--out");
    noteEl.textContent = s.note;
    barEl.style.width = (i / (STEPS.length - 1)) * 100 + "%";
    nextBtn.disabled = i === STEPS.length - 1;
    prevBtn.disabled = i === 0;
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    playBtn.textContent = "Play";
  }

  nextBtn.addEventListener("click", function () {
    stop();
    if (i < STEPS.length - 1) { i++; render(); }
  });
  prevBtn.addEventListener("click", function () {
    stop();
    if (i > 0) { i--; render(); }
  });
  resetBtn.addEventListener("click", function () {
    stop();
    i = 0;
    render();
  });
  playBtn.addEventListener("click", function () {
    if (timer) { stop(); return; }
    if (i === STEPS.length - 1) i = 0;
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      if (i >= STEPS.length - 1) { stop(); return; }
      i++;
      render();
    }, 1300);
  });

  render();
})();
</script>

<h3>A harder ordering puzzle</h3>
<p>Harder than the demo above: an <code>async</code> function, an <code>await</code>, and a promise chain all competing. Watch where the code after <code>await</code> actually goes.</p>

<div class="demo">
  <div class="demo__bar">async / await — where the continuation really goes</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="ao-code"></div>
        <div class="loop-bar"><i id="ao-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="ao-prev" type="button">← Back</button>
          <button class="btn" id="ao-next" type="button">Next step →</button>
          <button class="btn" id="ao-play" type="button">Play</button>
          <button class="btn btn--ghost" id="ao-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Call stack</div>
          <div id="ao-p-stack"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Microtask queue</div>
          <div id="ao-p-micro"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Macrotask queue</div>
          <div id="ao-p-macro"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Console</div>
          <div id="ao-p-out"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="ao-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "ao";
  var CODE = ["console.log(\\"1\\");","go();","async function go() { console.log(\\"2\\");","  await null;","  console.log(\\"A\\"); }","setTimeout(() => console.log(\\"5\\"), 0);","Promise.resolve().then(() => console.log(\\"4\\"));","console.log(\\"3\\");"];
  var STEPS = [{"line":null,"panels":{"stack":[],"micro":[],"macro":[],"out":[]},"note":"Harder than the classic demo: an async function, an await, and a promise chain all interleaving."},{"line":1,"panels":{"stack":["main()"],"micro":[],"macro":[],"out":[]},"note":"Script starts."},{"line":1,"panels":{"stack":["main()","log(\\"1\\")"],"micro":[],"macro":[],"out":["1"]},"note":"Synchronous — prints immediately."},{"line":2,"panels":{"stack":["main()","go()"],"micro":[],"macro":[],"out":["1"]},"note":"go() is called. An async function body runs SYNCHRONOUSLY until its first await."},{"line":3,"panels":{"stack":["main()","go()","log(\\"2\\")"],"micro":[],"macro":[],"out":["1","2"]},"note":"Still synchronous, inside go()."},{"line":4,"panels":{"stack":["main()","go()"],"micro":["go() resumes"],"macro":[],"out":["1","2"]},"note":"await hits. go() suspends and its continuation is queued as a MICROTASK. Control returns to main."},{"line":6,"panels":{"stack":["main()","setTimeout(…)"],"micro":["go() resumes"],"macro":[],"out":["1","2"]},"note":"setTimeout hands the callback to the runtime."},{"line":6,"panels":{"stack":["main()"],"micro":["go() resumes"],"macro":["() => log(\\"5\\")"],"out":["1","2"]},"note":"Timer callback parked as a macrotask."},{"line":7,"panels":{"stack":["main()",".then(…)"],"micro":["go() resumes"],"macro":["() => log(\\"5\\")"],"out":["1","2"]},"note":"The promise is already resolved, so its reaction is queued behind go()'s continuation."},{"line":7,"panels":{"stack":["main()"],"micro":["go() resumes","() => log(\\"4\\")"],"macro":["() => log(\\"5\\")"],"out":["1","2"]},"note":"Microtask queue now has TWO entries, in the order they were queued."},{"line":8,"panels":{"stack":["main()","log(\\"3\\")"],"micro":["go() resumes","() => log(\\"4\\")"],"macro":["() => log(\\"5\\")"],"out":["1","2"]},"note":"Last synchronous line."},{"line":8,"panels":{"stack":["main()"],"micro":["go() resumes","() => log(\\"4\\")"],"macro":["() => log(\\"5\\")"],"out":["1","2","3"]},"note":"3 prints. Synchronous code is finished."},{"line":null,"panels":{"stack":[],"micro":["go() resumes","() => log(\\"4\\")"],"macro":["() => log(\\"5\\")"],"out":["1","2","3"]},"note":"Stack is empty. The event loop can finally act — microtasks first."},{"line":null,"panels":{"stack":["go() resumes"],"micro":["() => log(\\"4\\")"],"macro":["() => log(\\"5\\")"],"out":["1","2","3"]},"note":"go() resumes exactly where it suspended."},{"line":5,"panels":{"stack":[],"micro":["() => log(\\"4\\")"],"macro":["() => log(\\"5\\")"],"out":["1","2","3","A"]},"note":"The line after await runs now, not earlier."},{"line":null,"panels":{"stack":["() => log(\\"4\\")"],"micro":[],"macro":["() => log(\\"5\\")"],"out":["1","2","3","A"]},"note":"Next microtask. The queue drains COMPLETELY before any macrotask."},{"line":null,"panels":{"stack":[],"micro":[],"macro":["() => log(\\"5\\")"],"out":["1","2","3","A","4"]},"note":"Microtasks exhausted."},{"line":null,"panels":{"stack":["() => log(\\"5\\")"],"micro":[],"macro":[],"out":["1","2","3","A","4"]},"note":"Only now does the 0 ms timer get its turn."},{"line":null,"panels":{"stack":[],"micro":[],"macro":[],"out":["1","2","3","A","4","5"]},"note":"Final order: 1, 2, 3, A, 4, 5. The timer finishes last despite 0 ms."}];
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
