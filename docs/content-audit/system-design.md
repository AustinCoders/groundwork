# System Design content audit, October 2026

Scope: the 24 written System Design chapters in `content/system-design/`, compared with four benchmark
sources and checked claim by claim against primary sources. This file records what the audit found, what
was fixed, and what is still missing. It is meant to be re-run: the checks at the end are automated.

## Verdict

The chapters were strong on teaching and clarity (average 8.7 out of 10) and weaker on accuracy
(6.8) and currency (6.9). Depth averaged 7.2. Every chapter except one (`availability-design`)
had at least one claim that was false, out of date, or contradicted by another chapter. The audit found
65 false or outdated claims, 99 misleading ones and 12 it could not verify. All 164 were fixed
or reworded in the same change, every chapter now ends with a sources block, and the arithmetic and the
wrong claims are guarded by tests.

The fixes make the 24 chapters correct. They did not make the topic complete: against the benchmarks,
replication, transactions and isolation, storage engines, and time and ordering had no chapter of their own.
Four new chapters (batch 1, October 2026, below) now cover them, bringing the section to 28 chapters. Five more
(batch 2, October 2026, below) add batch and stream processing and four design walkthroughs from Xu's books,
bringing it to 33. A practice layer (batch 3, October 2026, below) gives every chapter a pool of questions, and three
more chapters (batch 4, October 2026, below) cover microservices and service discovery, security basics, and release
safety with incident response, bringing it to 36. Some of the Xu walkthroughs are still missing; see "Still missing".

## Method

1. Benchmarks, with their tables of contents checked this month:
   - Designing Data-Intensive Applications (Kleppmann). The second edition came out in March 2026. Its
     official chapter list could not be fetched, so the gap list uses the first edition's twelve chapters and a
     third-party summary of the second.
   - Alex Xu, System Design Interview volumes 1 and 2: 25 design chapters, listed on ByteByteGo.
   - donnemartin/system-design-primer: the full topic index.
   - Google's SRE book: 34 chapters.
2. Four reviewers each read six chapters in full with no knowledge of each other's findings. Each listed
   every checkable claim, recomputed every number, and checked the important ones against primary sources
   (RFCs, official docs, papers, company engineering posts). They scored accuracy, depth, currency and
   clarity from 0 to 10 and listed concepts the benchmarks teach that the chapter lacks.
3. A second pass fixed each finding. The fixer had to re-verify the correction against a primary source
   instead of trusting the finding. No finding was rejected as wrong; a handful could only be applied in part, where the primary source could not be read.
4. Dates after the reviewers' training were re-checked by hand: Kafka 4.2 share groups, the S3 50 TB object
   size, and CloudFront tag invalidation.

## Scorecard before the fixes

