import type { Chapter } from "../types";

export const reactThinking: Chapter = {
  id: "react-thinking",
  num: "B2",
  title: "Thinking in React",
  short: "Thinking in React",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "Turning a picture into a component tree — the step that happens before you type anything.",
  body: `<h3>Why this is a chapter</h3>
<p>
  Machine-coding rounds hand you a screenshot and ninety minutes. Candidates who
  start typing immediately spend the last twenty minutes untangling state that
  ended up in the wrong place. The five minutes spent here are the cheapest
  minutes in the round.
</p>

<h3>Step 1 &mdash; draw boxes on the mockup</h3>
<p>
  Take the design and draw a box around every piece that is <b>one thing</b>. The
  test is the same one that applies to functions: if you cannot name it without
  saying "and", it is two boxes.
</p>
<pre><code>ProductPage
├── SearchBar            <span class="c">// input + checkbox</span>
├── FilterPanel
│   └── CategoryChip     <span class="c">// repeated</span>
└── ProductTable
    ├── CategoryRow      <span class="c">// repeated</span>
    └── ProductRow       <span class="c">// repeated</span></code></pre>
<p>
  Anything that repeats is a component &mdash; that is the easiest signal on the
  page. Anything with its own heading usually is too.
</p>

<h3>Step 2 &mdash; build it static first, with no state at all</h3>
<p>
  Pass the data down as props and render it. No <code>useState</code>, no
  handlers, nothing interactive. It feels like a detour and it is the fastest
  route: you find out whether your component boundaries work before any state
  depends on them.
</p>
<pre><code>function ProductTable({ products, query }) {
  return (
    &lt;table&gt;
      &lt;tbody&gt;
        {products.map((p) =&gt; &lt;ProductRow key={p.id} product={p} /&gt;)}
      &lt;/tbody&gt;
    &lt;/table&gt;
  );
}</code></pre>
<div class="bx is-prim">
  <span class="ttl">Say this out loud in an interview</span>
  <p>
    "I'll get the static version rendering from a hardcoded array first, then add
    state." It tells the interviewer you have done this before, and it gives you
    something on screen within ten minutes &mdash; which matters when the clock
    runs out.
  </p>
</div>

<h3>Step 3 &mdash; find the minimal state</h3>
<p>
  Go through every value the UI needs and ask three questions. Most values fail
  all three, and those are not state.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Ask</th><th>If yes</th></tr></thead>
<tbody>
<tr><td>Is it passed in from a parent?</td><td>Props, not state</td></tr>
<tr><td>Does it stay the same over time?</td><td>A constant, not state</td></tr>
<tr><td>Can you compute it from props or other state?</td><td><b>Derive it</b> &mdash; do not store it</td></tr>
</tbody>
</table></div>
<pre><code>products          <span class="c">// ✗ props — comes from the server</span>
searchQuery       <span class="c">// ✓ state — the user types it</span>
showInStockOnly   <span class="c">// ✓ state — the user toggles it</span>
filteredProducts  <span class="c">// ✗ derived — compute it during render</span>
resultCount       <span class="c">// ✗ derived — filteredProducts.length</span></code></pre>
<p>
  Two pieces of state, not five. Storing <code>filteredProducts</code> means
  keeping it in sync with the query forever, and it will drift the first time
  somebody adds a filter.
</p>

<h3>Step 4 &mdash; put each piece where it belongs</h3>
<ol>
  <li>List every component that <b>reads</b> the value.</li>
  <li>Find their closest common parent.</li>
  <li>Put the state there. Not higher.</li>
</ol>
<p>
  <code>searchQuery</code> is read by <code>SearchBar</code>, which renders it,
  and by <code>ProductTable</code>, which filters on it. Their common parent is
  <code>ProductPage</code> &mdash; so it lives there and comes down as props.
</p>
<p class="sub">
  The instinct to put everything at the top "in case something needs it" is the
  one to resist. State at the root re-renders the whole tree and couples
  components to a page they should know nothing about.
</p>

<h3>Step 5 &mdash; add the inverse data flow</h3>
<pre><code>function ProductPage() {
  const [query, setQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  const visible = products.filter(
    (p) =&gt; p.name.includes(query) &amp;&amp; (!inStockOnly || p.stocked)
  );

  return (
    &lt;&gt;
      &lt;SearchBar
        query={query}
        inStockOnly={inStockOnly}
        onQueryChange={setQuery}
        onStockChange={setInStockOnly}
      /&gt;
      &lt;ProductTable products={visible} /&gt;
    &lt;/&gt;
  );
}</code></pre>
<p>
  The child cannot change the value; it reports that something happened and the
  owner decides what that means. That indirection is what makes
  <code>SearchBar</code> reusable somewhere its author never saw.
</p>

<h3>The mistakes this process prevents</h3>
<div class="table-scroll"><table>
<thead><tr><th>Mistake</th><th>Where it shows up</th></tr></thead>
<tbody>
<tr><td>Storing derived values</td><td>Two sources of truth that drift apart</td></tr>
<tr><td>State too high</td><td>Everything re-renders; components cannot be moved</td></tr>
<tr><td>State too low</td><td>A sibling needs it and you cannot reach it</td></tr>
<tr><td>Components split by markup, not by responsibility</td><td>A "Row" that knows about filtering</td></tr>
<tr><td>Building interactivity before the static version</td><td>Rewriting the tree at minute sixty</td></tr>
</tbody>
</table></div>

<h3>The same five steps, compressed</h3>
<pre><code>1. Boxes on the mockup        → the component tree
2. Static render, no state    → prove the boundaries
3. Minimal state              → three questions, most values fail them
4. Where it lives             → closest common parent, no higher
5. Callbacks down             → children report, owners decide</code></pre>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "I break the mockup into components by responsibility, build it static from
    hardcoded data first so the boundaries are proven before any state depends on
    them, then find the minimal state by eliminating anything derivable — and put
    each piece at the closest common ancestor of the components that read it,
    not higher."
  </p>
</div>`,
};
