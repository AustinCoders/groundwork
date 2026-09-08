import type { Chapter } from "../types";

export const reactTesting: Chapter = {
  id: "react-testing",
  num: "I14",
  title: "Testing React",
  short: "Testing",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Test what a user can do. A test that breaks on a refactor was protecting the wrong thing.",
  body: `<h3>The principle</h3>
<p>
  The more a test resembles how the software is used, the more confidence it
  gives. That is Testing Library's stated philosophy and it is the whole
  discipline: assert on what appears on screen and what happens when you
  interact with it, never on internal state, props, or which components
  rendered.
</p>
<pre><code>test("shows the total after adding an item", async () =&gt; {
  const user = userEvent.setup();
  render(&lt;Cart /&gt;);

  await user.click(screen.getByRole("button", { name: /add to cart/i }));

  expect(screen.getByText("Total: ₹499")).toBeInTheDocument();
});</code></pre>
<p>
  Nothing in that test knows whether <code>Cart</code> uses
  <code>useState</code>, <code>useReducer</code> or a store. Rewrite the
  internals and it still passes &mdash; which is exactly what a test is for.
</p>

<h3>Queries, in priority order</h3>
<div class="table-scroll"><table>
<thead><tr><th>Query</th><th>Use when</th></tr></thead>
<tbody>
<tr><td><code>getByRole</code></td><td>Almost always. <code>{ name }</code> matches the accessible name.</td></tr>
<tr><td><code>getByLabelText</code></td><td>Form fields</td></tr>
<tr><td><code>getByText</code></td><td>Non-interactive content</td></tr>
<tr><td><code>getByTestId</code></td><td>Last resort &mdash; nothing else can identify it</td></tr>
</tbody>
</table></div>
<div class="bx is-prim">
  <span class="ttl">Why role queries are worth the effort</span>
  <p>
    <code>getByRole("button", { name: "Save" })</code> fails if the element is a
    <code>&lt;div onClick&gt;</code>, or if the button has no accessible name.
    Querying the way a screen reader does means your tests quietly enforce
    accessibility &mdash; you cannot write a passing test for an unlabelled
    control.
  </p>
</div>

<h3>get, query, find</h3>
<pre><code>getByText("x")          <span class="c">// throws if missing — the default</span>
queryByText("x")        <span class="c">// null if missing — for asserting absence</span>
await findByText("x")   <span class="c">// waits — for anything async</span>

expect(screen.queryByText("Error")).not.toBeInTheDocument();
expect(await screen.findByText("Saved")).toBeInTheDocument();</code></pre>
<p>
  Using <code>getBy</code> for something that has not arrived yet is the most
  common failing test. <code>findBy</code> retries until it appears or times
  out.
</p>

<h3>userEvent, not fireEvent</h3>
<pre><code>await user.type(screen.getByLabelText("Email"), "a@b.com");
await user.click(screen.getByRole("button", { name: "Submit" }));
await user.selectOptions(screen.getByRole("combobox"), "pune");</code></pre>
<p>
  <code>fireEvent.change</code> dispatches one synthetic event.
  <code>userEvent.type</code> fires the whole sequence a real user produces
  &mdash; focus, keydown, keypress, input, keyup &mdash; which is what catches
  handlers that only work for one of them. It is async; forgetting the
  <code>await</code> is the second most common failing test.
</p>

<h3>Mock the network, not your modules</h3>
<pre><code>const server = setupServer(
  http.get("/api/todos", () =&gt; HttpResponse.json([{ id: 1, title: "Ship it" }]))
);

beforeAll(() =&gt; server.listen());
afterEach(() =&gt; server.resetHandlers());
afterAll(() =&gt; server.close());</code></pre>
<p>
  MSW intercepts at the network layer, so the component is untouched &mdash; it
  really calls <code>fetch</code>. Mocking your own data module instead couples
  the test to the implementation, and the test keeps passing after you swap
  <code>fetch</code> for a query library that the mock no longer covers.
</p>
<p class="sub">
  The same handlers can serve local development, which is the second reason to
  prefer it.
</p>

<h3>Testing a hook</h3>
<pre><code>const { result } = renderHook(() =&gt; useCounter(5));

act(() =&gt; result.current.increment());
expect(result.current.count).toBe(6);</code></pre>
<p>
  Worth it for a hook with real logic that many components use. For a hook used
  in one place, test the component &mdash; that tests the hook too, through the
  interface that matters.
</p>

<h3>Testing the async and the accessible</h3>
<pre><code>test("shows an error when saving fails", async () =&gt; {
  server.use(http.post("/api/todos", () =&gt; HttpResponse.error()));
  const user = userEvent.setup();
  render(&lt;TodoForm /&gt;);

  await user.type(screen.getByLabelText(/title/i), "Ship it");
  await user.click(screen.getByRole("button", { name: /save/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(/could not save/i);
});</code></pre>
<p>
  Overriding one handler per test is how you cover the failure paths &mdash; the
  states most suites never exercise. Querying the error by
  <code>role="alert"</code> asserts on the accessible experience at the same
  time: if the message is not announced, the test fails.
</p>

<h3>Accessibility assertions in the same run</h3>
<pre><code>import { axe } from "jest-axe";

test("has no obvious accessibility violations", async () =&gt; {
  const { container } = render(&lt;Checkout /&gt;);
  expect(await axe(container)).toHaveNoViolations();
});</code></pre>
<p class="sub">
  It catches the mechanical third &mdash; missing names, bad contrast, duplicate
  ids. It cannot tell you whether the flow makes sense with a keyboard, which is
  still five minutes and your hands off the mouse.
</p>

<h3>Two things that make suites flaky</h3>
<ul>
  <li><b>Real timers.</b> Use <code>vi.useFakeTimers()</code> for debounces and intervals, and advance them explicitly. Waiting 300ms in a test is a race you will lose on a slow CI machine.</li>
  <li><b>Shared state between tests.</b> Reset MSW handlers, clear <code>localStorage</code>, and give each test its own render. A suite that only passes in order is not a suite.</li>
</ul>

<h3>What not to write</h3>
<ul>
  <li><b>Snapshot tests of whole trees.</b> They fail on every change, get updated without being read, and assert nothing anybody chose.</li>
  <li><b>Tests that a component rendered.</b> "It does not crash" is what the type checker and the next real test already tell you.</li>
  <li><b>Assertions on state or props.</b> Those are implementation. Assert on the output.</li>
  <li><b>A test per function.</b> Coverage of the money path beats a percentage.</li>
</ul>

<h3>The shape of a suite</h3>
<div class="table-scroll"><table>
<thead><tr><th>Layer</th><th>Tool</th><th>Covers</th></tr></thead>
<tbody>
<tr><td>Unit</td><td>Vitest</td><td>Pure logic &mdash; reducers, formatters, validators. Fast and plentiful.</td></tr>
<tr><td>Component</td><td>RTL + MSW</td><td>A feature behaves correctly, including loading, empty and error states.</td></tr>
<tr><td>End-to-end</td><td>Playwright &mdash; <a href="/react/react-e2e">its own chapter</a></td><td>The few flows that must never break: sign in, checkout, the thing that takes the money.</td></tr>
</tbody>
</table></div>
<p>
  Reducers are the cheapest tests you will ever write &mdash; a plain function,
  no render, no DOM &mdash; which is another argument for
  <a href="/react/react-usereducer">moving transitions into one</a>.
</p>

<h3>Debugging a failing test</h3>
<pre><code>screen.debug();                       <span class="c">// print the DOM</span>
screen.logTestingPlaygroundURL();     <span class="c">// open it in a query builder</span></code></pre>
<p>
  "Unable to find an element with the role button" usually means the element has
  no accessible name, or has not rendered yet. Both are worth knowing about.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "I test behaviour rather than implementation: query by role and accessible
    name, drive it with userEvent, and intercept the network with MSW so the
    component is untouched. Snapshot tests of whole trees and assertions on
    internal state are the two things I avoid, because both break on refactors
    that changed nothing a user can see."
  </p>
</div>`,
};
