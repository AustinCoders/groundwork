import { savedNarration } from "@/lib/storage";

const SPEECH_EXCLUDE = "pre, script, table, .demo, .try, .chipset, .chapter__foot, .practice-strip";
const SPEECH_SELECTOR = "h3, p, li, figcaption, .say, .warn, .sticky";

// Each chunk becomes one network request to /api/tts, so blocks are grouped
// up to this size instead of firing one request per <p>/<li> — keeps
// playback latency and request count reasonable per chapter.
const MAX_CHUNK_CHARS = 700;

interface NodeMapEntry {
  node: Text;
  start: number;
  end: number;
}

interface SpeechChunk {
  text: string;
  elements: Element[];
  map: NodeMapEntry[];
}

interface WordEvent {
  offset: number;
  duration: number;
  text: string;
}

interface ResolvedWord extends WordEvent {
  charStart: number;
  charEnd: number;
}

// Text and its text-node map are built together, with zero string
// transformation in between, so character offsets always line up exactly
// with the DOM — needed to turn a word's position back into a Range.
function elementTextAndMap(el: Element): { text: string; map: NodeMapEntry[] } {
  let text = "";
  const map: NodeMapEntry[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const value = (node as Text).nodeValue;
    if (!value) continue;
    map.push({ node: node as Text, start: text.length, end: text.length + value.length });
    text += value;
  }
  return { text, map };
}

function collectSpeechChunks(section: Element): SpeechChunk[] {
  const blocks = Array.from(section.querySelectorAll(SPEECH_SELECTOR))
    .filter((el) => !el.closest(SPEECH_EXCLUDE))
    .map((el) => ({ el, ...elementTextAndMap(el) }))
    .filter((b) => b.text.trim().length > 0);

  const chunks: SpeechChunk[] = [];
  let current: SpeechChunk | null = null;

  for (const block of blocks) {
    if (!current || current.text.length + block.text.length > MAX_CHUNK_CHARS) {
      current = { text: block.text, elements: [block.el], map: block.map.slice() };
      chunks.push(current);
    } else {
      const base = current.text.length + 1; // +1 for the joining space below
      current.map.push(...block.map.map((m) => ({ node: m.node, start: m.start + base, end: m.end + base })));
      current.text += " " + block.text;
      current.elements.push(block.el);
    }
  }
  return chunks;
}

function rangeForOffsets(map: NodeMapEntry[], start: number, end: number): Range | null {
  for (const m of map) {
    if (end <= m.start || start >= m.end) continue;
    const range = document.createRange();
    range.setStart(m.node, Math.max(0, start - m.start));
    range.setEnd(m.node, Math.min(m.node.nodeValue!.length, end - m.start));
    return range;
  }
  return null;
}

// Edge's word boundaries come back as {offset (seconds), duration, text} —
// audio-timeline positions, not character offsets. Recover character
// offsets by walking the words in order and locating each one in the exact
// text we sent, advancing a cursor so repeated words don't all match the
// first occurrence.
function resolveWordOffsets(chunkText: string, words: WordEvent[]): ResolvedWord[] {
  let cursor = 0;
  return words.map((w) => {
    const idx = chunkText.indexOf(w.text, cursor);
    const charStart = idx === -1 ? cursor : idx;
    const charEnd = charStart + w.text.length;
    cursor = charEnd;
    return { ...w, charStart, charEnd };
  });
}

export interface NarrationResult {
  url: string;
  words: WordEvent[];
}

export async function fetchNarration(
  text: string,
  voice: string,
  rate: number,
  pitch: string
): Promise<NarrationResult> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, rate, pitch }),
  });
  if (!res.ok) throw new Error(`TTS request failed (${res.status})`);
  const data = await res.json();
  const binary = atob(data.audio as string);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "audio/mpeg" });
  return { url: URL.createObjectURL(blob), words: (data.words as WordEvent[]) || [] };
}

