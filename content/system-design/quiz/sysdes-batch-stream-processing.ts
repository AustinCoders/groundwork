import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "bsp-billing-clock",
      chapter: "sysdes-batch-stream-processing",
      level: "advanced",
      skill: "concept",
      section: "event-time-against-processing-time",
      kind: "single",
      prompt:
        "<p>Per-minute ad-click counts are used for billing. After an outage the stream job restarts and replays two hours of retained clicks from the log in about ten minutes. Which time should the windows use so that the replay produces the same per-minute counts the live run would have produced?</p>",
      choices: [
        {
          id: "a",
          text: "Processing time, since it is the one clock every machine in the pipeline can observe.",
          why: "Processing time is the simplest and lowest-latency choice, but it is not deterministic. During the replay two hours of clicks would be counted in the few minutes the pipeline spent reading them, so the per-minute numbers would be wrong.",
        },
        {
          id: "b",
          text: "Event time, so each click lands in the minute it happened, however late it is seen.",
          why: "Event time assigns each click to the minute in which it occurred on the device. That does not depend on when or how fast the pipeline reads it, so a replay reproduces the same counts once all the data has arrived, provided no record is dropped as late.",
        },
        {
          id: "c",
          text: "Processing time with hourly windows, so that arrival delays shrink next to the window.",
          why: "A larger window does not remove the problem. A two-hour backlog read in ten minutes is still packed into the one or two processing-time hours in which the replay ran, instead of the hours in which the clicks happened.",
        },
        {
          id: "d",
          text: "Either clock, because watermarks make processing-time windows reproducible on replay.",
          why: "Watermarks are the mechanism that moves event time forward. Processing-time windows depend only on when records are observed, so replaying at a different speed gives different counts whatever the watermarks do.",
        },
      ],
      answer: "b",
    },
    {
      id: "bsp-idle-partition-stall",
      chapter: "sysdes-batch-stream-processing",
      level: "advanced",
      skill: "diagnose",
      section: "watermarks-a-heuristic-for-nothing-older-is-coming",
      kind: "single",
      prompt:
        "<p>A Flink job aggregates one-minute event-time windows over a 12-partition topic, using bounded out-of-orderness watermarks and no idleness setting. Overnight, no window fires for any key, yet records keep arriving, checkpoints complete normally and no task is under backpressure. Throughput is normal on eleven source partitions and the twelfth has emitted nothing for hours. What is the most likely cause?</p>",
      choices: [
        {
          id: "a",
          text: "Allowed lateness is zero, so every window result is discarded as late before it can be emitted.",
          why: "Allowed lateness only decides what happens to records that arrive behind the watermark. A value of zero is the default and does not stop windows firing once the watermark passes their end.",
        },
        {
          id: "b",
          text: "Barrier alignment is waiting on the idle partition's barrier, which blocks every window from firing.",
          why: "Barrier alignment only affects when a checkpoint completes, and the checkpoints here complete normally. It is not what decides when a window fires.",
        },
        {
          id: "c",
          text: "The out-of-orderness bound is too small, so the watermark runs far ahead of the data.",
          why: "A bound that is too small lets the watermark advance sooner, so windows fire early and more records count as late. The symptom here is the opposite, with no window firing at all.",
        },
        {
          id: "d",
          text: "The idle partition holds the watermark back, since an operator takes the minimum across its inputs.",
          why: "A watermark is the minimum over the parallel inputs, so one input that produces nothing keeps it from advancing and no window end is passed. Marking inputs idle after a timeout, as <code>withIdleness</code> does, lets the other partitions move time forward.",
        },
      ],
      answer: "d",
    },
    {
      id: "bsp-sliding-assignments",
      chapter: "sysdes-batch-stream-processing",
      level: "advanced",
      skill: "estimate",
      section: "windows-three-shapes-of-per-minute",
      kind: "single",
      prompt:
        "<p>A stream job keeps 15-minute sliding windows that start every 3 minutes, and events arrive at a steady 8,000 per second. Each event is assigned to every window that contains it. In steady state, how many window assignments does the job make per second?</p>",
      choices: [
        {
          id: "a",
          text: "8,000",
          why: "That is one assignment per event, which is what tumbling windows would give. Sliding windows overlap whenever the slide is shorter than the length, so each event belongs to several windows.",
        },
        {
          id: "b",
          text: "1,600",
          why: "This divides by the overlap instead of multiplying. Each event is in more windows than one, so the assignment rate is higher than the arrival rate, not lower.",
        },
        {
          id: "c",
          text: "40,000",
          why: "An event belongs to length ÷ slide windows, here 15 ÷ 3 = 5. Five assignments per event at 8,000 events a second gives 40,000 a second, and each key holds five open windows.",
        },
        {
          id: "d",
          text: "120,000",
          why: "That treats the slide as 1 minute, giving 15 windows per event. The stem says the windows start every 3 minutes, so the overlap is 5, not 15.",
        },
      ],
      answer: "c",
    },
    {
      id: "bsp-catch-up-time",
      chapter: "sysdes-batch-stream-processing",
      level: "advanced",
      skill: "estimate",
      section: "state-and-checkpoints-how-a-stream-job-survives-a-crash",
      kind: "single",
      prompt:
        "<p>A stream job reads 4,000 events a second from a retained log. It crashes 30 seconds after its last checkpoint, and restarting, including restoring state, takes 90 seconds. On restart it rewinds to the checkpointed offset. Once running it can process 6,000 events a second while new events keep arriving at 4,000 a second. How many seconds after the restart finishes has it caught up?</p>",
      choices: [
        {
          id: "a",
          text: "240 seconds",
          why: "The backlog is the 30 seconds to redo plus the 90 seconds of downtime, 120 s × 4,000 = 480,000 events. The job gains 6,000 − 4,000 = 2,000 events a second on the input, so it needs 480,000 ÷ 2,000 = 240 seconds.",
        },
        {
          id: "b",
          text: "120 seconds",
          why: "This is the time span of the backlog, 30 s plus 90 s, not the time to clear it. Clearing it takes longer because new events keep arriving while the job works.",
        },
        {
          id: "c",
          text: "80 seconds",
          why: "This divides the backlog of 480,000 by the full 6,000 a second capacity and forgets that 4,000 new events arrive every second. Only the 2,000 a second of spare capacity reduces the backlog.",
        },
        {
          id: "d",
          text: "180 seconds",
          why: "This counts only the 90 seconds of downtime, 360,000 events ÷ 2,000. After restoring a checkpoint the job also has to redo the 30 seconds processed since it, so the backlog is larger.",
        },
      ],
      answer: "a",
    },
    {
      id: "bsp-kafka-sink-duplicates",
      chapter: "sysdes-batch-stream-processing",
      level: "advanced",
      skill: "diagnose",
      section: "delivery-guarantees-and-what-exactly-once-means-here",
      kind: "single",
      prompt:
        "<p>A Flink job writes to Kafka with the sink in exactly-once mode. Its producer transaction timeout comfortably exceeds the maximum checkpoint duration plus the maximum restart time. After a task failure and recovery, a downstream application sees some records twice, while a tool that reads the same topic with <code>isolation.level=read_committed</code> sees each record once. What is the most likely cause?</p>",
      choices: [
        {
          id: "a",
          text: "Each transaction is committed twice, so the topic holds two copies of every record.",
          why: "The read_committed view shows each record once, so the log holds one committed copy of each. Duplicates seen only by the application point at how it reads, not at repeated commits.",
        },
        {
          id: "b",
          text: "The producer transaction timeout is too short, so Kafka expires transactions and replays them.",
          why: "The stem says the timeout is comfortably long enough. Expiry of an uncommitted transaction is a risk of data loss, as the connector documentation warns, not a source of duplicate records.",
        },
        {
          id: "c",
          text: "The application uses the default read_uncommitted level, so it also reads the aborted attempt.",
          why: "Records from the transaction that was in flight at the crash are aborted on recovery and written again by the replay. A consumer in read_uncommitted mode, which is Kafka's default, sees both the aborted and the replayed copies.",
        },
        {
          id: "d",
          text: "Checkpoints are too infrequent, and a shorter interval would stop consumers seeing duplicates.",
          why: "The checkpoint interval changes how much is replayed and how soon output becomes visible. It does not stop a read_uncommitted consumer from seeing records of a transaction that was later aborted.",
        },
      ],
      answer: "c",
    },
    {
      id: "bsp-kappa-cutover-order",
      chapter: "sysdes-batch-stream-processing",
      level: "advanced",
      skill: "sequence",
      section: "lambda-against-kappa",
      kind: "order",
      prompt:
        "<p>The job's logic has changed and the input log is already retained long enough to cover the history. Put the steps of the replay-based reprocessing approach in the order the chapter gives them.</p>",
      items: [
        {
          id: "start",
          text: "Start a second instance of the job from the beginning of the log, writing to a new output table",
        },
        { id: "catchup", text: "Let the second instance catch up with the live end of the log" },
        { id: "switch", text: "Switch the readers over to the new table" },
        { id: "cleanup", text: "Stop the old job and delete the old table" },
      ],
      why: "The new instance has to exist and finish replaying before it has anything correct to serve, so catching up comes before the switch. Readers move only once the new table is complete. The old job and table are removed last, because until the switch they are still serving readers and can be kept as a fallback.",
    },
    {
      id: "bsp-exactly-once-ingredients",
      chapter: "sysdes-batch-stream-processing",
      level: "advanced",
      skill: "concept",
      section: "delivery-guarantees-and-what-exactly-once-means-here",
      kind: "multi",
      prompt:
        "<p>An end-to-end exactly-once effect, from a Kafka source through a Flink job to a sink, needs three things. Which of these are among them? Select every one.</p>",
      choices: [
        {
          id: "a",
          text: "A sink that is transactional or idempotent",
          why: "Records are replayed after a failure, so a sink that cannot absorb a repeat would show the effect twice. A transaction or an idempotent write makes the replayed output harmless.",
        },
        {
          id: "b",
          text: "Event-time windows with a watermark bound of zero",
          why: "Event time and watermarks decide when windows fire and how late data is handled. They are not part of what makes each event affect the managed state once.",
        },
        {
          id: "c",
          text: "A source that can be replayed from an earlier position",
          why: "Recovery works by rewinding the input to the checkpointed offset. Without a replayable source such as a Kafka offset, the events lost with the crash could not be read again.",
        },
        {
          id: "d",
          text: "A nightly batch job that recounts the previous day",
          why: "Reconciliation is a sound way to correct late or dropped data, but it is not one of the three ingredients. The exactly-once effect has to hold in the live path without it.",
        },
        {
          id: "e",
          text: "Operator state restored from a consistent checkpoint",
          why: "The checkpoint holds state matching exactly the source offsets it recorded, so replaying from those offsets does not count events twice.",
        },
      ],
      answers: ["a", "c", "e"],
    },
    {
      id: "bsp-search-index-sync",
      chapter: "sysdes-batch-stream-processing",
      level: "advanced",
      skill: "tradeoff",
      section: "change-data-capture-and-derived-data",
      kind: "single",
      prompt:
        "<p>A product service writes each change to PostgreSQL and then to a search index. After crashes the index sometimes misses changes, and when two requests update the same product at once the index can end up permanently holding the older value. Search results must be fresh within seconds. Which redesign addresses both symptoms?</p>",
      choices: [
        {
          id: "a",
          text: "Publish the database's own change log to a topic and have the indexer apply it in order.",
          why: "Making the database's change log the single source gives the index one stream of changes ordered per key, so a crash between two writes cannot lose one and concurrent updates cannot arrive reversed. Consumers should expect duplicates and apply changes with upserts.",
        },
        {
          id: "b",
          text: "Retry the index write from inside the service until it succeeds, then acknowledge the request.",
          why: "If the process crashes between the two writes, the retry state is lost with it. Retries also do nothing about two concurrent updates reaching the index in the opposite order from the database.",
        },
        {
          id: "c",
          text: "Write to the index first and to the database second, so the source of truth lands last.",
          why: "Swapping the order only changes which store can miss a change after a crash. The two writes are still not atomic, and concurrent writers can still apply them in different orders.",
        },
        {
          id: "d",
          text: "Rebuild the whole index from the database every night, and tolerate drift in between.",
          why: "A nightly rebuild repairs drift only once a day, so it cannot meet a freshness target measured in seconds. It also leaves both symptoms in place during the day.",
        },
      ],
      answer: "a",
    },
  ],
};
