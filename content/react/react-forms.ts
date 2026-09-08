import type { Chapter } from "../types";

export const reactForms: Chapter = {
  id: "react-forms",
  num: "B8",
  title: "Controlled forms",
  short: "Forms",
  levels: ["beginner"],
  practice: ["ex-react-validate-form", "ex-react-controlled-change"],
  ready: true,
  subtitle: "The input shows what state says, and typing asks state to change.",
  body: `<h3>Controlled: state is the source of truth</h3>
<pre><code>const [email, setEmail] = useState("");

&lt;input
  value={email}
  onChange={(e) =&gt; setEmail(e.target.value)}
/&gt;</code></pre>
<p>
  The loop is: state renders the value &rarr; you type &rarr;
  <code>onChange</code> fires &rarr; state updates &rarr; re-render puts the new
  value in the input. The DOM never holds anything React does not know about.
</p>
<p>
  Which is why <code>value</code> without <code>onChange</code> gives you a
  read-only input and a console warning &mdash; the input shows state, and
  without a handler nothing ever changes state.
</p>

<div class="bx is-prim">
  <span class="ttl">The undefined-to-defined warning</span>
  <p>
    <code>useState()</code> with no argument starts as <code>undefined</code>,
    which React treats as "uncontrolled". The first keystroke gives it a value
    and it becomes controlled &mdash; and React warns that the input changed
    kind mid-life. <b>Always initialise to <code>""</code></b>, never to
    <code>null</code> or nothing.
  </p>
</div>

<h3>The input types that are different</h3>
<pre><code><span class="c">// checkbox — checked, not value</span>
&lt;input type="checkbox" checked={agreed} onChange={(e) =&gt; setAgreed(e.target.checked)} /&gt;

<span class="c">// number — e.target.value is always a string</span>
&lt;input type="number" value={qty} onChange={(e) =&gt; setQty(Number(e.target.value))} /&gt;

<span class="c">// select — value on the select, not selected on the option</span>
&lt;select value={city} onChange={(e) =&gt; setCity(e.target.value)}&gt;
  &lt;option value="pune"&gt;Pune&lt;/option&gt;
&lt;/select&gt;

<span class="c">// textarea — value as a prop, not as children</span>
&lt;textarea value={bio} onChange={(e) =&gt; setBio(e.target.value)} /&gt;

<span class="c">// file — uncontrolled by law; read it from the event</span>
&lt;input type="file" onChange={(e) =&gt; setFile(e.target.files[0])} /&gt;</code></pre>

<h3>One object for a whole form</h3>
<p>
  Six fields do not need six <code>useState</code> calls. Give each input a
  <code>name</code> and share one handler.
</p>
<pre><code>const [form, setForm] = useState({ name: "", email: "", city: "" });

function handleChange(e) {
  const { name, value, type, checked } = e.target;
  setForm((f) =&gt; ({ ...f, [name]: type === "checkbox" ? checked : value }));
}

&lt;input name="name" value={form.name} onChange={handleChange} /&gt;
&lt;input name="email" value={form.email} onChange={handleChange} /&gt;</code></pre>
<p class="sub">
  The updater form matters here. <code>setForm({ ...form, ... })</code> reads the
  snapshot, which goes wrong the moment two fields change in one tick.
</p>

<h3>Submitting</h3>
<pre><code>&lt;form onSubmit={handleSubmit}&gt;
  ...
  &lt;button type="submit"&gt;Save&lt;/button&gt;
&lt;/form&gt;

async function handleSubmit(e) {
  e.preventDefault();          <span class="c">// or the page reloads</span>
  setSaving(true);
  try {
    await save(form);
  } catch (err) {
    setError(err.message);
  } finally {
    setSaving(false);          <span class="c">// runs on both paths</span>
  }
}</code></pre>
<p>
  Put the handler on the <code>&lt;form&gt;</code>, not on the button. That way
  pressing Enter in a text field submits, which is what people expect and what
  screen readers announce.
</p>
<p class="sub">
  A button inside a form defaults to <code>type="submit"</code>. A Cancel button
  that reloads your page is almost always a missing
  <code>type="button"</code>.
</p>

<h3>The uncontrolled alternative</h3>
<p>
  Controlled inputs re-render on every keystroke. Usually that is fine. When it
  is not &mdash; a long form, a slow parent &mdash; let the DOM hold the values
  and read them at submit.
</p>
<pre><code>function Form({ onSave }) {
  return (
    &lt;form onSubmit={(e) =&gt; {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget));
      onSave(data);                       <span class="c">// { name: "...", email: "..." }</span>
    }}&gt;
      &lt;input name="name" defaultValue="" /&gt;
      &lt;input name="email" type="email" /&gt;
      &lt;button&gt;Save&lt;/button&gt;
    &lt;/form&gt;
  );
}</code></pre>
<p>
  <code>defaultValue</code> rather than <code>value</code> is what makes an
  input uncontrolled: React sets it once and then leaves it alone.
  <code>FormData</code> reads every named field with no state at all.
</p>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Controlled</th><th>Uncontrolled</th></tr></thead>
<tbody>
<tr><td>Source of truth</td><td>React state</td><td>The DOM</td></tr>
<tr><td>Live validation, formatting as you type</td><td><span class="chip tone-yes">easy</span></td><td><span class="chip tone-bad">no</span></td></tr>
<tr><td>Disable submit until valid</td><td><span class="chip tone-yes">easy</span></td><td><span class="chip tone-bad">awkward</span></td></tr>
<tr><td>Re-renders while typing</td><td>every keystroke</td><td>none</td></tr>
<tr><td>Code for a plain form</td><td>more</td><td>almost none</td></tr>
</tbody>
</table></div>
<p class="sub">
  Default to controlled. Reach for uncontrolled when the form is large and does
  nothing until submit &mdash; and note that React 19's form actions are built
  on exactly this shape.
</p>

<h3>Validation that does not fight the user</h3>
<p>
  Validating on every keystroke means telling somebody their email is invalid
  while they are still typing the <code>@</code>. Validate on <b>blur</b> and on
  <b>submit</b>; once a field has an error, then it is fair to update it live so
  they can see it clear.
</p>
<pre><code>const [touched, setTouched] = useState({});
const errors = validate(form);              <span class="c">// derived, not state</span>
const showError = (field) =&gt; touched[field] &amp;&amp; errors[field];

&lt;input
  name="email"
  value={form.email}
  onChange={handleChange}
  onBlur={() =&gt; setTouched((t) =&gt; ({ ...t, email: true }))}
  aria-invalid={!!showError("email")}
  aria-describedby="email-error"
/&gt;
{showError("email") &amp;&amp; &lt;p id="email-error" className="error"&gt;{errors.email}&lt;/p&gt;}</code></pre>
<p>
  Note that <code>errors</code> is computed during render rather than stored.
  It is derived from <code>form</code>, so keeping it in state would just be a
  copy that can go stale.
</p>

<div class="bx is-prim">
  <span class="ttl">Do not disable the submit button</span>
  <p>
    A disabled button gives no reason and cannot be focused, so a keyboard or
    screen-reader user is stuck with no explanation. Leave it enabled, let the
    submit run the validation, and move focus to the first error. Disable it
    only <em>while the request is in flight</em>, to prevent a double submit.
  </p>
</div>

<h3>Labels are not optional</h3>
<pre><code>&lt;label htmlFor="email"&gt;Email&lt;/label&gt;
&lt;input id="email" name="email" type="email" autoComplete="email" /&gt;</code></pre>
<p>
  A placeholder is not a label: it disappears when typing starts, it fails
  contrast requirements in most designs, and it is not reliably announced.
  <code>autoComplete</code> is worth the two seconds &mdash; it is the difference
  between a form the browser can fill and one it cannot.
</p>

<h3>Two edge cases that bite</h3>
<h4>The cursor jumps to the end</h4>
<pre><code>&lt;input value={value.toUpperCase()} onChange={(e) =&gt; setValue(e.target.value)} /&gt;</code></pre>
<p>
  Transforming the value on the way out means the string React writes back
  differs from what the user typed, and the browser resets the caret to the end.
  Type in the middle of the word and the cursor jumps. Format on blur or on
  submit, not on every render.
</p>

<h4>Search that fires a request per keystroke</h4>
<pre><code>const [query, setQuery] = useState("");
const [debounced, setDebounced] = useState("");

useEffect(() =&gt; {
  const id = setTimeout(() =&gt; setDebounced(query), 300);
  return () =&gt; clearTimeout(id);        <span class="c">// cancels the previous timer</span>
}, [query]);

<span class="c">// then fetch on [debounced], not on [query]</span></code></pre>
<p>
  The input stays controlled and instant; only the value the request depends on
  lags behind. The cleanup is what makes it a debounce &mdash; every keystroke
  cancels the pending timer.
</p>

<h3>When to reach for a library</h3>
<p>
  Everything above is enough for a login, a settings panel, or a contact form.
  Once you have twenty fields, arrays of repeated field groups, cross-field
  rules or wizard steps, hand-rolling it stops being cheaper &mdash; that is
  what <a href="/react/react-forms-at-scale">forms at scale</a> is about.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "A controlled input renders from state and reports changes back to it, so
    React state is the single source of truth. Validate on blur and submit
    rather than on every keystroke, derive the errors instead of storing them,
    and keep the submit button enabled so the failure can be explained."
  </p>
</div>`,
};