| #   | Chapter                              | Accuracy | Depth | Currency | Clarity | False or outdated | Misleading | Unverified |
| --- | ------------------------------------ | -------- | ----- | -------- | ------- | ----------------- | ---------- | ---------- |
| 1   | `sysdes-interview-mental-model`      | 7        | 6     | 8        | 9       | 2                 | 2          | 0          |
| 2   | `sysdes-client-server-basics`        | 7        | 7     | 8        | 9       | 2                 | 6          | 0          |
| 3   | `sysdes-scaling-vertical-horizontal` | 7        | 7     | 8        | 9       | 2                 | 4          | 0          |
| 4   | `sysdes-databases-in-design`         | 6        | 7     | 6        | 9       | 4                 | 2          | 1          |
| 5   | `sysdes-apis-communication`          | 6        | 8     | 8        | 9       | 3                 | 5          | 1          |
| 6   | `sysdes-tradeoff-thinking`           | 6        | 6     | 8        | 9       | 2                 | 2          | 1          |
| 7   | `sysdes-caching-fundamentals`        | 7        | 7     | 8        | 9       | 1                 | 5          | 1          |
| 8   | `sysdes-cdns`                        | 6        | 8     | 6        | 9       | 5                 | 3          | 1          |
| 9   | `sysdes-load-balancing-depth`        | 8        | 8     | 8        | 9       | 2                 | 2          | 1          |
| 10  | `sysdes-rate-limiting`               | 7        | 7     | 6        | 9       | 3                 | 4          | 1          |
| 11  | `sysdes-message-queues-async`        | 6        | 8     | 5        | 9       | 3                 | 3          | 1          |
| 12  | `sysdes-search-systems`              | 7        | 6     | 6        | 9       | 2                 | 5          | 1          |
| 13  | `sysdes-consistency-models`          | 6        | 7     | 6        | 9       | 4                 | 3          | 0          |
| 14  | `sysdes-cap-theorem-depth`           | 7        | 8     | 6        | 9       | 4                 | 3          | 0          |
| 15  | `sysdes-distributed-consensus`       | 8        | 8     | 9        | 9       | 1                 | 3          | 0          |
| 16  | `sysdes-sharding-partitioning`       | 6        | 8     | 6        | 8       | 4                 | 6          | 1          |
| 17  | `sysdes-storage-systems`             | 6        | 7     | 5        | 9       | 3                 | 6          | 0          |
| 18  | `sysdes-availability-design`         | 9        | 7     | 8        | 9       | 0                 | 0          | 0          |
| 19  | `sysdes-fault-tolerance`             | 7        | 7     | 7        | 8       | 3                 | 7          | 1          |
| 20  | `sysdes-observability-scale`         | 7.5      | 7     | 7        | 8       | 3                 | 6          | 0          |
| 21  | `sysdes-capacity-estimation`         | 7        | 7     | 7        | 8       | 3                 | 4          | 0          |
| 22  | `sysdes-case-studies`                | 6.5      | 7     | 5.5      | 8       | 5                 | 4          | 1          |
| 23  | `sysdes-walkthrough-simple`          | 6.5      | 8     | 7        | 8       | 4                 | 6          | 0          |
| 24  | `sysdes-walkthrough-medium`          | 7.5      | 7.5   | 7        | 8       | 0                 | 8          | 0          |

Averages: accuracy 6.8, depth 7.2, currency 6.9, clarity 8.7. Totals: 65 false or
outdated, 99 misleading, 12 unverified.

## What kind of mistakes there were

- **Vendor facts that moved.** S3 LIST became strongly consistent in December 2020 and the maximum object
  size is now 50 TB; MongoDB and DynamoDB have multi-item transactions; Postgres 18 added skip scan; Fauna's
  hosted service shut down in May 2025; RabbitMQ has replayable streams and Kafka 4.2 has share groups; the
  RateLimit and Idempotency-Key headers are still IETF drafts; the Simian Army is retired.
- **Examples that did not compute.** A dry run that added a 3x replication factor and 1.4x erasure coding
  but reported the erasure-coded figure; a Kafka consumer committing offset 42 after reading 42; a hash ring
  where "a third" was really 44%; an idempotency design whose 409 path could not happen in Postgres; "three
  orders of magnitude" for a ratio of 100.
- **Chapters that disagreed with each other.** One database primary was said to handle 5,000, 10,000 or
  "tens of thousands" of operations a second depending on the chapter; the same ZooKeeper read was
  linearizable in one chapter and stale in another; the celebrity fan-out threshold was 100k in one and 1M
  in another; the same chat service needed 10 million or 100 million sockets.
- **Numbers with no source.** Latency tables mixed Jeff Dean's 2012 list with Colin Scott's 2020
  extrapolation; company claims had no dated source; rules of thumb were stated as fact.

## What changed

- All findings above, in all 24 chapters. Short additions went in where a missing idea belongs to the
  chapter's own topic (PreVote in the consensus chapter, GCRA and concurrency limits in rate limiting,
  OpenTelemetry and RED/USE in observability, document versus term partitioning in search, and others).
- One set of planning numbers used everywhere (see below).
- Every chapter ends with a "Sources and further reading" box of primary sources, with a note that the
  claims were checked in October 2026. There are about 160 distinct links.
- `tests/system-design-quality.test.ts` fails if a chapter loses its sources box, if a link is not https, if
  a claim this audit proved wrong comes back, or if the key arithmetic (availability tables, storage and
  bandwidth examples, base-62 key spaces, quorum overlap, fan-out maths, retry amplification) stops adding up.
