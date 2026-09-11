import type { Chapter } from "../types";

export const singleThread: Chapter = {
  id: "single-thread",
  num: "B4",
  title: "One thread, one stack",
  short: "Single thread",
  levels: ["beginner"],
  practice: ["ex-call-stack-trace", "ex-chunk-work"],
  ready: true,
  subtitle: "Why JavaScript can only do one thing at a time — and how it still does ten.",
  body: `<h3>One thread means one call stack</h3>
<p>
  A <b>thread</b> is one worker following one list of instructions. Give
  a program two threads and two instructions genuinely happen at the
  same instant, on two CPU cores. JavaScript gets one. Everything else
  in this chapter follows from that single fact.
</p>
<p>
  That one worker keeps its place using a <b>call stack</b>: a pile of
  half-finished function calls. Call a function and a frame is pushed on
  top — its arguments, its local memory, and the line to return to.
  Return, and the frame pops off. Whatever is on top is what is running
  right now; everything under it is waiting for the thing above to
  finish.
</p>
<p>
  You have already seen this pile printed out, upside down. It is called
  a stack trace.
</p>

<div class="demo">
  <div class="demo__bar">The call stack — push, push, throw, unwind</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="cs-code"></div>
        <div class="loop-bar"><i id="cs-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="cs-prev" type="button">&larr; Back</button>
          <button class="btn" id="cs-next" type="button">Next step &rarr;</button>
          <button class="btn" id="cs-play" type="button">Play</button>
          <button class="btn btn--ghost" id="cs-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Call stack — last one listed is on top</div>
          <div id="cs-p-stack"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Console</div>
          <div id="cs-p-out"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="cs-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "cs";
  var CODE = [
    "function third()  { throw new Error('boom'); }",
    "function second() { third(); }",
    "function first()  { second(); }",
    "",
    "first();"
  ];
  var STEPS = [
    {"line":null,"panels":{"stack":[],"out":[]},"note":"Three functions, each calling the next. Nothing has run yet."},
    {"line":5,"panels":{"stack":["main()"],"out":[]},"note":"The file itself gets a frame. This is the one worker, starting work."},
    {"line":5,"panels":{"stack":["main()","first()"],"out":[]},"note":"first() is called and pushed on top. main() is now stuck waiting — it cannot continue until first() returns."},
    {"line":3,"panels":{"stack":["main()","first()","second()"],"out":[]},"note":"Inside first(), second() is called. Three frames deep."},
    {"line":2,"panels":{"stack":["main()","first()","second()","third()"],"out":[]},"note":"And third() on top of that. Only third() is actually running — the other three are all parked mid-line."},
    {"line":1,"panels":{"stack":["main()","first()","second()","third()  <- throws"],"out":[]},"note":"third() throws. Nobody catches it, so JS unwinds the stack, printing it as it goes."},
    {"line":1,"panels":{"stack":[],"out":["Error: boom","    at third  (line 1)","    at second (line 2)","    at first  (line 3)","    at main   (line 5)"]},"note":"THE STACK TRACE IS THE STACK. Read it top-down and you are reading the pile from the top frame to the bottom — where it broke, then who asked for it, in order."},
    {"line":null,"panels":{"stack":[],"out":["Error: boom","    at third  (line 1)","    at second (line 2)","    at first  (line 3)","    at main   (line 5)"]},"note":"Stack empty. With nothing left to run, the thread is free again — and that emptiness is exactly what the event loop is waiting for."}
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

<p>
  The stack has a size limit, and recursion with no exit finds it in
  milliseconds:
</p>
<div class="try">
  <pre><code>let depth = 0;
function dive() { depth++; dive(); }

try { dive(); } catch (e) {
  console.log(e.constructor.name);          <span class="c">// RangeError</span>
  console.log("frames before it broke:", depth);
}</code></pre>
</div>
<p class="sub">
  Run it. "Maximum call stack size exceeded" is not a mysterious
  browser complaint — it is this pile hitting the ceiling, a few
  thousand frames up. The exact number moves with the engine and with
  how much each frame has to hold.
</p>

<h3>Why only one thread?</h3>
<p>
  This looks like a limitation to apologise for. It is closer to a
  trade that was made deliberately, and the reason is sitting on the
  page in front of you: <b>the DOM</b>.
</p>
<p>
  Imagine two threads running your code at once. One is appending a row
  to a table; the other is deleting the table's parent. One is halfway
  through reading <code>element.children</code> while the other splices
  an element out of it. Every language that allows this hands you the
  same toolbox to survive it — locks, mutexes, semaphores — and with it
  the family of bugs that comes free: deadlocks, race conditions, and
  state that is correct only if you remembered to lock it.
</p>
<p>
  JavaScript was built in 1995 to make web pages interactive, for people
  who were not systems programmers. Giving it one thread removed that
  entire category of problem by construction:
</p>
<ul>
  <li>
    <b>You never write a lock.</b> There is no <code>synchronized</code>,
    no mutex, no atomic counter in everyday JS.
  </li>
  <li>
    <b>Nothing changes underneath you.</b> Between two lines of your
    function, no other JavaScript can run. An object is never half
    updated when you read it.
  </li>
  <li>
    <b>Run-to-completion.</b> Once a function starts, it finishes before
    anything else gets a turn — including a click that arrived in the
    middle of it.
  </li>
</ul>
<p class="sub">
  Worth being precise about what is single-threaded here: <em>your
  JavaScript</em> is. The browser absolutely is not — it has threads for
  networking, for parsing, for compositing, for timers, and often a
  whole process per tab. You get one thread to run code on; the
  machinery around it is busy on several.
</p>

<div class="say">
  <span class="ttl">Say it like this &rarr;</span> "One thread is the
  price of a DOM you can touch without locks. JavaScript traded
  parallelism for a world where nothing changes between two of your own
  lines."
</div>

<h3>What blocking actually means</h3>
<p>
  The bill for that trade arrives when one function takes too long.
  Three things share that single thread, and they take strict turns:
</p>
<ol>
  <li>running your JavaScript</li>
  <li>reacting to input — clicks, typing, scroll</li>
  <li>rendering — style, layout, paint</li>
</ol>
<p>
  While a function of yours is on the stack, the other two cannot
  happen. Not "are slowed down" — cannot happen. The page does not
  repaint. The button does not depress. The spinner you started does not
  spin, because spinning it is rendering, and rendering is waiting for
  you.
</p>

<div class="try">
  <pre><code>console.log("before");

const stop = Date.now() + 800;
while (Date.now() &lt; stop) {}      <span class="c">// 800ms of pure blocking</span>

console.log("after");
<span class="c">// In a real page, every click during that gap is frozen —
// and then all of them fire at once the moment it ends.</span></code></pre>
</div>
<p class="sub">
  Anything over about 50ms in one go is officially a "long task" — long
  enough for a person to feel the page stop responding. That number is
  measured directly by real-user monitoring tools, covered in
  <a href="/notes/performance">Performance</a>.
</p>

<h3>So how does anything happen at once?</h3>
<p>
  Here is the part that sounds like a contradiction and is not.
  JavaScript is single-threaded. Your app still loads three APIs while
  animating a menu and running a timer. Both are true because of one
  fact people skip:
</p>

<div class="sticky mint">
  <span class="ttl">The whole trick</span> The slow work is not done by
  JavaScript. <code>setTimeout</code>, <code>fetch</code>, file reads,
  timers and DOM events are not part of the language — they are
  <b>host APIs</b> handed to you by the browser or Node, implemented in
  C++ or Rust, running on <em>their own</em> threads. Your thread only
  hands the job over and takes the result back.
</div>

<p>
  So an async call is a three-part relay, not a wait:
</p>
<ol>
  <li>
    <b>Hand off.</b> Your code calls <code>setTimeout(cb, 1000)</code>.
    The runtime starts a timer on its own thread and
    <code>setTimeout</code> returns <em>immediately</em>. Your stack
    keeps going.
  </li>
  <li>
    <b>Wait, elsewhere.</b> The timer counts down off your thread. The
    network waits off your thread. Your thread is not involved and does
    not care.
  </li>
  <li>
    <b>Hand back.</b> When it is done, the runtime cannot just run your
    callback — that would mean two things on one stack. So it puts the
    callback in a <b>queue</b> and waits for your stack to empty. The
    <b>event loop</b> does the moving.
  </li>
</ol>

<div class="demo">
  <div class="demo__bar">The handoff — where async work actually goes</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="ho-code"></div>
        <div class="loop-bar"><i id="ho-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="ho-prev" type="button">&larr; Back</button>
          <button class="btn" id="ho-next" type="button">Next step &rarr;</button>
          <button class="btn" id="ho-play" type="button">Play</button>
          <button class="btn btn--ghost" id="ho-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Your thread — the call stack</div>
          <div id="ho-p-stack"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">The runtime's threads — not JavaScript</div>
          <div id="ho-p-host"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Callback queue — waiting for an empty stack</div>
          <div id="ho-p-queue"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Console</div>
          <div id="ho-p-out"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="ho-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "ho";
  var CODE = [
    "console.log('start');",
    "setTimeout(onTimer, 1000);",
    "fetch('/api/user').then(onUser);",
    "console.log('end');"
  ];
  var STEPS = [
    {"line":null,"panels":{"stack":[],"host":[],"queue":[],"out":[]},"note":"A timer and a network call. Watch which column each one actually runs in."},
    {"line":1,"panels":{"stack":["main()"],"host":[],"queue":[],"out":["start"]},"note":"Synchronous. Runs on your thread, prints immediately."},
    {"line":2,"panels":{"stack":["main()","setTimeout(...)"],"host":[],"queue":[],"out":["start"]},"note":"setTimeout is called. This function is NOT JavaScript — it is a door into the runtime."},
    {"line":2,"panels":{"stack":["main()"],"host":["timer: 1000ms counting..."],"queue":[],"out":["start"]},"note":"The runtime starts a timer on ITS thread and setTimeout returns at once. Your stack did not wait a single millisecond."},
    {"line":3,"panels":{"stack":["main()","fetch(...)"],"host":["timer: 1000ms counting..."],"queue":[],"out":["start"]},"note":"fetch is the same deal — a host API, not a language feature."},
    {"line":3,"panels":{"stack":["main()"],"host":["timer: 1000ms counting...","network: GET /api/user"],"queue":[],"out":["start"]},"note":"Now TWO jobs are genuinely running in parallel — on the runtime's threads, off yours. This is the parallelism people say JS does not have."},
    {"line":4,"panels":{"stack":["main()","log('end')"],"host":["timer: ~400ms left","network: GET /api/user"],"queue":[],"out":["start"]},"note":"Meanwhile your thread has moved on to line 4."},
    {"line":4,"panels":{"stack":["main()"],"host":["timer: ~400ms left","network: GET /api/user"],"queue":[],"out":["start","end"]},"note":"'end' prints long before either job is finished. Nothing blocked."},
    {"line":null,"panels":{"stack":[],"host":["timer: ~300ms left","network: GET /api/user"],"queue":[],"out":["start","end"]},"note":"The script is finished and the stack is EMPTY. Your thread is idle and available."},
    {"line":null,"panels":{"stack":[],"host":["network: GET /api/user"],"queue":["onTimer"],"out":["start","end"]},"note":"The timer expires. The runtime does NOT run onTimer — it may not touch your stack. It queues the callback."},
    {"line":null,"panels":{"stack":["onTimer()"],"host":["network: GET /api/user"],"queue":[],"out":["start","end"]},"note":"THE EVENT LOOP: stack empty + something queued = move it onto the stack. That single rule is the entire loop."},
    {"line":null,"panels":{"stack":[],"host":["network: GET /api/user"],"queue":[],"out":["start","end","timer done"]},"note":"onTimer runs to completion and pops. Still one thing at a time on your thread — just not in source order."},
    {"line":null,"panels":{"stack":[],"host":[],"queue":["onUser"],"out":["start","end","timer done"]},"note":"The response lands. Same story: queued, not run."},
    {"line":null,"panels":{"stack":["onUser()"],"host":[],"queue":[],"out":["start","end","timer done"]},"note":"Stack is empty, so the loop lets it in."},
    {"line":null,"panels":{"stack":[],"host":[],"queue":[],"out":["start","end","timer done","user loaded"]},"note":"Four things happened, two of them at the same time as each other — and your single thread never ran two lines at once."}
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

<figure>
  <svg
    viewBox="0 0 720 330"
    class="dg"
    role="img"
    aria-label="A loop diagram: the call stack hands work to runtime APIs on other threads, finished callbacks go into a queue, and the event loop moves them back onto the stack only when it is empty"
  >
    <g class="rough">
      <rect class="boxy" x="30" y="40" width="180" height="120" rx="10" />
      <rect class="boxg" x="500" y="40" width="190" height="120" rx="10" />
      <rect class="box" x="250" y="190" width="240" height="72" rx="10" />
    </g>
    <text class="lbl" x="46" y="68">YOUR THREAD</text>
    <text class="sm" x="46" y="92">the call stack</text>
    <text class="sm" x="46" y="112">one frame at a time</text>
    <text class="sm" x="46" y="140">run to completion</text>

    <text class="lbl" x="516" y="68">RUNTIME THREADS</text>
    <text class="sm" x="516" y="92">timers · network</text>
    <text class="sm" x="516" y="112">disk · DOM events</text>
    <text class="sm" x="516" y="140">genuinely parallel</text>

    <text class="lbl" x="268" y="216">CALLBACK QUEUE</text>
    <text class="sm" x="268" y="240">finished work, waiting its turn</text>

    <path class="lng" d="M214 76 L496 76" marker-end="url(#arrow-green)" />
    <text class="sm gr" x="258" y="66">hand off the slow job &rarr;</text>

    <path class="ln" d="M596 166 L540 196 L496 218" marker-end="url(#arrow)" />
    <text class="sm" x="596" y="214">done &rarr; queue it</text>

    <path class="lnr dash" d="M246 226 L140 226 L120 168" marker-end="url(#arrow-red)" />
    <text class="sm rd" x="30" y="292">event loop: moves one across, and only when the stack is EMPTY</text>
    <text class="sm" x="30" y="318">Nothing ever jumps the queue. A busy stack delays every callback behind it.</text>
  </svg>
  <figcaption>
    One thread, plus a runtime that is not shy about using several.
  </figcaption>
</figure>

<h3>The event loop, in one sentence</h3>
<p>
  <b>When the call stack is empty, take the next thing off the queue and
  push it on.</b> That is the whole loop. It cannot interrupt you, it
  cannot run two callbacks at once, and it never gets a turn while your
  code is still on the stack.
</p>
<p>
  One refinement matters from day one: there are two queues, not one.
  Promise reactions go into the <b>microtask queue</b>, timers and
  events into the <b>task queue</b>, and the loop drains microtasks
  <em>completely</em> before touching a single task. That is why a
  promise callback beats a <code>setTimeout(..., 0)</code> every time —
  there is a step-by-step demo of exactly that ordering back in
  <a href="/notes/setup-mental-model">Setup &amp; mental model</a>, and
  the full rules in
  <a href="/notes/async-properly">Async, properly</a>.
</p>

<h3>Two consequences that will bite you</h3>
<h4>setTimeout's delay is a minimum, not a promise</h4>
<p>
  <code>setTimeout(fn, 100)</code> means "not before 100ms". If the
  stack is busy at 100ms, your callback waits — the queue has no power
  to interrupt. Ask for 0 and you still do not get 0:
</p>
<div class="try">
  <pre><code>const t0 = Date.now();

<span class="c">// The timer expires in ~0ms. Remember when its callback actually runs.</span>
const waited = new Promise((resolve) =&gt; {
  setTimeout(() =&gt; resolve(Date.now() - t0), 0);
});

const stop = Date.now() + 300;
while (Date.now() &lt; stop) {}      <span class="c">// hog the thread for 300ms</span>

console.log("blocking done");
console.log("asked for 0ms, actually waited", await waited, "ms");</code></pre>
</div>
<p class="sub">
  The timer expired almost instantly. The callback still could not run
  for 300ms, because the stack was busy — and browsers additionally
  clamp nested timers to about 4ms, plus much harder throttling in
  background tabs.
</p>

<h4>You can starve the loop from the inside</h4>
<p>
  Because microtasks drain completely before anything else, a microtask
  that queues another microtask forever never gives the loop a chance to
  reach rendering or events. The tab freezes with its CPU pinned at
  100%, and no error is thrown:
</p>
<pre><code><span class="c">// Do not run this one. It freezes the tab.</span>
function spin() { Promise.resolve().then(spin); }
spin();</code></pre>
<p class="sub">
  A plain <code>setTimeout(spin, 0)</code> loop does not do this — tasks
  yield between turns, so rendering and clicks still get in. The
  difference between those two loops is the clearest test of whether
  someone actually understands the two queues.
</p>

<h3>When you really do need a second thread</h3>
<p>
  Async solves <em>waiting</em> — for a network, a disk, a timer. It
  does nothing for <em>work</em>. Wrapping a 3-second calculation in a
  promise does not move it off the thread; it still blocks for 3
  seconds, just with extra syntax.
</p>
<p>
  For actual computation there is a real answer: a
  <b>Web Worker</b> is a genuine second thread with its own stack and
  its own memory.
</p>
<pre><code><span class="c">// main.js — stays responsive the entire time</span>
const worker = new Worker("heavy.js");
worker.postMessage({ rows: 2_000_000 });
worker.onmessage = (e) =&gt; render(e.data);

<span class="c">// heavy.js — a separate thread. No document, no window.</span>
onmessage = (e) =&gt; postMessage(crunch(e.data));</code></pre>
<p>
  The catch is the same one the single-thread design was protecting you
  from: a worker <b>cannot touch the DOM</b>, and it does not share
  variables with you. You communicate by copying messages across. That
  restriction is not an oversight — it is what keeps the no-locks
  guarantee true. (This site's own code playground runs your exercises
  in a worker, which is why an infinite loop in an exercise does not
  freeze the page you are reading.)
</p>

<table>
  <tr>
    <th>Problem</th>
    <th>Reach for</th>
  </tr>
  <tr>
    <th>Waiting on network, disk, a timer, user input</th>
    <td>async — promises, <code>await</code>, callbacks</td>
  </tr>
  <tr>
    <th>Heavy computation: parsing, image work, crypto, big loops</th>
    <td>a Web Worker</td>
  </tr>
  <tr>
    <th>A long job that must touch the DOM</th>
    <td>split it into chunks and yield between them</td>
  </tr>
</table>

<div class="say">
  <span class="ttl">Say it like this &rarr;</span> "JavaScript runs on
  one thread, but it does not do the waiting. It hands slow jobs to the
  runtime, keeps running, and the event loop pushes each finished
  callback back onto the stack the moment the stack is free."
</div>

<h3>What to carry forward</h3>
<ul>
  <li>One thread, one stack. A stack trace is that stack, printed.</li>
  <li>
    One thread is the price of a lock-free DOM — and the reason nothing
    changes between two of your lines.
  </li>
  <li>
    Async is not parallel JavaScript. It is your thread delegating and
    collecting later.
  </li>
  <li>
    A callback cannot run until the stack is empty, so long functions
    delay everything — including rendering.
  </li>
  <li>Real parallelism for real work means a Worker.</li>
</ul>
`,
};
