import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "ms-startup-split",
      chapter: "sysdes-microservices-discovery",
      level: "intermediate",
      skill: "tradeoff",
      section: "a-microservice-is-a-team-boundary-before-it-is-a-technical-o",
      kind: "single",
      prompt:
        '<p>A product with twelve engineers, one team and one database wants to launch as eight microservices "so it can scale later". Nothing is slow today. What is the best advice?</p>',
      choices: [
        {
          id: "a",
          text: "Agree, because splitting early is cheaper than splitting later.",
          why: "Splitting early is usually the expensive choice. The service boundaries are guesses at that point, and every wrong guess becomes a network call you must keep compatible.",
        },
        {
          id: "b",
          text: "Start with a well-structured monolith, and split out a piece when a team or a scaling reason forces it.",
          why: "This is the monolith-first advice: independent deploys and scaling pay off once several teams block each other or one part has a different load. Until then the split costs more than it returns.",
        },
        {
          id: "c",
          text: "Split into eight services but let them share one database, so joins keep working.",
          why: "A shared database couples the deploys again. You pay for the network and keep the lockstep releases, which is the distributed monolith.",
        },
        {
          id: "d",
          text: "Split into many more, smaller services, so each team owns less.",
          why: "Smaller pieces multiply calls, contracts and on-call surface. With one team there is no ownership problem for a split to solve.",
        },
      ],
      answer: "b",
    },
    {
      id: "ms-shared-table",
      chapter: "sysdes-microservices-discovery",
      level: "intermediate",
      skill: "diagnose",
      section: "where-to-cut-data-ownership-decides-the-boundary",
      kind: "single",
      prompt:
        "<p>An orders service and a billing service must always be released together, and both write to the same <code>invoices</code> table. Releases keep slipping because every schema change needs both teams. What is the underlying problem?</p>",
      choices: [
        {
          id: "a",
          text: "The services are too large, so they need splitting into four.",
          why: "More services would add more shared tables and more lockstep releases. Size is not the issue here.",
        },
        {
          id: "b",
          text: "The network between them is too slow.",
          why: "Slowness would show up as latency, not as two teams blocking each other on a schema. The coupling is in the data, not the wire.",
        },
        {
          id: "c",
          text: "The services do not have a service mesh.",
          why: "A mesh handles traffic policy between services. It does nothing for two services that share one table.",
        },
        {
          id: "d",
          text: "The boundary is wrong: one owner should hold the invoice data, and the other should use its API or events.",
          why: "Data ownership decides a good boundary. A table that two services write ties their deploys together. Give it to one owner, or merge the services if they cannot be separated.",
        },
      ],
      answer: "d",
    },
    {
      id: "ms-parallel-latency",
      chapter: "sysdes-microservices-discovery",
      level: "intermediate",
      skill: "estimate",
      section: "dry-run-five-services-one-product-page",
      kind: "single",
      prompt:
        "<p>A product page needs the catalogue (20 ms) first. Once it answers, the page calls pricing (15 ms), stock (25 ms), reviews (40 ms) and recommendations (60 ms) in parallel. Ignoring network overhead, how long is the critical path?</p>",
      choices: [
        {
          id: "a",
          text: "160 ms",
          why: "This is the total if every call ran one after the other (20 + 15 + 25 + 40 + 60). The four calls after the catalogue overlap, so only the slowest counts.",
        },
        {
          id: "b",
          text: "45 ms",
          why: "This adds only the catalogue and the stock call (20 + 25). The page still waits for reviews and recommendations, and recommendations at 60 ms is the slowest of the parallel calls.",
        },
        {
          id: "c",
          text: "80 ms",
          why: "The catalogue must finish first (20 ms), then the parallel calls take as long as the slowest one, recommendations at 60 ms. 20 + 60 = 80 ms.",
        },
        {
          id: "d",
          text: "60 ms",
          why: "This is the slowest parallel call alone. The catalogue call has to finish before the others can start, so its 20 ms is added.",
        },
      ],
      answer: "c",
    },
    {
      id: "ms-optional-availability",
      chapter: "sysdes-microservices-discovery",
      level: "intermediate",
      skill: "estimate",
      section: "dry-run-five-services-one-product-page",
      kind: "single",
      prompt:
        "<p>Every service is 99.9% available. The page works without reviews and recommendations, so only the catalogue, pricing and stock are required. What availability does the page get from its required dependencies?</p>",
      choices: [
        {
          id: "a",
          text: "99.90%",
          why: "That is the availability of one service. Three required services in a chain multiply, so the page cannot be as available as any one of them.",
        },
        {
          id: "b",
          text: "99.50%",
          why: "This is five required services in a chain (0.999 to the fifth power). Making two of them optional removes them from the product.",
        },
        {
          id: "c",
          text: "99.70%",
          why: "Three required services give 0.999 × 0.999 × 0.999 = 0.997003, about 99.70%. The optional ones do not count against the page.",
        },
        {
          id: "d",
          text: "99.99%",
          why: "Chaining dependencies can only lower availability. Redundant copies of one service could raise it, but that is a different design.",
        },
      ],
      answer: "c",
    },
    {
      id: "ms-stale-window",
      chapter: "sysdes-microservices-discovery",
      level: "intermediate",
      skill: "estimate",
      section: "how-services-find-each-other-service-discovery",
      kind: "single",
      prompt:
        "<p>An instance crashes just after sending a heartbeat. The registry removes an instance after a 30 s time-to-live, and every caller refreshes its cached list every 15 s. In the worst case, how long after the crash can a caller still send traffic to the dead instance?</p>",
      choices: [
        {
          id: "a",
          text: "15 s",
          why: "That is only the caller's refresh interval. The registry still lists the instance for 30 s, so a refresh in that window changes nothing.",
        },
        {
          id: "b",
          text: "30 s",
          why: "The registry drops the entry at 30 s, but a caller that refreshed just before that moment keeps its old list for another full refresh interval.",
        },
        {
          id: "c",
          text: "45 s",
          why: "The entry expires at 30 s, and a caller that refreshed just before then waits up to 15 s for its next refresh. The timers add up: 30 + 15 = 45 s.",
        },
        {
          id: "d",
          text: "60 s",
          why: "This would double the registry time-to-live. The worst case is the time-to-live plus one refresh interval, not twice the time-to-live.",
        },
      ],
      answer: "c",
    },
    {
      id: "ms-strangler-steps",
      chapter: "sysdes-microservices-discovery",
      level: "intermediate",
      skill: "sequence",
      section: "migrating-without-a-rewrite-the-strangler-fig",
      kind: "order",
      prompt: "<p>You are moving search out of a monolith with the strangler fig approach. Put the steps in order.</p>",
      items: [
        {
          id: "facade",
          text: "Put a routing layer in front of the monolith and build search as a new service behind it",
        },
        { id: "slice", text: "Route a small share of search traffic to it and compare results" },
        { id: "raise", text: "Raise the share as it behaves, keeping the old path as a fallback" },
        { id: "delete", text: "Delete the old search code from the monolith" },
      ],
      why: "The routing layer and the new service come first, because the routing layer is what makes every later step reversible. The new service then takes a small slice so a bug is cheap, the share grows only with evidence, and the old code is deleted last, once nothing depends on it.",
    },
    {
      id: "ms-mesh-or-gateway",
      chapter: "sysdes-microservices-discovery",
      level: "intermediate",
      skill: "concept",
      section: "the-gateway-the-mesh-and-who-does-what",
      kind: "multi",
      prompt:
        "<p>Select every job that belongs to a service mesh (traffic between services) rather than to the API gateway at the edge.</p>",
      choices: [
        {
          id: "a",
          text: "Mutual TLS between two internal services.",
          why: "Both ends proving their identity inside the system is east-west security, the mesh's work, usually with certificates issued automatically.",
        },
        {
          id: "b",
          text: "Authenticating an end user who arrives from the internet.",
          why: "Traffic entering the system is the gateway's job. A mesh sits between services that are already inside.",
        },
        {
          id: "c",
          text: "Timeouts and retries on calls from one service to another.",
          why: "The sidecar proxy (or, in Istio's ambient mode, a waypoint proxy) can apply these policies to service-to-service calls without changing application code.",
        },
        {
          id: "d",
          text: "Per-API-key quotas for external customers.",
          why: "Quotas keyed by customer are enforced where external traffic enters, which is the gateway.",
        },
      ],
      answers: ["a", "c"],
    },
  ],
};