- `npm run sources` fetches every external link in `content/system-design/` and reports the broken ones.
  It is not part of `npm run check` because the network is flaky. Links that bots cannot read (403 or 406)
  are listed for a manual look.
- The search index budget for System Design is now 140 KB gzip instead of 85 KB: the sources and added
  material pushed the topic to 86 KB.

### The planning numbers every chapter now shares

| Quantity                                               | Value used                                                                                                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One relational primary, modern NVMe server, warm cache | 20,000 simple reads a second and 5,000 committed writes a second as conservative planning figures. Strong hardware does several times more; measure.                    |
| When to act                                            | Reads past about 20k a second: cache and replicas. Writes past about 5k a second: partition or queue. About 20k sustained writes: you are already sharding or queueing. |
| Round trips                                            | Same AZ 0.5 ms; cross-AZ 1 to 2 ms; US coast to coast 60 to 70 ms; US to Western Europe 70 to 90 ms; US to Singapore or India about 200 to 230 ms                       |
| Retry amplification                                    | 3 attempts per layer across 3 layers is 27x; the SRE book's 3 retries is 64x                                                                                            |
| Single-region multi-AZ availability                    | About 99.95% to 99.99%, depending on shared dependencies                                                                                                                |
| Gateway box                                            | 250k to 500k connections at 10 to 50 KB each                                                                                                                            |
| Fan-out on write threshold                             | A tunable, roughly 100k to 1M followers, chosen from a cost model                                                                                                       |

## Coverage against the benchmarks, after the fixes

| Topic                                                                                                                                 | DDIA   | Xu   | Primer | SRE | Status here                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---- | ------ | --- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Capacity estimation, latency numbers                                                                                                  |        | 1    | yes    |     | Covered                                                                                                                                  |
| Scaling, load balancing, CDN, caching, rate limiting                                                                                  |        | 1    | yes    | yes | Covered                                                                                                                                  |
| Consistent hashing, sharding                                                                                                          | 6      | 1    | yes    |     | Covered                                                                                                                                  |
| Consistency models, CAP, PACELC                                                                                                       | 9      |      | yes    |     | Covered                                                                                                                                  |
| Consensus (Raft, Paxos)                                                                                                               | 9      |      |        | yes | Covered                                                                                                                                  |
| Message queues and logs                                                                                                               | 11     | 2    | yes    |     | Covered                                                                                                                                  |
| SLOs, error budgets, monitoring, overload, cascading failure                                                                          |        | 2    |        | yes | Covered                                                                                                                                  |
| Search                                                                                                                                | 3      | 1    |        |     | Covered (surface)                                                                                                                        |
| Object storage                                                                                                                        |        | 2    |        |     | Covered                                                                                                                                  |
| URL shortener, news feed, chat (part), autocomplete (part), rate limiter                                                              |        | 1    | yes    |     | Covered                                                                                                                                  |
| Replication: leaders, followers, multi-leader, leaderless, conflict resolution                                                        | 5      |      | yes    |     | Covered (`sysdes-replication`)                                                                                                           |
| Transactions: ACID, isolation levels, 2PC, sagas                                                                                      | 7      | 2    |        |     | Covered (`sysdes-transactions-isolation`)                                                                                                |
| Storage engines: LSM, B-tree, WAL, columnar                                                                                           | 3      | 2    | yes    |     | Covered (`sysdes-storage-engines`)                                                                                                       |
| Clocks, ordering, unique IDs                                                                                                          | 8      | 1    |        |     | Covered (`sysdes-time-ordering-ids`)                                                                                                     |
| Batch and stream processing                                                                                                           | 10, 11 | 2    |        | yes | Covered (`sysdes-batch-stream-processing`)                                                                                               |
| Encoding and schema evolution                                                                                                         | 4      |      |        |     | **Partial.** API versioning only                                                                                                         |
| Release safety, incidents, postmortems                                                                                                |        |      |        | yes | Covered (`sysdes-release-safety`)                                                                                                        |
| Microservices, service discovery, service mesh                                                                                        |        |      | yes    |     | Covered (`sysdes-microservices-discovery`)                                                                                               |
| Security in design                                                                                                                    |        |      | yes    |     | Covered (`sysdes-security-basics`)                                                                                                       |
| Geospatial indexes, probabilistic structures                                                                                          |        | 2    |        |     | **Partial.** Mentions only                                                                                                               |
| Key-value store                                                                                                                       |        | 1    |        |     | Covered (`sysdes-walkthrough-kv-store`)                                                                                                  |
| Notification system                                                                                                                   |        | 1    |        |     | Covered (`sysdes-walkthrough-notifications`)                                                                                             |
| Web crawler                                                                                                                           |        | 1    |        |     | Covered (`sysdes-walkthrough-crawler`)                                                                                                   |
| Payment system                                                                                                                        |        | 2    |        |     | Covered (`sysdes-walkthrough-payments`)                                                                                                  |
| Proximity, metrics monitoring, wallet, leaderboard, stock exchange (ad-click aggregation is the worked example in the stream chapter) |        | 1, 2 |        |     | **Missing** as walkthroughs                                                                                                              |
| Exercises and quizzes                                                                                                                 |        | 1, 2 | yes    |     | Covered as practice pools (`content/system-design/quiz/`) and, for the six walkthroughs, design drills (`content/system-design/drills/`) |

