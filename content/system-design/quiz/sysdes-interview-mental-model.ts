import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "im-peak-reads-from-dau",
      chapter: "sysdes-interview-mental-model",
      level: "beginner",
      skill: "estimate",
      section: "estimation-you-can-do-in-your-head-out-loud",
      kind: "single",
      prompt:
        "<p>An interviewer says an order-history page has 40 million daily active users and each one loads it 5 times a day. Use the chapter's anchor that 1 million requests per day is about 12 requests per second, and assume peak traffic is 3 times the average. What peak read rate do you quote?</p>",
      choices: [
        {
          id: "a",
          text: "About 720 reads per second",
          why: "This treats 200 million requests a day as 20 million, which drops a factor of ten. The anchor is applied to each million, and there are 200 of them.",
        },
        {
          id: "b",
          text: "About 2,400 reads per second",
          why: "That is the average rate: 200 million a day is 200 units of 12 per second. The question asks for the peak, so the 3x factor still has to be applied.",
        },
        {
          id: "c",
          text: "About 7,200 reads per second",
          why: "40 million × 5 is 200 million reads a day. At 12 per second per million that is 2,400 on average, and times the stated peak factor of 3 it is 7,200.",
        },
        {
          id: "d",
          text: "About 72,000 reads per second",
          why: "This is the right digits with the decimal point slipped one place. 200 × 12 × 3 is 7,200, so the answer is ten times too high.",
        },
      ],
      answer: "c",
    },
    {
      id: "im-downtime-budget",
      chapter: "sysdes-interview-mental-model",
      level: "beginner",
      skill: "estimate",
      section: "estimation-you-can-do-in-your-head-out-loud",
      kind: "single",
      prompt:
        "<p>A product team sets an availability target of 99.99% measured over a 365-day year. Roughly how much total downtime does that target allow across the year?</p>",
      choices: [
        {
          id: "a",
          text: "About 53 minutes",
          why: "A year has 525,600 minutes and 0.01% of that is about 52.6, which the chapter's table rounds to 53 minutes. The error budget is exactly what the target leaves you to spend.",
        },
        {
          id: "b",
          text: "About 5 minutes",
          why: "This is the budget for 99.999%, one more nine. Five nines allows about 5 minutes a year, while four nines allows ten times that.",
        },
        {
          id: "c",
          text: "About 8.8 hours",
          why: "This is the budget for 99.9%, one fewer nine. Each extra nine cuts the allowed downtime by a factor of ten.",
        },
        {
          id: "d",
          text: "About 3.7 days",
          why: "This is roughly the budget for 99%, two nines. The target here is 99.99%, which allows about a hundredth of that.",
        },
      ],
      answer: "a",
    },
    {
      id: "im-silent-expert-fails",
      chapter: "sysdes-interview-mental-model",
      level: "beginner",
      skill: "diagnose",
      section: "the-interviewer-is-scoring-a-process-not-an-answer",
      kind: "single",
      prompt:
        "<p>A candidate with eight years of production experience reaches a sound final design in a 45-minute round. For long stretches they sat quietly, thinking, and then presented a finished conclusion. The feedback is a no-hire. Which explanation fits the chapter's account of what the round scores?</p>",
      choices: [
        {
          id: "a",
          text: "The final diagram had too few components, so the interviewer could not see enough breadth.",
          why: "Breadth is not the scored axis. The chapter warns against adding components as a way to look thorough, and a sound design with fewer boxes is not what caused this result.",
        },
        {
          id: "b",
          text: "The interviewer scores decisions, and the reasoning was never said aloud, so there was little to score.",
          why: "The chapter says the evaluated artifact is the process that produced the diagram, and an unspoken thought did not happen for the interviewer. Real experience does not help if the reasoning stays in the candidate's head.",
        },
        {
          id: "c",
          text: "The candidate did not recite enough memorised benchmark figures for each datastore.",
          why: "The chapter says the opposite: quoting exact figures reads as trivia, and a reasoned range with caveats reads as experience. Recall of benchmarks is not what ended this round.",
        },
        {
          id: "d",
          text: "The candidate should have accepted every challenge from the interviewer without changing the design.",
          why: "Treating challenges as attacks to deflect is a weak signal, but the chapter's fix is to treat them as new requirements and update the design. Nothing in this scenario involved a challenge being rejected.",
        },
      ],
      answer: "b",
    },
    {
      id: "im-internal-tool-scale",
      chapter: "sysdes-interview-mental-model",
      level: "beginner",
      skill: "tradeoff",
      section: "the-failure-modes-that-actually-end-interviews",
      kind: "single",
      prompt:
        "<p>The prompt is to design an expense-approval tool for an internal finance team of about 500 employees, with a few thousand approvals a day. Which opening design statement would the chapter's rubric reward most?</p>",
      choices: [
        {
          id: "a",
          text: "Start with a sharded database and a message bus so nothing has to be redesigned if the company grows.",
          why: "This is designing for a billion when told a thousand. It spends complexity the stated load never justifies and offers no trigger for when it would be needed.",
        },
        {
          id: "b",
          text: "Decline to draw anything until the interviewer supplies an exact peak requests-per-second figure.",
          why: "The chapter wants requirements turned into a bounded problem by reasoning, not by waiting for precise inputs. The stated scale is already enough to pick an architecture.",
        },
        {
          id: "c",
          text: "Reuse the full global-consumer-app architecture to show breadth across caching, CDN and multiple regions.",
          why: "Breadth that ignores the stated scale reads as poor judgement, and the chapter says designing above the interviewer's number is not ambition.",
        },
        {
          id: "d",
          text: "One app server and one relational database, then name the load or data growth that would force a change.",
          why: "This matches the design to the stated scale and says out loud what would have to change to justify more, which is the calibration signal the rubric describes.",
        },
      ],
      answer: "d",
    },
    {
      id: "im-complete-it-depends",
      chapter: "sysdes-interview-mental-model",
      level: "beginner",
      skill: "tradeoff",
      section: "why-it-depends-is-the-right-answer-and-why-it-s-usually-said",
      kind: "single",
      prompt:
        "<p>You are designing a social feed, and the interviewer has said reads outnumber writes 100 to 1. They ask whether you would cache the feed. Which reply uses the complete three-part form of &quot;it depends&quot;?</p>",
      choices: [
        {
          id: "a",
          text: "It depends on the use case and on what we are optimising for, so I would want more context first.",
          why: "No specific variable is named, no test resolves it, and no default is given. This hands the question straight back to the interviewer.",
        },
        {
          id: "b",
          text: "It depends on the read-to-write ratio and allowed staleness. If reads dominate and seconds of staleness are fine, caching pays. At 100 to 1, I will cache with a short TTL.",
          why: "It names the variables, states the test that decides them, and then commits to a default using the numbers already given. That commitment is the third part, and it is what separates senior from junior answers.",
        },
        {
          id: "c",
          text: "Yes, I would put Redis in front of the database, because Redis is fast and widely used for feed workloads at scale.",
          why: "This commits but names a technology with no property that justifies it. The chapter treats that as buzzword placement, and it never says what the choice depends on.",
        },
        {
          id: "d",
          text: "It depends on traffic, budget, team size, consistency needs and many other factors, so I would benchmark before deciding.",
          why: "It lists conditions but never says which one decides here and never commits to a default. Endless conditionality is the opposite of returning with a decision.",
        },
      ],
      answer: "b",
    },
    {
      id: "im-which-are-non-functional",
      chapter: "sysdes-interview-mental-model",
      level: "beginner",
      skill: "concept",
      section: "functional-vs-non-functional-and-why-only-one-of-them-shapes",
      kind: "multi",
      prompt:
        "<p>You wrote five requirements on the board for a ride-sharing and social product. Select every one that is a non-functional requirement in the chapter's sense.</p>",
      choices: [
        {
          id: "a",
          text: "A feed read must stay under a stated p99 latency target.",
          why: "Latency is a property the system must hold while it works, so it is non-functional, and it drives choices such as cache placement and sync versus async work.",
        },
        {
          id: "b",
          text: "A user can follow another user.",
          why: "This describes what the system does, so it is functional. It shapes the API and data model, and it is usually an easy row insert.",
        },
        {
          id: "c",
          text: "Writes the service has acknowledged must survive the loss of one machine.",
          why: "Durability is a property of how the system behaves, not a feature. It drives replication mode and fsync policy, so it is non-functional.",
        },
        {
          id: "d",
          text: "A rider is matched to a nearby driver.",
          why: "Matching is a behaviour users can name, which makes it functional. A target for how fast or how reliably it happens would be the non-functional part.",
        },
        {
          id: "e",
          text: "The service stays readable during a regional outage.",
          why: "This is an availability requirement, a property held under failure rather than a feature, and it drives multi-region topology and failover.",
        },
      ],
      answers: ["a", "c", "e"],
    },
    {
      id: "im-slow-dependency-symptoms",
      chapter: "sysdes-interview-mental-model",
      level: "beginner",
      skill: "diagnose",
      section: "the-deep-dive-they-pick-the-component-you-supply-three-level",
      kind: "single",
      prompt:
        "<p>In a failure round the interviewer says a downstream service is not down, only much slower than usual. Your service now has a full thread pool, rising latency on every endpoint, and low CPU, with no timeouts configured. What explains this?</p>",
      choices: [
        {
          id: "a",
          text: "Requests wait on the slow call while holding connections and threads, so the pool fills and unrelated requests queue behind them.",
          why: "This is the chapter's account of slowness being worse than death: connections pile up, thread pools saturate, and one degraded dependency takes the service down through queueing. Timeouts, bulkheads and load shedding are the usual answers.",
        },
        {
          id: "b",
          text: "The slow dependency returns errors quickly, so clients retry and the extra retries use up the CPU.",
          why: "A slow dependency does not fail quickly, and the symptoms include low CPU. Retries without a bound can make things worse, but they are not the main mechanism here.",
        },
        {
          id: "c",
          text: "Only endpoints that call the slow service are affected, because each endpoint has its own isolated resources.",
          why: "Isolation is something you add, for example with bulkheads. With a shared thread pool and no bulkhead, a slow dependency starves endpoints that never call it.",
        },
        {
          id: "d",
          text: "The service is idle while it waits, so it needs more CPU per instance to clear the backlog.",
          why: "The CPU is low because threads are blocked waiting, not because compute is short. Adding CPU does not release threads that are stuck on a slow call.",
        },
      ],
      answer: "a",
    },
    {
      id: "im-arc-in-order",
      chapter: "sysdes-interview-mental-model",
      level: "beginner",
      skill: "sequence",
      section: "the-45-minute-arc",
      kind: "order",
      prompt:
        "<p>Put the work of a system design round in the order the chapter's arc recommends, from the first minutes to the last.</p>",
      items: [
        { id: "clarify", text: "Write down in-scope features and the non-functional targets" },
        { id: "estimate", text: "Derive average and peak QPS and yearly storage" },
        { id: "design", text: "Draw 6 to 10 boxes, the critical data flows and the data model" },
        { id: "deep", text: "Take the interviewer's chosen component to implementation detail" },
        { id: "failure", text: "Name what breaks first at 10x and what happens when each dependency dies" },
      ],
      why: "Requirements come first because they bound the problem. The estimate turns them into numbers that justify the architecture, the high-level design then uses those numbers, the deep dive picks one box from it, and failure analysis comes last because it tests the finished design. Skipping straight to boxes is the classic failure.",
    },
  ],
};
