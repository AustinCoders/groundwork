import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "re-async-loss-window",
      chapter: "sysdes-replication",
      level: "intermediate",
      skill: "estimate",
      section: "failover-promoting-a-follower-is-easy-doing-it-safely-is-the",
      kind: "single",
      prompt:
        "<p>A primary streams its log to one asynchronous standby. The primary crashes at a moment when the standby is 60 ms behind in log position, and the primary has been committing a steady 8,000 writes per second. The standby is promoted. Assuming every write in that 60 ms gap had been acknowledged to its client but not yet shipped, how many acknowledged writes does the failover lose?</p>",
      choices: [
        {
          id: "a",
          text: "None, because the standby is the most advanced follower available",
          why: "Choosing the most advanced follower minimises the loss but cannot remove it. With asynchronous replication the primary acknowledged writes before shipping them, so whatever sat in the gap is gone from the new primary.",
        },
        {
          id: "b",
          text: "60 writes",
          why: "This reads the 60 ms as a count of writes. The loss is lag multiplied by write rate, so a number of milliseconds has to be converted into the writes that arrive in that time.",
        },
        {
          id: "c",
          text: "4,800 writes",
          why: "This takes 60 ms as 0.6 seconds, a factor of ten too large. 60 ms is 0.060 s, and 0.060 × 8,000 is far smaller.",
        },
        {
          id: "d",
          text: "480 writes",
          why: "Loss is lag times write rate: 0.060 s × 8,000 writes per second is 480 acknowledged writes. They survive only on the old primary's disk, and someone has to decide whether to replay or discard them.",
        },
      ],
      answer: "d",
    },
    {
      id: "re-sync-standby-stale-read",
      chapter: "sysdes-replication",
      level: "intermediate",
      skill: "diagnose",
      section: "synchronous-or-asynchronous-you-are-choosing-what-a-crash-ma",
      kind: "single",
      prompt:
        "<p>A PostgreSQL primary names one standby in <code>synchronous_standby_names</code> and runs with <code>synchronous_commit = on</code>. An application writes a row, gets the commit acknowledgement, and immediately reads the row from that same standby. Now and then the read misses the row. Which explanation fits?</p>",
      choices: [
        {
          id: "a",
          text: "The replication is secretly asynchronous, so the primary acknowledged the commit before the standby had received anything.",
          why: "With a synchronous standby named and the setting at on, the commit waits until the standby has flushed the commit record. The record is safe on the standby, so the problem is not missing data on it.",
        },
        {
          id: "b",
          text: "The standby has the commit record on durable storage but may not have replayed it yet, because on promises durability and not visibility.",
          why: "Plain on waits for the standby's flush, not its replay. The remote_apply setting also waits for replay, which is what makes the write visible to queries there, at the price of waiting longer on every commit.",
        },
        {
          id: "c",
          text: "The standby has <code>hot_standby_feedback</code> switched off, which hides recent rows from queries.",
          why: "That setting tells the primary which rows the standby's queries still need, to prevent query cancellations. It never hides committed rows, so it cannot explain a read that returns without the row.",
        },
        {
          id: "d",
          text: "The log is shipped as SQL statements, and re-executing them on the standby gives different rows.",
          why: "Physical streaming replication ships low-level changes to disk pages, not SQL text, so there is nothing to re-execute. Statement-based divergence is a MySQL binary log issue and would not make a row go missing.",
        },
      ],
      answer: "b",
    },
    {
      id: "re-planned-switchover-steps",
      chapter: "sysdes-replication",
      level: "intermediate",
      skill: "sequence",
      section: "failover-promoting-a-follower-is-easy-doing-it-safely-is-the",
      kind: "order",
      prompt:
        "<p>You are doing a planned switchover of a healthy leader to one follower, so that no acknowledged write is lost. Clients are redirected only to a node that is already the leader. Put the steps in order.</p>",
      items: [
        { id: "stop", text: "Stop the old leader from accepting new writes" },
        { id: "catch", text: "Wait until the follower has reached the old leader's final log position" },
        { id: "promote", text: "Promote the follower to be the new leader" },
        { id: "repoint", text: "Re-point clients and flush caches that still remember the old leader" },
      ],
      why: "Writes have to stop first, or the log keeps growing and the follower can never be proven caught up. Only once it holds the final position is promotion lossless. Clients and caches are redirected last, because pointing them at a follower that is not yet a leader would send writes to a read-only node.",
    },
    {
      id: "re-quorum-standby-choice",
      chapter: "sysdes-replication",
      level: "intermediate",
      skill: "tradeoff",
      section: "synchronous-or-asynchronous-you-are-choosing-what-a-crash-ma",
      kind: "single",
      prompt:
        "<p>A PostgreSQL primary has two standbys, <code>s1</code> and <code>s2</code>, in different availability zones. Requirements: an acknowledged write must survive loss of the primary, and writes must keep flowing when either standby is down. Today <code>s1</code> is the only synchronous standby, and writes hang whenever it crashes. Which configuration meets both requirements?</p>",
      choices: [
        {
          id: "a",
          text: "Make both standbys asynchronous, since a crashed standby can then never block a commit.",
          why: "Writes never hang, but an acknowledged write can now be lost if the primary dies before the log reaches a standby. That breaks the first requirement.",
        },
        {
          id: "b",
          text: "Keep <code>s1</code> as the only synchronous standby and add an alert for when it goes down.",
          why: "The alert shortens the time to notice, but commits still wait for one specific machine. Writes stay blocked until someone intervenes, so the second requirement is not met.",
        },
        {
          id: "c",
          text: "Use quorum commit, <code>ANY 1 (s1, s2)</code>, so a commit waits for whichever standby answers first.",
          why: "Each acknowledged write is on at least one standby, and a single standby failure does not stop commits. The caveat is that failover must promote a standby that is known to hold every acknowledged write, since the lagging one may not.",
        },
        {
          id: "d",
          text: "Keep one named synchronous standby and set <code>remote_apply</code> for stronger protection.",
          why: "Waiting for replay as well as flush adds latency to each commit and still depends on one named machine. It strengthens read visibility but leaves writes blocked when that standby is down.",
        },
      ],
      answer: "c",
    },
    {
      id: "re-semi-sync-fallback",
      chapter: "sysdes-replication",
      level: "intermediate",
      skill: "diagnose",
      section: "synchronous-or-asynchronous-you-are-choosing-what-a-crash-ma",
      kind: "single",
      prompt:
        "<p>A MySQL 8.4 source runs semi-synchronous replication with a single replica. The replica's network link is down for several minutes, yet clients see commits succeed after only a brief pause. Later the source crashes, and writes acknowledged during the outage are missing from the replica. What explains it?</p>",
      choices: [
        {
          id: "a",
          text: "Semi-synchronous mode waits for the replica to apply each transaction, and applying was slow during the outage.",
          why: "It waits only for the replica to confirm it has received the events, not that they were executed. And a slow apply would not let commits succeed while the link is down.",
        },
        {
          id: "b",
          text: "Semi-synchronous mode needs every replica to acknowledge, and the group had excluded the failed one.",
          why: "It requires acknowledgement from at least one replica, not all of them. With only one replica and its link down, no acknowledgement could arrive in any case.",
        },
        {
          id: "c",
          text: "The default wait point is after the storage engine commit, so the source acknowledged before the log was synced.",
          why: "By default the source waits after syncing the binary log but before the engine commit. The wait point is configurable, but neither setting explains commits succeeding while the link is down. That comes from the timeout fallback.",
        },
        {
          id: "d",
          text: "After the timeout passes with no replica acknowledgement, the source reverts to asynchronous replication and commits without waiting.",
          why: "That is the documented fallback. It returns to semi-synchronous mode only once a replica catches up, so the durability promise lapses, without any error to the client, exactly while the replica is unhealthy.",
        },
      ],
      answer: "d",
    },
    {
      id: "re-deleted-rows-return",
      chapter: "sysdes-replication",
      level: "intermediate",
      skill: "diagnose",
      section: "leaderless-any-replica-takes-writes-and-repair-does-the-clea",
      kind: "single",
      prompt:
        "<p>A Cassandra 5.0 cluster uses default settings: 3-hour hint window and a 10-day tombstone grace period. One node was offline for 12 days and rejoined, and nobody ran a repair. Some rows that users had deleted during the outage now reappear. What is the most likely cause?</p>",
      choices: [
        {
          id: "a",
          text: "The node missed the deletes, the other replicas then purged the tombstones, and its old copy is now the only version left to spread.",
          why: "The 12-day outage outlasted both the hint window and the 10-day grace period, so the delete was never delivered and the tombstone disappeared elsewhere. Repairing within the grace period prevents this.",
        },
        {
          id: "b",
          text: "Hinted handoff replayed the original inserts to the node when it came back.",
          why: "Hints are kept only for the 3-hour window, so a 12-day outage produced no useful hints. Hints would also carry the deletes, not undo them.",
        },
        {
          id: "c",
          text: "Cassandra sends deletes only to the coordinator, so other replicas never learn of them.",
          why: "Writes, deletes included, go to all replicas of the key regardless of consistency level. The consistency level only decides how many replies the coordinator waits for.",
        },
        {
          id: "d",
          text: "The returning node's clock ran ahead, giving its old rows newer timestamps than the deletes.",
          why: "A row's timestamp is fixed when it was written, so being offline does not refresh it. The old rows have older timestamps than the delete and lose to it, as long as the tombstone still exists.",
        },
      ],
      answer: "a",
    },
    {
      id: "re-multi-leader-likes",
      chapter: "sysdes-replication",
      level: "intermediate",
      skill: "tradeoff",
      section: "multi-leader-writes-in-more-than-one-place-and-the-bill-that",
      kind: "single",
      prompt:
        "<p>A post's like count is replicated multi-leader between two regions. Each region must accept clicks locally with no cross-region coordination, and no click may be lost. Today the count is stored as a single number that is overwritten, with last-write-wins on timestamps. When one user in each region likes at nearly the same moment, the total rises by one instead of two. What is the right fix?</p>",
      choices: [
        {
          id: "a",
          text: "Store likes as increments in a counter CRDT, so merging replicas adds both clicks.",
          why: "An overwrite cannot represent two concurrent additions, but a counter that keeps one slot per replica and merges by taking each slot's maximum can. Both regions end at the same total and neither click is lost.",
        },
        {
          id: "b",
          text: "Synchronise clocks more tightly, so the truly later of the two writes wins.",
          why: "Both writes were valid and concurrent. Even with perfect clocks, last-write-wins keeps only one of them, so one click is still dropped.",
        },
        {
          id: "c",
          text: "Send every like for a post through the post's home region, to avoid the conflict.",
          why: "Home routing does avoid conflicts, but a click from the other region must then cross the network before being accepted. That breaks the local-write requirement.",
        },
        {
          id: "d",
          text: "Reject the second concurrent write and ask the client to retry it.",
          why: "A click that each region has already accepted locally would be dropped, and the requirement says no click may be lost. It also pushes retries onto users for what should be a simple click.",
        },
      ],
      answer: "a",
    },
    {
      id: "re-stop-two-primaries",
      chapter: "sysdes-replication",
      level: "intermediate",
      skill: "concept",
      section: "failover-promoting-a-follower-is-easy-doing-it-safely-is-the",
      kind: "multi",
      prompt:
        "<p>A failover tool promotes a standby after the primary misses its heartbeats, but the old primary might still be alive, paused or connected to clients. Select every measure that stops the old primary from taking writes once the standby has been promoted.</p>",
      choices: [
        {
          id: "a",
          text: "Fence the old primary, for example by cutting its network port or revoking its storage lease, before the promotion completes.",
          why: "If the old primary is made unable to write before the new one starts, only one writer exists at a time. Fencing is the direct cure for split brain.",
        },
        {
          id: "b",
          text: "Cut the heartbeat timeout to a couple of seconds so failures are detected sooner.",
          why: "Shorter timeouts mean more false positives, such as a garbage-collection pause or a load spike being treated as a crash. Without fencing, that manufactures more cases of two primaries.",
        },
        {
          id: "c",
          text: "Give each promotion a fencing token that the storage layer checks, so it rejects writes carrying an older token.",
          why: "A paused or partitioned old primary may wake up believing it is still the leader, so its own belief cannot be trusted. The storage layer refuses its writes because the token is older than the newest it has seen.",
        },
        {
          id: "d",
          text: "Promote the standby with the highest log position.",
          why: "This limits the lost writes, which is a separate hazard. The old primary can still be running and taking writes, so choosing the best standby does not stop two primaries.",
        },
      ],
      answers: ["a", "c"],
    },
  ],
};