## Still missing, in the order worth building

Items 1 to 4 of the original list (replication, transactions and isolation, storage engines, time and
ordering) were written in batch 1; batch and stream processing and the key-value store, notifications, crawler
and payments walkthroughs were written in batch 2; the practice layer was built in batch 3; release safety,
microservices and security basics were written in batch 4; see below.

1. Walkthroughs from Xu's volumes that nothing here covers: proximity service, metrics monitoring, digital
   wallet, gaming leaderboard, stock exchange (and ad-click aggregation as a walkthrough of its own).
2. Design drills for the walkthroughs listed in item 1, one per new walkthrough (the six written walkthroughs have one;
   `sysdes-case-studies` has none because it is a survey of six real systems, not a single design prompt).

## Batch 1: four new chapters (October 2026)

| Chapter                         | Level        | Covers                                                                                                                                                                          |
| ------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sysdes-replication`            | Intermediate | Leader and followers, sync against async, failover hazards (lost writes, split brain, fencing), multi-leader and conflict resolution, leaderless repair, how four systems do it |
| `sysdes-transactions-isolation` | Advanced     | ACID honestly, the anomalies, isolation levels per engine, snapshot isolation against serializability, 2PL, SSI and serial execution, 2PC, sagas and the outbox                 |
| `sysdes-storage-engines`        | Advanced     | WAL, B-trees against LSM-trees, compaction strategies, Bloom filters, column stores, the three amplifications                                                                   |
| `sysdes-time-ordering-ids`      | Advanced     | Clocks and their error, Lamport and vector clocks, hybrid logical clocks, TrueTime, UUIDv4 and v7, ULID, Snowflake, sequences and ticket servers                                |

How they were made: each chapter was written from primary sources fetched during the session (vendor
manuals, papers, RFCs, engineering post-mortems), then handed to an independent reviewer that saw only the file
and had to verify every checkable claim and recompute every sum. Their findings were severity-graded and fixed:

| Chapter                         | Findings | Typical problems                                                                                                                                                                                   |
| ------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sysdes-replication`            | 17       | A durability row that named the wrong failure, a dry run whose timing contradicted the chapter's own latencies, an "all three hazards" claim, and a Cassandra feature that had changed             |
| `sysdes-transactions-isolation` | 12       | A phantom example that was not a phantom, a lock-hold figure that counted two round trips instead of one, claims true only at one isolation level                                                  |
| `sysdes-storage-engines`        | 17       | A figure labelled to scale that was not, a "ceiling" that was not one, unconditional LSM advantages, a 1.11 space bound stated without its dynamic-level condition                                 |
| `sysdes-time-ordering-ids`      | 16       | Spanner commit-wait figures from the wrong experiment, epsilon taken as the full interval width, an overstated Cloudflare headline, a leap-smear description that skipped where the offset is zero |

