import type { Chapter } from "../types";

export const security: Chapter = {
  id: "security",
  num: "A7",
  title: "Security",
  short: "Security",
  levels: ["advanced"],
  practice: ["ex-escape-html", "ex-safe-merge", "ex-decode-jwt-payload", "ex-is-token-expired"],
  ready: true,
  subtitle: "The mistakes that turn into a real incident, not just a bug.",
  body: `<h3>XSS — three flavors, one root cause</h3>
<p>
  Cross-site scripting is always the same underlying failure: text that
  came from somewhere untrusted got treated as <b>markup</b> instead of
  <b>data</b>. The three flavors differ only in <em>where</em> the
  untrusted text entered.
</p>
<table>
  <tr>
    <th>Flavor</th>
    <th>Untrusted text comes from</th>
  </tr>
  <tr><td><b>Stored</b></td><td>the database — a comment, a username, a bio someone else submitted, rendered later for other visitors</td></tr>
  <tr><td><b>Reflected</b></td><td>the current request — a URL/search-query parameter echoed straight into the page's HTML</td></tr>
  <tr><td><b>DOM-based</b></td><td>client-side JS itself — reading <code>location.hash</code> or similar and writing it into the DOM, no server involved at all</td></tr>
</table>
<pre><code><span class="c">// the actual vulnerable line looks the same in all three flavors:</span>
el.innerHTML = someValueThatCameFromOutsideThisFile;

<span class="c">// the fix is the same in all three, too:</span>
el.textContent = someValueThatCameFromOutsideThisFile;   <span class="c">// never parsed as HTML — see the DOM chapter</span>
<span class="c">// — or, if actual formatted HTML is genuinely needed, sanitize FIRST:</span>
el.innerHTML = DOMPurify.sanitize(someValueThatCameFromOutsideThisFile);</code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> <code>textContent</code> by default.
  <code>innerHTML</code> only for markup you trust completely — your
  own hardcoded strings, or output that's been through a real
  sanitizer. "I'll just strip <code>&lt;script&gt;</code> tags myself"
  is not a sanitizer; there are too many other ways to smuggle
  executable content into HTML (an <code>onerror</code> attribute on an
  <code>&lt;img&gt;</code>, a <code>javascript:</code> URL) to
  reimplement correctly by hand.
</div>
<p>
  A <b>Content-Security-Policy</b> header is the defense-in-depth
  layer underneath sanitization — even if a payload does slip through,
  a strict CSP can refuse to execute it:
</p>
<pre><code>Content-Security-Policy: script-src 'self'; object-src 'none'</code></pre>
<p class="sub">
  That policy tells the browser to run scripts only from the site's own
  origin — an injected <code>&lt;script src="https://evil.example"&gt;</code>
  or an inline <code>&lt;script&gt;alert(1)&lt;/script&gt;</code> both
  get refused at the browser level, entirely independent of whether the
  injection itself was ever caught.
</p>
<p>
  A host allowlist like that is also its weakness: every domain you allow, and
  every endpoint on it, can now serve script. Modern guidance is a
  <b>nonce-based</b> policy with <code>'strict-dynamic'</code>:
</p>
<pre><code>Content-Security-Policy: script-src 'nonce-8fJ2kQ9x...' 'strict-dynamic'; object-src 'none'; base-uri 'none'

&lt;script nonce="8fJ2kQ9x..." src="/app.js"&gt;&lt;/script&gt;    <span class="c">// runs: carries the nonce</span>
&lt;script&gt;stolen()&lt;/script&gt;                            <span class="c">// blocked: no nonce</span></code></pre>
<p class="sub">
  The server generates a fresh, unguessable nonce <b>for every response</b> and
  stamps it on its own script tags; an attacker who injects markup cannot know
  it. <code>'strict-dynamic'</code> then trusts scripts that a script that carries a nonce
  loads, so you no longer maintain a list of CDNs, and browsers that support it
  ignore <code>'self'</code> and host allowlists. Because the nonce changes on
  every request, a fully cached static page cannot carry one; use hash-based
  sources for those.
</p>

<h3>CSRF, SameSite, and CORS — three names for "who's actually making this request"</h3>
<p>
  A browser attaches cookies to a request automatically, based purely
  on the target domain — it doesn't check <em>which site's page</em>
  triggered the request. <b>CSRF</b> abuses exactly that: a malicious
  page auto-submits a form to
  <code>your-bank.com/transfer</code>, and the browser happily attaches
  the visitor's real, valid <code>your-bank.com</code> session cookie
  to it, because from the cookie's point of view it's a normal request
  to the right domain.
</p>
<pre><code>Set-Cookie: session=abc123; SameSite=Strict; Secure; HttpOnly</code></pre>
<table>
  <tr>
    <th><code>SameSite</code> value</th>
    <th>Cookie sent on a cross-site request?</th>
  </tr>
  <tr><td><code>Strict</code></td><td class="tone-bad">never</td></tr>
  <tr><td><code>Lax</code> (what Chrome and Edge assume when the attribute is missing — Firefox and Safari don't, so set it explicitly)</td><td class="tone-warn">only on top-level <code>GET</code> navigation (clicking a link), not on a background <code>fetch</code> or a cross-site <code>POST</code> form</td></tr>
  <tr><td><code>None</code></td><td class="tone-yes">always — requires <code>Secure</code> too</td></tr>
</table>
<p>
  <a href="/notes/async-properly">CORS</a>, revisited: it's the
  opposite direction from CSRF — CORS decides whether <em>JavaScript
  can read the response</em> of a cross-origin request; it does nothing
  to stop the request from being <em>sent</em> in the first place (a
  plain HTML form auto-submit isn't subject to CORS at all).
  <code>SameSite</code> cookies are what actually close the CSRF hole;
  CORS closes a different one.
</p>

<h3>The CORS preflight — the request browsers send before yours</h3>
<pre><code><span class="c">// your JS calls:</span>
fetch("https://api.example.com/users", {
  method: "DELETE",
  headers: { "X-Custom-Header": "yes" },
});

<span class="c">// the browser actually sends THIS first, automatically, before your request:</span>
OPTIONS /users HTTP/1.1
Origin: https://your-app.com
Access-Control-Request-Method: DELETE
Access-Control-Request-Headers: X-Custom-Header</code></pre>
<p>
  A "simple" request (a plain <code>GET</code>, or a <code>POST</code>
  with only the handful of headers a plain HTML form could already
  send) skips this step. Anything else — a custom header, JSON with
  <code>Content-Type: application/json</code>, a
  <code>PUT</code>/<code>DELETE</code> — triggers a
  <b>preflight</b>: the browser asks first, via <code>OPTIONS</code>,
  whether the actual request is even allowed, and only sends the real
  one if the server's preflight response says yes.
</p>
<pre><code><span class="c">// the server's preflight RESPONSE has to explicitly allow all of it:</span>
Access-Control-Allow-Origin: https://your-app.com
Access-Control-Allow-Methods: DELETE
Access-Control-Allow-Headers: X-Custom-Header</code></pre>
<div class="warn">
  <span class="ttl">⚠ A missing preflight response looks like a network failure</span>
  If the server doesn't answer the <code>OPTIONS</code> request
  correctly — a common miss when someone hand-rolls CORS headers only
  on the "real" route — the browser never even attempts the actual
  request. The error shows up as a vague CORS failure on the original
  call, and the fix is almost always making sure the server responds to
  <code>OPTIONS</code> too, not just <code>DELETE</code>.
</div>

<h3>Clickjacking — hijacking a click the user thinks landed elsewhere</h3>
<pre><code>Content-Security-Policy: frame-ancestors 'self'
<span class="c">// or the older, single-purpose header:</span>
X-Frame-Options: DENY</code></pre>
<p>
  Clickjacking loads a real, legitimate page inside an invisible
  <code>&lt;iframe&gt;</code>, layered under a decoy the attacker
  controls — a "claim your prize" button sitting exactly on top of the
  real page's "transfer funds" button. The victim thinks they clicked
  the decoy; the click actually landed on the hidden, real page
  underneath, fully authenticated with their own session.
  <code>frame-ancestors</code> is the fix: it tells the browser which
  origins are allowed to embed this page in a frame at all, and
  <code>'self'</code> (or omitting other origins entirely) makes the
  invisible-iframe version of the attack impossible outright.
</p>

<h3>Prototype pollution</h3>
<p>
  A "deep merge" utility that copies keys with a plain
  <code>for...in</code> and bracket assignment has a landmine baked in:
  <code>"__proto__"</code> is a legal object key, and writing through
  it doesn't set a normal property — it reaches all the way up to
  <code>Object.prototype</code> itself.
</p>
<pre><code>function unsafeMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === "object" &amp;&amp; source[key] !== null) {
      if (!target[key]) target[key] = {};
      unsafeMerge(target[key], source[key]);   <span class="c">// recurses into "__proto__" just like any other key</span>
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const attackerPayload = JSON.parse('{"__proto__": {"isAdmin": true}}');
unsafeMerge({}, attackerPayload);

({}).isAdmin;   <span class="c">// true — on a BRAND NEW, completely unrelated object, anywhere in the whole program</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ This isn't a toy example</span>
  A merge/clone utility that accepts <em>any</em> JSON from outside the
  program (a request body, a config file) and doesn't guard against
  this is a real, repeatedly-exploited vulnerability class — several
  popular npm packages have shipped exactly this bug. The fix: skip
  <code>"__proto__"</code>, <code>"constructor"</code>, and
  <code>"prototype"</code> explicitly during a merge, or build the
  result with <code>Object.create(null)</code> so it has no prototype
  at all to pollute.
</div>

<h3>Supply-chain risk</h3>
<p>
  Every dependency's <code>postinstall</code> script and every
  transitive dependency (a dependency of a dependency, several layers
  deep, that nobody on the team ever chose or reviewed) runs with the
  same trust and access as your own code the moment
  <code>npm install</code> finishes. A compromised popular package —
  through a hijacked maintainer account or a typosquatted name one
  character off from a real one — is a genuine, repeatedly-realized
  attack vector, not a hypothetical one.
</p>
<p class="sub">
  A committed lockfile
  (<a href="/notes/modules-tooling">already covered</a>) is part of the
  defense here too: it pins the exact resolved tree, so a compromised
  new version of a transitive dependency published after the lockfile
  was generated doesn't get silently pulled in on the next install.
</p>
<ul>
  <li><b><code>npm ci</code> in CI, not <code>npm install</code>.</b> It installs exactly what the lockfile says and fails if <code>package.json</code> disagrees, so the build cannot drift.</li>
  <li><b><code>npm audit</code> finds known-vulnerable versions,</b> not newly published malicious ones. It answers "is this old problem in my tree", not "is this release safe".</li>
  <li><b>Provenance.</b> A package published from CI with <code>npm publish --provenance</code> carries a signed statement linking it to a source repository and build. <code>npm audit signatures</code> verifies those statements and the registry signatures for what you installed.</li>
  <li><b>Install scripts run as you.</b> A dependency's <code>postinstall</code> executes on your machine and in your CI. <code>--ignore-scripts</code> disables them, and some package managers, such as pnpm 10, no longer run them for dependencies by default.</li>
</ul>

<h3>crypto.subtle — hashing and randomness, done correctly</h3>
<pre><code>const bytes = crypto.getRandomValues(new Uint8Array(16));   <span class="c">// cryptographically secure — unlike Math.random()</span>

const data = new TextEncoder().encode("hello");
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
const hashHex = [...new Uint8Array(hashBuffer)]
  .map((b) =&gt; b.toString(16).padStart(2, "0"))
  .join("");
console.log(hashHex);   <span class="c">// a real SHA-256 hash, no library needed</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Math.random() is not safe for anything security-related</span>
  <code>Math.random()</code> is fast and fine for a game or a shuffle,
  but it isn't cryptographically secure — its output can, in principle,
  be predicted from enough samples. A session token, a password-reset
  code, or anything else where guessing matters belongs behind
  <code>crypto.getRandomValues()</code> (or
  <code>crypto.randomUUID()</code> for a quick unique id), never
  <code>Math.random()</code>.
</div>

<h3>innerHTML and postMessage, safely</h3>
<pre><code><span class="c">// postMessage — always check the origin, on both ends</span>
window.addEventListener("message", (event) =&gt; {
  if (event.origin !== "https://trusted-partner.example") return;   <span class="c">// reject everything else</span>
  handleMessage(event.data);
});

otherWindow.postMessage(payload, "https://trusted-partner.example");   <span class="c">// NEVER "*" for anything sensitive</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ A missing origin check accepts messages from ANY page</span>
  Without the <code>event.origin</code> check, any page anywhere that
  can get a reference to your window (an iframe embedding it, a popup
  it opened) can send it a message your handler will act on as if it
  were trusted. Sending with <code>"*"</code> as the target origin has
  the same problem in the other direction — the payload gets delivered
  to whatever page is currently there, trusted or not.
</div>

<h4>Dry run: the origin check against four incoming messages</h4>
<table>
  <tr><th>event.origin</th><th>event.origin !== "https://trusted-partner.example"?</th><th>Result</th></tr>
  <tr><td>https://trusted-partner.example</td><td>false</td><td>passes — <code>handleMessage(event.data)</code> runs</td></tr>
  <tr><td>https://evil.example</td><td>true</td><td><code>return</code> — message ignored</td></tr>
  <tr><td>http://trusted-partner.example (http, not https)</td><td>true</td><td><code>return</code> — ignored, scheme is part of the origin</td></tr>
  <tr><td>https://trusted-partner.example.evil.com</td><td>true</td><td><code>return</code> — ignored, not an exact string match</td></tr>
</table>
<p class="sub">
  The check is a plain string comparison, not a "starts with" or
  "contains" check — which is exactly why it has to be. A looser check
  like <code>.includes("trusted-partner.example")</code> would let the
  fourth row through, since that hostname genuinely does contain the
  trusted string as a substring.
</p>

<h3>Subresource Integrity — trusting a third-party script</h3>
<pre><code>&lt;script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAf...=="
  crossorigin="anonymous"&gt;
&lt;/script&gt;</code></pre>
<p class="sub">
  <code>integrity</code> is a hash of the exact file the page expects —
  the browser downloads the script, hashes it, and refuses to execute
  it at all if the hash doesn't match. Without it, a compromised CDN (or
  one tricked into serving a different file at the same URL) can
  silently swap in malicious code that runs with full access to the
  page, and nothing about the <code>&lt;script&gt;</code> tag itself
  would look any different.
</p>

<h3>Trusted Types — closing the innerHTML hole at the platform level</h3>
<pre><code>Content-Security-Policy: require-trusted-types-for 'script'

const policy = trustedTypes.createPolicy("app-html", {
  createHTML: (input) =&gt; DOMPurify.sanitize(input),
});

el.innerHTML = policy.createHTML(userInput);   <span class="c">// allowed — went through the policy</span>
el.innerHTML = userInput;                       <span class="c">// throws — a raw string, no policy involved</span></code></pre>
<p class="sub">
  With <code>require-trusted-types-for 'script'</code> set, the browser
  itself refuses to assign a plain string to <code>innerHTML</code>
  (and a handful of other injection sinks) anywhere on the page — it
  has to be a special <code>TrustedHTML</code> object that only a
  registered policy can produce. This doesn't replace sanitizing; it
  turns <em>forgetting</em> to sanitize into a hard build/runtime error
  instead of a silent vulnerability, closing off the entire bug class at
  the platform level rather than trusting every call site to remember.
</p>

<h3>Auth in practice: where does the token actually live?</h3>
<p>
  Two real options, and each one is exactly vulnerable to the attack
  the other one already closed:
</p>
<table>
  <tr>
    <th></th>
    <th><code>localStorage</code></th>
    <th><code>httpOnly</code> cookie</th>
  </tr>
  <tr><td>Readable by JavaScript</td><td class="tone-bad">yes — including any injected XSS payload</td><td class="tone-yes">no — invisible to JS entirely, by design</td></tr>
  <tr><td>Sent automatically on every matching request</td><td class="tone-yes">no — you attach it yourself</td><td class="tone-bad">yes — which is what makes CSRF possible against it</td></tr>
  <tr><td>Vulnerable to</td><td>XSS (any injected script can just read and exfiltrate it)</td><td>CSRF (unless paired with the <code>SameSite</code> cookie flag covered earlier in this chapter)</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">Rule</span> An <code>httpOnly</code> cookie with
  <code>SameSite=Lax</code> or <code>Strict</code> shuts the two easy
  attacks at once — an XSS payload can't read the token and ship it
  somewhere else, and cross-site requests don't carry it. It does
  <em>not</em> make XSS harmless: injected script runs on your own
  origin, so while the page is open it can still send requests that
  carry the cookie. Prevent XSS first; where the token lives only limits
  the damage. localStorage is popular because it's simple to reach from
  JS, not because it's the safer choice.
</div>

<h3>JWT — signed, not encrypted</h3>
<p>
  A JSON Web Token is three base64url segments joined by dots:
  <code>header.payload.signature</code>. The signature proves the
  <em>payload wasn't tampered with</em> — it proves nothing about who
  can <em>read</em> it, because the header and payload are just encoded,
  never encrypted.
</p>
<div class="try">
  <pre><code>const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkFuYSJ9" +
  ".signature-goes-here";

const [headerPart, payloadPart] = token.split(".");
const decode = (part) =&gt; {
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");   <span class="c">// base64url → base64</span>
  return JSON.parse(atob(base64));
};

console.log(decode(headerPart));    <span class="c">// what happens?</span>
console.log(decode(payloadPart));   <span class="c">// what happens — with zero knowledge of the signing secret?</span></code></pre>
</div>
<p class="sub">
  <code>{ alg: "HS256", typ: "JWT" }</code>, then
  <code>{ sub: "user123", name: "Ana" }</code> — fully readable, no
  secret required, just <code>atob</code> — once base64url's
  <code>-</code> and <code>_</code> are swapped back to <code>+</code> and
  <code>/</code>, which plain <code>atob</code> rejects. Anyone holding a JWT can
  read every claim inside it. Never put a password, a secret, or
  anything genuinely sensitive in the payload — the signature stops
  someone from <em>forging or editing</em> a valid-looking token, not
  from <em>reading</em> one they already have.
</p>

<h3>Session vs token auth</h3>
<table>
  <tr>
    <th></th>
    <th>Session (stateful)</th>
    <th>Token / JWT (stateless)</th>
  </tr>
  <tr><td>Server keeps</td><td>a session store (Redis, DB) mapping an id to who's logged in</td><td>nothing — the token itself carries the claims</td></tr>
  <tr><td>Checking a request</td><td>look the session id up in the store</td><td>verify the signature — no lookup, no shared store needed</td></tr>
  <tr><td>Revoking access instantly</td><td class="tone-yes">delete the session server-side, done</td><td class="tone-bad">not until it naturally expires — see logout, below</td></tr>
  <tr><td>Scales across servers</td><td>needs a shared session store</td><td class="tone-yes">trivially — any server with the public key/secret can verify it alone</td></tr>
</table>

<h3>Refresh tokens</h3>
<p>
  The practical compromise: a short-lived <b>access token</b> (minutes)
  sent with every request, and a long-lived <b>refresh token</b>
  (days/weeks), stored more carefully and used only to silently obtain
  a new access token when the old one expires. A stolen access token
  is only dangerous for minutes; a stolen refresh token is the actually
  serious leak, which is exactly why it's the one worth putting behind
  <code>httpOnly</code> and tighter handling.
</p>

<h3>OAuth and PKCE — delegating login without ever seeing a password</h3>
<p>
  "Sign in with Google" is <b>OAuth</b>: your app never sees the
  user's Google password at all. It redirects to Google, the user
  authenticates there, and Google redirects back with proof — an
  authorization code — that your app exchanges for tokens.
</p>
<pre><code><span class="c">// 1. the app generates a random secret and its hash, BEFORE redirecting</span>
const verifier = generateRandomString();
const challenge = await sha256Base64Url(verifier);

<span class="c">// 2. redirect to the provider, sending only the hash</span>
location.href = "https://provider.example/authorize?" + new URLSearchParams({
  response_type: "code",
  client_id: "...",
  code_challenge: challenge,
  code_challenge_method: "S256",
});

<span class="c">// 3. provider redirects back with a code; exchange it, proving you hold the original secret</span>
await fetch("/token", {
  method: "POST",
  body: new URLSearchParams({ grant_type: "authorization_code", code, code_verifier: verifier }),
});</code></pre>
<p class="sub">
  <b>PKCE</b> (Proof Key for Code Exchange) exists because a public
  client — a single-page app or a mobile app, with no server-side
  secret it can actually keep secret — can't safely hold a fixed
  client secret the way a traditional server-side app could. Sending
  only the <em>hash</em> up front and the real <code>verifier</code>
  only at the final, direct exchange step means an attacker who
  intercepts the authorization code in transit still can't redeem it
  without also having the original, never-transmitted verifier.
</p>

<h3>What logout actually does</h3>
<div class="warn">
  <span class="ttl">⚠ Deleting a JWT client-side doesn't invalidate it</span>
  A stateless JWT is valid until it <em>expires</em>, full stop — the
  server never tracked it, so there's nothing to revoke. "Logout"
  deleting the token from the browser only stops <em>that browser</em>
  from sending it; a copy captured earlier (a leaked log, an XSS
  payload that already ran) is still fully valid until its
  <code>exp</code> claim passes. Real logout-everywhere needs either
  short expiries, or a server-side blocklist of revoked token ids —
  the exact statefulness JWTs were chosen to avoid, reintroduced for
  the one operation that genuinely needs it.
</div>
<p class="sub">
  A session-based setup doesn't have this problem at all — logout is
  just deleting the session server-side, immediately effective
  everywhere that session's id was in use. It's the one place session
  auth is strictly simpler than tokens, and why some real systems use
  a short-lived JWT for the access token but fall back to a genuine
  server-side session (or a stored, revocable refresh token) for
  anything that needs a hard, immediate logout.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Most incidents come from a few root causes — untrusted input rendered as code (XSS), a request made on the user's behalf (CSRF), and trust in third-party code — and the defence is layered: escape or sanitise at output, SameSite cookies and CSRF tokens, a nonce-based CSP, and locked, audited dependencies."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Name the one root cause behind all three XSS flavors, and why <code>textContent</code> fixes it.</li>
    <li>Say what <code>SameSite=Lax</code> vs <code>Strict</code> changes about a cookie on a cross-site request.</li>
    <li>Explain why the <code>"__proto__"</code> merge bug pollutes every object, not just the one merged.</li>
    <li>Say why an <code>event.origin</code> check rejects a spoofed message with a legitimate-looking payload.</li>
    <li>Explain why deleting a JWT client-side doesn't revoke it, and what would.</li>
  </ul>
</div>`,
};
