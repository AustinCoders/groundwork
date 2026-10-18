import type { DesignDrill } from "../../drill-types";

export const drill: DesignDrill = {
  chapter: "sysdes-walkthrough-simple",
  level: "beginner",
  title: "Design a URL shortener",
  prompt: `<p>Thanks for coming in. Today I would like you to design a URL shortener: a service where a user submits a long web address, gets back a short link, and anyone who opens the short link lands on the original page. Walk me through it the way you would in a real design review, starting from what you would ask me.</p>
<p>In scope: creating a short link, redirecting visitors, counting clicks per link, and disabling a link. Out of scope: user sign-up and login, custom aliases, link expiry, and analytics dashboards. I have deliberately left some requirements open, so ask.</p>
<p>Planning assumptions for this exercise (they are figures to design against, not facts about any real service):</p>
<ul>
  <li>10 million new short links are created per day.</li>
  <li>Each link is opened 100 times for every link created.</li>
  <li>Peak traffic is 3 times the daily average. Use 86,400 seconds per day.</li>
  <li>Links are kept for 5 years with no expiry rule, and each stored link costs about 500 bytes including indexes.</li>
  <li>Short keys are made of letters and digits (62 characters), and visitors must not be able to list every link by counting upward through the keys.</li>
  <li>Every click should be counted. Counts may lag by a few seconds, and losing a few seconds of clicks in a crash is acceptable.</li>
  <li>An abusive link must stop redirecting everywhere within a couple of minutes of being disabled.</li>
</ul>`,
  checklist: [
    {
      id: "check-asks-open-questions-and-restates",
      text: "Asks about what the brief leaves open, such as the redirect latency and availability targets, whether one region or several must serve visitors, and whether submitting the same long URL twice returns the same key, then restates the requirements as functional and non-functional.",
      section: "minute-0-5-the-clarifying-questions-worth-asking",
    },
    {
      id: "check-derives-read-write-rates",
      text: "Derives the average rates, about 116 creates and 11,600 redirects per second, and the peaks, about 350 and 35,000, then uses the 100 to 1 gap to size the paths, either as separate services or as one service with a cache, and explains the choice.",
      section: "minute-5-10-back-of-envelope-line-by-line",
    },
    {
      id: "check-sizes-storage-and-chooses-store",
      text: "Computes five-year storage from the stated figures, 18.25 billion links at about 500 bytes each, roughly 9.1 TB before replication, and chooses a store for a point lookup by short key, saying how the data is spread across nodes and roughly how many nodes that implies.",
      section: "minute-5-10-back-of-envelope-line-by-line",
    },
    {
      id: "check-chooses-redirect-status-and-caching",
      text: "Chooses a redirect status code and Cache-Control policy that keep every click countable and a disabled link revocable within minutes, for example a 302 with no-store, or edge caching with a purge and clicks counted from edge logs, and states the revocation window.",
      section: "minute-10-16-the-api-surface-and-the-redirect-semantics",
    },
    {
      id: "check-picks-key-scheme-and-length",
      text: "Chooses a key scheme and length together: compares 18.25 billion links with the 6 and 7 character keyspaces (about 56.8 billion and 3.5 trillion), states how full the space becomes, and says how collisions (retry on conflict) or sequence order (a scramble) are handled.",
      section: "key-generation-three-strategies-and-the-collision-math",
    },
    {
      id: "check-keeps-counting-off-redirect-path",
      text: "Counts clicks without a synchronous write to the links database on each redirect, for example with in-memory or Redis counters or events sent to a stream, and says where the aggregated counts land.",
      section: "data-model-and-the-trap-in-the-click-counter",
    },
    {
      id: "check-puts-cache-in-front-of-store",
      text: "Puts a cache in front of the store (look up the cache, fall back to the store on a miss, then fill the cache), which is safe because a link's destination never changes, and works out the store's load from a stated hit rate.",
      section: "minute-16-30-the-architecture",
    },
    {
      id: "check-disable-reaches-every-cache",
      text: "Makes a disable take effect within the window: it is written to the primary, every cache layer (shared cache, in-process cache, CDN) is invalidated or kept on a TTL no longer than the window, so the old redirect is no longer served.",
      section: "minute-30-45-the-deep-dive-the-scaling-path-and-the-follow-u",
    },
    {
      id: "check-grows-by-named-triggers",
      text: "Starts with a design that fits the stated load and data, and names the metric that triggers each added component, such as cache misses saturating the primary or data outgrowing one node.",
      section: "minute-30-45-the-deep-dive-the-scaling-path-and-the-follow-u",
    },
  ],
  mistakes: [
    {
      id: "mistake-check-then-write-key",
      text: "Making a key unique by reading to see whether it is free and then writing it with an upsert or unconditional put. Two concurrent creates can both see it free and the later write replaces the earlier link, sending visitors to the wrong destination. A plain insert that fails on a duplicate key, then catching the failure and retrying, is safe.",
      section: "key-generation-three-strategies-and-the-collision-math",
    },
    {
      id: "mistake-scrambled-key-treated-as-unguessable",
      text: "Treating a scrambled sequential key as unguessable without checking how full the keyspace is. The scramble hides the order, but when a large share of all possible keys are live links, random guesses hit real links often.",
      section: "key-generation-three-strategies-and-the-collision-math",
    },
    {
      id: "mistake-synchronous-write-per-click",
      text: "Counting clicks by updating a counter in a single-primary relational store on every redirect. Every read becomes a write, so write load grows to the redirect rate, and a popular link concentrates those updates on a single row.",
      section: "data-model-and-the-trap-in-the-click-counter",
    },
    {
      id: "mistake-bare-301-on-live-link",
      text: "Sending a 301 on a live link with no Cache-Control header. HTTP defines 301 as heuristically cacheable, so a browser or shared cache may keep the response for a long time, repeat clicks never reach the service, and later changes to the link, such as a disable, are not seen by those clients.",
      section: "minute-10-16-the-api-surface-and-the-redirect-semantics",
    },
  ],
};
