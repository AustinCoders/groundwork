import type { Chapter } from "../types";

export const sysdesTransactionsIsolation: Chapter = {
  id: "sysdes-transactions-isolation",
  num: "A2",
  title: "Transactions and isolation",
  short: "Transactions and isolation",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "A transaction is a promise about what concurrent users can and cannot see, and the isolation level is how much of that promise you are actually buying.",
  body: `<h3>ACID, honestly</h3>
<p>
  A <b>transaction</b> groups several reads and writes into one unit that
  either happens or does not. The four letters of ACID are usually recited as
  if they were four equal guarantees. They are not, and an interviewer who
  asks "what does ACID mean" is checking whether you know which letters the
  database gives you and which ones you supply.
</p>
<ul>
  <li><b>Atomicity</b> means all-or-nothing on failure: if a transaction aborts or the server crashes halfway, none of its writes survive. It says nothing about concurrency. A better name is <em>abortability</em>.</li>
  <li><b>Consistency</b> is the odd one out. It means your application's invariants hold (an account never goes below zero, every order has a customer). The database can enforce only the rules you declare as constraints; everything else is the application's job, and the other three letters are the tools for keeping it.</li>
  <li><b>Isolation</b> is what concurrent transactions are allowed to see of each other. This is the letter with levels, the one the rest of the chapter is about, and the one most often weaker than people assume.</li>
  <li><b>Durability</b> means a committed transaction survives a crash, which is a statement about when the log reaches disk. PostgreSQL's default <code>synchronous_commit = on</code> waits for the local WAL flush (and for the synchronous standbys' flush too, if any are configured). Setting it to <code>off</code> lets the server report success first: the manual says recent commits can be lost in a crash, for up to three times <code>wal_writer_delay</code> (200 ms by default, so about 600 ms), but the database stays consistent, as though those transactions had aborted cleanly. Turning <code>fsync</code> off is different and can corrupt the cluster. Surviving a lost machine is a replication question, covered in the replication chapter.</li>
</ul>
<p>
  The word "transaction" also stretches. Redis <code>MULTI</code>/<code>EXEC</code>
  runs its queued commands one after another with nothing interleaved, but it
  has no rollback: a command that fails after <code>EXEC</code> does not stop
  the rest, and the docs say rollback was left out for simplicity and
  performance. It is isolation without abortability. A relational database is
  the opposite trade.
</p>

<h3>The anomalies, each as a story you can retell</h3>
<p>
  Isolation levels are defined by which anomalies they allow, so learn the
  anomalies first. Everything below involves two concurrent transactions,
  T1 and T2.
</p>
<table>
  <tr><th>Anomaly</th><th>What goes wrong</th><th>Example</th></tr>
  <tr><td><b>Dirty write</b></td><td>T2 overwrites a value T1 wrote but has not committed</td><td>Two buyers of one item: the car goes to Alice in the listing table and to Bob in the invoice table</td></tr>
  <tr><td><b>Dirty read</b></td><td>T2 reads a value T1 wrote but has not committed; T1 then aborts</td><td>You see an unread-count of 1 for a message that was rolled back</td></tr>
  <tr><td><b>Non-repeatable read</b> (read skew)</td><td>T1 reads the same row twice, or two related rows, and sees different committed states because T2 committed in between</td><td>A backup reads account A, T2 moves 100 from B to A, the backup reads B: the total is short by 100</td></tr>
  <tr><td><b>Lost update</b></td><td>Two transactions read a value, both compute a new one from it, and the second write overwrites the first</td><td>A counter at 10, two increments, final value 11 instead of 12</td></tr>
  <tr><td><b>Phantom</b></td><td>T1 runs a query for rows matching a condition; T2 inserts a row that matches; T1 repeats the query and gets a different set</td><td>"Is anyone booked in room 4 from 2 to 3?" answered no, then, after another transaction commits a booking, yes. (The cousin where both transactions check and both insert is write skew.)</td></tr>
  <tr><td><b>Write skew</b></td><td>T1 and T2 each read overlapping data, then write <em>different</em> rows, and the combination breaks an invariant neither checked alone</td><td>The on-call doctors below</td></tr>
</table>
<p>
  Write skew is the one worth dwelling on, because every simple rule people
  carry ("a transaction sees a consistent snapshot", "the later write wins")
  fails to catch it. Two doctors are on call; the rule is that at least one
  must stay on call. Both feel unwell and click "go off call" within the same
  second.
</p>

<figure>
  <svg viewBox="0 0 640 290" class="dg" role="img" aria-label="Two transactions each read that two doctors are on call, then each takes a different doctor off call, and both commit, leaving zero doctors on call and breaking the rule that at least one must remain.">
    <g class="rough">
      <path class="ln" d="M24,90 L616,90" />
      <path class="ln" d="M24,190 L616,190" />
    </g>
    <g class="rough">
      <rect class="box"  x="40"  y="66"  width="130" height="48" rx="5" />
      <rect class="boxy" x="190" y="66"  width="150" height="48" rx="5" />
      <rect class="boxg" x="360" y="66"  width="110" height="48" rx="5" />
      <rect class="box"  x="40"  y="166" width="130" height="48" rx="5" />
      <rect class="boxy" x="190" y="166" width="150" height="48" rx="5" />
      <rect class="boxg" x="360" y="166" width="110" height="48" rx="5" />
      <rect class="boxr" x="490" y="116" width="126" height="48" rx="5" />
    </g>
    <text class="lbl" x="24" y="50">T1 (Alice)</text>
    <text class="lbl" x="24" y="150">T2 (Bob)</text>
    <text class="sm" x="105" y="94"  text-anchor="middle">1 read: 2 on call</text>
    <text class="sm" x="265" y="94"  text-anchor="middle">2 set Alice off call</text>
    <text class="sm gr" x="415" y="94"  text-anchor="middle">3 commit</text>
    <text class="sm" x="105" y="194" text-anchor="middle">1 read: 2 on call</text>
    <text class="sm" x="265" y="194" text-anchor="middle">2 set Bob off call</text>
    <text class="sm gr" x="415" y="194" text-anchor="middle">3 commit</text>
    <text class="sm rd" x="553" y="136" text-anchor="middle">0 on call</text>
    <text class="sm rd" x="553" y="154" text-anchor="middle">rule broken</text>
    <text class="lbl rd" x="24" y="250" style="font-size:15px">Neither transaction wrote what the other wrote, so there is no conflicting row for snapshot isolation to catch.</text>
    <text class="sm" x="24" y="274">Each decision was correct against its own snapshot. The combination was never checked by anyone.</text>
  </svg>
  <figcaption>Write skew: the invariant spans two rows, the writes touch different rows, and so a write-write conflict check sees nothing wrong.</figcaption>
</figure>

<h3>Isolation levels, and why the names lie</h3>
<p>
  The SQL standard names four levels (read uncommitted, read committed,
  repeatable read, serializable) and defines them by three anomalies: dirty
  reads, non-repeatable reads and phantoms. Real databases implemented the
  names in different ways, and the standard's definitions never mentioned lost
  update or write skew at all. The consequence is that the label on the level
  tells you less than the engine behind it. Kleppmann's Hermitage project exists
  for exactly this reason: it runs the same test transactions against each
  database to "nail down precisely what different database systems actually
  mean with their isolation levels".
</p>
<table>
  <tr><th>Anomaly</th><th>Read committed</th><th>Snapshot isolation (PostgreSQL "repeatable read")</th><th>Serializable</th></tr>
  <tr><td>Dirty read</td><td>Prevented</td><td>Prevented</td><td>Prevented</td></tr>
  <tr><td>Non-repeatable read</td><td>Possible</td><td>Prevented</td><td>Prevented</td></tr>
  <tr><td>Phantom</td><td>Possible</td><td>Prevented by the snapshot in PostgreSQL</td><td>Prevented</td></tr>
  <tr><td>Lost update (read, compute, write)</td><td>Possible</td><td>PostgreSQL aborts the second writer; some engines do not</td><td>Prevented</td></tr>
  <tr><td>Write skew</td><td>Possible</td><td><b>Possible</b></td><td>Prevented</td></tr>
</table>
<p class="sub">
  PostgreSQL's own table says a Read Uncommitted request behaves as Read
  Committed, and that its Repeatable Read does not allow phantoms even
  though the standard would permit them. Its documentation calls Repeatable
  Read an implementation of snapshot isolation and says that level is not
  necessarily consistent with any serial execution.
</p>

<h4>Snapshot isolation, the level most databases actually run</h4>
<p>
  Most systems implement the middle levels with <b>multi-version concurrency
  control</b> (MVCC). Writers never overwrite a row in place; they add a new
  version, and each transaction reads the versions that were committed when
  its snapshot was taken. Readers never block writers and writers never block
  readers, which is why this design won. In PostgreSQL's Repeatable Read the
  snapshot is taken at the first statement of the transaction and held to the
  end; Read Committed takes a fresh snapshot for each statement. InnoDB uses snapshots too, though Hermitage rates its repeatable read as weaker than PostgreSQL's: its consistent reads at REPEATABLE READ use the
  snapshot established by the first read, while at READ COMMITTED each
  consistent read sets and reads its own fresh snapshot.
</p>
<p>
  Snapshot isolation catches write-write conflicts on the <em>same row</em>.
  In PostgreSQL, if a Repeatable Read transaction tries to update a row that
  a concurrent transaction changed and committed since its snapshot, it fails
  with <code>could not serialize access due to concurrent update</code> and the
  application must retry the whole transaction. That kills the classic lost
  update. InnoDB does not do this: Hermitage's results for MySQL REPEATABLE
  READ show lost update and write skew both still possible, so the same
  "repeatable read" label protects you in one database and not in the other.
  Neither engine can see write skew, because T1 and T2 wrote different rows.
</p>

<h4>Dry run: lost update, then write skew, under each rule</h4>
<p>
  First a counter at 10 and two clients each adding 1. Then the doctors, with
  2 on call and a rule that the count must stay at 1 or more.
</p>
<table>
  <tr><th>Scenario</th><th>Rule</th><th>What the two transactions do</th><th>Final state</th><th>Verdict</th></tr>
  <tr><td>Counter at 10</td><td>Read, add 1 in the app, write back (any level that lets both read 10)</td><td>T1 reads 10, T2 reads 10, T1 writes 11, T2 writes 11</td><td>11</td><td>Lost update: 10 + 2 should be 12</td></tr>
  <tr><td>Counter at 10</td><td>One statement: <code>UPDATE c SET n = n + 1</code></td><td>Each update takes the row lock, reads the latest value and adds 1 in turn</td><td>12</td><td>Correct, and the cheapest fix</td></tr>
  <tr><td>Counter at 10</td><td>PostgreSQL Repeatable Read, read-modify-write</td><td>T1 writes 11 and commits; T2's update hits a row changed after its snapshot and aborts; T2 retries, reads 11, writes 12</td><td>12</td><td>Correct, at the price of a retry loop</td></tr>
  <tr><td>2 on call</td><td>Snapshot isolation</td><td>T1 and T2 both read count = 2; T1 sets Alice off; T2 sets Bob off; no shared row, both commit</td><td>0 on call</td><td>Write skew: 2 &minus; 1 &minus; 1 = 0</td></tr>
  <tr><td>2 on call</td><td>PostgreSQL Serializable (SSI)</td><td>Same steps; the engine notices a dangerous pattern of read-write dependencies that could be part of a non-serializable cycle; one transaction gets SQLSTATE 40001 (on a later statement or at commit)</td><td>1 on call</td><td>Correct, after a retry; the retry reads count = 1 and refuses</td></tr>
  <tr><td>2 on call</td><td>Locking read at Read Committed: <code>SELECT ... FOR UPDATE</code> on all on-call rows</td><td>T1 locks both rows; T2's lock request waits; T1 commits (1 left); T2 reads count = 1 and stops</td><td>1 on call</td><td>Correct, and T2 waited instead of failing (at Repeatable Read or Serializable, PostgreSQL would instead abort T2 with a serialization failure)</td></tr>
</table>
<p class="sub">
  Notice that the three fixes for write skew have different shapes. Declare
  the rule as a constraint if the database can express it; take locks on the
  rows you read so the second transaction waits; or run at a serializable level
  and retry on failure. Phantom-based variants of the same bug (a booking
  inserted into an empty range) cannot be fixed by locking rows that do not
  exist yet, which is why range locks, predicate locks or a materialised
  slot table exist.
</p>

<h3>Making it truly serializable: three techniques</h3>
<p>
  <b>Serializable</b> means the outcome equals some one-at-a-time ordering of
  the transactions, as the consistency models chapter defined it. There are
  three ways to deliver it.
</p>
<table>
  <tr><th>Technique</th><th>How it works</th><th>Cost</th><th>Where you see it</th></tr>
  <tr><td><b>Actual serial execution</b></td><td>Run one transaction at a time on one thread, so isolation is free. The whole transaction must be a single stored procedure or script, since waiting for a client round trip would stall everything behind it</td><td>Throughput of one core per partition, and transactions across partitions need extra coordination</td><td>Redis: commands in a transaction are serialised, and scripts are transactional</td></tr>
  <tr><td><b>Two-phase locking (2PL)</b></td><td>Take a shared lock to read and an exclusive lock to write, hold every lock until commit. Readers block writers and writers block readers</td><td>Blocking, deadlocks (the database aborts one), and a slow transaction stalls everyone who touches its rows</td><td>InnoDB SERIALIZABLE converts plain SELECTs to SELECT ... FOR SHARE when autocommit is off. Spanner's read-write transactions use locks with wound-wait to avoid deadlock</td></tr>
  <tr><td><b>Serializable snapshot isolation (SSI)</b></td><td>Run snapshot isolation and track read-write dependencies between concurrent transactions. When they form a pattern that could be non-serializable, abort one</td><td>No blocking, but aborts, and tracking memory. Every client needs a retry loop</td><td>PostgreSQL SERIALIZABLE</td></tr>
</table>
<p>
  PostgreSQL's SSI shows the design trade clearly. Its predicate locks, shown
  as <code>SIReadLock</code> in <code>pg_locks</code>, do not block anything and
  so cannot cause deadlock; they only record what was read. When a dangerous
  structure appears, a transaction fails with SQLSTATE 40001 and the
  application must start over, so under SSI a retry loop is part of the
  contract, not an optional extra. The authors of the PostgreSQL implementation measured, in 2012 on PostgreSQL 9.1, a performance cost of less than 7% relative to snapshot isolation on their transaction-processing and web-application benchmarks (a simple microbenchmark showed more), and found it
  outperformed two-phase locking significantly on some workloads. Two sharp
  edges: a hot standby cannot run SERIALIZABLE transactions, and data read
  in a serializable transaction should not be trusted until that transaction
  commits.
</p>
<p>
  Which to choose? Serial execution when the data fits one partition and every
  transaction is short; SSI when contention is moderate and you want readers
  to stay unblocked; 2PL or explicit row locks when contention is high and
  aborting wastes more than waiting does. Under heavy contention SSI wastes work on aborts, though PostgreSQL's design guarantees that an immediate retry will not fail again with the same conflict; under locks the transactions queue instead.
</p>

<h3>What the four systems actually default to</h3>
<table>
  <tr><th>System</th><th>Default</th><th>Stronger option</th><th>What to remember</th></tr>
  <tr><td><b>PostgreSQL</b></td><td>Read Committed</td><td>Repeatable Read (snapshot isolation); Serializable (SSI)</td><td>Read Committed permits lost update and write skew; Repeatable Read aborts conflicting updates but still permits write skew; only Serializable stops it, with retries</td></tr>
  <tr><td><b>MySQL (InnoDB)</b></td><td>REPEATABLE READ</td><td>SERIALIZABLE (locking reads); READ COMMITTED drops gap locks</td><td>Plain SELECT reads a snapshot, but locking reads and writes use next-key or gap locks to block inserts into scanned ranges. Hermitage found lost update and write skew possible at the default</td></tr>
  <tr><td><b>Spanner</b></td><td>Serializable, with external consistency</td><td>Repeatable read (snapshot isolation) is available; the docs name write skew as the anomaly it permits</td><td>Read-write transactions lock and run two-phase commit across Paxos groups; read-only snapshot transactions take no locks</td></tr>
  <tr><td><b>DynamoDB</b></td><td>Single-item operations; strongly consistent reads are optional</td><td>TransactWriteItems and TransactGetItems</td><td>Transactions are serializable with respect to other single-item operations, but Query, Scan and BatchGetItem are read-committed against a transaction. In multi-Region eventually consistent global tables a transaction is atomic only inside its own Region, and strongly consistent global tables do not support transactions at all</td></tr>
</table>
<p class="sub">
  Two cautions. A default is a statement about the average application, not
  about yours, so a design that depends on an invariant across rows needs
  to name the level it relies on. And a name can hide an engine difference, as
  the lost-update row shows: "repeatable read" on two databases is two
  different products.
</p>
<p>
  DynamoDB's transaction page is a good example of what distributed
  transactions cost. A transaction groups up to 100 items totalling at most
  4 MB, performs two underlying reads or writes per item (one to prepare, one
  to commit), and a conflicting concurrent transaction is cancelled rather
  than waited for. Its own capacity example: one transaction a second
  writing three 500-byte items needs 3 &times; 2 = 6 write capacity units. A
  client token makes <code>TransactWriteItems</code> idempotent for 10 minutes
  after the request finishes. That prepare-then-commit doubling is the next
  topic in miniature.
</p>

<h3>Distributed transactions: two-phase commit and why it blocks</h3>
<p>
  When one transaction spans two databases (or two shards), atomicity needs
  agreement: all must commit or none. <b>Two-phase commit</b> (2PC) achieves it
  with a coordinator. In phase one the coordinator asks every participant to
  <b>prepare</b>: each writes its changes and a promise to the log, keeps its
  locks, and votes yes or no. If every vote is yes, the coordinator durably
  records the decision to commit, and in phase two tells everyone. A single no,
  or a timeout, means abort.
</p>

<figure>
  <svg viewBox="0 0 640 310" class="dg" role="img" aria-label="Two-phase commit between a coordinator and two participants: prepare requests, yes votes, the coordinator logs commit, commit messages. A shaded window after the participants vote yes marks the period in which they are in doubt and holding locks, and a crash of the coordinator inside this window leaves them stuck.">
    <g class="rough">
      <path class="ln dash" d="M90,56 L90,286" />
      <path class="ln dash" d="M320,56 L320,286" />
      <path class="ln dash" d="M550,56 L550,286" />
      <path class="ln"  d="M90,92 L316,92" />
      <path class="ln"  d="M90,102 L546,102" />
      <path class="lng" d="M320,134 L94,134" />
      <path class="lng" d="M550,144 L94,144" />
      <path class="ln"  d="M90,226 L316,226" />
      <path class="ln"  d="M90,236 L546,236" />
    </g>
    <g class="rough">
      <rect class="box"  x="30"  y="16" width="120" height="38" rx="6" />
      <rect class="box"  x="260" y="16" width="120" height="38" rx="6" />
      <rect class="box"  x="490" y="16" width="120" height="38" rx="6" />
      <rect class="boxr" x="266" y="150" width="108" height="64" rx="5" />
      <rect class="boxy" x="496" y="152" width="108" height="62" rx="5" />
    </g>
    <text class="lbl" x="90"  y="40" text-anchor="middle">coordinator</text>
    <text class="lbl" x="320" y="40" text-anchor="middle">shard A</text>
    <text class="lbl" x="550" y="40" text-anchor="middle">shard B</text>
    <text class="sm" x="100" y="84">1 prepare?</text>
    <text class="sm gr" x="100" y="128">2 yes (locks held)</text>
    <text class="sm" x="100" y="190">3 log "commit"</text>
    <text class="sm" x="100" y="218">4 commit</text>
    <text class="sm rd" x="320" y="176" text-anchor="middle">in doubt:</text>
    <text class="sm rd" x="320" y="194" text-anchor="middle">cannot decide alone</text>
    <text class="sm" x="550" y="178" text-anchor="middle">same wait</text>
    <text class="sm" x="550" y="196" text-anchor="middle">locks held</text>
    <text class="lbl rd" x="24" y="268" style="font-size:15px">If the coordinator dies between steps 2 and 4, both shards wait with their locks.</text>
    <text class="sm" x="24" y="294">A participant that voted yes may neither commit nor abort on its own.</text>
  </svg>
  <figcaption>2PC's atomicity is real, but the window between "I voted yes" and "I was told the outcome" is a window in which the participant has surrendered its freedom.</figcaption>
</figure>

<p>
  The blocking is the point. Once a participant has voted yes it must be able
  to commit if told to, so it cannot abort alone; yet it cannot commit alone
  because another participant may have voted no. If the coordinator crashes
  after collecting votes, participants are <b>in doubt</b> and hold their locks
  until the coordinator recovers and answers. PostgreSQL's
  <code>PREPARE TRANSACTION</code> documentation says exactly this: the
  transaction continues to hold whatever locks it held, it is unwise to leave
  one prepared for long (it holds up <code>VACUUM</code> and can even force the
  database to shut down to prevent transaction ID wraparound), and the feature
  is for external transaction managers, not for applications.
</p>
<p>
  Costs to quote. A remote participant holds its locks from the moment it votes yes until the commit message reaches it, which is about one coordinator-to-participant round trip. With an 80 ms round trip that is 80 ms, so a hot row in such a transaction can commit at most 1 &divide; 0.080 = 12.5 times a second, and that is before counting the log forces and the cross-region round trips of the statements themselves, so real figures are worse. That arithmetic is why cross-region 2PC on contended rows is a bad idea. Spanner shows the repair:
  it runs 2PC across Paxos groups, but each coordinator and participant is
  itself a replicated state machine, so no single machine's crash blocks the
  transaction, and most transactions touch only one Paxos group and skip 2PC
  entirely. The price is paid in latency, with the commit wait described in
  the time and ordering chapter.
</p>

<h3>Sagas and the outbox: when you cannot or will not hold locks</h3>
<p>
  Across services that own separate databases, holding locks across network
  calls is rarely acceptable, and a payment provider or email system will not
  join your 2PC at all. The alternative is a <b>saga</b>: a sequence of local
  transactions, each committed on its own, coordinated so that a failure
  midway triggers <b>compensating transactions</b> that undo the earlier steps.
  Reserve inventory, charge the card, create the shipment. If the shipment
  step fails, issue a refund and release the inventory.
</p>
<ul>
  <li><b>Choreography:</b> each service reacts to the previous step's event and publishes its own. No central owner, but the flow lives nowhere you can read.</li>
  <li><b>Orchestration:</b> an orchestrator tells each participant which local transaction to run and what to do on failure. One place to read, test and observe the flow.</li>
  <li><b>A compensation is not a rollback.</b> It is a new business action, and some effects cannot be undone: an email already sent, a parcel already shipped. Design the step order so the irreversible actions come last.</li>
  <li><b>Sagas have no isolation.</b> Another transaction can see the intermediate state (stock reserved, payment not yet taken). Treat that state as a legitimate status in the data model, such as "pending", and handle it explicitly.</li>
</ul>
<p>
  A saga is only as reliable as each step's ability to commit locally
  <em>and</em> publish the message that triggers the next step. Doing those two
  things separately is the <b>dual-write problem</b>: publish before commit,
  and a rollback leaves a message about something that never happened; commit
  then publish, and a crash in between loses the message. The
  <b>transactional outbox</b> removes the gap. The service writes its business
  change and an outbox row in the <em>same</em> local transaction, so they
  commit or fail together. A separate relay then reads the outbox, either by
  polling it or by tailing the database's transaction log, and publishes to
  the broker. Because the relay can crash after publishing and before marking
  the row done, delivery is at least once, and consumers must be idempotent.
  The message queues chapter covers idempotent consumers and delivery
  guarantees in detail.
</p>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="An order service commits an order row and an outbox row in one local database transaction. A relay reads the outbox and publishes to a broker, from which a consumer reads. The relay may publish twice after a crash, so the consumer deduplicates by message id.">
    <g class="rough">
      <path class="ln" d="M150,100 L196,100" />
      <path class="ln" d="M330,100 L376,100" />
      <path class="ln" d="M486,100 L520,100" />
      <path class="lnr dash" d="M430,126 L430,170" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="64" width="134" height="72" rx="6" />
      <rect class="boxy" x="196" y="64" width="134" height="72" rx="6" />
      <rect class="box"  x="376" y="64" width="110" height="72" rx="6" />
      <rect class="boxg" x="520" y="64" width="104" height="72" rx="6" />
    </g>
    <text class="lbl" x="83"  y="88" text-anchor="middle">order service</text>
    <text class="sm"  x="83"  y="108" text-anchor="middle">one local txn:</text>
    <text class="sm"  x="83"  y="124" text-anchor="middle">order + outbox row</text>
    <text class="lbl" x="263" y="88" text-anchor="middle">outbox table</text>
    <text class="sm"  x="263" y="108" text-anchor="middle">rows wait until</text>
    <text class="sm"  x="263" y="124" text-anchor="middle">the relay sends them</text>
    <text class="lbl" x="431" y="88" text-anchor="middle">relay</text>
    <text class="sm"  x="431" y="108" text-anchor="middle">poll or log tail,</text>
    <text class="sm"  x="431" y="124" text-anchor="middle">then publish</text>
    <text class="lbl" x="572" y="88" text-anchor="middle">broker</text>
    <text class="sm"  x="572" y="108" text-anchor="middle">consumer</text>
    <text class="sm"  x="572" y="124" text-anchor="middle">dedups by id</text>
    <text class="sm rd" x="440" y="190">crash after publish, before marking sent:</text>
    <text class="sm rd" x="440" y="208">the row is sent again, so delivery is at least once</text>
    <text class="lbl" x="16" y="234" style="font-size:15px">Message sent if and only if the transaction committed.</text>
  </svg>
  <figcaption>The outbox turns "write to the database and the broker" into one atomic write plus a retryable copy job.</figcaption>
</figure>

<h3>Picking the right tool, in one table</h3>
<table>
  <tr><th>Situation</th><th>Reach for</th><th>Why</th></tr>
  <tr><td>A counter, a balance, an inventory decrement</td><td>One atomic statement or conditional write</td><td>Avoids the read-compute-write gap entirely: no lost update at any level, though at Repeatable Read or Serializable PostgreSQL may abort the second writer and expect a retry</td></tr>
  <tr><td>"At most one" (username, seat, doctor on call)</td><td>A uniqueness or exclusion constraint, or a lock on the rows read</td><td>Write skew and phantoms are invisible to snapshot reads</td></tr>
  <tr><td>Complex multi-row invariants in one database</td><td>Serializable with a retry loop</td><td>Correct without reasoning about every interleaving</td></tr>
  <tr><td>Two shards of one system that must both commit</td><td>2PC inside a platform that replicates its coordinator (Spanner-style), or redesign so the entities share a shard</td><td>Plain 2PC blocks on coordinator failure</td></tr>
  <tr><td>Several services, each with its own database</td><td>A saga with an outbox</td><td>No cross-service locks; failure handled by compensation</td></tr>
</table>

<div class="say">
  <span class="ttl">Say it like this →</span> "Inside one database I'd use the
  default level and make each invariant explicit. Counters and stock
  decrements are single conditional updates, so there's no lost-update window.
  'At most one doctor off call' is write skew, which snapshot isolation does
  not catch, so I'd either lock the rows I read or run that transaction at
  serializable and retry on a 40001. Across services I won't use two-phase
  commit, because a coordinator crash leaves participants holding locks; I'd
  use a saga with a transactional outbox so the event is published if and only
  if the order commits, and I'd make the consumers idempotent."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "two users at once", "transfer", "book the last seat", "reserve", "exactly one", "must not go negative", "across services". Each is a concurrency or atomicity question; name the anomaly before naming the fix.</li>
  <li><b>The naive design</b> reads a value, checks it in application code, then writes. That read-compute-write gap is where lost updates and write skew live. Replace it with a conditional write, a lock or a serializable transaction.</li>
  <li><b>Ask which level, and in which database.</b> "We'll use transactions" is incomplete; the answer that scores is "Postgres at read committed by default, so I'd add FOR UPDATE here" or "serializable, with a retry loop".</li>
  <li><b>Distributed means expensive.</b> Quote the 2PC lock-hold time (about a round trip per hop, plus log forces) and the blocking-on-coordinator-failure property, then offer the alternative: co-locate the data, or a saga with compensation.</li>
  <li><b>Events plus database writes</b> always raise the dual-write question. Volunteer the outbox before it is asked.</li>
  <li><b>The pitfall to avoid:</b> assuming "repeatable read" or "serializable" means the same thing in every engine, or treating compensation as a true rollback.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Say which letters of ACID the database enforces by itself, and which depend on your constraints and your replication setup.</li>
    <li>Explain write skew with the on-call example, and why snapshot isolation does not detect it.</li>
    <li>Compare serial execution, two-phase locking and SSI by what they do on a conflict: stall, block or abort.</li>
    <li>Trace what happens when a two-phase commit coordinator crashes after collecting votes, and estimate how long a participant holds locks, and the hot-row commit rate, for an 80 ms round trip.</li>
    <li>Describe the dual-write problem and how an outbox with an idempotent consumer solves it.</li>
  </ul>
</div>

<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://www.postgresql.org/docs/current/transaction-iso.html" rel="noopener noreferrer">PostgreSQL: transaction isolation</a> — the per-level anomaly table, snapshot isolation, serialization failures, SSI and predicate locks</li>
    <li><a href="https://www.postgresql.org/docs/current/runtime-config-wal.html" rel="noopener noreferrer">PostgreSQL: write-ahead log settings</a> — synchronous_commit levels, what off risks, and why fsync off is different</li>
    <li><a href="https://www.postgresql.org/docs/current/sql-prepare-transaction.html" rel="noopener noreferrer">PostgreSQL: PREPARE TRANSACTION</a> — prepared transactions keep their locks, and are meant for external transaction managers</li>
    <li><a href="https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html" rel="noopener noreferrer">MySQL 8.4: InnoDB transaction isolation levels</a> — the REPEATABLE READ default, snapshots, next-key locks, SERIALIZABLE</li>
    <li><a href="https://github.com/ept/hermitage" rel="noopener noreferrer">Hermitage: what databases mean by their isolation levels</a> — the same test transactions run against PostgreSQL, MySQL and Oracle</li>
    <li><a href="https://www.vldb.org/pvldb/vol5/p1850_danrkports_vldb2012.pdf" rel="noopener noreferrer">Ports and Grittner: Serializable Snapshot Isolation in PostgreSQL (VLDB 2012)</a> — the design and a performance cost of under 7% against snapshot isolation</li>
    <li><a href="https://docs.cloud.google.com/spanner/docs/isolation-levels" rel="noopener noreferrer">Spanner: isolation levels</a> — serializable by default, repeatable read as snapshot isolation, write skew</li>
    <li><a href="https://research.google/pubs/spanner-googles-globally-distributed-database-2/" rel="noopener noreferrer">Spanner paper (OSDI 2012, extended in ACM TOCS 2013)</a> — locks and two-phase commit across Paxos groups, lock-free snapshot reads</li>
    <li><a href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html" rel="noopener noreferrer">DynamoDB transactions</a> — limits, isolation against other operations, capacity cost, idempotency token</li>
    <li><a href="https://microservices.io/patterns/data/saga.html" rel="noopener noreferrer">microservices.io: saga</a> — choreography, orchestration, compensating transactions, lack of isolation</li>
    <li><a href="https://microservices.io/patterns/data/transactional-outbox.html" rel="noopener noreferrer">microservices.io: transactional outbox</a> — the dual-write problem, relays, at-least-once delivery</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. The 80 ms round trip is the planning figure for US to Western Europe from the capacity chapter; the lock-hold arithmetic is an illustration from the protocol's message flow, not a measurement. PostgreSQL and MySQL details are for PostgreSQL 18 and MySQL 8.4.</p>
</div>`,
};
