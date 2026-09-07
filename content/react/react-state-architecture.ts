import type { Chapter } from "../types";

export const reactStateArchitecture: Chapter = {
  id: "react-state-architecture",
  num: "I7",
  title: "State architecture",
  short: "State architecture",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Most React problems are state in the wrong place, in the wrong shape, or duplicated.",
  body: `<h3>Five kinds of state</h3>
<p>
  "State management" is not one problem. Naming the kind you have usually names
  the tool.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Kind</th><th>Examples</th><th>Where it belongs</th></tr></thead>
<tbody>
<tr><td><b>Local UI</b></td><td>Is this menu open, which tab, hover</td><td><code>useState</code>, in the component</td></tr>
<tr><td><b>Form</b></td><td>Field values, touched, errors</td><td><code>useState</code>, or a form library at scale</td></tr>
<tr><td><b>URL</b></td><td>Filters, sort, page, search, the open item</td><td>The URL &mdash; <code>useSearchParams</code></td></tr>
<tr><td><b>Server cache</b></td><td>Anything fetched from an API</td><td>A data library, not <code>useState</code></td></tr>
<tr><td><b>Shared client</b></td><td>Theme, auth, cart, a toast queue</td><td>Context, or a store</td></tr>
</tbody>
</table></div>
<p>
  The single biggest improvement most React codebases can make is moving rows
  three and four out of <code>useState</code>. Filters belong in the URL; server
  data belongs in a cache that knows about staleness.
</p>

<div class="bx is-prim">
  <span class="ttl">Server state is not client state</span>
  <p>
    Data from an API is a <b>cached copy of something you do not own</b>. It can
    be stale, it needs refetching, several components want the same copy, and it
    has loading and error states. Putting it in <code>useState</code> means
    reimplementing all of that by hand, badly, in every component that fetches.
  </p>
</div>

<h3>The three questions before adding state</h3>
<ol>
  <li><b>Can it be derived?</b> If it can be computed from props or other state, compute it. Do not store it.</li>
  <li><b>Does the UI change when it changes?</b> If not, it is a <a href="/react/react-useref">ref</a>.</li>
  <li><b>Who needs it?</b> Put it at the closest common ancestor of everyone who reads it &mdash; and no higher.</li>
</ol>
<pre><code>const [items, setItems] = useState([]);
const [count, setCount] = useState(0);          <span class="c">// ✗ derived — will drift</span>
const [selectedItem, setSelectedItem] = useState(null);  <span class="c">// ✗ a whole copy</span>

const count = items.length;                     <span class="c">// ✓</span>
const [selectedId, setSelectedId] = useState(null);
const selectedItem = items.find((i) =&gt; i.id === selectedId);   <span class="c">// ✓ always fresh</span></code></pre>
<p>
  Storing the selected <em>object</em> rather than its id is the classic
  duplication bug: edit the item in the list and the selection still shows the
  old version, because they are two separate copies now.
</p>

<h3>Shape it so bad states cannot exist</h3>
<pre><code><span class="c">// ✗ 16 combinations, 4 of them valid</span>
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

<span class="c">// ✓ 4 states, and they are the 4 that exist</span>
const [state, setState] = useState({ status: "idle" });
<span class="c">// { status: "loading" } | { status: "error", error } | { status: "ready", data }</span></code></pre>
<p>
  With separate flags, "loading and also has an error" is one forgotten setter
  away, and the UI that results is genuinely confusing. With a status field it
  is unreachable. <a href="/react/react-usereducer">useReducer</a> is the
  natural home for this once there are more than two transitions.
</p>

<h3>Normalise when things reference each other</h3>
<pre><code><span class="c">// ✗ the same author object copied into every post</span>
posts: [{ id: 1, author: { id: 9, name: "Ana" } }, ...]

<span class="c">// ✓ one copy, referenced by id</span>
posts: { 1: { id: 1, authorId: 9 } },
authors: { 9: { id: 9, name: "Ana" } }</code></pre>
<p>
  Renaming Ana now touches one place instead of every post she wrote. Lookups
  become O(1). This is a database idea and it applies for the same reason:
  duplicated data drifts.
</p>
<p class="sub">
  Do not normalise a list of twenty things you render once. Normalise when the
  same entity appears in several places, or when you update items by id.
</p>

<h3>Colocation: the default that keeps apps fast</h3>
<p>
  State at the top of the tree re-renders everything below it. State next to
  where it is used re-renders one subtree. The instinct to "lift it up in case
  something else needs it" is what makes an app slow and its components
  untestable.
</p>
<pre><code>function App() {
  const [isMenuOpen, setMenuOpen] = useState(false);   <span class="c">// ✗ whole app re-renders</span>
}

function Menu() {
  const [isOpen, setOpen] = useState(false);           <span class="c">// ✓ only the menu</span>
}</code></pre>
<p>
  Lift when two components genuinely need the same value; push it back down the
  moment only one does.
</p>

<h3>A decision tree</h3>
<div class="table-scroll"><table>
<thead><tr><th>Question</th><th>Answer</th></tr></thead>
<tbody>
<tr><td>Comes from a server?</td><td>A data library. <a href="/react/react-server-state">TanStack Query</a>.</td></tr>
<tr><td>Should survive a refresh or a shared link?</td><td>The URL.</td></tr>
<tr><td>Used by one component?</td><td><code>useState</code>, right there.</td></tr>
<tr><td>Used by a few nearby components?</td><td>Lift to the common parent.</td></tr>
<tr><td>Used everywhere, changes rarely?</td><td><a href="/react/react-context">Context</a>.</td></tr>
<tr><td>Used everywhere, changes often?</td><td><a href="/react/react-state-libraries">A store with selectors</a>.</td></tr>
<tr><td>Does not affect rendering?</td><td>A ref, or a module variable.</td></tr>
</tbody>
</table></div>

<h3>The refactor that fixes most apps</h3>
<p>
  Take a component with eight <code>useState</code> calls. Usually two of them
  are derived and can be deleted, two belong in the URL, three are server data
  that should be one query, and one is genuinely local. Eight becomes two, and
  the effects that were keeping them in sync disappear with them.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "I split state by kind before choosing a tool — server cache, URL, form,
    local UI, shared client — because most 'state management' problems are
    server data sitting in <code>useState</code>, or filters that should be in
    the URL. Then: derive what you can, keep the rest as low as possible, and
    shape it so impossible combinations cannot be represented."
  </p>
</div>`,
};
