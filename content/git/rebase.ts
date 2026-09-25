import type { GitSection } from "./types";

export const gitRebase: GitSection = {
  id: "rebase",
  num: "G8",
  title: "Rebase — the one people fear",
  short: "Rebase",
  subtitle:
    "Rebase does not move commits. It makes new copies of them on a new base and moves the branch label to the copies.",
  body: `
<div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    Merge <em>joins</em> two histories and records that the join
    happened. Rebase <em>rewrites</em> your commits so they appear
    to have been written on top of the latest main, and the fact
    that you branched off earlier disappears.
  </p>

  <div class="bx is-prim">
    <span class="ttl">In one minute</span>
    <p>
      You started a branch on Monday. By Wednesday main has moved on.
      <code>git fetch</code> then <code>git rebase origin/main</code>
      re-applies your commits one by one on top of today's main, as if
      you had started this morning. Your commits get new IDs, so if
      you had already pushed the branch you must push again with
      <code>git push --force-with-lease</code>. If a commit conflicts,
      fix the file, <code>git add</code> it and run
      <code>git rebase --continue</code>; <code>git rebase --abort</code>
      puts everything back. The one rule: only rebase commits nobody
      else has built on.
    </p>
  </div>

  <h3>What rebase actually does</h3>
  <p>
    <code>git rebase main</code>, run on <code>feature</code>, works
    in four steps:
  </p>
  <ol>
    <li>Find the commits on <code>feature</code> that are not on <code>main</code>: everything after the merge base.</li>
    <li>Check out the tip of <code>main</code>, with HEAD detached.</li>
    <li>Re-apply each of those commits, oldest first, as if by <code>git cherry-pick</code>. Each one makes a new commit.</li>
    <li>Point <code>feature</code> at the last new commit and re-attach HEAD.</li>
  </ol>
  <p>
    A commit's ID is a hash of its contents, and the contents
    include its parent's ID. A replayed commit has a different
    parent, so <strong>every replayed commit gets a brand-new
    ID</strong>, even if the code change is byte for byte the same.
    They are copies. The originals still exist, unreferenced, until
    garbage collection removes them weeks later.
  </p>

  <figure>
    <svg viewBox="0 0 900 380" class="dg" role="img" aria-label="Top, before: main runs A, B, C, D. feature branched from B and has three commits. Bottom, after git rebase main: main is unchanged, and three new commits, copies of the feature commits with new IDs, sit on top of D with feature and HEAD on the last one. The three old commits still hang off B, drawn faded, reachable only from ORIG_HEAD and the reflog.">
      <g class="rough">
        <path class="ln" d="M60 110 H330" />
        <path class="lng" d="M150 110 C190 110 200 60 240 60 H430" />
        <circle cx="60" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="150" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="240" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="330" cy="110" r="9" style="fill: var(--ink)" />
        <circle cx="250" cy="60" r="7" style="fill: var(--green)" />
        <circle cx="340" cy="60" r="7" style="fill: var(--green)" />
        <circle cx="430" cy="60" r="9" style="fill: var(--green)" />
        <path class="ln" d="M60 300 H330" />
        <path class="lng" d="M330 300 C370 300 380 250 420 250 H600" />
        <path class="ln dash" d="M150 300 C190 300 200 350 240 350 H430" style="stroke: var(--line-soft)" />
        <circle cx="60" cy="300" r="7" style="fill: var(--ink)" />
        <circle cx="150" cy="300" r="7" style="fill: var(--ink)" />
        <circle cx="240" cy="300" r="7" style="fill: var(--ink)" />
        <circle cx="330" cy="300" r="9" style="fill: var(--ink)" />
        <circle cx="420" cy="250" r="8" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
        <circle cx="510" cy="250" r="8" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
        <circle cx="600" cy="250" r="9" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
        <circle cx="250" cy="350" r="7" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2; stroke-dasharray: 4 3" />
        <circle cx="340" cy="350" r="7" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2; stroke-dasharray: 4 3" />
        <circle cx="430" cy="350" r="7" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2; stroke-dasharray: 4 3" />
      </g>
      <text class="sm" x="30" y="22">BEFORE</text>
      <text class="sm" x="250" y="42" text-anchor="middle">5a90c2e</text>
      <text class="sm" x="340" y="42" text-anchor="middle">b41f7a3</text>
      <text class="sm" x="430" y="42" text-anchor="middle">e2c81d0</text>
      <text class="lbl gr" x="450" y="65">feature ← HEAD</text>
      <text class="sm" x="60" y="138" text-anchor="middle">A</text>
      <text class="sm" x="150" y="138" text-anchor="middle">B</text>
      <text class="sm" x="240" y="138" text-anchor="middle">C</text>
      <text class="sm" x="330" y="138" text-anchor="middle">D</text>
      <text class="lbl" x="350" y="115">main</text>
      <text class="sm" x="30" y="196">AFTER git rebase main</text>
      <text class="sm" x="420" y="232" text-anchor="middle">9e4f10b</text>
      <text class="sm" x="510" y="232" text-anchor="middle">c7d2a51</text>
      <text class="sm" x="600" y="232" text-anchor="middle">58b3e6f</text>
      <text class="lbl gr" x="620" y="255">feature ← HEAD</text>
      <text class="sm" x="60" y="328" text-anchor="middle">A</text>
      <text class="sm" x="150" y="328" text-anchor="middle">B</text>
      <text class="sm" x="240" y="328" text-anchor="middle">C</text>
      <text class="sm" x="330" y="328" text-anchor="middle">D · main</text>
      <text class="sm" x="450" y="355">old copies: ORIG_HEAD and the reflog still find them</text>
    </svg>
    <figcaption>
      Same changes, new parents, new IDs. main does not move at all.
      Anyone who had the old three commits now has a history that no
      longer matches yours.
    </figcaption>
  </figure>

  <p>
    Two details follow from the cherry-pick model. First, rebase
    skips any commit whose change is already on the new base, by
    comparing <em>patch IDs</em> (a hash of the diff), so a fix that
    was cherry-picked to main does not get applied twice. Second,
    <code>git rebase main</code> is roughly shorthand for
    <code>git rebase --onto main $(git merge-base main HEAD) HEAD</code>:
    "take the commits between the merge base and HEAD, and put them
    on main". Keep that longer form in mind; it explains
    <code>--onto</code> below.
  </p>

  <div class="warn">
    <span class="ttl">The golden rule of rebasing</span>
    Never rebase commits that other people have already pulled.
    Rewriting shared history replaces commits your teammates have
    built on, and every one of them will hit duplicate commits and
    repeat conflicts when they next pull. Rebase freely on your own
    unpushed or unshared branch; use merge or revert on anything
    public. A branch pushed only so CI runs, which nobody else
    commits to, is still yours.
  </div>

  <h3>Interactive rebase: editing history before review</h3>
  <p>
    <code>git rebase -i &lt;base&gt;</code> opens a to-do list of
    every commit after the base, <strong>oldest first</strong> (the
    reverse of <code>git log</code>). Each line is an instruction.
    Change the verb, reorder lines, or delete lines, then save and
    close; Git executes the list top to bottom.
  </p>

  <p class="sub">git rebase -i origin/main</p>
  <div class="codeblock">
    <pre><code>pick 5a90c2e # Add coupon field to cart form
fixup 0c7e1d4 # fixup! Add coupon field to cart form
pick b41f7a3 # Add coupon model
squash 7f2a9b0 # coupon model tests
reword e2c81d0 # Aply coupon before tax
edit 6d3b8c1 # Extract tax helper
drop a4e0f93 # debug logging, remove later
exec npm test</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Command</th><th>Short</th><th>What it does</th></tr>
      </thead>
      <tbody>
        <tr><td><code>pick</code></td><td><code>p</code></td><td>Use the commit as it is</td></tr>
        <tr><td><code>reword</code></td><td><code>r</code></td><td>Use the change, stop to edit the message</td></tr>
        <tr><td><code>edit</code></td><td><code>e</code></td><td>Apply the commit, then stop so you can amend it or split it into several commits; <code>git rebase --continue</code> resumes</td></tr>
        <tr><td><code>squash</code></td><td><code>s</code></td><td>Meld into the commit above and open an editor to combine both messages</td></tr>
        <tr><td><code>fixup</code></td><td><code>f</code></td><td>Meld into the commit above and keep only the message above. <code>fixup -C</code> keeps <em>this</em> commit's message instead</td></tr>
        <tr><td><code>drop</code></td><td><code>d</code></td><td>Remove the commit. Deleting the line does the same</td></tr>
        <tr><td><code>exec</code></td><td><code>x</code></td><td>Run a shell command at this point; stop if it fails</td></tr>
        <tr><td><code>break</code></td><td><code>b</code></td><td>Stop here, as if you had used edit on nothing</td></tr>
        <tr><td><code>label</code>, <code>reset</code>, <code>merge</code></td><td></td><td>Used by <code>--rebase-merges</code> to rebuild merge commits instead of flattening them</td></tr>
        <tr><td><code>update-ref</code></td><td></td><td>Move another branch to this point; written for you by <code>--update-refs</code></td></tr>
      </tbody>
    </table>
  </div>

  <p class="sub">splitting a commit with edit</p>
  <div class="codeblock">
    <pre><code>Stopped at 6d3b8c1...  Extract tax helper
You can amend the commit now, with

  git commit --amend

Once you are satisfied with your changes, run

  git rebase --continue

$ git reset HEAD~
$ git add src/tax.js &amp;&amp; git commit -m "Extract tax helper"
$ git add src/cart.js &amp;&amp; git commit -m "Use tax helper in cart"
$ git rebase --continue
Successfully rebased and updated refs/heads/feature.</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    <code>git reset HEAD~</code> undoes the commit but keeps its
    changes in your working tree, so you can commit them again in
    smaller pieces. The finished branch reads as if you knew exactly
    what you were doing from the start: a few clear commits instead
    of eleven, each one reviewable and revertable on its own.
  </p>
  <p>
    Recent versions of Git write the subject after a <code>#</code>
    as a reminder that only the verb and the ID matter; editing the
    subject there does not change the commit message. That is what
    <code>reword</code> is for.
  </p>
  <p>
    <code>git rebase -x "npm test" origin/main</code> adds an
    <code>exec</code> line after every commit, so the rebase stops
    at the first commit that breaks the tests. That is a cheap way
    to make sure every commit on the branch builds, which keeps
    <code>git bisect</code> useful later.
  </p>

  <h3>--autosquash: fix now, tidy automatically</h3>
  <p>
    During review you find a bug in a commit three back. Instead of
    remembering to fix it up later, make a commit that says which
    commit it belongs to:
  </p>
  <p class="sub">fixup commits</p>
  <div class="codeblock">
    <pre><code>$ git commit --fixup 5a90c2e
[feature 0c7e1d4] fixup! Add coupon field to cart form

$ git commit --squash b41f7a3
$ git commit --fixup=reword:e2c81d0

$ git rebase -i --autosquash origin/main
$ git config --global rebase.autoSquash true</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    <code>--fixup</code> makes a commit whose subject is
    <code>fixup! &lt;original subject&gt;</code>. With
    <code>--autosquash</code>, the to-do list comes up with that
    commit already moved under its target and marked
    <code>fixup</code>; you just save. <code>--squash</code> makes a
    <code>squash!</code> commit that keeps its message for editing,
    and <code>--fixup=reword:</code> makes an <code>amend!</code>
    commit that replaces the target's message. With the config set,
    every interactive rebase does this automatically.
  </p>

  <h3>--onto: moving a branch to a different base</h3>
  <p>
    The full form is
    <code>git rebase --onto &lt;newbase&gt; &lt;upstream&gt; &lt;branch&gt;</code>:
    take the commits in <code>branch</code> that are not in
    <code>upstream</code>, and replay them on
    <code>newbase</code>. The classic use is a branch built on top
    of another branch that has since been squash-merged.
  </p>

  <figure>
    <svg viewBox="0 0 900 340" class="dg" role="img" aria-label="Top, before: main has commits including S, the squash of feature-a. feature-a has commits A1 and A2 branching from an older main commit, and feature-b has B1 and B2 on top of A2. Bottom, after git rebase --onto main feature-a feature-b: B1 prime and B2 prime sit directly on main's tip. A1 and A2 are not copied.">
      <g class="rough">
        <path class="ln" d="M60 120 H330" />
        <path class="lng" d="M150 120 C190 120 200 66 240 66 H340" />
        <path class="lnr" d="M340 66 H520" />
        <circle cx="60" cy="120" r="7" style="fill: var(--ink)" />
        <circle cx="150" cy="120" r="7" style="fill: var(--ink)" />
        <circle cx="240" cy="120" r="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="330" cy="120" r="9" style="fill: var(--ink)" />
        <circle cx="250" cy="66" r="7" style="fill: var(--green)" />
        <circle cx="340" cy="66" r="7" style="fill: var(--green)" />
        <circle cx="430" cy="66" r="7" style="fill: var(--red)" />
        <circle cx="520" cy="66" r="9" style="fill: var(--red)" />
        <path class="ln" d="M60 280 H330" />
        <path class="lnr" d="M330 280 H510" />
        <path class="lng" d="M150 280 C190 280 200 226 240 226 H340" />
        <circle cx="60" cy="280" r="7" style="fill: var(--ink)" />
        <circle cx="150" cy="280" r="7" style="fill: var(--ink)" />
        <circle cx="240" cy="280" r="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="330" cy="280" r="9" style="fill: var(--ink)" />
        <circle cx="250" cy="226" r="7" style="fill: var(--green)" />
        <circle cx="340" cy="226" r="7" style="fill: var(--green)" />
        <circle cx="420" cy="280" r="8" style="fill: var(--sheet); stroke: var(--red); stroke-width: 3" />
        <circle cx="510" cy="280" r="9" style="fill: var(--sheet); stroke: var(--red); stroke-width: 3" />
      </g>
      <text class="sm" x="30" y="24">BEFORE</text>
      <text class="sm" x="250" y="48" text-anchor="middle">A1</text>
      <text class="sm" x="340" y="48" text-anchor="middle">A2</text>
      <text class="sm" x="430" y="48" text-anchor="middle">B1</text>
      <text class="sm" x="520" y="48" text-anchor="middle">B2</text>
      <text class="lbl rd" x="540" y="71">feature-b</text>
      <text class="lbl gr" x="340" y="100" text-anchor="middle">feature-a</text>
      <text class="sm" x="240" y="148" text-anchor="middle">S = A1+A2 squashed</text>
      <text class="lbl" x="350" y="125">main</text>
      <text class="sm" x="30" y="188">AFTER git rebase --onto main feature-a feature-b</text>
      <text class="sm" x="250" y="208" text-anchor="middle">A1</text>
      <text class="sm" x="340" y="208" text-anchor="middle">A2</text>
      <text class="lbl gr" x="358" y="231">feature-a (can be deleted)</text>
      <text class="sm" x="240" y="308" text-anchor="middle">S</text>
      <text class="sm" x="330" y="308" text-anchor="middle">main</text>
      <text class="sm" x="420" y="308" text-anchor="middle">B1′</text>
      <text class="sm" x="510" y="308" text-anchor="middle">B2′</text>
      <text class="lbl rd" x="530" y="285">feature-b ← HEAD</text>
    </svg>
    <figcaption>
      A plain <code>git rebase main</code> here would try to replay
      A1 and A2 as well, because main only has S, a different commit
      with the same change, and you would conflict against your own
      work. <code>--onto</code> says exactly where the replay starts.
    </figcaption>
  </figure>

  <p class="sub">other --onto moves</p>
  <div class="codeblock">
    <pre><code>$ git rebase --onto main feature-a feature-b
$ git rebase --onto release/2.1 main hotfix/login
$ git rebase --onto HEAD~3 HEAD~2
$ git rebase --keep-base main</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    The second line moves a hotfix you accidentally started from
    main onto the release branch, without dragging main's new
    commits along. The third deletes one commit, <code>HEAD~2</code>,
    from the middle of the branch: replay everything after it onto
    its parent. <code>--keep-base</code> keeps the branch on its
    current merge base, which is handy for an interactive clean-up
    without also pulling in main's new commits.
  </p>

  <h3>--update-refs: rebasing a stack of branches</h3>
  <p>
    Many teams split large work into stacked pull requests: branch
    <code>billing-schema</code>, then <code>billing-api</code> on top
    of it, then <code>billing-ui</code> on top of that. Rebasing the
    top branch used to leave the lower branches pointing at the
    old, pre-rebase commits. Since Git 2.38,
    <code>--update-refs</code> moves every branch that points into
    the rebased range, and says so when it finishes
    (<code>Updated the following refs with --update-refs:</code>):
  </p>
  <p class="sub">git rebase -i --update-refs main, run on billing-ui</p>
  <div class="codeblock">
    <pre><code>pick 1a2b3c4 # Add billing tables
pick 5d6e7f8 # Add billing migration
update-ref refs/heads/billing-schema

pick 9a0b1c2 # Add invoice endpoint
update-ref refs/heads/billing-api

pick 3d4e5f6 # Add invoice page</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <figure>
    <svg viewBox="0 0 900 330" class="dg" role="img" aria-label="Before: main has three commits. A stack of four commits branches from the second main commit, with billing-schema on the second stack commit, billing-api on the third and billing-ui on the fourth. After git rebase --update-refs main, run on billing-ui: four new copies sit on top of main's tip, and all three branch labels have moved to the matching copies.">
      <g class="rough">
        <path class="ln" d="M60 110 H240" />
        <path class="lng" d="M150 110 C190 110 200 62 250 62 H580" />
        <circle cx="60" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="150" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="240" cy="110" r="9" style="fill: var(--ink)" />
        <circle cx="250" cy="62" r="7" style="fill: var(--green)" />
        <circle cx="360" cy="62" r="7" style="fill: var(--green)" />
        <circle cx="470" cy="62" r="7" style="fill: var(--green)" />
        <circle cx="580" cy="62" r="7" style="fill: var(--green)" />
        <path class="ln" d="M60 290 H240" />
        <path class="lng" d="M240 290 C280 290 290 242 340 242 H670" />
        <circle cx="60" cy="290" r="7" style="fill: var(--ink)" />
        <circle cx="150" cy="290" r="7" style="fill: var(--ink)" />
        <circle cx="240" cy="290" r="9" style="fill: var(--ink)" />
        <circle cx="340" cy="242" r="8" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
        <circle cx="450" cy="242" r="8" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
        <circle cx="560" cy="242" r="8" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
        <circle cx="670" cy="242" r="8" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
      </g>
      <text class="sm" x="20" y="22">BEFORE</text>
      <text class="sm gr" x="360" y="40" text-anchor="middle">billing-schema</text>
      <text class="sm gr" x="470" y="40" text-anchor="middle">billing-api</text>
      <text class="sm gr" x="580" y="40" text-anchor="middle">billing-ui ← HEAD</text>
      <text class="lbl" x="258" y="115">main</text>
      <text class="sm" x="20" y="186">AFTER git rebase --update-refs main</text>
      <text class="sm gr" x="450" y="220" text-anchor="middle">billing-schema</text>
      <text class="sm gr" x="560" y="220" text-anchor="middle">billing-api</text>
      <text class="sm gr" x="670" y="220" text-anchor="middle">billing-ui ← HEAD</text>
      <text class="lbl" x="240" y="322" text-anchor="middle">main</text>
      <text class="sm" x="720" y="112">one rebase,</text>
      <text class="sm" x="720" y="132">three labels moved</text>
    </svg>
    <figcaption>
      Without <code>--update-refs</code>, only <code>billing-ui</code>
      would move. <code>billing-schema</code> and
      <code>billing-api</code> would still point at the old commits,
      and their pull requests would show stale code.
    </figcaption>
  </figure>
  <p>
    Git writes the <code>update-ref</code> lines for you. Edit a
    commit low in the stack, and after one rebase all three branches
    point at the right new commits. Set
    <code>rebase.updateRefs true</code> to make it the default, then
    push each branch with <code>--force-with-lease</code>.
  </p>

  <div class="bx is-ref">
    <span class="ttl">For seniors: git replay</span>
    <p>
      <code>git replay</code> (added in Git 2.44 and still marked
      experimental) does rebase's core job with no working tree and
      no index. It replays commits in memory using the same
      <code>ort</code> merge machinery, so it runs in a bare
      repository and never touches files, which makes it fast on huge
      repositories and safe on servers. <code>git replay --onto main
      main..billing-ui</code> rebases that branch and, in current
      versions, updates the ref itself in one atomic transaction;
      <code>--contained</code> also moves every branch inside the
      range, as <code>--update-refs</code> does, and
      <code>--ref-action=print</code> prints
      <code>update-ref</code> commands instead. It has no interactive
      mode and no way to stop and let you resolve: on a conflict it
      exits with status 1 and changes nothing. That is why its users
      are forges and stacked-PR tools rather than people at a
      terminal. Its options have already changed between releases, so
      scripts should check <code>git replay -h</code> on the version
      they run.
    </p>
  </div>

  <h3>Conflicts in the middle of a rebase</h3>
  <p>
    Because rebase applies commits one at a time, you can hit a
    conflict on any of them, and you may resolve several in a row.
  </p>
  <p class="sub">a rebase that stops</p>
  <div class="codeblock">
    <pre><code>$ git rebase main
Auto-merging src/cart.js
CONFLICT (content): Merge conflict in src/cart.js
error: could not apply e2c81d0... Apply coupon before tax
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm &lt;conflicted_files&gt;", then run "git rebase --continue".
hint: You can instead skip this commit: run "git rebase --skip".
hint: To abort and get back to the state before "git rebase", run "git rebase --abort".
hint: Disable this message with "git config set advice.mergeConflict false"
Could not apply e2c81d0... # Apply coupon before tax

$ git status
interactive rebase in progress; onto d41c8e2
Last commands done (3 commands done):
   pick b41f7a3 # Add coupon model
   pick e2c81d0 # Apply coupon before tax
  (see more in file .git/rebase-merge/done)
No commands remaining.
You are currently rebasing branch 'feature' on 'd41c8e2'.
  (fix conflicts and then run "git rebase --continue")
  (use "git rebase --skip" to skip this patch)
  (use "git rebase --abort" to check out the original branch)

Unmerged paths:
  (use "git restore --staged &lt;file&gt;..." to unstage)
  (use "git add &lt;file&gt;..." to mark resolution)
	both modified:   src/cart.js

$ git add src/cart.js
$ git rebase --continue</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    Status says "interactive rebase" even though you typed a plain
    <code>git rebase</code>. Both run on the same machinery and the
    same to-do list, and the "Last commands done" lines show which
    commit you are stopped on.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Command</th><th>When to use it</th></tr>
      </thead>
      <tbody>
        <tr><td><code>git rebase --continue</code></td><td>You resolved and staged the conflict; carry on with the next commit</td></tr>
        <tr><td><code>git rebase --skip</code></td><td>This commit's change is no longer needed, for example main already contains it</td></tr>
        <tr><td><code>git rebase --abort</code></td><td>Stop and put the branch back exactly where it was before the rebase began</td></tr>
        <tr><td><code>git rebase --edit-todo</code></td><td>Change the remaining plan while paused</td></tr>
      </tbody>
    </table>
  </div>

  <div class="bx is-ref">
    <span class="ttl">ours and theirs are swapped during a rebase</span>
    <p>
      In a merge, <em>ours</em> is your branch. In a rebase, Git is
      standing on main and applying your commits to it, so
      <em>ours</em> (<code>HEAD</code>, stage 2) is main plus the
      commits replayed so far, and <em>theirs</em> (stage 3) is your
      commit being applied. <code>git checkout --theirs file</code>
      during a rebase keeps <strong>your</strong> version. The
      conflict markers give it away: the top section is labelled
      <code>HEAD</code>, which here means the upstream side, and the
      bottom is labelled with your commit's ID and subject, such as
      <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt; e2c81d0 (Apply coupon before tax)</code>.
    </p>
  </div>

  <p>
    Two settings make this less painful. <code>rerere.enabled</code>
    remembers resolutions, so rebasing the same branch again does
    not ask the same question twice. <code>rebase.autoStash true</code>
    stashes uncommitted edits before the rebase and restores them
    after, instead of refusing to start.
  </p>

  <h3>ORIG_HEAD and the reflog: undoing a rebase</h3>
  <p>
    A finished rebase feels permanent. It is not. Before it starts,
    rebase records the old tip in <code>ORIG_HEAD</code>, and every
    step is written to the reflog.
  </p>
  <p class="sub">recovering the branch as it was</p>
  <div class="codeblock">
    <pre><code>$ git reflog -6
58b3e6f (HEAD -&gt; feature) HEAD@{0}: rebase (finish): returning to refs/heads/feature
58b3e6f (HEAD -&gt; feature) HEAD@{1}: rebase (pick): Apply coupon before tax
c7d2a51 HEAD@{2}: rebase (pick): Add coupon model
9e4f10b HEAD@{3}: rebase (pick): Add coupon field to cart form
d41c8e2 (main) HEAD@{4}: rebase (start): checkout main
e2c81d0 HEAD@{5}: commit: Apply coupon before tax

$ git reset --hard ORIG_HEAD
$ git reset --hard feature@{1}
$ git reset --hard e2c81d0

$ git range-diff ORIG_HEAD...HEAD</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    Any of the three resets puts the branch back on the old commits.
    <code>ORIG_HEAD</code> is quickest but is overwritten by the next
    reset, merge or rebase. <code>feature@{1}</code> uses the
    branch's own reflog: "where feature was one move ago", and a
    whole rebase is a single move for the branch. The raw hash from
    <code>HEAD@{5}</code> always works. <code>git range-diff</code>
    compares the old series with the new one commit by commit,
    which is the best way to check a rebase did what you meant
    before you force-push it.
  </p>

  <div class="warn">
    <span class="ttl">After a rebase you must force push</span>
    Your local commits now have different IDs than the ones on the
    remote, so a normal push is rejected as a non-fast-forward. Use
    <code>git push --force-with-lease</code>, never plain
    <code>--force</code>. The lease checks that the remote is still
    where you last saw it, and refuses if a teammate pushed in the
    meantime, which is exactly the accident plain force would
    silently cause.
  </div>

  <h3>Rebase or merge?</h3>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th></th><th>Rebase</th><th>Merge</th></tr>
      </thead>
      <tbody>
        <tr><td>History shape</td><td>A straight line; easy to read and bisect</td><td>The real shape of the work, with a merge commit per integration</td></tr>
        <tr><td>Commit IDs</td><td>New IDs for every replayed commit</td><td>Existing commits untouched</td></tr>
        <tr><td>Safe on shared branches</td><td>No; requires a force push</td><td>Yes</td></tr>
        <tr><td>Conflicts</td><td>Resolved commit by commit, possibly the same area several times</td><td>Resolved once, in the merge commit</td></tr>
        <tr><td>Each commit tested?</td><td>Replayed commits were never run as they now are; use <code>-x</code> to check</td><td>Original commits stay as they were tested</td></tr>
        <tr><td>Undo</td><td>Reflog or <code>ORIG_HEAD</code>, local only</td><td>Revert the merge commit with <code>-m 1</code></td></tr>
        <tr><td>Best for</td><td>Updating your own branch; cleaning up before review</td><td>Landing reviewed work on a shared branch; long-lived branches</td></tr>
      </tbody>
    </table>
  </div>
  <p>
    Most teams use both: rebase your own branch onto main while you
    work, clean it up with <code>rebase -i</code> before review, and
    let the merge button (a merge commit, a squash, or a rebase
    merge, as the team prefers) land it on main.
  </p>
`,
};
