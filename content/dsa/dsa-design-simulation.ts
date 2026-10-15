import type { Chapter } from "../types";

export const dsaDesignSimulation: Chapter = {
  id: "dsa-design-simulation",
  num: "I20",
  title: "Design and simulation problems",
  short: "Design & simulation",
  levels: ["intermediate"],
  prerequisites: ["dsa-hashing", "dsa-linked-lists", "dsa-heaps-priority-queues"],
  practice: [
    "ex-flatten-nested-array",
    "ex-lazy-flatten-generator",
    "ex-nested-list-iterator",
    "ex-peeking-iterator",
    "ex-zigzag-iterator",
    "ex-bst-iterator",
    "ex-tic-tac-toe",
    "ex-snake-game",
    "ex-snapshot-array",
    "ex-browser-history",
    "ex-text-editor",
    "ex-design-news-feed",
    "ex-logger-rate-limiter",
    "ex-moving-average-from-data-stream",
    "ex-underground-system",
    "ex-parking-lot-lowest-slot",
  ],
  ready: true,
  subtitle:
    "Turn a paragraph of requirements into a small machine: state, operations, costs, and the sentences that stay true.",
  body: `<h3>The method: operations, targets, structures, invariants</h3>
<p>
  A design question hands you a class and a list of method names. There is
  no clever algorithm hiding inside. What is graded is whether you can turn a
  paragraph of English into a small, correct machine: which data it keeps,
  what each method does to that data, and what stays true between calls.
  The <a href="/dsa/dsa-design-problems">design problems chapter</a> covers
  the classic caches, counters and stores, and its opening teaches the
  habit of writing the operation table first. This chapter uses the same
  habit on a different family: iterators, games and simulations, versioned
  data, and small services with logs and feeds. Every problem here is
  solved the same way, in four steps.
</p>
<table>
  <tr><th>Step</th><th>What you do</th><th>Why it matters</th></tr>
  <tr><td>1. Clarify the operations</td><td>Say each method back with its inputs, its return value and the cases the statement is silent on: an empty input, a repeated call, a move after the game ended.</td><td>Most wrong answers in this family solve a slightly different problem than the one asked.</td></tr>
  <tr><td>2. Write the table with targets</td><td>One row per method: the cost a naive version pays, and the cost you will aim for.</td><td>The gap between the two columns is the whole problem. If there is no gap, the naive version is the answer.</td></tr>
  <tr><td>3. Choose a structure per operation</td><td>For each row, name the structure that gives the target cost. Then see whether one structure can serve several rows.</td><td>Hash lookup, order of arrival, "newest first" and "smallest first" each have a standard owner. You are matching, not inventing.</td></tr>
  <tr><td>4. State the invariants</td><td>Write down what must be true after every call: "the set holds exactly the cells of the queue", "the pointer is a valid index".</td><td>Every method is then a short proof that it keeps the invariants. Bugs show up as a violated sentence, not a mystery.</td></tr>
</table>
<p>
  The invariant step is the one candidates skip, and it is the one that
  turns a pile of fields into a design. An invariant is a sentence about the
  fields that is true when the constructor finishes and is true again when
  every method returns, whatever order the calls came in. Two such sentences
  appear again and again below: <em>"these two structures describe the same
  set of things"</em> (a queue and a set of the same cells) and <em>"this
  counter equals what a full recount would give"</em> (a running sum equal
  to the sum of the window). If you can say them out loud, you can also
  check them in code, and a section near the end does exactly that.
</p>
<p>
  The table below shows steps 2 and 3 for most of the problems in this chapter. The
  naive column is not a deliberately weak baseline: it is what you would write first, and it
  is also what you will use later as a reference to test the fast version.
</p>
<table>
  <tr><th>Problem</th><th>Naive version costs</th><th>Target</th><th>Structure that gets there</th></tr>
  <tr><td>Nested list iterator</td><td>O(N) memory to flatten everything up front</td><td>O(depth) memory, values produced on demand</td><td>A stack of (list, index) frames</td></tr>
  <tr><td>Tic-Tac-Toe</td><td>O(n) scan of row, column and diagonals per move</td><td>O(1) per move</td><td>One signed counter per line</td></tr>
  <tr><td>Snake</td><td>O(length) scan of the body for a collision</td><td>O(1) per move</td><td>A queue for the order, a Set for membership</td></tr>
  <tr><td>Snapshot array</td><td>O(n) copy per snapshot</td><td>O(1) set and snap, O(log v) get</td><td>Per index, a list of (snapshot id, value) and a binary search</td></tr>
  <tr><td>Browser history</td><td>Rebuilding the list on every visit</td><td>O(1) back and forward</td><td>An array with a pointer, or two stacks</td></tr>
  <tr><td>News feed</td><td>Sort every post of every followed user</td><td>O(f + K log f) for the K newest of f sources</td><td>A heap merging the sorted streams</td></tr>
  <tr><td>Logger, moving average, route averages</td><td>Storing and rescanning every event</td><td>O(1) per call</td><td>A Map of next-allowed times, a ring buffer with a sum, a Map of (sum, count)</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "Before I write anything: the
  methods are these four, with these return values. The naive version costs
  this much per call, and the requirement is this much, so I am looking for
  a structure that removes the scan. I will keep a queue for the order and a
  set for the lookup, and the invariant is that after every move they hold the
  same cells."
</div>

<h3>Iterators: hand out one value at a time</h3>
<p>
  An iterator is an object that produces a sequence one value at a time and
  remembers where it is. The interview version asks for two methods:
  <code>hasNext()</code>, which says whether another value exists, and
  <code>next()</code>, which returns it and moves on. JavaScript's built-in
  protocol is the same idea with a different spelling: an object with a
  <code>next()</code> method that returns <code>{ value, done }</code>, and
  an <em>iterable</em> is any object with a <code>[Symbol.iterator]()</code>
  method that returns one. <code>for...of</code>, spread and destructuring
  all consume that protocol.
</p>
<p>
  The easy answer to "iterate over this structure" is to copy every value
  into an array in the constructor and walk the array. It is correct, and it
  usually loses the round, for two reasons. It spends O(N) memory and time
  before the first value is asked for, and it cannot work on a source that
  is huge or has no end. The better answer is <b>lazy</b>: keep only enough
  state to find the next value, and do the work when it is asked for. The
  design question then becomes: what is the smallest state that remembers
  my place?
</p>

<h4>Flatten a nested list with a stack of frames</h4>
<p>
  The input is a list whose items are either integers or lists of the same
  kind, to any depth: <code>[[1, 1], 2, [1, 1]]</code>. The iterator must
  return <code>1, 1, 2, 1, 1</code>. A place in this structure is a path:
  "third item of the outer list, second item of the list inside it". A path
  is exactly what a stack holds, so keep a stack with one <b>frame</b> per
  list you are currently inside. A frame is the list and the index of its
  next unread item.
</p>
<p>
  Where should the work happen? Look at what each method must answer.
  <code>hasNext()</code> must be able to say "no" when the remaining items
  are all empty lists, as in <code>[[], [[]]]</code>, so it cannot just
  check whether the top frame has items left. It has to dig down until it
  finds a real integer or runs out of frames. So let <code>hasNext()</code>
  do the digging and leave the stack pointing at the next integer; then
  <code>next()</code> only has to call it and read the value. This also
  makes <code>hasNext()</code> safe to call twice in a row, because the
  second call finds the stack already pointing at an integer and changes
  nothing.
</p>
<pre><code>class NestedIterator {
  constructor(nestedList) {
    this.stack = [{ list: nestedList, index: 0 }]; <span class="c">// one frame per list we are inside</span>
  }

  hasNext() {
    while (this.stack.length &gt; 0) {
      const top = this.stack[this.stack.length - 1];
      if (top.index === top.list.length) {
        this.stack.pop(); <span class="c">// this list is used up: go back to its parent</span>
      } else if (Array.isArray(top.list[top.index])) {
        this.stack.push({ list: top.list[top.index], index: 0 }); <span class="c">// step into the inner list</span>
        top.index++; <span class="c">// the parent resumes after it</span>
      } else {
        return true; <span class="c">// the top frame points at a plain value</span>
      }
    }
    return false;
  }

  next() {
    if (!this.hasNext()) throw new Error("no more values");
    const top = this.stack[this.stack.length - 1];
    return top.list[top.index++];
  }
}</code></pre>
<h4>Dry run: [[1, 1], 2, [1, 1]]</h4>
<p>
  Each frame is written as <code>index/length</code>, outermost first.
</p>
<table>
  <tr><th>Call</th><th>What the loop does</th><th>Stack afterwards</th><th>Result</th></tr>
  <tr><td>start</td><td>constructor pushes the outer list</td><td>0/3</td><td></td></tr>
  <tr><td>hasNext()</td><td>item 0 is a list: push it, move the parent on</td><td>1/3, 0/2</td><td>true</td></tr>
  <tr><td>next()</td><td>reads the 1 under the top frame</td><td>1/3, 1/2</td><td>1</td></tr>
  <tr><td>next()</td><td>hasNext sees an integer at once</td><td>1/3, 2/2</td><td>1</td></tr>
  <tr><td>next()</td><td>hasNext pops the used-up frame, then finds the integer 2 in the outer list</td><td>2/3</td><td>2</td></tr>
  <tr><td>next()</td><td>item 2 is a list: push it, then read</td><td>3/3, 1/2</td><td>1</td></tr>
  <tr><td>next()</td><td>reads the last integer</td><td>3/3, 2/2</td><td>1</td></tr>
  <tr><td>hasNext()</td><td>pops the inner frame, then the outer one</td><td>empty</td><td>false</td></tr>
</table>
<p class="sub">
  The stack never holds more frames than the nesting depth, so memory is
  O(depth), and the nested list itself is not copied. Over a whole
  iteration each list is pushed once and popped once, and each integer is
  read once, so the total work is O(N + L) for N integers and L lists. One
  single <code>hasNext()</code> call can cost O(L) when it has to step over
  a long run of empty lists, which is why the honest bound is amortized.
</p>
<div class="warn">
  <span class="ttl">⚠ Four ways this loses the round</span>
  <b>1. Doing the digging in <code>next()</code> only.</b> Then
  <code>hasNext()</code> says <code>true</code> for <code>[[]]</code>, and
  <code>next()</code> has nothing to return. <b>2. Forgetting to advance the
  parent when you step into a child.</b> The parent frame then points at
  the list again after the child is done, and the iterator loops forever.
  <b>3. Testing <code>if (item)</code> instead of
  <code>Array.isArray(item)</code>.</b> The integer 0 is falsy, and so is
  anything you decide to treat as "no value". <b>4. Flattening in the
  constructor</b> and calling it lazy. The result is right and the memory
  bound is not.
</div>

<h4>The same idea as a generator</h4>
<p>
  JavaScript can write the whole thing without a hand-made stack. A
  <b>generator function</b> (<code>function*</code>) returns an iterator
  whose body runs only when <code>next()</code> is called, and pauses at each
  <code>yield</code>. The language keeps the "where was I" state for you.
  Inside a generator, <code>yield*</code> hands control to another iterable
  until it is finished, which is exactly what flattening needs:
</p>
<pre><code>function* flattenLazy(list) {
  for (const item of list) {
    if (Array.isArray(item)) yield* flattenLazy(item); <span class="c">// hand over to the inner generator</span>
    else yield item;
  }
}</code></pre>
<p>
  <code>[...flattenLazy([[1, 1], 2, [1, 1]])]</code> gives
  <code>[1, 1, 2, 1, 1]</code>. Nothing is computed ahead: asking for two
  values runs the body only as far as the second <code>yield</code>, which
  is why the same shape works on a source that never ends. The price is a
  trade you should be able to name. The state lives in the call stack: in
  Node 24 we nested a list ten thousand levels deep and the generator
  stopped with a <code>RangeError</code>, while the explicit stack read the
  innermost value without trouble. Each value also passes through one
  generator per level of nesting on its way out, where the explicit stack
  reads it directly. A generator is also single-use: once it has been spread, a
  second spread gives an empty array. When an interviewer asks for
  <code>hasNext()</code> and <code>next()</code>, you can still use either
  version, and a small adapter turns the stack version into a real JavaScript
  iterable so that <code>for...of</code> works on it:
</p>
<pre><code>function asJsIterator(iterator) {
  return {
    [Symbol.iterator]() { return this; },
    next() {
      return iterator.hasNext() ? { value: iterator.next(), done: false } : { value: undefined, done: true };
    },
  };
}</code></pre>

<h3>Peeking iterator: one cached value</h3>
<p>
  A <b>peeking iterator</b> wraps any iterator and adds
  <code>peek()</code>, which returns the next value without consuming it.
  The wrapped iterator only goes forward, so to look at a value and still
  deliver it later you must <em>remember</em> it. One slot is enough: the
  invariant is "if the slot is full it holds the next value the wrapper
  must return; if it is empty, the next value is still inside the wrapped
  iterator".
</p>
<pre><code>class PeekingIterator {
  constructor(iterator) {
    this.iterator = iterator;
    this.cached = null; <span class="c">// null, or a box { value } holding the peeked value</span>
  }

  hasNext() {
    return this.cached !== null || this.iterator.hasNext();
  }

  peek() {
    if (this.cached === null) {
      if (!this.iterator.hasNext()) throw new Error("no more values");
      this.cached = { value: this.iterator.next() }; <span class="c">// pull once, remember it</span>
    }
    return this.cached.value;
  }

  next() {
    if (this.cached !== null) {
      const { value } = this.cached;
      this.cached = null; <span class="c">// the lookahead slot is empty again</span>
      return value;
    }
    return this.iterator.next();
  }
}</code></pre>
<h4>Dry run: wrapping an iterator over [4, 5, 6]</h4>
<table>
  <tr><th>Call</th><th>Slot before</th><th>What happens</th><th>Slot after</th><th>Result</th></tr>
  <tr><td>peek()</td><td>empty</td><td>pulls 4 from the inner iterator</td><td>4</td><td>4</td></tr>
  <tr><td>peek()</td><td>4</td><td>nothing is pulled</td><td>4</td><td>4</td></tr>
  <tr><td>next()</td><td>4</td><td>returns the slot and empties it</td><td>empty</td><td>4</td></tr>
  <tr><td>next()</td><td>empty</td><td>delegates to the inner iterator</td><td>empty</td><td>5</td></tr>
  <tr><td>peek()</td><td>empty</td><td>pulls 6</td><td>6</td><td>6</td></tr>
  <tr><td>next()</td><td>6</td><td>returns the slot</td><td>empty</td><td>6</td></tr>
  <tr><td>hasNext()</td><td>empty</td><td>inner iterator is finished</td><td>empty</td><td>false</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ The slot must be a box, not the value</span>
  The tempting version stores the peeked value directly and tests
  <code>if (!this.cached)</code> to ask "is the slot full?". That confuses
  "no value" with a value that is falsy. We ran it over
  <code>[0, 7, 8]</code>: the first <code>peek()</code> returned 0, the
  second returned 7 (it pulled again because 0 looked empty), and
  <code>next()</code> then skipped the 0 altogether. Wrapping the value as
  <code>{ value }</code> makes "is there something cached?" a question about
  the box, whatever the value is. The same care is needed for
  <code>undefined</code> and <code>null</code>. Also remember that
  <code>hasNext()</code> must look at the slot first: when a value has been
  peeked, the wrapped iterator may already be exhausted while the wrapper
  still has a value to give.
</div>
<p>
  The pattern is one slot of lookahead. It is what a parser does when it
  looks at the next token before deciding what to do, and what a merge does
  when it compares the fronts of two inputs. If a problem needs to look
  several values ahead, the slot becomes a small queue.
</p>

<h3>Zigzag iterator: a queue of cursors</h3>
<p>
  Given k lists of different lengths, return their values by taking one from
  each list in turn: for <code>[1, 2, 3]</code>, <code>[4, 5, 6, 7]</code>
  and <code>[8, 9]</code> the order is <code>1, 4, 8, 2, 5, 9, 3, 6,
  7</code>. For two lists you can alternate with a flag. For k lists, whose
  turn it is and which lists are already finished both change as you go. The
  clean model is a <b>queue of cursors</b>. A cursor is a list and the index
  of its next value. Take the cursor at the front, read one value, and if it
  still has values, send it to the back of the line.
</p>
<p>
  The queue is the first structure in this chapter that wants O(1) removal
  from the front, so here is a small one made of linked nodes, with a
  <code>length</code> and a <code>peek</code>. (The
  <a href="/dsa/dsa-stacks-queues">stacks and queues chapter</a> builds a
  queue from two stacks instead, whose dequeue is O(1) amortized.) The
  Snake game and the bounded logger below use it too.
</p>
<pre><code>class Queue {
  constructor() {
    this.head = null; <span class="c">// the oldest node: dequeue takes from here</span>
    this.tail = null; <span class="c">// the newest node: enqueue adds here</span>
    this.length = 0;
  }

  enqueue(value) {
    const node = { value, next: null };
    if (this.tail === null) this.head = node;
    else this.tail.next = node;
    this.tail = node;
    this.length++;
  }

  dequeue() {
    if (this.head === null) throw new Error("the queue is empty");
    const { value } = this.head;
    this.head = this.head.next;
    if (this.head === null) this.tail = null; <span class="c">// it was the last node</span>
    this.length--;
    return value;
  }

  peek() {
    return this.head === null ? undefined : this.head.value;
  }
}</code></pre>
<pre><code>class ZigzagIterator {
  constructor(lists) {
    this.queue = new Queue(); <span class="c">// the lists that still have values, in turn order</span>
    for (const list of lists) {
      if (list.length &gt; 0) this.queue.enqueue({ list, index: 0 });
    }
  }

  hasNext() {
    return this.queue.length &gt; 0;
  }

  next() {
    if (!this.hasNext()) throw new Error("no more values");
    const cursor = this.queue.dequeue();
    const value = cursor.list[cursor.index++];
    if (cursor.index &lt; cursor.list.length) this.queue.enqueue(cursor); <span class="c">// back of the line</span>
    return value;
  }
}</code></pre>
<h4>Dry run: [1, 2, 3], [4, 5, 6, 7], [8, 9]</h4>
<p>
  A cursor is written <code>L1@0</code>: the list that starts with 1, at
  index 0. The queue is shown front first.
</p>
<table>
  <tr><th>next() returns</th><th>Queue afterwards</th></tr>
  <tr><td>(start)</td><td>L1@0, L4@0, L8@0</td></tr>
  <tr><td>1</td><td>L4@0, L8@0, L1@1</td></tr>
  <tr><td>4</td><td>L8@0, L1@1, L4@1</td></tr>
  <tr><td>8</td><td>L1@1, L4@1, L8@1</td></tr>
  <tr><td>2</td><td>L4@1, L8@1, L1@2</td></tr>
  <tr><td>5</td><td>L8@1, L1@2, L4@2</td></tr>
  <tr><td>9</td><td>L1@2, L4@2 (the list of 8 and 9 is finished and is not re-queued)</td></tr>
  <tr><td>3</td><td>L4@2</td></tr>
  <tr><td>6</td><td>L4@3</td></tr>
  <tr><td>7</td><td>(empty)</td></tr>
</table>
<p class="sub">
  Each call is O(1). The invariant is "the queue holds exactly the lists
  that still have values, in the order of their turns", and that is why
  finished lists need no special case: they are simply not put back. Memory
  is O(k). If the statement says the lists arrive as iterators instead of
  arrays, the cursor becomes a <code>PeekingIterator</code>, and the check
  "does this list have more?" becomes <code>hasNext()</code>.
</p>

<h3>Tic-Tac-Toe: count the line, don't scan it</h3>
<p>
  Design a game on an n by n board. <code>move(row, col, player)</code>
  places a mark for player 1 or player 2 and returns 0 if nobody has won,
  or the number of the player who just completed a full row, a full column
  or a full diagonal. The statement promises that every move is on an empty
  cell and that no move comes after a win.
</p>
<p>
  The first version stores the board and, after each move, scans the row,
  the column and, when the cell is on one, the two diagonals. That is O(n)
  per move. It is right, and it repeats work: if the row already held two
  marks of this player and one more arrives, you walked all three cells just
  to learn what a count of 2 could have told you. The question to ask is
  what the win check <em>needs</em> to know about a line. Only whether all n
  of its cells belong to one player. So do not keep the cells; keep one
  number per line.
</p>
<p>
  Give player 1 the value +1 and player 2 the value -1, and let every line
  (n rows, n columns and the two diagonals) hold the sum of the values of
  its marks. A line has n cells, so its sum can only reach +n if all n cells
  are player 1's, and only reach -n if all n are player 2's. Any mix pulls
  the total back toward zero. A move touches at most four counters: its row,
  its column, the main diagonal when <code>row === col</code>, and the
  anti-diagonal when <code>row + col === n - 1</code>. After updating them,
  check whether any of those counters has reached &plusmn;n.
</p>
<pre><code>class TicTacToe {
  constructor(n) {
    this.n = n;
    this.rows = new Array(n).fill(0); <span class="c">// +1 per cell of player 1, -1 per cell of player 2</span>
    this.cols = new Array(n).fill(0);
    this.diagonal = 0; <span class="c">// cells with row === col</span>
    this.antiDiagonal = 0; <span class="c">// cells with row + col === n - 1</span>
  }

  move(row, col, player) {
    const delta = player === 1 ? 1 : -1;
    this.rows[row] += delta;
    this.cols[col] += delta;
    if (row === col) this.diagonal += delta;
    if (row + col === this.n - 1) this.antiDiagonal += delta; <span class="c">// the centre of an odd board hits both</span>
    const complete = (total) =&gt; Math.abs(total) === this.n;
    if (complete(this.rows[row]) || complete(this.cols[col]) || complete(this.diagonal) || complete(this.antiDiagonal)) {
      return player;
    }
    return 0;
  }
}</code></pre>
<h4>Dry run: n = 3, player 1 takes the main diagonal</h4>
<table>
  <tr><th>Move</th><th>rows</th><th>cols</th><th>diagonal</th><th>anti-diagonal</th><th>Returns</th></tr>
  <tr><td>(0,0) by 1</td><td>[1, 0, 0]</td><td>[1, 0, 0]</td><td>1</td><td>0</td><td>0</td></tr>
  <tr><td>(0,1) by 2</td><td>[0, 0, 0]</td><td>[1, -1, 0]</td><td>1</td><td>0</td><td>0</td></tr>
  <tr><td>(1,1) by 1</td><td>[0, 1, 0]</td><td>[1, 0, 0]</td><td>2</td><td>1</td><td>0</td></tr>
  <tr><td>(0,2) by 2</td><td>[-1, 1, 0]</td><td>[1, 0, -1]</td><td>2</td><td>0</td><td>0</td></tr>
  <tr><td>(2,2) by 1</td><td>[-1, 1, 1]</td><td>[1, 0, 0]</td><td>3</td><td>0</td><td>1</td></tr>
</table>
<p class="sub">
  Read the second row: player 2's mark in row 0 cancels player 1's, so the
  row counter returns to 0, and a mixed line can never reach 3. The centre
  cell (1,1) added to both the diagonal and the anti-diagonal, because it
  lies on both. The last move pushes the diagonal to 3, and player 1 wins.
  Each move is O(1) and the memory is O(n), against the O(n²) of the board
  itself. This works because each cell is used at most once. If the
  statement allowed overwriting a cell or repeating a move, a counter would
  count the same cell twice, and you would have to keep the board or a Set
  of used cells.
</p>
<div class="warn">
  <span class="ttl">⚠ The centre and the 1-by-1 board</span>
  On an odd board the centre is on both diagonals; if you write
  <code>else if</code> instead of two separate <code>if</code>s, the second
  diagonal misses it. On a 1 by 1 board the single move wins at once, and
  the code above handles that with no special case, because every counter
  reaches 1 on the first move. When you test, include a board where the
  winning line is the anti-diagonal, since the main diagonal is the one
  people check first.
</div>

<h3>Snake: a queue for order and a Set for lookup</h3>
<p>
  <code>new SnakeGame(width, height, food)</code> starts a snake of length 1
  at the top-left cell, <code>(0, 0)</code>. <code>food</code> is a list of
  <code>[row, col]</code> pairs; only the first uneaten one is on the board,
  and the next appears when it is eaten. <code>move(direction)</code> takes
  <code>"U"</code>, <code>"D"</code>, <code>"L"</code> or <code>"R"</code>
  and returns the score, which is the number of foods eaten, or -1 if the
  game is over. The game ends when the head leaves the board or runs into
  the snake's body.
</p>
<p>
  Write the operation table. Each move must do three things: add a new
  head, remove the old tail unless food was eaten, and check whether the new
  head hits the body. The body is a sequence with one end that grows and
  the other end that shrinks, which is a queue: the tail is the front, the
  head is the back. A queue is bad at one thing, though: "is this cell in
  the queue?" costs O(length) to answer. A hash set is the opposite. So keep
  both, and make the invariant explicit: <b>the set holds exactly the cells
  of the queue</b>. Every move changes both in the same breath.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="A grid three cells wide and two high with a snake of three cells, and next to it a queue of the same three cells with the tail at the front and the head at the back">
    <g class="rough">
      <rect class="box" x="30" y="60" width="64" height="64" rx="4" />
      <rect class="boxg" x="94" y="60" width="64" height="64" rx="4" />
      <rect class="box" x="158" y="60" width="64" height="64" rx="4" />
      <rect class="box" x="30" y="124" width="64" height="64" rx="4" />
      <rect class="box" x="94" y="124" width="64" height="64" rx="4" />
      <rect class="boxr" x="158" y="124" width="64" height="64" rx="4" />
    </g>
    <g class="rough">
      <rect class="boxr" x="330" y="86" width="76" height="40" rx="4" />
      <rect class="box" x="406" y="86" width="76" height="40" rx="4" />
      <rect class="boxg" x="482" y="86" width="76" height="40" rx="4" />
    </g>
    <text class="lbl" x="30" y="36" style="font-size:15px">board after R, D, R, U, L</text>
    <text class="sm" x="62" y="97" text-anchor="middle">0,0</text>
    <text class="sm gr" x="126" y="97" text-anchor="middle">head</text>
    <text class="sm" x="190" y="97" text-anchor="middle">0,2</text>
    <text class="sm" x="62" y="161" text-anchor="middle">1,0</text>
    <text class="sm" x="126" y="161" text-anchor="middle">1,1</text>
    <text class="sm rd" x="190" y="161" text-anchor="middle">tail</text>
    <text class="lbl" x="330" y="36" style="font-size:15px">queue: tail first, head last</text>
    <text class="sm rd" x="368" y="111" text-anchor="middle">1,2</text>
    <text class="sm" x="444" y="111" text-anchor="middle">0,2</text>
    <text class="sm gr" x="520" y="111" text-anchor="middle">0,1</text>
    <text class="sm rd" x="368" y="152" text-anchor="middle">dequeue</text>
    <text class="sm gr" x="520" y="152" text-anchor="middle">enqueue</text>
    <text class="sm" x="30" y="214">set of keys: {1, 2, 5}, where key = row * width + col</text>
  </svg>
  <figcaption>One body, two views. The queue answers "which cell leaves next?", the set answers "is this cell taken?". A move touches both.</figcaption>
</figure>
<p>
  Cells are stored as one number, <code>row * width + col</code>, so the set
  compares numbers rather than arrays (a <code>Set</code> of
  <code>[row, col]</code> arrays would never match, because two arrays with
  the same contents are different objects). The one subtle step is the
  collision test. When the snake does not eat, its tail moves forward in the
  same turn, so the cell the tail is leaving is free for the head. When the
  snake eats, the tail stays put and that cell is still taken. The code
  decides this <em>before</em> changing anything, so a move that ends the
  game leaves the structures untouched:
</p>
<pre><code>class SnakeGame {
  constructor(width, height, food) {
    this.width = width;
    this.height = height;
    this.food = food; <span class="c">// [row, col] pairs, served one at a time in this order</span>
    this.eaten = 0;
    this.body = new Queue(); <span class="c">// cell keys, tail at the front and head at the back</span>
    this.occupied = new Set(); <span class="c">// the same keys, for O(1) collision checks</span>
    this.row = 0;
    this.col = 0;
    this.body.enqueue(0);
    this.occupied.add(0);
  }

  move(direction) {
    let row = this.row;
    let col = this.col;
    if (direction === "U") row--;
    else if (direction === "D") row++;
    else if (direction === "L") col--;
    else col++;
    if (row &lt; 0 || row &gt;= this.height || col &lt; 0 || col &gt;= this.width) return -1;

    const key = row * this.width + col; <span class="c">// one number per cell</span>
    const next = this.food[this.eaten];
    const eating = next !== undefined &amp;&amp; next[0] === row &amp;&amp; next[1] === col;
    const tail = this.body.peek();
    if (this.occupied.has(key) &amp;&amp; (eating || key !== tail)) return -1; <span class="c">// the tail cell is free if the tail moves</span>

    if (eating) {
      this.eaten++; <span class="c">// grow: the tail stays where it is</span>
    } else {
      this.body.dequeue();
      this.occupied.delete(tail);
    }
    this.body.enqueue(key);
    this.occupied.add(key);
    this.row = row;
    this.col = col;
    return this.eaten;
  }
}</code></pre>
<h4>Dry run: width 3, height 2, food [[1, 2], [0, 1]]</h4>
<p>
  The body is written tail first, head last.
</p>
<table>
  <tr><th>Move</th><th>New head</th><th>Food?</th><th>Body afterwards</th><th>Returns</th></tr>
  <tr><td>(start)</td><td></td><td></td><td>(0,0)</td><td></td></tr>
  <tr><td>R</td><td>(0,1)</td><td>no</td><td>(0,1)</td><td>0</td></tr>
  <tr><td>D</td><td>(1,1)</td><td>no</td><td>(1,1)</td><td>0</td></tr>
  <tr><td>R</td><td>(1,2)</td><td>yes, the first food</td><td>(1,1) (1,2)</td><td>1</td></tr>
  <tr><td>U</td><td>(0,2)</td><td>no</td><td>(1,2) (0,2)</td><td>1</td></tr>
  <tr><td>L</td><td>(0,1)</td><td>yes, the second food</td><td>(1,2) (0,2) (0,1)</td><td>2</td></tr>
  <tr><td>U</td><td>(-1,1)</td><td>no</td><td>unchanged</td><td>-1 (off the board)</td></tr>
</table>
<p class="sub">
  Each move is O(1) on average and the memory is O(length), at most
  <code>width * height</code> cells. The 2 by 2 board below shows the subtle
  case. With food at (0,1), (1,1) and (1,0), the moves R, D, L eat all three
  and the body becomes (0,0), (0,1), (1,1), (1,0), with the tail on (0,0).
  A fourth move, U, takes the head onto (0,0), the cell the tail is about to
  leave, and the game goes on with the score still 3. We ran the version
  that checks the body before removing the tail on the same four moves, and
  it returned 1, 2, 3, -1.
</p>
<div class="warn">
  <span class="ttl">⚠ Where Snake loses the round</span>
  <b>1. Checking collision before removing the tail</b>, as just shown: the
  snake dies by running into a cell it was leaving. <b>2. Removing the tail
  when it eats</b>, so the snake never grows. <b>3. Keeping the cells in a
  <code>Set</code> of arrays</b>, so a collision is never found. <b>4.
  Updating the structures and then discovering the game is over</b>, which
  leaves the queue and the set disagreeing; if the statement allows more
  calls after -1, that matters. <b>5. Using <code>shift()</code> on an
  array for the queue and calling the move O(1).</b> The language does not
  promise that cost, so say "a queue" and write one whose dequeue is plainly
  O(1), or name the assumption.
</div>

<h3>Snapshot Array: store changes, not copies</h3>
<p>
  <code>new SnapshotArray(length)</code> holds <code>length</code> values, all
  starting at 0. <code>set(index, value)</code> changes one entry.
  <code>snap()</code> freezes the whole array and returns the snapshot's id,
  which is 0 for the first call, 1 for the second, and so on.
  <code>get(index, snapId)</code> returns what <code>array[index]</code> was
  when snapshot <code>snapId</code> was taken. The obvious way to freeze an
  array is to copy it, which costs O(length) time and memory per
  <code>snap()</code>: an array of 50,000 entries snapshotted 50,000 times
  would hold 2.5 billion numbers, nearly all of them copies of values that
  did not change.
</p>
<p>
  What did change between snapshots? Only the entries that were
  <code>set</code>. So record changes, not states. For each index keep a list
  of <code>[snapId, value]</code> pairs, added in increasing order of
  snapshot id, because snapshots are taken in order. A <code>set</code>
  appends a pair tagged with the id of the snapshot that will capture it, the
  one <em>not yet taken</em>, which is the current counter. A second
  <code>set</code> to the same index before the next <code>snap()</code>
  overwrites that last pair, so each index stores at most one pair per
  snapshot.
</p>
<p>
  <code>get(index, snapId)</code> then asks: of this index's pairs, which is
  the last one tagged <code>snapId</code> or lower? The tags are sorted, so
  that is a binary search for the first pair <em>after</em> <code>snapId</code>
  and a step back by one. If that first-after position is 0, the index had
  not been set by then, and the answer is the initial 0. This is the same
  versioned lookup as the time-based store in the
  <a href="/dsa/dsa-design-problems">design problems chapter</a>, with
  snapshot ids standing in for timestamps; the search loop is the
  "first index with a value greater than the target" form from the
  <a href="/dsa/dsa-binary-search">binary search chapter</a>.
</p>
<pre><code>class SnapshotArray {
  constructor(length) {
    this.history = Array.from({ length }, () =&gt; []); <span class="c">// per index: [snapId, value] pairs, snapIds ascending</span>
    this.snapId = 0; <span class="c">// the id the NEXT snapshot will get</span>
  }

  set(index, value) {
    const versions = this.history[index];
    const last = versions[versions.length - 1];
    if (last !== undefined &amp;&amp; last[0] === this.snapId) last[1] = value; <span class="c">// same snapshot: overwrite</span>
    else versions.push([this.snapId, value]);
  }

  snap() {
    return this.snapId++; <span class="c">// returns the id that was just taken, then moves on</span>
  }

  get(index, snapId) {
    const versions = this.history[index];
    let lo = 0;
    let hi = versions.length;
    while (lo &lt; hi) { <span class="c">// find the first version taken after snapId</span>
      const mid = (lo + hi) &gt;&gt; 1;
      if (versions[mid][0] &gt; snapId) hi = mid;
      else lo = mid + 1;
    }
    return lo === 0 ? 0 : versions[lo - 1][1]; <span class="c">// the version just before it; 0 if there is none</span>
  }
}</code></pre>
<h4>Dry run: history of index 0</h4>
<table>
  <tr><th>Call</th><th>snapId counter</th><th>history[0]</th><th>Returns</th></tr>
  <tr><td>set(0, 5)</td><td>0</td><td>[[0, 5]]</td><td></td></tr>
  <tr><td>snap()</td><td>0, then 1</td><td>[[0, 5]]</td><td>0</td></tr>
  <tr><td>set(0, 6)</td><td>1</td><td>[[0, 5], [1, 6]]</td><td></td></tr>
  <tr><td>set(0, 7)</td><td>1</td><td>[[0, 5], [1, 7]]: overwrote the last pair, same snapshot</td><td></td></tr>
  <tr><td>snap()</td><td>1, then 2</td><td>unchanged</td><td>1</td></tr>
  <tr><td>set(0, 9)</td><td>2</td><td>[[0, 5], [1, 7], [2, 9]]</td><td></td></tr>
  <tr><td>snap()</td><td>2, then 3</td><td>unchanged</td><td>2</td></tr>
  <tr><td>get(0, 0), get(0, 1), get(0, 2)</td><td></td><td></td><td>5, 7, 9</td></tr>
  <tr><td>get(1, 2)</td><td></td><td>history[1] is empty</td><td>0</td></tr>
</table>
<p>
  The search itself, on <code>[[0, 10], [2, 20], [5, 30], [9, 40]]</code> for
  <code>get(..., 6)</code>:
</p>
<table>
  <tr><th>lo</th><th>hi</th><th>mid</th><th>tag at mid</th><th>Decision</th></tr>
  <tr><td>0</td><td>4</td><td>2</td><td>5</td><td>5 &gt; 6 is false, so lo = 3</td></tr>
  <tr><td>3</td><td>4</td><td>3</td><td>9</td><td>9 &gt; 6, so hi = 3</td></tr>
  <tr><td>3</td><td>3</td><td></td><td></td><td>stop: first pair after 6 is position 3, so the answer is pair 2, value 30</td></tr>
</table>
<p class="sub">
  <code>set</code> and <code>snap</code> are O(1), <code>get</code> is
  O(log v) where v is the number of recorded changes at that index, and the
  memory is O(length + total sets). The constructor allocates one empty list
  per index; if the length is huge and few indices are ever set, a
  <code>Map</code> from index to list allocates only for the indices touched.
</p>
<div class="warn">
  <span class="ttl">⚠ Three off-by-one traps</span>
  <b>1. Tagging a set with the id the last snap returned.</b> A set made
  after <code>snap()</code> returned 0 belongs to snapshot 1, not 0. The
  right tag is the id the <em>next</em> snapshot will get, which is the
  counter itself; <code>snap()</code> hands out the old value of the counter
  and then increments it. <b>2. Searching for the last
  pair equal to <code>snapId</code>.</b> Most snapshots do not appear in a
  given index's list, since that index did not change then; you need the
  last pair <em>at or before</em> it. <b>3. Reading
  <code>versions[lo - 1][1]</code> when <code>lo === 0</code>.</b> That is
  <code>versions[-1]</code>, which is <code>undefined</code>, and reading
  <code>[1]</code> from it throws a <code>TypeError</code> instead of
  returning the initial 0.
</div>

<h3>Browser history: an array with a pointer, or two stacks</h3>
<p>
  <code>new BrowserHistory(homepage)</code> starts on one page.
  <code>visit(url)</code> goes to a new page and erases every page that was
  ahead of the current one. <code>back(steps)</code> and
  <code>forward(steps)</code> move that many pages, stopping at the ends of
  the history, and return the page they land on. This question is a good
  warm-up for the method, because both standard answers are right and the
  conversation is about which one you would choose.
</p>
<p>
  <b>One array and a pointer.</b> The history is a line of pages and one of
  them is on screen. Keep the pages in an array and the index of the current
  page. <code>back</code> and <code>forward</code> only move the index, and
  clamp it to the range <code>0</code> to <code>length - 1</code>.
  <code>visit</code> cuts the array to <code>current + 1</code> entries,
  pushes the new page and moves the pointer onto it. Setting
  <code>pages.length</code> to a smaller number removes the entries past it.
</p>
<p>
  <b>Two stacks.</b> Keep the pages behind you on one stack, the pages ahead
  on another, and the current page in a variable. Going back moves the
  current page onto the forward stack and pops one from the back stack, and
  going forward does the reverse. A visit pushes the current page onto the
  back stack, makes the new page current and empties the forward stack.
</p>
<pre><code>class BrowserHistory {
  constructor(homepage) {
    this.pages = [homepage];
    this.current = 0; <span class="c">// index of the page on screen</span>
  }

  visit(url) {
    this.pages.length = this.current + 1; <span class="c">// forget every page ahead of us</span>
    this.pages.push(url);
    this.current++;
  }

  back(steps) {
    this.current = Math.max(0, this.current - steps);
    return this.pages[this.current];
  }

  forward(steps) {
    this.current = Math.min(this.pages.length - 1, this.current + steps);
    return this.pages[this.current];
  }
}

class BrowserHistoryStacks {
  constructor(homepage) {
    this.backStack = []; <span class="c">// pages behind us, the nearest on top</span>
    this.forwardStack = []; <span class="c">// pages ahead of us, the nearest on top</span>
    this.page = homepage;
  }

  visit(url) {
    this.backStack.push(this.page);
    this.page = url;
    this.forwardStack = []; <span class="c">// a new visit erases the forward pages</span>
  }

  back(steps) {
    while (steps &gt; 0 &amp;&amp; this.backStack.length &gt; 0) {
      this.forwardStack.push(this.page);
      this.page = this.backStack.pop();
      steps--;
    }
    return this.page;
  }

  forward(steps) {
    while (steps &gt; 0 &amp;&amp; this.forwardStack.length &gt; 0) {
      this.backStack.push(this.page);
      this.page = this.forwardStack.pop();
      steps--;
    }
    return this.page;
  }
}</code></pre>
<h4>Dry run: homepage "a", then visit b, visit c, back 1, visit d, forward 2, back 5</h4>
<table>
  <tr><th>Call</th><th>pages</th><th>current</th><th>Returns</th></tr>
  <tr><td>visit("b")</td><td>a, b</td><td>1</td><td></td></tr>
  <tr><td>visit("c")</td><td>a, b, c</td><td>2</td><td></td></tr>
  <tr><td>back(1)</td><td>a, b, c</td><td>1</td><td>b</td></tr>
  <tr><td>visit("d")</td><td>a, b, d (c was ahead of us, so it is erased)</td><td>2</td><td></td></tr>
  <tr><td>forward(2)</td><td>a, b, d</td><td>2 (already at the end)</td><td>d</td></tr>
  <tr><td>back(5)</td><td>a, b, d</td><td>0 (clamped)</td><td>a</td></tr>
</table>
<table>
  <tr><th></th><th>Array and pointer</th><th>Two stacks</th></tr>
  <tr><td>visit</td><td>O(1) amortized: each page is erased at most once, and a visit created it</td><td>O(1)</td></tr>
  <tr><td>back, forward</td><td>O(1), whatever the number of steps</td><td>O(steps), bounded by the stack size</td></tr>
  <tr><td>Random access, such as "go to the third page back"</td><td>an index</td><td>pop that many</td></tr>
  <tr><td>Where it is the natural fit</td><td>the history is a list and you jump</td><td>every move is one step and you want undo and redo semantics</td></tr>
</table>
<p class="sub">
  The two-stack form is the same machine as undo and redo: the back stack
  is the undo stack, the forward stack is redo, and doing a new action
  clears redo. The next section applies that picture to a text editor.
</p>

<h3>Text editor: two stacks around the cursor</h3>
<p>
  A text editor with a cursor supports <code>addText(text)</code>, which
  inserts at the cursor and leaves the cursor after the new text;
  <code>deleteText(k)</code>, which deletes up to k characters to the
  <em>left</em> of the cursor and returns how many it deleted;
  <code>cursorLeft(k)</code> and <code>cursorRight(k)</code>, which move the
  cursor by up to k places, and return the last (up to) 10 characters to the
  left of the cursor. A single string with an index looks natural, but
  a string cannot be changed in place: every insertion or deletion builds a
  new string, and in the usual cost model that work grows with the length of
  the text. With long text and many operations that is the cost the
  question is probing.
</p>
<p>
  Everything an editor does happens at the cursor. So split the text there:
  keep the characters <em>before</em> the cursor on one stack, and the
  characters <em>after</em> it on another, each with the character nearest
  the cursor on top. Typing pushes onto the left stack. Deleting pops it.
  Moving the cursor left pops a character from the left stack and pushes it
  onto the right stack, because that character is now after the cursor, and
  moving right is the reverse. The full text is the left stack, then the
  right stack read from top to bottom.
</p>
<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="The text hello with the cursor after the letters h e l, shown as a left stack of three letters and a right stack of two letters either side of a cursor bar">
    <g class="rough">
      <rect class="box" x="90" y="70" width="52" height="44" rx="4" />
      <rect class="box" x="142" y="70" width="52" height="44" rx="4" />
      <rect class="boxg" x="194" y="70" width="52" height="44" rx="4" />
      <rect class="boxr" x="394" y="70" width="52" height="44" rx="4" />
      <rect class="box" x="446" y="70" width="52" height="44" rx="4" />
    </g>
    <path class="ln" d="M320,50 L320,134" />
    <text class="sm" x="116" y="98" text-anchor="middle">h</text>
    <text class="sm" x="168" y="98" text-anchor="middle">e</text>
    <text class="sm gr" x="220" y="98" text-anchor="middle">l</text>
    <text class="sm rd" x="420" y="98" text-anchor="middle">l</text>
    <text class="sm" x="472" y="98" text-anchor="middle">o</text>
    <text class="sm" x="320" y="40" text-anchor="middle">cursor</text>
    <text class="sm" x="168" y="160" text-anchor="middle">left stack, top nearest the cursor</text>
    <text class="sm" x="470" y="160" text-anchor="middle">right stack, top nearest the cursor</text>
  </svg>
  <figcaption>The cursor is the boundary between two stacks. Moving it by one character moves one character across the boundary.</figcaption>
</figure>
<pre><code>class TextEditor {
  constructor() {
    this.left = []; <span class="c">// characters before the cursor, the nearest on top</span>
    this.right = []; <span class="c">// characters after the cursor, the nearest on top (so the text is reversed)</span>
  }

  addText(text) {
    for (const ch of text) this.left.push(ch);
  }

  deleteText(k) {
    let removed = 0;
    while (removed &lt; k &amp;&amp; this.left.length &gt; 0) {
      this.left.pop();
      removed++;
    }
    return removed;
  }

  cursorLeft(k) {
    while (k &gt; 0 &amp;&amp; this.left.length &gt; 0) {
      this.right.push(this.left.pop()); <span class="c">// one character crosses the cursor</span>
      k--;
    }
    return this.#beforeCursor();
  }

  cursorRight(k) {
    while (k &gt; 0 &amp;&amp; this.right.length &gt; 0) {
      this.left.push(this.right.pop());
      k--;
    }
    return this.#beforeCursor();
  }

  #beforeCursor() {
    return this.left.slice(-10).join(""); <span class="c">// at most the 10 characters just before the cursor</span>
  }
}</code></pre>
<h4>Dry run: the cursor is shown as | between the two halves</h4>
<table>
  <tr><th>Call</th><th>Text, with the cursor</th><th>Returns</th></tr>
  <tr><td>addText("hello")</td><td>hello|</td><td></td></tr>
  <tr><td>cursorLeft(2)</td><td>hel|lo</td><td>"hel"</td></tr>
  <tr><td>addText("XY")</td><td>helXY|lo</td><td></td></tr>
  <tr><td>deleteText(3)</td><td>he|lo</td><td>3</td></tr>
  <tr><td>cursorRight(9)</td><td>helo|</td><td>"helo" (it moved only 2 places, as far as the text goes)</td></tr>
  <tr><td>cursorLeft(1)</td><td>hel|o</td><td>"hel"</td></tr>
</table>
<p class="sub">
  <code>addText</code> costs O(length of the text), <code>deleteText(k)</code>
  and the two cursor moves cost O(k), and the returned string costs at most
  O(10). No operation depends on the total length of the document: an edit
  costs the size of the edit, and the only other cost is the distance the
  cursor travels in a move.
  A <b>gap buffer</b> is the same machine in one array: the text before the
  cursor sits at the start, the text after it sits at the end, and the
  unused space, the gap, sits between them at the cursor. Moving the cursor
  shifts characters across the gap, exactly like moving them between the two
  stacks, and typing fills the gap from the left. Say that in the interview
  as an option; the two-stack form is shorter to write and has the same
  costs.
</p>
<div class="warn">
  <span class="ttl">⚠ Four details to settle out loud</span>
  <b>1. Deleting more than exists.</b> Delete at most
  <code>left.length</code> characters and return how many were actually
  removed, not k. <b>2. The return value of a cursor move</b> is the text
  to the <em>left</em> of the cursor, capped at 10, not the character just
  moved over. <b>3. The order of the right stack.</b> Because the nearest
  character is on top, the right stack holds the text backwards; joining it
  without reversing gives the wrong string. <b>4. What a "character" is.</b>
  <code>for (const ch of text)</code> walks code points, so an emoji is one
  character; indexing a string by position walks UTF-16 units and would split
  it. Pick one and say so.
</div>

<h3>News feed: merge k sorted streams with a heap</h3>
<p>
  Design a small social feed. <code>postTweet(userId, tweetId)</code> adds a
  post. <code>follow(a, b)</code> and <code>unfollow(a, b)</code> change
  who a user reads. <code>getNewsFeed(userId)</code> returns the ids of the
  ten most recent posts among the user's own and those of everyone they
  follow, newest first. Do the operation table: posting, following and
  unfollowing are each one change to a map or a list, so O(1) on average. The one
  hard operation is the feed.
</p>
<p>
  The naive feed collects every post of every followed user, sorts the lot
  by time, and takes ten. It costs O(P log P) for P posts in total, and it
  sorts thousands of posts to return ten. Look at what you already have.
  Each user's posts were appended in the order they were made, so each
  user's list is <em>already sorted</em> by time. The feed is a merge of
  several sorted lists, and you only need the first ten items of the merged
  result. That is the k-way merge from the
  <a href="/dsa/dsa-heaps-priority-queues">heaps chapter</a>, run from the
  newest end.
</p>
<p>
  Put the newest post of each source in a max-heap by time. The top of the
  heap is the newest post anywhere. Pop it, add it to the feed, and push the
  next-newest post from the same user. Stop after ten posts or when the
  heap is empty. Each heap entry is a small cursor, a list and an index, so
  nothing is copied. The code below uses the comparator-based
  <code>Heap</code> class from the heaps chapter (<code>new Heap(compare,
  items)</code>, <code>push</code>, <code>pop</code>, <code>size</code>);
  give it the heap's order as the comparator and it does the rest.
</p>
<p>
  One decision is easy to get wrong: what to order by. Tweet ids are labels
  and need not rise with time, and a real clock can repeat a value for two
  posts. Keep a counter inside the object, increase it on every post, and
  store its value with the post. Then "newer" is a plain number comparison
  with no ties.
</p>
<pre><code>class NewsFeed {
  constructor() {
    this.clock = 0; <span class="c">// a global counter: it never repeats, unlike a timestamp</span>
    this.posts = new Map(); <span class="c">// userId -&gt; posts, oldest first</span>
    this.following = new Map(); <span class="c">// userId -&gt; Set of followed userIds</span>
  }

  postTweet(userId, tweetId) {
    if (!this.posts.has(userId)) this.posts.set(userId, []);
    this.posts.get(userId).push({ time: this.clock++, id: tweetId });
  }

  follow(followerId, followeeId) {
    if (!this.following.has(followerId)) this.following.set(followerId, new Set());
    this.following.get(followerId).add(followeeId);
  }

  unfollow(followerId, followeeId) {
    this.following.get(followerId)?.delete(followeeId);
  }

  getNewsFeed(userId, limit = 10) {
    const sources = new Set(this.following.get(userId) ?? []);
    sources.add(userId); <span class="c">// you always see your own posts</span>

    const newest = [];
    for (const source of sources) {
      const list = this.posts.get(source);
      if (list !== undefined) newest.push({ list, index: list.length - 1 }); <span class="c">// each stream starts at its newest post</span>
    }
    const heap = new Heap((a, b) =&gt; b.list[b.index].time - a.list[a.index].time, newest); <span class="c">// newest time first</span>

    const feed = [];
    while (feed.length &lt; limit &amp;&amp; heap.size() &gt; 0) {
      const top = heap.pop();
      feed.push(top.list[top.index].id);
      if (top.index &gt; 0) heap.push({ list: top.list, index: top.index - 1 }); <span class="c">// that stream's next-newest post</span>
    }
    return feed;
  }
}</code></pre>
<h4>Dry run: the feed of user 1, who follows users 2 and 3</h4>
<p>
  Posts, in the order they were made: user 1 posts 11 (time 0), user 2 posts
  21 (time 1), user 1 posts 12 (time 2), user 3 posts 31 (time 3), user 2
  posts 22 (time 4). The feed has limit 4. A heap entry is written
  <code>user@time</code>.
</p>
<table>
  <tr><th>Step</th><th>Heap (newest first)</th><th>Feed so far</th></tr>
  <tr><td>start: the newest post of users 2, 3 and 1</td><td>2@4, 3@3, 1@2</td><td>[]</td></tr>
  <tr><td>pop 2@4, push user 2's older post</td><td>3@3, 1@2, 2@1</td><td>[22]</td></tr>
  <tr><td>pop 3@3, user 3 has no older post</td><td>1@2, 2@1</td><td>[22, 31]</td></tr>
  <tr><td>pop 1@2, push user 1's older post</td><td>2@1, 1@0</td><td>[22, 31, 12]</td></tr>
  <tr><td>pop 2@1</td><td>1@0</td><td>[22, 31, 12, 21]: the limit is reached</td></tr>
</table>
<p class="sub">
  The feed is <code>[22, 31, 12, 21]</code>. User 1's first post, 11, was
  never touched, and neither were any older posts: the heap did only as much
  work as the answers needed. With f sources (the followed users plus
  the user), building the starting list and heapifying it costs O(f), and
  each of the K results is one pop and at most one push, O(log f) each.
  That is O(f + K log f) per feed, against O(P log P) for the naive sort,
  where P can be far larger than K. After <code>unfollow(1, 2)</code> the
  same call returns <code>[31, 12, 11]</code>, because user 2 is no longer a
  source.
</p>
<div class="warn">
  <span class="ttl">⚠ Where the feed goes wrong</span>
  <b>1. Forgetting the user's own posts.</b> Add the user to the source set
  every time, rather than storing a self-follow that
  <code>unfollow(u, u)</code> could remove. <b>2. Duplicate sources.</b>
  Following the same user twice must not show their posts twice; the
  <code>Set</code> takes care of it. <b>3. Sources with no posts.</b> A user
  who never posted has no list, and pushing a cursor with index -1 breaks the
  comparator. <b>4. Pushing every post of every source into the heap.</b> That is
  the naive sort in disguise. Push one cursor per source, and push the
  next cursor of a source only when its last one is popped.
</div>
<p>
  This merges at read time: the cost is paid when someone asks for a feed.
  The alternative that a large system might choose is to copy each new post
  into every follower's own list when it is written, so a read is a lookup
  and a write is expensive. Name both and say which operation you are
  optimizing; for the question as asked, the heap merge is the expected
  answer.
</p>

<h3>Logs and counters: logger, moving average, underground</h3>
<p>
  Three short problems share one skill: keep just enough about the past to
  answer the next call. The
  <a href="/dsa/dsa-design-problems">design problems chapter</a> already has
  the hit counter and the sliding-window rate limiter. These three are
  smaller, and each hides a different trap.
</p>

<h4>Logger rate limiter: print a message at most once per window</h4>
<p>
  <code>shouldPrint(timestamp, message)</code> returns <code>true</code> if
  the message may be printed now, and <code>false</code> if the same message
  was printed less than 10 seconds ago. Timestamps arrive in non-decreasing
  order. The simplest honest structure is a map from message to the first
  timestamp at which it may print again. A call that prints sets that to
  <code>timestamp + 10</code>; a call that is refused changes nothing.
</p>
<pre><code>class Logger {
  constructor(window = 10) {
    this.window = window;
    this.nextAllowed = new Map(); <span class="c">// message -&gt; the first timestamp it may print again</span>
  }

  shouldPrint(timestamp, message) {
    const allowed = this.nextAllowed.get(message);
    if (allowed !== undefined &amp;&amp; timestamp &lt; allowed) return false; <span class="c">// a refusal changes nothing</span>
    this.nextAllowed.set(message, timestamp + this.window);
    return true;
  }
}</code></pre>
<table>
  <tr><th>Call</th><th>Stored deadline for that message</th><th>Returns</th></tr>
  <tr><td>(1, "x")</td><td>x: 11</td><td>true</td></tr>
  <tr><td>(2, "y")</td><td>y: 12</td><td>true</td></tr>
  <tr><td>(3, "x")</td><td>x: still 11</td><td>false</td></tr>
  <tr><td>(8, "y")</td><td>y: still 12</td><td>false</td></tr>
  <tr><td>(11, "x")</td><td>x: 21 (11 is not less than 11)</td><td>true</td></tr>
  <tr><td>(12, "y")</td><td>y: 22</td><td>true</td></tr>
  <tr><td>(12, "x")</td><td>x: still 21</td><td>false</td></tr>
</table>
<p class="sub">
  Each call is O(1) on average. The trap is the refusal: if a refused call
  also stored <code>timestamp + 10</code>, the refusal at time 3 would have
  moved x's deadline to 13, and the call at time 11 would have been refused
  too. That is a different rule (a message must be quiet for 10 seconds
  before it prints again), so ask which one is meant. The second trap is
  memory. The map keeps every message ever seen, forever. If the messages are
  unbounded, keep only the ones that are still blocked: a queue of
  <code>(time, message)</code> in print order, and a set of the blocked
  messages. Before each call, remove from the front of the queue every
  entry whose block has ended.
</p>
<pre><code>class BoundedLogger {
  constructor(window = 10) {
    this.window = window;
    this.printed = new Queue(); <span class="c">// { time, message } in the order printed</span>
    this.recent = new Set(); <span class="c">// the messages that are still blocked</span>
  }

  shouldPrint(timestamp, message) {
    while (this.printed.length &gt; 0 &amp;&amp; this.printed.peek().time + this.window &lt;= timestamp) {
      this.recent.delete(this.printed.dequeue().message); <span class="c">// its block has ended: forget it</span>
    }
    if (this.recent.has(message)) return false;
    this.recent.add(message);
    this.printed.enqueue({ time: timestamp, message });
    return true;
  }
}</code></pre>
<p class="sub">
  At time 11 the entry for x printed at time 1 has ended (1 + 10 is not
  more than 11), so it leaves the set and x prints; at time 100 everything
  has expired and the set holds one message. Each entry is added once and
  removed once, so a call is O(1) amortized, and the memory is the number of
  messages printed within the last window. This version needs the timestamps
  to be non-decreasing, because it expires from the front of the queue.
</p>

<h4>Moving average with a ring buffer</h4>
<p>
  <code>next(value)</code> receives the next number of a stream and returns
  the average of the last <code>size</code> numbers (or of all of them, until
  there are that many). Averaging the window on every call costs O(size).
  Keep the <b>sum</b> instead: when a value arrives, add it, and subtract
  the value that falls out. You need to know which value falls out, and it is
  the oldest one, so store the window in a fixed array used as a
  <b>ring</b>: the slot for the n-th value is <code>n % size</code>, which is
  where the oldest value sits. The ring starts filled with zeros, so
  subtracting what is in a slot that was never written subtracts nothing.
</p>
<pre><code>class MovingAverage {
  constructor(size) {
    this.window = new Array(size).fill(0); <span class="c">// a ring: the oldest value is overwritten first</span>
    this.count = 0; <span class="c">// how many values have arrived in total</span>
    this.sum = 0; <span class="c">// the sum of what is in the ring</span>
  }

  next(value) {
    const slot = this.count % this.window.length;
    this.sum += value - this.window[slot]; <span class="c">// add the newcomer, drop the value it replaces</span>
    this.window[slot] = value;
    this.count++;
    return this.sum / Math.min(this.count, this.window.length);
  }
}</code></pre>
<table>
  <tr><th>next(value)</th><th>Ring</th><th>sum</th><th>Values counted</th><th>Returns</th></tr>
  <tr><td>1</td><td>[1, 0, 0]</td><td>1</td><td>1</td><td>1</td></tr>
  <tr><td>10</td><td>[1, 10, 0]</td><td>11</td><td>2</td><td>5.5</td></tr>
  <tr><td>3</td><td>[1, 10, 3]</td><td>14</td><td>3</td><td>4.666666666666667</td></tr>
  <tr><td>5</td><td>[5, 10, 3]</td><td>18 (14 + 5 - 1)</td><td>3</td><td>6</td></tr>
  <tr><td>2</td><td>[5, 2, 3]</td><td>10 (18 + 2 - 10)</td><td>3</td><td>3.3333333333333335</td></tr>
</table>
<p class="sub">
  Each call is O(1) and the memory is O(size). The invariant is "
  <code>sum</code> equals the sum of the numbers in the ring". It holds
  exactly for integers whose running sum stays below 2<sup>53</sup>. For
  fractions it can drift. We ran this class with size 3 on 0.1, 0.2, 0.3,
  0.4: the last call returned 0.30000000000000004, while averaging the
  window 0.2, 0.3, 0.4 directly gave 0.3. A large value that leaves the
  window can do worse: with size 2 and the stream 1e16, 1, 2, the third
  call returned 1, though the window 1, 2 averages 1.5, because adding 1 to
  1e16 changes nothing and the 1 was lost. If exactness matters for
  fractions, recompute the window sum or compare with a tolerance.
</p>

<h4>Underground system: store the sum and the count, not the average</h4>
<p>
  <code>checkIn(id, station, time)</code> and <code>checkOut(id, station,
  time)</code> record a card's trip; <code>getAverageTime(from, to)</code>
  returns the average duration over every completed trip that started at
  <code>from</code> and ended at <code>to</code>. A card has at most one open
  trip at a time. Two structures are needed and each answers one question.
  The open trips, a map from card id to where and when it checked in, answer
  "where did this card start?". The route totals answer "what is the
  average?", and the answer there is <em>not</em> to store the average:
  an average of averages is wrong, and an average alone cannot be updated
  without knowing how many trips it covers. Store the <b>sum of durations and the number of trips</b> per
  route, add to both on every check-out, and divide only when asked.
</p>
<pre><code>class UndergroundSystem {
  constructor() {
    this.checkedIn = new Map(); <span class="c">// card id -&gt; { station, time } of the open trip</span>
    this.trips = new Map(); <span class="c">// route key -&gt; { sum, count }</span>
  }

  checkIn(id, station, time) {
    this.checkedIn.set(id, { station, time });
  }

  checkOut(id, station, time) {
    const { station: from, time: start } = this.checkedIn.get(id);
    this.checkedIn.delete(id);
    const key = JSON.stringify([from, station]); <span class="c">// a route is an ordered pair</span>
    const total = this.trips.get(key) ?? { sum: 0, count: 0 };
    total.sum += time - start;
    total.count++;
    this.trips.set(key, total);
  }

  getAverageTime(startStation, endStation) {
    const total = this.trips.get(JSON.stringify([startStation, endStation]));
    return total.sum / total.count; <span class="c">// divide only when asked</span>
  }
}</code></pre>
<table>
  <tr><th>Call</th><th>checkedIn</th><th>Route totals</th></tr>
  <tr><td>checkIn(45, "Park", 3)</td><td>45: Park at 3</td><td></td></tr>
  <tr><td>checkIn(32, "Dock", 8)</td><td>45, 32</td><td></td></tr>
  <tr><td>checkIn(27, "Park", 10)</td><td>45, 32, 27</td><td></td></tr>
  <tr><td>checkOut(45, "Mill", 15)</td><td>32, 27</td><td>Park to Mill: sum 12, count 1</td></tr>
  <tr><td>checkOut(27, "Mill", 20)</td><td>32</td><td>Park to Mill: sum 22, count 2</td></tr>
  <tr><td>checkOut(32, "Quay", 22)</td><td>empty</td><td>Dock to Quay: sum 14, count 1</td></tr>
  <tr><td>getAverageTime("Dock", "Quay")</td><td></td><td>14 / 1 = 14</td></tr>
  <tr><td>getAverageTime("Park", "Mill")</td><td></td><td>22 / 2 = 11</td></tr>
</table>
<p class="sub">
  Every operation is O(1) on average, and the memory is the number of open
  trips plus the number of distinct routes. The route key deserves care. The
  tempting key is the two names joined with a comma, and it breaks when a
  name contains the separator: <code>("a,b", "c")</code> and
  <code>("a", "b,c")</code> both become <code>"a,b,c"</code>. Serializing the
  pair with <code>JSON.stringify</code> keeps them apart, and a nested
  <code>Map</code> would too. An array used directly as a <code>Map</code>
  key does not work either, since two arrays with equal contents are two
  different keys. Also remember that a route is directional: Park to Mill and
  Mill to Park are different keys.
</p>

<h3>Simulating by events: a parking lot</h3>
<p>
  Some design questions describe a small world that changes by events: a car
  arrives, a car leaves. The method does not change. List the events, say
  what each does to the state, and make the state small enough that every
  event leaves it consistent. A parking lot with numbered slots is a short
  example: <code>park()</code> gives the arriving car the lowest-numbered
  free slot and a ticket, or reports that the lot is full, and
  <code>leave(ticket)</code> frees the slot that ticket holds.
</p>
<p>
  "Lowest free slot" needs a structure that finds the minimum, and the slots
  keep coming back in any order, so a min-heap of free slot numbers fits: park
  pops it, leave pushes the slot back. A map from ticket to slot says where
  each car is. The invariant is that every slot is in exactly one of the two
  places, so <code>parked.size + free.size() === capacity</code> after every
  event.
</p>
<pre><code>class ParkingLot {
  constructor(slots) {
    this.capacity = slots;
    this.free = new Heap((a, b) =&gt; a - b, Array.from({ length: slots }, (_, i) =&gt; i + 1)); <span class="c">// free slot numbers, lowest first</span>
    this.parked = new Map(); <span class="c">// ticket -&gt; slot</span>
    this.nextTicket = 1;
  }

  park() {
    if (this.free.size() === 0) return null;
    const slot = this.free.pop();
    const ticket = this.nextTicket++;
    this.parked.set(ticket, slot);
    return { ticket, slot };
  }

  leave(ticket) {
    const slot = this.parked.get(ticket);
    if (slot === undefined) return false;
    this.parked.delete(ticket);
    this.free.push(slot); <span class="c">// the slot is free again</span>
    return true;
  }
}</code></pre>
<table>
  <tr><th>Event</th><th>Free slots afterwards</th><th>Returns</th></tr>
  <tr><td>park(), park(), park()</td><td>none</td><td>tickets 1, 2, 3 in slots 1, 2, 3</td></tr>
  <tr><td>park()</td><td>none</td><td>null: the lot is full</td></tr>
  <tr><td>leave(2)</td><td>2</td><td>true</td></tr>
  <tr><td>park()</td><td>none</td><td>ticket 4 in slot 2: the lowest free slot</td></tr>
  <tr><td>leave(2)</td><td>none</td><td>false: ticket 2 was already used</td></tr>
  <tr><td>leave(1)</td><td>1</td><td>true</td></tr>
  <tr><td>park()</td><td>none</td><td>ticket 5 in slot 1</td></tr>
</table>
<p class="sub">
  Park and leave are O(log s) for s slots. The line that protects the
  invariant is the check on the ticket: if <code>leave</code> pushed a slot
  without checking that the ticket was still open, the same slot could sit in
  the heap twice and be given to two cars. If events carry times and must be
  processed in time order, the same heap idea, ordered by time instead of by
  slot number, drives the whole simulation: pop the earliest event, apply it,
  push the events it causes.
</p>

<h3>Check your design against a naive twin</h3>
<p>
  A design class has no single output to eyeball, so test it the way you
  derived it. For every class here, write the naive version too: the one
  that stores everything and rescans, rebuilds or recounts. It is too slow to
  submit and easy to get right. Then drive both with the same random
  sequence of calls, compare every return value, and after every call check
  the invariant you stated. A mismatch tells you the exact call that broke
  the class, and a violated invariant tells you which sentence stopped being
  true.
</p>
<pre><code>function seededRandom(seed) {
  let state = seed;
  return (n) =&gt; {
    state = (state * 16807) % 2147483647; <span class="c">// a small deterministic generator: the same seed replays the same run</span>
    return state % n;
  };
}

function compareToTwin({ makePair, randomCall, invariant, runs, steps }) {
  let calls = 0;
  for (let run = 1; run &lt;= runs; run++) {
    const random = seededRandom(run);
    const { fast, naive } = makePair(random);
    for (let step = 0; step &lt; steps; step++) {
      const { method, args } = randomCall(random);
      const got = fast[method](...args);
      const want = naive[method](...args);
      if (JSON.stringify(got) !== JSON.stringify(want)) {
        throw new Error("run " + run + ", step " + step + ": " + method + "(" + args + ") gave " + JSON.stringify(got) + ", the twin says " + JSON.stringify(want));
      }
      if (invariant) invariant(fast);
      calls++;
    }
  }
  return calls;
}</code></pre>
<p>
  The harness takes a function that makes the fast class and its twin, a
  function that picks a random call, and an invariant. Here it checks the
  array-and-pointer history against a twin that rebuilds the list on every
  visit:
</p>
<pre><code>class NaiveBrowserHistory {
  constructor(homepage) {
    this.pages = [homepage];
    this.current = 0;
  }

  visit(url) {
    this.pages = [...this.pages.slice(0, this.current + 1), url]; <span class="c">// rebuild the whole list: slow and obviously right</span>
    this.current = this.pages.length - 1;
  }

  back(steps) {
    for (let i = 0; i &lt; steps; i++) if (this.current &gt; 0) this.current--;
    return this.pages[this.current];
  }

  forward(steps) {
    for (let i = 0; i &lt; steps; i++) if (this.current &lt; this.pages.length - 1) this.current++;
    return this.pages[this.current];
  }
}

const calls = compareToTwin({
  runs: 500,
  steps: 60,
  makePair: () =&gt; ({ fast: new BrowserHistory("home"), naive: new NaiveBrowserHistory("home") }),
  randomCall: (random) =&gt; {
    const choice = random(3);
    if (choice === 0) return { method: "visit", args: ["page" + random(100)] };
    return { method: choice === 1 ? "back" : "forward", args: [random(4)] };
  },
  invariant: (history) =&gt; {
    if (history.current &lt; 0 || history.current &gt;= history.pages.length) throw new Error("the pointer left the history");
  },
});</code></pre>
<p>
  That run makes 30,000 calls and compares every return value. To see that the
  harness can fail, we broke the class two ways. Changing the lower clamp of
  <code>back</code> from 0 to 1 failed at run 1, step 0, with
  <code>back(1)</code> returning <code>undefined</code> where the twin said
  <code>"home"</code>. Cutting <code>pages.length</code> to
  <code>current</code> instead of <code>current + 1</code> was caught by the
  invariant. The classes in this chapter were each checked this way before
  their code was copied here. Which invariant to assert depends on the class:
</p>
<table>
  <tr><th>Class</th><th>Invariant to check after every call</th></tr>
  <tr><td>Nested iterator</td><td>calling <code>hasNext()</code> twice gives the same answer; the values come out in the order of a recursive flatten</td></tr>
  <tr><td>Snake</td><td>the set has the same size as the queue; every queued cell is in the set; the length is 1 plus the foods eaten</td></tr>
  <tr><td>Snapshot array</td><td>each index's snapshot ids are strictly increasing</td></tr>
  <tr><td>Text editor</td><td>the left stack plus the reversed right stack spell the same text as a plain string</td></tr>
  <tr><td>Bounded logger</td><td>the set and the queue hold the same number of messages</td></tr>
  <tr><td>Parking lot</td><td>parked plus free equals the capacity, with no slot in both</td></tr>
</table>
<p>
  In an interview you will not run a harness, but the habit transfers. After
  writing the class, walk one short sequence by hand and say the invariant
  after each call, and name the edge cases you would test: an empty input,
  one element, a repeated call, a call at the boundary, a call after the end.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt is a class with named methods and no input array to process, and the costs per method are stated or implied. Write the operation table before any code.</li>
  <li>"Implement an iterator", <code>hasNext</code>, <code>next</code>, <code>peek</code>: a one-value lookahead slot, a stack of frames for nesting, or a queue of cursors for interleaving. Do the work in <code>hasNext</code> when it has to find the next real value.</li>
  <li>A game board with a win or collision check each turn: do not rescan the board. Ask what the check really needs, then keep a counter per line, or a set beside the ordered body.</li>
  <li>A sequence with one growing end and one shrinking end, plus a membership question: a queue and a set, kept in step.</li>
  <li>"As of snapshot or version t": record changes with their version tag, and binary search for the last tag at or before t.</li>
  <li>Undo, redo, back, forward, cursor: two stacks around a middle point, or an array and a pointer when jumps are allowed.</li>
  <li>"The k most recent across several sources": each source is already sorted, so a heap of cursors merges them and stops after k.</li>
  <li>"Average, count or rate over a window or a group": store sums and counts instead of averages; for a sliding window, a ring buffer and a running sum.</li>
  <li>"Lowest-numbered free", "next to expire", "earliest event": a heap, together with a map that says what each entry is.</li>
  <li>Pitfalls: doing the digging in <code>next</code> only, a falsy value taken for "empty", a key built by joining strings, a refusal that changes state, a pointer that leaves the array, a heap entry pushed twice, and a second structure that falls out of step with the first.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write the four-step method from memory, and give the invariant of a design you have just built as one sentence.</li>
    <li>Explain why <code>hasNext()</code> of the nested-list iterator does the work, and why <code>hasNext()</code> twice in a row is safe.</li>
    <li>Say why the peeked value is stored in a box, and what goes wrong with <code>[0, 7, 8]</code> when it is not.</li>
    <li>Run the zigzag iterator by hand on three lists of different lengths and say where a finished list goes.</li>
    <li>Explain why a counter of +n or -n means one player owns the whole line, and what changes if a cell could be played twice.</li>
    <li>Write Snake's <code>move</code> and say why the cell the tail is leaving does not count as a collision unless the snake eats, and why the test runs before anything is changed.</li>
    <li>Build Snapshot Array and say why a second <code>set</code> before a <code>snap</code> overwrites the last pair and why <code>get</code> needs the last pair at or before the id.</li>
    <li>Compare the pointer and two-stack browser histories by the cost of <code>back(steps)</code>, and say which one is the undo-redo machine.</li>
    <li>Explain how the text editor's two stacks move one character across the cursor, and why the right stack holds the text backwards.</li>
    <li>Merge k sorted post lists with a heap of cursors, and give the cost of the feed as O(f + K log f) with the reason.</li>
    <li>Say what the logger does on a refusal and what changes if a refusal extends the block, and how to keep its memory bounded.</li>
    <li>Say why the moving average and the underground system store a sum and a count, and name a case where a running sum drifts.</li>
    <li>Describe a naive twin and an invariant check for any one class in this chapter.</li>
  </ul>
</div>`,
};
