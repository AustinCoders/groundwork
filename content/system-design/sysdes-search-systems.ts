import type { Chapter } from "../types";

export const sysdesSearchSystems: Chapter = {
  id: "sysdes-search-systems",
  num: "I8",
  title: "Search systems (surface)",
  short: "Search systems",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "The database scans; the inverted index looks up. Everything else in search is ranking and staleness.",
  body: `<h3>Why the obvious query can never work</h3>
<p>
  Every search feature starts as <code>SELECT * FROM items WHERE title LIKE
  '%running shoes%'</code>. It works on 10,000 rows in a laptop demo and
  fails on every axis at scale, for reasons that are worth being able to
  state precisely rather than waving at.
</p>
<ul>
  <li><b>The leading wildcard defeats the index.</b> A B-tree orders by prefix, so it can answer "starts with run" but has no way to jump to rows containing <em>run</em> somewhere in the middle. Every query becomes a full table scan.</li>
  <li><b>Scans do not fit the latency budget.</b> 50 million rows at 2 KB each is 100 GB. Even reading purely from page cache at several GB/s that is tens of seconds, and it burns the CPU and I/O of the database your writes depend on.</li>
  <li><b>It is literal.</b> "running shoes" does not match "shoes for running", "Running Shoe", or "sneakers". No stemming, no reordering, no synonyms.</li>
  <li><b>There is no ranking at all.</b> <code>LIKE</code> returns a set, not an order. With 40,000 matches you have no principled way to pick the 10 to show, and the ordering is the entire product.</li>
</ul>
<p>
  Postgres full-text search (<code>tsvector</code> plus a GIN index) fixes the
  first three and part of the fourth, and is genuinely the right answer up to
  a few million documents with modest query volume. Say so — reaching for
  Elasticsearch on day one is over-engineering and a good interviewer will
  say as much. But both roads lead to the same data structure, so understand
  it properly.
</p>

<h3>The inverted index, built from three documents</h3>
<p>
  A normal index maps <em>document → contents</em>. An inverted index maps
  <em>term → the documents containing it</em>, which is the direction a query
  actually needs. Each entry in the map is a <b>postings list</b>: the sorted
  document IDs for that term, usually with positions and term frequencies
  alongside.
</p>
<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="Three short documents about shoes being analyzed into an inverted index of five terms, where the term shoe appears in all three documents and the query red running intersects two postings lists to return document one">
    <g class="rough">
      <path class="ln" d="M225,122 L325,122" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="40" width="200" height="44" rx="6" />
      <rect class="box" x="20" y="100" width="200" height="44" rx="6" />
      <rect class="box" x="20" y="160" width="200" height="44" rx="6" />
      <rect class="boxy" x="330" y="40" width="290" height="28" rx="4" />
      <rect class="boxy" x="330" y="76" width="290" height="28" rx="4" />
      <rect class="boxr" x="330" y="112" width="290" height="28" rx="4" />
      <rect class="boxy" x="330" y="148" width="290" height="28" rx="4" />
      <rect class="boxy" x="330" y="184" width="290" height="28" rx="4" />
    </g>
    <text class="sm" x="34" y="68">D1 &nbsp;red running shoes</text>
    <text class="sm" x="34" y="128">D2 &nbsp;red shoes for kids</text>
    <text class="sm" x="34" y="188">D3 &nbsp;running shoes review</text>
    <text class="sm" x="275" y="112" text-anchor="middle">analyze</text>
    <text class="sm" x="344" y="59">red &nbsp;→ &nbsp;[D1, D2]</text>
    <text class="sm" x="344" y="95">run &nbsp;→ &nbsp;[D1, D3]</text>
    <text class="sm rd" x="344" y="131">shoe &nbsp;→ &nbsp;[D1, D2, D3]</text>
    <text class="sm" x="344" y="167">kid &nbsp;→ &nbsp;[D2]</text>
    <text class="sm" x="344" y="203">review &nbsp;→ &nbsp;[D3]</text>
    <text class="lbl" x="320" y="244" text-anchor="middle" style="font-size:15px">query "red running" → red[D1,D2] ∩ run[D1,D3] = D1</text>
    <text class="sm rd" x="320" y="274" text-anchor="middle">shoe matches everything, so it carries almost no signal — that is IDF</text>
  </svg>
  <figcaption>Both postings lists are sorted, so the intersection is a linear merge over two short lists — never a scan of the corpus.</figcaption>
</figure>
<p>
  The performance property is the whole point: query cost scales with the
  length of the postings lists for the query's terms, not with corpus size.
  Adding fifty million documents that contain neither <em>red</em> nor
  <em>run</em> costs those queries nothing. And because the lists are sorted
  integer sequences, they compress viciously well (delta encoding plus
  variable-byte or bitpacking), so a 100 GB corpus produces an index in the
  low tens of GB that largely lives in page cache.
</p>
<p class="sub">
  Postings usually store more than IDs. Term frequency per document powers
  scoring; term positions power phrase queries, so <code>"red shoes"</code> as
  an exact phrase can check that <em>red</em> at position i is followed by
  <em>shoe</em> at position i+1 rather than merely co-occurring in the
  document.
</p>

<h3>Analysis: the pipeline that decides what a term even is</h3>
<p>
  Notice that "running" became "run" and "for" disappeared. That transform is
  the <b>analyzer</b>, and it runs identically at index time and at query
  time — the non-negotiable rule of search, because a query term that was
  analyzed differently from the document term will simply never match.
</p>
<table>
  <tr><th>Stage</th><th>Does</th><th>"Red Running Shoes, for Kids!" becomes</th></tr>
  <tr><td>Character filter</td><td>Strip HTML, normalize punctuation and accents</td><td>Red Running Shoes for Kids</td></tr>
  <tr><td>Tokenizer</td><td>Split into terms on whitespace/punctuation rules</td><td>[Red] [Running] [Shoes] [for] [Kids]</td></tr>
  <tr><td>Lowercase</td><td>Case-fold</td><td>[red] [running] [shoes] [for] [kids]</td></tr>
  <tr><td>Stop words</td><td>Drop extremely common, low-information terms</td><td>[red] [running] [shoes] [kids]</td></tr>
  <tr><td>Stemming</td><td>Reduce inflections to a common root</td><td>[red] [run] [shoe] [kid]</td></tr>
  <tr><td>Synonyms (optional)</td><td>Expand or normalize equivalents</td><td>[red] [run] [shoe] [sneaker] [kid]</td></tr>
</table>
<p>
  Three things to know about these stages, because each has a real failure
  mode. <b>Tokenization is language-specific</b>: whitespace splitting is
  useless for Chinese and Japanese, which need dictionary-based segmentation,
  and it mangles identifiers like <code>C++</code> or
  <code>wi-fi</code>. <b>Stemming is a lossy heuristic</b> — Porter stemming
  maps "university" and "universe" both to "univers", and "operating" to
  "oper"; lemmatization is the dictionary-based, slower, more accurate
  alternative. <b>Stop words are no longer a clear win</b>: they were a
  compression trick from when index size dominated, and dropping them breaks
  phrase queries like "to be or not to be" and "The Who". Modern engines
  usually keep them and let IDF discount them automatically.
</p>
<div class="warn">
  <span class="ttl">⚠ Changing the analyzer means reindexing everything</span>
  The analyzer's output is baked into the index. Add a synonym list or switch
  stemmers and every existing document is now tokenized under the old rules
  while queries use the new ones — matches silently disappear. This is why
  production search runs <b>index aliases</b>: build the new index in
  parallel, backfill it, then atomically swing the alias. Volunteering that
  operational detail is a strong signal, because it is the thing that hurts
  in real life.
</div>

<h3>Relevance: TF-IDF, then BM25, then reality</h3>
<p>
  Once you have the matching set you must order it. The classical intuition is
  <b>TF-IDF</b>, built from two opposing forces:
</p>
<ul>
  <li><b>Term frequency.</b> A document mentioning "kayak" eight times is more about kayaks than one mentioning it once.</li>
  <li><b>Inverse document frequency.</b> A term appearing in nearly every document (<em>shoe</em> in our three-doc corpus, or <em>the</em> in any corpus) discriminates nothing, so its weight collapses toward zero. Rare terms carry the signal.</li>
</ul>
<p>
  A document's score for a query is the sum, over the query's terms, of
  term-frequency times inverse-document-frequency. <b>BM25</b> is the modern
  default and fixes two concrete defects in that formula, both worth naming:
</p>
<ul>
  <li><b>Term frequency saturates.</b> Under raw TF-IDF a page repeating "kayak" 500 times scores 500× a page mentioning it once, which is both wrong and trivially game-able. BM25 applies diminishing returns via a tunable parameter (k1, typically ~1.2), so going from 1 to 5 occurrences matters a lot and 50 to 500 matters almost nothing.</li>
  <li><b>Length normalization.</b> A long document naturally contains more terms and would otherwise win everything. BM25 divides by document length relative to the corpus average, with a parameter b (typically 0.75) controlling how hard that penalty bites.</li>
</ul>
<p class="sub">
  You do not need the closed form on a whiteboard. Saying "BM25 — TF-IDF with
  saturating term frequency and length normalization, and it's the default in
  Lucene" demonstrates exactly the right depth for a system design round. If
  someone pushes further, the honest frontier is that BM25 is a lexical
  score, and modern stacks add a <b>vector/embedding</b> retrieval arm to
  catch semantic matches BM25 misses, then fuse the two result sets.
</p>

<h3>Textual relevance is not business relevance</h3>
<p>
  BM25 answers "which document is most about these words." Nobody actually
  wants that. A news search wants recent things; a marketplace wants items
  that are in stock and convert; a music app wants the song people are
  streaming this week. Pure lexical relevance would happily rank a perfectly
  matching, sold-out, three-year-old listing first.
</p>
<p>
  Real systems therefore run <b>two stages</b>, and the separation is the
  architectural point:
</p>
<table>
  <tr><th>Stage</th><th>Input size</th><th>Cost per doc</th><th>Signals used</th></tr>
  <tr><td>Retrieval (candidate generation)</td><td>Millions → a few hundred</td><td>Must be microseconds</td><td>BM25 over the inverted index, plus hard filters (in stock, region, permissions)</td></tr>
  <tr><td>Ranking (rerank)</td><td>A few hundred → 10</td><td>Can afford milliseconds each</td><td>Recency decay, popularity, click-through history, personalization, a learned model</td></tr>
</table>
<p>
  The reason to split is pure economics: you cannot run a gradient-boosted
  model or a cross-encoder over ten million documents inside a 200 ms budget,
  but you can absolutely run it over 300. Blending is usually multiplicative
  or a weighted sum over normalized signals — a common shape being
  <em>final = bm25_norm × recency_decay × log(1 + popularity)</em>, where
  recency decay is an exponential with a half-life chosen per vertical (hours
  for news, months for products).
</p>
<div class="warn">
  <span class="ttl">⚠ Hard filters must happen in retrieval, not rerank</span>
  If "only show items I'm permitted to see" or "only in-stock" is applied
  after fetching the top 100, a user whose permitted set is rare gets an
  empty page while millions of matching documents exist. Permissions and
  availability belong in the index as filterable fields so the engine
  intersects them with the postings lists. Filtering after ranking is a
  correctness bug that presents as a relevance bug.
</div>

<h3>Elasticsearch in practice: shards, replicas, near-real-time</h3>
<p>
  Elasticsearch and OpenSearch are distributed wrappers around Lucene, and the
  three operational concepts you need are all visible in how a document
  becomes searchable.
</p>
<ul>
  <li><b>Shards</b> partition the index. Each shard is an independent Lucene index; a query fans out to every shard, each returns its local top-k, and a coordinating node merges them. Practical sizing is <b>10-50 GB per shard</b>. Over-sharding is the common mistake — every query pays coordination overhead on every shard, so a 20 GB index split into 100 shards is dramatically slower than the same data in 2.</li>
  <li><b>Replicas</b> are full copies of a shard. They provide both availability (a lost node loses no data) and read throughput (queries round-robin across copies). Writes go to the primary and replicate; read scaling is therefore cheap, write scaling requires more primaries, which requires more shards, which you cannot change without reindexing.</li>
  <li><b>Near-real-time.</b> Lucene segments are immutable. A new document goes to an in-memory buffer and is not searchable until a <em>refresh</em> creates a new segment — by default every 1 second. That one second is not a bug you can configure away for free: refreshing more often produces more tiny segments and more merge pressure. For bulk loads the standard move is to disable refresh entirely, index, then refresh once.</li>
</ul>
<p class="sub">
  Immutable segments also explain deletes and updates. A delete just marks a
  tombstone; an update is a delete plus an insert. Space is only reclaimed
  when background <b>merges</b> rewrite segments together, so a
  heavily-updated index carries dead weight and periodic merge I/O spikes.
  This is why Elasticsearch is a poor primary datastore for
  frequently-mutating rows and a great one for append-heavy documents.
</p>

<h3>Search is a secondary index, fed asynchronously</h3>
<p>
  This is the architectural claim that matters most in an interview, and the
  one candidates most often get backwards. <b>Your search cluster is not your
  source of truth.</b> It is a derived, denormalized, rebuildable projection
  of data that lives authoritatively somewhere else.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="Writes going from the application into Postgres as the source of truth, then flowing through change data capture into Kafka and an indexer that populates a search cluster, which the application queries back, with replication lag of up to thirty seconds in between">
    <g class="rough">
      <path class="ln" d="M130,49 L180,49" />
      <path class="ln" d="M310,49 L360,49" />
      <path class="ln" d="M480,49 L520,49" />
      <path class="ln" d="M570,72 L570,163 L520,163" />
      <path class="ln" d="M400,163 L350,163" />
      <path class="lng" d="M200,163 L75,163 L75,72" />
    </g>
    <g class="rough">
      <rect class="boxy" x="20" y="26" width="110" height="46" rx="6" />
      <rect class="boxg" x="180" y="26" width="130" height="46" rx="6" />
      <rect class="box" x="360" y="26" width="120" height="46" rx="6" />
      <rect class="box" x="520" y="26" width="100" height="46" rx="6" />
      <rect class="box" x="400" y="140" width="120" height="46" rx="6" />
      <rect class="boxy" x="200" y="140" width="150" height="46" rx="6" />
    </g>
    <text class="lbl" x="75" y="54" text-anchor="middle">app</text>
    <text class="lbl" x="245" y="48" text-anchor="middle">Postgres</text>
    <text class="sm" x="245" y="66" text-anchor="middle">source of truth</text>
    <text class="lbl" x="420" y="54" text-anchor="middle">CDC / outbox</text>
    <text class="lbl" x="570" y="54" text-anchor="middle">Kafka</text>
    <text class="lbl" x="460" y="158" text-anchor="middle">indexer</text>
    <text class="sm" x="460" y="176" text-anchor="middle">bulk, map, retry</text>
    <text class="lbl" x="275" y="158" text-anchor="middle">search cluster</text>
    <text class="sm" x="275" y="176" text-anchor="middle">secondary index</text>
    <text class="sm" x="155" y="40" text-anchor="middle">write</text>
    <text class="sm" x="335" y="40" text-anchor="middle">change</text>
    <text class="sm" x="500" y="40" text-anchor="middle">publish</text>
    <text class="sm rd" x="558" y="112" text-anchor="end">lag: 100 ms – 30 s</text>
    <text class="sm gr" x="150" y="152" text-anchor="middle">query</text>
    <text class="lbl rd" x="320" y="228" text-anchor="middle" style="font-size:14px">a write committed in Postgres is not yet findable in search — design the UX for that</text>
  </svg>
  <figcaption>The search cluster is downstream of the truth, always. Anything you can only learn by querying it is data you are prepared to lose and rebuild.</figcaption>
</figure>
<p>
  Three consequences follow, and each is an interview point on its own:
</p>
<ul>
  <li><b>No read-your-writes.</b> A user edits a listing and immediately searches for it; the change is committed but not yet indexed. Fixes, in increasing order of effort: tell the UI it may take a moment; read the just-written record from the primary and splice it into the results; or make the write path wait for an index acknowledgement, which trades latency for consistency and is rarely worth it.</li>
  <li><b>Never dual-write.</b> The tempting implementation is "write to Postgres, then write to Elasticsearch" in the same request handler. It fails the instant the second write errors or the process dies between them, and it leaves permanent, silent divergence. Use the <b>transactional outbox</b> (write the row and an outbox event in one transaction, a relay publishes the event) or <b>change data capture</b> from the database's replication log. Either way there is exactly one atomic commit.</li>
  <li><b>It is disposable, and that is the point.</b> Because the index is derived, you can always rebuild it from source. This is what makes the alias-swap reindex safe, and it means a corrupted search cluster is an availability incident, not a data-loss incident. It also means search should degrade gracefully — if the cluster is down, fall back to a database prefix lookup or a "search is temporarily unavailable" state rather than failing the whole page.</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "Search is a secondary index. The
  relational store stays the source of truth, and I'll propagate changes with
  CDC or a transactional outbox into a stream, with an indexer doing bulk
  writes into Elasticsearch. That gives me eventual consistency on the order
  of a second, so I'd handle read-your-writes at the API layer by merging the
  freshly-written record into results. If the cluster dies I rebuild it from
  the source rather than restore it from backup."
</div>

<h3>Autocomplete is a different problem with a different index</h3>
<p>
  Autocomplete fires on every keystroke, so its budget is roughly 50 ms
  end-to-end including the network, and it must handle a 2-character prefix
  matching millions of entries. Running a full BM25 query per keystroke is
  both too slow and semantically wrong — "shoe" typed as "sho" is not a term.
</p>
<table>
  <tr><th>Approach</th><th>How</th><th>Reach for this when…</th></tr>
  <tr><td>Edge n-grams</td><td>Index "shoes" as sh, sho, shoe, shoes — a prefix becomes an exact term lookup</td><td>You want it inside your existing search cluster with no new infrastructure; costs index size</td></tr>
  <tr><td>Trie / FST</td><td>Prefix tree in memory; walk the prefix, then collect the top-k completions stored at that node</td><td>You need the lowest possible latency and control over the ranked suggestions</td></tr>
  <tr><td>Precomputed top-k per prefix</td><td>Key-value store: prefix → the 10 best completions, refreshed offline from query logs</td><td>Query volume is enormous and the suggestion set changes slowly — a single cache hit per keystroke</td></tr>
  <tr><td>Fuzzy / typo-tolerant</td><td>Levenshtein-bounded automaton over the FST, usually edit distance 1 for short terms</td><td>Mobile users; be careful, it multiplies the candidate set</td></tr>
</table>
<p class="sub">
  The crucial insight is that suggestions should be ranked by what people
  <em>search for</em>, not by what exists in the catalogue. Build the
  suggestion index from query logs weighted by frequency and click-through,
  which also means it is small, offline-rebuildable, and can be pushed
  entirely into memory. And debounce on the client at 100-150 ms — the
  cheapest 60% traffic reduction in the whole design.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt says "search", "find", "filter by keyword", "typeahead", or describes users looking for something by name or description rather than fetching it by ID.</li>
  <li>A naive design puts <code>LIKE '%term%'</code> on the primary database and never mentions ranking — the two failures to call out immediately are the full scan and the absence of any ordering.</li>
  <li>Distinguish it from a <b>database indexing</b> question: a B-tree answers "give me the rows where x = y" exactly; search answers "give me the best rows for this fuzzy human intent, in order." Ranking is the tell.</li>
  <li>Distinguish it from a <b>recommendation</b> question: search has an explicit query string, recommendations do not. They share the two-stage retrieve-then-rank architecture, which is a good connection to draw.</li>
  <li>Any time you introduce a search cluster, immediately say how it gets fed and what the staleness window means for the user — the async secondary-index point is worth more than any detail about BM25.</li>
  <li>Pitfall: forgetting permissions and filters belong in the index. Post-filtering ranked results silently returns empty pages to exactly the users with the narrowest access.</li>
</ul>`,
};
