import type { Chapter } from "../types";

export const archContentModel: Chapter = {
  id: "arch-content-model",
  num: "B4",
  title: "The content model",
  short: "The content model",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "Four types, and the relationships between them are also the URLs.",
  body: `<h3>The shape</h3>

<figure>
<svg viewBox="0 0 900 260" class="dg" role="img" aria-label="A topic has up to three levels; a level has a syllabus of sections; a section points at a chapter; a chapter lists exercise ids. Each step is also a URL.">
<g class="rough">
<rect x="24" y="98" width="140" height="64" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="230" y="98" width="140" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="436" y="98" width="150" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="652" y="98" width="160" height="64" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<path class="ln" d="M164 130 H224" marker-end="url(#arrow)" />
<path class="ln" d="M370 130 H430" marker-end="url(#arrow)" />
<path class="ln" d="M586 130 H646" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="94" y="126" text-anchor="middle">Topic</text>
<text class="sm" x="94" y="148" text-anchor="middle">20 of them</text>
<text class="lbl" x="300" y="126" text-anchor="middle">Level</text>
<text class="sm" x="300" y="148" text-anchor="middle">3 per topic</text>
<text class="lbl" x="511" y="126" text-anchor="middle">Chapter</text>
<text class="sm" x="511" y="148" text-anchor="middle">112 written</text>
<text class="lbl" x="732" y="126" text-anchor="middle">Exercise</text>
<text class="sm" x="732" y="148" text-anchor="middle">299 with tests</text>
<text class="sm" x="194" y="114" text-anchor="middle">1..3</text>
<text class="sm" x="400" y="114" text-anchor="middle">syllabus</text>
<text class="sm" x="616" y="114" text-anchor="middle">practice[]</text>
<text class="sm" x="94" y="196" text-anchor="middle">/css</text>
<text class="sm" x="300" y="196" text-anchor="middle">/level/css</text>
<text class="sm" x="511" y="196" text-anchor="middle">/css/css-box-model</text>
<text class="sm" x="732" y="196" text-anchor="middle">/practice?id=</text>
<text class="sm" x="24" y="234">Every arrow above is also a URL. The model is the routing.</text>
</svg>
<figcaption>
  A chapter does not own its exercises; it lists their ids. That indirection is what lets one
  exercise appear under two chapters, and what makes the practice page a flat list rather than a tree.
</figcaption>
</figure>

<h3>The four types</h3>
<div class="table-scroll"><table>
<thead><tr><th>Type</th><th>Carries</th><th>Decides</th></tr></thead>
<tbody>
<tr><td><b>Topic</b></td><td>id, name, mark, accent, tagline, status, blurb, levels</td><td>The shelf, the sidebar, the topic colour</td></tr>
<tr><td><b>Level</b></td><td>id, name, tagline, blurb, bullets, checkpoint, syllabus</td><td>The reading path and the chapter grouping</td></tr>
<tr><td><b>Chapter</b></td><td>id, num, title, short, subtitle, levels, practice, ready, body</td><td>A URL, a search entry, a sitemap row, a reading time</td></tr>
<tr><td><b>Exercise</b></td><td>id, chapter, level, title, brief, starter, hints, solution, tests</td><td>A playground session and a pass/fail</td></tr>
</tbody>
</table></div>

<h3>The flag that does the most work</h3>
<p>
  A chapter carries <code>ready: boolean</code>. That single field is the difference between a
  written chapter and an outline, and it decides four things at once: whether the chapter gets a
  route, whether it appears in the search index, whether it goes in the sitemap, and how it renders
  in the syllabus. It is why the site can show 511 chapters while honestly claiming 112.
</p>

<h3>One interface in the middle</h3>
<p>
  Nothing outside <code>lib/content.ts</code> imports a content file. Everything —
  <code>chapters()</code>, <code>chapterMetas()</code>, <code>exercisesForLevel()</code>, reading
  time, the search index, the sitemap — goes through it. That is what makes adding a chapter a
  one-file job: drop the file in, add it to the topic's barrel, and the route, the search entry, the
  sitemap row and the progress tracking all appear without being told to.
</p>

<div class="bx is-prim">
<span class="ttl">Why TypeScript files instead of a database</span>
<p>
  Three things a database would take away. The chapter shape is checked by the compiler, so a
  malformed chapter fails the build instead of rendering oddly in production. Content, rendering and
  styling change in one commit and revert in one command. And the whole corpus is covered by the
  same tooling as the code — spell-checking, link-checking, and fifteen tests that walk every
  chapter looking for unbalanced tags, missing subtitles and broken syllabus references.
</p>
</div>`,
};
