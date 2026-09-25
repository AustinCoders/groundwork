import type { Chapter } from "../types";

export const archTesting: Chapter = {
  id: "arch-testing",
  num: "A3",
  title: "Tests, hooks and CI",
  short: "CI and tests",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "166 unit tests, 74 browser tests, and one test that checks what these pages say about the site.",
  body: `<h3>The shape of it</h3>
<p>
  There are three layers of checking, each slower and more thorough than the one before:
</p>
<ul>
<li><strong>Git hooks</strong> on the author's machine, over staged files only.</li>
<li><strong>Vitest</strong> in Node, over data and pure logic.</li>
<li><strong>Playwright</strong> in a real browser, against a production build.</li>
</ul>
<p>
  CI runs the last two, plus the compiler, the linters and Lighthouse, on every push to
  <code>main</code> and on every pull request. The latest run on <code>main</code> passed.
</p>

<h3>Unit tests: 15 files, 166 tests</h3>
<p>
  <code>vitest.config.ts</code> collects <code>tests/**/*.test.ts</code> and runs them in a Node
  environment with no DOM. No React component is rendered in a unit test. That is still a decision,
  not a gap. The risk in this codebase sits in hand-written content and in a few engines with real
  logic, and components are tested where they actually run, in the browser.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Area</th><th>Files</th><th>Tests</th><th>What they hold in place</th></tr></thead>
<tbody>
<tr><td>Mock interview</td><td><code>mock-engine</code>, <code>mock-session</code>, <code>mock-readiness</code>, <code>mock</code></td><td>66</td><td>How the interviewer adapts, how a session moves through its stages, and the readiness score</td></tr>
<tr><td>Content and SEO</td><td><code>content</code>, <code>seo</code>, <code>claims</code>, <code>search-index</code></td><td>45</td><td>Chapter integrity, the sitemap and robots rules, the site's claims about itself, and the search budget</td></tr>
<tr><td>Playground</td><td><code>polyglot</code>, <code>debug-trace</code>, <code>wasm-assets</code>, <code>contrast</code></td><td>28</td><td>Grading across languages, the step-through tracer, pinned runtime versions, and editor contrast in every theme</td></tr>
<tr><td>Whiteboard</td><td><code>whiteboard-model</code></td><td>17</td><td>Geometry, history and <code>sanitizeEls</code></td></tr>
<tr><td>Tooling</td><td><code>comments</code>, <code>error-tracking</code></td><td>10</td><td>The comment checker itself, and Sentry's options and CSP origin</td></tr>
</tbody>
</table></div>
<p>
  The largest file is <code>mock-engine.test.ts</code> with 34 tests. The content file,
  <code>content.test.ts</code>, has 15. Each of those 15 is a mistake that was really made while
  writing:
</p>
<ul>
<li>a chapter marked ready with an empty body</li>
<li><code>&lt;pre&gt;</code> and <code>&lt;code&gt;</code> tags that do not balance, which puts half a chapter inside a code block</li>
<li>a diagram with no <code>aria-label</code></li>
<li>an exercise pointing at a chapter that does not exist</li>
</ul>
<p>
  The whole suite runs in 8 seconds in CI.
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

<h3>Browser tests: 3 specs, 74 tests</h3>
<p>
  <code>playwright.config.ts</code> starts <code>npm run start</code> on port 3100. That is the
  production build, not the dev server, because dev mode double-invokes effects and serves
  unminified code. In CI it retries a failed test once and fails the run if anyone left a
  <code>test.only</code> behind.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Spec</th><th>Tests</th><th>Covers</th></tr></thead>
<tbody>
<tr><td><code>smoke.spec.ts</code></td><td>49</td><td>16 routes load with no console error and no failed request; the playground fits at 1024, 768 and 390 pixels wide; 30 flows (narration, search, share links, stdin, the debugger, Lua and Python grading, the mock interview from lobby to debrief, and the problems page filters)</td></tr>
<tr><td><code>a11y.spec.ts</code></td><td>19</td><td>axe with the WCAG 2.0 and 2.1 A and AA tags over 18 pages, plus a mock round checked at up to five stages, from the brief to the debrief</td></tr>
<tr><td><code>whiteboard.spec.ts</code></td><td>6</td><td>Drawing, arrows that follow their shapes, undo, reload, PNG export, share links, templates, locking, grouping</td></tr>
</tbody>
</table></div>
<p>
  The smoke spec ignores requests to <code>/_vercel/</code>. Those scripts exist only on Vercel's
  edge, so they return 404 locally every time. The accessibility spec disables one axe rule,
  <code>scrollable-region-focusable</code>, for every page.
</p>

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
<span class="ttl">The rule has one door open</span>
<p>
  CI does not run <code>npm run comments</code>. The check lives only in the pre-push hook and in
  <code>npm run check</code>. A push with <code>--no-verify</code>, or a commit made in the GitHub
  web editor, skips it. The workflow files themselves carry comments, which is allowed, because the
  checker does not read YAML.
</p>
</div>

<h3>CI, step by step</h3>
<p>
  <code>.github/workflows/ci.yml</code> has one job on <code>ubuntu-latest</code>. The timings are
  from the latest run on <code>main</code>, which took 403 seconds from start to finish.
</p>
<div class="table-scroll"><table>
<thead><tr><th>#</th><th>Step</th><th>Seconds</th><th>Note</th></tr></thead>
<tbody>
<tr><td>1</td><td>Checkout</td><td>1</td><td></td></tr>
<tr><td>2</td><td>Set up Node</td><td>8</td><td>Version from <code>.nvmrc</code>, which is 24, with the npm cache</td></tr>
<tr><td>3</td><td><code>npm ci --ignore-scripts</code></td><td>14</td><td><code>msedge-tts</code> has a pnpm-only preinstall gate; its published build does not need it</td></tr>
<tr><td>4</td><td>Generate route types</td><td>under 1</td><td><code>next typegen</code>, so <code>tsc</code> can see the route helper types</td></tr>
<tr><td>5</td><td>Typecheck</td><td>11</td><td>Includes every content file</td></tr>
<tr><td>6</td><td>Lint</td><td>18</td><td></td></tr>
<tr><td>7</td><td>Formatting</td><td>8</td><td><code>prettier --check</code></td></tr>
<tr><td>8</td><td>Spelling</td><td>7</td><td>cspell over the whole repository, dotfiles included</td></tr>
<tr><td>9</td><td>Unit tests</td><td>8</td><td>Named "Content integrity tests" in the workflow; it runs the full Vitest suite</td></tr>
<tr><td>10</td><td>Build</td><td>107</td><td>Compiled in 21.5 s, then 1,738 static pages generated in 71 s on 3 workers</td></tr>
<tr><td>11</td><td>Install Chromium</td><td>20</td><td></td></tr>
<tr><td>12</td><td>End-to-end</td><td>77</td><td>74 passed</td></tr>
<tr><td>13</td><td>Upload Playwright report</td><td>&mdash;</td><td>Only on failure, kept 7 days</td></tr>
<tr><td>14</td><td>Lighthouse budgets</td><td>118</td><td>3 URLs, 3 runs each</td></tr>
<tr><td>15</td><td>Upload Lighthouse report</td><td>&mdash;</td><td>Only on failure, kept 7 days</td></tr>
</tbody>
</table></div>
<p>
  The order is cheapest first. Everything up to the unit tests takes 66 seconds, so a type error or
  a misspelling fails long before the build starts.
</p>
<p>
  Lighthouse runs from <code>treosh/lighthouse-ci-action</code> rather than from the project's own
  dependencies. The CLI pulls in an old Lighthouse and Puppeteer, and that was thirteen advisories
  the lockfile did not need for a tool that only ever runs in CI.
</p>

<figure>
<svg viewBox="0 0 900 290" class="dg" role="img" aria-label="The CI job in order. The first row holds the cheap checks: install 14 seconds, typecheck 11, lint 18, format 8, spell 7 and unit tests 8, together 66 seconds. The second row holds the expensive ones: build 107 seconds, Chromium 20, end-to-end 77 and Lighthouse 118.">
<g class="rough">
<rect x="20" y="40" width="126" height="64" rx="9" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="166" y="40" width="126" height="64" rx="9" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="312" y="40" width="126" height="64" rx="9" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="458" y="40" width="126" height="64" rx="9" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="604" y="40" width="126" height="64" rx="9" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="750" y="40" width="126" height="64" rx="9" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="20" y="186" width="196" height="64" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="240" y="186" width="196" height="64" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="460" y="186" width="196" height="64" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="680" y="186" width="196" height="64" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<path class="ln" d="M146 72 H160" marker-end="url(#arrow)" />
<path class="ln" d="M292 72 H306" marker-end="url(#arrow)" />
<path class="ln" d="M438 72 H452" marker-end="url(#arrow)" />
<path class="ln" d="M584 72 H598" marker-end="url(#arrow)" />
<path class="ln" d="M730 72 H744" marker-end="url(#arrow)" />
<path class="ln" d="M813 104 V140 H118 V180" marker-end="url(#arrow)" />
<path class="ln" d="M216 218 H234" marker-end="url(#arrow)" />
<path class="ln" d="M436 218 H454" marker-end="url(#arrow)" />
<path class="ln" d="M656 218 H674" marker-end="url(#arrow)" />
</g>
<text class="sm" x="20" y="26">CHEAP CHECKS, 66 s TOGETHER</text>
<text class="lbl" x="34" y="70">Install</text>
<text class="sm" x="34" y="92">14 s</text>
<text class="lbl" x="180" y="70">Typecheck</text>
<text class="sm" x="180" y="92">11 s</text>
<text class="lbl" x="326" y="70">Lint</text>
<text class="sm" x="326" y="92">18 s</text>
<text class="lbl" x="472" y="70">Format</text>
<text class="sm" x="472" y="92">8 s</text>
<text class="lbl" x="618" y="70">Spell</text>
<text class="sm" x="618" y="92">7 s</text>
<text class="lbl" x="764" y="70">Unit tests</text>
<text class="sm" x="764" y="92">8 s, 166 tests</text>
<text class="sm" x="20" y="172">EXPENSIVE CHECKS</text>
<text class="lbl" x="34" y="216">Build</text>
<text class="sm" x="34" y="238">107 s, 1,738 pages</text>
<text class="lbl" x="254" y="216">Chromium</text>
<text class="sm" x="254" y="238">20 s</text>
<text class="lbl" x="474" y="216">End-to-end</text>
<text class="sm" x="474" y="238">77 s, 74 tests</text>
<text class="lbl" x="694" y="216">Lighthouse</text>
<text class="sm" x="694" y="238">118 s, 3 &times; 3 runs</text>
<text class="sm" x="20" y="276">403 s in total on the latest run on main</text>
</svg>
<figcaption>
  The first row is a sixth of the job and fails fastest. The rest is the build and two browser suites, and
  Lighthouse is now the single longest step.
</figcaption>
</figure>

<h3>What the Dependabot runs showed</h3>
<p>
  The failed runs on Dependabot's pull requests show each layer doing its job:
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
