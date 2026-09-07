import type { Chapter } from "../types";

export const reactAdvancedPatterns: Chapter = {
  id: "react-advanced-patterns",
  num: "A11",
  title: "Advanced component patterns",
  short: "Component patterns",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "The four shapes behind every component library you have imported.",
  body: `<h3>Compound components</h3>
<pre><code>&lt;Tabs defaultValue="a"&gt;
  &lt;Tabs.List&gt;
    &lt;Tabs.Trigger value="a"&gt;First&lt;/Tabs.Trigger&gt;
    &lt;Tabs.Trigger value="b"&gt;Second&lt;/Tabs.Trigger&gt;
  &lt;/Tabs.List&gt;
  &lt;Tabs.Panel value="a"&gt;...&lt;/Tabs.Panel&gt;
&lt;/Tabs&gt;</code></pre>
<p>
  The parent owns the state and shares it through context; the children are
  layout the caller arranges. Compare with the alternative &mdash;
  <code>&lt;Tabs items={[...]} renderPanel={...} activeIndex={...} /&gt;</code>
  &mdash; which needs a new prop for every arrangement anyone ever wants.
</p>
<pre><code>const TabsContext = createContext(null);

function Tabs({ defaultValue, children }) {
  const [value, setValue] = useState(defaultValue);
  const ctx = useMemo(() =&gt; ({ value, setValue }), [value]);
  return &lt;TabsContext value={ctx}&gt;{children}&lt;/TabsContext&gt;;
}

Tabs.Trigger = function Trigger({ value, children }) {
  const ctx = useContext(TabsContext);
  return (
    &lt;button role="tab" aria-selected={ctx.value === value}
            onClick={() =&gt; ctx.setValue(value)}&gt;{children}&lt;/button&gt;
  );
};</code></pre>
<p class="sub">
  The trade is that the children are coupled to the parent by context, so using
  <code>Tabs.Trigger</code> outside <code>Tabs</code> must fail with a clear
  error. That is what the throwing custom hook from
  <a href="/react/react-context">the context chapter</a> is for.
</p>

<h3>Headless components</h3>
<pre><code>function useDisclosure(initial = false) {
  const [isOpen, setOpen] = useState(initial);
  return {
    isOpen,
    open: useCallback(() =&gt; setOpen(true), []),
    close: useCallback(() =&gt; setOpen(false), []),
    triggerProps: { "aria-expanded": isOpen, onClick: () =&gt; setOpen((v) =&gt; !v) },
  };
}</code></pre>
<p>
  Behaviour, accessibility and state with no markup at all &mdash; you render
  whatever you want and spread the props. This is the model behind Radix,
  Headless UI, TanStack Table and React Aria, and it is the answer to "a
  component library that never matches our design".
</p>
<p>
  The hard part of a dropdown was never the markup. It is roving focus, typeahead,
  Escape, click-outside, aria attributes, and returning focus on close. A headless
  library gives you exactly that and leaves the appearance alone.
</p>

<h3>Slots and asChild</h3>
<pre><code>&lt;Button asChild&gt;
  &lt;Link to="/settings"&gt;Settings&lt;/Link&gt;      <span class="c">// renders one anchor, styled as a button</span>
&lt;/Button&gt;</code></pre>
<p>
  Without this, a button-styled link is either a nested
  <code>&lt;button&gt;&lt;a&gt;&lt;/a&gt;&lt;/button&gt;</code> &mdash; invalid
  HTML and broken for keyboards &mdash; or a duplicated set of styles.
  <code>asChild</code> merges the component's props onto the child element
  instead of rendering a wrapper.
</p>

<h3>Controlled and uncontrolled, in one component</h3>
<pre><code>function useControllable({ value, defaultValue, onChange }) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = value !== undefined;

  return [
    isControlled ? value : uncontrolled,
    (next) =&gt; {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
  ];
}</code></pre>
<p>
  Every serious library supports both: <code>defaultValue</code> for the easy
  case, <code>value</code> plus <code>onChange</code> when the caller needs
  control. The rule is that a component must not switch modes during its life
  &mdash; going from <code>undefined</code> to a value is the React warning
  everyone has seen.
</p>

<h3>Render props, and why hooks replaced most of them</h3>
<pre><code>&lt;MouseTracker render={({ x, y }) =&gt; &lt;Dot x={x} y={y} /&gt;} /&gt;   <span class="c">// old</span>
const { x, y } = useMouse();                                   <span class="c">// now</span></code></pre>
<p>
  Hooks share logic without adding tree depth, so most render props became
  hooks. They survive where the parent must control <em>when</em> and
  <em>how often</em> the children render &mdash; a virtualised list rendering
  only visible rows, or a component that renders its children twice for
  measurement.
</p>

<h3>Higher-order components</h3>
<pre><code>const Enhanced = withAuth(withTheme(withRouter(MyComponent)));   <span class="c">// where does a prop come from?</span></code></pre>
<p>
  Largely historical. They obscure prop origins, stack up in DevTools, and
  require care with <code>displayName</code> and static hoisting. You will meet
  them in older codebases and in a few libraries; you should not write new ones.
</p>

<h3>Choosing</h3>
<div class="table-scroll"><table>
<thead><tr><th>You want</th><th>Pattern</th></tr></thead>
<tbody>
<tr><td>Callers to arrange the pieces</td><td>Compound components</td></tr>
<tr><td>Behaviour without imposing markup</td><td>Headless hook</td></tr>
<tr><td>Styling applied to somebody else's element</td><td><code>asChild</code> / slot</td></tr>
<tr><td>Both easy defaults and full control</td><td>Controllable state</td></tr>
<tr><td>To control when children render</td><td>Render prop</td></tr>
<tr><td>To share logic</td><td>A custom hook, every time</td></tr>
</tbody>
</table></div>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Compound components move layout back to the caller, headless hooks give you
    the hard part — focus, keyboard, aria — without imposing markup, and
    <code>asChild</code> avoids the invalid nesting you get styling a link as a
    button. Render props survive only where the parent must control when
    children render; everything else about sharing logic is a hook now."
  </p>
</div>`,
};
