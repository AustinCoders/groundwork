import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "cr-bloom-memory",
      chapter: "sysdes-walkthrough-crawler",
      level: "advanced",
      skill: "estimate",
      section: "url-normalization-and-the-url-seen-set",
      kind: "single",
      prompt:
        "<p>A crawler keeps its URL-seen set in a Bloom filter sized for 2 billion URLs and a false-positive rate of 0.1%, using the optimal number of hash functions. Use the chapter's rule that the false-positive rate is about 0.6185<sup><i>m</i>/<i>n</i></sup> for <i>m</i> bits and <i>n</i> items. About how much memory does the filter need? (1 GB = 10<sup>9</sup> bytes.)</p>",
      choices: [
        {
          id: "a",
          text: "About 0.25 GB",
          why: "This allows a single bit per URL, which would give a false-positive rate near 50% or worse. A Bloom filter needs several bits per item to reach a low error rate.",
        },
        {
          id: "b",
          text: "About 3.6 GB",
          why: "Solving 0.6185<sup>m/n</sup> = 0.001 gives m/n = ln(0.001) ÷ ln(0.6185), about 14.4 bits per URL. For 2 billion URLs that is about 28.8 gigabits, and dividing by 8 gives about 3.6 GB.",
        },
        {
          id: "c",
          text: "About 2.4 GB",
          why: "That is the size at a 1% false-positive rate, which needs about 9.585 bits per item. Cutting the rate to 0.1% needs more bits per item, about 14.4.",
        },
        {
          id: "d",
          text: "About 28.8 GB",
          why: "This counts the 28.8 gigabits as if they were gigabytes. Memory is sized in bytes, so divide the bit count by 8.",
        },
      ],
      answer: "b",
    },
    {
      id: "cr-hosts-ready",
      chapter: "sysdes-walkthrough-crawler",
      level: "advanced",
      skill: "estimate",
      section: "the-url-frontier-priority-in-front-politeness-behind",
      kind: "single",
      prompt:
        "<p>A crawler targets 400 pages a second. An average download takes <i>f</i> = 0.25 seconds. After each download the same host must wait 10 × <i>f</i> before it can be contacted again, counted from the moment the download finishes. About how many distinct hosts must be in rotation at all times (downloading or cooling down) to keep the fetch threads busy?</p>",
      choices: [
        {
          id: "a",
          text: "About 100 hosts",
          why: "That is 400 × 0.25, the number of threads that are downloading at any instant by Little's law. It counts only download time and ignores the gap during which a host cannot be fetched.",
        },
        {
          id: "b",
          text: "About 1,000 hosts",
          why: "This is 400 × 10 × 0.25, which counts the gap but leaves out the download itself. The gap starts when the download finishes, so a host is out of play for 11 × <i>f</i> in total.",
        },
        {
          id: "c",
          text: "About 1,100 hosts",
          why: "One host can be fetched once every <i>f</i> + 10<i>f</i> = 11<i>f</i> = 2.75 seconds. To sustain 400 fetches a second you need 400 × 2.75 = 1,100 hosts cycling at once.",
        },
        {
          id: "d",
          text: "About 4,400 hosts",
          why: "This is 400 × 11 with the download time dropped out of the formula. The time a host is unavailable is 11 × <i>f</i> seconds, so 400 × 11 only holds when <i>f</i> is one second.",
        },
      ],
      answer: "c",
    },
    {
      id: "cr-robots-server-error",
      chapter: "sysdes-walkthrough-crawler",
      level: "advanced",
      skill: "concept",
      section: "robots-txt-and-dns-two-caches-in-front-of-every-fetch",
      kind: "single",
      prompt:
        "<p>Your crawler has no cached copy of a host's <code>/robots.txt</code>. Its first request for it returns a 503 and keeps returning 503 for two days. Following RFC 9309, what should the crawler do about the rest of that host?</p>",
      choices: [
        {
          id: "a",
          text: "Treat the host as completely disallowed.",
          why: "A server error or timeout makes the file unreachable, so the crawler must assume complete disallow. Only after a long outage (the RFC's example is 30 days) may it treat the file as unavailable.",
        },
        {
          id: "b",
          text: "Crawl the host without restrictions, as if there were no rules.",
          why: "That is the rule for an unavailable file, signalled by a 4xx response, where the crawler may access any resource. A 5xx is a different case and is treated conservatively.",
        },
        {
          id: "c",
          text: "Retry three times, then crawl as if the file were absent.",
          why: "The RFC sets no retry count after which an unreachable file counts as absent. Waiting out a long period is the allowance, not a few quick attempts.",
        },
        {
          id: "d",
          text: "Crawl only the pages that the host's sitemap lists.",
          why: "A sitemap is a discovery hint, not permission. The RFC also says robots.txt rules are not access authorization, and a sitemap lists pages without granting crawl rights.",
        },
      ],
      answer: "a",
    },
    {
      id: "cr-shard-by-host",
      chapter: "sysdes-walkthrough-crawler",
      level: "advanced",
      skill: "tradeoff",
      section: "distributed-crawling-shard-by-host",
      kind: "single",
      prompt:
        "<p>You are splitting a crawl over 20 nodes. Each node must enforce the per-host politeness gap and keep its robots rules and DNS records local, without asking another node before each fetch. How should URLs be assigned to nodes?</p>",
      choices: [
        {
          id: "a",
          text: "Hash the full URL, so work spreads evenly across nodes.",
          why: "Hashing the URL does balance load, but URLs of one host then land on many nodes. Each node sees only part of the traffic to that host, so none can enforce the gap alone.",
        },
        {
          id: "b",
          text: "Rotate URLs across nodes in turn as they are discovered.",
          why: "Round-robin gives even load but scatters a host's URLs over every node. Politeness would need shared coordination on each fetch, which is what we want to avoid.",
        },
        {
          id: "c",
          text: "Hash the page's content fingerprint, so duplicate pages meet on one node.",
          why: "The content fingerprint exists only after the page has been downloaded, so it cannot decide where a not-yet-fetched URL is queued. It also says nothing about which host the URL belongs to.",
        },
        {
          id: "d",
          text: "Hash the host name, so one node owns each host.",
          why: "Everything per host then lives on one node: the back queue and timer, the robots rules, the DNS record and the budget. Mercator's distributed design partitions the space of host names among its processes in this way.",
        },
      ],
      answer: "d",
    },
    {
      id: "cr-content-seen-bloom",
      chapter: "sysdes-walkthrough-crawler",
      level: "advanced",
      skill: "diagnose",
      section: "url-normalization-and-the-url-seen-set",
      kind: "single",
      prompt:
        "<p>A team replaces the exact content-seen fingerprint set with a Bloom filter tuned for a 1% false-positive rate. Afterwards the content store holds about 1% fewer pages than the number of distinct pages fetched. The fetchers report no errors and robots rules have not changed. What explains the gap?</p>",
      choices: [
        {
          id: "a",
          text: "New pages were reported as already seen and discarded as duplicates.",
          why: "A false positive makes the filter say yes for an item it never stored, so a new page looks like a duplicate and is dropped. That is tolerable for URLs, whose links tend to recur, but not for page content.",
        },
        {
          id: "b",
          text: "The filter forgot some fingerprints, so it admitted pages it should have dropped.",
          why: "A Bloom filter has no false negatives, so it does not forget what it stored. Forgetting would also add duplicate pages to the store rather than reduce it.",
        },
        {
          id: "c",
          text: "The filter filled up and began rejecting every new fingerprint it was given.",
          why: "A filter sized for its load answers yes for about the target 1% of new items, not for all of them. Overfilling raises the false-positive rate gradually, and a gap of exactly 1% matches the design rate rather than a full filter.",
        },
        {
          id: "d",
          text: "The filter merged near-identical pages, so lightly edited copies counted as one.",
          why: "A Bloom filter tests exact membership of the hashed fingerprints and has no notion of similarity. Detecting near duplicates takes a technique such as simhash, which is a separate step.",
        },
      ],
      answer: "a",
    },
    {
      id: "cr-calendar-trap",
      chapter: "sysdes-walkthrough-crawler",
      level: "advanced",
      skill: "diagnose",
      section: "spider-traps-and-crawl-budgets",
      kind: "single",
      prompt:
        '<p>One small site has a calendar page with a "next month" link on every month, forever. Each month page has a distinct URL and different body text. The crawler keeps fetching months from that host and its frontier fills with them. Which defence limits the damage while still crawling the rest of the web at full speed?</p>',
      choices: [
        {
          id: "a",
          text: "Run more fetch threads, so the crawl moves through the calendar faster.",
          why: "More threads raise the rate at which the trap is consumed. The trap generates URLs without limit, so a faster crawler just reaches deeper into it sooner.",
        },
        {
          id: "b",
          text: "Check every extracted link against a Bloom filter in the URL-seen set.",
          why: "The URL-seen set drops only links already queued or fetched. Each month has a new URL, so every link passes the test and the trap keeps feeding the frontier.",
        },
        {
          id: "c",
          text: "Cap how many pages the crawler will fetch from any one host.",
          why: "A per-host budget bounds the trap no matter how many distinct URLs it generates, and it only limits that one host, so the rest of the crawl keeps its full speed. Depth and URL-length limits help only against traps whose URLs keep growing.",
        },
        {
          id: "d",
          text: "Add an exact content-seen check so the repeated months are discarded.",
          why: "The content-seen test drops a page whose body was already seen under another URL. These pages have different text each month, so none of them is a duplicate.",
        },
      ],
      answer: "c",
    },
    {
      id: "cr-loop-order",
      chapter: "sysdes-walkthrough-crawler",
      level: "advanced",
      skill: "sequence",
      section: "the-loop",
      kind: "order",
      prompt:
        "<p>The frontier of a host-sharded, Mercator-style crawler has just handed a node a URL. Each node keeps a URL-seen set only for the hosts it owns. Put the remaining stages in order, from the download to a new URL entering the frontier of its owning node.</p>",
      items: [
        { id: "fetch", text: "The fetcher downloads the page, using the DNS and robots caches" },
        { id: "content", text: "The content-seen test compares the page body against known fingerprints" },
        { id: "extract", text: "The link extractor pulls out links and normalizes them" },
        { id: "route", text: "Each link is sent to the node that owns its host" },
        { id: "seen", text: "That node's URL-seen check drops links it already knows" },
      ],
      why: "The page must be downloaded before it can be fingerprinted, and a page whose content was already seen is dropped before its links are used. Links are normalized before anything compares them, so that different spellings of one URL are equal. Each node holds the URL-seen set only for its own hosts, so a link goes to the node that owns its host first (as in Mercator, where the host splitter comes before the duplicate URL eliminator), and only the URLs that survive that node's check enter its frontier.",
    },
  ],
};
