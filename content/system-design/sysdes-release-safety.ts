import type { Chapter } from "../types";

export const sysdesReleaseSafety: Chapter = {
  id: "sysdes-release-safety",
  num: "A10",
  title: "Release safety and incident response",
  short: "Release safety",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "Most outages follow a change. How to ship in small steps, watch the right signals, back out fast, and learn without blame.",
  body: `<h3>Most outages are a change someone made</h3>
<p>
  Google's SRE book states it plainly: roughly 70% of outages are due to changes in a live system. Hardware fails
  and traffic spikes, but the most common cause of a bad day is a deploy, a configuration push, a schema migration
  or a flag flip. That makes <b>safe change</b> a reliability feature in its own right, and it is the answer to
  the question after "how do you keep it up?", which is "and how do you change it without taking it down?"
</p>
<p>
  The unit to think about is <b>blast radius</b>: how many users a bad change touches before you notice, and how
  fast you can undo it. Every technique in this chapter either shrinks the first number or speeds up the second.
  Note what counts as a change: a new binary is only one kind. A config file, a certificate, a database migration,
  a dependency upgrade and a feature flag all change production behaviour, and a config push often reaches every
  server at once, so it deserves the same staged rollout as code.
</p>

<h3>Deploy is not release</h3>
<p>
  <b>Deploying</b> puts new code on servers. <b>Releasing</b> makes users see it. Keeping them separate is the most
  useful trick in the chapter. Ship the code dark behind a <b>feature flag</b>, turn it on for staff, then one
  percent, then everyone, and turn it off in seconds if it misbehaves. Fowler's catalogue of flags names four
  jobs worth distinguishing: <em>release flags</em> hide unfinished work, <em>experiment flags</em> split users for
  an A/B test, <em>ops flags</em> are kill switches an operator flips during an incident, and <em>permission
  flags</em> expose features to some users.
</p>
<div class="warn">
  <span class="ttl">⚠ Flags are code paths, and old ones rot</span>
  Flags multiply the combinations you could test, and a forgotten one is a time bomb that someone flips next
  year. Fowler suggests testing three settings: what production runs today, what you plan to release, and the
  fallback with every new flag off. Give each release flag an owner and a removal date, and decide what the default is
  when the flag service itself is down. An ops flag should default to the safe behaviour.
</div>

<h3>Rollout strategies compared</h3>
<table>
  <tr><th>Strategy</th><th>How it works</th><th>Blast radius</th><th>Rollback</th><th>Extra capacity</th></tr>
  <tr><td>All at once</td><td>Replace every instance together</td><td>100% of users</td><td>Redeploy the old version, minutes</td><td>None</td></tr>
  <tr><td>Rolling</td><td>Replace instances in batches (Kubernetes defaults to surging and losing up to 25% at a time)</td><td>Grows as batches finish, unless health checks stop it</td><td>Roll the batches back, minutes</td><td>A little headroom</td></tr>
  <tr><td>Blue/green</td><td>Run the new version beside the old and switch traffic over</td><td>100% at the switch, unless you shift gradually</td><td>Switch back: seconds</td><td>Two full environments</td></tr>
  <tr><td>Canary</td><td>Send a small share of real traffic to the new version and compare it with the old</td><td>The canary share, such as 1% to 5%</td><td>Route the share back: seconds</td><td>Small</td></tr>
  <tr><td>Shadow (mirrored)</td><td>Copy live requests to the new version and discard its responses</td><td>Zero users, but only if the new version has no side effects</td><td>Stop mirroring</td><td>Load of the copy</td></tr>
  <tr><td>Waves or rings</td><td>Staff, then one region, then more regions, with a pause between each</td><td>Each ring in turn</td><td>Stop and revert the ring</td><td>None</td></tr>
</table>
<p>
  They combine. A common production shape is waves of regions, a canary inside the first wave, and a rolling
  replacement inside each region. A shadow run suits a read path, where a bug costs little (the mirrored reads still add load, warm caches and touch
  rate-limited dependencies); on a write path a mirrored copy with real side effects would charge cards and send emails, so you
  mirror only with its side effects stubbed out.
</p>
<figure>
  <svg viewBox="0 0 640 190" class="dg" role="img" aria-label="A rollout in stages: one server, then one percent, then five percent, then twenty-five percent, then everyone, with a bake period and a health check between stages that can stop and roll back.">
    <g class="rough">
      <rect class="boxg" x="14"  y="40" width="96" height="46" rx="6" />
      <rect class="boxg" x="134" y="40" width="96" height="46" rx="6" />
      <rect class="boxy" x="254" y="40" width="96" height="46" rx="6" />
      <rect class="boxy" x="374" y="40" width="96" height="46" rx="6" />
      <rect class="boxr" x="494" y="40" width="130" height="46" rx="6" />
      <path class="ln" d="M110,63 L134,63" />
      <path class="ln" d="M230,63 L254,63" />
      <path class="ln" d="M350,63 L374,63" />
      <path class="ln" d="M470,63 L494,63" />
      <path class="ln dash" d="M62,110 L62,140 L560,140 L560,86" />
    </g>
    <text class="sm" x="62"  y="60" text-anchor="middle">1 box</text>
    <text class="sm" x="62"  y="76" text-anchor="middle">bake</text>
    <text class="sm" x="182" y="60" text-anchor="middle">1%</text>
    <text class="sm" x="182" y="76" text-anchor="middle">bake</text>
    <text class="sm" x="302" y="60" text-anchor="middle">5%</text>
    <text class="sm" x="302" y="76" text-anchor="middle">bake</text>
    <text class="sm" x="422" y="60" text-anchor="middle">25%</text>
    <text class="sm" x="422" y="76" text-anchor="middle">bake</text>
    <text class="sm rd" x="559" y="60" text-anchor="middle">100%</text>
    <text class="sm rd" x="559" y="76" text-anchor="middle">hard to undo quickly</text>
    <text class="lbl" x="16" y="166" style="font-size:14px">between every stage: compare with the control group; a failed check stops the rollout and reverts</text>
  </svg>
  <figcaption>The early stages are cheap because few users see them, and the bake time between stages is what turns a few minutes of data into evidence. The last step is the expensive one, so the signal must already be trustworthy by then.</figcaption>
</figure>

<h3>Canary analysis: what to compare, and for how long</h3>
<p>
  The Google SRE Workbook's guidance on canaries reads like a checklist. Compare the canary with a <b>control</b>
  running at the same time on the same traffic, not with "before the deploy", because the world changes every
  hour. Start with a handful of metrics tied to the user-visible SLIs: error rate and latency first, since CPU can
  rise without hurting anyone. Leave client-error status codes out or watch them with black-box probes, because a 404
  can be a user's typo. Look at the canary and the control separately, because the aggregate can hide a failure in the
  small group. Add an absolute check against the SLO as well, since canary and control can degrade together. Keep
  the metric window no longer than the canary, run one canary at a time, and make it large and long enough to be
  representative: performance bugs often show only under peak load, so a canary at 3 a.m. proves little.
</p>
<h4>Dry run: what a canary saves in error budget</h4>
<p>
  Take a 99.9% availability objective over 30 days. The error budget is 0.1% of 30 days, which is
  0.001 × 30 × 24 × 60 = <b>43.2 full-outage minutes</b>. A bad build fails 20% of the requests it serves. At 1,000
  requests a second, a 5% canary sees 50 a second, 3,000 a minute.
</p>
<table>
  <tr><th>Rollout</th><th>Share of traffic on the bad build</th><th>Error rate seen by all users</th><th>Time to notice</th><th>Budget spent</th></tr>
  <tr><td>Straight to 100%, noticed late</td><td>100%</td><td>20%</td><td>30 min (assumed)</td><td>0.2 × 30 = 6.0 outage-minutes, 13.9% of the budget</td></tr>
  <tr><td>Straight to 100%, noticed as fast as the canary</td><td>100%</td><td>20%</td><td>10 min</td><td>0.2 × 10 = 2.0 outage-minutes, 4.6% of the budget</td></tr>
  <tr><td>5% canary</td><td>5%</td><td>0.05 × 0.2 = 1%</td><td>10 min (assumed)</td><td>0.01 × 10 = 0.1 outage-minutes, 0.23% of the budget</td></tr>
</table>
<p class="sub">
  The detection times are assumptions, so look at the third row: even if both rollouts were caught in ten minutes,
  the canary costs about twenty times less, because the share of traffic is the lever. What a canary adds for
  noticing is a <b>control group</b>. On 3,000 canary requests a minute, 20% failure means 600 errors against about 3
  expected from the 0.1% baseline, and the comparison against the old version on the same traffic says the new build
  caused it. A subtler regression of 0.2 percentage points means 9 errors a minute against 3. That is already
  unlikely by chance, but once you run many comparisons across many metrics one minute is borderline, so you wait
  several minutes (ten minutes gives 90 against 30) before you trust it. Small canaries are cheap, and the smaller
  the regression you want to catch the longer you wait.
</p>

<h3>Rollback is a feature you have to design</h3>
<p>
  "We can roll back" is true only if the old version still works with whatever the new version left behind. Three
  places that goes wrong, and the standard defences:
</p>
<ul>
  <li><b>New data formats.</b> Amazon's guidance is a two-step release. First deploy a version that can <em>read</em> the new format but still writes the old one; rolling that back is safe because no new data exists. Wait until every host has finished that step and a bake period has passed (Amazon says usually a few days, long enough to be sure you will not go back to the old version), then deploy the version that <em>writes</em> the new format. Readers go before writers going forward, and writers are removed before readers going back.</li>
  <li><b>Database schema.</b> Use <em>parallel change</em> (also called expand and contract): add the new column, deploy code that writes both, backfill, switch reads, stop writing the old one, and only then drop it in a later release. Never rename or drop in the same release as the code that stops using the old name. A destructive migration cannot be rolled back, so the real plan is rolling forward with a fix.</li>
  <li><b>Configuration.</b> Version it, validate it before it ships, keep the last known good copy, push it in stages like code, and make the service refuse a bad file and keep running with the old one instead of crashing at startup.</li>
</ul>
<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="Expand and contract in five releases: add the column, write both, backfill and read the new column, stop writing the old column, then drop it. Rolling back is safe at every step except the last.">
    <g class="rough">
      <rect class="boxg" x="12"  y="44" width="112" height="56" rx="6" />
      <rect class="boxg" x="132" y="44" width="112" height="56" rx="6" />
      <rect class="boxg" x="252" y="44" width="112" height="56" rx="6" />
      <rect class="boxy" x="372" y="44" width="112" height="56" rx="6" />
      <rect class="boxr" x="492" y="44" width="136" height="56" rx="6" />
      <path class="ln" d="M124,72 L132,72" />
      <path class="ln" d="M244,72 L252,72" />
      <path class="ln" d="M364,72 L372,72" />
      <path class="ln" d="M484,72 L492,72" />
    </g>
    <text class="sm" x="68"  y="68" text-anchor="middle">1 expand</text>
    <text class="sm" x="68"  y="86" text-anchor="middle">add column</text>
    <text class="sm" x="188" y="68" text-anchor="middle">2 write both</text>
    <text class="sm" x="188" y="86" text-anchor="middle">read old</text>
    <text class="sm" x="308" y="68" text-anchor="middle">3 backfill</text>
    <text class="sm" x="308" y="86" text-anchor="middle">read new</text>
    <text class="sm" x="428" y="68" text-anchor="middle">4 stop writing</text>
    <text class="sm" x="428" y="86" text-anchor="middle">the old one</text>
    <text class="sm rd" x="560" y="68" text-anchor="middle">5 contract</text>
    <text class="sm rd" x="560" y="86" text-anchor="middle">drop the column</text>
    <text class="lbl gr" x="16" y="150" style="font-size:14px">steps 1 to 4: the previous release still works, so rolling back one release is safe</text>
    <text class="lbl rd" x="16" y="174" style="font-size:14px">step 5 destroys the data the previous release needs: do it last, alone, after a long bake</text>
  </svg>
  <figcaption>Each release is small and compatible with the one before it. The cost is five deploys instead of one, which is what buys the ability to stop at any point.</figcaption>
</figure>

<h3>Gates, bake time and automatic rollback</h3>
<p>
  A human watching a dashboard is not a control. Mature pipelines make the checks mechanical: deploy to one box
  or one small cell, wait a <b>bake time</b> while alarms watch the user-visible signals, promote to the next wave
  only if they stay quiet, and roll back automatically when one fires. Amazon describes pipelines of this shape,
  with waves ordered so that the least risky or smallest cells go first. Two practical rules follow. Do not
  promote on the clock alone, because a bug that appears only at the nightly peak survives a 30-minute bake. And
  keep the rollback path as exercised as the forward path: a rollback you have never run is a hope.
</p>
<p>
  Connect this to the error-budget policy from the availability chapter. When the budget for the period is spent,
  the standard response is to pause feature releases and spend the time on reliability work, which turns "ship
  safely" from advice into a rule the team agreed in advance.
</p>

<h3>When it breaks anyway: incident response</h3>
<p>
  Some bad changes get through. What decides the length of the outage is the first few minutes, and the rule that
  shortens them is <b>mitigate first, diagnose later</b>. Roll back, turn the flag off, drain the bad region or shed
  load; understanding the root cause can wait until users are no longer being hurt.
</p>
<ul>
  <li><b>Clear roles.</b> Borrowed from emergency services, the SRE book's incident management uses an <b>incident commander</b> who coordinates and decides, an <b>operations</b> lead who is the only one changing the system, and a <b>communications</b> lead who updates stakeholders, with a planning role for large incidents. One person in charge prevents ten engineers pushing ten fixes at once.</li>
  <li><b>One channel and a running log.</b> Everyone watches the same place, and decisions are written down as they happen, which is also the raw material of the postmortem.</li>
  <li><b>Severity levels</b> set who is paged and how often updates go out, so a minor issue does not wake the executives and a major one does not wait for someone to notice.</li>
  <li><b>Hand off cleanly</b> on a long incident, so the person who has been awake for eight hours is not the one making the next call.</li>
</ul>

<h3>Blameless postmortems</h3>
<p>
  After the incident, the goal is that <em>this class of failure cannot recur</em>, not that someone is punished.
  The SRE book's postmortem chapter is firm on blamelessness: if people expect to be blamed, they hide the facts, and
  the next outage is worse. Treat "human error" as where the analysis starts, not where it ends (a view from the wider safety literature rather
  than from the SRE book): the question is why the system let one slip become an outage. The SRE book's example
  postmortem shows the shape, and a good one has a short summary and impact, a timeline, the contributing causes, what went
  well, what went badly, and <b>action items with an owner and a priority</b>, tracked to completion. An action
  list nobody reads is the failure mode, so review the previous ones in the next postmortem.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd treat every change as a risk: ship the code dark behind a flag,
  then canary it at five percent and compare error rate and latency against a control for long enough to see a
  regression, before moving to wider waves with a bake time and automatic rollback. Database changes use expand
  and contract so the previous release always still works, and config goes through the same stages. If something
  slips through, the first move is to mitigate, by flag or rollback, with one incident commander, and the follow-up
  is a blameless postmortem with owned action items."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "deploy without downtime", "zero-downtime migration", "how do you roll this out", "what if the new version is buggy", or any change to a schema, a format or an API that has live clients.</li>
  <li><b>The naive design</b> pushes to every server at once and relies on a redeploy to undo. Say the blast radius and the rollback time before the interviewer asks.</li>
  <li><b>Pick the strategy for the risk:</b> canary for user-facing behaviour, rolling for a routine low-risk bump, blue/green when a fast cutover matters and you can afford twice the capacity, shadow for a read path or a new engine.</li>
  <li><b>Name the compatibility rule:</b> new version and old version run side by side for a while, so both must read and write the same data.</li>
  <li><b>Quantify:</b> "a 5% canary caps the bad build to a 1% error rate, about a quarter of one percent of the monthly budget at a ten-minute detection" lands better than "we canary".</li>
  <li><b>The pitfall:</b> treating configuration and flags as outside the release process. Several of the largest recent outages were configuration changes: Cloudflare's 18 November 2025 outage traced to a change in a feature file used by its bot management system, and Google Cloud's 12 June 2025 outage traced to policy data with blank fields that reached production without flag protection.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Say what share of outages come from changes, and list four kinds of change that are not code deploys.</li>
    <li>Explain the difference between deploying and releasing, and what a kill switch is for.</li>
    <li>Compare rolling, blue/green and canary on blast radius, rollback speed and extra capacity.</li>
    <li>Work out the error budget a bad build consumes with and without a 5% canary, with the arithmetic.</li>
    <li>Describe a schema change in five steps so that every step can be rolled back except the last.</li>
    <li>List the incident roles and say why you mitigate before you diagnose.</li>
    <li>Say what a blameless postmortem contains and why "human error" is not a root cause.</li>
  </ul>
</div>

<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://sre.google/sre-book/introduction/" rel="noopener noreferrer">SRE book: introduction</a> — roughly 70% of outages are due to changes in a live system</li>
    <li><a href="https://sre.google/sre-book/release-engineering/" rel="noopener noreferrer">SRE book: release engineering</a> — hermetic builds, gradual rollout, why releases are engineered</li>
    <li><a href="https://sre.google/workbook/canarying-releases/" rel="noopener noreferrer">SRE Workbook: canarying releases</a> — control group, metrics, population size, duration, blue/green comparison</li>
    <li><a href="https://sre.google/sre-book/managing-incidents/" rel="noopener noreferrer">SRE book: managing incidents</a> — command roles, a live log, handoffs</li>
    <li><a href="https://sre.google/sre-book/postmortem-culture/" rel="noopener noreferrer">SRE book: postmortem culture</a> — blameless postmortems and why they matter</li>
    <li><a href="https://sre.google/sre-book/example-postmortem/" rel="noopener noreferrer">SRE book: example postmortem</a> — the sections of a real postmortem, including action items</li>
    <li><a href="https://blog.cloudflare.com/18-november-2025-outage/" rel="noopener noreferrer">Cloudflare: 18 November 2025 outage</a> — a configuration file change that spread across the network</li>
    <li><a href="https://status.cloud.google.com/incidents/ow5i3PPK96RduMcb1SsW" rel="noopener noreferrer">Google Cloud incident report, 12 June 2025</a> — policy data with blank fields, and the missing flag protection</li>
    <li><a href="https://sre.google/workbook/incident-response/" rel="noopener noreferrer">SRE Workbook: incident response</a> — roles and practice for real incidents</li>
    <li><a href="https://builder.aws.com/content/3ErTKQOTKc5NIw031UePBPxTQ6I/automating-safe-hands-off-deployments" rel="noopener noreferrer">Amazon Builders' Library: automating safe, hands-off deployments</a> — waves, bake time, automatic rollback</li>
    <li><a href="https://builder.aws.com/content/3F04j2yRAAMBuPSPs50xwXZqg01/ensuring-rollback-safety-during-deployments" rel="noopener noreferrer">Amazon Builders' Library: ensuring rollback safety during deployments</a> — the two-step read-then-write release</li>
    <li><a href="https://martinfowler.com/articles/feature-toggles.html" rel="noopener noreferrer">Fowler, Feature Toggles</a> — release, experiment, ops and permission toggles, and toggle debt</li>
    <li><a href="https://martinfowler.com/bliki/ParallelChange.html" rel="noopener noreferrer">Fowler, Parallel Change</a> — expand, migrate, contract</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. Figures marked "example" are illustrative.</p>
</div>`,
};
