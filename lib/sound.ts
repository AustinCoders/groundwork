import { KEYS, store } from "@/lib/storage";

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

export function isSoundEnabled(): boolean {
  return store.get<boolean>(KEYS.soundEnabled, true);
}

export function setSoundEnabled(on: boolean): void {
  store.set(KEYS.soundEnabled, on);
}

/** Two-note synthesized "ding" — no audio asset to fetch or license, just
 * a couple of short sine-wave blips through the Web Audio API. */
export function playSolvedDing(): void {
  if (!isSoundEnabled()) return;
  const audio = getContext();
  if (!audio) return;
  if (audio.state === "suspended") audio.resume();

  const notes: [number, number][] = [
    [880, 0],
    [1318.5, 0.09],
  ];
  for (const [freq, delay] of notes) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = audio.currentTime + delay;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.16, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(start);
    osc.stop(start + 0.33);
  }
}
