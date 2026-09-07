import type { Chapter } from "../types";

export const dsaLinkedLists: Chapter = {
  id: "dsa-linked-lists",
  num: "B9",
  title: "Linked lists",
  short: "Linked lists",
  levels: ["beginner"],
  practice: [
    "ex-reverse-linked-list",
    "ex-merge-two-sorted-lists",
    "ex-linked-list-has-cycle",
    "ex-linked-list-cycle-start",
    "ex-middle-of-linked-list",
    "ex-remove-nth-from-end",
    "ex-palindrome-linked-list",
    "ex-intersection-of-two-lists",
    "ex-add-two-numbers-linked-list",
    "ex-merge-k-sorted-lists",
    "ex-copy-list-with-random-pointer",
    "ex-reorder-list",
    "ex-swap-nodes-in-pairs",
    "ex-reverse-nodes-in-k-group",
    "ex-rotate-list",
    "ex-partition-list",
    "ex-remove-duplicates-sorted-list",
    "ex-delete-node-in-linked-list",
    "ex-sort-linked-list",
    "ex-flatten-multilevel-doubly-list",
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

<h3>Watch the pointers move, step by step</h3>
<p>List: <code>1 → 2 → 3 → null</code></p>
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

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt gives you a <code>ListNode</code> / "linked list" input directly</li>
  <li>"Reverse," "merge two sorted lists," "detect a cycle," "find the middle," "nth from the end"</li>
  <li>You need O(1) insert/delete and don't need random access by index</li>
  <li>Fast/slow pointers solve it if the ask involves "middle," "cycle," or "nth from the end"</li>
  <li>Need O(1) removal of an arbitrary known node, or backward traversal — reach for doubly linked</li>
  <li>A dummy node removes a special case anytime the head itself might change</li>
</ul>`,
};
