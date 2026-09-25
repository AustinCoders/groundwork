import type { Chapter } from "../types";

export const archComingSoon: Chapter = {
  id: "arch-coming-soon",
  num: "B5",
  title: "What is written and what is not",
  short: "Written vs planned",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "Seven of twenty-one topics are written. The other fourteen say so rather than pretending.",
  body: `<h3>The honest count</h3>
<p>
  The engineering on this site is ahead of the writing, and the site does not hide that. A topic with no
  written chapters still renders, still shows its full syllabus, and is labelled as planned rather than
  being quietly absent. The numbers below are computed from the content through
  <code>lib/topicStats.ts</code>, the same function the home page uses.
</p>

<div class="table-scroll"><table>
<thead><tr><th>Topic</th><th>Written</th><th>Outlined</th><th>Exercises</th></tr></thead>
<tbody>
<tr><td>React</td><td><b>57</b></td><td>0</td><td>162</td></tr>
<tr><td>JavaScript</td><td><b>41</b></td><td>0</td><td>99</td></tr>
<tr><td>DSA in JS</td><td><b>34</b></td><td>0</td><td>277</td></tr>
<tr><td>Interview book</td><td><b>27 rounds</b></td><td>&mdash;</td><td>405 questions, no exercises</td></tr>
<tr><td>How this is built</td><td><b>26</b></td><td>0</td><td>0</td></tr>
<tr><td>System Design</td><td><b>24</b></td><td>0</td><td>0</td></tr>
<tr><td>Git</td><td><b>16 sections</b></td><td>&mdash;</td><td>A standalone guide, not a chaptered topic</td></tr>
<tr><td>Node.js</td><td>0</td><td>41</td><td>0</td></tr>
<tr><td>Next.js, TypeScript</td><td>0</td><td>29 each</td><td>0</td></tr>
<tr><td>Nest.js</td><td>0</td><td>26</td><td>0</td></tr>
<tr><td>CSS, SQL &amp; Databases</td><td>0</td><td>25 each</td><td>0</td></tr>
<tr><td>Testing, Web Security, Cloud &amp; DevOps, Kubernetes</td><td>0</td><td>24 each</td><td>0</td></tr>
<tr><td>HTML, Docker, GraphQL</td><td>0</td><td>22 each</td><td>0</td></tr>
<tr><td>Redis</td><td>0</td><td>21</td><td>0</td></tr>
</tbody>
</table></div>

<p class="sub">
  227 chapters written, 358 outlined. By chapter that is 39% of the plan; by topic it is 7 of 21.
</p>

<figure>
<svg viewBox="0 0 900 250" class="dg" role="img" aria-label="Two bars drawn to scale. Chapters: 227 written and 358 outlined. Exercises with tests: 277 in DSA, 162 in React, 99 in JavaScript, and none anywhere else.">
<g class="rough">
<rect x="30" y="50" width="325.9" height="48" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="355.9" y="50" width="514.1" height="48" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<rect x="30" y="150" width="432.5" height="48" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="462.5" y="150" width="252.9" height="48" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="715.4" y="150" width="154.6" height="48" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
</g>
<text class="sm" x="30" y="38">CHAPTERS, TO SCALE</text>
<text class="lbl" x="193" y="80" text-anchor="middle">227 written</text>
<text class="lbl" x="612" y="80" text-anchor="middle">358 outlined</text>
<text class="sm" x="30" y="138">EXERCISES WITH TESTS, BY TOPIC</text>
<text class="lbl" x="246" y="180" text-anchor="middle">DSA 277</text>
<text class="lbl" x="589" y="180" text-anchor="middle">React 162</text>
<text class="lbl" x="793" y="180" text-anchor="middle">JavaScript 99</text>
<text class="sm" x="30" y="230">Every other topic has 0. The chapter bar counts the Git guide's 16 sections as written.</text>
</svg>
<figcaption>
  The two bars do not line up, and that is the point: the exercises are concentrated in three topics,
  while the written chapters are spread across seven.
</figcaption>
</figure>

<h3>What "planned" actually means here</h3>
<p>
  An outlined topic is not an empty page. The syllabus is written: every section has a title and the
  bullet points it will cover, so the outline is a genuine table of contents rather than a placeholder.
  Its cover renders the full map, and every outlined chapter has its own page showing a "not written yet"
  stamp and that section's bullets.
</p>
<p>
  What an outline does not get is attention from outside. Every outlined page is marked
  <code>noindex</code> and left out of the sitemap, so search engines are not offered 358 pages with no
  body; the commit that did this was titled "Stop offering 358 unwritten chapters to crawlers and
  readers". The cross-topic search leaves outlines out. In the sidebar, a topic with nothing written sits
  under "More topics" in a muted style, and its link goes to <code>/soon?topic=&lt;id&gt;</code>, which
  says plainly that the topic is planned and not written yet.
</p>
<p>
  The label is computed, not typed. <code>app/layout.tsx</code> works out which topics have at least one
  written chapter from <code>topicStats()</code> and passes that list to every page through
  <code>TopicsReadyProvider</code>. Mark one chapter of Node.js as <code>ready</code> and Node moves from
  "More topics" to "Ready to read" on the next build, with nobody touching the sidebar.
</p>

<h3>Where the tools reach past the writing</h3>
<p>
  The features built since the chapters were counted do not wait for the writing. The playground runs 11
  languages whatever topic you came from. The whiteboard has nothing to do with any topic. And the mock
  interview gives two unexercised tracks a way to be practised:
</p>
<ul>
<li>
  <b>The Interview book</b> has no exercises, but its rounds are the source of the mock interview's
  talking stages. A question from the book arrives with a timer, a follow-up, and a rubric built from the
  book's own "what they are testing", "what to say" and "the trap" fields, which you mark yourself
  against the model answer.
</li>
<li>
  <b>System Design</b> has no exercises either, but the mock interview's design round has 18 questions
  and a small whiteboard to draw the answer on, kept with the session so the scorecard can show it again.
</li>
</ul>

<h3>The gaps that matter most</h3>
<ul>
<li>
  <b>System Design and the Interview book still have no graded practice.</b> Self-marking against a
  model answer is useful, but it is not a test that passes or fails. A design exercise that could be
  graded would need a format that does not exist yet: a prompt, a rubric, and something checkable about
  the answer. That is a content decision before it is a code one.
</li>
<li>
  <b>Node, TypeScript and Next.js are unwritten.</b> React and JavaScript are now written in full, which
  leaves these as the three that appear in most of the job descriptions this site is aimed at, and the
  obvious next three to write. Node.js alone has 41 outlined chapters.
</li>
<li>
  <b>Exercises exist for three topics only.</b> Every one of the 538 belongs to JavaScript, React or
  DSA. The grading machinery would accept an exercise from any topic whose answer is a JavaScript
  function or a React component; the missing part is writing them.
</li>
</ul>

<h3>How the counts stay honest</h3>
<p>
  Every count on this page, and on the home page, comes from one of two functions in
  <code>lib/topicStats.ts</code>. <code>topicStats()</code> gives each topic its written, planned,
  exercise and minute totals; for Git, which has no chapters, it counts the guide's sections instead.
  <code>siteStats()</code> adds those up. The two disagree on purpose in one place: the home page says 19
  topics, not 21, because <code>onShelf()</code> in <code>lib/topicIds.ts</code> leaves out the Interview
  book and this topic, which are reached from the sidebar's tool links rather than the topic shelf.
</p>
<p>
  The prose is checked too. <code>tests/claims.test.ts</code> recomputes the written and outlined
  totals, the exercise count and the interview totals, and fails if the sentence under the table above,
  or the matching lines in four other chapters of this topic and in the README, no longer say the same
  thing. Writing a chapter therefore updates the site's numbers automatically, and then fails a test
  until the chapters that quote those numbers are updated by hand.
</p>

<div class="bx is-ref">
<span class="ttl">There is no engineering blocker on any of it</span>
<p>
  Writing a chapter means adding one file under <code>content/&lt;topic&gt;/</code>, listing it in the
  topic's barrel, and pointing its syllabus section at it. The page already exists as an outline, so it
  keeps its URL; the sitemap row, the search entry, the reading-time estimate, the progress tracking and
  the sidebar label all follow from <code>ready: true</code>. The thing standing between the outlines and
  the site is writing, not code.
</p>
</div>`,
};
