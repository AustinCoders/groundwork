import type { Chapter } from "../types";

export const sysdesBatchStreamProcessing: Chapter = {
  id: "sysdes-batch-stream-processing",
  num: "A7",
  title: "Batch & stream processing",
  short: "Batch & stream processing",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "The same computation can run over data that has ended or data that never will, and almost every hard question is about what time means and when you are allowed to call an answer final.",
  body: `<h3>One computation, two kinds of input</h3>
<p>
  Batch and stream processing look like two technologies, and the useful way
  to see them is as one idea applied to two kinds of input. Tyler Akidau's
  framing, which most of the field has adopted, splits data by <b>finiteness</b>,
  not by engine: a <em>bounded</em> data set has an end (yesterday's click
  log, a table snapshot) and an <em>unbounded</em> one does not (clicks as they
  happen). A batch job is what you run when the input is bounded; a stream job
  is what you run when it is not. Run a stream engine on a bounded input and
  you get a batch job. The reverse is where people go wrong: running a
  nightly job every minute is not streaming, it is a batch system with a
  short fuse.
</p>
<table>
  <tr><th>&nbsp;</th><th>Batch</th><th>Stream</th></tr>
  <tr><td>Input</td><td>Bounded: a fixed set of files or a snapshot</td><td>Unbounded: records keep arriving, forever</td></tr>
  <tr><td>When is the answer final?</td><td>When the job finishes</td><td>Never, so you decide when to emit and what to do about stragglers</td></tr>
  <tr><td>Latency to a result</td><td>Minutes to hours (the job's schedule plus its runtime)</td><td>Seconds or less</td></tr>
  <tr><td>Failure recovery</td><td>Rerun the failed tasks (or the whole job) over the same input</td><td>Restore the last state snapshot and rewind the input to match it</td></tr>
  <tr><td>Reprocessing after a bug</td><td>The default operation: run the fixed code again</td><td>Replay the retained log through a new job instance</td></tr>
  <tr><td>Natural fit</td><td>Reports, model training, backfills, reconciliation</td><td>Alerts, live dashboards, fraud signals, anything where a stale answer has lost its value</td></tr>
</table>
<p class="sub">
  The practical rule: a bounded input lets the engine use perfect knowledge. It
  can sort by timestamp and wait for the end of the data, so it never has to
  guess when a window is complete. An unbounded input forces the guess, and the
  rest of this chapter is about making it well.
</p>

<h3>From MapReduce to Spark: what actually changed</h3>
<p>
  <b>MapReduce</b> (Dean and Ghemawat, OSDI 2004) is a programming model with two
  user-supplied functions: <b>map</b> turns input key/value pairs into
  intermediate key/value pairs, and <b>reduce</b> merges all the values that share
  an intermediate key. In between, the runtime does the <b>shuffle</b>: it
  partitions the map output by key, moves it across the network and groups it, so
  that every value for one key lands at the same reducer. The programmer writes
  two functions; the runtime handles partitioning, scheduling, machine failure
  and communication. The paper reports that a typical computation processes many
  terabytes on thousands of machines, and that over a thousand jobs a day ran on
  Google's clusters.
</p>
<p>
  The model's limit is the shape of real pipelines. One MapReduce job is one
  map-shuffle-reduce; a useful analysis is a chain of them, and in the classic
  Hadoop arrangement each job reads its input from a distributed file system and
  writes its output back to one. Iterative algorithms (graph ranking, machine
  learning) pay that disk round trip on every pass. <b>Spark</b>, from the
  Berkeley paper on <em>Resilient Distributed Datasets</em> (NSDI 2012), attacked
  exactly that: keep the working data in memory across steps, which the authors
  say can improve performance by an order of magnitude for iterative and
  interactive work. The trick is how it stays fault tolerant without replicating
  memory. An RDD is built by <b>coarse-grained transformations</b> (map, filter,
  join) applied to a base data set, and Spark records the chain of
  transformations. If a partition is lost, Spark recomputes it from the
  transformations that produced it, the <b>lineage</b>, instead of restoring a
  copy.
</p>
<div class="sticky mint">
  <span class="ttl">What did not change</span>
  Spark still shuffles. Its documentation calls the shuffle "an expensive
  operation" because it involves disk I/O, serialization and network I/O; map
  output is kept in memory until it does not fit, then sorted and written to
  files that reducers read, and shuffle files are kept so a lineage recompute
  need not redo them. The shuffle is where batch jobs spend their time, and
  the practical advice (aggregate before you shuffle, so prefer
  <code>reduceByKey</code> over <code>groupByKey</code>) is the same idea as the
  <em>combiner</em> and as the local pre-aggregation you will use in the
  ad-click design below.
</div>

<h3>Log-based streaming: the log is the source of truth</h3>
<p>
  Stream processing started as message-passing between operators. The model that
  won puts a <b>replicated log</b> in the middle (see the
  <a href="/system-design/sysdes-message-queues-async">message queues chapter</a>
  for queues against logs). Events are appended to a Kafka topic; a stream
  engine such as Flink or Kafka Streams reads it with a consumer position that is
  just an offset, computes, and writes results to another topic or a store. Three
  properties of the log carry the whole design:
</p>
<ul>
  <li><b>Replay.</b> The input is retained, so a job that crashes, or ships a bug, can be pointed back at an older offset. Reprocessing is a first-class operation, not a disaster procedure.</li>
  <li><b>Many independent readers.</b> The fraud job, the dashboard job and the warehouse loader each keep their own offsets and cannot slow one another.</li>
  <li><b>A position that is one number per partition.</b> A consumer's position in a partition is a single integer, the offset of the next message to read, which makes checkpointing it cheap. That is what lets a stream engine snapshot "how far I have read" together with "what I have computed".</li>
</ul>
<p>
  The idea underneath is <b>stream-table duality</b>: a stream is the changelog of
  a table (replay it from the start and you rebuild the table), and a table is a
  snapshot of the latest value per key that can be turned back into a stream. Log
  compaction, covered in the queues chapter, is that duality implemented in
  storage. It matters later, because it is why a compacted topic can serve as the
  rebuild source for a derived view.
</p>

<h3>Event time against processing time</h3>
<p>
  Every record has two clocks. <b>Event time</b> is when the thing happened on the
  device that produced it; <b>processing time</b> is when your system observes it.
  Flink's docs describe processing time as simplest and lowest latency but
  nondeterministic, because it depends on the speed at which records arrive; in
  event time, progress depends on the data, not on any wall clock. The gap
  between the two, the <b>skew</b>, is never zero and never constant: a phone in a
  tunnel delivers a click two minutes late, a Kafka consumer that fell behind
  delivers everything late, and a mobile client batches events and uploads them
  every few minutes.
</p>
<p>
  If you aggregate by processing time, "clicks in the 12:00 minute" means "clicks
  my pipeline happened to see during 12:00", which changes when the pipeline is
  slow, restarts or replays. Billing, ranking and anything you will be audited on
  must use event time. The cost is that event-time answers are never obviously
  complete, which is the problem the next section solves.
</p>

<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="Seven click events plotted by arrival time on the horizontal axis and event time on the vertical axis, with a dashed diagonal for zero skew, a horizontal line where the 12:00 window ends, and three events far below the diagonal that arrived 12, 45 and 150 seconds late">
    <g class="rough">
      <path class="ln" d="M70,250 L600,250" />
      <path class="ln" d="M70,250 L70,34" />
      <path class="ln dash" d="M70,250 L316,40" />
      <path class="lnr dash" d="M70,110 L600,110" />
      <circle class="boxg" cx="86"  cy="238" r="6" />
      <circle class="boxg" cx="232" cy="115" r="6" />
      <circle class="boxy" cx="245" cy="129" r="6" />
      <circle class="boxg" cx="245" cy="103" r="6" />
      <circle class="boxg" cx="292" cy="63"  r="6" />
      <circle class="boxy" cx="303" cy="157" r="6" />
      <circle class="boxr" cx="563" cy="180" r="6" />
    </g>
    <text class="sm" x="335" y="272" text-anchor="middle">processing time (arrival), seconds after 12:00:00, 0 to 190</text>
    <text class="sm" x="16" y="26">event time (seconds after 12:00:00, 0 to 90)</text>
    <text class="sm rd" x="604" y="114">window end, 60 s</text>
    <text class="sm" x="96" y="242">e1</text>
    <text class="sm" x="215" y="104">e2</text>
    <text class="sm" x="256" y="136">e3  +12 s</text>
    <text class="sm" x="256" y="100">e4</text>
    <text class="sm" x="300" y="58">e5</text>
    <text class="sm" x="314" y="161">e6  +45 s</text>
    <text class="sm rd" x="480" y="200">e7  +150 s</text>
    <text class="sm" x="330" y="90">no skew</text>
  </svg>
  <figcaption>Schematic of the dry run below, scaled to the 12:00 minute. Distance below the dashed diagonal is skew. e1, e2, e4 and e5 are about a second behind; e3 is 12 s late, e6 is 45 s late and e7 is 150 s late. Every point under the red line belongs to the 12:00 window, however late it arrives.</figcaption>
</figure>

<h3>Watermarks: a heuristic for "nothing older is coming"</h3>
<p>
  A window over event time has to close some time. The engine cannot know that no
  late record is on its way, so it estimates. A <b>watermark</b> is a marker that
  flows through the stream with a timestamp <code>t</code> and the claim "event time
  has reached <code>t</code>; elements at or below <code>t</code> should no longer
  arrive". Flink generates them at or near the sources; a window fires once the
  watermark passes its end. The common strategy is <b>bounded out-of-orderness</b>:
  the watermark is the largest event timestamp seen so far, minus a fixed bound
  (Flink's own example emits <code>currentMaxTimestamp - maxOutOfOrderness - 1</code>
  milliseconds). Spark Structured Streaming defines it the same way: the maximum
  event time seen, minus a threshold you set, such as 10 minutes.
</p>
<p>
  Three consequences are worth saying out loud, because each is a trade-off:
</p>
<ul>
  <li><b>The bound is a dial between latency and completeness.</b> A 10-second bound delays every window result by about 10 seconds past the window end, and still loses anything later than that. A 10-minute bound loses far less and delays every result by 10 minutes. There is no correct value, only the lateness distribution of your data and what a wrong answer costs. Akidau calls watermarks "a reasonably accurate heuristic estimate", not a proof.</li>
  <li><b>The minimum rules, so one slow input stalls everything.</b> An operator with several inputs, or one after a <code>keyBy</code>, takes the <em>minimum</em> of its inputs' watermarks (Spark's default policy for multiple streams is also the minimum). An input that goes quiet, such as an idle Kafka partition, holds the minimum back and no window anywhere fires. Flink's answer is <code>withIdleness</code>, which marks an input idle after a timeout so it stops holding the watermark back.</li>
  <li><b>Spark's guarantee is one-sided.</b> Data less than the threshold behind the latest processed event time is always aggregated; data later than that may or may not be, and the more delayed, the less likely. Do not design as if late means dropped.</li>
</ul>
<p>
  What happens to a late record is a policy, not an accident. Flink's default
  allowed lateness is zero: once the watermark is past the window end, the late
  element is dropped. With <b>allowed lateness</b> greater than zero, a late element
  that still falls inside the window's end plus that lateness is added and the
  window <em>fires again</em> with an updated result, so downstream must tolerate
  updates. Past that, you can route the element to a <b>side output</b> instead of
  discarding it silently, and let a batch job reconcile it later.
</p>

<h3>Windows: three shapes of "per minute"</h3>
<figure>
  <svg viewBox="0 0 640 290" class="dg" role="img" aria-label="Three timelines: tumbling windows of one minute that do not overlap, sliding windows of ten minutes advancing every five minutes that overlap in pairs, and session windows separated by gaps of inactivity">
    <g class="rough">
      <rect class="boxg" x="40"  y="34" width="140" height="30" rx="4" />
      <rect class="boxg" x="180" y="34" width="140" height="30" rx="4" />
      <rect class="boxg" x="320" y="34" width="140" height="30" rx="4" />
      <rect class="boxg" x="460" y="34" width="140" height="30" rx="4" />
      <rect class="boxy" x="40"  y="116" width="280" height="22" rx="4" />
      <rect class="boxy" x="180" y="146" width="280" height="22" rx="4" />
      <rect class="boxy" x="320" y="176" width="280" height="22" rx="4" />
      <rect class="box"  x="40"  y="238" width="160" height="26" rx="4" />
      <rect class="box"  x="240" y="238" width="120" height="26" rx="4" />
      <circle class="boxr" cx="40"  cy="251" r="4" />
      <circle class="boxr" cx="80"  cy="251" r="4" />
      <circle class="boxr" cx="240" cy="251" r="4" />
    </g>
    <text class="lbl" x="16" y="22" style="font-size:14px">tumbling, 1 minute: each event is in exactly one window</text>
    <text class="sm" x="110" y="53" text-anchor="middle">12:00</text>
    <text class="sm" x="250" y="53" text-anchor="middle">12:01</text>
    <text class="sm" x="390" y="53" text-anchor="middle">12:02</text>
    <text class="sm" x="530" y="53" text-anchor="middle">12:03</text>
    <text class="lbl" x="16" y="104" style="font-size:14px">sliding, 10 minutes every 5: each event is in two windows</text>
    <text class="sm" x="180" y="132" text-anchor="middle">[12:00, 12:10)</text>
    <text class="sm" x="320" y="162" text-anchor="middle">[12:05, 12:15)</text>
    <text class="sm" x="460" y="192" text-anchor="middle">[12:10, 12:20)</text>
    <text class="lbl" x="16" y="226" style="font-size:14px">session, gap 30 minutes: the data decides the edges</text>
    <text class="sm" x="120" y="282" text-anchor="middle">session 1: 10:00 to 10:40</text>
    <text class="sm" x="300" y="282" text-anchor="middle">session 2: 10:50 to 11:20</text>
    <text class="sm rd" x="380" y="256">clicks at 10:00, 10:10, 10:50</text>
  </svg>
  <figcaption>Tumbling windows partition time, sliding windows overlap it, and session windows ignore the clock and close after inactivity. Red dots are events. Each row has its own horizontal scale; in the session row a window runs from its first event to its last event plus the 30-minute gap.</figcaption>
</figure>
<table>
  <tr><th>Window</th><th>Definition</th><th>One event belongs to</th><th>Use for</th></tr>
  <tr><td>Tumbling</td><td>Fixed length, no overlap (5-second windows in Flink's example)</td><td>One window</td><td>Per-minute counts, hourly totals, billing periods</td></tr>
  <tr><td>Sliding</td><td>Fixed length that starts every slide interval; overlaps when the slide is shorter than the length</td><td>Length ÷ slide windows</td><td>"Last 10 minutes, refreshed each minute" moving averages and rate alerts</td></tr>
  <tr><td>Session</td><td>Closes after a gap with no events; merges windows closer than the gap; no fixed start or end</td><td>One session, and a late event can merge two</td><td>User activity, visit length, burst detection</td></tr>
  <tr><td>Global</td><td>One window per key; the default trigger never fires, so you supply a trigger</td><td>One window</td><td>Custom logic, such as emit every N events</td></tr>
</table>
<p>
  Do the arithmetic before choosing. A one-hour window that slides every minute
  puts each event in 60 windows. At a steady 11,574 events a second that is
  11,574 × 60 = 694,440 window assignments a second, and each key holds 60 open
  windows of state. Engines reduce the work by sharing partial results between
  windows, but the state and the emit rate still scale with length ÷ slide. A
  session example, gap 30 minutes: clicks at 10:00, 10:10 and 10:50 give two
  sessions. The first spans 10:00 to 10:40 (the last event plus the gap), and the
  10:50 click is 40 minutes after 10:10, so it starts a second, spanning 10:50
  to 11:20. If a late click stamped 10:30 then arrives, its own window
  <code>[10:30, 11:00)</code> overlaps both, and the sessions merge into one that
  spans 10:00 to 11:20. That merge is why session windows need a merging trigger
  and are the shape that late data disturbs most.
</p>

<h3>State and checkpoints: how a stream job survives a crash</h3>
<p>
  A window count, a deduplication set, a join buffer: all are <b>state</b>, held in
  the operators, and a job that cannot recover it is useless for anything beyond
  a stateless filter. Flink's approach, from the Carbone et al. paper on
  asynchronous barrier snapshotting, is this. The checkpoint coordinator tells the
  sources to record their offsets and insert numbered <b>barriers</b> into their
  streams. A barrier flows with the data; when an operator sees barrier
  <em>n</em> it snapshots its state, and an operator with two inputs
  <b>aligns</b> them, so checkpoint <em>n</em> contains the effect of every event
  before barrier <em>n</em> and none after it. The result is a consistent cut: the
  source offsets and the operator state that correspond to exactly those offsets.
  Processing carries on while snapshots are written out asynchronously.
</p>
<p>
  Recovery follows directly. Restore every operator's state from the last
  completed checkpoint, rewind each source to the checkpointed offset, and
  continue. Records between the checkpoint and the crash are processed again, but
  against state that has forgotten them, so state is not double counted. State
  size decides the backend: Flink's heap-based backend keeps state in JVM memory
  (fast, limited by memory, GC pressure), while the RocksDB backend keeps it on
  local disk so it can exceed memory and supports incremental snapshots, at a
  speed cost the docs put at roughly ten times slower than heap.
</p>
<h4>Dry run: crash and catch-up, with planning numbers</h4>
<p>
  Assumptions, all planning figures: the job reads 11,574 events a second on
  average, checkpoints every 30 seconds, crashes 20 seconds after the last
  checkpoint, takes 60 seconds to restart, and can process at twice the arrival
  rate once it is running again.
</p>
<table>
  <tr><th>Step</th><th>What happens</th><th>Number</th></tr>
  <tr><td>1</td><td>Events processed after the last checkpoint and lost with the crash (their effect on state)</td><td>20 s × 11,574 = 231,480</td></tr>
  <tr><td>2</td><td>Backlog waiting at the input when the job is running again (20 s to redo, plus 60 s of restart)</td><td>(20 + 60) s × 11,574 = 925,920</td></tr>
  <tr><td>3</td><td>Capacity at 2× arrival</td><td>23,148 events a second</td></tr>
  <tr><td>4</td><td>Net drain rate (capacity minus ongoing arrivals)</td><td>23,148 − 11,574 = 11,574 a second</td></tr>
  <tr><td>5</td><td>Time to catch up</td><td>925,920 ÷ 11,574 = 80 seconds</td></tr>
  <tr><td>6</td><td>Output delay seen by a read-committed consumer of an exactly-once Kafka sink, at worst, from checkpoint-driven commits alone</td><td>about the 30 s interval plus the checkpoint's own duration</td></tr>
</table>
<p class="sub">
  Two lessons. Catch-up time is (downtime + replay window) ÷ (capacity ÷ arrival
  − 1): with no headroom (capacity equal to arrival) a job never catches up, so
  size stream jobs with spare capacity. And frequent checkpoints shrink the replay
  window but cost I/O and, with an exactly-once Kafka sink, they are also how often
  output becomes visible.
</p>

<h3>Delivery guarantees, and what "exactly-once" means here</h3>
<p>
  The <a href="/system-design/sysdes-message-queues-async">queues chapter</a> showed
  why exactly-once delivery is impossible and exactly-once <em>effect</em> is
  built from at-least-once plus idempotence or transactions; read that first, and
  here is how a stream engine applies it. Flink's documentation is blunt about
  the term: exactly-once does not mean each event is processed once, it means
  every event affects the Flink-managed <em>state</em> exactly once, because
  recovery replays source data. End to end, you need three things:
</p>
<ul>
  <li><b>A replayable source</b> (a Kafka offset you can rewind to).</li>
  <li><b>State restored from a consistent checkpoint</b>, so the replay does not double count.</li>
  <li><b>A transactional or idempotent sink</b>, so output written for records that will be replayed does not appear twice.</li>
</ul>
<p>
  For Kafka output the engine uses Kafka's own machinery: the idempotent producer
  deduplicates retries with sequence numbers, and transactions let a producer
  write across partitions atomically (both are in the queues chapter). Flink's Kafka sink in <code>EXACTLY_ONCE</code> mode writes records inside a
  Kafka transaction that commits when the checkpoint completes, which has three
  operational consequences from the connector docs: downstream consumers must use
  <code>isolation.level=read_committed</code> or they will see records that may be
  aborted; records are not visible until a checkpoint completes, so checkpoint
  interval sets output latency; and the docs strongly recommend a producer transaction timeout larger than the
  maximum checkpoint duration plus the maximum restart time, because otherwise Kafka
  can expire an uncommitted transaction and data may be lost.
</p>
<div class="warn">
  <span class="ttl">⚠ The guarantee stops at the edge of the transaction</span>
  Everything above holds for Kafka-to-Kafka work. The moment a job calls an
  email provider, a payment API or a non-transactional database, a replayed record
  repeats the effect. For those sinks make the write idempotent (a deterministic
  key, an upsert) instead of trusting the engine. Spark's table of sinks says the
  same thing in its own words: the file sink is exactly-once, the Kafka sink and
  the foreach sink are at-least-once, and <code>foreachBatch</code> is listed as depending on the
  implementation, with the text saying it is at-least-once by default unless you use
  the batch id to deduplicate.
</div>

<h3>Lambda against Kappa</h3>
<p>
  The <b>Lambda architecture</b> answers "streaming is fast but approximate, batch
  is slow but correct" by running both over the same immutable input and merging
  the results at query time. Jay Kreps' 2014 critique names the cost: the
  transformation logic must be implemented twice, in two complex distributed
  systems, and kept equal. His words are that he does not think the problem is
  fixable, and that abstraction layers compiling one program to both engines
  helped little. Akidau went further: well-designed streaming systems are a strict
  superset of batch, and Lambda belongs to the history of big data.
</p>
<p>
  The alternative is the one Kreps proposed in the same post and half-jokingly
  suggested calling the <b>Kappa Architecture</b> ("it may be too simple of an idea
  to merit a Greek letter"): one pipeline and a retained log. To change the
  logic you start a second instance of the same job from the beginning of the
  log, writing to a new output table; when it catches up you switch readers to
  the new table, then stop the old job and delete the old table. The code is
  written once, and reprocessing is something you do every time the code changes.
</p>
<table>
  <tr><th>&nbsp;</th><th>Lambda</th><th>Kappa</th></tr>
  <tr><td>Code paths</td><td>Two (batch and speed layer)</td><td>One</td></tr>
  <tr><td>How you correct history</td><td>The batch layer recomputes it, and the merged view moves to the corrected data</td><td>Replay the log through the new job into a new table, then switch</td></tr>
  <tr><td>What it needs</td><td>A batch system plus a stream system, and a merge at read time</td><td>A log retained as long as your longest reprocessing window</td></tr>
  <tr><td>Where it hurts</td><td>Two implementations that disagree for subtle reasons</td><td>Replaying a long history is slow and needs spare capacity; the log's retention caps how far back you can go</td></tr>
  <tr><td>Honest use today</td><td>Rarely chosen fresh; found in systems that grew into it</td><td>A common starting point for new log-centric designs (the author's judgement, not a measured fact); a separate batch reconciliation job is often kept where money is involved</td></tr>
</table>
<p class="sub">
  Notice what the table does not say: batch is not obsolete. Batch is the right
  tool when the input is bounded and efficiency matters, and a nightly
  reconciliation that recounts the day exactly is how you catch what the stream
  dropped. The modern pattern is one logic, two execution modes (Flink's batch
  mode, Spark's unified APIs), not two programs.
</p>

<h3>Change data capture and derived data</h3>
<p>
  Every system has a primary store, and then a growing set of <b>derived data</b>:
  the search index, the cache, the analytics warehouse, the recommendation
  features. The naive way to keep them current is for the application to write to
  each one (a <b>dual write</b>). It fails the way the queues chapter's outbox
  section shows: the writes are not atomic across systems, so a crash between
  them leaves the index and the database disagreeing, and two concurrent writers
  can apply their updates in opposite orders to the two stores, so they disagree
  <em>permanently</em>.
</p>
<p>
  <b>Change data capture</b> fixes it by making the database's own change log the
  single source. Log-based tools such as Debezium read the database's change
  stream (the MySQL binlog, the PostgreSQL logical replication stream) and publish
  the events, generally to one Kafka topic per table. Every derived store then consumes that topic
  and applies the changes in order, so each is a deterministic function of one log.
  Three design points follow:
</p>
<ul>
  <li><b>Expect duplicates.</b> Debezium's FAQ states that after a crash consumers may see events more than once. Apply changes idempotently: upsert by primary key, and carry the source position so a stale replay cannot overwrite newer data.</li>
  <li><b>Bootstrap, then tail.</b> A new derived store needs the existing rows, not just future changes. Either snapshot the table and then switch to the log at the matching position, or, for a table that is read as a changelog, replay a compacted topic, which keeps the latest record per key.</li>
  <li><b>Deletes are events.</b> A delete must reach every derived store; in a compacted topic that is a record with a key and a null value (a tombstone), and a consumer that stays away longer than the delete-retention period can miss it.</li>
</ul>
<p>
  The payoff is the reprocessing story again: to add a new index, or to fix a bug
  in how one is built, you replay the log into a fresh instance and cut over. That
  is why teams that adopt a log tend to adopt CDC, and why the outbox from the
  queues chapter and CDC are the same idea at two scales: a transactionally
  written change record, then a relay that is allowed to repeat itself.
</p>

<h3>Worked example: ad-click aggregation</h3>
<p>
  The prompt (it is a chapter of Alex Xu's <em>System Design Interview, Volume 2</em>;
  the framing here is mine): advertisers want to know how many times each ad was
  clicked, per minute, within seconds, and they will be <em>billed</em> from the
  numbers. That sentence sets the constraints. The counts must be correct (money), nearly real-time
  (advertisers watch campaigns), tolerant of late and duplicate events (phones,
  retries), and recoverable (a crashed job cannot lose or double count a click).
  The figures below are this chapter's assumptions, not quotations from any
  source, so change them if the interviewer does.
</p>
<h4>Capacity estimation</h4>
<ul>
  <li><b>Volume:</b> 1 billion clicks a day ÷ 86,400 s = <b>11,574 clicks a second</b> on average. Allow a 5× peak: <b>about 57,870 a second</b>.</li>
  <li><b>Raw storage:</b> 100 bytes per click event × 1 billion = <b>100 GB a day</b>, or 36.5 TB a year before replication. Keep it: raw events are what you replay and reconcile from.</li>
  <li><b>Ingest bandwidth at peak:</b> 57,870 × 100 B = <b>5.8 MB/s</b>. Under the 10 MB/s per-partition planning figure from the queues chapter, so volume alone does not force many partitions; parallelism for the aggregation does.</li>
  <li><b>Aggregated output:</b> assume 50,000 distinct ads are clicked in an average minute. One row per ad per minute is 50,000 × 1,440 = <b>72 million rows a day</b>; at 40 bytes a row that is <b>2.88 GB a day</b>, about 35 times smaller than the raw data. (At 694,444 clicks a minute against 50,000 rows, each row summarises about 14 clicks.)</li>
  <li><b>Partitions:</b> if one aggregation task handles about 10,000 events a second, peak needs 57,870 ÷ 10,000 ≈ 6 tasks. Choose <b>12 partitions</b>, which gives about 2× headroom and room to grow, and partition the topic by <b>click id</b>, not by ad id (the reason is in the hot-key bullet below).</li>
</ul>

<figure>
  <svg viewBox="0 0 640 330" class="dg" role="img" aria-label="Click events flow from a click service into Kafka, then a stream job that pre-aggregates in each task and merges by ad id in one-minute event-time windows, then an aggregates store read by a dashboard. Kafka also feeds a raw archive, late events from the stream job go to a side output that lands in the archive, and a nightly batch job reads the archive and overwrites the store">
    <g class="rough">
      <path class="lng" d="M110,92 L148,92" />
      <path class="lng" d="M262,92 L300,92" />
      <path class="lng" d="M440,92 L476,92" />
      <path class="ln"  d="M205,114 L205,186" />
      <path class="ln"  d="M262,208 L300,208" />
      <path class="ln"  d="M440,208 L458,208 L458,106 L476,106" />
      <path class="lnr dash" d="M410,120 L410,150 L205,150" />
      <path class="ln"  d="M546,114 L546,170" />
      <rect class="box"  x="16"  y="70" width="94"  height="44" rx="6" />
      <rect class="boxy" x="148" y="70" width="114" height="44" rx="6" />
      <rect class="boxg" x="300" y="64" width="140" height="56" rx="6" />
      <rect class="boxg" x="476" y="70" width="140" height="44" rx="6" />
      <rect class="box"  x="148" y="186" width="114" height="44" rx="6" />
      <rect class="boxr" x="300" y="186" width="140" height="44" rx="6" />
      <rect class="box"  x="476" y="170" width="140" height="44" rx="6" />
    </g>
    <text class="sm" x="63"  y="88" text-anchor="middle">click service</text>
    <text class="sm" x="63"  y="104" text-anchor="middle">click id</text>
    <text class="sm" x="205" y="88" text-anchor="middle">Kafka</text>
    <text class="sm" x="205" y="104" text-anchor="middle">12 partitions</text>
    <text class="sm" x="370" y="82" text-anchor="middle">stream job</text>
    <text class="sm" x="370" y="97" text-anchor="middle">pre-aggregate,</text>
    <text class="sm" x="370" y="112" text-anchor="middle">merge by ad, 1 min</text>
    <text class="sm" x="546" y="88" text-anchor="middle">aggregates store</text>
    <text class="sm" x="546" y="104" text-anchor="middle">upsert (ad, minute)</text>
    <text class="sm" x="205" y="204" text-anchor="middle">raw archive</text>
    <text class="sm" x="205" y="220" text-anchor="middle">object storage</text>
    <text class="sm" x="370" y="204" text-anchor="middle">nightly batch</text>
    <text class="sm" x="370" y="220" text-anchor="middle">reconciliation</text>
    <text class="sm" x="546" y="190" text-anchor="middle">dashboard,</text>
    <text class="sm" x="546" y="206" text-anchor="middle">billing export</text>
    <text class="sm rd" x="214" y="144">late events: side output</text>
    <text class="lbl" x="16" y="270" style="font-size:14px">The stream path answers in seconds. The batch path answers exactly.</text>
    <text class="lbl" x="16" y="292" style="font-size:14px">Both read the same raw events, so billing uses the corrected numbers.</text>
  </svg>
  <figcaption>One log, one job, and a batch path that exists only to settle the books. Events that miss the lateness window go to a side output that lands in the archive with the raw data, and the nightly batch job recounts the archive and overwrites the store's rows.</figcaption>
</figure>

<h4>The decisions, in the order an interviewer pushes</h4>
<ul>
  <li><b>Where does deduplication happen?</b> Clients retry and some are malicious. Stamp each click with a unique click id at the click service and partition the topic by it, so every duplicate of a click lands in the same partition and one task can keep a deduplication set in its own state (bounded by the lateness window plus a margin, or it grows without limit). Combine with the exactly-once chain: replayable source, checkpointed state, idempotent sink.</li>
  <li><b>What is the hot-key answer?</b> A viral ad can take, say, 20% of all clicks: 0.2 × 57,870 = 11,574 clicks a second, more than the 10,000 a second one task handles. If the topic were partitioned by ad id, all of it would land in one partition, and no downstream trick helps a task that must still <em>read</em> every event. Because the topic is partitioned by click id, the hot ad's clicks arrive spread across all 12 partitions. Then use <b>two-stage aggregation</b>: each task pre-aggregates its own slice per (ad, minute), and a second stage, keyed by ad id, merges the partial counts. That is the combiner idea from MapReduce, and counts are additive, so partials merge exactly. The second stage now receives at most 12 partials per ad per minute instead of every click. When a late event updates a task's partial, that task re-emits its cumulative partial and the second stage replaces its previous value from that task before summing.</li>
  <li><b>Why event time, and how much lateness?</b> Billing must reflect when the click happened. Pick the watermark bound from the measured lateness distribution (the 99th percentile of skew, say), keep a longer allowed lateness for updates, and send what is left to the side output.</li>
  <li><b>Why also a batch path?</b> Because the stream's answer is an estimate of "done" by construction. The batch job recounts from the raw archive for finished days with perfect knowledge of arrival (a bounded input needs no watermarks), and its counts replace the stream's. This is lambda's good idea, kept small: a correction, not a second pipeline of logic.</li>
  <li><b>Why does the sink upsert?</b> The window result can update (allowed lateness) and can replay (recovery). Writing <code>(ad_id, minute) → count</code> as an overwrite makes both harmless; an <code>increment</code> would double count.</li>
</ul>

<h4>Dry run: one window, seven events, a 10 s bound and 60 s of allowed lateness</h4>
<p>
  Ad A, tumbling windows of one minute, watermark = latest event time seen minus
  10 s (the one-millisecond offset in Flink's example is ignored here), allowed
  lateness 60 s. Window W is <code>[12:00:00, 12:01:00)</code>. The cleanup time for
  W is its end plus the lateness, 12:02:00.
</p>
<table>
  <tr><th>Event</th><th>Event time</th><th>Arrives</th><th>Latest event time seen</th><th>Watermark after it</th><th>What happens</th></tr>
  <tr><td>e1</td><td>12:00:05</td><td>12:00:06</td><td>12:00:05</td><td>11:59:55</td><td>Added to W (count 1)</td></tr>
  <tr><td>e2</td><td>12:00:58</td><td>12:00:59</td><td>12:00:58</td><td>12:00:48</td><td>Added to W (count 2)</td></tr>
  <tr><td>e3</td><td>12:00:52</td><td>12:01:04</td><td>12:00:58</td><td>12:00:48</td><td>12 s late, out of order, but above the watermark: added to W (count 3)</td></tr>
  <tr><td>e4</td><td>12:01:03</td><td>12:01:04</td><td>12:01:03</td><td>12:00:53</td><td>Belongs to the next window, W2 <code>[12:01, 12:02)</code> (count 1). W has not fired: 12:00:53 is before 12:01:00</td></tr>
  <tr><td>e5</td><td>12:01:20</td><td>12:01:21</td><td>12:01:20</td><td>12:01:10</td><td>W2 count 2. The watermark passes 12:01:00, so <b>W fires with 3</b></td></tr>
  <tr><td>e6</td><td>12:00:40</td><td>12:01:25</td><td>12:01:20</td><td>12:01:10</td><td>Behind the watermark (12:00:40 &lt; 12:01:10), but W is kept until 12:02:00: added, W <b>fires again with 4</b></td></tr>
  <tr><td>e7</td><td>12:00:30</td><td>12:03:00</td><td>12:03:00 (other events moved it)</td><td>12:02:50</td><td>The watermark is past 12:02:00, so W is gone: e7 goes to the side output, not W</td></tr>
</table>
<p class="sub">
  Count the answers. The stream's final value for W is <b>4</b>; the true count
  from event time is 5 (e1, e2, e3, e6, e7). The nightly batch recount reads the
  archive, finds all five and overwrites the row with 5, which is what billing
  sees. Skew values (arrival minus event time): e3 is 12 s, e6 is 45 s, e7 is
  150 s. With a 10 s bound and no allowed lateness, e6 and e7 would both have been
  dropped, and W would have fired once with 3; allowed lateness recovers e6, and
  only e7, at 150 s of skew, needs the side output and the batch. With a 150 s
  bound every result would have waited two and a half minutes. The bound, the allowed lateness and the
  reconciliation are three settings on one trade-off.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "Billing needs correct counts and
  advertisers want them in seconds, so I'll use both paths and be honest about
  what each guarantees. Clicks go into Kafka with a unique id, partitioned by click
  id so duplicates meet and a viral ad is spread over every partition. A Flink job
  aggregates one-minute event-time windows with a watermark from the measured
  lateness, pre-aggregates in each task and then merges by ad id, and upserts <code>(ad, minute)</code> to the store, so replays and
  late updates are harmless. Checkpoints plus a replayable source give
  exactly-once state, and the upsert gives an exactly-once effect at the sink.
  Whatever the watermark drops goes to a side output and the raw archive, and a
  nightly batch recount corrects the day. The stream gives speed; the batch gives
  the books."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "per minute", "real time", "top K in the last hour", "fraud detection", "metrics", "click counts", "keep the search index in sync", "rebuild a view", or any requirement that mixes a latency target with a correctness target.</li>
  <li><b>First question:</b> is the input bounded? A bounded job wants batch; an unbounded one wants a stream, and then you must say what time you use and when a result is final.</li>
  <li><b>If counts feed money or compliance:</b> event time, deduplication, an idempotent sink and a batch reconciliation. If a few lost samples are harmless (telemetry), processing time with at-most-once is fine and far cheaper.</li>
  <li><b>If two stores must agree:</b> do not dual write. Capture the change log, or use an outbox, and make each consumer idempotent.</li>
  <li><b>If the logic will change:</b> keep the log long enough to replay, and be able to start a new job instance and cut over, not run two codebases.</li>
  <li><b>The pitfalls to name unprompted:</b> the stalled watermark from an idle partition, the hot key, state that grows without bound (windows or dedupe sets that are never cleaned), and exactly-once claims that stop at the first external API call.</li>
  <li><b>The follow-up you will get:</b> "what about events that arrive an hour late?" The answer is a policy, not a wish: bound, allowed lateness, side output, reconciliation, and a stated tolerance.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain the difference between event time and processing time, and say which one a billing aggregate must use and why.</li>
    <li>Trace the dry run: say which events land in which window, when the first window fires and with what count, and why the stream ends at 4 while the truth is 5.</li>
    <li>Explain a watermark as a heuristic, and name the two ways it goes wrong: too tight drops data, too loose adds delay, and an idle input stalls it.</li>
    <li>Choose a window shape for three requirements (per-minute totals, a ten-minute moving rate, visit length) and compute the state cost of a one-hour window sliding every minute.</li>
    <li>Say what exactly-once means in a stream engine, which three ingredients it needs end to end, and where it stops being true.</li>
    <li>Argue lambda against kappa, including what each does to the amount of code you maintain and what retention each requires.</li>
    <li>Explain why change data capture beats dual writes for keeping a search index in sync with a database.</li>
  </ul>
</div>
<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://research.google/pubs/mapreduce-simplified-data-processing-on-large-clusters/" rel="noopener noreferrer">Dean and Ghemawat, MapReduce: Simplified Data Processing on Large Clusters (OSDI 2004)</a> — map, reduce, the runtime's job, scale reported at Google</li>
    <li><a href="https://www.usenix.org/conference/nsdi12/technical-sessions/presentation/zaharia" rel="noopener noreferrer">Zaharia et al., Resilient Distributed Datasets (NSDI 2012)</a> — in-memory cluster computing with fault tolerance from coarse-grained transformations</li>
    <li><a href="https://spark.apache.org/docs/latest/rdd-programming-guide.html" rel="noopener noreferrer">Apache Spark RDD programming guide</a> — recomputing lost partitions, the cost of the shuffle, shuffle files, reduceByKey over groupByKey</li>
    <li><a href="https://www.oreilly.com/radar/the-world-beyond-batch-streaming-101/" rel="noopener noreferrer">Akidau, The world beyond batch: Streaming 101</a> — bounded and unbounded data, event time against processing time, window types, watermarks as heuristics</li>
    <li><a href="https://www.oreilly.com/radar/questioning-the-lambda-architecture/" rel="noopener noreferrer">Kreps, Questioning the Lambda Architecture</a> — the cost of two code paths and the replay-based alternative</li>
    <li><a href="https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/" rel="noopener noreferrer">Apache Flink: timely stream processing</a> — event time, watermarks, the minimum across inputs</li>
    <li><a href="https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/event-time/generating_watermarks/" rel="noopener noreferrer">Apache Flink: generating watermarks</a> — bounded out-of-orderness and idle inputs</li>
    <li><a href="https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/operators/windows/" rel="noopener noreferrer">Apache Flink: windows</a> — tumbling, sliding, session and global windows, allowed lateness, side outputs</li>
    <li><a href="https://nightlies.apache.org/flink/flink-docs-stable/docs/learn-flink/fault_tolerance/" rel="noopener noreferrer">Apache Flink: fault tolerance via state snapshots</a> — barriers, alignment, what exactly-once covers, state backends</li>
    <li><a href="https://nightlies.apache.org/flink/flink-docs-stable/docs/connectors/datastream/kafka/" rel="noopener noreferrer">Apache Flink: Kafka connector</a> — sink guarantees, transactions and checkpoint-driven visibility</li>
    <li><a href="https://spark.apache.org/docs/latest/streaming/apis-on-dataframes-and-datasets.html" rel="noopener noreferrer">Apache Spark Structured Streaming: event time and watermarking</a> — the watermark formula, one-sided guarantee, sink guarantees</li>
    <li><a href="https://debezium.io/documentation/faq/" rel="noopener noreferrer">Debezium FAQ</a> — log-based change capture and at-least-once delivery after a crash</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. Figures marked "planning figure" or "assumption" are this chapter's own, not quotations from a source, and the ad-click numbers are illustrative.</p>
</div>`,
};
