import type { Chapter } from "../types";

export const archApis: Chapter = {
  id: "arch-apis",
  num: "I6",
  title: "The four things that leave the building",
  short: "The four endpoints",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Every server function on the site, what it calls, and what happens when that fails.",
  body: `<h3>All of them</h3>
<div class="table-scroll"><table>
<thead><tr><th>Route</th><th>Calls</th><th>If it fails</th></tr></thead>
<tbody>
<tr><td><code>/api/tts</code></td><td>Microsoft Edge voices, through <code>msedge-tts</code></td><td>The narrator does not start; the chapter reads normally</td></tr>
<tr><td><code>/api/weather</code></td><td>Open-Meteo</td><td>The sidebar shows the clock without a temperature</td></tr>
<tr><td><code>/api/joke</code></td><td>JokeAPI</td><td>A hardcoded joke is returned with a 200</td></tr>
<tr><td><code>/api/client-error</code></td><td>Nothing &mdash; it is the sink</td><td>Errors go unrecorded, which is the current state anyway</td></tr>
</tbody>
</table></div>
<p>
  Every one of them is an enhancement to a page that works without it. That is the property worth
  keeping: no upstream service can take a chapter down.
</p>

<h3>The narrator, in detail</h3>
<p>
  It is the only endpoint doing real work. The reader picks a voice; the client posts a chunk of the
  chapter; the function returns an <b>mp3 as binary</b> with the per-word timings packed into a
  header rather than embedded in a JSON envelope. The timings are what let the page highlight the
  word being spoken.
</p>
<p>
  It used to return base64 inside JSON with <code>no-store</code>, which meant every request was a
  fresh synthesis, roughly a third larger on the wire, and impossible for the CDN to help with. It
  is now a cacheable binary response, so the same chunk of the same chapter in the same voice is
  synthesised once.
</p>

<h3>Three layers in front of them</h3>
<div class="table-scroll"><table>
<thead><tr><th>Layer</th><th>Where it runs</th><th>Limit</th><th>What it cannot do</th></tr></thead>
<tbody>
<tr><td>Vercel Firewall</td><td>The edge, before any function</td><td>100 requests a minute per IP on <code>/api/</code></td><td>Counters are per region, so a spread-out client sees a higher ceiling</td></tr>
<tr><td>In-process limiter</td><td>Inside the function</td><td>40 a minute for TTS, 20 for the rest</td><td>Serverless spreads traffic over instances, so each instance counts alone</td></tr>
<tr><td>Upstream caching</td><td>Between the function and the service</td><td>Weather 10 minutes, joke 5</td><td>Only helps for repeated inputs</td></tr>
</tbody>
</table></div>
<p class="sub">
  Weather coordinates are rounded to one decimal place before the upstream call, so everyone in a
  city shares one cached result instead of each browser generating a unique cache key.
</p>

<h3>The one real single point of failure</h3>
<div class="bx is-ref">
<span class="ttl">msedge-tts</span>
<p>
  The narrator speaks through an unofficial route into Microsoft's edge voices. It is free, it sounds
  considerably better than the browser's built-in speech synthesis, and there is no contract behind
  it — it can stop working without notice and there would be nothing to appeal to. That was a known
  trade when it went in, which is why the narrator is a button on a page that reads perfectly well
  without it, rather than a feature the reading experience depends on.
</p>
</div>`,
};
