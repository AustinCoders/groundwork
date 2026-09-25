import type { Chapter } from "../types";

export const archContentModel: Chapter = {
  id: "arch-content-model",
  num: "B4",
  title: "The content model",
  short: "The content model",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "Four types, two special cases, and one record that turns into several routes.",
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
<text class="sm" x="94" y="148" text-anchor="middle">21 of them</text>
<text class="lbl" x="300" y="126" text-anchor="middle">Level</text>
<text class="sm" x="300" y="148" text-anchor="middle">3 per topic</text>
<text class="lbl" x="511" y="126" text-anchor="middle">Chapter</text>
<text class="sm" x="511" y="148" text-anchor="middle">227 written</text>
<text class="lbl" x="732" y="126" text-anchor="middle">Exercise</text>
<text class="sm" x="732" y="148" text-anchor="middle">538 with tests</text>
<text class="sm" x="194" y="114" text-anchor="middle">1..3</text>
<text class="sm" x="400" y="114" text-anchor="middle">syllabus</text>
<text class="sm" x="616" y="114" text-anchor="middle">practice[]</text>
<text class="sm" x="94" y="196" text-anchor="middle">/react</text>
<text class="sm" x="300" y="196" text-anchor="middle">/level/react</text>
<text class="sm" x="511" y="196" text-anchor="middle">/react/&lt;chapter&gt;</text>
<text class="sm" x="732" y="196" text-anchor="middle">/problems/&lt;id&gt;</text>
<text class="sm" x="24" y="234">Every arrow above is also a URL. The model is the routing.</text>
</svg>
<figcaption>
  A chapter does not own its exercises; it lists their ids in <code>practice</code>. That indirection
  is what lets the problems page be one flat list grouped by chapter, and what lets the mock interview
  draw coding questions from the same set without knowing about chapters at all.
</figcaption>
</figure>

<h3>The four types</h3>
<p>
  All of them are declared in <code>content/types.ts</code>, which is short enough to read in a minute
  and is the most important file in the directory.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Type</th><th>Carries</th><th>Decides</th></tr></thead>
<tbody>
<tr><td><b>Topic</b></td><td>id, name, mark, accent, tagline, status, notes, blurb, levels, curriculumNotes, planned</td><td>The shelf, the sidebar, the topic colour, and the topic's URL</td></tr>
<tr><td><b>Level</b></td><td>id, name, mark, tagline, blurb, bullets, checkpoint, syllabus</td><td>The reading path and the chapter grouping</td></tr>
<tr><td><b>Chapter</b></td><td>id, num, title, short, subtitle, levels, practice, ready, body</td><td>A page, a search entry, a sitemap row, a reading time</td></tr>
<tr><td><b>Exercise</b></td><td>id, chapter, level, title, brief, starter, hints, solution, tests, kind</td><td>A problem page, a playground session, a pass or fail, and possibly a mock question</td></tr>
</tbody>
</table></div>

<p>
  A few fields do more than their names suggest. <code>Topic.notes</code> holds a file name such as
  <code>"react.html"</code>, and <code>notesHref()</code> in <code>lib/topics.ts</code> strips the
  extension to make the URL. JavaScript's is <code>"notes.html"</code>, which is why JavaScript lives at
  <code>/notes</code> rather than <code>/js</code>. <code>Chapter.levels</code> places a chapter on a
  level's reading path. <code>Exercise.kind</code> is either <code>"function"</code>, the default, or
  <code>"component"</code>: 439 exercises are functions graded by assertions, and 99 are React
  components rendered in a sandboxed iframe. The mock interview uses the same field to split its coding
  round from its machine-coding round.
</p>
<p>
  Reading time is not stored anywhere. <code>lib/content.ts</code> strips the tags from a body, counts
  the words, divides by 180 and rounds, with a floor of two minutes. Every reading time on the site is
  that one function.
</p>

<h3>Two things that do not fit, and how they are made to</h3>
<p>
  <strong>The interview book</strong> is written in its own shape. <code>content/interview-data.ts</code>
  holds 27 rounds, each with a code, a title, metadata rows, company tiers, and a list of questions
  carrying an answer, what the interviewer is really testing, what to say, the trap, and the follow-ups.
  <code>lib/interviewContent.ts</code> converts each round into an ordinary <code>Chapter</code> by
  rendering those fields to HTML, so the reader, search and the sitemap never learn that it is different.
  The mock interview reads the raw rounds instead, because it needs the trap and the follow-ups as
  separate fields to build a rubric.
</p>
<p>
  <strong>The Git guide</strong> is one HTML string in <code>content/git-body.ts</code> with 16 sections.
  It has no levels and no chapters, gets a single page at <code>/git</code>, and is counted as 16 written
  chapters by <code>lib/topicStats.ts</code> so the totals on the home page include it.
</p>

<h3>One record, several routes</h3>
<p>
  The model's best trick is that most of what the site serves is <em>derived</em>. Nobody writes a test
  case file or a mock question bank. They are computed from records that already exist, at build time.
</p>

<figure>
<svg viewBox="0 0 900 340" class="dg" role="img" aria-label="An exercise record becomes a problem page, a test-case file, and an item in a mock coding bank. An interview round becomes an interview chapter and items in the mock talk banks.">
<g class="rough">
<rect x="30" y="64" width="180" height="70" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="30" y="226" width="180" height="70" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="380" y="20" width="280" height="46" rx="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
<rect x="380" y="76" width="280" height="46" rx="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
<rect x="380" y="132" width="280" height="46" rx="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
<rect x="380" y="220" width="280" height="46" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="380" y="276" width="280" height="46" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<path class="ln" d="M210 90 C300 90 300 43 374 43" marker-end="url(#arrow)" />
<path class="ln" d="M210 99 H374" marker-end="url(#arrow)" />
<path class="ln" d="M210 108 C300 108 300 155 374 155" marker-end="url(#arrow)" />
<path class="ln" d="M210 252 C300 252 300 243 374 243" marker-end="url(#arrow)" />
<path class="ln" d="M210 270 C300 270 300 299 374 299" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="120" y="96" text-anchor="middle">Exercise</text>
<text class="sm" x="120" y="118" text-anchor="middle">solution + tests</text>
<text class="lbl" x="120" y="258" text-anchor="middle">Interview round</text>
<text class="sm" x="120" y="280" text-anchor="middle">questions + traps</text>
<text class="lbl" x="396" y="49">/problems/&lt;id&gt;</text>
<text class="lbl" x="396" y="105">/problems/&lt;id&gt;/cases</text>
<text class="lbl" x="396" y="161">/mock/bank/coding</text>
<text class="lbl" x="396" y="249">/interview/&lt;round&gt;</text>
<text class="lbl" x="396" y="305">/mock/bank/&lt;stage&gt;</text>
<text class="sm" x="676" y="49">538 pages</text>
<text class="sm" x="676" y="105">222 translatable</text>
<text class="sm" x="676" y="161">439 + 99 machine</text>
<text class="sm" x="676" y="249">27 chapters</text>
<text class="sm" x="676" y="305">10 talk stages</text>
</svg>
<figcaption>
  Green boxes are written by hand; everything on the right is generated during the build. The
  <code>/cases</code> file for a problem that cannot be translated still exists; it just says why.
</figcaption>
</figure>

<p>
  The test-case files are the clever one. <code>lib/polyglot/record.ts</code> takes an exercise's
  JavaScript solution, wraps its function in a spy, runs each test body in Node's <code>vm</code> module
  during the build, and records every call's arguments and what the reference solution returned. It then
  infers a typed signature from those values: int, float, bool, string, or lists of them. Those become language-neutral cases
  that a Python, Ruby, PHP, Lua, C or C++ solution can be graded against in the browser. It refuses, and
  says why, for React components, for exercises about JavaScript's async model, and for tests that are
  not a plain call compared to a value. Of the 538 exercises, 222 come out translatable, carrying 2,048
  recorded cases between them.
</p>

<h3>The flag that does the most work</h3>
<p>
  A chapter carries <code>ready: boolean</code>. That single field is the difference between a written
  chapter and an outline, and it decides several things at once. An outline still gets a page, because
  every chapter id is returned from <code>generateStaticParams</code>, but the page shows a "not written
  yet" stamp and the syllabus bullets instead of a body, is marked <code>noindex</code>, has no Listen
  button and no "mark as read", and is left out of the sitemap and the cross-topic search index. The
  syllabus marks it with an open circle instead of a tick. It is why the site can show 585 chapters while honestly claiming 227.
</p>

<h3>One interface in the middle</h3>
<p>
  Pages do not import content files. They go through <code>lib/content.ts</code>:
  <code>chapters()</code>, <code>chapterMetas()</code>, <code>exercise()</code>,
  <code>exercisesForLevel()</code>, <code>readTime()</code>. <code>chapterMetas()</code> exists so that
  lists can carry every chapter without its body, which is what keeps the sidebar of a chapter page from
  shipping the whole topic. That is what makes adding a chapter a one-file job: drop the file in, add it
  to the topic's barrel and its level's syllabus, and the route, the search entry, the sitemap row, the
  reading time and the progress tracking all appear without being told to.
</p>

<div class="bx is-prim">
<span class="ttl">Why TypeScript files instead of a database</span>
<p>
  Three things a database would take away. The chapter shape is checked by the compiler, so a malformed
  chapter fails the build instead of rendering oddly in production. Content, rendering and styling change
  in one commit and revert in one command. And the whole corpus is covered by the same tooling as the
  code: spell-checking, and fifteen tests in <code>tests/content.test.ts</code> that walk every chapter
  and exercise looking for unbalanced <code>&lt;pre&gt;</code> and <code>&lt;code&gt;</code> tags,
  diagrams without an <code>aria-label</code>, missing subtitles, exercises without tests, and syllabus
  sections that point at chapters that do not exist. The derived
  routes above are the fourth reason: a build step can compute from content it can import, and a
  database would have made each of them a query.
</p>
</div>`,
};
