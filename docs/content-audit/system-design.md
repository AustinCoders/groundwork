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
Four new chapters (batch 1, October 2026, below) now cover them, bringing the section to 28 chapters. Batch and
stream processing and the practice layer are still missing; see "Still missing".

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

| Topic                                                                                                                     | DDIA   | Xu   | Primer | SRE | Status here                                   |
| ------------------------------------------------------------------------------------------------------------------------- | ------ | ---- | ------ | --- | --------------------------------------------- |
| Capacity estimation, latency numbers                                                                                      |        | 1    | yes    |     | Covered                                       |
| Scaling, load balancing, CDN, caching, rate limiting                                                                      |        | 1    | yes    | yes | Covered                                       |
| Consistent hashing, sharding                                                                                              | 6      | 1    | yes    |     | Covered                                       |
| Consistency models, CAP, PACELC                                                                                           | 9      |      | yes    |     | Covered                                       |
| Consensus (Raft, Paxos)                                                                                                   | 9      |      |        | yes | Covered                                       |
| Message queues and logs                                                                                                   | 11     | 2    | yes    |     | Covered                                       |
| SLOs, error budgets, monitoring, overload, cascading failure                                                              |        | 2    |        | yes | Covered                                       |
| Search                                                                                                                    | 3      | 1    |        |     | Covered (surface)                             |
| Object storage                                                                                                            |        | 2    |        |     | Covered                                       |
| URL shortener, news feed, chat (part), autocomplete (part), rate limiter                                                  |        | 1    | yes    |     | Covered                                       |
| Replication: leaders, followers, multi-leader, leaderless, conflict resolution                                            | 5      |      | yes    |     | Covered (`sysdes-replication`)                |
| Transactions: ACID, isolation levels, 2PC, sagas                                                                          | 7      | 2    |        |     | Covered (`sysdes-transactions-isolation`)     |
| Storage engines: LSM, B-tree, WAL, columnar                                                                               | 3      | 2    | yes    |     | Covered (`sysdes-storage-engines`)            |
| Clocks, ordering, unique IDs                                                                                              | 8      | 1    |        |     | Covered (`sysdes-time-ordering-ids`)          |
| Batch and stream processing                                                                                               | 10, 11 | 2    |        | yes | **Missing**                                   |
| Encoding and schema evolution                                                                                             | 4      |      |        |     | **Partial.** API versioning only              |
| Release safety, incidents, postmortems                                                                                    |        |      |        | yes | **Partial.** Short additions                  |
| Microservices, service discovery, service mesh                                                                            |        |      | yes    |     | **Partial.** API gateway only                 |
| Security in design                                                                                                        |        |      | yes    |     | **Missing**                                   |
| Geospatial indexes, probabilistic structures                                                                              |        | 2    |        |     | **Partial.** Mentions only                    |
| Key-value store, web crawler, notifications, proximity, metrics, ad clicks, payments, wallet, leaderboard, stock exchange |        | 1, 2 |        |     | **Missing** as walkthroughs                   |
| Exercises and quizzes                                                                                                     |        | 1, 2 | yes    |     | **Missing.** Every chapter has `practice: []` |

## Still missing, in the order worth building

Items 1 to 4 of the original list (replication, transactions and isolation, storage engines, time and
ordering) were written in batch 1; see below.

1. Batch and stream processing: MapReduce to Spark, Kafka with Flink, event time, windows, exactly-once.
2. Release safety and incident practice: canaries, rollback, feature flags, config pushes, postmortems.
3. Microservices and service discovery; security basics for design interviews.
4. Walkthroughs from Xu's volumes that nothing here covers: key-value store, notifications, crawler,
   payments, proximity, metrics monitoring.
5. A practice layer. The quiz machinery is built around DSA patterns today, so System Design needs its own
   question format (design prompts with a scoring checklist, and trade-off multiple choice).

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

## What this audit could not check

- Paid books were compared by table of contents and public material, not by text.
- Batch 1 chapters rest on documentation for PostgreSQL 18, MySQL 8.4 and Cassandra 5.0 as of October 2026. A few sources could only be read as PDFs through a text extractor (Dynamo, Spanner, LSM-tree, Bigtable, Dong et al.), so wording from them was matched approximately, and the Instagram ID post could not be fetched directly, so the chapter does not rely on it.
- A few primary sources are PDFs the reviewers could not read (the Spanner and Dynamo papers, the Raft
  paper); those facts rest on the abstracts and secondary summaries, and the chapters say so where it matters.
- The OpenAI single-primary Postgres figures come from a page that blocks bots; they were confirmed through
  search results and are phrased as "has described".
- S3 transition fees and some tier prices are approximate US East list prices, labelled as such.
- The 2026 edition of DDIA has not been read.

## Re-running the checks

```bash
npm run check      # includes tests/system-design-quality.test.ts
npm run sources    # fetches every external link in content/system-design/
```
