import type { GitSection } from "./types";

export const gitConfig: GitSection = {
  id: "config",
  num: "G0",
  title: "Setup and configuration",
  short: "Setup & config",
  subtitle:
    "Ten minutes of setup per machine: who you are, how you log in, and the defaults Git should have shipped with.",
  body: `
<div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    Git works straight after install, but several of its defaults
    exist only for backwards compatibility. A few minutes of setup
    saves you from commits under the wrong email, a password prompt
    on every push, <code>CRLF</code> noise in every diff, and a
    <code>git pull</code> that makes merge commits you never asked
    for. Do it once per machine, keep it in your dotfiles, and forget
    about it.
  </p>

  <h3>Where settings live</h3>
  <p>
    Every setting is a <code>section.key = value</code> pair, and the
    same key can be set in several files. Git reads them in a fixed
    order, and <strong>the last value it reads wins</strong>. That is
    how a repository can override your personal defaults, and how a
    single command can override everything.
  </p>

  <figure>
    <svg viewBox="0 0 900 290" class="dg" role="img" aria-label="Five configuration levels read from top to bottom: system, global, local, worktree and command line. Each later level overrides the ones above it.">
      <g class="rough">
        <rect x="20" y="20" width="620" height="44" rx="8" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
        <rect x="20" y="74" width="620" height="44" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="20" y="128" width="620" height="44" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="20" y="182" width="620" height="44" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="20" y="236" width="620" height="44" rx="8" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <path class="ln" d="M680 26 V272" marker-end="url(#arrow)" />
      </g>
      <text class="lbl" x="36" y="48">system</text>
      <text class="sm" x="140" y="47">--system</text>
      <text class="sm" x="624" y="47" text-anchor="end">/etc/gitconfig, every user</text>
      <text class="lbl" x="36" y="102">global</text>
      <text class="sm" x="140" y="101">--global</text>
      <text class="sm" x="624" y="101" text-anchor="end">~/.gitconfig or ~/.config/git/config</text>
      <text class="lbl" x="36" y="156">local</text>
      <text class="sm" x="140" y="155">--local</text>
      <text class="sm" x="624" y="155" text-anchor="end">.git/config, this repository</text>
      <text class="lbl" x="36" y="210">worktree</text>
      <text class="sm" x="140" y="209">--worktree</text>
      <text class="sm" x="624" y="209" text-anchor="end">config.worktree, one checkout</text>
      <text class="lbl gr" x="36" y="264">command</text>
      <text class="sm" x="140" y="263">git -c key=value</text>
      <text class="sm" x="624" y="263" text-anchor="end">this one command only</text>
      <text class="lbl" x="700" y="140">read in order;</text>
      <text class="lbl" x="700" y="164">the last one wins</text>
    </svg>
    <figcaption>
      Most of your settings belong in global. Local is for one
      repository, such as a different email for an open-source
      project. Worktree config only exists once you turn on
      <code>extensions.worktreeConfig</code>, and matters when you use
      <code>git worktree</code>.
    </figcaption>
  </figure>

  <p>
    The system file's path depends on how Git was installed: a
    Homebrew Git on Apple silicon reads
    <code>/opt/homebrew/etc/gitconfig</code>, and Git for Windows keeps
    its own under the install folder. Global has two possible
    homes. If both exist, Git reads <code>~/.config/git/config</code>
    first and then <code>~/.gitconfig</code>. When a setting behaves
    oddly, stop guessing and ask Git where each value came from:
  </p>

  <div class="codeblock">
    <pre><code>$ git config --list --show-origin --show-scope
system  file:/opt/homebrew/etc/gitconfig   credential.helper=osxkeychain
global  file:/Users/aisha/.gitconfig      user.name=Aisha Khan
global  file:/Users/aisha/.gitconfig      user.email=aisha@hey.com
global  file:/Users/aisha/.gitconfig-work user.email=aisha@corp.dev
local   file:.git/config                  core.bare=false
local   file:.git/config                  remote.origin.url=git@github.com:acme/api.git

$ git config --show-origin --get user.email
file:/Users/aisha/.gitconfig-work	aisha@corp.dev</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    The output is tab-separated; it is lined up here for reading.
    Notice <code>user.email</code> appears twice. The second value
    wins, and <code>--show-origin</code> shows it came from an
    included file, covered below. Git 2.46 added verb-style
    subcommands: <code>git config list</code>,
    <code>git config get user.email</code> and
    <code>git config set user.email you@example.com</code> do the same
    as the older flag forms, which still work. Keys are
    case-insensitive (Git prints them in lower case), and a value can
    be removed with <code>git config --global --unset key</code>.
  </p>

  <h3>The first five minutes</h3>
  <div class="codeblock">
    <pre><code>git config --global user.name "Aisha Khan"
git config --global user.email "aisha@hey.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    <strong>Identity.</strong> Name and email are copied into every
    commit you make. They are not a login; Git does not check them at
    all. GitHub and GitLab link a commit to your account by matching
    the email against the addresses on your profile, so use one you
    have added there (or the host's private <code>noreply</code>
    address if you do not want your real email public). Commits made
    with the wrong email stay that way. You can fix the last one with
    <code>git commit --amend --reset-author --no-edit</code>, but older
    ones need a history rewrite. Setting
    <code>user.useConfigOnly true</code> stops Git from guessing an
    identity from your machine's host name, so a missing email becomes
    an error instead of <code>aisha@aishas-macbook.local</code>.
  </p>
  <p>
    <strong>Default branch.</strong> <code>init.defaultBranch</code>
    (Git 2.28 and later) names the first branch in every new
    repository. Without it, older installs create
    <code>master</code> and newer ones print a hint every time.
  </p>
  <p>
    <strong>Editor.</strong> Git opens an editor for commit messages,
    interactive rebases and some merges. A GUI editor must be told to
    <em>wait</em> until you close the file, or Git sees it exit at
    once and aborts with an empty message: <code>code --wait</code>,
    <code>subl -w</code>, <code>zed --wait</code>. Terminal editors
    need no flag: <code>vim</code>, <code>nano</code>. The
    <code>GIT_EDITOR</code> environment variable beats the setting,
    which beats <code>VISUAL</code> and then <code>EDITOR</code>.
  </p>

  <h3>Settings that should have been defaults</h3>
  <div class="codeblock">
    <pre><code>git config --global pull.rebase true
git config --global push.autoSetupRemote true
git config --global rerere.enabled true
git config --global fetch.prune true
git config --global merge.conflictStyle zdiff3
git config --global diff.algorithm histogram
git config --global rebase.autoStash true
git config --global rebase.updateRefs true
git config --global commit.verbose true
git config --global branch.sort -committerdate
git config --global help.autocorrect prompt</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Setting</th><th>What changes</th></tr>
      </thead>
      <tbody>
        <tr><td><code>pull.rebase true</code></td><td><code>git pull</code> rebases your local commits onto the fetched ones instead of creating a "Merge branch 'main' of …" commit. Teams that prefer to decide each time use <code>pull.ff only</code>, which refuses anything but a fast-forward.</td></tr>
        <tr><td><code>push.autoSetupRemote true</code></td><td>The first <code>git push</code> on a new branch creates the remote branch and sets the upstream. No more <code>--set-upstream origin</code> error. Git 2.37 and later.</td></tr>
        <tr><td><code>rerere.enabled true</code></td><td>"Reuse recorded resolution". Git remembers how you resolved a conflict and replays it when the same conflict appears again, for example on every rebase of a long-lived branch.</td></tr>
        <tr><td><code>fetch.prune true</code></td><td>Deletes <code>origin/*</code> branches that were deleted on the server, so your branch list stops growing forever.</td></tr>
        <tr><td><code>merge.conflictStyle zdiff3</code></td><td>Conflict markers also show the merge base, the original text both sides started from. This makes most conflicts obvious. Git 2.35 and later; use <code>diff3</code> on older versions.</td></tr>
        <tr><td><code>diff.algorithm histogram</code></td><td>Usually more readable diffs when code is moved or blocks repeat.</td></tr>
        <tr><td><code>rebase.autoStash true</code></td><td>Stashes uncommitted changes before a rebase and restores them after, instead of refusing to start.</td></tr>
        <tr><td><code>rebase.updateRefs true</code></td><td>When you rebase a stack of branches, the branches in the middle of the stack move too. Git 2.38 and later.</td></tr>
        <tr><td><code>commit.verbose true</code></td><td>Shows the staged diff under the message in the editor.</td></tr>
        <tr><td><code>branch.sort -committerdate</code></td><td><code>git branch</code> lists the most recently used branches first.</td></tr>
        <tr><td><code>help.autocorrect prompt</code></td><td><code>git stauts</code> asks "Run 'status' instead?" rather than just failing.</td></tr>
      </tbody>
    </table>
  </div>

  <h3>Aliases</h3>
  <p>
    An alias is a new Git subcommand made of an existing one plus
    arguments. Start with a handful you will really type:
  </p>

  <div class="codeblock">
    <pre><code>git config --global alias.st "status -sb"
git config --global alias.lg "log --graph --format='%C(auto)%h%d %s %C(dim)%an, %ar'"
git config --global alias.last "log -1 HEAD --stat"
git config --global alias.unstage "restore --staged"
git config --global alias.amend "commit --amend --no-edit"
git config --global alias.gone "!git branch -vv | grep ': gone]' | awk '{print \\$1}'"</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    An alias starting with <code>!</code> runs as a shell command from
    the top of the repository, which is how <code>gone</code> above
    can use a pipe to list local branches whose remote branch has
    been deleted. Aliases cannot replace built-in commands:
    <code>alias.status</code> is silently ignored. Run
    <code>git config --get-regexp '^alias\\.'</code> to list the ones
    you have.
  </p>

  <h3>Work and personal identities with includeIf</h3>
  <p>
    Many people have one laptop and two identities: a work email for
    company repositories and a personal one for everything else.
    Setting the email per repository works until you forget once.
    <code>includeIf</code> makes it automatic, based on where the
    repository lives on disk.
  </p>

  <div class="codeblock">
    <pre><code>$ cat ~/.gitconfig
[user]
	name = Aisha Khan
	email = aisha@hey.com
[includeIf "gitdir:~/work/"]
	path = ~/.gitconfig-work

$ cat ~/.gitconfig-work
[user]
	email = aisha@corp.dev
[core]
	sshCommand = ssh -i ~/.ssh/id_ed25519_work

$ cd ~/work/api &amp;&amp; git config user.email
aisha@corp.dev
$ cd ~/code/blog &amp;&amp; git config user.email
aisha@hey.com</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <figure>
    <svg viewBox="0 0 900 280" class="dg" role="img" aria-label="A repository under ~/work matches the includeIf rule in ~/.gitconfig, so it commits as aisha@corp.dev from ~/.gitconfig-work. A repository under ~/code does not match, so it commits as aisha@hey.com from ~/.gitconfig.">
      <g class="rough">
        <rect x="20" y="50" width="220" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="20" y="190" width="220" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="320" y="70" width="260" height="160" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="660" y="50" width="220" height="56" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
        <rect x="660" y="190" width="220" height="56" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <path class="ln" d="M240 78 L316 116" marker-end="url(#arrow)" />
        <path class="ln" d="M240 218 L316 184" marker-end="url(#arrow)" />
        <path class="ln" d="M580 164 L656 82" marker-end="url(#arrow)" />
        <path class="ln" d="M580 116 L656 212" marker-end="url(#arrow)" />
      </g>
      <text class="lbl" x="36" y="74">~/work/api</text>
      <text class="sm" x="36" y="94">matches gitdir:~/work/</text>
      <text class="lbl" x="36" y="214">~/code/blog</text>
      <text class="sm" x="36" y="234">no match</text>
      <text class="sm" x="320" y="58">~/.gitconfig</text>
      <text class="sm" x="334" y="100" style="font-family: var(--font-mono)">[user]</text>
      <text class="sm" x="334" y="122" style="font-family: var(--font-mono)">  email = aisha@hey.com</text>
      <text class="sm" x="334" y="168" style="font-family: var(--font-mono)">[includeIf "gitdir:~/work/"]</text>
      <text class="sm" x="334" y="190" style="font-family: var(--font-mono)">  path = ~/.gitconfig-work</text>
      <text class="lbl" x="676" y="74">aisha@corp.dev</text>
      <text class="sm" x="676" y="94">from ~/.gitconfig-work</text>
      <text class="lbl" x="676" y="214">aisha@hey.com</text>
      <text class="sm" x="676" y="234">from ~/.gitconfig</text>
    </svg>
    <figcaption>
      The include is read at the point where it appears. Because it
      comes after <code>[user]</code>, its email is read later and
      wins. Put <code>includeIf</code> blocks at the end of the file.
    </figcaption>
  </figure>

  <p>The rules that catch people out:</p>
  <ul>
    <li>
      <strong>The trailing slash matters.</strong>
      <code>gitdir:~/work/</code> matches every repository at any depth
      under <code>~/work</code>. Without the slash it matches only a
      repository whose <code>.git</code> is exactly that path.
    </li>
    <li>
      <strong>Order matters.</strong> An include placed before your
      default <code>[user]</code> block is overridden by it.
    </li>
    <li>
      <strong>It only applies inside a repository.</strong> Outside
      one, such as when you run <code>git config user.email</code> in
      your home folder, you see the default.
    </li>
    <li>
      <strong>Other conditions exist.</strong>
      <code>gitdir/i:</code> is case-insensitive,
      <code>onbranch:release/**</code> matches the current branch, and
      <code>hasconfig:remote.*.url:git@github.com:acme/**</code>
      (Git 2.36 and later) matches on the remote URL, which works even
      when work repositories are not in one folder.
    </li>
  </ul>

  <h3>Authentication: SSH or HTTPS</h3>
  <p>
    The remote URL decides how you log in.
    <code>git@github.com:acme/api.git</code> uses SSH;
    <code>https://github.com/acme/api.git</code> uses HTTPS. Either is
    fine, and you can switch at any time with
    <code>git remote set-url origin &lt;url&gt;</code>. Note that
    GitHub has not accepted account passwords for Git over HTTPS since
    2021. The "password" is a personal access token or an OAuth
    login.
  </p>

  <figure>
    <svg viewBox="0 0 900 230" class="dg" role="img" aria-label="Two paths from Git to GitHub. With an SSH remote, ssh uses your private key through ssh-agent and GitHub matches it to the public key on your account. With an HTTPS remote, a credential helper supplies a token from the system keychain and GitHub checks the token.">
      <g class="rough">
        <rect x="20" y="30" width="230" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="320" y="30" width="240" height="56" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
        <rect x="630" y="30" width="250" height="56" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="20" y="140" width="230" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="320" y="140" width="240" height="56" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
        <rect x="630" y="140" width="250" height="56" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <path class="ln" d="M250 58 H316" marker-end="url(#arrow)" />
        <path class="ln" d="M560 58 H626" marker-end="url(#arrow)" />
        <path class="ln" d="M250 168 H316" marker-end="url(#arrow)" />
        <path class="ln" d="M560 168 H626" marker-end="url(#arrow)" />
      </g>
      <text class="lbl" x="36" y="54">SSH remote</text>
      <text class="sm" x="36" y="74">git@github.com:acme/api</text>
      <text class="lbl" x="336" y="54">ssh + ssh-agent</text>
      <text class="sm" x="336" y="74">key: ~/.ssh/id_ed25519</text>
      <text class="lbl" x="646" y="54">GitHub</text>
      <text class="sm" x="646" y="74">matches your public key</text>
      <text class="lbl" x="36" y="164">HTTPS remote</text>
      <text class="sm" x="36" y="184">https://github.com/acme/api</text>
      <text class="lbl" x="336" y="164">credential helper</text>
      <text class="sm" x="336" y="184">token from the keychain</text>
      <text class="lbl" x="646" y="164">GitHub</text>
      <text class="sm" x="646" y="184">checks the token</text>
    </svg>
    <figcaption>
      Git itself never stores a secret. SSH hands the job to
      <code>ssh</code> and its agent; HTTPS hands it to a credential
      helper. That is why fixing a login problem is usually outside
      Git's own settings.
    </figcaption>
  </figure>

  <p class="sub">SSH: one key per machine</p>
  <div class="codeblock">
    <pre><code>$ ssh-keygen -t ed25519 -C "aisha@hey.com"
$ ssh-add ~/.ssh/id_ed25519
$ cat ~/.ssh/id_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG4r... aisha@hey.com

$ ssh -T git@github.com
Hi aisha! You've successfully authenticated, but GitHub does not provide shell access.</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    Paste the <code>.pub</code> line into your account's SSH keys
    page; the private file never leaves your machine. Protect it with
    a passphrase and let <code>ssh-agent</code> (or the macOS keychain,
    via <code>UseKeychain yes</code> in <code>~/.ssh/config</code>)
    remember it. If you need two GitHub accounts on one machine, give
    each its own key. Either use <code>core.sshCommand</code> in the
    work include file, as shown earlier, or define a host alias in
    <code>~/.ssh/config</code> such as <code>Host github-work</code>
    with its own <code>IdentityFile</code>, and use
    <code>git@github-work:acme/api.git</code> as the remote.
  </p>

  <p class="sub">HTTPS: let a credential helper hold the token</p>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Helper</th><th>Where</th><th>Stores the secret in</th></tr>
      </thead>
      <tbody>
        <tr><td><code>osxkeychain</code></td><td>macOS</td><td>The login keychain. Often preset in the system config.</td></tr>
        <tr><td><code>manager</code></td><td>Windows, also macOS and Linux</td><td>Git Credential Manager: OS secure storage, with browser-based OAuth sign-in and 2FA support.</td></tr>
        <tr><td><code>libsecret</code></td><td>Linux desktops</td><td>GNOME Keyring or KWallet.</td></tr>
        <tr><td><code>cache --timeout=3600</code></td><td>Anywhere</td><td>Memory only, forgotten after the timeout.</td></tr>
        <tr><td><code>store</code></td><td>Anywhere</td><td><code>~/.git-credentials</code> as <strong>plain text</strong>. Avoid it.</td></tr>
      </tbody>
    </table>
  </div>

  <p>
    Set one with <code>git config --global credential.helper
    osxkeychain</code>. If you use the GitHub CLI,
    <code>gh auth login</code> followed by <code>gh auth setup-git</code>
    configures a helper that reuses the CLI's login. When a token
    expires or is revoked, the helper keeps offering the stale one;
    remove it from the keychain (or run
    <code>git credential reject</code>) and the next push will ask
    again.
  </p>

  <div class="bx is-ref">
    <span class="ttl">Sign commits with the key you already have</span>
    <p>
      Since Git 2.34 you can sign commits with an SSH key instead of
      GPG: set <code>gpg.format ssh</code>,
      <code>user.signingKey ~/.ssh/id_ed25519.pub</code> and
      <code>commit.gpgSign true</code>. Add the same public key to your
      host as a <em>signing</em> key and commits show as verified.
      Signing proves who made a commit; the email field alone proves
      nothing.
    </p>
  </div>

  <h3>.gitattributes: per-path rules that travel with the repo</h3>
  <p>
    Your config is personal. <code>.gitattributes</code> is committed,
    so every clone gets the same behaviour. Each line is a path
    pattern followed by attributes.
  </p>

  <div class="codeblock">
    <pre><code>* text=auto
*.sh  text eol=lf
*.bat text eol=crlf
*.png binary
*.pdf binary
*.jpg diff=exif
*.go  diff=golang
*.md  diff=markdown
package-lock.json -diff linguist-generated=true
dist/** linguist-generated=true
vendor/** linguist-vendored
docs/** linguist-documentation
CHANGELOG.md merge=union
/.github export-ignore
/tests export-ignore
.gitattributes export-ignore</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    <strong>Line endings.</strong> <code>* text=auto</code> tells Git
    to detect text files and store them with <code>LF</code> in the
    repository, converting on checkout if needed. <code>eol=lf</code>
    forces <code>LF</code> in the working directory too, which shell
    scripts need even on Windows, and <code>eol=crlf</code> does the
    reverse for batch files. This beats the per-user
    <code>core.autocrlf</code> setting because it does not depend on
    every contributor configuring their machine. After adding these
    rules to an existing project, run
    <code>git add --renormalize .</code> and commit, so files already
    stored with <code>CRLF</code> are fixed once, in one commit.
  </p>
  <p>
    <strong>Binary and diff.</strong> <code>binary</code> is shorthand
    for <code>-diff -merge -text</code>: no line-ending conversion, no
    text diff, no attempt to merge. <code>-diff</code> alone keeps a
    huge generated file like a lock file out of your diffs ("Binary
    files differ") while still treating it as text. A
    <code>diff=</code> driver changes how diffs are shown. The built-in
    ones (<code>golang</code>, <code>python</code>,
    <code>java</code>, <code>markdown</code> and others) give better
    hunk headers, so a diff says which function it is in. A custom
    driver can convert a binary to text first:
    <code>git config --global diff.exif.textconv exiftool</code> makes
    photo diffs show changed metadata.
  </p>
  <p>
    <strong>Linguist.</strong> The <code>linguist-*</code> attributes
    are read by GitHub, not Git. <code>linguist-generated</code>
    collapses the file in pull request diffs and leaves it out of the
    language statistics; <code>linguist-vendored</code> and
    <code>linguist-documentation</code> also drop paths from the
    statistics.
  </p>
  <p>
    <strong>Merge and export.</strong> <code>merge=union</code> keeps
    lines from both sides instead of reporting a conflict. That suits
    an append-only file like a changelog, and is wrong for code.
    <code>export-ignore</code> leaves paths out of
    <code>git archive</code>, and so out of the source tarballs GitHub
    builds for releases.
  </p>

  <div class="codeblock">
    <pre><code>$ git check-attr -a deploy.sh logo.png package-lock.json
deploy.sh: text: set
deploy.sh: eol: lf
logo.png: binary: set
logo.png: diff: unset
logo.png: merge: unset
logo.png: text: unset
package-lock.json: diff: unset
package-lock.json: text: auto
package-lock.json: linguist-generated: true</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <h3>A global gitignore for your machine's junk</h3>
  <p>
    A project's <code>.gitignore</code> should list what the
    <em>project</em> produces: <code>node_modules/</code>,
    <code>dist/</code>, <code>.env</code>. Files produced by
    <em>your</em> operating system and editor belong in your own
    global ignore file, so nobody has to add <code>.DS_Store</code>
    to every repository on your behalf.
  </p>

  <div class="codeblock">
    <pre><code>$ mkdir -p ~/.config/git
$ printf '.DS_Store\\nThumbs.db\\n.idea/\\n*.swp\\n.vscode/\\n' &gt; ~/.config/git/ignore
$ git check-ignore -v .DS_Store
/Users/aisha/.config/git/ignore:1:.DS_Store	.DS_Store</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    <code>~/.config/git/ignore</code> is read automatically. To use
    another file, point <code>core.excludesFile</code> at it. For
    patterns that apply to one clone only, such as a scratch folder
    you keep inside a project, use <code>.git/info/exclude</code>; it
    works like <code>.gitignore</code> but is never committed.
  </p>

  <h3>Verify your setup</h3>
  <p>Run these once on a new machine. Each one answers a question you would otherwise discover the hard way.</p>

  <div class="codeblock">
    <pre><code>$ git --version
git version 2.53.0

$ git config user.name &amp;&amp; git config user.email
Aisha Khan
aisha@hey.com

$ git config --show-origin --get init.defaultBranch
file:/Users/aisha/.gitconfig	main

$ git var GIT_EDITOR
code --wait

$ ssh -T git@github.com
Hi aisha! You've successfully authenticated, but GitHub does not provide shell access.

$ git ls-remote origin HEAD
1b06427a8c7d8fe438acd53c39008641a3cff92e	HEAD</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    Check the email inside a work folder and a personal folder if you
    use <code>includeIf</code>. <code>git ls-remote</code> is the
    cheapest proof that authentication works: it lists the remote's
    refs without changing anything. When something still fails,
    <code>GIT_TRACE=1 git fetch</code> shows what Git runs, and
    <code>GIT_SSH_COMMAND="ssh -v" git fetch</code> shows which SSH
    key is offered and why it is refused.
  </p>

  <div class="sticky mint">
    <span class="ttl">Keep it in your dotfiles</span>
    <p>
      Put <code>~/.gitconfig</code>, your include files and
      <code>~/.config/git/ignore</code> in a dotfiles repository. A new
      laptop then gets your identity, aliases and defaults in one
      clone. Keep secrets out of it: tokens belong in the credential
      helper and keys in <code>~/.ssh</code>, never in config.
    </p>
  </div>
`,
};
