import type { Chapter } from "../types";

export const typesData: Chapter = {
  id: "types-data",
  num: "A4",
  title: "Types & data",
  short: "Types & data",
  levels: ["advanced"],
  practice: ["ex-bigint-factorial", "ex-proper-length"],
  ready: true,
  subtitle: "What happens once a number, a string, or a file gets big or exotic enough to need its own type.",
  body: `<h3>BigInt — exact integers, past 2^53</h3>
<p>
  Every regular JS number is a 64-bit float, which means integers stop
  being exactly representable past
  <code>Number.MAX_SAFE_INTEGER</code> — <code>2^53 - 1</code>.
  <code>BigInt</code> is a genuinely separate type for arbitrary-size
  integers with no such ceiling, spelled with a trailing <code>n</code>.
</p>
<div class="try">
  <pre><code>console.log(Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2);   <span class="c">// what happens?</span>
console.log(9007199254740991n + 1n === 9007199254740991n + 2n);              <span class="c">// same numbers, as BigInt — what happens?</span></code></pre>
</div>
<p class="sub">
  <code>true</code>, then <code>false</code>. Past the safe integer
  limit, regular numbers genuinely can't tell
  <code>MAX_SAFE_INTEGER + 1</code> and <code>+ 2</code> apart — both
  round to the same closest representable float. The <code>n</code>
  suffix versions stay exact, because <code>BigInt</code> isn't a
  float at all.
</p>
<div class="warn">
  <span class="ttl">⚠ BigInt and Number don't mix</span>
  <code>10n + 5</code> throws <code>TypeError: Cannot mix BigInt and
  other types</code> — there's no implicit conversion between them in
  either direction. Convert explicitly, one way or the other:
  <code>10n + BigInt(5)</code> or <code>Number(10n) + 5</code>.
</div>

<h3>ArrayBuffer, TypedArrays, DataView</h3>
<p>
  An <code>ArrayBuffer</code> is a fixed-length block of raw bytes —
  nothing more, no way to read or write it directly. A
  <b>TypedArray</b> (<code>Int32Array</code>, <code>Uint8Array</code>,
  etc.) is a typed <em>view</em> onto that same memory, interpreting
  its bytes as a specific numeric type. Multiple views can share one
  buffer at once, and writing through any of them changes the
  <em>same</em> underlying bytes every other view sees.
</p>
<div class="try">
  <pre><code>const buffer = new ArrayBuffer(4);       <span class="c">// 4 raw bytes</span>
const asInt32 = new Int32Array(buffer);  <span class="c">// one view: "these 4 bytes are one 32-bit int"</span>
asInt32[0] = 42;

const dv = new DataView(buffer);          <span class="c">// a second, more manual view of the SAME bytes</span>
console.log(dv.getInt32(0));              <span class="c">// what happens?</span>
console.log(dv.getInt32(0, true));        <span class="c">// second argument: littleEndian — what happens?</span></code></pre>
</div>
<p class="sub">
  <code>704643072</code>, then <code>42</code>. Not a bug — a genuine
  byte-order mismatch. TypedArrays use the platform's native byte
  order (little-endian on essentially every real device today).
  <code>DataView.getInt32</code> defaults to <b>big-endian</b> unless
  you explicitly pass <code>true</code> for its second argument. Same
  4 bytes, same buffer, two different interpretations of what order
  they represent a number in — exactly the kind of detail that matters
  the moment you're parsing a binary file format or a network protocol
  that specifies its own byte order.
</p>

<h3>Blob, File, FileReader</h3>
<pre><code>const blob = new Blob(["hello world"], { type: "text/plain" });
blob.size;    <span class="c">// 11 — bytes, not characters (matters once text isn't plain ASCII)</span>
blob.type;    <span class="c">// "text/plain"</span>

<span class="c">// A File (from an &lt;input type="file"&gt; or a drop event) is a Blob with a name and a modified date</span>
fileInput.addEventListener("change", (e) =&gt; {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () =&gt; console.log(reader.result);   <span class="c">// the fully-read contents</span>
  reader.readAsText(file);          <span class="c">// or readAsArrayBuffer, readAsDataURL</span>
});

<span class="c">// modern alternative — same result, promise-based, no event wiring</span>
const text = await file.text();
const bytes = await file.arrayBuffer();</code></pre>
<p class="sub">
  <code>FileReader</code> predates promises; a <code>File</code>
  object itself now has <code>.text()</code>/<code>.arrayBuffer()</code>
  methods that return promises directly — same underlying read, no
  callback wiring needed in new code.
</p>

<h3>Unicode — code points vs code units</h3>
<p>
  A JS string's <code>.length</code> counts <b>UTF-16 code units</b>,
  not visible characters. Most characters fit in one 16-bit unit; a
  large chunk of emoji and some rarer scripts need <b>two</b> units — a
  <b>surrogate pair</b> — and <code>.length</code> counts both of them
  as 2.
</p>
<div class="try">
  <pre><code>const emoji = "😀";
console.log(emoji.length);            <span class="c">// what happens?</span>
console.log([...emoji].length);       <span class="c">// spreading iterates by CODE POINT, not code unit — what happens?</span>
console.log(JSON.stringify(emoji[0])); <span class="c">// indexing still grabs one code UNIT — what happens?</span></code></pre>
</div>
<p class="sub">
  <code>2</code>, then <code>1</code>, then <code>"\\ud83d"</code> — half
  of a surrogate pair, not a valid character on its own.
  <code>emoji[0]</code> silently cuts an emoji in half; spreading a
  string (or <code>for...of</code>, or <code>Array.from</code>) walks
  it by actual code point and never splits one. Slicing a string by
  raw index — a search-result excerpt, a truncated preview — risks
  exactly this cut, and it's an easy one to never notice until a
  specific emoji or script breaks in production.
</p>
<pre><code>"café".normalize("NFC").length === "café".normalize("NFC").length;
<span class="c">// true — but two strings that VISUALLY look identical can be genuinely unequal:</span>
<span class="c">// "é" can be one single code point, OR "e" + a separate combining accent mark.</span>
<span class="c">// .normalize() converts both spellings to one canonical form before comparing.</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> Comparing user-typed text for equality
  without <code>.normalize()</code> first is a real, if rare, bug — two
  strings can render pixel-identical and still fail
  <code>===</code>, if one came from a source that encodes accents
  differently.
</div>

<h3>Intl — past basic formatting</h3>
<pre><code>["café", "cafe", "cafz"].sort(new Intl.Collator("en").compare);
<span class="c">// ["cafe", "café", "cafz"] — locale-aware ordering; a plain .sort() compares raw code</span>
<span class="c">// points instead, which gets accented characters and non-Latin scripts sorted wrong</span>

new Intl.RelativeTimeFormat("en").format(-1, "day");   <span class="c">// "1 day ago"</span>
new Intl.RelativeTimeFormat("en").format(3, "hour");   <span class="c">// "in 3 hours"</span></code></pre>
<p class="sub">
  All three <code>Intl</code> constructors from this and earlier
  chapters — <code>Collator</code>, <code>DateTimeFormat</code>,
  <code>NumberFormat</code>, and <code>RelativeTimeFormat</code> — take
  the same first argument, a locale string, and are the built-in answer
  to "format this correctly for the reader's language and region"
  without hand-writing rules that differ by country.
</p>`,
};
