import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "cst-celebrity-fanout-stall",
      chapter: "sysdes-case-studies",
      level: "advanced",
      skill: "diagnose",
      section: "twitter-timelines-the-hybrid-fan-out",
      kind: "single",
      prompt:
        "<p>A feed service pushes each new post into a Redis list for every follower, through one shared pool of fan-out workers. Reads outnumber posts about 50 to 1, and the timeline of a user who follows no huge accounts must stay a single list fetch. When an account with 30 million followers posts, the workers stay busy for minutes, and followers of ordinary accounts who posted in those minutes see their posts late. Which change addresses the cause?</p>",
      choices: [
        {
          id: "a",
          text: "Make each follower's list longer so that entries stay in it for longer.",
          why: "List length bounds how many entries a list holds, which limits memory. It does not reduce how many insertions one post causes, so the 30 million inserts still sit in the queue.",
        },
        {
          id: "b",
          text: "Fan out on read for every account, so that no insertion work is needed at all.",
          why: "This removes the write cost but turns every timeline read into a merge across everything the user follows. With reads outnumbering posts 50 to 1, it moves the cost onto the hottest path.",
        },
        {
          id: "c",
          text: "Skip write-time fan-out above a follower threshold, merging those posts at read.",
          why: "Write cost grows with follower count, so a few huge accounts cause nearly all of the pain. Skipping fan-out for them keeps ordinary timelines as one list fetch and moves their cost to a small merge at read time. The threshold is a tunable.",
        },
        {
          id: "d",
          text: "Add a Redis replica for each timeline so that the insertions finish a lot sooner.",
          why: "A replica copies the primary's writes. It can spread reads, but it does not reduce the number of insertions a post causes, so the queue is just as long.",
        },
      ],
      answer: "c",
    },
    {
      id: "cst-celebrity-fanout-seconds",
      chapter: "sysdes-case-studies",
      level: "advanced",
      skill: "estimate",
      section: "twitter-timelines-the-hybrid-fan-out",
      kind: "single",
      prompt:
        "<p>An account with 31 million followers posts once. Assume the fan-out workers together make 100,000 timeline insertions per second and nothing else is queued. How long does the fan-out take to reach the last follower's list?</p>",
      choices: [
        {
          id: "a",
          text: "About 31 seconds",
          why: "That drops a zero. Dividing 31 million by 100,000 gives 310, not 31, which is a rate of a million insertions per second rather than the stated 100,000.",
        },
        {
          id: "b",
          text: "About 310 seconds",
          why: "31 million insertions at 100,000 per second is 310 seconds, a little over five minutes. This is why one post from a huge account can hold up everything queued behind it.",
        },
        {
          id: "c",
          text: "About 3,100 seconds",
          why: "That adds a zero, which would be a rate of 10,000 insertions per second. The stem says the workers together make 100,000 per second.",
        },
        {
          id: "d",
          text: "Under 1 second, because the workers run in parallel",
          why: "The rate in the stem is already the combined rate of all the workers. Parallelism is why it is 100,000 per second and not a few thousand, and it does not shorten the total further.",
        },
      ],
      answer: "b",
    },
    {
      id: "cst-shard-id-rate",
      chapter: "sysdes-case-studies",
      level: "advanced",
      skill: "estimate",
      section: "instagram-boring-database-aggressively-applied",
      kind: "single",
      prompt:
        "<p>A 64-bit id is built from 41 bits of millisecond timestamp, 13 bits of logical shard id and 10 bits of sequence that restarts every millisecond within a shard. At most how many ids can one logical shard issue per second?</p>",
      choices: [
        {
          id: "a",
          text: "8,192,000 ids per second",
          why: "8,192 is the number of shards the 13 shard bits can address, not the range of the sequence. Multiplying it by 1,000 mixes up the two fields.",
        },
        {
          id: "b",
          text: "1,024 ids per second",
          why: "1,024 is the sequence range, which is the count per millisecond. A second holds 1,000 milliseconds, so the per-second ceiling is 1,000 times higher.",
        },
        {
          id: "c",
          text: "8,388,608,000 ids per second",
          why: "That is the whole fleet: 8,192 shards each issuing 1,024,000 per second. The question asks about one shard.",
        },
        {
          id: "d",
          text: "1,024,000 ids per second",
          why: "10 sequence bits allow 2^10 = 1,024 ids per millisecond within one shard, and 1,000 milliseconds make a second, so one shard can mint at most 1,024,000 per second.",
        },
      ],
      answer: "d",
    },
    {
      id: "cst-why-hexagons",
      chapter: "sysdes-case-studies",
      level: "advanced",
      skill: "concept",
      section: "uber-a-spatial-index-is-a-sharding-decision",
      kind: "single",
      prompt:
        "<p>Uber's H3 index divides the world into hexagonal cells, and the chapter explains why hexagons were chosen over a square grid. Which is the reason it gives?</p>",
      choices: [
        {
          id: "a",
          text: "All six neighbours of a hexagon are the same distance from its centre.",
          why: "A square has edge neighbours and corner neighbours at different distances, so expanding a search by one ring means different things in different directions. One neighbour distance makes rings and smoothing uniform.",
        },
        {
          id: "b",
          text: "Each hexagon divides exactly into smaller hexagons, so a parent covers the same area as its children.",
          why: "H3's documentation says hexagons do not cleanly subdivide, so geographic containment between resolutions is approximate. Only the logical parent-child relation in the index is exact. The chapter lists this as a cost of hexagons.",
        },
        {
          id: "c",
          text: "A hexagonal grid can wrap the whole sphere without any odd-shaped cells.",
          why: "Covering a sphere with hexagons needs exactly twelve pentagons, which H3 places over the ocean. The chapter lists the pentagons as a correctness footnote, not a benefit.",
        },
        {
          id: "d",
          text: "A hexagonal cell id needs fewer bits than a square cell id would.",
          why: "H3 cell ids are 64 bits, and square-based indexes such as S2 also use 64-bit ids. The cell shape does not decide how wide the id is.",
        },
      ],
      answer: "a",
    },
    {
      id: "cst-discord-hot-channel",
      chapter: "sysdes-case-studies",
      level: "advanced",
      skill: "tradeoff",
      section: "discord-coalescing-in-front-of-a-hot-partition",
      kind: "single",
      prompt:
        "<p>A chat service stores messages in a wide-column store partitioned by <code>(channel_id, bucket)</code>. Occasionally ten thousand clients request the latest page of the same busy channel in the same instant, and that partition's replicas slow down for the whole cluster. You want a fix with no TTL to tune, no invalidation, and nothing served that is older than a read already in flight. What do you build?</p>",
      choices: [
        {
          id: "a",
          text: "A cache with a 30-second TTL in front of the store, keyed by channel and bucket.",
          why: "A TTL cache can serve results up to 30 seconds old, and it brings a TTL to tune and invalidation to manage. The stem rules out both.",
        },
        {
          id: "b",
          text: "Route by channel to one instance; the first request queries, the rest wait.",
          why: "Coalescing lets the first request go to the database while identical concurrent requests share its result, so the partition sees one read. Consistent-hash routing by channel is what makes the crowd meet in one instance.",
        },
        {
          id: "c",
          text: "Add nodes to the cluster so the hot partition's data spreads across more machines.",
          why: "In a store that places each partition on a fixed set of replicas chosen by its key, extra nodes do not share that one partition's reads. The load is genuinely concentrated in one place.",
        },
        {
          id: "d",
          text: "Send requests to random service instances so no single one sees the whole crowd.",
          why: "Random spreading divides the crowd, but each instance still sends its own query for the same partition, so the store receives many reads instead of one. The crowd has to meet in one place to be collapsed.",
        },
      ],
      answer: "b",
    },
    {
      id: "cst-discord-tail-causes",
      chapter: "sysdes-case-studies",
      level: "advanced",
      skill: "diagnose",
      section: "discord-coalescing-in-front-of-a-hot-partition",
      kind: "multi",
      prompt:
        "<p>The chapter describes Discord's Cassandra deployment developing slow tails. Select every cause of those slow tails that the chapter names.</p>",
      choices: [
        {
          id: "a",
          text: "Hot partitions: a few huge channels drew a disproportionate share of reads.",
          why: "The chapter names this first. Load concentrated on one partition's replicas, and bucketing the partition by time does not spread reads that all target the newest bucket.",
        },
        {
          id: "b",
          text: "Tombstones: deletes are writes, and a range scan must read past them.",
          why: "In an LSM store a delete writes a tombstone, and a scan has to skip every tombstone in its range. A channel with heavy deletion became slow to read, which the chapter lists as a cause.",
        },
        {
          id: "c",
          text: "JVM garbage collection: stop-the-world pauses that appeared as p99 spikes.",
          why: "Multi-second pauses on Cassandra nodes were invisible in averages and in error rates. The chapter names them as a cause and notes that ScyllaDB has no garbage collector.",
        },
        {
          id: "d",
          text: "Write throughput: the cluster could not absorb the rate of new messages.",
          why: "The chapter says what broke was not throughput. Writes were not the bottleneck, and the failures it names are about latency and predictability.",
        },
        {
          id: "e",
          text: "Replication lag: replicas fell behind, so reads had to be retried elsewhere.",
          why: "Lagging replicas can hurt read latency in some stores, but the chapter does not name replication lag among Discord's tail causes. The three real causes are the ones about partitions, tombstones and garbage collection.",
        },
      ],
      answers: ["a", "b", "c"],
    },
    {
      id: "cst-netflix-fit",
      chapter: "sysdes-case-studies",
      level: "advanced",
      skill: "tradeoff",
      section: "netflix-precomputed-placement-and-failure-as-a-habit",
      kind: "single",
      prompt:
        "<p>The chapter says Netflix fills appliances inside ISP networks ahead of demand instead of caching on a miss, and that this pays off only under specific conditions. Which service fits that approach best?</p>",
      choices: [
        {
          id: "a",
          text: "Video titles with weekly-repeating demand and a large share of traffic.",
          why: "A finite, slowly changing catalogue with predictable regional demand can be placed ahead of time, and a large traffic share is what justifies running hardware inside ISP networks.",
        },
        {
          id: "b",
          text: "A news site whose most-viewed photos, about 200 KB each, change every hour.",
          why: "Popularity that shifts hourly is hard to predict well enough to fill in advance, and the chapter says not to propose this model for a service serving 200 KB images.",
        },
        {
          id: "c",
          text: "A photo app where any user's upload can go viral within a few minutes.",
          why: "Virality is the opposite of predictable demand. A reactive cache that fills on the first request follows a sudden spike, while a nightly fill cannot anticipate it.",
        },
        {
          id: "d",
          text: "A SaaS dashboard whose JSON responses differ for each customer.",
          why: "Responses that differ per customer are mostly not shared between users, so there is little common content to place in advance, and the traffic is small next to streaming video.",
        },
      ],
      answer: "a",
    },
    {
      id: "cst-scale-check-small-product",
      chapter: "sysdes-case-studies",
      level: "advanced",
      skill: "concept",
      section: "using-a-case-study-without-sounding-like-you-read-a-blog-pos",
      kind: "single",
      prompt:
        "<p>You are asked to design the feed for a product with 100,000 users, where the largest account has a few hundred followers, and every timeline read must stay a single key lookup. Which use of the Twitter case study matches the chapter's advice?</p>",
      choices: [
        {
          id: "a",
          text: "Say Twitter uses a hybrid fan-out, so you will build the hybrid with an 800-entry list cap.",
          why: "This argues from authority and imports a whole architecture. The chapter calls the hybrid a 2013 snapshot of something under exploration, and a product with no large accounts has no tail to justify it.",
        },
        {
          id: "b",
          text: "Skip the case study, because this product is too small for any of it to apply.",
          why: "The pattern still earns its place when it explains a choice. Saying why you are not doing it yet, and what would change your mind, shows the reasoning behind the decision.",
        },
        {
          id: "c",
          text: "Fan out on write for everyone, and add a follower threshold once a heavy tail appears.",
          why: "The celebrity problem needs a large tail of followers. With the biggest fan-out only a few hundred inserts per post, write-time fan-out stays cheap and every read stays a single lookup, and naming the threshold as the trigger to revisit it uses the case study's reasoning without copying its stack.",
        },
        {
          id: "d",
          text: "Fan out on read for everyone, because Twitter showed that merging at read time is cheap.",
          why: "Merging at read time breaks the stated single-key-lookup requirement, because each read must gather posts from everyone the user follows. The case study reserves read-time merging for the few accounts with huge audiences.",
        },
      ],
      answer: "c",
    },
  ],
};
