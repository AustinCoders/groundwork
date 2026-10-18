import type { DesignDrill } from "../../drill-types";

export const drill: DesignDrill = {
  chapter: "sysdes-walkthrough-kv-store",
  level: "advanced",
  title: "Design a key-value store for session and cart data",
  prompt: `<p>"Our product teams keep asking for one place to put per-user session and cart data, and they want it to keep taking writes when a machine or a zone is down. Design the key-value store behind it. <code>get(key)</code> returns the stored value, or several if the store holds conflicting ones, plus an opaque version token. <code>put(key, value, token)</code> writes a value, passing back the token from the read when there is one. Walk me through the design, and tell me what happens when a node is down for a day."</p>
<p><b>In scope:</b> single-key reads and writes, sizing the cluster, and failure handling. <b>Out of scope:</b> multi-key transactions, secondary indexes, range scans, multi-region deployment and authentication.</p>
<p>Planning assumptions (figures for this exercise, not facts about any real service):</p>
<ul>
  <li>2 billion keys, average value 1 KB, no value larger than 1 MB.</li>
  <li>Every key is stored on N = 3 replicas, and the cluster spans 3 availability zones with the same number of nodes in each.</li>
  <li>Peak load is 60,000 reads and 30,000 writes per second.</li>
  <li>Each read is sent to 2 replicas (R = 2) and each write is sent to all 3 replicas.</li>
  <li>One node handles 10,000 replica operations per second, and you plan to run nodes at 60% of that.</li>
  <li>Each node has 2 TB of disk, filled to at most 50%.</li>
  <li>The store must keep accepting writes while one replica, or one whole zone, is unreachable.</li>
</ul>`,
  checklist: [
    {
      id: "check-size-from-throughput",
      text: "Derives 60,000 × 2 + 30,000 × 3 = 210,000 replica operations a second, divides by 6,000 usable per node to get 35 nodes (36 once each zone must hold the same number, 12 per zone), and compares it with the disk need (6 TB over 1 TB usable per node is 6 nodes), so throughput sets the size.",
      section: "capacity-estimation",
    },
    {
      id: "check-replicas-across-zones",
      text: "Chooses each key's three replicas so that they sit in three different zones, for example by walking a hash ring and skipping positions until three distinct zones are found. Says why adjacent ring positions are not enough.",
      section: "partitioning-the-ring-and-its-settings",
    },
    {
      id: "check-who-coordinates",
      text: "Says which node coordinates a request: a client library that routes straight to a replica of the key, or any node that accepts the request and either coordinates it or forwards it. Names the trade, such as an extra hop against client-side code.",
      section: "the-request-path-who-coordinates-and-what-a-quorum-costs",
    },
    {
      id: "check-choose-write-quorum",
      text: "Justifies W against R = 2 and N = 3: W = 2 makes strict quorums overlap and still succeeds with one replica down. A lower W or a sloppy quorum is acceptable if the answer says which overlap guarantee is given up.",
      section: "the-request-path-who-coordinates-and-what-a-quorum-costs",
    },
    {
      id: "check-merge-siblings",
      text: "Has the client pass the token from get back on put as causal context, and merge any conflicting versions it was given and write the merged value back. Notes that the merge needs a rule for deletes, because deleted items can resurface.",
      section: "versioning-vector-clocks-against-last-write-wins",
    },
    {
      id: "check-hinted-handoff",
      text: "Says what happens to a write while a replica is unreachable: a hinted copy is held, by a stand-in node under a sloppy quorum or by the coordinator under a strict one, and delivered when the replica returns.",
      section: "failure-handling-in-three-layers",
    },
    {
      id: "check-repair-what-hints-missed",
      text: "Says that after a long outage, or when a hint is lost or bounded by a window or storage limit, read repair fixes only the keys that get read, so a full anti-entropy repair with Merkle trees is needed for the rest.",
      section: "failure-handling-in-three-layers",
    },
    {
      id: "check-throttle-recovery",
      text: "Throttles hint replay and repair streaming into a node that has just returned, because it is cold and would otherwise be flooded by both at the same moment.",
      section: "follow-ups-and-failure-modes-to-volunteer",
    },
  ],
  mistakes: [
    {
      id: "mistake-hash-mod-n",
      text: "Maps keys to nodes with hash(key) mod the node count. Changing the count gives most keys a new owner, so adding or losing a node forces a large data move, whereas ring tokens move only the ranges next to the change.",
      section: "partitioning-the-ring-and-its-settings",
    },
    {
      id: "mistake-write-all-replicas",
      text: "With strict quorums, sets W equal to N to be safe. Every write then needs every replica, so one unreachable replica, such as the copy in a failed zone, blocks all writes to its keys and the store is no longer writable during the outage.",
      section: "the-request-path-who-coordinates-and-what-a-quorum-costs",
    },
    {
      id: "mistake-quorum-means-linearizable",
      text: "Treats R + W > N as making reads linearizable. Overlap with the latest acknowledged write does not order concurrent operations and does not hold for a sloppy quorum, so reads can still be stale or return conflicting versions.",
      section: "recognizing-it-in-an-unseen-problem",
    },
    {
      id: "mistake-timestamps-for-mergeable-data",
      text: "Resolves concurrent writes by timestamp when updates need to be combined, as with a cart. Last write wins keeps one value and discards the other, and clock skew can keep the earlier one. It is acceptable where losing a concurrent update does not matter, as with session state, but not for a cart.",
      section: "versioning-vector-clocks-against-last-write-wins",
    },
  ],
};
