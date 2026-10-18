import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "cap-letters-precisely",
      chapter: "sysdes-cap-theorem-depth",
      level: "advanced",
      skill: "concept",
      section: "the-three-letters-defined-precisely-this-is-where-marks-are-",
      kind: "multi",
      prompt:
        "<p>An interviewer asks you to define the three letters of CAP exactly as the theorem uses them. Select every statement that matches the formal definitions.</p>",
      choices: [
        {
          id: "a",
          text: "C is linearizability: the system acts as if there is one copy, so a read returns the latest completed write.",
          why: "This is the formal meaning. It is the strongest single-object guarantee, and weaker models such as causal consistency or read-your-writes sit below it.",
        },
        {
          id: "b",
          text: "A means every request to a non-failing node gets a non-error response, with no bound on how long it takes.",
          why: "This is the formal definition in the Gilbert and Lynch proof. It says nothing about speed or freshness, which is why CAP alone cannot reason about production latency targets.",
        },
        {
          id: "c",
          text: "C is the consistency of ACID, so CAP-C holds whenever integrity constraints are enforced.",
          why: "The two share a word and nothing else. ACID consistency is about application invariants such as constraints, while CAP-C is about whether replicas look like a single copy to readers.",
        },
        {
          id: "d",
          text: "A means the service meets a high uptime target such as four nines.",
          why: "An uptime figure is a measured metric of a running service. CAP-A is a property of the algorithm: whether every non-failing node can always answer. A CP system can post better uptime than an AP one.",
        },
        {
          id: "e",
          text: "P means the system keeps operating when arbitrary messages between nodes are dropped.",
          why: "This is the definition. A network can drop or delay messages whether or not you want it to, so P describes the environment the system must survive rather than a feature you opt into.",
        },
      ],
      answers: ["a", "b", "e"],
    },
    {
      id: "cap-smallest-write-quorum",
      chapter: "sysdes-cap-theorem-depth",
      level: "advanced",
      skill: "estimate",
      section: "the-quorum-dial-r-w-n",
      kind: "single",
      prompt:
        "<p>A Dynamo-style store keeps N = 5 replicas per key and reads from R = 2 of them. Assume strict quorums, meaning the acknowledgements come from the key's real replicas with no hinted handoff. What is the smallest write quorum W that guarantees every read set overlaps every write set?</p>",
      choices: [
        {
          id: "a",
          text: "W = 2, matching R",
          why: "Two writers and two readers can sit on four different replicas out of five, so a read can miss the write entirely. The overlap condition is R + W &gt; N, and 2 + 2 is only 4.",
        },
        {
          id: "b",
          text: "W = 3, a majority of 5",
          why: "A majority write is not enough when R is only 2. A write on replicas 1 to 3 and a read on replicas 4 and 5 are disjoint, because 2 + 3 = 5 does not exceed N.",
        },
        {
          id: "c",
          text: "W = 4",
          why: "Overlap needs R + W &gt; 5, so with R = 2 the smallest W is 4: any two replicas read must include one of the four that took the write.",
        },
        {
          id: "d",
          text: "W = 5, every replica",
          why: "Writing to all five does guarantee overlap, but it is not the smallest value, and it makes every write fail when any one replica is down.",
        },
      ],
      answer: "c",
    },
    {
      id: "cap-zookeeper-stale-read",
      chapter: "sysdes-cap-theorem-depth",
      level: "advanced",
      skill: "diagnose",
      section: "where-real-systems-sit-the-honest-tunable-version",
      kind: "single",
      prompt:
        "<p>In a five-server ZooKeeper ensemble, service A updates a config znode and the write is committed. A moment later, service B, connected to a different server, reads that znode and sometimes sees the old value. What explains this, and what should B do when it must see the latest committed write?</p>",
      choices: [
        {
          id: "a",
          text: "The write was not committed until all five servers acknowledged it, so B should wait for a full acknowledgement.",
          why: "ZooKeeper commits a write once a majority of the ensemble has accepted it, so a minority of servers can legitimately lag behind. Waiting for all five would also stop writes whenever one server is down.",
        },
        {
          id: "b",
          text: "B's server had not yet applied the write, so B should call sync() before it reads.",
          why: "Reads are answered by the server the client is connected to, which may not have applied the latest commit. The documented fix is to call sync() first, which makes that server catch up before the read.",
        },
        {
          id: "c",
          text: "B's session is stale, so it should open a new session to get linearizable reads.",
          why: "A new session does not change which server answers or whether that server has applied the write. Reads are not linearizable by default whatever session they use.",
        },
        {
          id: "d",
          text: "B should lengthen its session timeout so its server has longer to catch up.",
          why: "The session timeout controls how long a disconnected client keeps its session. It has no effect on how quickly a lagging server applies committed writes.",
        },
      ],
      answer: "b",
    },
    {
      id: "cap-cassandra-hints-quorum",
      chapter: "sysdes-cap-theorem-depth",
      level: "advanced",
      skill: "concept",
      section: "where-real-systems-sit-the-honest-tunable-version",
      kind: "single",
      prompt:
        "<p>A Cassandra keyspace has replication factor 3. During a partition, a coordinator can reach only one of the three replicas for a key, and a client writes that key at consistency level QUORUM. Assume the coordinator would store hints for the two unreachable replicas. What is the outcome?</p>",
      choices: [
        {
          id: "a",
          text: "It succeeds, because each stored hint counts as an acknowledgement toward the quorum.",
          why: "That is the sloppy quorum of the original Dynamo design. Cassandra's documentation lets a hint satisfy only consistency level ANY.",
        },
        {
          id: "b",
          text: "It succeeds, because writes go to all replicas and one reachable replica is enough.",
          why: "Writes are indeed sent to all replicas, but the consistency level sets how many responses the coordinator must collect before it acknowledges the client. QUORUM with three replicas needs two.",
        },
        {
          id: "c",
          text: "It succeeds, because a quorum is a majority of the replicas the coordinator can reach.",
          why: "A quorum is a majority of all the key's replicas, which is two of three here, not a majority of whichever replicas happen to be reachable.",
        },
        {
          id: "d",
          text: "It fails: a hint satisfies only ANY, and QUORUM needs two real replicas.",
          why: "Two replicas must respond to meet QUORUM at replication factor 3, and only one is reachable. A stored hint does not count toward the acknowledgement at QUORUM.",
        },
      ],
      answer: "d",
    },
    {
      id: "cap-cart-merge",
      chapter: "sysdes-cap-theorem-depth",
      level: "advanced",
      skill: "tradeoff",
      section: "what-ap-actually-looks-like-from-the-client-s-seat",
      kind: "single",
      prompt:
        "<p>Shopping carts live in a Dynamo-style store that must keep accepting writes on both sides of a partition. A customer adds item X through one side and item Y through the other. A lost add costs a sale. Which reconciliation fits?</p>",
      choices: [
        {
          id: "a",
          text: "Last-write-wins by timestamp, which needs no application logic.",
          why: "It keeps only the newest version, so one of the two adds is discarded, and with wall-clock timestamps clock skew can decide which one. That is the lost sale this system is trying to avoid.",
        },
        {
          id: "b",
          text: "Refuse writes on the side without a majority, so the carts never diverge.",
          why: "That is the CP choice. It avoids divergence, but it contradicts the requirement to keep accepting writes on both sides.",
        },
        {
          id: "c",
          text: "Return both versions to the application, which merges them by union.",
          why: "Neither add is lost. The known price is that an item the customer removed on one side can reappear after the merge, which is the cheaper failure here because the customer only has to remove it again.",
        },
        {
          id: "d",
          text: "Read repair and anti-entropy, which pick the winning version.",
          why: "These mechanisms propagate whichever version has already won. They do not decide the merge semantics, so they complement one of the other strategies rather than replace it.",
        },
      ],
      answer: "c",
    },
    {
      id: "cap-minority-client-errors",
      chapter: "sysdes-cap-theorem-depth",
      level: "advanced",
      skill: "diagnose",
      section: "what-cp-actually-looks-like-from-the-client-s-seat",
      kind: "single",
      prompt:
        "<p>A five-node leader-based store is split 3 | 2 by a network fault. Clients on the three-node side work normally. A client pinned to the two-node side gets an error on every write for the whole partition. On-call asks whether data is being lost or the cluster is misconfigured. What is the right reading?</p>",
      choices: [
        {
          id: "a",
          text: "Expected: the minority has no quorum, so it refuses writes and loses nothing acknowledged.",
          why: "Committing needs a majority, which is three of five, and the minority cannot form one. The client gets an error instead of a wrong answer, which is the CP contract.",
        },
        {
          id: "b",
          text: "A misconfiguration, because any two nodes in a five-node cluster should be able to elect a leader.",
          why: "A leader needs votes from a majority of the cluster, which is three of five. If two nodes could elect their own leader, the two sides could accept conflicting writes.",
        },
        {
          id: "c",
          text: "Expected, but the minority is buffering the writes and acknowledging them to apply on heal.",
          why: "Acknowledging a write that has not been committed by a quorum would be AP behaviour. This client is getting errors, so no write is being acknowledged on the minority side.",
        },
        {
          id: "d",
          text: "Data loss, because the minority's acknowledged writes will be discarded when the partition heals.",
          why: "The minority never acknowledged any write to this client. Entries it could not commit are not promised to anyone, so nothing acknowledged is lost on heal.",
        },
      ],
      answer: "a",
    },
    {
      id: "cap-wan-quorum-floor",
      chapter: "sysdes-cap-theorem-depth",
      level: "advanced",
      skill: "estimate",
      section: "pacelc-the-framing-that-actually-predicts-database-behaviour",
      kind: "single",
      prompt:
        "<p>A three-replica store commits a write once a majority, the leader plus one follower, has stored it. The leader is in us-east and sends to both followers in parallel. Assume the round trip to the us-west follower is 65 ms and to the eu-west follower is 80 ms, and ignore disk, CPU and queueing. With no partition, what is the minimum time replication adds to each write?</p>",
      choices: [
        {
          id: "a",
          text: "80 ms, the slowest follower's round trip",
          why: "The leader needs only one follower for a majority, so it does not wait for the slowest. Waiting on all replicas is a different configuration with different availability.",
        },
        {
          id: "b",
          text: "145 ms, the two round trips one after the other",
          why: "The leader sends to both followers in parallel, so the round trips overlap rather than add up. Sequential replication would also be unnecessarily slow.",
        },
        {
          id: "c",
          text: "About 33 ms, the one-way delay to the nearest follower",
          why: "The leader cannot commit until the follower's acknowledgement returns, so the full round trip counts, not just the outbound half.",
        },
        {
          id: "d",
          text: "65 ms",
          why: "The second member of the majority is the nearest follower, and the leader must wait for its acknowledgement to come back, which is one full round trip. This is the latency a linearizable write pays even with no partition.",
        },
      ],
      answer: "d",
    },
    {
      id: "cap-raft-rejoin-disruption",
      chapter: "sysdes-cap-theorem-depth",
      level: "advanced",
      skill: "diagnose",
      section: "what-cp-actually-looks-like-from-the-client-s-seat",
      kind: "single",
      prompt:
        "<p>A five-node Raft cluster without PreVote is split 3 | 2. The two isolated nodes cannot win an election, so each keeps timing out, becoming a candidate and raising its term. When the partition heals, the healthy leader on the three-node side steps down, which forces a needless election and a short write stall. Which change addresses this?</p>",
      choices: [
        {
          id: "a",
          text: "Raise the election timeout, so the isolated nodes raise their terms less often.",
          why: "They would still raise their terms each time they time out, so a rejoining node can still disrupt the leader. It also makes genuine failovers slower.",
        },
        {
          id: "b",
          text: "Enable PreVote, so a node tests whether it could win before raising its term.",
          why: "A node on the minority side asks whether peers would vote for it first, gets too few yes answers, and keeps its term. Nothing inflated is left to disrupt the leader on rejoin.",
        },
        {
          id: "c",
          text: "Let the two-node side accept writes while isolated, so it stops holding elections.",
          why: "That gives up the consistency the cluster exists to provide, because the two sides could then commit conflicting histories. Raft commits only with a majority.",
        },
        {
          id: "d",
          text: "Add a sixth node, so that neither side of a split is ever in the minority.",
          why: "A majority of six is four, so a 3 | 3 split leaves neither side able to commit. An even-sized cluster tolerates no more failures than the odd size below it.",
        },
      ],
      answer: "b",
    },
  ],
};
