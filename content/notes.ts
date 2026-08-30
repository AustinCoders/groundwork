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
  The Temporal Dead Zone from the last two chapters applies exactly the
  same way inside a function body — the only new piece here is that
  <b>parameters</b> are hoisted too, as already-initialized bindings, so
  a default value can reference an earlier parameter without a TDZ
  error (as shown above), and the function body can shadow a parameter
  name with its own <code>let</code>:
</p>
<pre><code>function shadow(x) {
  console.log(x);     <span class="c">// the parameter's value</span>
  let x2 = x;          <span class="c">// (renamed here only to keep the example simple —</span>
  <span class="c">//  redeclaring "x" itself with let in the same scope is a SyntaxError)</span>
}</code></pre>
<p class="sub">
  That's a deliberate restriction: a parameter and a
  <code>let</code>/<code>const</code> of the same name can't coexist in
  one function scope — JS won't let you accidentally shadow an argument
  you probably still needed.
</p>`,
    },
    {
      id: "objects-arrays-basics",
      num: "B5",
      title: "Objects & arrays (first half)",
      short: "Objects & arrays (first half)",
      levels: ["beginner"],
      practice: [],
      ready: true,
      subtitle: "The two shapes almost everything you build is made of.",
      body: `<h3>Object literals</h3>
<pre><code>const user = {
  name: "Ana",
  age: 29,
  isAdmin: false,
  address: {                    <span class="c">// objects nest freely</span>
    city: "Pune",
  },
};</code></pre>
<p>
  Two ways to reach a property, and they're not interchangeable.
  <b>Dot notation</b> needs a literal, valid identifier known when you
  write the code. <b>Bracket notation</b> takes any expression — a
  variable, a computed string, a key with a space in it.
</p>
<pre><code>user.name;              <span class="c">// "Ana" — the key is a literal you typed</span>
user["name"];           <span class="c">// same thing, spelled differently</span>

const key = "age";
user[key];              <span class="c">// 26 — dot notation CAN'T do this; user.key would look for a property literally named "key"</span>
user["favorite color"]; <span class="c">// dot notation can't have a space in it at all</span></code></pre>
<p class="sub">
  As a reminder from <a href="/notes/types-values">the types chapter</a>:
  an object variable holds a <em>reference</em>, not the data itself —
  copying the variable copies the pointer, not the object.
</p>

<h3>Shorthand and computed keys</h3>
<pre><code>const name = "Ana", age = 29;
const user2 = { name, age };            <span class="c">// shorthand — same as { name: name, age: age }</span>

const field = "role";
const user3 = { [field]: "admin" };     <span class="c">// computed key — the property is named by field's VALUE</span>
console.log(user3);                     <span class="c">// { role: "admin" }, not { field: "admin" }</span></code></pre>

<h3>Arrays — indexed, ordered, still objects underneath</h3>
<pre><code>const nums = [10, 20, 30];
nums[0];          <span class="c">// 10 — indexing starts at 0</span>
nums.length;       <span class="c">// 3</span>
nums[nums.length - 1];  <span class="c">// 30 — the standard "last element" idiom</span>
nums[10];          <span class="c">// undefined — out of range, not an error</span></code></pre>
<p class="sub">
  <code>typeof []</code> is <code>"object"</code> and
  <code>Array.isArray()</code> is the only reliable check — both covered
  back in <a href="/notes/setup-mental-model">the mental model
  chapter</a>. What actually makes an array useful is the ordered,
  numerically-indexed methods below.
</p>

<h3>Mutating methods — they change the array in place</h3>
<table>
  <tr>
    <th>Call</th>
    <th>Does</th>
    <th>Returns</th>
  </tr>
  <tr><td><code>arr.push(x)</code></td><td>adds to the end</td><td>new length</td></tr>
  <tr><td><code>arr.pop()</code></td><td>removes from the end</td><td>the removed element</td></tr>
  <tr><td><code>arr.unshift(x)</code></td><td>adds to the start</td><td>new length</td></tr>
  <tr><td><code>arr.shift()</code></td><td>removes from the start</td><td>the removed element</td></tr>
  <tr><td><code>arr.splice(start, count, …items)</code></td><td>removes <code>count</code> at <code>start</code>, inserts <code>…items</code> there</td><td>array of removed elements</td></tr>
  <tr><td><code>arr.sort(cmp)</code></td><td>sorts in place</td><td>the same array</td></tr>
  <tr><td><code>arr.reverse()</code></td><td>reverses in place</td><td>the same array</td></tr>
