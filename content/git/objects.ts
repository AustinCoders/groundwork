import type { GitSection } from "./types";

export const gitObjects: GitSection = {
  id: "objects",
  num: "G2",
  title: "What Git actually stores",
  short: "What Git stores",
  subtitle:
    "A key-value store of four object types, named by the hash of their contents, with a thin layer of pointers on top.",
  body: `
<div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    Underneath the commands, Git is a <strong>content-addressable
    key-value store</strong>. You hand it some bytes, it hands back a
    key computed from those bytes, and later you can get the bytes
    back with the key. Everything in <code>.git/objects</code> is one
    of only four kinds of object. Knowing them separates people who
    use Git from people who understand it.
  </p>

  <div class="bx is-prim">
    <span class="ttl">In one minute</span>
    <p>
      Git keeps a folder of objects in <code>.git/objects</code>. A
      <em>blob</em> is one file's content, a <em>tree</em> is one
      folder, and a <em>commit</em> points at the top tree plus the
      commit before it. Each object is named by a hash of its bytes,
      so the same content always gets the same name and is stored
      once. Branches and tags are just names that point at commits.
      You never need to touch these files, but knowing they exist
      explains why commits cannot change, why renames are guessed,
      and why "deleted" work can usually be found again.
    </p>
  </div>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Object</th><th>What it holds</th><th>Everyday name</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Blob</strong></td><td>The raw contents of a file. No filename, no permissions, just bytes.</td><td>A file's content</td></tr>
        <tr><td><strong>Tree</strong></td><td>A directory listing: names, modes, and pointers to blobs and other trees.</td><td>A folder</td></tr>
        <tr><td><strong>Commit</strong></td><td>One tree pointer, parent pointer(s), author, committer, timestamps, message.</td><td>A snapshot</td></tr>
        <tr><td><strong>Tag</strong></td><td>An annotated pointer to another object, with its own message and optional signature.</td><td>A release marker</td></tr>
      </tbody>
    </table>
  </div>

  <h3>Watch the objects appear</h3>
  <p>
    The fastest way to believe this is to make a tiny repository and
    look. Two files, one folder, one commit:
  </p>

  <div class="codeblock">
    <pre><code>$ git init -q shop &amp;&amp; cd shop
$ mkdir src
$ echo 'hello' &gt; README.md
$ echo 'export const total = 0;' &gt; src/cart.js
$ git add . &amp;&amp; git commit -qm "Initial commit"

$ find .git/objects -type f
.git/objects/ce/013625030ba8dba906f756967f9e9ca394464a
.git/objects/61/63e1adb649b845bdbc1aed214980c2807e014b
.git/objects/3d/cdbc9c963a9bbedfa0387bb1d81828c2c42706
.git/objects/8c/82d9d78771cc89157a7cb03e3fdbfb5d406a0c
.git/objects/6a/e07203cc790b57b95f573fdc803992b4aa3986</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    Five objects: two blobs (the two files), two trees (the root and
    <code>src/</code>), and one commit. Each is a file named after
    its ID, with the first two hex characters used as a folder so no
    single directory ends up with millions of entries. Your IDs for
    the blobs will match these exactly, because a blob's ID depends
    only on its content. The commit's ID will differ, because yours
    has a different author and timestamp.
  </p>

  <h3>Blobs, and how an ID is computed</h3>
  <p>
    Every object's ID is a hash of its own contents. Identical
    content anywhere in history produces the same ID and is stored
    once. It also means history is tamper-evident: change one byte
    in an old commit and its hash changes, which changes its
    child's hash, and so on down the chain. That cascade is exactly
    why rewriting history gives every downstream commit a new ID.
  </p>
  <p>
    The hash is not taken over the file alone. Git first writes a
    short header: the object type, a space, the content length in
    bytes, and a NUL byte. Then it hashes header plus content with
    SHA-1, compresses the same bytes with zlib, and writes the result
    to disk.
  </p>

  <figure>
    <svg viewBox="0 0 900 200" class="dg" role="img" aria-label="The header 'blob 6' followed by a NUL byte is joined to the content 'hello' plus a newline. SHA-1 over those bytes gives ce013625030ba8dba906f756967f9e9ca394464a. The bytes are zlib-compressed and stored at .git/objects/ce/ followed by the remaining 38 characters.">
      <g class="rough">
        <rect x="20" y="40" width="180" height="110" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="255" y="60" width="120" height="70" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="430" y="40" width="200" height="110" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="685" y="40" width="195" height="110" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <path class="ln" d="M200 95 H251" marker-end="url(#arrow)" />
        <path class="ln" d="M375 95 H426" marker-end="url(#arrow)" />
        <path class="ln" d="M630 95 H681" marker-end="url(#arrow)" />
      </g>
      <text class="sm" x="36" y="64">HEADER + CONTENT</text>
      <text class="lbl" x="36" y="98" style="font-family: var(--font-mono)">blob 6\\0</text>
      <text class="lbl" x="36" y="126" style="font-family: var(--font-mono)">hello\\n</text>
      <text class="lbl" x="315" y="101" text-anchor="middle">SHA-1</text>
      <text class="sm" x="446" y="64">OBJECT ID</text>
      <text class="sm" x="446" y="98" style="font-family: var(--font-mono)">ce013625030ba8dba906</text>
      <text class="sm" x="446" y="120" style="font-family: var(--font-mono)">f756967f9e9ca394464a</text>
      <text class="sm" x="656" y="84" text-anchor="middle">zlib</text>
      <text class="sm" x="701" y="64">STORED AT</text>
      <text class="sm" x="701" y="98" style="font-family: var(--font-mono)">.git/objects/ce/</text>
      <text class="sm" x="701" y="120" style="font-family: var(--font-mono)">013625030ba8…</text>
      <text class="sm" x="20" y="184">\\0 is a NUL byte. 6 is the content length in bytes, counting the newline.</text>
    </svg>
    <figcaption>
      The type is part of what gets hashed, so a blob and a tree with
      identical bytes still get different IDs. The first two hex
      digits become a folder, the other 38 the file name.
    </figcaption>
  </figure>

  <p class="sub">prove it: Git's hash and a plain SHA-1 agree</p>
  <div class="codeblock">
    <pre><code>$ echo 'hello' | git hash-object --stdin
ce013625030ba8dba906f756967f9e9ca394464a

$ printf 'blob 6\\0hello\\n' | shasum
ce013625030ba8dba906f756967f9e9ca394464a  -

$ python3 -c "import zlib; print(zlib.decompress(open('.git/objects/ce/013625030ba8dba906f756967f9e9ca394464a','rb').read()))"
b'blob 6\\x00hello\\n'</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    A blob has no name. Rename <code>README.md</code> and the blob
    does not change at all; only the tree that lists it does. Copy
    the same logo into ten folders and Git stores it once. Every
    repository in the world that contains a file whose content is
    exactly <code>hello</code> and a newline has the object
    <code>ce01362</code>.
  </p>

  <h3>Trees</h3>
  <p>
    A tree is one directory. Each entry has a mode, a type, an object
    ID and a name. Subdirectories are entries that point at other
    trees, which is how a whole project becomes one tree at the top.
  </p>

  <div class="codeblock">
    <pre><code>$ git cat-file -p HEAD^{tree}
100644 blob ce013625030ba8dba906f756967f9e9ca394464a	README.md
040000 tree 3dcdbc9c963a9bbedfa0387bb1d81828c2c42706	src

$ git cat-file -p 3dcdbc9
100644 blob 6163e1adb649b845bdbc1aed214980c2807e014b	cart.js</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Mode</th><th>Means</th></tr>
      </thead>
      <tbody>
        <tr><td><code>100644</code></td><td>A normal file.</td></tr>
        <tr><td><code>100755</code></td><td>An executable file. This single bit is the only permission Git records.</td></tr>
        <tr><td><code>120000</code></td><td>A symbolic link. The blob holds the link's target path.</td></tr>
        <tr><td><code>040000</code></td><td>A subdirectory, pointing at another tree.</td></tr>
        <tr><td><code>160000</code></td><td>A submodule: a commit ID from a different repository, called a gitlink.</td></tr>
      </tbody>
    </table>
  </div>

  <p>
    Two consequences show up in daily work. Git records no owner, no
    group and no read/write bits, only "executable or not", which is
    why <code>chmod +x</code> shows up in a diff as
    <code>old mode 100644 / new mode 100755</code>. And a tree is
    built from files, so an empty directory has nothing to list and
    cannot be committed. That is the whole reason people commit an
    empty <code>.gitkeep</code> file.
  </p>

  <h3>Commits</h3>
  <p>
    A commit is short. It names one tree (the root of the snapshot),
    zero or more parents, two identities with timestamps, and the
    message. Here is a second commit that changed
    <code>src/cart.js</code>:
  </p>

  <div class="codeblock">
    <pre><code>$ git cat-file -t HEAD
commit
$ git cat-file -p HEAD
tree 258c07957443ecf77599b71ce4190186c7219cdd
parent 6ae07203cc790b57b95f573fdc803992b4aa3986
author Aisha Khan &lt;aisha@corp.dev&gt; 1754216400 +0530
committer Aisha Khan &lt;aisha@corp.dev&gt; 1754216400 +0530

Fix cart total when coupon is expired</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    The timestamp is Unix seconds plus the author's UTC offset.
    <strong>Author</strong> is who wrote the change;
    <strong>committer</strong> is who last wrote this commit object.
    They differ after a rebase, a cherry-pick, or when a maintainer
    applies your patch. A signed commit carries one more header,
    <code>gpgsig</code>, holding the signature over everything else.
    Note what is <em>not</em> in there: no branch name, no diff, no
    list of changed files. The diff is computed by comparing this
    commit's tree with its parent's tree.
  </p>

  <figure>
    <svg viewBox="0 0 900 440" class="dg" role="img" aria-label="A tag v1.0 points to commit 550728f. That commit points to its parent 6ae0720 and to root tree 258c079. The parent commit points to root tree 8c82d9d. Both root trees point to the same README.md blob ce01362. Each root tree points to its own src tree, and each src tree to its own version of cart.js.">
      <g class="rough">
        <rect x="20" y="20" width="200" height="56" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
        <rect x="300" y="20" width="220" height="56" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="620" y="20" width="240" height="56" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="320" y="130" width="180" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="650" y="130" width="180" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="240" y="250" width="170" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="440" y="250" width="170" height="56" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="700" y="250" width="170" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="240" y="360" width="170" height="56" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="700" y="360" width="170" height="56" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <path class="ln" d="M220 48 H296" marker-end="url(#arrow)" />
        <path class="ln" d="M520 48 H616" marker-end="url(#arrow)" />
        <path class="ln" d="M410 76 V126" marker-end="url(#arrow)" />
        <path class="ln" d="M740 76 V126" marker-end="url(#arrow)" />
        <path class="ln" d="M380 186 L335 246" marker-end="url(#arrow)" />
        <path class="ln" d="M440 186 L500 246" marker-end="url(#arrow)" />
        <path class="ln" d="M690 186 L575 246" marker-end="url(#arrow)" />
        <path class="ln" d="M770 186 L785 246" marker-end="url(#arrow)" />
        <path class="ln" d="M325 306 V356" marker-end="url(#arrow)" />
        <path class="ln" d="M785 306 V356" marker-end="url(#arrow)" />
      </g>
      <text class="lbl" x="36" y="44">tag v1.0</text>
      <text class="sm" x="36" y="64" style="font-family: var(--font-mono)">fffdaf0</text>
      <text class="lbl" x="316" y="44">commit</text>
      <text class="sm" x="316" y="64" style="font-family: var(--font-mono)">550728f</text>
      <text class="sm" x="568" y="38" text-anchor="middle">parent</text>
      <text class="lbl" x="636" y="44">commit</text>
      <text class="sm" x="636" y="64" style="font-family: var(--font-mono)">6ae0720</text>
      <text class="lbl" x="336" y="154">tree /</text>
      <text class="sm" x="336" y="174" style="font-family: var(--font-mono)">258c079</text>
      <text class="lbl" x="666" y="154">tree /</text>
      <text class="sm" x="666" y="174" style="font-family: var(--font-mono)">8c82d9d</text>
      <text class="lbl" x="256" y="274">tree src/</text>
      <text class="sm" x="256" y="294" style="font-family: var(--font-mono)">7dcc306</text>
      <text class="lbl" x="456" y="274">blob README</text>
      <text class="sm" x="456" y="294" style="font-family: var(--font-mono)">ce01362</text>
      <text class="lbl" x="716" y="274">tree src/</text>
      <text class="sm" x="716" y="294" style="font-family: var(--font-mono)">3dcdbc9</text>
      <text class="lbl" x="256" y="384">blob cart.js</text>
      <text class="sm" x="256" y="404">total = 1</text>
      <text class="lbl" x="716" y="384">blob cart.js</text>
      <text class="sm" x="716" y="404">total = 0</text>
      <text class="sm" x="20" y="150">README.md did not change,</text>
      <text class="sm" x="20" y="170">so both root trees point</text>
      <text class="sm" x="20" y="190">at the same blob.</text>
    </svg>
    <figcaption>
      The real object graph for the two-commit repository above.
      Commits point at trees, trees at blobs and other trees. A new
      commit only creates objects for what changed, plus new trees on
      the path from the root down to each changed file.
    </figcaption>
  </figure>

  <h3>Tags</h3>
  <p>
    There are two kinds of tag, and only one is an object. A
    <strong>lightweight tag</strong> is a ref, a file under
    <code>refs/tags/</code> holding a commit ID, exactly like a
    branch that never moves. An <strong>annotated tag</strong>
    (<code>git tag -a</code> or <code>-s</code>) creates a tag object
    with its own author, date and message, and the ref points at
    that.
  </p>

  <div class="codeblock">
    <pre><code>$ git tag -a v1.0 -m "First release"
$ git cat-file -p v1.0
object 550728f6c956638ff077ccb0fb293038ec04e933
type commit
tag v1.0
tagger Aisha Khan &lt;aisha@corp.dev&gt; 1754220000 +0530

First release

$ git rev-parse v1.0 v1.0^{}
fffdaf0757acf8370b1985b1ea6e40302304cc33
550728f6c956638ff077ccb0fb293038ec04e933</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    <code>v1.0</code> resolves to the tag object;
    <code>v1.0^{}</code> "peels" it to the commit underneath. Use
    annotated tags for releases: <code>git describe</code> ignores
    lightweight tags by default, and only annotated tags can carry a
    signature.
  </p>

  <h3>Build a commit by hand</h3>
  <p>
    Porcelain commands like <code>add</code> and <code>commit</code>
    are built on <em>plumbing</em> commands that each do one step.
    Running them yourself once makes the model concrete:
  </p>

  <div class="codeblock">
    <pre><code>$ git init -q -b main by-hand &amp;&amp; cd by-hand
$ echo 'hello' | git hash-object -w --stdin
ce013625030ba8dba906f756967f9e9ca394464a

$ git update-index --add --cacheinfo 100644,ce013625030ba8dba906f756967f9e9ca394464a,README.md

$ git write-tree
853694aae8816094a0d875fee7ea26278dbf5d0f

$ git commit-tree 853694a -m "Built by hand"
91ccfe599e0f75155a6428a0cfc5faccb6dad501

$ git update-ref refs/heads/main 91ccfe599e0f75155a6428a0cfc5faccb6dad501
$ git log --oneline
91ccfe5 (HEAD -&gt; main) Built by hand</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    That is <code>git commit</code> in five steps: store the blob,
    record it in the index, turn the index into a tree, wrap the tree
    in a commit, then move the branch. Your commit ID will differ
    because of your name and the time; the blob and tree IDs will
    not.
  </p>

  <h3>Refs: the names on top</h3>
  <p>
    Objects are immutable and anonymous. Refs are the mutable,
    human-readable layer: files whose content is an object ID (or,
    for a symbolic ref, the name of another ref).
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Ref</th><th>Where</th><th>What it is</th></tr>
      </thead>
      <tbody>
        <tr><td>Branches</td><td><code>refs/heads/*</code></td><td>Your local branches. Move when you commit.</td></tr>
        <tr><td>Tags</td><td><code>refs/tags/*</code></td><td>Release names. Not expected to move.</td></tr>
        <tr><td>Remote-tracking</td><td><code>refs/remotes/origin/*</code></td><td>Your last-known view of the remote. Move only on fetch.</td></tr>
        <tr><td><code>HEAD</code></td><td><code>.git/HEAD</code></td><td>Usually <code>ref: refs/heads/main</code>. A raw ID means detached.</td></tr>
        <tr><td><code>ORIG_HEAD</code></td><td><code>.git/ORIG_HEAD</code></td><td>Where HEAD was before a reset, rebase or merge. A quick undo point.</td></tr>
        <tr><td><code>FETCH_HEAD</code>, <code>MERGE_HEAD</code></td><td><code>.git/</code></td><td>What the last fetch brought in; what is being merged right now.</td></tr>
      </tbody>
    </table>
  </div>

  <p>
    One file per ref gets slow with tens of thousands of tags, so
    <code>git gc</code> packs them into a single
    <code>.git/packed-refs</code> file. A loose file, if present,
    wins over the packed entry.
  </p>

  <div class="codeblock">
    <pre><code>$ cat .git/packed-refs
# pack-refs with: peeled fully-peeled sorted
550728f6c956638ff077ccb0fb293038ec04e933 refs/heads/main
fffdaf0757acf8370b1985b1ea6e40302304cc33 refs/tags/v1.0
^550728f6c956638ff077ccb0fb293038ec04e933</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    The line starting <code>^</code> is the peeled value of the tag
    above it, cached so Git does not have to open the tag object.
    Git 2.45 added a second backend, <strong>reftable</strong>
    (<code>git init --ref-format=reftable</code>), a binary format
    that stays fast with millions of refs and updates many refs
    atomically. Either way, never edit ref files by hand; use
    <code>git update-ref</code>, which also writes the reflog.
  </p>

  <div class="bx is-ref">
    <span class="ttl">For seniors: files versus reftable</span>
    <p>
      The classic <em>files</em> backend has real failure modes at
      scale. Deleting one ref rewrites the whole
      <code>packed-refs</code> file, which can be hundreds of
      megabytes on a busy server. A transaction that moves many refs
      is not atomic, so a reader can see a half-applied update. And
      because each ref is a file path, two branches that differ only
      in case (<code>Fix</code> and <code>fix</code>) collide on
      macOS and Windows. Reftable stores refs in sorted binary tables
      with compaction after each write, which removes all three
      problems. An existing repository can switch with
      <code>git refs migrate --ref-format=reftable</code> (Git 2.46
      and later), and <code>git rev-parse --show-ref-format</code>
      tells you which one you have. The Git project plans to make
      reftable the default for new repositories in Git 3.0. Until
      then, check that every tool touching the repository (IDE
      plugins, tools built on other Git libraries, your CI image) understands
      it before you migrate.
    </p>
  </div>

  <h3>The index is a file too</h3>
  <p>
    The staging area is <code>.git/index</code>, a binary file that
    starts with the magic bytes <code>DIRC</code>. It holds one entry
    per tracked file: path, mode, blob ID, a stage number, and cached
    file-system stats (size, modification time, inode) so
    <code>git status</code> can skip hashing files that have not been
    touched.
  </p>

  <div class="codeblock">
    <pre><code>$ git ls-files --stage
100644 ce013625030ba8dba906f756967f9e9ca394464a 0	README.md
100644 0a5b761ba428dcd2cf481221b5d9a0df20c3c715 0	src/cart.js

$ xxd .git/index | head -2
00000000: 4449 5243 0000 0002 0000 0002 6ab6 c608  DIRC........j...
00000010: 0e8f 1eb9 6ab6 c608 0e8f 1eb9 0100 0011  ....j...........</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    After <code>DIRC</code> come the format version (2) and the entry
    count (2). The <code>0</code> column in <code>ls-files</code> is
    the stage. During a merge conflict one path gets up to three
    entries: stage 1 is the merge base, 2 is yours, 3 is theirs.
    Resolving a conflict means collapsing those back to a single
    stage 0 entry, which is what <code>git add</code> does.
    <a href="/git/areas">The three areas</a> covers the index from the
    user's side.
  </p>

  <h3>Loose objects and packfiles</h3>
  <p>
    Every object starts life as a <strong>loose</strong> object: one
    zlib file. That is simple but wasteful. A 20 KB file edited 300
    times would be 300 nearly identical compressed copies. So Git
    periodically moves objects into a <strong>packfile</strong>,
    where similar objects are stored as <em>deltas</em> against each
    other.
  </p>

  <figure>
    <svg viewBox="0 0 900 250" class="dg" role="img" aria-label="On the left, twelve loose objects, each its own zlib file. An arrow labelled git gc leads to a packfile on the right. Inside the packfile the newest cart.js is stored whole; an older cart.js is stored as a small delta against it; an even older one is a delta against that delta.">
      <g class="rough">
        <rect x="30" y="60" width="40" height="30" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="80" y="60" width="40" height="30" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="130" y="60" width="40" height="30" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="180" y="60" width="40" height="30" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="30" y="100" width="40" height="30" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="80" y="100" width="40" height="30" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="130" y="100" width="40" height="30" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="180" y="100" width="40" height="30" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="30" y="140" width="40" height="30" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="80" y="140" width="40" height="30" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="130" y="140" width="40" height="30" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="180" y="140" width="40" height="30" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <path class="ln" d="M240 115 H326" marker-end="url(#arrow)" />
        <rect x="345" y="40" width="530" height="150" rx="12" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="380" y="62" width="300" height="28" rx="4" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="380" y="100" width="80" height="28" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="380" y="138" width="60" height="28" rx="4" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.6" />
        <path class="ln" d="M380 114 C360 114 360 76 376 76" marker-end="url(#arrow)" />
        <path class="ln" d="M380 152 C360 152 360 114 376 114" marker-end="url(#arrow)" />
      </g>
      <text class="sm" x="30" y="40">LOOSE: A FILE EACH</text>
      <text class="lbl" x="283" y="102" text-anchor="middle">git gc</text>
      <text class="sm" x="390" y="81">cart.js, newest: stored whole</text>
      <text class="sm" x="470" y="119">older cart.js: delta (copy + insert)</text>
      <text class="sm" x="450" y="157">oldest: delta against the one above</text>
      <text class="sm" x="30" y="200">zlib only, no deltas</text>
      <text class="sm" x="345" y="215">.pack holds the objects; .idx maps each ID to an offset</text>
    </svg>
    <figcaption>
      A delta is a list of "copy bytes 0–4100 from the base, then
      insert these 30 bytes". Git keeps the newest version whole
      because that is the one you read most, and makes older versions
      pay the cost of rebuilding.
    </figcaption>
  </figure>

  <div class="codeblock">
    <pre><code>$ git count-objects -v
count: 10
size: 40
in-pack: 0
packs: 0
size-pack: 0
prune-packable: 0
garbage: 0
size-garbage: 0

$ git gc
$ git count-objects -v
count: 0
size: 0
in-pack: 10
packs: 1
size-pack: 2
prune-packable: 0
garbage: 0
size-garbage: 0</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    <code>count</code> and <code>size</code> are loose objects and
    their disk use in KiB; <code>in-pack</code> and
    <code>size-pack</code> are the same for packs. Add
    <code>-H</code> for human-readable sizes. To see inside a pack,
    <code>git verify-pack -v .git/objects/pack/pack-*.idx</code>
    lists every object with its type, size, packed size and offset,
    and for deltas, the chain depth and the base object.
  </p>

  <p>Some details that come up in practice:</p>
  <ul>
    <li>
      <strong>Deltas are not "previous version" diffs.</strong> Git
      picks bases by similarity, sorting objects by type, file name
      and size, then trying each against a sliding window of
      neighbours (<code>pack.window</code>, default 10). A delta can
      be against any similar object, even a different file.
    </li>
    <li>
      <strong>Chains are capped.</strong> <code>pack.depth</code>
      (default 50) limits how many deltas deep a chain goes, trading
      disk space for read speed.
    </li>
    <li>
      <strong>You rarely run gc yourself.</strong> Many commands run
      <code>git gc --auto</code>, which acts when there are more than
      about 6,700 loose objects (<code>gc.auto</code>) or more than 50
      packs (<code>gc.autoPackLimit</code>). For large repositories,
      <code>git maintenance start</code> schedules smaller background
      tasks instead and turns the automatic foreground gc off for that
      repository. Do not mix the two by hand: if you want a full gc
      in a repository under scheduled maintenance, run
      <code>git maintenance run --task=gc</code>, which takes the same
      lock as the background jobs.
    </li>
    <li>
      <strong>The network speaks packs.</strong> A clone, fetch or
      push builds a pack of exactly the objects the other side is
      missing, deltas included. That is why pushing a one-line change
      to a huge repository is fast.
    </li>
    <li>
      <strong>Unreachable objects linger.</strong> Recent versions of
      Git move unreachable objects into a <em>cruft pack</em> and only
      delete them once they are older than <code>gc.pruneExpire</code>
      (two weeks by default). <code>git fsck --unreachable</code>
      lists them, and <code>git fsck --lost-found</code> recovers
      dangling blobs and commits.
    </li>
  </ul>

  <h3>SHA-1, collisions and SHA-256</h3>
  <p>
    Git was designed around SHA-1, which is no longer
    collision-resistant: in 2017 the SHAttered attack produced two
    different PDFs with the same SHA-1. Since version 2.13 Git uses a
    hardened implementation that detects the known collision
    technique and refuses such objects, so the practical risk for a
    normal repository is very low. The hash is there to name content
    and detect corruption, not to be your security boundary; use
    signed commits and tags for that.
  </p>
  <p>
    The long-term fix is <strong>SHA-256</strong>. Since Git 2.29 you
    can create a repository with
    <code>git init --object-format=sha256</code>, where object IDs are
    64 hex characters. The catch is interoperability: a SHA-256
    repository cannot exchange objects with a SHA-1 one, and hosting
    support is still limited. The Git project plans to make SHA-256
    the default for new repositories in Git 3.0, which has no release
    date yet, and it has no plan to drop SHA-1 repositories. For now,
    write tooling that does not assume IDs are 40 characters long:
    <code>git rev-parse --show-object-format</code> tells a script
    which hash a repository uses.
  </p>

  <div class="sticky">
    <span class="ttl">Common misconception</span>
    <p>
      Git does <em>not</em> track renames. No object records "this
      file used to be called that". Git notices renames after the
      fact by comparing content similarity between two snapshots
      (50% similar by default, tunable with <code>-M</code>). That's
      why a rename plus heavy edits in the same commit sometimes
      shows up as a delete plus an add. Rename in one commit, edit in
      the next, and <code>git log --follow</code> keeps working.
    </p>
  </div>
`,
};
