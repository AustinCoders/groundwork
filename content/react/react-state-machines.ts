import type { Chapter } from "../types";

export const reactStateMachines: Chapter = {
  id: "react-state-machines",
  num: "A22",
  title: "State machines and XState",
  short: "State machines",
  levels: ["advanced"],
  practice: ["ex-react-machine-transition"],
  ready: true,
  subtitle:
    "When a screen has modes, list the modes and the events each one accepts, instead of guessing from booleans.",
  body: `<h3>The bug a machine prevents</h3>
<pre><code>const [isLoading, setLoading] = useState(false);
const [isError, setError] = useState(false);
const [isSuccess, setSuccess] = useState(false);
const [isPaused, setPaused] = useState(false);</code></pre>
<p>
  Four booleans give sixteen combinations and the component handles perhaps five.
  The other eleven &mdash; loading <em>and</em> success, paused while in error
  &mdash; are reachable, unhandled, and found by users. A
  <b>finite state machine</b> replaces the flags with one value that is exactly
  one of a fixed list, plus a rule for which events move it where. If an event is
  not listed for the current state, nothing happens. The
  <a href="/react/react-usereducer">reducer chapter</a> made this argument for
  one field; a machine is that idea made complete.
</p>

<h3>Start without a library</h3>
<pre><code>const machine = {
  idle:    { FETCH: "loading" },
  loading: { RESOLVE: "success", REJECT: "error" },
  success: { FETCH: "loading" },
  error:   { RETRY: "loading" },
};

function transition(state, event) {
  return machine[state]?.[event] ?? state;      <span class="c">// unknown event: stay put</span>
}

const [state, dispatch] = useReducer(transition, "idle");
dispatch("FETCH");</code></pre>
<p>
  That table is a complete machine. Read it as documentation: from
  <code>loading</code> you can only resolve or reject, so a second click on a
  "Fetch" button while loading is <b>ignored by construction</b>, not by an
  <code>if (isLoading) return</code> someone must remember. The same table is a
  type, too &mdash; the <a href="/react/react-typescript">discriminated union</a>
  from the TypeScript chapter is the compile-time half of the same idea.
</p>

<h3>XState v5</h3>
<pre><code>import { setup, assign, fromPromise } from "xstate";
import { useMachine } from "@xstate/react";

const userMachine = setup({
  types: {
    context: {} as { id: string; user: User | null; error: string | null },
    events: {} as { type: "FETCH"; id: string } | { type: "RETRY" },
  },
  actors: {
    loadUser: fromPromise(async ({ input }: { input: { id: string } }) =&gt; getUser(input.id)),
  },
}).createMachine({
  id: "user",
  initial: "idle",
  context: { id: "", user: null, error: null },
  states: {
    idle: {
      on: { FETCH: { target: "loading", actions: assign({ id: ({ event }) =&gt; event.id }) } },
    },
    loading: {
      invoke: {
        src: "loadUser",
        input: ({ context }) =&gt; ({ id: context.id }),
        onDone: { target: "success", actions: assign({ user: ({ event }) =&gt; event.output }) },
        onError: { target: "error", actions: assign({ error: ({ event }) =&gt; String(event.error) }) },
      },
    },
    success: { on: { FETCH: { target: "loading" } } },
    error: { on: { RETRY: "loading" } },
  },
});</code></pre>
<pre><code>function Profile() {
  const [snapshot, send] = useMachine(userMachine);

  if (snapshot.matches("loading")) return &lt;Spinner /&gt;;
  if (snapshot.matches("error")) return &lt;button onClick={() =&gt; send({ type: "RETRY" })}&gt;Retry&lt;/button&gt;;
  if (snapshot.matches("success")) return &lt;p&gt;{snapshot.context.user.name}&lt;/p&gt;;
  return &lt;button onClick={() =&gt; send({ type: "FETCH", id: "1" })}&gt;Load&lt;/button&gt;;
}</code></pre>
<p>
  <code>setup()</code> declares the types and the named implementations first,
  so the machine definition stays readable and the events, context and actors are
  checked. <code>invoke</code> starts an actor when the state is entered and
  stops it when the state is left &mdash; leaving <code>loading</code> cancels
  the request's result, which is the race condition from
  <a href="/react/react-data-fetching">data fetching</a> solved structurally.
  <b>Context</b> holds the data that travels with the machine; <b>state</b>
  holds the mode. Keep them separate: "is a user loaded" is a state, "who" is
  context.
</p>

<h3>The parts a reducer does not give you</h3>
<pre><code>loading: {
  after: { 8000: "timeout" },                          <span class="c">// delayed transition</span>
  on: {
    CANCEL: "idle",
    RESOLVE: { guard: ({ context }) =&gt; context.attempts &lt; 3, target: "success" },
  },
}</code></pre>
<ul>
  <li><b>Guards:</b> a transition that only applies if a condition holds, declared beside the transition instead of buried in a handler.</li>
  <li><b>Delayed transitions:</b> <code>after</code> handles timeouts, debounces and auto-dismiss without a single <code>setTimeout</code> or cleanup to forget.</li>
  <li><b>Hierarchical states:</b> a <code>submitting</code> state can have its own <code>validating</code> and <code>sending</code> children, and an event handled on the parent applies to all of them.</li>
  <li><b>Parallel states:</b> a media player is playing <em>and</em> muted <em>and</em> fullscreen; each dimension is its own region rather than an explosion of combined names.</li>
  <li><b>Reading it:</b> <code>snapshot.matches("loading")</code> for a state, and <code>snapshot.can({ type: "RETRY" })</code> to ask whether an event would do anything &mdash; ideal for disabling a button truthfully.</li>
</ul>

<h3>Where side effects go</h3>
<pre><code>states: {
  saving: {
    entry: "showSpinner",                         <span class="c">// runs on the way in</span>
    exit: "hideSpinner",                          <span class="c">// runs on the way out, however it leaves</span>
    invoke: { src: "save", onDone: "saved", onError: "failed" },
  },
}</code></pre>
<p>
  The rule that keeps a machine testable: <b>transitions and guards are pure</b>,
  and effects live in three named places. <code>entry</code> and
  <code>exit</code> actions fire when a state is entered or left &mdash; and
  <code>exit</code> fires however the state is left, which makes it the reliable
  spot for cleanup. Actions on a transition run as it happens. <code>invoke</code>
  starts long-running work tied to the state's lifetime. Changing context always
  goes through <code>assign</code>, never a mutation, so every change is visible
  in the definition. Because the actions are <em>named</em> in the machine and
  implemented in <code>setup()</code> (or supplied later with
  <code>machine.provide()</code>), a test can swap the real network call for a
  fake without touching the logic.
</p>

<h3>Mistakes worth avoiding</h3>
<ul>
  <li><b>States named after events.</b> A state is a mode you can be <em>in</em> &mdash; <code>saving</code>, not <code>onSaveClicked</code>. If the name is a verb in the past tense, it is probably an event.</li>
  <li><b>Data smuggled into states.</b> <code>loadedUser1</code>, <code>loadedUser2</code> is context wearing a state's clothes. Ten states that differ by one value are one state and one field.</li>
  <li><b>Duplicating what React already tracks.</b> Text inside an input, a scroll position and anything derivable from props do not belong in a machine.</li>
  <li><b>One giant machine.</b> Split by responsibility &mdash; a checkout flow, a payment form, an address form &mdash; and let a parent machine start the others as actors and hear back from them.</li>
  <li><b>Reaching for it first.</b> Draw the states on paper. If there are two of them, write the <code>useState</code>.</li>
</ul>

<h3>Using it across components</h3>
<pre><code>const CheckoutContext = createActorContext(checkoutMachine);

&lt;CheckoutContext.Provider&gt;&lt;Steps /&gt;&lt;/CheckoutContext.Provider&gt;

const step = CheckoutContext.useSelector((s) =&gt; s.value);
const actor = CheckoutContext.useActorRef();       <span class="c">// stable; does not re-render on change</span></code></pre>
<p>
  <code>useMachine</code> creates the machine for one component's lifetime. When a
  wizard, a player or an upload queue must be shared, <code>createActorContext</code>
  provides the running actor and <code>useSelector</code> subscribes to just a
  slice &mdash; the same selector idea as in
  <a href="/react/react-state-libraries">state libraries</a>, and for the same
  reason. To restore a saved session, pass a persisted <code>snapshot</code>
  option when creating the actor.
</p>

<h3>Where it earns its place, and where it does not</h3>
<div class="table-scroll"><table>
<thead><tr><th>A machine fits</th><th>A plain <code>useState</code> is enough</th></tr></thead>
<tbody>
<tr><td>Multi-step wizards and checkout flows</td><td>An open/closed toggle</td></tr>
<tr><td>Upload, payment and auth flows with retries and cancel</td><td>A controlled input</td></tr>
<tr><td>Media players, drag interactions, editors with modes</td><td>Data derived from props</td></tr>
<tr><td>Anything where "which events are valid now?" is a real question</td><td>Two states with one transition</td></tr>
</tbody>
</table></div>
<p>
  The test is the question in the last row. If you find yourself writing
  <code>if (status === "x") return</code> at the top of handlers to ignore events
  that arrived at the wrong time, the states and transitions already exist &mdash;
  they are just unwritten. That is the moment to write them down. For everything
  smaller, the reducer or a union type gives most of the benefit with no
  dependency.
</p>

<h3>Testing gets easier</h3>
<pre><code>test("cannot retry from idle", () =&gt; {
  const actor = createActor(userMachine).start();
  actor.send({ type: "RETRY" });
  expect(actor.getSnapshot().value).toBe("idle");
});</code></pre>
<p>
  A machine is a pure description, so you can test the logic without rendering:
  send events, assert on the state. And because the definition is data, tools can
  draw it as a diagram &mdash; Stately's editor does, and the picture is the
  quickest way to show a product manager the case nobody specified.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "A state machine replaces a pile of booleans with one state from a fixed list
    and explicit transitions, so impossible combinations cannot be reached and an
    event in the wrong state is ignored by construction; I would use a reducer or a
    union type for simple cases and XState when there are timeouts, guards, nesting
    or several actors involved."
  </p>
</div>`,
};
