import type { Chapter } from "../types";

export const reactFormsAtScale: Chapter = {
  id: "react-forms-at-scale",
  num: "I11",
  title: "Forms at scale",
  short: "Forms at scale",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Where hand-rolled state stops paying, and what a form library actually buys you.",
  body: `<h3>The point where it stops working</h3>
<p>
  A login form needs no library. The trouble starts at a specific set of
  requirements, and it is worth naming them so you can tell which one you have:
</p>
<ul>
  <li>Twenty fields, so every keystroke re-renders all twenty.</li>
  <li>Repeated groups &mdash; add a line item, remove one, reorder.</li>
  <li>Rules that span fields: end date after start date, total must match.</li>
  <li>Async validation, like checking a username is free, debounced.</li>
  <li>Multi-step wizards with per-step validation and a shared draft.</li>
  <li>Server errors that need mapping back onto individual fields.</li>
</ul>

<h3>React Hook Form, and why it is fast</h3>
<pre><code>const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

&lt;form onSubmit={handleSubmit(onValid)}&gt;
  &lt;input {...register("email", { required: "Email is required" })} /&gt;
  {errors.email &amp;&amp; &lt;p&gt;{errors.email.message}&lt;/p&gt;}
  &lt;button disabled={isSubmitting}&gt;Save&lt;/button&gt;
&lt;/form&gt;</code></pre>
<p>
  <code>register</code> returns <code>name</code>, <code>onChange</code>,
  <code>onBlur</code> and a <code>ref</code>. The inputs are
  <b>uncontrolled</b> &mdash; values live in the DOM and the library reads them
  through refs, so typing does not re-render the form at all. Only the
  components that subscribe to a specific error re-render.
</p>
<p class="sub">
  That is the whole performance story, and it is why the library exists.
  Controlled forms re-render on every keystroke; at twenty fields with any
  derived work, that becomes visible.
</p>

<h3>Schema validation</h3>
<pre><code>const schema = z.object({
  email: z.string().email("Not a valid email"),
  age: z.coerce.number().min(18, "Must be 18 or over"),
  password: z.string().min(8),
  confirm: z.string(),
}).refine((d) =&gt; d.password === d.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],                       <span class="c">// attach the error to a field</span>
});

const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) });</code></pre>
<p>
  The rules move out of the JSX into one object, which means they can be
  reused &mdash; the same schema validates on the client, on the server, and
  produces the TypeScript type:
</p>
<pre><code>type FormValues = z.infer&lt;typeof schema&gt;;   <span class="c">// one source of truth</span></code></pre>
<div class="bx is-prim">
  <span class="ttl">Client validation is UX, not security</span>
  <p>
    Anything the browser checks can be bypassed with one <code>curl</code>. The
    server must validate the same rules independently &mdash; sharing the schema
    is what makes that cheap rather than a second implementation that drifts.
  </p>
</div>

<h3>Dynamic field arrays</h3>
<pre><code>const { fields, append, remove } = useFieldArray({ control, name: "items" });

{fields.map((field, index) =&gt; (
  &lt;div key={field.id}&gt;                     <span class="c">// field.id, never index</span>
    &lt;input {...register(\`items.\${index}.name\`)} /&gt;
    &lt;button type="button" onClick={() =&gt; remove(index)}&gt;Remove&lt;/button&gt;
  &lt;/div&gt;
))}
&lt;button type="button" onClick={() =&gt; append({ name: "" })}&gt;Add&lt;/button&gt;</code></pre>
<p>
  This is the <a href="/react/react-lists-keys">index-key bug</a> in its most
  expensive form: remove the first row with index keys and every row below keeps
  the previous row's typed value. The library generates a stable
  <code>field.id</code> precisely for this.
</p>

<h3>Mapping server errors back onto fields</h3>
<pre><code>try {
  await save(values);
} catch (err) {
  if (err.fields) {
    for (const [name, message] of Object.entries(err.fields)) {
      setError(name, { message });          <span class="c">// lands on the right input</span>
    }
  } else {
    setError("root", { message: err.message });   <span class="c">// form-level</span>
  }
}</code></pre>
<p>
  "Email already registered" belongs next to the email field, not in a banner at
  the top. This is the step most hand-rolled forms skip, and it is the
  difference between a form people can fix and one they abandon.
</p>

<h3>Accessibility, which is most of the remaining work</h3>
<pre><code>&lt;label htmlFor="email"&gt;Email&lt;/label&gt;
&lt;input
  id="email"
  {...register("email")}
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
  autoComplete="email"
/&gt;
{errors.email &amp;&amp; &lt;p id="email-error" role="alert"&gt;{errors.email.message}&lt;/p&gt;}</code></pre>
<ul>
  <li><b>Every input has a real label.</b> A placeholder is not one.</li>
  <li><b><code>aria-describedby</code></b> ties the error to the field, so it is announced with it.</li>
  <li><b>Move focus to the first error on submit</b> &mdash; otherwise a keyboard user has no idea what failed or where.</li>
  <li><b><code>autoComplete</code></b> is the difference between a form the browser fills and one it does not.</li>
</ul>

<h3>Multi-step forms</h3>
<p>
  Keep one state object for the whole wizard, held above the steps, and validate
  per step against a slice of the schema. Put the step number in the URL so
  refresh and back work, and persist the draft &mdash; a wizard that loses
  everything on an accidental refresh is the most annoying form there is.
</p>

<h3>React 19 form actions</h3>
<pre><code>function Signup() {
  const [state, formAction, isPending] = useActionState(signup, null);
  return (
    &lt;form action={formAction}&gt;
      &lt;input name="email" /&gt;
      &lt;button disabled={isPending}&gt;Sign up&lt;/button&gt;
      {state?.error &amp;&amp; &lt;p&gt;{state.error}&lt;/p&gt;}
    &lt;/form&gt;
  );
}</code></pre>
<p>
  A <code>&lt;form action={fn}&gt;</code> gets the pending state, the result and
  progressive enhancement built in &mdash; and it works before hydration.
  <code>useFormStatus</code> lets a nested submit button read the pending state
  without prop drilling. For simple forms this removes the library entirely;
  <a href="/react/react-server-actions">Server Actions</a> takes it further.
</p>

<h3>Choosing</h3>
<div class="table-scroll"><table>
<thead><tr><th>Form</th><th>Reach for</th></tr></thead>
<tbody>
<tr><td>Login, search, a few fields</td><td><code>useState</code>, or a form action</td></tr>
<tr><td>10+ fields, or cross-field rules</td><td>React Hook Form + Zod</td></tr>
<tr><td>Dynamic rows, wizards, drafts</td><td>React Hook Form, definitely</td></tr>
<tr><td>Framework with server actions</td><td>Actions first; add a library only for the client-side niceties</td></tr>
</tbody>
</table></div>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Hand-rolled controlled forms re-render everything on every keystroke and
    make you reimplement validation, arrays and error mapping. React Hook Form
    keeps values in the DOM and subscribes narrowly, and a Zod schema gives you
    client validation, server validation and the TypeScript type from one
    definition."
  </p>
</div>`,
};
