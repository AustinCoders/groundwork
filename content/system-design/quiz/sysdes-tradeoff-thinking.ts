import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "tt-jobs-table-or-broker",
      chapter: "sysdes-tradeoff-thinking",
      level: "advanced",
      skill: "tradeoff",
      section: "over-engineering-is-the-most-common-senior-level-failure",
      kind: "single",
      prompt:
        "<p>You are designing background email sending for a product with a team of four engineers. Peak load is 400 jobs a second, and product expects the job load to grow at most 2× this year. Each job costs 3 committed writes on the existing Postgres primary (enqueue, claim, complete), the rest of the product peaks at 1,500 committed writes a second and is not expected to grow, and the team's planning figure for that primary is 5,000. There is exactly one consumer, the email sender, and nobody will ever need to reprocess old jobs. Which answer is the most defensible in the review?</p>",
      choices: [
        {
          id: "a",
          text: "Kafka, because sending is asynchronous and a broker is the standard tool for async work.",
          why: "Being asynchronous does not by itself justify a broker. A broker earns its place through replay, several independent consumer groups or throughput a database cannot absorb, and none of those applies here.",
        },
        {
          id: "b",
          text: "RabbitMQ, because it is far lighter than Kafka and still gives you a real queue.",
          why: "A lighter broker is still another stateful system with its own backups, upgrades and on-call load. With one consumer and load that fits the database, it adds that cost without buying a property the stem asks for.",
        },
        {
          id: "c",
          text: "A jobs table with a worker pool, moving to a broker once replay, a second consumer or throughput demands it.",
          why: "At 2× growth the jobs add 400 × 2 × 3 = 2,400 writes a second, so 3,900 in total with the rest of the product, against the 5,000 figure. The cost is no replay and some polling latency, and the trigger is named.",
        },
        {
          id: "d",
          text: "Shard the Postgres primary first, so the jobs never compete with the rest of the product's writes for capacity.",
          why: "Sharding is a heavy, one-way commitment, and the arithmetic does not call for it: even with the job load doubled the primary stays under its planning figure. It trades a problem you do not have for cross-shard complexity.",
        },
      ],
      answer: "c",
    },
    {
      id: "tt-reads-from-replica-answer",
      chapter: "sysdes-tradeoff-thinking",
      level: "advanced",
      skill: "concept",
      section: "it-depends-is-only-half-a-sentence",
      kind: "single",
      prompt:
        '<p>An interviewer asks, "Should profile reads go to the replicas or to the primary?" The primary has plenty of spare capacity, and the worry is whether users see stale profile data. Which of these answers is complete in the sense the chapter asks for: it names the condition that actually decides the routing and what you would do in each case?</p>',
      choices: [
        {
          id: "a",
          text: "It depends on the use case, and either one can work well if it is set up with care and watched closely.",
          why: "This is true of almost any design question, which is why it scores nothing. It names no condition and no branch, so the interviewer has to do the work.",
        },
        {
          id: "b",
          text: "It depends on where users are: replicas for users far from the primary's region, the primary for users close to it.",
          why: "Both branches are stated, but location alone does not decide staleness. A user on a nearby replica still lags behind their own write, so this routes by the wrong condition.",
        },
        {
          id: "c",
          text: "It depends on read volume: replicas once reads are heavy enough to strain the primary, the primary while they are light.",
          why: "It has a condition and two branches, but the stem gives the primary spare capacity, so volume does not decide anything here. Neither branch protects a user who just edited their profile.",
        },
        {
          id: "d",
          text: "It depends on whether users must see their own edits at once: if so, the primary just after a write, else replicas.",
          why: "It names the condition that decides staleness and gives an action for each branch: the primary for a short time after a write, replicas otherwise.",
        },
      ],
      answer: "d",
    },
    {
      id: "tt-hold-or-fold-on-sharding",
      chapter: "sysdes-tradeoff-thinking",
      level: "advanced",
      skill: "tradeoff",
      section: "how-to-disagree-with-your-interviewer-well",
      kind: "single",
      prompt:
        '<p>You proposed one Postgres primary for a checkout system at about 500 writes a second, roughly a tenth of what you estimated one machine can take. The interviewer says, "A single primary is a bottleneck and a single point of failure, so shard now," and offers no new numbers. You know sharding by customer id would turn checkout\'s multi-row transactions into cross-shard ones. What is the best response?</p>',
      choices: [
        {
          id: "a",
          text: 'Say "good point", switch to sharding by customer id, and redraw the checkout path around the new shard layout.',
          why: "No new information was offered, so changing the design on the spot suggests the original choice had no reasons behind it. Updating is right when you can say what changed.",
        },
        {
          id: "b",
          text: "Restate the concern, hold and name sharding's cost, add a standby for failover, and ask which growth to plan for.",
          why: "It shows the objection was heard, holds with a stated cost, answers the single-point-of-failure worry with a standby while the load figure answers the bottleneck worry, and invites the information the interviewer probably has.",
        },
        {
          id: "c",
          text: "Explain once more that one machine handles ten times this load, so sharding would only add cost and complexity for nothing.",
          why: "The load figure answers the bottleneck worry only. Repeating it leaves the failover worry untouched, and it reads as someone hard to work with in a design review.",
        },
        {
          id: "d",
          text: "Say both designs are valid and that you will draw whichever one the interviewer would rather see on the whiteboard.",
          why: "This avoids the decision rather than defending one. It gives no assumption, no cost and no trigger, and the interviewer learns nothing about your judgement.",
        },
      ],
      answer: "b",
    },
    {
      id: "tt-like-counter-partition",
      chapter: "sysdes-tradeoff-thinking",
      level: "advanced",
      skill: "tradeoff",
      section: "the-six-axes-and-the-sentence-for-each",
      kind: "single",
      prompt:
        "<p>A social app keeps each post's like count in two regions. During a network partition, a region that cannot reach the other must either keep accepting likes against its local count or reject them until the link returns. The two counts can be summed once the link is back. Product says a briefly wrong count harms nobody, but an error when tapping like drives users away. Which axis is this decision about, and which side does the stem's reasoning support?</p>",
      choices: [
        {
          id: "a",
          text: "Consistency against availability: accept the likes locally and merge the counts later.",
          why: "During a partition the choice is between consistent answers and answering at all. A like counter tolerates stale counts and the stem rules out errors, so availability wins.",
        },
        {
          id: "b",
          text: "Consistency against availability: reject likes during the partition, as for a withdrawal.",
          why: "This is the right axis with the wrong side. Rejecting suits money paths where a stale balance does harm, and here the stem says a briefly wrong count harms nobody.",
        },
        {
          id: "c",
          text: "Latency against throughput: batch the likes into 50 ms windows to relieve load during the outage.",
          why: "Batching trades single-request speed for throughput. It says nothing about whether a region may answer when it cannot reach its peer, which is what a partition forces.",
        },
        {
          id: "d",
          text: "Read-optimised against write-optimised: precompute the count on each post so reads stay cheap.",
          why: "Precomputing trades write cost for cheap reads and is a fine design for counters. It does not decide whether a cut-off region accepts or rejects writes.",
        },
      ],
      answer: "a",
    },
    {
      id: "tt-peak-primary-writes",
      chapter: "sysdes-tradeoff-thinking",
      level: "advanced",
      skill: "estimate",
      section: "over-engineering-is-the-most-common-senior-level-failure",
      kind: "single",
      prompt:
        "<p>A product runs 17,280,000 background jobs a day, spread evenly on average over 86,400 seconds, with a peak of 5 times the average. Each job costs 3 committed writes (enqueue, claim, complete) on the same Postgres primary, which already carries 1,500 committed writes a second from the rest of the product at that peak. What total committed write rate does the primary see at the peak?</p>",
      choices: [
        {
          id: "a",
          text: "2,500 writes a second",
          why: "This adds the peak job rate of 1,000 a second to the 1,500 without multiplying by 3. Each job is three committed writes, not one.",
        },
        {
          id: "b",
          text: "3,000 writes a second",
          why: "This is the jobs table's own load, 1,000 jobs × 3 writes. The rest of the product's 1,500 writes land on the same primary at the same time.",
        },
        {
          id: "c",
          text: "4,500 writes a second",
          why: "The average is 17,280,000 / 86,400 = 200 jobs a second, the peak is 1,000, and 1,000 × 3 = 3,000 writes. Adding the other 1,500 gives 4,500.",
        },
        {
          id: "d",
          text: "13,500 writes a second",
          why: "This multiplies the whole total by 3 again. The rest of the product's 1,500 is already a peak figure and each job's cost applies only to the jobs.",
        },
      ],
      answer: "c",
    },
    {
      id: "tt-minutes-saved-by-a-nine",
      chapter: "sysdes-tradeoff-thinking",
      level: "advanced",
      skill: "estimate",
      section: "the-six-axes-and-the-sentence-for-each",
      kind: "single",
      prompt:
        "<p>A service targets 99.95% monthly availability, and leadership is weighing extra spend to target 99.99%. Take a 30-day month and treat availability as the fraction of minutes the service is up. How many minutes of allowed downtime a month does the move from 99.95% to 99.99% remove?</p>",
      choices: [
        {
          id: "a",
          text: "21.6 minutes",
          why: "This is the whole downtime allowance at 99.95%, 0.05% of 43,200 minutes. The question asks how much of it the move removes, and some allowance remains at 99.99%.",
        },
        {
          id: "b",
          text: "17.28 minutes",
          why: "A 30-day month has 43,200 minutes. The allowance falls from 0.05% (21.6 minutes) to 0.01% (4.32 minutes), a difference of 17.28 minutes.",
        },
        {
          id: "c",
          text: "4.32 minutes",
          why: "This is the allowance that remains at 99.99%, not the amount removed. The saving is the old allowance minus the new one.",
        },
        {
          id: "d",
          text: "38.88 minutes",
          why: "This is the saving in going from 99.9% to 99.99%, 43.2 minus 4.32. The starting target here is 99.95%, which already allows less downtime.",
        },
      ],
      answer: "b",
    },
    {
      id: "tt-four-beat-cache-answer",
      chapter: "sysdes-tradeoff-thinking",
      level: "advanced",
      skill: "sequence",
      section: "the-four-beat-move-that-makes-a-decision-defensible",
      kind: "order",
      prompt:
        "<p>A candidate defends a caching decision using the chapter's four-beat move. Put the four sentences of the answer in the order that move prescribes.</p>",
      items: [
        {
          id: "assumption",
          text: "I'm assuming about 100 reads for every write, and that a minute of staleness on the product page is acceptable.",
        },
        { id: "choice", text: "So I'll put a Redis cache in front of the product table with a 60-second TTL." },
        {
          id: "cost",
          text: "The price is that an edited price can show stale for up to a minute, and Redis is one more stateful system to run.",
        },
        {
          id: "trigger",
          text: "If pricing turns out to need edits to appear immediately, I'd shorten the TTL a lot or invalidate on write.",
        },
      ],
      why: "The assumption comes first because the choice only makes sense given it. The cost follows the choice it belongs to, and the trigger comes last because it names the condition under which the earlier choice would be reversed, which is the beat most candidates skip.",
    },
  ],
};
