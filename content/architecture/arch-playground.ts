import type { Chapter } from "../types";

export const archPlayground: Chapter = {
  id: "arch-playground",
  num: "I5",
  title: "An editor inside a web page",
  short: "The editor",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "CodeMirror, a worker full of tools, files that live in localStorage, and links that carry code.",
  body: `<h3>One component, three jobs</h3>
<p>
  The playground, every problem page and the mock interview room all render the same component,
  <code>components/practice/PracticeWorkspace.tsx</code>. At 1,735 lines it is the second-largest component in
  the repository, after the whiteboard, and it decides its shape from two flags. With <code>isFree</code> set and no interview it
  is the playground: a project of files, a Live switch, share links and run history. Without it, it is
  a problem page, with a brief on the left (Description, Tests and Hints tabs), a Submit button and
  the solved state. Inside the mock interview it drops the navigation, the saved code and the
  debugger.
</p>
<p>
  Under the editor sits one output panel with up to seven tabs: Console, Debug, Problems, History,
  Input, Preview and Test Result. Which ones appear depends on the mode. History, Input and Preview
  belong to the playground; Test Result belongs to problems; Debug appears only after a debug run.
  On problem pages a drag handle resizes the editor between 220 and 900 pixels, and the height is
  saved.
</p>

<h3>CodeMirror, assembled by hand</h3>
<p>
  The editor is CodeMirror 6 through <code>@uiw/react-codemirror</code>, with
  <code>basicSetup={false}</code>. <code>components/practice/CodeEditor.tsx</code> lists every extension
  itself: line numbers, history, bracket matching and closing, autocompletion, folding, rectangular
  selection, search in a top panel, selection-match highlighting, and the inline-results field from
  <code>lib/editor/inline.ts</code>.
</p>
<p>
  Anything that can change after the editor exists goes in a <strong>compartment</strong>, and there are
  seven: language, lint, wrap, tab size, indent guides, Vim and minimap. Changing a setting
  reconfigures one compartment in a single transaction, so the document, the undo history and the
  cursor all survive. Vim keys and the minimap are dynamic imports; nobody downloads them until they
  are switched on.
</p>
<p>
  Language support is lazy as well. <code>lib/codeLanguages.ts</code> knows 17 languages, and each
  entry has a <code>support()</code> function that imports its grammar only when that language is
  picked. Twelve use a Lezer grammar package. Kotlin, Swift, C#, Ruby and Lua use CodeMirror's legacy
  stream modes, wrapped in <code>StreamLanguage.define</code>.
</p>

<h3>The tools worker</h3>
<figure>
<svg viewBox="0 0 900 320" class="dg" role="img" aria-label="The editor on the main thread posts numbered requests to the tools worker, which formats with Prettier, lints with ESLint, type-checks TypeScript and instruments code for the debugger, and posts replies matched by the same number.">
<g class="rough">
<rect x="24" y="30" width="360" height="260" rx="12" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="516" y="30" width="360" height="260" rx="12" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<path class="ln" d="M384 124 H510" marker-end="url(#arrow)" />
<path class="ln" d="M516 204 H390" marker-end="url(#arrow)" />
</g>
<text class="sm" x="44" y="58">MAIN THREAD</text>
<text class="lbl" x="44" y="92">CodeMirror 6 editor</text>
<text class="sm" x="44" y="122">lint: 500 ms after typing stops</text>
<text class="sm" x="44" y="146">format: Shift+Alt+F, or on save</text>
<text class="sm" x="44" y="170">fix: from the command palette</text>
<text class="sm" x="44" y="194">instrument: the Debug button</text>
<text class="sm" x="44" y="236">a reply for text that has since</text>
<text class="sm" x="44" y="258">changed is thrown away</text>
<text class="sm gr" x="536" y="58">TOOLS WORKER</text>
<text class="lbl" x="536" y="92">lib/editor/toolsWorker.ts</text>
<text class="sm" x="536" y="122">format: Prettier, babel or typescript</text>
<text class="sm" x="536" y="146">lint JavaScript: ESLint, 48 rules</text>
<text class="sm" x="536" y="170">lint TypeScript: strict type check</text>
<text class="sm" x="536" y="194">fix: ESLint autofix</text>
<text class="sm" x="536" y="218">instrument: debugger rewrite</text>
<text class="sm" x="536" y="258">each library loads on first use</text>
<text class="sm" x="450" y="112" text-anchor="middle">request, id n</text>
<text class="sm" x="450" y="226" text-anchor="middle">reply, id n</text>
</svg>
<figcaption>
  Formatting, linting and type-checking are CPU work on the whole document. Doing them in a worker
  means a slow lint never delays a keystroke.
</figcaption>
</figure>
<p>
  <code>lib/editor/tools.ts</code> owns one module worker and a map of pending promises keyed by a
  counter. Each call posts <code>{ id, type, code, lang }</code>, and the reply resolves whichever
  promise has that id. The worker answers four request types.
</p>
<ul>
<li><strong>format</strong> imports Prettier's standalone build with the estree plugin and either the babel or the typescript parser, formats at a print width of 100 with the chosen tab width, and hands back the new cursor position so the caret stays where it was.</li>
<li><strong>lint</strong> for JavaScript runs <code>eslint-linter-browserify</code> with a flat config of 48 rules: 34 errors, 13 warnings and one turned off. The globals include the browser, worker and ES2021 sets, plus the site's own <code>assert</code>, <code>compare</code>, <code>readline</code> and <code>__loopGuard</code>. Where ESLint offers a fix, the diagnostic carries a Fix action.</li>
<li><strong>lint</strong> for TypeScript is not ESLint at all. It builds a real <code>ts.createProgram</code> over an in-memory host with <code>strict: true</code>, fetching the 46 lib files from <code>/wasm/typescript-lib/</code>, and reports syntactic and semantic diagnostics with their <code>ts(code)</code> numbers.</li>
<li><strong>instrument</strong> rewrites code for the step debugger, which has its own chapter.</li>
</ul>
<p>
  The lint source waits for the browser to go idle before its first request (up to two seconds), so
  loading ESLint does not compete with the page's own start-up. After every reply it checks that the
  document and the language are still the ones it sent. If not, it returns nothing rather than
  painting squiggles on the wrong text. Formatting does the same check before it replaces the
  document.
</p>

<h3>Settings</h3>
<p>
  <code>lib/editor/settings.ts</code> holds eight settings, saved together under one localStorage key
  and merged over the defaults on load, so a setting added later still gets a value.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Setting</th><th>Default</th><th>What it does</th></tr></thead>
<tbody>
<tr><td>formatOnSave</td><td>on</td><td>Cmd/Ctrl+S runs Prettier first, for JavaScript and TypeScript</td></tr>
<tr><td>runOnSave</td><td>off</td><td>Cmd/Ctrl+S also runs the code</td></tr>
<tr><td>lint</td><td>on</td><td>ESLint or the type checker as you type</td></tr>
<tr><td>vim</td><td>off</td><td>Loads <code>@replit/codemirror-vim</code></td></tr>
<tr><td>minimap</td><td>off</td><td>Loads <code>@replit/codemirror-minimap</code></td></tr>
<tr><td>indentGuides</td><td>on</td><td>Indentation markers</td></tr>
<tr><td>wrap</td><td>off</td><td>Line wrapping</td></tr>
<tr><td>tabSize</td><td>2</td><td>2 or 4; anything else saved is read back as 2</td></tr>
</tbody>
</table></div>
<p>
  Text size (11 to 24 pixels, starting at 14.5) and fullscreen are component state, not settings, so
  they reset on reload.
</p>

<h3>The command palette</h3>
<p>
  Cmd/Ctrl+Shift+P or F1 opens <code>CommandPalette.tsx</code>. It holds 20 fixed commands (run,
  save, format, fix, next problem, go to line, find, fold, unfold, the view toggles, Vim, lint, the two
  on-save switches, indent size, text size and fullscreen), three file commands in the playground,
  and one command per language. That makes 40 in the playground and 35 on a problem page, where HTML
  and CSS are not offered. Matching is a small scoring function: a direct substring scores
  1,000 minus its position, and a scattered subsequence scores 500 minus the gaps between letters, so
  "fmt" still finds "Format document".
</p>

<h3>Files and tabs</h3>
<p>
  The playground is a project, defined in <code>lib/playgroundProject.ts</code>: a list of files, each
  with an id, a name, a language and its code, plus the id of the active one. It lives in localStorage
  under <code>groundwork:playground:project</code>. Typing saves it 300 ms after the last keystroke;
  Cmd/Ctrl+S saves at once. A project that fails validation is replaced by a fresh one, and a first
  load gathers any code saved by the older one-file-per-language playground into tabs, so nobody lost
  work when files arrived.
</p>
<p>
  Names are kept unique by adding <code>-2</code>, <code>-3</code> and so on. Renaming a file to a new
  extension switches its language, because <code>langForName</code> looks the extension up in the same
  17-language table. Opening the HTML quick language creates <code>index.html</code> with a
  <code>style.css</code> and a <code>script.js</code> beside it when they are missing.
</p>
<p>
  Closing a file that has code in it asks first. A file counts as touched when it is not empty and is
  not exactly one of the 28 starter templates. Closed files can be brought back with Reopen for ten
  seconds.
</p>

<h3>Modals</h3>
<p>
  New file, rename and every confirmation use <code>components/Modal.tsx</code>, which wraps the
  native <code>&lt;dialog&gt;</code> element and opens it with <code>showModal()</code>. The browser
  then provides the focus trap, the Escape key and the inert page behind it; a click on the backdrop
  closes it too. <code>ConfirmDialog</code> puts focus on Cancel, so pressing Enter by reflex does not
  delete anything. <code>NameDialog</code> trims names to 60 characters and validates as you type.
</p>
<p>
  <code>components/practice/FileDialogs.tsx</code> builds the two file dialogs on top. New file shows
  all 17 languages as a radio group and a live hint such as "Creates scratch.py, Python, runs here". A
  typed extension wins over the picked language. Rename selects the name up to the extension and says
  whether the new extension will switch the language. Both refuse slashes, a name that starts with a
  dot, and a name another file already has, compared without case.
</p>

<h3>Share links</h3>
<p>
  Share packs every file as a <code>[name, language, code]</code> triple, turns it into JSON,
  compresses it with the browser's own <code>CompressionStream("deflate-raw")</code>, and writes it as
  base64url into the fragment: <code>/practice?id=free#share=…</code>. The fragment never reaches a
  server, so a shared program is stored nowhere except in the link. A link longer than 60,000
  characters is refused as too big.
</p>
<p>
  Opening a link reads it defensively in <code>lib/shareLink.ts</code>: at most 20 files, names cut to
  60 characters, code to 200,000, and unknown languages dropped. The shared files are added as new
  tabs next to the reader's own, and the fragment is removed from the address bar.
</p>

<h3>Run history, Live mode and inline results</h3>
<p>
  Every playground run of a runnable file is recorded by <code>lib/runHistory.ts</code>: the time, the
  file, its code, the duration, whether anything was logged as an error, and the first output line cut
  to 80 characters. The newest 15 are kept in localStorage. The History tab reads them through
  <code>useSyncExternalStore</code>, with a snapshot cached by the raw string so React sees a stable
  value. "Open this code" brings an old run back as a new tab.
</p>
<p>
  Live mode, for JavaScript, TypeScript, HTML and CSS, runs the code 700 ms after typing stops. After
  any run in JavaScript, Python, Ruby, Lua, C or C++, <code>groupByLine</code> folds the console output
  into one result per source line and <code>showInline</code> draws it at the end of that line as a
  CodeMirror widget: the text cut to 90 characters, a count such as <code>×3</code> when the line ran
  more than once, and errors taking priority over logs.
</p>
<p>
  Each runtime finds the line differently. The JavaScript worker records the stack line of a marker
  call placed just above the reader's code and subtracts it from each <code>console.log</code>'s stack
  line. Python's <code>print</code> walks up the frames to the reader's file. Ruby's
  <code>puts</code> reads <code>caller_locations</code>. Lua's <code>print</code> asks
  <code>debug.getinfo</code>. Those three put an invisible <code>\\x02line\\x03</code> marker in
  front of each printed line, which the worker strips before display. In C and C++ only compiler
  diagnostics carry a line. TypeScript and PHP get no inline results.
</p>

<h3>The web preview</h3>
<p>
  Running an HTML file, or a stylesheet or script one links to, calls <code>buildPage</code> in
  <code>lib/webPreview.ts</code>. It replaces each <code>&lt;link href&gt;</code> and
  <code>&lt;script src&gt;</code> that names a project file with the file's contents inline, escaping
  any closing tag inside them, and puts a small bridge script at the top of the head. The bridge
  forwards <code>console</code> calls, errors, unhandled rejections and the load event to the parent
  with <code>postMessage</code>. The page renders in an iframe with <code>srcdoc</code> and
  <code>sandbox="allow-scripts allow-modals allow-forms"</code>. The parent accepts a message only when
  it carries the preview's tag and comes from that iframe's window.
</p>

<div class="bx is-ref">
<span class="ttl">Where the reader's work lives</span>
<p>
  Nothing in this chapter talks to a server. Files, settings, run history and standard input are in
  localStorage; a share link carries its code in the fragment. That keeps the editor free to run and
  impossible to leak from, and it means clearing site data clears the playground. The
  <code>/problems/[slug]/cases</code> file for grading other languages is the one exception, and it
  is a static file made at build time.
</p>
</div>`,
};
