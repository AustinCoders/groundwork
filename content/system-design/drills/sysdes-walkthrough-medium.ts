import type { DesignDrill } from "../../drill-types";

export const drill: DesignDrill = {
  chapter: "sysdes-walkthrough-medium",
  level: "intermediate",
  title: "Design a social news feed",
  prompt: `<p>"A photo-sharing app wants a home feed: when you open the app you see recent posts from the accounts you follow, and you can keep scrolling. Walk me through the design, and tell me which decision you think matters most."</p>
<p>In scope: creating a post with text and images, following and unfollowing, and the home feed with infinite scroll, newest first. Out of scope: search, ads, direct messages, comment threads, and the training of any ranking model. The figures below are planning assumptions for this exercise, not facts about any real service.</p>
<ul>
  <li>100 million daily active users, each opening the feed 20 times a day, spread evenly over 86,400 seconds. The busiest period runs at 3 times the daily average.</li>
  <li>10% of daily active users publish one post per day. One post in five carries images totalling about 1 MB.</li>
  <li>400 million accounts are registered, and about 200 million of them opened the app in the last 30 days.</li>
  <li>On average an account follows 200 accounts and has 200 followers. The distribution is very skewed: the median account has fewer than 50 followers, a few thousand accounts have more than 1 million, and the largest has 50 million.</li>
  <li>A new post must appear in followers' feeds within a few seconds. Feed load p99 should be under 300 ms. A briefly stale feed is acceptable; an unavailable feed is not.</li>
  <li>A worker pool dedicated to feed fan-out can append about 100,000 entries per second to feed storage.</li>
</ul>`,
  checklist: [
    {
      id: "check-media-path",
      text: "Keeps image bytes off the feed path: images live in object storage behind a CDN and the feed API returns URLs, because image volume dwarfs feed metadata.",
      section: "capacity-estimation-with-the-arithmetic-shown",
    },
    {
      id: "check-ids-in-feed",
      text: "Keeps post IDs, not post bodies, in each user's feed and hydrates the bodies from a cache keyed by post ID, so an edit or delete touches one copy instead of one per follower.",
      section: "the-core-services-and-the-data-model",
    },
    {
      id: "check-write-fanout-cost",
      text: "Costs fan-out on write from the stated numbers: about 116 posts per second times 200 followers is about 23,000 appends per second, and about 70,000 at the 3 times peak. Notes that this is a planning figure and that accounts which post a lot tend to have above-average follower counts, so real load tends to run higher.",
      section: "fan-out-on-write-pay-at-post-time",
    },
    {
      id: "check-read-fanout-cost",
      text: "Costs fan-out on read: about 23,000 feed opens per second times 200 lookups is about 4.6 million lookups per second, with the tail set by the slowest lookup. Uses that with the roughly 200 to 1 read-to-write ratio to justify pushing for the common case.",
      section: "fan-out-on-read-pay-at-feed-time",
    },
    {
      id: "check-unfollow",
      text: "Says what happens to a push-based feed when someone unfollows: either clean the entries out of that user's feed, or filter unfollowed authors when the feed is read.",
      section: "fan-out-on-read-pay-at-feed-time",
    },
    {
      id: "check-celebrity-arithmetic",
      text: "Shows that pushing a post from the 50-million-follower account misses a few-seconds freshness target: 50 million appends at 100,000 per second on the dedicated pool is about 500 seconds.",
      section: "the-celebrity-problem-and-the-hybrid-that-answers-it",
    },
    {
      id: "check-hybrid-threshold",
      text: "Proposes a hybrid that pushes for most authors and pulls for the few that are too costly to push, merged when the feed is read, and justifies the dividing line with a stated criterion such as the freshness target or followers times posting rate.",
      section: "the-celebrity-problem-and-the-hybrid-that-answers-it",
    },
    {
      id: "check-feed-fallback",
      text: "Says what happens when the precomputed feed cannot answer a request, such as a returning user whose feed was never built or a scroll past the stored entries: build it from the followed accounts' posts or read a slower store, instead of failing.",
      section: "ranking-cursors-and-the-caching-stack",
    },
    {
      id: "check-central-decision",
      text: "Names where the fan-out work happens, at post time, at read time or a mix, as the central decision, and justifies the choice with numbers from the estimate.",
      section: "what-the-interviewer-was-actually-scoring",
    },
  ],
  mistakes: [
    {
      id: "mistake-offset-paging",
      text: "Paging the feed by page number and offset. New posts inserted at the head push items down, so the next page repeats entries (and deletions or unfollows can make it skip some), and in a SQL store OFFSET reads and discards all the skipped rows. A cursor holding the last position seen avoids both.",
      section: "ranking-cursors-and-the-caching-stack",
    },
    {
      id: "mistake-inline-fanout",
      text: "Doing the fan-out inside the post request for accounts with large or unbounded follower counts. The request then lasts as long as the push does, and a slow or failed append stalls the post. Making the post durable first and fanning out from a queue keeps the request short.",
      section: "fan-out-on-write-pay-at-post-time",
    },
    {
      id: "mistake-push-to-inactive",
      text: "Pushing every post into the feed of every follower without asking whether write capacity or cost is the constraint, including accounts that have not opened the app for a long time. Much of that write work lands in feeds nobody reads, whereas fanning out only to recently active accounts and building the feed on their return avoids it.",
      section: "fan-out-on-write-pay-at-post-time",
    },
    {
      id: "mistake-hydrate-one-by-one",
      text: "Hydrating each page of feed entries with one sequential read per post. Twenty round trips in a row can use up much of a 300 ms budget, whereas a few parallel batched requests, such as a multi-get per cache shard, keep the page to about one round trip of latency.",
      section: "ranking-cursors-and-the-caching-stack",
    },
    {
      id: "mistake-non-idempotent-append",
      text: "Writing fan-out appends that are not idempotent. Work taken from a queue is commonly delivered at least once, so a retried append can put the same post in a feed twice, whereas an append keyed by post ID makes a retry harmless.",
      section: "what-the-interviewer-was-actually-scoring",
    },
  ],
};
