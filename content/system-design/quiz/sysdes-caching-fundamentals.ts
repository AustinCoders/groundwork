import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "ca-lru-trace",
      chapter: "sysdes-caching-fundamentals",
      level: "beginner",
      skill: "concept",
      section: "eviction-what-happens-when-memory-runs-out",
      kind: "single",
      prompt:
        "<p>A cache with room for 3 entries starts empty and uses a least-recently-used policy. Every miss loads the key and inserts it. The requests arrive in this order: <code>GET a</code>, <code>GET b</code>, <code>GET c</code>, <code>GET a</code>, <code>GET d</code>, <code>GET e</code>. Which keys are in the cache at the end?</p>",
      choices: [
        {
          id: "a",
          text: "c, d and e",
          why: "This is what a first-in-first-out policy would leave, because it evicts by insertion age and a is the oldest insertion. LRU tracks recency of access, and the second GET a made it recent.",
        },
        {
          id: "b",
          text: "a, d and e",
          why: "The hit on a promoted it, so when d arrived the least recently touched key was b and it was evicted. When e arrived, c was the least recently touched and it went too, leaving a, d and e.",
        },
        {
          id: "c",
          text: "b, c and e",
          why: "This is the result of evicting the most recently used key each time, which is the opposite of LRU. It would throw away the hot keys and keep the cold ones.",
        },
        {
          id: "d",
          text: "a, b and c",
          why: "This treats the cache as if it stopped admitting new keys once full. A full LRU cache still admits every new key by evicting the least recently used one, so d and e are both inserted.",
        },
      ],
      answer: "b",
    },
    {
      id: "ca-miss-rate-slip",
      chapter: "sysdes-caching-fundamentals",
      level: "beginner",
      skill: "estimate",
      section: "hit-rate-arithmetic-why-90-is-not-a-good-number",
      kind: "single",
      prompt:
        "<p>A read tier serves 400,000 reads per second and every miss goes to the database. The cache hit rate is 99%, then a bad deploy drops it to 96% while traffic stays the same. How many reads per second now reach the database?</p>",
      choices: [
        {
          id: "a",
          text: "12,000 reads per second, because three points were lost",
          why: "This counts the three lost percentage points as if they were a multiplier of three. Load follows the miss rate, which went from 1% to 4%, so the load is four times higher, not three.",
        },
        {
          id: "b",
          text: "4,000 reads per second, the same as before",
          why: "4,000 is the healthy load at a 1% miss rate. The traffic is unchanged but the miss rate is not, so the database sees more.",
        },
        {
          id: "c",
          text: "1,600 reads per second",
          why: "This applies the miss rate as a fraction of a percent, which is off by a factor of ten. A 4% miss rate means 0.04 of 400,000 reads, not 0.004.",
        },
        {
          id: "d",
          text: "16,000 reads per second, four times the healthy load",
          why: "The miss rate rose from 1% to 4%, and 400,000 × 0.04 = 16,000. This is why the chapter says to reason in miss rate: a drop that looks small in hit rate quadruples the load.",
        },
      ],
      answer: "d",
    },
    {
      id: "ca-node-loss-load",
      chapter: "sysdes-caching-fundamentals",
      level: "beginner",
      skill: "estimate",
      section: "hit-rate-arithmetic-why-90-is-not-a-good-number",
      kind: "single",
      prompt:
        "<p>A cache tier has 4 equal nodes behind consistent hashing, so each node owns 25% of the keys. It serves 200,000 reads per second at a 98% hit rate, with every miss going to the database. One node dies. Assume traffic is spread evenly across keys, every read for the dead node's keys now misses, and the surviving nodes keep a 98% hit rate. How many reads per second reach the database?</p>",
      choices: [
        {
          id: "a",
          text: "About 53,000 reads per second",
          why: "The new miss rate is 0.25 + 0.75 × 0.02 = 0.265, and 200,000 × 0.265 = 53,000. The dead node's whole share misses, and the survivors still miss 2% of their reads.",
        },
        {
          id: "b",
          text: "About 50,000 reads per second",
          why: "This counts only the dead node's 25% share and forgets that the surviving nodes still miss 2% of their reads, which adds 3,000 more.",
        },
        {
          id: "c",
          text: "About 4,000 reads per second, unchanged",
          why: "4,000 is the healthy figure at a 2% miss rate. Losing a node removes 25% of the keyspace from the cache, so the miss rate cannot stay at 2%.",
        },
        {
          id: "d",
          text: "About 200,000 reads per second, every read",
          why: "That is close to the outcome with naive modulo hashing, where almost every key moves. With consistent hashing only the dead node's keys are remapped, so the other three quarters of the keys still hit.",
        },
      ],
      answer: "a",
    },
    {
      id: "ca-zero-looks-like-miss",
      chapter: "sysdes-caching-fundamentals",
      level: "beginner",
      skill: "diagnose",
      section: "read-strategies-cache-aside-vs-read-through",
      kind: "single",
      prompt:
        "<p>An unread-count endpoint uses cache-aside. Its read path is <code>const hit = JSON.parse(await redis.get(key)); if (hit) return hit;</code>, followed by a database load and a <code>SET</code> with a 300 second TTL. Users with unread messages are served from Redis, but for users whose count is 0 the database query runs on every request, even though Redis holds their key. What is the cause?</p>",
      choices: [
        {
          id: "a",
          text: "The TTL has no jitter, so the zero-count keys all expire at the same moment.",
          why: "Missing jitter causes many keys to expire together, which would hit every user at once on a schedule. Here the symptom follows the value 0 on every request and not a timer.",
        },
        {
          id: "b",
          text: "There is no negative caching, so the database is queried for keys that do not exist.",
          why: "Negative caching covers keys with no row at all. These users do have a row and Redis does hold their key, so the key exists.",
        },
        {
          id: "c",
          text: "The hit test checks the deserialised value for truthiness, so a cached 0 is treated as a miss.",
          why: "The parsed value 0 is falsy, so the code behaves as if nothing was cached. Test the raw reply for null instead, because null is the only real miss signal.",
        },
        {
          id: "d",
          text: "The LRU policy evicts small values first, so counts of zero never stay in the cache.",
          why: "LRU evicts by how recently a key was used and has no preference based on the stored value. Evicted keys would also be missing from Redis, whereas here the key is present.",
        },
      ],
      answer: "c",
    },
    {
      id: "ca-sessions-in-the-cache",
      chapter: "sysdes-caching-fundamentals",
      level: "beginner",
      skill: "tradeoff",
      section: "eviction-what-happens-when-memory-runs-out",
      kind: "single",
      prompt:
        "<p>One Redis instance holds both cached product pages and login sessions, and it runs with <code>allkeys-lru</code>. Under memory pressure users are logged out at random. A lost session is a correctness problem for you, while a lost product page is only a slower request. What is the most sensible fix?</p>",
      choices: [
        {
          id: "a",
          text: "Switch the instance to allkeys-lfu so that frequently used sessions are kept.",
          why: "LFU still evicts keys when memory is full, and it only changes which ones go first. A rarely used session can still be evicted, so the correctness risk remains.",
        },
        {
          id: "b",
          text: "Switch the instance to volatile-ttl so that only keys with a TTL can be evicted.",
          why: "Sessions normally carry a TTL too, so they stay eligible for eviction. The policy would just pick keys closest to expiry, which can still include live sessions.",
        },
        {
          id: "c",
          text: "Increase the product page TTL so that fewer entries are written to the cache.",
          why: "A longer TTL keeps more pages resident, so memory pressure gets no better and may get worse, and a full instance still evicts sessions when it needs space. It does not remove the root problem of mixing two kinds of data.",
        },
        {
          id: "d",
          text: "Move sessions to their own instance, configured with noeviction.",
          why: "Data whose loss is a correctness bug should not sit under an eviction policy. With noeviction a full instance rejects new writes with an error, which is loud and visible, instead of silently dropping sessions.",
        },
      ],
      answer: "d",
    },
    {
      id: "ca-like-counter-write-strategy",
      chapter: "sysdes-caching-fundamentals",
      level: "beginner",
      skill: "tradeoff",
      section: "write-strategies-and-when-each-is-right",
      kind: "single",
      prompt:
        "<p>A page shows a like count. The counts for a few viral posts are incremented about 50,000 times per second in total, and assume the database cannot absorb 50,000 updates per second on those rows. The product owner accepts losing roughly the last second of counts if a cache node crashes. Which write strategy fits?</p>",
      choices: [
        {
          id: "a",
          text: "Write-through, so the cache and the database are updated together on every like.",
          why: "Write-through sends every increment to the database synchronously, so the database still sees 50,000 writes per second on the same rows. It also makes every like pay both latencies.",
        },
        {
          id: "b",
          text: "Write-behind, buffering increments in the cache and flushing the total every second.",
          why: "Increments are coalescable and low value individually, which is the case write-behind is for. Flushing a batched delta turns thousands of row updates into one, at the cost of losing the unflushed second, which the owner accepts.",
        },
        {
          id: "c",
          text: "Cache-aside with invalidation, deleting the cached count after each database write.",
          why: "This still performs a database write for every like, so the write load is unchanged. It also adds a cache miss after every delete, which makes reads worse.",
        },
        {
          id: "d",
          text: "Refresh-ahead, recomputing the count before its TTL expires.",
          why: "Refresh-ahead is a read optimisation for hot keys and does nothing to reduce how many writes reach the database. The write problem would remain exactly as before.",
        },
      ],
      answer: "b",
    },
    {
      id: "ca-hot-key-expiry",
      chapter: "sysdes-caching-fundamentals",
      level: "beginner",
      skill: "tradeoff",
      section: "thundering-herd-and-the-five-ways-to-stop-it",
      kind: "multi",
      prompt:
        "<p>One hot key serves 50,000 reads per second. Recomputing it takes 20 ms, so each time it expires about 1,000 requests miss together and run the same query. Select every measure that reduces that burst on this one key.</p>",
      choices: [
        {
          id: "a",
          text: "Request coalescing, so only one load per key is in flight and the other callers wait for it.",
          why: "A thousand identical concurrent questions get one answer. Within a process this turns the burst into a single query, and across processes it leaves one per app server.",
        },
        {
          id: "b",
          text: "Add jitter to the key's TTL.",
          why: "Jitter spreads expiry across many keys that were populated together. A single hot key still expires once, and the requests that arrive during its recompute still all miss.",
        },
        {
          id: "c",
          text: "Stale-while-revalidate, serving the expired value while one request refreshes it in the background.",
          why: "Callers get an answer immediately and only the refresh touches the database. The cost is bounded staleness, which most read paths tolerate.",
        },
        {
          id: "d",
          text: "Negative caching of missing rows.",
          why: "Negative caching protects against requests for keys that do not exist. This key exists and is simply expiring, so it does not help here.",
        },
        {
          id: "e",
          text: "Early probabilistic recomputation, so a reader usually refreshes the key shortly before it expires.",
          why: "Refreshing early with a probability that rises as expiry nears means one reader normally does the work before the key goes stale. The burst of misses at expiry is largely avoided.",
        },
      ],
      answers: ["a", "c", "e"],
    },
    {
      id: "ca-stale-set-race",
      chapter: "sysdes-caching-fundamentals",
      level: "beginner",
      skill: "sequence",
      section: "invalidation-is-hard-and-here-is-exactly-why",
      kind: "order",
      prompt:
        "<p>A cache-aside deployment writes the database first and only after the commit deletes the cache key. Put these four events in the order that leaves the old value 1 in the cache after a write has changed the row to value 2.</p>",
      items: [
        { id: "read", text: "Reader A misses in the cache and reads value 1 from the database" },
        { id: "commit", text: "Writer B updates the row to value 2 and commits" },
        { id: "delete", text: "Writer B deletes the cache key, which is already empty" },
        { id: "set", text: "Reader A writes value 1 into the cache" },
      ],
      why: "Reader A must read the database before the commit, or it would see value 2. As the stem says, the delete comes after the commit, and here it finds nothing to remove. Reader A's later write then puts the old value into the cache, where it stays until the TTL expires. No step failed, so there was no bug to catch.",
    },
  ],
};
