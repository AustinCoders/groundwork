import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "ob-fanout-fast-share",
      chapter: "sysdes-observability-scale",
      level: "advanced",
      skill: "estimate",
      section: "fan-out-why-p99-per-service-is-not-p99-per-user",
      kind: "single",
      prompt:
        "<p>A user request calls 50 backend services and is fast only if every one of them is fast. Each service independently lands in its own slow tail on 1% of calls. About what share of user requests avoid every slow tail?</p>",
      choices: [
        {
          id: "a",
          text: "99%, because each service's p99 carries over to the user unchanged",
          why: "A per-service p99 describes one call. A user request needs all 50 calls to stay out of the tail, and that is far less likely than any single call doing so.",
        },
        {
          id: "b",
          text: "60.5%, since 0.99 is multiplied 50 times",
          why: "The chance of avoiding every slow tail is 0.99 to the 50th power, which is about 0.605. This is the same arithmetic as the chapter's table, which gives 0.366 at 100 services.",
        },
        {
          id: "c",
          text: "50%, since 50 services at 1% each remove half the requests",
          why: "Subtracting 1% fifty times treats the slow events as if they never overlapped. Survival chances multiply instead, so the answer is a product, not 100% minus 50 × 1%.",
        },
        {
          id: "d",
          text: "39.5%, since 0.99 to the 50th power is the slow share",
          why: "That power is the share of requests that avoid every slow tail. The slow share is one minus it, about 39.5%, which is the opposite of what the question asks.",
        },
      ],
      answer: "b",
    },
    {
      id: "ob-error-budget-runway",
      chapter: "sysdes-observability-scale",
      level: "advanced",
      skill: "estimate",
      section: "slos-and-error-budgets-making-the-alert-threshold-non-arbitr",
      kind: "single",
      prompt:
        "<p>A service has a 99.9% availability SLO over a rolling 30 days, with the budget untouched today. From now on, traffic stays constant and 0.72% of requests fail, steadily. How long until the whole 30-day error budget is spent?</p>",
      choices: [
        {
          id: "a",
          text: "720 hours, because the budget is meant to last the whole window",
          why: "That is how long the budget lasts at a burn rate of exactly 1. At 0.72% errors the service spends it seven times faster than the SLO allows.",
        },
        {
          id: "b",
          text: "43.2 minutes, because that is the downtime a 99.9% SLO allows",
          why: "43.2 minutes is the budget expressed as a full outage. Only 0.72% of requests are failing, not all of them, so the same budget lasts much longer.",
        },
        {
          id: "c",
          text: "10 hours, because 0.72% reads as a 72x burn rate",
          why: "The budget rate is 0.1%, so 0.72% is a burn rate of 7.2, not 72. A decimal slip makes the runway ten times too short.",
        },
        {
          id: "d",
          text: "100 hours, since 0.72% is 7.2 times the 0.1% budget rate",
          why: "Burn rate is the observed error rate divided by the allowed rate, here 0.72 / 0.1 = 7.2. The 720-hour window divided by 7.2 gives 100 hours, a little over four days.",
        },
      ],
      answer: "d",
    },
    {
      id: "ob-pod-label-series-growth",
      chapter: "sysdes-observability-scale",
      level: "advanced",
      skill: "diagnose",
      section: "cardinality-is-the-thing-that-makes-metrics-expensive",
      kind: "single",
      prompt:
        "<p>A request counter carries the labels <code>service</code>, <code>endpoint</code>, <code>status</code> and <code>pod</code>. The fleet stays at about 40 pods and traffic is flat, but the autoscaler replaces pods many times a day. The metrics server holds many times more series than 40 pods times the other label combinations would give, and its memory use is high. What explains it, and what is the fix?</p>",
      choices: [
        {
          id: "a",
          text: "A counter stores a sample per request, so storage follows traffic. Sample the requests before counting them.",
          why: "A counter keeps one value per series per scrape, however many requests it counts. The cost follows unique series, and traffic here is flat.",
        },
        {
          id: "b",
          text: "Old series never age out, so every pod ever seen stays in memory. Restart the metrics server weekly.",
          why: "Series that stop receiving samples do age out. The real growth is the number of distinct series that new pods keep creating, and a restart does nothing to stop that.",
        },
        {
          id: "c",
          text: "Each new pod name creates fresh series, so the count follows churn. Drop the pod label from the metric.",
          why: "Series count is one per distinct label combination. Replaced pods keep introducing new values, so what grows is churn, not fleet size. In an autoscaling fleet, pod identity belongs in logs or traces rather than in a metric label.",
        },
        {
          id: "d",
          text: "The scrape interval is too short, so every series holds too many samples. Lengthen the interval.",
          why: "A longer interval reduces samples per series, not the number of series. The label combinations are what multiply here, so memory and index size stay high.",
        },
      ],
      answer: "c",
    },
    {
      id: "ob-keep-the-slow-traces",
      chapter: "sysdes-observability-scale",
      level: "advanced",
      skill: "tradeoff",
      section: "distributed-tracing-and-context-propagation",
      kind: "single",
      prompt:
        "<p>About 0.5% of requests hit a rare path that takes over 3 seconds. Your tracing keeps a fixed 1% head-based sample, so engineers rarely find a trace of that path when they need one. You want every slow trace kept without storing all the normal ones. Which change does that most directly?</p>",
      choices: [
        {
          id: "a",
          text: "Sample at the collector once each trace completes, keeping the slow and errored ones.",
          why: "Tail-based sampling decides after the outcome is known, so slowness itself can be the keep rule. The price is a collector that holds every in-flight trace in memory and needs all spans of a trace routed to it.",
        },
        {
          id: "b",
          text: "Raise the head-based rate from 1% to 10%, so slow traces are ten times as likely to be kept.",
          why: "The decision is still made before the outcome is known, so it keeps a random 10% of slow traces and drops the other 90%. It also multiplies trace storage tenfold.",
        },
        {
          id: "c",
          text: "Switch to head-based sampling with a per-route rate limit, so busy routes cannot crowd out rare ones.",
          why: "A per-route limit fixes skew between endpoints, but it still decides at the entry point before the request has proved slow. A rare slow path on a busy route is still sampled at random.",
        },
        {
          id: "d",
          text: "Carry the sampled flag in the traceparent header, so every service agrees on the head decision.",
          why: "That flag is already how head-based sampling keeps a whole tree consistent. It makes the tree complete, but it does not change which requests are chosen.",
        },
      ],
      answer: "a",
    },
    {
      id: "ob-what-to-page-on",
      chapter: "sysdes-observability-scale",
      level: "advanced",
      skill: "tradeoff",
      section: "alert-on-symptoms-not-causes",
      kind: "multi",
      prompt:
        "<p>You are choosing which alerts may wake a human, following the chapter's symptom-first approach. Select every alert the chapter would page on.</p>",
      choices: [
        {
          id: "a",
          text: "The burn rate on a 99.9% SLO stays above 14.4x over both a 1-hour and a 5-minute window.",
          why: "This is the chapter's fast-burn page. It measures how quickly the user-facing budget is being spent, and the short window stops it paging after a blip has recovered.",
        },
        {
          id: "b",
          text: "CPU is above 80% on the app tier.",
          why: "High CPU with acceptable latency is a well-used fleet, and it also fires during harmless work such as a nightly batch job. The chapter keeps it on a dashboard for debugging.",
        },
        {
          id: "c",
          text: "A database disk will fill within a few hours at its current write rate.",
          why: "Saturation is the golden signal to page on when it is nearly problematic. A disk or quota about to fill deserves a page before it causes errors.",
        },
        {
          id: "d",
          text: "Read replica lag is above 5 seconds.",
          why: "Lag only matters if a user reads their own write and does not see it. The chapter pages on stale-read complaints or guard trips, not on the lag figure itself.",
        },
        {
          id: "e",
          text: "p99 request latency crosses the SLO threshold at any moment on the user-facing route.",
          why: "Latency is a symptom, but alerting on the raw SLI is too twitchy: a short blip would wake someone for nothing. The chapter pages on the burn rate of the latency budget over two windows instead.",
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "ob-hedging-guardrail",
      chapter: "sysdes-observability-scale",
      level: "advanced",
      skill: "tradeoff",
      section: "fan-out-why-p99-per-service-is-not-p99-per-user",
      kind: "single",
      prompt:
        "<p>A client sends a hedged request to a second replica whenever the first has not answered by that call's usual p95 latency, which adds about 5% load when things are healthy. A dependency then degrades, and nearly every call takes longer than the old p95. Which guardrail does the chapter pair with hedging to keep load from doubling?</p>",
      choices: [
        {
          id: "a",
          text: "Hedge earlier, at p50, so the second request has more time to finish and users wait less.",
          why: "By definition about half of calls pass p50, so hedging there sends roughly half again as much traffic even when healthy. It raises the baseline load instead of capping it.",
        },
        {
          id: "b",
          text: "Cap hedges at a small share of requests, such as 5%, with a circuit breaker beside them.",
          why: "Under degradation everything exceeds p95, so only a budget and a breaker stop every request from hedging. That is the same discipline as a retry budget.",
        },
        {
          id: "c",
          text: "Send the hedge back to the same replica, so that no additional servers have to take load.",
          why: "The second request still adds work, and it lands on the replica that may be the slow one. Sending to a different replica is what lets a hedge route around a slow one.",
        },
        {
          id: "d",
          text: "Raise the trigger to the healthy p99.9 latency, so that hedges become far rarer.",
          why: "A higher trigger only cuts hedging while the slowdown stays below it. A severe degradation still pushes nearly every call past it, and no trigger setting caps the load. It also gives up most of the tail benefit when healthy.",
        },
      ],
      answer: "b",
    },
    {
      id: "ob-fleet-p99",
      chapter: "sysdes-observability-scale",
      level: "advanced",
      skill: "concept",
      section: "distributed-tracing-and-context-propagation",
      kind: "single",
      prompt:
        "<p>Ten instances each expose a p99 latency computed locally. A dashboard averages the ten numbers and labels the result fleet p99. What is wrong with that, and what should be recorded instead?</p>",
      choices: [
        {
          id: "a",
          text: "Nothing, if the instances take equal traffic, since then the mean of their p99 values is the fleet p99.",
          why: "Equal traffic does not make the mean of p99 values equal the p99 of the combined requests. The result depends on how each instance's latencies are distributed, so it can land well away from the true figure.",
        },
        {
          id: "b",
          text: "Take the maximum of the ten p99 values instead, since the slowest instance sets the fleet p99.",
          why: "The maximum is at best an upper bound on the fleet p99, not its value, and it is off whenever instances differ in traffic or speed. One slow instance with few requests would distort it.",
        },
        {
          id: "c",
          text: "Percentiles do not average. Record histogram buckets, sum across instances, and compute the quantile.",
          why: "Bucket counts can be summed across instances, and the percentile is then read from the combined histogram. Averaging pre-computed percentiles gives a number that matches no real set of requests.",
        },
        {
          id: "d",
          text: "Switch to summaries, which pre-compute exact quantiles per instance and add up cleanly across instances.",
          why: "Summaries compute their quantiles inside each instance and cannot be aggregated across instances, which is the opposite of the claim. Histograms are the type that sum.",
        },
      ],
      answer: "c",
    },
    {
      id: "ob-burn-rate-incident-order",
      chapter: "sysdes-observability-scale",
      level: "advanced",
      skill: "sequence",
      section: "slos-and-error-budgets-making-the-alert-threshold-non-arbitr",
      kind: "order",
      prompt:
        "<p>Take the chapter's dry run of a 99.9% SLO: errors jump to 5% for 20 minutes, and the alert pages only while both the 1-hour and 5-minute burn rates exceed 14.4x. Put these events in the order they happen.</p>",
      items: [
        {
          id: "short",
          text: "The 5-minute window is far above 14.4x almost immediately, but the 1-hour window has not caught up, so nothing pages",
        },
        {
          id: "page",
          text: "The 1-hour window crosses 14.4x after roughly 17 bad minutes, both windows agree, and the page fires",
        },
        {
          id: "end",
          text: "The incident ends, yet both windows still exceed 14.4x for a few minutes, so the page stays lit",
        },
        {
          id: "clear",
          text: "The 5-minute window falls below 14.4x and the alert clears, though the 1-hour window still shows about 17x",
        },
      ],
      why: "The short window reacts first but the long window needs about 17 bad minutes, so the page waits for both to agree. After the incident ends, the 5-minute window takes a few minutes to drain its bad samples, so the page stays lit briefly. It clears when that window drops below the threshold, even though the 1-hour window still looks bad, and that clearing is the whole job of the short window.",
    },
  ],
};
