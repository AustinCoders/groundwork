import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "co-comment-missing",
      chapter: "sysdes-consistency-models",
      level: "intermediate",
      skill: "diagnose",
      section: "the-two-poles-and-the-useful-middle",
      kind: "single",
      prompt:
        "<p>A comments feature writes to the primary and serves every read from asynchronous replicas. Users complain that right after posting, a refresh does not show their comment, and a few seconds later it appears. Other readers see new comments a little late and nobody minds. Which guarantee is being violated, and what is the cheapest fix that targets it?</p>",
      choices: [
        {
          id: "a",
          text: "Monotonic reads, fixed by routing each user to one replica for the whole session.",
          why: "Monotonic reads forbids a user seeing a value and then watching it vanish. Here the comment was never visible to its author at all, so sticky routing would leave the stale replica in place and the symptom unchanged.",
        },
        {
          id: "b",
          text: "Consistent prefix, fixed by keeping writes in order within each partition.",
          why: "Consistent prefix is about seeing an effect before its cause, such as a reply before the question. One user's own single comment going missing is not an ordering problem between related writes.",
        },
        {
          id: "c",
          text: "Read-your-writes, fixed by sending a user's reads to the primary for a short window after their own write.",
          why: "Only the author notices the gap, and the author's read landed on a replica that had not yet applied the write. Pinning that user to the primary briefly, or making the replica wait for the write's log position, fixes exactly this and costs almost nothing for everyone else.",
        },
        {
          id: "d",
          text: "Linearizability, fixed by sending every read for every user through the leader.",
          why: "It would remove the symptom, but it makes all readers pay a leader round trip and lose availability when the leader is unreachable, to fix something only the writer perceives. The question asks for the cheapest targeted fix, and the chapter's test says that when only the writer notices, read-your-writes is enough.",
        },
      ],
      answer: "c",
    },
    {
      id: "co-write-then-read-token",
      chapter: "sysdes-consistency-models",
      level: "intermediate",
      skill: "sequence",
      section: "the-two-poles-and-the-useful-middle",
      kind: "order",
      prompt:
        "<p>You give a user read-your-writes by having a replica wait for a version token instead of pinning them to the primary. Put the steps in the order they happen for one write followed by one read.</p>",
      items: [
        { id: "write", text: "The client's write commits on the primary" },
        { id: "token", text: "The primary returns the write's log position (an LSN) to the client as a token" },
        { id: "send", text: "The client sends its next read to a replica together with that token" },
        { id: "wait", text: "The replica holds the read until it has replayed the log up to the token" },
        { id: "serve", text: "The replica answers the read, and the answer includes the client's write" },
      ],
      why: "The token can only exist once the write has committed and its position is known, and the client can only attach it to a later read. The replica must catch up to that position before answering, because answering earlier is exactly the stale read the token is meant to prevent.",
    },
    {
      id: "co-smallest-read-quorum",
      chapter: "sysdes-consistency-models",
      level: "intermediate",
      skill: "estimate",
      section: "quorums-r-w-n-with-the-numbers-worked-out",
      kind: "single",
      prompt:
        "<p>A leaderless store keeps N = 5 replicas of each key and acknowledges a write once W = 4 of them have it. Assume strict quorums, where every acknowledging replica is a real member of the key's replica set. What is the smallest read quorum R that still guarantees the read set overlaps every write set, and with that R, how many replicas can be down while reads still succeed?</p>",
      choices: [
        {
          id: "a",
          text: "R = 1, 4 replicas down",
          why: "With R = 1 the sum R + W is 5, which does not exceed N = 5, so a read of one replica can land on the one replica that missed the write. Reads would be very available, but the overlap guarantee is gone.",
        },
        {
          id: "b",
          text: "R = 2, 3 replicas down",
          why: "The overlap condition R + W > N needs R > 5 − 4 = 1, so the smallest R is 2. A read needs only 2 responders, so 5 − 2 = 3 replicas can be down and reads still succeed.",
        },
        {
          id: "c",
          text: "R = 3, 2 replicas down",
          why: "R = 3 does satisfy the overlap condition, but it is not the smallest. This is the majority quorum reflex, and it gives up reads that R = 2 would still serve.",
        },
        {
          id: "d",
          text: "R = 4, 1 replica down",
          why: "Copying W into R satisfies the arithmetic but is the most restrictive choice, since reads then tolerate only one failure. The question asks for the smallest R that keeps the overlap.",
        },
      ],
      answer: "b",
    },
    {
      id: "co-missed-write-after-heal",
      chapter: "sysdes-consistency-models",
      level: "intermediate",
      skill: "diagnose",
      section: "quorums-r-w-n-with-the-numbers-worked-out",
      kind: "single",
      prompt:
        "<p>A Dynamo-style store with N = 3, W = 2, R = 2 keeps each key on replicas R1, R2 and R3 and uses sloppy quorums with hinted handoff. During a partition, R1 and R2 are unreachable, so a write is acknowledged by R3 and by an outsider node R4 that holds a hint. The partition heals before the hint is delivered. A reader then contacts R1 and R2 and gets the previous value. R + W is 4, which is greater than 3, so why was the newest write missed?</p>",
      choices: [
        {
          id: "a",
          text: "The ack from R4 counted toward W even though R4 is not a replica of the key, so the write set {R3, R4} and the read set {R1, R2} were disjoint.",
          why: "The pigeonhole argument only holds when every acking node is a genuine replica of the key. A sloppy quorum lets an outsider count, so the arithmetic still says 4 > 3 while the actual sets never touch.",
        },
        {
          id: "b",
          text: "R + W &gt; N only holds when the replicas' clocks are synchronised, and skew made the older value look newer.",
          why: "The guarantee comes from the overlap of sets, not from timing. Clock skew can make last-write-wins pick the wrong version among those read, but here no copy of the newest write was in the read set at all.",
        },
        {
          id: "c",
          text: "Hinted handoff lets a hint count toward any consistency level, so a Cassandra write at QUORUM would behave the same way.",
          why: "In Cassandra a stored hint satisfies a write only at consistency level ANY. At ONE, QUORUM or higher the acknowledgements must come from real replicas, so the overlap argument survives there.",
        },
        {
          id: "d",
          text: "No quorum rule can hold while any replica is unreachable, so R + W &gt; N is void during every partition.",
          why: "A strict quorum counts only real replicas. On the side of a partition that can still reach two of the three real replicas, W = 2 and R = 2 would still overlap. What broke it was counting a non-member.",
        },
      ],
      answer: "a",
    },
    {
      id: "co-username-claim",
      chapter: "sysdes-consistency-models",
      level: "intermediate",
      skill: "tradeoff",
      section: "choosing-per-operation-model-cost-and-what-it-looks-like-to-",
      kind: "single",
      prompt:
        "<p>Signup code checks whether <code>@ada</code> is free by reading it, then writes the claim. The store is leaderless with N = 3, W = 2, R = 2, and it offers a conditional write primitive. Two people in different regions submit <code>@ada</code> at the same instant and both are told they got it. Which change guarantees exactly one winner?</p>",
      choices: [
        {
          id: "a",
          text: "Raise the quorums to W = 3 and R = 3 so every replica is consulted.",
          why: "Both requests can still read the name as free before either write lands, then both write. Bigger quorums make each operation more consistent but do not make the read-then-write pair atomic.",
        },
        {
          id: "b",
          text: "Keep the quorums and rely on last-write-wins timestamps to pick one claimant.",
          why: "Both writers were already told they succeeded. Last-write-wins only chooses which value survives, so one user silently loses a name they were promised.",
        },
        {
          id: "c",
          text: "Put a cache with a short TTL in front, so the free-name check sees recent claims.",
          why: "A cache is another replica with its own lag, so two concurrent checks can both see the name as free. It narrows the window but leaves the race.",
        },
        {
          id: "d",
          text: "Make the claim one insert-if-absent conditional write, ordered at a single point.",
          why: "Two concurrent claims must not both succeed, and no choice of R and W gives that. A conditional write at a single point of ordering lets exactly one succeed and tells the other it lost.",
        },
      ],
      answer: "d",
    },
    {
      id: "co-serializable-not-newest",
      chapter: "sysdes-consistency-models",
      level: "intermediate",
      skill: "concept",
      section: "linearizability-vs-serializability-telling-them-apart-for-go",
      kind: "single",
      prompt:
        "<p>A database guarantees serializability but does not claim strict serializability. Which statement about it is true?</p>",
      choices: [
        {
          id: "a",
          text: "It cannot offer multi-key transactions, because it makes no promise about real time.",
          why: "Multi-key transactions are what serializability is about. It constrains how concurrent transactions interleave and says nothing about real time, so the two are independent.",
        },
        {
          id: "b",
          text: "Every read it serves returns the latest committed value, because a serial order exists.",
          why: "Existing as a serial order does not mean the newest order. A transaction run against a lagging snapshot is still a valid serial order, so recency is not promised.",
        },
        {
          id: "c",
          text: "It may order a transaction that committed earlier in real time after one that committed later, so a read can return older data.",
          why: "Serializability needs a result equivalent to some serial order, and that order need not match the real-time order. Adding the real-time constraint is what makes it strict serializability.",
        },
        {
          id: "d",
          text: "It may allow write skew, since two doctors each going off call is equivalent to some serial order.",
          why: "Write skew is the anomaly of snapshot isolation. Both doctors went off call because each saw the other on call, and no serial order of the two transactions produces that outcome, so a serializable database must prevent it.",
        },
      ],
      answer: "c",
    },
    {
      id: "co-zookeeper-stale-read",
      chapter: "sysdes-consistency-models",
      level: "intermediate",
      skill: "concept",
      section: "linearizability-vs-serializability-telling-them-apart-for-go",
      kind: "single",
      prompt:
        "<p>Client A writes a znode in ZooKeeper and the call returns. Client B, connected to a different server, begins a read of that znode afterwards and gets the old value. The application needs B to see A's write. What is the correct fix?</p>",
      choices: [
        {
          id: "a",
          text: "Have B call <code>sync()</code> before its read.",
          why: "ZooKeeper orders writes through a leader, but each server answers reads from its own state, and the server B uses may not have applied A's write yet. The programmer's guide tells a client that needs to see another client's write to call sync() before reading.",
        },
        {
          id: "b",
          text: "Have A repeat the write, because ZooKeeper acknowledges a write before the leader has ordered it.",
          why: "Writes go through the leader and are applied in a total order before the call returns. The write was not lost or unordered, and repeating it would just create a second update.",
        },
        {
          id: "c",
          text: "Raise the client's read quorum R, since ZooKeeper reads gather a tunable number of servers.",
          why: "ZooKeeper has no R. A read is served locally by the connected server, which is why it can be stale. Quorum tuning belongs to leaderless stores.",
        },
        {
          id: "d",
          text: "Change nothing, because ZooKeeper reads are linearizable and the application must have a bug.",
          why: "ZooKeeper does not make this promise by default, and its guide says two clients may not see the same view at the same instant. Reads can be stale unless sync() is used first.",
        },
      ],
      answer: "a",
    },
    {
      id: "co-fields-eventual-ok",
      chapter: "sysdes-consistency-models",
      level: "intermediate",
      skill: "tradeoff",
      section: "choosing-per-operation-model-cost-and-what-it-looks-like-to-",
      kind: "multi",
      prompt:
        "<p>You serve a social app's pages from asynchronous replicas whose lag can reach a few hundred milliseconds. Select every field that can safely use plain eventual consistency, meaning that being that stale harms nobody, no decision depends on it, and no user needs to see a change they just made.</p>",
      choices: [
        {
          id: "a",
          text: "The like count on a post",
          why: "A like count that is off by a few for a fraction of a second changes nothing a user can act on, so a local replica read is the right trade.",
        },
        {
          id: "b",
          text: "The view counter on a video",
          why: "Nobody can tell whether a view counter is a few views behind, and a wrong value costs nothing, so eventual consistency is enough.",
        },
        {
          id: "c",
          text: "The remaining-stock count that decides whether a checkout is accepted",
          why: "A decision depends on this value. A stale count can accept orders for items that no longer exist, so the check should read the latest committed value or be enforced in a transaction.",
        },
        {
          id: "d",
          text: "A follower count shown rounded as 1.2k",
          why: "Rounding hides small differences, so staleness of a few followers is literally invisible and harms nobody. Eventual reads are fine.",
        },
        {
          id: "e",
          text: "The avatar a user has just uploaded, shown to that same user",
          why: "The writer notices immediately if the old avatar reappears after upload. That is a read-your-writes case, not an eventual one, though other viewers can stay eventual.",
        },
      ],
      answers: ["a", "b", "d"],
    },
  ],
};
