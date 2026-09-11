import type { Chapter } from "../types";

export const basicAsync: Chapter = {
  id: "basic-async",
  num: "B13",
  title: "Callbacks, then promises",
  short: "Callbacks & promises",
  levels: ["beginner"],
  practice: ["ex-delayed-double", "ex-promise-chain", "ex-json-roundtrip"],
  ready: true,
  subtitle: "Handing work to someone else, and getting the answer back later.",
  body: `<p>
  You already know <em>why</em> slow work gets handed off: one thread,
  and the runtime does the waiting —
  <a href="/notes/single-thread">the single-thread chapter</a> covered
  the machine. This chapter is the other half: the two shapes your code
  takes when it has to collect the answer afterwards. Callbacks came
  first, promises replaced them, and every promise is still a callback
  underneath.
</p>

<h3>A callback is just a function you hand over</h3>
<p>
  There is nothing asynchronous about a callback by itself. It is a
  function passed to other code so <em>that</em> code can call it. You
  have been writing them since arrays:
</p>
<pre><code>[1, 2, 3].forEach(function (n) { console.log(n); });
<span class="c">//               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ a callback. forEach calls it, three times, immediately.</span></code></pre>
<p>
  That one is <b>synchronous</b> — it runs and finishes before the next
  line. The interesting case is when the code you handed it to does not
  call it now, but keeps it for later:
</p>
<pre><code>setTimeout(function () { console.log("later"); }, 1000);
<span class="c">//         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ same idea, parked for a second</span></code></pre>
<p class="sub">
  Same mechanism, different timing. "Callback hell" and promises are not
  about the function-passing part — that part is fine. They are about
  what happens when you need <em>several</em> of the parked kind, in
  order.
</p>

<h3>setTimeout and setInterval — your first parked callbacks</h3>
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
  which could be much later if the thread is busy. A timer can never
  interrupt code that is already running.
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
  Run it — three ticks, then silence. (The <code>await</code> is only so
  this sandbox waits for all three before calling the run finished.)
  Forgetting <code>clearInterval</code> in real code is a common memory
  leak: the interval holds on to everything its callback closes over,
  forever, long after the UI it was updating is gone.
</p>

<h3>The callback shape that Node made standard</h3>
<p>
  A parked callback has a problem a synchronous one does not: if the
  work fails, there is nobody left to <code>throw</code> at. The
  function that started it has already returned. So the error has to be
  passed <em>in</em>, and the convention became
  <b>error-first</b> — the callback's first parameter is either an error
  or <code>null</code>.
</p>
<pre><code>function readConfig(callback) {
  fs.readFile("config.json", (err, data) =&gt; {
    if (err) return callback(err);          <span class="c">// error path checked FIRST, always</span>
    callback(null, JSON.parse(data));
  });
}</code></pre>

<h3>Callback hell is not about indentation</h3>
<p>
  The staircase everyone complains about shows up the moment one async
  step needs the result of the last:
</p>
<pre><code>getUser(id, (err, user) =&gt; {
  if (err) return handleError(err);
  getOrders(user.id, (err, orders) =&gt; {
    if (err) return handleError(err);
    getInvoice(orders[0].id, (err, invoice) =&gt; {
      if (err) return handleError(err);
      render(invoice);        <span class="c">// four levels deep and still growing sideways</span>
    });
  });
});</code></pre>
<p>
  The indentation is the symptom. The actual problems are three, and
  promises were designed to fix exactly these:
</p>
<ul>
  <li>
    <b>Error handling repeats at every level.</b> Miss one
    <code>if (err)</code> and the failure vanishes silently.
  </li>
  <li>
    <b><code>try/catch</code> does not work.</b> By the time the
    callback runs, the <code>try</code> block around it has long since
    finished — there is no stack frame left to catch anything.
  </li>
  <li>
    <b>You cannot <code>return</code> a result.</b> The value has to be
    handed deeper inwards instead of back out, so nothing composes.
  </li>
</ul>

<div class="try">
  <pre><code>function later(value, cb) { setTimeout(() =&gt; cb(value), 10); }

try {
  later("hi", (v) =&gt; {
    throw new Error("thrown inside the callback");
  });
} catch (e) {
  console.log("caught it:", e.message);      <span class="c">// does this run?</span>
}

console.log("try/catch finished");

await new Promise((r) =&gt; setTimeout(r, 50));   <span class="c">// hang around long enough for the throw</span></code></pre>
</div>
<p class="sub">
  Run it. "try/catch finished" prints and the <code>catch</code> never
  does — the throw happens 10ms later, on a completely empty stack, with
  the <code>try</code> long gone. The error escapes as an uncaught
  error instead. This is the single strongest argument for promises.
</p>

<h3>A promise is an object for a value that isn't here yet</h3>
<p>
  Instead of handing your function <em>in</em> and hoping, you get an
  object back <em>now</em> that stands for the eventual result. You
  attach your reaction to that object. It has exactly three states:
</p>
<table>
  <tr>
    <th>State</th>
    <th>Meaning</th>
    <th>Can it change again?</th>
  </tr>
  <tr>
    <th><code>pending</code></th>
    <td>not settled yet</td>
    <td>yes — once, to fulfilled or rejected</td>
  </tr>
  <tr>
    <th><code>fulfilled</code></th>
    <td>succeeded, and has a value</td>
    <td class="tone-no">no — permanent</td>
  </tr>
  <tr>
    <th><code>rejected</code></th>
    <td>failed, and has a reason</td>
    <td class="tone-no">no — permanent</td>
  </tr>
</table>
<p>
  <b>Settled</b> means fulfilled or rejected — either way, finished
  forever. That permanence is the whole point: a promise is a
  <em>record</em> of an outcome, not an event you can miss. Attach a
  <code>.then()</code> an hour late and it still fires, with the same
  value.
</p>

<div class="demo">
  <div class="demo__bar">The life of one promise</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="pr-code"></div>
        <div class="loop-bar"><i id="pr-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="pr-prev" type="button">&larr; Back</button>
          <button class="btn" id="pr-next" type="button">Next step &rarr;</button>
          <button class="btn" id="pr-play" type="button">Play</button>
          <button class="btn btn--ghost" id="pr-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Promise state</div>
          <div id="pr-p-state"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Reactions registered on it</div>
          <div id="pr-p-cbs"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Microtask queue</div>
          <div id="pr-p-micro"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Console</div>
          <div id="pr-p-out"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="pr-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "pr";
  var CODE = [
    "const p = new Promise((resolve) => {",
    "  setTimeout(() => resolve('data'), 100);",
    "});",
    "",
    "p.then((v) => console.log('got', v));",
    "console.log('after');",
    "",
    "// later, on the same promise:",
    "p.then((v) => console.log('late', v));"
  ];
  var STEPS = [
    {"line":null,"panels":{"state":[],"cbs":[],"micro":[],"out":[]},"note":"One promise, from birth to settled. Watch where the callbacks actually go."},
    {"line":1,"panels":{"state":["pending"],"cbs":[],"micro":[],"out":[]},"note":"new Promise runs its executor function IMMEDIATELY and synchronously. The promise itself starts pending."},
    {"line":2,"panels":{"state":["pending"],"cbs":[],"micro":[],"out":[]},"note":"The executor hands a timer to the runtime and returns. Nothing is waiting on your thread."},
    {"line":5,"panels":{"state":["pending"],"cbs":["(v) => log('got', v)"],"micro":[],"out":[]},"note":".then does NOT run your function. It registers it on the promise, to be used if and when it settles."},
    {"line":6,"panels":{"state":["pending"],"cbs":["(v) => log('got', v)"],"micro":[],"out":["after"]},"note":"Synchronous code keeps going and finishes first — as always."},
    {"line":null,"panels":{"state":["pending"],"cbs":["(v) => log('got', v)"],"micro":[],"out":["after"]},"note":"Stack empty. The timer is still counting down off-thread."},
    {"line":2,"panels":{"state":["FULFILLED  value: 'data'"],"cbs":["(v) => log('got', v)"],"micro":[],"out":["after"]},"note":"The timer fires and calls resolve('data'). The promise transitions once, and that is permanent."},
    {"line":null,"panels":{"state":["FULFILLED  value: 'data'"],"cbs":[],"micro":["(v) => log('got', v)"],"out":["after"]},"note":"Settling does not run the reactions directly — it moves them to the MICROTASK queue. Even an already-resolved promise never calls back synchronously."},
    {"line":null,"panels":{"state":["FULFILLED  value: 'data'"],"cbs":[],"micro":[],"out":["after","got data"]},"note":"The event loop drains the microtask and your callback finally runs."},
    {"line":9,"panels":{"state":["FULFILLED  value: 'data'"],"cbs":[],"micro":["(v) => log('late', v)"],"out":["after","got data"]},"note":"A .then attached AFTER it already settled still fires — queued right away with the stored value. A promise is a record, not an event you can miss."},
    {"line":null,"panels":{"state":["FULFILLED  value: 'data'  (calling resolve again does nothing)"],"cbs":[],"micro":[],"out":["after","got data","late data"]},"note":"And that is it. A second resolve() or a reject() after this point is silently ignored — settled is settled."}
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
    }, 1400);
  });
  render();
})();
</script>

<h3>Making one yourself</h3>
<pre><code>const wait = (ms) =&gt;
  new Promise((resolve, reject) =&gt; {
    if (ms &lt; 0) return reject(new Error("negative delay"));
    setTimeout(() =&gt; resolve("waited " + ms + "ms"), ms);
  });

wait(100).then((msg) =&gt; console.log(msg));</code></pre>
<p class="sub">
  You will write <code>new Promise</code> far less often than you think
  — almost everything already hands you one. It is for wrapping the old
  callback-style APIs that do not, like <code>setTimeout</code> above.
  Wrapping something that <em>already</em> returns a promise is a
  well-known anti-pattern with a name: the explicit promise
  construction antipattern.
</p>

<h3>Chaining, and the one rule that governs it</h3>
<p>
  <code>.then()</code> always returns a <b>new</b> promise. What that
  new promise settles with depends entirely on what your callback
  returned — this table is the whole of promise chaining:
</p>
<table>
  <tr>
    <th>Your <code>.then</code> callback returns</th>
    <th>The next <code>.then</code> receives</th>
  </tr>
  <tr>
    <th>a plain value</th>
    <td>that value</td>
  </tr>
  <tr>
    <th>another promise</th>
    <td>waits for it, then <em>its</em> value — chains stay flat</td>
  </tr>
  <tr>
    <th>nothing</th>
    <td class="tone-warn"><code>undefined</code> — the classic "why is it undefined" bug</td>
  </tr>
  <tr>
    <th>throws</th>
    <td class="tone-bad">skipped — control jumps to the next <code>.catch</code></td>
  </tr>
</table>

<div class="try">
  <pre><code>await Promise.resolve(2)
  .then((n) =&gt; n * 10)                                  <span class="c">// plain value</span>
  .then((n) =&gt; new Promise((r) =&gt; setTimeout(() =&gt; r(n + 5), 20)))  <span class="c">// a promise — flattened</span>
  .then((n) =&gt; { console.log("got", n); })              <span class="c">// returns nothing...</span>
  .then((n) =&gt; console.log("and now", n))               <span class="c">// ...so this gets undefined</span>
  .catch((e) =&gt; console.log("never reached"));</code></pre>
</div>
<p class="sub">
  Run it: <code>got 25</code>, then <code>and now undefined</code>. The
  missing <code>return</code> in the third step is the most common
  promise bug there is — and it is silent.
</p>

<p>
  <code>.catch()</code> is just <code>.then(null, fn)</code> with a
  friendlier name, and one at the end of a chain catches a failure from
  <em>any</em> step above it. <code>.finally()</code> runs either way and
  passes the value straight through, exactly like
  <code>try/finally</code>.
</p>
<pre><code>loadUser()
  .then((user) =&gt; loadOrders(user.id))
  .then((orders) =&gt; render(orders))
  .catch((error) =&gt; showError(error))    <span class="c">// one handler for all three steps</span>
  .finally(() =&gt; hideSpinner());</code></pre>
<p class="sub">
  Compare that to the staircase earlier: the same three dependent steps,
  flat, with error handling written once. That is the fix.
</p>

<h3>async / await is the same promises, different spelling</h3>
<pre><code>async function loadInvoice(id) {
  try {
    const user = await getUser(id);
    const orders = await getOrders(user.id);
    return await getInvoice(orders[0].id);
  } catch (error) {
    console.error("failed:", error);
    throw error;                 <span class="c">// re-throw so the caller still knows</span>
  }
}</code></pre>
<p>Three things to be precise about:</p>
<ul>
  <li>
    <b>An <code>async</code> function always returns a promise</b> —
    even if its body has no <code>await</code> and returns a plain
    number, that number gets wrapped.
  </li>
  <li>
    <b><code>await</code> unwraps.</b> It pauses the function until the
    promise settles and gives you the value, not the promise.
  </li>
  <li>
    <b><code>try/catch</code> works again.</b> A rejected awaited
    promise throws exactly like a synchronous error — which is the thing
    callbacks could not do.
  </li>
</ul>
<div class="warn">
  <span class="ttl">&#9888; await inside a loop is sequential</span>
  <code>for (const id of ids) await load(id);</code> waits for each
  request before starting the next. If they do not depend on each other
  that is ten round trips where one would do —
  <a href="/notes/async-properly">Async, properly</a> covers
  <code>Promise.all</code> and the rest of the combinators.
</div>

<h3>fetch — asking the network for something</h3>
<pre><code>fetch("/api/users/1")
  .then(response =&gt; response.json())   <span class="c">// parses the body as JSON — itself async</span>
  .then(data =&gt; console.log(data))
  .catch(error =&gt; console.error("request failed:", error));</code></pre>
<p>
  <code>fetch</code> resolves as soon as the server sends back
  <em>any</em> response — even a 404 or a 500. It only rejects on a real
  network failure (offline, DNS gone, CORS blocked). That means status
  codes need their own check:
</p>
<pre><code>async function getUser(id) {
  const response = await fetch("/api/users/" + id);
  if (!response.ok) {              <span class="c">// true for 200-299, false for 404/500/etc.</span>
    throw new Error("Request failed: " + response.status);
  }
  return response.json();
}</code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> A rejected <code>fetch</code> promise
  means the network itself failed. A "successful" 404 still resolves —
  always check <code>response.ok</code> before trusting the body.
</div>

<h3>JSON.stringify / JSON.parse</h3>
<p>
  Every one of those responses arrives as text, so the last piece is the
  conversion between JavaScript objects and JSON — and that conversion
  drops things silently.
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
</p>

<h3>What to carry forward</h3>
<ul>
  <li>
    A callback is only a function you hand over. The trouble was never
    that — it was errors and composition.
  </li>
  <li>
    A promise settles once, permanently, and its reactions always run as
    microtasks. Never synchronously, even when it is already resolved.
  </li>
  <li>
    <code>.then</code> returns a new promise. <b>Return</b> from every
    callback or the next step gets <code>undefined</code>.
  </li>
  <li>
    One <code>.catch</code> at the end covers the whole chain — and
    <code>try/catch</code> works again once you are using
    <code>await</code>.
  </li>
  <li>
    <code>fetch</code> only rejects on network failure. Check
    <code>response.ok</code> yourself.
  </li>
</ul>
`,
};
