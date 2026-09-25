import type { Chapter } from "../types";

export const archState: Chapter = {
  id: "arch-state",
  num: "I4",
  title: "Where a reader's state lives",
  short: "Where state lives",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle:
    "Thirty-one localStorage keys, two sessionStorage keys, a query string and a URL hash. There are no accounts, no cookies and no database.",
  body: `<h3>Everything is in the browser</h3>
<p>
  This site keeps nothing about its readers on a server. No file under <code>app/</code> uses
  <code>"use server"</code>. Nothing reads or writes a cookie. The four functions under
  <code>/api</code> keep no data between requests, apart from a rate-limit counter in memory. So
  everything the site remembers about you has to live in one of four places your browser already
  has.
</p>

<figure>
<svg viewBox="0 0 900 400" class="dg" role="img" aria-label="Components read state through hooks built on useSyncExternalStore. The hooks read five kinds of store: lib/storage.ts, the feature stores, lib/navTrail.ts and the problems filters. Share links are written by components directly. The first two write to localStorage, the nav trail to sessionStorage, and the filters and share links to the URL.">
<g class="rough">
<rect x="20" y="150" width="150" height="90" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="210" y="150" width="170" height="90" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="430" y="20" width="230" height="56" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="430" y="96" width="230" height="56" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="430" y="172" width="230" height="56" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="430" y="248" width="230" height="56" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="430" y="324" width="230" height="56" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="700" y="20" width="185" height="132" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
<rect x="700" y="172" width="185" height="56" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
<rect x="700" y="248" width="185" height="132" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
<path class="ln" d="M170 195 H204" marker-end="url(#arrow)" />
<path class="ln" d="M380 175 C406 175 406 48 424 48" marker-end="url(#arrow)" />
<path class="ln" d="M380 185 C406 185 406 124 424 124" marker-end="url(#arrow)" />
<path class="ln" d="M380 200 H424" marker-end="url(#arrow)" />
<path class="ln" d="M380 215 C406 215 406 276 424 276" marker-end="url(#arrow)" />
<path class="ln" d="M95 240 C95 352 300 352 424 352" marker-end="url(#arrow)" />
<path class="ln" d="M660 48 H694" marker-end="url(#arrow)" />
<path class="ln" d="M660 124 H694" marker-end="url(#arrow)" />
<path class="ln" d="M660 200 H694" marker-end="url(#arrow)" />
<path class="ln" d="M660 276 H694" marker-end="url(#arrow)" />
<path class="ln" d="M660 352 H694" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="95" y="190" text-anchor="middle">Components</text>
<text class="sm" x="95" y="212" text-anchor="middle">client islands</text>
<text class="lbl gr" x="295" y="190" text-anchor="middle">lib/hooks.ts</text>
<text class="sm" x="295" y="212" text-anchor="middle">useSyncExternalStore</text>
<text class="lbl" x="545" y="44" text-anchor="middle">lib/storage.ts</text>
<text class="sm" x="545" y="64" text-anchor="middle">progress, activity, code</text>
<text class="lbl" x="545" y="120" text-anchor="middle">Feature stores</text>
<text class="sm" x="545" y="140" text-anchor="middle">playground, runs, mock, boards</text>
<text class="lbl" x="545" y="196" text-anchor="middle">lib/navTrail.ts</text>
<text class="sm" x="545" y="216" text-anchor="middle">where you came from</text>
<text class="lbl" x="545" y="272" text-anchor="middle">Problem filters</text>
<text class="sm" x="545" y="292" text-anchor="middle">ProblemsView</text>
<text class="lbl" x="545" y="348" text-anchor="middle">Share links</text>
<text class="sm" x="545" y="368" text-anchor="middle">#share= and #board=</text>
<text class="lbl" x="792" y="68" text-anchor="middle">localStorage</text>
<text class="sm" x="792" y="90" text-anchor="middle">31 keys or prefixes</text>
<text class="sm" x="792" y="108" text-anchor="middle">one origin, one device</text>
<text class="lbl" x="792" y="196" text-anchor="middle">sessionStorage</text>
<text class="sm" x="792" y="216" text-anchor="middle">2 keys, one tab</text>
<text class="lbl" x="792" y="296" text-anchor="middle">The URL</text>
<text class="sm" x="792" y="318" text-anchor="middle">query: replaceState</text>
<text class="sm" x="792" y="336" text-anchor="middle">hash: never sent</text>
<text class="sm" x="792" y="354" text-anchor="middle">to any server</text>
</svg>
<figcaption>
  Every store is a small module with a <code>get</code>, a <code>set</code> and, where a component
  needs to follow changes, a <code>subscribe</code>. Components never touch
  <code>localStorage</code> directly while rendering.
</figcaption>
</figure>

<h3>The core keys: lib/storage.ts</h3>
<p>
  <code>KEYS</code> has ten entries, all prefixed <code>jsnotes:</code>, from the site's first name.
  Every read and write goes through <code>store</code>. It JSON-encodes values, wraps each call in
  <code>try</code>, returns the fallback on the server or when parsing fails, and makes
  <code>set()</code> return <code>false</code> when the browser refuses a write, for example because
  storage is full or disabled.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Key</th><th>Holds</th></tr></thead>
<tbody>
<tr><td><code>jsnotes:progress</code></td><td><code>{ chapters, exercises }</code>: a mark per chapter read and a flag per exercise solved</td></tr>
<tr><td><code>jsnotes:activity</code></td><td>A count per local calendar day, <code>"2026-09-25": 3</code></td></tr>
<tr><td><code>jsnotes:code:{id}</code>, <code>jsnotes:code:{id}:{lang}</code></td><td>Unsaved editor text per exercise; JavaScript has no suffix</td></tr>
<tr><td><code>jsnotes:level</code></td><td>The last level you read, so topic links go straight to it</td></tr>
<tr><td><code>jsnotes:theme</code>, <code>jsnotes:font</code></td><td>One of nine themes and seven fonts, read before paint by the theme-init script</td></tr>
<tr><td><code>jsnotes:narration</code></td><td>Voice, rate and pitch</td></tr>
<tr><td><code>jsnotes:clock-format</code>, <code>jsnotes:weather</code></td><td>12 or 24 hours, and the last weather reading with its time, reused for 30 minutes</td></tr>
<tr><td><code>jsnotes:sound-enabled</code></td><td>Whether solving an exercise plays a sound</td></tr>
</tbody>
</table></div>

<h3>The other twenty-one</h3>
<p>
  As features were added, each kept its own keys next to its own code. Newer ones use a
  <code>groundwork:</code> prefix. Most still go through <code>store</code>. The whiteboard has its
  own <code>read</code> and <code>write</code> in <code>lib/whiteboard/storage.ts</code>, because a
  board with pasted images can fill the quota, and a failed save has to be reported to the reader
  rather than silently ignored.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Area</th><th>Keys</th></tr></thead>
<tbody>
<tr><td>Reader and sidebar</td><td><code>jsnotes:zoom</code>, <code>jsnotes:reading-budget</code>, <code>jsnotes:sidebar-collapsed</code>, <code>jsnotes:sidebar-collapsed:workspace</code>, <code>jsnotes:recap-shown</code>, <code>jsnotes:last-seen-level</code></td></tr>
<tr><td>Editor</td><td><code>jsnotes:editor-settings</code>, <code>jsnotes:editor-height</code>, <code>jsnotes:playground-live</code>, <code>jsnotes:lang:{exerciseId}</code></td></tr>
<tr><td>Playground</td><td><code>groundwork:playground:project</code> (every open file), <code>groundwork:playground:runs</code> (the last 15 runs), <code>groundwork:playground:stdin</code></td></tr>
<tr><td>Whiteboard</td><td><code>groundwork:boards</code> (the index), <code>groundwork:board:{id}</code> (one per board), <code>groundwork:boards:last</code>, <code>groundwork:boards:prefs</code></td></tr>
<tr><td>Mock interview</td><td><code>groundwork:mock:config</code>, <code>groundwork:mock:current</code> (a loop in progress), <code>groundwork:mock:history</code> (last 50), <code>groundwork:mock:retry</code> (up to 60 questions to try again)</td></tr>
</tbody>
</table></div>
<p>
  <code>sessionStorage</code> holds two more, <code>groundwork:nav:here</code> and
  <code>groundwork:nav:from</code>. <code>NavTrail</code> in the root layout records every pathname
  and title, so the playground's back button can say where you came from. That only makes sense
  for the tab you are in. Three other strings that look like keys are not keys:
  <code>groundwork:problems-url</code> is an event name, <code>groundwork-board</code> tags
  clipboard and export JSON, and <code>groundwork-preview</code> is a <code>postMessage</code>
  type.
</p>

<h3>The progress model</h3>
<p>
  A chapter mark is <code>{ at, reviews }</code>. The literal <code>true</code> is still accepted
  from older saves and treated as <code>{ at: 0, reviews: 0 }</code>. Review is spaced repetition
  with fixed gaps: a chapter is due 3, 7, 21, 60 and then 180 days after the last time it was read
  or reviewed. After the fifth review, <code>dueAt()</code> returns <code>null</code> and the
  chapter is never due again. An exercise is simply <code>true</code> once solved.
</p>
<p>
  The first time a chapter is marked or an exercise solved, a call to
  <code>recordActivity()</code> adds one to today's count. <code>lib/gamification.ts</code> derives
  everything else and stores none of it. The streak is the run of consecutive days with activity.
  XP is 10 per exercise, 5 per chapter and 3 per review. The level is
  <code>floor(sqrt(xp / 25)) + 1</code>. Keeping only the raw facts means a change to the formula
  applies to everyone's history at once, with no migration.
</p>

<h3>How components follow it</h3>
<p>
  <code>progress</code> and <code>activity</code> share a single listener set. Every write calls
  <code>emitProgressChange()</code>, and every component that used <code>useProgressValue</code>
  re-reads its snapshot. The sidebar count, the review badge and the streak all update the moment
  you mark a chapter, and nothing polls. The mock store and run history keep their own listener
  sets and cached snapshots. The <a href="/architecture/arch-rendering">rendering chapter</a>
  explains why snapshots must be primitives or cached objects.
</p>
<p>
  What this does not do is follow other tabs. Nothing listens for the browser's
  <code>storage</code> event, so a chapter marked in one tab shows up in another only after it
  navigates or reloads. Adding that would be a single <code>addEventListener</code> in
  <code>progress.subscribe</code>.
</p>

<h3>State in the URL</h3>
<p>
  <b>The /problems filters</b> are the search box, topic, levels, status, sort and view. They live in
  the query string, so a filtered list can be bookmarked or shared. <code>ProblemsView</code> reads
  <code>window.location.search</code> with <code>useSyncExternalStore</code>. It subscribes to
  <code>popstate</code> and to a custom <code>groundwork:problems-url</code> event, and its server
  snapshot is the empty string. Changes are written with <code>history.replaceState</code>, leaving
  out any value that equals its default, and then the event is fired. Typing in the search box
  therefore does not add a history entry per keystroke.
</p>
<p>
  It avoids <code>useSearchParams()</code> on purpose. On a prerendered page that hook renders
  everything below the nearest <code>Suspense</code> boundary in the browser only. That is why
  <code>/practice</code> ships 27 KB of HTML. With the external-store approach,
  <code>/problems</code> prerenders the full unfiltered list, 276 KB of HTML, and applies your
  filters straight after hydration. <code>/practice?id=</code>, <code>/path</code>,
  <code>/soon</code> and the old <code>/level?topic=</code> links do use
  <code>useSearchParams</code> inside <code>Suspense</code>. Their HTML has nothing worth
  prerendering anyway.
</p>
<p>
  <b>Share links</b> live in the hash, which browsers never send to a server. <code>lib/shareLink.ts</code>
  packs the playground's files as <code>[name, lang, code]</code> rows. It compresses them with
  <code>CompressionStream("deflate-raw")</code>, encodes them as base64url and appends the result
  as <code>#share=</code>. On the way in it accepts at most 20 files, 60-character names and 200,000
  characters of code each. The whiteboard's <code>#board=</code> works the same way. It leaves out
  pasted images, and on reading it keeps at most 2,000 elements. Both open what they receive as
  new tabs or a new board next to your own work, never replacing it, and both clear the hash
  afterwards. <code>HashRedirect</code> handles a third kind of hash: an old
  <code>/notes#closures</code> link is forwarded to <code>/notes/closures</code>.
</p>

<h3>Why nothing is on a server</h3>
<p>
  Because nothing is stored about anyone, there is nothing to sign in to, nothing to leak and no
  database to run. That is also why every page can be a static file: no page differs by reader
  until the browser has it. The cost is just as concrete. Clearing site data erases months of
  progress. A second device starts from zero. And a full <code>localStorage</code> quota can only
  be reported, not solved.
</p>
<div class="bx is-ref">
<span class="ttl">Where sync would plug in</span>
<p>
  Progress is the state worth syncing, and all of it goes through <code>progress</code> and
  <code>activity</code> in <code>lib/storage.ts</code>. An account-backed version would replace
  those two objects' reads and writes and keep the same <code>subscribe()</code>. No component
  would change. The other twenty-nine keys are preferences and drafts that can stay per-device.
</p>
</div>`,
};
