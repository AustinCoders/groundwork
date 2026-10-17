import type { Chapter } from "../types";

export const sysdesStorageSystems: Chapter = {
  id: "sysdes-storage-systems",
  num: "I8",
  title: "Storage systems",
  short: "Storage systems",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Block, file, object — and why the bytes of a user upload should never touch your app servers.",
  body: `<h3>Three storage abstractions, and the one you should default to</h3>
<p>
  "Where do the files go?" appears in nearly every design that touches
  photos, video, documents or backups, and it is a question with a boring
  correct answer that a surprising number of candidates miss. The three
  abstractions differ in what the storage layer knows about your data: block
  storage knows nothing but offsets, file storage knows a directory tree,
  object storage knows an immutable blob plus metadata and nothing else.
</p>
<table>
  <tr><th></th><th>Block</th><th>File</th><th>Object</th></tr>
  <tr><td>Unit</td><td>Fixed-size blocks, no structure</td><td>Files in a POSIX hierarchy</td><td>Immutable blob + key + metadata, flat namespace</td></tr>
  <tr><td>Access</td><td>Attached to one machine as a device</td><td>Mounted by many machines (NFS/SMB)</td><td>HTTP GET/PUT, from anywhere</td></tr>
  <tr><td>Mutation</td><td>Random read/write at any offset</td><td>Random read/write, plus locking semantics</td><td>Replace whole object; no partial in-place edit</td></tr>
  <tr><td>Scale limit</td><td>One volume, typically up to ~64 TB</td><td>Petabytes, but metadata operations get slow</td><td>Effectively unbounded; S3 allows objects up to 50 TB (48.8 TiB) since December 2025 (5 TB before)</td></tr>
  <tr><td>Latency (rough, varies)</td><td>Network-attached SSD such as EBS gp3: single-digit ms; local NVMe: far lower</td><td>Low single-digit ms</td><td>~100-200 ms first byte on S3 Standard (AWS guidance); single-digit ms on S3 Express One Zone</td></tr>
  <tr><td>Cost / GB-month (approximate US East list prices; check current)</td><td>~$0.08 (SSD-backed)</td><td>~$0.30 (managed NFS)</td><td>~$0.023, dropping to ~$0.001 archived</td></tr>
  <tr><td>Reach for this when…</td><td>A database's data directory, or anything needing real random writes</td><td>Legacy software that insists on a filesystem, or shared build/render scratch space</td><td>User uploads, media, backups, logs, static assets — the default</td></tr>
</table>
<p class="sub">
  Notice the cost column spans two orders of magnitude for storing the same
  bytes. That gap is not a discount for being clever; it is what you pay for
  random-write latency you probably do not need. A 500 KB profile photo does
  not need sub-millisecond random access at any offset. It needs to be
  fetched whole, over HTTP, from a CDN.
</p>

<h3>Why object storage is the default, and what the durability number means</h3>
<p>
  S3-class object stores advertise something like <b>eleven nines of
  durability</b> (99.999999999%). That is not marketing noise, but it also
  does not mean what people assume. It is a design target for annual
  expected object loss, not a contractual guarantee: store ten million
  objects and you would statistically expect to lose one roughly every ten
  thousand years. AWS describes how it gets there as redundant storage on
  multiple devices across at least three Availability Zones, continuous
  checksum verification, and fast detection and repair of lost redundancy, so
  that the loss of a whole AZ loses nothing. The generic technique behind
  object stores of this kind is <b>erasure coding</b> — split the object into
  k data fragments plus m parity fragments spread across independent failure
  domains, where any k of the k+m fragments reconstruct it — but treat that as
  the textbook mechanism, not a statement of S3's internals.
</p>
<div class="warn">
  <span class="ttl">⚠ Durability and availability are different properties, and conflating them is a tell</span>
  <b>Durability</b> is "the bytes still exist." <b>Availability</b> is "you
  can read them right now." S3 Standard is designed for eleven nines of durability but
  only 99.99% availability, and the SLA that credits you if it falls short
  starts at a lower, 99.9% threshold. Those are not
  in tension — a regional API outage means you cannot reach a perfectly
  intact object. And critically, <b>durability protects against hardware, not
  against you</b>. Eleven nines does nothing about a bad deploy that deletes
  a prefix, or a compromised credential. That is what versioning, object lock
  and cross-region replication are for. Say this distinction out loud; it is
  a cheap, high-signal moment.
</div>
<p>
  The other property to name explicitly is <b>consistency</b>. Modern S3 is
  strongly read-after-write consistent for PUT, DELETE and LIST, in every
  Region, since December 2020 — a listing issued after a successful write
  shows it. That removed a class of bug that used to bite everyone. The
  caveats that survive are different ones: bucket-level configuration (for
  example, enabling versioning, or deleting a bucket then listing buckets) is
  still eventually consistent; there is no atomic update across keys; two
  concurrent writers to one key are last-writer-wins; and any CDN or client
  cache in front of the bucket reintroduces staleness that the storage
  layer's guarantee says nothing about. For the concurrent-writer case S3
  now supports conditional writes (<code>If-None-Match: *</code> to create
  only if absent, <code>If-Match</code> with an ETag to overwrite only if
  unchanged), which gives you a compare-and-set on a single key. Cache-busting
  by putting a content hash in the key — writing new objects instead of
  overwriting them — sidesteps the cache problem and the overwrite race.
</p>

<h3>Presigned URLs: get your app servers out of the byte path</h3>
<p>
  This is the single most reliably-asked storage detail in an interview, and
  the naive design fails on it hard. If uploads are POSTed to your API, then
  every byte of every file traverses your app servers: they buffer it, hold a
  worker thread or event-loop turn for the whole transfer, consume bandwidth
  twice (in from the client, out to storage), and now your autoscaling is
  driven by upload volume rather than request volume. A single user on a slow
  connection uploading a 2 GB video occupies a server slot for minutes.
</p>
<figure>
  <svg viewBox="0 0 640 290" class="dg" role="img" aria-label="A client asks the app server for a presigned URL, then uploads the file bytes directly to object storage bypassing the app entirely, and an object-created event flows through a queue to a worker that marks the upload ready in the metadata database">
    <g class="rough">
      <path class="ln" d="M138,48 L245,48" />
      <path class="ln dash" d="M245,62 L138,62" />
      <path class="ln" d="M385,49 L490,49" />
      <path class="lng" d="M79,72 L79,167 L245,167" />
      <path class="ln" d="M385,167 L440,167" />
      <path class="ln" d="M515,194 L515,228" />
      <path class="ln dash" d="M590,251 L620,251 L620,72" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="26" width="118" height="46" rx="6" />
      <rect class="boxy" x="245" y="26" width="140" height="46" rx="6" />
      <rect class="box" x="490" y="26" width="130" height="46" rx="6" />
      <rect class="boxg" x="245" y="140" width="140" height="54" rx="6" />
      <rect class="box" x="440" y="140" width="150" height="54" rx="6" />
      <rect class="box" x="440" y="228" width="150" height="46" rx="6" />
    </g>
    <text class="lbl" x="79" y="54" text-anchor="middle">client</text>
    <text class="lbl" x="315" y="48" text-anchor="middle">app server</text>
    <text class="sm" x="315" y="66" text-anchor="middle">issues presigned URL</text>
    <text class="lbl" x="555" y="48" text-anchor="middle">metadata DB</text>
    <text class="sm" x="555" y="66" text-anchor="middle">row: pending</text>
    <text class="lbl" x="315" y="162" text-anchor="middle">object storage</text>
    <text class="sm" x="315" y="182" text-anchor="middle">bucket</text>
    <text class="lbl" x="515" y="162" text-anchor="middle">event queue</text>
    <text class="sm" x="515" y="182" text-anchor="middle">object-created</text>
    <text class="lbl" x="515" y="246" text-anchor="middle">worker</text>
    <text class="sm" x="515" y="264" text-anchor="middle">scan + transcode</text>
    <text class="sm" x="191" y="40" text-anchor="middle">1 init</text>
    <text class="sm" x="191" y="82" text-anchor="middle">2 signed URL</text>
    <text class="sm" x="437" y="40" text-anchor="middle">3 pending row</text>
    <text class="sm gr" x="94" y="122">4 PUT bytes straight to the bucket</text>
    <text class="sm" x="412" y="158" text-anchor="middle">5 event</text>
    <text class="sm" x="612" y="212" text-anchor="end">6 marks it ready</text>
  </svg>
  <figcaption>The green path carries every byte and never touches the app tier. The app tier only ever handles a few small JSON requests per upload, whatever the file size.</figcaption>
</figure>
<p>
  A presigned URL is a normal storage URL with a signature, an expiry and a
  set of constraints baked into the query string. Your app server holds the
  storage credentials; the client never does. Signing is a local
  cryptographic operation — no network call to the storage provider — so
  issuing them is essentially free.
</p>
<p>
  The constraints matter, and interviewers probe them. A presigned PUT should
  pin: <b>expiry</b> (5-15 minutes, not 7 days), <b>the exact object key</b>
  which your server generates so clients cannot overwrite each other's
  objects, and <b>content type</b>. Size needs care: you can sign the exact
  Content-Length you expect, but a presigned PUT cannot express "any size up
  to N". For a size ceiling use a presigned POST with a
  <code>content-length-range</code> condition, or re-check the size from the
  object-created event and delete oversize objects. The key should be
  server-chosen and unguessable — a UUID or content hash, never
  a user-supplied filename, which is both a collision problem and a path
  traversal problem.
</p>
<div class="warn">
  <span class="ttl">⚠ Trusting the client to tell you the upload finished</span>
  If the client PUTs to storage and then calls your API saying "done," a
  malicious or merely buggy client can mark a nonexistent or half-written
  object as ready. Drive the state transition from the storage layer's own
  <em>object-created</em> event instead, which is what the queue in the
  diagram is for. That also gives you a natural place to run the things you
  must never skip: virus scanning, content moderation, size and format
  validation, and metadata extraction — all before the object is visible to
  anyone. Objects sitting in the pending state past their expiry get swept by
  a lifecycle rule.
</div>
<p class="sub">
  Downloads get the same treatment in reverse. Serving private media through
  your API means proxying gigabytes; a presigned GET (or a signed CDN URL
  with a short TTL) lets the CDN serve it while still enforcing
  authorization, because the signature <em>is</em> the authorization and it
  expires.
</p>

<h3>Large media: chunked, resumable, and parallel</h3>
<p>
  A single PUT is fine up to about 100 MB (AWS suggests multipart from there) and is capped at 5 GB. Beyond
  that, and on any mobile network, one long-lived request is the wrong shape:
  a dropped connection at 95% costs you the whole transfer.
</p>
<p>
  <b>Multipart upload</b> solves this. The client initiates an upload and gets
  an upload ID, then uploads independent parts (5 MiB to 5 GiB each, up to 10,000 parts), each
  returning an ETag. The part-count cap sets the part size: a 5 TB object over
  10,000 parts needs parts of at least ~524 MiB, and the maximum 48.8 TiB
  object needs parts near 5 GiB. When all parts are in, the client sends a complete request listing the
  parts and their ETags, and the storage service assembles the object. Three
  properties fall out of that design and each is worth stating:
</p>
<ul>
  <li><b>Resumability.</b> A failed part is retried alone. The client can query which parts already landed and resume after an app restart or a change of network.</li>
  <li><b>Parallelism.</b> Parts are independent, so a client can run 4-8 concurrent uploads and saturate the link rather than being limited by a single TCP stream's throughput.</li>
  <li><b>Integrity.</b> Per-part checksums catch corruption at part granularity instead of after the whole 5 GB transfer.</li>
</ul>
<p>
  Each part can have its own presigned URL, so the bytes still bypass your
  app entirely. The one thing you must remember operationally: incomplete
  multipart uploads consume storage you are billed for and are invisible in a
  normal object listing. A lifecycle rule to abort uploads older than seven
  days is not optional, and mentioning it reads as operational experience.
</p>

<h4>Dry run: one 2.3 GB upload through the presigned-URL flow above</h4>
<table>
  <tr><th>Step</th><th>Who</th><th>What happens</th><th>State after</th></tr>
  <tr><td>1. init</td><td>Client</td><td>POST /uploads {filename: "vacation.mp4", size: 2.3 GB}</td><td>App server generates the object key server-side: uploads/8f2e1c.../vacation.mp4</td></tr>
  <tr><td>2. pending row</td><td>App server</td><td>Insert metadata row {id, key, size: 2.3 GB, status: "pending"}</td><td>A row exists; no bytes exist anywhere yet</td></tr>
  <tr><td>3. signed URL(s)</td><td>App server</td><td>2.3 GB is past the single-PUT comfort zone, so sign a multipart upload at 100 MB/part: ⌈2,300 MB / 100 MB⌉ = 23 presigned part URLs, 10-minute expiry each</td><td>Client holds 23 URLs; app server has still never seen a byte</td></tr>
  <tr><td>4. PUT bytes</td><td>Client</td><td>Uploads parts 1-23 directly to the bucket, 6 in parallel; part 14 drops mid-transfer and is retried alone</td><td>Bytes land in the bucket; metadata row is still "pending"</td></tr>
  <tr><td>5. event</td><td>Object storage</td><td>The client reports the 23 part ETags to the app server (one more small JSON call), which sends CompleteMultipartUpload; storage assembles the parts into one object and emits an object-created event</td><td>Event lands on the queue; the object exists but nothing has confirmed it yet</td></tr>
  <tr><td>6. ready</td><td>Worker</td><td>Consumes the event, verifies the checksum and scans the file, flips the row to "ready"</td><td>Only now is the video visible to any reader</td></tr>
</table>
<p class="sub">
  Track which actor touches the file's bytes: the app server never does — it
  only ever handles the few small JSON calls in steps 1, 3 and 5 (a multipart upload adds the part-signing and complete calls), independent of
  whether the upload is 200 KB or 200 GB. And the pending → ready transition
  is driven entirely by the storage layer's own event in steps 5-6, never by
  the client's word that it finished — exactly the trust boundary the
  warning box above is about.
</p>

<h3>Transcoding: the pipeline behind every video product</h3>
<p>
  Raw uploads are unservable. A 4K phone recording is the wrong codec,
  bitrate and container for most viewers, so you generate a <b>ladder</b> of
  renditions and let the player adapt to the network.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="A source video object flowing through a job queue into a pool of transcoding workers that emit a ladder of renditions at 1080p, 720p and 360p back into object storage">
    <g class="rough">
      <path class="ln" d="M130,104 L170,104" />
      <path class="ln" d="M280,104 L320,58" />
      <path class="ln" d="M280,104 L320,106" />
      <path class="ln" d="M280,104 L320,154" />
      <path class="lng" d="M430,58 L480,58" />
      <path class="lng" d="M430,106 L480,106" />
      <path class="lng" d="M430,154 L480,154" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="80" width="110" height="48" rx="6" />
      <rect class="box" x="170" y="80" width="110" height="48" rx="6" />
      <rect class="boxy" x="320" y="40" width="110" height="36" rx="6" />
      <rect class="boxy" x="320" y="88" width="110" height="36" rx="6" />
      <rect class="boxy" x="320" y="136" width="110" height="36" rx="6" />
      <rect class="boxg" x="480" y="40" width="140" height="36" rx="6" />
      <rect class="boxg" x="480" y="88" width="140" height="36" rx="6" />
      <rect class="boxg" x="480" y="136" width="140" height="36" rx="6" />
    </g>
    <text class="sm" x="75" y="100" text-anchor="middle">source object</text>
    <text class="sm" x="75" y="118" text-anchor="middle">4K, 3 GB</text>
    <text class="sm" x="225" y="100" text-anchor="middle">job queue</text>
    <text class="sm" x="225" y="118" text-anchor="middle">per segment</text>
    <text class="sm" x="375" y="63" text-anchor="middle">worker</text>
    <text class="sm" x="375" y="111" text-anchor="middle">worker</text>
    <text class="sm" x="375" y="159" text-anchor="middle">worker</text>
    <text class="sm" x="550" y="63" text-anchor="middle">1080p / 5 Mbps</text>
    <text class="sm" x="550" y="111" text-anchor="middle">720p / 3 Mbps</text>
    <text class="sm" x="550" y="159" text-anchor="middle">360p / 0.8 Mbps</text>
    <text class="lbl" x="320" y="205" text-anchor="middle" style="font-size:14px">encode is CPU-bound at roughly 1-3× realtime per rendition —</text>
    <text class="lbl" x="320" y="224" text-anchor="middle" style="font-size:14px">split the source into 10-second segments and fan those out</text>
  </svg>
  <figcaption>The parallelism unit is the segment, not the file. Fanning out by rendition alone caps a two-hour film at the speed of one CPU.</figcaption>
</figure>
<p>
  Three design points to raise. First, transcoding is asynchronous by
  definition — the upload response returns immediately with a
  <em>processing</em> status and the client polls or gets pushed a
  notification, which is the message-queue chapter applied directly. Second,
  jobs must be idempotent and keyed on the source object plus rendition, so a
  worker crashing halfway just gets retried without producing duplicates.
  Third, the output is not one file per rendition but hundreds of small
  HLS/DASH segments plus a manifest, because that is what lets a player
  switch bitrate mid-stream — and it means the CDN serves a huge number of
  small cacheable objects rather than a few enormous ones.
</p>

<h3>Where not to put blobs: your relational database</h3>
<p>
  Storing a file as a <code>BYTEA</code> or <code>BLOB</code> column is
  tempting because it gives you transactions and one backup story. It is
  almost always wrong at scale, for reasons worth being able to list quickly:
</p>
<ul>
  <li><b>It destroys your buffer pool.</b> The database caches pages of hot rows in RAM. A 2 MB blob evicts hundreds of useful index and row pages to serve one request. Your unrelated queries get slower.</li>
  <li><b>Backups and restores become impossible to schedule.</b> A 200 GB database backs up in minutes; the same database with 8 TB of images does not, and your recovery time objective quietly becomes hours.</li>
  <li><b>Replication amplifies it.</b> Every blob write ships to every replica over the replication stream, which is exactly the traffic you least want in a channel whose lag governs your read consistency.</li>
  <li><b>You cannot put a CDN in front of a SQL query.</b> Every byte comes out through your connection pool, competing with real queries for connections.</li>
  <li><b>Cost.</b> Database storage is priced like block storage, roughly 3-10× object storage, and you are paying it for bytes you never query on.</li>
</ul>
<p>
  The correct pattern: blob in object storage, <b>row in the database holding
  the key, size, content type, checksum and status</b>. You lose atomicity
  across the two — which is why the pending-then-confirmed state machine in
  the upload diagram exists, and why an orphan-sweeping job (objects with no
  row, rows with no object) belongs in the design.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Blobs go to object storage,
  metadata goes to Postgres. Uploads go direct from the client via a
  presigned PUT with a short expiry, a size cap and a server-generated key,
  so no file byte ever touches an app server. The row starts as pending and
  is flipped to ready by a worker consuming the bucket's object-created
  event, after scanning and thumbnailing. Reads are served from the CDN with
  signed URLs."
</div>

<h3>Hot, warm, cold: tiering and what it actually saves</h3>
<p>
  Access to stored data is extraordinarily skewed. A photo is viewed heavily
  in its first week and then approximately never — but must still be there in
  ten years. Tiering prices that reality.
</p>
<table>
  <tr><th>Tier</th><th>$/GB-month</th><th>Retrieval</th><th>First-byte latency</th><th>Right for</th></tr>
  <tr><td>Standard (hot)</td><td>~$0.023</td><td>free</td><td>~100-200 ms</td><td>Anything read this month</td></tr>
  <tr><td>Infrequent access (warm)</td><td>~$0.0125</td><td>~$0.01/GB</td><td>like Standard</td><td>Read a few times a year; 30-day minimum charge</td></tr>
  <tr><td>Archive instant</td><td>~$0.004</td><td>~$0.03/GB</td><td>like Standard</td><td>Compliance copies you must be able to produce immediately</td></tr>
  <tr><td>Archive flexible</td><td>~$0.0036</td><td>~$0.01/GB</td><td>minutes to hours</td><td>Backups, old media</td></tr>
  <tr><td>Deep archive (cold)</td><td>~$0.00099</td><td>~$0.02/GB</td><td>up to 12 hours</td><td>Legal retention you hope never to read</td></tr>
</table>
<p class="sub">
  Prices are approximate US East list prices at the time of checking; they
  vary by region and change, so confirm on the provider's pricing page.
</p>
<p>
  Make the saving concrete. Take 5 PB of user media where 5% is read in any
  given month. All-hot costs about 5,000,000 GB × $0.023 = <b>$115,000 a
  month</b>. Move the 95% cold portion to deep archive and it becomes
  250,000 × $0.023 + 4,750,000 × $0.00099 ≈ 5,750 + 4,700 = <b>about $10,500
  a month</b> — a 90% cut, with the tradeoff that a rare access takes hours
  and costs a retrieval fee. That is the steady-state number; getting there
  has a bill of its own. Lifecycle transitions are charged per object (about
  $0.05 per 1,000 objects into Deep Archive), and Glacier-class storage adds
  roughly 40 KB of metadata overhead per object (8 KB billed at Standard
  rates, 32 KB at archive rates). If the 4.75 PB being archived is 500 KB
  photos, that is about 9.5 billion objects and a one-time transition charge
  near $475,000, against savings of roughly $104,000 a month: about four and a
  half months to pay back, plus the 180-day minimum storage charge if you
  delete early. With 100 MB videos the same transition is a rounding error,
  so object size decides whether tiering is worth it.
</p>
<div class="warn">
  <span class="ttl">⚠ Aggressive tiering can cost more than it saves</span>
  Every colder tier adds a minimum storage duration (30, 90 or 180 days) and
  a per-GB retrieval charge. Push objects to infrequent access after 7 days
  and then read 20% of them again, and you pay the retrieval fee plus the
  early-deletion penalty — often more than staying hot. Tier on the access
  distribution you measured, not on age alone; intelligent-tiering that
  observes access patterns and moves objects automatically is the safe answer
  when you do not know the distribution yet.
</div>
<p class="sub">
  One more line item people forget entirely: <b>egress</b>. Pulling data out
  of a cloud region to the internet lists at up to about $0.09 per GB for the
  first tier (the first 100 GB a month is free, and the rate falls with volume),
  which is on the order of four times the monthly price of storing the same
  gigabyte. For a media-heavy product, bandwidth
  out of the CDN is usually a larger bill than the storage itself, which is
  the real financial argument for high cache-hit ratios.
</p>

<h3>Operational details worth one sentence each</h3>
<ul>
  <li><b>Request rates.</b> S3 scales per prefix: at least 3,500 write and 5,500 read requests per second per prefix, with no limit on the number of prefixes. Spreading keys across prefixes parallelises hot workloads, and a 503 "Slow Down" means you are scaling faster than the prefix has partitioned.</li>
  <li><b>Small files.</b> Billions of tiny objects make per-request cost and per-object overhead dominate. Systems built for photos (Facebook's Haystack and f4) pack many small blobs into large files with an in-memory index to avoid a metadata lookup per read; the lesson for a design is to batch small items into larger objects when you control the write path.</li>
  <li><b>Recovery targets.</b> Say the recovery point objective (how much data you can lose) and recovery time objective (how long you can be down) for the blob store, and back them with a 3-2-1 plan (three copies, two media, one off-site or cross-account) and versioning plus object lock against deletion.</li>
  <li><b>Origin protection.</b> Put the CDN in front and restrict the bucket to the CDN's identity, so a cache miss storm or a scraper cannot hit the bucket at full price.</li>
</ul>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt mentions photos, video, documents, avatars, attachments, backups or "user uploads" — object storage is the answer, and presigned direct upload is the detail that earns the point.</li>
  <li>A naive design POSTs the file to the API and stores it in the database, then wonders why the app tier autoscales on upload traffic and backups take six hours.</li>
  <li>Distinguish it from a <b>caching</b> question: caching is about latency for data you already have; storage tiering is about cost for data you rarely touch. They use the same vocabulary (hot/cold) and mean different things.</li>
  <li>Distinguish durability from availability the moment anyone says "we can't lose the data" — and add that neither one protects against a bad deploy, which is what versioning and object lock are for.</li>
  <li>Files over ~100 MB, or mobile clients, means multipart and resumable uploads; anything with video means an async transcoding pipeline with idempotent, segment-level jobs.</li>
  <li>Pitfall: designing the write path beautifully and forgetting the read path. Say how the bytes get back out — signed CDN URLs, cache TTLs, and who pays the egress.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain why the app server should never see upload bytes, and name the few small JSON calls it handles instead, whatever the file size.</li>
    <li>Given a file size and a part size, compute how many parts a multipart upload needs, and state the limits (5 MiB to 5 GiB per part, 10,000 parts) that bound the choice.</li>
    <li>Explain the difference between durability and availability using S3's own numbers, and say what neither one protects against.</li>
    <li>Name at least two of the five reasons storing blobs in a relational database breaks down at scale.</li>
    <li>Given an access-frequency split, compute the monthly cost difference between all-hot storage and a hot/cold tiering split, and say what you trade away for the savings.</li>
    <li>Explain why a lifecycle transition of billions of small objects can take months to pay back, and what you would measure first.</li>
  </ul>
</div>

<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html" rel="noopener noreferrer">What is Amazon S3?</a> — the consistency model (strong for PUT, DELETE and LIST; bucket configuration eventual) and S3 Express One Zone</li>
    <li><a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html" rel="noopener noreferrer">S3 multipart upload limits</a> — 48.8 TiB objects, 10,000 parts, 5 MiB to 5 GiB parts</li>
    <li><a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/DataDurability.html" rel="noopener noreferrer">S3 data protection and durability</a> — three Availability Zones, checksums, repair, and the 11 nines design target</li>
    <li><a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html" rel="noopener noreferrer">Optimizing S3 performance</a> — 3,500 and 5,500 requests per second per prefix and the 100-200 ms first-byte guidance</li>
    <li><a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html" rel="noopener noreferrer">S3 conditional writes</a> — If-None-Match and If-Match for create-if-absent and compare-and-set</li>
    <li><a href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html" rel="noopener noreferrer">Uploading with presigned URLs</a> — what a presigned PUT does and signs, and the 7-day SDK maximum</li>
    <li><a href="https://aws.amazon.com/s3/pricing/" rel="noopener noreferrer">S3 pricing</a> — minimum storage durations, per-object overhead, and the free egress allowance</li>
    <li><a href="https://alestic.com/2012/12/s3-glacier-costs/" rel="noopener noreferrer">Cost of transitioning S3 objects to Glacier</a> — why per-object transition fees dominate for small objects</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. Figures marked "planning figure" are rules of thumb, not guarantees. Prices are approximate US East list prices and change.</p>
</div>`,
};
