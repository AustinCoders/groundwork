import type { GitSection } from "./types";

export const gitMerge: GitSection = {
  id: "merge",
  num: "G7",
  title: "Merging and conflicts",
  short: "Merging & conflicts",
  subtitle:
    "Every merge compares three snapshots: yours, theirs, and the commit where they split. Conflicts are what is left when that comparison has no single answer.",
  body: `
<div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <h3>Fast-forward: when there is nothing to merge</h3>
  <p>
    If the branch you are on has not moved since the other branch
    split from it, your branch is an ancestor of theirs. Git does
    not need to combine anything. It slides your branch label
    forward to their tip. That is a <strong>fast-forward</strong>,
    and it creates no new commit.
  </p>

  <figure>
    <svg viewBox="0 0 900 230" class="dg" role="img" aria-label="Left, before: a straight line of five commits with main on the third and feature on the fifth. Right, after git merge feature: the same five commits, and main has slid forward to the fifth commit next to feature. No new commit was created.">
      <g class="rough">
        <path d="M450 20 V210" style="stroke: var(--line-soft); stroke-width: 2; fill: none" />
        <path class="ln" d="M60 150 H220" />
        <path class="lng" d="M220 150 H380" />
        <circle cx="60" cy="150" r="7" style="fill: var(--ink)" />
        <circle cx="140" cy="150" r="7" style="fill: var(--ink)" />
        <circle cx="220" cy="150" r="9" style="fill: var(--ink)" />
        <circle cx="300" cy="150" r="7" style="fill: var(--green)" />
        <circle cx="380" cy="150" r="9" style="fill: var(--green)" />
        <path class="ln" d="M510 150 H670" />
        <path class="lng" d="M670 150 H830" />
        <circle cx="510" cy="150" r="7" style="fill: var(--ink)" />
        <circle cx="590" cy="150" r="7" style="fill: var(--ink)" />
        <circle cx="670" cy="150" r="7" style="fill: var(--ink)" />
        <circle cx="750" cy="150" r="7" style="fill: var(--green)" />
        <circle cx="830" cy="150" r="9" style="fill: var(--green)" />
        <path class="ln dash" d="M670 100 H810" marker-end="url(#arrow)" />
      </g>
      <text class="sm" x="30" y="34">BEFORE</text>
      <text class="lbl" x="220" y="120" text-anchor="middle">main</text>
      <text class="lbl gr" x="380" y="120" text-anchor="middle">feature</text>
      <text class="sm" x="220" y="184" text-anchor="middle">7d21e0</text>
      <text class="sm" x="380" y="184" text-anchor="middle">e2c81d</text>
      <text class="sm" x="480" y="34">AFTER git merge feature</text>
      <text class="sm" x="740" y="88" text-anchor="middle">main slides forward</text>
      <text class="lbl" x="830" y="126" text-anchor="middle">main, feature</text>
      <text class="sm" x="830" y="184" text-anchor="middle">e2c81d</text>
      <text class="sm" x="480" y="200">Updating 7d21e0..e2c81d  Fast-forward</text>
    </svg>
    <figcaption>
      A fast-forward only moves a label. The history is identical
      before and after, and nothing records that a branch ever
      existed.
    </figcaption>
  </figure>

  <h3>Three-way merge and the merge base</h3>
  <p>
    If both branches have new commits, Git has real work to do. It
    finds the <strong>merge base</strong>: the best common ancestor,
    the last commit both branches share. Then it compares three
    snapshots: the base, your tip (<em>ours</em>), and their tip
    (<em>theirs</em>). For each region of each file:
  </p>
  <ul>
    <li>changed on neither side: keep it;</li>
    <li>changed on one side only: take that side's version;</li>
    <li>changed identically on both sides: take it once;</li>
    <li>changed differently on both sides: <strong>conflict</strong>.</li>
  </ul>
  <p>
    The base is what makes this work. With only two versions, Git
    could not tell "you added this line" from "they deleted this
    line". With the base, it knows who changed what. The result is
    a <strong>merge commit</strong> with two parents: your old tip
    first, their tip second. That order matters later for
    <code>git log --first-parent</code> and for reverting a merge.
  </p>

  <figure>
    <svg viewBox="0 0 900 250" class="dg" role="img" aria-label="main runs along the bottom through the merge base, two more commits, and then a merge commit M. feature leaves main at the merge base, has three green commits, and joins main again at M. A box notes that Git diffs base to ours and base to theirs.">
      <g class="rough">
        <path class="ln" d="M60 180 H620" />
        <path class="lng" d="M240 180 C280 180 280 90 330 90 H510 C560 90 575 180 612 180" />
        <rect x="620" y="24" width="260" height="96" rx="10" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
        <circle cx="60" cy="180" r="7" style="fill: var(--ink)" />
        <circle cx="150" cy="180" r="7" style="fill: var(--ink)" />
        <circle cx="240" cy="180" r="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="360" cy="180" r="7" style="fill: var(--ink)" />
        <circle cx="480" cy="180" r="9" style="fill: var(--ink)" />
        <circle cx="330" cy="90" r="7" style="fill: var(--green)" />
        <circle cx="420" cy="90" r="7" style="fill: var(--green)" />
        <circle cx="510" cy="90" r="9" style="fill: var(--green)" />
        <circle cx="620" cy="180" r="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
      </g>
      <text class="sm" x="240" y="212" text-anchor="middle">merge base</text>
      <text class="sm" x="480" y="212" text-anchor="middle">ours (HEAD)</text>
      <text class="sm" x="620" y="212" text-anchor="middle">M: two parents</text>
      <text class="lbl gr" x="420" y="64" text-anchor="middle">theirs: feature</text>
      <text class="lbl" x="640" y="185">main ← HEAD</text>
      <text class="sm" x="636" y="50">diff base → ours</text>
      <text class="sm" x="636" y="72">diff base → theirs</text>
      <text class="sm" x="636" y="100">same hunk changed twice: conflict</text>
    </svg>
    <figcaption>
      The hollow commit on the left is the merge base; the hollow one
      on the right is the merge commit. Its first parent is the old
      main tip, its second parent is the feature tip.
    </figcaption>
  </figure>

  <p class="sub">looking at the base yourself</p>
  <div class="codeblock">
    <pre><code>$ git merge-base main feature/checkout
7d21e0a4c19b2f6e8d3a5c7b9e1f0d2c4a6b8e0f

$ git diff main...feature/checkout --stat
 src/cart.js    | 14 ++++++++++----
 src/coupon.js  | 52 ++++++++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 62 insertions(+), 4 deletions(-)

$ git log --oneline main..feature/checkout
e2c81d0 Apply coupon before tax
b41f7a3 Add coupon model
5a90c2e Add coupon field to cart form</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    The three dots in <code>git diff A...B</code> mean "diff from
    the merge base of A and B to B", which is exactly what a pull
    request page shows: what the branch changed, ignoring what main
    did since. The two dots in <code>git log A..B</code> mean
    "commits reachable from B but not from A".
  </p>
  <p>
    Sometimes there is more than one best common ancestor, usually
    after two branches have merged each other back and forth (a
    <em>criss-cross merge</em>). <code>git merge-base --all</code>
    lists them. Git's default strategy handles it by first merging
    the bases together into a temporary virtual base, then merging
    against that.
  </p>

  <h3>Choosing how the result is recorded</h3>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Command</th><th>Resulting history</th><th>Good for</th></tr>
      </thead>
      <tbody>
        <tr><td><code>git merge feature</code></td><td>Fast-forward if possible, otherwise a merge commit</td><td>Local syncing</td></tr>
        <tr><td><code>git merge --no-ff feature</code></td><td>Always a merge commit, so the branch stays visible as a unit</td><td>Feature branches you may want to revert as a whole</td></tr>
        <tr><td><code>git merge --ff-only feature</code></td><td>Fast-forward, or refuse and change nothing</td><td>Updating main from origin/main; scripts</td></tr>
        <tr><td><code>git merge --squash feature</code></td><td>Stages the combined changes; you then commit one ordinary commit with one parent</td><td>Noisy branches with 40 "wip" commits</td></tr>
        <tr><td><code>git merge --no-commit feature</code></td><td>Does the merge but stops before committing, so you can inspect or adjust</td><td>Merges you want to test first</td></tr>
      </tbody>
    </table>
  </div>
  <p>
    A squash merge has a cost worth knowing. The new commit has no
    link to the branch's commits, so Git does not consider the
    branch merged: <code>git branch -d</code> refuses, and merging
    the same branch again later will try to apply its changes a
    second time and may conflict with itself.
  </p>

  <h3>Strategies and strategy options</h3>
  <p>
    A <strong>strategy</strong> (<code>-s</code>) is the algorithm
    that performs the merge. A <strong>strategy option</strong>
    (<code>-X</code>) tunes that algorithm. They are easy to confuse
    and do very different things.
  </p>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Strategy</th><th>What it does</th></tr>
      </thead>
      <tbody>
        <tr><td><code>ort</code></td><td>The default since Git 2.34 for merging two branches. A rewrite of <code>recursive</code> that is much faster and handles renames better. Recursively merges multiple merge bases.</td></tr>
        <tr><td><code>recursive</code></td><td>The default before 2.34. Same idea, older code. Recent Git versions run <code>ort</code> when you ask for it.</td></tr>
        <tr><td><code>octopus</code></td><td>The default when you merge three or more branches at once, <code>git merge a b c</code>. Makes one commit with many parents, and refuses if any conflict needs a manual fix.</td></tr>
        <tr><td><code>ours</code></td><td>Records a merge but keeps your tree exactly as it was. Their changes are discarded completely. Used to mark an old branch as "merged" without taking anything from it.</td></tr>
        <tr><td><code>resolve</code></td><td>An older, simpler two-head algorithm. Rarely needed.</td></tr>
        <tr><td><code>subtree</code></td><td>Merges a project that lives in a subdirectory of yours.</td></tr>
      </tbody>
    </table>
  </div>
  <p>
    Compare <code>-s ours</code> with <code>-X ours</code>. The
    strategy throws away <em>everything</em> from the other side.
    The option runs a normal merge, takes all their non-conflicting
    changes, and only resolves <em>conflicting hunks</em> in your
    favour. <code>-X theirs</code> is the mirror image; there is no
    <code>-s theirs</code>. Both options are blunt: they resolve
    conflicts without anyone reading them, so use them only when you
    know one side is right, such as regenerated lock files.
  </p>
  <p class="sub">other strategy options you will meet</p>
  <div class="codeblock">
    <pre><code>$ git merge -X ignore-space-change feature
$ git merge -X diff-algorithm=histogram feature
$ git merge -X renormalize feature
$ git merge -X find-renames=40% feature</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    <code>ignore-space-change</code> stops an indentation change on
    one side from conflicting with a real change on the other.
    <code>histogram</code> often lines up changed blocks better
    than the default diff. <code>renormalize</code> helps when one
    branch changed line endings. <code>find-renames</code> lowers
    the similarity needed for Git to treat a deleted file and a new
    file as a rename (the default is 50%).
  </p>

  <h3>Reading a conflict</h3>
  <p class="sub">what Git prints</p>
  <div class="codeblock">
    <pre><code>$ git merge feature/checkout
Auto-merging src/tax.js
Auto-merging src/cart.js
CONFLICT (content): Merge conflict in src/cart.js
Automatic merge failed; fix conflicts and then commit the result.

$ git status
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Changes to be committed:
	modified:   src/tax.js

Unmerged paths:
  (use "git add &lt;file&gt;..." to mark resolution)
	both modified:   src/cart.js</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    Everything that merged cleanly is already staged. Only the
    conflicted file needs you. Inside it, Git writes both versions
    between markers:
  </p>

  <p class="sub">src/cart.js, default "merge" style</p>
  <div class="codeblock">
    <pre><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
<span class="g">  const total = subtotal + tax + shipping;</span>
=======
<span class="r">  const total = applyCoupon(subtotal) + tax;</span>
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/checkout</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    Above <code>=======</code> is ours (the branch you are on),
    below is theirs (the branch being merged in). This view hides
    the most useful fact: what the line looked like before either
    side touched it. Turn on the <code>zdiff3</code> style and Git
    shows the base too:
  </p>

  <p class="sub">the same conflict with merge.conflictStyle=zdiff3</p>
  <div class="codeblock">
    <pre><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
<span class="g">  const total = subtotal + tax + shipping;</span>
||||||| 7d21e0a
  const total = subtotal + tax;
=======
<span class="r">  const total = applyCoupon(subtotal) + tax;</span>
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/checkout</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    Now the story is clear: main added shipping, the feature added
    the coupon, and the right answer keeps both:
    <code>applyCoupon(subtotal) + tax + shipping</code>. The older
    <code>diff3</code> style shows the same base section; zdiff3
    (Git 2.35 and later) additionally moves lines that are identical
    on both sides out of the conflict, so the marked region is
    smaller.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Conflict type</th><th>What happened</th><th>How it looks in status</th></tr>
      </thead>
      <tbody>
        <tr><td>content</td><td>Both sides edited the same lines</td><td><code>both modified</code></td></tr>
        <tr><td>modify/delete</td><td>One side edited a file, the other deleted it</td><td><code>deleted by us</code> or <code>deleted by them</code></td></tr>
        <tr><td>add/add</td><td>Both sides created a file at the same path</td><td><code>both added</code></td></tr>
        <tr><td>rename/rename</td><td>Both sides renamed the same file to different names</td><td><code>both deleted</code>, <code>added by us</code>, <code>added by them</code></td></tr>
        <tr><td>binary</td><td>Both sides changed an image or other binary file</td><td><code>both modified</code>, with no markers inside</td></tr>
      </tbody>
    </table>
  </div>

  <h3>Resolving</h3>
  <p>
    During a conflict the index holds up to three versions of each
    conflicted file, called <em>stages</em>: 1 is the base, 2 is
    ours, 3 is theirs. You can read any of them directly, which is
    the only sane way to deal with binary files and lock files.
  </p>

  <p class="sub">working with the three stages</p>
  <div class="codeblock">
    <pre><code>$ git ls-files -u
100644 8a1f3c0e5d7b9a2c4e6f8b0d1a3c5e7f9b1d3a5c 1	src/cart.js
100644 c29e7b4a1f3d5c7e9a0b2d4f6a8c0e1b3d5f7a9c 2	src/cart.js
100644 5f0d2b8e4a6c1e3f5a7b9d0c2e4f6a8b0c1d3e5f 3	src/cart.js

$ git show :1:src/cart.js
$ git show :2:src/cart.js
$ git show :3:src/cart.js

$ git checkout --theirs package-lock.json
$ git checkout --ours assets/logo.png
$ git checkout -m src/cart.js

$ git diff --name-only --diff-filter=U
src/cart.js

$ git add src/cart.js
$ git commit --no-edit</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    <code>--ours</code> and <code>--theirs</code> take a whole file
    from one side (<code>git restore --ours</code> does the same).
    <code>checkout -m</code> throws away your half-finished edit and
    puts the conflict markers back so you can start again.
    <code>git add</code> is how you tell Git a file is resolved: it
    collapses the three stages into one. Git does not check for
    leftover markers, so run <code>git diff --check</code> before
    committing; it flags them.
  </p>
  <p>
    For a lock file, the right move is usually neither side: take
    either version, then regenerate it with
    <code>npm install</code> so it matches the merged
    <code>package.json</code>.
  </p>

  <p class="sub">getting out</p>
  <div class="codeblock">
    <pre><code>$ git merge --abort
$ git log --merge --oneline -- src/cart.js
e2c81d0 Apply coupon before tax
a90f4d1 Add shipping to cart total</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    <code>--abort</code> returns you to the moment before
    <code>git merge</code>. It tries to keep uncommitted edits you
    had when you started, but cannot always, which is one reason to
    commit or stash before merging. <code>git log --merge</code> lists
    only the commits, on either side, that touched the conflicted
    files, which is how you find out <em>why</em> both sides
    changed that line.
  </p>

  <h3>Tools: mergetool and rerere</h3>
  <p>
    <code>git mergetool</code> opens each conflicted file in a
    three- or four-pane tool that shows base, ours, theirs and the
    result side by side. Configure it once with
    <code>git config --global merge.tool vscode</code> (plus a
    <code>mergetool.vscode.cmd</code> entry) or
    <code>vimdiff</code>, <code>meld</code>, <code>kdiff3</code>.
    Set <code>mergetool.keepBackup false</code> or it leaves
    <code>.orig</code> files everywhere.
  </p>
  <p>
    <strong>rerere</strong> ("reuse recorded resolution") records
    the conflict and how you resolved it. The next time the same
    conflict appears, typically when you rebase or re-merge a
    long-lived branch, it applies your resolution for you:
  </p>
  <p class="sub">rerere at work</p>
  <div class="codeblock">
    <pre><code>$ git config --global rerere.enabled true

$ git merge feature/checkout
CONFLICT (content): Merge conflict in src/cart.js
Recorded preimage for 'src/cart.js'
Automatic merge failed; fix conflicts and then commit the result.
$ git add src/cart.js &amp;&amp; git commit --no-edit
Recorded resolution for 'src/cart.js'.

$ git merge feature/checkout
CONFLICT (content): Merge conflict in src/cart.js
Resolved 'src/cart.js' using previous resolution.
Automatic merge failed; fix conflicts and then commit the result.</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    Note that Git still stops. rerere fills in the file but leaves
    it unstaged so you can check it (set
    <code>rerere.autoUpdate true</code> to stage it too). If it
    recorded a bad resolution, <code>git rerere forget src/cart.js</code>
    removes it.
  </p>

  <h3>Semantic conflicts: the ones Git cannot see</h3>
  <p>
    Git merges text, not meaning. A merge can complete with zero
    conflicts and still produce broken code:
  </p>
  <ul>
    <li>Branch A renames <code>getTotal()</code> to <code>cartTotal()</code> and updates every caller.</li>
    <li>Branch B, written at the same time, adds a new file that calls <code>getTotal()</code>.</li>
    <li>The two branches touch different lines, so Git merges them cleanly. The result does not compile.</li>
  </ul>
  <p>
    Other versions of the same problem: one branch changes a
    function's default, another starts relying on the old default;
    two branches add database migrations with the same number; one
    removes a config key another reads. Only tests catch these, and
    only if they run on the <em>merged</em> result rather than on
    each branch alone. That is the reason for "require branches to
    be up to date before merging" settings and for merge queues,
    which test the exact commit that will land on main.
  </p>
  <p>
    You can see a merge's result without touching your working tree:
    <code>git merge-tree --write-tree main feature</code> (Git 2.38
    and later) performs the merge in memory and prints the
    resulting tree ID, plus any conflicts. It is the kind of
    check a hosting service runs to show "This branch has no
    conflicts".
  </p>

  <h3>Undoing a merge</h3>
  <p>
    If the merge is only local, <code>git reset --hard ORIG_HEAD</code>
    puts the branch back where it was before the merge. If it is
    already pushed, revert it:
  </p>
  <p class="sub">reverting a pushed merge</p>
  <div class="codeblock">
    <pre><code>$ git revert -m 1 4c9e2b7
[main 8d0a1f5] Revert "Merge branch 'feature/checkout'"
 2 files changed, 4 insertions(+), 62 deletions(-)</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    <code>-m 1</code> says "parent 1, main, was the mainline; undo
    what the other parent brought in". The trap comes later: the
    feature's commits are still in main's history, so merging the
    fixed branch again brings in only the <em>new</em> commits, not
    the ones you reverted. To bring the feature back, first revert
    the revert (<code>git revert 8d0a1f5</code>), then merge the
    fixes.
  </p>

  <div class="sticky mint">
    <span class="ttl">Two settings worth turning on today</span>
    <p>
      <code>git config --global merge.conflictStyle zdiff3</code>
      so every conflict shows the base.
      <code>git config --global rerere.enabled true</code> so you
      never resolve the same conflict twice.
    </p>
  </div>

  <h3>How to have fewer conflicts</h3>
  <ul>
    <li>Merge or rebase from <code>main</code> daily, not the day before you open the PR.</li>
    <li>Keep branches small and short-lived. A three-day branch rarely conflicts; a three-week one always does.</li>
    <li>Agree on formatting and enforce it with a formatter in a pre-commit hook, so whitespace never causes conflicts.</li>
    <li>Do not mix a big refactor and a behaviour change in the same branch. Land the refactor first, on its own.</li>
    <li>Append to lists in a stable order, such as sorted imports, so two additions do not fight over the last line.</li>
  </ul>
`,
};
