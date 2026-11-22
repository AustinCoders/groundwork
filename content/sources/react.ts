import type { TopicSources } from "./types";

// cspell:ignore Pipeable

export const reactSources: TopicSources = {
  "react-setup-jsx": [
    {
      label: "React docs: Writing Markup with JSX",
      url: "https://react.dev/learn/writing-markup-with-jsx",
      kind: "docs",
      backs:
        "States the JSX rules the chapter lists: one root element, every tag closed, and camelCase attribute names such as className.",
    },
    {
      label: "React Blog: Introducing the New JSX Transform",
      url: "https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html",
      kind: "article",
      backs:
        "Explains why older code imports React for React.createElement and how the automatic runtime imports jsx from react/jsx-runtime.",
    },
    {
      label: "React docs: createRoot",
      url: "https://react.dev/reference/react-dom/client/createRoot",
      kind: "docs",
      backs: "Documents createRoot and root.render, the entry point where a React app attaches to a DOM node.",
    },
    {
      label: "React docs: Build a React app from Scratch",
      url: "https://react.dev/learn/build-a-react-app-from-scratch",
      kind: "docs",
      backs: "Recommends Vite as a build tool for starting a React project without a framework.",
    },
  ],
  "react-thinking": [
    {
      label: "React docs: Thinking in React",
      url: "https://react.dev/learn/thinking-in-react",
      kind: "docs",
      backs:
        "The five step process the chapter follows: component hierarchy, static version, minimal state, where state lives, inverse data flow.",
    },
    {
      label: "React docs: Choosing the State Structure",
      url: "https://react.dev/learn/choosing-the-state-structure",
      kind: "docs",
      backs: "Backs the rule that anything computable from props or other state should not be stored as state.",
    },
    {
      label: "React docs: Sharing State Between Components",
      url: "https://react.dev/learn/sharing-state-between-components",
      kind: "docs",
      backs: "Describes moving state to the closest common parent, which is step four of the process.",
    },
  ],
  "react-components": [
    {
      label: "React docs: Your First Component",
      url: "https://react.dev/learn/your-first-component",
      kind: "docs",
      backs:
        "States that component names must start with a capital letter and that components must not be defined inside other components.",
    },
    {
      label: "React docs: Keeping Components Pure",
      url: "https://react.dev/learn/keeping-components-pure",
      kind: "docs",
      backs:
        "Defines purity for components: same inputs, same output, and no changes to things that existed before the render.",
    },
    {
      label: "React docs: Passing JSX as children",
      url: "https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children",
      kind: "docs",
      backs:
        "Shows that nested JSX arrives in the children prop, the basis of the composition and slot patterns in the chapter.",
    },
    {
      label: "React docs: Understanding Your UI as a Tree",
      url: "https://react.dev/learn/understanding-your-ui-as-a-tree",
      kind: "docs",
      backs: "Describes the render tree of components as distinct from the DOM tree the browser holds.",
    },
  ],
  "react-props": [
    {
      label: "React docs: Passing Props to a Component",
      url: "https://react.dev/learn/passing-props-to-a-component",
      kind: "docs",
      backs: "Covers destructuring props, default values, spreading, and the rule that props are read-only snapshots.",
    },
    {
      label: "React 19 Upgrade Guide: Removed propTypes and defaultProps for functions",
      url: "https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-proptypes-and-defaultprops",
      kind: "docs",
      backs:
        "Confirms React 19 removed propTypes checks and defaultProps for function components in favour of default parameters.",
    },
    {
      label: "React v19: ref as a prop",
      url: "https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop",
      kind: "docs",
      backs:
        "Confirms that from React 19 function components receive ref as a prop and new code no longer needs forwardRef.",
    },
    {
      label: "React docs: Rendering Lists, rules of keys",
      url: "https://react.dev/learn/rendering-lists#rules-of-keys",
      kind: "docs",
      backs: "Notes that a component does not receive key as a prop, one of the two props React keeps for itself.",
    },
  ],
  "react-usestate": [
    {
      label: "React docs: useState",
      url: "https://react.dev/reference/react/useState",
      kind: "docs",
      backs:
        "Reference for initializer functions, updater functions, the Object.is bailout and replacing rather than mutating state.",
    },
    {
      label: "React docs: State as a Snapshot",
      url: "https://react.dev/learn/state-as-a-snapshot",
      kind: "docs",
      backs: "Explains that each render sees a fixed snapshot of state and that setting state requests a new render.",
    },
    {
      label: "React docs: Queueing a Series of State Updates",
      url: "https://react.dev/learn/queueing-a-series-of-state-updates",
      kind: "docs",
      backs: "Describes batching and how updater functions are queued and applied in order during the next render.",
    },
    {
      label: "React v18.0: Automatic Batching",
      url: "https://react.dev/blog/2022/03/29/react-v18#new-feature-automatic-batching",
      kind: "article",
      backs: "Confirms React 18 extended batching to promises, setTimeout and native event handlers.",
    },
    {
      label: "React docs: Updating Objects in State",
      url: "https://react.dev/learn/updating-objects-in-state",
      kind: "docs",
      backs:
        "Backs the rule that state objects are replaced with copies, including nested objects, rather than mutated.",
    },
  ],
  "react-events-conditionals": [
    {
      label: "React docs: Responding to Events",
      url: "https://react.dev/learn/responding-to-events",
      kind: "docs",
      backs: "Covers passing handlers as props, event propagation, stopPropagation and preventDefault.",
    },
    {
      label: "React docs: Conditional Rendering",
      url: "https://react.dev/learn/conditional-rendering",
      kind: "docs",
      backs: "Covers if, the ternary, && and returning null, including the pitfall of a number on the left of &&.",
    },
    {
      label: "React Blog: React v17.0, changes to event delegation",
      url: "https://legacy.reactjs.org/blog/2020/10/20/react-v17.html#changes-to-event-delegation",
      kind: "article",
      backs:
        "States that React attaches event handlers at the root container since 17 and that event pooling was removed in 17.",
    },
    {
      label: "MDN: KeyboardEvent keyCode property",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode",
      kind: "docs",
      backs: "Marks keyCode as deprecated and points to KeyboardEvent.key instead.",
    },
  ],
  "react-lists-keys": [
    {
      label: "React docs: Rendering Lists",
      url: "https://react.dev/learn/rendering-lists",
      kind: "docs",
      backs: "Gives the rules of keys: unique among siblings, must not change, and why index keys are a poor default.",
    },
    {
      label: "React docs: Preserving and Resetting State, resetting state with a key",
      url: "https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key",
      kind: "docs",
      backs:
        "Shows that changing a key makes React discard the old component and its state, the reset trick in the chapter.",
    },
    {
      label: "React docs (legacy): Reconciliation, recursing on children",
      url: "https://legacy.reactjs.org/docs/reconciliation.html#recursing-on-children",
      kind: "docs",
      backs:
        "Describes how React matches children by key when diffing a list, and what goes wrong with index keys on reorder.",
    },
    {
      label: "MDN: Crypto randomUUID() method",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID",
      kind: "docs",
      backs: "Documents crypto.randomUUID(), which the chapter suggests for generating a key when an item is created.",
    },
  ],
  "react-forms": [
    {
      label: "React docs: input",
      url: "https://react.dev/reference/react-dom/components/input",
      kind: "docs",
      backs:
        "Defines controlled inputs driven by value or checked with onChange, and uncontrolled inputs using defaultValue.",
    },
    {
      label: "React docs: select",
      url: "https://react.dev/reference/react-dom/components/select",
      kind: "docs",
      backs:
        "Shows that React sets the selected option through a value prop on select rather than a selected attribute.",
    },
    {
      label: "React docs: form",
      url: "https://react.dev/reference/react-dom/components/form",
      kind: "docs",
      backs:
        "Documents the form action prop that receives FormData, the React 19 feature the uncontrolled section points to.",
    },
    {
      label: "MDN: The label element",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label",
      kind: "docs",
      backs:
        "Explains how a label is associated with a control and why that matters for screen readers and click targets.",
    },
  ],
  "react-useeffect-basics": [
    {
      label: "React docs: useEffect",
      url: "https://react.dev/reference/react/useEffect",
      kind: "docs",
      backs: "Reference for setup and cleanup, the dependency array, and comparison of dependencies with Object.is.",
    },
    {
      label: "React docs: Synchronizing with Effects",
      url: "https://react.dev/learn/synchronizing-with-effects",
      kind: "docs",
      backs:
        "Explains effects as synchronisation with external systems, when they run, and fetching with an ignore flag in cleanup.",
    },
    {
      label: "React docs: You Might Not Need an Effect",
      url: "https://react.dev/learn/you-might-not-need-an-effect",
      kind: "docs",
      backs: "Backs the claim that derived data and event handling do not belong in effects.",
    },
    {
      label: "React docs: exhaustive-deps lint rule",
      url: "https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps",
      kind: "docs",
      backs: "Describes the lint rule that checks dependency arrays and why suppressing it leads to stale values.",
    },
  ],
  "react-lifting-styling": [
    {
      label: "React docs: Sharing State Between Components",
      url: "https://react.dev/learn/sharing-state-between-components",
      kind: "docs",
      backs:
        "Covers lifting state up to the closest common parent and the controlled versus uncontrolled component distinction.",
    },
    {
      label: "React docs: Passing Data Deeply with Context, before you use context",
      url: "https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context",
      kind: "docs",
      backs: "Recommends passing JSX as children to remove layers of prop drilling before reaching for context.",
    },
    {
      label: "CSS Modules specification repository",
      url: "https://github.com/css-modules/css-modules",
      kind: "code",
      backs: "Defines CSS Modules as CSS files whose class names are scoped locally by default.",
    },
    {
      label: "MDN: Using CSS custom properties (variables)",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties",
      kind: "docs",
      backs:
        "Documents CSS custom properties and var(), the mechanism behind the design tokens the chapter recommends.",
    },
  ],
  "react-guided-project": [
    {
      label: "React docs: Updating Arrays in State",
      url: "https://react.dev/learn/updating-arrays-in-state",
      kind: "docs",
      backs:
        "Shows adding, removing and replacing array items with spread, filter and map instead of mutating, as the task board does.",
    },
    {
      label: "React docs: Thinking in React",
      url: "https://react.dev/learn/thinking-in-react",
      kind: "docs",
      backs: "The model first, static render second, state third order that the project steps follow.",
    },
    {
      label: "MDN: Window localStorage property",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
      kind: "docs",
      backs:
        "Documents localStorage as string key and value storage that persists across sessions, used in the persistence step.",
    },
    {
      label: "React docs: Your First Component, nesting and organizing components",
      url: "https://react.dev/learn/your-first-component#nesting-and-organizing-components",
      kind: "docs",
      backs:
        "Warns against defining a component inside another component, the mistake the chapter asks you to make on purpose.",
    },
  ],
  "react-useref": [
    {
      label: "React docs: useRef",
      url: "https://react.dev/reference/react/useRef",
      kind: "docs",
      backs:
        "Reference for both jobs of useRef: holding a DOM node and holding a value whose change does not trigger a re-render.",
    },
    {
      label: "React docs: Referencing Values with Refs",
      url: "https://react.dev/learn/referencing-values-with-refs",
      kind: "docs",
      backs: "Compares refs with state and warns against reading or writing ref.current during rendering.",
    },
    {
      label: "React docs: Manipulating the DOM with Refs",
      url: "https://react.dev/learn/manipulating-the-dom-with-refs",
      kind: "docs",
      backs: "Covers focusing and scrolling through refs, ref callbacks for lists, and refs to your own components.",
    },
  ],
  "react-context": [
    {
      label: "React docs: createContext",
      url: "https://react.dev/reference/react/createContext",
      kind: "docs",
      backs: "States that the default value is only used when there is no matching provider above the component.",
    },
    {
      label: "React docs: useContext, optimizing re-renders when passing objects and functions",
      url: "https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions",
      kind: "docs",
      backs: "Confirms every consumer re-renders when the provider value changes and shows memoising the value object.",
    },
    {
      label: "React v19: Context as a provider",
      url: "https://react.dev/blog/2024/12/05/react-19#context-as-a-provider",
      kind: "article",
      backs: "Confirms that React 19 renders the context itself as the provider in place of Context.Provider.",
    },
    {
      label: "React docs: Scaling Up with Reducer and Context",
      url: "https://react.dev/learn/scaling-up-with-reducer-and-context",
      kind: "docs",
      backs: "Shows splitting state and dispatch into two contexts, the split by change frequency pattern.",
    },
  ],
  "react-usereducer": [
    {
      label: "React docs: useReducer",
      url: "https://react.dev/reference/react/useReducer",
      kind: "docs",
      backs:
        "Reference for reducer, initial argument and init function, the stable dispatch identity, and double calls in Strict Mode.",
    },
    {
      label: "React docs: Extracting State Logic into a Reducer",
      url: "https://react.dev/learn/extracting-state-logic-into-a-reducer",
      kind: "docs",
      backs:
        "Backs naming actions after what the user did and keeping reducers pure, with requests left in event handlers.",
    },
    {
      label: "React docs: Scaling Up with Reducer and Context",
      url: "https://react.dev/learn/scaling-up-with-reducer-and-context",
      kind: "docs",
      backs: "The reducer plus context combination the chapter calls the poor man's store.",
    },
  ],
  "react-custom-hooks": [
    {
      label: "React docs: Reusing Logic with Custom Hooks",
      url: "https://react.dev/learn/reusing-logic-with-custom-hooks",
      kind: "docs",
      backs: "States that hook names start with use and that custom hooks share stateful logic, not state itself.",
    },
    {
      label: "React docs: useDebugValue",
      url: "https://react.dev/reference/react/useDebugValue",
      kind: "docs",
      backs: "Documents useDebugValue for labelling a custom hook in React DevTools, with deferred formatting.",
    },
    {
      label: "React docs: Rules of Hooks",
      url: "https://react.dev/reference/rules/rules-of-hooks",
      kind: "docs",
      backs:
        "States that hooks are only called at the top level and only from React functions, which applies inside custom hooks too.",
    },
  ],
  "react-effects-depth": [
    {
      label: "React docs: useEffectEvent",
      url: "https://react.dev/reference/react/useEffectEvent",
      kind: "docs",
      backs:
        "Reference for Effect Events, which read the latest props and state without being listed as effect dependencies.",
    },
    {
      label: "React 19.2: useEffectEvent",
      url: "https://react.dev/blog/2025/10/01/react-19-2#use-effect-event",
      kind: "article",
      backs: "Confirms useEffectEvent shipped as a stable API in React 19.2.",
    },
    {
      label: "React docs: Removing Effect Dependencies",
      url: "https://react.dev/learn/removing-effect-dependencies",
      kind: "docs",
      backs:
        "Backs treating the dependency list as a description of the code and changing the code in order to change the list.",
    },
    {
      label: "React docs: You Might Not Need an Effect, adjusting some state when a prop changes",
      url: "https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes",
      kind: "docs",
      backs: "Shows the pattern of adjusting state during render in place of an effect that sets state.",
    },
    {
      label: "React docs: useEffect, fetching data with Effects",
      url: "https://react.dev/reference/react/useEffect#fetching-data-with-effects",
      kind: "docs",
      backs: "Shows the ignore flag in cleanup that stops a stale response from overwriting a newer one.",
    },
  ],
  "react-router": [
    {
      label: "React Router docs: Picking a Mode",
      url: "https://reactrouter.com/start/modes",
      kind: "docs",
      backs: "Describes the three modes, declarative, data and framework, and which features each one adds.",
    },
    {
      label: "React Router changelog: v8.0.0",
      url: "https://reactrouter.com/changelog#v800",
      kind: "docs",
      backs:
        "Dates v8.0.0 to 17 June 2026 and records the removal of react-router-dom and middleware being always enabled.",
    },
    {
      label: "React Router docs: Data Loading (data mode)",
      url: "https://reactrouter.com/start/data/data-loading",
      kind: "docs",
      backs:
        "Documents route loaders that provide data to the route component before it renders, read with useLoaderData.",
    },
    {
      label: "React Router docs: Actions (framework mode)",
      url: "https://reactrouter.com/start/framework/actions",
      kind: "docs",
      backs: "Documents route actions, Form, and useFetcher for mutations that should not cause a navigation.",
    },
    {
      label: "React Router docs: Route Module Type Safety",
      url: "https://reactrouter.com/how-to/route-module-type-safety",
      kind: "docs",
      backs: "Explains the generated +types files that give each route module typed params and loader data.",
    },
    {
      label: "React Router docs: ScrollRestoration",
      url: "https://reactrouter.com/api/components/ScrollRestoration",
      kind: "docs",
      backs:
        "Documents the component that restores scroll position on navigation, the piece the chapter says is often forgotten.",
    },
  ],
  "react-state-architecture": [
    {
      label: "React docs: Choosing the State Structure",
      url: "https://react.dev/learn/choosing-the-state-structure",
      kind: "docs",
      backs:
        "Lists the structuring principles the chapter applies: avoid contradictions, redundancy, duplication and deep nesting.",
    },
    {
      label: "Redux docs: Normalizing State Shape",
      url: "https://redux.js.org/usage/structuring-reducers/normalizing-state-shape",
      kind: "docs",
      backs:
        "Describes storing entities in tables keyed by id with references by id, as the normalisation section recommends.",
    },
    {
      label: "TanStack Query docs: Does TanStack Query replace Redux, MobX or other global state managers?",
      url: "https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state",
      kind: "docs",
      backs: "Separates server state, which is a cache of remote data, from the small amount of true client state.",
    },
    {
      label: "React docs: Sharing State Between Components",
      url: "https://react.dev/learn/sharing-state-between-components",
      kind: "docs",
      backs:
        "Backs keeping a single source of truth per piece of state and lifting it only as far as the closest common parent.",
    },
  ],
  "react-memoisation": [
    {
      label: "React docs: memo",
      url: "https://react.dev/reference/react/memo",
      kind: "docs",
      backs:
        "States that memo compares props with Object.is, that a new object or function prop defeats it, and documents arePropsEqual.",
    },
    {
      label: "React docs: useMemo",
      url: "https://react.dev/reference/react/useMemo",
      kind: "docs",
      backs: "Covers when caching a calculation is worth it and how dependency comparison decides whether it re-runs.",
    },
    {
      label: "React Blog: React Compiler v1.0",
      url: "https://react.dev/blog/2025/10/07/react-compiler-1",
      kind: "article",
      backs:
        "Dates the 1.0 release to 7 October 2025 and covers Expo SDK 54, Vite and Next.js templates and React 17 and 18 support.",
    },
    {
      label: "React docs: React Compiler introduction",
      url: "https://react.dev/learn/react-compiler/introduction",
      kind: "docs",
      backs:
        "Explains automatic memoisation and keeps useMemo and useCallback as an escape hatch, for example for an effect dependency.",
    },
    {
      label: "React docs: compilationMode",
      url: "https://react.dev/reference/react-compiler/compilationMode",
      kind: "docs",
      backs: "Documents the annotation, infer and all modes and the use memo and use no memo directives.",
    },
  ],
  "react-boundaries-portals": [
    {
      label: "React docs: Component, catching rendering errors with an Error Boundary",
      url: "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary",
      kind: "docs",
      backs:
        "Confirms error boundaries need getDerivedStateFromError or componentDidCatch and cannot yet be written as function components.",
    },
    {
      label: "React docs (legacy): Error Boundaries",
      url: "https://legacy.reactjs.org/docs/error-boundaries.html",
      kind: "docs",
      backs:
        "Lists what boundaries do not catch, event handlers and asynchronous code, and that an uncaught error unmounts the whole tree.",
    },
    {
      label: "React docs: createPortal",
      url: "https://react.dev/reference/react-dom/createPortal",
      kind: "docs",
      backs: "States that a portal only changes the DOM placement and that events still bubble through the React tree.",
    },
    {
      label: "MDN: The dialog element",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog",
      kind: "docs",
      backs:
        "Shows what a modal needs beyond a portal: the rest of the page made inert, Esc to close, and managed focus.",
    },
    {
      label: "React docs: Preserving and Resetting State",
      url: "https://react.dev/learn/preserving-and-resetting-state",
      kind: "docs",
      backs: "Explains that state is tied to a position in the tree and that a different key resets it.",
    },
  ],
  "react-data-fetching": [
    {
      label: "React docs: useEffect, fetching data with Effects",
      url: "https://react.dev/reference/react/useEffect#fetching-data-with-effects",
      kind: "docs",
      backs:
        "Lists the downsides of fetching in effects: race conditions, no caching, network waterfalls and no server rendering.",
    },
    {
      label: "MDN: Window fetch() method",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch",
      kind: "docs",
      backs:
        "Confirms a fetch promise does not reject on HTTP error statuses such as 404, so the response status must be checked.",
    },
    {
      label: "RFC 5861: HTTP Cache-Control Extensions for Stale Content",
      url: "https://datatracker.ietf.org/doc/html/rfc5861",
      kind: "spec",
      backs: "Defines stale-while-revalidate: serve the stale response while a background request refreshes it.",
    },
    {
      label: "Next.js docs: Fetching Data",
      url: "https://nextjs.org/docs/app/getting-started/fetching-data",
      kind: "docs",
      backs: "Shows fetching in async Server Components on the server, the alternative the chapter ends with.",
    },
  ],
  "react-forms-at-scale": [
    {
      label: "React Hook Form docs: useFieldArray",
      url: "https://react-hook-form.com/docs/usefieldarray",
      kind: "docs",
      backs: "Documents dynamic field arrays and the generated field.id that must be used as the key.",
    },
    {
      label: "React Hook Form docs: register",
      url: "https://react-hook-form.com/docs/useform/register",
      kind: "docs",
      backs: "Shows that register returns name, onChange, onBlur and ref, so inputs stay uncontrolled.",
    },
    {
      label: "React Hook Form docs: setError",
      url: "https://react-hook-form.com/docs/useform/seterror",
      kind: "docs",
      backs:
        "Documents setting an error on a named field by hand, which is how server validation errors map back to fields.",
    },
    {
      label: "Zod documentation: Introduction",
      url: "https://zod.dev/",
      kind: "docs",
      backs:
        "Describes schema validation with static type inference, so one schema gives both the runtime check and the type.",
    },
    {
      label: "React docs: useActionState",
      url: "https://react.dev/reference/react/useActionState",
      kind: "docs",
      backs: "Documents form action state, the pending flag, and forms that work before hydration.",
    },
  ],
  "react-state-libraries": [
    {
      label: "Zustand docs: useShallow",
      url: "https://zustand.docs.pmnd.rs/reference/hooks/use-shallow",
      kind: "docs",
      backs:
        "Documents useShallow for selectors that return a new object or array each time, avoiding needless re-renders.",
    },
    {
      label: "Zustand docs: persist middleware",
      url: "https://zustand.docs.pmnd.rs/reference/middlewares/persist",
      kind: "docs",
      backs:
        "Documents persisting a store, with options to keep only part of the state, a version number and a migrate function.",
    },
    {
      label: "Redux Toolkit docs: Usage Guide",
      url: "https://redux.js.org/toolkit/usage/usage-guide",
      kind: "docs",
      backs: "Covers configureStore and createSlice, with Immer letting reducers be written as if they mutate state.",
    },
    {
      label: "Redux Toolkit docs: RTK Query Overview",
      url: "https://redux.js.org/toolkit/rtk-query/overview",
      kind: "docs",
      backs: "Describes RTK Query as the data fetching and caching layer built on Redux Toolkit.",
    },
    {
      label: "Jotai repository README",
      url: "https://github.com/pmndrs/jotai",
      kind: "code",
      backs:
        "Shows primitive atoms and derived atoms computed from other atoms, the model the chapter contrasts with a single store.",
    },
    {
      label: "Recoil repository on GitHub (archived)",
      url: "https://github.com/facebookexperimental/Recoil",
      kind: "code",
      backs: "Shows the repository was archived by its owner on 1 January 2025 and is read-only.",
    },
  ],
  "react-auth": [
    {
      label: "OWASP Cheat Sheet Series: HTML5 Security",
      url: "https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html",
      kind: "docs",
      backs:
        "Advises against keeping session identifiers in localStorage because any script on the page can read them.",
    },
    {
      label: "MDN: Set-Cookie header",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie",
      kind: "docs",
      backs:
        "Documents the HttpOnly attribute, which hides a cookie from JavaScript, and the SameSite values Lax and Strict.",
    },
    {
      label: "RFC 7636: Proof Key for Code Exchange by OAuth Public Clients",
      url: "https://datatracker.ietf.org/doc/html/rfc7636",
      kind: "spec",
      backs: "Defines PKCE, the code verifier and challenge added to the authorisation code flow for public clients.",
    },
    {
      label: "RFC 9700: Best Current Practice for OAuth 2.0 Security",
      url: "https://datatracker.ietf.org/doc/html/rfc9700",
      kind: "spec",
      backs:
        "States that clients should not use the implicit grant and should use the authorisation code flow with PKCE.",
    },
    {
      label: "MDN: BroadcastChannel",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel",
      kind: "docs",
      backs: "Documents messaging between tabs of the same origin, used to propagate a logout to every open tab.",
    },
  ],
  "react-server-state": [
    {
      label: "TanStack Query docs: Important Defaults",
      url: "https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults",
      kind: "docs",
      backs: "States that cached data is stale by default and lists the triggers that refetch stale queries.",
    },
    {
      label: "TanStack Query docs: Query Keys",
      url: "https://tanstack.com/query/latest/docs/framework/react/guides/query-keys",
      kind: "docs",
      backs: "Explains that the cache is managed by query key and that keys are hashed deterministically.",
    },
    {
      label: "TanStack Query docs: Optimistic Updates",
      url: "https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates",
      kind: "docs",
      backs: "Shows onMutate with a snapshot of the previous value, rollback in onError and invalidation in onSettled.",
    },
    {
      label: "TanStack Query docs: Infinite Queries",
      url: "https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries",
      kind: "docs",
      backs: "Documents useInfiniteQuery with getNextPageParam and fetchNextPage for infinite lists.",
    },
    {
      label: "SWR: React Hooks for Data Fetching",
      url: "https://vercel.com/oss/swr",
      kind: "docs",
      backs: "Introduces SWR and the stale-while-revalidate strategy it is named after.",
    },
  ],
  "react-testing": [
    {
      label: "Testing Library docs: Guiding Principles",
      url: "https://testing-library.com/docs/guiding-principles",
      kind: "docs",
      backs: "The principle the chapter opens with: tests should resemble the way the software is used.",
    },
    {
      label: "Testing Library docs: About Queries, priority",
      url: "https://testing-library.com/docs/queries/about/#priority",
      kind: "docs",
      backs: "Gives the query priority order from getByRole down to getByTestId, and the get, query and find variants.",
    },
    {
      label: "Testing Library docs: user-event introduction",
      url: "https://testing-library.com/docs/user-event/intro",
      kind: "docs",
      backs: "Explains that fireEvent dispatches single DOM events while user-event simulates full interactions.",
    },
    {
      label: "Mock Service Worker documentation: Introduction",
      url: "https://mswjs.io/docs/",
      kind: "docs",
      backs: "Describes intercepting requests at the network level so tests do not mock fetch or modules.",
    },
    {
      label: "React Testing Library docs: API, renderHook",
      url: "https://testing-library.com/docs/react-testing-library/api/#renderhook",
      kind: "docs",
      backs: "Documents renderHook for testing a custom hook without writing a wrapper component by hand.",
    },
  ],
  "react-typescript": [
    {
      label: "React docs: Using TypeScript",
      url: "https://react.dev/learn/typescript",
      kind: "docs",
      backs: "Covers typing props, hooks, events, children with ReactNode, and DOM events.",
    },
    {
      label: "React 19 Upgrade Guide: TypeScript changes",
      url: "https://react.dev/blog/2024/04/25/react-19-upgrade-guide#typescript-changes",
      kind: "docs",
      backs:
        "Confirms useRef now requires an argument, all refs are mutable, and implicit returns from ref callbacks are rejected.",
    },
    {
      label: "React v19: ref as a prop",
      url: "https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop",
      kind: "docs",
      backs: "Confirms ref is passed to function components as an ordinary prop from React 19.",
    },
    {
      label: "TypeScript Handbook: Narrowing, discriminated unions",
      url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions",
      kind: "docs",
      backs: "Explains narrowing a union on a shared literal field, the technique used for state and reducer actions.",
    },
  ],
  "react-animation": [
    {
      label: "React docs: ViewTransition",
      url: "https://react.dev/reference/react/ViewTransition",
      kind: "docs",
      backs: "Reference for enter, exit, update and share animations, which only run for updates inside a transition.",
    },
    {
      label: "React 19.3: View Transitions",
      url: "https://react.dev/blog/2026/09/09/react-19-3#view-transition",
      kind: "article",
      backs: "Confirms ViewTransition became stable in React 19.3, released on 9 September 2026.",
    },
    {
      label: "MDN: View Transition API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API",
      kind: "docs",
      backs: "Documents document.startViewTransition() and the view-transition pseudo-elements React builds on.",
    },
    {
      label: "Motion docs: AnimatePresence",
      url: "https://motion.dev/docs/react-animate-presence",
      kind: "docs",
      backs: "Documents AnimatePresence, which keeps a removed element mounted until its exit animation finishes.",
    },
    {
      label: "Paul Lewis: FLIP Your Animations",
      url: "https://aerotwist.com/blog/flip-your-animations/",
      kind: "article",
      backs: "The original description of First, Last, Invert, Play for animating layout changes with transforms.",
    },
    {
      label: "MDN: prefers-reduced-motion",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion",
      kind: "docs",
      backs: "Documents the media feature for users who asked the system to minimise non-essential motion.",
    },
  ],
  "react-e2e": [
    {
      label: "Playwright docs: Auto-waiting",
      url: "https://playwright.dev/docs/actionability",
      kind: "docs",
      backs:
        "Lists the actionability checks run before an action such as click: visible, stable, receives events and enabled.",
    },
    {
      label: "Playwright docs: Locators",
      url: "https://playwright.dev/docs/locators",
      kind: "docs",
      backs: "Explains that locators are resolved at the time of each action and recommends role based locators.",
    },
    {
      label: "Playwright docs: Assertions",
      url: "https://playwright.dev/docs/test-assertions",
      kind: "docs",
      backs: "Documents auto-retrying expect(locator) assertions, which replace fixed waits.",
    },
    {
      label: "Playwright docs: Authentication",
      url: "https://playwright.dev/docs/auth",
      kind: "docs",
      backs: "Shows signing in once in a setup project and reusing the saved storageState in every test.",
    },
    {
      label: "Playwright docs: Trace viewer",
      url: "https://playwright.dev/docs/trace-viewer",
      kind: "docs",
      backs:
        "Documents recording a trace with on-first-retry and inspecting DOM snapshots, network and console of a failed run.",
    },
    {
      label: "Playwright docs: Mock APIs",
      url: "https://playwright.dev/docs/mock",
      kind: "docs",
      backs: "Documents page.route() for intercepting and fulfilling network requests in a test.",
    },
  ],
  "react-i18n": [
    {
      label: "MDN: Intl",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl",
      kind: "docs",
      backs: "Documents the built in Intl formatters for numbers, dates, lists and relative time that need no library.",
    },
    {
      label: "MDN: Intl.PluralRules",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules",
      kind: "docs",
      backs: "Documents the plural categories zero, one, two, few, many and other that a locale may use.",
    },
    {
      label: "i18next docs: Plurals",
      url: "https://www.i18next.com/translation-function/plurals",
      kind: "docs",
      backs: "Documents plural keys with suffixes such as _one and _other selected from the count option.",
    },
    {
      label: "react-i18next docs: Trans component",
      url: "https://react.i18next.com/latest/trans-component",
      kind: "docs",
      backs:
        "Documents the Trans component for translations that contain React elements, using indexed tags such as <1>.",
    },
    {
      label: "next-intl docs: Getting started with the App Router",
      url: "https://next-intl.dev/docs/getting-started/app-router",
      kind: "docs",
      backs: "Covers setting up next-intl in the Next.js App Router with messages available to Server Components.",
    },
    {
      label: "MDN: CSS logical properties and values",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values",
      kind: "docs",
      backs: "Documents inline and block properties such as margin-inline-start that follow the writing direction.",
    },
  ],
  "react-file-uploads": [
    {
      label: "MDN: File",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/File",
      kind: "docs",
      backs: "Documents the File object from an input's FileList, with name, size and type properties.",
    },
    {
      label: "MDN: XMLHttpRequest upload property",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/upload",
      kind: "docs",
      backs: "Documents xhr.upload and its progress event with loaded and total, used for the upload progress bar.",
    },
    {
      label: "MDN: URL.createObjectURL() static method",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static",
      kind: "docs",
      backs: "Documents object URLs for local previews and the need to release them with revokeObjectURL.",
    },
    {
      label: "MDN: File drag and drop",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop",
      kind: "docs",
      backs: "Shows that dragover must call preventDefault for drop to fire and how to read dropped files.",
    },
    {
      label: "Amazon S3 User Guide: Uploading objects with presigned URLs",
      url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html",
      kind: "docs",
      backs: "Documents presigned URLs that let a client upload directly to storage without holding credentials.",
    },
    {
      label: "OWASP Cheat Sheet Series: File Upload",
      url: "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html",
      kind: "docs",
      backs:
        "Backs the server rules: do not trust Content-Type or the file name, limit size, generate the stored name, scan content.",
    },
  ],
  "react-realtime": [
    {
      label: "HTML Standard: Server-sent events",
      url: "https://html.spec.whatwg.org/multipage/server-sent-events.html",
      kind: "spec",
      backs:
        "Specifies the text/event-stream format, automatic reconnection, the retry field and the Last-Event-ID header.",
    },
    {
      label: "MDN: Using server-sent events",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events",
      kind: "docs",
      backs: "Notes the limit of six open connections per browser and domain when not using HTTP/2.",
    },
    {
      label: "RFC 6455: The WebSocket Protocol",
      url: "https://datatracker.ietf.org/doc/html/rfc6455",
      kind: "spec",
      backs: "Defines the WebSocket handshake and two-way framed messaging over a single TCP connection.",
    },
    {
      label: "MDN: WebSocket",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket",
      kind: "docs",
      backs: "Documents the WebSocket interface, and notes it has no backpressure, pointing to WebSocketStream.",
    },
    {
      label: "AWS Architecture Blog: Exponential Backoff And Jitter",
      url: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/",
      kind: "article",
      backs:
        "Shows that adding jitter to exponential backoff spreads out retries so clients do not reconnect in waves.",
    },
    {
      label: "MDN: Document visibilitychange event",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event",
      kind: "docs",
      backs: "Documents the event fired when a tab becomes hidden or visible, used to pause and resume a connection.",
    },
  ],
  "react-shadcn": [
    {
      label: "shadcn/ui docs: Introduction",
      url: "https://ui.shadcn.com/docs",
      kind: "docs",
      backs:
        "States that shadcn/ui is not a component library you install but code you copy into your project and own.",
    },
    {
      label: "shadcn/ui docs: components.json",
      url: "https://ui.shadcn.com/docs/components-json",
      kind: "docs",
      backs:
        "Documents the components.json fields the chapter covers: rsc, aliases, cssVariables, baseColor and registries.",
    },
    {
      label: "shadcn/ui changelog: July 2026, Base UI as the Default",
      url: "https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default",
      kind: "docs",
      backs: "Confirms that since July 2026 new projects use Base UI by default while Radix stays fully supported.",
    },
    {
      label: "shadcn/ui docs: Registry introduction",
      url: "https://ui.shadcn.com/docs/registry",
      kind: "docs",
      backs: "Describes running your own registry to distribute components, hooks and other files through the CLI.",
    },
    {
      label: "Class Variance Authority docs: Variants",
      url: "https://cva.style/getting-started/variants/",
      kind: "docs",
      backs: "The cva function that shadcn/ui components use to declare variants.",
    },
  ],
  "react-fiber": [
    {
      label: "Andrew Clark: React Fiber Architecture",
      url: "https://github.com/acdlite/react-fiber-architecture",
      kind: "code",
      backs:
        "Describes a fiber as a unit of work with child, sibling and return pointers, with reconciliation separate from rendering.",
    },
    {
      label: "React docs (legacy): Reconciliation",
      url: "https://legacy.reactjs.org/docs/reconciliation.html",
      kind: "docs",
      backs:
        "States the two diffing heuristics, different element types produce different trees and keys hint at stable children, giving O(n).",
    },
    {
      label: "React docs: Render and Commit",
      url: "https://react.dev/learn/render-and-commit",
      kind: "docs",
      backs: "Describes the trigger, render and commit steps and that rendering must be a pure calculation.",
    },
    {
      label: "React source: ReactFiberLane.js",
      url: "https://github.com/react/react/blob/main/packages/react-reconciler/src/ReactFiberLane.js",
      kind: "code",
      backs:
        "The lane bitmask definitions, including SyncLane, DefaultLane and the transition lanes, that encode update priority.",
    },
    {
      label: "React source: ReactInternalTypes.js (the Fiber type)",
      url: "https://github.com/react/react/blob/main/packages/react-reconciler/src/ReactInternalTypes.js",
      kind: "code",
      backs:
        "The Fiber type itself, with alternate for double buffering and the flags and subtreeFlags fields used by commit.",
    },
    {
      label: "React Blog: Introducing the React Profiler",
      url: "https://legacy.reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html",
      kind: "article",
      backs: "Explains how to read the Profiler flame chart, where bar width and colour show render time per commit.",
    },
  ],
  "react-concurrent": [
    {
      label: "React docs: useTransition",
      url: "https://react.dev/reference/react/useTransition",
      kind: "docs",
      backs:
        "Reference for marking updates as non-blocking transitions that can be interrupted, with an isPending flag.",
    },
    {
      label: "React docs: useDeferredValue",
      url: "https://react.dev/reference/react/useDeferredValue",
      kind: "docs",
      backs: "Explains deferring a value without a fixed delay, and how it differs from debouncing and throttling.",
    },
    {
      label: "React docs: Activity",
      url: "https://react.dev/reference/react/Activity",
      kind: "docs",
      backs: "Documents hiding a subtree while preserving its state and DOM, with effects cleaned up while hidden.",
    },
    {
      label: "React Blog: React 19.2",
      url: "https://react.dev/blog/2025/10/01/react-19-2",
      kind: "article",
      backs: "Confirms Activity shipped in 19.2 along with the Scheduler and Components tracks in Chrome DevTools.",
    },
    {
      label: "React 19.3: changelog",
      url: "https://react.dev/blog/2026/09/09/react-19-3#changelog",
      kind: "article",
      backs:
        "Records that 19.3 renders transitions independently, so a slow transition no longer holds up unrelated ones.",
    },
    {
      label: "React v18.0: Automatic Batching",
      url: "https://react.dev/blog/2022/03/29/react-v18#new-feature-automatic-batching",
      kind: "article",
      backs: "Confirms automatic batching of updates outside React event handlers arrived with createRoot in React 18.",
    },
  ],
  "react-suspense": [
    {
      label: "React docs: Suspense",
      url: "https://react.dev/reference/react/Suspense",
      kind: "docs",
      backs:
        "Covers fallbacks, nested boundaries, resetting with a key, and reveals happening at most once every 300ms.",
    },
    {
      label: "React docs: lazy",
      url: "https://react.dev/reference/react/lazy",
      kind: "docs",
      backs:
        "Documents lazy() with a dynamic import, declared at module top level and rendered under a Suspense boundary.",
    },
    {
      label: "React 19 Upgrade Guide: improvements to Suspense",
      url: "https://react.dev/blog/2024/04/25/react-19-upgrade-guide#improvements-to-suspense",
      kind: "docs",
      backs: "Confirms that React 19 commits the fallback immediately and then pre-warms the suspended siblings.",
    },
    {
      label: "React docs: renderToPipeableStream",
      url: "https://react.dev/reference/react-dom/server/renderToPipeableStream",
      kind: "docs",
      backs: "Documents streaming server rendering, where the shell is sent first and suspended parts stream in later.",
    },
  ],
  "react-server-components": [
    {
      label: "React docs: Server Components",
      url: "https://react.dev/reference/rsc/server-components",
      kind: "docs",
      backs:
        "Defines Server Components as rendering ahead of time in a separate environment, with or without a server, and async components.",
    },
    {
      label: "React docs: 'use client'",
      url: "https://react.dev/reference/rsc/use-client",
      kind: "docs",
      backs: "Defines the client boundary and lists which prop types can be serialised across it.",
    },
    {
      label: "React docs: cacheSignal",
      url: "https://react.dev/reference/react/cacheSignal",
      kind: "docs",
      backs: "Documents cacheSignal, which returns an AbortSignal that aborts when the cache lifetime ends.",
    },
    {
      label: "React 19.3: Context can be rendered directly in Server Components",
      url: "https://react.dev/blog/2026/09/09/react-19-3#context-can-be-rendered-directly-in-server-components",
      kind: "article",
      backs:
        "Confirms that from 19.3 a Server Component can render a context imported from a client module without a wrapper provider.",
    },
    {
      label: "React Blog: Critical Security Vulnerability in React Server Components",
      url: "https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components",
      kind: "article",
      backs:
        "The 3 December 2025 disclosure of CVE-2025-55182, an unauthenticated remote code execution flaw rated CVSS 10.0.",
    },
    {
      label: "React Blog: Denial of Service and Source Code Exposure in React Server Components",
      url: "https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components",
      kind: "article",
      backs:
        "Gives the safe versions 19.0.4, 19.1.5 and 19.2.4, and says the source exposure covers hardcoded secrets, not process.env.",
    },
  ],
  "react-server-actions": [
    {
      label: "React docs: 'use server'",
      url: "https://react.dev/reference/rsc/use-server",
      kind: "docs",
      backs:
        "Tells you to treat Server Function arguments as untrusted input and to authorise every call, and lists serialisable types.",
    },
    {
      label: "React docs: useActionState",
      url: "https://react.dev/reference/react/useActionState",
      kind: "docs",
      backs:
        "Documents the returned state and isPending flag, and forms that submit before hydration when used with Server Functions.",
    },
    {
      label: "React docs: useFormStatus",
      url: "https://react.dev/reference/react-dom/hooks/useFormStatus",
      kind: "docs",
      backs:
        "States the one rule: the hook must be called in a component rendered inside the form, not the one that renders the form.",
    },
    {
      label: "React docs: useOptimistic",
      url: "https://react.dev/reference/react/useOptimistic",
      kind: "docs",
      backs:
        "Documents showing an optimistic value while an action is pending and returning to real state when it settles.",
    },
    {
      label: "Next.js docs: updateTag",
      url: "https://nextjs.org/docs/app/api-reference/functions/updateTag",
      kind: "docs",
      backs: "Confirms updateTag can only be called from Server Actions and is meant for read-your-own-writes.",
    },
    {
      label: "Next.js docs: revalidateTag",
      url: "https://nextjs.org/docs/app/api-reference/functions/revalidateTag",
      kind: "docs",
      backs:
        "Confirms revalidateTag takes a cache profile as second argument and that the single argument form is deprecated.",
    },
  ],
  "react-use-hook": [
    {
      label: "React docs: use",
      url: "https://react.dev/reference/react/use",
      kind: "docs",
      backs:
        "States that use can be called in loops and conditionals, cannot be called in a try-catch block, and reads promises and context.",
    },
    {
      label: "React v19: new API use",
      url: "https://react.dev/blog/2024/12/05/react-19#new-feature-use",
      kind: "article",
      backs: "Introduces use in React 19 and states that it does not support promises created during render.",
    },
    {
      label: "React docs: Server Components, async components",
      url: "https://react.dev/reference/rsc/server-components#async-components-with-server-components",
      kind: "docs",
      backs:
        "Shows awaiting in a Server Component versus passing the promise to a Client Component that reads it with use.",
    },
    {
      label: "React 19.3: browser",
      url: "https://react.dev/blog/2026/09/09/react-19-3#browser",
      kind: "article",
      backs: "Confirms use(browser()) was added in 19.3 and suspends on the server but not on the client.",
    },
  ],
  "react-rendering-strategies": [
    {
      label: "web.dev: Rendering on the Web",
      url: "https://web.dev/articles/rendering-on-the-web",
      kind: "article",
      backs:
        "Compares client-side, server-side and static rendering and the cost of hydration, the comparison the chapter opens with.",
    },
    {
      label: "Next.js docs: Incremental Static Regeneration (ISR)",
      url: "https://nextjs.org/docs/app/guides/incremental-static-regeneration",
      kind: "docs",
      backs:
        "Documents regenerating static pages after a revalidate interval or on demand, without rebuilding the site.",
    },
    {
      label: "React docs: hydrateRoot",
      url: "https://react.dev/reference/react-dom/client/hydrateRoot",
      kind: "docs",
      backs:
        "States that server and client output must match and documents suppressHydrationWarning for unavoidable differences.",
    },
    {
      label: "React v19: support for Document Metadata",
      url: "https://react.dev/blog/2024/12/05/react-19#support-for-metadata-tags",
      kind: "article",
      backs:
        "Confirms React 19 hoists title, meta and link tags to the document head and improved hydration error diffs.",
    },
    {
      label: "React 19.3: browser",
      url: "https://react.dev/blog/2026/09/09/react-19-3#browser",
      kind: "article",
      backs:
        "Confirms use(browser()) leaves the nearest Suspense fallback in the server HTML and renders the component on the client.",
    },
    {
      label: "web.dev: Interaction to Next Paint (INP)",
      url: "https://web.dev/articles/inp",
      kind: "article",
      backs: "Defines Interaction to Next Paint, the metric the chapter says to check after choosing a strategy.",
    },
  ],
  "react-effect-timing": [
    {
      label: "React docs: useLayoutEffect",
      url: "https://react.dev/reference/react/useLayoutEffect",
      kind: "docs",
      backs: "States that useLayoutEffect fires before the browser repaints and blocks painting, for measuring layout.",
    },
    {
      label: "React docs: useEffect, caveats",
      url: "https://react.dev/reference/react/useEffect#caveats",
      kind: "docs",
      backs:
        "Describes when effects run relative to paint, and that cleanup runs with old values before the next setup.",
    },
    {
      label: "React docs: useInsertionEffect",
      url: "https://react.dev/reference/react/useInsertionEffect",
      kind: "docs",
      backs: "Documents the effect that fires before layout effects, intended for CSS-in-JS style injection.",
    },
    {
      label: "React docs: StrictMode",
      url: "https://react.dev/reference/react/StrictMode",
      kind: "docs",
      backs: "Documents the extra setup and cleanup cycle Strict Mode runs for every effect in development.",
    },
    {
      label: "React 19.3: changelog",
      url: "https://react.dev/blog/2026/09/09/react-19-3#changelog",
      kind: "article",
      backs:
        "Records that 19.3 double invokes effects in Strict Mode during hydration, matching client-rendered roots.",
    },
  ],
  "react-sync-external-store": [
    {
      label: "React docs: useSyncExternalStore",
      url: "https://react.dev/reference/react/useSyncExternalStore",
      kind: "docs",
      backs:
        "Reference for subscribe, getSnapshot and getServerSnapshot, including the need for a cached snapshot and stable subscribe.",
    },
    {
      label: "React 18 Working Group: What is tearing?",
      url: "https://github.com/reactwg/react-18/discussions/69",
      kind: "article",
      backs: "Explains tearing, where concurrent rendering shows two values of the same external store in one screen.",
    },
    {
      label: "React 18 Working Group: useMutableSource to useSyncExternalStore",
      url: "https://github.com/reactwg/react-18/discussions/86",
      kind: "article",
      backs:
        "The React 18 working group note introducing useSyncExternalStore as the API for libraries that read external stores.",
    },
    {
      label: "MDN: Window storage event",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event",
      kind: "docs",
      backs:
        "Confirms the storage event fires in other documents sharing the storage area, not in the one that made the change.",
    },
    {
      label: "MDN: Navigator onLine property",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine",
      kind: "docs",
      backs: "Documents navigator.onLine and the online and offline events used in the online status example.",
    },
  ],
  "react-refs-depth": [
    {
      label: "React v19: ref as a prop and cleanup functions for refs",
      url: "https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop",
      kind: "article",
      backs: "Confirms ref is a normal prop in React 19 and that a ref callback may return a cleanup function.",
    },
    {
      label: "React docs: useImperativeHandle",
      url: "https://react.dev/reference/react/useImperativeHandle",
      kind: "docs",
      backs: "Documents exposing a custom handle with chosen methods instead of the whole DOM node.",
    },
    {
      label: "React docs: Fragment",
      url: "https://react.dev/reference/react/Fragment",
      kind: "docs",
      backs: "Documents passing a ref to Fragment and the FragmentInstance methods for listeners, observers and focus.",
    },
    {
      label: "React 19.3: Fragment Refs",
      url: "https://react.dev/blog/2026/09/09/react-19-3#fragment-refs",
      kind: "article",
      backs: "Confirms Fragment Refs became stable in 19.3, removing the wrapper div that interfered with layout.",
    },
    {
      label: "React docs: Manipulating the DOM with Refs",
      url: "https://react.dev/learn/manipulating-the-dom-with-refs",
      kind: "docs",
      backs:
        "Gives the safety rule of not changing DOM nodes that React manages, and shows focus management through refs.",
    },
  ],
  "react-advanced-patterns": [
    {
      label: "Radix Primitives docs: Composition",
      url: "https://www.radix-ui.com/primitives/docs/guides/composition",
      kind: "docs",
      backs: "Documents asChild, which merges a primitive's props and behaviour onto the child element you supply.",
    },
    {
      label: "React docs: cloneElement",
      url: "https://react.dev/reference/react/cloneElement",
      kind: "docs",
      backs: "Calls cloneElement uncommon and fragile and lists the alternatives of render props and context.",
    },
    {
      label: "React docs: Children",
      url: "https://react.dev/reference/react/Children",
      kind: "docs",
      backs: "Calls the Children API uncommon and explains why inspecting children leads to fragile code.",
    },
    {
      label: "React docs (legacy): Higher-Order Components",
      url: "https://legacy.reactjs.org/docs/higher-order-components.html",
      kind: "docs",
      backs: "Defines a higher-order component as a function that takes a component and returns a new component.",
    },
    {
      label: "React docs (legacy): Render Props",
      url: "https://legacy.reactjs.org/docs/render-props.html",
      kind: "docs",
      backs: "Defines the render prop technique of sharing code through a prop whose value is a function.",
    },
    {
      label: "React docs: Controlled and uncontrolled components",
      url: "https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components",
      kind: "docs",
      backs:
        "Defines controlled and uncontrolled components by whether the important state is driven by props or held locally.",
    },
  ],
  "react-performance": [
    {
      label: "React docs: Profiler",
      url: "https://react.dev/reference/react/Profiler",
      kind: "docs",
      backs: "Documents measuring render cost with actualDuration and baseDuration per commit.",
    },
    {
      label: "React docs: React Developer Tools",
      url: "https://react.dev/learn/react-developer-tools",
      kind: "docs",
      backs:
        "Covers installing the browser extension that adds the Components and Profiler panels the chapter works in.",
    },
    {
      label: "web.dev: Web Vitals",
      url: "https://web.dev/articles/vitals",
      kind: "article",
      backs:
        "Gives the good thresholds the chapter quotes: LCP within 2.5 seconds, INP of 200 milliseconds or less, CLS of 0.1 or less.",
    },
    {
      label: "web.dev: Optimize Interaction to Next Paint",
      url: "https://web.dev/articles/optimize-inp",
      kind: "article",
      backs: "Explains how long tasks and large rendering work delay the next paint after an interaction.",
    },
    {
      label: "TanStack Virtual docs: Introduction",
      url: "https://tanstack.com/virtual/latest/docs/introduction",
      kind: "docs",
      backs: "Describes virtualising long lists so that only the visible rows are rendered.",
    },
    {
      label: "React docs: lazy",
      url: "https://react.dev/reference/react/lazy",
      kind: "docs",
      backs: "Documents deferring a component's code until first render, the basis of route level code splitting.",
    },
  ],
  "react-accessibility": [
    {
      label: "W3C: Using ARIA",
      url: "https://w3c.github.io/using-aria/",
      kind: "spec",
      backs:
        "States the first rule of ARIA: use a native HTML element with the semantics built in rather than adding ARIA.",
    },
    {
      label: "WAI-ARIA Authoring Practices: Dialog (Modal) Pattern",
      url: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
      kind: "spec",
      backs:
        "Specifies role dialog with aria-modal, focus moving into the dialog, Tab staying inside, Escape closing, and focus returning.",
    },
    {
      label: "React docs: useId",
      url: "https://react.dev/reference/react/useId",
      kind: "docs",
      backs: "Documents useId for accessibility attribute ids that match between server and client render.",
    },
    {
      label: "MDN: ARIA live regions",
      url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions",
      kind: "docs",
      backs: "Explains aria-live regions that announce dynamic content changes to screen readers.",
    },
    {
      label: "MDN: HTMLElement inert property",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert",
      kind: "docs",
      backs:
        "Documents inert, which stops the content behind a dialog taking focus and hides it from assistive technology.",
    },
    {
      label: "eslint-plugin-jsx-a11y repository",
      url: "https://github.com/jsx-eslint/eslint-plugin-jsx-a11y",
      kind: "code",
      backs:
        "The static lint rules for JSX accessibility that the tooling section names, with a note on what static checks cannot see.",
    },
  ],
  "react-design-systems": [
    {
      label: "Design Tokens Community Group: Design Tokens Format Module",
      url: "https://www.designtokens.org/tr/drafts/format/",
      kind: "spec",
      backs: "Defines a design token as a named value for a design decision, with groups and aliases between tokens.",
    },
    {
      label: "Class Variance Authority docs: TypeScript",
      url: "https://cva.style/getting-started/typescript/",
      kind: "docs",
      backs: "Documents VariantProps, which derives a component's variant prop types from its cva definition.",
    },
    {
      label: "tailwind-merge repository",
      url: "https://github.com/dcastil/tailwind-merge",
      kind: "docs",
      backs:
        "Documents merging Tailwind class names so that a later conflicting class wins, used for the className escape hatch.",
    },
    {
      label: "Radix Primitives docs: Introduction",
      url: "https://www.radix-ui.com/primitives/docs/overview/introduction",
      kind: "docs",
      backs: "Describes unstyled, accessible primitives that a design system can style and build on.",
    },
    {
      label: "Next.js docs: CSS-in-JS",
      url: "https://nextjs.org/docs/app/guides/css-in-js",
      kind: "docs",
      backs:
        "States that CSS-in-JS needs library support for Server Components and streaming, and lists libraries supported in Client Components only.",
    },
  ],
  "react-advanced-typescript": [
    {
      label: "TypeScript Handbook: Generics",
      url: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
      kind: "docs",
      backs:
        "Covers generic functions and generic constraints, the basis of the typed list component and constrained props.",
    },
    {
      label: "TypeScript Handbook: Narrowing, exhaustiveness checking",
      url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking",
      kind: "docs",
      backs: "Shows using the never type so that an unhandled union member becomes a compile error.",
    },
    {
      label: "TypeScript Handbook: Utility Types, NoInfer",
      url: "https://www.typescriptlang.org/docs/handbook/utility-types.html#noinfertype",
      kind: "docs",
      backs: "Documents NoInfer, which blocks inference from one position so another argument decides the type.",
    },
    {
      label: "TypeScript 4.9 release notes: the satisfies operator",
      url: "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html",
      kind: "docs",
      backs: "Documents satisfies, which checks a value against a type without widening the inferred type.",
    },
    {
      label: "React docs: Using TypeScript",
      url: "https://react.dev/learn/typescript",
      kind: "docs",
      backs: "Covers typing hooks and context, including the custom hook that throws when context is null.",
    },
  ],
  "react-architecture-scale": [
    {
      label: "Bulletproof React: Project Structure",
      url: "https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md",
      kind: "code",
      backs:
        "A widely used reference layout organised by feature, with one way imports from shared code to features to app.",
    },
    {
      label: "ESLint docs: no-restricted-imports",
      url: "https://eslint.org/docs/latest/rules/no-restricted-imports",
      kind: "docs",
      backs: "The lint rule that can forbid importing from given paths or patterns, used to enforce import boundaries.",
    },
    {
      label: "Martin Fowler site: Micro Frontends (Cam Jackson)",
      url: "https://martinfowler.com/articles/micro-frontends.html",
      kind: "article",
      backs:
        "Sets out the benefits of independent deployment against the costs of payload size and operational complexity.",
    },
    {
      label: "Architectural Decision Records (ADR) site",
      url: "https://adr.github.io/",
      kind: "article",
      backs: "Describes recording each significant decision with its context and consequences, as the chapter advises.",
    },
    {
      label: "GitHub docs: About code owners",
      url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners",
      kind: "docs",
      backs: "Documents the CODEOWNERS file that requests review from owners when matching paths change.",
    },
  ],
  "react-custom-renderers": [
    {
      label: "React source: react-reconciler package README",
      url: "https://github.com/react/react/tree/main/packages/react-reconciler",
      kind: "code",
      backs:
        "Documents the host config a custom renderer supplies, including mutation mode and persistent mode methods.",
    },
    {
      label: "React Native docs: Fabric",
      url: "https://reactnative.dev/architecture/fabric-renderer",
      kind: "docs",
      backs:
        "Describes Fabric, the React Native rendering system that renders React trees to host platform views instead of the DOM.",
    },
    {
      label: "React Three Fiber docs: Introduction",
      url: "https://r3f.docs.pmnd.rs/getting-started/introduction",
      kind: "docs",
      backs:
        "Describes React Three Fiber as a React renderer for three.js, one of the existing renderers the chapter lists.",
    },
    {
      label: "Ink repository: React for CLIs",
      url: "https://github.com/vadimdemedes/ink",
      kind: "code",
      backs: "A custom renderer that draws React components to the terminal, another renderer the chapter lists.",
    },
  ],
  "react-migration": [
    {
      label: "React Blog: React 19 Upgrade Guide",
      url: "https://react.dev/blog/2024/04/25/react-19-upgrade-guide",
      kind: "docs",
      backs:
        "Lists the 18 to 19 breaking changes the chapter names, such as removed propTypes, defaultProps and ReactDOM.render.",
    },
    {
      label: "React Blog: How to Upgrade to React 18",
      url: "https://react.dev/blog/2022/03/08/react-18-upgrade-guide",
      kind: "docs",
      backs: "Covers moving from ReactDOM.render to createRoot and the behaviour changes that come with it.",
    },
    {
      label: "React Blog: Denial of Service and Source Code Exposure in React Server Components",
      url: "https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components",
      kind: "article",
      backs: "Gives 19.0.4, 19.1.5 and 19.2.4 as the fixed versions that the chapter treats as a security floor.",
    },
    {
      label: "React 19.3: changelog",
      url: "https://react.dev/blog/2026/09/09/react-19-3#changelog",
      kind: "article",
      backs:
        "Records the two behaviour changes in 19.3: effects double invoked during hydration and independent transitions.",
    },
    {
      label: "Next.js docs: App Router migration",
      url: "https://nextjs.org/docs/app/guides/migrating/app-router-migration",
      kind: "docs",
      backs:
        "Shows that the app and pages directories can coexist, so Server Components can be adopted route by route.",
    },
    {
      label: "TypeScript Handbook: Migrating from JavaScript",
      url: "https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html",
      kind: "docs",
      backs: "Documents allowJs for letting TypeScript and JavaScript files coexist during a file by file migration.",
    },
  ],
  "react-debugging-production": [
    {
      label: "React docs: captureOwnerStack",
      url: "https://react.dev/reference/react/captureOwnerStack",
      kind: "docs",
      backs:
        "Documents captureOwnerStack, available only in development builds, for the stack of components that created an element.",
    },
    {
      label: "React docs: createRoot",
      url: "https://react.dev/reference/react-dom/client/createRoot",
      kind: "docs",
      backs:
        "Documents the onCaughtError, onUncaughtError and onRecoverableError root options that receive a componentStack.",
    },
    {
      label: "web.dev: Why lab and field data can be different",
      url: "https://web.dev/articles/lab-and-field-data-differences",
      kind: "article",
      backs:
        "Explains why lab measurements differ from real user data and why field data is read at the 75th percentile.",
    },
    {
      label: "Chrome DevTools docs: Fix memory problems",
      url: "https://developer.chrome.com/docs/devtools/memory-problems",
      kind: "docs",
      backs: "Shows finding detached DOM nodes and comparing heap snapshots to locate a memory leak.",
    },
    {
      label: "React docs: hydrateRoot",
      url: "https://react.dev/reference/react-dom/client/hydrateRoot",
      kind: "docs",
      backs: "Lists the causes of hydration mismatch errors and how React recovers or reports them.",
    },
  ],
  "react-review-judgement": [
    {
      label: "React docs: Dangerously setting the inner HTML",
      url: "https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html",
      kind: "docs",
      backs: "Warns that dangerouslySetInnerHTML with untrusted content introduces an XSS vulnerability.",
    },
    {
      label: "React 19.3: Trusted Types support",
      url: "https://react.dev/blog/2026/09/09/react-19-3#trusted-types-support",
      kind: "article",
      backs:
        "Confirms React coerced values with '' + value before 19.3 and now passes Trusted Types objects through unchanged.",
    },
    {
      label: "MDN: Trusted Types API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API",
      kind: "docs",
      backs:
        "Describes TrustedHTML, TrustedScript and TrustedScriptURL and the policies that create them for injection sinks.",
    },
    {
      label: "React Blog: Critical Security Vulnerability in React Server Components",
      url: "https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components",
      kind: "article",
      backs: "The advisory for CVE-2025-55182, rated CVSS 10.0, allowing unauthenticated remote code execution.",
    },
    {
      label: "Vite docs: Env Variables and Modes",
      url: "https://vite.dev/guide/env-and-mode",
      kind: "docs",
      backs: "Confirms variables prefixed VITE_ are exposed to client code, so they must not hold secrets.",
    },
    {
      label: "Google Engineering Practices: What to look for in a code review",
      url: "https://google.github.io/eng-practices/review/reviewer/looking-for.html",
      kind: "article",
      backs:
        "A published reviewer guide that puts design and functionality ahead of style, the ordering the chapter argues for.",
    },
  ],
  "react-state-machines": [
    {
      label: "Stately docs: Setup",
      url: "https://stately.ai/docs/setup",
      kind: "docs",
      backs: "Documents setup() for declaring types and named actions, guards and actors before createMachine.",
    },
    {
      label: "Stately docs: Parent states",
      url: "https://stately.ai/docs/parent-states",
      kind: "docs",
      backs: "Documents hierarchical states, where child states live inside a parent state.",
    },
    {
      label: "Stately docs: Delayed (after) transitions",
      url: "https://stately.ai/docs/delayed-transitions",
      kind: "docs",
      backs: "Documents after transitions, whose timers are cancelled when the state is exited.",
    },
    {
      label: "Stately docs: Invoke",
      url: "https://stately.ai/docs/invoke",
      kind: "docs",
      backs: "Documents invoked actors that start on entering a state and stop when it is exited.",
    },
    {
      label: "Stately docs: @xstate/react",
      url: "https://stately.ai/docs/xstate-react",
      kind: "docs",
      backs: "Documents useMachine, useSelector and createActorContext for using a machine across components.",
    },
  ],
  "react-feature-flags": [
    {
      label: "Martin Fowler site: Feature Toggles (Pete Hodgson)",
      url: "https://martinfowler.com/articles/feature-toggles.html",
      kind: "article",
      backs:
        "Categorises toggles as release, experiment, ops and permission toggles with different lifetimes, as the chapter's table does.",
    },
    {
      label: "OpenFeature specification: Evaluation Context",
      url: "https://openfeature.dev/specification/sections/evaluation-context",
      kind: "spec",
      backs:
        "Specifies the evaluation context, including the targeting key that identifies the subject of a flag evaluation.",
    },
    {
      label: "OpenFeature docs: Introduction",
      url: "https://openfeature.dev/docs/reference/intro",
      kind: "docs",
      backs: "Describes OpenFeature as a vendor-neutral, community-driven standard API for feature flagging.",
    },
    {
      label: "OpenFeature docs: React SDK",
      url: "https://openfeature.dev/docs/reference/sdks/client/web/react",
      kind: "docs",
      backs: "Documents OpenFeatureProvider and useBooleanFlagValue, which re-render when flags or context change.",
    },
  ],
  "react-interview-bank": [
    {
      label: "React docs: Rules of React",
      url: "https://react.dev/reference/rules",
      kind: "docs",
      backs:
        "The rules that many answers rest on: components and hooks must be pure, and hooks are called at the top level.",
    },
    {
      label: "React v18.0: Automatic Batching",
      url: "https://react.dev/blog/2022/03/29/react-v18#new-feature-automatic-batching",
      kind: "article",
      backs: "Backs the answer that since React 18 updates in timeouts, promises and native handlers are batched too.",
    },
    {
      label: "React docs: Suspense",
      url: "https://react.dev/reference/react/Suspense",
      kind: "docs",
      backs: "Backs the answer that React reveals suspended content at most once every 300ms.",
    },
    {
      label: "React Blog: Critical Security Vulnerability in React Server Components",
      url: "https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components",
      kind: "article",
      backs:
        "Backs the React2Shell answer: CVE-2025-55182, CVSS 10.0, unauthenticated remote code execution via Server Function requests.",
    },
    {
      label: "React docs: React Compiler introduction",
      url: "https://react.dev/learn/react-compiler/introduction",
      kind: "docs",
      backs:
        "Backs the answer that the compiler memoises automatically and useMemo and useCallback remain as an escape hatch.",
    },
    {
      label: "Next.js docs: revalidateTag",
      url: "https://nextjs.org/docs/app/api-reference/functions/revalidateTag",
      kind: "docs",
      backs: "Backs the answer that the single argument form of revalidateTag is deprecated in Next.js 16.",
    },
  ],
  "react-cheat": [
    {
      label: "React docs: Built-in React Hooks",
      url: "https://react.dev/reference/react/hooks",
      kind: "docs",
      backs: "The official list of built-in hooks grouped by purpose, matching the at a glance table.",
    },
    {
      label: "React docs: Rules of Hooks",
      url: "https://react.dev/reference/rules/rules-of-hooks",
      kind: "docs",
      backs: "States the two rules: call hooks only at the top level and only from React functions.",
    },
    {
      label: "React docs: You Might Not Need an Effect",
      url: "https://react.dev/learn/you-might-not-need-an-effect",
      kind: "docs",
      backs:
        "The source for the effect taxonomy: derive during render, handle events in handlers, keep effects for external systems.",
    },
    {
      label: "React docs: Rendering Lists, rules of keys",
      url: "https://react.dev/learn/rendering-lists#rules-of-keys",
      kind: "docs",
      backs: "The key rules summarised on the page: unique among siblings and never changing between renders.",
    },
    {
      label: "React docs: 'use client'",
      url: "https://react.dev/reference/rsc/use-client",
      kind: "docs",
      backs:
        "Backs the server and client summary: the directive marks the boundary and props crossing it must be serialisable.",
    },
  ],
};
