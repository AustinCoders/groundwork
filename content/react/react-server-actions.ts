import type { Chapter } from "../types";

export const reactServerActions: Chapter = {
  id: "react-server-actions",
  num: "A5",
  title: "Server Actions",
  short: "Server Actions",
  levels: ["advanced"],
  practice: ["ex-comp-action-state-form", "ex-comp-optimistic-messages"],
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
  React's own name for these is <b>Server Functions</b>; "Server Action" is the
  name for one used as a form action or called inside a transition.
</p>
<p class="sub">
  Under the hood it is a POST. At build time the client bundle gets an
  encrypted action ID and a small dispatcher in place of the function body; the
  body never leaves the server.
</p>

<div class="bx is-prim">
  <span class="ttl">This is a public HTTP endpoint</span>
  <p>
    The most important thing to understand. Marking a function
    <code>"use server"</code> exposes it to the internet &mdash; anyone can call
    it with any arguments, from anywhere. Being imported by one form does not
    protect it, and neither does rendering that form only for signed-in users.
    <b>Every action must authenticate and authorise for itself</b>, exactly like
    a REST route would, and validate its input.
  </p>
</div>
<pre><code>"use server";

export async function deletePost(rawId: unknown) {
  const id = z.string().uuid().parse(rawId);               <span class="c">// shape, first</span>

  const session = await auth();
  if (!session) throw new Error("Unauthorised");           <span class="c">// who</span>

  const post = await db.post.findUnique({ where: { id } });
  if (!post || post.authorId !== session.userId) {
    throw new Error("Forbidden");                          <span class="c">// what</span>
  }

  await db.post.delete({ where: { id } });
  return { ok: true };                                     <span class="c">// not the deleted record</span>
}</code></pre>
<p>
  The order is deliberate: reject malformed input before touching the database,
  and check ownership of the specific record, not just that someone is logged
  in. The return value is serialised to the client too, so return what the UI
  needs rather than a raw database row that may carry fields nobody should see.
</p>

<h3>What the framework does for you, and what it does not</h3>
<div class="table-scroll"><table>
<thead><tr><th>Next.js handles</th><th>You still handle</th></tr></thead>
<tbody>
<tr><td>CSRF: the request's <code>Origin</code> must match the host, or <code>serverActions.allowedOrigins</code></td><td>Authentication and authorisation in every action</td></tr>
<tr><td>A 1&nbsp;MB request body limit, raised with <code>serverActions.bodySizeLimit</code></td><td>Validating every field, since <code>FormData</code> is untrusted</td></tr>
<tr><td>Encrypted action IDs, and unused actions removed from the bundle</td><td>Rate limiting anything expensive or abusable</td></tr>
<tr><td>Encrypting values captured by an inline action's closure</td><td>Shaping return values to what the UI renders</td></tr>
</tbody>
</table></div>
<p>
  The protocol itself is also attack surface. In December 2025 a flaw in how
  React decodes Server Function requests allowed remote code execution before
  any of your checks ran &mdash; see
  <a href="/react/react-server-components">React2Shell</a>. Keeping React and
  the framework patched is part of shipping actions.
</p>

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
<p>
  Three behaviours worth knowing. Calls are <b>queued</b>: submit twice and the
  second call runs after the first, receiving its result as
  <code>prev</code>. A form using it <b>resets</b> after a successful submit,
  so return the submitted values if a failed form should keep them. And if
  the action throws, React cancels the queued calls and shows the nearest error
  boundary &mdash; so expected failures should be returned, not thrown.
</p>
<p class="sub">
  The optional third argument, a <code>permalink</code>, is for the moment
  before JavaScript loads: the browser navigates there after submitting, and the
  same form must be rendered on that page to receive the state.
</p>

<h3>useFormStatus, and its one rule</h3>
<pre><code>function SubmitButton() {
  const { pending } = useFormStatus();          <span class="c">// reads the form above</span>
  return &lt;button disabled={pending}&gt;{pending ? "Saving…" : "Save"}&lt;/button&gt;;
}

function NewPost() {
  const { pending } = useFormStatus();          <span class="c">// ✗ always false — the form is below</span>
  return (
    &lt;form action={createPost}&gt;
      &lt;SubmitButton /&gt;                           <span class="c">// ✓</span>
    &lt;/form&gt;
  );
}</code></pre>
<p>
  <code>useFormStatus</code> reads the <b>parent</b> form of the component that
  calls it, never a form that component renders. That is exactly what makes a
  shared <code>&lt;SubmitButton /&gt;</code> work with no props, and exactly why
  calling it next to the <code>&lt;form&gt;</code> tag silently returns
  <code>pending: false</code>. It also exposes <code>data</code>, the
  <code>FormData</code> being submitted.
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
updateTag("posts");                  <span class="c">// in an action: next read waits for fresh data</span>
revalidateTag("posts", "max");       <span class="c">// elsewhere: serve stale, refresh in background</span></code></pre>
<p>
  The mutation says what is now stale, and the framework refetches it. Same
  problem as <a href="/react/react-server-state">query invalidation</a>, same
  difficulty: getting the list of affected things right. Tags scale better than
  paths once several routes show the same data.
</p>
<p class="sub">
  In Next.js 16, <code>updateTag</code> exists for read-your-own-writes: it can
  only be called in a Server Action, and the user who just created a post sees
  it rather than a cached list. <code>revalidateTag</code> now takes a second
  argument, a cache profile; the one-argument form is deprecated.
</p>

<h3>Actions outside forms</h3>
<pre><code>&lt;button onClick={() =&gt; startTransition(() =&gt; deletePost(id))}&gt;Delete&lt;/button&gt;</code></pre>
<p>
  An action is just an async function, so it can be called from a handler. Wrap
  it in a transition so the UI stays responsive and pending state is tracked.
  The same applies to the dispatch function from <code>useActionState</code>:
  a form's <code>action</code> prop wraps it in a transition for you, but
  calling it from <code>onClick</code> without <code>startTransition</code>
  logs an error in development.
</p>

<h3>After a deploy</h3>
<p>
  Action IDs change between builds. A user who loaded the page before a deploy
  still holds the old IDs, and their next submit fails with "Failed to find
  Server Action". Treat that error as a prompt to refresh rather than a crash,
  and on self-hosted, multi-instance setups set
  <code>NEXT_SERVER_ACTIONS_ENCRYPTION_KEY</code> so every instance can decode
  the same references.
</p>

<h3>When not to use one</h3>
<div class="table-scroll"><table>
<thead><tr><th>Situation</th><th>Better</th></tr></thead>
<tbody>
<tr><td>A mobile app needs the same endpoint</td><td>A real API route &mdash; actions are framework-internal</td></tr>
<tr><td>Reading data on demand</td><td>A Server Component, or a query. Actions run one at a time per client, so they make a poor data-fetching layer.</td></tr>
<tr><td>Long-running work</td><td>A queue. An action holds a request open.</td></tr>
<tr><td>Streaming or websockets</td><td>Not what actions are for</td></tr>
<tr><td>Webhooks from a third party</td><td>A route handler, which has a stable URL</td></tr>
</tbody>
</table></div>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "A Server Action is a server function callable from the client, with the
    endpoint and serialisation generated for you, and it progressively enhances
    because a form action works before hydration. The thing people miss is that
    it is a public endpoint — the framework adds CSRF and size limits, but the
    action must still authenticate, authorise, validate and shape its return
    value on its own, regardless of which component calls it."
  </p>
</div>`,
};
