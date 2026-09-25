import type { GitSection } from "./types";

export const gitModel: GitSection = {
  id: "model",
  num: "G1",
  title: "The mental model",
  short: "The mental model",
  subtitle:
    "Snapshots, a graph of commits, and branches that are only pointers. Everything else follows from these three.",
  body: `
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
    choice is why Git feels different from SVN or Perforce, where
    the server holds the history and your machine holds a working
    copy.
  </p>

  <p>
    It also changes what a "server" is. GitHub and GitLab hold a
    repository that is no more special than yours. It is the copy
    the team <em>agrees</em> to treat as the shared one. Push and
    fetch are just two repositories exchanging objects they are
    missing.
  </p>

  <p>Three ideas carry almost all the weight:</p>

  <h3>1. A commit is a snapshot, not a diff</h3>
  <p>
    People often picture Git storing "the changes you made." It
    doesn't. Each commit records the
    <em>complete state of your project</em> at that moment. The
    diffs you see in <code>git log -p</code> or a pull request are
    calculated on the fly by comparing two snapshots. Git avoids
    wasting space by storing files by content: if a file didn't
    change between commits, both commits point at the same stored
    copy.
  </p>

  <figure>
    <svg viewBox="0 0 900 310" class="dg" role="img" aria-label="Three commits, each pointing at every file in the project. README.md never changed, so all three commits point at the same stored copy. cart.js changed once, so there are two stored versions. tax.js was added in the third commit.">
      <g class="rough">
        <rect x="60" y="20" width="180" height="56" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="360" y="20" width="180" height="56" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="660" y="20" width="180" height="56" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="40" y="220" width="190" height="64" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="250" y="220" width="190" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="460" y="220" width="190" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="670" y="220" width="190" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <path class="ln" d="M130 76 L130 216" marker-end="url(#arrow)" />
        <path class="ln" d="M190 76 L320 216" marker-end="url(#arrow)" />
        <path class="ln" d="M400 76 L170 216" marker-end="url(#arrow)" />
        <path class="ln" d="M470 76 L530 216" marker-end="url(#arrow)" />
        <path class="ln" d="M700 76 L210 216" marker-end="url(#arrow)" />
        <path class="ln" d="M740 76 L590 216" marker-end="url(#arrow)" />
        <path class="ln" d="M790 76 L765 216" marker-end="url(#arrow)" />
      </g>
      <text class="lbl" x="150" y="46" text-anchor="middle">commit 1</text>
      <text class="sm" x="150" y="66" text-anchor="middle">full snapshot</text>
      <text class="lbl" x="450" y="46" text-anchor="middle">commit 2</text>
      <text class="sm" x="450" y="66" text-anchor="middle">full snapshot</text>
      <text class="lbl" x="750" y="46" text-anchor="middle">commit 3</text>
      <text class="sm" x="750" y="66" text-anchor="middle">full snapshot</text>
      <text class="lbl" x="135" y="246" text-anchor="middle">README.md</text>
      <text class="sm" x="135" y="270" text-anchor="middle">one copy, used 3 times</text>
      <text class="lbl" x="345" y="246" text-anchor="middle">cart.js v1</text>
      <text class="sm" x="345" y="270" text-anchor="middle">used by commit 1</text>
      <text class="lbl" x="555" y="246" text-anchor="middle">cart.js v2</text>
      <text class="sm" x="555" y="270" text-anchor="middle">used by commits 2, 3</text>
      <text class="lbl" x="765" y="246" text-anchor="middle">tax.js v1</text>
      <text class="sm" x="765" y="270" text-anchor="middle">added in commit 3</text>
    </svg>
    <figcaption>
      Every commit points at every file, but a file is stored once per
      distinct content. Three snapshots cost four stored files here,
      not nine. Directories (trees) are left out to keep the picture
      small; the next chapter puts them back.
    </figcaption>
  </figure>

  <p>
    Snapshots make the common operations cheap. Checking out an old
    commit means reading one snapshot, not replaying a thousand
    patches. Comparing any two commits, even ones years apart, is a
    direct comparison. Git does compress similar files against each
    other on disk, inside packfiles, but that is a storage trick
    underneath the model, not the model itself.
  </p>

  <h3>2. History is a directed acyclic graph</h3>
  <p>
    Every commit stores a pointer to its parent (or two parents,
    for a merge). Follow those pointers backwards and you walk the
    whole history. Nothing points forward, and nothing loops, hence
    "acyclic." When you hear people say "the graph," this is it.
    Merging joins two lines; branching splits one.
  </p>

  <figure>
    <svg viewBox="0 0 900 220" class="dg" role="img" aria-label="Seven commits. A is the root with no parent. B points to A. C points to B. On a side line, D points to B and E points to D. M is a merge commit with two parents, C and E. N points to M and is where main is.">
      <g class="rough">
        <path class="ln" d="M204 150 L98 150" marker-end="url(#arrow)" />
        <path class="ln" d="M384 150 L238 150" marker-end="url(#arrow)" />
        <path class="lng" d="M317 70 L234 139" marker-end="url(#arrow-green)" />
        <path class="lng" d="M464 60 L348 60" marker-end="url(#arrow-green)" />
        <path class="ln" d="M604 150 L418 150" marker-end="url(#arrow)" />
        <path class="ln" d="M606 141 L495 70" marker-end="url(#arrow)" />
        <path class="ln" d="M744 150 L638 150" marker-end="url(#arrow)" />
        <circle cx="80" cy="150" r="16" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2.5" />
        <circle cx="220" cy="150" r="16" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2.5" />
        <circle cx="400" cy="150" r="16" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2.5" />
        <circle cx="330" cy="60" r="16" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2.5" />
        <circle cx="480" cy="60" r="16" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2.5" />
        <circle cx="620" cy="150" r="16" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3.5" />
        <circle cx="760" cy="150" r="16" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2.5" />
      </g>
      <text class="sm" x="20" y="22">ARROWS POINT FROM CHILD TO PARENT</text>
      <text class="lbl" x="80" y="156" text-anchor="middle">A</text>
      <text class="lbl" x="220" y="156" text-anchor="middle">B</text>
      <text class="lbl" x="400" y="156" text-anchor="middle">C</text>
      <text class="lbl gr" x="330" y="66" text-anchor="middle">D</text>
      <text class="lbl gr" x="480" y="66" text-anchor="middle">E</text>
      <text class="lbl" x="620" y="156" text-anchor="middle">M</text>
      <text class="lbl" x="760" y="156" text-anchor="middle">N</text>
      <text class="sm gr" x="405" y="30" text-anchor="middle">a feature line</text>
      <text class="sm" x="80" y="196" text-anchor="middle">root: no parent</text>
      <text class="sm" x="620" y="196" text-anchor="middle">merge: two parents</text>
      <text class="lbl" x="788" y="156">main</text>
    </svg>
    <figcaption>
      A commit knows its parents and nothing else. It has no idea
      which children it has, or which branch it was made on. "The
      history of main" is simply every commit you can reach by
      walking the arrows backwards from where <code>main</code>
      points.
    </figcaption>
  </figure>

  <p>
    Two details follow from the way commits are stored. First, a
    commit's ID is a hash of its contents, and its contents include
    its parent's ID. So a commit can never change. If you "edit" one
    with <code>--amend</code> or a rebase, Git writes a brand new
    commit with a new ID, and the old one is still sitting in the
    database. Second, the first commit in a repository has no parent
    (a <em>root</em> commit), a normal commit has one, and a merge
    commit has two or more. A merge with three or more parents is
    called an octopus merge. It is legal but rare.
  </p>

  <h3>3. A branch is a movable pointer</h3>
  <p>
    This is the one that unlocks everything. A branch is not a
    folder, not a copy of your code, not a container of commits. It
    is a 41-byte file: a 40-character commit ID and a newline.
    <code>main</code> is a sticky note stuck to a commit. When you
    commit, Git moves the sticky note forward one node. Creating a
    branch is instant because it writes one small file.
  </p>

  <p class="sub">proof: a branch really is one line of text</p>
  <div class="codeblock">
    <pre><code>$ cat .git/refs/heads/main
a3f9c1d8e2b47f0c9a1e6d3b5f8c2a7e4d0b9f16

$ cat .git/HEAD
ref: refs/heads/main

$ git rev-parse main
a3f9c1d8e2b47f0c9a1e6d3b5f8c2a7e4d0b9f16</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    The first file is the branch. The second is <code>HEAD</code>,
    which says which branch you are on. If <code>cat</code> fails
    with "No such file", the branch has been moved into
    <code>.git/packed-refs</code> by housekeeping. The pointer is the
    same, just stored in a shared file. <code>git rev-parse</code>
    reads either form, which is why scripts should use it.
  </p>

  <figure>
    <svg viewBox="0 0 900 250" class="dg" role="img" aria-label="Before a commit, HEAD points to main and main points to commit C. After git commit, a new commit D exists whose parent is C, and main now points to D. HEAD still points to main.">
      <g class="rough">
        <rect x="235" y="25" width="70" height="32" rx="8" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
        <rect x="235" y="95" width="70" height="32" rx="8" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <path class="ln" d="M270 57 V91" marker-end="url(#arrow)" />
        <path class="ln" d="M270 127 V152" marker-end="url(#arrow)" />
        <path class="ln" d="M156 170 H88" marker-end="url(#arrow)" />
        <path class="ln" d="M256 170 H188" marker-end="url(#arrow)" />
        <circle cx="70" cy="170" r="14" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2.5" />
        <circle cx="170" cy="170" r="14" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2.5" />
        <circle cx="270" cy="170" r="14" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2.5" />
        <path d="M445 20 V230" style="stroke: var(--line-soft); stroke-width: 1.5; stroke-dasharray: 6 6; fill: none" />
        <rect x="785" y="25" width="70" height="32" rx="8" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
        <rect x="785" y="95" width="70" height="32" rx="8" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <path class="ln" d="M820 57 V91" marker-end="url(#arrow)" />
        <path class="ln" d="M820 127 V152" marker-end="url(#arrow)" />
        <path class="ln" d="M606 170 H538" marker-end="url(#arrow)" />
        <path class="ln" d="M706 170 H638" marker-end="url(#arrow)" />
        <path class="lng" d="M806 170 H738" marker-end="url(#arrow-green)" />
        <circle cx="520" cy="170" r="14" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2.5" />
        <circle cx="620" cy="170" r="14" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2.5" />
        <circle cx="720" cy="170" r="14" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2.5" />
        <circle cx="820" cy="170" r="14" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2.5" />
      </g>
      <text class="sm" x="270" y="46" text-anchor="middle">HEAD</text>
      <text class="sm" x="270" y="116" text-anchor="middle">main</text>
      <text class="sm" x="70" y="175" text-anchor="middle">A</text>
      <text class="sm" x="170" y="175" text-anchor="middle">B</text>
      <text class="sm" x="270" y="175" text-anchor="middle">C</text>
      <text class="sm" x="225" y="116" text-anchor="end">one 41-byte file</text>
      <text class="lbl" x="220" y="226" text-anchor="middle">before</text>
      <text class="sm" x="820" y="46" text-anchor="middle">HEAD</text>
      <text class="sm" x="820" y="116" text-anchor="middle">main</text>
      <text class="sm" x="520" y="175" text-anchor="middle">A</text>
      <text class="sm" x="620" y="175" text-anchor="middle">B</text>
      <text class="sm" x="720" y="175" text-anchor="middle">C</text>
      <text class="sm gr" x="820" y="175" text-anchor="middle">D</text>
      <text class="sm" x="775" y="116" text-anchor="end">rewritten to point at D</text>
      <text class="lbl" x="670" y="226" text-anchor="middle">after git commit</text>
    </svg>
    <figcaption>
      A commit does three things: writes the new objects, writes a
      commit whose parent is the old tip, and overwrites the branch
      file with the new ID. <code>HEAD</code> did not change at all.
      It still says "I am on main".
    </figcaption>
  </figure>

  <h3>HEAD: where you are</h3>
  <p>
    <code>HEAD</code> is usually a <em>symbolic</em> reference: it
    names a branch, and the branch names a commit. That indirection
    is what makes <code>git commit</code> move the right branch.
    When <code>HEAD</code> holds a commit ID directly, instead of a
    branch name, you are in <strong>detached HEAD</strong>. You can
    still commit, but no branch moves to follow you, so those commits
    are easy to lose when you switch away. The Branches chapter
    covers the recovery.
  </p>

  <h3>Reasoning with the graph: ancestry</h3>
  <p>
    Almost every question you ask Git is really a question about
    reachability. Commit X is an <strong>ancestor</strong> of Y if
    you can reach X by walking parent arrows back from Y. A branch
    "contains" a commit when the commit is an ancestor of the branch
    tip (or is the tip itself). Using the graph above:
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Question</th><th>Answer from the graph</th><th>Command that asks it</th></tr>
      </thead>
      <tbody>
        <tr><td>Is my fix in main yet?</td><td>Yes if the fix commit is an ancestor of main's tip.</td><td><code>git branch --contains &lt;sha&gt;</code></td></tr>
        <tr><td>Can main fast-forward to feature?</td><td>Only if main's tip is an ancestor of feature's tip.</td><td><code>git merge-base --is-ancestor main feature</code></td></tr>
        <tr><td>Where did these branches split?</td><td>The newest common ancestor: B.</td><td><code>git merge-base main feature</code></td></tr>
        <tr><td>How far ahead and behind am I?</td><td>Count commits reachable from one side only.</td><td><code>git rev-list --left-right --count main...feature</code></td></tr>
        <tr><td>Which release first shipped this?</td><td>A tag that contains it, printed like <code>v1.2~3</code>: three commits before v1.2.</td><td><code>git describe --contains &lt;sha&gt;</code></td></tr>
      </tbody>
    </table>
  </div>

  <p>
    The merge base matters more than it looks. A three-way merge
    compares both tips against the merge base, not against each
    other. That is how Git can tell "you changed this line and they
    didn't" from "you both changed this line", which is the only case
    it calls a conflict.
  </p>

  <h3>Naming commits without copying hashes</h3>
  <p>
    Anywhere Git wants a commit, it accepts a <em>revision</em>
    expression. These are worth knowing by heart:
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>You type</th><th>It means</th></tr>
      </thead>
      <tbody>
        <tr><td><code>HEAD</code>, <code>@</code></td><td>The commit you have checked out.</td></tr>
        <tr><td><code>HEAD~3</code></td><td>Three steps back, always following the first parent.</td></tr>
        <tr><td><code>M^2</code></td><td>The second parent of a merge. <code>M^</code> alone is <code>M^1</code>, the first parent.</td></tr>
        <tr><td><code>main@{2}</code></td><td>Where main pointed two moves ago, from your reflog.</td></tr>
        <tr><td><code>main@{yesterday}</code></td><td>Where main pointed yesterday, on this machine.</td></tr>
        <tr><td><code>@{u}</code></td><td>The upstream of the current branch, such as <code>origin/main</code>.</td></tr>
        <tr><td><code>@{-1}</code></td><td>The branch you were on before this one. <code>git switch -</code> uses it.</td></tr>
        <tr><td><code>v1.0^{}</code></td><td>Peel the tag v1.0 down to the commit it marks.</td></tr>
        <tr><td><code>:/cart total</code></td><td>The newest commit whose message matches "cart total".</td></tr>
        <tr><td><code>HEAD:src/cart.js</code></td><td>Not a commit: the file <code>src/cart.js</code> as it is in <code>HEAD</code>.</td></tr>
      </tbody>
    </table>
  </div>

  <p>
    <code>~</code> and <code>^</code> only differ at merges.
    <code>M~1</code> and <code>M^1</code> are both C in the graph
    above; <code>M^2</code> is E, a commit <code>M~</code> can never
    reach. The first parent of a merge is the branch you were on when
    you merged, so <code>git log --first-parent main</code> reads main
    as a clean list of "what landed", one entry per merged pull
    request.
  </p>

  <h3>Range notation: A..B and A...B</h3>
  <p>
    Git's range syntax is set arithmetic on reachability, and it
    trips up even experienced users. Here is the graph it is easiest
    to reason with: main and feature split at B, main gained C, and
    feature gained D and E.
  </p>

  <figure>
    <svg viewBox="0 0 900 250" class="dg" role="img" aria-label="Two copies of the same graph. On the left, git log main..feature selects D and E, the commits reachable from feature but not from main. On the right, git log main...feature selects C, D and E, the commits reachable from either tip but not from both.">
      <g class="rough">
        <path class="ln" d="M136 170 H86" marker-end="url(#arrow)" />
        <path class="ln" d="M226 170 H166" marker-end="url(#arrow)" />
        <path class="ln" d="M221 90 L161 158" marker-end="url(#arrow)" />
        <path class="ln" d="M306 80 H246" marker-end="url(#arrow)" />
        <circle cx="70" cy="170" r="14" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2.5" />
        <circle cx="150" cy="170" r="14" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2.5" />
        <circle cx="240" cy="170" r="14" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2.5" />
        <circle cx="230" cy="80" r="14" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 3" />
        <circle cx="320" cy="80" r="14" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 3" />
        <path d="M450 20 V230" style="stroke: var(--line-soft); stroke-width: 1.5; stroke-dasharray: 6 6; fill: none" />
        <path class="ln" d="M576 170 H526" marker-end="url(#arrow)" />
        <path class="ln" d="M666 170 H606" marker-end="url(#arrow)" />
        <path class="ln" d="M661 90 L601 158" marker-end="url(#arrow)" />
        <path class="ln" d="M746 80 H686" marker-end="url(#arrow)" />
        <circle cx="510" cy="170" r="14" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2.5" />
        <circle cx="590" cy="170" r="14" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2.5" />
        <circle cx="680" cy="170" r="14" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 3" />
        <circle cx="670" cy="80" r="14" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 3" />
        <circle cx="760" cy="80" r="14" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 3" />
      </g>
      <text class="lbl" x="30" y="32">git log main..feature</text>
      <text class="sm" x="70" y="175" text-anchor="middle">A</text>
      <text class="sm" x="150" y="175" text-anchor="middle">B</text>
      <text class="sm" x="240" y="175" text-anchor="middle">C</text>
      <text class="sm gr" x="230" y="85" text-anchor="middle">D</text>
      <text class="sm gr" x="320" y="85" text-anchor="middle">E</text>
      <text class="lbl" x="262" y="175">main</text>
      <text class="lbl" x="342" y="85">feature</text>
      <text class="sm" x="30" y="222">in feature, not in main: D, E</text>
      <text class="lbl" x="470" y="32">git log main...feature</text>
      <text class="sm" x="510" y="175" text-anchor="middle">A</text>
      <text class="sm" x="590" y="175" text-anchor="middle">B</text>
      <text class="sm gr" x="680" y="175" text-anchor="middle">C</text>
      <text class="sm gr" x="670" y="85" text-anchor="middle">D</text>
      <text class="sm gr" x="760" y="85" text-anchor="middle">E</text>
      <text class="lbl" x="702" y="175">main</text>
      <text class="lbl" x="782" y="85">feature</text>
      <text class="sm" x="470" y="222">in either, but not in both: C, D, E</text>
    </svg>
    <figcaption>
      Two dots: "reachable from the right side, minus everything
      reachable from the left". Three dots: "reachable from exactly
      one side", the symmetric difference. A and B are reachable from
      both tips, so neither form ever shows them.
    </figcaption>
  </figure>

  <p class="sub">the same graph, in a real repository</p>
  <div class="codeblock">
    <pre><code>$ git log --oneline --graph --all
* 4fc8819 E
* 77889d9 D
| * d517f81 C
|/
* 3db0ce5 B
* 944e723 A

$ git log --oneline main..feature
4fc8819 E
77889d9 D

$ git log --oneline --left-right main...feature
&lt; d517f81 C
&gt; 4fc8819 E
&gt; 77889d9 D

$ git merge-base main feature
3db0ce5e7218e32789953cc5af7762c8e52d1093

$ git rev-list --left-right --count main...feature
1	2</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    <code>--left-right</code> marks which side each commit came from,
    and the last line reads "main has 1 commit feature lacks, feature
    has 2 that main lacks". That pair is exactly what
    <code>git status</code> prints as "ahead 2, behind 1".
    <code>main..feature</code> is shorthand for
    <code>feature ^main</code>, and the caret form scales:
    <code>git log release ^main ^hotfix</code> shows what is only on
    release.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Expression</th><th>With git log</th><th>With git diff</th></tr>
      </thead>
      <tbody>
        <tr><td><code>A..B</code></td><td>Commits in B that are not in A. "What would merging B bring in?"</td><td>Same as <code>git diff A B</code>: the two tips compared directly.</td></tr>
        <tr><td><code>A...B</code></td><td>Commits in either, not both.</td><td>Changes on B since it split from A: <code>git diff $(git merge-base A B) B</code>. This is what a pull request shows.</td></tr>
        <tr><td><code>origin/main..</code></td><td>An empty side means <code>HEAD</code>: your unpushed commits.</td><td>Your changes against the remote tip.</td></tr>
        <tr><td><code>..origin/main</code></td><td>What you would get by pulling.</td><td>The reverse comparison.</td></tr>
      </tbody>
    </table>
  </div>

  <div class="bx is-ref">
    <span class="ttl">The diff trap</span>
    <p>
      <code>git diff main..feature</code> does <em>not</em> mean "the
      commits in the range". Diff only compares two snapshots, so two
      dots is just the two tips, and it will show main's newer work
      as if feature had deleted it. When you want "what did this
      branch change", use three dots: <code>git diff main...feature</code>.
    </p>
  </div>

  <h3>Reachability is also garbage collection</h3>
  <p>
    Git keeps everything that can be reached from a reference: a
    branch, a tag, a remote-tracking branch, the stash, or an entry
    in a reflog. Anything else is unreachable. It is not deleted
    straight away. By default <code>git gc</code> keeps unreachable
    objects for two weeks, and reflog entries keep old branch
    positions alive for 30 to 90 days. That window is why a "lost"
    commit after a bad reset is almost always recoverable with
    <code>git reflog</code>, and why a secret you pushed cannot be
    fixed by deleting a branch.
  </p>

  <div class="sticky mint">
    <span class="ttl">Why this matters</span>
    <p>
      Once branches are pointers, the scary commands stop being
      scary. <code>git reset</code> moves a pointer.
      <code>git rebase</code> writes new commits and moves a
      pointer. <code>git merge</code> creates a commit with two
      parents and moves a pointer. You stop memorising and start
      reasoning: draw the graph, ask where each pointer is, and the
      command you need is usually obvious.
    </p>
  </div>
`,
};
