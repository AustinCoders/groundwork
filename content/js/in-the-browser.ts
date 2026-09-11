import type { Chapter } from "../types";

export const inTheBrowser: Chapter = {
  id: "in-the-browser",
  num: "B4",
  title: "Inside the browser",
  short: "In the browser",
  levels: ["beginner"],
  practice: ["ex-script-order", "ex-frame-budget"],
  ready: true,
  subtitle: "From a script tag to pixels on screen — and where your code sits in that.",
  body: `<h3>The journey your file actually takes</h3>
<p>
  You write <code>app.js</code>. Somewhere between that and a button
  lighting up on screen, a lot happens that nobody shows you. Here is
  the whole route, and then each stop in turn.
</p>

<figure>
  <svg
    viewBox="0 0 720 350"
    class="dg"
    role="img"
    aria-label="A pipeline: HTML bytes become the DOM, CSS becomes the CSSOM, both combine into a render tree which goes through layout, paint and composite to become pixels, while JavaScript is compiled by the engine and can modify the DOM at any point"
  >
    <g class="rough">
      <rect class="box" x="24" y="30" width="150" height="54" rx="8" />
      <rect class="box" x="24" y="104" width="150" height="54" rx="8" />
      <rect class="boxy" x="24" y="212" width="190" height="64" rx="8" />
      <rect class="boxg" x="250" y="66" width="160" height="58" rx="8" />
      <rect class="boxg" x="470" y="66" width="220" height="58" rx="8" />
      <rect class="box" x="250" y="200" width="440" height="56" rx="8" />
    </g>
    <text class="lbl" x="40" y="62">HTML bytes</text>
    <text class="lbl" x="40" y="136">CSS bytes</text>
    <text class="lbl" x="40" y="242">your JS</text>
    <text class="sm" x="40" y="264">engine: parse &rarr; bytecode</text>

    <text class="lbl" x="266" y="92">DOM + CSSOM</text>
    <text class="sm" x="266" y="112">two trees, then merged</text>

    <text class="lbl" x="486" y="92">Render tree</text>
    <text class="sm" x="486" y="112">only what is actually visible</text>

    <text class="lbl" x="266" y="226">layout &rarr; paint &rarr; composite &rarr; PIXELS</text>
    <text class="sm" x="266" y="246">where it is · what colour · stitched together on the GPU</text>

    <path class="ln" d="M178 56 L244 84" marker-end="url(#arrow)" />
    <path class="ln" d="M178 130 L244 106" marker-end="url(#arrow)" />
    <path class="ln" d="M414 95 L464 95" marker-end="url(#arrow)" />
    <path class="ln" d="M600 128 L600 194" marker-end="url(#arrow)" />
    <path class="lnr dash" d="M200 210 L200 142 L246 114" marker-end="url(#arrow-red)" />
    <text class="sm rd" x="216" y="168">JS can rewrite the DOM &mdash; and often does</text>
    <text class="sm" x="24" y="310">Your JavaScript and the rendering work share one thread. They take turns; they never overlap.</text>
  </svg>
  <figcaption>
    Your code and the pixels it changes are queued on the same thread.
  </figcaption>
</figure>

<h3>Step 1 — the parser meets your script tag</h3>
<p>
  The browser reads HTML top to bottom, building the DOM as it goes.
  Then it hits a <code>&lt;script&gt;</code>, and by default it does
  something drastic: <b>it stops</b>. Parsing halts, the file is
  downloaded, the file is executed, and only then does HTML parsing
  resume.
</p>
<p>
  This is not an accident. A classic script is allowed to call
  <code>document.write</code> and inject markup at that exact position,
  so the browser cannot safely read ahead. One slow script in
  <code>&lt;head&gt;</code> means a blank page until it lands — no text,
  no layout, nothing.
</p>

<div class="demo">
  <div class="demo__bar">Page load — blocking vs defer vs async</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="pl-code"></div>
        <div class="loop-bar"><i id="pl-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="pl-prev" type="button">&larr; Back</button>
          <button class="btn" id="pl-next" type="button">Next step &rarr;</button>
          <button class="btn" id="pl-play" type="button">Play</button>
          <button class="btn btn--ghost" id="pl-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">HTML parser</div>
          <div id="pl-p-parser"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Downloading in the background</div>
          <div id="pl-p-net"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Running on the main thread</div>
          <div id="pl-p-run"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">What the user sees</div>
          <div id="pl-p-seen"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="pl-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "pl";
  var CODE = [
    "<head>",
    "  <script src='a.js'></" + "script>",
    "  <script src='b.js' defer></" + "script>",
    "  <script src='c.js' async></" + "script>",
    "</head>",
    "<body>",
    "  <h1>Hello</h1> ... 400 more lines ...",
    "</body>"
  ];
  var STEPS = [
    {"line":1,"panels":{"parser":["reading <head>"],"net":[],"run":[],"seen":["blank page"]},"note":"Parsing starts. Nothing is on screen yet."},
    {"line":2,"panels":{"parser":["STOPPED at a.js"],"net":["a.js downloading..."],"run":[],"seen":["blank page"]},"note":"A plain script blocks the parser. The browser will not read line 3 until a.js has downloaded AND run."},
    {"line":2,"panels":{"parser":["STOPPED at a.js"],"net":["b.js downloading...","c.js downloading..."],"run":["a.js executing"],"seen":["blank page"]},"note":"a.js runs. Note the browser DID peek ahead to start the other downloads — but it still will not parse ahead."},
    {"line":3,"panels":{"parser":["reading <head>"],"net":["b.js downloading...","c.js downloading..."],"run":[],"seen":["blank page"]},"note":"a.js finished, parsing resumes."},
    {"line":3,"panels":{"parser":["reading <head>"],"net":["b.js (defer) - will wait","c.js downloading..."],"run":[],"seen":["blank page"]},"note":"defer: download now, run LATER — after the whole document is parsed. The parser does not pause."},
    {"line":4,"panels":{"parser":["reading <head>"],"net":["b.js (defer) - will wait","c.js downloading..."],"run":[],"seen":["blank page"]},"note":"async: download now, run the INSTANT it arrives, whenever that is. Also does not pause the parser."},
    {"line":7,"panels":{"parser":["building <body>"],"net":["b.js (defer) - will wait","c.js downloading..."],"run":[],"seen":["Hello + content appearing"]},"note":"Now the page is finally painting, because the parser is free to do its job."},
    {"line":7,"panels":{"parser":["PAUSED - c.js arrived"],"net":["b.js (defer) - will wait"],"run":["c.js executing"],"seen":["Hello + content"]},"note":"c.js lands mid-parse and runs immediately, interrupting the parser. This is why async is unpredictable: it may run before or after the DOM it wants to touch exists."},
    {"line":8,"panels":{"parser":["done - DOM complete"],"net":["b.js (defer) - ready"],"run":[],"seen":["full page"]},"note":"Document parsed."},
    {"line":null,"panels":{"parser":["done"],"net":[],"run":["b.js executing"],"seen":["full page"]},"note":"Only now does the deferred script run. Multiple defers run in the order they were written — async scripts do not."},
    {"line":null,"panels":{"parser":["done"],"net":[],"run":["DOMContentLoaded fires"],"seen":["full page, interactive"]},"note":"DOMContentLoaded: HTML parsed and deferred scripts done. Images may still be loading - that is the later 'load' event."}
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
      em.textContent = "idle";
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
    }, 1400);
  });
  render();
})();
</script>

<table>
  <tr>
    <th></th>
    <th>plain</th>
    <th><code>defer</code></th>
    <th><code>async</code></th>
  </tr>
  <tr>
    <th>Blocks HTML parsing</th>
    <td class="tone-bad">yes</td>
    <td class="tone-yes">no</td>
    <td class="tone-warn">only while it executes</td>
  </tr>
  <tr>
    <th>Runs when</th>
    <td>immediately, in place</td>
    <td>after the DOM is parsed</td>
    <td>the moment it arrives</td>
  </tr>
  <tr>
    <th>Keeps source order</th>
    <td class="tone-yes">yes</td>
    <td class="tone-yes">yes</td>
    <td class="tone-bad">no — whoever lands first</td>
  </tr>
  <tr>
    <th>Can it see the whole DOM?</th>
    <td>only what is above it</td>
    <td class="tone-yes">yes, all of it</td>
    <td class="tone-bad">no guarantee</td>
  </tr>
  <tr>
    <th>Use it for</th>
    <td>almost nothing</td>
    <td>your app code</td>
    <td>independent scripts: analytics</td>
  </tr>
</table>
<p class="sub">
  <code>&lt;script type="module"&gt;</code> is deferred automatically —
  you get <code>defer</code> behaviour without asking. That is one more
  reason the module version is the sane default.
</p>

<div class="warn">
  <span class="ttl">&#9888; The classic "it's null!" bug</span>
  A plain script in <code>&lt;head&gt;</code> that calls
  <code>document.querySelector("#app")</code> gets <code>null</code> —
  not because the selector is wrong, but because the parser never
  reached that element. Move the tag to the end of
  <code>&lt;body&gt;</code>, add <code>defer</code>, or wait for
  <code>DOMContentLoaded</code>.
</div>

<h3>Step 2 — what the engine does with the file</h3>
<p>
  Your source is text. The CPU runs machine code. The engine (V8 in
  Chrome and Node, SpiderMonkey in Firefox, JavaScriptCore in Safari)
  closes that gap in stages:
</p>
<ol>
  <li>
    <b>Tokenise</b> — chop the text into meaningful pieces:
    <code>const</code>, <code>total</code>, <code>=</code>,
    <code>42</code>.
  </li>
  <li>
    <b>Parse into an AST</b> — an abstract syntax tree, the shape of
    your program as data. A syntax error is thrown here, before a single
    line runs, which is why one stray brace kills the entire file rather
    than just its own line.
  </li>
  <li>
    <b>Compile to bytecode</b> — compact instructions an interpreter
    executes right away. This is why JS starts fast instead of waiting
    on a full compile.
  </li>
  <li>
    <b>Watch, then optimise</b> — the engine counts how often each
    function runs. A function that runs constantly is "hot", so an
    optimising compiler rewrites it into real machine code, betting on
    the types it has seen so far.
  </li>
  <li>
    <b>Deoptimise when the bet fails</b> — feed a function that always
    got numbers a string, and the optimised version is thrown away and
    the engine falls back to bytecode.
  </li>
</ol>
<p>
  Two useful consequences at beginner level. First, <b>syntax errors are
  found before execution</b> — so a typo at the bottom of the file stops
  the top of it from running. Second, keeping a function's inputs the
  same shape is not folklore, it is what keeps the optimised version
  alive. The full story, plus how to see it happening, is in
  <a href="/notes/engine-memory">Engine &amp; memory</a>.
</p>

<div class="try">
  <pre><code>console.log("does this line run?");

<span class="c">// A syntax error further down — uncomment to see</span>
<span class="c">// const broken = ;</span>

console.log("parse succeeded, so both lines print");</code></pre>
</div>
<p class="sub">
  Remove the comment markers and run it again: the first log never
  appears. Nothing executed, because parsing never finished.
</p>

<h3>Step 3 — pixels, and the 16 millisecond budget</h3>
<p>
  Most screens redraw 60 times a second. That gives the browser about
  <b>16.7ms</b> to produce each frame — and your JavaScript shares that
  window, because it is the same thread. A frame is built in four
  stages:
</p>
<ul>
  <li>
    <b>Style</b> — which CSS rules apply to which element now.
  </li>
  <li>
    <b>Layout</b> (reflow) — the geometry: how big everything is and
    where it sits. Changing <code>width</code>, <code>top</code> or text
    content forces this, and it cascades to children.
  </li>
  <li>
    <b>Paint</b> — filling in pixels: colours, shadows, text.
  </li>
  <li>
    <b>Composite</b> — stitching the painted layers together, usually on
    the GPU. <code>transform</code> and <code>opacity</code> can often
    be done here alone, skipping layout and paint entirely — which is
    exactly why animating those two is smooth and animating
    <code>left</code> is not.
  </li>
</ul>
<p>
  Rendering only gets its turn when the stack is empty. So a function
  that takes 100ms does not "slow down" the animation — it deletes six
  frames outright.
</p>

<div class="demo">
  <div class="demo__bar">One long task, six dead frames</div>
  <div class="demo__body">
    <div class="viz"><div class="viz__row"><div class="viz__cells" id="fb-cells"></div></div></div>
    <div class="loop-bar"><i id="fb-bar"></i></div>
    <div class="demo__ctl">
      <button class="btn" id="fb-prev" type="button">&larr; Back</button>
      <button class="btn" id="fb-next" type="button">Next step &rarr;</button>
      <button class="btn" id="fb-play" type="button">Play</button>
      <button class="btn btn--ghost" id="fb-reset" type="button">Reset</button>
    </div>
    <p class="demo__note" id="fb-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "fb";
  function frames(states) {
    return states.map(function (s, idx) {
      return { v: String(idx + 1), c: s, p: s === "out" ? "x" : s === "hot" ? "js" : "" };
    });
  }
  var STEPS = [
    {"cells":frames(["","","","","","","","","",""]),"note":"Ten frames of a smooth animation. Each one has 16.7ms to be built."},
    {"cells":frames(["done","","","","","","","","",""]),"note":"Frame 1: a little JS runs, then style, layout, paint, composite - all inside the budget."},
    {"cells":frames(["done","done","","","","","","","",""]),"note":"Frame 2: same again. This is what 60fps feels like."},
    {"cells":frames(["done","done","hot","","","","","","",""]),"note":"Frame 3: a click handler starts sorting 50,000 rows. It needs 100ms."},
    {"cells":frames(["done","done","hot","out","","","","","",""]),"note":"Frame 4 was due. The stack is still busy, so the browser cannot render. The frame is not late - it never exists."},
    {"cells":frames(["done","done","hot","out","out","out","","","",""]),"note":"Frames 5 and 6 gone too. On screen this reads as the page freezing."},
    {"cells":frames(["done","done","hot","out","out","out","out","out","",""]),"note":"Eight frames in, still running. Clicks during this window are queued, not lost - they all fire at the end, at once."},
    {"cells":frames(["done","done","hot","out","out","out","out","out","done",""]),"note":"The handler finally returns. Rendering resumes and the UI jumps to its new state instead of animating to it."},
    {"cells":frames(["done","done","done","done","done","done","done","done","done","done"]),"note":"The fix is never 'make it async' - a promise around the same 100ms still blocks. Split the work into chunks under ~5ms and yield between them, or move it to a Worker."}
  ];
  var cellsEl = document.getElementById(ID + "-cells");
  if (!cellsEl) return;
  if (cellsEl.dataset.demoInit) return;
  cellsEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
  var noteEl = document.getElementById(ID + "-note");
  var nextBtn = document.getElementById(ID + "-next");
  var prevBtn = document.getElementById(ID + "-prev");
  var playBtn = document.getElementById(ID + "-play");
  var resetBtn = document.getElementById(ID + "-reset");
  var i = 0, timer = null;

  function render() {
    var s = STEPS[i];
    cellsEl.innerHTML = "";
    s.cells.forEach(function (c) {
      var d = document.createElement("div");
      d.className = "viz__cell" + (c.c ? " viz__cell--" + c.c : "");
      d.appendChild(document.createTextNode(c.v));
      var lab = document.createElement("i");
      lab.textContent = c.p || "";
      d.appendChild(lab);
      cellsEl.appendChild(d);
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

<h3>Where the event loop fits in a frame</h3>
<p>
  Put the last chapter and this one together and the browser's turn
  order becomes concrete. Per pass, roughly:
</p>
<ol>
  <li>run one task from the queue — a timer, a click handler, a network callback</li>
  <li>drain every microtask queued by it, completely</li>
  <li>
    run <code>requestAnimationFrame</code> callbacks — the moment
    designed for "change something visual"
  </li>
  <li>style, layout, paint, composite — if there is time before the next frame</li>
</ol>
<p>
  Two practical rules fall out of that list.
  <code>requestAnimationFrame</code> is where visual updates belong,
  because it runs immediately before rendering rather than at some
  arbitrary point mid-frame. And reading a geometric property like
  <code>offsetHeight</code> right after writing a style forces the
  browser to run layout <em>early</em>, in the middle of your loop, to
  answer you honestly — do that inside a loop over 200 elements and you
  have written the classic layout thrash.
</p>
<pre><code><span class="c">// Thrashing: read, write, read, write - a forced layout each pass</span>
for (const box of boxes) {
  box.style.height = box.offsetHeight + 10 + "px";
}

<span class="c">// Batched: all reads, then all writes - one layout</span>
const heights = boxes.map((b) =&gt; b.offsetHeight);
boxes.forEach((b, i) =&gt; { b.style.height = heights[i] + 10 + "px"; });</code></pre>

<h3>The events that tell you the page is ready</h3>
<table>
  <tr>
    <th>Event</th>
    <th>Fires when</th>
    <th>Use it for</th>
  </tr>
  <tr>
    <th><code>DOMContentLoaded</code></th>
    <td>HTML parsed, deferred scripts done. Images may still be coming.</td>
    <td>almost everything — finding elements, wiring listeners</td>
  </tr>
  <tr>
    <th><code>load</code></th>
    <td>every image, stylesheet and iframe has finished</td>
    <td>measuring images, final-size layout work</td>
  </tr>
  <tr>
    <th><code>beforeunload</code></th>
    <td>the user is leaving</td>
    <td>"you have unsaved changes" — sparingly</td>
  </tr>
</table>
<p class="sub">
  If your script is deferred or sits at the end of
  <code>&lt;body&gt;</code>, you usually need neither. The DOM is
  already there.
</p>

<h3>Seeing it for yourself</h3>
<p>
  None of this is theoretical — the browser will show you every stage.
  In DevTools, the <b>Network</b> panel shows which script blocked the
  parser, and the <b>Performance</b> panel records a real load: a flame
  chart of the call stack over time, long tasks flagged in red, and the
  layout/paint work in between. Record five seconds of your own page and
  the pipeline in this chapter appears, labelled, in front of you.
</p>

<div class="say">
  <span class="ttl">Say it like this &rarr;</span> "The browser parses
  HTML into a DOM, and stops dead at every plain script tag. The engine
  turns my code into bytecode and optimises what runs hot. Then
  rendering and my JavaScript take turns on one thread, sixty times a
  second — so a long function does not slow the page down, it skips
  frames."
</div>

<h3>What to carry forward</h3>
<ul>
  <li>
    <code>defer</code> (or a module) for your own scripts;
    <code>async</code> only for things that do not touch your DOM.
  </li>
  <li>
    Syntax errors are found at parse time, before anything runs.
  </li>
  <li>
    16.7ms per frame, shared with your code. Over ~50ms in one function
    and users feel it.
  </li>
  <li>
    Animate <code>transform</code> and <code>opacity</code>; they can
    skip layout and paint.
  </li>
  <li>
    Batch DOM reads and writes instead of alternating them.
  </li>
</ul>
`,
};
