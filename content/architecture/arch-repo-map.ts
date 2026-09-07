import type { Chapter } from "../types";

export const archRepoMap: Chapter = {
  id: "arch-repo-map",
  num: "B3",
  title: "Where everything lives",
  short: "Where things live",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "Nine directories, and the rule each one follows.",
  body: `<h3>The map</h3>
<div class="table-scroll"><table>
<thead><tr><th>Directory</th><th>What is in it</th><th>The rule</th></tr></thead>
<tbody>
<tr><td><code>app/</code></td><td>Routes. One folder per topic, plus <code>[chapter]</code> under each, plus the four API routes</td><td>Pages are server components unless they need the browser</td></tr>
<tr><td><code>content/</code></td><td>Every word on the site, as typed TypeScript</td><td>One file per chapter, gathered by a barrel per topic</td></tr>
<tr><td><code>components/</code></td><td>Shared UI. <code>reader/</code> for the chapter view, <code>practice/</code> for the playground</td><td>A component marked <code>"use client"</code> must earn it</td></tr>
<tr><td><code>lib/</code></td><td>The logic with no markup: content access, storage, the runners, formatting</td><td><code>lib/content.ts</code> is the only thing that reads <code>content/</code></td></tr>
<tr><td><code>public/wasm/</code></td><td>Pyodide, sql.js and the TypeScript lib files</td><td>Copied in by a prebuild script, never edited by hand</td></tr>
<tr><td><code>scripts/</code></td><td>Build-time helpers</td><td>Node scripts, run by npm lifecycle hooks</td></tr>
<tr><td><code>tests/</code></td><td>Vitest — content integrity</td><td>Tests the data, not the components</td></tr>
<tr><td><code>e2e/</code></td><td>Playwright — smoke and accessibility</td><td>Real browser, production build</td></tr>
<tr><td><code>docs/</code></td><td>The roadmap and audits</td><td>Not shipped to readers</td></tr>
</tbody>
</table></div>

<h3>The content directory in detail</h3>
<p>
  This is where nearly all the bytes are, and it has a shape worth knowing. A topic with chapters is
  a directory of per-chapter files plus a barrel that assembles them:
</p>
<pre><code>content/
  dsa-notes.ts          &larr; barrel: meta, hero, and the chapter order
  dsa/
    dsa-complexity-analysis.ts
    dsa-arrays-strings.ts
    ...34 files
  practice.ts           &larr; barrel over the exercise groups
  practice/
    js-fundamentals.ts
    dsa-1.ts ... dsa-8.ts
    js-applied.ts
  topics.ts             &larr; the shelf: topics, levels, syllabus
  types.ts              &larr; every content type</code></pre>

<p>
  It did not start that way. Four files had grown past the point where an editor is comfortable —
  the exercises were 840 KB in one file, the DSA notes 626 KB, system design 577 KB and the
  JavaScript notes 306 KB. They were split by walking the TypeScript AST and moving each chapter's
  <em>source text</em> into its own file, so the formatting survived and the assembled data came out
  byte-for-byte identical to what it had been.
</p>

<div class="bx is-ref">
<span class="ttl">Why the split had to be textual</span>
<p>
  The obvious way to split a data file is to import it, then write each piece back out as JSON. That
  would have turned 600 KB of readable HTML bodies, written as template literals with real
  newlines, into one escaped line each — making the files worse rather than better, while fixing the
  size. Moving the source text instead keeps every line where the author put it.
</p>
</div>

<h3>Two files that are still large</h3>
<p>
  <code>content/interview-data.ts</code> is 429 KB and <code>content/topics.ts</code> is 165 KB.
  Both are deliberate: the interview book has its own record shape rather than the chapter shape,
  and the topics file is one object describing the whole shelf. Both are ignored by Prettier,
  because formatting them produces a four-thousand-line diff that changes nothing a reader sees.
</p>`,
};
