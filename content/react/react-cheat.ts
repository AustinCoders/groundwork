import type { Chapter } from "../types";

export const reactCheat: Chapter = {
  id: "react-cheat",
  num: "★",
  title: "The React cheat page",
  short: "Cheat page",
  levels: ["beginner", "intermediate", "advanced"],
  practice: [],
  ready: true,
  subtitle: "Everything worth having in front of you, on one page.",
  body: `<h3>Hooks, at a glance</h3>
<div class="table-scroll"><table>
<thead><tr><th>Hook</th><th>Use it for</th><th>Watch for</th></tr></thead>
<tbody>
<tr><td><code>useState</code></td><td>Value the UI renders</td><td>Updater form when the next value depends on the current</td></tr>
<tr><td><code>useReducer</code></td><td>Several fields that move together</td><td><code>dispatch</code> is stable &mdash; never needs a dependency</td></tr>
<tr><td><code>useRef</code></td><td>DOM nodes; values that survive but do not render</td><td>Never read or write during render</td></tr>
<tr><td><code>useEffect</code></td><td>Synchronising with something outside React</td><td>Most effects should not exist</td></tr>
<tr><td><code>useLayoutEffect</code></td><td>Measure and adjust before paint</td><td>Blocks painting; warns during SSR</td></tr>
<tr><td><code>useEffectEvent</code></td><td>Latest value inside an effect, without depending on it</td><td>Only callable from an effect in the same component</td></tr>
<tr><td><code>useMemo</code></td><td>Expensive value; referential stability</td><td>Costs more than it saves for arithmetic</td></tr>
<tr><td><code>useCallback</code></td><td>Stable function identity</td><td>Pointless unless the consumer is memoised or a dependency</td></tr>
<tr><td><code>useTransition</code></td><td>Mark an update interruptible</td><td>Gives <code>isPending</code>; dim, do not blank</td></tr>
<tr><td><code>useDeferredValue</code></td><td>Same, when the value is a prop</td><td>Renders twice by design</td></tr>
<tr><td><code>useId</code></td><td>Linking label to input in a reusable component</td><td>Not for list keys</td></tr>
<tr><td><code>useSyncExternalStore</code></td><td>State outside React</td><td>Snapshot must be referentially stable</td></tr>
<tr><td><code>useContext</code></td><td>Reading ambient values</td><td>Every consumer re-renders on identity change</td></tr>
<tr><td><code>useImperativeHandle</code></td><td>Exposing a small API instead of a node</td><td>Usually a prop would do</td></tr>
</tbody>
</table></div>

<h3>The rules of hooks, and why</h3>
<ul>
  <li><b>Top level only.</b> React matches hooks to state <em>by call order</em>, so a hook in a condition shifts every slot after it.</li>
  <li><b>From React functions only.</b> Components or other hooks &mdash; there is no instance to attach to otherwise.</li>
  <li><b>The exception:</b> <code>use()</code> can be called conditionally, because it stores nothing in the hook list.</li>
</ul>

<h3>Rendering &mdash; the 30-second version</h3>
<pre><code>state changes → render (pure, interruptible) → diff → commit (sync) → paint → effects</code></pre>
<ul>
  <li><b>Each render is a snapshot.</b> <code>count</code> does not change mid-render.</li>
  <li><b>Setting state schedules</b>, it does not assign. Three <code>setCount(count + 1)</code> add one.</li>
  <li><b>Diffing is per type and per position.</b> Different type at a position &rarr; unmount and remount, state lost.</li>
  <li><b>Children re-render by default</b> when a parent does. Usually fine.</li>
</ul>

<h3>Keys</h3>
<div class="table-scroll"><table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr><td>What a key is</td><td>Item identity between renders &mdash; not a hint, not a perf trick</td></tr>
<tr><td>Index keys break when</td><td>The list reorders, or an item is removed from anywhere but the end</td></tr>
<tr><td>What breaks</td><td>State, focus, scroll and inputs are preserved on the <em>wrong</em> row</td></tr>
<tr><td>Deliberate use</td><td><code>key={userId}</code> to reset a component's state on purpose</td></tr>
<tr><td>Unique</td><td>Among siblings only, not globally</td></tr>
</tbody>
</table></div>

<h3>State: replace, never mutate</h3>
<pre><code>[...items, item]                                   <span class="c">// add</span>
items.filter((i) =&gt; i.id !== id)                    <span class="c">// remove</span>
items.map((i) =&gt; (i.id === id ? { ...i, done: true } : i))   <span class="c">// update one</span>
[...items].sort()                                   <span class="c">// sort — copy first</span>
{ ...user, address: { ...user.address, city } }     <span class="c">// nested — spread each level</span></code></pre>
<p class="sub">
  Mutating gives React the same reference back, so it concludes nothing changed
  and skips the render.
</p>

<h3>Which state goes where</h3>
<div class="table-scroll"><table>
<thead><tr><th>Kind</th><th>Home</th></tr></thead>
<tbody>
<tr><td>From a server</td><td>A query cache &mdash; TanStack Query, or the framework's loader</td></tr>
<tr><td>Should survive refresh or a shared link</td><td>The URL</td></tr>
<tr><td>One component</td><td><code>useState</code>, right there</td></tr>
<tr><td>A few nearby components</td><td>Lift to the closest common parent</td></tr>
<tr><td>Everywhere, changes rarely</td><td>Context</td></tr>
<tr><td>Everywhere, changes often</td><td>A store with selectors</td></tr>
<tr><td>Does not affect rendering</td><td>A ref</td></tr>
</tbody>
</table></div>

<h3>Effects &mdash; the taxonomy</h3>
<div class="table-scroll"><table>
<thead><tr><th>You want to…</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Compute from props or state</td><td>Nothing. Calculate during render.</td></tr>
<tr><td>React to a click or submit</td><td>The event handler</td></tr>
<tr><td>Reset state when a prop changes</td><td>A <code>key</code></td></tr>
<tr><td>Cache an expensive calculation</td><td><code>useMemo</code></td></tr>
<tr><td>Subscribe to an external store</td><td><code>useSyncExternalStore</code></td></tr>
<tr><td>Fetch data</td><td>A data library, or the server</td></tr>
<tr><td>Connect a socket, timer or browser API</td><td><span class="chip tone-yes">an effect</span></td></tr>
</tbody>
</table></div>

<h3>The bugs, and their one-line fixes</h3>
<div class="table-scroll"><table>
<thead><tr><th>Symptom</th><th>Cause</th><th>Fix</th></tr></thead>
<tbody>
<tr><td>A stray <code>0</code> on the page</td><td><code>{items.length &amp;&amp; ...}</code></td><td><code>length &gt; 0 &amp;&amp;</code></td></tr>
<tr><td>Infinite render loop</td><td>Effect sets state, depends on an object made during render</td><td>Depend on a primitive</td></tr>
<tr><td>Counter stuck at 1</td><td>Stale closure in an interval</td><td>Updater form, or <code>useEffectEvent</code></td></tr>
<tr><td>Typed text jumps rows</td><td>Index keys</td><td>Stable ids</td></tr>
<tr><td>Input is read-only</td><td><code>value</code> with no <code>onChange</code></td><td>Add the handler</td></tr>
<tr><td>"changed uncontrolled to controlled"</td><td><code>useState()</code> with no argument</td><td>Initialise to <code>""</code></td></tr>
<tr><td>Wrong data after fast navigation</td><td>Response race</td><td><code>AbortController</code> in the cleanup</td></tr>
<tr><td>Child loses state every render</td><td>Component defined inside a component</td><td>Move it to module scope</td></tr>
<tr><td><code>memo</code> does nothing</td><td>An inline arrow or object prop</td><td><code>useCallback</code> / <code>useMemo</code>, or move state down</td></tr>
<tr><td>Page reloads on submit</td><td>No <code>preventDefault</code></td><td>Add it, on the <code>&lt;form&gt;</code></td></tr>
</tbody>
</table></div>

<h3>Server and client</h3>
<pre><code>Server Component   no state, no effects, no handlers · can await · ships 0 JS
"use client"       a doorway, not a label — everything it imports is client too
props across       must serialise: no functions (except Server Actions)
"use server"       a public HTTP endpoint — authenticate, authorise, validate</code></pre>

<h3>Performance, in order</h3>
<ol>
  <li>Profile with "why did this render" on. Do not guess.</li>
  <li>Move state down, or pass the expensive subtree as <code>children</code>.</li>
  <li>Virtualise past a few hundred rows.</li>
  <li>Code-split by route; find the one dependency that is a third of the bundle.</li>
  <li>Then memoise, exactly where the profiler pointed.</li>
</ol>

<h3>The accessibility minimum</h3>
<ul>
  <li>A real <code>&lt;button&gt;</code>, not a <code>div</code> with <code>onClick</code>.</li>
  <li>Every control has an accessible name; a placeholder is not a label.</li>
  <li>Move focus on route change &mdash; client navigation does not reset it.</li>
  <li>Do not disable the submit button; explain the failure instead.</li>
  <li>Tab through the flow with the mouse away. Nothing else catches what that catches.</li>
</ul>`,
};
