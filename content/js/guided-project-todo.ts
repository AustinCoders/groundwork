import type { Chapter } from "../types";

export const guidedProjectTodo: Chapter = {
  id: "guided-project-todo",
  num: "B15",
  title: "Guided project: build a to-do app",
  short: "Guided project",
  levels: ["beginner"],
  practice: ["ex-todo-toggle", "ex-todo-filter"],
  ready: true,
  subtitle: "Everything from the beginner chapters, in one small thing that works.",
  body: `<h3>What you are building</h3>
<p>
  A list you can add to, tick off, filter and delete, that survives a refresh.
  No framework, no build step &mdash; one HTML file, one CSS file, one JavaScript
  file. It uses every beginner chapter: types, flow, functions, arrays,
  destructuring, the DOM, events, and storage.
</p>
<p class="sub">
  Build it in order. Each step ends with something that runs, so you always know
  which change broke it.
</p>

<h3>Step 1 &mdash; the markup</h3>
<pre><code>&lt;form id="new"&gt;
  &lt;label for="title"&gt;New task&lt;/label&gt;
  &lt;input id="title" name="title" required autocomplete="off"&gt;
  &lt;button&gt;Add&lt;/button&gt;
&lt;/form&gt;

&lt;div id="filters"&gt;
  &lt;button data-filter="all" aria-pressed="true"&gt;All&lt;/button&gt;
  &lt;button data-filter="open" aria-pressed="false"&gt;Open&lt;/button&gt;
  &lt;button data-filter="done" aria-pressed="false"&gt;Done&lt;/button&gt;
&lt;/div&gt;

&lt;ul id="list"&gt;&lt;/ul&gt;
&lt;p id="count"&gt;&lt;/p&gt;</code></pre>
<p>
  A real <code>&lt;form&gt;</code> means Enter submits for free. A real
  <code>&lt;label&gt;</code> means the input has a name. Both are things you get
  by using the right element rather than by writing JavaScript.
</p>

<h3>Step 2 &mdash; the state</h3>
<pre><code>let tasks = [];            <span class="c">// [{ id, title, done }]</span>
let filter = "all";

function makeTask(title) {
  return { id: crypto.randomUUID(), title: title.trim(), done: false };
}</code></pre>
<div class="bx is-prim">
  <span class="ttl">One rule that makes the rest easy</span>
  <p>
    <b>The array is the truth; the DOM is a picture of it.</b> Never read state
    back out of the page &mdash; change the array, then redraw. Almost every bug
    in a first app comes from letting the two disagree.
  </p>
</div>

<h3>Step 3 &mdash; render</h3>
<pre><code>const list = document.querySelector("#list");

function visible() {
  if (filter === "open") return tasks.filter((t) =&gt; !t.done);
  if (filter === "done") return tasks.filter((t) =&gt; t.done);
  return tasks;
}

function render() {
  const rows = visible();

  list.replaceChildren();                   <span class="c">// clear</span>
  for (const { id, title, done } of rows) {  <span class="c">// destructuring</span>
    const li = document.createElement("li");

    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = done;
    box.dataset.id = id;

    const span = document.createElement("span");
    span.textContent = title;                <span class="c">// textContent, never innerHTML</span>

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.dataset.id = id;

    li.append(box, span, del);
    list.append(li);
  }

  document.querySelector("#count").textContent =
    tasks.filter((t) =&gt; !t.done).length + " left";
}</code></pre>
<p>
  <code>textContent</code> rather than <code>innerHTML</code> is the whole XSS
  defence here. Type <code>&lt;img src=x onerror=alert(1)&gt;</code> as a task
  title and it appears as text, which is what you want.
</p>

<h3>Step 4 &mdash; adding</h3>
<pre><code>document.querySelector("#new").addEventListener("submit", (e) =&gt; {
  e.preventDefault();                       <span class="c">// or the page reloads</span>
  const input = document.querySelector("#title");
  const title = input.value.trim();
  if (!title) return;

  tasks = [...tasks, makeTask(title)];      <span class="c">// new array, not push</span>
  input.value = "";
  input.focus();                            <span class="c">// ready for the next one</span>
  save();
  render();
});</code></pre>

<h3>Step 5 &mdash; toggling and deleting, with one listener</h3>
<pre><code>list.addEventListener("click", (e) =&gt; {
  const id = e.target.dataset.id;
  if (!id) return;                          <span class="c">// clicked the gap</span>

  if (e.target.type === "checkbox") {
    tasks = tasks.map((t) =&gt; (t.id === id ? { ...t, done: e.target.checked } : t));
  } else if (e.target.tagName === "BUTTON") {
    tasks = tasks.filter((t) =&gt; t.id !== id);
  }
  save();
  render();
});</code></pre>
<p>
  One listener on the list rather than two per row. This is <b>event
  delegation</b>, and it is why rows added later still work without wiring
  anything up.
</p>

<h3>Step 6 &mdash; filters</h3>
<pre><code>document.querySelector("#filters").addEventListener("click", (e) =&gt; {
  const next = e.target.dataset.filter;
  if (!next) return;

  filter = next;
  for (const b of e.currentTarget.children) {
    b.setAttribute("aria-pressed", String(b.dataset.filter === filter));
  }
  render();
});</code></pre>
<p class="sub">
  <code>aria-pressed</code> is what tells a screen reader which filter is active.
  Colour alone does not.
</p>

<h3>Step 7 &mdash; surviving a refresh</h3>
<pre><code>const KEY = "todo:v1";

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch {}                                <span class="c">// private mode, quota</span>
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];   <span class="c">// don't trust storage</span>
  } catch {
    return [];
  }
}

tasks = load();
render();</code></pre>
<p>
  Both accesses are wrapped. <code>localStorage</code> throws in private browsing
  on some browsers and when the quota is full; and whatever is in there was
  written by an older version of your own code, so validate its shape before
  trusting it. The <code>:v1</code> in the key is how you change that shape later
  without breaking existing users.
</p>

<h3>You are done. Now break it on purpose</h3>
<div class="table-scroll"><table>
<thead><tr><th>Try</th><th>What it teaches</th></tr></thead>
<tbody>
<tr><td>Add a task called <code>&lt;b&gt;hi&lt;/b&gt;</code></td><td>Why <code>textContent</code> matters</td></tr>
<tr><td>Swap <code>[...tasks, x]</code> for <code>tasks.push(x)</code></td><td>It still works &mdash; and why the copy is a habit worth keeping</td></tr>
<tr><td>Remove <code>e.preventDefault()</code></td><td>The default action a form has</td></tr>
<tr><td>Put <code>console.log(tasks)</code> in <code>render</code></td><td>How often you redraw, and that it is fine at this size</td></tr>
<tr><td>Open two tabs</td><td>They disagree &mdash; the <code>storage</code> event is the fix, and the reason shared state is hard</td></tr>
</tbody>
</table></div>

<h3>Extensions, in increasing difficulty</h3>
<ol>
  <li><b>Edit a task</b> on double-click. Watch what happens to focus when you swap the element.</li>
  <li><b>Undo delete</b> &mdash; keep the removed task and a timer, and put it back if they click undo.</li>
  <li><b>Reorder by dragging.</b> You will need an <code>order</code> field; sorting the array in place will bite you.</li>
  <li><b>Sync across tabs</b> with <code>window.addEventListener("storage", ...)</code>.</li>
  <li><b>Replace <code>localStorage</code> with a server.</b> Now you meet loading states, errors, and the race where two saves land out of order &mdash; which is where <a href="/notes/basic-async">async</a> stops being theory.</li>
</ol>

<div class="bx is-ref">
  <span class="ttl">Why this project and not a bigger one</span>
  <p>
    It is small enough to finish in an evening and large enough to contain the
    four things every app has: state, a way to change it, a way to draw it, and
    somewhere to keep it. Every framework you learn later is a different answer
    to those same four &mdash; and you will understand the answers better for
    having written the manual version once.
  </p>
</div>`,
};
