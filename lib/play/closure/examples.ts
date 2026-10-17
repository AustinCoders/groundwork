import type { ClosureExample } from "./types";

export const closureExamples: ClosureExample[] = [
  {
    id: "closure-counter",
    title: "A counter that remembers",
    source: `function counter() {
  let n = 0;
  return () => ++n;
}

const next = counter();
next();
next();
`,
  },
  {
    id: "closure-two-counters",
    title: "Two counters, two memories",
    source: `function makeCounter() {
  let n = 0;
  return function inc() {
    n += 1;
    return n;
  };
}

const a = makeCounter();
const b = makeCounter();
a();
a();
b();
console.log(a(), b());
`,
  },
  {
    id: "closure-private-state",
    title: "Private state behind two methods",
    source: `function makeBank() {
  let balance = 100;
  return {
    deposit(x) {
      balance += x;
      return balance;
    },
    peek() {
      return balance;
    },
  };
}

const bank = makeBank();
bank.deposit(50);
console.log(bank.peek());
`,
  },
  {
    id: "closure-loop-var",
    title: "A loop with var shares one variable",
    source: `var fns = [];
for (var i = 0; i < 3; i++) {
  fns.push(() => i);
}
console.log(fns[0](), fns[1](), fns[2]());
`,
  },
  {
    id: "closure-loop-let",
    title: "A loop with let gives each pass its own copy",
    source: `const fns = [];
for (let i = 0; i < 3; i++) {
  fns.push(() => i);
}
console.log(fns[0](), fns[1](), fns[2]());
`,
  },
];
