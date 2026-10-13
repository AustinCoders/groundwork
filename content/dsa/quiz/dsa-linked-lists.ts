import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "ll-front-insert",
      chapter: "dsa-linked-lists",
      level: "beginner",
      skill: "recognise",
      pattern: "linked-list",
      section: "what-you-re-giving-up-and-what-you-get-for-it",
      placement: true,
      kind: "single",
      prompt:
        "<p>Which operation is O(1) on a singly linked list that keeps a pointer to its head, but can cost O(n) on an array?</p>",
      choices: [
        {
          id: "a",
          text: "Reading the value at index <code>k</code>.",
          why: "An array reads any index in O(1). A linked list has to walk <code>k</code> nodes from the head, so this favours the array.",
        },
        {
          id: "b",
          text: "Inserting a new value at the front.",
          why: "In a linked list you create a node, point its <code>next</code> at the old head and make it the new head, with no other node touched. In an array every existing element has to shift over by one place, so it can cost O(n).",
        },
        {
          id: "c",
          text: "Searching for a given value.",
          why: "With no order to exploit, both structures have to look at elements one by one. The cost is O(n) for both.",
        },
        {
          id: "d",
          text: "Reading the last value.",
          why: "An array reads <code>arr[arr.length - 1]</code> in O(1). A singly linked list with only a head pointer has to walk the whole list to reach the end.",
        },
      ],
      answer: "b",
    },
    {
      id: "ll-cycle-constant-space",
      chapter: "dsa-linked-lists",
      level: "beginner",
      skill: "recognise",
      pattern: "linked-list",
      section: "cycle-detection-floyd-s-algorithm",
      placement: true,
      kind: "single",
      prompt:
        "<p>You are given the head of a singly linked list and must decide whether it contains a cycle, using only O(1) extra memory. Which approach works?</p>",
      choices: [
        {
          id: "a",
          text: "Walk one pointer forward until it reaches <code>null</code>.",
          why: "In a list with a cycle no node ever points to <code>null</code>, so the walk goes round the loop forever and never answers.",
        },
        {
          id: "b",
          text: "Store every visited node in a <code>Set</code> and stop when one repeats.",
          why: "This finds the cycle correctly, but the set grows with the list, so it needs O(n) extra memory instead of O(1).",
        },
        {
          id: "c",
          text: "Count the nodes first, then compare the count with the number of steps you can take.",
          why: "Counting means walking to the end, and a list with a cycle has no end to reach. The count never finishes.",
        },
        {
          id: "d",
          text: "Move one pointer one step at a time and another two steps at a time. If they ever meet, there is a cycle.",
          why: "Inside a cycle the faster pointer gains one node on the slower one every round, so it must catch it. Without a cycle the fast pointer simply reaches <code>null</code>. Two pointers use O(1) memory.",
        },
      ],
      answer: "d",
    },
    {
      id: "ll-remove-head-dummy",
      chapter: "dsa-linked-lists",
      level: "beginner",
      skill: "recognise",
      pattern: "linked-list",
      section: "the-dummy-node-trick-kills-a-whole-class-of-edge-case-bugs",
      placement: true,
      kind: "single",
      prompt:
        "<p>You must delete every node holding a given value from a singly linked list, and the head itself may hold that value. Which technique removes the special case for the head?</p>",
      choices: [
        {
          id: "a",
          text: "Put a dummy node in front of the head, work from it and return <code>dummy.next</code>.",
          why: "With a dummy node every real node, the head included, has a node before it whose <code>next</code> can be repointed. The head stops being special, and <code>dummy.next</code> is the new head whatever happened.",
        },
        {
          id: "b",
          text: "Start from the last node of the list and delete the matching nodes going backwards.",
          why: "A singly linked list has no pointers backwards, so you cannot walk it from the end.",
        },
        {
          id: "c",
          text: "Turn the list into a doubly linked list first, then delete the matching nodes.",
          why: "Extra <code>prev</code> pointers do not remove the problem. When the head is deleted you still have to update the variable that holds the head, and building the extra links costs a whole pass.",
        },
        {
          id: "d",
          text: "Reverse the list, delete the nodes, and reverse it back.",
          why: "This only moves the problem. The old head becomes the last node, and the new head still needs a special case. It also costs two extra passes.",
        },
      ],
      answer: "a",
    },
    {
      id: "ll-remove-known-node",
      chapter: "dsa-linked-lists",
      level: "beginner",
      skill: "recognise",
      pattern: "linked-list",
      section: "doubly-linked-lists-pay-more-memory-get-backward-traversal-f",
      kind: "single",
      prompt:
        "<p>You are holding a reference to a node in the middle of a list, and you want to remove that node. Which statement is correct?</p>",
      choices: [
        {
          id: "a",
          text: "In a singly linked list it is O(1): set <code>node.next = null</code>.",
          why: "That cuts off everything after the node, which you wanted to keep, and the node before it still points to it. Removing a node normally means repointing its predecessor.",
        },
        {
          id: "b",
          text: "In any linked list it needs an O(n) walk from the head.",
          why: "That is the usual cost in a singly linked list, where you need the predecessor. A doubly linked list stores the predecessor in the node, so no walk is needed.",
        },
        {
          id: "c",
          text: "In a doubly linked list it is O(1): repoint <code>prev.next</code> and <code>next.prev</code>.",
          why: "The chapter's <code>removeNode</code> does exactly this with two assignments and no walk. The price is an extra pointer in every node. This is why caches that need quick removal are often built on doubly linked lists.",
        },
        {
          id: "d",
          text: "In a doubly linked list it is O(n): the neighbours have to be found by searching the list first.",
          why: "Searching is only needed when the node's neighbours are not known. Every doubly linked node already holds both of them.",
        },
      ],
      answer: "c",
    },
    {
      id: "ll-reverse-trace",
      chapter: "dsa-linked-lists",
      level: "beginner",
      skill: "trace",
      pattern: "linked-list",
      section: "reversal-the-pattern-that-trips-people-up-live",
      kind: "single",
      prompt:
        "<p>The chapter's <code>reverseList</code> runs on <code>4 → 7 → 1 → 9 → null</code>. The loop body has run twice. What do <code>prev</code> and <code>curr</code> point to?</p>",
      choices: [
        {
          id: "a",
          text: "<code>prev</code> is <code>4 → null</code>, and <code>curr</code> is the node 7.",
          why: "That is the state after only one pass. A second pass flips the 7 as well, so <code>prev</code> moves on to it.",
        },
        {
          id: "b",
          text: "<code>prev</code> is <code>1 → 7 → 4 → null</code>, and <code>curr</code> is the node 9.",
          why: "That is the state after three passes. Only two nodes have been flipped so far.",
        },
        {
          id: "c",
          text: "<code>prev</code> is <code>7 → 4 → null</code>, and <code>curr</code> is the node 1, which still leads <code>1 → 9 → null</code>.",
          why: "Pass one flips 4 to point at <code>null</code>. Pass two flips 7 to point at 4. The rest of the list, <code>1 → 9 → null</code>, is still waiting, and <code>curr</code> points at its first node.",
        },
        {
          id: "d",
          text: "<code>prev</code> is <code>7 → 4 → null</code>, and <code>curr</code> is <code>null</code>, because the rest of the list was cut off.",
          why: "Nothing is cut off, because each pass saves <code>curr.next</code> in <code>next</code> before overwriting it. That saved pointer is what lets <code>curr</code> move on to the node 1.",
        },
      ],
      answer: "c",
    },
    {
      id: "ll-lost-the-rest",
      chapter: "dsa-linked-lists",
      level: "beginner",
      skill: "edge-case",
      pattern: "linked-list",
      section: "reversal-the-pattern-that-trips-people-up-live",
      kind: "single",
      prompt:
        "<p>A teammate swaps two lines inside the loop of <code>reverseList</code>, so the loop body reads as below. What does it return for <code>1 → 2 → 3 → null</code>?</p><pre><code>curr.next = prev;\nconst next = curr.next;\nprev = curr;\ncurr = next;</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>3 → 2 → 1 → null</code>, the same as before.",
          why: "The order of those two lines matters. Once <code>curr.next</code> has been overwritten, reading it gives back the new value, not the old one.",
        },
        {
          id: "b",
          text: "<code>1 → null</code>, and the nodes 2 and 3 are lost.",
          why: "<code>curr.next = prev</code> runs first, so <code>next</code> is read after the pointer was already replaced and equals <code>prev</code>, which is <code>null</code>. <code>curr</code> becomes <code>null</code>, the loop ends after one pass, and nothing points at 2 and 3 any more.",
        },
        {
          id: "c",
          text: "<code>null</code>, because <code>curr</code> becomes <code>null</code> on the first pass.",
          why: "<code>prev = curr</code> still runs before the loop ends, so <code>prev</code> holds the node 1 and that is what is returned.",
        },
        {
          id: "d",
          text: "It never stops, because <code>curr</code> never reaches <code>null</code>.",
          why: "<code>curr</code> reaches <code>null</code> straight away, because <code>next</code> is <code>null</code> after the first pass. The loop ends too early, not too late.",
        },
      ],
      answer: "b",
    },
    {
      id: "ll-middle-even",
      chapter: "dsa-linked-lists",
      level: "beginner",
      skill: "trace",
      pattern: "linked-list",
      section: "fast-slow-pointers-find-the-middle-in-one-pass",
      kind: "single",
      prompt:
        "<p>The chapter's <code>findMiddle</code> runs on a list of six nodes holding <code>10, 20, 30, 40, 50, 60</code>. Which value does it return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>30</code>",
          why: "30 is the first of the two middle nodes. <code>slow</code> moves three times here, not two. The loop only stops once <code>fast</code> has run off the end.",
        },
        {
          id: "b",
          text: "<code>35</code>, the average of the two middle values.",
          why: "The function returns a node, not a computed value. It never averages anything.",
        },
        {
          id: "c",
          text: "<code>null</code>, because <code>fast</code> ends at <code>null</code>.",
          why: "The function returns <code>slow</code>, not <code>fast</code>. When <code>fast</code> falls off the end, <code>slow</code> is sitting on a real node.",
        },
        {
          id: "d",
          text: "<code>40</code>",
          why: "<code>fast</code> goes 10, 30, 50 and then to <code>null</code>, which is three moves, and <code>slow</code> goes 10, 20, 30, 40 by the same three moves. For an even length it ends on the second of the two middle nodes.",
        },
      ],
      answer: "d",
    },
    {
      id: "ll-index-walk-loop-cost",
      chapter: "dsa-linked-lists",
      level: "beginner",
      skill: "complexity",
      pattern: "linked-list",
      section: "the-node-and-the-walk",
      kind: "single",
      prompt:
        "<p><code>getAt(head, i)</code> walks <code>i</code> steps from the head and returns that node's value. What does this loop cost for a list of n nodes?</p><pre><code>let total = 0;\nfor (let i = 0; i &lt; n; i++) {\n  total += getAt(head, i);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n²), because call number <code>i</code> walks <code>i</code> steps.",
          why: "The walks take 0 + 1 + 2 + ... + (n - 1) steps in all, which is n(n - 1) / 2, or 499,500 steps for n = 1,000. Reading by index is O(n) on a linked list, and the loop does it n times. One walk along the list would sum the values in O(n).",
        },
        {
          id: "b",
          text: "O(n), because the loop runs n times.",
          why: "That would hold if each <code>getAt</code> took O(1), as an array lookup does. On a linked list each call has to walk from the head.",
        },
        {
          id: "c",
          text: "O(n log n), because the walks get shorter as <code>i</code> grows.",
          why: "The walks get longer as <code>i</code> grows, not shorter, and nothing in the loop halves anything.",
        },
        {
          id: "d",
          text: "O(1) per call, since the head is already known.",
          why: "Knowing the head only gives the starting point. Reaching node <code>i</code> still means following <code>i</code> pointers.",
        },
      ],
      answer: "a",
    },
    {
      id: "ll-nth-from-end-cost",
      chapter: "dsa-linked-lists",
      level: "beginner",
      skill: "complexity",
      pattern: "linked-list",
      section: "nth-from-the-end-the-gap-technique",
      kind: "single",
      prompt:
        "<p>The chapter's <code>removeNthFromEnd(head, n)</code> runs on a list with L nodes. What are its time and extra space?</p>",
      choices: [
        {
          id: "a",
          text: "O(L · n) time, because <code>fast</code> takes <code>n</code> steps for every node <code>slow</code> visits.",
          why: "<code>fast</code> takes its <code>n</code> steps once, to open the gap. After that both pointers move together, one step each, so the gap is never walked again.",
        },
        {
          id: "b",
          text: "O(L) time and O(L) extra space, because the nodes are stored so the end can be counted back from.",
          why: "Nothing is stored. The fixed gap between <code>fast</code> and <code>slow</code> does the counting for you.",
        },
        {
          id: "c",
          text: "O(L) time and O(1) extra space.",
          why: "<code>fast</code> makes about L steps in all, <code>n</code> to open the gap and the rest while both move, and <code>slow</code> makes fewer. That is one pass with a few variables, and the dummy node adds only a single extra node.",
        },
        {
          id: "d",
          text: "O(L²) time, because it must walk to the end and then walk back to the target.",
          why: "A singly linked list cannot be walked backwards, and the technique does not need to. Even a two-pass version, counting the length and then walking to the target, would be O(L).",
        },
      ],
      answer: "c",
    },
    {
      id: "ll-merge-leftover",
      chapter: "dsa-linked-lists",
      level: "beginner",
      skill: "trace",
      pattern: "linked-list",
      section: "merging-two-sorted-lists-the-dummy-node-in-action",
      kind: "single",
      prompt:
        "<p>The chapter's <code>mergeTwoLists</code> merges <code>1 → 5 → 8</code> with <code>2 → 3</code>. After the <code>while</code> loop ends, what is left, and what is the final list?</p>",
      choices: [
        {
          id: "a",
          text: "Both lists are used up, so the last line attaches nothing.",
          why: "The loop stops as soon as either list runs out. Here the second list ends first and <code>5 → 8</code> is still waiting.",
        },
        {
          id: "b",
          text: "<code>5 → 8</code> is left, and it is copied node by node onto the end of the new merged list.",
          why: "Nothing is copied. The leftover nodes are already linked to each other, so one assignment attaches the whole chain, and the merge needs only O(1) extra space.",
        },
        {
          id: "c",
          text: "<code>2 → 3</code> is left, and attaching it to the end gives <code>1 → 5 → 8 → 2 → 3</code>.",
          why: "The nodes 2 and 3 are taken during the loop, because each is smaller than 5. The loop only ends once the second list is empty, so <code>l2</code> has nothing left.",
        },
        {
          id: "d",
          text: "<code>5 → 8</code> is left, and <code>tail.next = l1</code> attaches it, giving <code>1 → 2 → 3 → 5 → 8</code>.",
          why: "The loop takes 1, then 2 and 3, because 2 and 3 are both smaller than 5. When the second list is empty the loop ends, <code>l1</code> still points at 5, and <code>tail.next = l1 !== null ? l1 : l2</code> attaches the whole remaining chain.",
        },
      ],
      answer: "d",
    },
    {
      id: "ll-shortened-loop-test",
      chapter: "dsa-linked-lists",
      level: "beginner",
      skill: "edge-case",
      pattern: "linked-list",
      section: "cycle-detection-floyd-s-algorithm",
      kind: "multi",
      prompt:
        "<p>A teammate shortens the loop test in <code>hasCycle</code> to <code>while (fast.next !== null)</code>, dropping the <code>fast !== null</code> part. None of the lists below has a cycle. Select every list for which the changed function throws a <code>TypeError</code>.</p>",
      choices: [
        {
          id: "a",
          text: "An empty list, where <code>head</code> is <code>null</code>",
          why: "<code>fast</code> starts as <code>null</code>, so reading <code>fast.next</code> throws straight away. The original test checks <code>fast !== null</code> first, which is what protects this case.",
        },
        {
          id: "b",
          text: "A list with one node",
          why: "<code>fast</code> is the only node and its <code>next</code> is <code>null</code>, so the loop test is false and the function returns <code>false</code> without throwing.",
        },
        {
          id: "c",
          text: "A list with two nodes",
          why: "The first pass moves <code>fast</code> two steps, from the first node past the second and on to <code>null</code>. The next test then reads <code>null.next</code>, which throws.",
        },
        {
          id: "d",
          text: "A list with three nodes",
          why: "<code>fast</code> jumps from the first node to the third, whose <code>next</code> is <code>null</code>, so the loop ends cleanly. An odd length lands <code>fast</code> on the last node.",
        },
        {
          id: "e",
          text: "A list with five nodes",
          why: "<code>fast</code> goes first, third, fifth, and the fifth node's <code>next</code> is <code>null</code>, so the loop ends cleanly. Only even lengths and the empty list send <code>fast</code> past the end.",
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "ll-order-remove-nth",
      chapter: "dsa-linked-lists",
      level: "beginner",
      skill: "trace",
      pattern: "linked-list",
      section: "nth-from-the-end-the-gap-technique",
      kind: "order",
      prompt: "<p>Put the steps of the chapter's <code>removeNthFromEnd(head, n)</code> in the order they happen.</p>",
      items: [
        {
          id: "dummy",
          text: "Create <code>dummy</code> pointing at <code>head</code>, and start both <code>fast</code> and <code>slow</code> at <code>dummy</code>.",
        },
        { id: "gap", text: "Move <code>fast</code> forward <code>n</code> steps to open the gap." },
        {
          id: "walk",
          text: "Move <code>fast</code> and <code>slow</code> together until <code>fast.next</code> is <code>null</code>.",
        },
        { id: "skip", text: "Set <code>slow.next = slow.next.next</code> to skip the target node." },
        { id: "return", text: "Return <code>dummy.next</code>." },
      ],
      why: "The gap has to be opened before the two pointers walk together, because the fixed distance between them is what finds the target. When <code>fast</code> reaches the last node, <code>slow</code> is right before the node to remove, so the skip comes after the walk. Returning <code>dummy.next</code> comes last, because it is correct even when the head was the node removed.",
    },
  ],
  pattern: {
    pattern: "linked-list",
    chapter: "dsa-linked-lists",
    signals: [
      "The input is the head of a chain of nodes that each point to the next one.",
      "The task is to reverse, merge, insert or remove nodes by repointing links.",
      "The middle, a cycle or the nth node from the end is needed without knowing the length, which points to fast and slow pointers.",
      "The head itself might be removed or replaced, which a dummy node handles.",
      "Quick inserts and deletes are wanted and reading by index is not.",
    ],
    template:
      "<pre><code>const dummy = new ListNode(0, head);\nlet prev = dummy;\nlet curr = head;\nwhile (curr !== null) {\n  const next = curr.next;\n  prev = curr;\n  curr = next;\n}\nreturn dummy.next;</code></pre>",
    time: "O(n)",
    space: "O(1)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
