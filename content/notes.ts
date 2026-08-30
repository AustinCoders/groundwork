import type { NotesFile } from "./types";

export const jsNotes: NotesFile = {
  meta: {
    title: "JavaScript — the whole map",
    subtitle: "23 sections across three levels. The first two are written — the rest are still on the desk.",
    lead: "Pick a level and you'll get these sections in the order that makes sense. Each one opens here the moment it's written; until then it says so.",
    author: "Akshat",
    updated: "August 2026",
  },

  hero: {
    figure: "",
  },

  chapters: [
    {
      id: "setup-mental-model",
      num: "B1",
      title: "Setup & mental model",
      short: "Setup & mental model",
      levels: ["beginner"],
      practice: [],
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
  <tr>
    <th>Becomes a <code>window</code> property?</th>
    <td>yes, at the top level</td>
    <td>no</td>
    <td>no</td>
  </tr>
</table>
<p>
  <b>Hoisting</b> means: before running a line of code, JS scans the scope
  and registers every name in it. <code>var</code> names get created
  <em>and</em> pre-filled with <code>undefined</code>. <code>let</code> and
  <code>const</code> names get created but left empty — touch one early and
  you get an error. That empty gap has a dramatic name: the
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

<div class="sticky mint">
  <span class="ttl">Rule</span> <code>const</code> by default →
  <code>let</code> when you must reassign → <code>var</code> never.
</div>

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
    },
    {
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
    },
    {
      id: "operators-flow",
      num: "B3",
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
    },
    {
      id: "functions-basics",
      num: "B4",
      title: "Functions (first half)",
      short: "Functions (first half)",
      levels: ["beginner"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "objects-arrays-basics",
      num: "B5",
      title: "Objects & arrays (first half)",
      short: "Objects & arrays (first half)",
      levels: ["beginner"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "dom-events",
      num: "B6",
      title: "DOM & events",
      short: "DOM & events",
      levels: ["beginner"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "basic-async",
      num: "B7",
      title: "Basic async",
      short: "Basic async",
      levels: ["beginner"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "errors-tools",
      num: "B8",
      title: "Errors & tools",
      short: "Errors & tools",
      levels: ["beginner"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },

    {
      id: "scope-functions",
      num: "I1",
      title: "Scope & functions, properly",
      short: "Scope & functions, properly",
      levels: ["intermediate"],
      practice: ["ex-loop-fix", "ex-closure-counter", "ex-once", "ex-curry-multiply"],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "objects-deep",
      num: "I2",
      title: "Objects deeply",
      short: "Objects deeply",
      levels: ["intermediate"],
      practice: ["ex-group-by", "ex-no-mutation", "ex-dedupe-map"],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "prototypes-oop",
      num: "I3",
      title: "Prototypes & OOP",
      short: "Prototypes & OOP",
      levels: ["intermediate"],
      practice: ["ex-class-extends"],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "async-properly",
      num: "I4",
      title: "Async, properly",
      short: "Async, properly",
      levels: ["intermediate"],
      practice: ["ex-order-predict", "ex-parallel-load", "ex-retry"],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "modules-tooling",
      num: "I5",
      title: "Modules & tooling",
      short: "Modules & tooling",
      levels: ["intermediate"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "regex-dates-apis",
      num: "I6",
      title: "Regex, dates & browser APIs",
      short: "Regex, dates & APIs",
      levels: ["intermediate"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "error-handling-debugging",
      num: "I7",
      title: "Error handling & debugging",
      short: "Error handling",
      levels: ["intermediate"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },

    {
      id: "engine-memory",
      num: "A1",
      title: "Engine & memory",
      short: "Engine & memory",
      levels: ["advanced"],
      practice: ["ex-weakmap-cache"],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "advanced-async",
      num: "A2",
      title: "Advanced async",
      short: "Advanced async",
      levels: ["advanced"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "metaprogramming",
      num: "A3",
      title: "Metaprogramming",
      short: "Metaprogramming",
      levels: ["advanced"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "types-data",
      num: "A4",
      title: "Types & data",
      short: "Types & data",
      levels: ["advanced"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "patterns-architecture",
      num: "A5",
      title: "Patterns & architecture",
      short: "Patterns & architecture",
      levels: ["advanced"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "performance",
      num: "A6",
      title: "Performance",
      short: "Performance",
      levels: ["advanced"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "security",
      num: "A7",
      title: "Security",
      short: "Security",
      levels: ["advanced"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
    {
      id: "ecosystem-professional",
      num: "A8",
      title: "Ecosystem & professional",
      short: "Ecosystem",
      levels: ["advanced"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },

    {
      id: "cheat",
      num: "★",
      title: "The cheat page",
      short: "Cheat page",
      levels: ["beginner", "intermediate", "advanced"],
      practice: [],
      ready: false,
      subtitle: "",
      body: "",
    },
  ],
};
