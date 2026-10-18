import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "av-serial-chain",
      chapter: "sysdes-availability-design",
      level: "intermediate",
      skill: "estimate",
      section: "availability-is-arithmetic-and-the-arithmetic-is-unforgiving",
      kind: "single",
      prompt:
        "<p>Your API tier is 99.95% available. Answering any request needs three other services, auth, profiles and a metadata store, and each of them is 99.9% available. All three are hard dependencies that cannot be skipped, and their failures are independent. Which figure is closest to the end-to-end availability of a request, rounded to two decimals?</p>",
      choices: [
        {
          id: "a",
          text: "99.90%, because a chain is only as available as its weakest link.",
          why: "The weakest-link rule gives a ceiling, not the answer. Every serial hop can fail independently, so the factors multiply and the result is lower than any single one of them.",
        },
        {
          id: "b",
          text: "99.70%, the product of the three dependencies.",
          why: "This multiplies 0.999 three times but leaves out your own tier. The API tier is also in the path of every request, so its 99.95% is a fourth factor.",
        },
        {
          id: "c",
          text: "99.65%, the product of all four tiers.",
          why: "0.9995 × 0.999 × 0.999 × 0.999 is about 0.9965. Four serial hops each add their own unavailability, which is why the figure ends up below every individual number.",
        },
        {
          id: "d",
          text: "99.91%, the average of the four figures.",
          why: "Averaging treats the four tiers as if one outage were shared among them. For hard serial dependencies, a request fails when any one fails, so the failure fractions add up instead of averaging out.",
        },
      ],
      answer: "c",
    },
    {
      id: "av-budget-left",
      chapter: "sysdes-availability-design",
      level: "intermediate",
      skill: "estimate",
      section: "sla-slo-sli-and-the-error-budget",
      kind: "single",
      prompt:
        "<p>A team has an SLO of 99.95% successful requests, measured over a rolling 28-day window with steady traffic. A bad deploy makes every request fail for 12 minutes. Counting that outage as 12 minutes of failure, how much error budget is left in the window, in minutes to one decimal place?</p>",
      choices: [
        {
          id: "a",
          text: "8.2 minutes",
          why: "The window is 28 × 24 × 60 = 40,320 minutes, and 0.05% of that is 20.16 minutes of allowed failure. Subtracting the 12-minute outage leaves about 8.2 minutes.",
        },
        {
          id: "b",
          text: "9.6 minutes",
          why: "This uses a 30-day month, which has a budget of 21.6 minutes. The stem fixes the window at 28 days, so the budget is 20.16 minutes.",
        },
        {
          id: "c",
          text: "20.2 minutes",
          why: "That is the whole budget before the outage. The 12 minutes of failure have already been spent from it, so the remainder is smaller.",
        },
        {
          id: "d",
          text: "189.6 minutes",
          why: "This reads 99.95% as 99.5%, which would allow 0.5% failure. Each extra nine divides the allowance by ten, so 99.95% allows only 0.05%.",
        },
      ],
      answer: "a",
    },
    {
      id: "av-two-node-split-brain",
      chapter: "sysdes-availability-design",
      level: "intermediate",
      skill: "diagnose",
      section: "failover-and-the-three-ways-it-betrays-you",
      kind: "single",
      prompt:
        "<p>A database runs as two nodes in separate racks. Each node promotes itself to primary whenever it has missed heartbeats from its peer for 5 seconds. A faulty switch cut the link between the racks for a minute. Both nodes stayed healthy, both promoted themselves, clients on each side kept writing, and the two histories now conflict. Which change fixes the root cause?</p>",
      choices: [
        {
          id: "a",
          text: "Lower the heartbeat timeout to 2 seconds so each node decides on fresher information.",
          why: "A shorter timeout makes false promotions more likely, and it still cannot tell a dead peer from a partition. From one side both look the same: no heartbeat arrives.",
        },
        {
          id: "b",
          text: "Raise the heartbeat timeout to 60 seconds so a brief cut is ignored.",
          why: "A longer timeout only helps with partitions shorter than the timeout, and it slows real failovers. Any cut that outlasts it produces the same double promotion.",
        },
        {
          id: "c",
          text: "Add a third node as another standby that copies the primary, keeping the same promotion rule.",
          why: "More copies do not change who is allowed to become primary. Each side of a partition can still promote a replica it can see, so the rule that causes split brain is still in place.",
        },
        {
          id: "d",
          text: "Add a third voter, and let a node act as primary only while it can see a majority.",
          why: "With three voters, only one side of a partition can hold two of the three, so at most one primary exists. The side without a majority stops serving writes instead of diverging. Two nodes cannot do this, because a majority of two needs both.",
        },
      ],
      answer: "d",
    },
    {
      id: "av-readiness-drains-fleet",
      chapter: "sysdes-availability-design",
      level: "intermediate",
      skill: "diagnose",
      section: "health-checks-are-a-design-decision-not-a-checkbox",
      kind: "single",
      prompt:
        "<p>A stateless web fleet sits behind a load balancer. Each instance's readiness endpoint runs a query against the shared primary database and returns 500 if it fails. During a 20-second database failover the site returned 503 for all traffic, although many requests (static pages, cached reads) never touch the database. Which change fixes this?</p>",
      choices: [
        {
          id: "a",
          text: "Move the database query into the liveness probe, so unhealthy instances are restarted.",
          why: "Liveness failures restart the process, so a database outage would restart every instance at once. Restarts bring cold caches and cold pools and do nothing for a dependency that is down.",
        },
        {
          id: "b",
          text: "Have readiness check only the instance itself, and let database requests fail alone.",
          why: "A readiness probe should reflect this instance: warmed up, not overloaded. Requests that need the database fail on their own, while the rest keep being served.",
        },
        {
          id: "c",
          text: "Require three consecutive readiness failures before removing an instance from the pool.",
          why: "A failure threshold treats the symptom. It delays the drain, but a database outage longer than the threshold still makes every instance report unready at the same moment.",
        },
        {
          id: "d",
          text: "Replace the readiness query with a synthetic end-to-end checkout from inside each instance.",
          why: "An end-to-end journey is a deep check, which is allowed to be slow and expensive and is meant to drive alerts from outside. As a readiness probe it checks the world rather than the instance, so it fails everywhere when any dependency does.",
        },
      ],
      answer: "b",
    },
    {
      id: "av-retry-multiplication",
      chapter: "sysdes-availability-design",
      level: "intermediate",
      skill: "estimate",
      section: "failover-and-the-three-ways-it-betrays-you",
      kind: "single",
      prompt:
        "<p>Service A calls B, B calls C, and C calls a database that is failing every request. Each of the three callers makes up to 4 attempts per call (the first try plus 3 retries) and retries immediately on any error. One user action reaches A once. At most how many attempts reach the database?</p>",
      choices: [
        {
          id: "a",
          text: "12, because each layer adds 4 attempts.",
          why: "Adding treats the layers as independent. But each retry at an upper layer re-runs the whole call below it, so the attempt counts multiply instead of adding.",
        },
        {
          id: "b",
          text: "81, three attempts raised to the fourth power.",
          why: "This swaps the base and the exponent. There are three layers, each making 4 attempts, so the calculation is 4 to the power 3.",
        },
        {
          id: "c",
          text: "64, four attempts at each of three layers.",
          why: "A makes up to 4 calls to B, each B call makes up to 4 calls to C, and each C call makes up to 4 calls to the database: 4 × 4 × 4 = 64. This is the retry amplification the Google SRE book describes.",
        },
        {
          id: "d",
          text: "256, counting the user's own client as a fourth layer.",
          why: "The stem says the user action reaches A once, so no extra layer sits above A. Counting one would multiply in a retry that does not exist here.",
        },
      ],
      answer: "c",
    },
    {
      id: "av-bad-config-everywhere",
      chapter: "sysdes-availability-design",
      level: "intermediate",
      skill: "tradeoff",
      section: "limiting-blast-radius-and-recovering-from-disaster",
      kind: "single",
      prompt:
        "<p>Last year's three worst outages were each a bad configuration push that the deploy pipeline rolled out to every instance in every region within minutes. The team proposes adding a second active-active region to reach 99.99%. Which change would most directly have limited those particular outages?</p>",
      choices: [
        {
          id: "a",
          text: "Roll out config to a canary slice first, with automatic rollback.",
          why: "These outages came from a change reaching everything at once. A staged rollout exposes a small share of traffic first and reverts on its own, so the bad push never reaches the rest.",
        },
        {
          id: "b",
          text: "Add the second active-active region as proposed.",
          why: "Redundancy only helps when copies fail independently. The pipeline pushes to every region, so the second region receives the same bad configuration and fails with the first.",
        },
        {
          id: "c",
          text: "Move to a higher availability tier from the cloud provider.",
          why: "A provider's tier covers the provider's own infrastructure. A faulty configuration that you push to your own instances is outside what that commitment protects.",
        },
        {
          id: "d",
          text: "Shorten the health check interval so bad instances leave the pool sooner.",
          why: "Faster health checks do not help when every instance is bad. They only take every instance out of the pool sooner, so the outage is no smaller.",
        },
      ],
      answer: "a",
    },
    {
      id: "av-slo-equals-sla",
      chapter: "sysdes-availability-design",
      level: "intermediate",
      skill: "concept",
      section: "sla-slo-sli-and-the-error-budget",
      kind: "single",
      prompt:
        "<p>A contract promises customers 99.9% monthly availability, with service credits owed if it is missed. The team sets its internal SLO to 99.9% on exactly the same measurement. What is the main problem with that choice?</p>",
      choices: [
        {
          id: "a",
          text: "The SLO should be looser than the SLA, so the team is not paged for small misses.",
          why: "This reverses the relationship. A looser internal target would mean the contract is already breached before the internal alarm fires.",
        },
        {
          id: "b",
          text: "Breaching the SLO and owing credits coincide, so there is no earlier warning.",
          why: "An SLO is meant to trip first, while there is still room to fix things before money is owed. With identical targets the internal breach and the contractual breach coincide.",
        },
        {
          id: "c",
          text: "A 99.9% SLO leaves no error budget, so no feature work can ever ship.",
          why: "A 99.9% target leaves 0.1% of requests as budget, around 43 minutes in a 30-day month. Only an SLO of 100% leaves nothing to spend.",
        },
        {
          id: "d",
          text: "An SLO and an SLA cannot share the same SLI, so the team needs separate metrics.",
          why: "Both can be defined on one SLI. They differ in the target and in who cares: the SLO is internal and the SLA carries penalties.",
        },
      ],
      answer: "b",
    },
    {
      id: "av-dr-tier-order",
      chapter: "sysdes-availability-design",
      level: "intermediate",
      skill: "sequence",
      section: "limiting-blast-radius-and-recovering-from-disaster",
      kind: "order",
      prompt:
        "<p>The chapter lists four regional disaster recovery tiers as AWS describes them. Put them in the order the chapter gives them, from lowest cost and slowest recovery to highest cost and fastest recovery.</p>",
      items: [
        { id: "backup", text: "Backup and restore: copies sit in another region and are restored after a disaster" },
        {
          id: "pilot",
          text: "Pilot light: data is replicated, and the application servers are defined but switched off",
        },
        { id: "warm", text: "Warm standby: a scaled-down but fully running copy that can take traffic right away" },
        { id: "active", text: "Multi-site active-active: every region serves traffic" },
      ],
      why: "Each step keeps more of the recovery environment running. Backup and restore holds only copies, pilot light adds replicated data with the application servers defined but off, warm standby runs a smaller full copy, and active-active runs full copies everywhere. Each step costs more to run and shortens the time to recover.",
    },
  ],
};
