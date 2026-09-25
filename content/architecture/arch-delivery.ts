import type { Chapter } from "../types";

export const archDelivery: Chapter = {
  id: "arch-delivery",
  num: "A4",
  title: "How code reaches readers",
  short: "Delivery",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "A branch, a preview, a merge, and a daily job that deletes what Vercel would otherwise keep forever.",
  body: `<h3>The path, end to end</h3>
<p>
  There is no release process separate from Git. Work happens on a branch named after the feature,
  such as <code>feature/playground</code>, <code>feature/whiteboard</code>,
  <code>feature/problems-page</code> or, for these chapters, <code>feature/architecture</code>.
  Commits pile up locally over the day and are pushed once, when the work is final. That habit is
  about more than tidiness, and the storage section below explains why.
</p>
<p>
  Vercel's Git integration watches the repository. Every pushed branch gets a preview deployment
  with its own URL, built exactly as production would be. A push to <code>main</code> becomes the
  production deployment at <code>groundwork.austincoders.com</code>. The project's first Vercel
  hostname, <code>groundwork-ivory-beta.vercel.app</code>, is listed in <code>lib/site.ts</code> as a
  legacy host, and <code>next.config.ts</code> answers any request for it with a permanent redirect
  to the same path on the real domain.
</p>
<p>
  CI runs independently of all this, on GitHub's runners. It runs on every pull request and on
  every push to <code>main</code>. A preview can be live before CI has finished. The
  preview is for looking; CI is for deciding.
</p>

<figure>
<svg viewBox="0 0 900 360" class="dg" role="img" aria-label="Delivery. A feature branch push creates a Vercel preview and, through its pull request, a CI run. Merging to main creates the production deployment and another CI run. A Dependabot branch gets CI but no deployment. A daily cleanup job deletes old deployments.">
<g class="rough">
<rect x="20" y="40" width="200" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="20" y="152" width="200" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="20" y="264" width="200" height="72" rx="10" style="fill: var(--dg-box-red); stroke: var(--red); stroke-width: 1.8" />
<rect x="340" y="96" width="220" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="340" y="236" width="220" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="660" y="40" width="220" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="660" y="152" width="220" height="72" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="660" y="264" width="220" height="72" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 1.8" />
<path class="ln" d="M220 64 H652" marker-end="url(#arrow)" />
<path class="ln" d="M220 92 L334 124" marker-end="url(#arrow)" />
<path class="ln" d="M220 188 H652" marker-end="url(#arrow)" />
<path class="ln" d="M220 204 L334 256" marker-end="url(#arrow)" />
<path class="ln" d="M220 300 L334 290" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="36" y="72">feature/* push</text>
<text class="sm" x="36" y="96">once, when final</text>
<text class="lbl" x="36" y="184">merge to main</text>
<text class="sm" x="36" y="208">push or pull request</text>
<text class="lbl" x="36" y="296">dependabot/*</text>
<text class="sm" x="36" y="320">weekly, grouped</text>
<text class="lbl" x="356" y="128">CI on the PR</text>
<text class="sm" x="356" y="150">GitHub runner</text>
<text class="lbl" x="356" y="268">CI on main</text>
<text class="sm" x="356" y="290">and on Dependabot PRs</text>
<text class="lbl" x="676" y="72">Vercel preview</text>
<text class="sm" x="676" y="96">about 190 MB each</text>
<text class="lbl" x="676" y="184">Production</text>
<text class="sm" x="676" y="208">never deleted while live</text>
<text class="lbl" x="676" y="296">Daily cleanup</text>
<text class="sm" x="676" y="320">03:17 UTC, deletes old ones</text>
<text class="sm" x="440" y="56">deploys</text>
<text class="sm" x="440" y="180">deploys</text>
</svg>
<figcaption>
  Two systems watch the same repository. Vercel deploys branches and GitHub checks them. The red
  box is the one kind of branch that is checked but never deployed. The yellow box deletes old
  previews and old production builds, never the live one.
</figcaption>
</figure>

<h3>What a deployment runs</h3>
<p>
  Vercel runs <code>npm run build</code>, which triggers the <code>prebuild</code> script first.
  That script does two things:
</p>
<ul>
<li><code>scripts/copy-wasm-assets.mjs</code> copies TypeScript's lib files into <code>public/wasm/</code>.</li>
<li><code>scripts/build-react-sandbox.mjs</code> bundles the React sandbox with esbuild.</li>
</ul>
<p>
  Together they come to 1.4 MB. The script can still copy Pyodide and sql.js into the build with
  <code>--all</code>, but the build does not pass that flag, so those runtimes come from jsDelivr.
  <code>package.json</code> pins Node to <code>24.x</code>, the same major as the Vercel project settings, and CI reads 24 from
  <code>.nvmrc</code>. When the two disagree, Vercel warns on every build that <code>engines</code> overrides the project setting.
</p>

<h3><code>vercel.json</code>, in full</h3>
<p>
  The whole file is one rule: <code>"git": { "deploymentEnabled": { "dependabot/**": false } }</code>.
  Dependabot opens grouped pull requests every week, one each for Next, React, CodeMirror and the dev
  tooling, plus monthly ones for GitHub Actions. Each would otherwise build a full preview
  deployment that nobody would ever open. CI still runs on those branches, because the question a
  dependency bump raises is whether it breaks anything, and CI answers that without a deployment.
</p>

<h3>Why the storage filled up</h3>
<p>
  Vercel keeps every deployment's build output until somebody deletes it. There is no automatic
  expiry on the Hobby plan, and the plan's deployment storage limit is 10 GB. Each deployment of
  this site is about 190 MB. A local production build shows where that comes from:
  <code>.next/server/app</code>, which holds the prerendered HTML and RSC payloads for every page,
  is 198 MB on its own. A site that prerenders everything pays for it in every deploy.
</p>
<div class="table-scroll"><table>
<thead><tr><th>When</th><th>What happened</th></tr></thead>
<tbody>
<tr><td>15 September</td><td>Storage reached 11.21 GB of 10 GB. A weekly cleanup workflow was added, keeping 5 production and 5 preview deployments plus anything under 24 hours old. Its first run took the count from 121 to 15.</td></tr>
<tr><td>25 September</td><td>Storage was back at 8.2 GB: 43 deployments of about 190 MB each. Most were under a day old, so the 24-hour rule protected them. The cleanup became daily with tighter limits, and Dependabot branches stopped deploying.</td></tr>
<tr><td>After that cleanup</td><td>The project has 7 deployments. Usage across the whole Vercel team still showed 10.32 GB of 10 GB, because other projects count too.</td></tr>
</tbody>
</table></div>
<p>
  <code>.github/workflows/vercel-cleanup.yml</code> runs at 03:17 UTC every day. The odd minute
  avoids the pile-up of scheduled jobs on the hour. It can also be started by hand, with a
  <code>dry_run</code> switch. It passes three secrets and three limits to
  <code>scripts/vercel-cleanup.mjs</code>, which:
</p>
<ul>
<li>pages through every deployment, 100 at a time</li>
<li>asks the project which deployment is live in production</li>
<li>keeps the live deployment, the 3 newest production deployments, the 2 newest previews, and anything under 6 hours old</li>
<li>deletes the rest, but only when it is given <code>--execute</code></li>
</ul>
<p>
  Without that flag it just lists what it would delete. The last manual run took 12 seconds.
</p>
<p>
  The six-hour window is the soft spot. Every deployment younger than that is kept, however many
  there are. Ten pushes in one afternoon are ten deployments, close to 2 GB, until the next morning.
  That is why pushes are batched: one push at the end of a day's work is one deployment.
</p>

<div class="bx is-ref">
<span class="ttl">Two sets of defaults</span>
<p>
  The script's own defaults are 5 production, 5 previews and 24 hours, the original weekly rule. The
  workflow overrides them with 3, 2 and 6. Running <code>npm run vercel:cleanup</code> locally
  without those variables applies the older, looser rule.
</p>
</div>

<h3>Knowing when something breaks</h3>
<p>
  <strong>Sentry, when it is switched on.</strong> Error tracking is wired in but inactive until
  <code>NEXT_PUBLIC_SENTRY_DSN</code> is set. Everything keys off one boolean in
  <code>lib/errorTracking.ts</code>, and every call site loads the SDK with
  <code>import("@sentry/nextjs")</code>, so without a DSN its 548 KB chunk is never fetched:
</p>
<ul>
<li><code>instrumentation.ts</code> initialises Sentry on the server and reports request errors through Next's <code>onRequestError</code> hook.</li>
<li><code>instrumentation-client.ts</code> initialises it in the browser and records route transitions.</li>
<li><code>reportError()</code> tries Sentry first and falls back to the site's own endpoint.</li>
</ul>
<p>
  The options are conservative: 10% of traces are sampled, session replay is off, personal data is
  off, and the environment comes from <code>VERCEL_ENV</code>. The DSN's host is added to the
  policy's <code>connect-src</code> at build time, since a blocked request would fail silently. Five
  unit tests check those options and that origin. Whether a DSN is set in production is a Vercel
  setting, and this repository cannot show it.
</p>
<p>
  <strong>The fallback.</strong> <code>components/ErrorReporter.tsx</code> sits in the root layout.
  When Sentry is off, it listens for <code>error</code> and <code>unhandledrejection</code> on the
  window and posts up to 5 reports per page load to <code>/api/client-error</code>, using
  <code>keepalive</code> so a report survives the page closing. The route writes one JSON line to the
  function log. That line has no grouping, no alert and a limited lifetime, which is exactly why
  Sentry was added. When Sentry is on, the component does nothing and Sentry's own handlers take
  over.
</p>
<p>
  <strong>Speed Insights and Analytics.</strong> The root layout also renders
  <code>&lt;Analytics /&gt;</code> and <code>&lt;SpeedInsights /&gt;</code>, both from Vercel's
  version 2 packages. Speed Insights records Core Web Vitals from real visits, the field numbers that
  Lighthouse's lab numbers only predict. Analytics counts page views and nothing else: the code
  sends no custom events. Their scripts are served from <code>/_vercel/</code> paths that exist only
  on Vercel, so they return 404 on a local server and the smoke tests ignore them.
</p>

<div class="bx is-prim">
<span class="ttl">What this setup does well, and what it does not</span>
<p>
  Every branch is testable at a real URL before it merges, and a broken build never reaches
  readers, because a failed build never replaces the live deployment. What it lacks is a gate
  between CI and production: nothing in this repository makes Vercel wait for CI before it
  promotes a build of <code>main</code>. On a one-person project that is a reasonable trade. With a
  second person it would be the first thing to change.
</p>
</div>`,
};
