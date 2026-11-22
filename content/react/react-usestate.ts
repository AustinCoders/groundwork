import type { Chapter } from "../types";

export const reactUsestate: Chapter = {
  id: "react-usestate",
  num: "B5",
  title: "State with useState",
  short: "useState",
  levels: ["beginner"],
  prerequisites: ["react-components", "react-props"],
  practice: [
    "ex-react-updater-batch",
    "ex-react-toggle-field",
    "ex-comp-counter-step",
    "ex-comp-lazy-init-count",
    "ex-comp-functional-batched-updates",
  ],
  ready: true,
  subtitle: "State is memory between renders, and setting it is a request, not an assignment.",
  body: `<p>
  Props come from outside a component. State is the component's own memory: a value React keeps for it between
  renders, which changes when the user does something. This chapter builds that idea from the bug it fixes, then
  walks through the four rules that cause almost every <code>useState</code> mistake: a render is a snapshot,
  setting state queues an update, state is replaced rather than changed, and React finds your state by the order
  you call the hooks. It assumes you can write a component and pass it props, and that closures from the
  JavaScript chapters are familiar. Everything here was run against React 19.3.
</p>

<h3>Why a plain variable does not work</h3>
<pre><code>function Counter() {
  let count = 0;
  return &lt;button onClick={() =&gt; count++}&gt;{count}&lt;/button&gt;;
}</code></pre>
<p>
  Click it and the screen stays at 0. There are two separate problems, and it helps to see both before the fix.
</p>
<p>
  First, <code>count</code> is a local variable. React renders a component by calling the function, and every call
  starts from <code>let count = 0</code>, so even if something did re-render the component, the value would be gone.
  A function has no memory of its previous calls.
</p>
<p>
  Second, <code>count++</code> changes a variable React knows nothing about. React only re-renders when it is told
  something changed, and assigning to a local is not telling it anything. So the click does change
  <code>count</code> to 1, inside that one closure, and nothing on screen moves.
</p>
<p>
  State fixes both at once:
</p>
<pre><code>import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return &lt;button onClick={() =&gt; setCount(count + 1)}&gt;{count}&lt;/button&gt;;
}</code></pre>
<p>
  <code>useState(0)</code> returns a pair: the current value, and a function that asks for a new one. React stores
  the value outside your function, attached to this component on the screen, so it survives from one render to the
  next. Calling <code>setCount</code> is the "something changed" signal: React schedules another render, calls
  <code>Counter</code> again, and this time <code>useState</code> hands back 1. The <code>0</code> you passed is only
  used the very first time.
</p>

<h3>Where the value actually lives</h3>
<p>
  It is worth having a picture of what React does, because the rules later in the chapter fall straight out of it.
  For every component on the screen, React keeps a small record. One part of that record is a list of hook slots,
  one per hook call, in the order the component made them. <code>useState</code> on the first render creates a slot
  and stores the initial value in it. On every later render, the first <code>useState</code> call reads slot 0, the
  second reads slot 1, and so on.
</p>
<figure>
  <svg viewBox="0 0 760 250" class="dg" role="img" aria-label="A click calls setCount, which puts an update in a queue on the component's state slot. React then calls Counter again, useState reads the slot after applying the queue, and the new JSX is committed to the screen.">
    <g class="rough">
      <rect class="box" x="20" y="30" width="150" height="60" rx="10" />
      <rect class="box" x="230" y="30" width="190" height="60" rx="10" />
      <rect class="boxg" x="480" y="30" width="250" height="60" rx="10" />
      <rect class="box" x="480" y="160" width="250" height="60" rx="10" />
      <rect class="box" x="230" y="160" width="190" height="60" rx="10" />
      <path class="ln" d="M170 60 H224" marker-end="url(#arrow)" />
      <path class="ln" d="M420 60 H474" marker-end="url(#arrow)" />
      <path class="ln" d="M605 90 V154" marker-end="url(#arrow)" />
      <path class="ln" d="M480 190 H426" marker-end="url(#arrow)" />
    </g>
    <text class="lbl" x="95" y="56" text-anchor="middle">click</text>
    <text class="sm" x="95" y="76" text-anchor="middle">onClick runs</text>
    <text class="lbl" x="325" y="56" text-anchor="middle">setCount(…)</text>
    <text class="sm" x="325" y="76" text-anchor="middle">adds to the queue</text>
    <text class="lbl" x="605" y="56" text-anchor="middle">React's record for Counter</text>
    <text class="sm" x="605" y="76" text-anchor="middle">slot 0: 0, queue: [+1]</text>
    <text class="lbl" x="605" y="186" text-anchor="middle">Counter() runs again</text>
    <text class="sm" x="605" y="206" text-anchor="middle">useState applies the queue: 1</text>
    <text class="lbl" x="325" y="186" text-anchor="middle">commit</text>
    <text class="sm" x="325" y="206" text-anchor="middle">the button now shows 1</text>
  </svg>
  <figcaption>
    The value is never inside your function. Your function reads it from React's record on each call, and the setter
    leaves a note on that record for the next call to apply.
  </figcaption>
</figure>
<p>
  Two consequences follow immediately. The state belongs to one component <em>on the screen</em>, not to the
  function, so two <code>&lt;Counter /&gt;</code> elements next to each other each have their own count. And the
  slots are matched by position, not by name, which is why hooks have rules about where you can call them. Both come
  back later.
</p>

<h3>A render is a snapshot</h3>
<p>
  This is the idea that makes the rest of React make sense. Inside one render, <code>count</code> is a
  <code>const</code>. It was read from the slot when the function started, and nothing during that call will change
  it. Calling the setter does not reach into the running function and update the variable; it leaves a note for the
  next render.
</p>
<pre><code>function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 5);
    console.log(count);              <span class="c">// 0: this render's count</span>
    setTimeout(() =&gt; {
      console.log(count);            <span class="c">// still 0, a second later</span>
    }, 1000);
  }

  return &lt;button onClick={handleClick}&gt;{count}&lt;/button&gt;;
}</code></pre>
<p>
  The first log surprises people, and the second surprises them more: by the time the timeout fires, the screen
  shows 5, yet the callback logs 0. That is plain JavaScript closure behaviour. <code>handleClick</code> was created
  during the render where <code>count</code> was 0, so every function created in that render, including the timeout
  callback, closes over that 0. The next render creates new functions that close over 5. Nothing is "stale" in a
  buggy sense; each render's functions see that render's values, which is exactly what makes UI code predictable.
  An event handler can never observe the value change halfway through.
</p>
<div class="bx is-prim">
  <span class="ttl">The rule to carry</span>
  <p>
    Setting state does not change the variable you already have. It changes what <code>useState</code> will return
    the next time React calls your component.
  </p>
</div>

<h3>Setting state queues an update</h3>
<p>
  The snapshot rule explains the most famous <code>useState</code> bug:
</p>
<pre><code>function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}</code></pre>
<p>
  With <code>count</code> at 0, this adds 1, not 3. All three lines read the same snapshot, so all three say "make it
  1". The fix is to pass the setter a function instead of a value:
</p>
<pre><code>function handleClick() {
  setCount((c) =&gt; c + 1);
  setCount((c) =&gt; c + 1);
  setCount((c) =&gt; c + 1);   <span class="c">// adds 3</span>
}</code></pre>
<p>
  A function passed to a setter is called an <b>updater</b>. React does not run it straight away. Every setter call,
  value or function, is appended to a queue on that state slot, and the queue is processed in order during the next
  render. A value in the queue means "replace whatever you have with this". An updater means "take whatever you have
  so far and give me the next one". Because each updater receives the result of the previous entry, chained updaters
  compose; chained values just overwrite each other.
</p>

<h4>Worked example: tracing the queue by hand</h4>
<p>
  Here is a handler that mixes both kinds, so you can see the rule doing its job. The count starts at 0.
</p>
<pre><code>function handleClick() {
  setCount(count + 3);        <span class="c">// a value: count is 0 here, so this is 3</span>
  setCount((c) =&gt; c * 2);
  setCount((c) =&gt; c + 1);
}</code></pre>
<p>
  While the handler runs, nothing is calculated except <code>count + 3</code>, which uses the snapshot and becomes the
  plain value 3. The queue ends up holding three entries. On the next render React walks it:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Queue entry</th><th>Kind</th><th>Value going in</th><th>Value coming out</th></tr></thead>
<tbody>
<tr><td><code>3</code></td><td>value: replace</td><td>0</td><td>3</td></tr>
<tr><td><code>(c) =&gt; c * 2</code></td><td>updater: compute</td><td>3</td><td>6</td></tr>
<tr><td><code>(c) =&gt; c + 1</code></td><td>updater: compute</td><td>6</td><td>7</td></tr>
</tbody>
</table></div>
<p>
  The screen shows 7, after one render, not three. Click again: now the snapshot is 7, so the first entry is the value
  10, then 20, then 21. Now change the order so a value comes last, with the count at 5:
</p>
<pre><code>setCount((c) =&gt; c + 1);       <span class="c">// 5 → 6</span>
setCount(count + 10);         <span class="c">// value 15: throws the 6 away</span>
setCount((c) =&gt; c * 2);       <span class="c">// 15 → 30</span></code></pre>
<p>
  The result is 30. The updater before the value had no effect, because a value replaces whatever came before it.
  If you can trace these two by hand, you understand the queue.
</p>
<p class="sub">
  Rule of thumb: when the next value is computed <em>from</em> the current one, use an updater. It is never wrong,
  and it is the only correct choice inside timers, intervals and anything asynchronous, where the snapshot you closed
  over may be several renders old. When the next value does not depend on the old one, such as
  <code>setName(event.target.value)</code>, a plain value is clearer.
</p>
<p>
  By convention the updater's parameter is the first letter of the state (<code>c</code> for count) or the full
  name with a prefix such as <code>prevCount</code>. Updaters must be pure: take the old value, return the new one,
  and do nothing else. In development under <code>&lt;StrictMode&gt;</code>, React deliberately calls each updater
  twice and keeps one result, so an updater that pushes to an outside array or logs analytics will visibly do it
  twice. That double call is a test, and it only happens in development.
</p>

<h3>Batching: one render per event</h3>
<p>
  Look again at the traced example: three setter calls, one render. React collects every state update made while
  it is handling an event and re-renders once at the end. That is called batching, and it is why calling three
  setters in a row is not three times as expensive as calling one. It also means the screen never shows a
  half-updated state where the first setter has applied and the second has not.
</p>
<p>
  Since React 18 batching is automatic everywhere: in click handlers, but also inside <code>setTimeout</code>,
  promise callbacks and native event listeners. Before 18, updates outside React event handlers rendered one by one,
  which is why older tutorials talk about <code>unstable_batchedUpdates</code>. You do not need it.
</p>
<pre><code>button.addEventListener("click", () =&gt; {
  setTimeout(() =&gt; {
    setFirstName("Ana");
    setLastName("Silva");   <span class="c">// one render for both, in React 18 and later</span>
  }, 0);
});</code></pre>
<p>
  Occasionally you need the screen updated right now, before the next line runs, for example to scroll to an item
  you just added. <code>flushSync</code> from <code>react-dom</code> forces the updates inside it to render
  synchronously:
</p>
<pre><code>import { flushSync } from "react-dom";

function addItem(item) {
  flushSync(() =&gt; {
    setItems((list) =&gt; [...list, item]);
  });
  listRef.current.lastChild.scrollIntoView();   <span class="c">// the new item is in the DOM now</span>
}</code></pre>
<p>
  It is an escape hatch, it costs a render, and most applications need it a handful of times at most. Refs, used in
  that example, have <a href="/react/react-useref">their own chapter</a>.
</p>

<h3>How React knows which state is which</h3>
<p>
  <code>useState</code> takes no name. A component with two pieces of state just calls it twice:
</p>
<pre><code>function Profile() {
  const [name, setName] = useState("");   <span class="c">// slot 0</span>
  const [age, setAge] = useState(0);      <span class="c">// slot 1</span>
  <span class="c">// …</span>
}</code></pre>
<p>
  The names <code>name</code> and <code>age</code> exist only in your source. React sees "first hook call, second
  hook call". That is fine as long as the calls happen in the same order on every render. Now break that:
</p>
<pre><code>function Profile({ showAge }) {
  const [name, setName] = useState("");
  if (showAge) {
    const [age, setAge] = useState(0);   <span class="c">// ✗ only sometimes slot 1</span>
  }
  const [email, setEmail] = useState(""); <span class="c">// slot 1 or slot 2?</span>
}</code></pre>
<p>
  When <code>showAge</code> flips from true to false, the <code>email</code> call becomes the second hook call and
  reads the slot that used to hold <code>age</code>. React detects the change in the number of hooks and throws, but
  the deeper point is that state is addressed by position. That is the whole reason for the rules of hooks:
</p>
<div class="bx is-prim">
  <span class="ttl">The rules of hooks, and why each exists</span>
  <ul>
    <li><b>Call hooks only at the top level of a component or custom hook.</b> Not inside conditions, loops, nested functions or after an early <code>return</code>, so the call order is identical on every render.</li>
    <li><b>Call hooks only from React function components or other hooks.</b> A plain function has no component record to attach slots to.</li>
  </ul>
  <p>
    The <code>eslint-plugin-react-hooks</code> rules check both, and Next.js and Vite templates turn them on. Treat a
    warning from them as a bug report. If you need state only in some situations, move the condition inside the
    value (<code>useState(0)</code> unconditionally, then ignore it) or split the conditional part into its own
    component, which gets its own record.
  </p>
</div>

<h3>State belongs to a component on the screen</h3>
<p>
  Since state lives in React's record for one rendered component, two copies of the same component do not share it:
</p>
<pre><code>function Counter() {
  const [count, setCount] = useState(0);
  return &lt;button onClick={() =&gt; setCount(count + 1)}&gt;{count}&lt;/button&gt;;
}

function Panel() {
  return (
    &lt;div&gt;
      &lt;Counter /&gt;
      &lt;Counter /&gt;   <span class="c">// clicking one leaves the other alone</span>
    &lt;/div&gt;
  );
}</code></pre>
<p>
  React keeps a record as long as a component of the same type stays at the same position in the tree. Re-rendering
  the parent does not reset the child's state. Removing the child, or rendering a different component in its place,
  throws the record away; when it comes back, it starts again from the initial value.
</p>
<p>
  You can use that on purpose. Give a component a <code>key</code>, and React treats a different key as a different
  component, so changing the key resets all of its state in one go:
</p>
<pre><code>&lt;ChatInput key={contactId} /&gt;   <span class="c">// switching contact starts with an empty draft</span></code></pre>
<p>
  That is far cleaner than an effect that watches <code>contactId</code> and calls three setters. Keys get a full
  treatment in <a href="/react/react-lists-keys">lists and keys</a>.
</p>

<h3>The initial value is used once</h3>
<p>
  The argument to <code>useState</code> is only read on the first render. That has two consequences beginners hit
  in their first week.
</p>
<p>
  The first is that state does not follow a prop it was initialised from:
</p>
<pre><code>function Greeting({ name }) {
  const [shown, setShown] = useState(name);   <span class="c">// copies name once</span>
  return &lt;p&gt;Hello, {shown}&lt;/p&gt;;
}</code></pre>
<p>
  If the parent later passes a different <code>name</code>, the paragraph keeps the old one, because the slot already
  has a value and the argument is ignored. Usually the fix is to not have state at all and render the prop directly.
  If the component really needs an editable copy that starts from the prop, name the prop
  <code>initialName</code> so the behaviour is obvious, and use a <code>key</code> when the parent wants a reset.
</p>
<p>
  The second is cost. The argument expression is still <em>evaluated</em> on every render, because that is how
  JavaScript calls work: the argument is computed before <code>useState</code> runs, and only then ignored.
</p>
<pre><code>const [draft, setDraft] = useState(JSON.parse(localStorage.getItem("draft")));        <span class="c">// parses on every render</span>
const [draft, setDraft] = useState(() =&gt; JSON.parse(localStorage.getItem("draft"))); <span class="c">// parses once</span></code></pre>
<p>
  Passing a function makes it a <b>lazy initialiser</b>: React calls it on the first render only. Pass the function
  itself, not a call to it. <code>useState(readDraft)</code> is lazy; <code>useState(readDraft())</code> is not.
</p>
<p>
  One trap hides here. Because a function argument means "call me to get the initial value", you cannot store a
  function in state by passing it directly. <code>useState(handler)</code> stores whatever <code>handler()</code>
  returns. To store the function itself, wrap it: <code>useState(() =&gt; handler)</code>. The same applies to the
  setter, where <code>setHandler(fn)</code> is treated as an updater; write <code>setHandler(() =&gt; fn)</code>.
</p>

<h3>Replace state, never change it</h3>
<p>
  For numbers, strings and booleans there is no other option: you cannot change the number 3, only replace it. Objects
  and arrays can be changed in place, and that is where React code goes wrong.
</p>
<pre><code>const [items, setItems] = useState(["a"]);

function add() {
  items.push("b");    <span class="c">// ✗ changes the array React already holds</span>
  setItems(items);    <span class="c">// same reference → React skips the render</span>
}</code></pre>
<p>
  Nothing appears on screen. React decides whether state changed by comparing the old and new values with
  <code>Object.is</code>, which for objects and arrays compares references, not contents. <code>items</code> after
  <code>push</code> is still the same array, so as far as React can tell, you asked it to replace a value with itself,
  and it skips the work. Worse, if something else causes a re-render later, the change suddenly appears, which makes
  the bug look random.
</p>
<p>
  Mutation also breaks the snapshot. A previous render's closures expected their <code>items</code> to stay as they
  were; mutating it rewrites history under them. Features that depend on comparing old and new values, such as
  <code>memo</code>, effect dependencies and undo stacks, all assume nothing was edited in place.
</p>
<p>
  The fix is always to create a new value:
</p>
<pre><code>setItems([...items, "b"]);                                  <span class="c">// add</span>
setItems(items.filter((item) =&gt; item !== "a"));              <span class="c">// remove</span>
setUser({ ...user, name: "Ana" });                          <span class="c">// change one field</span></code></pre>
<div class="table-scroll"><table>
<thead><tr><th>You want to</th><th>Write</th><th>Avoid (mutates)</th></tr></thead>
<tbody>
<tr><td>add to the end</td><td><code>[...items, item]</code></td><td><code>push</code></td></tr>
<tr><td>add to the front</td><td><code>[item, ...items]</code></td><td><code>unshift</code></td></tr>
<tr><td>remove by id</td><td><code>items.filter((i) =&gt; i.id !== id)</code></td><td><code>splice</code></td></tr>
<tr><td>change one item</td><td><code>items.map((i) =&gt; (i.id === id ? { ...i, done: true } : i))</code></td><td><code>items[k].done = true</code></td></tr>
<tr><td>insert at index <code>k</code></td><td><code>[...items.slice(0, k), item, ...items.slice(k)]</code></td><td><code>splice</code></td></tr>
<tr><td>sort or reverse</td><td><code>items.toSorted()</code>, <code>items.toReversed()</code></td><td><code>sort</code>, <code>reverse</code></td></tr>
</tbody>
</table></div>
<p class="sub">
  <code>map</code>, <code>filter</code>, <code>slice</code>, <code>concat</code> and the newer
  <code>toSorted</code>, <code>toReversed</code>, <code>toSpliced</code> and <code>with</code> return new arrays;
  every current browser supports them. <code>push</code>, <code>pop</code>, <code>shift</code>, <code>unshift</code>,
  <code>splice</code>, <code>sort</code> and <code>reverse</code> change the array you call them on. Knowing which
  list a method is on is most of this skill.
</p>

<h4>Nested objects need a spread at every level</h4>
<p>
  A spread copies one level. Inner objects are shared between the old copy and the new one, so changing a nested
  field means copying each object on the path to it:
</p>
<pre><code>setUser({
  ...user,
  address: { ...user.address, city: "Pune" },
});</code></pre>
<p>
  Writing <code>user.address.city = "Pune"</code> and then <code>setUser({ ...user })</code> looks like it works,
  because the new outer object triggers a render, but it has still mutated the address object the previous render
  holds. If the spreads reach three levels deep, the state is shaped wrong: flatten it, split it into separate
  pieces of state, or move to <a href="/react/react-usereducer">useReducer</a>. For genuinely deep data, the Immer
  library lets you write mutating code against a draft and produces the new objects for you.
</p>

<h3>When React skips a render</h3>
<p>
  The same <code>Object.is</code> comparison has a useful side. If you set state to a value equal to the current one,
  React bails out: it does not re-render that component or its children.
</p>
<pre><code>setCount(5);              <span class="c">// count is already 5: no re-render</span>
setUser({ ...user });     <span class="c">// a new object, even with identical fields: re-renders</span></code></pre>
<p>
  The second line is the cost side. Spreading "just to be safe" creates a new reference every time, so React has to
  render even though nothing visible changed. React's documentation notes that it may occasionally call your
  component once more before bailing out, so treat the skip as an optimisation, never as something code depends on.
</p>
<p>
  How expensive is all this? Comparing with <code>Object.is</code> is constant time. An immutable update of an array
  or object with <em>n</em> entries is O(<em>n</em>), because the spread copies every entry. For the lists a typical
  screen holds, hundreds or a few thousand items, that is microseconds and never the bottleneck; the render it causes
  costs more. The real cost to watch is the render itself: each committed state change re-runs the component and, by
  default, every child it renders. Batching keeps that to one render per event, and later chapters on
  <a href="/react/react-memoisation">memoisation</a> show how to skip children that did not change.
</p>

<h3>One state or several?</h3>
<pre><code><span class="c">// separate pieces: usually better</span>
const [name, setName] = useState("");
const [age, setAge] = useState(0);

<span class="c">// one object: when the fields always change together</span>
const [position, setPosition] = useState({ x: 0, y: 0 });</code></pre>
<p>
  Separate state is easier to update, since there is nothing to spread, and each piece can be passed to a child on
  its own. Group values when they genuinely change as a unit: the two coordinates of a pointer, the fields of one form
  you submit together. A useful test is whether you would ever update one without the other.
</p>
<p>
  A related mistake is several booleans that describe one thing:
</p>
<pre><code>const [isSending, setIsSending] = useState(false);
const [isSent, setIsSent] = useState(false);
const [isError, setIsError] = useState(false);</code></pre>
<p>
  Three booleans allow eight combinations, and most are nonsense: sending and sent at once, sent and failed at once.
  Every handler has to remember to set all three correctly, and one day one will not. Replace them with a single
  value that can only hold valid states:
</p>
<pre><code>const [status, setStatus] = useState("idle");   <span class="c">// "idle" | "sending" | "sent" | "error"</span></code></pre>
<p>
  Now an impossible combination cannot be written, and each handler sets one thing. This pattern grows into the
  state machines of a later chapter.
</p>

<h3>What should be state, and what should not</h3>
<p>
  The most common source of tangled React is state that should not exist. Before adding a <code>useState</code>, ask
  these in order:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Question</th><th>If the answer is yes</th></tr></thead>
<tbody>
<tr><td>Can it be computed from props or other state?</td><td>Compute it while rendering. Do not store it.</td></tr>
<tr><td>Does the screen stay the same when it changes?</td><td>It should be a <a href="/react/react-useref">ref</a>, not state.</td></tr>
<tr><td>Does a sibling or parent need it too?</td><td><a href="/react/react-lifting-styling">Lift it</a> to the closest common parent and pass it down.</td></tr>
<tr><td>Is the same fact already stored somewhere else?</td><td>Keep one copy. Two copies drift apart.</td></tr>
</tbody>
</table></div>
<pre><code>const [items, setItems] = useState([]);
const [count, setCount] = useState(0);            <span class="c">// ✗ a second copy of items.length</span>

const count = items.length;                       <span class="c">// ✓ always right, nothing to keep in sync</span>
const total = items.reduce((sum, i) =&gt; sum + i.price, 0);</code></pre>
<p>
  Derived values computed during render cannot go out of date, because they are recomputed from the source every
  time. Storing them means every handler that changes <code>items</code> also has to remember <code>count</code>,
  and the one that forgets produces a bug that only shows in some orders of clicks. If a derived value is genuinely
  expensive to compute, the answer is <code>useMemo</code>, not more state.
</p>

<h3>Typing state with TypeScript</h3>
<p>
  TypeScript infers the type from the initial value, so <code>useState(0)</code> is a number and
  <code>useState("")</code> a string. Give the type explicitly when the initial value does not show the full range:
</p>
<pre><code>const [user, setUser] = useState&lt;User | null&gt;(null);
const [status, setStatus] = useState&lt;"idle" | "sending" | "sent" | "error"&gt;("idle");
const [tags, setTags] = useState&lt;string[]&gt;([]);   <span class="c">// [] alone would be never[]</span></code></pre>
<p>
  The setter's type is <code>Dispatch&lt;SetStateAction&lt;T&gt;&gt;</code>: it accepts a <code>T</code> or a
  function from <code>T</code> to <code>T</code>, which is exactly the value-or-updater rule from this chapter.
</p>

<h3>Pitfalls</h3>
<ul>
  <li><b>Calling the setter during render.</b> <code>onClick={setCount(count + 1)}</code> calls it while rendering, which schedules another render, which calls it again: React stops with "Too many re-renders". Pass a function: <code>onClick={() =&gt; setCount(count + 1)}</code>.</li>
  <li><b>Reading state right after setting it.</b> The variable is this render's snapshot. If you need the new value in the same handler, compute it into a local first: <code>const next = count + 1; setCount(next); save(next);</code></li>
  <li><b>Chaining values instead of updaters.</b> <code>setCount(count + 1)</code> twice adds one. Use <code>(c) =&gt; c + 1</code> whenever the next value depends on the last.</li>
  <li><b>Mutating, then setting the same object.</b> <code>push</code>, <code>sort</code> or a nested assignment followed by a set of the same reference is skipped. Create a new array or object.</li>
  <li><b>Copying props into state</b> and expecting the copy to follow the prop. It is read once. Render the prop, or reset with a <code>key</code>.</li>
  <li><b>Storing derived data,</b> such as a count, a filtered list or a total, beside the data it comes from. Compute it during render.</li>
  <li><b>Conditional hooks,</b> or a hook after an early <code>return</code>. Slots are matched by call order; keep every hook at the top level.</li>
  <li><b>Impure updaters.</b> An updater that writes outside itself runs twice in development under Strict Mode. Keep it to "old value in, new value out".</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>The screen must change in response to something the user does, and the value is not given by a parent: that is component state.</li>
  <li>"The count only goes up by one" or "the value is one step behind": a snapshot is being read where an updater is needed.</li>
  <li>"I set it but nothing re-rendered": look for <code>push</code>, <code>sort</code>, <code>splice</code> or an assignment into an object that is then set again.</li>
  <li>"It shows the old prop after the parent changes it": state was initialised from a prop.</li>
  <li>Two pieces of state that must always agree, or a set of booleans where some combinations are impossible: one of them should not be state, or they should become one value.</li>
</ul>

<h3>Interview questions</h3>
<p>
  <b>1. Why does calling <code>setCount(count + 1)</code> three times in one handler only add one?</b>
</p>
<p>
  Each render has a fixed snapshot of state, so all three calls read the same <code>count</code> and queue the same
  value. Setting state does not change the variable; it queues an update that is applied on the next render, and
  React batches all three into that one render. The fix is the updater form, <code>setCount((c) =&gt; c + 1)</code>,
  because React passes each updater the result of the previous one.
</p>
<p class="sub">
  <i>Follow-up: what if one of the calls is a plain value in the middle?</i> The queue is processed in order. A value
  replaces whatever has been computed so far, and updaters after it start from that value. So
  <code>c =&gt; c + 1</code>, then <code>count + 10</code>, then <code>c =&gt; c * 2</code> with count 5 gives 30: the
  first updater's work is thrown away by the value.
</p>
<p>
  <b>2. How does React know which <code>useState</code> call is which?</b>
</p>
<p>
  By call order. React keeps a list of hook slots for each rendered component and hands them out in the order the
  hooks are called. That is why hooks must be called unconditionally at the top level: if a condition skips one call,
  every later hook reads the wrong slot.
</p>
<p class="sub">
  <i>Follow-up: how would you have state only when a prop is true?</i> Call the hook unconditionally and just not use
  the value when the prop is false, or move that part of the UI into its own component and render it conditionally;
  the child gets its own record, so its hooks are always called in a fixed order within it.
</p>
<p>
  <b>3. Why must you not mutate state?</b>
</p>
<p>
  React compares old and new state with <code>Object.is</code>, which compares references for objects. A mutated
  array is the same reference, so React concludes nothing changed and skips the render. Mutation also edits the
  snapshot earlier renders still hold, which breaks memoisation, effect dependencies and anything that compares
  before and after.
</p>
<p class="sub">
  <i>Follow-up: what about a deeply nested update?</i> Spread at every level on the path to the field. If that gets
  three levels deep, flatten the state, split it, use <code>useReducer</code>, or use Immer to write the update
  against a draft.
</p>
<p>
  <b>4. When would you pass a function to <code>useState</code>?</b>
</p>
<p>
  When computing the initial value is expensive, such as parsing from <code>localStorage</code> or building a large
  structure. The argument is evaluated on every render but only used on the first, so passing a function makes React
  call it once. The other case is storing a function in state, which has to be wrapped:
  <code>useState(() =&gt; fn)</code>.
</p>
<p class="sub">
  <i>Follow-up: why does the initialiser run twice in development?</i> Strict Mode calls initialisers and updaters
  twice in development to surface impure ones, and keeps one result. It does not happen in production, and a pure
  initialiser gives the same result either way.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "Is <code>setState</code> asynchronous?" The tempting answer is "yes". The accurate one: the setter itself runs
    synchronously and returns immediately, but it does not change the current render's variable; it queues an update
    that React applies when it next renders, which it batches until the end of the event. There is no promise to
    await, and <code>await setCount(1)</code> does nothing useful.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "State is a value React keeps for a component between renders, addressed by hook call order. Each render sees a
    fixed snapshot. Calling the setter doesn't assign; it queues an update and React batches the updates from one
    event into one re-render. So when the next value depends on the current one I use the updater form, I always
    replace objects and arrays instead of mutating them, and I don't put anything in state that I can compute from
    props or other state."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain both reasons a plain <code>let</code> variable cannot hold a counter.</li>
    <li>Say why a <code>setTimeout</code> created in a click handler logs the value from before the click.</li>
    <li>Trace a queue mixing values and updaters by hand, as in the table above, and get the final number.</li>
    <li>State what batching means and since which React version it covers timeouts and promises.</li>
    <li>Explain why hooks cannot go inside an <code>if</code>, in terms of slots and call order.</li>
    <li>Write the immutable version of add, remove, update-one and sort for an array in state.</li>
    <li>Say when to use a lazy initialiser, and how to store a function in state.</li>
    <li>Given a component with three related booleans or a stored count, rewrite it so the impossible states and the duplicated data are gone.</li>
  </ul>
</div>`,
};