export function setupNarration(container: HTMLElement): () => void {
  const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>(".listenbtn"));
  if (!buttons.length) return () => {};

  const canHighlight =
    typeof CSS !== "undefined" &&
    !!(CSS as unknown as { highlights?: unknown }).highlights &&
    typeof Highlight === "function";

  // ::highlight() (CSS Custom Highlight API) is injected here rather than
  // living in globals.css: Turbopack's CSS parser (Lightning CSS) doesn't
  // yet recognize this pseudo-element and would flag it as a parse warning
  // on every build, even though browsers that support the API render it
  // fine. Only added once, and only when the API is actually supported.
  if (canHighlight && !document.getElementById("narration-highlight-style")) {
    const style = document.createElement("style");
    style.id = "narration-highlight-style";
    style.textContent = "::highlight(narration) { background-color: var(--hl-yellow); }";
    document.head.appendChild(style);
  }

  const audio = new Audio();
  audio.preload = "auto";

  let current: { id: string; btn: HTMLButtonElement } | null = null;
  let chunks: SpeechChunk[] = [];
  let objectUrl: string | null = null;
  let nextPrefetch: Promise<NarrationResult> | null = null;
  let stopped = false;

  let currentWords: ResolvedWord[] = [];
  let currentMap: NodeMapEntry[] = [];
  let wordCursor = 0;

  function label(btn: HTMLButtonElement, text: string) {
    btn.textContent = text;
  }

  function clearWordHighlight() {
    if (canHighlight) (CSS as unknown as { highlights: Map<string, unknown> }).highlights.delete("narration");
  }

  function clearHighlight() {
    container.querySelectorAll(".is-narrating").forEach((el) => el.classList.remove("is-narrating"));
    clearWordHighlight();
  }

  function releaseUrl() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  function stop() {
    stopped = true;
    audio.pause();
    audio.removeAttribute("src");
    releaseUrl();
    clearHighlight();
    if (current) {
      label(current.btn, "🔊 Listen");
      current.btn.disabled = false;
    }
    current = null;
    chunks = [];
    nextPrefetch = null;
    currentWords = [];
    currentMap = [];
    wordCursor = 0;
  }

  audio.addEventListener("timeupdate", () => {
    if (!canHighlight || !currentWords.length) return;
    const t = audio.currentTime;
    while (wordCursor < currentWords.length - 1 && currentWords[wordCursor + 1].offset <= t) wordCursor++;
    const w = currentWords[wordCursor];
    if (!w || t < w.offset - 0.05) return;
    const range = rangeForOffsets(currentMap, w.charStart, w.charEnd);
    if (range)
      (CSS as unknown as { highlights: Map<string, unknown> }).highlights.set("narration", new Highlight(range));
  });

  async function playIndex(i: number) {
    if (stopped || !current) return;
    const btn = current.btn;

    if (i >= chunks.length) {
      clearHighlight();
      label(btn, "🔊 Listen");
      current = null;
      return;
    }

    const chunk = chunks[i];
    const settings = savedNarration();

    clearHighlight();
    chunk.elements.forEach((el) => el.classList.add("is-narrating"));
    chunk.elements[0]?.scrollIntoView({ behavior: "smooth", block: "center" });

    btn.disabled = true;
    try {
      const result = nextPrefetch
        ? await nextPrefetch
        : await fetchNarration(chunk.text, settings.voice, settings.rate, settings.pitch);
      if (stopped || !current) return;
      releaseUrl();
      objectUrl = result.url;
      currentWords = resolveWordOffsets(chunk.text, result.words);
      currentMap = chunk.map;
      wordCursor = 0;
      audio.src = result.url;
      nextPrefetch =
        i + 1 < chunks.length
          ? fetchNarration(chunks[i + 1].text, settings.voice, settings.rate, settings.pitch)
          : null;
      await audio.play();
    } catch (err) {
      console.error("Narration failed:", err);
      label(btn, "⚠ Unavailable");
      setTimeout(() => label(btn, "🔊 Listen"), 2200);
      stop();
      return;
    }
    if (current) current.btn.disabled = false;
  }

  audio.addEventListener("ended", () => {
    if (!current) return;
    const finishedIndex = chunks.findIndex((c) => c.elements.some((el) => el.classList.contains("is-narrating")));
    playIndex(finishedIndex + 1);
  });

  const handlers: { btn: HTMLButtonElement; fn: () => void }[] = [];

  buttons.forEach((btn) => {
    const fn = () => {
      const id = btn.dataset.listen!;

      if (current && current.id === id) {
        if (!audio.paused) {
          audio.pause();
          label(btn, "▶ Resume");
        } else if (audio.src) {
          audio.play();
          label(btn, "⏸ Pause");
        }
        return;
      }

      stop();
      stopped = false;
      const section = document.getElementById(id);
      if (!section) return;

      chunks = collectSpeechChunks(section);
      if (!chunks.length) return;

      current = { id, btn };
      label(btn, "⏸ Pause");
      playIndex(0);
    };
    btn.addEventListener("click", fn);
    handlers.push({ btn, fn });
  });

  window.addEventListener("hashchange", stop);

  return () => {
    stop();
    handlers.forEach(({ btn, fn }) => btn.removeEventListener("click", fn));
    window.removeEventListener("hashchange", stop);
  };
}
