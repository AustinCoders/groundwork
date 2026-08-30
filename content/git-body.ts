export const GIT_BODY_HTML = `
<section class="sheet hero" id="top">
  <span class="hero__kicker">a working reference · fresher → senior</span>
  <h1>Git, from first commit to <em>reflog rescue</em>.</h1>
  <p class="hero__lead">
    Most people learn Git as a list of commands to memorise. That
    breaks the moment something goes wrong. This guide teaches the
    model underneath — commits are nodes in a graph, branches are
    just sticky notes pointing at them — and then everything else
    follows.
  </p>

  <figure>
    <svg
      viewBox="0 0 900 250"
      class="dg"
      role="img"
      aria-label="A commit graph showing a main branch, a feature branch that merges back in, and a hotfix branch."
    >
      <g class="rough">
        <path class="ln" d="M60 165 H820" />
        <path
          class="lng"
          d="M220 165 C260 165 260 85 300 85 H520 C560 85 560 165 600 165"
        />
        <path
          class="lnr"
          d="M440 165 C470 165 470 225 500 225 H620 C660 225 660 165 700 165"
        />
      </g>
      <g class="rough">
        <circle cx="60" cy="165" r="7" style="fill: var(--ink)" />
        <circle cx="220" cy="165" r="7" style="fill: var(--ink)" />
        <circle cx="440" cy="165" r="7" style="fill: var(--ink)" />
        <circle cx="820" cy="165" r="9" style="fill: var(--ink)" />
        <circle
          cx="600"
          cy="165"
          r="9"
          style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3"
        />
        <circle
          cx="700"
          cy="165"
          r="9"
          style="fill: var(--sheet); stroke: var(--red); stroke-width: 3"
        />
        <circle cx="300" cy="85" r="7" style="fill: var(--green)" />
        <circle cx="410" cy="85" r="7" style="fill: var(--green)" />
        <circle cx="520" cy="85" r="7" style="fill: var(--green)" />
        <circle cx="500" cy="225" r="7" style="fill: var(--red)" />
        <circle cx="620" cy="225" r="7" style="fill: var(--red)" />
      </g>
      <text class="sm" x="60" y="200" text-anchor="middle">a3f9c1</text>
      <text class="sm" x="220" y="200" text-anchor="middle">7d21e0</text>
      <text class="sm" x="440" y="200" text-anchor="middle">c04b8a</text>
      <text class="sm" x="600" y="200" text-anchor="middle">merge</text>
      <text class="lbl gr" x="300" y="62" text-anchor="middle">feature/checkout</text>
      <text class="lbl rd" x="500" y="252" text-anchor="middle">hotfix/login</text>
      <text class="lbl" x="836" y="169">main ← HEAD</text>
    </svg>
    <figcaption>
      Time flows left to right. Every circle is a commit; every
      commit remembers its parent. A branch name is only a label on
      one of these circles — that single fact explains most of Git.
    </figcaption>
  </figure>

  <div class="hero__actions">
    <a class="btn btn--primary btn--big" href="#interview">Jump to the interview bank →</a>
    <a class="btn btn--big" href="#cheat">Jump to the cheat sheet</a>
  </div>
</section>

<section class="sheet chapter" id="model" aria-labelledby="model-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G1</span>
    <h2 id="model-title">The mental model</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    Git is a <strong>distributed version control system</strong>.
    "Distributed" means every clone is a complete repository with
    the entire history, not a thin checkout that phones home. You
    can commit, branch, merge, inspect ten years of history and dig
    through old versions with your Wi-Fi off. That single design
    choice is why Git feels different from SVN or Perforce.
  </p>

  <p>Three ideas carry almost all the weight:</p>

  <h3>1. A commit is a snapshot, not a diff</h3>
  <p>
    People often picture Git storing "the changes you made." It
    doesn't. Each commit records the
    <em>complete state of your project</em> at that moment. The
    diffs you see in <code>git log -p</code> or a pull request are
    calculated on the fly by comparing two snapshots. Git avoids
    wasting space by storing files by content — if a file didn't
    change between commits, both commits point at the same stored
    copy.
  </p>

  <h3>2. History is a directed acyclic graph</h3>
  <p>
    Every commit stores a pointer to its parent (or two parents,
    for a merge). Follow those pointers backwards and you walk the
    whole history. Nothing points forward, and nothing loops —
    hence "acyclic." When you hear people say "the graph," this is
    it. Merging joins two lines; branching splits one.
  </p>

  <h3>3. A branch is a movable pointer</h3>
  <p>
    This is the one that unlocks everything. A branch is not a
    folder, not a copy of your code, not a container of commits.
    It is a 41-byte file containing one commit ID. <code>main</code>
    is a sticky note stuck to a commit. When you commit, Git moves
    the sticky note forward one node. Creating a branch is instant
    because it writes one small file.
  </p>

  <p class="sub">proof — a branch really is one line of text</p>
  <div class="codeblock">
    <pre><code><span class="c"># the branch "main" is literally this file:</span>
cat .git/refs/heads/main
a3f9c1d8e2b47f0c9a1e6d3b5f8c2a7e4d0b9f16

<span class="c"># and HEAD just says which branch you're on:</span>
cat .git/HEAD
ref: refs/heads/main</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <div class="sticky mint">
    <span class="ttl">Why this matters</span>
    <p>
      Once branches are pointers, the scary commands stop being
      scary. <code>git reset</code> moves a pointer.
      <code>git rebase</code> rewrites commits and moves a
      pointer. <code>git merge</code> creates a commit with two
      parents and moves a pointer. You stop memorising and start
      reasoning.
    </p>
  </div>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#top"><span aria-hidden="true">↑</span><span><span class="btn__hint">back to</span>The top</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#objects"><span><span class="btn__hint">next</span>What Git stores</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="objects" aria-labelledby="objects-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G2</span>
    <h2 id="objects-title">What Git actually stores</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    Inside <code>.git/objects</code> there are only four kinds of
    object. Knowing them separates people who use Git from people
    who understand it.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Object</th><th>What it holds</th><th>Everyday name</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Blob</strong></td><td>The raw contents of a file. No filename, no permissions — just bytes.</td><td>A file's content</td></tr>
        <tr><td><strong>Tree</strong></td><td>A directory listing: names, modes, and pointers to blobs and other trees.</td><td>A folder</td></tr>
        <tr><td><strong>Commit</strong></td><td>One tree pointer, parent pointer(s), author, committer, timestamp, message.</td><td>A snapshot</td></tr>
        <tr><td><strong>Tag</strong></td><td>An annotated pointer to a commit, with its own message and optional signature.</td><td>A release marker</td></tr>
      </tbody>
    </table>
  </div>

  <h3>Content addressing and the SHA</h3>
  <p>
    Every object's ID is a hash of its own contents. Identical
    content anywhere in history produces the same ID and is stored
    once. It also means history is tamper-evident: change one byte
    in an old commit and its hash changes, which changes its
    child's hash, and so on down the chain. That cascade is
    exactly why rewriting history gives every downstream commit a
    new ID.
  </p>

  <p class="sub">looking inside the database</p>
  <div class="codeblock">
    <pre><code>git cat-file -t a3f9c1        <span class="c"># type → commit</span>
git cat-file -p a3f9c1        <span class="c"># pretty-print the object</span>

tree   9c2ef01a...              <span class="c"># the root folder snapshot</span>
parent 7d21e0bb...              <span class="c"># the commit before this one</span>
author Aisha &lt;aisha@corp.dev&gt; 1754212800 +0530

    Fix cart total when coupon is expired</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <div class="sticky">
    <span class="ttl">Common misconception</span>
    <p>
      Git does <em>not</em> track renames. It notices them after
      the fact by comparing content similarity between two
      snapshots. That's why a rename plus heavy edits sometimes
      shows up as a delete plus an add.
    </p>
  </div>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#model"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>The mental model</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#areas"><span><span class="btn__hint">next</span>The three areas</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="areas" aria-labelledby="areas-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G3</span>
    <h2 id="areas-title">The three areas (plus the remote)</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
  </div>

  <p>Almost every basic command is just moving content between these places.</p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Area</th><th>What it is</th><th>You arrive with</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Working directory</strong></td><td>The actual files on your disk that you edit.</td><td>Editing files</td></tr>
        <tr><td><strong>Staging area (index)</strong></td><td>A draft of your next commit. Lets you commit some changes and not others.</td><td><code>git add</code></td></tr>
        <tr><td><strong>Local repository</strong></td><td>The permanent history in <code>.git</code>, on your machine.</td><td><code>git commit</code></td></tr>
        <tr><td><strong>Remote repository</strong></td><td>The shared copy on GitHub, GitLab, Bitbucket, or a server.</td><td><code>git push</code></td></tr>
      </tbody>
    </table>
  </div>

  <h3>Why staging exists at all</h3>
  <p>
    New users find the staging area annoying — an extra step
    before committing. Its value shows up the day you fix a bug
    and, along the way, also rename a variable and delete some
    dead code. Staging lets you split that into three clean
    commits instead of one messy one. <code>git add -p</code>
    takes it further: it walks you through your changes hunk by
    hunk and asks what belongs in this commit.
  </p>

  <div class="sticky mint">
    <span class="ttl">Habit worth building</span>
    <p>
      Run <code>git add -p</code> instead of <code>git add .</code>
      for a week. It forces you to read your own diff before
      committing, and it catches an astonishing number of stray
      <code>console.log</code> lines and commented-out
      experiments.
    </p>
  </div>

  <h3>.gitignore</h3>
  <p>
    A list of patterns Git should not track:
    <code>node_modules/</code>, build output, <code>.env</code>,
    IDE folders, log files. One catch that trips everyone up —
    <strong>.gitignore only affects untracked files.</strong> If a
    file is already tracked, adding it to .gitignore changes
    nothing. You have to untrack it first:
  </p>

  <p class="sub">a file you should never have committed</p>
  <div class="codeblock">
    <pre><code>git rm --cached .env        <span class="c"># stop tracking, keep the file on disk</span>
echo ".env" &gt;&gt; .gitignore
git commit -m "chore: stop tracking local env file"

<span class="c"># note: this removes it going FORWARD. It is still in old commits.</span>
<span class="c"># If it held real secrets, see the Danger zone chapter.</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#objects"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>What Git stores</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#daily"><span><span class="btn__hint">next</span>Everyday commands</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="daily" aria-labelledby="daily-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G4</span>
    <h2 id="daily-title">The everyday commands</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
  </div>

  <p>
    This is the loop you'll run several hundred times a week.
    Nothing here is clever; fluency is the point.
  </p>

  <p class="sub">a normal working day</p>
  <div class="codeblock">
    <pre><code>git status                       <span class="c"># where am I, what's changed — run this constantly</span>
git switch -c feature/checkout    <span class="c"># new branch + move onto it</span>

<span class="c"># ... edit files ...</span>

git diff                         <span class="c"># unstaged changes</span>
git diff --staged                <span class="c"># what's about to be committed</span>
git add -p                       <span class="c"># stage selectively</span>
git commit -m "feat: apply coupon before tax"

git fetch origin                 <span class="c"># download their work, change nothing of mine</span>
git rebase origin/main           <span class="c"># replay my commits on top of theirs</span>
git push -u origin feature/checkout</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <h3>Reading history like a pro</h3>
  <p class="sub">git log, actually useful</p>
  <div class="codeblock">
    <pre><code>git log --oneline --graph --decorate --all   <span class="c"># the whole DAG in your terminal</span>
git log -p src/cart.js                       <span class="c"># every change to one file, with diffs</span>
git log -S "calculateTax"                    <span class="c"># commits where this STRING appeared/vanished</span>
git log --since="2 weeks" --author="Aisha"
git show a3f9c1                             <span class="c"># one commit in full</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    <code>git log -S</code> deserves a moment. It searches for
    commits that changed the number of occurrences of a string —
    so "when did this function get deleted?" becomes a
    five-second question instead of an afternoon.
  </p>

  <div class="sticky">
    <span class="ttl">switch and restore</span>
    <p>
      Modern Git split the overloaded <code>git checkout</code>
      into two clearer commands: <code>git switch</code> for
      changing branches, <code>git restore</code> for throwing
      away file changes. <code>checkout</code> still works and
      you'll see it everywhere, but the newer pair is much harder
      to misfire.
    </p>
  </div>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#areas"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>The three areas</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#branch"><span><span class="btn__hint">next</span>Branches &amp; HEAD</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="branch" aria-labelledby="branch-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G5</span>
    <h2 id="branch-title">Branches, HEAD, and detached HEAD</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    <strong>HEAD</strong> is Git's answer to "where am I right
    now?" Normally it points at a branch name, and that branch
    points at a commit. Two levels of indirection:
    <code>HEAD → main → a3f9c1</code>. When you commit,
    <code>main</code> advances and HEAD comes along for the ride.
  </p>

  <h3>Detached HEAD</h3>
  <p>
    Check out a commit directly — <code>git checkout a3f9c1</code>
    — and HEAD now points at a commit with no branch in between.
    That's a detached HEAD. It is not an error; it's a perfectly
    valid state for looking around old history. The risk is that
    commits you make there belong to no branch, so when you switch
    away, nothing points at them and they eventually get garbage
    collected.
  </p>

  <p class="sub">getting out of a detached HEAD, without losing work</p>
  <div class="codeblock">
    <pre><code><span class="c"># You committed while detached and then panicked.</span>
git switch -c rescue/experiment   <span class="c"># name those commits, they're now safe</span>

<span class="c"># Or you already switched away and lost the ID:</span>
git reflog                        <span class="c"># find the commit in your local activity log</span>
git branch rescue/experiment 8f2c9d1</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <h3>Useful branch operations</h3>
  <p class="sub">branch management</p>
  <div class="codeblock">
    <pre><code>git branch -vv                  <span class="c"># local branches + what they track + ahead/behind</span>
git branch -d old-feature       <span class="c"># delete, refuses if unmerged (this is a feature)</span>
git branch -D old-feature       <span class="c"># force delete, you're telling Git you're sure</span>
git branch -m better-name       <span class="c"># rename current branch</span>
git push origin --delete old-feature
git fetch --prune               <span class="c"># clean up remote branches deleted by others</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <div class="sticky mint">
    <span class="ttl">Naming that pays off</span>
    <p>
      Use a prefix and a ticket ID:
      <code>feat/PAY-231-coupon-stacking</code>,
      <code>fix/PAY-288-null-cart</code>,
      <code>chore/bump-node-20</code>. Six months later, a branch
      list is a readable index of what the team has been doing,
      and tooling can filter on the prefix.
    </p>
  </div>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#daily"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>Everyday commands</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#remote"><span><span class="btn__hint">next</span>Remotes &amp; syncing</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="remote" aria-labelledby="remote-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G6</span>
    <h2 id="remote-title">Remotes and syncing</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
  </div>

  <p>
    A remote is a nickname for another copy of the repository —
    <code>origin</code> by convention for the one you cloned from,
    <code>upstream</code> by convention for the original project
    when you've forked it.
  </p>

  <h3>fetch vs pull — the classic interview question</h3>
  <p>
    <strong>fetch</strong> downloads new commits from the remote
    and updates your remote-tracking branches
    (<code>origin/main</code>). It does not touch your local
    branches or your working files. It is always safe.
  </p>
  <p>
    <strong>pull</strong> is fetch followed immediately by an
    integration step — merge by default, or rebase if you
    configure it. It changes your working branch, so it can
    produce conflicts.
  </p>

  <p class="sub">these are equivalent</p>
  <div class="codeblock">
    <pre><code>git pull
<span class="c"># ==</span>
git fetch origin
git merge origin/main

git pull --rebase
<span class="c"># ==</span>
git fetch origin
git rebase origin/main

<span class="c"># Make rebase-on-pull your default — it stops the "Merge branch 'main'</span>
<span class="c"># of github.com:..." noise commits from piling up in history:</span>
git config --global pull.rebase true</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <h3>Remote-tracking branches</h3>
  <p>
    <code>origin/main</code> is not the remote's main branch —
    it's <em>your local cached snapshot of what main looked like
    the last time you talked to the server</em>. It only updates
    when you fetch or pull. This is why <code>git status</code>
    saying "up to date with origin/main" can be stale: it's
    comparing against a cache, not asking the server.
  </p>

  <p class="sub">remote plumbing</p>
  <div class="codeblock">
    <pre><code>git remote -v                              <span class="c"># list remotes and URLs</span>
git remote add upstream git@github.com:org/proj.git
git push -u origin my-branch               <span class="c"># push + set tracking (do this once)</span>
git fetch --all --prune
git clone --depth 1 &lt;url&gt;                  <span class="c"># shallow clone, CI's best friend</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#branch"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>Branches &amp; HEAD</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#merge"><span><span class="btn__hint">next</span>Merging &amp; conflicts</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="merge" aria-labelledby="merge-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G7</span>
    <h2 id="merge-title">Merging and conflicts</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <h3>Fast-forward vs true merge</h3>
  <p>
    If your branch hasn't moved since you branched off, Git
    doesn't need to do any real work — it just slides the pointer
    forward. That's a <strong>fast-forward</strong>, and it
    produces no merge commit. If both branches have new commits,
    Git has to build a <strong>three-way merge</strong>: it finds
    the common ancestor, compares both sides against it, and
    creates a merge commit with two parents.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Strategy</th><th>Flag</th><th>Resulting history</th><th>Good for</th></tr>
      </thead>
      <tbody>
        <tr><td>Fast-forward</td><td><code>--ff</code> (default)</td><td>Linear, no extra commit</td><td>Small, up-to-date branches</td></tr>
        <tr><td>Merge commit</td><td><code>--no-ff</code></td><td>Preserves the branch shape</td><td>Feature branches you want visible in history</td></tr>
        <tr><td>Squash</td><td><code>--squash</code></td><td>All work collapses into one commit</td><td>Noisy branches with 40 "wip" commits</td></tr>
      </tbody>
    </table>
  </div>

  <h3>Reading a conflict</h3>
  <p>
    A conflict happens when both sides changed the same region of
    the same file, and Git refuses to guess. It writes both
    versions into the file with markers and hands it to you.
  </p>

  <p class="sub">src/cart.js — conflicted</p>
  <div class="codeblock">
    <pre><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD            <span class="c">← your current branch's version</span>
<span class="g">  const total = subtotal + tax;</span>
=======
<span class="r">  const total = applyCoupon(subtotal) + tax;</span>
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/checkout   <span class="c">← the version being merged in</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    Your job is to delete the markers and leave the code you
    actually want — which is often neither side verbatim, but a
    combination. Then:
  </p>

  <p class="sub">resolving</p>
  <div class="codeblock">
    <pre><code>git status                    <span class="c"># lists every conflicted file</span>
<span class="c"># ... edit each one, remove all &lt;&lt;&lt;, ===, &gt;&gt;&gt; markers ...</span>
git add src/cart.js           <span class="c"># "add" here means "I've resolved this"</span>
git commit                    <span class="c"># finishes the merge</span>

git merge --abort             <span class="c"># nope, undo the whole thing, back to before</span>
git diff --name-only --diff-filter=U   <span class="c"># just list unresolved files</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <div class="sticky mint">
    <span class="ttl">Two settings that make conflicts easier</span>
    <p>
      <code>git config --global merge.conflictstyle zdiff3</code>
      adds a third section showing the <em>original</em>
      common-ancestor code. Seeing what both sides started from
      usually makes the right resolution obvious.
    </p>
    <p>
      <code>git config --global rerere.enabled true</code> —
      "reuse recorded resolution." Git remembers how you resolved
      a conflict and replays it automatically next time the same
      one appears. On a long-lived branch you rebase repeatedly,
      this saves real hours.
    </p>
  </div>

  <h3>How to have fewer conflicts</h3>
  <ul>
    <li>Merge or rebase from <code>main</code> daily, not the day before you open the PR.</li>
    <li>Keep branches small and short-lived. A three-day branch rarely conflicts; a three-week one always does.</li>
    <li>Agree on formatting and enforce it with a formatter in a pre-commit hook, so whitespace never causes conflicts.</li>
    <li>Don't mix a big refactor and a behaviour change in the same branch.</li>
  </ul>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#remote"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>Remotes &amp; syncing</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#rebase"><span><span class="btn__hint">next</span>Rebase</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="rebase" aria-labelledby="rebase-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G8</span>
    <h2 id="rebase-title">Rebase — the one people fear</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    Merge <em>joins</em> two histories and records that the join
    happened. Rebase <em>rewrites</em> your commits so they appear
    to have been written on top of the latest main, and the fact
    that you branched off earlier disappears.
  </p>

  <p>
    Mechanically: Git takes each of your commits, saves them
    aside, moves your branch pointer to the new base, then
    re-applies them one at a time. Because a commit's hash
    includes its parent,
    <strong>every replayed commit gets a brand-new ID.</strong>
    They are copies, not the originals.
  </p>

  <div class="warn">
    <span class="ttl">The golden rule of rebasing</span>
    Never rebase commits that other people have already pulled.
    Rewriting shared history replaces commits your teammates have
    based work on, and every one of them will hit a mess when
    they next pull. Rebase freely on your own unpushed or
    unshared branch; use merge or revert on anything public.
  </div>

  <h3>Interactive rebase — cleaning up before review</h3>
  <p>
    This is where rebase earns its reputation as a power tool.
    <code>git rebase -i</code> opens an editor listing your
    commits and lets you rewrite the whole branch.
  </p>

  <p class="sub">git rebase -i origin/main</p>
  <div class="codeblock">
    <pre><code>pick   a1b2c3  feat: add coupon field
squash d4e5f6  wip
squash 7g8h9i  fix typo
reword j1k2l3  feat: valdate coupon expiry
drop   m4n5o6  debug logging, remove later
edit   p7q8r9  refactor: extract tax helper

<span class="c"># pick   — keep as is</span>
<span class="c"># reword — keep the changes, rewrite the message</span>
<span class="c"># squash — fold into the commit above, combine messages</span>
<span class="c"># fixup  — fold in, throw the message away</span>
<span class="c"># drop   — delete this commit entirely</span>
<span class="c"># edit   — pause here so you can amend the code</span>
<span class="c"># reorder lines to reorder commits</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    The result is a branch that reads as if you knew exactly what
    you were doing from the start: three clear commits instead of
    eleven, each one a coherent, reviewable, revertable unit.
  </p>

  <p class="sub">rebase survival kit</p>
  <div class="codeblock">
    <pre><code>git rebase --continue     <span class="c"># after fixing a conflict</span>
git rebase --skip         <span class="c"># this commit's changes are no longer needed</span>
git rebase --abort        <span class="c"># get me out, restore everything</span>

git commit --fixup a1b2c3 <span class="c"># mark a commit as a fix for an earlier one</span>
git rebase -i --autosquash origin/main  <span class="c"># auto-arranges the fixups</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <div class="warn">
    <span class="ttl">After a rebase you must force push</span>
    Your local commits now have different IDs than the ones on
    the remote, so a normal push is rejected. Use
    <code>git push --force-with-lease</code>, never plain
    <code>--force</code>. The lease version checks that the
    remote is still where you last saw it, and refuses if a
    teammate pushed in the meantime — which is exactly the
    accident plain force would silently destroy.
  </div>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#merge"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>Merging &amp; conflicts</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#undo"><span><span class="btn__hint">next</span>Undoing anything</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="undo" aria-labelledby="undo-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G9</span>
    <h2 id="undo-title">Undoing anything</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    "I messed up, how do I undo it" is the single most common Git
    question, and the honest answer is
    <em>it depends what you're undoing.</em> Here is the decision
    table.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Situation</th><th>Command</th></tr>
      </thead>
      <tbody>
        <tr><td>Edited a file, want the last committed version back</td><td><code>git restore file.js</code></td></tr>
        <tr><td>Staged something by mistake</td><td><code>git restore --staged file.js</code></td></tr>
        <tr><td>Last commit message is wrong (not pushed)</td><td><code>git commit --amend</code></td></tr>
        <tr><td>Forgot a file in the last commit (not pushed)</td><td><code>git add f.js &amp;&amp; git commit --amend --no-edit</code></td></tr>
        <tr><td>Undo last commit, keep changes staged</td><td><code>git reset --soft HEAD~1</code></td></tr>
        <tr><td>Undo last commit, keep changes unstaged</td><td><code>git reset HEAD~1</code> (mixed, the default)</td></tr>
        <tr><td>Undo last commit and throw the work away</td><td><code>git reset --hard HEAD~1</code></td></tr>
        <tr><td>Undo a commit that's already pushed</td><td><code>git revert &lt;sha&gt;</code></td></tr>
        <tr><td>Need to switch branches mid-task</td><td><code>git stash</code></td></tr>
        <tr><td>Deleted a branch / lost commits entirely</td><td><code>git reflog</code></td></tr>
      </tbody>
    </table>
  </div>

  <h3>reset's three modes, precisely</h3>
  <p>
    All three move the branch pointer to the commit you name.
    They differ only in what they do to the staging area and your
    files.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Mode</th><th>Branch pointer</th><th>Staging area</th><th>Working files</th></tr>
      </thead>
      <tbody>
        <tr><td><code>--soft</code></td><td>Moves</td><td>Untouched</td><td>Untouched</td></tr>
        <tr><td><code>--mixed</code></td><td>Moves</td><td>Reset to match</td><td>Untouched</td></tr>
        <tr><td><code>--hard</code></td><td>Moves</td><td>Reset to match</td><td><strong>Overwritten — work lost</strong></td></tr>
      </tbody>
    </table>
  </div>

  <p>
    Read it as a ladder: soft touches one thing, mixed touches
    two, hard touches all three. <code>--soft</code> is the
    friendly one — it's how you fold three commits into one
    without any risk, because your changes are all still sitting
    in the staging area waiting to be recommitted.
  </p>

  <h3>revert vs reset</h3>
  <p>
    <code>reset</code> pretends the commit never happened by
    moving the pointer backwards. <code>revert</code> creates a
    <em>new</em> commit that applies the inverse changes. History
    grows instead of shrinking.
  </p>

  <div class="sticky">
    <span class="ttl">The rule</span>
    <p>
      Private, unpushed history → <code>reset</code> is fine.
      Shared, pushed history → <code>revert</code>, always.
      Reverting is honest: the record shows that a change went in
      and was later backed out, which is what actually happened,
      and nobody else's clone breaks.
    </p>
  </div>

  <h3>stash — the parking lot</h3>
  <p class="sub">git stash</p>
  <div class="codeblock">
    <pre><code>git stash push -m "half-done coupon UI"
git stash list                 <span class="c"># stash@{0}: On feature: half-done coupon UI</span>
git stash pop                  <span class="c"># apply the newest and delete it</span>
git stash apply stash@{2}      <span class="c"># apply an older one, keep it in the list</span>
git stash -u                   <span class="c"># include untracked files (commonly forgotten)</span>
git stash drop stash@{0}</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <div class="warn">
    <span class="ttl">Stash is not storage</span>
    Stashes are unnamed by default, invisible in the UI, easy to
    forget, and they don't get pushed anywhere. If work matters
    for more than an afternoon, commit it on a scratch branch
    instead. Plenty of people have lost a day's work to a stash
    they forgot existed.
  </div>

  <h3>reflog — the undo button for the undo button</h3>
  <p>
    Git keeps a private local log of everywhere HEAD has pointed,
    for roughly 90 days. Deleted a branch, hard-reset too far,
    lost a rebase — the commits are almost always still in the
    object database, just unreferenced. Reflog finds them.
  </p>

  <p class="sub">rescuing a bad hard reset</p>
  <div class="codeblock">
    <pre><code>git reflog
e4f9a01 HEAD@{0}: reset: moving to HEAD~3     <span class="c">← the mistake</span>
8f2c9d1 HEAD@{1}: commit: feat: coupon stacking <span class="c">← what I want back</span>
a1b2c3d HEAD@{2}: commit: feat: coupon field

git reset --hard 8f2c9d1        <span class="c"># restored, nothing was ever lost</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <div class="sticky mint">
    <span class="ttl">Say this out loud once</span>
    <p>
      "If it was ever committed, it is almost certainly
      recoverable with reflog." Committing often isn't just good
      practice — it's what makes your work rescuable. Uncommitted
      changes wiped by <code>reset --hard</code> are genuinely
      gone.
    </p>
  </div>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#rebase"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>Rebase</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#tools"><span><span class="btn__hint">next</span>Detective tools</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="tools" aria-labelledby="tools-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G10</span>
    <h2 id="tools-title">Detective tools</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <h3>cherry-pick</h3>
  <p>
    Take the change from one commit and apply it somewhere else.
    Useful for backporting a hotfix from <code>main</code> onto a
    release branch. Note that it creates a <em>new</em> commit
    with a new ID, so the same fix now exists twice in the graph
    — which is fine, and occasionally causes a duplicate-conflict
    later when the branches merge.
  </p>

  <p class="sub">cherry-pick</p>
  <div class="codeblock">
    <pre><code>git switch release/2.4
git cherry-pick a3f9c1              <span class="c"># one commit</span>
git cherry-pick a3f9c1^..c04b8a     <span class="c"># an inclusive range</span>
git cherry-pick -x a3f9c1           <span class="c"># notes the original SHA in the message</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <h3>bisect — binary search through history</h3>
  <p>
    A bug exists now and didn't three weeks ago, and there are
    400 commits in between. Bisect finds the culprit in about
    nine steps. You mark one good commit and one bad one; Git
    checks out the midpoint and asks you to test. Answer good or
    bad, repeat, done.
  </p>

  <p class="sub">git bisect</p>
  <div class="codeblock">
    <pre><code>git bisect start
git bisect bad                     <span class="c"># current commit is broken</span>
git bisect good v2.3.0             <span class="c"># this tag was fine</span>
<span class="c"># Git checks out a midpoint. Test it. Then:</span>
git bisect good     <span class="c">— or —</span>     git bisect bad
<span class="c"># ... repeat ~log2(N) times ...</span>
8f2c9d1 is the first bad commit
git bisect reset                   <span class="c"># back to where you started</span>

<span class="c"># Fully automatic, if you have a test that exits non-zero on failure:</span>
git bisect run npm test -- cart.spec.js</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <h3>blame</h3>
  <p>
    <code>git blame -L 40,60 src/cart.js</code> shows who last
    touched each line and in which commit. Despite the name, the
    point isn't blame — it's context. Find the commit, read its
    message and its PR, and you learn <em>why</em> that odd-looking
    line exists before you delete it. Add <code>-w</code> to
    ignore whitespace changes and <code>-C</code> to follow code
    moved between files.
  </p>

  <h3>worktree</h3>
  <p>
    You're deep in a feature and an urgent bug comes in. Instead
    of stashing and switching, check out a second branch into a
    separate folder — same repository, same object database, two
    working directories, no stashing.
  </p>

  <p class="sub">git worktree</p>
  <div class="codeblock">
    <pre><code>git worktree add ../proj-hotfix hotfix/login
<span class="c"># now ../proj-hotfix is a full checkout of the hotfix branch</span>
git worktree list
git worktree remove ../proj-hotfix</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <h3>Submodules and subtrees</h3>
  <p>
    Both embed one repository inside another.
    <strong>Submodules</strong> store a pointer to a specific
    commit of the other repo; the code isn't in your history.
    They're precise but painful — clones need
    <code>--recurse-submodules</code>, and someone always
    forgets. <strong>Subtrees</strong> copy the other project's
    code into yours, so clones just work, but updates are
    clunkier and your history gets bigger. Most teams that can
    avoid both, do, using a package registry instead.
  </p>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#undo"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>Undoing anything</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#flow"><span><span class="btn__hint">next</span>Team workflows</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="flow" aria-labelledby="flow-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G11</span>
    <h2 id="flow-title">Team workflows</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    You should be able to name the strategy your team uses and
    defend the trade-off. That question comes up in almost every
    senior interview.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Strategy</th><th>How it works</th><th>Fits</th><th>Costs</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>GitHub Flow</strong></td>
          <td>One long-lived <code>main</code>. Branch, PR, review, merge, deploy. That's the entire process.</td>
          <td>Web apps with continuous deployment</td>
          <td>No built-in place for supporting several released versions at once</td>
        </tr>
        <tr>
          <td><strong>Git Flow</strong></td>
          <td><code>main</code>, <code>develop</code>, plus feature, release and hotfix branches with defined merge paths.</td>
          <td>Versioned software, scheduled releases, on-prem installs</td>
          <td>Heavy. Lots of long-lived branches means lots of merging. Widely considered overkill for web apps.</td>
        </tr>
        <tr>
          <td><strong>Trunk-based</strong></td>
          <td>Everyone commits to <code>main</code> at least daily; branches live hours, not days. Unfinished work hides behind feature flags.</td>
          <td>High-velocity teams with strong CI and test coverage</td>
          <td>Demands real discipline and a feature-flag system, or you ship half-built features</td>
        </tr>
        <tr>
          <td><strong>Fork &amp; PR</strong></td>
          <td>Contributors fork, push to their own copy, and open a PR upstream.</td>
          <td>Open source and any untrusted-contributor setting</td>
          <td>Extra sync step (<code>upstream</code> remote) for contributors</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3>Merge button options on a PR</h3>
  <ul>
    <li><strong>Create a merge commit</strong> — full branch history preserved, including the "wip" commits. Honest but noisy.</li>
    <li><strong>Squash and merge</strong> — one tidy commit per PR on main. The most popular default; makes <code>git log</code> on main read like a changelog, and makes reverting a whole feature a one-liner. You do lose the intermediate commits.</li>
    <li><strong>Rebase and merge</strong> — every commit lands individually on main, linear, no merge commit. Great if the author curated their commits; terrible if they didn't.</li>
  </ul>

  <div class="sticky mint">
    <span class="ttl">Protections worth turning on</span>
    <p>
      On <code>main</code>: require a PR, require at least one
      approving review, require CI to pass, require the branch to
      be up to date before merging, block force pushes and
      deletions, and require linear history if you've
      standardised on squash. These settings prevent far more
      incidents than any amount of individual care.
    </p>
  </div>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#tools"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>Detective tools</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#hygiene"><span><span class="btn__hint">next</span>Commit hygiene</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="hygiene" aria-labelledby="hygiene-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G12</span>
    <h2 id="hygiene-title">Commit hygiene</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    Commit messages are documentation written at the exact moment
    you had the most context. Six months later, a good message is
    the difference between understanding a line of code and
    rewriting it out of fear.
  </p>

  <h3>Conventional Commits</h3>
  <p>
    A widely adopted format that machines can parse — tooling
    generates changelogs and version bumps from it automatically.
  </p>

  <p class="sub">the format</p>
  <div class="codeblock">
    <pre><code>&lt;type&gt;(&lt;optional scope&gt;): &lt;short imperative summary&gt;

&lt;optional body — WHY, not what&gt;

&lt;optional footer — BREAKING CHANGE:, Refs: PAY-231&gt;

<span class="c">types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p class="sub">good vs bad</p>
  <div class="codeblock">
    <pre><code><span class="r">- fixed stuff
- update
- asdf
- Fixed the bug where the cart total was wrong sometimes</span>

<span class="g">+ fix(cart): apply coupon before tax, not after
+
+ Tax was calculated on the pre-discount subtotal, so customers
+ were overcharged on any percentage coupon. Order of operations
+ now matches the finance spec in PAY-231.
+
+ Refs: PAY-231</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <h4>Rules of thumb</h4>
  <ul>
    <li>Imperative mood: "add", "fix", "remove" — it completes the sentence "if applied, this commit will…".</li>
    <li>Summary under ~50 characters, no full stop, body wrapped at ~72.</li>
    <li>The body explains <strong>why</strong>. The diff already shows what.</li>
    <li>One logical change per commit. If your message needs the word "and," you probably want two commits.</li>
  </ul>

  <h3>Hooks</h3>
  <p>
    Scripts Git runs at specific moments. Native hooks live in
    <code>.git/hooks</code> and are <em>not</em> versioned, which
    is why teams use a manager like Husky (JS), pre-commit
    (Python), or Lefthook to keep them in the repo and shared.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Hook</th><th>Fires</th><th>Typical use</th></tr>
      </thead>
      <tbody>
        <tr><td><code>pre-commit</code></td><td>Before the commit is created</td><td>Lint and format staged files, block leftover debug statements</td></tr>
        <tr><td><code>commit-msg</code></td><td>After you write the message</td><td>Enforce Conventional Commits, require a ticket ID</td></tr>
        <tr><td><code>pre-push</code></td><td>Before pushing</td><td>Run the fast test suite, block pushes to main</td></tr>
        <tr><td><code>pre-receive</code></td><td>On the server</td><td>The only hooks nobody can skip with <code>--no-verify</code></td></tr>
      </tbody>
    </table>
  </div>

  <div class="sticky">
    <span class="ttl">Keep them fast</span>
    <p>
      A pre-commit hook that takes 30 seconds will be bypassed
      with <code>--no-verify</code> within a week. Lint only
      staged files (that's what lint-staged does), and leave the
      full test suite to CI.
    </p>
  </div>

  <h3>Tags and versioning</h3>
  <p class="sub">tagging a release</p>
  <div class="codeblock">
    <pre><code>git tag -a v2.4.0 -m "Coupon stacking release"   <span class="c"># annotated — use this</span>
git tag v2.4.0                                   <span class="c"># lightweight, just a pointer</span>
git push origin v2.4.0
git push --tags
git describe --tags        <span class="c"># v2.4.0-3-g8f2c9d1 — great for build labels</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    Annotated tags are real objects with an author, date,
    message, and optional GPG signature. Releases should always
    be annotated. Semantic versioning reads
    <code>MAJOR.MINOR.PATCH</code> — breaking change, new
    backwards-compatible feature, backwards-compatible fix.
  </p>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#flow"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>Team workflows</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#scale"><span><span class="btn__hint">next</span>Scale &amp; edge cases</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="scale" aria-labelledby="scale-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G13</span>
    <h2 id="scale-title">Scale and edge cases</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--advanced">Senior</span>
  </div>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Problem</th><th>Tool</th></tr>
      </thead>
      <tbody>
        <tr><td>Repo full of large binaries (PSDs, videos, models)</td><td><strong>Git LFS</strong> — stores pointers in Git, blobs on a separate server</td></tr>
        <tr><td>CI only needs the latest commit</td><td><code>git clone --depth 1</code> (shallow clone)</td></tr>
        <tr><td>Huge monorepo, you need one directory</td><td><code>git sparse-checkout set apps/web</code></td></tr>
        <tr><td>Clone is slow because of history size</td><td><code>--filter=blob:none</code> (partial clone, fetches blobs on demand)</td></tr>
        <tr><td>Everything is slow in general</td><td><code>git maintenance start</code>, <code>git gc</code>, commit-graph enabled</td></tr>
        <tr><td>A bad merge commit keeps re-appearing in blame</td><td><code>.git-blame-ignore-revs</code> file to skip formatting-only commits</td></tr>
      </tbody>
    </table>
  </div>

  <h3>Line endings across operating systems</h3>
  <p>
    Windows writes CRLF, Linux and macOS write LF. Left alone, a
    mixed team produces diffs where every line of a file looks
    changed. Fix it once with a <code>.gitattributes</code> file
    committed to the repo — it applies to everyone regardless of
    their local config:
  </p>

  <p class="sub">.gitattributes</p>
  <div class="codeblock">
    <pre><code>* text=auto
*.sh    text eol=lf
*.bat   text eol=crlf
*.png   binary
*.lock  -diff        <span class="c"># don't show lockfile diffs in reviews</span></code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <h3>Signing commits</h3>
  <p>
    Anyone can set <code>user.email</code> to anything, so commit
    authorship is a claim, not proof. Signing with GPG or SSH
    lets the host display a "Verified" badge. Increasingly
    required in regulated environments and on high-profile open
    source.
  </p>

  <p class="sub">SSH signing — simpler than GPG</p>
  <div class="codeblock">
    <pre><code>git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#hygiene"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>Commit hygiene</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#danger"><span><span class="btn__hint">next</span>Danger zone</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="danger" aria-labelledby="danger-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G14</span>
    <h2 id="danger-title">Danger zone</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <h3>You committed a secret</h3>
  <p>
    An API key, a password, a private certificate. Deleting the
    file in a new commit is <strong>not enough</strong> — it's
    still sitting in history, and on any host that's already
    served it to anyone who cloned or forked.
  </p>

  <div class="warn">
    <span class="ttl">Order of operations</span>
    <strong>1. Rotate the credential first.</strong> Immediately,
    before any Git work. Assume it is compromised the second it
    hit a remote. Everything else is cleanup; this is the actual
    fix.<br />
    <strong>2. Then purge the history</strong> with
    <code>git filter-repo</code> (the modern replacement for
    filter-branch) or the BFG Repo-Cleaner.<br />
    <strong>3. Force push, and tell every teammate to
    re-clone</strong> — their old clones still contain it.<br />
    <strong>4. Ask the host to expire cached views</strong> of
    the old commits, and check whether forks exist.
  </div>

  <h3>The commands that destroy work</h3>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Command</th><th>What it can eat</th><th>Safer alternative</th></tr>
      </thead>
      <tbody>
        <tr><td><code>git reset --hard</code></td><td>All uncommitted changes, unrecoverably</td><td><code>git stash</code> first, or commit on a scratch branch</td></tr>
        <tr><td><code>git clean -fd</code></td><td>Untracked files — including that .env you never committed</td><td><code>git clean -nd</code> to dry-run and see the list</td></tr>
        <tr><td><code>git push --force</code></td><td>A teammate's commits on the remote</td><td><code>git push --force-with-lease</code></td></tr>
        <tr><td><code>git checkout -- .</code></td><td>Every unstaged edit in the tree</td><td><code>git restore</code> on named files only</td></tr>
        <tr><td><code>git branch -D</code></td><td>Unmerged commits (though reflog usually saves you)</td><td><code>git branch -d</code> and read the warning</td></tr>
      </tbody>
    </table>
  </div>

  <div class="sticky mint">
    <span class="ttl">A safety net you set up once</span>
    <p>
      <code>git config --global alias.please "push --force-with-lease"</code>
      — then force-pushing requires typing
      <code>git please</code>, which is both safer and more
      polite. Small trick, real accident prevention.
    </p>
  </div>

  <h3>Big merge conflicts</h3>
  <p>
    When a rebase throws conflicts in twenty files, don't grind
    through it. Abort, then merge instead — you resolve each
    conflicting region once rather than once per replayed commit.
    If a rebase is genuinely required, enable <code>rerere</code>
    first so your resolutions get remembered.
  </p>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#scale"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>Scale &amp; edge cases</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#interview"><span><span class="btn__hint">next</span>Interview bank</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="interview" aria-labelledby="interview-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G15</span>
    <h2 id="interview-title">Interview bank</h2>
  </div>
  <div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <h3>Fresher</h3>

  <div class="qa">
    <span class="q">What's the difference between Git and GitHub?</span>
    <p>Git is the version control tool that runs on your machine. GitHub is a hosting service for Git repositories that adds collaboration features on top — pull requests, issues, CI, permissions. GitLab and Bitbucket are alternatives. You can use Git with no GitHub at all.</p>
  </div>
  <div class="qa">
    <span class="q">Explain the difference between fetch and pull.</span>
    <p>Fetch downloads remote commits and updates remote-tracking branches only; it never changes your working files, so it's always safe. Pull is fetch plus an immediate merge or rebase into your current branch, so it can conflict.</p>
  </div>
  <div class="qa">
    <span class="q">What does the staging area do?</span>
    <p>It's a draft of the next commit. It lets you choose which of your current changes go into this commit and which wait for the next one, so you can keep commits focused even when you've been editing several things at once.</p>
  </div>
  <div class="qa">
    <span class="q">How do you resolve a merge conflict?</span>
    <p>Run <code>git status</code> to list conflicted files, open each one, decide what the correct final code is — often a combination of both sides, not one or the other — delete the conflict markers, <code>git add</code> the file to mark it resolved, then commit. <code>git merge --abort</code> backs out entirely.</p>
  </div>
  <div class="qa">
    <span class="q">What is HEAD?</span>
    <p>A pointer to your current position — normally to a branch, which in turn points to a commit. If it points straight at a commit instead, you're in a detached HEAD state.</p>
  </div>

  <h3>Mid-level</h3>

  <div class="qa">
    <span class="q">Merge or rebase — which and why?</span>
    <p>Merge preserves the true shape of history and is non-destructive, so it's correct for anything already shared. Rebase produces a clean linear history but rewrites commits, so it's only for your own unshared branch. A common team policy: rebase your feature branch onto main while you work, then merge (or squash-merge) the PR.</p>
  </div>
  <div class="qa">
    <span class="q">Explain the three modes of git reset.</span>
    <p>All three move the branch pointer. <code>--soft</code> stops there, leaving your changes staged. <code>--mixed</code> (the default) also resets the staging area, leaving changes unstaged in your files. <code>--hard</code> also overwrites your working directory, which discards uncommitted work permanently.</p>
  </div>
  <div class="qa">
    <span class="q">When would you use revert instead of reset?</span>
    <p>Whenever the commit is already pushed. Revert adds a new inverse commit, so nobody else's history breaks and the record honestly shows the change went in and came back out. Reset rewrites history and would force everyone else to recover.</p>
  </div>
  <div class="qa">
    <span class="q">What does interactive rebase let you do?</span>
    <p>Rewrite a branch before review: squash noisy commits together, reword messages, drop commits entirely, reorder them, or pause on one to amend the code. The goal is a set of commits that each represent one coherent, revertable change.</p>
  </div>
  <div class="qa">
    <span class="q">Cherry-pick — what is it and what's the catch?</span>
    <p>It applies one commit's changes onto a different branch, typically to backport a fix onto a release branch. The catch is that it creates a new commit with a new ID, so the same change now exists in two places in the graph, which can surface as a duplicate conflict when those branches later merge.</p>
  </div>

  <h3>Senior</h3>

  <div class="qa">
    <span class="q">How does Git store data internally?</span>
    <p>As a content-addressable object database with four object types — blobs (file contents), trees (directory listings), commits (a tree pointer plus parent pointers and metadata), and tags. Each object's ID is a hash of its contents, so identical content is stored once and any modification to history changes every downstream hash.</p>
  </div>
  <div class="qa">
    <span class="q">A teammate force-pushed and wiped a day of commits. Recover it.</span>
    <p>The commits still exist locally on anyone who had fetched them. Find them in <code>git reflog</code> (or the remote host's activity/events log for the old SHA), create a branch pointing at the lost commit, verify, then push it back. Afterwards, enable branch protection to block force pushes on shared branches and standardise on <code>--force-with-lease</code>.</p>
  </div>
  <div class="qa">
    <span class="q">A regression appeared somewhere in 400 commits. Find it.</span>
    <p><code>git bisect</code>. Mark a known-good commit and the current bad one; Git binary-searches, checking out midpoints for you to test. About nine steps for 400 commits. With a scripted test, <code>git bisect run ./test.sh</code> automates it entirely.</p>
  </div>
  <div class="qa">
    <span class="q">Which branching strategy would you pick for this team, and why?</span>
    <p>Tie it to release cadence. Continuous deployment of a web app — GitHub Flow or trunk-based, because long-lived branches only add merge pain when you ship daily. Multiple supported released versions or on-prem customers — something Git Flow-shaped, because you genuinely need release and hotfix branches. Then name the cost you're accepting: trunk-based needs feature flags and strong CI; Git Flow needs constant merging between long-lived branches.</p>
  </div>
  <div class="qa">
    <span class="q">A secret got committed and pushed. What now?</span>
    <p>Rotate the credential immediately — treat it as compromised the moment it left the machine. Then purge it from history with <code>git filter-repo</code> or BFG, force-push, and have everyone re-clone since their existing clones still contain it. Ask the host to clear cached views of orphaned commits and check for forks. Longer term, add secret scanning in CI and a pre-commit hook.</p>
  </div>
  <div class="qa">
    <span class="q">How would you speed up Git in a large monorepo?</span>
    <p>Shallow or partial clones in CI (<code>--depth 1</code>, <code>--filter=blob:none</code>), sparse-checkout so developers only materialise the directories they work in, Git LFS for large binaries, <code>git maintenance</code> with the commit-graph enabled for faster log and merge-base operations, and shorter-lived branches to cut merge cost.</p>
  </div>

  <div class="sticky mint">
    <span class="ttl">How to answer well</span>
    <p>
      Name the concept, then give one concrete situation where you
      used it. "Rebase rewrites commits so their hashes change" is
      a textbook answer. "We rebase feature branches so main stays
      linear, but never after opening a PR, because reviewers
      lose their comment threads" tells the interviewer you've
      actually lived with the trade-off.
    </p>
  </div>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#danger"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>Danger zone</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
    <a class="btn pagebtn pagebtn--next" href="#cheat"><span><span class="btn__hint">next</span>Cheat sheet</span><span aria-hidden="true">→</span></a>
  </nav>
</section>

<section class="sheet chapter" id="cheat" aria-labelledby="cheat-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">G16</span>
    <h2 id="cheat-title">Cheat sheet</h2>
  </div>

  <h3>One-time setup on a new machine</h3>
  <p class="sub">worth doing properly, once</p>
  <div class="codeblock">
    <pre><code>git config --global user.name "Your Name"
git config --global user.email "you@company.com"
git config --global init.defaultBranch main
git config --global pull.rebase true
git config --global push.autoSetupRemote true   <span class="c"># no more "set upstream" errors</span>
git config --global merge.conflictstyle zdiff3
git config --global rerere.enabled true
git config --global fetch.prune true
git config --global core.editor "code --wait"

<span class="c"># aliases that earn their keep</span>
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.st "status -sb"
git config --global alias.last "log -1 --stat"
git config --global alias.unstage "restore --staged"
git config --global alias.please "push --force-with-lease"</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <h3>Command reference</h3>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Command</th><th>Does</th></tr>
      </thead>
      <tbody>
        <tr><td><code>git init</code></td><td>Start tracking a folder</td></tr>
        <tr><td><code>git clone &lt;url&gt;</code></td><td>Copy a remote repo, full history included</td></tr>
        <tr><td><code>git status -sb</code></td><td>Compact state of your tree</td></tr>
        <tr><td><code>git add -p</code></td><td>Stage changes hunk by hunk</td></tr>
        <tr><td><code>git commit -m "..."</code></td><td>Snapshot the staged changes</td></tr>
        <tr><td><code>git commit --amend</code></td><td>Rewrite the last commit (unpushed only)</td></tr>
        <tr><td><code>git switch -c &lt;name&gt;</code></td><td>Create and move to a branch</td></tr>
        <tr><td><code>git restore &lt;file&gt;</code></td><td>Discard changes to a file</td></tr>
        <tr><td><code>git diff --staged</code></td><td>See exactly what you're about to commit</td></tr>
        <tr><td><code>git fetch --prune</code></td><td>Update remote refs, drop deleted ones</td></tr>
        <tr><td><code>git merge --no-ff &lt;b&gt;</code></td><td>Merge and always record a merge commit</td></tr>
        <tr><td><code>git rebase -i &lt;base&gt;</code></td><td>Rewrite your branch's commits</td></tr>
        <tr><td><code>git reset --soft HEAD~1</code></td><td>Undo last commit, keep everything staged</td></tr>
        <tr><td><code>git revert &lt;sha&gt;</code></td><td>Safely undo a pushed commit</td></tr>
        <tr><td><code>git stash -u</code></td><td>Park all changes including untracked</td></tr>
        <tr><td><code>git cherry-pick &lt;sha&gt;</code></td><td>Apply one commit elsewhere</td></tr>
        <tr><td><code>git reflog</code></td><td>Find "lost" commits</td></tr>
        <tr><td><code>git bisect run &lt;cmd&gt;</code></td><td>Auto-find the commit that broke it</td></tr>
        <tr><td><code>git blame -w -C &lt;file&gt;</code></td><td>Who changed each line, ignoring noise</td></tr>
        <tr><td><code>git worktree add &lt;dir&gt; &lt;b&gt;</code></td><td>Second checkout, no stashing</td></tr>
        <tr><td><code>git push --force-with-lease</code></td><td>Force push without clobbering teammates</td></tr>
      </tbody>
    </table>
  </div>

  <h3>How to actually learn this</h3>
  <ol>
    <li>Make a throwaway repo today. Deliberately break it — hard reset too far, force push over yourself, create a conflict on purpose — and recover each time. Confidence comes from having already broken things somewhere it didn't matter.</li>
    <li>Run <code>git lg</code> after every operation for a week. Watching the graph move is how the pointer model stops being abstract.</li>
    <li>Read your own diff before every commit. It's the highest-value habit on this page.</li>
    <li>When you're stuck, ask "where is the pointer, and where do I want it?" That question answers most Git problems.</li>
  </ol>

  <nav class="chapter__foot" aria-label="Chapter navigation">
    <a class="btn pagebtn" href="#interview"><span aria-hidden="true">←</span><span><span class="btn__hint">previous</span>Interview bank</span></a>
    <span class="chapter__foot-spacer"></span>
    <a class="btn btn--ghost" href="#top" title="Back to top">↑ Top</a>
  </nav>
</section>
`;
