import type { Chapter } from "../types";

export const archRoadmap: Chapter = {
  id: "arch-roadmap",
  num: "A7",
  title: "What is missing on purpose, and what is next",
  short: "What is next",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "Half of the old list has shipped. What is left is a schema, offline reading, accounts, and a short list this rewrite turned up.",
  body: `<h3>Where the plan lives</h3>
<p>
  The plan is <code>docs/ROADMAP.md</code>, with a visual copy in <code>docs/roadmap.html</code>. It
  was last measured on 15 September, and the code has moved since. This chapter checks its
  engineering list against the repository as it is today.
</p>
<p>
  It then adds what writing these chapters turned up, and ends with what is left out on purpose.
  The effort figures are the roadmap's own, for one person who knows the codebase. They are not
  measurements.
</p>

<h3>The roadmap's list, checked</h3>
<div class="table-scroll"><table>
<thead><tr><th>#</th><th>Item</th><th>Roadmap's effort</th><th>State today</th></tr></thead>
<tbody>
<tr><td>1</td><td>Take the WebAssembly out of every deploy</td><td>0.5&ndash;1 day</td><td><span class="chip tone-yes">Shipped</span> Pyodide and sql.js load from jsDelivr at pinned versions, and <code>public/wasm/</code> went from 18 MB to 1.4 MB. The same pattern now serves Ruby, PHP, Lua and Clang.</td></tr>
<tr><td>2</td><td>A schema for chapter bodies</td><td>0.5 day</td><td><span class="chip tone-no">Not started</span> Chapters are still HTML strings in TypeScript, guarded by the integrity tests. No schema library is installed.</td></tr>
<tr><td>3</td><td>Server-render the Git guide</td><td>0.5&ndash;1 day</td><td><span class="chip tone-yes">Shipped</span> <code>app/git/page.tsx</code> renders the whole body on the server. Only the contents list and copy buttons are client code.</td></tr>
<tr><td>4</td><td>A real error tracker</td><td>0.5&ndash;1 day</td><td><span class="chip tone-warn">Wired</span> Sentry is in, loaded only by dynamic import, and inactive until <code>NEXT_PUBLIC_SENTRY_DSN</code> is set.</td></tr>
<tr><td>5</td><td>New exercise formats</td><td>2&ndash;3 days</td><td><span class="chip tone-warn">Partly</span> The mock interview's design round has a whiteboard that stays with the answer. Machine coding and read-and-fix exercises do not exist yet.</td></tr>
<tr><td>6</td><td>Offline reading</td><td>2&ndash;3 days</td><td><span class="chip tone-no">Not started</span> <code>app/manifest.ts</code> exists; no service worker does.</td></tr>
<tr><td>7</td><td>Accounts and progress sync</td><td>5&ndash;8 days</td><td><span class="chip tone-no">Not started</span> Everything a reader earns is still in one browser.</td></tr>
</tbody>
</table></div>
<p>
  Meanwhile, a lot shipped that the list never named:
</p>
<ul>
<li>the whiteboard</li>
<li>the mock interview and its readiness dashboard</li>
<li>a step-through debugger</li>
<li>running C, C++, Ruby, PHP and Lua in the browser</li>
<li>a playground with files, tabs, share links and run history</li>
<li>a redesigned problems page</li>
</ul>
<p>
  That is not a complaint about the plan. The list was for engineering that removes risk, and most
  of what shipped is product.
</p>

<figure>
<svg viewBox="0 0 900 330" class="dg" role="img" aria-label="Three columns. Shipped: WebAssembly off the deploy, the Git guide server-rendered, and Sentry wired behind a DSN. Next and small: patch Next, a chapter schema, Lighthouse on the playground, the comment check in CI, SQL in a worker. Later and large: new exercise formats, offline reading, accounts and sync.">
<g class="rough">
<rect x="20" y="20" width="270" height="290" rx="12" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="315" y="20" width="270" height="290" rx="12" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
<rect x="610" y="20" width="270" height="290" rx="12" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<path class="ln" d="M290 165 H307" marker-end="url(#arrow)" />
<path class="ln" d="M585 165 H602" marker-end="url(#arrow)" />
</g>
<text class="sm" x="38" y="48">SHIPPED</text>
<text class="lbl" x="38" y="84">WebAssembly off the deploy</text>
<text class="sm" x="38" y="104">18 MB to 1.4 MB</text>
<text class="lbl" x="38" y="144">Git guide on the server</text>
<text class="sm" x="38" y="164">body in the HTML</text>
<text class="lbl" x="38" y="204">Sentry, behind a DSN</text>
<text class="sm" x="38" y="224">off until configured</text>
<text class="sm" x="333" y="48">NEXT, EACH UNDER A DAY</text>
<text class="lbl" x="333" y="84">Patch Next past 16.3.2</text>
<text class="lbl" x="333" y="124">Chapter schema</text>
<text class="lbl" x="333" y="164">Lighthouse on /practice</text>
<text class="lbl" x="333" y="204">Comment check in CI</text>
<text class="lbl" x="333" y="244">SQL in a worker</text>
<text class="sm" x="333" y="284">remove risk, add no upkeep</text>
<text class="sm" x="628" y="48">LATER, DAYS EACH</text>
<text class="lbl" x="628" y="84">New exercise formats</text>
<text class="sm" x="628" y="104">machine coding, read and fix</text>
<text class="lbl" x="628" y="144">Offline reading</text>
<text class="sm" x="628" y="164">service worker, RSC too</text>
<text class="lbl" x="628" y="204">Accounts and sync</text>
<text class="sm" x="628" y="224">the one that adds upkeep</text>
</svg>
<figcaption>
  The middle column is new. Each item in it came from measuring for these chapters, and none
  appears in the roadmap file yet.
</figcaption>
</figure>

<h3>What this rewrite added to the list</h3>
<ol>
<li><strong>Patch Next.</strong> The installed 16.3.0 falls inside the range of a critical advisory, and 16.3.6 exists. The last attempt failed on a single slow Lighthouse sample, not a real regression. With three runs, it deserves another go before anything else here.</li>
<li><strong>Budget the heavy pages.</strong> Add <code>/practice</code> and one problem page to the Lighthouse URL list. They ship 422 KB of gzipped script, and no budget watches them.</li>
<li><strong>Run the comment check in CI.</strong> One line in the workflow closes the only way around the rule.</li>
<li><strong>Move SQL into a worker.</strong> It is the one runtime without isolation or a timeout.</li>
<li><strong>Reconcile the cleanup defaults,</strong> and have <code>lib/wasmAssets.ts</code> read versions from one place, so a Pyodide bump stops needing a hand edit.</li>
</ol>
<p>
  None of these adds anything a reader would see. Each removes a way for the site to break
  quietly.
</p>

<h3>Why accounts are still last</h3>
<p>
  Not because they are hard. Because they are <strong>the only item that adds ongoing work rather
  than removing it</strong>: a database to keep alive, sign-in email that actually has to arrive,
  and an account-deletion path that has to work. Every other item is finished when it ships.
</p>
<p>
  The code is ready for it. Every progress-aware component reads through one storage module, which
  exposes <code>subscribe()</code>. A synced version could sit behind that module without touching
  a component. The roadmap's plan keeps reading open to signed-out readers and moves existing local
  progress up once at first sign-in, rather than starting accounts from zero.
</p>

<h3>Offline, and the part that is fiddly</h3>
<p>
  The content is static and already cached hard, so most of the work is a cache strategy. The
  awkward detail is that the App Router fetches RSC payloads as well as HTML. The rules have to
  cover both, or a full page load works offline while clicking a link does not. The playground's
  runtimes come from jsDelivr, and a service worker should not precache them by default. Either the
  playground stays online-only, or downloading it for offline use becomes an explicit button.
</p>

<h3>The larger plan is content</h3>
<p>
  The roadmap is clear that the pressure is on the writing, not the system. Seven of 21 topics are
  written, counting Git's standalone guide. The engineering above runs alongside the writing
  rather than ahead of it. Section 0.2 of the roadmap orders the rest by what the job market asks
  for:
</p>
<ul>
<li><strong>P0:</strong> TypeScript, Next.js, Node.js, and a new topic on AI engineering for JavaScript developers.</li>
<li><strong>P1:</strong> SQL and databases, Testing, Docker with CI/CD, and frontend and GenAI tracks for System Design.</li>
<li><strong>P3:</strong> Kubernetes and GraphQL, both shrinking: GraphQL folds into an API-design unit inside Node.</li>
</ul>
<p>
  A chapter template, written down once, is meant to come before the first of those.
</p>

<h3>Missing on purpose</h3>
<p>
  Some absences are not on any list, because adding them would make the site a different kind of
  system:
</p>
<ul>
<li><strong>A database, until accounts.</strong> The repository is the content store, and it has no downtime.</li>
<li><strong>A CMS.</strong> Publishing through a deploy is slower, but it means every chapter passes the type checker, the integrity tests and the claims test before a reader sees it.</li>
<li><strong>Server-side code execution.</strong> Running readers' code on a server would turn the playground into the biggest security problem on the site.</li>
<li><strong>Product analytics.</strong> Page views cannot say which chapter people leave from or which searches return nothing. The roadmap names the five events it would send, <code>search_no_results</code> most valuable among them. None is sent yet.</li>
<li><strong>Payments.</strong> The interview book is the obvious thing to charge for, but a gate needs accounts first.</li>
</ul>

<div class="bx is-ref">
<span class="ttl">What is not on the list</span>
<p>
  A rewrite. Nothing in this architecture is the wrong shape for what the site is. The debt is
  specific and small: a stale framework patch, a few oversized files, one runtime on the main
  thread, and documents that drift. Each has a line in the tables above.
</p>
</div>`,
};
