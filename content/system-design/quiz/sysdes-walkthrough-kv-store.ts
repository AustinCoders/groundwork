import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "kv-nodes-from-throughput",
      chapter: "sysdes-walkthrough-kv-store",
      level: "advanced",
      skill: "estimate",
      section: "capacity-estimation",
      kind: "single",
      prompt:
        "<p>A key-value store keeps N = 3 replicas of every key. At peak it serves 120,000 reads and 40,000 writes per second. The coordinator sends each read to R = 2 replicas (one full read, one digest) and each write to all 3 replicas. Take 10,000 operations per second per node as a planning figure and plan to run nodes at 70% of it. What is the smallest whole number of nodes whose usable throughput covers the peak?</p>",
      choices: [
        {
          id: "a",
          text: "36 nodes",
          why: "This divides 360,000 replica operations by the full 10,000 per node, so it plans to run every node flat out. The stem asks for 70%, which leaves headroom for compaction, repair and spikes.",
        },
        {
          id: "b",
          text: "40 nodes",
          why: "This counts each write once, as 40,000 operations, instead of once per replica. A write is stored on all 3 replicas, so it is 3 units of node work.",
        },
        {
          id: "c",
          text: "52 nodes",
          why: "Reads cost 120,000 × 2 = 240,000 replica reads and writes cost 40,000 × 3 = 120,000 replica writes, 360,000 in total. Usable throughput is 10,000 × 0.7 = 7,000 per node, and 360,000 ÷ 7,000 is about 51.4, so 52 whole nodes.",
        },
        {
          id: "d",
          text: "69 nodes",
          why: "This is what you get if the coordinator asks all three replicas on every read, as the Dynamo paper's coordinator does. The stem sends each read to R = 2 replicas only, so the read cost is 2 per read, not 3.",
        },
      ],
      answer: "c",
    },
    {
      id: "kv-quorum-settings",
      chapter: "sysdes-walkthrough-kv-store",
      level: "advanced",
      skill: "tradeoff",
      section: "the-request-path-who-coordinates-and-what-a-quorum-costs",
      kind: "multi",
      prompt:
        "<p>A store has N = 3 replicas per key and uses strict quorums. Select every (W, R) setting where a read is guaranteed to overlap the replicas of the latest acknowledged write, <em>and</em> a write still succeeds while one replica is down. Judge only those two conditions; set aside what happens to reads when a replica is down.</p>",
      choices: [
        {
          id: "a",
          text: "W = 2, R = 2",
          why: "R + W = 4 is greater than 3, so any 2 replicas read must share a replica with any 2 written. A write needs 2 of 3, so one replica may be down.",
        },
        {
          id: "b",
          text: "W = 3, R = 1",
          why: "The overlap holds because 3 + 1 is greater than 3, but a write must reach all 3 replicas, so a single dead replica blocks every write. It meets the first condition and fails the second.",
        },
        {
          id: "c",
          text: "W = 1, R = 3",
          why: "R + W = 4, so a read overlaps, and a write needs only 1 replica, so it survives even two failures. Reads now need all 3 replicas, which the stem tells you to set aside, but it is the cost of this choice.",
        },
        {
          id: "d",
          text: "W = 1, R = 1",
          why: "R + W = 2 is not greater than 3, so a read can land on a replica that never saw the write. Writes are easy to land, but the overlap guarantee is gone.",
        },
        {
          id: "e",
          text: "W = 2, R = 1",
          why: "R + W = 3 equals N rather than exceeding it, so a one-replica read can hit the one replica a two-replica write missed. Overlap needs a strict inequality.",
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "kv-lost-concurrent-write",
      chapter: "sysdes-walkthrough-kv-store",
      level: "advanced",
      skill: "diagnose",
      section: "versioning-vector-clocks-against-last-write-wins",
      kind: "single",
      prompt:
        "<p>A store compares conflicting versions of a key by timestamp, assigned by the application servers. Two users edit the same key within a few milliseconds, each through a different coordinator, and both writes are acknowledged. Afterwards every replica holds the same single value, and every quorum read returns it. One user reports that their edit vanished. What explains this?</p>",
      choices: [
        {
          id: "a",
          text: "A hint expired before delivery, so one replica never received the second write.",
          why: "An expired hint leaves a replica behind, so replicas would disagree until repair runs. Here all replicas agree on one value, which means both writes arrived and one lost the comparison.",
        },
        {
          id: "b",
          text: "R + W was not greater than N, so the reads missed the newer write.",
          why: "A read that misses a newer write shows up as stale answers from some replicas, whereas here every replica holds one value. Even with R + W above N a read only overlaps the latest write; it does not merge two concurrent ones.",
        },
        {
          id: "c",
          text: "Read repair copied the older value over the newer one on a stale replica.",
          why: "Read repair reconciles by timestamp and writes the newer value to stale replicas, not the other way round, so it cannot turn a newer value into an older one.",
        },
        {
          id: "d",
          text: "Last write wins kept the higher timestamp and dropped the other write.",
          why: "Last write wins does not detect concurrency. It keeps the higher timestamp, and the writer of the other value is not told. Causal metadata such as a vector clock would have kept both versions for a reader to merge.",
        },
      ],
      answer: "d",
    },
    {
      id: "kv-repair-unread-keys",
      chapter: "sysdes-walkthrough-kv-store",
      level: "advanced",
      skill: "concept",
      section: "failure-handling-in-three-layers",
      kind: "single",
      prompt:
        "<p>A Cassandra node was down for a day, longer than the default 3-hour hint window, and has just returned. It missed writes to a very large set of keys, and no client reads most of those keys. Which mechanism is able to find and fix the missing data for keys that nobody reads?</p>",
      choices: [
        {
          id: "a",
          text: "Hinted handoff replay from the coordinators that took the writes.",
          why: "Coordinators stop creating new hints once a node has been dead longer than the hint window, so most of the missed writes have no hint to replay. Hints are also best effort and do not guarantee eventual consistency.",
        },
        {
          id: "b",
          text: "Merkle-tree anti-entropy repair between replicas.",
          why: "Replicas compare hash trees over the ranges they share and stream only the ranges that differ, with no client read involved. It is the layer for data nobody reads, and it has to be scheduled inside the tombstone grace period.",
        },
        {
          id: "c",
          text: "Read repair on the read path.",
          why: "Read repair only fixes the replicas involved in a read of that key. If no client reads a key it is never triggered, and it does nothing at consistency level ONE.",
        },
        {
          id: "d",
          text: "A sloppy quorum on the writes that were missed.",
          why: "A sloppy quorum chooses stand-in nodes at write time. It does not scan for differences afterwards, so it cannot repair writes that were already missed.",
        },
      ],
      answer: "b",
    },
    {
      id: "kv-commit-log-power-loss",
      chapter: "sysdes-walkthrough-kv-store",
      level: "advanced",
      skill: "tradeoff",
      section: "the-storage-node-a-commit-log-a-memtable-and-immutable-files",
      kind: "single",
      prompt:
        "<p>A Cassandra cluster uses N = 3 with replicas in three zones and the default commit-log sync mode (<code>periodic</code>, every 10,000 ms). A write at QUORUM is acknowledged by two nodes. Before its next fsync, one of those two nodes loses power. No other node fails. What is the position on that write?</p>",
      choices: [
        {
          id: "a",
          text: "It is missing on that node only; the other acknowledging node still holds it.",
          why: "Periodic mode acknowledges before the fsync, so the crashed node can lose up to its sync window. The write was also stored by the second acknowledging node in another zone, so the cluster still has it and repair can copy it back.",
        },
        {
          id: "b",
          text: "It is lost from the cluster, because acknowledgement came before the data reached disk.",
          why: "Acknowledgement before fsync is how periodic mode works, but the quorum means at least two nodes accepted the write. One machine failure cannot remove both copies.",
        },
        {
          id: "c",
          text: "It could not have been acknowledged, because acknowledgement waits for the next fsync.",
          why: "That describes batch mode, which does not acknowledge a write until the commit log is flushed to disk. Periodic mode acknowledges immediately and syncs on a timer.",
        },
        {
          id: "d",
          text: "The coordinator kept a hint for the failed node and will replay it on return.",
          why: "A hint is stored when a replica is unreachable at write time. This node was reachable and acknowledged, so no hint exists for it.",
        },
      ],
      answer: "a",
    },
    {
      id: "kv-preference-list-rule",
      chapter: "sysdes-walkthrough-kv-store",
      level: "advanced",
      skill: "concept",
      section: "partitioning-the-ring-and-its-settings",
      kind: "single",
      prompt:
        "<p>A Dynamo-style ring uses virtual nodes, so one machine owns many positions. With N = 3, walking clockwise from a key's hash gives positions owned by machines X, X, Y, Z, X in that order. Which rule builds the key's preference list?</p>",
      choices: [
        {
          id: "a",
          text: "Take the next three positions clockwise, whichever machines happen to own them.",
          why: "That follows ring adjacency, and here it would put two copies on X. One failure of X would then remove two of the three replicas, so N would not mean three machines.",
        },
        {
          id: "b",
          text: "Hash the key three times with different functions and use the owner of each point.",
          why: "Multiple hash functions are a real placement scheme in other systems, but not how this preference list is built. Nothing stops two of the points landing on the same machine or zone.",
        },
        {
          id: "c",
          text: "Skip positions on already-chosen machines until three distinct ones are found.",
          why: "Here that gives X, Y and Z. The list is chosen for failure-domain diversity rather than ring adjacency, and in practice it is extended to racks and zones.",
        },
        {
          id: "d",
          text: "Choose the three machines with the most free disk, starting at the coordinator.",
          why: "Placement is a function of the key's position on the ring, so any node can compute it. Choosing by free disk would need a central view of load and would change as disks fill.",
        },
      ],
      answer: "c",
    },
    {
      id: "kv-write-path-order",
      chapter: "sysdes-walkthrough-kv-store",
      level: "advanced",
      skill: "sequence",
      section: "the-storage-node-a-commit-log-a-memtable-and-immutable-files",
      kind: "order",
      prompt:
        "<p>A storage node has received a mutation. Put the stages in the order the data passes through them in a Cassandra-style write path. The log is written before the memtable so that the write can be replayed after a crash.</p>",
      items: [
        { id: "log", text: "The mutation is appended to the commit log" },
        { id: "memtable", text: "The mutation is inserted into the sorted in-memory memtable" },
        { id: "flush", text: "The memtable is flushed to disk as an immutable SSTable" },
        { id: "compact", text: "Compaction merges several SSTables and rewrites them" },
      ],
      why: "The append to the commit log makes the write recoverable, and the memtable insert makes it readable and sorted. Only when the memtable is full or the log is near its limit is it flushed to an immutable SSTable, and compaction then merges SSTables in the background, which is the write amplification the capacity estimate charged for.",
    },
  ],
};
