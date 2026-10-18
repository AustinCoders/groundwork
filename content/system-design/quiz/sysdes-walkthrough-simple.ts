import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "ws-peak-redirects",
      chapter: "sysdes-walkthrough-simple",
      level: "beginner",
      skill: "estimate",
      section: "minute-5-10-back-of-envelope-line-by-line",
      kind: "single",
      prompt:
        "<p>A URL shortener is assumed to create 10 million links a day, with 100 redirects for every link created. Use 86,400 seconds per day and assume peak traffic is 3 times the daily average. About how many redirects per second must the redirect path handle at peak?</p>",
      choices: [
        {
          id: "a",
          text: "About 11,574 per second",
          why: "That is the daily average: 1 billion redirects divided by 86,400 seconds. The question asks for the peak, which is three times the average.",
        },
        {
          id: "b",
          text: "About 3,858 per second",
          why: "This divides the average of 11,574 by 3 instead of multiplying, as if peak traffic were lower than the mean. A peak is by definition above the average, so the redirect path needs more capacity than the average, not less.",
        },
        {
          id: "c",
          text: "About 34,722 per second",
          why: "10 million creates times 100 is 1 billion redirects a day. Divided by 86,400 seconds that is about 11,574 per second on average, and 3 times that is about 34,722 at peak.",
        },
        {
          id: "d",
          text: "About 347 per second",
          why: "This is the peak for creates, 3 times about 116 per second, which then gets mistaken for the redirect rate. Redirects are 100 times the creates, so the read path is two orders of magnitude busier.",
        },
      ],
      answer: "c",
    },
    {
      id: "ws-keyspace-fraction",
      chapter: "sysdes-walkthrough-simple",
      level: "beginner",
      skill: "estimate",
      section: "key-generation-three-strategies-and-the-collision-math",
      kind: "single",
      prompt:
        "<p>Short keys are base62 strings (<code>a-z</code>, <code>A-Z</code>, <code>0-9</code>), so each position has 62 possible characters. The service will have created 18.25 billion links after 5 years. If keys are 6 characters long, about what fraction of all possible keys is then in use?</p>",
      choices: [
        {
          id: "a",
          text: "About 0.5%, a sparse keyspace where random keys almost never collide",
          why: "That is the occupancy of a 7-character keyspace, 18.25 billion out of about 3.52 trillion. With 6 characters there are only about 56.8 billion keys, so the space is far fuller.",
        },
        {
          id: "b",
          text: "About 32%, so about one random draw in three would already collide",
          why: "62 to the sixth power is about 56.8 billion, and 18.25 billion divided by that is about 0.32. A random key would land on a taken key about a third of the time by year five, which is why random generation needs 7 characters.",
        },
        {
          id: "c",
          text: "About 3%, a keyspace with plenty of headroom",
          why: "This is off by a factor of ten, probably from slipping a power of ten when dividing 18.25 billion by 56.8 billion. The real ratio is closer to a third.",
        },
        {
          id: "d",
          text: "Over 100%, so 6 characters cannot hold the links at all",
          why: "That would be true for a smaller alphabet such as base36, where 6 characters give only about 2.2 billion keys. Base62 gives about 56.8 billion, which is more than 18.25 billion, so the links fit.",
        },
      ],
      answer: "b",
    },
    {
      id: "ws-click-counter-load",
      chapter: "sysdes-walkthrough-simple",
      level: "beginner",
      skill: "diagnose",
      section: "data-model-and-the-trap-in-the-click-counter",
      kind: "single",
      prompt:
        "<p>A shortener was sized for about 116 creates per second and about 11,574 redirects per second, served mostly from Redis with a hit rate near 95%. A developer adds <code>UPDATE links SET clicks = clicks + 1 WHERE short_key = ?</code> to every redirect. Within a day the primary database is at its write limit, replicas fall behind, and the most popular links respond slowly. The cache hit rate has not changed. What best explains this?</p>",
      choices: [
        {
          id: "a",
          text: "The 6-character keyspace is filling up, so create requests keep retrying on key collisions.",
          why: "Collisions would slow the create path, which is about 116 writes a second. The symptoms here follow the popular links on the redirect path, and the change that was shipped was a write on every redirect.",
        },
        {
          id: "b",
          text: "Replica lag is breaking the immutable link mapping, so redirects are served from stale rows.",
          why: "The mapping from key to destination never changes after creation, so lag on that data is harmless. The lag here is a symptom of the extra write volume, not the cause of the slowdown.",
        },
        {
          id: "c",
          text: "The Redis cluster is too small, so misses are overwhelming the primary with reads.",
          why: "The stem says the hit rate is unchanged at about 95%, so the read load on the primary is the same as before. The new load is writes, not reads.",
        },
        {
          id: "d",
          text: "Every redirect now writes to the primary, about 100 times the create rate, concentrated on popular rows.",
          why: "A redirect used to be a pure read. At about 11,574 redirects a second, the counter update adds that many writes a second and queues thousands of them on one hot row for a viral link. Counts belong in an append-only stream or a buffered counter, not in the links table.",
        },
      ],
      answer: "d",
    },
    {
      id: "ws-redirect-status-choice",
      chapter: "sysdes-walkthrough-simple",
      level: "beginner",
      skill: "tradeoff",
      section: "minute-10-16-the-api-surface-and-the-redirect-semantics",
      kind: "single",
      prompt:
        "<p>Two product requirements for the shortener's <code>GET /{key}</code> endpoint: every click must reach your servers, including repeat clicks from the same browser within a minute, and a link that is disabled for abuse must stop redirecting in browsers within seconds. Which response meets both requirements?</p>",
      choices: [
        {
          id: "a",
          text: "<code>302</code> with <code>Cache-Control: no-store</code>",
          why: "A 302 is not cached by default and no-store forbids caching, so every click reaches you and a disabled link stops redirecting on the next request. Your own server-side cache is then the only revocation delay, and you can purge it.",
        },
        {
          id: "b",
          text: "<code>301</code> with <code>Cache-Control: private, max-age=90</code>",
          why: "The browser may serve repeat clicks from its own cache for up to 90 seconds, so those clicks never reach you and a disabled link keeps redirecting for up to that long. That misses both requirements, although it is a reasonable choice if a window of a couple of minutes is acceptable.",
        },
        {
          id: "c",
          text: "<code>301</code> with no <code>Cache-Control</code> header",
          why: "RFC 9110 treats 301 as heuristically cacheable, so a browser can keep the redirect for a long time. You would miss repeat clicks and could not take a link down for browsers that already have it.",
        },
        {
          id: "d",
          text: "<code>302</code> with <code>Cache-Control: s-maxage=3600</code> at a CDN, with no purge",
          why: "The shared cache would answer for an hour, so a disabled link keeps redirecting and clicks served at the edge do not reach your origin. Edge caching only works for takedowns when a purge call accompanies it.",
        },
      ],
      answer: "a",
    },
    {
      id: "ws-wrong-site-race",
      chapter: "sysdes-walkthrough-simple",
      level: "beginner",
      skill: "diagnose",
      section: "key-generation-three-strategies-and-the-collision-math",
      kind: "single",
      prompt:
        "<p>A shortener derives each 7-character key by hashing the long URL with a salt. The create code runs <code>SELECT</code> for the key and, if no row exists, runs an upsert that inserts or replaces the row. Rarely, a customer reports that their link opens a stranger's site. Logs show two creates for the same key a few milliseconds apart. What is the most likely cause?</p>",
      choices: [
        {
          id: "a",
          text: "The hash is too weak, and switching to a longer hash function would remove collisions.",
          why: "Truncating any hash to 7 characters makes collisions expected, about 47 million over five years at this volume. A stronger function does not help because the truncation, not the hash, creates the overlap.",
        },
        {
          id: "b",
          text: "A CDN is serving a cached 301 from a previous owner of the key.",
          why: "Cache staleness would send users to an old destination for the same owner, and it does not explain two creates racing for one key. The logs point at the write path.",
        },
        {
          id: "c",
          text: "Both creates saw the key as free, then the second write replaced the first customer's row.",
          why: "Check-then-write is not atomic, so two concurrent creates can both read free and both write, and the later one overwrites the earlier. The fix is a single conditional insert such as <code>ON CONFLICT DO NOTHING</code>, then reading the existing row when nothing was inserted.",
        },
        {
          id: "d",
          text: "A read replica lagged, so the redirect read an older row than the primary held.",
          why: "Lag on an immutable mapping returns the same destination, since the row never changed. Two different owners for one key can only come from two writes landing on the same key.",
        },
      ],
      answer: "c",
    },
    {
      id: "ws-crashed-id-block",
      chapter: "sysdes-walkthrough-simple",
      level: "beginner",
      skill: "tradeoff",
      section: "key-generation-three-strategies-and-the-collision-math",
      kind: "single",
      prompt:
        "<p>A shortener makes keys from a counter encoded in base62. Each app server takes a block of 1,000,000 ids from a central counter and hands them out from memory. One server crashes after using an unknown part of its block. Keys only need to be unique, not gap-free. What should happen to the unused remainder of that block?</p>",
      choices: [
        {
          id: "a",
          text: "Give the whole block to a replacement server so that no ids are wasted.",
          why: "Some ids in that block were already issued before the crash and nobody knows which. Issuing them again would put two different links on one short code, which is a correctness and security bug.",
        },
        {
          id: "b",
          text: "Abandon the remainder, because the loss is small next to the size of the keyspace.",
          why: "The counter has already moved past the block, so the replacement server takes a fresh one. Wasting up to a million ids is negligible against about 56.8 billion six-character keys, and it avoids any distributed bookkeeping.",
        },
        {
          id: "c",
          text: "Reset the central counter to the start of the crashed block and continue from there.",
          why: "Rewinding the counter would reissue ids that the crashed server and other servers may already have used. Uniqueness depends on the counter only moving forward.",
        },
        {
          id: "d",
          text: "Replace the counter with a truncated hash, since gaps in the sequence mean the scheme has failed.",
          why: "Gaps are harmless because nothing requires consecutive keys. Switching to a truncated hash would introduce collisions and a retry loop to solve a problem that does not exist.",
        },
      ],
      answer: "b",
    },
    {
      id: "ws-redirect-miss-path",
      chapter: "sysdes-walkthrough-simple",
      level: "beginner",
      skill: "sequence",
      section: "minute-16-30-the-architecture",
      kind: "order",
      prompt:
        "<p>A redirect request arrives for a key that is not in Redis. Put the steps the redirect service takes in the order the chapter's walkthrough runs them.</p>",
      items: [
        { id: "lookup", text: "Look the key up in Redis and get a miss" },
        { id: "read", text: "Read the row from the shard chosen by the hash of the short key" },
        { id: "populate", text: "Write the entry into Redis with a jittered TTL" },
        { id: "respond", text: "Send the 302 with the destination in the Location header" },
      ],
      why: "The cache is always tried first because a hit costs one memory lookup. Only a miss goes to the store, and the shard comes straight from the hash of the key with no lookup. The entry is cached with a jittered TTL so that the next request for this key hits and expiries do not all land together. The response is sent once the destination is known.",
    },
  ],
};
