import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "sim-nested-iterator-plan",
      chapter: "dsa-design-simulation",
      level: "intermediate",
      skill: "recognise",
      pattern: "design",
      section: "iterators-hand-out-one-value-at-a-time",
      placement: true,
      kind: "single",
      prompt:
        "<p>Design <code>hasNext()</code> and <code>next()</code> over a nested list of integers such as <code>[[1, 1], 2, [1, 1]]</code> or <code>[[], [[]]]</code>, nested to any depth. The values must not be copied into an array, and <code>hasNext()</code> must be right for every input. Which plan works?</p>",
      choices: [
        {
          id: "a",
          text: "Flatten everything into an array in the constructor, then keep one index into that array and read it on each call.",
          why: "The answers are right for every input, including <code>[[], [[]]]</code>. But the whole list is copied before the first value is asked for, which is exactly what the problem rules out.",
        },
        {
          id: "b",
          text: "Keep one index into the outer list. On each call, look at the item at that index and, if it is a list, start reading it from its first item.",
          why: "The position inside the inner list is thrown away on every call, so the first integer of an inner list would be returned again and again.",
        },
        {
          id: "c",
          text: "A stack of (list, index) frames; <code>hasNext()</code> pops finished lists and steps into inner ones until it reaches an integer.",
          why: "A stack of frames is a path through the nesting. Doing the stepping in <code>hasNext()</code> lets it say no for <code>[[], [[]]]</code>, and a second call finds the stack already pointing at an integer and changes nothing. Memory is the nesting depth.",
        },
        {
          id: "d",
          text: "Keep the same stack, but let <code>next()</code> do the stepping and let <code>hasNext()</code> return whether the top frame still has items.",
          why: "For <code>[[]]</code> the top frame still has an item, the empty inner list, so <code>hasNext()</code> says <code>true</code> and <code>next()</code> then has no integer to return.",
        },
      ],
      answer: "c",
    },
    {
      id: "sim-versioned-lookup",
      chapter: "dsa-design-simulation",
      level: "intermediate",
      skill: "recognise",
      pattern: "design",
      section: "snapshot-array-store-changes-not-copies",
      placement: true,
      kind: "single",
      prompt:
        "<p>A <code>SnapshotArray</code> offers <code>set(index, value)</code>, <code>snap()</code> and <code>get(index, snapId)</code>. Many snapshots are expected, and only a few entries change between two of them. Which design fits?</p>",
      choices: [
        {
          id: "a",
          text: "Store one array and a log of every <code>set</code>; <code>get</code> replays the log from the start up to the snapshot.",
          why: "It gives the right values, but a <code>get</code> costs as much as the number of sets so far, where a sorted list per index can answer by binary search.",
        },
        {
          id: "b",
          text: "For each index keep an ascending list of (snapshot id, value) pairs; <code>get</code> binary searches for the last pair at or before the id.",
          why: "Only entries that were set are stored, so <code>snap()</code> costs nothing extra. The ids in each list are sorted because snapshots are taken in order, which is what makes the binary search legal.",
        },
        {
          id: "c",
          text: "Copy the whole array in <code>snap()</code> and keep every copy in a list indexed by the snapshot id.",
          why: "It is correct, and each <code>snap()</code> then costs time and memory proportional to the whole length, even when one entry changed.",
        },
        {
          id: "d",
          text: "For each snapshot keep a <code>Map</code> of the entries changed since the previous one; <code>get</code> looks only in that snapshot's <code>Map</code>.",
          why: "An index that did not change between two snapshots is missing from the later one, though it still holds an older value. <code>get</code> would answer 0 for it.",
        },
      ],
      answer: "b",
    },
    {
      id: "sim-recent-from-many",
      chapter: "dsa-design-simulation",
      level: "intermediate",
      skill: "recognise",
      pattern: "design",
      section: "news-feed-merge-k-sorted-streams-with-a-heap",
      placement: true,
      kind: "single",
      prompt:
        "<p>Each account's posts are stored in the order they were made. For a user who follows f accounts, return the ten most recent posts among those accounts, newest first. The accounts have many posts each. Which plan does the least work?</p>",
      choices: [
        {
          id: "a",
          text: "Collect every post of every followed account into one array, sort it by time, newest first, and take the first ten.",
          why: "It is correct, and it sorts all P posts to return ten of them, which costs O(P log P).",
        },
        {
          id: "b",
          text: "Take the last ten posts of each account, put them all in one array, sort that array by time and keep ten.",
          why: "The overall top ten must be among each account's top ten, so this is correct. It still sorts about 10 times f posts, which is more work than a heap that only touches the posts it returns.",
        },
        {
          id: "c",
          text: "Merge the accounts two at a time, like the last stage of merge sort, until one sorted list remains, then take its first ten.",
          why: "Merging complete lists reads every post, so the work grows with P, however few results are wanted.",
        },
        {
          id: "d",
          text: "Put each account's newest post in a max-heap by time; pop one, push that account's previous post, and repeat ten times.",
          why: "Each account's list is already sorted, so the heap only ever holds one candidate per account. Ten pops need ten pushes at most, and older posts are never read.",
        },
      ],
      answer: "d",
    },
    {
      id: "sim-line-counters",
      chapter: "dsa-design-simulation",
      level: "intermediate",
      skill: "recognise",
      pattern: "design",
      section: "tic-tac-toe-count-the-line-don-t-scan-it",
      kind: "single",
      prompt:
        "<p>On an n by n Tic-Tac-Toe board, <code>move(row, col, player)</code> must report in O(1) whether this move completes a line. What should the game keep?</p>",
      choices: [
        {
          id: "a",
          text: "One signed counter per line (+1 and -1 for the two players); a counter reaching n in absolute value is a win.",
          why: "A line has n cells and each mark moves its number by one, so only n marks of the same player can reach +n or -n. A move touches at most four numbers.",
        },
        {
          id: "b",
          text: "The full board, scanning the row, the column and the diagonals of each new mark after every move.",
          why: "It is correct, but each move walks up to n cells, so it is O(n) per move and the board itself takes n squared cells.",
        },
        {
          id: "c",
          text: "One counter per row and one per column to catch row and column wins, and nothing extra for the diagonals.",
          why: "Rows and columns are then checked in O(1), but a win along a diagonal is never reported.",
        },
        {
          id: "d",
          text: "A single count of the moves made so far, declaring a win as soon as that count reaches n, whoever made the moves.",
          why: "n marks anywhere on the board say nothing about whether they lie on one line.",
        },
      ],
      answer: "a",
    },
    {
      id: "sim-feed-cost",
      chapter: "dsa-design-simulation",
      level: "intermediate",
      skill: "complexity",
      pattern: "design",
      section: "news-feed-merge-k-sorted-streams-with-a-heap",
      kind: "single",
      prompt:
        "<p><code>getNewsFeed</code> collects the newest post of each of f sources, builds a heap from them in one pass, and then pops and refills it until K posts are out. What does one call cost?</p>",
      choices: [
        {
          id: "a",
          text: "O(f log f + K)",
          why: "This charges each of the K results a constant, but every pop and push moves an entry through a heap of f entries, which costs O(log f). Building the heap in one pass does not cost f log f either.",
        },
        {
          id: "b",
          text: "O(K)",
          why: "The call has to look at every source once to find its newest post, so f appears in the cost whatever K is.",
        },
        {
          id: "c",
          text: "O(f + K log f)",
          why: "Looking at the f sources and heapifying them takes O(f). Each of the K results is one pop and at most one push, which is O(log f) each.",
        },
        {
          id: "d",
          text: "O(P log P) for P posts in total",
          why: "That is the cost of sorting every post, which the heap avoids: older posts that never reach the top are never read.",
        },
      ],
      answer: "c",
    },
    {
      id: "sim-back-cost",
      chapter: "dsa-design-simulation",
      level: "intermediate",
      skill: "complexity",
      pattern: "design",
      section: "browser-history-an-array-with-a-pointer-or-two-stacks",
      kind: "single",
      prompt:
        "<p>Compare <code>back(steps)</code> in two browser histories: an array with a pointer, and two stacks with a current page. What does one call cost in each?</p>",
      choices: [
        {
          id: "a",
          text: "O(steps) for both",
          why: "The pointer version moves with one assignment, clamped to the first page, however many steps are asked for.",
        },
        {
          id: "b",
          text: "O(1) for both",
          why: "Two stacks move one page per step, popping from one stack and pushing onto the other, so the cost grows with the steps taken.",
        },
        {
          id: "c",
          text: "O(n) for the array and pointer, because it copies the pages, and O(1) for the stacks",
          why: "<code>back</code> copies nothing in the array version, and it is the stacks that pay for each step.",
        },
        {
          id: "d",
          text: "O(1) for the array and pointer, O(steps) for the two stacks",
          why: "The pointer is changed once with <code>Math.max(0, current - steps)</code>. The stacks must carry each page across, up to the size of the back stack.",
        },
      ],
      answer: "d",
    },
    {
      id: "sim-snake-trace",
      chapter: "dsa-design-simulation",
      level: "intermediate",
      skill: "trace",
      pattern: "design",
      section: "snake-a-queue-for-order-and-a-set-for-lookup",
      kind: "single",
      prompt:
        '<p>A <code>SnakeGame(2, 2, [[0, 1], [1, 1], [1, 0]])</code>, written as the chapter writes it, receives the moves <code>"R"</code>, <code>"D"</code>, <code>"L"</code>, <code>"U"</code> in this order. What do the four calls return?</p>',
      choices: [
        {
          id: "a",
          text: "0, 1, 2, 3",
          why: "The first move already lands on the first food, at row 0, column 1, so the first call returns 1.",
        },
        {
          id: "b",
          text: "1, 2, 3, 3",
          why: "The first three moves each land on the food that is next and grow the snake to cells (0,0), (0,1), (1,1), (1,0). The fourth move goes back to (0,0), the tail's cell. No food is left, so the tail moves away in the same turn, the move is legal, and the score stays 3.",
        },
        {
          id: "c",
          text: "1, 2, 3, -1",
          why: "That is what a version returns if it checks the body before removing the tail. The chapter's class frees the tail's cell first when it is not eating.",
        },
        {
          id: "d",
          text: "1, 2, 3, 4",
          why: "The score counts foods eaten. The list holds three, so the score cannot reach 4.",
        },
      ],
      answer: "b",
    },
    {
      id: "sim-editor-trace",
      chapter: "dsa-design-simulation",
      level: "intermediate",
      skill: "trace",
      pattern: "design",
      section: "text-editor-two-stacks-around-the-cursor",
      kind: "single",
      prompt:
        '<p>With the two-stack editor, an empty text receives <code>addText("abcde")</code>, <code>cursorLeft(2)</code>, <code>addText("XY")</code>, <code>deleteText(1)</code> and then <code>cursorRight(5)</code>. What does the last call return?</p>',
      choices: [
        {
          id: "a",
          text: '"abcXde"',
          why: "After the first three calls the text is abcXY|de. Deleting one character removes the Y, leaving abcX|de. Moving right by 5 only travels the 2 characters that exist and ends after the last one, and the answer is the text left of the cursor.",
        },
        {
          id: "b",
          text: '"de"',
          why: "A cursor move returns the characters to the <em>left</em> of the cursor, not the ones it moved over.",
        },
        {
          id: "c",
          text: '"abcXYde"',
          why: "<code>deleteText(1)</code> removes the character just left of the cursor, which is Y, so Y is not in the final text.",
        },
        {
          id: "d",
          text: '"abcX"',
          why: "That is the text left of the cursor before the final move. The cursor then moves right across d and e, and both now sit left of it.",
        },
      ],
      answer: "a",
    },
    {
      id: "sim-falsy-cache",
      chapter: "dsa-design-simulation",
      level: "intermediate",
      skill: "edge-case",
      pattern: "design",
      section: "peeking-iterator-one-cached-value",
      kind: "single",
      prompt:
        "<p>A peeking wrapper stores the peeked value directly in <code>this.cached</code> and tests <code>if (!this.cached)</code> to see whether the slot is empty. The wrapped iterator yields <code>0, 7, 8</code>. What goes wrong?</p>",
      choices: [
        {
          id: "a",
          text: "Nothing goes wrong: 0 is a legal value, so the empty test still behaves as intended.",
          why: "<code>!0</code> is <code>true</code>, so a cached 0 looks like an empty slot.",
        },
        {
          id: "b",
          text: "<code>peek()</code> returns 0, but a second <code>peek()</code> pulls again and returns 7, and 0 is lost.",
          why: "The cached 0 passes the test for an empty slot, so the wrapper pulls another value over it. A box such as <code>{ value }</code> makes the question about the box, not the value.",
        },
        {
          id: "c",
          text: "The first <code>peek()</code> throws, because 0 is not accepted as a cached value.",
          why: "Nothing throws. The first <code>peek()</code> pulls 0 and returns it correctly; the damage is done on the next call.",
        },
        {
          id: "d",
          text: "The values come out correctly, at the price of one extra call to the wrapped iterator.",
          why: "The extra pull overwrites the cached 0, which <code>next()</code> never returns, so the output is missing the 0.",
        },
      ],
      answer: "b",
    },
    {
      id: "sim-logger-refusal",
      chapter: "dsa-design-simulation",
      level: "intermediate",
      skill: "edge-case",
      pattern: "design",
      section: "logs-and-counters-logger-moving-average-underground",
      kind: "single",
      prompt:
        '<p>A logger blocks a message for 10 seconds after it prints. <code>"x"</code> printed at time 1, and a call at time 3 was refused. Suppose the refusal also stored <code>3 + 10</code> as the time <code>"x"</code> may print again. What does <code>shouldPrint(11, "x")</code> return, and is it right?</p>',
      choices: [
        {
          id: "a",
          text: "<code>true</code>, which is right because time 11 is after the refused call at time 3.",
          why: "With the refusal's time stored the deadline is 13, so 11 is still blocked and the call returns <code>false</code>.",
        },
        {
          id: "b",
          text: "<code>false</code>, which is right because the message was refused once at time 3.",
          why: "A refusal is not a print. The message was last printed at time 1, and 11 is exactly 10 seconds after it.",
        },
        {
          id: "c",
          text: "<code>true</code>, which is right because a refused call stores nothing for the message.",
          why: "In this variant the refusal does store a time, 13, so the result changes.",
        },
        {
          id: "d",
          text: "<code>false</code>, which is wrong: x last printed at time 1, and 11 is 10 seconds later.",
          why: "The stored deadline is 13, so the call is refused. Under the usual rule it should print at 11, so storing the refusal turns a legal print into a refusal.",
        },
      ],
      answer: "d",
    },
    {
      id: "sim-route-key",
      chapter: "dsa-design-simulation",
      level: "intermediate",
      skill: "edge-case",
      pattern: "design",
      section: "logs-and-counters-logger-moving-average-underground",
      kind: "single",
      prompt:
        '<p>An underground system keys each route by <code>start + "," + end</code> in a <code>Map</code>, and station names can contain any characters. Which two different routes share a key?</p>',
      choices: [
        {
          id: "a",
          text: '"a,b" to "c", and "a" to "b,c"',
          why: 'Both keys are the string <code>"a,b,c"</code>, so the two routes would share one total. Serializing the pair with <code>JSON.stringify</code> keeps them apart.',
        },
        {
          id: "b",
          text: '"A" to "B", and "B" to "A"',
          why: 'The keys are <code>"A,B"</code> and <code>"B,A"</code>, so the direction of a route is kept.',
        },
        {
          id: "c",
          text: '"a" to "b", and "a" to "bb"',
          why: 'The keys are <code>"a,b"</code> and <code>"a,bb"</code>, which differ.',
        },
        {
          id: "d",
          text: '"x" to "y", and "x" to "y"',
          why: "These are the same route, not two different ones, and sharing a key is exactly what the totals need.",
        },
      ],
      answer: "a",
    },
    {
      id: "sim-editor-facts",
      chapter: "dsa-design-simulation",
      level: "intermediate",
      skill: "recognise",
      pattern: "design",
      section: "text-editor-two-stacks-around-the-cursor",
      kind: "multi",
      prompt: "<p>Which statements about the two-stack text editor are true? Select all that apply.</p>",
      choices: [
        {
          id: "a",
          text: "Moving the cursor left by k pops up to k characters from the left stack and pushes them onto the right stack.",
          why: "Each character crosses the cursor, so it leaves the stack of characters before it and joins the stack of characters after it.",
        },
        {
          id: "b",
          text: "The cost of <code>cursorLeft(k)</code> grows with the total length of the text.",
          why: "It moves at most k characters and reads at most 10, whatever the length of the text.",
        },
        {
          id: "c",
          text: "The left stack read from bottom to top, then the right stack read from top to bottom, is the whole text.",
          why: "The nearest character to the cursor is on top of each stack, so the right stack holds its half of the text backwards.",
        },
        {
          id: "d",
          text: "<code>cursorLeft(k)</code> returns the characters it moved over.",
          why: "It returns up to 10 characters to the left of the cursor after the move, which may include none of the characters it moved over.",
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "sim-feed-order",
      chapter: "dsa-design-simulation",
      level: "intermediate",
      skill: "trace",
      pattern: "design",
      section: "news-feed-merge-k-sorted-streams-with-a-heap",
      kind: "order",
      prompt:
        "<p>Put the steps of <code>getNewsFeed(userId)</code> in order, from the first thing the call does to the last.</p>",
      items: [
        { id: "sources", text: "Build the set of sources: the accounts the user follows, plus the user." },
        { id: "heap", text: "Put the newest post of each source into a max-heap ordered by time." },
        { id: "pop", text: "Pop the newest post and append its id to the feed." },
        { id: "push", text: "Push the previous post of that same account, if it has one." },
        { id: "stop", text: "Stop when the feed holds the limit or the heap is empty." },
      ],
      why: "The sources must exist before the heap can be filled, and the heap must hold the newest post of each before anything is popped. Each round then pops the newest post, and only afterwards pushes the same account's previous post, so the heap again holds one candidate per account. The stopping test closes the round.",
    },
  ],
  pattern: {
    pattern: "design",
    chapter: "dsa-design-simulation",
    signals: [
      "The prompt gives a class with named methods and a cost for each, and no input array to process.",
      "It asks for an iterator, a game, a history or a counter, where each call must be cheaper than rescanning the state.",
      "A second structure is needed to answer a question the first one cannot: membership, order, the newest, or a value as of a version.",
      "The state can be described by a sentence that stays true after every call, such as two structures holding the same items.",
    ],
    template:
      "<pre><code>class Design {\n  constructor() { this.order = new Queue(); this.members = new Set(); }\n  operation(item) { this.order.enqueue(item); this.members.add(item); }\n}</code></pre>",
    time: "O(1) per call for counters, queues and maps; O(log n) with a heap or a binary search",
    space: "O(the state kept): the window, the nesting depth, or the changes recorded",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
