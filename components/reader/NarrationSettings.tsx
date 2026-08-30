"use client";

import { useRef, useState } from "react";
import { Dropdown } from "@/components/ui/select";
import { EDGE_VOICES } from "@/lib/edge-voices";
import { savedNarration, setSavedNarration } from "@/lib/storage";
import { useMounted } from "@/lib/hooks";
import { fetchNarration } from "@/components/reader/narration";

const RATE_STEPS = [0.75, 0.85, 0.94, 1, 1.15, 1.3, 1.5];
const PITCH_STEPS = ["-20%", "-10%", "0%", "+10%", "+20%"];
const PREVIEW_TEXT = "This is how I sound when reading your notes aloud.";

export function NarrationSettings() {
  const mounted = useMounted();
  const [settings, setSettings] = useState(() => savedNarration());
  const [previewState, setPreviewState] = useState<"idle" | "loading" | "playing">("idle");
  const previewAudio = useRef<HTMLAudioElement | null>(null);
  const previewUrl = useRef<string | null>(null);

  if (!mounted) return null;

  function update(patch: Partial<typeof settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    setSavedNarration(next);
  }

  function stopPreview() {
    previewAudio.current?.pause();
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    }
    setPreviewState("idle");
  }

  async function togglePreview() {
    if (previewState !== "idle") {
      stopPreview();
      return;
    }
    setPreviewState("loading");
    try {
      const { url } = await fetchNarration(PREVIEW_TEXT, settings.voice, settings.rate, settings.pitch);
      previewUrl.current = url;
      const audio = previewAudio.current ?? new Audio();
      previewAudio.current = audio;
      audio.src = url;
      audio.onended = stopPreview;
      await audio.play();
      setPreviewState("playing");
    } catch {
      setPreviewState("idle");
    }
  }

  const rateIndex = Math.max(0, RATE_STEPS.indexOf(settings.rate));
  const pitchIndex = Math.max(0, PITCH_STEPS.indexOf(settings.pitch));

  return (
    <div className="narrationctl">
      <span className="narrationctl__label">🔊 Narrator</span>
      <div className="zoomctl" role="group" aria-label="Narrator voice and preview">
        <Dropdown
          items={EDGE_VOICES}
          value={settings.voice}
          onChange={(v) => {
            stopPreview();
            update({ voice: v });
          }}
          ariaLabel="Narrator voice"
          openUp
        />
        <button
          className="btn btn--icon"
          type="button"
          title="Preview this voice"
          aria-label="Preview narrator voice"
          disabled={previewState === "loading"}
          onClick={togglePreview}
        >
          {previewState === "playing" ? "⏹" : previewState === "loading" ? "…" : "▶"}
        </button>
      </div>
      <div className="zoomctl" role="group" aria-label="Narration speed">
        <button
          className="btn btn--icon"
          type="button"
          title="Slower"
          aria-label="Decrease narration speed"
          disabled={rateIndex === 0}
          onClick={() => update({ rate: RATE_STEPS[Math.max(0, rateIndex - 1)] })}
        >
          −
        </button>
        <span className="zoomctl__pct">{settings.rate}×</span>
        <button
          className="btn btn--icon"
          type="button"
          title="Faster"
          aria-label="Increase narration speed"
          disabled={rateIndex === RATE_STEPS.length - 1}
          onClick={() => update({ rate: RATE_STEPS[Math.min(RATE_STEPS.length - 1, rateIndex + 1)] })}
        >
          +
        </button>
      </div>
      <div className="zoomctl" role="group" aria-label="Narration pitch">
        <button
          className="btn btn--icon"
          type="button"
          title="Lower pitch"
          aria-label="Decrease narration pitch"
          disabled={pitchIndex === 0}
          onClick={() => update({ pitch: PITCH_STEPS[Math.max(0, pitchIndex - 1)] })}
        >
          −
        </button>
        <span className="zoomctl__pct">{settings.pitch} pitch</span>
        <button
          className="btn btn--icon"
          type="button"
          title="Higher pitch"
          aria-label="Increase narration pitch"
          disabled={pitchIndex === PITCH_STEPS.length - 1}
          onClick={() => update({ pitch: PITCH_STEPS[Math.min(PITCH_STEPS.length - 1, pitchIndex + 1)] })}
        >
          +
        </button>
      </div>
    </div>
  );
}