The numbers that matter and the claims the reviews proved wrong are guarded in
`tests/system-design-quality.test.ts`. Searching the section now costs 99.3 KB gzip of its 140 KB budget, so
the budget did not need to move.

## Batch 2: five new chapters (October 2026)

| Chapter                            | Level        | Covers                                                                                                                                                                                         |
| ---------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sysdes-batch-stream-processing`   | Advanced     | Bounded and unbounded data, MapReduce to Spark, log-based streaming, event time and watermarks, windows, checkpoints, what exactly-once means, lambda against kappa, CDC, ad-click aggregation |
| `sysdes-walkthrough-kv-store`      | Advanced     | A Dynamo-style store: ring and virtual nodes, preference lists, quorums, vector clocks against last write wins, hints, read repair, Merkle repair, gossip, the LSM node                        |
| `sysdes-walkthrough-notifications` | Intermediate | APNs, FCM, SMS and email constraints, queues and lanes, templates, preferences and opt-outs, retries and de-duplication, delivery tracking                                                     |
| `sysdes-walkthrough-crawler`       | Advanced     | The URL frontier, robots.txt, DNS, normalization, Bloom filters, simhash, spider traps and budgets, freshness, sharding by host                                                                |
| `sysdes-walkthrough-payments`      | Advanced     | PSP flow, an idempotency-key chain, a payment state machine, unknown outcomes, a double-entry ledger, outbox and saga, reconciliation, PCI scope                                               |

Same method as batch 1: each chapter was written from sources fetched in the session, then handed to a
reviewer that saw only the file and had to verify every checkable claim and recompute every sum, and every
finding was re-verified and fixed.

| Chapter                            | Findings | Typical problems                                                                                                                                                                                                      |
| ---------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sysdes-batch-stream-processing`   | 14       | The Kappa name said not to be in Kreps's post when it is, a dry-run conclusion that contradicted its own table, a hot-key fix that partitioned by the key it was meant to avoid, a figure arrow to the wrong box      |
| `sysdes-walkthrough-kv-store`      | 15       | Cassandra's read path mixed into a Dynamo model, strict-quorum arithmetic under a sloppy-quorum story, the wrong chapter number in Xu's book, figure labels that collided                                             |
| `sysdes-walkthrough-notifications` | 11       | A 60-minute retry limit attributed to Google that Google does not give, a 61% that was not the campaign's share, retry timings that were FCM's presented as universal, source gaps                                    |
| `sysdes-walkthrough-crawler`       | 19       | A report cited as the paper, a quadratic cost attributed to the wrong step, a queue-count rule at odds with its own arithmetic, links per page from the year 2000, 95% cross-node links as a fact                     |
| `sysdes-walkthrough-payments`      | 20       | A write-skew remedy that did not remove write skew, Stripe API v1 behaviour presented as universal, a dry run that skipped the state machine, a ledger key that collided on partial refunds, PSP rate limits left out |

The numbers that matter and the claims the reviews proved wrong are guarded in
`tests/system-design-quality.test.ts`. Searching the section now costs 118.2 KB gzip of its 140 KB budget
(84%), so the budget did not need to move. Chapter numbers were re-sequenced again: batch and stream
processing is A7, the three advanced walkthroughs follow the case studies as A12 to A14, and notifications is
I11.

## Batch 3: the practice layer (October 2026)

Every one of the 33 chapters now has a pool of 7 or 8 questions in `content/system-design/quiz/`, registered lazily in
`lib/designPool.ts`. A question is a single choice, a multi select or an order question, tagged with its chapter, its level,
the heading that teaches it (the "Read again" link on a miss) and one of five design skills: concept, trade-off,
diagnose, estimate and sequence. Every choice carries a written explanation. The questions are drawn five at a time in a
practice card at the end of each chapter.

