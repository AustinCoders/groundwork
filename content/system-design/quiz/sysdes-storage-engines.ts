import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "eng-read-latency-climbs",
      chapter: "sysdes-storage-engines",
      level: "advanced",
      skill: "diagnose",
      section: "lsm-trees-never-update-always-append-merge-later",
      kind: "single",
      prompt:
        "<p>A RocksDB-backed service has a steady write rate. Over several hours, read latency climbs, disk write bandwidth sits at its ceiling, and the number of level 0 files keeps growing. Memory use and the application's read pattern have not changed. What is the most likely cause?</p>",
      choices: [
        {
          id: "a",
          text: "Page splits in the B-tree are cascading to the root, adding levels to every lookup.",
          why: "RocksDB is not a B-tree engine. Page splits and root splits belong to B-tree indexes such as PostgreSQL's or InnoDB's, and an LSM engine has no pages to split.",
        },
        {
          id: "b",
          text: "Compaction is behind, so overlapping files pile up and each read checks more.",
          why: "Level 0 files come straight from memtable flushes and overlap each other, so a lookup has to consult them. Compaction rewrites data downward and competes with foreground I/O, and when it cannot keep up, files accumulate and reads slow down.",
        },
        {
          id: "c",
          text: "Dead row versions are accumulating because VACUUM has not run, bloating the data files.",
          why: "VACUUM is a PostgreSQL mechanism for reclaiming dead MVCC row versions in a B-tree engine's heap. RocksDB reclaims overwritten versions through compaction instead.",
        },
        {
          id: "d",
          text: "The memtable is too large, so flushes now write sorted files that are too big to search.",
          why: "A larger memtable makes flushes less frequent, which would mean fewer level 0 files, not a growing count. Sorted files are searched by key range, so the size of one file is not the cost; the number of overlapping files is.",
        },
      ],
      answer: "b",
    },
    {
      id: "eng-missing-key-wasted-reads",
      chapter: "sysdes-storage-engines",
      level: "advanced",
      skill: "estimate",
      section: "lsm-trees-never-update-always-append-merge-later",
      kind: "single",
      prompt:
        '<p>A lookup for a key that does not exist must check 12 SSTables. Each SSTable has a Bloom filter with a 1% false-positive rate, and the filters are independent. A "maybe" answer costs one wasted file read and a "no" costs none. What is the expected number of wasted file reads for this lookup?</p>',
      choices: [
        {
          id: "a",
          text: "About 12 files, because every file must be read to prove the key is absent.",
          why: 'That is the cost without filters. A Bloom filter never gives a false negative, so a "no" lets the engine skip the file entirely.',
        },
        {
          id: "b",
          text: "About 1.2 files, from applying 10% instead of 1%.",
          why: "That uses a 10% rate, which is what roughly 4.9 bits per key gives. The stem fixes the rate at 1%, so each file contributes 0.01 of a wasted read.",
        },
        {
          id: "c",
          text: "About 0.12 files, which is 12 × 0.01.",
          why: 'Each of the 12 filters wrongly says "maybe" with probability 0.01, and expectations add, so 12 × 0.01 = 0.12. Without filters the same lookup would waste 12 reads.',
        },
        {
          id: "d",
          text: "About 0.012 files, from a 0.1% rate.",
          why: "That would be right for a 0.1% false-positive rate, which takes about 15.5 bits per key. The stem fixes the rate at 1%, so each of the 12 filters contributes 0.01.",
        },
      ],
      answer: "c",
    },
    {
      id: "eng-leveled-space-amplification",
      chapter: "sysdes-storage-engines",
      level: "advanced",
      skill: "estimate",
      section: "lsm-trees-never-update-always-append-merge-later",
      kind: "single",
      prompt:
        "<p>A leveled LSM tree has four levels, L1 to L4. Each level is exactly 5 times the size of the one above it, and L1 is 1 GB. In the worst case the last level holds all the live data and every byte above it is stale. Taking space amplification as bytes on disk divided by bytes of live data, what is it?</p>",
      choices: [
        {
          id: "a",
          text: "About 1.248, from 156 GB on disk for 125 GB of live data.",
          why: "The levels are 1, 5, 25 and 125 GB, which total 156 GB. Only the 125 GB last level is live in the worst case, so 156 ÷ 125 = 1.248.",
        },
        {
          id: "b",
          text: "About 0.80, which is the last level's share of the total.",
          why: "That inverts the ratio. 125 ÷ 156 is the share of the disk that holds live data, but space amplification divides the bytes on disk by the live bytes, which can never be below 1.",
        },
        {
          id: "c",
          text: "Exactly 1.0, because leveled compaction keeps one sorted run per level.",
          why: "One sorted run per level limits how many files a read checks. It does not remove the stale versions that still sit in upper levels, which count towards the bytes on disk.",
        },
        {
          id: "d",
          text: "About 5, which is the level size multiplier.",
          why: "The multiplier says how much bigger each level is, not how much extra space is used. The last level dominates the total, so the overhead is small.",
        },
      ],
      answer: "a",
    },
    {
      id: "eng-deletes-do-not-free-disk",
      chapter: "sysdes-storage-engines",
      level: "advanced",
      skill: "diagnose",
      section: "lsm-trees-never-update-always-append-merge-later",
      kind: "single",
      prompt:
        "<p>On a Cassandra table with default settings, you delete about 90% of the rows by primary key to free disk space. Three days later disk usage has not dropped and some reads have become slower. What is the best explanation?</p>",
      choices: [
        {
          id: "a",
          text: "Cassandra marks the rows deleted inside the SSTables and needs a VACUUM-style pass to reclaim them.",
          why: "SSTables are immutable and never written to again after the flush, so nothing is marked in place. VACUUM belongs to PostgreSQL's MVCC heap, and Cassandra reclaims space by compaction.",
        },
        {
          id: "b",
          text: "The deleted rows sit in the commit log, which holds them until it is replayed on restart.",
          why: "The commit log is for recovering memtables after a crash, and its segments are discarded once the data they cover has been flushed. It is not where deleted data waits for weeks.",
        },
        {
          id: "c",
          text: "The Bloom filters still contain the deleted keys, so the files cannot shrink until they are rebuilt.",
          why: "A Bloom filter is built per SSTable and is small compared with the data. It has no say in when disk space comes back, which is decided by compaction.",
        },
        {
          id: "d",
          text: "Each delete wrote a tombstone, which compaction purges only after the grace period.",
          why: "A delete is a write. The old data stays in its immutable files, and the tombstone is dropped only by a compaction once the grace period, ten days by default, has passed. Meanwhile the table holds more data and reads must skip tombstones.",
        },
      ],
      answer: "d",
    },
    {
      id: "eng-random-uuid-primary-key",
      chapter: "sysdes-storage-engines",
      level: "advanced",
      skill: "diagnose",
      section: "b-trees-update-in-place-read-in-a-few-hops",
      kind: "single",
      prompt:
        "<p>An InnoDB table uses a random UUIDv4 string as its primary key and has three secondary indexes. Compared with a monotonically increasing integer key, inserts are slower and the table and indexes are noticeably larger. Which explanation fits?</p>",
      choices: [
        {
          id: "a",
          text: "Random inserts split pages and leave them part empty, and the long key is copied into each secondary index.",
          why: "InnoDB's table is a B-tree keyed by the primary key, and random inserts leave pages anywhere from half to 15/16 full, where sequential ones leave them about 15/16 full. Each secondary-index entry also stores the primary key columns, so a long key makes every index bigger.",
        },
        {
          id: "b",
          text: "Every insert is appended to a memtable, and a compaction backlog keeps rewriting the table in the background.",
          why: "Memtables and compaction belong to LSM engines such as RocksDB or Cassandra. InnoDB updates its B-tree pages in place and has no compaction stage.",
        },
        {
          id: "c",
          text: "Each secondary index stores only a pointer to a heap row, so the slowdown comes from dead versions awaiting vacuum.",
          why: "Secondary indexes pointing into a separate heap describe PostgreSQL. In InnoDB the row lives in the primary key's tree, and secondary entries carry the primary key columns instead.",
        },
        {
          id: "d",
          text: "UUID strings cannot be compared in a B-tree, so the engine has to rebuild the sort order after each commit.",
          why: "Strings sort perfectly well in a B-tree and nothing is rebuilt per commit. The cost comes from where the entries land and how big they are, not from any inability to order them.",
        },
      ],
      answer: "a",
    },
    {
      id: "eng-dashboard-and-lookups",
      chapter: "sysdes-storage-engines",
      level: "advanced",
      skill: "tradeoff",
      section: "choosing",
      kind: "single",
      prompt:
        "<p>An orders table has 100 columns of 8 bytes each and about a billion rows. A dashboard sums one column across all rows, and the application also fetches single whole orders by id thousands of times a second. You want the dashboard scan to read far fewer bytes without slowing the whole-order fetches. Which design does that?</p>",
      choices: [
        {
          id: "a",
          text: "Move all of it to a column store, since reading fewer bytes is faster in every case.",
          why: "A column layout wins when a query touches few columns. A whole-order fetch needs every column, so in a wide layout it touches every column file, and column stores also prefer batched inserts to single-row writes.",
        },
        {
          id: "b",
          text: "Keep one B-tree database and add a read replica for the dashboard.",
          why: "A replica copies the same row layout, so the scan still reads about 800 GB of pages to use 8 GB of one column. It moves the load but does not shrink the scan.",
        },
        {
          id: "c",
          text: "Keep the B-tree for the fetches and feed a column-store copy from its log.",
          why: "Each layout does the job it is built for: the B-tree serves whole rows, and the column copy reads only the one column the sum needs, about a hundredth of the bytes. Replication delivers the changes.",
        },
        {
          id: "d",
          text: "Move everything to an LSM engine, because its sequential writes make scans cheaper.",
          why: "An LSM engine still stores whole rows together, so summing one column reads every column. Sequential writes lower write cost and do not change how many bytes a scan touches.",
        },
      ],
      answer: "c",
    },
    {
      id: "eng-cassandra-power-loss",
      chapter: "sysdes-storage-engines",
      level: "advanced",
      skill: "concept",
      section: "the-write-ahead-log-why-both-families-have-one",
      kind: "single",
      prompt:
        "<p>A single Cassandra node with replication factor 1 uses its default commit log setting, periodic sync with the default 10 second period. Clients receive acknowledgements for writes, then the machine loses power with no warning. Which statement is correct?</p>",
      choices: [
        {
          id: "a",
          text: "Every acknowledged write survives, because it was appended to the commit log before the acknowledgement.",
          why: "In periodic mode a write is acknowledged immediately and the log is synced on a timer. An append that has not been fsynced can be lost when the power goes, so acknowledgement does not mean durable.",
        },
        {
          id: "b",
          text: "Acknowledged writes from roughly the last sync period, or more if a sync was delayed, can be lost.",
          why: "Periodic mode acknowledges first and syncs later, so the unsynced tail of the log is at risk. Batch mode withholds the acknowledgement until the log is fsynced, which closes this window.",
        },
        {
          id: "c",
          text: "Only writes still in the memtable are lost, since the commit log protects everything else.",
          why: "The memtable is exactly what the commit log is meant to rebuild, but the log only helps for the part that reached disk. Only the memtable data whose log records were not yet synced is lost.",
        },
        {
          id: "d",
          text: "No acknowledged write is lost, because SSTables are immutable and never rewritten.",
          why: "Immutability applies only to SSTables, which exist after a memtable is flushed. Recent writes live in the memtable and the commit log, and those are the ones at risk.",
        },
      ],
      answer: "b",
    },
    {
      id: "eng-lsm-write-lifecycle",
      chapter: "sysdes-storage-engines",
      level: "advanced",
      skill: "sequence",
      section: "lsm-trees-never-update-always-append-merge-later",
      kind: "order",
      prompt:
        "<p>Follow one new key through a modern LSM engine, from the moment it is written to the moment its data first lands in a larger merged file. Put the steps in the order the chapter gives them.</p>",
      items: [
        { id: "write", text: "The write is logged and inserted into the sorted in-memory memtable" },
        { id: "full", text: "The memtable fills, becomes immutable, and a new memtable takes over" },
        { id: "flush", text: "The old memtable is written to disk as a sorted, immutable SSTable" },
        { id: "compact", text: "A background compaction merges the SSTable into a larger one" },
      ],
      why: "A write must reach the log and memtable first, since that is the only place new data can go. The memtable becomes immutable only when it is full, and only then can it be written out as an SSTable. Compaction works on files that already exist on disk, so it comes last.",
    },
  ],
};
