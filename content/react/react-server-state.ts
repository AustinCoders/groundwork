import type { Chapter } from "../types";

export const reactServerState: Chapter = {
  id: "react-server-state",
  num: "I13",
  title: "Server state with TanStack Query",
  short: "TanStack Query",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Treat API data as a cache you do not own, and most of your state problems disappear.",
  body: `<h3>The distinction the library is built on</h3>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Client state</th><th>Server state</th></tr></thead>
<tbody>
<tr><td>Owned by</td><td>You</td><td>Somebody else's database</td></tr>
<tr><td>Can go stale</td><td>No</td><td>Constantly</td></tr>
<tr><td>Needs loading and error states</td><td>No</td><td>Always</td></tr>
<tr><td>Shared between components</td><td>Sometimes</td><td>Usually the same copy</td></tr>
<tr><td>Examples</td><td>Is the menu open, the current tab</td><td>Users, orders, anything fetched</td></tr>
</tbody>
</table></div>
<p>
  Putting server state in <code>useState</code> means reimplementing caching,
  deduplication, revalidation and invalidation in every component that fetches.
  That is the entire argument.
</p>

<h3>The basic query</h3>
<pre><code>const { data, isPending, isError, error } = useQuery({
  queryKey: ["user", userId],
  queryFn: () =&gt; fetch("/api/users/" + userId).then((r) =&gt; r.json()),
});

if (isPending) return &lt;Skeleton /&gt;;
if (isError) return &lt;ErrorPanel error={error} /&gt;;
return &lt;Profile user={data} /&gt;;</code></pre>
<p>
  Three components asking for <code>["user", 7]</code> make <b>one</b> request
  and share the result. Navigate away and back and the cached value renders
  immediately while a refetch happens quietly behind it.
</p>

<h3>The query key is the cache key</h3>
<pre><code>["todos"]                             <span class="c">// all todos</span>
["todos", { status: "done" }]         <span class="c">// a filtered list</span>
["todos", todoId]                     <span class="c">// one todo</span></code></pre>
<p>
  Everything the query depends on goes in the key. Change the key and it is a
  different entry &mdash; which means refetching is automatic, and the
  <a href="/react/react-data-fetching">race condition</a> cannot happen, because
  responses are stored against the key they were requested with rather than
  written into shared state.
</p>
<p class="sub">
  Keys are hierarchical, and that is what makes invalidation ergonomic:
  invalidating <code>["todos"]</code> invalidates every key that starts with it.
</p>

<h3>staleTime is the setting that matters</h3>
<pre><code>useQuery({ queryKey, queryFn, staleTime: 5 * 60 * 1000 });   <span class="c">// fresh for 5 minutes</span></code></pre>
<div class="table-scroll"><table>
<thead><tr><th>Setting</th><th>Means</th><th>Default</th></tr></thead>
<tbody>
<tr><td><code>staleTime</code></td><td>How long data is considered fresh &mdash; no refetch at all</td><td>0</td></tr>
<tr><td><code>gcTime</code></td><td>How long unused data stays in memory before eviction</td><td>5 min</td></tr>
<tr><td><code>refetchOnWindowFocus</code></td><td>Revalidate when the tab regains focus</td><td>true</td></tr>
</tbody>
</table></div>
<p>
  With the default <code>staleTime: 0</code>, every mount revalidates. People
  meet the library, see a request on every navigation, and conclude it is
  chatty. It is doing exactly what it was told; a country list can have a
  <code>staleTime</code> of an hour, a live price cannot.
</p>

<h3>Mutations and invalidation</h3>
<pre><code>const queryClient = useQueryClient();

const { mutate, isPending } = useMutation({
  mutationFn: (todo) =&gt; api.post("/todos", todo),
  onSuccess: () =&gt; {
    queryClient.invalidateQueries({ queryKey: ["todos"] });   <span class="c">// refetch the lists</span>
  },
});

mutate({ title: "Write the chapter" });</code></pre>
<p>
  Invalidation is the half people get wrong. After a create, which keys are now
  out of date? The list, certainly &mdash; but also any filtered list, any
  count, any dashboard summary. Hierarchical keys mean one
  <code>invalidateQueries(["todos"])</code> covers all of them, which is why key
  design is worth five minutes of thought at the start.
</p>

<h3>Optimistic updates, with the rollback</h3>
<pre><code>useMutation({
  mutationFn: toggleTodo,
  onMutate: async (id) =&gt; {
    await queryClient.cancelQueries({ queryKey: ["todos"] });   <span class="c">// stop a refetch overwriting us</span>
    const previous = queryClient.getQueryData(["todos"]);
    queryClient.setQueryData(["todos"], (old) =&gt;
      old.map((t) =&gt; (t.id === id ? { ...t, done: !t.done } : t))
    );
    return { previous };                                        <span class="c">// context for onError</span>
  },
  onError: (err, id, ctx) =&gt; {
    queryClient.setQueryData(["todos"], ctx.previous);           <span class="c">// roll back</span>
  },
  onSettled: () =&gt; {
    queryClient.invalidateQueries({ queryKey: ["todos"] });      <span class="c">// reconcile either way</span>
  },
});</code></pre>
<p>
  The checkbox ticks instantly, and if the request fails it un-ticks and the
  error is shown. Naming the rollback in an interview is what separates having
  read about optimistic updates from having shipped one.
</p>

<h3>Paginated and infinite lists</h3>
<pre><code>const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ["todos"],
  queryFn: ({ pageParam }) =&gt; fetchPage(pageParam),
  initialPageParam: 0,
  getNextPageParam: (last) =&gt; last.nextCursor ?? undefined,
});</code></pre>
<p class="sub">
  For classic pagination, <code>placeholderData: keepPreviousData</code> keeps
  the current page on screen while the next loads, so the table does not
  collapse to a spinner between pages.
</p>

<h3>Prefetching removes the spinner</h3>
<pre><code>&lt;Link
  onMouseEnter={() =&gt; queryClient.prefetchQuery({ queryKey: ["user", id], queryFn })}
  to={"/users/" + id}
/&gt;</code></pre>
<p>
  By the time the click registers, the data is usually there. It is one of the
  cheapest perceived-performance wins available.
</p>

<h3>SWR, and where this fits with frameworks</h3>
<p>
  SWR is the smaller alternative with the same core ideas &mdash; a key, a
  fetcher, stale-while-revalidate &mdash; and less surface area. Either is a good
  choice; TanStack Query has more built in for mutations and pagination.
</p>
<p>
  In a framework with Server Components or loaders, most initial data should
  come from the server instead, and the query cache handles what stays
  interactive &mdash; polling, infinite scroll, anything after a user action.
  The two compose: the server can hydrate the cache so the first render has data
  and later interactions still get caching and invalidation.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Server state is a cache of data you do not own, so it needs staleness,
    deduplication, revalidation and invalidation — none of which
    <code>useState</code> provides. The query key is the cache key, so a changed
    key refetches automatically and the response race disappears; the hard part
    left is deciding which keys a mutation invalidates."
  </p>
</div>`,
};
