import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "ti-monotonic-for-durations",
      chapter: "sysdes-time-ordering-ids",
      level: "advanced",
      skill: "diagnose",
      section: "two-clocks-in-every-computer-for-different-jobs",
      kind: "single",
      prompt:
        "<p>A resolver measures each upstream reply time as <code>end − start</code>, with both readings taken from the Linux wall clock (<code>CLOCK_REALTIME</code>). When NTP steps the clock back one second during a query, the result is negative. The smoothed average that feeds server selection then goes negative too, and the selection code fails. Which change removes the underlying cause?</p>",
      choices: [
        {
          id: "a",
          text: "Sync with NTP every few seconds so that the clock never needs to be stepped.",
          why: "More frequent syncing makes corrections smaller but does not rule out a step. A manual change or a leap second can still move the real-time clock backwards, so the measurement stays unsafe.",
        },
        {
          id: "b",
          text: "Record both readings in UTC rather than in a local time zone.",
          why: "The real-time clock already counts from a UTC-based epoch, so time zones are not involved. A UTC reading can still step backwards, which is exactly what produced the negative result.",
        },
        {
          id: "c",
          text: "Read both ends from the monotonic clock, unaffected by clock steps.",
          why: "A duration on one machine should come from <code>CLOCK_MONOTONIC</code>, which is not settable and not affected by discontinuous jumps. The real-time clock is the one meant for calendar time.",
        },
        {
          id: "d",
          text: "Clamp any negative result to zero and keep the sample in the average.",
          why: "This hides the symptom without fixing the measurement. The interval was still computed across a clock step, so the stored sample is wrong even when it happens not to be negative.",
        },
      ],
      answer: "c",
    },
    {
      id: "ti-drift-ten-minutes",
      chapter: "sysdes-time-ordering-ids",
      level: "advanced",
      skill: "estimate",
      section: "how-wrong-can-a-clock-be",
      kind: "single",
      prompt:
        "<p>Assume a server clock can drift by up to 200 microseconds per second, the conservative bound that Spanner applies. The clock was last corrected exactly 10 minutes ago and nothing has corrected it since. At most how far can it be from true time now?</p>",
      choices: [
        {
          id: "a",
          text: "12 ms",
          why: "That is off by a factor of ten. Ten minutes is 600 seconds, and 600 × 200 microseconds is 120,000 microseconds, not 12,000.",
        },
        {
          id: "b",
          text: "120 ms",
          why: "600 seconds × 200 microseconds per second = 120,000 microseconds, which is 120 ms. Drift grows linearly with the time since the last correction, so a clock that was corrected longer ago can be further off.",
        },
        {
          id: "c",
          text: "720 ms, the figure for a whole hour",
          why: "720 ms is 3,600 seconds × 200 microseconds, the error after one hour. Ten minutes is only a sixth of an hour, so the bound is a sixth of that.",
        },
        {
          id: "d",
          text: "1.2 s, from reading the drift as 2 ms per second",
          why: "This reads the drift as 2,000 microseconds per second, ten times the stated bound. At 200 microseconds per second, 600 seconds give 120,000 microseconds, well under a second.",
        },
      ],
      answer: "b",
    },
    {
      id: "ti-lamport-versus-vector",
      chapter: "sysdes-time-ordering-ids",
      level: "advanced",
      skill: "concept",
      section: "logical-time-order-without-clocks",
      kind: "single",
      prompt:
        "<p>Two events on different processes in a three-process system carry these stamps. Event X has Lamport timestamp 2 and vector clock [0,0,2]. Event Y has Lamport timestamp 3 and vector clock [3,0,0]. What can you conclude about X and Y?</p>",
      choices: [
        {
          id: "a",
          text: "They are concurrent, since each vector is larger in some slot.",
          why: "Event X is larger in the third slot and event Y is larger in the first. Neither vector is less than or equal to the other in every slot, so neither event could have influenced the other.",
        },
        {
          id: "b",
          text: "X happened before Y, since 2 is less than 3.",
          why: "The Clock Condition only runs one way: if a happened before b, then C(a) is less than C(b). A smaller Lamport value does not prove causation, so the Lamport order cannot tell a cause from a coincidence.",
        },
        {
          id: "c",
          text: "Y happened after X, since Y's first vector slot is larger.",
          why: "For Y to come after X, every slot of X's vector would have to be less than or equal to Y's. X's third slot is 2 against Y's 0, so that fails. A larger slot is not a later event, and the vectors show neither precedes the other.",
        },
        {
          id: "d",
          text: "They are ordered, because concurrent events must have equal Lamport values.",
          why: "Nothing in the Lamport algorithm forces concurrent events to share a value, so different values say nothing about causes. The vectors answer the question directly: each is ahead of the other in some slot.",
        },
      ],
      answer: "a",
    },
    {
      id: "ti-hlc-receive-counter",
      chapter: "sysdes-time-ordering-ids",
      level: "advanced",
      skill: "concept",
      section: "hybrid-logical-clocks-timestamps-that-look-like-time-and-res",
      kind: "single",
      prompt:
        "<p>A node's hybrid logical clock currently reads (l, c) = (50, 3), where l is in milliseconds. Its physical clock reads 48, which is a little slow. It receives a message stamped (50, 7). Using the HLC receive rule from the chapter, what is the node's new (l, c)?</p>",
      choices: [
        {
          id: "a",
          text: "(50, 4), counting only its own events",
          why: "That increments the node's own counter and ignores the message. It would apply only if the message's l were smaller. Here the message's l equals the node's l, so the counter must also account for the message's counter of 7.",
        },
        {
          id: "b",
          text: "(50, 7), copying the message",
          why: "Copying the sender's counter would give the received event the same stamp as the send event. The rule takes the larger of the two counters and adds one, so the receive sorts after the send.",
        },
        {
          id: "c",
          text: "(48, 0), following the physical clock",
          why: "l is the largest physical time the node has seen from its own clock or from any message, so it never falls back to a slower reading. Stamping with 48 would put this event before something the node already knows about.",
        },
        {
          id: "d",
          text: "(50, 8), a counter above both inputs",
          why: "The largest of 50, 50 and 48 is 50, which equals both the node's old l and the message's l. In that case c becomes max(3, 7) + 1 = 8, so the new stamp sorts after both inputs even though the physical clock is behind.",
        },
      ],
      answer: "d",
    },
    {
      id: "ti-stamps-never-lower",
      chapter: "sysdes-time-ordering-ids",
      level: "advanced",
      skill: "concept",
      section: "hybrid-logical-clocks-timestamps-that-look-like-time-and-res",
      kind: "multi",
      prompt:
        "<p>A node receives a message carrying a stamp from another node. Select every one of these schemes that guarantees the receiving node will not give any later event a stamp lower than the one it received.</p>",
      choices: [
        {
          id: "a",
          text: "A Lamport clock, which sets its counter above the message's counter",
          why: "On receipt the counter becomes the larger of its own value and the message's, plus one. Every later event therefore carries a larger value than the stamp that arrived.",
        },
        {
          id: "b",
          text: "A hybrid logical clock, which keeps the largest physical time it has seen",
          why: "Its l never falls below the message's l, and when the two are equal the counter is advanced past the message's. Stamps compared as pairs therefore never go below the one received.",
        },
        {
          id: "c",
          text: "Each node's wall clock, synchronised with NTP",
          why: "NTP keeps clocks within milliseconds on a good day but does not make them identical. A receiver whose clock is slow can stamp a later event with a lower value than the message it received.",
        },
        {
          id: "d",
          text: "Each node's monotonic clock reading",
          why: "A monotonic clock only never goes backwards on its own machine. Its starting point is an unspecified moment, such as boot, so readings from two machines cannot be compared.",
        },
        {
          id: "e",
          text: "The leading timestamp bits of a UUIDv7 made on each node",
          why: "Those bits come from the generating machine's wall clock, so they inherit its skew. A node with a slow clock can create a UUIDv7 after receiving a message and still carry an earlier time than the sender's.",
        },
      ],
      answers: ["a", "b"],
    },
    {
      id: "ti-public-id-in-urls",
      chapter: "sysdes-time-ordering-ids",
      level: "advanced",
      skill: "tradeoff",
      section: "generating-ids-uniqueness-order-and-no-coordination",
      kind: "single",
      prompt:
        "<p>A document service puts an identifier in public URLs. The team wants that identifier to reveal neither when a document was created nor how many documents exist, and to be impossible to enumerate by counting upward. The table's primary key is a time-ordered 64-bit ID chosen to keep the B-tree index friendly. What should supply the identifier in the URL?</p>",
      choices: [
        {
          id: "a",
          text: "The primary key itself, since it is already unique for every row.",
          why: "A time-prefixed ID is unique but embeds the creation time, and IDs issued close together are near neighbours that can be walked in order. The chapter warns against using time-based IDs as anything secret.",
        },
        {
          id: "b",
          text: "A separate random value, such as a UUIDv4, kept next to the key.",
          why: "A random value has no embedded time or counter, and keeping it apart from the primary key leaves the index-friendly key alone. An ID is still not an access check, so permissions must be enforced separately.",
        },
        {
          id: "c",
          text: "A UUIDv7, which is a standard format and has 74 random bits.",
          why: "Its leading 48 bits are a Unix millisecond timestamp, so it reveals when the document was created. RFC 9562 also says not to assume UUIDs are hard to guess, and recommends UUIDv4 where unpredictability matters.",
        },
        {
          id: "d",
          text: "A database sequence value, written in hexadecimal for a harder look.",
          why: "Encoding does not hide the underlying counter. Anyone can decode it, count upward through the values and read the volume off the largest one, which are exactly the leaks the team wants to avoid.",
        },
      ],
      answer: "b",
    },
    {
      id: "ti-commit-wait-order",
      chapter: "sysdes-time-ordering-ids",
      level: "advanced",
      skill: "sequence",
      section: "truetime-a-clock-that-reports-its-own-error",
      kind: "order",
      prompt:
        "<p>A Spanner coordinator is committing a read-write transaction. Put these steps in the order the protocol requires.</p>",
      items: [
        {
          id: "prepared",
          text: "The coordinator has heard from every participant that it has prepared",
        },
        {
          id: "choose",
          text: "It picks a commit timestamp s no earlier than the current <code>TT.now().latest</code>",
        },
        { id: "wait", text: "It waits until <code>TT.after(s)</code> is true" },
        {
          id: "reply",
          text: "It tells the client and participants the commit timestamp, and the participants apply the commit and release locks",
        },
      ],
      why: "The timestamp is chosen after every participant has prepared, using the latest edge of the TrueTime interval. The wait then runs until s is surely in the past on every machine. Only after that does the commit become visible, so any transaction that starts after the client hears the result gets a larger timestamp.",
    },
    {
      id: "ti-snowflake-fleet-rate",
      chapter: "sysdes-time-ordering-ids",
      level: "advanced",
      skill: "estimate",
      section: "generating-ids-uniqueness-order-and-no-coordination",
      kind: "single",
      prompt:
        "<p>A Snowflake-style ID has a 41-bit millisecond timestamp, a 10-bit machine id and a 12-bit sequence that restarts at zero each millisecond. A fleet runs 8 generators, each with its own machine id. What is the most IDs the whole fleet can issue in one second?</p>",
      choices: [
        {
          id: "a",
          text: "32,768, one full sequence for each generator",
          why: "That is 8 × 4,096, the most the fleet can issue in a single millisecond, not in a second. A second holds 1,000 milliseconds.",
        },
        {
          id: "b",
          text: "4,096,000, the rate for one generator",
          why: "That is the ceiling for one machine: 4,096 per millisecond × 1,000 milliseconds. The fleet has 8 generators, each with its own machine id and its own sequence.",
        },
        {
          id: "c",
          text: "32,768,000, eight times that of one generator",
          why: "Each generator can issue 2<sup>12</sup> = 4,096 IDs per millisecond, which is 4,096,000 per second. Eight generators with separate machine ids multiply that by 8, giving 32,768,000.",
        },
        {
          id: "d",
          text: "4,194,304,000, as if all 1,024 machine ids were in use",
          why: "That is the ceiling of a full 1,024-machine fleet. Only machine ids actually assigned to running generators can issue IDs, and this fleet uses 8 of them.",
        },
      ],
      answer: "c",
    },
  ],
};
