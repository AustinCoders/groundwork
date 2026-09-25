import type { GitSection } from "./types";

export const gitAreas: GitSection = {
  id: "areas",
  num: "G3",
  title: "The three areas (plus the remote)",
  short: "The three areas",
  subtitle: "Your files, the index and the repository. Most commands just copy content from one of these to another.",
  body: `
<div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    Almost every basic command is just moving content between these
    places. Learn which direction each command copies, and you can
    predict what it will do to your files before you press enter.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Area</th><th>What it is</th><th>You arrive with</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Working directory</strong></td><td>The actual files on your disk that you edit. Also called the working tree.</td><td>Editing files</td></tr>
        <tr><td><strong>Staging area (index)</strong></td><td>A draft of your next commit. Lets you commit some changes and not others.</td><td><code>git add</code></td></tr>
        <tr><td><strong>Local repository</strong></td><td>The permanent history in <code>.git</code>, on your machine.</td><td><code>git commit</code></td></tr>
        <tr><td><strong>Remote repository</strong></td><td>The shared copy on GitHub, GitLab, Bitbucket, or a server.</td><td><code>git push</code></td></tr>
      </tbody>
    </table>
  </div>

  <figure>
    <svg viewBox="0 0 900 290" class="dg" role="img" aria-label="Four boxes in a row: working directory, index, local repository, remote. Arrows along the top move content forward with git add, git commit and git push. Arrows along the bottom move it back with git fetch, git restore --staged and git restore.">
      <g class="rough">
        <rect x="20" y="100" width="180" height="80" rx="12" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="250" y="100" width="180" height="80" rx="12" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
        <rect x="480" y="100" width="180" height="80" rx="12" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="710" y="100" width="170" height="80" rx="12" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
        <path class="ln" d="M110 98 C110 50 340 50 340 96" marker-end="url(#arrow)" />
        <path class="ln" d="M340 98 C340 50 570 50 570 96" marker-end="url(#arrow)" />
        <path class="lng" d="M570 98 C570 50 795 50 795 96" marker-end="url(#arrow-green)" />
        <path class="lng" d="M795 182 C795 232 570 232 570 184" marker-end="url(#arrow-green)" />
        <path class="ln" d="M570 182 C570 232 340 232 340 184" marker-end="url(#arrow)" />
        <path class="ln" d="M340 182 C340 232 110 232 110 184" marker-end="url(#arrow)" />
      </g>
      <text class="lbl" x="225" y="44" text-anchor="middle">git add</text>
      <text class="lbl" x="455" y="44" text-anchor="middle">git commit</text>
      <text class="lbl gr" x="683" y="44" text-anchor="middle">git push</text>
      <text class="lbl" x="110" y="136" text-anchor="middle">Working dir</text>
      <text class="sm" x="110" y="158" text-anchor="middle">files you edit</text>
      <text class="lbl" x="340" y="136" text-anchor="middle">Index</text>
      <text class="sm" x="340" y="158" text-anchor="middle">.git/index</text>
      <text class="lbl" x="570" y="136" text-anchor="middle">Local repo</text>
      <text class="sm" x="570" y="158" text-anchor="middle">.git objects + refs</text>
      <text class="lbl" x="795" y="136" text-anchor="middle">Remote</text>
      <text class="sm" x="795" y="158" text-anchor="middle">origin</text>
      <text class="sm" x="225" y="262" text-anchor="middle">git restore</text>
      <text class="sm" x="455" y="262" text-anchor="middle">git restore --staged</text>
      <text class="sm gr" x="683" y="262" text-anchor="middle">git fetch</text>
    </svg>
    <figcaption>
      Forward along the top, back along the bottom. <code>git fetch</code>
      only updates your remote-tracking branches such as
      <code>origin/main</code>; nothing reaches your files until you
      merge, rebase or switch. <code>git pull</code> is fetch plus one
      of those.
    </figcaption>
  </figure>

  <div class="bx is-prim">
    <span class="ttl">In one minute</span>
    <p>
      You edit files in your folder. <code>git add</code> copies the
      changes you want into a waiting area called the index.
      <code>git commit</code> saves exactly what is in the index as a
      new commit. <code>git push</code> sends your commits to the
      shared copy. Run <code>git status</code> any time to see which
      files are in which place.
    </p>
  </div>

  <h3>What the index really is</h3>
  <p>
    The index is easy to picture wrongly as "a list of changes I have
    staged". It is actually a <strong>complete list of every tracked
    file</strong>, each with the blob ID of the version that will go
    into the next commit. Right after a commit, the index matches
    <code>HEAD</code> exactly, so there is nothing "staged", but the
    index is not empty. It is a full proposed snapshot.
  </p>

  <div class="codeblock">
    <pre><code>$ git ls-files --stage
100644 ce013625030ba8dba906f756967f9e9ca394464a 0	README.md
100644 0a5b761ba428dcd2cf481221b5d9a0df20c3c715 0	src/cart.js</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>With that picture, the core commands become precise:</p>
  <ul>
    <li>
      <strong><code>git add file</code></strong> hashes the file,
      writes the blob into <code>.git/objects</code> <em>right
      now</em>, and points the index entry at it. Staged content is
      already in the database before you commit.
    </li>
    <li>
      <strong><code>git commit</code></strong> turns the index into
      trees, writes a commit pointing at the root tree, and moves the
      branch. It never looks at your working directory.
    </li>
    <li>
      <strong><code>git status</code></strong> runs two comparisons:
      <code>HEAD</code> against the index ("Changes to be committed")
      and the index against your files ("Changes not staged").
    </li>
  </ul>

  <p>
    The first point has a useful side effect. If you staged a file
    and then lost it with a bad <code>reset --hard</code>, the blob
    is still in the object store. <code>git fsck --lost-found</code>
    writes dangling blobs into <code>.git/lost-found/other/</code>,
    where you can read them back. Changes you never staged have no
    such safety net.
  </p>

  <p>
    The index also caches file-system details (size, modification
    time, inode) for each entry. <code>git status</code> uses them to
    skip hashing files whose stats have not changed, which is why it
    stays fast in a large repository. That cache is also why
    <code>git status</code> sometimes rewrites <code>.git/index</code>
    even though you did not change anything: it is refreshing stats.
  </p>

  <div class="bx is-ref">
    <span class="ttl">For seniors: two index flags people confuse</span>
    <p>
      Each index entry can carry flags that change how Git treats the
      file. <code>git update-index --assume-unchanged f</code> is a
      performance promise: "I will not edit this, so do not check it".
      Git may drop the flag or overwrite your edits whenever it
      rewrites that entry, so it is the wrong tool for keeping a local
      config change out of commits. <code>--skip-worktree</code> says
      "keep my version of this file"; Git leaves it alone and refuses
      to overwrite it if upstream changes it, which forces you to deal
      with the clash. Sparse-checkout is built on the same
      skip-worktree bit. For a local-only config tweak, a better
      answer is still a template file in the repository and the real
      file in <code>.gitignore</code>. <code>git ls-files -v</code>
      shows the flags: a lower-case letter means assume-unchanged,
      <code>S</code> means skip-worktree.
    </p>
  </div>

  <h3>The states a file moves through</h3>
  <p>
    From Git's point of view each file is in one of four states.
    <code>git status</code> is simply a report of which files are in
    which state.
  </p>

  <figure>
    <svg viewBox="0 0 900 320" class="dg" role="img" aria-label="Four states as columns: untracked, unmodified, modified, staged. git add moves an untracked file to staged. Editing moves an unmodified file to modified. git add moves a modified file to staged. git commit moves staged back to unmodified. git restore moves modified back to unmodified. git rm --cached moves an unmodified file back to untracked.">
      <g class="rough">
        <rect x="25" y="20" width="170" height="40" rx="10" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
        <rect x="245" y="20" width="170" height="40" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="465" y="20" width="170" height="40" rx="10" style="fill: var(--dg-box-red); stroke: var(--red); stroke-width: 2" />
        <rect x="685" y="20" width="170" height="40" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <path d="M110 60 V305" style="stroke: var(--line-soft); stroke-width: 1.5; stroke-dasharray: 5 5; fill: none" />
        <path d="M330 60 V305" style="stroke: var(--line-soft); stroke-width: 1.5; stroke-dasharray: 5 5; fill: none" />
        <path d="M550 60 V305" style="stroke: var(--line-soft); stroke-width: 1.5; stroke-dasharray: 5 5; fill: none" />
        <path d="M770 60 V305" style="stroke: var(--line-soft); stroke-width: 1.5; stroke-dasharray: 5 5; fill: none" />
        <path class="ln" d="M110 100 H766" marker-end="url(#arrow)" />
        <path class="ln" d="M330 140 H546" marker-end="url(#arrow)" />
        <path class="ln" d="M550 180 H766" marker-end="url(#arrow)" />
        <path class="ln" d="M330 220 H114" marker-end="url(#arrow)" />
        <path class="lng" d="M770 260 H334" marker-end="url(#arrow-green)" />
        <path class="lnr" d="M550 300 H334" marker-end="url(#arrow-red)" />
      </g>
      <text class="lbl" x="110" y="46" text-anchor="middle">Untracked</text>
      <text class="lbl" x="330" y="46" text-anchor="middle">Unmodified</text>
      <text class="lbl" x="550" y="46" text-anchor="middle">Modified</text>
      <text class="lbl" x="770" y="46" text-anchor="middle">Staged</text>
      <text class="sm" x="440" y="92" text-anchor="middle">git add (start tracking)</text>
      <text class="sm" x="440" y="132" text-anchor="middle">edit the file</text>
      <text class="sm" x="660" y="172" text-anchor="middle">git add</text>
      <text class="sm" x="220" y="212" text-anchor="middle">git rm --cached</text>
      <text class="sm gr" x="660" y="252" text-anchor="middle">git commit</text>
      <text class="sm rd" x="440" y="292" text-anchor="middle">git restore (discard)</text>
    </svg>
    <figcaption>
      "Tracked" means "has an entry in the index". A file can be in
      two states at once: stage part of an edit and keep editing, and
      it is both staged and modified. That is the
      <code>MM</code> you sometimes see in <code>git status -s</code>.
    </figcaption>
  </figure>

  <div class="codeblock">
    <pre><code>$ git status
On branch main
Changes to be committed:
  (use "git restore --staged &lt;file&gt;..." to unstage)
	modified:   README.md

Changes not staged for commit:
  (use "git add &lt;file&gt;..." to update what will be committed)
  (use "git restore &lt;file&gt;..." to discard changes in working directory)
	modified:   src/cart.js

Untracked files:
  (use "git add &lt;file&gt;..." to include in what will be committed)
	notes.txt

$ git status -sb
## main
M  README.md
 M src/cart.js
?? notes.txt</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    In the short format each line has two status columns. The left
    column is <strong>index versus HEAD</strong> (staged), the right
    is <strong>working directory versus index</strong> (unstaged).
    <code>M&nbsp;</code> is staged only, <code>&nbsp;M</code> is
    unstaged only, <code>MM</code> is both, <code>A&nbsp;</code> is a
    newly added file, <code>D</code> is deleted, <code>R</code> is
    renamed, <code>??</code> is untracked and <code>UU</code> is a
    merge conflict. <code>-b</code> adds the branch line with
    ahead/behind counts.
  </p>

  <h3>Three different diffs</h3>
  <p>
    Because there are three places your content can be, there are
    three useful comparisons, and plain <code>git diff</code> is
    probably not the one you think.
  </p>

  <figure>
    <svg viewBox="0 0 900 250" class="dg" role="img" aria-label="Three boxes: working directory, index, HEAD. git diff compares the working directory with the index. git diff --staged compares the index with HEAD. git diff HEAD compares the working directory with HEAD.">
      <g class="rough">
        <rect x="40" y="90" width="180" height="60" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="360" y="90" width="180" height="60" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
        <rect x="680" y="90" width="180" height="60" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <path class="ln" d="M140 86 C140 45 430 45 430 86" marker-start="url(#arrow)" marker-end="url(#arrow)" />
        <path class="ln" d="M470 86 C470 45 760 45 760 86" marker-start="url(#arrow)" marker-end="url(#arrow)" />
        <path class="lng" d="M130 154 C130 215 770 215 770 154" marker-start="url(#arrow-green)" marker-end="url(#arrow-green)" />
      </g>
      <text class="lbl" x="130" y="118" text-anchor="middle">Working dir</text>
      <text class="sm" x="130" y="138" text-anchor="middle">your files</text>
      <text class="lbl" x="450" y="118" text-anchor="middle">Index</text>
      <text class="sm" x="450" y="138" text-anchor="middle">what you staged</text>
      <text class="lbl" x="770" y="118" text-anchor="middle">HEAD</text>
      <text class="sm" x="770" y="138" text-anchor="middle">the last commit</text>
      <text class="lbl" x="285" y="34" text-anchor="middle">git diff</text>
      <text class="lbl" x="615" y="34" text-anchor="middle">git diff --staged</text>
      <text class="lbl gr" x="450" y="236" text-anchor="middle">git diff HEAD</text>
    </svg>
    <figcaption>
      Plain <code>git diff</code> shows what you have <em>not</em>
      staged yet. Once you <code>git add</code> everything it prints
      nothing, which surprises people. <code>--cached</code> is an
      older spelling of <code>--staged</code>.
    </figcaption>
  </figure>

  <div class="codeblock">
    <pre><code>$ git diff --stat
 src/cart.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git diff --staged --stat
 README.md | 1 +
 1 file changed, 1 insertion(+)

$ git diff HEAD --stat
 README.md   | 1 +
 src/cart.js | 2 +-
 2 files changed, 2 insertions(+), 1 deletion(-)</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    Read <code>git diff --staged</code> before every commit. It is
    exactly the change you are about to record, nothing more.
    Useful variations: <code>--stat</code> for a summary,
    <code>--name-only</code> for file names, <code>--word-diff</code>
    for prose where a whole paragraph is one line, and
    <code>-w</code> to ignore whitespace changes.
  </p>

  <h3>Why staging exists at all</h3>
  <p>
    New users find the staging area annoying: an extra step before
    committing. Its value shows up the day you fix a bug and, along
    the way, also rename a variable and delete some dead code.
    Staging lets you split that into three clean commits instead of
    one messy one. <code>git add -p</code> takes it further: it
    walks you through your changes hunk by hunk and asks what belongs
    in this commit.
  </p>

  <div class="codeblock">
    <pre><code>$ git add -p
diff --git a/src/cart.js b/src/cart.js
index dde824d..31099d6 100644
--- a/src/cart.js
+++ b/src/cart.js
@@ -1,2 +1,2 @@
-export const total = 1;
+export const total = 2;
 export const currency = "INR";
(1/1) Stage this hunk [y,n,q,a,d,e,p,P,?]?</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Key</th><th>Does</th></tr>
      </thead>
      <tbody>
        <tr><td><code>y</code> / <code>n</code></td><td>Stage this hunk / skip it.</td></tr>
        <tr><td><code>s</code></td><td>Split the hunk into smaller ones, when there is unchanged text between the edits.</td></tr>
        <tr><td><code>e</code></td><td>Open the hunk in your editor and choose individual lines.</td></tr>
        <tr><td><code>a</code> / <code>d</code></td><td>Stage / skip this hunk and every later one in the same file.</td></tr>
        <tr><td><code>q</code></td><td>Quit. Everything you already said yes to stays staged.</td></tr>
        <tr><td><code>?</code></td><td>Explain every key. The exact list changes with the hunk and your Git version.</td></tr>
      </tbody>
    </table>
  </div>

  <p>
    The same patch mode exists elsewhere: <code>git restore -p</code>
    discards hunks, <code>git restore --staged -p</code> takes them
    out of the index, <code>git stash -p</code> stashes some, and
    <code>git commit -p</code> stages and commits in one go. Brand-new
    files do not show up in <code>add -p</code> because they have no
    index entry to compare with. <code>git add -N newfile.js</code>
    ("intent to add") creates an empty entry, after which the file
    appears in <code>git diff</code> and <code>git add -p</code> like
    any other.
  </p>

  <div class="sticky mint">
    <span class="ttl">Habit worth building</span>
    <p>
      Run <code>git add -p</code> instead of <code>git add .</code>
      for a week. It forces you to read your own diff before
      committing, and it catches an astonishing number of stray
      <code>console.log</code> lines and commented-out experiments.
    </p>
  </div>

  <h3>Going backwards: restore versus checkout</h3>
  <p>
    For years <code>git checkout</code> did two unrelated jobs:
    switching branches and overwriting files. The same command could
    move you to a branch or silently throw away your edits, depending
    on whether its argument happened to be a branch name or a path.
    Git 2.23 split it into <code>git switch</code> for branches and
    <code>git restore</code> for files. <code>restore</code> asks two
    questions: <em>where from</em> (<code>--source</code>, default
    the index, or <code>HEAD</code> when you use
    <code>--staged</code>) and <em>where to</em>
    (<code>--worktree</code>, <code>--staged</code>, or both).
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Goal</th><th>Modern</th><th>Older equivalent</th></tr>
      </thead>
      <tbody>
        <tr><td>Discard unstaged edits to a file</td><td><code>git restore file</code></td><td><code>git checkout -- file</code></td></tr>
        <tr><td>Unstage, keep the edits</td><td><code>git restore --staged file</code></td><td><code>git reset file</code></td></tr>
        <tr><td>Throw away staged and unstaged edits</td><td><code>git restore --staged --worktree file</code></td><td><code>git checkout HEAD -- file</code></td></tr>
        <tr><td>Get a file as it was two commits ago</td><td><code>git restore --source=HEAD~2 file</code></td><td><code>git checkout HEAD~2 -- file</code></td></tr>
        <tr><td>Switch branch</td><td><code>git switch main</code></td><td><code>git checkout main</code></td></tr>
      </tbody>
    </table>
  </div>

  <p>
    Two differences are worth knowing. <code>restore --source</code>
    writes only to your working directory unless you also pass
    <code>--staged</code>, while <code>checkout HEAD~2 -- file</code>
    updates both the index and the working directory. And if you do
    use <code>checkout</code> with paths, always include the
    <code>--</code>. Without it, <code>git checkout main</code> in a
    repository that has a file named <code>main</code> is ambiguous.
  </p>

  <div class="bx is-ref">
    <span class="ttl">The one command that really loses work</span>
    <p>
      Discarding working-directory changes with
      <code>git restore file</code> (or <code>checkout -- file</code>,
      or <code>reset --hard</code>) overwrites content Git never
      stored. There is no reflog for it and no undo. If there is any
      doubt, <code>git stash</code> first. A stash is a real commit,
      so it is recoverable.
    </p>
  </div>

  <h3>.gitignore</h3>
  <p>
    A list of patterns Git should not track:
    <code>node_modules/</code>, build output, <code>.env</code>, IDE
    folders, log files. One catch that trips everyone up:
    <strong>.gitignore only affects untracked files.</strong> If a
    file is already tracked, adding it to .gitignore changes nothing.
    You have to untrack it first:
  </p>

  <p class="sub">a file you should never have committed</p>
  <div class="codeblock">
    <pre><code>git rm --cached .env
echo ".env" &gt;&gt; .gitignore
git commit -m "chore: stop tracking local env file"</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    <code>--cached</code> removes the file from the index but leaves
    it on your disk. This stops tracking it <em>from now on</em>; the
    file is still in every old commit. If it held real secrets,
    rotate them, then read <a href="/git/danger">Danger zone</a>
    about rewriting history.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Pattern</th><th>Matches</th></tr>
      </thead>
      <tbody>
        <tr><td><code>*.log</code></td><td>Any <code>.log</code> file in any folder.</td></tr>
        <tr><td><code>build/</code></td><td>A directory called <code>build</code> anywhere, not a file with that name.</td></tr>
        <tr><td><code>/build</code></td><td>Only <code>build</code> at the root of this <code>.gitignore</code>'s folder.</td></tr>
        <tr><td><code>docs/**/*.pdf</code></td><td>PDFs at any depth under <code>docs/</code>.</td></tr>
        <tr><td><code>!keep.log</code></td><td>Re-include something an earlier pattern excluded.</td></tr>
      </tbody>
    </table>
  </div>

  <p>
    Patterns come from several places. From highest precedence to
    lowest: <code>.gitignore</code> files in the repository (a deeper
    one overrides a shallower one), then
    <code>.git/info/exclude</code> for patterns private to your clone,
    then your global ignore file from <code>core.excludesFile</code>.
    One rule catches everyone: you cannot re-include a file with
    <code>!</code> if its parent directory is excluded, because Git
    never looks inside an excluded directory. Write
    <code>logs/*</code> and <code>!logs/keep.log</code>, not
    <code>logs/</code>. When a file is ignored and you cannot see
    why, ask:
  </p>

  <div class="codeblock">
    <pre><code>$ git check-ignore -v dist/app.js
.gitignore:4:dist/	dist/app.js</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    That names the file, the line number and the pattern responsible.
    Add <code>--no-index</code> to check a file that is already
    tracked.
  </p>
`,
};
