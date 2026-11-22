import type { TopicSources } from "./types";

export const jsSources: TopicSources = {
  "setup-mental-model": [
    {
      label: "MDN: JavaScript execution model",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model",
      kind: "docs",
      backs:
        "Describes the single-threaded agent, its call stack and the job queue that the two-box picture simplifies.",
    },
    {
      label: "HTML Standard: Event loops",
      url: "https://html.spec.whatwg.org/multipage/webappapis.html#event-loops",
      kind: "spec",
      backs:
        "Defines task queues and the microtask checkpoint, which is why a resolved promise runs before a 0 ms timer.",
    },
    {
      label: "MDN: Strict mode",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode",
      kind: "docs",
      backs: "Lists what 'use strict' changes, including turning silent mistakes into thrown errors.",
    },
    {
      label: "MDN: JavaScript modules",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules",
      kind: "docs",
      backs:
        "Covers how module scripts differ from classic scripts: strict mode by default, deferred loading and their own scope.",
    },
  ],
  "execution-context": [
    {
      label: "ECMAScript Language Specification: Execution Contexts",
      url: "https://tc39.es/ecma262/#sec-execution-contexts",
      kind: "spec",
      backs: "Defines an execution context and its LexicalEnvironment and VariableEnvironment components.",
    },
    {
      label: "ECMAScript Language Specification: FunctionDeclarationInstantiation",
      url: "https://tc39.es/ecma262/#sec-functiondeclarationinstantiation",
      kind: "spec",
      backs: "The algorithm that creates parameter, var and function bindings before any line of a function body runs.",
    },
    {
      label: "MDN Glossary: Hoisting",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/Hoisting",
      kind: "docs",
      backs:
        "Explains hoisting as declarations being processed before execution and separates the var, function and let cases.",
    },
    {
      label: "MDN: let, Temporal dead zone (TDZ)",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz",
      kind: "docs",
      backs:
        "States that a let or const binding exists from the start of its block but throws a ReferenceError until its declaration runs.",
    },
  ],
  "var-let-const": [
    {
      label: "ECMAScript Language Specification: Let and Const Declarations",
      url: "https://tc39.es/ecma262/#sec-let-and-const-declarations",
      kind: "spec",
      backs:
        "States that let and const bindings are created with their environment but cannot be accessed until evaluated.",
    },
    {
      label: "MDN: var statement",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var",
      kind: "docs",
      backs:
        "Documents that var is function scoped, can be redeclared and creates a property on the global object at the top level.",
    },
    {
      label: "MDN: const declaration",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const",
      kind: "docs",
      backs: "States that const fixes the binding, not the value, so an object held in a const can still be mutated.",
    },
    {
      label: "ECMAScript Language Specification: CreatePerIterationEnvironment",
      url: "https://tc39.es/ecma262/#sec-createperiterationenvironment",
      kind: "spec",
      backs: "The step that copies let loop variables into a fresh environment on every iteration of a for loop.",
    },
  ],
  scope: [
    {
      label: "MDN Glossary: Scope",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/Scope",
      kind: "docs",
      backs: "Lists the kinds of scope in JavaScript: global, module, function and block.",
    },
    {
      label: "ECMAScript Language Specification: Environment Records",
      url: "https://tc39.es/ecma262/#sec-environment-records",
      kind: "spec",
      backs: "Defines the chain of environment records, each with an outer reference, that name lookup walks.",
    },
    {
      label: "MDN: with statement",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with",
      kind: "docs",
      backs: "Explains why with is deprecated and forbidden in strict mode: it makes name resolution unpredictable.",
    },
    {
      label: "MDN: eval(), Direct and indirect eval",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#direct_and_indirect_eval",
      kind: "docs",
      backs:
        "Describes how direct eval can read and add to the surrounding local scope, while indirect eval runs in global scope.",
    },
    {
      label: "MDN: globalThis",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis",
      kind: "docs",
      backs: "Documents the global object and the one standard name that reaches it in browsers, workers and Node.",
    },
  ],
  "single-thread": [
    {
      label: "HTML Standard: Event loop processing model",
      url: "https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model",
      kind: "spec",
      backs:
        "The algorithm behind the one-sentence event loop: take one task, run it to completion, drain microtasks, maybe render.",
    },
    {
      label: "HTML Standard: Timers",
      url: "https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers",
      kind: "spec",
      backs: "States that a timer delay is a minimum and that nested timers are clamped to 4 ms after five levels.",
    },
    {
      label: "MDN: PerformanceLongTaskTiming",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/PerformanceLongTaskTiming",
      kind: "docs",
      backs: "Defines a long task as any uninterrupted period where the main thread is busy for 50 ms or longer.",
    },
    {
      label: "MDN: Using Web Workers",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers",
      kind: "docs",
      backs: "Shows how a worker runs script on a separate thread and talks to the page only through messages.",
    },
    {
      label: "MDN: JavaScript execution model",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model",
      kind: "docs",
      backs: "Describes run-to-completion on a single thread and why a long job blocks everything queued behind it.",
    },
  ],
  "in-the-browser": [
    {
      label: "HTML Standard: The script element",
      url: "https://html.spec.whatwg.org/multipage/scripting.html#attr-script-defer",
      kind: "spec",
      backs: "Specifies how classic, async, defer and module scripts block or do not block the HTML parser.",
    },
    {
      label: "MDN: Populating the page, how browsers work",
      url: "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work",
      kind: "docs",
      backs: "Walks the same journey as the chapter: parsing, script handling, style, layout, paint and compositing.",
    },
    {
      label: "web.dev: Rendering performance",
      url: "https://web.dev/articles/rendering-performance",
      kind: "docs",
      backs:
        "Gives the 60 frames per second target and the roughly 16 ms per-frame budget shared by script, style, layout and paint.",
    },
    {
      label: "V8 blog: Launching Ignition and TurboFan",
      url: "https://v8.dev/blog/launching-ignition-and-turbofan",
      kind: "article",
      backs:
        "The V8 team's description of its interpreter plus optimizing compiler pipeline that the engine step summarises.",
    },
    {
      label: "MDN: DOMContentLoaded event",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event",
      kind: "docs",
      backs: "States when DOMContentLoaded fires relative to deferred scripts and how it differs from the load event.",
    },
  ],
  "types-values": [
    {
      label: "ECMAScript Language Specification: ECMAScript Language Types",
      url: "https://tc39.es/ecma262/#sec-ecmascript-language-types",
      kind: "spec",
      backs: "Lists the language types: Undefined, Null, Boolean, String, Symbol, Number, BigInt and Object.",
    },
    {
      label: "MDN: typeof operator",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof",
      kind: "docs",
      backs: 'Documents the typeof result table, including "object" for null and "function" for callable objects.',
    },
    {
      label: "ECMAScript Language Specification: IsLooselyEqual",
      url: "https://tc39.es/ecma262/#sec-islooselyequal",
      kind: "spec",
      backs: "The exact coercion steps that == performs, which === skips.",
    },
    {
      label: "MDN Glossary: Falsy",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/Falsy",
      kind: "docs",
      backs: "Lists every falsy value, so everything else is truthy.",
    },
    {
      label: "MDN: Number",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number",
      kind: "docs",
      backs:
        "States that numbers are IEEE 754 double-precision values and explains the safe integer range and parsing functions.",
    },
    {
      label: "MDN: Template literals, Tagged templates",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates",
      kind: "docs",
      backs: "Shows how a tag function receives the string pieces and the substituted values.",
    },
  ],
  "strings-numbers-math": [
    {
      label: "MDN: String",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String",
      kind: "docs",
      backs:
        "Reference for the string instance methods used in the chapter, such as padStart, at, replaceAll and localeCompare.",
    },
    {
      label: "MDN: Intl.Collator",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator",
      kind: "docs",
      backs: "Documents language-sensitive string comparison, including the sensitivity option.",
    },
    {
      label: "MDN: Math.random()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random",
      kind: "docs",
      backs:
        "Gives the range of Math.random, the random-integer formulas, and the warning that it is not cryptographically secure.",
    },
    {
      label: "MDN: Number.isSafeInteger()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger",
      kind: "docs",
      backs: "Defines safe integers as those between -(2^53 - 1) and 2^53 - 1 that a double can represent exactly.",
    },
    {
      label: "MDN: Intl.NumberFormat",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat",
      kind: "docs",
      backs: "Reference for locale-aware number, currency, unit and compact formatting.",
    },
  ],
  "operators-flow": [
    {
      label: "MDN: Operator precedence",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence",
      kind: "docs",
      backs: "The full precedence and associativity table, including right-associative exponentiation.",
    },
    {
      label: "MDN: Remainder (%)",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder",
      kind: "docs",
      backs: "States that the result of % takes the sign of the dividend, the left operand.",
    },
    {
      label: "MDN: Nullish coalescing operator (??)",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing",
      kind: "docs",
      backs: "Shows that ?? falls back only for null and undefined, unlike ||, which falls back for every falsy value.",
    },
    {
      label: "MDN: Optional chaining (?.)",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining",
      kind: "docs",
      backs: "Documents that ?. short-circuits to undefined when the value before it is null or undefined.",
    },
    {
      label: "MDN: for...of statement",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of",
      kind: "docs",
      backs: "Explains that for...of iterates values of an iterable while for...in iterates enumerable property keys.",
    },
    {
      label: "MDN: Logical OR assignment (||=)",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR_assignment",
      kind: "docs",
      backs: "Documents that x ||= y assigns only when x is falsy and short-circuits otherwise.",
    },
  ],
  "functions-basics": [
    {
      label: "MDN: Functions guide",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
      kind: "docs",
      backs: "Covers declarations, expressions, function hoisting, scope and the arguments object.",
    },
    {
      label: "MDN: Arrow function expressions",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions",
      kind: "docs",
      backs: "Lists what arrow functions lack: their own this, arguments and super, and use as constructors.",
    },
    {
      label: "MDN: Rest parameters",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters",
      kind: "docs",
      backs: "Explains rest parameters and how they differ from the array-like arguments object.",
    },
    {
      label: "MDN: Default parameters",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters",
      kind: "docs",
      backs: "States that a default applies only when the argument is undefined and is evaluated at call time.",
    },
    {
      label: "ECMAScript Language Specification: Rules of Automatic Semicolon Insertion",
      url: "https://tc39.es/ecma262/#sec-rules-of-automatic-semicolon-insertion",
      kind: "spec",
      backs:
        "The rule that inserts a semicolon after return when a line break follows, so the value on the next line is lost.",
    },
  ],
  "objects-arrays-basics": [
    {
      label: "MDN: Working with objects",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects",
      kind: "docs",
      backs: "Covers object literals, property access, and that comparing or assigning objects works by reference.",
    },
    {
      label: "MDN: Array",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
      kind: "docs",
      backs: "Lists which array methods mutate in place and which return a copy.",
    },
    {
      label: "MDN: Destructuring",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring",
      kind: "docs",
      backs: "Reference for array and object destructuring, defaults, renaming and rest properties.",
    },
    {
      label: "MDN: Spread syntax (...)",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax",
      kind: "docs",
      backs: "Documents spread in calls, array literals and object literals, and that the copy it makes is shallow.",
    },
    {
      label: "MDN: Object initializer",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer",
      kind: "docs",
      backs: "Documents shorthand property names, shorthand methods and computed property keys.",
    },
  ],
  "this-keyword": [
    {
      label: "MDN: this",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this",
      kind: "docs",
      backs: "States that the value of this is set by how a function is called, not where it is defined.",
    },
    {
      label: "ECMAScript Language Specification: OrdinaryCallBindThis",
      url: "https://tc39.es/ecma262/#sec-ordinarycallbindthis",
      kind: "spec",
      backs:
        "The step that sets this for a call: lexical for arrows, untouched in strict mode, boxed or replaced by the global object otherwise.",
    },
    {
      label: "MDN: Function.prototype.bind()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind",
      kind: "docs",
      backs:
        "Documents that bind returns a new function with a fixed this that later call, apply or bind cannot change.",
    },
    {
      label: "MDN: Arrow function expressions",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions",
      kind: "docs",
      backs: "States that arrow functions have no this of their own and that call, apply and bind cannot set it.",
    },
    {
      label: "MDN: EventTarget.addEventListener(), The value of this within the handler",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#the_value_of_this_within_the_handler",
      kind: "docs",
      backs: "States that inside a non-arrow listener, this is the element the listener was attached to.",
    },
  ],
  closures: [
    {
      label: "ECMAScript Language Specification: Environment Records",
      url: "https://tc39.es/ecma262/#sec-environment-records",
      kind: "spec",
      backs: "Defines the environment records a function keeps a reference to, which is what a closure is.",
    },
    {
      label: "ECMAScript Language Specification: OrdinaryFunctionCreate",
      url: "https://tc39.es/ecma262/#sec-ordinaryfunctioncreate",
      kind: "spec",
      backs: "Shows every function object storing the environment it was created in, in its [[Environment]] slot.",
    },
    {
      label: "MDN: Closures",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
      kind: "docs",
      backs:
        "Covers lexical scoping, private state with closures, closures in loops and the performance cost of creating them.",
    },
    {
      label: "MDN: Memory management",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management",
      kind: "docs",
      backs:
        "Explains reachability-based garbage collection, the reason a captured environment stays alive while a closure is reachable.",
    },
  ],
  "dom-events": [
    {
      label: "DOM Standard: Interface EventTarget",
      url: "https://dom.spec.whatwg.org/#interface-eventtarget",
      kind: "spec",
      backs: "Specifies addEventListener, removeEventListener and the once, passive and signal options.",
    },
    {
      label: "MDN: EventTarget.removeEventListener()",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener",
      kind: "docs",
      backs:
        "States that removal needs the same listener function reference and matching capture flag that were used to add it.",
    },
    {
      label: "MDN: HTMLCollection",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection",
      kind: "docs",
      backs: "States that an HTMLCollection is live and updates itself when the document changes.",
    },
    {
      label: "MDN: NodeList",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/NodeList",
      kind: "docs",
      backs: "Explains that querySelectorAll returns a static NodeList while childNodes returns a live one.",
    },
    {
      label: "MDN: KeyboardEvent.code",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code",
      kind: "docs",
      backs: "Explains that code names the physical key regardless of layout, while key gives the character produced.",
    },
    {
      label: "MDN: DocumentFragment",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment",
      kind: "docs",
      backs:
        "Explains that a fragment is not part of the active document tree, so changes made to it do not affect the document.",
    },
  ],
  "basic-async": [
    {
      label: "MDN: Using promises",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
      kind: "docs",
      backs:
        "Covers chaining, returning promises from then callbacks, error propagation and the callback nesting that promises replaced.",
    },
    {
      label: "ECMAScript Language Specification: Promise Objects",
      url: "https://tc39.es/ecma262/#sec-promise-objects",
      kind: "spec",
      backs: "Defines the three promise states and that a settled promise never changes state again.",
    },
    {
      label: "HTML Standard: Timers",
      url: "https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers",
      kind: "spec",
      backs: "Specifies setTimeout and setInterval as queuing a task after at least the given delay.",
    },
    {
      label: "Node.js docs: util.promisify(original)",
      url: "https://nodejs.org/api/util.html#utilpromisifyoriginal",
      kind: "docs",
      backs: "Describes the common error-first callback style, an (err, value) callback passed as the last argument.",
    },
    {
      label: "MDN: Using the Fetch API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
      kind: "docs",
      backs:
        "States that fetch rejects only on network failure, so HTTP error statuses must be checked with response.ok.",
    },
    {
      label: "MDN: JSON.stringify()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify",
      kind: "docs",
      backs:
        "Lists what JSON.stringify drops or converts: undefined, functions and symbols, plus the error on circular references.",
    },
  ],
  "errors-tools": [
    {
      label: "MDN: try...catch",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch",
      kind: "docs",
      backs: "Documents that a return inside finally replaces any return or throw from the try and catch blocks.",
    },
    {
      label: "MDN: Error",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error",
      kind: "docs",
      backs: "Lists the built-in error types and shows how to subclass Error for custom errors.",
    },
    {
      label: "MDN: debugger statement",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger",
      kind: "docs",
      backs: "States that debugger acts as a breakpoint when developer tools are open and does nothing otherwise.",
    },
    {
      label: "Chrome DevTools: Console API reference",
      url: "https://developer.chrome.com/docs/devtools/console/api",
      kind: "docs",
      backs: "Reference for the console methods beyond log: table, group, time, assert, count and trace.",
    },
  ],
  "guided-project-todo": [
    {
      label: "MDN: Event bubbling",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling",
      kind: "docs",
      backs:
        "Explains bubbling and event delegation, the one-listener-on-the-list technique used for toggling and deleting.",
    },
    {
      label: "MDN: Element.closest()",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/closest",
      kind: "docs",
      backs: "Documents closest, used to find the list item that owns a clicked button.",
    },
    {
      label: "MDN: Using the Web Storage API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API",
      kind: "docs",
      backs: "Shows saving and reading values with localStorage so state survives a page reload.",
    },
    {
      label: "MDN: Element.replaceChildren()",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren",
      kind: "docs",
      backs: "Documents replacing all children of an element in one call, the basis of a render-from-state function.",
    },
  ],
  "scope-functions": [
    {
      label: "MDN: Function: length",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length",
      kind: "docs",
      backs: "States that length counts parameters before the first default or rest parameter.",
    },
    {
      label: "MDN: Function: name",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name",
      kind: "docs",
      backs: "Documents how functions get their name, including inferred names for anonymous function expressions.",
    },
    {
      label: "ECMAScript Language Specification: Tail Position Calls",
      url: "https://tc39.es/ecma262/#sec-tail-position-calls",
      kind: "spec",
      backs:
        "The specification requires proper tail calls in strict mode, the optimization the recursion section discusses.",
    },
    {
      label: "WebKit blog: ECMAScript 6 Proper Tail Calls in WebKit",
      url: "https://webkit.org/blog/6240/ecmascript-6-proper-tail-calls-in-webkit/",
      kind: "article",
      backs: "Documents that JavaScriptCore, the Safari engine, implements proper tail calls.",
    },
    {
      label: "MDN: Closures",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
      kind: "docs",
      backs:
        "Backs the closure review and the function factory pattern that currying and partial application build on.",
    },
  ],
  "objects-deep": [
    {
      label: "MDN: Window.structuredClone()",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone",
      kind: "docs",
      backs: "Documents deep copying with structuredClone, including support for circular references.",
    },
    {
      label: "MDN: Map (JavaScript)",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map",
      kind: "docs",
      backs: "Compares Map with Object: any value as a key, insertion order, size, and no accidental prototype keys.",
    },
    {
      label: "MDN: WeakMap",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap",
      kind: "docs",
      backs: "States that WeakMap keys are held weakly, do not prevent garbage collection and cannot be enumerated.",
    },
    {
      label: "MDN: Array.prototype.toSorted()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted",
      kind: "docs",
      backs: "Documents toSorted as the copying version of sort that leaves the original array unchanged.",
    },
    {
      label: "MDN: Set.prototype.union()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/union",
      kind: "docs",
      backs: "Documents the set-algebra methods added to Set, starting with union.",
    },
    {
      label: "MDN: Array.prototype.sort()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort",
      kind: "docs",
      backs:
        "States that sort is stable since ECMAScript 2019 and converts elements to strings when no comparator is given.",
    },
  ],
  "prototypes-oop": [
    {
      label: "MDN: Inheritance and the prototype chain",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain",
      kind: "docs",
      backs: "Explains property lookup walking the prototype chain until it reaches null.",
    },
    {
      label: "ECMAScript Language Specification: OrdinaryGet",
      url: "https://tc39.es/ecma262/#sec-ordinaryget",
      kind: "spec",
      backs: "The lookup algorithm: check own properties, then repeat on the result of [[GetPrototypeOf]].",
    },
    {
      label: "MDN: new operator",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new",
      kind: "docs",
      backs:
        "Lists the steps new performs: create an object, link its prototype, run the constructor with this, return the object.",
    },
    {
      label: "MDN: Private elements",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements",
      kind: "docs",
      backs: "Documents #private fields and methods and the #field in obj check for a private name.",
    },
    {
      label: "MDN: Static initialization blocks",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks",
      kind: "docs",
      backs: "Documents static blocks that run once when the class is evaluated and can read private names.",
    },
    {
      label: "MDN: Symbol.hasInstance",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance",
      kind: "docs",
      backs: "Shows that instanceof calls a Symbol.hasInstance method, so its result can be customised.",
    },
  ],
  "async-properly": [
    {
      label: "MDN: Promise, Promise concurrency",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#promise_concurrency",
      kind: "docs",
      backs: "Summarises the four combinators: all, allSettled, any and race, and how each settles.",
    },
    {
      label: "MDN: Promise.all()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all",
      kind: "docs",
      backs:
        "States that Promise.all rejects on the first rejection without waiting for or stopping the other promises.",
    },
    {
      label: "MDN: AbortController",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController",
      kind: "docs",
      backs: "Documents aborting a fetch through a controller's signal, which rejects the fetch with an AbortError.",
    },
    {
      label: "MDN: AbortSignal.any()",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static",
      kind: "docs",
      backs: "Documents combining several signals into one that aborts when any of them does.",
    },
    {
      label: "MDN: Promise.withResolvers()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers",
      kind: "docs",
      backs: "Documents getting a promise together with its resolve and reject functions in one call.",
    },
    {
      label: "Node.js docs: process event 'unhandledRejection'",
      url: "https://nodejs.org/api/process.html#event-unhandledrejection",
      kind: "docs",
      backs: "Documents the event emitted when a promise rejects with no handler attached.",
    },
  ],
  "modules-tooling": [
    {
      label: "MDN: JavaScript modules",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules",
      kind: "docs",
      backs: "Covers import and export syntax, module scripts in HTML and loading modules on demand with import().",
    },
    {
      label: "Node.js docs: Modules: ECMAScript modules",
      url: "https://nodejs.org/api/esm.html",
      kind: "docs",
      backs: "Documents how Node runs ESM, how it interoperates with CommonJS, and import.meta properties.",
    },
    {
      label: "Node.js docs: Modules: Packages",
      url: "https://nodejs.org/api/packages.html#exports",
      kind: "docs",
      backs:
        "Documents the package.json exports field, which defines entry points and blocks access to other internal paths.",
    },
    {
      label: "Semantic Versioning 2.0.0",
      url: "https://semver.org/",
      kind: "spec",
      backs: "Defines the major, minor and patch meaning that npm version ranges rely on.",
    },
    {
      label: "MDN: import attributes",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with",
      kind: "docs",
      backs: 'Documents the with { type: "json" } syntax for importing JSON and other non-JavaScript modules.',
    },
    {
      label: "MDN: Import map script type",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap",
      kind: "docs",
      backs: "Documents import maps, which let the browser resolve bare module specifiers without a bundler.",
    },
  ],
  "regex-dates-apis": [
    {
      label: "MDN: Regular expressions guide",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions",
      kind: "docs",
      backs: "Covers pattern syntax, flags, groups and the methods that accept a regular expression.",
    },
    {
      label: "MDN: Lookbehind assertion",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Lookbehind_assertion",
      kind: "docs",
      backs: "Documents (?<=...) and (?<!...), which match based on what comes before without consuming it.",
    },
    {
      label: "OWASP: Regular expression Denial of Service (ReDoS)",
      url: "https://community.owasp.org/attacks/Regular_expression_Denial_of_Service_-_ReDoS",
      kind: "article",
      backs: "Explains catastrophic backtracking: nested quantifiers that take exponential time on a crafted input.",
    },
    {
      label: "MDN: RegExp.prototype.sticky",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky",
      kind: "docs",
      backs: "Documents the y flag, which matches only at lastIndex, in contrast with g, which searches forward.",
    },
    {
      label: "MDN: Date",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date",
      kind: "docs",
      backs: "States that a Date is a count of milliseconds since the epoch and that months are zero-based.",
    },
    {
      label: "MDN: Temporal",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal",
      kind: "docs",
      backs: "Documents the Temporal API that replaces Date and lists the browser versions that ship it.",
    },
  ],
  "browser-apis-deep": [
    {
      label: "MDN: Web Storage API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API",
      kind: "docs",
      backs:
        "States that sessionStorage lasts for the tab's session while localStorage persists, and that both store string key and value pairs per origin.",
    },
    {
      label: "MDN: URLSearchParams",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams",
      kind: "docs",
      backs: "Reference for reading and building query strings without manual encoding.",
    },
    {
      label: "MDN: Intersection Observer API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API",
      kind: "docs",
      backs: "Explains observing element visibility asynchronously instead of running scroll handlers.",
    },
    {
      label: "MDN: Event bubbling",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling",
      kind: "docs",
      backs: "Explains capture and bubble phases, stopPropagation and event delegation.",
    },
    {
      label: "MDN: Clipboard API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API",
      kind: "docs",
      backs: "States that clipboard access needs a secure context and, for reading, user permission or activation.",
    },
    {
      label: "MDN: Broadcast Channel API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API",
      kind: "docs",
      backs: "Documents messaging between tabs, windows and workers of the same origin.",
    },
  ],
  "modern-js": [
    {
      label: "TC39: Finished Proposals",
      url: "https://github.com/tc39/proposals/blob/main/finished-proposals.md",
      kind: "spec",
      backs: "The committee's list of finished proposals with the edition year each one lands in.",
    },
    {
      label: "MDN: Iterator",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator",
      kind: "docs",
      backs: "Documents the iterator helper methods (map, filter, take, drop) that evaluate lazily.",
    },
    {
      label: "MDN: Promise.try()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try",
      kind: "docs",
      backs: "States that Promise.try runs a function and turns a synchronous throw into a rejected promise.",
    },
    {
      label: "MDN: RegExp.escape()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape",
      kind: "docs",
      backs: "Documents escaping user text so it can be placed inside a regular expression literally.",
    },
    {
      label: "MDN: Error.isError()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError",
      kind: "docs",
      backs: "Explains why instanceof Error fails across realms and how Error.isError checks reliably.",
    },
    {
      label: "MDN: Temporal",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal",
      kind: "docs",
      backs:
        "Documents the Temporal date and time API and its compatibility table, which lists Chrome 144 and Firefox 139.",
    },
  ],
  "error-handling-debugging": [
    {
      label: "MDN: Error: cause",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause",
      kind: "docs",
      backs: "Documents passing { cause } when rethrowing so the original error is kept.",
    },
    {
      label: "MDN: Window: unhandledrejection event",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event",
      kind: "docs",
      backs: "Documents the global event fired when a promise rejects with no rejection handler.",
    },
    {
      label: "MDN: Window: error event",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event",
      kind: "docs",
      backs: "Documents window.onerror's five arguments and that it catches uncaught script errors.",
    },
    {
      label: "MDN: AggregateError",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError",
      kind: "docs",
      backs: "States that AggregateError wraps several errors and is what Promise.any rejects with.",
    },
    {
      label: "Chrome DevTools: Pause your code with breakpoints",
      url: "https://developer.chrome.com/docs/devtools/javascript/breakpoints",
      kind: "docs",
      backs: "Covers conditional and logging breakpoints, plus DOM, XHR and exception breakpoints.",
    },
  ],
  "realtime-connections": [
    {
      label: "RFC 6455: The WebSocket Protocol",
      url: "https://www.rfc-editor.org/rfc/rfc6455.html",
      kind: "spec",
      backs: "Defines the HTTP Upgrade handshake and the two-way framed connection that WebSocket uses.",
    },
    {
      label: "HTML Standard: Server-sent events",
      url: "https://html.spec.whatwg.org/multipage/server-sent-events.html",
      kind: "spec",
      backs: "Specifies EventSource, the text/event-stream format, automatic reconnection and Last-Event-ID.",
    },
    {
      label:
        "RFC 6202: Known Issues and Best Practices for the Use of Long Polling and Streaming in Bidirectional HTTP",
      url: "https://www.rfc-editor.org/rfc/rfc6202.html",
      kind: "spec",
      backs:
        "Describes HTTP long polling: the server holds a request open until it has data, then the client re-requests.",
    },
    {
      label: "AWS Architecture Blog: Exponential Backoff And Jitter",
      url: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/",
      kind: "article",
      backs:
        "Shows why reconnect delays need both exponential growth and random jitter to avoid clients retrying in step.",
    },
    {
      label: "MDN: WebSocket",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket",
      kind: "docs",
      backs: "Reference for the browser WebSocket object: its events, readyState values and send and close methods.",
    },
  ],
  "offline-storage": [
    {
      label: "MDN: Storage quotas and eviction criteria",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria",
      kind: "docs",
      backs: "Gives the Web Storage limit of about 5 MiB per origin and the disk-based quotas for IndexedDB and Cache.",
    },
    {
      label: "MDN: IndexedDB API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API",
      kind: "docs",
      backs:
        "Describes IndexedDB as an asynchronous, transactional store for structured data, including files and blobs.",
    },
    {
      label: "W3C: Service Workers (Editor's Draft)",
      url: "https://w3c.github.io/ServiceWorker/",
      kind: "spec",
      backs: "Specifies the install, waiting and activate lifecycle, skipWaiting, and the Cache interface.",
    },
    {
      label: "web.dev: The service worker lifecycle",
      url: "https://web.dev/articles/service-worker-lifecycle",
      kind: "docs",
      backs:
        "Explains why an updated worker waits until old tabs close, and what skipWaiting and clients.claim change.",
    },
    {
      label: "MDN: Making PWAs installable",
      url: "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable",
      kind: "docs",
      backs: "Lists what a browser needs before offering install: a web app manifest and a secure context.",
    },
    {
      label: "MDN: Navigator: onLine property",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine",
      kind: "docs",
      backs:
        "Warns that navigator.onLine is inherently unreliable: a LAN connection counts as online even without internet access.",
    },
  ],
  "engine-memory": [
    {
      label: "MDN: Memory management",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management",
      kind: "docs",
      backs: "Explains why reference counting leaks cycles and how mark-and-sweep reachability replaced it.",
    },
    {
      label: "V8 blog: Trash talk: the Orinoco garbage collector",
      url: "https://v8.dev/blog/trash-talk",
      kind: "article",
      backs:
        "Describes V8's generational heap, the Scavenger for the young generation and mark-compact for the old one.",
    },
    {
      label: "V8 blog: Fast properties in V8",
      url: "https://v8.dev/blog/fast-properties",
      kind: "article",
      backs: "Explains hidden classes (maps), transitions between them and what dictionary mode costs.",
    },
    {
      label: "JavaScript engine fundamentals: Shapes and Inline Caches",
      url: "https://mathiasbynens.be/notes/shapes-ics",
      kind: "article",
      backs:
        "Explains shapes and inline caches, and why objects that share a shape make repeated property access fast.",
    },
    {
      label: "V8 blog: Maglev, V8's fastest optimizing JIT",
      url: "https://v8.dev/blog/maglev",
      kind: "article",
      backs:
        "Lays out V8's tiers from interpreter to optimizing compilers and how failed assumptions trigger deoptimization.",
    },
    {
      label: "Chrome DevTools: Record heap snapshots",
      url: "https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots",
      kind: "docs",
      backs: "Documents taking and comparing heap snapshots, retainers, and shallow versus retained size.",
    },
  ],
  "advanced-async": [
    {
      label: "Node.js docs: The Node.js Event Loop",
      url: "https://nodejs.org/learn/asynchronous-work/event-loop-timers-and-nexttick",
      kind: "docs",
      backs:
        "Describes the phases of Node's event loop (timers, poll, check and the rest) and where process.nextTick fits.",
    },
    {
      label: "HTML Standard: Perform a microtask checkpoint",
      url: "https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint",
      kind: "spec",
      backs: "The loop that runs until the microtask queue is empty, which is how endless microtasks starve rendering.",
    },
    {
      label: "MDN: Iterators and generators",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators",
      kind: "docs",
      backs: "Covers generator functions, yield, and passing values back in with next, return and throw.",
    },
    {
      label: "Streams Standard",
      url: "https://streams.spec.whatwg.org/",
      kind: "spec",
      backs:
        "Defines readable, writable and transform streams, and backpressure signalled through the queue's high water mark.",
    },
    {
      label: "MDN: SharedArrayBuffer",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer",
      kind: "docs",
      backs: "States that shared memory needs cross-origin isolation and that Atomics is used to coordinate access.",
    },
    {
      label: "MDN: Array.fromAsync()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync",
      kind: "docs",
      backs: "Documents building an array from an async iterable, awaiting each value in turn.",
    },
  ],
  metaprogramming: [
    {
      label: "MDN: Symbol",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol",
      kind: "docs",
      backs:
        "States that every Symbol() is unique, and lists the well-known symbols that hook into language behaviour.",
    },
    {
      label: "MDN: Iteration protocols",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols",
      kind: "docs",
      backs:
        "Defines the iterable protocol (Symbol.iterator) and the iterator protocol (next returning done and value).",
    },
    {
      label: "ECMAScript Language Specification: Proxy Object Internal Methods and Internal Slots",
      url: "https://tc39.es/ecma262/#sec-proxy-object-internal-methods-and-internal-slots",
      kind: "spec",
      backs: "Lists each proxy trap and the invariants a handler's result must still satisfy.",
    },
    {
      label: "Vue docs: Reactivity in Depth",
      url: "https://vuejs.org/guide/extras/reactivity-in-depth.html",
      kind: "docs",
      backs: "States that Vue 2 used getters and setters and Vue 3 uses Proxies for reactive objects.",
    },
    {
      label: "MDN: FinalizationRegistry",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry",
      kind: "docs",
      backs: "Warns that cleanup callbacks may run late or never, so program logic must not depend on them.",
    },
    {
      label: "TC39: ECMAScript Explicit Resource Management proposal",
      url: "https://github.com/tc39/proposal-explicit-resource-management",
      kind: "spec",
      backs: "The proposal for using declarations and Symbol.dispose, which run cleanup when a block exits.",
    },
  ],
  "types-data": [
    {
      label: "MDN: BigInt",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt",
      kind: "docs",
      backs:
        "Documents arbitrary-size integers, the n suffix, and that BigInt and Number cannot be mixed in arithmetic.",
    },
    {
      label: "MDN: JavaScript typed arrays",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays",
      kind: "docs",
      backs: "Explains the split between an ArrayBuffer of raw bytes and the typed array or DataView that reads it.",
    },
    {
      label: "MDN: TextEncoder",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder",
      kind: "docs",
      backs: "States that TextEncoder turns a string into UTF-8 bytes in a Uint8Array.",
    },
    {
      label: "MDN: Uint8Array.prototype.toBase64()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64",
      kind: "docs",
      backs: "Documents the built-in base64 encoding of bytes, replacing the btoa string workaround.",
    },
    {
      label: "MDN: String, UTF-16 characters, Unicode code points, and grapheme clusters",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters",
      kind: "docs",
      backs:
        "Explains that strings are sequences of UTF-16 code units, so length and indexing can split a surrogate pair.",
    },
    {
      label: "MDN: Intl.Segmenter",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter",
      kind: "docs",
      backs: "Documents locale-aware splitting of text into graphemes, words or sentences.",
    },
  ],
  "patterns-architecture": [
    {
      label: "Express docs: Using middleware",
      url: "https://expressjs.com/en/guide/using-middleware/",
      kind: "docs",
      backs: "Documents middleware as functions that receive next and must call it to pass control down the chain.",
    },
    {
      label: "Redux docs: Middleware",
      url: "https://redux.js.org/understanding/history-and-design/middleware",
      kind: "docs",
      backs: "Shows Redux middleware as functions wrapping dispatch, each given a next to call.",
    },
    {
      label: "TC39: JavaScript Signals standard proposal",
      url: "https://github.com/tc39/proposal-signals",
      kind: "spec",
      backs:
        "Describes signals as values that track their dependents and names the frameworks whose designs it draws on.",
    },
    {
      label: "React docs: Component, Catching rendering errors with an error boundary",
      url: "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary",
      kind: "docs",
      backs: "Documents error boundaries that catch a rendering error in a subtree and show fallback UI.",
    },
    {
      label: "XState docs: State machines",
      url: "https://stately.ai/docs/state-machines-and-statecharts",
      kind: "docs",
      backs: "Introduces finite state machines: a fixed set of states, with events that move between them.",
    },
    {
      label: "Node.js docs: Modules: CommonJS modules, Caching",
      url: "https://nodejs.org/api/modules.html#caching",
      kind: "docs",
      backs: "States that a module is cached after first load, so every require returns the same object.",
    },
  ],
  performance: [
    {
      label: "web.dev: Web Vitals",
      url: "https://web.dev/articles/vitals",
      kind: "docs",
      backs: "Gives the Core Web Vitals thresholds: LCP within 2.5 s, INP of 200 ms or less, CLS of 0.1 or less.",
    },
    {
      label: "web.dev: Optimize long tasks",
      url: "https://web.dev/articles/optimize-long-tasks",
      kind: "docs",
      backs: "Defines a long task as over 50 ms and shows breaking work up by yielding to the main thread.",
    },
    {
      label: "MDN: Scheduler: yield() method",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield",
      kind: "docs",
      backs:
        "Documents scheduler.yield, which pauses a task so the browser can handle input, then resumes it with priority.",
    },
    {
      label: "Chrome for Developers: Long Animation Frames API",
      url: "https://developer.chrome.com/docs/web-platform/long-animation-frames",
      kind: "docs",
      backs: "Explains long animation frames and the script attribution that the Long Tasks API lacks.",
    },
    {
      label: "web.dev: Understand the critical path",
      url: "https://web.dev/learn/performance/understanding-the-critical-path",
      kind: "docs",
      backs: "Explains the critical rendering path and which resources block rendering or parsing.",
    },
    {
      label: "webpack docs: Tree Shaking",
      url: "https://webpack.js.org/guides/tree-shaking/",
      kind: "docs",
      backs: "States that tree shaking relies on static ES module syntax and on the sideEffects flag.",
    },
  ],
  security: [
    {
      label: "OWASP Cheat Sheet Series: Cross Site Scripting Prevention",
      url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
      kind: "docs",
      backs: "Backs the XSS section: encode output for its context and avoid unsafe sinks such as innerHTML.",
    },
    {
      label: "MDN: Cross-Origin Resource Sharing (CORS)",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS",
      kind: "docs",
      backs:
        "Documents which requests trigger a preflight OPTIONS request and the headers the server must answer with.",
    },
    {
      label: "MDN: Set-Cookie header",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie",
      kind: "docs",
      backs: "Defines SameSite Strict, Lax and None, plus HttpOnly, which hides a cookie from JavaScript.",
    },
    {
      label: "RFC 7519: JSON Web Token (JWT)",
      url: "https://www.rfc-editor.org/rfc/rfc7519.html",
      kind: "spec",
      backs:
        "Defines a JWT as base64url-encoded claims that are signed or MACed, which protects integrity, not secrecy, unless encrypted.",
    },
    {
      label: "RFC 7636: Proof Key for Code Exchange by OAuth Public Clients",
      url: "https://www.rfc-editor.org/rfc/rfc7636.html",
      kind: "spec",
      backs:
        "Defines PKCE: the code_verifier and code_challenge that stop an intercepted authorization code being redeemed.",
    },
    {
      label: "MDN: Subresource Integrity",
      url: "https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity",
      kind: "docs",
      backs: "Documents the integrity attribute: the browser refuses a script whose hash does not match.",
    },
  ],
  "ecosystem-professional": [
    {
      label: "The TC39 Process",
      url: "https://tc39.es/process-document/",
      kind: "spec",
      backs: "Defines the proposal stages 0, 1, 2, 2.7, 3 and 4 and the entrance criteria for each.",
    },
    {
      label: "TypeScript Handbook: Type Compatibility",
      url: "https://www.typescriptlang.org/docs/handbook/type-compatibility.html",
      kind: "docs",
      backs:
        "States that TypeScript's type system is structural: compatibility depends on members, not declared names.",
    },
    {
      label: "Deno docs: Security and permissions",
      url: "https://docs.deno.com/runtime/fundamentals/security/",
      kind: "docs",
      backs: "States that Deno code has no file, network or environment access unless a permission flag grants it.",
    },
    {
      label: "Bun docs: What is Bun?",
      url: "https://bun.sh/docs",
      kind: "docs",
      backs:
        "States that Bun is powered by JavaScriptCore and ships a test runner, script runner and package manager in one executable.",
    },
    {
      label: "Babel docs: Plugins",
      url: "https://babeljs.io/docs/plugins",
      kind: "docs",
      backs: "Documents that Babel's code transformations are done by plugins applied to the parsed program.",
    },
    {
      label: "ESTree Spec",
      url: "https://github.com/estree/estree",
      kind: "spec",
      backs: "The community AST format that Babel, ESLint and other JavaScript tools build on.",
    },
  ],
  "testing-in-js": [
    {
      label: "Vitest docs: Mocking",
      url: "https://vitest.dev/guide/mocking",
      kind: "docs",
      backs: "Covers vi.fn, vi.spyOn, module mocks and fake timers, the tools the chapter's examples use.",
    },
    {
      label: "Vitest docs: Vi utility, vi.advanceTimersByTime",
      url: "https://vitest.dev/api/vi.html#vi-advancetimersbytime",
      kind: "docs",
      backs: "Documents advancing fake timers by a number of milliseconds without waiting in real time.",
    },
    {
      label: "Testing Library docs: About Queries, Priority",
      url: "https://testing-library.com/docs/queries/about/#priority",
      kind: "docs",
      backs: "Ranks queries with getByRole first and test ids last, so tests find elements the way users do.",
    },
    {
      label: "Mock Service Worker docs: Introduction",
      url: "https://mswjs.io/docs/",
      kind: "docs",
      backs: "Describes intercepting requests at the network level with a service worker instead of patching fetch.",
    },
    {
      label: "fast-check docs: What is property-based testing?",
      url: "https://fast-check.dev/docs/introduction/what-is-property-based-testing/",
      kind: "docs",
      backs: "Explains property-based testing: state a rule, generate many inputs, and shrink a failing case.",
    },
    {
      label: "Playwright docs: Auto-waiting",
      url: "https://playwright.dev/docs/actionability",
      kind: "docs",
      backs: "Documents that Playwright waits for an element to be actionable before acting, removing manual sleeps.",
    },
  ],
  cheat: [
    {
      label: "MDN: Equality comparisons and sameness",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness",
      kind: "docs",
      backs: "The full comparison table for ==, === and Object.is, including NaN and signed zeros.",
    },
    {
      label: "MDN: Array, Copying methods and mutating methods",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods",
      kind: "docs",
      backs: "The table of which array methods mutate and which non-mutating method replaces each one.",
    },
    {
      label: "MDN: Using microtasks in JavaScript with queueMicrotask()",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide",
      kind: "docs",
      backs: "States the ordering rule: the microtask queue is emptied after each task, before the next task starts.",
    },
    {
      label: "MDN: typeof operator",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof",
      kind: "docs",
      backs: "The typeof result table behind the type-check grid, including typeof null.",
    },
  ],
  "browser-observability": [
    {
      label: "ECMA-426: Source map format specification",
      url: "https://tc39.es/ecma426/",
      kind: "spec",
      backs: "Defines the source map format that maps positions in generated code back to original sources.",
    },
    {
      label: "web.dev: Why lab and field data can be different",
      url: "https://web.dev/articles/lab-and-field-data-differences",
      kind: "docs",
      backs: "Explains why real-user field data differs from lab runs and which one reflects actual experience.",
    },
    {
      label: "web.dev: Web Vitals",
      url: "https://web.dev/articles/vitals",
      kind: "docs",
      backs: "Gives the thresholds the chapter quotes: LCP 2.5 s, INP 200 ms, CLS 0.1.",
    },
    {
      label: "MDN: Navigator.sendBeacon()",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon",
      kind: "docs",
      backs: "Documents sending a small report asynchronously in a way that survives page unload.",
    },
    {
      label: "Chrome for Developers: Long Animation Frames API",
      url: "https://developer.chrome.com/docs/web-platform/long-animation-frames",
      kind: "docs",
      backs: "Documents the frame and script attribution used to find what blocked the main thread for real users.",
    },
    {
      label: "MDN: Window: unhandledrejection event",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event",
      kind: "docs",
      backs: "Documents the global hook, alongside the error event, for catching failures that escaped every handler.",
    },
  ],
  "interview-bank": [
    {
      label: "MDN: Closures",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
      kind: "docs",
      backs: "Backs the closure and loop questions, including the classic var-in-a-loop output.",
    },
    {
      label: "MDN: this",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this",
      kind: "docs",
      backs:
        "Backs the this questions: the value depends on the call site, and arrows take it from the enclosing scope.",
    },
    {
      label: "HTML Standard: Event loop processing model",
      url: "https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model",
      kind: "spec",
      backs: "Backs the output-prediction drills: one task, then every microtask, before the next task.",
    },
    {
      label: "MDN: Inheritance and the prototype chain",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain",
      kind: "docs",
      backs: "Backs the prototype and class questions: classes are syntax over prototype links.",
    },
    {
      label: "ECMAScript Language Specification: IsLooselyEqual",
      url: "https://tc39.es/ecma262/#sec-islooselyequal",
      kind: "spec",
      backs: "Backs the coercion questions with the exact steps == follows.",
    },
  ],
  "build-it-yourself": [
    {
      label: "Promises/A+ specification",
      url: "https://promisesaplus.com/",
      kind: "spec",
      backs:
        "The specification a hand-written promise must meet: three states, then chaining and asynchronous callbacks.",
    },
    {
      label: "MDN: Function.prototype.bind()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind",
      kind: "docs",
      backs: "Defines what a hand-written bind must copy: a fixed this, leading arguments, and behaviour under new.",
    },
    {
      label: "MDN Glossary: Debounce",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/Debounce",
      kind: "docs",
      backs: "Defines debouncing as waiting until calls stop for a set time before running once.",
    },
    {
      label: "MDN Glossary: Throttle",
      url: "https://developer.mozilla.org/en-US/docs/Glossary/Throttle",
      kind: "docs",
      backs: "Defines throttling as running at most once per interval, in contrast with debounce.",
    },
    {
      label: "MDN: The structured clone algorithm",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm",
      kind: "docs",
      backs:
        "Lists what a complete deep clone handles (cycles, Map, Set, Date) and what it cannot copy, such as functions.",
    },
    {
      label: "MDN: Map (JavaScript)",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map",
      kind: "docs",
      backs: "States that a Map iterates in insertion order, the property the O(1) LRU cache relies on.",
    },
  ],
};
