import type { Chapter } from "../types";

export const reactDataFetching: Chapter = {
  id: "react-data-fetching",
  num: "I10",
  title: "Data fetching patterns",
  short: "Data fetching",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Every bug in hand-rolled fetching is one of five, and they are all solved problems.",
  body: `<h3>The naive version, and what is wrong with it</h3>
<pre><code>useEffect(() =&gt; {
  fetch("/api/user/" + id)
    .then((r) =&gt; r.json())
    .then(setUser);
}, [id]);</code></pre>
<p>Five separate bugs, in roughly the order they will bite you.</p>

<h4>1. No error handling &mdash; and <code>fetch</code> does not throw on 404</h4>
<pre><code>const res = await fetch(url);
if (!res.ok) throw new Error("HTTP " + res.status);   <span class="c">// you must check</span>
return res.json();</code></pre>
<p>
  <code>fetch</code> only rejects on a network failure. A 500 resolves happily,
  and <code>res.json()</code> then throws a parse error on the HTML error page,
  giving you a confusing message about an unexpected token.
</p>

<h4>2. The race condition</h4>
<pre><code>useEffect(() =&gt; {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then((r) =&gt; r.json())
    .then(setUser)
    .catch((e) =&gt; { if (e.name !== "AbortError") setError(e); });
  return () =&gt; controller.abort();
}, [url]);</code></pre>
<p>
  Change <code>id</code> from 1 to 2 quickly and both requests are in flight. If
  the first is slower it resolves last and overwrites user 2 with user 1. The
  screen shows the wrong person and nothing looks broken. This is the bug that
  only appears on bad connections, which is to say on your users' connections.
</p>

<h4>3. No loading or error state</h4>
<p>
  Rendering <code>user.name</code> before the request finishes throws. Every
  fetch needs at least three states, and the empty result is a fourth.
</p>

<h4>4. No cache, no deduplication</h4>
<p>
  Three components asking for the same user make three requests. Navigate away
  and back and it refetches from scratch, showing a spinner for data you had
  two seconds ago.
</p>

<h4>5. The waterfall</h4>
<pre><code><span class="c">// ✗ sequential: 300ms + 300ms</span>
const user = await getUser(id);
const posts = await getPosts(id);

<span class="c">// ✓ parallel: 300ms</span>
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);</code></pre>
<p>
  The component version of this is worse: a parent fetches, renders, and only
  then does the child discover what <em>it</em> needs. Each level of the tree
  adds a round trip. Hoisting the requests, or using a router loader, collapses
  them.
</p>

<h3>A hook that handles four of the five</h3>
<pre><code>function useFetch(url) {
  const [state, setState] = useState({ status: "idle" });

  useEffect(() =&gt; {
    if (!url) return;
    const controller = new AbortController();
    setState({ status: "loading" });

    fetch(url, { signal: controller.signal })
      .then((r) =&gt; {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((data) =&gt; setState({ status: "ready", data }))
      .catch((error) =&gt; {
        if (error.name !== "AbortError") setState({ status: "error", error });
      });

    return () =&gt; controller.abort();
  }, [url]);

  return state;
}</code></pre>
<p>
  One status field rather than three booleans, so the impossible combinations
  cannot occur. What it still does not do is cache &mdash; and caching is where
  hand-rolling stops being worth it.
</p>

<div class="bx is-prim">
  <span class="ttl">The line where you should stop writing this yourself</span>
  <p>
    Caching, deduplicating in-flight requests, revalidating on focus,
    invalidating after a mutation, pagination, retries with backoff, optimistic
    updates and rollback. Each is a day of work and a source of subtle bugs.
    <a href="/react/react-server-state">TanStack Query</a> is roughly 12 KB and
    does all of it &mdash; and in a framework, the loader or Server Component
    does it before React is involved at all.
  </p>
</div>

<h3>Stale-while-revalidate</h3>
<p>
  The pattern behind every good data library, and worth understanding on its own:
  <b>show the cached value immediately, refetch in the background, replace it if
  it changed</b>. The screen is never blank for data you already had, and it is
  never wrong for long.
</p>
<p>
  It changes what "loading" means. There is a first load, where there is nothing
  to show, and there is a revalidation, where there is stale data on screen. The
  first deserves a skeleton; the second deserves a subtle indicator at most.
  Showing a full spinner for a background refresh is the most common way this
  gets built wrong.
</p>

<h3>Mutations, and the two ways to update</h3>
<pre><code><span class="c">// pessimistic: wait, then reflect the truth</span>
await save(item);
refetch();

<span class="c">// optimistic: assume success, roll back if wrong</span>
const previous = items;
setItems(items.map((i) =&gt; (i.id === id ? { ...i, done: true } : i)));
try {
  await save({ id, done: true });
} catch {
  setItems(previous);                    <span class="c">// the part people forget</span>
  showError();
}</code></pre>
<p>
  Optimistic updates make an app feel instant, and the rollback is what makes
  them honest. An optimistic update without one shows the user a change that
  never happened &mdash; and they find out when they refresh.
</p>

<h3>Fetching on the server instead</h3>
<pre><code><span class="c">// Next.js Server Component — no effect, no loading state, no waterfall</span>
export default async function Page({ params }) {
  const user = await getUser(params.id);
  return &lt;Profile user={user} /&gt;;
}</code></pre>
<p>
  Where the framework allows it, this is strictly better: the request happens
  next to the database, the browser gets HTML with the data already in it, and
  none of the five bugs above can occur because there is no client-side fetch.
  Client fetching then handles only what is genuinely interactive &mdash;
  polling, infinite scroll, anything after a user action.
  <a href="/react/react-server-components">Server Components</a> covers this.
</p>

<h3>Choosing</h3>
<div class="table-scroll"><table>
<thead><tr><th>Situation</th><th>Use</th></tr></thead>
<tbody>
<tr><td>Framework with loaders or Server Components</td><td>Fetch there. Nothing beats not doing it on the client.</td></tr>
<tr><td>SPA, more than a couple of screens</td><td>TanStack Query or SWR</td></tr>
<tr><td>One request, one screen, a prototype</td><td>A <code>useFetch</code> like the one above &mdash; with the abort</td></tr>
<tr><td>GraphQL</td><td>Apollo or urql; the same cache ideas, schema-aware</td></tr>
</tbody>
</table></div>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Fetching in an effect gives you five problems: no error handling because
    <code>fetch</code> does not throw on 4xx, a race when the inputs change, no
    shared cache, no deduplication, and waterfalls as each level discovers what
    it needs. A data library solves all of them, and fetching on the server
    avoids them entirely."
  </p>
</div>`,
};
