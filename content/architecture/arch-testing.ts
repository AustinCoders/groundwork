import type { Chapter } from "../types";

export const archTesting: Chapter = {
  id: "arch-testing",
  num: "A3",
  title: "What CI checks, and why it is mostly content",
  short: "CI and tests",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Fifteen unit tests, and not one of them tests a component.",
  body: `<h3>The pipeline</h3>
<p>
  Every push to <code>main</code> and every pull request runs the same nine steps. They are ordered
  cheapest first, so a typo fails in seconds rather than after a build.
</p>
<div class="table-scroll"><table>
<thead><tr><th>#</th><th>Step</th><th>Catches</th></tr></thead>
<tbody>
<tr><td>1</td><td>Typecheck</td><td>Everything the compiler can see, including malformed content</td></tr>
<tr><td>2</td><td>Lint</td><td>The usual, plus Next-specific mistakes</td></tr>
<tr><td>3</td><td>Formatting</td><td>Diff noise, before it lands</td></tr>
<tr><td>4</td><td>Spelling</td><td>354 files, prose included</td></tr>
<tr><td>5</td><td>Content integrity</td><td>15 tests over the data &mdash; see below</td></tr>
<tr><td>6</td><td>Build</td><td>Anything that only appears when 559 pages render</td></tr>
<tr><td>7</td><td>End-to-end</td><td>30 Playwright tests against a production build</td></tr>
<tr><td>8</td><td>Accessibility</td><td>axe over 14 pages, inside the same run</td></tr>
<tr><td>9</td><td>Lighthouse budgets</td><td>Performance regressions, with budgets set just under today's numbers</td></tr>
</tbody>
</table></div>

<h3>The unusual part: the tests check the writing</h3>
<p>
  There are no component tests here. The components are thin; the risk in this codebase is in three
  megabytes of hand-written content, so that is what is tested.
</p>
<ul>
<li>Every topic that declares levels has chapters, and every chapter id is unique and URL-safe.</li>
<li>No chapter is marked <code>ready</code> with an empty body, and no unwritten chapter has a body left on it.</li>
<li>Every ready chapter has a title and a subtitle.</li>
<li><b>Every body has balanced <code>&lt;pre&gt;</code> and <code>&lt;code&gt;</code> tags</b> &mdash; the failure that renders half a chapter inside a code block.</li>
<li><b>Every diagram has an <code>aria-label</code></b>, so an SVG cannot ship as an unlabelled image.</li>
<li>Every exercise referenced by a chapter exists, points back at a real chapter, and has at least one test.</li>
<li>Every syllabus section points at a chapter that exists.</li>
<li>Every topic with notes has a distinct reader route and a titled notes file.</li>
</ul>
<p>
  That list is the accumulated shape of mistakes actually made while writing, which is the only good
  reason for a test to exist.
</p>

<h3>Before CI, on every commit</h3>
<p>
  husky and lint-staged run the fast half — ESLint with fixes, Prettier, and cspell — over the staged
  files only. It stashes first, so a failure cannot leave the working tree half-formatted.
</p>

<h3>Two things worth copying</h3>
<div class="bx is-prim">
<span class="ttl">Budgets set just under today</span>
<p>
  The Lighthouse budgets are not aspirational round numbers. They are set slightly below what the
  site currently measures, so the job fails on a regression rather than on noise, and passing means
  "no worse than yesterday" rather than "above some arbitrary line".
</p>
</div>
<div class="bx is-ref">
<span class="ttl">The e2e suite runs on the production build</span>
<p>
  Playwright starts the real build on its own port rather than the dev server. Dev-mode React
  double-invokes effects and serves unminified chunks; a suite that passes there and fails in
  production has told you nothing. Running against the build is also how the earlier bundle
  regressions became measurable at all.
</p>
</div>`,
};
