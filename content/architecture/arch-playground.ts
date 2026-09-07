import type { Chapter } from "../types";

export const archPlayground: Chapter = {
  id: "arch-playground",
  num: "I5",
  title: "Running a reader's code",
  short: "The playground",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Four languages, a Web Worker, and no server involved at any point.",
  body: `<h3>The boundary</h3>

<figure>
<svg viewBox="0 0 900 300" class="dg" role="img" aria-label="The editor on the main thread posts code to a Web Worker, which runs it and posts back console output and test results. Python, SQL and TypeScript load WebAssembly runtimes on demand.">
<g class="rough">
<rect x="24" y="30" width="380" height="150" rx="12" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="496" y="30" width="380" height="150" rx="12" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="24" y="216" width="270" height="60" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="318" y="216" width="264" height="60" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="606" y="216" width="270" height="60" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<path class="ln" d="M404 82 H490" marker-end="url(#arrow)" />
<path class="ln" d="M490 132 H410" marker-end="url(#arrow)" />
</g>
<text class="sm" x="44" y="54">MAIN THREAD</text>
<text class="lbl" x="44" y="88">CodeMirror editor</text>
<text class="sm" x="44" y="112">the page stays responsive</text>
<text class="sm" x="44" y="136">while code runs</text>
<text class="sm gr" x="516" y="54">WEB WORKER</text>
<text class="lbl" x="516" y="88">Runs the code</text>
<text class="sm" x="516" y="112">console captured, tests run</text>
<text class="sm" x="516" y="136">terminated on timeout</text>
<text class="sm" x="447" y="72" text-anchor="middle">code</text>
<text class="sm" x="447" y="152" text-anchor="middle">output</text>
<text class="lbl" x="159" y="242" text-anchor="middle">Pyodide &middot; 15 MB</text>
<text class="sm" x="159" y="264" text-anchor="middle">only if you pick Python</text>
<text class="lbl" x="450" y="242" text-anchor="middle">sql.js &middot; 1.5 MB</text>
<text class="sm" x="450" y="264" text-anchor="middle">only if you pick SQL</text>
<text class="lbl" x="741" y="242" text-anchor="middle">TS lib &middot; 1.2 MB</text>
<text class="sm" x="741" y="264" text-anchor="middle">only for TypeScript</text>
</svg>
<figcaption>
  The worker boundary is not decoration. An infinite loop in a reader's code freezes the worker, not
  the page, and the runner can kill it — which is impossible if the code shares a thread with the UI.
</figcaption>
</figure>

<h3>What happens on Run</h3>
<ol>
<li>The editor's current text and the exercise's tests are posted to a module worker.</li>
<li>The worker replaces <code>console</code> with a version that posts each call back, formatted, so output streams as it happens rather than arriving at the end.</li>
<li>The tests run. Each one reports a name and a pass or fail.</li>
<li>A timeout runs alongside. If the code has not finished, the worker is <b>terminated</b> and a fresh one is created for the next run.</li>
</ol>
<p>
  That last step is the reason for the worker. There is no way to interrupt a synchronous infinite
  loop on the main thread — the tab locks and the reader force-quits it. Terminating a worker is
  immediate and costs nothing but the next start-up.
</p>

<h3>The four languages</h3>
<div class="table-scroll"><table>
<thead><tr><th>Language</th><th>How it runs</th><th>Loaded</th></tr></thead>
<tbody>
<tr><td>JavaScript</td><td>Directly in the worker</td><td>Always &mdash; it is the worker</td></tr>
<tr><td>TypeScript</td><td>Compiled in the browser, then run as JavaScript</td><td>Lib files on demand</td></tr>
<tr><td>Python</td><td>CPython compiled to WebAssembly</td><td>15 MB, on demand</td></tr>
<tr><td>SQL</td><td>SQLite compiled to WebAssembly</td><td>1.5 MB, on demand</td></tr>
</tbody>
</table></div>

<h3>Why nothing runs on a server</h3>
<p>
  Executing a stranger's code on your own machines means sandboxing, a queue, per-run limits, an
  abuse story and a bill that scales with use. Running it in the reader's own browser removes all of
  that at once: the sandbox is the one the browser already maintains, the compute is theirs, and the
  worst case for the site is a tab that has to be closed.
</p>

<div class="bx is-prim">
<span class="ttl">The cost that is paid instead</span>
<p>
  18 MB of WebAssembly in the deploy, and a playground page that downloads roughly 2.1 MB of
  JavaScript when the editor opens. Both are real, and both are paid by people who chose to open the
  playground rather than by every reader.
</p>
</div>`,
};
