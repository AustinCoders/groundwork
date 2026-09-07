import type { Chapter } from "../types";

export const sysdesDatabasesInDesign: Chapter = {
  id: "sysdes-databases-in-design",
  num: "B4",
  title: "Databases in system design",
  short: "Databases in design",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle:
    'The choice is decided by access pattern and consistency need — "SQL doesn\'t scale" is a claim that will cost you the interview.',
  body: `<h3>The axis is access pattern, not scale</h3>
<p>
  Candidates are taught a false dichotomy: relational databases are for small
  consistent things, NoSQL is for big fast things, so pick NoSQL when the
  prompt says "millions of users." Interviewers at senior level are
  specifically listening for this and will push back, because it is wrong on
  the facts. Relational systems run at enormous scale (a large fraction of the
  world's payment and social infrastructure is sharded MySQL or Postgres), and
  plenty of NoSQL deployments are small.
</p>
<p>
  The honest framing is that these systems made different bargains. Relational
  databases keep joins, ad-hoc queries, and multi-row transactions — features
  that are hard to distribute — so distributing them is work you do yourself.
  Most NoSQL systems removed those features up front, which is exactly what
  lets them partition automatically. So the question is never "how much data?"
  It is: <b>do I know my access patterns in advance, and what do I need to be
  true across rows at once?</b>
</p>
<table>
  <tr><th>Question to ask</th><th>Pushes you relational</th><th>Pushes you non-relational</th></tr>
  <tr><td>Do I know every query up front?</td><td>No — the product will invent new ones monthly</td><td>Yes — two or three fixed lookups, forever</td></tr>
  <tr><td>Do I need to combine entities at read time?</td><td>Yes — joins across users, orders, items</td><td>No — one key returns everything needed</td></tr>
  <tr><td>Do I need multi-row atomicity?</td><td>Yes — transfers, inventory, bookings</td><td>Single-key atomicity is enough</td></tr>
  <tr><td>What is the write rate to one logical key?</td><td>Anything a single primary can absorb</td><td>Beyond one node's write capacity, and the keyspace splits cleanly</td></tr>
  <tr><td>Does the shape of the data vary per record?</td><td>No — a stable schema is an asset</td><td>Yes — heterogeneous, sparse, evolving documents</td></tr>
  <tr><td>How bad is stale or lost data?</td><td>Unacceptable — money, medical, legal</td><td>Tolerable — likes, views, telemetry, feeds</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd start relational. The
  access patterns here involve joining users to orders to line items, we need
  a transaction across two of those tables, and the product is going to keep
  inventing queries. If the event-log table becomes the write bottleneck I'd
  move that one table to a wide-column store, rather than moving the whole
  system."
</div>

<h3>The families, and what each is genuinely good at</h3>
<table>
  <tr><th>Family</th><th>Data model</th><th>Genuine strength</th><th>Reach for this when…</th></tr>
  <tr>
    <td>Relational (Postgres, MySQL)</td>
    <td>Tables, rows, foreign keys, a declarative query planner</td>
    <td>Ad-hoc queries, joins, ACID transactions, constraints that make invalid states unrepresentable</td>
    <td>The default. Anything with entities and relationships, and any time you can't yet enumerate the queries</td>
  </tr>
  <tr>
    <td>Key-value (Redis, Memcached, DynamoDB in its simplest use)</td>
    <td>Opaque value behind a single key</td>
    <td>Sub-millisecond point lookups, trivially partitionable, very high throughput</td>
    <td>Caching, sessions, rate limit counters, leaderboards, feature flags — anything you always fetch by exactly one key</td>
  </tr>
  <tr>
    <td>Document (MongoDB, DynamoDB, Couchbase)</td>
    <td>Nested JSON-ish documents, keyed, secondary indexes available</td>
    <td>Fetching one self-contained aggregate in a single read; per-record schema flexibility</td>
    <td>The read unit and the write unit are the same object — a product listing, a user profile, a CMS page</td>
  </tr>
  <tr>
    <td>Wide-column (Cassandra, ScyllaDB, HBase, Bigtable)</td>
    <td>Partition key plus sorted clustering keys; rows can be sparse and wide</td>
    <td>Enormous write throughput on an LSM engine, linear scale-out, efficient range scans within a partition, multi-datacenter replication</td>
    <td>Time series, event logs, messages/feeds per user — huge writes, queries always scoped to one partition key</td>
  </tr>
  <tr>
    <td>Graph (Neo4j, and graph layers on top of relational)</td>
    <td>Nodes and edges as first-class, traversal-oriented query language</td>
    <td>Variable-depth traversal — "friends of friends who like X", shortest path, fraud rings</td>
    <td>The relationships <em>are</em> the query and depth is unbounded; a 2-hop join in SQL is fine, a 6-hop one is not</td>
  </tr>
  <tr>
    <td>Search (Elasticsearch, OpenSearch)</td>
    <td>Inverted index over analysed text plus filters and facets</td>
    <td>Relevance-ranked full-text search, faceting, fuzzy matching</td>
    <td>Users type free text into a box; treat it as a derived index fed from your source of truth, never as the source of truth</td>
  </tr>
  <tr>
    <td>Columnar / OLAP (ClickHouse, BigQuery, Snowflake, Redshift)</td>
    <td>Column-oriented storage, heavy compression, vectorised scans</td>
    <td>Aggregating billions of rows over a few columns in seconds</td>
    <td>Analytics and reporting. Also the correct answer to "how do we stop the analytics team from taking production down"</td>
  </tr>
  <tr>
    <td>Object storage (S3 and equivalents)</td>
    <td>Immutable blobs behind a key, HTTP access</td>
    <td>Effectively unlimited capacity at very low cost per GB, extreme durability</td>
    <td>Images, video, backups, data lake files. Store the bytes here and the metadata in your database — never the bytes in the database</td>
  </tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Naming a database is not a design decision</span>
  "I'll use Cassandra" earns nothing. "I'll use a wide-column store keyed by
  (user_id, bucket) with messages clustered by timestamp descending, because
  every read is the last fifty messages for one user and the write rate is
  100k/sec" earns the whole section. The store follows from the key design;
  present them together or the interviewer cannot tell whether you understand
  the choice or memorised it.
</div>

<h3>The same data, modelled two ways</h3>
<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="The same blog post data modelled as three normalized relational tables joined at read time, versus a single denormalized document that embeds the author and comments and must be updated in many places when the author changes their name">
    <g class="rough">
      <path class="ln" d="M105,92 L105,124" />
      <path class="ln" d="M105,168 L105,200" />
      <path class="ln dash" d="M300,24 L300,250" />
    </g>
    <g class="rough">
      <rect class="box"  x="30"  y="50"  width="150" height="42" rx="6" />
      <rect class="box"  x="30"  y="126" width="150" height="42" rx="6" />
      <rect class="box"  x="30"  y="202" width="150" height="42" rx="6" />
      <rect class="boxy" x="352" y="48"  width="270" height="196" rx="8" />
      <rect class="box"  x="366" y="64"  width="242" height="38" rx="5" />
      <rect class="box"  x="366" y="112" width="242" height="38" rx="5" />
      <rect class="box"  x="366" y="176" width="242" height="52" rx="5" />
    </g>
    <text class="sm" x="105" y="34"  text-anchor="middle">normalized: one fact, one place</text>
    <text class="sm" x="105" y="76"  text-anchor="middle">users (id, name, avatar)</text>
    <text class="sm" x="105" y="152" text-anchor="middle">posts (id, author_id, body)</text>
    <text class="sm" x="105" y="228" text-anchor="middle">comments (id, post_id, ...)</text>
    <text class="sm" x="487" y="34"  text-anchor="middle">denormalized: one document</text>
    <text class="sm" x="487" y="88"  text-anchor="middle">post: id, body, created_at</text>
    <text class="sm" x="487" y="136" text-anchor="middle">author: name, avatar (copied)</text>
    <text class="sm" x="487" y="196" text-anchor="middle">comments: [ text, author_name,</text>
    <text class="sm" x="487" y="214" text-anchor="middle">... 50 more embedded ]</text>
    <text class="sm rd" x="105" y="268" text-anchor="middle">read = 2 joins</text>
    <text class="sm gr" x="105" y="288" text-anchor="middle">rename author = 1 row updated</text>
    <text class="sm gr" x="487" y="268" text-anchor="middle">read = 1 lookup, no joins</text>
    <text class="sm rd" x="487" y="288" text-anchor="middle">rename author = N documents rewritten</text>
  </svg>
  <figcaption>Denormalization does not remove work, it moves it from read time to write time — and buys that with the risk that two copies of a fact disagree.</figcaption>
</figure>
<p>
  Normalize by default: one fact in one place means an update is one write and
  contradictions are impossible. Denormalize deliberately, when a measured read
  path is too expensive and the data is read far more often than it changes.
  The three costs you must name when you propose it are <b>write
  amplification</b> (one logical change touches many records), <b>update
  anomalies</b> (copies drift, and you now need a repair job), and <b>growth</b>
  (an embedded array of comments is unbounded, and most document stores have a
  hard per-document size limit).
</p>
<table>
  <tr><th></th><th>Normalized</th><th>Denormalized</th></tr>
  <tr><td>Read cost</td><td>Joins at query time, planner-dependent</td><td>One lookup by key</td></tr>
  <tr><td>Write cost</td><td>One row</td><td>Fan-out to every copy, often asynchronously</td></tr>
  <tr><td>Consistency</td><td>Enforced by the database</td><td>Your responsibility, and eventual at best</td></tr>
  <tr><td>Schema change</td><td>One migration</td><td>Backfill every copy</td></tr>
  <tr><td>Reach for this when…</td><td>Default — until profiling says otherwise</td><td>Read/write ratio is extreme, the shape is stable, and staleness between copies is acceptable</td></tr>
</table>
<p class="sub">
  Notice the symmetry with feed design: a normalized model is fan-out-on-read,
  a denormalized one is fan-out-on-write. It is the same tradeoff at a
  different altitude, which is worth saying out loud — interviewers reward
  candidates who recognise a pattern they have already discussed.
</p>

<h3>Indexes: what they buy and what they cost</h3>
<p>
  An index is a second data structure — usually a B-tree — that maps column
  values to row locations in sorted order, turning a full table scan into a
  logarithmic descent. That is the benefit, and it is enormous: on a
  ten-million-row table it is the difference between seconds and microseconds.
  The cost is paid on every write, and candidates almost never mention it
  unprompted.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="A single row insert expanding into four physical writes: the table heap page, the write ahead log, and one update for each of two secondary indexes">
    <g class="rough">
      <path class="ln" d="M148,114 L278,39" />
      <path class="ln" d="M148,114 L278,85" />
      <path class="lnr" d="M148,114 L278,131" />
      <path class="lnr" d="M148,114 L278,177" />
    </g>
    <g class="rough">
      <rect class="boxy" x="16"  y="90"  width="132" height="48" rx="6" />
      <rect class="box"  x="278" y="20"  width="172" height="38" rx="5" />
      <rect class="box"  x="278" y="66"  width="172" height="38" rx="5" />
      <rect class="boxr" x="278" y="112" width="172" height="38" rx="5" />
      <rect class="boxr" x="278" y="158" width="172" height="38" rx="5" />
    </g>
    <text class="sm" x="82"  y="112" text-anchor="middle">INSERT</text>
    <text class="sm" x="82"  y="130" text-anchor="middle">one row</text>
    <text class="sm" x="364" y="44"  text-anchor="middle">table heap page</text>
    <text class="sm" x="364" y="90"  text-anchor="middle">write-ahead log (fsync)</text>
    <text class="sm rd" x="364" y="136" text-anchor="middle">index on (user_id)</text>
    <text class="sm rd" x="364" y="182" text-anchor="middle">index on (created_at)</text>
    <text class="sm rd" x="466" y="106">one logical write</text>
    <text class="sm rd" x="466" y="126">= four physical writes</text>
    <text class="lbl" x="20" y="220" style="font-size:15px">Each extra index is a permanent tax on every insert, update and delete of that table.</text>
  </svg>
  <figcaption>Indexes are not free storage tricks; they are a read/write tradeoff you are making on behalf of every future write.</figcaption>
</figure>
<ul>
  <li><b>Write amplification.</b> Each secondary index adds a structural update per write, often at a random location in the tree. Five indexes on a hot table can cut write throughput by half or more, and index maintenance also inflates the WAL.</li>
  <li><b>Selectivity decides everything.</b> An index only helps when it eliminates most rows. An index on a boolean column with a 50/50 split is worse than useless — the planner will correctly ignore it, because random-access lookups for half the table cost more than a sequential scan.</li>
  <li><b>Composite indexes are left-prefix.</b> An index on (a, b, c) serves queries filtering on a, on a and b, or on all three; it does not serve a query filtering only on b. Order the columns by equality-filters first, then the range or sort column.</li>
  <li><b>Covering indexes.</b> If the index contains every column the query needs, the database never touches the table — an index-only scan, often several times faster.</li>
  <li><b>The planner can be wrong.</b> It chooses from cost estimates based on statistics, and stale statistics or a skewed distribution produce catastrophically bad plans, which is why "read the query plan" is a real skill.</li>
</ul>
<pre><code><span class="c">-- The query the product actually runs</span>
SELECT id, body FROM posts
WHERE author_id = 42 AND created_at &gt; now() - interval '7 days'
ORDER BY created_at DESC LIMIT 20;

<span class="c">-- Wrong order: created_at first means every recent post by anyone is scanned</span>
CREATE INDEX ON posts (created_at, author_id);

<span class="c">-- Right: equality column first, then the range/sort column</span>
CREATE INDEX ON posts (author_id, created_at DESC);
<span class="c">-- Now the rows are already sorted within author_id -- the LIMIT stops early,</span>
<span class="c">-- and EXPLAIN ANALYZE shows an index scan with no sort node at all.</span></code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "This table is write-heavy, so
  I want the smallest number of indexes that serve the query patterns — one
  composite on (author_id, created_at DESC) covers both the filter and the
  ordering. I'd check EXPLAIN ANALYZE for a sort node; if one appears, the
  index isn't doing its job."
</div>

<h3>Read-heavy and write-heavy are different problems</h3>
<table>
  <tr><th></th><th>Read-heavy (feeds, catalogs, profiles)</th><th>Write-heavy (events, telemetry, messages, ledgers)</th></tr>
  <tr><td>First move</td><td>Cache the hot set; reads follow a power law</td><td>Batch and buffer writes; append rather than update in place</td></tr>
  <tr><td>Second move</td><td>Read replicas, with an explicit staleness policy per endpoint</td><td>Partition by key so writes spread across nodes</td></tr>
  <tr><td>Indexing posture</td><td>Index generously — reads dominate</td><td>Index sparingly — every index taxes the hot path</td></tr>
  <tr><td>Data modelling</td><td>Denormalize toward the read shape</td><td>Keep writes narrow; derive read models asynchronously</td></tr>
  <tr><td>Storage engine that fits</td><td>B-tree — reads land in one place, in-place updates</td><td>LSM tree — writes go to an in-memory table then flush sequentially; costs read amplification and background compaction I/O</td></tr>
  <tr><td>Typical stores</td><td>Postgres/MySQL plus Redis plus a CDN</td><td>Cassandra, ScyllaDB, RocksDB-backed systems, Kafka as a write buffer</td></tr>
</table>
<p class="sub">
  Being able to say "B-tree for read-optimised in-place updates, LSM for
  write-optimised sequential flushes, and the LSM's price is read amplification
  plus compaction" is one of the highest-value-per-word things you can put on
  the whiteboard. It explains a whole category of database choices in one
  sentence.
</p>

<h3>Connection pooling, the bottleneck nobody draws</h3>
<p>
  Databases do not accept unlimited connections, and the limit is far lower
  than people expect. Postgres forks a process per connection at roughly 5-10
  MB of overhead each, and typical configurations cap out between 100 and 500.
  MySQL uses threads and is cheaper, but the shape is identical. Meanwhile a
  fleet of 50 app servers each holding a 20-connection pool wants 1,000
  connections, and the database falls over — not from query load, but from
  connection count.
</p>
<table>
  <tr><th>Concept</th><th>Number to quote</th><th>Consequence</th></tr>
  <tr><td>Useful pool size</td><td>Roughly 2-4x the database's CPU core count, in total across all clients</td><td>Beyond that, throughput <em>drops</em> — you have added queueing and context switching, not capacity</td></tr>
  <tr><td>Per-connection overhead</td><td>~5-10 MB in Postgres</td><td>Idle connections consume real memory that the page cache wanted</td></tr>
  <tr><td>External pooler (PgBouncer and friends)</td><td>Multiplexes thousands of client connections onto tens of server connections</td><td>Transaction-level pooling breaks session state: prepared statements, session variables, advisory locks, and long transactions</td></tr>
  <tr><td>Serverless and autoscaled functions</td><td>Each instance opens its own connections; scale-out multiplies them</td><td>A pooler or a data proxy is mandatory, not optional</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ "Just raise max_connections" is the wrong instinct</span>
  It converts a fast failure into a slow one. The database now accepts every
  connection and services all of them badly, so latency climbs across the
  board instead of a few clients being rejected. The right answer is a
  bounded pool plus a pooler in front, and rejecting or queueing excess work
  at the application edge where you can shed it cheaply.
</div>

<h3>Where "just use Postgres" is the right senior answer</h3>
<p>
  A candidate who reaches for six specialised stores in a 45-minute design is
  describing an operational burden, not an architecture. Every additional
  datastore is another failure mode, another backup and restore story, another
  consistency boundary, and another thing your on-call has to understand at 3
  a.m. One mature relational database covers a startling amount of ground:
</p>
<ul>
  <li><b>Document store</b> — JSONB columns with GIN indexes handle schemaless data honestly well</li>
  <li><b>Key-value</b> — a two-column table with a primary key is a fine key-value store at any scale a single node handles</li>
  <li><b>Search</b> — built-in full-text is genuinely good up to millions of documents before Elasticsearch earns its keep</li>
  <li><b>Queue</b> — SELECT ... FOR UPDATE SKIP LOCKED gives you a correct work queue, comfortably into the thousands of jobs per second</li>
  <li><b>Geospatial, time-series, vectors</b> — PostGIS, partitioned time ranges, and pgvector all exist and are used in production</li>
  <li><b>Analytics</b> — a read replica keeps reporting queries off the primary until data volumes genuinely demand a columnar engine</li>
</ul>
<p>
  The point is not that Postgres is always right. The point is that
  consolidating on one store buys operational simplicity, and simplicity is a
  legitimate design goal you are allowed to argue for. State the exit
  conditions and you get the credit without sounding dogmatic.
</p>
<table>
  <tr><th>Reach past Postgres when…</th><th>Because</th></tr>
  <tr><td>Sustained writes exceed what one primary can absorb (roughly tens of thousands per second, workload dependent)</td><td>A partitioned wide-column store scales writes horizontally by design</td></tr>
  <tr><td>You need active-active writes in multiple regions</td><td>Single-leader replication cannot do it; you need multi-leader, a leaderless store, or distributed SQL like Spanner or CockroachDB</td></tr>
  <tr><td>Queries are relevance-ranked free text</td><td>An inverted index with proper analysers and scoring is a different data structure</td></tr>
  <tr><td>Analytics scan billions of rows over a few columns</td><td>Row storage reads columns you don't need; columnar engines are 10-100x faster here</td></tr>
  <tr><td>Access is a single key at sub-millisecond latency, at very high rates</td><td>An in-memory key-value store avoids disk, planner, and MVCC overhead entirely</td></tr>
  <tr><td>The workload is deep, variable-length graph traversal</td><td>Recursive joins degrade badly past a few hops</td></tr>
</table>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Before choosing a store, write the two or three highest-volume queries as literal key lookups — the key you need is usually the partition key, and it decides the store more than the store decides the key</li>
  <li>"Transaction", "balance", "inventory", "booking", "must not double-charge" → relational with real ACID, or an explicit idempotency and reconciliation design; do not hand-wave this one</li>
  <li>"Timeline", "feed", "events", "telemetry", "messages" with huge write volume and partition-scoped reads → wide-column on an LSM engine; expect the follow-up about hot partitions</li>
  <li>If the prompt implies free-text search or analytics, propose a derived index fed from the source of truth, and be ready to explain how it stays in sync (change data capture, dual writes plus reconciliation, or a periodic rebuild)</li>
  <li>Any time you propose denormalization, name the write amplification and the repair path in the same breath — proposing it without them is the most common way to lose the data-modelling signal</li>
  <li>Distinguish "this table is a bottleneck" from "this database is a bottleneck": the first is solved with an index, a cache, or moving one table, and the first is far more often the truth</li>
</ul>`,
};
