import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "sq-undo-history",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "recognise",
      pattern: "stack",
      section: "the-only-thing-that-actually-differs-between-them",
      placement: true,
      kind: "single",
      prompt:
        "<p>A drawing app must support undo: pressing it reverses the most recent action, and pressing it again reverses the one before that. Which structure should hold the actions?</p>",
      choices: [
        {
          id: "a",
          text: "A queue, so the oldest action is reversed first.",
          why: "A queue gives back the oldest item first, so undo would reverse the first thing ever drawn. Undo needs the newest action first.",
        },
        {
          id: "b",
          text: "A stack: push each action, pop to undo.",
          why: "A stack is last in, first out, so the action popped is always the most recent one that has not been undone yet. Push and pop are both O(1).",
        },
        {
          id: "c",
          text: "A set, since each action only needs to be stored once.",
          why: 'A set holds each value once and is built to answer "is this in here", not "what came last". The same action can also happen many times, and each time needs its own entry.',
        },
        {
          id: "d",
          text: "A hash map from each action to the time it happened.",
          why: "The map would let you look an action up, but finding the most recent one means scanning every entry. That is a lookup structure, not an ordering rule.",
        },
      ],
      answer: "b",
    },
    {
      id: "sq-brackets-structure",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "recognise",
      pattern: "stack",
      section: "the-pattern-stacks-solve-matching-and-undoing",
      placement: true,
      kind: "single",
      prompt:
        '<p>You must check that every bracket in a string such as <code>"([]{})"</code> is closed by the right kind of bracket, in the right order. Which approach is correct?</p>',
      choices: [
        {
          id: "a",
          text: "Count the opening and closing brackets of each kind and check that the totals match.",
          why: 'The string <code>"([)]"</code> has one of each bracket on both sides, yet it is invalid because the brackets close in the wrong order. Counting loses the order.',
        },
        {
          id: "b",
          text: "Split the string in half and check that the second half mirrors the first.",
          why: 'Valid strings do not have to mirror around the middle. <code>"()[]"</code> is valid, but its two halves, <code>"()"</code> and <code>"[]"</code>, are different.',
        },
        {
          id: "c",
          text: "Push each opening bracket onto a stack. On a closing bracket, pop and check it matches. At the end the stack must be empty.",
          why: "The bracket that has to be closed next is always the most recently opened one that is still open, and that is what the top of a stack holds. A mismatch, a pop from an empty stack or a leftover opener each mean the string is invalid.",
        },
        {
          id: "d",
          text: "Sort the characters so that matching brackets end up next to each other.",
          why: 'Sorting throws away the order of the characters, and the order is exactly what decides validity. <code>"([)]"</code> and <code>"()[]"</code> have the same characters and sort to the same string.',
        },
      ],
      answer: "c",
    },
    {
      id: "sq-arrival-order",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "recognise",
      pattern: "stack",
      section: "recognizing-which-one-you-need",
      placement: true,
      kind: "single",
      prompt: "<p>Which of these tasks needs a queue rather than a stack?</p>",
      choices: [
        {
          id: "a",
          text: "Undoing edits, newest edit first.",
          why: "Undo needs the most recent item first, which is a stack's last in, first out rule.",
        },
        {
          id: "b",
          text: "Evaluating a postfix expression such as <code>3 4 + 2 *</code>.",
          why: "Each operator uses the two most recent operands, so the numbers are kept on a stack.",
        },
        {
          id: "c",
          text: "Checking that every opening bracket in a string is closed in the right order.",
          why: "The closing bracket has to match the most recently opened one, which again is a job for a stack.",
        },
        {
          id: "d",
          text: "Visiting graph nodes nearest first, in the order found.",
          why: "Breadth-first search processes things in exactly the order they were found, oldest first, and that is a queue's first in, first out rule. A stack would dive deep along one path first.",
        },
      ],
      answer: "d",
    },
    {
      id: "sq-shift-queue-cost",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "complexity",
      pattern: "stack",
      section: "stacks-in-js-just-use-an-array",
      kind: "single",
      prompt:
        "<p>A teammate drains an array-based queue holding n items like this. Assume <code>handle</code> is O(1). What should you plan for in the worst case?</p><pre><code>while (queue.length &gt; 0) {\n  const item = queue.shift();\n  handle(item);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n²) in total, because each <code>shift()</code> can cost O(n).",
          why: "<code>shift()</code> removes from the front, and every remaining element can have to move down one place. Some engines may speed this up, but nothing in the language promises it, so plan for O(n) per call and O(n²) for the loop.",
        },
        {
          id: "b",
          text: "O(n) in total, because each <code>shift()</code> removes one element in O(1).",
          why: "That is true of <code>pop()</code>, which removes from the end and moves nothing. <code>shift()</code> removes from the front, and it is the work of closing that gap which can cost O(n).",
        },
        {
          id: "c",
          text: "O(n log n) in total, because the array gets shorter as the loop runs.",
          why: "The array shrinking only halves the work on average, from n·n to about n·n/2, and that is still O(n²). Nothing in the loop divides the problem in half.",
        },
        {
          id: "d",
          text: "O(1) in total, because the loop body is O(1).",
          why: "The loop body runs n times, so even with an O(1) body the total would be at least O(n). It is also the <code>shift()</code> call, not <code>handle</code>, that costs more than O(1).",
        },
      ],
      answer: "a",
    },
    {
      id: "sq-two-stack-cost",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "complexity",
      pattern: "stack",
      section: "stacks-in-js-just-use-an-array",
      kind: "single",
      prompt:
        "<p>The chapter's two-stack <code>Queue</code> receives n calls to <code>enqueue</code> followed by n calls to <code>dequeue</code>. What is the total work?</p>",
      choices: [
        {
          id: "a",
          text: "O(n²), because every dequeue may have to move all the elements.",
          why: "Only the first dequeue finds <code>#outStack</code> empty and moves everything. After that the elements sit in <code>#outStack</code> in the right order, and each dequeue just pops one.",
        },
        {
          id: "b",
          text: "O(n), because each element moves from <code>#inStack</code> to <code>#outStack</code> at most once.",
          why: "The first dequeue costs O(n) by itself, but it moves each element exactly once and never again. In all, n enqueues and n dequeues make 4n stack operations, so the cost per call averages out to O(1), which is what amortized O(1) means.",
        },
        {
          id: "c",
          text: "O(n log n), because each move between the stacks halves the amount of data left.",
          why: "Nothing is halved. Each element is pushed, popped, pushed again and popped again, a fixed number of times.",
        },
        {
          id: "d",
          text: "O(1) for every call, with no exceptions.",
          why: "A single dequeue that finds <code>#outStack</code> empty has to move everything and costs O(n). O(1) holds only on average across many calls.",
        },
      ],
      answer: "b",
    },
    {
      id: "sq-min-stack-design",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "recognise",
      pattern: "stack",
      section: "min-stack-the-classic-track-extra-state-per-level-question",
      kind: "single",
      prompt:
        "<p>You need a stack that supports <code>push</code>, <code>pop</code> and <code>getMin</code>, all in O(1). Which design works?</p>",
      choices: [
        {
          id: "a",
          text: "Keep one variable <code>min</code> and update it whenever a smaller value is pushed.",
          why: "This breaks as soon as the minimum is popped. The variable then holds a value that is no longer in the stack, and finding the new minimum means scanning everything.",
        },
        {
          id: "b",
          text: "Scan the whole stack inside <code>getMin</code>.",
          why: "A scan is O(n), so <code>getMin</code> would no longer be O(1).",
        },
        {
          id: "c",
          text: "Keep the stack sorted, so the minimum is always at the bottom.",
          why: "A sorted stack stops being last in, first out, because pop would no longer return the most recent push. Keeping it sorted also means a push can cost O(n).",
        },
        {
          id: "d",
          text: "Keep a second stack of the running minimum at each depth, pushed and popped with the main stack.",
          why: "The second stack's top is always the minimum of everything currently in the main stack. It shrinks in step on every pop, so it never holds stale data, and all three operations are O(1).",
        },
      ],
      answer: "d",
    },
    {
      id: "sq-brackets-trace",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "trace",
      pattern: "stack",
      section: "the-pattern-stacks-solve-matching-and-undoing",
      kind: "single",
      prompt: '<p>The chapter\'s <code>isValid</code> runs on <code>"{[(])}"</code>. What happens?</p>',
      choices: [
        {
          id: "a",
          text: "It returns <code>false</code> at the fourth character, <code>]</code>: the pop gives <code>(</code>, but a <code>]</code> needs <code>[</code>.",
          why: "The first three characters push <code>{</code>, <code>[</code> and <code>(</code>. The <code>]</code> then pops <code>(</code>, which is not the <code>[</code> that <code>pairs</code> expects, so the function returns <code>false</code> at once.",
        },
        {
          id: "b",
          text: "It returns <code>true</code>, because there are three openers and three closers.",
          why: "Equal counts are not enough. The closers must come in the reverse order of the openers, and here the <code>]</code> arrives while <code>(</code> is still open.",
        },
        {
          id: "c",
          text: "It returns <code>false</code> only after the loop, because the stack is not empty.",
          why: "The mismatch is caught inside the loop, at the first <code>]</code>, and the function returns right there. The emptiness check at the end is never reached.",
        },
        {
          id: "d",
          text: "It returns <code>false</code> at the third character, <code>(</code>, because a bracket was opened inside another kind.",
          why: 'Brackets of different kinds can nest freely. <code>"{[()]}"</code>, the chapter\'s own example, opens all three in a row and is valid. The mistake in this string is the order in which they close.',
        },
      ],
      answer: "a",
    },
    {
      id: "sq-min-stack-trace",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "trace",
      pattern: "stack",
      section: "min-stack-the-classic-track-extra-state-per-level-question",
      kind: "single",
      prompt:
        "<p>Starting from an empty <code>MinStack</code>, you call <code>push(4)</code>, <code>push(6)</code>, <code>push(2)</code> and <code>push(5)</code>, then <code>pop()</code> twice. What does <code>getMin()</code> return, and what does <code>#minStack</code> hold?</p>",
      choices: [
        {
          id: "a",
          text: "It returns 2, because 2 was the smallest value ever pushed onto the stack.",
          why: "<code>getMin</code> answers for the values currently in the stack. The 2 was popped by the second <code>pop()</code>, and the minimum of what remains is back to 4.",
        },
        {
          id: "b",
          text: "It returns 6, because 6 is now the value on top of the main stack.",
          why: "The top of the main stack is just the latest value. <code>getMin</code> reads the top of <code>#minStack</code>, not the top of <code>#stack</code>.",
        },
        {
          id: "c",
          text: "It returns 4, and <code>#minStack</code> is <code>[4, 4]</code>.",
          why: "The pushes leave <code>#minStack</code> as <code>[4, 4, 2, 2]</code>, and each pop removes one entry from both stacks. After two pops <code>#stack</code> is <code>[4, 6]</code>, <code>#minStack</code> is <code>[4, 4]</code>, and the minimum is 4.",
        },
        {
          id: "d",
          text: "It returns 4, and <code>#minStack</code> is <code>[4]</code>.",
          why: "The answer is right, but <code>#minStack</code> gets one entry for every push, repeating the current minimum, so it stays the same length as <code>#stack</code>. With two values left in the stack it holds two entries.",
        },
      ],
      answer: "c",
    },
    {
      id: "sq-rpn-division",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "edge-case",
      pattern: "stack",
      section: "evaluating-expressions-the-other-classic-stack-application",
      kind: "single",
      prompt: '<p>The chapter\'s <code>evalRPN</code> runs on <code>["9", "-2", "/"]</code>. What does it return?</p>',
      choices: [
        {
          id: "a",
          text: "<code>-5</code>",
          why: "That is what <code>Math.floor(9 / -2)</code> would give, because floor rounds toward negative infinity. The chapter uses <code>Math.trunc</code>, which rounds toward zero.",
        },
        {
          id: "b",
          text: "<code>-4</code>",
          why: "The tokens push 9 and -2. The <code>/</code> pops <code>b = -2</code> first and <code>a = 9</code> second, and computes <code>Math.trunc(9 / -2)</code>. That is <code>Math.trunc(-4.5)</code>, which is -4.",
        },
        {
          id: "c",
          text: "<code>-4.5</code>",
          why: "<code>Math.trunc</code> removes the fractional part, so the result is a whole number. The chapter's division always truncates.",
        },
        {
          id: "d",
          text: 'It throws, because <code>"-2"</code> looks like an operator.',
          why: 'The test is <code>token in ops</code>, which looks for the whole token among the keys <code>"+"</code>, <code>"-"</code>, <code>"*"</code> and <code>"/"</code>. <code>"-2"</code> is not one of them, so it is read as a number.',
        },
      ],
      answer: "b",
    },
    {
      id: "sq-brackets-failures",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "edge-case",
      pattern: "stack",
      section: "the-pattern-stacks-solve-matching-and-undoing",
      kind: "multi",
      prompt:
        "<p>The chapter's <code>isValid</code> is called on each string below. Select every one for which it returns <code>false</code>.</p>",
      choices: [
        {
          id: "a",
          text: '<code>""</code>, the empty string',
          why: "The loop never runs and the stack is empty, so <code>stack.length === 0</code> is true. An empty string has no unmatched brackets, so it counts as valid.",
        },
        {
          id: "b",
          text: '<code>"("</code>',
          why: "The opener is pushed and nothing closes it, so the stack still holds one item at the end. That is the leftover-opens failure.",
        },
        {
          id: "c",
          text: '<code>")"</code>',
          why: 'The pop runs on an empty stack and returns <code>undefined</code>, which is not <code>"("</code>. That is the failure from popping with nothing to pop.',
        },
        {
          id: "d",
          text: '<code>"()()"</code>',
          why: "Each pair is pushed and popped in turn, and the stack is empty at the end, so it is valid. Brackets do not have to be nested to be valid.",
        },
        {
          id: "e",
          text: '<code>"(()"</code>',
          why: "Two openers are pushed, one is popped by the closer, and one opener is left over, so the stack is not empty at the end.",
        },
      ],
      answers: ["b", "c", "e"],
    },
    {
      id: "sq-circular-trace",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "trace",
      pattern: "stack",
      section: "circular-queue-a-fixed-size-ring-buffer",
      kind: "single",
      prompt:
        '<p>A <code>CircularQueue</code> with capacity 4 gets <code>enqueue("a")</code>, <code>"b"</code>, <code>"c"</code> and <code>"d"</code> in that order, then <code>dequeue()</code> twice, then <code>enqueue("e")</code> and <code>enqueue("f")</code>. What does the internal <code>#data</code> array hold, from slot 0 to slot 3?</p>',
      choices: [
        {
          id: "a",
          text: '<code>["a", "b", "e", "f"]</code>',
          why: "This would be the result if the dequeues removed the newest items. They remove from the front, the oldest first, so <code>a</code> and <code>b</code> are the ones that go.",
        },
        {
          id: "b",
          text: '<code>enqueue("e")</code> throws <code>full</code>, because all four slots still hold values.',
          why: "The queue tracks <code>#size</code>, not which slots hold old data. After two dequeues the size is 2, so there is room. The slots for <code>a</code> and <code>b</code> still hold their old values until they are overwritten.",
        },
        {
          id: "c",
          text: '<code>["e", "f", "c", "d"]</code>',
          why: "After the dequeues <code>#front</code> is 2 and <code>#size</code> is 2. The slot for <code>e</code> is <code>(2 + 2) % 4</code>, which is 0, and the slot for <code>f</code> is <code>(2 + 3) % 4</code>, which is 1. The rear wraps around to the start and nothing shifts.",
        },
        {
          id: "d",
          text: '<code>["c", "d", "e", "f"]</code>',
          why: "That would need the remaining elements to shift down to slot 0. A circular queue never shifts anything. It moves its <code>#front</code> index instead.",
        },
      ],
      answer: "c",
    },
    {
      id: "sq-order-two-stack-dequeue",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "trace",
      pattern: "stack",
      section: "stacks-in-js-just-use-an-array",
      kind: "order",
      prompt:
        "<p>A new two-stack <code>Queue</code> from the chapter receives <code>enqueue(1)</code>, <code>enqueue(2)</code> and then <code>dequeue()</code> twice. Put what happens in order.</p>",
      items: [
        {
          id: "one",
          text: "<code>enqueue(1)</code> pushes 1 onto <code>#inStack</code>, which is now <code>[1]</code>.",
        },
        {
          id: "two",
          text: "<code>enqueue(2)</code> pushes 2 onto <code>#inStack</code>, which is now <code>[1, 2]</code>.",
        },
        {
          id: "move",
          text: "The first <code>dequeue()</code> finds <code>#outStack</code> empty, so it pops 2 and then 1 off <code>#inStack</code> and pushes them onto <code>#outStack</code>, which is now <code>[2, 1]</code>.",
        },
        {
          id: "out",
          text: "The same <code>dequeue()</code> pops the top of <code>#outStack</code> and returns 1, the oldest element.",
        },
        {
          id: "next",
          text: "The second <code>dequeue()</code> finds <code>#outStack</code> not empty and pops 2 from it without touching <code>#inStack</code>.",
        },
      ],
      why: "The enqueues come first and leave the items in <code>#inStack</code> in arrival order. The first dequeue then reverses them into <code>#outStack</code>, which puts the oldest item on top, and pops it. The second dequeue reuses <code>#outStack</code> as it is, which is why each element is moved only once.",
    },
  ],
  pattern: {
    pattern: "stack",
    chapter: "dsa-stacks-queues",
    signals: [
      "The problem needs the most recent unmatched thing, such as the last bracket still open.",
      "Brackets, tags or other pairs have to close in the reverse order they opened.",
      "Undo or backtracking: the latest action is reversed first.",
      "An expression with operators and operands, especially postfix, has to be evaluated.",
      "A running minimum or maximum must be answered as items are pushed and popped.",
    ],
    template:
      "<pre><code>const stack = [];\nfor (const item of input) {\n  if (opens(item)) stack.push(item);\n  else if (stack.pop() !== partnerOf(item)) return false;\n}\nreturn stack.length === 0;</code></pre>",
    time: "O(n)",
    space: "O(n)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