| Decision                                 | Why                                                                                                                                                                                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| System Design stays `completion: "read"` | `"quiz"` would turn `/level/system-design` into the DSA placement flow, which saves to one global key (`groundwork:dsa:placement`) and would overwrite a reader's DSA plan; the placement bank holds only DSA questions; ticks would become links to `#check`. |
| A practice mode instead                  | The card appears for a topic that does not require checks, never marks a chapter read, never writes to `groundwork:quiz`, ignores `#check` and the tick events, and shows no "mark as read without the check" button.                                          |
| Design questions have no DSA tags        | `DesignQuestion` has a design skill and no pattern or placement flag; the DSA pools, their vocabularies and `loadPlacementBank` are unchanged.                                                                                                                 |
| Numbers are recomputed                   | Each estimate question has an entry in `tests/design-estimates/` that recomputes its answer from the inputs in the stem; the test checks that the right choice (and no other) states that value.                                                               |

How the pools were made: for each chapter an author read the whole chapter, fetched the sources it relies on, and wrote the
questions; an independent reviewer who had not seen the author's reasoning then answered every question blind, re-checked
every explanation (including those of the wrong choices), recomputed every number and fetched primary sources. The reviewers
raised about 160 findings across the 33 pools, and every one was re-verified before it was applied or skipped.

| Kind of finding                       | Typical problems                                                                                                                                                                                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Order questions with two valid orders | A stem that named no rule (graceful shutdown, a write path, a cache race, a crawl loop whose order disagreed with Mercator), fixed by stating the rule or the dependency in the stem                                                                                   |
| Explanations that over-claimed        | "Never", "every" and "silently" where a source gave a conditional; a phantom defined too narrowly; a fast 503 that would trip the passive ejection it was meant to prevent                                                                                             |
| Stems that gave the answer away       | A stem that restated the keyed choice, or stated the cost that decided the question                                                                                                                                                                                    |
| Wrong keys                            | No reviewer found a wrong key; they did find several multi selects and single-choice questions where a second answer could be defended, and those were reworded                                                                                                        |
| Length tells                          | The keyed choice was the longest in 44 of the first 79 single-choice questions; `answerBalanceProblems` now fails a pool set where it is the longest in over 40 percent                                                                                                |
| Chapter errors found on the way       | A per-window figure that was per second, an 80 percent remap said of a like-for-like replacement, a CheckQuorum claim that etcd's source contradicts, a Steam figure with no source, a dry run whose row was marked sent too early, DR tiers described as AWS does not |

The pool tests are in `tests/system-design-quiz.test.ts`: ids and answer keys, every `section` against the chapter's real
headings, no empty explanations, five to eight questions with at least three skills, the numeric recomputation, answer
balance across the topic, the import boundary, and a guard that no chapter has `practice: []` and no pool.

## Batch 4: design drills (October 2026)

Each of the six walkthrough chapters (URL shortener, news feed, key-value store, notification system, web crawler,
payment system) now ends with a design drill next to its practice card, in `content/system-design/drills/`, registered
lazily in `lib/designDrill.ts`. A drill is a prompt that states its own planning assumptions, a self-scoring checklist
of 8 or 9 items (each tied to the chapter heading that teaches it) and 4 or 5 common mistakes (each with its heading and
the reason it fails). The learner works the prompt on a whiteboard or on paper, asks for the checklist, ticks what the
answer covered, sees the count with a one-line verdict, and gets a "Read" link to the heading for each unticked item.
Nothing is saved: the card holds its state in memory only and never touches reading progress or `groundwork:quiz`.

| Decision                                  | Why                                                                                                                                                                                                                                                               |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The checklist is hidden until asked for   | Showing it with the prompt would hand over the answer; the card says so and offers the whiteboard first.                                                                                                                                                          |
| No `sysdes-case-studies` drill            | The chapter compares six real systems and has no design prompt of its own; a prompt invented for it would test material the chapter does not teach.                                                                                                               |
| `?template=<chapter id>` on `/whiteboard` | The link opens a new starter board (title, four lane notes, a frame) and strips the parameter, so a refresh does not add a second board and the reader's other boards are untouched. Boards live in `lib/whiteboard/drillBoards.ts`; `templates.ts` is unchanged. |
| Data under `content/`, loaded lazily      | Same rule as the quiz pools: `tests/client-bundle.test.ts` forbids client files reaching `content/`, so a server component loads the drill and passes it to the client card.                                                                                      |

