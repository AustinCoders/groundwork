import type { GitSection } from "./types";

export const gitBranch: GitSection = {
  id: "branch",
  num: "G5",
  title: "Branches, HEAD, and detached HEAD",
  short: "Branches & HEAD",
  subtitle:
    "A branch is a 41-byte file that names a commit, and HEAD is a file that names a branch. Everything else follows.",
  body: `
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
    <code>main</code> advances and HEAD comes along for the ride,
    because HEAD never named the commit in the first place. It
    named the branch.
  </p>

  <h3>What a branch really is on disk</h3>
  <p>
    A branch is a <em>ref</em>: a name that resolves to one commit
    ID. In a fresh repository each branch is a small text file under
    <code>.git/refs/heads/</code> containing a 40-character hash and
    a newline. Creating a branch writes that file. It copies no
    code and takes no time, which is why Git people branch for
    everything.
  </p>

  <p class="sub">look inside .git</p>
  <div class="codeblock">
    <pre><code>$ cat .git/HEAD
ref: refs/heads/main

$ cat .git/refs/heads/main
c04b8a91e2d7f3a6b5c4d9e8f7a6b5c4d3e2f1a0

$ git symbolic-ref HEAD
refs/heads/main

$ git rev-parse HEAD
c04b8a91e2d7f3a6b5c4d9e8f7a6b5c4d3e2f1a0

$ git rev-parse --abbrev-ref HEAD
main</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    The <code>ref:</code> prefix is what makes HEAD a
    <strong>symbolic ref</strong>: a ref that points at another ref
    rather than at a commit. When you commit, Git follows HEAD to
    <code>refs/heads/main</code> and rewrites <em>that</em> file
    with the new commit's hash. HEAD itself is untouched.
  </p>
  <p>
    Do not rely on reading those files in scripts. Git packs old
    refs into a single <code>.git/packed-refs</code> file, so a
    branch can exist with no file under <code>refs/heads/</code> at
    all, and newer repositories can use the <em>reftable</em>
    format, which stores refs in a binary table. Use
    <code>git rev-parse</code>, <code>git symbolic-ref</code> and
    <code>git for-each-ref</code>. They work whatever the storage.
  </p>

  <figure>
    <svg viewBox="0 0 900 250" class="dg" role="img" aria-label="Two panels. On the left, attached HEAD: HEAD points at the branch main, and main points at the newest commit. On the right, detached HEAD: HEAD points straight at an older commit, while main still points at the newest one.">
      <g class="rough">
        <path d="M450 20 V230" style="stroke: var(--line-soft); stroke-width: 2; fill: none" />
        <path class="ln" d="M70 180 H370" />
        <path class="ln" d="M520 180 H820" />
        <rect x="330" y="40" width="80" height="34" rx="8" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="330" y="104" width="80" height="34" rx="8" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
        <path class="ln" d="M370 74 V100" marker-end="url(#arrow)" />
        <path class="ln" d="M370 138 V168" marker-end="url(#arrow)" />
        <rect x="580" y="104" width="80" height="34" rx="8" style="fill: var(--sheet-2); stroke: var(--red); stroke-width: 1.6" />
        <rect x="780" y="104" width="80" height="34" rx="8" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
        <path class="lnr" d="M620 138 V168" marker-end="url(#arrow-red)" />
        <path class="ln" d="M820 138 V168" marker-end="url(#arrow)" />
        <circle cx="70" cy="180" r="7" style="fill: var(--ink)" />
        <circle cx="170" cy="180" r="7" style="fill: var(--ink)" />
        <circle cx="270" cy="180" r="7" style="fill: var(--ink)" />
        <circle cx="370" cy="180" r="9" style="fill: var(--ink)" />
        <circle cx="520" cy="180" r="7" style="fill: var(--ink)" />
        <circle cx="620" cy="180" r="9" style="fill: var(--sheet); stroke: var(--red); stroke-width: 3" />
        <circle cx="720" cy="180" r="7" style="fill: var(--ink)" />
        <circle cx="820" cy="180" r="9" style="fill: var(--ink)" />
      </g>
      <text class="sm" x="40" y="34">ATTACHED</text>
      <text class="sm" x="40" y="62">.git/HEAD holds:</text>
      <text class="sm" x="40" y="82">ref: refs/heads/main</text>
      <text class="lbl" x="370" y="62" text-anchor="middle">HEAD</text>
      <text class="lbl gr" x="370" y="126" text-anchor="middle">main</text>
      <text class="sm" x="70" y="212" text-anchor="middle">1a0c3e</text>
      <text class="sm" x="170" y="212" text-anchor="middle">9c2d4e</text>
      <text class="sm" x="270" y="212" text-anchor="middle">7d21e0</text>
      <text class="sm" x="370" y="212" text-anchor="middle">c04b8a</text>
      <text class="sm" x="490" y="34">DETACHED</text>
      <text class="sm" x="490" y="62">.git/HEAD holds:</text>
      <text class="sm" x="490" y="82">9c2d4e7a...</text>
      <text class="lbl rd" x="620" y="126" text-anchor="middle">HEAD</text>
      <text class="lbl gr" x="820" y="126" text-anchor="middle">main</text>
      <text class="sm" x="520" y="212" text-anchor="middle">1a0c3e</text>
      <text class="sm" x="620" y="212" text-anchor="middle">9c2d4e</text>
      <text class="sm" x="720" y="212" text-anchor="middle">7d21e0</text>
      <text class="sm" x="820" y="212" text-anchor="middle">c04b8a</text>
    </svg>
    <figcaption>
      Attached, HEAD names a branch and a new commit moves the
      branch. Detached, HEAD names a commit directly, so a new commit
      moves only HEAD and no branch remembers it.
    </figcaption>
  </figure>

  <h3>switch and checkout</h3>
  <p>
    <code>git checkout</code> does two unrelated jobs: it moves HEAD
    between branches, and it overwrites files in your working tree
    from some commit. The same command with slightly different
    arguments can either change branch or silently throw away your
    edits to a file. Git 2.23 split it into two commands with
    narrower jobs: <code>git switch</code> for branches and
    <code>git restore</code> for files. <code>checkout</code> still
    works and is not going away, but the new pair is harder to
    misuse.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Goal</th><th>Old way</th><th>New way</th></tr>
      </thead>
      <tbody>
        <tr><td>Go to an existing branch</td><td><code>git checkout main</code></td><td><code>git switch main</code></td></tr>
        <tr><td>Create a branch and go to it</td><td><code>git checkout -b feat/x</code></td><td><code>git switch -c feat/x</code></td></tr>
        <tr><td>Create it from a given start point</td><td><code>git checkout -b feat/x origin/main</code></td><td><code>git switch -c feat/x origin/main</code></td></tr>
        <tr><td>Go back to the previous branch</td><td><code>git checkout -</code></td><td><code>git switch -</code></td></tr>
        <tr><td>Look at an old commit or tag</td><td><code>git checkout v2.1.0</code></td><td><code>git switch --detach v2.1.0</code></td></tr>
        <tr><td>Discard edits to one file</td><td><code>git checkout -- app.js</code></td><td><code>git restore app.js</code></td></tr>
      </tbody>
    </table>
  </div>

  <p>
    One detail makes <code>switch</code> safer: it will not detach
    HEAD unless you ask. <code>git switch v2.1.0</code> fails with
    <code>fatal: a branch is expected, got tag 'v2.1.0'</code> and a
    hint to add <code>--detach</code>, where <code>checkout</code>
    would quietly detach you. And if you
    run <code>git switch feat/search</code> when only
    <code>origin/feat/search</code> exists, both commands create a
    local branch that tracks it. That shortcut is called
    <em>DWIM</em> ("do what I mean"), and it only fires when exactly
    one remote has a branch by that name.
  </p>

  <h3>Detached HEAD</h3>
  <p>
    Check out a commit directly and HEAD now holds a commit ID with
    no branch in between. It is not an error. Git puts you there on
    purpose in several places:
  </p>
  <ul>
    <li>checking out a tag or a commit hash to look at old code;</li>
    <li>during <code>git bisect</code>, which walks you across commits;</li>
    <li>in the middle of a rebase, while commits are replayed one by one;</li>
    <li>inside a submodule, which records a commit, not a branch;</li>
    <li>in most CI systems, which check out the exact commit under test.</li>
  </ul>
  <p>
    The only risk is commits you make there. They belong to no
    branch, so once HEAD moves away, nothing points at them. Git
    warns you as you leave:
  </p>

  <p class="sub">leaving a detached HEAD with work on it</p>
  <div class="codeblock">
    <pre><code>$ git switch main
Warning: you are leaving 2 commits behind, not connected to
any of your branches:

  7c1a9e0 Try a bigger read buffer
  4b7e21d Log the queue depth

If you want to keep them by creating a new branch, this may be a good time
to do so with:

 git branch &lt;new-branch-name&gt; 7c1a9e0

Switched to branch 'main'</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <figure>
    <svg viewBox="0 0 900 290" class="dg" role="img" aria-label="A main branch of three commits with main and HEAD on the last one. From the second commit, two commits made while detached branch off in red with no label on them. A green box with the command git switch -c rescue points at the last red commit.">
      <g class="rough">
        <path class="ln" d="M80 200 H420" />
        <path class="lnr dash" d="M200 200 C250 200 250 120 300 120 H440" />
        <rect x="560" y="100" width="300" height="40" rx="9" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
        <path class="lng" d="M560 120 H454" marker-end="url(#arrow-green)" />
        <circle cx="80" cy="200" r="7" style="fill: var(--ink)" />
        <circle cx="200" cy="200" r="7" style="fill: var(--ink)" />
        <circle cx="420" cy="200" r="9" style="fill: var(--ink)" />
        <circle cx="300" cy="120" r="8" style="fill: var(--sheet); stroke: var(--red); stroke-width: 3" />
        <circle cx="440" cy="120" r="8" style="fill: var(--sheet); stroke: var(--red); stroke-width: 3" />
      </g>
      <text class="sm" x="300" y="96" text-anchor="middle">4b7e21d</text>
      <text class="sm" x="440" y="96" text-anchor="middle">7c1a9e0</text>
      <text class="lbl rd" x="370" y="52" text-anchor="middle">no branch points here</text>
      <text class="lbl" x="710" y="126" text-anchor="middle">git switch -c rescue 7c1a9e0</text>
      <text class="sm" x="80" y="232" text-anchor="middle">1a0c3e</text>
      <text class="sm" x="200" y="232" text-anchor="middle">9c2d4e</text>
      <text class="lbl" x="440" y="205">main ← HEAD</text>
      <text class="sm" x="80" y="272">Until you name them, only the reflog remembers these two commits. gc may delete them after about 30 days.</text>
    </svg>
    <figcaption>
      Commits made while detached are real commits. They are just
      unreachable: no branch, tag or HEAD leads to them. Giving the
      tip a branch name makes the whole chain reachable again.
    </figcaption>
  </figure>

  <p class="sub">keeping work made in a detached HEAD</p>
  <div class="codeblock">
    <pre><code>$ git switch -c rescue/read-buffer
Switched to a new branch 'rescue/read-buffer'

$ git reflog -5
2f6a0b3 (HEAD -&gt; main) HEAD@{0}: checkout: moving from 7c1a9e0 to main
7c1a9e0 HEAD@{1}: commit: Try a bigger read buffer
4b7e21d HEAD@{2}: commit: Log the queue depth
9c2d4e7 (tag: v2.1.0) HEAD@{3}: checkout: moving from main to v2.1.0
2f6a0b3 (HEAD -&gt; main) HEAD@{4}: commit: Update changelog

$ git branch rescue/read-buffer 7c1a9e0</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    The first command is for when you are still detached: it names
    the commits where they stand. The other two are for when you
    already switched away: the reflog is your local diary of every
    place HEAD has been, so the lost tip is sitting in it.
    Unreachable reflog entries expire after 30 days by default
    (<code>gc.reflogExpireUnreachable</code>), and only then can
    <code>git gc</code> delete the commits, so you have a generous
    window. The reflog is local, though: a teammate's clone knows
    nothing about your lost commits.
  </p>

  <h3>Upstream tracking</h3>
  <p>
    A local branch can have an <strong>upstream</strong>: a
    remote-tracking branch it is paired with. The pairing lives in
    <code>.git/config</code> as two keys,
    <code>branch.&lt;name&gt;.remote</code> and
    <code>branch.&lt;name&gt;.merge</code>. It is what lets a bare
    <code>git pull</code> and <code>git push</code> know where to go,
    and it powers the "ahead 2, behind 3" counts you see in
    <code>git status</code>.
  </p>

  <p class="sub">setting and reading the upstream</p>
  <div class="codeblock">
    <pre><code>$ git push -u origin feat/coupons
branch 'feat/coupons' set up to track 'origin/feat/coupons'.

$ git branch --set-upstream-to=origin/main main
branch 'main' set up to track 'origin/main'.

$ git config --get-regexp '^branch\\.feat/coupons\\.'
branch.feat/coupons.remote origin
branch.feat/coupons.merge refs/heads/feat/coupons

$ git rev-parse --abbrev-ref @{upstream}
origin/feat/coupons

$ git rev-list --left-right --count HEAD...@{u}
2	0</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    <code>@{u}</code> is short for <code>@{upstream}</code>, and you
    can use it anywhere Git expects a commit:
    <code>git log @{u}..</code> lists what you have not pushed yet,
    and <code>git log ..@{u}</code> lists what you have fetched but
    not merged. The last command above prints two numbers:
    commits only on your side, then commits only on the upstream
    side. Remember that the counts compare against your last
    fetch, not against the server right now.
  </p>

  <p class="sub">git branch -vv</p>
  <div class="codeblock">
    <pre><code>$ git branch -vv
* feat/coupons   3e1f0a2 [origin/feat/coupons: ahead 2] Validate coupon expiry
  fix/null-cart  9b04c11 [origin/fix/null-cart: gone] Guard empty cart
  main           c04b8a9 [origin/main: behind 3] Merge pull request #412
  spike/cache    51d7e3a Try an LRU in front of the price API</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    Read each line as: branch, tip commit, upstream and how far
    apart they are, subject line. <code>gone</code> means the
    upstream was deleted on the server and you fetched with
    <code>--prune</code>, which usually means the pull request was
    merged and this branch can go. A branch with no bracket has
    never been pushed.
  </p>

  <h3>Renaming and deleting</h3>
  <p class="sub">rename, locally and on the remote</p>
  <div class="codeblock">
    <pre><code>$ git branch -m feat/coupon feat/coupon-stacking
$ git push origin -u feat/coupon-stacking
$ git push origin --delete feat/coupon</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    A remote has no rename operation, so a rename there is always
    "push the new name, delete the old one". Any open pull request
    on the old name is closed on most hosts, so rename before you
    open one. <code>-M</code> is the forced form of
    <code>-m</code>, which overwrites a branch that already has the
    new name.
  </p>

  <p class="sub">-d versus -D</p>
  <div class="codeblock">
    <pre><code>$ git branch -d spike/cache
error: the branch 'spike/cache' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D spike/cache'
hint: Disable this message with "git config set advice.forceDeleteBranch false"

$ git branch -D spike/cache
Deleted branch spike/cache (was 51d7e3a).</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    <code>-d</code> only deletes a branch whose commits are all
    reachable from its upstream, or from HEAD if it has no upstream.
    That refusal is a safety net, not a nuisance. Note the trap:
    if your team <em>squash-merges</em> pull requests, the branch's
    original commits never land on main. Main gets one new commit
    with the same changes, so Git correctly reports the branch as
    unmerged and you need <code>-D</code>. Even after
    <code>-D</code>, the tip hash is printed and stays in the
    reflog, so the delete is recoverable with
    <code>git branch spike/cache 51d7e3a</code>.
  </p>

  <h3>Asking questions about branches</h3>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Question</th><th>Command</th></tr>
      </thead>
      <tbody>
        <tr><td>Which branches are already in main and safe to delete?</td><td><code>git branch --merged main</code></td></tr>
        <tr><td>Which still have work that is not in main?</td><td><code>git branch --no-merged main</code></td></tr>
        <tr><td>Which branches contain this bug-fix commit?</td><td><code>git branch -a --contains 8f2c9d1</code></td></tr>
        <tr><td>Which release tags contain it?</td><td><code>git tag --contains 8f2c9d1</code></td></tr>
        <tr><td>Most recently touched branches first</td><td><code>git branch --sort=-committerdate</code></td></tr>
        <tr><td>Every branch with its date and author, for a script</td><td><code>git for-each-ref --sort=-committerdate --format='%(committerdate:short) %(refname:short) %(authorname)' refs/heads</code></td></tr>
        <tr><td>The same, as a <code>git branch</code> listing</td><td><code>git branch --format='%(refname:short) %(upstream:track)'</code></td></tr>
        <tr><td>How far every branch is ahead of and behind main, in one pass</td><td><code>git for-each-ref --format='%(refname:short) %(ahead-behind:main)' refs/heads</code> (Git 2.41 and later)</td></tr>
        <tr><td>Is branch A an ancestor of branch B?</td><td><code>git merge-base --is-ancestor A B</code> (exit code 0 means yes)</td></tr>
      </tbody>
    </table>
  </div>

  <p class="sub">cleaning up merged branches</p>
  <div class="codeblock">
    <pre><code>$ git fetch --prune
$ git branch --merged main | grep -vE '^\\*|^[[:space:]]*(main|develop)$' | xargs -r git branch -d
Deleted branch fix/tax-round (was 44a09be).
Deleted branch feat/search-box (was e2c81d0).</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    The pipeline keeps the current branch and your long-lived
    branches out of the list, then deletes the rest with the safe
    <code>-d</code>. Since it uses <code>-d</code>, the worst case
    is a refusal. <code>xargs -r</code> is the GNU spelling for
    "do nothing if the list is empty"; on macOS <code>xargs</code>
    already behaves that way.
  </p>

  <div class="bx is-ref">
    <span class="ttl">Two branches cannot share one checkout</span>
    <p>
      Git refuses to check out a branch that is already checked out
      in another worktree
      (<code>fatal: 'main' is already used by worktree at '../shop-main'</code>).
      That rule is what keeps two working directories from moving
      the same branch under each other. If you want to look at
      main while a feature is half done, add a worktree with
      <code>git worktree add ../shop-main main</code> rather than
      stashing.
    </p>
  </div>

  <div class="bx is-ref">
    <span class="ttl">For seniors: when ref names collide</span>
    <p>
      With the default <em>files</em> ref storage, a branch name is a
      path under <code>.git/refs/heads/</code>. That has two
      consequences teams trip over. On macOS and Windows, whose file
      systems ignore case, <code>Fix/login</code> and
      <code>fix/login</code> are the same file, so a fetch that brings
      both from a Linux user fails or makes one shadow the other. And
      <code>feat</code> and <code>feat/x</code> cannot both exist,
      because one would have to be a file and a directory at once.
      The reftable backend fixes the case problem, since names are no
      longer paths, but Git keeps refusing <code>feat</code> next to
      <code>feat/x</code> on every backend so that repositories stay
      portable. Enforce lower-case prefixes with a server-side rule,
      and run
      <code>git check-ref-format --branch "name"</code> in tooling that
      creates branches, to reject names Git would refuse anyway.
    </p>
  </div>

  <div class="sticky mint">
    <span class="ttl">Naming that pays off</span>
    <p>
      Use a prefix and a ticket ID:
      <code>feat/PAY-231-coupon-stacking</code>,
      <code>fix/PAY-288-null-cart</code>,
      <code>chore/bump-node-20</code>. Six months later, a branch
      list is a readable index of what the team has been doing,
      and tooling can filter on the prefix. One limit: once
      <code>feat</code> exists as a branch, <code>feat/x</code>
      cannot be created, and the other way round.
    </p>
  </div>
`,
};
