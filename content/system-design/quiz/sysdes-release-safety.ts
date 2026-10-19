import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "rs-canary-budget-share",
      chapter: "sysdes-release-safety",
      level: "advanced",
      skill: "estimate",
      section: "canary-analysis-what-to-compare-and-for-how-long",
      kind: "single",
      prompt:
        "<p>A service has a 99.9% objective over 30 days, so its budget is 43.2 full-outage minutes. A bad build fails 20% of the requests it serves. A 5% canary carries it for 10 minutes before it is rolled back. What share of the monthly error budget does that cost?</p>",
      choices: [
        {
          id: "a",
          text: "About 13.9%",
          why: "This is the cost if the bad build had taken all traffic for 30 minutes (0.2 × 30 = 6 minutes of 43.2). The canary carries only 5% of traffic, for 10 minutes.",
        },
        {
          id: "b",
          text: "About 0.23%",
          why: "The canary adds 5% × 20% = 1% errors overall. Over 10 minutes that is 0.01 × 10 = 0.1 outage-minutes, and 0.1 / 43.2 is about 0.23% of the budget.",
        },
        {
          id: "c",
          text: "About 1%",
          why: "One percent is the overall error rate during the canary, not the share of the budget. The budget share depends on how long it lasts.",
        },
        {
          id: "d",
          text: "About 5%",
          why: "Five percent is the share of traffic on the canary. The errors it causes are only 20% of that, and only for ten minutes.",
        },
      ],
      answer: "b",
    },
    {
      id: "rs-budget-minutes",
      chapter: "sysdes-release-safety",
      level: "advanced",
      skill: "estimate",
      section: "canary-analysis-what-to-compare-and-for-how-long",
      kind: "single",
      prompt: "<p>How many full-outage minutes does a 99.9% availability objective allow over 30 days?</p>",
      choices: [
        {
          id: "a",
          text: "4.32 minutes",
          why: "This is the allowance for 99.99%, one tenth of the figure for three nines.",
        },
        {
          id: "b",
          text: "432 minutes",
          why: "This would be a 99% objective. The 0.1% allowance for three nines is ten times smaller.",
        },
        {
          id: "c",
          text: "43 hours",
          why: "43 hours is roughly a year's allowance at 99.5%. Over 30 days, 0.1% of the time is under an hour.",
        },
        {
          id: "d",
          text: "43.2 minutes",
          why: "30 days is 43,200 minutes, and 0.1% of that is 43.2 minutes.",
        },
      ],
      answer: "d",
    },
    {
      id: "rs-payment-code-rollout",
      chapter: "sysdes-release-safety",
      level: "advanced",
      skill: "tradeoff",
      section: "rollout-strategies-compared",
      kind: "single",
      prompt: "<p>You are releasing a rewrite of the code that charges cards. Which approach is the right fit?</p>",
      choices: [
        {
          id: "a",
          text: "Shadow traffic: mirror every live request to the new code, with its real card calls switched on, and compare answers.",
          why: "Mirroring a write path with real card calls would charge customers twice. Shadowing suits read paths, or writes only when the payment call is replaced by a fake.",
        },
        {
          id: "b",
          text: "A rolling update to every server at once.",
          why: "A rolling update replaces everything in batches and exposes all users as it proceeds, unless health checks stop it early. Money code deserves a smaller blast radius.",
        },
        {
          id: "c",
          text: "A canary behind a flag, starting with staff accounts and a small share, with an automatic rollback on errors or mismatched ledgers.",
          why: "A small slice of real traffic limits the damage of a defect, and a flag turns the new path off in seconds. Comparing the ledger against the control catches subtle money bugs.",
        },
        {
          id: "d",
          text: "Deploy to production on Friday evening when traffic is low.",
          why: "Low traffic is a poor test for a bug that shows at peak, and few people are available to watch the release or react to it.",
        },
      ],
      answer: "c",
    },
    {
      id: "rs-night-canary",
      chapter: "sysdes-release-safety",
      level: "advanced",
      skill: "diagnose",
      section: "canary-analysis-what-to-compare-and-for-how-long",
      kind: "single",
      prompt:
        "<p>A canary at 3 a.m. showed clean error rates and the build went to everyone. At the evening peak, latency doubled and errors spiked. What was wrong with the canary?</p>",
      choices: [
        {
          id: "a",
          text: "The canary was too long.",
          why: "A long canary is safer, not riskier. The problem was what traffic it saw, not how long it ran.",
        },
        {
          id: "b",
          text: "It ran at off-peak load, so it never exercised the load where the bug appears.",
          why: "Performance defects often show only under heavy load. A canary should be large and long enough to be representative, which includes a realistic traffic level.",
        },
        {
          id: "c",
          text: "It compared the canary with a snapshot from before the deploy rather than with the old version running at the same time.",
          why: "That is a real flaw in some canaries, but the symptom here, clean at night and broken at peak, points at load, not at the comparison method.",
        },
        {
          id: "d",
          text: "It watched error rate instead of CPU.",
          why: "Error rate and latency are the better signals, because CPU can rise without hurting anyone. The mistake was the traffic the canary saw.",
        },
      ],
      answer: "b",
    },
    {
      id: "rs-expand-contract-order",
      chapter: "sysdes-release-safety",
      level: "advanced",
      skill: "sequence",
      section: "rollback-is-a-feature-you-have-to-design",
      kind: "order",
      prompt: "<p>You want to rename a database column used by a live service. Put the releases in order.</p>",
      items: [
        { id: "expand", text: "Add the new column alongside the old one" },
        { id: "both", text: "Deploy code that writes both columns and still reads the old one" },
        { id: "backfill", text: "Backfill old rows, then switch reads to the new column" },
        { id: "stop", text: "Stop writing the old column" },
        { id: "contract", text: "Drop the old column in a later release" },
      ],
      why: "Each release stays compatible with the one before it, so a rollback is safe at every step. Dropping the old column is last and alone, because it destroys the data the previous release would need.",
    },
    {
      id: "rs-first-move",
      chapter: "sysdes-release-safety",
      level: "advanced",
      skill: "tradeoff",
      section: "when-it-breaks-anyway-incident-response",
      kind: "single",
      prompt:
        "<p>Five minutes after a deploy, error rates are climbing and the cause is unclear. What is the right first move?</p>",
      choices: [
        {
          id: "a",
          text: "Keep investigating until the root cause is certain, then act.",
          why: "Every minute spent investigating is a minute users are hurt. Diagnosis can continue after the harm has stopped.",
        },
        {
          id: "b",
          text: "Roll back the deploy or turn off its flag, then investigate.",
          why: "Mitigation comes first: restore service by the quickest safe means, then find the cause while users are no longer affected.",
        },
        {
          id: "c",
          text: "Write the postmortem so the facts are fresh.",
          why: "The postmortem comes after the incident. It also depends on the log of what was done during it.",
        },
        {
          id: "d",
          text: "Wait ten minutes to see whether the errors settle.",
          why: "Waiting can turn a small blast radius into a large one. When a deploy is the likely cause, undoing it is cheap and reversible.",
        },
      ],
      answer: "b",
    },
    {
      id: "rs-postmortem-contents",
      chapter: "sysdes-release-safety",
      level: "advanced",
      skill: "concept",
      section: "blameless-postmortems",
      kind: "multi",
      prompt: "<p>Select everything a good blameless postmortem includes.</p>",
      choices: [
        {
          id: "a",
          text: "A timeline of what happened and what was done.",
          why: "The running log from the incident becomes the timeline, which is how the team agrees on the facts.",
        },
        {
          id: "b",
          text: "The name of the engineer who made the change, as the root cause.",
          why: "Naming a person as the cause teaches people to hide facts. The question is why the system allowed one slip to become an outage.",
        },
        {
          id: "c",
          text: "Action items with an owner and a priority.",
          why: "Without an owner and a priority, actions are wishes. They are tracked until done, and reviewed in the next postmortem.",
        },
        {
          id: "d",
          text: "Contributing causes, including what went well and what went badly.",
          why: "Incidents have several causes, and recording what worked tells the team what to keep.",
        },
        {
          id: "e",
          text: '"Human error" as the final explanation.',
          why: "Human error is where an analysis starts, not where it ends. A better question is what made the error easy to make and hard to catch.",
        },
      ],
      answers: ["a", "c", "d"],
    },
  ],
};
