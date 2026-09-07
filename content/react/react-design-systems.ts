import type { Chapter } from "../types";

export const reactDesignSystems: Chapter = {
  id: "react-design-systems",
  num: "A14",
  title: "Design systems",
  short: "Design systems",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Constraints that make the common thing easy and the inconsistent thing hard.",
  body: `<h3>Tokens are the foundation</h3>
<pre><code>:root {
  --space-1: 4px;  --space-2: 8px;  --space-3: 16px;
  --color-fg: #1f3a73;
  --color-bg: #fffdf6;
  --radius-md: 12px;
}
@media (prefers-color-scheme: dark) {
  :root { --color-fg: #d9e5fb; --color-bg: #191d25; }
}</code></pre>
<p>
  A finite set of choices. When spacing is a scale rather than a number, nobody
  writes <code>margin: 13px</code>, and a theme change is a handful of
  redefinitions rather than a search across the codebase.
</p>
<p class="sub">
  CSS custom properties cascade and can be swapped at runtime, which is why
  they beat JavaScript theme objects for this &mdash; no re-render, and they
  work in Server Components where there is no client theme provider.
</p>

<h3>Variants, typed</h3>
<pre><code>const button = cva("btn", {
  variants: {
    variant: { primary: "btn--primary", ghost: "btn--ghost" },
    size: { sm: "btn--sm", md: "btn--md" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

type ButtonProps = React.ComponentProps&lt;"button"&gt; &amp; VariantProps&lt;typeof button&gt;;

function Button({ variant, size, className, ...rest }: ButtonProps) {
  return &lt;button className={button({ variant, size, className })} {...rest} /&gt;;
}</code></pre>
<p>
  The variants become a union type, so <code>variant="primry"</code> is a
  compile error rather than a silently unstyled button. And extending
  <code>ComponentProps&lt;"button"&gt;</code> means every real button attribute
  is typed without listing one.
</p>

<h3>The escape hatch problem</h3>
<div class="bx is-prim">
  <span class="ttl">A system with no escape hatch gets forked</span>
  <p>
    Someone will need a button with 2px more padding for one screen. If the
    system forbids it, they copy the component and change it &mdash; and now
    there are two buttons, one of which nobody maintains. Accept
    <code>className</code> and merge it. Make the common path easy, not the
    unusual one impossible.
  </p>
</div>
<pre><code>function Button({ className, ...rest }) {
  return &lt;button className={twMerge("btn btn--primary", className)} {...rest} /&gt;;
}</code></pre>
<p>
  A merge utility matters because naive concatenation leaves both classes and
  the loser depends on stylesheet order. <code>twMerge</code> resolves
  conflicts so the caller's class actually wins.
</p>

<h3>Composition over configuration, again</h3>
<pre><code>&lt;Card
  title="Notes" showFooter footerAlign="right"
  icon={&lt;Star /&gt;} iconPosition="left" compact bordered
/&gt;                                        <span class="c">// ✗ every new design adds a prop</span>

&lt;Card&gt;
  &lt;Card.Header&gt;&lt;Star /&gt; Notes&lt;/Card.Header&gt;
  &lt;Card.Body&gt;...&lt;/Card.Body&gt;
  &lt;Card.Footer align="right"&gt;...&lt;/Card.Footer&gt;
&lt;/Card&gt;                                   <span class="c">// ✓ arrangement is the caller's</span></code></pre>
<p>
  Boolean props that turn parts on and off are a sign the component should take
  children. <a href="/react/react-advanced-patterns">Compound components</a>
  are how design systems stay flexible without a prop for every layout anybody
  ever wants.
</p>

<h3>Build on a headless base</h3>
<p>
  The hard parts of a select, a dialog, a tooltip or a date picker are roving
  focus, typeahead, collision detection, Escape handling and aria wiring. That
  is months of work and it is not where a design system adds value.
</p>
<p>
  Radix, React Aria or Headless UI give you all of it unstyled. Your system
  becomes tokens, variants and composition on top &mdash; which is the part that
  is actually yours.
</p>

<h3>Making it usable by other people</h3>
<ul>
  <li><b>Every component in one file per component</b>, named after the file.</li>
  <li><b>A live playground</b> &mdash; Storybook or equivalent. A component nobody can see is a component nobody uses.</li>
  <li><b>Document the props that matter</b>, and the ones that do not exist on purpose.</li>
  <li><b>Version it,</b> and treat a prop rename as a breaking change. Consumers cannot fix what they cannot see coming.</li>
  <li><b>Test behaviour, not markup.</b> Snapshot tests of a design system are a permanent tax on changing anything.</li>
</ul>

<h3>Server Components change the rules slightly</h3>
<p>
  Runtime CSS-in-JS does not work in a Server Component &mdash; there is no
  client to inject styles from. Systems built on styled-components are moving to
  CSS Modules, Tailwind, or zero-runtime libraries that extract styles at build
  time. If you are choosing today, pick something that works in both worlds.
</p>

<h3>Knowing when not to build one</h3>
<p>
  A design system is a product with users, and its users are your colleagues. It
  needs documentation, a release process, and someone to answer questions. On a
  team of three with one application, a folder of shared components and a token
  file is the right size &mdash; and calling it a design system is what makes it
  expensive.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Tokens first, because a finite scale is what makes consistency the default;
    variants typed so a wrong one is a compile error; composition rather than
    boolean props so new layouts do not need new props; and always an escape
    hatch, because a system that cannot be adjusted gets copied instead."
  </p>
</div>`,
};
