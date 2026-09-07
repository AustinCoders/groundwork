import type { Chapter } from "../types";

export const metaprogramming: Chapter = {
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
};
