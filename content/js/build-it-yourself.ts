import type { Chapter } from "../types";

export const buildItYourself: Chapter = {
  id: "build-it-yourself",
  num: "A12",
  title: "Build it yourself",
  short: "Build it yourself",
  levels: ["advanced"],
  practice: [
    "ex-debounce-fn",
    "ex-build-lru-cache",
    "ex-deep-clone",
    "ex-deep-equal",
    "ex-my-bind",
    "ex-throttle",
    "ex-memoize",
    "ex-array-polyfills",
    "ex-curry-placeholder",
  ],
  ready: true,
  subtitle:
    "The six things a senior loop asks you to build from scratch — because you can, not because you should ship them.",
  body: `<p>
  None of what follows should replace a library in production — reach
  for the real <code>Promise</code>, a maintained debounce, or
  <a href="/notes/objects-deep">structuredClone</a> every time. Building
  each of these once earns something a library can't: the moment "it
  just works" turns into "I know exactly why it works," which is also,
  not coincidentally, the exact set of questions a senior interview loop
  reaches for.
</p>

<h3>A minimal Promise, from scratch</h3>
<div class="try">
  <pre><code>class MiniPromise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  #state = MiniPromise.PENDING;
  #value;
  #callbacks = [];

  constructor(executor) {
    const resolve = (value) =&gt; this.#settle(MiniPromise.FULFILLED, value);
    const reject = (reason) =&gt; this.#settle(MiniPromise.REJECTED, reason);
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  #settle(state, value) {
    if (this.#state !== MiniPromise.PENDING) return;   <span class="c">// a promise settles ONCE, ever</span>
    this.#state = state;
    this.#value = value;
    queueMicrotask(() =&gt; this.#callbacks.forEach((cb) =&gt; cb()));
  }

  then(onFulfilled, onRejected) {
    return new MiniPromise((resolve, reject) =&gt; {
      const run = () =&gt; {
        try {
          if (this.#state === MiniPromise.FULFILLED) {
            resolve(onFulfilled ? onFulfilled(this.#value) : this.#value);
          } else if (onRejected) {
            resolve(onRejected(this.#value));
          } else {
            reject(this.#value);
          }
        } catch (err) {
          reject(err);
        }
      };
      if (this.#state === MiniPromise.PENDING) this.#callbacks.push(run);
      else queueMicrotask(run);
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
}

const p = new MiniPromise((resolve) =&gt; setTimeout(() =&gt; resolve(1), 10));
p.then((v) =&gt; v + 1).then((v) =&gt; console.log("got", v));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"got 2"</code>, after the 10ms timeout — a real, working
  <code>.then()</code> chain, including the part that trips most
  from-scratch attempts: <code>.then()</code> itself returns a
  <b>new</b> <code>MiniPromise</code>, so it can be chained again, and
  whatever the callback returns becomes that new promise's value. The
  <code>#callbacks</code> array exists specifically for a
  <code>.then()</code> attached before the promise has settled —
  exactly what happens above, since <code>.then()</code> runs
  synchronously while the executor is still waiting on its
  <code>setTimeout</code>.
</p>
<div class="warn">
  <span class="ttl">⚠ What this leaves out</span>
  A spec-compliant implementation (the Promises/A+ test suite) also
  handles a <code>.then()</code> callback returning <em>another</em>
  thenable — unwrapping it recursively instead of resolving with the
  promise itself — and guards against <code>resolve</code> being called
  with the promise's own instance. Both are a handful of extra lines,
  left out here to keep the core chaining mechanism readable.
</div>

<h3>Your own bind, call, and apply</h3>
<pre><code>Function.prototype.myCall = function (thisArg, ...args) {
  const fn = Symbol("fn");
  const context = thisArg ?? globalThis;
  context[fn] = this;                 <span class="c">// borrow the object's ability to invoke a method on it</span>
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

Function.prototype.myApply = function (thisArg, argsArray = []) {
  return this.myCall(thisArg, ...argsArray);
};

Function.prototype.myBind = function (thisArg, ...boundArgs) {
  const original = this;
  return function (...laterArgs) {
    return original.myCall(thisArg, ...boundArgs, ...laterArgs);
  };
};

function greet(greeting) { return greeting + ", " + this.name; }
console.log(greet.myCall({ name: "Ana" }, "Hi"));        <span class="c">// what happens?</span>
console.log(greet.myBind({ name: "Ravi" })("Hello"));    <span class="c">// what happens?</span></code></pre>
<p class="sub">
  <code>"Hi, Ana"</code>, then <code>"Hello, Ravi"</code> —
  <code>myCall</code>'s trick is the whole answer to "how do you set
  <code>this</code> without the real keyword": temporarily attach the
  function as a method <em>on</em> the target object (under a
  <code>Symbol</code> key so it can never collide with a real property),
  call it as <code>obj.method()</code> so the
  <a href="/notes/this-keyword">implicit binding rule</a> kicks in
  naturally, then remove it again. <code>myApply</code> is
  <code>myCall</code> with an array instead of a spread list of
  arguments; <code>myBind</code> returns a brand-new function that
  always calls through <code>myCall</code> with a <code>this</code>
  that was locked in ahead of time.
</p>
<div class="warn">
  <span class="ttl">⚠ What this leaves out</span>
  Four gaps, exactly the ones a follow-up question would probe: a
  primitive <code>thisArg</code> (a string, a number) throws, because
  you can't set a property on one — real <code>call</code> autoboxes it
  into an object first. A frozen or sealed target throws for the same
  reason real <code>call</code> never does: it doesn't need to write a
  temporary property onto anything. If the called function throws, the
  temporary <code>Symbol</code> key is never cleaned up, because there's
  no <code>finally</code> around the call — a real, if obscure, leak.
  And <code>myBind</code>'s result ignores <code>new</code> entirely:
  <code>new (fn.myBind(obj))()</code> still runs with <code>this</code>
  forced to <code>obj</code>, where real <code>bind</code> detects
  construction and lets <code>new</code> win, building a genuine
  instance instead.
</div>

<h3>debounce and throttle, from scratch</h3>
<div class="try">
  <pre><code>function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);                                   <span class="c">// cancel the previous scheduled call...</span>
    timer = setTimeout(() =&gt; fn.apply(this, args), wait);   <span class="c">// ...and schedule a fresh one</span>
  };
}

function throttle(fn, wait) {
  let ready = true;
  return function (...args) {
    if (!ready) return;
    ready = false;
    fn.apply(this, args);
    setTimeout(() =&gt; { ready = true; }, wait);
  };
}

const log = debounce((label) =&gt; console.log(label), 100);
log("a"); log("b"); log("c");   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  Only <code>"c"</code> ever logs. Each call to the debounced function
  cancels the timer the <em>previous</em> call just set, so only the
  <b>last</b> call in a fast burst survives long enough to actually fire
  — the shape behind a search box that waits for typing to pause before
  it calls an API. <code>throttle</code> solves a different problem: it
  guarantees at most one call gets through per <code>wait</code> window,
  letting the <b>first</b> call in a burst through immediately and
  silently dropping the rest until the window resets — the shape behind
  a scroll handler that should react regularly, not on every single
  pixel of movement.
</p>

<h3>A deep clone that survives cycles</h3>
<pre><code>function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== "object") return value;   <span class="c">// primitives are already copies</span>
  if (seen.has(value)) return seen.get(value);                      <span class="c">// already cloned — reuse it, don't loop forever</span>

  const clone = Array.isArray(value) ? [] : {};
  seen.set(value, clone);
  for (const key of Object.keys(value)) {
    clone[key] = deepClone(value[key], seen);
  }
  return clone;
}

const original = { name: "Ana" };
original.self = original;             <span class="c">// a circular reference — points back at itself</span>

const copy = deepClone(original);
console.log(copy.self === copy);      <span class="c">// what happens?</span>
console.log(copy === original);       <span class="c">// what happens?</span></code></pre>
<p class="sub">
  <code>true</code>, then <code>false</code> — the clone's circular
  reference points back at the <em>clone</em>, not the original, and
  it's a genuinely separate object. The <code>seen</code>
  <a href="/notes/objects-deep">WeakMap</a> is what makes a circular
  structure survive at all: without it,
  <code>deepClone(original.self)</code> would call
  <code>deepClone(original)</code> again, which would clone
  <code>.self</code> again, forever. Recording each object's clone
  <em>before</em> recursing into its properties means a second visit to
  the same object returns the clone already in progress instead of
  starting over. <code>structuredClone()</code> does exactly this in
  native code — reach for it in real code; this version exists to show
  what it's actually doing.
</p>

<h3>A deep equal</h3>
<pre><code>function deepEqual(a, b) {
  if (Object.is(a, b)) return true;   <span class="c">// same reference, or same primitive — handles NaN and -0 correctly</span>
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) =&gt; Object.hasOwn(b, key) &amp;&amp; deepEqual(a[key], b[key]));
}

console.log(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }));   <span class="c">// what happens?</span>
console.log(deepEqual({ a: NaN }, { a: NaN }));                          <span class="c">// what happens?</span>
console.log(deepEqual([1, 2], [1, 2]));                                  <span class="c">// what happens?</span></code></pre>
<p class="sub">
  <code>true</code>, <code>true</code>, <code>true</code> — a plain
  <code>a.b === b.b</code> would have failed the very first test, since
  <a href="/notes/objects-arrays-basics">two different objects with the
  same shape are never <code>===</code></a>. <code>Object.is</code>
  instead of <code>===</code> at the base case is what makes the second
  test pass — plain <code>===</code> would say <code>NaN !== NaN</code>
  and wrongly call two identical-looking objects unequal. Arrays fall
  out of the same code for free: <code>Object.keys([1, 2])</code>
  returns <code>["0", "1"]</code>, so an array is just an object whose
  keys happen to be indices.
</p>
<div class="warn">
  <span class="ttl">⚠ What this leaves out</span>
  Comparing by own enumerable keys alone misses type entirely: two
  different <code>Date</code>s at the same instant, two
  <code>Map</code>s or <code>Set</code>s with identical contents, and
  <code>[1, 2]</code> against <code>{ 0: 1, 1: 2 }</code> all come back
  <code>true</code> here, because none of those types expose their real
  data as an own enumerable key <code>Object.keys</code> can see. A
  complete version checks the constructor first, then compares
  <code>.getTime()</code> for dates and iterates entries for
  <code>Map</code>/<code>Set</code> — a real library (lodash's
  <code>isEqual</code>) is where that full case list actually lives.
</div>

<h3>An LRU cache with O(1) get and put</h3>
<div class="try">
  <pre><code>class LRUCache {
  #capacity;
  #map = new Map();               <span class="c">// Map remembers insertion order — this is the whole trick</span>

  constructor(capacity) {
    this.#capacity = capacity;
  }

  get(key) {
    if (!this.#map.has(key)) return undefined;
    const value = this.#map.get(key);
    this.#map.delete(key);
    this.#map.set(key, value);    <span class="c">// re-insert — now it's the MOST recently used</span>
    return value;
  }

  put(key, value) {
    this.#map.delete(key);
    this.#map.set(key, value);
    if (this.#map.size &gt; this.#capacity) {
      this.#map.delete(this.#map.keys().next().value);   <span class="c">// evict the LEAST recently used — the first key</span>
    }
  }
}

const cache = new LRUCache(2);
cache.put("a", 1);
cache.put("b", 2);
cache.get("a");          <span class="c">// touching "a" makes it recently used again</span>
cache.put("c", 3);       <span class="c">// cache is full — evicts the least recently used</span>

console.log(cache.get("a"), cache.get("b"), cache.get("c"));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>1 undefined 3</code> — <code>"b"</code> is the one evicted, not
  <code>"a"</code>, because reading <code>"a"</code> with
  <code>get()</code> re-inserted it, moving it to the end of the
  <code>Map</code>'s iteration order. <code>"b"</code> was the least
  recently touched key once the cache hit capacity, so it's the one
  <code>.keys().next().value</code> — the map's current <em>first</em>
  key — throws out. Every operation here is a plain <code>Map</code>
  get/set/delete, each O(1), which is the entire reason an LRU cache is
  built on a <code>Map</code> instead of an array: no method here ever
  has to scan or shift anything.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "These are the from-scratch asks interviews use to check you understand the mechanism: a promise is a state machine plus a callback queue, <code>bind</code> is a closure over <code>this</code>, debounce and throttle are closures over a timer, a deep clone needs a seen-map for cycles, and an LRU cache gets O(1) from a hash map plus a linked list."
  </p>
</div>`,
};
