import type { Chapter } from "../types";

export const reactGuidedProject: Chapter = {
  id: "react-guided-project",
  num: "B11",
  title: "Guided project: a task board",
  short: "Guided project",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "Every beginner chapter, in one app built end to end.",
  body: `<h3>What you are building</h3>
<p>
  A board with three columns, cards you can add, move and delete, a filter, and
  state that survives a refresh. It is also the most common machine-coding brief
  there is &mdash; if you can build this in ninety minutes you can pass that
  round.
</p>
<p class="sub">
  Build in order. Each step ends with something that runs, so you always know
  which change broke it.
</p>

<h3>Step 1 &mdash; the model, before any JSX</h3>
<pre><code>const COLUMNS = ["todo", "doing", "done"];

<span class="c">// tasks flat and keyed by id — not nested inside columns</span>
const initial = {
  "a1": { id: "a1", title: "Write the brief", column: "todo" },
  "b2": { id: "b2", title: "Review PR",       column: "doing" },
};</code></pre>
<div class="bx is-prim">
  <span class="ttl">This decision is the whole round</span>
  <p>
    Nesting tasks inside columns &mdash;
    <code>{ todo: [...], doing: [...] }</code> &mdash; makes a move a splice out
    of one array and an insert into another, and "which column is this card in"
    a scan of every column. Flat with a <code>column</code> field makes a move
    <b>one field change</b>. Say why you chose it out loud; the reasoning scores
    higher than the result.
  </p>
</div>

<h3>Step 2 &mdash; static render from hardcoded data</h3>
<pre><code>function Board({ tasks }) {
  return (
    &lt;div className="board"&gt;
      {COLUMNS.map((col) =&gt; (
        &lt;Column
          key={col}
          name={col}
          tasks={Object.values(tasks).filter((t) =&gt; t.column === col)}
        /&gt;
      ))}
    &lt;/div&gt;
  );
}

function Column({ name, tasks }) {
  return (
    &lt;section&gt;
      &lt;h2&gt;{name} &lt;span&gt;{tasks.length}&lt;/span&gt;&lt;/h2&gt;
      &lt;ul&gt;{tasks.map((t) =&gt; &lt;Card key={t.id} task={t} /&gt;)}&lt;/ul&gt;
    &lt;/section&gt;
  );
}</code></pre>
<p>
  No state yet. This proves the component boundaries and gives you something on
  screen inside ten minutes &mdash; which is what
  <a href="/react/react-thinking">Thinking in React</a> is about.
</p>

<h3>Step 3 &mdash; state, and where it lives</h3>
<pre><code>function App() {
  const [tasks, setTasks] = useState(initial);
  const [filter, setFilter] = useState("");

  const visible = useMemo(() =&gt; {
    const q = filter.trim().toLowerCase();
    return Object.values(tasks).filter((t) =&gt; !q || t.title.toLowerCase().includes(q));
  }, [tasks, filter]);

  return (
    &lt;&gt;
      &lt;input value={filter} onChange={(e) =&gt; setFilter(e.target.value)} placeholder="Filter" /&gt;
      &lt;Board tasks={visible} onMove={move} onDelete={remove} /&gt;
    &lt;/&gt;
  );
}</code></pre>
<p>
  Two pieces of state. <code>visible</code> is <b>derived</b> &mdash; computed
  during render, never stored. The counts per column are derived from that.
</p>

<h3>Step 4 &mdash; adding, moving, deleting</h3>
<pre><code>function add(title, column) {
  const id = crypto.randomUUID();
  setTasks((t) =&gt; ({ ...t, [id]: { id, title, column } }));
}

function move(id, column) {
  setTasks((t) =&gt; ({ ...t, [id]: { ...t[id], column } }));   <span class="c">// one field</span>
}

function remove(id) {
  setTasks((t) =&gt; {
    const { [id]: _gone, ...rest } = t;                       <span class="c">// destructure it out</span>
    return rest;
  });
}</code></pre>
<p>
  All three use the updater form, so two changes in one tick cannot overwrite
  each other. And all three return a <b>new object</b> &mdash; mutating
  <code>tasks</code> gives React the same reference and it skips the render.
</p>

<h3>Step 5 &mdash; the form</h3>
<pre><code>function NewTask({ onAdd }) {
  const [title, setTitle] = useState("");
  const id = useId();

  function handleSubmit(e) {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    onAdd(clean, "todo");
    setTitle("");
  }

  return (
    &lt;form onSubmit={handleSubmit}&gt;
      &lt;label htmlFor={id}&gt;New task&lt;/label&gt;
      &lt;input id={id} value={title} onChange={(e) =&gt; setTitle(e.target.value)} /&gt;
      &lt;button&gt;Add&lt;/button&gt;
    &lt;/form&gt;
  );
}</code></pre>
<p class="sub">
  A real <code>&lt;form&gt;</code> means Enter submits. <code>useId</code> means
  the label works even if the component appears twice.
</p>

<h3>Step 6 &mdash; moving without drag and drop</h3>
<pre><code>&lt;button
  onClick={() =&gt; onMove(task.id, prevColumn)}
  aria-label={"Move " + task.title + " left"}
&gt;←&lt;/button&gt;

&lt;button
  onClick={() =&gt; onMove(task.id, nextColumn)}
  aria-label={"Move " + task.title + " right"}
&gt;→&lt;/button&gt;</code></pre>
<p>
  Buttons first, drag later. They work with a keyboard, they are testable, and
  they take two minutes &mdash; whereas drag and drop is the thing that eats your
  last half hour. In an interview, <b>say</b> you are doing buttons first and
  will add drag if there is time. That reads as judgement, not as a shortcut.
</p>

<h3>Step 7 &mdash; persistence</h3>
<pre><code>const KEY = "board:v1";

useEffect(() =&gt; {
  try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch {}
}, [tasks]);

const [tasks, setTasks] = useState(() =&gt; {          <span class="c">// lazy — runs once</span>
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed &amp;&amp; typeof parsed === "object" ? parsed : initial;
  } catch {
    return initial;
  }
});</code></pre>
<p>
  The initialiser is a function, so the parse happens on the first render only.
  Both accesses are wrapped &mdash; <code>localStorage</code> throws in private
  mode and when the quota is full. And whatever is in there was written by an
  older version of your own code, so check the shape. The <code>:v1</code> is how
  you change that shape later without breaking anyone.
</p>

<h3>Step 8 &mdash; the states you would otherwise forget</h3>
<pre><code>{visible.length === 0 &amp;&amp; filter &amp;&amp; &lt;p&gt;Nothing matches "{filter}".&lt;/p&gt;}
{Object.keys(tasks).length === 0 &amp;&amp; &lt;p&gt;No tasks yet. Add one above.&lt;/p&gt;}</code></pre>
<p>
  Two different empties &mdash; nothing at all, and nothing matching a filter
  &mdash; and they need different messages. Interviewers watching a machine
  round are counting these; handling them unprompted is one of the cheapest
  signals you can give.
</p>

<h3>Break it on purpose</h3>
<div class="table-scroll"><table>
<thead><tr><th>Try</th><th>What it teaches</th></tr></thead>
<tbody>
<tr><td>Use the array index as the card <code>key</code></td><td>Move a card and watch state follow the wrong one</td></tr>
<tr><td>Replace the updater form with <code>setTasks({ ...tasks, ... })</code></td><td>It works &mdash; until two updates land in one tick</td></tr>
<tr><td>Mutate: <code>tasks[id].column = "done"; setTasks(tasks)</code></td><td>Nothing re-renders. Same reference.</td></tr>
<tr><td>Define <code>Card</code> inside <code>Column</code></td><td>Every card remounts each render; focus and state vanish</td></tr>
<tr><td>Store <code>visible</code> in state instead of deriving it</td><td>The filter and the list drift apart</td></tr>
</tbody>
</table></div>

<h3>If you have time left</h3>
<ol>
  <li><b>Undo</b> the last delete &mdash; keep the removed task and a timer.</li>
  <li><b>Drag and drop</b> with the HTML drag events, or a library. Now the fractional <code>order</code> field earns itself.</li>
  <li><b>Edit in place</b> on double-click. Watch what happens to focus when you swap the element.</li>
  <li><b>Two tabs</b> &mdash; they disagree, and the <code>storage</code> event is the fix.</li>
  <li><b>Replace storage with an API.</b> Now you meet loading, errors, and the race where two saves land out of order.</li>
</ol>

<div class="bx is-ref">
  <span class="ttl">Why this project</span>
  <p>
    It contains the four things every React app has: state, a way to change it, a
    way to render it, and somewhere to keep it. It is also close enough to the
    standard machine-coding brief that building it once is direct interview
    preparation &mdash; and the flat data model is the decision that round is
    actually testing.
  </p>
</div>`,
};
