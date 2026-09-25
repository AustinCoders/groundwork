import type { Chapter } from "../types";

export const archRuntimes: Chapter = {
  id: "arch-runtimes",
  num: "I6",
  title: "Eleven languages, no server",
  short: "The runtimes",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Three workers, two iframes, one database on the main thread, and a C compiler that downloads itself.",
  body: `<h3>Runnable and write-only</h3>
<p>
  <code>lib/codeLanguages.ts</code> is the single list of languages the editor knows. It has 17
  entries, and each one either names a <code>RunnableKind</code> or sets <code>runnable: null</code>.
  There are ten kinds: <code>js</code>, <code>ts</code>, <code>python</code>, <code>sql</code>,
  <code>web</code>, <code>ruby</code>, <code>php</code>, <code>lua</code>, <code>c</code> and
  <code>cpp</code>. HTML and CSS share <code>web</code>, so eleven languages run and six are write-only:
  Java, Go, Rust, Kotlin, Swift and C#. The language menus group them under "Runs here" and "Write
  only", and pressing Run on a write-only file prints a sentence saying no compiler for it runs in a
  browser, instead of failing silently.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Languages</th><th>Where the code runs</th><th>Runtime</th></tr></thead>
<tbody>
<tr><td>JavaScript</td><td>Module worker, <code>lib/jsWorker.ts</code></td><td>The browser's own engine</td></tr>
<tr><td>TypeScript</td><td>Compiled on the main thread, then the same worker</td><td>The <code>typescript</code> 5.9.3 package</td></tr>
<tr><td>Python</td><td>Module worker, <code>lib/pyodideWorker.ts</code></td><td>Pyodide 314.0.6</td></tr>
<tr><td>SQL</td><td>The main thread</td><td>sql.js 1.14.2 (SQLite)</td></tr>
<tr><td>Lua</td><td>Module worker, <code>lib/scriptWorker.ts</code></td><td>wasmoon 1.16.0 (Lua 5.4)</td></tr>
<tr><td>Ruby</td><td>The same script worker</td><td>ruby.wasm 2.10.1 (Ruby 3.4)</td></tr>
<tr><td>PHP</td><td>The same script worker</td><td>php-wasm 0.1.0</td></tr>
<tr><td>C, C++</td><td>The same script worker</td><td>YoWASP clang 22.0.0-git plus a WASI shim</td></tr>
<tr><td>HTML, CSS</td><td>A sandboxed iframe</td><td>The browser</td></tr>
<tr><td>React components</td><td>A sandboxed iframe</td><td><code>public/wasm/react-sandbox.js</code></td></tr>
</tbody>
</table></div>

<figure>
<svg viewBox="0 0 900 400" class="dg" role="img" aria-label="The page on the main thread hands code to three workers and two iframes. The Pyodide worker and the script worker download their runtimes from jsDelivr on first use. SQL runs on the main thread.">
<g class="rough">
<rect x="24" y="150" width="230" height="100" rx="12" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="330" y="14" width="300" height="60" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="330" y="90" width="300" height="60" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="330" y="166" width="300" height="60" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="330" y="242" width="300" height="60" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="330" y="318" width="300" height="60" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="700" y="92" width="176" height="136" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--ink); stroke-width: 1.6" />
<path class="ln" d="M254 200 C292 200 292 44 324 44" marker-end="url(#arrow)" />
<path class="ln" d="M254 200 C300 200 300 120 324 120" marker-end="url(#arrow)" />
<path class="ln" d="M254 200 C300 200 300 196 324 196" marker-end="url(#arrow)" />
<path class="ln" d="M254 200 C300 200 300 272 324 272" marker-end="url(#arrow)" />
<path class="ln" d="M254 200 C292 200 292 348 324 348" marker-end="url(#arrow)" />
<path class="ln" d="M630 120 H694" marker-end="url(#arrow)" />
<path class="ln" d="M630 196 C662 196 662 190 694 190" marker-end="url(#arrow)" />
</g>
<text class="sm" x="44" y="176">MAIN THREAD</text>
<text class="lbl" x="44" y="204">The page</text>
<text class="sm" x="44" y="228">SQL runs here, no worker</text>
<text class="lbl" x="348" y="40">JavaScript worker</text>
<text class="sm" x="348" y="62">JavaScript and TypeScript, 5 s</text>
<text class="lbl" x="348" y="116">Pyodide worker</text>
<text class="sm" x="348" y="138">Python, 20 s</text>
<text class="lbl" x="348" y="192">Script worker</text>
<text class="sm" x="348" y="214">Lua, Ruby, PHP, C, C++, 20 s</text>
<text class="lbl" x="348" y="268">React iframe</text>
<text class="sm" x="348" y="290">component exercises, 8 s</text>
<text class="lbl" x="348" y="344">Preview iframe</text>
<text class="sm" x="348" y="366">HTML and CSS pages</text>
<text class="lbl" x="788" y="124" text-anchor="middle">jsDelivr</text>
<text class="sm" x="788" y="148" text-anchor="middle">Pyodide, sql.js</text>
<text class="sm" x="788" y="170" text-anchor="middle">wasmoon, ruby.wasm</text>
<text class="sm" x="788" y="192" text-anchor="middle">php-wasm, clang</text>
<text class="sm" x="788" y="214" text-anchor="middle">loaded on first use</text>
</svg>
<figcaption>
  Every runtime is fetched the first time someone picks its language, and never before. The
  TypeScript lib files and the React sandbox are the exceptions: they are served from the site's
  own <code>/wasm/</code> folder.
</figcaption>
</figure>

<h3>The JavaScript worker</h3>
<p>
  <code>lib/runner.ts</code> first checks the syntax on the main thread by handing the code to
  <code>new Function</code>, so a missing bracket is reported before a worker is involved. It then
  builds one string: <code>'use strict'</code>, a results array, calls that set up standard input and
  tracing, a marker call used to work out line numbers, the reader's code, the tests, and a final
  <code>await __settle()</code>. The worker wraps that string in an async function and calls it.
</p>
<p>
  Before the first run the worker replaces <code>console.log</code>, <code>info</code>,
  <code>debug</code>, <code>warn</code> and <code>error</code>, plus <code>time</code>,
  <code>timeEnd</code>, <code>count</code>, <code>assert</code> and <code>table</code>. Each posts a
  formatted message straight away, so output streams while the code is still running. It also adds
  <code>readline()</code> and <code>prompt()</code>, which read the Input tab one line at a time, and
  <code>compare()</code>, a small benchmark that prints a table.
</p>
<p>
  <strong>Settling.</strong> A program that calls <code>setTimeout</code> is not finished when its
  last line returns. The worker wraps <code>setTimeout</code> and <code>setInterval</code> to keep
  sets of pending ids, and <code>__settle</code> keeps yielding a zero-delay tick until both sets are
  empty. Only then is <code>done</code> posted. An interval that is never cleared keeps the run open
  until the timeout ends it. The same worker is reused for the next
  run, so it clears any timers the previous run left behind before it starts.
</p>
<p>
  <strong>The timeout.</strong> The runner starts a five-second timer beside every run. If
  <code>done</code> has not arrived, it calls <code>worker.terminate()</code>, forgets the worker and
  prints "stopped after 5s". The next run makes a fresh one. This is the whole defence against
  <code>while (true) {}</code>: a worker can be killed from outside no matter what it is doing, and
  the page's own thread never ran the loop. Stop uses the same path.
</p>

<h3>The loop guard, and why only React has one</h3>
<p>
  React component exercises cannot use a worker, because they need a real DOM. They run in an iframe,
  and an iframe can share the page's thread, so an endless loop there could stop the parent's timer
  from ever firing. <code>lib/reactSource.ts</code> therefore compiles the reader's JSX with a
  TypeScript transformer that inserts <code>__loopGuard()</code> at the top of every
  <code>while</code>, <code>do</code>, <code>for</code>, <code>for…in</code> and <code>for…of</code>
  body. The guard counts calls and, every 2,000 of them, checks the clock. After three seconds of one
  test it throws "a loop ran for more than 3s", which fails the test instead of freezing the tab. Each
  test resets it. The outer eight-second timer still removes the iframe if anything else hangs.
</p>

<h3>TypeScript</h3>
<p>
  <code>transpileTS</code> imports the <code>typescript</code> package on first use. It transpiles
  with <code>transpileModule</code> to ES2020, then type-checks with a real program over an in-memory
  compiler host, with <code>lib.es2020.d.ts</code> and <code>lib.webworker.d.ts</code> as its libraries.
  The host reads from 46 declaration files, 1,045,209 bytes in all, which
  <code>scripts/copy-wasm-assets.mjs</code> copies from <code>node_modules</code> into
  <code>public/wasm/typescript-lib/</code> before every dev start and build. A type error stops the
  run with a compile error. The compiled JavaScript then goes through the same worker as above.
</p>

<h3>Python</h3>
<p>
  The Pyodide worker imports <code>pyodide.mjs</code> straight from jsDelivr with
  <code>webpackIgnore</code>, so the bundler leaves the URL alone. On load it points standard output
  and standard error at <code>postMessage</code>, then runs two short Python preludes of its own. One
  replaces <code>print</code> so each line carries its source line number and adds a Python
  <code>compare()</code>. The other defines the tracer the debugger uses. <code>input()</code> reads
  from the Input tab.
</p>
<p>
  The first run prints "loading the Python runtime" while the download happens. The loaded
  interpreter then stays in the worker, and code runs in its global namespace, so a name one run
  defines is still there in the next until the worker is replaced. The timeout is 20 seconds, and it
  starts when the code is sent, so on a slow connection the first download counts against it. A
  timeout terminates the worker, and the next run loads Pyodide again, from the browser's HTTP cache when it still has the files.
</p>

<h3>SQL</h3>
<p>
  <code>lib/sqlRunner.ts</code> is the odd one out: it runs on the main thread. It loads sql.js once,
  creates a new in-memory database for every run, executes the whole script, turns each result set
  into a table in the console, and closes the database. Every run starts from nothing. There is no
  worker and no timeout, which is acceptable because SQLite on a database that only exists for one
  script finishes quickly. A recursive query that never ends would freeze the tab. That is a known
  gap.
</p>

<h3>The script worker: Lua, Ruby, PHP, C and C++</h3>
<p>
  Five languages share one worker and a map of engines, each created on first use.
</p>
<ul>
<li><strong>Lua</strong> uses wasmoon. Each run gets a new Lua state, a prelude that makes <code>print</code> report its line through <code>debug.getinfo</code>, and an <code>io.read</code> that reads the Input tab.</li>
<li><strong>Ruby</strong> compiles the ruby.wasm module once with <code>WebAssembly.compileStreaming</code>, then starts a new VM for every run. A prelude redefines <code>puts</code>, <code>p</code> and <code>gets</code>. The reader's code is evaluated with the file name <code>eval</code>, so errors come back with real line numbers.</li>
<li><strong>PHP</strong> creates a new <code>PhpWeb</code> for every run and adds <code>&lt;?php</code> if the reader left it off. php-wasm expects a page, so the worker first installs a stub <code>window</code> and <code>document</code> with just enough methods for it to start. PHP does not read the Input tab.</li>
<li><strong>C and C++</strong> compile with clang running as WebAssembly. C uses <code>-O1 -std=c17 -lm</code>; C++ uses <code>-O1 -std=c++20 -fno-exceptions</code> and gets a generated <code>bits/stdc++.h</code> that includes 33 standard headers, so competitive-programming code compiles as written. Each diagnostic becomes a console line tied to its source line. The output, <code>main.wasm</code>, runs under <code>@bjorn3/browser_wasi_shim</code> 0.4.2, with the Input tab as standard input and line-buffered output. A non-zero exit status or a trap is reported as an error.</li>
</ul>
<p>
  The worker posts <code>started</code> when the reader's code actually begins. For C and C++ that is
  after compiling. The runner allows 180 seconds for downloading and compiling, then switches to the
  normal 20 seconds once <code>started</code> arrives, so a slow download does not count as an endless
  loop.
</p>

<h3>Warm-up</h3>
<p>
  Picking Lua, Ruby, PHP, C or C++ in the language menu calls <code>warmScript</code> at once. The
  worker starts downloading that engine before the reader has typed anything. For C and C++ it also
  compiles an empty <code>main</code> that includes a few common headers, so clang has loaded its
  resources before the reader's first compile needs them. If a load fails, the engine is removed from
  the map, so the next run tries again instead of waiting on a broken promise.
</p>

<h3>What gets downloaded</h3>
<p>
  Sizes measured from <code>node_modules</code> and from jsDelivr for the exact pinned versions. The
  compressed column is what jsDelivr sent with Brotli.
</p>
<div class="table-scroll"><table>
<thead><tr><th>File</th><th>Raw</th><th>Compressed</th></tr></thead>
<tbody>
<tr><td>Pyodide <code>pyodide.asm.wasm</code></td><td>9.6 MB</td><td>3.4 MB</td></tr>
<tr><td>Pyodide <code>python_stdlib.zip</code></td><td>2.5 MB</td><td>2.5 MB</td></tr>
<tr><td>Pyodide <code>pyodide.asm.mjs</code></td><td>1.3 MB</td><td>not measured</td></tr>
<tr><td>sql.js <code>sql-wasm.wasm</code></td><td>658 KB</td><td>323 KB</td></tr>
<tr><td>wasmoon <code>glue.wasm</code></td><td>272 KB</td><td>not measured</td></tr>
<tr><td>ruby.wasm <code>ruby+stdlib.wasm</code></td><td>30.6 MB</td><td>7.9 MB</td></tr>
<tr><td>php-wasm, the PHP 8.4 binary</td><td>13.8 MB</td><td>3.0 MB</td></tr>
<tr><td>clang <code>llvm.core.wasm</code></td><td>75.5 MB</td><td>19.4 MB</td></tr>
<tr><td>clang <code>llvm-resources.tar</code></td><td>29.7 MB</td><td>3.6 MB</td></tr>
<tr><td>TypeScript lib files, from the site</td><td>1.0 MB</td><td>not measured</td></tr>
<tr><td><code>react-sandbox.js</code>, from the site</td><td>205 KB</td><td>not measured</td></tr>
</tbody>
</table></div>
<p>
  The hints in the editor's status bar are older than these measurements. They say about 12 MB for the
  C compiler, and the real transfer is about 23 MB.
</p>

<h3>Timeouts at a glance</h3>
<div class="table-scroll"><table>
<thead><tr><th>Run</th><th>Limit</th><th>What happens at the limit</th></tr></thead>
<tbody>
<tr><td>JavaScript, TypeScript</td><td>5 s</td><td>Worker terminated and replaced</td></tr>
<tr><td>JavaScript debug run</td><td>8 s</td><td>Worker terminated and replaced</td></tr>
<tr><td>Python</td><td>20 s, including the first load</td><td>Worker terminated; Pyodide loads again</td></tr>
<tr><td>Lua, Ruby, PHP, C, C++</td><td>180 s to start, then 20 s</td><td>Worker terminated; every loaded engine goes with it</td></tr>
<tr><td>React component</td><td>3 s per loop, 8 s overall</td><td>Test fails, or the iframe is removed</td></tr>
<tr><td>SQL</td><td>none</td><td>Runs on the main thread</td></tr>
</tbody>
</table></div>

<h3>Sandboxing</h3>
<p>
  The boundaries are the ones the browser already enforces. Worker code has no DOM, no
  <code>document.cookie</code> and no localStorage, so it cannot read the reader's saved progress or
  change the page. Both iframes are sandboxed without <code>allow-same-origin</code>, so they get an
  opaque origin: the React one has <code>sandbox="allow-scripts"</code>, and the web preview adds
  <code>allow-modals</code> and <code>allow-forms</code>. The parent checks <code>event.source</code>
  on every message, so another frame cannot pretend to be the sandbox.
</p>
<p>
  The Content-Security-Policy in <code>next.config.ts</code> is built from the same constants.
  <code>wasmOrigins()</code> in <code>lib/wasmAssets.ts</code> returns the origins of the Pyodide,
  sql.js and npm CDN bases, and those are added to <code>script-src</code> and
  <code>connect-src</code>. The policy has to
  allow <code>'unsafe-eval'</code>, because running a reader's code with <code>new Function</code> is
  what this whole feature does.
</p>

<div class="bx is-ref">
<span class="ttl">What the sandbox does not stop</span>
<p>
  A worker runs with the site's origin, so code in it can still call <code>fetch</code> against the
  site's own endpoints and write to IndexedDB. That is the same power the reader already has in the
  devtools console of the same tab. Since the only code that runs is code the reader typed or opened
  from a link, the real risk is a share link carrying hostile code. A shared link opens as new tabs
  and waits for Run, with one exception: if Live mode is already on, shared JavaScript runs 700 ms
  after it appears, like any other edit.
</p>
</div>`,
};
