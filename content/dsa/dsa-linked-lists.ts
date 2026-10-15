import type { Chapter } from "../types";

export const dsaLinkedLists: Chapter = {
  id: "dsa-linked-lists",
  num: "B12",
  title: "Linked lists",
  short: "Linked lists",
  levels: ["beginner"],
  prerequisites: ["dsa-js-toolkit"],
  practice: [
    "ex-reverse-linked-list",
    "ex-reverse-linked-list-ii",
    "ex-merge-two-sorted-lists",
    "ex-linked-list-has-cycle",
    "ex-linked-list-cycle-start",
    "ex-find-duplicate-number",
    "ex-middle-of-linked-list",
    "ex-remove-nth-from-end",
    "ex-remove-linked-list-elements",
    "ex-delete-middle-of-linked-list",
    "ex-palindrome-linked-list",
    "ex-intersection-of-two-lists",
    "ex-add-two-numbers-linked-list",
    "ex-add-two-numbers-ii",
    "ex-merge-k-sorted-lists",
    "ex-copy-list-with-random-pointer",
    "ex-reorder-list",
    "ex-swap-nodes-in-pairs",
    "ex-reverse-nodes-in-k-group",
    "ex-rotate-list",
    "ex-partition-list",
    "ex-odd-even-linked-list",
    "ex-remove-duplicates-sorted-list",
    "ex-remove-duplicates-sorted-list-ii",
    "ex-delete-node-in-linked-list",
    "ex-sort-linked-list",
    "ex-flatten-multilevel-doubly-list",
    "ex-design-linked-list",
    "ex-lru-cache",
  ],
  ready: true,
  subtitle: "No index math, no shifting cost — the tradeoff array questions can't make.",
  body: `<h3>What you're giving up, and what you get for it</h3>
<figure>
  <svg viewBox="0 0 640 140" class="dg" role="img" aria-label="A singly linked list, each node holding a value and a pointer to the next node">
    <g class="rough">
      <rect class="box" x="20" y="40" width="90" height="50" />
      <rect class="box" x="170" y="40" width="90" height="50" />
      <rect class="box" x="320" y="40" width="90" height="50" />
      <rect class="boxr" x="470" y="40" width="90" height="50" />
    </g>
    <text class="sm" x="65" y="70" text-anchor="middle">5 | ●</text>
    <text class="sm" x="215" y="70" text-anchor="middle">3 | ●</text>
    <text class="sm" x="365" y="70" text-anchor="middle">9 | ●</text>
    <text class="sm rd" x="515" y="70" text-anchor="middle">null</text>
    <path d="M110 65 L170 65" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow)"/>
    <path d="M260 65 L320 65" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow)"/>
    <path d="M410 65 L470 65" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow)"/>
    <defs>
      <marker id="dgarrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="lbl" x="20" y="120" style="font-size:14px">head →</text>
  </svg>
  <figcaption>Each node only knows its own value and where the next one lives — no shared block of memory.</figcaption>
</figure>
<table>
  <tr><th>Operation</th><th>Array</th><th>Linked list</th></tr>
  <tr><td>Access by index</td><td>O(1)</td><td>O(n) — must walk from head</td></tr>
  <tr><td>Insert/delete at the front</td><td>O(n) — shifts everything</td><td>O(1) — just repoint</td></tr>
  <tr><td>Insert/delete at a known node</td><td>O(n)</td><td>O(1)</td></tr>
  <tr><td>Search by value</td><td>O(n)</td><td>O(n)</td></tr>
  <tr><td>Memory layout</td><td>contiguous</td><td>scattered, +overhead per node for the pointer</td></tr>
</table>

<h3>Doubly linked lists — pay more memory, get backward traversal free</h3>
<figure>
  <svg viewBox="0 0 640 150" class="dg" role="img" aria-label="A doubly linked list where each node holds pointers to both the next and previous nodes">
    <g class="rough">
      <rect class="box" x="40" y="45" width="110" height="50" />
      <rect class="box" x="230" y="45" width="110" height="50" />
      <rect class="box" x="420" y="45" width="110" height="50" />
    </g>
    <text class="sm" x="95" y="75" text-anchor="middle">prev|5|next</text>
    <text class="sm" x="285" y="75" text-anchor="middle">prev|3|next</text>
    <text class="sm" x="475" y="75" text-anchor="middle">prev|9|next</text>
    <path d="M150 60 L230 60" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow2)"/>
    <path d="M230 82 L150 82" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow2)"/>
    <path d="M340 60 L420 60" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow2)"/>
    <path d="M420 82 L340 82" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow2)"/>
    <defs>
      <marker id="dgarrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="lbl" x="40" y="130" style="font-size:14px">every node points both ways — walk forward OR backward, both O(1) per step</text>
  </svg>
  <figcaption>The classic tradeoff: extra pointer per node (more memory) buys O(1) removal of a known node without needing its predecessor tracked separately, and O(1) backward walks.</figcaption>
</figure>
<pre><code>class DoublyListNode {
  constructor(val, prev = null, next = null) {
    this.val = val;
    this.prev = prev;
    this.next = next;
  }
}

<span class="c">// removing a known node is O(1) — no need to walk to find its predecessor</span>
function removeNode(node) {
  if (node.prev) node.prev.next = node.next;
  if (node.next) node.next.prev = node.prev;
}</code></pre>
<p class="sub">
  In a <em>singly</em> linked list, deleting a known node still requires
  its predecessor (to repoint <code>.next</code>) — and finding the
  predecessor means walking from the head, O(n). A doubly linked list
  already has <code>.prev</code> sitting right there, which is exactly
  why real-world LRU caches (advanced tier) are almost always built on
  one: O(1) move-to-front and O(1) eviction of a known node.
</p>

<h3>The node and the walk</h3>
<pre><code>class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function traverse(head) {
  let node = head;
  while (node !== null) {
    console.log(node.val);
    node = node.next; <span class="c">// the ENTIRE reason lists are O(n) to access by index</span>
  }
}</code></pre>

<h3>Reversal — the pattern that trips people up live</h3>
<pre><code>function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    const next = curr.next;  <span class="c">// save before you overwrite it</span>
    curr.next = prev;        <span class="c">// flip the pointer</span>
    prev = curr;              <span class="c">// advance both</span>
    curr = next;
  }
  return prev; <span class="c">// prev is the new head</span>
}</code></pre>

<h4>Dry run: reverseList(1 → 2 → 3 → null)</h4>
<table>
  <tr><th>step</th><th>prev</th><th>curr</th><th>next (saved)</th><th>after curr.next = prev</th></tr>
  <tr><td>start</td><td>null</td><td>1</td><td>—</td><td>1 → 2 → 3 → null (unchanged)</td></tr>
  <tr><td>1</td><td>null</td><td>1</td><td>2</td><td>1 → null &nbsp;&nbsp; (2 → 3 → null, separate)</td></tr>
  <tr><td>— advance —</td><td>1</td><td>2</td><td>—</td><td>prev=1, curr=2</td></tr>
  <tr><td>2</td><td>1</td><td>2</td><td>3</td><td>2 → 1 → null &nbsp;&nbsp; (3 → null, separate)</td></tr>
  <tr><td>— advance —</td><td>2</td><td>3</td><td>—</td><td>prev=2, curr=3</td></tr>
  <tr><td>3</td><td>2</td><td>3</td><td>null</td><td>3 → 2 → 1 → null</td></tr>
  <tr><td>— advance —</td><td>3</td><td>null</td><td>—</td><td>loop ends, return prev = 3</td></tr>
</table>
<p class="sub">
  The list is genuinely broken into two disconnected pieces mid-flip at
  every step — that's expected, not a bug. It only becomes one connected
  list again at the very end, once every node's <code>.next</code> has
  been repointed backward.
</p>

<div class="warn">
  <span class="ttl">⚠ The #1 linked-list bug: losing the rest of the list</span>
  If you write <code>curr.next = prev</code> before saving
  <code>curr.next</code> into a temporary variable, you've just
  overwritten your only pointer to the rest of the list — everything after
  <code>curr</code> is now unreachable. Save <code>next</code> first,
  every time, no exceptions.
</div>

<h3>Fast/slow pointers — find the middle in one pass</h3>
<pre><code>function findMiddle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;      <span class="c">// moves 1 step</span>
    fast = fast.next.next; <span class="c">// moves 2 steps</span>
  }
  return slow; <span class="c">// when fast hits the end, slow is at the middle</span>
}</code></pre>
<p class="sub">
  This is the same fast/slow idea from the two-pointers chapter, adapted
  to a structure with no indices — you can't do
  <code>arr[Math.floor(arr.length/2)]</code> here, so the two-speed walk
  is how you find the middle without a second pass to count length first.
</p>

<h3>Cycle detection — Floyd's algorithm</h3>
<pre><code>function hasCycle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; <span class="c">// they lapped each other</span>
  }
  return false; <span class="c">// fast hit null — no cycle</span>
}</code></pre>
<p class="sub">
  If there's a cycle, the fast pointer (moving 2x speed) is guaranteed to
  eventually land on the same node as the slow pointer — think of two
  runners on a circular track at different speeds, the faster one always
  laps the slower one. If there's no cycle, fast simply reaches
  <code>null</code> first.
</p>

<h3>Finding WHERE the cycle starts — Floyd's phase two</h3>
<p>
  Detecting a cycle only answers yes/no. The harder follow-up — "return
  the node where the cycle begins" — has a genuinely elegant second phase:
  once slow and fast meet, reset one pointer to the head and advance
  <em>both</em> remaining pointers one step at a time. Where they meet
  again is the cycle's start.
</p>
<pre><code>function detectCycleStart(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let ptr = head;
      while (ptr !== slow) { <span class="c">// phase two — same speed now</span>
        ptr = ptr.next;
        slow = slow.next;
      }
      return ptr; <span class="c">// the cycle's entry node</span>
    }
  }
  return null; <span class="c">// no cycle</span>
}</code></pre>
<p class="sub">
  Why this works comes down to the math: if the distance from head to the
  cycle's start is <code>a</code>, and slow/fast meet <code>b</code> steps
  into the cycle, it can be shown that <code>a</code> equals the remaining
  distance around the cycle back to the start from the meeting point —
  which is exactly why walking both pointers at equal speed from those two
  starting points lands them on the same node. You don't need to re-derive
  this live; knowing the two-phase shape and being able to state the
  result is enough.
</p>

<h3>Floyd on an array — finding the duplicate number</h3>
<p>
  Here is the problem. An array <code>nums</code> holds <code>n + 1</code>
  integers, every one of them between <code>1</code> and <code>n</code>. By
  the pigeonhole principle at least one value repeats. Return a repeated
  value, <b>without modifying the array</b> and with O(1) extra space. Sorting
  would modify the array, a <code>Set</code> would cost O(n) space, and
  counting values into a second array costs O(n) as well. The constraint
  that rules all three out is the hint that something cleverer is going on.
</p>
<p>
  The trick is to see a linked list that was never drawn. Treat index
  <code>i</code> as a node and <code>nums[i]</code> as its
  <code>next</code> pointer. Every value is between <code>1</code> and
  <code>n</code>, so every pointer lands on a real index, and no pointer ever
  leads back to index <code>0</code> (zero is never a value). Every node has
  exactly one outgoing pointer and none of them is <code>null</code>, so a
  walk that starts at index <code>0</code> can never end. With only
  <code>n + 1</code> nodes it must eventually revisit one, which means it
  enters a cycle.
</p>
<p>
  Now ask who points at the node where the cycle begins. One pointer comes
  from inside the cycle, closing the loop. Another comes from the tail, the
  path that led in from index <code>0</code> — and that tail is never empty,
  because index <code>0</code> itself is not on the cycle (nothing points to
  it). Two different indices holding the same value is exactly a duplicate.
  So <b>the entry node of the cycle is a repeated value</b>, and finding
  it is the two-phase Floyd algorithm you already wrote, with
  <code>nums[i]</code> standing in for <code>node.next</code>.
</p>
<pre><code>function findDuplicate(nums) {
  let slow = 0;
  let fast = 0;
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast); <span class="c">// meet somewhere inside the cycle</span>

  slow = 0; <span class="c">// phase two: same speed, one from the start, one from the meeting point</span>
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow; <span class="c">// the cycle's entry is the value that two indices point at</span>
}</code></pre>
<h4>Dry run: findDuplicate([1, 3, 4, 2, 2])</h4>
<p>
  The pointers are <code>0 → 1</code>, <code>1 → 3</code>, <code>2 → 4</code>,
  <code>3 → 2</code> and <code>4 → 2</code>. Walking from index
  <code>0</code> gives <code>0, 1, 3, 2, 4, 2, 4, …</code>: a tail of
  <code>0, 1, 3</code> leading into the cycle <code>2 ⇄ 4</code>.
</p>
<table>
  <tr><th>phase</th><th>step</th><th>slow</th><th>fast</th><th>what happened</th></tr>
  <tr><td>1</td><td>1</td><td>1</td><td>3</td><td>slow moves once, fast twice</td></tr>
  <tr><td>1</td><td>2</td><td>3</td><td>4</td><td>fast is already inside the cycle</td></tr>
  <tr><td>1</td><td>3</td><td>2</td><td>4</td><td>slow reaches the cycle's entry</td></tr>
  <tr><td>1</td><td>4</td><td>4</td><td>4</td><td>they meet; <code>slow !== fast</code> is now false</td></tr>
  <tr><td>2</td><td>reset</td><td>0</td><td>4</td><td>slow goes back to index 0, fast stays at the meeting point</td></tr>
  <tr><td>2</td><td>1</td><td>1</td><td>2</td><td>both move one step</td></tr>
  <tr><td>2</td><td>2</td><td>3</td><td>4</td><td>both move one step</td></tr>
  <tr><td>2</td><td>3</td><td>2</td><td>2</td><td>they meet at the cycle's entry — return 2</td></tr>
</table>
<p class="sub">
  The answer 2 appears at indices 3 and 4, the two pointers that arrive at
  node 2. Each phase takes at most about as many steps as there are nodes,
  and the tail plus the cycle never exceed <code>n + 1</code> nodes, so the
  time is O(n) and the space is O(1).
</p>
<div class="warn">
  <span class="ttl">⚠ This only works under the problem's exact constraints</span>
  The argument needs every value to be in <code>1..n</code>. If zero were
  allowed, index <code>0</code> could sit on the cycle and the entry node would
  no longer be a duplicate; a value larger than <code>n</code> would read
  outside the array. Also note what you are promised: <i>a</i> repeated
  value, not every repeated value. With several repeated values it returns
  whichever one is the cycle's entry. The loop must be a <code>do … while</code>:
  both pointers start on the same index, so a plain <code>while (slow !== fast)</code>
  would stop before moving at all.
</div>
<p>
  There is a different route with the same space cost: binary search on the
  <em>value</em>, counting how many numbers are at most <code>mid</code>. It
  runs in O(n log n) time, so the Floyd version is the faster of the two. The
  practice list includes <code>ex-find-duplicate-number</code> for this one.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll treat index <code>i</code>
  as a node whose next pointer is <code>nums[i]</code>. Because every value is
  in range, the walk from index 0 has to enter a cycle, and the cycle's entry
  is a node with two incoming pointers — a repeated value — so I can find it
  with Floyd's two phases in O(n) time and O(1) space."
</div>

<h3>Merging two sorted lists — the dummy node in action</h3>
<pre><code>function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let tail = dummy;

  while (l1 !== null && l2 !== null) {
    if (l1.val <= l2.val) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }
  tail.next = l1 !== null ? l1 : l2; <span class="c">// attach whatever's left</span>
  return dummy.next;
}</code></pre>
<table>
  <tr><th>step</th><th>compare</th><th>tail.next =</th><th>merged so far</th></tr>
  <tr><td>1</td><td>l1=1, l2=2</td><td>1</td><td>1</td></tr>
  <tr><td>2</td><td>l1=3, l2=2</td><td>2</td><td>1 → 2</td></tr>
  <tr><td>3</td><td>l1=3, l2=4</td><td>3</td><td>1 → 2 → 3</td></tr>
  <tr><td>4</td><td>l1=null, l2=4</td><td>attach remaining l2</td><td>1 → 2 → 3 → 4</td></tr>
</table>
<p class="sub">
  This is the exact <code>merge()</code> step from merge sort (the sorting
  chapter), just applied to linked lists instead of arrays — and it's
  O(1) space here instead of O(n), because nodes are relinked in place
  rather than copied into a new array.
</p>

<h3>Merge sort on a list, and merging K sorted lists</h3>
<p>
  Merge sort is the sorting algorithm that fits a linked list, and it is easy
  to see why. Quicksort and heapsort jump around by index, which a list cannot
  do. Merge sort only needs to <em>split</em> a sequence and to
  <em>merge</em> two sorted ones, and both are sequential walks. The merge
  you already wrote relinks nodes in place, so there is no auxiliary array at
  all: the only memory the sort needs is its recursion stack.
</p>
<pre><code>function sortList(head) {
  if (head === null || head.next === null) return head;

  let slow = head;
  let fast = head.next; <span class="c">// starting fast one step ahead makes slow stop at the END of the first half</span>
  while (fast !== null &amp;&amp; fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  const second = slow.next;
  slow.next = null; <span class="c">// cut the list in two</span>

  return mergeTwoLists(sortList(head), sortList(second));
}</code></pre>
<p>
  The one decision that decides whether this works is <b>where
  <code>slow</code> stops</b>. The <code>findMiddle</code> function from
  earlier starts both pointers at <code>head</code> and returns the <em>second</em>
  middle of an even-length list. That is the wrong node here, because we
  need the last node of the first half so that <code>slow.next = null</code>
  cuts the list cleanly in two. Starting <code>fast</code> one step ahead, at
  <code>head.next</code>, shifts the stopping point one node earlier.
</p>
<div class="warn">
  <span class="ttl">⚠ The wrong middle recurses forever on two nodes</span>
  With the <code>findMiddle</code> version, a two-node list stops
  <code>slow</code> on the second node. Cutting after it leaves a first half of
  <em>both</em> nodes and a second half of none, so
  <code>sortList(head)</code> is called again on exactly the same two nodes and the
  recursion never gets smaller. Every list that reaches length two hits this.
  Always test the 2-node case first.
</div>
<h4>Dry run: sortList(4 → 2 → 1 → 3)</h4>
<table>
  <tr><th>call</th><th>list</th><th>slow stops at</th><th>split</th><th>returns</th></tr>
  <tr><td>1</td><td>4 → 2 → 1 → 3</td><td>2</td><td>4 → 2 | 1 → 3</td><td>merge of the two sorted halves</td></tr>
  <tr><td>2</td><td>4 → 2</td><td>4</td><td>4 | 2</td><td>2 → 4</td></tr>
  <tr><td>3</td><td>1 → 3</td><td>1</td><td>1 | 3</td><td>1 → 3</td></tr>
  <tr><td>—</td><td>merge(2 → 4, 1 → 3)</td><td>—</td><td>—</td><td>1 → 2 → 3 → 4</td></tr>
</table>
<p class="sub">
  <b>Complexity.</b> Every level of the recursion walks and merges each node a
  constant number of times, and halving the list gives about
  <code>log₂ n</code> levels, so the time is O(n log n). The extra space is the
  recursion stack, O(log n), because the merges relink existing nodes and
  allocate none. A bottom-up version (merge runs of 1, then 2, then 4 …)
  reaches O(1) extra space, but the recursive one is what to write first.
</p>

<h4>Merging K sorted lists</h4>
<p>
  Given <code>k</code> sorted lists with <code>N</code> nodes in total, the
  obvious plan is to merge them into one result, one list at a time. That is
  quietly expensive: the accumulated result gets longer with every merge and is
  walked again each time. With <code>k</code> equal lists, merge number
  <code>i</code> handles about <code>i</code> lists' worth of nodes, so the total
  is roughly <code>N · (k + 1) / 2</code>, which is O(N·k).
</p>
<p>
  The fix is to merge <b>in pairs, in rounds</b>: lists 0 and 1, lists 2 and 3,
  and so on, which halves the number of lists while doubling their length.
  After <code>log₂ k</code> rounds one list is left, and every round handles
  each node at most once, so the total is O(N log k).
</p>
<pre><code>function mergeKLists(lists) {
  if (lists.length === 0) return null;
  let round = lists;
  while (round.length &gt; 1) {
    const next = [];
    for (let i = 0; i &lt; round.length; i += 2) {
      next.push(i + 1 &lt; round.length ? mergeTwoLists(round[i], round[i + 1]) : round[i]);
    }
    round = next; <span class="c">// half as many lists, each twice as long</span>
  }
  return round[0];
}</code></pre>
<p>Counting how many nodes the merge calls handle, for lists of 100 nodes each:</p>
<table>
  <tr><th>k (lists)</th><th>N (nodes)</th><th>one at a time</th><th>in pairs</th></tr>
  <tr><td>4</td><td>400</td><td>1,000</td><td>800</td></tr>
  <tr><td>8</td><td>800</td><td>3,600</td><td>2,400</td></tr>
  <tr><td>16</td><td>1,600</td><td>13,600</td><td>6,400</td></tr>
  <tr><td>32</td><td>3,200</td><td>52,800</td><td>16,000</td></tr>
</table>
<p class="sub">
  The pairwise column is exactly <code>N · log₂ k</code> (3,200 × 5 =
  16,000), and the one-at-a-time column grows with <code>k</code> itself. A
  min-heap that always holds the current front node of each list gets the same
  O(N log k) and is the usual alternative; it is written out in the heaps
  chapter. Empty entries in <code>lists</code> need no special code, because
  <code>mergeTwoLists</code> already handles a <code>null</code> input, and an
  empty <code>lists</code> array returns <code>null</code> from the first line.
</p>

<h3>Nth from the end — the gap technique</h3>
<p>
  Without knowing the length up front, you can't index from the end
  directly. The fix: advance one pointer <code>n</code> steps first to
  create a fixed gap, then move both pointers together — when the lead
  pointer hits the end, the trailing pointer is exactly <code>n</code>
  from the end.
</p>
<pre><code>function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let fast = dummy, slow = dummy;

  for (let i = 0; i < n; i++) fast = fast.next; <span class="c">// open the gap</span>

  while (fast.next !== null) { <span class="c">// walk both, gap stays fixed</span>
    fast = fast.next;
    slow = slow.next;
  }

  slow.next = slow.next.next; <span class="c">// slow is right before the target</span>
  return dummy.next;
}</code></pre>
<p class="sub">
  The dummy node earns its keep again here — without it, removing the
  actual head (when <code>n</code> equals the list's length) would need
  its own special case.
</p>

<h3>Two lists that meet — intersection, and adding two numbers</h3>
<h4>Intersection of two lists</h4>
<p>
  Two singly linked lists may <em>merge</em>: from some node onward they are
  the very same nodes, not copies, and the tail is shared. Return that first
  shared node, or <code>null</code> if there is none. The nested-loop answer
  checks every pair and costs O(m·n). Putting one list's nodes into a
  <code>Set</code> and scanning the other costs O(m) space. The constant-space
  answer needs one idea: <b>make both pointers walk the same total distance</b>.
</p>
<p>
  Say list A has <code>x</code> nodes of its own followed by <code>c</code>
  shared ones, and list B has <code>y</code> of its own followed by the same
  <code>c</code>. Walk a pointer down A and, when it falls off the end, send it
  to the head of B. Walk another down B and then onto A. The first pointer
  covers <code>x + c</code> nodes, then <code>y</code> of B's own, and arrives at the
  shared part after the same number of steps as the second pointer, which
  covers <code>y + c</code> and then <code>x</code>. The unequal prefixes have been
  swapped, so the difference in length cancels out and both pointers land on the
  first shared node together.
</p>
<pre><code>function getIntersectionNode(headA, headB) {
  let a = headA;
  let b = headB;
  while (a !== b) {
    a = a === null ? headB : a.next;
    b = b === null ? headA : b.next;
  }
  return a; <span class="c">// the shared node, or null when the lists never meet</span>
}</code></pre>
<h4>Dry run: A = 4 → 1 → 8 → 4 → 5 and B = 5 → 6 → 1 → 8 → 4 → 5</h4>
<p>
  The lists share their last three nodes, <code>8 → 4 → 5</code>. Call A's own
  nodes <code>a1, a2</code> (values 4, 1), B's own nodes <code>b1, b2, b3</code>
  (values 5, 6, 1), and the shared ones <code>s1, s2, s3</code>.
</p>
<table>
  <tr><th>step</th><th>a is on</th><th>b is on</th></tr>
  <tr><td>0</td><td>a1</td><td>b1</td></tr>
  <tr><td>1</td><td>a2</td><td>b2</td></tr>
  <tr><td>2</td><td>s1</td><td>b3</td></tr>
  <tr><td>3</td><td>s2</td><td>s1</td></tr>
  <tr><td>4</td><td>s3</td><td>s2</td></tr>
  <tr><td>5</td><td>null</td><td>s3</td></tr>
  <tr><td>6</td><td>b1 (switched)</td><td>null</td></tr>
  <tr><td>7</td><td>b2</td><td>a1 (switched)</td></tr>
  <tr><td>8</td><td>b3</td><td>a2</td></tr>
  <tr><td>9</td><td>s1</td><td>s1</td></tr>
</table>
<p class="sub">
  Look at step 8: <code>b3</code> and <code>a2</code> both hold the value
  <code>1</code>, but they are different nodes, so the pointers keep walking.
  That is why the comparison is <code>a !== b</code> on the nodes and never on
  <code>.val</code>. If the lists share nothing, both pointers fall off the end
  of their second list on the same step, <code>a === b === null</code>, and the
  loop exits returning <code>null</code> without a special case. Each pointer
  walks at most <code>m + n + 1</code> steps, so the time is O(m + n) and the
  space is O(1). Both lists must be free of cycles, or the loop never ends.
</p>

<h4>Adding two numbers stored as lists</h4>
<p>
  Each list holds one number, one digit per node, with the <b>ones digit
  first</b>: <code>2 → 4 → 3</code> is 342. That order is a gift, because the
  head is exactly the digit that column addition starts with. Walk both lists
  together, add the two digits and the carry, write <code>sum % 10</code> into a
  new node and carry <code>Math.floor(sum / 10)</code> to the next column. A dummy
  node and a <code>tail</code> pointer build the result front to back.
</p>
<pre><code>function addTwoNumbers(l1, l2) {
  const dummy = new ListNode(0);
  let tail = dummy;
  let carry = 0;
  while (l1 !== null || l2 !== null || carry !== 0) {
    const sum = (l1 !== null ? l1.val : 0) + (l2 !== null ? l2.val : 0) + carry;
    tail.next = new ListNode(sum % 10);
    carry = Math.floor(sum / 10);
    tail = tail.next;
    l1 = l1 !== null ? l1.next : null;
    l2 = l2 !== null ? l2.next : null;
  }
  return dummy.next;
}</code></pre>
<table>
  <tr><th>column</th><th>l1 digit</th><th>l2 digit</th><th>carry in</th><th>sum</th><th>node written</th><th>carry out</th></tr>
  <tr><td>1</td><td>2</td><td>5</td><td>0</td><td>7</td><td>7</td><td>0</td></tr>
  <tr><td>2</td><td>4</td><td>6</td><td>0</td><td>10</td><td>0</td><td>1</td></tr>
  <tr><td>3</td><td>3</td><td>4</td><td>1</td><td>8</td><td>8</td><td>0</td></tr>
</table>
<p class="sub">
  342 + 465 gives <code>7 → 0 → 8</code>, which is 807. The loop condition has
  three parts for a reason: the lists have different lengths, and a final
  carry still needs its own node. Adding <code>9 → 9</code> and <code>1</code>
  gives <code>0 → 0 → 1</code>, the 1 coming from the carry alone. The time is
  O(max(m, n)), and the only memory beyond the answer itself is a few variables.
</p>
<div class="warn">
  <span class="ttl">⚠ Do not turn the lists into numbers</span>
  It is tempting to read both lists into integers, add, and rebuild a list.
  But the lists may be hundreds of digits long, and a JavaScript number is only
  exact up to <code>Number.MAX_SAFE_INTEGER</code>, which is 9007199254740991 —
  sixteen digits. Digit-by-digit addition has no such limit. If the digits come
  <em>most significant first</em> instead, reverse both lists (or push the
  digits on two stacks), add as above, and reverse the answer.
</div>

<h3>The dummy-node trick — kills a whole class of edge-case bugs</h3>
<pre><code><span class="c">// remove all nodes with a given value</span>
function removeElements(head, val) {
  const dummy = new ListNode(0, head); <span class="c">// fake node before the real head</span>
  let curr = dummy;
  while (curr.next !== null) {
    if (curr.next.val === val) curr.next = curr.next.next;
    else curr = curr.next;
  }
  return dummy.next; <span class="c">// the real (possibly new) head</span>
}</code></pre>
<p class="sub">
  Without the dummy node, deleting the actual head requires special-case
  code (there's no "previous" node to repoint). With a dummy node in
  front, the head is never special — it's just <code>dummy.next</code>
  like any other node's neighbor. Reach for this trick anytime the head
  itself might need to change.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll use a dummy node before
  the head so removing or inserting at the front doesn't need special-case
  code — it's just another node's <code>.next</code> update, same as
  anywhere else in the list."
</div>

<h3>Reversing part of a list — a sublist, pairs and groups of k</h3>
<p>
  <code>reverseList</code> reverses everything. Two common variants reverse
  only <em>part</em> of a list, and both are built from the same pointer dance:
  reverse positions <code>left</code> to <code>right</code>, and reverse every
  consecutive group of <code>k</code> nodes. Both need a dummy node, because the
  first node of the list can be the one that moves.
</p>
<h4>A sublist, by head insertion</h4>
<p>
  One way is to cut the segment out, call <code>reverseList</code> on it and sew
  the three pieces back together, which means juggling four pointers. A cleaner
  way is to reverse in place by <b>head insertion</b>. Let <code>before</code> be
  the node just ahead of position <code>left</code>, and <code>start</code> the
  node at position <code>left</code>. Repeatedly take the node right after
  <code>start</code> and move it to the front of the segment, right after
  <code>before</code>. Each move grows the reversed prefix by one node, and
  <code>start</code> slowly drifts to the back without ever being touched. After
  <code>right − left</code> moves the segment is reversed, and
  <code>start.next</code> already points at the first node after the segment,
  so nothing needs reconnecting.
</p>
<pre><code>function reverseBetween(head, left, right) {
  const dummy = new ListNode(0, head);
  let before = dummy;
  for (let i = 1; i &lt; left; i++) before = before.next; <span class="c">// node just before position left</span>

  const start = before.next; <span class="c">// first node of the segment; it ends up as the segment's tail</span>
  for (let i = 0; i &lt; right - left; i++) {
    const moving = start.next; <span class="c">// the node to pull to the front of the segment</span>
    start.next = moving.next; <span class="c">// unhook it</span>
    moving.next = before.next; <span class="c">// hang it in front of the current segment head</span>
    before.next = moving; <span class="c">// and make it the new segment head</span>
  }
  return dummy.next;
}</code></pre>
<h4>Dry run: reverseBetween(1 → 2 → 3 → 4 → 5, left = 2, right = 4)</h4>
<table>
  <tr><th>move</th><th>before</th><th>start</th><th>moving</th><th>list after the move</th></tr>
  <tr><td>setup</td><td>1</td><td>2</td><td>—</td><td>1 → 2 → 3 → 4 → 5</td></tr>
  <tr><td>1</td><td>1</td><td>2</td><td>3</td><td>1 → 3 → 2 → 4 → 5</td></tr>
  <tr><td>2</td><td>1</td><td>2</td><td>4</td><td>1 → 4 → 3 → 2 → 5</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ The three assignments are not interchangeable</span>
  <code>moving.next = before.next</code> must read <code>before.next</code>, the
  <em>current</em> head of the segment, not <code>start</code>. Writing
  <code>moving.next = start</code> happens to work on the first move, when the
  segment head is still <code>start</code>, and silently breaks on the second.
  The loop runs <code>right − left</code> times, not <code>right − left + 1</code>,
  because the first node of the segment never moves. With
  <code>left === right</code> the loop does nothing, and the answer is correct.
</div>
<p class="sub">
  The time is O(n): up to <code>left</code> steps to find <code>before</code>,
  then <code>right − left</code> moves of a few assignments each. The space is
  O(1).
</p>

<h4>Pairs, which are groups of two</h4>
<p>
  Swapping every two adjacent nodes is the smallest case. For a pair
  <code>prev → a → b → next</code> the goal is <code>prev → b → a → next</code>.
  Order matters: first <code>a.next = b.next</code> so that <code>a</code> already
  points at the rest, then <code>b.next = a</code>, then
  <code>prev.next = b</code>. Last, <code>prev = a</code>, since
  <code>a</code> is now the tail of the swapped pair.
</p>
<pre><code>function swapPairs(head) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  while (prev.next !== null &amp;&amp; prev.next.next !== null) {
    const a = prev.next;
    const b = a.next;
    a.next = b.next; <span class="c">// a skips over b</span>
    b.next = a; <span class="c">// b points back at a</span>
    prev.next = b; <span class="c">// the previous pair's tail now leads to b</span>
    prev = a; <span class="c">// a is the tail of the swapped pair</span>
  }
  return dummy.next;
}</code></pre>
<p class="sub">
  The loop condition needs both <code>prev.next</code> and
  <code>prev.next.next</code> to exist, so an odd node left over at the end stays
  where it is. On <code>1 → 2 → 3 → 4 → 5</code>: the first pair gives
  <code>2 → 1 → 3 → 4 → 5</code>, the second gives
  <code>2 → 1 → 4 → 3 → 5</code>, and then only <code>5</code> remains, so the
  loop stops.
</p>

<h4>Reversing in groups of k</h4>
<p>
  Now generalise: reverse each consecutive block of <code>k</code> nodes, and
  leave the final block alone if it has fewer than <code>k</code> nodes. The plan
  for each block has four steps. Walk <code>k</code> nodes from
  <code>groupPrev</code> to find the block's last node, <code>kth</code>; if the
  walk falls off the list, stop. Remember <code>groupNext</code>, the node after the
  block. Reverse the block with the usual loop, but start <code>prev</code> at
  <code>groupNext</code> instead of <code>null</code>, so the block's old first node,
  once flipped, points straight at the rest of the list. Finally hang the
  reversed block off the previous one: <code>groupPrev.next = kth</code>.
</p>
<pre><code>function reverseKGroup(head, k) {
  const dummy = new ListNode(0, head);
  let groupPrev = dummy; <span class="c">// the node just before the current group</span>

  while (true) {
    let kth = groupPrev;
    for (let i = 0; i &lt; k &amp;&amp; kth !== null; i++) kth = kth.next;
    if (kth === null) break; <span class="c">// fewer than k nodes left: leave them alone</span>

    const groupNext = kth.next; <span class="c">// first node after the group</span>
    let prev = groupNext; <span class="c">// the group's first node must end up pointing here</span>
    let curr = groupPrev.next;
    while (curr !== groupNext) {
      const next = curr.next;
      curr.next = prev;
      prev = curr;
      curr = next;
    }

    const newTail = groupPrev.next; <span class="c">// the old first node is now the group's tail</span>
    groupPrev.next = kth; <span class="c">// the old kth node is now the group's head</span>
    groupPrev = newTail;
  }
  return dummy.next;
}</code></pre>
<h4>Dry run: reverseKGroup(1 → 2 → 3 → 4 → 5 → 6 → 7, k = 3)</h4>
<table>
  <tr><th>block</th><th>groupPrev</th><th>kth</th><th>groupNext</th><th>list after the block</th></tr>
  <tr><td>1</td><td>dummy</td><td>3</td><td>4</td><td>3 → 2 → 1 → 4 → 5 → 6 → 7</td></tr>
  <tr><td>2</td><td>1</td><td>6</td><td>7</td><td>3 → 2 → 1 → 6 → 5 → 4 → 7</td></tr>
  <tr><td>3</td><td>4</td><td>none</td><td>—</td><td>only the 7 is left, fewer than 3, so stop</td></tr>
</table>
<p class="sub">
  Every node is walked once while looking for <code>kth</code> and once while it
  is reversed, so the time is O(n) and the space is O(1). A recursive version
  that reverses a block and recurses on the rest is shorter to write but uses
  O(n / k) stack. The usual bugs are reversing the short final block anyway
  (check <code>kth</code> <em>before</em> reversing), and forgetting to move
  <code>groupPrev</code> to the block's old first node, which is now its tail.
</p>

<h3>Rearranging without allocating — odd-even, partition and rotate</h3>
<p>
  This family reorders the nodes of a list by relinking them: no new nodes, O(1)
  extra space. Two techniques cover almost all of it. The first is to <b>build
  two chains and join them</b>, each with its own dummy head. The second is to
  <b>turn the list into a ring and cut it somewhere else</b>.
</p>
<h4>Odd-even: group by position</h4>
<p>
  Gather the nodes at positions 1, 3, 5, … first, followed by the nodes at
  positions 2, 4, 6, …, each group keeping its order. This is about
  <em>positions</em>, never about the values stored. Keep an <code>odd</code>
  pointer and an <code>even</code> pointer, and remember <code>evenHead</code>,
  because the even chain's start is otherwise lost. Each pass lets
  <code>odd</code> skip over an even node and then lets <code>even</code> skip
  over the new odd node.
</p>
<pre><code>function oddEvenList(head) {
  if (head === null) return null;
  let odd = head;
  let even = head.next;
  const evenHead = even; <span class="c">// remember where the even chain starts</span>
  while (even !== null &amp;&amp; even.next !== null) {
    odd.next = even.next; <span class="c">// odd skips over the even node</span>
    odd = odd.next;
    even.next = odd.next; <span class="c">// even skips over the new odd node</span>
    even = even.next;
  }
  odd.next = evenHead; <span class="c">// stitch the chains together</span>
  return head;
}</code></pre>
<table>
  <tr><th>pass</th><th>odd.next becomes</th><th>even.next becomes</th><th>odd chain</th><th>even chain</th></tr>
  <tr><td>setup</td><td>—</td><td>—</td><td>1</td><td>2</td></tr>
  <tr><td>1</td><td>3</td><td>4</td><td>1 → 3</td><td>2 → 4</td></tr>
  <tr><td>2</td><td>5</td><td>null</td><td>1 → 3 → 5</td><td>2 → 4</td></tr>
  <tr><td>end</td><td colspan="2">odd.next = evenHead</td><td colspan="2">1 → 3 → 5 → 2 → 4</td></tr>
</table>
<p class="sub">
  The loop test is <code>even !== null &amp;&amp; even.next !== null</code>: the second
  half is needed because the body reads <code>even.next</code>, and the first
  keeps a one-node list (where <code>even</code> starts as <code>null</code>) from
  crashing. The time is O(n), the space O(1).
</p>

<h4>Partition around a value</h4>
<p>
  Move every node with a value below <code>x</code> in front of the others, but
  keep the original relative order within each side. Two dummy heads give you two
  chains: append each node to the <code>small</code> or the <code>large</code>
  chain as you pass it, then join them. Because you reuse the original nodes, one
  line is easy to forget and costly to forget.
</p>
<pre><code>function partition(head, x) {
  const smallHead = new ListNode(0);
  const largeHead = new ListNode(0);
  let small = smallHead;
  let large = largeHead;

  for (let node = head; node !== null; node = node.next) {
    if (node.val &lt; x) {
      small.next = node;
      small = node;
    } else {
      large.next = node;
      large = node;
    }
  }
  large.next = null; <span class="c">// the last large node may still point at a small one</span>
  small.next = largeHead.next;
  return smallHead.next;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The line that prevents a cycle: <code>large.next = null</code></span>
  The last node appended to the large chain still holds its <em>original</em>
  <code>next</code>, which can be a small node that now sits earlier in the answer.
  Run <code>partition(1 → 4 → 3 → 2 → 5 → 2, 3)</code> without that line and the
  5 still points at the final 2, whose <code>next</code> is the 4, so the
  list loops forever. With the line the result is
  <code>1 → 2 → 2 → 4 → 3 → 5</code>. The same stale-pointer mistake appears in
  any problem that reuses nodes: before you return, ask which node is the new
  last one and where its <code>next</code> points.
</div>
<p class="sub">
  Removing every node with a given value is the same shape with one chain, and it
  was written earlier in the dummy-node section.
</p>

<h4>Rotate right by k: close the ring, cut elsewhere</h4>
<p>
  Rotating <code>1 → 2 → 3 → 4 → 5</code> right by 2 gives
  <code>4 → 5 → 1 → 2 → 3</code>. Picture the list closed into a ring: rotating
  does not reorder anything, it only chooses a different place to cut. The new
  tail is the node at index <code>length − k − 1</code> and the new head is the node
  after it. So: walk once to find the length and the old tail, reduce
  <code>k</code> modulo the length, walk to the new tail, cut, and link the old tail
  to the old head.
</p>
<pre><code>function rotateRight(head, k) {
  if (head === null || head.next === null) return head;

  let length = 1;
  let tail = head;
  while (tail.next !== null) {
    tail = tail.next;
    length++;
  }

  k %= length; <span class="c">// rotating by the length changes nothing</span>
  if (k === 0) return head;

  let newTail = head;
  for (let i = 0; i &lt; length - k - 1; i++) newTail = newTail.next;
  const newHead = newTail.next;
  newTail.next = null; <span class="c">// cut the ring here</span>
  tail.next = head; <span class="c">// close the old end back onto the old head</span>
  return newHead;
}</code></pre>
<p class="sub">
  For the example the length is 5 and <code>k = 2</code>, so the new tail is the node
  at index 2 (the 3), the new head is the 4, and the old tail 5 is linked back to
  the 1. Two details cost offers. <code>k</code> can exceed the length (rotating a
  5-node list by 7 is rotating it by 2), so take <code>k %= length</code>. And when
  that leaves <code>k === 0</code> you must return early: otherwise the "new tail"
  is the old tail, its <code>next</code> is <code>null</code>, and you return
  <code>null</code>. The time is O(n) with two walks, the space O(1).
</p>

<h3>Composing the primitives — palindrome and reorder list</h3>
<p>
  Many "hard" list problems are not new ideas. They are two or three of the
  earlier pieces glued together: <b>find the middle, reverse the second half,
  then walk both halves together</b>. Palindrome walks them comparing; reorder
  walks them weaving. Learn the three pieces and these become assembly.
</p>
<p>
  There is one catch, and it is an off-by-one that the earlier
  <code>findMiddle</code> invites. For a list like <code>1 → 2 → 2 → 1</code> that
  function returns the <em>second</em> middle, the third node. To split a list we
  want the <em>end of the first half</em>, the second node. Changing the loop
  test to <code>fast.next !== null &amp;&amp; fast.next.next !== null</code> does it:
  for an even length <code>slow</code> stops on the last node of the first half, and
  for an odd length it stops on the exact middle, which stays in the first half.
</p>
<pre><code>function endOfFirstHalf(head) {
  let slow = head;
  let fast = head;
  while (fast.next !== null &amp;&amp; fast.next.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow; <span class="c">// for an even length this is the LAST node of the first half</span>
}

function isPalindrome(head) {
  if (head === null || head.next === null) return true;

  const firstEnd = endOfFirstHalf(head);
  const secondHead = reverseList(firstEnd.next);

  let a = head;
  let b = secondHead;
  let same = true;
  while (same &amp;&amp; b !== null) {
    if (a.val !== b.val) same = false;
    a = a.next;
    b = b.next;
  }

  firstEnd.next = reverseList(secondHead); <span class="c">// put the list back the way we found it</span>
  return same;
}

function reorderList(head) {
  if (head === null || head.next === null) return;

  const firstEnd = endOfFirstHalf(head);
  let second = reverseList(firstEnd.next);
  firstEnd.next = null; <span class="c">// cut, so the first half ends cleanly</span>

  let first = head;
  while (second !== null) {
    const firstNext = first.next;
    const secondNext = second.next;
    first.next = second;
    second.next = firstNext;
    first = firstNext;
    second = secondNext;
  }
}</code></pre>
<h4>Dry run: isPalindrome(1 → 2 → 3 → 2 → 1)</h4>
<table>
  <tr><th>step</th><th>what happens</th><th>state</th></tr>
  <tr><td>1</td><td><code>endOfFirstHalf</code> stops on the 3</td><td>first half 1 → 2 → 3, second half 2 → 1</td></tr>
  <tr><td>2</td><td>reverse the second half</td><td>second half is 1 → 2</td></tr>
  <tr><td>3</td><td>compare a = 1 with b = 1</td><td>equal, advance both</td></tr>
  <tr><td>4</td><td>compare a = 2 with b = 2</td><td>equal, advance both</td></tr>
  <tr><td>5</td><td>b is <code>null</code>, stop</td><td>the middle 3 was never compared, which is correct</td></tr>
  <tr><td>6</td><td>reverse the second half again and relink it</td><td>list is 1 → 2 → 3 → 2 → 1 once more, answer true</td></tr>
</table>
<p class="sub">
  The loop runs on <code>b</code> because the reversed second half is never longer
  than the first. The last line puts the list back the way it arrived. Interviewers
  often ask whether you mutated the input, and a function that quietly leaves a list
  half-reversed is a bug in anything that calls it afterwards. The cost is three
  linear passes plus one more to restore: O(n) time and O(1) space, against the O(n)
  space of copying the values into an array.
</p>
<h4>Reorder list: L0 → Ln → L1 → Ln-1 → …</h4>
<p>
  Rearrange <code>1 → 2 → 3 → 4 → 5</code> into <code>1 → 5 → 2 → 4 → 3</code>:
  first node, last node, second node, second-to-last, and so on. The picture is a
  zipper. Cut the list after <code>endOfFirstHalf</code>, reverse the second half,
  and interleave the two halves one node at a time.
</p>
<table>
  <tr><th>pass</th><th>first</th><th>second</th><th>wiring</th><th>list so far</th></tr>
  <tr><td>setup</td><td>1</td><td>5</td><td>first half 1 → 2 → 3, second half reversed 5 → 4</td><td>—</td></tr>
  <tr><td>1</td><td>1</td><td>5</td><td>1.next = 5, 5.next = 2</td><td>1 → 5 → 2 → 3</td></tr>
  <tr><td>2</td><td>2</td><td>4</td><td>2.next = 4, 4.next = 3</td><td>1 → 5 → 2 → 4 → 3</td></tr>
  <tr><td>end</td><td>3</td><td>null</td><td>the loop stops when second runs out</td><td>1 → 5 → 2 → 4 → 3</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Cut the first half, or the zipper closes into a ring</span>
  The line <code>firstEnd.next = null</code> matters. Without it the node 3 keeps
  pointing at the 4, and after the interleave the 4 points back at the 3, so
  <code>3 → 4 → 3 → …</code> goes round forever. When you reverse a half in
  place, the node that used to link into it still points at its old position until
  you cut it.
</div>

<h3>Copying a list that has random pointers</h3>
<p>
  Each node now has two pointers: <code>next</code>, and <code>random</code>, which
  may point at <em>any</em> node in the list, or at <code>null</code>. Build a
  <b>deep copy</b>: a completely new set of nodes, with the same values and with
  <code>next</code> and <code>random</code> pointing at the corresponding new nodes. No
  node of the copy may point into the original.
</p>
<pre><code>class Node {
  constructor(val, next = null, random = null) {
    this.val = val;
    this.next = next;
    this.random = random;
  }
}</code></pre>
<p>
  What makes this harder than copying a plain list is a chicken-and-egg problem.
  When you create the copy of node 3 and want its <code>random</code> to point at the
  copy of node 7, that copy does not exist yet. The tempting shortcut,
  <code>new Node(node.random.val)</code>, creates a stray node that merely holds an
  equal value; the copy's shape is wrong, and two original nodes that shared a random
  target would now point at two different new nodes.
</p>
<h4>Approach one: a map from original to copy</h4>
<p>
  Split the work in two passes. The first pass creates every copy and records the
  correspondence in a <code>Map</code> keyed by the <em>original node objects</em>.
  The second pass wires <code>next</code> and <code>random</code> by looking up the
  copy of whichever node the original pointed at. By then every copy exists, so
  there is nothing left to wait for.
</p>
<pre><code>function copyRandomList(head) {
  if (head === null) return null;

  const copyOf = new Map(); <span class="c">// original node -&gt; its copy</span>
  for (let node = head; node !== null; node = node.next) {
    copyOf.set(node, new Node(node.val));
  }
  for (let node = head; node !== null; node = node.next) {
    const copy = copyOf.get(node);
    copy.next = node.next === null ? null : copyOf.get(node.next);
    copy.random = node.random === null ? null : copyOf.get(node.random);
  }
  return copyOf.get(head);
}</code></pre>
<h4>Approach two: weave the copies into the list</h4>
<p>
  The map only answers one question: "where is the copy of this node?". If each copy
  sits <b>immediately after its original</b> in the same list, the answer needs no
  map: the copy of <code>x</code> is <code>x.next</code>. That gives three passes, with
  O(1) extra space beyond the new nodes themselves:
</p>
<ol>
  <li>Insert a copy after every original: <code>A → B → C</code> becomes <code>A → A′ → B → B′ → C → C′</code>.</li>
  <li>Set <code>copy.random = original.random.next</code>, the copy of the original's random target (or <code>null</code>).</li>
  <li>Unweave: give each original back its own <code>next</code>, and chain the copies together.</li>
</ol>
<pre><code>function copyRandomListInPlace(head) {
  if (head === null) return null;

  for (let node = head; node !== null; node = node.next.next) {
    node.next = new Node(node.val, node.next); <span class="c">// the copy sits right after its original</span>
  }
  for (let node = head; node !== null; node = node.next.next) {
    node.next.random = node.random === null ? null : node.random.next; <span class="c">// random's copy is random's neighbour</span>
  }

  const copyHead = head.next;
  for (let node = head; node !== null; node = node.next) {
    const copy = node.next;
    node.next = copy.next; <span class="c">// the original skips its copy</span>
    copy.next = copy.next === null ? null : copy.next.next; <span class="c">// the copy skips the next original</span>
  }
  return copyHead;
}</code></pre>
<table>
  <tr><th>stage</th><th>nodes (values 7, 13, 11; the random of 13 and of 11 is the node 7)</th></tr>
  <tr><td>input</td><td>7 → 13 → 11</td></tr>
  <tr><td>after pass 1</td><td>7 → 7′ → 13 → 13′ → 11 → 11′</td></tr>
  <tr><td>after pass 2</td><td>7′.random = null, 13′.random = 7.next = 7′, 11′.random = 7′</td></tr>
  <tr><td>after pass 3</td><td>original 7 → 13 → 11 untouched; copy 7′ → 13′ → 11′ with its own randoms</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Order of the passes, and cleaning up after yourself</span>
  Pass 2 relies on the copy sitting next to its original, so it must finish before
  pass 3 breaks that adjacency. Pass 3 must <em>restore</em> the original list:
  <code>node.next = copy.next</code> gives each original its old successor back. A
  copy that leaves the input half-woven is wrong even if the returned list looks
  right. The last copy's <code>next</code> must also become <code>null</code>, which
  the guard in the code handles.
</div>
<p>
  <b>Complexity.</b> Both versions are O(n) time. The map version needs O(n) extra
  space for the map, the weave version O(1). To check the claim about time, count how
  often the code reads a <code>next</code> pointer, using a node class whose
  <code>next</code> is a getter that increments a counter. The counts for lists of
  increasing size:
</p>
<table>
  <tr><th>n</th><th>map version</th><th>weave version</th></tr>
  <tr><td>1,000</td><td>3,999</td><td>12,999</td></tr>
  <tr><td>2,000</td><td>7,999</td><td>25,999</td></tr>
  <tr><td>4,000</td><td>15,999</td><td>51,999</td></tr>
</table>
<p class="sub">
  Doubling n doubles both counts: linear in each case, with the weave version
  doing about three times as many pointer reads in exchange for not needing a map.
  Keep both in your head. The map is easy to write correctly under pressure; the
  weave is the follow-up for "can you do it in constant space?".
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll copy in two passes with a map
  from original node to copy, so the second pass can always find the copy it needs.
  If I must avoid the map, I can weave each copy right after its original, so the
  list itself becomes the lookup table, then split the two lists apart."
</div>

<h3>LRU cache — a hash map plus a doubly linked list with sentinels</h3>
<p>
  Design a cache of fixed <code>capacity</code> with two operations,
  <code>get(key)</code> and <code>put(key, value)</code>, both in O(1). When a
  <code>put</code> would exceed the capacity, evict the <b>least recently used</b>
  key. A successful <code>get</code> and every <code>put</code> count as a use.
</p>
<p>
  Each requirement kills one simple structure. A hash map finds a key in O(1) but
  knows nothing about recency. A list ordered by recency knows what to evict but needs
  O(n) to find a key. The combination works: <b>a Map from key to list node, and a
  doubly linked list ordered by recency</b>. The map locates a node in O(1); the list
  moves it to the front, or removes the last one, in O(1).
</p>
<p>
  The list must be doubly linked. To move a node you first <em>unlink</em> it from
  the middle, which needs its predecessor, and a singly linked list can only find
  that by walking from the head, the O(n) cost the earlier doubly linked section
  warned about. With <code>prev</code> stored in the node, unlinking is two
  assignments.
</p>
<p>
  <b>Sentinel nodes</b> remove the edge cases. Put two fixed dummy nodes in the
  list, a <code>head</code> and a <code>tail</code>, which are never removed and never
  hold data. Every real node then has a real node (or a sentinel) on both sides, so
  <code>unlink</code> and <code>pushFront</code> are the same few lines whether the
  list has zero, one or a hundred nodes, with no <code>if (node.prev)</code> checks.
  The most recent node is always <code>head.next</code> and the least recent is always
  <code>tail.prev</code>.
</p>
<pre><code>class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.nodes = new Map(); <span class="c">// key -&gt; node</span>
    this.head = { key: null, value: null, prev: null, next: null }; <span class="c">// sentinel: the most recent node sits after it</span>
    this.tail = { key: null, value: null, prev: null, next: null }; <span class="c">// sentinel: the least recent node sits before it</span>
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  unlink(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  pushFront(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    const node = this.nodes.get(key);
    if (node === undefined) return -1;
    this.unlink(node);
    this.pushFront(node); <span class="c">// a read counts as a use</span>
    return node.value;
  }

  put(key, value) {
    if (this.capacity === 0) return;
    const existing = this.nodes.get(key);
    if (existing !== undefined) {
      existing.value = value;
      this.unlink(existing);
      this.pushFront(existing);
      return;
    }
    if (this.nodes.size === this.capacity) {
      const oldest = this.tail.prev; <span class="c">// the least recently used node</span>
      this.unlink(oldest);
      this.nodes.delete(oldest.key); <span class="c">// this is why a node stores its key</span>
    }
    const node = { key, value, prev: null, next: null };
    this.nodes.set(key, node);
    this.pushFront(node);
  }
}</code></pre>
<p>
  Three invariants keep the structure honest: the map's keys are exactly the keys of
  the real nodes in the list; the list runs from most recent (after
  <code>head</code>) to least recent (before <code>tail</code>); and the size never
  exceeds the capacity. Every operation preserves them.
</p>
<h4>Dry run: capacity 2</h4>
<table>
  <tr><th>operation</th><th>returns</th><th>list, most recent first</th><th>note</th></tr>
  <tr><td>put(1, 10)</td><td>—</td><td>1</td><td>new key</td></tr>
  <tr><td>put(2, 20)</td><td>—</td><td>2, 1</td><td>new key goes to the front</td></tr>
  <tr><td>get(1)</td><td>10</td><td>1, 2</td><td>a read moves 1 to the front</td></tr>
  <tr><td>put(3, 30)</td><td>—</td><td>3, 1</td><td>full: evict <code>tail.prev</code>, which is 2</td></tr>
  <tr><td>get(2)</td><td>−1</td><td>3, 1</td><td>2 was evicted</td></tr>
  <tr><td>put(1, 11)</td><td>—</td><td>1, 3</td><td>existing key: update the value, move to the front</td></tr>
  <tr><td>put(4, 40)</td><td>—</td><td>4, 1</td><td>full: evict 3</td></tr>
  <tr><td>get(3)</td><td>−1</td><td>4, 1</td><td>miss; a miss changes nothing</td></tr>
  <tr><td>get(1)</td><td>11</td><td>1, 4</td><td>the updated value, now the most recent</td></tr>
  <tr><td>get(4)</td><td>40</td><td>4, 1</td><td>read moves 4 to the front</td></tr>
</table>
<p class="sub">
  <b>Complexity.</b> Every operation is a lookup in the map plus a fixed number of
  pointer assignments, so each is O(1) (the map's lookups, inserts and deletes are
  O(1) on average). The space is O(capacity): at most that many nodes and map
  entries exist at once.
</p>
<div class="warn">
  <span class="ttl">⚠ The bugs that sink an LRU answer</span>
  <ul>
    <li>Evicting the node from the list but not deleting its key from the map, so a later <code>get</code> finds a detached node. This is why each node stores its own <code>key</code>.</li>
    <li>Forgetting that updating an existing key is also a use: it must move the node to the front, not just change its value.</li>
    <li>Writing <code>pushFront</code> with the assignments in the wrong order. Read <code>head.next</code> into the new node's <code>next</code> <em>before</em> overwriting it.</li>
    <li>Capacity 0: <code>tail.prev</code> is then the <code>head</code> sentinel, and "evicting" it would unlink a sentinel. The guard in <code>put</code> handles it.</li>
  </ul>
</div>
<p class="sub">
  A JavaScript <code>Map</code> remembers insertion order, so deleting a key and
  setting it again moves it to the back, and the first key is the oldest. That makes
  a short LRU possible with a <code>Map</code> alone, and it is exactly the reference
  used in the next section. In an interview that asks for the data structure, though,
  the list-plus-map version is the answer being looked for. The design-problems
  chapter has a practice exercise, <code>ex-lru-cache</code>, for this one.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "A hash map gives O(1) lookup, and a
  doubly linked list gives O(1) removal and reordering, so I keep both: the map from
  key to node, and the list in recency order with sentinels at both ends so there are
  no null checks. <code>get</code> and <code>put</code> each unlink a node and push it to
  the front, and eviction removes <code>tail.prev</code> and deletes its key from the
  map."
</div>

<h3>Checking pointer code against a simple reference</h3>
<p>
  Pointer code fails quietly. It passes the example in the problem and then breaks on
  a shape nobody thought of: a self-pointing random, an empty list, a repeated key. The
  best defence is to write a <b>slow, obviously correct reference</b> next to the real
  solution and compare them on many small random inputs. Two kinds of check are worth
  knowing.
</p>
<h4>A structural check: is it really a deep copy?</h4>
<p>
  For the copy-with-random problem, comparing values is not enough, because value-equal
  nodes that point at the wrong places look identical in a printout. Instead reduce each
  list to its <em>shape</em>: for each node, its value and the <em>index</em> of its random
  target. Two lists with equal shapes are wired the same way. Then separately check that
  the copy shares no node with the original.
</p>
<pre><code>function serializeShape(head) {
  const index = new Map(); <span class="c">// node -&gt; its position in the list</span>
  const nodes = [];
  for (let node = head; node !== null; node = node.next) {
    index.set(node, nodes.length);
    nodes.push(node);
  }
  return nodes.map((node) =&gt; [node.val, node.random === null ? null : index.get(node.random)]);
}

function isDeepCopy(original, copy) {
  const originals = new Set();
  for (let node = original; node !== null; node = node.next) originals.add(node);
  for (let node = copy; node !== null; node = node.next) {
    if (originals.has(node)) return false; <span class="c">// the copy borrowed one of the original's nodes</span>
  }
  return JSON.stringify(serializeShape(original)) === JSON.stringify(serializeShape(copy));
}</code></pre>
<p class="sub">
  Both helpers run in O(n) time with a <code>Map</code> or <code>Set</code>, so they can
  be applied to every random list you generate. Serialize the original <em>before</em> the
  copy and again <em>after</em>: if the two serializations differ, the copy damaged its
  input, which is exactly the bug the weave version risks.
</p>
<h4>A behavioural check: the list against a Map</h4>
<p>
  For the LRU cache the reference is the <code>Map</code>-only version, where the order
  of the keys <em>is</em> the recency order. Replay the same random sequence of
  operations on both, and after every step compare the return value and the full
  recency order, read by walking the real list from <code>head.next</code> to
  <code>tail</code>.
</p>
<pre><code>class ReferenceLRU {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); <span class="c">// insertion order = recency order, oldest first</span>
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.capacity === 0) return;
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size &gt; this.capacity) this.map.delete(this.map.keys().next().value);
  }
}

function checkAgainstReference(capacity, steps) {
  const cache = new LRUCache(capacity);
  const reference = new ReferenceLRU(capacity);
  for (const [op, key, value] of steps) {
    if (op === "put") {
      cache.put(key, value);
      reference.put(key, value);
    } else if (cache.get(key) !== reference.get(key)) {
      return false;
    }
    const order = [];
    for (let node = cache.head.next; node !== cache.tail; node = node.next) order.push(node.key);
    if (order.join() !== [...reference.map.keys()].reverse().join()) return false;
  }
  return true;
}</code></pre>
<p>
  Feed it sequences such as the following, with a small key range so that hits,
  misses, updates and evictions all occur:
</p>
<pre><code>function randomSteps(count) {
  const steps = [];
  for (let i = 0; i &lt; count; i++) {
    const key = Math.floor(Math.random() * 6);
    steps.push(Math.random() &lt; 0.5 ? ["put", key, i] : ["get", key]);
  }
  return steps;
}</code></pre>
<p class="sub">
  A bug in an unlink or in an eviction shows up within a few steps as a mismatch in
  order, long before it could show up as a wrong answer. A runaway pointer bug in a
  test is a hung tab, so when you print a list under test, stop after a limit, for
  example <code>for (let n = head, i = 0; n !== null &amp;&amp; i &lt; 100; n = n.next, i++)</code>.
  Whatever the structure, the habit is the same: a slow reference, many tiny random
  inputs, and a comparison after <em>every</em> operation instead of once at the end.
</p>

<h3>The pointer-surgery checklist</h3>
<p>
  Almost every list bug in an interview comes from one of the lines below. Run them
  as a checklist over any list code before you say it is done.
</p>
<table>
  <tr><th>Check</th><th>The failure it prevents</th></tr>
  <tr><td>Did I save <code>next</code> before overwriting it?</td><td>the rest of the list becomes unreachable</td></tr>
  <tr><td>Can the head change? Is there a dummy node?</td><td>a special case for the first node, and a wrong return value</td></tr>
  <tr><td>Where does the new last node's <code>next</code> point?</td><td>a stale pointer, which makes a cycle (partition, reorder)</td></tr>
  <tr><td>Is the loop test ordered <code>x !== null &amp;&amp; x.next !== null</code>?</td><td>a <code>TypeError</code> reading <code>.next</code> of <code>null</code></td></tr>
  <tr><td>Am I comparing nodes or values?</td><td>wrong answers on lists with repeated values (intersection, cycle)</td></tr>
  <tr><td>Is the loop count <code>right − left</code> or <code>+ 1</code>? Is <code>k</code> reduced modulo the length?</td><td>off-by-one on the segment, a wrong rotation</td></tr>
  <tr><td>Did I promise to leave the input unchanged?</td><td>a half-reversed or half-woven list for the next caller</td></tr>
  <tr><td>Did I try 0, 1 and 2 nodes?</td><td>the three lengths where most of these functions break</td></tr>
</table>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt gives you a <code>ListNode</code> / "linked list" input directly</li>
  <li>"Reverse," "merge two sorted lists," "detect a cycle," "find the middle," "nth from the end"</li>
  <li>You need O(1) insert/delete and don't need random access by index</li>
  <li>Fast/slow pointers solve it if the ask involves "middle," "cycle," or "nth from the end"</li>
  <li>Need O(1) removal of an arbitrary known node, or backward traversal — reach for doubly linked</li>
  <li>A dummy node removes a special case anytime the head itself might change</li>
</ul>

<h3>Recognising the harder list problems</h3>
<p>
  The basic signals above get you to "this is a list problem". These phrases tell you
  <em>which</em> of the longer techniques it is.
</p>
<table>
  <tr><th>The prompt says…</th><th>Reach for</th></tr>
  <tr><td>"reverse between positions", "reverse in groups of k", "swap in pairs"</td><td>dummy node, then head insertion or a bounded reverse loop</td></tr>
  <tr><td>"palindrome", "reorder the list from both ends"</td><td>middle, reverse the second half, then walk both halves</td></tr>
  <tr><td>"first node where two lists meet"</td><td>switch heads at <code>null</code>, compare nodes</td></tr>
  <tr><td>"add two numbers" stored one digit per node</td><td>walk both with a carry; keep the loop going while there is a carry</td></tr>
  <tr><td>"odd and even positions", "split by a value", "rotate"</td><td>two dummy chains, or close the ring and cut</td></tr>
  <tr><td>"deep copy" with an extra pointer</td><td>original-to-copy map, or weave the copies in</td></tr>
  <tr><td>"sort a list", "merge k lists"</td><td>split with a one-step-ahead fast pointer and merge; merge in pairs or use a heap</td></tr>
  <tr><td>"find the duplicate" in an array of valid indices, nothing to modify</td><td>the array is a list: Floyd's two phases</td></tr>
  <tr><td>"design a cache" with O(1) eviction order</td><td>hash map plus doubly linked list with sentinels</td></tr>
</table>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write <code>reverseList</code> from memory, and explain why <code>next</code> must be saved before <code>curr.next</code> is overwritten.</li>
    <li>Trace <code>reverseList</code> on a new short list by hand, tracking <code>prev</code>, <code>curr</code>, and <code>next</code> each step.</li>
    <li>Explain why the fast pointer moving 2 steps per 1 of the slow pointer guarantees a meeting inside a cycle.</li>
    <li>Explain what problem the dummy-node trick solves, with a concrete edge case (removing the actual head) it sidesteps.</li>
    <li>Given a new problem, recognize whether it needs fast/slow pointers ("middle," "cycle," "nth from the end") before writing any code.</li>
    <li>Write <code>reverseBetween</code> by head insertion and explain why <code>moving.next = before.next</code> cannot be <code>start</code>.</li>
    <li>Trace <code>reverseKGroup</code> with <code>k = 3</code> on seven nodes, and say what <code>prev = groupNext</code> buys you.</li>
    <li>Explain the line <code>large.next = null</code> in <code>partition</code> and what the list does without it.</li>
    <li>Say why palindrome and reorder need the <em>end of the first half</em>, and which middle <code>findMiddle</code> returns on an even list.</li>
    <li>Explain why switching heads at <code>null</code> makes the two intersection pointers arrive together, and why the comparison is on nodes.</li>
    <li>Copy a list with random pointers twice, once with a map and once by weaving, and say which pass must not run early.</li>
    <li>Build the LRU cache from a map and a doubly linked list with sentinels, and name the bug if the map entry is not deleted on eviction.</li>
    <li>Describe how you would test any of these against a slow reference on small random inputs.</li>
  </ul>
</div>`,
};