</table>
<div class="try">
  <pre><code>console.log([10, 1, 2].sort());              <span class="c">// what happens?</span>
console.log([10, 1, 2].sort((a, b) =&gt; a - b)); <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  Without a comparator, <code>sort()</code> converts everything to a
  <b>string</b> and sorts lexicographically — so <code>10</code> comes
  before <code>2</code>, because <code>"1"</code> sorts before
  <code>"2"</code>. A comparator that returns negative/zero/positive is
  the only reliable way to sort numbers.
</p>
<div class="warn">
  <span class="ttl">⚠ push/pop are cheap, shift/unshift are not</span>
  Adding or removing at the <em>end</em> of an array is O(1). Doing it
  at the <em>start</em> is O(n) — every other element has to shift
  index. For a queue you fill from one end and drain from the other,
  reach for <code>push</code>/<code>shift</code> and know that's a
  trade-off, not a free choice.
</div>

<h3>Non-mutating methods — they read, they don't touch</h3>
<table>
  <tr>
    <th>Call</th>
    <th>Returns</th>
  </tr>
  <tr><td><code>arr.slice(start, end)</code></td><td>a new array, <code>end</code> excluded — negative indices count from the back</td></tr>
  <tr><td><code>arr.indexOf(x)</code></td><td>first matching index, or <code>-1</code> — compares with <code>===</code></td></tr>
  <tr><td><code>arr.includes(x)</code></td><td><code>true</code>/<code>false</code> — the one case where it differs from <code>indexOf</code>: it also matches <code>NaN</code></td></tr>
</table>
<div class="try">
  <pre><code>console.log([NaN].indexOf(NaN));   <span class="c">// what happens?</span>
console.log([NaN].includes(NaN));  <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>-1</code>, then <code>true</code>. <code>indexOf</code> compares
  with <code>===</code>, and <code>NaN === NaN</code> is
  <code>false</code> — so <code>indexOf</code> can never find a
  <code>NaN</code>, no matter how many are in the array.
  <code>includes</code> uses a different algorithm (SameValueZero) that
  treats <code>NaN</code> as equal to itself. It's a small detail with a
  real consequence: <code>includes</code> is the safer default unless
  you specifically need the index back.
</p>
<div class="sticky mint">
  <span class="ttl">Rule</span> <code>splice</code> mutates,
  <code>slice</code> doesn't — same six letters, opposite behavior. If
  you're not sure whether a method is safe on a shared array, check
  first; it's the single most common source of "why did this other
  variable change too" bugs.
</div>

<h3>map / filter / find / forEach / reduce</h3>
<p>
  Five methods that all walk the array element by element — the
  difference is entirely in what each one hands back.
</p>
<table>
  <tr>
    <th>Method</th>
    <th>Gives back</th>
    <th>Use it when</th>
  </tr>
  <tr><td><code>.map(fn)</code></td><td>a new array, same length</td><td>you're transforming every element</td></tr>
  <tr><td><code>.filter(fn)</code></td><td>a new array, shorter or equal</td><td>you're keeping some elements, dropping others</td></tr>
  <tr><td><code>.find(fn)</code></td><td>one element, or <code>undefined</code></td><td>you want the first match and nothing else</td></tr>
  <tr><td><code>.forEach(fn)</code></td><td>nothing (<code>undefined</code>)</td><td>you're only running side effects — no new array</td></tr>
  <tr><td><code>.reduce(fn, initial)</code></td><td>whatever you build up</td><td>collapsing the array into one value — a sum, an object, another array</td></tr>
</table>
<pre><code>const cart = [
  { name: "Pen", price: 20, qty: 3 },
  { name: "Book", price: 150, qty: 1 },
  { name: "Eraser", price: 5, qty: 0 },
];

