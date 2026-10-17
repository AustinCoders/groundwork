import type { Chapter } from "../types";

export const sysdesWalkthroughCrawler: Chapter = {
  id: "sysdes-walkthrough-crawler",
  num: "A13",
  title: "Walkthrough: a web crawler",
  short: "Walkthrough: web crawler",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "A crawler is a loop that fetches pages and follows links, and every hard part is about not doing that too fast, too often, or forever.",
  body: `<h3>What you are building</h3>
<p>
  "Design a web crawler" (a chapter of Alex Xu's first volume) is a graph traversal
  with three rules bolted on that make it a systems problem. The web is a graph of
  pages joined by links; a crawler starts from <b>seed URLs</b>, downloads each page,
  extracts the links and repeats. The rules are the real question: <b>be polite</b> (do
  not hurt the sites you visit), <b>be robust</b> (the web contains traps, garbage and
  malice), and <b>stay fresh</b> (pages change, and the crawl never finishes). The
  purposes differ (a search index, a web archive, a data set for model training), but
  the machinery is the same. Requirements to say aloud:
</p>
<ul>
  <li><b>Scale.</b> Billions of pages, so every data structure is sized for billions and most live on disk or are sharded.</li>
  <li><b>Politeness.</b> Bounded request rate per host, obeying <code>robots.txt</code>, an honest user-agent.</li>
  <li><b>Robustness.</b> Malformed HTML, endless URL spaces, slow or hostile servers, DNS failures.</li>
  <li><b>Freshness and priority.</b> Spend a fixed budget of fetches on the pages that matter most and change most.</li>
  <li><b>Extensibility.</b> New content types (PDF, images) plug in without rewriting the loop.</li>
</ul>

<h3>Capacity estimation</h3>
<p>
  The inputs are assumptions chosen to be round; the method is what to copy. Where a
  figure comes from a paper, it is attributed.
</p>
<ul>
  <li><b>Throughput:</b> design for 600 pages a second: 600 × 86,400 = <b>51.8 million pages a day</b>, or about 1.56 billion a month. (For scale, the Mercator crawler processed about 50 million URLs a day over 17 days in 2000, about 43 million of them successful downloads, and IRLbot averaged 1,789 pages a second for 41 days on one server.)</li>
  <li><b>Bandwidth:</b> assume 100 KB of HTML a page: 600 × 100 KB = <b>60 MB/s, or 480 Mbps</b> of download.</li>
  <li><b>Storage:</b> an index of 1 billion pages × 100 KB = <b>100 TB</b> of raw HTML; at an assumed 4:1 compression, 25 TB.</li>
  <li><b>URL checks:</b> with 10 links per page (about what Mercator saw in 2000; IRLbot's 2007 crawl parsed 394.6 billion links from 6.38 billion pages, about 62 per page, which would make it 37,000 a second), 600 × 10 = <b>6,000 URL-seen lookups a second</b>. Mercator's first disk-based table managed about 125 seeks a second, 750 submissions a second after caching, which with 10 links per page capped it at 75 downloads a second. We need 8 times that. On the spinning disks of 2000 a seek per lookup cannot work; today's SSDs change the arithmetic, but a URL-seen set that must grow to tens of billions of URLs still wants memory-resident or batched structures for cost and latency.</li>
  <li><b>URL-seen set:</b> assume 5 billion known URLs. Mercator's in-memory table of URL fingerprints (it stored 5 of the 8 fingerprint bytes plus overhead) cost slightly over 5 GB per billion URLs, so about <b>25 GB</b> for a near-exact set; a Bloom filter at a 1% false-positive rate needs about 9.585 bits an entry (derived below), 5 × 10<sup>9</sup> × 9.585 bits = 47.9 Gbit = <b>6.0 GB</b>.</li>
  <li><b>Simhash fingerprints:</b> 1 billion pages × 8 bytes = <b>8 GB</b>.</li>
  <li><b>Crawler nodes:</b> at an assumed 30 pages a second a node (network and DNS bound), 600 ÷ 30 = <b>20 nodes</b>, each moving 3 MB/s (24 Mbps).</li>
  <li><b>Concurrency:</b> by Little's law, in-flight fetches = rate × time per fetch. At an assumed 1 second including DNS, 600 × 1 = <b>600 in-flight requests</b> cluster-wide, 30 per node.</li>
</ul>

<h3>The loop</h3>
<figure>
  <svg viewBox="0 0 640 270" class="dg" role="img" aria-label="The crawl loop: seed URLs feed a URL frontier, which hands URLs to a fetcher that uses DNS and robots caches, then a parser that checks content against fingerprints and writes to a content store. A link extractor normalizes and filters links, a URL-seen check drops known URLs, and a router sends new URLs to the frontier of the node that owns their host.">
    <g class="rough">
      <path class="lng" d="M96,60 L126,60" />
      <path class="lng" d="M236,60 L270,60" />
      <path class="lng" d="M380,60 L414,60" />
      <path class="lng" d="M524,60 L546,60" />
      <path class="ln"  d="M469,82 L469,150" />
      <path class="ln"  d="M414,172 L380,172" />
      <path class="ln"  d="M270,172 L236,172" />
      <path class="ln"  d="M181,150 L181,82" />
      <rect class="box"  x="16"  y="38" width="80"  height="44" rx="6" />
      <rect class="boxy" x="126" y="38" width="110" height="44" rx="6" />
      <rect class="boxg" x="270" y="38" width="110" height="44" rx="6" />
      <rect class="boxg" x="414" y="38" width="110" height="44" rx="6" />
      <rect class="box"  x="546" y="38" width="80"  height="44" rx="6" />
      <rect class="boxg" x="414" y="150" width="110" height="44" rx="6" />
      <rect class="boxy" x="270" y="150" width="110" height="44" rx="6" />
      <rect class="boxy" x="126" y="150" width="110" height="44" rx="6" />
    </g>
    <text class="sm" x="56"  y="64" text-anchor="middle">seed URLs</text>
    <text class="sm" x="181" y="56" text-anchor="middle">URL frontier</text>
    <text class="sm" x="181" y="72" text-anchor="middle">priority, politeness</text>
    <text class="sm" x="325" y="56" text-anchor="middle">fetcher</text>
    <text class="sm" x="325" y="72" text-anchor="middle">DNS, robots cache</text>
    <text class="sm" x="469" y="56" text-anchor="middle">parser</text>
    <text class="sm" x="469" y="72" text-anchor="middle">content-seen test</text>
    <text class="sm" x="586" y="56" text-anchor="middle">content</text>
    <text class="sm" x="586" y="72" text-anchor="middle">store</text>
    <text class="sm" x="469" y="170" text-anchor="middle">link extractor</text>
    <text class="sm" x="469" y="186" text-anchor="middle">normalize, filter</text>
    <text class="sm" x="325" y="170" text-anchor="middle">URL-seen</text>
    <text class="sm" x="325" y="186" text-anchor="middle">seen URLs dropped</text>
    <text class="sm" x="181" y="170" text-anchor="middle">route by host</text>
    <text class="sm" x="181" y="186" text-anchor="middle">to owning node</text>
    <text class="lbl" x="16" y="226" style="font-size:14px">Every box is a place to say no: robots, trap budget, duplicate URL, duplicate content.</text>
    <text class="lbl" x="16" y="248" style="font-size:14px">The frontier is the only box that decides what happens next.</text>
  </svg>
  <figcaption>The crawl loop. The structure matches the one in the Mercator paper (frontier, fetcher, content-seen test, link extractor, duplicate URL eliminator); the router and the per-node ownership are the distributed addition discussed later.</figcaption>
</figure>

<h3>The URL frontier: priority in front, politeness behind</h3>
<p>
  A plain FIFO queue gives breadth-first order, and breadth-first order is rude:
  relative links mean a page's links share a host, so the queue contains runs of the
  same host and many threads hit one server at once. The Mercator paper reports that
  even a frontier that allowed only one thread per host still drew a handful of
  complaints per crawl, because it did not stop a stream of requests to one host with no
  pause between them. The fix, described in the paper and in the Stanford IR book, is
  two layers of queues:
</p>
<ul>
  <li><b>Front queues (priority).</b> F queues, numbered by priority. A prioritizer assigns each URL an integer from 1 to F from its history (whether the page has changed since the last download, its estimated quality). Selection is random but biased to high-priority queues.</li>
  <li><b>Back queues (politeness).</b> B queues, each holding URLs from <b>one host only</b>, plus a table from host to queue. A <b>min-heap</b> has one entry per back queue, keyed by the earliest time that host may be contacted again. A fetch thread pops the root, waits until its time, fetches the head URL, and re-inserts the queue with a new time. When a back queue empties, it is refilled from a front queue.</li>
  <li><b>The gap.</b> A common heuristic, in the Stanford text and in Mercator's production settings, is to wait about 10 times as long as the last download from that host took before contacting it again.</li>
</ul>

<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="Three front queues by priority feed a selector, which refills per-host back queues for a.com, b.org and c.net; a min-heap keyed by next allowed fetch time orders the back queues for fetch threads.">
    <g class="rough">
      <path class="ln" d="M120,62 L150,90" />
      <path class="ln" d="M120,122 L150,120" />
      <path class="ln" d="M120,182 L150,150" />
      <path class="ln" d="M250,90 L290,62" />
      <path class="ln" d="M250,120 L290,122" />
      <path class="ln" d="M250,150 L290,182" />
      <path class="lng" d="M390,62 L430,100" />
      <path class="lng" d="M390,122 L430,122" />
      <path class="lng" d="M390,182 L430,150" />
      <rect class="boxy" x="16"  y="40"  width="104" height="44" rx="6" />
      <rect class="boxy" x="16"  y="100" width="104" height="44" rx="6" />
      <rect class="boxy" x="16"  y="160" width="104" height="44" rx="6" />
      <rect class="box"  x="150" y="60"  width="100" height="120" rx="6" />
      <rect class="boxg" x="290" y="40"  width="100" height="44" rx="6" />
      <rect class="boxg" x="290" y="100" width="100" height="44" rx="6" />
      <rect class="boxg" x="290" y="160" width="100" height="44" rx="6" />
      <rect class="boxr" x="430" y="76"  width="190" height="92" rx="6" />
    </g>
    <text class="sm" x="68" y="58"  text-anchor="middle">priority 1</text>
    <text class="sm" x="68" y="74"  text-anchor="middle">(highest)</text>
    <text class="sm" x="68" y="122" text-anchor="middle">priority 2</text>
    <text class="sm" x="68" y="182" text-anchor="middle">priority 3</text>
    <text class="sm" x="200" y="112" text-anchor="middle">biased pick,</text>
    <text class="sm" x="200" y="128" text-anchor="middle">refill empty</text>
    <text class="sm" x="200" y="144" text-anchor="middle">back queue</text>
    <text class="sm" x="340" y="66"  text-anchor="middle">a.com</text>
    <text class="sm" x="340" y="126" text-anchor="middle">b.org</text>
    <text class="sm" x="340" y="186" text-anchor="middle">c.net</text>
    <text class="sm" x="525" y="104" text-anchor="middle">min-heap of queues</text>
    <text class="sm" x="525" y="120" text-anchor="middle">keyed by next allowed</text>
    <text class="sm" x="525" y="136" text-anchor="middle">fetch time</text>
    <text class="sm" x="525" y="152" text-anchor="middle">threads pop the root</text>
    <text class="lbl" x="16" y="224" style="font-size:14px">front = what matters; back = one host at a time, with a gap</text>
  </svg>
  <figcaption>Two jobs, two layers. The front queues decide <em>which</em> URLs are worth fetching; the back queues and the heap decide <em>when</em> each host may be touched.</figcaption>
</figure>
<p>
  How many hosts must be waiting? If every download from a host takes <i>f</i> seconds
  and the gap is 10<i>f</i>, one host can be fetched at most once every 11<i>f</i> seconds
  (the gap counted from completion). At a target rate <i>R</i> with average
  <i>f</i>, the crawler needs about <i>R</i> × 11<i>f</i> distinct hosts ready at all
  times. At 600 pages a second and <i>f</i> = 0.5 s that is 600 × 5.5 = <b>3,300 hosts</b>.
  Since threads needed = <i>R</i> × <i>f</i> = 300 (counting only download time), that is 11 queues per
  thread, whatever <i>f</i> is. Mercator reports using only three times as many back queues as
  threads with the 10× gap, and says that was sufficient to keep all threads busy, without
  giving a derivation. With equal fetch times the arithmetic says three would leave
  threads mostly idle; real fetch times vary a lot, and fast hosts cycle faster, which may be
  part of the answer. The lesson is to size the queue count from your own gap rule
  and measured fetch times, not from a quoted ratio.
</p>

<h4>Dry run: one thread, three hosts, and why politeness idles a crawler</h4>
<p>
  Gap = 10 × the last download time, counted from when the download finishes. Host a
  (download 0.4 s) has two URLs, b (0.2 s) has three, c (1.0 s) has one. One fetch
  thread, all hosts ready at time 0.
</p>
<table>
  <tr><th>Time (s)</th><th>Heap before (host: next allowed)</th><th>Action</th><th>Host's next allowed</th></tr>
  <tr><td>0.0</td><td>a: 0, b: 0, c: 0</td><td>Pop a, fetch a1 (0.0 to 0.4)</td><td>a: 0.4 + 4.0 = 4.4</td></tr>
  <tr><td>0.4</td><td>b: 0, c: 0, a: 4.4</td><td>Pop b, fetch b1 (0.4 to 0.6)</td><td>b: 0.6 + 2.0 = 2.6</td></tr>
  <tr><td>0.6</td><td>c: 0, b: 2.6, a: 4.4</td><td>Pop c, fetch c1 (0.6 to 1.6)</td><td>c: 1.6 + 10.0 = 11.6 (c has no more URLs)</td></tr>
  <tr><td>1.6</td><td>b: 2.6, a: 4.4</td><td>Root is b at 2.6: <b>idle 1.0 s</b></td><td></td></tr>
  <tr><td>2.6</td><td>b: 2.6, a: 4.4</td><td>Fetch b2 (2.6 to 2.8)</td><td>b: 2.8 + 2.0 = 4.8</td></tr>
  <tr><td>2.8</td><td>a: 4.4, b: 4.8</td><td>Root is a at 4.4: <b>idle 1.6 s</b></td><td></td></tr>
  <tr><td>4.4</td><td>a: 4.4, b: 4.8</td><td>Fetch a2 (4.4 to 4.8); a is now empty</td><td>a: done</td></tr>
  <tr><td>4.8</td><td>b: 4.8</td><td>Fetch b3 (4.8 to 5.0); b is now empty</td><td>b: done</td></tr>
</table>
<p class="sub">
  Six fetches in 5.0 seconds, 1.2 a second. Busy time was 0.4 + 0.2 + 1.0 + 0.2 + 0.4 +
  0.2 = 2.4 s, idle time 1.0 + 1.6 = 2.6 s, so the thread was <b>48% busy</b>. With
  three hosts one thread cannot keep busy, which is the case for a frontier with
  thousands of hosts ready; and a slow host's long gap (c's would be 10 seconds) never blocks the others,
  because it only delays that host's own queue in the heap. Politeness is a scheduling problem, and
  the heap solves it without a sleeping thread per host.
</p>

<h3>robots.txt and DNS: two caches in front of every fetch</h3>
<p>
  <b>robots.txt.</b> Before fetching anything from a host, a polite crawler fetches
  <code>/robots.txt</code> and obeys it. The protocol is now a standard, RFC 9309 (2022),
  and its rules are the details interviewers like:
</p>
<ul>
  <li><b>Matching.</b> The most specific rule wins, meaning the match with the most octets; if an allow and a disallow are equivalent, allow is used; if nothing matches, the URL is allowed. User-agent matching is case-insensitive and falls back to the <code>*</code> group.</li>
  <li><b>Caching.</b> A crawler may cache the file but should not use a copy older than 24 hours, unless the file is unreachable. Google's crawler says it generally caches for up to 24 hours too. Mercator kept a fixed-size LRU cache of robots rules (2<sup>18</sup> hosts by default).</li>
  <li><b>Failure modes.</b> If the server says the file is unavailable (a 4xx), the crawler may access any resource. If it is unreachable (a 5xx or a timeout), the crawler must assume <em>complete disallow</em>, and may treat it as unavailable only after a long outage, for which the RFC's example is 30 days.</li>
  <li><b>Size and redirects.</b> Parse at least the first 500 kibibytes (Google ignores content past 500 KiB), and follow at least five redirects.</li>
  <li><b>Not in the standard.</b> <code>Crawl-delay</code> is not part of RFC 9309, and Google's crawler does not support it. Some other crawlers support it, so you may honour it where present, but do not rely on it; derive your own per-host gap, as above. Also: robots.txt is not access control. The RFC says so explicitly, and a disallowed URL can still be listed by search engines without a snippet.</li>
</ul>
<p>
  <b>DNS.</b> Resolving a host name can take seconds, because a lookup may need many
  round trips across the world. Mercator found DNS "a well-documented bottleneck";
  caching helped only partly because the standard resolver calls were synchronized,
  allowing one outstanding lookup per process. Replacing them with a multi-threaded
  resolver that forwards to a local name server cut the share of each thread's time
  spent on DNS from 70% to 14%. The modern version: an asynchronous resolver with
  its own cache that respects record TTLs, and sharding by host (below) so each node
  needs only its own hosts' records.
</p>

<h3>URL normalization and the URL-seen set</h3>
<p>
  The same page has many spellings. Two URLs must be compared <em>after</em> normalizing
  them, or you fetch the same page repeatedly. RFC 3986 section 6 defines the safe
  steps: lowercase the scheme and host; uppercase the hex digits of percent-encodings;
  decode percent-encoded unreserved characters; remove dot-segments; drop a default
  port; treat an empty path as <code>/</code>. Crawlers then add their own policy, such as
  discarding fragments (they are never sent to the server) and tracking parameters.
</p>
<table>
  <tr><th>Step</th><th>URL after the step</th><th>Rule</th></tr>
  <tr><td>As found</td><td><code>HTTP://Example.COM:80/a/./b/../c/%7euser?utm=1#top</code></td><td></td></tr>
  <tr><td>Lowercase scheme and host</td><td><code>http://example.com:80/a/./b/../c/%7euser?utm=1#top</code></td><td>RFC 3986, case normalization</td></tr>
  <tr><td>Drop the default port</td><td><code>http://example.com/a/./b/../c/%7euser?utm=1#top</code></td><td>RFC 3986, scheme-based normalization</td></tr>
  <tr><td>Remove dot-segments</td><td><code>http://example.com/a/c/%7euser?utm=1#top</code></td><td>RFC 3986, <code>/a/./b/../c</code> becomes <code>/a/c</code></td></tr>
  <tr><td>Decode unreserved characters</td><td><code>http://example.com/a/c/~user?utm=1#top</code></td><td>RFC 3986, <code>%7e</code> is <code>~</code></td></tr>
  <tr><td>Drop the fragment and the tracking parameter</td><td><code>http://example.com/a/c/~user</code></td><td>Crawler policy, not the RFC; only drop parameters you know do not change the content</td></tr>
</table>
<p>
  The <b>URL-seen test</b> asks, for each extracted link, "have I already queued or
  fetched this?". Mercator's duplicate URL eliminator stored 8-byte Rabin fingerprints
  of URLs in a hash table, keeping 5 of the 8 bytes in each entry (slightly over 5 GB for a billion URLs) and used sorted
  batch merges against a disk file when memory ran out, so that lookups became
  sequential reads instead of random seeks. IRLbot, the single-server crawler that
  reached 6.3 billion pages, showed that batch-merge checkers of that kind (merging a batch of new
  URLs into a sorted file, as Mercator's later design did) have total disk work that grows
  roughly quadratically with crawl size, and replaced them with <b>DRUM</b>, which batches
  keys and checks and updates them with bucket sort on disk.
</p>
<p>
  A <b>Bloom filter</b> is the compact in-memory alternative, at the price of
  one-sided errors. With <i>m</i> bits for <i>n</i> items and the best number of hash
  functions <i>k</i> = ln 2 × (<i>m</i>/<i>n</i>), the false-positive rate is about
  0.6185<sup><i>m</i>/<i>n</i></sup>. For 1%: <i>m</i>/<i>n</i> = ln(0.01) ÷ ln(0.6185) = (−4.605) ÷
  (−0.4805) ≈ <b>9.585 bits</b> an item, with <i>k</i> = ln 2 × 9.585 ≈ 6.6, so 7 hash
  functions. For the 5 billion URLs that is the 6.0 GB above, against about 25 GB for a near-exact fingerprint set. The gap is mostly the price of accepting a 1% error rate instead of an almost zero one.
  The error direction decides where it is safe: a false positive here means a new URL is
  wrongly thought seen and <em>never crawled</em>, losing about 1% of discoveries (their
  links usually recur from other pages, so the loss is smaller in practice). That is
  acceptable for a URL set and not for the content-seen test, where a false positive
  would discard a genuinely new page. Bloom filters also cannot delete, so a
  recrawl needs a separate "last fetched" store, not the filter.
</p>

<h3>Duplicate content: exact and near</h3>
<p>
  Different URLs often serve the same content (mirrors, <code>?sessionid=</code>, print
  versions). After download, the crawler fingerprints the body and consults a
  <b>content-seen</b> set; Mercator's loop has exactly this step, and drops a document
  whose content was seen under a different URL. Exact hashing misses <b>near</b>
  duplicates, such as the same article with a different advertisement or timestamp.
  Two techniques:
</p>
<ul>
  <li><b>Shingling.</b> Take every run of <i>k</i> consecutive tokens (<i>k</i> = 4 is typical), hash them, and compare the sets with the Jaccard coefficient |A∩B| ÷ |A∪B|; pages above a threshold such as 0.9 are near-duplicates. Keeping the minimum under 200 random permutations gives a 200-value sketch whose overlap estimates the Jaccard coefficient. Accurate, but a sketch per page is large; even Broder's compact variant (six Rabin fingerprints, two of which must match) takes 24 bytes a page, according to Manku et al.</li>
  <li><b>Simhash</b> (Charikar; Manku, Jain and Das Sarma, WWW 2007). Hash each weighted feature to 64 bits; keep a 64-element vector where each feature adds its weight where its hash bit is 1 and subtracts where it is 0; the sign of each element gives one bit of the fingerprint. Similar documents get fingerprints that differ in few bits, the opposite of a cryptographic hash. The paper reports that for a repository of 8 billion pages, 64-bit fingerprints with a Hamming distance of at most 3 are reasonable, at a precision and recall near 0.75 in its experiment. The remaining problem is searching for neighbours: probing every fingerprint at distance exactly 3 means C(64, 3) = 64 × 63 × 62 ÷ 6 = <b>41,664 probes</b> (the paper's count; including distances 0 to 2 it is 43,745).</li>
</ul>
<p>
  The paper's trick is a pigeonhole argument. Split the 64 bits into 6 blocks. Two
  fingerprints that differ in at most 3 bits differ inside at most 3 blocks, so at
  least 3 blocks match exactly. Build one sorted copy of the fingerprints for each
  of the C(6, 3) = 20 ways to choose 3 blocks, with those blocks as the leading
  bits. A probe in each table finds the few fingerprints that agree on the chosen
  blocks (the paper's example expects about 8 per probe), and a Hamming-distance
  check settles each. That is 20 probes instead of 41,664, for 20 copies of the data:
  for our 1 billion fingerprints, 8 GB × 20 = 160 GB before compression, which
  is the price of speed.
</p>

<h3>Spider traps and crawl budgets</h3>
<p>
  A <b>spider trap</b> is a part of a site that generates unlimited URLs: a calendar
  with a "next month" link forever, a session id in every URL, <code>/a/b/a/b/a/b/...</code>
  paths from a relative-link bug, filter combinations that multiply, or deliberate
  link farms. The IRLbot paper makes the case that breadth-first order is not neutral
  here: it reports that BFS eventually gets trapped in useless content, because
  spam sites' high branching factor lets their URLs overtake legitimate ones in
  the pending queue. Defences, from cheap to principled:
</p>
<ul>
  <li><b>Hard limits.</b> A maximum URL length, a maximum path depth and a maximum number of query parameters, chosen as policy (the values are yours to tune) and logged when hit. Detect repeating path segments.</li>
  <li><b>Normalize first.</b> Many traps are just un-normalized duplicates: drop known session parameters and sort the remaining ones.</li>
  <li><b>Per-host and per-domain budgets.</b> Cap the pages fetched from a host per day. IRLbot's STAR algorithm lets a domain's budget grow with the number of in-links it receives from other domains, because spammers can create unlimited pages and hosts but must pay for each additional domain that could link to them (in the run reported, budgets were conservative: the top 10,000 ranked domains got budgets linearly interpolated between 10 and 10,000 pages, and every other domain got 10); a companion mechanism, BEAST, keeps over-budget URLs in ever-lower-frequency queues so the crawler does not keep rescanning them. In the run described, the crawler handicapped quickly branching spam and over 30 million low-ranked domains.</li>
  <li><b>Content signals.</b> Near-duplicate pages (simhash) from one host at a high rate are a trap signature: lower that host's priority.</li>
  <li><b>Timeouts.</b> A slow server that trickles bytes can pin a thread: cap time and size per fetch. IRLbot also lists deliberate DNS and HTTP delays as an attack.</li>
</ul>
<p>
  Politeness also limits depth on huge hosts, which a budget formalizes. A site with
  10 million pages fetched at one page every 2 seconds needs 20,000,000 s, <b>231 days</b>.
  A crawler cannot "finish" such a site, which is why priority decides which of its
  pages come first.
</p>

<h3>Freshness: a budget, not a schedule</h3>
<p>
  The crawl never ends because pages change. You have a fixed fetch budget (600 a
  second) and need to divide it between <b>re-fetching</b> known pages and
  <b>discovering</b> new ones. Tier the pages by how often they change and how much
  they matter, and give each tier an interval. An illustrative split of a
  1-billion-page index:
</p>
<table>
  <tr><th>Tier</th><th>Pages</th><th>Interval</th><th>Fetches a second</th></tr>
  <tr><td>Hot (news front pages, high-traffic pages)</td><td>5 million</td><td>daily</td><td>5,000,000 ÷ 86,400 = 57.9</td></tr>
  <tr><td>Warm</td><td>95 million</td><td>weekly</td><td>95,000,000 ÷ 604,800 = 157.1</td></tr>
  <tr><td>Cold</td><td>900 million</td><td>every 56 days</td><td>900,000,000 ÷ 4,838,400 = 186.0</td></tr>
  <tr><td><b>Recrawl total</b></td><td>1 billion</td><td></td><td><b>401</b></td></tr>
  <tr><td>Left for new URLs</td><td></td><td></td><td>600 − 401 = <b>199</b>, or 17.2 million new pages a day</td></tr>
</table>
<ul>
  <li><b>Adapt the interval.</b> A simple policy: when a recrawl finds the page changed, halve its interval (to a floor); when unchanged, double it (to a ceiling). Pages migrate between tiers by themselves. This is a heuristic, not a result from the literature.</li>
  <li><b>Conditional requests cut bandwidth, not requests.</b> Send <code>If-None-Match</code> with the stored ETag or <code>If-Modified-Since</code>; if the representation is unchanged the server answers 304 Not Modified with no body (RFC 9110). If an assumed 80% of recrawls return a 1 KB 304, recrawl traffic falls from 401 × 100 KB = 40.1 MB/s to 401 × (0.2 × 100 + 0.8 × 1) KB = 8.3 MB/s. It depends on servers sending validators, and a request still costs a politeness slot.</li>
  <li><b>Use hints, do not trust them.</b> A sitemap can list up to 50,000 URLs (and 50 MB uncompressed) per file with <code>lastmod</code>; the protocol calls <code>changefreq</code> a hint, not a command, and says <code>priority</code> only ranks a site's own URLs against each other. Trust <code>lastmod</code> only for hosts where it has proved right.</li>
  <li><b>Priority signals.</b> Link in-degree, host quality, past change rate, and depth from a seed. Feed the number to the front-queue prioritizer.</li>
</ul>

<h3>Distributed crawling: shard by host</h3>
<p>
  The natural unit of ownership is the <b>host</b>, not the URL. Hash the host name to
  pick the owning node (consistent hashing, as in the
  <a href="/system-design/sysdes-sharding-partitioning">sharding chapter</a>). Everything
  that is per host then lives on one node: the back queue and its politeness timer, the
  robots rules, the DNS record, the host's budget. Mercator's distributed configuration
  does exactly this, partitioning the space of host names among its processes. If you sharded by
  URL instead, ten nodes might fetch from the same server at once and no node could
  enforce the gap.
</p>
<ul>
  <li><b>Forwarding.</b> A node that extracts a link for another node's host sends it there, in batches. At 6,000 extracted URLs a second across 20 nodes, if link targets were uniformly random 19 of 20 (95%) would leave the node. Real pages link mostly within their own host, which stays on the node, so that is an upper bound. Batch aggressively; even at 95%, 5,700 × about 100 bytes is 0.57 MB/s, well under 1 MB/s, so it is not a bottleneck.</li>
  <li><b>Resizing.</b> Adding a node moves roughly 1 ÷ 21 of the hosts, about 4.8% of the frontier, with consistent hashing. Their pending URLs, robots cache and politeness timers move with them, and the timers may simply reset.</li>
  <li><b>Failure and checkpoints.</b> Fetching is naturally idempotent. Mercator checkpoints its full state one to four times a day and, after a failure, loses only the work since the last checkpoint. Write the frontier to a durable log or store so a dead node's hosts can be reassigned.</li>
  <li><b>Hot hosts.</b> A giant site is one host and one node, but the polite rate is slow enough (about 0.5 pages a second at a 2-second gap) that one node can serve it; the cost is that it takes months, as computed above.</li>
  <li><b>Where DNS and robots go.</b> They shard with the host, so caches stay small and hit rates high, and a node never needs another node's robots rules.</li>
</ul>

<div class="say">
  <span class="ttl">Say it like this →</span> "It's a loop around a URL frontier,
  and the frontier is the interesting part. I'd use a Mercator-style frontier: front
  queues by priority, and one back queue per host, with a heap keyed by the next
  time that host may be touched, using a gap of ten times the last fetch time.
  robots.txt is cached per host for up to a day, and a 5xx on it means assume
  disallow. URLs are normalized per RFC 3986 and checked against a URL-seen set, a
  Bloom filter at 1% is about 6 GB for five billion URLs, with the false-positive
  direction explained. Page bodies go through an exact fingerprint and a 64-bit
  simhash with a distance of 3. I'd defend against traps with URL limits and
  per-domain budgets proportional to in-links. Freshness is a budget: at 600 pages a
  second, a daily, weekly and eight-weekly tier use 401 and leave 199 for
  discovery. The crawl is sharded by host so politeness, robots and DNS are local to one node."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "crawl", "index the web", "build a search engine", "scrape product pages", "keep a mirror up to date", "link checker", or any traversal of an external graph you do not control.</li>
  <li><b>The structure to reach for:</b> frontier with priority and per-host politeness, normalization and URL-seen, content-seen, budgets, host-sharded workers.</li>
  <li><b>The numbers an interviewer wants:</b> pages a second from a pages-a-month target, bandwidth from page size, the URL-seen memory cost, and how many hosts must be ready to keep fetchers busy.</li>
  <li><b>The pitfalls to name unprompted:</b> a FIFO frontier hammering one host, no URL normalization, spider traps and breadth-first order, treating robots.txt 5xx as "allow", sharding by URL instead of host, and a Bloom filter used for content-seen.</li>
  <li><b>The follow-up you will get:</b> "how do you handle JavaScript-heavy pages?" Rendering is far more expensive than fetching; render selectively (high-priority hosts, pages whose static HTML is nearly empty) in a separate pool with its own budget.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Rebuild the capacity estimate: 600 pages a second, bandwidth, URL-seen lookups a second, and the memory for 5 billion URLs exactly and in a Bloom filter.</li>
    <li>Describe the front and back queues and the heap, and trace the one-thread dry run to the 48% busy figure.</li>
    <li>State what robots.txt does on a 4xx, on a 5xx, how long it may be cached, and what it does not guarantee.</li>
    <li>Normalize an ugly URL step by step, naming which steps are RFC 3986 and which are crawler policy.</li>
    <li>Derive the Bloom filter size for a 1% false-positive rate, and say why it is safe for URLs and unsafe for content.</li>
    <li>Explain how splitting a 64-bit simhash into 6 blocks turns 41,664 probes into 20.</li>
    <li>Give three defences against spider traps, and explain why per-domain budgets use in-links.</li>
    <li>Split a fetch budget between recrawl and discovery, and say why you shard by host.</li>
  </ul>
</div>
<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://www.cs.cornell.edu/courses/cs685/2002fa/mercator.pdf" rel="noopener noreferrer">Najork and Heydon, High-performance web crawling (Compaq SRC Research Report 173, 2001), the account of the Mercator crawler</a> — the front and back queue frontier, the 10-times gap, URL fingerprints, the DNS bottleneck, host-partitioned distribution</li>
    <li><a href="https://archives.iw3c2.org/www2008/papers/fp865.html" rel="noopener noreferrer">Lee, Leonard, Wang and Loguinov, IRLbot: scaling to 6 billion pages and beyond (WWW 2008)</a> — DRUM, budgets by in-links (STAR and BEAST), breadth-first traps, the 41-day run</li>
    <li><a href="https://research.google.com/pubs/archive/33026.pdf" rel="noopener noreferrer">Manku, Jain and Das Sarma, Detecting near-duplicates for web crawling (WWW 2007)</a> — simhash, 64-bit fingerprints with distance 3, the table-permutation search</li>
    <li><a href="https://nlp.stanford.edu/IR-book/html/htmledition/the-url-frontier-1.html" rel="noopener noreferrer">Manning, Raghavan and Schütze, Introduction to Information Retrieval: the URL frontier</a> — front queues, back queues, the heap, politeness gaps</li>
    <li><a href="https://nlp.stanford.edu/IR-book/html/htmledition/near-duplicates-and-shingling-1.html" rel="noopener noreferrer">Introduction to Information Retrieval: near-duplicates and shingling</a> — shingles, Jaccard, min-hash sketches</li>
    <li><a href="https://www.rfc-editor.org/rfc/rfc9309.html" rel="noopener noreferrer">RFC 9309: Robots Exclusion Protocol</a> — matching, status-code handling, 24-hour caching, 500 KiB, not authorization</li>
    <li><a href="https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt" rel="noopener noreferrer">Google: how it interprets robots.txt</a> — 500 KiB limit, caching, no crawl-delay support, 5xx handling</li>
    <li><a href="https://www.rfc-editor.org/rfc/rfc3986.html" rel="noopener noreferrer">RFC 3986: URI generic syntax</a> — syntax-based and scheme-based normalization</li>
    <li><a href="https://www.rfc-editor.org/rfc/rfc9110.html" rel="noopener noreferrer">RFC 9110: HTTP semantics</a> — conditional requests and 304 Not Modified</li>
    <li><a href="https://www.sitemaps.org/protocol.html" rel="noopener noreferrer">Sitemaps protocol</a> — 50,000 URLs and 50 MB per file, lastmod, changefreq as a hint</li>
    <li><a href="https://www.eecs.harvard.edu/~michaelm/postscripts/im2005b.pdf" rel="noopener noreferrer">Broder and Mitzenmacher, Network applications of Bloom filters: a survey</a> — optimal hash count and the false-positive rate</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. Figures marked "assumed" or "illustrative" (600 pages a second, 100 KB a page, 5 billion URLs, 30 pages a second a node, the freshness tiers, an 80% unchanged rate) are this chapter's own inputs, and the page size and per-node rate are conservative next to the papers (IRLbot averaged about 22 KB a page and 1,789 pages a second on one server). The Mercator report, the IRLbot paper and the simhash paper were read from copies of the PDFs, and every figure attributed to Mercator comes from the 2001 report; the 10-times gap is stated in the Mercator paper and the Stanford text, and the 3-times back-queue figure is Mercator's reported production setting.</p>
</div>`,
};
