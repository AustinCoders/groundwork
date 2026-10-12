import type { Chapter } from "../types";

export const archTesting: Chapter = {
  id: "arch-testing",
  num: "A3",
  title: "Tests and hooks",
  short: "Tests",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "1295 unit tests, 20 browser tests, and one test that checks what these pages say about the site.",
  body: `<h3>The shape of it</h3>
<p>
  There are three layers of checking, each slower than the one before:
</p>
<ul>
<li><strong>Git hooks</strong> on the author's machine, over staged files only.</li>
<li><strong>Vitest</strong> in Node, over data and pure logic. Most of the weight is here.</li>
<li><strong>Playwright</strong> in a real browser, against a production build: one small smoke spec.</li>
</ul>
<p>
  There is no CI service. A GitHub workflow used to run the compiler, the linters, the unit tests, the build, about 570
  browser tests and Lighthouse on every push and pull request; it was removed, and nothing runs these checks for the author
  now. The browser suite was cut to the smoke spec described below. The test counts in this chapter are counted from the
  working tree of the branch it was last edited on.
</p>

<h3>Unit tests: 24 files, 405 tests</h3>
<p>
  <code>vitest.config.ts</code> collects <code>tests/**/*.test.ts</code> and runs them in a Node
  environment with no DOM. No React component is rendered in a unit test. That is still a decision,
  not a gap. The risk in this codebase sits in hand-written content and in a few engines with real
  logic, and components are tested where they actually run, in the browser.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Area</th><th>Files</th><th>Tests</th><th>What they hold in place</th></tr></thead>
<tbody>
<tr><td>Mock interview</td><td><code>mock-engine</code>, <code>mock-session</code>, <code>mock-readiness</code>, <code>mock-guide</code>, <code>mock</code></td><td>74</td><td>How the interviewer adapts, how a session moves through its stages, the readiness score, and the coaching</td></tr>
<tr><td>Content and SEO</td><td><code>content</code>, <code>seo</code>, <code>claims</code>, <code>search-index</code>, <code>privacy</code>, <code>next-config</code>, <code>client-bundle</code>, <code>topic-categories</code>, <code>home-rounds</code></td><td>129</td><td>Chapter integrity, the sitemap and robots rules, the site's claims about itself, the search budget, the privacy page's list of services, the pinned redirects, the client bundle, the category of every topic, and the interview rounds the home page previews</td></tr>
<tr><td>Playground</td><td><code>polyglot</code>, <code>debug-trace</code>, <code>wasm-assets</code>, <code>contrast</code></td><td>37</td><td>Grading across languages, the step-through tracer, pinned runtime versions, and the contrast of the editor, text and role colours in every theme</td></tr>
<tr><td>Whiteboard</td><td><code>whiteboard-model</code></td><td>17</td><td>Geometry, history and <code>sanitizeEls</code></td></tr>
<tr><td>Themes</td><td><code>theme-roles</code>, <code>theme-contract</code></td><td>115</td><td>Role tokens instead of fixed colours in every stylesheet, and a complete block for every theme</td></tr>
<tr><td>Tooling</td><td><code>comments</code>, <code>error-tracking</code></td><td>10</td><td>The comment checker itself, and Sentry's options and CSP origin</td></tr>
</tbody>
</table></div>
<p>
  The largest hand-written file is <code>mock-engine.test.ts</code> with 37 tests;
  <code>theme-roles.test.ts</code> runs 101, most of them one check repeated for each CSS module. The content file,
  <code>content.test.ts</code>, has 18. Each of those 18 is a mistake that was really made while
  writing:
</p>
<ul>
<li>a chapter marked ready with an empty body</li>
<li><code>&lt;pre&gt;</code> and <code>&lt;code&gt;</code> tags that do not balance, which puts half a chapter inside a code block</li>
<li>a diagram with no <code>aria-label</code></li>
<li>an exercise pointing at a chapter that does not exist</li>
</ul>
<p>
  The whole suite runs in under 10 seconds.
</p>

<h3>The test that keeps these pages honest</h3>
<p>
  <code>tests/claims.test.ts</code> exists because this topic is full of numbers. It works out the
  real figures from <code>lib/content</code>: written chapters, outlines, exercises, interview rounds
  and topics. It builds the exact sentence each figure appears in, reads the source file as plain
  text, and expects to find that sentence.
</p>
<p>
  It checks 10 claims across six files, one of them the README, plus the topic-count row of the overview table. One of
  them is in the scaling chapter. It expects the text <code>Writing the N outlined chapters</code>,
  with N computed from the data. Write one more outline and the test fails until the sentence is
  updated.
</p>
<p>
  The test does not check whether a claim is wise. It only stops a claim from going stale in
  silence, which is how the old versions of these chapters went wrong: they were true when written
  and then drifted.
</p>

<h3>Browser tests: one smoke spec, 20 tests</h3>
<p>
  <code>playwright.config.ts</code> starts <code>npm run start</code> on port 3100. That is the
  production build, not the dev server, because dev mode double-invokes effects and serves
  unminified code, so <code>npm run build</code> comes first. <code>npm run test:e2e</code> then runs the spec in about ten
  seconds on three workers, with no retries unless <code>CI</code> is set, in which case it retries a failed test once and
  fails the run if anyone left a <code>test.only</code> behind.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Spec</th><th>Tests</th><th>Covers</th></tr></thead>
<tbody>
<tr><td><code>smoke.spec.ts</code></td><td>20</td><td>8 pages load with their heading and no console error; 12 flows (the home page with its heading and the Menu pill, the Menu opening and closing on Escape, a topic cover and its level picker link, a chapter with its rail and no sideways scroll at 390 pixels wide, the path trail with every exercise list open and no stop covering another, the playground running a JavaScript snippet, an exercise page running code and grading a submission, unknown URLs returning a real 404, a DSA chapter switching its code to Python and back, the binary search player stepping forward and back, marking a DSA chapter read opening its check that a keyboard user answers and finishes, and the DSA cover telling a passed chapter's check state in words)</td></tr>
</tbody>
</table></div>
<p>
  The eight pages are the problems list, the interview book, the mock interview, review, progress, privacy, this section and
  the Git guide. A test that clicks first waits for the element to be hydrated, by looking for the property React puts on a
  DOM node once it owns it, so it cannot click before the handler exists and nothing in the spec sleeps. It ignores requests
  to <code>/_vercel/</code>. Those scripts exist only on Vercel's edge, so they return 404 locally every time.
</p>
<div class="bx is-ref">
<span class="ttl">What the cut removed</span>
<p>
  The old suite also ran axe over every page and state in all nine themes at two widths, opened every written chapter at 390
  pixels wide, probed the composition of every hero stage in every theme and font, and covered the tour, the interview book,
  the mock room, review, progress, the workbench, the whiteboard and keyboard focus in detail, including checks that nothing
  flashes the wrong state before hydration. None of that is checked in a browser any more. What still guards the colours is
  <code>tests/contrast.test.ts</code> and the theme tests, which read the tokens of all nine themes in Node. Layout, overflow,
  focus and hydration behaviour on those pages are now checked by looking.
</p>
</div>

<h3>Before code leaves the machine</h3>
<p>
  <code>.husky/pre-commit</code> runs <code>lint-staged</code> over the staged files only:
</p>
<ul>
<li>ESLint with fixes, then Prettier, for <code>.ts</code>, <code>.tsx</code> and <code>.mjs</code></li>
<li>Prettier for CSS, Markdown and JSON</li>
<li>cspell for every staged file, whatever its type</li>
</ul>
<p>
  <code>.husky/pre-push</code> runs <code>npm run comments</code>. This project keeps its source free
  of comments, and <code>scripts/comments.mjs</code> enforces that:
</p>
<ul>
<li>It parses each tracked <code>.ts</code>, <code>.tsx</code>, <code>.js</code>, <code>.mjs</code>, <code>.cjs</code> and <code>.css</code> file with the TypeScript compiler's own scanner. So a <code>//</code> inside a string, a template, a regular expression or JSX text is correctly left alone.</li>
<li>It skips <code>public/</code>, <code>docs/</code>, <code>node_modules/</code> and <code>.next/</code>.</li>
<li>It keeps the directives that tools read: <code>eslint-disable</code>, <code>@ts-expect-error</code>, <code>webpackIgnore</code>, <code>prettier-ignore</code>, <code>cspell:</code> and a few more.</li>
<li>With <code>--fix</code>, it removes each comment together with the line it sat on, then runs Prettier over the files it changed.</li>
</ul>
<p>
  Five unit tests cover the checker.
</p>
<div class="bx is-ref">
<span class="ttl">The rule has one door</span>
<p>
  The check runs in the pre-push hook and in <code>npm run check</code>. A push with
  <code>--no-verify</code>, or a commit made in the GitHub web editor, skips the hook, and nothing else runs it.
</p>
</div>

<h3>What runs, and when</h3>
<p>
  Nothing here runs by itself except the two git hooks. The rest are commands the author runs.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Command</th><th>What it runs</th></tr></thead>
<tbody>
<tr><td><code>npm run check</code></td><td>Typecheck, lint, the comment check, formatting, spelling and the unit tests</td></tr>
<tr><td><code>npm run build</code></td><td>The production build, which type-checks again and renders every page; Vercel runs the same command</td></tr>
<tr><td><code>npm run test:e2e</code></td><td>The smoke spec, against the build</td></tr>
<tr><td><code>npm run build</code> then <code>npm run test:perf</code></td><td>The Lighthouse budgets in <code>.lighthouserc.json</code>, three runs on three URLs, started through <code>npx</code></td></tr>
</tbody>
</table></div>
<p>
  Pushing a branch is also a check. Vercel builds a preview of every pushed branch and reports it as a commit status called
  <code>Vercel</code>, with a URL to open. Vercel runs the build but not the linters or the tests.
</p>
<p>
  Lighthouse runs through <code>npx</code> rather than from the project's own dependencies. The CLI pulls in an old
  Lighthouse and Puppeteer, and that was thirteen advisories the lockfile did not need for a tool that only runs when someone asks.
</p>

<h3>What the Dependabot runs showed</h3>
<p>
  The failed runs on Dependabot's pull requests, from when CI still ran, show each layer doing its job. Those pull requests now get no automatic check at all:
</p>
<ul>
<li>
  <strong>The Pyodide bump</strong> failed in <code>wasm-assets.test.ts</code>: "expected 314.0.6 to
  be 314.0.7". The CDN URL uses a version typed into <code>lib/wasmAssets.ts</code>, and the test
  refuses to let <code>package.json</code> and that constant disagree.
</li>
<li>
  <strong>The dev-tooling group</strong> failed at <code>npm ci</code> in 23 seconds. A newer Vite
  wanted a newer esbuild than the exact 0.25.12 the project pins.
</li>
<li>
  <strong>The Next group</strong> failed on Lighthouse, on a single slow run. That run is why there
  are now three.
</li>
</ul>`,
};
