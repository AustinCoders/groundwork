import type { Chapter } from "../types";

export const prototypesOop: Chapter = {
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

<h3>What new actually does</h3>
<p>
  <code>new Fn(...)</code> is four steps, always, whether
  <code>Fn</code> is an old-style constructor function or a modern
  <code>class</code>:
</p>
<ol>
  <li>A brand-new, empty object is created.</li>
  <li>Its internal prototype link is set to <code>Fn.prototype</code>.</li>
  <li><code>Fn</code> runs with <code>this</code> bound to that new object (the "new" row from <a href="/notes/this-keyword">the this-binding table</a>).</li>
  <li>If <code>Fn</code> explicitly returns an object (a function counts), <em>that's</em> the result instead — otherwise the new object from step 1 is returned automatically.</li>
</ol>
<div class="try">
  <pre><code>function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype);        <span class="c">// steps 1 &amp; 2</span>
  const result = Ctor.apply(obj, args);              <span class="c">// step 3</span>
  const returnedObject = (typeof result === "object" &amp;&amp; result !== null) || typeof result === "function";
  return returnedObject ? result : obj;                <span class="c">// step 4</span>
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
};
