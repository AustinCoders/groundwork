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
      practice: ["ex-array-methods-chain", "ex-nested-destructure"],
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
      practice: ["ex-mini-emitter"],
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
      practice: ["ex-delayed-double", "ex-json-roundtrip"],
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
      practice: ["ex-safe-parse", "ex-custom-error"],
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
    },
    {
      id: "objects-deep",
      num: "I2",
      title: "Objects deeply",
      short: "Objects deeply",
      levels: ["intermediate"],
      practice: ["ex-group-by", "ex-no-mutation", "ex-dedupe-map"],
      ready: true,
      subtitle: "The rest of the object/array toolbox — past what B5 already covered.",
      body: `<p>
  <a href="/notes/objects-arrays-basics">The first pass at objects and
  arrays</a> covered literals, the core mutating/non-mutating array
  methods, and basic destructuring/spread. This chapter is everything
  past that: computed behavior on objects, the two collection types
  that aren't arrays, and the JSON details that only bite in real apps.
</p>

<h3>Getters and setters</h3>
<p>
  A property that runs code on read or write, while still looking like
  a plain field to anything using it — no <code>()</code> at the call
  site.
</p>
<div class="try">
  <pre><code>const person = {
  first: "Ana",
  last: "Rao",
  get fullName() {
    return this.first + " " + this.last;
  },
  set fullName(value) {
    [this.first, this.last] = value.split(" ");
  },
};

console.log(person.fullName);      <span class="c">// what happens?</span>
person.fullName = "Ravi Shah";     <span class="c">// looks like a plain assignment</span>
console.log(person.first, person.last);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"Ana Rao"</code>, then <code>"Ravi" "Shah"</code> — the setter
  ran and split the incoming string back into two real fields. This is
  the standard way to keep a derived value (<code>fullName</code>) in
  sync with the data it's derived from, without callers ever calling a
  method to get it.
</p>

<h3>Object statics — the whole-object toolkit</h3>
<table>
  <tr>
    <th>Call</th>
    <th>Returns</th>
  </tr>
  <tr><td><code>Object.keys(obj)</code></td><td>array of own, enumerable key names</td></tr>
  <tr><td><code>Object.values(obj)</code></td><td>array of the matching values</td></tr>
  <tr><td><code>Object.entries(obj)</code></td><td>array of <code>[key, value]</code> pairs — feeds straight into a <code>for...of</code> or <code>new Map()</code></td></tr>
  <tr><td><code>Object.fromEntries(pairs)</code></td><td>the reverse — pairs back into an object</td></tr>
  <tr><td><code>Object.assign(target, ...sources)</code></td><td>copies own enumerable props from each source onto <code>target</code>, left to right — <b>mutates target</b></td></tr>
  <tr><td><code>Object.hasOwn(obj, key)</code></td><td><code>true</code> only for the object's <b>own</b> property, never an inherited one</td></tr>
</table>
<pre><code>const o = { a: 1, b: 2 };
Object.entries(o);                       <span class="c">// [["a", 1], ["b", 2]]</span>
Object.fromEntries([["x", 1], ["y", 2]]); <span class="c">// { x: 1, y: 2 }</span>
Object.hasOwn(o, "a");                   <span class="c">// true</span>
Object.hasOwn(o, "toString");            <span class="c">// false — toString is inherited, not o's own</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Object.assign mutates its first argument</span>
  <code>Object.assign(base, patch)</code> changes <code>base</code> in
  place and returns it. To merge without touching either input, pass an
  empty object as the target — or reach for spread instead:
  <code>{ ...base, ...patch }</code> does the same merge, immutably.
</div>

<h3>Copying — shallow, deep, and what actually does which</h3>
<p>
  <a href="/notes/objects-arrays-basics">Already established</a>:
  spread and <code>Object.assign</code> both copy one level deep, so a
  nested object stays shared. For a <b>real</b> deep copy of plain
  data, <code>structuredClone()</code> is the built-in answer — no
  library, works on objects, arrays, <code>Date</code>, <code>Map</code>,
  <code>Set</code>, and it correctly throws rather than silently
  mangling a function or a DOM node it can't clone.
</p>
<pre><code>const original = { nested: { count: 1 }, tags: new Set(["a"]) };
const deep = structuredClone(original);
deep.nested.count = 99;
console.log(original.nested.count);   <span class="c">// 1 — untouched, unlike a spread copy</span>
console.log(deep.tags instanceof Set); <span class="c">// true — the Set survived the clone</span></code></pre>

<h3>Map and Set — objects and arrays with better rules</h3>
<p>
  A <code>Map</code> is a key/value store like an object, but with two
  things a plain object can't do: <b>any value</b> can be a key
  (not just strings/symbols), and it remembers <b>insertion order</b>
  reliably, including for keys that look numeric.
</p>
<div class="try">
  <pre><code>const objKey = { id: 1 };
const cache = new Map();
cache.set(objKey, "cached result");
cache.set("plain-string-key", "also fine");

console.log(cache.get(objKey));         <span class="c">// what happens?</span>
console.log(cache.get({ id: 1 }));      <span class="c">// a DIFFERENT object, same shape — what happens?</span>
console.log(cache.size);</code></pre>
</div>
<p class="sub">
  <code>"cached result"</code>, then <code>undefined</code>. Map keys
  are compared by <b>identity</b>, same as everything else about
  object references — a freshly-built <code>{ id: 1 }</code> is not the
  <code>objKey</code> it was stored under, no matter how identical it
  looks. This is exactly why an object can be used to key a private,
  un-guessable cache entry.
</p>
<table>
  <tr>
    <th></th>
    <th><code>Object</code></th>
    <th><code>Map</code></th>
  </tr>
  <tr><td>Key types</td><td>strings and symbols only</td><td>anything — objects, functions, <code>NaN</code></td></tr>
  <tr><td>Size</td><td><code>Object.keys(o).length</code></td><td><code>map.size</code>, directly</td></tr>
  <tr><td>Iteration order</td><td>mostly insertion, but integer-like keys sort first — a real gotcha</td><td>always insertion order, no exceptions</td></tr>
  <tr><td>Extra baggage</td><td>inherits from <code>Object.prototype</code> (<code>toString</code>, etc.)</td><td>starts empty — nothing to accidentally collide with</td></tr>
</table>
<p>
  <code>Set</code> is the same idea for values with no key at all —
  a list that silently refuses duplicates, compared the same way
  <code>Map</code> keys are:
</p>
<pre><code>const unique = new Set([1, 2, 2, 3, 3, 3]);
[...unique];              <span class="c">// [1, 2, 3]</span>
unique.has(2);             <span class="c">// true</span>
[...new Set(array)];       <span class="c">// the standard one-liner for "de-duplicate this array"</span></code></pre>

<h3>WeakMap and WeakSet</h3>
<p>
  Same idea as <code>Map</code>/<code>Set</code>, with one restriction
  and one superpower: keys (or values, for a <code>WeakSet</code>) must
  be objects, and they're held <b>weakly</b> — if nothing else in the
  program references that object anymore, the garbage collector is
  free to remove it, entry and all.
</p>
<pre><code>const wm = new WeakMap();
let el = { id: "temp" };
wm.set(el, { extra: "metadata tied to el's lifetime" });
el = null;   <span class="c">// no other reference to the object exists anymore —</span>
             <span class="c">// the WeakMap's entry can now be garbage collected too</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> Reach for a <code>WeakMap</code> when
  you're attaching extra data to objects you don't own the lifetime of
  — DOM nodes, other modules' objects — so that data doesn't
  accidentally keep them alive forever. A regular <code>Map</code>
  would hold a strong reference and leak memory as long as the map
  itself exists.
</div>

<h3>Array methods B5 didn't cover</h3>
<table>
  <tr>
    <th>Call</th>
    <th>Does</th>
  </tr>
  <tr><td><code>Array.from(iterable, mapFn?)</code></td><td>builds a real array from anything iterable OR array-like — a string, a <code>Set</code>, a <code>{ length: n }</code> object — with an optional map step built in</td></tr>
  <tr><td><code>arr.flat(depth)</code></td><td>flattens nested arrays <code>depth</code> levels (default 1)</td></tr>
  <tr><td><code>arr.flatMap(fn)</code></td><td><code>.map(fn).flat(1)</code>, done in one pass — for when a mapper sometimes returns 0 or several items per input</td></tr>
  <tr><td><code>arr.at(-1)</code></td><td>same as <code>arr[arr.length - 1]</code>, but works with negative indices directly</td></tr>
</table>
<pre><code>Array.from({ length: 3 }, (_, i) =&gt; i * 2);   <span class="c">// [0, 2, 4] — no real array needed to start</span>
Array.from("abc");                             <span class="c">// ["a", "b", "c"]</span>
[1, [2, [3, [4]]]].flat(2);                    <span class="c">// [1, 2, 3, [4]] — only 2 levels deep</span>
[1, 2, 3].flatMap(x =&gt; [x, x * 10]);           <span class="c">// [1, 10, 2, 20, 3, 30]</span>
[1, 2, 3].at(-1);                              <span class="c">// 3</span></code></pre>

<h3>Sort stability</h3>
<p>
  Modern <code>Array.prototype.sort</code> is guaranteed
  <b>stable</b>: elements that compare equal keep their original
  relative order. That's not a minor implementation detail — it's what
  makes multi-key sorting possible with two simple, separate sorts.
</p>
<div class="try">
  <pre><code>const items = [
  { key: "a", group: 1 },
  { key: "b", group: 1 },
  { key: "c", group: 0 },
];
const sorted = items.sort((x, y) =&gt; x.group - y.group);
console.log(sorted.map((i) =&gt; i.key));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>["c", "a", "b"]</code> — <code>"a"</code> and <code>"b"</code>
  both have <code>group: 1</code>, tied under the comparator, and
  stability guarantees they stay in their original relative order (a
  before b) rather than the sort being free to swap them arbitrarily.
</p>

<h3>JSON — replacer and reviver</h3>
<p>
  Both <code>stringify</code> and <code>parse</code> take an optional
  second function that runs on every key/value pair — a hook to filter
  or transform as the conversion happens, instead of after.
</p>
<pre><code>JSON.stringify(
  { name: "Ana", email: "ana@x.com", passwordHash: "…" },
  (key, value) =&gt; (key === "passwordHash" ? undefined : value)
);   <span class="c">// {"name":"Ana","email":"ana@x.com"} — dropped before it ever became text</span>

JSON.parse(
  '{"createdAt":"2024-01-01T00:00:00.000Z"}',
  (key, value) =&gt; (key === "createdAt" ? new Date(value) : value)
);   <span class="c">// { createdAt: <a real Date object> } — JSON has no date type, so this is how you get one back</span></code></pre>
<p class="sub">
  The replacer can also be an array instead of a function — a plain
  allow-list of key names to keep, everything else dropped. Simpler
  when you just need a fixed subset of fields, no per-key logic.
</p>

<h3>Nested destructuring and defaults, past the basics</h3>
<pre><code>function render({
  user: { name, address: { city = "Unknown" } = {} } = {},
  theme = "light",
} = {}) {
  return name + " · " + city + " · " + theme;
}
render({ user: { name: "Ana" } });   <span class="c">// "Ana · Unknown · light"</span>
render();                             <span class="c">// no crash — every level has a fallback</span></code></pre>
<p class="sub">
  Each <code>= {}</code> is a default for <em>that specific level</em>
  — without it, destructuring a level that's missing (like
  <code>address</code> not existing on a bare <code>{ name: "Ana" }</code>)
  throws instead of quietly falling through, because you can't
  destructure a property off of <code>undefined</code>.
</p>

<h3>Optional chaining meets deep data</h3>
<pre><code>const config = { server: { retries: 0 } };

config.server?.timeout ?? 5000;    <span class="c">// 5000 — timeout doesn't exist, ?? catches it</span>
config.server?.retries ?? 5000;    <span class="c">// 0 — retries DOES exist, so its real value wins</span>
config.client?.host ?? "localhost";  <span class="c">// "localhost" — client itself is missing, chain stops safely</span></code></pre>
<p class="sub">
  That middle line is the one worth sitting with:
  <a href="/notes/operators-flow">?? only falls back on null/undefined</a>,
  so a genuinely present <code>0</code> survives untouched — exactly
  the combination (<code>?.</code> to reach safely,
  <code>??</code> to default correctly) that a plain
  <code>config.server &amp;&amp; config.server.retries || 5000</code>
  gets wrong, because <code>||</code> would treat that real
  <code>0</code> as missing too.
</p>`,
    },
    {
      id: "prototypes-oop",
      num: "I3",
      title: "Prototypes & OOP",
      short: "Prototypes & OOP",
      levels: ["intermediate"],
      practice: ["ex-class-extends"],
      ready: true,
      subtitle: "class is real syntax now — but it's still prototypes underneath, every time.",
      body: `<h3>The prototype chain</h3>
<p>
  Every object has an internal link to another object — its
  <b>prototype</b> — and property lookup that doesn't find a match
  walks that link outward, exactly like the scope chain walked outward
  in the last chapter. The chain ends at <code>null</code>.
</p>
<div class="boxes">
  <div class="bx is-ref">
    <div class="bx__cap">rex (a Dog instance)</div>
    <div class="bx__slot"><b>name</b><span>"Rex"</span></div>
    <div class="bx__slot"><b>breed</b><span>"Labrador"</span></div>
    <div class="bx__arrow">no "speak" here → check its prototype ↓</div>
  </div>
  <div class="bx is-ref">
    <div class="bx__cap">Dog.prototype</div>
    <div class="bx__slot"><b>speak</b><span>ƒ ()</span></div>
    <div class="bx__arrow">found it — lookup stops here</div>
  </div>
  <div class="bx">
    <div class="bx__cap">Object.prototype</div>
    <div class="bx__slot"><b>toString</b><span>ƒ ()</span></div>
    <div class="bx__arrow">the chain's final stop before null</div>
  </div>
</div>
<div class="warn">
  <span class="ttl">⚠ __proto__ and .prototype are not the same thing</span>
  <code>obj.__proto__</code> (or the modern
  <code>Object.getPrototypeOf(obj)</code>) is the link an
  <em>instance</em> follows. <code>Dog.prototype</code> is a plain
  object that <em>becomes</em> that link for every instance
  <code>new Dog()</code> creates. A function has a
  <code>.prototype</code> property; an object has a
  <code>__proto__</code> link. They're related, never interchangeable.
</div>
<pre><code>function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return this.name + " makes a sound"; };

const rex = new Animal("Rex");
Object.getPrototypeOf(rex) === Animal.prototype;   <span class="c">// true</span>
rex instanceof Animal;                              <span class="c">// true — checks exactly this chain</span>
rex.hasOwnProperty("name");                          <span class="c">// true — set directly on rex</span>
rex.hasOwnProperty("speak");                          <span class="c">// false — it's on the prototype, not rex itself</span></code></pre>

<h3>What new actually does</h3>
<p>
  <code>new Fn(...)</code> is four steps, always, whether
  <code>Fn</code> is an old-style constructor function or a modern
  <code>class</code>:
</p>
<ol>
  <li>A brand-new, empty object is created.</li>
  <li>Its internal prototype link is set to <code>Fn.prototype</code>.</li>
  <li><code>Fn</code> runs with <code>this</code> bound to that new object (the "new" row from <a href="/notes/scope-functions">the this-binding table</a>).</li>
  <li>If <code>Fn</code> returns an object explicitly, <em>that's</em> the result instead — otherwise the new object from step 1 is returned automatically.</li>
</ol>
<div class="try">
  <pre><code>function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype);        <span class="c">// steps 1 &amp; 2</span>
  const result = Ctor.apply(obj, args);              <span class="c">// step 3</span>
  return typeof result === "object" &amp;&amp; result !== null ? result : obj;  <span class="c">// step 4</span>
}

function Dog(name) { this.name = name; }
Dog.prototype.speak = function () { return this.name + " barks"; };

const rex = myNew(Dog, "Rex");
console.log(rex.speak(), rex instanceof Dog);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"Rex barks" true</code> — a hand-rolled <code>new</code> that
  behaves identically to the real keyword, because those are genuinely
  all four steps it performs. It's worth building once, because it
  turns "new is magic" into "new is <code>Object.create</code> plus a
  function call plus a return-value check."
</p>

<h3>class — the same four steps, with real syntax</h3>
<pre><code>class Shape {
  static count = 0;        <span class="c">// lives on the class itself, not on instances</span>
  #id;                      <span class="c">// private field — declared up front, "#" is part of the name</span>

  constructor(name) {
    this.name = name;
    this.#id = ++Shape.count;
  }

  get id() { return this.#id; }        <span class="c">// getters/setters, same as plain objects</span>

  describe() {
    return this.name + " #" + this.id;
  }

  static reset() { Shape.count = 0; }  <span class="c">// called as Shape.reset(), never on an instance</span>
}

class Circle extends Shape {
  constructor(radius) {
    super("Circle");                    <span class="c">// MUST run before "this" is usable at all</span>
    this.radius = radius;
  }
  describe() {
    return super.describe() + " (r=" + this.radius + ")";   <span class="c">// extend, don't just replace</span>
  }
}

const c1 = new Circle(5);
c1.describe();   <span class="c">// "Circle #1 (r=5)"</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> Everything <code>class</code> does is
  still prototypes: methods land on <code>Circle.prototype</code>, not
  on each instance, and <code>extends</code> just wires up the
  prototype chain from the diagram above automatically.
  <code>class</code> is real, enforced syntax on top of the exact same
  machinery — not a different object model bolted on beside it.
</div>
<div class="warn">
  <span class="ttl">⚠ #private is enforced by the parser, not by convention</span>
  <code>c1.#id</code> written <em>outside</em> the class body isn't a
  runtime access-denied error — it's a
  <code>SyntaxError</code> at parse time, because <code>#id</code>
  simply isn't valid syntax anywhere the class hasn't declared it. It's
  a much harder guarantee than the old <code>_id</code>
  underscore-means-private convention, which was never actually
  enforced by anything.
</div>

<h3>Composition vs inheritance, and mixins</h3>
<p>
  <code>extends</code> models "is-a" — a <code>Circle</code>
  <em>is a</em> <code>Shape</code>. Composition models "has-a" or
  "can-do" — building an object out of smaller pieces it holds or uses,
  rather than a class it descends from. Deep inheritance chains tend to
  get brittle (change a base class, every descendant feels it); most
  modern guidance leans composition first, inheritance only for a
  genuinely stable, narrow "is-a" relationship.
</p>
<p>
  A <b>mixin</b> is the middle ground: a function that takes a base
  class and returns a new one with extra behavior bolted on — reusable
  across classes that don't otherwise share a family tree.
</p>
<div class="try">
  <pre><code>const Serializable = (Base) =&gt; class extends Base {
  serialize() { return JSON.stringify(this); }
};

class Point {
  constructor(x, y) { this.x = x; this.y = y; }
}
class SerializablePoint extends Serializable(Point) {}

const p = new SerializablePoint(1, 2);
console.log(p.serialize());   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>{"x":1,"y":2}</code> — <code>Point</code> never mentions
  serialization at all. <code>Serializable(Point)</code> returns a
  brand-new anonymous class that extends <code>Point</code>, so
  <code>SerializablePoint</code> gets both its own fields and the
  mixed-in method, and the same <code>Serializable</code> mixin could
  wrap any other base class exactly the same way.
</p>`,
    },
    {
      id: "async-properly",
      num: "I4",
      title: "Async, properly",
      short: "Async, properly",
      levels: ["intermediate"],
      practice: ["ex-order-predict", "ex-parallel-load", "ex-retry"],
      ready: true,
      subtitle: "Promises, done right — and the sequential-vs-parallel mistake almost everyone makes once.",
      body: `<p>
  The event loop itself — call stack, microtask queue, why a 0ms timer
  still loses to a promise — already got two full step-through demos
  back in <a href="/notes/setup-mental-model">the mental model
  chapter</a>. If that ordering isn't solid yet, that's the place to
  build it; this chapter assumes it and moves straight to the layer on
  top: what a Promise actually <em>is</em>, and how to not shoot
  yourself in the foot with <code>await</code>.
</p>

<h3>A promise has exactly three states</h3>
<table>
  <tr>
    <th>State</th>
    <th>Meaning</th>
    <th>Can it change again?</th>
  </tr>
  <tr><td><b>pending</b></td><td>not settled yet</td><td>yes — to fulfilled or rejected</td></tr>
  <tr><td><b>fulfilled</b></td><td>succeeded, has a value</td><td class="tone-bad">no — permanent</td></tr>
  <tr><td><b>rejected</b></td><td>failed, has a reason</td><td class="tone-bad">no — permanent</td></tr>
</table>
<p>
  "Settled" means fulfilled <em>or</em> rejected — either way, done,
  forever. A promise can only make that transition once; every
  <code>.then()</code>/<code>.catch()</code> attached to it (even
  attached late, after it already settled) gets called with that same
  final outcome.
</p>
<pre><code>fetch("/api/user")
  .then((response) =&gt; response.json())   <span class="c">// each .then returns a NEW promise</span>
  .then((user) =&gt; console.log(user.name))
  .catch((error) =&gt; console.error("failed:", error))   <span class="c">// catches a rejection from ANY step above</span>
  .finally(() =&gt; hideSpinner());          <span class="c">// runs either way, exactly like try/finally</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> A single <code>.catch()</code> at the
  end of a chain catches a failure from every step before it — you
  don't need one per <code>.then()</code>. That's the real advantage
  over callback-style error handling from <a href="/notes/scope-functions">last chapter</a>: one
  handler instead of one check at every level.
</div>

<h3>async / await is the same promises, different spelling</h3>
<pre><code>async function loadUser() {
  try {
    const response = await fetch("/api/user");
    if (!response.ok) throw new Error("Request failed: " + response.status);
    return await response.json();
  } catch (error) {
    console.error("failed:", error);
    throw error;   <span class="c">// re-throw so the caller still knows it failed</span>
  }
}</code></pre>
<p>
  Two things worth being precise about: an <code>async function</code>
  <b>always returns a promise</b>, even if the body has no
  <code>await</code> at all and just <code>return</code>s a plain
  value — that value gets silently wrapped. And
  <code>try/catch</code> around <code>await</code> catches a rejected
  awaited promise exactly like a thrown synchronous error — same
  syntax, unified handling.
</p>

<h3>The mistake: accidental sequential awaiting</h3>
<div class="try">
  <pre><code>function wait(ms, label) {
  return new Promise((resolve) =&gt; setTimeout(() =&gt; resolve(label), ms));
}

async function sequential() {
  const t0 = Date.now();
  await wait(50, "a");
  await wait(50, "b");
  return Date.now() - t0;
}
async function parallel() {
  const t0 = Date.now();
  await Promise.all([wait(50, "a"), wait(50, "b")]);
  return Date.now() - t0;
}

console.log("sequential ~", await sequential(), "ms");
console.log("parallel ~", await parallel(), "ms");</code></pre>
</div>
<p class="sub">
  Roughly <code>100ms</code>, then roughly <code>50ms</code>. Two
  <code>await</code>s back to back run one after the other — the
  second doesn't even <em>start</em> until the first finishes, even
  though the two waits have nothing to do with each other. If the work
  doesn't depend on the previous result, <b>start both first</b>
  (<code>Promise.all</code>, or just call both functions before
  awaiting either), and only then await. This exact mistake — awaiting
  three independent API calls one by one instead of together — is
  a very common, very real source of a slow page.
</p>

<h3>The four combinators</h3>
<table>
  <tr>
    <th>Call</th>
    <th>Settles when</th>
    <th>Result</th>
  </tr>
  <tr><td><code>Promise.all(promises)</code></td><td>all fulfill, <b>or</b> the first one rejects</td><td>array of values, in order — or rejects with that first error</td></tr>
  <tr><td><code>Promise.allSettled(promises)</code></td><td>every one has settled, success or failure</td><td>array of <code>{ status, value }</code> or <code>{ status, reason }</code> — never rejects itself</td></tr>
  <tr><td><code>Promise.race(promises)</code></td><td>the very first one settles, fulfilled or rejected</td><td>that one result — could be a rejection</td></tr>
  <tr><td><code>Promise.any(promises)</code></td><td>the first one <b>fulfills</b> — ignores rejections until one succeeds</td><td>that fulfilled value, or an <code>AggregateError</code> if all rejected</td></tr>
</table>
<div class="try">
  <pre><code>function wait(ms, value, fails) {
  return new Promise((resolve, reject) =&gt;
    setTimeout(() =&gt; (fails ? reject(new Error(value)) : resolve(value)), ms)
  );
}

const settled = await Promise.allSettled([
  wait(10, "ok-1"),
  wait(10, "broke", true),
]);
console.log(JSON.stringify(settled));   <span class="c">// what happens?</span>

const winner = await Promise.any([
  wait(10, "fails-fast", true),
  wait(30, "succeeds-slower"),
]);
console.log(winner);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>allSettled</code> reports both outcomes without ever throwing —
  the standard choice for "run everything, tell me what worked and
  what didn't," like a batch upload. <code>any</code> returns
  <code>"succeeds-slower"</code>: the early rejection doesn't disqualify
  the batch, <code>any</code> just keeps waiting until something
  actually succeeds — the opposite instinct from <code>race</code>,
  which would have surfaced that first rejection immediately.
</p>

<h3>AbortController — cancelling something already in flight</h3>
<p>
  Promises can't be cancelled directly once started — there's no
  <code>.cancel()</code>. <code>AbortController</code> is the
  standard workaround: a signal that in-flight work can watch for, and
  react to by stopping itself.
</p>
<pre><code>async function withTimeout(taskFn, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() =&gt; controller.abort(), ms);
  try {
    return await taskFn(controller.signal);
  } finally {
    clearTimeout(timer);   <span class="c">// clean up even if taskFn finished before the timeout</span>
  }
}

fetch("/api/slow-report", { signal: controller.signal });  <span class="c">// fetch understands AbortSignal natively</span></code></pre>
<p class="sub">
  For the specific "give up after N ms" case, there's a built-in
  shortcut that skips the manual timer entirely:
  <code>AbortSignal.timeout(5000)</code> returns a signal that aborts
  itself on schedule — pass it straight to <code>fetch</code>'s
  <code>signal</code> option.
</p>

<h3>Retries</h3>
<div class="try">
  <pre><code>function wait(ms) {
  return new Promise((resolve) =&gt; setTimeout(resolve, ms));
}

async function retry(fn, attempts, delay) {
  for (let i = 0; i &lt; attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;   <span class="c">// out of attempts — let the real error surface</span>
      await wait(delay);
    }
  }
}

let tries = 0;
async function flaky() {
  tries++;
  if (tries &lt; 3) throw new Error("not ready yet");
  return "succeeded on attempt " + tries;
}

console.log(await retry(flaky, 5, 10));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"succeeded on attempt 3"</code> — the first two calls throw and
  get swallowed (with a delay between attempts), the third succeeds and
  its result is what <code>retry</code> finally returns. A real
  implementation almost always adds
  <b>exponential backoff</b> — <code>delay * 2 ** i</code> instead of a
  fixed delay — so retries space out instead of hammering a struggling
  server at a constant rate.
</p>

<h3>fetch, past the surface level</h3>
<pre><code>const response = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Ana" }),
});

response.ok;              <span class="c">// true for 200-299 — <a href="/notes/basic-async">already covered</a>, still the #1 fetch mistake to forget</span>
response.status;          <span class="c">// 201, 404, 500, …</span>
response.headers.get("content-type");   <span class="c">// header access is case-insensitive</span></code></pre>
<p>
  <b>CORS</b>, briefly: a browser blocks a script on
  <code>a.com</code> from reading a response from <code>b.com</code>
  unless <code>b.com</code>'s server explicitly opts in with an
  <code>Access-Control-Allow-Origin</code> response header. This is
  enforced by the <em>browser</em>, not the server — the request
  usually still reaches the server and can still have side effects; the
  browser just refuses to hand the <em>response</em> back to your
  JavaScript. It's a client-side protection for the person visiting the
  page, not a way for a server to protect itself from being called.
</p>
<div class="warn">
  <span class="ttl">⚠ A CORS error is almost never a JS bug</span>
  If a request works fine in Postman/curl but fails only from the
  browser with a CORS message in the console, the fix is server-side
  (adding the right header) — there is no client-side JavaScript
  workaround for a server that hasn't opted in.
</div>`,
    },
    {
      id: "modules-tooling",
      num: "I5",
      title: "Modules & tooling",
      short: "Modules & tooling",
      levels: ["intermediate"],
      practice: ["ex-semver-satisfies", "ex-pipe"],
      ready: true,
      subtitle: "Everything that turns files full of JS into one thing a browser can run.",
      body: `<p>
  Nothing in this chapter runs in the sandbox above the way earlier
  <code>.try</code> blocks did — <code>import</code>/<code>export</code>
  are only valid inside a real module, not inside an arbitrary function
  body, so every example here is read, not clicked.
</p>

<h3>ESM — import and export</h3>
<pre><code><span class="c">// math.js</span>
export const PI = 3.14159;
export function square(n) { return n * n; }
export default function add(a, b) { return a + b; }   <span class="c">// at most ONE default per module</span>

<span class="c">// app.js</span>
import add, { PI, square } from "./math.js";   <span class="c">// default + named, one import statement</span>
import * as math from "./math.js";              <span class="c">// everything, under one namespace object</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> An imported binding is a
  <b>live view</b> into the exporting module, not a value copied once
  at import time. If <code>math.js</code> later reassigns an exported
  <code>let</code>, every file that imported it sees the new value —
  the same "reference, not snapshot" idea from
  <a href="/notes/objects-arrays-basics">objects and arrays</a>,
  applied to module bindings instead of object properties.
</div>
<p>
  This live-binding rule, plus imports being <b>static</b> — resolved
  before any module code runs, always at the top level, never
  conditional — is exactly what lets a bundler safely
  <b>tree-shake</b>: it can see every import/export at compile time and
  delete anything nothing else actually uses, something CommonJS's
  fully dynamic <code>require()</code> can't guarantee.

</p>

<h3>CommonJS vs ESM</h3>
<table>
  <tr>
    <th></th>
    <th>CommonJS (Node's original)</th>
    <th>ESM</th>
  </tr>
  <tr><td>Syntax</td><td><code>require()</code> / <code>module.exports</code></td><td><code>import</code> / <code>export</code></td></tr>
  <tr><td>Loading</td><td>synchronous</td><td>can be async (dynamic <code>import()</code>)</td></tr>
  <tr><td>Resolved</td><td>at runtime, can be conditional</td><td>statically, before execution</td></tr>
  <tr><td>Top-level <code>this</code></td><td><code>module.exports</code></td><td><code>undefined</code></td></tr>
  <tr><td>File markers</td><td><code>.cjs</code>, or default in a plain <code>package.json</code></td><td><code>.mjs</code>, or <code>"type": "module"</code> in <code>package.json</code></td></tr>
</table>
<p class="sub">
  Node runs both today; browsers only ever understood ESM
  (<code>&lt;script type="module"&gt;</code>). ESM is the forward
  direction — new libraries default to it, and most tooling exists
  partly to smooth over the gap for code still shipping CommonJS.
</p>

<h3>Dynamic import()</h3>
<pre><code>button.addEventListener("click", async () =&gt; {
  const { openModal } = await import("./modal.js");   <span class="c">// only fetched when actually needed</span>
  openModal();
});</code></pre>
<p class="sub">
  Unlike a static <code>import</code>, this one is a real function call
  — it can go inside an <code>if</code>, a click handler, anywhere —
  and it returns a promise. This is the mechanism behind
  <b>code splitting</b>: a bundler sees a dynamic <code>import()</code>
  and automatically cuts that module (and everything only it needs)
  into its own separate file, downloaded only when that line actually
  runs, instead of bloating the very first page load with code most
  visitors may never trigger.
</p>

<h3>npm, package.json, semver</h3>
<pre><code>{
  "name": "my-app",
  "version": "1.4.2",
  "dependencies": { "react": "^18.2.0" },
  "devDependencies": { "vitest": "^4.1.10" }
}</code></pre>
<p>
  A version is <code>MAJOR.MINOR.PATCH</code> — <b>major</b> for
  breaking changes, <b>minor</b> for new, backward-compatible features,
  <b>patch</b> for backward-compatible fixes. The prefix in front of a
  dependency's version controls how far an install is allowed to drift:
</p>
<table>
  <tr>
    <th>Range</th>
    <th>Allows</th>
  </tr>
  <tr><td><code>^18.2.0</code></td><td>anything up to, not including, <code>19.0.0</code> — new minors and patches, never a new major</td></tr>
  <tr><td><code>~18.2.0</code></td><td>anything up to, not including, <code>18.3.0</code> — patches only</td></tr>
  <tr><td><code>18.2.0</code></td><td>that exact version, nothing else</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ package.json alone isn't reproducible</span>
  <code>^18.2.0</code> is a range, not one specific version — two
  installs weeks apart can legitimately resolve to different actual
  versions. <code>package-lock.json</code> (or <code>yarn.lock</code>,
  <code>pnpm-lock.yaml</code>) pins the <em>exact</em> resolved tree,
  which is why it's committed to the repo and why "works on my
  machine" so often traces back to a missing or ignored lockfile.
</div>

<h3>A bundler, briefly</h3>
<p>
  A bundler (Vite, webpack, esbuild, Rollup) does three jobs at once:
  follows every <code>import</code> to build one dependency graph,
  <b>transpiles</b> newer syntax and JSX/TS down to something the
  target browsers understand, and packs the result into as few files
  as make sense (splitting where a dynamic <code>import()</code> says
  to). The <b>source map</b> it emits alongside the bundle is what lets
  a browser's DevTools show your original <code>Button.tsx</code> and
  its real line numbers in a stack trace, instead of line 1 of one
  giant minified file.
</p>

<h3>Linting and formatting</h3>
<p>
  Two different jobs, often confused because they're configured
  together. <b>ESLint</b> reads your code for actual
  <em>problems</em> — an unused variable, a missing dependency in a
  React hook, a variable that shadows an outer one by accident.
  <b>Prettier</b> doesn't look for problems at all — it just rewrites
  every file into one consistent style (quotes, spacing, line length),
  so a diff shows what actually changed instead of a formatting
  argument. Running both: Prettier decides how the code looks, ESLint
  decides whether the code is right.
</p>`,
    },
    {
      id: "regex-dates-apis",
      num: "I6",
      title: "Regex, dates & browser APIs",
      short: "Regex, dates & APIs",
      levels: ["intermediate"],
      practice: ["ex-extract-hashtags", "ex-query-param"],
      ready: true,
      subtitle: "Four unrelated toolboxes every real app ends up reaching for.",
      body: `<h3>Regex — the essentials</h3>
<pre><code>/abc/         <span class="c">// literal — matches "abc" exactly</span>
/abc/i        <span class="c">// flag: i = case-insensitive</span>
/abc/g        <span class="c">// flag: g = find ALL matches, not just the first</span>
/(\\w+)@(\\w+)/  <span class="c">// ( ) = a capturing group — grabbed separately from the full match</span></code></pre>
<div class="try">
  <pre><code>const text = "contact: ana@example.com today";
const match = text.match(/(\\w+)@(\\w+)\\.com/);
console.log(match[0]);   <span class="c">// the whole match — what happens?</span>
console.log(match[1]);   <span class="c">// group 1 — what happens?</span>
console.log(match[2]);   <span class="c">// group 2 — what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"ana@example.com"</code>, then <code>"ana"</code>, then
  <code>"example"</code> — the full match is always index 0, and every
  parenthesized group after it fills in one more slot, in order.
</p>
<pre><code><span class="c">// Named groups — same idea, readable by name instead of position</span>
const parsed = "2024-01".match(/(?&lt;year&gt;\\d{4})-(?&lt;month&gt;\\d{2})/);
parsed.groups.year;    <span class="c">// "2024"</span>
parsed.groups.month;   <span class="c">// "01"</span>

"2024-01-15".replace(/(\\d+)-(\\d+)-(\\d+)/, "$3/$2/$1");   <span class="c">// "15/01/2024" — $1/$2/$3 refer back to the groups</span>

[..."a1 b22 c333".matchAll(/[a-z](\\d+)/g)].map((m) =&gt; m[1]);  <span class="c">// ["1", "22", "333"] — every match, not just the first</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ A /g regex remembers where it left off</span>
  <code>.test()</code> and <code>.exec()</code> on a regex literal
  with the <code>g</code> flag mutate the regex object's own
  <code>lastIndex</code> — the next call resumes searching from there,
  not from the start of the string.
</div>
<div class="try">
  <pre><code>const stateful = /\\d/g;
console.log(stateful.test("a1"));   <span class="c">// what happens?</span>
console.log(stateful.test("a1"));   <span class="c">// SAME regex, same string — what happens?</span>
console.log(stateful.test("a1"));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>true</code>, <code>false</code>, <code>true</code> — alternating,
  on the exact same input. First call finds the digit and leaves
  <code>lastIndex</code> at <code>2</code>; second call starts
  searching from index <code>2</code> in a 2-character string, finds
  nothing, and resets <code>lastIndex</code> back to <code>0</code>;
  third call starts over and finds it again. Reusing one global-flagged
  regex object across unrelated calls is exactly how this bites — a
  fresh <code>/\\d/g</code> literal each time, or dropping the
  <code>g</code> flag for a one-shot <code>.test()</code>, avoids it.
</p>

<h3>Dates</h3>
<div class="try">
  <pre><code>const d = new Date(2024, 0, 15);   <span class="c">// year, MONTH (0-indexed!), day</span>
console.log(d.getMonth());   <span class="c">// what happens?</span>
console.log(d.getDate());    <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>0</code>, then <code>15</code> — <code>getMonth()</code> is
  January-is-<code>0</code>, a decision baked into
  <code>Date</code> since the original Java date API it was modeled on
  in 1995, and never fixed since without breaking every existing
  script.
</p>
<pre><code>const start = new Date("2024-01-15");
const end = new Date("2024-02-15");
(end - start) / 86_400_000;   <span class="c">// 31 — subtracting Dates gives milliseconds; divide to get days</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Why almost nobody hand-rolls date math</span>
  Time zones, daylight saving transitions, leap years, and leap
  seconds all make "add one day" genuinely harder than
  <code>+ 86400000</code> — a DST boundary can make that arithmetic
  land on the wrong calendar day entirely. This is the real reason
  libraries like <code>date-fns</code>/<code>Temporal</code> (the
  successor API, still stabilizing) exist: not laziness, a
  correctness problem that's easy to get subtly wrong by hand.
</div>
<pre><code>new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(d);
<span class="c">// "15 January 2024" — locale-correct formatting, no manual string building</span>

new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(150000);
<span class="c">// "₹1,50,000.00" — Indian digit grouping, handled for you</span></code></pre>

<h3>Browser storage</h3>
<table>
  <tr>
    <th></th>
    <th><code>localStorage</code></th>
    <th><code>sessionStorage</code></th>
  </tr>
  <tr><td>Survives</td><td>closing the tab, the browser, the computer restarting</td><td>only this tab; gone when it closes</td></tr>
  <tr><td>Shared across tabs?</td><td>yes, same origin</td><td>no — each tab gets its own</td></tr>
  <tr><td>Capacity</td><td>~5-10MB, string values only</td><td>same</td></tr>
</table>
<pre><code>localStorage.setItem("theme", "dark");
localStorage.getItem("theme");     <span class="c">// "dark" — always a string</span>
localStorage.setItem("user", JSON.stringify({ name: "Ana" }));
JSON.parse(localStorage.getItem("user"));   <span class="c">// objects need to round-trip through JSON yourself</span>
localStorage.removeItem("theme");</code></pre>

<h3>URL and URLSearchParams</h3>
<div class="try">
  <pre><code>const url = new URL("https://shop.example.com/search?q=js&amp;page=2");
console.log(url.pathname);              <span class="c">// what happens?</span>
console.log(url.searchParams.get("q")); <span class="c">// what happens?</span>

url.searchParams.set("page", "3");
console.log(url.toString());   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  A parsed <code>URL</code> gives every piece
  (<code>pathname</code>, <code>hostname</code>, <code>protocol</code>)
  as its own property, and <code>searchParams</code> is a live,
  mutable view — editing it and reading <code>url.toString()</code>
  again reflects the change immediately, no manual query-string
  concatenation required.
</p>

<h3>History and IntersectionObserver, briefly</h3>
<pre><code>history.pushState({ page: 2 }, "", "/products?page=2");  <span class="c">// changes the URL bar, no page reload</span>
window.addEventListener("popstate", (e) =&gt; {
  console.log("back/forward pressed, state:", e.state);   <span class="c">// fires on browser back/forward, not on pushState itself</span>
});</code></pre>
<p class="sub">
  This is the mechanism every client-side router (React Router,
  Next.js's own routing) is built on — a URL that changes without a
  real navigation, plus a way to hear when the user manually goes
  back or forward.
</p>
<pre><code>const observer = new IntersectionObserver((entries) =&gt; {
  entries.forEach((entry) =&gt; {
    if (entry.isIntersecting) console.log(entry.target, "scrolled into view");
  });
});
document.querySelectorAll(".lazy-image").forEach((img) =&gt; observer.observe(img));</code></pre>
<p class="sub">
  The standard, efficient way to know when an element enters or leaves
  the viewport — infinite scroll, lazy-loaded images, and "animate in
  on scroll" effects all run on this instead of a
  <code>scroll</code> listener doing math on every single pixel of
  scrolling.
</p>

<h3>Events, in depth — live</h3>
<p>
  Click the innermost box below and watch the log. Every listener here
  is a real <code>addEventListener</code> call against the actual
  nested boxes on this page.
</p>
<div class="demo">
  <div class="demo__bar">Bubbling, capturing, and stopPropagation</div>
  <div class="demo__body">
    <div class="dom-sandbox" id="ev-sandbox">
      <div class="ev-box ev-box--outer" id="ev-outer">
        outer
        <div class="ev-box ev-box--middle" id="ev-middle">
          middle
          <div class="ev-box ev-box--inner" id="ev-inner">inner — click me</div>
        </div>
      </div>
    </div>
    <div class="demo__ctl">
      <label class="ev-check"><input type="checkbox" id="ev-capture" /> listen during the capture phase</label>
      <label class="ev-check"><input type="checkbox" id="ev-stop" /> inner listener calls stopPropagation()</label>
      <button class="btn btn--ghost" id="ev-clear" type="button">Clear log</button>
    </div>
    <div class="demo__term" id="ev-log"></div>
  </div>
</div>
<script>
(function () {
  var sandbox = document.getElementById("ev-sandbox");
  if (!sandbox) return;
  if (sandbox.dataset.demoInit) return;
  sandbox.dataset.demoInit = "1";

  var outer = document.getElementById("ev-outer");
  var middle = document.getElementById("ev-middle");
  var inner = document.getElementById("ev-inner");
  var captureBox = document.getElementById("ev-capture");
  var stopBox = document.getElementById("ev-stop");
  var logEl = document.getElementById("ev-log");

  function log(msg, cls) {
    var line = document.createElement("div");
    line.className = cls || "ok";
    line.textContent = msg;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function makeHandler(name) {
    return function (e) {
      var phase = e.eventPhase === 1 ? "capture" : e.eventPhase === 3 ? "bubble" : "target";
      log(name + " listener fired (" + phase + " phase)");
      if (name === "inner" && stopBox.checked) {
        e.stopPropagation();
        log("inner called stopPropagation() — nothing above hears this click", "dim");
      }
    };
  }

  var outerHandler = makeHandler("outer");
  var middleHandler = makeHandler("middle");
  var innerHandler = makeHandler("inner");

  function attach() {
    var useCapture = captureBox.checked;
    outer.removeEventListener("click", outerHandler, true);
    outer.removeEventListener("click", outerHandler, false);
    middle.removeEventListener("click", middleHandler, true);
    middle.removeEventListener("click", middleHandler, false);
    inner.removeEventListener("click", innerHandler, true);
    inner.removeEventListener("click", innerHandler, false);
    outer.addEventListener("click", outerHandler, useCapture);
    middle.addEventListener("click", middleHandler, useCapture);
    inner.addEventListener("click", innerHandler, useCapture);
  }

  attach();
  captureBox.addEventListener("change", attach);

  document.getElementById("ev-clear").addEventListener("click", function () {
    logEl.innerHTML = "";
  });
})();
</script>
<p class="sub">
  With the capture checkbox off (the default), clicking "inner" logs
  <code>inner → middle → outer</code> — the event starts at the exact
  element clicked and <b>bubbles</b> upward through every ancestor
  listening for it. Check the capture box and it reverses to
  <code>outer → middle → inner</code> — capture-phase listeners run on
  the way <em>down</em>, before the event even reaches its target.
  Check "stopPropagation" and only the inner listener fires at all —
  the click never continues past it in either direction.
</p>

<h3>Delegation and custom events</h3>
<p>
  Bubbling is what makes <b>event delegation</b> work: one listener on
  a parent container, instead of one per child, checking
  <code>event.target</code> to see which child was actually clicked.
</p>
<pre><code>list.addEventListener("click", (e) =&gt; {
  const item = e.target.closest("li");    <span class="c">// works even if the click landed on a span INSIDE the li</span>
  if (!item) return;
  console.log("clicked:", item.dataset.id);
});
<span class="c">// one listener handles every current AND future &lt;li&gt; — no re-binding when items are added later</span></code></pre>
<pre><code>const updated = new CustomEvent("cart:updated", { detail: { count: 3 } });
cartElement.dispatchEvent(updated);

cartElement.addEventListener("cart:updated", (e) =&gt; {
  console.log("new count:", e.detail.count);
});</code></pre>
<p class="sub">
  A custom event bubbles and can be listened for exactly like a real
  browser event — the standard way for one part of a page to announce
  something happened without being directly wired to whoever might
  care.
</p>`,
    },
    {
      id: "error-handling-debugging",
      num: "I7",
      title: "Error handling & debugging",
      short: "Error handling",
      levels: ["intermediate"],
      practice: ["ex-error-chain", "ex-immutable-update"],
      ready: true,
      subtitle: "The Intermediate track's close-out — past what B8 already covered.",
      body: `<p>
  <a href="/notes/errors-tools">The first pass at errors</a> covered
  <code>try/catch/finally</code>, custom <code>Error</code> subclasses,
  and reading a stack trace. This is what's past that: chaining errors
  together, what happens to a rejection nobody catches, why
  immutability keeps coming up in framework code, and debugging tools
  past <code>console.log</code>.
</p>

<h3>Error chaining with cause</h3>
<p>
  Catching a low-level error and throwing a more meaningful one is
  normal — but doing that used to destroy the original error entirely.
  The <code>cause</code> option keeps it attached.
</p>
<div class="try">
  <pre><code>function loadUser() {
  try {
    JSON.parse("not valid json");
  } catch (dbError) {
    throw new Error("failed to load user", { cause: dbError });
  }
}

try {
  loadUser();
} catch (e) {
  console.log(e.message);
  console.log(e.cause.message);   <span class="c">// what happens?</span>
}</code></pre>
</div>
<p class="sub">
  <code>"failed to load user"</code>, then the original
  <code>SyntaxError</code>'s message. Without <code>cause</code>, that
  original error is just gone — whoever's debugging this in production
  sees "failed to load user" and has to guess why. With it,
  <code>e.cause</code> carries the full original error (and its own
  stack trace) all the way up, however many layers re-throw in between.
</p>

<h3>Unhandled promise rejections</h3>
<p>
  A rejected promise with no <code>.catch()</code> anywhere in its
  chain doesn't fail silently — it surfaces as a top-level
  <code>unhandledrejection</code> event (the same mechanism
  <a href="/notes/basic-async">this site's own code runner</a> listens
  to, to show you an error even from code with no explicit
  <code>catch</code> at all).
</p>
<pre><code>window.addEventListener("unhandledrejection", (event) =&gt; {
  console.error("Unhandled:", event.reason);
  event.preventDefault();   <span class="c">// stops it from also logging as a browser console error</span>
});</code></pre>
<div class="warn">
  <span class="ttl">⚠ Forgetting to return inside a .then breaks the chain's error handling</span>
  <code>promise.then(() =&gt; { anotherAsyncCall(); })</code> — without a
  <code>return</code> — lets <code>anotherAsyncCall()</code>'s promise
  run <b>completely detached</b> from the outer chain. If it rejects,
  no <code>.catch()</code> further down that outer chain will ever see
  it; it becomes its own separate unhandled rejection.
</div>

<h3>Immutability — why frameworks care so much</h3>
<p>
  React, Redux, and similar tools decide "did this change?" with a
  single <code>===</code> check, not a deep comparison — because a
  deep comparison of a large tree, on every single render, is far too
  slow to do constantly.
</p>
<div class="try">
  <pre><code>const state1 = { count: 0 };

function mutateInPlace(state) {
  state.count++;
  return state;
}
function updateImmutably(state) {
  return { ...state, count: state.count + 1 };
}

const afterMutate = mutateInPlace(state1);
console.log(state1 === afterMutate);   <span class="c">// what happens?</span>

const state2 = { count: 0 };
const afterUpdate = updateImmutably(state2);
console.log(state2 === afterUpdate);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>true</code>, then <code>false</code>. Mutating in place changes
  the <em>same object</em> — a <code>===</code> check comparing the old
  reference to the new one sees no difference at all and a framework
  built on that check will skip re-rendering, even though the data
  genuinely changed. Building a fresh object every update
  guarantees a new reference exactly when something actually changed —
  which is the entire reason "don't mutate state directly" is a rule in
  React, not just a style preference.
</p>
<pre><code>const frozen = Object.freeze({ a: 1 });
frozen.a = 2;             <span class="c">// non-strict script: fails silently, "a" stays 1</span>
                            <span class="c">// strict mode / modules (the normal case today): throws a TypeError</span>
console.log(frozen.a);    <span class="c">// 1 either way — the object never actually changed</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> <code>Object.freeze</code> is shallow —
  it locks the object's own top-level properties, but a nested object
  inside a frozen one is still fully mutable. It's a debugging aid for
  catching accidental top-level mutation, not a deep-immutability
  guarantee.
</div>

<h3>Debugging, past console.log</h3>
<table>
  <tr>
    <th>Tool</th>
    <th>For</th>
  </tr>
  <tr><td>A line-number breakpoint (Sources panel)</td><td>pause every time execution reaches that exact line</td></tr>
  <tr><td>A conditional breakpoint</td><td>right-click the line number — pause only when an expression you type is true, e.g. <code>user.id === 42</code>. Essential once a bug only shows up for one specific input out of thousands.</td></tr>
  <tr><td>A watch expression</td><td>pin any expression to re-evaluate and display at every pause, without retyping it in the console each time</td></tr>
  <tr><td><code>debugger;</code></td><td>a breakpoint written directly in the source — pauses there whenever DevTools is open, no manual click needed</td></tr>
  <tr><td>The Network tab</td><td>every request's status, timing, headers, and actual response body — the first stop when data "never showed up"</td></tr>
</table>
<p class="sub">
  Once paused at any breakpoint, the call stack panel shows the exact
  chain of calls that got you there — the same information a
  <code>.stack</code> string gives you after the fact, except you can
  now inspect every live variable at every level of it, not just read a
  frozen snapshot of what the values were.
</p>`,
    },

    {
      id: "engine-memory",
      num: "A1",
      title: "Engine & memory",
      short: "Engine & memory",
      levels: ["advanced"],
      practice: ["ex-weakmap-cache"],
      ready: true,
      subtitle: "What V8 is actually doing while your code just runs.",
      body: `<p>
  Everything so far has been the language as you write it. This
  chapter is what the engine does with it — and it's the layer most
  senior-level interviews actually probe, because it's the layer where
  "it works" and "it works <em>well</em>" stop being the same question.
</p>

<h3>Stack vs heap</h3>
<div class="boxes">
  <div class="bx is-prim">
    <div class="bx__cap">call stack — fixed-size frames, LIFO</div>
    <div class="bx__slot"><b>main()</b><span>x = 5</span></div>
    <div class="bx__slot"><b>makePoint()</b><span>x = 1, y = 2</span></div>
    <div class="bx__arrow">a frame's local primitives live right here</div>
  </div>
  <div class="bx is-ref">
    <div class="bx__cap">heap — dynamic, garbage-collected</div>
    <div class="bx__slot"><b>Point { x: 1, y: 2 }</b><span>0x7a2f…</span></div>
    <div class="bx__arrow">the stack only ever holds a REFERENCE to this</div>
  </div>
</div>
<p>
  This is <a href="/notes/types-values">the exact primitive-vs-reference
  split from the types chapter</a>, one level lower: a primitive that
  never leaves its function lives directly in that function's stack
  frame — cheap to allocate, cheap to reclaim, gone the instant the
  frame pops. An object always lives on the heap, and the stack only
  ever holds a pointer to it — which is the entire mechanical reason
  copying a variable copies the reference and not the data.
</p>
<div class="warn">
  <span class="ttl">⚠ The real engine is smarter than this diagram</span>
  V8 actually runs <b>escape analysis</b> — if it can prove an object
  never leaves the function that creates it, it may stack-allocate that
  object anyway, and a captured primitive can get promoted onto the
  heap as part of a closure's context. The stack/heap split above is
  the correct mental model for reasoning about your code; the engine's
  actual placement decisions are an optimization detail on top of it,
  not a contradiction of it.
</div>
<p>
  Each function call gets its own <b>execution context</b> — the
  formal name for what's been informally called a "scope" in every
  chapter so far. It bundles an <b>environment record</b> (the actual
  variable bindings) with a reference to the outer context, and that
  chain of outer references <em>is</em>
  <a href="/notes/scope-functions">the scope chain</a> from two
  chapters back. A closure, mechanically, is just a function holding
  onto a reference to an execution context that would otherwise have
  been popped off the stack and discarded.
</p>

<h3>Garbage collection</h3>
<p>
  JS never frees memory by counting references down to zero the moment
  they drop — it periodically asks a different question:
  <b>reachability</b>. Starting from a set of <b>roots</b> (global
  variables, everything currently on the call stack), the collector
  walks every reference it can find. Anything it never reaches is
  garbage, full stop — <em>not</em> "has zero references," which
  matters the instant two objects reference only each other.
</p>
<div class="try">
  <pre><code>function makeCycle() {
  const a = {};
  const b = {};
  a.friend = b;
  b.friend = a;      <span class="c">// a and b reference EACH OTHER</span>
  return "created a cycle";
}
console.log(makeCycle());
<span class="c">// once makeCycle() returns, nothing on the stack points to a or b anymore —</span>
<span class="c">// they're unreachable from any root, cycle or not, and get collected</span></code></pre>
</div>
<p class="sub">
  A reference-counting collector (like older versions of Python) would
  actually leak this — <code>a</code> and <code>b</code> each hold one
  reference to the other, so neither ever hits zero on its own.
  Reachability-based collection sidesteps that entire class of bug for
  free: once <code>makeCycle</code> returns, nothing reachable from a
  root points at either object, cycle or not, so both are simply gone.
</p>
<p>
  V8 specifically runs a <b>generational</b> collector, built on one
  observation: most objects die young. New objects go into a small
  "young generation" that gets swept frequently and cheaply
  (<b>Scavenger</b>); anything that survives a few sweeps gets promoted
  to the "old generation," which is collected far less often, using a
  slower <b>mark-and-sweep</b> (mark everything reachable, then sweep
  away everything that wasn't marked) with an occasional
  <b>mark-compact</b> pass to defragment. Optimizing for the common
  case — short-lived objects — instead of treating every object
  identically is most of where the speed comes from.
</p>

<h3>Memory leaks — JS still has them</h3>
<p>
  "Garbage collected" means unreachable memory gets freed
  automatically. It does <em>not</em> mean memory can't leak — it means
  every JS leak is really the same root cause: something is <b>still
  reachable</b> that the program no longer actually needs.
</p>
<table>
  <tr>
    <th>Pattern</th>
    <th>What keeps it reachable</th>
  </tr>
  <tr><td>A forgotten <code>setInterval</code></td><td>the timer itself holds a live reference to its callback and everything that callback closes over, forever, until <code>clearInterval</code></td></tr>
  <tr><td>A detached DOM node</td><td>removed from the page, but still referenced by a JS variable or an event listener you forgot to remove — the node itself, and everything it references, stays alive</td></tr>
  <tr><td>An unbounded cache</td><td>a plain <code>Map</code> used as a cache that only ever grows — every entry is reachable through it forever, since nothing ever calls <code>.delete()</code></td></tr>
  <tr><td>A closure over something huge</td><td>a small, long-lived closure that happens to reference one variable from a scope containing something large — the ENTIRE execution context stays alive to keep that one binding around</td></tr>
</table>
<pre><code><span class="c">// The fix for the cache row above — cap it, or use a WeakMap when the</span>
<span class="c">// key's natural lifetime should decide the entry's lifetime (I2 covered this)</span>
const cache = new Map();
function memoizedButBounded(key, compute) {
  if (cache.has(key)) return cache.get(key);
  if (cache.size &gt;= 500) cache.delete(cache.keys().next().value);   <span class="c">// evict oldest</span>
  const value = compute();
  cache.set(key, value);
  return value;
}</code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> Every leak is a lifetime mismatch: some
  reference is living longer than the data it points to should. Fixing
  a leak is almost always "stop something from holding a reference it
  no longer needs" — clear the interval, remove the listener, cap the
  cache, null out the field — never a special "free this memory" call,
  because JS has no such call.
</div>

<h3>Heap snapshots and allocation timelines</h3>
<p>
  DevTools' Memory panel is how a suspected leak actually gets
  confirmed rather than guessed at: take a heap snapshot, perform the
  suspect action several times (open and close a modal, navigate back
  and forth), take another snapshot, and compare. An object count that
  keeps climbing across that comparison — for a thing you'd expect to
  be fully cleaned up — is the leak, and the snapshot's retainer tree
  shows <em>exactly</em> what's still holding a reference to it. The
  allocation timeline view is the same idea over time instead of two
  fixed points — useful for catching steady growth during normal use
  rather than one specific suspected action.
</p>

<h3>Hidden classes and inline caches</h3>
<p>
  V8 doesn't store objects as generic key/value hash maps the way this
  sentence probably makes you picture — it dynamically builds a
  <b>hidden class</b> (an internal, fixed layout) for every distinct
  shape of object it sees, and every object with that same shape shares
  the same hidden class.
</p>
<pre><code>function Point(x, y) { this.x = x; this.y = y; }

const a = new Point(1, 2);   <span class="c">// x then y — hidden class C0</span>
const b = new Point(3, 4);   <span class="c">// x then y — SAME hidden class C0, shares it with a</span>

const c = new Point(5, 6);
c.z = 7;                      <span class="c">// now c has a DIFFERENT shape — its own hidden class C1</span></code></pre>
<p>
  A property access like <code>point.x</code> compiled at a specific
  call site gets an <b>inline cache</b>: after the first call, V8
  remembers "the object at this call site had hidden class C0, and its
  <code>x</code> was at this exact offset" — so the next call with the
  same hidden class skips property lookup entirely and reads straight
  from that offset.
</p>
<table>
  <tr>
    <th>Term</th>
    <th>Means</th>
    <th>Speed</th>
  </tr>
  <tr><td><b>Monomorphic</b></td><td>a call site has only ever seen one hidden class</td><td class="tone-yes">fastest — the inline cache is a direct hit every time</td></tr>
  <tr><td><b>Polymorphic</b></td><td>a call site has seen a handful (2-4) of different hidden classes</td><td class="tone-warn">still fast — checks a short list</td></tr>
  <tr><td><b>Megamorphic</b></td><td>a call site has seen too many shapes to track</td><td class="tone-bad">slow — V8 gives up on the inline cache and falls back to a generic lookup</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ This is genuinely hard to see with a stopwatch</span>
  It's tempting to prove this with <code>performance.now()</code>
  around a quick loop — in practice, allocation cost, garbage
  collection pauses, and JIT warm-up noise routinely swamp the actual
  effect at small scale, and a rushed 3-line "benchmark" is exactly how
  people ship confidently wrong performance conclusions. The takeaway
  isn't "go measure this" — it's the practical rule below, which holds
  regardless of what any one quick timing run happens to show.
</div>
<div class="sticky mint">
  <span class="ttl">Rule</span> Build objects of the same "kind" with
  their properties assigned in the <b>same order, every time</b> —
  ideally all in the constructor, none bolted on conditionally
  afterward. Shape consistency is what keeps a hot call site
  monomorphic; it's a real, well-documented V8 optimization concern,
  not premature optimization folklore.
</div>

<h3>JIT and deoptimization</h3>
<p>
  V8 starts running everything through <b>Ignition</b>, a fast-starting
  interpreter — there's no compile pause before your code runs at all.
  A function called enough times gets handed to <b>TurboFan</b>, the
  optimizing compiler, which compiles it down to fast machine code
  <em>under the assumptions it's observed so far</em> — including the
  hidden classes and argument types it's seen at every call site inside
  it.
</p>
<p>
  Break one of those assumptions — a function optimized for numbers
  suddenly gets called with a string, a monomorphic call site starts
  seeing a new shape — and V8 <b>deoptimizes</b>: throws away the
  compiled machine code and drops back to the slower interpreter for
  that function, at least until it can safely re-optimize with the
  new reality accounted for. A function that gets optimized, called
  differently, deoptimized, called differently again, and
  re-optimized in a loop never settles into its fast path at all.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Predictable shapes and
  stable argument types aren't just a style preference — they're what
  let TurboFan's assumptions hold, which is what keeps a hot function
  compiled instead of bouncing back to the interpreter every time
  something unexpected shows up at one of its call sites."
</div>`,
    },
    {
      id: "advanced-async",
      num: "A2",
      title: "Advanced async",
      short: "Advanced async",
      levels: ["advanced"],
      practice: ["ex-take-n", "ex-concurrency-limit"],
      ready: true,
      subtitle: "Past promises: pausable functions, streams, and running real work concurrently.",
      body: `<h3>Microtask starvation</h3>
<p>
  <a href="/notes/async-properly">The microtask queue always drains
  completely</a> before the event loop touches a macrotask — which is
  usually the right behavior, until a microtask keeps scheduling
  <em>another</em> microtask. Nothing else — not a timer, not a render,
  not user input — ever gets a turn.
</p>
<pre><code>function loopForever() {
  queueMicrotask(loopForever);   <span class="c">// each run schedules the next one before yielding</span>
}
loopForever();
<span class="c">// the page is now permanently frozen — every macrotask queued after this</span>
<span class="c">// point (clicks, timers, even rendering) waits behind an infinite microtask queue</span></code></pre>
<p>
  <code>queueMicrotask(fn)</code> schedules <code>fn</code> directly on
  that same microtask queue a resolved promise's <code>.then()</code>
  uses — the explicit version of the implicit scheduling promises do.
  Node has an even higher-priority version,
  <code>process.nextTick(fn)</code>, which drains completely before
  <em>even the microtask queue</em> gets its turn — Node-only, and easy
  to sample yourself into starvation with the same recursive pattern
  above.
</p>

<h3>Node's event loop has phases; the browser's doesn't</h3>
<p>
  Browser-side, "macrotask" is one flat queue. Node's <code>libuv</code>
  event loop is a fixed cycle of named phases, each with its own queue,
  run in order every tick: <b>timers</b> (due
  <code>setTimeout</code>/<code>setInterval</code> callbacks) →
  <b>pending callbacks</b> → <b>poll</b> (I/O — the bulk of real work)
  → <b>check</b> (<code>setImmediate</code>) → <b>close callbacks</b>,
  then back to the top. <code>setImmediate</code> is Node's own
  addition — no equivalent in the browser at all — meaning "run after
  I/O this cycle, before the next timers phase," a more precise
  guarantee than <code>setTimeout(fn, 0)</code> gives you.
</p>

<h3>Generators — functions that pause</h3>
<p>
  A <code>function*</code> doesn't run to completion when called — it
  returns an iterator, and each <code>.next()</code> runs the body only
  until the next <code>yield</code>, then pauses with everything
  (local variables included) intact until <code>.next()</code> is
  called again.
</p>
<div class="try">
  <pre><code>function* range(start, end) {
  for (let i = start; i &lt; end; i++) yield i;
}
console.log([...range(1, 5)]);   <span class="c">// what happens?</span>

function* outer() {
  yield 1;
  yield* [2, 3];        <span class="c">// yield* delegates to another iterable, one value at a time</span>
  yield* innerGen();
}
function* innerGen() {
  yield 4;
  yield 5;
}
console.log([...outer()]);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>[1, 2, 3, 4]</code>, then <code>[1, 2, 3, 4, 5]</code>. Spread
  works on any generator because a generator's return value <em>is</em>
  an iterator (it implements <code>Symbol.iterator</code>, covered
  properly next chapter). <code>yield*</code> is what makes generators
  composable — one generator can hand off to another without unpacking
  it into an array first.
</p>
<p>
  The genuinely two-way part: <code>.next(value)</code> doesn't just
  resume the generator, it becomes the <em>result</em> of the
  <code>yield</code> expression that paused it.
</p>
<div class="try">
  <pre><code>function* runningTotal() {
  let total = 0;
  while (true) {
    const n = yield total;    <span class="c">// pauses here, returning "total" — resumes with whatever .next(n) sends</span>
    total += n;
  }
}
const calc = runningTotal();
console.log(calc.next().value);      <span class="c">// what happens? (no value to send yet — this call just starts it)</span>
console.log(calc.next(5).value);     <span class="c">// what happens?</span>
console.log(calc.next(10).value);    <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>0</code>, then <code>5</code>, then <code>15</code>. The first
  <code>.next()</code> has nothing to send <em>into</em> — there's no
  paused <code>yield</code> waiting for a value yet, it just runs the
  generator up to its first <code>yield total</code> and returns that
  <code>0</code>. Every call after that both resumes execution
  <em>and</em> delivers a value into the paused expression — genuine
  two-way communication, not just "give me the next thing."
</p>

<h3>Async generators and for await...of</h3>
<pre><code>async function* pageThrough(url) {
  let next = url;
  while (next) {
    const page = await fetch(next).then((r) =&gt; r.json());
    yield page.items;
    next = page.nextUrl;
  }
}

for await (const items of pageThrough("/api/items")) {
  render(items);   <span class="c">// runs once per page, as each one arrives — never holds every page in memory at once</span>
}</code></pre>
<p class="sub">
  <code>async function*</code> combines both ideas at once — every
  <code>.next()</code> now returns a <em>promise</em> of the next
  value, so the consumer can <code>await</code> each item as it's
  produced instead of needing everything ready up front.
  <code>for await...of</code> is the loop built to consume exactly
  that: pause for each value's promise, unwrap it, run the body,
  repeat.
</p>

<h3>Streams and backpressure</h3>
<pre><code>const response = await fetch("/api/large-file");
const reader = response.body.getReader();   <span class="c">// a ReadableStream, read chunk by chunk</span>

while (true) {
  const { done, value } = await reader.read();   <span class="c">// value is one chunk (a Uint8Array), not the whole file</span>
  if (done) break;
  processChunk(value);
}</code></pre>
<p>
  The point of a stream is never holding the whole thing in memory —
  a multi-gigabyte download processed chunk by chunk costs roughly one
  chunk's worth of memory, not the whole file's. <b>Backpressure</b> is
  what keeps a fast producer from burying a slow consumer in memory:
  a well-built stream only pulls the next chunk once the consumer
  signals it's ready for one, rather than the producer blasting data in
  as fast as it can regardless of whether anything downstream can keep
  up.
</p>

<h3>Web Workers, SharedArrayBuffer, Atomics</h3>
<p>
  A regular Worker (like the one this very playground runs your code
  in, so a hung loop can't freeze the tab) communicates with the main
  thread by <b>copying</b> messages via <code>postMessage</code> — even
  a huge object gets serialized, sent, and rebuilt on the other side.
  <code>SharedArrayBuffer</code> is the exception: actual shared memory
  both threads can read and write directly, no copying.
</p>
<div class="warn">
  <span class="ttl">⚠ Shared memory needs its own locking</span>
  Two threads writing the same <code>SharedArrayBuffer</code> at once
  is a real, classic race condition — JS's usual single-threaded
  "nothing interrupts mid-statement" guarantee doesn't cover memory two
  separate threads can both touch simultaneously.
  <code>Atomics.wait</code>/<code>Atomics.notify</code> /
  <code>Atomics.add</code> exist specifically to coordinate that
  safely, the same job a mutex does in a traditionally threaded
  language. This is genuinely rare in day-to-day app code — mostly
  reserved for CPU-heavy work like audio/video processing or a WASM
  module that needs real shared-memory parallelism.
</div>

<h3>Concurrency control — running a lot of things, but not all at once</h3>
<p>
  <a href="/notes/async-properly">Promise.all</a> runs everything at
  once. Sometimes that's wrong — 500 requests fired simultaneously can
  overwhelm a server or hit a rate limit. A concurrency-limited queue
  runs a fixed number in flight, always starting the next one the
  moment a slot frees up.
</p>
<div class="try">
  <pre><code>function wait(ms, label) {
  return new Promise((resolve) =&gt; setTimeout(() =&gt; resolve(label), ms));
}

async function runWithLimit(tasks, limit) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index &lt; tasks.length) {
      const current = index++;
      results[current] = await tasks[current]();
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

const order = [];
const tasks = [1, 2, 3, 4, 5].map((n) =&gt; async () =&gt; {
  order.push("start " + n);
  await wait(10);
  order.push("end " + n);
  return n * 10;
});

const results = await runWithLimit(tasks, 2);
console.log("results:", results);
console.log("order:", order.join(", "));</code></pre>
</div>
<p class="sub">
  Watch the order: <code>start 1, start 2</code> — only two run
  immediately, the limit — then each <code>end</code> is immediately
  followed by the next <code>start</code>, never more than two "start"s
  without a matching "end" between them. That's the whole
  pattern: a fixed pool of <code>worker()</code> functions, all sharing
  one <code>index</code> counter, each one pulling the next task the
  moment it's free. This exact shape — sometimes called a
  <b>semaphore</b> when the limit is explicit — is what a real batch
  job (upload 500 files, 6 at a time) is built on.
</p>`,
    },
    {
      id: "metaprogramming",
      num: "A3",
      title: "Metaprogramming",
      short: "Metaprogramming",
      levels: ["advanced"],
      practice: ["ex-custom-iterable", "ex-positive-only-proxy"],
      ready: true,
      subtitle: "Code that changes how ordinary-looking code behaves.",
      body: `<h3>Symbol — a key that can never collide</h3>
<p>
  Every <code>Symbol()</code> call creates a value that's unique, even
  against another symbol created with the exact same description — it
  exists specifically to be usable as a property key that can never
  accidentally collide with a string key some other piece of code
  happens to also use.
</p>
<pre><code>const id = Symbol("id");
const obj = { name: "Ana", [id]: 42 };
Object.keys(obj);          <span class="c">// ["name"] — symbol keys are invisible to normal enumeration</span>
obj[Symbol("id")];         <span class="c">// undefined — a DIFFERENT symbol, even with the identical description</span>
obj[id];                    <span class="c">// 42 — only the exact same symbol reference works</span></code></pre>
<p>
  JS itself uses a handful of <b>well-known symbols</b> as hooks the
  engine calls automatically at specific moments — this is the actual
  mechanism behind several "special" behaviors from earlier chapters.
</p>
<table>
  <tr>
    <th>Symbol</th>
    <th>Called when</th>
  </tr>
  <tr><td><code>Symbol.iterator</code></td><td><code>for...of</code>, spread, or destructuring needs to walk the object's values</td></tr>
  <tr><td><code>Symbol.toPrimitive</code></td><td>the object is used where a primitive is needed — <code>+obj</code>, template interpolation, <code>obj + ""</code></td></tr>
  <tr><td><code>Symbol.hasInstance</code></td><td><code>instanceof</code> checks this object as the right-hand side</td></tr>
  <tr><td><code>Symbol.toStringTag</code></td><td><code>Object.prototype.toString.call(obj)</code> builds its <code>"[object X]"</code> label</td></tr>
</table>
<div class="try">
  <pre><code>class Money {
  constructor(amount) { this.amount = amount; }
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return this.amount;
    if (hint === "string") return "$" + this.amount.toFixed(2);
    return "Money(" + this.amount + ")";
  }
}
const price = new Money(9.5);
console.log(+price);        <span class="c">// "number" hint — what happens?</span>
console.log(\`\${price}\`);  <span class="c">// "string" hint — what happens?</span>
console.log(price + "");    <span class="c">// "default" hint — what happens?</span></code></pre>
</div>
<p class="sub">
  <code>9.5</code>, then <code>"$9.50"</code>, then
  <code>"Money(9.5)"</code> — the exact same object gives three
  different answers, because the engine tells
  <code>Symbol.toPrimitive</code> <em>which</em> conversion it's
  trying to do. This is the real mechanism behind why
  <code>+new Date()</code> gives a timestamp while
  <code>\`\${new Date()}\`</code> gives a readable string — same object,
  hint-aware conversion.
</p>

<h3>Iteration protocols, formally</h3>
<p>
  Two related but separate contracts. An object is <b>iterable</b> if
  it has a <code>[Symbol.iterator]()</code> method that returns an
  <b>iterator</b> — and an iterator is just any object with a
  <code>.next()</code> method that returns
  <code>{ value, done }</code>. That's the entire protocol
  <code>for...of</code>, spread, and destructuring are all built on —
  which is exactly why the custom <code>Range</code> class below works
  with every one of them for free, the moment it implements one method.
</p>
<div class="try">
  <pre><code>class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        return current &lt; end
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      },
    };
  }
}
console.log([...new Range(1, 5)]);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>[1, 2, 3, 4]</code> — spread never needed to know
  <code>Range</code> exists as a concept. It only ever asked "does this
  have <code>Symbol.iterator</code>?", called it, and kept calling
  <code>.next()</code> until <code>done</code> came back
  <code>true</code>. <a href="/notes/advanced-async">Generators</a> are
  just a shortcut for writing exactly this object without building it
  by hand — every generator already implements this protocol for you.
  Async iteration is the same shape with one difference:
  <code>[Symbol.asyncIterator]()</code> instead, and
  <code>.next()</code> returns a <em>promise</em> of
  <code>{ value, done }</code>, which is what <code>for await...of</code>
  knows how to unwrap.
</p>

<h3>Proxy and Reflect</h3>
<p>
  A <code>Proxy</code> wraps an object and lets you intercept the
  fundamental operations on it — <code>get</code>, <code>set</code>,
  <code>has</code>, <code>deleteProperty</code>, and more — with your
  own function, called a <b>trap</b>. <code>Reflect</code> is the
  companion: the same set of operations, exposed as plain functions,
  so a trap can perform the <em>real</em> default behavior after doing
  its own work, instead of re-implementing it by hand.
</p>
<div class="try">
  <pre><code>const target = { name: "Ana", age: 29 };
const logged = new Proxy(target, {
  get(obj, prop) {
    console.log("GET", String(prop));
    return Reflect.get(obj, prop);   <span class="c">// the real, normal read</span>
  },
  set(obj, prop, value) {
    console.log("SET", String(prop), "=", value);
    return Reflect.set(obj, prop, value);   <span class="c">// the real, normal write</span>
  },
});

logged.name;
logged.age = 30;</code></pre>
</div>
<p class="sub">
  Every single property access on <code>logged</code> — reads and
  writes both — is now observable, without <code>target</code> itself
  ever knowing it's being watched. This exact shape (intercept, log or
  validate, then delegate to <code>Reflect</code>) is the whole
  mechanism behind validation libraries, ORMs that track which fields
  changed, and framework reactivity.
</p>
<pre><code>function createValidated(schema) {
  return new Proxy({}, {
    set(obj, prop, value) {
      if (schema[prop] &amp;&amp; typeof value !== schema[prop]) {
        throw new TypeError(String(prop) + " must be a " + schema[prop]);
      }
      return Reflect.set(obj, prop, value);
    },
  });
}
const user = createValidated({ age: "number" });
user.age = "nope";   <span class="c">// throws immediately — invalid data can't even be assigned</span></code></pre>

<h3>Object.defineProperty vs Proxy — Vue 2 vs Vue 3</h3>
<p>
  Before <code>Proxy</code> existed everywhere, reactive frameworks
  used <code>Object.defineProperty</code> to turn each property into a
  getter/setter pair that could track reads and notify on writes — this
  was Vue 2's actual reactivity engine, property by property.
</p>
<table>
  <tr>
    <th></th>
    <th><code>Object.defineProperty</code> (Vue 2)</th>
    <th><code>Proxy</code> (Vue 3)</th>
  </tr>
  <tr><td>New properties added later</td><td class="tone-bad">invisible — never converted, needed a special <code>Vue.set()</code></td><td class="tone-yes">caught automatically — the trap fires for any key</td></tr>
  <tr><td>Arrays</td><td class="tone-bad">index writes and <code>length</code> changes needed special-cased method overrides</td><td class="tone-yes">just works — array mutation is property access too</td></tr>
  <tr><td>Setup cost</td><td>walks every property up front, recursively</td><td>wraps once — nested objects are wrapped lazily, on first access</td></tr>
</table>

<h3>Invariants Proxy has to respect</h3>
<p>
  A trap isn't a completely free rewrite of an object's behavior —
  a handful of invariants are enforced by the engine no matter what a
  trap tries to return, mostly around <code>Object.freeze</code>. A
  <code>get</code> trap on a frozen, non-configurable, non-writable
  property <b>must</b> return the real, actual value — returning
  anything else throws a <code>TypeError</code>. This exists so
  <code>Object.freeze</code>'s guarantee from
  <a href="/notes/error-handling-debugging">two chapters back</a> stays
  a real guarantee, not something a misbehaving Proxy trap could
  quietly undermine.
</p>

<h3>eval and new Function — and why almost never</h3>
<pre><code>eval("console.log(1 + 1)");           <span class="c">// runs in the CALLING scope — can read/write local variables</span>
new Function("a", "b", "return a + b");  <span class="c">// runs in GLOBAL scope only — can't see any local variable</span></code></pre>
<p>
  Both compile and run a string as code, and both come with the same
  three costs: the engine can't statically analyze code that doesn't
  exist yet at parse time, so it gets none of the optimization this
  whole chapter has been about; a strict Content-Security-Policy
  (covered next chapter) blocks them outright; and if that string ever
  contains anything derived from user input, it's arbitrary code
  execution, full stop — not a bug class, the actual worst case.
</p>
<div class="warn">
  <span class="ttl">⚠ This site's own code runner uses new Function</span>
  Every <code>.try</code> block on this page, and the whole practice
  playground, really does run your code through
  <code>new Function(...)</code> inside a Web Worker — that's not a
  contradiction of the warning above, it's the actual legitimate use
  case: a sandboxed worker with no DOM access, running code the reader
  explicitly chose to execute, not untrusted input silently reaching
  <code>eval</code> in a real production app.
</div>`,
    },
    {
      id: "types-data",
      num: "A4",
      title: "Types & data",
      short: "Types & data",
      levels: ["advanced"],
      practice: ["ex-bigint-factorial", "ex-proper-length"],
      ready: true,
      subtitle: "What happens once a number, a string, or a file gets big or exotic enough to need its own type.",
      body: `<h3>BigInt — exact integers, past 2^53</h3>
<p>
  Every regular JS number is a 64-bit float, which means integers stop
  being exactly representable past
  <code>Number.MAX_SAFE_INTEGER</code> — <code>2^53 - 1</code>.
  <code>BigInt</code> is a genuinely separate type for arbitrary-size
  integers with no such ceiling, spelled with a trailing <code>n</code>.
</p>
<div class="try">
  <pre><code>console.log(Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2);   <span class="c">// what happens?</span>
console.log(9007199254740991n + 1n === 9007199254740991n + 2n);              <span class="c">// same numbers, as BigInt — what happens?</span></code></pre>
</div>
<p class="sub">
  <code>true</code>, then <code>false</code>. Past the safe integer
  limit, regular numbers genuinely can't tell
  <code>MAX_SAFE_INTEGER + 1</code> and <code>+ 2</code> apart — both
  round to the same closest representable float. The <code>n</code>
  suffix versions stay exact, because <code>BigInt</code> isn't a
  float at all.
</p>
<div class="warn">
  <span class="ttl">⚠ BigInt and Number don't mix</span>
  <code>10n + 5</code> throws <code>TypeError: Cannot mix BigInt and
  other types</code> — there's no implicit conversion between them in
  either direction. Convert explicitly, one way or the other:
  <code>10n + BigInt(5)</code> or <code>Number(10n) + 5</code>.
</div>

<h3>ArrayBuffer, TypedArrays, DataView</h3>
<p>
  An <code>ArrayBuffer</code> is a fixed-length block of raw bytes —
  nothing more, no way to read or write it directly. A
  <b>TypedArray</b> (<code>Int32Array</code>, <code>Uint8Array</code>,
  etc.) is a typed <em>view</em> onto that same memory, interpreting
  its bytes as a specific numeric type. Multiple views can share one
  buffer at once, and writing through any of them changes the
  <em>same</em> underlying bytes every other view sees.
</p>
<div class="try">
  <pre><code>const buffer = new ArrayBuffer(4);       <span class="c">// 4 raw bytes</span>
const asInt32 = new Int32Array(buffer);  <span class="c">// one view: "these 4 bytes are one 32-bit int"</span>
asInt32[0] = 42;

const dv = new DataView(buffer);          <span class="c">// a second, more manual view of the SAME bytes</span>
console.log(dv.getInt32(0));              <span class="c">// what happens?</span>
console.log(dv.getInt32(0, true));        <span class="c">// second argument: littleEndian — what happens?</span></code></pre>
</div>
<p class="sub">
  <code>704643072</code>, then <code>42</code>. Not a bug — a genuine
  byte-order mismatch. TypedArrays use the platform's native byte
  order (little-endian on essentially every real device today).
  <code>DataView.getInt32</code> defaults to <b>big-endian</b> unless
  you explicitly pass <code>true</code> for its second argument. Same
  4 bytes, same buffer, two different interpretations of what order
  they represent a number in — exactly the kind of detail that matters
  the moment you're parsing a binary file format or a network protocol
  that specifies its own byte order.
</p>

<h3>Blob, File, FileReader</h3>
<pre><code>const blob = new Blob(["hello world"], { type: "text/plain" });
blob.size;    <span class="c">// 11 — bytes, not characters (matters once text isn't plain ASCII)</span>
blob.type;    <span class="c">// "text/plain"</span>

<span class="c">// A File (from an &lt;input type="file"&gt; or a drop event) is a Blob with a name and a modified date</span>
fileInput.addEventListener("change", (e) =&gt; {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () =&gt; console.log(reader.result);   <span class="c">// the fully-read contents</span>
  reader.readAsText(file);          <span class="c">// or readAsArrayBuffer, readAsDataURL</span>
});

<span class="c">// modern alternative — same result, promise-based, no event wiring</span>
const text = await file.text();
const bytes = await file.arrayBuffer();</code></pre>
<p class="sub">
  <code>FileReader</code> predates promises; a <code>File</code>
  object itself now has <code>.text()</code>/<code>.arrayBuffer()</code>
  methods that return promises directly — same underlying read, no
  callback wiring needed in new code.
</p>

<h3>Unicode — code points vs code units</h3>
<p>
  A JS string's <code>.length</code> counts <b>UTF-16 code units</b>,
  not visible characters. Most characters fit in one 16-bit unit; a
  large chunk of emoji and some rarer scripts need <b>two</b> units — a
  <b>surrogate pair</b> — and <code>.length</code> counts both of them
  as 2.
</p>
<div class="try">
  <pre><code>const emoji = "😀";
console.log(emoji.length);            <span class="c">// what happens?</span>
console.log([...emoji].length);       <span class="c">// spreading iterates by CODE POINT, not code unit — what happens?</span>
console.log(JSON.stringify(emoji[0])); <span class="c">// indexing still grabs one code UNIT — what happens?</span></code></pre>
</div>
<p class="sub">
  <code>2</code>, then <code>1</code>, then <code>"\\ud83d"</code> — half
  of a surrogate pair, not a valid character on its own.
  <code>emoji[0]</code> silently cuts an emoji in half; spreading a
  string (or <code>for...of</code>, or <code>Array.from</code>) walks
  it by actual code point and never splits one. Slicing a string by
  raw index — a search-result excerpt, a truncated preview — risks
  exactly this cut, and it's an easy one to never notice until a
  specific emoji or script breaks in production.
</p>
<pre><code>"café".normalize("NFC").length === "café".normalize("NFC").length;
<span class="c">// true — but two strings that VISUALLY look identical can be genuinely unequal:</span>
<span class="c">// "é" can be one single code point, OR "e" + a separate combining accent mark.</span>
<span class="c">// .normalize() converts both spellings to one canonical form before comparing.</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> Comparing user-typed text for equality
  without <code>.normalize()</code> first is a real, if rare, bug — two
  strings can render pixel-identical and still fail
  <code>===</code>, if one came from a source that encodes accents
  differently.
</div>

<h3>Intl — past basic formatting</h3>
<pre><code>["café", "cafe", "cafz"].sort(new Intl.Collator("en").compare);
<span class="c">// ["cafe", "café", "cafz"] — locale-aware ordering; a plain .sort() compares raw code</span>
<span class="c">// points instead, which gets accented characters and non-Latin scripts sorted wrong</span>

new Intl.RelativeTimeFormat("en").format(-1, "day");   <span class="c">// "1 day ago"</span>
new Intl.RelativeTimeFormat("en").format(3, "hour");   <span class="c">// "in 3 hours"</span></code></pre>
<p class="sub">
  All three <code>Intl</code> constructors from this and earlier
  chapters — <code>Collator</code>, <code>DateTimeFormat</code>,
  <code>NumberFormat</code>, and <code>RelativeTimeFormat</code> — take
  the same first argument, a locale string, and are the built-in answer
  to "format this correctly for the reader's language and region"
  without hand-writing rules that differ by country.
</p>`,
    },
    {
      id: "patterns-architecture",
      num: "A5",
      title: "Patterns & architecture",
      short: "Patterns & architecture",
      levels: ["advanced"],
      practice: ["ex-order-state-machine", "ex-compose-patterns"],
      ready: true,
      subtitle: "Shapes that show up again and again once code has to scale past one file.",
      body: `<h3>Functional programming basics</h3>
<p>
  A <b>pure</b> function's output depends only on its inputs, and it
  touches nothing outside itself — no network call, no mutating an
  argument, no reading a global. The upside isn't philosophical: a pure
  function is trivially testable (call it, check the return value, no
  setup), safely memoizable
  (<a href="/notes/scope-functions">already covered</a>), and safe to
  run in any order or in parallel, since it can't step on anything
  else's state.
</p>
<pre><code><span class="c">// impure — depends on and mutates something outside itself</span>
let discount = 0.1;
function applyDiscount(price) { return price - price * discount; }

<span class="c">// pure — same inputs, same output, forever, no matter what else is happening</span>
function applyDiscountPure(price, rate) { return price - price * rate; }</code></pre>
<p>
  <b>Immutability</b> — building new values instead of changing
  existing ones — is what keeps a codebase full of pure functions
  actually pure; it's the same idea
  <a href="/notes/error-handling-debugging">already covered</a> for why
  React checks <code>===</code> instead of deep-comparing.
</p>
<p>
  A <b>transducer</b> is a composable transformation that's independent
  of the collection it eventually runs against — instead of
  <code>arr.map(f).filter(p)</code> building one throwaway intermediate
  array between the two steps, a transducer combines <code>map</code>
  and <code>filter</code> into a <em>single</em> combined step function,
  run once per element, zero intermediate arrays:
</p>
<div class="try">
  <pre><code>const mapping = (fn) =&gt; (reducer) =&gt; (acc, val) =&gt; reducer(acc, fn(val));
const filtering = (pred) =&gt; (reducer) =&gt; (acc, val) =&gt; (pred(val) ? reducer(acc, val) : acc);
const compose = (...fns) =&gt; fns.reduce((f, g) =&gt; (...args) =&gt; f(g(...args)));

const push = (acc, val) =&gt; (acc.push(val), acc);
const transform = compose(mapping((x) =&gt; x * 2), filtering((x) =&gt; x &gt; 5));

console.log([1, 2, 3, 4, 5].reduce(transform(push), []));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>[6, 8, 10]</code> — every element is doubled, then kept only if
  the doubled value clears 5, all inside <em>one</em>
  <code>reduce</code> pass with no intermediate array built between the
  two steps. This is a genuinely deep rabbit hole (it's the core idea
  behind libraries like <code>transducers-js</code>) — the takeaway at
  this level is what problem it solves: composing transformations
  without paying for an intermediate array at every step.
</p>

<h3>Design patterns, in JS terms</h3>
<table>
  <tr>
    <th>Pattern</th>
    <th>Shape</th>
    <th>Already seen it</th>
  </tr>
  <tr><td><b>Module</b></td><td>a closure exposing a small public surface, hiding the rest</td><td><a href="/notes/scope-functions">closures chapter</a>, use #2</td></tr>
  <tr><td><b>Observer / Pub-Sub</b></td><td>subscribers register a callback; a publisher calls every one when something happens</td><td><code>addEventListener</code> IS this pattern, built into the platform</td></tr>
  <tr><td><b>Strategy</b></td><td>swap the algorithm at runtime by passing a different function/object with the same interface</td><td>the comparator argument to <code>.sort()</code></td></tr>
  <tr><td><b>Factory</b></td><td>a function that builds and returns objects, hiding the construction details</td><td><code>document.createElement</code></td></tr>
  <tr><td><b>Singleton</b></td><td>exactly one instance, created lazily on first request</td><td>an ES module itself — importing it twice gives the same instance, module caching does this for free</td></tr>
</table>
<div class="try">
  <pre><code>class EventBus {
  #listeners = new Map();
  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push(fn);
    return () =&gt; this.off(event, fn);   <span class="c">// returns its own unsubscribe function</span>
  }
  off(event, fn) {
    const fns = this.#listeners.get(event);
    if (fns) this.#listeners.set(event, fns.filter((f) =&gt; f !== fn));
  }
  emit(event, ...args) {
    (this.#listeners.get(event) || []).forEach((fn) =&gt; fn(...args));
  }
}

const bus = new EventBus();
const unsubscribe = bus.on("greet", (name) =&gt; console.log("hello", name));
bus.emit("greet", "Ana");
unsubscribe();
bus.emit("greet", "Ravi");   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  Only <code>"hello Ana"</code> prints — the second
  <code>emit</code> finds no listeners left, because calling the
  function <code>on()</code> returned removed it. This exact shape,
  hand-rolled, is what every pub/sub library and every framework's
  event system is doing underneath, whether it's 20 lines like this one
  or a much larger implementation.
</p>

<h3>Dependency injection</h3>
<p>
  A function or class that <b>receives</b> what it depends on instead
  of reaching out and constructing or importing it directly.
</p>
<pre><code><span class="c">// tightly coupled — this function can ONLY ever hit the real API</span>
async function loadUser(id) {
  return fetch("/api/users/" + id).then((r) =&gt; r.json());
}

<span class="c">// injected — the caller decides what "fetch a user" actually means</span>
async function loadUserWith(fetchImpl, id) {
  return fetchImpl(id);
}
loadUserWith(realApiFetch, 1);       <span class="c">// production</span>
loadUserWith(fakeFetchForTests, 1);  <span class="c">// tests — no real network needed</span></code></pre>
<p class="sub">
  <b>Inversion of control</b> is the broader principle this is one
  instance of: instead of a piece of code deciding and calling its own
  dependencies, something outside it decides and hands them in. A
  framework calling <em>your</em> component function, instead of your
  code calling into the framework, is the same inversion at a larger
  scale.
</p>

<h3>State machines</h3>
<div class="try">
  <pre><code>function createTrafficLight() {
  const transitions = { red: "green", green: "yellow", yellow: "red" };
  let state = "red";
  return {
    next() { state = transitions[state]; return state; },
    current() { return state; },
  };
}
const light = createTrafficLight();
console.log(light.current());   <span class="c">// what happens?</span>
console.log(light.next(), light.next(), light.next());   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"red"</code>, then <code>"green" "yellow" "red"</code> — the
  entire idea of a state machine in one small table: a fixed set of
  named states, and one function per state that says exactly what the
  next state is allowed to be. The value over a scattering of booleans
  (<code>isLoading</code>, <code>isError</code>, <code>isSuccess</code>,
  all mutable independently) is that an <b>impossible combination</b>
  — loading AND error AND success all true at once — simply can't be
  represented at all, instead of being a bug waiting to happen.
</p>

<h3>Error boundaries and resilience</h3>
<pre><code>function withFallback(fn, fallback) {
  return async (...args) =&gt; {
    try {
      return await fn(...args);
    } catch (error) {
      console.error("recovered from:", error);
      return fallback;
    }
  };
}
const safeLoad = withFallback(loadUserProfile, { name: "Guest" });</code></pre>
<p class="sub">
  React's actual <code>ErrorBoundary</code> component is this same
  idea at the UI layer — catch a failure from a whole subtree of
  components, render a fallback UI instead of taking down the entire
  page. The general architectural principle underneath both: contain a
  failure at the smallest boundary that can meaningfully recover from
  it, instead of letting it propagate and take out something much
  bigger that didn't need to fail too.
</p>

<h3>API design</h3>
<p>
  A request is <b>idempotent</b> if making it twice has the exact same
  effect as making it once. <code>PUT /users/1 { name: "Ana" }</code>
  is idempotent — running it five times still leaves the name
  <code>"Ana"</code>. <code>POST /users</code> to create a new one
  usually isn't — five identical calls create five accounts.
</p>
<div class="sticky mint">
  <span class="ttl">Rule</span> Idempotency is exactly what makes a
  <a href="/notes/advanced-async">retry-with-backoff</a> safe to write
  blindly. Retrying an idempotent request after a timeout is harmless —
  it might have already succeeded, and running it again changes
  nothing. Retrying a non-idempotent one risks a real duplicate,
  usually solved with a client-generated <b>idempotency key</b> the
  server deduplicates by.
</div>
<p>
  <b>Caching</b> closes the loop: the same request, made again, doesn't
  even need to reach the server. An HTTP <code>Cache-Control</code>
  header, an in-memory <code>Map</code> keyed by request, or the
  <a href="/notes/scope-functions">memoize</a> pattern from three
  chapters back are all the identical idea at different layers of the
  stack — don't redo work whose answer hasn't changed.
</p>`,
    },
    {
      id: "performance",
      num: "A6",
      title: "Performance",
      short: "Performance",
      levels: ["advanced"],
      practice: ["ex-bounded-cache", "ex-process-in-batches"],
      ready: true,
      subtitle: "Making a page feel fast is a different skill than making code run fast.",
      body: `<h3>The critical rendering path</h3>
<p>
  What actually has to happen before a browser can paint a single
  pixel: download the HTML, parse it into a <b>DOM</b>, download and
  parse CSS into a <b>CSSOM</b>, combine the two into a
  <b>render tree</b> (only the nodes that will actually be visible),
  compute every element's exact size and position
  (<b>layout</b>, also called <b>reflow</b>), then finally
  <b>paint</b> pixels for each one. A <code>&lt;script&gt;</code> with
  no <code>defer</code>/<code>async</code> blocks this whole pipeline
  at the HTML-parsing step — the exact mechanism behind
  <a href="/notes/setup-mental-model">the script-vs-module blocking
  behavior</a> from the very first chapter.
</p>
<table>
  <tr>
    <th></th>
    <th>Reflow (layout)</th>
    <th>Repaint</th>
  </tr>
  <tr><td>Triggered by</td><td>anything that changes size or position — width, font-size, adding/removing an element</td><td>anything that changes appearance only — color, background, visibility</td></tr>
  <tr><td>Cost</td><td>expensive — can cascade to the whole subtree, sometimes the whole page</td><td>cheaper — no geometry to recompute</td></tr>
  <tr><td>Cheapest of all</td><td colspan="2"><code>transform</code> and <code>opacity</code> — these two can often skip layout AND paint entirely, handled straight on the compositor thread</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Reading layout in a loop forces it early, repeatedly</span>
  <code>el.offsetHeight</code> (or <code>getBoundingClientRect()</code>)
  forces the browser to run layout <em>right now</em> if anything is
  pending, instead of waiting for its natural time. Alternating writes
  and reads of layout properties in a loop —
  <code>el.style.width = x; console.log(el.offsetHeight);</code>,
  repeated — forces a full synchronous reflow on <em>every
  iteration</em>. This pattern has an actual name: <b>layout
  thrashing</b>. The fix is always the same shape: batch every read
  first, then batch every write.
</div>

<h3>Not blocking the main thread</h3>
<p>
  <code>requestAnimationFrame(fn)</code> schedules <code>fn</code> to
  run right before the browser's next paint — the correct place for
  any animation logic, because it's synced to the actual screen
  refresh instead of guessing at a delay like
  <code>setTimeout</code> would.
  <code>requestIdleCallback(fn)</code> is the opposite priority: run
  <code>fn</code> only when the browser is otherwise idle, with time to
  spare before the next frame — for genuinely low-priority work
  (analytics batching, prefetching) that should never compete with
  anything the user is actually looking at.
</p>
<pre><code>function animate() {
  el.style.transform = "translateX(" + x + "px)";
  x += 2;
  if (x &lt; 300) requestAnimationFrame(animate);   <span class="c">// re-schedule for the NEXT frame</span>
}
requestAnimationFrame(animate);

requestIdleCallback(() =&gt; {
  sendAnalyticsBatch();   <span class="c">// only runs if the browser has spare time before the next frame</span>
});</code></pre>
<p class="sub">
  <a href="/notes/scope-functions">Debounce and throttle</a> solve a
  different problem — how <em>often</em> a handler runs at all — and
  compose naturally with this: throttle a scroll handler down to a
  sane rate, then do the actual DOM write inside
  <code>requestAnimationFrame</code> so it lands at the right moment in
  the render pipeline.
</p>

<h3>The metrics that actually get measured</h3>
<table>
  <tr>
    <th>Metric</th>
    <th>Measures</th>
  </tr>
  <tr><td><b>LCP</b> — Largest Contentful Paint</td><td>how long until the biggest visible element (usually a hero image or heading) renders</td></tr>
  <tr><td><b>INP</b> — Interaction to Next Paint</td><td>how long the page takes to visibly respond to a click, tap, or keypress — replaced the older FID metric for exactly this reason: FID only measured the delay before a handler started running, INP measures the whole thing including how long the handler itself takes</td></tr>
  <tr><td><b>CLS</b> — Cumulative Layout Shift</td><td>how much visible content jumps around unexpectedly — an image with no reserved <code>width</code>/<code>height</code> popping in and shoving everything below it down is the classic cause</td></tr>
</table>
<p>
  A <b>long task</b> is any single chunk of main-thread JS running
  longer than 50ms without yielding — the main thread can't paint, or
  respond to input, until it's done, so a long task directly hurts
  both LCP and INP at once. Lighthouse is the tool that turns all of
  this into one number and a prioritized list of fixes; the metrics
  above are what it's actually measuring underneath that score.
</p>

<h3>Rendering less, later, or not yet</h3>
<pre><code><span class="c">// Virtual list — render only the ~20 rows actually visible, not all 50,000</span>
function VirtualList({ items, rowHeight, viewportHeight }) {
  const [scrollTop, setScrollTop] = useState(0);
  const start = Math.floor(scrollTop / rowHeight);
  const visibleCount = Math.ceil(viewportHeight / rowHeight);
  const visible = items.slice(start, start + visibleCount);
  <span class="c">// render "visible" only, with top/bottom spacers sized to fill the scroll area</span>
}</code></pre>
<p>
  A virtual list keeps DOM node count roughly constant regardless of
  data size — 50,000 rows and 50 rows cost the same, because only
  what's actually in the viewport (plus a small buffer) is ever
  mounted. <code>loading="lazy"</code> on an <code>&lt;img&gt;</code>
  is the built-in, no-JS version of the same idea for images below the
  fold. <b>Prefetching</b> is the opposite bet — load something
  <em>before</em> it's needed, on a strong signal it's about to be
  (hovering a link, an <code>IntersectionObserver</code> from
  <a href="/notes/regex-dates-apis">two chapters back</a> firing near
  the bottom of the page) — trading a little wasted bandwidth on guesses
  that don't pan out for a page that already has the next thing ready.
</p>

<h3>Tree shaking and bundle size</h3>
<p>
  <a href="/notes/modules-tooling">Already covered</a>: tree shaking
  only works because ESM imports are static and analyzable — a
  bundler can see the entire dependency graph and delete anything
  provably unused. "Provably" is the load-bearing word: a module with
  <b>side effects</b> at its top level (code that runs just from being
  imported — registering something globally, patching a prototype)
  can't be safely deleted even if nothing imports a name from it,
  because deleting it would change behavior. <code>package.json</code>'s
  <code>"sideEffects": false</code> field is a library author's
  explicit promise that none of their files do this, which is what
  lets a bundler tree-shake it aggressively instead of playing it safe.
</p>
<p class="sub">
  A bundle analyzer (a treemap of what's actually inside the shipped
  JS, sized by byte) is how "why is this bundle 400kb" stops being a
  guess — it routinely surfaces one unexpectedly heavy dependency, or
  an entire library imported for one small utility function that could
  have been hand-written in ten lines instead.
</p>`,
    },
    {
      id: "security",
      num: "A7",
      title: "Security",
      short: "Security",
      levels: ["advanced"],
      practice: ["ex-escape-html", "ex-safe-merge"],
      ready: true,
      subtitle: "The mistakes that turn into a real incident, not just a bug.",
      body: `<h3>XSS — three flavors, one root cause</h3>
<p>
  Cross-site scripting is always the same underlying failure: text that
  came from somewhere untrusted got treated as <b>markup</b> instead of
  <b>data</b>. The three flavors differ only in <em>where</em> the
  untrusted text entered.
</p>
<table>
  <tr>
    <th>Flavor</th>
    <th>Untrusted text comes from</th>
  </tr>
  <tr><td><b>Stored</b></td><td>the database — a comment, a username, a bio someone else submitted, rendered later for other visitors</td></tr>
  <tr><td><b>Reflected</b></td><td>the current request — a URL/search-query parameter echoed straight into the page's HTML</td></tr>
  <tr><td><b>DOM-based</b></td><td>client-side JS itself — reading <code>location.hash</code> or similar and writing it into the DOM, no server involved at all</td></tr>
</table>
<pre><code><span class="c">// the actual vulnerable line looks the same in all three flavors:</span>
el.innerHTML = someValueThatCameFromOutsideThisFile;

<span class="c">// the fix is the same in all three, too:</span>
el.textContent = someValueThatCameFromOutsideThisFile;   <span class="c">// never parsed as HTML — see the DOM chapter</span>
<span class="c">// — or, if actual formatted HTML is genuinely needed, sanitize FIRST:</span>
el.innerHTML = DOMPurify.sanitize(someValueThatCameFromOutsideThisFile);</code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> <code>textContent</code> by default.
  <code>innerHTML</code> only for markup you trust completely — your
  own hardcoded strings, or output that's been through a real
  sanitizer. "I'll just strip <code>&lt;script&gt;</code> tags myself"
  is not a sanitizer; there are too many other ways to smuggle
  executable content into HTML (an <code>onerror</code> attribute on an
  <code>&lt;img&gt;</code>, a <code>javascript:</code> URL) to
  reimplement correctly by hand.
</div>
<p>
  A <b>Content-Security-Policy</b> header is the defense-in-depth
  layer underneath sanitization — even if a payload does slip through,
  a strict CSP can refuse to execute it:
</p>
<pre><code>Content-Security-Policy: script-src 'self'; object-src 'none'</code></pre>
<p class="sub">
  That policy tells the browser to run scripts only from the site's own
  origin — an injected <code>&lt;script src="https://evil.example"&gt;</code>
  or an inline <code>&lt;script&gt;alert(1)&lt;/script&gt;</code> both
  get refused at the browser level, entirely independent of whether the
  injection itself was ever caught.
</p>

<h3>CSRF, SameSite, and CORS — three names for "who's actually making this request"</h3>
<p>
  A browser attaches cookies to a request automatically, based purely
  on the target domain — it doesn't check <em>which site's page</em>
  triggered the request. <b>CSRF</b> abuses exactly that: a malicious
  page auto-submits a form to
  <code>your-bank.com/transfer</code>, and the browser happily attaches
  the visitor's real, valid <code>your-bank.com</code> session cookie
  to it, because from the cookie's point of view it's a normal request
  to the right domain.
</p>
<pre><code>Set-Cookie: session=abc123; SameSite=Strict; Secure; HttpOnly</code></pre>
<table>
  <tr>
    <th><code>SameSite</code> value</th>
    <th>Cookie sent on a cross-site request?</th>
  </tr>
  <tr><td><code>Strict</code></td><td class="tone-bad">never</td></tr>
  <tr><td><code>Lax</code> (most browsers' default today)</td><td class="tone-warn">only on top-level navigation (clicking a real link), not on a background <code>fetch</code>/form auto-submit</td></tr>
  <tr><td><code>None</code></td><td class="tone-yes">always — requires <code>Secure</code> too</td></tr>
</table>
<p>
  <a href="/notes/async-properly">CORS</a>, revisited: it's the
  opposite direction from CSRF — CORS decides whether <em>JavaScript
  can read the response</em> of a cross-origin request; it does nothing
  to stop the request from being <em>sent</em> in the first place (a
  plain HTML form auto-submit isn't subject to CORS at all).
  <code>SameSite</code> cookies are what actually close the CSRF hole;
  CORS closes a different one.
</p>

<h3>Prototype pollution</h3>
<p>
  A "deep merge" utility that copies keys with a plain
  <code>for...in</code> and bracket assignment has a landmine baked in:
  <code>"__proto__"</code> is a legal object key, and writing through
  it doesn't set a normal property — it reaches all the way up to
  <code>Object.prototype</code> itself.
</p>
<pre><code>function unsafeMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === "object" &amp;&amp; source[key] !== null) {
      if (!target[key]) target[key] = {};
      unsafeMerge(target[key], source[key]);   <span class="c">// recurses into "__proto__" just like any other key</span>
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const attackerPayload = JSON.parse('{"__proto__": {"isAdmin": true}}');
unsafeMerge({}, attackerPayload);

({}).isAdmin;   <span class="c">// true — on a BRAND NEW, completely unrelated object, anywhere in the whole program</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ This isn't a toy example</span>
  A merge/clone utility that accepts <em>any</em> JSON from outside the
  program (a request body, a config file) and doesn't guard against
  this is a real, repeatedly-exploited vulnerability class — several
  popular npm packages have shipped exactly this bug. The fix: skip
  <code>"__proto__"</code>, <code>"constructor"</code>, and
  <code>"prototype"</code> explicitly during a merge, or build the
  result with <code>Object.create(null)</code> so it has no prototype
  at all to pollute.
</div>

<h3>Supply-chain risk</h3>
<p>
  Every dependency's <code>postinstall</code> script and every
  transitive dependency (a dependency of a dependency, several layers
  deep, that nobody on the team ever chose or reviewed) runs with the
  same trust and access as your own code the moment
  <code>npm install</code> finishes. A compromised popular package —
  through a hijacked maintainer account or a typosquatted name one
  character off from a real one — is a genuine, repeatedly-realized
  attack vector, not a hypothetical one.
</p>
<p class="sub">
  A committed lockfile
  (<a href="/notes/modules-tooling">already covered</a>) is part of the
  defense here too: it pins the exact resolved tree, so a compromised
  new version of a transitive dependency published after the lockfile
  was generated doesn't get silently pulled in on the next install.
</p>

<h3>innerHTML and postMessage, safely</h3>
<pre><code><span class="c">// postMessage — always check the origin, on both ends</span>
window.addEventListener("message", (event) =&gt; {
  if (event.origin !== "https://trusted-partner.example") return;   <span class="c">// reject everything else</span>
  handleMessage(event.data);
});

otherWindow.postMessage(payload, "https://trusted-partner.example");   <span class="c">// NEVER "*" for anything sensitive</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ A missing origin check accepts messages from ANY page</span>
  Without the <code>event.origin</code> check, any page anywhere that
  can get a reference to your window (an iframe embedding it, a popup
  it opened) can send it a message your handler will act on as if it
  were trusted. Sending with <code>"*"</code> as the target origin has
  the same problem in the other direction — the payload gets delivered
  to whatever page is currently there, trusted or not.
</div>`,
    },
    {
      id: "ecosystem-professional",
      num: "A8",
      title: "Ecosystem & professional",
      short: "Ecosystem",
      levels: ["advanced"],
      practice: ["ex-flat-polyfill", "ex-ast-node-counter"],
      ready: true,
      subtitle: "The close-out — how the tools around JS actually work, and where the language itself comes from.",
      body: `<p>
  TypeScript, Node, and testing each have their own full shelf on this
  site — this section is deliberately brief on all three, just enough
  to place them, with a link to go deep. What gets real depth here is
  what doesn't have a shelf of its own: how source code actually
  becomes a running program, and where new JS syntax comes from before
  it's syntax at all.
</p>

<h3>TypeScript, Node, testing — in one paragraph each</h3>
<p>
  TypeScript adds a type system checked entirely at compile time and
  erased before anything runs — it's <b>structural</b>, meaning two
  differently-named types with the same shape are compatible, unlike
  languages that check by declared name. Generics, narrowing, and the
  built-in utility types (<code>Partial</code>, <code>Pick</code>,
  <code>Omit</code>) get their own full treatment on
  <a href="/typescript">the TypeScript shelf</a>.
</p>
<p>
  Node extends JS past the browser with a filesystem, a process, and
  no DOM — streams, <code>cluster</code> (multi-process scaling across
  CPU cores), worker threads, and <code>AsyncLocalStorage</code>
  (request-scoped context that survives across
  <code>await</code>s without threading a parameter through every
  function) are covered on <a href="/node">the Node shelf</a>.
</p>
<p>
  Testing splits into unit (one function, isolated), integration
  (several real pieces together), and end-to-end (the actual app,
  driven like a user would). <b>Fake timers</b>
  (<code>vi.useFakeTimers()</code> in this project's own test suite) let
  a test fast-forward through a <code>setTimeout</code> instantly
  instead of genuinely waiting; <b>mocking</b> replaces a real
  dependency with a controlled fake, the same
  <a href="/notes/patterns-architecture">dependency-injection</a> idea
  applied specifically to make code testable. Full depth on
  <a href="/testing">the testing shelf</a>.
</p>

<h3>What a bundler is actually doing: ASTs</h3>
<p>
  Every tool in this chapter — a bundler, a linter, a formatter, a
  minifier, a codemod — starts the exact same way:
  <b>parse the source into an Abstract Syntax Tree</b>, a plain nested
  object describing the code's structure, then walk and transform
  <em>that tree</em>, never the raw text itself.
</p>
<div class="try">
  <pre><code><span class="c">// A hand-built AST for: const x = 1 + 2;
     // Real parsers (Babel, Acorn) produce something like this automatically.</span>
const ast = {
  type: "VariableDeclaration",
  kind: "const",
  declarations: [{
    type: "VariableDeclarator",
    id: { type: "Identifier", name: "x" },
    init: {
      type: "BinaryExpression",
      operator: "+",
      left: { type: "Literal", value: 1 },
      right: { type: "Literal", value: 2 },
    },
  }],
};
console.log(JSON.stringify(ast.declarations[0].init, null, 2));</code></pre>
</div>
<p class="sub">
  That's genuinely close to what
  <a href="https://astexplorer.net">astexplorer.net</a> shows for the
  real thing — every operator, every identifier, every literal is its
  own typed node. Editing code programmatically (a <b>codemod</b>,
  the tool behind large automated migrations like a big React version
  bump across a whole codebase) means finding the right node type in
  this tree and swapping it, then printing the tree back out to text —
  never regex-replacing the source directly, which breaks the instant
  the pattern shows up somewhere the author didn't anticipate (inside a
  string, a comment, a different context entirely).
</p>
<p>
  A Babel <b>plugin</b> is exactly this walk-and-transform step,
  packaged: it's handed the AST, given a chance to visit specific node
  types (<code>ArrowFunctionExpression</code>,
  <code>ClassDeclaration</code>, …), and returns a modified tree that
  Babel then prints back to JS — this is the actual mechanism behind
  "transpile modern syntax down to something older browsers run."
</p>

<h3>Polyfills vs transpilation — two different problems</h3>
<p>
  These get bundled together in conversation constantly, and they fix
  genuinely different gaps.
</p>
<table>
  <tr>
    <th></th>
    <th>Transpilation</th>
    <th>Polyfill</th>
  </tr>
  <tr><td>Fixes a missing…</td><td><b>syntax</b> — arrow functions, optional chaining, classes</td><td><b>runtime feature</b> — <code>Array.prototype.flat</code>, <code>Promise</code>, <code>fetch</code></td></tr>
  <tr><td>How</td><td>rewrites your source into older-syntax equivalent code, before shipping</td><td>ships extra JS that <em>adds</em> the missing method/object at runtime, if it's not already there</td></tr>
  <tr><td>Can it be fixed at build time alone?</td><td class="tone-yes">yes — syntax is fully resolved before the browser ever sees it</td><td class="tone-bad">no — the feature has to actually exist in the running environment, one way or another</td></tr>
</table>
<p>
  <code>core-js</code> is the actual polyfill implementation most
  tooling pulls from; <b>browser targeting</b>
  (a <code>browserslist</code> config, shared by most of this
  toolchain) is what tells both the transpiler and the polyfill loader
  which engines actually need to be supported — the newer the target
  list, the less of either gets shipped, which is a direct, measurable
  bundle-size win for a team that can drop support for old browsers.
</p>

<h3>Reading the spec, and where new syntax comes from</h3>
<p>
  Every JS feature in every chapter on this site started as a TC39
  proposal and moved through five fixed stages before landing in the
  language:
</p>
<table>
  <tr>
    <th>Stage</th>
    <th>Means</th>
  </tr>
  <tr><td><b>0 — Strawperson</b></td><td>any committee member's idea, no formal backing yet</td></tr>
  <tr><td><b>1 — Proposal</b></td><td>the problem is real, worth solving, has a champion</td></tr>
  <tr><td><b>2 — Draft</b></td><td>real syntax and semantics written out</td></tr>
  <tr><td><b>3 — Candidate</b></td><td>spec-complete, feedback comes from real implementations, not just discussion</td></tr>
  <tr><td><b>4 — Finished</b></td><td>shipped in engines, included in the next yearly ECMAScript edition</td></tr>
</table>
<p class="sub">
  Optional chaining, nullish coalescing, and top-level await all went
  through exactly this pipeline before ever reaching a browser. The
  official spec (<a href="https://tc39.es/ecma262/">ecma262</a>) reads
  as dense, formal pseudocode — genuinely worth being able to skim once
  in a while, because it's the actual final authority any time a
  blog post's explanation of some edge case and the engine's real
  behavior disagree.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "When I hit a genuinely
  ambiguous edge case — something two blog posts explain differently —
  I check the spec or a quick <code>node -p</code>/console test rather
  than trust either post. This whole site was built the same way: every
  runnable claim in it was verified against a real engine first."
</div>`,
    },

    {
      id: "cheat",
      num: "★",
      title: "The cheat page",
      short: "Cheat page",
      levels: ["beginner", "intermediate", "advanced"],
      practice: [],
      ready: true,
      subtitle: "Not a 24th lesson — the night-before-the-interview skim of the other 23.",
      body: `<p>
  Nothing new gets taught here. Every row links back to the chapter
  that actually explains the <em>why</em> — this page exists purely so
  the <em>what</em> is skimmable in one pass, table after table,
  instead of re-reading three levels of chapters the night before
  something matters.
</p>

<h3>Coercion &amp; comparison, at a glance</h3>
<div class="chipset">
  <span class="chip tone-yes">null == undefined</span>
  <span class="chip tone-yes">0 == false</span>
  <span class="chip tone-yes">"0" == 0</span>
  <span class="chip tone-yes">[] == false</span>
  <span class="chip tone-bad">NaN == NaN</span>
  <span class="chip tone-bad">null == 0</span>
  <span class="chip tone-bad">"" == "0"</span>
</div>
<p class="sub">Full coercion table and the non-transitivity proof: <a href="/notes/operators-flow">Operators &amp; flow</a>.</p>
<div class="try">
  <pre><code>console.log(0.1 + 0.2);            <span class="c">// what happens?</span>
console.log(0.1 + 0.2 === 0.3);    <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>0.30000000000000004</code>, then <code>false</code>. Not a JS
  bug — IEEE 754 floats can't represent 0.1 or 0.2 exactly in binary,
  in any language that uses them. Never compare floats with
  <code>===</code>; compare
  <code>Math.abs(a - b) &lt; Number.EPSILON</code> instead, or work in
  integers (cents, not dollars) where exactness actually matters.
</p>
<table>
  <tr><th></th><th><code>===</code></th><th><code>Object.is()</code></th></tr>
  <tr><td><code>NaN</code> vs <code>NaN</code></td><td class="tone-bad">false</td><td class="tone-yes">true</td></tr>
  <tr><td><code>0</code> vs <code>-0</code></td><td class="tone-yes">true</td><td class="tone-bad">false</td></tr>
</table>

<h3>Type checks, at a glance</h3>
<table>
  <tr><th>Expression</th><th>Result</th></tr>
  <tr><td><code>typeof null</code></td><td><code>"object"</code> — a 25-year-old bug, permanent for compatibility</td></tr>
  <tr><td><code>typeof undefined</code></td><td><code>"undefined"</code></td></tr>
  <tr><td><code>typeof NaN</code></td><td><code>"number"</code> — NaN IS a number, just not a useful one</td></tr>
  <tr><td><code>typeof []</code></td><td><code>"object"</code> — use <code>Array.isArray()</code></td></tr>
  <tr><td><code>typeof function(){}</code>, <code>typeof class{}</code></td><td>both <code>"function"</code></td></tr>
  <tr><td><code>typeof Symbol()</code>, <code>typeof 10n</code></td><td><code>"symbol"</code>, <code>"bigint"</code></td></tr>
  <tr><td><code>[1,2] === [1,2]</code></td><td><code>false</code> — different references, same shape</td></tr>
</table>
<p class="sub">Full type system: <a href="/notes/types-values">Types &amp; values</a>. Reference vs primitive: same chapter.</p>

<h3>Scope, closures, this — the 30-second version</h3>
<table>
  <tr><th>Rank</th><th>Rule</th><th>Trigger</th></tr>
  <tr><td>1</td><td><b>new</b></td><td><code>new Fn()</code></td></tr>
  <tr><td>2</td><td><b>explicit</b></td><td><code>.call()</code> / <code>.apply()</code> / <code>.bind()</code></td></tr>
  <tr><td>3</td><td><b>implicit</b></td><td><code>obj.method()</code></td></tr>
  <tr><td>4</td><td><b>default</b></td><td>bare <code>fn()</code> → <code>undefined</code> in strict mode</td></tr>
</table>
<p class="sub">
  Arrows never bind their own <code>this</code> — they read it from
  where they're written. Full precedence proof (including
  <code>new</code> beating <code>bind</code>) and all five real
  closure uses: <a href="/notes/scope-functions">Scope &amp; functions, properly</a>.
</p>

<h3>Array &amp; object methods — mutates, or doesn't?</h3>
<table>
  <tr><th>Mutates the original</th><th>Returns a new one, leaves the original alone</th></tr>
  <tr><td><code>push</code>, <code>pop</code>, <code>shift</code>, <code>unshift</code></td><td><code>slice</code>, <code>concat</code>, <code>map</code>, <code>filter</code></td></tr>
  <tr><td><code>splice</code>, <code>sort</code>, <code>reverse</code></td><td><code>flat</code>, <code>flatMap</code>, spread <code>[...arr]</code></td></tr>
  <tr><td><code>Object.assign(target, …)</code></td><td><code>{ ...obj }</code>, <code>structuredClone(obj)</code></td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ .map() skips holes in a sparse array</span>
  <code>Array(3).map(x =&gt; 1)</code> is still
  <code>[ &lt;3 empty items&gt; ]</code>, not <code>[1, 1, 1]</code> —
  <code>Array(3)</code> creates empty slots, not <code>undefined</code>
  values, and <code>map</code>/<code>forEach</code>/<code>filter</code>
  all skip holes entirely. <code>Array.from({ length: 3 })</code> or
  <code>Array(3).fill()</code> first if you actually want real,
  mappable elements.
</div>
<p class="sub">Full method tables: <a href="/notes/objects-arrays-basics">Objects &amp; arrays (first half)</a> and <a href="/notes/objects-deep">Objects deeply</a>.</p>

<h3>Async ordering — the one rule</h3>
<p>
  Sync code runs first, always. Then the <b>whole</b> microtask queue
  drains (every <code>.then()</code>, every <code>await</code>
  continuation) — completely — before a single macrotask
  (<code>setTimeout</code>, a click) gets a turn.
</p>
<table>
  <tr><th>Combinator</th><th>Settles when</th></tr>
  <tr><td><code>Promise.all</code></td><td>all fulfill, or the first rejection</td></tr>
  <tr><td><code>Promise.allSettled</code></td><td>everything has settled — never rejects itself</td></tr>
  <tr><td><code>Promise.race</code></td><td>the first to settle, win or lose</td></tr>
  <tr><td><code>Promise.any</code></td><td>the first to <b>fulfill</b> — ignores earlier rejections</td></tr>
</table>
<p class="sub">Full step-through demos: <a href="/notes/setup-mental-model">Setup &amp; mental model</a>. Sequential-vs-parallel await, retries, AbortController: <a href="/notes/async-properly">Async, properly</a>.</p>

<h3>Classes &amp; prototypes — the 30-second version</h3>
<pre><code>obj.hasOwnProperty("x")     <span class="c">// true only for OWN properties, never inherited ones</span>
Object.getPrototypeOf(obj)  <span class="c">// the real link an instance follows</span>
Fn.prototype                <span class="c">// what becomes that link for every "new Fn()"</span>
class B extends A {
  constructor() { super(); }   <span class="c">// MUST run before "this" is usable</span>
}</code></pre>
<p class="sub">The 4 steps <code>new</code> actually performs, and <code>#private</code> being parser-enforced: <a href="/notes/prototypes-oop">Prototypes &amp; OOP</a>.</p>

<h3>"Implement X" — the classic from-scratch asks</h3>
<table>
  <tr><th>Ask</th><th>Taught in</th></tr>
  <tr><td>debounce / throttle</td><td><a href="/notes/scope-functions">Scope &amp; functions, properly</a></td></tr>
  <tr><td>curry / partial application / compose</td><td><a href="/notes/scope-functions">Scope &amp; functions, properly</a>, <a href="/notes/patterns-architecture">Patterns &amp; architecture</a></td></tr>
  <tr><td>memoize / once</td><td><a href="/notes/scope-functions">Scope &amp; functions, properly</a></td></tr>
  <tr><td>your own EventEmitter / pub-sub</td><td><a href="/notes/patterns-architecture">Patterns &amp; architecture</a></td></tr>
  <tr><td>deep clone</td><td><code>structuredClone()</code> — <a href="/notes/objects-deep">Objects deeply</a></td></tr>
  <tr><td>a concurrency-limited task queue</td><td><a href="/notes/advanced-async">Advanced async</a></td></tr>
  <tr><td>a custom iterable (<code>Symbol.iterator</code>)</td><td><a href="/notes/metaprogramming">Metaprogramming</a></td></tr>
  <tr><td><code>new</code> from scratch</td><td><a href="/notes/prototypes-oop">Prototypes &amp; OOP</a></td></tr>
</table>

<h3>The gotchas grid</h3>
<div class="chipset">
  <span class="chip tone-warn">{} + [] → 0 (statement position)</span>
  <span class="chip tone-warn">[] + {} → "[object Object]"</span>
  <span class="chip tone-warn">1 &lt; 2 &lt; 3 → true</span>
  <span class="chip tone-warn">3 &gt; 2 &gt; 1 → false</span>
  <span class="chip tone-warn">var in a loop + setTimeout → same value every time</span>
  <span class="chip tone-warn">forEach can't be broken out of</span>
  <span class="chip tone-warn">indexOf(NaN) is always -1</span>
  <span class="chip tone-warn">a bound "this" loses to new</span>
</div>
<p class="sub">Every one of these is explained, not just listed, in <a href="/notes/operators-flow">Operators &amp; flow</a>, <a href="/notes/scope-functions">Scope &amp; functions, properly</a>, and <a href="/notes/objects-arrays-basics">Objects &amp; arrays</a>.</p>

<h3>How to actually use this page</h3>
<ol>
  <li>Don't start here. Every row above assumes the chapter behind its link has already been read once — this page is recall, not first exposure.</li>
  <li>Cover the "Result" column with your hand and predict it before checking. Being surprised by a row you've "read" before is the actual signal it needs another real pass, not just a re-skim.</li>
  <li>For the gotchas grid specifically: cover the chip past the arrow and say the <em>reason</em> out loud, not just the result — "why" is what an interviewer is actually asking for.</li>
  <li>If a whole section reads unfamiliar rather than "oh right" — go read that chapter properly. This page is a mirror, not a shortcut past the mirror.</li>
</ol>`,
    },
  ],
};
