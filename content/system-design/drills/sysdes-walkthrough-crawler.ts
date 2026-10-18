import type { DesignDrill } from "../../drill-types";

export const drill: DesignDrill = {
  chapter: "sysdes-walkthrough-crawler",
  level: "advanced",
  title: "Design a web crawler for a search index",
  prompt: `<p>"A search team wants a crawler that finds new pages on the public web and re-fetches the pages it already holds. Walk me from a list of seed URLs to stored pages, and show me where it could hurt the sites it visits or waste its own fetch budget."</p>
<p><b>In scope:</b> the crawler itself, from seed URLs to stored pages, running on as many machines as you need. <b>Out of scope:</b> ranking, building the search index, rendering JavaScript, and the storage engine behind the page store.</p>
<p>Assumptions (planning figures for this exercise, not facts about any real crawler):</p>
<ul>
  <li>The target is 100 million page fetches a day, spread evenly over 24 hours. Every request for a page counts toward it, including a conditional request that returns 304; <code>robots.txt</code> and DNS lookups do not.</li>
  <li>The index already holds 2 billion pages.</li>
  <li>Within the same fetch budget, the crawler must also find and fetch at least 10 million pages it has never seen, each day.</li>
  <li>Sites vary: most publish a <code>robots.txt</code>, some are slow, and some answer with errors.</li>
</ul>`,
  checklist: [
    {
      id: "check-fetch-budget",
      text: "Derives the fetch budget from the stated volume: 100 million ÷ 86,400 is about 1,160 a second. Reserves about 116 a second for 10 million new pages, leaving roughly 1,040 a second (about 90 million recrawls a day), which revisits 2 billion pages about once every 22 days on average.",
      section: "freshness-a-budget-not-a-schedule",
    },
    {
      id: "check-per-host-scheduling",
      text: "Schedules fetches per host instead of from one global FIFO: URLs wait in per-host queues (or an equivalent) ordered by when each host may next be contacted, with the wait set by a stated rule, for example ten times the host's last download time as Mercator did.",
      section: "the-url-frontier-priority-in-front-politeness-behind",
    },
    {
      id: "check-robots-handling",
      text: "Fetches and caches robots.txt per host and refreshes the copy about daily. Handles failure: most 4xx responses may be treated as no robots.txt, while an unreachable file (5xx or timeout) means assume disallow, or wait, rather than crawl.",
      section: "robots-txt-and-dns-two-caches-in-front-of-every-fetch",
    },
    {
      id: "check-normalize-before-seen",
      text: "Normalizes each extracted link (lowercase scheme and host, drop the default port, remove dot-segments) before the URL-seen test, so one page is not queued under several spellings.",
      section: "url-normalization-and-the-url-seen-set",
    },
    {
      id: "check-content-duplicates",
      text: "Explains how duplicate pages are found: an exact body fingerprint catches the same content under other URLs, and a similarity fingerprint such as simhash catches near copies that any small edit would hide from an exact hash.",
      section: "duplicate-content-exact-and-near",
    },
    {
      id: "check-trap-cap",
      text: "Bounds the damage from any one site that generates unlimited URLs with a cap on fetches per host or domain (which may scale with importance, such as in-links), and explains that the cap holds however many distinct URLs the site produces.",
      section: "spider-traps-and-crawl-budgets",
    },
    {
      id: "check-recrawl-policy",
      text: "Spends the recrawl budget unevenly instead of on one interval: tiers by change rate and importance, or per-page intervals that adapt to whether each recrawl found a change. Checks the resulting fetches a second against the recrawl budget.",
      section: "freshness-a-budget-not-a-schedule",
    },
    {
      id: "check-conditional-get",
      text: "Sends conditional requests on recrawl (If-None-Match with a stored ETag, or If-Modified-Since) so an unchanged page returns a 304 with no body, and counts the saving in bandwidth, and often server work, rather than in number of requests.",
      section: "freshness-a-budget-not-a-schedule",
    },
    {
      id: "check-shard-key",
      text: "Splits the crawl across nodes so one site's pacing is decided in one place, for example by hashing the host name (or domain or server IP) to a node, and names the per-host state that lives with it: queue and timer, robots rules, DNS record and budget.",
      section: "distributed-crawling-shard-by-host",
    },
  ],
  mistakes: [
    {
      id: "mistake-one-connection-only",
      text: "Treating one connection at a time per host as enough politeness. Mercator's frontier allowed one thread per host and still drew complaints, because a host can receive a stream of requests with no pause between them.",
      section: "the-url-frontier-priority-in-front-politeness-behind",
    },
    {
      id: "mistake-ready-hosts-from-ratio",
      text: "Sizing the number of ready hosts from a quoted ratio instead of from the gap rule and measured fetch times. With a gap of ten times the download, a host can be fetched only once every 11 download times, so too few ready hosts leave fetch threads idle.",
      section: "the-url-frontier-priority-in-front-politeness-behind",
    },
    {
      id: "mistake-robots-error-as-allow",
      text: "Treating a 5xx or timeout on robots.txt as permission to crawl straight away. RFC 9309 says to assume complete disallow, and Google's crawler pauses first; either way the host is not crawled at once, because its rules are unknown.",
      section: "robots-txt-and-dns-two-caches-in-front-of-every-fetch",
    },
    {
      id: "mistake-url-seen-stops-traps",
      text: "Relying on the URL-seen set to stop a spider trap. It drops only URLs already queued or fetched, and a trap mints a new URL for every page, so the frontier keeps filling until something bounds the site itself.",
      section: "spider-traps-and-crawl-budgets",
    },
  ],
};
