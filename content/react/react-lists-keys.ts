import type { Chapter } from "../types";

export const reactListsKeys: Chapter = {
  id: "react-lists-keys",
  num: "B7",
  title: "Lists with .map() and keys",
  short: "Lists & keys",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "A key is not for you and it is not for performance — it tells React which item is which.",
  body: `<h3>Rendering a list</h3>
<p>
  There is no loop syntax in JSX, because JSX holds expressions and a
  <code>for</code> loop is a statement. You map an array of data to an array of
  elements, and React renders arrays by rendering each item.
</p>
<pre><code>&lt;ul&gt;
  {tasks.map((task) =&gt; (
    &lt;li key={task.id}&gt;{task.title}&lt;/li&gt;
  ))}
&lt;/ul&gt;</code></pre>
<p class="sub">
  Watch the brackets: <code>(</code> after the arrow returns the JSX. Using
  <code>{</code> opens a function body, and without a <code>return</code> it
  produces <code>undefined</code> and an empty list &mdash; a five-minute bug
  everyone hits once.
</p>

<h3>What a key is for</h3>
<p>
  When a list re-renders, React has an old array of elements and a new one. It
  needs to decide, for each new element, whether it corresponds to an existing
  DOM node it can update, or a new node it must create. <b>The key is that
  identity.</b>
</p>
<p>
  Without keys, React falls back to position: first item to first item, second
  to second. That is correct only if the list never reorders, never has items
  inserted, and never has items removed from anywhere but the end.
</p>

<div class="bx is-prim">
  <span class="ttl">Why index keys break</span>
  <pre><code>{items.map((item, i) =&gt; &lt;Row key={i} item={item} /&gt;)}</code></pre>
  <p>
    Start with <code>[A, B, C]</code> &mdash; keys 0, 1, 2. Delete A. Now you
    have <code>[B, C]</code> with keys 0, 1. React looks at key 0: it existed
    before, so it <em>keeps that DOM node</em> and just changes the props from A
    to B.
  </p>
  <p>
    Everything React was told to preserve is preserved on the wrong item: text
    typed into an input, a checked checkbox, focus, scroll position, and any
    state inside that row. The list looks right until a row has state, and then
    it is baffling.
  </p>
</div>

<h3>Where to find a key</h3>
<div class="table-scroll"><table>
<thead><tr><th>Situation</th><th>Key</th></tr></thead>
<tbody>
<tr><td>Data from a database or API</td><td>The record's id. Always.</td></tr>
<tr><td>Created in the browser</td><td>Generate one at creation: <code>crypto.randomUUID()</code></td></tr>
<tr><td>A genuinely static list</td><td>The index is fine &mdash; but so is not looping at all</td></tr>
<tr><td>No natural id</td><td>A stable field or combination, e.g. <code>country + "-" + city</code></td></tr>
</tbody>
</table></div>
<p>
  Generate ids when the item is <b>created</b>, not while rendering.
  <code>key={Math.random()}</code> or <code>key={crypto.randomUUID()}</code>
  inside <code>map</code> produces a new key every render, so React throws away
  every DOM node and rebuilds the entire list each time &mdash; worse than no
  key at all.
</p>

<h3>The rules</h3>
<ul>
  <li><b>Unique among siblings</b>, not globally. Two different lists can both use key <code>1</code>.</li>
  <li><b>Stable across renders.</b> The same item keeps the same key for its whole life.</li>
  <li><b>On the outermost element</b> of the mapped item &mdash; the thing <code>map</code> returns.</li>
</ul>
<pre><code>{rows.map((row) =&gt; (
  &lt;Fragment key={row.id}&gt;      <span class="c">// ✓ key on the fragment</span>
    &lt;dt&gt;{row.term}&lt;/dt&gt;
    &lt;dd&gt;{row.def}&lt;/dd&gt;
  &lt;/Fragment&gt;
))}</code></pre>
<p class="sub">
  The short <code>&lt;&gt;</code> syntax cannot take a key, so import
  <code>Fragment</code> when you need one.
</p>

<h3>A key is not a prop</h3>
<pre><code>function Row({ key, item }) {   <span class="c">// ✗ key is always undefined here</span>
function Row({ id, item }) {    <span class="c">// ✓ pass it again if you need it</span>

&lt;Row key={item.id} id={item.id} item={item} /&gt;</code></pre>
<p>
  React consumes <code>key</code> itself; it never reaches the component.
</p>

<h3>The trick worth knowing</h3>
<p>
  Changing a key <em>deliberately</em> is how you tell React "this is a
  different thing now" &mdash; it unmounts the old component and mounts a fresh
  one, resetting all of its state.
</p>
<pre><code>&lt;ProfileForm key={userId} user={user} /&gt;</code></pre>
<p>
  Switch users and the form resets, without a single effect watching
  <code>userId</code>. This is the intended answer to "how do I reset state when
  a prop changes", and it is much less code than the alternative.
</p>

<h3>What React does with a key, step by step</h3>
<p>
  When it reconciles a list, React builds a map of the old children by key, then
  walks the new list:
</p>
<ol>
  <li>Key exists in the old map and the element type matches &rarr; <b>update</b> that DOM node in place, keeping its state.</li>
  <li>Key exists but the type changed &rarr; <b>unmount</b> the old, <b>mount</b> a new one.</li>
  <li>Key is new &rarr; <b>mount</b>.</li>
  <li>Old key not claimed by anything &rarr; <b>unmount</b>.</li>
</ol>
<p>
  Reordering a keyed list therefore moves DOM nodes rather than rebuilding them,
  which is why a keyed list keeps input values and focus across a sort and an
  index-keyed one does not.
</p>

<h3>Lists inside lists</h3>
<pre><code>{groups.map((group) =&gt; (
  &lt;section key={group.id}&gt;
    &lt;h3&gt;{group.name}&lt;/h3&gt;
    &lt;ul&gt;
      {group.items.map((item) =&gt; (
        &lt;li key={item.id}&gt;{item.label}&lt;/li&gt;    <span class="c">// only unique within this ul</span>
      ))}
    &lt;/ul&gt;
  &lt;/section&gt;
))}</code></pre>
<p>
  Keys are scoped to siblings, so the inner list does not need
  <code>group.id + item.id</code> &mdash; the items are only ever compared with
  each other.
</p>

<h3>Filtering and sorting</h3>
<pre><code>{tasks
  .filter((t) =&gt; !t.done)
  .sort((a, b) =&gt; a.due - b.due)
  .map((t) =&gt; &lt;Row key={t.id} task={t} /&gt;)}</code></pre>
<p>
  This is safe because <code>filter</code> already made a copy &mdash;
  <code>sort</code> mutates, so sorting <code>tasks</code> directly would mutate
  your state in place. If there is no <code>filter</code> in the chain, copy
  first: <code>[...tasks].sort(...)</code>.
</p>
<p class="sub">
  Keep the pipeline readable. Once it grows past two or three steps, pull it out
  into a named variable above the JSX &mdash; and if it is expensive, into
  <a href="/react/react-memoisation">useMemo</a>.
</p>

<h3>The empty case</h3>
<pre><code>{tasks.length === 0 ? (
  &lt;p className="empty"&gt;Nothing due. Add a task to get started.&lt;/p&gt;
) : (
  &lt;ul&gt;{tasks.map((t) =&gt; &lt;Row key={t.id} task={t} /&gt;)}&lt;/ul&gt;
)}</code></pre>
<p>
  <code>[].map()</code> renders nothing at all, which is silently wrong &mdash;
  the user sees a blank area and cannot tell whether it is loading, broken, or
  genuinely empty.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Keys give React item identity between renders so it can match elements to
    existing DOM nodes. Index keys break the moment the list reorders or an item
    is removed from the middle, because React then preserves state on the wrong
    row &mdash; and changing a key on purpose is the idiomatic way to reset a
    component."
  </p>
</div>`,
};
