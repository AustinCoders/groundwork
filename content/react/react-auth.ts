import type { Chapter } from "../types";

export const reactAuth: Chapter = {
  id: "react-auth",
  num: "I16",
  title: "Auth in React",
  short: "Auth",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Protected routes, token refresh, and the redirect that sends people back where they were.",
  body: `<h3>Where the token should live</h3>
<div class="table-scroll"><table>
<thead><tr><th>Store</th><th>Readable by injected script</th><th>Sent automatically</th><th>Verdict</th></tr></thead>
<tbody>
<tr><td><code>localStorage</code></td><td><span class="chip tone-bad">yes</span></td><td>no</td><td>Common, and the weakest</td></tr>
<tr><td>Memory only</td><td>no</td><td>no</td><td>Safe; lost on refresh</td></tr>
<tr><td><b>httpOnly cookie</b></td><td><span class="chip tone-yes">no</span></td><td>yes</td><td>The default worth defending</td></tr>
</tbody>
</table></div>
<p>
  A token in <code>localStorage</code> is readable by any script that gets onto
  your page &mdash; one compromised dependency and it is gone. An
  <code>httpOnly</code> cookie cannot be read by JavaScript at all, which removes
  that whole class. Its trade is CSRF, handled with
  <code>SameSite=Lax</code> or <code>Strict</code> plus a token on state-changing
  requests.
</p>
<p class="sub">
  The pattern that gets both: a short-lived access token in memory, a long-lived
  refresh token in an <code>httpOnly</code> cookie. Nothing persistent is
  readable, and a refresh survives a page reload.
</p>

<h3>The provider</h3>
<pre><code>const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");   <span class="c">// loading | in | out</span>

  useEffect(() =&gt; {
    fetch("/api/me", { credentials: "include" })      <span class="c">// cookie goes with it</span>
      .then((r) =&gt; (r.ok ? r.json() : null))
      .then((u) =&gt; { setUser(u); setStatus(u ? "in" : "out"); })
      .catch(() =&gt; setStatus("out"));
  }, []);

  const value = useMemo(() =&gt; ({ user, status, setUser }), [user, status]);
  return &lt;AuthContext value={value}&gt;{children}&lt;/AuthContext&gt;;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside &lt;AuthProvider&gt;");
  return ctx;
}</code></pre>
<div class="bx is-prim">
  <span class="ttl">The three-state rule</span>
  <p>
    <code>user === null</code> is ambiguous &mdash; it means both "not signed in"
    and "we have not checked yet". Without a separate <code>status</code>, the
    app flashes the login screen on every refresh before the check comes back.
    Three states, not a boolean.
  </p>
</div>

<h3>Protecting a route</h3>
<pre><code>function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return &lt;FullPageSpinner /&gt;;
  if (status === "out") {
    return &lt;Navigate to="/login" state={{ from: location }} replace /&gt;;
  }
  return children;
}</code></pre>
<p>
  Two details carry this. <code>replace</code> means the protected URL does not
  enter history &mdash; without it, pressing back from the login page returns to
  the guarded route, which bounces to login again, and the user is trapped.
  And <code>state.from</code> is what lets you send them onward afterwards:
</p>
<pre><code>async function onSubmit(credentials) {
  const user = await login(credentials);
  setUser(user);
  navigate(location.state?.from?.pathname ?? "/", { replace: true });
}</code></pre>
<p class="sub">
  Landing on the dashboard when they clicked a link to an invoice is the small
  thing users notice. Sending them back to what they asked for is three lines.
</p>
<p>
  <b>A client guard is a UX affordance, not security.</b> It hides a link, not
  the data. Every API request still has to be authorised on the server &mdash;
  anyone can edit the JavaScript.
</p>

<h3>Refreshing a token, without a stampede</h3>
<pre><code>let refreshing = null;                       <span class="c">// one in flight, shared</span>

async function authedFetch(url, options = {}) {
  let res = await fetch(url, { ...options, credentials: "include" });

  if (res.status === 401) {
    refreshing ??= fetch("/api/refresh", { method: "POST", credentials: "include" })
      .finally(() =&gt; { refreshing = null; });

    const ok = (await refreshing).ok;
    if (!ok) { redirectToLogin(); throw new Error("Session expired"); }

    res = await fetch(url, { ...options, credentials: "include" });   <span class="c">// retry once</span>
  }
  return res;
}</code></pre>
<p>
  The shared <code>refreshing</code> promise is the whole point. A dashboard
  firing six requests at once gets six 401s; without it you send six refresh
  calls, five of which race and may invalidate each other's tokens. One
  in-flight refresh, everybody awaits it, everybody retries.
</p>
<p class="sub">
  <b>Retry once, never in a loop.</b> If the retried request also returns 401,
  the session is genuinely gone &mdash; looping produces a refresh storm against
  your own auth service.
</p>

<h3>Roles and permissions</h3>
<pre><code>function Can({ permission, children, fallback = null }) {
  const { user } = useAuth();
  return user?.permissions?.includes(permission) ? children : fallback;
}

&lt;Can permission="invoice:delete"&gt;&lt;DeleteButton /&gt;&lt;/Can&gt;</code></pre>
<p>
  Check permissions, not roles. <code>user.role === "admin"</code> scattered
  through the UI has to be found and edited every time the model changes;
  <code>invoice:delete</code> is a fact the server can also enforce, in the same
  words.
</p>

<h3>Logging out properly</h3>
<pre><code>async function logout() {
  await fetch("/api/logout", { method: "POST", credentials: "include" });
  setUser(null);
  queryClient.clear();          <span class="c">// or the next user sees cached data</span>
  navigate("/login", { replace: true });
}</code></pre>
<p>
  Clearing the query cache is the step that gets skipped, and on a shared machine
  it means the next person sees the previous person's data until something
  refetches. Server-side session invalidation matters too &mdash; a logout that
  only forgets the token locally has not logged anyone out.
</p>

<h3>The rest of it, briefly</h3>
<ul>
  <li><b>OAuth and social login.</b> Use the authorisation code flow with PKCE; the implicit flow is deprecated. Never put a client secret in a browser bundle.</li>
  <li><b>Multiple tabs.</b> A <code>storage</code> event or a <code>BroadcastChannel</code> lets one tab's logout log the others out.</li>
  <li><b>In a framework.</b> Check the session in a layout or middleware, before rendering &mdash; then the protected page never reaches the browser at all, and the client guard becomes a convenience rather than the mechanism.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "A short-lived access token in memory with a refresh token in an httpOnly
    cookie, three auth states rather than a boolean so refresh does not flash the
    login screen, and a guard that redirects with <code>replace</code> and
    carries <code>from</code> so people land where they were going. The detail
    that gets missed is a single shared refresh promise — otherwise six
    simultaneous 401s trigger six refreshes that race each other."
  </p>
</div>`,
};
