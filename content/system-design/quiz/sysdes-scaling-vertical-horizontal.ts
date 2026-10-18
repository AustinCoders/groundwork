import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "sc-session-logout",
      chapter: "sysdes-scaling-vertical-horizontal",
      level: "beginner",
      skill: "diagnose",
      section: "what-horizontal-scaling-takes-away",
      kind: "single",
      prompt:
        "<p>A web app kept login sessions in a map inside the server process and worked fine on one server. After a second identical server was added behind a round-robin load balancer, some users are logged out on the very next click after logging in. CPU on both servers is around 20%. What is the most likely cause?</p>",
      choices: [
        {
          id: "a",
          text: "Clock skew between the two servers makes one of them treat a freshly created session as already expired.",
          why: "Skew can shorten an expiry, but it would not depend on which server answers, and it would not appear only after logging in. The symptom follows the routing of requests, not the time on the clock.",
        },
        {
          id: "b",
          text: "Replication lag means the second server reads the session from a database replica that has not caught up.",
          why: "The sessions here live in process memory, so no database read is involved at all. Lag is a replica problem and does not apply to a map inside one server.",
        },
        {
          id: "c",
          text: "The session exists only in the memory of the server that handled the login, and the next request lands on the other server.",
          why: "In-process state is per node. With round-robin routing, the second request often reaches a server that has never seen this session, so it treats the user as logged out. The fix is to move the session out of the process, not to add capacity.",
        },
        {
          id: "d",
          text: "The database connection pool is exhausted, so the session lookup times out and the request is rejected with a login error.",
          why: "A pool problem would show up as errors or slowness for everyone and would not be tied to a second server. It also does not explain why only the request after login fails while CPU stays low.",
        },
      ],
      answer: "c",
    },
    {
      id: "sc-second-node-reason",
      chapter: "sysdes-scaling-vertical-horizontal",
      level: "beginner",
      skill: "concept",
      section: "where-vertical-scaling-actually-hits-the-wall",
      kind: "single",
      prompt:
        "<p>Your estimate says the product will see about 1,200 writes per second and 300 reads per second on its database, with a dataset of a few hundred gigabytes. A teammate proposes running two database nodes from day one. Which reason for the second node holds up at these numbers?</p>",
      choices: [
        {
          id: "a",
          text: "Two database nodes double the write capacity, and 1,200 writes per second will soon outgrow a single node.",
          why: "A second node that replicates the first does not take any writes off it. Every write still runs on the primary and is replayed on the copy, so write capacity does not increase.",
        },
        {
          id: "b",
          text: "One node is a single failure domain, so a second node covers a crash or maintenance window even though load does not need it.",
          why: "Availability is the reason that applies at this size. A single box has no rolling maintenance and no tolerance for its own failure, and that usually binds long before capacity does.",
        },
        {
          id: "c",
          text: "At 1,200 writes per second a single primary is already past the point where the data has to be sharded.",
          why: "The chapter's planning figure is roughly 5,000 sustained writes per second before partitioning or queueing enters the conversation, and it is a planning figure, not a limit. 1,200 is well below it.",
        },
        {
          id: "d",
          text: "300 reads per second is more than one primary can comfortably serve, so a replica is needed for read throughput.",
          why: "A single indexed Postgres node serving cached working-set reads is planned at about 20,000 reads per second, so 300 is trivial. Read capacity is not the reason here.",
        },
      ],
      answer: "b",
    },
    {
      id: "sc-missing-index-first",
      chapter: "sysdes-scaling-vertical-horizontal",
      level: "beginner",
      skill: "tradeoff",
      section: "when-not-to-scale-out",
      kind: "single",
      prompt:
        "<p>During a sale, checkout latency climbs and the primary database sits at 95% CPU with low disk IOPS. The slow query log shows one query that scans a 40-million-row <code>orders</code> table to filter on <code>customer_id</code>, which has no index. Your goal is the cheapest, most reversible change that removes the load. What do you do first?</p>",
      choices: [
        {
          id: "a",
          text: "Shard the orders table by <code>customer_id</code> across several primaries.",
          why: "Sharding is a one-way door that brings cross-shard queries and resharding pain. It would spread a scan that should not exist, when the cause is a missing index.",
        },
        {
          id: "b",
          text: "Add five read replicas and send the checkout reads to them.",
          why: "Replicas would each run the same full scan, so you pay for more machines to do wasted work. They also introduce lag, which hurts a checkout page that needs fresh data.",
        },
        {
          id: "c",
          text: "Resize the primary to the largest instance class available.",
          why: "A bigger box buys time, but it needs a stop and start or a failover, and it leaves the full scan in place. It comes after the cheap fixes, not before them.",
        },
        {
          id: "d",
          text: "Create an index on <code>orders.customer_id</code> and re-measure.",
          why: "The measurement points at a specific query doing needless work, and an index is a small, reversible change that removes it. The chapter notes that one index has rescued more dying databases than any scaling technique.",
        },
      ],
      answer: "d",
    },
    {
      id: "sc-redis-extra-cores",
      chapter: "sysdes-scaling-vertical-horizontal",
      level: "beginner",
      skill: "diagnose",
      section: "where-vertical-scaling-actually-hits-the-wall",
      kind: "single",
      prompt:
        "<p>A Redis primary was resized from 8 vCPUs to 16 vCPUs during a short planned downtime. Afterwards its throughput ceiling barely moved. Monitoring shows one core pinned at 100%, the other cores nearly idle, and the network link at about 5% of its capacity. Redis runs commands on a single thread. What explains the result?</p>",
      choices: [
        {
          id: "a",
          text: "Command execution is single-threaded, so the extra cores sit idle behind one saturated thread.",
          why: "Doubling cores only helps work that can run in parallel. A single-threaded component caps throughput at what one core can do, which is the diminishing-returns wall of vertical scaling.",
        },
        {
          id: "b",
          text: "The network link is the bottleneck, so the CPU upgrade could not show through.",
          why: "The stem says the link is at about 5% of capacity, and one core is at 100%. The saturated resource is the CPU thread, not the network.",
        },
        {
          id: "c",
          text: "Replication lag on the replicas is throttling how fast the primary may accept commands.",
          why: "With asynchronous replication the primary does not slow down to wait for followers, and lag would not produce one pinned core with the others idle.",
        },
        {
          id: "d",
          text: "Garbage collection pauses grow with the larger heap and eat the added capacity.",
          why: "GC pauses are a real cost of large heaps in managed runtimes, but they would not show as one core at 100% with the rest idle. The pinned thread is the command loop itself.",
        },
      ],
      answer: "a",
    },
    {
      id: "sc-app-tier-sizing",
      chapter: "sysdes-scaling-vertical-horizontal",
      level: "beginner",
      skill: "estimate",
      section: "stateless-and-stateful-tiers-scale-differently",
      kind: "single",
      prompt:
        "<p>A stateless API tier sits behind a load balancer. In a load test, one instance sustains 800 requests per second at full CPU. Expected peak traffic is 12,000 requests per second. Your policy is that no instance may run above 60% of its tested throughput at peak, and you add no spare instance. Capacity grows linearly with instances. How many instances do you need?</p>",
      choices: [
        {
          id: "a",
          text: "9 instances",
          why: "This multiplies 12,000 by 0.6 and divides by 800. Headroom means each instance carries less than its tested rate, so you need more instances than the raw count, not fewer.",
        },
        {
          id: "b",
          text: "15 instances",
          why: "12,000 / 800 = 15 runs every instance at 100% of its tested throughput at peak. That ignores the 60% ceiling in the policy.",
        },
        {
          id: "c",
          text: "20 instances",
          why: "Twenty instances carry 12,000 / 20 = 600 requests per second each, which is 75% of the tested rate. That is above the 60% ceiling.",
        },
        {
          id: "d",
          text: "25 instances",
          why: "Each instance may carry 800 × 0.6 = 480 requests per second, and 12,000 / 480 = 25 exactly. Stateless tiers add capacity linearly, so the count follows directly.",
        },
      ],
      answer: "d",
    },
    {
      id: "sc-replica-write-work",
      chapter: "sysdes-scaling-vertical-horizontal",
      level: "beginner",
      skill: "estimate",
      section: "read-replicas-the-first-real-scaling-move-for-most-systems",
      kind: "single",
      prompt:
        "<p>A primary database takes 3,000 committed writes per second. You add 4 read replicas, and each replica replays every write the primary commits. Counting the primary and all four replicas, how many write operations are applied across the cluster per second?</p>",
      choices: [
        {
          id: "a",
          text: "3,000 in total, since the replicas share the primary's writes between them",
          why: "Replicas do not take over any writes. Every one of them replays the full write stream, so the cluster does more write work than the primary alone, not the same amount.",
        },
        {
          id: "b",
          text: "12,000 in total",
          why: "This counts only the four replicas and leaves out the primary, which still executes all 3,000 writes itself. The question counts all five nodes.",
        },
        {
          id: "c",
          text: "15,000 in total",
          why: "The primary applies 3,000 writes and each of the four replicas replays the same 3,000, so 5 × 3,000 = 15,000. Replicas add write work rather than absorbing it.",
        },
        {
          id: "d",
          text: "750 per node, since the 3,000 writes are divided across the four replicas",
          why: "That treats replicas like partitions that each own a slice of the writes. A replica is a full copy, so it applies all 3,000, and the primary still does too.",
        },
      ],
      answer: "c",
    },
    {
      id: "sc-fresh-own-write",
      chapter: "sysdes-scaling-vertical-horizontal",
      level: "beginner",
      skill: "tradeoff",
      section: "read-replicas-the-first-real-scaling-move-for-most-systems",
      kind: "multi",
      prompt:
        "<p>Users post a comment, are redirected to the page showing it, and sometimes the comment is missing. The page reads from an asynchronous replica that can lag by up to a second. Select every fix that makes a user see their own just-written comment.</p>",
      choices: [
        {
          id: "a",
          text: "Add more read replicas so that each replica has less to replay.",
          why: "Each replica replays the full write stream regardless of how many exist, so more replicas do not shorten lag. They add write work and leave the missing-comment bug in place.",
        },
        {
          id: "b",
          text: "For a short window after a user writes, send that user's reads to the primary.",
          why: "The primary always has the write, so the user cannot miss it. The window can be brief because lag is typically milliseconds to a couple of seconds, and other users keep using replicas.",
        },
        {
          id: "c",
          text: "Pin the user's session to the primary after the write.",
          why: "Reading from the node that took the write guarantees the change is visible. It costs primary capacity for those sessions, which is why it is paired with a time limit or used sparingly.",
        },
        {
          id: "d",
          text: "Make the load balancer send each user to one fixed replica every time.",
          why: "A fixed replica can still be behind the primary at the moment of the redirect. Stickiness makes the same replica answer repeatedly, but it says nothing about whether that replica has applied this write.",
        },
        {
          id: "e",
          text: "Record the position of the user's last write and read only from a replica that has reached it.",
          why: "Tracking a write timestamp or log position lets the router skip replicas that are behind. The user is served by a replica that has caught up, or by the primary if none has.",
        },
      ],
      answers: ["b", "c", "e"],
    },
    {
      id: "sc-before-sharding-order",
      chapter: "sysdes-scaling-vertical-horizontal",
      level: "beginner",
      skill: "sequence",
      section: "when-not-to-scale-out",
      kind: "order",
      prompt:
        "<p>A single primary database is CPU-bound during peak hours at modest traffic. Put these steps in the order the chapter's checklist works through them: measure first, then fixes that remove load, then buying hardware, with the one-way door last.</p>",
      items: [
        { id: "measure", text: "Measure which resource is saturated and which queries are responsible" },
        { id: "index", text: "Add the missing index the slow query log points to" },
        { id: "cache", text: "Put a cache in front of the hot reads" },
        { id: "resize", text: "Resize the primary to a larger instance" },
        { id: "shard", text: "Shard the data across several primaries" },
      ],
      why: "Measuring comes first, because every later step depends on knowing what is actually saturated. The checklist then removes load with the index and the cache, and only after those buys months with a bigger box, a one-line change. Sharding is a one-way door with hot keys, cross-shard queries and resharding, so it is the last resort.",
    },
  ],
};
