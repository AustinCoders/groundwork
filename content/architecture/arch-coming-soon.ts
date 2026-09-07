import type { Chapter } from "../types";

export const archComingSoon: Chapter = {
  id: "arch-coming-soon",
  num: "B5",
  title: "What is written and what is not",
  short: "Written vs planned",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "Four topics of twenty are written. The other sixteen say so rather than pretending.",
  body: `<h3>The honest count</h3>
<p>
  The engineering on this site is ahead of the writing, and the site does not hide that. A topic with
  no written chapters still renders, still shows its full syllabus, and is labelled as planned rather
  than being quietly absent.
</p>

<div class="table-scroll"><table>
<thead><tr><th>Topic</th><th>Written</th><th>Exercises</th></tr></thead>
<tbody>
<tr><td>DSA in JS</td><td><b>34</b></td><td>245</td></tr>
<tr><td>JavaScript</td><td><b>27</b></td><td>54</td></tr>
<tr><td>Interview book</td><td><b>27 rounds</b></td><td>&mdash;</td></tr>
<tr><td>System Design</td><td><b>24</b></td><td>0</td></tr>
<tr><td>React</td><td>0</td><td>41 planned</td></tr>
<tr><td>Node.js</td><td>0</td><td>41 planned</td></tr>
<tr><td>Next.js</td><td>0</td><td>29 planned</td></tr>
<tr><td>TypeScript</td><td>0</td><td>29 planned</td></tr>
<tr><td>Nest.js</td><td>0</td><td>26 planned</td></tr>
<tr><td>CSS</td><td>0</td><td>25 planned</td></tr>
<tr><td>SQL &amp; Databases</td><td>0</td><td>25 planned</td></tr>
<tr><td>Testing, Web Security, Cloud &amp; DevOps, Kubernetes</td><td>0</td><td>24 each</td></tr>
<tr><td>HTML, Docker, GraphQL</td><td>0</td><td>22 each</td></tr>
<tr><td>Redis</td><td>0</td><td>21 planned</td></tr>
<tr><td>Git</td><td colspan="2">A standalone reference rather than a chaptered topic</td></tr>
</tbody>
</table></div>

<p class="sub">
  112 chapters written, 399 outlined. By chapter that is 22% of the plan; by topic it is 4 of 20.
</p>

<h3>What "coming soon" actually means here</h3>
<p>
  An outlined topic is not an empty page. The syllabus is written — every section has a title and the
  bullet points it will cover — so the outline is a genuine table of contents rather than a
  placeholder. Clicking a planned topic lands on <code>/soon</code>, which shows what is planned and
  says plainly that it is not written yet.
</p>

<h3>The two gaps that matter most</h3>
<ul>
<li>
  <b>System Design and the Interview book have no practice at all.</b> They are the two tracks most
  tied to getting hired and the two where a reader can only read. Their exercises would not look like
  the DSA ones — a design exercise is a prompt and a rubric, an interview one is a question with a
  model answer to compare against. That is a content format decision before it is a code one.
</li>
<li>
  <b>React, Node and TypeScript are unwritten.</b> They are the three that appear in nearly every job
  description this site is aimed at, which makes them the obvious next three to write.
</li>
</ul>

<div class="bx is-ref">
<span class="ttl">There is no engineering blocker on any of it</span>
<p>
  Writing a chapter means adding one file under <code>content/&lt;topic&gt;/</code> and listing it in
  the topic's barrel. The route, the search index entry, the sitemap row, the reading-time estimate
  and the progress tracking all follow from the content model. The thing standing between the
  outlines and the site is writing, not code.
</p>
</div>`,
};