How the drills were made: an author read the whole chapter and its quiz pool, fetched the sources the claims rest on and
wrote the prompt, checklist and mistakes; an independent reviewer who had not seen the author's reasoning then wrote their
own expected checklist from the prompt alone, compared it, and checked every item against primary sources. The first round
found false or over-claimed statements (for example a 5xx retried "with the same key" when Stripe replays the saved 500, a
"never" about robots.txt errors where Google and RFC 9309 differ, a quorum rule that contradicted the availability goal),
items that tested material the chapter does not teach, items that a correct alternative design would fail, and mistakes
that merely negated a checklist item. Authors revised, a second blind round re-reviewed, and a final round reported only
false claims, wrong numbers, wrong sections and mis-scored correct designs; its findings were fixed.

Chapter text the reviewers found wrong or thin, not yet corrected (the drills do not build on them):

- `sysdes-walkthrough-payments`: the timeouts table says to retry "even a 500" with the same key; Stripe replays the saved
  response, including a 500, so a repeat only returns the same error and the outcome must be reconciled instead.
- `sysdes-walkthrough-crawler`: robots.txt 5xx is stated as "assume disallow" without saying that Google's crawler pauses
  for 12 hours and then uses its last good copy (or none) while RFC 9309 says complete disallow; 429 and Retry-After
  backoff are not taught; per-domain budgets are described but the shard key is the host, which cannot enforce them.
- `sysdes-walkthrough-simple`: the scaling table shards at "a few TB" while the sizing says 9 TB is small.
- `sysdes-walkthrough-notifications`: the dedupe design (set the key, then enqueue) has a crash window that loses the event;
  "delete the token" is given for every permanent push error although an oversized payload should go to the dead-letter
  queue; "never fall back across channels for marketing" is absolute where a consent-checked fallback is valid.
- `sysdes-walkthrough-kv-store`: "the hint window has expired so Merkle repair does the work" is Cassandra's behaviour
  (hints stored before the window are still replayed), not Dynamo's.
- `sysdes-walkthrough-medium`: the hybrid threshold is given as followers times posting rate, but a threshold on follower
  count alone is the right driver when the freshness target bounds one post's fan-out.

The drill tests are in `tests/system-design-drills.test.ts`: the registry against the written walkthroughs, one file per
registered drill, ids, headings against the chapter's real sections, non-empty checklists and mistakes, size limits,
failure cases for every rule, the starter boards (one per drill, titled like the drill), the verdict bands, and the
import boundary.

## What this audit could not check

- Paid books were compared by table of contents and public material, not by text.
- Batch 1 chapters rest on documentation for PostgreSQL 18, MySQL 8.4 and Cassandra 5.0 as of October 2026. A few sources could only be read as PDFs through a text extractor (Dynamo, Spanner, LSM-tree, Bigtable, Dong et al.), so wording from them was matched approximately, and the Instagram ID post could not be fetched directly, so the chapter does not rely on it.
- A few primary sources are PDFs the reviewers could not read (the Spanner and Dynamo papers, the Raft
  paper); those facts rest on the abstracts and secondary summaries, and the chapters say so where it matters.
- The OpenAI single-primary Postgres figures come from a page that blocks bots; they were confirmed through
  search results and are phrased as "has described".
- S3 transition fees and some tier prices are approximate US East list prices, labelled as such.
- The 2026 edition of DDIA has not been read.
- Batch 2: Alex Xu's chapters on the key-value store, notifications, the crawler, payments and ad clicks are
  paid content and could not be read; the chapters take their prompts from the tables of contents and use
  their own assumptions, labelled as such. The Dynamo paper, the Mercator report, the IRLbot paper and the
  simhash paper were read as extracted PDF text. Apple's APNs pages are rendered by script and were read through
  Apple's documentation-data endpoint. Twilio's throughput support articles returned 403 to the fetcher, so the
  chapters rely only on the Twilio documentation pages that could be read. Stripe's documentation is used for
  payment behaviour because it is the best documented; other providers differ in detail.
- Several Stripe documentation pages now carry text addressed to AI coding agents (for example, to prefer one
  API over another). It was treated as page content and not acted on.

## Re-running the checks

```bash
npm run check      # includes tests/system-design-quality.test.ts
npm run sources    # fetches every external link in content/system-design/
```

