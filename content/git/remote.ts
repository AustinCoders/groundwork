import type { GitSection } from "./types";

export const gitRemote: GitSection = {
  id: "remote",
  num: "G6",
  title: "Remotes and syncing",
  short: "Remotes & syncing",
  subtitle:
    "A remote is a URL with a nickname, and origin/main is your cached memory of it. fetch, pull and push only move refs and objects between the two.",
  body: `
<div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    A remote is a nickname for another copy of the repository:
    <code>origin</code> by convention for the one you cloned from,
    <code>upstream</code> by convention for the original project
    when you have forked it. Git has no central server built in.
    Every clone is a full repository, and a remote is simply
    another repository you have agreed to exchange commits with.
  </p>

  <h3>Three places a branch lives</h3>
  <p>
    The word "main" can mean three different things, and most
    confusion about syncing comes from mixing them up.
  </p>

  <figure>
    <svg viewBox="0 0 900 250" class="dg" role="img" aria-label="Three boxes. On the left, main on the server. In the middle, origin/main, the remote-tracking branch in your clone. On the right, your local main. git fetch copies from the server to origin/main. merge or rebase moves your main onto origin/main. git push sends your main back to the server.">
      <g class="rough">
        <rect x="30" y="70" width="200" height="80" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="350" y="70" width="200" height="80" rx="10" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
        <rect x="670" y="70" width="200" height="80" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <path class="ln" d="M230 110 H344" marker-end="url(#arrow)" />
        <path class="ln" d="M550 110 H664" marker-end="url(#arrow)" />
        <path class="lng" d="M770 150 C770 215 130 215 130 156" marker-end="url(#arrow-green)" />
      </g>
      <text class="sm" x="450" y="24" text-anchor="middle">git pull = git fetch, then merge or rebase</text>
      <text class="sm" x="130" y="58" text-anchor="middle">ON THE SERVER</text>
      <text class="sm" x="450" y="58" text-anchor="middle">REMOTE-TRACKING, IN YOUR CLONE</text>
      <text class="sm" x="770" y="58" text-anchor="middle">LOCAL BRANCH</text>
      <text class="lbl" x="130" y="106" text-anchor="middle">main</text>
      <text class="sm" x="130" y="130" text-anchor="middle">refs/heads/main</text>
      <text class="lbl" x="450" y="106" text-anchor="middle">origin/main</text>
      <text class="sm" x="450" y="130" text-anchor="middle">refs/remotes/origin/main</text>
      <text class="lbl" x="770" y="106" text-anchor="middle">main</text>
      <text class="sm" x="770" y="130" text-anchor="middle">refs/heads/main</text>
      <text class="sm" x="287" y="98" text-anchor="middle">fetch</text>
      <text class="sm" x="607" y="98" text-anchor="middle">merge / rebase</text>
      <text class="lbl gr" x="450" y="236" text-anchor="middle">git push</text>
    </svg>
    <figcaption>
      Only the middle box is updated by fetch, and you never commit
      to it. Your own branch changes only when you merge or rebase,
      and the server changes only when you push.
    </figcaption>
  </figure>

  <p>
    <code>origin/main</code> is not the remote's main branch. It is
    <em>your local cached snapshot of where main was the last time
    you talked to the server</em>. It only updates when you fetch,
    pull or push. This is why <code>git status</code> saying "Your
    branch is up to date with 'origin/main'" can be wrong: it
    compares against the cache without asking the server. To ask
    the server without downloading anything, use
    <code>git ls-remote origin main</code>.
  </p>

  <h3>What fetch actually does</h3>
  <p>
    A remote is a few lines in <code>.git/config</code>. The line
    that does the work is the <strong>refspec</strong>:
  </p>

  <p class="sub">.git/config after a clone</p>
  <div class="codeblock">
    <pre><code>[remote "origin"]
	url = git@github.com:acme/shop.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    Read the refspec as <code>source:destination</code>. The left
    side names refs on the server, <code>refs/heads/*</code>, which
    means every branch. The right side names where to store them
    locally, under <code>refs/remotes/origin/</code>. The leading
    <code>+</code> means "update the destination even if it is not a
    fast-forward", which is why a teammate's force push to their
    branch shows up as a <code>(forced update)</code> instead of an
    error. So a fetch is: ask the server which refs it has, download
    every object you are missing, then rewrite your
    <code>refs/remotes/origin/*</code> to match.
  </p>

  <p class="sub">git fetch, line by line</p>
  <div class="codeblock">
    <pre><code>$ git fetch --prune origin
remote: Enumerating objects: 14, done.
remote: Counting objects: 100% (14/14), done.
remote: Compressing objects: 100% (6/6), done.
remote: Total 9 (delta 4), reused 7 (delta 3), pack-reused 0
Unpacking objects: 100% (9/9), 1.21 KiB | 206.00 KiB/s, done.
From github.com:acme/shop
 - [deleted]         (none)        -&gt; origin/fix/null-cart
   c04b8a9..e71d3f2  main          -&gt; origin/main
 + 5a1c2e0...9d8e7f6 feat/search   -&gt; origin/feat/search  (forced update)
 * [new branch]      fix/tax-round -&gt; origin/fix/tax-round
 * [new tag]         v2.2.0        -&gt; v2.2.0</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    Two dots mean a fast-forward. Three dots and a <code>+</code>
    mean the branch was rewritten and the old tip is no longer in
    its history. <code>[deleted]</code> comes from
    <code>--prune</code>: without it, a branch deleted on the server
    lives on as a stale <code>origin/...</code> ref in your clone
    forever. Make pruning the default with
    <code>git config --global fetch.prune true</code>.
  </p>
  <p>
    You can fetch refs the default refspec ignores. GitHub, for
    example, exposes every pull request as
    <code>refs/pull/&lt;n&gt;/head</code>, so
    <code>git fetch origin pull/412/head:pr-412</code> gives you a
    local branch of someone's pull request without adding their
    fork as a remote. After any fetch, <code>FETCH_HEAD</code>
    names what was just fetched.
  </p>

  <h3>fetch vs pull</h3>
  <p>
    <strong>fetch</strong> downloads new commits and updates your
    remote-tracking branches. It does not touch your local branches
    or your working files, so it is always safe to run.
    <strong>pull</strong> is fetch followed by an integration step
    into the current branch. That step changes your branch, so it
    can produce conflicts.
  </p>

  <p class="sub">these are equivalent</p>
  <div class="codeblock">
    <pre><code>$ git pull
$ git fetch origin &amp;&amp; git merge origin/main

$ git pull --rebase
$ git fetch origin &amp;&amp; git rebase origin/main

$ git pull --ff-only
$ git fetch origin &amp;&amp; git merge --ff-only origin/main</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    Modern Git will not guess when your branch and its upstream have
    both moved. Unless you have told it how to reconcile, it stops:
  </p>

  <p class="sub">pull on a diverged branch with no config</p>
  <div class="codeblock">
    <pre><code>$ git pull
hint: You have divergent branches and need to specify how to reconcile them.
hint: You can do so by running one of the following commands sometime before
hint: your next pull:
hint:
hint:   git config pull.rebase false  # merge
hint:   git config pull.rebase true   # rebase
hint:   git config pull.ff only       # fast-forward only
hint:
fatal: Need to specify how to reconcile divergent branches.</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Setting</th><th>What pull does when you are behind and ahead</th><th>Good for</th></tr>
      </thead>
      <tbody>
        <tr><td><code>pull.rebase false</code></td><td>Creates a merge commit, "Merge branch 'main' of github.com:acme/shop"</td><td>Teams that never rewrite anything</td></tr>
        <tr><td><code>pull.rebase true</code></td><td>Replays your unpushed commits on top of the new upstream</td><td>Most people; keeps history linear</td></tr>
        <tr><td><code>pull.ff only</code></td><td>Refuses. You choose merge or rebase yourself</td><td>Long-lived branches like main, where surprise commits are unwelcome</td></tr>
      </tbody>
    </table>
  </div>

  <figure>
    <svg viewBox="0 0 900 320" class="dg" role="img" aria-label="Top: after a fetch, main and origin/main have diverged from a merge base. origin/main has three new commits R1 to R3; local main has two, L1 and L2. Bottom: after git pull --rebase, the history is a single line: the three remote commits, then copies L1 prime and L2 prime of the local commits, with main on the last one.">
      <g class="rough">
        <path class="ln" d="M60 110 H240" />
        <path class="lng" d="M240 110 C280 110 280 60 320 60 H510" />
        <path class="ln" d="M240 110 C280 110 280 160 320 160 H420" />
        <circle cx="60" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="150" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="240" cy="110" r="8" style="fill: var(--ink)" />
        <circle cx="330" cy="60" r="7" style="fill: var(--green)" />
        <circle cx="420" cy="60" r="7" style="fill: var(--green)" />
        <circle cx="510" cy="60" r="7" style="fill: var(--green)" />
        <circle cx="330" cy="160" r="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="420" cy="160" r="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <path class="ln" d="M60 276 H690" />
        <circle cx="60" cy="276" r="7" style="fill: var(--ink)" />
        <circle cx="150" cy="276" r="7" style="fill: var(--ink)" />
        <circle cx="240" cy="276" r="7" style="fill: var(--ink)" />
        <circle cx="330" cy="276" r="7" style="fill: var(--green)" />
        <circle cx="420" cy="276" r="7" style="fill: var(--green)" />
        <circle cx="510" cy="276" r="7" style="fill: var(--green)" />
        <circle cx="600" cy="276" r="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="690" cy="276" r="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
      </g>
      <text class="sm" x="30" y="24">AFTER git fetch: ahead 2, behind 3</text>
      <text class="sm" x="330" y="44" text-anchor="middle">R1</text>
      <text class="sm" x="420" y="44" text-anchor="middle">R2</text>
      <text class="sm" x="510" y="44" text-anchor="middle">R3</text>
      <text class="lbl gr" x="528" y="65">origin/main</text>
      <text class="sm" x="232" y="138" text-anchor="end">merge base</text>
      <text class="sm" x="330" y="186" text-anchor="middle">L1</text>
      <text class="sm" x="420" y="186" text-anchor="middle">L2</text>
      <text class="lbl" x="438" y="165">main ← HEAD</text>
      <text class="sm" x="30" y="222">AFTER git pull --rebase</text>
      <text class="lbl gr" x="510" y="254" text-anchor="middle">origin/main</text>
      <text class="sm" x="600" y="302" text-anchor="middle">L1′</text>
      <text class="sm" x="690" y="302" text-anchor="middle">L2′</text>
      <text class="lbl" x="708" y="281">main ← HEAD</text>
    </svg>
    <figcaption>
      Rebase-on-pull turns "ahead 2, behind 3" into "ahead 2, behind
      0". L1′ and L2′ are new commits with new IDs, which is fine
      because nobody else had L1 and L2 yet. A merge-on-pull would
      instead add a merge commit joining L2 and R3.
    </figcaption>
  </figure>

  <h3>Pushing</h3>
  <p>
    <code>git push</code> is the reverse of fetch: send the objects
    the server is missing, then ask it to move a ref. By default the
    server only accepts the move if it is a
    <strong>fast-forward</strong>, meaning the ref's current commit
    is an ancestor of the new one, so nothing already there is lost.
  </p>

  <p class="sub">a rejected push</p>
  <div class="codeblock">
    <pre><code>$ git push
To github.com:acme/shop.git
 ! [rejected]        main -&gt; main (fetch first)
error: failed to push some refs to 'github.com:acme/shop.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    <code>(fetch first)</code> means the server has commits you do
    not even have. <code>(non-fast-forward)</code> means you have
    them but your branch does not include them, typically after you
    rebased. The fix for the first is to pull. The fix for the second
    depends on whether you meant to rewrite the branch.
  </p>

  <p class="sub">useful push settings and forms</p>
  <div class="codeblock">
    <pre><code>$ git config --global push.autoSetupRemote true
$ git push
branch 'feat/coupons' set up to track 'origin/feat/coupons'.

$ git push origin HEAD
$ git push origin feat/coupons:review/coupons
$ git push origin --delete feat/coupons
$ git push --dry-run</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    With <code>push.autoSetupRemote</code> (Git 2.37 and later) the
    first plain <code>git push</code> of a new branch creates it on
    the server and sets the upstream, so you never type
    <code>-u origin my-branch</code> again. The default
    <code>push.default=simple</code> pushes only the current branch,
    and only to a branch of the same name. The
    <code>src:dst</code> form pushes to a different name, and
    <code>--delete</code> deletes the remote branch.
  </p>

  <h3>--force, --force-with-lease and --force-if-includes</h3>
  <p>
    After a rebase or an amend, your branch is no longer a
    fast-forward of the server's copy, so you must force. The three
    flags differ in what they check first.
  </p>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Flag</th><th>Checks before overwriting</th><th>What can go wrong</th></tr>
      </thead>
      <tbody>
        <tr><td><code>--force</code></td><td>Nothing</td><td>A teammate's commits pushed since your last fetch are silently deleted from the branch</td></tr>
        <tr><td><code>--force-with-lease</code></td><td>The server's ref still equals your <code>origin/&lt;branch&gt;</code></td><td>If something fetched in the background (an IDE, a prompt tool), your <code>origin/</code> ref is already up to date, so the check passes even though you never looked at the new commits</td></tr>
        <tr><td><code>--force-with-lease --force-if-includes</code></td><td>The lease, and that the remote tip appears in your local reflog, meaning you really integrated it</td><td>Very little. Git 2.30 and later</td></tr>
      </tbody>
    </table>
  </div>
  <p class="sub">a lease doing its job</p>
  <div class="codeblock">
    <pre><code>$ git push --force-with-lease
To github.com:acme/shop.git
 ! [rejected]        feat/search -&gt; feat/search (stale info)
error: failed to push some refs to 'github.com:acme/shop.git'

$ git config --global alias.pushf 'push --force-with-lease --force-if-includes'</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    <code>(stale info)</code> means the branch moved on the server
    since your last fetch. Fetch, look at what arrived with
    <code>git log feat/search..origin/feat/search</code>, fold it
    in, then push again. Protected branches such as main should
    reject force pushes on the server side anyway; these flags
    protect everything else.
  </p>

  <h3>Multiple remotes and the fork workflow</h3>
  <p>
    On open source projects, and in companies that use forks, you
    cannot push to the main repository. You push to your own copy,
    and open a pull request from it. That gives you two remotes.
  </p>

  <figure>
    <svg viewBox="0 0 900 270" class="dg" role="img" aria-label="Three boxes in a triangle. upstream, the original project, at top left. origin, your fork, at top right. Your clone at the bottom. Your clone fetches from upstream and pushes to origin. A pull request goes from origin to upstream.">
      <g class="rough">
        <rect x="60" y="30" width="260" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="580" y="30" width="260" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="320" y="180" width="260" height="72" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <path class="ln" d="M190 102 L374 176" marker-end="url(#arrow)" />
        <path class="ln" d="M526 180 L706 108" marker-end="url(#arrow)" />
        <path class="lng" d="M580 66 H326" marker-end="url(#arrow-green)" />
      </g>
      <text class="lbl" x="190" y="62" text-anchor="middle">upstream</text>
      <text class="sm" x="190" y="86" text-anchor="middle">github.com/acme/shop</text>
      <text class="lbl" x="710" y="62" text-anchor="middle">origin</text>
      <text class="sm" x="710" y="86" text-anchor="middle">github.com/you/shop</text>
      <text class="lbl" x="450" y="212" text-anchor="middle">your clone</text>
      <text class="sm" x="450" y="236" text-anchor="middle">~/code/shop</text>
      <text class="sm gr" x="453" y="54" text-anchor="middle">pull request</text>
      <text class="sm" x="262" y="158" text-anchor="end">git fetch upstream</text>
      <text class="sm" x="640" y="158">git push origin</text>
    </svg>
    <figcaption>
      Commits flow in a loop: in from upstream, out to your fork,
      and back to upstream only through a reviewed pull request.
    </figcaption>
  </figure>

  <p class="sub">setting up and syncing a fork</p>
  <div class="codeblock">
    <pre><code>$ git clone git@github.com:you/shop.git &amp;&amp; cd shop
$ git remote add upstream git@github.com:acme/shop.git
$ git remote -v
origin    git@github.com:you/shop.git (fetch)
origin    git@github.com:you/shop.git (push)
upstream  git@github.com:acme/shop.git (fetch)
upstream  git@github.com:acme/shop.git (push)

$ git remote set-url --push upstream no_push
$ git fetch upstream
$ git switch -c fix/tax-round upstream/main
$ git push -u origin fix/tax-round

$ git fetch upstream
$ git rebase upstream/main
$ git push --force-with-lease</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>
  <p>
    Branch from <code>upstream/main</code>, not from your fork's
    main, which is usually months behind. The
    <code>set-url --push ... no_push</code> line gives the upstream
    remote a push URL that cannot work, so an accidental
    <code>git push upstream</code> fails instead of landing on the
    real project if you happen to have write access. Your fork's
    own main does not need to be kept in sync at all.
  </p>

  <h3>Tags on remotes</h3>
  <p>
    Tags do not travel the way branches do, which surprises
    people at release time.
  </p>
  <ul>
    <li><code>git push</code> sends no tags. Push one with <code>git push origin v2.2.0</code>, or all of them with <code>git push origin --tags</code>.</li>
    <li><code>git push --follow-tags</code> also sends any <em>annotated</em> tags reachable from the commits being pushed. Set <code>push.followTags true</code> to make it the default. Lightweight tags are never sent this way.</li>
    <li><code>git fetch</code> brings tags that point into the history it downloaded. Tags on unrelated commits need <code>git fetch --tags</code>.</li>
    <li>Tags are not namespaced per remote. There is no <code>origin/v2.2.0</code>, so a fetched tag lands directly in <code>refs/tags/</code>, and Git will not overwrite a local tag of the same name that points elsewhere: <code>! [rejected] v2.2.0 -&gt; v2.2.0 (would clobber existing tag)</code>.</li>
    <li>Deleting a tag on the server is <code>git push origin --delete v2.2.0</code>. Others still have it until they run <code>git fetch --prune --prune-tags</code>. This is why published tags should never move.</li>
  </ul>

  <h3>Remote housekeeping</h3>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Task</th><th>Command</th></tr>
      </thead>
      <tbody>
        <tr><td>See a remote's URLs, branches and tracking state</td><td><code>git remote show origin</code></td></tr>
        <tr><td>List refs on the server without fetching</td><td><code>git ls-remote --heads origin</code></td></tr>
        <tr><td>Remove stale remote-tracking branches</td><td><code>git remote prune origin</code></td></tr>
        <tr><td>Fix <code>origin/HEAD</code> after the default branch is renamed</td><td><code>git remote set-head origin --auto</code></td></tr>
        <tr><td>Move a repository to a new host</td><td><code>git remote set-url origin git@gitlab.com:acme/shop.git</code></td></tr>
        <tr><td>Fetch from every remote at once</td><td><code>git fetch --all --prune</code></td></tr>
        <tr><td>Clone only the latest commit, for CI</td><td><code>git clone --depth 1 &lt;url&gt;</code></td></tr>
        <tr><td>Clone full history but download file contents on demand</td><td><code>git clone --filter=blob:none &lt;url&gt;</code></td></tr>
      </tbody>
    </table>
  </div>

  <div class="bx is-ref">
    <span class="ttl">Shallow or partial?</span>
    <p>
      A shallow clone (<code>--depth 1</code>) cuts history off, so
      <code>git log</code>, <code>git blame</code> and
      <code>git merge-base</code> stop at the cut and can give wrong
      answers. It is right for a build that only needs the files. A
      partial clone (<code>--filter=blob:none</code>) keeps every
      commit and tree and fetches old file contents only when a
      command needs them. It is usually the better choice for
      developers working in a very large repository.
    </p>
  </div>
`,
};
