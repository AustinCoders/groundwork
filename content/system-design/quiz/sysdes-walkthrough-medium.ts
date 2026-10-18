import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "wm-read-lookups-per-second",
      chapter: "sysdes-walkthrough-medium",
      level: "intermediate",
      skill: "estimate",
      section: "capacity-estimation-with-the-arithmetic-shown",
      kind: "single",
      prompt:
        "<p>A news feed has 500 million daily active users. Each opens the feed 15 times a day, spread evenly over 86,400 seconds, and each follows 200 accounts. With fan-out on read, every feed open makes one lookup per followed account, with no caching. About how many lookups per second is that on average?</p>",
      choices: [
        {
          id: "a",
          text: "About 174,000 per second",
          why: "That is the fan-out on write figure, roughly 870 posts per second times 200 followers. Here the multiplier applies to feed opens, which are about 100 times more frequent than posts.",
        },
        {
          id: "b",
          text: "About 87,000 per second overall",
          why: "This counts the feed opens and stops there. Each open makes 200 lookups under fan-out on read, so the lookup rate is 200 times higher.",
        },
        {
          id: "c",
          text: "About 17.4 million per second",
          why: "500 million × 15 ÷ 86,400 is about 87,000 opens per second, and each open makes 200 lookups, so about 17.4 million. That is why pure fan-out on read fails on arithmetic at a 100:1 read ratio.",
        },
        {
          id: "d",
          text: "About 52 million per second at peak",
          why: "This applies a 3× daily peak factor before multiplying by 200. The question asks for the average rate, which has no peak factor.",
        },
      ],
      answer: "c",
    },
    {
      id: "wm-pick-the-design",
      chapter: "sysdes-walkthrough-medium",
      level: "intermediate",
      skill: "tradeoff",
      section: "the-celebrity-problem-and-the-hybrid-that-answers-it",
      kind: "single",
      prompt:
        "<p>A feed service sees 100 reads for every write, and followers must see a post within a few seconds. Nearly every account has a few hundred followers, but a handful have more than 100 million. Assume a typical reader follows about 200 accounts, six of them large, and a worker pool can append at 100,000 per second. Which design fits these numbers?</p>",
      choices: [
        {
          id: "a",
          text: "Push posts to followers for ordinary accounts, pull the few large accounts at read time, and merge.",
          why: "Pushing keeps reads cheap for the common case, and pulling avoids the ruinous write cost of the few huge accounts. With about six large accounts per reader the merge adds only a handful of cached lookups.",
        },
        {
          id: "b",
          text: "Push every post to every follower, and give the large accounts their own queue so they cannot starve other authors.",
          why: "A separate queue protects other authors from being starved, but a large account still needs more than 100 million appends per post. At 100,000 appends per second that is over 1,000 seconds before the last follower sees it.",
        },
        {
          id: "c",
          text: "Pull for everyone: assemble each feed at read time from the followed accounts' posts, with every author's recent posts cached.",
          why: "Caching makes each lookup cheaper, but every feed open still makes about 200 lookups and merges them. At 100 reads per write that puts the most work on the most frequent operation, and the slowest lookup sets the tail latency.",
        },
        {
          id: "d",
          text: "Assemble each feed lazily on read and cache the finished feed for an hour, for all accounts.",
          why: "A cached feed saves repeat opens, but the first open and every expiry still pay the full merge. An hour-old feed also misses the requirement that followers see new posts within a few seconds.",
        },
      ],
      answer: "a",
    },
    {
      id: "wm-offset-repeats",
      chapter: "sysdes-walkthrough-medium",
      level: "intermediate",
      skill: "diagnose",
      section: "ranking-cursors-and-the-caching-stack",
      kind: "single",
      prompt:
        "<p>Users scrolling a newest-first feed see the first few posts of page 2 repeated from the bottom of page 1. The number of repeats equals the number of new posts that arrived between the two requests, and page 2 is fetched with <code>OFFSET 20</code>. What is the cause and the fix?</p>",
      choices: [
        {
          id: "a",
          text: "Fan-out workers sometimes append a post twice. Make the fan-out append step idempotent, so repeats are ignored.",
          why: "A double append would put a post in the stored list twice regardless of paging, and the count would not track arrivals between two requests. Idempotent appends are good practice but do not explain this pattern.",
        },
        {
          id: "b",
          text: "New posts at the head shift every item down, so offset 20 lands on old ones. Use a cursor on the last post ID.",
          why: "An offset counts from the head, which keeps moving as posts are inserted. A cursor encodes a position in the ordering itself, so page 2 starts after the last item the client saw, however many posts arrived.",
        },
        {
          id: "c",
          text: "The CDN caches page 1 and page 2 under the same key. Add the offset to the cache key.",
          why: "A shared cache key would return the same page twice, not page 2 shifted by the number of new arrivals. The repeats here track inserts at the head, which points to offset paging.",
        },
        {
          id: "d",
          text: "Page 2 is read from a lagging replica. Route all feed reads to the primary.",
          why: "Routing reads to the primary does not remove the repeats, because the cause is offset paging itself: each new arrival shifts every later row down by one.",
        },
      ],
      answer: "b",
    },
    {
      id: "wm-ids-not-bodies",
      chapter: "sysdes-walkthrough-medium",
      level: "intermediate",
      skill: "concept",
      section: "the-core-services-and-the-data-model",
      kind: "single",
      prompt:
        "<p>The materialized feed for each user holds a capped, sorted list of post IDs with scores, not the post bodies. What is the main reason for that design?</p>",
      choices: [
        {
          id: "a",
          text: "The stores used for feeds reject entries larger than a few hundred bytes, so post text will not fit.",
          why: "Stores such as Redis and Cassandra accept values much larger than a typical post. Entry size is not the reason, and the design would be right even if bodies fit.",
        },
        {
          id: "b",
          text: "A cursor can only be built from an ID, so a feed holding bodies could not be paged.",
          why: "A cursor is a position in the ordering, such as the last score and post ID. An entry that carried a body would still have an ID next to it, so paging would work either way.",
        },
        {
          id: "c",
          text: "Post bodies are already held at the CDN, so keeping them in the feed would just duplicate them.",
          why: "A CDN caches media by URL, and the post text and metadata come from the post cache. That cache is keyed by post ID, which is exactly why the feed only needs to hold the ID.",
        },
        {
          id: "d",
          text: "An edit or delete then touches one stored post instead of chasing a copy in every follower's feed.",
          why: "Copying the body into a million feeds makes an edit or deletion a million writes and multiplies feed storage. Hydrating from a cache keyed by post ID means a single copy serves every reader.",
        },
      ],
      answer: "d",
    },
    {
      id: "wm-reconnect-storm",
      chapter: "sysdes-walkthrough-medium",
      level: "intermediate",
      skill: "diagnose",
      section: "part-two-the-same-reasoning-applied-to-chat",
      kind: "multi",
      prompt:
        "<p>A chat gateway holding 250,000 WebSockets restarts, and all of its clients notice at the same instant. Select every measure that reduces the risk of a reconnect storm cascading to the next gateway.</p>",
      choices: [
        {
          id: "a",
          text: "Clients reconnect with exponential backoff and random jitter.",
          why: "Randomizing the delay spreads reconnect attempts over time instead of stacking them at the same instants. Without randomness, clients that failed together retry together.",
        },
        {
          id: "b",
          text: "Gateways cap the connection rate and shed the excess instead of queueing it.",
          why: "Shedding keeps a gateway doing useful work for the connections it accepts. Queueing the excess lets a backlog build that the gateway cannot clear, and overload spreads from there.",
        },
        {
          id: "c",
          text: "Restarts are rolled out gradually, draining connections slowly rather than dropping them all at once.",
          why: "A rolling, draining restart means only a small slice of clients reconnects at any moment. Restarting many tasks together is a known trigger for cascading failures.",
        },
        {
          id: "d",
          text: "Every client waits the same fixed 5 seconds before reconnecting.",
          why: "Clients that lost the connection together all return together after 5 seconds, so the herd is delayed rather than spread. A fixed delay only helps if it is randomized.",
        },
        {
          id: "e",
          text: "Clients retry in a tight loop until the connection succeeds.",
          why: "Continuous retries multiply the attempts hitting the load balancer, auth service and registry at the moment they are most strained. This is the storm itself.",
        },
      ],
      answers: ["a", "b", "c"],
    },
    {
      id: "wm-chat-ordering",
      chapter: "sysdes-walkthrough-medium",
      level: "intermediate",
      skill: "tradeoff",
      section: "part-two-the-same-reasoning-applied-to-chat",
      kind: "single",
      prompt:
        "<p>In a chat service, two participants' phones have clocks that differ by about 3 seconds, and messages from one conversation reach different gateway nodes. How should the service order messages so that everyone in the conversation sees the same order?</p>",
      choices: [
        {
          id: "a",
          text: "Sort by the timestamp each client attaches, since every message carries one.",
          why: "Client clocks can be skewed by seconds and users can set them arbitrarily, so an answer can sort ahead of its question. Client time cannot be trusted for order.",
        },
        {
          id: "b",
          text: "Sort by the arrival time recorded at whichever gateway node took the message.",
          why: "Clocks on separate machines are never perfectly in step, and messages from one conversation arrive on different nodes. Two nodes can stamp messages in an order that differs from the real one.",
        },
        {
          id: "c",
          text: "Have the conversation's owning shard assign each message a sequence number.",
          why: "A single owner gives a monotonic number, so order is total inside the conversation, which is the only place anyone can observe it. Clients that pull by sequence number can also detect a gap and re-request the missing message.",
        },
        {
          id: "d",
          text: "Give every message in the whole service the next number from one global counter.",
          why: "Order across unrelated conversations has no observer. One counter serving every message would also be a single point of failure and a contention point shared by unrelated conversations.",
        },
      ],
      answer: "c",
    },
    {
      id: "wm-chat-message-path",
      chapter: "sysdes-walkthrough-medium",
      level: "intermediate",
      skill: "sequence",
      section: "part-two-the-same-reasoning-applied-to-chat",
      kind: "order",
      prompt:
        "<p>Phone A sends a message to phone B, and the two phones are connected to different gateway nodes. Put the delivery steps in the order the chapter's diagram numbers them. Persisting the message is left out, because real systems store it at different points.</p>",
      items: [
        { id: "send", text: "Phone A sends the message over its WebSocket to the gateway holding that socket" },
        { id: "lookup", text: "The registry is asked which gateway node holds the recipient's socket" },
        { id: "publish", text: "The message is published to that gateway node's topic on the pub/sub bus" },
        { id: "deliver", text: "The recipient's gateway writes the frame to phone B's socket" },
      ],
      why: "The sender's own gateway is the only node that can accept the message, so that comes first. The sender's side cannot publish anywhere until it knows which node holds the recipient's socket, which is what the registry lookup answers. Only then can the message go to that node's topic, and the recipient's gateway is the last hop because it owns the final socket.",
    },
    {
      id: "wm-celebrity-fanout-minutes",
      chapter: "sysdes-walkthrough-medium",
      level: "intermediate",
      skill: "estimate",
      section: "the-celebrity-problem-and-the-hybrid-that-answers-it",
      kind: "single",
      prompt:
        "<p>An account with 150 million followers posts under pure fan-out on write. A dedicated worker pool appends the post ID to follower feeds at 100,000 appends per second, and nothing else competes for it. About how long until the last follower's feed holds the post?</p>",
      choices: [
        {
          id: "a",
          text: "About 2.5 minutes",
          why: "This is off by a factor of ten. 150 million appends at 100,000 per second is 1,500 seconds, and 1,500 seconds is 25 minutes, not 2.5.",
        },
        {
          id: "b",
          text: "About 25 minutes",
          why: "150,000,000 ÷ 100,000 = 1,500 seconds, which is 25 minutes. That wait, plus starving other authors' fan-out in the same queue, is what forces large accounts onto the pull path.",
        },
        {
          id: "c",
          text: "About 250 minutes",
          why: "This is ten times too long. Dividing 150 million by 100,000 gives 1,500 seconds, and dividing by 60 gives 25 minutes.",
        },
        {
          id: "d",
          text: "About 1,500 minutes",
          why: "1,500 is the number of seconds, not minutes. Converting 1,500 seconds at 60 seconds per minute gives 25 minutes.",
        },
      ],
      answer: "b",
    },
  ],
};
