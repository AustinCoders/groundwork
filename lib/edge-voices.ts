// A curated set of Microsoft Edge neural voices (server-side, via the
// unofficial Read Aloud API in app/api/tts). Curated rather than the full
// OS voice list — every entry here is one we'd actually recommend. Shared
// between the API route (validates against it) and the picker UI (renders it).
export interface EdgeVoice {
  value: string;
  label: string;
}

export const EDGE_VOICES: EdgeVoice[] = [
  { value: "en-US-AriaNeural", label: "Aria — US, warm & clear" },
  { value: "en-US-GuyNeural", label: "Guy — US, confident" },
  { value: "en-US-JennyNeural", label: "Jenny — US, friendly tutor" },
  { value: "en-US-DavisNeural", label: "Davis — US, energetic" },
  { value: "en-US-EmmaNeural", label: "Emma — US, natural" },
  { value: "en-GB-RyanNeural", label: "Ryan — UK, calm" },
  { value: "en-GB-SoniaNeural", label: "Sonia — UK, crisp" },
  { value: "en-GB-LibbyNeural", label: "Libby — UK, friendly" },
  { value: "en-GB-ThomasNeural", label: "Thomas — UK, thoughtful" },
  { value: "en-AU-NatashaNeural", label: "Natasha — AU, bright" },
  { value: "en-IN-NeerjaNeural", label: "Neerja — IN, clear" },
];

export const DEFAULT_EDGE_VOICE = EDGE_VOICES[0].value;
