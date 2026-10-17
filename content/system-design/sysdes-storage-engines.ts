import type { Chapter } from "../types";

export const sysdesStorageEngines: Chapter = {
  id: "sysdes-storage-engines",
  num: "A3",
  title: "Storage engines",
  short: "Storage engines",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "Every database is a bet about how data should sit on disk, and most of what surprises you in production (slow writes, slow deletes, bloat, compaction storms) follows from that bet.",
  body: `<h3>The question underneath every database</h3>
<p>
  A storage engine answers two questions. Where do the bytes go on disk when
  a write arrives? And how does a key find its bytes again? Two families
  dominate. <b>B-trees</b> keep data in fixed-size pages that are updated in
  place: PostgreSQL's pages are usually 8 kB, and its documentation describes
  every table and index as an array of such pages. <b>Log-structured merge-trees</b>
  (LSM-trees) never modify data in place: they append, keep recent writes in
  memory and sorted files on disk, and merge those files in the background.
  A third family, <b>column stores</b>, changes the layout again for analytics.
  The databases from earlier chapters pick sides: PostgreSQL and InnoDB are
  B-tree engines; Cassandra and RocksDB are LSM engines; ClickHouse is a
  column store with an LSM-like merge.
</p>
<p>
  To compare them you need a vocabulary of costs, the three <b>amplifications</b>:
</p>
<ul>
  <li><b>Write amplification:</b> bytes the engine writes to storage for each byte the application wrote. It determines SSD wear and the write throughput a disk can sustain.</li>
  <li><b>Read amplification:</b> how many disk reads or files a lookup touches.</li>
  <li><b>Space amplification:</b> bytes on disk divided by bytes of live data.</li>
</ul>
<p>
  The honest summary of the field, as the paper on RocksDB space amplification puts it, is that it is not possible to reduce space, read and write amplification all at once, so every tuning knob moves something else. This chapter gives each engine's position on that triangle
  and the arithmetic behind it. How a database exposes its choices to the
  application is covered in the earlier databases and storage chapters; the
  isolation rules that MVCC enforces are in the transactions chapter.
</p>

<h3>The write-ahead log: why both families have one</h3>
<p>
  Memory is fast and volatile; disk is durable and slow to update randomly.
  Both families solve this the same way: before changing the structure, append
  a description of the change to a sequential log and force the log to disk.
  PostgreSQL's manual states the rule directly: changes to data files must be
  written only after the WAL records describing them have been flushed to
  permanent storage. Three consequences follow, and the manual lists them:
  data pages need not be flushed on every commit, because a crash can be
  repaired by replaying the log (roll-forward, or REDO); only the log needs to
  reach disk to make a commit durable, and since it is written sequentially,
  syncing it is much cheaper than flushing many scattered data pages; and one
  <code>fsync</code> of the log can commit many concurrent transactions at once.
</p>
<p>
  LSM engines use the log for the memtable, which would otherwise vanish in a
  crash. RocksDB writes each update to the memtable and optionally to a
  write-ahead log, and when the memtable is flushed to a file, the matching
  log can be deleted. Durability then depends on a setting: RocksDB's
  <code>WriteOptions</code> choose whether a write is logged and whether the
  log is <code>fsync</code>ed before the write is acknowledged. Cassandra's
  commit log defaults to <code>periodic</code> sync every 10 seconds, so a
  single machine that crashes can lose up to that window or more of acknowledged writes, and the replicas, not the disk, are what save the data; in
  <code>batch</code> mode a write is not acknowledged until the log is
  fsynced. This is the single-node view of the durability trade-off discussed
  across machines in the replication chapter.
</p>
<p>
  B-trees have a second hazard: a page write is bigger than what a disk can
  write atomically, so a crash can leave half of a page written. InnoDB handles
  it with a doublewrite buffer: pages flushed from the buffer pool are written
  first to a separate area, and if a crash interrupts a write to the data file,
  recovery finds a good copy there. MySQL's documentation notes that although data is written twice, it does not cost twice the I/O, because the first write is one large sequential chunk with a single <code>fsync</code>. PostgreSQL guards against the same hazard differently, by writing full-page images into the WAL after each checkpoint.
</p>

<h3>B-trees: update in place, read in a few hops</h3>
<p>
  A B-tree is a balanced tree of pages. Interior pages hold keys and pointers
  to children; leaf pages hold the entries. A lookup walks from the root to a
  leaf, one page per level. Because each page holds hundreds of entries, the
  tree is shallow. With an illustrative 400 entries per page, three levels
  address 400<sup>3</sup> = 64,000,000 keys and four levels address
  400<sup>4</sup> = 25,600,000,000. A table of a billion rows needs four levels,
  and since the root and the next level are hot in memory, a point lookup costs
  about one or two disk reads for the index (a heap table such as PostgreSQL's needs one more for the row). PostgreSQL's documentation observes that typically over 99% of a B-tree's pages are leaf pages, which is why the upper levels cache
  so easily.
</p>
<p>
  A write finds the leaf, changes the page in the buffer pool, appends to the
  WAL, and lets the dirty page reach disk later. If the leaf is full it
  <b>splits</b>: a portion of its entries move to a new page, and a new pointer goes into
  the parent, which may split in turn. PostgreSQL's manual says splits cascade
  upwards, and when the root cannot fit another pointer, a root split adds a new
  level. Hence the shape of a B-tree's costs: reads are cheap and predictable;
  writes are random page updates.
</p>

<h4>What it costs in practice</h4>
<ul>
  <li><b>Write amplification from page granularity.</b> Changing a 100-byte row can mean writing an 8,192-byte page: 8,192 &divide; 100 &asymp; 82 times the user's bytes, plus the WAL record. Many updates to one page are absorbed by the buffer pool before a flush, so 82 is an upper bound on the page-flush term for random updates, not an average, and WAL records, full-page images and InnoDB's doublewrite come on top.</li>
  <li><b>MVCC leaves dead versions.</b> PostgreSQL's UPDATE does not overwrite a row; the old version stays visible to older snapshots, so <code>VACUUM</code> must later reclaim the dead versions, and a heavily updated table can bloat to the point that <code>VACUUM FULL</code> becomes necessary. Its documentation also recommends moderately frequent ordinary vacuums over rare heavy ones. A <b>heap-only tuple</b> (HOT) update avoids new index entries when no indexed column changes and the page has room, which is why lowering a table's fillfactor can speed up update-heavy tables.</li>
  <li><b>Clustered or heap.</b> In InnoDB the table <em>is</em> a B-tree keyed by the primary key, and each secondary-index entry stores the primary key columns, so a lookup through a secondary index is two tree walks and a long primary key makes every secondary index bigger. PostgreSQL stores rows in a separate heap and every index points into it.</li>
  <li><b>Insert order matters.</b> InnoDB's documentation says sequential inserts leave pages about 15/16 full, while random inserts leave them anywhere from 1/2 to 15/16 full. A random primary key such as a UUIDv4 turns every insert into a random page write and wastes space; time-ordered identifiers, covered in the time and ordering chapter, avoid it.</li>
</ul>

<h3>LSM-trees: never update, always append, merge later</h3>
<p>
  The LSM-tree was proposed by O'Neil and colleagues for indexing a table with a very high insert rate, as a memory component plus disk components merged by a rolling merge. They argued that a standard disk B-tree effectively
  doubles the I/O cost of a transaction to maintain such an index, and that
  deferring and batching index changes, cascaded from memory through disk
  components in a way "reminiscent of merge sort", greatly reduces disk-arm
  movement. Bigtable (2006) put the idea into widespread production, and LevelDB, RocksDB and Cassandra descend from it. The modern form has four parts.
</p>
<ol>
  <li><b>Memtable.</b> New writes go into a sorted in-memory structure (RocksDB's default is a skiplist), together with a log record for recovery.</li>
  <li><b>Flush.</b> When the memtable fills it becomes immutable, a new one takes over, and the old one is written to disk as a <b>sorted string table</b> (SSTable): a sorted, immutable file. Cassandra's documentation is explicit that SSTables are never written to again.</li>
  <li><b>Read.</b> A lookup checks the memtable, then the SSTables, newest first, and stops at the first hit. A key's versions may be spread over many files.</li>
  <li><b>Compaction.</b> Background jobs merge SSTables into larger ones, discarding overwritten and deleted versions.</li>
</ol>

<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="LSM write path and read path. A write goes to the log and the memtable. A full memtable is flushed as an immutable sorted file at level zero. Background compaction merges files into larger levels. A read checks the memtable, then asks each file's Bloom filter before reading the file.">
    <g class="rough">
      <path class="lng" d="M96,66 L146,66" />
      <path class="lng" d="M96,98 L146,98" />
      <path class="lng" d="M268,82 L318,82" />
      <path class="ln"  d="M440,82 L470,82" />
      <path class="ln dash" d="M390,130 L390,160" />
      <path class="lnr" d="M96,236 L146,236" />
      <path class="lnr dash" d="M268,236 L318,236" />
    </g>
    <g class="rough">
      <rect class="box"  x="12"  y="44" width="84"  height="36" rx="5" />
      <rect class="box"  x="12"  y="80" width="84"  height="36" rx="5" />
      <rect class="boxy" x="146" y="50" width="122" height="64" rx="5" />
      <rect class="boxg" x="318" y="50" width="122" height="64" rx="5" />
      <rect class="boxg" x="470" y="50" width="150" height="64" rx="5" />
      <rect class="boxr" x="318" y="160" width="302" height="40" rx="5" />
      <rect class="box"  x="12"  y="214" width="84"  height="44" rx="5" />
      <rect class="boxy" x="146" y="214" width="122" height="44" rx="5" />
      <rect class="boxg" x="318" y="214" width="302" height="44" rx="5" />
    </g>
    <text class="sm" x="54"  y="66" text-anchor="middle">1 log append</text>
    <text class="sm" x="54"  y="102" text-anchor="middle">write</text>
    <text class="lbl" x="207" y="76" text-anchor="middle">memtable</text>
    <text class="sm"  x="207" y="96" text-anchor="middle">sorted, in memory</text>
    <text class="lbl" x="379" y="76" text-anchor="middle">level 0</text>
    <text class="sm"  x="379" y="96" text-anchor="middle">flushed files</text>
    <text class="lbl" x="545" y="76" text-anchor="middle">levels 1..n</text>
    <text class="sm"  x="545" y="96" text-anchor="middle">each about 10x larger</text>
    <text class="sm" x="198" y="132">flush when full</text>
    <text class="sm rd" x="470" y="182" text-anchor="middle">compaction rewrites data downward: write amplification</text>
    <text class="sm" x="54"  y="240" text-anchor="middle">read key</text>
    <text class="sm" x="207" y="240" text-anchor="middle">memtable first</text>
    <text class="sm gr" x="469" y="240" text-anchor="middle">per file: Bloom filter says "no" (skip) or "maybe" (read)</text>
    <text class="lbl rd" x="12" y="288" style="font-size:14px">Cheap sequential writes bought with background rewriting, and reads that may consult many files.</text>
  </svg>
  <figcaption>Writes touch memory and a sequential log. The cost is deferred to compaction (more bytes written) and to reads (more files to check).</figcaption>
</figure>

<h4>Bloom filters make the many-files read affordable</h4>
<p>
  A Bloom filter is a small bit array that answers "might this file contain
  key K?" with either "definitely not" or "maybe". It never gives a false
  negative, so a "no" lets the engine skip the file. RocksDB builds one per SSTable once a filter policy is configured (it is off by default), and recommends about 10 bits per key, which its documentation
  tabulates as a 1% false-positive rate (9.9 bits per key gives 1%; 4.9 gives
  10%; 15.5 gives 0.1%). Bigtable's authors describe the same trick: a small
  amount of memory for filters drastically reduces disk seeks. Bloom filters
  help <em>point</em> lookups, especially for keys that do not exist. A range
  scan must still merge across every sorted run that overlaps the range.
</p>

<h4>Compaction strategies, and which cost each one buys</h4>
<table>
  <tr><th>Strategy</th><th>How it works</th><th>Favours</th><th>Costs</th></tr>
  <tr><td><b>Leveled</b> (RocksDB's default; Cassandra's LCS)</td><td>Each level beyond L0 is one sorted run, about 10 times larger than the one above; compacting picks a file from level n and merges it with the overlapping files of level n+1</td><td>Reads and space: one candidate file per level; space amplification can stay near 1.11 with dynamic level sizing (see below)</td><td>Write amplification, which RocksDB's documentation says is often larger than 10</td></tr>
  <tr><td><b>Size-tiered</b> (Cassandra's STCS, the default there)</td><td>Merge groups of similarly sized SSTables once enough exist (<code>min_threshold</code> 4 by default)</td><td>Cheap writes</td><td>Many overlapping files, so slower reads, and extra disk while merging</td></tr>
  <tr><td><b>Time-window</b> (Cassandra TWCS)</td><td>Group by write time, never mix windows</td><td>TTL'd, mostly immutable time series: whole windows expire at once</td><td>Poor fit for updates or out-of-order data</td></tr>
  <tr><td><b>Universal / unified</b> (RocksDB universal; Cassandra UCS)</td><td>Adaptive tiered-and-leveled merging. RocksDB's documentation says universal optimises write amplification by merging many files at once; Cassandra recommends UCS for most new workloads</td><td>Tunable trade-off</td><td>More knobs to understand</td></tr>
  <tr><td><b>FIFO</b> (RocksDB)</td><td>Drop the oldest files at a size limit</td><td>Cache-like or log-like data</td><td>Not a store of record</td></tr>
</table>

<figure>
  <svg viewBox="0 0 640 290" class="dg" role="img" aria-label="Leveled compaction as a stack of rectangles, each ten times the size of the one above (drawn not to scale), from a 100 megabyte level 1 to a one terabyte level 5, with the last level holding about 90 percent of all data.">
    <g class="rough">
      <rect class="boxy" x="300" y="30"  width="40"  height="34" rx="4" />
      <rect class="boxy" x="278" y="76"  width="84"  height="34" rx="4" />
      <rect class="boxg" x="236" y="122" width="168" height="34" rx="4" />
      <rect class="boxg" x="170" y="168" width="300" height="34" rx="4" />
      <rect class="box"  x="40"  y="214" width="560" height="34" rx="4" />
    </g>
    <text class="sm" x="30"  y="52"  text-anchor="end">L1</text>
    <text class="sm" x="30"  y="98"  text-anchor="end">L2</text>
    <text class="sm" x="30"  y="144" text-anchor="end">L3</text>
    <text class="sm" x="30"  y="190" text-anchor="end">L4</text>
    <text class="sm" x="30"  y="236" text-anchor="end">L5</text>
    <text class="sm" x="350" y="52">100 MB</text>
    <text class="sm" x="372" y="98">1 GB</text>
    <text class="sm" x="414" y="144">10 GB</text>
    <text class="sm" x="480" y="190">100 GB</text>
    <text class="sm" x="320" y="236" text-anchor="middle">1 TB (about 90% of all data)</text>
    <text class="lbl" x="320" y="272" text-anchor="middle" style="font-size:15px">Everything above the last level adds only about 11% to its size.</text>
  </svg>
  <figcaption>Why leveled compaction has low space amplification: the geometric series is dominated by its last term.</figcaption>
</figure>

<h4>Dry run: a point read and a write through a five-level LSM</h4>
<p>
  Take the level sizes in the figure (L1 100 MB, each level ten times the last,
  a multiplier of 10 that Facebook reports using in most of its production
  RocksDB installations). Assume L0 has 4 overlapping files, and Bloom filters at the
  documented 10 bits per key, a 1% false-positive rate.
</p>
<table>
  <tr><th>Quantity</th><th>Arithmetic</th><th>Result</th></tr>
  <tr><td>Capacity through L5</td><td>100 MB &times; (1 + 10 + 100 + 1,000 + 10,000) = 100 MB &times; 11,111</td><td>1,111,100 MB, about 1.11 TB</td></tr>
  <tr><td>Share of the last level</td><td>10,000 &divide; 11,111</td><td>90.0%</td></tr>
  <tr><td>Worst-case space amplification</td><td>11,111 &divide; 10,000 (everything above the last level is garbage)</td><td>1.111, as the RocksDB space-amplification paper states for a multiplier of 10 with dynamic level sizing (the default since RocksDB 8.4)</td></tr>
  <tr><td>Sorted runs a lookup may have to consult</td><td>1 memtable + 4 L0 files + 5 levels (one file each)</td><td>10</td></tr>
  <tr><td>Wasted file reads for a key that does not exist</td><td>9 files &times; 0.01 false-positive rate (the memtable needs no filter)</td><td>0.09 expected, against 9 with no Bloom filters. Facebook skips the filter at the last level to save memory, which makes it 8 &times; 0.01 + 1 = 1.08</td></tr>
  <tr><td>Wasted reads for a key that lives in L5</td><td>8 earlier files &times; 0.01 + 1 real read</td><td>0.08 wasted + 1 useful</td></tr>
  <tr><td>User writes</td><td>10,000 rows/s &times; 100 bytes</td><td>1,000,000 B/s = 1 MB/s</td></tr>
  <tr><td>B-tree page flushes, random updates, upper bound on that term (excludes WAL, full-page images, doublewrite)</td><td>10,000 &times; 8,192 B</td><td>81,920,000 B/s, about 82 MB/s</td></tr>
  <tr><td>LSM writes at an assumed write amplification of 20</td><td>1 MB/s &times; 20</td><td>20 MB/s, about 4 times less than the B-tree page-flush bound</td></tr>
</table>
<p class="sub">
  The write-amplification figure of 20 is an assumption chosen to be in the
  range RocksDB's documentation describes ("often larger than 10"), and the
  B-tree figure is an upper bound on one term that the buffer pool lowers. Neither is a
  benchmark. A real measurement does point the same way: Facebook's review of
  production MySQL installations found RocksDB used about half the space of
  compressed InnoDB and wrote between 10% and 15% as many bytes, at the price of
  10% to 20% more reads, which it considered well within acceptable limits.
</p>

<h4>What compaction costs you at 3 a.m.</h4>
<ul>
  <li><b>Deletes are writes.</b> An LSM engine cannot erase a key from files it never rewrites; it writes a tombstone, and only compaction discards the data and the marker. Cassandra's default tombstone grace period is ten days, which is why deleted data keeps costing reads and why the repair deadline in the replication chapter exists.</li>
  <li><b>Compaction competes with traffic.</b> It reads and rewrites bytes the application did not ask about. A backlog of unmerged files makes reads slower: RocksDB's documentation notes that too many L0 files hurt read performance in most queries.</li>
  <li><b>Disk headroom.</b> While files are being merged, the inputs and the output coexist, so a disk close to full can leave the engine unable to compact.</li>
</ul>

<h3>Column stores: lay data out for the question, not the row</h3>
<p>
  Transaction processing reads and writes whole rows, which suits row layout
  (and B-trees). Analytics asks different questions: "total revenue by country
  last quarter" touches two or three columns of billions of rows. A column
  store keeps each column's values together. Parquet files, for instance,
  divide the data into row groups, each holding one column chunk per column,
  with columns divided into pages that are the unit of encoding and
  compression. ClickHouse's MergeTree stores each column in its own file in its wide part format (small parts default to a compact format with one file).
</p>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="Row layout stores all columns of a row together, so summing one column reads every byte. Column layout stores each column contiguously, so summing one column reads only that column.">
    <g class="rough">
      <rect class="box"  x="30"  y="44" width="260" height="30" rx="4" />
      <rect class="box"  x="30"  y="82" width="260" height="30" rx="4" />
      <rect class="box"  x="30"  y="120" width="260" height="30" rx="4" />
      <rect class="boxy" x="350" y="44" width="50" height="106" rx="4" />
      <rect class="box"  x="410" y="44" width="50" height="106" rx="4" />
      <rect class="box"  x="470" y="44" width="50" height="106" rx="4" />
      <rect class="box"  x="530" y="44" width="50" height="106" rx="4" />
    </g>
    <text class="lbl" x="160" y="28" text-anchor="middle">row store</text>
    <text class="lbl" x="465" y="28" text-anchor="middle">column store</text>
    <text class="sm" x="160" y="64" text-anchor="middle">id | country | amount | ... 100 columns</text>
    <text class="sm" x="160" y="102" text-anchor="middle">id | country | amount | ...</text>
    <text class="sm" x="160" y="140" text-anchor="middle">id | country | amount | ...</text>
    <text class="sm" x="375" y="170" text-anchor="middle">amount</text>
    <text class="sm" x="435" y="170" text-anchor="middle">country</text>
    <text class="sm" x="495" y="170" text-anchor="middle">id</text>
    <text class="sm" x="555" y="170" text-anchor="middle">...</text>
    <text class="sm rd" x="160" y="176" text-anchor="middle">SUM(amount) reads every row in full</text>
    <text class="sm gr" x="465" y="196" text-anchor="middle">SUM(amount) reads one column only</text>
    <text class="lbl" x="320" y="236" text-anchor="middle" style="font-size:15px">With 100 equal 8-byte columns the scan shrinks 100 times before any compression.</text>
  </svg>
  <figcaption>Layout decides how much of the disk a query must touch. The same bytes, arranged by column, can be read 100 times faster for the right query.</figcaption>
</figure>

<p>
  The arithmetic: a table of 100 columns of 8 bytes is 800 bytes a row, so a
  billion rows is 800 GB. A row store scanning one column still reads about
  800 GB of pages; a column store reads that column's 8 GB, a hundredth of it,
  before compression, which works better still because a column holds values of
  one type that often repeat. The other half of the trade is that a single-row insert in a wide layout touches every column file, and an in-place update is awkward, so column stores take data in batches. ClickHouse's design shows how:
  each insert creates a new <b>part</b>, sorted by the primary key, and
  background merges combine parts, which is the LSM idea applied to columns.
  Its primary index is <em>sparse</em>, holding one mark per granule of up to
  8,192 rows by default, so a billion rows need only about
  10<sup>9</sup> &divide; 8,192 &asymp; 122,000 marks and the index stays in memory.
</p>

<h3>Putting it together: why the four systems behave as they do</h3>
<table>
  <tr><th>You observe…</th><th>Because…</th></tr>
  <tr><td>Cassandra absorbs a heavy write stream cheaply, but a read of a cold key touches several files</td><td>Writes go to the commit log and memtable only; the structure is repaired later by compaction. Reads consult Bloom filters, then SSTables</td></tr>
  <tr><td>Cassandra deletes slow queries until compaction catches up, and a lost repair can resurrect data</td><td>A delete is a tombstone written like any other mutation; it is purged only after the grace period, by a compaction that also covers any older data it shadows</td></tr>
  <tr><td>RocksDB latency spikes when background compaction falls behind</td><td>L0 files accumulate and every read must check more of them; rewriting data downward competes with foreground I/O</td></tr>
  <tr><td>PostgreSQL's update-heavy tables grow even though the row count is flat</td><td>MVCC leaves dead versions until VACUUM; HOT updates and a lower fillfactor reduce the churn</td></tr>
  <tr><td>An InnoDB table with a long or random primary key is large and slow to insert into</td><td>The row lives in the primary key's B-tree, secondary indexes carry the key, and random inserts split pages</td></tr>
  <tr><td>A scan-and-aggregate dashboard query over a billion rows is far cheaper on a column store than on a row store</td><td>Row layout makes it read every column; column layout reads the few it needs</td></tr>
</table>

<h3>Choosing</h3>
<table>
  <tr><th>Workload</th><th>Reach for</th><th>Because</th></tr>
  <tr><td>Transactional, read-heavy, mixed updates, range queries on a key</td><td>B-tree engine (PostgreSQL, InnoDB)</td><td>Predictable reads, mature MVCC and secondary indexes</td></tr>
  <tr><td>Very high write or ingest rate, time series, logs, storage-bound</td><td>LSM engine (Cassandra, RocksDB-based stores)</td><td>Sequential writes, and lower write amplification than a B-tree for small random updates (leveled compaction itself rewrites each byte 10 times or more), at the price of compaction and read cost</td></tr>
  <tr><td>Scans and aggregates over few columns of many rows</td><td>Column store (ClickHouse, Parquet on object storage)</td><td>Reads only the columns asked for, compresses well</td></tr>
  <tr><td>Both transactions and analytics</td><td>A B-tree OLTP database plus an analytical copy fed from its log</td><td>Each layout does the job it is built for; replication delivers the changes</td></tr>
</table>

<div class="say">
  <span class="ttl">Say it like this →</span> "This is a write-heavy ingest path
  with point reads by key, so I'd favour an LSM engine such as Cassandra: a
  write is a log append and a memtable insert, and compaction pays the
  rewriting cost off the hot path. I'd budget for it: leveled compaction
  rewrites each byte maybe ten or twenty times, so I'd size disks for the
  compaction headroom and watch the pending-compaction count. Deletes are
  tombstones, so I'd use TTL with time-window compaction if the data expires
  by time. Reporting goes to a column store fed from the same stream, because
  scanning one of a hundred equal-width columns of a billion rows is up to a hundred times less I/O in that layout."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "millions of writes a second", "time series", "write-heavy", "append-only log", "analytics over billions of rows", "storage cost". Each is a prompt to name an engine and its amplification.</li>
  <li><b>The naive design</b> says "use a database" without noticing that a B-tree write is a random page update and an LSM write is a sequential append. Name which cost your workload is dominated by: random writes, read latency or disk space.</li>
  <li><b>Quantify.</b> Write amplification times user write rate is the real disk load: 1 MB/s of user writes at amplification 20 is 20 MB/s. Space amplification times data size is the disk you buy.</li>
  <li><b>Mention the maintenance debt.</b> LSM means compaction, tombstones and headroom; B-tree means vacuum, page splits and bloat; column stores mean batching. An answer that names the debt sounds like experience.</li>
  <li><b>The pitfall to avoid:</b> saying "LSM is faster". It is faster for writes and slower or more variable for reads, and the numbers depend on the compaction strategy.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Define write, read and space amplification, and say why you cannot minimise all three.</li>
    <li>Explain why a write-ahead log makes commits cheaper, and what Cassandra's periodic commit-log sync means for one machine's crash.</li>
    <li>Trace a write and a point read through an LSM engine, including where Bloom filters help and where they cannot.</li>
    <li>Compute the space amplification of leveled compaction with a multiplier of 10, and the expected wasted file reads for a missing key with 9 files at a 1% false-positive rate.</li>
    <li>Explain why summing one column of 100 is about 100 times less I/O in a column store, and what column stores give up.</li>
  </ul>
</div>

<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://www.cs.umb.edu/~poneil/lsmtree.pdf" rel="noopener noreferrer">O'Neil et al.: The Log-Structured Merge-Tree (LSM-Tree)</a> — the original design, and its argument against B-trees for high insert rates</li>
    <li><a href="https://github.com/facebook/rocksdb/wiki/RocksDB-Overview" rel="noopener noreferrer">RocksDB overview</a> — memtable, write-ahead log, SSTables, flush and compaction styles</li>
    <li><a href="https://github.com/facebook/rocksdb/wiki/Leveled-Compaction" rel="noopener noreferrer">RocksDB: leveled compaction</a> — L0 triggers, merging into the next level, write amplification</li>
    <li><a href="https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter" rel="noopener noreferrer">RocksDB: Bloom filters</a> — bits per key against false-positive rate</li>
    <li><a href="https://www.cidrdb.org/cidr2017/papers/p82-dong-cidr17.pdf" rel="noopener noreferrer">Dong et al.: Optimizing space amplification in RocksDB (CIDR 2017)</a> — the 1.111 bound, the size multiplier, and RocksDB against InnoDB measurements</li>
    <li><a href="https://cassandra.apache.org/doc/latest/cassandra/architecture/storage-engine.html" rel="noopener noreferrer">Cassandra: storage engine</a> — commit log sync defaults, memtables, immutable SSTables, Bloom filters</li>
    <li><a href="https://cassandra.apache.org/doc/latest/cassandra/managing/operating/compaction/overview.html" rel="noopener noreferrer">Cassandra: compaction overview</a> — STCS, LCS, TWCS and UCS, tombstones and the grace period</li>
    <li><a href="https://www.postgresql.org/docs/current/wal-intro.html" rel="noopener noreferrer">PostgreSQL: write-ahead logging</a> — why the log comes first and what it saves</li>
    <li><a href="https://www.postgresql.org/docs/current/btree.html" rel="noopener noreferrer">PostgreSQL: B-tree indexes</a> — page splits that cascade upward, root splits, over 99% of pages being leaves</li>
    <li><a href="https://www.postgresql.org/docs/current/routine-vacuuming.html" rel="noopener noreferrer">PostgreSQL: routine vacuuming</a> — dead row versions, bloat, VACUUM FULL</li>
    <li><a href="https://dev.mysql.com/doc/refman/8.4/en/innodb-physical-structure.html" rel="noopener noreferrer">MySQL 8.4: InnoDB physical structure of an index</a> — 16 KB pages, page fill for sequential and random inserts</li>
    <li><a href="https://clickhouse.com/docs/engines/table-engines/mergetree-family/mergetree" rel="noopener noreferrer">ClickHouse: MergeTree</a> — parts, background merges, sparse primary index, one file per column</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. Figures marked "illustrative" or "assumed" (400 entries per page, a write amplification of 20, 4 L0 files) are worked inputs, not measurements.</p>
</div>`,
};
