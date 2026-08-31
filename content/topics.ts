import type { TopicsData } from "./types";

export const topics: TopicsData = {
  levels: [
    {
      id: "beginner",
      name: "Beginner",
      mark: "1",
      tagline: "I can write working code.",
      blurb:
        "Start at the bottom of the ladder. Types, values, operators, functions — the words every other explanation assumes you already know.",
      bullets: [
        "You have written a few scripts",
        "<code>this</code>, closures and hoisting still feel like magic",
        "You want the foundation, in order, once",
      ],
      checkpoint: "you can build a to-do list app with localStorage and an API call, without copying a tutorial.",
      syllabus: [
        {
          title: "Setup & mental model",
          chapter: "setup-mental-model",
          items: [
            "What JS is: single-threaded, dynamic, weakly typed",
            "Engine vs runtime (browser / Node)",
            "Where code runs: console, <script>, Node",
            "var / let / const, naming, comments",
            "'use strict', script vs module",
          ],
        },
        {
          title: "Types & values",
          chapter: "types-values",
          items: [
            "7 primitives + object",
            "typeof, null vs undefined",
            "Numbers: NaN, Infinity, parseInt/parseFloat, toFixed",
            "Strings: template literals, common methods, escaping",
            "Booleans, truthy/falsy (the 8)",
            "Explicit conversion: String(), Number(), Boolean()",
            "== vs ===",
          ],
        },
        {
          title: "Operators & flow",
          chapter: "operators-flow",
          items: [
            "Arithmetic, assignment, comparison, logical",
            "&& / || short-circuit, ??, ?., ternary",
            "if/else, switch",
            "Loops: for, while, for...of, for...in, break/continue",
          ],
        },
        {
          title: "Functions (first half)",
          chapter: "functions-basics",
          items: [
            "Declarations vs expressions vs arrows",
            "Parameters, arguments, return, default params",
            "Scope basics, hoisting basics",
          ],
        },
        {
          title: "Objects & arrays (first half)",
          chapter: "objects-arrays-basics",
          items: [
            "Object literals, dot vs bracket, nesting",
            "Array basics, indexing, length",
            "push/pop/shift/unshift/slice/splice/indexOf/includes",
            "map / filter / find / forEach / reduce (basic use)",
            "Destructuring, spread/rest (basic)",
          ],
        },
        {
          title: "DOM & events",
          chapter: "dom-events",
          items: [
            "Selecting: querySelector, getElementById",
            "Reading/changing text, HTML, attributes, classes",
            "Creating, appending, removing nodes",
            "addEventListener, the event object, preventDefault",
            "Forms and input values",
          ],
        },
        {
          title: "Basic async",
          chapter: "basic-async",
          items: ["setTimeout / setInterval", "fetch + .then() (surface level)", "JSON.parse / JSON.stringify"],
        },
        {
          title: "Errors & tools",
          chapter: "errors-tools",
          items: ["try/catch, reading a stack trace", "console.log/table/error, browser DevTools basics"],
        },
      ],
    },
    {
      id: "intermediate",
      name: "Intermediate",
      mark: "2",
      tagline: "I understand why it works.",
      blurb:
        "You know the syntax. Now learn the machinery: closures you can explain, objects and prototypes, and the event loop that decides what runs when.",
      bullets: [
        "Comfortable with functions, arrays and objects",
        "Promises work, until they don't",
        "You want to stop memorising and start reasoning",
      ],
      checkpoint:
        "you can explain closures and the event loop to someone else, and debug an async race condition without guessing.",
      syllabus: [
        {
          title: "Scope & functions, properly",
          chapter: "scope-functions",
          items: [
            "Lexical scope, scope chain, TDZ, shadowing",
            "Closures — and their real uses (factories, privacy, memoize, debounce/throttle, once)",
            "this — all 5 binding rules, losing this",
            "call / apply / bind",
            "IIFE, arguments, fn.length, fn.name",
            "Higher-order functions, currying, partial application, composition",
            "Callbacks, error-first convention, callback hell",
            "Recursion + base cases",
          ],
        },
        {
          title: "Objects deeply",
          chapter: "objects-deep",
          items: [
            "Computed keys, shorthand methods, getters/setters",
            "Object.keys/values/entries/assign/fromEntries/hasOwn",
            "Shallow vs deep copy, structuredClone",
            "Nested destructuring, defaults in params",
            "Mutating vs non-mutating array methods",
            "Array.from, flat/flatMap, sort comparators, at()",
            "Map, Set, WeakMap, WeakSet",
            "JSON edge cases: replacer, reviver, what gets dropped",
            "Optional chaining on deep data",
          ],
        },
        {
          title: "Prototypes & OOP",
          chapter: "prototypes-oop",
          items: [
            "Prototype chain, __proto__ vs prototype",
            "Object.create, getPrototypeOf, instanceof, hasOwnProperty",
            "Constructor functions, what new does (4 steps)",
            "class, extends, super, static, #private, getters/setters",
            "Composition vs inheritance, mixins",
          ],
        },
        {
          title: "Async, properly",
          chapter: "async-properly",
          items: [
            "Event loop: call stack, task vs microtask queue, render step",
            "Promises: states, chaining, error propagation, .finally",
            "Promise.all / allSettled / race / any",
            "async / await, try/catch, sequential vs parallel",
            "AbortController, timeouts, retries",
            "fetch in depth: res.ok, headers, methods, CORS basics",
          ],
        },
        {
          title: "Modules & tooling",
          chapter: "modules-tooling",
          items: [
            "ESM import/export, default vs named, live bindings",
            "CommonJS vs ESM",
            "Dynamic import(), code splitting",
            "npm, package.json, semver, lockfiles",
            "A bundler (Vite/webpack), transpiling, source maps",
            "Linting + formatting (ESLint, Prettier)",
          ],
        },
        {
          title: "Regex, dates & browser APIs",
          chapter: "regex-dates-apis",
          items: [
            "Regex — literals, groups, flags, match/replace/matchAll",
            "Dates — Date, timezones, why everyone uses a library, Intl",
            "Browser APIs — localStorage/sessionStorage, URL/URLSearchParams, History API, IntersectionObserver",
            "Events in depth — bubbling, capturing, delegation, stopPropagation, custom events",
          ],
        },
        {
          title: "Error handling & debugging",
          chapter: "error-handling-debugging",
          items: [
            "Error handling patterns — custom error classes, cause, unhandled rejections",
            "Immutability and why frameworks care",
            "Debugging — breakpoints, watch, conditional breakpoints, network tab",
          ],
        },
        {
          title: "Real-time connections",
          chapter: "realtime-connections",
          items: [
            "WebSocket — handshake, onmessage, sending data, reconnect logic",
            "Server-Sent Events / EventSource — one-way, auto-reconnect built in",
            "Long polling — when it's still the right answer",
            "WebSocket vs SSE vs polling — a decision table",
          ],
        },
        {
          title: "Offline & storage",
          chapter: "offline-storage",
          items: [
            "IndexedDB — past localStorage's size limit, structured and binary data",
            "The Cache API",
            "Service Worker lifecycle — install, activate, fetch",
            "PWA basics — manifest, installability",
            "navigator.onLine, background sync",
            "Storage comparison: localStorage vs sessionStorage vs IndexedDB vs Cache vs cookies",
          ],
        },
      ],
    },
    {
      id: "advanced",
      name: "Advanced",
      mark: "3",
      tagline: "I can reason about the engine and the ecosystem.",
      blurb:
        "Prototypes, microtasks, modules, memory and how V8 actually stores your objects. The layers almost nobody can explain out loud.",
      bullets: [
        "You can already explain closures and <code>this</code>",
        "You debug performance and memory, not just bugs",
        "You want the why under every behaviour",
      ],
      checkpoint:
        "you can find a memory leak from a heap snapshot, explain why a function deoptimized, and defend an architectural choice with tradeoffs.",
      syllabus: [
        {
          title: "Engine & memory",
          chapter: "engine-memory",
          items: [
            "Stack vs heap, execution contexts, environment records",
            "GC: reachability, mark-and-sweep, generational collection",
            "Memory leaks: timers, detached nodes, closures, unbounded caches",
            "Heap snapshots, allocation timelines",
            "Hidden classes, inline caches, monomorphic vs megamorphic",
            "JIT, deoptimization, why shape and type stability matter",
          ],
        },
        {
          title: "Advanced async",
          chapter: "advanced-async",
          items: [
            "Microtask starvation, queueMicrotask, process.nextTick",
            "Node event loop phases, setImmediate",
            "Generators, yield*, sending values in",
            "Async generators, for await...of",
            "Streams (Web Streams / Node streams), backpressure",
            "Web Workers, SharedArrayBuffer, Atomics",
            "Concurrency control: semaphores, batching, queues",
          ],
        },
        {
          title: "Metaprogramming",
          chapter: "metaprogramming",
          items: [
            "Symbol and well-known symbols (Symbol.iterator, toPrimitive, hasInstance, toStringTag)",
            "Iteration and async-iteration protocols",
            "Proxy + Reflect — traps, use cases (validation, observability, ORMs)",
            "Property descriptors, freeze/seal, invariants",
            "Object.defineProperty vs Proxy reactivity (Vue 2 vs Vue 3)",
            "eval, new Function, and why not",
          ],
        },
        {
          title: "Types & data",
          chapter: "types-data",
          items: [
            "BigInt, typed arrays, ArrayBuffer, DataView",
            "Binary data, Blob, File, FileReader",
            "Intl — collation, number/date/relative-time formatting",
            "Unicode: code points vs code units, surrogate pairs, normalization",
          ],
        },
        {
          title: "Patterns & architecture",
          chapter: "patterns-architecture",
          items: [
            "Functional programming: purity, immutability, transducers",
            "Design patterns in JS: module, observer, strategy, factory, singleton, pub/sub",
            "Dependency injection, inversion of control",
            "State machines, event-driven architecture",
            "Error boundaries and resilience patterns",
            "API design: idempotency, retries with backoff, caching",
          ],
        },
        {
          title: "Performance",
          chapter: "performance",
          items: [
            "Critical rendering path, reflow vs repaint",
            "Debounce/throttle, requestAnimationFrame, requestIdleCallback",
            "Long tasks, INP/LCP/CLS, Lighthouse",
            "Virtual lists, lazy loading, prefetching",
            "Tree shaking, side effects, bundle analysis",
          ],
        },
        {
          title: "Security",
          chapter: "security",
          items: [
            "XSS (stored/reflected/DOM), sanitization, CSP",
            "CSRF, SameSite cookies, CORS in depth",
            "Prototype pollution, supply-chain risk",
            "Safe use of innerHTML, postMessage origin checks",
            "Auth in practice — token storage, JWT structure, session vs token, refresh flow, logout",
          ],
        },
        {
          title: "Ecosystem & professional",
          chapter: "ecosystem-professional",
          items: [
            "TypeScript: structural typing, generics, narrowing, utility types",
            "Node: modules, streams, cluster, worker threads, AsyncLocalStorage",
            "Build tooling internals, ASTs, Babel plugins, codemods",
            "Polyfills vs transpilation, core-js, browser targeting",
            "Reading the ECMAScript spec, TC39 stages",
          ],
        },
        {
          title: "Testing",
          chapter: "testing-in-js",
          items: [
            "Unit vs integration vs E2E — what each actually catches",
            "describe/it/expect, and what a test runner is doing underneath",
            "Mocking, spies, and why dependency injection makes both easier",
            "Fake timers — testing code that uses setTimeout/setInterval",
            "Testing async code, and what makes a test flaky",
            "Testing the DOM: query by role, not by class",
            "What coverage % actually tells you — and what it doesn't",
          ],
        },
      ],
    },
  ],

  curriculumNotes: [
    "DOM and events are the most commonly missing piece — for most jobs that's half the actual work. It sits beside the beginner objects/arrays chapter, not off at the end.",
    'Regex, dates and Intl are the "boring" topics that show up in every real codebase and every interview take-home.',
    'Security and testing aren\'t optional at the advanced tier — they\'re often what separates "senior" from "writes good code."',
  ],

  topics: [
    {
      id: "js",
      name: "JavaScript",
      mark: "JS",
      accent: "yellow",
      tagline: "The whole map, 23 sections deep",
      status: "ready",
      notes: "notes.html",
      blurb:
        "Beginner, intermediate and advanced, laid out in full — from how the engine runs code to security and testing. The shelf is up; each section opens the moment it's written.",

      levels: null,
      curriculumNotes: null,
    },
    {
      id: "html",
      name: "HTML",
      mark: "</>",
      accent: "red",
      tagline: "Structure, semantics, accessibility",
      status: "ready",
      notes: "html.html",
      blurb:
        "Semantic elements, forms that actually validate, the accessibility tree, and why div soup costs you later. Beginner through advanced, laid out the same way as the rest of the shelf.",
      curriculumNotes: [
        "Accessibility shows up twice on purpose — labels and alt text as a beginner habit, ARIA patterns and keyboard traps as an advanced skill once the basics are automatic.",
        "Forms get their own beginner AND intermediate chapter because native form validation alone quietly replaces a surprising amount of JavaScript.",
        "Web components and the parsing algorithm are the deepest, most-skipped layer — most people who write HTML daily never need them, but the advanced tier doesn't skip them.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can structure a real page.",
          blurb:
            "Start with the document itself — what a browser actually builds from your markup, and the elements that carry real meaning.",
          bullets: [
            "You've copied HTML before without knowing why each tag was there",
            "You want semantic elements, not div soup",
            "You want forms, links and images that actually work without JS",
          ],
          checkpoint:
            "you can hand-build a semantic, accessible multi-section page with a working form, without reaching for a div for everything.",
          syllabus: [
            {
              title: "Document structure & the parser",
              chapter: "html-document-structure",
              items: ["doctype, head/body, how the DOM is built from markup"],
            },
            {
              title: "Text & semantic elements",
              chapter: "html-semantic-elements",
              items: ["Headings, sections, articles, lists"],
            },
            {
              title: "Links, images & media",
              chapter: "html-links-images-media",
              items: ["Anchors, img, figure, audio/video basics"],
            },
            {
              title: "Forms basics",
              chapter: "html-forms-basics",
              items: ["Inputs, labels, buttons, form submission"],
            },
            {
              title: "Tables",
              chapter: "html-tables",
              items: ["Table structure, and when a table is the right tool"],
            },
            {
              title: "Attributes & global attributes",
              chapter: "html-attributes",
              items: ["id/class/data-*, aria basics"],
            },
            {
              title: "Meta tags & the document head",
              chapter: "html-meta-head",
              items: ["charset, viewport, basic SEO tags"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can structure a real application.",
          blurb:
            "You know the elements. Now learn the landmarks, the accessibility tree, and the forms/validation that hold up a real app.",
          bullets: [
            "Comfortable with semantic elements and basic forms",
            "You've had a screen reader (or a lighthouse audit) tell you something you didn't expect",
            "You want a page structure a real user with a keyboard or screen reader can actually use",
          ],
          checkpoint:
            "you can build a landmark-correct, keyboard-navigable page with real form validation, and pass a basic accessibility audit.",
          syllabus: [
            {
              title: "Semantic landmarks & document outline",
              chapter: "html-landmarks",
              items: ["header/nav/main/footer/aside, the document outline"],
            },
            {
              title: "Forms in depth",
              chapter: "html-forms-depth",
              items: ["Input types, validation attributes, fieldset/legend"],
            },
            {
              title: "Accessibility fundamentals",
              chapter: "html-accessibility-fundamentals",
              items: ["Roles, labels, alt text, focus order"],
            },
            {
              title: "Embedded content",
              chapter: "html-embedded-content",
              items: ["iframe, object/embed, inline SVG basics"],
            },
            {
              title: "Web components (intro)",
              chapter: "html-web-components-intro",
              items: ["Custom elements, shadow DOM, templates/slots"],
            },
            {
              title: "Microdata & structured data",
              chapter: "html-structured-data",
              items: ["schema.org basics, Open Graph tags"],
            },
            {
              title: "Progressive enhancement",
              chapter: "html-progressive-enhancement",
              items: ["Graceful degradation, feature detection"],
            },
            {
              title: "The Constraint Validation API",
              chapter: "html-constraint-validation",
              items: ["Native form validation, custom validity messages"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can reason about the parser and the a11y tree.",
          blurb:
            "ARIA patterns that actually work, the parsing algorithm, and the performance/SEO decisions behind a page that scales.",
          bullets: [
            "You can already build landmark-correct, validated forms",
            "You debug focus traps and screen-reader announcements, not just layout",
            "You want the why under the HTML parser and resource loading",
          ],
          checkpoint:
            "you can build a fully keyboard-and-screen-reader-accessible widget from scratch, and explain how the browser recovers from malformed markup.",
          syllabus: [
            {
              title: "Accessibility in depth",
              chapter: "html-accessibility-depth",
              items: ["ARIA patterns, live regions, keyboard traps"],
            },
            {
              title: "Performance",
              chapter: "html-performance",
              items: ["Resource hints (preload/prefetch/preconnect), lazy loading"],
            },
            {
              title: "Responsive images",
              chapter: "html-responsive-images",
              items: ["srcset/sizes, the picture element, art direction"],
            },
            {
              title: "Web components in depth",
              chapter: "html-web-components-depth",
              items: ["Lifecycle callbacks, styling shadow DOM"],
            },
            {
              title: "Security",
              chapter: "html-security",
              items: ["Sandboxing iframes, CSP from the HTML side"],
            },
            {
              title: "The HTML parsing algorithm",
              chapter: "html-parsing-algorithm",
              items: ["Error recovery — why malformed HTML still renders"],
            },
            {
              title: "HTML for SEO & sharing at scale",
              chapter: "html-seo-sharing-scale",
              items: ["Canonical URLs, hreflang, rich snippets"],
            },
          ],
        },
      ],
    },
    {
      id: "css",
      name: "CSS",
      mark: "{ }",
      accent: "mint",
      tagline: "Layout, cascade, and why it moved",
      status: "ready",
      notes: "css.html",
      blurb:
        "The cascade and specificity, box model, flexbox and grid, stacking contexts, and modern layout without hacks. Beginner through advanced, laid out the same way as the rest of the shelf.",
      curriculumNotes: [
        "Flexbox comes before Grid on purpose — most real layouts are one-dimensional, and Grid clicks faster once flex's mental model is automatic.",
        "Cascade layers and :has() are 2023+ CSS that quietly replace a lot of specificity hacks and JS-driven class toggling — they sit at the top of advanced because everything else assumes the old cascade rules first.",
        "Houdini and paint worklets are the deepest, rarest layer — most working CSS developers never touch them, but the advanced tier doesn't skip them.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can lay out a real page.",
          blurb:
            "Start with the cascade and the box model — the rules every other CSS explanation assumes you already know — then flexbox, the layout you'll use constantly.",
          bullets: [
            "You've written CSS by trial and error before",
            "The cascade and specificity still feel like guesswork",
            "You want the box model and flexbox once, in order",
          ],
          checkpoint:
            "you can lay out a real page with flexbox, responsive to screen size, without fighting the cascade.",
          syllabus: [
            {
              title: "The cascade, specificity & inheritance",
              chapter: "css-cascade-specificity",
              items: ["How rules win, source order, inheritance"],
            },
            {
              title: "The box model",
              chapter: "css-box-model",
              items: ["content/padding/border/margin, box-sizing"],
            },
            {
              title: "Selectors",
              chapter: "css-selectors",
              items: ["Combinators, pseudo-classes, pseudo-elements"],
            },
            {
              title: "Display types",
              chapter: "css-display-types",
              items: ["block/inline/inline-block, visibility vs display:none"],
            },
            {
              title: "Colors, units & typography",
              chapter: "css-colors-units-typography",
              items: ["px/em/rem/%, font properties, color formats"],
            },
            {
              title: "Backgrounds & borders",
              chapter: "css-backgrounds-borders",
              items: ["Gradients, shadows, border-radius"],
            },
            {
              title: "Flexbox",
              chapter: "css-flexbox",
              items: ["The model, main/cross axis, common patterns"],
            },
            {
              title: "Basic responsive design",
              chapter: "css-responsive-basics",
              items: ["Media queries, mobile-first"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can lay out a real application.",
          blurb:
            "You know flexbox. Now learn Grid, positioning, animation, custom properties, and the architecture that keeps a real stylesheet sane.",
          bullets: [
            "Comfortable with flexbox and the box model",
            "You've fought z-index and lost at least once",
            "You want a stylesheet that scales past one page",
          ],
          checkpoint:
            "you can build a responsive, themeable app layout with Grid and custom properties, and explain why an element is stacking where it is.",
          syllabus: [
            {
              title: "Grid",
              chapter: "css-grid",
              items: ["The model, template areas, auto-placement"],
            },
            {
              title: "Positioning & stacking contexts",
              chapter: "css-positioning-stacking",
              items: ["relative/absolute/fixed/sticky, z-index"],
            },
            {
              title: "Transitions & animations",
              chapter: "css-transitions-animations",
              items: ["Keyframes, timing functions, transforms"],
            },
            {
              title: "Custom properties",
              chapter: "css-custom-properties",
              items: ["CSS variables — scoping, theming"],
            },
            {
              title: "Responsive design in depth",
              chapter: "css-responsive-depth",
              items: ["Container queries, clamp/min/max"],
            },
            {
              title: "CSS architecture",
              chapter: "css-architecture",
              items: ["BEM, utility-first (Tailwind), CSS Modules"],
            },
            {
              title: "Pseudo-classes & selectors in depth",
              chapter: "css-selectors-depth",
              items: [":has, :is, :where, nth-child"],
            },
            {
              title: "Print & other media types",
              chapter: "css-media-types",
              items: ["@media print and beyond"],
            },
            {
              title: "Forms styling",
              chapter: "css-forms-styling",
              items: ["appearance, accent-color, styling native controls"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can reason about the rendering pipeline.",
          blurb:
            "Stacking contexts and layout algorithms in depth, scroll-driven animation, cascade layers, and the performance work behind a fast page.",
          bullets: [
            "You can already build a responsive, themeable layout with Grid",
            "You debug jank and layout thrash, not just visual bugs",
            "You want the why under containment, layers and the paint pipeline",
          ],
          checkpoint:
            "you can diagnose a layout-thrash performance bug, explain a stacking-context surprise, and design a themeable design-token system.",
          syllabus: [
            {
              title: "Stacking contexts & layout algorithms in depth",
              chapter: "css-layout-algorithms-depth",
              items: ["BFC/IFC, containment"],
            },
            {
              title: "Advanced animation",
              chapter: "css-advanced-animation",
              items: ["Scroll-driven animations, the View Transitions API"],
            },
            {
              title: "CSS architecture at scale",
              chapter: "css-architecture-scale",
              items: ["Design tokens, theming systems"],
            },
            {
              title: "Performance",
              chapter: "css-performance",
              items: ["Critical CSS, containment, will-change, reflow/repaint"],
            },
            {
              title: "Modern layout techniques",
              chapter: "css-modern-layout",
              items: ["Subgrid, :has()-driven layouts"],
            },
            {
              title: "Cascade layers & scope",
              chapter: "css-cascade-layers-scope",
              items: ["@layer and @scope"],
            },
            {
              title: "Houdini & the future of CSS",
              chapter: "css-houdini",
              items: ["Custom paint/properties (surface level)"],
            },
            {
              title: "Cross-browser & fallback strategies",
              chapter: "css-cross-browser",
              items: ["Feature queries (@supports), progressive enhancement"],
            },
          ],
        },
      ],
    },
    {
      id: "react",
      name: "React",
      mark: "⚛",
      accent: "blue",
      tagline: "Components, state, re-renders",
      status: "ready",
      notes: "react.html",
      blurb:
        "What actually triggers a re-render, hooks and their rules, state that lives in the right place, and effects you can reason about. Beginner through advanced, laid out the same way the JavaScript curriculum is — the shelf is up, each section opens the moment it's written.",
      curriculumNotes: [
        "Hooks rules and stale closures are where most intermediate bugs actually live — they sit right after custom hooks, not off in a footnote.",
        "Server Components, Server Actions and the use() hook are 2024+ React — they only make sense once rendering strategies (SSR/SSG/streaming) already do.",
        "Accessibility and performance profiling aren't optional at the advanced tier — they're usually what a senior React review actually checks.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can build a working screen.",
          blurb:
            "Start with a component on the page. JSX, props, state and the handful of hooks that cover almost everything you'll build before anything else matters.",
          bullets: [
            "You know JavaScript basics (functions, arrays, objects)",
            "You haven't built a real component tree yet",
            "You want the core loop — render, state, event — once, in order",
          ],
          checkpoint:
            "you can build a small app (forms, a list, a fetch call) from a blank Vite project without copying a tutorial.",
          syllabus: [
            {
              title: "Project setup & JSX",
              chapter: "react-setup-jsx",
              items: [
                "Setting up a project with Vite (or Create React App)",
                "JSX syntax, expressions, and rules (single parent, className, self-closing tags)",
              ],
            },
            {
              title: "Components & composition",
              chapter: "react-components",
              items: ["Function components, composition, and file structure"],
            },
            {
              title: "Props",
              chapter: "react-props",
              items: ["Passing data, destructuring, children, default values"],
            },
            {
              title: "State with useState",
              chapter: "react-usestate",
              items: ["State with useState"],
            },
            {
              title: "Events & conditional rendering",
              chapter: "react-events-conditionals",
              items: [
                "Event handling (onClick, onChange, synthetic events)",
                "Conditional rendering (ternary, &&, early return)",
              ],
            },
            {
              title: "Lists with .map() and keys",
              chapter: "react-lists-keys",
              items: ["Lists with .map() and the key prop"],
            },
            {
              title: "Controlled forms",
              chapter: "react-forms",
              items: ["Controlled forms and inputs"],
            },
            {
              title: "useEffect basics",
              chapter: "react-useeffect-basics",
              items: ["useEffect basics — fetching data, dependency array, cleanup"],
            },
            {
              title: "Lifting state up & basic styling",
              chapter: "react-lifting-styling",
              items: [
                "Lifting state up and passing callbacks down",
                "Basic styling: CSS modules, inline styles, Tailwind",
              ],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I understand why it re-renders.",
          blurb:
            "You know the hooks. Now learn the machinery underneath: refs, context, routing, memoisation, and the fetching patterns that don't race themselves.",
          bullets: [
            "Comfortable with props, state and the basic hooks",
            "You've hit a stale-closure or an infinite effect loop and guessed your way out",
            "You want real apps — routing, forms at scale, server state",
          ],
          checkpoint:
            "you can build a routed, tested app with a real data-fetching library and explain every re-render in it.",
          syllabus: [
            {
              title: "useRef",
              chapter: "react-useref",
              items: ["useRef — DOM access and mutable values that don't trigger re-renders"],
            },
            {
              title: "Context API",
              chapter: "react-context",
              items: ["useContext + Context API for cross-tree state"],
            },
            {
              title: "useReducer",
              chapter: "react-usereducer",
              items: ["useReducer for complex state transitions"],
            },
            {
              title: "Custom hooks",
              chapter: "react-custom-hooks",
              items: ["Custom hooks and the rules of hooks"],
            },
            {
              title: "Effects in depth",
              chapter: "react-effects-depth",
              items: ["Component lifecycle in the hooks mental model; effect timing and stale closures"],
            },
            {
              title: "React Router",
              chapter: "react-router",
              items: ["React Router: routes, nested routes, params, navigation, protected routes"],
            },
            {
              title: "State architecture",
              chapter: "react-state-architecture",
              items: ["Lifting vs. colocating state; prop drilling and how to avoid it"],
            },
            {
              title: "Memoisation",
              chapter: "react-memoisation",
              items: ["Memoization: useMemo, useCallback, React.memo, and when not to use them"],
            },
            {
              title: "Error boundaries, portals & keys in depth",
              chapter: "react-boundaries-portals",
              items: ["Error boundaries", "Portals", "Fragments and keys in depth (reconciliation basics)"],
            },
            {
              title: "Data fetching patterns",
              chapter: "react-data-fetching",
              items: ["Data fetching patterns: loading/error states, abort controllers, race conditions"],
            },
            {
              title: "Forms at scale",
              chapter: "react-forms-at-scale",
              items: ["Forms at scale — React Hook Form or Formik, plus validation (Zod/Yup)"],
            },
            {
              title: "State management libraries",
              chapter: "react-state-libraries",
              items: ["State management libraries — Zustand, Redux Toolkit, or Jotai"],
            },
            {
              title: "Server state with TanStack Query",
              chapter: "react-server-state",
              items: ["Server state — TanStack Query (caching, invalidation, optimistic updates)"],
            },
            {
              title: "Testing React",
              chapter: "react-testing",
              items: ["Testing: React Testing Library, Vitest/Jest, user-event"],
            },
            {
              title: "TypeScript with React",
              chapter: "react-typescript",
              items: ["TypeScript with React: typing props, hooks, generics in components"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can reason about the render tree and the server boundary.",
          blurb:
            "Reconciliation, concurrent rendering, Server Components, and the patterns behind every component library you've ever imported.",
          bullets: [
            "You can already explain hooks, context and memoisation",
            "You debug re-render storms and hydration mismatches, not just bugs",
            "You want the why under Suspense, RSC and the compiler",
          ],
          checkpoint:
            "you can profile a slow tree in React DevTools, explain the client/server component boundary, and defend a component-library API with tradeoffs.",
          syllabus: [
            {
              title: "Reconciliation & Fiber",
              chapter: "react-fiber",
              items: ["Reconciliation and the Fiber architecture; how re-renders actually propagate"],
            },
            {
              title: "Concurrent features",
              chapter: "react-concurrent",
              items: ["Concurrent features: useTransition, useDeferredValue, startTransition"],
            },
            {
              title: "Suspense & code splitting",
              chapter: "react-suspense",
              items: ["Suspense for data fetching and code splitting (React.lazy)"],
            },
            {
              title: "Server Components",
              chapter: "react-server-components",
              items: ['Server Components vs. Client Components (RSC boundary, "use client")'],
            },
            {
              title: "Server Actions",
              chapter: "react-server-actions",
              items: ["Server Actions and useActionState / useFormStatus / useOptimistic"],
            },
            {
              title: "The use() hook",
              chapter: "react-use-hook",
              items: ["use() hook for promises and context"],
            },
            {
              title: "Rendering strategies",
              chapter: "react-rendering-strategies",
              items: ["SSR, SSG, ISR, streaming, and hydration (typically via Next.js or Remix)"],
            },
            {
              title: "Effect timing",
              chapter: "react-effect-timing",
              items: ["useLayoutEffect vs. useEffect, and useInsertionEffect"],
            },
            {
              title: "useSyncExternalStore",
              chapter: "react-sync-external-store",
              items: ["useSyncExternalStore for external store subscriptions"],
            },
            {
              title: "Refs in depth",
              chapter: "react-refs-depth",
              items: ["useImperativeHandle and forwardRef (note: ref-as-prop in React 19)"],
            },
            {
              title: "Advanced component patterns",
              chapter: "react-advanced-patterns",
              items: [
                "Advanced patterns: compound components, render props, headless components, controlled/uncontrolled hybrids, provider composition",
              ],
            },
            {
              title: "Performance work",
              chapter: "react-performance",
              items: [
                "Performance work: profiling with React DevTools, virtualization (TanStack Virtual), bundle analysis, avoiding unnecessary renders",
                "Code splitting and lazy loading strategies",
              ],
            },
            {
              title: "Accessibility",
              chapter: "react-accessibility",
              items: ["Accessibility: focus management, ARIA, keyboard navigation"],
            },
            {
              title: "Design systems",
              chapter: "react-design-systems",
              items: ["Building a design system / component library"],
            },
            {
              title: "Advanced TypeScript with React",
              chapter: "react-advanced-typescript",
              items: [
                "Advanced TypeScript: polymorphic components, discriminated union props, generic constrained components",
              ],
            },
            {
              title: "Architecture at scale",
              chapter: "react-architecture-scale",
              items: ["Monorepos, module federation, micro-frontends"],
            },
            {
              title: "Custom renderers",
              chapter: "react-custom-renderers",
              items: ["Writing custom renderers or understanding react-reconciler (rare, but the deepest layer)"],
            },
          ],
        },
      ],
    },
    {
      id: "nextjs",
      name: "Next.js",
      mark: "N",
      accent: "ink",
      tagline: "Routing, rendering, the server",
      status: "ready",
      notes: "nextjs.html",
      blurb:
        "App router, server vs client components, caching layers, and the rendering strategy behind each page. Beginner through advanced, laid out the same way as the rest of the shelf.",
      curriculumNotes: [
        "The server/client component boundary shows up right after routing on purpose — almost every other intermediate topic (data fetching, server actions, middleware) assumes you already know which side of it you're on.",
        "Next's caching model is famously confusing because it's four separate caches stacked on each other — it gets its own advanced chapter instead of being folded into data fetching.",
        "Deployment and the edge runtime sit at the end of advanced because they're where every earlier decision (rendering strategy, caching, middleware) actually gets tested.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can build a working site.",
          blurb:
            "Start with the App Router — pages, layouts, and a small site that fetches data, styled and linked together.",
          bullets: [
            "You know React (components, props, state, useEffect)",
            "You haven't built a routed, multi-page Next app yet",
            "You want the file-based routing model once, in order",
          ],
          checkpoint:
            "you can build a small multi-page site with the App Router, fetching data, styled, with images and fonts handled properly.",
          syllabus: [
            {
              title: "What Next.js is & project setup",
              chapter: "next-setup",
              items: ["create-next-app, project structure, file conventions"],
            },
            {
              title: "The App Router",
              chapter: "next-app-router",
              items: ["Pages, layouts, nested routes"],
            },
            {
              title: "Routing",
              chapter: "next-routing",
              items: ["Dynamic routes, route groups, not-found and error pages"],
            },
            {
              title: "Rendering basics",
              chapter: "next-rendering-basics",
              items: ["SSR vs SSG vs CSR — the overview"],
            },
            {
              title: "Data fetching (basic)",
              chapter: "next-data-fetching-basic",
              items: ["fetch in server components, caching defaults (surface level)"],
            },
            {
              title: "Styling in Next",
              chapter: "next-styling",
              items: ["CSS Modules, Tailwind, global styles"],
            },
            {
              title: "Images & fonts",
              chapter: "next-images-fonts",
              items: ["next/image, next/font"],
            },
            {
              title: "Linking & navigation",
              chapter: "next-linking-navigation",
              items: ["next/link, useRouter/useParams/usePathname"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I understand the server/client boundary.",
          blurb:
            "You can route and render. Now learn where server ends and client begins — data fetching, server actions, middleware, and how auth actually fits in.",
          bullets: [
            "Comfortable with the App Router and basic data fetching",
            "You've hit a \"you're importing a Client Component into a Server Component\" error and guessed your way past it",
            "You want a real app — auth, forms, SEO, tested",
          ],
          checkpoint:
            "you can ship an authenticated app with Server Actions, proper metadata, and tests, and explain why each component is server or client.",
          syllabus: [
            {
              title: "Server vs Client Components",
              chapter: "next-server-client-components",
              items: ['The boundary, "use client", composition patterns'],
            },
            {
              title: "Parallel & intercepting routes",
              chapter: "next-parallel-intercepting-routes",
              items: [
                "@slot parallel routes, default.tsx",
                "Intercepting routes — (.), (..), the modal-over-route pattern",
              ],
            },
            {
              title: "Data fetching in depth",
              chapter: "next-data-fetching-depth",
              items: ["Revalidation, cache tags, dynamic vs static rendering"],
            },
            {
              title: "API routes / Route Handlers",
              chapter: "next-route-handlers",
              items: ["Building a backend inside Next with Route Handlers"],
            },
            {
              title: "Server Actions",
              chapter: "next-server-actions",
              items: ["Mutations, forms, useFormStatus / useActionState"],
            },
            {
              title: "Middleware",
              chapter: "next-middleware",
              items: ["Auth checks, redirects, edge middleware"],
            },
            {
              title: "Metadata & SEO",
              chapter: "next-metadata-seo",
              items: ["generateMetadata, sitemap.ts, robots.ts"],
            },
            {
              title: "Environment & config",
              chapter: "next-env-config",
              items: ["Env vars, next.config.js essentials"],
            },
            {
              title: "Authentication in Next",
              chapter: "next-auth",
              items: ["NextAuth/Auth.js patterns"],
            },
            {
              title: "Error handling",
              chapter: "next-error-handling",
              items: ["error.tsx, not-found.tsx, loading.tsx"],
            },
            {
              title: "Testing a Next app",
              chapter: "next-testing",
              items: ["Component testing and route testing"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can reason about the cache layers.",
          blurb:
            "ISR, streaming, the four caches stacked on top of each other, and the deployment decisions behind a production Next app.",
          bullets: [
            "You can already ship an authenticated app with Server Actions",
            "You debug stale data and cache-invalidation bugs, not just component bugs",
            "You want the why under ISR, streaming and the edge runtime",
          ],
          checkpoint:
            "you can explain which of Next's four caches is serving a stale response, choose a rendering strategy with tradeoffs, and defend a deployment target (edge vs Node runtime).",
          syllabus: [
            {
              title: "Rendering strategies in depth",
              chapter: "next-rendering-depth",
              items: ["ISR, streaming, partial prerendering"],
            },
            {
              title: "Caching architecture",
              chapter: "next-caching-architecture",
              items: ["The four cache layers: request, data, full route, router"],
            },
            {
              title: "Performance",
              chapter: "next-performance",
              items: ["Bundle analysis, code splitting, Core Web Vitals"],
            },
            {
              title: "Deployment",
              chapter: "next-deployment",
              items: ["Vercel vs self-hosted, edge runtime vs Node runtime"],
            },
            {
              title: "Internationalization",
              chapter: "next-i18n",
              items: ["i18n routing strategies"],
            },
            {
              title: "Monorepos with Next.js",
              chapter: "next-monorepos",
              items: ["Turborepo, shared packages across apps"],
            },
            {
              title: "Advanced Server Actions patterns",
              chapter: "next-server-actions-advanced",
              items: ["Optimistic UI, useOptimistic"],
            },
            {
              title: "Databases in Next",
              chapter: "next-databases",
              items: ["Connection handling in a serverless/edge environment"],
            },
            {
              title: "Security in Next",
              chapter: "next-security",
              items: ["Server Action security, headers, CSP"],
            },
            {
              title: "Migrating Pages Router to App Router",
              chapter: "next-migration",
              items: ["Incremental adoption strategy"],
            },
          ],
        },
      ],
    },
    {
      id: "nestjs",
      name: "Nest.js",
      mark: "Ne",
      accent: "red",
      tagline: "Modules, DI, and structure",
      status: "ready",
      notes: "nestjs.html",
      blurb:
        "Dependency injection done properly, modules and providers, pipes and guards, and how a request flows through the app. Beginner through advanced, laid out the same way as the rest of the shelf.",
      curriculumNotes: [
        "Dependency injection gets a beginner pass (just enough to build something) and a full intermediate chapter — DI is the one idea that makes or breaks how well you understand Nest.",
        "Auth and testing sit in intermediate, same as Node's plain-Express curriculum, because that's genuinely when real Nest work starts.",
        "Microservices and dynamic modules are the deepest, rarest layer — most working Nest developers never build them, but the advanced tier doesn't skip them.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can build a working resource.",
          blurb:
            "Start with a controller, a provider and a module — the three pieces every Nest app is assembled from — and a small CRUD resource end to end.",
          bullets: [
            "You know Node/Express and basic TypeScript",
            "You haven't organized an app around dependency injection before",
            "You want the core loop — controller, provider, module — once, in order",
          ],
          checkpoint:
            "you can build a small CRUD resource with Nest's CLI, validated input, and a database connection, without copying a tutorial.",
          syllabus: [
            {
              title: "Project setup & the Nest CLI",
              chapter: "nest-setup-cli",
              items: ["Modules, controllers and providers — the overview"],
            },
            {
              title: "Controllers & routing",
              chapter: "nest-controllers-routing",
              items: ["Decorators, request/response, DTOs (intro)"],
            },
            {
              title: "Providers & dependency injection",
              chapter: "nest-providers-di-basics",
              items: ["The basics — @Injectable, constructor injection"],
            },
            {
              title: "Modules",
              chapter: "nest-modules",
              items: ["Organizing an app, imports/exports/providers"],
            },
            {
              title: "Basic validation",
              chapter: "nest-validation-basics",
              items: ["class-validator, pipes (intro)"],
            },
            {
              title: "Configuration",
              chapter: "nest-configuration",
              items: ["@nestjs/config, environment variables"],
            },
            {
              title: "Connecting a database (basics)",
              chapter: "nest-database-basics",
              items: ["TypeORM/Prisma module setup"],
            },
            {
              title: "Building your first CRUD resource",
              chapter: "nest-first-resource",
              items: ["Putting it together: a full resource end to end"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can ship a real Nest service.",
          blurb:
            "You can build a resource. Now learn the request lifecycle in depth, real auth, testing, and the repository patterns behind a production app.",
          bullets: [
            "Comfortable with controllers, providers and modules",
            "You've hit a circular dependency or a scope bug and guessed your way out",
            "You want a tested, authenticated, deployable Nest service",
          ],
          checkpoint:
            "you can ship a tested, authenticated Nest API with guards, interceptors, and a real repository layer.",
          syllabus: [
            {
              title: "Dependency injection in depth",
              chapter: "nest-di-depth",
              items: ["Provider scopes, custom providers, injection tokens"],
            },
            {
              title: "Pipes, guards & interceptors",
              chapter: "nest-pipes-guards-interceptors",
              items: ["The request lifecycle, in order"],
            },
            {
              title: "Middleware in Nest",
              chapter: "nest-middleware",
              items: ["Global vs route-scoped middleware"],
            },
            {
              title: "Exception filters",
              chapter: "nest-exception-filters",
              items: ["Custom error handling"],
            },
            {
              title: "Authentication",
              chapter: "nest-authentication",
              items: ["Passport strategies, JWT guards"],
            },
            {
              title: "Authorization",
              chapter: "nest-authorization",
              items: ["Roles/permissions, custom guards"],
            },
            {
              title: "Testing in Nest",
              chapter: "nest-testing",
              items: ["Unit tests, e2e tests, testing modules"],
            },
            {
              title: "Database & repository patterns",
              chapter: "nest-repository-patterns",
              items: ["TypeORM/Prisma repositories, transactions"],
            },
            {
              title: "OpenAPI/Swagger integration",
              chapter: "nest-openapi-swagger",
              items: ["Documenting a Nest API"],
            },
            {
              title: "Task scheduling & queues",
              chapter: "nest-scheduling-queues",
              items: ["@nestjs/schedule, Bull integration"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can reason about the module graph.",
          blurb:
            "Microservices, GraphQL, custom decorators, and the module patterns behind a Nest app that's outgrown a single service.",
          bullets: [
            "You can already ship a tested, authenticated Nest API",
            "You debug DI scope bugs and module boundaries, not just endpoint bugs",
            "You want the why under dynamic modules and Nest's microservice transporters",
          ],
          checkpoint:
            "you can split a Nest app into microservices with a real transporter, add a GraphQL resolver layer, and defend a dynamic-module design.",
          syllabus: [
            {
              title: "Microservices with Nest",
              chapter: "nest-microservices",
              items: ["Transporters (TCP/Redis/Kafka), hybrid apps"],
            },
            {
              title: "GraphQL with Nest",
              chapter: "nest-graphql",
              items: ["Code-first vs schema-first, resolvers"],
            },
            {
              title: "WebSockets & gateways",
              chapter: "nest-websockets-gateways",
              items: ["Building a real-time gateway"],
            },
            {
              title: "Custom decorators & metadata reflection",
              chapter: "nest-custom-decorators",
              items: ["Param decorators, reflect-metadata"],
            },
            {
              title: "Advanced module patterns",
              chapter: "nest-advanced-modules",
              items: ["Dynamic modules, global modules"],
            },
            {
              title: "Performance & caching",
              chapter: "nest-performance-caching",
              items: ["Interceptor-based caching, CacheModule"],
            },
            {
              title: "Monorepo Nest apps",
              chapter: "nest-monorepo",
              items: ["Nx/Nest workspaces"],
            },
            {
              title: "Production readiness",
              chapter: "nest-production-readiness",
              items: ["Health checks, graceful shutdown, logging"],
            },
          ],
        },
      ],
    },
    {
      id: "typescript",
      name: "TypeScript",
      mark: "TS",
      accent: "blue",
      tagline: "Types that describe real code",
      status: "ready",
      notes: "typescript.html",
      blurb:
        "Structural typing, generics that stay readable, narrowing, and the compiler settings that actually matter. Beginner through advanced, laid out the same way as the rest of the shelf.",
      curriculumNotes: [
        "Narrowing and discriminated unions are where most people actually start writing idiomatic TypeScript instead of fighting the compiler — they sit early in intermediate on purpose.",
        "Utility and mapped types get asked about constantly in interviews, but they only click once generics already do — that's why generics comes first.",
        "The compiler API and migrating a real JS codebase are the deepest, least-common layer — most working TS developers never touch them, but the advanced tier doesn't skip them.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can type a real function.",
          blurb:
            "Start with the compiler and the basic type vocabulary — primitives, objects, functions and classes with real types on them.",
          bullets: [
            "You know JavaScript comfortably",
            "You've seen TypeScript in a codebase but never configured it yourself",
            "You want the vocabulary — types, interfaces, generics by name — once, in order",
          ],
          checkpoint:
            "you can add TypeScript to a small JS project, type its functions and objects, and get real compiler errors instead of runtime surprises.",
          syllabus: [
            {
              title: "Setup & the compiler",
              chapter: "ts-setup-compiler",
              items: [
                "tsc, tsconfig.json basics, strict mode (surface level)",
                "ts-node and running TypeScript directly",
              ],
            },
            {
              title: "Basic types",
              chapter: "ts-basic-types",
              items: [
                "Primitives, arrays, tuples",
                "any, unknown, never — and why they're different",
                "Type inference: when you don't need to annotate",
              ],
            },
            {
              title: "Functions",
              chapter: "ts-functions",
              items: ["Parameter and return types, optional and default params", "Function overloads (surface level)"],
            },
            {
              title: "Interfaces & type aliases",
              chapter: "ts-interfaces-aliases",
              items: ["Object shapes, readonly, optional properties", "interface vs type — when it matters"],
            },
            {
              title: "Union & intersection types",
              chapter: "ts-union-intersection",
              items: ["Union & intersection types, basic usage"],
            },
            {
              title: "Enums & literal types",
              chapter: "ts-enums-literals",
              items: ["Enums, const enums, string/number literal types"],
            },
            {
              title: "Classes in TypeScript",
              chapter: "ts-classes",
              items: ["Access modifiers, readonly fields", "implements, abstract classes (surface level)"],
            },
            {
              title: "Working with the DOM & JSON",
              chapter: "ts-dom-json",
              items: ["Typing DOM APIs, event handlers", "Typing JSON data, JSON.parse and unknown"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can design a real type.",
          blurb:
            "You know the vocabulary. Now learn to shape it: narrowing, generics, the utility types everyone uses, and a tsconfig that fits a real project.",
          bullets: [
            "Comfortable with interfaces, unions and basic generics",
            "You've written `as any` to make an error go away and known it was wrong",
            "You want types that describe your actual data, not just satisfy the compiler",
          ],
          checkpoint:
            "you can design a generic, narrowed, well-typed module that a teammate can use without reading its implementation.",
          syllabus: [
            {
              title: "Structural typing & inference in depth",
              chapter: "ts-structural-typing",
              items: [
                "Structural vs nominal typing, excess property checks",
                "Contextual typing, inference in generics",
              ],
            },
            {
              title: "Narrowing",
              chapter: "ts-narrowing",
              items: ["typeof/in/instanceof guards, custom type guards", "Discriminated unions"],
            },
            {
              title: "Runtime validation with Zod",
              chapter: "ts-runtime-validation",
              items: [
                "Why types disappear at runtime — the compile-time/runtime gap",
                "Zod schemas, z.infer, parsing vs validating",
                "Validating API responses and form input at the boundary",
              ],
            },
            {
              title: "Generics",
              chapter: "ts-generics",
              items: ["Generic functions, interfaces and classes", "Constraints, default type parameters"],
            },
            {
              title: "Utility types",
              chapter: "ts-utility-types",
              items: ["Partial, Pick, Omit, Record, ReturnType and friends"],
            },
            {
              title: "Mapped & conditional types",
              chapter: "ts-mapped-conditional",
              items: ["Mapped types, conditional types, the basics of infer"],
            },
            {
              title: "Modules, namespaces & declaration files",
              chapter: "ts-modules-declarations",
              items: ["ESM/CJS module typing, namespaces (when they still matter)", "Writing a .d.ts file"],
            },
            {
              title: "Configuring tsconfig for real projects",
              chapter: "ts-tsconfig-real-projects",
              items: ["target/module/lib/paths, strict family flags one by one"],
            },
            {
              title: "Working with third-party types",
              chapter: "ts-third-party-types",
              items: ["@types packages, module augmentation, ambient declarations"],
            },
            {
              title: "Typing async code",
              chapter: "ts-async-typing",
              items: ["Typing promises, async functions, error handling patterns"],
            },
            {
              title: "Testing typed code",
              chapter: "ts-testing-typed-code",
              items: ["ts-jest/Vitest with TypeScript, type-checking in CI"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can design a type system.",
          blurb:
            "Conditional and recursive types, the compiler API, and the judgment calls behind migrating a real codebase or shipping a type-safe library.",
          bullets: [
            "You can already design generic, narrowed modules",
            "You read library .d.ts files for fun, or at least without flinching",
            "You want the why under template literal types and the compiler itself",
          ],
          checkpoint:
            "you can design a small type-safe library with conditional/mapped types, explain a gnarly inference error, and defend a migration plan from JS to TS.",
          syllabus: [
            {
              title: "Advanced generics",
              chapter: "ts-advanced-generics",
              items: ["Variance (surface level), the infer keyword"],
            },
            {
              title: "Conditional & recursive types",
              chapter: "ts-conditional-recursive-types",
              items: ["Template literal types, recursive type definitions"],
            },
            {
              title: "Type-level programming",
              chapter: "ts-type-level-programming",
              items: ["Branded/opaque types, building a type-safe API surface"],
            },
            {
              title: "Decorators & metadata",
              chapter: "ts-decorators",
              items: ["Decorators, reflect-metadata (surface level)"],
            },
            {
              title: "Structural vs nominal typing tradeoffs",
              chapter: "ts-structural-vs-nominal",
              items: ["When structural typing bites, simulating nominal types"],
            },
            {
              title: "Type-checking performance",
              chapter: "ts-build-performance",
              items: ["Project references, incremental builds, why builds get slow"],
            },
            {
              title: "Monorepo & multi-package setups",
              chapter: "ts-monorepo-setups",
              items: ["Shared tsconfigs, path aliases, package boundaries"],
            },
            {
              title: "Migrating a JS codebase to TypeScript",
              chapter: "ts-migrating-js",
              items: ["allowJs, checkJs, incremental adoption strategy"],
            },
            {
              title: "The TypeScript compiler API",
              chapter: "ts-compiler-api",
              items: ["Writing a simple transform or codemod"],
            },
            {
              title: "End-to-end type safety",
              chapter: "ts-fullstack-type-safety",
              items: ["TypeScript across React, Node and GraphQL boundaries"],
            },
          ],
        },
      ],
    },
    {
      id: "node",
      name: "Node.js",
      mark: "No",
      accent: "mint",
      tagline: "The runtime on the server side",
      status: "ready",
      notes: "node.html",
      blurb:
        "The other runtime around the same engine: modules, streams, the event loop phases, and how I/O really works. Beginner through advanced, laid out the same way as the rest of the shelf — the shelf is up, each section opens the moment it's written.",
      curriculumNotes: [
        'The event loop shows up twice on purpose — once as "here\'s the shape" in beginner, once as "here\'s why your app actually stalled" in advanced, with real profiling in between.',
        "Databases, auth and testing sit in the intermediate tier because that's when most real Node work actually starts — a server that can't persist or verify anything isn't a backend yet.",
        "Native addons and building a custom renderer for Node's internals are the deepest, rarest layer — most working backend engineers never need them, but the advanced tier doesn't skip them.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can build a working server.",
          blurb:
            "Start with a process that talks over a socket. The runtime, modules, the file system, and a small HTTP API — the loop every Node backend is built from.",
          bullets: [
            "You know JavaScript basics (functions, arrays, objects, async/await)",
            "You haven't run JS outside a browser tab before",
            "You want the core loop — request in, response out — once, in order",
          ],
          checkpoint:
            "you can build a small CRUD API with Express, reading and writing a file or a simple store, without copying a tutorial.",
          syllabus: [
            {
              title: "Runtime & tooling",
              chapter: "node-runtime-tooling",
              items: [
                "What Node is: V8 + libuv, how it differs from the browser",
                "node, npm, npx and the REPL",
                "Node globals vs browser globals",
              ],
            },
            {
              title: "Modules & npm",
              chapter: "node-modules-npm",
              items: [
                "CommonJS require/module.exports",
                'ESM in Node ("type": "module", import/export)',
                "package.json, npm install, scripts, semver",
              ],
            },
            {
              title: "File system & paths",
              chapter: "node-fs-paths",
              items: ["fs read/write — sync vs async vs promises API", "The path module, __dirname vs import.meta.url"],
            },
            {
              title: "Core HTTP",
              chapter: "node-http-core",
              items: ["The http module: creating a server", "Request and response objects, basic routing by hand"],
            },
            {
              title: "Express basics",
              chapter: "node-express-basics",
              items: ["Routes, middleware, req/res", "Serving static files, parsing JSON bodies"],
            },
            {
              title: "Environment & config",
              chapter: "node-env-config",
              items: [
                "process.env, .env files, process.argv",
                "The process object: exit codes, signals (surface level)",
              ],
            },
            {
              title: "Async in Node",
              chapter: "node-async",
              items: ["Callbacks and the error-first convention", "util.promisify, async/await with fs and http"],
            },
            {
              title: "Error handling & debugging",
              chapter: "node-error-handling-debugging",
              items: [
                "try/catch, uncaughtException and unhandledRejection (surface level)",
                "console, node --inspect, reading a stack trace",
              ],
            },
            {
              title: "Building your first API",
              chapter: "node-first-api",
              items: ["Putting it together: a small CRUD API end to end"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can ship a real backend.",
          blurb:
            "You can build a server. Now learn what makes it a real service: the event loop under load, streams, a real database, auth, tests, and how it actually gets deployed.",
          bullets: [
            "Comfortable with Express, async/await and basic file I/O",
            "You've hit a blocked event loop or a memory-hungry endpoint and guessed your way out",
            "You want a real, tested, deployable service — not a toy server",
          ],
          checkpoint:
            "you can ship a tested REST API with a real database, auth, structured logging, and a Docker image someone else can run.",
          syllabus: [
            {
              title: "The event loop in Node",
              chapter: "node-event-loop",
              items: [
                "libuv phases: timers, poll, check, close callbacks",
                "Timers vs setImmediate vs microtasks in Node",
              ],
            },
            {
              title: "EventEmitter & the observer pattern",
              chapter: "node-event-emitter",
              items: [
                "The EventEmitter class — on/emit/once/removeListener",
                "Why http, streams and most of Node's core API extend it",
                "Custom events, error events, the maxListeners warning",
              ],
            },
            {
              title: "Streams & buffers",
              chapter: "node-streams-buffers",
              items: ["Readable, writable, duplex and transform streams", "Piping, backpressure, the Buffer type"],
            },
            {
              title: "REST APIs at scale",
              chapter: "node-rest-apis-scale",
              items: ["Middleware chains and error-handling middleware", "Request validation (Zod/Joi)"],
            },
            {
              title: "REST API design principles",
              chapter: "node-api-design",
              items: [
                "Versioning, pagination, filtering, sorting",
                "Idempotency, and using status codes correctly",
                "API docs (OpenAPI/Swagger), HATEOAS (surface level)",
              ],
            },
            {
              title: "Databases",
              chapter: "node-databases",
              items: ["SQL and NoSQL clients, connection pooling", "Migrations and ORMs (Prisma, Mongoose)"],
            },
            {
              title: "Caching with Redis",
              chapter: "node-caching",
              items: [
                "Cache-aside vs write-through, TTLs and invalidation",
                "Redis as a cache vs Redis as a queue backend",
              ],
            },
            {
              title: "Authentication & sessions",
              chapter: "node-auth-sessions",
              items: ["JWTs, cookies, bcrypt", "Sessions and CSRF basics"],
            },
            {
              title: "Testing Node apps",
              chapter: "node-testing",
              items: ["Jest/Vitest, supertest for HTTP", "Mocking, fixtures, test databases"],
            },
            {
              title: "Child processes & the OS",
              chapter: "node-child-processes-os",
              items: ["spawn, exec, fork", "The os module"],
            },
            {
              title: "Logging & monitoring",
              chapter: "node-logging-monitoring",
              items: ["Structured logging: morgan, winston, pino", "Health checks"],
            },
            {
              title: "Security fundamentals",
              chapter: "node-security-fundamentals",
              items: ["helmet, input sanitization, rate limiting, CORS"],
            },
            {
              title: "Real-time with WebSockets",
              chapter: "node-websockets",
              items: ["ws and Socket.IO basics"],
            },
            {
              title: "Background jobs & queues",
              chapter: "node-background-jobs",
              items: ["Cron jobs, Redis-backed queues (BullMQ)"],
            },
            {
              title: "Deployment basics",
              chapter: "node-deployment-basics",
              items: ["Process managers (PM2), Docker basics", "Config across environments"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can reason about the runtime under load.",
          blurb:
            "libuv internals, worker threads, profiling a leak, and the architecture decisions behind every production Node service you've ever deployed.",
          bullets: [
            "You can already ship a tested, deployed REST API",
            "You debug latency spikes and memory leaks, not just bugs",
            "You want the why under the event loop, streams and scaling",
          ],
          checkpoint:
            "you can profile a memory leak from a heap snapshot, explain why an endpoint blocked the event loop, and defend a scaling decision (cluster vs workers vs microservices) with tradeoffs.",
          syllabus: [
            {
              title: "Node internals",
              chapter: "node-internals",
              items: ["The libuv thread pool, event loop phases in depth", "process.nextTick, microtask starvation"],
            },
            {
              title: "Worker threads & clustering",
              chapter: "node-worker-threads-clustering",
              items: ["worker_threads for CPU-bound work", "The cluster module, scaling across cores"],
            },
            {
              title: "Streams at scale",
              chapter: "node-streams-scale",
              items: ["Custom streams, transform pipelines", "Backpressure tuning, Web Streams in Node"],
            },
            {
              title: "Performance & profiling",
              chapter: "node-performance-profiling",
              items: ["--prof, clinic.js, heap snapshots", "Memory leaks, flame graphs, benchmarking"],
            },
            {
              title: "AsyncLocalStorage & async_hooks",
              chapter: "node-async-local-storage",
              items: ["Request-scoped context without threading params", "Structured concurrency, cancellation"],
            },
            {
              title: "Scalable architectures",
              chapter: "node-scalable-architectures",
              items: ["Microservices and service boundaries", "API gateways and service discovery (surface level)"],
            },
            {
              title: "Message queues & event-driven systems",
              chapter: "node-message-queues",
              items: [
                "RabbitMQ vs Kafka: topics, partitions, consumer groups",
                "At-least-once vs exactly-once delivery, dead-letter queues",
                "Event-driven architecture vs request/response",
              ],
            },
            {
              title: "Serverless architectures",
              chapter: "node-serverless",
              items: [
                "The execution model: Lambda, Vercel, Cloudflare Workers",
                "Cold starts, statelessness, timeouts",
                "When serverless helps, and when it doesn't",
              ],
            },
            {
              title: "GraphQL & advanced APIs",
              chapter: "node-graphql-apis",
              items: ["Schema design, the N+1 problem, dataloaders"],
            },
            {
              title: "Security in depth",
              chapter: "node-security-depth",
              items: ["OWASP for Node APIs, prototype pollution", "Dependency auditing, secrets management"],
            },
            {
              title: "Native addons",
              chapter: "node-native-addons",
              items: ["N-API basics, when to reach for native code"],
            },
            {
              title: "Observability",
              chapter: "node-observability",
              items: ["Distributed tracing (OpenTelemetry), metrics, APM tooling"],
            },
            {
              title: "TypeScript in Node at scale",
              chapter: "node-typescript-scale",
              items: ["tsconfig for Node, ts-node vs a build step", "Typed environment and config"],
            },
            {
              title: "Build tooling & monorepos",
              chapter: "node-build-tooling-monorepos",
              items: ["Bundling server code, ESM/CJS interop edge cases", "Monorepo tooling for Node services"],
            },
            {
              title: "CI/CD pipelines",
              chapter: "node-ci-cd",
              items: [
                "Pipeline stages: lint, test, build, deploy",
                "GitHub Actions (or equivalent) for a Node service",
                "Environments, secrets in CI, deployment gates",
              ],
            },
            {
              title: "Production readiness",
              chapter: "node-production-readiness",
              items: ["Graceful shutdown, zero-downtime deploys", "Circuit breakers, retries with backoff"],
            },
            {
              title: "Advanced HTTP",
              chapter: "node-advanced-http",
              items: ["HTTP/2, keep-alive tuning, compression, caching headers"],
            },
          ],
        },
      ],
    },
    {
      id: "git",
      name: "Git",
      mark: "⑂",
      accent: "yellow",
      tagline: "Commits, branches, and undo",
      status: "ready",
      notes: "git.html",
      blurb: "What a commit really is, how branches move, rebase vs merge, and how to undo anything without panic.",
    },
    {
      id: "dsa",
      name: "DSA in JS",
      mark: "Σ",
      accent: "ink",
      tagline: "Patterns, not puzzle answers",
      status: "ready",
      notes: "dsa.html",
      blurb:
        'Complexity you can estimate, every classic pattern from two pointers to segment trees, and the interview strategy to turn all of it into offers. Beginner through advanced, laid out the same way as the rest of the shelf — built for top-tier interview prep, not just "pass an easy problem."',
      curriculumNotes: [
        "This curriculum is deliberately pattern-first, not problem-first — every chapter is \"the shape of problem this solves,\" because that's what actually transfers to a problem you've never seen in an interview.",
        "Trees and graphs each get two chapters (structure, then the harder problems built on it) because that split is where most intermediate candidates plateau.",
        "Interview strategy is its own advanced chapter, not an afterthought — knowing the patterns and communicating your thinking clearly under pressure are different skills, and top offers depend on both.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can solve easy problems reliably.",
          blurb:
            "Start with complexity analysis, then the toolkit every pattern is built from: arrays, hashing, two pointers, sliding window, binary search, stacks, linked lists and recursion.",
          bullets: [
            "You know JavaScript's arrays, objects and functions comfortably",
            "You can solve some LeetCode Easy problems, slowly, by trial and error",
            "You want Big-O and the foundational patterns once, in order",
          ],
          checkpoint:
            "you can solve most LeetCode Easy problems in one pass, state the time/space complexity of your solution without guessing, and recognize which basic pattern a new problem wants.",
          syllabus: [
            {
              title: "Complexity analysis",
              chapter: "dsa-complexity-analysis",
              items: ["Big-O, time/space tradeoffs, analyzing your own code"],
            },
            {
              title: "Arrays & strings",
              chapter: "dsa-arrays-strings",
              items: ["Fundamentals, in-place operations, common gotchas"],
            },
            {
              title: "Hashing",
              chapter: "dsa-hashing",
              items: ["Hash maps/sets — when they turn O(n²) into O(n)"],
            },
            {
              title: "Two pointers",
              chapter: "dsa-two-pointers",
              items: ["Opposite-end pointers, fast/slow pointers"],
            },
            {
              title: "Sliding window",
              chapter: "dsa-sliding-window",
              items: ["Fixed-size and variable-size windows"],
            },
            {
              title: "Binary search",
              chapter: "dsa-binary-search",
              items: ["On sorted arrays, and on the answer itself"],
            },
            {
              title: "Sorting algorithms",
              chapter: "dsa-sorting-algorithms",
              items: ["How they work, when to use which, stability"],
            },
            {
              title: "Stacks & queues",
              chapter: "dsa-stacks-queues",
              items: ["The pattern, and a first look at monotonic stacks"],
            },
            {
              title: "Linked lists",
              chapter: "dsa-linked-lists",
              items: ["Traversal, reversal, fast/slow pointer tricks"],
            },
            {
              title: "Basic recursion",
              chapter: "dsa-basic-recursion",
              items: ["Base cases, the call stack, drawing a recursion tree"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can solve mediums and recognize the pattern fast.",
          blurb:
            "You have the toolkit. Now learn the structures and techniques that cover most real interview questions: trees, graphs, backtracking, DP, greedy and bit tricks.",
          bullets: [
            "Comfortable with two pointers, sliding window and basic recursion",
            "You can solve LeetCode Mediums, but slower than you'd like in a live interview",
            "You want tree/graph/DP problems to stop feeling like a fresh puzzle every time",
          ],
          checkpoint:
            "you can solve most LeetCode Medium problems within a 30-45 minute interview window, and explain why you reached for that pattern before you've finished coding it.",
          syllabus: [
            {
              title: "Trees",
              chapter: "dsa-trees",
              items: ["Binary trees, traversals (in/pre/post-order), BST properties"],
            },
            {
              title: "Tree problems in depth",
              chapter: "dsa-tree-problems",
              items: ["Construction, LCA, balance checks, serialization"],
            },
            {
              title: "Heaps & priority queues",
              chapter: "dsa-heaps-priority-queues",
              items: ["The pattern, top-K problems"],
            },
            {
              title: "Graphs: representation & traversal",
              chapter: "dsa-graphs-representation-traversal",
              items: ["Adjacency list/matrix, BFS/DFS"],
            },
            {
              title: "Graph problems",
              chapter: "dsa-graph-problems",
              items: ["Connected components, cycle detection, bipartite checks"],
            },
            {
              title: "Backtracking",
              chapter: "dsa-backtracking",
              items: ["Subsets, permutations, combinations, the N-Queens pattern"],
            },
            {
              title: "Dynamic programming: 1D",
              chapter: "dsa-dp-1d",
              items: ["Memoization to tabulation, the classic 1D problems"],
            },
            {
              title: "Dynamic programming: 2D",
              chapter: "dsa-dp-2d",
              items: ["Grid DP, the knapsack pattern"],
            },
            {
              title: "Greedy algorithms",
              chapter: "dsa-greedy",
              items: ["When greedy actually works, interval scheduling"],
            },
            {
              title: "Intervals",
              chapter: "dsa-intervals",
              items: ["Merge, insert, overlap problems"],
            },
            {
              title: "Bit manipulation",
              chapter: "dsa-bit-manipulation",
              items: ["Common tricks, XOR-based patterns"],
            },
            {
              title: "Matrix problems",
              chapter: "dsa-matrix-problems",
              items: ["Traversal patterns, rotation, spiral order"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can solve hards and design the efficient answer.",
          blurb:
            "Advanced DP, union-find, the harder graph algorithms, tries and segment trees — plus the interview strategy that turns pattern knowledge into offers.",
          bullets: [
            "You can already solve most Mediums within an interview window",
            "LeetCode Hards feel possible, not hopeless, but still take too long",
            "You want the deepest structures and a real interview strategy, not just more problems",
          ],
          checkpoint:
            "you can solve most LeetCode Hard problems by recognizing which advanced structure or DP shape it wants, and run a full mock interview — thinking out loud, handling a hint, landing on a working solution.",
          syllabus: [
            {
              title: "Advanced DP",
              chapter: "dsa-advanced-dp",
              items: ["State machines, DP on trees, bitmask DP"],
            },
            {
              title: "Union-Find (Disjoint Set)",
              chapter: "dsa-union-find",
              items: ["Path compression, union by rank, real applications"],
            },
            {
              title: "Advanced graph algorithms",
              chapter: "dsa-advanced-graph-algorithms",
              items: ["Dijkstra, Bellman-Ford, topological sort"],
            },
            {
              title: "Minimum Spanning Tree",
              chapter: "dsa-minimum-spanning-tree",
              items: ["Kruskal's and Prim's algorithms"],
            },
            {
              title: "Tries",
              chapter: "dsa-tries",
              items: ["Implementation, word search / autocomplete-style problems"],
            },
            {
              title: "Segment trees & Fenwick trees",
              chapter: "dsa-segment-fenwick-trees",
              items: ["Range queries, point updates"],
            },
            {
              title: "String algorithms",
              chapter: "dsa-string-algorithms",
              items: ["KMP, Rabin-Karp, longest-palindromic-substring techniques"],
            },
            {
              title: "Monotonic stack & queue in depth",
              chapter: "dsa-monotonic-stack-queue",
              items: ["Next-greater-element and sliding-window-maximum patterns"],
            },
            {
              title: "Design problems",
              chapter: "dsa-design-problems",
              items: ["LRU/LFU cache, designing a data structure from requirements"],
            },
            {
              title: "Advanced backtracking",
              chapter: "dsa-advanced-backtracking",
              items: ["Pruning strategies, constraint satisfaction"],
            },
            {
              title: "Topological patterns",
              chapter: "dsa-topological-patterns",
              items: ["Course-scheduling-family problems"],
            },
            {
              title: "Interview strategy",
              chapter: "dsa-interview-strategy",
              items: [
                "Approaching an unseen problem, thinking out loud, handling hints",
                "Mock interview technique, company-round expectations",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "docker",
      name: "Docker",
      mark: "🐳",
      accent: "ink",
      tagline: "Images, containers, and Compose",
      status: "ready",
      notes: "docker.html",
      blurb:
        "What a container actually is, writing a Dockerfile that doesn't bloat, and the Compose/registry/CI workflow behind a real deployment. Beginner through advanced, laid out the same way as the rest of the shelf.",
      curriculumNotes: [
        'Compose shows up in beginner as "run two containers together" and again in intermediate as "run them correctly" — healthchecks and dependency order aren\'t optional once a real app has a database.',
        'Registries and CI get their own intermediate chapter because "it works on my machine" usually breaks exactly at the push-an-image step.',
        'Orchestration (Kubernetes/Swarm) is deliberately kept to "when you need it" — this curriculum teaches Docker deeply, not Kubernetes shallowly.',
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can containerize a working app.",
          blurb:
            "Start with what a container actually is, then a Dockerfile, then running it — and a small multi-container app with Compose.",
          bullets: [
            "You've run `docker run` off a tutorial without knowing what happened",
            "You haven't written a Dockerfile from scratch",
            "You want images, containers and Compose once, in order",
          ],
          checkpoint:
            "you can containerize a small app with its own Dockerfile and run it alongside a database using Compose, without copying a tutorial.",
          syllabus: [
            {
              title: "What containers are",
              chapter: "docker-what-are-containers",
              items: ["Images vs containers, Docker vs VMs"],
            },
            {
              title: "Dockerfile basics",
              chapter: "docker-dockerfile-basics",
              items: ["FROM/COPY/RUN/CMD, building an image"],
            },
            {
              title: "Running containers",
              chapter: "docker-running-containers",
              items: ["docker run, ports, volumes (intro), env vars"],
            },
            {
              title: "The Docker CLI",
              chapter: "docker-cli",
              items: ["ps/logs/exec/stop/rm, image management"],
            },
            {
              title: ".dockerignore & build context",
              chapter: "docker-dockerignore-context",
              items: ["What gets sent to the daemon, and why it's slow without this"],
            },
            {
              title: "Multi-stage builds (intro)",
              chapter: "docker-multistage-builds-intro",
              items: ["Why a build stage shouldn't ship in the final image"],
            },
            {
              title: "Docker Compose basics",
              chapter: "docker-compose-basics",
              items: ["Services, one multi-container app"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can ship a real image.",
          blurb:
            "You can containerize an app. Now learn to do it well: caching, networking, persistence, and the registry/CI workflow that gets it to production.",
          bullets: [
            "Comfortable with a Dockerfile and basic Compose",
            "You've waited on a slow rebuild or a stale volume and guessed your way past it",
            "You want an image small and fast enough to actually deploy",
          ],
          checkpoint:
            "you can write a cache-efficient, non-root Dockerfile, wire real networking and persistence in Compose, and push a tagged image through CI.",
          syllabus: [
            {
              title: "Dockerfile best practices",
              chapter: "docker-dockerfile-best-practices",
              items: ["Layer caching, image size, non-root users"],
            },
            {
              title: "Networking",
              chapter: "docker-networking",
              items: ["Bridge networks, container-to-container communication"],
            },
            {
              title: "Volumes & persistence",
              chapter: "docker-volumes-persistence",
              items: ["Named volumes vs bind mounts"],
            },
            {
              title: "Docker Compose in depth",
              chapter: "docker-compose-depth",
              items: ["Dependencies, healthchecks, profiles"],
            },
            {
              title: "Environment-specific configs",
              chapter: "docker-env-configs",
              items: ["Dev vs prod compose files"],
            },
            {
              title: "Debugging containers",
              chapter: "docker-debugging",
              items: ["exec, logs, inspecting layers"],
            },
            {
              title: "Registries",
              chapter: "docker-registries",
              items: ["Docker Hub, pushing/pulling, tagging strategy"],
            },
            {
              title: "Docker with CI/CD",
              chapter: "docker-ci-cd",
              items: ["Building and pushing images in a pipeline"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can reason about the build and the daemon.",
          blurb:
            "Build caching internals, security hardening, and the orchestration decisions behind a container platform running in production.",
          bullets: [
            "You can already ship a small, cached, non-root image through CI",
            'You debug slow builds and container security findings, not just "it won\'t start"',
            "You want the why under namespaces, cgroups and BuildKit",
          ],
          checkpoint:
            "you can profile and shrink a slow build, defend a hardening checklist for a production image, and explain when Docker Compose stops being enough.",
          syllabus: [
            {
              title: "Orchestration basics",
              chapter: "docker-orchestration-basics",
              items: ["When you need Kubernetes or Swarm"],
            },
            {
              title: "Security",
              chapter: "docker-security",
              items: ["Image scanning, least privilege, secrets management"],
            },
            {
              title: "Build performance",
              chapter: "docker-build-performance",
              items: ["BuildKit caching strategies, image layer optimization"],
            },
            {
              title: "Production Compose / Swarm",
              chapter: "docker-production-compose-swarm",
              items: ["Compose/Swarm for small production deployments"],
            },
            {
              title: "Observability for containers",
              chapter: "docker-observability",
              items: ["Logging drivers, metrics"],
            },
            {
              title: "Multi-arch builds",
              chapter: "docker-multiarch-builds",
              items: ["buildx, ARM vs x86"],
            },
            {
              title: "Container internals",
              chapter: "docker-internals",
              items: ['Namespaces, cgroups — what "container" actually means'],
            },
          ],
        },
      ],
    },
    {
      id: "databases",
      name: "SQL & Databases",
      mark: "DB",
      accent: "mint",
      tagline: "Schemas, queries, and scale",
      status: "ready",
      notes: "databases.html",
      blurb:
        "The relational model, indexes and query plans, transactions, and the scaling decisions behind a database that holds up. Beginner through advanced, laid out the same way as the rest of the shelf.",
      curriculumNotes: [
        "Indexes and EXPLAIN plans sit in intermediate, not advanced — reading a query plan is an everyday skill, not a rare one, for anyone shipping real queries.",
        "NoSQL gets one honest intermediate chapter on when to choose it, not a whole separate track — the goal is a working mental model, not a second curriculum.",
        "Sharding, consensus and distributed transactions are the deepest, rarest layer — most working backend engineers never operate at that scale, but the advanced tier doesn't skip it.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can query and shape real data.",
          blurb: "Start with tables, rows and keys, then SELECT, JOIN and the basic shape of a schema.",
          bullets: [
            "You've copied SQL queries before without fully trusting them",
            "You haven't designed a schema from scratch",
            "You want SELECT, JOIN and basic schema design once, in order",
          ],
          checkpoint:
            "you can design a small normalized schema and write the SELECT/JOIN/aggregate queries to answer real questions against it.",
          syllabus: [
            {
              title: "The relational model",
              chapter: "sql-relational-model",
              items: ["Tables, rows, columns, keys"],
            },
            {
              title: "SELECT fundamentals",
              chapter: "sql-select-fundamentals",
              items: ["Filtering, sorting, limiting"],
            },
            {
              title: "Joins",
              chapter: "sql-joins",
              items: ["Inner/left/right/full, when to use each"],
            },
            {
              title: "Aggregations",
              chapter: "sql-aggregations",
              items: ["GROUP BY, HAVING, common aggregate functions"],
            },
            {
              title: "Inserting, updating, deleting",
              chapter: "sql-insert-update-delete",
              items: ["Writing data safely"],
            },
            {
              title: "Data types & constraints",
              chapter: "sql-data-types-constraints",
              items: ["NOT NULL, UNIQUE, CHECK, defaults"],
            },
            {
              title: "Basic schema design",
              chapter: "sql-schema-design-basics",
              items: ["Primary/foreign keys, normalization (intro)"],
            },
            {
              title: "Using a database client",
              chapter: "sql-db-client-basics",
              items: ["psql/mysql CLI or a GUI client, the basics"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can design and tune a real database.",
          blurb:
            "You can query. Now learn what makes it fast and safe: indexes, transactions, query plans, and when to reach for an ORM or NoSQL instead.",
          bullets: [
            "Comfortable with SELECT/JOIN/GROUP BY and basic schema design",
            "You've had a query go from instant to slow as data grew, and guessed why",
            "You want to design a schema and read a query plan with confidence",
          ],
          checkpoint:
            "you can add the right index to fix a slow query, explain a transaction's isolation level, and choose SQL vs NoSQL for a given problem with reasons.",
          syllabus: [
            {
              title: "Normalization in depth",
              chapter: "sql-normalization-depth",
              items: ["1NF/2NF/3NF, when to denormalize on purpose"],
            },
            {
              title: "Indexes",
              chapter: "sql-indexes",
              items: ["How they work (B-trees), when they help or hurt"],
            },
            {
              title: "Transactions",
              chapter: "sql-transactions",
              items: ["ACID, isolation levels, locking"],
            },
            {
              title: "Subqueries & CTEs",
              chapter: "sql-subqueries-ctes",
              items: ["Recursive CTEs, window functions"],
            },
            {
              title: "Query performance",
              chapter: "sql-query-performance",
              items: ["EXPLAIN/EXPLAIN ANALYZE, reading a query plan"],
            },
            {
              title: "NoSQL fundamentals",
              chapter: "sql-nosql-fundamentals",
              items: ["Document/key-value/column stores, when to choose NoSQL"],
            },
            {
              title: "ORMs",
              chapter: "sql-orms",
              items: ["Prisma/TypeORM/Mongoose mental models, the N+1 problem"],
            },
            {
              title: "Migrations",
              chapter: "sql-migrations",
              items: ["Schema versioning, safe migrations on live data"],
            },
            {
              title: "Backups & replication basics",
              chapter: "sql-backups-replication",
              items: ["Backup strategy, basic replication concepts"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can reason about the storage engine.",
          blurb:
            "MVCC, sharding, the CAP theorem, and the case-study thinking behind designing a schema for a system that has to scale.",
          bullets: [
            "You can already tune indexes and read a query plan",
            "You debug replication lag and lock contention, not just slow queries",
            "You want the why under MVCC, sharding and distributed transactions",
          ],
          checkpoint:
            "you can design a sharding strategy for a growing table, explain MVCC's role in your database's isolation guarantees, and defend a schema for a real case study.",
          syllabus: [
            {
              title: "Database internals",
              chapter: "sql-database-internals",
              items: ["Storage engines, MVCC, how a B-tree index actually works"],
            },
            {
              title: "Scaling reads",
              chapter: "sql-scaling-reads",
              items: ["Replication, read replicas, connection pooling at scale"],
            },
            {
              title: "Scaling writes",
              chapter: "sql-scaling-writes",
              items: ["Sharding strategies, partitioning"],
            },
            {
              title: "Advanced transactions",
              chapter: "sql-advanced-transactions",
              items: ["Distributed transactions, the CAP theorem"],
            },
            {
              title: "Caching layers in front of a database",
              chapter: "sql-caching-layers",
              items: ["Redis, materialized views"],
            },
            {
              title: "Database security in depth",
              chapter: "sql-security-depth",
              items: ["Least privilege, SQL injection prevention in depth"],
            },
            {
              title: "Time-series & analytical databases",
              chapter: "sql-timeseries-analytical",
              items: ["Surface level — when OLTP isn't the right tool"],
            },
            {
              title: "Designing a schema for a real system",
              chapter: "sql-schema-case-study",
              items: ["Case-study thinking, end to end"],
            },
          ],
        },
      ],
    },
    {
      id: "system-design",
      name: "System Design",
      mark: "SD",
      accent: "yellow",
      tagline: "How the pieces fit at scale",
      status: "ready",
      notes: "system-design.html",
      blurb:
        'Load balancers, caches, queues and the tradeoff thinking behind every "design X" interview question. Beginner through advanced, laid out the same way as the rest of the shelf.',
      curriculumNotes: [
        "This curriculum leans on the other topics on this shelf on purpose — the databases chapter here assumes you already have SQL & Databases, the queues chapter assumes Node's message-queues chapter. System design is where they combine.",
        "Every level ends in a walkthrough (URL shortener → news feed → real case studies) because tradeoff thinking is a conversation skill, not a fact you memorize.",
        "Distributed consensus and chaos engineering are the deepest, rarest layer — most system design interviews never go there, but the advanced tier doesn't skip it.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can reason about a simple system.",
          blurb:
            "Start with the client-server model and the handful of building blocks — load balancers, databases, caches, APIs — that every design question reuses.",
          bullets: [
            "You can build an app, but haven't been asked to design one at scale",
            '"System design interview" sounds intimidating and vague right now',
            "You want the building blocks once, in order, before the tradeoffs",
          ],
          checkpoint:
            "you can walk through designing something like a URL shortener end to end — client, API, database, cache — and explain each choice.",
          syllabus: [
            {
              title: "What system design interviews test",
              chapter: "sysdes-interview-mental-model",
              items: ["The mental model behind the question"],
            },
            {
              title: "Client-server basics",
              chapter: "sysdes-client-server-basics",
              items: ["DNS, load balancers, the request lifecycle"],
            },
            {
              title: "Scaling: vertical vs horizontal",
              chapter: "sysdes-scaling-vertical-horizontal",
              items: ["The two knobs, and why horizontal wins eventually"],
            },
            {
              title: "Databases in system design",
              chapter: "sysdes-databases-in-design",
              items: ["SQL vs NoSQL choice, read/write patterns"],
            },
            {
              title: "Caching fundamentals",
              chapter: "sysdes-caching-fundamentals",
              items: ["Where caches go, cache invalidation basics"],
            },
            {
              title: "APIs & communication",
              chapter: "sysdes-apis-communication",
              items: ["REST vs RPC vs GraphQL at a system level"],
            },
            {
              title: "Walkthrough: a URL shortener",
              chapter: "sysdes-walkthrough-simple",
              items: ["A simple end-to-end design, start to finish"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can design for real traffic.",
          blurb:
            "You know the building blocks. Now learn how they behave under real load: load balancing algorithms, CDNs, queues, and consistency tradeoffs.",
          bullets: [
            "Comfortable with the client/server/cache/database building blocks",
            'You\'ve heard "eventual consistency" and nodded without being sure',
            "You want a medium-sized design (a feed, a chat app) to feel tractable",
          ],
          checkpoint:
            "you can design a medium-sized system (a news feed or chat app) with load balancing, caching, queues and a stated consistency model.",
          syllabus: [
            {
              title: "Load balancing in depth",
              chapter: "sysdes-load-balancing-depth",
              items: ["Algorithms, L4 vs L7, health checks"],
            },
            {
              title: "CDNs",
              chapter: "sysdes-cdns",
              items: ["How they work, cache-control, edge caching"],
            },
            {
              title: "Message queues & async processing",
              chapter: "sysdes-message-queues-async",
              items: ["Decoupling services with a queue"],
            },
            {
              title: "Consistency models",
              chapter: "sysdes-consistency-models",
              items: ["Strong vs eventual consistency"],
            },
            {
              title: "Rate limiting & throttling",
              chapter: "sysdes-rate-limiting",
              items: ["Strategies and where they live in the stack"],
            },
            {
              title: "Designing for availability",
              chapter: "sysdes-availability-design",
              items: ["Redundancy, failover, health checks"],
            },
            {
              title: "Storage systems",
              chapter: "sysdes-storage-systems",
              items: ["Object/blob storage, when to use what"],
            },
            {
              title: "Search systems (surface)",
              chapter: "sysdes-search-systems",
              items: ["Inverted indexes, Elasticsearch basics"],
            },
            {
              title: "Walkthrough: a news feed / chat app",
              chapter: "sysdes-walkthrough-medium",
              items: ["A medium end-to-end design, start to finish"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can defend a design under pressure.",
          blurb:
            "The CAP theorem in depth, sharding at scale, distributed consensus, and the capacity math behind designing something like Twitter or Uber.",
          bullets: [
            "You can already design a medium-sized system with tradeoffs",
            'You want to defend a design against "what if this fails" follow-ups',
            "You want the why under consensus, sharding and capacity estimation",
          ],
          checkpoint:
            "you can run a full system design interview conversation for a large-scale system, with back-of-envelope numbers and a defensible failure story.",
          syllabus: [
            {
              title: "The CAP theorem in depth",
              chapter: "sysdes-cap-theorem-depth",
              items: ["Consistency tradeoffs, real-world examples"],
            },
            {
              title: "Sharding & partitioning at scale",
              chapter: "sysdes-sharding-partitioning",
              items: ["Strategies, rebalancing, hot shards"],
            },
            {
              title: "Distributed consensus (surface)",
              chapter: "sysdes-distributed-consensus",
              items: ["Leader election, Raft/Paxos concepts"],
            },
            {
              title: "Designing for fault tolerance",
              chapter: "sysdes-fault-tolerance",
              items: ["Circuit breakers, bulkheads, chaos engineering"],
            },
            {
              title: "Observability at scale",
              chapter: "sysdes-observability-scale",
              items: ["SLIs/SLOs/SLAs, distributed tracing"],
            },
            {
              title: "Capacity estimation",
              chapter: "sysdes-capacity-estimation",
              items: ["Back-of-envelope math"],
            },
            {
              title: "Real-world case studies",
              chapter: "sysdes-case-studies",
              items: ["Designing something like Twitter/Uber/Netflix, high level"],
            },
            {
              title: "Tradeoff thinking",
              chapter: "sysdes-tradeoff-thinking",
              items: ["How to run the conversation, not just the design"],
            },
          ],
        },
      ],
    },
    {
      id: "testing",
      name: "Testing",
      mark: "✓",
      accent: "mint",
      tagline: "Unit, integration, e2e, and trust",
      status: "ready",
      notes: "testing.html",
      blurb:
        "The testing pyramid, mocking that doesn't lie, and the e2e/contract/visual layers that catch what unit tests can't. Beginner through advanced, laid out the same way as the rest of the shelf.",
      curriculumNotes: [
        "This is the one topic on the shelf that's explicitly cross-stack — every other topic has its own testing chapter for that stack's tools, this one is about testing as a discipline: what to test where, and why.",
        "TDD gets its own intermediate chapter, not a beginner one, on purpose — red-green-refactor only clicks once you've written enough tests the boring way to feel the difference.",
        "Mutation testing and contract testing are the deepest, rarest layer — most working developers never reach for them, but the advanced tier doesn't skip them.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can write a trustworthy unit test.",
          blurb:
            "Start with why we test at all, then the mechanics — assertions, structure, mocking, async — on plain functions before anything else.",
          bullets: [
            "You've written a script and hoped it worked, rather than proved it",
            "You haven't used a test runner (Jest/Vitest) on your own project",
            "You want the testing pyramid and the basics once, in order",
          ],
          checkpoint:
            "you can write a well-structured unit test suite for a small module, including async code and basic mocks, and read a coverage report honestly.",
          syllabus: [
            {
              title: "Why we test",
              chapter: "testing-why-pyramid",
              items: ["The testing pyramid: unit / integration / e2e"],
            },
            {
              title: "Unit testing fundamentals",
              chapter: "testing-unit-fundamentals",
              items: ["Jest/Vitest basics, assertions, the AAA test structure"],
            },
            {
              title: "Testing pure functions",
              chapter: "testing-pure-functions",
              items: ["The easiest case, and why it's a good place to start"],
            },
            {
              title: "Mocking basics",
              chapter: "testing-mocking-basics",
              items: ["Mocking modules, functions and timers"],
            },
            {
              title: "Testing async code",
              chapter: "testing-async-code",
              items: ["Promises and async/await inside a test"],
            },
            {
              title: "Code coverage",
              chapter: "testing-code-coverage",
              items: ["What it measures, and what it can't tell you"],
            },
            {
              title: "Running tests in CI",
              chapter: "testing-in-ci",
              items: ["The basics of wiring a test run into a pipeline"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can test a real application.",
          blurb:
            "You can unit test a function. Now test a real app: components, APIs, databases, and the discipline (TDD/BDD) behind writing tests first.",
          bullets: [
            "Comfortable with a test runner, assertions and basic mocks",
            "You've had a passing test suite miss a real bug",
            "You want tests that catch regressions, not just satisfy a coverage number",
          ],
          checkpoint:
            "you can test a component and its backing API end to end, with realistic fixtures and network mocking, and explain when a test is flaky vs actually broken.",
          syllabus: [
            {
              title: "Test-driven development",
              chapter: "testing-tdd",
              items: ["Red-green-refactor, in practice"],
            },
            {
              title: "Testing UI components",
              chapter: "testing-ui-components",
              items: ["Testing Library queries, user-event, testing behavior not implementation"],
            },
            {
              title: "Testing APIs & backends",
              chapter: "testing-apis-backends",
              items: ["supertest, integration tests against a real server"],
            },
            {
              title: "Snapshot testing",
              chapter: "testing-snapshots",
              items: ["When it helps, when it just lies to you"],
            },
            {
              title: "Fixtures & test data",
              chapter: "testing-fixtures-data",
              items: ["Factories, seeding, test isolation"],
            },
            {
              title: "Mocking network requests",
              chapter: "testing-mocking-network",
              items: ["Mock Service Worker (MSW) and friends"],
            },
            {
              title: "Testing against a database",
              chapter: "testing-databases",
              items: ["Test databases, per-test transactions, in-memory DBs"],
            },
            {
              title: "Behavior-driven development",
              chapter: "testing-bdd",
              items: ["Gherkin/Cucumber, surface level"],
            },
            {
              title: "Flaky tests",
              chapter: "testing-flaky-tests",
              items: ["Common causes, and how to actually fix them"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can design a test strategy.",
          blurb:
            "End-to-end, visual regression, contract and mutation testing — and the judgment call of what to test where, at the scale of a real system.",
          bullets: [
            "You can already test components and APIs with realistic fixtures",
            "You've owned a flaky, slow suite that nobody trusted",
            "You want the why under contract testing and test architecture at scale",
          ],
          checkpoint:
            'you can design a test strategy for a multi-service system — what runs where, what\'s e2e vs contract-tested — and defend it against "why not just test everything end to end."',
          syllabus: [
            {
              title: "End-to-end testing",
              chapter: "testing-e2e",
              items: ["Cypress vs Playwright, the page object pattern"],
            },
            {
              title: "Visual regression testing",
              chapter: "testing-visual-regression",
              items: ["Screenshot diffing, and its false positives"],
            },
            {
              title: "Contract testing",
              chapter: "testing-contract",
              items: ["Pact, consumer-driven contracts between services"],
            },
            {
              title: "Performance testing",
              chapter: "testing-performance",
              items: ["Load testing (k6/Artillery), benchmarking"],
            },
            {
              title: "Accessibility testing",
              chapter: "testing-accessibility",
              items: ["Automated checks (axe) plus manual testing"],
            },
            {
              title: "Test architecture at scale",
              chapter: "testing-architecture-scale",
              items: ["Organizing a large suite, parallelization"],
            },
            {
              title: "Mutation testing",
              chapter: "testing-mutation",
              items: ["Measuring test quality beyond coverage"],
            },
            {
              title: "Test strategy",
              chapter: "testing-strategy",
              items: ["What to test where — the pyramid, in practice"],
            },
          ],
        },
      ],
    },
    {
      id: "security",
      name: "Web Security",
      mark: "🔒",
      accent: "red",
      tagline: "OWASP, auth, and the attacker's view",
      status: "ready",
      notes: "security.html",
      blurb:
        "Injection, XSS, CSRF, broken auth, and the OWASP Top 10 — from the mistakes that cause them to the architecture that prevents them. Beginner through advanced, laid out the same way as the rest of the shelf.",
      curriculumNotes: [
        'Every beginner chapter here pairs a real vulnerability with the specific mistake that causes it — security sticks better as "here\'s what goes wrong" than as a rulebook.',
        "The OWASP Top 10 itself is an advanced chapter, not the first one — by then most of it is already familiar from earlier chapters, and it reads as a checklist instead of a wall of jargon.",
        "Compliance (GDPR/SOC2) is the deepest, least code-focused layer — most developers never own it directly, but the advanced tier doesn't skip why it shapes engineering decisions.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can spot the obvious mistakes.",
          blurb:
            "Start with the mindset, then the classics — injection, XSS, weak auth — the mistakes that show up in almost every real breach.",
          bullets: [
            "You've shipped a login form without thinking hard about it",
            '"XSS" and "SQL injection" are names you\'ve heard, not things you\'ve prevented on purpose',
            "You want the common vulnerabilities once, in order, with the fix each time",
          ],
          checkpoint:
            "you can look at a form or API endpoint and name the injection/XSS/auth risks in it, plus the specific fix for each.",
          syllabus: [
            {
              title: "The security mindset",
              chapter: "security-mindset",
              items: ["Why security is everyone's job, basic threat modeling"],
            },
            {
              title: "Injection attacks",
              chapter: "security-injection",
              items: ["SQL injection, command injection — how they actually happen"],
            },
            {
              title: "Cross-Site Scripting (XSS)",
              chapter: "security-xss",
              items: ["Stored, reflected, and DOM-based XSS"],
            },
            {
              title: "Authentication basics",
              chapter: "security-auth-basics",
              items: ["Password hashing (bcrypt), common mistakes"],
            },
            {
              title: "HTTPS & transport security",
              chapter: "security-transport",
              items: ["TLS basics, why plain HTTP isn't enough"],
            },
            {
              title: "Sensitive data exposure",
              chapter: "security-data-exposure",
              items: ["What not to log, store, or return in a response"],
            },
            {
              title: "Security headers",
              chapter: "security-headers",
              items: ["CSP, X-Frame-Options, HSTS — surface level"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can secure a real application.",
          blurb:
            "You know the classics. Now learn CSRF, access control, OAuth, and the API/dependency/config hygiene that closes the rest of the gaps.",
          bullets: [
            "Comfortable with XSS/injection and basic password hashing",
            'You\'ve wired up "Login with Google" without fully understanding the flow',
            "You want a real app's auth and API surface actually secured",
          ],
          checkpoint:
            "you can secure a real API's auth, sessions, and CORS/CSRF surface, and explain an OAuth flow well enough to debug it.",
          syllabus: [
            {
              title: "CSRF",
              chapter: "security-csrf",
              items: ["Tokens, SameSite cookies"],
            },
            {
              title: "Broken access control",
              chapter: "security-access-control",
              items: ["IDOR, privilege escalation"],
            },
            {
              title: "Session management",
              chapter: "security-session-management",
              items: ["Secure cookies, session fixation, token expiry"],
            },
            {
              title: "OAuth & OpenID Connect",
              chapter: "security-oauth-oidc",
              items: ["The flows, and the common mistakes in implementing them"],
            },
            {
              title: "API security",
              chapter: "security-api",
              items: ["Rate limiting, API keys, validating input at the boundary"],
            },
            {
              title: "Dependency & supply-chain security",
              chapter: "security-supply-chain",
              items: ["npm audit, lockfiles, SBOM basics"],
            },
            {
              title: "CORS in depth",
              chapter: "security-cors-depth",
              items: ["What it actually protects against — and what it doesn't"],
            },
            {
              title: "Security misconfiguration",
              chapter: "security-misconfiguration",
              items: ["Default credentials, verbose errors, open ports"],
            },
            {
              title: "Secrets management",
              chapter: "security-secrets",
              items: ["Env vars, vaults, never committing secrets"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can think like an attacker.",
          blurb:
            "The full OWASP Top 10 in context, cryptography basics, and the architecture (zero trust, defense in depth) behind a security-mature system.",
          bullets: [
            "You can already secure a real app's auth, sessions and API surface",
            "You want to run a security review, not just fix findings handed to you",
            "You want the why under SSRF, prototype pollution and zero trust",
          ],
          checkpoint:
            "you can run a security review against the OWASP Top 10, explain a cryptographic misuse bug, and defend an incident-response plan.",
          syllabus: [
            {
              title: "The OWASP Top 10",
              chapter: "security-owasp-top-10",
              items: ["The full list, in context, one pass"],
            },
            {
              title: "Prototype pollution & deserialization attacks",
              chapter: "security-prototype-pollution-deserialization",
              items: ["How untrusted data becomes code execution"],
            },
            {
              title: "Server-Side Request Forgery (SSRF)",
              chapter: "security-ssrf",
              items: ["Tricking a server into requesting what it shouldn't"],
            },
            {
              title: "Security testing",
              chapter: "security-testing-tools",
              items: ["SAST/DAST tools, penetration testing basics"],
            },
            {
              title: "Cryptography for developers",
              chapter: "security-cryptography",
              items: ["Symmetric vs asymmetric, common misuse"],
            },
            {
              title: "Zero trust & defense in depth",
              chapter: "security-zero-trust",
              items: ["Architectural thinking, not just a checklist"],
            },
            {
              title: "Incident response",
              chapter: "security-incident-response",
              items: ["What to actually do when a breach happens"],
            },
            {
              title: "Compliance basics",
              chapter: "security-compliance-basics",
              items: ["GDPR/SOC2, surface level — why they shape engineering"],
            },
          ],
        },
      ],
    },
    {
      id: "cloud-devops",
      name: "Cloud & DevOps",
      mark: "☁",
      accent: "blue",
      tagline: "AWS/GCP, IaC, and shipping it",
      status: "ready",
      notes: "cloud-devops.html",
      blurb:
        "Compute, storage, IAM, and the pipeline that gets code from a laptop to production — provider-agnostic where it can be, concrete where it has to be. Beginner through advanced, laid out the same way as the rest of the shelf.",
      curriculumNotes: [
        'IAM shows up in beginner as "the four ideas you need" and again in advanced as "cross-account, federated, at scale" — access control is the thing that quietly causes the worst incidents either way.',
        "This deliberately bridges into Docker and Kubernetes rather than re-teaching them — containers-as-a-service (ECS/Cloud Run) is the advanced chapter's bridge, not a rebuild of either curriculum.",
        "FinOps and multi-account strategy are the deepest, most organization-shaped layer — most individual developers never own them, but the advanced tier doesn't skip them.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can deploy a working app to the cloud.",
          blurb:
            'Start with what "the cloud" actually is — compute, storage, networking, IAM — and get a small app deployed and reachable.',
          bullets: [
            "You've deployed to something like Vercel/Netlify but not a raw cloud provider",
            "EC2, S3 and IAM are names you've seen, not things you've configured",
            "You want the building blocks once, in order, before Terraform and pipelines",
          ],
          checkpoint:
            "you can deploy a small app to a cloud VM or serverless function yourself, with the right IAM role and no exposed secrets.",
          syllabus: [
            {
              title: "Cloud computing fundamentals",
              chapter: "cloud-fundamentals",
              items: ["IaaS/PaaS/SaaS, why cloud at all"],
            },
            {
              title: "Compute basics",
              chapter: "cloud-compute-basics",
              items: ["EC2/VMs vs serverless functions"],
            },
            {
              title: "Storage basics",
              chapter: "cloud-storage-basics",
              items: ["Object storage (S3), block storage, when to use each"],
            },
            {
              title: "Networking basics",
              chapter: "cloud-networking-basics",
              items: ["VPCs, subnets, security groups — surface level"],
            },
            {
              title: "IAM",
              chapter: "cloud-iam-basics",
              items: ["Users, roles, policies, least privilege"],
            },
            {
              title: "Deploying a simple app",
              chapter: "cloud-first-deploy",
              items: ["Putting it together end to end"],
            },
            {
              title: "The cloud provider landscape",
              chapter: "cloud-provider-landscape",
              items: ["AWS vs GCP vs Azure — picking one"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can run a real service in the cloud.",
          blurb:
            "You can deploy an app. Now learn what a real service needs: a managed database, autoscaling, IaC, and a pipeline that ships changes safely.",
          bullets: [
            "Comfortable deploying a single app manually",
            "You've clicked through a console to change something and known it wasn't repeatable",
            "You want infrastructure defined as code, and a pipeline you trust",
          ],
          checkpoint:
            "you can stand up a load-balanced, autoscaled service with a managed database, defined in Terraform, deployed by a CI/CD pipeline.",
          syllabus: [
            {
              title: "Managed databases",
              chapter: "cloud-managed-databases",
              items: ["RDS-style managed Postgres/Mongo, backups"],
            },
            {
              title: "Load balancers & auto-scaling",
              chapter: "cloud-load-balancing-autoscaling",
              items: ["Distributing traffic, scaling with demand"],
            },
            {
              title: "Serverless in depth",
              chapter: "cloud-serverless-depth",
              items: ["Lambda/Cloud Functions, triggers, cold starts"],
            },
            {
              title: "Infrastructure as Code",
              chapter: "cloud-iac",
              items: ["Terraform/CloudFormation basics"],
            },
            {
              title: "CI/CD pipelines in the cloud",
              chapter: "cloud-ci-cd",
              items: ["A deploy pipeline, end to end"],
            },
            {
              title: "Monitoring & logging",
              chapter: "cloud-monitoring-logging",
              items: ["CloudWatch/Cloud Logging basics"],
            },
            {
              title: "Environments & config",
              chapter: "cloud-environments-config",
              items: ["Dev/staging/prod, secrets in the cloud"],
            },
            {
              title: "CDN & edge",
              chapter: "cloud-cdn-edge",
              items: ["CloudFront/Cloud CDN"],
            },
            {
              title: "Cost management",
              chapter: "cloud-cost-management",
              items: ["Reading a cloud bill, avoiding surprises"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can architect for real scale.",
          blurb:
            "Multi-region availability, container platforms, and the security/cost decisions behind a cloud footprint that spans an organization.",
          bullets: [
            "You can already ship a service via IaC and a real pipeline",
            "You debug regional outages and IAM edge cases, not just deploy failures",
            "You want the why under multi-account strategy and disaster recovery",
          ],
          checkpoint:
            "you can design a multi-region, highly-available architecture, defend a disaster-recovery plan (RTO/RPO), and explain the shared-responsibility model.",
          syllabus: [
            {
              title: "Multi-region & high availability",
              chapter: "cloud-multiregion-ha",
              items: ["Designing for a region going down"],
            },
            {
              title: "Container services",
              chapter: "cloud-container-services",
              items: ["ECS/Fargate/Cloud Run — the bridge to Kubernetes"],
            },
            {
              title: "Advanced IAM",
              chapter: "cloud-advanced-iam",
              items: ["Cross-account roles, federated identity"],
            },
            {
              title: "Disaster recovery",
              chapter: "cloud-disaster-recovery",
              items: ["Backup strategy, RTO/RPO"],
            },
            {
              title: "Observability at scale",
              chapter: "cloud-observability-scale",
              items: ["Distributed tracing in the cloud"],
            },
            {
              title: "Security in the cloud",
              chapter: "cloud-security",
              items: ["Shared responsibility model, encryption at rest/transit"],
            },
            {
              title: "Landing zones & multi-account strategy",
              chapter: "cloud-landing-zones",
              items: ["Organizing many accounts/projects at scale"],
            },
            {
              title: "FinOps",
              chapter: "cloud-finops",
              items: ["Optimizing cost at scale"],
            },
          ],
        },
      ],
    },
    {
      id: "graphql",
      name: "GraphQL",
      mark: "◈",
      accent: "ink",
      tagline: "One endpoint, a real type system",
      status: "ready",
      notes: "graphql.html",
      blurb:
        "The schema, resolvers, and the N+1 problem — then federation, caching, and the security tradeoffs behind a production GraphQL API. Beginner through advanced, laid out the same way as the rest of the shelf.",
      curriculumNotes: [
        'The N+1 problem and DataLoader get their own intermediate chapter because it\'s the single most common "why is this GraphQL API slow" answer — it deserves more than a footnote inside resolvers.',
        "GraphQL vs REST vs tRPC is placed in advanced, not beginner, on purpose — that comparison only means something once you've actually built resolvers, pagination and auth in GraphQL yourself.",
        "Federation is the deepest, most infrastructure-shaped layer — most teams building a single GraphQL API never need it, but the advanced tier doesn't skip it.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can build a working GraphQL API.",
          blurb:
            "Start with the schema and the type system, then queries, mutations and resolvers — a small API and a client talking to it.",
          bullets: [
            "You know REST APIs and basic Node/Express",
            "You haven't written a GraphQL schema or resolver yourself",
            "You want queries, mutations and resolvers once, in order",
          ],
          checkpoint:
            "you can design a small schema, write its resolvers, and query it from a real client, without copying a tutorial.",
          syllabus: [
            {
              title: "What GraphQL is & why",
              chapter: "graphql-what-why",
              items: ["vs REST, the core ideas"],
            },
            {
              title: "Schema & types",
              chapter: "graphql-schema-types",
              items: ["Scalars, object types, the type system"],
            },
            {
              title: "Queries",
              chapter: "graphql-queries",
              items: ["Fields, arguments, variables"],
            },
            {
              title: "Mutations",
              chapter: "graphql-mutations",
              items: ["Writing data"],
            },
            {
              title: "Resolvers",
              chapter: "graphql-resolvers",
              items: ["How a query actually becomes data"],
            },
            {
              title: "Setting up a GraphQL server",
              chapter: "graphql-server-setup",
              items: ["Apollo Server / GraphQL Yoga basics"],
            },
            {
              title: "A GraphQL client",
              chapter: "graphql-client-basics",
              items: ["Apollo Client / urql basics, fetching in a UI"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can design a real schema.",
          blurb:
            "You can query and mutate. Now design a schema that scales: nullability, pagination, auth, real-time subscriptions, and a cache that stays correct.",
          bullets: [
            "Comfortable with queries, mutations and basic resolvers",
            "You've hit the N+1 problem and just added more resolvers",
            "You want a schema and client cache a real app can grow into",
          ],
          checkpoint:
            "you can design a paginated, authenticated schema with DataLoader-batched resolvers, and keep a normalized client cache correct after mutations.",
          syllabus: [
            {
              title: "Schema design",
              chapter: "graphql-schema-design",
              items: ["Nullability, input types, enums, interfaces/unions"],
            },
            {
              title: "The N+1 problem & DataLoader",
              chapter: "graphql-n-plus-one-dataloader",
              items: ["Batching and caching resolver calls"],
            },
            {
              title: "Authentication & authorization",
              chapter: "graphql-auth",
              items: ["Guarding fields and resolvers"],
            },
            {
              title: "Error handling",
              chapter: "graphql-error-handling",
              items: ["Errors in a GraphQL response, partial data"],
            },
            {
              title: "Pagination patterns",
              chapter: "graphql-pagination",
              items: ["Cursor-based (Relay-style) vs offset pagination"],
            },
            {
              title: "Subscriptions",
              chapter: "graphql-subscriptions",
              items: ["Real-time GraphQL"],
            },
            {
              title: "Caching in GraphQL clients",
              chapter: "graphql-client-caching",
              items: ["Normalized caches, updating after a mutation"],
            },
            {
              title: "Testing a GraphQL API",
              chapter: "graphql-testing",
              items: ["Testing resolvers and schema behavior"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can run GraphQL in production.",
          blurb:
            "Federation, query-cost security, and the honest comparison against REST and tRPC — the decisions behind a GraphQL gateway at scale.",
          bullets: [
            "You can already design a paginated, authenticated schema",
            "You debug slow resolvers and abusive queries, not just N+1s",
            "You want the why under federation and query-complexity limits",
          ],
          checkpoint:
            "you can split a graph across services with federation, defend a query-cost limiting strategy, and make the call between GraphQL, REST and tRPC with reasons.",
          syllabus: [
            {
              title: "Federation & schema stitching",
              chapter: "graphql-federation",
              items: ["Splitting a graph across services"],
            },
            {
              title: "Performance",
              chapter: "graphql-performance",
              items: ["Query complexity limits, depth limiting, persisted queries"],
            },
            {
              title: "Security in GraphQL",
              chapter: "graphql-security",
              items: ["Introspection in production, rate limiting by query cost"],
            },
            {
              title: "Code-first vs schema-first at scale",
              chapter: "graphql-codefirst-schemafirst",
              items: ["The tradeoffs once a team is involved"],
            },
            {
              title: "GraphQL vs REST vs tRPC",
              chapter: "graphql-vs-rest-vs-trpc",
              items: ["When each one actually wins"],
            },
            {
              title: "Monitoring a GraphQL API",
              chapter: "graphql-monitoring",
              items: ["Tracing resolver performance"],
            },
            {
              title: "A production-grade GraphQL gateway",
              chapter: "graphql-production-gateway",
              items: ["Putting the pieces together"],
            },
          ],
        },
      ],
    },
    {
      id: "redis",
      name: "Redis",
      mark: "◆",
      accent: "red",
      tagline: "Cache, queue, and pub/sub, fast",
      status: "ready",
      notes: "redis.html",
      blurb:
        "In-memory data structures, the cache-aside pattern, and the pub/sub, rate-limiting and queue patterns Redis quietly powers everywhere. Beginner through advanced, laid out the same way as the rest of the shelf.",
      curriculumNotes: [
        "Redis's data types get a whole beginner chapter to themselves — hashes, sets and sorted sets solve real problems (leaderboards, dedup, tagging) that a plain key-value cache can't.",
        "Rate limiting is intermediate, not advanced, because it's one of the most common reasons a working app reaches for Redis at all — it's not a niche use case.",
        "Redis as a primary datastore and Redis Streams are the deepest, least common layer — most Redis usage is \"just a cache,\" but the advanced tier doesn't skip when it's more than that.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can use Redis as a cache.",
          blurb:
            "Start with what Redis actually is and its core data types, then the cache-aside pattern — the 80% use case.",
          bullets: [
            "You've seen Redis mentioned in a docker-compose file without knowing what it did",
            "You haven't written to or read from Redis yourself",
            "You want the core data types and caching once, in order",
          ],
          checkpoint:
            "you can add a Redis cache in front of a slow query, with correct TTLs and invalidation, and explain why it's faster.",
          syllabus: [
            {
              title: "What Redis is",
              chapter: "redis-what-is-it",
              items: ["An in-memory data store, and why that makes it fast"],
            },
            {
              title: "Basic data types",
              chapter: "redis-data-types-basics",
              items: ["Strings, hashes, lists, sets, sorted sets"],
            },
            {
              title: "Setting up & connecting",
              chapter: "redis-setup-connecting",
              items: ["redis-cli, a client library"],
            },
            {
              title: "Expiration & TTLs",
              chapter: "redis-ttls",
              items: ["How keys expire, and why that matters"],
            },
            {
              title: "Redis as a cache",
              chapter: "redis-cache-aside",
              items: ["The cache-aside pattern"],
            },
            {
              title: "A caching example end to end",
              chapter: "redis-caching-example",
              items: ["Putting the basic commands into a real flow"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can use Redis for more than caching.",
          blurb:
            "You can cache with Redis. Now learn pub/sub, sessions, rate limiting, queues, and the persistence/transaction model underneath it all.",
          bullets: [
            "Comfortable with the core data types and basic caching",
            "You've reached for a heavier tool when Redis pub/sub would've done the job",
            "You want Redis as a session store, rate limiter and lightweight queue",
          ],
          checkpoint:
            "you can build a sliding-window rate limiter and a real-time pub/sub feature in Redis, and explain RDB vs AOF tradeoffs.",
          syllabus: [
            {
              title: "Pub/Sub",
              chapter: "redis-pubsub",
              items: ["Real-time messaging with Redis"],
            },
            {
              title: "Redis as a session store",
              chapter: "redis-session-store",
              items: ["Storing and expiring sessions"],
            },
            {
              title: "Rate limiting with Redis",
              chapter: "redis-rate-limiting",
              items: ["Sliding window, token bucket"],
            },
            {
              title: "Redis for queues",
              chapter: "redis-queues",
              items: ["Simple job queues, and where BullMQ fits"],
            },
            {
              title: "Persistence",
              chapter: "redis-persistence",
              items: ["RDB vs AOF, when it actually matters"],
            },
            {
              title: "Data structures in depth",
              chapter: "redis-data-structures-depth",
              items: ["Sorted sets for leaderboards, HyperLogLog"],
            },
            {
              title: "Transactions in Redis",
              chapter: "redis-transactions",
              items: ["MULTI/EXEC, optimistic locking with WATCH"],
            },
            {
              title: "Connecting Redis to a real app",
              chapter: "redis-real-app-connection",
              items: ["Connection pooling, error handling"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can run Redis in production.",
          blurb:
            "Clustering, high availability, and the performance tuning behind a Redis deployment that's more than a single-instance cache.",
          bullets: [
            "You can already build rate limiters and pub/sub features in Redis",
            "You debug memory pressure and eviction surprises, not just cache misses",
            "You want the why under clustering, Sentinel and eviction policies",
          ],
          checkpoint:
            "you can design a highly-available Redis deployment (Cluster + Sentinel), tune eviction policy for a memory-constrained workload, and defend using Redis as more than a cache.",
          syllabus: [
            {
              title: "Redis Cluster",
              chapter: "redis-cluster",
              items: ["Sharding and replication"],
            },
            {
              title: "High availability",
              chapter: "redis-high-availability",
              items: ["Sentinel, failover"],
            },
            {
              title: "Performance tuning",
              chapter: "redis-performance-tuning",
              items: ["Memory management, eviction policies"],
            },
            {
              title: "Redis as a primary datastore",
              chapter: "redis-primary-datastore",
              items: ["When it's more than a cache"],
            },
            {
              title: "Redis Streams",
              chapter: "redis-streams",
              items: ["Event-sourcing-style patterns"],
            },
            {
              title: "Security",
              chapter: "redis-security",
              items: ["ACLs, TLS, avoiding exposed instances"],
            },
            {
              title: "Scaling Redis in production",
              chapter: "redis-scaling-production",
              items: ["Real-world case-study thinking"],
            },
          ],
        },
      ],
    },
    {
      id: "kubernetes",
      name: "Kubernetes",
      mark: "☸",
      accent: "mint",
      tagline: "Orchestration, at the object level",
      status: "ready",
      notes: "kubernetes.html",
      blurb:
        "Pods, Deployments and Services first, then the networking, storage and RBAC that make a cluster production-grade — and the operator/GitOps layer on top. Beginner through advanced, laid out the same way as the rest of the shelf.",
      curriculumNotes: [
        "This assumes Docker already — it starts at \"why one container isn't enough,\" not at what a container is. If that's shaky, the Docker topic on this shelf comes first.",
        "Helm shows up in intermediate, not beginner, on purpose — templating manifests only makes sense once you've felt the pain of writing several by hand.",
        "Service meshes and GitOps are the deepest, most infrastructure-team layer — most application developers on a cluster never operate them directly, but the advanced tier doesn't skip them.",
      ],
      levels: [
        {
          id: "beginner",
          name: "Beginner",
          mark: "1",
          tagline: "I can run a working app on a cluster.",
          blurb:
            "Start with the core objects — Pods, Deployments, Services — and a local cluster you can actually deploy to.",
          bullets: [
            "You're comfortable with Docker and a Dockerfile",
            "You haven't run kubectl against a real cluster before",
            "You want Pods, Deployments and Services once, in order",
          ],
          checkpoint:
            "you can write a Deployment and Service manifest from scratch and run it on a local cluster (minikube/kind), without copying a tutorial.",
          syllabus: [
            {
              title: "What Kubernetes is & why",
              chapter: "k8s-what-why",
              items: ["The orchestration problem it actually solves"],
            },
            {
              title: "Pods, Deployments & Services",
              chapter: "k8s-core-objects",
              items: ["The core objects, and how they relate"],
            },
            {
              title: "kubectl basics",
              chapter: "k8s-kubectl-basics",
              items: ["The CLI workflow"],
            },
            {
              title: "Namespaces & basic organization",
              chapter: "k8s-namespaces-basics",
              items: ["Grouping resources sensibly"],
            },
            {
              title: "ConfigMaps & Secrets",
              chapter: "k8s-configmaps-secrets",
              items: ["Getting config and secrets into a Pod"],
            },
            {
              title: "A local cluster",
              chapter: "k8s-local-cluster",
              items: ["minikube/kind, running your first app"],
            },
            {
              title: "YAML manifests",
              chapter: "k8s-yaml-manifests",
              items: ["Reading and writing them without fear"],
            },
          ],
        },
        {
          id: "intermediate",
          name: "Intermediate",
          mark: "2",
          tagline: "I can run a real cluster.",
          blurb:
            "You can deploy a Pod. Now learn what a real cluster needs: networking, storage, health checks, autoscaling, Helm, and RBAC.",
          bullets: [
            "Comfortable with core objects and kubectl",
            "You've had a Pod crash-loop and stared at `kubectl get pods` for answers",
            "You want a cluster that's actually production-shaped",
          ],
          checkpoint:
            "you can deploy an app with an Ingress, persistent storage, health checks and autoscaling, packaged as a Helm chart, through a CI/CD pipeline.",
          syllabus: [
            {
              title: "Deployments in depth",
              chapter: "k8s-deployments-depth",
              items: ["Rolling updates, rollbacks, replicas"],
            },
            {
              title: "Services & networking",
              chapter: "k8s-services-networking",
              items: ["ClusterIP, NodePort, LoadBalancer, Ingress"],
            },
            {
              title: "Persistent storage",
              chapter: "k8s-persistent-storage",
              items: ["PersistentVolumes, PersistentVolumeClaims"],
            },
            {
              title: "Health checks",
              chapter: "k8s-health-checks",
              items: ["Liveness, readiness, startup probes"],
            },
            {
              title: "Resource management",
              chapter: "k8s-resource-management",
              items: ["Requests/limits, autoscaling (HPA)"],
            },
            {
              title: "Helm",
              chapter: "k8s-helm",
              items: ["Packaging and templating manifests"],
            },
            {
              title: "Namespaces & RBAC",
              chapter: "k8s-rbac",
              items: ["Access control basics"],
            },
            {
              title: "CI/CD to Kubernetes",
              chapter: "k8s-ci-cd",
              items: ["Deploying from a pipeline"],
            },
            {
              title: "Debugging a cluster",
              chapter: "k8s-debugging",
              items: ["Logs, exec, describe, common failure modes"],
            },
          ],
        },
        {
          id: "advanced",
          name: "Advanced",
          mark: "3",
          tagline: "I can reason about the control plane.",
          blurb:
            "Cluster architecture, custom resources, service meshes, and the GitOps/observability layer behind a cluster run at organizational scale.",
          bullets: [
            "You can already ship a production-shaped app to a cluster",
            "You debug scheduler and networking edge cases, not just crash loops",
            "You want the why under the control plane, meshes and GitOps",
          ],
          checkpoint:
            "you can explain the control plane's role in a scheduling decision, defend when a service mesh earns its complexity, and design a GitOps deployment flow.",
          syllabus: [
            {
              title: "Cluster architecture",
              chapter: "k8s-cluster-architecture",
              items: ["Control plane, etcd, kubelet, scheduler"],
            },
            {
              title: "Custom Resources & Operators",
              chapter: "k8s-crds-operators",
              items: ["Extending the API, automating operational knowledge"],
            },
            {
              title: "Service meshes",
              chapter: "k8s-service-mesh",
              items: ["Istio/Linkerd basics, when you actually need one"],
            },
            {
              title: "Multi-cluster & multi-tenancy",
              chapter: "k8s-multicluster-multitenancy",
              items: ["Strategies for running more than one cluster"],
            },
            {
              title: "Security",
              chapter: "k8s-security",
              items: ["Pod Security Standards, network policies, image scanning"],
            },
            {
              title: "Observability",
              chapter: "k8s-observability",
              items: ["Prometheus/Grafana on Kubernetes"],
            },
            {
              title: "Cost & resource optimization",
              chapter: "k8s-cost-optimization",
              items: ["Right-sizing at scale"],
            },
            {
              title: "GitOps",
              chapter: "k8s-gitops",
              items: ["ArgoCD/Flux, declarative cluster management"],
            },
          ],
        },
      ],
    },
  ],
};

(function () {
  const js = topics.topics.find(function (t) {
    return t.id === "js";
  })!;
  js.levels = topics.levels;
  js.curriculumNotes = topics.curriculumNotes;
})();
