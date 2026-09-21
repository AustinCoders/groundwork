import type { Chapter } from "../types";

export const reactFeatureFlags: Chapter = {
  id: "react-feature-flags",
  num: "A23",
  title: "Feature flags",
  short: "Feature flags",
  levels: ["advanced"],
  practice: ["ex-react-rollout-bucket"],
  ready: true,
  subtitle: "Deploying code and releasing it are different decisions, and a flag is what separates them.",
  body: `<h3>What a flag is for</h3>
<pre><code>if (flags.newCheckout) return &lt;NewCheckout /&gt;;
return &lt;OldCheckout /&gt;;</code></pre>
<p>
  The code for the new checkout is merged, built and deployed &mdash; but it is
  <em>off</em>. Turning it on is a configuration change, not a deploy, and turning
  it off again takes seconds instead of a rollback. That separation is the whole
  value: engineers merge to the main branch daily without waiting for a feature to
  be finished, and product decides when users see it.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Kind</th><th>Lifetime</th><th>Example</th></tr></thead>
<tbody>
<tr><td><b>Release flag</b></td><td>days to weeks, then deleted</td><td>the new checkout, rolled out to 10%, then 100%</td></tr>
<tr><td><b>Kill switch</b></td><td>permanent</td><td>turn off the recommendations service when it is down</td></tr>
<tr><td><b>Experiment</b></td><td>until the result is in</td><td>two pricing layouts, measured</td></tr>
<tr><td><b>Entitlement</b></td><td>permanent</td><td>the export feature, for the paid plan only</td></tr>
</tbody>
</table></div>
<p>
  The kinds behave differently, and confusing them is the source of most flag
  pain. A release flag that lives for a year is a permanent fork in the code. A
  kill switch that gets removed as "clean-up" removes your emergency exit.
</p>

<h3>Evaluation needs context</h3>
<pre><code>const enabled = await client.getBooleanValue("new-checkout", false, {
  targetingKey: user.id,
  plan: user.plan,
  country: user.country,
});</code></pre>
<p>
  A flag is not a boolean; it is a <b>function of who is asking</b>. The
  <em>evaluation context</em> &mdash; user id, plan, country, app version &mdash;
  feeds rules such as "on for staff", "on for Germany", or "on for 10% of users".
  The last argument, <code>false</code>, is the <b>default</b> returned if the
  flag service is unreachable or the flag is missing. Make it the <em>old</em>
  behaviour, always; a default that turns the new feature on means an outage in
  your flag provider ships an unfinished feature to everyone.
</p>

<div class="bx is-prim">
  <span class="ttl">Percentage rollouts must be sticky</span>
  <pre><code>function bucket(flagKey, userId) {
  let h = 2166136261;                                    <span class="c">// FNV-1a hash</span>
  const text = flagKey + ":" + userId;
  for (let i = 0; i &lt; text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h &gt;&gt;&gt; 0) % 100;                                  <span class="c">// 0 to 99, the same every time</span>
}

const enabled = bucket("new-checkout", user.id) &lt; rolloutPercent;</code></pre>
  <p>
    Rolling out to 10% by calling <code>Math.random()</code> would put the same
    user in and out of the feature on every page load. Hashing the flag key and
    user id gives each user a fixed position from 0 to 99, so a user is either in
    the ten or not, and raising the rollout to 25% only <em>adds</em> people.
    Including the flag key in the hash means each flag picks a different ten
    percent, instead of the same unlucky users testing everything.
  </p>
</div>

<h3>Where the flag is evaluated</h3>
<pre><code><span class="c">// Flags SDK (Vercel), server-side</span>
import { flag } from "flags/next";

export const newCheckout = flag({
  key: "new-checkout",
  decide() { return false; },
});

export default async function Page() {
  const enabled = await newCheckout();
  return enabled ? &lt;NewCheckout /&gt; : &lt;OldCheckout /&gt;;
}</code></pre>
<p>
  Evaluate on the <b>server</b> where you can. A client-side flag has to be
  fetched after the page loads, so users first see the old UI and then watch it
  change &mdash; a layout shift, and a flicker that ruins any experiment measuring
  the first impression. The Flags SDK evaluates on the server only for this
  reason, and offers a <em>precompute</em> pattern so flagged pages can still be
  statically generated instead of falling back to per-request rendering.
</p>
<p>
  Caching is the catch. A page that varies by flag is a page that varies by user,
  and a CDN happily serves one user's variant to everyone unless the variant is
  part of the cache key. Flags and caching have to be designed together.
</p>

<h3>OpenFeature: a standard, not a vendor</h3>
<pre><code>import { OpenFeature, OpenFeatureProvider, useBooleanFlagValue } from "@openfeature/react-sdk";

OpenFeature.setProvider(myProvider);          <span class="c">// LaunchDarkly, Unleash, Flagsmith, in-memory…</span>

&lt;OpenFeatureProvider&gt;&lt;App /&gt;&lt;/OpenFeatureProvider&gt;

function Checkout() {
  const enabled = useBooleanFlagValue("new-checkout", false);
  return enabled ? &lt;NewCheckout /&gt; : &lt;OldCheckout /&gt;;
}</code></pre>
<p>
  OpenFeature is a vendor-neutral API for evaluating flags. Your components call
  <code>useBooleanFlagValue</code>; a <b>provider</b> plugs in whichever service
  you use, so changing vendors means changing one line, not every call site. The
  hooks re-render when the evaluation context or the flag configuration changes,
  and can suspend until the provider is ready. The Flags SDK has an OpenFeature
  adapter, so the two combine: the framework integration and precompute from one,
  provider freedom from the other.
</p>

<h3>The costs</h3>
<ul>
  <li>
    <b>Flag debt.</b> Every flag doubles the paths through the code and the states
    a bug can hide in. Give each release flag an owner and a removal date when you
    create it, and treat "delete the flag" as part of finishing the feature.
  </li>
  <li>
    <b>Combinatorial testing.</b> Ten independent flags is a thousand
    combinations. Test the default state and the flag you are changing, and keep
    long-lived flags few.
  </li>
  <li>
    <b>Client-visible means public.</b> A flag sent to the browser can be read in
    the network tab, including the name of a feature you have not announced. Put
    nothing sensitive in flag names or payloads.
  </li>
  <li>
    <b>A flag is not authorisation.</b> Hiding the export button for free users
    is UX; the export endpoint must still check the plan.
    <a href="/react/react-auth">The same rule as route guards.</a>
  </li>
  <li>
    <b>Experiments need more than a flag.</b> You also need consistent assignment,
    logging that a user actually <em>saw</em> the variant, and enough traffic to
    conclude anything. A flag on its own is only the switch.
  </li>
</ul>

<h3>A rollout, step by step</h3>
<ol>
  <li>Merge the feature behind a flag that is off. Deploy freely.</li>
  <li>Turn it on for the team, then a small percentage of real users.</li>
  <li>Watch error rate and the relevant business metric between each step; increase to 25%, 50%, 100%.</li>
  <li>If a metric moves the wrong way, turn the flag off. No deploy, no rollback.</li>
  <li>When it has been at 100% for a while, <b>delete the flag and the old code</b>.</li>
</ol>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "A flag separates deploy from release: code ships dark and is turned on by
    configuration, gradually and reversibly, using a sticky hash of the user id so
    people stay in or out; I evaluate it on the server to avoid flicker, default to
    the old behaviour if the service is down, never use a flag as authorisation,
    and delete each release flag once it is at a hundred percent."
  </p>
</div>`,
};
