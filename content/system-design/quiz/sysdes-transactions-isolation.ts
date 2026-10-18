import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "tx-doctors-both-off-call",
      chapter: "sysdes-transactions-isolation",
      level: "advanced",
      skill: "diagnose",
      section: "the-anomalies-each-as-a-story-you-can-retell",
      kind: "single",
      prompt:
        "<p>A PostgreSQL database runs at its default isolation level. The on-call code runs <code>SELECT count(*) FROM doctors WHERE on_call</code>, and if the count is at least 2 it runs <code>UPDATE doctors SET on_call = false WHERE name = :me</code>. Alice and Bob run it at the same moment, each from a separate transaction. Both commit, and now nobody is on call. Which anomaly explains this?</p>",
      choices: [
        {
          id: "a",
          text: "A dirty read: one transaction counted a change the other had not committed yet.",
          why: "Both transactions saw the committed count of 2, which is why both went ahead. A dirty read needs an uncommitted write to be visible, and PostgreSQL never allows that at any level.",
        },
        {
          id: "b",
          text: "A lost update: the second write overwrote the first one.",
          why: "A lost update needs both transactions to write the same row. Alice's update touched her row and Bob's touched his, so neither overwrote anything.",
        },
        {
          id: "c",
          text: "Write skew: each saw a valid count, then wrote a different row.",
          why: "Both transactions read an overlapping set, each wrote a different row, and no single row was in conflict. The invariant spans two rows, so only a lock on the rows read, a constraint, or a serializable level catches it.",
        },
        {
          id: "d",
          text: "A phantom: a new matching row appeared between the count and the write.",
          why: "A phantom needs the same query to be re-run and return a different set of rows. Neither doctor re-runs the count and nothing was inserted. The conflict is two writes to different rows based on a stale read.",
        },
      ],
      answer: "c",
    },
    {
      id: "tx-last-unit-of-stock",
      chapter: "sysdes-transactions-isolation",
      level: "advanced",
      skill: "tradeoff",
      section: "picking-the-right-tool-in-one-table",
      kind: "single",
      prompt:
        "<p>A shop runs PostgreSQL at the default isolation level. The checkout code reads <code>stock</code> for item 7 with a plain <code>SELECT</code>, checks in the application that it is above zero, then runs <code>UPDATE item SET stock = :stock - 1 WHERE id = 7</code>. With one unit left, two buyers check out together and both succeed. You want to fix the oversell, keep the default level, and avoid writing a retry loop. Which change does that?</p>",
      choices: [
        {
          id: "a",
          text: "Run the same code at Repeatable Read, so the engine stops the second writer from committing.",
          why: "This does prevent the oversell, but PostgreSQL does it by aborting the second writer with a serialization error, and the application must retry the whole transaction. It breaks the no-retry condition.",
        },
        {
          id: "b",
          text: "One statement: <code>SET stock = stock - 1 WHERE id = 7 AND stock &gt; 0</code>, then check rows affected.",
          why: "The check and the decrement happen in one statement under the row lock, so the second buyer sees the latest value and matches zero rows. The gap between read and write disappears, and no retry is needed.",
        },
        {
          id: "c",
          text: "Wrap the read and the write in an explicit <code>BEGIN</code> and <code>COMMIT</code> block, so they run as one unit.",
          why: "At Read Committed each statement gets its own snapshot and takes no lock on a plain read, so both transactions still read 1 and the second write overwrites the first. Grouping the statements does not close the gap.",
        },
        {
          id: "d",
          text: "Raise the transaction to Serializable, so the engine rejects the second buyer's write as a conflict.",
          why: "Serializable would also prevent it, but a conflicting transaction fails with SQLSTATE 40001 and the application must start over. That is exactly the retry loop the question rules out.",
        },
      ],
      answer: "b",
    },
    {
      id: "tx-counter-moves-to-mysql",
      chapter: "sysdes-transactions-isolation",
      level: "advanced",
      skill: "concept",
      section: "what-the-four-systems-actually-default-to",
      kind: "single",
      prompt:
        "<p>A counter row holds 10. Each request runs a plain <code>SELECT</code> of the counter, adds 1 in the application, and writes the result back with <code>UPDATE c SET n = :new</code>. Two requests both read before either writes. On PostgreSQL at Repeatable Read the second one fails with a serialization error. The team moves the unchanged code to MySQL 8.4 with InnoDB at its default level. What happens to the two concurrent requests there?</p>",
      choices: [
        {
          id: "a",
          text: "The second one gets the same serialization error, since both are called repeatable read.",
          why: "The label is shared but the engines differ. InnoDB does not abort an update to a row that changed after the snapshot, so there is no error. Hermitage's results for MySQL (tested on 5.6) record lost update as possible at that level.",
        },
        {
          id: "b",
          text: "Both succeed and the counter ends at 12, because plain reads take next-key locks.",
          why: "A plain SELECT is a non-locking read of a snapshot. Next-key and gap locks apply to locking reads, updates and deletes, so nothing makes the second request wait before it reads, and both read 10.",
        },
        {
          id: "c",
          text: "Both succeed and the counter ends at 12, because the default level is READ COMMITTED.",
          why: "The InnoDB default is REPEATABLE READ. Even at READ COMMITTED, a value computed in the application from an earlier read is stale by the time it is written, so the result would still be 11.",
        },
        {
          id: "d",
          text: "Both succeed with no error, and the counter ends at 11.",
          why: "The second request overwrites the first with a value computed from a stale read. This is the lost update, which InnoDB's REPEATABLE READ still permits.",
        },
      ],
      answer: "d",
    },
    {
      id: "tx-2pc-hot-row-rate",
      chapter: "sysdes-transactions-isolation",
      level: "advanced",
      skill: "estimate",
      section: "distributed-transactions-two-phase-commit-and-why-it-blocks",
      kind: "single",
      prompt:
        "<p>A two-phase commit transaction updates one hot row on a remote shard. Assume the shard holds that row's lock for 120 ms in every transaction, from its yes vote until the commit message reaches it, and no other transaction can touch the row during that time. Ignoring every other cost, what is the most such transactions that can commit on that row per second?</p>",
      choices: [
        {
          id: "a",
          text: "About 8.3 per second, which is 1 divided by 0.120 seconds.",
          why: "Transactions on the row run strictly one after another, each holding the lock for 0.120 seconds, so the ceiling is 1 / 0.120 = 8.3. Real systems do worse once log forces and statement round trips are added.",
        },
        {
          id: "b",
          text: "About 16.7 per second, as the lock is held for only half the stated time.",
          why: "That would need a lock held for 60 ms, which is half of what the stem gives. The stem says 120 ms of lock time per transaction, and 1 / 0.060 is 16.7.",
        },
        {
          id: "c",
          text: "About 120 per second, one for each millisecond of lock time.",
          why: "This reads the 120 ms as a rate. A longer lock time lowers the ceiling, so more milliseconds cannot mean more commits per second.",
        },
        {
          id: "d",
          text: "About 83 per second, which is 1 divided by 0.012 seconds.",
          why: "This is a decimal slip: 120 ms is 0.120 seconds, not 0.012. A hold ten times shorter would give ten times the rate.",
        },
      ],
      answer: "a",
    },
    {
      id: "tx-dynamodb-transaction-capacity",
      chapter: "sysdes-transactions-isolation",
      level: "advanced",
      skill: "estimate",
      section: "what-the-four-systems-actually-default-to",
      kind: "single",
      prompt:
        "<p>A provisioned DynamoDB table receives 5 <code>TransactWriteItems</code> calls per second, each writing 4 different items. Every item is under 1 KB, so a single underlying write of one item costs 1 write capacity unit (WCU). Using DynamoDB's transaction cost model, how many WCUs per second must the table provision for this traffic, assuming no other writes?</p>",
      choices: [
        {
          id: "a",
          text: "20 WCU, one for each item written",
          why: "That counts one write per item. DynamoDB performs two underlying writes for each item in a transaction, one to prepare and one to commit, so the cost doubles.",
        },
        {
          id: "b",
          text: "10 WCU, two for each transaction",
          why: "This applies the prepare and commit doubling to the whole call instead of to each item. The cost is per item in the transaction, so a four-item call costs more than two.",
        },
        {
          id: "c",
          text: "40 WCU, which is 5 × 4 × 2",
          why: "Five calls a second times four items times two underlying writes per item gives 40. The doubling is why transactional writes cost twice what the same plain writes would.",
        },
        {
          id: "d",
          text: "80 WCU, doubled again for retries",
          why: "Nothing in the stem adds a retry. The 2x is already the prepare and commit pair, and applying it twice has no basis in the cost model.",
        },
      ],
      answer: "c",
    },
    {
      id: "tx-serializable-40001-response",
      chapter: "sysdes-transactions-isolation",
      level: "advanced",
      skill: "tradeoff",
      section: "making-it-truly-serializable-three-techniques",
      kind: "single",
      prompt:
        "<p>To fix the on-call write skew, a team runs the doctor transaction at PostgreSQL's Serializable level. In production one of two simultaneous requests now occasionally fails with SQLSTATE 40001. What should the application do?</p>",
      choices: [
        {
          id: "a",
          text: "Move the transaction back to Repeatable Read so the errors stop for good.",
          why: "The errors stop because the protection stops. PostgreSQL's Repeatable Read is snapshot isolation, which still permits write skew, so the doctors can both go off call again.",
        },
        {
          id: "b",
          text: "Run the whole transaction again, which now sees count 1 and refuses.",
          why: "Under serializable snapshot isolation a retry loop is part of the contract. The rerun takes a fresh snapshot, reads the committed result of the other doctor's change, and applies the rule correctly.",
        },
        {
          id: "c",
          text: "Catch the error and carry on with the remaining statements in the same transaction block.",
          why: "The failed transaction is aborted and its writes will be discarded, and further statements in it are rejected until it is rolled back, so continuing does not redo them. The unit of work has to start over from its first read.",
        },
        {
          id: "d",
          text: "Tell the user the request was invalid, because 40001 means the input was wrong.",
          why: "40001 reports a conflict between concurrent transactions, not a bad request. The same request, run again, normally succeeds, so surfacing it as a user error turns a transient conflict into a permanent failure.",
        },
      ],
      answer: "b",
    },
    {
      id: "tx-outbox-guarantees",
      chapter: "sysdes-transactions-isolation",
      level: "advanced",
      skill: "concept",
      section: "sagas-and-the-outbox-when-you-cannot-or-will-not-hold-locks",
      kind: "multi",
      prompt:
        "<p>An order service must save an order in its own database and also tell a message broker that the order was placed. It uses the transactional outbox pattern with a separate relay process. Select every statement that is true of this design.</p>",
      choices: [
        {
          id: "a",
          text: "The order row and the outbox row are written in the same local transaction, so they commit or fail together.",
          why: "This is the heart of the pattern. It removes the window in which the database commit and the message publish could disagree, because there is only one commit.",
        },
        {
          id: "b",
          text: "The relay can crash after publishing and before marking the row sent, so consumers may see a message twice.",
          why: "Publishing and marking the row are two separate steps, so a crash between them causes a resend. Delivery is at least once, and consumers have to cope with duplicates.",
        },
        {
          id: "c",
          text: "The relay can find new rows by polling the outbox table or by tailing the database's transaction log.",
          why: "Both are accepted ways to build the relay. Polling is simpler, and log tailing avoids repeated queries against the table.",
        },
        {
          id: "d",
          text: "The pattern gives exactly-once delivery, so consumers need no deduplication.",
          why: "The relay's possible resend means duplicates can reach the broker. The outbox gives at-least-once delivery, and an idempotent consumer is what makes a repeated message harmless.",
        },
        {
          id: "e",
          text: "The broker takes part in the database transaction, so a rollback retracts a published message.",
          why: "The broker is outside the database transaction and publishing happens later. What a rollback does is stop the outbox row from existing, so nothing is ever published for that order.",
        },
      ],
      answers: ["a", "b", "c"],
    },
    {
      id: "tx-two-phase-commit-steps",
      chapter: "sysdes-transactions-isolation",
      level: "advanced",
      skill: "sequence",
      section: "distributed-transactions-two-phase-commit-and-why-it-blocks",
      kind: "order",
      prompt:
        "<p>A coordinator runs a two-phase commit across two shards, and every participant votes yes. Put the steps in the order the protocol, as described in the chapter, performs them.</p>",
      items: [
        { id: "prepare", text: "The coordinator asks every participant to prepare" },
        { id: "vote", text: "Each participant logs its changes and a promise, keeps its locks, and votes yes" },
        { id: "decide", text: "The coordinator durably records the decision to commit" },
        { id: "commit", text: "The coordinator tells every participant to commit" },
      ],
      why: "Phase one starts with the prepare request, and a participant that votes yes has already written its changes and promise to its log and holds its locks. Only after all votes are in does the coordinator record the commit decision, and it does that before telling anyone, so a coordinator crash after that point can be recovered from its log. Phase two then delivers the decision, and the participants release their locks.",
    },
  ],
};
