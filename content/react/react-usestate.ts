import type { Chapter } from "../types";

export const reactUsestate: Chapter = {
  id: "react-usestate",
  num: "B4",
  title: "State with useState",
  short: "useState",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "State is memory between renders — and setting it is a request, not an assignment.",
  body: `<h3>Why a plain variable does not work</h3>
<pre><code>function Counter() {
  let count = 0;                          <span class="c">// reset on every render</span>
  return &lt;button onClick={() =&gt; count++}&gt;{count}&lt;/button&gt;;
}</code></pre>
<p>
  Two separate problems. The variable is recreated each time the function runs,
  so it never remembers anything; and changing it does not tell React that
  anything happened, so nothing re-renders. State solves both.
</p>
<pre><code>const [count, setCount] = useState(0);</code></pre>
<p>
  <code>useState</code> returns the current value and a function to request a
  new one. React keeps the value outside your function, so it survives across
  renders, and calling the setter is what schedules the next render.
</p>

<h3>A render is a snapshot</h3>
<p>
  This is the idea that makes the rest of React click. Each render has its own
  <code>count</code>, fixed for the whole of that render. The value never
  changes mid-render.
</p>
<pre><code>function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count);   <span class="c">// still the old value — always</span>
  }
}</code></pre>
<p>
  <code>setCount</code> does not assign to <code>count</code>. It tells React
  "next time, use this", and React re-runs the component with a fresh
  <code>count</code>. Inside <em>this</em> call, <code>count</code> is a
  <code>const</code> and it is not going to move.
</p>

<div class="bx is-prim">
  <span class="ttl">The classic three-clicks bug</span>
  <pre><code>setCount(count + 1);
setCount(count + 1);
setCount(count + 1);   <span class="c">// count goes up by 1, not 3</span></code></pre>
  <p>
    All three read the same snapshot. If <code>count</code> is 0, all three say
    "make it 1". The fix is the <b>updater form</b>, which receives the latest
    value rather than closing over one:
  </p>
  <pre><code>setCount((c) =&gt; c + 1);
setCount((c) =&gt; c + 1);
setCount((c) =&gt; c + 1);   <span class="c">// 3</span></code></pre>
</div>
<p class="sub">
  Rule of thumb: if the next value is computed <em>from</em> the current one,
  use the updater form. It is never wrong, and it is required inside timers,
  intervals and any async callback.
</p>

<h3>Batching</h3>
<p>
  React collects the state changes made during one event and re-renders once at
  the end. Three <code>setState</code> calls in a click handler produce one
  render, not three. Since React 18 that also applies inside promises, timeouts
  and native event handlers.
</p>

<h3>How React knows which state is which</h3>
<p>
  <code>useState</code> does not take a name. So how does React tell two
  <code>useState</code> calls in the same component apart? <b>By call order.</b>
  It keeps a list per component instance and walks it in the same order every
  render.
</p>
<pre><code>const [name, setName] = useState("");   <span class="c">// slot 0</span>
const [age, setAge] = useState(0);      <span class="c">// slot 1</span></code></pre>
<p>
  Which is the entire reason for the rules of hooks. Put a hook inside an
  <code>if</code> and the call order changes between renders, so slot 1 returns
  the value that belonged to slot 0 &mdash; your age lands in your name.
</p>
<pre><code>if (loggedIn) {
  const [x, setX] = useState(0);   <span class="c">// ✗ shifts every slot after it</span>
}</code></pre>
<div class="bx is-prim">
  <span class="ttl">The rules of hooks, and why they exist</span>
  <ul>
    <li><b>Only at the top level.</b> Not in conditions, loops, or nested functions &mdash; call order must be identical on every render.</li>
    <li><b>Only from React functions.</b> Components or other hooks; there is no component instance to attach to otherwise.</li>
  </ul>
  <p>
    Both are lint rules, and both catch real bugs rather than style. If you need
    conditional state, put the condition <em>inside</em> the component that owns
    it, or split it into two components.
  </p>
</div>

<h3>Several states or one object?</h3>
<pre><code><span class="c">// separate — usually better</span>
const [name, setName] = useState("");
const [age, setAge] = useState(0);

<span class="c">// one object — when the fields always change together</span>
const [form, setForm] = useState({ name: "", age: 0 });</code></pre>
<p>
  Separate state is simpler to update and lets React skip renders more often.
  Group fields only when they genuinely move as a unit &mdash; a form's values,
  a coordinate pair &mdash; and remember that grouping means every update needs
  a spread.
</p>

<h3>State must be replaced, never mutated</h3>
<p>
  React decides whether to re-render by comparing the old value with the new
  one by reference. Mutating an object gives it the same reference back, so it
  concludes nothing changed and skips the render.
</p>
<pre><code><span class="c">// ✗ mutation — no re-render</span>
user.name = "Ana";      setUser(user);
items.push(newItem);    setItems(items);
items.sort();           setItems(items);

<span class="c">// ✓ new value every time</span>
setUser({ ...user, name: "Ana" });
setItems([...items, newItem]);
setItems([...items].sort());</code></pre>

<div class="table-scroll"><table>
<thead><tr><th>Operation</th><th>Immutable version</th></tr></thead>
<tbody>
<tr><td>add to end</td><td><code>[...items, item]</code></td></tr>
<tr><td>add to front</td><td><code>[item, ...items]</code></td></tr>
<tr><td>remove by id</td><td><code>items.filter((i) =&gt; i.id !== id)</code></td></tr>
<tr><td>update one</td><td><code>items.map((i) =&gt; (i.id === id ? { ...i, done: true } : i))</code></td></tr>
<tr><td>insert at index</td><td><code>[...items.slice(0, i), item, ...items.slice(i)]</code></td></tr>
<tr><td>sort / reverse</td><td>copy first: <code>[...items].sort()</code></td></tr>
</tbody>
</table></div>
<p class="sub">
  <code>map</code>, <code>filter</code>, <code>slice</code> and
  <code>concat</code> return new arrays. <code>push</code>, <code>pop</code>,
  <code>splice</code>, <code>sort</code> and <code>reverse</code> change the one
  you have. Knowing which is which is most of this.
</p>

<h3>Nested state</h3>
<p>
  The spread is shallow, so a nested update needs a spread at every level it
  passes through:
</p>
<pre><code>setUser({
  ...user,
  address: { ...user.address, city: "Pune" },
});</code></pre>
<p>
  If you are writing three levels of that, the state is shaped wrong. Flatten
  it, or split it into separate <code>useState</code> calls, or move to
  <a href="/react/react-usereducer">useReducer</a>.
</p>

<h3>Bailing out of a render</h3>
<p>
  If you set state to a value React considers equal &mdash; compared with
  <code>Object.is</code> &mdash; it may skip the re-render entirely.
</p>
<pre><code>setCount(5);      <span class="c">// count is already 5 → no re-render</span>
setUser({ ...user });  <span class="c">// a new object → always re-renders</span></code></pre>
<p>
  This is why spreading an object "just to be safe" is not free: an identical
  copy is a different reference, so React re-renders even though nothing
  changed. React may still render once more before bailing out, so do not treat
  it as a guarantee &mdash; treat it as a reason not to churn objects
  needlessly.
</p>

<h3>Lazy initial state</h3>
<p>
  The argument to <code>useState</code> is evaluated on <em>every</em> render,
  even though it is only used on the first one. If it is expensive, pass a
  function instead &mdash; React calls it once.
</p>
<pre><code>useState(JSON.parse(localStorage.getItem("draft")));    <span class="c">// runs every render</span>
useState(() =&gt; JSON.parse(localStorage.getItem("draft"))); <span class="c">// runs once</span></code></pre>

<h3>What should be state, and what should not</h3>
<p>
  The most common cause of tangled React is state that should not exist. Before
  adding a <code>useState</code>, check:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Question</th><th>If yes</th></tr></thead>
<tbody>
<tr><td>Can it be computed from props or other state?</td><td>Compute it during render. Do not store it.</td></tr>
<tr><td>Does the UI change when it changes?</td><td>If no, it should be a <a href="/react/react-useref">ref</a>.</td></tr>
<tr><td>Does another component need it too?</td><td><a href="/react/react-lifting-styling">Lift it</a> to the nearest common parent.</td></tr>
<tr><td>Is it the same value in two places?</td><td>Delete one. Two sources of truth always drift.</td></tr>
</tbody>
</table></div>
<pre><code>const [items, setItems] = useState([]);
const [count, setCount] = useState(0);   <span class="c">// ✗ derived — will drift</span>
const count = items.length;              <span class="c">// ✓ always right, free</span></code></pre>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "State is a value React keeps between renders, and each render sees a fixed
    snapshot of it. Setting state schedules a re-render rather than assigning,
    which is why you use the updater form when the next value depends on the
    current one, and why state has to be replaced rather than mutated for React
    to notice at all."
  </p>
</div>`,
};
