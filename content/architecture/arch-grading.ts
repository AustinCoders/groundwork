import type { Chapter } from "../types";

export const archGrading: Chapter = {
  id: "arch-grading",
  num: "I7",
  title: "How an answer gets checked",
  short: "Grading",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Tests written once in JavaScript, replayed in six other languages, and a React sandbox in an iframe.",
  body: `<h3>What a test is</h3>
<p>
  Every exercise lives in <code>content/practice/</code> as a plain object: an id, a chapter, a level,
  a title, a brief in HTML, the starter code, hints, a reference solution and a list of tests. A test
  is only a name and a body, and the body is JavaScript that calls the reader's function and asserts on
  the answer:
</p>
<pre><code>{ name: 'null reports "null"', body: 'assert.equal(kindOf(null), "null");' }</code></pre>
<p>
  There are 538 exercises with 4,362 tests between them, and 99 of the exercises are React
  components rather than functions. The <code>assert</code> the tests call comes from
  <code>lib/assertKit.ts</code>, 75 lines with six methods: <code>ok</code>, <code>equal</code>,
  <code>notEqual</code>, <code>deepEqual</code>, <code>type</code> and <code>throws</code>. Its
  <code>deepEqual</code> treats two <code>NaN</code>s as equal, compares Maps and Sets by their
  printed form, and walks arrays and plain objects key by key. Its <code>fmt</code> prints values
  the way the console does, so a failure reads "expected [1, 2] but got [2, 1]" rather than
  "[object Object]". The same file is used by the JavaScript worker, the React sandbox and the
  build-time recorder, so a test means the same thing in all three.
</p>

<h3>Grading JavaScript and TypeScript</h3>
<p>
  Submit calls the runner with the exercise's tests. <code>buildTestSource</code> in
  <code>lib/runner.ts</code> turns each one into an async function with its own
  <code>try</code>/<code>catch</code>, which pushes <code>{ index, name, ok, message }</code> onto a
  results array. The tests are placed after the reader's code inside the same function, so they can
  call anything the reader declared. One failing test cannot stop the others, and a test that throws
  reports the error's message as the reason.
</p>
<p>
  TypeScript is compiled first and then graded exactly like JavaScript. If the reader's code crashes
  before the tests, or runs past the five-second limit, the result list comes back empty, and the
  Test Result tab says so instead of claiming a score.
</p>

<h3>Other languages: record, then replay</h3>
<p>
  The tests are JavaScript, but a reader can solve a problem in Python, Ruby, PHP, Lua, C or C++.
  Nobody wrote those tests by hand. They are recorded from the reference solution at build time, and
  the recorded answers are replayed against the reader's code.
</p>
<figure>
<svg viewBox="0 0 900 340" class="dg" role="img" aria-label="At build time, recordPolyglot runs each exercise's solution and tests in node:vm and writes a static JSON file of signature and cases. In the browser, withHarness appends one call per case to the reader's code, the runtime prints one marked line per case, and gradeResults compares them with the recorded answers.">
<g class="rough">
<rect x="24" y="44" width="200" height="86" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="290" y="44" width="250" height="86" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="610" y="44" width="266" height="86" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--ink); stroke-width: 1.8" />
<rect x="610" y="214" width="266" height="86" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="330" y="214" width="220" height="86" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="24" y="214" width="240" height="86" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<path class="ln" d="M224 87 H284" marker-end="url(#arrow)" />
<path class="ln" d="M540 87 H604" marker-end="url(#arrow)" />
<path class="ln" d="M743 130 V208" marker-end="url(#arrow)" />
<path class="ln" d="M610 257 H556" marker-end="url(#arrow)" />
<path class="ln" d="M330 257 H270" marker-end="url(#arrow)" />
</g>
<text class="sm" x="24" y="30">AT BUILD TIME</text>
<text class="sm" x="24" y="200">IN THE BROWSER</text>
<text class="lbl" x="124" y="80" text-anchor="middle">An exercise</text>
<text class="sm" x="124" y="104" text-anchor="middle">solution + JS tests</text>
<text class="lbl" x="415" y="74" text-anchor="middle">recordPolyglot()</text>
<text class="sm" x="415" y="96" text-anchor="middle">runs the solution in node:vm</text>
<text class="sm" x="415" y="116" text-anchor="middle">and records every call</text>
<text class="lbl" x="743" y="74" text-anchor="middle">/problems/[slug]/cases</text>
<text class="sm" x="743" y="96" text-anchor="middle">force-static JSON</text>
<text class="sm" x="743" y="116" text-anchor="middle">signature and cases</text>
<text class="sm" x="752" y="176">fetched once</text>
<text class="lbl" x="743" y="244" text-anchor="middle">withHarness()</text>
<text class="sm" x="743" y="266" text-anchor="middle">reader's code, then a call</text>
<text class="sm" x="743" y="286" text-anchor="middle">for every recorded case</text>
<text class="lbl" x="440" y="244" text-anchor="middle">The runtime</text>
<text class="sm" x="440" y="266" text-anchor="middle">prints one marked line</text>
<text class="sm" x="440" y="286" text-anchor="middle">per case</text>
<text class="lbl" x="144" y="244" text-anchor="middle">gradeResults()</text>
<text class="sm" x="144" y="266" text-anchor="middle">matches rows to cases</text>
<text class="sm" x="144" y="286" text-anchor="middle">numbers within 1e-6</text>
<text class="sm" x="144" y="324" text-anchor="middle">then the Test Result tab</text>
</svg>
<figcaption>
  The reference solution is the oracle. A test written once in JavaScript becomes a list of inputs
  and expected outputs that any language can be asked to reproduce.
</figcaption>
</figure>

<h3>Recording</h3>
<p>
  <code>lib/polyglot/record.ts</code> finds the solution's first top-level function and reads its
  parameter names. It then keeps only the tests it can replay: tests whose every statement is either
  <code>assert.equal</code> or <code>assert.deepEqual</code> (or their strict forms) called directly on
  that function, or a plain <code>const</code>. Anything that chains off the result, such as
  <code>fn(x).length</code>, is skipped.
</p>
<p>
  For each kept test it runs the solution with <code>vm.runInNewContext</code> and a two-second
  timeout, with the function wrapped so every call records its arguments and its return value.
  Arguments are copied through JSON before the call, so a solution that mutates its input does not
  change what was recorded. A value only counts if it is plain data: finite numbers, booleans,
  strings and nested arrays. A function that returns <code>null</code> or an object gives up. The
  recorder then infers a signature from the values, with <code>unify</code> widening
  <code>int</code> and <code>float</code> to <code>float</code> and refusing anything that changes
  kind between calls.
</p>
<p>
  <code>app/problems/[slug]/cases/route.ts</code> runs this for every exercise. It is
  <code>force-static</code> with <code>generateStaticParams</code>, so every file is written once
  during the build and served as static JSON. The workspace fetches it only when the reader switches a
  problem to any language except JavaScript and SQL, or presses Debug, and keeps it in a Map for the rest of
  the visit.
</p>
<p>
  Of the 538 exercises, 222 record cleanly. They produce 2,048 cases across 1,439 tests, and 395 of
  their tests are skipped because they check a property of the answer rather than the answer itself.
  The Test Result tab says how many were skipped and suggests switching to JavaScript to run them.
  The other 316 stay JavaScript-only, each with a reason the editor shows in place of a starter:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Why it stays in JavaScript</th><th>Exercises</th></tr></thead>
<tbody>
<tr><td>A React component</td><td>99</td></tr>
<tr><td>Its tests check properties only JavaScript can replay</td><td>84</td></tr>
<tr><td>It works on JavaScript objects</td><td>61</td></tr>
<tr><td>It is about JavaScript itself (no top-level function)</td><td>27</td></tr>
<tr><td>Its function takes arguments only JavaScript can express</td><td>17</td></tr>
<tr><td>It is about JavaScript's async model</td><td>11</td></tr>
<tr><td>Its arguments change type between calls</td><td>11</td></tr>
<tr><td>Its tests check something besides the return value</td><td>6</td></tr>
</tbody>
</table></div>

<h3>Starters</h3>
<p>
  <code>lib/polyglot/starters.ts</code> turns the signature into starter code for 13 languages: the
  six graded ones plus TypeScript, Java, Go, Rust, Kotlin, Swift and C#. Each starter declares the
  function with the right types, returns a zero value of the return type, and names the call the
  tests will make. Ruby and Rust get snake_case names. Lua's starter warns that its tables start at 1.
  The C starter adds a length after each array argument and a <code>returnSize</code> pointer when it
  returns an array. A list of integers comes out like this:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Language</th><th>A list of integers</th></tr></thead>
<tbody>
<tr><td>TypeScript</td><td><code>number[]</code></td></tr>
<tr><td>Python</td><td><code>list[int]</code></td></tr>
<tr><td>C++</td><td><code>vector&lt;int&gt;</code></td></tr>
<tr><td>C</td><td><code>int*</code> plus a length</td></tr>
<tr><td>Java, C#</td><td><code>int[]</code></td></tr>
<tr><td>Go</td><td><code>[]int</code></td></tr>
<tr><td>Rust</td><td><code>Vec&lt;i32&gt;</code></td></tr>
<tr><td>Kotlin</td><td><code>IntArray</code></td></tr>
<tr><td>Swift</td><td><code>[Int]</code></td></tr>
</tbody>
</table></div>
<p>
  Java, Go, Rust, Kotlin, Swift and C# get a starter but no grading, because nothing runs them in
  the browser.
</p>

<h3>The marked-line harness</h3>
<p>
  <code>withHarness</code> in <code>lib/polyglot/grade.ts</code> appends a driver to the reader's code.
  For Python, Ruby, PHP and Lua it embeds the cases as data and loops over them. For C and C++ it
  writes one block per case, declaring each argument as a literal of the right type, because those
  languages have no JSON parser to lean on. Every case prints one line: the marker
  <code>@@groundwork-case@@</code>, then a JSON array of test index, case index, the value returned,
  and the error message if the call threw.
</p>
<p>
  While the run streams, the workspace takes any console line that starts with the marker out of the
  output and keeps it as a row. The reader's own prints still appear. When the run ends,
  <code>gradeResults</code> checks every case of every test. Numbers match within a relative
  tolerance of one in a million, so <code>0.1 + 0.2</code> passes. A missing row means the call
  crashed or ran out of time, and the message says so. A test passes only when every one of its cases
  does.
</p>
<p>
  C is the strictest. <code>canGrade</code> accepts it only when every argument and the return
  value are a number, a boolean, a string, or a flat array that is not of strings. That holds for 155
  of the 222 recordable exercises.
</p>

<h3>Solved</h3>
<p>
  <code>finishTests</code> marks a problem solved when there is at least one result and every one
  passed. <code>progress.setExerciseSolved</code> writes it to localStorage, adds to today's activity
  count the first time, and notifies anything subscribed to progress. Then two things fire.
</p>
<ul>
<li><strong>Confetti</strong> appends 60 spans in five theme colours, each with a random fall time between 1.6 and 2.8 seconds, a drift of up to 80 pixels either way and a spin, and clears them after 3.2 seconds. It does nothing when the reader prefers reduced motion.</li>
<li><strong>A ding</strong> from <code>lib/sound.ts</code>: two sine tones made with the Web Audio API, 880 Hz and then 1,318.5 Hz 90 ms later, each fading out within a third of a second. No audio file is downloaded. A button in the top bar mutes it, and the choice is saved.</li>
</ul>
<p>
  In the mock interview the same results are reported upward instead, as passed, total, hints used
  and whether the solution was seen.
</p>

<h3>React component exercises</h3>
<p>
  A component needs a DOM, so the 99 component exercises run in an iframe rather than a worker.
  <code>scripts/build-react-sandbox.mjs</code> uses esbuild to bundle
  <code>lib/reactSandbox/runtime.ts</code>, React 19 and a small testing library in
  <code>lib/reactSandbox/dom.ts</code> into one minified IIFE, <code>public/wasm/react-sandbox.js</code>,
  205,306 bytes. It runs before every dev start and build, so the file always matches the source.
</p>
<p>
  <code>lib/reactRunner.ts</code> compiles the reader's JSX and the tests with TypeScript, inserting
  the loop guard, then creates an iframe with <code>sandbox="allow-scripts"</code> and a
  <code>srcdoc</code> that loads the bundle. The sandbox posts <code>ready</code>; the runner posts the
  compiled source; the sandbox runs it with 55 names passed in as function parameters and posts
  console lines and results back.
</p>
<p>
  Those 55 names are the test environment. They include React's hooks and helpers,
  <code>render</code>, <code>renderHook</code>, <code>cleanup</code>, a <code>screen</code> object with
  42 queries (seven ways to find an element, such as role, label text and placeholder, each in the
  get, getAll, query, queryAll, find and findAll forms), <code>within</code>, user events such as
  <code>click</code>, <code>type</code>, <code>selectOption</code> and <code>tab</code>,
  <code>waitFor</code> with a 1,500 ms default, and <code>mockFetch</code> with
  <code>jsonResponse</code>. The names follow Testing Library's, so the tests read like the ones readers
  will write at work.
</p>
<p>
  Each test starts by rendering and removing a throwaway button, then runs its body, then calls
  <code>cleanup</code>, which unmounts the root, empties the container and puts the real
  <code>fetch</code> back. Rendering goes through <code>flushSync</code> and rethrows errors caught
  by React's root, so a component that throws while rendering fails the test at that line. Links and
  form submits are cancelled so a test cannot navigate the frame away. Pressing Run instead of Submit
  skips the tests and mounts the reader's <code>App</code> in the preview pane.
</p>

<div class="bx is-ref">
<span class="ttl">The grader has its own tests</span>
<p>
  <code>tests/polyglot.test.ts</code> has 15 cases. The most important records every exercise, calls
  each recordable one's reference solution with every recorded case, and requires the recorded answer
  back. It also requires at least 200 exercises to be recordable. A recorder change that would mark
  correct answers wrong fails the test suite instead of a reader's afternoon.
</p>
</div>`,
};
