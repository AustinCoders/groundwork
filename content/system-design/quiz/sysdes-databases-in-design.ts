import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "db-wallet-transfer-store",
      chapter: "sysdes-databases-in-design",
      level: "beginner",
      skill: "tradeoff",
      section: "the-axis-is-access-pattern-not-scale",
      kind: "single",
      prompt:
        "<p>A wallet app moves money between two user accounts: one row is debited and another is credited, and both changes must happen or neither. Finance and support keep asking for new reports, so the queries are not known in advance. Peak load is about 800 writes per second. Which kind of store fits best?</p>",
      choices: [
        {
          id: "a",
          text: "A key-value store, because every account is fetched by its id.",
          why: "Point lookups by id are a strength of key-value stores, but they offer no joins for the new reports and only single-key atomicity. A transfer touches two keys that must change together.",
        },
        {
          id: "b",
          text: "A relational database such as Postgres, with the transfer in one transaction.",
          why: "Multi-row atomicity and ad-hoc queries are exactly what relational systems keep. 800 writes per second is far below what a single primary absorbs, so scale gives no reason to leave.",
        },
        {
          id: "c",
          text: "A wide-column store, because writes are the heavy part of this workload.",
          why: "Wide-column stores earn their place at enormous write rates with queries scoped to one partition key. 800 writes per second is modest, and the store would give up joins and the cross-row transaction this design needs.",
        },
        {
          id: "d",
          text: "A document store, because it will scale automatically when the user base grows.",
          why: "This is the false split of relational for small and NoSQL for big. Document stores offer transactions only at a documented performance cost and assume single-key access, which does not suit changing report queries.",
        },
      ],
      answer: "b",
    },
    {
      id: "db-profile-photo-bytes",
      chapter: "sysdes-databases-in-design",
      level: "beginner",
      skill: "concept",
      section: "the-families-and-what-each-is-genuinely-good-at",
      kind: "single",
      prompt:
        "<p>Users upload profile photos of a few megabytes each, and the app needs to show a photo next to the user's other profile data. Where should the photo bytes and the profile data live?</p>",
      choices: [
        {
          id: "a",
          text: "Both in the main relational database, with the photo in a binary column on the user row.",
          why: "Large blobs bloat the database, its backups and its replication stream, and the database is the most expensive place to hold bytes. The chapter's rule is to keep bytes out of the database.",
        },
        {
          id: "b",
          text: "The photo bytes in Redis, with the profile data in the relational database.",
          why: "An in-memory key-value store suits small hot values like sessions and counters. Holding megabyte blobs there pays memory prices per gigabyte for data that is rarely changed.",
        },
        {
          id: "c",
          text: "The photo bytes in a search index, with the profile data in the relational database.",
          why: "A search index is a derived structure for text queries and is never the source of truth. It is not a place to keep the only copy of a file.",
        },
        {
          id: "d",
          text: "The photo bytes in object storage, with the object key stored in the user's database row.",
          why: "Object storage gives effectively unlimited capacity at low cost per gigabyte with high durability. The database keeps the small metadata and the key that points to the bytes.",
        },
      ],
      answer: "d",
    },
    {
      id: "db-on-call-write-skew",
      chapter: "sysdes-databases-in-design",
      level: "beginner",
      skill: "diagnose",
      section: "transactions-what-acid-hides",
      kind: "single",
      prompt:
        "<p>On a single Postgres primary at Repeatable Read, a rule says at least one doctor must stay on call. Two doctors each run a transaction that counts doctors on call, sees 2, then sets their own row to off call. Both commit, and now nobody is on call. What happened, and what is the fix?</p>",
      choices: [
        {
          id: "a",
          text: "Write skew: both read a shared fact and wrote different rows. Use Serializable and retry the transaction that is aborted.",
          why: "Repeatable Read gives each transaction a stable snapshot, so each saw 2 and neither saw the other's change. Serializable detects this pattern and aborts one transaction with a serialization failure, which the application must retry.",
        },
        {
          id: "b",
          text: "A dirty read: one doctor read the other's uncommitted update, which was later rolled back.",
          why: "Both transactions saw the committed count of 2, not each other's pending work. Postgres does not allow dirty reads at any isolation level, so this cannot be the cause.",
        },
        {
          id: "c",
          text: "A lost update: both transactions overwrote the same row, so one of the two changes vanished.",
          why: "Each doctor updated their own row, so no row was overwritten and row-level conflict checks never fired. That is the reason this anomaly slips through.",
        },
        {
          id: "d",
          text: "Replication lag: the second doctor's count came from a read replica that had not caught up yet.",
          why: "There is one primary in this setup and no replica is read. Lag cannot explain a rule violation between two transactions on the same node.",
        },
      ],
      answer: "a",
    },
    {
      id: "db-index-column-order",
      chapter: "sysdes-databases-in-design",
      level: "beginner",
      skill: "diagnose",
      section: "indexes-what-they-buy-and-what-they-cost",
      kind: "single",
      prompt:
        "<p>The query is <code>SELECT id, body FROM posts WHERE author_id = 42 AND created_at &gt; now() - interval '7 days' ORDER BY created_at DESC LIMIT 20</code>. The only index is on <code>(created_at, author_id)</code>. <code>EXPLAIN ANALYZE</code> shows it walking recent posts from every author and discarding those that are not author 42, which has only a handful of recent posts. Which change fixes the problem?</p>",
      choices: [
        {
          id: "a",
          text: "Drop the index so the planner falls back to a sequential scan.",
          why: "A sequential scan reads the entire table and ignores the author filter just as badly. The index is not the problem; its column order is.",
        },
        {
          id: "b",
          text: "Extend the index with <code>id</code> and <code>body</code> so it covers the query.",
          why: "A covering index avoids visiting the table, but the leading column is still <code>created_at</code>, so the scan still walks every author's recent entries. It keeps the same wrong order and makes the index larger.",
        },
        {
          id: "c",
          text: "Rebuild it as <code>(author_id, created_at DESC)</code>.",
          why: "Equality column first, then the range and sort column. The index jumps straight to author 42's entries already in the right order, and the LIMIT stops the scan early with no sort step.",
        },
        {
          id: "d",
          text: "Run <code>ANALYZE</code> so the planner has fresh statistics about the table.",
          why: "Stale statistics can cause bad plans, but here the planner is using the index as designed. The plan is slow because the leading column does not match the query's equality filter.",
        },
      ],
      answer: "c",
    },
    {
      id: "db-index-entries-per-second",
      chapter: "sysdes-databases-in-design",
      level: "beginner",
      skill: "estimate",
      section: "indexes-what-they-buy-and-what-they-cost",
      kind: "single",
      prompt:
        "<p>A table has 5 secondary indexes. Every insert adds one new entry to each of them. The table takes 2,000 inserts per second. How many secondary-index entries are written per second?</p>",
      choices: [
        {
          id: "a",
          text: "2,000, one per inserted row",
          why: "This counts the rows and ignores the indexes. Each secondary index needs its own entry for every new row, so the count scales with the number of indexes.",
        },
        {
          id: "b",
          text: "12,000",
          why: "This adds the table row to the 5 index entries, giving 6 writes per insert. The question asks only for secondary-index entries, which is 5 per insert.",
        },
        {
          id: "c",
          text: "10,000",
          why: "5 indexes × 2,000 inserts is 10,000 index entries per second. This is the write tax of indexing, paid on every insert whether or not any query uses the index.",
        },
        {
          id: "d",
          text: "400",
          why: "This divides the inserts across the indexes as if each index took a share of the rows. Every index holds an entry for every row, so the work multiplies rather than splits.",
        },
      ],
      answer: "c",
    },
    {
      id: "db-pool-size-heuristic",
      chapter: "sysdes-databases-in-design",
      level: "beginner",
      skill: "estimate",
      section: "connection-pooling-the-bottleneck-nobody-draws",
      kind: "single",
      prompt:
        "<p>A Postgres server has 16 cores and one spinning disk that is effectively busy. Use the common starting heuristic (written for spinning disks) of (core count × 2) plus the number of busy disks, as the total number of server connections across all clients, to be confirmed by load testing. How many connections is that? The application fleet is 50 servers that would each like a 20-connection pool.</p>",
      choices: [
        {
          id: "a",
          text: "33 connections in total",
          why: "16 × 2 = 32, plus 1 busy disk, gives 33 in total across all clients. The fleet's own wish of 1,000 connections is not what the database can use well, which is why a pooler multiplexes the clients onto this smaller number.",
        },
        {
          id: "b",
          text: "16 connections in total",
          why: "This uses the core count alone and skips the doubling and the disk term. It is below the heuristic, which allows for time spent waiting on I/O.",
        },
        {
          id: "c",
          text: "32 connections in total",
          why: "This doubles the cores but leaves out the term for busy disks. The formula adds the number of disks that are actually busy.",
        },
        {
          id: "d",
          text: "1,000 connections in total, matching what the fleet wants",
          why: "That is what the fleet requests, not what the database can serve efficiently. Beyond the sweet spot throughput drops, because you have added queueing and context switching rather than capacity.",
        },
      ],
      answer: "a",
    },
    {
      id: "db-too-many-clients",
      chapter: "sysdes-databases-in-design",
      level: "beginner",
      skill: "tradeoff",
      section: "connection-pooling-the-bottleneck-nobody-draws",
      kind: "single",
      prompt:
        "<p>A Postgres primary allows 500 connections. After the API autoscaled to 60 instances with a 20-connection pool each, deploys cause <code>too many clients</code> errors, and queries are slow even when connections are accepted. A teammate proposes raising <code>max_connections</code> to 5,000. Which response is best for the database's health?</p>",
      choices: [
        {
          id: "a",
          text: "Raise <code>max_connections</code> to 5,000 so that no client is ever turned away again.",
          why: "This turns a fast failure into a slow one. The database accepts everything and serves all of it badly, because snapshot and scheduling work grows with connection count, even for idle ones.",
        },
        {
          id: "b",
          text: "Put an external pooler in front and keep the real server connections near a small multiple of the core count.",
          why: "A pooler multiplexes thousands of client connections onto tens of server connections. Bounding the pool also lets you queue or reject excess work at the application edge, where it is cheap to shed.",
        },
        {
          id: "c",
          text: "Add several read replicas so that the connections are spread across more database servers.",
          why: "Writes and any reads routed to the primary still connect to it, so its count barely changes. Replicas also each carry their own connection costs, and they add replication work.",
        },
        {
          id: "d",
          text: "Move to MySQL, since it uses a thread rather than a whole process per connection.",
          why: "Threads make each connection cheaper, but the shape of the problem is identical. A large fleet of unbounded pools will overwhelm MySQL in the same way.",
        },
      ],
      answer: "b",
    },
    {
      id: "db-transaction-pooling-breaks",
      chapter: "sysdes-databases-in-design",
      level: "beginner",
      skill: "concept",
      section: "connection-pooling-the-bottleneck-nobody-draws",
      kind: "multi",
      prompt:
        "<p>Your team places PgBouncer in transaction pooling mode, so each transaction may run on a different server connection. Select every feature that stops working correctly.</p>",
      choices: [
        {
          id: "a",
          text: "A <code>SET</code> command that changes a session variable and is expected to last across later requests",
          why: "Session state lives on one server connection, and the next transaction may land on another. An arbitrary session variable set this way can be missing on the next transaction or apply to a different client.",
        },
        {
          id: "b",
          text: "A single-statement <code>SELECT</code> by primary key sent on its own",
          why: "A self-contained statement needs no state from earlier requests, so it runs correctly on whichever connection the pooler picks.",
        },
        {
          id: "c",
          text: "<code>LISTEN</code> and <code>NOTIFY</code> subscriptions",
          why: "A subscription belongs to a particular session, but the client does not keep the same server session between transactions. Notifications are lost or delivered to the wrong place.",
        },
        {
          id: "d",
          text: "An <code>INSERT</code> and an <code>UPDATE</code> inside one short <code>BEGIN</code> to <code>COMMIT</code> block",
          why: "A whole transaction stays on one server connection until it ends. Transaction pooling is designed to serve this case, so it works.",
        },
        {
          id: "e",
          text: "A session-level advisory lock that is expected to be held between requests",
          why: "The lock is tied to the server session, which the client may not get back next time. The lock can stay held by a connection another client is now using, and the original client may never be able to release it.",
        },
      ],
      answers: ["a", "c", "e"],
    },
  ],
};
