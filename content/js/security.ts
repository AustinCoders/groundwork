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
  <tr><td><code>Lax</code> (most browsers' default today)</td><td class="tone-warn">only on top-level navigation (clicking a real link), not on a background <code>fetch</code>/form auto-submit</td></tr>
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
  <code>SameSite=Lax</code> or <code>Strict</code> closes both holes at
  once — invisible to a successful XSS payload, and not sent on the
  cross-site requests CSRF depends on. localStorage is popular because
  it's simple to reach from JS, not because it's the safer choice.
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
const decode = (part) =&gt; JSON.parse(atob(part));

console.log(decode(headerPart));    <span class="c">// what happens?</span>
console.log(decode(payloadPart));   <span class="c">// what happens — with zero knowledge of the signing secret?</span></code></pre>
</div>
<p class="sub">
  <code>{ alg: "HS256", typ: "JWT" }</code>, then
  <code>{ sub: "user123", name: "Ana" }</code> — fully readable, no
  secret required, just <code>atob</code>. Anyone holding a JWT can
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
</p>`,
};
