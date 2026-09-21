import type { Chapter } from "../types";

export const regexDatesApis: Chapter = {
  id: "regex-dates-apis",
  num: "I6",
  title: "Regex & dates",
  short: "Regex & dates",
  levels: ["intermediate"],
  practice: ["ex-extract-hashtags", "ex-mask-card-number"],
  ready: true,
  subtitle: "Two toolboxes every real app ends up reaching for, and the traps that come with each.",
  body: `<h3>Regex — the essentials</h3>
<pre><code>/abc/         <span class="c">// literal — matches "abc" exactly</span>
/abc/i        <span class="c">// flag: i = case-insensitive</span>
/abc/g        <span class="c">// flag: g = find ALL matches, not just the first</span>
/(\\w+)@(\\w+)/  <span class="c">// ( ) = a capturing group — grabbed separately from the full match</span></code></pre>
<div class="try">
  <pre><code>const text = "contact: ana@example.com today";
const match = text.match(/(\\w+)@(\\w+)\\.com/);
console.log(match[0]);   <span class="c">// the whole match — what happens?</span>
console.log(match[1]);   <span class="c">// group 1 — what happens?</span>
console.log(match[2]);   <span class="c">// group 2 — what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"ana@example.com"</code>, then <code>"ana"</code>, then
  <code>"example"</code> — the full match is always index 0, and every
  parenthesized group after it fills in one more slot, in order.
</p>
<pre><code><span class="c">// Named groups — same idea, readable by name instead of position</span>
const parsed = "2024-01".match(/(?&lt;year&gt;\\d{4})-(?&lt;month&gt;\\d{2})/);
parsed.groups.year;    <span class="c">// "2024"</span>
parsed.groups.month;   <span class="c">// "01"</span>

"2024-01-15".replace(/(\\d+)-(\\d+)-(\\d+)/, "$3/$2/$1");   <span class="c">// "15/01/2024" — $1/$2/$3 refer back to the groups</span>

[..."a1 b22 c333".matchAll(/[a-z](\\d+)/g)].map((m) =&gt; m[1]);  <span class="c">// ["1", "22", "333"] — every match, not just the first</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ A /g regex remembers where it left off</span>
  <code>.test()</code> and <code>.exec()</code> on a regex literal
  with the <code>g</code> flag mutate the regex object's own
  <code>lastIndex</code> — the next call resumes searching from there,
  not from the start of the string.
</div>
<div class="try">
  <pre><code>const stateful = /\\d/g;
console.log(stateful.test("a1"));   <span class="c">// what happens?</span>
console.log(stateful.test("a1"));   <span class="c">// SAME regex, same string — what happens?</span>
console.log(stateful.test("a1"));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>true</code>, <code>false</code>, <code>true</code> — alternating,
  on the exact same input. First call finds the digit and leaves
  <code>lastIndex</code> at <code>2</code>; second call starts
  searching from index <code>2</code> in a 2-character string, finds
  nothing, and resets <code>lastIndex</code> back to <code>0</code>;
  third call starts over and finds it again. Reusing one global-flagged
  regex object across unrelated calls is exactly how this bites — a
  fresh <code>/\\d/g</code> literal each time, or dropping the
  <code>g</code> flag for a one-shot <code>.test()</code>, avoids it.
</p>

<h3>Lookahead, lookbehind, and the ReDoS trap</h3>
<pre><code>/\\d+(?=px)/.exec("width: 240px")[0];      <span class="c">// "240" — lookahead: match digits, but only if "px" follows (not consumed)</span>
/(?&lt;=\\$)\\d+/.exec("Price: $99")[0];       <span class="c">// "99" — lookbehind: only if "$" precedes, also not consumed</span></code></pre>
<p class="sub">
  Neither assertion becomes part of the match itself — that's the whole
  point of calling them <em>assertions</em> rather than groups. They let
  a pattern check context ("only if followed/preceded by X") without
  including that context in what gets extracted or replaced.
</p>
<div class="warn">
  <span class="ttl">⚠ Some patterns can take exponential time — ReDoS</span>
  A pattern with <b>nested, overlapping repetition</b> —
  <code>/(a+)+b/</code> against a long string of just <code>a</code>s
  with no trailing <code>b</code> — forces the engine to try an
  exponential number of ways to split the string among the repeated
  groups before giving up. Run against user-supplied input (a "validate
  this email" regex is the classic real-world case), this is a genuine
  denial-of-service vector — <b>Regular expression Denial of Service</b>,
  ReDoS — that has taken down real production servers with a single
  crafted string. The fix is rewriting the pattern to remove the nested
  ambiguity, or running untrusted-input matching behind a timeout.
</div>

<h3>The sticky flag — y vs g</h3>
<pre><code>const g = /\\d+/g;
const y = /\\d+/y;
const str = "12 34";

g.exec(str)[0];    <span class="c">// "12" — g can skip ahead to find the next match anywhere</span>
y.lastIndex = 0;
y.exec(str)[0];    <span class="c">// "12" — same result here...</span>
y.lastIndex = 1;
y.exec(str);       <span class="c">// what happens?</span></code></pre>
<p class="sub">
  <code>null</code> — <code>y</code> demands a match starting
  <b>exactly</b> at <code>lastIndex</code>, nowhere later in the string;
  <code>g</code> is happy to scan forward and find the next match
  wherever it is. This matters for a hand-written tokenizer or parser,
  where "match right here or fail" is the entire point — scanning ahead
  silently would mean accepting a token that isn't actually adjacent to
  where the parser currently sits.
</p>

<h3>Dates</h3>
<div class="try">
  <pre><code>const d = new Date(2024, 0, 15);   <span class="c">// year, MONTH (0-indexed!), day</span>
console.log(d.getMonth());   <span class="c">// what happens?</span>
console.log(d.getDate());    <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>0</code>, then <code>15</code> — <code>getMonth()</code> is
  January-is-<code>0</code>, a decision baked into
  <code>Date</code> since the original Java date API it was modeled on
  in 1995, and never fixed since without breaking every existing
  script.
</p>
<pre><code>const start = new Date("2024-01-15");
const end = new Date("2024-02-15");
(end - start) / 86_400_000;   <span class="c">// 31 — subtracting Dates gives milliseconds; divide to get days</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ The two constructors don't parse in the same time zone</span>
  <code>new Date(2024, 0, 15)</code> (year, month, day as separate
  numbers) builds midnight in the <b>local</b> time zone.
  <code>new Date("2024-01-15")</code> (a plain ISO date string, no time)
  is parsed as midnight <b>UTC</b>. In UTC+5:30, that ISO string's
  local clock time is <code>05:30</code>, not midnight — a different
  instant from the numeric-args version, even though both print "15
  January" if you only look at the date part. The subtraction above
  only comes out to a clean 31 because <em>both</em> operands went
  through the same UTC-parsing string form — mix a numeric-args
  <code>Date</code> with a string-parsed one and the day count can be
  off by one, depending on which side of midnight UTC the reader's
  time zone happens to sit.
</div>
<div class="warn">
  <span class="ttl">⚠ Why almost nobody hand-rolls date math</span>
  Time zones, daylight saving transitions, leap years, and leap
  seconds all make "add one day" genuinely harder than
  <code>+ 86400000</code> — a DST boundary can make that arithmetic
  land on the wrong calendar day entirely. This is the real reason
  libraries like <code>date-fns</code> exist, and why the language
  now has <code>Temporal</code>: not laziness, a correctness problem
  that's easy to get subtly wrong by hand.
</div>
<pre><code>Temporal.PlainDate.from("2024-01-31").add({ months: 1 }).toString();
<span class="c">// "2024-02-29" — calendar-aware: no milliseconds, no time zone, no DST surprise</span></code></pre>
<p class="sub">
  <code>Temporal</code> is the built-in successor to <code>Date</code>. It
  ships in Firefox (139+) and Chrome (144+); check support for the rest
  of your audience, or load a polyfill, before relying on it.
</p>
<pre><code>new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(d);
<span class="c">// "15 January 2024" — locale-correct formatting, no manual string building</span>

new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(150000);
<span class="c">// "₹1,50,000.00" — Indian digit grouping, handled for you</span></code></pre>
<p class="sub">
  <a href="/notes/browser-apis-deep">The next chapter</a> picks up
  where this one leaves off — storage, the URL bar, and the event
  system in depth.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Regex is for patterns, not for parsing nested structure, and nested quantifiers can backtrack catastrophically (ReDoS); store dates as UTC timestamps and format them for display, because arithmetic on local time breaks across daylight-saving changes."
  </p>
</div>`,
};
