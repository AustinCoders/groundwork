import type { Chapter } from "../types";

export const archState: Chapter = {
  id: "arch-state",
  num: "I4",
  title: "Where a reader's state lives",
  short: "Where state lives",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Ten keys in localStorage, one seam, and no accounts.",
  body: `<h3>The loop</h3>

<figure>
<svg viewBox="0 0 900 280" class="dg" role="img" aria-label="Components subscribe through useSyncExternalStore to a storage module, which reads and writes localStorage and notifies every subscriber after a write.">
<g class="rough">
<rect x="30" y="40" width="200" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="342" y="40" width="216" height="64" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="666" y="40" width="204" height="64" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="30" y="200" width="840" height="60" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
<path class="ln" d="M230 62 H336" marker-end="url(#arrow)" />
<path class="ln" d="M558 62 H660" marker-end="url(#arrow)" />
<path class="ln" d="M450 104 C450 168 130 152 130 110" marker-end="url(#arrow-green)" style="stroke: var(--green)" />
</g>
<text class="lbl" x="130" y="68" text-anchor="middle">Component</text>
<text class="sm" x="130" y="90" text-anchor="middle">useProgressValue</text>
<text class="lbl gr" x="450" y="68" text-anchor="middle">lib/storage.ts</text>
<text class="sm" x="450" y="90" text-anchor="middle">get &middot; set &middot; subscribe</text>
<text class="lbl" x="768" y="68" text-anchor="middle">localStorage</text>
<text class="sm" x="768" y="90" text-anchor="middle">10 keys, one device</text>
<text class="sm" x="283" y="52" text-anchor="middle">read</text>
<text class="sm" x="609" y="52" text-anchor="middle">write</text>
<text class="sm gr" x="290" y="176" text-anchor="middle">notify every subscriber after a write</text>
<text class="sm" x="50" y="226">THE SEAM</text>
<text class="lbl" x="50" y="250">One module to replace when progress needs to sync to an account. No component changes.</text>
</svg>
<figcaption>
  Every progress-aware component reads through <code>useSyncExternalStore</code>, so a write anywhere
  re-renders everything that cares, and nothing polls.
</figcaption>
</figure>

<h3>The ten keys</h3>
<div class="table-scroll"><table>
<thead><tr><th>Key</th><th>Holds</th></tr></thead>
<tbody>
<tr><td><code>jsnotes:progress</code></td><td>Chapters marked done, with timestamps and review counts, and solved exercises</td></tr>
<tr><td><code>jsnotes:activity</code></td><td>A count per day, which is what the streak is computed from</td></tr>
<tr><td><code>jsnotes:code:</code></td><td>Unsaved editor content, one entry per exercise and language</td></tr>
<tr><td><code>jsnotes:level</code></td><td>The last level you read, so topic links land where you left off</td></tr>
<tr><td><code>jsnotes:theme</code>, <code>jsnotes:font</code></td><td>Appearance</td></tr>
<tr><td><code>jsnotes:narration</code></td><td>Voice, rate and pitch for the narrator</td></tr>
<tr><td><code>jsnotes:clock-format</code>, <code>jsnotes:weather</code>, <code>jsnotes:sound-enabled</code></td><td>Sidebar preferences and the cached weather reading</td></tr>
</tbody>
</table></div>

<h3>Why <code>useSyncExternalStore</code> and not context</h3>
<p>
  The data lives outside React — in <code>localStorage</code>, which any component can write to at
  any time. <code>useSyncExternalStore</code> is the hook built for exactly that shape: it takes a
  subscribe function and a snapshot getter, and React handles the tearing problem during concurrent
  rendering. Three stores expose <code>subscribe()</code> — progress, activity and saved code — and
  a write to any of them notifies every reader.
</p>
<p>
  It also solves the hydration problem cleanly. The server has no idea what is in your browser, so
  the first render must not read it; a small <code>useMounted</code> gate returns the fallback until
  after hydration, which is why nothing on this site flashes the wrong value on load.
</p>

<h3>The trade this makes</h3>
<p>
  Nothing is stored about anybody. There is no sign-in, no session, no personal data to leak and no
  database to run. And clearing your browser loses six months of progress; a second device starts
  from zero. It is the right answer for a personal notes site and the wrong one for anything with
  readers, which is why it is the largest item on the roadmap — and why the storage module was built
  as a single seam rather than spread through the components.
</p>`,
};
