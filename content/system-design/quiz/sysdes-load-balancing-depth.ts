import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "lb-grpc-hotspot",
      chapter: "sysdes-load-balancing-depth",
      level: "intermediate",
      skill: "diagnose",
      section: "l4-vs-l7-what-only-l7-can-do",
      kind: "single",
      prompt:
        "<p>Service A (12 pods) calls service B (6 pods) over gRPC through a layer 4 TCP load balancer. Each A pod opens one long-lived connection and multiplexes thousands of calls over it. The balancer reports 2 connections on every B pod and all health checks pass. Yet one B pod runs at 90% CPU, two are nearly idle, and pods added by autoscaling receive almost no traffic. What explains this?</p>",
      choices: [
        {
          id: "a",
          text: "The balancing algorithm is wrong, and switching from round robin to least connections would even out the calls.",
          why: "Connection counts are already even at 2 per pod, so least connections would see nothing to correct. The imbalance is in calls per connection, which a layer 4 algorithm cannot observe.",
        },
        {
          id: "b",
          text: "The balancer chooses a backend once per connection, so every call on a connection stays on that backend.",
          why: "A layer 4 balancer decides when the connection is opened and then forwards bytes. With HTTP/2 or gRPC, one connection carries many calls, so a busy client pins a heavy stream of work on one pod, and new pods get no connections until clients reconnect. A layer 7 proxy that balances each request fixes it.",
        },
        {
          id: "c",
          text: "The backends need static weights that match their CPU, since the pods are not the same size.",
          why: "Weights adjust how many connections each pod receives, and the connection counts are already even. Weights cannot spread the calls inside a connection, and the stem gives no sign that pod sizes differ.",
        },
        {
          id: "d",
          text: "Health checks are ejecting the busy pods in turn, which leaves a few pods to absorb the traffic.",
          why: "The stem says every health check passes and every pod holds 2 connections, so nothing has been ejected. Ejection also would not explain why added pods stay idle.",
        },
      ],
      answer: "b",
    },
    {
      id: "lb-mod-n-miss-rate",
      chapter: "sysdes-load-balancing-depth",
      level: "intermediate",
      skill: "estimate",
      section: "consistent-hashing-properly",
      kind: "single",
      prompt:
        "<p>A cache tier of 4 nodes routes each key with <code>hash(key) mod 4</code> and runs at a 95% hit rate. Assume hash values and requests are spread uniformly. You add a fifth node and the routing becomes <code>hash(key) mod 5</code>. A key whose node changes finds an empty cache and misses. A key that stays put still misses 5% of the time. What is the overall miss rate right after the change?</p>",
      choices: [
        {
          id: "a",
          text: "24%",
          why: "That is the figure for a consistent hashing ring, where only about 20% of keys move. With mod-N the share that moves is much larger.",
        },
        {
          id: "b",
          text: "80%",
          why: "80% is the share of keys that change nodes, but the 20% that stay still miss at their normal 5% rate, so the overall figure is slightly higher.",
        },
        {
          id: "c",
          text: "81%",
          why: "A key keeps its node only when its hash modulo 4 equals its hash modulo 5, which is 4 values in every 20. So 80% move and miss, and the other 20% miss at 5%: 0.80 + 0.20 × 0.05 = 0.81. Origin load rises about 16 times from the 5% baseline.",
        },
        {
          id: "d",
          text: "5%",
          why: "That is the miss rate before the change. Adding a node under mod-N reassigns most keys, so the old hit rate does not carry over.",
        },
      ],
      answer: "c",
    },
    {
      id: "lb-algorithm-for-exports",
      chapter: "sysdes-load-balancing-depth",
      level: "intermediate",
      skill: "tradeoff",
      section: "algorithms-and-when-each-one-is-right",
      kind: "single",
      prompt:
        "<p>An API tier has 8 identical instances behind one layer 7 balancer that sees all the traffic. Most requests take about 20 ms, but a small share are report exports that run for 20 to 30 seconds. Fast requests are sometimes stuck waiting behind an export on the same instance. Assume each balancer-to-instance connection carries one request at a time. Which algorithm best prevents that?</p>",
      choices: [
        {
          id: "a",
          text: "Least connections",
          why: "It sends each new request to the instance with the fewest requests in flight, so an instance busy with a long export is avoided. With a single balancer seeing all traffic, its count of in-flight work is accurate.",
        },
        {
          id: "b",
          text: "Round robin",
          why: "Round robin takes turns without looking at what is in flight, so the next request can still land on an instance busy with an export. It works well only when request costs are roughly uniform.",
        },
        {
          id: "c",
          text: "Weighted round robin, with weights set from each instance's CPU count",
          why: "The instances are identical, so the weights would all be equal and the behaviour would match plain round robin. Static weights do not react to a long request already running.",
        },
        {
          id: "d",
          text: "Source-IP hash",
          why: "It ties each client address to one instance regardless of load, so a client that triggers an export keeps landing behind it. Many clients behind one NAT address would also pile onto the same instance.",
        },
      ],
      answer: "a",
    },
    {
      id: "lb-cascade-cpu",
      chapter: "sysdes-load-balancing-depth",
      level: "intermediate",
      skill: "estimate",
      section: "health-checks-active-passive-and-how-they-amplify-an-outage",
      kind: "single",
      prompt:
        "<p>A fleet of 10 identical backends each runs at 70% CPU. CPU use is proportional to the requests a backend handles, and total traffic stays constant and is spread evenly over the healthy backends. A traffic bump makes health checks eject 4 of the 10. About what CPU load does each remaining backend need to carry?</p>",
      choices: [
        {
          id: "a",
          text: "About 98%",
          why: "This adds the ejected share (40%) on top of the 70% baseline, as if each backend picked up 40% more work. The load per backend is total work divided by the backends left, which grows faster than that.",
        },
        {
          id: "b",
          text: "About 88%",
          why: "That is the load after only 2 of the 10 are ejected: 70% × 10 / 8. With 4 ejected the denominator is 6, not 8.",
        },
        {
          id: "c",
          text: "About 100%",
          why: "That is the load after 3 of the 10 are ejected: 70% × 10 / 7. One more ejection pushes it past capacity.",
        },
        {
          id: "d",
          text: "About 117%",
          why: "Total work is 10 × 70% = 700 percentage points of one backend. Spread over 6 remaining backends that is about 117% each, which is over capacity, so the survivors fail too and the check has turned a brownout into an outage.",
        },
      ],
      answer: "d",
    },
    {
      id: "lb-stop-the-cascade",
      chapter: "sysdes-load-balancing-depth",
      level: "intermediate",
      skill: "tradeoff",
      section: "health-checks-active-passive-and-how-they-amplify-an-outage",
      kind: "multi",
      prompt:
        "<p>Your balancer ejects backends that fail health checks, and a traffic spike has slowed several of them. You want to stop ejection from shrinking the fleet until the rest collapse. Select every measure that helps.</p>",
      choices: [
        {
          id: "a",
          text: "Cap the share of the pool that outlier detection may eject at one time.",
          why: "A cap keeps ejection from removing capacity from a system whose problem is too little capacity. Envoy's default allows at most 10% of a cluster to be ejected.",
        },
        {
          id: "b",
          text: "Set a panic threshold so that, when too few hosts are healthy, the balancer spreads load across all hosts.",
          why: "Below the threshold (50% by default in Envoy) health status is ignored, on the theory that a struggling backend beats no backend. It is the second guardrail when a cap alone is not enough.",
        },
        {
          id: "c",
          text: "Give each backend a concurrency limit that sheds excess load with a fast 429 instead of letting requests time out.",
          why: "An overloaded backend that rejects quickly stays responsive instead of timing out and looking dead. A 429 is not a 5xx, so it does not count toward the consecutive-5xx ejection in Envoy's passive detection, and fewer hosts fail their checks for reasons of overload.",
        },
        {
          id: "d",
          text: "Make the readiness endpoint check the database, so unhealthy dependencies remove an instance.",
          why: "During a short database blip every instance fails the check at once and the whole pool is drained. A probe should test the instance, not the dependencies behind it.",
        },
        {
          id: "e",
          text: "Eject a host after a single failed probe so that slow hosts leave sooner.",
          why: "A more eager threshold removes capacity faster, which speeds up the cascade. Eager ejection is the behaviour that turns a brownout into an outage.",
        },
      ],
      answers: ["a", "b", "c"],
    },
    {
      id: "lb-deploy-502-burst",
      chapter: "sysdes-load-balancing-depth",
      level: "intermediate",
      skill: "diagnose",
      section: "connection-draining-and-the-deploy-that-drops-requests",
      kind: "single",
      prompt:
        "<p>Pods run behind a Kubernetes Service and a layer 7 proxy. Every rolling deploy produces a burst of 502 responses lasting a few seconds. The proxy logs show connection-refused errors to the addresses of the old pods, which close their listener and exit as soon as they receive SIGTERM. Readiness probes pass in normal operation and there are plenty of replicas. What is the most likely cause?</p>",
      choices: [
        {
          id: "a",
          text: "New pods are given a full share of traffic before they are warm, so their first requests time out.",
          why: "Slow start problems show up as slow or failing responses from the new pods. The logs here point at the old pods' addresses refusing connections.",
        },
        {
          id: "b",
          text: "The readiness probes are too strict, so healthy pods are taken out of the pool for a while during the rollout.",
          why: "Removing pods from the pool prevents requests from reaching them and so would not produce refused connections to them. The stem also says the probes pass normally.",
        },
        {
          id: "c",
          text: "Endpoint removal and SIGTERM happen at the same time, so requests still reach a pod that has stopped listening.",
          why: "Endpoint removal takes time to reach the proxy, while the process starts shutting down immediately. A preStop sleep of a few seconds, followed by draining in-flight work, gives the removal time to propagate before the pod stops accepting connections.",
        },
        {
          id: "d",
          text: "The proxy balances by least connections, which sends nearly every new request to the newest pod in the pool.",
          why: "Least connections picks the backend with the fewest requests in flight, and it does not make the old pods refuse connections. The errors come from pods that have already stopped listening.",
        },
      ],
      answer: "c",
    },
    {
      id: "lb-drain-order",
      chapter: "sysdes-load-balancing-depth",
      level: "intermediate",
      skill: "sequence",
      section: "connection-draining-and-the-deploy-that-drops-requests",
      kind: "order",
      prompt:
        "<p>You are removing a backend from service without dropping requests. Put the steps in a safe order: no new work may be sent to the backend once draining starts, and a connection is closed only after its last in-flight response is done.</p>",
      items: [
        { id: "advertise", text: "Fail the readiness probe or deregister the backend so new requests stop being sent" },
        { id: "propagate", text: "Wait for the balancer to notice, for example with a short preStop sleep" },
        { id: "drain", text: "Finish in-flight requests up to a deadline and reject new ones with a clean 503" },
        {
          id: "close",
          text: "Close the keep-alive connections that are still open once their last in-flight response is done",
        },
        { id: "exit", text: "Exit the process" },
      ],
      why: "Removal has to come first, or new work keeps arriving. The balancer needs time to learn the backend is gone, so waiting comes before draining. Draining finishes the work already accepted, and the idle keep-alive connections are closed deliberately so that no client holds a socket to a process about to vanish. Only then is it safe to exit.",
    },
    {
      id: "lb-locality-routing",
      chapter: "sysdes-load-balancing-depth",
      level: "intermediate",
      skill: "tradeoff",
      section: "sticky-sessions-and-why-they-are-a-smell",
      kind: "single",
      prompt:
        "<p>Each user's working set is cached in a backend's memory for speed, while the database remains the source of truth. You want requests for the same user to reach the same backend when possible, new backends to take on load quickly after scale-out, and the loss of one backend to cost only some warm cache. Which routing fits best?</p>",
      choices: [
        {
          id: "a",
          text: "Source-IP hash, so each client address maps to one backend",
          why: "Carrier-grade NAT puts a whole network behind a few addresses, so those users all land on a few backends. It also gives no way to rebalance gracefully when backends change.",
        },
        {
          id: "b",
          text: "Consistent hashing on the user id, with virtual nodes",
          why: "The ring maps each user to a backend, so locality holds. Adding a node takes over only about 1/(N+1) of the keys, and losing one only disturbs the arcs it owned. Correctness never depends on the mapping, so a move costs a cold cache and nothing more.",
        },
        {
          id: "c",
          text: "A balancer-issued cookie that pins each session to the backend that served it",
          why: "Existing sessions never move, so backends added during a spike receive almost nothing until sessions churn. The pinning also becomes something deploys and failures must work around.",
        },
        {
          id: "d",
          text: "<code>hash(user_id) mod N</code> over the current backend count",
          why: "Locality holds until the backend count changes. Going from 4 to 5 backends moves about 80% of users to a different backend, which discards most of the warm cache at the moment you added capacity.",
        },
      ],
      answer: "b",
    },
  ],
};
