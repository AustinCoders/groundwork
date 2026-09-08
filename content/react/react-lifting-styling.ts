import type { Chapter } from "../types";

export const reactLiftingStyling: Chapter = {
  id: "react-lifting-styling",
  num: "B10",
  title: "Lifting state up & basic styling",
  short: "Lifting state & styling",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "When two components need the same value, it belongs to the one above both of them.",
  body: `<h3>The problem</h3>
<p>
  Two siblings need the same piece of state &mdash; a search box and a list, a
  filter and a table. They cannot see each other; React data only flows down. So
  the value moves <b>up</b> to the closest component that contains both, and
  comes back down as props.
</p>
<pre><code>function Page() {
  const [query, setQuery] = useState("");        <span class="c">// owned here</span>

  return (
    &lt;&gt;
      &lt;SearchBox value={query} onChange={setQuery} /&gt;
      &lt;Results query={query} /&gt;
    &lt;/&gt;
  );
}

function SearchBox({ value, onChange }) {
  return &lt;input value={value} onChange={(e) =&gt; onChange(e.target.value)} /&gt;;
}</code></pre>
<p>
  <code>SearchBox</code> now has no state of its own. It renders what it is
  given and reports what happened &mdash; which also makes it trivial to test and
  reusable anywhere.
</p>

<div class="bx is-prim">
  <span class="ttl">Controlled and uncontrolled, for your own components</span>
  <p>
    A component holding its own state is <b>uncontrolled</b>: easy to drop in,
    but the parent cannot read or set it. A component taking
    <code>value</code> and <code>onChange</code> is <b>controlled</b>: more
    wiring, complete control. The same distinction as a DOM input, and the same
    trade.
  </p>
</div>

<h3>Where should this state live?</h3>
<ol>
  <li>Find every component that reads the value.</li>
  <li>Find their closest common parent.</li>
  <li>Put the state there. Pass the value down, pass a setter down.</li>
</ol>
<p>
  Then stop. The instinct to put everything at the top of the app is the wrong
  one &mdash; state at the root re-renders the whole tree and makes every
  component below it dependent on a page it should not know about.
</p>

<h3>Prop drilling, and when it is actually a problem</h3>
<p>
  Passing a prop through two or three layers is fine. It is explicit and you can
  trace it. It becomes a problem when a value crosses many layers that have no
  use for it &mdash; a theme, the signed-in user, a locale.
</p>
<p>
  Two answers before you reach for a library: <b>compose instead</b>, by passing
  the finished element down as <code>children</code> so it never needs the prop
  in between; and <a href="/react/react-context">context</a>, for values that
  are genuinely ambient. Both are covered later; the mistake is jumping to a
  global store on the third prop.
</p>

<h3>Composition beats drilling</h3>
<p>
  Before adding context, check whether the prop needs to travel at all. If the
  middle layers only pass it through, hand them the finished element instead.
</p>
<pre><code><span class="c">// ✗ Layout and Sidebar both take a prop neither uses</span>
&lt;Layout user={user}&gt;
  &lt;Sidebar user={user}&gt;
    &lt;Profile user={user} /&gt;

<span class="c">// ✓ built at the top, passed as an element — nothing in between knows</span>
&lt;Layout sidebar={&lt;Sidebar&gt;&lt;Profile user={user} /&gt;&lt;/Sidebar&gt;} /&gt;</code></pre>
<p>
  The element is created where the data lives, so the layers it travels through
  carry it as opaque <code>children</code>. This removes most prop drilling
  people reach for a store to solve.
</p>

<h3>Colocation: keep state as low as it will go</h3>
<p>
  The opposite of lifting, and just as important. A modal's open/closed flag
  belongs to the component that owns the modal, not to the page. State at the
  top of the tree re-renders everything below it and couples components that
  should not know about each other.
</p>
<p>
  Lift when two components genuinely need the same value. Push it back down the
  moment only one does.
</p>

<h3>Styling: the four options</h3>
<div class="table-scroll"><table>
<thead><tr><th>Approach</th><th>Good for</th><th>Cost</th></tr></thead>
<tbody>
<tr><td><b>Plain CSS / CSS Modules</b></td><td>Almost everything. Modules scope class names per file</td><td>You name things yourself</td></tr>
<tr><td><b>Tailwind</b></td><td>Speed, and a design system by default</td><td>Long class strings; a build step</td></tr>
<tr><td><b>CSS-in-JS</b></td><td>Styles that depend on props at runtime</td><td>Runtime cost; awkward with Server Components</td></tr>
<tr><td><b>Inline <code>style</code></b></td><td>One or two computed values</td><td>No pseudo-classes, no media queries, no cascade</td></tr>
</tbody>
</table></div>

<h4>CSS Modules</h4>
<pre><code><span class="c">// Card.module.css</span>
.card { border: 1px solid #ddd; }
.title { font-weight: 700; }

<span class="c">// Card.jsx</span>
import styles from "./Card.module.css";

&lt;div className={styles.card}&gt;
  &lt;h2 className={styles.title}&gt;{title}&lt;/h2&gt;
&lt;/div&gt;</code></pre>
<p class="sub">
  The build renames <code>.card</code> to something unique per file, so two
  components can both have a <code>.card</code> without colliding. No naming
  convention to enforce, no cascade surprises.
</p>

<h4>Conditional classes</h4>
<pre><code>&lt;button className={"btn " + (active ? "btn--active" : "")}&gt;

&lt;button className={["btn", active &amp;&amp; "btn--active", size &amp;&amp; "btn--" + size]
  .filter(Boolean)
  .join(" ")}&gt;</code></pre>
<p>
  Past two or three conditions, the <code>clsx</code> package does exactly this
  in one call and is worth the dependency.
</p>

<h4>Inline styles, and their limits</h4>
<pre><code>&lt;div style={{ width: percent + "%", backgroundColor: color }} /&gt;</code></pre>
<p>
  Right for a value computed at runtime, like a progress bar's width. Wrong as
  a general approach: no <code>:hover</code>, no <code>@media</code>, no
  <code>::before</code>, and a new object every render.
</p>

<div class="bx is-ref">
  <span class="ttl">A rule that keeps components reusable</span>
  <p>
    A component should not set its own margin. Margin is about the relationship
    between a component and its neighbours, and only the parent knows that.
    Let the layout own spacing &mdash; a <code>gap</code> on the container &mdash;
    and the component can be dropped anywhere without fighting it.
  </p>
</div>

<h3>Design tokens beat scattered values</h3>
<pre><code>:root {
  --ink: #1f3a73;
  --paper: #fffdf6;
  --radius: 12px;
}
@media (prefers-color-scheme: dark) {
  :root { --ink: #d9e5fb; --paper: #191d25; }
}

.card { background: var(--paper); color: var(--ink); border-radius: var(--radius); }</code></pre>
<p>
  Custom properties cascade and can be swapped at runtime, so dark mode becomes
  a handful of redefinitions rather than a second stylesheet. Components read
  tokens and never literals &mdash; then a colour changes in one place, not
  forty.
</p>
<p class="sub">
  This is worth setting up on day one of a project. Retrofitting tokens onto a
  codebase full of hex codes is a long afternoon.
</p>

<h3>Putting the tier together</h3>
<p>
  With these ten chapters you can build a real screen: components composed from
  props, state where it belongs, events and conditions, lists with correct keys,
  a controlled form, and an effect for the one thing that genuinely needs to
  reach outside React.
</p>
<p>
  The next chapter is where you do exactly that, end to end &mdash;
  <a href="/react/react-guided-project">a task board</a>, built in the order a
  machine-coding round expects.
</p>
<p>
  What you still cannot do is explain <em>why</em> it re-rendered. That is the
  intermediate tier &mdash; refs, context, memoisation, and the fetching
  patterns that do not race themselves &mdash; and it starts with
  <a href="/react/react-useref">useRef</a>.
</p>`,
};
