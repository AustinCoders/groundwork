import type { Chapter } from "../types";

export const thisKeyword: Chapter = {
  id: "this-keyword",
  num: "B9",
  title: "The this keyword",
  short: "this",
  levels: ["beginner"],
  practice: ["ex-this-rule", "ex-keep-this"],
  ready: true,
  subtitle: "Not where it was written — who called it.",
  body: `<h3>this is an extra parameter you never declared</h3>
<p>
  Every ordinary function call quietly passes one more argument than you
  wrote. You never name it, you never see it in the parameter list, and
  inside the body it is called <code>this</code>.
</p>
<p>
  What goes in it is not decided when you write the function. It is
  decided <b>at the moment of the call</b>, by the shape of the call
  itself. That single sentence dissolves most <code>this</code>
  confusion, because it means the same function can be handed a
  different <code>this</code> on every line that calls it.
</p>

<pre><code>function whoAmI() {
  return this;
}

const a = { name: "a", whoAmI };
const b = { name: "b", whoAmI };

a.whoAmI();        <span class="c">// this is a</span>
b.whoAmI();        <span class="c">// this is b — same function, different answer</span>
whoAmI();          <span class="c">// this is undefined (strict) — nobody to be</span></code></pre>

<div class="say">
  <span class="ttl">Say it like this &rarr;</span> "Reading a function
  tells you what it does. Only the call site tells you what
  <code>this</code> is."
</div>

<h3>One function, six call sites</h3>
<p>
  The same <code>describe</code> function, called six different ways.
  Step through and watch which rule fires and what <code>this</code>
  lands on.
</p>

<div class="demo">
  <div class="demo__bar">The call site decides</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="th-code"></div>
        <div class="loop-bar"><i id="th-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="th-prev" type="button">&larr; Back</button>
          <button class="btn" id="th-next" type="button">Next step &rarr;</button>
          <button class="btn" id="th-play" type="button">Play</button>
          <button class="btn btn--ghost" id="th-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Which rule fires</div>
          <div id="th-p-rule"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">this becomes</div>
          <div id="th-p-this"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Result</div>
          <div id="th-p-out"></div>
        </div>
      </div>
    </div>
    <p class="demo__note" id="th-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "th";
  var CODE = [
    "function describe() { return this.name; }",
    "const user = { name: 'ana', describe };",
    "",
    "user.describe();",
    "const bare = user.describe;  bare();",
    "describe.call({ name: 'called' });",
    "const bound = describe.bind(user);  bound();",
    "new (function Tag() { this.name = 'new'; })();",
    "setTimeout(user.describe, 0);"
  ];
  var STEPS = [
    {"line":null,"panels":{"rule":[],"this":[],"out":[]},"note":"One function. Six call sites. Nothing about the function body changes between them."},
    {"line":4,"panels":{"rule":["3 · implicit binding"],"this":["user"],"out":["'ana'"]},"note":"There is an object to the left of the dot, so that object becomes this. The dot is doing the work, not the function."},
    {"line":5,"panels":{"rule":["4 · default binding"],"this":["undefined"],"out":["TypeError: cannot read 'name' of undefined"]},"note":"Copying the function out drops the dot. No object left of it means default binding — undefined in strict mode and in modules. THIS is the bug behind every 'cannot read property of undefined' in a callback."},
    {"line":6,"panels":{"rule":["2 · explicit binding"],"this":["{ name: 'called' }"],"out":["'called'"]},"note":".call() hands this over directly, beating implicit binding. .apply() is identical but takes an array of arguments."},
    {"line":7,"panels":{"rule":["2 · explicit binding"],"this":["user (permanently)"],"out":["'ana'"]},"note":".bind() does not call it. It returns a NEW function with this welded on — and that weld cannot be undone by a later call or bind."},
    {"line":8,"panels":{"rule":["1 · new binding (wins)"],"this":["the brand-new object"],"out":["'new'"]},"note":"new creates a fresh object and points this at it. This rule outranks every other one."},
    {"line":9,"panels":{"rule":["4 · default binding"],"this":["undefined"],"out":["TypeError again"]},"note":"Passing user.describe to setTimeout copies the function out exactly like line 5 did. The dot never survives being passed as a value."},
    {"line":null,"panels":{"rule":["ranked: new > explicit > implicit > default"],"this":["decided per call"],"out":["same function, five answers"]},"note":"Read the call site, apply the highest-ranked rule that matches, and you have this. Every time."}
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

<h3>The four rules, ranked</h3>
<p>
  Four rules can set <code>this</code>, and when more than one could
  apply, the higher-ranked one wins. Work down the list and stop at the
  first match.
</p>

<table>
  <tr>
    <th>Rank</th>
    <th>Rule</th>
    <th>The call looks like</th>
    <th><code>this</code> becomes</th>
  </tr>
  <tr>
    <th>1 — wins</th>
    <td><b>new</b> binding</td>
    <td><code>new Fn()</code></td>
    <td>the brand-new object being built</td>
  </tr>
  <tr>
    <th>2</th>
    <td><b>Explicit</b> binding</td>
    <td><code>fn.call(obj)</code>, <code>.apply(obj)</code>, <code>.bind(obj)</code></td>
    <td>exactly the object you handed over</td>
  </tr>
  <tr>
    <th>3</th>
    <td><b>Implicit</b> binding</td>
    <td><code>obj.method()</code></td>
    <td>the object left of the dot</td>
  </tr>
  <tr>
    <th>4 — default</th>
    <td><b>Default</b> binding</td>
    <td>a plain <code>fn()</code></td>
    <td><code>undefined</code> in strict mode and modules; the global object in old sloppy scripts</td>
  </tr>
</table>

<h4>Only the last dot counts</h4>
<p>
  With implicit binding it is easy to assume the whole path matters. It
  does not — only the object immediately left of the final dot does.
</p>
<pre><code>const app = {
  name: "app",
  inner: {
    name: "inner",
    who() { return this.name; },
  },
};

app.inner.who();     <span class="c">// "inner" — not "app"</span></code></pre>

<h4>call, apply and bind</h4>
<pre><code>function greet(greeting, mark) {
  return greeting + ", " + this.name + mark;
}
const user = { name: "ana" };

greet.call(user, "Hi", "!");      <span class="c">// "Hi, ana!"  — arguments listed</span>
greet.apply(user, ["Hi", "!"]);   <span class="c">// "Hi, ana!"  — arguments in an array</span>

const hi = greet.bind(user, "Hi");
hi("!");                          <span class="c">// "Hi, ana!"  — returns a new function instead of calling</span></code></pre>
<p class="sub">
  The mnemonic writes itself: <code>call</code> takes commas,
  <code>apply</code> takes an array — and <code>bind</code> is the odd
  one out because it
  does not run anything, it hands you a new function with
  <code>this</code> permanently attached. Binding an already-bound
  function a second time does nothing; the first weld holds.
</p>

<h3>Arrow functions opt out entirely</h3>
<p>
  An arrow function has no <code>this</code> of its own. None of the
  four rules apply to it. When you write <code>this</code> inside an
  arrow, it is resolved like any other variable — by looking outwards
  through the scopes it was <em>written</em> in, exactly the way the
  scope chain works.
</p>

<div class="try">
  <pre><code>const timer = {
  label: "timer",

  withFunction() {
    [1].forEach(function () {
      console.log("function callback:", this === undefined ? "undefined" : this.label);
    });
  },

  withArrow() {
    [1].forEach(() =&gt; {
      console.log("arrow callback:  ", this.label);
    });
  },
};

timer.withFunction();
timer.withArrow();</code></pre>
</div>
<p class="sub">
  The plain function callback gets its own <code>this</code> by rule 4 —
  nobody called it with a dot, so it is <code>undefined</code>. The
  arrow has none to get, so it keeps reading the
  <code>this</code> belonging to <code>withArrow</code>, which is
  <code>timer</code>. This is the entire reason arrows took over
  callbacks.
</p>

<div class="warn">
  <span class="ttl">&#9888; Never use an arrow as an object method</span>
  <code>const o = { name: "o", who: () =&gt; this.name };</code> looks
  tidier and is broken. The arrow was written at the top level, not
  inside any function, so its <code>this</code> is whatever the module
  or script has — never <code>o</code>. Methods want
  <code>who() { ... }</code>.
</div>

<h3>How this gets lost — and the three fixes</h3>
<p>
  Almost every real <code>this</code> bug is the same move: the function
  gets separated from its dot. Three ways it happens, all identical
  underneath.
</p>
<pre><code>const counter = {
  count: 0,
  increment() { this.count++; return this.count; },
};

<span class="c">// 1. Pulled out into a variable</span>
const inc = counter.increment;
inc();                              <span class="c">// 💥 this is undefined</span>

<span class="c">// 2. Passed as a callback</span>
button.addEventListener("click", counter.increment);   <span class="c">// 💥</span>
setTimeout(counter.increment, 100);                    <span class="c">// 💥</span>

<span class="c">// 3. Destructured out</span>
const { increment } = counter;
increment();                        <span class="c">// 💥 same thing, shorter spelling</span></code></pre>

<p>The fixes, in the order you should reach for them:</p>
<pre><code><span class="c">// A. Wrap it in an arrow — the call keeps its dot</span>
setTimeout(() =&gt; counter.increment(), 100);

<span class="c">// B. Bind it, when you need a reusable detached function</span>
const inc = counter.increment.bind(counter);

<span class="c">// C. In a class, make it a field holding an arrow — bound at construction</span>
class Counter {
  count = 0;
  increment = () =&gt; { this.count++; };   <span class="c">// safe to pass anywhere</span>
}</code></pre>
<p class="sub">
  Option A is usually right, because it keeps the object and the method
  together at the call site where a reader can see them. Option C costs
  one function per instance rather than one per class, which only
  matters when you are making thousands of them.
</p>

<h3>this in a class</h3>
<pre><code>class Timer {
  constructor(label) {
    this.label = label;        <span class="c">// rule 1 — this is the new instance</span>
    this.ticks = 0;
  }

  tick() {                     <span class="c">// rule 3 when called as timer.tick()</span>
    this.ticks++;
  }
}

const t = new Timer("mine");
t.tick();                      <span class="c">// fine — there is a dot</span>
[1, 2, 3].forEach(t.tick);     <span class="c">// 💥 no dot. Classes are strict, so this is undefined</span></code></pre>
<p>
  Class bodies are always in strict mode, which means a lost
  <code>this</code> inside a class <em>throws</em> rather than silently
  writing properties onto the global object. That is a feature: the old
  sloppy-mode behaviour turned this same bug into a mysterious global
  variable instead of an error.
</p>

<h3>this in an event handler</h3>
<pre><code>button.addEventListener("click", function () {
  this;                  <span class="c">// the element the listener is attached to</span>
  this.classList.add("on");
});

button.addEventListener("click", () =&gt; {
  this;                  <span class="c">// NOT the button — whatever the surrounding scope had</span>
});</code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> In a handler, prefer
  <code>event.currentTarget</code> over <code>this</code>. It means the
  same element, it keeps working when you switch to an arrow, and it
  says out loud what it is. Note <code>currentTarget</code> is the
  element you attached to; <code>event.target</code> is whatever was
  actually clicked, which may be a child.
</div>

<h3>The traps, collected</h3>
<ul>
  <li>
    <b>Passing a method as a callback</b> —
    <code>onClick={obj.method}</code>, <code>setTimeout(obj.method)</code>,
    <code>arr.map(obj.method)</code>. The dot does not travel.
  </li>
  <li>
    <b>An arrow as an object method</b> — it reads
    <code>this</code> from the file, not the object.
  </li>
  <li>
    <b>A plain <code>function</code> callback inside a method</b> — it
    gets default binding. Use an arrow, or the second argument of
    <code>forEach</code>/<code>map</code>, which sets <code>this</code>
    for you.
  </li>
  <li>
    <b>Assuming the whole path binds</b> — only the last dot counts.
  </li>
  <li>
    <b>Expecting a re-<code>bind</code> to work</b> — the first one is
    permanent.
  </li>
</ul>

<div class="say">
  <span class="ttl">Say it like this &rarr;</span> "<code>this</code> is
  set by the call, not the definition. Check for <code>new</code>, then
  for <code>call</code>/<code>apply</code>/<code>bind</code>, then for a
  dot, and if none of those apply it is <code>undefined</code>. Arrows
  have no <code>this</code> at all — they borrow the one around them."
</div>
`,
};
