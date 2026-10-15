import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "des-lru-composition",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "recognise",
      pattern: "design",
      section: "these-questions-are-graded-on-the-choice-not-the-code",
      placement: true,
      kind: "single",
      prompt:
        "<p>Design a cache with <code>get(key)</code> and <code>put(key, value)</code>, both O(1), that evicts the least recently used entry when it is full. Which combination of structures meets that contract?</p>",
      choices: [
        {
          id: "a",
          text: "An array of entries ordered by recency, with the used entry spliced to the end on every access.",
          why: "Finding an entry by its key means scanning the array, which is O(n), and splicing shifts the entries after it, which can also be O(n). The array gives order but cannot find a key quickly.",
        },
        {
          id: "b",
          text: "A hash map from key to node, together with a doubly linked list ordered by recency.",
          why: "The map finds the node for a key in O(1) on average, and because the list is doubly linked the node can be unlinked and moved to the front in O(1) without a walk. The map finds, the list orders, and eviction takes the node next to the tail.",
        },
        {
          id: "c",
          text: "A min-heap ordered by last-use time, together with a hash map from key to value.",
          why: "The heap can name the oldest entry, but every use changes an entry's time, so its place in the heap must change. That costs O(log n) at best, and a plain heap has to search for the entry first, which is O(n). Eviction costs O(log n) too, so neither operation is O(1).",
        },
        {
          id: "d",
          text: "A balanced binary search tree keyed by the cache key.",
          why: "Lookups cost O(log n) rather than O(1), and the order of keys says nothing about which one was used least recently.",
        },
      ],
      answer: "b",
    },
    {
      id: "des-min-stack-structure",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "recognise",
      pattern: "design",
      section: "min-stack-o-1-getmin-with-an-auxiliary-stack",
      placement: true,
      kind: "single",
      prompt:
        "<p>Design a stack with <code>push</code>, <code>pop</code>, <code>top</code> and <code>getMin</code>, all O(1). Which structure meets that contract?</p>",
      choices: [
        {
          id: "a",
          text: "A single variable <code>min</code> that every <code>push</code> updates.",
          why: "This works until the smallest value is popped. The variable then holds a value that is no longer on the stack, and the previous minimum was never recorded, so it cannot be restored.",
        },
        {
          id: "b",
          text: "A min-heap that holds every element, with each push and pop applied to it as well.",
          why: "The heap's top is the minimum in O(1), but a push costs O(log n) in the worst case, and removing the popped element from inside a heap is O(log n) at best. The contract asks for O(1) on every operation.",
        },
        {
          id: "c",
          text: "The elements sorted on every push, so that the smallest sits at one end.",
          why: "Keeping the elements sorted costs more than O(1) per push, and it destroys the push order that <code>top</code> and <code>pop</code> rely on.",
        },
        {
          id: "d",
          text: "A second stack in which each entry holds the smallest value at or below that position.",
          why: "Pops happen in exactly the reverse order of pushes, so the minimum at each depth can be recorded at push time. Popping both stacks together restores the previous minimum for free, and every operation stays O(1).",
        },
      ],
      answer: "d",
    },
    {
      id: "des-lru-bugs",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "edge-case",
      pattern: "design",
      section: "lru-cache-the-canonical-composition",
      kind: "multi",
      prompt:
        "<p>Each change below is made on its own to the chapter's LRU cache, which keeps a Map from key to node and a doubly linked list. Select every change that makes the cache give wrong results.</p>",
      choices: [
        {
          id: "a",
          text: "<code>get</code> returns the value but does not move the node to the front.",
          why: "A read counts as a use. Without the move the list stays in insertion order, so an entry that was just read can be evicted before one that was not.",
        },
        {
          id: "b",
          text: "Nodes do not store their key, and eviction only unlinks the node at the back of the list.",
          why: "Without the key there is nothing to delete from the map. The evicted key stays in the map, so <code>get</code> can still return its value instead of -1, and the map's size never shrinks.",
        },
        {
          id: "c",
          text: "<code>put</code> on a key that is already in a full cache evicts the back node before it updates the value.",
          why: "An update does not add an entry, so nothing should be evicted. This version throws away an entry that should stay, and when the updated key is itself the least recently used it throws away that very key. The bug only shows when the cache is exactly full.",
        },
        {
          id: "d",
          text: "The sentinel head and tail nodes are replaced by head and tail pointers that are null when the list is empty, with every empty case handled correctly.",
          why: "Sentinels only remove null checks. A version that handles every empty case behaves the same, with more code to get right.",
        },
        {
          id: "e",
          text: "Recency is kept by deleting a key from a JavaScript <code>Map</code> and setting it again, and the oldest key is the first one in iteration order.",
          why: "A <code>Map</code> iterates in insertion order, so deleting and re-setting a key moves it to the back, and the first key is the least recently used. This is a language shortcut for the same contract.",
        },
      ],
      answers: ["a", "b", "c"],
    },
    {
      id: "des-max-stack-boundary",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "recognise",
      pattern: "design",
      section: "min-stack-o-1-getmin-with-an-auxiliary-stack",
      kind: "single",
      prompt:
        "<p>A max stack with <code>push</code>, <code>pop</code>, <code>top</code> and <code>peekMax</code> uses a second stack of running maximums. The interface now gains <code>popMax()</code>, which removes the largest element from anywhere in the stack. Which statement is true?</p>",
      choices: [
        {
          id: "a",
          text: "The running-maximum stack still works, because <code>popMax</code> only has to pop its own top entry.",
          why: "The maximum may sit in the middle of the main stack. After it is removed, the running maximums recorded above it were computed with that element included and are now stale.",
        },
        {
          id: "b",
          text: "A single max-heap on its own can answer <code>top</code>, <code>pop</code> and <code>popMax</code>, with no help from any other structure.",
          why: "A heap orders elements by value only. It does not know which element was pushed last, so it cannot answer <code>top</code> or <code>pop</code> without a second structure that tracks push order.",
        },
        {
          id: "c",
          text: "It needs removal from the middle, such as a linked list with an ordered map from value to nodes, and <code>popMax</code> costs O(log n).",
          why: "The auxiliary-stack trick works only because removals are LIFO. Removing an arbitrary element needs a handle on its node, and an ordered map from value to nodes finds the maximum in O(log n).",
        },
        {
          id: "d",
          text: "Sorting the stack after every push makes <code>popMax</code> O(1) and leaves the other operations untouched and just as fast.",
          why: "A sort costs more than O(1) per push, and it reorders the elements, so <code>top</code> and <code>pop</code> would no longer return the most recent one.",
        },
      ],
      answer: "c",
    },
    {
      id: "des-fixed-window-burst",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "edge-case",
      pattern: "design",
      section: "rate-limiter-a-sliding-window-counter",
      kind: "single",
      prompt:
        "<p>A limiter allows 100 requests per client in each fixed one-minute window, and its counter resets to 0 at every minute boundary. At most how many requests can one client get accepted within any single 2-second span?</p>",
      choices: [
        {
          id: "a",
          text: "100, because that is the limit and a short span cannot beat it.",
          why: "The limit applies to each window separately. A 2-second span can cross a window boundary, and the counter resets there.",
        },
        {
          id: "b",
          text: "150, because only half of the next window's allowance can be used at once.",
          why: "Nothing limits how much of a window's allowance is used in a short time. The full 100 are available at the start of the new window.",
        },
        {
          id: "c",
          text: "200, by sending 100 just before the boundary and 100 just after it.",
          why: "Each window counts on its own, so 100 requests in the last second of one window and 100 in the first second of the next are all accepted. A span of 2 seconds touches at most two windows, so 200 is the most. The sliding-window counter exists to close this gap.",
        },
        {
          id: "d",
          text: "300, because a short span can touch three windows.",
          why: "A window lasts a full minute, so a span of 2 seconds touches at most two of them.",
        },
      ],
      answer: "c",
    },
    {
      id: "des-min-stack-strict",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "edge-case",
      pattern: "design",
      section: "min-stack-o-1-getmin-with-an-auxiliary-stack",
      kind: "single",
      prompt:
        "<p>The space-saving Min Stack is written with a strict comparison. After <code>push(2)</code>, <code>push(2)</code> and <code>pop()</code>, what does <code>getMin()</code> return?</p><pre><code>push(x) {\n  this.main.push(x);\n  if (!this.mins.length || x &lt; this.mins[this.mins.length - 1]) this.mins.push(x);\n}\n\npop() {\n  const x = this.main.pop();\n  if (x === this.mins[this.mins.length - 1]) this.mins.pop();\n  return x;\n}\n\ngetMin() { return this.mins[this.mins.length - 1]; }</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>undefined</code>, with a 2 still on the stack.",
          why: "The second 2 is not smaller than the current minimum, so it never reaches <code>mins</code>. The first <code>pop</code> sees that 2 equals the top of <code>mins</code> and removes the only record of it. <code>mins</code> is empty while <code>main</code> still holds a 2. The fix is <code>&lt;=</code>.",
        },
        {
          id: "b",
          text: "<code>2</code>, because a 2 is still on the stack.",
          why: "That is the answer the stack should give, and the version with <code>&lt;=</code> does. With <code>&lt;</code> the record of that 2 has already been removed.",
        },
        {
          id: "c",
          text: "<code>Infinity</code>, because the stack has no minimum recorded.",
          why: "Nothing in this code produces <code>Infinity</code>. Reading an index that is out of range on an array gives <code>undefined</code>.",
        },
        {
          id: "d",
          text: "It throws a <code>TypeError</code>, because <code>mins</code> is empty.",
          why: "Indexing an empty array with <code>-1</code> does not throw in JavaScript. It silently gives <code>undefined</code>, which makes the bug harder to notice.",
        },
      ],
      answer: "a",
    },
    {
      id: "des-lfu-trace",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "trace",
      pattern: "design",
      section: "lfu-cache-the-same-trick-one-level-deeper",
      kind: "single",
      prompt:
        '<p>Using the chapter\'s <code>LFUCache</code> with capacity 2, run these calls in order. Which key does the last call, <code>put(4, "d")</code>, evict?</p><pre><code>const cache = new LFUCache(2);\ncache.put(1, "a");\ncache.put(2, "b");\ncache.get(1);\ncache.put(3, "c");\ncache.get(2);\ncache.get(3);\ncache.put(4, "d");</code></pre>',
      choices: [
        {
          id: "a",
          text: "Key 2",
          why: 'Key 2 was already evicted by <code>put(3, "c")</code>, because it had been used once and key 1 twice. By the time of the last call it is gone, and <code>get(2)</code> returned -1.',
        },
        {
          id: "b",
          text: "Key 3",
          why: "Key 3 has the same count as key 1, but it is the newer of the two. Ties are broken by evicting the least recently used key, which is the older one.",
        },
        {
          id: "c",
          text: "None, because the cache still has room.",
          why: "The cache holds keys 1 and 3, and its capacity is 2, so it is full and must evict to make room for key 4.",
        },
        {
          id: "d",
          text: "Key 1",
          why: "After <code>get(1)</code> key 1 has a count of 2. Key 3 reaches a count of 2 through <code>get(3)</code>. The two tie for the lowest count, and key 1 entered that bucket first, so it is the least recently used of them and it is evicted.",
        },
      ],
      answer: "d",
    },
    {
      id: "des-limiter-trace",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "trace",
      pattern: "design",
      section: "rate-limiter-a-sliding-window-counter",
      kind: "single",
      prompt:
        "<p>Using the chapter's <code>SlidingWindowRateLimiter</code> with <code>limit = 4</code> and <code>windowMs = 10</code>, one user calls <code>allow</code> with <code>now</code> equal to 1, 2, 3, 4, 5, 12, 13 and 14, in that order. Which results does it return?</p>",
      choices: [
        {
          id: "a",
          text: "true, true, true, true, false, true, true, false",
          why: "The first four calls fill the window, and the fifth is refused. At 12 the previous window's count of 4 is weighted by 0.8, an estimate of 3.2, so the call is allowed. At 13 the estimate is 4 × 0.7 + 1 = 3.8, allowed. At 14 it is 4 × 0.6 + 2 = 4.4, which reaches the limit, so it is refused.",
        },
        {
          id: "b",
          text: "true, true, true, true, false, false, false, false",
          why: "This treats the previous window as fully counted until it expires. The sliding-window counter weights it by how much of it still overlaps the trailing window, so at 12 only 80% of it counts.",
        },
        {
          id: "c",
          text: "true, true, true, true, false, true, true, true",
          why: "This ignores the previous window altogether. At 14 the estimate is 4 × 0.6 + 2 = 4.4, which is at least the limit, so that call is refused.",
        },
        {
          id: "d",
          text: "true, true, true, true, false, true, false, false",
          why: "At 13 the estimate is 4 × 0.7 + 1 = 3.8, which is below the limit of 4, so that call is allowed. It is only at 14 that the estimate, 4.4, reaches the limit.",
        },
      ],
      answer: "a",
    },
    {
      id: "des-order-lru-get",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "trace",
      pattern: "design",
      section: "lru-cache-the-canonical-composition",
      kind: "order",
      prompt:
        "<p>Put the steps of <code>get(key)</code> in the chapter's LRU cache, for a key that is present, in the order they run. Start with the lookup in the map and end with returning the value.</p>",
      items: [
        { id: "lookup", text: "Look the key up in the map to get its node." },
        { id: "unlink", text: "Unlink the node by pointing its neighbours at each other." },
        { id: "front", text: "Insert the node right after the head sentinel, making it the most recently used." },
        { id: "return", text: "Return <code>node.val</code>." },
      ],
      why: "The map lookup comes first because it is the only way to reach the node. The node has to be unlinked before it is inserted at the front, since inserting overwrites its own <code>prev</code> and <code>next</code> pointers, and unlinking afterwards would follow the new pointers and corrupt the list. The value is returned last, once the node's position is updated.",
    },
    {
      id: "des-min-stack-space",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "complexity",
      pattern: "design",
      section: "min-stack-o-1-getmin-with-an-auxiliary-stack",
      kind: "single",
      prompt:
        "<p>The space-saving Min Stack pushes onto <code>mins</code> only when <code>x &lt;= mins[mins.length - 1]</code>. After n pushes and no pops, what is the worst-case extra space used by <code>mins</code>?</p>",
      choices: [
        {
          id: "a",
          text: "O(1), because only new minimums are stored.",
          why: "Pushing n, n - 1, ..., 1 makes every value a new minimum, so every value is stored. The saving is real only for some inputs.",
        },
        {
          id: "b",
          text: "O(n), for example when values are pushed in decreasing order.",
          why: "In the worst case every push is stored: a strictly decreasing sequence makes each value a new minimum, and a run of equal values is stored because of the <code>&lt;=</code>. That is the same bound as the unoptimised version, though many inputs use far less.",
        },
        {
          id: "c",
          text: "O(log n), because new minimums become rarer as the stack grows.",
          why: "Nothing makes new minimums rarer. The input decides how many there are, and a decreasing input has one at every push.",
        },
        {
          id: "d",
          text: "O(n) only when the values are distinct, because equal values add nothing.",
          why: "With <code>&lt;=</code> equal values are stored too. Pushing the same value n times also gives n entries, which is what keeps <code>getMin</code> correct after a pop.",
        },
      ],
      answer: "b",
    },
    {
      id: "des-hit-counter-shape",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "complexity",
      pattern: "design",
      section: "hit-counter-designing-for-a-stream",
      kind: "single",
      prompt:
        "<p>The chapter's <code>BucketedHitCounter</code> keeps one slot per second of an n-second window. In the worst case, what do <code>hit</code>, <code>getHits</code> and the memory cost, however many hits arrive?</p>",
      choices: [
        {
          id: "a",
          text: "<code>hit</code> O(1), <code>getHits</code> O(1), space O(n).",
          why: "The memory bound is right, but <code>getHits</code> loops over all n slots and checks each stamp, so it costs O(n), not O(1).",
        },
        {
          id: "b",
          text: "<code>hit</code> O(1), <code>getHits</code> and space both proportional to the hits inside the window.",
          why: "That describes the queue of timestamps. The buckets keep one count per second, so neither the loop nor the memory depends on how many hits arrive.",
        },
        {
          id: "c",
          text: "<code>hit</code> O(log n), <code>getHits</code> O(n), space O(n).",
          why: "<code>hit</code> computes one index with <code>%</code> and updates one slot. There is no search, so it is O(1).",
        },
        {
          id: "d",
          text: "<code>hit</code> O(1), <code>getHits</code> O(n), space O(n).",
          why: "<code>hit</code> touches one slot. <code>getHits</code> loops over the n slots and skips stale ones without clearing them. The two arrays have n slots each, however many hits arrive, which is why this version is the one to ship under heavy load.",
        },
      ],
      answer: "d",
    },
    {
      id: "des-limiter-memory",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "complexity",
      pattern: "design",
      section: "rate-limiter-a-sliding-window-counter",
      kind: "single",
      prompt:
        "<p>A limiter allows L requests per window for each user. Approach 1 keeps a deque with the timestamp of every accepted request still inside the window. Approach 2 is the chapter's sliding-window counter. In the worst case, how much memory does each need for one user, in terms of L?</p>",
      choices: [
        {
          id: "a",
          text: "The deque needs O(L), and the counter needs O(1).",
          why: "The deque holds up to L timestamps, because it stores only accepted requests and at most L fit in a window. The counter keeps two integers and a window start per user, however large L is. The price of the counter is that its count is an approximation.",
        },
        {
          id: "b",
          text: "Both need O(1), because the deque can be trimmed to a constant size.",
          why: "An exact deque must remember every accepted request in the window to know when each one expires, so it can hold L entries. Trimming it below that loses the exact count.",
        },
        {
          id: "c",
          text: "Both need O(L), because both must remember the requests.",
          why: "The counter does not remember individual requests. It stores a count for the current window and one for the previous window, which is O(1).",
        },
        {
          id: "d",
          text: "The deque needs O(1), and the counter needs O(L).",
          why: "This swaps the two. The deque is the one that grows with the limit, and the counter is the one with constant memory.",
        },
      ],
      answer: "a",
    },
    {
      id: "des-allone-splice",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "recognise",
      pattern: "design",
      section: "all-o-1-lfu-s-buckets-with-the-list-made-explicit",
      kind: "single",
      prompt:
        "<p>In the All O(1) structure, the buckets form a doubly linked list sorted by count. <code>inc(key)</code> is called for a key that sits in the bucket with count 3. What does it do?</p>",
      choices: [
        {
          id: "a",
          text: "It binary searches the list for the bucket with count 4.",
          why: "A linked list cannot be binary searched, and no search is needed: a count changes by exactly 1, so the target can only be the next bucket or a new one right after the old bucket.",
        },
        {
          id: "b",
          text: "It always creates a new bucket with count 4 at the end of the list and moves the key into it, without looking at the other buckets or their counts.",
          why: "Placing a bucket at the end breaks the sorted order whenever other keys have a count above 4, and a bucket for count 4 may already exist, which would leave two buckets for one count.",
        },
        {
          id: "c",
          text: "It moves the key to the next bucket if that has count 4, otherwise it splices in a new bucket there, and unlinks an emptied one.",
          why: "Counts change by exactly 1, so the key's new place in the sorted order is always adjacent to its old one. Checking one neighbour and splicing is O(1), and removing an empty bucket keeps both ends of the list meaningful.",
        },
        {
          id: "d",
          text: "It increments a counter in the map and re-sorts the buckets.",
          why: "Re-sorting costs more than O(1), and the buckets are already in order before the call, so nothing needs sorting.",
        },
      ],
      answer: "c",
    },
    {
      id: "des-timemap-trace",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "trace",
      pattern: "design",
      section: "time-based-key-value-store-a-sorted-history-per-key",
      kind: "single",
      prompt:
        '<p>A key has versions written at times 2, 5 and 9 with values <code>"a"</code>, <code>"b"</code> and <code>"c"</code>. The store\'s <code>get</code> finds the first version written after the query time <code>t</code> and returns the one before it, or the empty string when there is none. What does <code>get(key, 5)</code> return, and what does <code>get(key, 1)</code> return?</p>',
      choices: [
        {
          id: "a",
          text: '"b" and ""',
          why: 'For time 5, the first version after 5 is at index 2 (time 9), so the answer is index 1: "b". For time 1, the first version after it is at index 0, so nothing precedes it and the answer is the empty string.',
        },
        {
          id: "b",
          text: '"b" and "a"',
          why: 'A query at time 1 is before every version, so the first version after it is the very first one and there is nothing before that. The answer is the empty string, not "a".',
        },
        {
          id: "c",
          text: '"a" and ""',
          why: 'The version written at time 5 is not after the query time 5, because the comparison is <code>&lt;=</code>. The first version after 5 is the one at time 9, so the answer is the one before it: "b", not "a".',
        },
        {
          id: "d",
          text: '"c" and ""',
          why: 'The version at time 9 is later than the query time 5, so it had not been written yet. The value in force at time 5 is "b".',
        },
      ],
      answer: "a",
    },
    {
      id: "des-random-last",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "edge-case",
      pattern: "design",
      section: "insert-delete-getrandom-in-o-1-a-dense-array-with-a-map-of-p",
      kind: "single",
      prompt:
        "<p>A random set keeps <code>values</code> (a dense array) and <code>slot</code> (a map from value to index). Its <code>remove</code> runs these lines in this order. The set holds <code>1</code> and <code>2</code>, in that order, and <code>remove(2)</code> is called. Which state is left?</p><pre><code>slot.delete(value);\nvalues[hole] = last;\nslot.set(last, hole);\nvalues.pop();</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>values</code> is <code>[1]</code> and <code>slot</code> maps 1 to 0, which is correct.",
          why: "The value 2 is also the last element, so <code>slot.set(last, hole)</code> puts the entry for 2 back after it was deleted. The map still contains 2.",
        },
        {
          id: "b",
          text: "It throws, because the map entry is deleted before it is read.",
          why: "Nothing here throws: the last line of the group writes to the map, the others use values already in variables, and reading a missing key from a <code>Map</code> gives <code>undefined</code> rather than an error.",
        },
        {
          id: "c",
          text: "<code>values</code> is <code>[1, 2]</code>, because the pop removes nothing.",
          why: "The pop removes the last element of the array whichever order the other lines run in, so the array ends with a single element.",
        },
        {
          id: "d",
          text: "<code>values</code> is <code>[1]</code>, but <code>slot</code> still maps 2 to 1.",
          why: "Because 2 is the last element, <code>last</code> is 2 and <code>hole</code> is 1. The delete runs first, so the set that follows resurrects the entry for 2. The array is right and the map is stale, so a later <code>insert(2)</code> answers that it is already there.",
        },
      ],
      answer: "d",
    },
    {
      id: "des-median-halves",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "trace",
      pattern: "design",
      section: "median-finder-two-heaps-that-meet-in-the-middle",
      kind: "single",
      prompt:
        "<p>Using the chapter's two-heap median finder (every number in the lower half is at most every number in the upper half, and the lower half is the same size or one larger), numbers 5, 2, 8 and 1 are added in that order. What are the two halves, and what does <code>findMedian()</code> return?</p>",
      choices: [
        {
          id: "a",
          text: "Lower {1, 2, 5}, upper {8}, median 5",
          why: "That splits three against one, which breaks the rule that the halves differ by at most one element. With four numbers the halves hold two each.",
        },
        {
          id: "b",
          text: "Lower {1, 2}, upper {5, 8}, median 3.5",
          why: "The four numbers sorted are 1, 2, 5, 8. The lower half holds the two smallest, the upper half the two largest, and with an even count the median is the mean of the two tops: (2 + 5) / 2 = 3.5.",
        },
        {
          id: "c",
          text: "Lower {5, 8}, upper {1, 2}, median 3.5, with the two halves swapped",
          why: "The lower half must hold the smaller numbers. Here every number in the lower half is larger than every number in the upper half, which is the opposite of the invariant.",
        },
        {
          id: "d",
          text: "Lower {1, 2}, upper {5, 8}, median 2",
          why: "The halves are right, but with an even count the median is the mean of the largest of the lower half and the smallest of the upper half, (2 + 5) / 2 = 3.5, not the top of the lower half alone.",
        },
      ],
      answer: "b",
    },
    {
      id: "des-hashmap-grow",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "trace",
      pattern: "design",
      section: "design-hashmap-buckets-collisions-and-resizing",
      kind: "single",
      prompt:
        "<p>The chapter's <code>MyHashMap</code> starts with 4 buckets and doubles them when <code>size &gt; 0.75 * buckets.length</code>, checked after each insertion of a new key. Which insertion of a new key first triggers the doubling?</p>",
      choices: [
        {
          id: "a",
          text: "The 3rd, because 3 out of 4 is a load factor of 0.75.",
          why: "The test is a strict greater-than. A size of 3 gives 3 &gt; 3, which is false, so the third insertion does not grow the map.",
        },
        {
          id: "b",
          text: "The 4th, because 4 &gt; 3.",
          why: "After the fourth new key the size is 4 and the threshold is 0.75 × 4 = 3, so 4 &gt; 3 holds and the buckets double to 8. Every pair is then re-indexed against the new length.",
        },
        {
          id: "c",
          text: "The 5th, because only a full table needs to grow.",
          why: "Chaining does not need a full table to work, but chains get long as the load factor rises. The map grows earlier, at 0.75, to keep each bucket short.",
        },
        {
          id: "d",
          text: "None of them, because chaining never needs to grow.",
          why: "Chaining keeps working without growth, but each bucket's list gets longer, so lookups drift from O(1) toward O(n). Growing keeps the expected chain length bounded.",
        },
      ],
      answer: "b",
    },
    {
      id: "des-hashmap-worst",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "complexity",
      pattern: "design",
      section: "design-hashmap-buckets-collisions-and-resizing",
      kind: "single",
      prompt:
        "<p>A hash map with separate chaining holds n keys, and the hash function sends every key to the same bucket. What is the time of one <code>get</code>?</p>",
      choices: [
        {
          id: "a",
          text: "O(1), because the bucket index is computed directly.",
          why: "Computing the index is O(1), but the bucket then holds all n pairs and the lookup scans them one by one.",
        },
        {
          id: "b",
          text: "O(log n), because the bucket's list can be searched quickly.",
          why: "The bucket is a plain list of pairs with no order, so it can only be scanned from one end, which is linear.",
        },
        {
          id: "c",
          text: "O(n) only while the map has not yet resized, and O(1) afterwards.",
          why: "Resizing changes the number of buckets but not the hash function's output. If every key still hashes alike, doubling the array changes nothing about where they land relative to each other.",
        },
        {
          id: "d",
          text: "O(n): one bucket holds every pair, and the scan is linear.",
          why: "All n pairs share one list, so a lookup of a key near the end compares against most of them. The expected O(1) cost depends on the hash spreading keys evenly.",
        },
      ],
      answer: "d",
    },
    {
      id: "des-codec-which",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "recognise",
      pattern: "design",
      section: "encode-and-decode-strings-make-the-encoding-say-where-each-p",
      kind: "single",
      prompt:
        "<p>You must encode a list of strings into one string and decode it back, where each string can contain any character at all, including the empty string. Which encoding is unambiguous?</p>",
      choices: [
        {
          id: "a",
          text: "Write each string as its length, a separator, and then exactly that many characters.",
          why: "The decoder reads the length, then takes that many characters without inspecting them, so nothing inside a string can be mistaken for a boundary. The empty list and a list with one empty string also stay distinct.",
        },
        {
          id: "b",
          text: "Join the strings with a rarely used control character.",
          why: "The strings may contain any character, including that one. A rarer delimiter makes the failure rarer, not impossible.",
        },
        {
          id: "c",
          text: "Write the number of strings first, and then the strings joined with a delimiter between them.",
          why: "The count says how many pieces to expect, but a piece that contains the delimiter still splits into extra pieces, so the boundaries remain ambiguous.",
        },
        {
          id: "d",
          text: "Join the strings with a comma and split on commas.",
          why: 'A string such as <code>"a,b"</code> would decode as two strings, and the empty list and a list holding one empty string both encode to the empty text.',
        },
      ],
      answer: "a",
    },
    {
      id: "des-bounded-median-cost",
      chapter: "dsa-design-problems",
      level: "advanced",
      skill: "complexity",
      pattern: "design",
      section: "median-finder-two-heaps-that-meet-in-the-middle",
      kind: "single",
      prompt:
        "<p>Every number in a stream is an integer from 0 to 100. A finder keeps 101 counters and a running total, and <code>findMedian</code> walks the counters from 0 upward until the running sum reaches the middle rank. After n numbers have arrived, what does one <code>findMedian</code> cost?</p>",
      choices: [
        {
          id: "a",
          text: "O(n), because every number that has arrived has to be looked at.",
          why: "It never looks at the numbers themselves, only at the 101 counters, so the walk is at most 101 steps regardless of n.",
        },
        {
          id: "b",
          text: "O(log n), as with two heaps.",
          why: "The two-heap design has O(1) reads and O(log n) inserts. This counting design has no heap and its read is a bounded walk.",
        },
        {
          id: "c",
          text: "O(1), because the walk is at most 101 steps whatever n is.",
          why: "The number of counters is fixed by the value range, not by n, so the work is bounded by a constant. Inserting a number is O(1) as well.",
        },
        {
          id: "d",
          text: "O(n log n), because the numbers are sorted first.",
          why: "Nothing is sorted: counting already puts the values in order, because the counters are indexed by value.",
        },
      ],
      answer: "c",
    },
  ],
  pattern: {
    pattern: "design",
    chapter: "dsa-design-problems",
    signals: [
      "The prompt starts with the word design and gives a class with named methods and a required complexity for each.",
      "Two operations pull in opposite directions, such as fast lookup by key and a maintained order of use.",
      "Something must be evicted, expired or capped, such as the oldest entry, the least used key, or hits older than a time window.",
      "A minimum or maximum must be read in O(1) from a structure whose removals follow a fixed order.",
    ],
    template:
      "<pre><code>class Cache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.nodeByKey = new Map();\n    this.order = new DoublyLinkedList();\n  }\n  get(key) {\n    const node = this.nodeByKey.get(key);\n    if (!node) return -1;\n    this.order.moveToFront(node);\n    return node.value;\n  }\n}</code></pre>",
    time: "O(1) per operation for the cache and min-stack designs",
    space: "O(capacity)",
    styles: ["phone-screen", "onsite"],
  },
};
