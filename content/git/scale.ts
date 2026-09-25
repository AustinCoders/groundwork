import type { GitSection } from "./types";

export const gitScale: GitSection = {
  id: "scale",
  num: "G13",
  title: "Scale and edge cases",
  short: "Scale & edge cases",
  subtitle:
    "What to reach for when the repository gets huge, the files get binary, and the team spans three operating systems.",
  body: `
<p>
  Git was built for the Linux kernel: many small text files and a long history. It stays fast well
  past that, but three things push it off the happy path. Large binaries, millions of files, and a
  team spread across Windows, macOS and Linux. This chapter is the toolkit for each.
</p>

<div class="table-scroll"><table>
<thead><tr><th>Problem</th><th>Reach for</th></tr></thead>
<tbody>
<tr><td>Large binaries: design files, videos, models</td><td><strong>Git LFS</strong>: pointers in Git, contents on a separate store</td></tr>
<tr><td>CI only needs the latest commit</td><td>Shallow clone, <code>--depth 1</code></td></tr>
<tr><td>Clone is slow because history is big</td><td>Partial clone, <code>--filter=blob:none</code></td></tr>
<tr><td>Huge monorepo, you work in one folder</td><td><code>git sparse-checkout set apps/web</code></td></tr>
<tr><td><code>git status</code> and <code>git log</code> are slow</td><td><code>git maintenance start</code>, commit-graph, fsmonitor</td></tr>
<tr><td>All of the above at once</td><td><code>scalar clone</code></td></tr>
<tr><td>A formatting commit clutters <code>blame</code></td><td><code>.git-blame-ignore-revs</code></td></tr>
</tbody>
</table></div>

<h3>Git LFS</h3>
<p>
  Git stores every version of every file forever, and binary files barely compress or delta against
  each other. Commit a 200 MB video ten times and every clone downloads about 2 GB, even people who
  never open it. Git LFS (Large File Storage) keeps a tiny text pointer in the repository and puts
  the real bytes on a separate server. You only download the versions you check out.
</p>

<figure>
<svg viewBox="0 0 900 330" class="dg" role="img" aria-label="How Git LFS moves a file. On git add, the clean filter replaces the 80 megabyte file with a small pointer that Git stores in history. On push, a pre-push hook uploads the real bytes to the LFS store. On checkout, the smudge filter reads the pointer and downloads the real file back into the working tree. The pointer has three lines: version, oid and size.">
<g class="rough">
<rect x="20" y="30" width="260" height="86" rx="12" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="620" y="30" width="260" height="86" rx="12" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="20" y="220" width="260" height="86" rx="12" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="380" y="196" width="500" height="120" rx="12" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<path class="ln" d="M70 116 V214" marker-end="url(#arrow)" />
<path class="ln" d="M230 220 V122" marker-end="url(#arrow)" />
<path class="ln" d="M280 58 H614" marker-end="url(#arrow)" />
<path class="ln" d="M620 96 H286" marker-end="url(#arrow)" />
<path class="ln dash" d="M280 263 H374" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="40" y="62">working tree</text>
<text class="sm" x="40" y="90">design.psd, the real 80 MB</text>
<text class="lbl" x="640" y="62">LFS store</text>
<text class="sm" x="640" y="90">real bytes, keyed by SHA-256</text>
<text class="lbl" x="40" y="252">Git history</text>
<text class="sm" x="40" y="280">a pointer of about 130 bytes</text>
<text class="sm" x="150" y="160" text-anchor="middle">clean on add</text>
<text class="sm" x="150" y="182" text-anchor="middle">smudge on checkout</text>
<text class="sm" x="450" y="48" text-anchor="middle">push: pre-push hook uploads</text>
<text class="sm" x="450" y="116" text-anchor="middle">checkout: smudge downloads</text>
<text class="lbl" x="400" y="226">the file Git actually stores</text>
<text class="sm" x="400" y="254">version https://git-lfs.github.com/spec/v1</text>
<text class="sm" x="400" y="276">oid sha256:4d7a2146…b39f0e</text>
<text class="sm" x="400" y="298">size 84213760</text>
</svg>
<figcaption>
  LFS works through Git's filter mechanism. The <em>clean</em> filter runs when a file enters the
  index, the <em>smudge</em> filter runs when it is written to your working tree, and a
  <code>pre-push</code> hook uploads new objects. Git itself only ever sees the pointer.
</figcaption>
</figure>

<pre><code>git lfs install
git lfs track "*.psd" "*.mp4"
git add .gitattributes
git add design.psd
git commit -m "Add hero artwork"
git lfs ls-files</code></pre>
<p>
  <code>git lfs install</code> is once per machine and registers the filters in your global config.
  <code>track</code> writes a line like <code>*.psd filter=lfs diff=lfs merge=lfs -text</code> into
  <code>.gitattributes</code>. Commit that file first, or the next person's clone won't know which
  files are LFS.
</p>
<h4>What goes wrong</h4>
<ul>
  <li><strong>Pointers instead of files.</strong> Someone cloned without LFS installed and sees a three-line text file where a PNG should be. Fix: <code>git lfs install</code>, then <code>git lfs pull</code>.</li>
  <li><strong>Binaries already in history.</strong> <code>track</code> only affects new commits. To move old ones, rewrite history with <code>git lfs migrate import --include="*.psd" --everything</code>, then force-push and have everyone re-clone.</li>
  <li><strong>Quotas.</strong> Hosts meter LFS storage and bandwidth separately from Git. A CI job that downloads every LFS file on every run can burn through a monthly quota. Cache the LFS directory, or skip what you don't need with <code>GIT_LFS_SKIP_SMUDGE=1</code> and <code>git lfs pull --include="path/*"</code>.</li>
  <li><strong>Binary merges.</strong> Git can't merge two edits to the same PSD. <code>git lfs lock design.psd</code> gives one person the file at a time, if the host supports locking.</li>
</ul>

<h3>Cloning less: shallow, partial and sparse</h3>
<p>
  These three are easy to confuse because they all make a clone smaller. They cut along different
  axes. Shallow cuts <em>history</em>. Partial clone cuts <em>which objects you download up front</em>.
  Sparse-checkout cuts <em>which files appear in your working tree</em>.
</p>

<figure>
<svg viewBox="0 0 900 330" class="dg" role="img" aria-label="Four panels compare what each clone type puts on disk. Each panel is a grid where columns are commits from oldest to newest and rows are directories. A full clone has every commit and every blob. A shallow clone has only the newest commit and its files. A blobless partial clone has every commit but only the newest blobs. A blobless clone with sparse-checkout has every commit but only the newest blobs of one directory.">
<g class="rough">
<rect x="20" y="18" width="200" height="232" rx="12" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="52" cy="90" r="7" style="fill: var(--ink)" />
<rect x="38" y="108" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="38" y="140" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="38" y="172" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="38" y="204" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<circle cx="86" cy="90" r="7" style="fill: var(--ink)" />
<rect x="72" y="108" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="72" y="140" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="72" y="172" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="72" y="204" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<circle cx="120" cy="90" r="7" style="fill: var(--ink)" />
<rect x="106" y="108" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="106" y="140" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="106" y="172" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="106" y="204" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<circle cx="154" cy="90" r="7" style="fill: var(--ink)" />
<rect x="140" y="108" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="140" y="140" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="140" y="172" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="140" y="204" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<circle cx="188" cy="90" r="7" style="fill: var(--ink)" />
<rect x="174" y="108" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="174" y="140" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="174" y="172" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="174" y="204" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="240" y="18" width="200" height="232" rx="12" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="272" cy="90" r="7" style="fill: none; stroke: var(--line-soft); stroke-width: 1.6" />
<rect x="258" y="108" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="258" y="140" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="258" y="172" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="258" y="204" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<circle cx="306" cy="90" r="7" style="fill: none; stroke: var(--line-soft); stroke-width: 1.6" />
<rect x="292" y="108" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="292" y="140" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="292" y="172" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="292" y="204" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<circle cx="340" cy="90" r="7" style="fill: none; stroke: var(--line-soft); stroke-width: 1.6" />
<rect x="326" y="108" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="326" y="140" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="326" y="172" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="326" y="204" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<circle cx="374" cy="90" r="7" style="fill: none; stroke: var(--line-soft); stroke-width: 1.6" />
<rect x="360" y="108" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="360" y="140" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="360" y="172" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="360" y="204" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<circle cx="408" cy="90" r="7" style="fill: var(--ink)" />
<rect x="394" y="108" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="394" y="140" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="394" y="172" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="394" y="204" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="460" y="18" width="200" height="232" rx="12" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="492" cy="90" r="7" style="fill: var(--ink)" />
<rect x="478" y="108" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="478" y="140" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="478" y="172" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="478" y="204" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<circle cx="526" cy="90" r="7" style="fill: var(--ink)" />
<rect x="512" y="108" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="512" y="140" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="512" y="172" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="512" y="204" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<circle cx="560" cy="90" r="7" style="fill: var(--ink)" />
<rect x="546" y="108" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="546" y="140" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="546" y="172" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="546" y="204" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<circle cx="594" cy="90" r="7" style="fill: var(--ink)" />
<rect x="580" y="108" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="580" y="140" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="580" y="172" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="580" y="204" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<circle cx="628" cy="90" r="7" style="fill: var(--ink)" />
<rect x="614" y="108" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="614" y="140" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="614" y="172" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="614" y="204" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="680" y="18" width="200" height="232" rx="12" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="712" cy="90" r="7" style="fill: var(--ink)" />
<rect x="698" y="108" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="698" y="140" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="698" y="172" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="698" y="204" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<circle cx="746" cy="90" r="7" style="fill: var(--ink)" />
<rect x="732" y="108" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="732" y="140" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="732" y="172" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="732" y="204" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<circle cx="780" cy="90" r="7" style="fill: var(--ink)" />
<rect x="766" y="108" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="766" y="140" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="766" y="172" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="766" y="204" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<circle cx="814" cy="90" r="7" style="fill: var(--ink)" />
<rect x="800" y="108" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="800" y="140" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="800" y="172" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="800" y="204" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<circle cx="848" cy="90" r="7" style="fill: var(--ink)" />
<rect x="834" y="108" width="28" height="26" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="834" y="140" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="834" y="172" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
<rect x="834" y="204" width="28" height="26" rx="4" style="fill: none; stroke: var(--line-soft); stroke-width: 1.4" />
</g>
<text class="lbl" x="120" y="44" text-anchor="middle">full clone</text>
<text class="sm" x="120" y="66" text-anchor="middle">git clone</text>
<text class="sm" x="120" y="278" text-anchor="middle">every commit, every blob</text>
<text class="lbl" x="340" y="44" text-anchor="middle">shallow</text>
<text class="sm" x="340" y="66" text-anchor="middle">--depth 1</text>
<text class="sm" x="340" y="278" text-anchor="middle">one commit, all its files</text>
<text class="lbl" x="560" y="44" text-anchor="middle">blobless</text>
<text class="sm" x="560" y="66" text-anchor="middle">--filter=blob:none</text>
<text class="sm" x="560" y="278" text-anchor="middle">all commits, blobs on demand</text>
<text class="lbl" x="780" y="44" text-anchor="middle">blobless + sparse</text>
<text class="sm" x="780" y="66" text-anchor="middle">+ sparse-checkout set</text>
<text class="sm" x="780" y="278" text-anchor="middle">one folder, blobs on demand</text>
<text class="sm" x="450" y="314" text-anchor="middle">dots: commits, oldest to newest · squares: file contents per directory · green: on your disk</text>
</svg>
<figcaption>
  Shallow drops old commits. Blobless keeps every commit but leaves file contents on the server
  until something asks for them. Sparse-checkout decides which folders appear on disk, and with a
  blobless clone that also decides which blobs are ever downloaded.
</figcaption>
</figure>

<h4>Shallow clone</h4>
<pre><code>git clone --depth 1 https://github.com/org/app.git
git fetch --deepen 50
git fetch --unshallow</code></pre>
<p>
  Only the last <em>N</em> commits arrive, and <code>--depth</code> implies
  <code>--single-branch</code>. It's the right call for a CI job that builds once and exits, and it's
  why <code>actions/checkout</code> defaults to <code>fetch-depth: 1</code>. The costs show up when
  you do anything with history:
</p>
<ul>
  <li><code>git log</code> and <code>git blame</code> stop at the cut-off.</li>
  <li><code>git merge-base</code> fails when the common ancestor is beyond the boundary, so "diff against main" in CI breaks. Fetch more depth or the base branch.</li>
  <li><code>git describe</code> fails if no tag is inside the window.</li>
  <li>Later fetches into a shallow repository are more expensive for the server to compute. For day-to-day development a blobless clone is almost always better.</li>
</ul>

<h4>Partial clone</h4>
<pre><code>git clone --filter=blob:none https://github.com/org/app.git
git clone --filter=tree:0 https://github.com/org/app.git
git clone --filter=blob:limit=1m https://github.com/org/app.git</code></pre>
<p>
  A <strong>blobless</strong> clone downloads every commit and tree, so history, <code>log</code> and
  branch switching all work normally. File contents are fetched from the remote the first time
  something needs them. The remote is recorded as a <em>promisor</em>: Git trusts that it can supply
  missing objects later. A <strong>treeless</strong> clone (<code>tree:0</code>) goes further and is
  good for throwaway builds, but commands that walk history fetch trees one batch at a time and
  crawl. The trade-off is that <code>git blame</code> or <code>git log -p</code> on old history now
  needs the network.
</p>

<h4>Sparse-checkout</h4>
<pre><code>git clone --filter=blob:none --sparse https://github.com/org/monorepo.git
cd monorepo
git sparse-checkout set apps/web libs/ui
git sparse-checkout add libs/auth
git sparse-checkout list
git sparse-checkout disable</code></pre>
<p>
  Sparse-checkout limits the working tree to the directories you name. Cone mode, the default since
  Git 2.37, takes directories rather than arbitrary patterns. You get everything under each named
  directory, plus the files directly inside each parent directory, including the repository root.
  That restriction is what lets Git check paths quickly. On its own sparse-checkout saves disk and
  speeds up <code>status</code>. Combined with a blobless clone, it also saves the download, because
  blobs outside your cone are never requested. For very large repositories, add
  <code>git config index.sparse true</code> so the index itself shrinks too.
</p>

<h3>Keeping a big repository fast</h3>
<pre><code>git maintenance start
git config core.fsmonitor true
git config core.untrackedCache true
git config feature.manyFiles true
git commit-graph write --reachable --changed-paths</code></pre>
<div class="table-scroll"><table>
<thead><tr><th>Feature</th><th>What it speeds up</th></tr></thead>
<tbody>
<tr><td><code>git maintenance start</code></td><td>Registers the repo and schedules background tasks through launchd, cron, systemd or Task Scheduler: hourly prefetch and commit-graph updates, daily loose-object cleanup and incremental repack, weekly packing of refs. Your <code>git fetch</code> then has little left to download.</td></tr>
<tr><td>commit-graph</td><td>A precomputed file of commit parents and generation numbers. <code>log --graph</code>, <code>merge-base</code> and reachability checks stop parsing every commit. <code>--changed-paths</code> adds Bloom filters, which make <code>git log -- some/file</code> much faster.</td></tr>
<tr><td><code>core.fsmonitor</code></td><td>The built-in file system monitor on macOS and Windows. <code>git status</code> asks a daemon what changed instead of checking every file.</td></tr>
<tr><td><code>core.untrackedCache</code></td><td>Remembers directory scans, so finding untracked files is cheaper.</td></tr>
<tr><td><code>feature.manyFiles</code></td><td>Turns on a group of settings for repositories with many files, including a smaller index format and the untracked cache.</td></tr>
</tbody>
</table></div>

<h4>Scalar</h4>
<pre><code>scalar clone https://github.com/org/monorepo.git
scalar register</code></pre>
<p>
  Scalar ships with Git since 2.38 and came from Microsoft's work on the Windows repository. It
  applies everything in this section in one step: a blobless partial clone, cone-mode sparse-checkout
  starting from the root files only, background maintenance, fsmonitor and tuned config.
  <code>scalar clone</code> puts the working tree in a <code>src/</code> folder inside the one it
  creates. <code>scalar register</code> applies the same settings to a repository you already have.
</p>

<h4>Finding out why it's slow</h4>
<pre><code>git count-objects -vH
GIT_TRACE2_PERF=1 git status
git rev-list --objects --all \\
  | git cat-file --batch-check="%(objecttype) %(objectname) %(objectsize) %(rest)" \\
  | awk '$1 == "blob"' | sort -k3 -n | tail -20
git diagnose</code></pre>
<p>
  <code>count-objects</code> shows loose versus packed size. <code>GIT_TRACE2_PERF</code> prints
  where each phase of a command spent its time, so you can tell a slow untracked-file scan from slow
  hooks or a slow filter. The <code>rev-list</code> pipeline lists the twenty biggest blobs anywhere in
  history, which is usually the answer to "why is the clone 3 GB". The open-source
  <strong>git-sizer</strong> tool gives a fuller report, and <code>git diagnose</code> bundles
  repository statistics into a zip to attach to a bug report.
</p>

<h3>Line endings</h3>
<p>
  Windows tools often write CRLF line endings, while Linux and macOS use LF. Left alone, a mixed team
  produces diffs where every line of a file looks changed, and shell scripts that fail with
  <code>/bin/bash^M: bad interpreter</code>. There are two controls, and one of them should win.
</p>
<div class="table-scroll"><table>
<thead><tr><th></th><th><code>core.autocrlf</code></th><th><code>.gitattributes</code></th></tr></thead>
<tbody>
<tr><td>Where it lives</td><td>Each person's config</td><td>Committed in the repository</td></tr>
<tr><td>Applies to</td><td>Whoever set it</td><td>Everyone who clones</td></tr>
<tr><td>Values</td><td><code>true</code>: CRLF on checkout, LF on commit. <code>input</code>: LF on commit only. <code>false</code>: no conversion.</td><td><code>text=auto</code>, <code>text eol=lf</code>, <code>binary</code> and more, per path pattern</td></tr>
<tr><td>Priority</td><td>Lower</td><td>Wins when both are set</td></tr>
</tbody>
</table></div>
<pre><code>* text=auto
*.sh    text eol=lf
*.bat   text eol=crlf
*.png   binary
*.lock  -diff</code></pre>
<p>
  <code>text=auto</code> lets Git detect text files and store them with LF. <code>eol=lf</code> forces
  LF in the working tree even on Windows, which scripts need. <code>binary</code> turns off conversion
  and textual diffs. <code>-diff</code> keeps a file as text but hides its diff, which is handy for
  lockfiles in review. After adding the file to an existing repository, run
  <code>git add --renormalize .</code> and commit, so the stored files match the new rules.
  <code>git ls-files --eol</code> shows what each file has in the index and on disk.
</p>

<h3>Case sensitivity</h3>
<p>
  Linux file systems are case-sensitive. The default file systems on macOS (APFS) and Windows (NTFS)
  are case-insensitive but case-preserving. Git records the setting as <code>core.ignorecase</code>
  when it creates the repository. Leave it alone: flipping it by hand makes things worse. Three
  problems come up again and again.
</p>
<ul>
  <li><strong>A rename that changes only case.</strong> Renaming <code>button.tsx</code> to <code>Button.tsx</code> in Finder may not register as a change. Use <code>git mv button.tsx Button.tsx</code>. If that complains, go through a temporary name: <code>git mv button.tsx tmp.tsx</code>, then <code>git mv tmp.tsx Button.tsx</code>.</li>
  <li><strong>Imports that only work on a Mac.</strong> <code>import "./button"</code> resolves to <code>Button.tsx</code> on macOS and fails on Linux CI. Enable the case check in your bundler or TypeScript (<code>forceConsistentCasingInFileNames</code>).</li>
  <li><strong>Two paths that differ only by case.</strong> Someone on Linux commits both <code>Readme.md</code> and <code>README.md</code>. On a Mac only one can exist, so one is always shown as modified. Git warns about colliding paths on clone. The fix is to delete one of them in a commit made on a case-sensitive system, or with <code>git rm --cached</code>.</li>
</ul>
<p>
  Windows adds its own rules: names like <code>CON</code>, <code>AUX</code> and <code>NUL</code> are
  reserved, and deep paths can hit the 260-character limit. <code>git config core.longpaths true</code>
  helps with the second.
</p>

<h3>Signing commits and tags</h3>
<p>
  Anyone can set <code>user.email</code> to anything, so the author field is a claim, not proof. A
  signature proves the commit was made by whoever holds a particular private key. The host shows
  "Verified" when that key is registered to the account the email belongs to.
</p>
<p class="sub">SSH signing, simpler than GPG</p>
<pre><code>git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
git config --global tag.gpgsign true</code></pre>
<p class="sub">GPG signing</p>
<pre><code>gpg --full-generate-key
gpg --list-secret-keys --keyid-format=long
git config --global user.signingkey 3AA5C34371567BD2
git config --global commit.gpgsign true
gpg --armor --export 3AA5C34371567BD2</code></pre>
<p>
  Either way, upload the public key to your host as a <em>signing</em> key. On GitHub that is a
  separate entry from the SSH key you use to authenticate, even if it is the same key.
</p>
<h4>Verifying</h4>
<pre><code>git log --show-signature -1
git verify-commit HEAD
git verify-tag v2.4.0
git log --format="%h %G? %GS %s"
git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers</code></pre>
<p>
  <code>%G?</code> prints <code>G</code> for a good signature, <code>N</code> for none,
  <code>B</code> for bad, and a few other letters for untrusted or expired keys. For SSH signatures,
  local verification needs an allowed-signers file, one line per person:
  <code>ana@example.com ssh-ed25519 AAAAC3Nza…</code>. Without it Git can't tell whose key signed.
</p>
<div class="bx is-ref">
<span class="ttl">What a signature does not prove</span>
<p>
  It says who created the commit object, not that the code is good or reviewed. Rebasing or amending
  creates new commits, so the person who rewrites signs them. When a host squash-merges or rebases a
  pull request, it signs the result with its own key. If you need proof of review, enforce it with
  branch protection and required reviews, not with signatures.
</p>
</div>

<h3>Blame through the noise</h3>
<pre><code>git config blame.ignoreRevsFile .git-blame-ignore-revs
git blame -w -C -C -C src/cart.ts</code></pre>
<p>
  List the full hashes of formatting-only commits in <code>.git-blame-ignore-revs</code> and commit
  that file. <code>blame</code> then skips them and credits each line to the commit that really
  changed it. GitHub and GitLab read the same file in their web blame views. <code>-w</code> ignores
  whitespace, and each <code>-C</code> looks further for code moved or copied from other files.
</p>
`,
};
