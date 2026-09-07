import { savedNarration } from "@/lib/storage";

const SPEECH_EXCLUDE = "pre, script, table, .demo, .try, .chipset, .chapter__foot, .practice-strip";
const SPEECH_SELECTOR = "h3, p, li, figcaption, .say, .warn, .sticky";

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
      const base = current.text.length + 1;
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
  // GET, so the CDN can serve a chunk somebody else already had synthesised.
  const params = new URLSearchParams({ text, voice, rate: String(rate), pitch });
  const res = await fetch(`/api/tts?${params}`);
  if (!res.ok) throw new Error(`TTS request failed (${res.status})`);

  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), words: readWordTimings(res.headers.get("X-Word-Timings")) };
}

/** Tuples of [offset ms, duration ms, text], base64 in a response header. */
function readWordTimings(header: string | null): WordEvent[] {
  if (!header) return [];
  try {
    const tuples = JSON.parse(atob(header)) as [number, number, string][];
    return tuples.map(([offset, duration, word]) => ({ offset: offset / 1000, duration: duration / 1000, text: word }));
  } catch {
    // Highlighting is a nicety; audio without it beats no audio.
    return [];
  }
}

export function setupNarration(container: HTMLElement): () => void {
  const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>(".listenbtn"));
  if (!buttons.length) return () => {};

  const canHighlight =
    typeof CSS !== "undefined" &&
    !!(CSS as unknown as { highlights?: unknown }).highlights &&
    typeof Highlight === "function";

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
      // stop() clears the element with removeAttribute("src"); load() is the
      // explicit start of resource selection on whatever src replaces it.
      audio.load();
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
