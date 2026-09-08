import type { Chapter } from "../types";

export const reactE2e: Chapter = {
  id: "react-e2e",
  num: "I18",
  title: "End-to-end testing",
  short: "E2E testing",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "The tests that run the real app in a real browser — and why you want few of them.",
  body: `<h3>What this layer is for</h3>
<p>
  <a href="/react/react-testing">Testing components</a> covers unit and
  integration tests: your component, a fake server, jsdom. Those never prove the
  app <b>works</b>. They mount a piece of it, with a router you configured and
  data you wrote. End-to-end tests start a real build, open a real browser, and
  click.
</p>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Component tests</th><th>End-to-end</th></tr></thead>
<tbody>
<tr><td>Runs</td><td>jsdom, in Node</td><td>Chromium/Firefox/WebKit</td></tr>
<tr><td>Server</td><td>Mocked</td><td>Real, or seeded</td></tr>
<tr><td>Catches</td><td>Logic, states, a11y of one unit</td><td>Routing, build config, auth, env, CSP, real network</td></tr>
<tr><td>Speed</td><td>Milliseconds</td><td>Seconds</td></tr>
<tr><td>How many</td><td>Hundreds</td><td>Ten to thirty</td></tr>
</tbody>
</table></div>
<p>
  The count matters. E2E tests are the ones that fail on Tuesday for no reason
  and get skipped by Friday. Keep the set small enough that a red run is always
  worth reading.
</p>

<h3>Playwright, from zero</h3>
<pre><code>npm init playwright@latest</code></pre>
<pre><code><span class="c">// playwright.config.ts</span>
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  webServer: {
    command: "npm run build &amp;&amp; npm run start",   <span class="c">// production build, not dev</span>
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  retries: process.env.CI ? 2 : 0,
});</code></pre>
<p>
  Testing the dev server is testing something you never ship &mdash; different
  bundling, no minification, React in development mode, no static optimisation.
  Half the bugs this layer exists to catch only appear in the production build.
</p>

<h3>A first test</h3>
<pre><code>import { test, expect } from "@playwright/test";

test("a visitor can add a task", async ({ page }) =&gt; {
  await page.goto("/board");

  await page.getByLabel("New task").fill("Ship the release");
  await page.getByRole("button", { name: "Add" }).click();

  await expect(page.getByRole("listitem").filter({ hasText: "Ship the release" })).toBeVisible();
});</code></pre>
<p>
  Same selector philosophy as Testing Library, for the same reason: query by
  role, label and text, so the test breaks when the user experience breaks and
  not when a class name changes. When there is genuinely nothing user-visible to
  grab, use <code>data-testid</code> &mdash; deliberately, not by default.
</p>

<h3>Waiting: the entire skill</h3>
<pre><code><span class="c">// ✗ flaky — every one of these is a guess</span>
await page.waitForTimeout(1000);
expect(await page.locator(".row").count()).toBe(3);

<span class="c">// ✓ web-first assertions retry until they pass or time out</span>
await expect(page.getByRole("row")).toHaveCount(3);
await expect(page.getByText("Saved")).toBeVisible();</code></pre>
<div class="bx is-prim">
  <span class="ttl">The rule that removes most flake</span>
  <p>
    A <code>locator</code> is a <b>query, not a result</b> &mdash; it is re-run on
    every retry. So <code>expect(locator)</code> waits; <code>await
    locator.count()</code> reads once and hopes. Anything with
    <code>waitForTimeout</code> in it is a test you will delete in six months.
  </p>
</div>
<p>
  Actions auto-wait too: <code>click()</code> waits for the element to be
  attached, visible, stable, enabled and unobscured before it clicks. Most
  "element not found" failures are real bugs about timing, not Playwright being
  slow.
</p>

<h3>Auth, done once</h3>
<pre><code><span class="c">// e2e/auth.setup.ts</span>
setup("authenticate", async ({ page }) =&gt; {
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_USER);
  await page.getByLabel("Password").fill(process.env.E2E_PASS);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Dashboard")).toBeVisible();
  await page.context().storageState({ path: "e2e/.auth/user.json" });
});</code></pre>
<pre><code>projects: [
  { name: "setup", testMatch: /auth\\.setup\\.ts/ },
  { name: "chromium", use: { storageState: "e2e/.auth/user.json" }, dependencies: ["setup"] },
]</code></pre>
<p>
  Log in once, save the cookies and storage, reuse across every test. Logging in
  at the top of thirty tests adds minutes to the run and gives you thirty places
  to break. Keep <b>one</b> test that actually exercises the login form.
</p>

<h3>What to do about the backend</h3>
<div class="table-scroll"><table>
<thead><tr><th>Approach</th><th>Good for</th><th>Cost</th></tr></thead>
<tbody>
<tr><td>Real backend, seeded database</td><td>Highest confidence; catches contract drift</td><td>Slow, needs cleanup and isolation between tests</td></tr>
<tr><td><code>page.route()</code> interception</td><td>Error paths, slow networks, states you cannot produce on demand</td><td>You are back to testing against your assumptions</td></tr>
<tr><td>Mock service worker in the app</td><td>Deterministic demo/CI runs</td><td>Never exercises the real API</td></tr>
</tbody>
</table></div>
<pre><code><span class="c">// the thing interception is genuinely best at</span>
await page.route("**/api/tasks", (route) =&gt; route.fulfill({ status: 500 }));
await page.goto("/board");
await expect(page.getByRole("alert")).toContainText("Could not load");</code></pre>
<p class="sub">
  A sensible split: the happy paths run against a real seeded backend, the
  failure paths are intercepted. Do not try to seed a 500.
</p>

<h3>Debugging a failure you cannot reproduce</h3>
<pre><code>npx playwright test --ui          <span class="c"># time-travel runner, watch mode</span>
npx playwright test --debug       <span class="c"># step through with the inspector</span>
npx playwright show-trace trace.zip   <span class="c"># the CI failure, frame by frame</span></code></pre>
<p>
  <code>trace: "on-first-retry"</code> is the setting that pays for itself: when
  CI fails, you download an artifact containing every DOM snapshot, network call
  and console message, and scrub through it. Without traces, a flaky CI-only
  failure can cost a whole day.
</p>

<h3>Two more things this layer gets you cheaply</h3>
<pre><code><span class="c">// visual regression</span>
await expect(page).toHaveScreenshot("board.png", { maxDiffPixels: 100 });

<span class="c">// accessibility, on real rendered pages</span>
const results = await new AxeBuilder({ page }).analyze();
expect(results.violations).toEqual([]);</code></pre>
<p>
  Screenshots are powerful and high-maintenance &mdash; fonts, scrollbars and
  animation make them differ across machines. If you use them, pin the browser
  version, disable animation, and generate the baselines in CI's own container,
  never on your laptop.
</p>

<h3>What to actually cover</h3>
<ol>
  <li>Sign up, sign in, sign out.</li>
  <li>The one flow that makes money &mdash; checkout, publish, submit.</li>
  <li>Anything with a payment or an irreversible side effect.</li>
  <li>A route that is server-rendered and one that is client-rendered.</li>
  <li>One deep link straight into an authenticated page, cold.</li>
</ol>
<p>
  That is often eight tests. Everything else &mdash; validation messages, empty
  states, sorting, edge cases &mdash; belongs one layer down, where it runs in
  milliseconds and never flakes.
</p>

<h3>Cypress, briefly</h3>
<p>
  You will meet it in existing codebases. Same idea, different shape: it runs
  inside the browser (so it has always had a great watch UI), its commands are
  chained rather than awaited, and cross-browser and multi-tab support came later
  and is weaker. For a new project in 2026, Playwright is the default &mdash;
  parallelism, real cross-browser, and the trace viewer. Do not rewrite a working
  Cypress suite to prove a point.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview line</span>
  <p>
    "Lots of component tests, a handful of E2E. E2E runs the production build in a
    real browser, so it catches the things jsdom cannot &mdash; routing, auth,
    env, CSP. I keep the set to the flows the business cares about, log in once
    with a saved storage state, use web-first assertions instead of waits, and
    turn on traces so a CI-only failure is debuggable."
  </p>
</div>`,
};
