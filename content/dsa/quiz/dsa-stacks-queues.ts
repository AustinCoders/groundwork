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
          text: "Count the opening and closing brackets of each kind and check that the two totals match.",
          why: 'The string <code>"([)]"</code> has one of each bracket on both sides, yet it is invalid because the brackets close in the wrong order. Counting loses the order.',
        },
        {
          id: "b",
          text: "Split the string in half and check that the second half mirrors the first half read backwards.",
          why: 'Valid strings do not have to mirror around the middle. <code>"()[]"</code> is valid, but its two halves, <code>"()"</code> and <code>"[]"</code>, are different.',
        },
        {
          id: "c",
          text: "Push each opener onto a stack. For a closer, pop and check it matches. At the end the stack must be empty.",
          why: "The bracket that has to be closed next is always the most recently opened one that is still open, and that is what the top of a stack holds. A mismatch, a pop from an empty stack or a leftover opener each mean the string is invalid.",
        },
        {
          id: "d",
          text: "Sort the characters so that every pair of matching brackets ends up next to each other.",
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
          text: "Keep one variable <code>min</code> and update it whenever a smaller value is pushed, then return it.",
          why: "This breaks as soon as the minimum is popped. The variable then holds a value that is no longer in the stack, and finding the new minimum means scanning everything.",
        },
        {
          id: "b",
          text: "Keep a plain stack and scan the whole of it inside <code>getMin</code> to find the smallest.",
          why: "A scan is O(n), so <code>getMin</code> would no longer be O(1).",
        },
        {
          id: "c",
          text: "Keep the stack sorted on every push, so the minimum is always sitting at the bottom.",
          why: "A sorted stack stops being last in, first out, because pop would no longer return the most recent push. Keeping it sorted also means a push can cost O(n).",
        },
        {
          id: "d",
          text: "Keep a second stack holding the running minimum at each depth, pushed and popped in step.",
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
    {
      id: "sq-calc-stack-contents",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "trace",
      pattern: "stack",
      section: "infix-expressions-basic-calculator-ii-with-one-stack",
      kind: "single",
      prompt:
        '<p>The chapter\'s <code>calculate</code> evaluates <code>"6-4/2+3*2"</code>. Just before the final <code>reduce</code> adds up the stack, what does the stack hold?</p>',
      choices: [
        {
          id: "a",
          text: "<code>[6, -4, 2, 3, 2]</code>",
          why: "That would be every number pushed as it is read, with no operator applied to the top. The <code>/</code> and <code>*</code> combine a number with the term on top of the stack instead of adding a new entry.",
        },
        {
          id: "b",
          text: "<code>[6, 2, 6]</code>",
          why: "The 6 and the 6 are right, but the middle term is <code>-4 / 2</code>. The minus sign was pushed with the 4, so the division works on -4 and gives -2, not 2.",
        },
        {
          id: "c",
          text: "<code>[10]</code>",
          why: "10 is the final answer, but the stack still holds the separate terms until the <code>reduce</code> adds them. Terms are only combined with each other for <code>*</code> and <code>/</code>.",
        },
        {
          id: "d",
          text: "<code>[6, -2, 6]</code>",
          why: "The 6 is pushed at the <code>-</code>, then -4 is pushed and divided by 2 at the <code>+</code> to give -2, then 3 is pushed and multiplied by 2 at the end to give 6. The sum is 6 − 2 + 6 = 10.",
        },
      ],
      answer: "d",
    },
    {
      id: "sq-calc-parens-save",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "recognise",
      pattern: "stack",
      section: "parentheses-save-the-outer-state-then-combine",
      kind: "single",
      prompt:
        "<p>A calculator handles <code>+</code>, <code>-</code> and parentheses with the variables <code>result</code>, <code>sign</code> and <code>num</code>. What has to be pushed on the stack when it reads a <code>(</code>?</p>",
      choices: [
        {
          id: "a",
          text: "The running <code>result</code> and the <code>sign</code> in front of the bracket, so the outer expression can resume",
          why: "The group will be added to the outer total with the sign that stood before the bracket. Both values are needed at the matching <code>)</code>, and the inner expression then starts again from 0 with sign +1.",
        },
        {
          id: "b",
          text: "Only the sign in front of the bracket",
          why: "The sign alone is not enough. The outer total reached so far would be overwritten when the inner expression starts, and it could not be restored.",
        },
        {
          id: "c",
          text: "The number being read, because it is incomplete",
          why: "Brackets in this calculator are not preceded by a number, and when <code>(</code> arrives the previous number has already been added to <code>result</code> by the operator before it.",
        },
        {
          id: "d",
          text: "The position of the matching <code>)</code>, so the loop can jump over the whole group and carry on after it",
          why: "The loop reads the string once, from left to right, and handles the group as it goes. Nothing is skipped, so no position is saved.",
        },
      ],
      answer: "a",
    },
    {
      id: "sq-asteroid-result",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "trace",
      pattern: "stack",
      section: "collision-simulation-asteroid-collision",
      kind: "single",
      prompt:
        "<p>What does <code>asteroidCollision([8, -3, -10, 2])</code> return? Positive numbers move right, negative numbers move left, and the smaller of two colliding asteroids explodes.</p>",
      choices: [
        {
          id: "a",
          text: "<code>[-10, 2]</code>",
          why: "The -3 hits the 8 and explodes. The -10 then hits the 8, which explodes, and nothing is left to stop it, so it survives. The 2 moves right, away from the -10, and never collides with it.",
        },
        {
          id: "b",
          text: "<code>[8, 2]</code>",
          why: "The 8 survives the -3, but the -10 is bigger than 8 and destroys it. It is the -10 that remains, not the 8.",
        },
        {
          id: "c",
          text: "<code>[8, -10, 2]</code>",
          why: "Both 8 and -10 cannot survive. They move towards each other, so they collide, and the larger one (the -10) stays.",
        },
        {
          id: "d",
          text: "<code>[-10]</code>",
          why: "The 2 comes after the -10 and moves right, so the two are moving apart and never meet. The 2 survives and is pushed after the -10.",
        },
      ],
      answer: "a",
    },
    {
      id: "sq-simplify-path-result",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "edge-case",
      pattern: "stack",
      section: "simplify-path-a-stack-of-directory-names",
      kind: "single",
      prompt: '<p>What does <code>simplifyPath("/a/../../b/./.../c//")</code> return?</p>',
      choices: [
        {
          id: "a",
          text: '<code>"/b/c"</code>',
          why: "This treats <code>...</code> as something to skip. It is not special: only <code>.</code> and <code>..</code> are, so <code>...</code> is an ordinary directory name and stays in the result.",
        },
        {
          id: "b",
          text: '<code>"/../b/.../c"</code>',
          why: "A <code>..</code> at the root does not climb above it and is not kept. After <code>/a/..</code> the stack is empty, and the second <code>..</code> has nothing to pop.",
        },
        {
          id: "c",
          text: '<code>"/b/.../c"</code>',
          why: "<code>a</code> is pushed and popped by the first <code>..</code>, the second <code>..</code> does nothing at the root, <code>b</code> is pushed, <code>.</code> is skipped, <code>...</code> is a real name and is pushed, <code>c</code> is pushed, and the empty segments are skipped.",
        },
        {
          id: "d",
          text: '<code>"/a/b/.../c"</code>',
          why: "The first <code>..</code> removes <code>a</code> from the stack, so it cannot appear in the result.",
        },
      ],
      answer: "c",
    },
    {
      id: "sq-dfs-mark-on-push",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "edge-case",
      pattern: "stack",
      section: "iterative-dfs-an-explicit-stack-instead-of-the-call-stack",
      kind: "single",
      prompt:
        "<p>A teammate writes an iterative DFS that marks a node as visited when it is <em>pushed</em>, and pushes each node's neighbours in the listed order. For the graph <code>A: [B, C]</code>, <code>B: [C]</code>, <code>C: []</code>, starting at <code>A</code>, in what order are the nodes visited (popped)?</p>",
      choices: [
        {
          id: "a",
          text: "<code>A, B, C</code>, the same as a recursive DFS",
          why: "A recursive DFS goes down B before looking at C. Here both B and C are pushed while A is processed, and C is on top of the stack, so it is popped first.",
        },
        {
          id: "b",
          text: "<code>A, B, C, C</code>, because C is reached from both A and B",
          why: "Marking on push stops C from being pushed a second time, so every node is visited exactly once.",
        },
        {
          id: "c",
          text: "It overflows the call stack",
          why: "There is no recursion here. The explicit stack lives on the heap and is not limited by the call stack's depth.",
        },
        {
          id: "d",
          text: "<code>A, C, B</code>, which visits every node once but is not the recursive DFS order",
          why: "A pushes B and C and marks both. The stack top is C, so C is visited before B, and B then finds C already marked. Marking on pop, with the neighbours pushed in reverse, gives <code>A, B, C</code>.",
        },
      ],
      answer: "d",
    },
    {
      id: "sq-adjacent-duplicates-cost",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "complexity",
      pattern: "stack",
      section: "a-stack-as-a-text-editor-backspaces-and-adjacent-duplicates",
      kind: "single",
      prompt:
        "<p>One approach to removing adjacent equal pairs from a string of n characters is to find a pair, delete it and start again from the beginning. The stack version reads the string once. What is the stack version's running time, and why?</p>",
      choices: [
        {
          id: "a",
          text: "O(n²), because after every pop it has to compare the top with the previous characters again",
          why: "After a pop, the new top is already the only character the next one needs to be compared with. Nothing is rescanned.",
        },
        {
          id: "b",
          text: "O(n), because each character is pushed at most once and popped at most once, with one comparison against the top",
          why: "The total work is bounded by the number of pushes and pops, at most 2n, plus a constant amount per character. The find-and-restart method can take O(n²) when removals keep exposing new pairs.",
        },
        {
          id: "c",
          text: "O(n log n), because the stack keeps the characters in sorted order",
          why: "The stack is not ordered. It simply holds the characters kept so far, in the order they appeared.",
        },
        {
          id: "d",
          text: "O(1), because only the top of the stack is ever examined",
          why: "Only the top is examined per character, but all n characters have to be read, so the time is at least linear. The space used is also O(n) in the worst case.",
        },
      ],
      answer: "b",
    },
    {
      id: "sq-stack-from-queue-cost",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "complexity",
      pattern: "stack",
      section: "a-stack-built-from-queues",
      kind: "single",
      prompt:
        "<p>The chapter builds a stack from one queue: <code>push</code> adds <code>x</code> to the back and then rotates the older elements behind it, while <code>pop</code> removes the front. What do the operations cost with n elements stored?</p>",
      choices: [
        {
          id: "a",
          text: "<code>push</code> is O(n) because it rotates n − 1 elements; <code>pop</code>, <code>top</code> and <code>empty</code> are O(1)",
          why: "The rotation moves each older element once from the front to the back, so a push costs about n steps. The newest element is always at the front, so reading or removing it is constant time. The other design makes <code>push</code> O(1) and moves the work into <code>pop</code>.",
        },
        {
          id: "b",
          text: "Every operation is O(1), because the front of the queue is the top of the stack",
          why: "The front being the top is the result of the rotation, and the rotation is what costs O(n) on each push.",
        },
        {
          id: "c",
          text: "<code>push</code> is O(log n), because the queue is rotated by halves",
          why: "The rotation moves the elements one at a time, not in halves, so its cost grows in step with the queue's size.",
        },
        {
          id: "d",
          text: "<code>pop</code> is O(n), because it has to find the newest element",
          why: "The newest element is already at the front thanks to the rotation in <code>push</code>, so <code>pop</code> just removes the front.",
        },
      ],
      answer: "a",
    },
    {
      id: "sq-decode-saved-pair",
      chapter: "dsa-stacks-queues",
      level: "beginner",
      skill: "recognise",
      pattern: "stack",
      section: "a-stack-of-states-for-nesting-decode-string",
      kind: "single",
      prompt:
        '<p>While decoding <code>"2[ab]c"</code>, the loop in <code>decodeString</code> reads the <code>[</code>. What does it push, and why?</p>',
      choices: [
        {
          id: "a",
          text: "The count 2 alone, because the text before the bracket is already in <code>current</code> and will still be there at the closing bracket",
          why: '<code>current</code> is reset to an empty string at <code>[</code>, so the text built so far would be lost if only the count were saved. For <code>"x2[ab]"</code> the <code>x</code> would vanish.',
        },
        {
          id: "b",
          text: "The pair <code>[current, count]</code>, the text built so far and the repeat count, so both are there at the matching <code>]</code>",
          why: "Inside the brackets a fresh <code>current</code> is built. At <code>]</code> the pair is popped and the result is <code>before + current.repeat(times)</code>.",
        },
        {
          id: "c",
          text: "The rest of the input, so the loop can decode it later",
          why: "The loop reads the input once from left to right, so there is nothing to defer. Only the state of the unfinished outer level needs to wait.",
        },
        {
          id: "d",
          text: "Nothing, because the bracket only resets <code>count</code>",
          why: "Nesting is the reason for the stack. Without saving the outer state, the closing bracket would not know what text to attach the repeated part to.",
        },
      ],
      answer: "b",
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