## Batch 4: three short chapters (October 2026)

| Chapter                          | Level        | Covers                                                                                                                                                                       |
| -------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sysdes-microservices-discovery` | Intermediate | When to split, data ownership as the boundary, the distributed monolith, discovery patterns, Kubernetes Services, gateway against mesh, strangler fig                        |
| `sysdes-security-basics`         | Intermediate | Threat model, authentication against authorization, sessions, JWT and OAuth with PKCE, password hashing, authorization models, envelope encryption, the named attacks        |
| `sysdes-release-safety`          | Advanced     | Deploy against release, flags, rollout strategies, canary analysis and error-budget arithmetic, rollback-safe data and schema changes, incident roles, blameless postmortems |

These were kept short on purpose (about 2,500 words each). Each has a sources box, a practice pool of seven questions
checked by the same tests as the rest, and numbers guarded in `tests/system-design-quality.test.ts`. One independent
reviewer read all three chapters and their pools against primary sources and raised 29 findings (3 errors, 3 outdated,
17 misleading, 5 unverified, plus ambiguities in three questions); every one was re-checked and applied or reworded.
The ones worth remembering: the retry arithmetic contradicted the SRE book it cited (three retries are four attempts);
the cloud key service no longer calls its key a master key; the canary savings depend on how fast each rollout is
noticed, so the chapter now shows both detection times; and "human error is never a root cause" is a view from the
wider safety literature, not the SRE book, so the chapter says so. Not added, to keep the chapters short: readiness
and liveness probes, contract tests and schema evolution, cell-based architecture, Zanzibar's consistency tokens,
and the NIST password rules.

## Company questions page (October 2026)

`/system-design/company-questions` lists 30 design prompts that candidates and prep guides say big companies use
(Google, Meta, Amazon, Microsoft, Apple, Netflix, Uber, Atlassian, Flipkart, Swiggy, Razorpay, PhonePe), each with a
full answer written for this site: what to ask first, the numbers, the design, trade-offs, follow-ups and where
candidates slip. Data lives in `content/system-design/company-questions/` (six `batch*.ts` files merged by
`index.ts`); the page is a server component, with a small client filter that only toggles `hidden` on the cards, so
the answers stay out of the client bundle.

How honest labelling works. Companies do not publish their questions, so every card carries an evidence label and
links to the public pages it came from: "Reported in several places" (two or more independent pages, at least one a
candidate write-up), "Reported once" (one candidate write-up), "Listed in prep guides" (no candidate write-up found).
Reposts of the same write-up count once. The answers never say a company asked something or how it builds anything;
the prompts are representative, not quotes. Research found 6 questions with several reports, 16 with one and 8 in
guides only; Glassdoor, LeetCode and Medium could not be read, so those are not cited.

Checks. `tests/company-questions.test.ts` guards the shape (30 unique ids, all 12 companies, real chapter links,
https sources, evidence consistent with source kinds, allowed markup only, no "company asked" claims).
`npm run sources` covers the new links. Three independent reviewers re-derived the arithmetic and design of all 30
answers and changed 22 of them; the findings worth remembering: lock ordering inside one multi-row UPDATE, a unique
key that rejected the adjustment rows the design relied on, an idempotency key that could not work across the shard
key, an outbox row written after commit (a dual write), a counter that drifted from its database, and a load balancer
count that left too little capacity after losing a zone.

Redesign (same day). The page became a hub plus one page per question: `/system-design/company-questions` has a
company wall (tiles are the filter), an evidence filter, six topic chips (`themes.ts`), search and "Surprise me";
`/system-design/company-questions/<id>` has the prompt, a "try it first" bar (cover the answer, 45 minute clock with a
pacing strip, reveal), a sticky section rail, the six answer sections, sources, chapters to read first, related
questions and previous/next. "Practised" is saved in `groundwork:company-questions:practised` and drawn as dots on
the tiles. Entry points: the menu's Go to list, the System Design cover (button, teaser card, footer link), the
interview book landing, the hub and per-question URLs in the sitemap.

Still open: refresh the evidence labels yearly (reports go stale), and a design drill for any of these prompts.
