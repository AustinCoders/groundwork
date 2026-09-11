import type { Chapter } from "../types";

export const objectsArraysBasics: Chapter = {
  id: "objects-arrays-basics",
  num: "B10",
  title: "Objects & arrays",
  short: "Objects & arrays",
  levels: ["beginner"],
  practice: ["ex-array-methods-chain", "ex-nested-destructure"],
  ready: true,
  subtitle: "The two shapes almost everything you build is made of.",
  body: `<h3>Object literals</h3>
<pre><code>const user = {
  name: "Ana",
  age: 29,
  isAdmin: false,
  address: {                    <span class="c">// objects nest freely</span>
    city: "Pune",
  },
};</code></pre>
<p>
  Two ways to reach a property, and they're not interchangeable.
  <b>Dot notation</b> needs a literal, valid identifier known when you
  write the code. <b>Bracket notation</b> takes any expression — a
  variable, a computed string, a key with a space in it.
</p>
<pre><code>user.name;              <span class="c">// "Ana" — the key is a literal you typed</span>
user["name"];           <span class="c">// same thing, spelled differently</span>

const key = "age";
user[key];              <span class="c">// 29 — dot notation CAN'T do this; user.key would look for a property literally named "key"</span>
user["favorite color"]; <span class="c">// dot notation can't have a space in it at all</span></code></pre>
<p class="sub">
  As a reminder from <a href="/notes/types-values">the types chapter</a>:
  an object variable holds a <em>reference</em>, not the data itself —
  copying the variable copies the pointer, not the object.
</p>

<h3>Shorthand and computed keys</h3>
<pre><code>const name = "Ana", age = 29;
const user2 = { name, age };            <span class="c">// shorthand — same as { name: name, age: age }</span>

const field = "role";
const user3 = { [field]: "admin" };     <span class="c">// computed key — the property is named by field's VALUE</span>
console.log(user3);                     <span class="c">// { role: "admin" }, not { field: "admin" }</span></code></pre>

<h3>Arrays — indexed, ordered, still objects underneath</h3>
<pre><code>const nums = [10, 20, 30];
nums[0];          <span class="c">// 10 — indexing starts at 0</span>
nums.length;       <span class="c">// 3</span>
nums[nums.length - 1];  <span class="c">// 30 — the standard "last element" idiom</span>
nums[10];          <span class="c">// undefined — out of range, not an error</span></code></pre>
<p class="sub">
  <code>typeof []</code> is <code>"object"</code> and
  <code>Array.isArray()</code> is the only reliable check — both covered
  back in <a href="/notes/types-values">the types
  chapter</a>. What actually makes an array useful is the ordered,
  numerically-indexed methods below.
</p>

<h3>Mutating methods — they change the array in place</h3>
<table>
  <tr>
    <th>Call</th>
    <th>Does</th>
    <th>Returns</th>
  </tr>
  <tr><td><code>arr.push(x)</code></td><td>adds to the end</td><td>new length</td></tr>
  <tr><td><code>arr.pop()</code></td><td>removes from the end</td><td>the removed element</td></tr>
  <tr><td><code>arr.unshift(x)</code></td><td>adds to the start</td><td>new length</td></tr>
  <tr><td><code>arr.shift()</code></td><td>removes from the start</td><td>the removed element</td></tr>
  <tr><td><code>arr.splice(start, count, …items)</code></td><td>removes <code>count</code> at <code>start</code>, inserts <code>…items</code> there</td><td>array of removed elements</td></tr>
  <tr><td><code>arr.sort(cmp)</code></td><td>sorts in place</td><td>the same array</td></tr>
  <tr><td><code>arr.reverse()</code></td><td>reverses in place</td><td>the same array</td></tr>
</table>
<div class="try">
  <pre><code>console.log([10, 1, 2].sort());              <span class="c">// what happens?</span>
console.log([10, 1, 2].sort((a, b) =&gt; a - b)); <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  Without a comparator, <code>sort()</code> converts everything to a
  <b>string</b> and sorts lexicographically — so <code>10</code> comes
  before <code>2</code>, because <code>"1"</code> sorts before
  <code>"2"</code>. A comparator that returns negative/zero/positive is
  the only reliable way to sort numbers.
</p>
<div class="warn">
  <span class="ttl">⚠ push/pop are cheap, shift/unshift are not</span>
  Adding or removing at the <em>end</em> of an array is O(1). Doing it
  at the <em>start</em> is O(n) — every other element has to shift
  index. For a queue you fill from one end and drain from the other,
  reach for <code>push</code>/<code>shift</code> and know that's a
  trade-off, not a free choice.
</div>

<h3>Non-mutating methods — they read, they don't touch</h3>
<table>
  <tr>
    <th>Call</th>
    <th>Returns</th>
  </tr>
  <tr><td><code>arr.slice(start, end)</code></td><td>a new array, <code>end</code> excluded — negative indices count from the back</td></tr>
  <tr><td><code>arr.indexOf(x)</code></td><td>first matching index, or <code>-1</code> — compares with <code>===</code></td></tr>
  <tr><td><code>arr.includes(x)</code></td><td><code>true</code>/<code>false</code> — the one case where it differs from <code>indexOf</code>: it also matches <code>NaN</code></td></tr>
</table>
<div class="try">
  <pre><code>console.log([NaN].indexOf(NaN));   <span class="c">// what happens?</span>
console.log([NaN].includes(NaN));  <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>-1</code>, then <code>true</code>. <code>indexOf</code> compares
  with <code>===</code>, and <code>NaN === NaN</code> is
  <code>false</code> — so <code>indexOf</code> can never find a
  <code>NaN</code>, no matter how many are in the array.
  <code>includes</code> uses a different algorithm (SameValueZero) that
  treats <code>NaN</code> as equal to itself. It's a small detail with a
  real consequence: <code>includes</code> is the safer default unless
  you specifically need the index back.
</p>
<div class="sticky mint">
  <span class="ttl">Rule</span> <code>splice</code> mutates,
  <code>slice</code> doesn't — same six letters, opposite behavior. If
  you're not sure whether a method is safe on a shared array, check
  first; it's the single most common source of "why did this other
  variable change too" bugs.
</div>

<h3>map / filter / find / forEach / reduce</h3>
<p>
  Five methods that all walk the array element by element — the
  difference is entirely in what each one hands back.
</p>
<table>
  <tr>
    <th>Method</th>
    <th>Gives back</th>
    <th>Use it when</th>
  </tr>
  <tr><td><code>.map(fn)</code></td><td>a new array, same length</td><td>you're transforming every element</td></tr>
  <tr><td><code>.filter(fn)</code></td><td>a new array, shorter or equal</td><td>you're keeping some elements, dropping others</td></tr>
  <tr><td><code>.find(fn)</code></td><td>one element, or <code>undefined</code></td><td>you want the first match and nothing else</td></tr>
  <tr><td><code>.forEach(fn)</code></td><td>nothing (<code>undefined</code>)</td><td>you're only running side effects — no new array</td></tr>
  <tr><td><code>.reduce(fn, initial)</code></td><td>whatever you build up</td><td>collapsing the array into one value — a sum, an object, another array</td></tr>
</table>
<pre><code>const cart = [
  { name: "Pen", price: 20, qty: 3 },
  { name: "Book", price: 150, qty: 1 },
  { name: "Eraser", price: 5, qty: 0 },
];

cart.map(item =&gt; item.name);              <span class="c">// ["Pen", "Book", "Eraser"]</span>
cart.filter(item =&gt; item.qty &gt; 0);         <span class="c">// Pen and Book only</span>
cart.find(item =&gt; item.price &gt; 100);      <span class="c">// the Book object itself</span>
cart.forEach(item =&gt; console.log(item.name)); <span class="c">// logs 3 times, returns undefined</span>
cart.reduce((total, item) =&gt; total + item.price * item.qty, 0); <span class="c">// 210</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ forEach can't be stopped, and its return is
  thrown away</span>
  <code>break</code> doesn't work inside a <code>forEach</code>
  callback, and <code>return</code>ing from it just skips to the next
  element — it does not exit the loop. Need to stop early? Use a real
  <code>for</code>/<code>for...of</code> loop, or <code>.find</code>/
  <code>.some</code> if you're really just searching.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "map and filter are for
  building a new array. forEach is for side effects — logging,
  pushing into something outside the callback. reduce is the general
  case underneath map and filter — either one could be written with
  reduce, but reduce for a simple transform reads worse, not better."
</div>

<h3>Destructuring</h3>
<p>
  Unpacking values out of an object or array into their own named
  variables, in one line instead of one assignment per field.
</p>
<pre><code><span class="c">// Object destructuring — order doesn't matter, names must match</span>
const { name, age } = user;
const { name: fullName } = user;         <span class="c">// rename while unpacking</span>
const { role = "guest" } = user;         <span class="c">// default when the key is missing</span>
const { address: { city } } = user;      <span class="c">// nested, straight to "city"</span>

<span class="c">// Array destructuring — position IS the match, gaps are allowed</span>
const [first, , third] = [10, 20, 30];   <span class="c">// skips index 1</span>
const [head, ...tail] = [1, 2, 3, 4];    <span class="c">// head = 1, tail = [2, 3, 4]</span></code></pre>
<div class="try">
  <pre><code>let x = 1, y = 2;
[x, y] = [y, x];
console.log(x, y);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>2 1</code> — swapped, with no temporary variable. The right
  side builds a whole new array <code>[y, x]</code> first, then
  destructuring unpacks it back into <code>x</code> and <code>y</code>
  in one step.
</p>
<p>
  Destructuring is everywhere a value shows up, including function
  parameters — a very common way to accept an options object:
</p>
<pre><code>function createUser({ name, age = 18 }) {
  return name + " is " + age;
}
createUser({ name: "Ana" });   <span class="c">// "Ana is 18"</span></code></pre>

<h3>Spread — the opposite of destructuring</h3>
<p>
  <code>...</code> on the way <em>in</em> (an array/object literal, a
  function call) expands a collection into its individual elements.
</p>
<pre><code>const a = [1, 2, 3];
const b = [...a, 4, 5];        <span class="c">// [1, 2, 3, 4, 5] — a new array</span>

const base = { name: "Ana", age: 29 };
const patched = { ...base, age: 30 };  <span class="c">// { name: "Ana", age: 30 } — later keys win</span>

Math.max(...a);                <span class="c">// spreads the array into 3 separate arguments</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Spread copies one level deep only</span>
  <code>{ ...base }</code> makes a fresh top-level object, but any
  property that's itself an object or array is still the
  <em>same reference</em>, shared between the original and the copy.
  Mutate a nested field through the copy and the original sees it too —
  the reference-copying rule from earlier never went away, spread just
  copies the outer layer for you.
</div>
<pre><code>const original = { nested: { count: 1 } };
const copy = { ...original };
copy.nested.count = 99;
console.log(original.nested.count);   <span class="c">// 99 — same nested object, not a copy of it</span></code></pre>

<h3>What comes next</h3>
<p>
  The rest of the toolbox is <a href="/notes/objects-deep">Objects deeply</a>:
  getters and setters, the <code>Object</code> statics, shallow versus deep
  copying, <code>Map</code> and <code>Set</code> and their weak versions, sort
  stability, <code>JSON</code> with a replacer and reviver, and the array methods
  this chapter did not reach. It is written to follow directly from here.
</p>`,
};
