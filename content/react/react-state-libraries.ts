import type { Chapter } from "../types";

export const reactStateLibraries: Chapter = {
  id: "react-state-libraries",
  num: "I12",
  title: "State management libraries",
  short: "State libraries",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "What a store gives you that context cannot: selectors.",
  body: `<h3>The one thing context cannot do</h3>
<p>
  Context has no selectors. When the provider value changes, <b>every</b>
  consumer re-renders &mdash; even one that reads a field which did not change.
  For a theme that is irrelevant. For a cart that updates on every quantity
  change, it means the whole app re-renders for one number.
</p>
<pre><code>const name = useStore((s) =&gt; s.user.name);   <span class="c">// re-renders only when name changes</span></code></pre>
<p>
  That subscription is what you are buying. Everything else &mdash; devtools,
  middleware, persistence &mdash; is convenience on top.
</p>

<div class="bx is-prim">
  <span class="ttl">Before reaching for one</span>
  <p>
    Ask what kind of state it is. If it came from a server, the answer is a
    <a href="/react/react-server-state">query cache</a>, not a store &mdash; and
    that removes most of what people put in Redux. If it should survive a
    refresh or a shared link, it belongs in the URL. What is left is genuinely
    shared, genuinely client-side, and usually much smaller than expected.
  </p>
</div>

<h3>Zustand</h3>
<pre><code>const useCart = create((set, get) =&gt; ({
  items: [],
  add: (item) =&gt; set((s) =&gt; ({ items: [...s.items, item] })),
  remove: (id) =&gt; set((s) =&gt; ({ items: s.items.filter((i) =&gt; i.id !== id) })),
  total: () =&gt; get().items.reduce((sum, i) =&gt; sum + i.price, 0),
}));

function Badge() {
  const count = useCart((s) =&gt; s.items.length);   <span class="c">// subscribes to length only</span>
  return &lt;span&gt;{count}&lt;/span&gt;;
}</code></pre>
<p>
  No provider, no reducer, no action types. The store is a hook. It is the
  default choice for new projects that need a store at all &mdash; a few
  kilobytes, and the API above is most of the API.
</p>
<p class="sub">
  One trap: returning a new object from a selector
  (<code>(s) =&gt; ({ a: s.a, b: s.b })</code>) creates a new reference every
  time and re-renders always. Select primitives, or use the shallow comparator.
</p>

<h3>Redux Toolkit</h3>
<pre><code>const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    added(state, action) {
      state.items.push(action.payload);    <span class="c">// Immer — safe to "mutate"</span>
    },
  },
});

const count = useSelector((s) =&gt; s.cart.items.length);
const dispatch = useDispatch();</code></pre>
<p>
  Modern Redux is not the Redux with the bad reputation. Toolkit removes the
  boilerplate: no action constants, no switch statements, no manual immutability
  &mdash; Immer lets you write mutations and produces an immutable result.
</p>
<p>
  What it still gives you that nothing else does: a serialisable action log,
  time-travel devtools, and middleware. On a large team, being able to replay
  exactly what a user did is worth real money.
</p>

<h3>Jotai and Recoil: atoms</h3>
<pre><code>const countAtom = atom(0);
const doubledAtom = atom((get) =&gt; get(countAtom) * 2);   <span class="c">// derived</span>

const [count, setCount] = useAtom(countAtom);</code></pre>
<p>
  A bottom-up model: many small independent pieces rather than one tree, with
  derived atoms recomputing automatically. It suits state that is fine-grained
  and interdependent &mdash; a canvas editor, a spreadsheet &mdash; more than it
  suits a handful of app-wide flags.
</p>

<h3>Comparison</h3>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Context</th><th>Zustand</th><th>Redux Toolkit</th><th>Jotai</th></tr></thead>
<tbody>
<tr><td>Selectors</td><td><span class="chip tone-bad">no</span></td><td><span class="chip tone-yes">yes</span></td><td><span class="chip tone-yes">yes</span></td><td>atoms are the selector</td></tr>
<tr><td>Boilerplate</td><td>low</td><td>very low</td><td>moderate</td><td>low</td></tr>
<tr><td>Devtools</td><td>&mdash;</td><td>basic</td><td>excellent</td><td>basic</td></tr>
<tr><td>Provider needed</td><td>yes</td><td>no</td><td>yes</td><td>optional</td></tr>
<tr><td>Best for</td><td>rarely-changing values</td><td>most apps that need a store</td><td>large teams, audit trails</td><td>fine-grained derived state</td></tr>
</tbody>
</table></div>

<h3>Keep the store small</h3>
<p>
  The failure mode of every store is the same: it becomes the place where all
  state goes, including things that should be local, derived, or on the server.
  A store holding <code>isModalOpen</code> has taken a component's private
  business and made it global &mdash; now anything can open that modal, and
  finding out what did is a search across the codebase.
</p>
<p>
  Rule of thumb: if only one subtree reads it, it does not belong in the store.
</p>

<h3>Persisting</h3>
<pre><code>const useCart = create(persist(
  (set) =&gt; ({ items: [], add: ... }),
  { name: "cart", partialize: (s) =&gt; ({ items: s.items }) }
));</code></pre>
<p>
  Persist deliberately and narrowly. Rehydrating the whole store means old
  shapes from a previous version of your app arriving in new code &mdash; so
  persist the few fields that matter and version them.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "The reason to use a store rather than context is selectors — context
    re-renders every consumer on any change, a store re-renders only what read
    the changed slice. But most of what ends up in stores is server state, which
    belongs in a query cache, so the honest first step is separating those."
  </p>
</div>`,
};
