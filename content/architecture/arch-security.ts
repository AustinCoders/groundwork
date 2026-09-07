import type { Chapter } from "../types";

export const archSecurity: Chapter = {
  id: "arch-security",
  num: "A2",
  title: "Security and abuse limits",
  short: "Security & limits",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "A tight CSP, five headers, and three layers of rate limiting that fail differently.",
  body: `<h3>The attack surface, honestly</h3>
<p>
  Most of what a security review would look for is not here. No login, so no session to steal and no
  password to reset. No database, so nothing to inject into. No user-generated content, so nothing
  stored to render back at somebody. What is left is four endpoints, one content-security policy,
  and code that runs in the reader's own browser.
</p>

<h3>The headers</h3>
<div class="table-scroll"><table>
<thead><tr><th>Header</th><th>Set to</th><th>Stops</th></tr></thead>
<tbody>
<tr><td><code>Content-Security-Policy</code></td><td>See below</td><td>Injected scripts, exfiltration to other origins</td></tr>
<tr><td><code>X-Content-Type-Options</code></td><td><code>nosniff</code></td><td>A response being treated as a script because it looks like one</td></tr>
<tr><td><code>X-Frame-Options</code></td><td><code>DENY</code></td><td>Clickjacking</td></tr>
<tr><td><code>Referrer-Policy</code></td><td><code>strict-origin-when-cross-origin</code></td><td>Leaking the full path to other sites</td></tr>
<tr><td><code>Permissions-Policy</code></td><td>camera, microphone off; geolocation self</td><td>Anything embedded asking for hardware</td></tr>
</tbody>
</table></div>

<h3>The policy, and what it allows</h3>
<p>
  <code>default-src 'self'</code>, with narrow exceptions: Google Fonts for stylesheets and font
  files, Vercel's script host for analytics, and <code>blob:</code> for media and frames because the
  narrator plays audio from a blob URL and the playground needs it. <code>connect-src</code> is
  <code>'self'</code> only — nothing on this site is allowed to talk to another origin at runtime.
  <code>object-src</code> and <code>frame-ancestors</code> are <code>none</code>.
</p>

<div class="bx is-ref">
<span class="ttl">The CSP once blocked the site's own analytics</span>
<p>
  Vercel Analytics and Speed Insights were silently failing for a while: the policy did not allow the
  host they load from, so the scripts never ran and nothing was recorded. A CSP is a good default
  precisely because it fails closed, which also means it fails quietly — this was found by watching
  what a real browser actually requested, not by reading the policy.
</p>
</div>

<h3>Rate limiting, in three layers</h3>
<div class="table-scroll"><table>
<thead><tr><th>Layer</th><th>Runs</th><th>Limit</th><th>Blind spot</th></tr></thead>
<tbody>
<tr><td>Vercel Firewall</td><td>At the edge, before a function is invoked</td><td>100/min per IP on <code>/api/</code></td><td>Counters are per region</td></tr>
<tr><td>In-process limiter</td><td>Inside the function</td><td>40/min TTS, 20/min the rest</td><td>Per instance, and serverless spreads traffic</td></tr>
<tr><td>Upstream caching</td><td>Between function and service</td><td>10 min weather, 5 min joke</td><td>Only helps repeated inputs</td></tr>
</tbody>
</table></div>
<p>
  They are kept separate on purpose. The edge layer is the only one that stops the invocation being
  billed at all; the in-process one is the only one that still works if the firewall rule is removed
  or misconfigured. Neither is a substitute for the other.
</p>

<h3>The playground is the interesting case</h3>
<p>
  It executes arbitrary code — but on the reader's machine, in a Web Worker, inside the browser's own
  sandbox. Nothing is sent anywhere. The worst outcome is a worker that has to be terminated, which
  the runner does on a timeout. Moving that execution to a server is what would create a security
  problem, and the design avoids it by never taking the code.
</p>`,
};
