import type { Chapter } from "../types";

export const reactStateLibraries: Chapter = {
  id: "react-state-libraries",
  num: "I12",
  title: "State management libraries",
  short: "State libraries",
  levels: ["intermediate"],
  practice: ["ex-react-create-store"],
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
  middleware, persistence &mdash; is convenience on top. Underneath, every
  library here does the same thing: it keeps state outside React and subscribes
  through <a href="/react/react-sync-external-store">useSyncExternalStore</a>,
  comparing the selected value before deciding to re-render.
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

<h3>The selector trap, and useShallow</h3>
<pre><code><span class="c">// ✗ a new object on every call</span>
const { items, add } = useCart((s) =&gt; ({ items: s.items, add: s.add }));

<span class="c">// ✓ compare the fields, not the wrapper</span>
import { useShallow } from "zustand/react/shallow";
const { items, add } = useCart(useShallow((s) =&gt; ({ items: s.items, add: s.add })));

<span class="c">// ✓ or just select twice</span>
const items = useCart((s) =&gt; s.items);
const add = useCart((s) =&gt; s.add);</code></pre>
<p>
  The store compares what your selector returns with what it returned last time,
  by reference. An object literal is new every call, so it always looks changed.
  In Zustand 4 that meant a wasted re-render on every store update. In Zustand 5
  it is worse: the component loops until React stops it with
  <b>"Maximum update depth exceeded"</b>. <code>useShallow</code> compares the
  object's properties one level deep instead, which is what you meant.
</p>

<h3>Reading the store outside React</h3>
<pre><code>useCart.getState().items;                          <span class="c">// current value, no subscription</span>
useCart.setState({ items: [] });                   <span class="c">// e.g. on logout</span>
const unsubscribe = useCart.subscribe((s) =&gt; save(s.items));</code></pre>
<p>
  Because the store lives outside the component tree, an API client, a
  websocket handler or a test can read and write it directly. That is also the
  honest answer to "how do I reset state between tests": call
  <code>setState</code> with the initial value in a <code>beforeEach</code>.
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

export const store = configureStore({ reducer: { cart: cartSlice.reducer } });
export type RootState = ReturnType&lt;typeof store.getState&gt;;
export type AppDispatch = typeof store.dispatch;

<span class="c">// hooks.ts — typed once, used everywhere</span>
export const useAppSelector = useSelector.withTypes&lt;RootState&gt;();
export const useAppDispatch = useDispatch.withTypes&lt;AppDispatch&gt;();</code></pre>
<p>
  Modern Redux is not the Redux with the bad reputation. Toolkit removes the
  boilerplate: no action constants, no switch statements, no manual immutability
  &mdash; Immer lets you write mutations and produces an immutable result. The
  types are inferred from the store itself, so the only annotation you write is
  the pair of typed hooks.
</p>
<p>
  What it still gives you that nothing else does: a serialisable action log,
  time-travel devtools, and middleware. On a large team, being able to replay
  exactly what a user did is worth real money.
</p>

<h3>RTK Query: the server-state half of Redux</h3>
<pre><code>const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Post"],
  endpoints: (build) =&gt; ({
    getPosts: build.query({ query: () =&gt; "posts", providesTags: ["Post"] }),
    addPost: build.mutation({
      query: (body) =&gt; ({ url: "posts", method: "POST", body }),
      invalidatesTags: ["Post"],
    }),
  }),
});

const { data, isLoading } = api.useGetPostsQuery();</code></pre>
<p>
  If a codebase is already on Redux, this is how it stops hand-writing loading
  flags: RTK Query ships inside Redux Toolkit and does the job a query cache
  does &mdash; caching, deduplication, and refetching whatever a mutation
  invalidates. The decision between it and TanStack Query is mostly about
  whether Redux is already there.
</p>

<h3>Jotai: atoms</h3>
<pre><code>const countAtom = atom(0);
const doubledAtom = atom((get) =&gt; get(countAtom) * 2);   <span class="c">// derived</span>

const [count, setCount] = useAtom(countAtom);</code></pre>
<p>
  A bottom-up model: many small independent pieces rather than one tree, with
  derived atoms recomputing automatically. It suits state that is fine-grained
  and interdependent &mdash; a canvas editor, a spreadsheet &mdash; more than it
  suits a handful of app-wide flags.
</p>
<p class="sub">
  Recoil introduced this model, but Meta archived its repository on 1 January
  2025 and it is no longer maintained. Treat Recoil in a codebase as a
  migration item; Jotai is the usual destination because the concepts map almost
  one to one.
</p>

<h3>Comparison</h3>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Context</th><th>Zustand</th><th>Redux Toolkit</th><th>Jotai</th></tr></thead>
<tbody>
<tr><td>Selectors</td><td><span class="chip tone-bad">no</span></td><td><span class="chip tone-yes">yes</span></td><td><span class="chip tone-yes">yes</span></td><td>atoms are the selector</td></tr>
<tr><td>Boilerplate</td><td>low</td><td>very low</td><td>moderate</td><td>low</td></tr>
<tr><td>Devtools</td><td>&mdash;</td><td>basic</td><td>excellent</td><td>basic</td></tr>
<tr><td>Provider needed</td><td>yes</td><td>no</td><td>yes</td><td>optional</td></tr>
<tr><td>Server data built in</td><td>no</td><td>no</td><td>RTK Query</td><td>no</td></tr>
<tr><td>Best for</td><td>rarely-changing values</td><td>most apps that need a store</td><td>large teams, audit trails</td><td>fine-grained derived state</td></tr>
</tbody>
</table></div>

<h3>Choosing, in the order to ask</h3>
<ol>
  <li><b>Is it server data?</b> A query cache. Stop here for most of it.</li>
  <li><b>Should a link reproduce it?</b> The URL.</li>
  <li><b>Does only one subtree read it?</b> Local state, lifted as far as needed and no further.</li>
  <li><b>Does it change rarely?</b> Context is fine &mdash; theme, locale, the signed-in user.</li>
  <li><b>Is it shared and frequently changing?</b> Now a store. Zustand by default, Redux Toolkit if the team wants its devtools and conventions, Jotai if the state is a graph of derived values.</li>
</ol>

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
  And do not store what you can compute &mdash; keep <code>items</code> and
  derive the total in a selector, or the two will eventually disagree.
</p>

<h3>Persisting</h3>
<pre><code>const useCart = create(persist(
  (set) =&gt; ({ items: [], add: ... }),
  { name: "cart", version: 2, partialize: (s) =&gt; ({ items: s.items }) }
));</code></pre>
<p>
  Persist deliberately and narrowly. Rehydrating the whole store means old
  shapes from a previous version of your app arriving in new code &mdash; so
  persist the few fields that matter and version them. Bumping
  <code>version</code> lets a <code>migrate</code> function convert, or
  discard, what an older release saved.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "The reason to use a store rather than context is selectors — context
    re-renders every consumer on any change, a store re-renders only what read
    the changed slice, as long as the selector returns a stable value. But most
    of what ends up in stores is server state, which belongs in a query cache,
    so the honest first step is separating those."
  </p>
</div>`,
};
