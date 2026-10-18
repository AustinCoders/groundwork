import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "se-leading-wildcard-scan",
      chapter: "sysdes-search-systems",
      level: "intermediate",
      skill: "concept",
      section: "why-the-obvious-query-can-never-work",
      kind: "single",
      prompt:
        "<p>An <code>items</code> table has an ordinary B-tree index on <code>title</code>. The query <code>WHERE title LIKE '%running%'</code> still reads every row. Which explanation is correct?</p>",
      choices: [
        {
          id: "a",
          text: "A B-tree only stores the first few characters of each title, so text in the middle of a title is not in the index.",
          why: "A B-tree stores the whole indexed value, within page size limits. The obstacle is ordering, not truncation: the tree can only be walked from a known starting point.",
        },
        {
          id: "b",
          text: "LIKE is case-sensitive, so the planner will not use any index on a text column for it.",
          why: "Case sensitivity is not what blocks the index. A left-anchored pattern such as <code>'run%'</code> can be answered from a suitable B-tree, and an infix pattern cannot, whatever the case.",
        },
        {
          id: "c",
          text: "The tree is ordered by prefix, so a pattern that starts with a wildcard gives it no place to start looking.",
          why: "Keys are sorted from their first character, so the tree can jump to every title starting with 'run' but has no way to find titles that merely contain it. Without a start point the database falls back to a full scan.",
        },
        {
          id: "d",
          text: "A B-tree index can only answer equality lookups, never ranges or patterns of any kind.",
          why: "B-trees handle ranges and left-anchored prefixes well, because sorted order makes those contiguous. Only the leading wildcard defeats them.",
        },
      ],
      answer: "c",
    },
    {
      id: "se-slow-shard-tail",
      chapter: "sysdes-search-systems",
      level: "intermediate",
      skill: "estimate",
      section: "elasticsearch-in-practice-shards-replicas-near-real-time",
      kind: "single",
      prompt:
        "<p>An index is split across 100 shards and every query goes to all of them, waiting for the slowest. Assume each shard is slow on 1% of requests, independently of the others. What share of queries hit at least one slow shard?</p>",
      choices: [
        {
          id: "a",
          text: "About 1%, because each shard is only slow 1% of the time",
          why: "1% is the chance for one shard. A query needs all 100 to be fast, so the chance that at least one is slow is far larger.",
        },
        {
          id: "b",
          text: "About 63.4%",
          why: "A query is fast only if all 100 shards are fast, which has probability 0.99^100 ≈ 0.366. So 1 − 0.366 ≈ 0.634 of queries meet at least one slow shard.",
        },
        {
          id: "c",
          text: "100%, because 100 shards × 1% adds up to 100%",
          why: "Adding the probabilities double counts queries that hit two or more slow shards at once. Independent events combine through the complement, 1 − 0.99^100, which stays below 100%.",
        },
        {
          id: "d",
          text: "About 36.6%, the chance that a query hits no slow shard",
          why: "That is 0.99^100, the probability that every shard is fast. The question asks for the opposite event, at least one slow shard.",
        },
      ],
      answer: "b",
    },
    {
      id: "se-empty-page-after-filter",
      chapter: "sysdes-search-systems",
      level: "intermediate",
      skill: "diagnose",
      section: "textual-relevance-is-not-business-relevance",
      kind: "single",
      prompt:
        "<p>A notes app takes the top 100 BM25 hits for a query from millions of notes, then removes the ones the caller may not read, then returns up to 10. A user who can read only a handful of notes searches a common word and gets an empty page, although several of their notes contain it. What is the cause and the fix?</p>",
      choices: [
        {
          id: "a",
          text: "The stemmer is too aggressive. Switch it off so that the user's notes match.",
          why: "Analysis is applied the same way to every note, and the user's notes do match the query. The problem is where they land in the ranking, not whether they match.",
        },
        {
          id: "b",
          text: "The index has too few replicas. Add replicas so that each query can fetch more hits.",
          why: "Replicas are extra copies of a shard that add availability and read throughput. They do not change how many hits a query asks for, so the cut at 100 stays where it was.",
        },
        {
          id: "c",
          text: "Common words get a low IDF. Boost rare terms so that the user's notes rise into the top 100.",
          why: "Changing term weights reorders results for everybody, and the user's few notes can still fall outside the first 100 of millions. A scoring tweak cannot stand in for an access check.",
        },
        {
          id: "d",
          text: "Permissions run after the top-100 cut. Index them as a filterable field and filter in retrieval.",
          why: "The user's permitted notes rank below 100 other people's notes that are then discarded. A filter inside retrieval intersects with the postings lists, so the top hits are drawn only from notes the caller can see.",
        },
      ],
      answer: "d",
    },
    {
      id: "se-which-changes-reindex",
      chapter: "sysdes-search-systems",
      level: "intermediate",
      skill: "concept",
      section: "analysis-the-pipeline-that-decides-what-a-term-even-is",
      kind: "multi",
      prompt:
        "<p>A product index already holds ten million documents. Select every change that leaves existing documents inconsistent with new queries unless you rebuild the index.</p>",
      choices: [
        {
          id: "a",
          text: "Switching the stemmer used at index time on the title field.",
          why: "Existing documents keep the terms the old stemmer produced, while queries are now analyzed with the new rules. Terms can stop matching until the index is rebuilt.",
        },
        {
          id: "b",
          text: "Adding synonym expansion at index time on the title field.",
          why: "Index-time expansion adds terms to the postings lists as documents are written. Documents already indexed never receive them, so they have to be indexed again.",
        },
        {
          id: "c",
          text: "Editing an updateable synonym file used by a search analyzer, then calling the reload search analyzers API.",
          why: "Search-time synonyms only affect how queries are analyzed, and nothing is baked into the stored terms. An updateable filter in a search analyzer can be reloaded in place.",
        },
        {
          id: "d",
          text: "Raising the number of replicas of each shard from one to two.",
          why: "The replica count is a dynamic index setting. Elasticsearch builds the extra copies from the existing primaries, so the analysis chain and the stored terms are untouched.",
        },
        {
          id: "e",
          text: "Changing refresh_interval from 1 second to 30 seconds.",
          why: "The refresh interval is a dynamic setting that controls when new segments become searchable. It does not change the terms inside any document.",
        },
      ],
      answers: ["a", "b"],
    },
    {
      id: "se-fix-the-dual-write",
      chapter: "sysdes-search-systems",
      level: "intermediate",
      skill: "tradeoff",
      section: "search-is-a-secondary-index-fed-asynchronously",
      kind: "single",
      prompt:
        "<p>A listing service saves a row to Postgres and then calls Elasticsearch to index it, both inside the same request handler. About once a week the second call fails or the process is killed between the two calls, and that listing never appears in search until someone edits it again. Which change removes the cause?</p>",
      choices: [
        {
          id: "a",
          text: "Commit the row and an outbox event in one transaction, with a relay feeding the indexer.",
          why: "There is now exactly one atomic commit. The event is durable with the row, so a crash after commit leaves an event the relay will still deliver, and the indexer can retry as often as it needs.",
        },
        {
          id: "b",
          text: "Retry the Elasticsearch call three times inside the handler before giving up.",
          why: "Retries help with transient errors but not when the process dies between the two calls, because the retry state lives in the process that died. The handler still performs two independent writes.",
        },
        {
          id: "c",
          text: "Index into Elasticsearch first and write to Postgres second, so that search is never behind.",
          why: "Reversing the order keeps two independent writes. A failure in between now leaves a search hit with no row behind it, which is a different divergence rather than a fix.",
        },
        {
          id: "d",
          text: "Keep the handler as it is and run a full reindex from Postgres every night.",
          why: "A scheduled rebuild is a reasonable backstop, but it does not remove the cause. Every failed write still hides a listing for up to a day, and the nightly job costs a full pass over the data.",
        },
      ],
      answer: "a",
    },
    {
      id: "se-write-path-order",
      chapter: "sysdes-search-systems",
      level: "intermediate",
      skill: "sequence",
      section: "search-is-a-secondary-index-fed-asynchronously",
      kind: "order",
      prompt:
        "<p>Put these steps in the order the chapter's diagram gives for a write that becomes findable in search, using its change data capture and Kafka pipeline, with the refresh step the text describes coming last.</p>",
      items: [
        { id: "commit", text: "The application commits the row to Postgres, the source of truth" },
        { id: "capture", text: "CDC (or an outbox relay) picks up the committed change" },
        { id: "publish", text: "The change is published to a Kafka topic" },
        { id: "bulk", text: "An indexer consumes the event and bulk-writes it to the search cluster" },
        { id: "refresh", text: "A refresh creates a new segment, and the document becomes searchable" },
      ],
      why: "Nothing downstream can exist before the commit, because the database is the source of truth and everything else is derived from it. The change is captured from the committed state, published to the stream, and applied by the indexer. The document is only visible to queries after the next refresh, which is why a committed write is not instantly findable.",
    },
    {
      id: "se-autocomplete-junk-matches",
      chapter: "sysdes-search-systems",
      level: "intermediate",
      skill: "diagnose",
      section: "autocomplete-is-a-different-problem-with-a-different-index",
      kind: "single",
      prompt:
        "<p>You build autocomplete in Elasticsearch with an edge n-gram analyzer (minimum 1, maximum 10 characters) on the product name field, and you use that same analyzer for both indexing and querying with a default match query. Typing <code>sho</code> returns shirts, socks and sandals as well as shoes. What is the most likely cause?</p>",
      choices: [
        {
          id: "a",
          text: "Edge n-grams cannot cope with prefixes shorter than four characters, so short input falls back to loose matching.",
          why: "An edge n-gram analyzer handles any prefix length from its configured minimum to its maximum. Nothing in it switches to a looser mode for short input.",
        },
        {
          id: "b",
          text: "The query is also split into n-grams, so the terms s and sh match every name that starts with those letters.",
          why: "Index-side n-grams are what turn a prefix into a term lookup. At query time the typed text should be searched as typed, which means a plain search analyzer, so only names with the term sho match.",
        },
        {
          id: "c",
          text: "The index has not refreshed since the last bulk load, so it contains stale terms for these products.",
          why: "A late refresh makes new documents appear late. It does not add unrelated documents to a result, and refresh timing has no effect on which prefixes a query term matches.",
        },
        {
          id: "d",
          text: "A stemmer is missing, so sho and shoes are not reduced to one root and the engine broadens the search.",
          why: "Stemming reduces inflected words such as running to run. It does not make a partial prefix equal to a whole word, and a missing stemmer never broadens a search.",
        },
      ],
      answer: "b",
    },
    {
      id: "se-bm25-term-frequency-cap",
      chapter: "sysdes-search-systems",
      level: "intermediate",
      skill: "concept",
      section: "relevance-tf-idf-then-bm25-then-reality",
      kind: "single",
      prompt:
        "<p>Under raw TF-IDF, a page that repeats <em>kayak</em> 500 times scores about 500 times a page of the same length that mentions it once. Which BM25 mechanism, as the chapter describes it, stops the score growing in proportion to the count?</p>",
      choices: [
        {
          id: "a",
          text: "Length normalization, controlled by the parameter b",
          why: "Length normalization penalizes long documents against the corpus average. The two pages here have the same length, so it treats them identically and the repeated term still dominates.",
        },
        {
          id: "b",
          text: "Inverse document frequency, because kayak is a rare term",
          why: "IDF depends on how many documents contain the term, which is the same for both pages. It scales the term's weight but does nothing to the number of times it occurs within one page.",
        },
        {
          id: "c",
          text: "Diminishing returns on term frequency, tuned by k1",
          why: "Term frequency saturates, so going from 1 to 5 occurrences matters a lot and going from 50 to 500 matters very little. That is the cap on gaming the score by repetition.",
        },
        {
          id: "d",
          text: "Reciprocal rank fusion of the lexical and vector rankings",
          why: "Fusion combines ranked lists from separate retrievers by position. It sits on top of the scores and does not change how a single lexical score treats repeated terms.",
        },
      ],
      answer: "c",
    },
  ],
};
