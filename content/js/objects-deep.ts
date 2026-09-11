import type { Chapter } from "../types";

export const objectsDeep: Chapter = {
  id: "objects-deep",
  num: "I2",
  title: "Objects deeply",
  short: "Objects deeply",
  levels: ["intermediate"],
  practice: ["ex-group-by", "ex-no-mutation", "ex-dedupe-map"],
  ready: true,
  subtitle: "The rest of the object/array toolbox — past what the beginner chapter covered.",
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

<h3>Array methods the beginner chapter skipped</h3>
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
};
