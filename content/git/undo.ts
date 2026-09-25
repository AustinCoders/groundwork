import type { GitSection } from "./types";

export const gitUndo: GitSection = {
  id: "undo",
  num: "G9",
  title: "Undoing anything",
  short: "Undoing anything",
  subtitle:
    "Pick the right undo for the job: restore, reset, revert, amend or reflog, and know what each one can and cannot bring back.",
  body: `
<div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    "I messed up, how do I undo it?" is the most common Git question,
    and the honest answer is <em>it depends what you are undoing</em>.
    Two questions decide it. First, where does the mistake live: in
    your working files, in the staging area (the index), or in a
    commit? Second, has anyone else seen it? A commit that only exists
    on your laptop can be rewritten freely. A commit that has been
    pushed to a shared branch should only ever be undone by adding a
    new commit on top.
  </p>

  <h3>The decision table</h3>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>I want to undo…</th><th>Command</th><th>Safe after a push?</th></tr>
      </thead>
      <tbody>
        <tr><td>Edits to a file, back to the last commit</td><td><code>git restore src/cart.ts</code></td><td>Yes, it is local only</td></tr>
        <tr><td>Some of the edits in a file, hunk by hunk</td><td><code>git restore -p src/cart.ts</code></td><td>Yes</td></tr>
        <tr><td>A file, back to how it was three commits ago</td><td><code>git restore --source=HEAD~3 src/cart.ts</code></td><td>Yes, it only changes your files</td></tr>
        <tr><td>A <code>git add</code> (unstage, keep the edits)</td><td><code>git restore --staged src/cart.ts</code></td><td>Yes</td></tr>
        <tr><td>Adding a new file to tracking</td><td><code>git rm --cached secrets.env</code></td><td>Yes</td></tr>
        <tr><td>The last commit's message</td><td><code>git commit --amend</code></td><td>No, it rewrites the commit</td></tr>
        <tr><td>A file I forgot in the last commit</td><td><code>git add f.ts &amp;&amp; git commit --amend --no-edit</code></td><td>No</td></tr>
        <tr><td>The last commit, keeping its changes staged</td><td><code>git reset --soft HEAD~1</code></td><td>No</td></tr>
        <tr><td>The last commit, keeping its changes unstaged</td><td><code>git reset HEAD~1</code></td><td>No</td></tr>
        <tr><td>The last commit and all its changes</td><td><code>git reset --hard HEAD~1</code></td><td>No, and uncommitted edits are lost</td></tr>
        <tr><td>A commit that is already on a shared branch</td><td><code>git revert &lt;sha&gt;</code></td><td>Yes, this is the tool for it</td></tr>
        <tr><td>A merge that is already on a shared branch</td><td><code>git revert -m 1 &lt;merge-sha&gt;</code></td><td>Yes, but read the merge section below</td></tr>
        <tr><td>A merge or rebase I just finished locally</td><td><code>git reset --hard ORIG_HEAD</code></td><td>No</td></tr>
        <tr><td>A merge or rebase that is still in conflict</td><td><code>git merge --abort</code> / <code>git rebase --abort</code></td><td>Yes, nothing was committed</td></tr>
        <tr><td>A commit I made on main instead of a branch</td><td><code>git branch feat &amp;&amp; git reset --hard origin/main &amp;&amp; git switch feat</code></td><td>Only if you have not pushed main</td></tr>
        <tr><td>A deleted branch, a bad reset, a lost rebase</td><td><code>git reflog</code>, then <code>git branch</code> or <code>git reset</code></td><td>Yes, it is local recovery</td></tr>
        <tr><td>A dropped stash</td><td><code>git fsck --lost-found</code>, then <code>git stash apply &lt;sha&gt;</code></td><td>Yes</td></tr>
        <tr><td>Untracked junk files</td><td><code>git clean -n</code>, then <code>git clean -fd</code></td><td>Yes, but it cannot be undone</td></tr>
      </tbody>
    </table>
  </div>

  <h3>reset's three modes, precisely</h3>
  <p>
    <code>git reset &lt;commit&gt;</code> always does the same first
    step: it moves the branch that HEAD points at to the commit you
    name. The mode decides how far the change spreads from there. Git
    keeps three copies of your project in play: the commit the branch
    points at, the index (what the next commit will contain), and the
    working tree (the files on disk). Each mode overwrites one more of
    them.
  </p>

  <figure>
    <svg viewBox="0 0 900 320" class="dg" role="img" aria-label="Three boxes side by side: HEAD and its branch, the index, and the working tree. Below them, three bars. reset --soft covers only the first box. reset --mixed covers the first two. reset --hard covers all three.">
      <g class="rough">
        <rect x="40" y="30" width="250" height="100" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="325" y="30" width="250" height="100" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="610" y="30" width="250" height="100" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="40" y="160" width="250" height="38" rx="8" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="40" y="212" width="535" height="38" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="40" y="264" width="820" height="38" rx="8" style="fill: var(--dg-box-red); stroke: var(--red); stroke-width: 2" />
      </g>
      <text class="lbl" x="165" y="68" text-anchor="middle">HEAD → branch</text>
      <text class="sm" x="165" y="96" text-anchor="middle">which commit main points at</text>
      <text class="sm" x="165" y="114" text-anchor="middle">(the history)</text>
      <text class="lbl" x="450" y="68" text-anchor="middle">Index</text>
      <text class="sm" x="450" y="96" text-anchor="middle">what your next commit will be</text>
      <text class="sm" x="450" y="114" text-anchor="middle">(the staging area)</text>
      <text class="lbl" x="735" y="68" text-anchor="middle">Working tree</text>
      <text class="sm" x="735" y="96" text-anchor="middle">the files in your editor</text>
      <text class="sm" x="735" y="114" text-anchor="middle">(uncommitted edits live here)</text>
      <text class="lbl" x="165" y="185" text-anchor="middle">reset --soft</text>
      <text class="lbl" x="307" y="237" text-anchor="middle">reset --mixed (the default)</text>
      <text class="lbl rd" x="450" y="289" text-anchor="middle">reset --hard: uncommitted edits are overwritten</text>
    </svg>
    <figcaption>
      Each bar shows what that mode overwrites to match the target
      commit. Anything outside the bar is left exactly as it was.
    </figcaption>
  </figure>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Mode</th><th>Branch</th><th>Index</th><th>Working tree</th><th>Typical use</th></tr>
      </thead>
      <tbody>
        <tr><td><code>--soft</code></td><td>Moves</td><td>Kept</td><td>Kept</td><td>Fold the last few commits into one: <code>git reset --soft HEAD~3 &amp;&amp; git commit</code></td></tr>
        <tr><td><code>--mixed</code></td><td>Moves</td><td>Reset</td><td>Kept</td><td>Uncommit and restage by hand, or split a commit in two</td></tr>
        <tr><td><code>--hard</code></td><td>Moves</td><td>Reset</td><td><strong>Reset</strong></td><td>Throw work away, or snap a branch to <code>origin/main</code></td></tr>
        <tr><td><code>--keep</code></td><td>Moves</td><td>Reset</td><td>Updated, but local edits kept</td><td>A safer <code>--hard</code>: it refuses if it would overwrite a file you have edited</td></tr>
      </tbody>
    </table>
  </div>

  <p>
    With a path, reset behaves differently: <code>git reset HEAD
    src/cart.ts</code> never moves the branch, it only copies that file
    from the commit into the index. That is the old way to unstage a file, and
    it is exactly what <code>git restore --staged</code> does today.
    <code>git restore</code> is the tool for files; <code>git reset</code>
    is the tool for moving branches. Keeping them apart in your head makes
    both easier.
  </p>

  <h3>restore: files, not history</h3>
  <p>
    <code>git restore</code> (Git 2.23 and later) copies file content
    from somewhere into somewhere. By default it copies from the index
    into the working tree, which discards unstaged edits. The flags pick
    the source and the destination.
  </p>
  <pre><code>$ git restore src/cart.ts
$ git restore --staged src/cart.ts
$ git restore --staged --worktree src/cart.ts
$ git restore --source=v2.3.0 src/cart.ts
$ git restore --source=main~5 --staged --worktree -- src/</code></pre>
  <p>
    The first discards unstaged edits. The second takes it out of the index but keeps the
    edits. The third makes both match HEAD. The last two pull an older
    version of a file or folder into your tree without touching history,
    so you can commit the old version as a normal forward change. Before
    2.23 all of this was <code>git checkout -- file</code>, which you will
    still see in older answers online.
  </p>

  <h3>revert: undoing in public</h3>
  <p>
    <code>reset</code> moves the branch backwards, as if the commits
    never happened. <code>revert</code> works out the inverse of a
    commit's diff and records it as a <em>new</em> commit. History only
    grows, so nobody else's clone is contradicted.
  </p>

  <figure>
    <svg viewBox="0 0 900 350" class="dg" role="img" aria-label="Three commit rows. Before: A, B, C, D with main at D. After reset --hard HEAD~2: main points at B, and C and D are drawn dashed because only the reflog still refers to them. After revert of D: A, B, C, D, then a new commit D prime that undoes D, with main at D prime.">
      <g class="rough">
        <path class="ln" d="M240 60 H540" />
        <path class="ln" d="M240 170 H340" />
        <path class="ln dash" d="M340 170 H540" />
        <path class="ln" d="M240 280 H640" />
        <circle cx="240" cy="60" r="8" style="fill: var(--ink)" />
        <circle cx="340" cy="60" r="8" style="fill: var(--ink)" />
        <circle cx="440" cy="60" r="8" style="fill: var(--ink)" />
        <circle cx="540" cy="60" r="8" style="fill: var(--ink)" />
        <circle cx="240" cy="170" r="8" style="fill: var(--ink)" />
        <circle cx="340" cy="170" r="8" style="fill: var(--ink)" />
        <circle cx="440" cy="170" r="8" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2.5" />
        <circle cx="540" cy="170" r="8" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2.5" />
        <circle cx="240" cy="280" r="8" style="fill: var(--ink)" />
        <circle cx="340" cy="280" r="8" style="fill: var(--ink)" />
        <circle cx="440" cy="280" r="8" style="fill: var(--ink)" />
        <circle cx="540" cy="280" r="8" style="fill: var(--ink)" />
        <circle cx="640" cy="280" r="9" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
      </g>
      <text class="sm" x="30" y="64">BEFORE</text>
      <text class="sm" x="30" y="174">RESET --HARD HEAD~2</text>
      <text class="sm" x="30" y="284">REVERT D</text>
      <text class="sm" x="240" y="90" text-anchor="middle">A</text>
      <text class="sm" x="340" y="90" text-anchor="middle">B</text>
      <text class="sm" x="440" y="90" text-anchor="middle">C</text>
      <text class="sm" x="540" y="90" text-anchor="middle">D</text>
      <text class="lbl" x="560" y="65">main</text>
      <text class="sm" x="240" y="200" text-anchor="middle">A</text>
      <text class="sm" x="340" y="200" text-anchor="middle">B</text>
      <text class="sm" x="440" y="200" text-anchor="middle">C</text>
      <text class="sm" x="540" y="200" text-anchor="middle">D</text>
      <text class="lbl" x="340" y="148" text-anchor="middle">main</text>
      <text class="sm" x="490" y="224" text-anchor="middle">only the reflog points here now</text>
      <text class="sm" x="240" y="310" text-anchor="middle">A</text>
      <text class="sm" x="340" y="310" text-anchor="middle">B</text>
      <text class="sm" x="440" y="310" text-anchor="middle">C</text>
      <text class="sm" x="540" y="310" text-anchor="middle">D</text>
      <text class="sm gr" x="640" y="310" text-anchor="middle">D′ undoes D</text>
      <text class="lbl" x="662" y="285">main</text>
    </svg>
    <figcaption>
      Reset rewinds the pointer. Anyone who already pulled C and D now
      disagrees with you. Revert moves forward with a commit whose diff
      is D's diff upside down, so every clone agrees.
    </figcaption>
  </figure>

  <pre><code>$ git revert 8f2c9d1
[main 3b7e1a4] Revert "feat: coupon stacking"
 2 files changed, 4 insertions(+), 31 deletions(-)

$ git revert --no-commit HEAD~3..HEAD
$ git commit -m "Revert the coupon series; breaks tax rounding"</code></pre>
  <p>
    The second form reverts the last three commits as one commit. Ranges
    are applied newest first, which is the order that avoids needless
    conflicts. A revert can conflict just like a merge, if later commits
    touched the same lines. Resolve it, <code>git add</code>, then
    <code>git revert --continue</code>.
  </p>

  <div class="bx is-ref">
    <span class="ttl">The rule</span>
    <p>
      Private, unpushed history: <code>reset</code>, <code>amend</code>
      and rebase are all fine. Shared, pushed history:
      <code>revert</code>. Reverting is honest. The log shows that a change
      went in and was later backed out, which is what happened.
    </p>
  </div>

  <h3>Reverting a merge, and its trap</h3>
  <p>
    A merge commit has two parents, so "the inverse of its diff" is
    ambiguous: the diff against which parent? You must choose with
    <code>-m</code>. <code>-m 1</code> means "keep parent 1", the branch
    you were on when you merged (usually main), and undo everything the
    other side brought in.
  </p>
  <pre><code>$ git revert -m 1 4c1d9e2
[main a07f3b5] Revert "Merge pull request #412 from acme/feature/coupons"
 6 files changed, 12 insertions(+), 188 deletions(-)</code></pre>
  <p>
    This undoes the <em>content</em>, but not the <em>history</em>. The
    feature commits are still ancestors of main. Git decides what a merge
    needs to bring in by walking the graph, and it sees those commits as
    already merged. So when the team fixes the bug on the feature branch
    and merges again, only the new fix arrives. The original work stays
    reverted, and it looks like the merge silently lost code.
  </p>

  <figure>
    <svg viewBox="0 0 900 300" class="dg" role="img" aria-label="A main line with commits A, B, a merge M, a revert R and a second merge M2. A feature branch leaves after B with commits F1 and F2, which merge at M. The branch then gets a fix F3, which merges at M2. M2 brings in only F3, because F1 and F2 are already ancestors of main.">
      <g class="rough">
        <path class="ln" d="M80 100 H760" />
        <path class="lng" d="M200 100 C230 100 230 190 260 190 H380 C430 190 430 100 480 100" />
        <path class="lng" d="M380 190 H660 C710 190 710 100 760 100" />
        <circle cx="80" cy="100" r="8" style="fill: var(--ink)" />
        <circle cx="200" cy="100" r="8" style="fill: var(--ink)" />
        <circle cx="480" cy="100" r="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="600" cy="100" r="9" style="fill: var(--sheet); stroke: var(--red); stroke-width: 3" />
        <circle cx="760" cy="100" r="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="260" cy="190" r="8" style="fill: var(--green)" />
        <circle cx="380" cy="190" r="8" style="fill: var(--green)" />
        <circle cx="660" cy="190" r="8" style="fill: var(--green)" />
      </g>
      <text class="sm" x="80" y="76" text-anchor="middle">A</text>
      <text class="sm" x="200" y="76" text-anchor="middle">B</text>
      <text class="sm" x="480" y="76" text-anchor="middle">M: merge</text>
      <text class="sm rd" x="600" y="76" text-anchor="middle">R: revert -m 1 M</text>
      <text class="sm" x="760" y="76" text-anchor="middle">M2: merge again</text>
      <text class="lbl" x="784" y="105">main</text>
      <text class="sm" x="260" y="220" text-anchor="middle">F1</text>
      <text class="sm" x="380" y="220" text-anchor="middle">F2</text>
      <text class="sm" x="660" y="220" text-anchor="middle">F3: the fix</text>
      <text class="lbl gr" x="320" y="250" text-anchor="middle">feature</text>
      <text class="sm" x="40" y="284">M2 brings in only F3. F1 and F2 are already ancestors of main, so R's undo of them still stands.</text>
    </svg>
    <figcaption>
      The fix is to revert the revert first: <code>git revert R</code>
      puts F1 and F2 back, then the merge of F3 lands on top of them.
    </figcaption>
  </figure>

  <p>
    The alternative is to rebase the feature onto the new main, which
    gives F1 and F2 new IDs, so Git no longer treats them as merged. Both
    work. Reverting the revert is simpler and keeps the story readable.
    Either way, write it in the commit message so the next person
    understands.
  </p>

  <h3>commit --amend</h3>
  <p>
    Amend does not edit a commit. Commits are immutable, because their ID
    is a hash of their content. Amend builds a <em>new</em> commit with
    the same parent, your staged changes and the message you give, and
    moves the branch to it. The old commit is still in the object
    database and in the reflog.
  </p>
  <pre><code>$ git commit --amend -m "fix: round tax per line, not per order"
$ git add tests/tax.test.ts
$ git commit --amend --no-edit
$ git commit --amend --reset-author --no-edit
$ git push --force-with-lease</code></pre>
  <p>
    <code>--reset-author</code> fixes a commit made with the wrong email.
    If the commit was already pushed, the amended one has a different ID,
    so the push is rejected as non-fast-forward. On your own branch,
    <code>--force-with-lease</code> is correct: it refuses if someone else
    pushed in the meantime. On a shared branch, don't amend. For anything
    older than the last commit, use <code>git commit --fixup=&lt;sha&gt;</code>
    and <code>git rebase -i --autosquash</code>.
  </p>

  <h3>ORIG_HEAD: the one-step undo</h3>
  <p>
    Before a command makes a big jump, Git writes the old position to
    <code>.git/ORIG_HEAD</code>. <code>reset</code>, <code>merge</code>,
    <code>rebase</code> and <code>am</code> all set it. So a merge or
    rebase you regret the moment it finishes is one command away:
    <code>git reset --hard ORIG_HEAD</code>. It only holds the most
    recent one, so use it straight away or use the reflog.
  </p>

  <h3>reflog: the undo for your undo</h3>
  <p>
    Every time a ref moves, Git appends a line to a log. There is one log
    for HEAD at <code>.git/logs/HEAD</code> and one per branch under
    <code>.git/logs/refs/heads/</code>. Each line records the old ID, the
    new ID, who, when, and why.
  </p>
  <pre><code>$ tail -n 1 .git/logs/HEAD
8f2c9d1e4b7a0c3f5e6d9b2a1c4f7e0d3b6a9c2e e4f9a01b3c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f Priya Shah &lt;priya@example.com&gt; 1758873600 +0100	reset: moving to HEAD~3

$ git reflog
e4f9a01 (HEAD -&gt; feature/cart) HEAD@{0}: reset: moving to HEAD~3
8f2c9d1 HEAD@{1}: commit: feat: coupon stacking
a1b2c3d HEAD@{2}: commit: feat: coupon field
5e6f7a8 HEAD@{3}: checkout: moving from main to feature/cart

$ git reset --hard 8f2c9d1
HEAD is now at 8f2c9d1 feat: coupon stacking</code></pre>
  <p>
    <code>HEAD@{1}</code> means "where HEAD was one move ago", and you can
    use it anywhere a commit is expected: <code>git diff HEAD@{1}</code>,
    <code>git branch rescue HEAD@{3}</code>. Times work too:
    <code>main@{yesterday}</code>, <code>main@{2.hours.ago}</code>.
    <code>git reflog show feature/cart</code> shows just that branch's
    log.
  </p>

  <h3>How long "recoverable" lasts</h3>
  <p>
    Reflog entries are local. They are never pushed, never cloned, and a fresh
    clone starts with an empty one. They also expire, and garbage
    collection then deletes what nothing points to.
  </p>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Setting</th><th>Default</th><th>Meaning</th></tr>
      </thead>
      <tbody>
        <tr><td><code>gc.reflogExpire</code></td><td>90 days</td><td>Reflog entries for commits still on the branch</td></tr>
        <tr><td><code>gc.reflogExpireUnreachable</code></td><td>30 days</td><td>Reflog entries for commits no longer on the branch, such as those you reset away</td></tr>
        <tr><td><code>gc.pruneExpire</code></td><td>2 weeks</td><td>How old an unreferenced object must be before <code>gc</code> deletes it</td></tr>
      </tbody>
    </table>
  </div>
  <p>
    So a commit you reset away is safe for about a month through the
    reflog, and then for at least two more weeks as a loose object.
    <code>git gc --auto</code> runs by itself after some commands, so
    don't count on anything beyond that. The only way to destroy it
    early is on purpose: <code>git reflog expire --expire=now --all
    &amp;&amp; git gc --prune=now</code>. That is also what you run after
    scrubbing a leaked secret from history, together with rotating the
    secret, since other clones still have it.
  </p>

  <h3>Recovering a deleted branch</h3>
  <p>
    <code>git branch -D</code> deletes the branch and its reflog, but
    HEAD's reflog still remembers the commits you made while you were on
    it. Git also prints the tip ID when it deletes, so check your
    scrollback first.
  </p>
  <pre><code>$ git branch -D feature/coupons
Deleted branch feature/coupons (was 8f2c9d1).

$ git branch feature/coupons 8f2c9d1

$ git reflog | grep feature/coupons
5e6f7a8 HEAD@{4}: checkout: moving from feature/coupons to main</code></pre>
  <p>
    In the reflog, the entry that moved you <em>away</em> from the branch
    shows where you left it: the commit just before that line,
    <code>HEAD@{5}</code>, is the branch tip. If the branch was pushed,
    <code>origin/feature/coupons</code> may still exist locally until you
    run <code>git fetch --prune</code>.
  </p>

  <h3>stash: the parking lot</h3>
  <p>
    <code>git stash</code> takes your uncommitted changes, saves them,
    and resets your files to HEAD, so you can switch branches cleanly.
  </p>
  <pre><code>$ git stash push -m "half-done coupon UI"
Saved working directory and index state On feature/cart: half-done coupon UI

$ git stash list
stash@{0}: On feature/cart: half-done coupon UI
stash@{1}: WIP on main: 5e6f7a8 chore: bump deps

$ git stash pop
$ git stash apply stash@{1}
$ git stash push -u -m "with new files"
$ git stash branch coupon-ui stash@{0}</code></pre>
  <p>
    <code>pop</code> applies the newest stash and drops it if it applied
    cleanly. <code>apply</code> keeps it in the list. Untracked files are
    left behind unless you pass <code>-u</code>, which people forget
    constantly. <code>git stash branch</code> makes a new branch at the
    commit you stashed from and applies the stash there, which avoids
    conflicts when the original branch has moved on.
  </p>
  <div class="bx is-ref">
    <span class="ttl">Stash is not storage</span>
    <p>
      Stashes are local, never pushed, easy to forget and easy to drop.
      If the work matters for more than an afternoon, commit it on a
      scratch branch instead.
    </p>
  </div>

  <h3>Recovering a dropped stash</h3>
  <p>
    A stash is stored as commits, and the stash list is just the reflog
    of <code>refs/stash</code>. <code>git stash drop</code> or
    <code>pop</code> removes the entry, so the stash commit is left
    with nothing pointing to it. It is still in the database until
    <code>gc</code> prunes it. Git prints its full ID when you drop it.
    If that is gone from your screen, ask <code>fsck</code> for dangling
    commits.
  </p>
  <pre><code>$ git fsck --lost-found
Checking object directories: 100% (256/256), done.
dangling commit 5d1e2f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e
dangling commit 9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b
dangling blob 1f2e3d4c5b6a79880a1b2c3d4e5f60718293a4b5

$ git log --oneline --no-walk 5d1e2f0 9c8b7a6
5d1e2f0 WIP on feature/cart: 8f2c9d1 feat: coupon stacking
9c8b7a6 index on feature/cart: 8f2c9d1 feat: coupon stacking

$ git stash apply 5d1e2f0</code></pre>
  <p>
    Look for the <code>WIP on</code> commit (or <code>On branch:</code> if
    you used <code>-m</code>). The <code>index on</code> commit next to it
    is the staged half that the stash recorded separately.
    <code>--lost-found</code> also copies each dangling object into
    <code>.git/lost-found/</code> so you can browse them. Dangling blobs
    are worth checking too: every <code>git add</code> writes a blob, so
    staged work that was never committed can sometimes be rescued with
    <code>git show &lt;blob-sha&gt;</code>.
  </p>

  <h3>git clean: the one undo you can't undo</h3>
  <p>
    <code>git clean</code> deletes untracked files: build output, stray
    logs, the file you forgot to add. Git never stored them, so no
    reflog or fsck can bring them back. It refuses to run without
    <code>-f</code> for that reason.
  </p>
  <pre><code>$ git clean -n -d
Would remove coverage/
Would remove notes.txt
Would remove src/cart.old.ts

$ git clean -fd
$ git clean -fdx
$ git clean -i</code></pre>
  <p>
    <code>-n</code> is a dry run: always run it first. <code>-d</code>
    includes untracked folders. <code>-x</code> also deletes ignored
    files such as <code>node_modules/</code> and <code>.env</code>, which
    is a fresh-checkout reset and is rarely what you want. <code>-X</code>
    deletes only ignored files. <code>-i</code> asks about each one.
  </p>

  <div class="bx is-ref">
    <span class="ttl">Say this out loud once</span>
    <p>
      If it was ever committed, or even staged, it is almost certainly
      recoverable for a few weeks. If it was never added, only your editor's
      local history can save it. Committing often is not just tidiness,
      it is what makes your work rescuable.
    </p>
  </div>
`,
};
