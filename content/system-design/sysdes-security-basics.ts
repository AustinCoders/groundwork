import type { Chapter } from "../types";

export const sysdesSecurityBasics: Chapter = {
  id: "sysdes-security-basics",
  num: "I11",
  title: "Security basics for design",
  short: "Security basics",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Who is calling, what may they do, and what happens on the day a secret leaks.",
  body: `<h3>Start with the threat, not the checklist</h3>
<p>
  Security in a design interview is not a list of acronyms. It is three questions asked in order:
  <b>what are we protecting</b> (accounts, payment data, other people's private messages), <b>who might attack
  it</b> (an anonymous visitor, a logged-in user going after someone else's data, an employee, a compromised
  dependency) and <b>what do they gain</b> if they succeed. Once you can say "the worst case here is one user
  reading another user's orders", every control you add has a reason, and every control you leave out is a
  decision you can defend.
</p>
<p>
  Two habits carry most of the weight. <b>Defense in depth</b>: assume any single control will fail, so a stolen
  token should still be short-lived, still be scoped, still be logged. <b>Least privilege</b>: every user,
  service and credential gets only what its job needs, so a leak of one does not open everything.
</p>

<h3>Authentication is who you are; authorization is what you may do</h3>
<p>
  <b>Authentication</b> establishes identity (a password, a passkey, a token). <b>Authorization</b> decides whether
  that identity may do this thing to this object. The two are separate checks, and the second is the one that fails
  in real systems: broken access control is the first category of the OWASP Top 10 in both the 2021 and the 2025 editions. The
  classic form is the insecure direct object reference. A request for <code>GET /orders/8731</code> is
  authenticated, so the server returns the order, never checking that order 8731 belongs to the caller. Changing the
  number in the URL then walks through every customer's orders.
</p>
<div class="warn">
  <span class="ttl">⚠ Check ownership on the server, on every request, deny by default</span>
  Hiding a button or an id in the client protects nothing. The rule that holds up is: every handler loads the
  object, checks that the caller may touch <em>this</em> object with <em>this</em> action, and refuses when no rule
  says yes. A check that exists only in the gateway is not enough, because a second route or an internal caller
  skips it.
</div>

<h3>Sessions, tokens and OAuth: what each one is for</h3>
<table>
  <tr><th>Mechanism</th><th>What it is</th><th>Strength</th><th>Weakness</th></tr>
  <tr><td>Session cookie</td><td>A random id pointing at server-side state</td><td>You can revoke it instantly by deleting the row</td><td>Needs a shared session store once you have several servers</td></tr>
  <tr><td>Opaque access token</td><td>A random string the API checks with the auth server</td><td>Revocable, and carries no claims (though a leaked one is still a usable bearer token)</td><td>An extra call per request, unless you cache the answer</td></tr>
  <tr><td>JWT access token</td><td>A signed, self-contained token: identity and claims inside</td><td>Any service verifies it locally with a public key, no lookup</td><td>Cannot be revoked before it expires, so keep it short-lived (minutes)</td></tr>
  <tr><td>Refresh token</td><td>A longer-lived credential that only mints new access tokens</td><td>Lets the access token stay short</td><td>A stolen one is powerful: rotate it on every use and store it carefully</td></tr>
</table>
<p>
  <b>OAuth 2.0</b> is a framework for <em>delegated authorization</em>: a user lets one application act on their
  behalf at another without giving it their password. It is not a login protocol by itself. <b>OpenID Connect</b>
  adds an ID token on top, which is the part that says who the user is. For a browser or mobile app the flow is the
  <b>authorization code flow with PKCE</b>: the app sends the user to the identity provider with a hashed
  one-time challenge, the provider returns a short-lived code, and the app exchanges the code plus the original
  secret for tokens. The current OAuth security best-practice document (RFC 9700) says public clients must use PKCE,
  that the password grant must not be used and the implicit grant should not be, and that redirect URIs must match exactly.
</p>
<figure>
  <svg viewBox="0 0 640 220" class="dg" role="img" aria-label="Authorization code flow with PKCE: the app creates a verifier and sends its hash to the identity provider, the user signs in, the provider returns a code to the exact redirect address, the app sends the code with the verifier, and the provider returns tokens.">
    <g class="rough">
      <rect class="box"  x="16"  y="30" width="130" height="50" rx="6" />
      <rect class="boxy" x="255" y="30" width="130" height="50" rx="6" />
      <rect class="boxg" x="494" y="30" width="130" height="50" rx="6" />
      <path class="ln" d="M146,48 L255,48" />
      <path class="ln dash" d="M255,66 L146,66" />
      <path class="ln" d="M146,120 L494,120" />
      <path class="lng" d="M494,146 L146,146" />
    </g>
    <text class="sm" x="81"  y="52" text-anchor="middle">your app</text>
    <text class="sm" x="81"  y="70" text-anchor="middle">makes a verifier</text>
    <text class="sm" x="320" y="52" text-anchor="middle">identity provider</text>
    <text class="sm" x="320" y="70" text-anchor="middle">signs the user in</text>
    <text class="sm" x="559" y="52" text-anchor="middle">your API</text>
    <text class="sm" x="559" y="70" text-anchor="middle">checks the token</text>
    <text class="sm" x="150" y="42">1 hash of verifier, exact redirect</text>
    <text class="sm" x="160" y="88">2 one-time code</text>
    <text class="sm" x="150" y="112">3 code + verifier → tokens (to the provider)</text>
    <text class="sm gr" x="150" y="168">4 short-lived access token, rotated refresh token</text>
    <text class="lbl" x="16" y="206" style="font-size:14px">a stolen code is useless without the verifier, which is never sent on the redirect</text>
  </svg>
  <figcaption>PKCE exists so that an attacker who intercepts the authorization code cannot trade it for tokens. Step 3 goes to the provider's token endpoint, not through the browser address bar.</figcaption>
</figure>
<p>
  <b>JWT pitfalls</b> are worth naming, because the format looks safer than it is. RFC 8725 lists them. Verify the
  signature with the algorithm <em>you</em> expect, never the one the token's own header claims, and reject
  <code>none</code>. Check the issuer, the audience and the expiry on every use. The payload is only base64url
  encoded, so anyone can read it: never put a secret in it. Plan key rotation with a key id so that you can
  publish a new key before retiring the old one. And on the client, a cookie marked <code>HttpOnly</code> keeps the token away from scripts (<code>Secure</code>
  and <code>SameSite</code> limit where it is sent), while a token in <code>localStorage</code> is readable by any
  cross-site scripting bug. A script can still make requests from the page while it is open, and cookies bring
  request forgery back, so neither choice replaces fixing the script bug.
</p>

<h3>Passwords, passkeys and second factors</h3>
<p>
  Never store a password, and never store anything that can be turned back into one. Store the output of a slow,
  memory-hard hash with a unique random salt per user. The OWASP password storage cheat sheet puts
  <b>Argon2id</b> first, with minimum settings of about 19 MiB of memory, 2 iterations and 1 degree of
  parallelism, then scrypt, and keeps bcrypt (work factor of at least 10, and a 72-byte input limit) for legacy systems; PBKDF2 at a very
  high iteration count is the option where FIPS validation is required. A <em>pepper</em>, a secret kept outside the database, adds defense in depth, but it is not a substitute
  for the salt and the slow hash. Compare hashes in constant time and rate limit the login endpoint (see the rate
  limiting chapter), keyed by address as well as by account.
</p>
<p>
  The stronger move is to need fewer passwords. A <b>passkey</b> (WebAuthn) is a public-key credential held by the
  user's device: the server stores only a public key, so there is nothing to phish and nothing to leak from your
  database that an attacker can replay on another site. A second factor (a one-time code, a hardware key) limits
  the damage when a password is stolen anyway.
</p>

<h3>Authorization models: roles, attributes and relationships</h3>
<table>
  <tr><th>Model</th><th>Rule looks like</th><th>Good for</th><th>Strain</th></tr>
  <tr><td>RBAC (roles)</td><td>"Admins can delete projects"</td><td>Internal tools, a small fixed set of job types</td><td>Role explosion once each team and project needs its own variation</td></tr>
  <tr><td>ABAC (attributes and policies)</td><td>"Editors can edit documents in their own department during business hours"</td><td>Rules that depend on context</td><td>Policies get hard to audit and test</td></tr>
  <tr><td>ReBAC (relationships)</td><td>"A user can view a document if they are a viewer of its folder, or a member of a group that is"</td><td>Sharing graphs: documents, folders, teams</td><td>Needs a store built for graph checks and a plan for consistency</td></tr>
</table>
<p>
  Google's Zanzibar paper describes the relationship model at scale: access is stored as tuples of the form
  <em>object, relation, user</em>, and a check walks them, which is how one system answers "may Alice open this file?"
  for Drive, Photos and YouTube. Where it gets hard is exactly the part earlier chapters warned about: a
  permission cache is a replica, so a revoked permission keeps working for as long as a stale answer lives.
  Decide how stale an authorization answer may be, and let the sensitive actions bypass the cache.
</p>

<h3>Encryption: in transit, at rest, and who holds the keys</h3>
<ul>
  <li><b>In transit:</b> TLS everywhere, including between your own services, because a flat internal network is not a security boundary. <b>Mutual TLS</b> makes both ends present certificates, which gives each service a verifiable identity (a service mesh automates the certificates).</li>
  <li><b>At rest:</b> disk or volume encryption protects against a stolen disk and a discarded server. It does nothing against an attacker who gets your application's credentials, because the application sees decrypted data. For sensitive fields (card numbers, national ids) encrypt or tokenize them in the application so the database never holds plaintext.</li>
  <li><b>Envelope encryption:</b> a key management service holds a root key (AWS calls it a KMS key) that never leaves it. For each object you generate a data key, encrypt the data with it, then encrypt the data key with the master key and store the two together. Changing the wrapping key means re-wrapping small data keys, not re-encrypting terabytes (AWS KMS's automatic rotation keeps the old key material, so even that is needed only when you move to a new key).</li>
  <li><b>Secrets:</b> keep them in a secrets manager, inject them at runtime, give them a short life or rotate them, and never commit them to a repository, bake them into an image or write them to a log. A leaked secret should mean "rotate and redeploy", not "emergency".</li>
</ul>

<h3>The attacks an interviewer expects you to name</h3>
<table>
  <tr><th>Attack</th><th>What happens</th><th>Design-level defence</th></tr>
  <tr><td>Injection (SQL, command)</td><td>Input is interpreted as code</td><td>Parameterized queries, never string-built SQL; validate on the server</td></tr>
  <tr><td>Cross-site scripting</td><td>An attacker's script runs in your page and reads tokens or acts as the user</td><td>Encode output by context, a restrictive Content Security Policy, HttpOnly cookies</td></tr>
  <tr><td>Cross-site request forgery</td><td>Another site makes the user's browser send an authenticated request</td><td>SameSite cookies, anti-forgery tokens on state-changing requests</td></tr>
  <tr><td>Server-side request forgery</td><td>You fetch a URL the attacker chose, and reach an internal service or the cloud metadata address</td><td>Allowlist outbound destinations, resolve and then pin the address (against DNS rebinding), disable redirects, restrict egress at the network layer, and on AWS require the token-based IMDSv2 metadata service</td></tr>
  <tr><td>Credential stuffing</td><td>Leaked passwords from other sites are tried against yours</td><td>Rate limits by address and device, breached-password checks, passkeys and a second factor</td></tr>
  <tr><td>Denial of service</td><td>Volume or expensive requests exhaust capacity</td><td>CDN and edge filtering, per-client limits and load shedding (see those chapters)</td></tr>
  <tr><td>Supply chain</td><td>A dependency or build step is compromised</td><td>Pin and verify dependencies, scan them, build from a clean, reviewed pipeline</td></tr>
</table>

<h3>Dry run: reviewing a small design for flaws</h3>
<p>
  A notes app stores each user's notes. Its API is <code>GET /notes/{id}</code>. Login returns a JWT valid for 24
  hours, which the single-page app keeps in <code>localStorage</code>. Passwords are stored as an unsalted SHA-256
  of the password. A design review finds four problems.
</p>
<table>
  <tr><th>Flaw</th><th>What an attacker does</th><th>Fix</th></tr>
  <tr><td>The handler returns any note by id</td><td>Loops over ids and reads everyone's notes</td><td>Check <code>note.owner == caller</code> in the handler; use random ids as a second layer, not the first</td></tr>
  <tr><td>24-hour token in <code>localStorage</code></td><td>One cross-site scripting bug steals a token that works for a day</td><td>Cookie with HttpOnly, Secure and SameSite; a 10 to 15 minute access token plus a rotating refresh token</td></tr>
  <tr><td>Unsalted fast hash</td><td>After a database leak, the same hash means the same password, and guessing is cheap</td><td>Argon2id with a per-user salt</td></tr>
  <tr><td>No limit on login attempts</td><td>Credential stuffing runs with nothing slowing it down</td><td>Per-address and per-account limits and a breached-password check</td></tr>
</table>
<p class="sub">
  How cheap is the guessing? An eight-letter lowercase password has 26<sup>8</sup> = 208,827,064,576 possibilities.
  At an illustrative 10 billion fast hashes a second on a single modern graphics card, that is about 21 seconds to try
  every one. A memory-hard hash with a salt does not make a bad password good, but it turns a 21-second job into one
  that costs real money per guess and cannot reuse work across users.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "First the worst case: one user reading another's data, so every
  handler checks ownership, not just the gateway. Login is the authorization code flow with PKCE through a managed
  identity provider, with a 15-minute access token in an HttpOnly cookie and a rotating refresh token. Passwords, if
  we hold any, are Argon2id with a per-user salt, and I'd offer passkeys. Services talk over mutual TLS, secrets come
  from a secrets manager and rotate, and sensitive fields are encrypted in the application with envelope keys. I'd
  rate limit login by address and account, and log every authorization failure."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> any mention of users, accounts, payments, health data, multi-tenant data, or a third-party login. Say the security section out loud even if the prompt does not ask: it is expected at senior level.</li>
  <li><b>The naive design</b> authenticates at the edge and trusts everything behind it. Name the missing per-object authorization check, the long-lived token and the plaintext secrets.</li>
  <li><b>Multi-tenant prompts</b> (one service, many customers) make the tenant id part of every key, query and cache entry. A missing tenant filter is the data-leak bug.</li>
  <li><b>Distinguish</b> authentication, authorization and encryption: they fail in different ways and need different fixes.</li>
  <li><b>Quantify the blast radius:</b> "a leaked access token is good for 15 minutes and one scope" is a design statement. "We use JWT" is not.</li>
  <li><b>The pitfall:</b> inventing your own cryptography or token format. Use a managed identity provider, a standard flow and a vetted library.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>State the difference between authentication and authorization, and give the object-reference bug as an example of the second failing.</li>
    <li>Describe the authorization code flow with PKCE and say what attack the verifier prevents.</li>
    <li>Say why a JWT cannot be revoked early, and what you do about it.</li>
    <li>Say how you store a password and why a fast hash is the wrong tool.</li>
    <li>Explain envelope encryption and what changing the wrapping key costs.</li>
    <li>Name four attacks and the design-level defence for each.</li>
  </ul>
</div>

<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://top10.owasp.org/" rel="noopener noreferrer">OWASP Top 10 (2025 edition)</a> — the current list of web application risks, with broken access control first</li>
    <li><a href="https://www.rfc-editor.org/rfc/rfc9700" rel="noopener noreferrer">RFC 9700: OAuth 2.0 security best current practice</a> — PKCE, exact redirect matching, no implicit or password grants</li>
    <li><a href="https://www.rfc-editor.org/rfc/rfc7636" rel="noopener noreferrer">RFC 7636: Proof Key for Code Exchange</a> — the verifier and challenge mechanism</li>
    <li><a href="https://www.rfc-editor.org/rfc/rfc6749" rel="noopener noreferrer">RFC 6749: the OAuth 2.0 framework</a> — roles, grants and tokens</li>
    <li><a href="https://www.rfc-editor.org/rfc/rfc8725" rel="noopener noreferrer">RFC 8725: JSON Web Token best current practices</a> — algorithm checks, audience and issuer validation</li>
    <li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" rel="noopener noreferrer">OWASP password storage cheat sheet</a> — Argon2id minimums, bcrypt limits, pepper</li>
    <li><a href="https://pages.nist.gov/800-63-4/sp800-63b.html" rel="noopener noreferrer">NIST SP 800-63B: authentication and lifecycle management</a> — password and authenticator guidance</li>
    <li><a href="https://www.w3.org/TR/webauthn-3/" rel="noopener noreferrer">W3C Web Authentication</a> — passkeys and public-key credentials</li>
    <li><a href="https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/" rel="noopener noreferrer">Zanzibar: Google's consistent global authorization system</a> — relationship tuples and checks at scale</li>
    <li><a href="https://docs.aws.amazon.com/kms/latest/developerguide/kms-cryptography.html" rel="noopener noreferrer">AWS KMS: cryptography basics</a> — data keys, master keys and envelope encryption</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. The hash rate in the dry run is an illustrative figure.</p>
</div>`,
};