cart.map(item =&gt; item.name);              <span class="c">// ["Pen", "Book", "Eraser"]</span>
cart.filter(item =&gt; item.qty &gt; 0);         <span class="c">// Pen and Book only</span>
cart.find(item =&gt; item.price &gt; 100);      <span class="c">// the Book object itself</span>
cart.forEach(item =&gt; console.log(item.name)); <span class="c">// logs 3 times, returns undefined</span>
cart.reduce((total, item) =&gt; total + item.price * item.qty, 0); <span class="c">// 210</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ forEach can't be stopped, and its return is
  thrown away</span>
  <code>break</code> doesn't work inside a <code>forEach</code>
  callback, and <code>return</code>ing from it just skips to the next
  element — it does not exit the loop. Need to stop early? Use a real
  <code>for</code>/<code>for...of</code> loop, or <code>.find</code>/
  <code>.some</code> if you're really just searching.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "map and filter are for
  building a new array. forEach is for side effects — logging,
  pushing into something outside the callback. reduce is the general
  case underneath map and filter — either one could be written with
  reduce, but reduce for a simple transform reads worse, not better."
</div>

<h3>Destructuring</h3>
<p>
  Unpacking values out of an object or array into their own named
  variables, in one line instead of one assignment per field.
</p>
<pre><code><span class="c">// Object destructuring — order doesn't matter, names must match</span>
const { name, age } = user;
const { name: fullName } = user;         <span class="c">// rename while unpacking</span>
const { role = "guest" } = user;         <span class="c">// default when the key is missing</span>
const { address: { city } } = user;      <span class="c">// nested, straight to "city"</span>

<span class="c">// Array destructuring — position IS the match, gaps are allowed</span>
const [first, , third] = [10, 20, 30];   <span class="c">// skips index 1</span>
const [head, ...tail] = [1, 2, 3, 4];    <span class="c">// head = 1, tail = [2, 3, 4]</span></code></pre>
<div class="try">
  <pre><code>let x = 1, y = 2;
[x, y] = [y, x];
console.log(x, y);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>2 1</code> — swapped, with no temporary variable. The right
  side builds a whole new array <code>[y, x]</code> first, then
  destructuring unpacks it back into <code>x</code> and <code>y</code>
  in one step.
</p>
<p>
  Destructuring is everywhere a value shows up, including function
  parameters — a very common way to accept an options object:
</p>
<pre><code>function createUser({ name, age = 18 }) {
  return name + " is " + age;
}
createUser({ name: "Ana" });   <span class="c">// "Ana is 18"</span></code></pre>

<h3>Spread — the opposite of destructuring</h3>
<p>
  <code>...</code> on the way <em>in</em> (an array/object literal, a
  function call) expands a collection into its individual elements.
</p>
<pre><code>const a = [1, 2, 3];
const b = [...a, 4, 5];        <span class="c">// [1, 2, 3, 4, 5] — a new array</span>

const base = { name: "Ana", age: 29 };
const patched = { ...base, age: 30 };  <span class="c">// { name: "Ana", age: 30 } — later keys win</span>

Math.max(...a);                <span class="c">// spreads the array into 3 separate arguments</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Spread copies one level deep only</span>
  <code>{ ...base }</code> makes a fresh top-level object, but any
  property that's itself an object or array is still the
  <em>same reference</em>, shared between the original and the copy.
  Mutate a nested field through the copy and the original sees it too —
  the reference-copying rule from earlier never went away, spread just
  copies the outer layer for you.
