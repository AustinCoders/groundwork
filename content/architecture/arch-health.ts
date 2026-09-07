import type { Chapter } from "../types";

export const archHealth: Chapter = {
  id: "arch-health",
  num: "A4",
  title: "Current health: what is actually failing",
  short: "Current health",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "A full error sweep, run against production rather than assumed.",
  body: `<h3>The sweep</h3>
<p>
  Every check below was run rather than reasoned about. Where something is clean it is because it
  was checked and found clean, not because nothing came to mind.
</p>

<div class="table-scroll"><table>
<thead><tr><th>Check</th><th>Result</th></tr></thead>
<tbody>
<tr><td>TypeScript</td><td><span class="chip tone-yes">0 errors</span></td></tr>
<tr><td>ESLint</td><td><span class="chip tone-yes">0 problems</span></td></tr>
<tr><td>Prettier</td><td><span class="chip tone-yes">clean</span></td></tr>
<tr><td>cspell, 354 files</td><td><span class="chip tone-yes">0 issues</span></td></tr>
<tr><td>Content integrity, 15 tests</td><td><span class="chip tone-yes">pass</span></td></tr>
<tr><td>Playwright, 30 tests</td><td><span class="chip tone-yes">pass</span></td></tr>
<tr><td><code>npm audit</code>, production deps</td><td><span class="chip tone-yes">0 vulnerabilities</span></td></tr>
<tr><td>Browser console on 8 production routes</td><td><span class="chip tone-yes">0 errors, 0 failed requests</span></td></tr>
</tbody>
</table></div>

<h3>The one thing that looks like an error and is not</h3>
<p>
  Run the site locally with <code>next start</code> and every page logs two 404s:
  <code>/_vercel/insights/script.js</code> and <code>/_vercel/speed-insights/script.js</code>. Those
  files do not exist in the build — Vercel's edge injects them in production, from randomised paths.
  Locally there is nothing to serve, so the browser reports a 404 and the analytics simply do not
  run. On production both load and the console is clean.
</p>
<p>
  It is worth knowing because it is the kind of thing that gets "fixed" by someone removing the
  analytics component.
</p>

<h3>What is genuinely unresolved</h3>
<div class="table-scroll"><table>
<thead><tr><th>Issue</th><th>Severity</th><th>State</th></tr></thead>
<tbody>
<tr>
  <td>Client errors have nowhere useful to go</td>
  <td><span class="chip tone-bad">Real</span></td>
  <td>They post to a function and land in a log with no grouping, no alerting, and an expiry. If a reader hits a bug, nobody finds out.</td>
</tr>
<tr>
  <td>The narrator depends on an unofficial service</td>
  <td>Accepted</td>
  <td>Known when it went in. It degrades to no narration rather than to a broken page.</td>
</tr>
<tr>
  <td>Diagrams on <code>/git</code> render without the hand-drawn filter</td>
  <td>Cosmetic</td>
  <td>The filter is defined inside the reader shell; that page uses the plain shell. Lines draw, they are just smooth where the rest of the site wobbles.</td>
</tr>
<tr>
  <td>Dependency updates are open</td>
  <td>Routine</td>
  <td>Several minor CodeMirror versions and a Next patch behind. One earlier update broke the build: a test runner needed newer Node types than the project pinned.</td>
</tr>
</tbody>
</table></div>

<h3>A bug worth writing down</h3>
<div class="bx is-ref">
<span class="ttl">Two diagrams lost their arrows</span>
<p>
  While writing these chapters, two diagrams rendered with every arrow missing. The cause: those
  arrows were grouped together in an element that had a filter applied, and a group whose only
  children are straight lines sharing one axis has a bounding box with no height or no width. The
  filter region is derived from that box, so the result was clipped away entirely.
</p>
<p>
  The diagrams whose arrows had both horizontal and vertical extent were fine, which is what made the
  pattern findable. Arrows now live in the same group as the boxes, which always has size. It is a
  good example of a bug that is invisible in the source and obvious in a screenshot.
</p>
</div>`,
};
