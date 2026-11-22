import type { Chapter } from "../types";

export const reactListsKeys: Chapter = {
  id: "react-lists-keys",
  num: "B7",
  title: "Lists with .map() and keys",
  short: "Lists & keys",
  levels: ["beginner"],
  prerequisites: ["react-usestate", "react-events-conditionals"],
  practice: [
    "ex-react-duplicate-keys",
    "ex-react-reorder-list",
    "ex-comp-index-keys",
    "ex-comp-nested-comments",
    "ex-comp-grouped-list-by-category",
  ],
  ready: true,
  subtitle: "A key is not for you and not mainly for speed: it tells React which item is which.",
  body: `<p>
  Almost every screen is a list of something: tasks, messages, search results, rows in a table. Rendering one is a
  single line of JavaScript. Rendering one that keeps working when items are added, removed and reordered depends on
  one small prop, <code>key</code>, that most people learn by getting a warning in the console. This chapter explains
  what React does with that key, traces the bug that index keys cause, counts the DOM work a reorder really costs,
  and ends with the patterns for filtering, nesting and empty states. It assumes <a href="/react/react-usestate">state</a>
  and conditional rendering. Every behaviour described was run against React 19.3.
</p>

<h3>Rendering a list</h3>
<p>
  JSX holds expressions, and a <code>for</code> loop is a statement, so there is no loop syntax in JSX. Instead you
  turn an array of data into an array of elements with <code>map</code>, and React renders an array by rendering each
  element in it.
</p>
<pre><code>function TaskList({ tasks }) {
  return (
    &lt;ul&gt;
      {tasks.map((task) =&gt; (
        &lt;li key={task.id}&gt;{task.title}&lt;/li&gt;
      ))}
    &lt;/ul&gt;
  );
}</code></pre>
<p>
  Watch the bracket after the arrow. <code>=&gt; (</code> returns the JSX inside the parentheses.
  <code>=&gt; {</code> opens a function body, and without a <code>return</code> statement the callback returns
  <code>undefined</code> for every item, so the list renders empty without an error. Everyone loses five minutes to
  this once.
</p>
<p>
  When each item has more than a line of markup, give it a component of its own. The list stays readable, and each row
  can have its own state:
</p>
<pre><code>function TaskRow({ task, onToggle }) {
  return (
    &lt;li&gt;
      &lt;label&gt;
        &lt;input type="checkbox" checked={task.done} onChange={() =&gt; onToggle(task.id)} /&gt;
        {task.title}
      &lt;/label&gt;
    &lt;/li&gt;
  );
}

function TaskList({ tasks, onToggle }) {
  return (
    &lt;ul&gt;
      {tasks.map((task) =&gt; (
        &lt;TaskRow key={task.id} task={task} onToggle={onToggle} /&gt;
      ))}
    &lt;/ul&gt;
  );
}</code></pre>
<p>
  The key goes on <code>&lt;TaskRow&gt;</code>, the element <code>map</code> returns, not on the
  <code>&lt;li&gt;</code> inside it. Returning <code>null</code> from the callback skips an item, since React renders
  nothing for <code>null</code>, but a <code>filter</code> before the <code>map</code> usually reads better.
</p>

<h3>Why React needs to know which item is which</h3>
<p>
  When state changes, React calls your component again and gets a new tree of elements. It then compares the new tree
  with the previous one and changes only the DOM that differs. That comparison is called reconciliation, and for most
  of the tree it uses two cheap rules: an element of the same type in the same position is treated as the same
  element, so its DOM node and its state are kept and only its props are updated; an element of a different type is
  treated as new, so the old one is removed with its state and a new one is created.
</p>
<p>
  A general algorithm that finds the minimum set of edits between two trees is cubic in the number of nodes, far too
  slow to run on every keystroke. Those two rules make React's comparison linear. They also mean "same position" is
  doing a lot of work, and for a list, position is exactly the thing that changes. If you delete the first item, every
  item after it is now in a new position. React needs a way to recognise an item wherever it moved to. That is the key.
</p>
<p>
  A key is a string or number that identifies an element among its siblings. When React compares the old and new
  children of the same parent, it matches elements with the same key instead of elements in the same position.
  Matched elements keep their DOM node and their state, wherever they now sit in the list.
</p>

<h3>The index-key bug, traced</h3>
<p>
  Without a key, React warns in development and falls back to position. Using the index as the key,
  <code>key={i}</code>, silences the warning and does exactly the same thing, which is why it is the tempting fix.
  Here is a list where each row has its own state, an input for a note:
</p>
<pre><code>function Row({ label }) {
  const [note, setNote] = useState("");
  return (
    &lt;li&gt;
      {label} &lt;input value={note} onChange={(e) =&gt; setNote(e.target.value)} /&gt;
    &lt;/li&gt;
  );
}

{items.map((item, i) =&gt; &lt;Row key={i} label={item} /&gt;)}</code></pre>
<p>
  The list is <code>["A", "B", "C"]</code>. Type "note for A" into the first row, then delete A. Trace what React sees:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Key</th><th>Before</th><th>After</th><th>React concludes</th><th>On screen</th></tr></thead>
<tbody>
<tr><td>0</td><td>Row A, note "note for A"</td><td>Row B</td><td>same element, label changed</td><td>B with "note for A"</td></tr>
<tr><td>1</td><td>Row B, note ""</td><td>Row C</td><td>same element, label changed</td><td>C with ""</td></tr>
<tr><td>2</td><td>Row C, note ""</td><td>(gone)</td><td>removed</td><td>the last row disappears</td></tr>
</tbody>
</table></div>
<p>
  React did exactly what the keys told it to. Key 0 still exists, so the component with key 0 is kept, and its state,
  the note you typed for A, is now displayed next to B. The row that was really deleted, A, is the one that survives;
  the one React removes is the last one. The same thing happens to anything React preserves on a DOM node or a
  component: checkbox state in an uncontrolled input, focus, scroll position inside a row, an open dropdown, a running
  animation, a fetch in progress.
</p>
<p>
  With <code>key={item}</code>, using the item's own identity, the table changes completely. Key A is no longer in the
  new list, so A's row is unmounted with its note; keys B and C are matched to their existing rows. The note goes with
  the item it was typed for.
</p>
<div class="bx is-prim">
  <span class="ttl">Why this bug survives code review</span>
  <p>
    A list with index keys renders correctly on every screenshot. It only goes wrong when three things happen at once:
    the list changes anywhere but the end, a row holds state or a DOM value, and someone looks. That is usually a user
    in production.
  </p>
</div>

<h3>What React does with keys, step by step</h3>
<p>
  For a list of children, React's comparison works in two passes. First it walks the old and new lists side by side
  from the start, as long as the keys match, updating each pair. Most updates, such as editing a row or appending to the
  end, finish in this pass. If it reaches a key that does not match, it puts the remaining old children in a map from key
  to element, then walks the remaining new children: a key found in the map reuses that element and is removed from the
  map; a key not found creates a new element. Whatever is left in the map at the end is unmounted.
</p>
<p>
  That is O(<em>n</em>) time for <em>n</em> children, plus O(<em>n</em>) memory for the map, which is why keyed lists
  of thousands of items still reconcile quickly. Matching is not the whole cost, though. React also has to put the DOM
  nodes in the new order, and the way it decides which nodes to move is worth tracing once.
</p>

<h4>Worked example: how many DOM moves does a reorder cost?</h4>
<p>
  React walks the new list left to right and remembers the old index of the last node it decided to leave in place
  (call it <code>lastPlaced</code>). For each reused node, if its old index is greater than or equal to
  <code>lastPlaced</code>, it stays where it is and <code>lastPlaced</code> becomes its old index. If its old index is
  smaller, the node is out of order and gets moved. Take <code>A B C D</code> and move D to the front:
</p>
<div class="table-scroll"><table>
<thead><tr><th>New position</th><th>Key</th><th>Old index</th><th><code>lastPlaced</code> before</th><th>Decision</th><th><code>lastPlaced</code> after</th></tr></thead>
<tbody>
<tr><td>0</td><td>D</td><td>3</td><td>0</td><td>3 ≥ 0: stays</td><td>3</td></tr>
<tr><td>1</td><td>A</td><td>0</td><td>3</td><td>0 &lt; 3: move</td><td>3</td></tr>
<tr><td>2</td><td>B</td><td>1</td><td>3</td><td>1 &lt; 3: move</td><td>3</td></tr>
<tr><td>3</td><td>C</td><td>2</td><td>3</td><td>2 &lt; 3: move</td><td>3</td></tr>
</tbody>
</table></div>
<p>
  Three DOM moves to move one item. Now move A to the end instead, <code>B C D A</code>: B (old 1) stays, C (old 2)
  stays, D (old 3) stays, A (old 0) is smaller than 3 and moves. One DOM move. Both reorders were checked by recording
  the DOM calls React 19 made: three appends for the first, one for the second.
</p>
<p>
  The asymmetry rarely matters, because a few DOM moves cost microseconds, and the result is correct either way: state
  stays with the right items. It is worth knowing for two reasons. It explains why a keyed list moves nodes instead of
  re-creating them, so inputs keep their text and focus through a sort. And it is a good interview answer to "is a
  keyed reorder free?": no, it is linear to match and costs up to <em>n</em> − 1 moves, depending on which items moved.
</p>

<h3>Where to get a key</h3>
<div class="table-scroll"><table>
<thead><tr><th>Where the data comes from</th><th>What to use as the key</th></tr></thead>
<tbody>
<tr><td>A database or an API</td><td>The record's id. This covers most lists.</td></tr>
<tr><td>Created in the browser</td><td>An id generated when the item is created, stored with the item</td></tr>
<tr><td>A fixed list in your code that never changes order</td><td>The index is acceptable, though a name or slug is clearer</td></tr>
<tr><td>Data with no id field</td><td>A field or combination that is unique and does not change, such as <code>country + "/" + city</code></td></tr>
</tbody>
</table></div>
<p>
  For items created in the browser, generate the id at creation time and store it on the item:
</p>
<pre><code>function addTask(title) {
  setTasks((tasks) =&gt; [...tasks, { id: crypto.randomUUID(), title, done: false }]);
}</code></pre>
<p>
  <code>crypto.randomUUID()</code> is built into every current browser and Node, with one catch: browsers only expose
  it in secure contexts, meaning pages served over HTTPS or from <code>localhost</code>. On a plain-HTTP preview server
  it is undefined. A counter kept in a ref, or a small id library, works everywhere.
</p>
<p>
  Never generate the key while rendering:
</p>
<pre><code>{tasks.map((task) =&gt; &lt;TaskRow key={Math.random()} task={task} /&gt;)}   <span class="c">// ✗</span>
{tasks.map((task) =&gt; &lt;TaskRow key={crypto.randomUUID()} task={task} /&gt;)}   <span class="c">// ✗ the same bug</span></code></pre>
<p>
  Every render produces keys that did not exist before, so React matches nothing: it unmounts every row and mounts a
  fresh one on every render. Each row loses its state on every keystroke anywhere in the list, and the list does the
  maximum possible DOM work. That is worse than index keys, which at least keep the rows.
</p>
<p>
  Content that is unique today, such as a task title, makes a fragile key: two tasks can end up with the same title
  tomorrow. Prefer an id that was created to be unique.
</p>

<h3>The rules for keys</h3>
<ul>
  <li><b>Unique among siblings.</b> Keys only have to differ from the other children of the same parent. Two separate lists on one page can both use key <code>1</code>.</li>
  <li><b>Stable.</b> The same item keeps the same key for its whole life, across renders, sorts and filters.</li>
  <li><b>On the element <code>map</code> returns.</b> A key on an element nested inside does nothing for the list.</li>
</ul>
<p>
  When each item renders several siblings with no wrapper, the key goes on a <code>Fragment</code>. The short
  <code>&lt;&gt;</code> syntax cannot take a key, so import <code>Fragment</code>:
</p>
<pre><code>import { Fragment } from "react";

&lt;dl&gt;
  {terms.map((term) =&gt; (
    &lt;Fragment key={term.id}&gt;
      &lt;dt&gt;{term.word}&lt;/dt&gt;
      &lt;dd&gt;{term.meaning}&lt;/dd&gt;
    &lt;/Fragment&gt;
  ))}
&lt;/dl&gt;</code></pre>
<p>
  Duplicate keys among siblings produce a development warning ("Encountered two children with the same key"). The
  first render still shows both items, but updates are no longer well defined: React may keep the wrong node, drop
  one, or duplicate one. Treat the warning as a bug.
</p>

<h3>A key is not a prop</h3>
<p>
  React reads <code>key</code> when it compares elements and does not pass it to your component:
</p>
<pre><code>function TaskRow({ key, task }) {    <span class="c">// ✗ key is undefined here, with a warning</span>
  <span class="c">// …</span>
}

&lt;TaskRow key={task.id} id={task.id} task={task} /&gt;   <span class="c">// ✓ pass it separately if the row needs it</span></code></pre>
<p>
  Usually the row does not need it at all, because the id is already on the object you pass.
</p>

<h3>When index keys are fine</h3>
<p>
  "Never use the index" is too strong. The index is a correct key when position really is identity, which takes all
  of these at once: the list is never reordered, sorted or filtered; items are never inserted or removed anywhere but
  the end; and the rows hold no state, no uncontrolled inputs and nothing else React or the DOM preserves. A static
  navigation menu, the cells of a fixed table header, or skeleton placeholders while data loads all qualify. If you are
  unsure whether a list will ever be sorted, assume it will be; a real id costs nothing.
</p>

<h3>Editing a list in state</h3>
<p>
  Once the list itself lives in state, every edit is one of the immutable operations from the
  <a href="/react/react-usestate">useState chapter</a>, addressed by id rather than by index. Ids are what make the
  handlers safe: an index captured when a row rendered can point at a different item by the time the click arrives,
  if something was inserted above it in between.
</p>
<pre><code>function TaskBoard() {
  const [tasks, setTasks] = useState([]);

  function add(title) {
    setTasks((list) =&gt; [...list, { id: crypto.randomUUID(), title, done: false }]);
  }
  function toggle(id) {
    setTasks((list) =&gt; list.map((t) =&gt; (t.id === id ? { ...t, done: !t.done } : t)));
  }
  function remove(id) {
    setTasks((list) =&gt; list.filter((t) =&gt; t.id !== id));
  }
  function moveUp(id) {
    setTasks((list) =&gt; {
      const i = list.findIndex((t) =&gt; t.id === id);
      if (i &lt;= 0) return list;
      return list.with(i - 1, list[i]).with(i, list[i - 1]);
    });
  }
  <span class="c">// …render the list with key={task.id} and pass the handlers down</span>
}</code></pre>
<p>
  Each handler uses the updater form, so two quick clicks never work from a stale copy of the list, and each returns a
  new array, so React sees the change. <code>moveUp</code> returns the same array when there is nothing to do, which
  lets React skip the render entirely.
</p>
<p>
  Where should per-row state live? Keep it in the row when nothing outside the row cares about it: whether a row's
  details are expanded, the draft text of an inline edit before it is saved. Move it to the parent, as a field on the
  item or a separate piece of parent state such as <code>selectedId</code>, as soon as something outside the row needs
  it: a "delete selected" button, a count of expanded rows, a detail panel showing the selected item. Row state is
  exactly the state that index keys misplace, so the more of it a list has, the more its keys matter.
</p>

<h3>Keys outside lists: resetting a component</h3>
<p>
  Keys work on any element, not just inside a <code>map</code>. Changing a key tells React "this is a different
  thing now": it unmounts the old component, with all of its state and effects, and mounts a new one from scratch.
</p>
<pre><code>&lt;ProfileForm key={userId} user={user} /&gt;</code></pre>
<p>
  Switch to another user and the form starts empty, with no effect watching <code>userId</code> and no setters to
  remember. This is the recommended answer to "how do I reset a component's state when a prop changes?". The
  alternative, an effect that watches the prop and calls every setter, renders once with the stale state first and
  breaks as soon as someone adds a field and forgets the setter; <a href="/react/react-effects-depth">effects in
  depth</a> comes back to it.
</p>

<h3>Lists inside lists</h3>
<pre><code>{groups.map((group) =&gt; (
  &lt;section key={group.id}&gt;
    &lt;h3&gt;{group.name}&lt;/h3&gt;
    &lt;ul&gt;
      {group.items.map((item) =&gt; (
        &lt;li key={item.id}&gt;{item.label}&lt;/li&gt;
      ))}
    &lt;/ul&gt;
  &lt;/section&gt;
))}</code></pre>
<p>
  Because keys are scoped to siblings, the inner items only need to be unique within their own group. There is no
  need for <code>group.id + item.id</code>. Recursive data, such as comments with replies, works the same way: a
  component renders its replies with <code>map</code>, each reply renders its own replies, and each level keys its own
  children.
</p>

<h3>Filtering and sorting</h3>
<p>
  Filter and sort while rendering, from the state you have, rather than keeping a second filtered copy in state:
</p>
<pre><code>const visible = tasks
  .filter((task) =&gt; showDone || !task.done)
  .toSorted((a, b) =&gt; a.due - b.due);

return (
  &lt;ul&gt;
    {visible.map((task) =&gt; (
      &lt;TaskRow key={task.id} task={task} /&gt;
    ))}
  &lt;/ul&gt;
);</code></pre>
<p>
  A stored <code>filteredTasks</code> goes out of date the moment someone edits a task and forgets to update it too.
  Deriving it costs O(<em>n</em>) for the filter plus O(<em>n</em> log <em>n</em>) for the sort on each render, which
  is nothing for hundreds of items; if profiling shows it matters for many thousands, wrap it in
  <code>useMemo</code>.
</p>
<p>
  Use <code>toSorted</code>, or copy first with <code>[...tasks].sort(...)</code>. Plain <code>sort</code> sorts the
  array in place, and if that array is your state, you have mutated state during render. After a
  <code>filter</code> it happens to be safe, because <code>filter</code> returns a new array, but that is a fragile
  thing to rely on when someone later removes the filter.
</p>
<p>
  Notice that the keys are what make this pipeline correct. When the sort order changes or a task is filtered out,
  each <code>TaskRow</code> keeps its own state because React finds it by id, not by its new position.
</p>

<h3>Empty, loading and conditional items</h3>
<p>
  <code>[].map(...)</code> renders nothing, which is technically correct and practically wrong: the user sees a blank
  area and cannot tell whether the data is loading, failed or genuinely empty. Say which:
</p>
<pre><code>if (status === "loading") return &lt;p&gt;Loading tasks…&lt;/p&gt;;
if (tasks.length === 0) return &lt;p&gt;Nothing due. Add a task to get started.&lt;/p&gt;;

return &lt;ul&gt;{tasks.map((task) =&gt; &lt;TaskRow key={task.id} task={task} /&gt;)}&lt;/ul&gt;;</code></pre>
<p>
  One trap belongs here. <code>{tasks.length &amp;&amp; &lt;ul&gt;…&lt;/ul&gt;}</code> looks like "render the list if there
  are tasks", but when the length is 0 the expression evaluates to the number 0, and React renders numbers, so a
  stray <b>0</b> appears on the page. Write <code>tasks.length &gt; 0 &amp;&amp; …</code> or use a ternary.
</p>

<h3>Very long lists</h3>
<p>
  Keys make updates cheap, but they do not make a list of 20,000 rows cheap to render: every row is still a component
  and a set of DOM nodes. When a list grows into the thousands, the usual fixes are pagination, "load more", or
  virtualisation, which renders only the rows in the viewport and recycles them as you scroll. TanStack Virtual and
  react-window are the common libraries. Keys still matter there: a virtualised list keys each rendered row by the
  item's id, not by its slot on screen.
</p>

<h3>Pitfalls</h3>
<ul>
  <li><b>Curly braces after the arrow</b> in <code>map</code> without a <code>return</code>: an empty list and no error.</li>
  <li><b>Index keys on a list that changes anywhere but the end:</b> state, input values and focus stay with the position instead of the item.</li>
  <li><b>Keys generated during render</b> (<code>Math.random()</code>, <code>crypto.randomUUID()</code> inside <code>map</code>): every row remounts on every render.</li>
  <li><b>The key on the wrong element:</b> it must be on what <code>map</code> returns, including a <code>Fragment</code>.</li>
  <li><b>Reading <code>key</code> as a prop</b> inside the component: it is always undefined.</li>
  <li><b>Sorting state in place</b> with <code>sort</code> or <code>reverse</code> while rendering; use <code>toSorted</code> or copy first.</li>
  <li><b>Keeping a filtered copy in state</b> next to the full list; derive it while rendering.</li>
  <li><b><code>{list.length &amp;&amp; …}</code></b> rendering a literal 0 when the list is empty.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>"Each child in a list should have a unique key prop" in the console: a <code>map</code> without keys, or a key on the wrong element.</li>
  <li>"After I delete a row, the text I typed shows up in the next row": index keys, or keys that are not tied to the item.</li>
  <li>"Every row loses its state when I type anything": keys created during render.</li>
  <li>"Reset this form when the selected id changes": a key on the component, not an effect.</li>
  <li>A blank area where a list should be, or a stray 0: the empty case is not handled, or <code>length &amp;&amp;</code> was used.</li>
</ul>

<h3>Interview questions</h3>
<p>
  <b>1. What are keys for in React?</b>
</p>
<p>
  Keys give each element in a list an identity among its siblings, so that when the list re-renders React matches new
  elements to old ones by key rather than by position. A matched element keeps its DOM node and its state; a key that
  disappears is unmounted; a new key is mounted. That is what keeps state, input values and focus with the right item
  when the list is reordered, filtered or edited in the middle.
</p>
<p class="sub">
  <i>Follow-up: are keys a performance feature?</i> Partly, but that is the secondary effect. Correct keys let React
  move existing nodes instead of re-creating them, so a reorder is cheap. The primary purpose is correctness: without
  stable keys, state ends up on the wrong item, and no amount of speed fixes that.
</p>
<p>
  <b>2. Why is using the array index as the key a problem?</b>
</p>
<p>
  Because the index describes position, not identity. Delete the first item and every later item gets a new index, so
  React thinks the first element still exists with new props and that the last one was removed. Any state or DOM value
  in the rows stays at its position, so it appears next to the wrong item. It is only safe when the list never
  reorders, never changes except at the end, and the rows hold no state.
</p>
<p class="sub">
  <i>Follow-up: what if the data has no id?</i> Generate one when the item is created and store it on the item, or
  use a field or combination that is genuinely unique and stable. Never generate it during render, because then every
  render has new keys and every row remounts.
</p>
<p>
  <b>3. How would you reset a component's state when a prop changes?</b>
</p>
<p>
  Give it a <code>key</code> derived from that prop, for example <code>&lt;ProfileForm key={userId} /&gt;</code>. A new
  key makes React unmount the old instance and mount a new one, so all state starts from its initial values, with no
  effect and no list of setters to keep in sync.
</p>
<p class="sub">
  <i>Follow-up: what does that cost?</i> A full unmount and mount of that subtree, including its effects running again.
  For a form that is exactly what you want; for a large subtree that only needs one field reset, reset that field
  instead.
</p>
<p>
  <b>4. Is reconciling a keyed list linear?</b>
</p>
<p>
  Matching is linear: React walks the lists together while the keys line up, then puts the remaining old children in a
  key map and looks each new one up. The DOM moves depend on which items moved: React keeps nodes that are already in
  increasing old order and moves the rest, so moving the last item to the front moves every other item, while moving
  the first item to the end moves one.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "Do keys have to be unique across the whole page?" No: only among siblings, the children of the same parent. Two
    different lists, or a list nested inside each row of another, can reuse the same keys. What keys do have to be is
    stable, and that is the part people get wrong.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "A key is an element's identity among its siblings. React matches old and new children by key, keeps the DOM node
    and state of matched ones, mounts new keys and unmounts missing ones. So keys must be stable and tied to the data,
    usually the record id; index keys break as soon as the list reorders or loses an item in the middle, and keys made
    during render remount everything. And changing a key on purpose is how you reset a component."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Render a list of objects with <code>map</code>, with the key in the right place, including one that needs a <code>Fragment</code>.</li>
    <li>Fill in the index-key table above from memory for deleting the first of three rows.</li>
    <li>Trace <code>lastPlaced</code> for a reorder of your choice and count the DOM moves.</li>
    <li>Say where a key should come from for API data, for items created in the browser, and why never from <code>Math.random()</code> in <code>map</code>.</li>
    <li>List the conditions under which an index key is safe.</li>
    <li>Reset a component's state with a key instead of an effect.</li>
    <li>Filter and sort a list during render without mutating state, and render a sensible empty state without a stray 0.</li>
  </ul>
</div>`,
};
