import type { Chapter } from "../types";

export const archSecurity: Chapter = {
  id: "arch-security",
  num: "A2",
  title: "Security: strangers' code and strangers' links",
  short: "Security",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "Code runs in workers and sandboxed frames, share links are parsed as hostile, and a policy says who the page may talk to.",
  body: `<h3>What there is to attack</h3>
<p>
  Most of what a security review looks for is not here. There is no login, so there is no session to
  steal and no password to reset. There is no database, so there is nothing to inject into. Nothing
  a reader writes is stored on a server and shown to someone else.
</p>
<p>
  What is left is more interesting than that list suggests:
</p>
<ul>
<li>four API endpoints</li>
<li>one Content-Security-Policy</li>
<li>a playground that runs whatever a reader types, in 11 of its 17 languages</li>
<li>two kinds of share link that carry data from one stranger's browser to another's</li>
</ul>
<p>
  The last two are where the care went.
</p>

<h3>Where the reader's code runs</h3>
<p>
  The rule is simple: <strong>the site never receives the code</strong>. It runs on the reader's
  machine, inside the browser's own sandbox, and it runs away from the page wherever possible.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Code</th><th>Runs in</th><th>Stopped by</th></tr></thead>
<tbody>
<tr><td>JavaScript, TypeScript</td><td>Web Worker, <code>lib/jsWorker.ts</code></td><td>Terminated after 5 s by default</td></tr>
<tr><td>Python</td><td>Web Worker, <code>lib/pyodideWorker.ts</code></td><td>Terminated after 20 s</td></tr>
<tr><td>C, C++, Ruby, PHP, Lua</td><td>Web Worker, <code>lib/scriptWorker.ts</code></td><td>Terminated after 20 s</td></tr>
<tr><td>HTML, CSS and page scripts</td><td><code>iframe</code> with <code>sandbox="allow-scripts allow-modals allow-forms"</code></td><td>Replaced on the next run</td></tr>
<tr><td>React component exercises</td><td><code>iframe</code> with <code>sandbox="allow-scripts"</code></td><td>Removed after the run</td></tr>
<tr><td>SQL</td><td>sql.js on the main thread</td><td>Nothing</td></tr>
</tbody>
</table></div>
<p>
  <strong>Workers.</strong> A worker has no DOM, no <code>localStorage</code> and no cookies. On a
  timeout the runner does not ask the worker to stop. It calls <code>terminate()</code> and throws
  the worker away, and the next run makes a fresh one. An endless loop costs the reader a few
  seconds and nothing else. A worker can still call <code>fetch</code>, and what bounds that is the
  policy's <code>connect-src</code>, below.
</p>
<p>
  <strong>Frames.</strong> Neither frame gets <code>allow-same-origin</code>, so each document runs
  with an opaque origin. A page a reader builds in the playground cannot read the site's storage or
  touch the parent document. Messages come back through <code>postMessage</code>, and the parent
  accepts one only if <code>event.source</code> is that frame's own window and the message carries
  the expected marker. A <code>srcdoc</code> frame also inherits the parent's
  Content-Security-Policy, so the reader's page cannot load scripts from an origin the site itself
  could not.
</p>
<p>
  <strong>The two gaps.</strong> Before handing JavaScript to the worker, the runner builds it with
  <code>new Function</code> on the main thread to catch syntax errors early. It only constructs the
  function and never calls it, but that is why the policy allows <code>'unsafe-eval'</code>. SQL is
  the other one: <code>lib/sqlRunner.ts</code> runs sql.js on the main thread with no timeout. A
  runaway recursive query freezes the reader's own tab. It reaches nobody else, but it is the one
  runtime that is not isolated.
</p>

<figure>
<svg viewBox="0 0 900 320" class="dg" role="img" aria-label="Trust boundaries. A share link's hash passes through a parse and sanitise step before it reaches the page. The page, on the site's origin, hands code to Web Workers with no DOM or storage, to sandboxed frames with an opaque origin, and sends requests to rate-limited API functions.">
<g class="rough">
<rect x="20" y="36" width="200" height="80" rx="10" style="fill: var(--dg-box-red); stroke: var(--red); stroke-width: 2" />
<rect x="284" y="36" width="230" height="80" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
<rect x="578" y="30" width="302" height="92" rx="12" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="20" y="210" width="250" height="80" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="325" y="210" width="250" height="80" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="630" y="210" width="250" height="80" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<path class="ln" d="M220 76 H276" marker-end="url(#arrow)" />
<path class="ln" d="M514 76 H570" marker-end="url(#arrow)" />
<path class="ln" d="M620 122 L160 204" marker-end="url(#arrow)" />
<path class="ln" d="M700 122 L470 204" marker-end="url(#arrow)" />
<path class="ln" d="M780 122 V204" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="36" y="68">Share link</text>
<text class="sm" x="36" y="92">#share= or #board=</text>
<text class="lbl" x="300" y="68">Parse and sanitise</text>
<text class="sm" x="300" y="92">readShare, sanitizeEls</text>
<text class="lbl" x="594" y="62">The page</text>
<text class="sm" x="594" y="86">site origin, CSP applies</text>
<text class="sm" x="594" y="106">storage, DOM, cookies</text>
<text class="lbl" x="36" y="242">Web Workers</text>
<text class="sm" x="36" y="266">no DOM, no storage, terminated</text>
<text class="lbl" x="341" y="242">Sandboxed frames</text>
<text class="sm" x="341" y="266">opaque origin, source checked</text>
<text class="lbl" x="646" y="242">/api/ functions</text>
<text class="sm" x="646" y="266">rate-limited, inputs clipped</text>
<text class="sm" x="36" y="146">untrusted</text>
<text class="sm" x="594" y="146">trusted</text>
</svg>
<figcaption>
  Everything to the left of the green box, and everything below it, is treated as hostile. The
  green box is the only place with access to the reader's storage.
</figcaption>
</figure>

<h3>Share links are hostile input</h3>
<p>
  The playground shares as <code>/practice?id=free#share=...</code> and the whiteboard as
  <code>/whiteboard#board=...</code>. Both compress JSON with the browser's
  <code>CompressionStream("deflate-raw")</code> and encode it as base64url, in
  <code>lib/compress.ts</code>. The payload lives after the <code>#</code>, so browsers never send it
  to a server and nothing is stored anywhere. That also means the site cannot vet a link before a
  reader opens it. Whoever opens it runs the parser, so the parser assumes the worst.
</p>
<p>
  <strong><code>lib/shareLink.ts</code></strong> accepts only an array of three-string tuples. The
  language must be one the playground knows. It keeps at most 20 files, cuts names to 60 characters
  and code to 200,000. Any failure in decompression or parsing returns <code>null</code>, never a
  half-read project.
</p>
<p>
  <strong><code>sanitizeEls</code></strong> in <code>lib/whiteboard/model.ts</code> does the same
  for boards, one field at a time:
</p>
<ul>
<li>anything that is not an array becomes an empty board</li>
<li>the element kind must be on an allow-list</li>
<li>ids are strings of at most 64 characters, and duplicates are dropped</li>
<li>every number must be finite and is clamped to &plusmn;10,000,000</li>
<li>stroke width is clamped to 0.5&ndash;60, opacity to 0.05&ndash;1 and font size to 6&ndash;400</li>
<li>colours are cut to 40 characters, and dash and arrowhead styles come from allow-lists</li>
<li>a line keeps at most 20,000 finite points, and text at most 20,000 characters</li>
<li>an image's source must start with <code>data:image/</code>, so a board cannot make the browser fetch a remote URL, which would be a tracking pixel</li>
<li>an arrow bound to an id that does not exist has that binding set to <code>null</code></li>
</ul>
<p>
  The same function guards all three ways a board arrives: a share link (limit 2,000 elements), an
  imported JSON file (5,000) and the board saved in <code>localStorage</code> (50,000). Share links
  drop images entirely, and the menu says how many were dropped. The whiteboard's model has 17 unit
  tests.
</p>
<p>
  What a board holds is drawn by React as SVG attributes and text, never as HTML. There are 39 uses
  of <code>dangerouslySetInnerHTML</code> in the app, and every one is fed from content in the
  repository. None is fed from a share link, from storage or from anything a reader typed.
</p>

<h3>The headers and the policy</h3>
<p>
  <code>next.config.ts</code> sets five headers on every path:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Header</th><th>Set to</th><th>Stops</th></tr></thead>
<tbody>
<tr><td><code>Content-Security-Policy</code></td><td>See below</td><td>Injected scripts, and talking to other origins</td></tr>
<tr><td><code>X-Content-Type-Options</code></td><td><code>nosniff</code></td><td>A response being run as a script because it looks like one</td></tr>
<tr><td><code>X-Frame-Options</code></td><td><code>DENY</code></td><td>Clickjacking</td></tr>
<tr><td><code>Referrer-Policy</code></td><td><code>strict-origin-when-cross-origin</code></td><td>Leaking full paths to other sites</td></tr>
<tr><td><code>Permissions-Policy</code></td><td>camera and microphone off, geolocation self only, <code>interest-cohort</code> off</td><td>Embedded content asking for hardware</td></tr>
</tbody>
</table></div>
<p>
  The policy is built when the config loads, not written out by hand. The runtime origins come from
  <code>wasmOrigins()</code>, which today is jsDelivr alone. The error-reporting origin comes from
  <code>sentryOrigin()</code>, and only when a DSN is set.
</p>
<ul>
<li><code>default-src</code>, <code>base-uri</code> and <code>form-action</code> are <code>'self'</code>.</li>
<li><code>script-src</code> is <code>'self'</code>, Vercel's analytics host and jsDelivr.</li>
<li><code>connect-src</code> is <code>'self'</code>, jsDelivr and the Sentry host if there is one.</li>
<li><code>frame-src</code> allows <code>'self'</code> and <code>blob:</code>.</li>
<li><code>object-src</code> and <code>frame-ancestors</code> are <code>'none'</code>.</li>
</ul>
<p>
  Two unit tests keep those helpers from ever returning something that is not a URL. A malformed
  entry would quietly break the whole policy.
</p>
<p>
  <strong>Where the policy is weak:</strong> <code>script-src</code> includes
  <code>'unsafe-inline'</code> and <code>'unsafe-eval'</code>. The first covers the theme script,
  which has to run before first paint, and Next's inline scripts. The second covers the playground.
  Together they mean the policy limits where scripts come from, not whether an injected inline
  script could run. The defence against injection is that nothing a reader controls is rendered as
  HTML. The config also sets no <code>Strict-Transport-Security</code> header of its own.
</p>

<div class="bx is-ref">
<span class="ttl">The policy once blocked the site's own analytics</span>
<p>
  For a while, Vercel Analytics and Speed Insights failed without a word. The policy did not allow
  the host they load from, so nothing was recorded. A policy that fails closed also fails quietly.
  This was found by watching what a real browser requested, not by reading the policy.
</p>
</div>

<h3>What the API routes accept</h3>
<div class="table-scroll"><table>
<thead><tr><th>Route</th><th>Limit per IP</th><th>Input checks</th></tr></thead>
<tbody>
<tr><td><code>/api/tts</code></td><td>40 a minute</td><td>Text at most 2,000 characters (413 if longer); voice from a fixed list; rate clamped to 0.5&ndash;2; pitch matched by a pattern; text escaped before it goes into SSML; 20 s maximum duration</td></tr>
<tr><td><code>/api/weather</code></td><td>20 a minute</td><td>Latitude and longitude must be finite and in range, then are rounded to one decimal place. That helps the cache and blurs the reader's position</td></tr>
<tr><td><code>/api/joke</code></td><td>20 a minute</td><td>No input; a fixed joke if the upstream fails</td></tr>
<tr><td><code>/api/client-error</code></td><td>20 a minute</td><td>413 above 4,000 bytes; each field cut to 500 characters, the user agent to 200; bad JSON is dropped with a 204</td></tr>
</tbody>
</table></div>
<p>
  The in-process limiter in <code>lib/rateLimit.ts</code> is a <code>Map</code> keyed by route name
  and the first address in <code>x-forwarded-for</code>. It sweeps expired entries once it tracks
  more than 5,000. It lives inside one function instance, so it is a floor, not a wall. The wall is
  the Vercel Firewall rule on <code>/api/</code>, set in the dashboard and deliberately kept out of
  this public repository.
</p>

<h3>Dependencies</h3>
<p>
  <code>.github/dependabot.yml</code> checks npm every week, with at most five open pull requests.
  It groups Next, React, CodeMirror and the dev tooling so that packages that move together arrive
  together. It ignores major versions of <code>@types/node</code>, which follows the Node in
  <code>.nvmrc</code> rather than the newest release. GitHub Actions are checked monthly.
  <code>vercel.json</code> stops those branches from building preview deployments, and CI still
  runs on each one.
</p>
<p>
  The honest part: of 13 Dependabot pull requests so far, 13 were closed and none was merged.
  <code>npm audit</code> today reports a critical advisory against the installed Next 16.3.0 and a
  high one against <code>sharp</code>. Why they are stuck, and what it takes to move, is in the
  health chapter.
</p>`,
};
