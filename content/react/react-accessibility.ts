import type { Chapter } from "../types";

export const reactAccessibility: Chapter = {
  id: "react-accessibility",
  num: "A13",
  title: "Accessibility",
  short: "Accessibility",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Semantics first, keyboard second, ARIA last — and focus management is the part React makes harder.",
  body: `<h3>The order that matters</h3>
<ol>
  <li><b>Semantics.</b> Use the element that already does the job.</li>
  <li><b>Keyboard.</b> Everything reachable, focus visible, order sensible.</li>
  <li><b>Names and state.</b> Every control has an accessible name; anything that toggles says so.</li>
  <li><b>Contrast and motion.</b> 4.5:1 for body text; respect <code>prefers-reduced-motion</code>.</li>
</ol>
<p>
  Working down that list fixes more than any amount of ARIA sprinkled on at the
  end &mdash; and each step is checkable in a minute.
</p>

<h3>The best ARIA is the ARIA you did not need</h3>
<pre><code>&lt;div onClick={save}&gt;Save&lt;/div&gt;                    <span class="c">// ✗ invisible to keyboards</span>
&lt;div role="button" tabIndex={0} onClick={save}
     onKeyDown={(e) =&gt; e.key === "Enter" &amp;&amp; save()}&gt;  <span class="c">// ✗ still not a button</span>
&lt;button onClick={save}&gt;Save&lt;/button&gt;               <span class="c">// ✓</span></code></pre>
<p>
  A real <code>&lt;button&gt;</code> is focusable, activates on Enter
  <em>and</em> Space, announces itself as a button, participates in forms,
  supports <code>disabled</code>, and shows a focus ring. The div version
  reimplements four of those and forgets the rest.
</p>

<h3>Names</h3>
<pre><code>&lt;button&gt;&lt;TrashIcon /&gt;&lt;/button&gt;                    <span class="c">// ✗ announced as "button"</span>
&lt;button aria-label="Delete task"&gt;&lt;TrashIcon /&gt;&lt;/button&gt;   <span class="c">// ✓</span>

&lt;label htmlFor="email"&gt;Email&lt;/label&gt;&lt;input id="email" /&gt;   <span class="c">// ✓ best</span>
&lt;input placeholder="Email" /&gt;                     <span class="c">// ✗ not a label</span></code></pre>
<p>
  An icon-only control with no name is the single most common failure in React
  apps, and it is the one a role-based test catches for free &mdash;
  <code>getByRole("button", { name: /delete/i })</code> simply will not find it.
</p>

<h3>useId: labels in a reusable component</h3>
<pre><code>function Field({ label, ...rest }) {
  const id = useId();
  return (
    &lt;&gt;
      &lt;label htmlFor={id}&gt;{label}&lt;/label&gt;
      &lt;input id={id} {...rest} /&gt;
    &lt;/&gt;
  );
}</code></pre>
<p>
  A hardcoded <code>id</code> breaks the moment the component is rendered twice
  &mdash; duplicate ids, and the second label points at the first input.
  <code>Math.random()</code> breaks server rendering, because the server and the
  client generate different values and hydration mismatches.
</p>
<p>
  <code>useId</code> generates an id that is stable across renders and
  <b>identical on the server and the client</b>, which is exactly the guarantee
  the other two options fail to give.
</p>
<pre><code>const id = useId();
&lt;input aria-describedby={id + "-hint"} /&gt;
&lt;p id={id + "-hint"}&gt;Must be at least 8 characters&lt;/p&gt;   <span class="c">// derive, don't call twice</span></code></pre>
<p class="sub">
  Call it once per component and derive related ids by suffixing. It is for
  linking elements to each other &mdash; not for list keys, where you want the
  data's own id.
</p>

<h3>Focus management: React's specific problem</h3>
<p>
  In a server-rendered site, clicking a link loads a new document and the
  browser resets focus. In a SPA nothing moves, so a screen-reader user
  navigates and is told nothing happened.
</p>
<pre><code>function Route({ children }) {
  const ref = useRef(null);
  const { pathname } = useLocation();

  useEffect(() =&gt; {
    ref.current?.focus();       <span class="c">// move focus to the new page's heading</span>
  }, [pathname]);

  return &lt;main ref={ref} tabIndex={-1}&gt;{children}&lt;/main&gt;;
}</code></pre>
<p class="sub">
  <code>tabIndex={-1}</code> makes an element programmatically focusable without
  adding it to the tab order. It is the standard trick for focus targets.
</p>

<h3>Dialogs, in full</h3>
<ul>
  <li>Focus moves <b>into</b> the dialog on open &mdash; the first control, or the heading.</li>
  <li>Focus is <b>trapped</b> while open; Tab cycles inside it.</li>
  <li><b>Escape</b> closes it.</li>
  <li>Focus <b>returns</b> to the element that opened it.</li>
  <li>The background is <b>inert</b>, so a screen reader cannot wander behind it.</li>
  <li><code>role="dialog"</code>, <code>aria-modal="true"</code>, and a label.</li>
</ul>
<pre><code>&lt;dialog ref={ref}&gt;...&lt;/dialog&gt;
ref.current.showModal();      <span class="c">// focus, Escape, inertness, top layer — all free</span></code></pre>
<p>
  The native element does the first five. It is the reason to reach for it
  before writing any of this by hand.
</p>

<h3>Announcing things that change</h3>
<pre><code>&lt;div aria-live="polite"&gt;{status}&lt;/div&gt;        <span class="c">// "Saved" — waits for a pause</span>
&lt;div role="alert"&gt;{error}&lt;/div&gt;               <span class="c">// interrupts — for errors only</span></code></pre>
<p>
  A toast that appears with no live region is invisible to a screen reader. The
  container must exist in the DOM <b>before</b> the text is inserted &mdash;
  rendering the whole region conditionally means the announcement is missed.
</p>

<h3>Conditional rendering and the disappearing focus</h3>
<pre><code>{isEditing ? &lt;Input /&gt; : &lt;button onClick={edit}&gt;Edit&lt;/button&gt;}</code></pre>
<p>
  Click Edit and the button unmounts. Focus was on it, so focus falls back to
  <code>&lt;body&gt;</code> &mdash; a keyboard user is now at the top of the
  document with no idea what happened. Move focus deliberately to the input,
  and back to the button when editing ends.
</p>

<h3>Forms</h3>
<pre><code>&lt;input
  id="email"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
  autoComplete="email"
/&gt;
{error &amp;&amp; &lt;p id="email-error"&gt;{error}&lt;/p&gt;}</code></pre>
<p>
  <code>aria-describedby</code> ties the message to the field so it is read with
  it. On submit, move focus to the first invalid field &mdash; otherwise the
  user is told there are errors and given no way to find them.
</p>
<p class="sub">
  Do not disable the submit button to indicate invalidity. It cannot be focused,
  so it explains nothing to the person who most needs the explanation.
</p>

<h3>What tooling catches, and what it cannot</h3>
<div class="table-scroll"><table>
<thead><tr><th>Tool</th><th>Finds</th></tr></thead>
<tbody>
<tr><td><code>eslint-plugin-jsx-a11y</code></td><td>Missing alt text, invalid roles, a click handler on a div &mdash; while you type</td></tr>
<tr><td><code>@axe-core/react</code>, Lighthouse</td><td>Contrast, missing names, bad heading order, duplicate ids</td></tr>
<tr><td>Testing Library role queries</td><td>Controls with no accessible name, because the query fails</td></tr>
<tr><td><b>Your keyboard</b></td><td>Everything above misses: focus order, traps, whether the flow makes sense</td></tr>
</tbody>
</table></div>
<p>
  Automated checks catch roughly a third of real issues. The other two thirds
  need five minutes with the mouse pushed away.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Semantics first — most ARIA I see is fixing a div that should have been a
    button. The part specific to React is focus management: client-side
    navigation does not reset focus, and conditionally rendering a focused
    element drops focus to the body, so both need handling explicitly."
  </p>
</div>`,
};
