import type { Chapter } from "../types";

export const reactFileUploads: Chapter = {
  id: "react-file-uploads",
  num: "I20",
  title: "File uploads",
  short: "File uploads",
  levels: ["intermediate"],
  practice: ["ex-react-validate-files", "ex-comp-file-list-picker"],
  ready: true,
  subtitle: "A file input works without any of your code. Progress, drag and drop and large files are what you add.",
  body: `<h3>Start with the input that already works</h3>
<pre><code>&lt;input type="file" accept="image/*" multiple onChange={(e) =&gt; add(e.target.files)} /&gt;</code></pre>
<p>
  A native file input is keyboard accessible, works with screen readers, opens
  the platform's file picker (including the camera on phones), and supports
  paste on some browsers. Everything else in this chapter is a layer on top of
  it. If you build a custom drop zone and lose the input, you have made the
  feature harder for keyboard users to reach than the browser's own default.
</p>
<p>
  <code>e.target.files</code> is a <code>FileList</code>, which is not an array.
  Convert it with <code>Array.from(e.target.files)</code> before mapping, and
  reset <code>e.target.value = ""</code> afterwards if you want choosing the same
  file twice to fire <code>onChange</code> again.
</p>

<h3>What a File tells you, and what to trust</h3>
<pre><code>file.name     <span class="c">// "cv final v2.pdf"</span>
file.size     <span class="c">// bytes</span>
file.type     <span class="c">// "application/pdf" — reported by the browser, from the extension</span></code></pre>
<p>
  <code>file.type</code> and <code>file.name</code> are claims made by the client.
  Renaming <code>malware.exe</code> to <code>photo.png</code> changes both.
  Validating them in the browser is for the user's benefit &mdash; fast feedback
  before a slow upload &mdash; and the server must check again, ideally by
  looking at the file's actual leading bytes rather than its name.
</p>

<h3>Sending it</h3>
<pre><code>const body = new FormData();
body.append("file", file);

await fetch("/api/upload", { method: "POST", body });     <span class="c">// no Content-Type header</span></code></pre>
<p>
  Do not set <code>Content-Type</code> yourself. A multipart body needs a
  boundary string in the header, and the browser generates both together; set it
  by hand and the boundary is missing and the server cannot parse the request.
</p>

<h3>Progress: the case for XMLHttpRequest</h3>
<pre><code>function upload(file, onProgress, signal) {
  return new Promise((resolve, reject) =&gt; {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (e) =&gt; {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =&gt; (xhr.status &lt; 300 ? resolve(xhr.response) : reject(new Error(xhr.statusText)));
    xhr.onerror = () =&gt; reject(new Error("Network error"));
    signal?.addEventListener("abort", () =&gt; { xhr.abort(); reject(new DOMException("Aborted", "AbortError")); });

    const body = new FormData();
    body.append("file", file);
    xhr.send(body);
  });
}</code></pre>
<p>
  <code>fetch</code> has no upload progress event. The dependable way to get one
  is <code>xhr.upload</code>, which fires <code>progress</code> with
  <code>loaded</code> and <code>total</code> bytes. It feels old, but it is the
  right tool here; wrap it once in a promise, as above, and nothing else in the
  app has to know. Keep the <code>AbortController</code> signal, because a user
  who cancels a 200&nbsp;MB upload expects the bytes to stop.
</p>
<p class="sub">
  One caveat: this measures bytes handed to the network, not bytes the server has
  stored. A bar that reaches 100% then sits there while the server processes the
  file feels broken, so show a separate "processing" state after it.
</p>

<h3>Preview without uploading</h3>
<pre><code>function Preview({ file }) {
  const [url, setUrl] = useState(null);

  useEffect(() =&gt; {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () =&gt; URL.revokeObjectURL(objectUrl);     <span class="c">// or the browser keeps the file in memory</span>
  }, [file]);

  return url &amp;&amp; &lt;img src={url} alt={file.name} /&gt;;
}</code></pre>
<p>
  An object URL points at the file in memory and lives until it is revoked or the
  page closes. Forgetting the cleanup is a real leak on a page where users add
  many photos. It is also a textbook case for an effect &mdash; the object URL
  is a resource that must be released.
</p>

<h3>Drag and drop, as an enhancement</h3>
<pre><code>function DropZone({ onFiles, children }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  return (
    &lt;div
      onDragOver={(e) =&gt; { e.preventDefault(); setOver(true); }}   <span class="c">// required, or drop never fires</span>
      onDragLeave={() =&gt; setOver(false)}
      onDrop={(e) =&gt; {
        e.preventDefault();                                        <span class="c">// or the browser opens the file</span>
        setOver(false);
        onFiles(Array.from(e.dataTransfer.files));
      }}
      data-over={over}
    &gt;
      {children}
      &lt;button type="button" onClick={() =&gt; inputRef.current.click()}&gt;Choose files&lt;/button&gt;
      &lt;input ref={inputRef} type="file" multiple hidden onChange={(e) =&gt; onFiles(Array.from(e.target.files))} /&gt;
    &lt;/div&gt;
  );
}</code></pre>
<p>
  Two details cause most of the bugs. Cancelling <code>dragover</code> is what
  marks the element as a valid drop target &mdash; without
  <code>preventDefault</code> the drop event never fires, and without it in
  <code>drop</code> the browser navigates to the dropped file. And
  <code>dragleave</code> fires when the pointer moves onto a <b>child</b> element,
  so a highlight tied to it flickers; track depth with a counter, or set the
  state only from <code>dragover</code> and clear it on leave and drop.
</p>
<div class="bx is-prim">
  <span class="ttl">The button is not optional</span>
  <p>
    Drag and drop cannot be used with a keyboard, a switch device, or most
    screen readers. The zone must always contain a real button (or a label
    wrapping the input) that does the same job. Announce results in a live
    region &mdash; "3 files added, 1 rejected: too large" &mdash; because a
    sighted user sees the list change and nobody else does.
  </p>
</div>

<h3>Each file is its own little state machine</h3>
<pre><code>type UploadItem =
  | { id: string; file: File; status: "queued" }
  | { id: string; file: File; status: "uploading"; progress: number }
  | { id: string; file: File; status: "done"; url: string }
  | { id: string; file: File; status: "error"; message: string };</code></pre>
<p>
  Keep a list of these in a <a href="/react/react-usereducer">reducer</a>: one
  action per transition, so a progress event for a file that was just cancelled
  cannot resurrect it. Note that <code>progress</code> exists only on the
  uploading branch &mdash; the
  <a href="/react/react-typescript">discriminated union</a> makes reading it
  elsewhere a compile error. Limit concurrency to three or four at a time; forty
  parallel uploads saturate the connection and make every one of them slower.
</p>

<h3>Large files should skip your server</h3>
<pre><code><span class="c">// 1. ask your server for permission to upload one specific object</span>
const { url, key } = await fetch("/api/upload-url", {
  method: "POST",
  body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
}).then((r) =&gt; r.json());

<span class="c">// 2. send the bytes straight to storage</span>
await upload(file, url, onProgress);

<span class="c">// 3. tell your server it finished, so it can record it</span>
await fetch("/api/uploads/" + key + "/complete", { method: "POST" });</code></pre>
<p>
  Streaming a large file through your own server ties up a request for its whole
  duration and runs into body limits &mdash; a Server Action, for one, defaults
  to a 1&nbsp;MB request body. A <b>presigned URL</b> is the standard fix: the
  server validates the request and signs a short-lived URL for exactly one object
  in object storage, and the browser uploads to it directly. For files large
  enough that a dropped connection is likely, use a resumable protocol
  (multipart upload, or tus) that sends chunks and continues from the last one.
</p>

<h3>On the server, whatever the client did</h3>
<ul>
  <li><b>Limit size</b> at the edge, before the whole body is read.</li>
  <li><b>Check the content,</b> not the extension or the reported type.</li>
  <li><b>Generate the storage name yourself.</b> A client filename like <code>../../config</code> is a path traversal attempt, and two users will upload <code>image.png</code>.</li>
  <li><b>Serve uploads from a different origin,</b> or with <code>Content-Disposition: attachment</code>, so an uploaded HTML file cannot run script on your domain.</li>
  <li><b>Scan</b> anything other users will download.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Keep the native input and layer drag and drop on top of it, use
    <code>XMLHttpRequest</code> when I need upload progress because
    <code>fetch</code> has none, model each file as a small state machine, send
    large files straight to storage with a presigned URL, and treat the file's
    name and type as untrusted on the server."
  </p>
</div>`,
};
