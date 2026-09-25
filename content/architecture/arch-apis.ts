import type { Chapter } from "../types";

export const archApis: Chapter = {
  id: "arch-apis",
  num: "I11",
  title: "Every endpoint, and how each one fails",
  short: "The endpoints",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle:
    "Four route handlers run per request, and three families of JSON routes were run once, at build time. This chapter covers what each takes, what it caches and what the reader sees when it breaks.",
  body: `<h3>The whole list</h3>
<p>
  The site has 27 <code>route.ts</code> files. Four live under <code>app/api/</code> and run as
  functions, because each one reads something that only exists per request: a header, a query
  string or a body. The other 23 export <code>dynamic = "force-static"</code>. The build calls them
  and writes their responses to disk, so in production they behave like any other file.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Route</th><th>Kind</th><th>Called by</th><th>If it fails</th></tr></thead>
<tbody>
<tr><td><code>/api/tts</code></td><td>Function</td><td>The Listen button</td><td>The narrator does not start; the chapter reads normally</td></tr>
<tr><td><code>/api/weather</code></td><td>Function</td><td>The sidebar clock</td><td>The clock shows no temperature</td></tr>
<tr><td><code>/api/joke</code></td><td>Function</td><td>The card on <code>/progress</code></td><td>A hardcoded joke, or a skeleton line</td></tr>
<tr><td><code>/api/client-error</code></td><td>Function</td><td><code>ErrorReporter</code></td><td>The error is not logged</td></tr>
<tr><td><code>/problems/{id}/cases</code></td><td>Static, 538 files</td><td>The playground</td><td>Only JavaScript is graded</td></tr>
<tr><td><code>/mock/bank/{stage}</code></td><td>Static, 12 files</td><td>The mock lobby</td><td>The loop cannot start, and the lobby says why</td></tr>
<tr><td><code>{topic}/search-index.json</code></td><td>Static, 21 files</td><td>The chapter search box</td><td>Search matches titles and subtitles only</td></tr>
</tbody>
</table></div>
<p>
  None of them is required to read a page. That is the property this chapter checks for each
  endpoint in turn.
</p>

<figure>
<svg viewBox="0 0 900 380" class="dg" role="img" aria-label="Four rows. The Listen button calls /api/tts, limited to 40 a minute, which calls Microsoft's Edge voices through msedge-tts. The sidebar clock calls /api/weather, limited to 20 a minute, which calls Open-Meteo. The progress page calls /api/joke, limited to 20 a minute, which calls JokeAPI. ErrorReporter posts to /api/client-error, limited to 20 a minute, which writes one line to the function log.">
<g class="rough">
<rect x="20" y="20" width="200" height="66" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="20" y="110" width="200" height="66" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="20" y="200" width="200" height="66" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="20" y="290" width="200" height="66" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="280" y="20" width="250" height="66" rx="10" style="fill: var(--dg-box-red); stroke: var(--red); stroke-width: 2" />
<rect x="280" y="110" width="250" height="66" rx="10" style="fill: var(--dg-box-red); stroke: var(--red); stroke-width: 2" />
<rect x="280" y="200" width="250" height="66" rx="10" style="fill: var(--dg-box-red); stroke: var(--red); stroke-width: 2" />
<rect x="280" y="290" width="250" height="66" rx="10" style="fill: var(--dg-box-red); stroke: var(--red); stroke-width: 2" />
<rect x="590" y="20" width="290" height="66" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="590" y="110" width="290" height="66" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="590" y="200" width="290" height="66" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="590" y="290" width="290" height="66" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<path class="ln" d="M220 53 H274" marker-end="url(#arrow)" />
<path class="ln" d="M220 143 H274" marker-end="url(#arrow)" />
<path class="ln" d="M220 233 H274" marker-end="url(#arrow)" />
<path class="ln" d="M220 323 H274" marker-end="url(#arrow)" />
<path class="ln" d="M530 53 H584" marker-end="url(#arrow)" />
<path class="ln" d="M530 143 H584" marker-end="url(#arrow)" />
<path class="ln" d="M530 233 H584" marker-end="url(#arrow)" />
<path class="ln" d="M530 323 H584" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="120" y="48" text-anchor="middle">Listen button</text>
<text class="sm" x="120" y="70" text-anchor="middle">narration.ts</text>
<text class="lbl" x="120" y="138" text-anchor="middle">Sidebar clock</text>
<text class="sm" x="120" y="160" text-anchor="middle">ClockWeather</text>
<text class="lbl" x="120" y="228" text-anchor="middle">/progress</text>
<text class="sm" x="120" y="250" text-anchor="middle">JokeCard</text>
<text class="lbl" x="120" y="318" text-anchor="middle">Uncaught error</text>
<text class="sm" x="120" y="340" text-anchor="middle">ErrorReporter</text>
<text class="lbl rd" x="405" y="48" text-anchor="middle">/api/tts &middot; 40/min</text>
<text class="sm" x="405" y="70" text-anchor="middle">GET, kept a year at the CDN</text>
<text class="lbl rd" x="405" y="138" text-anchor="middle">/api/weather &middot; 20/min</text>
<text class="sm" x="405" y="160" text-anchor="middle">rounded to 0.1 degree</text>
<text class="lbl rd" x="405" y="228" text-anchor="middle">/api/joke &middot; 20/min</text>
<text class="sm" x="405" y="250" text-anchor="middle">falls back to a fixed joke</text>
<text class="lbl rd" x="405" y="318" text-anchor="middle">/api/client-error &middot; 20/min</text>
<text class="sm" x="405" y="340" text-anchor="middle">4,000-byte body cap</text>
<text class="lbl" x="735" y="48" text-anchor="middle">Microsoft Edge voices</text>
<text class="sm" x="735" y="70" text-anchor="middle">msedge-tts over a WebSocket</text>
<text class="lbl" x="735" y="138" text-anchor="middle">Open-Meteo</text>
<text class="sm" x="735" y="160" text-anchor="middle">fetch data cache, 10 minutes</text>
<text class="lbl" x="735" y="228" text-anchor="middle">JokeAPI</text>
<text class="sm" x="735" y="250" text-anchor="middle">fetch data cache, 5 minutes</text>
<text class="lbl" x="735" y="318" text-anchor="middle">Function log</text>
<text class="sm" x="735" y="340" text-anchor="middle">one JSON line per error</text>
</svg>
<figcaption>
  The four functions, what calls each one, and what each one calls in turn. Every limit is per IP,
  per minute, and per function instance.
</figcaption>
</figure>

<h3>What the four share</h3>
<p>
  Each one sets <code>runtime = "nodejs"</code> and starts by calling
  <code>overRateLimit(req, name, max)</code> from <code>lib/rateLimit.ts</code>. The limiter is a
  <code>Map</code> in module scope, keyed by the route name and the first address in
  <code>x-forwarded-for</code>. It uses a fixed 60-second window, and when it tracks more than 5,000
  keys it sweeps out the expired ones. It is simple and it has the obvious weakness: each
  serverless instance counts on its own, so the real ceiling is the limit multiplied by however many
  instances are warm. The Vercel Firewall rule in front of <code>/api/</code> is the actual
  defence. The in-process limit is a second layer that fails differently.
  <code>robots.ts</code> also disallows <code>/api/</code>, so crawlers stay out.
</p>

<h3>/api/tts</h3>
<p>
  This is the only endpoint doing real work. <b>Inputs</b>: <code>text</code>, trimmed and at most
  2,000 characters. <code>voice</code>, which must be one of the 11 values in
  <code>lib/edge-voices.ts</code>. <code>rate</code>, clamped to 0.5 to 2 with a default of 1. And
  <code>pitch</code>, which must match <code>+NN%</code>, <code>-NN%</code> or <code>0%</code>. The
  text is escaped for SSML, then <code>msedge-tts</code> opens a WebSocket to Microsoft's
  read-aloud service and asks for 24 kHz, 48 kbit/s mono MP3 with word-boundary events.
</p>
<p>
  <b>Output</b>: the MP3 as the response body, with the word timings packed into one header.
  <code>X-Word-Timings</code> is base64 of a JSON array of <code>[offsetMs, durationMs, word]</code>
  tuples, converted from the service's 100-nanosecond ticks. <code>narration.ts</code> turns the body
  into an object URL, decodes the header, and uses the timings to highlight the word being spoken
  with the CSS Custom Highlight API where the browser has it.
</p>
<p>
  <b>Caching</b>: <code>public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400</code>.
  The browser keeps a clip for an hour, and the CDN keeps it for a year, keyed by the full URL. The
  client splits a chapter into chunks of at most 700 characters, and a chunk's text only changes
  when the chapter does. So the same chunk in the same voice, rate and pitch is synthesised once
  per region, and every later listener is served a file. <code>maxDuration</code> is 20 seconds.
</p>
<p>
  <b>Failures</b>: 400 for missing text or an unknown voice, 413 for text over the limit, 429 from
  the limiter, and 502 when synthesis throws. There is also a <code>POST</code> handler that
  returns base64 audio inside JSON with <code>no-store</code>. It predates the binary format and
  nothing in the client calls it any more.
</p>
<div class="bx is-ref">
<span class="ttl">The one dependency with no contract</span>
<p>
  <code>msedge-tts</code> reaches a Microsoft service meant for the Edge browser's read-aloud
  feature. It is free and sounds much better than <code>speechSynthesis</code>, but nobody has
  promised it will keep working. That is why the narrator is a button on a page that reads fine
  without it. The narration e2e test stubs <code>/api/tts</code> with a fixture, so CI does not depend on it either.
</p>
</div>

<h3>/api/weather</h3>
<p>
  <b>Inputs</b>: <code>lat</code> and <code>lon</code>, which must be finite numbers within ±90 and
  ±180, or the answer is a 400. Both are rounded to one decimal place before the upstream call. That
  is about 11 km of latitude, so everyone in a city shares one upstream URL and the location sent to
  Open-Meteo is coarse. The <code>fetch</code> has <code>next: { revalidate: 600 }</code>, so Next's
  data cache holds each grid square's reading for ten minutes. <b>Output</b>:
  <code>{ temp, label, icon }</code>, with 28 WMO weather codes mapped to a label and an emoji, and
  <code>Cache-Control: public, max-age=600</code>. Without <code>s-maxage</code>, that header is an
  instruction to the browser, not the CDN.
</p>
<p>
  <b>Failures</b>: any upstream problem becomes a 502, and the clock shows its "no weather" state.
  The call only happens after you tap the clock and the browser's geolocation prompt succeeds. The
  site's <code>Permissions-Policy</code> allows geolocation for this origin only. A good reading is
  kept in <code>jsnotes:weather</code> for 30 minutes, so the endpoint is not called on every page.
</p>

<h3>/api/joke</h3>
<p>
  It takes no input and calls JokeAPI's <code>Programming</code> category with
  <code>safe-mode</code>, with a five-minute <code>revalidate</code> and a matching
  <code>max-age</code>. It is the only endpoint built never to fail visibly: a non-OK upstream, an
  error flag or a network error all return a hardcoded dark-mode joke with a 200. The fallback
  carries no cache header, so the next request tries JokeAPI again. The one case that leaks through
  is the limiter. A 429 body has no <code>text</code> field, so <code>JokeCard</code> leaves its
  skeleton line in place.
</p>

<h3>/api/client-error</h3>
<p>
  <code>POST</code> only. The body is refused with a 413 if the declared
  <code>content-length</code> or the actual text is over 4,000 bytes. Malformed JSON gets a 204,
  since there is nothing useful to say back. The message, stack and URL are each clipped to 500
  characters and the user agent to 200. The result is written as one JSON line with
  <code>console.error</code>, which puts it in Vercel's function log, and the response is 204.
</p>
<p>
  <code>ErrorReporter</code> in the root layout listens for <code>error</code> and
  <code>unhandledrejection</code>. It sends at most five reports per page load, with
  <code>keepalive</code> so they survive navigation. It only does this when
  <code>NEXT_PUBLIC_SENTRY_DSN</code> is empty. When a DSN is set, <code>instrumentation.ts</code>
  and <code>instrumentation-client.ts</code> start Sentry instead, and <code>reportError()</code> in
  <code>lib/errorTracking.ts</code> sends to Sentry first. So this endpoint is the floor, not the
  plan. The function log has no grouping and no alerting, and entries expire.
</p>

<h3>The static JSON routes</h3>
<p>
  <b><code>/problems/[slug]/cases</code></b> returns the recording made by
  <code>recordPolyglot</code> at build time: a signature and recorded cases, or
  <code>{ ok: false, reason }</code>. Most files are a 97-byte refusal. The largest is about 1 MB.
  <code>dynamicParams = false</code>, so an unknown slug is a 404 without any code running. The
  client in <code>PracticeWorkspace</code> keeps one promise per exercise in a <code>Map</code>. It
  turns a non-OK response into "Could not load it." and a network error into "Could not load it —
  are you offline?". Either way the reader can still run and grade JavaScript.
</p>
<p>
  <b><code>/mock/bank/[stage]</code></b> serves one question bank for each of the 12 interview
  stages: 792 items and 474,513 bytes in total. They range from 5 KB for the résumé round to 91 KB
  for coding. The page itself only gets <code>mockCatalog()</code> as a prop, meaning stage titles,
  rules and counts, so the banks stay out of the HTML. <code>fetchStage()</code> caches a promise
  per stage. On failure it removes the promise from the cache, so a retry really does retry, and it
  throws a message with the HTTP status for the lobby to show.
</p>
<p>
  <b>The search indexes</b> take no input. The <a href="/architecture/arch-search">search chapter</a>
  covers them.
</p>

<div class="bx is-prim">
<span class="ttl">The test for adding an endpoint</span>
<p>
  If the response depends only on the repository, it belongs in a <code>force-static</code> route
  and gets built once. That is how the test cases and question banks were done. A function is only
  justified when the answer depends on the request or on something outside the repository. Even
  then, the page that calls it has to work when it returns a 502.
</p>
</div>`,
};
