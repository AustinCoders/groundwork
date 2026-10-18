import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "ft-retry-attempts-at-db",
      chapter: "sysdes-fault-tolerance",
      level: "advanced",
      skill: "estimate",
      section: "retries-backoff-jitter-and-how-naive-retries-kill-you",
      kind: "single",
      prompt:
        "<p>An edge layer calls service A, A calls service B, and B calls a database. Each of those three layers calls the tier below it with up to 4 attempts (the first try plus 3 retries), and the database fails every attempt. Counting attempts the way the chapter does, how many requests reach the database for one user request?</p>",
      choices: [
        {
          id: "a",
          text: "12, because each layer adds 4 attempts to the total",
          why: "Retries nest. Every attempt made by an upper layer triggers a complete set of attempts in the layer below it, so the counts multiply rather than add.",
        },
        {
          id: "b",
          text: "27, because three layers each retry three times",
          why: "This treats 3 retries as 3 attempts. The first try counts too, so each layer makes 4 attempts, and the chapter's caption says to count attempts, not retries.",
        },
        {
          id: "c",
          text: "64, because attempts multiply across layers",
          why: "Four attempts at each of three nested layers gives 4 × 4 × 4 = 64, the same arithmetic as the Google SRE book's example. The database receives the full product precisely when it is already struggling.",
        },
        {
          id: "d",
          text: "256, because four layers of 4 attempts each compound",
          why: "Only three layers retry in this setup (edge, A and B). The database is the callee, not a retrying layer, so the exponent is 3, not 4.",
        },
      ],
      answer: "c",
    },
    {
      id: "ft-breaker-success-path",
      chapter: "sysdes-fault-tolerance",
      level: "advanced",
      skill: "sequence",
      section: "circuit-breakers",
      kind: "order",
      prompt:
        "<p>A circuit breaker protects a dependency that fails for a while and then recovers. Put these steps in the order the chapter's state machine follows on the path where the first trial call succeeds.</p>",
      items: [
        {
          id: "trip",
          text: "The failure rate over the rolling window crosses the threshold with enough calls recorded, and the breaker trips",
        },
        {
          id: "open",
          text: "While open, calls fail immediately without touching the network and the fallback is returned",
        },
        {
          id: "half",
          text: "After the cooldown, the breaker goes half-open and admits a small, capped number of trial calls",
        },
        {
          id: "close",
          text: "The trial call succeeds, the breaker closes, and normal traffic resumes",
        },
      ],
      why: "A closed breaker only trips once the rolling window holds enough calls and the failure rate crosses the threshold. Open means instant failure with a fallback, which is where threads are saved. Only after the cooldown does half-open admit a capped number of probes, and a successful probe closes the breaker. A failed probe would send it straight back to open instead.",
    },
    {
      id: "ft-health-check-empties-fleet",
      chapter: "sysdes-fault-tolerance",
      level: "advanced",
      skill: "diagnose",
      section: "graceful-degradation-and-load-shedding",
      kind: "single",
      prompt:
        "<p>Each node's load-balancer routing check calls <code>/health</code>, which runs a test query against the shared primary database. The database stalls for 20 seconds. Every node fails the check at once and the balancer pulls them all out of rotation (assume this balancer has no fail-open behavior). Users see errors even though every process is running and could serve cached pages. What is the flaw, and what is the fix?</p>",
      choices: [
        {
          id: "a",
          text: "The check is too shallow. Make it probe the cache and each downstream service too, so unhealthy nodes are caught sooner.",
          why: "Adding more dependencies to a routing check widens the set of things whose hiccup can empty the pool. It makes this failure more likely, not less.",
        },
        {
          id: "b",
          text: "The check depends on a shared dependency. Make it local to the node and alert on dependency health separately.",
          why: "When all nodes share a dependency, a blip in it makes them all fail together, which is the correlated failure the chapter warns about. A local check says whether this process can serve at all, and degradation on the request path handles the rest.",
        },
        {
          id: "c",
          text: "Too few nodes passed the check. Add nodes in more zones so some of them stay healthy during a database stall.",
          why: "New nodes run the same check against the same shared database, so they fail it at the same moment. Capacity does not help when the cause is a dependency that every node's check touches.",
        },
        {
          id: "d",
          text: "Have a probe restart any node that fails the same <code>/health</code> check, so nodes recover.",
          why: "A restart does not fix a stalled database, and the restarted nodes fail the same check again. Restarting a whole fleet at once can also drop in-flight requests and add reconnection load to a database that is already struggling.",
        },
      ],
      answer: "b",
    },
    {
      id: "ft-idempotency-key-design",
      chapter: "sysdes-fault-tolerance",
      level: "advanced",
      skill: "tradeoff",
      section: "idempotency-the-property-that-makes-retries-legal",
      kind: "multi",
      prompt:
        "<p>You are adding client-generated idempotency keys to an endpoint that records payments in your own database, following the approach in the chapter. Select every design decision that belongs to it.</p>",
      choices: [
        {
          id: "a",
          text: "Store the response alongside the key and return that stored response when the same key is replayed.",
          why: "Storing the response, not just a seen flag, means a retry receives the same order ID the first attempt produced instead of an error such as a 409.",
        },
        {
          id: "b",
          text: "Insert the key under a unique constraint, in the same transaction as the effect, so a racing duplicate loses the insert.",
          why: "The unique constraint makes the database decide the race. Because the insert shares a transaction with the effect, the key exists exactly when the effect does.",
        },
        {
          id: "c",
          text: "Scope each key to a customer and an endpoint, and let keys be pruned after a retention period.",
          why: "Scoping stops a key from being replayed against a different operation, and a retention period keeps the key store from growing without bound. The chapter cites 24 hours as Stripe's v1 figure.",
        },
        {
          id: "d",
          text: "Look the key up first, and run the effect only if it is absent, recording the key afterwards.",
          why: "Two retries can both find the key absent and both run the effect. A read-then-write check is a race, which is the weakness the unique-constraint insert removes.",
        },
        {
          id: "e",
          text: "Generate a fresh key for every retry attempt, so the server can tell the attempts apart.",
          why: "A key identifies one logical operation, not one attempt. A new key per attempt makes the server treat each retry as a new operation, so duplicates go through.",
        },
      ],
      answers: ["a", "b", "c"],
    },
    {
      id: "ft-stuck-after-cache-restart",
      chapter: "sysdes-fault-tolerance",
      level: "advanced",
      skill: "diagnose",
      section: "retries-backoff-jitter-and-how-naive-retries-kill-you",
      kind: "single",
      prompt:
        "<p>A cache tier restarted, every request missed, and the database saturated. The restart finished 40 minutes ago and the cache is running again, with incoming traffic at its normal level. Yet the database is still saturated, most calls time out, and clients keep retrying. Which action does the chapter name as a way out?</p>",
      choices: [
        {
          id: "a",
          text: "Wait, because the trigger is gone and the system will drain its backlog on its own soon.",
          why: "In a metastable state the retries and cache misses have become the cause, so the overload can sustain itself after the original trigger is gone. Waiting can leave it stuck indefinitely.",
        },
        {
          id: "b",
          text: "Raise the client timeouts and retry counts so that more of the requests eventually succeed.",
          why: "Longer timeouts and more retries add load to the tier that is already saturated. That strengthens the feedback loop keeping the system down.",
        },
        {
          id: "c",
          text: "Roll back the restart's change, since undoing the trigger restores the healthy state.",
          why: "The trigger has already ended. The system is now held in the bad state by its own load amplification, so reversing the trigger no longer changes anything.",
        },
        {
          id: "d",
          text: "Shed traffic below normal and disable retries, then ramp back up as the cache refills.",
          why: "Pushing the offered load below the level the database can serve breaks the loop, lets the backlog drain and the cache repopulate, and a slow ramp avoids tipping it over again.",
        },
      ],
      answer: "d",
    },
    {
      id: "ft-shared-pool-starves-checkout",
      chapter: "sysdes-fault-tolerance",
      level: "advanced",
      skill: "tradeoff",
      section: "bulkheads-and-resource-isolation",
      kind: "single",
      prompt:
        "<p>One service process serves checkout and a recommendations widget from a single shared pool of 90 worker threads. The recommendations dependency starts hanging, and each call holds a worker until its 30-second timeout. Soon checkout requests wait for a worker, although the checkout path never touches recommendations. Which change stops a slow dependency from using up workers that other paths need, whatever its timeout is?</p>",
      choices: [
        {
          id: "a",
          text: "Give checkout and recommendations separate bounded pools, so each holds only its own share.",
          why: "A bulkhead caps what any one dependency can consume, so a flooded compartment does not sink the vessel. The cost is a little peak efficiency, in exchange for a bounded blast radius.",
        },
        {
          id: "b",
          text: "Grow the shared pool from 90 to 500 threads, so slow calls have far more room before they fill it.",
          why: "A bigger shared pool only raises the number of hung calls needed to fill it, and a dependency that holds workers for 30 seconds can still fill any shared pool. Each extra thread also costs memory.",
        },
        {
          id: "c",
          text: "Retry each recommendations call up to three times, so one attempt is likely to find a free worker.",
          why: "Retrying a call to a hanging dependency means each attempt holds another worker for its timeout. It adds load and widens the starvation.",
        },
        {
          id: "d",
          text: "Cut the checkout call's own timeout to 5 seconds, so checkout gives up before it is starved.",
          why: "A timeout on checkout's downstream call usually does not start until a worker has picked the request up, and it frees none of the workers held by recommendations. Checkout still has no thread to run on.",
        },
      ],
      answer: "a",
    },
    {
      id: "ft-stale-leader-write",
      chapter: "sysdes-fault-tolerance",
      level: "advanced",
      skill: "concept",
      section: "failover-has-its-own-failure-modes",
      kind: "single",
      prompt:
        "<p>A database leader pauses for 30 seconds in a long garbage collection. Followers stop hearing its heartbeat and promote a new leader. The old leader wakes up still believing it leads and sends a write to the shared storage service. Which mechanism lets the storage service itself refuse that write?</p>",
      choices: [
        {
          id: "a",
          text: "A shorter heartbeat timeout, so a paused leader is replaced before it can wake up and write.",
          why: "A pause can last any length, and a shorter timeout mostly causes more false failovers. A replaced leader can still wake up later holding stale beliefs, so the write is not refused.",
        },
        {
          id: "b",
          text: "The old leader checking its own lease immediately before every write it sends to storage.",
          why: "The pause can strike after the check and before the write is sent, so a stale write still goes out. Only the storage side can reliably reject it.",
        },
        {
          id: "c",
          text: "A token that rises with each promotion, checked by storage so older ones are rejected.",
          why: "This is the fencing token. The new leader holds a higher number, so the storage service can refuse the old leader's write even though the old leader still believes it leads.",
        },
        {
          id: "d",
          text: "Synchronous replication to the standby, so that no acknowledged write is lost in the failover.",
          why: "Synchronous replication bounds data loss, which is the RPO question. It does not tell the storage service which writer is currently legitimate, so it does not stop split brain.",
        },
      ],
      answer: "c",
    },
    {
      id: "ft-deadline-propagation",
      chapter: "sysdes-fault-tolerance",
      level: "advanced",
      skill: "diagnose",
      section: "timeouts-no-timeout-is-a-bug",
      kind: "single",
      prompt:
        "<p>A request crosses five services in a chain, and each service gives its call to the next a fresh 1-second timeout. The user's app stops waiting after 2 seconds, yet traces show the downstream services still working on that request several seconds later. Which change addresses this directly?</p>",
      choices: [
        {
          id: "a",
          text: "Raise every hop's timeout to 5 seconds, so slow calls finish and the work is not thrown away.",
          why: "Longer timeouts hold threads and connections for longer, and nobody is waiting for the result anyway. The work is wasted because the budget was never shared, not because the timeouts were short.",
        },
        {
          id: "b",
          text: "Pass the remaining time budget down, each hop subtracting its own elapsed time.",
          why: "Propagating the deadline lets every hop see how long the user will actually wait, and refuse to start work that cannot finish in time. Restarting the clock at each hop is what lets the chain outlive the caller.",
        },
        {
          id: "c",
          text: "Let the last service retry its work until it succeeds, so the effort already spent is not lost.",
          why: "Retrying work whose caller has gone adds load without helping anyone, because a result with no one waiting for it is useless. It is also unsafe unless the operation is idempotent.",
        },
        {
          id: "d",
          text: "Drop the timeouts on the inner hops and keep only the user app's 2-second limit.",
          why: "The app giving up does not cancel work in the services behind it. Without their own deadlines, inner calls to a hung service can block indefinitely and exhaust resources.",
        },
      ],
      answer: "b",
    },
  ],
};
