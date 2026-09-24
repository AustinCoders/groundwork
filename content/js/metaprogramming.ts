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

<h3>Property descriptors — what a property really is</h3>
<pre><code>const user = {};
Object.defineProperty(user, "id", { value: 7, enumerable: true });

Object.getOwnPropertyDescriptor(user, "id");
<span class="c">// { value: 7, writable: false, enumerable: true, configurable: false }</span>

user.id = 8;                 <span class="c">// silently ignored — throws in strict mode</span>
delete user.id;              <span class="c">// false — not configurable</span></code></pre>
<p>
  Every property carries four attributes. <b>value</b> is the data;
  <b>writable</b> says whether it can be reassigned; <b>enumerable</b> says
  whether <code>Object.keys</code>, <code>for...in</code> and spread see it;
  <b>configurable</b> says whether it can be deleted or redefined. An accessor
  property replaces <code>value</code> and <code>writable</code> with a
  <code>get</code> and a <code>set</code>. The trap is the defaults:
  <code>obj.x = 1</code> creates a property with all three flags <code>true</code>,
  but <code>defineProperty</code> leaves any flag you omit <code>false</code>.
</p>
<ul>
  <li><code>Object.freeze</code> is simply "set every own property to non-writable and non-configurable, and stop adding new ones".</li>
  <li>Class methods are non-enumerable, which is why they do not show up when you log or spread an instance.</li>
  <li><b>Copying loses descriptors.</b> Spread and <code>Object.assign</code> <em>call</em> getters and copy the resulting value. To copy the property itself, getter included: <code>Object.defineProperties({}, Object.getOwnPropertyDescriptors(source))</code>.</li>
</ul>
<p class="sub">
  These flags are what Proxy's invariants (below) protect: a trap may not lie
  about a property that is non-configurable and non-writable.
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

<h4>Dry run: which trap fires, with what arguments</h4>
<table>
  <tr><th>Step</th><th>Code</th><th>Trap fired</th><th>Arguments</th><th>Returns</th></tr>
  <tr><td>1</td><td><code>logged.name</code></td><td><code>get</code></td><td><code>obj = target</code>, <code>prop = "name"</code></td><td>logs "GET name", then <code>Reflect.get(obj, "name")</code> → <code>"Ana"</code></td></tr>
  <tr><td>2</td><td><code>logged.age = 30</code></td><td><code>set</code></td><td><code>obj = target</code>, <code>prop = "age"</code>, <code>value = 30</code></td><td>logs "SET age = 30", then <code>Reflect.set(obj, "age", 30)</code> → <code>true</code>; <code>target.age</code> is now <code>30</code></td></tr>
</table>
<p class="sub">
  Neither trap invents new behavior — each one observes the operation, then hands it straight to the matching <code>Reflect</code> function to actually perform it. Skip that call, or return the wrong value from a trap, and the proxy stops behaving like a normal object: a <code>get</code> trap that forgets to <code>return</code> makes every property read come back <code>undefined</code>.
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
  <a href="/notes/error-handling-debugging">Error handling &amp; debugging</a> stays
  a real guarantee, not something a misbehaving Proxy trap could
  quietly undermine.
</p>

<h3>WeakRef and FinalizationRegistry — watching garbage collection happen</h3>
<pre><code>let obj = { data: "large payload" };
const ref = new WeakRef(obj);

console.log(ref.deref());   <span class="c">// { data: "large payload" } — still alive, obj still references it</span>

obj = null;                  <span class="c">// the only strong reference is gone</span>
<span class="c">// at some LATER point, once GC actually runs:</span>
console.log(ref.deref());   <span class="c">// undefined — the object is gone, and deref says so</span></code></pre>
<p>
  <code>WeakRef</code> holds a reference that doesn't itself keep an
  object alive — a step further than
  <a href="/notes/objects-deep">WeakMap</a>, which at least ties the
  weak reference to a key you still hold.
  <code>FinalizationRegistry</code> goes one step further still:
  register a callback that runs, at some unpredictable point on the
  engine's own schedule, after an object has actually been collected.
</p>
<pre><code>const registry = new FinalizationRegistry((heldValue) =&gt; {
  console.log("cleaned up:", heldValue);
});
registry.register(obj, "obj's id or label");</code></pre>
<div class="warn">
  <span class="ttl">⚠ Never build correctness on either of these</span>
  Both exist for <em>optimization and diagnostics</em> only — freeing an
  external resource (a file handle, a WASM buffer) as a best-effort
  backstop, or a memory profiler watching what actually gets collected.
  The specification explicitly does not guarantee a finalizer ever runs
  at all, let alone promptly — an engine can delay it indefinitely, or
  skip it entirely at page-unload. Real cleanup that has to happen
  belongs in an explicit method call, or the <code>using</code>
  declaration below — never a finalizer.
</div>

<h3>using — deterministic cleanup, without a manual try/finally</h3>
<pre><code>class FileHandle {
  constructor(name) {
    this.name = name;
    console.log("opened", name);
  }
  [Symbol.dispose]() {
    console.log("closed", this.name);
  }
}

