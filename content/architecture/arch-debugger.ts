import type { Chapter } from "../types";

export const archDebugger: Chapter = {
  id: "arch-debugger",
  num: "I8",
  title: "Stepping through a run",
  short: "The debugger",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Record every statement once, then scrub through the recording as if it were live.",
  body: `<h3>A recording, not a live session</h3>
<p>
  A real debugger pauses a running program. A web page cannot pause code inside a worker, so the
  Debug button does something simpler that looks the same from the outside. It runs the program once
  from start to finish, records the line and the variables at every statement, and hands the whole
  recording to a panel that can move forwards and backwards through it. Stepping back costs nothing,
  because nothing is being re-run.
</p>
<p>
  Debug is offered for JavaScript, TypeScript and Python, on the playground and on problem pages, but
  not for React component exercises or inside the mock interview. On a problem page the reader's code
  usually only defines a function, and a trace of a definition is empty. So the workspace appends one
  call using the first recorded test case from <code>/problems/[slug]/cases</code>, which is why the
  button's tooltip says "Step through on the first test".
</p>

<figure>
<svg viewBox="0 0 900 350" class="dg" role="img" aria-label="JavaScript and TypeScript code is instrumented in the tools worker and run in the JavaScript worker; Python is traced with sys.settrace in the Pyodide worker. Both produce a trace of at most 2,000 steps, which the DebugPanel plays back while the editor highlights the current line.">
<g class="rough">
<rect x="24" y="40" width="170" height="80" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="250" y="40" width="190" height="80" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="496" y="40" width="190" height="80" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="250" y="160" width="436" height="70" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="742" y="90" width="134" height="100" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--ink); stroke-width: 1.8" />
<rect x="496" y="266" width="380" height="70" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="24" y="266" width="300" height="70" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<path class="ln" d="M194 80 H244" marker-end="url(#arrow)" />
<path class="ln" d="M440 80 H490" marker-end="url(#arrow)" />
<path class="ln" d="M686 80 C716 80 716 120 736 120" marker-end="url(#arrow)" />
<path class="ln" d="M109 120 C109 195 180 195 244 195" marker-end="url(#arrow)" />
<path class="ln" d="M686 195 C716 195 716 160 736 160" marker-end="url(#arrow)" />
<path class="ln" d="M809 190 V260" marker-end="url(#arrow)" />
<path class="ln" d="M496 301 H330" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="109" y="74" text-anchor="middle">Editor code</text>
<text class="sm" x="109" y="96" text-anchor="middle">JS, TS or Python</text>
<text class="lbl" x="345" y="68" text-anchor="middle">Tools worker</text>
<text class="sm" x="345" y="90" text-anchor="middle">instrument()</text>
<text class="sm" x="345" y="108" text-anchor="middle">TS then transpiled</text>
<text class="lbl" x="591" y="68" text-anchor="middle">JavaScript worker</text>
<text class="sm" x="591" y="90" text-anchor="middle">__t() per statement</text>
<text class="sm" x="591" y="108" text-anchor="middle">8 s limit</text>
<text class="sm" x="118" y="160">Python</text>
<text class="lbl" x="468" y="190" text-anchor="middle">Pyodide worker</text>
<text class="sm" x="468" y="212" text-anchor="middle">sys.settrace on the reader's code, 20 s limit</text>
<text class="lbl" x="809" y="126" text-anchor="middle">Trace</text>
<text class="sm" x="809" y="150" text-anchor="middle">at most</text>
<text class="sm" x="809" y="170" text-anchor="middle">2,000 steps</text>
<text class="lbl" x="686" y="296" text-anchor="middle">DebugPanel</text>
<text class="sm" x="686" y="318" text-anchor="middle">slider, step buttons, arrow keys</text>
<text class="lbl" x="174" y="296" text-anchor="middle">Editor line highlight</text>
<text class="sm" x="174" y="318" text-anchor="middle">setDebugLine, scrolled to centre</text>
</svg>
<figcaption>
  Two ways of capturing, one format for the result. The panel and the editor highlight do not know
  which language produced the trace.
</figcaption>
</figure>

<h3>Instrumenting JavaScript and TypeScript</h3>
<p>
  The tools worker receives an <code>instrument</code> request and passes the code to
  <code>lib/debug/instrument.ts</code>. That file uses the TypeScript compiler's own transformer API,
  so it works on a real syntax tree rather than on text. Before every statement it inserts a call to
  <code>__t</code> with two arguments: the statement's line number in the original source, and an
  arrow function that returns a getter for every name in scope. Nine kinds of statement are left
  alone because they do nothing when they run: function, class, interface, type alias, enum, module,
  import and export declarations, and empty statements.
</p>
<p>
  Every function, method and arrow function is also wrapped in <code>__enter(name)</code> and a
  <code>try</code>/<code>finally</code> that calls <code>__exit()</code>, which keeps a call stack for
  the trace. The name comes from the function itself, or from the variable or property it is assigned
  to. An arrow with an expression body becomes a block with a return statement, and a single-statement
  <code>if</code> or loop body becomes a block, so there is always somewhere to put the trace call.
  This is the real output for a small function, with one line shortened:
</p>
<pre><code>function sum(list) {
    __enter("sum");
    try {
        __t(2, () =&gt; ({ "sum": () =&gt; sum, "list": () =&gt; list, "total": () =&gt; total }));
        let total = 0;
        __t(3, () =&gt; ({ "sum": () =&gt; sum, "list": () =&gt; list, "total": () =&gt; total }));
        for (const n of list) {
            __t(3, () =&gt; ({ ..., "n": () =&gt; n }));
            total += n;
        }
        __t(4, () =&gt; ({ "sum": () =&gt; sum, "list": () =&gt; list, "total": () =&gt; total }));
        return total;
    }
    finally {
        __exit();
    }
}</code></pre>
<p>
  The scope is tracked while walking the tree: each block adds the names it declares (including
  destructured ones, functions and classes), each function adds its parameters, and each
  <code>for</code> adds its loop variables. TypeScript is instrumented first and transpiled after, so
  the types come off but the line numbers, which are plain number literals by then, stay.
</p>

<h3>Why getters, not values</h3>
<p>
  The trace call runs before <code>let total = 0</code>. Reading <code>total</code> at that moment
  throws, because the variable is in its temporal dead zone. If the rewrite built an object of
  values, the reader's program would crash on the first line. Instead each name is behind a getter,
  and the worker calls each getter inside its own <code>try</code>. A throw is recorded as
  <code>tdz</code>, and the panel leaves those out. Functions are dropped as well, so the panel shows
  data, not every helper in scope.
</p>

<h3>Capturing in the worker</h3>
<p>
  When the runner is asked to trace, it turns tracing on in the JavaScript worker before the reader's
  code starts. Each <code>__t</code> call converts every variable with <code>toView</code> from
  <code>lib/debug/view.ts</code> and pushes a step: the line, the function on top of the call stack
  (or "(top level)"), the stack depth and the variables. After 2,000 steps it stops recording and sets
  a truncated flag, but lets the program finish. While tracing, every console line is tagged with the
  number of steps recorded so far instead of a line number, which lets the panel show exactly what had
  been printed by any step. A debug run has an eight-second limit.
</p>

<h3>Tracing Python</h3>
<p>
  Python needs no rewriting, because it has a tracing hook built in. At load, the Pyodide worker runs
  a prelude that defines <code>_gw_trace_run</code>. It compiles the reader's code with the file name
  <code>&lt;exec&gt;</code> and installs a function with <code>sys.settrace</code>. The tracer ignores
  any frame from another file, so Python's own library code is never recorded. On each
  <code>line</code> event it records the frame's line number, the function name, the depth (counting
  only the reader's frames), and the frame's locals, leaving out names that start with an underscore
  and anything callable. A Python version of <code>toView</code> converts each value into the same
  shapes as the JavaScript one. When the run ends, even with an error, the steps are dumped to JSON
  and read back by the worker. The same 2,000-step cap applies, and the run keeps Python's 20-second
  limit.
</p>

<h3>Turning values into pictures</h3>
<p>
  <code>toView</code> turns a value into one of 15 shapes, and <code>DebugPanel.tsx</code> has a
  renderer for each. Detection is by structure, not by class name, so a reader's own
  <code>ListNode</code> class, a plain object literal and a Python class with the same fields all get
  the same picture.
</p>
<div class="table-scroll"><table>
<thead><tr><th>The value looks like</th><th>It is drawn as</th><th>Limit</th></tr></thead>
<tbody>
<tr><td>An object with a <code>next</code> field</td><td>A linked list: node values joined by arrows, ending in null, "…" or "back to the start" for a cycle</td><td>30 nodes</td></tr>
<tr><td>An object with <code>left</code> or <code>right</code></td><td>A binary tree of nested nodes, each shared node drawn once</td><td>7 levels</td></tr>
<tr><td>An array of arrays of primitives</td><td>A grid with numbered rows</td><td>40 per row</td></tr>
<tr><td>Any other array or tuple</td><td>Boxes with their indices underneath, then "+n" for the rest</td><td>40 items</td></tr>
<tr><td>A Set</td><td>A tagged row of boxes without indices</td><td>40 items</td></tr>
<tr><td>A Map or a dict</td><td>A two-column table</td><td>40 entries</td></tr>
<tr><td>Any other object</td><td>Its class name and a table of its fields</td><td>20 fields</td></tr>
<tr><td>A string, number, boolean, null, undefined or bigint</td><td>The value, coloured by type</td><td>60 characters</td></tr>
</tbody>
</table></div>
<p>
  A node's value is read from the first of <code>val</code>, <code>value</code>, <code>data</code> or
  <code>key</code> that exists. Nesting stops after three levels with "…", which keeps a deep
  structure from producing an enormous step.
</p>

<h3>The panel</h3>
<p>
  The panel shows a counter such as "step 7 / 42", with a plus sign when the trace was truncated,
  and under it the current line, the function it is in and, past the first level, how many calls
  deep it is. It has first, previous, next and last buttons, a range slider over
  every step, and the left and right arrow keys. Each variable is compared with the same variable in
  the previous step, and one that changed is marked, so the eye goes straight to what the last
  statement did. Under the variables, "Printed so far" lists only the output tagged at or before the
  current step.
</p>

<h3>Mapping a step back to the editor</h3>
<p>
  Every step already carries the reader's own line number. In JavaScript it was written into the code
  as a literal before anything ran, and in Python the tracer reads it from the frame of the reader's
  own file. No source map is needed. That is simpler than an ordinary run, where the worker has to
  work out a line by subtracting stack positions.
</p>
<p>
  When the step changes, the panel calls <code>onLine</code>. The workspace passes it to the editor's
  <code>showDebugLine</code>, which dispatches a <code>setDebugLine</code> effect. A state field in
  <code>lib/editor/inline.ts</code> turns it into a line decoration with the class
  <code>cm-debug-line</code>, and the same transaction scrolls that line to the middle of the view.
  Typing anything clears the highlight, because a highlighted line in edited code would point at the
  wrong statement. Leaving the Debug tab clears it too. The console lines of a debug run have their line
  numbers removed, so inline results do not compete with the highlight.
</p>

<div class="bx is-ref">
<span class="ttl">Tested without a browser</span>
<p>
  <code>tests/debug-trace.test.ts</code> has six cases that run instrumented code in Node with a stub
  <code>__t</code>. The first checks that a three-pass loop records lines 1, 2, 3, 3, 3 and 5 and still
  prints 6, which is the promise that matters most: tracing must never change what the program does.
</p>
</div>`,
};
