import type { Chapter } from "../types";

export const ecosystemProfessional: Chapter = {
  id: "ecosystem-professional",
  num: "A8",
  title: "Ecosystem & professional",
  short: "Ecosystem",
  levels: ["advanced"],
  practice: ["ex-flat-polyfill", "ex-ast-node-counter"],
  ready: true,
  subtitle: "The close-out — how the tools around JS actually work, and where the language itself comes from.",
  body: `<p>
  TypeScript and Node each have their own shelf on this site,
  reserved for exactly this kind of depth once they're written — this
  section stays brief on both, just enough to place them correctly
  next to plain JS. Testing gets a full chapter of its own, right
  after this one, because unlike the other two it's squarely inside
  what "advanced JavaScript" actually means day to day.
</p>

<h3>TypeScript and Node, briefly</h3>
<p>
  TypeScript adds a type system checked entirely at compile time and
  erased before anything runs — it's <b>structural</b>, meaning two
  differently-named types with the same shape are compatible, unlike
  languages that check by declared name. Generics, narrowing, and the
  built-in utility types (<code>Partial</code>, <code>Pick</code>,
  <code>Omit</code>) are where that gets interesting — reserved for
  <a href="/typescript">the TypeScript shelf</a> once it's written.
</p>
<p>
  Node extends JS past the browser with a filesystem, a process, and
  no DOM — streams, <code>cluster</code> (multi-process scaling across
  CPU cores), worker threads, and <code>AsyncLocalStorage</code>
  (request-scoped context that survives across
  <code>await</code>s without threading a parameter through every
  function) are the parts worth a real chapter — reserved the same way
  for <a href="/node">the Node shelf</a>.
</p>
<p class="sub">
  <a href="/notes/testing-in-js">The next chapter</a> covers testing in
  full: unit vs integration vs E2E, mocking, fake timers, and what
  coverage does and doesn't actually tell you.
</p>

<h3>What a bundler is actually doing: ASTs</h3>
<p>
  Every tool in this chapter — a bundler, a linter, a formatter, a
  minifier, a codemod — starts the exact same way:
  <b>parse the source into an Abstract Syntax Tree</b>, a plain nested
  object describing the code's structure, then walk and transform
  <em>that tree</em>, never the raw text itself.
</p>
<div class="try">
  <pre><code><span class="c">// A hand-built AST for: const x = 1 + 2;
     // Real parsers (Babel, Acorn) produce something like this automatically.</span>
const ast = {
  type: "VariableDeclaration",
  kind: "const",
  declarations: [{
    type: "VariableDeclarator",
    id: { type: "Identifier", name: "x" },
    init: {
      type: "BinaryExpression",
      operator: "+",
      left: { type: "Literal", value: 1 },
      right: { type: "Literal", value: 2 },
    },
  }],
};
console.log(JSON.stringify(ast.declarations[0].init, null, 2));</code></pre>
</div>
<p class="sub">
  That's genuinely close to what
  <a href="https://astexplorer.net">astexplorer.net</a> shows for the
  real thing — every operator, every identifier, every literal is its
  own typed node. Editing code programmatically (a <b>codemod</b>,
  the tool behind large automated migrations like a big React version
  bump across a whole codebase) means finding the right node type in
  this tree and swapping it, then printing the tree back out to text —
  never regex-replacing the source directly, which breaks the instant
  the pattern shows up somewhere the author didn't anticipate (inside a
  string, a comment, a different context entirely).
</p>
<p>
  A Babel <b>plugin</b> is exactly this walk-and-transform step,
  packaged: it's handed the AST, given a chance to visit specific node
  types (<code>ArrowFunctionExpression</code>,
  <code>ClassDeclaration</code>, …), and returns a modified tree that
  Babel then prints back to JS — this is the actual mechanism behind
  "transpile modern syntax down to something older browsers run."
</p>

<h3>Polyfills vs transpilation — two different problems</h3>
<p>
  These get bundled together in conversation constantly, and they fix
  genuinely different gaps.
</p>
<table>
  <tr>
    <th></th>
    <th>Transpilation</th>
    <th>Polyfill</th>
  </tr>
  <tr><td>Fixes a missing…</td><td><b>syntax</b> — arrow functions, optional chaining, classes</td><td><b>runtime feature</b> — <code>Array.prototype.flat</code>, <code>Promise</code>, <code>fetch</code></td></tr>
  <tr><td>How</td><td>rewrites your source into older-syntax equivalent code, before shipping</td><td>ships extra JS that <em>adds</em> the missing method/object at runtime, if it's not already there</td></tr>
  <tr><td>Can it be fixed at build time alone?</td><td class="tone-yes">yes — syntax is fully resolved before the browser ever sees it</td><td class="tone-bad">no — the feature has to actually exist in the running environment, one way or another</td></tr>
</table>
<p>
  <code>core-js</code> is the actual polyfill implementation most
  tooling pulls from; <b>browser targeting</b>
  (a <code>browserslist</code> config, shared by most of this
  toolchain) is what tells both the transpiler and the polyfill loader
  which engines actually need to be supported — the newer the target
  list, the less of either gets shipped, which is a direct, measurable
  bundle-size win for a team that can drop support for old browsers.
</p>

<h3>Reading the spec, and where new syntax comes from</h3>
<p>
  Every JS feature in every chapter on this site started as a TC39
  proposal and moved through five fixed stages before landing in the
  language:
</p>
<table>
  <tr>
    <th>Stage</th>
    <th>Means</th>
  </tr>
  <tr><td><b>0 — Strawperson</b></td><td>any committee member's idea, no formal backing yet</td></tr>
  <tr><td><b>1 — Proposal</b></td><td>the problem is real, worth solving, has a champion</td></tr>
  <tr><td><b>2 — Draft</b></td><td>real syntax and semantics written out</td></tr>
  <tr><td><b>3 — Candidate</b></td><td>spec-complete, feedback comes from real implementations, not just discussion</td></tr>
  <tr><td><b>4 — Finished</b></td><td>shipped in engines, included in the next yearly ECMAScript edition</td></tr>
</table>
<p class="sub">
  Optional chaining, nullish coalescing, and top-level await all went
  through exactly this pipeline before ever reaching a browser. The
  official spec (<a href="https://tc39.es/ecma262/">ecma262</a>) reads
  as dense, formal pseudocode — genuinely worth being able to skim once
  in a while, because it's the actual final authority any time a
  blog post's explanation of some edge case and the engine's real
  behavior disagree.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "When I hit a genuinely
  ambiguous edge case — something two blog posts explain differently —
  I check the spec or a quick <code>node -p</code>/console test rather
  than trust either post. This whole site was built the same way: every
  runnable claim in it was verified against a real engine first."
</div>`,
};