function readConfig() {
  using file = new FileHandle("config.json");   <span class="c">// disposed automatically at the end of THIS block</span>
  console.log("reading", file.name);
}                                                  <span class="c">// [Symbol.dispose]() runs HERE, even if an error was thrown above</span>

readConfig();
<span class="c">// opened config.json</span>
<span class="c">// reading config.json</span>
<span class="c">// closed config.json</span></code></pre>
<p class="sub">
  <code>using</code> is a declaration, like <code>const</code>, that
  additionally calls <code>[Symbol.dispose]()</code> on the value the
  instant its scope ends — normal exit, an early <code>return</code>, or
  an exception, all equally. It's the same guarantee
  <code>try/finally</code> gives, without the indentation and without
  anyone forgetting to write the <code>finally</code> block. An
  <code>await using</code> variant exists for resources that need an
  asynchronous close (<code>[Symbol.asyncDispose]()</code>) — a database
  connection, a browser lock.
</p>
<div class="warn">
  <span class="ttl">⚠ Check the target here too</span>
  <code>using</code> is newer than most of the language features in
  this chapter — it landed later than <code>Proxy</code> or well-known
  symbols, and older browsers and Node versions don't parse it at all.
  Confirm the actual runtime and bundler target before reaching for it,
  the same check the decorators section below asks for.
</div>

<h3>Decorators — declarative behavior on a class or its members</h3>
<pre><code>function logged(originalMethod, context) {
  const name = String(context.name);
  return function (...args) {
    console.log("calling", name, "with", args);
    return originalMethod.call(this, ...args);
  };
}

class Api {
  @logged
  fetchUser(id) {
    return { id, name: "Ana" };
  }
}

new Api().fetchUser(1);   <span class="c">// what happens?</span></code></pre>
<p class="sub">
  Logs <code>"calling fetchUser with [1]"</code>, then returns the user
  as normal — the decorator wraps the original method without its own
  body ever changing. A decorator is a function that receives the thing
  it's decorating (a method, a field, or a whole class) plus a
  <code>context</code> object describing it, and returns a replacement.
  It's the same idea Angular and NestJS have used for years —
  <code>@Component</code>, <code>@Injectable</code> — now standardized
  into the language itself rather than requiring a compiler transform to
  approximate it.
</p>
<div class="warn">
  <span class="ttl">⚠ Check the target before reaching for a decorator</span>
  Decorators reached Stage 3 and shipped in real engines only recently —
  confirm the runtime and bundler target actually support the current
  proposal before using them. TypeScript's older
  <code>experimentalDecorators</code> flag implements a different,
  earlier, incompatible version of the same idea.
</div>

<h3>eval and new Function — and why almost never</h3>
<pre><code>eval("console.log(1 + 1)");           <span class="c">// runs in the CALLING scope — can read/write local variables</span>
new Function("a", "b", "return a + b");  <span class="c">// runs in GLOBAL scope only — can't see any local variable</span></code></pre>
<p>
  Both compile and run a string as code, and both come with the same
  three costs: the engine can't statically analyze code that doesn't
  exist yet at parse time, so it gets none of the optimization this
  whole chapter has been about; a strict Content-Security-Policy
  (covered in <a href="/notes/security">Security</a>) blocks them outright; and if that string ever
  contains anything derived from user input, it's arbitrary code
  execution, full stop — not a bug class, the actual worst case.
</p>
<div class="warn">
  <span class="ttl">⚠ This site's own code runner uses new Function</span>
  Every runnable example on this site, and the whole practice
  playground, really does run your code through
  <code>new Function(...)</code> inside a Web Worker — that's not a
  contradiction of the warning above, it's the actual legitimate use
  case: a sandboxed worker with no DOM access, running code the reader
  explicitly chose to execute, not untrusted input silently reaching
  <code>eval</code> in a real production app.
</div>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Symbols are collision-free keys, the iteration protocols make anything usable with <code>for...of</code> and spread, property descriptors control what a property may do, and Proxy with Reflect intercepts operations — bound by invariants that stop a trap lying about a non-configurable property."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain why <code>obj[Symbol("id")]</code> returns <code>undefined</code> even when the new symbol has the same description as an existing key.</li>
    <li>Explain the iteration protocol (<code>Symbol.iterator</code> → an iterator whose <code>.next()</code> returns <code>{ value, done }</code>), and why it gets a class <code>for...of</code>, spread, and destructuring for free.</li>
    <li>Trace which trap fires, with what arguments, for a read versus a write on a logging Proxy, and say why the trap delegates to <code>Reflect</code> instead of skipping it.</li>
    <li>Explain the invariant that stops a <code>get</code> trap from lying about a frozen, non-configurable, non-writable property.</li>
    <li>Explain why <code>WeakRef</code> and <code>FinalizationRegistry</code> are unsuitable for real cleanup, and what guarantee <code>using</code> and <code>[Symbol.dispose]</code> give you instead.</li>
  </ul>
</div>`,
};
