import type { Chapter } from "../types";

export const reactRouter: Chapter = {
  id: "react-router",
  num: "I6",
  title: "React Router",
  short: "Routing",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "The URL is state your users can bookmark, share and go back to.",
  body: `<h3>The shape</h3>
<pre><code>const router = createBrowserRouter([
  {
    path: "/",
    element: &lt;Layout /&gt;,
    errorElement: &lt;ErrorPage /&gt;,
    children: [
      { index: true, element: &lt;Home /&gt; },
      { path: "topics/:topicId", element: &lt;Topic /&gt; },
      { path: "*", element: &lt;NotFound /&gt; },
    ],
  },
]);

&lt;RouterProvider router={router} /&gt;</code></pre>
<p>
  Routes nest, and a parent renders its matched child through
  <code>&lt;Outlet /&gt;</code>. That is how a layout stays mounted while the page
  inside it changes &mdash; the sidebar does not remount when you navigate.
</p>
<pre><code>function Layout() {
  return (
    &lt;div&gt;
      &lt;Sidebar /&gt;
      &lt;main&gt;&lt;Outlet /&gt;&lt;/main&gt;      <span class="c">// the matched child goes here</span>
    &lt;/main&gt;
  );
}</code></pre>

<h3>Links, not anchors</h3>
<pre><code>&lt;Link to="/topics/react"&gt;React&lt;/Link&gt;
&lt;NavLink to="/topics/react" className={({ isActive }) =&gt; isActive ? "on" : ""}&gt;</code></pre>
<p>
  A plain <code>&lt;a&gt;</code> reloads the whole application &mdash; new
  document, new bundle, all state lost. <code>Link</code> renders a real anchor
  (so middle-click, right-click and Cmd-click still work) and intercepts the
  plain click to change history instead. <code>NavLink</code> is the same thing
  with an <code>isActive</code> flag for styling the current item.
</p>

<h3>Reading the URL</h3>
<pre><code>const { topicId } = useParams();                    <span class="c">// /topics/:topicId</span>
const [params, setParams] = useSearchParams();      <span class="c">// ?level=beginner</span>
const location = useLocation();                     <span class="c">// pathname, search, hash, state</span>
const navigate = useNavigate();

navigate("/topics/react");
navigate(-1);                                       <span class="c">// back</span>
navigate("/login", { replace: true });              <span class="c">// no history entry</span></code></pre>

<div class="bx is-prim">
  <span class="ttl">Put filters in the URL, not in useState</span>
  <p>
    A filter, a sort order, a search query, an open tab &mdash; all of these are
    state the user expects to survive a refresh, a shared link and the back
    button. <code>useSearchParams</code> gives you all three for free, and
    <code>useState</code> gives you none of them.
  </p>
  <pre><code>const [params, setParams] = useSearchParams();
const level = params.get("level") ?? "beginner";

&lt;select value={level} onChange={(e) =&gt; setParams({ level: e.target.value })}&gt;</code></pre>
</div>

<h3>Loaders: fetching before the render</h3>
<pre><code>{
  path: "topics/:topicId",
  element: &lt;Topic /&gt;,
  loader: async ({ params }) =&gt; {
    const res = await fetch("/api/topics/" + params.topicId);
    if (!res.ok) throw new Response("Not found", { status: 404 });
    return res.json();
  },
}

function Topic() {
  const topic = useLoaderData();     <span class="c">// already there on first render</span>
}</code></pre>
<p>
  This removes an entire category of bug. There is no loading state inside the
  component, no effect, no race between the old route's request and the new
  one's &mdash; the router waits, cancels a superseded navigation, and only then
  renders. Throwing a <code>Response</code> hands control to the nearest
  <code>errorElement</code>.
</p>
<p class="sub">
  The old pattern &mdash; render, then fetch in an effect &mdash; is a
  <b>render-fetch waterfall</b>: each nested component discovers what it needs
  only after its parent has rendered. Loaders run in parallel for the whole
  matched tree.
</p>

<h3>Actions and forms</h3>
<pre><code>{ path: "new", element: &lt;NewTopic /&gt;, action: async ({ request }) =&gt; {
    const data = Object.fromEntries(await request.formData());
    await createTopic(data);
    return redirect("/topics");
  }
}

function NewTopic() {
  const nav = useNavigation();
  return (
    &lt;Form method="post"&gt;
      &lt;input name="title" /&gt;
      &lt;button disabled={nav.state === "submitting"}&gt;Save&lt;/button&gt;
    &lt;/Form&gt;
  );
}</code></pre>
<p>
  The router's <code>Form</code> submits to the action, waits, then revalidates
  every loader on the page so the list is fresh. No manual refetch, no
  invalidation logic.
</p>

<h3>Protecting routes</h3>
<pre><code>function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return &lt;Navigate to="/login" state={{ from: location }} replace /&gt;;
  return children;
}</code></pre>
<p>
  <code>replace</code> matters: without it, pressing back from the login page
  returns to the protected route, which bounces to login again &mdash; and the
  user is trapped. Carrying <code>from</code> in location state lets you send
  them where they were going after they sign in.
</p>
<p class="sub">
  A client-side guard is a UX affordance, not security. The API still has to
  authorise every request; hiding a route hides a link, not the data.
</p>

<h3>Lazy routes</h3>
<pre><code>const Settings = lazy(() =&gt; import("./Settings"));

{ path: "settings", element: (
    &lt;Suspense fallback={&lt;Spinner /&gt;}&gt;&lt;Settings /&gt;&lt;/Suspense&gt;
  )
}</code></pre>
<p>
  Route boundaries are the natural place to split a bundle: a user who never
  opens Settings never downloads it. <a href="/react/react-suspense">Suspense
  and code splitting</a> goes further.
</p>

<h3>Scroll, and the thing everyone forgets</h3>
<p>
  Client-side navigation does not reset scroll. Navigate from the bottom of a
  long list into a detail page and you land halfway down it. The data router
  restores scroll automatically; with the older API you add it yourself:
</p>
<pre><code>useEffect(() =&gt; { window.scrollTo(0, 0); }, [location.pathname]);</code></pre>

<h3>Which routing you are actually using</h3>
<div class="table-scroll"><table>
<thead><tr><th>Setup</th><th>Routing</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Vite + React</td><td>React Router</td><td>Everything on this page</td></tr>
<tr><td>Next.js App Router</td><td>File-system routing</td><td>Folders are routes; <code>useRouter</code>, <code>usePathname</code>, <code>useSearchParams</code> from <code>next/navigation</code></td></tr>
<tr><td>Remix</td><td>React Router, renamed</td><td>Loaders and actions are the same idea, server-side</td></tr>
</tbody>
</table></div>
<p>
  The concepts transfer completely: nested layouts, URL params, loading before
  render, and the URL as shared state. Only the imports change.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "The router keeps the URL and the UI in sync, and the URL should hold any
    state a user would expect to bookmark or go back to — filters, tabs,
    queries. Loaders matter because they fetch before rendering, which removes
    the render-fetch waterfall and the race between two navigations."
  </p>
</div>`,
};
