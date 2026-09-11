import type { Chapter } from "../types";

export const testingInJs: Chapter = {
  id: "testing-in-js",
  num: "A9",
  title: "Testing",
  short: "Testing",
  levels: ["advanced"],
  practice: ["ex-pure-refactor", "ex-injectable-clock"],
  ready: true,
  subtitle: "Not optional at this level — and this whole site's own test suite is the example.",
  body: `<p>
  Nothing below is a runnable example — <code>describe</code>,
  <code>it</code>, and <code>expect</code> are test-runner globals, not
  part of the language, so they don't exist in the sandboxed worker
  this page's other examples run in. Every example here is real code,
  though — most of it lifted directly from
  <code>tests/content.test.ts</code>, the file that actually runs
  every time this project's own <code>npm test</code> does.
</p>

<h3>Unit vs integration vs E2E</h3>
<table>
  <tr>
    <th></th>
    <th>Tests</th>
    <th>Fast?</th>
    <th>Catches</th>
  </tr>
  <tr><td><b>Unit</b></td><td>one function or module, isolated</td><td class="tone-yes">very — milliseconds, hundreds run in a blink</td><td>logic bugs in that one piece</td></tr>
  <tr><td><b>Integration</b></td><td>several real pieces working together — no mocking the database, say</td><td class="tone-warn">slower — real I/O</td><td>the seams: "does my code actually talk to the real DB/API correctly"</td></tr>
  <tr><td><b>E2E</b></td><td>the whole app, driven like an actual user — click, type, assert on the screen</td><td class="tone-bad">slowest — a real browser, a real app</td><td>"does the feature work end to end," including things no unit test ever touches (routing, real rendering, real network)</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">Rule</span> The classic shape is a pyramid: <b>many</b>
  unit tests, <b>fewer</b> integration tests, a <b>handful</b> of E2E
  tests. Each layer up costs more to run and more to maintain — E2E
  tests are the most convincing and the most expensive, not the
  default choice for everything.
</div>

<h3>describe / it / expect</h3>
<p>
  A real example, verbatim, from this project's own test suite:
</p>
<pre><code>import { describe, expect, it } from "vitest";

describe("chapter integrity", () =&gt; {
  it("balances &lt;pre&gt; and &lt;code&gt; tags in every body", () =&gt; {
    for (const { topicId, ch } of allChapters) {
      const open = (ch.body.match(/&lt;pre&gt;/g) || []).length;
      const close = (ch.body.match(/&lt;\\/pre&gt;/g) || []).length;
      expect(open, \`\${topicId}/\${ch.id} has unbalanced &lt;pre&gt; tags\`).toBe(close);
    }
  });
});</code></pre>
<p>
  <code>describe</code> is purely organizational — a named group, shows
  up as a heading in the output. <code>it</code> (same thing as
  <code>test</code> in most runners) is one actual test case, and only
  passes if nothing inside it throws. <code>expect(value)</code> wraps
  a value so you can chain a <b>matcher</b> onto it —
  <code>.toBe()</code> for exact equality, <code>.toEqual()</code> for
  deep equality on objects/arrays, <code>.toContain()</code>,
  <code>.toThrow()</code>, dozens more. That optional second string
  argument to <code>expect()</code> above is the failure message — the
  difference between a red X and "topic 'js', chapter
  'operators-flow' has unbalanced &lt;pre&gt; tags" when something
  actually breaks.
</p>
<p class="sub">
  Underneath, a test runner is doing something close to what
  <a href="/notes/errors-tools">the errors chapter</a> already covered:
  each <code>it</code> block runs inside a <code>try/catch</code> the
  runner controls. A thrown error (which is exactly what a failed
  <code>expect()</code> does) is caught, recorded as a failure with its
  message, and the runner moves on to the next test instead of the
  whole suite crashing on the first red result.
</p>

<h3>Mocking and spies</h3>
<p>
  A <b>mock</b> replaces a real dependency with a fake, controllable
  stand-in. A <b>spy</b> wraps a <em>real</em> function so it still
  runs normally, but every call gets recorded — arguments, return
  value, call count.
</p>
<pre><code>import { vi, expect, it } from "vitest";

it("calls the save callback exactly once", () =&gt; {
  const onSave = vi.fn();          <span class="c">// a mock function — records every call</span>
  submitForm({ name: "Ana" }, onSave);
  expect(onSave).toHaveBeenCalledTimes(1);
  expect(onSave).toHaveBeenCalledWith({ name: "Ana" });
});</code></pre>
<p>
  This is exactly where
  <a href="/notes/patterns-architecture">dependency injection</a> earns
  its keep: <code>submitForm(data, onSave)</code> takes its dependency
  as a parameter instead of importing and calling a real save function
  directly, so a test can hand it <code>vi.fn()</code> instead of
  hitting a real API. A function that reaches out and imports its own
  dependencies has nothing a test can substitute — mocking often isn't
  a testing-library feature so much as a reason to write the function
  injectable in the first place.
</p>

<h3>Fake timers</h3>
<p>
  A real <code>setTimeout(fn, 5000)</code> in a test means the test
  genuinely waits 5 real seconds — multiply that across a suite and
  testing gets unbearably slow. Fake timers replace the clock itself,
  so time can be fast-forwarded instantly.
</p>
<pre><code>import { vi, expect, it } from "vitest";

it("debounce only calls the function once after the delay", () =&gt; {
  vi.useFakeTimers();
  const fn = vi.fn();
  const debounced = debounce(fn, 200);

  debounced();
  debounced();
  debounced();
  expect(fn).not.toHaveBeenCalled();   <span class="c">// synchronous — no real time has passed at all</span>

  vi.advanceTimersByTime(200);          <span class="c">// jump the fake clock forward, instantly</span>
  expect(fn).toHaveBeenCalledTimes(1);  <span class="c">// only the LAST call actually fired — debounce, verified</span>

  vi.useRealTimers();
});</code></pre>
<p class="sub">
  This tests the exact <a href="/notes/closures">debounce
  implementation</a> from several chapters back — three rapid calls,
  one real invocation — and it runs in milliseconds despite testing a
  200ms delay, because <code>vi.advanceTimersByTime()</code> moves the
  fake clock, it doesn't actually wait.
</p>

<h3>Testing async code, and what makes a test flaky</h3>
<pre><code>it("resolves with the fetched user", async () =&gt; {
  const user = await loadUser(1);        <span class="c">// await works inside a test exactly like anywhere else</span>
  expect(user.name).toBe("Ana");
});</code></pre>
<p>
  A <b>flaky</b> test is one that passes most of the time and fails
  occasionally, with no code change in between — almost always one of
  a short list of causes: a real timer racing against the assertion
  instead of a fake one, a real network call to something not always
  reliable, tests that share mutable state and run in an
  order-dependent way, or a hardcoded wait
  (<code>setTimeout(..., 100)</code>, hoping 100ms is always enough)
  instead of actually waiting for the specific condition to become
  true.
</p>
<div class="warn">
  <span class="ttl">⚠ A flaky test is worse than no test</span>
  Once a test fails intermittently, the instinct after enough false
  alarms is to stop trusting it — and once nobody trusts it, a
  <em>real</em> failure gets re-run and ignored right along with the
  false ones. Fix or delete a flaky test; a red light nobody believes
  isn't protecting anything.
</div>

<h3>Testing the DOM: query by role, not by class</h3>
<pre><code><span class="c">// fragile — breaks the moment a class name changes for purely visual reasons</span>
container.querySelector(".btn-primary-lg");

<span class="c">// Testing Library's approach — query the way an actual user/assistive tech would</span>
screen.getByRole("button", { name: /submit/i });
screen.getByLabelText("Email address");
screen.getByText("Welcome back");</code></pre>
<p class="sub">
  <a href="/notes/dom-events">The DOM chapter</a> already covered
  <code>querySelector</code>, and it still works fine here — the
  problem is what it couples the test to. A CSS class is a styling
  detail; renaming it for a purely visual refactor shouldn't break a
  test that never cared about styling. Querying by role, label, or
  visible text couples the test to what the feature actually
  <em>is</em> to a user — which also means a test written this way
  incidentally checks that the markup is accessible enough to query
  that way at all.
</p>

<h3>What coverage % actually tells you</h3>
<p>
  Coverage measures which lines (or branches, or functions) ran at
  least once while the test suite executed — nothing more. A line
  running is not the same as that line being <em>correctly checked</em>.
</p>
<pre><code>function divide(a, b) {
  return a / b;    <span class="c">// one line, so one test calling divide(4, 2) hits 100% line coverage</span>
}
<span class="c">// ...without a single assertion ever checking behavior at b === 0</span></code></pre>
<p class="sub">
  100% coverage with weak assertions is completely possible, and
  common. Coverage is genuinely useful for one specific job — finding
  code nobody's tests touch <em>at all</em>, which is a real blind
  spot worth knowing about — but a coverage percentage on its own is a
  measure of what ran, never a measure of what was actually verified.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Coverage tells me what's
  untested, not what's correct. I use it to find gaps, not as a quality
  score — a suite that hits every line with assertions that would pass
  no matter what the code did isn't actually testing anything."
</div>`,
};