</div>
<pre><code>const original = { nested: { count: 1 } };
const copy = { ...original };
copy.nested.count = 99;
console.log(original.nested.count);   <span class="c">// 99 — same nested object, not a copy of it</span></code></pre>`,
    },
    {
      id: "dom-events",
      num: "B6",
      title: "DOM & events",
      short: "DOM & events",
      levels: ["beginner"],
      practice: [],
      ready: true,
      subtitle: "The DOM is a live tree of objects — and JS can poke every branch of it.",
      body: `<p>
  Everything below runs against a <b>real, live sandbox</b> on this
  page, not a simulation — the buttons genuinely call
  <code>querySelector</code>, <code>classList</code>,
  <code>appendChild</code> and friends against the little page snippet
  right above them. Push every button before reading on; watching it
  happen is most of the lesson.
</p>

<div class="demo">
  <div class="demo__bar">Live DOM playground</div>
  <div class="demo__body">
    <div class="dom-sandbox" id="de-sandbox">
      <h4>Sandbox page</h4>
      <p id="de-text">Click a button below to mutate me.</p>
      <ul id="de-list">
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
      <form id="de-form">
        <input id="de-input" type="text" placeholder="type something, then submit" />
        <button class="btn" type="submit">Submit</button>
      </form>
    </div>
    <div class="demo__ctl">
      <button class="btn" id="de-text-btn" type="button">Change text</button>
      <button class="btn" id="de-class-btn" type="button">Toggle highlight</button>
      <button class="btn" id="de-add-btn" type="button">Add list item</button>
      <button class="btn" id="de-remove-btn" type="button">Remove last item</button>
      <button class="btn btn--ghost" id="de-reset-btn" type="button">Reset</button>
    </div>
    <p class="demo__note">Every click below is logged with the exact DOM call that ran.</p>
    <div class="demo__term" id="de-log"></div>
  </div>
</div>

<script>
(function () {
  var sandbox = document.getElementById("de-sandbox");
  if (!sandbox) return;
  if (sandbox.dataset.demoInit) return;
  sandbox.dataset.demoInit = "1";

  var textEl = document.getElementById("de-text");
  var listEl = document.getElementById("de-list");
  var formEl = document.getElementById("de-form");
  var inputEl = document.getElementById("de-input");
  var logEl = document.getElementById("de-log");

  var TEXTS = [
    "Click a button below to mutate me.",
    "That was textEl.textContent = \\"...\\" — a real DOM write."
  ];
  var textIndex = 0;
  var itemCount = 2;

  function log(msg) {
    var line = document.createElement("div");
    line.className = "ok";
    line.textContent = msg;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  document.getElementById("de-text-btn").addEventListener("click", function () {
    textIndex = (textIndex + 1) % TEXTS.length;
    textEl.textContent = TEXTS[textIndex];
    log('textEl.textContent = "' + TEXTS[textIndex] + '"');
  });

  document.getElementById("de-class-btn").addEventListener("click", function () {
    var on = textEl.classList.toggle("de-highlight");
    log('textEl.classList.toggle("de-highlight") -> ' + on);
  });

  document.getElementById("de-add-btn").addEventListener("click", function () {
    itemCount++;
    var li = document.createElement("li");
    li.textContent = "Item " + itemCount;
    listEl.appendChild(li);
    log("document.createElement + listEl.appendChild -> " + listEl.children.length + " items now");
  });

  document.getElementById("de-remove-btn").addEventListener("click", function () {
    if (!listEl.lastElementChild) { log("nothing left to remove"); return; }
    listEl.removeChild(listEl.lastElementChild);
    log("listEl.removeChild(listEl.lastElementChild) -> " + listEl.children.length + " items now");
  });

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    log('submit caught — e.type="' + e.type + '", e.target.tagName="' + e.target.tagName + '", value="' + inputEl.value + '"');
    inputEl.value = "";
  });

  document.getElementById("de-reset-btn").addEventListener("click", function () {
    textIndex = 0;
    textEl.textContent = TEXTS[0];
    textEl.classList.remove("de-highlight");
    while (listEl.children.length > 2) listEl.removeChild(listEl.lastElementChild);
    itemCount = 2;
    logEl.innerHTML = "";
    log("reset to the starting state");
  });
})();
</script>

<h3>Selecting elements</h3>
<table>
  <tr>
    <th>Call</th>
    <th>Returns</th>
  </tr>
  <tr><td><code>document.getElementById(id)</code></td><td>one element, or <code>null</code> — no <code>#</code> prefix</td></tr>
  <tr><td><code>document.querySelector(css)</code></td><td>the first match for any CSS selector, or <code>null</code></td></tr>
  <tr><td><code>document.querySelectorAll(css)</code></td><td>a <code>NodeList</code> of every match — not a real array, but it has <code>.forEach</code></td></tr>
</table>
<pre><code>document.getElementById("de-text");         <span class="c">// exact id match</span>
document.querySelector("#de-text");         <span class="c">// same element, CSS-selector syntax</span>
document.querySelector(".btn");             <span class="c">// the FIRST element with class "btn"</span>
document.querySelectorAll(".btn");          <span class="c">// every element with class "btn"</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> <code>querySelector</code>/
  <code>querySelectorAll</code> take real CSS selectors, so anything you
  can write in a stylesheet works here too —
  <code>"ul li:last-child"</code>, <code>"[data-active]"</code>,
  <code>"input[type=email]"</code>. That flexibility is why they've
  mostly replaced the older, narrower
  <code>getElementsByClassName</code>/<code>getElementsByTagName</code>.
</div>

<h3>Reading and changing content</h3>
<table>
  <tr>
    <th>Property</th>
    <th>Reads/writes</th>
    <th>Watch out for</th>
  </tr>
  <tr><td><code>el.textContent</code></td><td>plain text only</td><td>the safe default — never parses HTML</td></tr>
  <tr><td><code>el.innerHTML</code></td><td>markup, parsed as HTML</td><td>user-supplied text through here is an XSS hole — see the security chapter</td></tr>
  <tr><td><code>el.getAttribute(name)</code> / <code>setAttribute(name, v)</code></td><td>any HTML attribute, always as a string</td><td>use for custom/<code>data-*</code> attributes</td></tr>
  <tr><td><code>el.classList</code></td><td><code>.add()</code>, <code>.remove()</code>, <code>.toggle()</code>, <code>.contains()</code></td><td>the modern way to manage classes — no manual string splitting</td></tr>
</table>
<pre><code>el.textContent = "hello &lt;b&gt;there&lt;/b&gt;";  <span class="c">// literal text — tags show up as text, not bold</span>
el.innerHTML = "hello &lt;b&gt;there&lt;/b&gt;";     <span class="c">// actually renders as bold</span>

el.setAttribute("data-user-id", "42");
el.getAttribute("data-user-id");            <span class="c">// "42" — always a string, even for numbers</span>

el.classList.add("active");
el.classList.toggle("open");                <span class="c">// on if it was off, off if it was on</span>
el.classList.contains("active");            <span class="c">// true</span></code></pre>

<h3>Creating, appending, removing</h3>
<pre><code>const li = document.createElement("li");   <span class="c">// exists only in memory so far</span>
li.textContent = "New item";
listEl.appendChild(li);                     <span class="c">// now it's actually in the page</span>

listEl.removeChild(li);                     <span class="c">// gone from the page (still exists in memory until GC'd)</span>
li.remove();                                <span class="c">// modern shorthand — no need to know the parent</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ appendChild moves, it doesn't copy</span>
  If <code>li</code> is already somewhere in the page and you
  <code>appendChild</code> it again elsewhere, it's <em>relocated</em>,
  not duplicated — an element can only exist at one spot in the tree at
  a time. Need it in two places? Use
  <code>el.cloneNode(true)</code> (the <code>true</code> means "deep
  clone, children included") and append the clone.
</div>

<h3>Events — addEventListener and the event object</h3>
<pre><code>button.addEventListener("click", function (event) {
  console.log(event.type);          <span class="c">// "click"</span>
  console.log(event.target);        <span class="c">// the exact element that was clicked</span>
  console.log(event.currentTarget); <span class="c">// the element the LISTENER is attached to</span>
});</code></pre>
<p>
  <code>target</code> and <code>currentTarget</code> only differ when
  events <b>bubble</b> — a click starts at the exact element you tapped
  and travels upward through every ancestor that's listening.
  <code>target</code> stays fixed at where it started;
  <code>currentTarget</code> is always whichever element's listener is
  currently running. That bubbling is what makes event delegation work:
  put <em>one</em> listener on a parent list instead of one on every
  item, and check <code>event.target</code> inside it to see which item
  was actually clicked.
</p>

<h3>preventDefault — stopping the browser's own reaction</h3>
<p>
  Some elements have a built-in behavior for certain events — a form
  submits and reloads the page, an <code>&lt;a&gt;</code> navigates.
  <code>event.preventDefault()</code> cancels <em>that specific
  default</em> without stopping the event from continuing to bubble or
  running your own handler.
</p>
<pre><code>form.addEventListener("submit", function (event) {
  event.preventDefault();          <span class="c">// stop the page reload</span>
  const data = new FormData(form); <span class="c">// now handle it yourself — fetch(), validation, etc.</span>
});</code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> <code>preventDefault()</code> stops the
  browser's built-in reaction. <code>stopPropagation()</code> stops the
  event from bubbling further up the tree. They solve two different
  problems and it's common to need only one of them.
</div>

<h3>Forms and input values</h3>
<pre><code>input.value;                 <span class="c">// the current text — always a string, even for type="number"</span>
input.value = "";            <span class="c">// clearing it programmatically</span>

checkbox.checked;            <span class="c">// boolean — .value on a checkbox is NOT what's checked</span>
select.value;                <span class="c">// the selected &lt;option&gt;'s value</span>

input.addEventListener("input", e =&gt; console.log(e.target.value));  <span class="c">// fires on every keystroke</span>
input.addEventListener("change", e =&gt; console.log(e.target.value)); <span class="c">// fires once, on blur/commit</span></code></pre>
<p class="sub">
  <code>input</code> vs <code>change</code> trips a lot of people up:
  <code>input</code> is for "react live, as they type" (a character
  counter, live search); <code>change</code> is for "react once they're
  done" (a select dropdown, a checkbox, a field that loses focus).
</p>`,
    },
    {
      id: "basic-async",
      num: "B7",
      title: "Basic async",
      short: "Basic async",
      levels: ["beginner"],
      practice: [],
      ready: true,
      subtitle: "Just enough to fetch something and not freeze the page doing it.",
      body: `<p>
  This is the surface level — <em>how</em> to fire off something that
  takes time and react when it's done. <em>Why</em> it works that way
  underneath — the call stack, the microtask queue, the exact ordering
  rules — is the demo you already stepped through back in
  <a href="/notes/setup-mental-model">the mental model chapter</a>, and
  gets a full chapter of its own later. Here, just the tools.
</p>

<h3>setTimeout / setInterval</h3>
<pre><code>const id = setTimeout(() =&gt; {
  console.log("ran once, after the delay");
}, 1000);                        <span class="c">// milliseconds — 1000 = 1 second</span>

clearTimeout(id);                <span class="c">// cancel it before it fires</span>

const tick = setInterval(() =&gt; {
  console.log("runs again, and again, every 500ms");
}, 500);

clearInterval(tick);             <span class="c">// the ONLY way to make it stop</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ The delay is a minimum, not a guarantee</span>
  <code>setTimeout(fn, 0)</code> does not run immediately — it means
  "as soon as the call stack is empty and it's this callback's turn,"
  which could be milliseconds later if the thread is busy with
  something else. JS is single-threaded; a timer can never interrupt
  code that's already running.
</div>
<div class="try">
  <pre><code>let count = 0;
await new Promise((resolve) =&gt; {
  const id = setInterval(() =&gt; {
    count++;
    console.log("tick", count);
    if (count === 3) { clearInterval(id); resolve(); }
  }, 50);
});</code></pre>
</div>
<p class="sub">
  Run it — three ticks, then silence. (The <code>await</code> around it
  is only here so this sandbox waits for all three ticks before calling
  the run finished — in your own code you'd rarely wrap a
  <code>setInterval</code> like that.) Forgetting the
  <code>clearInterval</code> in real code is one of the most common
  memory leaks: the interval keeps a reference to everything its
  callback closes over, alive forever, long after whatever UI it was
  updating is gone from the page.
</p>

<h3>fetch — asking the network for something</h3>
<pre><code>fetch("/api/users/1")
  .then(response =&gt; response.json())   <span class="c">// parses the response body as JSON — itself async</span>
  .then(data =&gt; console.log(data))
  .catch(error =&gt; console.error("request failed:", error));</code></pre>
<p>
  <code>fetch</code> resolves as soon as the server sends back
  <em>any</em> response — even a 404 or a 500. It only rejects on a real
  network failure (offline, DNS gone, CORS blocked). That means status
  codes need their own check:
</p>
<pre><code>fetch("/api/users/1").then(response =&gt; {
  if (!response.ok) {              <span class="c">// true for 200-299, false for 404/500/etc.</span>
    throw new Error("Request failed: " + response.status);
  }
  return response.json();
});</code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> A rejected <code>fetch</code> promise
  means the network itself failed. A "successful" 404 still resolves —
  always check <code>response.ok</code> before trusting the body.
</div>
<p class="sub">
  <code>.then()</code>/<code>.catch()</code> chains work, but
  <code>async</code>/<code>await</code> — the same request rewritten
  without the chain — reads more like ordinary code and is what you'll
  actually reach for day to day. It gets its own proper chapter once
  promises themselves have been covered in depth.
</p>

<h3>JSON.stringify / JSON.parse</h3>
<p>
  JavaScript objects and JSON text are not the same thing — every
  network request body, every <code>localStorage</code> value, every
  config file round-trips through a real conversion, and that
  conversion drops things silently.
</p>
<div class="try">
  <pre><code>const obj = { a: 1, b: undefined, c: function () {}, d: [1, undefined, 2] };
console.log(JSON.stringify(obj));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>{"a":1,"d":[1,null,2]}</code> — <code>b</code> and
  <code>c</code> vanish completely, because JSON has no way to
  represent <code>undefined</code> or a function as a
  <em>property value</em>. Inside an array, though, the same
  <code>undefined</code> can't just be skipped without shifting every
  index after it — so it becomes <code>null</code> instead.
</p>
<pre><code>JSON.stringify({ a: 1, b: 2 }, null, 2);
<span class="c">// {
//   "a": 1,
//   "b": 2
// }        — the third argument is indent width, for readable output</span>

JSON.parse('{"a":1,"b":[1,2,3]}');    <span class="c">// back to a real object — { a: 1, b: [1, 2, 3] }</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ A circular reference throws</span>
  <code>const o = {}; o.self = o; JSON.stringify(o);</code> throws
  <code>TypeError: Converting circular structure to JSON</code> —
  <code>stringify</code> walks the whole object graph and has no way to
  represent a reference back to something it's already visiting.
</div>
<p>
  This pairing is also the standard, dependency-free way to deep-clone
  a plain object — with real limits:
</p>
<pre><code>const clone = JSON.parse(JSON.stringify(original));</code></pre>
<p class="sub">
  Works for plain data — objects, arrays, strings, numbers, booleans,
  <code>null</code>. Silently mangles anything else: <code>Date</code>
  becomes a string, <code>Map</code>/<code>Set</code> become
  <code>{}</code>, functions and <code>undefined</code> vanish exactly
  as above. Fine for a config blob; wrong for cloning anything richer —
  <code>structuredClone()</code> (built into every modern runtime) does
  a real deep clone, Dates and Maps included.
</p>`,
    },
    {
      id: "errors-tools",
      num: "B8",
      title: "Errors & tools",
      short: "Errors & tools",
      levels: ["beginner"],
      practice: [],
      ready: true,
      subtitle: "The beginner track's last stop — reading what the engine is trying to tell you.",
      body: `<h3>try / catch / finally</h3>
<pre><code>try {
  JSON.parse("this isn't JSON");     <span class="c">// throws a SyntaxError</span>
} catch (error) {
  console.log("caught:", error.message);
} finally {
  console.log("finally always runs — success, failure, doesn't matter");
}</code></pre>
<div class="try">
  <pre><code>try {
  throw new Error("inner");
} finally {
  console.log("finally ran");
}</code></pre>
</div>
<p class="sub">
  Click run — you'll see <code>"finally ran"</code>, and then the
  error still shows up as uncaught below it. There's no
  <code>catch</code> here at all, and <code>finally</code> doesn't stop
  the error from propagating — it just guarantees that cleanup code
  (closing a connection, hiding a spinner) runs on the way out, whether
  the block succeeded or not.
</p>
<p>
  The caught value doesn't have to be named if you don't need it —
  useful when you only care <em>that</em> something failed:
</p>
<pre><code>try {
  riskyThing();
} catch {                 <span class="c">// no (error) — the binding is optional since ES2019</span>
  showFallbackUI();
}</code></pre>

<h3>Custom errors</h3>
<p>
  <code>Error</code> is a class like any other — extend it to attach
  your own data, and <code>instanceof</code> still recognizes the whole
  chain.
</p>
<div class="try">
  <pre><code>class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

try {
  throw new ValidationError("age must be positive", "age");
} catch (e) {
  console.log(e.name, "-", e.message, "- field:", e.field);
  console.log("is an Error:", e instanceof Error);
  console.log("is a ValidationError:", e instanceof ValidationError);
}</code></pre>
</div>
<p class="sub">
  Both <code>instanceof</code> checks come back <code>true</code> —
  <code>super(message)</code> wires up the normal <code>Error</code>
  machinery (<code>.message</code>, <code>.stack</code>), and the
  <code>class ... extends Error</code> keeps the prototype chain intact.
  That lets calling code catch broadly (<code>instanceof Error</code>)
  or specifically (<code>instanceof ValidationError</code>) depending on
  what it actually needs to handle differently.
</p>

<h3>Reading a stack trace</h3>
<p>
  Every <code>Error</code> carries a <code>.stack</code> string — a
  snapshot of every function call that was still active the moment it
  was thrown, most-recent first:
</p>
<pre><code>Error: Cannot read properties of undefined (reading 'name')
    at getDisplayName (utils.js:12:18)
    at renderUser (UserCard.js:8:24)
    at renderApp (App.js:22:3)
    at main (index.js:5:1)</code></pre>
<p class="sub">
  Read it <b>top to bottom, most specific first</b>: line 1 is where
  the error actually happened — inside <code>getDisplayName</code>, at
  <code>utils.js</code> line 12. Every line under it is a caller, in
  order, all the way out to where the whole chain started. The bug is
  almost always at or near the top; the rest of the trace is just
  "how did we get here."
</p>
<div class="warn">
  <span class="ttl">⚠ The throw site isn't always the bug</span>
  A <code>TypeError</code> reading a property of <code>undefined</code>
  tells you <em>where it blew up</em>, not <em>where it went wrong</em>.
  The real bug is usually a few frames up — whatever handed
  <code>getDisplayName</code> an object it shouldn't have. Read the
  whole trace before fixing the top line.
</div>

<h3>console — more than .log</h3>
<table>
  <tr>
    <th>Call</th>
    <th>For</th>
  </tr>
  <tr><td><code>console.log(...)</code></td><td>general output</td></tr>
  <tr><td><code>console.info(...)</code>, <code>console.debug(...)</code></td><td>same as log, different icon — some filters hide/show them separately</td></tr>
  <tr><td><code>console.warn(...)</code></td><td>yellow, doesn't stop anything — a heads-up</td></tr>
  <tr><td><code>console.error(...)</code></td><td>red, includes a stack trace automatically</td></tr>
  <tr><td><code>console.table(data)</code></td><td>an array of objects, rendered as an actual table</td></tr>
  <tr><td><code>console.group(label)</code> / <code>.groupEnd()</code></td><td>indents everything between them — collapsible in DevTools</td></tr>
  <tr><td><code>console.time(label)</code> / <code>.timeEnd(label)</code></td><td>how long the code between them took</td></tr>
</table>
<pre><code>console.table([
  { name: "Ana", age: 29, role: "admin" },
  { name: "Ravi", age: 34, role: "editor" },
]);</code></pre>
<p class="sub">
  Open your own DevTools console and run that — every object becomes a
  row, every shared key becomes a column, automatically. It's the
  single fastest way to eyeball an array of records without writing a
  loop just to look at it.
</p>

<h3>DevTools, the short version</h3>
<ul>
  <li>
    <b>Elements panel</b> — the live DOM tree, editable in place. Change
    a class or a style here to test an idea before touching the file.
  </li>
  <li>
    <b>Console panel</b> — everything above, plus a REPL you can run
    arbitrary code in, against the actual page that's open.
  </li>
  <li>
    <b>Sources panel</b> — set a real breakpoint by clicking a line
    number, or drop <code>debugger;</code> directly in your code. Either
    one pauses execution right there, with every variable in scope
    inspectable.
  </li>
  <li>
    <b>Network panel</b> — every request the page made, its status,
    timing, and response — the first place to look when "the data never
    showed up."
  </li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "console.log tells you
  what you thought to ask for. A breakpoint lets you stop time and
  inspect everything — including the things you didn't think to log."
</div>`,
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
