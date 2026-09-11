import type { Chapter } from "../types";

export const closures: Chapter = {
  id: "closures",
  num: "B11",
  title: "Closures",
  short: "Closures",
  levels: ["beginner"],
  practice: ["ex-closure-counter", "ex-once"],
  ready: true,
  subtitle: "The function that walked out with its birthplace still attached.",
  body: `<h3>Nothing gets turned on</h3>
<p>
  A closure is not syntax you write. It is what you already have. Every
  function, the moment it is created, keeps a link to the environment it
  was created in — that is just
  <a href="/notes/execution-context">the outer reference</a> from the
  execution context chapter, sitting there doing nothing interesting.
</p>
<p>
  It only becomes <em>visible</em> when the function outlives the call
  that made it. Then the link is the only thing keeping that environment
  alive, and suddenly everyone has a name for it.
</p>

<pre><code>function makeCounter() {
  let count = 0;                  <span class="c">// a local. Should die when makeCounter returns.</span>
  return () =&gt; ++count;           <span class="c">// but this little function still points at it</span>
}

const next = makeCounter();
next();   <span class="c">// 1</span>
next();   <span class="c">// 2  — count outlived the call that created it</span></code></pre>

<h3>Watch it happen in space</h3>
<p>
  The flat version of this picture is what causes the confusion — it
  looks like <code>count</code> gets copied into the function. It does
  not. Drag the scene, or use the sliders, and step through: the call
  frame goes away, the <em>environment</em> stays, because something in
  front of it is still holding on.
</p>

<div class="demo">
  <div class="demo__bar">A closure, in three dimensions</div>
  <div class="demo__body">
    <div class="c3d" id="cl-3d">
      <div class="c3d__stage" id="cl-stage">
        <div class="c3d__plane" id="cl-global">
          <div class="c3d__ttl">Global environment</div>
          <div class="c3d__rows" id="cl-global-rows">makeCounter = fn</div>
        </div>
        <div class="c3d__plane" id="cl-env">
          <div class="c3d__ttl" id="cl-env-ttl">makeCounter() environment</div>
          <div class="c3d__rows" id="cl-env-rows">count = 0</div>
          <div class="c3d__badge" id="cl-env-badge" hidden>still reachable</div>
        </div>
        <div class="c3d__plane" id="cl-env2">
          <div class="c3d__ttl">a second environment</div>
          <div class="c3d__rows" id="cl-env2-rows">count = 0</div>
        </div>
        <div class="c3d__plane" id="cl-fn">
          <div class="c3d__ttl" id="cl-fn-ttl">next() — the returned function</div>
          <div class="c3d__rows" id="cl-fn-rows">code + a link back</div>
        </div>
        <div class="c3d__link" id="cl-link"></div>
      </div>
      <div class="c3d__hint">drag to rotate</div>
    </div>
    <div class="c3d-ctl">
      <label>tilt <input type="range" id="cl-rx" min="-10" max="45" value="14" aria-label="Tilt the scene up and down" /></label>
      <label>turn <input type="range" id="cl-ry" min="-65" max="35" value="-28" aria-label="Turn the scene left and right" /></label>
    </div>
    <div class="loop-bar"><i id="cl-bar"></i></div>
    <div class="demo__ctl">
      <button class="btn" id="cl-prev" type="button">&larr; Back</button>
      <button class="btn" id="cl-next" type="button">Next step &rarr;</button>
      <button class="btn" id="cl-play" type="button">Play</button>
      <button class="btn btn--ghost" id="cl-reset" type="button">Reset</button>
    </div>
    <p class="demo__note" id="cl-note"></p>
  </div>
</div>

<script>
(function () {
  var stage = document.getElementById("cl-stage");
  if (!stage) return;
  if (stage.dataset.demoInit) return;
  stage.dataset.demoInit = "1";

  var PLANES = { global: "cl-global", env: "cl-env", env2: "cl-env2", fn: "cl-fn" };
  var POS = {
    global: { x: -34, y: -150, z: -185 },
    env: { x: -6, y: 6, z: 0 },
    env2: { x: 236, y: 6, z: 0 },
    fn: { x: 22, y: 158, z: 185 }
  };

  var STEPS = [
    {
      show: { global: "" },
      note: "Only the global environment exists. makeCounter is a name in it, nothing more.",
      env: null, link: false
    },
    {
      show: { global: "", env: "is-hot" },
      envTtl: "makeCounter() — running",
      envRows: "count = 0",
      note: "makeCounter() is called. A fresh environment is built for this one call, holding its own count.",
      link: false
    },
    {
      show: { global: "", env: "is-hot", fn: "" },
      envTtl: "makeCounter() — running",
      envRows: "count = 0",
      note: "It creates the arrow function and returns it. The function is born here, so it carries a link back to this environment.",
      link: true
    },
    {
      show: { global: "", env: "is-kept", fn: "" },
      envTtl: "makeCounter() environment",
      envRows: "count = 0",
      badge: true,
      note: "THE MOMENT THAT MATTERS. makeCounter has returned, so its call frame is gone from the stack. The environment is not: the returned function still points at it, so the garbage collector cannot touch it.",
      link: true
    },
    {
      show: { global: "", env: "is-kept", fn: "is-hot" },
      envTtl: "makeCounter() environment",
      envRows: "count = 1",
      badge: true,
      note: "next() runs. It follows its link back and increments the same count that has been sitting there the whole time.",
      link: true
    },
    {
      show: { global: "", env: "is-kept", fn: "is-hot" },
      envTtl: "makeCounter() environment",
      envRows: "count = 2",
      badge: true,
      note: "Again. There is no copy anywhere — one box, mutated in place, reachable only through that function.",
      link: true
    },
    {
      show: { global: "", env: "is-kept", fn: "", env2: "" },
      envTtl: "the first environment",
      envRows: "count = 2",
      badge: true,
      note: "Call makeCounter() a second time and you get a SECOND environment, with its own count at 0. A closure belongs to a call, never to the function definition.",
      link: true
    }
  ];

  var i = 0, timer = null, rx = 14, ry = -28;
  var noteEl = document.getElementById("cl-note");
  var barEl = document.getElementById("cl-bar");
  var linkEl = document.getElementById("cl-link");
  var badgeEl = document.getElementById("cl-env-badge");
  var envTtl = document.getElementById("cl-env-ttl");
  var envRows = document.getElementById("cl-env-rows");
  var nextBtn = document.getElementById("cl-next");
  var prevBtn = document.getElementById("cl-prev");
  var playBtn = document.getElementById("cl-play");
  var resetBtn = document.getElementById("cl-reset");
  var rxEl = document.getElementById("cl-rx");
  var ryEl = document.getElementById("cl-ry");

  // On a narrow screen the stage is scaled down but the second environment
  // still reaches past the frame, so pull it in.
  if (window.matchMedia && window.matchMedia("(max-width: 620px)").matches) {
    POS.env2.x = 118;
  }

  Object.keys(PLANES).forEach(function (key) {
    var el = document.getElementById(PLANES[key]);
    var p = POS[key];
    el.style.setProperty("--x", p.x + "px");
    el.style.setProperty("--y", p.y + "px");
    el.style.setProperty("--z", p.z + "px");
  });
  linkEl.style.setProperty("--len", (POS.fn.z - POS.env.z) + "px");
  linkEl.style.setProperty("--x", Math.round((POS.fn.x + POS.env.x) / 2) + "px");
  linkEl.style.setProperty("--y", Math.round((POS.fn.y + POS.env.y) / 2) + "px");
  linkEl.style.setProperty("--z", Math.round((POS.fn.z + POS.env.z) / 2) + "px");

  function applyRotation() {
    stage.style.setProperty("--rx", rx + "deg");
    stage.style.setProperty("--ry", ry + "deg");
  }

  function render() {
    var s = STEPS[i];
    Object.keys(PLANES).forEach(function (key) {
      var el = document.getElementById(PLANES[key]);
      var cls = s.show[key];
      el.className = "c3d__plane" + (cls === undefined ? "" : " is-on " + cls);
    });
    if (s.envTtl) envTtl.textContent = s.envTtl;
    if (s.envRows) envRows.textContent = s.envRows;
    badgeEl.hidden = !s.badge;
    linkEl.className = "c3d__link" + (s.link ? " is-on" : "");
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
    }, 1900);
  });

  rxEl.addEventListener("input", function () { rx = Number(rxEl.value); applyRotation(); });
  ryEl.addEventListener("input", function () { ry = Number(ryEl.value); applyRotation(); });

  var dragging = false, lastX = 0, lastY = 0;
  var surface = document.getElementById("cl-3d");
  surface.addEventListener("pointerdown", function (e) {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    surface.setPointerCapture(e.pointerId);
  });
  surface.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    ry = Math.max(-65, Math.min(35, ry + (e.clientX - lastX) * 0.4));
    rx = Math.max(-10, Math.min(45, rx - (e.clientY - lastY) * 0.4));
    lastX = e.clientX; lastY = e.clientY;
    rxEl.value = String(Math.round(rx));
    ryEl.value = String(Math.round(ry));
    applyRotation();
  });
  surface.addEventListener("pointerup", function () { dragging = false; });
  surface.addEventListener("pointercancel", function () { dragging = false; });

  applyRotation();
  render();
})();
</script>

<h3>Why the variable survives at all</h3>
<p>
  In <a href="/notes/execution-context">the execution context chapter</a> you learned that a call gets an execution context,
  and that the context leaves the stack when the call finishes. That is
  still true — of the <b>stack frame</b>. The frame is bookkeeping: where
  to return to, what is running. It pops.
</p>
<p>
  The <b>environment</b> — the box holding the actual variables — lives
  somewhere else, on the heap, and it follows one rule only:
</p>
<div class="sticky mint">
  <span class="ttl">Rule</span> JavaScript keeps anything that is still
  <b>reachable</b>. A closure is a reference, and a reference is
  reachability. There is no special "closure keep-alive" mechanism — the
  ordinary garbage collector simply cannot collect a box that something
  still points at.
</div>
<p class="sub">
  Which is why closures are not free, and why the memory section below
  is not an afterthought.
</p>

<h3>A live link, not a snapshot</h3>
<p>
  The most common wrong mental model is that the inner function copies
  the values it needs. Two functions made in the same call share one
  environment, and that settles it:
</p>
<div class="try">
  <pre><code>function makeBox() {
  let value = "first";
  return {
    read: () =&gt; value,
    write: (v) =&gt; { value = v; },
  };
}

const box = makeBox();
console.log(box.read());     <span class="c">// "first"</span>
box.write("second");
console.log(box.read());     <span class="c">// a copy would still say "first"</span></code></pre>
</div>
<p class="sub">
  <code>"second"</code>. <code>read</code> and <code>write</code> are
  two different functions closing over the <em>same</em> box, so a
  change made through one is visible through the other. If closures
  copied values, that would be impossible.
</p>

<h3>One call, one closure</h3>
<div class="try">
  <pre><code>function makeCounter() {
  let count = 0;
  return () =&gt; ++count;
}

const a = makeCounter();
const b = makeCounter();

a(); a(); a();
b();

console.log("a:", a(), " b:", b());   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>a: 4  b: 2</code>. Two calls, two environments, two completely
  separate counts. The closure belongs to the <em>call</em>, never to
  the function you wrote — which is exactly what the last step of the 3D
  scene was showing.
</p>

<h3>Five real jobs closures do</h3>
<p>
  Interviews rarely ask "what is a closure". They ask you to build one
  of these.
</p>

<h4>1. Factories — functions that build functions</h4>
<pre><code>function multiplierOf(factor) {
  return (n) =&gt; n * factor;
}

const double = multiplierOf(2);
const triple = multiplierOf(3);
double(5);   <span class="c">// 10 — "factor" is remembered inside double, permanently</span></code></pre>

<h4>2. Privacy — state no outside code can reach</h4>
<pre><code>function createAccount(startingBalance) {
  let balance = startingBalance;    <span class="c">// truly private — no this.balance to poke at</span>
  return {
    deposit: (n) =&gt; (balance += n),
    getBalance: () =&gt; balance,
  };
}

const acct = createAccount(100);
acct.deposit(50);
acct.getBalance();     <span class="c">// 150</span>
acct.balance;          <span class="c">// undefined — there is no way in</span></code></pre>
<p class="sub">
  This is the oldest privacy mechanism in JavaScript, and still the
  simplest. Classes got a real one in ES2022 —
  <code>#private</code> fields — but a closure needs no syntax at all.
</p>

<h4>3. Memoize — a cache only the function can see</h4>
<div class="try">
  <pre><code>function memoize(fn) {
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
  <code>1</code> — the underlying function runs once per distinct set of
  arguments. <code>cache</code> is closed over by the returned function
  and nothing else, so no outside code can reach or corrupt it.
</p>

<h4>4. Once — work that happens a single time</h4>
<div class="try">
  <pre><code>function once(fn) {
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
  the first returns the cached result without re-running
  <code>fn</code> — the standard shape behind "run this setup exactly
  once, however many times it is asked for."
</p>

<h4>5. Debounce and throttle — a timer nobody outside can see</h4>
<pre><code>function debounce(fn, delay) {
  let timer;                        <span class="c">// private to the returned function</span>
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
  <span class="ttl">Rule</span> Debounce waits for a pause and runs once
  at the end — a search box waiting until they stop typing. Throttle
  runs immediately, then enforces a cooldown — a scroll handler firing
  at most once every N ms, the whole time they scroll.
</div>

<h3>The loop trap, from the closure side</h3>
<p>
  <a href="/notes/var-let-const">The var, let and const chapter</a>
  showed this as a question about how many bindings a loop creates. From
  here it is the same fact, viewed from the other end: all three
  callbacks closed over <em>the same environment</em>, so they all read
  the same box — and by the time any of them ran, the loop had finished
  writing to it.
</p>
<pre><code>for (var i = 0; i &lt; 3; i++) setTimeout(() =&gt; console.log(i), 0);   <span class="c">// 3 3 3</span>
for (let j = 0; j &lt; 3; j++) setTimeout(() =&gt; console.log(j), 0);   <span class="c">// 0 1 2</span></code></pre>
<p class="sub">
  One shared box versus a fresh box per iteration. Nothing about the
  callbacks changed.
</p>

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

<h3>Closures and memory — the part that bites in production</h3>
<p>
  A closure is a reference, and a reference stops collection. Almost
  every JavaScript memory leak is a closure that outlived its usefulness
  while still holding something large.
</p>
<pre><code><span class="c">// The listener never gets removed, so the closure lives forever —
// and it is holding a reference to a huge object it barely uses.</span>
function attach(node, hugeDataset) {
  node.addEventListener("click", () =&gt; {
    console.log("clicked", hugeDataset.length);   <span class="c">// keeps hugeDataset alive</span>
  });
}

<span class="c">// Same shape, worse: an interval no one clears keeps its closure,
// its closure keeps the node, and the node may already be off the page.</span>
setInterval(() =&gt; update(detachedNode), 1000);</code></pre>
<ul>
  <li>
    <b>Remove listeners</b> when the thing they belong to goes away, or
    use an <code>AbortController</code> signal to drop them all at once.
  </li>
  <li>
    <b>Clear intervals and timeouts.</b> An uncleared interval is an
    immortal closure.
  </li>
  <li>
    <b>Do not close over more than you need.</b> Pull out the one field
    you actually use rather than capturing the whole object.
  </li>
</ul>
<p class="sub">
  Engines are smarter than the naive model: V8 captures only the
  variables a closure actually mentions, not the entire scope. But the
  ones it does capture are held completely — capture one field of a
  10MB object and you keep the field, capture the object and you keep
  all 10MB. <a href="/notes/engine-memory">Engine &amp; memory</a> has
  the heap snapshots that let you see which.
</p>

<h3>Seeing one for yourself</h3>
<p>
  This is not a metaphor you have to take on faith. Put a
  <code>debugger</code> statement inside a returned function, run it,
  and open the <b>Scope</b> panel in DevTools: alongside
  <code>Local</code> and <code>Global</code> there will be an entry
  labelled <code>Closure (makeCounter)</code>, with the retained
  variables listed inside it — the middle plane of the 3D scene, printed
  as a tree.
</p>

<h3>The traps, collected</h3>
<ul>
  <li>
    <b>Expecting a snapshot.</b> The closure reads the variable when it
    runs, not when it was created.
  </li>
  <li>
    <b>Sharing an environment by accident.</b> Two functions from the
    same call share state — sometimes what you want, sometimes a bug.
  </li>
  <li>
    <b>Assuming a new closure per loop iteration.</b> Only
    <code>let</code> and <code>const</code> give you that.
  </li>
  <li>
    <b>Leaking through listeners and intervals.</b> The closure cannot
    be collected while the subscription is alive.
  </li>
  <li>
    <b>Thinking it is rare.</b> Every callback, every event handler,
    every module is a closure. It is the default, not the exception.
  </li>
</ul>

<div class="say">
  <span class="ttl">Say it like this &rarr;</span> "A function keeps a
  link to the environment it was created in. When the function outlives
  the call, that environment cannot be collected — so the variable is
  still there, still live, and still shared with anything else created
  in the same call."
</div>
`,
};
