import type { Chapter } from "../types";

export const reactShadcn: Chapter = {
  id: "react-shadcn",
  num: "I22",
  title: "shadcn/ui",
  short: "shadcn/ui",
  levels: ["intermediate"],
  practice: ["ex-react-variants"],
  ready: true,
  subtitle: "Not a component library you install, but components whose source you copy into your project and own.",
  body: `<h3>What it actually is</h3>
<p>
  Most UI kits are packages: you install <code>@mui/material</code>, import a
  <code>Button</code>, and customise it through props and theme overrides.
  shadcn/ui is the opposite. There is no package to import. A command-line tool
  <b>copies the component's source file into your repository</b>, and from that
  moment it is your code. In its own words, it is "how you build your component
  library".
</p>
<pre><code>npx shadcn@latest init            <span class="c">// writes components.json, adds the utilities and CSS variables</span>
npx shadcn@latest add button dialog   <span class="c">// copies components/ui/button.tsx and dialog.tsx</span></code></pre>
<p>
  If you want a button to behave differently, you open <code>button.tsx</code> and
  change it. There is no override API to learn, no wrapper to write, and no
  waiting for a maintainer to expose a prop. That single property explains both
  why people like it and where its costs are.
</p>

<h3>The stack underneath</h3>
<div class="table-scroll"><table>
<thead><tr><th>Layer</th><th>What does it</th></tr></thead>
<tbody>
<tr><td>Behaviour and accessibility</td><td>A headless primitives library &mdash; <b>Base UI</b> or <b>Radix UI</b>. Focus trapping, keyboard handling, ARIA and portals live here.</td></tr>
<tr><td>Styling</td><td>Tailwind CSS classes, driven by semantic CSS variables such as <code>--background</code> and <code>--primary</code></td></tr>
<tr><td>Variants</td><td>Usually <code>class-variance-authority</code> (<code>cva</code>) for size and variant props</td></tr>
<tr><td>Class merging</td><td>A small <code>cn()</code> helper: <code>clsx</code> to combine, <code>tailwind-merge</code> to resolve conflicts</td></tr>
</tbody>
</table></div>
<pre><code><span class="c">// lib/utils.ts</span>
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

cn("px-2 py-1", "px-4")    <span class="c">// "py-1 px-4" — the later padding wins, instead of both applying</span></code></pre>
<p>
  <code>cn</code> exists because Tailwind classes are not ordered by where they
  appear in the attribute; two conflicting utilities are resolved by stylesheet
  order, which is arbitrary from your point of view. <code>tailwind-merge</code>
  knows which classes conflict and keeps the last.
</p>

<div class="bx is-prim">
  <span class="ttl">Base UI is now the default</span>
  <p>
    Since July 2026 a new project initialises with <b>Base UI</b> as its
    primitives; <b>Radix</b> remains fully supported and every update ships for
    both. Choose it with <code>npx shadcn@latest init -b radix</code>, and the
    docs show tabs for each. Existing Radix projects need no migration. The
    practical difference you will meet is composition: Radix components take an
    <code>asChild</code> prop to render as your own element, while Base UI uses a
    <code>render</code> prop for the same job.
  </p>
</div>

<h3>components.json</h3>
<pre><code>{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": { "css": "app/globals.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": { "components": "@/components", "ui": "@/components/ui", "utils": "@/lib/utils" }
}</code></pre>
<p>
  The file tells the CLI where things go and how to write them. <code>rsc</code>
  makes it add <code>"use client"</code> where a component needs it. The
  <code>aliases</code> decide where files land and how imports are rewritten.
  <code>cssVariables: true</code> produces semantic tokens &mdash;
  <code>background</code>, <code>foreground</code>, <code>primary</code> &mdash;
  which is what makes a dark theme a second set of values rather than a second
  set of components. The <code>baseColor</code> cannot be changed after
  initialisation.
</p>

<h3>A component you own</h3>
<pre><code>const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium focus-visible:ring-2 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border bg-background hover:bg-accent",
        ghost: "hover:bg-accent",
      },
      size: { default: "h-9 px-4", sm: "h-8 px-3", lg: "h-10 px-6" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Button({ className, variant, size, ...props }) {
  return &lt;button className={cn(buttonVariants({ variant, size }), className)} {...props} /&gt;;
}</code></pre>
<p>
  The whole component is a table of class names and a function that picks from
  it. Adding a <code>destructive</code> variant is one more line in a file in
  your own repo. And because <code>className</code> goes through <code>cn</code>
  last, a caller can still override a single style at the use site.
</p>

<h3>Registries: how it is distributed</h3>
<p>
  The CLI does not talk to a private list; it reads a <b>registry</b>, a set of
  JSON files describing components, their dependencies and where they install.
  The <code>registries</code> field in <code>components.json</code> lets you add
  others, including private ones with authentication. That is how a company
  ships its own design system to every internal app with the same
  <code>add</code> command &mdash; and it is why the project describes itself as
  a distribution system as much as a component set.
</p>

<h3>The trade, stated honestly</h3>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Package (MUI, Mantine, Chakra)</th><th>shadcn/ui</th></tr></thead>
<tbody>
<tr><td>Customising</td><td>props, theme, overrides</td><td>edit the file</td></tr>
<tr><td>Bug fixes and new features</td><td>bump the version</td><td>diff and merge, like any code you own</td></tr>
<tr><td>Bundle</td><td>tree-shaken from a dependency</td><td>only the components you added</td></tr>
<tr><td>Accessibility</td><td>maintained for you</td><td>inherited from the primitives; your edits are on you</td></tr>
<tr><td>Consistency</td><td>enforced by the API</td><td>enforced by discipline; copies drift</td></tr>
<tr><td>Lock-in</td><td>the library's API everywhere</td><td>none &mdash; it is your code</td></tr>
</tbody>
</table></div>
<p>
  The trade is <b>control against maintenance</b>. It suits a product with its own
  design language, and a team that will actually read the diff when the upstream
  component changes. It suits a prototype that needs to look finished by Friday
  just as well, which is much of why it spread. It is a poor fit when nobody
  wants to own UI code, or when strict consistency across many teams matters more
  than flexibility &mdash; that is what a versioned package is for.
</p>

<h3>Habits that keep it healthy</h3>
<ul>
  <li><b>Keep <code>components/ui</code> generic.</b> Put product-specific behaviour in wrapper components beside it, so the copied files stay close to upstream and easy to update.</li>
  <li><b>Do not delete the accessibility behaviour</b> while restyling. The focus ring, the <code>aria-*</code> attributes and the keyboard handlers are why you chose primitives.</li>
  <li><b>Re-add to update.</b> There is no version to bump; to take an upstream fix, run <code>add</code> again on a branch and read the diff before accepting it.</li>
  <li><b>Understand what you copied.</b> The files are short. If a dialog behaves oddly, the answer is in a file you can open, which is the whole advantage.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "shadcn/ui is a distribution mechanism, not a library: a CLI copies
    accessible components — built on Base UI or Radix primitives, styled with
    Tailwind and CSS variables — into my repo, so I customise by editing source
    rather than through overrides, and the price is that updates and drift become
    my job."
  </p>
</div>`,
};
