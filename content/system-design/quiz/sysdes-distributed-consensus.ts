import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "cn-one-leader-per-term",
      chapter: "sysdes-distributed-consensus",
      level: "advanced",
      skill: "concept",
      section: "raft-terms-elections-and-why-randomization-matters",
      kind: "single",
      prompt:
        "<p>In a five-node Raft cluster, two nodes time out together and both become candidates for the same term. Which fact is the reason they cannot both become leader of that term?</p>",
      choices: [
        {
          id: "a",
          text: "Candidates are ranked by node ID, and a lower-ranked candidate withdraws as soon as it hears from a higher-ranked one.",
          why: "Raft does not rank candidates. Its authors tried a ranking scheme and dropped it because it produced subtle availability problems, preferring randomized retries. Each candidate simply asks for votes.",
        },
        {
          id: "b",
          text: "A leader needs three votes, any two sets of three nodes share a member, and a member votes once per term.",
          why: "This is the set-overlap argument. Two majorities of one cluster must intersect, and the shared node can grant only one vote in a given term, so only one candidate can reach a majority.",
        },
        {
          id: "c",
          text: "A candidate that sees a rival's vote request in its own term gives up and asks the rival for its vote instead.",
          why: "A candidate has already voted for itself and refuses other requests for that term. Candidates step down only when they see a leader with a term at least as large as theirs, or a higher term. That is why votes can split.",
        },
        {
          id: "d",
          text: "Randomized election timeouts make it impossible for two nodes to time out within the same instant.",
          why: "Randomization makes simultaneous timeouts unlikely, not impossible, and the dry run in the chapter shows two candidates in one term. Safety must hold even when they collide, so it cannot rest on timing.",
        },
      ],
      answer: "b",
    },
    {
      id: "cn-smallest-group-two-down",
      chapter: "sysdes-distributed-consensus",
      level: "advanced",
      skill: "estimate",
      section: "cluster-sizing-always-odd-almost-always-3-or-5",
      kind: "single",
      prompt:
        "<p>A consensus group must keep committing writes while any two of its members are unavailable at the same time. A write commits once a majority of all members, counting those that are down, has stored it. What is the smallest group size that meets this requirement?</p>",
      choices: [
        {
          id: "a",
          text: "3 nodes",
          why: "A three-node group has a majority of 2. With two members down only one remains, so no write can reach a majority. It tolerates one failure.",
        },
        {
          id: "b",
          text: "4 nodes",
          why: "A four-node group has a majority of 3. With two members down only two remain, which is short of a majority. It tolerates one failure, the same as three nodes.",
        },
        {
          id: "c",
          text: "5 nodes",
          why: "A five-node group has a majority of 3. With two members down three remain, which is exactly a majority, and no smaller group manages that.",
        },
        {
          id: "d",
          text: "6 nodes",
          why: "A six-node group has a majority of 4, so it also survives two failures. But five nodes already do, so six is not the smallest, and every write now needs one more acknowledgement.",
        },
      ],
      answer: "c",
    },
    {
      id: "cn-lock-with-gc-pause",
      chapter: "sysdes-distributed-consensus",
      level: "advanced",
      skill: "diagnose",
      section: "in-practice-coordination-services-split-brain-and-fencing",
      kind: "single",
      prompt:
        "<p>A worker takes a leader lock backed by an etcd lease and then freezes for 30 seconds in a garbage-collection pause. The lease expires, a second worker acquires the lock and writes to an object store, and then the first worker wakes up and writes too, overwriting the second one's data. The etcd cluster behaved correctly throughout. Which change fixes the root cause?</p>",
      choices: [
        {
          id: "a",
          text: "Send the lock key's revision with each write; the store rejects lower values.",
          why: "The lock service cannot stop a stale holder from acting on a system that is not part of its protocol. A fencing token moves the check to the resource, which refuses any write carrying a lower number than one it has already seen.",
        },
        {
          id: "b",
          text: "Lengthen the lease to several minutes so that no realistic pause can outlast it.",
          why: "Pauses and delays have no firm upper bound, so some pause can still outlast any lease. A longer lease also delays failover when a holder really does die.",
        },
        {
          id: "c",
          text: "Have each worker re-check that its lease is still valid immediately before it sends every write.",
          why: "A pause can strike after the check and before the write reaches the store, so the stale write still gets through. The check is made by the one party that cannot know it has been paused.",
        },
        {
          id: "d",
          text: "Grow the etcd cluster from three to five members so that the lock itself is more available.",
          why: "More members make the lock service tolerate more failures, but the lock service was already correct here. The failure is that the object store has no way to reject a stale writer.",
        },
      ],
      answer: "a",
    },
    {
      id: "cn-rejoining-node-disrupts",
      chapter: "sysdes-distributed-consensus",
      level: "advanced",
      skill: "diagnose",
      section: "raft-terms-elections-and-why-randomization-matters",
      kind: "single",
      prompt:
        "<p>A five-node Raft cluster without extensions has a healthy leader. Node n5 loses its network link for ten minutes, timing out and starting elections the whole time, then reconnects. Moments later the leader steps down and a new election runs, though the other four nodes never had a problem. Which mechanism most directly prevents this?</p>",
      choices: [
        {
          id: "a",
          text: "Randomizing election timeouts over a wider range of values.",
          why: "Randomization reduces split votes when several nodes time out together. It does nothing to stop an isolated node from raising its term on every timeout, so the term it brings back is still too high.",
        },
        {
          id: "b",
          text: "Flushing currentTerm and votedFor to disk before replying to any request.",
          why: "Persistence stops a restarted node from voting twice in one term. That is a different failure. Here nothing restarted, and the damage comes from the inflated term n5 carries back.",
        },
        {
          id: "c",
          text: "Growing the cluster to seven nodes so that a single isolated node matters less.",
          why: "Cluster size changes the majority, not the term rule. A rejoining node with a higher term still makes any current leader step down, whatever the cluster size.",
        },
        {
          id: "d",
          text: "PreVote: ask peers whether they would vote before raising the term.",
          why: "Peers that still hear from a live leader refuse a pre-vote, so the isolated node never raises its term. The healthy leader then sees no higher term when n5 returns and no needless election happens.",
        },
      ],
      answer: "d",
    },
    {
      id: "cn-election-steps-in-order",
      chapter: "sysdes-distributed-consensus",
      level: "advanced",
      skill: "sequence",
      section: "raft-terms-elections-and-why-randomization-matters",
      kind: "order",
      prompt:
        "<p>Put the steps of one Raft election in the order the Raft paper describes them. Assume a single candidate, so the election succeeds on its first attempt with no competing candidate.</p>",
      items: [
        { id: "timeout", text: "A follower receives no heartbeat within its election timeout" },
        { id: "candidate", text: "It increments its term, becomes a candidate and votes for itself" },
        { id: "request", text: "It sends RequestVote to the other servers" },
        {
          id: "grant",
          text: "Each voter grants at most one vote for that term, to a candidate whose log is at least as up to date as its own",
        },
        { id: "win", text: "The candidate collects votes from a majority and becomes leader" },
        { id: "heartbeat", text: "The new leader sends heartbeats so that no further election starts" },
      ],
      why: "The timeout is what starts everything, and the candidate must raise its term and vote for itself before it asks anyone else, because the vote requests carry the new term. Voters then answer under the one-vote-per-term and log up-to-date rules. Only after a majority of grants arrive does the candidate become leader, and its first act is heartbeats to suppress other elections.",
    },
    {
      id: "cn-needs-consensus",
      chapter: "sysdes-distributed-consensus",
      level: "advanced",
      skill: "concept",
      section: "what-consensus-buys-and-where-you-actually-need-it",
      kind: "multi",
      prompt:
        "<p>For which of these is a consensus system the right tool, because every node must end up with the same answer and a split decision is a correctness failure rather than wasted work? Select every one.</p>",
      choices: [
        {
          id: "a",
          text: "Choosing which node is the single writer for a replicated database",
          why: "Two nodes that both believe they are the writer produce divergent data. Leader election is the textbook case of every node needing the same answer.",
        },
        {
          id: "b",
          text: "Agreeing on which nodes are in the cluster and who owns each shard",
          why: "A split view of membership is how two nodes both come to believe they own the same shard, so this is a value everyone must agree on.",
        },
        {
          id: "c",
          text: "Counting page views on an article page where an approximate total is acceptable",
          why: "When approximation is acceptable there is no single value all nodes must agree on. Mergeable counters or plain approximation are cheaper, and consensus would add a majority round trip to every increment.",
        },
        {
          id: "d",
          text: "Deciding which one worker runs a nightly billing job that must never run twice",
          why: "Running the job twice is a customer-visible incident, so exactly one holder must be agreed on. This is a lock or lease, which reduces to consensus.",
        },
        {
          id: "e",
          text: "Holding product pages in a cache in front of a database",
          why: "If two cache nodes hold the same page, that is merely redundant. Nothing breaks when copies differ briefly, so consensus would only add cost.",
        },
      ],
      answers: ["a", "b", "d"],
    },
    {
      id: "cn-stale-leader-reads",
      chapter: "sysdes-distributed-consensus",
      level: "advanced",
      skill: "tradeoff",
      section: "log-replication-and-the-commit-rule",
      kind: "single",
      prompt:
        "<p>A Raft-based store answers reads straight from the leader's local state. One leader is cut off from the other four nodes of a five-node cluster. They elect a new leader and accept writes, while the old leader keeps answering reads from its own state. Which change makes reads linearizable without relying on synchronized clocks?</p>",
      choices: [
        {
          id: "a",
          text: "Route every read to a follower, since followers keep a copy of the same replicated log.",
          why: "A follower can trail the leader's commit point, so it may return older data than a completed write. Reading a follower's local state without first confirming the leader's commit point can return stale data.",
        },
        {
          id: "b",
          text: "Confirm with a heartbeat round that a majority still follows the leader before answering.",
          why: "This is the read-index approach. A leader that is partitioned away cannot gather a majority, so it fails the check and refuses to answer instead of serving stale data. It needs no clock assumptions.",
        },
        {
          id: "c",
          text: "Have the leader fsync its log to disk before it answers every single read request.",
          why: "The old leader's disk is perfectly healthy. Flushing locally says nothing about whether a newer leader exists elsewhere, so the stale read is untouched.",
        },
        {
          id: "d",
          text: "Shorten the heartbeat interval so that a cut-off leader notices that it is isolated sooner.",
          why: "This narrows the window but does not remove it. A read can still arrive after the partition starts and before the leader's next failed heartbeat round, and it would be answered from stale state.",
        },
      ],
      answer: "b",
    },
  ],
};
