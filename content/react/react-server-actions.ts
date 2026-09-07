import type { Chapter } from "../types";

export const reactServerActions: Chapter = {
  id: "react-server-actions",
  num: "A5",
  title: "Server Actions",
  short: "Server Actions",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "A function that runs on the server, called from the client, with no API route in between.",
  body: `<h3>The shape</h3>
<pre><code>"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  await db.post.create({ data: { title } });
  revalidatePath("/posts");        <span class="c">// refresh what changed</span>
}</code></pre>
<pre><code>import { createPost } from "./actions";

export default function NewPost() {
  return (
    &lt;form action={createPost}&gt;
      &lt;input name="title" /&gt;
      &lt;button&gt;Create&lt;/button&gt;
    &lt;/form&gt;
  );
}</code></pre>
<p>
  No <code>fetch</code>, no route handler, no JSON, no manual serialisation.
  <code>"use server"</code> makes the function callable from the client; the
  framework generates the endpoint and the client passes a reference to it.
</p>

<div class="bx is-prim">
  <span class="ttl">This is a public HTTP endpoint</span>
  <p>
    The most important thing to understand. Marking a function
    <code>"use server"</code> exposes it to the internet &mdash; anyone can call
    it with any arguments, from anywhere. Being imported by one form does not
    protect it. <b>Every action must authenticate and authorise for itself</b>,
    exactly like a REST route would, and validate its input.
  </p>
</div>
<pre><code>"use server";

export async function deletePost(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorised");           <span class="c">// who</span>

  const post = await db.post.findUnique({ where: { id } });
  if (post.authorId !== session.userId) throw new Error("Forbidden");   <span class="c">// what</span>

  const parsed = z.string().uuid().parse(id);              <span class="c">// shape</span>
  await db.post.delete({ where: { id: parsed } });
}</code></pre>

<h3>Progressive enhancement</h3>
<p>
  A <code>&lt;form action={fn}&gt;</code> works before the JavaScript has loaded,
  and with JavaScript disabled. The browser posts the form the ordinary way; the
  framework routes it to the same function. Once hydrated, the same form submits
  without a page reload. You write it once and it degrades correctly.
</p>

<h3>Pending state and results</h3>
<pre><code>const [state, formAction, isPending] = useActionState(createPost, null);

&lt;form action={formAction}&gt;
  &lt;input name="title" /&gt;
  &lt;button disabled={isPending}&gt;{isPending ? "Saving…" : "Create"}&lt;/button&gt;
  {state?.error &amp;&amp; &lt;p role="alert"&gt;{state.error}&lt;/p&gt;}
&lt;/form&gt;</code></pre>
<p>
  The action receives the previous state as its first argument and returns the
  next one, so validation errors come back as data rather than as thrown
  exceptions &mdash; which means they survive the non-JavaScript path too.
</p>
<pre><code>export async function createPost(prev, formData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.post.create({ data: parsed.data });
  redirect("/posts");
}</code></pre>
<p class="sub">
  <code>useFormStatus</code> lets a nested submit button read the pending state
  of the form above it, so a shared <code>&lt;SubmitButton /&gt;</code> needs no
  props.
</p>

<h3>Optimistic UI</h3>
<pre><code>const [optimistic, addOptimistic] = useOptimistic(
  messages,
  (state, newMessage) =&gt; [...state, { ...newMessage, sending: true }]
);

async function send(formData) {
  addOptimistic({ text: formData.get("text") });   <span class="c">// appears instantly</span>
  await sendMessage(formData);                     <span class="c">// then the real one arrives</span>
}</code></pre>
<p>
  React discards the optimistic state automatically once the action settles and
  the real data arrives &mdash; including on failure, where it simply
  disappears. No manual rollback, which is the part hand-rolled optimistic
  updates usually get wrong.
</p>

<h3>Revalidation</h3>
<pre><code>revalidatePath("/posts");            <span class="c">// this route's cache</span>
revalidateTag("posts");              <span class="c">// everything tagged, wherever it is</span></code></pre>
<p>
  The mutation says what is now stale, and the framework refetches it. Same
  problem as <a href="/react/react-server-state">query invalidation</a>, same
  difficulty: getting the list of affected things right. Tags scale better than
  paths once several routes show the same data.
</p>

<h3>Actions outside forms</h3>
<pre><code>&lt;button onClick={() =&gt; startTransition(() =&gt; deletePost(id))}&gt;Delete&lt;/button&gt;</code></pre>
<p>
  An action is just an async function, so it can be called from a handler. Wrap
  it in a transition so the UI stays responsive and pending state is tracked.
</p>

<h3>When not to use one</h3>
<div class="table-scroll"><table>
<thead><tr><th>Situation</th><th>Better</th></tr></thead>
<tbody>
<tr><td>A mobile app needs the same endpoint</td><td>A real API route &mdash; actions are framework-internal</td></tr>
<tr><td>Reading data on demand</td><td>A Server Component, or a query</td></tr>
<tr><td>Long-running work</td><td>A queue. An action holds a request open.</td></tr>
<tr><td>Streaming or websockets</td><td>Not what actions are for</td></tr>
</tbody>
</table></div>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "A Server Action is a server function callable from the client, with the
    endpoint and serialisation generated for you, and it progressively enhances
    because a form action works before hydration. The thing people miss is that
    it is a public endpoint — it must authenticate, authorise and validate on
    its own, regardless of which component calls it."
  </p>
</div>`,
};
