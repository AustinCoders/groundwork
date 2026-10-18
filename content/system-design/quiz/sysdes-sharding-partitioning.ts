import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "sh-created-at-hotspot",
      chapter: "sysdes-sharding-partitioning",
      level: "advanced",
      skill: "diagnose",
      section: "shard-key-selection-the-decision-you-cannot-take-back",
      kind: "single",
      prompt:
        "<p>A team splits an events table across 8 shards by range on <code>created_at</code>, each shard owning one contiguous span of time. Every event is inserted with the current time. Monitoring shows one shard at its write limit while the other seven are nearly idle. What explains this?</p>",
      choices: [
        {
          id: "a",
          text: "<code>created_at</code> has too few distinct values to split across 8 shards.",
          why: "Timestamps have very high cardinality, so there are plenty of distinct values. Low cardinality is the problem for keys such as country or status, but it is not what is happening here.",
        },
        {
          id: "b",
          text: "New rows always carry the latest time, so every insert hits the newest range.",
          why: "With a range on an ever-increasing key, the newest span is always the one receiving writes, so seven shards sit idle. This is the sequential-key hotspot the chapter calls the most common sharding mistake.",
        },
        {
          id: "c",
          text: "The key is mutable, so rows keep relocating between the 8 shards.",
          why: "A creation time is fixed when the row is inserted, so rows do not move. Mutability is the problem for attributes such as a plan or region, which can change after the row exists.",
        },
        {
          id: "d",
          text: "Range partitioning cannot spread rows evenly, whatever key you give it.",
          why: "Range partitioning spreads load well when writes arrive across the whole key space, for example on a key such as tenant ID. The skew here comes from this particular key, not from the range strategy itself.",
        },
      ],
      answer: "b",
    },
    {
      id: "sh-order-lookup-broadcast",
      chapter: "sysdes-sharding-partitioning",
      level: "advanced",
      skill: "diagnose",
      section: "shard-key-selection-the-decision-you-cannot-take-back",
      kind: "single",
      prompt:
        "<p>An orders table is sharded by the hash of <code>user_id</code> across 16 shards. Nearly every request is a lookup by <code>order_id</code> alone, and the caller does not know the user. Query logs show each lookup being sent to all 16 shards, so every shard is busy even at modest traffic. Which property of a good shard key does this design fail?</p>",
      choices: [
        {
          id: "a",
          text: "The key is not in the column most queries filter on.",
          why: "A query without the shard key cannot be routed to one shard, so it is sent to all of them. This property is query coverage. The key is right for some workloads but wrong for this one, which is why the chapter says to check a key against the read patterns, not just the write ones.",
        },
        {
          id: "b",
          text: "The key has too few distinct values, so shards cannot be told apart.",
          why: "A user ID has very high cardinality, so there are far more values than shards. Low cardinality would cap the shard count, but it does not make lookups by another column fan out.",
        },
        {
          id: "c",
          text: "The key is not immutable, so rows move shards when a user changes.",
          why: "A user ID is assigned once and does not change, so rows stay put. Mutability would cause relocation problems, but it does not explain broadcast reads.",
        },
        {
          id: "d",
          text: "The key does not align with transactions, which is why reads cross shards.",
          why: "Transaction alignment is about keeping rows that must change atomically on one shard. It does not decide where a read is routed, and the symptom here is that reads lack the key.",
        },
      ],
      answer: "a",
    },
    {
      id: "sh-mod-n-grow-by-one",
      chapter: "sysdes-sharding-partitioning",
      level: "advanced",
      skill: "estimate",
      section: "consistent-hashing-and-why-virtual-nodes-are-the-real-trick",
      kind: "single",
      prompt:
        "<p>A cluster places each key on shard <code>hash(key) mod N</code> and grows from N = 10 shards to N = 11. Take the 110 hash values 0 through 109, one per key, which is a full cycle for both moduli. How many of those 110 keys end up on a different shard after the change?</p>",
      choices: [
        {
          id: "a",
          text: "10 of 110, the share a ring would move",
          why: "That is close to what consistent hashing moves, about 1/(N+1) of the keys. With mod N the number is the reverse: 10 is how many keys stay put, namely hash values 0 through 9.",
        },
        {
          id: "b",
          text: "11 of 110, one key in ten",
          why: "Nothing limits the move to one key in ten. A key keeps its shard only when hash mod 10 equals hash mod 11, which holds just for values 0 through 9 in this range.",
        },
        {
          id: "c",
          text: "55 of 110, half of them",
          why: "Half would only hold if each key were equally likely to stay or move. Staying requires the two remainders to match, which is rare, so far more than half move.",
        },
        {
          id: "d",
          text: "100 of 110, about 91 percent",
          why: "Only hash values 0 through 9 have the same remainder under mod 10 and mod 11, so 10 keys stay and 100 move. This is why resizing a mod N cluster moves nearly everything.",
        },
      ],
      answer: "d",
    },
    {
      id: "sh-ring-remove-node",
      chapter: "sysdes-sharding-partitioning",
      level: "advanced",
      skill: "estimate",
      section: "consistent-hashing-and-why-virtual-nodes-are-the-real-trick",
      kind: "single",
      prompt:
        "<p>A consistent-hashing ring has positions 0 to 999. A key at position p belongs to the first token at or after p going clockwise, wrapping from 999 back to 0. Three nodes each own two tokens: A at 120 and 800, B at 300 and 700, C at 380 and 560. Node B is removed from the ring. How many of the 1,000 positions does node A own afterwards?</p>",
      choices: [
        {
          id: "a",
          text: "420, it keeps what it had",
          why: "420 is what A owned before the removal. B's departure frees 320 positions, and the arc ending at B's token at 700 is followed clockwise by A's token at 800, so A gains some of them.",
        },
        {
          id: "b",
          text: "500, the survivors split the ring evenly",
          why: "Nothing forces an even split. Each of B's arcs goes to whichever token follows it, and with only two vnodes each the result is lumpy: A and C end up with different totals.",
        },
        {
          id: "c",
          text: "560, it takes over one of B's two arcs",
          why: "B's arc from 121 to 300 falls to C's token at 380, and its arc from 561 to 700 falls to A's token at 800. A gains 140 positions, 420 plus 140 is 560, and C ends with 260 plus 180, which is 440.",
        },
        {
          id: "d",
          text: "740, it takes over all of B's arcs",
          why: "That is what happens without virtual nodes, when one clockwise successor absorbs the whole range. With vnodes, B's arcs are split between survivors, so A receives only the arc that A's token follows.",
        },
      ],
      answer: "c",
    },
    {
      id: "sh-viral-post-first-step",
      chapter: "sysdes-sharding-partitioning",
      level: "advanced",
      skill: "tradeoff",
      section: "hot-shards-and-the-celebrity-problem",
      kind: "single",
      prompt:
        "<p>On a hash-sharded store, one viral post draws so many reads that its shard is saturated while the other shards are nearly idle. The post will not change for the next hour, and viewers can tolerate content a few seconds old. You want the cheapest measure that takes this load off the shard, without changing the shard key and without making ordinary reads more expensive. Which one fits?</p>",
      choices: [
        {
          id: "a",
          text: "Add more shards so the hash ring spreads the post over more machines.",
          why: "More shards redistribute other keys, but one key still lives on exactly one shard. The unit of load here is a single key, so adding shards does not reduce the traffic on that shard.",
        },
        {
          id: "b",
          text: "Salt every key into 32 sub-keys and have each read fetch all 32 of them.",
          why: "Salting does spread one key over many shards, but applied to every key it makes each ordinary read 32 reads. The chapter limits it to keys detected as hot at runtime, and here ordinary reads must not get dearer.",
        },
        {
          id: "c",
          text: "Cache the post in front of the shard, coalescing misses.",
          why: "A hot key has a very high hit rate, so a cache absorbs nearly all its reads, and stale content is acceptable here. Coalescing stops a miss from stampeding the shard, and no key or ordinary read path changes.",
        },
        {
          id: "d",
          text: "Re-shard on the post's author instead of the post ID, keeping each author's posts together.",
          why: "Changing the key is the most expensive step available and the stem rules it out. Grouping posts by author does not help either, because the viral post still sits whole on one shard, now alongside the author's other posts.",
        },
      ],
      answer: "c",
    },
    {
      id: "sh-logical-shards-growth",
      chapter: "sysdes-sharding-partitioning",
      level: "advanced",
      skill: "tradeoff",
      section: "re-sharding-a-live-system",
      kind: "single",
      prompt:
        "<p>A B2B service has about 20,000 tenants of similar size, and nearly every query filters by tenant ID. It starts on 4 database hosts and expects to need dozens within a few years. The team wants to add hosts later without changing which shard any tenant's rows belong to, only which host serves that shard. Which design gives that?</p>",
      choices: [
        {
          id: "a",
          text: "Hash tenant ID into thousands of logical shards, mapped to hosts by a table.",
          why: "The tenant-to-shard function never changes, so no key is rehashed. Adding a host means moving whole logical shards and updating the placement map. This is the fixed-partition-count approach in the chapter.",
        },
        {
          id: "b",
          text: "Hash tenant ID modulo the host count and rehash the rows whenever a host is added.",
          why: "Changing the modulus changes the shard of most keys, for example about 91 percent when going from 10 to 11. It means rehashing and moving nearly all data, which is the reshuffle the stem wants to avoid.",
        },
        {
          id: "c",
          text: "Use the tenant's current plan as the shard key, and size each host for its plan.",
          why: "A plan is a low-cardinality, mutable attribute, so tenants have to be relocated whenever they change plan and the shard count is capped by the number of plans. It also gives no way to add hosts without moving tenants.",
        },
        {
          id: "d",
          text: "Dedicate one host to each tenant from the start and grow by adding tenants.",
          why: "With about 20,000 similar tenants that would be about 20,000 hosts. Dedicated hardware is a tool for the occasional very large tenant, applied through a directory, not a default for every tenant.",
        },
      ],
      answer: "a",
    },
    {
      id: "sh-country-key-problems",
      chapter: "sysdes-sharding-partitioning",
      level: "advanced",
      skill: "concept",
      section: "shard-key-selection-the-decision-you-cannot-take-back",
      kind: "multi",
      prompt:
        "<p>A design shards a table by <code>country</code>. Assume these facts: every query already filters by country, a row's country never changes after insertion, every transaction touches rows of a single country, there are about 200 countries, traffic per country is very uneven, and the team may eventually need more than 500 shards. Select every problem this key still has against the chapter's key checklist.</p>",
      choices: [
        {
          id: "a",
          text: "Cardinality is too low, because there can never be more shards than distinct countries.",
          why: "You can never have more shards than distinct key values. About 200 countries cannot support the 500 or more shards the team may need.",
        },
        {
          id: "b",
          text: "Access is uneven, because heavy countries make their shards much hotter than the rest.",
          why: "Even data distribution is not enough, since a shard can hold few rows and still take most of the traffic. With very uneven traffic per country, some shards are hot while others idle.",
        },
        {
          id: "c",
          text: "The key is mutable, so rows would move between shards over time.",
          why: "The stem says country never changes after insertion, so this property is satisfied here. Mutability is a real problem for attributes such as plan or region, but not under these assumptions.",
        },
        {
          id: "d",
          text: "The key is missing from most queries, so reads are broadcast to every shard.",
          why: "The stem says every query already filters by country, so reads can be routed to one shard. Absence from queries is a real failure for a key like user ID when reads use order ID, but not here.",
        },
        {
          id: "e",
          text: "The key does not align with the transaction boundary, so every write needs two-phase commit.",
          why: "The stem says each transaction touches rows of one country, so transactions stay on a single shard and no distributed commit is needed. Misalignment would be a problem only if related rows landed on different shards.",
        },
      ],
      answers: ["a", "b"],
    },
    {
      id: "sh-reshard-stages-in-order",
      chapter: "sysdes-sharding-partitioning",
      level: "advanced",
      skill: "sequence",
      section: "re-sharding-a-live-system",
      kind: "order",
      prompt:
        "<p>You are moving a live system to a new shard topology. Put these stages in a safe order: each stage must be in place and proven before the next one relies on it.</p>",
      items: [
        { id: "topology", text: "Stand up the new topology beside the old one, with nothing reading from it" },
        {
          id: "backfill",
          text: "Start change capture and backfill history in throttled chunks, so the new side stays in sync while the old side stays the source of truth",
        },
        {
          id: "shadow",
          text: "Shadow-read: serve from the old side, also read the new side, and compare until mismatches stay at zero",
        },
        { id: "reads", text: "Move reads to the new side in growing slices, with an instant rollback" },
        {
          id: "flip",
          text: "Flip the source of truth, keep dual writing as an undo button, then drop the old topology",
        },
      ],
      why: "Each stage earns the right to start the next. The new topology must exist before data is copied into it. Change capture starts with the backfill, so no write falls into a gap and the new side stays current. A comparison means something only once the new side is populated and current, and the shadow-read step catches the bugs before any user sees the new side. Reads move gradually, because a read that goes wrong is easy to roll back. The source of truth flips last, with dual writing kept briefly as the way back.",
    },
  ],
};
