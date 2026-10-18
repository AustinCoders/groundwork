import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "cdn-no-cache-meaning",
      chapter: "sysdes-cdns",
      level: "intermediate",
      skill: "concept",
      section: "cache-control-the-directives-and-what-they-actually-do",
      kind: "single",
      prompt:
        "<p>A team wants the CDN and every other shared cache to avoid keeping copies of <code>/api/statements</code>, which returns account balances. A developer adds <code>Cache-Control: no-cache</code> and calls it done. What does that header actually tell caches to do?</p>",
      choices: [
        {
          id: "a",
          text: "Never keep a copy of the response anywhere, exactly the instruction no-store gives.",
          why: 'This is the most common misreading of the spec. The word "cache" in the name suggests it, but no-cache does not forbid storing. no-store is the directive that does.',
        },
        {
          id: "b",
          text: "Let browsers keep the response but keep it out of shared caches such as the CDN.",
          why: "That describes the private directive, which tells shared caches not to store the response. no-cache does not distinguish between private and shared caches.",
        },
        {
          id: "c",
          text: "Keep a copy if it wants, but validate with the origin before every reuse.",
          why: "no-cache allows storing and requires validation with the origin (typically a conditional request) before each reuse. To forbid storing you need no-store, and even that is not a substitute for authentication, because RFC 9111 says it is not a reliable privacy mechanism.",
        },
        {
          id: "d",
          text: "Mark the response as already stale, so the cache serves it once and then discards it.",
          why: "Nothing in no-cache says to serve a copy once and drop it. The cache may keep the copy and reuse it after a successful validation, which is why it is not a way to keep data out of caches.",
        },
      ],
      answer: "c",
    },
    {
      id: "cdn-stale-if-error-window",
      chapter: "sysdes-cdns",
      level: "intermediate",
      skill: "estimate",
      section: "cache-control-the-directives-and-what-they-actually-do",
      kind: "single",
      prompt:
        "<p>An edge cache stores <code>/api/products/42</code> at age 0 with <code>Cache-Control: max-age=300, stale-if-error=3600</code>, and the origin goes down immediately afterwards. The cache follows RFC 5861, counts the stale-if-error window from the moment the entry goes stale, and has no vendor TTL cap. Up to what age, in seconds since the entry was stored, can it keep answering with the stale copy before it starts passing the origin's 503 to clients?</p>",
      choices: [
        {
          id: "a",
          text: "300 seconds, because max-age is the limit on anything served from cache",
          why: "max-age only bounds how long the entry is fresh. stale-if-error exists precisely to extend what may be served after that point when the origin returns an error.",
        },
        {
          id: "b",
          text: "3,900 seconds",
          why: "The entry is fresh for 300 seconds, and the 3,600-second stale-if-error window is counted from the moment it goes stale, so the stale copy is usable until age 300 + 3,600. RFC 5861's own example works the same way: max-age=600 and stale-if-error=1200 means errors are written through once the age passes 1,800.",
        },
        {
          id: "c",
          text: "3,600 seconds, because the window is counted from when the entry was stored",
          why: "That counts the window from the fetch. RFC 5861 counts it from expiry, so the 300 seconds of freshness come first and the window is added on top.",
        },
        {
          id: "d",
          text: "No limit while the origin stays down, since the value only sets the retry interval",
          why: "stale-if-error is a bound, not a retry hint. Once the window has passed, the cache has to write the origin's error through to the client.",
        },
      ],
      answer: "b",
    },
    {
      id: "cdn-purge-all-load",
      chapter: "sysdes-cdns",
      level: "intermediate",
      skill: "estimate",
      section: "invalidation-purge-is-the-fallback-versioned-urls-are-the-de",
      kind: "single",
      prompt:
        "<p>A site's edge serves 40,000 requests per second for cacheable URLs at a steady 98% hit ratio. An engineer runs a global purge-everything, so every PoP is empty at once. As a worst case, assume every request misses and nothing is collapsed or shielded. By what factor does the read load reaching the origin rise, compared with before the purge?</p>",
      choices: [
        {
          id: "a",
          text: "About 2 times, because only the 2% of requests that missed before are affected",
          why: "The 2% is the old miss rate, not a multiplier. After the purge, all of the traffic misses rather than 2% of it, so the rise is far larger.",
        },
        {
          id: "b",
          text: "About 98 times, because the hit ratio of 98% is the load multiplier",
          why: "That mixes up the hit ratio with the load factor. Origin load scales with the miss rate: it goes from 2% of requests to 100%, and 100 ÷ 2 is not 98.",
        },
        {
          id: "c",
          text: "About 20 times, which is the figure quoted for a 95% hit ratio",
          why: "20 times is the multiplier for a 95% hit ratio, where 5% of requests missed. Here only 2% missed, so the jump from 2% to 100% is larger.",
        },
        {
          id: "d",
          text: "About 50 times",
          why: "Before the purge only 2% of 40,000, which is 800 requests per second, reached the origin. After it, all 40,000 do, so the multiplier is 40,000 ÷ 800 = 50. This is why a full purge is treated as an incident tool.",
        },
      ],
      answer: "d",
    },
    {
      id: "cdn-order-page-leak",
      chapter: "sysdes-cdns",
      level: "intermediate",
      skill: "diagnose",
      section: "cache-key-design-and-the-bug-that-ends-careers",
      kind: "single",
      prompt:
        "<p>After a release, customers report that <code>/account/orders</code> sometimes shows someone else's orders. A recent change made the origin send <code>Cache-Control: public, max-age=300</code> on that route to speed it up. The CDN's cache key is host + path + query string, and the session lives in a cookie. Which explanation fits these symptoms?</p>",
      choices: [
        {
          id: "a",
          text: "A user-specific page was cached under a key without the session cookie, and the freshness header let the CDN reuse it.",
          why: "The three ingredients line up: a response that varies by user, a key that does not include whatever identifies the user, and a header that allows shared caching. The fix is private, no-store on authenticated routes, plus a CDN that caches only when the origin opts in.",
        },
        {
          id: "b",
          text: "The CDN reuses one connection to the origin for many customers, so the origin's reply gets matched to the wrong customer.",
          why: "On a correctly working shared connection each request is answered with its own response, so replies are not mixed up between customers. Connection reuse does not explain a cached page being handed to the wrong user.",
        },
        {
          id: "c",
          text: "Anycast routing sent the second customer's packets to the first customer's PoP in the middle of one connection.",
          why: "A path change under anycast can land packets at a different PoP, but each request is still answered from the cache entry its own key selects. Routing does not hand one user another user's cached page.",
        },
        {
          id: "d",
          text: "<code>stale-while-revalidate</code> is serving an expired copy of the same user's page that was fetched hours earlier.",
          why: "Stale-while-revalidate makes data older than intended, but it still serves the copy belonging to that key. The symptom here is data belonging to a different user, which points at the key, not at staleness.",
        },
      ],
      answer: "a",
    },
    {
      id: "cdn-campaign-links",
      chapter: "sysdes-cdns",
      level: "intermediate",
      skill: "diagnose",
      section: "cache-key-design-and-the-bug-that-ends-careers",
      kind: "single",
      prompt:
        "<p>A campaign launches with links such as <code>/pricing?utm_source=news&amp;utm_campaign=oct&amp;fbclid=&lt;unique id per click&gt;</code>. The page is identical for every visitor. The CDN keys on host, path and the full query string, and the hit ratio on <code>/pricing</code> drops from 97% to 12% while origin load climbs. Which change fixes the cause?</p>",
      choices: [
        {
          id: "a",
          text: "Raise the TTL on <code>/pricing</code> from 60 seconds to one whole day so entries live longer.",
          why: "A longer TTL only helps a key that gets requested again. With a click ID in every URL, each key is requested about once, so the entries are never reused however long they live.",
        },
        {
          id: "b",
          text: "Turn on <code>stale-while-revalidate</code> so that each cold miss can be answered from a stale copy.",
          why: "Stale-while-revalidate needs an existing stale entry for that key. A never-seen key has nothing to serve stale, so every click is still a cold miss.",
        },
        {
          id: "c",
          text: "Strip tracking parameters from the cache key, or allow-list the ones that change the page.",
          why: "The unique click ID makes every URL a different key for the same content. Stripping utm_ and click-ID parameters (or keying only on parameters that matter) puts all visitors on one entry and restores the hit ratio.",
        },
        {
          id: "d",
          text: "Add the Cookie header to the key so that each visitor's own requests group together under it.",
          why: "Keying on the whole Cookie header multiplies variants further, to roughly one per visitor. The page is the same for everyone, so the goal is fewer keys, not more.",
        },
      ],
      answer: "c",
    },
    {
      id: "cdn-targeted-header",
      chapter: "sysdes-cdns",
      level: "intermediate",
      skill: "tradeoff",
      section: "cache-control-the-directives-and-what-they-actually-do",
      kind: "single",
      prompt:
        "<p>You want the HTML at <code>/news</code> held by the CDN for 10 minutes, served stale for up to 5 more minutes while it refreshes in the background, and you want browsers to check with the CDN on every view. The CDN follows RFC 9111 and RFC 5861 and supports the RFC 9213 <code>CDN-Cache-Control</code> header. Which headers achieve this?</p>",
      choices: [
        {
          id: "a",
          text: "<code>Cache-Control: public, max-age=0, s-maxage=600, stale-while-revalidate=300</code>",
          why: "It looks like the right lever, but RFC 9111 says s-maxage also carries the semantics of proxy-revalidate. A shared cache may then not serve the stale copy without validating it first, which defeats the stale-while-revalidate window.",
        },
        {
          id: "b",
          text: "<code>Cache-Control: max-age=0</code> plus <code>CDN-Cache-Control: max-age=600, stale-while-revalidate=300</code>",
          why: "A CDN that supports RFC 9213 uses the targeted header and ignores Cache-Control for itself, so the CDN holds the page for 600 seconds with a 300-second stale window. Browsers use max-age=0 and revalidate on each view.",
        },
        {
          id: "c",
          text: "<code>Cache-Control: private, max-age=600, stale-while-revalidate=300</code>",
          why: "private tells shared caches not to store the response at all, so the CDN would hold nothing. The browser would cache it for 10 minutes instead, which is the opposite of the goal.",
        },
        {
          id: "d",
          text: "<code>Cache-Control: no-store, s-maxage=600, stale-while-revalidate=300</code>",
          why: "no-store forbids storing, so the CDN would keep nothing, and it contradicts s-maxage in the same header. The stale window has nothing to apply to, because nothing is ever stored.",
        },
      ],
      answer: "b",
    },
    {
      id: "cdn-catalogue-freshness",
      chapter: "sysdes-cdns",
      level: "intermediate",
      skill: "tradeoff",
      section: "invalidation-purge-is-the-fallback-versioned-urls-are-the-de",
      kind: "single",
      prompt:
        "<p>A catalogue has 2 million product pages. Each page embeds its own product plus cards for related products, and a few hundred edits happen every hour. Pages must keep stable URLs, edits must show up within seconds, and the origin must stay off the hot read path. Most pages are requested far less than once every 5 seconds. The CDN supports purge by tag. Which design fits those criteria?</p>",
      choices: [
        {
          id: "a",
          text: "Give every page a TTL of 5 seconds so that nothing is ever served more than 5 seconds old.",
          why: "Freshness is met, but because each page is requested rarely, its 5-second copy has usually expired by the next request. Most requests then miss, so the origin is back on the hot path.",
        },
        {
          id: "b",
          text: "Run a purge-everything after each edit so that the cache can never hold an outdated page.",
          why: "A few hundred full purges an hour keep emptying every PoP, and each one sends a burst of misses to the origin. Full purges are an incident tool, not an edit pipeline.",
        },
        {
          id: "c",
          text: "Put a content hash in every page URL so that new content automatically gets a new address.",
          why: "Hashed URLs are the right default for build artefacts such as JS and CSS, where the HTML points at the new name. Product pages must keep stable addresses for links and search, so this does not fit.",
        },
        {
          id: "d",
          text: "Use long TTLs, tag responses with the entity IDs they render, and purge by tag on each edit.",
          why: "Tags let one product edit invalidate exactly the pages that mention it, including related-product cards. TTLs can then stay in minutes, keeping the hit ratio high, while edits still appear within seconds.",
        },
      ],
      answer: "d",
    },
    {
      id: "cdn-cold-object-path",
      chapter: "sysdes-cdns",
      level: "intermediate",
      skill: "sequence",
      section: "push-vs-pull-who-decides-what-lives-at-the-edge",
      kind: "order",
      prompt:
        "<p>A pull CDN with a shield (mid-tier) cache receives the first-ever request for an image, so nothing is cached anywhere. Put the steps in the order they happen.</p>",
      items: [
        { id: "route", text: "DNS or anycast routing sends the viewer to a nearby PoP" },
        { id: "edge-miss", text: "The PoP checks its own cache and misses" },
        { id: "shield-miss", text: "The PoP asks the shield tier, which also misses" },
        { id: "origin", text: "The shield makes the one fetch to the origin" },
        { id: "fill", text: "The response is stored in the shield and the PoP, then returned to the viewer" },
      ],
      why: "The viewer is steered to a nearby PoP first, and the PoP checks its own cache before anything else. On a miss it asks the shield instead of going straight to the origin, and only a miss there reaches the origin. The result is cached on the way back, so later requests in the same region hit at the PoP or the shield, and a cold object costs one origin fetch instead of one per PoP.",
    },
  ],
};
